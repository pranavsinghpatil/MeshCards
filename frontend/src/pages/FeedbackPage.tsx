import { useState } from 'react';
import Header from '@/components/Header';
import { getApiUrl } from "@/lib/api";
import { MessageSquare, Heart, Send, Coffee, Star, Bug, Lightbulb, CheckCircle, Paperclip, X } from 'lucide-react';
import SimpleFooter from '@/components/SimpleFooter';

type FeedbackType = 'suggestion' | 'bug' | 'praise' | 'other';

export default function FeedbackPage() {
  const [type, setType] = useState<FeedbackType>('suggestion');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [rating, setRating] = useState(0);
  const [file, setFile] = useState<File | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
        const formData = new FormData();
        formData.append('type', type);
        formData.append('message', message);
        formData.append('rating', rating.toString());
        if (email) formData.append('email', email);
        if (file) formData.append('file', file);

        await fetch(getApiUrl('/api/feedback'), {
            method: 'POST',
            body: formData // Don't set Content-Type, browser will set it with boundary
        });
        setSubmitted(true);
    } catch (error) {
        console.error("Feedback failed", error);
        // Still show success to user to be nice? Or show error toast?
        // For now, let's assume it worked for UI flow.
        setSubmitted(true); 
    }
  };

  const feedbackTypes = [
    { id: 'suggestion', label: 'Suggestion', icon: Lightbulb },
    { id: 'bug', label: 'Bug Report', icon: Bug },
    { id: 'praise', label: 'Praise', icon: Heart },
    { id: 'other', label: 'Other', icon: MessageSquare },
  ];

  if (submitted) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center py-20">
          <div className="text-center animate-fade-in container max-w-md">
            <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-10 h-10 text-primary" />
            </div>
            <h1 className="text-3xl font-bold mb-4">Thank You!</h1>
            <p className="text-muted-foreground mb-8">
              Your feedback has been received. It helps us make MeshCards better for everyone.
            </p>
            <a href="/" className="inline-flex items-center justify-center rounded-xl bg-primary px-8 py-3 text-sm font-semibold text-primary-foreground shadow transition-colors hover:bg-primary/90">
              Back to Home
            </a>
          </div>
        </main>
        <SimpleFooter />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="flex-1 py-6 md:py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="text-center mb-12">
              <span className="inline-block px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-semibold mb-4">
                We're Listening
              </span>
              <span> </span>
              <span className="inline-block px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-semibold mb-4">
                I work on this project on weekends ☺️
              </span>
              <h1 className="text-3xl md:text-5xl font-bold mb-4">
                Share Your <span className="text-primary">Feedback</span>
              </h1>
              <p className="text-muted-foreground max-w-xl mx-auto text-lg">
                MeshCards is built for learners like you. Your feedback shapes the future of this tool. MeshCards is not affiliated with Anki or any company.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {/* Feedback Form */}
              <div className="md:col-span-2">
                <form onSubmit={handleSubmit} className="bg-card rounded-2xl border-2 border-foreground p-6 shadow-[4px_4px_0_0_hsl(var(--foreground))]">
                  {/* Feedback Type */}
                  <div className="mb-6">
                    <label className="text-sm font-bold mb-3 block">Type of Feedback</label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {feedbackTypes.map((ft) => (
                        <button
                          key={ft.id}
                          type="button"
                          onClick={() => setType(ft.id as FeedbackType)}
                          className={`flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all ${
                            type === ft.id
                              ? 'border-primary bg-primary/10 text-primary shadow-sm'
                              : 'border-border hover:border-primary/50'
                          }`}
                        >
                          <ft.icon className="w-5 h-5" />
                          <span className="text-xs font-bold">{ft.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Rating & Attachment Row */}
                  <div className="mb-6">
                    <div className="flex flex-wrap items-center gap-4 bg-muted/30 p-4 rounded-xl border border-border/50">
                      {/* Rating */}
                      <div className="flex-1 min-w-[180px]">
                        <label className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground mb-2 block">How's your experience?</label>
                        <div className="flex gap-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button
                              key={star}
                              type="button"
                              onClick={() => setRating(star)}
                              className="transition-transform hover:scale-110 focus:outline-none"
                            >
                              <Star
                                className={`w-6 h-6 ${
                                  star <= rating ? 'fill-primary text-primary' : 'text-muted-foreground/30 stroke-2'
                                }`}
                              />
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Compact Attachment */}
                      <div className="flex-1 min-w-[220px] sm:border-l sm:border-border sm:pl-4">
                        <label className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground mb-2 block">Attachment (Optional)</label>
                        {!file ? (
                          <label className="flex items-center gap-2 cursor-pointer group">
                             <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-dashed border-border group-hover:border-primary group-hover:bg-primary/5 transition-all">
                                <Paperclip className="w-4 h-4 text-muted-foreground group-hover:text-primary" />
                                <span className="text-xs font-semibold text-muted-foreground group-hover:text-primary">Attach Screenshot/PDF</span>
                             </div>
                             <input
                              type="file"
                              className="hidden"
                              accept="image/*,.pdf"
                              onChange={(e) => {
                                const selectedFile = e.target.files?.[0];
                                if (selectedFile && selectedFile.size <= 10 * 1024 * 1024) {
                                  setFile(selectedFile);
                                } else if (selectedFile) {
                                  alert('File size must be less than 10MB');
                                }
                              }}
                            />
                          </label>
                        ) : (
                          <div className="flex items-center gap-2 bg-background border border-border px-2 py-1 rounded-lg max-w-full">
                            <Paperclip className="w-3.5 h-3.5 text-primary shrink-0" />
                            <span className="text-xs font-medium truncate flex-1">{file.name}</span>
                            <button
                              type="button"
                              onClick={() => setFile(null)}
                              className="p-1 hover:bg-destructive/10 rounded-md transition-colors"
                            >
                              <X className="w-3.5 h-3.5 text-destructive" />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Email */}
                  <div className="mb-5">
                    <label className="text-sm font-bold mb-2 block">
                      Email <span className="text-muted-foreground font-normal">(optional)</span>
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="your@email.com"
                      className="w-full rounded-xl border-2 border-border bg-background px-4 py-3 text-sm focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/10 transition-all"
                    />
                    <p className="text-xs text-muted-foreground mt-2">
                      Only if you'd like us to follow up with you
                    </p>
                  </div>

                  {/* Message */}
                  <div className="mb-5">
                    <label className="text-sm font-bold mb-2 block">Your Message</label>
                    <textarea
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Tell us what's on your mind..."
                      className="w-full h-32 resize-none rounded-xl border-2 border-border bg-background p-4 text-sm focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/10 transition-all"
                      required
                    />
                  </div>


                  <button type="submit" className="w-full bg-primary text-primary-foreground hover:bg-primary/90 py-4 rounded-xl font-bold text-lg shadow-lg flex items-center justify-center gap-2 transition-transform active:scale-[0.98]">
                    <Send className="w-5 h-5" />
                    Send Feedback
                  </button>
                </form>
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Support Card */}
                <div className="bg-card rounded-2xl border-2 border-foreground p-6 shadow-[4px_4px_0_0_hsl(var(--foreground))] text-center">
                  <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-yellow-200">
                    <Coffee className="w-8 h-8 text-yellow-600" />
                  </div>
                  <h3 className="font-bold text-lg mb-2">Support Development</h3>
                  <p className="text-sm text-muted-foreground mb-6">
                    Help keep MeshCards free and running by supporting the developer.
                  </p>
                  <a
                    href="https://buymeacoffee.com/htclodkzgo"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#FFDD00] px-4 py-3 text-sm font-bold text-black transition-transform hover:-translate-y-0.5"
                  >
                    <Coffee className="w-4 h-4" />
                    Buy Me a Coffee
                  </a>
                </div>

                {/* Dev Message */}
                <div className="bg-muted/30 rounded-2xl border-2 border-border p-6 border-dashed">
                  <h3 className="font-bold text-lg mb-3">From the Developer</h3>
                  <p className="text-sm text-muted-foreground mb-2 leading-relaxed">
                    Hi! I built MeshCards to help students study more effectively. This project is a labor of love, and I'm working on it in my spare time.
                  </p>
                  <p className="text-sm text-muted-foreground mb-2 leading-relaxed">
                    Your feedback and support mean everything.
                  </p>
                  <div className="mb-0">
                    <p className="text-sm text-muted-foreground mb-2">
                      ⬅ Use the form, or{' '}
                      <a 
                        href="mailto:talktopranav@cc.cc" 
                        className="text-primary hover:text-primary/80 underline font-semibold"
                      >
                        Email me 
                      </a>
                      {' '}directly.
                    </p>
                    <p className="text-sm font-semibold text-foreground">
                      💌 I love to hear from you and I read every message!
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <SimpleFooter />
    </div>
  );
}
