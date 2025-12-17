import { useState } from 'react';
import Header from '@/components/Header';
import { MessageSquare, Heart, Send, Coffee, Star, Bug, Lightbulb, CheckCircle } from 'lucide-react';
import SimpleFooter from '@/components/SimpleFooter';

type FeedbackType = 'suggestion' | 'bug' | 'praise' | 'other';

export default function FeedbackPage() {
  const [type, setType] = useState<FeedbackType>('suggestion');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [rating, setRating] = useState(0);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Here you would send to your backend
    console.log({ type, email, message, rating });
    setSubmitted(true);
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
              <h1 className="text-3xl md:text-5xl font-bold mb-4">
                Share Your <span className="text-primary">Feedback</span>
              </h1>
              <p className="text-muted-foreground max-w-xl mx-auto text-lg">
                MeshCards is built for learners like you. Your feedback shapes the future of this tool.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {/* Feedback Form */}
              <div className="md:col-span-2">
                <form onSubmit={handleSubmit} className="bg-card rounded-2xl border-2 border-foreground p-6 shadow-[4px_4px_0_0_hsl(var(--foreground))]">
                  {/* Feedback Type */}
                  <div className="mb-8">
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

                  {/* Rating */}
                  <div className="mb-8">
                    <label className="text-sm font-bold mb-3 block">How's your experience so far?</label>
                    <div className="flex gap-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setRating(star)}
                          className="p-1 transition-transform hover:scale-110 focus:outline-none"
                        >
                          <Star
                            className={`w-8 h-8 ${
                              star <= rating ? 'fill-primary text-primary' : 'text-muted stroke-2'
                            }`}
                          />
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Email */}
                  <div className="mb-6">
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
                  <div className="mb-8">
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
                  <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
                    Hi! I built MeshCards to help students study more effectively. This project is a labor of love, 
                    and I'm working on it in my spare time.
                  </p>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Your feedback and support mean everything. Together, we can make this the best flashcard 
                    generator out there.
                  </p>
                  {/* <div className="mt-4 pt-4"> */}
                    {/* <p className="text-sm font-bold text-primary">— The MeshCards Team</p> */}
                  {/* </div> */}
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
