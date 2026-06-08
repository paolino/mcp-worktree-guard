# create-worktree

Create a new worktree for an issue or feature branch.

## Input

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `repoPath` | string | Yes | Path inside the repository |
| `branchName` | string | Yes | Name of the branch to create or checkout |
| `worktreePath` | string | No | Path for the new worktree (default: beside the primary worktree in a bare+worktrees layout, else a sibling directory) |
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

### Bare + worktrees layout

When called from a worktree of a bare repository (the common git dir is a
`.bare` directory), the default lands beside the primary worktree, inside the
container, named after the branch.

```json
// Input — repoPath points into /code/my-project/main, where
// /code/my-project/.bare is the bare repo
{
  "repoPath": "/code/my-project/main",
  "branchName": "fix/login-error"
}

// Output
{
  "worktreePath": "/code/my-project/fix-login-error",
  "branchName": "fix/login-error",
  "created": true,
  "branchExisted": false,
  "message": "Created worktree with new branch 'fix/login-error'"
}
```

## Behavior

- If `branchName` exists: checks out the existing branch
- If `branchName` doesn't exist: creates a new branch from `baseBranch` (or current branch)
- If `worktreePath` not specified, the default is layout-aware:
  - **Bare + worktrees layout** (the common git dir is a `.bare` directory): creates `{container}/{branch}` beside the primary worktree, where `{branch}` has `/` flattened to `-`. `issueNumber` does not affect the folder name here.
  - **Flat clone** (otherwise): creates a sibling directory named `{repo}-issue-{N}` or `{repo}-{branch}` (unchanged).
- If worktree already exists at path: returns without creating
