'use client'

import {
  Bold,
  Italic,
  Underline,
  Redo2,
  Undo2,
  List,
  ListOrdered,
  Heading1,
  Heading2,
  Table as TableIcon,
  Rows,
  Columns,
  XSquare,
  Plus,
  Minus
} from 'lucide-react'
import { Editor } from '@tiptap/react'
import { Button } from '@/components/ui/button'

export default function TiptapToolbar({ editor }: { editor: Editor | null }) {
  if (!editor) return null

  return (
    <div className='bg-muted supports-[backdrop-filter]:bg-muted/80 sticky top-0 z-10 mb-2 flex flex-wrap items-center gap-2 rounded-md border px-3 py-2 backdrop-blur'>
      {/* Text formatting */}
      <Button
        type='button'
        size='icon'
        variant='ghost'
        onClick={() => editor.chain().focus().toggleBold().run()}
        className={editor.isActive('bold') ? 'bg-primary text-white' : ''}
      >
        <Bold size={16} />
      </Button>

      <Button
        type='button'
        size='icon'
        variant='ghost'
        onClick={() => editor.chain().focus().toggleItalic().run()}
        className={editor.isActive('italic') ? 'bg-primary text-white' : ''}
      >
        <Italic size={16} />
      </Button>

      <Button
        type='button'
        size='icon'
        variant='ghost'
        onClick={() => editor.chain().focus().toggleUnderline().run()}
        className={editor.isActive('underline') ? 'bg-primary text-white' : ''}
      >
        <Underline size={16} />
      </Button>

      {/* Headings */}
      <Button
        type='button'
        size='icon'
        variant='ghost'
        onClick={() => {
          editor.chain().focus().toggleHeading({ level: 1 }).run()
        }}
        className={
          editor.isActive('heading', { level: 1 })
            ? 'bg-primary text-white'
            : ''
        }
      >
        <Heading1 size={16} />
      </Button>

      <Button
        type='button'
        size='icon'
        variant='ghost'
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        className={
          editor.isActive('heading', { level: 2 })
            ? 'bg-primary text-white'
            : ''
        }
      >
        <Heading2 size={16} />
      </Button>

      {/* Lists */}
      <Button
        type='button'
        size='icon'
        variant='ghost'
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        className={editor.isActive('bulletList') ? 'bg-primary text-white' : ''}
      >
        <List size={16} />
      </Button>

      <Button
        type='button'
        size='icon'
        variant='ghost'
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        className={
          editor.isActive('orderedList') ? 'bg-primary text-white' : ''
        }
      >
        <ListOrdered size={16} />
      </Button>

      {/* Undo / Redo */}
      <Button
        type='button'
        size='icon'
        variant='ghost'
        onClick={() => editor.chain().focus().undo().run()}
      >
        <Undo2 size={16} />
      </Button>

      <Button
        type='button'
        size='icon'
        variant='ghost'
        onClick={() => editor.chain().focus().redo().run()}
      >
        <Redo2 size={16} />
      </Button>

      {/* --- Table Controls --- */}
      <div className='ml-2 flex gap-1'>
        <Button
          type='button'
          size='icon'
          variant='ghost'
          onClick={() =>
            editor
              .chain()
              .focus()
              .insertTable({ rows: 3, cols: 3, withHeaderRow: true })
              .run()
          }
        >
          <TableIcon size={16} />
        </Button>

        <Button
          type='button'
          size='icon'
          variant='ghost'
          onClick={() => editor.chain().focus().addRowAfter().run()}
        >
          <Rows size={16} />
          <Plus size={12} />
        </Button>

        <Button
          type='button'
          size='icon'
          variant='ghost'
          onClick={() => editor.chain().focus().deleteRow().run()}
        >
          <Rows size={16} />
          <Minus size={12} />
        </Button>

        <Button
          type='button'
          size='icon'
          variant='ghost'
          onClick={() => editor.chain().focus().addColumnAfter().run()}
        >
          <Columns size={16} />
          <Plus size={12} />
        </Button>

        <Button
          type='button'
          size='icon'
          variant='ghost'
          onClick={() => editor.chain().focus().deleteColumn().run()}
        >
          <Columns size={16} />
          <Minus size={12} />
        </Button>

        <Button
          type='button'
          size='icon'
          variant='ghost'
          onClick={() => editor.chain().focus().deleteTable().run()}
        >
          <XSquare size={16} />
        </Button>
      </div>
    </div>
  )
}
