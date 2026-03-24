declare module 'wysiwyg-editor' {
  export class WYSIWYGEditor {
    constructor(container: string | HTMLElement, options?: WYSIWYGEditorOptions);
    exec(command: string, value?: string | null): void;
    queryCommandState(command: string): boolean;
    queryCommandValue(command: string): string;
    getHTML(): string;
    setHTML(html: string): void;
    getText(): string;
    clear(): void;
    focus(): void;
    destroy(): void;
  }

  export interface WYSIWYGEditorOptions {
    toolbar?: string[];
    placeholder?: string;
    onChange?: (html: string) => void;
    initialContent?: string;
    minHeight?: number;
  }

  export const ACTIONS: Record<string, unknown>;
}
