import { Component } from '@angular/core';
import { WYSIWYGEditor } from 'wysiwyg-editor';
import { WYSIWYGEditorComponent } from './wysiwyg-editor.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [WYSIWYGEditorComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
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
