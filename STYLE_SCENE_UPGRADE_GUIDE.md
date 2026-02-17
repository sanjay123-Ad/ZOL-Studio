# Style Scene Feature Upgrade - Implementation Guide

## Overview
This document outlines the comprehensive upgrade to the Style Scene feature to make it a more powerful tool with enhanced garment selection and complementary garment options.

## New Workflow

### Step 1: Gender Selection
- User selects Male or Female (toggle/buttons)
- **State:** `gender: 'Male' | 'Female' | null`

### Step 2: Garment Type Selection
- User selects "Top/Upper" or "Bottom/Lower"
- **State:** `garmentType: 'upper' | 'lower' | null`
- **UI:** Two buttons/toggle after gender selection

### Step 3: Upload Garment Images
- User uploads front and back images
- **State:** `garmentFrontImage`, `garmentBackImage`
- Both images required to proceed

### Step 4: AI Validation
- Automatically validates uploaded images match selected garment type
- Uses `validateGarmentType()` service
- Shows validation status/errors
- **State:** `validationResult`, `isValidating`
- If invalid, show error message and prevent proceeding

### Step 5: Model Selection
- Filter models by selected gender
- User selects model from gallery
- **State:** `modelId`
- Same as before but filtered by gender

### Step 6: Pose Selection
- Show poses for selected model
- Each pose has generate button
- **State:** `poseGenerationState`

### Step 7: Confirmation Page (NEW)
- Shows selected pose + selected garment (front/back)
- **NEW:** Complementary garment selection:
  - If main garment is Upper → Select Lower garment option
  - If main garment is Lower → Select Upper garment option
  
#### Complementary Garment Options:
1. **No Change** - Keep original complementary garment from pose
2. **Upload** - User uploads complementary garment image
3. **AI-Based** - Select from category/subcategory with:
   - Category dropdown
   - Subcategory dropdown
   - "Other" option with custom text input
   - Color matching based on main garment

### Step 8: Generation
- Uses enhanced `generatePoseSwapImage()` with complementary garment config
- Handles all three complementary garment types
- Returns generated image

### Step 9: Results & Editing
- Same as before: Gallery, background changes, fix it, download, etc.

## New State Management

```typescript
// New state variables
const [garmentType, setGarmentType] = useState<'upper' | 'lower' | null>(null);
const [validationResult, setValidationResult] = useState<GarmentValidationResult | null>(null);
const [isValidating, setIsValidating] = useState(false);
const [complementaryGarmentConfig, setComplementaryGarmentConfig] = useState<ComplementaryGarmentConfig | null>(null);
const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
const [selectedSubcategoryId, setSelectedSubcategoryId] = useState<string | null>(null);
const [customGarmentText, setCustomGarmentText] = useState<string>('');
```

## Key Changes to Generation Service

The `generatePoseSwapImage()` function now accepts:
- `garmentType?: 'upper' | 'lower'`
- `complementaryGarment?: ComplementaryGarmentConfig`

And handles three scenarios:
1. **No change:** Only swap main garment, preserve complementary
2. **Upload:** Swap both main and uploaded complementary garment
3. **AI-based:** Swap main garment + generate complementary garment with color matching

## UI Components Needed

1. **Garment Type Selector** - Toggle/buttons for Upper/Lower
2. **Validation Status Display** - Shows validation result/errors
3. **Complementary Garment Selector** - Radio buttons for No Change/Upload/AI-based
4. **Category/Subcategory Selectors** - Dropdowns for AI-based selection
5. **Custom Text Input** - For "Other" option in AI-based selection
6. **Upload Component** - For complementary garment upload

## Files Modified/Created

1. ✅ `services/styleSceneGarments.ts` - Garment category data
2. ✅ `services/styleSceneValidationService.ts` - Validation service
3. ✅ `services/styleSceneService.ts` - Enhanced generation service
4. ⏳ `pages/StyleScenePage.tsx` - Complete refactor (major changes)
5. ⏳ State persistence updates for new state variables

## Implementation Priority

1. ✅ Create garment category data structures
2. ✅ Create validation service
3. ✅ Enhance generation service
4. ⏳ Refactor StyleScenePage component (in progress)
5. ⏳ Update state persistence
6. ⏳ Test all workflows

## Notes

- All existing features (background changes, fix it, collections, downloads) remain unchanged
- State persistence needs to include new state variables
- Validation happens automatically after both images are uploaded
- Color matching for AI-based garments analyzes main garment colors
- Model selection is filtered by gender (already implemented in model gallery)


