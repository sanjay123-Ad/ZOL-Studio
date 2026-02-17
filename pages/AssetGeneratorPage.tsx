import React, { useState, useEffect, useRef } from 'react';
import { User, ImageFile, ExtractedAsset, AssetCategory } from '../types';
import { saveImage, getImage, deleteImage } from '../services/imageStore';
import { saveState, loadState, removeState } from '../services/stateStore';
import ImageUploader from '../components/ImageUploader';
import { GarmentIcon, DownloadIcon, MaleIcon, FemaleIcon, SaveIcon, ExpandIcon } from '../components/icons';
import { extractAssetsFromImage, analyzeFemaleGarment, analyzeMaleGarment, FemaleGarmentAnalysis, MaleGarmentAnalysis } from '../services/assetGeneratorService';
import { detectGender } from '../services/virtualTryOnService';
import { deductCredits, hasEnoughCredits } from '../services/creditService';
import { uploadAssetGeneratorImage, deleteAssetGeneratorImage, deleteAllAssetGeneratorImages, getSignedUrlsForAssetGenerator, uploadAssetGeneratorSourceImage, deleteAssetGeneratorSourceImage } from '../services/db';
import Spinner from '../components/Spinner';

// --- Types ---
interface AssetGeneratorPageProps {
  user: User;
  onSaveToCollection: (data: { imageUrl: string, asset_type: 'individual', item_name: string, item_category: string }) => void;
}
type ExtractionScope = 'full' | 'upper' | 'lower' | 'separate' | 'multi-separate';
type View = 'setup' | 'loading' | 'results';

// Batch processing types
interface AssetFile {
  id: string;
  file: File;
  preview: string;
  imageFile: ImageFile | null;
  status: 'queued' | 'analyzing' | 'processing' | 'success' | 'error';
  error: string | null;
  garmentAnalysis: FemaleGarmentAnalysis | MaleGarmentAnalysis | null;
  generatedAssets: ExtractedAsset[];
  supabasePaths?: string[]; // Store Supabase paths for generated assets cleanup
  sourceSupabasePath?: string; // Store Supabase path for source image
  genderWarning?: string | null; // Gender mismatch warning for this file
  isGenderMatch?: boolean; // Whether the detected gender matches selected gender
}

// --- Helper Functions ---
// Convert signed URL to base64 for ExtractedAsset structure
const urlToBase64 = async (url: string): Promise<string> => {
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Failed to fetch image: ${response.statusText}`);
    const blob = await response.blob();
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const dataUrl = reader.result as string;
        if (!dataUrl) return reject(new Error("FileReader failed to produce a data URL."));
        const base64 = dataUrl.split(',')[1];
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    console.error("Failed to convert URL to base64:", error);
    throw error;
  }
};

const dataUrlToImageFile = (dataUrl: string): ImageFile => {
  if (!dataUrl) return null;
  const parts = dataUrl.split(',');
  const mimeTypePart = parts[0].match(/:(.*?);/);
  if (!mimeTypePart || parts.length < 2 || !parts[1]) {
    console.error("Invalid data URL format");
    return null;
  }
  return { dataUrl: dataUrl, base64: parts[1], mimeType: mimeTypePart[1] };
};

const fileToImageFile = (file: File): Promise<ImageFile> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      if (!dataUrl) {
        return reject(new Error("FileReader failed to produce a data URL."));
      }
      const parts = dataUrl.split(',');
      const mimeTypePart = parts[0].match(/:(.*?);/);
      if (!mimeTypePart || parts.length < 2 || !parts[1]) {
        return reject(new Error("Invalid data URL format."));
      }
      resolve({ dataUrl, base64: parts[1], mimeType: mimeTypePart[1] });
    };
    reader.onerror = () => reject(new Error("FileReader error."));
    reader.readAsDataURL(file);
  });
};

// --- Sub-components for Different Views ---

const LoadingView: React.FC<{ type: 'assets' | 'composition' }> = ({ type }) => (
  <div className="text-center py-16">
    <div className="flex justify-center items-center"><Spinner /></div>
    <p className="mt-4 text-lg text-gray-600 animate-pulse">
      {type === 'assets' ? 'Extracting e-commerce assets...' : 'Composing your outfit...'}
    </p>
    <p className="text-sm text-gray-500 mt-1">Target speed: 15-20 seconds.</p>
  </div>
);

const ResultsView: React.FC<{
  generatedAssets: ExtractedAsset[];
  onStartOver: () => void;
  onSaveToCollection: (data: { imageUrl: string, asset_type: 'individual', item_name: string, item_category: string }) => void;
  savedAssetIds: Set<string>;
}> = ({ generatedAssets, onStartOver, onSaveToCollection, savedAssetIds }) => {
  const [fullscreenImage, setFullscreenImage] = useState<string | null>(null);
  const closedViaBackButton = useRef<boolean>(false);

  // Handle ESC key to close fullscreen
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && fullscreenImage) {
        closedViaBackButton.current = false;
        setFullscreenImage(null);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [fullscreenImage]);

  // Handle browser back button
  useEffect(() => {
    if (fullscreenImage) {
      window.history.pushState({ modalOpen: true }, '');
    }
  }, [fullscreenImage]);

  useEffect(() => {
    const handlePopState = () => {
      if (fullscreenImage) {
        closedViaBackButton.current = true;
        setFullscreenImage(null);
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [fullscreenImage]);

  const handleDownload = (base64: string, filename: string) => {
    const link = document.createElement('a');
    link.href = `data:image/png;base64,${base64}`;
    link.download = `${filename}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Determine grid columns based on number of assets
  // For 1-2 assets (separate mode), use larger display (2 columns max)
  // For 3+ assets, use smaller grid
  const getGridCols = () => {
    if (generatedAssets.length <= 2) {
      return 'grid-cols-1 sm:grid-cols-2'; // 1 column on mobile, 2 on larger screens for better visibility
    }
    return 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4'; // Default grid for 3+ assets
  };

  return (
    <div className="animate-fade-in">
      <h2 className="text-3xl font-bold text-center mb-6 text-gray-800 dark:text-white">Generated Assets</h2>
      <div className={`grid ${getGridCols()} gap-6`}>
        {generatedAssets.map(asset => {
          const mainView = asset.views.find(v => v.viewType === 'Front');
          if (!mainView) return null;
          const assetId = `${asset.category}-${asset.itemName}`;
          const isSaved = savedAssetIds.has(assetId);

          return (
            <div key={assetId} className="flex flex-col">
              <div className={`relative group bg-gray-50 dark:bg-gray-800/50 rounded-xl shadow-lg overflow-hidden border border-gray-200 dark:border-gray-700 flex items-center justify-center ${generatedAssets.length <= 2 ? 'aspect-[3/4]' : 'aspect-[4/5]'
                }`}>
                <img
                  src={`data:image/png;base64,${mainView.imageBase64}`}
                  alt={asset.itemName}
                  className="max-w-full max-h-full w-auto h-auto object-contain object-center cursor-pointer"
                  style={{ maxHeight: '100%', maxWidth: '100%' }}
                  onClick={() => {
                    closedViaBackButton.current = false;
                    setFullscreenImage(`data:image/png;base64,${mainView.imageBase64}`);
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="absolute top-2 right-2 z-10">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        closedViaBackButton.current = false;
                        setFullscreenImage(`data:image/png;base64,${mainView.imageBase64}`);
                      }}
                      className="p-2 bg-black/50 text-white rounded-full hover:bg-purple-600 transition-colors"
                      title="Expand to fullscreen"
                    >
                      <ExpandIcon className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="absolute bottom-2 left-2 right-2 flex flex-col gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        !isSaved && onSaveToCollection({
                          imageUrl: `data:image/png;base64,${mainView.imageBase64}`,
                          asset_type: 'individual',
                          item_name: asset.itemName,
                          item_category: asset.category
                        });
                      }}
                      disabled={isSaved}
                      className="w-full flex items-center justify-center px-3 py-2 bg-white/90 text-sm text-sky-600 border border-sky-600 font-semibold rounded-full shadow-sm hover:bg-sky-50 transition-colors disabled:bg-gray-100 disabled:text-gray-400 disabled:border-gray-300 disabled:cursor-not-allowed"
                    >
                      <div className="w-4 h-4 mr-2"><SaveIcon /></div>
                      {isSaved ? '✓ Saved' : 'Save'}
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDownload(mainView.imageBase64, asset.itemName.replace(/\s+/g, '_'));
                      }}
                      className="w-full flex items-center justify-center px-3 py-2 bg-white/90 text-gray-700 text-sm font-semibold rounded-full shadow-sm hover:bg-gray-50 transition-colors"
                    >
                      <DownloadIcon /> Download
                    </button>
                  </div>
                </div>
              </div>
              <p className="mt-2 text-sm font-semibold text-gray-700 dark:text-gray-300 text-center truncate" title={asset.itemName}>{asset.itemName}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 text-center">{asset.category}</p>
            </div>
          );
        })}
      </div>

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
              console.error('Failed to load fullscreen image');
              setFullscreenImage(null);
            }}
          />
        </div>
      )}

      <div className="text-center mt-12 pt-6 border-t border-gray-200">
        <button onClick={onStartOver} className="text-sky-600 hover:text-sky-700 font-semibold">
          Start Over With a New Image
        </button>
      </div>
    </div>
  );
};

// --- Main Page Component ---
const AssetGeneratorPage: React.FC<AssetGeneratorPageProps> = ({ user, onSaveToCollection }) => {
  const [view, setView] = useState<View>('setup');
  const [gender, setGender] = useState<'Male' | 'Female' | null>(null);
  const [sourceImage, setSourceImage] = useState<ImageFile>(null);
  const [extractionScope, setExtractionScope] = useState<ExtractionScope>('full');
  const [generatedAssets, setGeneratedAssets] = useState<ExtractedAsset[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [savedAssetIds, setSavedAssetIds] = useState<Set<string>>(new Set());
  // Track Supabase paths for generated assets (for cleanup)
  const [assetSupabasePaths, setAssetSupabasePaths] = useState<Map<string, string>>(new Map()); // assetId -> supabasePath
  const [isStateRestored, setIsStateRestored] = useState(false);
  const [genderWarning, setGenderWarning] = useState<string | null>(null);
  const [isValidatingGender, setIsValidatingGender] = useState(false);
  const [garmentAnalysis, setGarmentAnalysis] = useState<FemaleGarmentAnalysis | MaleGarmentAnalysis | null>(null);
  const [isAnalyzingGarment, setIsAnalyzingGarment] = useState<boolean>(false);
  const [isGenerating, setIsGenerating] = useState<boolean>(false); // Track single image generation
  // Prevent duplicate AI calls for the same single image
  const lastSingleAnalysisKeyRef = useRef<string | null>(null);
  const lastGenderValidationKeyRef = useRef<string | null>(null);

  // Batch processing mode
  const [assetFiles, setAssetFiles] = useState<AssetFile[]>([]);
  const [isBatchMode, setIsBatchMode] = useState<boolean>(false);
  const [isProcessingBatch, setIsProcessingBatch] = useState<boolean>(false);
  const [batchProgress, setBatchProgress] = useState<{ completed: number; total: number }>({ completed: 0, total: 0 });
  const [fullscreenImage, setFullscreenImage] = useState<string | null>(null);

  // Reset loading state when all batch files are successfully processed (safety net)
  useEffect(() => {
    if (isBatchMode && assetFiles.length > 0) {
      const filesToCheck = assetFiles.filter(f => f.imageFile && f.status !== 'error');
      const allSuccess = filesToCheck.length > 0 && filesToCheck.every(f => f.status === 'success');
      if (allSuccess && isProcessingBatch) {
        setIsProcessingBatch(false);
        setBatchProgress({ completed: filesToCheck.length, total: filesToCheck.length });
      }
    }
  }, [isBatchMode, assetFiles, isProcessingBatch]);
  const [batchSavedAssetIds, setBatchSavedAssetIds] = useState<Set<string>>(new Set());
  const closedViaBackButton = useRef<boolean>(false);

  // Handle ESC key to close fullscreen
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && fullscreenImage) {
        closedViaBackButton.current = false;
        setFullscreenImage(null);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [fullscreenImage]);

  // Handle browser back button for fullscreen
  useEffect(() => {
    if (fullscreenImage) {
      window.history.pushState({ modalOpen: true }, '');
    }
  }, [fullscreenImage]);

  useEffect(() => {
    const handlePopState = () => {
      if (fullscreenImage) {
        closedViaBackButton.current = true;
        setFullscreenImage(null);
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [fullscreenImage]);

  // User-specific storage keys
  const SESSION_STORAGE_KEY = `assetGeneratorState_${user.id}`;
  const SOURCE_IMAGE_KEY = `asset-generator-source-image_${user.id}`;
  const BATCH_IMAGE_KEY_PREFIX = `asset-generator-batch-${user.id}`;

  // Load state from session on mount
  useEffect(() => {
    let isMounted = true;
    const initializeState = async () => {
      let bridged = false;
      try {
        const bridgedDataUrl = sessionStorage.getItem('bridge_image_to_asset_generator');
        if (bridgedDataUrl) {
          bridged = true;
          sessionStorage.removeItem('bridge_image_to_asset_generator');
          removeState(SESSION_STORAGE_KEY);
          await deleteImage(SOURCE_IMAGE_KEY);
          const imageFile = dataUrlToImageFile(bridgedDataUrl);
          if (imageFile && isMounted) {
            setSourceImage(imageFile);
            setGender(null);
            setExtractionScope('full');
            setGeneratedAssets([]);
            setSavedAssetIds(new Set());
            setView('setup');
          }
        }

        if (bridged) {
          if (isMounted) {
            setIsStateRestored(true);
          }
          return;
        }

        const savedState = loadState<any>(SESSION_STORAGE_KEY);
        if (savedState) {
          const storedImage = savedState.sourceImageKey ? await getImage(savedState.sourceImageKey) : null;

          if (!isMounted) return;

          if (storedImage) {
            setSourceImage(storedImage);
          } else {
            setSourceImage(null);
          }

          // Restore garment analysis if it exists
          if (savedState.garmentAnalysis) {
            setGarmentAnalysis(savedState.garmentAnalysis);
          }

          // Restore batch processing state - EXACTLY like Catalog Forge pattern
          // This ensures files are available when user switches back to batch mode
          if (savedState.assetFiles && Array.isArray(savedState.assetFiles) && savedState.assetFiles.length > 0) {
            const loadedFiles: AssetFile[] = [];

            // Collect all Supabase paths for generated assets (batch fetch)
            const allGeneratedPaths: string[] = [];
            savedState.assetFiles.forEach((af: any) => {
              if (af.supabasePaths && Array.isArray(af.supabasePaths)) {
                af.supabasePaths.forEach((path: string) => {
                  if (path) allGeneratedPaths.push(path);
                });
              }
            });

            // Fetch signed URLs from Supabase in one batch (like Catalog Forge)
            const generatedUrlMap = allGeneratedPaths.length > 0
              ? await getSignedUrlsForAssetGenerator(allGeneratedPaths)
              : new Map<string, string>();

            // Restore files from IndexedDB using simple loop (like Catalog Forge)
            for (const af of savedState.assetFiles) {
              // Load source image from IndexedDB - try saved key first, then fallbacks for backward compat
              let imageData = af.imageFileKey ? await getImage(af.imageFileKey) : null;
              if (!imageData && af.id && savedState.userId) {
                imageData = await getImage(`asset-generator-batch-${savedState.userId}-${af.id}`);
              }
              if (!imageData && af.id) {
                imageData = await getImage(`asset-file-${af.id}`);
              }

              // Fallback: if not in IndexedDB but preview contains data URL, rebuild and cache
              if (!imageData && af.preview && af.preview.startsWith('data:')) {
                try {
                  const arr = af.preview.split(',');
                  const mimeMatch = arr[0].match(/:(.*?);/);
                  const mimeType = mimeMatch ? mimeMatch[1] : 'image/png';
                  imageData = {
                    dataUrl: af.preview,
                    base64: arr[1],
                    mimeType: mimeType,
                  };
                  if (af.imageFileKey) {
                    await saveImage(af.imageFileKey, imageData);
                  }
                } catch (err) {
                  console.error(`Failed to rebuild preview for ${af.id}:`, err);
                }
              }

              if (imageData) {
                // Recreate file object from ImageFile (like Catalog Forge)
                const arr = imageData.dataUrl.split(',');
                const mime = arr[0].match(/:(.*?);/)?.[1] || 'image/png';
                const bstr = atob(arr[1]);
                let n = bstr.length;
                const u8arr = new Uint8Array(n);
                while (n--) {
                  u8arr[n] = bstr.charCodeAt(n);
                }
                const restoredFile = new File([u8arr], af.fileName || 'restored.png', { type: mime });

                // Restore generated assets from Supabase paths
                let restoredAssets: ExtractedAsset[] = [];
                if (af.supabasePaths && Array.isArray(af.supabasePaths) &&
                  af.assetMetadata && Array.isArray(af.assetMetadata)) {
                  // Restore from supabasePaths + assetMetadata
                  restoredAssets = await Promise.all(
                    af.assetMetadata.map(async (meta: any, idx: number) => {
                      const path = af.supabasePaths[idx];
                      if (!path) return null;

                      const signedUrl = generatedUrlMap.get(path);
                      if (signedUrl) {
                        try {
                          const base64 = await urlToBase64(signedUrl);
                          return {
                            category: meta.category,
                            itemName: meta.itemName,
                            views: [{
                              viewType: meta.viewType || 'Front',
                              imageBase64: base64,
                            }],
                          };
                        } catch (err) {
                          console.error(`Failed to restore asset ${meta.itemName}:`, err);
                          return null;
                        }
                      }
                      return null;
                    })
                  );
                  restoredAssets = restoredAssets.filter(a => a !== null) as ExtractedAsset[];
                }
                // Legacy format: restore from generatedAssets with base64
                else if (af.generatedAssets && Array.isArray(af.generatedAssets)) {
                  restoredAssets = af.generatedAssets.map((ga: any) => ({
                    category: ga.category,
                    itemName: ga.itemName,
                    views: (ga.views && Array.isArray(ga.views)) ? ga.views.map((v: any) => ({
                      viewType: v.viewType || 'Front',
                      imageBase64: v.imageBase64 || '',
                    })) : [],
                  }));
                }

                // Determine status
                let restoredStatus: 'queued' | 'analyzing' | 'processing' | 'success' | 'error' = af.status || 'queued';
                if ((restoredAssets.length > 0 || (af.supabasePaths && af.supabasePaths.length > 0)) && restoredStatus !== 'error') {
                  restoredStatus = 'success';
                }

                loadedFiles.push({
                  id: af.id,
                  file: restoredFile,
                  preview: imageData.dataUrl, // Use IndexedDB dataUrl (like Catalog Forge)
                  imageFile: imageData, // Store ImageFile (like Catalog Forge)
                  status: restoredStatus,
                  error: af.error || null,
                  garmentAnalysis: af.garmentAnalysis || null,
                  generatedAssets: restoredAssets,
                  genderWarning: af.genderWarning || null,
                  isGenderMatch: af.isGenderMatch !== undefined ? af.isGenderMatch : true,
                  supabasePaths: af.supabasePaths || [],
                  sourceSupabasePath: af.sourceSupabasePath || undefined,
                });
              }
            }

            // Set files directly (like Catalog Forge) - no filtering
            if (loadedFiles.length > 0) {
              setAssetFiles(loadedFiles);
            }

            // Restore batch mode flag if it was saved
            if (savedState.isBatchMode) {
              setIsBatchMode(true);
            }
            // Restore saved asset IDs for batch
            if (savedState.batchSavedAssetIds && Array.isArray(savedState.batchSavedAssetIds)) {
              setBatchSavedAssetIds(new Set(savedState.batchSavedAssetIds));
            }
          } else if (savedState.isBatchMode) {
            // If batch mode was saved but no files, just restore the mode flag
            setIsBatchMode(true);
          }

          // Restore batch mode flag if it was saved (always check, even if files were restored above)
          if (savedState.isBatchMode) {
            setIsBatchMode(true);
          }

          // CRITICAL: Also restore gender if batch files exist (like single image mode does)
          // This ensures the UI shows the correct state
          if (savedState.assetFiles && Array.isArray(savedState.assetFiles) && savedState.assetFiles.length > 0) {
            if (savedState.gender) {
              setGender(savedState.gender);
            }
          }

          // Check if there are batch results to restore
          // Check for both new format (assetMetadata + supabasePaths) and legacy format (generatedAssets)
          // Also check if files have supabasePaths (even if status isn't explicitly 'success')
          const hasBatchResults = savedState.assetFiles && Array.isArray(savedState.assetFiles) &&
            savedState.assetFiles.some((af: any) => {
              // Check if file has generated results (either format)
              const hasResults = (
                (af.assetMetadata && Array.isArray(af.assetMetadata) && af.assetMetadata.length > 0 && af.supabasePaths && af.supabasePaths.length > 0) ||
                (af.generatedAssets && Array.isArray(af.generatedAssets) && af.generatedAssets.length > 0) ||
                (af.supabasePaths && Array.isArray(af.supabasePaths) && af.supabasePaths.length > 0)
              );
              // Consider it a result if status is success OR if we have results data
              return (af.status === 'success' || hasResults) && hasResults;
            });

          if (savedState.view === 'results' || (savedState.generatedAssets && Array.isArray(savedState.generatedAssets) && savedState.generatedAssets.length > 0)) {
            // Single image mode results - now shown inline in setup view
            setGender(savedState.gender ?? null);
            if (savedState.extractionScope) {
              setExtractionScope(savedState.extractionScope as ExtractionScope);
            }

            // Restore Supabase paths first
            let pathsMap = new Map<string, string>();
            if (savedState.assetSupabasePaths && Array.isArray(savedState.assetSupabasePaths)) {
              savedState.assetSupabasePaths.forEach(([key, value]: [string, string]) => {
                pathsMap.set(key, value);
              });
              setAssetSupabasePaths(pathsMap);
            }

            // Restore generated assets - fetch from Supabase if paths exist, otherwise use saved base64
            let restoredAssets: ExtractedAsset[] = [];
            if (savedState.generatedAssets && Array.isArray(savedState.generatedAssets) && savedState.generatedAssets.length > 0) {
              if (pathsMap.size > 0) {
                // Fetch from Supabase using saved paths
                const supabasePaths = Array.from(pathsMap.values());
                const urlMap = await getSignedUrlsForAssetGenerator(supabasePaths);

                // Restore assets from Supabase - try to fetch each asset from Supabase if path exists
                restoredAssets = await Promise.all(
                  savedState.generatedAssets.map(async (ga: any) => {
                    const assetId = `${ga.category}-${ga.itemName}`;
                    const supabasePath = pathsMap.get(assetId);

                    if (supabasePath) {
                      const signedUrl = urlMap.get(supabasePath);
                      if (signedUrl) {
                        try {
                          const base64 = await urlToBase64(signedUrl);
                          return {
                            category: ga.category,
                            itemName: ga.itemName,
                            views: [{
                              viewType: ga.views?.[0]?.viewType || 'Front',
                              imageBase64: base64,
                            }],
                          };
                        } catch (err) {
                          console.error(`Failed to restore asset ${ga.itemName} from Supabase:`, err);
                          // Fall back to saved base64 if Supabase fails
                          return ga;
                        }
                      }
                    }
                    // Fall back to saved base64 if no Supabase path exists for this asset
                    return ga;
                  })
                );
              } else {
                // No Supabase paths at all - use saved base64 for all assets
                restoredAssets = savedState.generatedAssets;
              }
            }

            setGeneratedAssets(restoredAssets);
            setSavedAssetIds(new Set(savedState.savedAssetIds || []));

            // Restore garment analysis if it exists
            if (savedState.garmentAnalysis) {
              setGarmentAnalysis(savedState.garmentAnalysis);
            }

            // Restore source image if available
            if (savedState.sourceImageKey) {
              const restoredImage = await getImage(savedState.sourceImageKey);
              if (restoredImage) {
                setSourceImage(restoredImage);
              }
            }
            setView('setup'); // Show inline results in setup view
          } else if (hasBatchResults) {
            // Batch processing results - restore and show in setup view
            if (savedState.gender) setGender(savedState.gender);
            if (savedState.isBatchMode) setIsBatchMode(true);
            // assetFiles are already restored above
            setView('setup'); // Stay in setup view but results will be visible
          } else {
            // Regular setup view
            if (savedState.gender) setGender(savedState.gender);
            if (savedState.extractionScope) setExtractionScope(savedState.extractionScope as ExtractionScope);
            setView('setup');
          }
        }

      } catch (error) {
        console.error("Failed to load state", error);
        removeState(SESSION_STORAGE_KEY);
        await deleteImage(SOURCE_IMAGE_KEY);
      } finally {
        if (isMounted) {
          setIsStateRestored(true);
        }
      }
    };

    initializeState();

    return () => {
      isMounted = false;
    };
  }, [user.id, SESSION_STORAGE_KEY, SOURCE_IMAGE_KEY]);

  // Save state before page unload/navigation
  useEffect(() => {
    if (!isStateRestored) return;

    const handleBeforeUnload = async () => {
      let stateToSave: any;
      // Save as 'setup' if we have generated assets (now shown inline)
      if (generatedAssets.length > 0) {
        stateToSave = {
          userId: user.id,
          view: 'setup', // Changed from 'results' - now shown inline
          gender,
          sourceImageKey: sourceImage ? SOURCE_IMAGE_KEY : null,
          generatedAssets,
          savedAssetIds: Array.from(savedAssetIds),
          garmentAnalysis,
          assetSupabasePaths: Array.from(assetSupabasePaths.entries()), // Save as array of [key, value] pairs
          isBatchMode,
          assetFiles: assetFiles.length > 0 ? assetFiles.map(af => {
            // Save metadata and paths instead of base64 to avoid localStorage size limits
            const assetMetadata = (af.generatedAssets && Array.isArray(af.generatedAssets) && af.supabasePaths && af.supabasePaths.length > 0)
              ? af.generatedAssets.map((ga, idx) => {
                const path = af.supabasePaths[idx];
                const mainView = ga.views.find(v => v.viewType === 'Front') || ga.views[0];
                return path ? {
                  category: ga.category,
                  itemName: ga.itemName,
                  viewType: mainView?.viewType || 'Front',
                } : null;
              }).filter(m => m !== null)
              : [];

            return {
              id: af.id,
              fileName: af.file.name,
              preview: af.imageFile?.dataUrl || af.preview, // Use dataUrl for persistence
              imageFileKey: af.imageFile ? `${BATCH_IMAGE_KEY_PREFIX}-${af.id}` : null,
              status: af.status,
              error: af.error,
              garmentAnalysis: af.garmentAnalysis,
              // Don't save base64 - only save metadata and paths
              assetMetadata: assetMetadata,
              supabasePaths: af.supabasePaths || [],
              sourceSupabasePath: af.sourceSupabasePath || undefined, // Save Supabase path for source
              genderWarning: af.genderWarning || null,
              isGenderMatch: af.isGenderMatch !== undefined ? af.isGenderMatch : true,
            };
          }) : [],
          batchSavedAssetIds: isBatchMode ? Array.from(batchSavedAssetIds) : [],
        };
        // Save image files for batch files (ALWAYS save if they exist, like single image mode)
        // This is CRITICAL for state persistence - must match single image behavior
        for (const af of assetFiles) {
          if (af.imageFile) {
            await saveImage(`${BATCH_IMAGE_KEY_PREFIX}-${af.id}`, af.imageFile);
          }
        }
        // Also save single image source if it exists (like single image mode does)
        if (sourceImage) await saveImage(SOURCE_IMAGE_KEY, sourceImage);
      } else {
        stateToSave = {
          userId: user.id,
          view: 'setup',
          gender,
          sourceImageKey: sourceImage ? SOURCE_IMAGE_KEY : null,
          extractionScope,
          garmentAnalysis,
          isBatchMode,
          generatedAssets: generatedAssets, // CRITICAL: Always save single mode generated assets
          assetSupabasePaths: Array.from(assetSupabasePaths.entries()), // CRITICAL: Always save Supabase paths
          savedAssetIds: Array.from(savedAssetIds),
          assetFiles: assetFiles.length > 0 ? assetFiles.map(af => {
            // Save metadata and paths instead of base64 to avoid localStorage size limits
            const assetMetadata = (af.generatedAssets && Array.isArray(af.generatedAssets) && af.supabasePaths && af.supabasePaths.length > 0)
              ? af.generatedAssets.map((ga, idx) => {
                const path = af.supabasePaths[idx];
                const mainView = ga.views.find(v => v.viewType === 'Front') || ga.views[0];
                return path ? {
                  category: ga.category,
                  itemName: ga.itemName,
                  viewType: mainView?.viewType || 'Front',
                } : null;
              }).filter(m => m !== null)
              : [];

            return {
              id: af.id,
              fileName: af.file.name,
              preview: af.imageFile?.dataUrl || af.preview,
              imageFileKey: af.imageFile ? `${BATCH_IMAGE_KEY_PREFIX}-${af.id}` : null,
              status: af.status,
              error: af.error,
              garmentAnalysis: af.garmentAnalysis,
              // Don't save base64 - only save metadata and paths
              assetMetadata: assetMetadata,
              supabasePaths: af.supabasePaths || [],
              sourceSupabasePath: af.sourceSupabasePath || undefined, // Save Supabase path for source
              genderWarning: af.genderWarning || null,
              isGenderMatch: af.isGenderMatch !== undefined ? af.isGenderMatch : true,
            };
          }) : [],
          batchSavedAssetIds: isBatchMode ? Array.from(batchSavedAssetIds) : [],
        };
        // Save image files for batch files (always save if they exist, regardless of mode)
        // This is CRITICAL - must save to IndexedDB like single image mode does
        for (const af of assetFiles) {
          if (af.imageFile) {
            await saveImage(`${BATCH_IMAGE_KEY_PREFIX}-${af.id}`, af.imageFile);
          }
        }
        // Also save single image source if it exists
        if (sourceImage) await saveImage(SOURCE_IMAGE_KEY, sourceImage);
      }
      saveState(SESSION_STORAGE_KEY, stateToSave);
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [isStateRestored, view, gender, sourceImage, extractionScope, generatedAssets, savedAssetIds, garmentAnalysis, isBatchMode, assetFiles, batchSavedAssetIds, user.id, SOURCE_IMAGE_KEY, BATCH_IMAGE_KEY_PREFIX, assetSupabasePaths]);

  // Save state on change
  useEffect(() => {
    if (!isStateRestored) return;

    const saveCurrentState = async () => {
      try {
        let stateToSave: any;

        // Check if there are batch results (even in setup view)
        const hasBatchResults = isBatchMode && assetFiles.some(f => f.status === 'success' && f.generatedAssets.length > 0);

        if (generatedAssets.length > 0 || hasBatchResults) {
          // Save as 'setup' - results are now shown inline for both single and batch
          stateToSave = {
            userId: user.id,
            view: 'setup', // Always use setup view - results shown inline
            gender,
            sourceImageKey: sourceImage ? SOURCE_IMAGE_KEY : null,
            generatedAssets,
            savedAssetIds: Array.from(savedAssetIds),
            garmentAnalysis,
            assetSupabasePaths: Array.from(assetSupabasePaths.entries()),
            isBatchMode,
            assetFiles: assetFiles.length > 0 ? assetFiles.map(af => {
              // Save both formats: assetMetadata (for Supabase) and generatedAssets (for legacy/backup)
              const assetMetadata = (af.generatedAssets && Array.isArray(af.generatedAssets) && af.supabasePaths && af.supabasePaths.length > 0)
                ? af.generatedAssets.map((ga, idx) => {
                  const path = af.supabasePaths[idx];
                  const mainView = ga.views.find(v => v.viewType === 'Front') || ga.views[0];
                  return path ? {
                    category: ga.category,
                    itemName: ga.itemName,
                    viewType: mainView?.viewType || 'Front',
                  } : null;
                }).filter(m => m !== null)
                : [];

              // Don't save base64 - use assetMetadata + supabasePaths only (restore fetches from Supabase)
              // This keeps localStorage under quota for batch with many images

              return {
                id: af.id,
                fileName: af.file.name,
                preview: af.imageFile?.dataUrl || af.preview,
                imageFileKey: af.imageFile ? `${BATCH_IMAGE_KEY_PREFIX}-${af.id}` : null,
                status: af.status,
                error: af.error,
                garmentAnalysis: af.garmentAnalysis,
                assetMetadata: assetMetadata,
                supabasePaths: af.supabasePaths || [],
                sourceSupabasePath: af.sourceSupabasePath || undefined, // Save Supabase path for source
                genderWarning: af.genderWarning || null,
                isGenderMatch: af.isGenderMatch !== undefined ? af.isGenderMatch : true,
              };
            }) : [],
            batchSavedAssetIds: isBatchMode ? Array.from(batchSavedAssetIds) : [],
          };
          // Save image files for batch files (always save if they exist, regardless of mode)
          for (const af of assetFiles) {
            if (af.imageFile) {
              await saveImage(`${BATCH_IMAGE_KEY_PREFIX}-${af.id}`, af.imageFile);
            }
          }
        } else { // setup view without batch results
          if (sourceImage) await saveImage(SOURCE_IMAGE_KEY, sourceImage);
          else await deleteImage(SOURCE_IMAGE_KEY);
          stateToSave = {
            userId: user.id,
            view: 'setup',
            gender,
            sourceImageKey: sourceImage ? SOURCE_IMAGE_KEY : null,
            extractionScope,
            garmentAnalysis,
            isBatchMode,
            assetFiles: assetFiles.length > 0 ? assetFiles.map(af => {
              // Save metadata and paths instead of base64 to avoid localStorage size limits
              const assetMetadata = (af.generatedAssets && Array.isArray(af.generatedAssets) && af.supabasePaths && af.supabasePaths.length > 0)
                ? af.generatedAssets.map((ga, idx) => {
                  const path = af.supabasePaths[idx];
                  const mainView = ga.views.find(v => v.viewType === 'Front') || ga.views[0];
                  return path ? {
                    category: ga.category,
                    itemName: ga.itemName,
                    viewType: mainView?.viewType || 'Front',
                  } : null;
                }).filter(m => m !== null)
                : [];

              return {
                id: af.id,
                fileName: af.file.name,
                preview: af.imageFile?.dataUrl || af.preview, // Use dataUrl for persistence
                imageFileKey: af.imageFile ? `${BATCH_IMAGE_KEY_PREFIX}-${af.id}` : null,
                status: af.status,
                error: af.error,
                garmentAnalysis: af.garmentAnalysis,
                // Don't save base64 - only save metadata and paths
                assetMetadata: assetMetadata,
                supabasePaths: af.supabasePaths || [],
                sourceSupabasePath: af.sourceSupabasePath || undefined, // Save Supabase path for source
                genderWarning: af.genderWarning || null,
                isGenderMatch: af.isGenderMatch !== undefined ? af.isGenderMatch : true,
              };
            }) : [],
            batchSavedAssetIds: isBatchMode ? Array.from(batchSavedAssetIds) : [],
            generatedAssets: generatedAssets, // Save single mode generated assets
            assetSupabasePaths: Array.from(assetSupabasePaths.entries()),
          };
          // Save image files for batch files (always save if they exist, regardless of mode)
          for (const af of assetFiles) {
            if (af.imageFile) {
              await saveImage(`${BATCH_IMAGE_KEY_PREFIX}-${af.id}`, af.imageFile);
            }
          }
        }
        saveState(SESSION_STORAGE_KEY, stateToSave);
      } catch (error) {
        console.error("Failed to save state", error);
      }
    };
    saveCurrentState();
  }, [gender, sourceImage, extractionScope, view, generatedAssets, savedAssetIds, garmentAnalysis, isBatchMode, assetFiles, batchSavedAssetIds, user.id, SOURCE_IMAGE_KEY, BATCH_IMAGE_KEY_PREFIX, isStateRestored]);

  // Save state when user navigates away (tab switch, SPA navigation) - critical for batch persistence
  useEffect(() => {
    if (!isStateRestored || !user?.id) return;
    const saveOnLeave = () => {
      const hasBatchResults = isBatchMode && assetFiles.some(f => f.status === 'success' && f.generatedAssets?.length > 0);
      if (assetFiles.length > 0 || generatedAssets.length > 0 || hasBatchResults) {
        const stateToSave: Record<string, unknown> = {
          userId: user.id,
          view: 'setup',
          gender,
          sourceImageKey: sourceImage ? SOURCE_IMAGE_KEY : null,
          extractionScope,
          garmentAnalysis,
          isBatchMode,
          generatedAssets,
          savedAssetIds: Array.from(savedAssetIds),
          assetSupabasePaths: Array.from(assetSupabasePaths.entries()),
          batchSavedAssetIds: isBatchMode ? Array.from(batchSavedAssetIds) : [],
          assetFiles: assetFiles.map(af => ({
            id: af.id,
            fileName: af.file?.name,
            preview: af.imageFile?.dataUrl || af.preview,
            imageFileKey: af.imageFile ? `${BATCH_IMAGE_KEY_PREFIX}-${af.id}` : null,
            status: af.status,
            error: af.error,
            garmentAnalysis: af.garmentAnalysis,
            assetMetadata: (af.generatedAssets && af.supabasePaths?.length) ? af.generatedAssets.map((ga, idx) => {
              const path = af.supabasePaths?.[idx];
              const mainView = ga.views?.find(v => v.viewType === 'Front') || ga.views?.[0];
              return path && mainView ? { category: ga.category, itemName: ga.itemName, viewType: mainView.viewType || 'Front' } : null;
            }).filter(Boolean) : [],
            supabasePaths: af.supabasePaths || [],
            sourceSupabasePath: af.sourceSupabasePath,
            genderWarning: af.genderWarning,
            isGenderMatch: af.isGenderMatch,
          })),
        };
        try {
          saveState(SESSION_STORAGE_KEY, stateToSave);
        } catch (e) {
          console.warn('Failed to save state on leave:', e);
        }
      }
    };
    const handleVisibilityChange = () => {
      if (document.hidden) saveOnLeave();
    };
    const handlePageHide = () => saveOnLeave();
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('pagehide', handlePageHide);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('pagehide', handlePageHide);
      saveOnLeave(); // Also save when component unmounts (SPA navigation)
    };
  }, [isStateRestored, user?.id, isBatchMode, assetFiles, generatedAssets, savedAssetIds, garmentAnalysis, gender, sourceImage, extractionScope, assetSupabasePaths, batchSavedAssetIds, SESSION_STORAGE_KEY, SOURCE_IMAGE_KEY, BATCH_IMAGE_KEY_PREFIX]);

  const handleImageUpload = async (file: ImageFile) => {
    // If user uploads same image with same gender, skip redundant analysis
    const analysisKey = file && gender ? `${gender}-${file.base64}` : null;
    if (analysisKey && analysisKey === lastSingleAnalysisKeyRef.current && garmentAnalysis) {
      setSourceImage(file);
      setGenderWarning(null);
      return;
    }

    lastSingleAnalysisKeyRef.current = analysisKey;
    lastGenderValidationKeyRef.current = null; // force gender revalidate for new image/gender combo
    setSourceImage(file);
    setGenderWarning(null);
    setGarmentAnalysis(null);

    // Analyze the garment based on selected gender
    if (gender && file) {
      setIsAnalyzingGarment(true);
      try {
        let analysis: FemaleGarmentAnalysis | MaleGarmentAnalysis;

        if (gender === 'Female') {
          analysis = await analyzeFemaleGarment(file, gender, user.id);
        } else {
          analysis = await analyzeMaleGarment(file, gender, user.id);
        }

        setGarmentAnalysis(analysis);

        // Set extraction scope based on analysis recommendation
        if (analysis.recommendedExtraction === 'multi-separate') {
          setExtractionScope('multi-separate');
        } else if (analysis.recommendedExtraction === 'separate') {
          setExtractionScope('separate');
        } else if (analysis.recommendedExtraction === 'upper') {
          setExtractionScope('upper');
        } else if (analysis.recommendedExtraction === 'lower') {
          setExtractionScope('lower');
        } else {
          setExtractionScope('full');
        }

        // Show gender mismatch warning if detected
        if (!analysis.isGenderMatch) {
          setGenderWarning(`Warning: The uploaded garment appears to be a ${analysis.garmentType}, but it may not match the selected gender. Please verify your selection.`);
        }
      } catch (err) {
        console.error("Garment analysis failed:", err);
        // Don't block user on analysis failure
        setGarmentAnalysis(null);
      } finally {
        setIsAnalyzingGarment(false);
      }
    }
  };

  // Reset memoized detection keys when image is cleared
  useEffect(() => {
    if (!sourceImage) {
      lastSingleAnalysisKeyRef.current = null;
      lastGenderValidationKeyRef.current = null;
    }
  }, [sourceImage]);

  // Validate gender when image is uploaded
  useEffect(() => {
    const validateGender = async () => {
      // Wait for state to be restored before running
      if (!isStateRestored) return;

      if (!gender || !sourceImage) {
        setGenderWarning(null);
        lastGenderValidationKeyRef.current = null;
        return;
      }

      // CRITICAL: If we already have garmentAnalysis or generatedAssets, 
      // this means the image was already processed. Don't re-run gender detection.
      // This prevents duplicate detection on page refresh/navigation.
      if (garmentAnalysis || generatedAssets.length > 0) {
        // Set the ref to prevent future runs for this image
        const validationKey = `${gender}-${sourceImage.base64}`;
        lastGenderValidationKeyRef.current = validationKey;
        return;
      }

      const validationKey = `${gender}-${sourceImage.base64}`;
      if (validationKey === lastGenderValidationKeyRef.current) {
        return; // Skip duplicate detection for the same image+gender combo
      }

      setIsValidatingGender(true);
      try {
        lastGenderValidationKeyRef.current = validationKey;
        const detectedGender = await detectGender(sourceImage, user.id);
        if (detectedGender !== 'Unknown' && detectedGender !== gender) {
          setGenderWarning(`Warning: Your selected gender is '${gender}', but the photo appears to be of a '${detectedGender}' person. Please correct the selection or upload a different image.`);
        } else {
          setGenderWarning(null);
        }
      } catch (err) {
        console.error("Gender detection failed:", err);
        lastGenderValidationKeyRef.current = null; // Allow retry on failure
        setGenderWarning(null); // Fail open, don't block user on API error
      } finally {
        setIsValidatingGender(false);
      }
    };

    validateGender();
  }, [gender, sourceImage, isStateRestored, garmentAnalysis, generatedAssets.length]);

  const handleSetGender = async (selectedGender: 'Male' | 'Female') => {
    setGender(selectedGender);
    setGenderWarning(null); // Clear any previous warnings
    // For women, lock the scope to 'full'. For men, default to 'full' but allow changes via UI.
    setExtractionScope('full');

    // Validate gender for all uploaded batch files
    if (isBatchMode && assetFiles.length > 0) {
      for (const assetFile of assetFiles) {
        if (assetFile.imageFile) {
          try {
            const detectedGender = await detectGender(assetFile.imageFile, user.id);
            const isMatch = detectedGender === selectedGender || detectedGender === 'Unknown';
            const warning = !isMatch && detectedGender !== 'Unknown'
              ? `Gender mismatch: Detected ${detectedGender}, but selected ${selectedGender}`
              : null;

            setAssetFiles(prev => prev.map(f =>
              f.id === assetFile.id ? {
                ...f,
                isGenderMatch: isMatch,
                genderWarning: warning
              } : f
            ));
          } catch (err) {
            console.error(`Failed to validate gender for ${assetFile.id}:`, err);
            // Continue even if gender validation fails
          }
        }
      }
    }
  };

  // Batch processing functions
  const handleBatchFilesUpload = async (files: FileList | File[]) => {
    const fileArray = Array.from(files);
    const newFiles: AssetFile[] = fileArray.map(file => ({
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      file,
      preview: URL.createObjectURL(file),
      imageFile: null,
      status: 'queued' as const,
      error: null,
      garmentAnalysis: null,
      generatedAssets: [],
      genderWarning: null,
      isGenderMatch: true,
    }));

    setAssetFiles(prev => [...prev, ...newFiles]);
    setIsBatchMode(true);

    // Convert files to ImageFile format, save to IndexedDB, and upload to Supabase
    // Also validate gender if gender is already selected
    for (const assetFile of newFiles) {
      try {
        const imageFile = await fileToImageFile(assetFile.file);
        // Save image file immediately to IndexedDB for state persistence
        await saveImage(`${BATCH_IMAGE_KEY_PREFIX}-${assetFile.id}`, imageFile);

        // Upload source image to Supabase Storage for persistent state
        let sourceSupabasePath: string | undefined;
        try {
          sourceSupabasePath = await uploadAssetGeneratorSourceImage(user.id, assetFile.id, imageFile.base64);
        } catch (err) {
          console.error(`Failed to upload source image to Supabase for ${assetFile.id}:`, err);
          // Continue even if Supabase upload fails - IndexedDB backup is available
        }

        // Update preview to use dataUrl for persistence
        setAssetFiles(prev => prev.map(f =>
          f.id === assetFile.id ? {
            ...f,
            imageFile,
            preview: imageFile.dataUrl,
            sourceSupabasePath: sourceSupabasePath
          } : f
        ));

        // Validate gender if gender is already selected
        if (gender && imageFile) {
          try {
            const detectedGender = await detectGender(imageFile, user.id);
            const isMatch = detectedGender === gender || detectedGender === 'Unknown';
            const warning = !isMatch && detectedGender !== 'Unknown'
              ? `Gender mismatch: Detected ${detectedGender}, but selected ${gender}`
              : null;

            setAssetFiles(prev => prev.map(f =>
              f.id === assetFile.id ? {
                ...f,
                isGenderMatch: isMatch,
                genderWarning: warning
              } : f
            ));
          } catch (err) {
            console.error(`Failed to validate gender for ${assetFile.id}:`, err);
            // Continue even if gender validation fails
          }
        }
      } catch (err) {
        console.error(`Failed to process file ${assetFile.id}:`, err);
        setAssetFiles(prev => prev.map(f =>
          f.id === assetFile.id ? { ...f, status: 'error' as const, error: 'Failed to load image' } : f
        ));
      }
    }
  };

  const handleRemoveBatchFile = async (id: string) => {
    const fileToRemove = assetFiles.find(f => f.id === id);

    // Delete from Supabase Storage if path exists
    if (fileToRemove?.sourceSupabasePath) {
      try {
        await deleteAssetGeneratorSourceImage(fileToRemove.sourceSupabasePath);
      } catch (err) {
        console.error(`Failed to delete source image from Supabase for ${id}:`, err);
      }
    }

    // Delete generated assets from Supabase if they exist
    if (fileToRemove?.supabasePaths && fileToRemove.supabasePaths.length > 0) {
      for (const path of fileToRemove.supabasePaths) {
        try {
          await deleteAssetGeneratorImage(path);
        } catch (err) {
          console.error(`Failed to delete generated asset from Supabase:`, err);
        }
      }
    }

    setAssetFiles(prev => {
      const file = prev.find(f => f.id === id);
      // Only revoke blob URLs, not dataUrls
      if (file?.preview && file.preview.startsWith('blob:')) {
        URL.revokeObjectURL(file.preview);
      }
      return prev.filter(f => f.id !== id);
    });

    // Delete from IndexedDB
    try {
      await deleteImage(`${BATCH_IMAGE_KEY_PREFIX}-${id}`);
    } catch (err) {
      console.error(`Failed to delete image file for ${id}:`, err);
    }
  };

  const handleClearBatch = async () => {
    // Delete all source images and generated assets from Supabase
    for (const file of assetFiles) {
      // Delete source image from Supabase
      if (file.sourceSupabasePath) {
        try {
          await deleteAssetGeneratorSourceImage(file.sourceSupabasePath);
        } catch (err) {
          console.error(`Failed to delete source image from Supabase for ${file.id}:`, err);
        }
      }

      // Delete generated assets from Supabase
      if (file.supabasePaths && file.supabasePaths.length > 0) {
        for (const path of file.supabasePaths) {
          try {
            await deleteAssetGeneratorImage(path);
          } catch (err) {
            console.error(`Failed to delete Supabase image ${path}:`, err);
          }
        }
      }

      // Revoke blob URLs and delete saved image files
      if (file.preview && file.preview.startsWith('blob:')) {
        URL.revokeObjectURL(file.preview);
      }
      if (file.imageFile) {
        try {
          await deleteImage(`${BATCH_IMAGE_KEY_PREFIX}-${file.id}`);
        } catch (err) {
          console.error(`Failed to delete image file for ${file.id}:`, err);
        }
      }
    }
    // Clear all files and reset progress, but stay in batch mode
    setAssetFiles([]);
    setBatchProgress({ completed: 0, total: 0 });
    setBatchSavedAssetIds(new Set());
    setError(null);
    // Keep isBatchMode as true - don't switch to single image mode
  };

  const handleBatchGenerate = async () => {
    if (!gender || assetFiles.length === 0) {
      setError('Please select a gender and upload at least one image.');
      return;
    }

    const validFiles = assetFiles.filter(f => f.imageFile && f.status !== 'error');
    if (validFiles.length === 0) {
      setError('No valid images to process.');
      return;
    }

    // CRITICAL: Filter out already successfully processed files
    // Only process files that are not already in 'success' status
    const filesNeedingProcessing = validFiles.filter(f => f.status !== 'success');
    if (filesNeedingProcessing.length === 0) {
      // All files are already processed
      setError('All images have already been processed successfully.');
      setIsProcessingBatch(false);
      return;
    }

    // Check for gender mismatches (only for files that need processing)
    const filesWithGenderMismatch = filesNeedingProcessing.filter(f => f.genderWarning);
    if (filesWithGenderMismatch.length > 0) {
      const confirmMessage = `${filesWithGenderMismatch.length} image${filesWithGenderMismatch.length > 1 ? 's' : ''} have gender mismatches. Do you want to continue anyway?`;
      if (!window.confirm(confirmMessage)) {
        return;
      }
    }

    setIsProcessingBatch(true);
    setError(null);
    setBatchProgress({ completed: 0, total: validFiles.length });

    // Set all files needing processing to queued - only one will show processing at a time
    setAssetFiles(prev => prev.map(f =>
      filesNeedingProcessing.some(vf => vf.id === f.id) && f.status !== 'success'
        ? { ...f, status: 'queued' }
        : f
    ));

    // First, analyze all files one by one (queue-wise)
    // Store analysis results to avoid re-analyzing
    // CRITICAL: Only analyze files that are NOT already successfully processed
    const filesToAnalyze = validFiles.filter(f => f.status !== 'success' && f.status !== 'error');
    const fileAnalyses = new Map<string, { analysis: FemaleGarmentAnalysis | MaleGarmentAnalysis | null, scope: string }>();
    let totalCreditsNeeded = 0;

    // For already successful files, use existing analysis and calculate credits from existing scope
    validFiles.filter(f => f.status === 'success').forEach(assetFile => {
      if (assetFile.garmentAnalysis) {
        // Use existing analysis
        let scope = extractionScope;
        if (assetFile.garmentAnalysis.recommendedExtraction === 'multi-separate') {
          scope = 'multi-separate';
        } else if (assetFile.garmentAnalysis.recommendedExtraction === 'separate') {
          scope = 'separate';
        } else if (assetFile.garmentAnalysis.recommendedExtraction === 'upper') {
          scope = 'upper';
        } else if (assetFile.garmentAnalysis.recommendedExtraction === 'lower') {
          scope = 'lower';
        } else {
          scope = 'full';
        }
        fileAnalyses.set(assetFile.id, { analysis: assetFile.garmentAnalysis, scope });
        // Don't add credits for already processed files
      }
    });

    try {
      // Analyze files one by one - only current file shows "analyzing"
      for (const assetFile of filesToAnalyze) {
        if (assetFile.imageFile) {
          setAssetFiles(prev => prev.map(f =>
            f.id === assetFile.id ? { ...f, status: 'analyzing' } : f
          ));
          let analysis: FemaleGarmentAnalysis | MaleGarmentAnalysis | null = null;
            if (gender === 'Female') {
              analysis = await analyzeFemaleGarment(assetFile.imageFile, gender, user.id);
            } else {
              analysis = await analyzeMaleGarment(assetFile.imageFile, gender, user.id);
            }

            // Determine extraction scope based on analysis
            let scope = extractionScope;
            if (analysis) {
              if (analysis.recommendedExtraction === 'multi-separate') {
                scope = 'multi-separate';
              } else if (analysis.recommendedExtraction === 'separate') {
                scope = 'separate';
              } else if (analysis.recommendedExtraction === 'upper') {
                scope = 'upper';
              } else if (analysis.recommendedExtraction === 'lower') {
                scope = 'lower';
              } else {
                scope = 'full';
              }
            }

            // Calculate credits for this file based on scope
            const creditsForFile = scope === 'separate' ? 2 :
              scope === 'multi-separate' ? 3 : 1;
            totalCreditsNeeded += creditsForFile;
            fileAnalyses.set(assetFile.id, { analysis, scope });
          setAssetFiles(prev => prev.map(f =>
            f.id === assetFile.id ? { ...f, status: 'queued', garmentAnalysis: analysis } : f
          ));
        }
      }

      // Ensure all analyzed files are queued before generation starts
      setAssetFiles(prev => prev.map(f =>
        filesNeedingProcessing.some(vf => vf.id === f.id) ? { ...f, status: 'queued' } : f
      ));

      // Check if user has enough credits
      const hasCredits = await hasEnoughCredits(user.id, totalCreditsNeeded);
      if (!hasCredits) {
        setError(`Insufficient credits. You need ${totalCreditsNeeded} credit${totalCreditsNeeded > 1 ? 's' : ''} for this batch.`);
        setIsProcessingBatch(false);
        // Reset file statuses (only for files that were being processed)
        setAssetFiles(prev => prev.map(f =>
          filesNeedingProcessing.some(vf => vf.id === f.id) ? { ...f, status: 'queued' } : f
        ));
        return;
      }

      // Now process files and generate assets
      // Use filesNeedingProcessing (already filtered to exclude success/error)
      const filesToProcess = filesNeedingProcessing;
      let completedCount = validFiles.length - filesToProcess.length; // Count already completed
      setBatchProgress({ completed: completedCount, total: validFiles.length });

      // Track processed files to prevent duplicate processing
      const processedFileIds = new Set<string>();

      // Process files one by one (queue-wise)
      for (const assetFile of filesToProcess) {
        if (processedFileIds.has(assetFile.id)) continue;

          // Mark as processing immediately to prevent duplicate processing
          processedFileIds.add(assetFile.id);
          try {
            // Get the analysis and scope we already determined
            const fileData = fileAnalyses.get(assetFile.id);
            const scope = fileData?.scope || extractionScope;
            const analysis = fileData?.analysis || null;

            // Update status: only current file = processing, others waiting = queued
            setAssetFiles(prev => prev.map(f => {
              if (f.id === assetFile.id) return { ...f, status: 'processing' as const, garmentAnalysis: analysis };
              if (filesToProcess.some(vf => vf.id === f.id) && f.status !== 'success' && f.status !== 'error') {
                return { ...f, status: 'queued' as const };
              }
              return f;
            }));

            // Extract assets - this will handle multi-part (3 images for jacket+top+bottom)
            if (assetFile.imageFile) {
              const assets = await extractAssetsFromImage(assetFile.imageFile, scope, gender, user.id);

              // Deduct credits based on actual number of images generated
              const creditsForThisFile = assets.length;
              const creditResult = await deductCredits(user.id, creditsForThisFile, 'asset_generator');
              if (!creditResult.success) {
                throw new Error(creditResult.error || 'Failed to deduct credits');
              }

              // Upload all generated assets to Supabase Storage
              const supabasePaths: string[] = [];
              for (const asset of assets) {
                const mainView = asset.views.find(v => v.viewType === 'Front');
                if (mainView) {
                  try {
                    const assetId = `${assetFile.id}-${asset.category}-${asset.itemName}`;
                    const supabasePath = await uploadAssetGeneratorImage(
                      user.id,
                      mainView.imageBase64,
                      assetId,
                      {
                        item_name: asset.itemName,
                        item_category: asset.category,
                        asset_type: 'individual'
                      }
                    );
                    supabasePaths.push(supabasePath);
                  } catch (err) {
                    console.error(`Failed to upload asset ${asset.itemName} to Supabase:`, err);
                    // Continue with other assets even if one fails
                  }
                }
              }

              // Update with success - assets array contains all parts (e.g., 3 images for multi-separate)
              setAssetFiles(prev => prev.map(f =>
                f.id === assetFile.id ? {
                  ...f,
                  status: 'success',
                  generatedAssets: assets, // Keep in memory for display
                  supabasePaths: supabasePaths, // Store Supabase paths for persistence
                  error: null
                } : f
              ));
            }

            completedCount++;
            setBatchProgress({ completed: completedCount, total: validFiles.length });
          } catch (err) {
            console.error(`Failed to process ${assetFile.id}:`, err);
            setAssetFiles(prev => prev.map(f =>
              f.id === assetFile.id ? {
                ...f,
                status: 'error',
                error: (err as Error).message || 'Processing failed'
              } : f
            ));
            completedCount++;
            setBatchProgress({ completed: completedCount, total: validFiles.length });
          }
      }
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setIsProcessingBatch(false);
    }
  };

  const handleGenerate = async () => {
    if (!gender || !sourceImage) {
      setError('Please select a gender and upload an image.');
      return;
    }

    // Calculate credits needed based on extraction scope
    // full/upper/lower = 1 credit (1 image)
    // separate = 2 credits (2 images: top + bottom)
    // multi-separate = 3 credits (3 images: jacket + top + bottom)
    const creditsNeeded = extractionScope === 'separate' ? 2 :
      extractionScope === 'multi-separate' ? 3 : 1;

    // Check credits before generation
    const hasCredits = await hasEnoughCredits(user.id, creditsNeeded);
    if (!hasCredits) {
      setError(`Insufficient credits. You need ${creditsNeeded} credit${creditsNeeded > 1 ? 's' : ''} for this extraction. Please upgrade your plan to continue.`);
      return;
    }

    setIsGenerating(true);
    setError(null);
    // Stay in setup view - results will show inline
    try {
      // Handle extraction scope
      const actualScope = extractionScope;
      const assets = await extractAssetsFromImage(sourceImage, actualScope, gender, user.id);

      // Deduct credits based on actual number of images generated
      const actualCreditsNeeded = assets.length;
      const creditResult = await deductCredits(user.id, actualCreditsNeeded, 'asset_generator');
      if (!creditResult.success) {
        setError(creditResult.error || 'Failed to deduct credits. Please try again.');
        setIsGenerating(false);
        return;
      }

      // Upload all generated assets to Supabase Storage
      const newPaths = new Map<string, string>();
      for (const asset of assets) {
        const mainView = asset.views.find(v => v.viewType === 'Front');
        if (mainView) {
          try {
            const assetId = `${asset.category}-${asset.itemName}`;
            const supabasePath = await uploadAssetGeneratorImage(
              user.id,
              mainView.imageBase64,
              assetId,
              {
                item_name: asset.itemName,
                item_category: asset.category,
                asset_type: 'individual'
              }
            );
            newPaths.set(assetId, supabasePath);
          } catch (err) {
            console.error(`Failed to upload asset ${asset.itemName} to Supabase:`, err);
            // Continue with other assets even if one fails
          }
        }
      }
      setGeneratedAssets(prev => [...prev, ...assets]);
      setAssetSupabasePaths(prev => {
        const merged = new Map(prev);
        for (const [key, value] of newPaths.entries()) {
          merged.set(key, value);
        }
        return merged;
      });
      // Stay in setup view - results will show inline with previous results preserved
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveWrapper = (data: { imageUrl: string, asset_type: 'individual', item_name: string, item_category: string }) => {
    onSaveToCollection(data);
    const assetId = `${data.item_category}-${data.item_name}`;
    setSavedAssetIds(prev => new Set(prev).add(assetId));
  };

  const handleDownload = (base64: string, filename: string) => {
    const link = document.createElement('a');
    link.href = `data:image/png;base64,${base64}`;
    link.download = `${filename}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleStartOver = async () => {
    // Delete all Supabase images before clearing state
    try {
      // Delete single image mode assets
      for (const path of assetSupabasePaths.values()) {
        try {
          await deleteAssetGeneratorImage(path);
        } catch (err) {
          console.error(`Failed to delete Supabase image ${path}:`, err);
        }
      }

      // Delete batch mode assets
      for (const file of assetFiles) {
        if (file.supabasePaths && file.supabasePaths.length > 0) {
          for (const path of file.supabasePaths) {
            try {
              await deleteAssetGeneratorImage(path);
            } catch (err) {
              console.error(`Failed to delete batch Supabase image ${path}:`, err);
            }
          }
        }
      }
    } catch (err) {
      console.error('Error deleting Supabase images:', err);
    }

    setView('setup');
    setGender(null);
    setSourceImage(null);
    setExtractionScope('full');
    setGeneratedAssets([]);
    setError(null);
    setSavedAssetIds(new Set());
    setAssetSupabasePaths(new Map());
    await deleteImage(SOURCE_IMAGE_KEY);
    removeState(SESSION_STORAGE_KEY);
  };

  const isGenerateDisabled = !gender || !sourceImage || !!genderWarning || isAnalyzingGarment || isValidatingGender;

  return (
    <div className="min-h-screen flex flex-col items-center p-4 sm:p-6 lg:p-8 bg-gradient-to-b from-sky-50 via-white to-white dark:from-gray-900 dark:via-gray-900 dark:to-gray-900 transition-colors duration-200">
      <main className="w-full max-w-6xl bg-white dark:bg-gray-800 rounded-3xl shadow-2xl p-6 sm:p-10 border border-gray-200/50 dark:border-gray-700/50 transition-colors duration-200">
        <div className="text-center mb-8">
          <h1 className="text-display font-bold text-[#2E1E1E] dark:text-white font-headline">E-commerce Asset Generator</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2 text-lg">Turn lifestyle shots into ghost mannequin assets.</p>

          {/* Mode Toggle */}
          <div className="mt-6 flex items-center justify-center gap-4">
            <button
              onClick={() => {
                setIsBatchMode(false);
                // Don't clear assetFiles - preserve them for when user switches back
                // Only clear progress if not processing
                if (!isProcessingBatch) {
                  setBatchProgress({ completed: 0, total: 0 });
                }
              }}
              className={`px-6 py-2 rounded-full font-semibold transition-all ${!isBatchMode
                  ? 'bg-sky-600 text-white shadow-lg'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                }`}
            >
              Single Image
            </button>
            <button
              onClick={() => {
                setIsBatchMode(true);
                // When switching back to batch mode, restore state if needed
                // The state should already be loaded from session storage
              }}
              className={`px-6 py-2 rounded-full font-semibold transition-all ${isBatchMode
                  ? 'bg-sky-600 text-white shadow-lg'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                }`}
            >
              Batch Processing
            </button>
          </div>
        </div>

        {view === 'setup' && (
          <div className="max-w-4xl mx-auto animate-fade-in">
            {!isBatchMode ? (
              <>
                <div className="bg-sky-50 dark:bg-sky-900/20 border-l-4 border-sky-300 dark:border-sky-500 p-4 rounded-r-lg mb-8">
                  <h3 className="font-bold text-sky-600 dark:text-sky-400">Instructions for a Perfect Extraction:</h3>
                  <p className="text-[#2E1E1E]/80 dark:text-gray-300 text-sm mt-1">
                    Provide a lifestyle photo where the garment is clearly visible on a person. The AI will isolate it for you.
                  </p>
                </div>
                {/* Step 1: Gender */}
                <div>
                  <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4"><span className="text-white bg-sky-600 dark:bg-sky-500 rounded-full w-6 h-6 inline-flex items-center justify-center text-sm mr-3">1</span>Select Subject's Gender</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <button onClick={() => handleSetGender('Male')} className={`flex flex-col items-center p-6 border-2 rounded-2xl transition-colors ${gender === 'Male' ? 'border-sky-600 dark:border-sky-500 bg-sky-50 dark:bg-sky-900/30' : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'}`}>
                      <span className="w-10 h-10 mb-2 text-sky-600 dark:text-sky-400"><MaleIcon /></span>
                      <span className="font-semibold text-gray-800 dark:text-white">Male</span>
                    </button>
                    <button onClick={() => handleSetGender('Female')} className={`flex flex-col items-center p-6 border-2 rounded-2xl transition-colors ${gender === 'Female' ? 'border-sky-600 dark:border-sky-500 bg-sky-50 dark:bg-sky-900/30' : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'}`}>
                      <span className="w-10 h-10 mb-2 text-sky-600 dark:text-sky-400"><FemaleIcon /></span>
                      <span className="font-semibold text-gray-800 dark:text-white">Female</span>
                    </button>
                  </div>
                </div>
                {/* Step 2: Image - Only show after gender is selected */}
                {gender && (
                  <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700 animate-fade-in">
                    <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4"><span className="text-white bg-sky-600 dark:bg-sky-500 rounded-full w-6 h-6 inline-flex items-center justify-center text-sm mr-3">2</span>Upload Lifestyle Photo</h3>
                    <div className="max-w-md mx-auto">
                      <ImageUploader id="source-image" title="Upload Photo" onImageUpload={handleImageUpload} icon={<GarmentIcon />} currentFile={sourceImage} />
                      {isValidatingGender && (
                        <div className="mt-6 flex flex-col items-center justify-center">
                          <div className="flex justify-center">
                            <Spinner />
                          </div>
                          <p className="text-sm text-gray-500 dark:text-gray-400 mt-3">Analyzing image with AI...</p>
                        </div>
                      )}
                      {!isValidatingGender && genderWarning && (
                        <div className="mt-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-400 dark:border-yellow-500 rounded-r-lg">
                          <p className="text-sm text-yellow-800 dark:text-yellow-300 font-medium">{genderWarning}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
                {/* Step 3: Scope - Only show after image is uploaded and validation is complete */}
                {gender && sourceImage && !isValidatingGender && gender === 'Male' && (
                  <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700 animate-fade-in">
                    <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4">
                      <span className="text-white bg-sky-600 dark:bg-sky-500 rounded-full w-6 h-6 inline-flex items-center justify-center text-sm mr-3">3</span>
                      Garment Analysis & Extraction Scope
                    </h3>

                    {isAnalyzingGarment && (
                      <div className="p-4 bg-sky-50 dark:bg-sky-900/20 rounded-lg border border-sky-200 dark:border-sky-800">
                        <div className="flex items-center justify-center">
                          <Spinner />
                          <p className="ml-3 text-sm text-sky-700 dark:text-sky-300">Analyzing garment with AI...</p>
                        </div>
                      </div>
                    )}

                    {!isAnalyzingGarment && garmentAnalysis && (
                      <div className="space-y-4">
                        <div className="p-4 bg-sky-50 dark:bg-sky-900/20 rounded-lg border border-sky-200 dark:border-sky-800">
                          <div className="flex items-start justify-between mb-2">
                            <h4 className="font-semibold text-gray-800 dark:text-white">Garment Type:</h4>
                            <span className="px-3 py-1 bg-sky-600 dark:bg-sky-500 text-white text-xs font-bold rounded-full uppercase">
                              {garmentAnalysis.garmentType}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-300 mt-2">{garmentAnalysis.description}</p>
                          {garmentAnalysis.canSeparate && (
                            <div className="mt-2">
                              <p className="text-xs text-sky-600 dark:text-sky-400 font-medium">
                                ✓ This garment can be separated into {garmentAnalysis.partsCount || 2} parts
                              </p>
                              {garmentAnalysis.separationParts && garmentAnalysis.separationParts.length > 0 && (
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                  Parts: {garmentAnalysis.separationParts.join(', ')}
                                </p>
                              )}
                            </div>
                          )}
                        </div>

                        <div className="flex flex-col md:flex-row md:space-x-6 space-y-3 md:space-y-0">
                          {/* Always show Full Outfit option */}
                          <label className={`flex items-center space-x-3 cursor-pointer p-3 rounded-lg border-2 transition-colors ${extractionScope === 'full'
                              ? 'border-sky-600 dark:border-sky-500 bg-sky-50 dark:bg-sky-900/30'
                              : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
                            }`}>
                            <input
                              type="radio"
                              name="scope-male"
                              value="full"
                              checked={extractionScope === 'full'}
                              onChange={() => setExtractionScope('full')}
                              className="h-5 w-5 rounded-full border-gray-300 dark:border-gray-600 text-sky-600 dark:text-sky-400 focus:ring-sky-600 dark:focus:ring-sky-500"
                            />
                            <div>
                              <span className="font-medium text-gray-700 dark:text-gray-300 block">Full Outfit</span>
                              <span className="text-xs text-gray-500 dark:text-gray-400">Extract as single piece</span>
                            </div>
                          </label>

                          {/* Show Separate option ONLY if analysis says it can be separated */}
                          {garmentAnalysis.canSeparate && garmentAnalysis.separationParts && garmentAnalysis.separationParts.length > 0 && (
                            <label className={`flex items-center space-x-3 cursor-pointer p-3 rounded-lg border-2 transition-colors ${(extractionScope === 'separate' || extractionScope === 'multi-separate')
                                ? 'border-sky-600 dark:border-sky-500 bg-sky-50 dark:bg-sky-900/30'
                                : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
                              }`}>
                              <input
                                type="radio"
                                name="scope-male"
                                value={garmentAnalysis.partsCount && garmentAnalysis.partsCount >= 3 ? 'multi-separate' : 'separate'}
                                checked={extractionScope === 'separate' || extractionScope === 'multi-separate'}
                                onChange={() => setExtractionScope(garmentAnalysis.partsCount && garmentAnalysis.partsCount >= 3 ? 'multi-separate' : 'separate')}
                                className="h-5 w-5 rounded-full border-gray-300 dark:border-gray-600 text-sky-600 dark:text-sky-400 focus:ring-sky-600 dark:focus:ring-sky-500"
                              />
                              <div>
                                <span className="font-medium text-gray-700 dark:text-gray-300 block">
                                  Separate ({garmentAnalysis.separationParts.map((part, idx) =>
                                    part.charAt(0).toUpperCase() + part.slice(1).replace(/-/g, ' ')
                                  ).join(', ')})
                                </span>
                                <span className="text-xs text-gray-500 dark:text-gray-400">
                                  Extract as {garmentAnalysis.partsCount || garmentAnalysis.separationParts.length} {garmentAnalysis.partsCount === 1 ? 'piece' : 'pieces'}
                                </span>
                              </div>
                            </label>
                          )}

                          {/* Show Upper Only if garment has upper part */}
                          {garmentAnalysis.hasUpperPart !== false && (
                            <label className={`flex items-center space-x-3 cursor-pointer p-3 rounded-lg border-2 transition-colors ${extractionScope === 'upper'
                                ? 'border-sky-600 dark:border-sky-500 bg-sky-50 dark:bg-sky-900/30'
                                : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
                              }`}>
                              <input
                                type="radio"
                                name="scope-male"
                                value="upper"
                                checked={extractionScope === 'upper'}
                                onChange={() => setExtractionScope('upper')}
                                className="h-5 w-5 rounded-full border-gray-300 dark:border-gray-600 text-sky-600 dark:text-sky-400 focus:ring-sky-600 dark:focus:ring-sky-500"
                              />
                              <div>
                                <span className="font-medium text-gray-700 dark:text-gray-300 block">Upper Only</span>
                                <span className="text-xs text-gray-500 dark:text-gray-400">
                                  Extract {garmentAnalysis.separationParts?.find(p => p.includes('jacket')) ? 'jacket' : garmentAnalysis.separationParts?.find(p => p.includes('shirt')) ? 'shirt' : 'top'} portion
                                </span>
                              </div>
                            </label>
                          )}

                          {/* Show Lower Only if garment has lower part */}
                          {garmentAnalysis.hasLowerPart !== false && (
                            <label className={`flex items-center space-x-3 cursor-pointer p-3 rounded-lg border-2 transition-colors ${extractionScope === 'lower'
                                ? 'border-sky-600 dark:border-sky-500 bg-sky-50 dark:bg-sky-900/30'
                                : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
                              }`}>
                              <input
                                type="radio"
                                name="scope-male"
                                value="lower"
                                checked={extractionScope === 'lower'}
                                onChange={() => setExtractionScope('lower')}
                                className="h-5 w-5 rounded-full border-gray-300 dark:border-gray-600 text-sky-600 dark:text-sky-400 focus:ring-sky-600 dark:focus:ring-sky-500"
                              />
                              <div>
                                <span className="font-medium text-gray-700 dark:text-gray-300 block">Lower Only</span>
                                <span className="text-xs text-gray-500 dark:text-gray-400">Extract bottom portion</span>
                              </div>
                            </label>
                          )}
                        </div>
                      </div>
                    )}

                    {!isAnalyzingGarment && !garmentAnalysis && (
                      <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700">
                        <p className="text-sm text-gray-600 dark:text-gray-400">Upload an image to analyze the garment and see extraction options.</p>
                      </div>
                    )}
                  </div>
                )}
                {gender && sourceImage && !isValidatingGender && gender === 'Female' && (
                  <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700 animate-fade-in">
                    <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4">
                      <span className="text-white bg-sky-600 dark:bg-sky-500 rounded-full w-6 h-6 inline-flex items-center justify-center text-sm mr-3">3</span>
                      Garment Analysis & Extraction Scope
                    </h3>

                    {isAnalyzingGarment && (
                      <div className="p-4 bg-sky-50 dark:bg-sky-900/20 rounded-lg border border-sky-200 dark:border-sky-800">
                        <div className="flex items-center justify-center">
                          <Spinner />
                          <p className="ml-3 text-sm text-sky-700 dark:text-sky-300">Analyzing garment with AI...</p>
                        </div>
                      </div>
                    )}

                    {!isAnalyzingGarment && garmentAnalysis && (
                      <div className="space-y-4">
                        <div className="p-4 bg-sky-50 dark:bg-sky-900/20 rounded-lg border border-sky-200 dark:border-sky-800">
                          <div className="flex items-start justify-between mb-2">
                            <h4 className="font-semibold text-gray-800 dark:text-white">Garment Type:</h4>
                            <span className="px-3 py-1 bg-sky-600 dark:bg-sky-500 text-white text-xs font-bold rounded-full uppercase">
                              {garmentAnalysis.garmentType}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-300 mt-2">{garmentAnalysis.description}</p>
                          {garmentAnalysis.canSeparate && (
                            <div className="mt-2">
                              <p className="text-xs text-sky-600 dark:text-sky-400 font-medium">
                                ✓ This garment can be separated into {garmentAnalysis.partsCount || 2} parts
                              </p>
                              {garmentAnalysis.separationParts && garmentAnalysis.separationParts.length > 0 && (
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                  Parts: {garmentAnalysis.separationParts.join(', ')}
                                </p>
                              )}
                            </div>
                          )}
                        </div>

                        <div className="flex flex-col md:flex-row md:space-x-6 space-y-3 md:space-y-0">
                          {/* Always show Full Outfit option */}
                          <label className={`flex items-center space-x-3 cursor-pointer p-3 rounded-lg border-2 transition-colors ${extractionScope === 'full'
                              ? 'border-sky-600 dark:border-sky-500 bg-sky-50 dark:bg-sky-900/30'
                              : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
                            }`}>
                            <input
                              type="radio"
                              name="scope-female"
                              value="full"
                              checked={extractionScope === 'full'}
                              onChange={() => setExtractionScope('full')}
                              className="h-5 w-5 rounded-full border-gray-300 dark:border-gray-600 text-sky-600 dark:text-sky-400 focus:ring-sky-600 dark:focus:ring-sky-500"
                            />
                            <div>
                              <span className="font-medium text-gray-700 dark:text-gray-300 block">Full Outfit</span>
                              <span className="text-xs text-gray-500 dark:text-gray-400">Extract as single piece</span>
                            </div>
                          </label>

                          {/* Show Separate option ONLY if analysis says it can be separated */}
                          {garmentAnalysis.canSeparate && garmentAnalysis.separationParts && garmentAnalysis.separationParts.length > 0 && (
                            <label className={`flex items-center space-x-3 cursor-pointer p-3 rounded-lg border-2 transition-colors ${(extractionScope === 'separate' || extractionScope === 'multi-separate')
                                ? 'border-sky-600 dark:border-sky-500 bg-sky-50 dark:bg-sky-900/30'
                                : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
                              }`}>
                              <input
                                type="radio"
                                name="scope-female"
                                value={garmentAnalysis.partsCount && garmentAnalysis.partsCount >= 3 ? 'multi-separate' : 'separate'}
                                checked={extractionScope === 'separate' || extractionScope === 'multi-separate'}
                                onChange={() => setExtractionScope(garmentAnalysis.partsCount && garmentAnalysis.partsCount >= 3 ? 'multi-separate' : 'separate')}
                                className="h-5 w-5 rounded-full border-gray-300 dark:border-gray-600 text-sky-600 dark:text-sky-400 focus:ring-sky-600 dark:focus:ring-sky-500"
                              />
                              <div>
                                <span className="font-medium text-gray-700 dark:text-gray-300 block">
                                  Separate ({garmentAnalysis.separationParts.map((part, idx) =>
                                    part.charAt(0).toUpperCase() + part.slice(1).replace(/-/g, ' ')
                                  ).join(', ')})
                                </span>
                                <span className="text-xs text-gray-500 dark:text-gray-400">
                                  Extract as {garmentAnalysis.partsCount || garmentAnalysis.separationParts.length} {garmentAnalysis.partsCount === 1 ? 'piece' : 'pieces'}
                                </span>
                              </div>
                            </label>
                          )}

                          {/* Show Upper Only if garment has upper part (top, jacket, or dress-top) */}
                          {garmentAnalysis.separationParts && (
                            garmentAnalysis.separationParts.some(part => part.includes('top') || part.includes('jacket') || part.includes('blouse') || part.includes('dress-top'))
                          ) && (
                              <label className={`flex items-center space-x-3 cursor-pointer p-3 rounded-lg border-2 transition-colors ${extractionScope === 'upper'
                                  ? 'border-sky-600 dark:border-sky-500 bg-sky-50 dark:bg-sky-900/30'
                                  : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
                                }`}>
                                <input
                                  type="radio"
                                  name="scope-female"
                                  value="upper"
                                  checked={extractionScope === 'upper'}
                                  onChange={() => setExtractionScope('upper')}
                                  className="h-5 w-5 rounded-full border-gray-300 dark:border-gray-600 text-sky-600 dark:text-sky-400 focus:ring-sky-600 dark:focus:ring-sky-500"
                                />
                                <div>
                                  <span className="font-medium text-gray-700 dark:text-gray-300 block">Upper Only</span>
                                  <span className="text-xs text-gray-500 dark:text-gray-400">
                                    Extract {garmentAnalysis.separationParts.find(p => p.includes('jacket')) ? 'jacket' : 'top'} portion
                                  </span>
                                </div>
                              </label>
                            )}

                          {/* Show Lower Only if garment has lower part (bottom, skirt, or dress-bottom) */}
                          {garmentAnalysis.separationParts && (
                            garmentAnalysis.separationParts.some(part => part.includes('bottom') || part.includes('skirt') || part.includes('dress-bottom') || part.includes('pants') || part.includes('shorts'))
                          ) && (
                              <label className={`flex items-center space-x-3 cursor-pointer p-3 rounded-lg border-2 transition-colors ${extractionScope === 'lower'
                                  ? 'border-sky-600 dark:border-sky-500 bg-sky-50 dark:bg-sky-900/30'
                                  : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
                                }`}>
                                <input
                                  type="radio"
                                  name="scope-female"
                                  value="lower"
                                  checked={extractionScope === 'lower'}
                                  onChange={() => setExtractionScope('lower')}
                                  className="h-5 w-5 rounded-full border-gray-300 dark:border-gray-600 text-sky-600 dark:text-sky-400 focus:ring-sky-600 dark:focus:ring-sky-500"
                                />
                                <div>
                                  <span className="font-medium text-gray-700 dark:text-gray-300 block">Lower Only</span>
                                  <span className="text-xs text-gray-500 dark:text-gray-400">Extract bottom portion</span>
                                </div>
                              </label>
                            )}
                        </div>
                      </div>
                    )}

                    {!isAnalyzingGarment && !garmentAnalysis && (
                      <div className="p-4 bg-gray-100 dark:bg-gray-700/50 rounded-lg">
                        <p className="font-medium text-gray-700 dark:text-gray-300">Upload an image to analyze the garment type.</p>
                      </div>
                    )}
                  </div>
                )}
                {/* Step 4: Generate - Only show after image is uploaded and validation is complete */}
                {gender && sourceImage && (
                  <div className="mt-10 text-center">
                    <button onClick={handleGenerate} disabled={isGenerateDisabled} className="px-12 py-4 bg-sky-600 text-white font-semibold rounded-full shadow-lg hover:bg-sky-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center mx-auto">
                      {isAnalyzingGarment || isValidatingGender ? (
                        <>
                          <Spinner />
                          <span className="ml-2">{isAnalyzingGarment ? 'Analyzing Garment...' : 'Validating...'}</span>
                        </>
                      ) : (
                        'Generate Assets'
                      )}
                    </button>
                    {isGenerateDisabled && genderWarning && !isAnalyzingGarment && !isValidatingGender && (
                      <p className="mt-4 text-sm text-yellow-600 dark:text-yellow-400 font-medium">Please resolve the gender mismatch before generating assets.</p>
                    )}
                    {isGenerateDisabled && (isAnalyzingGarment || isValidatingGender) && (
                      <p className="mt-4 text-sm text-gray-600 dark:text-gray-400 font-medium">Please wait while we analyze your garment...</p>
                    )}
                    {error && <p className="mt-4 text-sky-600 dark:text-sky-400">{error}</p>}
                  </div>
                )}

                {/* Show skeleton loading cards during generation */}
                {isGenerating && sourceImage && (
                  <div className="mt-10 pt-6 border-t border-gray-200 dark:border-gray-700">
                    <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">Generating Assets...</h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
                      {/* Show skeleton cards based on extraction scope */}
                      {Array.from({ length: extractionScope === 'separate' ? 2 : extractionScope === 'multi-separate' ? 3 : 1 }).map((_, idx) => (
                        <div key={idx} className="flex flex-col">
                          <div className="relative group aspect-[4/5] bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200 dark:bg-gray-800 dark:border-gray-700">
                            {/* Blurred source image in background */}
                            <img
                              src={sourceImage.dataUrl}
                              alt="Source"
                              className="w-full h-full object-cover blur-md opacity-30"
                            />
                            {/* Loading overlay */}
                            <div className="absolute inset-0 bg-gray-50/80 dark:bg-gray-700/80 backdrop-blur-sm flex flex-col items-center justify-center">
                              <Spinner />
                              <p className="mt-4 text-[10px] font-bold text-gray-600 dark:text-gray-400 uppercase tracking-widest animate-pulse">Extracting Asset...</p>
                            </div>
                          </div>
                          <div className="mt-2 h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                          <div className="mt-1 h-3 bg-gray-200 dark:bg-gray-700 rounded w-2/3 animate-pulse"></div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Show generated assets inline in setup view */}
                {!isGenerating && generatedAssets.length > 0 && (
                  <div className="mt-10 pt-6 border-t border-gray-200 dark:border-gray-700">
                    <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">Generated Assets</h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
                      {generatedAssets.map(asset => {
                        const mainView = asset.views.find(v => v.viewType === 'Front');
                        if (!mainView) return null;
                        const assetId = `${asset.category}-${asset.itemName}`;
                        const isSaved = savedAssetIds.has(assetId);

                        return (
                          <div key={assetId} className="flex flex-col">
                            <div className="relative group aspect-[4/5] bg-gray-50 dark:bg-gray-800/50 rounded-xl shadow-lg overflow-hidden border border-gray-200 dark:border-gray-700 flex items-center justify-center">
                              <img
                                src={`data:image/png;base64,${mainView.imageBase64}`}
                                alt={asset.itemName}
                                className="max-w-full max-h-full w-auto h-auto object-contain object-center cursor-pointer"
                                onClick={() => {
                                  closedViaBackButton.current = false;
                                  setFullscreenImage(`data:image/png;base64,${mainView.imageBase64}`);
                                }}
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                                <div className="absolute top-2 right-2 z-10 flex gap-2">
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      closedViaBackButton.current = false;
                                      setFullscreenImage(`data:image/png;base64,${mainView.imageBase64}`);
                                    }}
                                    className="p-2 bg-black/50 text-white rounded-full hover:bg-purple-600 transition-colors"
                                    title="Expand to fullscreen"
                                  >
                                    <ExpandIcon />
                                  </button>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleDownload(mainView.imageBase64, asset.itemName);
                                    }}
                                    className="p-2 bg-black/50 text-white rounded-full hover:bg-green-600 transition-colors"
                                    title="Download"
                                  >
                                    <DownloadIcon />
                                  </button>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleSaveWrapper({
                                        imageUrl: `data:image/png;base64,${mainView.imageBase64}`,
                                        asset_type: 'individual',
                                        item_name: asset.itemName,
                                        item_category: asset.category
                                      });
                                    }}
                                    className={`p-2 rounded-full transition-colors ${isSaved
                                        ? 'bg-green-600 text-white'
                                        : 'bg-black/50 text-white hover:bg-sky-600'
                                      }`}
                                    title={isSaved ? "Saved to collection" : "Save to collection"}
                                  >
                                    <SaveIcon />
                                  </button>
                                </div>
                              </div>
                            </div>
                            <h4 className="mt-2 font-semibold text-gray-800 dark:text-white text-sm">{asset.itemName}</h4>
                            <p className="text-xs text-gray-500 dark:text-gray-400">{asset.category}</p>
                          </div>
                        );
                      })}
                    </div>

                    {/* Start Over button */}
                    <div className="mt-8 text-center">
                      <button
                        onClick={handleStartOver}
                        className="px-6 py-2 bg-gray-600 text-white font-semibold rounded-full shadow-lg hover:bg-gray-700 transition-colors"
                      >
                        Start Over
                      </button>
                    </div>
                  </div>
                )}
              </>
            ) : (
              /* Batch Mode UI */
              <>
                <div className="bg-sky-50 dark:bg-sky-900/20 border-l-4 border-sky-300 dark:border-sky-500 p-4 rounded-r-lg mb-8">
                  <h3 className="font-bold text-sky-600 dark:text-sky-400">Batch Processing Mode:</h3>
                  <p className="text-[#2E1E1E]/80 dark:text-gray-300 text-sm mt-1">
                    Upload multiple images to process them all at once. Each image will be analyzed and extracted automatically.
                  </p>
                </div>

                {/* Step 1: Gender */}
                <div>
                  <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4">
                    <span className="text-white bg-sky-600 dark:bg-sky-500 rounded-full w-6 h-6 inline-flex items-center justify-center text-sm mr-3">1</span>
                    Select Subject's Gender
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <button onClick={() => handleSetGender('Male')} className={`flex flex-col items-center p-6 border-2 rounded-2xl transition-colors ${gender === 'Male' ? 'border-sky-600 dark:border-sky-500 bg-sky-50 dark:bg-sky-900/30' : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'}`}>
                      <span className="w-10 h-10 mb-2 text-sky-600 dark:text-sky-400"><MaleIcon /></span>
                      <span className="font-semibold text-gray-800 dark:text-white">Male</span>
                    </button>
                    <button onClick={() => handleSetGender('Female')} className={`flex flex-col items-center p-6 border-2 rounded-2xl transition-colors ${gender === 'Female' ? 'border-sky-600 dark:border-sky-500 bg-sky-50 dark:bg-sky-900/30' : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'}`}>
                      <span className="w-10 h-10 mb-2 text-sky-600 dark:text-sky-400"><FemaleIcon /></span>
                      <span className="font-semibold text-gray-800 dark:text-white">Female</span>
                    </button>
                  </div>
                </div>

                {/* Step 2: Batch File Upload */}
                {gender && (
                  <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
                    <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4">
                      <span className="text-white bg-sky-600 dark:bg-sky-500 rounded-full w-6 h-6 inline-flex items-center justify-center text-sm mr-3">2</span>
                      Upload Multiple Images
                    </h3>
                    <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-6 text-center hover:border-sky-400 dark:hover:border-sky-500 transition-colors bg-gray-50 dark:bg-gray-800/50">
                      {assetFiles.length === 0 ? (
                        <>
                          <input
                            type="file"
                            multiple
                            accept="image/*"
                            onChange={(e) => {
                              if (e.target.files) {
                                handleBatchFilesUpload(e.target.files);
                              }
                            }}
                            className="hidden"
                            id="batch-file-input"
                          />
                          <label htmlFor="batch-file-input" className="cursor-pointer flex flex-col items-center justify-center py-4">
                            <div className="w-12 h-12 text-sky-600 dark:text-sky-400 mb-3">
                              <GarmentIcon />
                            </div>
                            <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">Click to upload or drag and drop</p>
                            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Multiple images supported</p>
                          </label>
                        </>
                      ) : (
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <h4 className="font-semibold text-gray-800 dark:text-white">
                              {assetFiles.length} image{assetFiles.length !== 1 ? 's' : ''} uploaded
                            </h4>
                            <div className="flex gap-2">
                              <input
                                type="file"
                                multiple
                                accept="image/*"
                                onChange={(e) => {
                                  if (e.target.files) {
                                    handleBatchFilesUpload(e.target.files);
                                  }
                                }}
                                className="hidden"
                                id="batch-file-input-add"
                              />
                              <label htmlFor="batch-file-input-add" className="text-sm text-sky-600 dark:text-sky-400 hover:underline cursor-pointer">
                                Add More
                              </label>
                              <button
                                onClick={handleClearBatch}
                                className="text-sm text-red-600 dark:text-red-400 hover:underline"
                              >
                                Clear All
                              </button>
                            </div>
                          </div>
                          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                            {assetFiles.map((file) => (
                              <div key={file.id} className="relative border-2 border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden group">
                                <img src={file.preview} alt={file.file.name} className="w-full h-32 object-cover" />
                                <div className="p-2 bg-white dark:bg-gray-800">
                                  <p className="text-xs text-gray-600 dark:text-gray-400 truncate">{file.file.name}</p>
                                  <div className="mt-1 flex flex-col gap-1">
                                    <div className="flex items-center gap-2">
                                      {file.status === 'queued' && <span className="text-xs text-gray-500">Queued</span>}
                                      {file.status === 'analyzing' && (
                                        <>
                                          <Spinner />
                                          <span className="text-xs text-sky-600">Analyzing</span>
                                        </>
                                      )}
                                      {file.status === 'processing' && (
                                        <>
                                          <Spinner />
                                          <span className="text-xs text-blue-600">Processing</span>
                                        </>
                                      )}
                                      {file.status === 'success' && <span className="text-xs text-green-600">✓ Success</span>}
                                      {file.status === 'error' && <span className="text-xs text-red-600">✗ Error</span>}
                                    </div>
                                    {file.genderWarning && (
                                      <span className="text-xs text-yellow-600 dark:text-yellow-400 font-medium" title={file.genderWarning}>
                                        ⚠ Gender mismatch
                                      </span>
                                    )}
                                  </div>
                                </div>
                                <button
                                  onClick={() => handleRemoveBatchFile(file.id)}
                                  className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                  ×
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Batch Progress */}
                    {isProcessingBatch && batchProgress.total > 0 && (
                      <div className="mt-6 p-4 bg-sky-50 dark:bg-sky-900/20 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-semibold text-gray-800 dark:text-white">Processing Queue</span>
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            {batchProgress.completed} / {batchProgress.total}
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                          <div
                            className="bg-sky-600 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${(batchProgress.completed / batchProgress.total) * 100}%` }}
                          />
                        </div>
                      </div>
                    )}

                    {/* Generate Button */}
                    {gender && assetFiles.length > 0 && (
                      <div className="mt-8 text-center">
                        <button
                          onClick={handleBatchGenerate}
                          disabled={isProcessingBatch || assetFiles.every(f => !f.imageFile)}
                          className="px-12 py-4 bg-sky-600 text-white font-semibold rounded-full shadow-lg hover:bg-sky-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center mx-auto"
                        >
                          {isProcessingBatch ? (
                            <>
                              <Spinner />
                              <span className="ml-2">Processing Queue...</span>
                            </>
                          ) : (
                            `Generate Assets (${assetFiles.filter(f => f.imageFile).length} images)`
                          )}
                        </button>
                        {error && <p className="mt-4 text-red-600 dark:text-red-400">{error}</p>}
                      </div>
                    )}

                    {/* Batch Results */}
                    {assetFiles.some(f => f.status === 'success' && f.generatedAssets.length > 0) && (
                      <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="text-lg font-bold text-gray-800 dark:text-white">Generated Assets</h3>
                          <button
                            onClick={handleClearBatch}
                            className="px-6 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-semibold rounded-full shadow-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-all"
                          >
                            Reset Workspace
                          </button>
                        </div>
                        <div className="space-y-6">
                          {assetFiles
                            .filter(f => f.status === 'success' && f.generatedAssets.length > 0)
                            .map((file) => (
                              <div key={file.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                                <h4 className="font-semibold text-gray-800 dark:text-white mb-3">{file.file.name}</h4>
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                                  {file.generatedAssets.map((asset, idx) => {
                                    const imageUrl = `data:image/png;base64,${asset.views[0].imageBase64}`;
                                    const assetId = `${file.id}-${asset.category}-${asset.itemName}`;
                                    const isSaved = batchSavedAssetIds.has(assetId);
                                    return (
                                      <div key={idx} className="relative group flex flex-col">
                                        <div className="relative aspect-[4/5] bg-gray-50 dark:bg-gray-800/50 rounded-xl shadow-lg overflow-hidden border border-gray-200 dark:border-gray-700 flex items-center justify-center">
                                          <img
                                            src={imageUrl}
                                            alt={asset.itemName}
                                            className="max-w-full max-h-full w-auto h-auto object-contain object-center cursor-pointer"
                                            onClick={() => setFullscreenImage(imageUrl)}
                                          />
                                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                                            <div className="absolute top-2 right-2 z-10">
                                              <button
                                                onClick={(e) => {
                                                  e.stopPropagation();
                                                  setFullscreenImage(imageUrl);
                                                }}
                                                className="bg-black/50 hover:bg-black/70 text-white rounded-full p-2 transition-colors"
                                              >
                                                <ExpandIcon className="h-4 w-4" />
                                              </button>
                                            </div>
                                            <div className="absolute bottom-2 left-2 right-2 flex flex-col gap-2">
                                              <button
                                                onClick={(e) => {
                                                  e.stopPropagation();
                                                  if (!isSaved) {
                                                    onSaveToCollection({
                                                      imageUrl: imageUrl,
                                                      asset_type: 'individual',
                                                      item_name: asset.itemName,
                                                      item_category: asset.category,
                                                    });
                                                    setBatchSavedAssetIds(prev => new Set(prev).add(assetId));
                                                  }
                                                }}
                                                disabled={isSaved}
                                                className="w-full flex items-center justify-center px-3 py-2 bg-white/90 text-sky-600 border border-sky-600 text-sm font-semibold rounded-full shadow-sm hover:bg-sky-50 transition-colors disabled:bg-gray-100 disabled:text-gray-400 disabled:border-gray-300 disabled:cursor-not-allowed"
                                              >
                                                <div className="w-4 h-4 mr-2"><SaveIcon /></div>
                                                {isSaved ? '✓ Saved' : 'Save'}
                                              </button>
                                              <button
                                                onClick={(e) => {
                                                  e.stopPropagation();
                                                  handleDownload(asset.views[0].imageBase64, `${asset.itemName.replace(/\s+/g, '_')}_${file.file.name.replace(/\.[^/.]+$/, '')}`);
                                                }}
                                                className="w-full flex items-center justify-center px-3 py-2 bg-white/90 text-gray-700 text-sm font-semibold rounded-full shadow-sm hover:bg-gray-50 transition-colors"
                                              >
                                                <DownloadIcon className="w-4 h-4 mr-2" />
                                                Download
                                              </button>
                                            </div>
                                          </div>
                                        </div>
                                        <p className="mt-2 text-sm font-semibold text-gray-700 dark:text-gray-300 text-center truncate" title={asset.itemName}>{asset.itemName}</p>
                                        <p className="text-xs text-gray-500 dark:text-gray-500 text-center">{asset.category}</p>
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {view === 'loading' && <LoadingView type="assets" />}

        {/* Results view removed - now shown inline in setup view for single image mode */}
        {/* Batch processing results are already shown inline in setup view */}

        {/* Fullscreen Image Modal for Batch Results */}
        {fullscreenImage && (
          <div
            className="fixed inset-0 bg-black/90 dark:bg-black/95 z-50 flex items-center justify-center p-4 animate-fade-in"
            onClick={() => setFullscreenImage(null)}
          >
            <button
              onClick={() => setFullscreenImage(null)}
              className="absolute top-4 right-4 text-white hover:text-gray-300 z-10 bg-black/50 rounded-full p-2 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <img
              src={fullscreenImage}
              alt="Fullscreen view"
              className="max-w-full max-h-full object-contain"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        )}
      </main>
      <footer className="text-center mt-8 text-gray-400 text-sm">
        <p>&copy; {new Date().getFullYear()} Zol Studio AI. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default AssetGeneratorPage;