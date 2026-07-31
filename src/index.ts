#!/usr/bin/env node

// Magic MCP is now the 21st MCP.
//
// This package used to be a standalone stdio MCP server talking to
// magic.21st.dev. Since 0.2.0 it is a thin stdio<->HTTP proxy to the unified
// 21st MCP endpoint (https://21st.dev/api/mcp), kept alive because the old
// install command (`npx -y @21st-dev/magic@latest API_KEY="..."`) is baked
// into countless agent configs and model memories. New setups should use:
//
//   npx @21st-dev/cli@latest init --client <cursor|claude|vscode|windsurf|codex>
//
// The server keeps the legacy Magic tool names callable
// (21st_magic_component_builder, 21st_magic_component_inspiration,
// 21st_magic_component_refiner, logo_search), so old agent muscle memory
// still works through this proxy.

import { createInterface } from "node:readline";

const VERSION = "0.2.2";
const DEFAULT_ENDPOINT = "https://21st.dev/api/mcp";

// ---------------------------------------------------------------------------
// API key resolution - every format the old Magic client ever accepted, plus
// the new CLI's API_KEY_21ST. Positional `API_KEY="x"` is the form models
// memorized from the old README.
// ---------------------------------------------------------------------------
function resolveApiKey(): string | undefined {
  const patterns = [
    /^([A-Z_0-9]+)=(.+)$/, // API_KEY=value
    /^--([A-Z_0-9]+)=(.+)$/, // --API_KEY=value
    /^\/([A-Z_0-9]+):(.+)$/, // /API_KEY:value (Windows style)
    /^-([A-Z_0-9]+)=(.+)$/, // -API_KEY=value
  ];
  const argv = process.argv.slice(2);
  const fromArgs: Record<string, string> = {};
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    let matched = false;
    for (const re of patterns) {
      const m = arg.match(re);
      if (m) {
        fromArgs[m[1]] = stripQuotes(m[2]);
        matched = true;
        break;
      }
    }
    // `-API_KEY value` (separate argv entries)
    if (!matched && /^-[A-Z_0-9]+$/.test(arg) && argv[i + 1]) {
      fromArgs[arg.slice(1)] = stripQuotes(argv[++i]);
    }
  }
  return (
    fromArgs.API_KEY ??
    fromArgs.TWENTY_FIRST_API_KEY ??
    fromArgs.API_KEY_21ST ??
    process.env.TWENTY_FIRST_API_KEY ??
    process.env.API_KEY_21ST ??
    process.env.API_KEY
  );
}

function stripQuotes(v: string): string {
  const t = v.trim();
  if (
    (t.startsWith('"') && t.endsWith('"')) ||
    (t.startsWith("'") && t.endsWith("'"))
  ) {
    return t.slice(1, -1);
  }
  return t;
}

const apiKey = resolveApiKey();
const endpoint = process.env.MCP_URL_21ST || DEFAULT_ENDPOINT;

// stderr only - stdout is the JSON-RPC channel.
console.error(
  `Magic MCP is now the 21st MCP - proxying to ${endpoint} (shim v${VERSION}).`,
);
if (!apiKey) {
  console.error(
    "No API key found. Old Magic keys were reset - get a fresh key at https://21st.dev/mcp " +
      'and pass it as API_KEY="..." (or env TWENTY_FIRST_API_KEY / API_KEY_21ST).',
  );
}

// ---------------------------------------------------------------------------
// stdio <-> HTTP proxy. One POST per inbound JSON-RPC message; the endpoint
// answers plain JSON (or empty for notifications). Mcp-Session-Id from the
// initialize response is echoed on subsequent requests so capability
// negotiation (e.g. inline UI) keeps working through the proxy.
// ---------------------------------------------------------------------------
let sessionId: string | undefined;

type JsonRpcMsg = { id?: unknown; method?: unknown };

function writeOut(obj: unknown): void {
  process.stdout.write(JSON.stringify(obj) + "\n");
}

function rpcError(id: unknown, code: number, message: string) {
  return { jsonrpc: "2.0", id: id ?? null, error: { code, message } };
}

// The endpoint's own wording, so an agent reads the same sentence whether the
// refusal came from here or from the server.
const NOT_AUTHED =
  "Not authenticated - your API key is missing or was reset. Get a fresh key at https://21st.dev/mcp and update your MCP config (x-api-key / Bearer).";

// Latched once the endpoint answers 401. A key cannot become valid inside one
// process: this proxy reads it at startup from argv/env and never re-reads it.
// Without the latch the host client re-runs `initialize` after every failure
// and the proxy dutifully forwards it forever - the endpoint saw ~100k of those
// an hour after 0.2.0 shipped, from clients that could never succeed.
let authRefused = false;

async function forward(line: string): Promise<void> {
  let msg: JsonRpcMsg | JsonRpcMsg[];
  try {
    msg = JSON.parse(line);
  } catch {
    writeOut(rpcError(null, -32700, "Parse error"));
    return;
  }

  const single = !Array.isArray(msg) ? msg : undefined;
  const expectsReply = Array.isArray(msg)
    ? msg.some((m) => m && m.id !== undefined && m.id !== null)
    : single!.id !== undefined && single!.id !== null;

  // Answer locally when the outcome is already known: no key was found at all,
  // or the endpoint has already refused this one. Both are settled for the life
  // of the process, so sending the request would only cost both sides a round
  // trip to reach the same sentence.
  if (!apiKey || authRefused) {
    if (expectsReply) writeOut(rpcError(single?.id ?? null, -32001, NOT_AUTHED));
    return;
  }

  const headers: Record<string, string> = {
    "content-type": "application/json",
    accept: "application/json, text/event-stream",
    "user-agent": `21st-magic-shim/${VERSION}`,
  };
  if (apiKey) headers["x-api-key"] = apiKey;
  if (sessionId) headers["mcp-session-id"] = sessionId;

  let res: Response;
  let text: string;
  try {
    res = await fetch(endpoint, { method: "POST", headers, body: line });
    text = await res.text();
  } catch (e) {
    if (expectsReply) {
      const detail = e instanceof Error ? e.message : String(e);
      writeOut(
        rpcError(
          single?.id ?? null,
          -32000,
          `21st MCP endpoint unreachable (${endpoint}): ${detail}`,
        ),
      );
    }
    return;
  }

  if (res.status === 401) authRefused = true;

  const newSession = res.headers.get("mcp-session-id");
  if (newSession) sessionId = newSession;

  if (!expectsReply) return; // notification - nothing to write back
  if (!text.trim()) {
    writeOut(
      rpcError(single?.id ?? null, -32000, `Empty response (HTTP ${res.status})`),
    );
    return;
  }

  try {
    const parsed = JSON.parse(text);
    // Auth failures come back with id:null; restore the request id so strict
    // clients can correlate (and agents get to read the "key was reset" text).
    if (
      single &&
      parsed &&
      !Array.isArray(parsed) &&
      parsed.id == null &&
      single.id != null
    ) {
      parsed.id = single.id;
    }
    writeOut(parsed);
  } catch {
    writeOut(
      rpcError(
        single?.id ?? null,
        -32000,
        `Non-JSON response (HTTP ${res.status}): ${text.slice(0, 300)}`,
      ),
    );
  }
}

const rl = createInterface({ input: process.stdin, terminal: false });
// Sequential pump: strict request ordering, one in-flight request at a time.
// MCP clients pipeline rarely enough that this is not a bottleneck, and it
// guarantees the initialize -> session-id handshake lands before anything else.
let queue: Promise<void> = Promise.resolve();
rl.on("line", (line) => {
  if (!line.trim()) return;
  queue = queue.then(() => forward(line));
});
rl.on("close", () => {
  void queue.then(() => process.exit(0));
});
