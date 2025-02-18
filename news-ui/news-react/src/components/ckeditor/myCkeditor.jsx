import { useState, useEffect, useRef } from 'react';
import { CKEditor } from '@ckeditor/ckeditor5-react';
import './myCkeditor.scss'
import {
    HtmlEmbed,
    ClassicEditor,
    AccessibilityHelp,
    SourceEditing,
    Alignment,
    Autoformat,
    AutoImage,
    AutoLink,
    Autosave,
    Base64UploadAdapter,
    BlockQuote,
    Bold,
    Code,
    Essentials,
    FindAndReplace,
    FontBackgroundColor,
    FontColor,
    FontFamily,
    FontSize,
    GeneralHtmlSupport,
    Heading,
    Highlight,
    HorizontalLine,
    ImageBlock,
    ImageCaption,
    ImageInline,
    ImageInsert,
    ImageInsertViaUrl,
    ImageResize,
    ImageStyle,
    ImageTextAlternative,
    ImageToolbar,
    ImageUpload,
    Indent,
    IndentBlock,
    Italic,
    Link,
    LinkImage,
    List,
    ListProperties,
    // Markdown,
    MediaEmbed,
    PageBreak,
    Paragraph,
    PasteFromMarkdownExperimental,
    PasteFromOffice,
    RemoveFormat,
    SelectAll,
    SpecialCharacters,
    SpecialCharactersArrows,
    SpecialCharactersCurrency,
    SpecialCharactersEssentials,
    SpecialCharactersLatin,
    SpecialCharactersMathematical,
    SpecialCharactersText,
    Strikethrough,
    Style,
    Subscript,
    Superscript,
    Table,
    TableCaption,
    TableCellProperties,
    TableColumnResize,
    TableProperties,
    TableToolbar,
    TextTransformation,
    TodoList,
    Underline,
    Undo,
    HtmlComment,
    Clipboard,
    CodeBlock,
    Image,
    ShowBlocks,
    ImageResizeEditing,
    ImageResizeHandles
} from 'ckeditor5';

import 'ckeditor5/ckeditor5.css';
const sanitize = (inputHtml) => {
    // Implement your sanitization logic here
    // This is just a placeholder, you should use a proper HTML sanitizer
    return inputHtml.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
};

export default function MyCkeditor({ onDataChange, initData, isView }) {

    const editorConfig = {
        toolbar: {
            items: [
                'specialCharacters',
                'showBlocks',
                'selectAll',
                'mediaEmbed',
                // 'resizeImage',
                'codeBlock'
                , 'horizontalLine',
                'htmlEmbed',
                'undo',
                'redo',
                'SourceEditing',
                '|',
                'heading',
                'style',
                '|',
                'fontSize',
                'fontFamily',
                'fontColor',
                'fontBackgroundColor',
                '|',
                'bold',
                'italic',
                'underline',
                '|',
                'link',
                'insertImage',
                'insertTable',
                'highlight',
                'blockQuote',
                '|',
                'alignment',
                '|',
                'bulletedList',
                'numberedList',
                'todoList',
                'outdent',
                'indent',
                'findAndReplace'
            ],
            shouldNotGroupWhenFull: true
        },
        plugins: [
            ImageResizeEditing,
            ImageResizeHandles,
            ShowBlocks,
            CodeBlock,
            Clipboard,
            HtmlEmbed,
            HtmlComment,
            AccessibilityHelp,
            SourceEditing,
            Alignment,
            Autoformat,
            AutoImage,
            AutoLink,
            Autosave,
            Base64UploadAdapter,
            BlockQuote,
            Bold,
            Code,
            Essentials,
            FindAndReplace,
            FontBackgroundColor,
            FontColor,
            FontFamily,
            FontSize,
            GeneralHtmlSupport,
            Heading,
            Highlight,
            HorizontalLine,
            ImageBlock,
            ImageCaption,
            ImageInline,
            ImageInsert,
            ImageInsertViaUrl,
            ImageResize,
            ImageStyle,
            ImageTextAlternative,
            ImageToolbar,
            ImageUpload,
            Indent,
            IndentBlock,
            Italic,
            Link,
            LinkImage,
            List,
            ListProperties,
            // Markdown,
            MediaEmbed,
            PageBreak,
            Paragraph,
            PasteFromMarkdownExperimental,
            PasteFromOffice,
            RemoveFormat,
            SelectAll,
            SpecialCharacters,
            SpecialCharactersArrows,
            SpecialCharactersCurrency,
            SpecialCharactersEssentials,
            SpecialCharactersLatin,
            SpecialCharactersMathematical,
            SpecialCharactersText,
            Strikethrough,
            Style,
            Subscript,
            Superscript,
            Table,
            TableCaption,
            TableCellProperties,
            TableColumnResize,
            TableProperties,
            TableToolbar,
            TextTransformation,
            TodoList,
            Underline,
            Undo,
            Image
        ],
        fontFamily: {
            supportAllValues: true
        },
        fontSize: {
            options: [10, 12, 14, 'default', 18, 20, 22],
            supportAllValues: true
        },
        mediaEmbed: {
            previewsInData: true,
            providers: [
                {
                    name: 'youtube',
                    url: [
                        /^(?:m\.)?youtube\.com\/watch\?v=([\w-]+)/,
                        /^(?:m\.)?youtube\.com\/v\/([\w-]+)/,
                        /^youtube\.com\/embed\/([\w-]+)/,
                        /^youtu\.be\/([\w-]+)/
                    ],
                    html: match => {
                        const id = match[1];
                        return (
                            '<div style="position: relative; padding-bottom: 100%; height: 0; padding-bottom: 56.2493%;">' +
                            '<iframe src="https://www.youtube.com/embed/' + id + '" ' +
                            'style="position: absolute; width: 100%; height: 100%; top: 0; left: 0;" ' +
                            'frameborder="0" allow="autoplay; encrypted-media" allowfullscreen>' +
                            '</iframe>' +
                            '</div>'
                        );
                    }
                }
            ]
        },
        heading: {
            options: [
                {
                    model: 'paragraph',
                    title: 'Paragraph',
                    class: 'ck-heading_paragraph'
                },
                {
                    model: 'heading1',
                    view: 'h1',
                    title: 'Heading 1',
                    class: 'ck-heading_heading1'
                },
                {
                    model: 'heading2',
                    view: 'h2',
                    title: 'Heading 2',
                    class: 'ck-heading_heading2'
                },
                {
                    model: 'heading3',
                    view: 'h3',
                    title: 'Heading 3',
                    class: 'ck-heading_heading3'
                },
                {
                    model: 'heading4',
                    view: 'h4',
                    title: 'Heading 4',
                    class: 'ck-heading_heading4'
                },
                {
                    model: 'heading5',
                    view: 'h5',
                    title: 'Heading 5',
                    class: 'ck-heading_heading5'
                },
                {
                    model: 'heading6',
                    view: 'h6',
                    title: 'Heading 6',
                    class: 'ck-heading_heading6'
                }
            ]
        },
        htmlSupport: {
            allow: [
                {
                    name: /^.*$/,
                    styles: true,
                    attributes: true,
                    classes: true
                }
            ]
        },
        image: {
            // insert: {
            //     type: 'auto'
            // },
            toolbar: [
                'toggleImageCaption',
                'imageTextAlternative',
                '|',
                'imageStyle:inline',
                'imageStyle:wrapText',
                'imageStyle:breakText',
                '|',
                'resizeImage'
            ]
        },
        initialData: initData || '',
        link: {
            addTargetToExternalLinks: true,
            defaultProtocol: 'https://',
            decorators: {
                toggleDownloadable: {
                    mode: 'manual',
                    label: 'Downloadable',
                    attributes: {
                        download: 'file'
                    }
                }
            }
        },
        list: {
            properties: {
                styles: true,
                startIndex: true,
                reversed: true
            }
        },
        menuBar: {
            isVisible: true
        },
        placeholder: 'Nhập nội dung bài viết tại đây',
        style: {
            definitions: [
                {
                    name: 'Article category',
                    element: 'h3',
                    classes: ['category']
                },
                {
                    name: 'Title',
                    element: 'h2',
                    classes: ['document-title']
                },
                {
                    name: 'Subtitle',
                    element: 'h3',
                    classes: ['document-subtitle']
                },
                {
                    name: 'Info box',
                    element: 'p',
                    classes: ['info-box']
                },
                {
                    name: 'Side quote',
                    element: 'blockquote',
                    classes: ['side-quote']
                },
                {
                    name: 'Marker',
                    element: 'span',
                    classes: ['marker']
                },
                {
                    name: 'Spoiler',
                    element: 'span',
                    classes: ['spoiler']
                },
                {
                    name: 'Code (dark)',
                    element: 'pre',
                    classes: ['fancy-code', 'fancy-code-dark']
                },
                {
                    name: 'Code (bright)',
                    element: 'pre',
                    classes: ['fancy-code', 'fancy-code-bright']
                }
            ]
        },
        table: {
            contentToolbar: ['tableColumn', 'tableRow', 'mergeTableCells', 'tableProperties', 'tableCellProperties', 'toggleTableCaption']
        },
        htmlEmbed: {
            showPreviews: true,
            sanitizeHtml: (inputHtml) => {
                const outputHtml = sanitize(inputHtml);
                return {
                    html: outputHtml,
                    hasChanged: inputHtml !== outputHtml
                };
            }
        },

    };

    const editorContainerRef = useRef(null);
    const editorRef = useRef(null);
    const [isLayoutReady, setIsLayoutReady] = useState(false);
    const [editorData, setEditorData] = useState(initData || '');
    const [editorInstance, setEditorInstance] = useState(null);
    useEffect(() => {
        setIsLayoutReady(true);
        return () => setIsLayoutReady(false);
    }, []);
    useEffect(() => {
        if (onDataChange) {
            onDataChange(editorData);
        }
    }, [editorData, onDataChange]);
    useEffect(() => {
        if (editorInstance && initData !== undefined && initData !== editorData) {
            editorInstance.setData(initData);
            setEditorData(initData);
        }
    }, [initData, editorInstance]);
    useEffect(() => {
        if (editorInstance) {
            const toolbarElement = editorInstance.ui.view.toolbar.element;

            if (isView) {
                editorInstance.enableReadOnlyMode('view-mode');
                toolbarElement.style.display = 'none';
            } else {
                editorInstance.disableReadOnlyMode('view-mode');
                toolbarElement.style.display = 'flex';
            }
        }
    }, [isView, editorInstance]);


    return (
        <div>
            <div className="main-container-content">
                <div className="editor-container editor-container_classic-editor editor-container_include-style" ref={editorContainerRef}>
                    <div className="editor-container__editor">
                        <div ref={editorRef}>{isLayoutReady &&
                            <CKEditor editor={ClassicEditor}
                                data={initData}
                                onReady={(editor) => {
                                    setEditorInstance(editor);
                                    if (isView) {
                                        editor.enableReadOnlyMode('view-mode');
                                    }
                                }}
                                config={editorConfig}
                                onChange={(event, editor) => {
                                    setEditorData(editor.getData());
                                    if (!isView) {
                                        setEditorData(editor.getData());
                                    }
                                }}
                                disabled={isView}
                            />}</div>
                    </div>
                </div>
            </div>
        </div>
    );
}
