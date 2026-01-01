import { useEffect } from 'react';

/**
 * Analytics Component
 * 
 * Add your Google Analytics tracking ID to Vercel environment variables:
 * - VITE_GA_TRACKING_ID (e.g., G-XXXXXXXXXX)
 * 
 * Or use Vercel Analytics by installing @vercel/analytics
 */

// Declare gtag type for TypeScript
declare global {
  interface Window {
    dataLayer: any[];
    gtag: (...args: any[]) => void;
  }
}

const Analytics: React.FC = () => {
  useEffect(() => {
    // Google Analytics 4
    const gaTrackingId = import.meta.env.VITE_GA_TRACKING_ID;
    
    if (gaTrackingId) {
      // Load Google Analytics script
      const script1 = document.createElement('script');
      script1.async = true;
      script1.src = `https://www.googletagmanager.com/gtag/js?id=${gaTrackingId}`;
      document.head.appendChild(script1);

      // Initialize gtag
      window.dataLayer = window.dataLayer || [];
      function gtag(...args: any[]) {
        window.dataLayer.push(args);
      }
      window.gtag = gtag;
      
      gtag('js', new Date());
      gtag('config', gaTrackingId, {
        page_path: window.location.pathname,
      });

      // Track page views on route changes
      const handleRouteChange = () => {
        gtag('config', gaTrackingId, {
          page_path: window.location.pathname,
        });
      };

      // Listen for popstate events (back/forward navigation)
      window.addEventListener('popstate', handleRouteChange);
      
      // Track initial page view
      handleRouteChange();

      return () => {
        window.removeEventListener('popstate', handleRouteChange);
      };
    }
  }, []);

  return null; // This component doesn't render anything
};

export default Analytics;

