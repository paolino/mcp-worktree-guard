# mcp-worktree-guard

MCP server enforcing git worktree-per-branch workflow.

Prevents code changes in the main worktree, ensuring all development happens in dedicated worktrees.

## Installation

Add to your Claude Code MCP settings (`~/.claude/settings.json`):

```json
{
  "mcpServers": {
    "worktree-guard": {
      "command": "npx",
      "args": ["-y", "mcp-worktree-guard"]
    }
  }
}
```

Or build from source:

```bash
git clone https://github.com/paolino/mcp-worktree-guard
cd mcp-worktree-guard
npm install && npm run build
```

Then configure:

```json
{
  "mcpServers": {
    "worktree-guard": {
      "command": "node",
      "args": ["/path/to/mcp-worktree-guard/dist/src/index.js"]
    }
  }
}
```

## Tools

| Tool | Purpose |
|------|---------|
| `detect-worktree` | Detect if path is main/branch worktree or not a repo |
| `guard-file` | Check if file modification is allowed |
| `list-worktrees` | List all worktrees for repository |
| `create-worktree` | Create new worktree for issue/feature branch |

## License

MIT
