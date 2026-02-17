import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PATHS } from '../constants/paths';
import { supabase } from '../services/supabase';

const ContactPage: React.FC = () => {
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [openFAQ, setOpenFAQ] = useState<number | null>(null);

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

  const scrollToFAQ = () => {
    const faqSection = document.getElementById('faq-section');
    if (faqSection) {
      faqSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const toggleFAQ = (index: number) => {
    setOpenFAQ(openFAQ === index ? null : index);
  };

  const faqData = [
    {
      question: "How quickly can I expect a response to my inquiry?",
      answer: "We typically respond to all inquiries within 1-3 business days. For urgent matters related to your account or billing, please mention 'Urgent' in your email subject line, and we'll prioritize your request. Our support team is committed to providing timely and helpful assistance."
    },
    {
      question: "What information should I include when reporting a technical issue?",
      answer: "When reporting a technical issue, please include: (1) A clear description of the problem you're experiencing, (2) Steps to reproduce the issue, (3) Screenshots or error messages if applicable, (4) Your browser and device information, (5) Your account email address. This information helps us diagnose and resolve issues more quickly."
    },
    {
      question: "Can I request new features or improvements to Zol Studio AI?",
      answer: "Absolutely! We value your feedback and suggestions. Please email us at hello@zolstudio.com with your feature requests or improvement ideas. Our product team regularly reviews user feedback and considers the most requested features for future updates. We're constantly working to enhance the platform based on user needs."
    },
    {
      question: "How do I get help with billing or subscription questions?",
      answer: "For billing or subscription-related questions, please email hello@zolstudio.com with 'Billing' in the subject line. Include your account email and specific question. Our billing team can help with subscription changes, payment issues, credit allocation, plan upgrades/downgrades, and refund requests (within our refund policy)."
    },
    {
      question: "What file formats and sizes are supported for image uploads?",
      answer: "Zol Studio AI supports common image formats including JPG, PNG, and WebP. For best results, we recommend images with a minimum resolution of 1024x1024 pixels. Maximum file size is 10MB per image. Supported formats work across all features including Virtual Photoshoot, Asset Generator, Catalog Forged, Style|Scene, and AI Pose Mimic."
    },
    {
      question: "How does the credit system work and what counts as a generation?",
      answer: "Each AI generation (using any of our 5 core features) consumes one credit. Credits are allocated monthly based on your subscription plan and reset at the beginning of each billing cycle. Unused credits do not roll over unless you're on a plan that includes rollover. You can check your credit usage in your dashboard's Usage Analytics section."
    }
  ];

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
            <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-2 tracking-tight">Get in Touch</h1>
            <p className="text-base text-slate-600 font-normal leading-relaxed max-w-3xl">
              We recommend checking out the{' '}
              <button
                onClick={scrollToFAQ}
                className="text-sky-600 hover:text-sky-700 hover:underline font-semibold cursor-pointer"
              >
                FAQ
              </button>
              , which has a ton of useful information. If you need to reach us directly, you can email us at the address below.
            </p>
          </div>

          {/* Email Us Card - Centered */}
          <div className="flex justify-center mb-16">
            <div className="bg-gray-50 border-2 border-gray-200 rounded-xl p-8 shadow-sm max-w-md w-full">
              <div className="flex items-center justify-center mb-4">
                <div className="w-16 h-16 bg-sky-500 rounded-full flex items-center justify-center">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
              </div>
              <h2 className="text-2xl font-bold text-slate-900 text-center mb-4">
                Email Us
              </h2>
              <p className="text-slate-700 text-center mb-6 leading-relaxed">
                Send us an email and we'll get back to you as soon as possible.
              </p>
              <div className="flex items-center justify-center mb-4">
                <svg className="w-5 h-5 text-sky-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <a
                  href="mailto:hello@zolstudio.com"
                  className="text-xl font-semibold text-sky-600 hover:text-sky-700 hover:underline transition-colors"
                >
                  hello@zolstudio.com
                </a>
              </div>
              <p className="text-sm text-slate-600 text-center">
                We typically respond within 1-3 business days.
              </p>
            </div>
          </div>

          {/* FAQ Section */}
          <div id="faq-section" className="mt-20">
            <div className="text-center mb-12">
              <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
                Frequently Asked Questions
              </h2>
              <p className="text-base text-slate-600 max-w-2xl mx-auto">
                Find quick answers to common questions about contacting our support team and getting help with Zol Studio AI.
              </p>
            </div>

            <div className="space-y-4">
              {faqData.map((faq, index) => (
                <div
                  key={index}
                  className="bg-gray-50 border border-gray-200 rounded-lg overflow-hidden transition-all hover:border-gray-300"
                >
                  <button
                    onClick={() => toggleFAQ(index)}
                    className="w-full px-6 py-5 flex items-center justify-between text-left focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-inset"
                  >
                    <span className="text-base font-semibold text-slate-900 pr-4">
                      {faq.question}
                    </span>
                    <svg
                      className={`w-5 h-5 text-slate-500 flex-shrink-0 transition-transform ${
                        openFAQ === index ? 'rotate-180' : ''
                      }`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  {openFAQ === index && (
                    <div className="px-6 pb-5">
                      <div className="pt-2 border-t border-gray-200">
                        <p className="text-sm text-slate-700 leading-relaxed mt-4">
                          {faq.answer}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
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
                <a
                  href="/privacy-policy"
                  className="text-slate-700 hover:text-sky-600 text-sm transition-colors text-left font-medium"
                >
                  Privacy Policy
                </a>
                <a
                  href="/terms-and-conditions"
                  className="text-slate-700 hover:text-sky-600 text-sm transition-colors text-left font-medium"
                >
                  Terms of Service
                </a>
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

export default ContactPage;
