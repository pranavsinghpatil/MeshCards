import { useState } from 'react';

export default function FileDropZone({ file, onFileSelect, onClear }) {
    const [isDragging, setIsDragging] = useState(false);

    const handleDragOver = (e) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = () => {
        setIsDragging(false);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragging(false);
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            onFileSelect(e.dataTransfer.files[0]);
        }
    };

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files.length > 0) {
            onFileSelect(e.target.files[0]);
        }
    };

    const formatBytes = (bytes) => {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
    };

    return (
        <div
            className="drop-zone"
            style={{ borderColor: isDragging ? 'var(--primary)' : 'var(--border)' }}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => !file && document.getElementById('fileInput').click()}
        >
            <input
                type="file"
                id="fileInput"
                accept=".pdf,.txt,.md"
                onChange={handleFileChange}
                style={{ display: 'none' }}
            />

            {!file ? (
                <div className="drop-content">
                    <div className="icon-circle">
                        <i className="ph-duotone ph-cloud-arrow-up"></i>
                    </div>
                    <h3>Drop your file here</h3>
                    <p>Supports PDF, TXT, MD (Max 10MB)</p>
                    <button type="button" className="btn-secondary">
                        Browse Files
                    </button>
                </div>
            ) : (
                <div className="file-preview">
                    <div className="file-icon">
                        <i className="ph-fill ph-file-pdf"></i>
                    </div>
                    <div className="file-meta">
                        <span className="file-name">{file.name}</span>
                        <span className="file-size">{formatBytes(file.size)}</span>
                    </div>
                    <button
                        type="button"
                        className="btn-icon-sm"
                        onClick={(e) => {
                            e.stopPropagation();
                            onClear();
                        }}
                    >
                        <i className="ph-bold ph-x"></i>
                    </button>
                </div>
            )}
        </div>
    );
}
