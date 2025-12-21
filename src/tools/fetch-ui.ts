import { z } from "zod";
import { BaseTool, ToolAnnotations } from "../utils/base-tool.js";
import { twentyFirstClient } from "../utils/http-client.js";

const FETCH_UI_TOOL_NAME = "21st_magic_component_inspiration";
const FETCH_UI_TOOL_DESCRIPTION = `
"Use this tool when the user wants to see component, get inspiration, or /21st fetch data and previews from 21st.dev. This tool returns the JSON data of matching components without generating new code. This tool ONLY returns the text snippet for that UI component. 
After calling this tool, you must edit or add files to integrate the snippet into the codebase."
`;

interface FetchUiResponse {
  text: string;
}

export class FetchUiTool extends BaseTool {
  name = FETCH_UI_TOOL_NAME;
  description = FETCH_UI_TOOL_DESCRIPTION;
  annotations: ToolAnnotations = {
    title: "Fetch UI Inspiration",
    readOnlyHint: true,
    openWorldHint: true,
  };

  schema = z.object({
    message: z.string().describe("Full users message"),
    searchQuery: z
      .string()
      .describe(
        "Search query for 21st.dev (library for searching UI components) to find a UI component that matches the user's message. Must be a two-four words max or phrase"
      ),
  });

  async execute({ message, searchQuery }: z.infer<typeof this.schema>) {
    try {
      const { data } = await twentyFirstClient.post<FetchUiResponse>(
        "/api/fetch-ui",
        {
          message,
          searchQuery,
        }
      );

      return {
        content: [
          {
            type: "text" as const,
            text: data.text,
          },
        ],
      };
    } catch (error) {
      console.error("Error executing tool", error);
      throw error;
    }
  }
}
