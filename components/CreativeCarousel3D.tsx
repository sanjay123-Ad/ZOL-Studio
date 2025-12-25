import React from 'react';

interface CarouselItem {
  id: string;
  imageUrl: string;
  title: string;
  badgeText?: string;
}

interface CarouselConfig {
  radius: number;
  itemWidth: number;
  itemHeight: number;
  rotationSpeed: number; // seconds
  isPaused: boolean;
  perspectivePx?: number; // optional override
}

type CreativeCarousel3DProps = {
  className?: string;
  items?: CarouselItem[];
  config?: CarouselConfig;
};

const DEFAULT_ITEMS: CarouselItem[] = [
  { id: '1', imageUrl: 'https://i.postimg.cc/HxSv8F52/E1.jpg', title: 'Models', badgeText: 'Style Scene' },
  { id: '2', imageUrl: 'https://i.postimg.cc/3JypTzwM/Creative-Social-Media-Poster-Design.jpg', title: 'Premium look', badgeText: 'Catalog Forge' },
  { id: '3', imageUrl: 'https://i.postimg.cc/8kYJtwmr/D22.jpg', title: 'Models', badgeText: 'Style Scene' },
  { id: '4', imageUrl: 'https://i.postimg.cc/BvNtDCvj/T-shirt.jpg', title: 'Premium look', badgeText: 'Catalog Forge' },
  { id: '5', imageUrl: 'https://i.postimg.cc/YCzQnY9W/D6.jpg', title: 'Models', badgeText: 'Style Scene' },
  { id: '6', imageUrl: 'https://i.postimg.cc/RVcthKwG/50922dbcd0507170ed6203556131f6c6.jpg', title: 'Premium look', badgeText: 'Catalog Forge' },
];

export const CreativeCarousel3D: React.FC<CreativeCarousel3DProps> = ({
  className = '',
  items = DEFAULT_ITEMS,
  config = {
    radius: 420,
    itemWidth: 280,
    itemHeight: 380,
    rotationSpeed: 35,
    isPaused: false,
    perspectivePx: 1500,
  },
}) => {
  const itemCount = Math.max(1, items.length);
  const angleStep = 360 / itemCount;

  const spinnerStyle: React.CSSProperties = {
    width: `${config.itemWidth}px`,
    height: `${config.itemHeight}px`,
    animation: config.isPaused ? 'none' : `spin ${config.rotationSpeed}s infinite linear`,
    transformStyle: 'preserve-3d',
    position: 'absolute',
    left: '50%',
    top: '50%',
    marginLeft: `-${config.itemWidth / 2}px`,
    marginTop: `-${config.itemHeight / 2}px`,
  };

  return (
    <section className={className} aria-label="3D carousel">
      <div
        className="w-full h-full flex items-center justify-center overflow-hidden"
        style={{ perspective: `${config.perspectivePx ?? 1500}px` }}
      >
        <style>
          {`
            @keyframes spin {
              from { transform: rotateY(0deg); }
              to { transform: rotateY(-360deg); }
            }
          `}
        </style>

        <div className="relative" style={spinnerStyle}>
          {items.map((item, index) => {
            const rotationAngle = index * angleStep;
            const itemTransform: React.CSSProperties = {
              position: 'absolute',
              left: 0,
              top: 0,
              width: '100%',
              height: '100%',
              transform: `rotateY(${rotationAngle}deg) translateZ(${config.radius}px)`,
            };

            return (
              <div
                key={item.id}
                className="rounded-[2rem] overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.2)] border-[3px] border-white bg-white group transition-all duration-500 hover:brightness-110"
                style={itemTransform}
              >
                <div className="relative w-full h-full bg-slate-100">
                  <img
                    src={item.imageUrl}
                    alt={item.title}
                    className="w-full h-full object-cover block"
                    loading="lazy"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent opacity-80" />

                  <div className="absolute bottom-6 left-6 right-6">
                    <div className="inline-block px-2 py-1 mb-2 text-[10px] font-bold uppercase tracking-widest text-white bg-sky-500 rounded-md">
                      {item.badgeText ?? 'Generated Asset'}
                    </div>
                    <p className="text-white font-extrabold text-lg tracking-tight leading-none drop-shadow-md">
                      {item.title}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};


