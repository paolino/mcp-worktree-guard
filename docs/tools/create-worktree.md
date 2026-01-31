# create-worktree

Create a new worktree for an issue or feature branch.

## Input

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `repoPath` | string | Yes | Path inside the repository |
| `branchName` | string | Yes | Name of the branch to create or checkout |
| `worktreePath` | string | No | Path for the new worktree (defaults to sibling directory) |
| `issueNumber` | number | No | Issue number to include in worktree directory name |
| `baseBranch` | string | No | Base branch for new branches (defaults to current branch) |

## Output

| Field | Type | Description |
|-------|------|-------------|
| `worktreePath` | string | Path where the worktree was created |
| `branchName` | string | Name of the branch |
| `created` | boolean | Whether the worktree was created (false if already exists) |
| `branchExisted` | boolean | Whether the branch existed before |
| `message` | string | Human-readable status message |

## Examples

### Create with issue number

```json
// Input
{
  "repoPath": "/code/my-project",
  "branchName": "fix/login-error",
  "issueNumber": 42
}

// Output
{
  "worktreePath": "/code/my-project-issue-42",
  "branchName": "fix/login-error",
  "created": true,
  "branchExisted": false,
  "message": "Created worktree with new branch 'fix/login-error'"
}
```

### Checkout existing branch

```json
// Input
{
  "repoPath": "/code/my-project",
  "branchName": "feature/existing-feature"
}

// Output
{
  "worktreePath": "/code/my-project-feature-existing-feature",
  "branchName": "feature/existing-feature",
  "created": true,
  "branchExisted": true,
  "message": "Created worktree for existing branch 'feature/existing-feature'"
}
```

### Custom worktree path

```json
// Input
{
  "repoPath": "/code/my-project",
  "branchName": "refactor/cleanup",
  "worktreePath": "/work/cleanup-task"
}

// Output
{
  "worktreePath": "/work/cleanup-task",
  "branchName": "refactor/cleanup",
  "created": true,
  "branchExisted": false,
  "message": "Created worktree with new branch 'refactor/cleanup'"
}
```

## Behavior

- If `branchName` exists: checks out the existing branch
- If `branchName` doesn't exist: creates a new branch from `baseBranch` (or current branch)
- If `worktreePath` not specified: creates sibling directory named `{repo}-issue-{N}` or `{repo}-{branch}`
- If worktree already exists at path: returns without creating
