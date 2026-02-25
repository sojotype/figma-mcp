# Architecture

## Overview

```
Cursor (agent)  →  MCP client  →  MCP server (Next.js)  →  HTTP POST  →  PartyKit (room = sessionId)
                                                                              ↓
Figma plugin  ←  WebSocket  ←  same PartyKit room
     ↓
Figma Plugin API (figma.*)
```

- **Session (room)**: User opens the plugin → plugin generates a room ID (e.g. prefixed with `room-`) and connects to PartyKit at `wss://…/party/{roomId}`. The MCP server is configured with a URL that includes a query parameter `userIds` (one or more Figma user IDs). Identity is the Figma user; no separate auth.
- **Tool call**: Agent calls an MCP tool → MCP server forwards the request to PartyKit (HTTP POST with `commandId`, `tool`, `args`, `secret`) to the appropriate room → PartyKit pushes the command to the plugin → plugin runs `dispatch(tool, args)` and replies → result returns to the agent.

## Identity and session flow

- **No separate authentication.** The user adds the MCP server in the client (e.g. Cursor) by pasting a URL that includes `userIds=<figmaUserId>` (or several, e.g. `userIds=id1;id2`). The plugin UI shows this config in two variants: local (e.g. `http://localhost:3000/mcp?userIds=...`) and remote.
- **Plugin on connect**: Sends to PartyKit the current **Figma user id**, **file id** (fileKey), **file name**, and **user name** (`figma.currentUser.name`). PartyKit stores `userId → [sessions]`; each session has `roomId`, `fileName`, `userName`. If this user already has another active session, PartyKit tells the plugin; the plugin then shows the **room ID** (with `room-` prefix) and a copy button. Otherwise the plugin does not show a room ID.
- **MCP**: Reads `userIds` from the request (URL query). When a tool is invoked without a session ID, MCP asks PartyKit for active sessions for those userIds and either routes to the single session, or returns a structured list so the agent can ask the user to choose (or the user pastes a `room-...` id in chat; the agent treats that as the session target).

## Session selection behavior

- **0 sessions**: Tool invocation without session ID fails with a clear error: no active plugin sessions for the given user(s); user should open the plugin in a Figma file.
- **1 session** (across the given users): MCP uses that session automatically; no room ID needed in chat.
- **Multiple sessions (one user)**: MCP returns a structured list of sessions with `roomId`, `fileName`, `userName`. The agent prompts the user to choose; the user can also paste a `room-...` id in chat.
- **Multiple users with sessions**: MCP returns a list of users (with names) and their sessions (with file names). The agent prompts to choose user and then session (or paste `room-...`).
- **Explicit session**: If the user pastes a message starting with `room-`, the agent uses it as the session ID for subsequent tool calls.

## Components

| Part | Role |
|------|------|
| **api** | Shared package: Zod schemas for utilitarian tools, derived types; generated comment-free Figma Plugin API types for agent context (`plugin-api.agent.d.ts`). |
| **plugin** | Figma iframe + backend (main thread). Backend: WebSocket to PartyKit, `dispatch(tool, args)` to Figma API or declarative handlers. Uses api for tool spec. |
| **websocket** | PartyKit server. One room per session ID. Accepts plugin WebSocket connections; accepts HTTP POST from MCP server to send commands and wait for plugin response. |
| **mcp-server** | Next.js app with MCP route (mcp-handler). Exposes tools; when a tool is invoked, calls PartyKit HTTP API with session ID. Uses api for tool schemas. |

## Data flow (one tool call)

1. Agent invokes tool (with optional session/room ID in args or context; or MCP resolves it from `userIds` via PartyKit).
2. MCP server validates input, then POSTs to PartyKit: `{ commandId, tool, args, secret }`, with room = resolved roomId.
3. PartyKit sends `{ commandId, tool, args }` to the plugin over WebSocket.
4. Plugin `dispatch(tool, args)` → Figma API or composite handler → serializable result.
5. Plugin sends `{ commandId, result }` or `{ commandId, error }` back over WebSocket.
6. PartyKit resolves the pending request; MCP server returns the result to the agent.

## Tool layers

- **Utilitarian**: One tool ≈ one Figma Plugin API method. Schemas and types live in the [api](packages/api.md) package (see [2025-02-22-utilitarian-tools-source-of-truth](decisions/2025-02-22-utilitarian-tools-source-of-truth.md)). MCP and plugin both depend on api.
- **Declarative**: Higher-level tools (e.g. "create frame tree with auto-layout") implemented in the plugin; may call many API methods internally. Stay in plugin + MCP; api exposes declarative entry points as needed.

## Security

- Bridge: `BRIDGE_SECRET` in PartyKit env; MCP server must send it in POST body. No per-user auth in MVP.
