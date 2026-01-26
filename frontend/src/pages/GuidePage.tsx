import React, { useEffect, useState } from 'react';
import Header from '@/components/Header';
import SimpleFooter from '@/components/SimpleFooter';
import { 
    BookOpen, 
    Download, 
    GraduationCap, 
    Youtube, 
    ArrowLeft, 
    ChevronRight, 
    Monitor, 
    Smartphone, 
    Info, 
    AlertCircle, 
    CheckCircle2,
    Search,
    Video
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'motion/react';

const sections = [
    { id: 'introduction', title: 'What is .apkg?', icon: <BookOpen className="w-4 h-4" /> },
    { id: 'installation', title: 'Installation Guide', icon: <Monitor className="w-4 h-4" /> },
    { id: 'importing', title: 'How to Import', icon: <Download className="w-4 h-4" /> },
    { id: 'protips', title: 'Pro Study Tips', icon: <GraduationCap className="w-4 h-4" /> },
    { id: 'tutorials', title: 'Video Vault', icon: <Video className="w-4 h-4" /> },
    { id: 'troubleshooting', title: 'Common Fixes', icon: <AlertCircle className="w-4 h-4" /> },
];

const GuidePage = () => {
    const navigate = useNavigate();
    const isMaintenanceMode = import.meta.env.VITE_MAINTENANCE_MODE === 'true';
    const [activeSection, setActiveSection] = useState('introduction');

    useEffect(() => {
        const handleScroll = () => {
            const scrollPosition = window.scrollY + 200;
            for (const section of [...sections].reverse()) {
                const element = document.getElementById(section.id);
                if (element && element.offsetTop <= scrollPosition) {
                    setActiveSection(section.id);
                    break;
                }
            }
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const scrollToSection = (id: string) => {
        const element = document.getElementById(id);
        if (element) {
            window.scrollTo({
                top: element.offsetTop - 100,
                behavior: 'smooth'
            });
        }
    };

    return (
        <div className="min-h-screen bg-background flex flex-col selection:bg-primary selection:text-primary-foreground">
            {!isMaintenanceMode && <Header />}
            
            {/* Maintenance Mode Header */}
            {isMaintenanceMode && (
                <div className="container mx-auto px-4 pt-6">
                    <Button
                        variant="outline"
                        onClick={() => navigate('/')}
                        className="group border-2 border-foreground shadow-[4px_4px_0_0_hsl(var(--foreground))] hover:translate-y-[2px] hover:shadow-none transition-all"
                    >
                        <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
                        Back to Terminal
                    </Button>
                </div>
            )}
            
            <main className="flex-1 container py-12">
                <div className="max-w-6xl mx-auto grid lg:grid-cols-[250px_1fr] gap-12">
                    
                    {/* Sticky Table of Contents */}
                    <aside className="hidden lg:block">
                        <div className="sticky top-24 space-y-6">
                            <div className="space-y-1">
                                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-4 px-3">On this page</p>
                                {sections.map((section) => (
                                    <button
                                        key={section.id}
                                        onClick={() => scrollToSection(section.id)}
                                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold transition-all group ${
                                            activeSection === section.id 
                                            ? 'bg-primary text-primary-foreground shadow-[4px_4px_0_0_#1a1a1a] translate-x-1' 
                                            : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                                        }`}
                                    >
                                        <div className={`${activeSection === section.id ? 'text-white' : 'text-primary'}`}>
                                            {section.icon}
                                        </div>
                                        {section.title}
                                    </button>
                                ))}
                            </div>
                            
                            <div className="p-4 rounded-2xl bg-primary/5 border border-primary/10">
                                <p className="text-[10px] font-black uppercase text-primary mb-2">Need Help?</p>
                                <p className="text-xs text-muted-foreground font-medium leading-relaxed">
                                    Can't find what you need? Reach out to us via the Feedback page.
                                </p>
                            </div>
                        </div>
                    </aside>

                    {/* Content Area */}
                    <div className="space-y-16">
                        <motion.div 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-center lg:text-left"
                        >
                            <Badge className="mb-4 py-1 px-4 bg-primary/10 text-primary border-primary/20">Official MeshCards Guide</Badge>
                            <h1 className="text-5xl lg:text-6xl font-black mb-6 tracking-tighter italic">
                                Master Your <span className="text-primary">Learning</span>
                            </h1>
                            <p className="text-xl text-muted-foreground font-medium max-w-2xl leading-relaxed">
                                You just generated the cards. Now let's make sure you know how to turn them into long-term knowledge using Anki.
                            </p>
                            
                            <div className="mt-8 pt-4 border-t border-border/50 max-w-2xl">
                                <p className="text-[10px] text-muted-foreground/60 font-bold uppercase tracking-widest">
                                    Disclaimer: MeshCards is not affiliated with, maintained, or endorsed by Anki or its developers.
                                </p>
                            </div>
                        </motion.div>

                        <div className="space-y-24 pb-24">
                            {/* Section: What is .apkg */}
                            <section id="introduction" className="scroll-mt-24 space-y-6">
                                <div className="flex items-center gap-4 border-b-4 border-foreground pb-4">
                                    <div className="p-3 bg-primary rounded-2xl text-white shadow-[4px_4px_0_0_#1a1a1a]">
                                        <BookOpen className="w-8 h-8" />
                                    </div>
                                    <h2 className="text-3xl font-black italic uppercase tracking-tight">What is an .apkg file?</h2>
                                </div>
                                <div className="grid md:grid-cols-2 gap-8 items-center pt-4">
                                    <div className="space-y-4">
                                        <p className="text-lg leading-relaxed font-bold text-foreground">
                                            The <code className="bg-muted px-2 py-1 rounded text-primary">.apkg</code> format is a digital container designed specifically for <strong className="underline decoration-primary decoration-4">Anki</strong>.
                                        </p>
                                        <p className="text-lg text-muted-foreground leading-relaxed">
                                            It's a compressed package that holds everything: your cards, custom CSS styling, and any AI-generated images. Think of it as a "save file" for your brain's new knowledge.
                                        </p>
                                        <div className="flex items-center gap-2 p-4 bg-muted/50 border-2 border-foreground/5 rounded-2xl">
                                            <Info className="w-5 h-5 text-primary shrink-0" />
                                            <p className="text-xs font-bold text-muted-foreground italic">
                                                MeshCards packages everything into this single file so you can study offline anywhere.
                                            </p>
                                        </div>
                                    </div>
                                    <div className="bg-muted/30 rounded-3xl p-8 border-2 border-dashed border-foreground/10 relative overflow-hidden group">
                                        <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                                            <Download className="w-32 h-32" />
                                        </div>
                                        <h3 className="text-sm font-black uppercase tracking-widest text-muted-foreground mb-4">File Specs</h3>
                                        <ul className="space-y-3">
                                            <li className="flex items-center gap-3 text-sm font-bold">
                                                <CheckCircle2 className="w-4 h-4 text-primary" /> Multi-modal (Text + Images)
                                            </li>
                                            <li className="flex items-center gap-3 text-sm font-bold">
                                                <CheckCircle2 className="w-4 h-4 text-primary" /> Cross-platform compatible
                                            </li>
                                            <li className="flex items-center gap-3 text-sm font-bold">
                                                <CheckCircle2 className="w-4 h-4 text-primary" /> Spaced Repetition Ready
                                            </li>
                                        </ul>
                                    </div>
                                </div>
                            </section>

                            {/* Section: Installation */}
                            <section id="installation" className="scroll-mt-24 space-y-8">
                                <div className="flex items-center gap-4 border-b-4 border-foreground pb-4">
                                    <div className="p-3 bg-blue-600 rounded-2xl text-white shadow-[4px_4px_0_0_#1a1a1a]">
                                        <Monitor className="w-8 h-8" />
                                    </div>
                                    <h2 className="text-3xl font-black italic uppercase tracking-tight">Setup Anki</h2>
                                </div>
                                <div className="grid md:grid-cols-3 gap-6">
                                    <motion.div whileHover={{ y: -5 }} className="bg-card border-2 border-foreground p-6 rounded-3xl shadow-[4px_4px_0_0_#000] space-y-4">
                                        <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
                                            <Monitor className="w-6 h-6" />
                                        </div>
                                        <h3 className="font-black uppercase tracking-widest text-sm">Desktop</h3>
                                        <p className="text-xs text-muted-foreground font-medium leading-relaxed">
                                            Win/Mac/Linux. Free and powerful. This is where you should import your decks first for the best experience.
                                        </p>
                                        <Button variant="outline" className="w-full text-[10px] font-black h-8 uppercase tracking-widest border-2 hover:bg-primary hover:text-white" onClick={() => window.open('https://apps.ankiweb.net/', '_blank')}>Download</Button>
                                    </motion.div>

                                    <motion.div whileHover={{ y: -5 }} className="bg-card border-2 border-foreground p-6 rounded-3xl shadow-[4px_4px_0_0_#000] space-y-4">
                                        <div className="w-10 h-10 bg-emerald-500/10 rounded-xl flex items-center justify-center text-emerald-500">
                                            <Smartphone className="w-6 h-6" />
                                        </div>
                                        <h3 className="font-black uppercase tracking-widest text-sm">Android</h3>
                                        <p className="text-xs text-muted-foreground font-medium leading-relaxed">
                                            AnkiDroid is 100% free on the Play Store. Perfect for studying while commuting or traveling.
                                        </p>
                                        <Button variant="outline" className="w-full text-[10px] font-black h-8 uppercase tracking-widest border-2 hover:bg-emerald-500 hover:text-white" onClick={() => window.open('https://play.google.com/store/apps/details?id=com.ichi2.anki', '_blank')}>Google Play</Button>
                                    </motion.div>

                                    <motion.div whileHover={{ y: -5 }} className="bg-card border-2 border-foreground p-6 rounded-3xl shadow-[4px_4px_0_0_#000] space-y-4">
                                        <div className="w-10 h-10 bg-blue-500/10 rounded-xl flex items-center justify-center text-blue-500">
                                            <Smartphone className="w-6 h-6" />
                                        </div>
                                        <h3 className="font-black uppercase tracking-widest text-sm">iOS (iPhone)</h3>
                                        <p className="text-xs text-muted-foreground font-medium leading-relaxed">
                                            AnkiMobile is a paid app. It supports the developers of Anki. Alternatively, use AnkiWeb for free.
                                        </p>
                                        <Button variant="outline" className="w-full text-[10px] font-black h-8 uppercase tracking-widest border-2 hover:bg-blue-500 hover:text-white" onClick={() => window.open('https://apps.apple.com/us/app/ankimobile-flashcards/id373493387', '_blank')}>App Store</Button>
                                    </motion.div>
                                </div>
                            </section>

                            {/* Section: Importing */}
                            <section id="importing" className="scroll-mt-24 space-y-10">
                                <div className="flex items-center gap-4 border-b-4 border-foreground pb-4">
                                    <div className="p-3 bg-purple-600 rounded-2xl text-white shadow-[4px_4px_0_0_#1a1a1a]">
                                        <Download className="w-8 h-8" />
                                    </div>
                                    <h2 className="text-3xl font-black italic uppercase tracking-tight">How to Import</h2>
                                </div>
                                <div className="space-y-6">
                                    {[
                                        { step: 1, title: 'Download the Deck', text: 'After generation, click the download button. You get a single .apkg file.' },
                                        { step: 2, title: 'The Magic Click', text: 'On Desktop, simply double-click the .apkg file you downloaded from MeshCards. Anki will automatically open and import it.' },
                                        { step: 3, title: 'Alternative Way', text: 'If double-clicking doesn\'t work, open Anki, go to File > Import and select your .apkg file.' },
                                        { step: 4, title: 'Confirmation', text: 'You’ll see "Importing complete...". Your new MeshCards deck is now in your deck list.' }
                                    ].map((step, i) => (
                                        <div key={i} className="flex gap-6 group">
                                            <div className="flex-shrink-0 w-12 h-12 bg-foreground text-background flex items-center justify-center text-2xl font-black italic rounded-2xl group-hover:bg-primary transition-colors font-mono">
                                                {step.step}
                                            </div>
                                            <div>
                                                <h3 className="text-xl font-black mb-1 leading-tight">{step.title}</h3>
                                                <p className="text-muted-foreground font-medium leading-relaxed">{step.text}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </section>

                            {/* Section: Pro Tips */}
                            <section id="protips" className="scroll-mt-24 space-y-10">
                                <div className="flex items-center gap-4 border-b-4 border-foreground pb-4">
                                    <div className="p-3 bg-emerald-600 rounded-2xl text-white shadow-[4px_4px_0_0_#1a1a1a]">
                                        <GraduationCap className="w-8 h-8" />
                                    </div>
                                    <h2 className="text-3xl font-black italic uppercase tracking-tight">Pro Study Tips</h2>
                                </div>
                                <div className="grid gap-4">
                                    <div className="bg-card border-2 border-foreground p-6 rounded-3xl shadow-[4px_4px_0_0_hsl(var(--primary))] flex gap-4 items-start">
                                        <CheckCircle2 className="w-6 h-6 text-primary shrink-0 mt-1" />
                                        <div>
                                            <h3 className="font-black uppercase tracking-widest text-sm mb-1">Instant Editing</h3>
                                            <p className="text-sm text-muted-foreground font-medium">You can <span className="text-primary font-bold">edit</span> generated cards in Anki by pressing <code className="bg-muted px-1.5 rounded border border-foreground/10 text-foreground font-black">'E'</code> while reviewing.</p>
                                        </div>
                                    </div>
                                    <div className="bg-card border-2 border-foreground p-6 rounded-3xl shadow-[4px_4px_0_0_hsl(var(--primary))] flex gap-4 items-start">
                                        <CheckCircle2 className="w-6 h-6 text-primary shrink-0 mt-1" />
                                        <div>
                                            <h3 className="font-black uppercase tracking-widest text-sm mb-1">Cloud Sync</h3>
                                            <p className="text-sm text-muted-foreground font-medium">Sync your <span className="text-primary font-bold">AnkiWeb account</span> to study on multiple devices (Web, Desktop, Mobile) seamlessly.</p>
                                        </div>
                                    </div>
                                    <div className="bg-card border-2 border-foreground p-6 rounded-3xl shadow-[4px_4px_0_0_hsl(var(--primary))] flex gap-4 items-start">
                                        <CheckCircle2 className="w-6 h-6 text-primary shrink-0 mt-1" />
                                        <div>
                                            <h3 className="font-black uppercase tracking-widest text-sm mb-1">Consistency is Key</h3>
                                            <p className="text-sm text-muted-foreground font-medium">MeshCards works best when you <span className="text-primary font-bold">review your cards daily</span>. Even 5 minutes a day makes a massive difference.</p>
                                        </div>
                                    </div>
                                </div>
                            </section>

                            {/* Section: Video Tutorials */}
                            <section id="tutorials" className="scroll-mt-24 space-y-10">
                                <div className="flex items-center gap-4 border-b-4 border-foreground pb-4">
                                    <div className="p-3 bg-red-600 rounded-2xl text-white shadow-[4px_4px_0_0_#1a1a1a]">
                                        <Youtube className="w-8 h-8" />
                                    </div>
                                    <h2 className="text-3xl font-black italic uppercase tracking-tight">Video Vault</h2>
                                </div>
                                <p className="text-lg font-bold text-muted-foreground">New to Anki? These video tutorials will help you get started and master the app:</p>
                                
                                <div className="space-y-12">
                                    {/* Categorized Video Links */}
                                    {[
                                        {
                                            category: "For Beginners",
                                            color: "border-primary",
                                            links: [
                                                { title: "Anki Tutorial - Complete Beginner's Guide (The AnKing)", desc: "Comprehensive introduction to Anki basics", url: "https://www.youtube.com/watch?v=5urUZUWoTLo" },
                                                { title: "How to Import Decks into Anki", desc: "Step-by-step guide for importing .apkg files", url: "https://www.youtube.com/watch?v=Eo1HbXEiJxo" }
                                            ]
                                        },
                                        {
                                            category: "Advanced Features",
                                            color: "border-orange-500",
                                            links: [
                                                { title: "Anki Settings Explained - Optimize Your Learning", desc: "Fine-tune Anki for maximum efficiency", url: "https://www.youtube.com/watch?v=1XaJjbCSXT0" },
                                                { title: "How to Edit and Customize Your Anki Cards", desc: "Personalize your flashcards for better retention", url: "https://www.youtube.com/watch?v=7K2StK7e3ww" }
                                            ]
                                        },
                                        {
                                            category: "Mobile Learning",
                                            color: "border-blue-500",
                                            links: [
                                                { title: "How to Sync Anki Across Devices (AnkiWeb)", desc: "Study on desktop, phone, and tablet seamlessly", url: "https://www.youtube.com/watch?v=3i_jcSnCRX8" }
                                            ]
                                        }
                                    ].map((cat, idx) => (
                                        <div key={idx} className={`border-l-4 ${cat.color} pl-6 py-1 space-y-4`}>
                                            <h3 className="text-xl font-black uppercase tracking-tight">{cat.category}</h3>
                                            <div className="grid gap-4">
                                                {cat.links.map((link, lIdx) => (
                                                    <a 
                                                        key={lIdx}
                                                        href={link.url}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="group bg-muted/30 p-4 rounded-2xl border border-foreground/5 hover:border-primary/30 transition-all flex justify-between items-center"
                                                    >
                                                        <div>
                                                            <h4 className="font-bold group-hover:text-primary transition-colors inline-flex items-center gap-2">
                                                                <Youtube className="w-4 h-4 text-red-500" />
                                                                {link.title}
                                                            </h4>
                                                            <p className="text-xs text-muted-foreground font-medium mt-1">{link.desc}</p>
                                                        </div>
                                                        <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-all group-hover:translate-x-1" />
                                                    </a>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div className="p-6 bg-primary/10 border-2 border-primary/20 rounded-3xl flex items-start gap-4">
                                    <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-white shrink-0 shadow-[2px_2px_0_0_#1a1a1a]">
                                        <Info className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <p className="font-black uppercase tracking-widest text-[10px] text-primary mb-1">Time Saver Tip</p>
                                        <p className="text-sm font-bold leading-relaxed">
                                            Watch these videos at <span className="text-primary underline font-black italic">1.5x speed</span> to save time! Most tutorials cover the same basics, so pick one that matches your learning style.
                                        </p>
                                    </div>
                                </div>
                            </section>

                            {/* Section: Troubleshooting */}
                            <section id="troubleshooting" className="scroll-mt-24 space-y-10">
                                <div className="flex items-center gap-4 border-b-4 border-foreground pb-4">
                                    <div className="p-3 bg-orange-500 rounded-2xl text-white shadow-[4px_4px_0_0_#1a1a1a]">
                                        <AlertCircle className="w-8 h-8" />
                                    </div>
                                    <h2 className="text-3xl font-black italic uppercase tracking-tight">Common Fixes</h2>
                                </div>
                                <div className="space-y-4">
                                    <Accordion type="single" collapsible className="w-full space-y-4">
                                        <AccordionItem value="item-1" className="bg-card border-2 border-foreground rounded-2xl px-6 py-2 shadow-[2px_2px_0_0_#000]">
                                            <AccordionTrigger className="text-left font-black tracking-tight hover:no-underline flex gap-3">
                                                Images aren't showing up
                                            </AccordionTrigger>
                                            <AccordionContent className="text-muted-foreground font-medium leading-relaxed pb-4">
                                                If your AI-generated images don't appear immediately, wait a few minutes for background sync. Alternatively, go to <code className="bg-muted px-1.5 py-0.5 rounded">Tools &gt; Check Media</code> in Anki to force a local scan of your assets.
                                            </AccordionContent>
                                        </AccordionItem>
                                        <AccordionItem value="item-2" className="bg-card border-2 border-foreground rounded-2xl px-6 py-2 shadow-[2px_2px_0_0_#000]">
                                            <AccordionTrigger className="text-left font-black tracking-tight hover:no-underline flex gap-3">
                                                "Invalid File Pattern" Error
                                            </AccordionTrigger>
                                            <AccordionContent className="text-muted-foreground font-medium leading-relaxed pb-4">
                                                This usually happens if you're trying to open the file with the wrong app. Ensure you have official <strong className="text-foreground">Anki</strong> installed. Third-party flashcard apps may not support all .apkg features.
                                            </AccordionContent>
                                        </AccordionItem>
                                        <AccordionItem value="item-3" className="bg-card border-2 border-foreground rounded-2xl px-6 py-2 shadow-[2px_2px_0_0_#000]">
                                            <AccordionTrigger className="text-left font-black tracking-tight hover:no-underline flex gap-3">
                                                Custom Deck Name Not Showing
                                            </AccordionTrigger>
                                            <AccordionContent className="text-muted-foreground font-medium leading-relaxed pb-4">
                                                Anki sometimes puts new decks under a parent folder. Check for a folder icon next to "MeshCards" or your custom name in the deck list. You can drag and drop it out of any folder at any time.
                                            </AccordionContent>
                                        </AccordionItem>
                                    </Accordion>
                                </div>
                            </section>
                        </div>
                    </div>
                </div>
            </main>
            {!isMaintenanceMode && <SimpleFooter />}
        </div>
    );
};

// UI Components
const Badge = ({ children, className }: { children: React.ReactNode, className?: string }) => (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-black uppercase tracking-widest border transition-colors ${className}`}>
        {children}
    </span>
);

const Accordion = ({ children, className, ...props }: any) => <div className={className} {...props}>{children}</div>;
const AccordionItem = ({ children, className, value }: any) => <div className={className} id={value}>{children}</div>;

const AccordionTrigger = ({ children, className, onClick }: any) => {
    const [isOpen, setIsOpen] = useState(false);
    return (
        <button 
            className={`${className} w-full flex justify-between items-center`}
            onClick={() => setIsOpen(!isOpen)}
        >
            {children}
            <ChevronRight className={`w-5 h-5 transition-transform duration-300 ${isOpen ? 'rotate-90' : ''}`} />
        </button>
    );
};

const AccordionContent = ({ children, className }: any) => (
    <div className={`${className} mt-4 pt-4 border-t-2 border-foreground/5 animate-in slide-in-from-top-4 duration-300`}>
        {children}
    </div>
);

export default GuidePage;
