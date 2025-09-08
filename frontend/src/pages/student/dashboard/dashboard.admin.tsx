import { useEditor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { RichTextEditor } from '@mantine/tiptap'

const content = '<p>Subtle rich text editor variant</p>'

export default function Demo() {
  const editor = useEditor({
    // shouldRerenderOnTransaction: true,
    extensions: [StarterKit],
    content,
  })

  return (
    <RichTextEditor editor={editor} variant="subtle">
      <RichTextEditor.Toolbar sticky stickyOffset="var(--docs-header-height)">
        {/* <RichTextEditor.ControlsGroup>
          <RichTextEditor.Bold />
          <RichTextEditor.Italic />
          <RichTextEditor.Underline />
          <RichTextEditor.Strikethrough />
          <RichTextEditor.ClearFormatting />
          <RichTextEditor.Highlight />
          <RichTextEditor.Code />
        </RichTextEditor.ControlsGroup> */}
      </RichTextEditor.Toolbar>

      <RichTextEditor.Content />
    </RichTextEditor>
  )
}
