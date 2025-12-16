import { useState } from 'react';

const Hero = ({ onStart, isExiting }) => {
    return (
        <div className={`landing-container ${isExiting ? 'slide-up' : ''}`}>
            <div className="hero-content">
                <div className="hero-logo">
                    <i className="ph-duotone ph-cards"></i>
                </div>
                <h1>MeshCards</h1>
                <p className="subtitle">
                    Turn any text or PDF into Anki flashcards instantly with AI.
                </p>
                <div className="hero-actions">
                    <button onClick={onStart} className="btn-primary hero-btn">
                        <span>Open Studio</span>
                        <i className="ph-bold ph-arrow-right"></i>
                    </button>
                    <a
                        href="https://github.com/sponsors/pranavsinghpatil"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-secondary hero-btn"
                    >
                        <i className="ph-fill ph-heart"></i>
                        <span>Sponsor Project</span>
                    </a>
                </div>
            </div>
            <div className="hero-background"></div>
        </div>
    );
};

export default Hero;
