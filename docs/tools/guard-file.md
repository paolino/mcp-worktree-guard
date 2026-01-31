# guard-file

Check if a file modification is allowed. Blocks changes in the main worktree.

## Input

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `filePath` | string | Yes | Path to the file being modified |

## Output

| Field | Type | Description |
|-------|------|-------------|
| `filePath` | string | The file path that was checked |
| `allowed` | boolean | Whether the modification is allowed |
| `worktree` | object | Worktree information |
| `report` | object | Detailed guard results |

### Worktree Object

| Field | Type | Description |
|-------|------|-------------|
| `type` | string | Worktree type: `main`, `branch`, or `not-a-repo` |
| `path` | string | Repository root path |
| `branch` | string? | Current branch name |

### Report Object

| Field | Type | Description |
|-------|------|-------------|
| `allPassed` | boolean | Whether all guards passed |
| `guards` | array | Individual guard results |

## Examples

### Blocked (main worktree)

```json
// Input
{ "filePath": "/code/my-project/src/main.ts" }

// Output
{
  "filePath": "/code/my-project/src/main.ts",
  "allowed": false,
  "worktree": {
    "type": "main",
    "path": "/code/my-project",
    "branch": "main"
  },
  "report": {
    "allPassed": false,
    "guards": [{
      "name": "main-worktree",
      "passed": false,
      "message": "Path is in the main worktree. Create a worktree first.",
      "details": {
        "worktreePath": "/code/my-project",
        "suggestion": "git worktree add /code/my-project-issue-N branch-name"
      }
    }]
  }
}
```

### Allowed (branch worktree)

```json
// Input
{ "filePath": "/code/my-project-issue-42/src/main.ts" }

// Output
{
  "filePath": "/code/my-project-issue-42/src/main.ts",
  "allowed": true,
  "worktree": {
    "type": "branch",
    "path": "/code/my-project-issue-42",
    "branch": "fix/some-bug"
  },
  "report": {
    "allPassed": true,
    "guards": [{
      "name": "main-worktree",
      "passed": true,
      "message": "Path is in a branch worktree"
    }]
  }
}
```

### Allowed (not a repo)

Files outside git repositories are always allowed.

```json
// Input
{ "filePath": "/tmp/test.txt" }

// Output
{
  "filePath": "/tmp/test.txt",
  "allowed": true,
  "worktree": {
    "type": "not-a-repo",
    "path": "/tmp"
  },
  "report": {
    "allPassed": true,
    "guards": [{
      "name": "main-worktree",
      "passed": true,
      "message": "Path is not in a git repository"
    }]
  }
}
```
