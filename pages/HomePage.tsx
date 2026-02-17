import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { User } from '../types';
import { VirtualPhotoshootIcon, AssetGeneratorIcon, ProductForgeIcon, StyleSceneIcon, PoseMimicIcon, ArrowRightIcon } from '../components/icons';
import { CreativeCarousel3D } from '../components/CreativeCarousel3D';
import { PATHS } from '../constants/paths';

interface HomePageProps {
  user: User;
}

const FeatureCard: React.FC<{
  icon: React.ReactElement;
  title: string;
  subtitle: string;
  description: string;
  onClick: () => void;
  className?: string;
}> = ({ icon, title, subtitle, description, onClick, className = '' }) => (
  <div 
    onClick={onClick}
    className={`group relative flex flex-col bg-white dark:bg-gray-800/90 rounded-2xl p-8 sm:p-9 transition-all duration-500 cursor-pointer border border-gray-200/80 dark:border-gray-700/50 shadow-md hover:shadow-xl hover:shadow-sky-500/15 hover:-translate-y-2 hover:border-sky-300/50 dark:hover:border-sky-600/50 overflow-hidden h-full ${className}`}
  >
    {/* Animated gradient background on hover */}
    <div className="absolute inset-0 bg-gradient-to-br from-sky-50/0 via-blue-50/0 to-cyan-50/0 dark:from-sky-900/0 dark:via-blue-900/0 dark:to-cyan-900/0 group-hover:from-sky-50/50 group-hover:via-blue-50/30 group-hover:to-cyan-50/20 dark:group-hover:from-sky-900/20 dark:group-hover:via-blue-900/10 dark:group-hover:to-cyan-900/10 transition-all duration-700 pointer-events-none" />
    
    {/* Subtle glow effect */}
    <div className="absolute -top-24 -right-24 w-48 h-48 bg-sky-400/0 group-hover:bg-sky-400/5 rounded-full blur-3xl transition-all duration-700 group-hover:scale-150 pointer-events-none" />
    <div className="absolute -bottom-16 -left-16 w-40 h-40 bg-blue-400/0 group-hover:bg-blue-400/5 rounded-full blur-2xl transition-all duration-700 group-hover:scale-125 pointer-events-none" />
    
    <div className="relative z-10 flex flex-col h-full">
      {/* Badge */}
      {subtitle && (
        <div className="mb-4">
          <span className="inline-flex items-center px-3 py-1 rounded-full bg-gradient-to-r from-sky-50 to-blue-50 dark:from-sky-900/30 dark:to-blue-900/30 text-[10px] font-semibold tracking-[0.1em] text-sky-700 dark:text-sky-300 uppercase border border-sky-200/50 dark:border-sky-700/50 group-hover:from-sky-100 group-hover:to-blue-100 dark:group-hover:from-sky-800/50 dark:group-hover:to-blue-800/50 group-hover:border-sky-300 dark:group-hover:border-sky-600 transition-all duration-300">
            {subtitle}
          </span>
        </div>
      )}

      {/* Icon Container */}
      <div className="mb-5 flex items-start">
        <div className="relative">
          <div className="absolute inset-0 bg-sky-500/10 dark:bg-sky-400/10 rounded-xl blur-md group-hover:bg-sky-500/20 dark:group-hover:bg-sky-400/20 transition-all duration-500 scale-0 group-hover:scale-100" />
          <div className="relative inline-flex items-center justify-center w-14 h-14 rounded-xl bg-gradient-to-br from-sky-50 to-blue-50 dark:from-gray-700 dark:to-gray-800 text-sky-600 dark:text-sky-400 border border-sky-100/50 dark:border-gray-600/50 shadow-sm group-hover:shadow-md group-hover:scale-110 group-hover:from-sky-100 group-hover:to-blue-100 dark:group-hover:from-sky-800/50 dark:group-hover:to-blue-800/50 group-hover:border-sky-200 dark:group-hover:border-sky-600 transition-all duration-500 ease-out">
            <div className="transform group-hover:scale-110 transition-transform duration-500">
              {icon}
            </div>
          </div>
        </div>
      </div>

      {/* Title */}
      <h3 className="text-title font-semibold text-gray-900 dark:text-white mb-3 leading-tight group-hover:text-sky-600 dark:group-hover:text-sky-400 transition-colors duration-300">
        {title}
      </h3>

      {/* Description */}
      <p className="text-[15px] text-gray-600 dark:text-gray-400 leading-relaxed mb-6 flex-grow group-hover:text-gray-700 dark:group-hover:text-gray-300 transition-colors duration-300">
        {description}
      </p>

      {/* CTA Button */}
      <div className="mt-auto pt-4 border-t border-gray-100 dark:border-gray-700/50 group-hover:border-sky-200 dark:group-hover:border-sky-700/50 transition-colors duration-300">
        <div className="flex items-center justify-between">
          <span className="text-base font-semibold text-gray-700 dark:text-gray-300 group-hover:text-sky-600 dark:group-hover:text-sky-400 transition-colors duration-300">
            Get Started
          </span>
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gray-100 dark:bg-gray-700/50 group-hover:bg-sky-500 dark:group-hover:bg-sky-600 group-hover:text-white shadow-sm group-hover:shadow-md transition-all duration-300 group-hover:translate-x-1 group-hover:scale-110">
            <ArrowRightIcon className="w-4 h-4 text-gray-600 dark:text-gray-400 group-hover:text-white transition-colors duration-300" />
          </div>
        </div>
      </div>
    </div>
  </div>
);

const HomePage: React.FC<HomePageProps> = ({ user }) => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);

  // Handle payment redirects
  useEffect(() => {
    const paymentStatus = searchParams.get('payment');
    if (paymentStatus === 'success') {
      setShowSuccessMessage(true);
      // Auto-hide after 8 seconds
      setTimeout(() => setShowSuccessMessage(false), 8000);
      // Clean URL
      window.history.replaceState({}, '', window.location.pathname);
    } else if (paymentStatus === 'canceled') {
      // Could show cancel message if needed
    }
  }, [searchParams]);

  return (
      <div className="min-h-screen p-4 sm:p-6 lg:p-8 bg-gradient-to-b from-sky-50 via-white to-white dark:from-gray-900 dark:via-gray-900 dark:to-gray-900 transition-colors duration-200">
        <div className="max-w-7xl mx-auto">
          {/* Payment Success Notification */}
          {showSuccessMessage && (
            <div className="mb-6 p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-2 border-green-500 dark:border-green-400 rounded-xl shadow-lg animate-fade-in">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0">
                  <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h3 className="text-green-800 dark:text-green-200 font-bold text-lg mb-1">
                    Payment Successful! 🎉
                  </h3>
                  <p className="text-green-700 dark:text-green-300 text-sm">
                    Your Basic plan subscription is now active. Check your{' '}
                    <button
                      onClick={() => navigate(PATHS.PROFILE)}
                      className="font-semibold underline hover:text-green-900 dark:hover:text-green-100"
                    >
                      profile page
                    </button>
                    {' '}to see subscription details.
                  </p>
                </div>
                <button
                  onClick={() => setShowSuccessMessage(false)}
                  className="flex-shrink-0 text-green-600 dark:text-green-400 hover:text-green-800 dark:hover:text-green-200"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
          )}
          
          <main>
            <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="px-3 py-1 rounded-full bg-sky-50 text-sky-700 text-xs font-bold uppercase tracking-wider border border-sky-100">
                    New AI Models Available
                  </span>
                </div>
                <h2 className="text-hero font-bold text-slate-900 dark:text-white tracking-tight mb-4">
                  Creative Studio
                </h2>
                <p className="text-subtitle text-slate-600 dark:text-gray-400 max-w-2xl leading-relaxed font-normal">
                  Disrupting e-commerce product photography with automated visual asset creation. 
                  Select a tool below to start generating 4K assets.
                </p>
              </div>
            </div>

            {/* 3D Carousel (between Creative Studio and the 4 features) */}
            <div className="w-full max-w-7xl mx-auto h-[550px] relative mb-16 -mt-8">
              <CreativeCarousel3D
                className="w-full h-full"
                config={{
                  // Spec values (reference)
                  itemWidth: 280,
                  itemHeight: 380,
                  radius: 420,
                  rotationSpeed: 35,
                  isPaused: false,
                  perspectivePx: 1500,
                }}
              />
              {/* Fading gradient at bottom of carousel to blend with page (like reference) */}
              <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-slate-50 to-transparent dark:from-gray-900 pointer-events-none" />
            </div>

            {/* 3+2 layout: 3 cards top row, 2 cards centered bottom row */}
            <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-10 max-w-7xl mx-auto">
              <FeatureCard
                icon={<VirtualPhotoshootIcon />}
                title="Virtual Photoshoot"
                subtitle="SEAMLESS SWAP"
                description="Swap any product onto your model with 100% facial preservation and cinematic realism."
                onClick={() => navigate(PATHS.VIRTUAL_PHOTOSHOOT)}
              />
              <FeatureCard
                icon={<StyleSceneIcon />}
                title="Style|Scene Campaigner"
                subtitle="AI LIFESTYLE DIRECTOR"
                description="Generate an entire lifestyle campaign. Choose a model and a scene instantly."
                onClick={() => navigate(PATHS.STYLE_SCENE)}
              />
              <FeatureCard
                icon={<AssetGeneratorIcon />}
                title="E-commerce Asset Gen"
                subtitle="CORE EXTRACTION"
                description="Turn lifestyle shots into ghost mannequin assets, including apparel and accessories."
                onClick={() => navigate(PATHS.ASSET_GENERATOR)}
              />
              <FeatureCard
                icon={<ProductForgeIcon />}
                title="Perfect Product Forge"
                subtitle="CATALOG | FORGED"
                description="Eliminate wrinkles, correct shape, and generate 4K hyper-realistic studio shots."
                onClick={() => navigate(PATHS.CATALOG_FORGED)}
                className="lg:col-start-2 lg:row-start-2"
              />
              <FeatureCard
                icon={<PoseMimicIcon />}
                title="AI Pose Mimic"
                subtitle="POSE TRANSFER"
                description="Transfer any pose to your model instantly with perfect identity preservation."
                onClick={() => navigate(PATHS.POSE_MIMIC)}
                className="lg:row-start-2"
              />
            </div>
          </main>
          
          <footer className="text-center mt-16 text-gray-400 text-sm">
            <p>&copy; {new Date().getFullYear()} Zol Studio. All rights reserved.</p>
            <button 
              onClick={() => navigate(PATHS.ABOUT)}
              className="mt-2 text-gray-500 dark:text-gray-400 hover:text-sky-600 dark:hover:text-sky-400 font-semibold transition-colors"
            >
              About Zol Studio
            </button>
          </footer>
        </div>
      </div>
  );
};

export default HomePage;
