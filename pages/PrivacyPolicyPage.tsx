import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PATHS } from '../constants/paths';
import { supabase } from '../services/supabase';

const PrivacyPolicyPage: React.FC = () => {
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    
    // Check if user is logged in
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setIsLoggedIn(!!session);
    };
    checkAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsLoggedIn(!!session);
    });

    return () => {
      window.removeEventListener('scroll', handleScroll);
      subscription.unsubscribe();
    };
  }, []);

  const handleGetStarted = () => {
    if (isLoggedIn) {
      navigate(PATHS.HOME);
    } else {
      navigate(PATHS.AUTH);
    }
  };

  return (
    <div className="min-h-screen w-full bg-white text-slate-900 antialiased overflow-hidden relative">
      {/* Professional Header */}
      <header className="fixed top-6 left-0 right-0 z-50 flex justify-center px-4 pointer-events-none">
        <div
          className={`pointer-events-auto bg-white/90 backdrop-blur-lg rounded-full px-3 pl-8 py-4 shadow-2xl shadow-sky-200/40 border border-sky-100 transition-all duration-300 flex items-center gap-6 md:gap-12 ${
            scrolled ? 'scale-[0.98] opacity-95' : 'scale-100'
          }`}
        >
          <button 
            onClick={() => navigate(PATHS.LANDING)} 
            className="flex items-center focus:outline-none group" 
            aria-label="Go to homepage"
          >
            <img src="/logo.png" alt="Zol Studio AI" className="h-12 w-12 md:h-14 md:w-14 object-contain group-hover:opacity-90 transition-opacity" />
          </button>
          <div className="hidden md:flex items-center space-x-2">
            <button 
              onClick={() => navigate(PATHS.LANDING)} 
              className="px-5 py-2.5 text-base font-bold text-slate-600 hover:text-sky-600 rounded-full hover:bg-sky-50 transition-all"
            >
              Home
            </button>
            <button 
              onClick={() => navigate(PATHS.PRICING)} 
              className="px-5 py-2.5 text-base font-bold text-slate-600 hover:text-sky-600 rounded-full hover:bg-sky-50 transition-all"
            >
              Pricing
            </button>
          </div>
          <div className="flex items-center space-x-4">
            {isLoggedIn ? (
              <button
                onClick={() => navigate(PATHS.HOME)}
                className="relative overflow-hidden group bg-sky-500 text-white px-8 py-3.5 rounded-full font-bold text-base shadow-xl shadow-sky-200/50 hover:shadow-sky-300/50 hover:-translate-y-0.5 transition-all"
              >
                <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-sky-400 via-sky-500 to-sky-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <span className="relative flex items-center space-x-2">
                  <span>Go to Studio</span>
                  <svg className="w-5 h-5 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </span>
              </button>
            ) : (
              <>
                <button 
                  onClick={handleGetStarted} 
                  className="hidden sm:block px-5 py-2.5 text-base font-bold text-slate-600 hover:text-sky-600 transition-colors"
                >
                  Sign In
                </button>
                <button
                  onClick={handleGetStarted}
                  className="relative overflow-hidden group bg-sky-500 text-white px-8 py-3.5 rounded-full font-bold text-base shadow-xl shadow-sky-200/50 hover:shadow-sky-300/50 hover:-translate-y-0.5 transition-all"
                >
                  <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-sky-400 via-sky-500 to-sky-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <span className="relative flex items-center space-x-2">
                    <span>Get Started</span>
                    <svg className="w-5 h-5 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </span>
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 pt-32">
        {/* Professional Content Card */}
        <div className="bg-white rounded-lg shadow-sm border border-slate-200/60 p-8 sm:p-12 lg:p-16">
          {/* Professional Hero Section */}
          <div className="mb-10">
            <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-2 tracking-tight">Privacy Policy</h1>
            <p className="text-sm text-slate-600 font-normal">
              Updated at {new Date().toLocaleDateString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit' })}
            </p>
          </div>

          <div className="max-w-none">
            
            {/* Introduction */}
            <section className="mb-12">
              <h2 className="text-2xl font-bold text-slate-900 mb-6">1. Introduction</h2>
              <p className="text-base text-slate-700 leading-relaxed mb-6 font-normal">
                Welcome to Zol Studio AI ("we," "our," or "us"). We are committed to protecting your privacy and ensuring you have a positive experience on our website and in using our products and services. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website and use our AI-powered fashion e-commerce platform.
              </p>
              <p className="text-base text-slate-700 leading-relaxed font-normal">
                By accessing or using Zol Studio AI, you agree to the collection and use of information in accordance with this Privacy Policy. If you do not agree with our policies and practices, please do not use our services.
              </p>
            </section>

            {/* Information We Collect */}
            <section className="mb-12">
              <h2 className="text-2xl font-bold text-slate-900 mb-6 mt-10">2. Information We Collect</h2>
              
              <h3 className="text-xl font-semibold text-slate-900 mb-4 mt-8">2.1 Information You Provide to Us</h3>
              <ul className="list-disc pl-6 space-y-3 text-base text-slate-700 leading-relaxed">
                <li><strong>Account Information:</strong> When you create an account, we collect your email address, username, and password.</li>
                <li><strong>Profile Information:</strong> You may provide additional information such as avatar images, theme preferences, and other profile details.</li>
                <li><strong>Payment Information:</strong> When you subscribe to our services, we collect billing information through our payment processor (Lemon Squeezy). We do not store your full credit card details on our servers.</li>
                <li><strong>Content You Upload:</strong> Images, photos, and other content you upload to our platform for processing, including:
                  <ul className="list-disc pl-6 mt-2 space-y-2 text-sm">
                    <li>Model/person photos</li>
                    <li>Product/garment images</li>
                    <li>Pose reference images</li>
                    <li>Background images</li>
                  </ul>
                </li>
                <li><strong>Communications:</strong> Information you provide when contacting our support team or participating in surveys.</li>
              </ul>

              <h3 className="text-xl font-semibold text-slate-900 mb-4 mt-8">2.2 Information Automatically Collected</h3>
              <ul className="list-disc pl-6 space-y-3 text-base text-slate-700 leading-relaxed">
                <li><strong>Usage Data:</strong> Information about how you interact with our services, including feature usage, generation counts, and credit consumption.</li>
                <li><strong>Device Information:</strong> Browser type, device type, operating system, IP address, and device identifiers.</li>
                <li><strong>Log Data:</strong> Server logs, including timestamps, access times, pages viewed, and error logs.</li>
                <li><strong>Cookies and Tracking Technologies:</strong> We use cookies and similar technologies to enhance your experience, analyze usage patterns, and provide personalized content.</li>
              </ul>

              <h3 className="text-xl font-semibold text-slate-900 mb-4 mt-8">2.3 Information from Third Parties</h3>
              <ul className="list-disc pl-6 space-y-3 text-base text-slate-700 leading-relaxed">
                <li><strong>Authentication Providers:</strong> When you sign in using third-party authentication services (e.g., Google, GitHub), we may receive basic profile information.</li>
                <li><strong>Payment Processors:</strong> Our payment processor (Lemon Squeezy) provides us with transaction information and subscription status.</li>
              </ul>
            </section>

            {/* How We Use Your Information */}
            <section className="mb-12">
              <h2 className="text-2xl font-bold text-slate-900 mb-6 mt-10">3. How We Use Your Information</h2>
              <p className="text-base text-slate-700 leading-relaxed mb-6 font-normal">
                We use the information we collect for the following purposes:
              </p>
              <ul className="list-disc pl-6 space-y-3 text-base text-slate-700 leading-relaxed">
                <li><strong>Service Provision:</strong> To provide, maintain, and improve our AI-powered fashion e-commerce platform, including:
                  <ul className="list-disc pl-6 mt-2 space-y-2 text-sm">
                    <li>Processing your image uploads and generating AI-powered visual content</li>
                    <li>Managing your account, subscriptions, and credit allocation</li>
                    <li>Storing and organizing your generated assets</li>
                    <li>Providing customer support and responding to inquiries</li>
                  </ul>
                </li>
                <li><strong>AI Processing:</strong> Your uploaded images are processed using Google Gemini AI models to generate the requested visual content. Images are processed securely and are not used to train AI models without your explicit consent.</li>
                <li><strong>Communication:</strong> To send you service-related notifications, updates, security alerts, and administrative messages.</li>
                <li><strong>Analytics and Improvement:</strong> To analyze usage patterns, monitor performance, and improve our services, user experience, and platform functionality.</li>
                <li><strong>Legal Compliance:</strong> To comply with legal obligations, enforce our terms of service, and protect our rights and the rights of our users.</li>
                <li><strong>Marketing:</strong> With your consent, to send you promotional communications about new features, products, or services that may interest you.</li>
              </ul>
            </section>

            {/* Data Storage and Security */}
            <section className="mb-12">
              <h2 className="text-2xl font-bold text-slate-900 mb-6 mt-10">4. Data Storage and Security</h2>
              
              <h3 className="text-xl font-semibold text-slate-900 mb-4 mt-8">4.1 Data Storage</h3>
              <p className="text-base text-slate-700 leading-relaxed mb-6 font-normal">
                Your data is stored securely using industry-standard cloud infrastructure:
              </p>
              <ul className="list-disc pl-6 space-y-3 text-base text-slate-700 leading-relaxed">
                <li><strong>Supabase:</strong> User accounts, authentication, and database information are stored on Supabase, a secure cloud platform.</li>
                <li><strong>Cloud Storage:</strong> Generated images and uploaded content are stored in secure cloud storage with user-specific access controls.</li>
                <li><strong>Data Retention:</strong> We retain your data for as long as your account is active or as needed to provide services. You can request deletion of your data at any time.</li>
              </ul>

              <h3 className="text-xl font-semibold text-slate-900 mb-4 mt-8">4.2 Security Measures</h3>
              <p className="text-base text-slate-700 leading-relaxed mb-6 font-normal">
                We implement appropriate technical and organizational measures to protect your information:
              </p>
              <ul className="list-disc pl-6 space-y-3 text-base text-slate-700 leading-relaxed">
                <li>Encryption of data in transit and at rest</li>
                <li>Secure authentication and access controls</li>
                <li>Regular security audits and vulnerability assessments</li>
                <li>User-specific data isolation and access restrictions</li>
                <li>Secure API endpoints and data transmission</li>
              </ul>
              <p className="text-base text-slate-700 leading-relaxed mt-6 font-normal">
                However, no method of transmission over the Internet or electronic storage is 100% secure. While we strive to use commercially acceptable means to protect your information, we cannot guarantee absolute security.
              </p>
            </section>

            {/* Data Sharing and Disclosure */}
            <section className="mb-12">
              <h2 className="text-2xl font-bold text-slate-900 mb-6 mt-10">5. Data Sharing and Disclosure</h2>
              <p className="text-base text-slate-700 leading-relaxed mb-6 font-normal">
                We do not sell your personal information. We may share your information only in the following circumstances:
              </p>
              <ul className="list-disc pl-6 space-y-3 text-base text-slate-700 leading-relaxed">
                <li><strong>Service Providers:</strong> We may share information with trusted third-party service providers who assist us in operating our platform, including:
                  <ul className="list-disc pl-6 mt-2 space-y-2 text-sm">
                    <li>Google (Gemini AI) for image processing</li>
                    <li>Supabase for database and authentication services</li>
                    <li>Lemon Squeezy for payment processing</li>
                    <li>Cloud storage providers for asset storage</li>
                  </ul>
                </li>
                <li><strong>Legal Requirements:</strong> We may disclose information if required by law, court order, or government regulation, or to protect our rights, property, or safety, or that of our users.</li>
                <li><strong>Business Transfers:</strong> In the event of a merger, acquisition, or sale of assets, your information may be transferred as part of that transaction.</li>
                <li><strong>With Your Consent:</strong> We may share information with third parties when you explicitly consent to such sharing.</li>
              </ul>
            </section>

            {/* Your Rights and Choices */}
            <section className="mb-12">
              <h2 className="text-2xl font-bold text-slate-900 mb-6 mt-10">6. Your Rights and Choices</h2>
              <p className="text-base text-slate-700 leading-relaxed mb-6 font-normal">
                Depending on your location, you may have the following rights regarding your personal information:
              </p>
              <ul className="list-disc pl-6 space-y-3 text-base text-slate-700 leading-relaxed">
                <li><strong>Access:</strong> Request access to your personal information and data we hold about you.</li>
                <li><strong>Correction:</strong> Request correction of inaccurate or incomplete information.</li>
                <li><strong>Deletion:</strong> Request deletion of your personal information and account data.</li>
                <li><strong>Data Portability:</strong> Request a copy of your data in a portable format.</li>
                <li><strong>Opt-Out:</strong> Opt-out of marketing communications and certain data processing activities.</li>
                <li><strong>Cookie Preferences:</strong> Manage cookie preferences through your browser settings or our cookie consent banner.</li>
                <li><strong>Account Settings:</strong> Update your account information, preferences, and privacy settings through your account dashboard.</li>
              </ul>
              <p className="text-base text-slate-700 leading-relaxed mt-6 font-normal">
                To exercise these rights, please contact us at the email address provided in the "Contact Us" section below.
              </p>
            </section>

            {/* Cookies and Tracking Technologies */}
            <section className="mb-12">
              <h2 className="text-2xl font-bold text-slate-900 mb-6 mt-10">7. Cookies and Tracking Technologies</h2>
              <p className="text-base text-slate-700 leading-relaxed mb-6 font-normal">
                We use cookies and similar tracking technologies to enhance your experience:
              </p>
              <ul className="list-disc pl-6 space-y-3 text-base text-slate-700 leading-relaxed">
                <li><strong>Essential Cookies:</strong> Required for the platform to function properly (authentication, session management).</li>
                <li><strong>Analytics Cookies:</strong> Help us understand how users interact with our platform to improve our services.</li>
                <li><strong>Preference Cookies:</strong> Remember your settings and preferences (theme, language, etc.).</li>
              </ul>
              <p className="text-base text-slate-700 leading-relaxed mt-6 font-normal">
                You can control cookies through your browser settings. However, disabling certain cookies may affect the functionality of our platform.
              </p>
            </section>

            {/* Children's Privacy */}
            <section className="mb-12">
              <h2 className="text-2xl font-bold text-slate-900 mb-6 mt-10">8. Children's Privacy</h2>
              <p className="text-base text-slate-700 leading-relaxed font-normal">
                Our services are not intended for individuals under the age of 18. We do not knowingly collect personal information from children. If you believe we have inadvertently collected information from a child, please contact us immediately, and we will take steps to delete such information.
              </p>
            </section>

            {/* International Data Transfers */}
            <section className="mb-12">
              <h2 className="text-2xl font-bold text-slate-900 mb-6 mt-10">9. International Data Transfers</h2>
              <p className="text-base text-slate-700 leading-relaxed font-normal">
                Your information may be transferred to and processed in countries other than your country of residence. These countries may have data protection laws that differ from those in your country. By using our services, you consent to the transfer of your information to these countries. We take appropriate safeguards to ensure your information receives adequate protection.
              </p>
            </section>

            {/* Changes to This Privacy Policy */}
            <section className="mb-12">
              <h2 className="text-2xl font-bold text-slate-900 mb-6 mt-10">10. Changes to This Privacy Policy</h2>
              <p className="text-base text-slate-700 leading-relaxed font-normal">
                We may update this Privacy Policy from time to time to reflect changes in our practices, technology, legal requirements, or other factors. We will notify you of any material changes by posting the new Privacy Policy on this page and updating the "Last Updated" date. We encourage you to review this Privacy Policy periodically to stay informed about how we protect your information.
              </p>
            </section>

            {/* Contact Us */}
            <section className="mb-12">
              <h2 className="text-2xl font-bold text-slate-900 mb-6 mt-10">11. Contact Us</h2>
              <p className="text-base text-slate-700 leading-relaxed mb-6 font-normal">
                If you have any questions, concerns, or requests regarding this Privacy Policy or our data practices, please contact us:
              </p>
              <div className="bg-slate-50 border-l-4 border-slate-300 p-6 rounded-r-lg">
                <p className="text-base text-slate-900 font-semibold mb-3">Zol Studio AI</p>
                <p className="text-base text-slate-700">
                  Email: <a href="mailto:privacy@zolaai.com" className="text-sky-600 hover:text-sky-700 hover:underline font-medium">privacy@zolaai.com</a>
                </p>
                <p className="text-base text-slate-700 mt-2">
                  Website: <a href="https://zolaai.com" className="text-sky-600 hover:text-sky-700 hover:underline font-medium">https://zolaai.com</a>
                </p>
              </div>
            </section>

            {/* GDPR and CCPA Compliance */}
            <section className="mb-12">
              <h2 className="text-2xl font-bold text-slate-900 mb-6 mt-10">12. GDPR and CCPA Compliance</h2>
              
              <h3 className="text-xl font-semibold text-slate-900 mb-4 mt-8">12.1 GDPR (European Users)</h3>
              <p className="text-base text-slate-700 leading-relaxed mb-6 font-normal">
                If you are located in the European Economic Area (EEA), you have additional rights under the General Data Protection Regulation (GDPR):
              </p>
              <ul className="list-disc pl-6 space-y-3 text-base text-slate-700 leading-relaxed">
                <li>Right to access, rectify, or erase your personal data</li>
                <li>Right to restrict or object to processing</li>
                <li>Right to data portability</li>
                <li>Right to withdraw consent at any time</li>
                <li>Right to lodge a complaint with a supervisory authority</li>
              </ul>

              <h3 className="text-xl font-semibold text-slate-900 mb-4 mt-8">12.2 CCPA (California Users)</h3>
              <p className="text-base text-slate-700 leading-relaxed mb-6 font-normal">
                If you are a California resident, you have rights under the California Consumer Privacy Act (CCPA):
              </p>
              <ul className="list-disc pl-6 space-y-3 text-base text-slate-700 leading-relaxed">
                <li>Right to know what personal information is collected, used, shared, or sold</li>
                <li>Right to delete personal information</li>
                <li>Right to opt-out of the sale of personal information (we do not sell personal information)</li>
                <li>Right to non-discrimination for exercising your privacy rights</li>
              </ul>
            </section>

            {/* Commercial License and Generated Content */}
            <section className="mb-12">
              <h2 className="text-2xl font-bold text-slate-900 mb-6 mt-10">13. Commercial License and Generated Content</h2>
              <p className="text-base text-slate-700 leading-relaxed mb-6 font-normal">
                All content generated using Zol Studio AI is provided with a commercial license, allowing you to use generated assets for commercial purposes. However:
              </p>
              <ul className="list-disc pl-6 space-y-3 text-base text-slate-700 leading-relaxed">
                <li>You retain ownership of your uploaded source images</li>
                <li>Generated content is licensed for your commercial use</li>
                <li>We do not claim ownership of your generated content</li>
                <li>You are responsible for ensuring generated content complies with applicable laws and regulations</li>
                <li>You may not use generated content in ways that violate our Terms of Service</li>
              </ul>
            </section>

          </div>
        </div>

      </div>

      {/* Professional Footer */}
      <footer className="relative z-10 bg-[#F5F7FA] w-full mt-20">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-10 py-12">
          <div className="flex flex-col md:flex-row justify-between items-start gap-8 md:gap-20 mb-10">
            {/* Left Side - Branding */}
            <div className="flex flex-col">
              <button 
                onClick={() => navigate(PATHS.LANDING)}
                className="flex items-center mb-3 group w-fit"
              >
                <img src="/logo.png" alt="Zol Studio AI" className="h-10 w-10 mr-3 object-contain group-hover:opacity-90 transition-opacity" />
                <span className="text-lg font-bold text-slate-900">Zol Studio AI</span>
              </button>
              <p className="text-slate-600 text-sm leading-relaxed max-w-xs mt-1">
                AI-powered creative platform for fashion & design
              </p>
            </div>

            {/* Right Side - Links */}
            <div className="flex flex-row gap-12 md:gap-16">
              {/* Column 1 */}
              <div className="flex flex-col space-y-2.5">
                <a
                  href="/pricing"
                  className="text-slate-700 hover:text-sky-600 text-sm transition-colors text-left font-medium"
                >
                  Pricing
                </a>
                <a
                  href="/contact"
                  className="text-slate-700 hover:text-sky-600 text-sm transition-colors text-left font-medium"
                >
                  Contact
                </a>
              </div>

              {/* Column 2 */}
              <div className="flex flex-col space-y-2.5">
                <button 
                  onClick={() => navigate(PATHS.PRIVACY_POLICY)}
                  className="text-slate-700 hover:text-sky-600 text-sm transition-colors text-left font-medium"
                >
                  Privacy Policy
                </button>
                <button 
                  onClick={() => navigate(PATHS.TERMS_AND_CONDITIONS)}
                  className="text-slate-700 hover:text-sky-600 text-sm transition-colors text-left font-medium"
                >
                  Terms of Service
                </button>
              </div>
            </div>
          </div>

          {/* Copyright */}
          <div className="pt-8 border-t border-slate-300/60">
            <p className="text-center text-sm text-slate-500">
              &copy; {new Date().getFullYear()} Zol Studio AI. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default PrivacyPolicyPage;

