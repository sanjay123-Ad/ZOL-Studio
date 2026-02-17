import React, { useState, useRef, useEffect, useCallback } from 'react';
import { User, ImageFile } from '../types';
import { generateProductQualityForge } from '../services/productQualityForgeService';
import { deductCredits, hasEnoughCredits } from '../services/creditService';
import { saveState, loadState, removeState } from '../services/stateStore';
import { saveImage, getImage, deleteImage } from '../services/imageStore';
import {
  uploadProductQualityForgeImage,
  getSignedUrlsForProductQualityForge,
  deleteUserProductQualityForgeFolder
} from '../services/db';
import { logBatchUsage } from '../services/usageTrackingService';
import { GarmentIcon, DownloadIcon, ExpandIcon } from '../components/icons';
import Spinner from '../components/Spinner';
import { motion, AnimatePresence } from 'framer-motion';

declare var JSZip: any;

interface CatalogForgedPageProps {
  user: User;
  onSaveToCollection?: (data: { imageUrl: string, asset_type: 'individual' | 'composed', item_name: string, item_category: string }) => void;
}

const BATCH_LIMIT = 12;
/** Upper garment reference options - user can switch between these */
const UPPER_REFERENCE_URLS = [
  'https://i.postimg.cc/DzmQk3R8/Reference-1.jpg',
  'https://i.postimg.cc/pLc8B1rD/Reference-2.jpg',
  'https://i.postimg.cc/3NZ00tzB/Reference-3.jpg',
  'https://i.postimg.cc/cLk98hSH/Reference-4.jpg',
];
/** Lower garment reference options - user can switch between these */
const LOWER_REFERENCE_URLS = [
  'https://i.postimg.cc/TP91Tt55/Ref-1.jpg',
  'https://i.postimg.cc/28Z51kBB/Ref-2.jpg',
  'https://i.postimg.cc/P5brMSy5/Ref-3.jpg',
  'https://i.postimg.cc/Z5Lvqb1K/Ref-4.jpg',
];
const CREDITS_PER_IMAGE = 1; // 1 credit per forged image

/** Converts API error messages into clear, actionable guidance for the user */
function getGenerationErrorMessage(rawMessage: string, garmentType: 'upper' | 'lower'): string {
  const lower = rawMessage.toLowerCase();
  if (lower.includes('quota') || lower.includes('429') || lower.includes('resource_exhausted')) {
    return 'API limit reached. Please try again later or check your plan.';
  }
  if (lower.includes('source') || lower.includes('visible') || lower.includes('clearly')) {
    return `Ensure your ${garmentType === 'upper' ? 'shirt/top' : 'pant'} is clearly visible, well-lit, and isolated. Remove hands, mannequins, or busy backgrounds for best results.`;
  }
  if (lower.includes('failed to generate') || lower.includes('did not return')) {
    return 'Generation failed. Try a clearer source image: good lighting, single garment, minimal background.';
  }
  if (lower.includes('network') || lower.includes('fetch')) {
    return 'Network error. Check your connection and try again.';
  }
  return rawMessage.length > 120 ? rawMessage.slice(0, 120) + '...' : rawMessage;
}

interface CarouselImage {
  id: string;
  imageUrl: string;
}

const CAROUSEL_IMAGES: CarouselImage[] = [
  { id: '1', imageUrl: 'https://i.postimg.cc/7P5c4vmH/forged-IMG-20251219-WA0004.jpg' },
  { id: '2', imageUrl: 'https://i.postimg.cc/7Zt0wRK1/forged-Whats-App-Image-2025-11-05-at-19-13-42-0722423b.jpg' },
  { id: '3', imageUrl: 'https://i.postimg.cc/RhvNc1PH/forged-IMG-20251219-WA0001.jpg' },
  { id: '4', imageUrl: 'https://i.postimg.cc/HsRTm4Q9/forged-IMG-20251219-WA0005.jpg' },
  { id: '5', imageUrl: 'https://i.postimg.cc/XYPWLNzq/Gemini-Generated-Image-fy7c66fy7c66fy7c.png' },
  { id: '6', imageUrl: 'https://i.postimg.cc/6phwZskg/forge-IMG-20251219-WA0003.jpg' },
  { id: '7', imageUrl: 'https://i.postimg.cc/85CLpmhb/T-shirt.jpg' },
];

const ProductCarousel: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const rotate = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % CAROUSEL_IMAGES.length);
  }, []);

  useEffect(() => {
    const timer = setInterval(rotate, 3000);
    return () => clearInterval(timer);
  }, [rotate]);

  const getVisibleImages = () => {
    const imageCount = CAROUSEL_IMAGES.length;
    const items = [];

    for (let i = -3; i <= 3; i++) {
      const index = (currentIndex + i + imageCount) % imageCount;
      items.push({
        image: CAROUSEL_IMAGES[index],
        offset: i
      });
    }
    return items;
  };

  return (
    <div className="relative w-full h-[600px] flex items-center justify-center overflow-visible select-none mb-12">
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-[400px] h-[500px] bg-indigo-900/5 blur-[120px] rounded-full translate-y-20 opacity-60"></div>
      </div>

      <AnimatePresence mode="popLayout">
        {getVisibleImages().map(({ image, offset }) => {
          const isCenter = offset === 0;
          const absOffset = Math.abs(offset);

          const x = offset * 260;
          const y = absOffset * 50;
          const rotateZ = offset * 12;
          const scale = 1 - absOffset * 0.15;
          const zIndex = 50 - absOffset * 10;
          const opacity = 1 - absOffset * 0.25;

          return (
            <motion.div
              key={image.id}
              initial={false}
              animate={{
                x,
                y,
                rotate: rotateZ,
                scale,
                zIndex,
                opacity
              }}
              transition={{
                type: 'spring',
                stiffness: 200,
                damping: 30
              }}
              className="absolute w-[300px] h-[450px] rounded-3xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.15)] cursor-pointer bg-gray-100 dark:bg-gray-800 group"
              onClick={() => setCurrentIndex((prev) => (prev + offset + CAROUSEL_IMAGES.length) % CAROUSEL_IMAGES.length)}
            >
              <img
                src={image.imageUrl}
                alt="Product showcase"
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />

              {isCenter && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="absolute inset-0 border-4 border-indigo-500/20 rounded-3xl pointer-events-none"
                />
              )}
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
};

type ForgeFile = {
  id: string;
  file: File;
  preview: string;
  generatedImage: string | null; // Signed URL for display
  generatedPath?: string; // Supabase storage path
  status: 'queued' | 'processing' | 'success' | 'error';
  error: string | null;
};

const fileToImageFile = (file: File): Promise<ImageFile> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      if (!dataUrl) return reject(new Error("Failed to read file."));
      const base64 = dataUrl.split(',')[1];
      resolve({ dataUrl, base64, mimeType: file.type });
    };
    reader.onerror = (error) => reject(error);
    reader.readAsDataURL(file);
  });
};

const urlToImageFile = async (url: string): Promise<ImageFile> => {
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Failed to fetch internal reference image: ${response.statusText}`);
    const blob = await response.blob();
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const dataUrl = reader.result as string;
        if (!dataUrl) return reject(new Error("FileReader failed to produce a data URL."));
        const base64 = dataUrl.split(',')[1];
        resolve({ dataUrl, base64, mimeType: blob.type });
      };
      reader.onerror = (error) => reject(error);
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    console.error("Failed to convert URL to ImageFile", error);
    throw error;
  }
};

const CatalogForgedPage: React.FC<CatalogForgedPageProps> = ({ user }) => {
  const [sourceFiles, setSourceFiles] = useState<ForgeFile[]>([]);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [hasStarted, setHasStarted] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isStateLoading, setIsStateLoading] = useState(true);
  const [fullscreenImage, setFullscreenImage] = useState<string | null>(null);
  const [garmentType, setGarmentType] = useState<'upper' | 'lower'>('upper'); // Toggle between upper (t-shirt) and lower (pant)
  const [upperReferenceIndex, setUpperReferenceIndex] = useState(0); // Which upper reference (0–3) is selected
  const [lowerReferenceIndex, setLowerReferenceIndex] = useState(0); // Which lower reference (0–3) is selected
  const fileInputRef = useRef<HTMLInputElement>(null);
  const closedViaBackButton = useRef<boolean>(false);

  const SESSION_STORAGE_KEY = `productQualityForgeState_${user.id}`;
  const SOURCE_FILES_KEY = `productQualityForge_files_${user.id}`;
  // Reference image key includes garment type to prevent using wrong cached image
  const getReferenceImageKey = (type: 'upper' | 'lower') => `productQualityForge_reference_${type}_${user.id}`;

  // Store only file paths in state, not image data
  interface SavedState {
    hasStarted: boolean;
    sourceFileIds: string[];
    generatedImagePaths: Record<string, string>; // fileId -> Supabase path
    fileStatuses: Record<string, string>;
    fileErrors: Record<string, string | null>;
    garmentType?: 'upper' | 'lower'; // Save garment type selection
    upperReferenceIndex?: number; // Which upper reference (0–3) is selected
    lowerReferenceIndex?: number; // Which lower reference (0–3) is selected
  }

  const getReferenceUrl = () =>
    garmentType === 'upper'
      ? (UPPER_REFERENCE_URLS[upperReferenceIndex] ?? UPPER_REFERENCE_URLS[0])
      : (LOWER_REFERENCE_URLS[lowerReferenceIndex] ?? LOWER_REFERENCE_URLS[0]);

  // Load state on mount
  useEffect(() => {
    const loadSavedState = async () => {
      setIsStateLoading(true);
      try {
        const savedState = loadState<SavedState>(SESSION_STORAGE_KEY);
        if (savedState) {
          setHasStarted(savedState.hasStarted || false);
          setGarmentType(savedState.garmentType || 'upper'); // Restore garment type selection
          setUpperReferenceIndex(
            typeof savedState.upperReferenceIndex === 'number' && savedState.upperReferenceIndex >= 0 && savedState.upperReferenceIndex < UPPER_REFERENCE_URLS.length
              ? savedState.upperReferenceIndex
              : 0
          );
          setLowerReferenceIndex(
            typeof savedState.lowerReferenceIndex === 'number' && savedState.lowerReferenceIndex >= 0 && savedState.lowerReferenceIndex < LOWER_REFERENCE_URLS.length
              ? savedState.lowerReferenceIndex
              : 0
          );

          // Load source files from IndexedDB
          if (savedState.sourceFileIds && Array.isArray(savedState.sourceFileIds)) {
            const loadedFiles: ForgeFile[] = [];

            // Get generated image paths from Supabase if they exist
            const generatedPaths = Object.values(savedState.generatedImagePaths || {});
            const generatedUrlMap = generatedPaths.length > 0
              ? await getSignedUrlsForProductQualityForge(generatedPaths)
              : new Map();

            for (const fileId of savedState.sourceFileIds) {
              const imageData = await getImage(`${SOURCE_FILES_KEY}_${fileId}`);
              if (imageData) {
                // Recreate file object from ImageFile
                const file = dataURLtoFile(imageData.dataUrl, `restored-${fileId}.png`);
                const generatedPath = savedState.generatedImagePaths?.[fileId];
                const generatedImageUrl = generatedPath ? generatedUrlMap.get(generatedPath) : null;

                loadedFiles.push({
                  id: fileId,
                  file,
                  preview: imageData.dataUrl,
                  generatedImage: generatedImageUrl || null,
                  generatedPath: generatedPath || undefined,
                  status: (savedState.fileStatuses?.[fileId] as any) || 'queued',
                  error: savedState.fileErrors?.[fileId] || null,
                });
              }
            }
            setSourceFiles(loadedFiles);
          }
        }
      } catch (err) {
        console.error("Failed to load saved state", err);
      } finally {
        setIsStateLoading(false);
      }
    };

    loadSavedState();
  }, [user.id, SESSION_STORAGE_KEY, SOURCE_FILES_KEY]);

  // Periodically refresh signed URLs to prevent expiration (every 12 hours)
  useEffect(() => {
    if (!hasStarted || sourceFiles.length === 0) return;

    const refreshInterval = setInterval(async () => {
      const filesNeedingRefresh = sourceFiles.filter(f =>
        f.status === 'success' && f.generatedPath
      );

      if (filesNeedingRefresh.length > 0) {
        const paths = filesNeedingRefresh.map(f => f.generatedPath!);
        try {
          const urlMap = await getSignedUrlsForProductQualityForge(paths);

          setSourceFiles(prev => prev.map(f => {
            if (f.status === 'success' && f.generatedPath && urlMap.has(f.generatedPath)) {
              return { ...f, generatedImage: urlMap.get(f.generatedPath) || f.generatedImage };
            }
            return f;
          }));
        } catch (err) {
          console.error('Failed to refresh URLs:', err);
        }
      }
    }, 12 * 60 * 60 * 1000); // Refresh every 12 hours (URLs are valid for 24 hours)

    return () => clearInterval(refreshInterval);
  }, [hasStarted, sourceFiles]);

  // Handle ESC key and browser back button to close fullscreen modal
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && fullscreenImage) {
        closedViaBackButton.current = false;
        setFullscreenImage(null);
      }
    };

    const handlePopState = (e: PopStateEvent) => {
      if (fullscreenImage) {
        // Close modal when back button is pressed
        closedViaBackButton.current = true;
        setFullscreenImage(null);
      }
    };

    if (fullscreenImage) {
      closedViaBackButton.current = false;
      document.addEventListener('keydown', handleEscape);
      window.addEventListener('popstate', handlePopState);
      document.body.style.overflow = 'hidden'; // Prevent background scrolling

      // Push state to history so back button closes modal instead of navigating
      // This creates a history entry that we can intercept
      window.history.pushState({ modalOpen: true }, '', window.location.href);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      window.removeEventListener('popstate', handlePopState);
      if (!fullscreenImage) {
        document.body.style.overflow = 'unset';
      }
    };
  }, [fullscreenImage]);

  // Clean up history when modal closes normally (not via back button)
  useEffect(() => {
    if (!fullscreenImage && !closedViaBackButton.current && window.history.state?.modalOpen) {
      // Modal was closed via button/click, remove the history entry we added
      window.history.replaceState(null, '', window.location.href);
    }
  }, [fullscreenImage]);

  // Ensure images remain visible after modal closes
  useEffect(() => {
    if (!fullscreenImage) {
      // When modal closes, ensure all images are visible
      setSourceFiles(prev => prev.map(f => {
        if (f.status === 'success' && f.generatedImage && f.generatedPath) {
          // Ensure the image URL is preserved
          return { ...f };
        }
        return f;
      }));
    }
  }, [fullscreenImage]);

  // Save state on change
  useEffect(() => {
    if (isStateLoading) return;

    const saveCurrentState = async () => {
      try {
        // Save source files to IndexedDB (small files, OK to keep locally)
        const sourceFileIds: string[] = [];
        const generatedImagePaths: Record<string, string> = {}; // Store Supabase paths, not image data
        const fileStatuses: Record<string, string> = {};
        const fileErrors: Record<string, string | null> = {};

        for (const f of sourceFiles) {
          sourceFileIds.push(f.id);
          fileStatuses[f.id] = f.status;
          fileErrors[f.id] = f.error || null;

          // Save source file image to IndexedDB (small preview)
          const sourceImageFile = await fileToImageFile(f.file);
          await saveImage(`${SOURCE_FILES_KEY}_${f.id}`, sourceImageFile);

          // Store Supabase path if generated image exists
          if (f.generatedPath) {
            generatedImagePaths[f.id] = f.generatedPath;
          }
        }

        const stateToSave: SavedState = {
          hasStarted,
          sourceFileIds,
          generatedImagePaths, // Only paths, not image data
          fileStatuses,
          fileErrors,
          garmentType, // Save garment type selection
          upperReferenceIndex,
          lowerReferenceIndex,
        };
        saveState(SESSION_STORAGE_KEY, stateToSave);
      } catch (error) {
        console.error("Failed to save state", error);
        // Don't throw - state saving shouldn't break the app
      }
    };

    saveCurrentState();
  }, [isStateLoading, sourceFiles, hasStarted, garmentType, upperReferenceIndex, lowerReferenceIndex, user.id, SESSION_STORAGE_KEY, SOURCE_FILES_KEY]);

  const dataURLtoFile = (dataUrl: string, filename: string): File => {
    const arr = dataUrl.split(',');
    const mime = arr[0].match(/:(.*?);/)?.[1] || 'image/png';
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new File([u8arr], filename, { type: mime });
  };

  const handleFilesChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = event.target.files;
    if (!selectedFiles) return;

    const newFiles: ForgeFile[] = (Array.from(selectedFiles) as File[])
      .filter(file => file.type.startsWith('image/'))
      .slice(0, BATCH_LIMIT - sourceFiles.length)
      .map(file => ({
        id: `${file.name}-${Date.now()}-${Math.random()}`,
        file,
        preview: URL.createObjectURL(file),
        generatedImage: null,
        status: 'queued',
        error: null,
      }));

    setSourceFiles(prev => [...prev, ...newFiles]);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const removeFile = (id: string) => {
    setSourceFiles(prev => {
      const file = prev.find(f => f.id === id);
      if (file) {
        URL.revokeObjectURL(file.preview);
        deleteImage(`${SOURCE_FILES_KEY}_${id}`);
        deleteImage(`${SOURCE_FILES_KEY}_generated_${id}`);
      }
      return prev.filter(f => f.id !== id);
    });
  };

  /** Retry a single failed item — runs generation immediately */
  const handleRetrySingle = async (id: string) => {
    const f = sourceFiles.find(x => x.id === id);
    if (!f || f.status !== 'error') return;

    const hasCredits = await hasEnoughCredits(user.id, CREDITS_PER_IMAGE);
    if (!hasCredits) {
      setError('Insufficient credits to retry. Please add more credits.');
      return;
    }

    setIsProcessing(true);
    setError(null);
    setSourceFiles(prev => prev.map(item => item.id === id ? { ...item, status: 'processing' as const, error: null } : item));

    try {
      const referenceUrl = getReferenceUrl();
      const referenceImage = await urlToImageFile(referenceUrl);
      await saveImage(getReferenceImageKey(garmentType), referenceImage);

      const sourceImageFile = await fileToImageFile(f.file);
      const resultBase64 = await generateProductQualityForge(sourceImageFile, referenceImage, garmentType, user.id);

      const imagePath = await uploadProductQualityForgeImage(user.id, f.id, resultBase64);
      const urlMap = await getSignedUrlsForProductQualityForge([imagePath]);
      const signedUrl = urlMap.get(imagePath) || `data:image/png;base64,${resultBase64}`;

      const creditResult = await deductCredits(user.id, CREDITS_PER_IMAGE, 'product_quality_forge');
      if (!creditResult.success) {
        throw new Error(creditResult.error || 'Failed to deduct credits');
      }

      setSourceFiles(prev => {
        const updated = prev.map(item => item.id === id ? {
          ...item,
          status: 'success' as const,
          generatedImage: signedUrl,
          generatedPath: imagePath
        } : item);
        const state = loadState<SavedState>(SESSION_STORAGE_KEY) || { hasStarted: true, sourceFileIds: [], generatedImagePaths: {}, fileStatuses: {}, fileErrors: {} };
        state.generatedImagePaths[f.id] = imagePath;
        saveState(SESSION_STORAGE_KEY, state);
        return updated;
      });
    } catch (err) {
      const errMsg = (err as Error).message || 'Forge failed.';
      const userFriendlyMsg = getGenerationErrorMessage(errMsg, garmentType);
      setSourceFiles(prev => prev.map(item => item.id === id ? { ...item, status: 'error' as const, error: userFriendlyMsg } : item));
    } finally {
      setIsProcessing(false);
    }
  };

  // Refresh expired signed URLs - returns new URL when successful
  const refreshImageUrl = async (fileId: string, imagePath: string): Promise<string | null> => {
    try {
      const urlMap = await getSignedUrlsForProductQualityForge([imagePath]);
      const newUrl = urlMap.get(imagePath) || null;
      if (newUrl) {
        setSourceFiles(prev => prev.map(f =>
          f.id === fileId ? { ...f, generatedImage: newUrl } : f
        ));
        return newUrl;
      }
    } catch (err) {
      console.error('Failed to refresh image URL:', err);
    }
    return null;
  };

  // Handle image load error and refresh URL
  const handleImageError = async (fileId: string, imagePath: string | undefined, imgElement: HTMLImageElement) => {
    if (!imagePath) {
      setSourceFiles(prev => prev.map(f =>
        f.id === fileId ? { ...f, status: 'error', error: 'Image not available' } : f
      ));
      return;
    }

    imgElement.style.opacity = '0';
    const newUrl = await refreshImageUrl(fileId, imagePath);

    if (newUrl) {
      imgElement.src = newUrl;
      imgElement.style.opacity = '1';
    } else {
      imgElement.style.display = 'none';
      setSourceFiles(prev => prev.map(f =>
        f.id === fileId ? { ...f, status: 'error', error: 'Image URL expired. Please refresh the page.' } : f
      ));
    }
  };

  const handleGenerate = async () => {
    if (sourceFiles.length === 0) {
      setError('Please upload at least one Source Garment.');
      return;
    }

    // Only process queued items (not success or error)
    const filesToProcess = sourceFiles.filter(f => f.status !== 'success' && f.status !== 'error');
    if (filesToProcess.length === 0) {
      setError('No items to process. All images have already been generated or failed.');
      return;
    }

    // Check credits for items we will actually process
    const totalCreditsNeeded = filesToProcess.length * CREDITS_PER_IMAGE;
    const hasCredits = await hasEnoughCredits(user.id, totalCreditsNeeded);

    if (!hasCredits) {
      setError(`Insufficient credits. You need ${totalCreditsNeeded} credits to process ${filesToProcess.length} image(s).`);
      return;
    }

    setIsProcessing(true);
    setHasStarted(true);
    setError(null);

    let totalInputImages = 0;
    let totalInputChars = 0;
    let totalOutputImages = 0;
    let successfulCount = 0;

    try {
      // Fetch the internal high-fidelity style reference based on garment type and selection
      const referenceUrl = getReferenceUrl();

      // Always fetch fresh reference image (don't use cache) to ensure correct garment type
      const referenceImage = await urlToImageFile(referenceUrl);

      // Save with garment-type-specific key
      await saveImage(getReferenceImageKey(garmentType), referenceImage);

      // Process one by one (sequential) for reliability
      for (const f of filesToProcess) {
        setSourceFiles(prev => prev.map(item => item.id === f.id ? { ...item, status: 'processing' } : item));

        try {
          const sourceImageFile = await fileToImageFile(f.file);
          totalInputImages += 2; // source + reference
          totalInputChars += 2500; // actual prompt length is approx 2500 chars

          const resultBase64 = await generateProductQualityForge(sourceImageFile, referenceImage, garmentType, user.id);

          totalOutputImages += 1;
          successfulCount += 1;

          // Upload generated image to Supabase storage
          const imagePath = await uploadProductQualityForgeImage(user.id, f.id, resultBase64);

          // Get signed URL for immediate display
          const urlMap = await getSignedUrlsForProductQualityForge([imagePath]);
          const signedUrl = urlMap.get(imagePath) || `data:image/png;base64,${resultBase64}`;

          // Deduct credits for successful generation
          const creditResult = await deductCredits(user.id, CREDITS_PER_IMAGE, 'product_quality_forge');
          if (!creditResult.success) {
            throw new Error(creditResult.error || 'Failed to deduct credits');
          }

          // Update state with signed URL and save path to localStorage
          setSourceFiles(prev => {
            const updated = prev.map(item => item.id === f.id ? {
              ...item,
              status: 'success',
              generatedImage: signedUrl,
              generatedPath: imagePath
            } : item);

            const state = loadState<SavedState>(SESSION_STORAGE_KEY) || {
              hasStarted: true,
              sourceFileIds: [],
              generatedImagePaths: {},
              fileStatuses: {},
              fileErrors: {}
            };
            state.generatedImagePaths[f.id] = imagePath;
            saveState(SESSION_STORAGE_KEY, state);

            return updated;
          });
        } catch (err) {
          console.error(err);
          const errMsg = (err as Error).message || 'Forge failed.';
          const userFriendlyMsg = getGenerationErrorMessage(errMsg, garmentType);
          setSourceFiles(prev => prev.map(item => item.id === f.id ? { ...item, status: 'error', error: userFriendlyMsg } : item));
        }
      }

      // Log batch usage after all processing
      if (successfulCount > 0) {
        logBatchUsage(
          user.id,
          'Product Quality Forge',
          totalInputImages,
          totalInputChars,
          totalOutputImages,
          true // Gemini 3 Pro
        ).catch(console.error);
      }

    } catch (err) {
      setError("System could not load the fidelity blueprint. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownloadImage = async (imageUrl: string, fileName: string) => {
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `forged-${fileName.replace(/(\.[\w\d_-]+)$/i, '.png')}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Failed to download image:', err);
      alert('Failed to download image. Please try again.');
    }
  };

  const handleDownloadAll = async () => {
    try {
      const zip = new JSZip();
      const successItems = sourceFiles.filter(f => f.status === 'success' && f.generatedImage);

      if (successItems.length === 0) return;

      for (const item of successItems) {
        const res = await fetch(item.generatedImage!);
        const blob = await res.blob();
        zip.file(`forge-${item.file.name.replace(/(\.[\w\d_-]+)$/i, '.png')}`, blob);
      }

      const content = await zip.generateAsync({ type: 'blob' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(content);
      link.download = `pro-forge-batch-${Date.now()}.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (e) {
      console.error(e);
      alert("Failed to create ZIP.");
    }
  };

  const handleStartOver = async () => {
    sourceFiles.forEach(f => {
      URL.revokeObjectURL(f.preview);
      deleteImage(`${SOURCE_FILES_KEY}_${f.id}`);
    });

    // Delete Supabase folder
    try {
      await deleteUserProductQualityForgeFolder(user.id);
    } catch (err) {
      console.error("Failed to delete Supabase folder", err);
    }

    setSourceFiles([]);
    setHasStarted(false);
    setError(null);
    removeState(SESSION_STORAGE_KEY);
  };

  if (isStateLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-sky-50 via-white to-white">
        <div className="text-center">
          <Spinner />
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading your session...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center p-4 sm:p-6 lg:p-8 bg-gradient-to-b from-sky-50 via-white to-white dark:from-gray-900 dark:via-gray-900 dark:to-gray-900 transition-colors duration-200">
      <main className="w-full max-w-7xl">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 mb-2 bg-sky-600 text-white px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
            </span>
            AI Pro Workspace
          </div>
          <h1 className="text-display font-bold text-gray-900 dark:text-white font-headline">Product Quality Forge</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2 text-lg italic">Batch-process high-fidelity catalog assets using our Pro Fidelity Blueprint.</p>
        </div>

        {/* Product Carousel Animation */}
        <ProductCarousel />

        {/* Garment Type Toggle */}
        <div className="max-w-4xl mx-auto mb-6">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700 shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1">Garment Type</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Select the type of garment you're processing
                  {garmentType === 'upper' && <span className="ml-2 text-sky-600 font-semibold">• Reference {upperReferenceIndex + 1} selected</span>}
                  {garmentType === 'lower' && <span className="ml-2 text-sky-600 font-semibold">• Reference {lowerReferenceIndex + 1} selected</span>}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => {
                    setGarmentType('upper');
                    deleteImage(getReferenceImageKey('lower'));
                  }}
                  className={`px-6 py-3 rounded-xl font-semibold text-sm transition-all ${garmentType === 'upper'
                    ? 'bg-sky-600 text-white shadow-lg'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}
                >
                  Upper (T-Shirt)
                </button>
                <button
                  onClick={() => {
                    setGarmentType('lower');
                    deleteImage(getReferenceImageKey('upper')); // Clear upper cache when switching to lower
                  }}
                  className={`px-6 py-3 rounded-xl font-semibold text-sm transition-all ${garmentType === 'lower'
                    ? 'bg-sky-600 text-white shadow-lg'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}
                >
                  Lower (Pant)
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Upper Reference Selector - visible only when Upper is selected */}
        {garmentType === 'upper' && (
          <div className="max-w-4xl mx-auto mb-6">
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700 shadow-md">
              <h3 className="text-sm font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-2">Reference Style (Upper)</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">Choose which reference to use for your forged output</p>
              <div className="flex flex-wrap gap-4">
                {UPPER_REFERENCE_URLS.map((url, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setUpperReferenceIndex(idx);
                      deleteImage(getReferenceImageKey('upper'));
                    }}
                    className={`relative aspect-[3/4] w-24 sm:w-28 rounded-xl overflow-hidden border-2 transition-all ${
                      upperReferenceIndex === idx
                        ? 'border-sky-600 dark:border-sky-500 ring-2 ring-sky-200 dark:ring-sky-800 shadow-lg'
                        : 'border-gray-200 dark:border-gray-600 hover:border-sky-400 dark:hover:border-sky-500'
                    }`}
                  >
                    <img src={url} alt={`Reference ${idx + 1}`} className="w-full h-full object-cover" />
                    <div className={`absolute inset-0 flex items-center justify-center ${upperReferenceIndex === idx ? 'bg-sky-600/20' : 'bg-black/0'} transition-colors`}>
                      {upperReferenceIndex === idx && (
                        <span className="bg-sky-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">Selected</span>
                      )}
                    </div>
                    <div className="absolute bottom-1 left-1 right-1 text-center">
                      <span className="text-[10px] font-bold text-white drop-shadow-lg bg-black/50 px-1 rounded">Ref {idx + 1}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Lower Reference Selector - visible only when Lower is selected */}
        {garmentType === 'lower' && (
          <div className="max-w-4xl mx-auto mb-6">
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700 shadow-md">
              <h3 className="text-sm font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-2">Reference Style (Lower)</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">Choose which reference to use for your forged pant output</p>
              <div className="flex flex-wrap gap-4">
                {LOWER_REFERENCE_URLS.map((url, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setLowerReferenceIndex(idx);
                      deleteImage(getReferenceImageKey('lower'));
                    }}
                    className={`relative aspect-[3/4] w-24 sm:w-28 rounded-xl overflow-hidden border-2 transition-all ${
                      lowerReferenceIndex === idx
                        ? 'border-sky-600 dark:border-sky-500 ring-2 ring-sky-200 dark:ring-sky-800 shadow-lg'
                        : 'border-gray-200 dark:border-gray-600 hover:border-sky-400 dark:hover:border-sky-500'
                    }`}
                  >
                    <img src={url} alt={`Reference ${idx + 1}`} className="w-full h-full object-cover" />
                    <div className={`absolute inset-0 flex items-center justify-center ${lowerReferenceIndex === idx ? 'bg-sky-600/20' : 'bg-black/0'} transition-colors`}>
                      {lowerReferenceIndex === idx && (
                        <span className="bg-sky-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">Selected</span>
                      )}
                    </div>
                    <div className="absolute bottom-1 left-1 right-1 text-center">
                      <span className="text-[10px] font-bold text-white drop-shadow-lg bg-black/50 px-1 rounded">Ref {idx + 1}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* WORKSPACE: Centered Single Box for Source Garments */}
        <div className="max-w-4xl mx-auto mb-12">
          <div className="flex flex-col h-full">
            <div className="flex items-center justify-between mb-3 px-2">
              <h2 className="text-sm font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider flex items-center gap-2">
                <span className="bg-sky-600 text-white w-5 h-5 rounded-full flex items-center justify-center text-[10px]">1</span>
                Source Garment Collection
              </h2>
              {sourceFiles.length > 0 && (
                <button onClick={() => handleStartOver()} className="text-[10px] font-bold text-sky-600 dark:text-sky-400 hover:underline uppercase">Clear All</button>
              )}
            </div>

            <div
              onClick={() => sourceFiles.length < BATCH_LIMIT && fileInputRef.current?.click()}
              className={`relative min-h-[500px] border-2 border-dashed rounded-[32px] transition-all duration-300 overflow-hidden ${sourceFiles.length === 0 ? 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 hover:border-sky-600 dark:hover:border-sky-400 cursor-pointer' : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700'
                }`}
            >
              <input ref={fileInputRef} type="file" multiple accept="image/*" className="hidden" onChange={handleFilesChange} />

              {sourceFiles.length === 0 ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-8 pointer-events-none">
                  <div className="w-16 h-16 text-gray-300 dark:text-gray-600 mb-4 animate-bounce-slow"><GarmentIcon /></div>
                  <p className="text-gray-800 dark:text-gray-200 font-bold text-xl">Upload Your Garments</p>
                  <p className="text-gray-400 dark:text-gray-500 text-sm mt-2">Up to {BATCH_LIMIT} source files. Every asset will be forged to 4K Pro standards automatically.</p>
                  <div className="mt-4 px-4 py-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl text-left max-w-md">
                    <p className="text-xs font-bold text-amber-800 dark:text-amber-200 uppercase mb-2">For best results:</p>
                    <ul className="text-xs text-amber-700 dark:text-amber-300 space-y-1">
                      <li>• Use clear, well-lit images with the garment fully visible</li>
                      <li>• Isolated garment (ghost mannequin or flat-lay works best)</li>
                      <li>• Avoid busy backgrounds, hands, or obstructions</li>
                      <li>• Match garment type: {garmentType === 'upper' ? 'shirts, tops, jackets' : 'pants, jeans, shorts'}</li>
                    </ul>
                  </div>
                  <div className="mt-6 px-6 py-2 bg-sky-50 dark:bg-sky-900/30 rounded-full text-xs font-semibold text-sky-600 dark:text-sky-400">
                    PRO FIDELITY BLUEPRINT ACTIVE
                  </div>
                </div>
              ) : (
                <div className="p-8 h-full overflow-y-auto custom-scrollbar">
                  <div className="mb-4 p-3 bg-sky-50 dark:bg-sky-900/20 border-l-4 border-sky-500 rounded-r-lg text-xs text-sky-800 dark:text-sky-200">
                    <strong>Tip:</strong> For best output quality — use well-lit, isolated garment images and match the garment type above. Failed items can be retried with the Retry button.
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
                    {sourceFiles.map(f => (
                      <div key={f.id} className="group relative aspect-[3/4] bg-gray-50 dark:bg-gray-700 rounded-2xl overflow-hidden border border-gray-100 dark:border-gray-600 shadow-md transition-all hover:scale-[1.03] hover:shadow-xl">
                        <img src={f.preview} alt="Source" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <button
                            onClick={(e) => { e.stopPropagation(); removeFile(f.id); }}
                            className="bg-red-500 text-white p-2 rounded-full shadow-lg hover:bg-red-600 transition-colors"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                          </button>
                        </div>
                        <div className="absolute bottom-2 left-2 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm px-2 py-0.5 rounded text-[8px] font-bold text-gray-600 dark:text-gray-300 shadow-sm truncate max-w-[80%]">
                          {f.file.name}
                        </div>
                      </div>
                    ))}
                    {sourceFiles.length < BATCH_LIMIT && (
                      <div
                        className="aspect-[3/4] border-2 border-dashed border-gray-200 dark:border-gray-600 rounded-2xl flex flex-col items-center justify-center text-gray-300 dark:text-gray-500 hover:border-sky-600 dark:hover:border-sky-400 hover:text-sky-600 dark:hover:text-sky-400 transition-all cursor-pointer bg-gray-50/50 dark:bg-gray-700/50"
                        onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
                        <span className="text-[10px] font-bold mt-1 uppercase tracking-tighter">Add Garments</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-col items-center gap-4 mb-16 animate-fade-in">
          <div className="flex gap-4">
            <button
              onClick={handleGenerate}
              disabled={sourceFiles.length === 0 || isProcessing}
              className="px-12 py-4 bg-sky-600 dark:bg-sky-500 text-white font-bold rounded-full shadow-2xl hover:bg-sky-700 dark:hover:bg-sky-600 transition-all disabled:bg-gray-400 disabled:cursor-not-allowed hover:scale-105 active:scale-95 flex items-center gap-3"
            >
              {isProcessing && <Spinner />}
              {isProcessing ? 'Processing Batch...' : 'Start Pro Batch Forge'}
            </button>
            {hasStarted && (
              <button onClick={handleStartOver} className="px-8 py-4 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-bold rounded-full shadow-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-all">
                Reset Workspace
              </button>
            )}
          </div>
          {error && <p className="mt-4 text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/30 px-4 py-2 rounded-lg border border-red-200 dark:border-red-800 text-sm font-medium">{error}</p>}
        </div>

        {/* RESULTS SECTION */}
        {hasStarted && (
          <div className="animate-fade-in-up pt-10 border-t border-gray-200 dark:border-gray-700">
            <div className="flex flex-wrap justify-between items-end gap-4 mb-4">
              <div>
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white font-headline">Batch Processing Output</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 uppercase tracking-widest font-bold">Applying Supreme Identity Lock via AI</p>
              </div>
              <button
                onClick={handleDownloadAll}
                disabled={isProcessing || sourceFiles.filter(f => f.status === 'success').length === 0}
                className="flex items-center px-8 py-3 bg-sky-600 dark:bg-sky-500 text-white text-sm font-bold rounded-full shadow-xl hover:bg-sky-700 dark:hover:bg-sky-600 disabled:bg-gray-300 dark:disabled:bg-gray-600 transition-all"
              >
                <DownloadIcon /> Download All Perfectionized Assets
              </button>
            </div>
            <div className="mb-6 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl">
              <p className="text-xs font-bold text-amber-800 dark:text-amber-200 uppercase mb-1">Result not perfect?</p>
              <p className="text-xs text-amber-700 dark:text-amber-300">
                For best output: use well-lit source images, isolate the garment (flat-lay or ghost mannequin), match the garment type (Upper/Lower), and avoid busy backgrounds. Use the Retry button on failed items to try again.
              </p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-8">
              {sourceFiles.map(f => (
                <div key={f.id} className="flex flex-col group">
                  <div className="relative aspect-[3/4] bg-white dark:bg-gray-800 rounded-3xl overflow-hidden shadow-lg border border-gray-100 dark:border-gray-700 flex items-center justify-center transition-all duration-500 hover:shadow-2xl">
                    {f.status === 'success' && f.generatedPath && (
                      <>
                        {f.generatedImage ? (
                          <img
                            key={`img-${f.id}`}
                            src={f.generatedImage}
                            alt="Forged Asset"
                            className="w-full h-full object-contain animate-fade-in cursor-pointer"
                            style={{ display: 'block', opacity: 1 }}
                            onClick={(e) => {
                              e.stopPropagation();
                              closedViaBackButton.current = false;
                              const imageUrl = f.generatedImage!;
                              setFullscreenImage(imageUrl);
                            }}
                            onError={async (e) => {
                              await handleImageError(f.id, f.generatedPath, e.target as HTMLImageElement);
                            }}
                            onLoad={(e) => {
                              // Ensure image stays visible
                              const img = e.target as HTMLImageElement;
                              if (img) {
                                img.style.opacity = '1';
                                img.style.display = 'block';
                              }
                            }}
                          />
                        ) : (
                          <div className="absolute inset-0 bg-gray-50/80 dark:bg-gray-700/80 backdrop-blur-sm flex flex-col items-center justify-center">
                            <Spinner />
                            <p className="mt-4 text-[10px] font-bold text-gray-600 dark:text-gray-400 uppercase tracking-widest animate-pulse">Loading Image...</p>
                          </div>
                        )}
                      </>
                    )}

                    {f.status === 'processing' && (
                      <div className="absolute inset-0 bg-gray-50/80 dark:bg-gray-700/80 backdrop-blur-sm flex flex-col items-center justify-center">
                        <img src={f.preview} alt="Source" className="w-full h-full object-cover opacity-20 absolute inset-0" />
                        <Spinner />
                        <p className="mt-4 text-[10px] font-bold text-gray-600 dark:text-gray-400 uppercase tracking-widest animate-pulse">Forging 4K...</p>
                      </div>
                    )}
                    {f.status === 'queued' && (
                      <div className="absolute inset-0 bg-gray-50/50 dark:bg-gray-700/50 flex flex-col items-center justify-center">
                        <img src={f.preview} alt="Source" className="w-full h-full object-cover opacity-30 absolute inset-0" />
                        <div className="z-10 bg-white/90 dark:bg-gray-800/90 px-3 py-1 rounded-full text-[8px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-tighter border border-gray-100 dark:border-gray-700">Queued for Pro</div>
                      </div>
                    )}
                    {f.status === 'error' && (
                      <div className="absolute inset-0 bg-red-50 dark:bg-red-900/30 flex flex-col items-center justify-center p-4 text-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-red-400 dark:text-red-500 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                        <p className="text-[10px] text-red-600 dark:text-red-400 font-bold leading-tight line-clamp-3 mb-3">{f.error}</p>
                        <button
                          onClick={(e) => { e.stopPropagation(); handleRetrySingle(f.id); }}
                          disabled={isProcessing}
                          className="px-4 py-2 bg-sky-600 text-white text-[10px] font-bold rounded-lg hover:bg-sky-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                          Retry
                        </button>
                      </div>
                    )}

                    {f.status === 'success' && (
                      <div className="absolute top-4 left-4 z-10 bg-sky-600 dark:bg-sky-500 text-white text-[9px] font-bold px-2 py-0.5 rounded-full shadow-lg opacity-100 transform translate-y-0 transition-all">
                        PRO 4K
                      </div>
                    )}

                    {f.status === 'success' && f.generatedImage && (
                      <>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            e.preventDefault();
                            closedViaBackButton.current = false;
                            // Create a copy of the URL to avoid any state interference
                            const imageUrl = f.generatedImage!;
                            setFullscreenImage(imageUrl);
                          }}
                          className="absolute top-4 right-4 bg-white/90 dark:bg-gray-800/90 text-gray-800 dark:text-gray-200 p-2 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity transform hover:scale-110 z-10"
                          title="Expand to fullscreen"
                        >
                          <ExpandIcon className="h-4 w-4" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDownloadImage(f.generatedImage!, f.file.name);
                          }}
                          className="absolute bottom-4 right-4 bg-white/90 dark:bg-gray-800/90 text-gray-800 dark:text-gray-200 p-2 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity transform hover:scale-110 z-10"
                          title="Download image"
                        >
                          <DownloadIcon className="h-4 w-4" />
                        </button>
                      </>
                    )}
                  </div>
                  <p className="mt-3 text-[10px] text-gray-400 dark:text-gray-500 truncate text-center font-medium px-2 uppercase tracking-tighter" title={f.file.name}>{f.file.name}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
      <footer className="text-center py-12 text-gray-400 dark:text-gray-500 text-[10px] uppercase tracking-[0.2em]"><p>&copy; {new Date().getFullYear()} Zol Studio AI. Powered by AI.</p></footer>

      {/* Fullscreen Image Modal */}
      {fullscreenImage && (
        <div
          className="fixed inset-0 bg-black/90 dark:bg-black/95 z-50 flex items-center justify-center p-4 animate-fade-in"
          onClick={() => {
            closedViaBackButton.current = false;
            setFullscreenImage(null);
          }}
        >
          <button
            onClick={(e) => {
              e.stopPropagation();
              closedViaBackButton.current = false;
              setFullscreenImage(null);
            }}
            className="absolute top-4 right-4 text-white hover:text-gray-300 p-2 rounded-full hover:bg-white/10 transition-colors z-10"
            title="Close"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <img
            key={`fullscreen-${fullscreenImage.substring(0, 50)}`}
            src={fullscreenImage}
            alt="Fullscreen view"
            className="max-w-full max-h-full object-contain"
            onClick={(e) => e.stopPropagation()}
            onError={(e) => {
              // If fullscreen image fails, just close the modal
              console.error('Failed to load fullscreen image');
              setFullscreenImage(null);
            }}
          />
        </div>
      )}
    </div>
  );
};

export default CatalogForgedPage;
