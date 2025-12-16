import { useState, useEffect } from 'react';
import FileDropZone from './FileDropZone';
import TextEditor from './TextEditor';
import ConfigPanel from './ConfigPanel';

export default function Studio({ session }) {
    const [activeTab, setActiveTab] = useState('file');
    const [file, setFile] = useState(null);
    const [text, setText] = useState('');
    const [appConfig, setAppConfig] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [status, setStatus] = useState(null);

    // Fetch Config
    useEffect(() => {
        fetch('/api/config')
            .then((res) => res.json())
            .then((data) => setAppConfig(data))
            .catch((err) => console.error('Failed to load config', err));
    }, []);

    const handleGenerate = async (formData) => {
        setStatus(null);
        setIsLoading(true);

        try {
            const payload = new FormData();

            // Add Source
            if (activeTab === 'file') {
                if (!file) throw new Error('Please upload a file.');
                payload.append('file', file);
            } else {
                if (!text.trim()) throw new Error('Please enter some text.');
                payload.append('text', text);
            }

            // Add Config
            Object.keys(formData).forEach(key => {
                payload.append(key, formData[key]);
            });

            // 1. Submit Job
            const res = await fetch('/generate', {
                method: 'POST',
                headers: {
                    'Authorization': session ? `Bearer ${session.access_token}` : ''
                },
                body: payload,
            });

            if (!res.ok) {
                const errText = await res.text();
                let errMsg = "Generation failed";
                try {
                    const json = JSON.parse(errText);
                    if (json.detail) errMsg = json.detail;
                } catch (e) { }
                throw new Error(errMsg);
            }

            const { job_id } = await res.json();
            setStatus({ type: 'success', message: 'Processing with AI...' });

            // 2. Poll for Status
            await pollJob(job_id);

            // 3. Download
            setStatus({ type: 'success', message: 'Downloading deck...' });
            const downloadLink = document.createElement('a');
            downloadLink.href = `/download/${job_id}`;
            document.body.appendChild(downloadLink);
            downloadLink.click();
            document.body.removeChild(downloadLink);

            setStatus({ type: 'success', message: 'Deck generated successfully!' });

        } catch (err) {
            setStatus({ type: 'error', message: err.message });
        } finally {
            setIsLoading(false);
        }
    };

    const pollJob = async (jobId) => {
        const maxRetries = 60;
        let attempts = 0;

        while (attempts < maxRetries) {
            await new Promise(r => setTimeout(r, 2000));
            const res = await fetch(`/status/${jobId}`);
            if (!res.ok) throw new Error("Status check failed");

            const data = await res.json();
            if (data.status === 'completed') return true;
            if (data.status === 'failed') throw new Error(data.error || "Generation failed");
            attempts++;
        }
        throw new Error("Timeout waiting for generation");
    };

    return (
        <div className="studio-grid">
            <form className="studio-form" onSubmit={(e) => e.preventDefault()}>
                {/* Left Column: Source */}
                <section className="panel source-panel">
                    <div className="panel-header">
                        <h2>
                            <i className="ph-duotone ph-file-text"></i> Source Material
                        </h2>
                        <p>Upload documents or paste text to generate cards from.</p>
                    </div>

                    <div className="tabs">
                        <button
                            type="button"
                            className={`tab-btn ${activeTab === 'file' ? 'active' : ''}`}
                            onClick={() => setActiveTab('file')}
                        >
                            <i className="ph ph-upload-simple"></i> Upload File
                        </button>
                        <button
                            type="button"
                            className={`tab-btn ${activeTab === 'text' ? 'active' : ''}`}
                            onClick={() => setActiveTab('text')}
                        >
                            <i className="ph ph-text-aa"></i> Paste Text
                        </button>
                    </div>

                    <div className={`input-area ${activeTab === 'file' ? 'active' : ''}`}>
                        <FileDropZone
                            file={file}
                            onFileSelect={setFile}
                            onClear={() => setFile(null)}
                        />
                    </div>

                    <div className={`input-area ${activeTab === 'text' ? 'active' : ''}`}>
                        <TextEditor text={text} onChange={setText} />
                    </div>
                </section>

                {/* Right Column: Config */}
                <ConfigPanel
                    config={appConfig}
                    onSubmit={handleGenerate}
                    isLoading={isLoading}
                    status={status}
                />
            </form>
        </div>
    );
}
