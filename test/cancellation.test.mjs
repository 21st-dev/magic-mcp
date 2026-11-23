// Regression test: a cancellation must reach the endpoint while the request it
// names is still running. The ordered stdio pump used to hold it until that
// request had already answered, which made "stop" a no-op.
import test from "node:test";
import assert from "node:assert/strict";
import { createServer } from "node:http";
import { spawn } from "node:child_process";
import { createInterface } from "node:readline";
import { fileURLToPath } from "node:url";

const ENTRY = fileURLToPath(new URL("../dist/index.js", import.meta.url));

// Long enough that a cancellation held behind the request lands well past the
// threshold below, short enough to keep the test quick.
const CALL_MS = 800;
const CANCEL_AFTER_MS = 120;
const MUST_ARRIVE_WITHIN_MS = 400;

function startEndpoint() {
  const events = [];
  const server = createServer((req, res) => {
    let body = "";
    req.on("data", (chunk) => (body += chunk));
    req.on("end", () => {
      const msg = JSON.parse(body);
      events.push({ at: Date.now(), method: msg.method ?? null, id: msg.id ?? null });

      const headers = { "content-type": "application/json" };
      if (msg.method === "initialize") headers["mcp-session-id"] = "sess-test";

      // Notifications (e.g. notifications/cancelled) are acknowledged, not answered.
      if (msg.id === undefined || msg.id === null) {
        res.writeHead(202).end();
        return;
      }

      const reply = () => {
        if (res.writableEnded) return;
        events.push({ at: Date.now(), replyTo: msg.id });
        res.writeHead(200, headers).end(JSON.stringify({ jsonrpc: "2.0", id: msg.id, result: {} }));
      };
      if (msg.method === "tools/call") setTimeout(reply, CALL_MS);
      else reply();
    });
  });

  return new Promise((resolve) => {
    server.listen(0, "127.0.0.1", () => resolve({ server, events, port: server.address().port }));
  });
}

test("a cancellation reaches the endpoint before the cancelled call replies", async (t) => {
  const { server, events, port } = await startEndpoint();
  t.after(() => server.close());

  const child = spawn(process.execPath, [ENTRY], {
    env: { ...process.env, MCP_URL_21ST: `http://127.0.0.1:${port}`, API_KEY_21ST: "test-key" },
    stdio: ["pipe", "pipe", "pipe"],
  });
  t.after(() => child.kill());
  child.stdin.on("error", () => {});

  const replies = [];
  createInterface({ input: child.stdout }).on("line", (line) => replies.push(JSON.parse(line)));

  const send = (message) => child.stdin.write(JSON.stringify(message) + "\n");
  const waitForReply = async (id) => {
    for (let i = 0; i < 200; i++) {
      if (replies.some((r) => r.id === id)) return;
      await new Promise((resolve) => setTimeout(resolve, 10));
    }
    assert.fail(`no reply for id ${id}; got ${JSON.stringify(replies)}`);
  };

  send({ jsonrpc: "2.0", id: 1, method: "initialize", params: {} });
  await waitForReply(1);

  const callStartedAt = Date.now();
  send({ jsonrpc: "2.0", id: 2, method: "tools/call", params: { name: "generate" } });
  await new Promise((resolve) => setTimeout(resolve, CANCEL_AFTER_MS));
  send({ jsonrpc: "2.0", method: "notifications/cancelled", params: { requestId: 2, reason: "user cancelled" } });

  await waitForReply(2);
  child.stdin.end();

  const cancelled = events.find((e) => e.method === "notifications/cancelled");
  assert.ok(cancelled, "the endpoint never received notifications/cancelled");
  const arrivedAfter = cancelled.at - callStartedAt;
  assert.ok(
    arrivedAfter < MUST_ARRIVE_WITHIN_MS,
    `cancellation arrived ${arrivedAfter}ms into the call (limit ${MUST_ARRIVE_WITHIN_MS}ms); ` +
      `it was held behind the request it cancels, which had already replied by then`,
  );
});

// Same defect, harder timing: request and cancellation arrive in one stdin
// chunk, so the pump's busy state must already be set when the second line is
// read - a flag raised inside the pump's own microtask would miss it.
test("a cancellation in the same chunk as its request is not queued behind it", async (t) => {
  const { server, events, port } = await startEndpoint();
  t.after(() => server.close());

  const child = spawn(process.execPath, [ENTRY], {
    env: { ...process.env, MCP_URL_21ST: `http://127.0.0.1:${port}`, API_KEY_21ST: "test-key" },
    stdio: ["pipe", "pipe", "pipe"],
  });
  t.after(() => child.kill());
  child.stdin.on("error", () => {});

  const replies = [];
  createInterface({ input: child.stdout }).on("line", (line) => replies.push(JSON.parse(line)));

  const waitForReply = async (id) => {
    for (let i = 0; i < 200; i++) {
      if (replies.some((r) => r.id === id)) return;
      await new Promise((resolve) => setTimeout(resolve, 10));
    }
    assert.fail(`no reply for id ${id}; got ${JSON.stringify(replies)}`);
  };

  child.stdin.write(JSON.stringify({ jsonrpc: "2.0", id: 1, method: "initialize", params: {} }) + "\n");
  await waitForReply(1);

  const callStartedAt = Date.now();
  // One write: both messages are already buffered when the pump starts reading.
  child.stdin.write(
    JSON.stringify({ jsonrpc: "2.0", id: 2, method: "tools/call", params: { name: "generate" } }) +
      "\n" +
      JSON.stringify({ jsonrpc: "2.0", method: "notifications/cancelled", params: { requestId: 2 } }) +
      "\n",
  );

  await waitForReply(2);
  child.stdin.end();

  const cancelled = events.find((e) => e.method === "notifications/cancelled");
  assert.ok(cancelled, "the endpoint never received notifications/cancelled");
  const arrivedAfter = cancelled.at - callStartedAt;
  assert.ok(
    arrivedAfter < MUST_ARRIVE_WITHIN_MS,
    `cancellation arrived ${arrivedAfter}ms into the call (limit ${MUST_ARRIVE_WITHIN_MS}ms); ` +
      `the pump had not registered the request as in flight when it read the cancellation`,
  );
});
