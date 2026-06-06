// Mocks must be declared before any imports that use them
const mockWaitForCallback = jest.fn();

jest.mock("open", () => ({
  __esModule: true,
  default: jest.fn(),
}));

jest.mock("../utils/callback-server.js", () => ({
  CallbackServer: jest.fn().mockImplementation(() => ({
    waitForCallback: mockWaitForCallback,
    getPort: jest.fn().mockReturnValue(9221),
  })),
}));

jest.mock("../utils/config.js", () => ({
  config: { canvas: false, github: false },
}));

jest.mock("../utils/git-operations.js", () => ({
  git: jest.fn(),
}));

import { CreateUiTool } from "./create-ui.js";

describe("CreateUiTool", () => {
  let tool: CreateUiTool;

  beforeEach(() => {
    jest.clearAllMocks();
    tool = new CreateUiTool();
  });

  describe("callback data parsing", () => {
    it("should parse JSON string with component field", async () => {
      const jsonData = JSON.stringify({ component: "export function Button() { return <button>Click</button>; }" });
      mockWaitForCallback.mockResolvedValue({ data: jsonData });

      const result = await tool.execute({
        message: "Create a button",
        searchQuery: "button component",
        absolutePathToCurrentFile: "/test/file.tsx",
        absolutePathToProjectDirectory: "/test",
        standaloneRequestQuery: "Create a button component",
      });

      // The component code should appear in the response, not [object Object]
      expect(result.content[0].text).toContain("export function Button()");
      expect(result.content[0].text).not.toContain("[object Object]");
    });

    it("should parse JSON string with text field", async () => {
      const jsonData = JSON.stringify({ text: "export function Input() { return <input />; }" });
      mockWaitForCallback.mockResolvedValue({ data: jsonData });

      const result = await tool.execute({
        message: "Create an input",
        searchQuery: "input component",
        absolutePathToCurrentFile: "/test/file.tsx",
        absolutePathToProjectDirectory: "/test",
        standaloneRequestQuery: "Create an input component",
      });

      expect(result.content[0].text).toContain("export function Input()");
      expect(result.content[0].text).not.toContain("[object Object]");
    });

    it("should fall back to raw string if JSON parse fails", async () => {
      const rawString = "Plain text component code";
      mockWaitForCallback.mockResolvedValue({ data: rawString });

      const result = await tool.execute({
        message: "Create something",
        searchQuery: "something",
        absolutePathToCurrentFile: "/test/file.tsx",
        absolutePathToProjectDirectory: "/test",
        standaloneRequestQuery: "Create something",
      });

      expect(result.content[0].text).toContain("Plain text component code");
    });

    it("should use fallback message when data is empty", async () => {
      mockWaitForCallback.mockResolvedValue({ data: "" });

      const result = await tool.execute({
        message: "Create something",
        searchQuery: "something",
        absolutePathToCurrentFile: "/test/file.tsx",
        absolutePathToProjectDirectory: "/test",
        standaloneRequestQuery: "Create something",
      });

      expect(result.content[0].text).toContain("No component data received");
    });

    it("should handle timed out callback gracefully", async () => {
      // Timeout returns { data: { timedOut: true } } - data is an object, not a string
      mockWaitForCallback.mockResolvedValue({ data: { timedOut: true } });

      const result = await tool.execute({
        message: "Create something",
        searchQuery: "something",
        absolutePathToCurrentFile: "/test/file.tsx",
        absolutePathToProjectDirectory: "/test",
        standaloneRequestQuery: "Create something",
      });

      // Should fall back to the default message since timedOut object has no component/text
      expect(result.content[0].text).toContain("No component data received");
    });
  });
});