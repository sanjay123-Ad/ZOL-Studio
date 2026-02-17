# Style Scene Queue-Based Batch Refactor - Complete Analysis

## 📋 Current Status Overview

### ✅ **COMPLETED**

1. **Queue Data Structure**
   - `QueuedPose` type defined (lines 49-62)
   - Includes: pose, garmentView, complementaryGarmentConfig, status, error, etc.

2. **Queue State Management**
   - `queuedPoses` state added (line 124)
   - State initialized as empty array

3. **Handler Functions Created**
   - `handleStartGeneration()` (lines 440-449) - Opens confirmation page
   - `handleAddToQueue()` (lines 452-502) - Adds pose to queue

### ⏳ **PENDING WORK**

## 🔍 Detailed Analysis of Pending Items

### 1. **Confirmation Page UI Missing** ⚠️ CRITICAL

**Current State:**
- `handleStartGeneration()` sets `currentView` to 'generate' (line 442)
- `generationTarget` state is set with pose and garmentView
- **BUT:** No UI is rendered when `currentView === 'generate'`

**What's Needed:**
- Create confirmation page component/view
- Should appear when `currentView === 'generate'` and `generationTarget !== null`
- Must include complementary garment selection UI (currently in Step 6)

**Location:** Should be rendered before the main return statement, similar to other modals

**Required UI Elements:**
```tsx
{currentView === 'generate' && generationTarget && (
  <ConfirmationModal>
    - Pose preview
    - Garment view selector (front/back)
    - Complementary garment options:
      * Radio: No Change
      * Radio: Upload (with ImageUploader)
      * Radio: AI-Based (with category/subcategory dropdowns)
    - "Add to Queue" button (calls handleAddToQueue)
    - "Cancel" button (sets currentView back to 'setup')
  </ConfirmationModal>
)}
```

---

### 2. **Step 6 Needs to be Removed** ⚠️ HIGH PRIORITY

**Current State:**
- Step 6 (lines 917-1078) contains complementary garment configuration
- This should be moved to the confirmation page
- Step 6 should be completely removed from the main workflow

**Action Required:**
- Delete the entire Step 6 `renderStep()` block
- Move complementary garment UI to confirmation page

---

### 3. **Step 7 Needs Individual "Generate" Buttons** ⚠️ HIGH PRIORITY

**Current State:**
- Step 7 (lines 1080-1131) shows all poses in a grid
- Has a single "Generate All" button at the top
- Poses are displayed but have no individual action buttons

**What's Needed:**
- Each pose card should have a "Generate" button
- Button should call `handleStartGeneration(pose, 'front')` or `handleStartGeneration(pose, 'back')`
- Should show status: "Generate", "Queued", "Generating", "Generated"
- Should disable button if already generated or queued

**Implementation:**
```tsx
// In Step 7, for each pose:
<button
  onClick={() => handleStartGeneration(pose, 'front')}
  disabled={state.status === 'success' || isQueued}
  className="..."
>
  {isQueued ? 'Queued' : state.status === 'success' ? 'Generated' : 'Generate'}
</button>
```

---

### 4. **Queue Display Section Missing** ⚠️ HIGH PRIORITY

**Current State:**
- Queue state exists but no UI to display it
- No way for users to see what's queued

**What's Needed:**
- Add new Step 8: "Queue" (before Final Image Gallery)
- Display all queued poses with:
  - Pose name and preview
  - Garment view (front/back)
  - Complementary garment config summary
  - Status (queued/processing/success/error)
  - Remove from queue button
- "Generate All" button to process entire queue

**Implementation:**
```tsx
{renderStep("Queue", 8, queuedPoses.length > 0, (
  <div>
    <div className="mb-4 flex justify-between items-center">
      <p>{queuedPoses.length} pose(s) in queue</p>
      <button onClick={handleBatchGenerate} disabled={isProcessingBatch}>
        Generate All ({queuedPoses.length})
      </button>
    </div>
    <div className="grid grid-cols-2 gap-4">
      {queuedPoses.map(qp => (
        <div key={qp.id}>
          <img src={qp.pose.imageUrl} />
          <p>{qp.pose.name}</p>
          <p>{qp.garmentView} view</p>
          <p>Status: {qp.status}</p>
          <button onClick={() => removeFromQueue(qp.id)}>Remove</button>
        </div>
      ))}
    </div>
  </div>
))}
```

---

### 5. **handleBatchGenerate Needs to Process Queue** ⚠️ CRITICAL

**Current State:**
- `handleBatchGenerate()` (lines 504-629) processes ALL poses from `selectedModel.poses`
- Filters out already generated poses
- Uses `complementaryGarmentConfig` from state (not from queue)

**What's Needed:**
- Change to process `queuedPoses` array instead
- Use complementary garment config from each `QueuedPose` object
- Update queue status as processing progresses
- Remove from queue on success/error

**Required Changes:**
```tsx
const handleBatchGenerate = async () => {
  if (queuedPoses.length === 0) {
    setError('Queue is empty. Add poses to queue first.');
    return;
  }

  // Check credits for all queued poses
  const totalCreditsNeeded = queuedPoses.length;
  const hasCredits = await hasEnoughCredits(user.id, totalCreditsNeeded);
  
  if (!hasCredits) {
    setError(`Insufficient credits. You need ${totalCreditsNeeded} credits.`);
    return;
  }

  setIsProcessingBatch(true);
  setError(null);

  // Process each queued pose
  for (const queuedPose of queuedPoses) {
    // Update status to processing
    setQueuedPoses(prev => prev.map(qp => 
      qp.id === queuedPose.id ? { ...qp, status: 'processing' } : qp
    ));

    try {
      // Deduct credit
      const creditResult = await deductCredits(user.id, 1, 'style_scene');
      if (!creditResult.success) {
        throw new Error(creditResult.error);
      }

      // Get garment image based on view
      const garmentImage = queuedPose.garmentView === 'front' 
        ? garmentFrontImage 
        : garmentBackImage;

      if (!garmentImage) {
        throw new Error(`Garment image missing for ${queuedPose.garmentView} view`);
      }

      // Generate image
      const poseReferenceImageFile = await urlToImageFile(queuedPose.pose.imageUrl);
      const resultBase64 = await generatePoseSwapImage(
        garmentImage,
        poseReferenceImageFile,
        undefined,
        user.id,
        garmentType,
        queuedPose.complementaryGarmentConfig
      );

      // Upload to storage
      const imageUrl = await uploadStyleSceneImage(user.id, queuedPose.pose.id, resultBase64);

      // Update pose generation state
      setPoseGenerationState(prev => ({
        ...prev,
        [queuedPose.pose.id]: { 
          status: 'success', 
          resultUrl: imageUrl, 
          sourceView: queuedPose.garmentView 
        }
      }));

      // Remove from queue on success
      setQueuedPoses(prev => prev.filter(qp => qp.id !== queuedPose.id));

    } catch (err) {
      // Update queue status to error
      setQueuedPoses(prev => prev.map(qp => 
        qp.id === queuedPose.id 
          ? { ...qp, status: 'error', error: (err as Error).message } 
          : qp
      ));
    }
  }

  setIsProcessingBatch(false);
};
```

---

### 6. **handleStartOver Needs to Clear Queue** ⚠️ MEDIUM PRIORITY

**Current State:**
- `handleStartOver()` (lines 687-707) clears all state
- Does NOT clear `queuedPoses`

**What's Needed:**
- Add `setQueuedPoses([])` to clear the queue

**Required Change:**
```tsx
const handleStartOver = async () => {
  // ... existing code ...
  setQueuedPoses([]); // Add this line
  // ... rest of existing code ...
};
```

---

## 📝 Implementation Checklist

### Phase 1: UI Components
- [ ] Create confirmation page/modal component
- [ ] Move complementary garment UI from Step 6 to confirmation page
- [ ] Remove Step 6 from main workflow
- [ ] Update Step 7 to show individual "Generate" buttons

### Phase 2: Queue Display
- [ ] Add Step 8: Queue display section
- [ ] Show queued poses with status
- [ ] Add "Remove from Queue" functionality
- [ ] Add "Generate All" button in queue section

### Phase 3: Queue Processing
- [ ] Refactor `handleBatchGenerate` to process queue
- [ ] Update queue status during processing
- [ ] Remove from queue on success
- [ ] Handle errors in queue items

### Phase 4: Cleanup
- [ ] Update `handleStartOver` to clear queue
- [ ] Test complete workflow
- [ ] Update state persistence to include queue

---

## 🔄 Complete Workflow (After Refactor)

1. **User selects gender** (Step 1)
2. **User selects garment type** (Step 2)
3. **User uploads garment** (Step 3)
4. **Validation runs** (Step 4)
5. **User selects model** (Step 5)
6. **User selects poses** (Step 6 - renamed from Step 7)
   - Each pose has "Generate" button
   - Clicking opens confirmation page
7. **Confirmation Page** (Modal)
   - Shows pose preview
   - Complementary garment options
   - "Add to Queue" button
8. **Queue Display** (Step 7 - new)
   - Shows all queued poses
   - "Generate All" button
   - Remove individual items
9. **Final Image Gallery** (Step 8 - renamed from Step 8)

---

## 🎯 Key Technical Points

### Queue State Management
- Queue persists in component state
- Should be saved to session storage for persistence
- Queue items include all necessary data for generation

### Status Flow
```
queued → processing → success (removed from queue)
                    → error (stays in queue, can retry)
```

### Credit Management
- Credits checked before processing entire queue
- Deducted per pose during processing
- If insufficient credits, show error, don't process any

### Error Handling
- Individual queue items can fail without affecting others
- Failed items stay in queue with error status
- User can remove failed items or retry

---

## 🚨 Critical Issues to Address

1. **No Confirmation Page UI** - Users can't add to queue
2. **handleBatchGenerate processes wrong data** - Processes all poses, not queue
3. **No queue visibility** - Users can't see what's queued
4. **Step 6 should be removed** - Complementary garment config should be in confirmation

---

## 📊 Code Locations Reference

- **Queue Type:** Line 49-62
- **Queue State:** Line 124
- **handleStartGeneration:** Lines 440-449
- **handleAddToQueue:** Lines 452-502
- **handleBatchGenerate:** Lines 504-629 (NEEDS REFACTOR)
- **handleStartOver:** Lines 687-707 (NEEDS UPDATE)
- **Step 6:** Lines 917-1078 (NEEDS REMOVAL)
- **Step 7:** Lines 1080-1131 (NEEDS UPDATE)

---

## ✅ Success Criteria

After refactor is complete:
1. ✅ Users can click "Generate" on individual poses
2. ✅ Confirmation page opens with complementary garment options
3. ✅ "Add to Queue" adds pose to queue (doesn't generate immediately)
4. ✅ Queue section displays all queued poses
5. ✅ "Generate All" processes only queued poses
6. ✅ Queue items show correct status
7. ✅ Failed items stay in queue with error status
8. ✅ "Start Over" clears queue

---

*Last Updated: Based on current codebase analysis*  
*Status: Pending Implementation*












