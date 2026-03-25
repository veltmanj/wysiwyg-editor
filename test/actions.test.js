import { describe, expect, it } from 'vitest';
import { ACTIONS } from '../src/actions.js';

describe('ACTIONS registry', () => {
  it('should export an object with action definitions', () => {
    expect(typeof ACTIONS).toBe('object');
    expect(Object.keys(ACTIONS).length).toBeGreaterThan(0);
  });

  const expectedActions = [
    'bold', 'italic', 'underline', 'strikethrough', 'subscript', 'superscript',
    'heading', 'fontFamily', 'fontSize',
    'fontColor', 'highlight',
    'alignLeft', 'alignCenter', 'alignRight', 'alignJustify',
    'orderedList', 'unorderedList',
    'indent', 'outdent',
    'link', 'image', 'horizontalRule',
    'blockquote', 'codeBlock',
    'undo', 'redo',
    'removeFormat', 'print',
  ];

  it('should contain all expected action names', () => {
    for (const name of expectedActions) {
      expect(ACTIONS).toHaveProperty(name);
    }
  });

  describe.each(Object.entries(ACTIONS))('%s', (name, action) => {
    it('should have a title', () => {
      expect(typeof action.title).toBe('string');
      expect(action.title.length).toBeGreaterThan(0);
    });

    it('should have a valid type', () => {
      expect(['button', 'select', 'color']).toContain(action.type);
    });

    it('should have an icon or be a select type', () => {
      if (action.type === 'select') return; // selects don't need icons
      expect(typeof action.icon).toBe('string');
    });

    it('should have a command or action function', () => {
      const hasCommand = typeof action.command === 'string';
      const hasAction = typeof action.action === 'function';
      expect(hasCommand || hasAction).toBe(true);
    });

    if (action.type === 'select') {
      it('should have an options array', () => {
        expect(Array.isArray(action.options)).toBe(true);
        expect(action.options.length).toBeGreaterThan(0);
      });

      it('should have options with label and value', () => {
        for (const opt of action.options) {
          expect(typeof opt.label).toBe('string');
          expect(opt.value !== undefined).toBe(true);
        }
      });
    }
  });
});
