# mcp-worktree-guard

MCP server enforcing git worktree-per-branch workflow.

## Overview

This MCP server prevents code changes in the main worktree, ensuring all development happens in dedicated worktrees. This workflow:

- Keeps the main repo always on `main` branch
- Enables parallel development by multiple agents
- Prevents accidental commits to wrong branches
- Makes it easy to switch between tasks

## Quick Start

Configure in your MCP settings:

```json
{
  "mcpServers": {
    "worktree-guard": {
      "command": "node",
      "args": ["/path/to/mcp-worktree-guard/dist/index.js"]
    }
  }
}
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

1. Keep main repo always on `main` branch
2. For each issue/feature, create a dedicated worktree:
   ```bash
   git worktree add ../repo-issue-42 fix/some-bug
   ```
3. Work in the worktree directory
4. When done, merge PR and remove worktree:
   ```bash
   git worktree remove ../repo-issue-42
   ```
