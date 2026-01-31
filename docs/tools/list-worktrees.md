# list-worktrees

List all worktrees for the repository containing the given path.

## Input

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `path` | string | Yes | Path inside the repository |

## Output

| Field | Type | Description |
|-------|------|-------------|
| `repoRoot` | string | Root path of the repository |
| `worktrees` | array | List of worktree entries |

### Worktree Entry

| Field | Type | Description |
|-------|------|-------------|
| `path` | string | Absolute path to the worktree |
| `head` | string | HEAD commit SHA |
| `branch` | string? | Branch name (null if detached) |
| `isMain` | boolean | Whether this is the main worktree |
| `isDetached` | boolean | Whether HEAD is detached |
| `isBare` | boolean | Whether the worktree is bare |
| `isLocked` | boolean | Whether the worktree is locked |
| `isPrunable` | boolean | Whether the worktree is prunable |

## Example

```json
// Input
{ "path": "/code/my-project" }

// Output
{
  "repoRoot": "/code/my-project",
  "worktrees": [
    {
      "path": "/code/my-project",
      "head": "abc123def456",
      "branch": "main",
      "isMain": true,
      "isDetached": false,
      "isBare": false,
      "isLocked": false,
      "isPrunable": false
    },
    {
      "path": "/code/my-project-issue-42",
      "head": "def789abc012",
      "branch": "fix/some-bug",
      "isMain": false,
      "isDetached": false,
      "isBare": false,
      "isLocked": false,
      "isPrunable": false
    }
  ]
}
```

## Notes

- The main worktree is always listed first
- Works from any path inside the repository (including subdirectories and branch worktrees)
- Uses `git worktree list --porcelain` internally
