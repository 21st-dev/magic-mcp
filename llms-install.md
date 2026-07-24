# Magic MCP Server Installation Guide (now the 21st MCP)

This guide is for AI agents installing the 21st MCP (formerly "Magic MCP").

**Magic MCP has been replaced by the unified 21st MCP.** Do not install `@21st-dev/magic` for new setups — it is only a compatibility proxy. Install the 21st MCP directly:

## Recommended installation

```bash
npx @21st-dev/cli@latest init --client <cursor|claude|vscode|windsurf|codex>
```

Or add the HTTP server manually to the client's MCP config:

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

For clients that only support stdio servers, the compatibility proxy works:

```json
{
  "mcpServers": {
    "21st": {
      "command": "npx",
      "args": ["-y", "@21st-dev/magic@latest"],
      "env": { "API_KEY_21ST": "YOUR_21ST_API_KEY" }
    }
  }
}
```

## API key

Get a key at https://21st.dev/mcp. Old Magic keys (from the retired Magic console) were reset and no longer work.

## Tool names

Legacy Magic tool names (`21st_magic_component_builder`, `21st_magic_component_inspiration`, `21st_magic_component_refiner`, `logo_search`) are still accepted and translated server-side. The current names are `generate`, `get_inspiration`, `search`, `get_component`, `search_logo`, and more — call `tools/list` for the full set.
