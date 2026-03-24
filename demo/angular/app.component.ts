import { Component } from '@angular/core';
import { WYSIWYGEditor } from 'wysiwyg-editor';
import { WYSIWYGEditorComponent } from './wysiwyg-editor.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [WYSIWYGEditorComponent],
  template: `
    <div class="demo-container">
      <h1>WYSIWYG Editor – Angular Demo</h1>
      <p class="subtitle">A rich text editor with a fully configurable toolbar.</p>

      <!-- Full toolbar (default) -->
      <app-wysiwyg-editor
        placeholder="Start typing your document…"
        [minHeight]="250"
        (contentChange)="onContentChange($event)"
        (editorReady)="onEditorReady($event)"
      />

      <!-- Minimal toolbar -->
      <h3 style="margin-top: 32px; margin-bottom: 8px">Minimal toolbar</h3>
      <app-wysiwyg-editor
        [toolbar]="minimalToolbar"
        placeholder="Simple mode…"
        [minHeight]="120"
      />

      <!-- HTML output -->
      <h3 style="margin-top: 32px; margin-bottom: 8px">HTML Output</h3>
      <pre class="html-output">{{ html || '(start typing…)' }}</pre>

      <!-- API demo -->
      <div class="api-buttons">
        <button (click)="setContent()">Set content</button>
        <button (click)="clearEditor()">Clear</button>
        <button (click)="showText()">Get text</button>
      </div>
    </div>
  `,
  styles: [`
    .demo-container {
      max-width: 900px;
      margin: 32px auto;
      font-family: sans-serif;
    }
    .subtitle { color: #555; margin-bottom: 24px; }
    .html-output {
      background: #1e1e1e; color: #d4d4d4; padding: 16px;
      border-radius: 6px; font-size: 13px; max-height: 300px;
      overflow: auto;
    }
    .api-buttons {
      margin-top: 16px;
      display: flex;
      gap: 8px;
    }
  `],
})
export class AppComponent {
  html = '';
  editor: WYSIWYGEditor | null = null;

  minimalToolbar = ['bold', 'italic', 'underline', '|', 'orderedList', 'unorderedList'];

  onContentChange(html: string): void {
    this.html = html;
  }

  onEditorReady(editor: WYSIWYGEditor): void {
    this.editor = editor;
  }

  setContent(): void {
    this.editor?.setHTML('<p>Hello from <b>Angular</b>!</p>');
  }

  clearEditor(): void {
    this.editor?.clear();
  }

  showText(): void {
    alert(this.editor?.getText());
  }
}
