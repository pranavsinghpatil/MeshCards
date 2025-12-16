import { useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { MessageSquare, Heart, Send, Coffee, Star, Bug, Lightbulb, CheckCircle } from 'lucide-react';

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
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center py-20">
          <div className="text-center animate-fade-in">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-8 h-8 text-primary" />
            </div>
            <h1 className="font-display text-3xl font-bold mb-4">Thank You!</h1>
            <p className="text-muted-foreground mb-8 max-w-md mx-auto">
              Your feedback has been received. It helps us make AnkiGen better for everyone.
            </p>
            <a href="/" className="btn-primary">
              Back to Home
            </a>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 py-12 md:py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            {/* Header */}
            <div className="text-center mb-12">
              <span className="badge-primary mb-4 inline-block">We're Listening</span>
              <h1 className="font-display text-3xl md:text-4xl font-bold mb-4">
                Share Your Feedback
              </h1>
              <p className="text-muted-foreground max-w-xl mx-auto">
                AnkiGen is built for learners like you. Your feedback shapes the future of this tool.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {/* Feedback Form */}
              <div className="md:col-span-2">
                <form onSubmit={handleSubmit} className="card-clean">
                  {/* Feedback Type */}
                  <div className="mb-6">
                    <label className="text-sm font-medium mb-3 block">Type of Feedback</label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {feedbackTypes.map((ft) => (
                        <button
                          key={ft.id}
                          type="button"
                          onClick={() => setType(ft.id as FeedbackType)}
                          className={`flex flex-col items-center gap-2 p-3 rounded-lg border transition-colors ${
                            type === ft.id
                              ? 'border-primary bg-primary/5 text-primary'
                              : 'border-border hover:border-primary/30'
                          }`}
                        >
                          <ft.icon className="w-5 h-5" />
                          <span className="text-xs font-medium">{ft.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Rating */}
                  <div className="mb-6">
                    <label className="text-sm font-medium mb-3 block">How's your experience so far?</label>
                    <div className="flex gap-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setRating(star)}
                          className="p-1 transition-transform hover:scale-110"
                        >
                          <Star
                            className={`w-8 h-8 ${
                              star <= rating ? 'fill-primary text-primary' : 'text-border'
                            }`}
                          />
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Email */}
                  <div className="mb-6">
                    <label className="text-sm font-medium mb-2 block">
                      Email <span className="text-muted-foreground">(optional)</span>
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="your@email.com"
                      className="input-clean"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Only if you'd like us to follow up with you
                    </p>
                  </div>

                  {/* Message */}
                  <div className="mb-6">
                    <label className="text-sm font-medium mb-2 block">Your Message</label>
                    <textarea
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Tell us what's on your mind..."
                      className="textarea-clean h-32"
                      required
                    />
                  </div>

                  <button type="submit" className="btn-primary w-full py-3">
                    <Send className="w-5 h-5" />
                    Send Feedback
                  </button>
                </form>
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Support Card */}
                <div className="card-clean text-center">
                  <Coffee className="w-10 h-10 text-primary mx-auto mb-4" />
                  <h3 className="font-display font-semibold mb-2">Support Development</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Help keep AnkiGen free and running by supporting the developer.
                  </p>
                  <a
                    href="https://buymeacoffee.com/yourusername"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-secondary w-full"
                  >
                    <Coffee className="w-4 h-4" />
                    Buy Me a Coffee
                  </a>
                </div>

                {/* Dev Message */}
                <div className="card-clean">
                  <h3 className="font-display font-semibold mb-3">From the Developer</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Hi! I built AnkiGen to help students study more effectively. This project is a labor of love, 
                    and I'm working on it in my spare time.
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Your feedback and support mean everything. Together, we can make this the best flashcard 
                    generator out there.
                  </p>
                  <div className="mt-4 pt-4 border-t border-border">
                    <p className="text-sm font-medium">— The AnkiGen Team</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
