import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PATHS } from '../constants/paths';

const Header: React.FC<{ onLogoClick?: () => void; onStart: () => void }> = ({ onLogoClick, onStart }) => {
  const [scrolled, setScrolled] = useState(false);
  const [isFeaturesOpen, setIsFeaturesOpen] = useState(false);
  const featuresRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (featuresRef.current && !featuresRef.current.contains(event.target as Node)) {
        setIsFeaturesOpen(false);
      }
    };

    if (isFeaturesOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isFeaturesOpen]);

  const features = [
    {
      title: 'Virtual Photoshoot',
      description: 'Swap any garment onto models with perfect identity preservation and 4K quality',
    },
    {
      title: 'Asset Generator',
      description: 'Extract garments from lifestyle photos into professional ghost mannequin images',
    },
    {
      title: 'Product Forge',
      description: 'Transform phone snapshots into 4K studio-quality catalog images',
    },
    {
      title: 'Style|Scene Director',
      description: 'Generate complete lifestyle campaigns from a single garment with multiple poses',
    },
    {
      title: 'AI Pose Mimic',
      description: 'Transfer any pose to your model while maintaining perfect identity preservation',
    },
  ];

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 flex justify-center px-4 sm:px-6 lg:px-8 py-5 pointer-events-none">
        <div
          className={`pointer-events-auto w-full max-w-4xl bg-white rounded-full px-6 pl-8 py-4 shadow-lg shadow-slate-200/50 transition-all duration-300 flex items-center justify-between gap-6 md:gap-10 ${scrolled ? 'shadow-xl shadow-slate-200/60' : ''}`}
        >
          <button onClick={onLogoClick} className="flex items-center focus:outline-none group" aria-label="Go to homepage">
            <img src="/logo.png" alt="Zol Studio AI" className="h-10 w-10 md:h-11 md:w-11 object-contain group-hover:opacity-90 transition-opacity" />
          </button>
          <nav className="hidden md:flex items-center gap-2 relative" ref={featuresRef}>
            <button
              onClick={() => setIsFeaturesOpen(!isFeaturesOpen)}
              className={`px-5 py-2.5 text-[15px] font-medium rounded-full hover:bg-slate-50 transition-colors flex items-center gap-1.5 ${isFeaturesOpen ? 'text-sky-600 bg-sky-50' : 'text-slate-600 hover:text-slate-900'}`}
            >
              Features
              <svg className={`w-4 h-4 transition-transform ${isFeaturesOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            <a href="#" className="px-5 py-2.5 text-[15px] font-medium text-slate-600 hover:text-slate-900 rounded-full hover:bg-slate-50 transition-colors">
              Studio
            </a>
            <a href="#pricing" onClick={(e) => { e.preventDefault(); document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' }); }} className="px-5 py-2.5 text-[15px] font-medium text-slate-600 hover:text-slate-900 rounded-full hover:bg-slate-50 transition-colors">
              Pricing
            </a>
          </nav>
          <div className="flex items-center gap-4">
            <button onClick={onStart} className="hidden md:block px-5 py-2.5 text-[15px] font-medium text-slate-600 hover:text-slate-900 transition-colors">
              Sign In
            </button>
            <button
              onClick={onStart}
              className="relative overflow-hidden bg-gradient-to-r from-sky-500 to-blue-600 text-white px-8 py-3 rounded-full font-semibold text-[15px] shadow-lg shadow-sky-500/25 hover:shadow-sky-500/40 hover:-translate-y-0.5 transition-all flex items-center gap-2"
            >
              <span>Get Started</span>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </button>
          </div>
        </div>
      </header>

      {/* Features Dropdown */}
      {isFeaturesOpen && (
        <div className="fixed top-20 left-0 right-0 z-40 flex justify-center px-4 pointer-events-none">
          <div className="pointer-events-auto bg-white rounded-2xl shadow-xl border border-slate-200/80 max-w-4xl w-full p-6 md:p-8 mt-2 transform transition-all duration-200 ease-out opacity-100 translate-y-0">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              {features.map((feature, index) => (
                <div key={index} className="flex flex-col">
                  <h3 className="text-base font-bold text-slate-900 mb-1.5">{feature.title}</h3>
                  <p className="text-xs text-slate-600 leading-relaxed">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

const heroShowcaseCards = [
  { imageUrl: 'https://i.postimg.cc/HxSv8F52/E1.jpg', title: 'Virtual Photoshoot', tag: 'Style Scene' },
  { imageUrl: 'https://i.postimg.cc/3JypTzwM/Creative-Social-Media-Poster-Design.jpg', title: '4K Catalog Quality', tag: 'Catalog Forge' },
  { imageUrl: 'https://i.postimg.cc/8kYJtwmr/D22.jpg', title: 'Lifestyle Campaigns', tag: 'Style Scene' },
  { imageUrl: 'https://i.postimg.cc/BvNtDCvj/T-shirt.jpg', title: 'Product Perfection', tag: 'Catalog Forge' },
  { imageUrl: 'https://i.postimg.cc/YCzQnY9W/D6.jpg', title: 'AI Pose Transfer', tag: 'Style Scene' },
];

const travelCards = [
  {
    imageUrlBefore: 'https://i.postimg.cc/8PvhL28W/male1.png',
    imageUrlAfter: 'https://i.postimg.cc/zBPnk5Xj/male2.png',
    title: "Men's Collection",
    tag: 'Streetwear',
  },
  {
    imageUrlBefore: 'https://i.postimg.cc/QtNw8DTR/women-image-1.png',
    imageUrlAfter: 'https://i.postimg.cc/FKNnpvDb/women-image-2.png',
    title: "Women’s Collection",
    tag: 'Casual Chic',
  },
] as const;

const ConnectingArrow: React.FC<{ isLeftToRight: boolean; index: number }> = ({ isLeftToRight, index }) => (
  <div className="relative w-full h-24 sm:h-28 py-1">
    {/* Arrow: originates from right edge of left card's image, curves down to top-left of right card */}
    <svg
      className={`absolute h-full w-[22%] min-w-[200px] max-w-[260px] text-sky-500 top-1/2 -translate-y-1/2 ${
        isLeftToRight ? 'left-[39%]' : 'right-[39%] scale-x-[-1]'
      }`}
      viewBox="0 0 240 90"
      fill="none"
      preserveAspectRatio="xMidYMid meet"
      aria-hidden
    >
      <defs>
        <linearGradient id={`arrow-gradient-${index}`} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#38bdf8" />
          <stop offset="100%" stopColor="#0ea5e9" />
        </linearGradient>
        <marker id={`arrowhead-sky-${index}`} markerWidth="16" markerHeight="10" refX="12" refY="5" orient="auto">
          <polygon points="0 0, 16 5, 0 10" fill="#0ea5e9" />
        </marker>
      </defs>
      {/* Broad smooth curve: tail at right (image edge) → arcs down → head at left (next card) */}
      <path
        d="M 200 8 C 200 45 60 50 40 82"
        stroke={`url(#arrow-gradient-${index})`}
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
        markerEnd={`url(#arrowhead-sky-${index})`}
      />
    </svg>
  </div>
);

const PillarWipeAnimation: React.FC<{ imageBefore: string; imageAfter: string; badge: string }> = ({ imageBefore, imageAfter, badge }) => {
  return (
    <div className="relative w-full h-full rounded-[2rem] overflow-hidden bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-sky-50 to-white">
      {/* After image - base layer */}
      <img src={imageAfter} alt="After" className="absolute inset-0 w-full h-full object-contain" draggable="false" />

      {/* Before image - animated wipe layer */}
      <div className="absolute inset-0 w-full h-full animate-clip-loop">
        <img src={imageBefore} alt="Before" className="absolute inset-0 w-full h-full object-contain" draggable="false" />
      </div>

      {/* Badge */}
      <div className="absolute bottom-6 left-6 bg-white/80 backdrop-blur text-xs font-bold text-slate-900 px-4 py-2 rounded-full border border-sky-100 shadow-sm z-30">
        {badge}
      </div>
    </div>
  );
};

const ImageComparisonCard: React.FC<{ card: (typeof travelCards)[number]; className?: string }> = ({ card, className = '' }) => {
  const [sliderPosition, setSliderPosition] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const handleMove = (clientX: number) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
    setSliderPosition((x / rect.width) * 100);
  };

  const handleMouseMove = (e: React.MouseEvent) => handleMove(e.clientX);
  const handleMouseLeave = () => {
    setIsDragging(false);
    setSliderPosition(50);
  };
  const handleTouchStart = () => setIsDragging(true);
  const handleTouchEnd = () => setIsDragging(false);
  const handleTouchMove = (e: React.TouchEvent) => {
    if (isDragging) handleMove(e.touches[0].clientX);
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onTouchMove={handleTouchMove}
      className={`relative aspect-[3/4] w-full rounded-3xl overflow-hidden group cursor-ew-resize border border-white shadow-2xl shadow-sky-200/50 ${className}`}
    >
      <img src={card.imageUrlAfter} alt="After" className="absolute inset-0 w-full h-full object-cover" draggable="false" />
      <div className="absolute top-4 right-4 px-3 py-1 bg-white/80 backdrop-blur-md border border-white/50 rounded-full text-xs font-medium text-slate-900 z-30 shadow-sm">
        {card.tag}
      </div>
      <div className="absolute inset-0 w-full h-full" style={{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }}>
        <img src={card.imageUrlBefore} alt="Before" className="absolute inset-0 w-full h-full object-cover" draggable="false" />
      </div>
      <div className="absolute top-0 bottom-0 w-0.5 bg-white/80 z-20 pointer-events-none" style={{ left: `${sliderPosition}%` }}>
        <div className="absolute top-1/2 left-1/2 -translate-y-1/2 -translate-x-1/2 w-8 h-8 bg-white rounded-full shadow-lg flex items-center justify-center text-sky-600">
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
            <path d="M15 18l-6-6 6-6" />
          </svg>
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
            <path d="M9 18l6-6-6-6" />
          </svg>
        </div>
      </div>
      <div className="absolute bottom-0 inset-x-0 h-32 bg-gradient-to-t from-black/60 to-transparent z-10 pointer-events-none" />
      <h3 className="absolute bottom-6 left-6 text-white font-heading text-2xl font-bold z-20 pointer-events-none">{card.title}</h3>
    </div>
  );
};

const HeroShowcaseCard: React.FC<{ imageUrl: string; title: string; tag: string }> = ({ imageUrl, title, tag }) => (
  <div className="relative rounded-2xl overflow-hidden bg-white shadow-lg border border-slate-200/60 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group aspect-[4/5] min-h-[160px]">
    <img src={imageUrl} alt={title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
    <div className="absolute bottom-0 left-0 right-0 p-4">
      <p className="text-white font-semibold text-sm drop-shadow">{title}</p>
      <p className="text-white/90 text-xs">{tag}</p>
    </div>
    <div className="absolute top-3 left-3">
      <span className="px-2.5 py-1 bg-white/90 backdrop-blur text-[10px] font-semibold text-slate-800 rounded-lg">{tag}</span>
    </div>
  </div>
);

const FashionStudio: React.FC = () => (
  <section className="py-24 px-4 sm:px-6 lg:px-8">
    <div className="container mx-auto max-w-7xl bg-white rounded-[3.5rem] p-8 md:p-20 relative overflow-hidden shadow-2xl shadow-sky-200/40 border border-sky-100">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[600px] bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-sky-100 via-sky-50/20 to-transparent pointer-events-none" />
      <div className="text-center max-w-4xl mx-auto mb-20 relative z-10">
        <h2 className="font-heading text-5xl md:text-6xl font-extrabold text-slate-900 mb-6 tracking-tight">
          Your Complete <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-500 to-blue-600">AI Fashion</span> Studio
        </h2>
        <p className="text-xl md:text-2xl text-slate-600 font-medium leading-relaxed">Everything you need to create stunning fashion campaigns, all in one place.</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 relative z-10">
        {[
          {
            title: 'Virtual Photoshoot',
            desc: 'Swap garments on your models with perfect fit and lighting instantly.',
            icon: 'M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15',
            btn: 'Seamless Swap',
          },
          {
            title: 'Model Transform',
            desc: 'Change models, ethnicities, and poses while keeping your product perfect.',
            icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z',
            btn: 'AI Casting',
          },
          {
            title: 'Background Magic',
            desc: 'Transport your products to any setting. Beach, studio, or lifestyle scenes.',
            icon: 'M13 10V3L4 14h7v7l9-11h-7z',
            btn: 'Scene Creator',
          },
          {
            title: 'Product Perfection',
            desc: 'Ghost mannequin, flat-lays, and perfected shots. E-commerce ready.',
            icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
            btn: 'Auto Enhance',
          },
        ].map((item) => (
          <div
            key={item.title}
            className="bg-sky-50/30 rounded-[2.5rem] p-10 shadow-[0_10px_30px_-10px_rgba(14,165,233,0.1)] border border-sky-100 text-center hover:-translate-y-3 transition-all duration-500 flex flex-col items-center group hover:shadow-[0_30px_60px_-15px_rgba(14,165,233,0.3)] hover:border-sky-300 hover:bg-white"
          >
            <div className="w-20 h-20 rounded-3xl bg-white text-sky-600 flex items-center justify-center mb-8 group-hover:scale-110 group-hover:bg-sky-500 group-hover:text-white transition-all duration-300 shadow-md border border-sky-50">
              <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d={item.icon} />
              </svg>
            </div>
            <h3 className="font-heading text-2xl font-extrabold text-slate-900 mb-4">{item.title}</h3>
            <p className="text-base text-slate-600 font-medium leading-relaxed mb-10 flex-grow">{item.desc}</p>
            <button className="px-8 py-3.5 bg-sky-600 text-white text-xs font-extrabold uppercase tracking-widest rounded-2xl hover:bg-sky-700 transition-all shadow-lg hover:shadow-sky-500/30 w-full">
              {item.btn}
            </button>
          </div>
        ))}
      </div>
    </div>
  </section>
);

const WhyChooseZOLStudio: React.FC<{ onGuideClick: () => void }> = ({ onGuideClick }) => (
  <section className="py-24 px-4 sm:px-6 lg:px-8">
    <div className="container mx-auto max-w-7xl">
      <div className="text-center mb-16">
        <h2 className="font-heading text-4xl md:text-5xl font-bold text-slate-900">Why do I need it?</h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-20">
        {[
          {
            title: 'Accelerated Time-to-Market',
            desc: 'Launch collections in days, not months. Skip the logistics of booking models, studios, and photographers. Get campaign-ready assets instantly.',
          },
          {
            title: 'Drastic Cost Reduction',
            desc: 'Traditional photoshoots cost thousands per day. Zol Studio AI reduces your visual production costs by up to 90%, allowing you to invest more in growth.',
          },
          {
            title: 'Infinite Creative Scale',
            desc: 'Need 50 variations for A/B testing ads? Generate endless combinations of models, backgrounds, and poses without reshooting a single frame.',
          },
        ].map((card) => (
          <div key={card.title} className="bg-sky-500 rounded-3xl p-8 text-white shadow-xl shadow-sky-200 hover:scale-[1.03] hover:shadow-sky-300 transition-all duration-300">
            <h3 className="font-heading text-2xl font-bold mb-4">{card.title}</h3>
            <p className="text-sky-50 leading-relaxed font-medium">{card.desc}</p>
          </div>
        ))}
      </div>
      <div className="text-center max-w-3xl mx-auto">
        <h3 className="font-heading text-3xl font-bold text-slate-900 mb-4">Fashion photography made easy</h3>
        <p className="text-lg text-slate-600 mb-8">
          Zol Studio AI lets you create professional studio-quality fashion assets to capture your audience&apos;s attention and stand out from the generic catalog content your competitors put out.
        </p>
        <button
          onClick={onGuideClick}
          className="px-8 py-4 bg-sky-500 text-white text-lg font-bold rounded-full hover:bg-sky-600 transition-all shadow-lg shadow-sky-200 hover:shadow-sky-300 flex items-center mx-auto group transform hover:-translate-y-1"
        >
          <span>Ultimate Guide to AI Fashion</span>
          <svg className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
          </svg>
        </button>
      </div>
    </div>
  </section>
);

const sceneImages = ['https://i.postimg.cc/CL65q5rV/A6.jpg', 'https://i.postimg.cc/3J6rw6WJ/A10.jpg', 'https://i.postimg.cc/QtXhPZYw/A13.jpg', 'https://i.postimg.cc/9QZ2QQvL/A1.jpg'];

const colorClassMap: Record<'sky' | 'cyan' | 'blue', { bg: string; text: string }> = {
  sky: { bg: 'bg-sky-50', text: 'text-sky-600' },
  cyan: { bg: 'bg-cyan-50', text: 'text-cyan-600' },
  blue: { bg: 'bg-blue-50', text: 'text-blue-600' },
};

const traditionalPainPoints = [
  {
    icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z',
    title: 'Complex Workflow',
    desc: 'Hours on prompts, masking, manual edits. Requires professional skills.',
    pain: 'Time & skill barrier',
  },
  {
    icon: 'M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z',
    title: 'Studio Dependency',
    desc: 'Steaming clothes, booking studios, setting up rigs. Slow and costly.',
    pain: 'Expensive & slow',
  },
  {
    icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z',
    title: 'High Production Costs',
    desc: 'Models, photographers, crews. Traditional shoots cost thousands.',
    pain: 'Inaccessible for many',
  },
];

const zolStudioWins = [
  {
    icon: 'M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z',
    title: 'Zero-Prompt Visual AI',
    desc: 'Upload two images. AI handles physics, lighting, draping—instantly.',
    badge: 'No learning curve',
    color: 'sky' as const,
  },
  {
    icon: 'M14.121 14.121L19 19m-7-7l7-7m-7 7l-2.879 2.879M12 12L9.121 9.121m0 5.758a3 3 0 10-4.243 4.243 3 3 0 004.243-4.243zm0-5.758a3 3 0 10-4.243-4.243 3 3 0 004.243 4.243z',
    title: '1-Click Smart Tools',
    desc: 'Auto extraction, de-wrinkle, ghost mannequin. Phone snap → catalog ready.',
    badge: '95% cost savings',
    color: 'cyan' as const,
  },
  {
    icon: 'M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10',
    title: 'Virtual Studio',
    desc: 'Infinite campaigns from one garment. No models, studios, or crews.',
    badge: 'Accessible to all',
    color: 'blue' as const,
  },
];

const pillarData = [
  {
    title: 'Zero-Prompt Virtual Photoshoot',
    subtitle: 'Virtual Photoshoot',
    features: ['No Prompt Engineering', 'Physics-Based Draping', 'Identity Preservation'],
    badge: 'Before / After',
    imageBefore: 'https://i.postimg.cc/bJDHV6sq/person1.png',
    imageAfter: 'https://i.postimg.cc/Rh1t22m2/person2.jpg',
    desc: 'Stop wrestling with complex prompts. Our visual-first AI handles physics, lighting, and draping instantly.',
    reverse: false,
  },
  {
    title: 'Intelligent Outfit Extraction',
    subtitle: 'Smart Isolation Engine',
    features: ['Ghost Mannequin Generation', 'Texture Preservation', 'Messy Backgrounds? No Problem'],
    badge: 'Raw / Extracted',
    imageBefore: 'https://i.postimg.cc/KcDsVhhQ/women-image-1.png',
    imageAfter: 'https://i.postimg.cc/NM5fnk5p/White-Romper.png',
    desc: 'Extract retail-ready assets from messy lifestyle shots with surgical precision.',
    reverse: true,
  },
  {
    title: 'The Digital Forge',
    subtitle: 'The Digital Forge',
    features: ['Instant De-wrinkling', 'Standardized Lighting', 'Factory Fresh Look'],
    badge: 'Wrinkled / Forged',
    imageBefore: 'https://i.postimg.cc/1XcQ6r0p/not-ironed.png',
    imageAfter: 'https://i.postimg.cc/W4FcSv6t/ironed.png',
    desc: 'Turn wrinkled samples into e-commerce ready assets instantly.',
    reverse: false,
  },
  {
    title: 'AI Scene Director',
    subtitle: 'Scene Director',
    features: ['Infinite Locations', 'Model Variety', 'Cost Cutter'],
    badge: 'Infinite Poses',
    imageSequence: sceneImages,
    desc: 'Create global, multi-channel campaigns from a single image. Produce high-end editorials without leaving your desk.',
    reverse: true,
  },
  {
    title: 'AI Pose Mimic',
    subtitle: 'Pose Transfer',
    features: ['Transfer Any Pose', 'Identity Preservation', 'Batch Processing'],
    badge: 'Source / Mimicked',
    imageBefore: 'https://i.postimg.cc/8PvhL28W/male1.png',
    imageAfter: 'https://i.postimg.cc/YCzQnY9W/D6.jpg',
    desc: 'Transfer any pose to your model while maintaining perfect identity preservation. One target, one reference—instant professional results.',
    reverse: false,
  },
];

const LandingPage: React.FC = () => {
  const [currentSceneIndex, setCurrentSceneIndex] = useState(0);
  const [isAnnual, setIsAnnual] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSceneIndex((prev) => (prev + 1) % sceneImages.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleScrollTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });
  const handleStart = () => navigate(PATHS.AUTH);

  const handleSelectPlan = async (planName: string, isAnnual: boolean) => {
    // Define variant IDs from Environment Variables
    const variantIds: Record<string, { monthly: string; annual: string }> = {
      'Basic': {
        monthly: import.meta.env.VITE_LEMONSQUEEZY_BASIC_MONTHLY_VARIANT_ID || '1124106',
        annual: import.meta.env.VITE_LEMONSQUEEZY_BASIC_ANNUAL_VARIANT_ID || ''
      },
      'Pro': {
        monthly: import.meta.env.VITE_LEMONSQUEEZY_PRO_MONTHLY_VARIANT_ID || '',
        annual: import.meta.env.VITE_LEMONSQUEEZY_PRO_ANNUAL_VARIANT_ID || ''
      },
      'Agency': {
        monthly: import.meta.env.VITE_LEMONSQUEEZY_AGENCY_MONTHLY_VARIANT_ID || '',
        annual: import.meta.env.VITE_LEMONSQUEEZY_AGENCY_ANNUAL_VARIANT_ID || ''
      }
    };

    const selectedVariantId = isAnnual ? variantIds[planName]?.annual : variantIds[planName]?.monthly;

    // Validate variant ID - check for undefined, null, or empty string
    if (!selectedVariantId || selectedVariantId.trim() === '') {
      const billingPeriod = isAnnual ? 'Annual' : 'Monthly';
      console.error(`❌ Variant ID not configured for: ${planName} (${billingPeriod})`);
      console.error('Environment variable missing:', `VITE_LEMONSQUEEZY_${planName.toUpperCase()}_${billingPeriod.toUpperCase()}_VARIANT_ID`);
      alert(`⚠️ Configuration Error\n\nThe ${planName} ${billingPeriod} plan is not configured.\n\nPlease add the variant ID to your environment variables:\nVITE_LEMONSQUEEZY_${planName.toUpperCase()}_${billingPeriod.toUpperCase()}_VARIANT_ID`);
      return;
    }

    // Currently redirecting to Auth to ensure user account exists before payment.
    // We pass the selected plan info in state so AuthPage could potentially auto-redirect after login.
    navigate(PATHS.AUTH, { state: { selectedPlan: planName, variantId: selectedVariantId } });
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-sky-50/60 via-slate-50/40 to-white text-slate-900 antialiased overflow-hidden relative">
      <Header onLogoClick={handleScrollTop} onStart={handleStart} />
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] right-0 w-[50%] h-[60%] bg-sky-100/30 rounded-full blur-[100px]" />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03]" />
      </div>

      <main className="relative z-10 pt-28 sm:pt-32">
        {/* Hero - Reference-style two-column layout */}
        <section className="pt-8 pb-24 lg:pt-20 lg:pb-32">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
              {/* Left column - content */}
              <div className="text-left order-2 lg:order-1">
                <div className="inline-flex items-center space-x-2 bg-white/90 backdrop-blur-sm border border-slate-200 rounded-full px-4 py-1.5 mb-6 shadow-sm">
                  <span className="flex h-2 w-2 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-sky-500" />
                  </span>
                  <span className="text-xs font-semibold text-slate-600 tracking-wide uppercase">Powered by Advanced AI</span>
                </div>

                <h1 className="font-headline text-[clamp(2.25rem,5vw,3.25rem)] font-bold text-slate-900 tracking-tight leading-[1.1] mb-6">
                  Best AI Fashion <br />
                  <span className="text-sky-600">Creative Platform</span>
                </h1>
                <p className="text-lg sm:text-xl text-slate-600 mb-8 leading-relaxed font-normal max-w-xl">
                  Generate professional product photos, virtual try-ons, and marketing assets <span className="text-sky-600 font-medium">in minutes</span>. Grow your e-commerce with <span className="text-sky-600 font-medium">AI-powered</span> automation — no photoshoots needed.
                </p>

                {/* Feature list with icons - like reference */}
                <ul className="space-y-4 mb-8">
                  {[
                    { icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z', text: 'Swap garments onto your models with 100% facial preservation' },
                    { icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z', text: 'Extract ghost mannequin assets from lifestyle shots instantly' },
                    { icon: 'M13 10V3L4 14h7v7l9-11h-7z', text: 'AI chooses the best pose and background for your product' },
                    { icon: 'M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z', text: 'Import your product images and export 4K catalog-ready shots' },
                  ].map((item, i) => (
                    <li key={i} className="flex items-start gap-4">
                      <div className="shrink-0 w-10 h-10 rounded-xl bg-sky-50 flex items-center justify-center text-sky-600">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                          <path strokeLinecap="round" strokeLinejoin="round" d={item.icon} />
                        </svg>
                      </div>
                      <span className="text-[15px] text-slate-600 leading-relaxed pt-2">{item.text}</span>
                    </li>
                  ))}
                </ul>

                <div className="flex flex-col sm:flex-row items-start gap-4">
                  <button
                    onClick={handleStart}
                    className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-sky-500 to-blue-600 text-white rounded-xl font-semibold text-base shadow-lg shadow-sky-500/30 hover:shadow-sky-500/40 hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2"
                  >
                    <span>Launch Studio For Free</span>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Right column - 3+2 image cards (reference style) */}
              <div className="order-1 lg:order-2">
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4 lg:gap-5">
                  {heroShowcaseCards.slice(0, 3).map((card, i) => (
                    <HeroShowcaseCard key={i} imageUrl={card.imageUrl} title={card.title} tag={card.tag} />
                  ))}
                  <div className="col-span-2 sm:col-span-3 flex justify-center gap-3 sm:gap-4 lg:gap-5">
                    {heroShowcaseCards.slice(3, 5).map((card, i) => (
                      <div key={i} className="w-[calc(50%-0.375rem)] sm:w-[calc(33.333%-0.67rem)] max-w-[200px] sm:max-w-[220px]">
                        <HeroShowcaseCard imageUrl={card.imageUrl} title={card.title} tag={card.tag} />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <FashionStudio />
        <WhyChooseZOLStudio onGuideClick={handleStart} />

        {/* Testimonial */}
        <section className="relative w-full bg-sky-950 py-24 overflow-hidden border-y border-sky-900">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-sky-900 via-sky-950 to-slate-950 opacity-80" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-sky-400/10 rounded-full blur-[120px] pointer-events-none mix-blend-overlay" />
          <div className="container mx-auto px-4 relative z-10 text-center">
            <h4 className="text-sky-300 text-xs font-bold tracking-[0.3em] uppercase mb-10">Trusted by Modern E-Commerce Brands</h4>
            <blockquote className="font-serif text-3xl md:text-4xl lg:text-5xl text-white leading-relaxed max-w-5xl mx-auto mb-12 italic opacity-90">
              &quot;Zol Studio AI redefined our creative velocity. We transformed a single garment sample into a global, multi-channel campaign in 48 hours—zero studio time required.&quot;
            </blockquote>
            <div className="flex flex-col items-center">
              <div className="w-14 h-14 bg-sky-800 rounded-full mb-4 border-2 border-sky-700 shadow-lg overflow-hidden">
                <img src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?ixlib=rb-4.0.3&auto=format&fit=crop&w=256&h=256&q=80" className="w-full h-full object-cover opacity-80 grayscale" alt="Sarah Jenkins" />
              </div>
              <div className="text-white font-bold text-lg">Sarah Jenkins</div>
              <div className="text-sky-400 text-sm">Creative Director, VELVET & VINE</div>
            </div>
          </div>
        </section>

        {/* Comparison */}
        <section className="relative py-20 sm:py-28 overflow-hidden bg-gradient-to-b from-sky-50 to-white">
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-0 left-1/4 w-80 h-80 bg-sky-200/40 rounded-full filter blur-3xl" />
            <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-sky-300/30 rounded-full filter blur-3xl" />
          </div>
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl relative z-10">
            <div className="text-center mb-14">
              <h2 className="font-heading text-3xl md:text-4xl lg:text-5xl font-bold text-slate-900 mb-3">Why Zol Studio AI?</h2>
              <p className="text-slate-600 font-medium">Clear benefits. Dramatic cost savings.</p>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
              {/* Traditional Way */}
              <div className="group">
                <div className="bg-white rounded-2xl border border-slate-200/80 p-6 lg:p-8 shadow-lg shadow-slate-200/30 hover:shadow-xl transition-all duration-300 h-full">
                  <div className="flex items-center gap-3 mb-8">
                    <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500">
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <h3 className="text-xl font-bold text-slate-700 font-heading">The Traditional Way</h3>
                  </div>
                  <div className="space-y-6">
                    {traditionalPainPoints.map((item) => (
                      <div key={item.title} className="flex gap-4">
                        <div className="mt-0.5 text-slate-400 shrink-0">
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={item.icon} />
                          </svg>
                        </div>
                        <div>
                          <h4 className="font-semibold text-slate-800 mb-0.5">{item.title}</h4>
                          <p className="text-sm text-slate-600 leading-relaxed">{item.desc}</p>
                          <span className="inline-block text-xs font-medium text-rose-500 mt-1.5">{item.pain}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              {/* Zol Studio AI Way */}
              <div className="group">
                <div className="bg-white rounded-2xl border-2 border-sky-200 p-6 lg:p-8 shadow-xl shadow-sky-200/25 hover:shadow-sky-300/30 hover:border-sky-300 transition-all duration-300 h-full relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-sky-400/10 to-transparent rounded-bl-full" />
                  <div className="flex items-center gap-3 mb-8 relative z-10">
                    <div className="w-10 h-10 rounded-xl bg-sky-500 flex items-center justify-center text-white shadow-lg shadow-sky-500/30">
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    </div>
                    <h3 className="text-xl font-bold text-sky-900 font-heading">The Zol Studio AI Way</h3>
                  </div>
                  <div className="space-y-6 relative z-10">
                    {zolStudioWins.map((win) => {
                      const colors = colorClassMap[win.color];
                      return (
                        <div key={win.title} className="flex gap-4">
                          <div className={`mt-0.5 w-9 h-9 rounded-lg ${colors.bg} flex items-center justify-center ${colors.text} shrink-0`}>
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={win.icon} />
                            </svg>
                          </div>
                          <div>
                            <h4 className="font-semibold text-sky-900 mb-0.5">{win.title}</h4>
                            <p className="text-sm text-slate-600 leading-relaxed">{win.desc}</p>
                            <span className={`inline-flex items-center gap-1 text-xs font-semibold mt-1.5 ${colors.text}`}>
                              <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                              {win.badge}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  {/* Cost comparison - prominent & elegant */}
                  <div className="mt-8 relative z-10">
                    <div className="bg-gradient-to-r from-sky-500 to-blue-600 rounded-xl p-5 shadow-lg flex items-center justify-between text-white">
                      <div>
                        <span className="text-[10px] uppercase tracking-widest font-bold opacity-90">Traditional</span>
                        <p className="text-lg font-bold line-through opacity-80 mt-0.5">$40 – $100 <span className="text-sm font-normal">/ image</span></p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sky-200 text-sm font-medium">→</span>
                        <div className="h-10 w-px bg-white/30" />
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] uppercase tracking-widest font-bold text-sky-100">Zol Studio AI</span>
                        <p className="text-2xl font-extrabold mt-0.5">$0.27 <span className="text-sm font-normal opacity-90">/ image</span></p>
                        <span className="text-xs font-bold text-emerald-300 mt-1 block">Up to 99% savings</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Pillars */}
        <section className="relative py-32 overflow-hidden bg-sky-50/40">
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {/* Base sky blue-grey tint */}
            <div className="absolute inset-0 bg-gradient-to-br from-sky-50/60 via-slate-50/50 to-sky-100/40" />
            <div className="absolute top-1/4 left-0 w-[800px] h-[800px] bg-sky-100/30 rounded-full mix-blend-multiply filter blur-[120px] opacity-40" />
            <div className="absolute bottom-1/4 right-0 w-[800px] h-[800px] bg-sky-100/40 rounded-full mix-blend-multiply filter blur-[120px] opacity-50" />
            {/* Sky blue-grey fills in circled white space areas */}
            <div className="absolute top-[15%] right-[5%] w-[320px] h-[280px] sm:w-[400px] sm:h-[320px] rounded-full bg-sky-100/70 filter blur-2xl" />
            <div className="absolute top-[45%] left-[2%] w-[300px] h-[260px] sm:w-[380px] sm:h-[300px] rounded-full bg-sky-100/60 filter blur-2xl" />
            <div className="absolute bottom-[10%] right-[8%] w-[350px] h-[300px] sm:w-[420px] sm:h-[360px] rounded-full bg-sky-100/65 filter blur-2xl" />
          </div>
          {/* Decorative animated lines in white space - professional SaaS style */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <svg className="absolute top-20 right-[15%] w-48 h-48 text-sky-200/60 animate-line-shimmer" fill="none" viewBox="0 0 100 100">
              <path d="M0 50 Q 50 20 100 50 T 100 100" stroke="currentColor" strokeWidth="1" strokeDasharray="6 4" className="animate-dash-flow" />
            </svg>
            <svg className="absolute top-1/3 left-[8%] w-32 h-32 text-sky-200/50 animate-line-shimmer" fill="none" viewBox="0 0 80 80" style={{ animationDelay: '0.5s' }}>
              <path d="M0 0 L 80 80" stroke="currentColor" strokeWidth="1" strokeDasharray="8 6" className="animate-dash-flow" />
            </svg>
            <svg className="absolute bottom-1/3 right-[10%] w-40 h-40 text-sky-200/50 animate-line-shimmer" fill="none" viewBox="0 0 100 100" style={{ animationDelay: '1s' }}>
              <path d="M100 0 Q 50 50 0 100" stroke="currentColor" strokeWidth="1" strokeDasharray="6 4" className="animate-dash-flow" />
            </svg>
            <svg className="absolute top-2/3 left-[12%] w-36 h-36 text-sky-200/40" fill="none" viewBox="0 0 80 80">
              <path d="M0 40 L 40 0 L 80 40 L 40 80 Z" stroke="currentColor" strokeWidth="0.5" strokeDasharray="4 8" className="animate-dash-flow" />
            </svg>
            <svg className="absolute bottom-1/4 right-[18%] w-28 h-28 text-sky-200/40" fill="none" viewBox="0 0 60 60" style={{ animationDelay: '0.3s' }}>
              <path d="M30 0 L 60 30 L 30 60 L 0 30 Z" stroke="currentColor" strokeWidth="0.5" strokeDasharray="5 5" className="animate-dash-flow" />
            </svg>
            <div className="absolute top-1/2 left-0 w-24 h-px bg-gradient-to-r from-transparent via-sky-200/60 to-transparent animate-line-shimmer" />
            <div className="absolute top-1/2 right-0 w-24 h-px bg-gradient-to-l from-transparent via-sky-200/60 to-transparent animate-line-shimmer" style={{ animationDelay: '1.2s' }} />
          </div>
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl relative z-10">
            <div className="text-center max-w-3xl mx-auto mb-24">
              <div className="inline-block px-4 py-1 rounded-full bg-sky-50 text-sky-600 text-xs font-bold tracking-widest uppercase mb-6 border border-sky-200">
                The Zol Studio AI Engine
              </div>
              <h2 className="font-heading text-5xl md:text-6xl font-bold text-slate-900 mb-6">
                5 Pillars of <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-500 to-blue-600">Perfection</span>
              </h2>
              <p className="text-xl text-slate-600 font-medium">Our AI-powered architecture delivers standard-setting quality across every asset type.</p>
            </div>

            {/* Staggered alternating layout: medium cards with animated connecting arrows */}
            <div className="relative flex flex-col gap-4 sm:gap-6">
              {pillarData.map((pillar, idx) => {
                const isLeft = idx % 2 === 0;
                return (
                  <React.Fragment key={pillar.title}>
                    <div
                      className={`flex w-full ${isLeft ? 'justify-start' : 'justify-end'}`}
                    >
                      <div
                        className="w-full max-w-3xl flex flex-col sm:flex-row items-stretch gap-8 sm:gap-10 rounded-2xl border border-slate-200/80 bg-white/95 shadow-xl shadow-slate-200/50 p-8 sm:p-10 hover:shadow-2xl hover:border-slate-200 transition-all duration-300"
                      >
                      {/* Text block - left cards: first. Right cards: second (image faces center) */}
                      <div className={`flex-1 min-w-0 flex items-start gap-5 ${isLeft ? '' : 'sm:order-2'}`}>
                        <div className="relative z-10 shrink-0 w-11 h-11 rounded-full bg-sky-500 flex items-center justify-center text-white font-bold text-base shadow-lg shadow-sky-200/50 ring-2 ring-white">
                          {idx + 1}
                        </div>
                        <div className="flex-1 pt-0.5">
                          <div className="text-sky-500 font-semibold tracking-wide text-xs uppercase mb-2">{pillar.subtitle}</div>
                          <h3 className="font-heading text-2xl sm:text-3xl font-bold text-slate-900 mb-3 leading-tight">{pillar.title}</h3>
                          <p className="text-base text-slate-600 mb-5 leading-relaxed">{pillar.desc}</p>
                          <ul className="space-y-3">
                            {pillar.features.map((feature) => (
                              <li key={feature} className="flex items-start gap-3">
                                <span className="w-2 h-2 rounded-full bg-sky-500 shrink-0 mt-2" />
                                <span className="text-slate-700 text-base font-medium">{feature}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>

                      {/* Visual - left cards: right. Right cards: left (faces center for zigzag) */}
                      <div className={`w-full sm:w-[44%] shrink-0 ${isLeft ? '' : 'sm:order-1'}`}>
                        <div className="rounded-xl border border-slate-100 shadow-lg overflow-hidden bg-slate-50">
                          {pillar.imageSequence ? (
                            <div className="relative aspect-[4/5] bg-slate-50">
                              {pillar.imageSequence.map((img, imgIdx) => (
                                <img
                                  key={img}
                                  src={img}
                                  className={`absolute inset-0 w-full h-full object-cover object-top transition-opacity duration-1000 ease-in-out ${imgIdx === currentSceneIndex ? 'opacity-100' : 'opacity-0'}`}
                                  alt={`Pose ${imgIdx + 1}`}
                                />
                              ))}
                              <div className="absolute bottom-4 right-4 bg-white/90 text-xs font-bold text-slate-700 px-3 py-1.5 rounded-full border border-slate-200 shadow-sm flex items-center">
                                <span className="w-2 h-2 bg-sky-500 rounded-full animate-pulse mr-2" />
                                {pillar.badge}
                              </div>
                            </div>
                          ) : (
                            <div className="aspect-[4/5]">
                              <PillarWipeAnimation imageBefore={pillar.imageBefore} imageAfter={pillar.imageAfter} badge={pillar.badge} />
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                    {idx < pillarData.length - 1 && (
                      <ConnectingArrow isLeftToRight={isLeft} index={idx} />
                    )}
                  </React.Fragment>
                );
              })}
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section id="pricing" className="relative py-32 px-4 sm:px-6 lg:px-8 overflow-hidden bg-gradient-to-b from-white via-sky-50/30 to-white">
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-20 left-10 w-72 h-72 bg-sky-400/10 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute bottom-20 right-10 w-96 h-96 bg-blue-400/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
          </div>

          <div className="relative z-10 container mx-auto max-w-7xl">
            {/* Section Header */}
            <div className="text-center mb-16">
              <div className="inline-block mb-6">
                <span className="px-4 py-2 bg-sky-100 text-sky-700 rounded-full text-sm font-semibold">
                  💎 Simple, Transparent Pricing
                </span>
              </div>
              <h2 className="font-heading text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 mb-6 tracking-tight">
                Ready to Revolutionize
              </h2>
              <p className="text-xl text-slate-600 mb-8 max-w-2xl mx-auto">
                Choose the perfect plan for your business. Start creating professional AI-generated assets in minutes.
              </p>

              {/* Toggle Switch */}
              <div className="flex items-center justify-center gap-4 mb-12">
                <span className={`text-sm font-medium transition-colors ${!isAnnual ? 'text-slate-900' : 'text-slate-500'}`}>
                  Monthly
                </span>
                <button
                  onClick={() => setIsAnnual(!isAnnual)}
                  className={`relative inline-flex h-8 w-16 items-center rounded-full transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 ${isAnnual ? 'bg-sky-600' : 'bg-gray-300'
                    }`}
                  role="switch"
                  aria-checked={isAnnual}
                >
                  <span
                    className={`inline-block h-6 w-6 transform rounded-full bg-white shadow-lg transition-transform duration-300 ${isAnnual ? 'translate-x-9' : 'translate-x-1'
                      }`}
                  />
                </button>
                <span className={`text-sm font-medium transition-colors ${isAnnual ? 'text-slate-900' : 'text-slate-500'}`}>
                  Annual <span className={`text-sky-600 font-bold transition-all duration-300 ${isAnnual ? 'glow-effect' : ''}`}>(2 months free)</span>
                </span>
              </div>
            </div>

            {/* Pricing Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-10">
              {[
                {
                  name: 'Basic',
                  tagline: 'Perfect for getting started',
                  monthlyPrice: 49,
                  annualPrice: 490,
                  annualSavings: 98,
                  credits: 175,
                  features: [
                    '175 Credits / month',
                    'Real-Time Generation',
                    'Commercial License',
                    'Remove Watermark',
                    'Standard Support'
                  ],
                  color: 'blue'
                },
                {
                  name: 'Pro',
                  tagline: 'Accelerate growth & consistency',
                  monthlyPrice: 99,
                  annualPrice: 990,
                  annualSavings: 198,
                  credits: 360,
                  features: [
                    '360 Credits / month',
                    'Access to All Tools',
                    'Commercial License',
                    'Remove Watermark',
                    'High Pixel Quality',
                    'Standard Support'
                  ],
                  popular: true,
                  color: 'sky'
                },
                {
                  name: 'Agency',
                  tagline: 'Maximum power & scale',
                  monthlyPrice: 149,
                  annualPrice: 1490,
                  annualSavings: 298,
                  credits: 550,
                  features: [
                    '550 Credits / month',
                    'API Access',
                    'Commercial License',
                    'Priority Support',
                    'Early Access to New Models',
                    'Remove Watermark',
                    '4K Ultra-High Resolution'
                  ],
                  color: 'purple'
                }
              ].map((plan, index) => {
                const price = isAnnual ? plan.annualPrice : plan.monthlyPrice;
                const period = isAnnual ? '/yr' : '/mo';
                const savings = isAnnual ? `Save $${plan.annualSavings} / year` : null;

                const colorClasses = plan.popular
                  ? 'border-2 border-sky-500 shadow-xl shadow-sky-200/50 bg-gradient-to-br from-sky-50 to-cyan-50'
                  : plan.color === 'blue'
                    ? 'border border-gray-200 bg-gradient-to-br from-blue-50 to-sky-50'
                    : plan.color === 'purple'
                      ? 'border border-gray-200 bg-gradient-to-br from-purple-50 to-indigo-50'
                      : 'border border-gray-200 bg-white';

                const buttonColor = plan.popular
                  ? 'bg-sky-600 hover:bg-sky-700'
                  : plan.color === 'blue'
                    ? 'bg-blue-600 hover:bg-blue-700'
                    : 'bg-purple-600 hover:bg-purple-700';

                const checkmarkColor = plan.popular
                  ? 'text-sky-600'
                  : plan.color === 'blue'
                    ? 'text-blue-600'
                    : 'text-purple-600';

                const priceColor = plan.popular
                  ? 'text-sky-600'
                  : plan.color === 'blue'
                    ? 'text-blue-600'
                    : 'text-purple-600';

                return (
                  <div
                    key={plan.name}
                    className={`relative ${colorClasses} rounded-2xl p-8 transition-all duration-500 hover:scale-105 hover:-translate-y-2 ${plan.popular ? 'md:-mt-4 md:mb-4' : ''
                      }`}
                  >
                    {/* Popular Badge */}
                    {plan.popular && (
                      <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                        <span className="bg-sky-500 text-white px-4 py-1 rounded-full text-xs font-bold shadow-lg animate-bounce">
                          MOST POPULAR
                        </span>
                      </div>
                    )}

                    {/* Plan Header */}
                    <div className="text-center mb-6">
                      <h3 className="text-2xl font-bold text-slate-900 mb-2">
                        {plan.name}
                      </h3>
                      <p className="text-sm text-slate-600 mb-4">
                        {plan.tagline}
                      </p>

                      {/* Price */}
                      <div className="mb-2">
                        <span className={`text-4xl font-extrabold ${priceColor}`}>
                          ${price}
                        </span>
                        <span className="text-slate-600 text-lg">
                          {period}
                        </span>
                      </div>

                      {savings && (
                        <p className="text-sm text-sky-600 font-semibold">
                          {savings}
                        </p>
                      )}
                    </div>

                    {/* Features List */}
                    <ul className="space-y-4 mb-8 min-h-[280px]">
                      {plan.features.map((feature, featureIndex) => (
                        <li key={featureIndex} className="flex items-start gap-3">
                          <svg
                            className={`flex-shrink-0 w-5 h-5 mt-0.5 ${checkmarkColor}`}
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                              clipRule="evenodd"
                            />
                          </svg>
                          <span className="text-slate-700 text-sm">
                            {feature}
                          </span>
                        </li>
                      ))}
                    </ul>

                    {/* CTA Button */}
                    <button
                      onClick={() => handleSelectPlan(plan.name, isAnnual)}
                      className={`w-full ${buttonColor} text-white py-4 rounded-xl font-bold text-base shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 active:scale-95`}
                    >
                      Get Started
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="relative py-32 px-4 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-sky-200 via-sky-100 to-white pointer-events-none" />
          <div className="relative z-10 container mx-auto max-w-4xl text-center">
            <h2 className="font-heading text-5xl md:text-6xl font-bold text-slate-900 mb-6 tracking-tight">
              Start Your Journey <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-600 to-blue-600">Today</span>
            </h2>
            <p className="text-xl text-slate-600 mb-10 max-w-2xl mx-auto leading-relaxed">
              Join the thousands of designers and brands building the future of fashion with Zol Studio AI. Experience the power of AI-driven studio photography today.
            </p>
            <div className="flex flex-col items-center space-y-4">
              <button
                onClick={handleStart}
                className="px-10 py-5 bg-sky-600 text-white text-xl font-bold rounded-full shadow-2xl shadow-sky-400/50 hover:shadow-sky-500/60 hover:-translate-y-1 transition-all duration-300 flex items-center group"
              >
                <span>Create Your Free Account</span>
                <svg className="w-6 h-6 ml-2 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </button>
              <p className="text-slate-500 text-sm font-medium">No credit card required. Cancel anytime.</p>
            </div>
            <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
              {[
                { title: 'Lightning Fast', desc: 'Render results in < 5 seconds', icon: 'M13 10V3L4 14h7v7l9-11h-7z' },
                { title: 'Enterprise Quality', desc: '4K Ultra-HD exports standard', icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z' },
                { title: 'Secure & Private', desc: 'Your assets are never shared', icon: 'M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z' },
              ].map((point) => (
                <div key={point.title} className="flex items-center p-4 bg-white/60 backdrop-blur-sm rounded-2xl border border-sky-100 shadow-sm hover:bg-white/80 transition-colors">
                  <div className="w-12 h-12 rounded-full bg-sky-100 text-sky-600 flex items-center justify-center flex-shrink-0 mr-4">
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={point.icon} />
                    </svg>
                  </div>
                  <div>
                    <div className="font-bold text-slate-900">{point.title}</div>
                    <div className="text-xs text-slate-500">{point.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer className="relative z-10 bg-[#F5F7FA] w-full">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-10 py-12">
          <div className="flex flex-col md:flex-row justify-between items-start gap-8 md:gap-20 mb-10">
            {/* Left Side - Branding */}
            <div className="flex flex-col">
              <button
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
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
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    const pricingSection = document.getElementById('pricing');
                    if (pricingSection) {
                      pricingSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }
                  }}
                  className="text-slate-700 hover:text-sky-600 text-sm transition-colors text-left font-medium"
                >
                  Pricing
                </button>
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
              &copy; {new Date().getFullYear()} Zol Studio. All rights reserved.
            </p>
          </div>
        </div>
      </footer>

      {/* Glow Effect Styles */}
      <style>{`
        .glow-effect {
          animation: glow-pulse 2s ease-in-out infinite;
          text-shadow: 0 0 10px rgba(14, 165, 233, 0.5),
                       0 0 20px rgba(14, 165, 233, 0.4),
                       0 0 30px rgba(14, 165, 233, 0.3),
                       0 0 40px rgba(14, 165, 233, 0.2);
        }
        
        @keyframes glow-pulse {
          0%, 100% {
            text-shadow: 0 0 10px rgba(14, 165, 233, 0.5),
                         0 0 20px rgba(14, 165, 233, 0.4),
                         0 0 30px rgba(14, 165, 233, 0.3),
                         0 0 40px rgba(14, 165, 233, 0.2);
            transform: scale(1);
          }
          50% {
            text-shadow: 0 0 20px rgba(14, 165, 233, 0.8),
                         0 0 30px rgba(14, 165, 233, 0.6),
                         0 0 40px rgba(14, 165, 233, 0.5),
                         0 0 50px rgba(14, 165, 233, 0.4),
                         0 0 60px rgba(14, 165, 233, 0.3);
            transform: scale(1.05);
          }
        }
      `}</style>
    </div>
  );
};

export default LandingPage;

