# detect-worktree

Detect if a path is in the main worktree, a branch worktree, or not a git repository.

## Input

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `path` | string | Yes | Path to check (file or directory) |

## Output

| Field | Type | Description |
|-------|------|-------------|
| `type` | string | One of: `main`, `branch`, `not-a-repo` |
| `path` | string | Resolved absolute path |
| `branch` | string? | Current branch name (null if detached) |
| `mainWorktreePath` | string? | Path to the main worktree |

## Examples

### Main worktree

```json
// Input
{ "path": "/code/my-project" }

// Output
{
  "type": "main",
  "path": "/code/my-project",
  "branch": "main",
  "mainWorktreePath": "/code/my-project"
}
```

### Branch worktree

```json
// Input
{ "path": "/code/my-project-issue-42" }

// Output
{
  "type": "branch",
  "path": "/code/my-project-issue-42",
  "branch": "fix/some-bug",
  "mainWorktreePath": "/code/my-project"
}
```

### Not a git repository

```json
// Input
{ "path": "/tmp/some-dir" }

// Output
{
  "type": "not-a-repo",
  "path": "/tmp/some-dir"
}
```

## Detection Logic

The tool determines worktree type by examining the `.git` entry at the repository root:

- **Main worktree**: `.git` is a directory containing the repository data
- **Branch worktree**: `.git` is a file containing a `gitdir:` pointer to the main repo
