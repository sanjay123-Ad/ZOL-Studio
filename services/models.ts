export type PoseCategory = 'action' | 'angle' | 'variation';

export interface Pose {
  id: string; // e.g., 'A1'
  name: string;
  imageUrl: string;
  category: PoseCategory;
  command: string;
  defaultView: 'front' | 'back';
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
            { id: 'A1', name: 'Pose 1', imageUrl: 'https://i.postimg.cc/ZqqL2rJJ/A1.jpg', category: 'action', command: 'Front-Facing Relaxed Stance with Single Hand-in-Pocket', defaultView: 'front' },
            { id: 'A2', name: 'Pose 2', imageUrl: 'https://i.postimg.cc/VsH5WnVx/A2.jpg', category: 'angle', command: 'Three-Quarter Side Profile with Single Hand-in-Pocket and Head Turn', defaultView: 'front' },
            { id: 'A3', name: 'Pose 3', imageUrl: 'https://i.postimg.cc/VkX6wTkk/A3.jpg', category: 'angle', command: 'Side Profile Relaxed Stance with Hands-in-Pockets', defaultView: 'front' },
            { id: 'A4', name: 'Pose 4', imageUrl: 'https://i.postimg.cc/ZR5Kr5Ft/A4.jpg', category: 'variation', command: 'Seated Casual Lean with Bent Knee and Relaxed Arm Placement', defaultView: 'front' },
            { id: 'A5', name: 'Pose 5', imageUrl: 'https://i.postimg.cc/2yPkRFp6/A5.jpg', category: 'angle', command: 'Over-the-Shoulder Look from a Three-Quarter Back Profile', defaultView: 'back' },
            { id: 'A6', name: 'Pose 6', imageUrl: 'https://i.postimg.cc/zGYzxjSx/A6.jpg', category: 'action', command: 'Walking or Striding Stance with Natural Arm Swing', defaultView: 'front' },
            { id: 'A7', name: 'Pose 7', imageUrl: 'https://i.postimg.cc/rpQqFLXL/A7.jpg', category: 'action', command: 'Standing Lean on Prop with Single Hand-in-Pocket and Head Turn', defaultView: 'front' },
            { id: 'A8', name: 'Pose 8', imageUrl: 'https://i.postimg.cc/QNWVSHZC/A8.jpg', category: 'action', command: 'Front-Facing Wall Lean with Single Hand-in-Pocket and Neutral Gaze', defaultView: 'front' }
        ]
    },
    {
        id: 'M_B',
        gender: 'Male',
        label: 'Model 2',
        fullBodyUrl: 'https://i.postimg.cc/63q6RXgM/B-main.jpg',
        closeUpUrl: 'https://i.postimg.cc/P5dCxBXK/B-main-closeup.jpg',
        poses: [
            { id: 'B1', name: 'Pose 1', imageUrl: 'https://i.postimg.cc/T3kRT6vV/B1.jpg', category: 'action', command: 'Front-Facing Relaxed Stance with Hands-in-Pockets and Head Turn', defaultView: 'front' },
            { id: 'B2', name: 'Pose 2', imageUrl: 'https://i.postimg.cc/4dcZvH7r/B2.jpg', category: 'angle', command: 'Full Back Stance with Over-the-Shoulder Head Turn', defaultView: 'back' },
            { id: 'B3', name: 'Pose 3', imageUrl: 'https://i.postimg.cc/R0kx0Cs6/B3.jpg', category: 'angle', command: 'Three-Quarter Front Stance with Single Hand-in-Pocket and Head Turn', defaultView: 'front' },
            { id: 'B4', name: 'Pose 4', imageUrl: 'https://i.postimg.cc/dt5MyjN3/B4.jpg', category: 'action', command: 'Front-Facing Relaxed Stance with Single Hand-in-Pocket and Neutral Gaze', defaultView: 'front' },
            { id: 'B5', name: 'Pose 5', imageUrl: 'https://i.postimg.cc/66hgkhXj/B5.jpg', category: 'angle', command: 'Three-Quarter Front Stance with Single Hand-in-Pocket and Side Gaze', defaultView: 'front' },
            { id: 'B6', name: 'Pose 6', imageUrl: 'https://i.postimg.cc/25vX2QGx/B6.jpg', category: 'action', command: 'Full-Length Front-Facing Stance with Single Hand-in-Pocket and Neutral Gaze', defaultView: 'front' },
            { id: 'B7', name: 'Pose 7', imageUrl: 'https://i.postimg.cc/CKycBZ0z/B7.jpg', category: 'variation', command: 'Seated Stool Lean with Single Hand-in-Pocket and Relaxed Upper Body', defaultView: 'front' },
            { id: 'B8', name: 'Pose 8', imageUrl: 'https://i.postimg.cc/3R8Cmmcv/B8.jpg', category: 'action', command: 'Wall Lean Three-Quarter Front Stance with Single Hand-in-Pocket and Side Gaze', defaultView: 'front' },
            { id: 'B9', name: 'Pose 9', imageUrl: 'https://i.postimg.cc/zBGKV5yT/B9.jpg', category: 'variation', command: 'Seated Wall Lean with Open Leg Stance and Relaxed Arm Placement', defaultView: 'front' }
        ]
    },
    {
        id: 'M_C',
        gender: 'Male',
        label: 'Model 3',
        fullBodyUrl: 'https://i.postimg.cc/C5VF2qzp/C-main.jpg',
        closeUpUrl: 'https://i.postimg.cc/hjcy34c1/C-main-closeup.jpg',
        poses: [
            { id: 'C1', name: 'Pose 1', imageUrl: 'https://i.postimg.cc/130qB46F/C1.jpg', category: 'action', command: 'Front-Facing Neutral Stance with Single Hand-in-Pocket and Direct Gaze', defaultView: 'front' },
            { id: 'C2', name: 'Pose 2', imageUrl: 'https://i.postimg.cc/J0BykhM7/C2.jpg', category: 'angle', command: 'Three-Quarter Side Profile Stance with Hands-in-Pockets and Neutral Gaze', defaultView: 'front' },
            { id: 'C3', name: 'Pose 3', imageUrl: 'https://i.postimg.cc/W1VnTBwq/C3.jpg', category: 'action', command: 'Front-Facing Neutral Stance with Both Hands-in-Pockets and Side Gaze', defaultView: 'front' },
            { id: 'C4', name: 'Pose 4', imageUrl: 'https://i.postimg.cc/d3d2K67x/C4.jpg', category: 'action', command: 'Side-Profile Wall-Lean with Both Hands-in-Pockets (Relaxed Editorial Stance)', defaultView: 'front' },
            { id: 'C5', name: 'Pose 5', imageUrl: 'https://i.postimg.cc/QdMFQS8j/C5.jpg', category: 'angle', command: 'Back Three-Quarter Turn with Over-the-Shoulder Gaze (Soft Editorial Pose)', defaultView: 'back' },
            { id: 'C6', name: 'Pose 6', imageUrl: 'https://i.postimg.cc/nhMLjz2b/C6.jpg', category: 'action', command: 'Front-Facing Full-Body Stance with Single Hand-in-Pocket (Clean Catalog Pose)', defaultView: 'front' },
            { id: 'C7', name: 'Pose 7', imageUrl: 'https://i.postimg.cc/CMNMcD6p/C7.jpg', category: 'variation', command: 'Seated Cube Lean with Side Gaze and Sunglasses (Relaxed Lifestyle Editorial Pose)', defaultView: 'front' },
            { id: 'C8', name: 'Pose 8', imageUrl: 'https://i.postimg.cc/1X5QkCYP/C8.jpg', category: 'angle', command: 'Standing Back Three-Quarter Turn with Over-the-Shoulder Gaze', defaultView: 'back' }
        ]
    },
    {
        id: 'M_D',
        gender: 'Male',
        label: 'Model 4',
        fullBodyUrl: 'https://i.postimg.cc/L8jSZBfG/D-main.jpg',
        closeUpUrl: 'https://i.postimg.cc/Y24CCFnt/D-main-closeup.jpg',
        poses: [
            { id: 'D1', name: 'Pose 1', imageUrl: 'https://i.postimg.cc/gkx936CQ/D1.jpg', category: 'angle', command: 'Standing Front Three-Quarter Pose with Hands in Pockets and Off-Camera Gaze', defaultView: 'front' },
            { id: 'D2', name: 'Pose 2', imageUrl: 'https://i.postimg.cc/KYNp6GXL/D2.jpg', category: 'angle', command: 'Wall-Lean Three-Quarter Standing Pose with Hands in Pockets (Off-Camera Gaze)', defaultView: 'front' },
            { id: 'D3', name: 'Pose 3', imageUrl: 'https://i.postimg.cc/X7dR20vV/D3.jpg', category: 'variation', command: 'Seated Three-Quarter Editorial Pose on Stool with Off-Camera Gaze', defaultView: 'front' },
            { id: 'D4', name: 'Pose 4', imageUrl: 'https://i.postimg.cc/gkV7VqMR/D4.jpg', category: 'angle', command: 'Standing Back Three-Quarter Pose with Over-the-Shoulder Look', defaultView: 'back' },
            { id: 'D5', name: 'Pose 5', imageUrl: 'https://i.postimg.cc/76S3FXJW/D5.jpg', category: 'action', command: 'Standing Front Three-Quarter Pose with One Hand in Pocket (Direct Camera Gaze)', defaultView: 'front' },
            { id: 'D6', name: 'Pose 6', imageUrl: 'https://i.postimg.cc/qMNRgqQ5/D6.jpg', category: 'action', command: 'Standing Lean-on-Stool Three-Quarter Pose with Direct Camera Gaze', defaultView: 'front' },
            { id: 'D7', name: 'Pose 7', imageUrl: 'https://i.postimg.cc/LXsS7QbG/D7.jpg', category: 'angle', command: 'Standing Full Back View Pose (Neutral Stance)', defaultView: 'back' }
        ]
    },
    {
        id: 'M_E',
        gender: 'Male',
        label: 'Model 5',
        fullBodyUrl: 'https://i.postimg.cc/RVpr6pNW/E-main.jpg',
        closeUpUrl: 'https://i.postimg.cc/nrwdz50G/E-main-closeup.jpg',
        poses: [
            { id: 'E1', name: 'Pose 1', imageUrl: 'https://i.postimg.cc/85gKf7hy/E1.jpg', category: 'action', command: 'Standing Front-Facing Neutral Pose with Both Hands in Pockets', defaultView: 'front' },
            { id: 'E2', name: 'Pose 2', imageUrl: 'https://i.postimg.cc/8CZcjvQk/E2.jpg', category: 'variation', command: 'Seated Lean Pose with One Hand support (3/4 Angle)', defaultView: 'front' },
            { id: 'E3', name: 'Pose 3', imageUrl: 'https://i.postimg.cc/cLZQVPQm/E3.jpg', category: 'angle', command: 'Standing 3/4 Turn – One Hand in Pocket (Relaxed Menswear Pose)', defaultView: 'front' },
            { id: 'E4', name: 'Pose 4', imageUrl: 'https://i.postimg.cc/vZQVPfyd/E4.jpg', category: 'angle', command: 'Standing Back 3/4 Turn – Over-the-Shoulder Look (Menswear Back View Pose)', defaultView: 'back' },
            { id: 'E5', name: 'Pose 5', imageUrl: 'https://i.postimg.cc/wBn3dsCY/E5.jpg', category: 'angle', command: 'Standing Front Three-Quarter View – Hands-in-Pockets Look-Away Pose', defaultView: 'front' },
            { id: 'E6', name: 'Pose 6', imageUrl: 'https://i.postimg.cc/YSLq8CvM/E6.jpg', category: 'action', command: 'Standing Full-Body Front View – Neutral Arms Down Pose', defaultView: 'front' },
            { id: 'E7', name: 'Pose 7', imageUrl: 'https://i.postimg.cc/LsKrK9y4/E7.jpg', category: 'action', command: 'Standing 3/4 Front Lean Pose – One Hand in Pocket', defaultView: 'front' },
            { id: 'E8', name: 'Pose 8', imageUrl: 'https://i.postimg.cc/T34np1zS/E8.jpg', category: 'variation', command: 'Seated 3/4 Front Casual Lean Pose – Sunglasses', defaultView: 'front' }
        ]
    },
    {
        id: 'M_F',
        gender: 'Male',
        label: 'Model 6',
        fullBodyUrl: 'https://i.postimg.cc/V60c93Vc/F-main.jpg',
        closeUpUrl: 'https://i.postimg.cc/SRL3Dq7y/F-main-closeup.jpg',
        poses: [
            { id: 'F1', name: 'Pose 1', imageUrl: 'https://i.postimg.cc/zB1bgg0s/F1.jpg', category: 'action', command: 'Standing Front Half-Body Neutral Pose – One Hand in Pocket', defaultView: 'front' },
            { id: 'F2', name: 'Pose 2', imageUrl: 'https://i.postimg.cc/QCG2sXNT/F2.jpg', category: 'angle', command: 'Standing 3/4 Front Half-Body Pose – One Hand in Pocket', defaultView: 'front' },
            { id: 'F3', name: 'Pose 3', imageUrl: 'https://i.postimg.cc/bvPSGn69/F3.jpg', category: 'action', command: 'Standing 3/4 Front Lean Pose – One Hand in Pocket (Wall Support)', defaultView: 'front' },
            { id: 'F4', name: 'Pose 4', imageUrl: 'https://i.postimg.cc/cCxV6FYv/F4.jpg', category: 'variation', command: 'Seated Casual Wall Lean – One Knee Raised – Arm Rest – Side Gaze', defaultView: 'front' },
            { id: 'F5', name: 'Pose 5', imageUrl: 'https://i.postimg.cc/B6gzW2y4/F5.jpg', category: 'angle', command: 'Standing Back View – Relaxed Neutral Stance – Head Turned Side (Over-Shoulder Look)', defaultView: 'back' },
            { id: 'F6', name: 'Pose 6', imageUrl: 'https://i.postimg.cc/BZ7hxZfM/F6.jpg', category: 'angle', command: 'Standing Three-Quarter Front – Wall Lean – Side Gaze', defaultView: 'front' },
            { id: 'F7', name: 'Pose 7', imageUrl: 'https://i.postimg.cc/pLH1dGtw/F7.jpg', category: 'action', command: 'Standing Three-Quarter Side – Stool Support Lean – Relaxed Gaze', defaultView: 'front' },
            { id: 'F8', name: 'Pose 8', imageUrl: 'https://i.postimg.cc/MGG5cg3h/F8.jpg', category: 'angle', command: 'Standing Back Three-Quarter – Over-the-Shoulder Look – Relaxed Hand-in-Pocket', defaultView: 'back' },
            { id: 'F9', name: 'Pose 9', imageUrl: 'https://i.postimg.cc/rs259Hg2/F9.jpg', category: 'action', command: 'Standing Front-Facing – Neutral Stance – Single Hand-in-Pocket', defaultView: 'front' }
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
            { id: 'FA1', name: 'Pose 1', imageUrl: 'https://i.postimg.cc/fRNPjcRH/A1.jpg', category: 'angle', command: 'Side profile wall lean with a hand in pocket, showcasing the garment\'s silhouette.', defaultView: 'front' },
            { id: 'FA2', name: 'Pose 2', imageUrl: 'https://i.postimg.cc/mk9d7kxq/A2.jpg', category: 'action', command: 'Confident front-facing symmetrical stance, full body view.', defaultView: 'front' },
            { id: 'FA3', name: 'Pose 3', imageUrl: 'https://i.postimg.cc/5NcKbBLt/A3.jpg', category: 'action', command: 'Relaxed three-quarter profile stance with a single hand in the pocket.', defaultView: 'front' },
            { id: 'FA4', name: 'Pose 4', imageUrl: 'https://i.postimg.cc/Pqq222s1/A4.jpg', category: 'variation', command: 'Close-up shot, leaning on a prop with a forward angle, focusing on texture.', defaultView: 'front' },
            { id: 'FA5', name: 'Pose 5', imageUrl: 'https://i.postimg.cc/CM8JPRtJ/A5.jpg', category: 'angle', command: 'Three-quarter back stance with hands on hips or in pockets, showing back details.', defaultView: 'back' },
            { id: 'FA6', name: 'Pose 6', imageUrl: 'https://i.postimg.cc/XYj8YQv8/A6.jpg', category: 'action', command: 'Casual stance with both hands in pockets and a slight forward lean.', defaultView: 'front' },
            { id: 'FA7', name: 'Pose 7', imageUrl: 'https://i.postimg.cc/133GQXCm/A7.jpg', category: 'angle', command: 'Three-quarter back view, looking over the shoulder.', defaultView: 'front' },
            { id: 'FA8', name: 'Pose 8', imageUrl: 'https://i.postimg.cc/j2TfkSwk/A8.jpg', category: 'angle', command: 'Confident three-quarter back stance with a hand on the hip.', defaultView: 'front' },
            { id: 'FA9', name: 'Pose 9', imageUrl: 'https://i.postimg.cc/Cx5q2t1t/A9.jpg', category: 'action', command: 'Three-quarter profile with a hand gently touching the chest or collarbone.', defaultView: 'front' },
            { id: 'FA10', name: 'Pose 10', imageUrl: 'https://i.postimg.cc/FR5k7HZk/A10.jpg', category: 'variation', command: 'Model seated in side profile, leaning with a contemplative downward gaze.', defaultView: 'front' },
            { id: 'FA11', name: 'Pose 11', imageUrl: 'https://i.postimg.cc/8cw7KBVz/A11.jpg', category: 'action', command: 'Standing and leaning on a prop with a distinct hip-shift for a dynamic pose.', defaultView: 'front' },
            { id: 'FA12', name: 'Pose 12', imageUrl: 'https://i.postimg.cc/RVs3wRRk/A12.jpg', category: 'action', command: 'Three-quarter forward view with a hand placed on the chest.', defaultView: 'front' },
            { id: 'FA13', name: 'Pose 13', imageUrl: 'https://i.postimg.cc/sXr130jv/A13.jpg', category: 'action', command: 'Confident front-facing stance with both arms and legs crossed.', defaultView: 'front' },
            { id: 'FA14', name: 'Pose 14', imageUrl: 'https://i.postimg.cc/MKFTnG6h/A14.jpg', category: 'angle', command: 'Full back view with the head turned to the side, showcasing back details.', defaultView: 'back' },
            { id: 'FA15', name: 'Pose 15', imageUrl: 'https://i.postimg.cc/1tsRknBN/A15.jpg', category: 'action', command: 'Front-facing shot with a contemplative gaze and a slight downward head tilt.', defaultView: 'front' },
            { id: 'FA16', name: 'Pose 16', imageUrl: 'https://i.postimg.cc/8P9p1nwV/A16.jpg', category: 'action', command: 'Symmetrical front-facing stance with the model looking down.', defaultView: 'front' },
        ]
    },
    {
        id: 'F_B_new',
        gender: 'Female',
        label: 'Model 2',
        fullBodyUrl: 'https://i.postimg.cc/1t5JPW21/B-main.jpg',
        closeUpUrl: 'https://i.postimg.cc/yNPCvb0B/B-main-closeup.jpg',
        poses: [
            { id: 'FB1', name: 'Pose 1', imageUrl: 'https://i.postimg.cc/15kSxV58/B1.jpg', category: 'action', command: 'A confident, strong front-facing stance, full body.', defaultView: 'front' },
            { id: 'FB2', name: 'Pose 2', imageUrl: 'https://i.postimg.cc/0QyRGpZL/B2.jpg', category: 'action', command: 'A relaxed but powerful front-facing stance.', defaultView: 'front' },
            { id: 'FB3', name: 'Pose 3', imageUrl: 'https://i.postimg.cc/J4kwQ739/B3.jpg', category: 'angle', command: 'Side profile, leaning against a wall with a hand in the pocket.', defaultView: 'front' },
            { id: 'FB4', name: 'Pose 4', imageUrl: 'https://i.postimg.cc/SKmwq60x/B4.jpg', category: 'angle', command: 'Three-quarter back view, looking back over the shoulder.', defaultView: 'back' },
            { id: 'FB5', name: 'Pose 5', imageUrl: 'https://i.postimg.cc/C5n2JJ88/B5.jpg', category: 'action', command: 'An authoritative front-facing stance, full body.', defaultView: 'front' },
            { id: 'FB6', name: 'Pose 6', imageUrl: 'https://i.postimg.cc/SNCSxfPJ/B6.jpg', category: 'angle', command: 'Full back view with the head turned to the side.', defaultView: 'back' },
            { id: 'FB7', name: 'Pose 7', imageUrl: 'https://i.postimg.cc/85xG17Bt/B7.jpg', category: 'action', command: 'Three-quarter forward stance with a hand confidently on the hip.', defaultView: 'front' },
            { id: 'FB8', name: 'Pose 8', imageUrl: 'https://i.postimg.cc/FFJmTxh4/B8.jpg', category: 'action', command: 'Standing and leaning on a prop with both hands in pockets.', defaultView: 'front' },
            { id: 'FB9', name: 'Pose 9', imageUrl: 'https://i.postimg.cc/pLPHXb8G/B9.jpg', category: 'variation', command: 'Seated in profile with a forward lean and a downward gaze.', defaultView: 'front' },
            { id: 'FB10', name: 'Pose 10', imageUrl: 'https://i.postimg.cc/cJHGwRDW/B10.jpg', category: 'action', command: 'A contemplative and thoughtful front-facing stance.', defaultView: 'front' },
            { id: 'FB11', name: 'Pose 11', imageUrl: 'https://i.postimg.cc/L4fKt63x/B11.jpg', category: 'action', command: 'A contemplative front-facing stance with a downward gaze.', defaultView: 'front' },
            { id: 'FB12', name: 'Pose 12', imageUrl: 'https://i.postimg.cc/Mp6CJ0J8/B12.jpg', category: 'action', command: 'A powerful front-facing stance with a hand on the hip.', defaultView: 'front' },
            { id: 'FB13', name: 'Pose 13', imageUrl: 'https://i.postimg.cc/nL5gm6jh/B13.jpg', category: 'angle', command: 'Three-quarter back view, looking back towards the camera.', defaultView: 'back' },
        ]
    },
    {
        id: 'F_C_new',
        gender: 'Female',
        label: 'Model 3',
        fullBodyUrl: 'https://i.postimg.cc/prVNwYY5/C-main.jpg',
        closeUpUrl: 'https://i.postimg.cc/zDx4LhFT/C-main-closeup.jpg',
        poses: [
            { id: 'FC1', name: 'Pose 1', imageUrl: 'https://i.postimg.cc/Twg7Dhvs/C1.jpg', category: 'action', command: 'Symmetrical front-facing stance with hands clasped or folded.', defaultView: 'front' },
            { id: 'FC2', name: 'Pose 2', imageUrl: 'https://i.postimg.cc/yxTLL5dv/C2.jpg', category: 'angle', command: 'Side profile, leaning against a wall with both hands in pockets.', defaultView: 'front' },
            { id: 'FC3', name: 'Pose 3', imageUrl: 'https://i.postimg.cc/Hkn6t6CL/C3.jpg', category: 'action', command: 'Confident front-facing stance with both arms and legs crossed.', defaultView: 'front' },
            { id: 'FC4', name: 'Pose 4', imageUrl: 'https://i.postimg.cc/C1TJSYn8/C4.jpg', category: 'action', command: 'Dynamic striding pose in side profile with hands in pockets.', defaultView: 'front' },
            { id: 'FC5', name: 'Pose 5', imageUrl: 'https://i.postimg.cc/BbJgPggx/C5.jpg', category: 'angle', command: 'Side profile with arms in a contemplative self-embrace.', defaultView: 'front' },
            { id: 'FC6', name: 'Pose 6', imageUrl: 'https://i.postimg.cc/zXX7Jxv4/C6.jpg', category: 'angle', command: 'Three-quarter back view, looking over the shoulder.', defaultView: 'back' },
            { id: 'FC7', name: 'Pose 7', imageUrl: 'https://i.postimg.cc/LsfBy7Qn/C7.jpg', category: 'action', command: 'Confident front-facing stance with arms crossed.', defaultView: 'front' },
            { id: 'FC8', name: 'Pose 8', imageUrl: 'https://i.postimg.cc/nrV4hLFH/C8.jpg', category: 'angle', command: 'Full back view with the head turned to show a profile gaze.', defaultView: 'back' },
            { id: 'FC9', name: 'Pose 9', imageUrl: 'https://i.postimg.cc/T2QjHn0g/C9.jpg', category: 'action', command: 'Three-quarter profile with a hand placed gently on the chest.', defaultView: 'front' },
            { id: 'FC10', name: 'Pose 10', imageUrl: 'https://i.postimg.cc/rFP1qcvC/C10.jpg', category: 'action', command: 'Symmetrical front-facing stance with the model looking down.', defaultView: 'front' },
            { id: 'FC11', name: 'Pose 11', imageUrl: 'https://i.postimg.cc/cJQw7366/C11.jpg', category: 'variation', command: 'Seated in side profile with a downward gaze, leaning on a prop.', defaultView: 'front' },
            { id: 'FC12', name: 'Pose 12', imageUrl: 'https://i.postimg.cc/LXDPwMtp/C12.jpg', category: 'angle', command: 'Side profile, leaning on a prop with a downward gaze.', defaultView: 'front' },
        ]
    },
    {
        id: 'F_D_new',
        gender: 'Female',
        label: 'Model 4',
        fullBodyUrl: 'https://i.postimg.cc/ZKsnchf5/D-main.jpg',
        closeUpUrl: 'https://i.postimg.cc/c4C46bs0/D-main-closeup.jpg',
        poses: [
            { id: 'FD1', name: 'Pose 1', imageUrl: 'https://i.postimg.cc/FzBvjhhq/D1.jpg', category: 'variation', command: 'Seated Three-Quarter Side Pose on Stool with One Hand-in-Pocket, Elongated Leg Line, and Upright Torso Alignment', defaultView: 'front' },
            { id: 'FD2', name: 'Pose 2', imageUrl: 'https://i.postimg.cc/qB5HDMd1/D2.jpg', category: 'angle', command: 'Side Profile Fashion Walk Stance with Single Hand-in-Pocket, Extended Rear Leg, and Natural Forward Gaze', defaultView: 'front' },
            { id: 'FD3', name: 'Pose 3', imageUrl: 'https://i.postimg.cc/DZwR5Rph/D3.jpg', category: 'angle', command: 'Three-Quarter Back Stance with Over-the-Shoulder Gaze, Single Hand-in-Pocket, and Elongated Rear Leg Line', defaultView: 'back' },
            { id: 'FD4', name: 'Pose 4', imageUrl: 'https://i.postimg.cc/vZwjC423/D4.jpg', category: 'action', command: 'Front-Facing Crossed-Arm Power Stance with Centered Weight, Straight Leg Alignment, and Direct Gaze', defaultView: 'front' },
            { id: 'FD5', name: 'Pose 5', imageUrl: 'https://i.postimg.cc/RCk4VVbN/D5.jpg', category: 'action', command: 'Three-Quarter Forward Standing Lean with Backward Stool Support, Single Hand Resting on Prop, Extended Front Leg Stance, and Confident Chin-Up Gaze', defaultView: 'front' },
            { id: 'FD6', name: 'Pose 6', imageUrl: 'https://i.postimg.cc/Y2WBVBqC/D6.jpg', category: 'action', command: 'Three-Quarter Forward Standing Stance with Both Hands-in-Pockets, Upright Torso Alignment, Subtle Hip Shift, and Confident Forward Gaze', defaultView: 'front' },
            { id: 'FD7', name: 'Pose 7', imageUrl: 'https://i.postimg.cc/CKgRZsPs/D7.jpg', category: 'variation', command: 'Seated Three-Quarter Side Lean on Chair with Elevated Elbow Rest, Relaxed Wrist Drop, and Calm Forward Gaze', defaultView: 'front' },
            { id: 'FD8', name: 'Pose 8', imageUrl: 'https://i.postimg.cc/Ls9HKCQ0/D8.jpg', category: 'action', command: 'Front-Facing Editorial Stance with Single Hand-on-Hip, Opposite Hand Hair Touch, Crossed-Leg Weight Shift, and Elevated Chin Gaze', defaultView: 'front' },
            { id: 'FD9', name: 'Pose 9', imageUrl: 'https://i.postimg.cc/XNGBzqCz/D9.jpg', category: 'angle', command: 'Three-Quarter Back Standing Stance with Over-the-Shoulder Look, Even Leg Placement, and Relaxed Arm Drop', defaultView: 'back' },
            { id: 'FD10', name: 'Pose 10', imageUrl: 'https://i.postimg.cc/VsC5Fhxh/D10.jpg', category: 'angle', command: 'Side Profile Standing Lean Against Wall with Single Hand-in-Pocket, Rear Leg Support, and Soft Over-the-Shoulder Gaze', defaultView: 'front' },
            { id: 'FD11', name: 'Pose 11', imageUrl: 'https://i.postimg.cc/NF6sv3YB/D11.jpg', category: 'action', command: 'Three-Quarter Side Standing Lean with Rear Stool Support, Single Hand-on-Prop, Front Leg Extension, and Elevated Chin Gaze', defaultView: 'front' },
            { id: 'FD12', name: 'Pose 12', imageUrl: 'https://i.postimg.cc/FHR4TdYB/D12.jpg', category: 'angle', command: 'Clean Side Profile Standing Pose with Hand-in-Pocket, Neutral Weight Balance, and Direct Camera Gaze', defaultView: 'front' },
            { id: 'FD13', name: 'Pose 13', imageUrl: 'https://i.postimg.cc/jSCpzp9J/D13.jpg', category: 'variation', command: 'Seated Three-Quarter Side Profile on Chair with Extended Leg Line, One Hand Resting on Hip, Relaxed Shoulder Drop, and Downward Gaze', defaultView: 'front' },
            { id: 'FD14', name: 'Pose 14', imageUrl: 'https://i.postimg.cc/qMDYMm75/D14.jpg', category: 'variation', command: 'Seated Three-Quarter Side Profile on High Stool with Both Hands-in-Pockets, Upright Torso, Extended Leg Line, and Forward Gaze', defaultView: 'front' },
            { id: 'FD15', name: 'Pose 15', imageUrl: 'https://i.postimg.cc/nrcRn7fs/D15.jpg', category: 'action', command: 'Front-Facing Fashion Stance with Single Hand-on-Hip, Opposite Hand Hair Touch, Soft Knee Bend, and Downward Gaze', defaultView: 'front' },
            { id: 'FD16', name: 'Pose 16', imageUrl: 'https://i.postimg.cc/s2YwSK3k/D16.jpg', category: 'angle', command: 'Three-Quarter Back Profile Standing Stance with Both Hands-in-Pockets, Hip Shift, and Over-the-Shoulder Gaze', defaultView: 'back' },
            { id: 'FD17', name: 'Pose 17', imageUrl: 'https://i.postimg.cc/h4yM9Xq8/D17.jpg', category: 'variation', command: 'Front-Facing Seated Chair Pose with Relaxed Lean, Single Hand Resting on Thigh, Crossed Ankles, and Direct Gaze', defaultView: 'front' },
            { id: 'FD18', name: 'Pose 18', imageUrl: 'https://i.postimg.cc/GhTPGzQg/D18.jpg', category: 'action', command: 'Front-Facing Editorial Standing Stance with Single Hand-on-Hip, Straight Leg Alignment, and Direct Camera Gaze', defaultView: 'front' },
            { id: 'FD19', name: 'Pose 19', imageUrl: 'https://i.postimg.cc/x1SmHQq1/D19.jpg', category: 'action', command: 'Three-Quarter Side Standing Lean on High Stool with Extended Back Arch, Single Arm Support, Sunglasses Styling, and Relaxed Leg Line', defaultView: 'front' },
            { id: 'FD20', name: 'Pose 20', imageUrl: 'https://i.postimg.cc/rF4ZG5CP/D20.jpg', category: 'angle', command: 'Clean Side-Profile Standing Pose with Hand-in-Pocket, Neutral Spine, and Forward Gaze', defaultView: 'front' },
            { id: 'FD21', name: 'Pose 21', imageUrl: 'https://i.postimg.cc/Pq5M7DYj/D21.jpg', category: 'variation', command: 'Seated Three-Quarter Side Pose on Chair with Relaxed Back Lean, Single Arm Draped Over Backrest, Extended Leg Line, and Downward Gaze', defaultView: 'front' },
            { id: 'FD22', name: 'Pose 22', imageUrl: 'https://i.postimg.cc/dtFrXdKY/D22.jpg', category: 'variation', command: 'Seated Floor-Level Three-Quarter Front Pose with One Knee Raised, Single Arm Ground Support, Relaxed Shoulder Line, and Direct Camera Gaze', defaultView: 'front' },
            { id: 'FD23', name: 'Pose 23', imageUrl: 'https://i.postimg.cc/DZqmdj0G/D23.jpg', category: 'action', command: 'Full-Length Front-Facing Stance with Single Hand-in-Pocket, Relaxed Arm Drop, and Subtle Hip Shift', defaultView: 'front' },
        ]
    },
    {
        id: 'F_E_new',
        gender: 'Female',
        label: 'Model 5',
        fullBodyUrl: 'https://i.postimg.cc/0QJy5t7g/E-main.jpg',
        closeUpUrl: 'https://i.postimg.cc/26vCN1NH/E-main-closeup.jpg',
        poses: [
            { id: 'FE1', name: 'Pose 1', imageUrl: 'https://i.postimg.cc/0NKs7zj5/E1.jpg', category: 'angle', command: 'Three-Quarter Back Stance with Over-the-Shoulder Look, Single Hand-in-Pocket, and Elongated Rear Leg Line', defaultView: 'front' },
            { id: 'FE2', name: 'Pose 2', imageUrl: 'https://i.postimg.cc/rw36yqjq/E2.jpg', category: 'action', command: 'Front-Facing Power Stance with Arms Crossed, Narrow Leg Cross, and Direct Camera Gaze', defaultView: 'front' },
            { id: 'FE3', name: 'Pose 3', imageUrl: 'https://i.postimg.cc/4yBMDGnk/E3.jpg', category: 'angle', command: 'Side Profile Wall Lean with Single Hand-in-Pocket, Soft Knee Bend, and Relaxed Smiling Gaze', defaultView: 'front' },
            { id: 'FE4', name: 'Pose 4', imageUrl: 'https://i.postimg.cc/sfwNDVfp/E4.jpg', category: 'angle', command: 'Three-Quarter Back Power Stance with Hand-on-Hip Placement, Over-the-Shoulder Gaze, and Strong Rear Leg Extension', defaultView: 'front' },
            { id: 'FE5', name: 'Pose 5', imageUrl: 'https://i.postimg.cc/PxK2x4HM/E5.jpg', category: 'variation', command: 'Seated High-Stool Three-Quarter Lean with Single Hand-in-Pocket, Forward Leg Extension, and Upright Editorial Posture', defaultView: 'back' },
            { id: 'FE6', name: 'Pose 6', imageUrl: 'https://i.postimg.cc/zXy0zKcD/E6.jpg', category: 'angle', command: 'Back-Facing Power Stance with Over-the-Shoulder Turn', defaultView: 'front' },
            { id: 'FE7', name: 'Pose 7', imageUrl: 'https://i.postimg.cc/QtNJRT7s/E7.jpg', category: 'variation', command: 'Floor-Seated Reclining Power Pose with One-Knee Raised, Rear Arm Support, and Forward-Facing Gaze', defaultView: 'front' },
            { id: 'FE8', name: 'Pose 8', imageUrl: 'https://i.postimg.cc/XYMcnh5t/E8.jpg', category: 'action', command: 'Front-Facing Power Stance with Dual Hands-in-Pockets and Balanced Weight Distribution', defaultView: 'back' },
            { id: 'FE9', name: 'Pose 9', imageUrl: 'https://i.postimg.cc/wxZDkPw8/E9.jpg', category: 'variation', command: 'Seated Power Lean with One-Arm Chair Support and Extended-Leg Authority Pose', defaultView: 'front' },
            { id: 'FE10', name: 'Pose 10', imageUrl: 'https://i.postimg.cc/FRqkDdgT/E10.jpg', category: 'action', command: 'Standing Cross-Leg Lean with Single-Hand Stool Support and Relaxed Power Alignment', defaultView: 'front' },
        ]
    },
    {
        id: 'F_F_new',
        gender: 'Female',
        label: 'Model 6',
        fullBodyUrl: 'https://i.postimg.cc/2yxRCJ8f/F-main.jpg',
        closeUpUrl: 'https://i.postimg.cc/MGBLW4d9/F-main-closup.jpg',
        poses: [
            { id: 'FF1', name: 'Pose 1', imageUrl: 'https://i.postimg.cc/3RnF7F5X/F1.jpg', category: 'angle', command: 'Three-Quarter Side Profile Stance with Over-the-Shoulder Gaze, Both Hands-in-Pockets, and Confident Weight Shift', defaultView: 'front' },
            { id: 'FF2', name: 'Pose 2', imageUrl: 'https://i.postimg.cc/prmzvNBN/F2.jpg', category: 'action', command: 'Front-Facing Neutral Stance with Downward Gaze, Relaxed Arm Drop, and Even Weight Distribution', defaultView: 'front' },
            { id: 'FF3', name: 'Pose 3', imageUrl: 'https://i.postimg.cc/ZqjdyY7b/F3.jpg', category: 'angle', command: 'Three-Quarter Back Profile Stance with Both Hands-on-Hips, Over-the-Shoulder Gaze, and Confident Weight Shift', defaultView: 'back' },
            { id: 'FF4', name: 'Pose 4', imageUrl: 'https://i.postimg.cc/L4JxRG5h/F4.jpg', category: 'action', command: 'Front-Facing Crossed-Arm Stance with Centered Gaze and Subtle Leg Cross Weight Shift', defaultView: 'front' },
            { id: 'FF5', name: 'Pose 5', imageUrl: 'https://i.postimg.cc/d0Q9fxgh/F5.jpg', category: 'action', command: 'Front-Facing Relaxed Stance with Light Jacket Hold, Centered Gaze, and Even Weight Distribution', defaultView: 'front' },
            { id: 'FF6', name: 'Pose 6', imageUrl: 'https://i.postimg.cc/d3CRdPZ6/F6.jpg', category: 'variation', command: 'Seated Floor Recline with Side Support Arm, Bent Front Leg, and Relaxed Three-Quarter Gaze', defaultView: 'front' },
            { id: 'FF7', name: 'Pose 7', imageUrl: 'https://i.postimg.cc/7Z93SNhW/F7.jpg', category: 'angle', command: 'Side Profile Wall Lean with Single Hand-in-Pocket, Soft Knee Bend, and Relaxed Smile', defaultView: 'front' },
            { id: 'FF8', name: 'Pose 8', imageUrl: 'https://i.postimg.cc/gJX3FFsJ/F8.jpg', category: 'action', command: 'Front-Facing Relaxed Stand with Both Hands-in-Pockets, Soft Leg Cross, and Neutral Editorial Gaze', defaultView: 'front' },
            { id: 'FF9', name: 'Pose 9', imageUrl: 'https://i.postimg.cc/pXtz7SFn/F9.jpg', category: 'action', command: 'Front-Facing Relaxed Stance with Hands Placed Behind Hips, Crossed-Leg Weight Shift, and Natural Upright Posture', defaultView: 'front' },
            { id: 'FF10', name: 'Pose 10', imageUrl: 'https://i.postimg.cc/N0VrxCts/F10.jpg', category: 'variation', command: 'Seated Three-Quarter Forward Orientation on Chair with Relaxed Arm Drape, Single Knee Angle, and Confident Upright Torso', defaultView: 'front' },
            { id: 'FF11', name: 'Pose 11', imageUrl: 'https://i.postimg.cc/9fvr94PC/F11.jpg', category: 'action', command: 'Three-Quarter Forward Stance with Side Lean on Stool, Single Hand Resting on Prop, Crossed-Leg Weight Shift, and Sunglass Styling', defaultView: 'front' },
            { id: 'FF12', name: 'Pose 12', imageUrl: 'https://i.postimg.cc/SRmQLcJw/F12.jpg', category: 'variation', command: 'Seated Side-Profile Chair Lean with Relaxed Arm Drop, Downward Gaze, and Extended Leg Alignment', defaultView: 'front' },
            { id: 'FF13', name: 'Pose 13', imageUrl: 'https://i.postimg.cc/k5rmFWHQ/F13.jpg', category: 'angle', command: 'Full Side-Profile Standing Stance with Single Hand-in-Pocket, Neutral Weight Distribution, and Forward Gaze', defaultView: 'front' },
            { id: 'FF14', name: 'Pose 14', imageUrl: 'https://i.postimg.cc/5yGv2x9d/F14.jpg', category: 'variation', command: 'Seated Side-Leg Fold Pose with Three-Quarter Forward Torso, Single Arm Floor Support, Relaxed Thigh Rest Hand, and Direct Gaze', defaultView: 'front' },
        ]
    }
];

export const ALL_MODELS: Model[] = [...MALE_MODELS, ...FEMALE_MODELS];