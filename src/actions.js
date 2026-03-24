/**
 * Registry of all toolbar actions.
 * Each entry maps a name to { icon, title, type, command?, options?, action? }.
 *
 *   type: 'button' | 'separator' | 'select' | 'color'
 */

const FONT_FAMILIES = [
  'Arial', 'Courier New', 'Georgia', 'Helvetica', 'Lucida Console',
  'Tahoma', 'Times New Roman', 'Trebuchet MS', 'Verdana',
];

const FONT_SIZES = ['1', '2', '3', '4', '5', '6', '7'];

const HEADINGS = [
  { label: 'Normal', value: '' },
  { label: 'Heading 1', value: 'h1' },
  { label: 'Heading 2', value: 'h2' },
  { label: 'Heading 3', value: 'h3' },
  { label: 'Heading 4', value: 'h4' },
  { label: 'Heading 5', value: 'h5' },
  { label: 'Heading 6', value: 'h6' },
];

export const ACTIONS = {
  /* ---- Text formatting ---- */
  bold: { icon: 'B', title: 'Bold (Ctrl+B)', type: 'button', command: 'bold' },
  italic: { icon: 'I', title: 'Italic (Ctrl+I)', type: 'button', command: 'italic' },
  underline: { icon: 'U', title: 'Underline (Ctrl+U)', type: 'button', command: 'underline' },
  strikethrough: { icon: 'S', title: 'Strikethrough', type: 'button', command: 'strikeThrough' },
  subscript: { icon: 'X₂', title: 'Subscript', type: 'button', command: 'subscript' },
  superscript: { icon: 'X²', title: 'Superscript', type: 'button', command: 'superscript' },

  /* ---- Headings / fonts ---- */
  heading: {
    title: 'Heading',
    type: 'select',
    options: HEADINGS.map(h => ({ label: h.label, value: h.value })),
    action(editor, value) {
      if (value) {
        editor.exec('formatBlock', value);
      } else {
        editor.exec('formatBlock', 'div');
      }
    },
  },
  fontFamily: {
    title: 'Font family',
    type: 'select',
    options: FONT_FAMILIES.map(f => ({ label: f, value: f })),
    action(editor, value) { editor.exec('fontName', value); },
  },
  fontSize: {
    title: 'Font size',
    type: 'select',
    options: FONT_SIZES.map(s => ({ label: `Size ${s}`, value: s })),
    action(editor, value) { editor.exec('fontSize', value); },
  },

  /* ---- Colors ---- */
  fontColor: {
    icon: 'A',
    title: 'Font color',
    type: 'color',
    action(editor, value) { editor.exec('foreColor', value); },
  },
  highlight: {
    icon: '🖍',
    title: 'Highlight color',
    type: 'color',
    action(editor, value) { editor.exec('hiliteColor', value); },
  },

  /* ---- Alignment ---- */
  alignLeft: { icon: '⫷', title: 'Align left', type: 'button', command: 'justifyLeft' },
  alignCenter: { icon: '⫸', title: 'Align center', type: 'button', command: 'justifyCenter' },
  alignRight: { icon: '⫸', title: 'Align right', type: 'button', command: 'justifyRight' },
  alignJustify: { icon: '☰', title: 'Justify', type: 'button', command: 'justifyFull' },

  /* ---- Lists ---- */
  orderedList: { icon: '1.', title: 'Ordered list', type: 'button', command: 'insertOrderedList' },
  unorderedList: { icon: '•', title: 'Unordered list', type: 'button', command: 'insertUnorderedList' },

  /* ---- Indentation ---- */
  indent: { icon: '→', title: 'Indent', type: 'button', command: 'indent' },
  outdent: { icon: '←', title: 'Outdent', type: 'button', command: 'outdent' },

  /* ---- Inserts ---- */
  link: {
    icon: '🔗',
    title: 'Insert link',
    type: 'button',
    action(editor) {
      const url = prompt('Enter URL:');
      if (url) editor.exec('createLink', url);
    },
  },
  image: {
    icon: '🖼',
    title: 'Insert image',
    type: 'button',
    action(editor) {
      const url = prompt('Enter image URL:');
      if (url) editor.exec('insertImage', url);
    },
  },
  horizontalRule: { icon: '—', title: 'Horizontal rule', type: 'button', command: 'insertHorizontalRule' },

  /* ---- Block-level ---- */
  blockquote: {
    icon: '"',
    title: 'Blockquote',
    type: 'button',
    command: 'formatBlock',
    action(editor) { editor.exec('formatBlock', 'blockquote'); },
  },
  codeBlock: {
    icon: '</>',
    title: 'Code block',
    type: 'button',
    action(editor) { editor.exec('formatBlock', 'pre'); },
  },

  /* ---- History ---- */
  undo: { icon: '↺', title: 'Undo (Ctrl+Z)', type: 'button', command: 'undo' },
  redo: { icon: '↻', title: 'Redo (Ctrl+Y)', type: 'button', command: 'redo' },

  /* ---- Misc ---- */
  removeFormat: { icon: 'Tx', title: 'Remove formatting', type: 'button', command: 'removeFormat' },
  print: {
    icon: '🖨',
    title: 'Print',
    type: 'button',
    action() { window.print(); },
  },
};
