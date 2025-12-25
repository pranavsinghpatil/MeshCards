import React from 'react';
import Header from '@/components/Header';
import SimpleFooter from '@/components/SimpleFooter';
import { BookOpen, Download, HelpCircle, GraduationCap } from 'lucide-react';

const GuidePage = () => {
    return (
        <div className="min-h-screen bg-background flex flex-col">
            <Header />
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
                </div>

            </main>
            <SimpleFooter />
        </div>
    );
};

export default GuidePage;
