(function (global) {
  'use strict';

  const Luvra = (global.Luvra = global.Luvra || {});

  /**
   * Sample Luvra Catalog Data
   * -------------------------
   * Replace or extend items inside `products` to update the homepage,
   * Shop, Collection, Search, and Product Detail pages automatically.
   */
  const SHARED_SHIPPING =
    'Orders over $75 qualify for complimentary standard shipping. Every parcel arrives in a plain, unmarked matte outer box with a neutral return label.';
  const SHARED_RETURNS =
    'Unopened items in original sealed packaging may be returned within 30 days of delivery. Contact concierge@luvra.com for discreet return authorization.';
  const SHARED_WARRANTY =
    'Includes a 2-year Luvra Studio limited hardware warranty covering manufacturing defects under normal personal use.';

  Luvra.CATALOG = {
    products: [
      {
        id: 'velvet-enigma',
        name: 'Velvet Enigma',
        price: 148,
        category: 'for-her',
        categoryLabel: 'For Her',
        badge: 'Bestseller',
        featured: true,
        flagship: true,
        collections: ['featured', 'arsenal', 'bestsellers'],
        materials: ['Matte Silicone', 'Brushed Alloy'],
        features: ['Whisper Quiet', 'Warming', 'Sealed Housing', 'USB-C Rechargeable'],
        availability: 'in-stock',
        variants: [
          { label: 'Burgundy / Gold', swatch: '#5e2332' },
          { label: 'Obsidian / Gold', swatch: '#1d1a1f' },
        ],
        popularity: 98,
        releaseOrder: 7,
        image: 'assets/images/velvet-enigma.jpg',
        gallery: [
          { src: 'assets/images/velvet-enigma.jpg', alt: 'Velvet Enigma studio profile on dark basalt', label: 'Studio Profile' },
          { src: 'assets/images/discreet-packaging.jpg', alt: 'Velvet Enigma unmarked matte keepsake box', label: 'Presentation Box' },
          { src: 'assets/images/midnight-bloom.jpg', alt: 'Evening tonal pairing with dark botanicals', label: 'Editorial Mood' },
        ],
        shortDesc: 'Quiet 4-speed warming silicone contour wand.',
        fullDesc:
          'Sculpted in smooth matte silicone with a brushed champagne-gold tip. Engineered for gentle ambient warmth and quiet, balanced resonance during unhurried evening rituals.',
        specs: ['Matte Silicone', 'Quiet Motor', 'Sealed Housing', 'USB-C Magnetic'],
        details: {
          materials: 'Smooth matte-finished silicone exterior paired with a brushed champagne-toned alloy tip and internal polycarbonate core.',
          dimensions: '162 mm × 38 mm × 36 mm · Weight: 142 g · Compact nightstand footprint.',
          care: 'Rinse with lukewarm water and mild, fragrance-free cleanser before and after use. Pat dry with a lint-free cloth and store away from direct heat.',
          power: 'Internal rechargeable lithium-ion battery. Includes magnetic USB-C charging cable; approx. 90 minutes charge for up to 2 hours of runtime.',
          warranty: SHARED_WARRANTY,
          shipping: SHARED_SHIPPING,
          returns: SHARED_RETURNS,
        },
        reviews: [
          {
            author: 'Claire M.',
            date: 'October 2026',
            rating: 5,
            variant: 'Burgundy / Gold',
            comment: 'Unassuming on a nightstand and remarkably quiet. The matte finish feels effortless to hold and clean.',
          },
          {
            author: 'Hannah R.',
            date: 'September 2026',
            rating: 5,
            variant: 'Obsidian / Gold',
            comment: 'Subtle warmth builds gradually without feeling harsh, and the unmarked packaging felt genuinely thoughtful.',
          },
        ],
      },
      {
        id: 'aurelia-duo',
        name: 'Aurelia Duo',
        price: 185,
        category: 'couples',
        categoryLabel: 'Couples',
        badge: 'Couples',
        featured: false,
        flagship: true,
        collections: ['arsenal', 'featured', 'bestsellers'],
        materials: ['Matte Silicone', 'Brushed Alloy'],
        features: ['Whisper Quiet', 'Dual Motor', 'Sealed Housing', 'USB-C Rechargeable'],
        availability: 'in-stock',
        variants: [
          { label: 'Obsidian / Champagne', swatch: '#201d22' },
          { label: 'Espresso / Champagne', swatch: '#3d2a24' },
        ],
        popularity: 95,
        releaseOrder: 8,
        image: 'assets/images/aurelia-duo.jpg',
        gallery: [
          { src: 'assets/images/aurelia-duo.jpg', alt: 'Aurelia Duo intertwined sculptural form', label: 'Sculptural Form' },
          { src: 'assets/images/discreet-packaging.jpg', alt: 'Aurelia Duo matte black presentation box', label: 'Matte Packaging' },
          { src: 'assets/images/obsidian-pulse.jpg', alt: 'Matching brushed champagne hardware finish', label: 'Finish Detail' },
        ],
        shortDesc: 'Synchronized dual-wave sculptural couples piece.',
        fullDesc:
          'Designed to rest naturally between partners with a continuous sweeping curve. Dual independent motors offer balanced low-frequency settings with intuitive one-touch control.',
        specs: ['Dual Motors', 'Partner Ergonomics', '2.5h Battery', 'Travel Lock'],
        details: {
          materials: 'Velvety matte silicone body accented by a continuous brushed champagne-gold structural rib.',
          dimensions: '118 mm × 64 mm × 42 mm · Weight: 168 g · Flexible mid-arch.',
          care: 'Wash gently with warm water and mild soap; avoid alcohol-based or solvent cleaners. Allow to air dry completely before storing.',
          power: 'Dual-zone rechargeable battery with magnetic USB-C dock. Full charge in 110 minutes; travel lock engaged by holding the power button for 3 seconds.',
          warranty: SHARED_WARRANTY,
          shipping: SHARED_SHIPPING,
          returns: SHARED_RETURNS,
        },
        reviews: [
          {
            author: 'Elena & Marcus',
            date: 'October 2026',
            rating: 5,
            variant: 'Obsidian / Champagne',
            comment: 'Quiet enough that it never distracts, and the curved shape stays comfortable without needing constant adjustment.',
          },
          {
            author: 'Devon T.',
            date: 'August 2026',
            rating: 4,
            variant: 'Espresso / Champagne',
            comment: 'Beautiful object design and intuitive controls. Travel lock works reliably in luggage.',
          },
        ],
      },
      {
        id: 'obsidian-pulse',
        name: 'Obsidian Pulse',
        price: 155,
        category: 'for-him',
        categoryLabel: 'For Him',
        badge: 'New',
        featured: true,
        flagship: true,
        collections: ['featured', 'arsenal'],
        materials: ['Matte Silicone', 'Brushed Alloy'],
        features: ['Whisper Quiet', 'Warming', 'Dual Motor', 'Sealed Housing', 'USB-C Rechargeable'],
        availability: 'in-stock',
        variants: [
          { label: 'Matte Obsidian', swatch: '#18161a' },
          { label: 'Charcoal Slate', swatch: '#353238' },
        ],
        popularity: 93,
        releaseOrder: 10,
        image: 'assets/images/obsidian-pulse.jpg',
        gallery: [
          { src: 'assets/images/obsidian-pulse.jpg', alt: 'Obsidian Pulse resting on dark slate', label: 'Studio View' },
          { src: 'assets/images/aurelia-duo.jpg', alt: 'Complementary matte silicone and brushed alloy texture', label: 'Alloy Contrast' },
          { src: 'assets/images/discreet-packaging.jpg', alt: 'Obsidian Pulse unbranded gift box', label: 'Discreet Box' },
        ],
        shortDesc: 'Compact precision resonance with subtle warming.',
        fullDesc:
          'An architectural silhouette pairing matte obsidian silicone with a weighted brushed champagne-gold grip loop for effortless balance, tactile control, and deep low-frequency rhythm.',
        specs: ['Dual-Motion Engine', 'Subtle Warmth', 'Weighted Alloy Ring', 'Sealed Body'],
        details: {
          materials: 'Soft-touch matte silicone paired with a weighted brushed zinc-alloy handle loop.',
          dimensions: '134 mm × 54 mm × 44 mm · Weight: 194 g · Balanced ring grip.',
          care: 'Clean with lukewarm water and gentle toy-safe or mild liquid soap. Dry thoroughly before placing on the charging dock.',
          power: 'USB-C magnetic recharge (cable included). Offers up to 100 minutes of continuous operation with integrated low-battery indicator.',
          warranty: SHARED_WARRANTY,
          shipping: SHARED_SHIPPING,
          returns: SHARED_RETURNS,
        },
        reviews: [
          {
            author: 'Julian S.',
            date: 'November 2026',
            rating: 5,
            variant: 'Matte Obsidian',
            comment: 'The weighted gold loop gives it far better balance than anything plastic. Feels like a piece of studio audio gear.',
          },
        ],
      },
      {
        id: 'crimson-silk-elixir',
        name: 'Crimson Silk Elixir',
        price: 64,
        category: 'wellness',
        categoryLabel: 'Wellness',
        badge: 'Organic',
        featured: false,
        flagship: true,
        collections: ['bestsellers'],
        materials: ['Amber Glass', 'Botanical Extracts'],
        features: ['Silicone-Safe', 'Unscented Base'],
        availability: 'in-stock',
        variants: [
          { label: '100 ml' },
          { label: '50 ml Travel' },
        ],
        popularity: 91,
        releaseOrder: 6,
        image: 'assets/images/crimson-elixir.jpg',
        gallery: [
          { src: 'assets/images/crimson-elixir.jpg', alt: 'Crimson Silk Elixir faceted amber glass bottle', label: 'Bottle Profile' },
          { src: 'assets/images/midnight-bloom.jpg', alt: 'Dark orchid botanical inspiration', label: 'Botanical Notes' },
          { src: 'assets/images/discreet-packaging.jpg', alt: 'Matte black unbranded shipping box', label: 'Packaging' },
        ],
        shortDesc: 'Cold-pressed botanical body & massage oil.',
        fullDesc:
          'A weightless blend of cold-pressed camellia seed, black currant, and warm sandalwood notes housed in heavy UV-protected amber glass with a brushed brass cap.',
        specs: ['Botanical Blend', 'Light Slip', 'Amber Glass', 'Unscented Base'],
        details: {
          materials: 'Cold-pressed Camellia Oleifera seed oil, Simmondsia Chinensis (jojoba), and delicate cedar-sandalwood botanical distillate in heavy amber glass.',
          dimensions: '100 ml: 112 mm height × 52 mm diameter · 50 ml Travel: 90 mm height × 42 mm diameter.',
          care: 'Store upright in a cool, dark cabinet with the brushed cap secured. Wipe bottle neck clean after pouring.',
          power: null,
          warranty: 'Fresh-batch guarantee: replace within 30 days if the seal arrives damaged in transit.',
          shipping: SHARED_SHIPPING,
          returns: SHARED_RETURNS,
        },
        reviews: [
          {
            author: 'Sophie K.',
            date: 'October 2026',
            rating: 5,
            variant: '100 ml',
            comment: 'Absorbs gracefully without feeling greasy, and the faceted glass bottle looks refined beside bath products.',
          },
          {
            author: 'Nadia L.',
            date: 'September 2026',
            rating: 5,
            variant: '50 ml Travel',
            comment: 'Subtle dry wood scent—never overpowering. Great travel size for weekend trips.',
          },
        ],
      },
      {
        id: 'midnight-bloom-oil',
        name: 'Midnight Bloom',
        price: 58,
        category: 'wellness',
        categoryLabel: 'Wellness',
        badge: 'New Collection',
        featured: true,
        flagship: false,
        editorialOnly: true,
        collections: ['featured'],
        materials: ['Amber Glass', 'Botanical Extracts'],
        features: ['Warming', 'Silicone-Safe'],
        availability: 'in-stock',
        variants: [
          { label: '90 ml Dropper' },
          { label: '30 ml Discovery' },
        ],
        popularity: 88,
        releaseOrder: 9,
        image: 'assets/images/midnight-bloom.jpg',
        gallery: [
          { src: 'assets/images/midnight-bloom.jpg', alt: 'Midnight Bloom dark orchid botanical study', label: 'Botanical Study' },
          { src: 'assets/images/crimson-elixir.jpg', alt: 'Amber apothecary bottle aesthetic', label: 'Glass Vessel' },
          { src: 'assets/images/discreet-packaging.jpg', alt: 'Unbranded matte gift box', label: 'Gift Box' },
        ],
        shortDesc: 'Sensuous massage oil and warm skin aromatics.',
        fullDesc:
          'Infused with night-blooming orchid extract, organic jojoba, and white cedar for unhurried evening rituals and lasting skin softness.',
        specs: ['Plant-Based Oils', 'Fast-Absorbing', 'Subtle Aroma', 'Glass Dropper'],
        details: {
          materials: 'Fractionated botanical lipids, organic jojoba, sweet almond, and white cedar oil inside dark glass with precision pipette.',
          dimensions: '90 ml Dropper: 118 mm × 46 mm · 30 ml Discovery: 88 mm × 34 mm.',
          care: 'Keep dropper tip clean; store below 25°C out of direct sunlight.',
          power: null,
          warranty: 'Fresh-batch guarantee: replace within 30 days if the seal arrives damaged.',
          shipping: SHARED_SHIPPING,
          returns: SHARED_RETURNS,
        },
        reviews: [
          {
            author: 'Amara P.',
            date: 'November 2026',
            rating: 5,
            variant: '90 ml Dropper',
            comment: 'Leaves skin velvet-soft with a quiet floral warmth that fades gently by morning.',
          },
        ],
      },
      {
        id: 'satin-whisper',
        name: 'Satin Whisper',
        price: 138,
        category: 'for-her',
        categoryLabel: 'For Her',
        badge: 'Silk Touch',
        featured: false,
        flagship: false,
        collections: ['bestsellers'],
        materials: ['Matte Silicone'],
        features: ['Whisper Quiet', 'Sealed Housing', 'USB-C Rechargeable'],
        availability: 'in-stock',
        variants: [
          { label: 'Deep Plum', swatch: '#4a1d2a' },
          { label: 'Warm Taupe', swatch: '#7c6960' },
        ],
        popularity: 86,
        releaseOrder: 5,
        image: 'assets/images/velvet-enigma.jpg',
        gallery: [
          { src: 'assets/images/velvet-enigma.jpg', alt: 'Satin Whisper sculpted silhouette', label: 'Silhouette' },
          { src: 'assets/images/discreet-packaging.jpg', alt: 'Satin Whisper matte black box', label: 'Presentation' },
        ],
        shortDesc: 'Featherlight air-pulse stimulator in deep plum.',
        fullDesc:
          'Delivers gentle non-contact pulse settings across six calibrated intensities, finished in our signature velvety soft-touch exterior.',
        specs: ['6 Pulse Modes', 'Soft-Touch Finish', 'Quiet Seal', '2-Year Warranty'],
        details: {
          materials: 'Seamless matte silicone exterior with an internal sealed acoustic chamber.',
          dimensions: '108 mm × 42 mm × 35 mm · Weight: 112 g.',
          care: 'Rinse gently after use with mild unscented soap and lukewarm water; air dry.',
          power: 'USB-C magnetic charger included; 75 minutes charge for up to 90 minutes runtime.',
          warranty: SHARED_WARRANTY,
          shipping: SHARED_SHIPPING,
          returns: SHARED_RETURNS,
        },
        reviews: [
          {
            author: 'Maya V.',
            date: 'September 2026',
            rating: 5,
            variant: 'Deep Plum',
            comment: 'Compact, featherlight, and easy to travel with.',
          },
        ],
      },
      {
        id: 'noir-contour',
        name: 'Noir Contour',
        price: 165,
        category: 'for-him',
        categoryLabel: 'For Him',
        badge: 'Precision',
        featured: false,
        flagship: false,
        collections: ['arsenal'],
        materials: ['Matte Silicone', 'Brushed Alloy'],
        features: ['Whisper Quiet', 'Sealed Housing', 'USB-C Rechargeable'],
        availability: 'in-stock',
        variants: [
          { label: 'Matte Black', swatch: '#171519' },
          { label: 'Smoked Bronze', swatch: '#4a3c35' },
        ],
        popularity: 82,
        releaseOrder: 4,
        image: 'assets/images/obsidian-pulse.jpg',
        gallery: [
          { src: 'assets/images/obsidian-pulse.jpg', alt: 'Noir Contour matte silhouette', label: 'Profile' },
          { src: 'assets/images/discreet-packaging.jpg', alt: 'Noir Contour discreet box', label: 'Keepsake Box' },
        ],
        shortDesc: 'Ergonomic deep-rumble ring & contour piece.',
        fullDesc:
          'Crafted for tailored comfort with a flexible matte-black silicone frame and balanced low-frequency resonance.',
        specs: ['Flexible Frame', 'Deep Frequency', 'Matte Silicone', 'Magnetic Charge'],
        details: {
          materials: 'Flexible matte silicone ring housing a brushed alloy control bezel.',
          dimensions: '92 mm × 48 mm × 30 mm · Weight: 98 g.',
          care: 'Wash with lukewarm water and mild soap; store in the included breathable cotton pouch.',
          power: 'Magnetic USB-C charging cable included; 60 minutes recharge time.',
          warranty: SHARED_WARRANTY,
          shipping: SHARED_SHIPPING,
          returns: SHARED_RETURNS,
        },
        reviews: [
          {
            author: 'Liam C.',
            date: 'August 2026',
            rating: 4,
            variant: 'Matte Black',
            comment: 'Very comfortable flex and stays quiet across every setting.',
          },
        ],
      },
      {
        id: 'evening-ritual-set',
        name: 'Evening Ritual Set',
        price: 210,
        category: 'couples',
        categoryLabel: 'Couples',
        badge: 'Limited',
        featured: false,
        flagship: false,
        collections: ['featured', 'bestsellers'],
        materials: ['Matte Silicone', 'Amber Glass', 'Brushed Alloy'],
        features: ['Dual Motor', 'Whisper Quiet', 'Silicone-Safe', 'USB-C Rechargeable'],
        availability: 'in-stock',
        variants: [
          { label: 'Signature Matte Box', swatch: '#1c191d' },
          { label: 'Burgundy Linen Ribbon', swatch: '#52202d' },
        ],
        popularity: 90,
        releaseOrder: 8,
        image: 'assets/images/discreet-packaging.jpg',
        gallery: [
          { src: 'assets/images/discreet-packaging.jpg', alt: 'Evening Ritual Set matte presentation box', label: 'Presentation' },
          { src: 'assets/images/aurelia-duo.jpg', alt: 'Aurelia Duo included inside set', label: 'Aurelia Duo' },
          { src: 'assets/images/crimson-elixir.jpg', alt: 'Full-size Crimson Silk Elixir included', label: 'Silk Elixir' },
        ],
        shortDesc: 'Unmarked matte keepsake box with Aurelia Duo & Elixir.',
        fullDesc:
          'Our signature gifting presentation pairing the Aurelia Duo with full-size Crimson Silk Elixir inside an unbranded matte charcoal linen keepsake box.',
        specs: ['Gift-Ready Box', 'Aurelia Duo Included', 'Full-Size Elixir', 'Discreet Wrap'],
        details: {
          materials: 'Includes Aurelia Duo (silicone & brushed alloy), 100 ml Crimson Silk Elixir (amber glass), and rigid linen-wrapped keepsake box.',
          dimensions: 'Box dimensions: 210 mm × 210 mm × 95 mm.',
          care: 'Clean Aurelia Duo with mild soap and water after use; store bottle upright inside the recessed box tray.',
          power: 'Includes magnetic USB-C charging cable for the Aurelia Duo.',
          warranty: SHARED_WARRANTY,
          shipping: SHARED_SHIPPING,
          returns: SHARED_RETURNS,
        },
        reviews: [
          {
            author: 'Camille & Theo',
            date: 'November 2026',
            rating: 5,
            variant: 'Signature Matte Box',
            comment: 'Ordered as an anniversary gift—the unbranded matte box and candlelit feel exceeded every expectation.',
          },
        ],
      },
      {
        id: 'solstice-mist',
        name: 'Solstice Linen & Skin Mist',
        price: 52,
        category: 'wellness',
        categoryLabel: 'Wellness',
        badge: 'Restocking',
        featured: false,
        flagship: false,
        collections: ['featured'],
        materials: ['Amber Glass', 'Botanical Extracts'],
        features: ['Silicone-Safe', 'Unscented Base'],
        availability: 'waitlist',
        variants: [{ label: '75 ml Mist' }],
        popularity: 79,
        releaseOrder: 3,
        image: 'assets/images/crimson-elixir.jpg',
        gallery: [
          { src: 'assets/images/crimson-elixir.jpg', alt: 'Solstice Linen & Skin Mist glass bottle', label: 'Apothecary Bottle' },
          { src: 'assets/images/midnight-bloom.jpg', alt: 'Botanical ingredients mood', label: 'Botanical Profile' },
        ],
        shortDesc: 'Smoked fig, vetiver, and bergamot evening mist.',
        fullDesc:
          'An atmospheric mist formulated for fine linens and pulse points, blending smoked fig leaf with dry Haitian vetiver in dark apothecary glass.',
        specs: ['Alcohol-Free', 'Small-Batch', '75 ml Atomizer', 'Zero Staining'],
        details: {
          materials: 'Distilled botanical hydrosol, smoked fig leaf extract, Haitian vetiver, and bergamot in heavy amber glass.',
          dimensions: '124 mm height × 46 mm diameter · 75 ml.',
          care: 'Mist lightly from 20 cm onto linens or skin; store away from direct sunlight.',
          power: null,
          warranty: 'Fresh-batch guarantee: replace within 30 days if damaged in transit.',
          shipping: SHARED_SHIPPING,
          returns: SHARED_RETURNS,
        },
        reviews: [
          {
            author: 'Isabelle N.',
            date: 'September 2026',
            rating: 5,
            variant: '75 ml Mist',
            comment: 'Warm, grounded, and never sweet—instantly transforms bedroom linens.',
          },
        ],
      },
      {
        id: 'nocturne-keepsake-case',
        name: 'Nocturne Sanctuary Box',
        price: 92,
        category: 'couples',
        categoryLabel: 'Couples',
        badge: 'Waitlist',
        featured: false,
        flagship: false,
        collections: ['arsenal'],
        materials: ['Brushed Alloy', 'Botanical Extracts'],
        features: ['Warming', 'USB-C Rechargeable'],
        availability: 'waitlist',
        variants: [
          { label: 'Charcoal Velvet', swatch: '#282228' },
          { label: 'Oxblood Velvet', swatch: '#4a1d2a' },
        ],
        popularity: 84,
        releaseOrder: 2,
        image: 'assets/images/discreet-packaging.jpg',
        gallery: [
          { src: 'assets/images/discreet-packaging.jpg', alt: 'Nocturne Sanctuary Box matte exterior', label: 'Matte Exterior' },
        ],
        shortDesc: 'Velvet-lined travel & bedside sanctuary box.',
        fullDesc:
          'Discreet matte-black rigid storage sanctuary with subtle magnetic clasp, removable velvet dividers, and hidden cable compartment.',
        specs: ['Discreet Clasp', 'Velvet Dividers', 'Cable Tray', 'Rigid Shell'],
        details: {
          materials: 'Rigid matte-laminated bookboard shell, brushed alloy clasp, and removable charcoal or oxblood velvet tray inserts.',
          dimensions: '220 mm × 180 mm × 85 mm · Weight: 460 g.',
          care: 'Dust exterior with a dry microfiber cloth; spot-clean velvet dividers lightly as needed.',
          power: 'Includes internal pass-through channel for routing your USB-C charging cable cleanly.',
          warranty: SHARED_WARRANTY,
          shipping: SHARED_SHIPPING,
          returns: SHARED_RETURNS,
        },
        reviews: [
          {
            author: 'Rachel G.',
            date: 'August 2026',
            rating: 5,
            variant: 'Charcoal Velvet',
            comment: 'Looks like a minimal jewelry box on my dresser and keeps charging cables completely hidden.',
          },
        ],
      },
    ],

    collectionMeta: {
      all: {
        kicker: 'Luvra Archive',
        title: 'All <em>Collections</em>',
        description:
          'Explore every Luvra piece—crafted in matte silicone, brushed champagne alloy, and botanical glass.',
      },
      'for-her': {
        kicker: 'Desire Edit · For Her',
        title: 'Solo Rituals & <em>Warmth</em>',
        description:
          'Quiet contours and ambient warming finishes engineered for unhurried personal rituals.',
      },
      'for-him': {
        kicker: 'Desire Edit · For Him',
        title: 'Sculpted <em>Precision</em>',
        description:
          'Balanced low-frequency resonance and architectural alloy ergonomics designed with quiet restraint.',
      },
      couples: {
        kicker: 'Desire Edit · Couples',
        title: 'Shared <em>Connection</em>',
        description:
          'Synchronized dual-motor silhouettes and keepsake sets crafted to move effortlessly between partners.',
      },
      wellness: {
        kicker: 'Desire Edit · Wellness',
        title: 'Oils & Pure <em>Elixirs</em>',
        description:
          'Cold-pressed botanical oils and evening aromatics in dark UV-protected glass.',
      },
      arsenal: {
        kicker: 'Curated Line',
        title: 'The <em>Arsenal</em>',
        description:
          'Our flagship architectural instruments—engineered with quiet balance in understated matte finishes.',
      },
      featured: {
        kicker: 'Seasonal Curation',
        title: 'Featured <em>Edit</em>',
        description:
          'New releases, limited gifting editions, and our most-loved signatures in one curated view.',
      },
      bestsellers: {
        kicker: 'Client Favorites',
        title: 'Most <em>Loved</em>',
        description:
          'Quiet icons consistently chosen by Luvra members for materiality, discretion, and longevity.',
      },
    },

    filterOptions: {
      categories: [
        { slug: 'for-her', label: 'For Her' },
        { slug: 'for-him', label: 'For Him' },
        { slug: 'couples', label: 'Couples' },
        { slug: 'wellness', label: 'Wellness' },
      ],
      priceRanges: [
        { id: 'under-75', label: 'Under $75', min: 0, max: 74.99 },
        { id: '75-150', label: '$75 – $150', min: 75, max: 150 },
        { id: 'over-150', label: '$150+', min: 150.01, max: Infinity },
      ],
      materials: [
        'Matte Silicone',
        'Brushed Alloy',
        'Amber Glass',
        'Botanical Extracts',
      ],
      features: [
        'Whisper Quiet',
        'Warming',
        'Sealed Housing',
        'Dual Motor',
        'USB-C Rechargeable',
        'Silicone-Safe',
      ],
      availability: [
        { id: 'in-stock', label: 'In Stock Only' },
        { id: 'waitlist', label: 'Waitlist / Restocking' },
      ],
    },

    searchSuggestions: [
      'Velvet Enigma',
      'Couples',
      'Warming',
      'Botanical Oil',
      'Whisper Quiet',
      'Obsidian Pulse',
    ],

    featuredEdit: [
      {
        type: 'editorial',
        id: 'midnight-bloom-oil',
        badge: 'New Collection',
        title: 'Midnight Bloom',
        desc: 'Sensuous massage oil and warm skin aromatics.',
        image: 'assets/images/midnight-bloom.jpg',
        ctaLabel: 'Explore Line',
        targetCategory: 'wellness',
      },
      {
        type: 'product',
        id: 'obsidian-pulse',
        badge: 'Newest Arrival',
      },
      {
        type: 'product',
        id: 'velvet-enigma',
        badge: 'Most Sold',
      },
      {
        type: 'product',
        id: 'aurelia-duo',
        badge: 'Couples Edit',
      },
    ],

    arsenal: [
      {
        id: 'obsidian-pulse',
        title: 'Obsidian Pulse',
        subtitle: 'Dual-motion resonance engine',
        price: 155,
        image: 'assets/images/obsidian-pulse.jpg',
        lead: true,
      },
      {
        id: 'aurelia-duo',
        title: 'Aurelia Duo',
        subtitle: 'Synchronized couples wave',
        price: 185,
        image: 'assets/images/aurelia-duo.jpg',
        lead: false,
      },
      {
        id: 'velvet-enigma',
        title: 'Velvet Enigma',
        subtitle: 'Whisper-quiet velvet wand',
        price: 148,
        image: 'assets/images/velvet-enigma.jpg',
        lead: false,
      },
    ],

    categories: [
      {
        slug: 'for-her',
        name: 'For Her',
        subtitle: 'Solo rituals & warmth',
        icon: 'spark',
      },
      {
        slug: 'for-him',
        name: 'For Him',
        subtitle: 'Sculpted precision',
        icon: 'shield',
      },
      {
        slug: 'couples',
        name: 'Couples',
        subtitle: 'Shared connection',
        icon: 'rings',
      },
      {
        slug: 'wellness',
        name: 'Wellness',
        subtitle: 'Oils & pure elixirs',
        icon: 'drop',
      },
    ],

    promises: [
      {
        title: 'Discreet Delivery',
        desc: 'Plain, unmarked matte packaging.',
        icon: 'box',
      },
      {
        title: 'Whisper Quiet',
        desc: 'Tuned for low-acoustic resonance.',
        icon: 'sound',
      },
      {
        title: 'Body-Safe Materials',
        desc: 'Smooth matte silicone & amber glass.',
        icon: 'check',
      },
      {
        title: 'Private Billing',
        desc: 'Shown as "LUVRA WELLNESS" on statements.',
        icon: 'lock',
      },
    ],

    testimonials: [
      {
        quote:
          '“Everything arrived in a plain matte box with zero logos—it feels like unboxing fine fragrance rather than anything clinical.”',
        author: 'Claire M.',
        product: 'Velvet Enigma',
      },
      {
        quote:
          '“Whisper quiet and genuinely architectural. We love that the bank statement showed only a neutral wellness name.”',
        author: 'Elena & Marcus',
        product: 'Aurelia Duo',
      },
      {
        quote:
          '“The understated design blends right onto a nightstand, and the botanical elixir feels extraordinary on skin.”',
        author: 'Sophie K.',
        product: 'Crimson Silk Elixir',
      },
    ],

    commerce: {
      freeShippingThreshold: 75,
      standardShippingRate: 12,
      expressShippingRate: 24,
      estimatedTaxRate: 0.08,
      promoCodes: [
        {
          code: 'LUVRA10',
          type: 'percent',
          value: 10,
          minSubtotal: 0,
          description: '10% off your order',
        },
        {
          code: 'WELCOME15',
          type: 'fixed',
          value: 15,
          minSubtotal: 100,
          description: '$15 off orders $100+',
        },
      ],
    },

    siteConfig: {
      ageGate: {
        enabled: true,
        minimumAge: 18,
        rememberDays: 30,
        title: 'Age Confirmation',
        message: 'Luvra features intimate wellness products intended for adults 18 and older.',
        confirmLabel: 'I am 18 or older',
        declineLabel: 'Exit',
      },
      privacyDefaults: {
        packageExterior:
          'Orders ship in plain, unmarked matte outer packaging with a neutral sender label and no product names on the exterior.',
        billingDescriptor:
          'LUVRA WELLNESS (exact statement wording may vary by card issuer and processor configuration).',
        returnWindowDays: 30,
        supportEmail: 'concierge@luvra.com',
        supportPhone: '+1 (212) 555-0194',
        supportHours: 'Mon–Sat, 10am–7pm EST',
        studioAddress: '418 Crosby Street, SoHo, New York, NY 10012',
      },
    },
  };
})(window);
