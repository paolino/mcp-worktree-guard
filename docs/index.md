# mcp-worktree-guard

MCP server enforcing git worktree-per-branch workflow.

## Why?

When working with AI coding assistants, it's easy to accidentally make changes in the wrong branch or directly on main. This MCP server:

- Blocks file modifications in the main worktree
- Encourages creating dedicated worktrees for each task
- Enables parallel development without branch conflicts

## Installation

### Claude Code

Add to `~/.claude/settings.json`:

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

### From Source

```bash
git clone https://github.com/paolino/mcp-worktree-guard
cd mcp-worktree-guard
npm install && npm run build
```

Then add to `~/.claude/settings.json`:

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

### With Nix

```bash
nix run github:paolino/mcp-worktree-guard
```

## Tools

| Tool | Purpose |
|------|---------|
| [detect-worktree](tools/detect-worktree.md) | Detect worktree type for a path |
| [guard-file](tools/guard-file.md) | Check if file modification is allowed |
| [list-worktrees](tools/list-worktrees.md) | List all worktrees for repository |
| [create-worktree](tools/create-worktree.md) | Create new worktree for a branch |

## Worktree Types

- **main**: The original repository clone where `.git/` is a directory
- **branch**: A linked worktree where `.git` is a file pointing to the main repo
- **not-a-repo**: Path is not inside a git repository

## Recommended Workflow

1. Keep main repo on `main` branch (never switch)
2. For each issue, create a worktree:
   ```bash
   git worktree add ../repo-issue-42 -b fix/some-bug
   ```
3. Work in the worktree directory
4. Create PR and merge
5. Clean up:
   ```bash
   git worktree remove ../repo-issue-42
   ```
