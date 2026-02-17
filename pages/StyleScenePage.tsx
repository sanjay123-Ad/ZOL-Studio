import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, ImageFile } from '../types';
import { generatePoseSwapImage, ComplementaryGarmentConfig } from '../services/styleSceneService';
import { validateGarmentType } from '../services/styleSceneValidationService';
import { getGarmentCategories, GarmentCategory } from '../services/styleSceneGarments';
import { saveImage, getImage, deleteImage } from '../services/imageStore';
import { saveState, loadState, removeState } from '../services/stateStore';
import { uploadStyleSceneImage, deleteUserStyleSceneFolder } from '../services/db';
import { hasEnoughCredits, deductCredits } from '../services/creditService';
import { logBatchUsage } from '../services/usageTrackingService';
import { getModelById, Model, Pose } from '../services/models';
import ImageUploader from '../components/ImageUploader';
import { GarmentIcon, DownloadIcon, FixItIcon, ExpandIcon } from '../components/icons';
import Spinner from '../components/Spinner';
import FixItModal from '../components/FixItModal';
import CollectionModal, { CollectionItem } from '../components/CollectionModal';
import { PATHS } from '../constants/paths';

// Add a declaration for the JSZip library loaded from CDN
declare var JSZip: any;

interface StyleScenePageProps {
  user: User;
}

// --- Data Definitions for Selections ---
const GENDERS = [{ id: 'Male', name: 'Male' }, { id: 'Female', name: 'Female' }];
const GARMENT_TYPES = [
  { id: 'upper', name: 'Top / Upper', description: 'Shirts, T-Shirts, Jackets, etc.' },
  { id: 'lower', name: 'Bottom / Lower', description: 'Pants, Jeans, Shorts, Skirts, etc.' }
];

export interface GeneratedImageResult {
  imageUrl: string;
  poseName: string;
  poseId: string;
  sourceView: 'front' | 'back';
}

type PoseGenerationStatus = 'idle' | 'loading' | 'success' | 'error';
interface PoseGenerationState {
  status: PoseGenerationStatus;
  resultUrl?: string; // This will now be a Supabase public URL
  sourceView?: 'front' | 'back';
}

// Queue structure for batch processing (similar to PoseMimicFile)
type QueuedPose = {
  id: string;
  pose: PoseForDisplay;
  garmentView: 'front' | 'back';
  complementaryGarmentConfig: ComplementaryGarmentConfig | null;
  complementaryGarmentImage: ImageFile | null;
  selectedCategoryId: string | null;
  selectedSubcategoryId: string | null;
  customGarmentText: string;
  status: 'queued' | 'processing' | 'success' | 'error';
  error: string | null;
  generatedImageUrl?: string;
  generatedPath?: string;
};

const urlToImageFile = async (url: string): Promise<ImageFile> => {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch image: ${response.status} ${response.statusText}`);
    }
    const blob = await response.blob();
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const dataUrl = reader.result as string;
        if (!dataUrl) {
          return reject(new Error("FileReader failed to produce a data URL."));
        }
        const base64 = dataUrl.split(',')[1];
        resolve({
          dataUrl,
          base64,
          mimeType: blob.type,
        });
      };
      reader.onerror = (error) => reject(error);
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    console.error("Failed to convert URL to ImageFile", error);
    throw new Error("Could not load model or pose image from URL.");
  }
};

type PoseForDisplay = Pose | { id: string; name: string; imageUrl: string; command: string; };

const StyleScenePage: React.FC<StyleScenePageProps> = ({ user }) => {
  // Main state
  const [gender, setGender] = useState<'Male' | 'Female' | null>(null);
  const [garmentType, setGarmentType] = useState<'upper' | 'lower' | null>(null);
  const [garmentFrontImage, setGarmentFrontImage] = useState<ImageFile>(null);
  const [garmentBackImage, setGarmentBackImage] = useState<ImageFile>(null);
  const [validationResult, setValidationResult] = useState<{ isValid: boolean; errorMessage?: string; description?: string } | null>(null);
  const [isValidating, setIsValidating] = useState(false);
  const [modelId, setModelId] = useState<string | null>(null);
  const [poseGenerationState, setPoseGenerationState] = useState<Record<string, PoseGenerationState>>({});
  const [error, setError] = useState<string | null>(null);
  const [poseCollections, setPoseCollections] = useState<Record<string, CollectionItem[]>>({});

  const prevModelIdRef = useRef<string | null>(null);
  const [isStateLoading, setIsStateLoading] = useState(true);

  // View & Modal control state
  const [currentView, setCurrentView] = useState<'setup' | 'generate'>('setup');
  const [generationTarget, setGenerationTarget] = useState<{ pose: PoseForDisplay; garmentView: 'front' | 'back' } | null>(null);
  const [complementaryGarmentConfig, setComplementaryGarmentConfig] = useState<ComplementaryGarmentConfig | null>(null);
  const [complementaryGarmentImage, setComplementaryGarmentImage] = useState<ImageFile>(null);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [selectedSubcategoryId, setSelectedSubcategoryId] = useState<string | null>(null);
  const [customGarmentText, setCustomGarmentText] = useState<string>('');
  const [fixingImageInfo, setFixingImageInfo] = useState<GeneratedImageResult | null>(null);
  const [viewingCollection, setViewingCollection] = useState<{ poseName: string; images: CollectionItem[] } | null>(null);
  const [fullscreenImage, setFullscreenImage] = useState<string | null>(null);
  const [isProcessingBatch, setIsProcessingBatch] = useState(false);
  const [queuedPoses, setQueuedPoses] = useState<QueuedPose[]>([]);
  const closedViaBackButton = useRef<boolean>(false);

  const navigate = useNavigate();

  // User-specific storage keys
  const SESSION_STORAGE_KEY = `styleSceneState_${user.id}`;
  const GARMENT_FRONT_IMAGE_KEY = `stylescene-garment-front-image_${user.id}`;
  const GARMENT_BACK_IMAGE_KEY = `stylescene-garment-back-image_${user.id}`;

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

  // Load state on mount
  useEffect(() => {
    const loadSavedState = async () => {
      // --- 1. Load general session state into local variables first ---
      let loadedPoseState: Record<string, PoseGenerationState> = {};
      let loadedCollections: Record<string, CollectionItem[]> = {};

      try {
        const savedState = loadState<any>(SESSION_STORAGE_KEY);
        if (savedState) {
          if (savedState.garmentFrontImageKey) setGarmentFrontImage(await getImage(savedState.garmentFrontImageKey));
          if (savedState.garmentBackImageKey) setGarmentBackImage(await getImage(savedState.garmentBackImageKey));
          if (savedState.gender) setGender(savedState.gender);
          if (savedState.garmentType) setGarmentType(savedState.garmentType);
          if (savedState.modelId) setModelId(savedState.modelId);

          if (savedState.poseGenerationState) loadedPoseState = savedState.poseGenerationState;
          if (savedState.poseCollections) loadedCollections = savedState.poseCollections;
          if (savedState.validationResult) setValidationResult(savedState.validationResult);
        }
      } catch (error) {
        console.error("Failed to load state from persistent storage", error);
        removeState(SESSION_STORAGE_KEY);
      }

      // --- 1.5. Load persistent collections from localStorage and sessionStorage (for each pose) ---
      // Check all localStorage keys that match the pattern background_collection_*
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('background_collection_')) {
          const poseId = key.replace('background_collection_', '');
          try {
            const collection = loadState<CollectionItem[]>(key);
            if (collection && Array.isArray(collection) && collection.length > 0) {
              // Merge with existing collections, but persistent storage takes precedence
              loadedCollections = { ...loadedCollections, [poseId]: collection };
            }
          } catch (e) {
            console.error(`Failed to parse persistent collection for pose ${poseId}`, e);
          }
        }
      }

      // Also check sessionStorage for collections (in case they're stored there)
      for (let i = 0; i < sessionStorage.length; i++) {
        const key = sessionStorage.key(i);
        if (key && key.startsWith('background_collection_')) {
          const poseId = key.replace('background_collection_', '');
          // Only load if not already loaded from localStorage
          if (!loadedCollections[poseId]) {
            try {
              const collectionJSON = sessionStorage.getItem(key);
              if (collectionJSON) {
                const collection = JSON.parse(collectionJSON);
                if (collection && Array.isArray(collection) && collection.length > 0) {
                  loadedCollections = { ...loadedCollections, [poseId]: collection };
                  // Also save to localStorage for persistence
                  saveState(key, collection);
                }
              }
            } catch (e) {
              console.error(`Failed to parse sessionStorage collection for pose ${poseId}`, e);
            }
          }
        }
      }

      // --- 2. Check for updates from Background Gallery and merge ---
      const poseId = sessionStorage.getItem('updated_image_pose_id'); // Keep sessionStorage for temporary bridge data
      if (poseId) {
        // Try to load from the updated_image_collection key (without poseId suffix)
        const updatedCollectionJSON = sessionStorage.getItem('updated_image_collection');
        if (updatedCollectionJSON) {
          try {
            const updatedCollection = JSON.parse(updatedCollectionJSON);
            loadedCollections = { ...loadedCollections, [poseId]: updatedCollection };
            // Also update the persistent storage
            saveState(`background_collection_${poseId}`, updatedCollection);
          } catch (e) {
            console.error("Failed to parse updated collection", e);
          }
        }

        const newImageUrl = sessionStorage.getItem('updated_image_url');
        if (newImageUrl && newImageUrl !== 'null') {
          const oldStateForPose = loadedPoseState[poseId] || {};
          loadedPoseState = {
            ...loadedPoseState,
            [poseId]: {
              ...oldStateForPose, // This is the crucial part that preserves sourceView
              status: 'success',
              resultUrl: newImageUrl,
            }
          };
        }

        // --- 3. Clean up session storage keys ---
        sessionStorage.removeItem('updated_image_pose_id');
        sessionStorage.removeItem('updated_image_collection');
        sessionStorage.removeItem('updated_image_url');
      }

      // --- 4. Set the final, merged state once ---
      setPoseCollections(loadedCollections);
      setPoseGenerationState(loadedPoseState);

      // --- 5. Signal that loading is complete ---
      setIsStateLoading(false);
    };

    const selectedModelId = sessionStorage.getItem('selected_model_id');
    if (selectedModelId) {
      setModelId(selectedModelId);
      const model = getModelById(selectedModelId);
      if (model) setGender(model.gender);
      sessionStorage.removeItem('selected_model_id');
    }

    loadSavedState();
  }, [user.id, SESSION_STORAGE_KEY]);

  // Save state on change - following TryOnPage pattern
  useEffect(() => {
    // Prevent saving state until the initial load is complete.
    if (isStateLoading) {
      return;
    }

    const saveCurrentState = async () => {
      try {
        // Save images to IndexedDB - same pattern as TryOnPage
        if (garmentFrontImage) {
          await saveImage(GARMENT_FRONT_IMAGE_KEY, garmentFrontImage);
        } else {
          await deleteImage(GARMENT_FRONT_IMAGE_KEY);
        }

        if (garmentBackImage) {
          await saveImage(GARMENT_BACK_IMAGE_KEY, garmentBackImage);
        } else {
          await deleteImage(GARMENT_BACK_IMAGE_KEY);
        }

        // Save all serializable state to persistent storage
        const stateToSave = {
          garmentFrontImageKey: garmentFrontImage ? GARMENT_FRONT_IMAGE_KEY : null,
          garmentBackImageKey: garmentBackImage ? GARMENT_BACK_IMAGE_KEY : null,
          gender,
          garmentType,
          modelId,
          poseGenerationState, // Public URLs are fine to store
          poseCollections,
          validationResult, // Persist validation result
        };
        saveState(SESSION_STORAGE_KEY, stateToSave);

        // Also save each collection to persistent storage (poseId-specific keys)
        Object.entries(poseCollections).forEach(([poseId, collection]) => {
          const collectionKey = `background_collection_${poseId}`;
          saveState(collectionKey, collection);
        });
      } catch (error) {
        console.error("Failed to save state", error);
      }
    };

    saveCurrentState();
  }, [isStateLoading, garmentFrontImage, garmentBackImage, gender, garmentType, modelId, poseGenerationState, poseCollections, validationResult, user.id, SESSION_STORAGE_KEY, GARMENT_FRONT_IMAGE_KEY, GARMENT_BACK_IMAGE_KEY]);

  const selectedModel = useMemo(() => modelId ? getModelById(modelId) : null, [modelId]);


  const finalImages: GeneratedImageResult[] = useMemo(() => {
    if (!selectedModel) return [];
    const entries: [string, PoseGenerationState][] = Object.entries(poseGenerationState);
    return entries
      .filter(([, state]) => state.status === 'success' && state.resultUrl && state.sourceView)
      .map(([poseId, state]) => {
        const pose = selectedModel.poses.find(p => p.id === poseId);
        return {
          imageUrl: state.resultUrl!,
          poseName: pose?.name || 'Generated Pose',
          poseId: poseId,
          sourceView: state.sourceView!,
        };
      });
  }, [poseGenerationState, selectedModel]);

  useEffect(() => {
    // This effect clears generated poses and collections ONLY when the model is
    // changed from one selection to another, not on initial load.
    // It compares the current modelId with the previous one stored in a ref.
    if (prevModelIdRef.current && modelId && prevModelIdRef.current !== modelId) {
      setPoseGenerationState({});
      setPoseCollections({});
    }
    // Update the ref to the current modelId for the next render.
    prevModelIdRef.current = modelId;
  }, [modelId]);

  // Validation effect - runs only once when both images and garment type are available (if not already validated)
  useEffect(() => {
    // Skip validation if already validated or currently validating
    if (validationResult || isValidating) {
      return;
    }

    const validateImages = async () => {
      // Only validate if we have all required data
      if (garmentFrontImage && garmentBackImage && garmentType && gender) {
        setIsValidating(true);
        setError(null);

        try {
          const result = await validateGarmentType(
            garmentFrontImage,
            garmentBackImage,
            garmentType,
            gender,
            user.id
          );
          setValidationResult(result);
          if (!result.isValid) {
            setError(result.errorMessage || 'Validation failed. Please check your uploads.');
          }
        } catch (err) {
          console.error('Validation error:', err);
          setError((err as Error).message || 'Validation failed. Please try again.');
          setValidationResult({ isValid: false, errorMessage: 'Validation failed. Please try again.' });
        } finally {
          setIsValidating(false);
        }
      }
    };

    validateImages();
  }, [garmentFrontImage, garmentBackImage, garmentType, gender, user.id]);

  const handleGarmentFrontUpload = (file: ImageFile) => {
    // Only clear everything if this is a completely new garment (no front image existed)
    const isNewGarment = !garmentFrontImage;

    if (isNewGarment) {
      // Clear generated poses and collections for new garment
      setPoseGenerationState({});
      setPoseCollections({});
      setValidationResult(null);
      // Delete old folder asynchronously (don't await)
      deleteUserStyleSceneFolder(user.id).catch(err => console.error('Failed to delete folder:', err));
    }

    // Simply set the front image - React will preserve the back image automatically
    setGarmentFrontImage(file);
  };

  const handleGarmentBackUpload = (file: ImageFile) => {
    // Clear validation when back image changes (user is uploading a different back view)
    setValidationResult(null);
    // Simply set the back image - React will preserve the front image automatically
    setGarmentBackImage(file);
  };

  // Store the last used complementary garment config for batch processing
  const [lastUsedComplementaryConfig, setLastUsedComplementaryConfig] = useState<ComplementaryGarmentConfig | null>(null);

  // Handle opening confirmation page for a pose
  const handleStartGeneration = (pose: PoseForDisplay, garmentView: 'front' | 'back') => {
    setGenerationTarget({ pose, garmentView });
    setCurrentView('generate');
    // Reset complementary garment config when starting new generation
    setComplementaryGarmentConfig(null);
    setComplementaryGarmentImage(null);
    setSelectedCategoryId(null);
    setSelectedSubcategoryId(null);
    setCustomGarmentText('');
  };

  // Handle adding pose to queue (from confirmation page)
  const handleAddToQueue = () => {
    if (!generationTarget || !selectedModel || !garmentType) return;

    const { pose, garmentView } = generationTarget;
    const garmentImage = garmentView === 'front' ? garmentFrontImage : garmentBackImage;

    if (!garmentImage) {
      setError(`Garment image for the ${garmentView} view is missing.`);
      return;
    }

    // Check if pose is already in queue
    const existingIndex = queuedPoses.findIndex(qp => qp.pose.id === pose.id && qp.garmentView === garmentView);
    if (existingIndex >= 0) {
      setError('This pose is already in the queue.');
      return;
    }

    // Build complementary garment config
    let compConfig: ComplementaryGarmentConfig | null = complementaryGarmentConfig || { type: 'no-change' };
    if (complementaryGarmentConfig?.type === 'upload' && complementaryGarmentImage) {
      compConfig = { ...complementaryGarmentConfig, uploadedImage: complementaryGarmentImage };
    }
    if (complementaryGarmentConfig?.type === 'ai-based') {
      compConfig = {
        ...complementaryGarmentConfig,
        mainGarmentImage: garmentImage,
        aiCategoryId: selectedCategoryId || undefined,
        aiSubcategoryId: selectedSubcategoryId || undefined,
        aiCustomText: customGarmentText || undefined,
      };
    }

    // Add to queue
    const queuedPose: QueuedPose = {
      id: `${pose.id}-${garmentView}-${Date.now()}`,
      pose,
      garmentView,
      complementaryGarmentConfig: compConfig,
      complementaryGarmentImage: complementaryGarmentConfig?.type === 'upload' ? complementaryGarmentImage : null,
      selectedCategoryId,
      selectedSubcategoryId,
      customGarmentText,
      status: 'queued',
      error: null,
    };

    setQueuedPoses(prev => [...prev, queuedPose]);
    setCurrentView('setup');
    setGenerationTarget(null);
    setComplementaryGarmentConfig(null);
    setComplementaryGarmentImage(null);
    setSelectedCategoryId(null);
    setSelectedSubcategoryId(null);
    setCustomGarmentText('');
    setError(null);
  };

  // Remove pose from queue
  const removeFromQueue = (queuedPoseId: string) => {
    setQueuedPoses(prev => prev.filter(qp => qp.id !== queuedPoseId));
  };

  const handleBatchGenerate = async () => {
    if (queuedPoses.length === 0) {
      setError('Queue is empty. Add poses to queue first.');
      return;
    }

    if (!selectedModel || !garmentType || !gender) {
      setError('Please complete all setup steps before generating.');
      return;
    }

    const totalCreditsNeeded = queuedPoses.length;
    const hasCredits = await hasEnoughCredits(user.id, totalCreditsNeeded);

    if (!hasCredits) {
      setError(`Insufficient credits. You need ${totalCreditsNeeded} credits for this batch.`);
      return;
    }

    setIsProcessingBatch(true);
    setError(null);

    let totalInputImages = 0;
    let totalInputChars = 0;
    let totalOutputImages = 0;
    let successfulCount = 0;

    try {
      // Process queued poses one by one (sequential) - rest stay in Queued status
      const posesToProcess = queuedPoses.filter(qp => qp.status !== 'processing' && qp.status !== 'success');

      const processPose = async (queuedPose: QueuedPose) => {
        // Update status to processing
        setQueuedPoses(prev => prev.map(qp =>
          qp.id === queuedPose.id ? { ...qp, status: 'processing' } : qp
        ));

        try {
          // Get garment image based on view
          const garmentImage = queuedPose.garmentView === 'front'
            ? garmentFrontImage
            : garmentBackImage;

          if (!garmentImage) {
            throw new Error(`Garment image missing for ${queuedPose.garmentView} view`);
          }

          // Get pose reference image
          const poseReferenceImageFile = await urlToImageFile(queuedPose.pose.imageUrl);

          // Track input images
          const inputImagesPerPose = 2 + (queuedPose.complementaryGarmentConfig?.type === 'upload' && queuedPose.complementaryGarmentImage ? 1 : 0);
          totalInputImages += inputImagesPerPose;
          totalInputChars += 2500; // Approximate prompt length

          // Generate image
          const resultBase64 = await generatePoseSwapImage(
            garmentImage,
            poseReferenceImageFile,
            undefined, // fixInstruction
            user.id,
            garmentType,
            queuedPose.complementaryGarmentConfig,
            gender // Pass gender for category lookup
          );

          // Upload to storage
          const imageUrl = await uploadStyleSceneImage(user.id, queuedPose.pose.id, resultBase64);

          // Deduct credit only after successful generation
          const creditResult = await deductCredits(user.id, 1, 'style_scene');
          if (!creditResult.success) {
            throw new Error(creditResult.error || 'Failed to deduct credits');
          }

          totalOutputImages += 1;
          successfulCount += 1;

          // Update pose generation state
          setPoseGenerationState(prev => ({
            ...prev,
            [queuedPose.pose.id]: {
              status: 'success',
              resultUrl: imageUrl,
              sourceView: queuedPose.garmentView
            }
          }));

          // Update queue status to success and remove from queue
          setQueuedPoses(prev => prev.filter(qp => qp.id !== queuedPose.id));

        } catch (err) {
          console.error(`Failed to generate pose ${queuedPose.pose.name}:`, err);
          const errorMsg = (err as Error).message || `Failed to generate pose ${queuedPose.pose.name}.`;

          // Update queue status to error (keep in queue for retry)
          setQueuedPoses(prev => prev.map(qp =>
            qp.id === queuedPose.id
              ? { ...qp, status: 'error', error: errorMsg }
              : qp
          ));
        }
      };

      // Execute one by one (sequential) - only one pose processes at a time, rest remain queued
      for (const queuedPose of posesToProcess) {
        await processPose(queuedPose);
      }

      // Log batch usage asynchronously
      if (successfulCount > 0) {
        logBatchUsage(
          user.id,
          'Style Scene',
          totalInputImages,
          totalInputChars,
          totalOutputImages,
          true // Gemini 3 Pro (gemini-3-pro-image-preview)
        ).catch(console.error);
      }
    } catch (err) {
      console.error('Batch generation error:', err);
      setError((err as Error).message || 'Batch generation failed. Please try again.');
    } finally {
      setIsProcessingBatch(false);
    }
  };


  const handleRegenerate = async (poseId: string, fixInstruction: string) => {
    if (!fixingImageInfo) return;

    const sourceView = fixingImageInfo.sourceView;
    const garmentImage = sourceView === 'front' ? garmentFrontImage : garmentBackImage;
    if (!garmentImage || !selectedModel) {
      setError("Cannot regenerate. Key information (garment or model) is missing.");
      setFixingImageInfo(null);
      return;
    }

    // Check and deduct credits before regeneration
    const hasCredits = await hasEnoughCredits(user.id, 1);
    if (!hasCredits) {
      setError('Insufficient credits. Please upgrade your plan to continue.');
      setFixingImageInfo(null);
      return;
    }

    setPoseGenerationState(prev => ({ ...prev, [poseId]: { status: 'loading' } }));
    setError(null);

    try {
      const pose = selectedModel.poses.find(p => p.id === poseId);
      if (!pose) throw new Error("Pose for regeneration not found.");

      const poseReferenceImageFile = await urlToImageFile(pose.imageUrl);

      const resultBase64 = await generatePoseSwapImage(
        garmentImage,
        poseReferenceImageFile,
        fixInstruction,
        user.id
      );
      const imageUrl = await uploadStyleSceneImage(user.id, pose.id, resultBase64);

      // Deduct credit only after successful generation
      const creditResult = await deductCredits(user.id, 1, 'style_scene_fix');
      if (!creditResult.success) {
        throw new Error(creditResult.error || 'Failed to deduct credits. Please try again.');
      }

      setPoseGenerationState(prev => ({
        ...prev,
        [poseId]: { status: 'success', resultUrl: imageUrl, sourceView: sourceView }
      }));
    } catch (err) {
      console.error(err);
      setError((err as Error).message || `Failed to regenerate pose ${poseId}.`);
      setPoseGenerationState(prev => ({ ...prev, [poseId]: { ...prev[poseId], status: 'error' } }));
    } finally {
      setFixingImageInfo(null);
    }
  };

  const handleStartOver = async () => {
    await deleteUserStyleSceneFolder(user.id);

    setGarmentFrontImage(null);
    setGarmentBackImage(null);
    setGender(null);
    setGarmentType(null);
    setValidationResult(null);
    setModelId(null);
    setPoseGenerationState({});
    setPoseCollections({});
    setError(null);
    setComplementaryGarmentConfig(null);
    setComplementaryGarmentImage(null);
    setSelectedCategoryId(null);
    setSelectedSubcategoryId(null);
    setCustomGarmentText('');
    setQueuedPoses([]); // Clear queue
    setCurrentView('setup'); // Reset view
    setGenerationTarget(null); // Clear generation target
    await deleteImage(GARMENT_FRONT_IMAGE_KEY);
    await deleteImage(GARMENT_BACK_IMAGE_KEY);
    sessionStorage.removeItem(SESSION_STORAGE_KEY);
  };

  const handleDownloadAll = async () => {
    if (finalImages.length === 0) return;
    try {
      const zip = new JSZip();
      for (let i = 0; i < finalImages.length; i++) {
        const response = await fetch(finalImages[i].imageUrl);
        const blob = await response.blob();
        zip.file(`campaign-image-${i + 1}.png`, blob);
      }
      const content = await zip.generateAsync({ type: 'blob' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(content);
      link.download = `zola-ai-campaign-${new Date().getTime()}.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(link.href);
    } catch (error) {
      console.error("Error creating ZIP file:", error);
      setError("Could not create ZIP file for download.");
    }
  };

  const handleDownloadSingle = async (imageUrl: string, poseName: string) => {
    try {
      const response = await fetch(imageUrl);
      if (!response.ok) {
        throw new Error(`Network response was not ok: ${response.statusText}`);
      }
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${poseName.replace(/\s+/g, '_')}-campaign-image.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Download failed:", error);
      setError("Could not download the image. Please try again.");
    }
  };

  const renderStep = (title: string, stepNumber: number, isVisible: boolean, children: React.ReactNode) => {
    if (!isVisible) return null;
    return (
      <div className="mt-8 pt-6 border-t border-gray-200/80 dark:border-gray-700/80 animate-fade-in">
        <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4">
          <span aria-hidden="true" className="text-white bg-sky-600 dark:bg-sky-500 rounded-full w-8 h-8 inline-flex items-center justify-center text-sm font-headline mr-3">{stepNumber}</span>
          {title}
        </h3>
        {children}
      </div>
    );
  };

  return (
    <>
      <div className="min-h-screen flex flex-col items-center p-4 sm:p-6 lg:p-8 bg-gradient-to-b from-sky-50 via-white to-white dark:from-gray-900 dark:via-gray-900 dark:to-gray-900 transition-colors duration-200">
        <main className="w-full max-w-7xl bg-white dark:bg-gray-800 rounded-3xl shadow-2xl p-6 sm:p-10 border border-gray-200/50 dark:border-gray-700/50 transition-colors duration-200">
          <div className="text-center mb-8">
            <h1 className="text-display font-bold text-[#2E1E1E] dark:text-white font-headline">Style|Scene Campaign Director</h1>
            <p className="text-gray-600 mt-2 text-lg">Your AI-Powered E-commerce Photoshoot</p>
          </div>

          <div className="max-w-4xl mx-auto">
            {/* Step 1: Select Gender */}
            {renderStep("Select Gender", 1, true, (
              <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-xl border border-gray-200 dark:border-gray-600">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">Choose Gender</label>
                <div className="flex gap-2">
                  {GENDERS.map(g => (
                    <button
                      key={g.id}
                      onClick={() => {
                        setGender(g.id as 'Male' | 'Female');
                        setGarmentType(null);
                        setGarmentFrontImage(null);
                        setGarmentBackImage(null);
                        setValidationResult(null);
                        setModelId(null);
                      }}
                      className={`flex-1 py-3 rounded-lg text-base font-semibold border-2 transition-colors ${gender === g.id
                          ? 'bg-sky-600 dark:bg-sky-500 border-sky-600 dark:border-sky-500 text-white'
                          : 'bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500 text-gray-700 dark:text-gray-300'
                        }`}
                    >
                      {g.name}
                    </button>
                  ))}
                </div>
              </div>
            ))}

            {/* Step 2: Select Garment Type */}
            {renderStep("Select Garment Type", 2, !!gender, (
              <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-xl border border-gray-200 dark:border-gray-600">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">Choose Garment Type</label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {GARMENT_TYPES.map(gt => (
                    <button
                      key={gt.id}
                      onClick={() => {
                        setGarmentType(gt.id as 'upper' | 'lower');
                        setGarmentFrontImage(null);
                        setGarmentBackImage(null);
                        setValidationResult(null);
                        setModelId(null); // Reset model when switching garment type (upper vs lower use different model sets)
                      }}
                      className={`p-4 rounded-xl border-2 text-left transition-colors ${garmentType === gt.id
                          ? 'bg-sky-50 dark:bg-sky-900/30 border-sky-600 dark:border-sky-500'
                          : 'bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
                        }`}
                    >
                      <div className="font-semibold text-gray-900 dark:text-white mb-1">{gt.name}</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">{gt.description}</div>
                    </button>
                  ))}
                </div>
              </div>
            ))}

            {/* Step 3: Upload Garment */}
            {renderStep(`Upload ${garmentType === 'upper' ? 'Top/Upper' : garmentType === 'lower' ? 'Bottom/Lower' : ''} Garment (Front & Back)`, 3, !!garmentType, (
              <>
                <div className="bg-sky-50 dark:bg-sky-900/20 border-l-4 border-sky-300 dark:border-sky-500 p-4 rounded-r-lg mb-6">
                  <h3 className="font-bold text-sky-600 dark:text-sky-400">Input Pre-requisites for Best Results:</h3>
                  <ul className="list-disc list-inside text-[#2E1E1E]/80 dark:text-gray-300 text-sm mt-2 space-y-1">
                    <li><b>Garment Isolation (CRITICAL):</b> Uploaded garments MUST be clean, clearly visible, and fully isolated (preferably from a Ghost Mannequin or Flat-Lay shot).</li>
                    <li><b>Provide Both Views:</b> For the highest accuracy, upload both the front and back views of your {garmentType === 'upper' ? 'top/upper' : 'bottom/lower'} garment.</li>
                    <li><b>Correct Type:</b> Ensure you upload a {garmentType === 'upper' ? 'shirt, t-shirt, top, or jacket' : 'pants, jeans, shorts, or skirt'} (not the opposite type).</li>
                  </ul>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                  <ImageUploader id="garment-front-image" title="Upload Garment (Front View)" onImageUpload={handleGarmentFrontUpload} icon={<GarmentIcon />} currentFile={garmentFrontImage} />
                  <ImageUploader id="garment-back-image" title="Upload Garment (Back View)" onImageUpload={handleGarmentBackUpload} icon={<GarmentIcon />} currentFile={garmentBackImage} />
                </div>
              </>
            ))}

            {/* Step 4: Validation Status */}
            {renderStep("Validation", 4, !!garmentFrontImage && !!garmentBackImage && !!garmentType, (
              <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-xl border border-gray-200 dark:border-gray-600">
                {isValidating ? (
                  <div className="flex items-center gap-3">
                    <Spinner />
                    <span className="text-gray-700 dark:text-gray-300">Validating uploaded images...</span>
                  </div>
                ) : validationResult ? (
                  validationResult.isValid ? (
                    <div className="flex items-center gap-3 text-green-600 dark:text-green-400">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="font-semibold">Validation Passed!</span>
                      {validationResult.description && <span className="text-sm">- {validationResult.description}</span>}
                    </div>
                  ) : (
                    <div className="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 p-4 rounded-r-lg">
                      <div className="flex items-start gap-3">
                        <svg className="w-5 h-5 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <div>
                          <div className="font-semibold text-red-800 dark:text-red-300 mb-1">Validation Failed</div>
                          <div className="text-sm text-red-700 dark:text-red-400">{validationResult.errorMessage || 'Please upload the correct garment type (front and back views).'}</div>
                        </div>
                      </div>
                    </div>
                  )
                ) : (
                  <div className="text-gray-500 dark:text-gray-400 text-sm">Upload both front and back images to start validation...</div>
                )}
              </div>
            ))}

            {/* Step 5: Model Selection */}
            {renderStep("Select Model", 5, validationResult?.isValid === true, (
              <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-xl border border-gray-200 dark:border-gray-600">
                {selectedModel ? (
                  <div className="flex gap-4 items-center">
                    <img src={selectedModel.fullBodyUrl} alt={selectedModel.label} className="w-24 h-32 object-cover rounded-md shadow-sm" />
                    <div>
                      <h4 className="font-bold text-gray-800 dark:text-white">Selected Model</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{selectedModel.label} ({selectedModel.gender})</p>
                      <button onClick={() => { setModelId(null); }} className="mt-2 text-xs text-sky-600 dark:text-sky-400 font-semibold hover:underline">Change Model</button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Select Model ({gender} only)</label>
                    <button
                      onClick={() => {
                        sessionStorage.setItem('model_gallery_gender', gender!);
                        sessionStorage.setItem('model_gallery_garment_type', garmentType || 'upper');
                        navigate(PATHS.MODEL_GALLERY);
                      }}
                      disabled={!gender}
                      className="w-full py-2.5 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-sm text-gray-700 dark:text-gray-300 font-semibold rounded-full shadow-sm hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Browse {gender} Models
                    </button>
                  </div>
                )}
              </div>
            ))}

            {/* Step 6: Select Poses to Generate */}
            {renderStep("Select Poses to Generate", 6, !!modelId, (
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  Click "Generate" on any pose to add it to the queue. Configure complementary garment options in the confirmation dialog.
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {(selectedModel?.poses || []).map((pose, index) => {
                    const state = poseGenerationState[pose.id] || { status: 'idle' };
                    const isQueued = queuedPoses.some(qp => qp.pose.id === pose.id);
                    const isGenerated = state.status === 'success';
                    const isProcessing = state.status === 'loading' || queuedPoses.some(qp => qp.pose.id === pose.id && qp.status === 'processing');

                    return (
                      <div key={pose.id} className="flex flex-col">
                        <div className="relative group">
                          <img src={pose.imageUrl} alt={`Pose ${index + 1}`} className="w-full aspect-[4/5] object-cover rounded-lg border border-gray-200 dark:border-gray-700" />
                          {state.status === 'success' && state.resultUrl && (
                            <img src={state.resultUrl} alt={`Generated ${pose.name}`} className="w-full aspect-[4/5] object-cover rounded-lg absolute inset-0" />
                          )}
                          {isProcessing && (
                            <div className="absolute inset-0 bg-white/70 dark:bg-gray-800/70 flex items-center justify-center rounded-lg"><Spinner /></div>
                          )}
                        </div>
                        <p className="text-xs font-semibold text-gray-700 dark:text-gray-300 block truncate text-center mt-2 h-7 flex items-center justify-center" title={pose.name}>{pose.name}</p>
                        {isGenerated ? (
                          <div className="mt-1 w-full text-xs font-semibold py-1.5 rounded-full bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 text-center">
                            ✓ Generated
                          </div>
                        ) : isQueued ? (
                          <div className="mt-1 w-full text-xs font-semibold py-1.5 rounded-full bg-sky-100 dark:bg-sky-900/30 text-sky-800 dark:text-sky-300 text-center">
                            Queued
                          </div>
                        ) : (
                          <button
                            onClick={() => {
                              // Use pose's defaultView property (from models.ts) - this is the correct view for each pose
                              const poseView = ('defaultView' in pose && pose.defaultView)
                                ? pose.defaultView as 'front' | 'back'
                                : 'front'; // Fallback to front if defaultView not available
                              handleStartGeneration(pose, poseView);
                            }}
                            disabled={isProcessing || !garmentFrontImage || !garmentBackImage}
                            className="mt-1 w-full text-xs font-semibold py-1.5 rounded-full bg-sky-600 dark:bg-sky-500 text-white hover:bg-sky-700 dark:hover:bg-sky-600 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                          >
                            Generate
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}

            {/* Step 7: Queue Display */}
            {renderStep("Generation Queue", 7, queuedPoses.length > 0, (
              <div>
                <div className="mb-4 flex justify-between items-center">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {queuedPoses.length} pose{queuedPoses.length !== 1 ? 's' : ''} in queue
                  </p>
                  <button
                    onClick={handleBatchGenerate}
                    disabled={isProcessingBatch || queuedPoses.length === 0}
                    className="px-4 py-2 bg-sky-600 text-white text-sm font-semibold rounded-full shadow-md hover:bg-sky-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {isProcessingBatch ? (
                      <>
                        <Spinner />
                        Processing...
                      </>
                    ) : (
                      `Generate All (${queuedPoses.length})`
                    )}
                  </button>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {queuedPoses.map((queuedPose) => {
                    const statusColors = {
                      'queued': 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200',
                      'processing': 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300',
                      'success': 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300',
                      'error': 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300'
                    };

                    return (
                      <div key={queuedPose.id} className="flex flex-col">
                        <div className="relative group">
                          <img
                            src={queuedPose.pose.imageUrl}
                            alt={queuedPose.pose.name}
                            className="w-full aspect-[4/5] object-cover rounded-lg border border-gray-200 dark:border-gray-700"
                          />
                          {queuedPose.status === 'processing' && (
                            <div className="absolute inset-0 bg-white/70 dark:bg-gray-800/70 flex items-center justify-center rounded-lg">
                              <Spinner />
                            </div>
                          )}
                        </div>
                        <p className="text-xs font-semibold text-gray-700 dark:text-gray-300 block truncate text-center mt-2" title={queuedPose.pose.name}>
                          {queuedPose.pose.name}
                        </p>
                        <div className={`mt-1 w-full text-xs font-semibold py-1.5 rounded-full text-center ${statusColors[queuedPose.status]}`}>
                          {queuedPose.status === 'queued' && 'Queued'}
                          {queuedPose.status === 'processing' && 'Processing...'}
                          {queuedPose.status === 'success' && '✓ Generated'}
                          {queuedPose.status === 'error' && 'Error'}
                        </div>
                        {queuedPose.error && (
                          <p className="text-xs text-red-600 dark:text-red-400 mt-1 text-center truncate" title={queuedPose.error}>
                            {queuedPose.error}
                          </p>
                        )}
                        {queuedPose.status !== 'processing' && queuedPose.status !== 'success' && (
                          <button
                            onClick={() => removeFromQueue(queuedPose.id)}
                            className="mt-1 w-full text-xs font-semibold py-1 px-2 rounded-full bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors"
                          >
                            Remove
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}

            {renderStep("Final Image Gallery", 8, finalImages.length > 0, (
              <div className="animate-fade-in">
                <div className="flex justify-between items-center mb-4">
                  <p className="text-gray-600">{finalImages.length} image{finalImages.length !== 1 && 's'} generated.</p>
                  <button onClick={handleDownloadAll} className="flex items-center justify-center px-4 py-2 bg-[#2E1E1E] text-white text-sm font-semibold rounded-full shadow-md hover:bg-black transition-colors">
                    <div className="h-5 w-5 mr-2"><DownloadIcon className="w-full h-full" /></div> Download All (.zip)
                  </button>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
                  {finalImages.map((result, index) => {
                    const collection = poseCollections[result.poseId] || [];
                    return (
                      <div key={`${result.poseId}-${index}`} className="flex flex-col">
                        <div className="relative group aspect-[4/5] bg-gray-100 rounded-xl shadow-lg overflow-hidden border border-gray-200">
                          <img
                            src={result.imageUrl}
                            alt={`Generated image ${index + 1}`}
                            className="w-full h-full object-cover cursor-pointer"
                            onClick={() => {
                              closedViaBackButton.current = false;
                              setFullscreenImage(result.imageUrl);
                            }}
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-2 gap-2">
                            <div className="absolute top-2 right-2 z-10">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  closedViaBackButton.current = false;
                                  setFullscreenImage(result.imageUrl);
                                }}
                                className="p-2 bg-black/50 text-white rounded-full hover:bg-purple-600 transition-colors"
                                title="Expand to fullscreen"
                              >
                                <ExpandIcon className="h-4 w-4" />
                              </button>
                            </div>
                            <div className="flex gap-2">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setFixingImageInfo(result);
                                }}
                                className="flex-1 bg-white/90 text-gray-800 p-2 rounded-full hover:bg-white"
                                title="Fix This Image"
                              >
                                <div className="w-4 h-4 mx-auto"><FixItIcon /></div>
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDownloadSingle(result.imageUrl, result.poseName);
                                }}
                                className="flex-1 bg-white/90 text-gray-800 p-2 rounded-full hover:bg-white"
                                title="Download Image"
                              >
                                <div className="w-4 h-4 mx-auto"><DownloadIcon className="w-full h-full" /></div>
                              </button>
                            </div>
                          </div>
                        </div>
                        <p className="mt-2 text-sm font-semibold text-gray-700 text-center truncate">{result.poseName}</p>
                        {collection.length > 0 && (
                          <button
                            onClick={() => setViewingCollection({ poseName: result.poseName, images: collection })}
                            className="mt-2 w-full text-xs font-semibold py-1.5 px-2 rounded-full transition-colors flex items-center justify-center h-7 bg-gray-200 text-gray-800 hover:bg-gray-300 truncate"
                            title={`Show Collection (${collection.length})`}
                          >
                            Show Collection ({collection.length})
                          </button>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            ))}

            {error && <p className="mt-6 text-sky-600 text-center bg-sky-50 p-3 rounded-lg border border-sky-300">{error}</p>}

            <div className="mt-10 pt-6 border-t border-gray-200 flex flex-col items-center">
              <button onClick={handleStartOver} className="text-sky-600 hover:text-sky-700 font-semibold">
                Start Over With a New Garment
              </button>
            </div>
          </div>
        </main>

        <footer className="text-center mt-8 text-gray-400 text-sm">
          <p>&copy; {new Date().getFullYear()} Zol Studio AI. All rights reserved.</p>
        </footer>
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

      {/* Confirmation Modal for Queue */}
      {currentView === 'generate' && generationTarget && (
        <div
          className="fixed inset-0 bg-black/50 dark:bg-black/70 z-50 flex items-center justify-center p-4 animate-fade-in"
          onClick={() => {
            setCurrentView('setup');
            setGenerationTarget(null);
          }}
        >
          <div
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Configure Generation</h2>
                <button
                  onClick={() => {
                    setCurrentView('setup');
                    setGenerationTarget(null);
                  }}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                Pose: <strong>{generationTarget.pose.name}</strong> | View: <strong>{generationTarget.garmentView}</strong>
              </p>
            </div>

            <div className="p-6">
              {(() => {
                const complementaryGarmentType = garmentType === 'upper' ? 'lower' : 'upper';
                const complementaryGarmentLabel = complementaryGarmentType === 'upper' ? 'Upper Garment' : 'Lower Garment';
                const categories = gender ? getGarmentCategories(gender, complementaryGarmentType) : [];
                const selectedCategory = categories.find(cat => cat.id === selectedCategoryId);

                return (
                  <div className="space-y-4">
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                      Choose how to handle the {complementaryGarmentLabel.toLowerCase()} in the generated image.
                    </p>

                    {/* Option 1: No Change */}
                    <label className="flex items-start p-4 border-2 rounded-xl cursor-pointer transition-colors hover:border-sky-300 dark:hover:border-sky-600"
                      style={{ borderColor: complementaryGarmentConfig?.type === 'no-change' ? '#0284c7' : '#e5e7eb' }}
                    >
                      <input
                        type="radio"
                        name="complementaryGarment"
                        checked={complementaryGarmentConfig?.type === 'no-change' || !complementaryGarmentConfig}
                        onChange={() => setComplementaryGarmentConfig({ type: 'no-change' })}
                        className="mt-1 mr-3 w-4 h-4 text-sky-600"
                      />
                      <div className="flex-1">
                        <div className="font-semibold text-gray-900 dark:text-white">No Change</div>
                        <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          Keep the {complementaryGarmentType === 'upper' ? 'upper' : 'lower'} garment from the pose as-is
                        </div>
                      </div>
                    </label>

                    {/* Option 2: Upload */}
                    <label className="flex items-start p-4 border-2 rounded-xl cursor-pointer transition-colors hover:border-sky-300 dark:hover:border-sky-600"
                      style={{ borderColor: complementaryGarmentConfig?.type === 'upload' ? '#0284c7' : '#e5e7eb' }}
                    >
                      <input
                        type="radio"
                        name="complementaryGarment"
                        checked={complementaryGarmentConfig?.type === 'upload'}
                        onChange={() => setComplementaryGarmentConfig({ type: 'upload' })}
                        className="mt-1 mr-3 w-4 h-4 text-sky-600"
                      />
                      <div className="flex-1">
                        <div className="font-semibold text-gray-900 dark:text-white">Upload {complementaryGarmentLabel}</div>
                        <div className="text-sm text-gray-600 dark:text-gray-400 mt-1 mb-3">
                          Upload your own {complementaryGarmentType === 'upper' ? 'upper' : 'lower'} garment image
                        </div>
                        {complementaryGarmentConfig?.type === 'upload' && (
                          <div className="mt-3">
                            <ImageUploader
                              id="complementary-garment-modal"
                              title={`Upload ${complementaryGarmentLabel}`}
                              onImageUpload={setComplementaryGarmentImage}
                              icon={<GarmentIcon />}
                              currentFile={complementaryGarmentImage}
                            />
                          </div>
                        )}
                      </div>
                    </label>

                    {/* Option 3: AI-Based */}
                    <label className="flex items-start p-4 border-2 rounded-xl cursor-pointer transition-colors hover:border-sky-300 dark:hover:border-sky-600"
                      style={{ borderColor: complementaryGarmentConfig?.type === 'ai-based' ? '#0284c7' : '#e5e7eb' }}
                    >
                      <input
                        type="radio"
                        name="complementaryGarment"
                        checked={complementaryGarmentConfig?.type === 'ai-based'}
                        onChange={() => {
                          setComplementaryGarmentConfig({ type: 'ai-based' });
                          setSelectedCategoryId(null);
                          setSelectedSubcategoryId(null);
                          setCustomGarmentText('');
                        }}
                        className="mt-1 mr-3 w-4 h-4 text-sky-600"
                      />
                      <div className="flex-1">
                        <div className="font-semibold text-gray-900 dark:text-white">AI-Based {complementaryGarmentLabel}</div>
                        <div className="text-sm text-gray-600 dark:text-gray-400 mt-1 mb-3">
                          Let AI generate a {complementaryGarmentType === 'upper' ? 'top/shirt' : 'pants/shorts'} that matches your main garment's color
                        </div>
                        {complementaryGarmentConfig?.type === 'ai-based' && (
                          <div className="mt-3 space-y-4">
                            {/* Category Dropdown */}
                            <div>
                              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Select Category
                              </label>
                              <select
                                value={selectedCategoryId || ''}
                                onChange={(e) => {
                                  setSelectedCategoryId(e.target.value || null);
                                  setSelectedSubcategoryId(null);
                                  setCustomGarmentText('');
                                }}
                                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                              >
                                <option value="">Select a category...</option>
                                {categories.map(cat => (
                                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                                ))}
                                <option value="other">Other (Custom)</option>
                              </select>
                            </div>

                            {/* Subcategory Dropdown */}
                            {selectedCategoryId && selectedCategoryId !== 'other' && selectedCategory && (
                              <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                  Select {selectedCategory.name}
                                </label>
                                <select
                                  value={selectedSubcategoryId || ''}
                                  onChange={(e) => {
                                    setSelectedSubcategoryId(e.target.value || null);
                                    setCustomGarmentText('');
                                  }}
                                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                                >
                                  <option value="">Select a style...</option>
                                  {selectedCategory.subcategories.map(sub => (
                                    <option key={sub.id} value={sub.id}>{sub.name}</option>
                                  ))}
                                </select>
                                {selectedSubcategoryId && (
                                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                                    {selectedCategory.subcategories.find(s => s.id === selectedSubcategoryId)?.description}
                                  </p>
                                )}
                              </div>
                            )}

                            {/* Custom Text Input */}
                            {selectedCategoryId === 'other' && (
                              <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                  Describe the {complementaryGarmentType === 'upper' ? 'upper' : 'lower'} garment you want
                                </label>
                                <input
                                  type="text"
                                  value={customGarmentText}
                                  onChange={(e) => setCustomGarmentText(e.target.value)}
                                  placeholder={`e.g., ${complementaryGarmentType === 'upper' ? 'Oversized Hoodie' : 'Cargo Pants'}`}
                                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                                />
                              </div>
                            )}

                            {/* Color Matching Info */}
                            <div className="bg-sky-50 dark:bg-sky-900/20 border-l-4 border-sky-500 p-3 rounded-r-lg text-sm text-sky-700 dark:text-sky-300">
                              <strong>Color Matching:</strong> The AI will automatically match the {complementaryGarmentType === 'upper' ? 'upper' : 'lower'} garment's color to complement your main garment.
                            </div>
                          </div>
                        )}
                      </div>
                    </label>
                  </div>
                );
              })()}
            </div>

            <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-3">
              <button
                onClick={() => {
                  setCurrentView('setup');
                  setGenerationTarget(null);
                }}
                className="px-6 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full font-semibold hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleAddToQueue}
                disabled={
                  (complementaryGarmentConfig?.type === 'upload' && !complementaryGarmentImage) ||
                  (complementaryGarmentConfig?.type === 'ai-based' && (
                    !selectedCategoryId ||
                    (selectedCategoryId !== 'other' && !selectedSubcategoryId) ||
                    (selectedCategoryId === 'other' && !customGarmentText.trim())
                  ))
                }
                className="px-6 py-2 bg-sky-600 dark:bg-sky-500 text-white rounded-full font-semibold hover:bg-sky-700 dark:hover:bg-sky-600 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                Add to Queue
              </button>
            </div>
          </div>
        </div>
      )}

      {fixingImageInfo && (
        <FixItModal
          imageInfo={fixingImageInfo}
          onClose={() => setFixingImageInfo(null)}
          onRegenerate={handleRegenerate}
        />
      )}

      {viewingCollection && (
        <CollectionModal
          images={viewingCollection.images}
          poseName={viewingCollection.poseName}
          onClose={() => setViewingCollection(null)}
        />
      )}
    </>
  );
};

export default StyleScenePage;
