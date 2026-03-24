# Angular Demo

## Quick Start

```bash
# From a new or existing Angular project (v17+ with standalone components):
npm install ../../          # local link – or: npm install wysiwyg-editor

# Copy the wrapper component and demo into your src/app/ folder:
cp wysiwyg-editor.component.ts app.component.ts /path/to/your-app/src/app/

# Add the editor CSS to angular.json → styles:
#   "styles": ["node_modules/wysiwyg-editor/dist/wysiwyg-editor.css", "src/styles.css"]

ng serve
```

## Files

| File                          | Purpose                                                             |
| ----------------------------- | ------------------------------------------------------------------- |
| `wysiwyg-editor.component.ts` | Reusable standalone Angular component — drop this into your project |
| `app.component.ts`            | Demo app showing full toolbar, minimal toolbar, and API usage       |

## Usage

```typescript
import { WYSIWYGEditorComponent } from "./wysiwyg-editor.component";

@Component({
  standalone: true,
  imports: [WYSIWYGEditorComponent],
  template: `
    <app-wysiwyg-editor
      [toolbar]="['bold', 'italic', '|', 'heading', 'fontFamily', 'fontSize']"
      placeholder="Write something…"
      [minHeight]="200"
      (contentChange)="onHtmlChange($event)"
      (editorReady)="onReady($event)"
    />
  `,
})
export class MyComponent {
  onHtmlChange(html: string) {
    console.log(html);
  }
  onReady(editor: any) {
    /* hold a ref to the editor instance */
  }
}
```

## Inputs

| Input            | Type       | Default | Description                            |
| ---------------- | ---------- | ------- | -------------------------------------- | ----------------- |
| `toolbar`        | `string[]` | all     | Toolbar action names (`'               | '` for separator) |
| `placeholder`    | `string`   | `''`    | Placeholder text                       |
| `initialContent` | `string`   | `''`    | Initial HTML content                   |
| `minHeight`      | `number`   | `200`   | Minimum editor height in px            |
| `cssClass`       | `string`   | `''`    | Additional CSS class for the container |

## Outputs

| Output          | Type                   | Description                                    |
| --------------- | ---------------------- | ---------------------------------------------- |
| `contentChange` | `EventEmitter<string>` | Emits the HTML content on every change         |
| `editorReady`   | `EventEmitter<Editor>` | Emits the editor instance after initialization |

## Style Setup

Add the editor stylesheet to your `angular.json`:

```json
{
  "projects": {
    "your-app": {
      "architect": {
        "build": {
          "options": {
            "styles": [
              "node_modules/wysiwyg-editor/dist/wysiwyg-editor.css",
              "src/styles.css"
            ]
          }
        }
      }
    }
  }
}
```
