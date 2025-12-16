import { useState, useEffect } from 'react';

export default function ConfigPanel({ config, onSubmit, isLoading, status }) {
    const [deckName, setDeckName] = useState('MeshCards Deck');
    const [maxCards, setMaxCards] = useState(25);
    const [provider, setProvider] = useState('gemini');
    const [model, setModel] = useState('');
    const [apiKey, setApiKey] = useState('');
    const [focusAreas, setFocusAreas] = useState(['Definitions', 'Concepts']);
    const [customInstructions, setCustomInstructions] = useState('');
    const [style, setStyle] = useState('Mixed');
    const [imagesEnabled, setImagesEnabled] = useState(false);

    // Model Options
    const models = {
        gemini: [
            { id: 'gemini-1.5-flash', name: 'Gemini 1.5 Flash (Fast)' },
            { id: 'gemini-1.5-pro', name: 'Gemini 1.5 Pro (Best Quality)' },
        ],
        openai: [
            { id: 'gpt-4o', name: 'GPT-4o (Smartest)' },
            { id: 'gpt-4-turbo', name: 'GPT-4 Turbo' },
            { id: 'gpt-3.5-turbo', name: 'GPT-3.5 Turbo (Fast)' },
        ],
        ollama: [
            { id: 'llama3', name: 'Llama 3 (8B)' },
            { id: 'mistral', name: 'Mistral (7B)' },
            { id: 'gemma', name: 'Gemma (7B)' },
        ],
    };

    // Set default model when provider changes
    useEffect(() => {
        if (models[provider] && models[provider].length > 0) {
            setModel(models[provider][0].id);
        }
    }, [provider]);

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit({
            deck_name: deckName,
            max_cards: maxCards,
            provider,
            model,
            api_key: apiKey,
            focus_areas: focusAreas,
            custom_instructions: customInstructions,
            style,
            images: imagesEnabled,
        });
    };

    const toggleFocusArea = (area) => {
        setFocusAreas((prev) =>
            prev.includes(area)
                ? prev.filter((a) => a !== area)
                : [...prev, area]
        );
    };

    return (
        <section className="panel config-panel">
            <div className="panel-header">
                <h2>
                    <i className="ph-duotone ph-sliders-horizontal"></i> Configuration
                </h2>
                <p>Customize how your flashcards are generated.</p>
            </div>

            <div className="config-group">
                <label className="group-label">Deck Details</label>
                <div className="input-row">
                    <div className="input-field">
                        <label htmlFor="deck_name">Deck Name</label>
                        <input
                            type="text"
                            id="deck_name"
                            value={deckName}
                            onChange={(e) => setDeckName(e.target.value)}
                            placeholder="e.g. Biology 101"
                        />
                    </div>
                    <div className="input-field">
                        <label htmlFor="max_cards">Card Count: {maxCards}</label>
                        <input
                            type="range"
                            id="max_cards"
                            min="5"
                            max="50"
                            step="5"
                            value={maxCards}
                            onChange={(e) => setMaxCards(Number(e.target.value))}
                        />
                    </div>
                </div>
            </div>

            <div className="config-group">
                <label className="group-label">AI Model</label>
                <div className="card-selector">
                    <label className="selection-card">
                        <input
                            type="radio"
                            name="provider"
                            value="gemini"
                            checked={provider === 'gemini'}
                            onChange={() => setProvider('gemini')}
                        />
                        <div className="card-content">
                            <i className="ph-fill ph-sparkle text-gemini"></i>
                            <span className="card-title">Gemini</span>
                        </div>
                    </label>
                    <label className="selection-card">
                        <input
                            type="radio"
                            name="provider"
                            value="openai"
                            checked={provider === 'openai'}
                            onChange={() => setProvider('openai')}
                        />
                        <div className="card-content">
                            <i className="ph-fill ph-brain text-openai"></i>
                            <span className="card-title">OpenAI</span>
                        </div>
                    </label>
                    {config?.enable_ollama && (
                        <label className="selection-card">
                            <input
                                type="radio"
                                name="provider"
                                value="ollama"
                                checked={provider === 'ollama'}
                                onChange={() => setProvider('ollama')}
                            />
                            <div className="card-content">
                                <i className="ph-fill ph-laptop text-ollama"></i>
                                <span className="card-title">Ollama</span>
                            </div>
                        </label>
                    )}
                </div>

                <div className="model-specific-wrapper">
                    <label className="sub-label">Specific Model</label>
                    <div className="custom-select-wrapper">
                        <select
                            value={model}
                            onChange={(e) => setModel(e.target.value)}
                            className="premium-select"
                        >
                            {models[provider]?.map((m) => (
                                <option key={m.id} value={m.id}>
                                    {m.name}
                                </option>
                            ))}
                        </select>
                        <i className="ph-bold ph-caret-down select-icon"></i>
                    </div>
                </div>

                <div className="model-specific-wrapper">
                    <label className="sub-label">Your API Key (Optional)</label>
                    <input
                        type="password"
                        value={apiKey}
                        onChange={(e) => setApiKey(e.target.value)}
                        placeholder="Paste key to bypass rate limits"
                        className="premium-input"
                    />
                    <p className="input-hint">Leave empty to use free tier (Rate Limited).</p>
                </div>
            </div>

            <div className="config-group">
                <label className="group-label">Focus Areas</label>
                <div className="chips-selector">
                    {['Definitions', 'Key Concepts', 'Dates & Facts', 'Processes'].map(
                        (area) => (
                            <label key={area} className="chip">
                                <input
                                    type="checkbox"
                                    checked={focusAreas.includes(area)}
                                    onChange={() => toggleFocusArea(area)}
                                />
                                <span>{area}</span>
                            </label>
                        )
                    )}
                </div>
            </div>

            <div className="config-group">
                <label className="group-label">Custom Instructions</label>
                <textarea
                    className="mini-textarea"
                    value={customInstructions}
                    onChange={(e) => setCustomInstructions(e.target.value)}
                    placeholder="E.g., 'Focus on dates', 'Simple English definitions'"
                />
            </div>

            <div className="config-group">
                <label className="group-label">Card Style</label>
                <div className="style-selector">
                    {['Mixed', 'Conceptual', 'Code'].map((s) => (
                        <label key={s} className="style-option">
                            <input
                                type="radio"
                                name="style"
                                value={s}
                                checked={style === s}
                                onChange={() => setStyle(s)}
                            />
                            <div className={`style-preview ${s.toLowerCase()}`}></div>
                            <span>{s}</span>
                        </label>
                    ))}
                </div>
            </div>

            {config?.enable_images ? (
                <div className="config-group toggle-group">
                    <div>
                        <span style={{ display: 'block', fontWeight: 500 }}>
                            AI Illustrations
                        </span>
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                            Generate visual aids
                        </span>
                    </div>
                    <label className="switch">
                        <input
                            type="checkbox"
                            checked={imagesEnabled}
                            onChange={(e) => setImagesEnabled(e.target.checked)}
                        />
                        <span className="slider round"></span>
                    </label>
                </div>
            ) : (
                <div className="coming-soon-badge">
                    <i className="ph-duotone ph-image"></i> AI Image Gen (Coming Soon)
                </div>
            )}

            <div className="action-area">
                <button
                    onClick={handleSubmit}
                    disabled={isLoading}
                    className="btn-primary"
                >
                    {isLoading ? (
                        <>
                            <i className="ph ph-spinner ph-spin"></i> Processing...
                        </>
                    ) : (
                        <>
                            <i className="ph-bold ph-lightning"></i>
                            <span>Generate Flashcards</span>
                        </>
                    )}
                </button>
                {status && (
                    <div className={`status-msg ${status.type}`}>
                        {status.message}
                    </div>
                )}
            </div>
        </section>
    );
}
