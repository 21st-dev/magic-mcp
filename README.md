[![MseeP.ai Security Assessment Badge](https://mseep.net/pr/21st-dev-magic-mcp-badge.png)](https://mseep.ai/app/21st-dev-magic-mcp)

# 21st.dev Magic AI Agent

![MCP Banner](https://21st.dev/magic-agent-og-image.png)

Magic Component Platform (MCP) is a powerful AI-driven tool that helps developers create beautiful, modern UI components instantly through natural language descriptions. It integrates seamlessly with popular IDEs and provides a streamlined workflow for UI development.

## 🌟 Features

- **AI-Powered UI Generation**: Create UI components by describing them in natural language
- **Multi-IDE Support**:
  - [Cursor](https://cursor.com) IDE integration
  - [Windsurf](https://windsurf.ai) support
  - [VSCode](https://code.visualstudio.com/) support
  - [VSCode + Cline](https://cline.bot) integration (Beta)
- **Modern Component Library**: Access to a vast collection of pre-built, customizable components inspired by [21st.dev](https://21st.dev)
- **Real-time Preview**: Instantly see your components as you create them
- **TypeScript Support**: Full TypeScript support for type-safe development
- **SVGL Integration**: Access to a vast collection of professional brand assets and logos
- **Component Enhancement**: Improve existing components with advanced features and animations (Coming Soon)

## 🎯 How It Works

1. **Tell Agent What You Need**

   - In your AI Agent's chat, just type `/ui` and describe the component you're looking for
   - Example: `/ui create a modern navigation bar with responsive design`

2. **Let Magic Create It**

   - Your IDE prompts you to use Magic
   - Magic instantly builds a polished UI component
   - Components are inspired by 21st.dev's library

3. **Seamless Integration**
   - Components are automatically added to your project
   - Start using your new UI components right away
   - All components are fully customizable

## 🚀 Getting Started

### Prerequisites

- Node.js (Latest LTS version recommended)
- One of the supported IDEs:
  - Cursor
  - Windsurf
  - VSCode (with Cline extension)

### Installation

1. **Generate API Key**

   - Visit [21st.dev Magic Console](https://21st.dev/magic/console)
   - Generate a new API key

2. **Choose Installation Method**

#### Method 1: CLI Installation (Recommended)

One command to install and configure MCP for your IDE:

```bash
npx @21st-dev/cli@latest install <client> --api-key <key>
```

Supported clients: cursor, windsurf, cline, claude

#### Method 2: Manual Configuration

If you prefer manual setup, add this to your IDE's MCP config file:

```json
{
  "mcpServers": {
    "@21st-dev/magic": {
      "command": "npx",
      "args": ["-y", "@21st-dev/magic@latest", "API_KEY=\"your-api-key\""]
    }
  }
}
```

Config file locations:

- Cursor: `~/.cursor/mcp.json`
- Windsurf: `~/.codeium/windsurf/mcp_config.json`
- Cline: `~/.cline/mcp_config.json`
- Claude: `~/.claude/mcp_config.json`

#### Method 3: VS Code Installation

For one-click installation, click one of the install buttons below:

[![Install with NPX in VS Code](https://img.shields.io/badge/VS_Code-NPM-0098FF?style=flat-square&logo=visualstudiocode&logoColor=white)](https://insiders.vscode.dev/redirect/mcp/install?name=%4021st-dev%2Fmagic&config=%7B%22command%22%3A%22npx%22%2C%22args%22%3A%5B%22-y%22%2C%22%4021st-dev%2Fmagic%40latest%22%5D%2C%22env%22%3A%7B%22API_KEY%22%3A%22%24%7Binput%3AapiKey%7D%22%7D%7D&inputs=%5B%7B%22type%22%3A%22promptString%22%2C%22id%22%3A%22apiKey%22%2C%22description%22%3A%2221st.dev+Magic+API+Key%22%2C%22password%22%3Atrue%7D%5D) [![Install with NPX in VS Code Insiders](https://img.shields.io/badge/VS_Code_Insiders-NPM-24bfa5?style=flat-square&logo=visualstudiocode&logoColor=white)](https://insiders.vscode.dev/redirect/mcp/install?name=%4021st-dev%2Fmagic&config=%7B%22command%22%3A%22npx%22%2C%22args%22%3A%5B%22-y%22%2C%22%4021st-dev%2Fmagic%40latest%22%5D%2C%22env%22%3A%7B%22API_KEY%22%3A%22%24%7Binput%3AapiKey%7D%22%7D%7D&inputs=%5B%7B%22type%22%3A%22promptString%22%2C%22id%22%3A%22apiKey%22%2C%22description%22%3A%2221st.dev+Magic+API+Key%22%2C%22password%22%3Atrue%7D%5D&quality=insiders)

##### Manual VS Code Setup

First, check the install buttons above for one-click installation. For manual setup:

Add the following JSON block to your User Settings (JSON) file in VS Code. You can do this by pressing `Ctrl + Shift + P` and typing `Preferences: Open User Settings (JSON)`:

```json
{
  "mcp": {
    "inputs": [
      {
        "type": "promptString",
        "id": "apiKey",
        "description": "21st.dev Magic API Key",
        "password": true
      }
    ],
    "servers": {
      "@21st-dev/magic": {
        "command": "npx",
        "args": ["-y", "@21st-dev/magic@latest"],
        "env": {
          "API_KEY": "${input:apiKey}"
        }
      }
    }
  }
}
```

Optionally, you can add it to a file called `.vscode/mcp.json` in your workspace:

```json
{
  "inputs": [
    {
      "type": "promptString",
      "id": "apiKey",
      "description": "21st.dev Magic API Key",
      "password": true
    }
  ],
  "servers": {
    "@21st-dev/magic": {
      "command": "npx",
      "args": ["-y", "@21st-dev/magic@latest"],
      "env": {
        "API_KEY": "${input:apiKey}"
      }
    }
  }
}
```

## ❓ FAQ

### How does Magic AI Agent handle my codebase?

Magic AI Agent only writes or modifies files related to the components it generates. It follows your project's code style and structure, and integrates seamlessly with your existing codebase without affecting other parts of your application.

### Can I customize the generated components?

Yes! All generated components are fully editable and come with well-structured code. You can modify the styling, functionality, and behavior just like any other React component in your codebase.

### What happens if I run out of generations?

If you exceed your monthly generation limit, you'll be prompted to upgrade your plan. You can upgrade at any time to continue generating components. Your existing components will remain fully functional.

### How soon do new components get added to 21st.dev's library?

Authors can publish components to 21st.dev at any time, and Magic Agent will have immediate access to them. This means you'll always have access to the latest components and design patterns from the community.

### Is there a limit to component complexity?

Magic AI Agent can handle components of varying complexity, from simple buttons to complex interactive forms. However, for best results, we recommend breaking down very complex UIs into smaller, manageable components.

## 🛠️ Development

### Project Structure

```
mcp/
├── app/
│   └── components/     # Core UI components
├── types/             # TypeScript type definitions
├── lib/              # Utility functions
└── public/           # Static assets
```

### Key Components

- `IdeInstructions`: Setup instructions for different IDEs
- `ApiKeySection`: API key management interface
- `WelcomeOnboarding`: Onboarding flow for new users

## 🤝 Contributing

We welcome contributions! Please join our [Discord community](https://discord.gg/Qx4rFunHfm) and provide feedback to help improve Magic Agent. The source code is available on [GitHub](https://github.com/serafimcloud/21st).

## 👥 Community & Support

- [Discord Community](https://discord.gg/Qx4rFunHfm) - Join our active community
- [Twitter](https://x.com/serafimcloud) - Follow us for updates

## ⚠️ Beta Notice

Magic Agent is currently in beta. All features are free during this period. We appreciate your feedback and patience as we continue to improve the platform.

## 📝 License

MIT License

## 🙏 Acknowledgments

- Thanks to our beta testers and community members
- Special thanks to the Cursor, Windsurf, and Cline teams for their collaboration
- Integration with [21st.dev](https://21st.dev) for component inspiration
- [SVGL](https://svgl.app) for logo and brand asset integration

---

For more information, join our [Discord community](https://discord.gg/Qx4rFunHfm) or visit [21st.dev/magic](https://21st.dev/magic).
