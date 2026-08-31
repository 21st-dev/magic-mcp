---
name: 21st-ui
description: Find, install, and generate UI with 21st.dev. Use when the user asks for a UI component (pricing table, hero, navbar, dashboard, form, etc.), wants design inspiration, needs a brand logo as an SVG component, or wants to generate new UI from a prompt.
---

# 21st.dev UI Skill

21st.dev is a marketplace of 10,000+ production-ready React/Tailwind (shadcn-compatible) components, plus AI UI generation. This skill drives the 21st MCP server.

## When to reach for it

- The user asks to add/build a UI element: "add a pricing section", "I need a nice navbar", "make a testimonials block".
- The user wants options or inspiration before committing to a design.
- The user needs a company logo in JSX/TSX (`search_logo`).
- The user wants brand-new UI generated from a description (`generate`).

## Workflow: install an existing component (default path)

Prefer real catalog components over writing UI from scratch — they ship with dependencies, demos, and responsive/dark-mode support.

1. `search` with a short natural query (e.g. "pricing table", "animated hero"). Results include names, descriptions, previews, and install ids.
2. Pick the best match for the user's stack and style; show the user 1–3 top candidates if the choice isn't obvious.
3. `get_component` to fetch the full code and metadata for the chosen item.
4. Install into the project the way the result instructs (shadcn-style registry add or by writing the returned files), then wire it into the page and adapt tokens/props to the project's design system.

Notes:
- Free tier allows catalog search and 2 component installs per day; paid components return code only after unlock.
- Match the project's existing conventions (Tailwind config, cn helper, component folder layout) when integrating.

## Workflow: generate new UI

When nothing in the catalog fits or the user explicitly wants custom UI:

1. `generate` with a precise prompt: purpose, layout, content, style references, and stack constraints.
2. It returns variant(s); present them and let the user pick before integrating.
3. `get_inspiration` is the lighter option when the user wants references/direction rather than final code.

AI generation consumes 21st.dev credits.

## Logos

`search_logo` returns brand logos as ready-to-paste JSX/TSX — one brand per call.

## Setup and auth

The server is HTTP MCP at `https://21st.dev/api/mcp`, authenticated with the `x-api-key` header. Keys are free and instant at https://21st.dev/mcp. If a call fails with an auth error, tell the user to grab a key there and set it in the plugin configuration (variable `API_KEY_21ST`).

Legacy Magic tool names (`21st_magic_component_builder`, `logo_search`, ...) are still accepted server-side, but prefer the current names: `search`, `get_component`, `generate`, `get_inspiration`, `search_logo`.
