import { useCallback, useEffect, useRef } from "react";
import { WYSIWYGEditor as Editor } from "wysiwyg-editor";
import "wysiwyg-editor/dist/wysiwyg-editor.css";

/**
 * React wrapper for the WYSIWYG Editor.
 *
 * @param {object} props
 * @param {string[]}  [props.toolbar]        - toolbar items (action names or '|' for separator)
 * @param {string}    [props.placeholder]    - placeholder text
 * @param {string}    [props.initialContent] - initial HTML content
 * @param {number}    [props.minHeight]      - minimum editor height in px
 * @param {function}  [props.onChange]        - called with HTML string on every change
 * @param {function}  [props.onReady]        - called with the editor instance after mount
 * @param {string}    [props.className]      - additional CSS class for the container
 */
export default function WYSIWYGEditor({
  toolbar,
  placeholder,
  initialContent,
  minHeight,
  onChange,
  onReady,
  className,
}) {
  const containerRef = useRef(null);
  const editorRef = useRef(null);

  // Stable callback ref so the editor doesn't re-create on every render
  const onChangeRef = useRef(onChange);
  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  const handleChange = useCallback((html) => {
    onChangeRef.current?.(html);
  }, []);

  useEffect(() => {
    if (!containerRef.current) return;

    const instance = new Editor(containerRef.current, {
      ...(toolbar && { toolbar }),
      ...(placeholder && { placeholder }),
      ...(initialContent && { initialContent }),
      ...(minHeight && { minHeight }),
      onChange: handleChange,
    });

    editorRef.current = instance;
    onReady?.(instance);

    return () => {
      instance.destroy();
      editorRef.current = null;
    };
    // Only re-create if structural props change
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [toolbar, placeholder, minHeight]);

  return <div ref={containerRef} className={className} />;
}
