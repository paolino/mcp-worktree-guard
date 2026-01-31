# shellcheck shell=bash

set unstable := true

# List available recipes
default:
    @just --list

# Install dependencies
install:
    #!/usr/bin/env bash
    set -euo pipefail
    npm install

# Build the project
build:
    #!/usr/bin/env bash
    set -euo pipefail
    npm run build

# Clean build artifacts
clean:
    #!/usr/bin/env bash
    set -euo pipefail
    npm run clean

# Run tests
test:
    #!/usr/bin/env bash
    set -euo pipefail
    npm test

# Run the server
run:
    #!/usr/bin/env bash
    set -euo pipefail
    node dist/index.js

# Format code
format:
    #!/usr/bin/env bash
    set -euo pipefail
    npx prettier --write "src/**/*.ts" "test/**/*.ts"

# Lint code
lint:
    #!/usr/bin/env bash
    set -euo pipefail
    npx tsc --noEmit

# Full CI pipeline
CI:
    #!/usr/bin/env bash
    set -euo pipefail
    just build
    just test
    just lint

# Serve documentation locally
serve-docs:
    #!/usr/bin/env bash
    set -euo pipefail
    mkdocs serve

# Build documentation
build-docs:
    #!/usr/bin/env bash
    set -euo pipefail
    mkdocs build
