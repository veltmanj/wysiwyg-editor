import {
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  Output,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import { WYSIWYGEditor as Editor } from 'wysiwyg-editor';

@Component({
  selector: 'app-wysiwyg-editor',
  standalone: true,
  template: `<div #container [class]="cssClass"></div>`,
})
export class WYSIWYGEditorComponent implements OnInit, OnChanges, OnDestroy {
  /** Toolbar action names (use '|' for separator). */
  @Input() toolbar?: string[];

  /** Placeholder text shown when the editor is empty. */
  @Input() placeholder = '';

  /** Initial HTML content. */
  @Input() initialContent = '';

  /** Minimum editor height in px. */
  @Input() minHeight = 200;

  /** Additional CSS class for the container element. */
  @Input() cssClass = '';

  /** Emits the HTML content string on every change. */
  @Output() contentChange = new EventEmitter<string>();

  /** Emits the editor instance after initialization. */
  @Output() editorReady = new EventEmitter<Editor>();

  @ViewChild('container', { static: true }) containerRef!: ElementRef<HTMLElement>;

  private editor: Editor | null = null;

  ngOnInit(): void {
    this.createEditor();
  }

  ngOnChanges(changes: SimpleChanges): void {
    // Recreate only when structural config changes
    if (
      (changes['toolbar'] || changes['placeholder'] || changes['minHeight']) &&
      !changes['toolbar']?.firstChange
    ) {
      this.destroyEditor();
      this.createEditor();
    }
  }

  ngOnDestroy(): void {
    this.destroyEditor();
  }

  /** Provides direct access to the underlying editor instance. */
  getEditor(): Editor | null {
    return this.editor;
  }

  private createEditor(): void {
    this.editor = new Editor(this.containerRef.nativeElement, {
      ...(this.toolbar && { toolbar: this.toolbar }),
      ...(this.placeholder && { placeholder: this.placeholder }),
      ...(this.initialContent && { initialContent: this.initialContent }),
      ...(this.minHeight && { minHeight: this.minHeight }),
      onChange: (html: string) => this.contentChange.emit(html),
    });
    this.editorReady.emit(this.editor);
  }

  private destroyEditor(): void {
    this.editor?.destroy();
    this.editor = null;
  }
}
