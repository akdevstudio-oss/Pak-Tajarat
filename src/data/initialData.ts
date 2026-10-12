import { Product, Coupon, BlogPost, SiteBrandingConfig, CategoryItem, SeoConfig, HeroBanner } from '../types';

export const CATEGORIES = [
  'Electronics',
  'Fashion',
  'Home & Kitchen',
  'Beauty',
  'Grocery',
  'Mobile Accessories',
  'Sports',
  'Toys',
  'Books'
];

export const DEFAULT_BRANDING_CONFIG: SiteBrandingConfig = {
  primaryColor: '#059669',
  accentColor: '#10B981',
  storeName: 'PAK-TAJARAT',
  slogan: "Pakistan's Premier Digital Marketplace & B2B Hub",
  contactPhone: '0326-1604808',
  contactEmail: 'support@paktajarat.pk',
  address: 'Plot 42, Sector I-9/2, Industrial Area, Islamabad, Pakistan'
};

export const DEFAULT_SITE_CATEGORIES: CategoryItem[] = [
  { id: 'cat-1', name: 'Electronics', icon: 'Cpu', slug: 'electronics' },
  { id: 'cat-2', name: 'Fashion', icon: 'Shirt', slug: 'fashion' },
  { id: 'cat-3', name: 'Home & Kitchen', icon: 'Home', slug: 'home-kitchen' },
  { id: 'cat-4', name: 'Beauty', icon: 'Sparkles', slug: 'beauty' },
  { id: 'cat-5', name: 'Grocery', icon: 'ShoppingBag', slug: 'grocery' },
  { id: 'cat-6', name: 'Mobile Accessories', icon: 'Smartphone', slug: 'mobile-accessories' },
  { id: 'cat-7', name: 'Sports', icon: 'Activity', slug: 'sports' },
  { id: 'cat-8', name: 'Toys', icon: 'Gamepad2', slug: 'toys' },
  { id: 'cat-9', name: 'Books', icon: 'BookOpen', slug: 'books' }
];

export const DEFAULT_SEO_CONFIG: SeoConfig = {
  siteTitle: 'Pak-Tajarat | Pakistan\'s Premier Digital Marketplace',
  metaDescription: 'Shop top quality products across Pakistan with fast COD delivery and 100% buyer protection.',
  keywords: 'e-commerce, pakistan shopping, online store, pak-tajarat, buy online pakistan',
  ogImage: 'https://images.unsplash.com/photo-1542496658-e33a6d0d50f6?auto=format&fit=crop&w=1200&q=80',
  twitterHandle: '@PakTajarat'
};

export const DEFAULT_HERO_BANNERS: HeroBanner[] = [
  {
    id: 'b1',
    title: 'Pak-Elite Smart Watch S4',
    subtitle: 'Track your health & calls with 1.43" AMOLED Display',
    ctaText: 'Shop Now',
    ctaLink: '/products/p1',
    imageUrl: 'https://images.unsplash.com/photo-1542496658-e33a6d0d50f6?auto=format&fit=crop&w=1200&q=80',
    badgeText: 'FLASH SALE'
  },
  {
    id: 'b2',
    title: 'Hard Shell Laptop Backpack',
    subtitle: 'Waterproof Flexible Polymer Blend Made in Pakistan',
    ctaText: 'Explore Product',
    ctaLink: '/products/p2',
    imageUrl: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=1200&q=80',
    badgeText: 'MADE IN PAKISTAN'
  }
];

export const INITIAL_PRODUCTS: Product[] = [
  // --- ELECTRONICS ---
  {
    id: 'p1',
    name: 'Pak-Elite Smart Watch S4',
    description: 'Track your health, receive calls, and stay connected on the go with the premium Pak-Elite Smart Watch S4. Features a vibrant 1.43-inch AMOLED display, heart rate monitor, SpO2 sensor, and up to 10 days of battery backup. IP68 water resistant.',
    price: 6500,
    originalPrice: 9500,
    image: 'https://images.unsplash.com/photo-1542496658-e33a6d0d50f6?auto=format&fit=crop&w=600&q=80',
    images: [
      'https://images.unsplash.com/photo-1542496658-e33a6d0d50f6?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=600&q=80'
    ],
    category: 'Electronics',
    rating: 4.8,
    reviewsCount: 124,
    stock: 25,
    specifications: {
      'Display': '1.43-inch AMOLED, Always-On Display',
      'Battery': '450 mAh (Up to 10 days)',
      'Waterproof': 'IP68 & 5ATM certified',
      'Connectivity': 'Bluetooth 5.3',
      'Warranty': '1 Year Official Brand Warranty'
    },
    isFeatured: true,
    isBestSeller: true,
    isNewArrival: false,
    isFlashSale: true,
    affiliateEnabled: true,
    commissionType: 'percentage',
    commissionValue: 12,
    seoTitle: 'Buy Pak-Elite Smart Watch S4 Online in Pakistan | AMOLED Display',
    seoDescription: 'Order Pak-Elite Smart Watch S4 with 1.43 inch AMOLED display and 10 days battery in Pakistan. COD available.',
    seoKeywords: 'smart watch, smartwatch pakistan, amoled smartwatch, fitness tracker'
  },
  {
    id: 'p3',
    name: 'Active Noise Cancelling Wireless Over-Ear Headphones',
    description: 'Immerse yourself in crystal clear studio audio with hybrid Active Noise Cancellation (ANC). Engineered with 40mm neodymium drivers, 50-hour playback time, ultra-soft memory foam earcups, and dual microphone HD call clarity.',
    price: 8900,
    originalPrice: 12500,
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=600&q=80',
    images: [
      'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1484704849700-f032a568e944?auto=format&fit=crop&w=600&q=80'
    ],
    category: 'Electronics',
    rating: 4.7,
    reviewsCount: 96,
    stock: 18,
    specifications: {
      'Driver Size': '40mm Neodymium',
      'Playtime': '50 Hours (ANC Off), 35 Hours (ANC On)',
      'Charging': 'Fast Type-C (10 mins = 4 hrs)',
      'Bluetooth': 'v5.2 Dual Multipoint',
      'Warranty': '1 Year Brand Warranty'
    },
    isFeatured: true,
    isBestSeller: false,
    isNewArrival: true,
    isFlashSale: false,
    affiliateEnabled: true,
    commissionType: 'percentage',
    commissionValue: 10,
    seoTitle: 'Wireless ANC Headphones Price in Pakistan | Studio Quality',
    seoDescription: 'Buy wireless Active Noise Cancelling headphones in Pakistan with 50-hour battery and memory foam comfort.',
    seoKeywords: 'anc headphones, bluetooth headphones pakistan, noise cancelling headphones'
  },
  {
    id: 'p4',
    name: 'Pak-Pro 43" 4K Smart Android TV HDR10+',
    description: 'Transform your living room into a cinematic theater with Pak-Pro 43" Ultra HD Smart Android TV. Powered by Google TV OS, Dolby Audio, built-in Chromecast, Voice Remote, and frameless Bezel-Less display.',
    price: 68500,
    originalPrice: 79000,
    image: 'https://images.unsplash.com/photo-1593784991095-a205069470b6?auto=format&fit=crop&w=600&q=80',
    images: [
      'https://images.unsplash.com/photo-1593784991095-a205069470b6?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1461151304267-38535e780c79?auto=format&fit=crop&w=600&q=80'
    ],
    category: 'Electronics',
    rating: 4.9,
    reviewsCount: 52,
    stock: 10,
    specifications: {
      'Resolution': '4K UHD (3840 x 2160)',
      'OS': 'Official Google TV OS (Android 11)',
      'Audio': '20W Speakers with Dolby Atmos Support',
      'Ports': '3 x HDMI 2.1, 2 x USB, Wi-Fi 5GHz',
      'Warranty': '2 Years Home Service Warranty'
    },
    isFeatured: false,
    isBestSeller: true,
    isNewArrival: false,
    isFlashSale: false,
    affiliateEnabled: true,
    commissionType: 'percentage',
    commissionValue: 5,
    seoTitle: '43 Inch 4K Smart TV Price in Pakistan | Pak-Pro Android TV',
    seoDescription: 'Best 43 inch 4K Ultra HD Smart Android TV in Pakistan with Google TV OS and Dolby Atmos sound.',
    seoKeywords: '4k smart tv pakistan, 43 inch tv, android tv, pak-pro tv'
  },

  // --- FASHION ---
  {
    id: 'p2',
    name: 'Flexible Hard Shell Laptop Backpack | Made in Pakistan',
    description: 'Experience premium protection and modern style with our Flexible Hard Shell Laptop Backpack, proudly manufactured in Pakistan. Engineered using a high-performance polymer blend of PP Homopolymer, HDPE, LLDPE, Elastomer, and ABS for impact resistance and ergonomic daily carry.',
    price: 4850,
    originalPrice: 7500,
    image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1622560480605-d83c853bc5c3?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1546938576-6e6a64f317cc?auto=format&fit=crop&w=800&q=80'
    ],
    category: 'Fashion',
    rating: 4.9,
    reviewsCount: 89,
    stock: 40,
    specifications: {
      'Material': 'Polymer Blend (PP Homo, HDPE, LLDPE, Elastomer, ABS)',
      'Water Resistance': 'Water-Repellent Outer Shell',
      'Laptop Support': 'Fits up to 17.3-inch Laptop',
      'Origin': 'Proudly Manufactured in Pakistan'
    },
    isFeatured: true,
    isBestSeller: true,
    isNewArrival: true,
    isFlashSale: false,
    affiliateEnabled: true,
    commissionType: 'percentage',
    commissionValue: 15,
    seoTitle: 'Flexible Hard Shell Laptop Backpack | Made in Pakistan',
    seoDescription: 'Export-grade flexible hard shell laptop backpack made in Pakistan with polymer armor and ergonomic straps.',
    seoKeywords: 'laptop backpack pakistan, hard shell bag, waterproof backpack'
  },
  {
    id: 'p5',
    name: 'Luxury Unstitched 3-Piece Printed Lawn Suit',
    description: 'Elevate your seasonal wardrobe with this luxury 3-piece unstitched lawn collection. Includes digitally printed premium lawn shirt, chiffon dupatta, and dyed cotton trousers. Vibrant non-fade colors with subtle embroidery detailing.',
    price: 3950,
    originalPrice: 5500,
    image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=600&q=80',
    images: [
      'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=600&q=80'
    ],
    category: 'Fashion',
    rating: 4.8,
    reviewsCount: 142,
    stock: 35,
    specifications: {
      'Fabric Shirt': '100% Digital Printed Lawn (3 Meters)',
      'Fabric Dupatta': 'Bamber Chiffon (2.5 Meters)',
      'Fabric Trouser': 'Dyed Cambric Cotton (2.5 Meters)',
      'Care Instructions': 'Hand wash / Dry Clean recommended'
    },
    isFeatured: true,
    isBestSeller: true,
    isNewArrival: true,
    isFlashSale: true,
    affiliateEnabled: true,
    commissionType: 'percentage',
    commissionValue: 10,
    seoTitle: '3 Piece Unstitched Lawn Suit Online | Summer Collection Pakistan',
    seoDescription: 'Buy luxury 3-piece printed unstitched lawn suit with chiffon dupatta in Pakistan at discount prices.',
    seoKeywords: 'unstitched lawn, lawn suit 3 piece, pakistani lawn suit, ladies fashion'
  },
  {
    id: 'p6',
    name: 'Handcrafted Genuine Cow Leather Bi-Fold Wallet',
    description: 'Handmade by master artisans in Sialkot, this slim bi-fold wallet is made from 100% full-grain cowhide leather. Includes RFID blocking protection, 8 card slots, 2 currency compartments, and a transparent ID window.',
    price: 1850,
    originalPrice: 2800,
    image: 'https://images.unsplash.com/photo-1627123424574-724758594e93?auto=format&fit=crop&w=600&q=80',
    images: [
      'https://images.unsplash.com/photo-1627123424574-724758594e93?auto=format&fit=crop&w=600&q=80'
    ],
    category: 'Fashion',
    rating: 4.7,
    reviewsCount: 68,
    stock: 50,
    specifications: {
      'Material': '100% Full Grain Genuine Cow Leather',
      'Security': 'RFID Blocking Layer Built-In',
      'Capacity': '8 Card Slots, 2 Cash Dividers, 1 ID Slot',
      'Color': 'Vintage Vintage Tan Brown'
    },
    isFeatured: false,
    isBestSeller: false,
    isNewArrival: false,
    isFlashSale: false,
    affiliateEnabled: true,
    commissionType: 'percentage',
    commissionValue: 12,
    seoTitle: 'Genuine Leather Wallet for Men in Pakistan | RFID Protected',
    seoDescription: 'Buy handcrafted 100% pure leather wallet in Pakistan. RFID blocking slim design with free shipping.',
    seoKeywords: 'leather wallet men, pure leather wallet sialkot, rfid wallet'
  },

  // --- HOME & KITCHEN ---
  {
    id: 'p7',
    name: 'Smart Touch Air Fryer 6.5L Large Capacity',
    description: 'Enjoy delicious crispy food with 85% less oil using the 6.5L Smart Digital Air Fryer. Features 10 pre-set cooking programs, 360-degree rapid air heating, non-stick dishwasher-safe basket, and LED touch screen control.',
    price: 18500,
    originalPrice: 24000,
    image: 'https://images.unsplash.com/photo-1585515320310-259814833e62?auto=format&fit=crop&w=600&q=80',
    images: [
      'https://images.unsplash.com/photo-1585515320310-259814833e62?auto=format&fit=crop&w=600&q=80'
    ],
    category: 'Home & Kitchen',
    rating: 4.9,
    reviewsCount: 110,
    stock: 15,
    specifications: {
      'Capacity': '6.5 Liters (Family Size)',
      'Power': '1800 Watts High Efficiency',
      'Temperature Range': '80°C - 200°C',
      'Presets': '10 Quick Touch Cooking Modes',
      'Warranty': '1 Year Replacement Warranty'
    },
    isFeatured: true,
    isBestSeller: true,
    isNewArrival: false,
    isFlashSale: true,
    affiliateEnabled: true,
    commissionType: 'percentage',
    commissionValue: 8,
    seoTitle: 'Air Fryer 6.5L Price in Pakistan | Smart Touch Digital Air Fryer',
    seoDescription: 'Buy 6.5 Liter digital air fryer in Pakistan. Oil-free cooking with 10 presets and 1 year warranty.',
    seoKeywords: 'air fryer pakistan, digital air fryer, oil free cooking, kitchen appliances'
  },
  {
    id: 'p8',
    name: 'Non-Stick Granite Coating Cookware Set 10-Pcs',
    description: 'Upgrade your kitchen with our heavy-duty 10-piece granite cookware set. Eco-friendly PTFE & PFOA free coating, heat-resistant toughened glass lids, stay-cool ergonomic handles, and induction compatible bases.',
    price: 14500,
    originalPrice: 19500,
    image: 'https://images.unsplash.com/photo-1584992236310-6edddc08acff?auto=format&fit=crop&w=600&q=80',
    images: [
      'https://images.unsplash.com/photo-1584992236310-6edddc08acff?auto=format&fit=crop&w=600&q=80'
    ],
    category: 'Home & Kitchen',
    rating: 4.6,
    reviewsCount: 45,
    stock: 20,
    specifications: {
      'Pieces Included': '3 Cooking Pots, 1 Saucepan, 1 Frying Pan, 5 Tempered Lids',
      'Coating': '5-Layer German Technology Granite Coating',
      'Safety': 'PFOA, Lead & Cadmium Free',
      'Stove Type': 'Gas, Electric, Ceramic & Induction Compatible'
    },
    isFeatured: false,
    isBestSeller: false,
    isNewArrival: true,
    isFlashSale: false,
    affiliateEnabled: true,
    commissionType: 'percentage',
    commissionValue: 10,
    seoTitle: 'Granite Non Stick Cookware Set 10 Pcs in Pakistan',
    seoDescription: 'Premium 10-piece non-stick granite cookware set price in Pakistan. Eco-friendly with glass lids.',
    seoKeywords: 'cookware set, non stick pots pakistan, granite cookware'
  },

  // --- BEAUTY ---
  {
    id: 'p9',
    name: 'Pure Organic Rosewater & Niacinamide Glow Serum 30ml',
    description: 'Formulated with cold-distilled organic rosewater from Gilgit-Baltistan and 10% Niacinamide + Zinc. Brightens skin tone, reduces dark spots, tightens enlarged pores, and hydrates deeply without greasy residue.',
    price: 1450,
    originalPrice: 2100,
    image: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=600&q=80',
    images: [
      'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=600&q=80'
    ],
    category: 'Beauty',
    rating: 4.8,
    reviewsCount: 165,
    stock: 60,
    specifications: {
      'Volume': '30 ml Glass Dropper Bottle',
      'Key Ingredients': 'Gilgit Organic Rosewater, 10% Niacinamide, Hyaluronic Acid, Zinc PCA',
      'Skin Type': 'Suitable for All Skin Types including Sensitive Skin',
      'Certification': 'Dermatologist Tested, Paraben-Free, Cruelty-Free'
    },
    isFeatured: true,
    isBestSeller: true,
    isNewArrival: false,
    isFlashSale: false,
    affiliateEnabled: true,
    commissionType: 'percentage',
    commissionValue: 15,
    seoTitle: 'Niacinamide Glow Serum with Organic Rosewater Pakistan',
    seoDescription: 'Buy organic rosewater niacinamide face serum for glowing skin in Pakistan. Treats dark spots & pores.',
    seoKeywords: 'niacinamide serum pakistan, face glow serum, rosewater serum'
  },
  {
    id: 'p10',
    name: 'Botanical Hair Growth Herbal Oil 200ml',
    description: 'Traditional Ayurvedic cold-pressed hair oil blend enriched with Amla, Reetha, Shikakai, Bhringraj, and Pure Coconut oil. Stops hair fall, stimulates new follicle growth, cures dandruff, and conditions deeply.',
    price: 1250,
    originalPrice: 1800,
    image: 'https://images.unsplash.com/photo-1608248597261-83324537924e?auto=format&fit=crop&w=600&q=80',
    images: [
      'https://images.unsplash.com/photo-1608248597261-83324537924e?auto=format&fit=crop&w=600&q=80'
    ],
    category: 'Beauty',
    rating: 4.7,
    reviewsCount: 88,
    stock: 45,
    specifications: {
      'Volume': '200 ml Bottle',
      'Ingredients': 'Amla, Shikakai, Reetha, Bhringraj, Black Seed (Kalonji) Oil, Coconut Oil',
      'Free From': 'Mineral Oil, Silicones, Artificial Colorants',
      'Usage': 'Apply 2-3 times a week before washing'
    },
    isFeatured: false,
    isBestSeller: false,
    isNewArrival: true,
    isFlashSale: false,
    affiliateEnabled: true,
    commissionType: 'percentage',
    commissionValue: 12,
    seoTitle: 'Organic Herbal Hair Oil for Hair Growth in Pakistan',
    seoDescription: 'Natural herbal oil with Amla, Kalonji and Bhringraj for fast hair growth & stopping hair fall in Pakistan.',
    seoKeywords: 'herbal hair oil, hair growth oil pakistan, organic anti hairfall oil'
  },

  // --- GROCERY ---
  {
    id: 'p11',
    name: 'Super Kernel Basmati Rice 5kg Export Quality',
    description: 'Aged 100% pure Super Kernel Basmati Rice sourced directly from the fertile paddies of Punjab. Known for its aromatic fragrance, extra long grain elongation up to 18mm when cooked, non-sticky texture, and delicate taste.',
    price: 1950,
    originalPrice: 2400,
    image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=600&q=80',
    images: [
      'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=600&q=80'
    ],
    category: 'Grocery',
    rating: 4.9,
    reviewsCount: 210,
    stock: 100,
    specifications: {
      'Net Weight': '5 KG Fabric Bag',
      'Grain Variety': 'Super Kernel Basmati (2 Years Aged)',
      'Cooked Elongation': 'Up to 18mm',
      'Origin': 'Punjab, Pakistan'
    },
    isFeatured: true,
    isBestSeller: true,
    isNewArrival: false,
    isFlashSale: false,
    affiliateEnabled: true,
    commissionType: 'percentage',
    commissionValue: 5,
    seoTitle: 'Super Kernel Basmati Rice 5kg Price in Pakistan | Export Quality',
    seoDescription: 'Buy export quality aged Super Kernel Basmati Rice 5kg in Pakistan with long grains and rich aroma.',
    seoKeywords: 'basmati rice 5kg, super kernel basmati, grocery shopping online'
  },
  {
    id: 'p12',
    name: 'Pure Organic Sidr Honey (Berry Honey) 500g',
    description: 'Unprocessed raw Wild Sidr Berry Honey harvested from Karak & Swat valleys. 100% natural, unheated, unfiltered with rich medicinal properties, thick golden texture, and distinct floral aroma.',
    price: 3200,
    originalPrice: 4200,
    image: 'https://images.unsplash.com/photo-1587049352847-4a222e784d38?auto=format&fit=crop&w=600&q=80',
    images: [
      'https://images.unsplash.com/photo-1587049352847-4a222e784d38?auto=format&fit=crop&w=600&q=80'
    ],
    category: 'Grocery',
    rating: 4.9,
    reviewsCount: 94,
    stock: 30,
    specifications: {
      'Weight': '500g Glass Jar',
      'Source': 'Karak & Swat Wild Sidr Trees',
      'Processing': 'Raw Unheated & Unfiltered',
      'Purity': '100% Lab Tested Pure Organic Honey'
    },
    isFeatured: false,
    isBestSeller: true,
    isNewArrival: false,
    isFlashSale: false,
    affiliateEnabled: true,
    commissionType: 'percentage',
    commissionValue: 10,
    seoTitle: 'Pure Sidr Honey (Berry Honey) Price in Pakistan | 500g Glass Jar',
    seoDescription: 'Order 100% pure organic Sidr Berry Honey harvested in Swat & Karak. Raw, unfiltered, lab tested.',
    seoKeywords: 'sidr honey pakistan, pure organic honey, berry honey price'
  },

  // --- MOBILE ACCESSORIES ---
  {
    id: 'p13',
    name: '65W GaN Fast Wall Charger Dual Type-C & USB-A',
    description: 'Next-gen Gallium Nitride (GaN) technology allows 65W ultra-fast charging in a compact size. Simultaneously fast charges laptops (MacBook/Dell), iPhone, Samsung Galaxy, and iPads with smart power allocation.',
    price: 3450,
    originalPrice: 4800,
    image: 'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?auto=format&fit=crop&w=600&q=80',
    images: [
      'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?auto=format&fit=crop&w=600&q=80'
    ],
    category: 'Mobile Accessories',
    rating: 4.8,
    reviewsCount: 78,
    stock: 45,
    specifications: {
      'Power Output': '65W Max Power Delivery (PD 3.0 & QC 4.0)',
      'Ports': '2 x Type-C PD Ports, 1 x USB-A Fast Charge Port',
      'Technology': 'GaN III Semiconductor',
      'Protection': 'Overcurrent, Overvoltage & Heat Shield Protection'
    },
    isFeatured: true,
    isBestSeller: false,
    isNewArrival: true,
    isFlashSale: true,
    affiliateEnabled: true,
    commissionType: 'percentage',
    commissionValue: 12,
    seoTitle: '65W GaN Fast Charger Price in Pakistan | Type C Fast Adapter',
    seoDescription: 'Buy 65W GaN fast wall charger with dual Type-C ports for iPhone, Samsung & laptops in Pakistan.',
    seoKeywords: 'gan charger 65w, fast charger pakistan, type c adapter'
  },
  {
    id: 'p14',
    name: 'MagSafe Wireless Power Bank 10000mAh with Kickstand',
    description: 'Magnetic wireless power bank engineered for iPhone 12/13/14/15/16 series & MagSafe compatible cases. Features 15W wireless output, 22.5W wired Type-C PD, built-in foldable metal ring kickstand, and LED battery display.',
    price: 4250,
    originalPrice: 5800,
    image: 'https://images.unsplash.com/photo-1609592424109-dd9892f1b177?auto=format&fit=crop&w=600&q=80',
    images: [
      'https://images.unsplash.com/photo-1609592424109-dd9892f1b177?auto=format&fit=crop&w=600&q=80'
    ],
    category: 'Mobile Accessories',
    rating: 4.7,
    reviewsCount: 62,
    stock: 35,
    specifications: {
      'Capacity': '10,000 mAh Li-Polymer',
      'Wireless Output': '15W MagSafe Fast Wireless',
      'Wired Output': '22.5W USB-A & Type-C PD 20W',
      'Extra Feature': 'Foldable Metal Kickstand'
    },
    isFeatured: false,
    isBestSeller: true,
    isNewArrival: false,
    isFlashSale: false,
    affiliateEnabled: true,
    commissionType: 'percentage',
    commissionValue: 10,
    seoTitle: 'MagSafe Magnetic Power Bank 10000mAh in Pakistan',
    seoDescription: 'Order 10000mAh magnetic wireless power bank with stand in Pakistan. Fast charge for iPhone & Android.',
    seoKeywords: 'magsafe power bank, magnetic wireless powerbank, iphone power bank'
  },

  // --- SPORTS ---
  {
    id: 'p15',
    name: 'Pro English Willow Cricket Bat Master-1000',
    description: 'Handcrafted in Sialkot from Grade 1 English Willow. Features 8-12 straight grains, thick 40mm edges, balanced pickup, Sarawak cane handle with rubber grip, and toe guard protection. Ideal for professional leather ball matches.',
    price: 22500,
    originalPrice: 30000,
    image: 'https://images.unsplash.com/photo-1531415074968-036ba1b575da?auto=format&fit=crop&w=600&q=80',
    images: [
      'https://images.unsplash.com/photo-1531415074968-036ba1b575da?auto=format&fit=crop&w=600&q=80'
    ],
    category: 'Sports',
    rating: 4.9,
    reviewsCount: 38,
    stock: 12,
    specifications: {
      'Willow Grade': 'Grade 1 Natural English Willow',
      'Grain Count': '8 to 12 Straight Grains',
      'Edge Thickness': '38mm - 40mm Big Edges',
      'Weight': '1180g - 1220g (Customizable Pickup)'
    },
    isFeatured: true,
    isBestSeller: false,
    isNewArrival: true,
    isFlashSale: false,
    affiliateEnabled: true,
    commissionType: 'percentage',
    commissionValue: 8,
    seoTitle: 'English Willow Cricket Bat Price in Pakistan | Sialkot Made',
    seoDescription: 'Buy professional Grade 1 English Willow cricket bat in Pakistan handcrafted in Sialkot. Big edges & sweet spot.',
    seoKeywords: 'english willow bat, cricket bat sialkot, professional cricket bat'
  },
  {
    id: 'p16',
    name: 'Non-Slip Eco TPE Yoga & Fitness Mat 6mm',
    description: 'Non-toxic, eco-friendly TPE material with double-sided anti-skid texture. Provides 6mm optimal cushioning for knees and joints during Yoga, Pilates, and floor exercises. Comes with carrying strap and bag.',
    price: 2450,
    originalPrice: 3500,
    image: 'https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?auto=format&fit=crop&w=600&q=80',
    images: [
      'https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?auto=format&fit=crop&w=600&q=80'
    ],
    category: 'Sports',
    rating: 4.6,
    reviewsCount: 54,
    stock: 40,
    specifications: {
      'Thickness': '6mm High Density Cushioning',
      'Material': 'Eco-Friendly TPE (PVC & Latex Free)',
      'Dimensions': '183 cm x 61 cm (6ft x 2ft)',
      'Includes': 'Carry Strap & Mesh Storage Bag'
    },
    isFeatured: false,
    isBestSeller: false,
    isNewArrival: false,
    isFlashSale: false,
    affiliateEnabled: true,
    commissionType: 'percentage',
    commissionValue: 12,
    seoTitle: 'Yoga Mat 6mm Non Slip Price in Pakistan | Exercise Mat',
    seoDescription: 'Buy 6mm non-slip eco TPE yoga and fitness mat in Pakistan. Waterproof and easy to clean with free strap.',
    seoKeywords: 'yoga mat pakistan, exercise mat, gym mat, tpe yoga mat'
  },

  // --- TOYS ---
  {
    id: 'p17',
    name: '4WD High-Speed Remote Control Off-Road RC Truck',
    description: 'Thrill your kids with this 1:16 scale 4WD RC Monster Truck capable of reaching speeds up to 30 km/h. Durable alloy body, independent shock absorbers, rugged rubber tires, and 2.4GHz long-range remote controller.',
    price: 5800,
    originalPrice: 8200,
    image: 'https://images.unsplash.com/photo-1594787318286-3d835c1d207f?auto=format&fit=crop&w=600&q=80',
    images: [
      'https://images.unsplash.com/photo-1594787318286-3d835c1d207f?auto=format&fit=crop&w=600&q=80'
    ],
    category: 'Toys',
    rating: 4.8,
    reviewsCount: 42,
    stock: 22,
    specifications: {
      'Speed': 'Up to 30 KM/H',
      'Scale': '1:16 Scale All-Terrain 4WD',
      'Remote Frequency': '2.4 GHz (Range up to 80 meters)',
      'Battery': 'Rechargeable 7.4V 1200mAh (20 mins play time)'
    },
    isFeatured: true,
    isBestSeller: true,
    isNewArrival: false,
    isFlashSale: true,
    affiliateEnabled: true,
    commissionType: 'percentage',
    commissionValue: 10,
    seoTitle: 'RC Monster Truck Remote Control Car Price in Pakistan',
    seoDescription: 'Buy 4WD high speed remote control off-road truck in Pakistan with rechargeable battery and alloy body.',
    seoKeywords: 'rc car pakistan, remote control truck, toys for boys, monster truck'
  },
  {
    id: 'p18',
    name: 'STEM 500-Pcs Creative Building Blocks Architecture Set',
    description: 'Inspire creativity and problem-solving skills with 500 brightly colored interlocking building blocks. Compatible with all major building block brands. Non-toxic ABS plastic with smooth rounded edges.',
    price: 3200,
    originalPrice: 4500,
    image: 'https://images.unsplash.com/photo-1587654780291-39c9404d746b?auto=format&fit=crop&w=600&q=80',
    images: [
      'https://images.unsplash.com/photo-1587654780291-39c9404d746b?auto=format&fit=crop&w=600&q=80'
    ],
    category: 'Toys',
    rating: 4.9,
    reviewsCount: 67,
    stock: 30,
    specifications: {
      'Pieces': '500 Interlocking Brick Pieces',
      'Material': 'BPA-Free Non-Toxic High Quality ABS',
      'Age Group': 'Ages 4 Years and Up',
      'Includes': 'Storage Tub & Idea Guide Manual'
    },
    isFeatured: false,
    isBestSeller: false,
    isNewArrival: true,
    isFlashSale: false,
    affiliateEnabled: true,
    commissionType: 'percentage',
    commissionValue: 12,
    seoTitle: 'Building Blocks 500 Pcs STEM Educational Toy in Pakistan',
    seoDescription: 'Buy 500-piece building block set for kids in Pakistan. STEM creative building toy with storage box.',
    seoKeywords: 'building blocks, lego compatible blocks pakistan, educational toys'
  },

  // --- BOOKS ---
  {
    id: 'p19',
    name: 'Peer-e-Kamil (The Perfect Mentor) - Collector Deluxe Hardcover',
    description: 'The timeless masterpiece novel by Umera Ahmed in a premium hardbound edition with gold-embossed spine, high-grade cream paper, and durable ribbon bookmark. A deep journey of faith, love, and redemption.',
    price: 1850,
    originalPrice: 2400,
    image: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80',
    images: [
      'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80'
    ],
    category: 'Books',
    rating: 5.0,
    reviewsCount: 310,
    stock: 75,
    specifications: {
      'Author': 'Umera Ahmed',
      'Binding': 'Deluxe Gold Embossed Hardcover',
      'Language': 'Urdu',
      'Pages': '532 Pages (Cream Imported Paper)'
    },
    isFeatured: true,
    isBestSeller: true,
    isNewArrival: false,
    isFlashSale: false,
    affiliateEnabled: true,
    commissionType: 'percentage',
    commissionValue: 10,
    seoTitle: 'Peer e Kamil Novel Hardcover Price in Pakistan | Umera Ahmed',
    seoDescription: 'Buy original Peer-e-Kamil (The Perfect Mentor) hardcover edition by Umera Ahmed online in Pakistan.',
    seoKeywords: 'peer e kamil, urdu novel, umera ahmed books, books online pakistan'
  },
  {
    id: 'p20',
    name: 'Atomic Habits by James Clear (Pakistani Paper Edition)',
    description: 'The #1 New York Times bestseller. An easy and proven way to build good habits and break bad ones. Learn tiny changes that deliver remarkable results in business and personal life.',
    price: 950,
    originalPrice: 1500,
    image: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=600&q=80',
    images: [
      'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=600&q=80'
    ],
    category: 'Books',
    rating: 4.9,
    reviewsCount: 180,
    stock: 85,
    specifications: {
      'Author': 'James Clear',
      'Format': 'Paperback English Edition',
      'Genre': 'Self-Help / Productivity',
      'Pages': '320 Pages'
    },
    isFeatured: false,
    isBestSeller: true,
    isNewArrival: false,
    isFlashSale: false,
    affiliateEnabled: true,
    commissionType: 'percentage',
    commissionValue: 10,
    seoTitle: 'Atomic Habits by James Clear Price in Pakistan | English Book',
    seoDescription: 'Buy Atomic Habits by James Clear in Pakistan. Best self-help book for building good habits with fast COD.',
    seoKeywords: 'atomic habits pakistan, james clear book, self help books online'
  }
];

export const INITIAL_COUPONS: Coupon[] = [
  {
    code: 'PAK10',
    discount: 10,
    type: 'percentage',
    minSpend: 2000,
    expiryDate: '2026-12-31'
  },
  {
    code: 'WELCOME500',
    discount: 500,
    type: 'fixed',
    minSpend: 3000,
    expiryDate: '2026-12-31'
  }
];

export const INITIAL_REVIEWS = [
  {
    id: 'r1',
    productId: 'p1',
    userName: 'Muhammad Ali',
    userEmail: 'ali@example.com',
    rating: 5,
    comment: 'Excellent watch! Screen quality is amazing and battery lasts almost 9 days. Highly recommended!',
    date: '2026-07-20'
  },
  {
    id: 'r2',
    productId: 'p2',
    userName: 'Usman Tariq',
    userEmail: 'usman@example.com',
    rating: 5,
    comment: 'The quality of the polymer hard shell is unmatched. Very comfortable for daily commuting.',
    date: '2026-07-22'
  }
];

export const INITIAL_BLOGS: BlogPost[] = [
  {
    id: 'b1',
    title: 'Top 5 Tech Accessories Every Professional Needs in Pakistan (2026)',
    slug: 'top-5-tech-accessories-2026-pakistan',
    excerpt: 'Discover the essential smartwatches, wireless audio gear, and ergonomic backpacks to boost productivity and protect tech gear in Pakistan.',
    content: `# Top 5 Tech Accessories Every Professional Needs in Pakistan (2026)

In 2026, modern professionals, freelancers, and entrepreneurs across Karachi, Lahore, Islamabad, and Faisalabad rely heavily on reliable, high-performance tech equipment to stay ahead. As hybrid work and remote freelancing continue to dominate Pakistan's digital economy, having the right gear is no longer a luxury—it is essential for career success.

Here is our comprehensive guide to the top 5 essential tech accessories every Pakistani professional should own this year.

## 1. Ergonomic Flexible Hard Shell Laptop Backpack

Carrying an expensive laptop, power bank, and smart devices through daily commutes on motorcycles, ride-hailing services, or public transit requires serious impact protection. The [Flexible Hard Shell Laptop Backpack](/products/p2) is manufactured in Pakistan with high-density polymer blends (PP, HDPE, and ABS) that absorb shocks, resist torrential rain, and keep tech assets safe.

### Key Advantages for Commuters:
- Dedicated padded compartment fitting laptops up to 15.6 inches.
- Ergonomic breathable back padding designed specifically for hot summer commutes in Lahore and Karachi.
- Concealed anti-theft compartments for passports, wallets, and CNICs.

## 2. Active Noise-Cancelling (ANC) Wireless Earbuds

Open-plan offices and bustling home workspaces can be noisy. Investing in high-grade Bluetooth earbuds with active noise cancellation allows seamless client meetings on Zoom, Google Meet, and WhatsApp.

### Essential Specifications to Look For:
- Bluetooth 5.3 with ultra-low latency for crisp voice calls.
- Minimum 28-hour cumulative battery life with fast Type-C charging.
- IPX4 water and sweat resistance for high humidity.

## 3. GaN 65W Fast Charger & 20,000mAh Power Bank

Frequent power fluctuations and on-the-go meetings make a compact Gallium Nitride (GaN) charger a must-have. A single 65W GaN plug can fast-charge your MacBook or Windows laptop, smartphone, and smartwatch simultaneously.

## 4. Multi-Port USB-C Hub & Display Adapter

Modern ultrabooks often feature only two Type-C ports. A multi-port hub brings back HDMI 4K output, SD card readers for content creators, Gigabit Ethernet, and USB 3.0 ports.

## 5. Wireless Ergonomic Mouse & Mechanical Keyboard

Long hours of coding, trading, or data entry can cause repetitive strain injury (RSI). Switching to an ergonomic vertical mouse and a tactile keyboard boosts typing speed while reducing wrist fatigue.

## Comparison Summary Table

| Accessory | Ideal User | Expected Price (PKR) | Primary Benefit |
| Flexible Hard Shell Backpack | Commuters & Travelers | Rs. 4,500 - 6,500 | Waterproof Impact Protection |
| ANC Wireless Earbuds | Remote Workers | Rs. 3,500 - 8,000 | Crystal Clear Client Meetings |
| 65W GaN Fast Charger | Digital Nomads | Rs. 2,800 - 4,500 | Rapid Multi-Device Charging |
| Multi-Port USB-C Hub | Designers & Coders | Rs. 2,500 - 5,000 | Universal Connectivity |
| Ergonomic Mouse | Office Executives | Rs. 1,800 - 3,500 | Wrist Comfort & Speed |

## Conclusion & Buying Advice

Investing in professional tech gear pays dividends in daily productivity and device longevity. Explore our full catalog at the [Pak-Tajarat Products Store](/products) or reach out to our team via [Pak-Tajarat WhatsApp Support](https://wa.me/923261604808) for wholesale trade assistance.`,
    coverImage: 'https://images.unsplash.com/photo-1542496658-e33a6d0d50f6?auto=format&fit=crop&w=800&q=80',
    category: 'Electronics',
    author: 'Pak-Tajarat Team',
    authorTitle: 'Official E-Commerce Editorial',
    authorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
    date: '2026-07-25',
    readTime: '4 min read',
    tags: ['Tech', 'Smartwatch', 'Pakistan', 'Productivity'],
    focusKeyword: 'tech accessories pakistan 2026',
    metaTitle: 'Top 5 Tech Accessories Every Professional Needs in Pakistan (2026)',
    metaDescription: 'Essential tech accessories guide for professionals in Pakistan.',
    metaKeywords: 'tech accessories, smart watch pakistan, electronic gadgets online',
    isPublished: true,
    language: 'en',
    status: 'Published',
    isFeatured: true
  },
  {
    id: 'b2',
    title: 'Flexible Hard Shell Laptop Backpack: The Ultimate Protection Guide for Pakistan (2026)',
    slug: 'flexible-hard-shell-laptop-backpack-pakistan-guide',
    excerpt: 'Complete engineering review and buying guide for the Flexible Hard Shell Laptop Backpack proudly manufactured in Pakistan with shockproof polymer protection.',
    content: `# Flexible Hard Shell Laptop Backpack: The Ultimate Protection Guide for Pakistan (2026)

When commuting through bustling urban traffic in Karachi, Lahore, Rawalpindi, or Peshawar, standard cloth and polyester backpacks often fail to safeguard high-value laptops against accidental drops, pressure in crowded transit, and unpredictable monsoon rains.

The [Flexible Hard Shell Laptop Backpack](/products/p2) represents a breakthrough in local Pakistani industrial manufacturing, combining aviation-grade engineering polymers with modern ergonomic aesthetics.

## Why Polymer Engineering Matters for Daily Commutes

Traditional fabric bags absorb moisture and compress under external forces. In contrast, the flexible hard shell utilizes a proprietary blend of:
- **PP Homopolymer**: Delivers high structural rigidity and shape retention.
- **HDPE & LLDPE**: Adds flexible impact absorption so the shell bends without cracking under severe blunt force.
- **ABS & Elastomer**: Imparts a sleek, scratch-resistant matte finish that resists dust and abrasions.

### Engineered Specifically for Pakistani Weather
Pakistani summers bring extreme heat and high UV exposure, while monsoon rains can ruin unprotected electronics in seconds. The polymer shell provides an impenetrable barrier against water splashes, dust storms, and heat buildup.

## Key Features & Storage Architecture

1. **Dedicated 15.6-Inch Tech Sleeve**: Ultra-soft fleece lining protects laptop aluminum unibodies from friction scratches.
2. **Ergonomic S-Curve Shoulder Straps**: Distributes weight evenly across the torso to prevent shoulder strain during long bike rides.
3. **Breathable Honeycomb Back Padding**: Allows continuous air ventilation, preventing sweaty backs during warm weather.
4. **Anti-Theft Hidden Compartments**: Zipper pulls and passport pockets are concealed against your back, preventing pickpocketing in crowded bazaars.

## Technical Specifications & Dimensions

| Feature | Specification | Engineering Standard |
| Shell Material | PP Homopolymer + HDPE + ABS | High-Impact Hybrid Polymer |
| Interior Volume | 24 Liters | Multi-Tier Organizer Compartments |
| Laptop Fit | Up to 15.6 Inch Ultrabooks & Gaming Laptops | Padded Shockproof Suspension |
| Water Resistance | IPX5 Weatherproof Shell | Sealed Waterproof Zippers |
| Origin | Proudly Engineered & Made in Pakistan | ISO-Standard Quality Control |

## Who Is This Backpack Built For?

- **University Students & Researchers**: Carrying textbooks, tablets, and laptops between university campuses.
- **Software Engineers & IT Freelancers**: Protecting high-end MacBooks and Windows machines during daily co-working commutes.
- **Motorcycle & Ride-Hailing Commuters**: Riding through dense city traffic where bags frequently brush against other vehicles or barriers.

## Where to Buy & Direct Wholesale Sourcing

Pak-Tajarat is the official distributor of the [Flexible Hard Shell Laptop Backpack | Made in Pakistan](/products/p2). We offer doorstep cash-on-delivery (COD) across 250+ cities in Pakistan, as well as bulk B2B wholesale rates for corporations and university societies.

Ready to upgrade your daily carry? View complete product details and place your order today at the [Flexible Hard Shell Laptop Backpack Product Page](/products/p2), or contact our sales specialists directly via [Pak-Tajarat WhatsApp Support](https://wa.me/923261604808).`,
    coverImage: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=800&q=80',
    category: 'Business Guides',
    author: 'Pak-Tajarat Editorial',
    authorTitle: 'Senior Market Analyst',
    authorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
    date: '2026-08-10',
    readTime: '5 min read',
    tags: ['Backpack', 'Made in Pakistan', 'Laptop Protection', 'Tech Accessories'],
    focusKeyword: 'flexible hard shell laptop backpack pakistan',
    metaTitle: 'Flexible Hard Shell Laptop Backpack | Buying Guide Pakistan 2026',
    metaDescription: 'Complete engineering review and buying guide for the Flexible Hard Shell Laptop Backpack proudly made in Pakistan.',
    metaKeywords: 'hard shell backpack pakistan, laptop backpack karachi lahore, shockproof bag',
    isPublished: true,
    language: 'en',
    status: 'Published',
    isFeatured: true
  }
];
