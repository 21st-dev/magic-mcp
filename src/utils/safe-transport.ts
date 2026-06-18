/**
 * Safe stdout writer that guards against JSON-RPC id serialisation bugs.
 *
 * Background: the MCP SDK's Session can emit error responses where `id` is
 * undefined (a notification that errored) or a non-serialisable object.
 * When JSON.stringify is called on such a response it either drops the `id`
 * field (undefined → omitted) or throws (non-serialisable object id).
 * Both corrupt the JSON-RPC protocol and can crash the server because the
 * transport's write() throws and the resulting unhandled error propagates to
 * the top-level which calls cleanup() → process.exit(0).
 *
 * This module patches process.stdout.write before the MCP server starts so
 * that every JSON string is validated and the `id` field is normalised to
 * null when it would otherwise be invalid.
 */

/**
 * Returns true when a JSON-RPC `id` is valid per the spec:
 * string, number, or null.  The JSON-RPC 2.0 spec requires responses to
 * include an id that matches the request; invalid ids must be replaced with
 * null so the response is always valid JSON with a present id field.
 */
export function isValidId(id: unknown): id is string | number | null {
  return id === null || typeof id === "string" || typeof id === "number";
}

/**
 * Check whether a string looks like a JSON-RPC 2.0 response object
 * (has jsonrpc field but no method field; requests/responses are distinguished
 * by the presence of "method").
 */
export function looksLikeJsonRpcResponse(text: string): boolean {
  // A response has jsonrpc but no "method" field.
  // Requests/notifications have "method"; responses have "result" or "error".
  const hasJsonrpc = text.includes("\"jsonrpc\"");
  const hasMethod = text.includes("\"method\"");
  return hasJsonrpc && !hasMethod;
}

/**
 * Parse and fix a JSON-RPC response string, replacing any invalid `id`
 * with null.  Returns the original string unchanged when it is not a
 * JSON-RPC response (e.g. batch, non-JSON, or a request/notification).
 */
export function sanitiseJsonRpcId(text: string): string {
  let value: unknown;
  try {
    value = JSON.parse(text);
  } catch {
    // Not JSON - leave it untouched.
    return text;
  }

  // Only process single response objects.
  if (
    typeof value !== "object" ||
    value === null ||
    Array.isArray(value)
  ) {
    return text;
  }

  const msg = value as Record<string, unknown>;

  // Must be a response (has jsonrpc field and an id).
  if (
    !("jsonrpc" in msg) ||
    !Object.prototype.hasOwnProperty.call(msg, "id")
  ) {
    return text;
  }

  if (!isValidId(msg.id)) {
    // Replace the invalid id with null so the response is always valid.
    const fixed = { ...msg, id: null };
    return JSON.stringify(fixed);
  }

  return text;
}

/**
 * Install the stdout write guard.
 * MUST be called before the MCP server connects the transport.
 */
export function installStdoutWriteGuard(): void {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const originalWrite = process.stdout.write.bind(process.stdout) as any;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (process.stdout as any).write = (
    chunk: unknown,
    encoding?: BufferEncoding | ((err?: Error | null) => void),
    callback?: (err?: Error | null) => void,
  ): boolean => {
    let chunkStr: string;
    let writeEncoding: BufferEncoding | undefined;
    let writeCallback: ((err?: Error | null) => void) | undefined;

    if (typeof encoding === "function") {
      chunkStr = String(chunk);
      writeCallback = encoding;
    } else {
      chunkStr = typeof chunk === "string" ? chunk : String(chunk);
      writeEncoding = encoding;
      writeCallback = callback;
    }

    const sanitised = looksLikeJsonRpcResponse(chunkStr)
      ? sanitiseJsonRpcId(chunkStr)
      : chunkStr;

    return originalWrite(sanitised, writeEncoding, writeCallback);
  };
}
