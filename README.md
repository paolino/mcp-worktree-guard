# mcp-worktree-guard

MCP server enforcing git worktree-per-branch workflow.

Prevents code changes in the main worktree, ensuring all development happens in dedicated worktrees.

## Tools

| Tool | Purpose |
|------|---------|
| `detect-worktree` | Detect if path is main worktree, branch worktree, or not a repo |
| `guard-file` | Check if file modification is allowed (blocks main worktree) |
| `list-worktrees` | List all worktrees for repository |
| `create-worktree` | Create new worktree for issue/feature branch |

## Usage

### detect-worktree

```json
{
  "path": "/code/my-project"
}
```

Returns:
```json
{
  "type": "main",
  "path": "/code/my-project",
  "branch": "main",
  "mainWorktreePath": "/code/my-project"
}
```

### guard-file

```json
{
  "filePath": "/code/my-project/src/main.ts"
}
```

Returns:
```json
{
  "filePath": "/code/my-project/src/main.ts",
  "allowed": false,
  "worktree": {
    "type": "main",
    "path": "/code/my-project"
  },
  "report": {
    "allPassed": false,
    "guards": [{
      "name": "main-worktree",
      "passed": false,
      "message": "Path is in the main worktree. Create a worktree first.",
      "details": {
        "suggestion": "git worktree add /code/my-project-issue-N branch-name"
      }
    }]
  }
}
```

### list-worktrees

```json
{
  "path": "/code/my-project"
}
```

Returns list of all worktrees with their branch and status.

### create-worktree

```json
{
  "repoPath": "/code/my-project",
  "branchName": "fix/some-bug",
  "issueNumber": 42
}
```

Creates `/code/my-project-issue-42` with branch `fix/some-bug`.

## Installation

```bash
npm install
npm run build
```

## Development

```bash
just build    # Build TypeScript
just test     # Run tests
just CI       # Full CI pipeline
```

## Detection Logic

- **Main worktree**: `.git/` is a directory
- **Branch worktree**: `.git` is a file containing `gitdir: /path/to/main/.git/worktrees/<name>`

## License

MIT
