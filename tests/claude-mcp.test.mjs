import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';

test('Claude plugin registers 21st as a remote HTTP MCP server', () => {
  const config = JSON.parse(readFileSync(new URL('../.mcp.json', import.meta.url), 'utf8'));
  const server = config.mcpServers['21st'];

  assert.equal(server.type, 'http');
  assert.equal(server.url, 'https://21st.dev/api/mcp');
  assert.equal(server.headers['x-api-key'], '${API_KEY_21ST}');
});
