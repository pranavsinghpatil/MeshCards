import React from "react";
import Header from "@/components/Header";
import SimpleFooter from "@/components/SimpleFooter";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useSearchParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";

const LegalPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const section = searchParams.get('section') || 'disclaimer';
  const isMaintenanceMode = import.meta.env.VITE_MAINTENANCE_MODE === 'true';

  const handleTabChange = (value: string) => {
    setSearchParams({ section: value });
  };

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
      
      <main className="flex-1 container mx-auto px-4 py-12 md:py-16">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold mb-8 text-center">Legal Documentation</h1>
          
          <Tabs value={section} onValueChange={handleTabChange} className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-8">
                <TabsTrigger value="disclaimer">Disclaimer</TabsTrigger>
              <TabsTrigger value="terms">Terms & Conditions</TabsTrigger>
              <TabsTrigger value="privacy">Privacy Policy</TabsTrigger>
              
            </TabsList>
            
            <div className="bg-card border-2 border-border rounded-xl p-8 shadow-sm">
                <ScrollArea className="h-[600px] pr-4">
                    <TabsContent value="terms" className="mt-0 space-y-6">
                    <h2 className="text-2xl font-bold">Terms and Conditions</h2>
                    <p className="text-sm text-muted-foreground">Last Updated: {new Date().toLocaleDateString()}</p>
                    
                    <section>
                        <h3 className="text-lg font-semibold mb-2">1. Introduction and Acceptance of Terms</h3>
                        <p>Welcome to <strong>MeshCards</strong> ("MeshCards", "we", "our", or "us"). MeshCards is a free, AI-powered educational tool designed to help learners generate flashcards and study materials from their own content for personal learning and revision purposes.</p>
                        <p className="mt-2">By accessing, browsing, or using the MeshCards website, application, or any related services (collectively, the "Service"), you acknowledge that you have read, understood, and agreed to be bound by these Terms and Conditions ("Terms"). If you do not agree with any part of these Terms, you must not use the Service.</p>
                        <p className="mt-2">These Terms constitute a legally binding agreement between you (the "User") and MeshCards. Use of the Service indicates your voluntary acceptance of these Terms.</p>
                    </section>

                    <section>
                        <h3 className="text-lg font-semibold mb-2">2. Nature of the Service</h3>
                        <p>MeshCards is provided as a <strong>free educational utility</strong>. The Service enables users to upload text, documents, or other study-related material and generate flashcards or learning aids using artificial intelligence technologies.</p>
                        <p className="mt-2">MeshCards is <strong>not a commercial tutoring service</strong>, <strong>not a professional educational institution</strong>, and <strong>not a guaranteed accuracy system</strong>. The Service is intended solely to support personal study, revision, and learning workflows.</p>
                        <p className="mt-2">MeshCards does <strong>not</strong>:</p>
                        <ul className="list-disc pl-5 mt-2 space-y-1">
                            <li>Replace textbooks, official curriculum, or instructors</li>
                            <li>Guarantee correctness, completeness, or suitability of generated content</li>
                            <li>Certify academic performance or learning outcomes</li>
                        </ul>
                    </section>

                    <section>
                        <h3 className="text-lg font-semibold mb-2">3. Eligibility and User Responsibility</h3>
                        <p>You must be legally capable of entering into binding agreements to use the Service. By using MeshCards, you represent that:</p>
                        <ul className="list-disc pl-5 mt-2 space-y-1">
                            <li>You are legally permitted to use the Service under applicable laws</li>
                            <li>You are using the Service voluntarily</li>
                            <li>You understand the experimental and assistive nature of AI-generated outputs</li>
                        </ul>
                        <p className="mt-2">You are solely responsible for:</p>
                        <ul className="list-disc pl-5 mt-2 space-y-1">
                            <li>The content you upload</li>
                            <li>How you use the generated flashcards or study materials</li>
                            <li>Verifying the accuracy and relevance of outputs before relying on them</li>
                        </ul>
                    </section>

                    <section>
                        <h3 className="text-lg font-semibold mb-2">4. Permitted Use</h3>
                        <p>MeshCards may only be used for <strong>lawful, ethical, and educational purposes</strong>.</p>
                        <p className="mt-2">You agree that you will:</p>
                        <ul className="list-disc pl-5 mt-2 space-y-1">
                            <li>Use the Service only for personal study, revision, or learning</li>
                            <li>Upload content that you have the legal right to use</li>
                            <li>Respect applicable laws and regulations</li>
                        </ul>
                        <p className="mt-2">You agree that you will <strong>not</strong>:</p>
                        <ul className="list-disc pl-5 mt-2 space-y-1">
                            <li>Use the Service for illegal, harmful, or deceptive purposes</li>
                            <li>Upload copyrighted material without proper authorization</li>
                            <li>Use the Service to generate content for cheating, plagiarism, or academic misconduct</li>
                            <li>Attempt to reverse engineer, exploit, or abuse the Service</li>
                            <li>Interfere with the stability, security, or availability of the platform</li>
                        </ul>
                    </section>

                    <section>
                        <h3 className="text-lg font-semibold mb-2">5. User Content and Ownership</h3>
                        <p>You retain ownership of all content that you upload to MeshCards ("User Content").</p>
                        <p className="mt-2">MeshCards does <strong>not</strong> claim ownership of:</p>
                        <ul className="list-disc pl-5 mt-2 space-y-1">
                            <li>Uploaded text or files</li>
                            <li>Generated flashcards or outputs</li>
                        </ul>
                        <p className="mt-2">However, by using the Service, you grant MeshCards a <strong>limited, non-exclusive, temporary license</strong> to process your User Content solely for the purpose of providing the Service.</p>
                        <p className="mt-2">This license:</p>
                        <ul className="list-disc pl-5 mt-2 space-y-1">
                            <li>Exists only during processing</li>
                            <li>Does not permit resale, redistribution, or training of AI models without consent</li>
                            <li>Automatically terminates once processing is complete, except where temporary caching is required for technical reasons</li>
                        </ul>
                    </section>

                    <section>
                        <h3 className="text-lg font-semibold mb-2">6. AI-Generated Content Disclaimer</h3>
                        <p>MeshCards uses artificial intelligence models to generate outputs. AI-generated content is inherently probabilistic and may contain:</p>
                        <ul className="list-disc pl-5 mt-2 space-y-1">
                            <li>Errors</li>
                            <li>Omissions</li>
                            <li>Inaccuracies</li>
                            <li>Misinterpretations</li>
                        </ul>
                        <p className="mt-2">MeshCards <strong>does not guarantee</strong> that generated flashcards:</p>
                        <ul className="list-disc pl-5 mt-2 space-y-1">
                            <li>Are factually correct</li>
                            <li>Are suitable for exams or assessments</li>
                            <li>Align with specific curricula or syllabi</li>
                        </ul>
                        <p className="mt-2">You agree that:</p>
                        <ul className="list-disc pl-5 mt-2 space-y-1">
                            <li>All outputs are used at your own discretion</li>
                            <li>You will independently verify important information</li>
                            <li>MeshCards is not responsible for decisions made based on generated content</li>
                        </ul>
                    </section>

                    <section>
                        <h3 className="text-lg font-semibold mb-2">7. No Professional Advice</h3>
                        <p>The Service does <strong>not</strong> provide:</p>
                        <ul className="list-disc pl-5 mt-2 space-y-1">
                            <li>Legal advice</li>
                            <li>Medical advice</li>
                            <li>Financial advice</li>
                            <li>Academic certification</li>
                            <li>Professional tutoring services</li>
                        </ul>
                        <p className="mt-2">Any content generated by MeshCards is strictly informational and educational in nature. You must consult qualified professionals or authoritative sources for matters requiring professional judgment.</p>
                    </section>

                    <section>
                        <h3 className="text-lg font-semibold mb-2">8. Service Availability and Modifications</h3>
                        <p>MeshCards is provided on an <strong>"as is" and "as available"</strong> basis.</p>
                        <p className="mt-2">We reserve the right to:</p>
                        <ul className="list-disc pl-5 mt-2 space-y-1">
                            <li>Modify, suspend, or discontinue the Service at any time</li>
                            <li>Add, remove, or change features without prior notice</li>
                            <li>Restrict usage to maintain system stability or fairness</li>
                        </ul>
                        <p className="mt-2">We do not guarantee:</p>
                        <ul className="list-disc pl-5 mt-2 space-y-1">
                            <li>Continuous uptime</li>
                            <li>Uninterrupted access</li>
                            <li>Error-free operation</li>
                        </ul>
                    </section>

                    <section>
                        <h3 className="text-lg font-semibold mb-2">9. Sponsorship and Sustainability</h3>
                        <p>MeshCards is primarily supported through <strong>sponsorships, donations, or voluntary support</strong>.</p>
                        <p className="mt-2">You acknowledge that:</p>
                        <ul className="list-disc pl-5 mt-2 space-y-1">
                            <li>The Service is offered free of charge</li>
                            <li>Feature availability may change based on resource constraints</li>
                            <li>Sponsorship integrations may appear in the future to sustain operations</li>
                        </ul>
                        <p className="mt-2">MeshCards does <strong>not</strong> guarantee long-term availability.</p>
                    </section>

                    <section>
                        <h3 className="text-lg font-semibold mb-2">10. Account Access and Authentication</h3>
                        <p>Certain features may require authentication through third-party services (e.g., Google sign-in).</p>
                        <p className="mt-2">You are responsible for:</p>
                        <ul className="list-disc pl-5 mt-2 space-y-1">
                            <li>Maintaining the confidentiality of your login credentials</li>
                            <li>All activities conducted under your account</li>
                        </ul>
                        <p className="mt-2">MeshCards is not responsible for unauthorized access resulting from user negligence.</p>
                    </section>

                    <section>
                        <h3 className="text-lg font-semibold mb-2">11. Third-Party Services and Integrations</h3>
                        <p>MeshCards may rely on third-party services, including:</p>
                        <ul className="list-disc pl-5 mt-2 space-y-1">
                            <li>Authentication providers</li>
                            <li>Hosting services</li>
                            <li>AI model APIs</li>
                        </ul>
                        <p className="mt-2">MeshCards is <strong>not responsible</strong> for:</p>
                        <ul className="list-disc pl-5 mt-2 space-y-1">
                            <li>Third-party service failures</li>
                            <li>Data handling practices of external providers</li>
                            <li>Downtime caused by external dependencies</li>
                        </ul>
                        <p className="mt-2">Use of third-party services is governed by their respective terms and policies.</p>
                    </section>

                    <section>
                        <h3 className="text-lg font-semibold mb-2">12. Limitation of Liability</h3>
                        <p>To the maximum extent permitted by law, MeshCards and its creators shall not be liable for:</p>
                        <ul className="list-disc pl-5 mt-2 space-y-1">
                            <li>Direct or indirect damages</li>
                            <li>Loss of data</li>
                            <li>Academic consequences</li>
                            <li>Misuse of generated content</li>
                            <li>Reliance on inaccurate outputs</li>
                            <li>Service interruptions or discontinuation</li>
                        </ul>
                        <p className="mt-2">You use the Service entirely at your own risk.</p>
                    </section>

                    <section>
                        <h3 className="text-lg font-semibold mb-2">13. Indemnification</h3>
                        <p>You agree to indemnify and hold harmless MeshCards from any claims, damages, losses, or expenses arising from:</p>
                        <ul className="list-disc pl-5 mt-2 space-y-1">
                            <li>Your use of the Service</li>
                            <li>Your uploaded content</li>
                            <li>Your violation of these Terms</li>
                            <li>Your misuse of AI-generated outputs</li>
                        </ul>
                    </section>

                    <section>
                        <h3 className="text-lg font-semibold mb-2">14. Termination of Access</h3>
                        <p>MeshCards reserves the right to suspend or terminate access to the Service at any time if:</p>
                        <ul className="list-disc pl-5 mt-2 space-y-1">
                            <li>These Terms are violated</li>
                            <li>The Service is abused</li>
                            <li>Continued use poses risk to system integrity</li>
                        </ul>
                        <p className="mt-2">Termination may occur without prior notice.</p>
                    </section>

                    <section>
                        <h3 className="text-lg font-semibold mb-2">15. Changes to These Terms</h3>
                        <p>MeshCards may update these Terms from time to time. Changes will become effective upon publication.</p>
                        <p className="mt-2">Continued use of the Service after changes constitutes acceptance of the revised Terms.</p>
                    </section>

                    <section>
                        <h3 className="text-lg font-semibold mb-2">16. Governing Law</h3>
                        <p>These Terms shall be governed and interpreted in accordance with applicable laws, without regard to conflict of law principles.</p>
                    </section>

                    <section>
                        <h3 className="text-lg font-semibold mb-2">17. Contact and Feedback</h3>
                        <p>MeshCards is a personal educational initiative. Feedback, suggestions, and issue reports are welcome.</p>
                        <p className="mt-2">However, MeshCards is under no obligation to provide:</p>
                        <ul className="list-disc pl-5 mt-2 space-y-1">
                            <li>Support guarantees</li>
                            <li>Feature commitments</li>
                            <li>Response timelines</li>
                        </ul>
                    </section>

                    <section>
                        <h3 className="text-lg font-semibold mb-2">18. Final Acknowledgment</h3>
                        <p>By using MeshCards, you acknowledge that:</p>
                        <ul className="list-disc pl-5 mt-2 space-y-1">
                            <li>The Service is experimental and educational</li>
                            <li>AI-generated content may be imperfect</li>
                            <li>You bear full responsibility for how you use the outputs</li>
                        </ul>
                    </section>
                    </TabsContent>

                    <TabsContent value="privacy" className="mt-0 space-y-6">
                    <h2 className="text-2xl font-bold">Privacy Policy</h2>
                    <p className="text-sm text-muted-foreground">Last Updated: {new Date().toLocaleDateString()}</p>

                    <section>
                        <h3 className="text-lg font-semibold mb-2">1. Introduction</h3>
                        <p>MeshCards ("MeshCards", "we", "our", or "us") is committed to respecting and protecting your privacy. This Privacy Policy explains how we collect, use, store, process, and safeguard your information when you access or use the MeshCards website, application, or related services (collectively, the "Service").</p>
                        <p className="mt-2">MeshCards is a <strong>free educational tool</strong>, developed as a personal initiative to help learners generate flashcards and study materials. We collect <strong>only the minimum information necessary</strong> to operate the Service and do not engage in the sale of personal data.</p>
                        <p className="mt-2">By using MeshCards, you consent to the practices described in this Privacy Policy.</p>
                    </section>

                    <section>
                        <h3 className="text-lg font-semibold mb-2">2. Principles We Follow</h3>
                        <p>MeshCards is designed around the following privacy principles:</p>
                        <ul className="list-disc pl-5 mt-2 space-y-1">
                            <li><strong>Data minimization</strong> – collect only what is necessary</li>
                            <li><strong>Purpose limitation</strong> – use data only to provide the Service</li>
                            <li><strong>Transparency</strong> – clearly explain how data is handled</li>
                            <li><strong>User control</strong> – no hidden data usage or silent exploitation</li>
                            <li><strong>No AI training without consent</strong> – user content is not used to train models by default</li>
                        </ul>
                    </section>

                    <section>
                        <h3 className="text-lg font-semibold mb-2">3. Information We Collect</h3>
                        <p>We collect limited categories of information, described below.</p>
                        
                        <h4 className="font-semibold mt-4 mb-2">3.1 Account Information</h4>
                        <p>If you choose to sign in using a third-party authentication provider (such as Google), we may receive basic account information, including:</p>
                        <ul className="list-disc pl-5 mt-2 space-y-1">
                            <li>Email address</li>
                            <li>Display name</li>
                            <li>Profile image (if provided by the provider)</li>
                        </ul>
                        <p className="mt-2">We <strong>do not</strong> collect passwords, payment details, or sensitive personal identifiers.</p>

                        <h4 className="font-semibold mt-4 mb-2">3.2 User-Provided Content</h4>
                        <p>To provide the core functionality of MeshCards, you may upload or submit:</p>
                        <ul className="list-disc pl-5 mt-2 space-y-1">
                            <li>Text</li>
                            <li>Notes</li>
                            <li>Documents</li>
                            <li>Study-related files</li>
                            <li>Prompts or inputs used to generate flashcards</li>
                        </ul>
                        <p className="mt-2">This content ("User Content") is processed <strong>only</strong> to generate flashcards and related outputs requested by you.</p>

                        <h4 className="font-semibold mt-4 mb-2">3.3 Usage and Technical Data</h4>
                        <p>We may collect limited technical or usage-related data, such as:</p>
                        <ul className="list-disc pl-5 mt-2 space-y-1">
                            <li>Anonymous usage metrics (feature usage, error rates)</li>
                            <li>Device or browser type</li>
                            <li>Session-related metadata</li>
                            <li>Performance logs</li>
                        </ul>
                        <p className="mt-2">This data is collected in an <strong>aggregated and non-identifying manner</strong>, solely to improve reliability and performance.</p>
                    </section>

                    <section>
                        <h3 className="text-lg font-semibold mb-2">4. How We Use Information</h3>
                        <p>MeshCards uses collected information strictly for the following purposes:</p>
                        <ul className="list-disc pl-5 mt-2 space-y-1">
                            <li>To provide and operate the Service</li>
                            <li>To authenticate users</li>
                            <li>To process user inputs and generate flashcards</li>
                            <li>To improve system performance and stability</li>
                            <li>To respond to feedback or support inquiries</li>
                            <li>To prevent misuse or abuse of the Service</li>
                        </ul>
                        <p className="mt-2">We do <strong>not</strong> use your data for:</p>
                        <ul className="list-disc pl-5 mt-2 space-y-1">
                            <li>Advertising targeting</li>
                            <li>Behavioral profiling</li>
                            <li>Selling or renting personal data</li>
                        </ul>
                    </section>

                    <section>
                        <h3 className="text-lg font-semibold mb-2">5. AI Processing and Model Usage</h3>
                        <p>MeshCards relies on artificial intelligence models to generate flashcards and study materials.</p>
                        
                        <h4 className="font-semibold mt-4 mb-2">Important Clarifications:</h4>
                        <ul className="list-disc pl-5 mt-2 space-y-1">
                            <li>User Content is sent to AI models <strong>only when required</strong> to generate outputs requested by you.</li>
                            <li>MeshCards may dynamically route requests to different AI models or providers to ensure availability, performance, or quality.</li>
                            <li>Model selection may differ from visible indicators shown in the interface.</li>
                        </ul>

                        <h4 className="font-semibold mt-4 mb-2">Training and Retention:</h4>
                        <ul className="list-disc pl-5 mt-2 space-y-1">
                            <li>User Content is <strong>not used to train AI models</strong> owned or controlled by MeshCards.</li>
                            <li>Third-party AI providers may process content according to their own privacy policies.</li>
                            <li>MeshCards does not authorize reuse of User Content for training without explicit user consent.</li>
                        </ul>
                    </section>

                    <section>
                        <h3 className="text-lg font-semibold mb-2">6. Data Storage and Retention</h3>
                        
                        <h4 className="font-semibold mt-4 mb-2">6.1 Temporary Processing</h4>
                        <p>User Content is typically processed <strong>ephemerally</strong>:</p>
                        <ul className="list-disc pl-5 mt-2 space-y-1">
                            <li>Content exists in memory or temporary storage only as long as required to generate outputs.</li>
                            <li>Content is not permanently archived unless explicitly stated.</li>
                        </ul>

                        <h4 className="font-semibold mt-4 mb-2">6.2 Retention Periods</h4>
                        <ul className="list-disc pl-5 mt-2 space-y-1">
                            <li>Account information is retained only while your account remains active.</li>
                            <li>Temporary logs are retained for limited durations for debugging or monitoring.</li>
                            <li>Generated outputs may be available temporarily for download or preview.</li>
                        </ul>
                        <p className="mt-2">We aim to retain data for the <strong>shortest practical duration</strong>.</p>
                    </section>

                    <section>
                        <h3 className="text-lg font-semibold mb-2">7. Data Security</h3>
                        <p>We take reasonable technical and organizational measures to protect your data, including:</p>
                        <ul className="list-disc pl-5 mt-2 space-y-1">
                            <li>Secure communication protocols (HTTPS)</li>
                            <li>Access controls</li>
                            <li>Infrastructure-level protections</li>
                            <li>Limited administrative access</li>
                        </ul>
                        <p className="mt-2">However, no online service can guarantee absolute security. You acknowledge that:</p>
                        <ul className="list-disc pl-5 mt-2 space-y-1">
                            <li>Data transmission over the internet is never 100% secure</li>
                            <li>You use the Service at your own risk</li>
                        </ul>
                    </section>

                    <section>
                        <h3 className="text-lg font-semibold mb-2">8. Third-Party Services</h3>
                        <p>MeshCards relies on third-party services to operate, including but not limited to:</p>
                        <ul className="list-disc pl-5 mt-2 space-y-1">
                            <li>Authentication providers (e.g., Google)</li>
                            <li>Hosting and infrastructure services</li>
                            <li>Database or backend services (e.g., Supabase)</li>
                            <li>AI model providers</li>
                        </ul>
                        <p className="mt-2">Each third-party service operates under its own privacy policy. MeshCards is not responsible for the data practices of external providers.</p>
                        <p className="mt-2">We recommend reviewing their privacy policies if you have concerns.</p>
                    </section>

                    <section>
                        <h3 className="text-lg font-semibold mb-2">9. Sponsorship and Analytics</h3>
                        <p>MeshCards may display sponsorship acknowledgments or integrate lightweight analytics to understand usage patterns.</p>
                        <ul className="list-disc pl-5 mt-2 space-y-1">
                            <li>Analytics are designed to be <strong>privacy-conscious</strong></li>
                            <li>No personally identifiable information is sold or shared for marketing</li>
                            <li>Sponsorships help keep the Service free and operational</li>
                        </ul>
                        <p className="mt-2">MeshCards does <strong>not</strong> conduct behavioral advertising.</p>
                    </section>

                    <section>
                        <h3 className="text-lg font-semibold mb-2">10. Cookies and Tracking Technologies</h3>
                        <p>MeshCards may use essential cookies or local storage mechanisms to:</p>
                        <ul className="list-disc pl-5 mt-2 space-y-1">
                            <li>Maintain session state</li>
                            <li>Improve user experience</li>
                            <li>Ensure authentication functionality</li>
                        </ul>
                        <p className="mt-2">We do <strong>not</strong> use invasive tracking cookies or third-party ad trackers.</p>
                        <p className="mt-2">You may disable cookies via your browser settings, though some features may not function properly.</p>
                    </section>

                    <section>
                        <h3 className="text-lg font-semibold mb-2">11. Children’s Privacy</h3>
                        <p>MeshCards is not specifically directed toward children under the age of 13.</p>
                        <p className="mt-2">We do not knowingly collect personal information from children. If you believe that a child has provided personal data, please contact us so appropriate action can be taken.</p>
                    </section>

                    <section>
                        <h3 className="text-lg font-semibold mb-2">12. Your Rights and Choices</h3>
                        <p>Depending on your jurisdiction, you may have rights to:</p>
                        <ul className="list-disc pl-5 mt-2 space-y-1">
                            <li>Access your personal data</li>
                            <li>Request correction or deletion</li>
                            <li>Withdraw consent</li>
                            <li>Request data portability</li>
                        </ul>
                        <p className="mt-2">Because MeshCards collects minimal data, most requests can be handled informally. Contact details are provided below.</p>
                    </section>

                    <section>
                        <h3 className="text-lg font-semibold mb-2">13. International Users</h3>
                        <p>MeshCards may be accessed globally. By using the Service, you understand that:</p>
                        <ul className="list-disc pl-5 mt-2 space-y-1">
                            <li>Data may be processed in different jurisdictions</li>
                            <li>Data protection laws may vary by region</li>
                        </ul>
                        <p className="mt-2">We aim to apply consistent privacy principles regardless of location.</p>
                    </section>

                    <section>
                        <h3 className="text-lg font-semibold mb-2">14. Changes to This Privacy Policy</h3>
                        <p>We may update this Privacy Policy from time to time to reflect:</p>
                        <ul className="list-disc pl-5 mt-2 space-y-1">
                            <li>Changes in functionality</li>
                            <li>Infrastructure updates</li>
                            <li>Legal or regulatory requirements</li>
                        </ul>
                        <p className="mt-2">Updates become effective upon publication. Continued use of the Service indicates acceptance of the revised policy.</p>
                    </section>

                    <section>
                        <h3 className="text-lg font-semibold mb-2">15. Contact and Communication</h3>
                        <p>MeshCards is a personal, free educational initiative. While we strive to respond to privacy-related concerns, we do not guarantee response times or formal support channels.</p>
                        <p className="mt-2">For privacy questions, feedback, or concerns, you may reach out through the contact information provided on the website.</p>
                    </section>

                    <section>
                        <h3 className="text-lg font-semibold mb-2">16. Final Notes</h3>
                        <p>By using MeshCards, you acknowledge that:</p>
                        <ul className="list-disc pl-5 mt-2 space-y-1">
                            <li>The Service prioritizes minimal data collection</li>
                            <li>AI-generated content involves third-party processing</li>
                            <li>You use the Service voluntarily and at your discretion</li>
                        </ul>
                    </section>
                    </TabsContent>

                    <TabsContent value="disclaimer" className="mt-0 space-y-6">
                    <h2 className="text-2xl font-bold">Disclaimer</h2>
                    
                    <section>
                        <h3 className="text-lg font-semibold mb-2">1. Purpose of This Disclaimer</h3>
                        <p>This Disclaimer governs your use of <strong>MeshCards</strong> ("MeshCards", "we", "our", or "us"). MeshCards is an AI-powered educational assistance tool created as a personal initiative to help learners generate flashcards and study materials.</p>
                        <p className="mt-2">The purpose of this Disclaimer is to clearly explain the <strong>limitations</strong>, <strong>risks</strong>, and <strong>responsibilities</strong> associated with using the Service, particularly in relation to artificial intelligence–generated content.</p>
                        <p className="mt-2">By using MeshCards, you acknowledge and accept the terms described in this Disclaimer.</p>
                    </section>

                    <section>
                        <h3 className="text-lg font-semibold mb-2">2. Educational Tool Only</h3>
                        <p>MeshCards is intended <strong>solely for educational and study-support purposes</strong>.</p>
                        <p className="mt-2">The Service is designed to:</p>
                        <ul className="list-disc pl-5 mt-2 space-y-1">
                            <li>Help organize study material</li>
                            <li>Assist with revision and recall</li>
                            <li>Generate flashcards and summaries from user-provided content</li>
                        </ul>
                        <p className="mt-2">MeshCards is <strong>not</strong>:</p>
                        <ul className="list-disc pl-5 mt-2 space-y-1">
                            <li>A substitute for formal education</li>
                            <li>A replacement for teachers, professors, or instructors</li>
                            <li>A source of certified or authoritative academic material</li>
                            <li>An exam preparation guarantee</li>
                        </ul>
                        <p className="mt-2">You should treat all outputs as <strong>learning aids</strong>, not final or authoritative sources.</p>
                    </section>

                    <section>
                        <h3 className="text-lg font-semibold mb-2">3. AI-Generated Content Limitations</h3>
                        <p>MeshCards uses artificial intelligence models to generate content. AI systems are probabilistic and may produce outputs that are:</p>
                        <ul className="list-disc pl-5 mt-2 space-y-1">
                            <li>Incorrect</li>
                            <li>Incomplete</li>
                            <li>Outdated</li>
                            <li>Ambiguous</li>
                            <li>Misleading</li>
                            <li>Poorly contextualized</li>
                        </ul>
                        <p className="mt-2">Even when outputs appear confident or well-structured, they may still be factually inaccurate.</p>
                        <p className="mt-2">You acknowledge that:</p>
                        <ul className="list-disc pl-5 mt-2 space-y-1">
                            <li>AI-generated content may contain errors</li>
                            <li>You must independently verify important information</li>
                            <li>MeshCards does not guarantee correctness or suitability</li>
                        </ul>
                    </section>

                    <section>
                        <h3 className="text-lg font-semibold mb-2">4. No Accuracy or Completeness Guarantee</h3>
                        <p>MeshCards makes <strong>no guarantees</strong> regarding:</p>
                        <ul className="list-disc pl-5 mt-2 space-y-1">
                            <li>Accuracy of generated flashcards</li>
                            <li>Completeness of explanations</li>
                            <li>Alignment with specific syllabi or curricula</li>
                            <li>Relevance to exams or assessments</li>
                            <li>Consistency across different generations</li>
                        </ul>
                        <p className="mt-2">Any reliance on generated content is <strong>entirely at your own risk</strong>.</p>
                    </section>

                    <section>
                        <h3 className="text-lg font-semibold mb-2">5. No Professional Advice of Any Kind</h3>
                        <p>The Service does <strong>not</strong> provide:</p>
                        <ul className="list-disc pl-5 mt-2 space-y-1">
                            <li>Legal advice</li>
                            <li>Medical advice</li>
                            <li>Financial advice</li>
                            <li>Psychological advice</li>
                            <li>Academic certification or accreditation</li>
                        </ul>
                        <p className="mt-2">Generated content must <strong>never</strong> be treated as professional advice. For critical decisions or official matters, consult qualified professionals or authoritative sources.</p>
                    </section>

                    <section>
                        <h3 className="text-lg font-semibold mb-2">6. User Responsibility and Verification</h3>
                        <p>You are solely responsible for:</p>
                        <ul className="list-disc pl-5 mt-2 space-y-1">
                            <li>Reviewing generated content</li>
                            <li>Validating factual claims</li>
                            <li>Ensuring ethical and lawful use</li>
                            <li>Deciding how to apply outputs in your studies</li>
                        </ul>
                        <p className="mt-2">MeshCards does not verify:</p>
                        <ul className="list-disc pl-5 mt-2 space-y-1">
                            <li>Correctness of uploaded material</li>
                            <li>Legality of user content</li>
                            <li>Intended downstream usage</li>
                        </ul>
                        <p className="mt-2">You assume full responsibility for how generated content is used.</p>
                    </section>

                    <section>
                        <h3 className="text-lg font-semibold mb-2">7. Academic Integrity and Ethical Use</h3>
                        <p>MeshCards is intended to <strong>support learning</strong>, not undermine it.</p>
                        <p className="mt-2">You agree that you will <strong>not</strong> use MeshCards to:</p>
                        <ul className="list-disc pl-5 mt-2 space-y-1">
                            <li>Cheat on exams or assessments</li>
                            <li>Submit AI-generated content as original work without disclosure</li>
                            <li>Circumvent academic integrity policies</li>
                            <li>Engage in plagiarism or misconduct</li>
                        </ul>
                        <p className="mt-2">MeshCards is not responsible for any academic penalties or consequences resulting from misuse.</p>
                    </section>

                    <section>
                        <h3 className="text-lg font-semibold mb-2">8. No Guarantees on Learning Outcomes</h3>
                        <p>Using MeshCards does not guarantee:</p>
                        <ul className="list-disc pl-5 mt-2 space-y-1">
                            <li>Improved grades</li>
                            <li>Exam success</li>
                            <li>Concept mastery</li>
                            <li>Long-term retention</li>
                        </ul>
                        <p className="mt-2">Learning outcomes depend on:</p>
                        <ul className="list-disc pl-5 mt-2 space-y-1">
                            <li>Individual effort</li>
                            <li>Study habits</li>
                            <li>Verification of material</li>
                            <li>Critical thinking</li>
                        </ul>
                        <p className="mt-2">MeshCards is a <strong>tool</strong>, not a promise.</p>
                    </section>

                    <section>
                        <h3 className="text-lg font-semibold mb-2">9. Service Availability Disclaimer</h3>
                        <p>MeshCards is provided on an <strong>"as is" and "as available"</strong> basis.</p>
                        <p className="mt-2">We make no guarantees regarding:</p>
                        <ul className="list-disc pl-5 mt-2 space-y-1">
                            <li>Continuous uptime</li>
                            <li>Feature availability</li>
                            <li>Performance consistency</li>
                            <li>Error-free operation</li>
                        </ul>
                        <p className="mt-2">The Service may:</p>
                        <ul className="list-disc pl-5 mt-2 space-y-1">
                            <li>Experience downtime</li>
                            <li>Be modified without notice</li>
                            <li>Be suspended or discontinued at any time</li>
                        </ul>
                    </section>

                    <section>
                        <h3 className="text-lg font-semibold mb-2">10. Experimental and Evolving Nature</h3>
                        <p>MeshCards is an evolving project.</p>
                        <p className="mt-2">You acknowledge that:</p>
                        <ul className="list-disc pl-5 mt-2 space-y-1">
                            <li>Features may change</li>
                            <li>Behavior may differ across versions</li>
                            <li>Outputs may vary between requests</li>
                            <li>The system may behave unexpectedly</li>
                        </ul>
                        <p className="mt-2">By using the Service, you accept these uncertainties.</p>
                    </section>

                    <section>
                        <h3 className="text-lg font-semibold mb-2">11. Third-Party Dependencies</h3>
                        <p>MeshCards relies on third-party services, including:</p>
                        <ul className="list-disc pl-5 mt-2 space-y-1">
                            <li>AI model providers</li>
                            <li>Hosting platforms</li>
                            <li>Authentication services</li>
                            <li>Infrastructure providers</li>
                        </ul>
                        <p className="mt-2">We do not control these third parties and are not responsible for:</p>
                        <ul className="list-disc pl-5 mt-2 space-y-1">
                            <li>Their availability</li>
                            <li>Their accuracy</li>
                            <li>Their data handling practices</li>
                            <li>Their service interruptions</li>
                        </ul>
                    </section>

                    <section>
                        <h3 className="text-lg font-semibold mb-2">12. Model Routing and System Decisions</h3>
                        <p>To maintain reliability and performance, MeshCards may:</p>
                        <ul className="list-disc pl-5 mt-2 space-y-1">
                            <li>Dynamically route requests between AI models</li>
                            <li>Adjust processing pipelines</li>
                            <li>Optimize for availability or stability</li>
                        </ul>
                        <p className="mt-2">These decisions may differ from interface indicators or user expectations. Such routing does not imply guaranteed quality.</p>
                    </section>

                    <section>
                        <h3 className="text-lg font-semibold mb-2">13. Sponsorship and Funding Disclaimer</h3>
                        <p>MeshCards is primarily sustained through:</p>
                        <ul className="list-disc pl-5 mt-2 space-y-1">
                            <li>Sponsorships</li>
                            <li>Donations</li>
                            <li>Voluntary support</li>
                        </ul>
                        <p className="mt-2">You acknowledge that:</p>
                        <ul className="list-disc pl-5 mt-2 space-y-1">
                            <li>The Service is free</li>
                            <li>Sponsorships help cover operational costs</li>
                            <li>No paid guarantees are offered</li>
                        </ul>
                        <p className="mt-2">Sponsorship presence does not imply endorsement of content accuracy.</p>
                    </section>

                    <section>
                        <h3 className="text-lg font-semibold mb-2">14. Limitation of Liability</h3>
                        <p>To the fullest extent permitted by law, MeshCards and its creator(s) shall not be liable for:</p>
                        <ul className="list-disc pl-5 mt-2 space-y-1">
                            <li>Direct or indirect damages</li>
                            <li>Loss of academic standing</li>
                            <li>Loss of data</li>
                            <li>Reliance on inaccurate outputs</li>
                            <li>Service interruptions</li>
                            <li>Errors, omissions, or misinterpretations</li>
                            <li>Decisions made based on generated content</li>
                        </ul>
                        <p className="mt-2">You use the Service <strong>entirely at your own risk</strong>.</p>
                    </section>

                    <section>
                        <h3 className="text-lg font-semibold mb-2">15. No Warranty</h3>
                        <p>MeshCards disclaims all warranties, including but not limited to:</p>
                        <ul className="list-disc pl-5 mt-2 space-y-1">
                            <li>Implied warranties of merchantability</li>
                            <li>Fitness for a particular purpose</li>
                            <li>Non-infringement</li>
                        </ul>
                        <p className="mt-2">The Service is provided without any express or implied guarantees.</p>
                    </section>

                    <section>
                        <h3 className="text-lg font-semibold mb-2">16. User Acknowledgment</h3>
                        <p>By using MeshCards, you explicitly acknowledge that:</p>
                        <ul className="list-disc pl-5 mt-2 space-y-1">
                            <li>AI-generated content is imperfect</li>
                            <li>You are responsible for verification</li>
                            <li>MeshCards is an assistive educational tool only</li>
                            <li>No guarantees are provided</li>
                            <li>Use is voluntary and at your own discretion</li>
                        </ul>
                    </section>

                    <section>
                        <h3 className="text-lg font-semibold mb-2">17. Changes to This Disclaimer</h3>
                        <p>This Disclaimer may be updated periodically to reflect:</p>
                        <ul className="list-disc pl-5 mt-2 space-y-1">
                            <li>System changes</li>
                            <li>Legal considerations</li>
                            <li>Operational realities</li>
                        </ul>
                        <p className="mt-2">Continued use of the Service constitutes acceptance of updated terms.</p>
                    </section>

                    <section>
                        <h3 className="text-lg font-semibold mb-2">18. Final Statement</h3>
                        <p>MeshCards exists to help learners study more effectively, not to replace judgment, responsibility, or critical thinking.</p>
                        <p className="mt-2">If you require certainty, authority, or professional advice, <strong>do not rely on this Service</strong>.</p>
                    </section>
                    </TabsContent>
                </ScrollArea>
            </div>
            
            <div className="mt-8 text-center">
                <p className="text-muted-foreground mb-4">Have questions about these terms?</p>
                {isMaintenanceMode ? (
                  <a 
                    href="mailto:talktopranav@cc.cc" 
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow hover:bg-primary/90 transition-colors"
                  >
                    <Mail className="w-4 h-4" />
                    talktopranav@cc.cc
                  </a>
                ) : (
                  <a 
                    href="/feedback" 
                    className="inline-flex items-center justify-center rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow hover:bg-primary/90 transition-colors"
                  >
                    Contact Us
                  </a>
                )}
            </div>
          </Tabs>
        </div>
      </main>
      {!isMaintenanceMode && <SimpleFooter />}
    </div>
  );
};

export default LegalPage;
