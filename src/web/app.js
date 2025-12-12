document.addEventListener('DOMContentLoaded', () => {
    // --- Elements ---
    const form = document.getElementById('generateForm');
    const submitBtn = document.getElementById('submitBtn');
    const statusMessage = document.getElementById('statusMessage');

    // Landing Page
    const landingPage = document.getElementById('landing-page');
    const appContainer = document.getElementById('app-container');
    const startBtn = document.getElementById('startBtn');

    // Tabs
    const tabs = document.querySelectorAll('.tab-btn');
    const inputAreas = document.querySelectorAll('.input-area');
    let activeTab = 'file';

    // File Upload
    const dropZone = document.getElementById('dropZone');
    const fileInput = document.getElementById('file');
    const fileInfo = document.getElementById('fileInfo');
    const dropContent = document.querySelector('.drop-content');
    const removeFileBtn = document.getElementById('removeFileBtn');
    const fileNameDisplay = document.querySelector('.file-name');
    const fileSizeDisplay = document.querySelector('.file-size');

    // Text Editor
    const textArea = document.getElementById('text');
    const charCount = document.querySelector('.char-count');
    const pasteBtn = document.getElementById('pasteBtn');
    const clearTextBtn = document.getElementById('clearTextBtn');

    // Sliders
    const cardCountInput = document.getElementById('max_cards');
    const cardCountVal = document.getElementById('cardCountVal');

    // Model Selection logic
    const providerRadios = document.querySelectorAll('input[name="provider"]');
    const modelSelect = document.getElementById('model');
    const ollamaOption = document.getElementById('ollama-option');
    const imageGenGroup = document.getElementById('image-gen-group');
    const imageComingSoon = document.getElementById('ai-coming-soon');

    // --- Hero Logic ---
    startBtn.addEventListener('click', () => {
        landingPage.classList.add('slide-up');
        appContainer.classList.remove('hidden');
        appContainer.classList.add('visible');
    });

    // --- Config Fetching ---
    fetch('/api/config')
        .then(res => res.json())
        .then(config => {
            // Hide Ollama if disabled (Production)
            if (!config.enable_ollama && ollamaOption) {
                ollamaOption.style.display = 'none';
                // If Ollama was checked, switch to Gemini
                const ollamaRadio = document.querySelector('input[value="ollama"]');
                if (ollamaRadio.checked) {
                    document.querySelector('input[value="gemini"]').click();
                }
            }

            // Hide Images if disabled
            if (!config.enable_images) {
                if (imageGenGroup) imageGenGroup.style.display = 'none';
                if (imageComingSoon) imageComingSoon.style.display = 'flex';
            } else {
                if (imageGenGroup) imageGenGroup.style.display = 'flex';
                if (imageComingSoon) imageComingSoon.style.display = 'none';
            }
        })
        .catch(console.error);

    const models = {
        gemini: [
            { id: 'gemini-1.5-flash', name: 'Gemini 1.5 Flash (Fast)' },
            { id: 'gemini-1.5-pro', name: 'Gemini 1.5 Pro (Best Quality)' }
        ],
        openai: [
            { id: 'gpt-4o', name: 'GPT-4o (Smartest)' },
            { id: 'gpt-4-turbo', name: 'GPT-4 Turbo' },
            { id: 'gpt-3.5-turbo', name: 'GPT-3.5 Turbo (Fast)' }
        ],
        ollama: [
            { id: 'llama3', name: 'Llama 3 (8B)' },
            { id: 'mistral', name: 'Mistral (7B)' },
            { id: 'gemma', name: 'Gemma (7B)' },
            { id: 'deepSeek-coder', name: 'DeepSeek Coder' }
        ]
    };

    function updateModelOptions(provider) {
        modelSelect.innerHTML = '';
        const options = models[provider] || [];
        options.forEach(opt => {
            const el = document.createElement('option');
            el.value = opt.id;
            el.textContent = opt.name;
            modelSelect.appendChild(el);
        });
    }

    // Init with default (Gemini)
    updateModelOptions('gemini');

    providerRadios.forEach(radio => {
        radio.addEventListener('change', (e) => {
            if (e.target.checked) {
                updateModelOptions(e.target.value);
            }
        });
    });

    // --- Tab Logic ---
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            activeTab = tab.dataset.tab;

            inputAreas.forEach(area => {
                if (area.id === `${activeTab}-section`) {
                    area.classList.add('active');
                } else {
                    area.classList.remove('active');
                }
            });
        });
    });

    // --- File Logic ---
    dropZone.addEventListener('click', (e) => {
        if (e.target !== removeFileBtn && !fileInfo.contains(e.target)) {
            fileInput.click();
        }
    });

    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        dropZone.addEventListener(eventName, (e) => {
            e.preventDefault();
            e.stopPropagation();
        });
    });

    dropZone.addEventListener('dragover', () => dropZone.style.borderColor = 'var(--primary)');
    dropZone.addEventListener('dragleave', () => dropZone.style.borderColor = 'var(--border)');

    dropZone.addEventListener('drop', (e) => {
        dropZone.style.borderColor = 'var(--border)';
        const files = e.dataTransfer.files;
        handleFiles(files);
    });

    fileInput.addEventListener('change', () => handleFiles(fileInput.files));

    function handleFiles(files) {
        if (files.length) {
            const file = files[0];
            fileInput.files = files;
            fileNameDisplay.textContent = file.name;
            fileSizeDisplay.textContent = formatBytes(file.size);
            dropContent.classList.add('hidden');
            fileInfo.classList.remove('hidden');
        }
    }

    removeFileBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        fileInput.value = '';
        fileInfo.classList.add('hidden');
        dropContent.classList.remove('hidden');
    });

    function formatBytes(bytes) {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
    }

    // --- Text Logic ---
    textArea.addEventListener('input', () => {
        charCount.textContent = `${textArea.value.length} characters`;
    });

    pasteBtn.addEventListener('click', async () => {
        try {
            const text = await navigator.clipboard.readText();
            textArea.value = text;
            charCount.textContent = `${text.length} characters`;
        } catch (err) { console.error(err); }
    });

    clearTextBtn.addEventListener('click', () => {
        textArea.value = '';
        charCount.textContent = '0 characters';
    });

    // --- Slider Logic ---
    cardCountInput.addEventListener('input', () => {
        cardCountVal.textContent = cardCountInput.value;
    });

    // --- Async Polling Logic ---
    async function pollJob(jobId) {
        const maxRetries = 60; // 2 minutes (2s * 60)
        let attempts = 0;

        while (attempts < maxRetries) {
            await new Promise(r => setTimeout(r, 2000)); // Wait 2s

            try {
                const res = await fetch(`/status/${jobId}`);
                if (!res.ok) throw new Error("Status check failed");
                const data = await res.json();

                if (data.status === 'completed') {
                    return true;
                } else if (data.status === 'failed') {
                    throw new Error(data.error || "Generation failed on server.");
                }

                // Still processing...
                attempts++;
                // Optional: Update UI with progress if we had it
            } catch (e) {
                console.error("Polling error", e);
                throw e;
            }
        }
        throw new Error("Timeout waiting for generation.");
    }

    // --- Submit Logic ---
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        statusMessage.classList.add('hidden');

        const formData = new FormData(form);

        // Handle Source
        if (activeTab === 'file') {
            if (!fileInput.files.length) {
                showStatus('Please upload a file.', 'error');
                return;
            }
            formData.delete('text');
        } else {
            if (!textArea.value.trim()) {
                showStatus('Please enter some text.', 'error');
                return;
            }
            formData.delete('file');
        }

        setLoading(true);

        try {
            // 1. Submit Job
            const response = await fetch('/generate', {
                method: 'POST',
                body: formData
            });

            if (!response.ok) {
                if (response.status === 429) {
                    throw new Error("⚠️ Rate Limit Reached! \n\nPlease wait or use your own API Key to bypass limits.");
                }
                const errText = await response.text();
                let errMsg = "Generation failed";
                try {
                    const json = JSON.parse(errText);
                    if (json.detail) errMsg = json.detail;
                } catch (e) { }
                throw new Error(errMsg);
            }

            const { job_id } = await response.json();

            // 2. Poll for Completion
            showStatus('Processing with AI... This may take a moment.', 'success');
            await pollJob(job_id);

            // 3. Download
            showStatus('Downloading your deck...', 'success');
            const downloadLink = document.createElement('a');
            downloadLink.href = `/download/${job_id}`;
            document.body.appendChild(downloadLink);
            downloadLink.click();
            downloadLink.remove();

            showStatus('Deck generated successfully!', 'success');
        } catch (err) {
            showStatus(err.message, 'error');
        } finally {
            setLoading(false);
        }
    });

    function setLoading(isLoading) {
        submitBtn.disabled = isLoading;
        if (isLoading) {
            submitBtn.innerHTML = '<i class="ph ph-spinner ph-spin"></i> Processing...';
        } else {
            submitBtn.innerHTML = '<i class="ph-bold ph-lightning"></i> Generate Flashcards';
        }
    }

    function showStatus(msg, type) {
        statusMessage.textContent = msg;
        statusMessage.className = `status-msg ${type}`;
        statusMessage.classList.remove('hidden');
    }
});
