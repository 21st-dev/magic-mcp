import open from "open";
import { z } from "zod";
import { BaseTool, ToolAnnotations } from "../utils/base-tool.js";
import { CallbackServer } from "../utils/callback-server.js";
import { config } from "../utils/config.js";
import { git } from "../utils/git-operations.js";

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
  annotations: ToolAnnotations = {
    title: "Create UI Component",
    destructiveHint: true,
    openWorldHint: true,
  };

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
    standaloneRequestQuery: z
      .string()
      .describe(
        "You need to formulate what component user wants to create, based on his message, possbile chat histroy and a place where he makes the request.Extract additional context about what should be done to create a ui component/page based on the user's message, search query, and conversation history, files. Don't halucinate and be on point."
      ),
  });

  async execute({
    standaloneRequestQuery,
    absolutePathToProjectDirectory,
    message,
  }: z.infer<typeof this.schema>): Promise<{
    content: Array<{ type: "text"; text: string }>;
  }> {
    try {
      const server = new CallbackServer();
      const callbackPromise = server.waitForCallback();
      const port = server.getPort();

      let url: string = `http://21st.dev/magic-chat?q=${encodeURIComponent(
        standaloneRequestQuery
      )}&mcp=true&port=${port}`;

      if (config.canvas) {
        const params = new URLSearchParams({
          q: `Primary request: ${message} \n\nAdditional context: ${standaloneRequestQuery}`,
          mcp: "true",
          port: port.toString(),
        });

        if (config.github) {
          try {
            const projectDir = absolutePathToProjectDirectory;

            const salt = Math.random().toString(36).substring(2, 8);
            const slug = `temp-${salt}-${Date.now()}`;
            const branchName = `21st/${slug}`;

            const originalBranch = await git(
              projectDir,
              "rev-parse --abbrev-ref HEAD"
            );
            const status = await git(projectDir, "status --porcelain");
            const hasLocalChanges = status.length > 0;
            let stashed = false;

            // Get repo in "owner/repo" format from remote URL
            const remoteUrl = await git(projectDir, "remote get-url origin");
            const repoMatch = remoteUrl.match(/github\.com[/:](.*?)(\.git)?$/);
            const repo = repoMatch ? repoMatch[1] : "";

            // 1. Stash changes if any (preserves staged/unstaged/untracked)
            if (hasLocalChanges) {
              await git(projectDir, `stash push -u -m "21st-${slug}"`);
              stashed = true;
            }

            // 2. Create new branch
            await git(projectDir, `checkout -b ${branchName}`);

            // 3. Apply stash if we stashed
            if (stashed) {
              await git(projectDir, "stash apply");
            }

            // 4. Stage all and commit (--allow-empty for no changes case)
            await git(projectDir, "add -A");
            await git(
              projectDir,
              `commit -m "WIP: magic-ui init" --allow-empty`
            );

            // 5. Push to origin (throws error if fails)
            await git(projectDir, `push -u origin ${branchName}`);

            // 6. Restore original state
            await git(projectDir, `checkout ${originalBranch}`);
            if (stashed) {
              await git(projectDir, "stash pop");
            }

            // Add branch/repo only on success
            params.set("branch", branchName);
            params.set("repo", repo);
            params.set("originalBranch", originalBranch);
          } catch (error) {
            console.error(
              "Error with git operations, falling back to canvas without branch/repo",
              error
            );
          }
        }

        url = `https://21st.dev/canvas/new?${params.toString()}`;
      }

      open(url);

      const { data } = await callbackPromise;

      const prompt = data || "// No component data received. Please try again.";

      const responseToUser = `
${prompt}

## Shadcn/ui instructions
After you add the component, make sure to add the component to the project. If you can't resolve components from demo code,
Make sure to install shadcn/ui components from the demo code missing imports

Examples of importing shadcn/ui components:
if these imports can't be resolved:
${"```tsx"}
import {
  Table
} from "@/components/ui/table"
import { Textarea } from "@/components/ui/textarea"
${"```"}

then run this command:
${"```bash"}
npx shadcn@latest add table textarea
${"```"}`;

      return {
        content: [
          {
            type: "text" as const,
            text: responseToUser,
          },
        ],
      };
    } catch (error) {
      console.error("Error executing tool", error);
      throw error;
    }
  }
}
