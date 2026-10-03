import React, { useEffect, useRef } from 'react';
import Quill from 'quill';

interface RichTextEditorProps {
  value: string;
  onChange: (content: string) => void;
  placeholder?: string;
}

export const RichTextEditor: React.FC<RichTextEditorProps> = ({
  value,
  onChange,
  placeholder = 'Write your monograph narrative here...',
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const quillInstanceRef = useRef<Quill | null>(null);
  const isUpdatingFromProps = useRef<boolean>(false);

  useEffect(() => {
    if (!containerRef.current) return;

    // Create toolbar container and editor container dynamically to prevent re-initialization leaks
    containerRef.current.innerHTML = '';
    const editorDiv = document.createElement('div');
    containerRef.current.appendChild(editorDiv);

    const toolbarOptions = [
      [{ header: [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      ['blockquote', 'code-block'],
      [{ list: 'ordered' }, { list: 'bullet' }],
      ['link'],
      ['clean'],
    ];

    const quill = new Quill(editorDiv, {
      theme: 'snow',
      placeholder,
      modules: {
        toolbar: toolbarOptions,
      },
    });

    quillInstanceRef.current = quill;

    // Initial content population
    if (value) {
      isUpdatingFromProps.current = true;
      quill.root.innerHTML = value;
      isUpdatingFromProps.current = false;
    }

    // Text change listener
    quill.on('text-change', () => {
      if (isUpdatingFromProps.current) return;
      const html = quill.root.innerHTML;
      // Handle empty quill editor
      if (html === '<p><br></p>' || html === '<p></p>') {
        onChange('');
      } else {
        onChange(html);
      }
    });

    return () => {
      quillInstanceRef.current = null;
    };
  }, []);

  // Update content if value changes from outside (e.g. data fetch in edit mode)
  useEffect(() => {
    const quill = quillInstanceRef.current;
    if (!quill) return;

    const currentHtml = quill.root.innerHTML;
    const cleanCurrent = currentHtml === '<p><br></p>' ? '' : currentHtml;
    const cleanNew = value === '<p><br></p>' ? '' : value;

    if (cleanNew !== cleanCurrent && !isUpdatingFromProps.current) {
      isUpdatingFromProps.current = true;
      quill.root.innerHTML = cleanNew || '';
      isUpdatingFromProps.current = false;
    }
  }, [value]);

  return (
    <div className="rich-text-editor-container">
      <div ref={containerRef} />
    </div>
  );
};
