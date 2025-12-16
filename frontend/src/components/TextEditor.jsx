import { useState } from 'react';

export default function TextEditor({ text, onChange }) {
    const handlePaste = async () => {
        try {
            const clipboardText = await navigator.clipboard.readText();
            onChange(clipboardText);
        } catch (err) {
            console.error('Failed to read clipboard', err);
        }
    };

    return (
        <div className="text-editor">
            <div className="editor-toolbar">
                <span className="label">Content</span>
                <div className="tools">
                    <button type="button" onClick={handlePaste} title="Paste">
                        <i className="ph ph-clipboard"></i>
                    </button>
                    <button type="button" onClick={() => onChange('')} title="Clear">
                        <i className="ph ph-trash"></i>
                    </button>
                </div>
            </div>
            <textarea
                value={text}
                onChange={(e) => onChange(e.target.value)}
                placeholder="Paste your notes, article, or documentation here..."
            ></textarea>
            <div className="editor-footer">
                <span className="char-count">
                    {text ? text.length : 0} characters
                </span>
            </div>
        </div>
    );
}
