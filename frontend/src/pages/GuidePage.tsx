import React from 'react';
import Header from '@/components/Header';
import SimpleFooter from '@/components/SimpleFooter';
import { BookOpen, Download, HelpCircle, GraduationCap, Youtube, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const GuidePage = () => {
    const navigate = useNavigate();
    const isMaintenanceMode = import.meta.env.VITE_MAINTENANCE_MODE === 'true';

    return (
        <div className="min-h-screen bg-background flex flex-col">
            {!isMaintenanceMode && <Header />}
            
            {/* Back button for maintenance mode */}
            {isMaintenanceMode && (
                <div className="container mx-auto px-4 pt-4">
                    <Button
                        variant="outline"
                        onClick={() => navigate('/')}
                        className="border-2 border-foreground shadow-[2px_2px_0_0_hsl(var(--foreground))] hover:translate-y-[1px] hover:shadow-[1px_1px_0_0_hsl(var(--foreground))]"
                    >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to Maintenance Page
                    </Button>
                </div>
            )}
            
            <main className="flex-1 container py-12 max-w-4xl">
                <div className="mb-10 text-center">
                    <h1 className="text-4xl font-bold mb-4">How to Use Your Study Deck</h1>
                    <p className="text-xl text-muted-foreground">Everything you need to know about .apkg files and Anki.</p>
                </div>

                <div className="grid gap-8">
                    {/* What is .apkg? */}
                    <section className="bg-card border-2 border-foreground/10 rounded-2xl p-8 shadow-sm">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                                <BookOpen className="w-6 h-6" />
                            </div>
                            <h2 className="text-2xl font-bold">What is an .apkg file?</h2>
                        </div>
                        <p className="text-lg leading-relaxed text-muted-foreground">
                            An <strong>.apkg</strong> file is a deck package for <strong>Anki</strong>, the world's most popular spaced-repetition flashcard app. 
                            It contains all your cards, notes, and media (images/audio) in a single, shareable file.
                        </p>
                    </section>

                    {/* How to Open */}
                    <section className="bg-card border-2 border-foreground/10 rounded-2xl p-8 shadow-sm">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="w-12 h-12 rounded-xl bg-orange-500/10 flex items-center justify-center text-orange-500">
                                <Download className="w-6 h-6" />
                            </div>
                            <h2 className="text-2xl font-bold">How to Open & Study</h2>
                        </div>
                        <div className="space-y-4">
                            <div className="flex gap-4">
                                <div className="font-bold text-4xl text-muted-foreground/20">1</div>
                                <div>
                                    <h3 className="font-bold text-lg">Download Anki</h3>
                                    <p className="text-muted-foreground">
                                        Anki is free for Desktop and Android. There is a paid app for iOS.
                                        <br />
                                        <a href="https://apps.ankiweb.net/" target="_blank" className="text-primary underline hover:text-primary/80">Get Anki here</a>.
                                    </p>
                                </div>
                            </div>
                            <div className="flex gap-4">
                                <div className="font-bold text-4xl text-muted-foreground/20">2</div>
                                <div>
                                    <h3 className="font-bold text-lg">Import the Deck</h3>
                                    <p className="text-muted-foreground">
                                        Simply <strong>double-click</strong> the .apkg file you downloaded from MeshCards. Anki will automatically open and import it.
                                        Alternatively, open Anki, go to <em>File &gt; Import</em>.
                                    </p>
                                </div>
                            </div>
                            <div className="flex gap-4">
                                <div className="font-bold text-4xl text-muted-foreground/20">3</div>
                                <div>
                                    <h3 className="font-bold text-lg">Start Studying</h3>
                                    <p className="text-muted-foreground">
                                        Click on the deck name in Anki and press <strong>Study Now</strong>. 
                                        Rate how easy/hard each card was to schedule it for future review.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </section>

                     {/* Tips */}
                     <section className="bg-card border-2 border-foreground/10 rounded-2xl p-8 shadow-sm">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500">
                                <GraduationCap className="w-6 h-6" />
                            </div>
                            <h2 className="text-2xl font-bold">Pro Tips</h2>
                        </div>
                        <ul className="list-disc list-inside space-y-2 text-lg text-muted-foreground">
                            <li>You can <strong>edit</strong> generated cards in Anki by pressing 'E' while reviewing.</li>
                            <li>Sync your AnkiWeb account to study on multiple devices.</li>
                            <li>MeshCards works best when you review your cards daily.</li>
                        </ul>
                    </section>

                     {/* YouTube Resources */}
                     <section className="bg-card border-2 border-foreground/10 rounded-2xl p-8 shadow-sm">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="w-12 h-12 rounded-xl bg-red-500/10 flex items-center justify-center text-red-500">
                                <Youtube className="w-6 h-6" />
                            </div>
                            <h2 className="text-2xl font-bold">Video Tutorials</h2>
                        </div>
                        <p className="text-muted-foreground mb-6">
                            New to Anki? These video tutorials will help you get started and master the app:
                        </p>
                        <div className="space-y-4">
                            {/* Beginner Tutorials */}
                            <div className="border-l-4 border-primary pl-4">
                                <h3 className="font-bold text-lg mb-2">For Beginners</h3>
                                <ul className="space-y-3">
                                    <li>
                                        <a 
                                            href="https://www.youtube.com/watch?v=5urUZUWoTLo" 
                                            target="_blank" 
                                            rel="noopener noreferrer"
                                            className="text-primary hover:text-primary/80 underline flex items-center gap-2 group"
                                        >
                                            <Youtube className="w-4 h-4 group-hover:scale-110 transition-transform" />
                                            <span>Anki Tutorial - Complete Beginner's Guide (The AnKing)</span>
                                        </a>
                                        <p className="text-sm text-muted-foreground ml-6">Comprehensive introduction to Anki basics</p>
                                    </li>
                                    <li>
                                        <a 
                                            href="https://www.youtube.com/watch?v=Eo1HbXEiJxo" 
                                            target="_blank" 
                                            rel="noopener noreferrer"
                                            className="text-primary hover:text-primary/80 underline flex items-center gap-2 group"
                                        >
                                            <Youtube className="w-4 h-4 group-hover:scale-110 transition-transform" />
                                            <span>How to Import Decks into Anki</span>
                                        </a>
                                        <p className="text-sm text-muted-foreground ml-6">Step-by-step guide for importing .apkg files</p>
                                    </li>
                                </ul>
                            </div>

                            {/* Advanced Tips */}
                            <div className="border-l-4 border-orange-500 pl-4">
                                <h3 className="font-bold text-lg mb-2">Advanced Features</h3>
                                <ul className="space-y-3">
                                    <li>
                                        <a 
                                            href="https://www.youtube.com/watch?v=1XaJjbCSXT0" 
                                            target="_blank" 
                                            rel="noopener noreferrer"
                                            className="text-primary hover:text-primary/80 underline flex items-center gap-2 group"
                                        >
                                            <Youtube className="w-4 h-4 group-hover:scale-110 transition-transform" />
                                            <span>Anki Settings Explained - Optimize Your Learning</span>
                                        </a>
                                        <p className="text-sm text-muted-foreground ml-6">Fine-tune Anki for maximum efficiency</p>
                                    </li>
                                    <li>
                                        <a 
                                            href="https://www.youtube.com/watch?v=7K2StK7e3ww" 
                                            target="_blank" 
                                            rel="noopener noreferrer"
                                            className="text-primary hover:text-primary/80 underline flex items-center gap-2 group"
                                        >
                                            <Youtube className="w-4 h-4 group-hover:scale-110 transition-transform" />
                                            <span>How to Edit and Customize Your Anki Cards</span>
                                        </a>
                                        <p className="text-sm text-muted-foreground ml-6">Personalize your flashcards for better retention</p>
                                    </li>
                                </ul>
                            </div>

                            {/* Mobile App */}
                            <div className="border-l-4 border-blue-500 pl-4">
                                <h3 className="font-bold text-lg mb-2">Mobile Learning</h3>
                                <ul className="space-y-3">
                                    <li>
                                        <a 
                                            href="https://www.youtube.com/watch?v=3i_jcSnCRX8" 
                                            target="_blank" 
                                            rel="noopener noreferrer"
                                            className="text-primary hover:text-primary/80 underline flex items-center gap-2 group"
                                        >
                                            <Youtube className="w-4 h-4 group-hover:scale-110 transition-transform" />
                                            <span>How to Sync Anki Across Devices (AnkiWeb)</span>
                                        </a>
                                        <p className="text-sm text-muted-foreground ml-6">Study on desktop, phone, and tablet seamlessly</p>
                                    </li>
                                </ul>
                            </div>
                        </div>
                        
                        <div className="mt-6 p-4 bg-muted/50 rounded-lg border border-border">
                            <p className="text-sm text-muted-foreground">
                                <strong className="text-foreground">💡 Pro Tip:</strong> Watch these videos at 1.5x speed to save time! 
                                Most tutorials cover the same basics, so pick one that matches your learning style.
                            </p>
                        </div>
                    </section>
                </div>

            </main>
            {!isMaintenanceMode && <SimpleFooter />}
        </div>
    );
};

export default GuidePage;
