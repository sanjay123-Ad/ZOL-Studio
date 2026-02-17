export type PoseCategory = 'action' | 'angle' | 'variation';

export interface Pose {
  id: string; // e.g., 'MA1'
  name: string;
  imageUrl: string;
  category: PoseCategory;
  defaultView: 'front' | 'back';
}

export interface Model {
  id: string;
  gender: 'Male' | 'Female';
  label: string; // Display label
  fullBodyUrl: string;
  closeUpUrl: string;
  poses?: Pose[];
}

// Male models
const MALE_MODELS: Model[] = [
  {
    id: 'M_A',
    gender: 'Male',
    label: 'Model 1',
    fullBodyUrl: 'https://i.postimg.cc/J4nYz28Y/A-main.jpg',
    closeUpUrl: 'https://i.postimg.cc/BQkpQZM6/A-main-Closeup.jpg',
    poses: [
      { id: 'MA1', name: 'Pose 1', imageUrl: 'https://i.postimg.cc/DZxdV78t/A1.jpg', category: 'action', defaultView: 'front' },
      { id: 'MA2', name: 'Pose 2', imageUrl: 'https://i.postimg.cc/m2v3WXg2/A2.jpg', category: 'action', defaultView: 'front' },
      { id: 'MA3', name: 'Pose 3', imageUrl: 'https://i.postimg.cc/hjtT1NpZ/A3.jpg', category: 'action', defaultView: 'front' },
      { id: 'MA4', name: 'Pose 4', imageUrl: 'https://i.postimg.cc/sf8756SS/A4.jpg', category: 'action', defaultView: 'front' },
      { id: 'MA5', name: 'Pose 5', imageUrl: 'https://i.postimg.cc/jjs7RGVB/A5.jpg', category: 'action', defaultView: 'front' },
      { id: 'MA6', name: 'Pose 6', imageUrl: 'https://i.postimg.cc/tR120VNm/A6.jpg', category: 'action', defaultView: 'back' },
      { id: 'MA7', name: 'Pose 7', imageUrl: 'https://i.postimg.cc/nh11KKnZ/A7.jpg', category: 'action', defaultView: 'front' },
      { id: 'MA8', name: 'Pose 8', imageUrl: 'https://i.postimg.cc/bvCHWzDf/A8.jpg', category: 'action', defaultView: 'front' },
      { id: 'MA9', name: 'Pose 9', imageUrl: 'https://i.postimg.cc/RF21CXLP/A9.jpg', category: 'action', defaultView: 'front' },
    ],
  },
  {
    id: 'M_B',
    gender: 'Male',
    label: 'Model 2',
    fullBodyUrl: 'https://i.postimg.cc/SsY8Pcb1/B-Main.jpg',
    closeUpUrl: 'https://i.postimg.cc/MZRVb0YN/B-Main-Closeup.jpg',
    poses: [
      { id: 'MB1', name: 'Pose 1', imageUrl: 'https://i.postimg.cc/9FY9sWKG/B1.jpg', category: 'action', defaultView: 'front' },
      { id: 'MB2', name: 'Pose 2', imageUrl: 'https://i.postimg.cc/qB86CJJ6/B2.jpg', category: 'action', defaultView: 'front' },
      { id: 'MB3', name: 'Pose 3', imageUrl: 'https://i.postimg.cc/SxZMNgyj/B3.jpg', category: 'action', defaultView: 'back' },
      { id: 'MB4', name: 'Pose 4', imageUrl: 'https://i.postimg.cc/MT1HR58s/B4.jpg', category: 'action', defaultView: 'back' },
      { id: 'MB5', name: 'Pose 5', imageUrl: 'https://i.postimg.cc/g2r04mWy/B5.jpg', category: 'action', defaultView: 'front' },
      { id: 'MB6', name: 'Pose 6', imageUrl: 'https://i.postimg.cc/HW2sgVWW/B6.jpg', category: 'action', defaultView: 'back' },
      { id: 'MB7', name: 'Pose 7', imageUrl: 'https://i.postimg.cc/sXJysNzC/B7.jpg', category: 'action', defaultView: 'front' },
    ],
  },
  {
    id: 'M_C',
    gender: 'Male',
    label: 'Model 3',
    fullBodyUrl: 'https://i.postimg.cc/ncN8bJm9/C-Main.jpg',
    closeUpUrl: 'https://i.postimg.cc/yxWGtQYR/C-Main-Closeup.jpg',
    poses: [
      { id: 'MC1', name: 'Pose 1', imageUrl: 'https://i.postimg.cc/wTCr4kKG/C1.jpg', category: 'action', defaultView: 'front' },
      { id: 'MC2', name: 'Pose 2', imageUrl: 'https://i.postimg.cc/pdZ1Tbm8/C2.jpg', category: 'action', defaultView: 'back' },
      { id: 'MC3', name: 'Pose 3', imageUrl: 'https://i.postimg.cc/d1NH22mk/C3.jpg', category: 'action', defaultView: 'front' },
      { id: 'MC4', name: 'Pose 4', imageUrl: 'https://i.postimg.cc/X7CH5yZ4/C4.jpg', category: 'action', defaultView: 'front' },
      { id: 'MC5', name: 'Pose 5', imageUrl: 'https://i.postimg.cc/wvMFjt8z/C5.jpg', category: 'action', defaultView: 'front' },
      { id: 'MC6', name: 'Pose 6', imageUrl: 'https://i.postimg.cc/7LYjSZrP/C6.jpg', category: 'action', defaultView: 'front' },
      { id: 'MC7', name: 'Pose 7', imageUrl: 'https://i.postimg.cc/1RnhWXnf/C7.jpg', category: 'action', defaultView: 'back' },
      { id: 'MC8', name: 'Pose 8', imageUrl: 'https://i.postimg.cc/GhwNqQnf/C8.jpg', category: 'action', defaultView: 'front' },
    ],
  },
];

// Female models
const FEMALE_MODELS: Model[] = [
  {
    id: 'F_A_new',
    gender: 'Female',
    label: 'Model 1',
    fullBodyUrl: 'https://i.postimg.cc/KvN7NqJ0/A-main.png',
    closeUpUrl: 'https://i.postimg.cc/3wDDPnC6/A-Main-Closeup.png',
    poses: [
      { id: 'FA1', name: 'Pose 1', imageUrl: 'https://i.postimg.cc/L5qxsdpy/A1.jpg', category: 'action', defaultView: 'front' },
      { id: 'FA2', name: 'Pose 2', imageUrl: 'https://i.postimg.cc/8zgZTnnk/A2.jpg', category: 'action', defaultView: 'front' },
      { id: 'FA3', name: 'Pose 3', imageUrl: 'https://i.postimg.cc/G2tQM09F/A3.jpg', category: 'action', defaultView: 'front' },
      { id: 'FA4', name: 'Pose 4', imageUrl: 'https://i.postimg.cc/hGkL0JWJ/A4.jpg', category: 'action', defaultView: 'front' },
      { id: 'FA5', name: 'Pose 5', imageUrl: 'https://i.postimg.cc/v8LrWHPy/A5.jpg', category: 'action', defaultView: 'back' },
      { id: 'FA6', name: 'Pose 6', imageUrl: 'https://i.postimg.cc/VNCM5Yrr/A6.jpg', category: 'action', defaultView: 'back' },
      { id: 'FA7', name: 'Pose 7', imageUrl: 'https://i.postimg.cc/HxHFfP11/A7.jpg', category: 'action', defaultView: 'front' },
      { id: 'FA8', name: 'Pose 8', imageUrl: 'https://i.postimg.cc/GhgsQBvp/A8.jpg', category: 'action', defaultView: 'front' },
      { id: 'FA9', name: 'Pose 9', imageUrl: 'https://i.postimg.cc/B63862fL/A9.jpg', category: 'action', defaultView: 'front' },
      { id: 'FA10', name: 'Pose 10', imageUrl: 'https://i.postimg.cc/W4LzW0zV/A10.jpg', category: 'action', defaultView: 'front' },
    ],
  },
  {
    id: 'F_B',
    gender: 'Female',
    label: 'Model 2',
    fullBodyUrl: 'https://i.postimg.cc/PxLDpY6Q/B-Main.jpg',
    closeUpUrl: 'https://i.postimg.cc/fW9XM7tq/B-Main-Closeup.jpg',
    poses: [
      { id: 'FB1', name: 'Pose 1', imageUrl: 'https://i.postimg.cc/PxLDpY6Q/B-Main.jpg', category: 'action', defaultView: 'front' },
      { id: 'FB2', name: 'Pose 2', imageUrl: 'https://i.postimg.cc/PJWPY41T/B2.jpg', category: 'action', defaultView: 'front' },
      { id: 'FB3', name: 'Pose 3', imageUrl: 'https://i.postimg.cc/7L5hmDS9/B3.jpg', category: 'action', defaultView: 'front' },
      { id: 'FB4', name: 'Pose 4', imageUrl: 'https://i.postimg.cc/MpTppx36/B4.jpg', category: 'action', defaultView: 'back' },
      { id: 'FB5', name: 'Pose 5', imageUrl: 'https://i.postimg.cc/nVGFKM6J/B5.jpg', category: 'action', defaultView: 'back' },
      { id: 'FB6', name: 'Pose 6', imageUrl: 'https://i.postimg.cc/zvxYsHrM/B6.jpg', category: 'action', defaultView: 'front' },
      { id: 'FB7', name: 'Pose 7', imageUrl: 'https://i.postimg.cc/Y0qJz2W8/B7.jpg', category: 'action', defaultView: 'front' },
    ],
  },
  {
    id: 'F_C',
    gender: 'Female',
    label: 'Model 3',
    fullBodyUrl: 'https://i.postimg.cc/hj30NKYh/C-Main.jpg',
    closeUpUrl: 'https://i.postimg.cc/k5Hcpnz5/C-Main-Closeup.jpg',
    poses: [
      { id: 'FC1', name: 'Pose 1', imageUrl: 'https://i.postimg.cc/wM8k9w9P/C1.jpg', category: 'action', defaultView: 'front' },
      { id: 'FC2', name: 'Pose 2', imageUrl: 'https://i.postimg.cc/8kMHZgHJ/C2.jpg', category: 'action', defaultView: 'front' },
      { id: 'FC3', name: 'Pose 3', imageUrl: 'https://i.postimg.cc/xTPPSGBC/C3.jpg', category: 'action', defaultView: 'front' },
      { id: 'FC4', name: 'Pose 4', imageUrl: 'https://i.postimg.cc/7LJ7bStr/C4.jpg', category: 'action', defaultView: 'front' },
      { id: 'FC5', name: 'Pose 5', imageUrl: 'https://i.postimg.cc/G2kyxd1g/C5.jpg', category: 'action', defaultView: 'back' },
      { id: 'FC6', name: 'Pose 6', imageUrl: 'https://i.postimg.cc/gjm6MQzR/C6.jpg', category: 'action', defaultView: 'front' },
      { id: 'FC7', name: 'Pose 7', imageUrl: 'https://i.postimg.cc/rFyrxBZg/C7.jpg', category: 'action', defaultView: 'front' },
      { id: 'FC8', name: 'Pose 8', imageUrl: 'https://i.postimg.cc/rp40qMzz/C8.jpg', category: 'action', defaultView: 'front' },
      { id: 'FC9', name: 'Pose 9', imageUrl: 'https://i.postimg.cc/W4SRFJdW/C9.jpg', category: 'action', defaultView: 'front' },
      { id: 'FC10', name: 'Pose 10', imageUrl: 'https://i.postimg.cc/nc7hs0nt/C10.jpg', category: 'action', defaultView: 'front' },
    ],
  },
];

// Female models for LOWER garment (Bottom/Pant) - shown when user selects Bottom/Lower + Female
const FEMALE_LOWER_MODELS: Model[] = [
  {
    id: 'FL_B',
    gender: 'Female',
    label: 'Model B (Lower)',
    fullBodyUrl: 'https://i.postimg.cc/J0LDL8J5/B1.jpg',
    closeUpUrl: 'https://i.postimg.cc/9XwPGXJp/B-Closeup.jpg',
    poses: [
      { id: 'FLB1', name: 'Pose 1', imageUrl: 'https://i.postimg.cc/J0LDL8J5/B1.jpg', category: 'action', defaultView: 'front' },
      { id: 'FLB2', name: 'Pose 2', imageUrl: 'https://i.postimg.cc/KznjQWVK/B2.jpg', category: 'action', defaultView: 'back' },
      { id: 'FLB3', name: 'Pose 3', imageUrl: 'https://i.postimg.cc/Gm54pGGb/B3.jpg', category: 'action', defaultView: 'front' },
      { id: 'FLB4', name: 'Pose 4', imageUrl: 'https://i.postimg.cc/pLpd3r4P/B4.jpg', category: 'action', defaultView: 'front' },
      { id: 'FLB5', name: 'Pose 5', imageUrl: 'https://i.postimg.cc/zBSDTgb4/B5.jpg', category: 'action', defaultView: 'front' },
      { id: 'FLB6', name: 'Pose 6', imageUrl: 'https://i.postimg.cc/GmWbNQvF/B6.jpg', category: 'action', defaultView: 'back' },
    ],
  },
  {
    id: 'FL_A',
    gender: 'Female',
    label: 'Model A (Lower)',
    fullBodyUrl: 'https://i.postimg.cc/T2tfGGrV/A1.jpg',
    closeUpUrl: 'https://i.postimg.cc/GpzT1VKf/A-Closeup.jpg',
    poses: [
      { id: 'FLA1', name: 'Pose 1', imageUrl: 'https://i.postimg.cc/T2tfGGrV/A1.jpg', category: 'action', defaultView: 'front' },
      { id: 'FLA2', name: 'Pose 2', imageUrl: 'https://i.postimg.cc/QtXZGnC7/A2.jpg', category: 'action', defaultView: 'back' },
      { id: 'FLA3', name: 'Pose 3', imageUrl: 'https://i.postimg.cc/VsZQpg8t/A3.jpg', category: 'action', defaultView: 'front' },
      { id: 'FLA4', name: 'Pose 4', imageUrl: 'https://i.postimg.cc/s2rt70p8/A4.jpg', category: 'action', defaultView: 'front' },
      { id: 'FLA5', name: 'Pose 5', imageUrl: 'https://i.postimg.cc/tJwcTrRX/A5.jpg', category: 'action', defaultView: 'front' },
      { id: 'FLA6', name: 'Pose 6', imageUrl: 'https://i.postimg.cc/s2sNvGzs/A6.jpg', category: 'action', defaultView: 'back' },
    ],
  },
];

// Male models for LOWER garment (Bottom/Pant) - shown when user selects Bottom/Lower + Male
const MALE_LOWER_MODELS: Model[] = [
  {
    id: 'ML_A',
    gender: 'Male',
    label: 'Model 1 (Lower)',
    fullBodyUrl: 'https://i.postimg.cc/sxWqFLqw/A1.jpg',
    closeUpUrl: 'https://i.postimg.cc/63kbh0qV/A-Closeup.jpg',
    poses: [
      { id: 'MLA1', name: 'Pose 1', imageUrl: 'https://i.postimg.cc/sxWqFLqw/A1.jpg', category: 'action', defaultView: 'front' },
      { id: 'MLA2', name: 'Pose 2', imageUrl: 'https://i.postimg.cc/t4Brcy7J/A2.jpg', category: 'action', defaultView: 'back' },
      { id: 'MLA3', name: 'Pose 3', imageUrl: 'https://i.postimg.cc/nzD0MD2L/A3.jpg', category: 'action', defaultView: 'front' },
      { id: 'MLA4', name: 'Pose 4', imageUrl: 'https://i.postimg.cc/sDcKByYP/A4.jpg', category: 'action', defaultView: 'front' },
    ],
  },
  {
    id: 'ML_B',
    gender: 'Male',
    label: 'Model 2 (Lower)',
    fullBodyUrl: 'https://i.postimg.cc/yNFDd6Rb/B1.jpg',
    closeUpUrl: 'https://i.postimg.cc/63WpprtT/B-Closeup.jpg',
    poses: [
      { id: 'MLB1', name: 'Pose 1', imageUrl: 'https://i.postimg.cc/yNFDd6Rb/B1.jpg', category: 'action', defaultView: 'front' },
      { id: 'MLB2', name: 'Pose 2', imageUrl: 'https://i.postimg.cc/rstXVs01/B2.jpg', category: 'action', defaultView: 'back' },
      { id: 'MLB3', name: 'Pose 3', imageUrl: 'https://i.postimg.cc/zXttt8yr/B3.jpg', category: 'action', defaultView: 'front' },
      { id: 'MLB4', name: 'Pose 4', imageUrl: 'https://i.postimg.cc/8zfHZW8s/B4.jpg', category: 'action', defaultView: 'back' },
      { id: 'MLB5', name: 'Pose 5', imageUrl: 'https://i.postimg.cc/QCMg1KkK/B5.jpg', category: 'action', defaultView: 'front' },
    ],
  },
];

export const ALL_MODELS: Model[] = [...MALE_MODELS, ...FEMALE_MODELS];
export { FEMALE_LOWER_MODELS, MALE_LOWER_MODELS };

const ALL_MODELS_INCLUDING_LOWER: Model[] = [...ALL_MODELS, ...FEMALE_LOWER_MODELS, ...MALE_LOWER_MODELS];

/** Returns models to show in gallery based on gender and garment type */
export function getModelsForGallery(gender: 'Male' | 'Female' | null, garmentType: 'upper' | 'lower' | null): Model[] {
  if (!gender) return [];
  if (gender === 'Female' && garmentType === 'lower') return FEMALE_LOWER_MODELS;
  if (gender === 'Male' && garmentType === 'lower') return MALE_LOWER_MODELS;
  return ALL_MODELS.filter(m => m.gender === gender);
}/** Find model by ID (checks both standard and lower garment models) */
export function getModelById(id: string): Model | undefined {
  return ALL_MODELS_INCLUDING_LOWER.find(m => m.id === id);
}
