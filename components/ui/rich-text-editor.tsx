'use client';

import { useEffect, useRef } from 'react';
import { Bold, Italic, Underline, List, ListOrdered, AlignLeft, AlignCenter, AlignRight, Heading3, Pilcrow, ImagePlus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { normalizeRichTextValue } from '@/lib/rich-text';

type RichTextEditorProps = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  minHeight?: number;
  className?: string;
};

function ToolbarButton({
  onClick,
  title,
  children,
}: {
  onClick: () => void;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      title={title}
      onClick={onClick}
      className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
    >
      {children}
    </button>
  );
}

export default function RichTextEditor({
  value,
  onChange,
  placeholder = 'Write here...',
  minHeight = 120,
  className,
}: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = editorRef.current;
    if (!el) return;
    const normalized = normalizeRichTextValue(value || '');
    if (el.innerHTML !== normalized) {
      el.innerHTML = normalized;
    }
  }, [value]);

  const run = (command: string, commandValue?: string) => {
    editorRef.current?.focus();
    document.execCommand(command, false, commandValue);
    onChange(editorRef.current?.innerHTML || '');
  };

  const applyFontSize = (size: string) => {
    if (!size) return;
    run('fontSize', size);
  };

  const applyFontFamily = (font: string) => {
    if (!font) return;
    run('fontName', font);
  };

  const insertImageByUrl = () => {
    const url = window.prompt('Enter image URL (https://...)');
    if (!url) return;
    run('insertImage', url);
  };

  return (
    <div className={cn('rounded-md border border-slate-200 bg-white', className)}>
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 p-2">
        <select
          className="h-8 rounded-md border border-slate-200 bg-white px-2 text-xs text-slate-700"
          defaultValue=""
          onChange={(e) => {
            applyFontFamily(e.target.value);
            e.currentTarget.value = '';
          }}
        >
          <option value="" disabled>
            Font
          </option>
          <option value="Arial">Arial</option>
          <option value="Georgia">Georgia</option>
          <option value="Times New Roman">Times New Roman</option>
          <option value="Verdana">Verdana</option>
          <option value="Courier New">Courier New</option>
        </select>

        <select
          className="h-8 rounded-md border border-slate-200 bg-white px-2 text-xs text-slate-700"
          defaultValue=""
          onChange={(e) => {
            applyFontSize(e.target.value);
            e.currentTarget.value = '';
          }}
        >
          <option value="" disabled>
            Size
          </option>
          <option value="3">Small</option>
          <option value="4">Normal</option>
          <option value="5">Large</option>
          <option value="6">XL</option>
          <option value="7">XXL</option>
        </select>

        <ToolbarButton title="Bold" onClick={() => run('bold')}>
          <Bold className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton title="Italic" onClick={() => run('italic')}>
          <Italic className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton title="Underline" onClick={() => run('underline')}>
          <Underline className="h-4 w-4" />
        </ToolbarButton>

        <ToolbarButton title="Heading" onClick={() => run('formatBlock', 'h3')}>
          <Heading3 className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton title="Paragraph" onClick={() => run('formatBlock', 'p')}>
          <Pilcrow className="h-4 w-4" />
        </ToolbarButton>

        <ToolbarButton title="Bullet List" onClick={() => run('insertUnorderedList')}>
          <List className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton title="Numbered List" onClick={() => run('insertOrderedList')}>
          <ListOrdered className="h-4 w-4" />
        </ToolbarButton>

        <label className="inline-flex h-8 items-center gap-1 rounded-md border border-slate-200 bg-white px-2 text-xs text-slate-700">
          Text
          <input
            type="color"
            className="h-4 w-4 cursor-pointer border-0 p-0"
            onChange={(e) => run('foreColor', e.target.value)}
            title="Text Color"
          />
        </label>

        <label className="inline-flex h-8 items-center gap-1 rounded-md border border-slate-200 bg-white px-2 text-xs text-slate-700">
          Highlight
          <input
            type="color"
            className="h-4 w-4 cursor-pointer border-0 p-0"
            onChange={(e) => run('hiliteColor', e.target.value)}
            title="Highlight Color"
          />
        </label>

        <ToolbarButton title="Align Left" onClick={() => run('justifyLeft')}>
          <AlignLeft className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton title="Align Center" onClick={() => run('justifyCenter')}>
          <AlignCenter className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton title="Align Right" onClick={() => run('justifyRight')}>
          <AlignRight className="h-4 w-4" />
        </ToolbarButton>

        <ToolbarButton title="Insert Image" onClick={insertImageByUrl}>
          <ImagePlus className="h-4 w-4" />
        </ToolbarButton>

        <ToolbarButton title="Clear Formatting" onClick={() => run('removeFormat')}>
          <span className="text-xs font-semibold">Tx</span>
        </ToolbarButton>
      </div>

      <div
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        className="prose prose-sm max-w-none px-3 py-3 focus:outline-none leading-7 text-[15px]"
        style={{ minHeight }}
        data-placeholder={placeholder}
        onInput={(e) => onChange((e.target as HTMLDivElement).innerHTML)}
      />

      <style jsx>{`
        [contenteditable='true']:empty:before {
          content: attr(data-placeholder);
          color: #94a3b8;
          pointer-events: none;
          display: block;
        }
      `}</style>
    </div>
  );
}
