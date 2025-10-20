# TypeScript GitHub Action Template

A modern, production-ready template for building GitHub Actions in TypeScript. This template demonstrates best practices for:

- Using TypeScript and ESM for modern development
- Handling errors and edge cases robustly
- Writing comprehensive, practical tests
- Integrating with the GitHub API using Octokit
- Managing action inputs and outputs
- Auto-generating README documentation from action.yml using action-docs

It includes a simple example that comments on pull requests as
a starting point. This is to showcase something that resembles
a "real" action.

---

## Table of Contents
- [Usage](#usage)
- [Inputs](#inputs)
- [Outputs](#outputs)
- [Examples](#examples)
- [Updating Documentation](#updating-documentation)
- [Contributing](#contributing)
- [License](#license)

---

## Usage

Add the following step to your workflow:

```yaml
- uses: Blackplums/ts-action-template@v1
  with:
    github-token: ${{ secrets.GITHUB_TOKEN }}
```

By default, this template includes an example that comments on pull requests with a summary. Use this as a starting point and modify the logic in `src/index.ts` to suit your needs.

---

## Inputs

<!-- actiondocs-inputs -->
| Input         | Description                    | Required | Default                |
|---------------|-------------------------------|----------|------------------------|
| github-token  | GitHub token for API access    | true     | `${{ github.token }}`  |
<!-- actiondocs-inputs-end -->

---

## Outputs

<!-- actiondocs-outputs -->
| Output      | Description                      |
|-------------|----------------------------------|
| comment-id  | The ID of the created comment    |
<!-- actiondocs-outputs-end -->

---

## Examples

### Basic usage

```yaml
jobs:
  example:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: Blackplums/ts-action-template@v1
        with:
          github-token: ${{ secrets.GITHUB_TOKEN }}
```

### Use the comment ID output (from the example logic)

```yaml
jobs:
  example:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - id: comment
        uses: Blackplums/ts-action-template@v1
        with:
          github-token: ${{ secrets.GITHUB_TOKEN }}
      - run: echo "Comment ID is ${{ steps.comment.outputs.comment-id }}"
```

---

## Updating Documentation

This repository uses [action-docs](https://github.com/nektos/act/tree/master/docs/action-docs) to auto-generate the **Inputs** and **Outputs** tables in this README from `action.yml`.

To update the documentation after changing `action.yml`, run:

```bash
pnpm run docs
```

This will update the relevant sections in the README. Please commit the changes after running this command.

---

## Contributing

Contributions are welcome! Please see [CONTRIBUTING.md](./.github/CONTRIBUTING.md) for guidelines.

## License

[MIT](LICENSE)

---

## What does this template provide?

- **TypeScript/ESM setup**: Ready for modern Node.js and npm
- **GitHub API integration example**: Shows how to use Octokit and context
- **Input/output handling**: Demonstrates how to use action inputs and outputs
- **Comprehensive test examples**: All tests are practical and relevant
- **Error handling best practices**: Handles both Error and non-Error exceptions
- **Auto-generated README documentation**: Keeps documentation in sync with your action.yml

---

## Tooling & Rationale

This template uses a modern, streamlined toolchain for speed, reliability, and maintainability:

- **[Biome](https://biomejs.dev/)**: Used for both linting and formatting. Biome is a fast, all-in-one tool that replaces ESLint and Prettier, with zero-config sensible defaults and instant performance. It ensures code quality and consistency with minimal setup.
- **[ncc](https://github.com/vercel/ncc)**: Used for building the action. ncc compiles TypeScript (and ESM) into a single, optimized JavaScript file, making it the standard for GitHub Actions. It is fast, reliable, and produces minimal, production-ready bundles.
- **[Vitest](https://vitest.dev/)**: Used for testing. Vitest is a modern test runner designed for ESM and TypeScript projects, offering fast, watch-mode testing and excellent TypeScript support.

Other project hygiene choices:
- **.editorconfig** is included and compatible with Biome's defaults for consistent editor behavior.
- All scripts and CI workflows use Biome for linting/formatting, ncc for builds, and Vitest for tests, ensuring consistency and reliability.

See each tool's documentation for more details and advanced configuration options.

## Maintainers
@Blackplums
