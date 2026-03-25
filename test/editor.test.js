import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { WYSIWYGEditor } from '../src/editor.js';

let container;
let editor;

function setup(options = {}) {
  container = document.createElement('div');
  container.id = 'editor-host';
  document.body.appendChild(container);
  editor = new WYSIWYGEditor(container, { toolbar: ['bold', 'italic'], ...options });
  return editor;
}

function teardown() {
  editor?.destroy();
  container?.remove();
  editor = null;
  container = null;
}

/* ------------------------------------------------------------------ */
/*  Constructor                                                        */
/* ------------------------------------------------------------------ */

describe('WYSIWYGEditor — constructor', () => {
  afterEach(() => teardown());

  it('should mount inside the given DOM element', () => {
    setup();
    expect(container.querySelector('.wysiwyg-editor')).not.toBeNull();
  });

  it('should accept a CSS selector string', () => {
    container = document.createElement('div');
    container.id = 'sel-test';
    document.body.appendChild(container);
    editor = new WYSIWYGEditor('#sel-test', { toolbar: ['bold'] });
    expect(container.querySelector('.wysiwyg-editor')).not.toBeNull();
  });

  it('should throw when container is not found', () => {
    expect(() => new WYSIWYGEditor('#nonexistent')).toThrow('container "#nonexistent" not found');
  });

  it('should apply initial content', () => {
    setup({ initialContent: '<p>Hello</p>' });
    expect(editor.getHTML()).toContain('Hello');
  });

  it('should apply placeholder', () => {
    setup({ placeholder: 'Type here…' });
    expect(editor.contentArea.dataset.placeholder).toBe('Type here…');
  });

  it('should set minimum height', () => {
    setup({ minHeight: 500 });
    expect(editor.contentArea.style.minHeight).toBe('500px');
  });

  it('should use default minHeight of 200', () => {
    setup();
    expect(editor.contentArea.style.minHeight).toBe('200px');
  });
});

/* ------------------------------------------------------------------ */
/*  DOM structure                                                      */
/* ------------------------------------------------------------------ */

describe('WYSIWYGEditor — DOM structure', () => {
  afterEach(() => teardown());

  it('should create toolbar, content area, and status bar', () => {
    setup();
    expect(container.querySelector('.wysiwyg-toolbar')).not.toBeNull();
    expect(container.querySelector('.wysiwyg-content')).not.toBeNull();
    expect(container.querySelector('.wysiwyg-status')).not.toBeNull();
  });

  it('should make content area editable', () => {
    setup();
    expect(editor.contentArea.contentEditable).toBe('true');
  });

  it('should render toolbar buttons for configured actions', () => {
    setup({ toolbar: ['bold', 'italic', 'underline'] });
    const buttons = container.querySelectorAll('.wysiwyg-btn');
    expect(buttons.length).toBe(3);
  });

  it('should render separators', () => {
    setup({ toolbar: ['bold', '|', 'italic'] });
    expect(container.querySelector('.wysiwyg-separator')).not.toBeNull();
  });
});

/* ------------------------------------------------------------------ */
/*  Public API                                                         */
/* ------------------------------------------------------------------ */

describe('WYSIWYGEditor — public API', () => {
  afterEach(() => teardown());

  it('getHTML() should return content area innerHTML', () => {
    setup({ initialContent: '<p>test</p>' });
    expect(editor.getHTML()).toBe('<p>test</p>');
  });

  it('setHTML() should update content area', () => {
    setup();
    editor.setHTML('<p>new content</p>');
    expect(editor.getHTML()).toBe('<p>new content</p>');
  });

  it('getText() should return plain text', () => {
    setup({ initialContent: '<p>hello <strong>world</strong></p>' });
    expect(editor.getText()).toContain('hello world');
  });

  it('clear() should empty the editor', () => {
    setup({ initialContent: '<p>content</p>' });
    editor.clear();
    expect(editor.getHTML()).toBe('');
  });

  it('focus() should call focus on the content area', () => {
    setup();
    const focusSpy = vi.spyOn(editor.contentArea, 'focus');
    editor.focus();
    expect(focusSpy).toHaveBeenCalled();
  });

  it('destroy() should remove the wrapper from DOM', () => {
    setup();
    editor.destroy();
    expect(container.querySelector('.wysiwyg-editor')).toBeNull();
    editor = null; // prevent afterEach double-destroy
  });
});

/* ------------------------------------------------------------------ */
/*  onChange callback                                                   */
/* ------------------------------------------------------------------ */

describe('WYSIWYGEditor — onChange', () => {
  afterEach(() => teardown());

  it('should call onChange when content changes via setHTML', () => {
    const onChange = vi.fn();
    setup({ onChange });
    editor.setHTML('<p>updated</p>');
    expect(onChange).toHaveBeenCalledWith('<p>updated</p>');
  });

  it('should call onChange when content is cleared', () => {
    const onChange = vi.fn();
    setup({ onChange, initialContent: '<p>text</p>' });
    editor.clear();
    expect(onChange).toHaveBeenCalledWith('');
  });

  it('should not throw when onChange is not set', () => {
    setup({ onChange: null });
    expect(() => editor.setHTML('test')).not.toThrow();
  });
});

/* ------------------------------------------------------------------ */
/*  Word count                                                         */
/* ------------------------------------------------------------------ */

describe('WYSIWYGEditor — word count', () => {
  afterEach(() => teardown());

  it('should show word and character count', () => {
    setup({ initialContent: 'hello world' });
    expect(editor.statusBar.textContent).toContain('2 words');
    expect(editor.statusBar.textContent).toContain('11 characters');
  });

  it('should show singular forms for 1 word / 1 character', () => {
    setup({ initialContent: 'a' });
    expect(editor.statusBar.textContent).toContain('1 word');
    expect(editor.statusBar.textContent).toContain('1 character');
  });

  it('should show 0 words for empty editor', () => {
    setup();
    expect(editor.statusBar.textContent).toContain('0 words');
  });

  it('should update count after setHTML', () => {
    setup();
    editor.setHTML('one two three');
    expect(editor.statusBar.textContent).toContain('3 words');
  });
});

/* ------------------------------------------------------------------ */
/*  Undo / Redo via exec                                               */
/* ------------------------------------------------------------------ */

describe('WYSIWYGEditor — undo/redo', () => {
  afterEach(() => teardown());

  it('should undo a change made via setHTML', () => {
    setup({ initialContent: 'original' });
    editor.setHTML('modified');
    editor.exec('undo');
    expect(editor.getHTML()).toBe('original');
  });

  it('should redo after undo', () => {
    setup({ initialContent: 'original' });
    editor.setHTML('modified');
    editor.exec('undo');
    editor.exec('redo');
    expect(editor.getHTML()).toBe('modified');
  });
});
