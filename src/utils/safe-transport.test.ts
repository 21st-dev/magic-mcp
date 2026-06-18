import {
  isValidId,
  looksLikeJsonRpcResponse,
  sanitiseJsonRpcId,
} from "./safe-transport.js";

describe("isValidId", () => {
  it("accepts string ids", () => {
    expect(isValidId("abc")).toBe(true);
    expect(isValidId("")).toBe(true);
  });

  it("accepts number ids", () => {
    expect(isValidId(0)).toBe(true);
    expect(isValidId(42)).toBe(true);
    expect(isValidId(1.5)).toBe(true);
    expect(isValidId(-1)).toBe(true);
  });

  it("accepts null id", () => {
    expect(isValidId(null)).toBe(true);
  });

  it("rejects undefined id", () => {
    expect(isValidId(undefined)).toBe(false);
  });

  it("rejects object id", () => {
    expect(isValidId({ bad: "id" })).toBe(false);
  });

  it("rejects array id", () => {
    expect(isValidId([1, 2])).toBe(false);
  });

  it("rejects boolean id", () => {
    expect(isValidId(true)).toBe(false);
    expect(isValidId(false)).toBe(false);
  });
});

describe("looksLikeJsonRpcResponse", () => {
  it("returns true for a jsonrpc 2.0 response", () => {
    expect(looksLikeJsonRpcResponse('{"jsonrpc":"2.0","id":1,"result":{}}')).toBe(true);
  });

  it("returns true for jsonrpc response with spaces", () => {
    expect(looksLikeJsonRpcResponse('{"jsonrpc": "2.0", "id": 1, "error": {}}')).toBe(true);
  });

  it("returns false for a request object", () => {
    expect(looksLikeJsonRpcResponse('{"jsonrpc":"2.0","id":1,"method":"ping"}')).toBe(false);
  });

  it("returns false for non-JSON text", () => {
    expect(looksLikeJsonRpcResponse("not json at all")).toBe(false);
  });

  it("returns false for empty string", () => {
    expect(looksLikeJsonRpcResponse("")).toBe(false);
  });
});

describe("sanitiseJsonRpcId", () => {
  it("leaves valid responses unchanged", () => {
    const input = '{"jsonrpc":"2.0","id":"abc","result":{}}';
    expect(sanitiseJsonRpcId(input)).toBe(input);
  });

  it("leaves valid number-id responses unchanged", () => {
    const input = '{"jsonrpc":"2.0","id":42,"result":{}}';
    expect(sanitiseJsonRpcId(input)).toBe(input);
  });

  it("leaves valid null-id responses unchanged", () => {
    const input = '{"jsonrpc":"2.0","id":null,"error":{"code":-32600,"message":"Invalid Request"}}';
    expect(sanitiseJsonRpcId(input)).toBe(input);
  });

  it("replaces object id with null in error response", () => {
    // The crash reproducer: id is an object.
    const input = '{"jsonrpc":"2.0","id":{"bad":"id"},"error":{"code":-32600,"message":"Invalid Request"}}';
    const output = JSON.parse(sanitiseJsonRpcId(input));
    expect(output.id).toBe(null);
    expect(output.jsonrpc).toBe("2.0");
    expect(output.error.code).toBe(-32600);
  });

  it("replaces array id with null", () => {
    const input = '{"jsonrpc":"2.0","id":[1,2],"result":{}}';
    const output = JSON.parse(sanitiseJsonRpcId(input));
    expect(output.id).toBe(null);
  });

  it("leaves request objects unchanged (no id to corrupt)", () => {
    const input = '{"jsonrpc":"2.0","method":"ping","params":{}}';
    expect(sanitiseJsonRpcId(input)).toBe(input);
  });

  it("leaves batch responses unchanged", () => {
    const input = '[{"jsonrpc":"2.0","id":1,"result":{}}]';
    expect(sanitiseJsonRpcId(input)).toBe(input);
  });

  it("leaves non-JSON text unchanged", () => {
    const input = "some log output\n";
    expect(sanitiseJsonRpcId(input)).toBe(input);
  });
});
