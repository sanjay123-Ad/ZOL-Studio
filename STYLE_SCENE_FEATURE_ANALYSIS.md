# 📊 Style|Scene Campaign Director - Complete Feature Analysis

## 🎯 **Overview & Purpose**

**Style|Scene Campaign Director** is an AI-powered e-commerce photoshoot tool that generates complete lifestyle marketing campaigns from a single garment. It allows users to create multiple professional product images with different poses and backgrounds without needing actual photoshoots.

**Core Value Proposition:**
- Generate entire marketing campaigns from one garment (front + back views)
- Create 20+ different poses automatically
- Change backgrounds without regenerating the entire image
- Export entire campaigns as ZIP files
- All images maintain consistent quality and style

---

## 🔄 **Complete Workflow**

### **Step 1: Upload Garment Images**
- User uploads **front view** of the garment
- User uploads **back view** of the garment
- Both images are stored in IndexedDB for persistence
- **Best Practice:** Garments should be clean, isolated, and clearly visible (preferably from Ghost Mannequin or Flat-Lay shots)

### **Step 2: Select Model**
- User selects gender (Male/Female)
- User navigates to Model Gallery to choose a specific model
- Model selection is saved and persists across sessions
- Each model has multiple pre-defined poses (typically 20+ poses per model)

### **Step 3: Generate Poses**
- User can select any pose from the model's pose library
- Each pose can be generated using either front or back view of the garment
- Clicking "Generate" triggers the AI garment swap process
- **Cost:** 1 credit per pose generation
- Generation happens asynchronously (user can see loading state)
- Generated images are uploaded to Supabase storage

### **Step 4: View & Manage Generated Images**
- All successfully generated poses appear in the "Final Image Gallery"
- User can:
  - **Change Background** - Navigate to Background Gallery to apply different backgrounds
  - **Fix Image** - Regenerate with custom instructions (e.g., "make the shirt tighter")
  - **Download Single** - Download individual images
  - **Download All** - Download entire campaign as ZIP file
  - **View Collection** - See all background variations for a specific pose
  - **Fullscreen View** - Expand images for detailed viewing

### **Step 5: Background Customization (Optional)**
- User clicks "Change Background" on any generated image
- Navigates to Background Gallery page
- Can apply different background styles/colors
- **Cost:** 1 credit per background change
- All background variations are saved as a "collection" for that pose
- User can switch back to original or any variation

---

## 🔧 **Technical Implementation**

### **Core Service Functions**

#### **1. `generatePoseSwapImage()`**
- **AI Model:** `gemini-3-pro-image-preview`
- **Input:** 
  - Garment image (front or back)
  - Pose reference image (from model's pose library)
  - Optional fix instruction (for regeneration)
- **Process:**
  - Uses sophisticated prompt for "Digital Redressing"
  - Removes original clothing from pose image
  - Maps garment onto the model in the selected pose
  - Preserves 100% of garment color, pattern, texture
  - Maintains model's face, hair, body shape, and background
- **Output:** Base64 image string
- **Upload:** Image uploaded to Supabase storage via `uploadStyleSceneImage()`

#### **2. `changeBackgroundImage()`**
- **AI Model:** `gemini-2.5-flash-image`
- **Input:**
  - Generated image (from pose generation)
  - Background reference image
- **Process:**
  - **NOT a background replacement** - it's a background **recoloring**
  - Extracts color palette from reference image
  - Applies color to existing background structure
  - Preserves person, outfit, furniture, lighting, and shadows
  - Only changes the background color/tone
- **Output:** Base64 image string with recolored background

### **State Management**

#### **Local State (React)**
- `garmentFrontImage` - Front view image file
- `garmentBackImage` - Back view image file
- `gender` - Selected gender (Male/Female)
- `modelId` - Selected model ID
- `poseGenerationState` - Object tracking generation status for each pose:
  ```typescript
  {
    [poseId]: {
      status: 'idle' | 'loading' | 'success' | 'error',
      resultUrl?: string,  // Supabase public URL
      sourceView?: 'front' | 'back'
    }
  }
  ```
- `poseCollections` - Collections of background variations per pose:
  ```typescript
  {
    [poseId]: CollectionItem[]  // Array of images with different backgrounds
  }
  ```
- `currentView` - 'setup' | 'generate'
- `generationTarget` - Current pose being generated
- `fixingImageInfo` - Image being fixed/regenerated
- `viewingCollection` - Collection modal state
- `fullscreenImage` - Fullscreen image URL

#### **Persistent Storage**

**IndexedDB (via imageStore service):**
- `stylescene-garment-front-image_{userId}` - Front garment image
- `stylescene-garment-back-image_{userId}` - Back garment image

**SessionStorage/LocalStorage (via stateStore service):**
- `styleSceneState_{userId}` - Main state object (poses, collections, model selection)
- `background_collection_{poseId}` - Background variations per pose

**Supabase Storage:**
- `/style-scene/{userId}/{poseId}/generated-image.png` - Generated images
- Images are publicly accessible via Supabase public URLs

---

## 📋 **Key Features & Capabilities**

### **1. Multi-Pose Generation**
- Generate unlimited poses (one at a time)
- Each pose can use front or back garment view
- Default view per pose is pre-configured
- Generation status tracked per pose (idle/loading/success/error)

### **2. Background Customization**
- Change backgrounds without regenerating the pose
- Background changes use color/style transfer (not replacement)
- Multiple background variations saved per pose
- Original image always preserved in collection

### **3. Image Fixing/Regeneration**
- "Fix It" modal allows custom instructions
- Example: "make the shirt tighter", "adjust the color", "fix the wrinkles"
- Regeneration uses same pose and garment view
- **Cost:** 1 credit per regeneration

### **4. Collection Management**
- Each pose can have multiple background variations
- View all variations in a modal gallery
- Collection persists across sessions
- Original image always included in collection

### **5. Campaign Export**
- Download single images as PNG
- Download entire campaign as ZIP file
- ZIP includes all generated poses
- Filename includes timestamp

### **6. State Persistence**
- All state persists across browser sessions
- Garment images saved in IndexedDB
- Generated images saved in Supabase
- Collections saved in localStorage
- State automatically restored on page load

### **7. Model & Pose Management**
- Models organized by gender
- Each model has 20+ pre-defined poses
- Poses categorized (action, angle, variation)
- Model selection persists across sessions
- Changing model clears all generated poses

### **8. Credit System Integration**
- Checks credits before generation
- Deducts 1 credit per pose generation
- Deducts 1 credit per background change
- Deducts 1 credit per image fix/regeneration
- Shows error if insufficient credits

---

## 🎨 **User Interface Components**

### **Main View Structure**

1. **Header**
   - Title: "Style|Scene Campaign Director"
   - Subtitle: "Your AI-Powered E-commerce Photoshoot"

2. **Step 1: Upload Garment**
   - Two image uploaders (Front & Back)
   - Info box with prerequisites
   - Images display when uploaded

3. **Step 2: Define Model**
   - Gender selection buttons (if no model selected)
   - Model preview card (if model selected)
   - "Browse Models" button → navigates to Model Gallery

4. **Step 3: Generate Poses**
   - Grid of pose thumbnails
   - Each pose shows:
     - Pose preview image
     - Generated image overlay (if generated)
     - Pose name
     - Generate/Status button
   - Status indicators:
     - "Generate" (idle)
     - "Generating..." (loading)
     - "✓ Generated" (success)
     - "Retry" (error)

5. **Step 4: Final Image Gallery**
   - Grid of generated images
   - Each image shows:
     - Generated image
     - Hover overlay with action buttons
     - Pose name
     - "Show Collection" button (if backgrounds changed)
   - "Download All (.zip)" button at top
   - Action buttons on hover:
     - Expand (fullscreen)
     - Change Background
     - Fix It
     - Download

6. **Footer**
   - "Start Over With a New Garment" button
   - Clears all state and images

### **Modals & Dialogs**

1. **Fix It Modal** (`FixItModal`)
   - Text area for custom instructions
   - Preview of image being fixed
   - Regenerate button
   - Cancel button

2. **Collection Modal** (`CollectionModal`)
   - Grid of all background variations
   - Fullscreen view for each image
   - Close button

3. **Fullscreen Image Modal**
   - Full-screen image display
   - Close button (X)
   - Click outside to close
   - ESC key to close
   - Browser back button support

4. **Generation Confirmation View**
   - Shows selected pose and garment
   - "Generate Image" button
   - Back button

---

## 🔗 **Integration Points**

### **1. Model Gallery Integration**
- User selects model from Model Gallery
- Model ID passed via `sessionStorage.selected_model_id`
- Gender automatically set based on selected model
- Navigation: `PATHS.MODEL_GALLERY`

### **2. Background Gallery Integration**
- Navigates to Background Gallery for background changes
- Passes data via sessionStorage:
  - `image_for_background_change` - Image URL
  - `poseId_for_background_change` - Pose ID
  - `stylescene_user_id` - User ID
  - `existing_collection_for_pose` - Current collection
- Background Gallery updates collection and returns
- Updated image URL passed back via sessionStorage:
  - `updated_image_url`
  - `updated_image_pose_id`
  - `updated_image_collection`
- Navigation: `PATHS.BACKGROUND_GALLERY`

### **3. Credit System Integration**
- Checks: `hasEnoughCredits(userId, 1)`
- Deducts: `deductCredits(userId, 1, featureName)`
- Feature names:
  - `'style_scene'` - Pose generation
  - `'style_scene_fix'` - Image regeneration
  - `'style_scene_background'` - Background change

### **4. Database Integration**
- Uploads: `uploadStyleSceneImage(userId, poseId, base64Image)`
- Deletes: `deleteUserStyleSceneFolder(userId)`
- Images stored in Supabase Storage
- Public URLs returned for display

### **5. Usage Tracking Integration**
- Logs usage via `logUsage()` in service layer
- Tracks:
  - Feature name
  - Prompt length
  - Image count
  - Success status

---

## 📊 **Data Flow Diagram**

```
User Uploads Garment (Front + Back)
    ↓
Images Stored in IndexedDB
    ↓
User Selects Model (from Model Gallery)
    ↓
Model ID & Gender Saved to State
    ↓
User Selects Pose & Clicks "Generate"
    ↓
[Credit Check] → Deduct 1 Credit
    ↓
generatePoseSwapImage() Called
    ↓
Gemini AI Processes (garment + pose)
    ↓
Base64 Image Returned
    ↓
Upload to Supabase Storage
    ↓
Public URL Stored in poseGenerationState
    ↓
Image Displayed in Gallery
    ↓
[Optional] User Clicks "Change Background"
    ↓
Navigate to Background Gallery
    ↓
[Credit Check] → Deduct 1 Credit
    ↓
changeBackgroundImage() Called
    ↓
Background Recolored
    ↓
New Image Added to Collection
    ↓
Return to Style Scene Gallery
    ↓
Collection Updated & Displayed
    ↓
[Optional] User Downloads Campaign (ZIP)
```

---

## 🎯 **Key Design Decisions**

### **1. Garment View Selection**
- Each pose has a `defaultView` ('front' or 'back')
- User can't explicitly choose view (uses default)
- View is stored in `sourceView` for regeneration consistency

### **2. Background Recoloring vs. Replacement**
- Uses **recoloring** (color/style transfer) not replacement
- Preserves background structure (furniture, walls, floors)
- Only changes color palette
- This maintains consistency with original scene

### **3. State Persistence Strategy**
- Images in IndexedDB (large binary data)
- State objects in localStorage/sessionStorage (JSON)
- Generated images in Supabase (permanent storage)
- Collections per pose (not per garment)

### **4. Model Change Behavior**
- Changing model clears all generated poses
- Garment images preserved
- Collections cleared
- This prevents mixing different models

### **5. Garment Change Behavior**
- Changing front garment clears everything (new garment = new campaign)
- Changing back garment preserves front and generated poses
- Folder deleted from Supabase when new garment uploaded

### **6. Credit Deduction Timing**
- Credits deducted **before** API call
- Prevents generation if insufficient credits
- Error shown immediately
- No rollback mechanism (if generation fails, credit still deducted)

---

## 🔍 **Current Limitations & Considerations**

1. **One Pose at a Time**
   - Can't batch generate multiple poses simultaneously
   - Must generate poses one by one

2. **Garment View Selection**
   - Uses default view per pose
   - User can't manually choose front/back for each pose

3. **Background Types**
   - Only color/style transfer (not full replacement)
   - Limited to background gallery options

4. **State Cleanup**
   - Changing model clears all poses (expected)
   - Changing front garment clears everything (expected)
   - No "undo" for state changes

5. **Error Handling**
   - Credits deducted even if generation fails
   - Error state shown, but user must retry manually

6. **Collection Size**
   - No explicit limit on collection size
   - Stored in localStorage (size limits apply)

---

## 📝 **Summary**

**Style|Scene Campaign Director** is a comprehensive campaign generation tool that:

1. ✅ Takes garment images (front + back) as input
2. ✅ Allows model selection from gallery
3. ✅ Generates multiple poses with AI garment swapping
4. ✅ Enables background customization via color transfer
5. ✅ Provides image fixing/regeneration capabilities
6. ✅ Manages collections of background variations
7. ✅ Exports campaigns as ZIP files
8. ✅ Persists all state across sessions
9. ✅ Integrates with credit system
10. ✅ Uses Supabase for image storage

**Primary Use Case:** E-commerce brands and marketers who need to generate complete lifestyle campaigns for products without expensive photoshoots.

---

**File Locations:**
- Main Component: `pages/StyleScenePage.tsx`
- Service Layer: `services/styleSceneService.ts`
- Database Functions: `services/db.ts` (uploadStyleSceneImage, deleteUserStyleSceneFolder)
- Models/Poses: `services/models.ts`
- Background Gallery: `pages/BackgroundGalleryPage.tsx`
- Modals: `components/FixItModal.tsx`, `components/CollectionModal.tsx`


