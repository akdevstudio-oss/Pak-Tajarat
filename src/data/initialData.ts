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
  {
    id: 'p2',
    name: 'Premium Flexible Hard Shell Laptop Backpack | Waterproof Business & Travel Backpack | Made in Pakistan',
    description: 'Experience premium protection and modern style with our Flexible Hard Shell Laptop Backpack, proudly manufactured in Pakistan. Engineered using a high-performance polymer blend of PP Homopolymer, HDPE, LLDPE, Elastomer, and ABS for impact resistance and ergonomic daily carry.',
    price: 3200,
    originalPrice: undefined,
    image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1622560480605-d83c853bc5c3?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1546938576-6e6a64f317cc?auto=format&fit=crop&w=800&q=80'
    ],
    category: 'Fashion',
    rating: 0,
    reviewsCount: 0,
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
    seoTitle: 'Premium Hard Shell Laptop Backpack | Made in Pakistan',
    seoDescription: 'Shop a premium flexible hard shell laptop backpack made in Pakistan for business, study and travel. Price Rs. 3,200. Check availability and delivery details at Pak-Tijarat.',
    seoKeywords: 'laptop backpack Pakistan, hard shell laptop backpack, business travel backpack, waterproof backpack Pakistan, Made in Pakistan'
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

export const INITIAL_REVIEWS = [];

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
