import React from 'react';
import { Editor } from '@tinymce/tinymce-react';

// Core + Theme
import 'tinymce/tinymce';
import 'tinymce/icons/default';
import 'tinymce/themes/silver/theme';
import 'tinymce/models/dom/model';
import 'tinymce/themes/silver/theme';
import 'tinymce/skins/ui/oxide/skin.min.css';

// Required plugins
import 'tinymce/plugins/advlist';
import 'tinymce/plugins/autolink';
import 'tinymce/plugins/lists';
import 'tinymce/plugins/link';
import 'tinymce/plugins/image';
import 'tinymce/plugins/charmap';
import 'tinymce/plugins/preview';
import 'tinymce/plugins/anchor';
import 'tinymce/plugins/searchreplace';
import 'tinymce/plugins/visualblocks';
import 'tinymce/plugins/code';
import 'tinymce/plugins/fullscreen';
import 'tinymce/plugins/insertdatetime';
import 'tinymce/plugins/media';
import 'tinymce/plugins/table';
import 'tinymce/plugins/help';
import 'tinymce/plugins/wordcount';

const RichTextEditor = ({input, setInput}) => {
    const handleEditorChange = (content) => {
        setInput({...input, description: content})
    };

    return (
        <Editor
            onEditorChange={handleEditorChange}
            value={input.description}
            init={{
                height: 300,
                menubar: false,
                branding: false,
                license_key: 'gpl',
                plugins: 'lists link advlist autolink paste',
                toolbar:
                    'styleselect | bold italic underline | link | bullist numlist | removeformat',
                style_formats: [
                    { title: 'Heading 1', format: 'h1' },
                    { title: 'Heading 2', format: 'h2' },
                    { title: 'Paragraph', format: 'p' },
                    { title: 'Bullet List', selector: 'ul', classes: 'styled-bullet' },
                    { title: 'Numbered List', selector: 'ol', classes: 'styled-number' },
                ],
                content_style: `
        ul.styled-bullet {
          list-style-type: disc;
          margin-left: 20px;
          color: #333;
        }
        ol.styled-number {
          list-style-type: decimal;
          margin-left: 20px;
          color: #333;
        }
      `
            }}
        />
    );
};

export default RichTextEditor;
