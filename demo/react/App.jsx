import { useState } from "react";
import WYSIWYGEditor from "./WYSIWYGEditor";

/**
 * Demo application showing the WYSIWYG Editor in a React app.
 *
 * Quick start:
 *   npx create-react-app my-app
 *   cd my-app
 *   npm install ../../          # or: npm install wysiwyg-editor
 *   # copy WYSIWYGEditor.jsx and App.jsx into src/
 *   npm start
 */
export default function App() {
  const [html, setHtml] = useState("");
  const [editorInstance, setEditorInstance] = useState(null);

  return (
    <div
      style={{ maxWidth: 900, margin: "32px auto", fontFamily: "sans-serif" }}
    >
      <h1>WYSIWYG Editor – React Demo</h1>
      <p style={{ color: "#555", marginBottom: 24 }}>
        A rich text editor with a fully configurable toolbar.
      </p>

      {/* ---- Full toolbar (default) ---- */}
      <WYSIWYGEditor
        placeholder="Start typing your document…"
        minHeight={250}
        onChange={setHtml}
        onReady={setEditorInstance}
      />

      {/* ---- Minimal toolbar ---- */}
      <h3 style={{ marginTop: 32, marginBottom: 8 }}>Minimal toolbar</h3>
      <WYSIWYGEditor
        toolbar={[
          "bold",
          "italic",
          "underline",
          "|",
          "orderedList",
          "unorderedList",
        ]}
        placeholder="Simple mode…"
        minHeight={120}
      />

      {/* ---- HTML output ---- */}
      <h3 style={{ marginTop: 32, marginBottom: 8 }}>HTML Output</h3>
      <pre
        style={{
          background: "#1e1e1e",
          color: "#d4d4d4",
          padding: 16,
          borderRadius: 6,
          fontSize: 13,
          maxHeight: 300,
          overflow: "auto",
        }}
      >
        {html || "(start typing…)"}
      </pre>

      {/* ---- API demo ---- */}
      <div style={{ marginTop: 16, display: "flex", gap: 8 }}>
        <button
          onClick={() =>
            editorInstance?.setHTML("<p>Hello from <b>React</b>!</p>")
          }
        >
          Set content
        </button>
        <button onClick={() => editorInstance?.clear()}>Clear</button>
        <button onClick={() => alert(editorInstance?.getText())}>
          Get text
        </button>
      </div>
    </div>
  );
}
