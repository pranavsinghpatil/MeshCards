document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const form = document.getElementById('generateForm');
    const submitBtn = document.getElementById('submitBtn');
    const btnText = submitBtn.querySelector('.btn-text');
    const loader = submitBtn.querySelector('.loader');
    const statusMessage = document.getElementById('statusMessage');
    const fileInput = document.getElementById('file');
    const dropZone = document.getElementById('dropZone');
    const tabs = document.querySelectorAll('.tab-btn');
    const inputSections = document.querySelectorAll('.input-section');

    // State
    let activeTab = 'file';

    // --- Tab Logic ---
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            // Remove active class from all tabs
            tabs.forEach(t => t.classList.remove('active'));
            // Add active class to clicked tab
            tab.classList.add('active');

            // Switch content section
            activeTab = tab.dataset.tab;
            inputSections.forEach(section => {
                if (section.id === `${activeTab}-section`) {
                    section.classList.add('active');
                } else {
                    section.classList.remove('active');
                }
            });

            // Clear status when switching
            hideStatus();
        });
    });

    // --- Drag & Drop Logic ---
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        dropZone.addEventListener(eventName, preventDefaults, false);
    });

    function preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }

    dropZone.addEventListener('dragover', () => {
        dropZone.style.borderColor = 'var(--primary)';
        dropZone.style.background = 'rgba(99, 102, 241, 0.1)';
    });

    dropZone.addEventListener('dragleave', () => {
        dropZone.style.borderColor = 'var(--border-color)';
        dropZone.style.background = 'rgba(255, 255, 255, 0.02)';
    });

    dropZone.addEventListener('drop', (e) => {
        dropZone.style.borderColor = 'var(--border-color)';
        dropZone.style.background = 'rgba(255, 255, 255, 0.02)';

        const dt = e.dataTransfer;
        const files = dt.files;

        if (files.length) {
            fileInput.files = files;
            updateFileLabel(files[0].name);
        }
    });

    fileInput.addEventListener('change', () => {
        if (fileInput.files.length) {
            updateFileLabel(fileInput.files[0].name);
        }
    });

    function updateFileLabel(name) {
        const p = dropZone.querySelector('p');
        p.innerHTML = `<strong>${name}</strong><br><span style="font-size: 0.8em; opacity: 0.7">Ready to upload</span>`;
        p.style.color = 'var(--primary)';
    }

    // --- Form Submission ---
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        hideStatus();

        const formData = new FormData(form);

        // Validation & Cleanup based on active tab
        if (activeTab === 'file') {
            if (!fileInput.files.length) {
                showStatus('Please select a file to upload.', 'error');
                return;
            }
            formData.delete('text'); // Remove text field
        } else {
            const textVal = document.getElementById('text').value;
            if (!textVal.trim()) {
                showStatus('Please paste some text content.', 'error');
                return;
            }
            formData.delete('file'); // Remove file field
        }

        // UI Loading State
        setLoading(true);

        try {
            const response = await fetch('/generate', {
                method: 'POST',
                body: formData
            });

            if (!response.ok) {
                const errorText = await response.text();
                let errorMsg = 'Generation failed.';
                try {
                    const errorJson = JSON.parse(errorText);
                    if (errorJson.detail) errorMsg = errorJson.detail;
                } catch (e) {
                    errorMsg = errorText || errorMsg;
                }
                throw new Error(errorMsg);
            }

            // Handle Download
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;

            // Extract filename
            const contentDisposition = response.headers.get('Content-Disposition');
            let filename = 'meshcards_deck.apkg';
            if (contentDisposition) {
                const match = contentDisposition.match(/filename="?([^"]+)"?/);
                if (match && match[1]) filename = match[1];
            }

            a.download = filename;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            a.remove();

            showStatus('Success! Your Anki deck has been downloaded.', 'success');

        } catch (error) {
            console.error('Generation Error:', error);
            showStatus(error.message, 'error');
        } finally {
            setLoading(false);
        }
    });

    // --- Helpers ---
    function setLoading(isLoading) {
        submitBtn.disabled = isLoading;
        if (isLoading) {
            btnText.textContent = 'Generating...';
            loader.classList.remove('hidden');
        } else {
            btnText.textContent = 'Generate Flashcards';
            loader.classList.add('hidden');
        }
    }

    function showStatus(msg, type) {
        statusMessage.textContent = msg;
        statusMessage.className = type; // 'success' or 'error'
        statusMessage.classList.remove('hidden');
    }

    function hideStatus() {
        statusMessage.classList.add('hidden');
        statusMessage.className = 'hidden';
    }
});
