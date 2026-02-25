# ADR: Figma userId–based session flow (no separate auth)

**Status:** Accepted  
**Date:** 2026-02-23

## Context

- An earlier design used email/Figma OAuth and a shared user token (Appwrite), which required Docker for local dev and added significant complexity.
- We want minimal infrastructure: no auth server, no database for users. Identity is the Figma user.

## Decision

- **No separate authentication.** The MCP server is added by URL; the URL includes a query parameter with one or more **Figma user IDs** (`figma.currentUser.id`). The user copies the config from the plugin and pastes it into the MCP client (e.g. Cursor).
- **Plugin** connects to PartyKit and sends on connect: **current user id**, **file id** (fileKey), **file name**, and **user name** (`figma.currentUser.name`) so the agent can show human-readable labels. PartyKit stores `userId → [sessions]`; each session has `roomId`, `fileName`, `userName`, etc. If a user has more than one active session, PartyKit notifies the plugin; the plugin then shows the **room ID** (prefixed with `room-`) and a copy button. The user can paste this into the chat; the agent treats any message starting with `room-` as a session ID and uses it for subsequent tool calls.
- **MCP** reads `userIds` from the request (URL query when the client is configured with that URL). When a tool is invoked **without** a session ID, MCP asks PartyKit for active sessions for those userIds:
  - **0 sessions** → error: no active plugin sessions; user should open the plugin.
  - **1 session** (across all given users) → use that session automatically; user does nothing.
  - **Multiple sessions (one user)** → return a structured list of sessions with `roomId`, `fileName` (and `userName`); agent asks the user to choose; user can also paste a `room-...` id.
  - **Multiple users with sessions** → return a list of users (with names) and their sessions (with file names); agent asks the user to choose user and then session (or paste `room-...`).
- **Room ID** is exposed with a `room-` prefix so the agent can recognize it when the user pastes it in chat and use it as the session target.

## Implications

- No Docker or external auth service for local run. MCP URL is e.g. `http://localhost:3000/mcp?userIds=12345` (local) or `https://mcp.example.com/mcp?userIds=12345;67890` (remote); plugin shows both variants.
- Plugin UI shows MCP config (URL + optional instructions) and, in multi-session mode, the current room ID with a copy button.
- PartyKit is the single source of truth for "which users have which sessions"; MCP only has the list of userIds from the URL and resolves sessions via PartyKit.
