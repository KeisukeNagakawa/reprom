# askify

**askify** is a command-line tool (CLI) that exports a specified directory structure and file contents into a single Markdown file. This makes it easy to share code with AI tools (e.g., ChatGPT) without manually copying and pasting multiple files.

## Features

- **Directory Tree**: Generate a tree-like directory overview, similar to the `tree` command.
- **File Contents**: Gather the contents of all target files into one Markdown.
- **Flexible Pre/Post Text**: Insert custom text (e.g., instructions, questions) at the beginning or end of the output.
- **Multiple Configurations**: Manage multiple sets of configuration in one YAML file.
- **Usage Statistics**: Display the total character count of the generated Markdown.
- **Clipboard or File Output**: Choose to export to a `.md` file or copy the Markdown directly to your clipboard.

## Installation

If you would like to use **askify** within an existing project (as a devDependency):

```bash
npm install --save-dev askify
```

Or with Yarn:

```bash
yarn add --dev askify
```

## Usage

### 1. Create a Configuration File

In your project root (or another directory), create a YAML file, e.g. `askify.config.yaml`, defining one or more configurations. Each configuration is an object in the `configs` array:

```yaml
configs:
  - name: "sample"
    preText: |
      This is a sample configuration output. Below is the project's structure.
    postText: |
      That concludes the sample configuration output.
      Let me know if you have any questions.
    targets:
      include:
        - "packages/core"
        - "packages/utils"
      exclude:
        - "packages/core/dist"
        - "**/node_modules"
      filePatterns:
        - "**/*.ts"
        - "**/*.js"
    tree:
      maxDepth: 5
      directoriesOnly: false
    output: "file"

  - name: "review"
    preText: |
      This is the review configuration. Please review the code in the listed directories below.
    postText: |
      Thank you for reviewing the code!
    targets:
      include:
        - "apps/www"
      exclude:
        - "apps/www/node_modules"
      filePatterns:
        - "**/*.vue"
        - "**/*.js"
        - "**/*.ts"
    tree:
      maxDepth: 10
      directoriesOnly: false
    output: "clipboard"
```

**Key Fields**:

- `name`: An identifier used when running `askify`.
- `preText` / `postText`: Text to insert at the start/end of the generated Markdown.
- `targets`: Defines which paths and file patterns are included/excluded.
  - `include`: Paths or directories to include.
  - `exclude`: Paths or directories to exclude.
  - `filePatterns`: Glob patterns (e.g., `**/*.ts`) to further limit which files are included.
- `tree`: Options for the directory structure:
  - `maxDepth`: How many levels deep the tree should display.
  - `directoriesOnly`: If true, shows only directories in the tree.
- `output`: Either `"file"` (writes to a Markdown file) or `"clipboard"` (copies the Markdown text to your system clipboard).

### 2. Run the CLI

In a terminal:

```bash
npx askify --config=askify.config.yaml --name=sample
```

- **`--config`**: Path to the YAML config file (default: `askify.config.yaml`).
- **`--name`**: Which configuration (by `name`) to use within that YAML.

Depending on the configuration:

- If `output` is `"file"`, a Markdown file (e.g., `askify-sample.md`) is generated.
- If `output` is `"clipboard"`, the generated Markdown is directly copied to your clipboard (and no `.md` file is created).

### 3. Script Shortcut in `package.json`

If you prefer not to type the same CLI flags repeatedly, you can add scripts to your `package.json`:

```jsonc
{
  "scripts": {
    "export:sample": "askify --config=askify.config.yaml --name=sample",
    "export:review": "askify --config=askify.config.yaml --name=review"
  }
}
```

Then simply run:

```bash
npm run export:sample
```

(or `yarn export:sample`) to generate the Markdown.

## Example Output

When `askify` runs, it creates a single Markdown output (or copies it to the clipboard) with the following structure:

1. **Pre-Text** (from the config’s `preText` field)
2. **Directory Structure** (similar to the `tree` command)
3. **File Contents** (one big Markdown file containing each file’s content)
4. **Post-Text** (from `postText`)
5. **Total Character Count** (appended at the very end of the output in the console logs)

Here is a brief illustration:

```markdown
(This is your preText.)

# Directory Structure
```

```
packages
├── core
│   ├── index.ts
│   └── ...
├── utils
│   └── ...
└── ...
```

````
# File Contents

## packages/core/index.ts
```ts
// content from index.ts
```
````

(Any additional files in the same manner)

(This is your postText.)

## Developper

Keisuke Nagakawa

## License

(MIT or other license text)

```

---

## License

Use the [MIT License](./LICENSE) or any other license of your choice. Be sure to include a `LICENSE` file if you plan to publish to npm publicly.

## Contributing

- Feel free to open issues or submit pull requests if you find bugs or want to propose features.
- Enjoy efficient sharing of code with AI tools!

---

**askify**: Simplify your code-sharing workflow with a single command.
```
