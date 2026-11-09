import { CategoryItem, MediaItem, MonetizationSettings, NyoleTransaction, SitePagesContent, SubscriptionPlan, User } from '../types';

export const EXCLUSIVE_SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
  {
    id: 'plan_monthly',
    name: 'Abonnement Exclusif Mensuel',
    price: 9.99,
    currency: 'EUR',
    interval: 'month',
    description: 'Accès illimité à l\'intégralité des vidéos exclusives, séries 8K RAW et masterclasses.',
    features: [
      'Déverrouillage immédiat de 100% du catalogue vidéo exclusif',
      'Téléchargements directs des masters RAW 8K & profils DaVinci',
      'Lecture vidéo sans compression ProRes 4444 XQ',
      'Suppression intégrale de toutes les bannières publicitaires',
      'Résiliation en 1 clic sans engagement'
    ],
    popular: true
  },
  {
    id: 'plan_yearly',
    name: 'Abonnement Exclusif Annuel',
    price: 79.99,
    currency: 'EUR',
    interval: 'year',
    description: 'La formule ultime : bénéficiez de 2 mois gratuits sur vos accès exclusifs.',
    features: [
      'Tous les avantages de l\'abonnement mensuel',
      'Économisez plus de 33% (2 mois offerts)',
      'Accès prioritaire aux nouvelles sorties exclusives',
      'Badge Membre Fondateur Exclusif'
    ],
    popular: false
  }
];

export const INITIAL_CATEGORIES: CategoryItem[] = [
  { id: 'cat_all', name: 'Tous les Médias', slug: 'tous', count: 6 },
  { id: 'cat_cinema', name: 'Cinéma & Vidéo', slug: 'cinema', count: 2 },
  { id: 'cat_masterclass', name: 'Masterclasses & Tutos', slug: 'masterclasses', count: 1 },
  { id: 'cat_cyberpunk', name: 'Cyberpunk & Sci-Fi', slug: 'cyberpunk', count: 1 },
  { id: 'cat_mode', name: 'Mode & Haute Couture', slug: 'mode', count: 1 },
  { id: 'cat_nature', name: 'Nature & Paysages', slug: 'nature', count: 1 },
  { id: 'cat_photo', name: 'Photographie RAW', slug: 'photo', count: 1 }
];

export const INITIAL_MEDIA_ITEMS: MediaItem[] = [
  {
    id: 'med_001',
    title: 'Neon Odyssey : Cyberpunk Tokyo Nocturne',
    description: 'Immersion cinématographique 8K RAW à travers les ruelles néon de Shinjuku et Akihabara sous une pluie torrentielle. Étalonnage DaVinci Resolve avec profils de couleurs exclusifs.',
    type: 'video',
    access: 'exclusive',
    price: 4.99,
    currency: 'EUR',
    category: 'Cyberpunk & Sci-Fi',
    categories: ['Cyberpunk & Sci-Fi', 'Cinéma & Vidéo'],
    tags: ['8K RAW', 'DaVinci LUT', 'Cinematic', 'Exclusive'],
    thumbnailUrl: '/src/assets/images/media_cyber_tokyo_1793938277681.jpg',
    mediaUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
    previewVideoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
    duration: '18:45',
    resolution: '8K ProRes 4444 XQ',
    author: {
      name: 'Kenji Takahashi',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=160&q=80',
      verified: true,
    },
    viewsCount: 14280,
    likesCount: 1845,
    unlockedCount: 320,
    createdAt: '2026-03-20T10:00:00Z',
    exclusivePerks: ['Téléchargement RAW 8K sans compression', 'Pack de 5 LUTs DaVinci Resolve inclus', 'Fiche technique des réglages caméra']
  },
  {
    id: 'med_002',
    title: 'Métamorphose Métallique : Haute Couture 2026',
    description: 'Série photographique et teaser visuel haute définition capturant la fusion entre soie sculpturale et finitions chrome liquide. Exposition pour magazine international de mode.',
    type: 'video',
    access: 'exclusive',
    price: 3.50,
    currency: 'EUR',
    category: 'Mode & Haute Couture',
    categories: ['Mode & Haute Couture'],
    tags: ['Haute Couture', 'Fine Art', 'Editorial', 'Masterclass'],
    thumbnailUrl: '/src/assets/images/media_fashion_avantgarde_1793938278959.jpg',
    mediaUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    previewVideoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    duration: '08:14',
    resolution: '61 MP DNG Master / 4K Video',
    author: {
      name: 'Elena Rostova',
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=160&q=80',
      verified: true,
    },
    viewsCount: 22100,
    likesCount: 3410,
    unlockedCount: 480,
    createdAt: '2026-03-18T14:30:00Z',
    exclusivePerks: ['Fichiers Hasselblad RAW 16-bit pleine résolution', 'Licence d’exploitation commerciale limitée', 'Accès au making-of studio']
  },
  {
    id: 'med_003',
    title: 'Aurore Boréale & Plages Volcaniques d\'Islande',
    description: 'Séquence aérienne 4K HDR capturée au-dessus des formations de Reynisdrangar sous une aurore de niveau G4. Prise de vue nocturne ultra haute sensibilité.',
    type: 'video',
    access: 'free',
    price: 0,
    currency: 'EUR',
    category: 'Nature & Paysages',
    categories: ['Nature & Paysages'],
    tags: ['4K HDR', 'Nature', 'Drone', 'Gratuit'],
    thumbnailUrl: '/src/assets/images/media_nature_aurora_1793938279117.jpg',
    mediaUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    previewVideoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    duration: '06:12',
    resolution: '4K DCI 60fps',
    author: {
      name: 'Lukas Lindqvist',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=160&q=80',
      verified: true,
    },
    viewsCount: 38920,
    likesCount: 5120,
    unlockedCount: 0,
    createdAt: '2026-03-15T09:15:00Z',
    exclusivePerks: ['Vidéo complète en libre accès', 'Bande son spatiale stéréo Dolby Atmos']
  },
  {
    id: 'med_004',
    title: 'Masterclass : Étalonnage Cinéma & Workflow Studio',
    description: 'Session exclusive de 45 minutes en studio de post-production. Analyse plan par plan de l\'éclairage de plateau, des masques dynamiques et de la colorimétrie de longs métrages primés.',
    type: 'video',
    access: 'exclusive',
    price: 8.99,
    currency: 'EUR',
    category: 'Cinéma & Vidéo',
    categories: ['Cinéma & Vidéo', 'Masterclasses & Tutos'],
    tags: ['Masterclass', 'Post-Prod', 'ProRes', 'VIP'],
    thumbnailUrl: '/src/assets/images/hero_cinematic_creator_1793938277680.jpg',
    mediaUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
    previewVideoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
    duration: '42:18',
    resolution: '4K UHD ProRes',
    author: {
      name: 'Marcus Vance & Sarah Diaz',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=160&q=80',
      verified: true,
    },
    viewsCount: 9450,
    likesCount: 1670,
    unlockedCount: 215,
    createdAt: '2026-03-10T16:00:00Z',
    exclusivePerks: ['Projet DaVinci .drp téléchargeable', 'Accès direct aux sessions Q&R mensuelles du réalisateur', 'Stems audio multipistes']
  },
  {
    id: 'med_005',
    title: 'Prisme Brut : Architecture Brutaliste Nocturne',
    description: 'Exploration photographique et vidéo géométrique des monuments modernistes en béton brut éclairés par un unique faisceau zénithal. Esthétique architecturale minimaliste.',
    type: 'video',
    access: 'free',
    price: 0,
    currency: 'EUR',
    category: 'Photographie',
    categories: ['Photographie RAW'],
    tags: ['Architecture', 'Monochrome', 'Minimaliste', 'Gratuit'],
    thumbnailUrl: '/src/assets/images/media_cyber_tokyo_1793938277681.jpg',
    mediaUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    previewVideoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    duration: '04:30',
    resolution: '50 MP High-Res 4K',
    author: {
      name: 'Adèle Marchand',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=160&q=80',
      verified: true,
    },
    viewsCount: 15300,
    likesCount: 2280,
    unlockedCount: 0,
    createdAt: '2026-03-05T11:20:00Z',
    exclusivePerks: ['Aperçu public libre 4K', 'Notice descriptive du lieu et des focales']
  },
  {
    id: 'med_006',
    title: 'Vortex Sonore : Session Live Modular Synth & Visuels Réactifs',
    description: 'Performance live audio-visuelle exclusive 4K avec synthétiseurs modulaires Eurorack et shaders génératifs TouchDesigner réagissant en temps réel aux fréquences basses.',
    type: 'video',
    access: 'exclusive',
    price: 4.50,
    currency: 'EUR',
    category: 'Cinéma & Vidéo',
    categories: ['Cinéma & Vidéo'],
    tags: ['Live Sound', 'Modular', 'Generative', 'Exclusive'],
    thumbnailUrl: '/src/assets/images/hero_cinematic_creator_1793938277680.jpg',
    mediaUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    previewVideoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    duration: '27:04',
    resolution: '4K 60fps Lossless Audio',
    author: {
      name: 'Kaelen Thorne',
      avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=160&q=80',
      verified: true,
    },
    viewsCount: 11200,
    likesCount: 1940,
    unlockedCount: 190,
    createdAt: '2026-02-28T18:00:00Z',
    exclusivePerks: ['Master audio FLAC 24-bit 96kHz', 'Presets TouchDesigner inclus', 'Patch notes Eurorack complets']
  }
];

export const INITIAL_SUBSCRIBERS: User[] = [
  {
    id: 'usr_demo_vip',
    name: 'Pascal Studio',
    email: 'pascalstudios.PK@gmail.com',
    role: 'admin',
    token: 'jwt_mock_admin_token_pk_2026',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=160&q=80',
    createdAt: '2026-01-15T08:30:00Z',
    subscription: {
      active: false,
      planName: 'Non abonné',
      expiresAt: ''
    },
    unlockedMediaIds: ['med_003', 'med_005'],
    watchlist: ['med_001', 'med_004'],
    watchHistory: [
      { videoId: 'med_003', watchedAt: '2026-03-24T14:20:00Z', progressSeconds: 240, durationSeconds: 372, completed: false },
      { videoId: 'med_005', watchedAt: '2026-03-23T19:10:00Z', progressSeconds: 270, durationSeconds: 270, completed: true }
    ]
  },
  {
    id: 'usr_normal_client',
    name: 'Alexandre Meyer',
    email: 'alexandre@gmail.com',
    role: 'user',
    token: 'jwt_mock_user_token_alex_2026',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=160&q=80',
    createdAt: '2026-02-04T11:15:00Z',
    subscription: {
      active: true,
      planName: 'Abonnement Exclusif Mensuel',
      expiresAt: '2026-04-10T23:59:59Z'
    },
    unlockedMediaIds: ['med_001', 'med_002', 'med_003', 'med_004', 'med_005', 'med_006'],
    watchlist: ['med_001', 'med_006'],
    watchHistory: [
      { videoId: 'med_001', watchedAt: '2026-03-24T10:15:00Z', progressSeconds: 610, durationSeconds: 1125, completed: false }
    ]
  },
  {
    id: 'usr_sub_03',
    name: 'Sophie Laurent',
    email: 'sophie.laurent@cinema-paris.fr',
    role: 'user',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=160&q=80',
    createdAt: '2026-02-18T16:40:00Z',
    subscription: {
      active: true,
      planName: 'Abonnement Exclusif Annuel',
      expiresAt: '2027-02-18T23:59:59Z'
    },
    unlockedMediaIds: ['med_001', 'med_002', 'med_003'],
    watchHistory: [
      { videoId: 'med_004', watchedAt: '2026-03-22T21:00:00Z', progressSeconds: 1800, durationSeconds: 2538, completed: false }
    ]
  },
  {
    id: 'usr_sub_04',
    name: 'David Chen',
    email: 'david.chen@vfx-creative.com',
    role: 'user',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=160&q=80',
    createdAt: '2026-03-01T09:20:00Z',
    subscription: {
      active: true,
      planName: 'Abonnement Exclusif Mensuel',
      expiresAt: '2026-04-01T23:59:59Z'
    },
    unlockedMediaIds: ['med_001', 'med_004'],
    watchHistory: []
  },
  {
    id: 'usr_sub_05',
    name: 'Marc Lefebvre',
    email: 'marc.lefebvre@gmail.com',
    role: 'user',
    avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=160&q=80',
    createdAt: '2026-03-12T14:50:00Z',
    subscription: {
      active: false,
      planName: 'Non abonné (Compte Gratuit)',
      expiresAt: ''
    },
    unlockedMediaIds: ['med_003'],
    watchHistory: [
      { videoId: 'med_003', watchedAt: '2026-03-16T17:30:00Z', progressSeconds: 372, durationSeconds: 372, completed: true }
    ]
  }
];

export const INITIAL_MONETIZATION_SETTINGS: MonetizationSettings = {
  nyole: {
    merchantId: 'nyole_mch_88294021',
    apiKey: 'nyk_live_99f8d10b7c4a3e21e780d6f4',
    webhookSecret: 'whsec_nyole_38fd90a12e87c',
    environment: 'sandbox',
    callbackUrl: '/api/nyole/callback',
    webhookUrl: '/api/nyole/webhook',
    autoUnlockOnWebhook: true,
  },
  clickMonetization: {
    enabled: true,
    mode: 'popunder',
    targetUrl: '/subscriptions',
    triggerDelaySeconds: 4,
    triggerAfterMediaClicks: 2,
    dailyFrequencyCap: 3,
    estimatedCpc: 0.08,
    totalClicksTriggered: 1420,
    totalEarningsEstimated: 113.60,
  },
  adBanners: [
    {
      id: 'banner_header',
      name: 'Bannière Leaderboard Supérieure (728x90)',
      position: 'header_top',
      enabled: true,
      type: 'native_ad',
      title: 'Débloquez tous les Masters 8K en illimité · Paiement Mobile Money & CB',
      sponsorName: 'Pass VIP Illimité',
      imageUrl: '',
      targetUrl: '/subscriptions',
      cpmRate: 2.40,
      cpcRate: 0.35,
      impressions: 48920,
      clicks: 812,
    },
    {
      id: 'banner_interstitial',
      name: 'Bannière Native In-Feed Vidéos',
      position: 'feed_interstitial',
      enabled: true,
      type: 'native_ad',
      title: 'Mastering Étalonnage 8K : Obtenez 30 jours gratuits',
      sponsorName: 'ProColor Cinema Lab',
      imageUrl: '',
      targetUrl: '/subscriptions',
      cpmRate: 3.10,
      cpcRate: 0.45,
      impressions: 34100,
      clicks: 689,
    },
    {
      id: 'banner_sidebar',
      name: 'Encart Skyscraper / Player Companion Ad',
      position: 'sidebar',
      enabled: true,
      type: 'native_ad',
      title: 'Pass VIP BUZZLEAKS : Accès illimité à 100% des flux 8K',
      sponsorName: 'BUZZLEAKS Pass VIP',
      imageUrl: '',
      targetUrl: '#subscriptions',
      cpmRate: 4.20,
      cpcRate: 0.60,
      impressions: 19800,
      clicks: 442,
    }
  ]
};

export const INITIAL_TRANSACTIONS: NyoleTransaction[] = [
  {
    id: 'tx_ny_1092',
    transactionRef: 'NYL-2026-8812',
    userId: 'usr_normal_client',
    userEmail: 'alexandre@gmail.com',
    type: 'subscription',
    mediaTitle: 'Abonnement Exclusif Mensuel',
    amount: 9.99,
    currency: 'EUR',
    status: 'completed',
    paymentMethod: 'nyole_pay',
    nyoleTransactionId: 'ny_sub_992014820',
    webhookReceivedAt: '2026-03-24T11:04:12Z',
    createdAt: '2026-03-24T11:03:50Z'
  },
  {
    id: 'tx_ny_1091',
    transactionRef: 'NYL-2026-8811',
    userId: 'usr_sub_03',
    userEmail: 'sophie.laurent@cinema-paris.fr',
    type: 'subscription',
    mediaTitle: 'Abonnement Exclusif Annuel',
    amount: 79.99,
    currency: 'EUR',
    status: 'completed',
    paymentMethod: 'credit_card',
    nyoleTransactionId: 'ny_sub_992014819',
    webhookReceivedAt: '2026-03-24T09:20:00Z',
    createdAt: '2026-03-24T09:19:42Z'
  },
  {
    id: 'tx_ny_1090',
    transactionRef: 'NYL-2026-8810',
    userId: 'usr_sub_04',
    userEmail: 'david.chen@vfx-creative.com',
    type: 'subscription',
    mediaTitle: 'Abonnement Exclusif Mensuel',
    amount: 9.99,
    currency: 'EUR',
    status: 'completed',
    paymentMethod: 'nyole_pay',
    nyoleTransactionId: 'ny_sub_4481029',
    webhookReceivedAt: '2026-03-23T18:40:12Z',
    createdAt: '2026-03-23T18:39:55Z'
  }
];

export const INITIAL_SITE_PAGES_CONTENT: SitePagesContent = {
  general: {
    siteName: 'BUZZLEAKS',
    siteTagline: 'Streaming Exclusif & Médias Privés',
    announcementBanner: {
      enabled: true,
      text: '🔥 NOUVEAU CATALOGUE 8K DISPONIBLE : Débloquez instantanément le streaming et les téléchargements MP4 via Mobile Money (M-Pesa, MTN, Airtel, Orange, Wave) & Carte Bancaire !',
      linkText: 'Découvrir'
    },
    footerDescription: 'Plateforme haute performance de streaming vidéo 8K & Masters ProRes · Paiement sécurisé par Mobile Money (M-Pesa, MTN, Airtel, Orange, Wave) & Carte Bancaire.',
    copyrightText: 'Tous droits réservés.',
    supportContact: 'support@buzzleaks.vip'
  },
  hero: {
    badge: 'BUZZLEAKS · STREAMING EXCLUSIF',
    badgeExtra: 'Mobile Money & CB',
    title: 'Vidéos exclusives, masters 8K et streaming haute fidélité.',
    subtitle: 'La plateforme de référence pour les réalisateurs, créateurs visuels et passionnés. Streaming instantané et téléchargement direct de masters MP4 déverrouillables via Mobile Money et Carte Bancaire.',
    primaryCtaText: 'Accéder au Catalogue',
    secondaryCtaText: 'Pass VIP (Mobile Money)',
    securityNote1: 'Paiement Sécurisé SSL 256-bit',
    securityNote2: 'Téléchargement Master MP4 Réservé VIP',
    heroImageUrl: '/src/assets/images/hero_cinematic_creator_1793938277680.jpg',
    showcaseBadge: 'Exclusivité BUZZLEAKS · DaVinci 8K',
    showcaseTitle: 'Masterclass Étalonnage Cinéma & Workflow Studio',
    showcaseSubtitle: 'Marcus Vance & Sarah Diaz · 42 min de contenu exclusif',
    statsKpis: {
      views: '112K+',
      viewsLabel: 'Vues Totales 8K',
      masters: '100%',
      mastersLabel: 'Masters Sans DRM',
      subscribers: '2,480+',
      subscribersLabel: 'Membres VIP Actifs',
      uptime: '99.9%',
      uptimeLabel: 'Disponibilité CDN'
    }
  },
  vip: {
    headerBadge: 'Paiement Sécurisé Mobile Money & Carte Bancaire',
    title: 'Pass VIP BUZZLEAKS · Accès Illimité',
    monthlyPrice: 9.99,
    monthlyPeriodText: 'par mois',
    yearlyPrice: 79.99,
    yearlyPeriodText: 'par an',
    yearlyDiscountBadge: 'Économisez 33% (2 mois offerts)',
    summaryNotice: 'Paiement sécurisé par Mobile Money (M-Pesa, MTN, Airtel, Orange, Wave) & Carte. Déverrouille instantanément les téléchargements MP4 et l\'intégralité du streaming exclusif.',
    perks: [
      'Déverrouillage immédiat et illimité de 100% des contenus exclusifs',
      'Téléchargement direct des fichiers masters RAW 8K et profils DaVinci Resolve',
      'Streaming vidéo sans compression ProRes 4444 XQ',
      'Suppression complète de toutes les bannières publicitaires',
      'Accès prioritaire aux nouvelles sorties exclusives des réalisateurs'
    ],
    ctaButtonText: 'S\'abonner via Mobile Money & Carte',
    guaranteeText: 'Paiement crypté 256-bit SSL · Annulation en 1 clic à tout moment'
  },
  library: {
    title: 'Espace Membre',
    activePassBadge: 'Pass VIP BUZZLEAKS',
    freePassBadge: 'Compte Gratuit',
    emptyWatchlistTitle: 'Votre liste est vide',
    emptyWatchlistText: 'Ajoutez des vidéos à votre liste depuis le catalogue pour les retrouver facilement à tout moment.',
    emptyHistoryTitle: 'Aucune vidéo visionnée récemment',
    emptyHistoryText: 'Commencez à regarder des vidéos pour suivre automatiquement votre progression de lecture.',
    emptyUnlockedTitle: 'Aucune vidéo débloquée',
    emptyUnlockedText: 'Activez l\'abonnement exclusif pour débloquer immédiatement l\'intégralité du catalogue.'
  },
  mediaModal: {
    paywallTitle: 'Vidéo Exclusive BUZZLEAKS',
    paywallDescription: 'Ce flux haute fidélité fait partie des exclusivités BUZZLEAKS. Le Pass VIP débloque le streaming complet et le téléchargement des masters MP4.',
    paywallCtaText: 'Activer le Pass VIP (9,99 €/mois)',
    paywallSecondaryCta: 'Formules & Mobile Money',
    securityNotice: 'Paiement sécurisé : M-Pesa, MTN, Airtel, Orange, Wave · Activation instantanée',
    downloadLockedNotice: 'Streaming disponible en ligne. Le téléchargement direct du master MP4 requiert un abonnement VIP actif.',
    downloadUnlockedNotice: 'Master MP4 sans DRM'
  },
  auth: {
    brandBadge: 'BUZZLEAKS · Espace Membre',
    loginTitle: 'Connexion Plateforme',
    registerTitle: 'Créer un Compte',
    loginButtonText: 'Se connecter',
    registerButtonText: 'Créer mon compte',
    demoAccountsTitle: 'Comptes Démo de Test Rapide :'
  }
};
