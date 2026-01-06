import { z } from "zod";
import { promises as fs } from "fs";
import { BaseTool, ToolAnnotations } from "../utils/base-tool.js";

// Types for SVGL API responses
interface ThemeOptions {
  dark: string;
  light: string;
}

interface SVGLogo {
  id?: number;
  title: string;
  category: string | string[];
  route: string | ThemeOptions;
  wordmark?: string | ThemeOptions;
  brandUrl?: string;
  url: string;
}

const LOGO_TOOL_NAME = "logo_search";
const LOGO_TOOL_DESCRIPTION = `
Search and return logos in specified format (JSX, TSX, SVG).
Supports single and multiple logo searches with category filtering.
Can return logos in different themes (light/dark) if available.

When to use this tool:
1. When user types "/logo" command (e.g., "/logo GitHub")
2. When user asks to add a company logo that's not in the local project

Example queries:
- Single company: ["discord"]
- Multiple companies: ["discord", "github", "slack"]
- Specific brand: ["microsoft office"]
- Command style: "/logo GitHub" -> ["github"]
- Request style: "Add Discord logo to the project" -> ["discord"]

Format options:
- TSX: Returns TypeScript React component
- JSX: Returns JavaScript React component
- SVG: Returns raw SVG markup

Each result includes:
- Component name (e.g., DiscordIcon)
- Component code
- Import instructions
`;

export class LogoSearchTool extends BaseTool {
  name = LOGO_TOOL_NAME;
  description = LOGO_TOOL_DESCRIPTION;
  annotations: ToolAnnotations = {
    title: "Search Logos",
    destructiveHint: true,
    openWorldHint: true,
  };

  schema = z.object({
    queries: z
      .array(z.string())
      .describe("List of company names to search for logos"),
    format: z.enum(["JSX", "TSX", "SVG"]).describe("Output format"),
  });

  private async fetchLogos(query: string): Promise<SVGLogo[]> {
    const baseUrl = "https://api.svgl.app";
    const url = `${baseUrl}?search=${encodeURIComponent(query)}`;

    try {
      const response = await fetch(url);
      if (!response.ok) {
        if (response.status === 404) {
          return []; // Return empty array for not found instead of throwing
        }
        throw new Error(`SVGL API error: ${response.statusText}`);
      }
      const data = await response.json();
      return Array.isArray(data) ? data : [];
    } catch (error) {
      console.error(
        `[${LOGO_TOOL_NAME}] Error fetching logos for ${query}:`,
        error
      );
      return []; // Return empty array on error
    }
  }

  private async fetchSVGContent(url: string): Promise<string> {
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Failed to fetch SVG content: ${response.statusText}`);
      }
      return await response.text();
    } catch (error) {
      console.error("Error fetching SVG content:", error);
      throw error;
    }
  }

  private async convertToFormat(
    svgContent: string,
    format: "JSX" | "TSX" | "SVG",
    componentName: string = "Icon"
  ): Promise<string> {
    if (format === "SVG") {
      return svgContent;
    }

    // Convert to JSX/TSX
    const jsxContent = svgContent
      .replace(/class=/g, "className=")
      .replace(/style="([^"]*)"/g, (match: string, styles: string) => {
        const cssObject = styles
          .split(";")
          .filter(Boolean)
          .map((style: string) => {
            const [property, value] = style
              .split(":")
              .map((s: string) => s.trim());
            const camelProperty = property.replace(/-([a-z])/g, (g: string) =>
              g[1].toUpperCase()
            );
            return `${camelProperty}: "${value}"`;
          })
          .join(", ");
        return `style={{${cssObject}}}`;
      });

    // Make sure we use the full component name (with Icon suffix)
    const finalComponentName = componentName.endsWith("Icon")
      ? componentName
      : `${componentName}Icon`;
    return format === "TSX"
      ? `const ${finalComponentName}: React.FC = () => (${jsxContent})`
      : `function ${finalComponentName}() { return (${jsxContent}) }`;
  }

  private async saveTestResult(data: {
    queries: string[];
    format: string;
    successful: Array<{ query: string; content: string }>;
    failed: Array<{ query: string; message: string }>;
  }) {
    const timestamp = new Date().toISOString();
    const filename = `test-results/logo-search-${timestamp.replace(
      /[:.]/g,
      "-"
    )}.json`;

    // Format response as component structure
    const foundIcons = data.successful.map((r) => {
      const title = r.content.split("\n")[0].replace("// ", "").split(" (")[0];
      const componentName =
        title
          .split(" ")
          .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
          .join("")
          .replace(/[^a-zA-Z0-9]/g, "") + "Icon";

      return {
        icon: componentName,
        code: r.content.split("\n").slice(1).join("\n"),
      };
    });

    const missingIcons = data.failed.map((f) => ({
      icon: f.query,
      alternatives: [
        "Search for SVG version on the official website",
        "Check other icon libraries (e.g., heroicons, lucide)",
        "Request SVG file from the user",
      ],
    }));

    const response = {
      icons: foundIcons,
      notFound: missingIcons,
      setup: [
        "1. Add these icons to your project:",
        foundIcons
          .map((c) => `   ${c.icon}.${data.format.toLowerCase()}`)
          .join("\n"),
        "2. Import and use like this:",
        "```tsx",
        "import { " +
          foundIcons.map((c) => c.icon).join(", ") +
          " } from '@/icons';",
        "```",
      ].join("\n"),
    };

    try {
      await fs.writeFile(filename, JSON.stringify(response, null, 2), "utf-8");
      console.log(`[${LOGO_TOOL_NAME}] Test results saved to ${filename}`);
    } catch (error) {
      console.error(`[${LOGO_TOOL_NAME}] Error saving test results:`, error);
    }
  }

  async execute({ queries, format }: z.infer<typeof this.schema>) {
    console.log(
      `[${LOGO_TOOL_NAME}] Starting logo search for: ${queries.join(
        ", "
      )} in ${format} format`
    );
    try {
      // Process all queries
      const results = await Promise.all(
        queries.map(async (query) => {
          try {
            console.log(`[${LOGO_TOOL_NAME}] Fetching logos for ${query}...`);
            const logos = await this.fetchLogos(query);

            if (logos.length === 0) {
              console.log(`[${LOGO_TOOL_NAME}] No logo found for ${query}`);
              return {
                query,
                success: false,
                message: `No logo found for: "${query}"`,
              };
            }

            const logo = logos[0];
            console.log(
              `[${LOGO_TOOL_NAME}] Processing logo for: ${logo.title}`
            );

            const svgUrl =
              typeof logo.route === "string" ? logo.route : logo.route.light;
            console.log(`[${LOGO_TOOL_NAME}] Fetching SVG from: ${svgUrl}`);
            const svgContent = await this.fetchSVGContent(svgUrl);

            console.log(`[${LOGO_TOOL_NAME}] Converting to ${format} format`);
            const formattedContent = await this.convertToFormat(
              svgContent,
              format,
              logo.title + "Icon"
            );

            console.log(`[${LOGO_TOOL_NAME}] Successfully processed ${query}`);
            return {
              query,
              success: true,
              content: `// ${logo.title} (${logo.url})\n${formattedContent}`,
            };
          } catch (error) {
            console.error(
              `[${LOGO_TOOL_NAME}] Error processing ${query}:`,
              error
            );
            return {
              query,
              success: false,
              message: error instanceof Error ? error.message : "Unknown error",
            };
          }
        })
      );

      // Prepare summary
      const successful = results.filter((r) => r.success);
      const failed = results.filter((r) => !r.success);

      console.log(`[${LOGO_TOOL_NAME}] Results summary:`);
      console.log(
        `[${LOGO_TOOL_NAME}] Successfully processed: ${successful.length}`
      );
      console.log(`[${LOGO_TOOL_NAME}] Failed to process: ${failed.length}`);

      // Save test results
      await this.saveTestResult({
        queries,
        format,
        successful: successful
          .filter(
            (r): r is typeof r & { content: string } => r.content !== undefined
          )
          .map((r) => ({
            query: r.query,
            content: r.content,
          })),
        failed: failed
          .filter(
            (r): r is typeof r & { message: string } => r.message !== undefined
          )
          .map((r) => ({
            query: r.query,
            message: r.message,
          })),
      });

      // Format response as component structure
      const foundIcons = successful.map((r) => {
        const title =
          r.content?.split("\n")[0].replace("// ", "").split(" (")[0] || "";
        const componentName =
          title
            .split(" ")
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
            .join("")
            .replace(/[^a-zA-Z0-9]/g, "") + "Icon";

        return {
          icon: componentName,
          code: r.content?.split("\n").slice(1).join("\n") || "",
        };
      });

      const missingIcons = failed.map((f) => ({
        icon: f.query,
        alternatives: [
          "Search for SVG version on the official website",
          "Check other icon libraries (e.g., heroicons, lucide)",
          "Request SVG file from the user",
        ],
      }));

      const response = {
        icons: foundIcons,
        notFound: missingIcons,
        setup: [
          "1. Add these icons to your project:",
          foundIcons
            .map((c) => `   ${c.icon}.${format.toLowerCase()}`)
            .join("\n"),
          "2. Import and use like this:",
          "```tsx",
          "import { " +
            foundIcons.map((c) => c.icon).join(", ") +
            " } from '@/icons';",
          "```",
        ].join("\n"),
      };

      // Log results
      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify(response, null, 2),
          },
        ],
      };
    } catch (error) {
      // Log error
      console.error(`[${LOGO_TOOL_NAME}] Error:`, error);
      throw error;
    }
  }
}
