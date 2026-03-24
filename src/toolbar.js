import { ACTIONS } from './actions.js';

/**
 * Builds and manages the editor toolbar.
 */
export class Toolbar {
  /**
   * @param {import('./editor.js').WYSIWYGEditor} editor
   * @param {string[]} items - action names or '|' for separator
   */
  constructor(editor, items) {
    this.editor = editor;
    this.buttons = [];

    this.element = document.createElement('div');
    this.element.classList.add('wysiwyg-toolbar');
    this.element.setAttribute('role', 'toolbar');

    for (const name of items) {
      if (name === '|') {
        this.element.appendChild(this._createSeparator());
        continue;
      }

      const action = ACTIONS[name];
      if (!action) {
        console.warn(`WYSIWYGEditor: unknown toolbar action "${name}"`);
        continue;
      }

      let el;
      switch (action.type) {
        case 'select':
          el = this._createSelect(name, action);
          break;
        case 'color':
          el = this._createColorPicker(name, action);
          break;
        default:
          el = this._createButton(name, action);
          break;
      }
      this.element.appendChild(el);
    }
  }

  /* ------------------------------------------------------------------ */
  /*  Element factories                                                  */
  /* ------------------------------------------------------------------ */

  _createSeparator() {
    const sep = document.createElement('span');
    sep.classList.add('wysiwyg-separator');
    return sep;
  }

  _createButton(name, action) {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.classList.add('wysiwyg-btn');
    btn.dataset.action = name;
    btn.title = action.title;
    btn.innerHTML = action.icon;

    btn.addEventListener('mousedown', (e) => e.preventDefault()); // keep focus in editor
    btn.addEventListener('click', () => {
      if (typeof action.action === 'function') {
        action.action(this.editor);
      } else {
        this.editor.exec(action.command);
      }
    });

    this.buttons.push({ name, el: btn, action });
    return btn;
  }

  _createSelect(name, action) {
    const select = document.createElement('select');
    select.classList.add('wysiwyg-select');
    select.dataset.action = name;
    select.title = action.title;

    const placeholder = document.createElement('option');
    placeholder.textContent = action.title;
    placeholder.value = '';
    placeholder.disabled = true;
    placeholder.selected = true;
    select.appendChild(placeholder);

    for (const opt of action.options) {
      const option = document.createElement('option');
      option.value = opt.value;
      option.textContent = opt.label;
      select.appendChild(option);
    }

    select.addEventListener('change', () => {
      action.action(this.editor, select.value);
      select.selectedIndex = 0; // reset to placeholder
      this.editor.focus();
    });

    return select;
  }

  _createColorPicker(name, action) {
    const wrapper = document.createElement('label');
    wrapper.classList.add('wysiwyg-color-wrapper');
    wrapper.title = action.title;

    const label = document.createElement('span');
    label.classList.add('wysiwyg-btn');
    label.innerHTML = action.icon;
    wrapper.appendChild(label);

    const input = document.createElement('input');
    input.type = 'color';
    input.classList.add('wysiwyg-color-input');
    input.value = '#000000';
    input.addEventListener('input', () => {
      action.action(this.editor, input.value);
    });
    wrapper.appendChild(input);

    return wrapper;
  }

  /* ------------------------------------------------------------------ */
  /*  State                                                              */
  /* ------------------------------------------------------------------ */

  /** Refresh active/pressed state of buttons based on current selection. */
  updateActiveStates() {
    for (const { el, action } of this.buttons) {
      if (action.command) {
        const active = this.editor.queryCommandState(action.command);
        el.classList.toggle('active', active);
      }
    }
  }
}
