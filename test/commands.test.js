import { beforeEach, describe, expect, it } from 'vitest';
import { executeCommand, getCommandState, getCommandValue, UndoManager } from '../src/commands.js';

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

let container;

function setup(html = '') {
  container = document.createElement('div');
  container.contentEditable = 'true';
  container.innerHTML = html;
  document.body.appendChild(container);
  return container;
}

function teardown() {
  container?.remove();
  container = null;
}

/** Place the selection inside a text node within the container. */
function selectText(node, startOffset, endOffset) {
  const sel = window.getSelection();
  sel.removeAllRanges();
  const range = document.createRange();
  if (typeof endOffset === 'number') {
    range.setStart(node, startOffset);
    range.setEnd(node, endOffset);
  } else {
    range.selectNodeContents(node);
  }
  sel.addRange(range);
  return range;
}

/** Place a collapsed cursor at the given offset in a text node. */
function placeCursor(node, offset = 0) {
  const sel = window.getSelection();
  sel.removeAllRanges();
  const range = document.createRange();
  range.setStart(node, offset);
  range.collapse(true);
  sel.addRange(range);
  return range;
}

/* ------------------------------------------------------------------ */
/*  Inline formatting                                                  */
/* ------------------------------------------------------------------ */

describe('executeCommand — inline formatting', () => {
  beforeEach(() => teardown());

  it('should wrap selected text in <strong> for bold', () => {
    setup('hello world');
    selectText(container.firstChild, 0, 5);
    executeCommand('bold', null, container);
    expect(container.querySelector('strong')).not.toBeNull();
    expect(container.querySelector('strong').textContent).toBe('hello');
  });

  it('should wrap selected text in <em> for italic', () => {
    setup('hello world');
    selectText(container.firstChild, 0, 5);
    executeCommand('italic', null, container);
    expect(container.querySelector('em')).not.toBeNull();
    expect(container.querySelector('em').textContent).toBe('hello');
  });

  it('should wrap selected text in <u> for underline', () => {
    setup('hello world');
    selectText(container.firstChild, 0, 5);
    executeCommand('underline', null, container);
    expect(container.querySelector('u')).not.toBeNull();
  });

  it('should wrap selected text in <s> for strikethrough', () => {
    setup('hello world');
    selectText(container.firstChild, 0, 5);
    executeCommand('strikeThrough', null, container);
    expect(container.querySelector('s')).not.toBeNull();
  });

  it('should wrap selected text in <sub> for subscript', () => {
    setup('H2O');
    selectText(container.firstChild, 1, 2);
    executeCommand('subscript', null, container);
    expect(container.querySelector('sub').textContent).toBe('2');
  });

  it('should wrap selected text in <sup> for superscript', () => {
    setup('x2');
    selectText(container.firstChild, 1, 2);
    executeCommand('superscript', null, container);
    expect(container.querySelector('sup').textContent).toBe('2');
  });

  it('should unwrap bold if already bold (toggle off)', () => {
    setup('<strong>hello</strong> world');
    const strong = container.querySelector('strong');
    selectText(strong.firstChild);
    executeCommand('bold', null, container);
    expect(container.querySelector('strong')).toBeNull();
    expect(container.textContent).toContain('hello');
  });

  it('should insert zero-width space for collapsed cursor', () => {
    setup('hello');
    placeCursor(container.firstChild, 3);
    executeCommand('bold', null, container);
    expect(container.querySelector('strong')).not.toBeNull();
  });
});

/* ------------------------------------------------------------------ */
/*  Inline styles                                                      */
/* ------------------------------------------------------------------ */

describe('executeCommand — inline styles', () => {
  beforeEach(() => teardown());

  it('should apply fontName as inline style', () => {
    setup('hello world');
    selectText(container.firstChild, 0, 5);
    executeCommand('fontName', 'Georgia', container);
    const span = container.querySelector('span');
    expect(span).not.toBeNull();
    expect(span.style.fontFamily).toBe('Georgia');
  });

  it('should apply fontSize with mapping', () => {
    setup('hello world');
    selectText(container.firstChild, 0, 5);
    executeCommand('fontSize', '5', container);
    const span = container.querySelector('span');
    expect(span).not.toBeNull();
    expect(span.style.fontSize).toBe('24px');
  });

  it('should apply foreColor as inline style', () => {
    setup('hello');
    selectText(container.firstChild);
    executeCommand('foreColor', '#ff0000', container);
    const span = container.querySelector('span');
    expect(span.style.color).toMatch(/#ff0000|rgb\(255,\s*0,\s*0\)/);
  });

  it('should apply hiliteColor as inline style', () => {
    setup('hello');
    selectText(container.firstChild);
    executeCommand('hiliteColor', '#ffff00', container);
    const span = container.querySelector('span');
    expect(span.style.backgroundColor).toMatch(/#ffff00|rgb\(255,\s*255,\s*0\)/);
  });
});

/* ------------------------------------------------------------------ */
/*  Block formatting                                                   */
/* ------------------------------------------------------------------ */

describe('executeCommand — block formatting', () => {
  beforeEach(() => teardown());

  it('should convert a div to h1', () => {
    setup('<div>heading text</div>');
    const div = container.querySelector('div');
    selectText(div.firstChild);
    executeCommand('formatBlock', 'h1', container);
    expect(container.querySelector('h1')).not.toBeNull();
    expect(container.querySelector('h1').textContent).toBe('heading text');
  });

  it('should convert back to div when no tag is given', () => {
    setup('<h1>heading text</h1>');
    const h1 = container.querySelector('h1');
    selectText(h1.firstChild);
    executeCommand('formatBlock', 'div', container);
    expect(container.querySelector('h1')).toBeNull();
    expect(container.querySelector('div')).not.toBeNull();
  });
});

/* ------------------------------------------------------------------ */
/*  Alignment                                                          */
/* ------------------------------------------------------------------ */

describe('executeCommand — alignment', () => {
  beforeEach(() => teardown());

  it('should set text-align center on the block', () => {
    setup('<p>centered text</p>');
    selectText(container.querySelector('p').firstChild);
    executeCommand('justifyCenter', null, container);
    expect(container.querySelector('p').style.textAlign).toBe('center');
  });

  it('should set text-align right on the block', () => {
    setup('<p>right text</p>');
    selectText(container.querySelector('p').firstChild);
    executeCommand('justifyRight', null, container);
    expect(container.querySelector('p').style.textAlign).toBe('right');
  });

  it('should set text-align justify on the block', () => {
    setup('<p>justified</p>');
    selectText(container.querySelector('p').firstChild);
    executeCommand('justifyFull', null, container);
    expect(container.querySelector('p').style.textAlign).toBe('justify');
  });

  it('should set text-align left on the block', () => {
    setup('<p style="text-align: center">text</p>');
    selectText(container.querySelector('p').firstChild);
    executeCommand('justifyLeft', null, container);
    expect(container.querySelector('p').style.textAlign).toBe('left');
  });
});

/* ------------------------------------------------------------------ */
/*  Lists                                                              */
/* ------------------------------------------------------------------ */

describe('executeCommand — lists', () => {
  beforeEach(() => teardown());

  it('should create an ordered list from a block', () => {
    setup('<div>item text</div>');
    selectText(container.querySelector('div').firstChild);
    executeCommand('insertOrderedList', null, container);
    expect(container.querySelector('ol')).not.toBeNull();
    expect(container.querySelector('li').textContent).toBe('item text');
  });

  it('should create an unordered list from a block', () => {
    setup('<div>item text</div>');
    selectText(container.querySelector('div').firstChild);
    executeCommand('insertUnorderedList', null, container);
    expect(container.querySelector('ul')).not.toBeNull();
  });

  it('should unwrap an ordered list back to divs', () => {
    setup('<ol><li>item one</li><li>item two</li></ol>');
    selectText(container.querySelector('li').firstChild);
    executeCommand('insertOrderedList', null, container);
    expect(container.querySelector('ol')).toBeNull();
    expect(container.textContent).toContain('item one');
  });
});

/* ------------------------------------------------------------------ */
/*  Indentation                                                        */
/* ------------------------------------------------------------------ */

describe('executeCommand — indentation', () => {
  beforeEach(() => teardown());

  it('should increase margin-left by 40px on indent', () => {
    setup('<p>indented text</p>');
    selectText(container.querySelector('p').firstChild);
    executeCommand('indent', null, container);
    expect(container.querySelector('p').style.marginLeft).toBe('40px');
  });

  it('should increase margin-left cumulatively', () => {
    setup('<p style="margin-left: 40px">text</p>');
    selectText(container.querySelector('p').firstChild);
    executeCommand('indent', null, container);
    expect(container.querySelector('p').style.marginLeft).toBe('80px');
  });

  it('should decrease margin-left by 40px on outdent', () => {
    setup('<p style="margin-left: 80px">text</p>');
    selectText(container.querySelector('p').firstChild);
    executeCommand('outdent', null, container);
    expect(container.querySelector('p').style.marginLeft).toBe('40px');
  });

  it('should not go below 0 on outdent', () => {
    setup('<p>text</p>');
    selectText(container.querySelector('p').firstChild);
    executeCommand('outdent', null, container);
    expect(container.querySelector('p').style.marginLeft).toBe('');
  });
});

/* ------------------------------------------------------------------ */
/*  Insertions                                                         */
/* ------------------------------------------------------------------ */

describe('executeCommand — insertions', () => {
  beforeEach(() => teardown());

  it('should insert a link with collapsed selection', () => {
    setup('hello');
    placeCursor(container.firstChild, 5);
    executeCommand('createLink', 'https://example.com', container);
    const a = container.querySelector('a');
    expect(a).not.toBeNull();
    expect(a.href).toBe('https://example.com/');
    expect(a.target).toBe('_blank');
    expect(a.rel).toBe('noopener noreferrer');
  });

  it('should wrap selected text in a link', () => {
    setup('click here please');
    selectText(container.firstChild, 6, 10);
    executeCommand('createLink', 'https://example.com', container);
    const a = container.querySelector('a');
    expect(a).not.toBeNull();
    expect(a.textContent).toBe('here');
  });

  it('should insert an image', () => {
    setup('before');
    placeCursor(container.firstChild, 6);
    executeCommand('insertImage', 'https://example.com/img.png', container);
    const img = container.querySelector('img');
    expect(img).not.toBeNull();
    expect(img.src).toBe('https://example.com/img.png');
    expect(img.style.maxWidth).toBe('100%');
  });

  it('should insert a horizontal rule', () => {
    setup('before');
    placeCursor(container.firstChild, 6);
    executeCommand('insertHorizontalRule', null, container);
    expect(container.querySelector('hr')).not.toBeNull();
  });
});

/* ------------------------------------------------------------------ */
/*  Remove formatting                                                  */
/* ------------------------------------------------------------------ */

describe('executeCommand — removeFormat', () => {
  beforeEach(() => teardown());

  it('should replace selected formatted text with plain text', () => {
    setup('<strong>bold text</strong>');
    const strong = container.querySelector('strong');
    selectText(strong.firstChild);
    executeCommand('removeFormat', null, container);
    expect(container.textContent).toContain('bold text');
  });
});

/* ------------------------------------------------------------------ */
/*  getCommandState                                                    */
/* ------------------------------------------------------------------ */

describe('getCommandState', () => {
  beforeEach(() => teardown());

  it('should return true when cursor is inside a bold element', () => {
    setup('<strong>bold text</strong>');
    selectText(container.querySelector('strong').firstChild);
    expect(getCommandState('bold', container)).toBe(true);
  });

  it('should return false when cursor is not inside a bold element', () => {
    setup('plain text');
    selectText(container.firstChild);
    expect(getCommandState('bold', container)).toBe(false);
  });

  it('should detect italic state', () => {
    setup('<em>italic text</em>');
    selectText(container.querySelector('em').firstChild);
    expect(getCommandState('italic', container)).toBe(true);
  });

  it('should detect ordered list state', () => {
    setup('<ol><li>item</li></ol>');
    selectText(container.querySelector('li').firstChild);
    expect(getCommandState('insertOrderedList', container)).toBe(true);
  });

  it('should detect unordered list state', () => {
    setup('<ul><li>item</li></ul>');
    selectText(container.querySelector('li').firstChild);
    expect(getCommandState('insertUnorderedList', container)).toBe(true);
  });

  it('should return false for unknown command', () => {
    setup('text');
    selectText(container.firstChild);
    expect(getCommandState('unknownCommand', container)).toBe(false);
  });
});

/* ------------------------------------------------------------------ */
/*  getCommandValue                                                    */
/* ------------------------------------------------------------------ */

describe('getCommandValue', () => {
  beforeEach(() => teardown());

  it('should return formatBlock tag name', () => {
    setup('<h1>heading</h1>');
    selectText(container.querySelector('h1').firstChild);
    expect(getCommandValue('formatBlock', container)).toBe('h1');
  });

  it('should return empty string when no selection', () => {
    setup('text');
    window.getSelection().removeAllRanges();
    expect(getCommandValue('fontName', container)).toBe('');
  });

  it('should return empty string for unknown command', () => {
    setup('text');
    selectText(container.firstChild);
    expect(getCommandValue('unknownCommand', container)).toBe('');
  });
});

/* ------------------------------------------------------------------ */
/*  UndoManager                                                        */
/* ------------------------------------------------------------------ */

describe('UndoManager', () => {
  beforeEach(() => teardown());

  it('should save and undo a change', () => {
    const el = setup('initial');
    const um = new UndoManager(el);

    el.innerHTML = 'changed';
    um.save(true);

    um.undo();
    expect(el.innerHTML).toBe('initial');
  });

  it('should redo after undo', () => {
    const el = setup('initial');
    const um = new UndoManager(el);

    el.innerHTML = 'changed';
    um.save(true);

    um.undo();
    expect(el.innerHTML).toBe('initial');

    um.redo();
    expect(el.innerHTML).toBe('changed');
  });

  it('should not undo past the initial state', () => {
    const el = setup('initial');
    const um = new UndoManager(el);

    um.undo();
    um.undo();
    expect(el.innerHTML).toBe('initial');
  });

  it('should not redo past the latest state', () => {
    const el = setup('initial');
    const um = new UndoManager(el);

    el.innerHTML = 'changed';
    um.save(true);

    um.redo();
    um.redo();
    expect(el.innerHTML).toBe('changed');
  });

  it('should discard redo stack on new save after undo', () => {
    const el = setup('one');
    const um = new UndoManager(el);

    el.innerHTML = 'two';
    um.save(true);

    el.innerHTML = 'three';
    um.save(true);

    um.undo(); // back to 'two'
    el.innerHTML = 'four';
    um.save(true);

    um.redo(); // should not go to 'three'
    expect(el.innerHTML).toBe('four');
  });

  it('should not save duplicate state', () => {
    const el = setup('same');
    const um = new UndoManager(el);

    um.save(true);
    um.save(true);
    expect(um.stack.length).toBe(1);
  });

  it('should respect max history limit', () => {
    const el = setup('start');
    const um = new UndoManager(el);

    for (let i = 0; i < 150; i++) {
      el.innerHTML = `state-${i}`;
      um.save(true);
    }
    expect(um.stack.length).toBeLessThanOrEqual(100);
  });
});

/* ------------------------------------------------------------------ */
/*  Unknown command                                                    */
/* ------------------------------------------------------------------ */

describe('executeCommand — unknown command', () => {
  beforeEach(() => teardown());

  it('should warn and not throw for unknown commands', () => {
    setup('text');
    selectText(container.firstChild);
    expect(() => executeCommand('nonexistent', null, container)).not.toThrow();
  });
});
