# Magic MCP → 21st MCP

> **Magic MCP is now the 21st MCP.** The Magic MCP server (`@21st-dev/magic`) has been replaced by the unified **21st MCP**, installed via the **21st CLI** — setup at [21st.dev/mcp](https://21st.dev/mcp). This package remains published as a thin compatibility proxy so old configs keep working.

## Install the 21st MCP (recommended)

```bash
npx @21st-dev/cli@latest init --client cursor   # or: claude | vscode | windsurf | codex
```

Or add it manually — it is a plain HTTP MCP server:

```json
{
  "mcpServers": {
    "21st": {
      "url": "https://21st.dev/api/mcp",
      "headers": { "x-api-key": "YOUR_21ST_API_KEY" }
    }
  }
}
```

Get an API key at [21st.dev/mcp](https://21st.dev/mcp).

> **Old Magic API keys were reset.** Keys issued by the old Magic console no longer work anywhere. Generate a fresh key at [21st.dev/mcp](https://21st.dev/mcp).

## What this package does now (v0.2.0+)

`npx -y @21st-dev/magic@latest API_KEY="..."` still works: since v0.2.0 it is a small stdio proxy that forwards every MCP message to the 21st MCP server. Existing `mcp.json` entries that reference `@21st-dev/magic` keep functioning — but they now speak to the same server as the 21st CLI, with the full current toolset.

The API key is accepted in all the historical forms: positional `API_KEY="..."`, `--API_KEY=...`, `/API_KEY:...`, `-API_KEY ...`, or the `TWENTY_FIRST_API_KEY` / `API_KEY_21ST` environment variables.

## Old tool names → new tool names

The 21st MCP still accepts the legacy Magic tool names and translates them, so agents that remember the old names keep working. Prefer the new names:

| Legacy Magic tool | 21st MCP tool |
| --- | --- |
| `21st_magic_component_builder` | `generate` |
| `21st_magic_component_inspiration` | `get_inspiration` |
| `21st_magic_component_refiner` | `generate` (new generation from the refinement prompt) |
| `logo_search` | `search_logo` (one query per call) |

The current server exposes much more than the old four tools: catalog search across components/themes/templates, paid code retrieval, bookmarks, team libraries, UI generation with variants, profile management, and more. Connect and call `tools/list` to see the full set.

## Links

- 21st MCP setup & API keys: https://21st.dev/mcp
- 21st CLI on npm: https://www.npmjs.com/package/@21st-dev/cli
- 21st.dev — discover, publish, and generate UI components: https://21st.dev

## FAQ

**Why did my old Magic MCP stop working?**
The Magic backend (`magic.21st.dev`) was superseded by the unified 21st MCP, and all old API keys were reset for security. Update to a fresh key from [21st.dev/mcp](https://21st.dev/mcp) — your existing `@21st-dev/magic` config will then work again through this compatibility proxy, though we recommend switching to `npx @21st-dev/cli@latest init`.

**Is `/ui` still a thing?**
Use natural language: ask your agent to search 21st for components (`search`), or generate new UI (`generate`). The old `/ui`, `/21` trigger phrases were a convention of the legacy tools' descriptions, not the protocol.
