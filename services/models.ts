export type PoseCategory = 'action' | 'angle' | 'variation';

export interface Pose {
  id: string; // e.g., 'A1'
  name: string;
  imageUrl: string;
  category: PoseCategory;
  command: string;
}

export interface Model {
  id: string;
  gender: 'Male' | 'Female';
  label: string; // Ethnic Label
  fullBodyUrl: string;
  closeUpUrl: string;
  poses?: Pose[];
}

const MALE_MODELS: Model[] = [
    {
        id: 'M_A',
        gender: 'Male',
        label: 'Model 1',
        fullBodyUrl: 'https://i.postimg.cc/qqHYrcsx/A-main.jpg',
        closeUpUrl: 'https://i.postimg.cc/52rs1q1N/A-main-closeup.jpg',
        poses: [
            { id: 'A1', name: 'Pose 1', imageUrl: 'https://i.postimg.cc/j26V6ZPM/A1.jpg', category: 'action', command: 'Full body, slight forward lean, hands clasped, selling the fit.' },
            { id: 'A2', name: 'Pose 2', imageUrl: 'https://i.postimg.cc/cJvVkswj/A2.jpg', category: 'angle', command: '3/4 view, adjusting jacket, showing side construction.' },
            { id: 'A3', name: 'Pose 3', imageUrl: 'https://i.postimg.cc/9Fx866mX/A3.jpg', category: 'action', command: 'Full body, casual lean with hands in pockets, relaxed attitude.' },
            { id: 'A4', name: 'Pose 4', imageUrl: 'https://i.postimg.cc/J4hK5pbY/A4.jpg', category: 'action', command: 'Full body, dynamic walking motion, creating natural fabric movement.' },
            { id: 'A5', name: 'Pose 5', imageUrl: 'https://i.postimg.cc/k4cFxSDS/A5.jpg', category: 'action', command: 'Full body, leaning casually on a stool or prop.' },
            { id: 'A6', name: 'Pose 6', imageUrl: 'https://i.postimg.cc/PrcbzTf8/A6.jpg', category: 'variation', command: 'Model sitting casually on a stool, cross-legged, showing garment drape.' },
            { id: 'A7', name: 'Pose 7', imageUrl: 'https://i.postimg.cc/Dz3qH6Xr/A7.jpg', category: 'angle', command: '3/4 view from the back, looking over the shoulder, showing shoulder fit.' },
            { id: 'A8', name: 'Pose 8', imageUrl: 'https://i.postimg.cc/XqP58kW3/A8.jpg', category: 'angle', command: 'Close-up 3/4 back view, focusing on collar and shoulder details.' },
            { id: 'A9', name: 'Pose 9', imageUrl: 'https://i.postimg.cc/wTtLBZ5N/A9.jpg', category: 'angle', command: '3/4 back view with hands in pockets, looking over the shoulder.' },
            { id: 'A10', name: 'Pose 10', imageUrl: 'https://i.postimg.cc/7L42mLFG/A10.jpg', category: 'action', command: 'Full body, relaxed front-facing stance with one hand in pocket.' },
            { id: 'A11', name: 'Pose 11', imageUrl: 'https://i.postimg.cc/qRb6Jxzm/A11.jpg', category: 'action', command: 'Model resting against a prop with hand in pocket.' },
            { id: 'A12', name: 'Pose 12', imageUrl: 'https://i.postimg.cc/02JKvmxd/A12.jpg', category: 'angle', command: 'Direct rear view, looking back over the shoulder.' },
            { id: 'A14', name: 'Pose 13', imageUrl: 'https://i.postimg.cc/KvXBRQ0L/A14.jpg', category: 'angle', command: 'Side profile, leaning on prop, head turned towards camera.' },
            { id: 'A15', name: 'Pose 14', imageUrl: 'https://i.postimg.cc/yNrSBTJr/A15.jpg', category: 'angle', command: 'Direct rear view, highlighting the back details of the garment.' },
            { id: 'A16', name: 'Pose 15', imageUrl: 'https://i.postimg.cc/mgLcHnCz/A16.jpg', category: 'action', command: '3/4 forward view, relaxed stance with one hand in pocket.' },
        ]
    },
    {
        id: 'M_B',
        gender: 'Male',
        label: 'Model 2',
        fullBodyUrl: 'https://i.postimg.cc/63q6RXgM/B-main.jpg',
        closeUpUrl: 'https://i.postimg.cc/P5dCxBXK/B-main-closeup.jpg',
        poses: [
            { id: 'B1', name: 'Pose 1', imageUrl: 'https://i.postimg.cc/hGJt8RjV/B1.jpg', category: 'action', command: 'Symmetrical front-facing stance, hands clasped, conveying confidence.' },
            { id: 'B2', name: 'Pose 2', imageUrl: 'https://i.postimg.cc/3NhrHyZy/B2.jpg', category: 'angle', command: 'Full side profile, model adjusting chest of garment with a downward gaze.' },
            { id: 'B3', name: 'Pose 3', imageUrl: 'https://i.postimg.cc/3rjJFBKb/B3.jpg', category: 'variation', command: 'Model seated, leaning forward with hands clasped, creating a thoughtful mood.' },
            { id: 'B4', name: 'Pose 4', imageUrl: 'https://i.postimg.cc/mgnbgpSq/B4.jpg', category: 'action', command: 'Side profile, leaning against a wall with hand in pocket, head turned to camera.' },
            { id: 'B5', name: 'Pose 5', imageUrl: 'https://i.postimg.cc/8CrTJdKn/B5.jpg', category: 'action', command: 'Casual side profile, leaning against a wall with hand in pocket.' },
            { id: 'B6', name: 'Pose 6', imageUrl: 'https://i.postimg.cc/HnTmhqpz/B6.jpg', category: 'action', command: 'Full body, dynamic walking motion with one hand in pocket.' },
            { id: 'B7', name: 'Pose 7', imageUrl: 'https://i.postimg.cc/jqht7Scb/B7.jpg', category: 'action', command: 'Model leaning against a stool, conveying a relaxed attitude.' },
            { id: 'B8', name: 'Pose 8', imageUrl: 'https://i.postimg.cc/2S1DMFDj/B8.jpg', category: 'variation', command: 'Model seated on a stool with an open, confident body position.' },
            { id: 'B9', name: 'Pose 9', imageUrl: 'https://i.postimg.cc/nL7tcFrg/B9.jpg', category: 'angle', command: '3/4 back view with hands in pockets, looking over the shoulder.' },
            { id: 'B10', name: 'Pose 10', imageUrl: 'https://i.postimg.cc/7hPvVSVS/B10.jpg', category: 'angle', command: 'Direct rear view, looking back over the shoulder.' },
            { id: 'B11', name: 'Pose 11', imageUrl: 'https://i.postimg.cc/J0pfdtYG/B11.jpg', category: 'action', command: 'Confident 3/4 forward stance, highlighting the garment shape.' },
            { id: 'B12', name: 'Pose 12', imageUrl: 'https://i.postimg.cc/sgktLkmv/B12.jpg', category: 'angle', command: 'Direct rear view, highlighting the back details of the garment.' },
            { id: 'B13', name: 'Pose 13', imageUrl: 'https://i.postimg.cc/tJ4fPpqk/B13.jpg', category: 'angle', command: 'Stylized side profile shot with one hand in pocket.' },
            { id: 'B14', name: 'Pose 14', imageUrl: 'https://i.postimg.cc/brV59Wd0/B14.jpg', category: 'action', command: 'Full body, leaning on a prop with hand in pocket.' },
        ]
    },
    {
        id: 'M_C',
        gender: 'Male',
        label: 'Model 3',
        fullBodyUrl: 'https://i.postimg.cc/C5VF2qzp/C-main.jpg',
        closeUpUrl: 'https://i.postimg.cc/hjcy34c1/C-main-closeup.jpg',
        poses: [
            { id: 'C1', name: 'Pose 1', imageUrl: 'https://i.postimg.cc/pT21bRFQ/C1.jpg', category: 'action', command: 'Full body, relaxed front-facing stance with one hand in pocket.' },
            { id: 'C2', name: 'Pose 2', imageUrl: 'https://i.postimg.cc/3NqLvGbL/C2.jpg', category: 'variation', command: 'Model seated in a thoughtful "thinker" pose, showing fabric drape.' },
            { id: 'C3', name: 'Pose 3', imageUrl: 'https://i.postimg.cc/W1g9dhmT/C3.jpg', category: 'angle', command: 'Dynamic striding profile with a look back towards the camera.' },
            { id: 'C4', name: 'Pose 4', imageUrl: 'https://i.postimg.cc/1zKJK2jx/C4.jpg', category: 'action', command: 'Casual side profile, leaning against a wall with hand in pocket.' },
            { id: 'C5', name: 'Pose 5', imageUrl: 'https://i.postimg.cc/xCx5wHY9/C5.jpg', category: 'variation', command: 'Model seated casually on a stool, hands clasped.' },
            { id: 'C6', name: 'Pose 6', imageUrl: 'https://i.postimg.cc/qMCwFz55/C6.jpg', category: 'angle', command: '3/4 view from the back, looking over the shoulder, showing shoulder fit.' },
            { id: 'C7', name: 'Pose 7', imageUrl: 'https://i.postimg.cc/RZ7RM29d/C7.jpg', category: 'angle', command: '3/4 back view, looking over the shoulder.' },
            { id: 'C8', name: 'Pose 8', imageUrl: 'https://i.postimg.cc/tgDN6PsW/C8.jpg', category: 'action', command: 'Confident 3/4 profile stance with both hands in pockets.' },
            { id: 'C9', name: 'Pose 9', imageUrl: 'https://i.postimg.cc/Y9sNnHfB/C9.jpg', category: 'angle', command: 'Direct rear view, highlighting the back details of the garment.' },
        ]
    },
    {
        id: 'M_D',
        gender: 'Male',
        label: 'Model 4',
        fullBodyUrl: 'https://i.postimg.cc/L8jSZBfG/D-main.jpg',
        closeUpUrl: 'https://i.postimg.cc/Y24CCFnt/D-main-closeup.jpg',
        poses: [
            { id: 'D1', name: 'Pose 1', imageUrl: 'https://i.postimg.cc/dVCsjKM5/D1.jpg', category: 'angle', command: '3/4 view from the back, looking over the shoulder with single hand in pocket, showing shoulder fit and back details.' },
            { id: 'D2', name: 'Pose 2', imageUrl: 'https://i.postimg.cc/XJB64fVm/D2.jpg', category: 'angle', command: 'Direct rear view, squared rear stance, highlighting the back details of the garment.' },
            { id: 'D3', name: 'Pose 3', imageUrl: 'https://i.postimg.cc/N0LWk62d/D3.jpg', category: 'angle', command: 'Side profile, leaning against a wall with hand in pocket and relaxed head turn, showing side construction.' },
            { id: 'D4', name: 'Pose 4', imageUrl: 'https://i.postimg.cc/vZZjGrhb/D4.jpg', category: 'action', command: 'Full body, relaxed front-facing stance with single hand in pocket, conveying confidence, selling the fit.' },
            { id: 'D5', name: 'Pose 5', imageUrl: 'https://i.postimg.cc/4d6w6ywX/D5.jpg', category: 'action', command: 'Full body, three-quarter forward stance with single hand in pocket and subtle weight shift, casual attitude.' },
            { id: 'D6', name: 'Pose 6', imageUrl: 'https://i.postimg.cc/G2Cxmrrn/D6.jpg', category: 'variation', command: 'Model seated in three-quarter forward lean on stool with chin-rest hand, open elbow angle, and engaged eye contact, showing garment drape.' },
            { id: 'D7', name: 'Pose 7', imageUrl: 'https://i.postimg.cc/brFnkjXy/D7.jpg', category: 'action', command: 'Full body, three-quarter forward stance with side lean on stool, single hand resting on prop, and relaxed weight shift, conveying a dynamic pose.' },
        ]
    },
    {
        id: 'M_E',
        gender: 'Male',
        label: 'Model 5',
        fullBodyUrl: 'https://i.postimg.cc/RVpr6pNW/E-main.jpg',
        closeUpUrl: 'https://i.postimg.cc/nrwdz50G/E-main-closeup.jpg',
        poses: [
            { id: 'E1', name: 'Pose 1', imageUrl: 'https://i.postimg.cc/QxGm6pvG/E1.jpg', category: 'angle', command: 'Side Profile Relaxed Stance with Single Hand-in-Pocket and Subtle Weight Shift' },
            { id: 'E2', name: 'Pose 2', imageUrl: 'https://i.postimg.cc/y8rSGKWZ/E2.jpg', category: 'action', command: 'Front-Facing Symmetrical Stance with Jacket Hold, Relaxed Elbow Bend, and Even Weight Distribution' },
            { id: 'E3', name: 'Pose 3', imageUrl: 'https://i.postimg.cc/zDSHrKVv/E3.jpg', category: 'angle', command: 'Over-the-Shoulder Look from a Three-Quarter Back Profile with Relaxed Arm Drop and Natural Weight Shift' },
            { id: 'E4', name: 'Pose 4', imageUrl: 'https://i.postimg.cc/3RQWMxhR/E4.jpg', category: 'action', command: 'Three-Quarter Forward Stance with Lean on Chair Back, Single Hand-in-Pocket, Sunglass Styling, and Relaxed Crossed-Leg Weight Shift' },
            { id: 'E5', name: 'Pose 5', imageUrl: 'https://i.postimg.cc/76Bv3Kmp/E5.jpg', category: 'variation', command: 'Seated Casual Pose on Stool with Lean Forward, Hand on Chin, Subtle Head Tilt, and Relaxed Leg Position' },
            { id: 'E6', name: 'Pose 6', imageUrl: 'https://i.postimg.cc/2yptFg48/E6.jpg', category: 'angle', command: 'Side Profile Lean with Hand-in-Pockets, Relaxed Stance against Wall, and Natural Gaze Forward' },
            { id: 'E7', name: 'Pose 7', imageUrl: 'https://i.postimg.cc/cHL2LQ0p/E7.jpg', category: 'action', command: 'Three-Quarter Forward Standing Stance with Single Hand-in-Pocket, Relaxed Arm Drop, and Subtle Cross-Leg Weight Shift' },
            { id: 'E8', name: 'Pose 8', imageUrl: 'https://i.postimg.cc/RhRT6YdD/E8.jpg', category: 'angle', command: 'Full Back-Facing Neutral Stance with Squared Shoulders, Arms Relaxed at Sides, and Even Weight Distribution' },
        ]
    },
    {
        id: 'M_F',
        gender: 'Male',
        label: 'Model 6',
        fullBodyUrl: 'https://i.postimg.cc/V60c93Vc/F-main.jpg',
        closeUpUrl: 'https://i.postimg.cc/SRL3Dq7y/F-main-closeup.jpg',
        poses: [
            { id: 'F1', name: 'Pose 1', imageUrl: 'https://i.postimg.cc/RZTCN5kx/F1.jpg', category: 'action', command: 'Three-Quarter Side Stance with Forward Lean on Chair Back, Both Hands Gripping Prop, and Staggered Leg Placement' },
            { id: 'F2', name: 'Pose 2', imageUrl: 'https://i.postimg.cc/7hCb2sgY/F2.jpg', category: 'action', command: 'Three-Quarter Forward Stance with Single Hand-in-Pocket, Relaxed Arm Drop, and Subtle Weight Shift' },
            { id: 'F3', name: 'Pose 3', imageUrl: 'https://i.postimg.cc/02wb545R/F3.jpg', category: 'angle', command: 'Three-Quarter Side Profile Stance with Single Hand-in-Pocket, Slight Backward Lean, and Relaxed Weight Shift' },
            { id: 'F4', name: 'Pose 4', imageUrl: 'https://i.postimg.cc/vBTZJq2h/F4.jpg', category: 'action', command: 'Front-Facing Relaxed Stance with Single Hand-in-Pocket, Natural Arm Drop, and Slight Weight Shift' },
            { id: 'F5', name: 'Pose 5', imageUrl: 'https://i.postimg.cc/6Q5ZQh1M/F5.jpg', category: 'variation', command: 'Seated Three-Quarter Forward Lean with Chin-Rest Hand, Forearm Support on Thigh, and Focused Forward Gaze' },
            { id: 'F6', name: 'Pose 6', imageUrl: 'https://i.postimg.cc/3NHJk8x8/F6.jpg', category: 'angle', command: 'Rear Three-Quarter Standing Turn with Over-the-Shoulder Look and Single Hand-in-Pocket' },
            { id: 'F7', name: 'Pose 7', imageUrl: 'https://i.postimg.cc/wBy6Fy1w/F7.jpg', category: 'angle', command: 'Full Back-Facing Neutral Standing Stance with Symmetrical Weight Distribution' },
            { id: 'F8', name: 'Pose 8', imageUrl: 'https://i.postimg.cc/Vk51LrWj/F8.jpg', category: 'variation', command: 'Seated Front-Facing Stool Pose with Relaxed Three-Quarter Torso Angle, Hands Lightly Clasped at Lap, and Casual Cross-Leg Foot Placement' },
            { id: 'F9', name: 'Pose 9', imageUrl: 'https://i.postimg.cc/Sxw0SZK3/F9.jpg', category: 'angle', command: 'Side Profile Wall Lean with Back-to-Wall Support, Single Hand-in-Pocket, Bent Rear Knee, and Relaxed Head Turn Toward Camera' },
        ]
    }
];

const FEMALE_MODELS: Model[] = [
    {
        id: 'F_A_new',
        gender: 'Female',
        label: 'Model 1',
        fullBodyUrl: 'https://i.postimg.cc/yN7wgytj/A-main.jpg',
        closeUpUrl: 'https://i.postimg.cc/2ypp6NDG/A-main-closeup.jpg',
        poses: [
            { id: 'FA1', name: 'Pose 1', imageUrl: 'https://i.postimg.cc/fRNPjcRH/A1.jpg', category: 'angle', command: 'Side profile wall lean with a hand in pocket, showcasing the garment\'s silhouette.' },
            { id: 'FA2', name: 'Pose 2', imageUrl: 'https://i.postimg.cc/mk9d7kxq/A2.jpg', category: 'action', command: 'Confident front-facing symmetrical stance, full body view.' },
            { id: 'FA3', name: 'Pose 3', imageUrl: 'https://i.postimg.cc/5NcKbBLt/A3.jpg', category: 'action', command: 'Relaxed three-quarter profile stance with a single hand in the pocket.' },
            { id: 'FA4', name: 'Pose 4', imageUrl: 'https://i.postimg.cc/Pqq222s1/A4.jpg', category: 'variation', command: 'Close-up shot, leaning on a prop with a forward angle, focusing on texture.' },
            { id: 'FA5', name: 'Pose 5', imageUrl: 'https://i.postimg.cc/CM8JPRtJ/A5.jpg', category: 'angle', command: 'Three-quarter back stance with hands on hips or in pockets, showing back details.' },
            { id: 'FA6', name: 'Pose 6', imageUrl: 'https://i.postimg.cc/XYj8YQv8/A6.jpg', category: 'action', command: 'Casual stance with both hands in pockets and a slight forward lean.' },
            { id: 'FA7', name: 'Pose 7', imageUrl: 'https://i.postimg.cc/133GQXCm/A7.jpg', category: 'angle', command: 'Three-quarter back view, looking over the shoulder.' },
            { id: 'FA8', name: 'Pose 8', imageUrl: 'https://i.postimg.cc/j2TfkSwk/A8.jpg', category: 'angle', command: 'Confident three-quarter back stance with a hand on the hip.' },
            { id: 'FA9', name: 'Pose 9', imageUrl: 'https://i.postimg.cc/Cx5q2t1t/A9.jpg', category: 'action', command: 'Three-quarter profile with a hand gently touching the chest or collarbone.' },
            { id: 'FA10', name: 'Pose 10', imageUrl: 'https://i.postimg.cc/FR5k7HZk/A10.jpg', category: 'variation', command: 'Model seated in side profile, leaning with a contemplative downward gaze.' },
            { id: 'FA11', name: 'Pose 11', imageUrl: 'https://i.postimg.cc/8cw7KBVz/A11.jpg', category: 'action', command: 'Standing and leaning on a prop with a distinct hip-shift for a dynamic pose.' },
            { id: 'FA12', name: 'Pose 12', imageUrl: 'https://i.postimg.cc/RVs3wRRk/A12.jpg', category: 'action', command: 'Three-quarter forward view with a hand placed on the chest.' },
            { id: 'FA13', name: 'Pose 13', imageUrl: 'https://i.postimg.cc/sXr130jv/A13.jpg', category: 'action', command: 'Confident front-facing stance with both arms and legs crossed.' },
            { id: 'FA14', name: 'Pose 14', imageUrl: 'https://i.postimg.cc/MKFTnG6h/A14.jpg', category: 'angle', command: 'Full back view with the head turned to the side, showcasing back details.' },
            { id: 'FA15', name: 'Pose 15', imageUrl: 'https://i.postimg.cc/1tsRknBN/A15.jpg', category: 'action', command: 'Front-facing shot with a contemplative gaze and a slight downward head tilt.' },
            { id: 'FA16', name: 'Pose 16', imageUrl: 'https://i.postimg.cc/8P9p1nwV/A16.jpg', category: 'action', command: 'Symmetrical front-facing stance with the model looking down.' },
        ]
    },
    {
        id: 'F_B_new',
        gender: 'Female',
        label: 'Model 2',
        fullBodyUrl: 'https://i.postimg.cc/1t5JPW21/B-main.jpg',
        closeUpUrl: 'https://i.postimg.cc/yNPCvb0B/B-main-closeup.jpg',
        poses: [
            { id: 'FB1', name: 'Pose 1', imageUrl: 'https://i.postimg.cc/15kSxV58/B1.jpg', category: 'action', command: 'A confident, strong front-facing stance, full body.' },
            { id: 'FB2', name: 'Pose 2', imageUrl: 'https://i.postimg.cc/0QyRGpZL/B2.jpg', category: 'action', command: 'A relaxed but powerful front-facing stance.' },
            { id: 'FB3', name: 'Pose 3', imageUrl: 'https://i.postimg.cc/J4kwQ739/B3.jpg', category: 'angle', command: 'Side profile, leaning against a wall with a hand in the pocket.' },
            { id: 'FB4', name: 'Pose 4', imageUrl: 'https://i.postimg.cc/SKmwq60x/B4.jpg', category: 'angle', command: 'Three-quarter back view, looking back over the shoulder.' },
            { id: 'FB5', name: 'Pose 5', imageUrl: 'https://i.postimg.cc/C5n2JJ88/B5.jpg', category: 'action', command: 'An authoritative front-facing stance, full body.' },
            { id: 'FB6', name: 'Pose 6', imageUrl: 'https://i.postimg.cc/SNCSxfPJ/B6.jpg', category: 'angle', command: 'Full back view with the head turned to the side.' },
            { id: 'FB7', name: 'Pose 7', imageUrl: 'https://i.postimg.cc/85xG17Bt/B7.jpg', category: 'action', command: 'Three-quarter forward stance with a hand confidently on the hip.' },
            { id: 'FB8', name: 'Pose 8', imageUrl: 'https://i.postimg.cc/FFJmTxh4/B8.jpg', category: 'action', command: 'Standing and leaning on a prop with both hands in pockets.' },
            { id: 'FB9', name: 'Pose 9', imageUrl: 'https://i.postimg.cc/pLPHXb8G/B9.jpg', category: 'variation', command: 'Seated in profile with a forward lean and a downward gaze.' },
            { id: 'FB10', name: 'Pose 10', imageUrl: 'https://i.postimg.cc/cJHGwRDW/B10.jpg', category: 'action', command: 'A contemplative and thoughtful front-facing stance.' },
            { id: 'FB11', name: 'Pose 11', imageUrl: 'https://i.postimg.cc/L4fKt63x/B11.jpg', category: 'action', command: 'A contemplative front-facing stance with a downward gaze.' },
            { id: 'FB12', name: 'Pose 12', imageUrl: 'https://i.postimg.cc/Mp6CJ0J8/B12.jpg', category: 'action', command: 'A powerful front-facing stance with a hand on the hip.' },
            { id: 'FB13', name: 'Pose 13', imageUrl: 'https://i.postimg.cc/nL5gm6jh/B13.jpg', category: 'angle', command: 'Three-quarter back view, looking back towards the camera.' },
        ]
    },
    {
        id: 'F_C_new',
        gender: 'Female',
        label: 'Model 3',
        fullBodyUrl: 'https://i.postimg.cc/prVNwYY5/C-main.jpg',
        closeUpUrl: 'https://i.postimg.cc/zDx4LhFT/C-main-closeup.jpg',
        poses: [
            { id: 'FC1', name: 'Pose 1', imageUrl: 'https://i.postimg.cc/Twg7Dhvs/C1.jpg', category: 'action', command: 'Symmetrical front-facing stance with hands clasped or folded.' },
            { id: 'FC2', name: 'Pose 2', imageUrl: 'https://i.postimg.cc/yxTLL5dv/C2.jpg', category: 'angle', command: 'Side profile, leaning against a wall with both hands in pockets.' },
            { id: 'FC3', name: 'Pose 3', imageUrl: 'https://i.postimg.cc/Hkn6t6CL/C3.jpg', category: 'action', command: 'Confident front-facing stance with both arms and legs crossed.' },
            { id: 'FC4', name: 'Pose 4', imageUrl: 'https://i.postimg.cc/C1TJSYn8/C4.jpg', category: 'action', command: 'Dynamic striding pose in side profile with hands in pockets.' },
            { id: 'FC5', name: 'Pose 5', imageUrl: 'https://i.postimg.cc/BbJgPggx/C5.jpg', category: 'angle', command: 'Side profile with arms in a contemplative self-embrace.' },
            { id: 'FC6', name: 'Pose 6', imageUrl: 'https://i.postimg.cc/zXX7Jxv4/C6.jpg', category: 'angle', command: 'Three-quarter back view, looking over the shoulder.' },
            { id: 'FC7', name: 'Pose 7', imageUrl: 'https://i.postimg.cc/LsfBy7Qn/C7.jpg', category: 'action', command: 'Confident front-facing stance with arms crossed.' },
            { id: 'FC8', name: 'Pose 8', imageUrl: 'https://i.postimg.cc/nrV4hLFH/C8.jpg', category: 'angle', command: 'Full back view with the head turned to show a profile gaze.' },
            { id: 'FC9', name: 'Pose 9', imageUrl: 'https://i.postimg.cc/T2QjHn0g/C9.jpg', category: 'action', command: 'Three-quarter profile with a hand placed gently on the chest.' },
            { id: 'FC10', name: 'Pose 10', imageUrl: 'https://i.postimg.cc/rFP1qcvC/C10.jpg', category: 'action', command: 'Symmetrical front-facing stance with the model looking down.' },
            { id: 'FC11', name: 'Pose 11', imageUrl: 'https://i.postimg.cc/cJQw7366/C11.jpg', category: 'variation', command: 'Seated in side profile with a downward gaze, leaning on a prop.' },
            { id: 'FC12', name: 'Pose 12', imageUrl: 'https://i.postimg.cc/LXDPwMtp/C12.jpg', category: 'angle', command: 'Side profile, leaning on a prop with a downward gaze.' },
        ]
    },
    {
        id: 'F_D_new',
        gender: 'Female',
        label: 'Model 4',
        fullBodyUrl: 'https://i.postimg.cc/ZKsnchf5/D-main.jpg',
        closeUpUrl: 'https://i.postimg.cc/c4C46bs0/D-main-closeup.jpg',
        poses: [
            { id: 'FD1', name: 'Pose 1', imageUrl: 'https://i.postimg.cc/FzBvjhhq/D1.jpg', category: 'variation', command: 'Seated Three-Quarter Side Pose on Stool with One Hand-in-Pocket, Elongated Leg Line, and Upright Torso Alignment' },
            { id: 'FD2', name: 'Pose 2', imageUrl: 'https://i.postimg.cc/qB5HDMd1/D2.jpg', category: 'angle', command: 'Side Profile Fashion Walk Stance with Single Hand-in-Pocket, Extended Rear Leg, and Natural Forward Gaze' },
            { id: 'FD3', name: 'Pose 3', imageUrl: 'https://i.postimg.cc/DZwR5Rph/D3.jpg', category: 'angle', command: 'Three-Quarter Back Stance with Over-the-Shoulder Gaze, Single Hand-in-Pocket, and Elongated Rear Leg Line' },
            { id: 'FD4', name: 'Pose 4', imageUrl: 'https://i.postimg.cc/vZwjC423/D4.jpg', category: 'action', command: 'Front-Facing Crossed-Arm Power Stance with Centered Weight, Straight Leg Alignment, and Direct Gaze' },
            { id: 'FD5', name: 'Pose 5', imageUrl: 'https://i.postimg.cc/RCk4VVbN/D5.jpg', category: 'action', command: 'Three-Quarter Forward Standing Lean with Backward Stool Support, Single Hand Resting on Prop, Extended Front Leg Stance, and Confident Chin-Up Gaze' },
            { id: 'FD6', name: 'Pose 6', imageUrl: 'https://i.postimg.cc/Y2WBVBqC/D6.jpg', category: 'action', command: 'Three-Quarter Forward Standing Stance with Both Hands-in-Pockets, Upright Torso Alignment, Subtle Hip Shift, and Confident Forward Gaze' },
            { id: 'FD7', name: 'Pose 7', imageUrl: 'https://i.postimg.cc/CKgRZsPs/D7.jpg', category: 'variation', command: 'Seated Three-Quarter Side Lean on Chair with Elevated Elbow Rest, Relaxed Wrist Drop, and Calm Forward Gaze' },
            { id: 'FD8', name: 'Pose 8', imageUrl: 'https://i.postimg.cc/Ls9HKCQ0/D8.jpg', category: 'action', command: 'Front-Facing Editorial Stance with Single Hand-on-Hip, Opposite Hand Hair Touch, Crossed-Leg Weight Shift, and Elevated Chin Gaze' },
            { id: 'FD9', name: 'Pose 9', imageUrl: 'https://i.postimg.cc/XNGBzqCz/D9.jpg', category: 'angle', command: 'Three-Quarter Back Standing Stance with Over-the-Shoulder Look, Even Leg Placement, and Relaxed Arm Drop' },
            { id: 'FD10', name: 'Pose 10', imageUrl: 'https://i.postimg.cc/VsC5Fhxh/D10.jpg', category: 'angle', command: 'Side Profile Standing Lean Against Wall with Single Hand-in-Pocket, Rear Leg Support, and Soft Over-the-Shoulder Gaze' },
            { id: 'FD11', name: 'Pose 11', imageUrl: 'https://i.postimg.cc/NF6sv3YB/D11.jpg', category: 'action', command: 'Three-Quarter Side Standing Lean with Rear Stool Support, Single Hand-on-Prop, Front Leg Extension, and Elevated Chin Gaze' },
            { id: 'FD12', name: 'Pose 12', imageUrl: 'https://i.postimg.cc/FHR4TdYB/D12.jpg', category: 'angle', command: 'Clean Side Profile Standing Pose with Hand-in-Pocket, Neutral Weight Balance, and Direct Camera Gaze' },
            { id: 'FD13', name: 'Pose 13', imageUrl: 'https://i.postimg.cc/jSCpzp9J/D13.jpg', category: 'variation', command: 'Seated Three-Quarter Side Profile on Chair with Extended Leg Line, One Hand Resting on Hip, Relaxed Shoulder Drop, and Downward Gaze' },
            { id: 'FD14', name: 'Pose 14', imageUrl: 'https://i.postimg.cc/qMDYMm75/D14.jpg', category: 'variation', command: 'Seated Three-Quarter Side Profile on High Stool with Both Hands-in-Pockets, Upright Torso, Extended Leg Line, and Forward Gaze' },
            { id: 'FD15', name: 'Pose 15', imageUrl: 'https://i.postimg.cc/nrcRn7fs/D15.jpg', category: 'action', command: 'Front-Facing Fashion Stance with Single Hand-on-Hip, Opposite Hand Hair Touch, Soft Knee Bend, and Downward Gaze' },
            { id: 'FD16', name: 'Pose 16', imageUrl: 'https://i.postimg.cc/s2YwSK3k/D16.jpg', category: 'angle', command: 'Three-Quarter Back Profile Standing Stance with Both Hands-in-Pockets, Hip Shift, and Over-the-Shoulder Gaze' },
            { id: 'FD17', name: 'Pose 17', imageUrl: 'https://i.postimg.cc/h4yM9Xq8/D17.jpg', category: 'variation', command: 'Front-Facing Seated Chair Pose with Relaxed Lean, Single Hand Resting on Thigh, Crossed Ankles, and Direct Gaze' },
            { id: 'FD18', name: 'Pose 18', imageUrl: 'https://i.postimg.cc/GhTPGzQg/D18.jpg', category: 'action', command: 'Front-Facing Editorial Standing Stance with Single Hand-on-Hip, Straight Leg Alignment, and Direct Camera Gaze' },
            { id: 'FD19', name: 'Pose 19', imageUrl: 'https://i.postimg.cc/x1SmHQq1/D19.jpg', category: 'action', command: 'Three-Quarter Side Standing Lean on High Stool with Extended Back Arch, Single Arm Support, Sunglasses Styling, and Relaxed Leg Line' },
            { id: 'FD20', name: 'Pose 20', imageUrl: 'https://i.postimg.cc/rF4ZG5CP/D20.jpg', category: 'angle', command: 'Clean Side-Profile Standing Pose with Hand-in-Pocket, Neutral Spine, and Forward Gaze' },
            { id: 'FD21', name: 'Pose 21', imageUrl: 'https://i.postimg.cc/Pq5M7DYj/D21.jpg', category: 'variation', command: 'Seated Three-Quarter Side Pose on Chair with Relaxed Back Lean, Single Arm Draped Over Backrest, Extended Leg Line, and Downward Gaze' },
            { id: 'FD22', name: 'Pose 22', imageUrl: 'https://i.postimg.cc/dtFrXdKY/D22.jpg', category: 'variation', command: 'Seated Floor-Level Three-Quarter Front Pose with One Knee Raised, Single Arm Ground Support, Relaxed Shoulder Line, and Direct Camera Gaze' },
            { id: 'FD23', name: 'Pose 23', imageUrl: 'https://i.postimg.cc/DZqmdj0G/D23.jpg', category: 'action', command: 'Full-Length Front-Facing Stance with Single Hand-in-Pocket, Relaxed Arm Drop, and Subtle Hip Shift' },
        ]
    },
    {
        id: 'F_E_new',
        gender: 'Female',
        label: 'Model 5',
        fullBodyUrl: 'https://i.postimg.cc/0QJy5t7g/E-main.jpg',
        closeUpUrl: 'https://i.postimg.cc/26vCN1NH/E-main-closeup.jpg',
        poses: [
            { id: 'FE1', name: 'Pose 1', imageUrl: 'https://i.postimg.cc/0NKs7zj5/E1.jpg', category: 'angle', command: 'Three-Quarter Back Stance with Over-the-Shoulder Look, Single Hand-in-Pocket, and Elongated Rear Leg Line' },
            { id: 'FE2', name: 'Pose 2', imageUrl: 'https://i.postimg.cc/rw36yqjq/E2.jpg', category: 'action', command: 'Front-Facing Power Stance with Arms Crossed, Narrow Leg Cross, and Direct Camera Gaze' },
            { id: 'FE3', name: 'Pose 3', imageUrl: 'https://i.postimg.cc/4yBMDGnk/E3.jpg', category: 'angle', command: 'Side Profile Wall Lean with Single Hand-in-Pocket, Soft Knee Bend, and Relaxed Smiling Gaze' },
            { id: 'FE4', name: 'Pose 4', imageUrl: 'https://i.postimg.cc/sfwNDVfp/E4.jpg', category: 'angle', command: 'Three-Quarter Back Power Stance with Hand-on-Hip Placement, Over-the-Shoulder Gaze, and Strong Rear Leg Extension' },
            { id: 'FE5', name: 'Pose 5', imageUrl: 'https://i.postimg.cc/PxK2x4HM/E5.jpg', category: 'variation', command: 'Seated High-Stool Three-Quarter Lean with Single Hand-in-Pocket, Forward Leg Extension, and Upright Editorial Posture' },
            { id: 'FE6', name: 'Pose 6', imageUrl: 'https://i.postimg.cc/zXy0zKcD/E6.jpg', category: 'angle', command: 'Back-Facing Power Stance with Over-the-Shoulder Turn' },
            { id: 'FE7', name: 'Pose 7', imageUrl: 'https://i.postimg.cc/QtNJRT7s/E7.jpg', category: 'variation', command: 'Floor-Seated Reclining Power Pose with One-Knee Raised, Rear Arm Support, and Forward-Facing Gaze' },
            { id: 'FE8', name: 'Pose 8', imageUrl: 'https://i.postimg.cc/XYMcnh5t/E8.jpg', category: 'action', command: 'Front-Facing Power Stance with Dual Hands-in-Pockets and Balanced Weight Distribution' },
            { id: 'FE9', name: 'Pose 9', imageUrl: 'https://i.postimg.cc/wxZDkPw8/E9.jpg', category: 'variation', command: 'Seated Power Lean with One-Arm Chair Support and Extended-Leg Authority Pose' },
            { id: 'FE10', name: 'Pose 10', imageUrl: 'https://i.postimg.cc/FRqkDdgT/E10.jpg', category: 'action', command: 'Standing Cross-Leg Lean with Single-Hand Stool Support and Relaxed Power Alignment' },
        ]
    },
    {
        id: 'F_F_new',
        gender: 'Female',
        label: 'Model 6',
        fullBodyUrl: 'https://i.postimg.cc/2yxRCJ8f/F-main.jpg',
        closeUpUrl: 'https://i.postimg.cc/MGBLW4d9/F-main-closup.jpg',
        poses: [
            { id: 'FF1', name: 'Pose 1', imageUrl: 'https://i.postimg.cc/3RnF7F5X/F1.jpg', category: 'angle', command: 'Three-Quarter Side Profile Stance with Over-the-Shoulder Gaze, Both Hands-in-Pockets, and Confident Weight Shift' },
            { id: 'FF2', name: 'Pose 2', imageUrl: 'https://i.postimg.cc/prmzvNBN/F2.jpg', category: 'action', command: 'Front-Facing Neutral Stance with Downward Gaze, Relaxed Arm Drop, and Even Weight Distribution' },
            { id: 'FF3', name: 'Pose 3', imageUrl: 'https://i.postimg.cc/ZqjdyY7b/F3.jpg', category: 'angle', command: 'Three-Quarter Back Profile Stance with Both Hands-on-Hips, Over-the-Shoulder Gaze, and Confident Weight Shift' },
            { id: 'FF4', name: 'Pose 4', imageUrl: 'https://i.postimg.cc/L4JxRG5h/F4.jpg', category: 'action', command: 'Front-Facing Crossed-Arm Stance with Centered Gaze and Subtle Leg Cross Weight Shift' },
            { id: 'FF5', name: 'Pose 5', imageUrl: 'https://i.postimg.cc/d0Q9fxgh/F5.jpg', category: 'action', command: 'Front-Facing Relaxed Stance with Light Jacket Hold, Centered Gaze, and Even Weight Distribution' },
            { id: 'FF6', name: 'Pose 6', imageUrl: 'https://i.postimg.cc/d3CRdPZ6/F6.jpg', category: 'variation', command: 'Seated Floor Recline with Side Support Arm, Bent Front Leg, and Relaxed Three-Quarter Gaze' },
            { id: 'FF7', name: 'Pose 7', imageUrl: 'https://i.postimg.cc/7Z93SNhW/F7.jpg', category: 'angle', command: 'Side Profile Wall Lean with Single Hand-in-Pocket, Soft Knee Bend, and Relaxed Smile' },
            { id: 'FF8', name: 'Pose 8', imageUrl: 'https://i.postimg.cc/gJX3FFsJ/F8.jpg', category: 'action', command: 'Front-Facing Relaxed Stand with Both Hands-in-Pockets, Soft Leg Cross, and Neutral Editorial Gaze' },
            { id: 'FF9', name: 'Pose 9', imageUrl: 'https://i.postimg.cc/pXtz7SFn/F9.jpg', category: 'action', command: 'Front-Facing Relaxed Stance with Hands Placed Behind Hips, Crossed-Leg Weight Shift, and Natural Upright Posture' },
            { id: 'FF10', name: 'Pose 10', imageUrl: 'https://i.postimg.cc/N0VrxCts/F10.jpg', category: 'variation', command: 'Seated Three-Quarter Forward Orientation on Chair with Relaxed Arm Drape, Single Knee Angle, and Confident Upright Torso' },
            { id: 'FF11', name: 'Pose 11', imageUrl: 'https://i.postimg.cc/9fvr94PC/F11.jpg', category: 'action', command: 'Three-Quarter Forward Stance with Side Lean on Stool, Single Hand Resting on Prop, Crossed-Leg Weight Shift, and Sunglass Styling' },
            { id: 'FF12', name: 'Pose 12', imageUrl: 'https://i.postimg.cc/SRmQLcJw/F12.jpg', category: 'variation', command: 'Seated Side-Profile Chair Lean with Relaxed Arm Drop, Downward Gaze, and Extended Leg Alignment' },
            { id: 'FF13', name: 'Pose 13', imageUrl: 'https://i.postimg.cc/k5rmFWHQ/F13.jpg', category: 'angle', command: 'Full Side-Profile Standing Stance with Single Hand-in-Pocket, Neutral Weight Distribution, and Forward Gaze' },
            { id: 'FF14', name: 'Pose 14', imageUrl: 'https://i.postimg.cc/5yGv2x9d/F14.jpg', category: 'variation', command: 'Seated Side-Leg Fold Pose with Three-Quarter Forward Torso, Single Arm Floor Support, Relaxed Thigh Rest Hand, and Direct Gaze' },
        ]
    }
];

export const ALL_MODELS: Model[] = [...MALE_MODELS, ...FEMALE_MODELS];