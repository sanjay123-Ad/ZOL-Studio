import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Routes, Route, useNavigate, Navigate, useLocation } from 'react-router-dom';
import AuthPage from './pages/AuthPage';
import HomePage from './pages/HomePage';
import TryOnPage from './pages/TryOnPage';
import GalleryPage from './pages/GalleryPage';
import AssetGeneratorPage from './pages/AssetGeneratorPage';
import LandingPage from './pages/LandingPage';
import CatalogForgedPage from './pages/CatalogForgedPage';
import PoseMimicPage from './pages/PoseMimicPage';
import AboutPage from './pages/AboutPage';
import PricingPage from './pages/PricingPage';
import ProfilePage from './pages/ProfilePage';
import StyleScenePage from './pages/StyleScenePage';
import ModelGalleryPage from './pages/ModelGalleryPage';
import BackgroundGalleryPage from './pages/BackgroundGalleryPage';
import AssetCollectionPage from './pages/AssetCollectionPage';
import NotFoundPage from './pages/NotFoundPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import UsageAnalyticsPage from './pages/UsageAnalyticsPage';
import SettingsPage from './pages/SettingsPage';
import PrivacyPolicyPage from './pages/PrivacyPolicyPage';
import TermsAndConditionsPage from './pages/TermsAndConditionsPage';
import ContactPage from './pages/ContactPage';
import { User, GeneratedAsset, CollectionAsset } from './types';
import Layout from './components/Layout';
import { supabase } from './services/supabase';
import { getAssetsForUser, saveAsset, getAssetsFromCollection, saveAssetToCollection, deleteAsset, deleteAssetFromCollection } from './services/db';
import Spinner from './components/Spinner';
import { PATHS } from './constants/paths';
import CookieConsentBanner from './components/CookieConsentBanner';
import Analytics from './components/Analytics';

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const hasHandledPasswordRecovery = useRef(false);
  const hasHandledGoogleWelcome = useRef(false);

  // State for session-cached gallery
  const [galleryAssets, setGalleryAssets] = useState<GeneratedAsset[]>([]);
  const [isGalleryLoading, setIsGalleryLoading] = useState<boolean>(false);
  const [hasFetchedGallery, setHasFetchedGallery] = useState<boolean>(false);
  const [galleryError, setGalleryError] = useState<string | null>(null);
  const [deletingAssetId, setDeletingAssetId] = useState<string | null>(null);

  // State for asset collection
  const [collectionAssets, setCollectionAssets] = useState<CollectionAsset[]>([]);
  const [isCollectionLoading, setIsCollectionLoading] = useState<boolean>(false);
  const [hasFetchedCollection, setHasFetchedCollection] = useState<boolean>(false);
  const [collectionError, setCollectionError] = useState<string | null>(null);
  const [deletingCollectionAssetId, setDeletingCollectionAssetId] = useState<string | null>(null);
  
  const navigate = useNavigate();
  const location = useLocation();

  const fetchGalleryAssets = useCallback(async (userId: string, forceRefresh: boolean = false) => {
    if (!userId) {
        return;
    }
    if (!forceRefresh) {
        if (isGalleryLoading) {
            return;
        }
        if (hasFetchedGallery) {
            return;
        }
    }

    setIsGalleryLoading(true);
    setGalleryError(null);
    try {
        const userAssets = await getAssetsForUser(userId);
        setGalleryAssets(userAssets);
    } catch (err) {
        console.error('Failed to fetch assets in App.tsx:', err);
        setGalleryError('Could not load your gallery. Please try again later.');
    } finally {
        setIsGalleryLoading(false);
        setHasFetchedGallery(true);
    }
  }, [hasFetchedGallery, isGalleryLoading]);

  const fetchCollectionAssets = useCallback(async (userId: string, forceRefresh: boolean = false) => {
    if (!userId) {
        return;
    }
    if (!forceRefresh) {
        if (isCollectionLoading) {
            return;
        }
        if (hasFetchedCollection) {
            return;
        }
    }
    setIsCollectionLoading(true);
    setCollectionError(null);
    try {
        const userAssets = await getAssetsFromCollection(userId);
        setCollectionAssets(userAssets);
    } catch (err) {
        console.error('Failed to fetch collection assets in App.tsx:', err);
        setCollectionError('Could not load your asset collection. Please try again later.');
    } finally {
        setIsCollectionLoading(false);
        setHasFetchedCollection(true);
    }
  }, [hasFetchedCollection, isCollectionLoading]);


  const handleAssetSaved = (generatedImage: string, sourceFeature: string = 'virtual_photoshoot') => {
    if (!currentUser) {
        console.error("Cannot save asset without a logged in user.");
        throw new Error("You must be logged in to save an image.");
    }

    const tempId = `temp_${Date.now()}`;
    const tempAsset: GeneratedAsset = {
        id: tempId,
        user_id: currentUser.id,
        image_url: 'optimistic_update.png', // Placeholder path
        display_url: generatedImage, // Use the full data URL for immediate display
        source_feature: sourceFeature,
        created_at: new Date().toISOString(),
    };

    // 1. Synchronous optimistic update for immediate UI feedback.
    setGalleryAssets(prevAssets => [tempAsset, ...prevAssets]);

    // 2. "Fire-and-forget" the actual save operation in the background.
    (async () => {
        try {
            const base64Data = generatedImage.split(',')[1];
            const realAsset = await saveAsset(currentUser.id, base64Data, sourceFeature);

            // 3. On success, replace the temporary asset with the real one.
            setGalleryAssets(prevAssets =>
                prevAssets.map(asset => (asset.id === tempId ? realAsset : asset))
            );
        } catch (error) {
            console.error("Failed to save asset in background:", error);
            // 4. On failure, silently roll back the optimistic update.
            setGalleryAssets(prevAssets => prevAssets.filter(asset => asset.id !== tempId));
        }
    })();
  };

  const handleSaveToCollection = (assetData: { imageUrl: string, asset_type: 'individual' | 'composed', item_name: string, item_category: string }) => {
    if (!currentUser) {
        console.error("Cannot save to collection without a logged in user.");
        throw new Error("You must be logged in to save an asset.");
    }

    const tempId = `temp_collection_${Date.now()}`;
    const tempAsset: CollectionAsset = {
        id: tempId,
        user_id: currentUser.id,
        image_url: 'optimistic_update.png', // Placeholder path
        display_url: assetData.imageUrl, // Full data URL for immediate display
        asset_type: assetData.asset_type,
        item_name: assetData.item_name,
        item_category: assetData.item_category,
        created_at: new Date().toISOString(),
    };
    
    setCollectionAssets(prevAssets => [tempAsset, ...prevAssets]);

    (async () => {
        try {
            const base64Data = assetData.imageUrl.split(',')[1];
            const realAsset = await saveAssetToCollection(currentUser.id, base64Data, {
                asset_type: assetData.asset_type,
                item_name: assetData.item_name,
                item_category: assetData.item_category,
            });
            setCollectionAssets(prevAssets =>
                prevAssets.map(asset => (asset.id === tempId ? realAsset : asset))
            );
        } catch (error) {
            console.error("Failed to save asset to collection in background:", error);
            setCollectionAssets(prevAssets => prevAssets.filter(asset => asset.id !== tempId));
        }
    })();
  };
  
  const handleDeleteAsset = async (assetToDelete: GeneratedAsset) => {
    if (deletingAssetId) return; // Prevent double clicks
    
    // Optimistic update
    const originalAssets = [...galleryAssets];
    setGalleryAssets(prev => prev.filter(asset => asset.id !== assetToDelete.id));
    setDeletingAssetId(assetToDelete.id);

    try {
        await deleteAsset(assetToDelete.id, assetToDelete.image_url);
    } catch (error) {
        console.error("Failed to delete asset:", error);
        // Rollback on error
        setGalleryAssets(originalAssets);
        setGalleryError("Could not delete the asset. Please try again.");
    } finally {
        setDeletingAssetId(null);
    }
  };

  const handleDeleteAssetFromCollection = async (assetToDelete: CollectionAsset) => {
    if (deletingCollectionAssetId) return; // Prevent double clicks
    
    // Optimistic update
    const originalAssets = [...collectionAssets];
    setCollectionAssets(prev => prev.filter(asset => asset.id !== assetToDelete.id));
    setDeletingCollectionAssetId(assetToDelete.id);

    try {
        await deleteAssetFromCollection(assetToDelete.id, assetToDelete.image_url);
    } catch (error) {
        console.error("Failed to delete asset from collection:", error);
        // Rollback on error
        setCollectionAssets(originalAssets);
        setCollectionError("Could not delete the asset. Please try again.");
    } finally {
        setDeletingCollectionAssetId(null);
    }
  };


  // Function to apply theme
  const applyTheme = (theme: 'light' | 'dark' | 'system') => {
    const root = document.documentElement;
    
    if (theme === 'system') {
      const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (systemPrefersDark) {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
    } else if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  };

  // Load theme preference
  const loadTheme = async (userId: string) => {
    try {
      const { data: profiles, error } = await supabase
        .from('profiles')
        .select('theme_preference')
        .eq('id', userId)
        .limit(1);

      if (error) {
        console.warn('Error loading theme:', error);
        return;
      }

      const profile = profiles?.[0];
      const theme = (profile?.theme_preference as 'light' | 'dark' | 'system') || 'system';
      applyTheme(theme);
    } catch (err) {
      console.error('Error loading theme:', err);
    }
  };

  // Effect 0: Set favicon dynamically
  useEffect(() => {
    const setFavicon = () => {
      const link = document.querySelector("link[rel~='icon']") as HTMLLinkElement;
      if (link) {
        link.href = '/logo.png';
      } else {
        const newLink = document.createElement('link');
        newLink.rel = 'icon';
        newLink.type = 'image/png';
        newLink.href = '/logo.png';
        document.getElementsByTagName('head')[0].appendChild(newLink);
      }
    };
    setFavicon();
  }, []);

  // Effect 1: Handle Auth State Changes. This is now more robust.
  useEffect(() => {
    // This function processes a session and updates user state. It's used for both initial load and subsequent changes.
    // isNewSignIn = true when this is a fresh sign-in (SIGNED_IN or INITIAL_SESSION)
    const processUserSession = async (
      session: import('@supabase/supabase-js').Session | null,
      isNewSignIn = false
    ) => {
        try {
            console.log('[Auth] processUserSession called', { isNewSignIn, hasSession: !!session });
            if (!session?.user) {
              // No user in session — clear state handled by caller
              return;
            }

            const { data: profiles, error: profileError } = await supabase
              .from('profiles')
              .select('username, avatar_url, theme_preference, signup_bonus_given')
              .eq('id', session.user.id)
              .limit(1);

            if (profileError) console.warn('Could not fetch user profile on auth change:', profileError.message);
            const profile = profiles?.[0];
            console.log('[Auth] fetched profile', { profile });

            // Detect new Google OAuth users and send welcome email + create profile
            const provider = session.user.app_metadata?.provider || session.user.identities?.[0]?.provider;
            const isGoogleUser = provider === 'google';
            const isNewUser = !profile?.signup_bonus_given;
            const createdAt = session.user?.created_at ? new Date(session.user.created_at) : null;
            const isRecentlyCreated = createdAt ? (Date.now() - createdAt.getTime()) < 30 * 60 * 1000 : false; // within 30 min

            console.log('[Auth] google-welcome-check', {
              provider,
              isGoogleUser,
              isNewUser,
              createdAt: createdAt?.toISOString(),
              isRecentlyCreated,
              hasHandledGoogleWelcome: hasHandledGoogleWelcome.current,
              userId: session.user.id,
              userEmail: session.user.email,
            });

            if (isNewSignIn && isGoogleUser && isNewUser && isRecentlyCreated && !hasHandledGoogleWelcome.current) {
              hasHandledGoogleWelcome.current = true;
              const googleUsername =
                session.user.user_metadata?.full_name ||
                session.user.user_metadata?.name ||
                session.user.email?.split('@')[0] ||
                'user';

              // Create profile with 10 sign-up bonus credits
              const now = new Date();
              const expiresAt = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
              supabase.from('profiles').upsert({
                id: session.user.id,
                username: profile?.username || googleUsername,
                plan_tier: 'free',
                plan_status: 'inactive',
                total_credits: 10,
                used_credits: 0,
                credits_expire_at: expiresAt.toISOString(),
                signup_bonus_given: true,
                last_credits_allocated_at: now.toISOString(),
              }, { onConflict: 'id' })
              .then(({ error }) => {
                if (error) console.warn('Could not create Google user profile:', error.message);
              });

              // Send welcome email (fire-and-forget) and log response
              fetch('/api/emails/send', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  type: 'welcome',
                  email: session.user.email,
                  username: googleUsername,
                }),
              })
                .then(async (res) => {
                  try {
                    const json = await res.json();
                    console.log('[Email] welcome send response', json);
                  } catch (err) {
                    console.warn('[Email] welcome send non-json response', err);
                  }
                })
                .catch((emailErr) => console.warn('Google welcome email send failed:', emailErr));
            }

            const userEmail = session.user.email ?? '';
            const user: User = {
                id: session.user.id,
                email: userEmail,
                username: profile?.username || userEmail || 'ghost_user',
                avatar: profile?.avatar_url
            };
            setCurrentUser(user);
            
            // Load and apply theme preference
            const theme = (profile?.theme_preference as 'light' | 'dark' | 'system') || 'system';
            applyTheme(theme);
        } else {
            setCurrentUser(null);
            // Reset to system theme on logout
            applyTheme('system');
        }
    };

    // First, check the session on initial load to prevent race conditions.
    supabase.auth.getSession().then(async ({ data: { session } }) => {
        await processUserSession(session, false); // false = not a new sign-in (just restoring session)
        setLoading(false); // Set loading to false only after the initial session check is complete.
    });

    // Then, subscribe to any future auth state changes (e.g., login, logout).
    // IMPORTANT: Google OAuth redirects fire INITIAL_SESSION, not SIGNED_IN
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
        const isNewAuth = event === 'SIGNED_IN' || event === 'INITIAL_SESSION';
        processUserSession(session, isNewAuth);

        if (event === 'PASSWORD_RECOVERY') {
            const hashParams = new URLSearchParams(window.location.hash.substring(1));
            const typeParam = hashParams.get('type');

            if (!hasHandledPasswordRecovery.current && typeParam === 'recovery') {
                hasHandledPasswordRecovery.current = true;
                navigate(PATHS.RESET_PASSWORD, { replace: true });
            }
        }

        if (event === 'SIGNED_OUT' || event === 'SIGNED_IN') {
            hasHandledPasswordRecovery.current = false;
        }
    });

    return () => {
        subscription.unsubscribe();
    };
  }, [navigate]); // Include navigate to avoid stale closures.


  // Effect 2: Handle routing, data fetching, and other side effects based on auth state
  useEffect(() => {
    // This guard is crucial. It prevents any logic from running until the initial, robust auth check is complete.
    if (loading) {
      return;
    }

    const isPublicPath = location.pathname === PATHS.LANDING || location.pathname === PATHS.AUTH;
    const isResetPasswordPage = location.pathname === PATHS.RESET_PASSWORD;
    const isPrivacyPolicyPage = location.pathname === PATHS.PRIVACY_POLICY;
    const isTermsAndConditionsPage = location.pathname === PATHS.TERMS_AND_CONDITIONS;
    const isContactPage = location.pathname === PATHS.CONTACT;

    if (currentUser) {
      // User is logged in, fetch their data.
      fetchGalleryAssets(currentUser.id);
      fetchCollectionAssets(currentUser.id);

      // If user is on a public page (e.g., after login), redirect them appropriately.
      // BUT: Don't redirect from reset-password, privacy-policy, terms-and-conditions, or contact pages
      if (isPublicPath && !isResetPasswordPage && !isPrivacyPolicyPage && !isTermsAndConditionsPage && !isContactPage) {
        const redirectPath = sessionStorage.getItem('zola_redirect_path');
        sessionStorage.removeItem('zola_redirect_path');
        const targetPath = redirectPath && redirectPath !== PATHS.RESET_PASSWORD ? redirectPath : PATHS.HOME;
        navigate(targetPath, { replace: true });
      }

    } else {
      // User is not logged in.
      setGalleryAssets([]);
      setHasFetchedGallery(false);
      setCollectionAssets([]);
      setHasFetchedCollection(false);

      // If user tries to access a private page, save the path and redirect to landing.
      // BUT: Allow access to reset-password, privacy-policy, terms-and-conditions, and contact pages
      if (!isPublicPath && !isResetPasswordPage && !isPrivacyPolicyPage && !isTermsAndConditionsPage && !isContactPage) {
        sessionStorage.setItem('zola_redirect_path', location.pathname);
        navigate(PATHS.LANDING, { replace: true });
      } else if (isResetPasswordPage || isPrivacyPolicyPage || isTermsAndConditionsPage || isContactPage) {
        sessionStorage.removeItem('zola_redirect_path');
      }
    }
  }, [currentUser, location.pathname, loading, navigate, fetchGalleryAssets, fetchCollectionAssets]);


  const handleLogout = async (e?: React.MouseEvent) => {
    // Prevent event bubbling and default behavior
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    // Prevent double-clicks
    if (isLoggingOut) {
      return;
    }

    setIsLoggingOut(true);

    try {
      // First, check if there's a valid session
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session) {
        // If session exists, try to sign out with global scope (signs out from all devices)
        const { error } = await supabase.auth.signOut({ scope: 'global' });
        if (error) {
          // If global signout fails, try local signout (clears only this device)
          console.warn('Global signout failed, trying local signout:', error.message);
          const { error: localError } = await supabase.auth.signOut({ scope: 'local' });
          if (localError) {
            console.warn('Local signout also failed:', localError.message);
          }
        }
      } else {
        // No session exists, just clear local state
        console.log('No active session found, clearing local state only');
        // Clear local auth state manually
        await supabase.auth.signOut({ scope: 'local' });
      }
    } catch (err) {
      // Even if signout fails, we should still clear local state and navigate
      console.warn('Error during logout, clearing local state:', err);
      try {
        // Attempt local signout as fallback
        await supabase.auth.signOut({ scope: 'local' });
      } catch (fallbackErr) {
        console.warn('Fallback local signout failed:', fallbackErr);
      }
    }

    // Always clear local state and navigate, regardless of API call success
    try {
      // Clear user-specific state from localStorage
      if (currentUser) {
        // Clear any user-specific localStorage items
        const keys = Object.keys(localStorage);
        keys.forEach(key => {
          if (key.includes(currentUser.id) || key.startsWith('sb-')) {
            localStorage.removeItem(key);
          }
        });
      }
      
      // Clear sessionStorage
      sessionStorage.clear();
      
      // Clear state
      setCurrentUser(null);
      setGalleryAssets([]);
      setCollectionAssets([]);
      setHasFetchedGallery(false);
      setHasFetchedCollection(false);
    } catch (clearErr) {
      console.warn('Error clearing local state:', clearErr);
    }

    // Always navigate to landing page
    navigate(PATHS.LANDING, { replace: true });
    
    // Reset logging out state after a short delay
    setTimeout(() => {
      setIsLoggingOut(false);
    }, 500);
  };
  
  if (loading) {
    return (
      <div className="w-screen h-screen flex items-center justify-center">
        <Spinner />
      </div>
    );
  }

  return (
    <>
      <Routes>
        <Route path={PATHS.RESET_PASSWORD} element={<ResetPasswordPage />} />
        <Route path={PATHS.PRIVACY_POLICY} element={<PrivacyPolicyPage />} />
        <Route path={PATHS.TERMS_AND_CONDITIONS} element={<TermsAndConditionsPage />} />
        <Route path={PATHS.CONTACT} element={<ContactPage />} />
        {currentUser ? (
          <>
              {/* Routes with the main sidebar layout */}
              <Route 
                  element={
                      <Layout 
                          user={currentUser} 
                          onLogout={handleLogout}
                      />
                  }
              >
                  <Route path={PATHS.HOME} element={<HomePage user={currentUser} />} />
                  <Route path="/home" element={<Navigate to={PATHS.HOME} replace />} />
                  <Route path={PATHS.VIRTUAL_PHOTOSHOOT} element={<TryOnPage user={currentUser} onSave={handleAssetSaved} />} />
                  <Route path={PATHS.STYLE_SCENE} element={<StyleScenePage user={currentUser} />} />
                  <Route path={PATHS.ASSET_GENERATOR} element={<AssetGeneratorPage user={currentUser} onSaveToCollection={handleSaveToCollection} />} />
                  <Route path={PATHS.CATALOG_FORGED} element={<CatalogForgedPage user={currentUser} onSaveToCollection={handleSaveToCollection} />} />
                  <Route path={PATHS.POSE_MIMIC} element={<PoseMimicPage user={currentUser} onSave={handleAssetSaved} />} />
                  <Route path={PATHS.GALLERY} element={
                      <GalleryPage
                          user={currentUser}
                          assets={galleryAssets}
                          isLoading={isGalleryLoading}
                          error={galleryError}
                          onRefresh={() => fetchGalleryAssets(currentUser!.id, true)}
                          onDelete={handleDeleteAsset}
                          deletingAssetId={deletingAssetId}
                      />
                  } />
                  <Route path={PATHS.ASSET_COLLECTION} element={
                      <AssetCollectionPage
                          user={currentUser}
                          assets={collectionAssets}
                          isLoading={isCollectionLoading}
                          error={collectionError}
                          onRefresh={() => fetchCollectionAssets(currentUser!.id, true)}
                          onDelete={handleDeleteAssetFromCollection}
                          deletingAssetId={deletingCollectionAssetId}
                      />
                  } />
                  <Route path={PATHS.PRICING} element={<PricingPage />} />
                  <Route path={PATHS.PROFILE} element={<ProfilePage user={currentUser} />} />
                  <Route path={PATHS.SETTINGS} element={<SettingsPage user={currentUser} />} />
                  <Route path={PATHS.ABOUT} element={<AboutPage />} />
                  <Route path={PATHS.USAGE_ANALYTICS} element={<UsageAnalyticsPage user={currentUser} />} />
                  {/* Catch-all for logged-in users shows a 404 within the app layout */}
                  <Route path="*" element={<NotFoundPage />} />
              </Route>

              {/* Special routes without the main layout */}
              <Route path={PATHS.MODEL_GALLERY} element={<ModelGalleryPage onBack={() => navigate(-1)} />} />
              <Route path={PATHS.BACKGROUND_GALLERY} element={<BackgroundGalleryPage onBack={() => navigate(-1)} />} />

          </>
        ) : (
          <>
              <Route path={PATHS.AUTH} element={<AuthPage />} />
              <Route path={PATHS.LANDING} element={<LandingPage />} />
              <Route path="*" element={<Navigate to={PATHS.LANDING} replace />} />
          </>
        )}
      </Routes>
    <CookieConsentBanner />
    <Analytics />
    </>
  );
};

export default App;