/**
 * Modern replacements for deprecated document.execCommand APIs.
 * Uses Selection/Range APIs and direct DOM manipulation.
 */

/* ------------------------------------------------------------------ */
/*  Selection helpers                                                  */
/* ------------------------------------------------------------------ */

function getRange() {
  const sel = window.getSelection();
  return sel && sel.rangeCount > 0 ? sel.getRangeAt(0) : null;
}

function setRange(range) {
  const sel = window.getSelection();
  sel.removeAllRanges();
  sel.addRange(range);
}

function selectNodeContents(node) {
  const range = document.createRange();
  range.selectNodeContents(node);
  setRange(range);
}

/**
 * Walk up from the selection anchor to find an ancestor matching
 * one of the given tag names, stopping at the container boundary.
 */
function closestTag(tagNames, container) {
  const sel = window.getSelection();
  if (!sel || sel.rangeCount === 0) return null;
  let node = sel.anchorNode;
  if (node && node.nodeType === Node.TEXT_NODE) node = node.parentElement;
  while (node && node !== container && container.contains(node)) {
    if (tagNames.includes(node.tagName)) return node;
    node = node.parentElement;
  }
  return null;
}

/** Walk up from the selection anchor to find the nearest block-level parent. */
function closestBlock(container) {
  const BLOCK_TAGS = [
    'P', 'DIV', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6',
    'BLOCKQUOTE', 'PRE', 'LI',
  ];
  const sel = window.getSelection();
  if (!sel || sel.rangeCount === 0) return null;
  let node = sel.anchorNode;
  if (node && node.nodeType === Node.TEXT_NODE) node = node.parentElement;
  while (node && node !== container && container.contains(node)) {
    if (BLOCK_TAGS.includes(node.tagName)) return node;
    node = node.parentElement;
  }
  return null;
}

function unwrapElement(el) {
  const parent = el.parentNode;
  while (el.firstChild) {
    parent.insertBefore(el.firstChild, el);
  }
  parent.removeChild(el);
  parent.normalize();
}

/* ------------------------------------------------------------------ */
/*  Inline formatting                                                  */
/* ------------------------------------------------------------------ */

const INLINE_TAGS = {
  bold: ['STRONG', 'B'],
  italic: ['EM', 'I'],
  underline: ['U'],
  strikeThrough: ['S', 'STRIKE', 'DEL'],
  subscript: ['SUB'],
  superscript: ['SUP'],
};

const INLINE_CREATE_TAG = {
  bold: 'strong',
  italic: 'em',
  underline: 'u',
  strikeThrough: 's',
  subscript: 'sub',
  superscript: 'sup',
};

function isInlineCommand(command) {
  return command in INLINE_TAGS;
}

function toggleInline(command, container) {
  const tags = INLINE_TAGS[command];
  const createTag = INLINE_CREATE_TAG[command];
  if (!tags || !createTag) return;

  const range = getRange();
  if (!range || !container.contains(range.commonAncestorContainer)) return;

  const existing = closestTag(tags, container);
  if (existing) {
    unwrapElement(existing);
    return;
  }

  const wrapper = document.createElement(createTag);
  if (range.collapsed) {
    wrapper.appendChild(document.createTextNode('\u200B'));
    range.insertNode(wrapper);
    const r = document.createRange();
    r.setStart(wrapper.firstChild, 1);
    r.collapse(true);
    setRange(r);
  } else {
    try {
      range.surroundContents(wrapper);
    } catch {
      const fragment = range.extractContents();
      wrapper.appendChild(fragment);
      range.insertNode(wrapper);
    }
    selectNodeContents(wrapper);
  }
}

/* ------------------------------------------------------------------ */
/*  Inline styles (font, color)                                        */
/* ------------------------------------------------------------------ */

function applyInlineStyle(styleProp, value, container) {
  const range = getRange();
  if (!range || !container.contains(range.commonAncestorContainer)) return;

  const span = document.createElement('span');
  span.style[styleProp] = value;

  if (range.collapsed) {
    span.appendChild(document.createTextNode('\u200B'));
    range.insertNode(span);
    const r = document.createRange();
    r.setStart(span.firstChild, 1);
    r.collapse(true);
    setRange(r);
  } else {
    try {
      range.surroundContents(span);
    } catch {
      const fragment = range.extractContents();
      span.appendChild(fragment);
      range.insertNode(span);
    }
    selectNodeContents(span);
  }
}

/* ------------------------------------------------------------------ */
/*  Block formatting                                                   */
/* ------------------------------------------------------------------ */

function formatBlock(tag, container) {
  const block = closestBlock(container);

  if (!block || block === container) {
    const range = getRange();
    if (!range) return;
    const newBlock = document.createElement(tag || 'div');
    try {
      range.surroundContents(newBlock);
    } catch {
      const fragment = range.extractContents();
      newBlock.appendChild(fragment);
      range.insertNode(newBlock);
    }
    selectNodeContents(newBlock);
    return;
  }

  const newTag = (!tag || tag === 'div') ? 'div' : tag;
  const newBlock = document.createElement(newTag);
  newBlock.innerHTML = block.innerHTML;
  block.parentNode.replaceChild(newBlock, block);
  selectNodeContents(newBlock);
}

/* ------------------------------------------------------------------ */
/*  Alignment                                                          */
/* ------------------------------------------------------------------ */

function setAlignment(align, container) {
  const block = closestBlock(container);
  if (block && block !== container) {
    block.style.textAlign = align;
  }
}

/* ------------------------------------------------------------------ */
/*  Lists                                                              */
/* ------------------------------------------------------------------ */

function toggleList(listType, container) {
  const sel = window.getSelection();
  if (!sel || sel.rangeCount === 0) return;

  let node = sel.anchorNode;
  if (node && node.nodeType === Node.TEXT_NODE) node = node.parentElement;

  // Check if already in a list of this type
  let listParent = null;
  let current = node;
  while (current && current !== container) {
    if (current.tagName === listType) { listParent = current; break; }
    current = current.parentElement;
  }

  if (listParent) {
    // Unwrap list items into plain blocks
    const fragment = document.createDocumentFragment();
    for (const li of Array.from(listParent.children)) {
      const div = document.createElement('div');
      div.innerHTML = li.innerHTML;
      fragment.appendChild(div);
    }
    listParent.parentNode.replaceChild(fragment, listParent);
  } else {
    const block = closestBlock(container);
    const target = block && block !== container ? block : null;
    const list = document.createElement(listType.toLowerCase());
    const li = document.createElement('li');

    if (target) {
      li.innerHTML = target.innerHTML;
      list.appendChild(li);
      target.parentNode.replaceChild(list, target);
    } else {
      const range = getRange();
      if (!range) return;
      const content = range.extractContents();
      li.appendChild(content);
      list.appendChild(li);
      range.insertNode(list);
    }
    selectNodeContents(li);
  }
}

/* ------------------------------------------------------------------ */
/*  Indentation                                                        */
/* ------------------------------------------------------------------ */

function indent(container) {
  const block = closestBlock(container);
  if (block && block !== container) {
    const px = parseInt(block.style.marginLeft || '0', 10);
    block.style.marginLeft = `${px + 40}px`;
  }
}

function outdent(container) {
  const block = closestBlock(container);
  if (block && block !== container) {
    const px = parseInt(block.style.marginLeft || '0', 10);
    block.style.marginLeft = `${Math.max(0, px - 40)}px`;
    if (block.style.marginLeft === '0px') block.style.removeProperty('margin-left');
  }
}

/* ------------------------------------------------------------------ */
/*  Insertions                                                         */
/* ------------------------------------------------------------------ */

function insertLink(url, container) {
  const range = getRange();
  if (!range || !container.contains(range.commonAncestorContainer)) return;

  const a = document.createElement('a');
  a.href = url;
  a.target = '_blank';
  a.rel = 'noopener noreferrer';

  if (range.collapsed) {
    a.textContent = url;
    range.insertNode(a);
  } else {
    try { range.surroundContents(a); }
    catch { const f = range.extractContents(); a.appendChild(f); range.insertNode(a); }
  }

  const r = document.createRange();
  r.setStartAfter(a);
  r.collapse(true);
  setRange(r);
}

function insertImage(url, container) {
  const range = getRange();
  if (!range || !container.contains(range.commonAncestorContainer)) return;

  const img = document.createElement('img');
  img.src = url;
  img.style.maxWidth = '100%';
  range.deleteContents();
  range.insertNode(img);

  const r = document.createRange();
  r.setStartAfter(img);
  r.collapse(true);
  setRange(r);
}

function insertHR(container) {
  const range = getRange();
  if (!range || !container.contains(range.commonAncestorContainer)) return;

  const hr = document.createElement('hr');
  range.deleteContents();
  range.insertNode(hr);

  const r = document.createRange();
  r.setStartAfter(hr);
  r.collapse(true);
  setRange(r);
}

/* ------------------------------------------------------------------ */
/*  Remove formatting                                                  */
/* ------------------------------------------------------------------ */

function removeFormat(container) {
  const range = getRange();
  if (!range || range.collapsed || !container.contains(range.commonAncestorContainer)) return;

  const text = range.toString();
  range.deleteContents();
  range.insertNode(document.createTextNode(text));
}

/* ------------------------------------------------------------------ */
/*  State & value queries                                              */
/* ------------------------------------------------------------------ */

const ALIGNMENT_COMMANDS = {
  justifyLeft: 'left',
  justifyCenter: 'center',
  justifyRight: 'right',
  justifyFull: 'justify',
};

export function getCommandState(command, container) {
  if (INLINE_TAGS[command]) {
    return !!closestTag(INLINE_TAGS[command], container);
  }
  if (command === 'insertOrderedList') return !!closestTag(['OL'], container);
  if (command === 'insertUnorderedList') return !!closestTag(['UL'], container);

  if (ALIGNMENT_COMMANDS[command]) {
    const block = closestBlock(container);
    if (block) {
      const align = block.style.textAlign || window.getComputedStyle(block).textAlign;
      return align === ALIGNMENT_COMMANDS[command];
    }
  }
  return false;
}

export function getCommandValue(command, container) {
  const sel = window.getSelection();
  if (!sel || sel.rangeCount === 0) return '';
  let node = sel.anchorNode;
  if (node && node.nodeType === Node.TEXT_NODE) node = node.parentElement;
  if (!node || !container.contains(node)) return '';

  const style = window.getComputedStyle(node);
  switch (command) {
    case 'fontName': return style.fontFamily.replace(/['"]/g, '').split(',')[0].trim();
    case 'fontSize': return style.fontSize;
    case 'foreColor': return style.color;
    case 'hiliteColor':
    case 'backColor': return style.backgroundColor;
    case 'formatBlock': { const b = closestBlock(container); return b ? b.tagName.toLowerCase() : ''; }
    default: return '';
  }
}

/* ------------------------------------------------------------------ */
/*  Undo / Redo                                                        */
/* ------------------------------------------------------------------ */

const MAX_HISTORY = 100;
const SAVE_DEBOUNCE_MS = 500;

export class UndoManager {
  constructor(contentArea) {
    this.contentArea = contentArea;
    this.stack = [contentArea.innerHTML];
    this.index = 0;
    this._lastSaveTime = 0;
  }

  /** Save the current state. Debounced unless force is true. */
  save(force = false) {
    const now = Date.now();
    if (!force && now - this._lastSaveTime < SAVE_DEBOUNCE_MS) return;

    const html = this.contentArea.innerHTML;
    if (html === this.stack[this.index]) return;

    this.stack.length = this.index + 1;
    this.stack.push(html);
    if (this.stack.length > MAX_HISTORY) this.stack.shift();
    this.index = this.stack.length - 1;
    this._lastSaveTime = now;
  }

  undo() {
    if (this.index > 0) {
      this.index--;
      this.contentArea.innerHTML = this.stack[this.index];
    }
  }

  redo() {
    if (this.index < this.stack.length - 1) {
      this.index++;
      this.contentArea.innerHTML = this.stack[this.index];
    }
  }
}

/* ------------------------------------------------------------------ */
/*  Font-size value mapping (legacy 1–7 scale → CSS px)                */
/* ------------------------------------------------------------------ */

const FONT_SIZE_MAP = {
  '1': '10px', '2': '13px', '3': '16px', '4': '18px',
  '5': '24px', '6': '32px', '7': '48px',
};

/* ------------------------------------------------------------------ */
/*  Command dispatcher                                                 */
/* ------------------------------------------------------------------ */

export function executeCommand(command, value, container) {
  if (isInlineCommand(command)) {
    toggleInline(command, container);
    return;
  }

  switch (command) {
    case 'formatBlock': formatBlock(value || 'div', container); break;
    case 'justifyLeft': setAlignment('left', container); break;
    case 'justifyCenter': setAlignment('center', container); break;
    case 'justifyRight': setAlignment('right', container); break;
    case 'justifyFull': setAlignment('justify', container); break;
    case 'insertOrderedList': toggleList('OL', container); break;
    case 'insertUnorderedList': toggleList('UL', container); break;
    case 'indent': indent(container); break;
    case 'outdent': outdent(container); break;
    case 'fontName': applyInlineStyle('fontFamily', value, container); break;
    case 'fontSize': applyInlineStyle('fontSize', FONT_SIZE_MAP[value] || value, container); break;
    case 'foreColor': applyInlineStyle('color', value, container); break;
    case 'hiliteColor': applyInlineStyle('backgroundColor', value, container); break;
    case 'createLink': insertLink(value, container); break;
    case 'insertImage': insertImage(value, container); break;
    case 'insertHorizontalRule': insertHR(container); break;
    case 'removeFormat': removeFormat(container); break;
    default:
      console.warn(`WYSIWYGEditor: unknown command "${command}"`);
  }
}
