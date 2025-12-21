import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { ToolAnnotations } from "@modelcontextprotocol/sdk/types.js";
import { z } from "zod";

export { ToolAnnotations };

export abstract class BaseTool {
  abstract name: string;
  abstract description: string;
  abstract schema: z.ZodObject<any>;
  abstract annotations: ToolAnnotations;

  register(server: McpServer) {
    server.tool(
      this.name,
      this.description,
      this.schema.shape,
      this.annotations,
      this.execute.bind(this)
    );
  }

  abstract execute(args: z.infer<typeof this.schema>): Promise<{
    content: Array<{ type: "text"; text: string }>;
  }>;
}
