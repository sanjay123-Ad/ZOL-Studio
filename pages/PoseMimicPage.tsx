import React, { useState, useRef, useEffect, useCallback } from 'react';
import { User, ImageFile } from '../types';
import { generatePoseMimic } from '../services/poseMimicService';
import { deductCredits, hasEnoughCredits } from '../services/creditService';
import { saveState, loadState, removeState } from '../services/stateStore';
import { saveImage, getImage, deleteImage } from '../services/imageStore';
import {
  uploadPoseMimicImage,
  getSignedUrlsForPoseMimic,
  deleteUserPoseMimicFolder
} from '../services/db';
import { logBatchUsage } from '../services/usageTrackingService';
import { UserIcon, DownloadIcon, ExpandIcon } from '../components/icons';
import Spinner from '../components/Spinner';

declare var JSZip: any;

interface PoseMimicPageProps {
  user: User;
  onSave: (generatedImage: string, sourceFeature?: string) => void;
}

const BATCH_LIMIT = 12;
const CREDITS_PER_IMAGE = 1; // 1 credit per pose mimic generation

type PoseMimicFile = {
  id: string;
  targetImage: ImageFile;
  poseReferenceImage: ImageFile;
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

const urlToImageFile = async (url: string): Promise<ImageFile | null> => {
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Failed to fetch image: ${response.statusText}`);
    const blob = await response.blob();
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const dataUrl = reader.result as string;
        const base64 = dataUrl.split(',')[1];
        resolve({ dataUrl, base64, mimeType: blob.type });
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    console.error("Error converting URL to ImageFile:", error);
    return null;
  }
};

// Pose carousel images (7 StyleScene model images)
const POSE_CAROUSEL_IMAGES = [
  { id: '1', url: 'https://i.postimg.cc/CKgRZsPs/D7.jpg', label: 'Women Model 4 - Pose 7' },
  { id: '2', url: 'https://i.postimg.cc/dtFrXdKY/D22.jpg', label: 'Women Model 4 - Pose 22' },
  { id: '3', url: 'https://i.postimg.cc/hGJt8RjV/B1.jpg', label: 'Male Model 2 - Pose 1' },
  { id: '4', url: 'https://i.postimg.cc/G2Cxmrrn/D6.jpg', label: 'Male Model 4 - Pose 6' },
  { id: '5', url: 'https://i.postimg.cc/5yGv2x9d/F14.jpg', label: 'Women Model 6 - Pose 14' },
  { id: '6', url: 'https://i.postimg.cc/CM8JPRtJ/A5.jpg', label: 'Women Model 1 - Pose 5' },
  { id: '7', url: 'https://i.postimg.cc/k4cFxSDS/A5.jpg', label: 'Male Model 1 - Pose 5' },
];

// Orbital Carousel Component - Enhanced with reference style
interface PoseCarouselProps {
  onImageSelect?: (imageUrl: string) => void;
}

const PoseCarousel: React.FC<PoseCarouselProps> = ({ onImageSelect }) => {
  const [rotation, setRotation] = useState(0);
  const [isAutoRotating, setIsAutoRotating] = useState(true);
  const speedRef = useRef(0.45);
  const targetSpeed = 0.45;
  const decayRate = 0.985;
  const lastMousePos = useRef<{ x: number; y: number } | null>(null);
  const velocityRef = useRef(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const numImages = POSE_CAROUSEL_IMAGES.length;
  const angleStep = 360 / numImages;

  // Responsive sizing - optimized for better visibility
  const getResponsiveSize = () => {
    if (typeof window === 'undefined') return { radius: 240, cardSize: 160 };
    const width = window.innerWidth;
    if (width < 640) return { radius: 140, cardSize: 110 };
    if (width < 768) return { radius: 180, cardSize: 130 };
    if (width < 1024) return { radius: 220, cardSize: 150 };
    return { radius: 260, cardSize: 180 };
  };

  const [radius, setRadius] = useState(getResponsiveSize().radius);
  const [cardSize, setCardSize] = useState(getResponsiveSize().cardSize);

  useEffect(() => {
    const handleResize = () => {
      const size = getResponsiveSize();
      setRadius(size.radius);
      setCardSize(size.cardSize);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Smooth rotation animation
  useEffect(() => {
    let frame: number;
    const rotate = () => {
      if (isAutoRotating) {
        if (speedRef.current > targetSpeed) {
          speedRef.current = Math.max(targetSpeed, speedRef.current * decayRate);
        }
        setRotation((prev) => (prev + speedRef.current) % 360);
      } else {
        speedRef.current *= decayRate;
        if (Math.abs(speedRef.current) > 0.01) {
          setRotation((prev) => (prev + speedRef.current) % 360);
        }
      }
      frame = requestAnimationFrame(rotate);
    };
    frame = requestAnimationFrame(rotate);
    return () => cancelAnimationFrame(frame);
  }, [isAutoRotating]);

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsAutoRotating(false);
    lastMousePos.current = { x: e.clientX, y: e.clientY };
    velocityRef.current = 0;
    speedRef.current = 0;
  };

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (lastMousePos.current) {
      const movement = (e.clientX - lastMousePos.current.x + e.clientY - lastMousePos.current.y) * 0.4;
      velocityRef.current = movement;
      setRotation((prev) => (prev + movement) % 360);
      lastMousePos.current = { x: e.clientX, y: e.clientY };
    }
  }, []);

  const handleMouseUp = useCallback(() => {
    lastMousePos.current = null;
    speedRef.current = Math.max(targetSpeed, Math.min(Math.abs(velocityRef.current), 15));
    setTimeout(() => setIsAutoRotating(true), 150);
  }, []);

  useEffect(() => {
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [handleMouseMove, handleMouseUp]);

  return (
    <div
      ref={containerRef}
      className="relative w-full flex items-center justify-center cursor-grab active:cursor-grabbing select-none"
      style={{ minHeight: `${radius * 2 + cardSize}px` }}
      onMouseDown={handleMouseDown}
    >
      {/* Center glow and decorative elements */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden">
        <div className="w-1 h-1 bg-white rounded-full shadow-[0_0_80px_40px_rgba(59,130,246,0.15)]" />
        <div className="absolute w-[300px] h-[300px] sm:w-[500px] sm:h-[500px] rounded-full border border-white/[0.03] animate-pulse" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-sky-500/5 blur-[120px] rounded-full" />
      </div>

      {/* Rotating container */}
      <div
        className="relative w-full h-full flex items-center justify-center"
        style={{ transform: `rotate(${rotation}deg)` }}
      >
        {POSE_CAROUSEL_IMAGES.map((image, index) => {
          const angle = (index * angleStep) * (Math.PI / 180);
          const x = Math.cos(angle) * radius;
          const y = Math.sin(angle) * radius;

          return (
            <div
              key={image.id}
              onClick={(e) => {
                e.stopPropagation();
                onImageSelect?.(image.url);
              }}
              className="absolute group z-10 cursor-pointer"
              style={{
                left: `calc(50% + ${x}px)`,
                top: `calc(50% + ${y}px)`,
                transform: `translate(-50%, -50%) rotate(${-rotation}deg)`,
                width: `${cardSize}px`,
                height: `${cardSize * 1.4}px`,
              }}
            >
              <div className="w-full h-full relative rounded-3xl overflow-hidden shadow-2xl border border-white/10 group-hover:border-sky-400/40 group-hover:scale-125 transition-all duration-700 bg-white dark:bg-gray-900 ring-4 ring-black/20">
                <img
                  src={image.url}
                  alt={image.label}
                  className="w-full h-full object-cover pointer-events-none transition-transform duration-1000 group-hover:scale-110"
                  draggable={false}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="absolute bottom-3 left-3 right-3 opacity-0 group-hover:opacity-100 transition-all duration-500 transform translate-y-2 group-hover:translate-y-0">
                  <p className="text-[10px] font-bold text-white uppercase tracking-widest truncate drop-shadow-lg">{image.label}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const PoseMimicPage: React.FC<PoseMimicPageProps> = ({ user }) => {
  const [poseFiles, setPoseFiles] = useState<PoseMimicFile[]>([]);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [hasStarted, setHasStarted] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isStateLoading, setIsStateLoading] = useState(true);
  const [fullscreenImage, setFullscreenImage] = useState<string | null>(null);
  const targetInputRef = useRef<HTMLInputElement>(null);
  const poseInputRef = useRef<HTMLInputElement>(null);
  const closedViaBackButton = useRef<boolean>(false);

  const SESSION_STORAGE_KEY = `poseMimicState_${user.id}`;
  const TARGET_IMAGES_KEY = `poseMimic_targets_${user.id}`;
  const POSE_IMAGES_KEY = `poseMimic_poses_${user.id}`;

  interface SavedState {
    hasStarted: boolean;
    fileIds: string[];
    generatedImagePaths: Record<string, string>;
    fileStatuses: Record<string, string>;
    fileErrors: Record<string, string | null>;
  }

  // Load state on mount
  useEffect(() => {
    const loadSavedState = async () => {
      setIsStateLoading(true);
      try {
        const savedState = loadState<SavedState>(SESSION_STORAGE_KEY);
        if (savedState) {
          setHasStarted(savedState.hasStarted || false);

          if (savedState.fileIds && Array.isArray(savedState.fileIds)) {
            const loadedFiles: PoseMimicFile[] = [];

            const generatedPaths = Object.values(savedState.generatedImagePaths || {});
            const generatedUrlMap = generatedPaths.length > 0
              ? await getSignedUrlsForPoseMimic(generatedPaths)
              : new Map();

            for (const fileId of savedState.fileIds) {
              const targetImage = await getImage(`${TARGET_IMAGES_KEY}_${fileId}`);
              const poseImage = await getImage(`${POSE_IMAGES_KEY}_${fileId}`);

              if (targetImage && poseImage) {
                const generatedPath = savedState.generatedImagePaths?.[fileId];
                const generatedImageUrl = generatedPath ? generatedUrlMap.get(generatedPath) : null;

                loadedFiles.push({
                  id: fileId,
                  targetImage,
                  poseReferenceImage: poseImage,
                  generatedImage: generatedImageUrl || null,
                  generatedPath: generatedPath || undefined,
                  status: (savedState.fileStatuses?.[fileId] as any) || 'queued',
                  error: savedState.fileErrors?.[fileId] || null,
                });
              }
            }
            setPoseFiles(loadedFiles);
          }
        }
      } catch (err) {
        console.error("Failed to load saved state", err);
      } finally {
        setIsStateLoading(false);
      }
    };

    loadSavedState();
  }, [user.id, SESSION_STORAGE_KEY, TARGET_IMAGES_KEY, POSE_IMAGES_KEY]);

  // Periodically refresh signed URLs to prevent expiration (every 12 hours)
  useEffect(() => {
    if (!hasStarted || poseFiles.length === 0) return;

    const refreshInterval = setInterval(async () => {
      const filesNeedingRefresh = poseFiles.filter(f =>
        f.status === 'success' && f.generatedPath
      );

      if (filesNeedingRefresh.length > 0) {
        const paths = filesNeedingRefresh.map(f => f.generatedPath!);
        try {
          const urlMap = await getSignedUrlsForPoseMimic(paths);

          setPoseFiles(prev => prev.map(f => {
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
  }, [hasStarted, poseFiles]);

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
      setPoseFiles(prev => prev.map(f => {
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
        const fileIds: string[] = [];
        const generatedImagePaths: Record<string, string> = {};
        const fileStatuses: Record<string, string> = {};
        const fileErrors: Record<string, string | null> = {};

        for (const f of poseFiles) {
          fileIds.push(f.id);
          fileStatuses[f.id] = f.status;
          fileErrors[f.id] = f.error || null;

          await saveImage(`${TARGET_IMAGES_KEY}_${f.id}`, f.targetImage);
          await saveImage(`${POSE_IMAGES_KEY}_${f.id}`, f.poseReferenceImage);

          if (f.generatedPath) {
            generatedImagePaths[f.id] = f.generatedPath;
          }
        }

        const stateToSave: SavedState = {
          hasStarted,
          fileIds,
          generatedImagePaths,
          fileStatuses,
          fileErrors,
        };
        saveState(SESSION_STORAGE_KEY, stateToSave);
      } catch (error) {
        console.error("Failed to save state", error);
      }
    };

    saveCurrentState();
  }, [isStateLoading, poseFiles, hasStarted, user.id, SESSION_STORAGE_KEY, TARGET_IMAGES_KEY, POSE_IMAGES_KEY]);

  const handleTargetImageChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !file.type.startsWith('image/')) return;

    if (poseFiles.length >= BATCH_LIMIT) {
      setError(`Maximum ${BATCH_LIMIT} pose pairs allowed.`);
      return;
    }

    try {
      const targetImageFile = await fileToImageFile(file);
      const fileId = `pose-${Date.now()}-${Math.random()}`;

      setPoseFiles(prev => [...prev, {
        id: fileId,
        targetImage: targetImageFile,
        poseReferenceImage: null as any, // Will be set when pose image is uploaded
        generatedImage: null,
        status: 'queued',
        error: null,
      }]);
    } catch (err) {
      setError('Failed to load target image.');
    }

    if (targetInputRef.current) {
      targetInputRef.current.value = "";
    }
  };

  const handlePoseImageChange = async (event: React.ChangeEvent<HTMLInputElement>, fileId: string) => {
    const file = event.target.files?.[0];
    if (!file || !file.type.startsWith('image/')) return;

    try {
      const poseImageFile = await fileToImageFile(file);

      setPoseFiles(prev => prev.map(f =>
        f.id === fileId ? { ...f, poseReferenceImage: poseImageFile } : f
      ));
    } catch (err) {
      setError('Failed to load pose reference image.');
    }

    if (poseInputRef.current) {
      poseInputRef.current.value = "";
    }
  };

  const removeFile = (id: string) => {
    setPoseFiles(prev => {
      const file = prev.find(f => f.id === id);
      if (file) {
        deleteImage(`${TARGET_IMAGES_KEY}_${id}`);
        deleteImage(`${POSE_IMAGES_KEY}_${id}`);
      }
      return prev.filter(f => f.id !== id);
    });
  };

  // Refresh expired signed URLs
  const refreshImageUrl = async (fileId: string, imagePath: string) => {
    try {
      const urlMap = await getSignedUrlsForPoseMimic([imagePath]);
      const newUrl = urlMap.get(imagePath);
      if (newUrl) {
        setPoseFiles(prev => prev.map(f =>
          f.id === fileId ? { ...f, generatedImage: newUrl } : f
        ));
        return true;
      }
    } catch (err) {
      console.error('Failed to refresh image URL:', err);
    }
    return false;
  };

  // Handle image load error and refresh URL
  const handleImageError = async (fileId: string, imagePath: string | undefined, imgElement: HTMLImageElement) => {
    if (!imagePath) {
      // No path to refresh, show error
      setPoseFiles(prev => prev.map(f =>
        f.id === fileId ? { ...f, status: 'error', error: 'Image not available' } : f
      ));
      return;
    }

    // Hide the broken image temporarily
    imgElement.style.opacity = '0';

    // Try to refresh the URL
    const refreshed = await refreshImageUrl(fileId, imagePath);

    if (refreshed) {
      // URL refreshed, update the image source
      const updatedFile = poseFiles.find(f => f.id === fileId);
      if (updatedFile?.generatedImage) {
        imgElement.src = updatedFile.generatedImage;
        imgElement.style.opacity = '1';
      }
    } else {
      // Refresh failed, show error state
      imgElement.style.display = 'none';
      setPoseFiles(prev => prev.map(f =>
        f.id === fileId ? { ...f, status: 'error', error: 'Image URL expired. Please refresh the page.' } : f
      ));
    }
  };

  const handleGenerate = async () => {
    const validFiles = poseFiles.filter(f => f.targetImage && f.poseReferenceImage);

    if (validFiles.length === 0) {
      setError('Please add at least one complete pose pair (target + pose reference).');
      return;
    }

    const totalCreditsNeeded = validFiles.length * CREDITS_PER_IMAGE;
    const hasCredits = await hasEnoughCredits(user.id, totalCreditsNeeded);

    if (!hasCredits) {
      setError(`Insufficient credits. You need ${totalCreditsNeeded} credits for this batch.`);
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
      // Process in parallel with concurrency limit
      const CONCURRENT_LIMIT = 3;
      const filesToProcess = validFiles.filter(f => f.status !== 'success' && f.status !== 'error');

      const processFile = async (f: PoseMimicFile) => {
        setPoseFiles(prev => prev.map(item => item.id === f.id ? { ...item, status: 'processing' } : item));

        try {
          totalInputImages += 2; // target + pose reference
          totalInputChars += 200; // approximate prompt length

          const resultBase64 = await generatePoseMimic(f.targetImage, f.poseReferenceImage, user.id);

          totalOutputImages += 1;
          successfulCount += 1;

          // Upload generated image to Supabase storage
          const imagePath = await uploadPoseMimicImage(user.id, f.id, resultBase64);

          // Get signed URL for immediate display
          const urlMap = await getSignedUrlsForPoseMimic([imagePath]);
          const signedUrl = urlMap.get(imagePath) || `data:image/png;base64,${resultBase64}`;

          // Deduct credits for successful generation
          const creditResult = await deductCredits(user.id, CREDITS_PER_IMAGE, 'pose_mimic');
          if (!creditResult.success) {
            throw new Error(creditResult.error || 'Failed to deduct credits');
          }

          // Update state
          setPoseFiles(prev => {
            const updated = prev.map(item => item.id === f.id ? {
              ...item,
              status: 'success',
              generatedImage: signedUrl,
              generatedPath: imagePath
            } : item);

            const state = loadState<SavedState>(SESSION_STORAGE_KEY) || {
              hasStarted: true,
              fileIds: [],
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
          const msg = (err as Error).message || 'Pose mimic failed.';
          setPoseFiles(prev => prev.map(item => item.id === f.id ? { ...item, status: 'error', error: msg } : item));
        }
      };

      // Execute in batches
      for (let i = 0; i < filesToProcess.length; i += CONCURRENT_LIMIT) {
        const batch = filesToProcess.slice(i, i + CONCURRENT_LIMIT);
        await Promise.all(batch.map(f => processFile(f)));
      }

      // Log batch usage after all processing
      if (successfulCount > 0) {
        logBatchUsage(
          user.id,
          'Pose Mimic',
          totalInputImages,
          totalInputChars,
          totalOutputImages,
          true // Gemini 3 Pro
        ).catch(console.error);
      }

    } catch (err) {
      setError("System error during batch processing. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownloadImage = async (imageUrl: string, fileId: string) => {
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `pose-mimic-${fileId}-${Date.now()}.png`;
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
      const successItems = poseFiles.filter(f => f.status === 'success' && f.generatedImage);

      if (successItems.length === 0) return;

      for (const item of successItems) {
        const res = await fetch(item.generatedImage!);
        const blob = await res.blob();
        zip.file(`pose-mimic-${item.id}.png`, blob);
      }

      const content = await zip.generateAsync({ type: 'blob' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(content);
      link.download = `pose-mimic-batch-${Date.now()}.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (e) {
      console.error(e);
      alert("Failed to create ZIP.");
    }
  };

  const handleStartOver = async () => {
    poseFiles.forEach(f => {
      deleteImage(`${TARGET_IMAGES_KEY}_${f.id}`);
      deleteImage(`${POSE_IMAGES_KEY}_${f.id}`);
    });

    try {
      await deleteUserPoseMimicFolder(user.id);
    } catch (err) {
      console.error("Failed to delete Supabase folder", err);
    }

    setPoseFiles([]);
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
        <div className="text-center mb-3 sm:mb-4">
          <div className="inline-flex items-center gap-2 mb-2 bg-sky-600 text-white px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
            </span>
            AI Pro Workspace
          </div>
          <h1 className="text-display font-bold text-gray-900 dark:text-white font-headline">AI Pose Mimic</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2 text-lg italic">Transfer any pose to your model instantly with perfect identity preservation.</p>
        </div>

        {/* Orbital Carousel Animation */}
        <div className="py-2 sm:py-3 md:py-4">
          <PoseCarousel
            onImageSelect={async (imageUrl) => {
              // Convert carousel image URL to ImageFile and set as pose reference
              const imageFile = await urlToImageFile(imageUrl);
              if (imageFile) {
                // Find the first pair that doesn't have a pose reference, or create a new pair
                const pairWithoutPose = poseFiles.find(p => !p.poseReferenceImage);
                if (pairWithoutPose) {
                  setPoseFiles(prev => prev.map(p =>
                    p.id === pairWithoutPose.id ? { ...p, poseReferenceImage: imageFile } : p
                  ));
                } else if (poseFiles.length < BATCH_LIMIT) {
                  // Create a new pair with the selected pose reference
                  const fileId = `pose-${Date.now()}-${Math.random()}`;
                  setPoseFiles(prev => [...prev, {
                    id: fileId,
                    targetImage: null as any,
                    poseReferenceImage: imageFile,
                    generatedImage: null,
                    status: 'queued',
                    error: null,
                  }]);
                }
              }
            }}
          />
        </div>

        {/* WORKSPACE: Batch Upload Section */}
        <div className="max-w-4xl mx-auto mt-4 sm:mt-5 md:mt-6 mb-12">
          <div className="flex flex-col h-full">
            <div className="flex items-center justify-between mb-3 px-2">
              <h2 className="text-sm font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider flex items-center gap-2">
                <span className="bg-sky-600 text-white w-5 h-5 rounded-full flex items-center justify-center text-[10px]">1</span>
                Pose Pair Collection
              </h2>
              {poseFiles.length > 0 && (
                <button onClick={() => setPoseFiles([])} className="text-[10px] font-bold text-sky-600 dark:text-sky-400 hover:underline uppercase">Clear All</button>
              )}
            </div>

            <div className="bg-sky-50 dark:bg-sky-900/20 border-l-4 border-sky-600 dark:border-sky-400 p-4 rounded-r-lg mb-6">
              <h3 className="font-bold text-sky-700 dark:text-sky-300 text-sm mb-1">How it Works:</h3>
              <p className="text-gray-700 dark:text-gray-300 text-xs">
                Upload <b>Target Person</b> images and their corresponding <b>Pose Reference</b> images. The AI will generate each target person in the exact pose from the reference. Up to {BATCH_LIMIT} pairs.
              </p>
            </div>

            {poseFiles.length === 0 ? (
              <div
                onClick={() => {
                  const fileId = `pose-${Date.now()}-${Math.random()}`;
                  setPoseFiles([{
                    id: fileId,
                    targetImage: null as any,
                    poseReferenceImage: null as any,
                    generatedImage: null,
                    status: 'queued',
                    error: null,
                  }]);
                }}
                className="relative min-h-[300px] border-2 border-dashed rounded-[32px] transition-all duration-300 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 hover:border-sky-600 dark:hover:border-sky-400 cursor-pointer flex flex-col items-center justify-center"
              >
                <div className="text-center p-8 flex flex-col items-center justify-center">
                  <div className="w-16 h-16 text-gray-300 dark:text-gray-600 mb-4 flex items-center justify-center"><UserIcon /></div>
                  <p className="text-gray-800 dark:text-gray-200 font-bold text-xl">Add Pose Pairs</p>
                  <p className="text-gray-400 dark:text-gray-500 text-sm mt-2">Click to start adding target person and pose reference pairs.</p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {poseFiles.map((f, index) => (
                  <div key={f.id} className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700 shadow-md">
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-xs font-bold text-gray-500 dark:text-gray-400">Pair #{index + 1}</span>
                      {poseFiles.length > 1 && (
                        <button
                          onClick={() => removeFile(f.id)}
                          className="text-red-500 hover:text-red-700 text-xs font-bold"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-2">Target Person</label>
                        {f.targetImage ? (
                          <div className="relative aspect-[3/4] rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
                            <img src={f.targetImage.dataUrl} alt="Target" className="w-full h-full object-cover" />
                            <button
                              onClick={() => {
                                const input = document.createElement('input');
                                input.type = 'file';
                                input.accept = 'image/*';
                                input.onchange = (e) => handleTargetImageChange(e as any);
                                input.click();
                              }}
                              className="absolute inset-0 bg-black/50 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs"
                            >
                              Change
                            </button>
                          </div>
                        ) : (
                          <div
                            onClick={() => {
                              const input = document.createElement('input');
                              input.type = 'file';
                              input.accept = 'image/*';
                              input.onchange = (e) => {
                                const file = (e.target as HTMLInputElement).files?.[0];
                                if (file) {
                                  fileToImageFile(file).then(img => {
                                    setPoseFiles(prev => prev.map(p => p.id === f.id ? { ...p, targetImage: img } : p));
                                  });
                                }
                              };
                              input.click();
                            }}
                            className="aspect-[3/4] border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg flex items-center justify-center cursor-pointer hover:border-sky-600 dark:hover:border-sky-400 transition-colors"
                          >
                            <div className="text-center">
                              <UserIcon />
                              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">Click to upload</p>
                            </div>
                          </div>
                        )}
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-2">Pose Reference</label>
                        {f.poseReferenceImage ? (
                          <div className="relative aspect-[3/4] rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
                            <img src={f.poseReferenceImage.dataUrl} alt="Pose" className="w-full h-full object-cover" />
                            <button
                              onClick={() => {
                                const input = document.createElement('input');
                                input.type = 'file';
                                input.accept = 'image/*';
                                input.onchange = (e) => {
                                  const file = (e.target as HTMLInputElement).files?.[0];
                                  if (file) {
                                    fileToImageFile(file).then(img => {
                                      setPoseFiles(prev => prev.map(p => p.id === f.id ? { ...p, poseReferenceImage: img } : p));
                                    });
                                  }
                                };
                                input.click();
                              }}
                              className="absolute inset-0 bg-black/50 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs"
                            >
                              Change
                            </button>
                          </div>
                        ) : (
                          <div
                            onClick={() => {
                              const input = document.createElement('input');
                              input.type = 'file';
                              input.accept = 'image/*';
                              input.onchange = (e) => {
                                const file = (e.target as HTMLInputElement).files?.[0];
                                if (file) {
                                  fileToImageFile(file).then(img => {
                                    setPoseFiles(prev => prev.map(p => p.id === f.id ? { ...p, poseReferenceImage: img } : p));
                                  });
                                }
                              };
                              input.click();
                            }}
                            className="aspect-[3/4] border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg flex items-center justify-center cursor-pointer hover:border-sky-600 dark:hover:border-sky-400 transition-colors"
                          >
                            <div className="text-center">
                              <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 mx-auto text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.59 14.37a6 6 0 01-5.84 7.38v-4.8m5.84-2.58a14.98 14.98 0 006.16-12.12A14.98 14.98 0 009.631 8.41m5.96 5.96a14.926 14.926 0 01-5.841 2.58m-.119-8.54a6 6 0 00-7.381 5.84h4.8m2.581-5.84a14.927 14.927 0 00-2.58 5.84m2.699 2.7c-.103.021-.207.041-.311.06a15.09 15.09 0 01-2.448-2.448 14.9 14.9 0 01.06-.312m-2.24 2.39a4.493 4.493 0 00-1.757 4.306 4.493 4.493 0 004.306-1.758M16.5 9a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
                              </svg>
                              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">Click to upload</p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}

                {poseFiles.length < BATCH_LIMIT && (
                  <button
                    onClick={() => {
                      const fileId = `pose-${Date.now()}-${Math.random()}`;
                      setPoseFiles([...poseFiles, {
                        id: fileId,
                        targetImage: null as any,
                        poseReferenceImage: null as any,
                        generatedImage: null,
                        status: 'queued',
                        error: null,
                      }]);
                    }}
                    className="w-full py-4 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg text-gray-600 dark:text-gray-400 hover:border-sky-600 dark:hover:border-sky-400 hover:text-sky-600 dark:hover:text-sky-400 transition-colors font-semibold"
                  >
                    + Add Another Pair
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-col items-center gap-4 mb-16 animate-fade-in">
          <div className="flex gap-4">
            <button
              onClick={handleGenerate}
              disabled={poseFiles.filter(f => f.targetImage && f.poseReferenceImage).length === 0 || isProcessing}
              className="px-12 py-4 bg-sky-600 dark:bg-sky-500 text-white font-bold rounded-full shadow-2xl hover:bg-sky-700 dark:hover:bg-sky-600 transition-all disabled:bg-gray-400 disabled:cursor-not-allowed hover:scale-105 active:scale-95 flex items-center gap-3"
            >
              {isProcessing && <Spinner />}
              {isProcessing ? 'Processing Batch...' : 'Start Batch Pose Mimic'}
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
            <div className="flex flex-wrap justify-between items-end gap-4 mb-10">
              <div>
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white font-headline">Batch Processing Output</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 uppercase tracking-widest font-bold">Pose Transfer Results</p>
              </div>
              <button
                onClick={handleDownloadAll}
                disabled={isProcessing || poseFiles.filter(f => f.status === 'success').length === 0}
                className="flex items-center px-8 py-3 bg-sky-600 dark:bg-sky-500 text-white text-sm font-bold rounded-full shadow-xl hover:bg-sky-700 dark:hover:bg-sky-600 disabled:bg-gray-300 dark:disabled:bg-gray-600 transition-all"
              >
                <DownloadIcon /> Download All Results
              </button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-8">
              {poseFiles.map(f => (
                <div key={f.id} className="flex flex-col group">
                  <div className="relative aspect-[3/4] bg-white dark:bg-gray-800 rounded-3xl overflow-hidden shadow-lg border border-gray-100 dark:border-gray-700 flex items-center justify-center transition-all duration-500 hover:shadow-2xl">
                    {f.status === 'success' && f.generatedPath && (
                      <>
                        {f.generatedImage ? (
                          <img
                            key={`img-${f.id}`}
                            src={f.generatedImage}
                            alt="Pose Mimic Result"
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
                        <div className="grid grid-cols-2 gap-2 p-2">
                          <img src={f.targetImage?.dataUrl} alt="Target" className="w-full h-full object-cover opacity-20 rounded" />
                          <img src={f.poseReferenceImage?.dataUrl} alt="Pose" className="w-full h-full object-cover opacity-20 rounded" />
                        </div>
                        <Spinner />
                        <p className="mt-4 text-[10px] font-bold text-gray-600 dark:text-gray-400 uppercase tracking-widest animate-pulse">Transferring Pose...</p>
                      </div>
                    )}
                    {f.status === 'queued' && (
                      <div className="absolute inset-0 bg-gray-50/50 dark:bg-gray-700/50 flex flex-col items-center justify-center">
                        <div className="grid grid-cols-2 gap-2 p-2">
                          <img src={f.targetImage?.dataUrl} alt="Target" className="w-full h-full object-cover opacity-30 rounded" />
                          <img src={f.poseReferenceImage?.dataUrl} alt="Pose" className="w-full h-full object-cover opacity-30 rounded" />
                        </div>
                        <div className="z-10 bg-white/90 dark:bg-gray-800/90 px-3 py-1 rounded-full text-[8px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-tighter border border-gray-100 dark:border-gray-700">Queued</div>
                      </div>
                    )}
                    {f.status === 'error' && (
                      <div className="absolute inset-0 bg-red-50 dark:bg-red-900/30 flex flex-col items-center justify-center p-4 text-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-red-400 dark:text-red-500 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                        <p className="text-[10px] text-red-600 dark:text-red-400 font-bold leading-tight line-clamp-3">{f.error}</p>
                      </div>
                    )}

                    {f.status === 'success' && (
                      <div className="absolute top-4 left-4 z-10 bg-sky-600 dark:bg-sky-500 text-white text-[9px] font-bold px-2 py-0.5 rounded-full shadow-lg">
                        SUCCESS
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
                            handleDownloadImage(f.generatedImage!, f.id);
                          }}
                          className="absolute bottom-4 right-4 bg-white/90 dark:bg-gray-800/90 text-gray-800 dark:text-gray-200 p-2 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity transform hover:scale-110 z-10"
                          title="Download image"
                        >
                          <DownloadIcon className="h-4 w-4" />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
      <footer className="text-center py-12 text-gray-400 dark:text-gray-500 text-[10px] uppercase tracking-[0.2em]">
        <p>&copy; {new Date().getFullYear()} Zol Studio AI. Powered by AI.</p>
      </footer>

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

export default PoseMimicPage;
