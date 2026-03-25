import { executeCommand, getCommandState, getCommandValue, UndoManager } from './commands.js';
import { Toolbar } from './toolbar.js';

/**
 * Rich text editor with a configurable toolbar.
 *
 * @example
 * const editor = new WYSIWYGEditor('#editor', {
 *   toolbar: ['bold', 'italic', 'underline', '|', 'heading', 'fontFamily', 'fontSize', 'fontColor'],
 *   placeholder: 'Start typing…',
 *   onChange: (html) => console.log(html),
 * });
 */
export class WYSIWYGEditor {
  /**
   * @param {string|HTMLElement} container - CSS selector or DOM element to mount in
   * @param {object} [options]
   * @param {string[]} [options.toolbar] - toolbar items (action names or '|' for separator)
   * @param {string} [options.placeholder] - placeholder text
   * @param {function} [options.onChange] - callback receiving HTML content on every change
   * @param {string} [options.initialContent] - initial HTML to populate the editor
   * @param {number} [options.minHeight] - minimum editor height in px
   */
  constructor(container, options = {}) {
    this.options = {
      toolbar: [
        'bold', 'italic', 'underline', 'strikethrough', '|',
        'heading', 'fontFamily', 'fontSize', 'fontColor', 'highlight', '|',
        'alignLeft', 'alignCenter', 'alignRight', 'alignJustify', '|',
        'orderedList', 'unorderedList', '|',
        'indent', 'outdent', '|',
        'link', 'image', 'horizontalRule', '|',
        'blockquote', 'codeBlock', '|',
        'subscript', 'superscript', '|',
        'undo', 'redo', '|',
        'removeFormat', 'print',
      ],
      placeholder: '',
      onChange: null,
      initialContent: '',
      minHeight: 200,
      ...options,
    };

    this.container = typeof container === 'string'
      ? document.querySelector(container)
      : container;

    if (!this.container) {
      throw new Error(`WYSIWYGEditor: container "${container}" not found`);
    }

    this._build();
  }

  /* ------------------------------------------------------------------ */
  /*  DOM construction                                                   */
  /* ------------------------------------------------------------------ */

  _build() {
    this.wrapper = document.createElement('div');
    this.wrapper.classList.add('wysiwyg-editor');

    // Toolbar
    this.toolbar = new Toolbar(this, this.options.toolbar);
    this.wrapper.appendChild(this.toolbar.element);

    // Editable area
    this.contentArea = document.createElement('div');
    this.contentArea.classList.add('wysiwyg-content');
    this.contentArea.contentEditable = 'true';
    this.contentArea.style.minHeight = `${this.options.minHeight}px`;

    if (this.options.placeholder) {
      this.contentArea.dataset.placeholder = this.options.placeholder;
    }
    if (this.options.initialContent) {
      this.contentArea.innerHTML = this.options.initialContent;
    }

    this.contentArea.addEventListener('input', () => this._onInput());
    this.contentArea.addEventListener('keydown', (e) => this._onKeyDown(e));
    this.contentArea.addEventListener('mouseup', () => this.toolbar.updateActiveStates());
    this.contentArea.addEventListener('keyup', () => this.toolbar.updateActiveStates());

    this.wrapper.appendChild(this.contentArea);

    // Undo/redo history
    this.undoManager = new UndoManager(this.contentArea);

    // Status bar
    this.statusBar = document.createElement('div');
    this.statusBar.classList.add('wysiwyg-status');
    this._updateWordCount();
    this.wrapper.appendChild(this.statusBar);

    this.container.appendChild(this.wrapper);
    this.contentArea.focus();
  }

  /* ------------------------------------------------------------------ */
  /*  Events                                                             */
  /* ------------------------------------------------------------------ */

  _onInput() {
    this.undoManager.save();
    this._afterChange();
  }

  _onKeyDown(e) {
    if (e.key === 'Tab') {
      e.preventDefault();
      this.exec(e.shiftKey ? 'outdent' : 'indent');
    }
  }

  _afterChange() {
    this.toolbar.updateActiveStates();
    this._updateWordCount();
    if (typeof this.options.onChange === 'function') {
      this.options.onChange(this.getHTML());
    }
  }

  _updateWordCount() {
    const text = (this.contentArea.innerText ?? this.contentArea.textContent ?? '').trim();
    const words = text ? text.split(/\s+/).length : 0;
    const chars = text.length;
    this.statusBar.textContent = `${words} word${words !== 1 ? 's' : ''} · ${chars} character${chars !== 1 ? 's' : ''}`;
  }

  /* ------------------------------------------------------------------ */
  /*  Public API                                                         */
  /* ------------------------------------------------------------------ */

  /** Execute a formatting command. */
  exec(command, value = null) {
    this.contentArea.focus();

    if (command === 'undo') {
      this.undoManager.undo();
      this._afterChange();
      return;
    }
    if (command === 'redo') {
      this.undoManager.redo();
      this._afterChange();
      return;
    }

    this.undoManager.save(true);
    executeCommand(command, value, this.contentArea);
    this.undoManager.save(true);
    this._afterChange();
  }

  /** Query whether a command is currently active (e.g. bold). */
  queryCommandState(command) {
    return getCommandState(command, this.contentArea);
  }

  /** Query the current value of a command (e.g. fontName). */
  queryCommandValue(command) {
    return getCommandValue(command, this.contentArea);
  }

  /** Get the editor's HTML content. */
  getHTML() {
    return this.contentArea.innerHTML;
  }

  /** Set the editor's HTML content. */
  setHTML(html) {
    this.contentArea.innerHTML = html;
    this._onInput();
  }

  /** Get the editor's plain text content. */
  getText() {
    return this.contentArea.innerText ?? this.contentArea.textContent ?? '';
  }

  /** Clear the editor. */
  clear() {
    this.contentArea.innerHTML = '';
    this._onInput();
  }

  /** Focus the editor. */
  focus() {
    this.contentArea.focus();
  }

  /** Destroy the editor and clean up. */
  destroy() {
    this.wrapper.remove();
  }
}
