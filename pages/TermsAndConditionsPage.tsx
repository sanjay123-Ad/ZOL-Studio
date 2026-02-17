import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PATHS } from '../constants/paths';
import { supabase } from '../services/supabase';

const TermsAndConditionsPage: React.FC = () => {
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
            <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-2 tracking-tight">Terms & Conditions</h1>
            <p className="text-sm text-slate-600 font-normal">
              Updated at {new Date().toLocaleDateString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit' })}
            </p>
          </div>

          <div className="max-w-none">
            
            {/* Introduction */}
            <section className="mb-12">
              <p className="text-base text-slate-700 leading-relaxed mb-6 font-normal">
                Welcome to Zol Studio AI ("we," "our," or "us"). These Terms and Conditions ("Terms") govern your access to and use of our AI-powered fashion e-commerce platform, including our website, services, and applications (collectively, the "Service").
              </p>
              <p className="text-base text-slate-700 leading-relaxed font-normal">
                By accessing or using Zol Studio AI, you agree to be bound by these Terms. If you do not agree to these Terms, please do not use our Service.
              </p>
            </section>

            {/* Acceptance of Terms */}
            <section className="mb-12">
              <h2 className="text-2xl font-bold text-slate-900 mb-6 mt-10">1. Acceptance of Terms</h2>
              <p className="text-base text-slate-700 leading-relaxed mb-4 font-normal">
                By accessing and placing an order with Zol Studio AI, you confirm that you are in agreement with and bound by the terms of service contained in the Terms & Conditions outlined below. These terms apply to the entire website and any email or other type of communication between you and Zol Studio AI.
              </p>
              <p className="text-base text-slate-700 leading-relaxed font-normal">
                Under no circumstances shall Zol Studio AI team be liable for any direct, indirect, special, incidental or consequential damages, including, but not limited to, loss of data or profit, arising out of the use, or the inability to use, the materials on this site, even if Zol Studio AI team or an authorized representative has been advised of the possibility of such damages.
              </p>
            </section>

            {/* Definitions and Key Terms */}
            <section className="mb-12">
              <h2 className="text-2xl font-bold text-slate-900 mb-6 mt-10">2. Definitions and Key Terms</h2>
              <p className="text-base text-slate-700 leading-relaxed mb-6 font-normal">
                To help explain things as clearly as possible in these Terms, whenever any of these terms are referenced, they are strictly defined as:
              </p>
              <ul className="list-disc pl-6 space-y-3 text-base text-slate-700 leading-relaxed">
                <li><strong>Cookie:</strong> Small amount of data generated by a website and saved by your web browser. It is used to identify your browser, provide analytics, remember information about you such as your language preference or login information.</li>
                <li><strong>Company:</strong> When these Terms mention "Company," "we," "us," or "our," it refers to Zol Studio AI, which is responsible for your information under these Terms.</li>
                <li><strong>Service:</strong> Refers to the service provided by Zol Studio AI as described in the relative terms (if available) and on this platform.</li>
                <li><strong>Website:</strong> Zol Studio AI's site, which can be accessed via this URL: https://zolaai.com</li>
                <li><strong>You:</strong> A person or entity that is registered with Zol Studio AI to use the Service.</li>
                <li><strong>Account:</strong> A unique account created for you to access our Service or parts of our Service.</li>
                <li><strong>Subscription:</strong> A paid plan that provides access to our Service with specific features and credit allocations.</li>
                <li><strong>Credits:</strong> Units of usage that allow you to generate AI-powered visual content using our Service.</li>
                <li><strong>Generated Content:</strong> Any images, assets, or visual content created using our AI-powered tools and services.</li>
              </ul>
            </section>

            {/* Use License */}
            <section className="mb-12">
              <h2 className="text-2xl font-bold text-slate-900 mb-6 mt-10">3. Use License</h2>
              <p className="text-base text-slate-700 leading-relaxed mb-6 font-normal">
                Permission is granted to temporarily access the materials on Zol Studio AI's website for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title, and under this license you may not:
              </p>
              <ul className="list-disc pl-6 space-y-3 text-base text-slate-700 leading-relaxed">
                <li>Modify or copy the materials</li>
                <li>Use the materials for any commercial purpose or for any public display (commercial or non-commercial)</li>
                <li>Attempt to reverse engineer any software contained on Zol Studio AI's website</li>
                <li>Remove any copyright or other proprietary notations from the materials</li>
                <li>Transfer the materials to another person or "mirror" the materials on any other server</li>
              </ul>
              <p className="text-base text-slate-700 leading-relaxed mt-6 font-normal">
                This license shall automatically terminate if you violate any of these restrictions and may be terminated by Zol Studio AI at any time. Upon terminating your viewing of these materials or upon the termination of this license, you must destroy any downloaded materials in your possession whether in electronic or printed format.
              </p>
            </section>

            {/* Account Registration and Security */}
            <section className="mb-12">
              <h2 className="text-2xl font-bold text-slate-900 mb-6 mt-10">4. Account Registration and Security</h2>
              <p className="text-base text-slate-700 leading-relaxed mb-6 font-normal">
                To access certain features of our Service, you must register for an account. When you register, you agree to:
              </p>
              <ul className="list-disc pl-6 space-y-3 text-base text-slate-700 leading-relaxed">
                <li>Provide accurate, current, and complete information during registration</li>
                <li>Maintain and promptly update your account information to keep it accurate, current, and complete</li>
                <li>Maintain the security of your password and identification</li>
                <li>Accept all responsibility for any and all activities that occur under your account</li>
                <li>Notify us immediately of any unauthorized use of your account or any other breach of security</li>
                <li>Not share your account credentials with any third party</li>
              </ul>
              <p className="text-base text-slate-700 leading-relaxed mt-6 font-normal">
                We reserve the right to refuse service, terminate accounts, remove or edit content, or cancel orders at our sole discretion.
              </p>
            </section>

            {/* Subscription and Payment Terms */}
            <section className="mb-12">
              <h2 className="text-2xl font-bold text-slate-900 mb-6 mt-10">5. Subscription and Payment Terms</h2>
              
              <h3 className="text-xl font-semibold text-slate-900 mb-4 mt-8">5.1 Subscription Plans</h3>
              <p className="text-base text-slate-700 leading-relaxed mb-6 font-normal">
                Zol Studio AI offers various subscription plans with different features and credit allocations. Subscription fees are billed in advance on a monthly or annual basis, as selected by you.
              </p>

              <h3 className="text-xl font-semibold text-slate-900 mb-4 mt-8">5.2 Payment</h3>
              <p className="text-base text-slate-700 leading-relaxed mb-6 font-normal">
                You agree to provide current, complete, and accurate purchase and account information for all purchases made through our Service. You agree to promptly update your account and other information, including your email address and credit card numbers and expiration dates, so that we can complete your transactions and contact you as needed.
              </p>
              <p className="text-base text-slate-700 leading-relaxed font-normal">
                All payments are processed through our third-party payment processor (Lemon Squeezy). By making a purchase, you agree to be bound by the payment processor's terms and conditions.
              </p>

              <h3 className="text-xl font-semibold text-slate-900 mb-4 mt-8">5.3 Billing and Renewal</h3>
              <ul className="list-disc pl-6 space-y-3 text-base text-slate-700 leading-relaxed">
                <li>Subscriptions automatically renew unless you cancel before the renewal date</li>
                <li>You will be charged the subscription fee at the beginning of each billing cycle</li>
                <li>If payment fails, we may suspend or terminate your account</li>
                <li>Refunds are subject to our refund policy as outlined in Section 8</li>
              </ul>

              <h3 className="text-xl font-semibold text-slate-900 mb-4 mt-8">5.4 Credits and Usage</h3>
              <p className="text-base text-slate-700 leading-relaxed mb-6 font-normal">
                Credits are allocated based on your subscription plan. Unused credits may roll over according to your plan's terms. Credits cannot be transferred, sold, or exchanged for cash. Credits expire according to your subscription plan's terms.
              </p>
            </section>

            {/* Acceptable Use Policy */}
            <section className="mb-12">
              <h2 className="text-2xl font-bold text-slate-900 mb-6 mt-10">6. Acceptable Use Policy</h2>
              <p className="text-base text-slate-700 leading-relaxed mb-6 font-normal">
                You agree not to use the Service:
              </p>
              <ul className="list-disc pl-6 space-y-3 text-base text-slate-700 leading-relaxed">
                <li>For any unlawful purpose or to solicit others to perform unlawful acts</li>
                <li>To violate any international, federal, provincial, or state regulations, rules, laws, or local ordinances</li>
                <li>To infringe upon or violate our intellectual property rights or the intellectual property rights of others</li>
                <li>To harass, abuse, insult, harm, defame, slander, disparage, intimidate, or discriminate</li>
                <li>To submit false or misleading information</li>
                <li>To upload or transmit viruses or any other type of malicious code</li>
                <li>To collect or track the personal information of others</li>
                <li>To spam, phish, pharm, pretext, spider, crawl, or scrape</li>
                <li>For any obscene or immoral purpose</li>
                <li>To interfere with or circumvent the security features of the Service</li>
              </ul>
              <p className="text-base text-slate-700 leading-relaxed mt-6 font-normal">
                We reserve the right to terminate your use of the Service for violating any of the prohibited uses.
              </p>
            </section>

            {/* Intellectual Property Rights */}
            <section className="mb-12">
              <h2 className="text-2xl font-bold text-slate-900 mb-6 mt-10">7. Intellectual Property Rights</h2>
              
              <h3 className="text-xl font-semibold text-slate-900 mb-4 mt-8">7.1 Our Intellectual Property</h3>
              <p className="text-base text-slate-700 leading-relaxed mb-6 font-normal">
                The Service and its original content, features, and functionality are and will remain the exclusive property of Zol Studio AI and its licensors. The Service is protected by copyright, trademark, and other laws. Our trademarks and trade dress may not be used in connection with any product or service without our prior written consent.
              </p>

              <h3 className="text-xl font-semibold text-slate-900 mb-4 mt-8">7.2 Your Content</h3>
              <p className="text-base text-slate-700 leading-relaxed mb-6 font-normal">
                You retain ownership of any content you upload to our Service. By uploading content, you grant us a worldwide, non-exclusive, royalty-free license to use, reproduce, modify, and display such content solely for the purpose of providing and improving our Service.
              </p>

              <h3 className="text-xl font-semibold text-slate-900 mb-4 mt-8">7.3 Generated Content</h3>
              <p className="text-base text-slate-700 leading-relaxed mb-6 font-normal">
                All content generated using Zol Studio AI is provided with a commercial license. You own the rights to use generated content for commercial purposes. However, you may not:
              </p>
              <ul className="list-disc pl-6 space-y-3 text-base text-slate-700 leading-relaxed">
                <li>Resell or redistribute generated content as standalone products</li>
                <li>Use generated content in ways that violate applicable laws or regulations</li>
                <li>Claim that AI-generated content was created by human artists without disclosure</li>
                <li>Use generated content to create competing AI services</li>
              </ul>
            </section>

            {/* Refund Policy */}
            <section className="mb-12">
              <h2 className="text-2xl font-bold text-slate-900 mb-6 mt-10">8. Refund Policy</h2>
              <p className="text-base text-slate-700 leading-relaxed mb-6 font-normal">
                Zol Studio AI offers a 30-day money-back guarantee for first-time subscribers. To be eligible for a refund:
              </p>
              <ul className="list-disc pl-6 space-y-3 text-base text-slate-700 leading-relaxed">
                <li>You must request a refund within 30 days of your initial subscription purchase</li>
                <li>Refund requests must be submitted through our support channels</li>
                <li>Refunds are processed to the original payment method within 5-10 business days</li>
                <li>Refunds are not available for renewals or additional credit purchases</li>
                <li>Once a refund is processed, your account will be downgraded to the free tier</li>
              </ul>
              <p className="text-base text-slate-700 leading-relaxed mt-6 font-normal">
                We reserve the right to refuse refunds in cases of abuse, fraud, or violation of these Terms.
              </p>
            </section>

            {/* Service Availability and Modifications */}
            <section className="mb-12">
              <h2 className="text-2xl font-bold text-slate-900 mb-6 mt-10">9. Service Availability and Modifications</h2>
              <p className="text-base text-slate-700 leading-relaxed mb-6 font-normal">
                We reserve the right to withdraw or amend our Service, and any service or material we provide via the Service, in our sole discretion without notice. We will not be liable if, for any reason, all or any part of the Service is unavailable at any time or for any period.
              </p>
              <p className="text-base text-slate-700 leading-relaxed mb-6 font-normal">
                We may update the content on our Service from time to time, but its content is not necessarily complete or up-to-date. Any of the material on the Service may be out of date at any given time, and we are under no obligation to update such material.
              </p>
              <p className="text-base text-slate-700 leading-relaxed font-normal">
                We reserve the right to modify, suspend, or discontinue any part of the Service at any time, with or without notice, for any reason.
              </p>
            </section>

            {/* Limitation of Liability */}
            <section className="mb-12">
              <h2 className="text-2xl font-bold text-slate-900 mb-6 mt-10">10. Limitation of Liability</h2>
              <p className="text-base text-slate-700 leading-relaxed mb-6 font-normal">
                In no event shall Zol Studio AI, nor its directors, employees, partners, agents, suppliers, or affiliates, be liable for any indirect, incidental, special, consequential, or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from:
              </p>
              <ul className="list-disc pl-6 space-y-3 text-base text-slate-700 leading-relaxed">
                <li>Your access to or use of or inability to access or use the Service</li>
                <li>Any conduct or content of third parties on the Service</li>
                <li>Any content obtained from the Service</li>
                <li>Unauthorized access, use, or alteration of your transmissions or content</li>
              </ul>
              <p className="text-base text-slate-700 leading-relaxed mt-6 font-normal">
                Our total liability to you for all claims arising from or related to the use of our Service is limited to the amount you paid us in the twelve (12) months prior to the action giving rise to liability, or one hundred dollars ($100), whichever is greater.
              </p>
            </section>

            {/* Indemnification */}
            <section className="mb-12">
              <h2 className="text-2xl font-bold text-slate-900 mb-6 mt-10">11. Indemnification</h2>
              <p className="text-base text-slate-700 leading-relaxed mb-6 font-normal">
                You agree to defend, indemnify, and hold harmless Zol Studio AI and its licensee and licensors, and their employees, contractors, agents, officers and directors, from and against any and all claims, damages, obligations, losses, liabilities, costs or debt, and expenses (including but not limited to attorney's fees), resulting from or arising out of:
              </p>
              <ul className="list-disc pl-6 space-y-3 text-base text-slate-700 leading-relaxed">
                <li>Your use and access of the Service</li>
                <li>Your violation of any term of these Terms</li>
                <li>Your violation of any third party right, including without limitation any copyright, property, or privacy right</li>
                <li>Any claim that your content caused damage to a third party</li>
              </ul>
            </section>

            {/* Termination */}
            <section className="mb-12">
              <h2 className="text-2xl font-bold text-slate-900 mb-6 mt-10">12. Termination</h2>
              <p className="text-base text-slate-700 leading-relaxed mb-6 font-normal">
                We may terminate or suspend your account and bar access to the Service immediately, without prior notice or liability, under our sole discretion, for any reason whatsoever and without limitation, including but not limited to a breach of the Terms.
              </p>
              <p className="text-base text-slate-700 leading-relaxed mb-6 font-normal">
                If you wish to terminate your account, you may simply discontinue using the Service or cancel your subscription through your account settings.
              </p>
              <p className="text-base text-slate-700 leading-relaxed font-normal">
                All provisions of the Terms which by their nature should survive termination shall survive termination, including, without limitation, ownership provisions, warranty disclaimers, indemnity, and limitations of liability.
              </p>
            </section>

            {/* Governing Law */}
            <section className="mb-12">
              <h2 className="text-2xl font-bold text-slate-900 mb-6 mt-10">13. Governing Law</h2>
              <p className="text-base text-slate-700 leading-relaxed font-normal">
                These Terms shall be interpreted and governed by the laws of the jurisdiction in which Zol Studio AI operates, without regard to its conflict of law provisions. Our failure to enforce any right or provision of these Terms will not be considered a waiver of those rights.
              </p>
            </section>

            {/* Changes to Terms */}
            <section className="mb-12">
              <h2 className="text-2xl font-bold text-slate-900 mb-6 mt-10">14. Changes to Terms</h2>
              <p className="text-base text-slate-700 leading-relaxed font-normal">
                We reserve the right, at our sole discretion, to modify or replace these Terms at any time. If a revision is material, we will provide at least 30 days notice prior to any new terms taking effect. What constitutes a material change will be determined at our sole discretion.
              </p>
              <p className="text-base text-slate-700 leading-relaxed mt-6 font-normal">
                By continuing to access or use our Service after any revisions become effective, you agree to be bound by the revised terms. If you do not agree to the new terms, you are no longer authorized to use the Service.
              </p>
            </section>

            {/* Contact Information */}
            <section className="mb-12">
              <h2 className="text-2xl font-bold text-slate-900 mb-6 mt-10">15. Contact Information</h2>
              <p className="text-base text-slate-700 leading-relaxed mb-6 font-normal">
                If you have any questions about these Terms & Conditions, please contact us:
              </p>
              <div className="bg-slate-50 border-l-4 border-slate-300 p-6 rounded-r-lg">
                <p className="text-base text-slate-900 font-semibold mb-3">Zol Studio AI</p>
                <p className="text-base text-slate-700">
                  Email: <a href="mailto:support@zolaai.com" className="text-sky-600 hover:text-sky-700 hover:underline font-medium">support@zolaai.com</a>
                </p>
                <p className="text-base text-slate-700 mt-2">
                  Website: <a href="https://zolaai.com" className="text-sky-600 hover:text-sky-700 hover:underline font-medium">https://zolaai.com</a>
                </p>
              </div>
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

export default TermsAndConditionsPage;

