# WYSIWYG Editor

A lightweight, zero-dependency rich text editor component for the browser with a fully configurable toolbar.

## Features

- **Configurable toolbar** — include only the actions you need, in any order
- **Text formatting** — bold, italic, underline, strikethrough, subscript, superscript
- **Font controls** — font family, font size, headings (H1–H6)
- **Colors** — font color and highlight color via native color picker
- **Alignment** — left, center, right, justify
- **Lists & indentation** — ordered/unordered lists, indent/outdent (Tab/Shift+Tab)
- **Inserts** — links, images, horizontal rules, blockquotes, code blocks
- **History** — undo/redo
- **Utilities** — remove formatting, print
- **Status bar** — live word and character count
- **No runtime dependencies** — only dev dependencies for the build step

## Installation

```bash
npm install wysiwyg-editor
```

Or with yarn:

```bash
yarn add wysiwyg-editor
```

### CDN / Script Tag

Use the UMD build directly in the browser:

```html
<link
  rel="stylesheet"
  href="node_modules/wysiwyg-editor/dist/wysiwyg-editor.css"
/>
<script src="node_modules/wysiwyg-editor/dist/wysiwyg-editor.umd.js"></script>
<script>
  const editor = new WYSIWYGEditor.WYSIWYGEditor("#editor");
</script>
```

### ES Module

```js
import { WYSIWYGEditor } from "wysiwyg-editor";
import "wysiwyg-editor/dist/wysiwyg-editor.css";

const editor = new WYSIWYGEditor("#editor");
```

## Quick Start

```html
<div id="editor"></div>

<script type="module">
  import { WYSIWYGEditor } from "wysiwyg-editor";

  const editor = new WYSIWYGEditor("#editor", {
    placeholder: "Start typing…",
    onChange: (html) => console.log(html),
  });
</script>
```

## Configuration

Pass an options object as the second argument to the constructor:

```js
const editor = new WYSIWYGEditor("#editor", {
  toolbar: [
    "bold",
    "italic",
    "underline",
    "|",
    "heading",
    "fontFamily",
    "fontSize",
  ],
  placeholder: "Write something…",
  initialContent: "<p>Hello world</p>",
  minHeight: 300,
  onChange: (html) => saveToServer(html),
});
```

### Options

| Option           | Type       | Default     | Description                                                          |
| ---------------- | ---------- | ----------- | -------------------------------------------------------------------- |
| `toolbar`        | `string[]` | all actions | Toolbar items to display (action names or `'\|'` for separator)      |
| `placeholder`    | `string`   | `''`        | Placeholder text shown when the editor is empty                      |
| `initialContent` | `string`   | `''`        | Initial HTML content                                                 |
| `minHeight`      | `number`   | `200`       | Minimum editor height in pixels                                      |
| `onChange`        | `function` | `null`      | Callback invoked with the HTML string on every change                |

### Toolbar Actions

Use these names in the `toolbar` array. Add `'|'` between items to insert a separator.

**Text formatting:**

`bold` · `italic` · `underline` · `strikethrough` · `subscript` · `superscript`

**Headings & fonts:**

`heading` · `fontFamily` · `fontSize`

**Colors:**

`fontColor` · `highlight`

**Alignment:**

`alignLeft` · `alignCenter` · `alignRight` · `alignJustify`

**Lists & indentation:**

`orderedList` · `unorderedList` · `indent` · `outdent`

**Inserts:**

`link` · `image` · `horizontalRule` · `blockquote` · `codeBlock`

**History:**

`undo` · `redo`

**Utilities:**

`removeFormat` · `print`

### Example: Minimal Toolbar

```js
new WYSIWYGEditor("#editor", {
  toolbar: ["bold", "italic", "|", "orderedList", "unorderedList"],
});
```

### Example: Document-Style Toolbar

```js
new WYSIWYGEditor("#editor", {
  toolbar: [
    "heading",
    "fontFamily",
    "fontSize",
    "|",
    "bold",
    "italic",
    "underline",
    "fontColor",
    "|",
    "alignLeft",
    "alignCenter",
    "alignRight",
    "|",
    "orderedList",
    "unorderedList",
    "|",
    "link",
    "image",
    "blockquote",
    "|",
    "undo",
    "redo",
  ],
});
```

## API

| Method                       | Returns   | Description                                              |
| ---------------------------- | --------- | -------------------------------------------------------- |
| `getHTML()`                  | `string`  | Get the editor content as HTML                           |
| `setHTML(html)`              | `void`    | Replace the editor content with the given HTML           |
| `getText()`                  | `string`  | Get the editor content as plain text                     |
| `clear()`                    | `void`    | Clear all editor content                                 |
| `focus()`                    | `void`    | Focus the editor                                         |
| `exec(command, value?)`      | `void`    | Execute a document command (e.g. `'bold'`, `'fontSize'`) |
| `queryCommandState(command)` | `boolean` | Check if a command is active (e.g. is text bold?)        |
| `queryCommandValue(command)` | `string`  | Get the current value of a command (e.g. font name)      |
| `destroy()`                  | `void`    | Remove the editor from the DOM and clean up              |

## Framework Integration

### Angular

A fully scaffolded Angular application is available in the `editor/` folder. It includes a reusable `WYSIWYGEditorComponent` wrapper. See [editor/](editor/) to run it, or [demo/angular/](demo/angular/) for standalone component files and usage instructions.

```bash
cd editor
npm install
./node_modules/.bin/ng serve
```

### React

A reusable React wrapper component is in [demo/react/](demo/react/). Copy `WYSIWYGEditor.jsx` into your project:

```jsx
import WYSIWYGEditor from "./WYSIWYGEditor";

function App() {
  return (
    <WYSIWYGEditor
      toolbar={["bold", "italic", "|", "heading", "fontSize"]}
      placeholder="Write here…"
      onChange={(html) => console.log(html)}
    />
  );
}
```

### Vanilla HTML

Open [demo/index.html](demo/index.html) in a browser (serve via a local HTTP server):

```bash
npx serve demo
```

## Project Structure

```
WYSIWYG-Editor/
  src/
    index.js       – entry point (exports + CSS import)
    editor.js      – WYSIWYGEditor class
    toolbar.js     – Toolbar rendering and state management
    actions.js     – action registry (all toolbar items)
    styles.css     – editor styles
  dist/            – built output
    wysiwyg-editor.js      – ES module
    wysiwyg-editor.umd.js  – UMD bundle (for script tags)
    wysiwyg-editor.min.js  – minified ES module
    wysiwyg-editor.css     – extracted stylesheet
  demo/
    index.html     – vanilla HTML demo
    angular/       – Angular wrapper component + demo
    react/         – React wrapper component + demo
  editor/          – fully scaffolded Angular application
  rollup.config.js – build configuration
```

## Building from Source

```bash
npm install
npm run build
```

This produces the `dist/` folder with ES, UMD, and minified bundles plus the extracted CSS.

To rebuild on file changes:

```bash
npm run dev
```

## License

ISC
