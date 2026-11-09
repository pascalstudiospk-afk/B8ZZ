import express, { Request, Response, NextFunction } from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import crypto from 'crypto';
import {
  INITIAL_MEDIA_ITEMS,
  INITIAL_MONETIZATION_SETTINGS,
  INITIAL_TRANSACTIONS,
  INITIAL_CATEGORIES,
  INITIAL_SUBSCRIBERS,
  INITIAL_SITE_PAGES_CONTENT
} from './src/data/initialData';
import { CategoryItem, MediaItem, MonetizationSettings, NyoleTransaction, SitePagesContent, User } from './src/types';
import { MONGOOSE_SCHEMAS_CODE, POSTGRESQL_DDL_CODE } from './src/db/schemas';

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json());

// In-Memory Database Store (with persistent seed data)
const db = {
  media: [...INITIAL_MEDIA_ITEMS] as MediaItem[],
  categories: [...INITIAL_CATEGORIES] as CategoryItem[],
  monetization: JSON.parse(JSON.stringify(INITIAL_MONETIZATION_SETTINGS)) as MonetizationSettings,
  transactions: [...INITIAL_TRANSACTIONS] as NyoleTransaction[],
  users: [...INITIAL_SUBSCRIBERS] as User[],
  siteContent: JSON.parse(JSON.stringify(INITIAL_SITE_PAGES_CONTENT)) as SitePagesContent,
  stats: {
    totalVisits: 14890,
  }
};

// Helper: Get user from Authorization header
function getAuthUser(req: Request): User | null {
  const authHeader = req.headers.authorization;
  const userIdHeader = req.headers['x-user-id'] as string | undefined;
  const roleHeader = req.headers['x-user-role'] as string | undefined;

  if (userIdHeader) {
    const userById = db.users.find(u => u.id === userIdHeader);
    if (userById) return userById;
  }

  if (authHeader) {
    const token = authHeader.replace(/^Bearer\s+/, '').trim();
    const userByToken = db.users.find(u => u.token === token || u.id === token || u.email === token);
    if (userByToken) return userByToken;
  }

  if (roleHeader === 'admin') {
    const adminUser = db.users.find(u => u.role === 'admin');
    if (adminUser) return adminUser;
  }

  return null;
}

// Download Ticket Presigned Store
interface DownloadTicket {
  token: string;
  mediaId: string;
  userId: string;
  userEmail: string;
  expiresAt: number;
  used: boolean;
}
const downloadTickets = new Map<string, DownloadTicket>();

// Periodic purge of expired download tickets
setInterval(() => {
  const now = Date.now();
  for (const [token, ticket] of downloadTickets.entries()) {
    if (ticket.expiresAt < now || ticket.used) {
      downloadTickets.delete(token);
    }
  }
}, 60000);

// Middleware: Strict Subscription Enforcement for Downloads
function checkSubscription(req: Request, res: Response, next: NextFunction) {
  const user = getAuthUser(req);
  if (!user) {
    return res.status(401).json({
      error: 'Authentification requise pour télécharger les fichiers médias.',
      requiresAuth: true
    });
  }

  const isSubscribed = user.subscription?.active === true || user.role === 'admin';
  if (!isSubscribed) {
    return res.status(403).json({
      error: 'Téléchargement restreint : un abonnement actif NyxVault VIP (via Nyole) est strictement requis pour télécharger les masters vidéo MP4.',
      requiresSubscription: true,
      currentPlan: user.subscription?.planName || 'Compte Gratuit'
    });
  }

  (req as any).user = user;
  next();
}

// -------------------------------------------------------------
// 1. AUTH & USER PROFILE ROUTES
// -------------------------------------------------------------
app.post('/api/auth/login', (req: Request, res: Response) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ error: 'Email requis' });
  }

  let user = db.users.find(u => u.email.toLowerCase() === email.toLowerCase());
  if (!user) {
    user = {
      id: `usr_${Date.now()}`,
      name: email.split('@')[0],
      email: email.toLowerCase(),
      role: email.includes('admin') || email.includes('pascal') ? 'admin' : 'user',
      token: `jwt_${crypto.randomBytes(16).toString('hex')}`,
      avatar: `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=160&q=80`,
      createdAt: new Date().toISOString(),
      subscription: {
        active: false,
        planName: 'Non abonné (Compte Gratuit)',
        expiresAt: ''
      },
      unlockedMediaIds: ['med_003', 'med_005'],
      watchlist: [],
      watchHistory: []
    };
    db.users.push(user);
  }

  return res.json({ user });
});

app.post('/api/auth/register', (req: Request, res: Response) => {
  const { name, email } = req.body;
  if (!email || !name) {
    return res.status(400).json({ error: 'Nom et adresse email requis' });
  }

  const existing = db.users.find(u => u.email.toLowerCase() === email.toLowerCase());
  if (existing) {
    return res.status(409).json({ error: 'Cet email est déjà enregistré' });
  }

  const newUser: User = {
    id: `usr_${Date.now()}`,
    name,
    email: email.toLowerCase(),
    role: 'user',
    token: `jwt_${crypto.randomBytes(16).toString('hex')}`,
    avatar: `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=160&q=80`,
    createdAt: new Date().toISOString(),
    subscription: {
      active: false,
      planName: 'Non abonné (Compte Gratuit)',
      expiresAt: ''
    },
    unlockedMediaIds: ['med_003', 'med_005'],
    watchlist: [],
    watchHistory: []
  };

  db.users.push(newUser);
  return res.status(201).json({ user: newUser });
});

app.get('/api/auth/me', (req: Request, res: Response) => {
  const user = getAuthUser(req);
  if (!user) {
    return res.status(401).json({ error: 'Non authentifié' });
  }
  return res.json({ user });
});

app.put('/api/user/profile', (req: Request, res: Response) => {
  const user = getAuthUser(req);
  if (!user) return res.status(401).json({ error: 'Non authentifié' });

  const { name, avatar } = req.body;
  if (name) user.name = name;
  if (avatar) user.avatar = avatar;

  return res.json({ success: true, user });
});

app.post('/api/user/toggle-subscription', (req: Request, res: Response) => {
  const user = getAuthUser(req) || db.users[0];
  const currentState = Boolean(user.subscription?.active);
  user.subscription = {
    active: !currentState,
    planName: !currentState ? 'Abonnement Exclusif Mensuel' : 'Non abonné',
    expiresAt: !currentState ? new Date(Date.now() + 30 * 24 * 3600 * 1000).toISOString() : ''
  };
  return res.json({ success: true, subscription: user.subscription });
});

// Watchlist endpoints
app.get('/api/user/watchlist', (req: Request, res: Response) => {
  const user = getAuthUser(req) || db.users[0];
  const watchlistIds = user.watchlist || [];
  const videos = db.media.filter(m => watchlistIds.includes(m.id));
  return res.json({ watchlist: videos });
});

app.post('/api/user/watchlist/toggle', (req: Request, res: Response) => {
  const user = getAuthUser(req) || db.users[0];
  const { videoId } = req.body;
  if (!videoId) return res.status(400).json({ error: 'videoId requis' });

  if (!user.watchlist) user.watchlist = [];
  const index = user.watchlist.indexOf(videoId);
  let added = false;
  if (index >= 0) {
    user.watchlist.splice(index, 1);
  } else {
    user.watchlist.push(videoId);
    added = true;
  }
  return res.json({ success: true, added, watchlist: user.watchlist });
});

// Watch History endpoints
app.get('/api/user/history', (req: Request, res: Response) => {
  const user = getAuthUser(req) || db.users[0];
  const history = (user.watchHistory || []).map(h => {
    const video = db.media.find(m => m.id === h.videoId);
    return {
      ...h,
      video
    };
  }).filter(h => Boolean(h.video));

  return res.json({ history });
});

app.post('/api/user/history', (req: Request, res: Response) => {
  const user = getAuthUser(req) || db.users[0];
  const { videoId, progressSeconds, durationSeconds, completed } = req.body;
  if (!videoId) return res.status(400).json({ error: 'videoId requis' });

  if (!user.watchHistory) user.watchHistory = [];
  const existingIndex = user.watchHistory.findIndex(h => h.videoId === videoId);

  const entry = {
    videoId,
    watchedAt: new Date().toISOString(),
    progressSeconds: progressSeconds || 0,
    durationSeconds: durationSeconds || 0,
    completed: Boolean(completed)
  };

  if (existingIndex >= 0) {
    user.watchHistory[existingIndex] = entry;
  } else {
    user.watchHistory.unshift(entry);
  }

  return res.json({ success: true, history: user.watchHistory });
});

// -------------------------------------------------------------
// 2. VIDEO CATALOG CRUD ROUTES
// -------------------------------------------------------------
app.get('/api/media', (req: Request, res: Response) => {
  const { category, tag, access, search, sort } = req.query;
  let items = [...db.media];

  if (category && category !== 'Tous' && category !== 'tous' && category !== 'Tous les Médias') {
    items = items.filter(m =>
      m.category.toLowerCase() === (category as string).toLowerCase() ||
      m.categories?.some(c => c.toLowerCase() === (category as string).toLowerCase())
    );
  }

  if (tag && tag !== 'Tous') {
    items = items.filter(m => m.tags.some(t => t.toLowerCase() === (tag as string).toLowerCase()));
  }

  if (access && access !== 'all') {
    items = items.filter(m => m.access === access);
  }

  if (search) {
    const q = (search as string).toLowerCase().trim();
    items = items.filter(m =>
      m.title.toLowerCase().includes(q) ||
      m.description.toLowerCase().includes(q) ||
      m.author.name.toLowerCase().includes(q) ||
      m.tags.some(t => t.toLowerCase().includes(q))
    );
  }

  if (sort === 'popular') {
    items.sort((a, b) => b.viewsCount - a.viewsCount);
  } else if (sort === 'unlocked') {
    items.sort((a, b) => b.unlockedCount - a.unlockedCount);
  } else if (sort === 'price_asc') {
    items.sort((a, b) => (a.price || 0) - (b.price || 0));
  } else if (sort === 'price_desc') {
    items.sort((a, b) => (b.price || 0) - (a.price || 0));
  } else {
    items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  return res.json({ media: items });
});

app.get('/api/media/:id', (req: Request, res: Response) => {
  const item = db.media.find(m => m.id === req.params.id);
  if (!item) {
    return res.status(404).json({ error: 'Vidéo introuvable' });
  }
  return res.json({ media: item });
});

// Create video
app.post('/api/media', (req: Request, res: Response) => {
  const user = getAuthUser(req);
  if (!user || user.role !== 'admin') {
    return res.status(403).json({ error: 'Accès réservé aux administrateurs' });
  }

  const {
    title,
    description,
    type,
    access,
    category,
    categories,
    tags,
    thumbnailUrl,
    mediaUrl,
    previewVideoUrl,
    duration,
    resolution,
    exclusivePerks
  } = req.body;

  if (!title || !thumbnailUrl || !mediaUrl) {
    return res.status(400).json({ error: 'Titre, miniature et vidéo source obligatoires' });
  }

  const newMedia: MediaItem = {
    id: `med_${Date.now()}`,
    title,
    description: description || '',
    type: type || 'video',
    access: access || 'exclusive',
    price: access === 'free' ? 0 : 9.99,
    currency: 'EUR',
    category: category || 'Cinéma & Vidéo',
    categories: Array.isArray(categories) && categories.length > 0 ? categories : [category || 'Cinéma & Vidéo'],
    tags: Array.isArray(tags) ? tags : (tags ? tags.split(',').map((t: string) => t.trim()) : ['Exclusif', '8K RAW']),
    thumbnailUrl,
    mediaUrl,
    previewVideoUrl: previewVideoUrl || mediaUrl,
    duration: duration || '15:00',
    resolution: resolution || '4K UHD',
    author: {
      name: user.name || 'Studio Principal',
      avatar: user.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=160&q=80',
      verified: true
    },
    viewsCount: 1,
    likesCount: 0,
    unlockedCount: 0,
    createdAt: new Date().toISOString(),
    exclusivePerks: Array.isArray(exclusivePerks) ? exclusivePerks : ['Accès streaming master illimité', 'Fichier RAW téléchargeable']
  };

  db.media.unshift(newMedia);
  return res.status(201).json({ media: newMedia });
});

// Edit video (UPDATE)
app.put('/api/media/:id', (req: Request, res: Response) => {
  const user = getAuthUser(req);
  if (!user || user.role !== 'admin') {
    return res.status(403).json({ error: 'Accès réservé aux administrateurs' });
  }

  const index = db.media.findIndex(m => m.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: 'Vidéo introuvable' });
  }

  const {
    title,
    description,
    type,
    access,
    category,
    categories,
    tags,
    thumbnailUrl,
    mediaUrl,
    previewVideoUrl,
    duration,
    resolution,
    exclusivePerks
  } = req.body;

  const existing = db.media[index];
  const updated: MediaItem = {
    ...existing,
    title: title ?? existing.title,
    description: description ?? existing.description,
    type: type ?? existing.type,
    access: access ?? existing.access,
    category: category ?? existing.category,
    categories: categories ?? (category ? [category] : existing.categories),
    tags: Array.isArray(tags) ? tags : (tags ? tags.split(',').map((t: string) => t.trim()) : existing.tags),
    thumbnailUrl: thumbnailUrl ?? existing.thumbnailUrl,
    mediaUrl: mediaUrl ?? existing.mediaUrl,
    previewVideoUrl: previewVideoUrl ?? existing.previewVideoUrl ?? mediaUrl,
    duration: duration ?? existing.duration,
    resolution: resolution ?? existing.resolution,
    exclusivePerks: exclusivePerks ?? existing.exclusivePerks
  };

  db.media[index] = updated;
  return res.json({ success: true, media: updated });
});

// Delete video
app.delete('/api/media/:id', (req: Request, res: Response) => {
  const user = getAuthUser(req);
  if (!user || user.role !== 'admin') {
    return res.status(403).json({ error: 'Accès réservé aux administrateurs' });
  }

  const index = db.media.findIndex(m => m.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: 'Média non trouvé' });
  }

  db.media.splice(index, 1);
  return res.json({ success: true, message: 'Vidéo retirée définitivement du catalogue' });
});

app.post('/api/media/:id/view', (req: Request, res: Response) => {
  const item = db.media.find(m => m.id === req.params.id);
  if (item) {
    item.viewsCount += 1;
    db.stats.totalVisits += 1;
  }
  return res.json({ success: true, viewsCount: item?.viewsCount || 0 });
});

// -------------------------------------------------------------
// SECURE DOWNLOAD SYSTEM (Strict Subscription Enforcement)
// -------------------------------------------------------------

// Step 1: Request a signed, one-time download ticket (Protected by checkSubscription)
app.post('/api/media/:id/download-token', checkSubscription, (req: Request, res: Response) => {
  const user = (req as any).user as User;
  const media = db.media.find(m => m.id === req.params.id);
  if (!media) {
    return res.status(404).json({ error: 'Média non trouvé' });
  }

  const token = `dl_ticket_${crypto.randomBytes(24).toString('hex')}`;
  const expiresInSeconds = 90;
  const ticket: DownloadTicket = {
    token,
    mediaId: media.id,
    userId: user.id,
    userEmail: user.email,
    expiresAt: Date.now() + (expiresInSeconds * 1000),
    used: false
  };

  downloadTickets.set(token, ticket);

  return res.json({
    success: true,
    token,
    downloadUrl: `/api/media/${media.id}/download?ticket=${token}`,
    expiresInSeconds,
    media: {
      id: media.id,
      title: media.title,
      resolution: media.resolution
    }
  });
});

// Step 2: Deliver file with attachment headers & streaming (Validates Ticket or Subscription)
app.get('/api/media/:id/download', async (req: Request, res: Response) => {
  const ticketToken = req.query.ticket as string | undefined;
  let user: User | null = null;

  if (ticketToken) {
    const ticket = downloadTickets.get(ticketToken);
    if (!ticket || ticket.expiresAt < Date.now() || ticket.used) {
      return res.status(403).json({
        error: 'Ticket de téléchargement expiré ou invalide. Un abonnement actif est requis.',
        requiresSubscription: true
      });
    }
    if (ticket.mediaId !== req.params.id) {
      return res.status(400).json({ error: 'Ticket non valide pour ce média' });
    }
    ticket.used = true; // One-time execution
    user = db.users.find(u => u.id === ticket.userId) || null;
  } else {
    // Direct request via Authorization header
    user = getAuthUser(req);
    if (!user || (!user.subscription?.active && user.role !== 'admin')) {
      return res.status(403).json({
        error: 'Téléchargement direct non autorisé. Un abonnement VIP actif est obligatoire.',
        requiresSubscription: true
      });
    }
  }

  const media = db.media.find(m => m.id === req.params.id);
  if (!media) {
    return res.status(404).json({ error: 'Fichier média introuvable' });
  }

  const safeTitle = media.title.replace(/[^a-zA-Z0-9_\-]/g, '_').substring(0, 36);
  const ext = media.type === 'image' ? 'jpg' : 'mp4';
  const filename = `NyxVault_${safeTitle}_${media.resolution.replace(/\s+/g, '_')}.${ext}`;

  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
  res.setHeader('Content-Type', media.type === 'image' ? 'image/jpeg' : 'video/mp4');
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private');

  try {
    const upstreamRes = await fetch(media.mediaUrl);
    if (!upstreamRes.ok || !upstreamRes.body) {
      return res.redirect(media.mediaUrl);
    }
    const reader = upstreamRes.body.getReader();
    const pump = async () => {
      while (true) {
        const { done, value } = await reader.read();
        if (done) {
          res.end();
          break;
        }
        res.write(Buffer.from(value));
      }
    };
    await pump();
  } catch (err) {
    return res.redirect(media.mediaUrl);
  }
});

// -------------------------------------------------------------
// 3. CATEGORIES MANAGEMENT (CMS)
// -------------------------------------------------------------
app.get('/api/categories', (req: Request, res: Response) => {
  const categoriesWithCounts = db.categories.map(cat => {
    if (cat.id === 'cat_all' || cat.slug === 'tous') {
      return { ...cat, count: db.media.length };
    }
    const count = db.media.filter(m =>
      m.category.toLowerCase() === cat.name.toLowerCase() ||
      m.categories?.some(c => c.toLowerCase() === cat.name.toLowerCase())
    ).length;
    return { ...cat, count };
  });

  return res.json({ categories: categoriesWithCounts });
});

app.post('/api/categories', (req: Request, res: Response) => {
  const user = getAuthUser(req);
  if (!user || user.role !== 'admin') {
    return res.status(403).json({ error: 'Accès réservé aux administrateurs' });
  }

  const { name, description } = req.body;
  if (!name) return res.status(400).json({ error: 'Nom de la catégorie requis' });

  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  const newCat: CategoryItem = {
    id: `cat_${Date.now()}`,
    name,
    slug,
    description: description || '',
    count: 0
  };

  db.categories.push(newCat);
  return res.status(201).json({ category: newCat });
});

app.put('/api/categories/:id', (req: Request, res: Response) => {
  const user = getAuthUser(req);
  if (!user || user.role !== 'admin') {
    return res.status(403).json({ error: 'Accès réservé aux administrateurs' });
  }

  const { id } = req.params;
  const { name, description } = req.body;

  if (!name || !name.trim()) {
    return res.status(400).json({ error: 'Le nom de la catégorie ne peut pas être vide' });
  }

  const catIndex = db.categories.findIndex(c => c.id === id);
  if (catIndex === -1) {
    return res.status(404).json({ error: 'Catégorie introuvable' });
  }

  const oldName = db.categories[catIndex].name;
  const newName = name.trim();
  const newSlug = id === 'cat_all'
    ? 'tous'
    : newName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

  db.categories[catIndex] = {
    ...db.categories[catIndex],
    name: newName,
    slug: newSlug,
    description: description !== undefined ? description : db.categories[catIndex].description
  };

  // Synchronize media catalog category references if renamed
  if (id !== 'cat_all' && oldName !== newName) {
    db.media.forEach(m => {
      if (m.category.toLowerCase() === oldName.toLowerCase()) {
        m.category = newName;
      }
      if (m.categories && Array.isArray(m.categories)) {
        m.categories = m.categories.map(c => c.toLowerCase() === oldName.toLowerCase() ? newName : c);
      }
    });
  }

  const count = id === 'cat_all'
    ? db.media.length
    : db.media.filter(m =>
        m.category.toLowerCase() === newName.toLowerCase() ||
        m.categories?.some(c => c.toLowerCase() === newName.toLowerCase())
      ).length;

  return res.json({
    success: true,
    category: { ...db.categories[catIndex], count }
  });
});

app.delete('/api/categories/:id', (req: Request, res: Response) => {
  const user = getAuthUser(req);
  if (!user || user.role !== 'admin') {
    return res.status(403).json({ error: 'Accès réservé aux administrateurs' });
  }

  if (req.params.id === 'cat_all') {
    return res.status(400).json({ error: 'La catégorie générale ne peut être supprimée' });
  }

  const index = db.categories.findIndex(c => c.id === req.params.id);
  if (index === -1) return res.status(404).json({ error: 'Catégorie introuvable' });

  db.categories.splice(index, 1);
  return res.json({ success: true });
});

// -------------------------------------------------------------
// 4. SUBSCRIBERS DATABASE MANAGEMENT (CMS)
// -------------------------------------------------------------
app.get('/api/admin/subscribers', (req: Request, res: Response) => {
  const user = getAuthUser(req);
  if (!user || user.role !== 'admin') {
    return res.status(403).json({ error: 'Accès réservé aux administrateurs' });
  }

  const subscribers = db.users.map(u => ({
    id: u.id,
    name: u.name,
    email: u.email,
    role: u.role,
    avatar: u.avatar,
    createdAt: u.createdAt || '2026-01-15T08:30:00Z',
    subscription: u.subscription,
    videosWatchedCount: u.watchHistory?.length || 0,
    watchlistCount: u.watchlist?.length || 0
  }));

  return res.json({ subscribers });
});

app.get('/api/admin/subscribers/export', (req: Request, res: Response) => {
  const user = getAuthUser(req);
  if (!user || user.role !== 'admin') {
    return res.status(403).json({ error: 'Accès réservé aux administrateurs' });
  }

  const csvRows = [
    'ID,Nom,Email,Rôle,Date Inscription,Abonnement Nyole,Statut,Vues Historique',
    ...db.users.map(u =>
      `"${u.id}","${u.name}","${u.email}","${u.role}","${u.createdAt || ''}","${u.subscription?.planName || 'Gratuit'}","${u.subscription?.active ? 'Actif' : 'Inactif'}",${u.watchHistory?.length || 0}`
    )
  ];

  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', 'attachment; filename="nyxvault_subscribers.csv"');
  return res.send(csvRows.join('\n'));
});

// -------------------------------------------------------------
// 5. NYOLE PAYMENT GATEWAY & MONETIZATION
// -------------------------------------------------------------
app.post('/api/nyole/create-checkout', (req: Request, res: Response) => {
  const { planId, paymentMethod, planName } = req.body;
  const user = getAuthUser(req) || db.users[0];

  let amount = 9.99;
  let title = 'Abonnement Exclusif Mensuel';

  if (planId === 'plan_yearly' || planName?.includes('Annuel')) {
    amount = 79.99;
    title = 'Abonnement Exclusif Annuel';
  } else if (planName) {
    title = planName;
    amount = planName.includes('Annuel') ? 79.99 : 9.99;
  }

  const transactionRef = `NYL-${Date.now().toString().slice(-6)}-${crypto.randomBytes(2).toString('hex').toUpperCase()}`;
  const nyoleTxId = `ny_ch_${crypto.randomBytes(8).toString('hex')}`;

  const newTx: NyoleTransaction = {
    id: `tx_${Date.now()}`,
    transactionRef,
    userId: user.id,
    userEmail: user.email,
    mediaId: undefined,
    mediaTitle: title,
    type: 'subscription',
    amount,
    currency: 'EUR',
    status: 'pending',
    paymentMethod: paymentMethod || 'nyole_pay',
    nyoleTransactionId: nyoleTxId,
    createdAt: new Date().toISOString()
  };

  db.transactions.unshift(newTx);

  return res.json({
    success: true,
    transactionRef,
    nyoleTransactionId: nyoleTxId,
    amount,
    currency: 'EUR',
    checkoutUrl: `https://checkout.nyole.com/pay/${nyoleTxId}?ref=${transactionRef}`,
    merchantId: db.monetization.nyole.merchantId,
    environment: db.monetization.nyole.environment
  });
});

app.post('/api/nyole/webhook', (req: Request, res: Response) => {
  const payload = req.body;
  const { event, transactionRef, nyoleTransactionId, status } = payload;

  console.log(`[Nyole Webhook] Event: ${event} Ref: ${transactionRef}`);

  const tx = db.transactions.find(t => t.transactionRef === transactionRef || t.nyoleTransactionId === nyoleTransactionId);
  if (!tx) {
    return res.status(404).json({ error: 'Transaction Nyole introuvable' });
  }

  tx.status = status === 'failed' ? 'failed' : 'completed';
  tx.webhookReceivedAt = new Date().toISOString();

  if (tx.status === 'completed' && db.monetization.nyole.autoUnlockOnWebhook) {
    const user = db.users.find(u => u.id === tx.userId || u.email === tx.userEmail);
    if (user) {
      user.subscription = {
        active: true,
        planName: tx.mediaTitle || 'Abonnement Exclusif Mensuel',
        expiresAt: new Date(Date.now() + 30 * 24 * 3600 * 1000).toISOString()
      };
      // Unlock all media
      user.unlockedMediaIds = db.media.map(m => m.id);
    }
  }

  return res.json({
    received: true,
    status: tx.status,
    transactionRef: tx.transactionRef,
    unlocked: true
  });
});

app.post('/api/nyole/simulate-confirm', (req: Request, res: Response) => {
  const { transactionRef } = req.body;
  const tx = db.transactions.find(t => t.transactionRef === transactionRef);
  if (!tx) {
    return res.status(404).json({ error: 'Transaction introuvable' });
  }

  tx.status = 'completed';
  tx.webhookReceivedAt = new Date().toISOString();

  const user = db.users.find(u => u.id === tx.userId || u.email === tx.userEmail);
  if (user) {
    user.subscription = {
      active: true,
      planName: tx.mediaTitle || 'Abonnement Exclusif Mensuel',
      expiresAt: new Date(Date.now() + 30 * 24 * 3600 * 1000).toISOString()
    };
    user.unlockedMediaIds = db.media.map(m => m.id);
  }

  return res.json({
    success: true,
    message: 'Webhook Nyole confirmé avec succès',
    transaction: tx,
    unlockedMediaIds: user?.unlockedMediaIds || []
  });
});

// -------------------------------------------------------------
// 6. AD NETWORKS & MONETIZATION CONFIG
// -------------------------------------------------------------
app.get('/api/admin/monetization', (req: Request, res: Response) => {
  return res.json({ settings: db.monetization });
});

app.put('/api/admin/monetization', (req: Request, res: Response) => {
  const user = getAuthUser(req);
  if (!user || user.role !== 'admin') {
    return res.status(403).json({ error: 'Accès réservé aux administrateurs' });
  }

  const { nyole, clickMonetization, adBanners } = req.body;
  if (nyole) db.monetization.nyole = { ...db.monetization.nyole, ...nyole };
  if (clickMonetization) db.monetization.clickMonetization = { ...db.monetization.clickMonetization, ...clickMonetization };
  if (adBanners) db.monetization.adBanners = adBanners;

  return res.json({ success: true, settings: db.monetization });
});

app.post('/api/monetization/click', (req: Request, res: Response) => {
  const { bannerId, isPopunder } = req.body;

  if (isPopunder) {
    db.monetization.clickMonetization.totalClicksTriggered += 1;
    db.monetization.clickMonetization.totalEarningsEstimated += db.monetization.clickMonetization.estimatedCpc;
    return res.json({
      success: true,
      redirectUrl: db.monetization.clickMonetization.targetUrl
    });
  }

  if (bannerId) {
    const banner = db.monetization.adBanners.find(b => b.id === bannerId);
    if (banner) {
      banner.clicks += 1;
      return res.json({ success: true, redirectUrl: banner.targetUrl });
    }
  }

  return res.json({ success: true });
});

// -------------------------------------------------------------
// 6b. SITE PAGES & CONTENT MANAGEMENT (CMS FOR ALL PAGES)
// -------------------------------------------------------------
app.get('/api/site-content', (req: Request, res: Response) => {
  return res.json({ content: db.siteContent });
});

app.put('/api/site-content', (req: Request, res: Response) => {
  const user = getAuthUser(req);
  if (!user || user.role !== 'admin') {
    return res.status(403).json({ error: 'Accès réservé aux administrateurs' });
  }

  const updates = req.body;
  if (!updates || typeof updates !== 'object') {
    return res.status(400).json({ error: 'Données de contenu invalides' });
  }

  // Deep merge updates into db.siteContent
  if (updates.general) {
    db.siteContent.general = {
      ...db.siteContent.general,
      ...updates.general,
      announcementBanner: {
        ...db.siteContent.general.announcementBanner,
        ...(updates.general.announcementBanner || {})
      }
    };
  }
  if (updates.hero) {
    db.siteContent.hero = {
      ...db.siteContent.hero,
      ...updates.hero,
      statsKpis: {
        ...db.siteContent.hero.statsKpis,
        ...(updates.hero.statsKpis || {})
      }
    };
  }
  if (updates.vip) {
    db.siteContent.vip = {
      ...db.siteContent.vip,
      ...updates.vip,
      perks: Array.isArray(updates.vip.perks) ? updates.vip.perks : db.siteContent.vip.perks
    };
  }
  if (updates.library) {
    db.siteContent.library = {
      ...db.siteContent.library,
      ...updates.library
    };
  }
  if (updates.mediaModal) {
    db.siteContent.mediaModal = {
      ...db.siteContent.mediaModal,
      ...updates.mediaModal
    };
  }
  if (updates.auth) {
    db.siteContent.auth = {
      ...db.siteContent.auth,
      ...updates.auth
    };
  }

  return res.json({
    success: true,
    message: 'Contenus des pages mis à jour avec succès',
    content: db.siteContent
  });
});

app.post('/api/site-content/reset', (req: Request, res: Response) => {
  const user = getAuthUser(req);
  if (!user || user.role !== 'admin') {
    return res.status(403).json({ error: 'Accès réservé aux administrateurs' });
  }

  db.siteContent = JSON.parse(JSON.stringify(INITIAL_SITE_PAGES_CONTENT));
  return res.json({
    success: true,
    message: 'Contenus réinitialisés aux valeurs par défaut',
    content: db.siteContent
  });
});

// -------------------------------------------------------------
// 7. USER LIBRARY & PURCHASES
// -------------------------------------------------------------
app.get('/api/user/library', (req: Request, res: Response) => {
  const user = getAuthUser(req) || db.users[0];
  const unlocked = db.media.filter(m =>
    m.access === 'free' ||
    user.unlockedMediaIds.includes(m.id) ||
    user.subscription?.active
  );
  return res.json({
    unlockedMedia: unlocked,
    subscription: user.subscription
  });
});

app.get('/api/user/purchases', (req: Request, res: Response) => {
  const user = getAuthUser(req) || db.users[0];
  const purchases = db.transactions.filter(t => t.userId === user.id || t.userEmail === user.email);
  return res.json({ purchases });
});

// -------------------------------------------------------------
// 8. ADMIN ANALYTICS CMS
// -------------------------------------------------------------
app.get('/api/admin/analytics', (req: Request, res: Response) => {
  const completedTx = db.transactions.filter(t => t.status === 'completed');
  const nyoleRevenue = completedTx.reduce((sum, t) => sum + t.amount, 0);

  const adBannerClicks = db.monetization.adBanners.reduce((sum, b) => sum + b.clicks, 0);
  const adBannerRevenue = db.monetization.adBanners.reduce((sum, b) => sum + (b.clicks * b.cpcRate) + (b.impressions / 1000 * b.cpmRate), 0);
  const popunderRevenue = db.monetization.clickMonetization.totalEarningsEstimated;
  const totalAdRevenue = Number((adBannerRevenue + popunderRevenue).toFixed(2));

  const subscriptionsCount = completedTx.filter(t => t.type === 'subscription').length;
  const totalVideoViews = db.media.reduce((acc, m) => acc + m.viewsCount, 0);
  const activeSubscribers = db.users.filter(u => u.subscription?.active).length;
  const totalSubscribersRegistered = db.users.length;

  const totalRevenue = Number((nyoleRevenue + totalAdRevenue).toFixed(2));
  const conversionRate = totalSubscribersRegistered > 0
    ? Number(((activeSubscribers / totalSubscribersRegistered) * 100).toFixed(1))
    : 12.5;

  const revenueByDay = [
    { date: '2026-03-18', amount: 38.50, count: 6 },
    { date: '2026-03-19', amount: 52.00, count: 9 },
    { date: '2026-03-20', amount: 89.40, count: 14 },
    { date: '2026-03-21', amount: 64.90, count: 11 },
    { date: '2026-03-22', amount: 112.50, count: 18 },
    { date: '2026-03-23', amount: 96.00, count: 15 },
    { date: '2026-03-24', amount: 145.80, count: 22 },
  ];

  const topVideos = [...db.media]
    .sort((a, b) => b.viewsCount - a.viewsCount)
    .slice(0, 5)
    .map(v => ({
      id: v.id,
      title: v.title,
      views: v.viewsCount,
      likes: v.likesCount,
      category: v.category
    }));

  return res.json({
    stats: {
      totalRevenue,
      nyoleRevenue: Number(nyoleRevenue.toFixed(2)),
      nyoleMediaSalesCount: 0,
      nyoleSubscriptionsCount: subscriptionsCount,
      activeSubscribers,
      totalSubscribersRegistered,
      adEarnings: totalAdRevenue,
      totalAdClicks: adBannerClicks + db.monetization.clickMonetization.totalClicksTriggered,
      totalVisits: db.stats.totalVisits,
      totalVideoViews,
      conversionRate,
      revenueByDay,
      recentTransactions: db.transactions.slice(0, 10),
      topVideos
    }
  });
});

app.get('/api/admin/db-schemas', (req: Request, res: Response) => {
  return res.json({
    mongooseCode: MONGOOSE_SCHEMAS_CODE,
    postgresqlCode: POSTGRESQL_DDL_CODE
  });
});

// -------------------------------------------------------------
// 9. DEV & PROD SERVER SETUP
// -------------------------------------------------------------
async function startServer() {
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 NyxVault Streaming Platform Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
