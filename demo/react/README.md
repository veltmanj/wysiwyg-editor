# React Demo

## Quick Start

```bash
# From a new or existing React project:
npm install ../../          # local link – or: npm install wysiwyg-editor

# Copy the wrapper and demo into your src/ folder:
cp WYSIWYGEditor.jsx App.jsx /path/to/your-app/src/

npm start
```

## Files

| File                | Purpose                                                        |
| ------------------- | -------------------------------------------------------------- |
| `WYSIWYGEditor.jsx` | Reusable React wrapper component — drop this into your project |
| `App.jsx`           | Demo app showing full toolbar, minimal toolbar, and API usage  |

## Usage

```jsx
import WYSIWYGEditor from "./WYSIWYGEditor";

function MyPage() {
  return (
    <WYSIWYGEditor
      toolbar={["bold", "italic", "|", "heading", "fontFamily", "fontSize"]}
      placeholder="Write something…"
      minHeight={200}
      onChange={(html) => console.log(html)}
      onReady={(editor) => {
        /* hold a ref to the editor instance */
      }}
    />
  );
}
```

## Props

| Prop             | Type       | Description                                          |
| ---------------- | ---------- | ---------------------------------------------------- | ----------------- |
| `toolbar`        | `string[]` | Toolbar action names (`'                             | '` for separator) |
| `placeholder`    | `string`   | Placeholder text                                     |
| `initialContent` | `string`   | Initial HTML content                                 |
| `minHeight`      | `number`   | Minimum editor height in px                          |
| `onChange`       | `function` | Called with the HTML string on every content change  |
| `onReady`        | `function` | Called with the `WYSIWYGEditor` instance after mount |
| `className`      | `string`   | Additional CSS class name for the container `<div>`  |
