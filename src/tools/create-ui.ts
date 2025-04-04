import { z } from "zod";
import { BaseTool } from "../utils/base-tool.js";
import { twentyFirstClient } from "../utils/http-client.js";
import { CallbackServer } from "../utils/callback-server.js";
import open from "open";

const UI_TOOL_NAME = "21st_magic_component_builder";
const UI_TOOL_DESCRIPTION = `
"Use this tool when the user requests a new UI component—e.g., mentions /ui, /21 /21st, or asks for a button, input, dialog, table, form, banner, card, or other React component.
This tool ONLY returns the text snippet for that UI component. 
After calling this tool, you must edit or add files to integrate the snippet into the codebase."
`;

interface CreateUiResponse {
  text: string;
}

export class CreateUiTool extends BaseTool {
  name = UI_TOOL_NAME;
  description = UI_TOOL_DESCRIPTION;

  schema = z.object({
    message: z.string().describe("Full users message"),
    searchQuery: z
      .string()
      .describe(
        "Generate a search query for 21st.dev (library for searching UI components) to find a UI component that matches the user's message. Must be a two-four words max or phrase"
      ),
    absolutePathToCurrentFile: z
      .string()
      .describe(
        "Absolute path to the current file to which we want to apply changes"
      ),
    absolutePathToProjectDirectory: z
      .string()
      .describe("Absolute path to the project root directory"),
  });

  async execute({
    message,
    searchQuery,
    absolutePathToCurrentFile,
    absolutePathToProjectDirectory,
  }: z.infer<typeof this.schema>): Promise<{
    content: Array<{ type: "text"; text: string }>;
  }> {
    try {
      const response = await twentyFirstClient.post<{
        data1: { text: string };
        data2: { text: string };
        data3: { text: string };
      }>("/api/create-ui-variation", {
        message,
        searchQuery,
        absolutePathToProjectDirectory,
        absolutePathToCurrentFile,
      });

      if (response.status !== 200) {
        open("https://21st.dev/settings/billing");
        return {
          content: [
            {
              type: "text" as const,
              // @ts-ignore
              text: response.data.text as string,
            },
          ],
        };
      }

      const server = new CallbackServer();
      const { data } = await server.promptUser({
        initialData: {
          data1: response.data.data1,
          data2: response.data.data2,
          data3: response.data.data3,
        },
      });

      const componentData = data || {
        text: "No component data received. Please try again.",
      };

      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify(componentData, null, 2),
          },
        ],
      };
    } catch (error) {
      console.error("Error executing tool", error);
      throw error;
    }
  }
}
