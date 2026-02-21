import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import TextAlign from '@tiptap/extension-text-align';
import { FontFamily } from '@tiptap/extension-font-family';
import { TextStyle } from '@tiptap/extension-text-style';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  List,
  ListOrdered,
  Heading1,
  Heading2,
  Heading3,
  Quote,
  Code,
  Link as LinkIcon,
  Image as ImageIcon,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Undo,
  Redo,
  Wand2,
  RemoveFormatting,
  FileText,
} from 'lucide-react';
import { useCallback, useEffect } from 'react';
import { marked } from 'marked';

interface RichTextEditorProps {
  content: string;
  onChange: (html: string) => void;
  placeholder?: string;
}

const RichTextEditor = ({ content, onChange, placeholder = 'Start writing...' }: RichTextEditorProps) => {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3, 4, 5, 6],
        },
      }),
      Underline,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-primary underline',
        },
      }),
      Image.configure({
        HTMLAttributes: {
          class: 'rounded-lg my-4 max-w-full',
        },
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      TextStyle,
      FontFamily.configure({
        types: ['textStyle'],
      }),
    ],
    content,
    editorProps: {
      attributes: {
        class: 'prose prose-neutral dark:prose-invert sm:prose lg:prose-lg max-w-none focus:outline-none min-h-[300px] p-4 border rounded-md',
      },
    },
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content);
    }
  }, [content, editor]);

  const addLink = useCallback(() => {
    if (!editor) return;

    const previousUrl = editor.getAttributes('link').href;
    const url = window.prompt('Enter URL:', previousUrl);

    if (url === null) return;

    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }

    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
  }, [editor]);

  const addImage = useCallback(() => {
    if (!editor) return;

    const url = window.prompt('Enter image URL:');

    if (url) {
      editor.chain().focus().setImage({ src: url }).run();
    }
  }, [editor]);

  const autoFormat = useCallback(() => {
    if (!editor) return;

    // Auto-format: Clean up spacing, ensure proper paragraph breaks
    const content = editor.getHTML();

    // Remove empty paragraphs
    let formatted = content.replace(/<p><\/p>/g, '');

    // Ensure proper spacing between elements
    formatted = formatted.replace(/<\/p><p>/g, '</p>\n<p>');
    formatted = formatted.replace(/<\/h([1-6])><p>/g, '</h$1>\n\n<p>');
    formatted = formatted.replace(/<\/p><h([1-6])>/g, '</p>\n\n<h$1>');

    editor.commands.setContent(formatted);
  }, [editor]);

  const setFontFamily = useCallback((font: string) => {
    if (!editor) return;

    if (font === 'default') {
      editor.chain().focus().unsetFontFamily().run();
    } else {
      editor.chain().focus().setFontFamily(font).run();
    }
  }, [editor]);

  const importMarkdown = useCallback(() => {
    if (!editor) return;

    const markdown = window.prompt('Paste your Markdown content here:');

    if (markdown) {
      try {
        // Convert markdown to HTML
        const html = marked.parse(markdown);
        // Set the content in the editor
        editor.commands.setContent(html);
      } catch (error) {
        console.error('Error parsing markdown:', error);
        alert('Error parsing markdown. Please check your markdown syntax.');
      }
    }
  }, [editor]);

  if (!editor) {
    return null;
  }

  const ToolbarButton = ({ onClick, active, disabled, children, title }: any) => (
    <Button
      type="button"
      variant={active ? 'default' : 'outline'}
      size="sm"
      onClick={onClick}
      disabled={disabled}
      title={title}
      className="h-8 w-8 p-0"
    >
      {children}
    </Button>
  );

  return (
    <div className="border rounded-lg overflow-hidden">
      {/* Toolbar */}
      <div className="bg-muted/50 border-b p-2 flex flex-wrap gap-1">
        {/* Text Formatting */}
        <div className="flex gap-1 border-r pr-2">
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleBold().run()}
            active={editor.isActive('bold')}
            title="Bold (Ctrl+B)"
          >
            <Bold className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleItalic().run()}
            active={editor.isActive('italic')}
            title="Italic (Ctrl+I)"
          >
            <Italic className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            active={editor.isActive('underline')}
            title="Underline (Ctrl+U)"
          >
            <UnderlineIcon className="h-4 w-4" />
          </ToolbarButton>
        </div>

        {/* Headings */}
        <div className="flex gap-1 border-r pr-2">
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
            active={editor.isActive('heading', { level: 1 })}
            title="Heading 1"
          >
            <Heading1 className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            active={editor.isActive('heading', { level: 2 })}
            title="Heading 2"
          >
            <Heading2 className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
            active={editor.isActive('heading', { level: 3 })}
            title="Heading 3"
          >
            <Heading3 className="h-4 w-4" />
          </ToolbarButton>
        </div>

        {/* Lists */}
        <div className="flex gap-1 border-r pr-2">
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            active={editor.isActive('bulletList')}
            title="Bullet List"
          >
            <List className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            active={editor.isActive('orderedList')}
            title="Numbered List"
          >
            <ListOrdered className="h-4 w-4" />
          </ToolbarButton>
        </div>

        {/* Alignment */}
        <div className="flex gap-1 border-r pr-2">
          <ToolbarButton
            onClick={() => editor.chain().focus().setTextAlign('left').run()}
            active={editor.isActive({ textAlign: 'left' })}
            title="Align Left"
          >
            <AlignLeft className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().setTextAlign('center').run()}
            active={editor.isActive({ textAlign: 'center' })}
            title="Align Center"
          >
            <AlignCenter className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().setTextAlign('right').run()}
            active={editor.isActive({ textAlign: 'right' })}
            title="Align Right"
          >
            <AlignRight className="h-4 w-4" />
          </ToolbarButton>
        </div>

        {/* More Options */}
        <div className="flex gap-1 border-r pr-2">
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            active={editor.isActive('blockquote')}
            title="Quote"
          >
            <Quote className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleCodeBlock().run()}
            active={editor.isActive('codeBlock')}
            title="Code Block"
          >
            <Code className="h-4 w-4" />
          </ToolbarButton>
        </div>

        {/* Insert */}
        <div className="flex gap-1 border-r pr-2">
          <ToolbarButton
            onClick={addLink}
            active={editor.isActive('link')}
            title="Add Link"
          >
            <LinkIcon className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={addImage}
            title="Add Image"
          >
            <ImageIcon className="h-4 w-4" />
          </ToolbarButton>
        </div>

        {/* Font Family */}
        <div className="border-r pr-2">
          <Select onValueChange={setFontFamily} defaultValue="default">
            <SelectTrigger className="h-8 w-32 text-xs">
              <SelectValue placeholder="Font" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="default">Default</SelectItem>
              <SelectItem value="serif">Serif</SelectItem>
              <SelectItem value="monospace">Monospace</SelectItem>
              <SelectItem value="'Comic Sans MS'">Comic Sans</SelectItem>
              <SelectItem value="'Courier New'">Courier</SelectItem>
              <SelectItem value="Georgia">Georgia</SelectItem>
              <SelectItem value="'Times New Roman'">Times New Roman</SelectItem>
              <SelectItem value="Arial">Arial</SelectItem>
              <SelectItem value="Verdana">Verdana</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Actions */}
        <div className="flex gap-1 border-r pr-2">
          <ToolbarButton
            onClick={() => editor.chain().focus().undo().run()}
            disabled={!editor.can().undo()}
            title="Undo"
          >
            <Undo className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().redo().run()}
            disabled={!editor.can().redo()}
            title="Redo"
          >
            <Redo className="h-4 w-4" />
          </ToolbarButton>
        </div>

        {/* Auto Format & Clear */}
        <div className="flex gap-1">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={importMarkdown}
            title="Import Markdown"
            className="h-8 text-xs px-2"
          >
            <FileText className="h-4 w-4 mr-1" />
            Import MD
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={autoFormat}
            title="Auto-format document"
            className="h-8 text-xs px-2"
          >
            <Wand2 className="h-4 w-4 mr-1" />
            Auto Format
          </Button>
          <ToolbarButton
            onClick={() => editor.chain().focus().unsetAllMarks().clearNodes().run()}
            title="Clear Formatting"
          >
            <RemoveFormatting className="h-4 w-4" />
          </ToolbarButton>
        </div>
      </div>

      {/* Editor */}
      <EditorContent editor={editor} />
    </div>
  );
};

export default RichTextEditor;
