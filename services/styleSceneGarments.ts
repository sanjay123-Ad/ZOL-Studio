// Garment Category Data for Style Scene Feature

export interface GarmentCategory {
  id: string;
  name: string;
  description?: string;
  subcategories: GarmentSubcategory[];
}

export interface GarmentSubcategory {
  id: string;
  name: string;
  description?: string;
}

// Men's Lower Garment Categories
export const MEN_LOWER_CATEGORIES: GarmentCategory[] = [
  {
    id: 'pants-trousers',
    name: 'Pants & Trousers',
    description: 'Premium casual-to-formal category',
    subcategories: [
      { id: 'super-flex-pants', name: 'Super Flex Pants', description: 'High-stretch, formal-looking pants that feel like joggers. Includes Gurkha Pants (vintage military style with side buckles)' },
      { id: 'korean-pants', name: 'Korean Pants', description: 'Wide-leg, pleated trousers with a clean aesthetic' },
      { id: 'cargo-pants', name: 'Cargo Pants', description: 'Multi-pocket utility pants available in Straight Fit, Slim Fit, and Textured fabrics' },
      { id: 'parachute-pants', name: 'Parachute Pants', description: 'Very baggy, lightweight pants with adjustable drawstring ankles' },
      { id: 'chinos', name: 'Chinos', description: 'Classic cotton twill pants for a smart-casual look' },
      { id: 'cotton-linen-pants', name: 'Cotton Linen Pants', description: 'Breathable, relaxed pants specifically for summer or beach wear' },
      { id: 'fusion-pants', name: 'Fusion Pants', description: 'A mix of ethnic and western silhouettes' },
    ],
  },
  {
    id: 'jeans',
    name: 'Jeans (Denim)',
    description: 'Categorized by fit and utility level',
    subcategories: [
      { id: 'baggy-fit-denim', name: 'Baggy Fit Denim', description: 'Extremely loose and comfortable (top-selling denim category)' },
      { id: 'straight-fit-denim', name: 'Straight Fit Denim', description: 'Uniform width from hip to ankle' },
      { id: 'cargo-jeans', name: 'Cargo Jeans', description: 'Denim fabric combined with utility cargo pockets' },
      { id: 'pleated-denim', name: 'Pleated Denim', description: 'Unique style featuring front pleats similar to formal trousers' },
      { id: 'pull-on-denim', name: 'Pull-On Denim', description: 'Denim pants with an elastic waistband instead of a button/zip fly' },
      { id: 'carpenter-denim', name: 'Carpenter Denim', description: 'Includes side loops and extra tool pockets' },
    ],
  },
  {
    id: 'joggers',
    name: 'Joggers',
    description: 'Core of streetwear and merchandise collection',
    subcategories: [
      { id: 'korean-joggers', name: 'Korean Joggers', description: 'Clean, minimalist joggers with a tapered but relaxed fit' },
      { id: 'oversized-joggers', name: 'Oversized Joggers', description: 'Extra baggy sweatpants' },
      { id: 'cargo-joggers', name: 'Cargo Joggers', description: 'Sweatpants with side pockets' },
      { id: 'denim-joggers', name: 'Denim Joggers', description: 'Soft jogger comfort with a denim look' },
      { id: 'enduro-joggers', name: 'Enduro Joggers', description: 'Part of TSS Active, made of sweat-wicking performance fabric for the gym' },
    ],
  },
  {
    id: 'shorts',
    name: 'Shorts',
    description: 'Designed for both casual outings and lounging at home',
    subcategories: [
      { id: 'boxer-shorts', name: 'Boxer Shorts', description: '100% cotton, mostly printed with official merch (Disney, Harry Potter)' },
      { id: 'bermuda-shorts', name: 'Bermuda Shorts', description: 'Knee-length casual shorts in cotton or twill' },
      { id: 'cargo-shorts', name: 'Cargo Shorts', description: 'Rugged shorts with utility pockets' },
      { id: 'swimwear-shorts', name: 'Swimwear Shorts', description: 'Water-resistant, quick-dry shorts for the pool or beach' },
      { id: 'denim-shorts', name: 'Denim Shorts', description: 'Traditional denim cut-offs' },
      { id: 'chino-linen-shorts', name: 'Chino & Linen Shorts', description: 'Dressier shorts for outings' },
    ],
  },
  {
    id: 'pajamas-loungewear',
    name: 'Pajamas & Loungewear',
    description: 'Full-length, loose cotton pants for sleeping or home-wear',
    subcategories: [
      { id: 'pajamas', name: 'Pajamas', description: 'Full-length, loose cotton pants specifically for sleeping or home-wear, usually featuring heavy graphic prints' },
    ],
  },
];

// Men's Upper Garment Categories
export const MEN_UPPER_CATEGORIES: GarmentCategory[] = [
  {
    id: 't-shirts',
    name: 'T-Shirts (The Core Collection)',
    description: 'Their signature fit with dropped shoulders and baggy silhouette',
    subcategories: [
      { id: 'oversized-t-shirts', name: 'Oversized T-Shirts', description: 'Their signature fit with dropped shoulders and a baggy silhouette' },
      { id: 'super-oversized-t-shirts', name: 'Super Oversized T-Shirts', description: 'An even larger, ultra-baggy fit for a high-street look' },
      { id: 'relaxed-fit-t-shirts', name: 'Relaxed Fit T-Shirts', description: 'A slightly loose but more standard shape' },
      { id: 'supima-t-shirts', name: 'Supima T-Shirts', description: 'Premium, high-quality cotton tees with a smoother finish and better durability' },
      { id: 'full-sleeve-t-shirts', name: 'Full Sleeve T-Shirts', description: 'Standard and oversized versions of long-sleeve tees' },
      { id: 'henley-t-shirts', name: 'Henley T-Shirts', description: 'Features a buttoned placket at the neckline (available in full and half sleeves)' },
    ],
  },
  {
    id: 'shirts-shackets',
    name: 'Shirts & Shackets',
    description: 'Button-downs and shirt-jacket hybrids',
    subcategories: [
      { id: 'holiday-boxy-shirts', name: 'Holiday / Boxy Shirts', description: 'Breezy, short-sleeved shirts with vibrant prints (often in Rayon or Cotton)' },
      { id: 'oversized-shirts', name: 'Oversized Shirts', description: 'Large-fit button-downs, often worn open over a t-shirt' },
      { id: 'textured-corduroy-shirts', name: 'Textured & Corduroy Shirts', description: 'Focuses on fabric feel rather than just prints' },
      { id: 'cotton-linen-shirts', name: 'Cotton Linen Shirts', description: 'Breathable, lightweight shirts for summer/travel' },
      { id: 'shackets', name: 'Shackets', description: 'A heavy Shirt-Jacket hybrid, often in flannel or denim' },
      { id: 'kimono-shirts', name: 'Kimono Shirts', description: 'Open-front, wrap-style shirts inspired by Japanese fashion' },
    ],
  },
  {
    id: 'polo-t-shirts',
    name: 'Polo T-Shirts',
    description: 'Collared shirts with various styles',
    subcategories: [
      { id: 'oversized-polos', name: 'Oversized Polos', description: 'A modern, baggy take on the classic collared shirt' },
      { id: 'rugby-polos', name: 'Rugby Polos', description: 'Thick, striped, or color-blocked shirts with a heavy collar' },
      { id: 'zipper-polos', name: 'Zipper Polos', description: 'Features a zip instead of buttons at the neck' },
      { id: 'mandarin-polos', name: 'Mandarin Polos', description: 'Features a short, stand-up collar (no lapels)' },
    ],
  },
  {
    id: 'sweatshirts-hoodies',
    name: 'Sweatshirts & Hoodies',
    description: 'Comfortable pullovers and hooded garments',
    subcategories: [
      { id: 'oversized-hoodies', name: 'Oversized Hoodies', description: 'Heavy-duty, baggy pullovers with hoods' },
      { id: 'oversized-sweatshirts', name: 'Oversized Sweatshirts / Pullovers', description: 'Crew-neck sweaters without a hood' },
      { id: 'zipper-hoodies', name: 'Zipper Hoodies', description: 'Full-zip front hoodies for easy layering' },
      { id: 'korean-hoodies', name: 'Korean Hoodies', description: 'Minimalist, clean-aesthetic hoodies with specific structural seams' },
    ],
  },
  {
    id: 'jackets-outerwear',
    name: 'Jackets & Outerwear',
    description: 'Outer layers for various occasions',
    subcategories: [
      { id: 'varsity-jackets', name: 'Varsity Jackets', description: 'Classic American letterman style with contrast sleeves and patches' },
      { id: 'bomber-jackets', name: 'Bomber Jackets', description: 'Short, elastic-waist jackets with a military heritage' },
      { id: 'denim-jackets', name: 'Denim Jackets', description: 'Heavyweight denim truckers, often featuring back-prints of characters' },
      { id: 'biker-jackets', name: 'Biker Jackets', description: 'Edgy, structured jackets usually in faux leather or heavy cotton' },
      { id: 'puffer-jackets', name: 'Puffer Jackets', description: 'Insulated, quilted jackets for peak winter' },
    ],
  },
  {
    id: 'knitwear',
    name: 'Knitwear (Sweaters)',
    description: 'Knitted garments for warmth and style',
    subcategories: [
      { id: 'oversized-pullovers', name: 'Oversized Pullovers', description: 'Knitted sweaters with a loose fit' },
      { id: 'jacquard-sweaters', name: 'Jacquard Sweaters', description: 'Featuring complex, woven patterns and designs' },
    ],
  },
  {
    id: 'performance-activewear',
    name: 'Performance & Activewear (TSS Active)',
    description: 'Sporty and athletic garments',
    subcategories: [
      { id: 'oversized-jerseys', name: 'Oversized Jerseys', description: 'Sporty, mesh-style tops (like basketball or football jerseys)' },
      { id: 'training-tees', name: 'Training Tees', description: 'Sweat-wicking, technical shirts for the gym' },
    ],
  },
];

// Women's Lower Garment Categories
export const WOMEN_LOWER_CATEGORIES: GarmentCategory[] = [
  {
    id: 'pants-trousers',
    name: 'Pants & Trousers',
    description: 'Most diverse category, focusing on trendy silhouettes',
    subcategories: [
      { id: 'korean-pants', name: 'Korean Pants', description: 'Wide-leg trousers with front pleats and a high-waist fit' },
      { id: 'parachute-pants', name: 'Parachute Pants', description: 'Lightweight, voluminous utility pants with drawstring hems' },
      { id: 'cargo-pants', name: 'Cargo Pants', description: 'Traditional and oversized utility trousers with 3D pockets' },
      { id: 'nomad-pants', name: 'Nomad Pants', description: 'Bohemian-style printed or textured relaxed trousers' },
      { id: 'barrel-fit-pants', name: 'Barrel-Fit Pants', description: 'A distinct curved-leg shape that is wide at the mid-leg and tapers at the ankle' },
      { id: 'utility-pants', name: 'Utility Pants', description: 'Heavy-duty, workwear-inspired pants (often in solid colors like Olive or Taupe)' },
      { id: 'pull-on-pants', name: 'Pull-On Pants', description: 'Elastic-waist trousers in straight or relaxed fits' },
      { id: 'corduroy-pants', name: 'Corduroy Pants', description: 'Retro, textured fabric pants' },
      { id: 'cotton-linen-pants', name: 'Cotton Linen Pants', description: 'Lightweight, breathable trousers for summer/resort wear' },
    ],
  },
  {
    id: 'jeans',
    name: 'Jeans (Denim)',
    description: 'Categorized primarily by fit and functional details',
    subcategories: [
      { id: 'wide-leg-denim', name: 'Wide-Leg Denim', description: 'Their classic flowy jeans' },
      { id: 'baggy-fit-jeans', name: 'Baggy Fit Jeans', description: 'Ultra-loose, oversized denim' },
      { id: 'cargo-jeans', name: 'Cargo Jeans', description: 'Denim fabric with utility side pockets' },
      { id: 'barrel-fit-denim', name: 'Barrel-Fit Denim', description: 'The trendy curved horseshoe silhouette in denim' },
      { id: 'straight-fit-jeans', name: 'Straight-Fit Jeans', description: 'Standard uniform width from top to bottom' },
      { id: 'carpenter-denims', name: 'Carpenter Denims', description: 'Feature utility loops and hammer pockets' },
      { id: 'pull-on-denim', name: 'Pull-On Denim', description: 'Denim-look pants with a comfortable elastic waistband' },
    ],
  },
  {
    id: 'joggers',
    name: 'Joggers',
    description: 'Focuses on comfort and pop-culture themes',
    subcategories: [
      { id: 'flared-joggers', name: 'Flared Joggers', description: 'A modern take with a wide, bell-bottom opening' },
      { id: 'baggy-fit-joggers', name: 'Baggy-Fit/Easy Joggers', description: 'Standard oversized sweatpants with cuffed ankles' },
      { id: 'cargo-joggers', name: 'Cargo Joggers', description: 'Sweatpants with additional utility pockets' },
      { id: 'woven-joggers', name: 'Woven Joggers', description: 'Made from structured fabric rather than fleece/cotton' },
      { id: 'denim-joggers', name: 'Denim Joggers', description: 'A hybrid of denim look with jogger comfort' },
    ],
  },
  {
    id: 'skirts-skorts',
    name: 'Skirts & Skorts',
    description: 'Their signature hybrid styles',
    subcategories: [
      { id: 'skorts', name: 'Skorts', description: 'Their signature hybrid (looks like a skirt, functions like shorts)' },
      { id: 'denim-skorts', name: 'Denim Skorts', description: 'Denim front with hidden shorts inside' },
      { id: 'denim-skirts', name: 'Denim Skirts', description: 'Standard short or midi denim skirts' },
      { id: 'mini-skirts', name: 'Mini Skirts', description: 'Including the pleated and twill styles' },
      { id: 'cotton-linen-skorts', name: 'Cotton Linen Skorts', description: 'Breathable, dressier versions of the skort' },
    ],
  },
  {
    id: 'shorts-loungewear',
    name: 'Shorts & Loungewear',
    description: 'Comfortable shorts for casual wear',
    subcategories: [
      { id: 'boxer-shorts', name: 'Boxer Shorts', description: 'Their #1 loungewear item, usually printed with official merch (Disney, Marvel, etc.)' },
      { id: 'denim-shorts', name: 'Denim Shorts', description: 'Traditional cut-offs and high-waist denim shorts' },
      { id: 'bermuda-shorts', name: 'Bermuda Shorts', description: 'Longer, knee-length denim or cotton shorts' },
      { id: 'high-waist-shorts', name: 'High-Waist Shorts', description: 'Specifically designed with a long rise' },
    ],
  },
];

// Women's Upper Garment Categories
export const WOMEN_UPPER_CATEGORIES: GarmentCategory[] = [
  {
    id: 't-shirts',
    name: 'The T-Shirt Collection',
    description: 'Core of their brand, categorized by fit',
    subcategories: [
      { id: 'oversized-t-shirts', name: 'Oversized T-Shirts', description: 'Their most popular fit; very loose and baggy with dropped shoulders' },
      { id: 'relaxed-fit-t-shirts', name: 'Relaxed Fit T-Shirts', description: 'Slightly loose but more structured than oversized' },
      { id: 'boyfriend-t-shirts', name: 'Boyfriend T-Shirts', description: 'A classic loose fit inspired by mens cuts' },
      { id: 'fitted-t-shirts', name: 'Fitted T-Shirts', description: 'Tight-fitting, body-hugging tees' },
      { id: 'oversized-jerseys', name: 'Oversized Jerseys', description: 'Sporty, mesh-style or thick cotton shirts that look like athletic wear' },
    ],
  },
  {
    id: 'tops-baby-tees',
    name: 'Tops & Baby Tees',
    description: 'Cropped and fitted tops',
    subcategories: [
      { id: 'cropped-tops', name: 'Cropped Tops / Baby Tees', description: 'Short-length tops that end above the waist' },
      { id: 'bralettes', name: 'Bralettes', description: 'Small, supportive tops often worn under shirts or jackets' },
      { id: 'tank-tops-vests', name: 'Tank Tops & Vests', description: 'Sleeveless tops ranging from basic cotton to Jacquard Vests' },
      { id: 'full-sleeve-tops', name: 'Full Sleeve Tops', description: 'Usually ribbed or fitted tops for layering' },
      { id: 'tie-up-tops', name: 'Tie-Up Tops', description: 'Features adjustable strings or knots for a customized fit' },
    ],
  },
  {
    id: 'shirts-shackets',
    name: 'Shirts & Shackets',
    description: 'Button-downs and shirt-jacket hybrids',
    subcategories: [
      { id: 'boyfriend-shirts', name: 'Boyfriend Shirts', description: 'Oversized, long-line button-downs' },
      { id: 'cropped-shirts', name: 'Cropped Shirts', description: 'Waist-length button-downs (very trendy with high-waist bottoms)' },
      { id: 'holiday-boxy-shirts', name: 'Holiday / Boxy Shirts', description: 'Short-sleeved, breezy shirts with vibrant prints' },
      { id: 'shackets', name: 'Shackets', description: 'A Shirt-Jacket hybrid; made of thicker material like flannel or teddy fabric' },
      { id: 'fitted-shirts', name: 'Fitted Shirts', description: 'Traditional tailored shirts for a clean look' },
    ],
  },
  {
    id: 'sweatshirts-hoodies',
    name: 'Sweatshirts & Hoodies',
    description: 'Comfortable pullovers and hooded garments',
    subcategories: [
      { id: 'oversized-hoodies', name: 'Oversized Hoodies', description: 'Heavy-weight pullovers with a hood and front pocket' },
      { id: 'oversized-sweatshirts', name: 'Oversized Sweatshirts', description: 'Crew-neck pullovers without a hood' },
      { id: 'cropped-oversized-hoodies', name: 'Cropped Oversized Hoodies', description: 'Short-length hoodies with a baggy sleeve' },
      { id: 'zipper-hoodies', name: 'Zipper Hoodies', description: 'Hoodies with a full-length front zipper' },
      { id: 'teddy-polar-fleece', name: 'Teddy / Polar Fleece', description: 'Ultra-soft, fuzzy sweatshirts for colder weather' },
    ],
  },
  {
    id: 'jackets-outerwear',
    name: 'Jackets & Outerwear',
    description: 'Outer layers for various occasions',
    subcategories: [
      { id: 'denim-jackets', name: 'Denim Jackets', description: 'Classic and oversized trucker-style jackets' },
      { id: 'puffer-jackets', name: 'Puffer Jackets', description: 'Thick, quilted jackets for winter' },
      { id: 'windbreakers', name: 'Windbreakers', description: 'Lightweight, water-resistant layers' },
      { id: 'bomber-jackets', name: 'Bomber Jackets', description: 'Short, elastic-waisted jackets' },
    ],
  },
  {
    id: 'knitwear',
    name: 'Knitwear (Sweaters)',
    description: 'Knitted garments for warmth and style',
    subcategories: [
      { id: 'oversized-sweaters', name: 'Oversized Sweaters', description: 'Loose, knitted pullovers' },
      { id: 'cable-knit-sweaters', name: 'Cable-Knit Sweaters', description: 'Featuring traditional textured knit patterns' },
      { id: 'cardigans', name: 'Cardigans', description: 'Open-front knitted garments with buttons' },
    ],
  },
  {
    id: 'co-ord-sets',
    name: 'Co-ord Sets (Matching Tops & Bottoms)',
    description: 'Matching sets',
    subcategories: [
      { id: 'short-sets', name: 'Short Sets', description: 'Usually a matching printed shirt or t-shirt with shorts (great for summer)' },
      { id: 'pant-sets', name: 'Pant Sets', description: 'Matching Korean or Nomad pants with a coordinated top or vest' },
      { id: 'skort-sets', name: 'Skort Sets', description: 'A matching top paired with a skort' },
      { id: 'lounge-sets', name: 'Lounge Sets', description: 'Matching sweatshirts and joggers in the same color or theme (like Harry Potter or Disney)' },
    ],
  },
  {
    id: 'specialized-upper',
    name: 'Specialized Upper Garments (The Extras)',
    description: 'Specialized upper garments',
    subcategories: [
      { id: 'jacquard-vests', name: 'Jacquard Vests', description: 'Knitted, patterned vests usually worn over shirts' },
      { id: 'linen-vests', name: 'Linen Vests', description: 'Button-up vests that can be worn alone as a top' },
      { id: 'bralettes-bodysuits', name: 'Bralettes & Bodysuits', description: 'Often worn as a base layer or as a clubwear top' },
      { id: 'cropped-rugby-polos', name: 'Cropped Rugby Polos', description: 'Sporty, thick-collar shirts that are cut short' },
      { id: 'classic-polos', name: 'Classic Polos', description: 'Standard fitted collared shirts' },
    ],
  },
  {
    id: 't-shirt-dresses',
    name: 'T-Shirt Dresses',
    description: 'Upper garment that is long enough to be a dress',
    subcategories: [
      { id: 'oversized-t-shirt-dresses', name: 'Oversized T-Shirt Dresses', description: 'Just a very long version of their famous oversized tees' },
      { id: 'hoodie-dresses', name: 'Hoodie Dresses', description: 'A long-line hoodie that functions as a single-piece outfit' },
    ],
  },
];

// Helper functions
export function getGarmentCategories(gender: 'Male' | 'Female', garmentType: 'upper' | 'lower'): GarmentCategory[] {
  if (gender === 'Male') {
    return garmentType === 'upper' ? MEN_UPPER_CATEGORIES : MEN_LOWER_CATEGORIES;
  } else {
    return garmentType === 'upper' ? WOMEN_UPPER_CATEGORIES : WOMEN_LOWER_CATEGORIES;
  }
}

export function getAllSubcategories(gender: 'Male' | 'Female', garmentType: 'upper' | 'lower'): GarmentSubcategory[] {
  const categories = getGarmentCategories(gender, garmentType);
  return categories.flatMap(cat => cat.subcategories);
}


