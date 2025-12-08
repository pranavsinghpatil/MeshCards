document.addEventListener('DOMContentLoaded', () => {
    // --- Elements ---
    const form = document.getElementById('generateForm');
    const submitBtn = document.getElementById('submitBtn');
    const statusMessage = document.getElementById('statusMessage');

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

        // Handle Focus Areas (Multi-select)
        // FormData handles multiple checkboxes with same name automatically
        // but we might want to join them or send as list.
        // For now, let's keep standard behavior.

        setLoading(true);

        try {
            const response = await fetch('/generate', {
                method: 'POST',
                body: formData
            });

            if (!response.ok) {
                if (response.status === 429) {
                    throw new Error("Quota exceeded! Try switching to Ollama or wait a minute.");
                }
                const errText = await response.text();
                let errMsg = "Generation failed";
                try {
                    const json = JSON.parse(errText);
                    if (json.detail) errMsg = json.detail;
                } catch (e) { }
                throw new Error(errMsg);
            }

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'meshcards_deck.apkg';
            document.body.appendChild(a);
            a.click();
            a.remove();

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
            submitBtn.innerHTML = '<i class="ph ph-spinner ph-spin"></i> Generating...';
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
