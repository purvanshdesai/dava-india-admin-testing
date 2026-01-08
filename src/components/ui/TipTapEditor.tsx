'use client'

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import { Table } from '@tiptap/extension-table'
import { TableRow } from '@tiptap/extension-table-row'
import { TableCell } from '@tiptap/extension-table-cell'
import { TableHeader } from '@tiptap/extension-table-header'

import { cn } from '@/lib/utils'
import { useEffect } from 'react'
import TiptapToolbar from './TipTapToolBar'

type Props = {
  value: string
  onChange: (value: string) => void
  readOnly?: boolean
  placeholder?: string
  className?: string
  editorClassName?: string
}

export default function TiptapEditor({
  value,
  onChange,
  readOnly = false,
  placeholder = 'Write something...',
  className = '',
  editorClassName = ''
}: Props) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({ placeholder }),
      Table.configure({
        resizable: true // allows resizing columns
      }),
      TableRow,
      TableHeader,
      TableCell
    ],
    content: value,
    editable: !readOnly,
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class: cn('outline-none min-h-[150px]', editorClassName)
      }
    },
    onUpdate: ({ editor }) => {
      const html = editor.getHTML()
      onChange(html)
    }
  })

  // Sync external value updates
  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value || '')
    }
  }, [value, editor])

  return (
    <div
      className={cn(
        'prose border-input bg-background focus-within:ring-ring min-h-[150px] w-full rounded-md border p-3 text-sm shadow-sm focus-within:ring-2',
        className
      )}
    >
      <TiptapToolbar editor={editor} />
      <EditorContent editor={editor} className='editor-content' />
    </div>
  )
}
