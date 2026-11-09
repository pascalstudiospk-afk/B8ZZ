import {
  MediaItem,
  MonetizationSettings,
  NyoleTransaction,
  User,
  AnalyticsStats,
  CategoryItem,
  WatchHistoryItem,
  SitePagesContent
} from '../types';

const API_BASE = '/api';

function getAuthHeaders(): HeadersInit {
  const token = localStorage.getItem('nyx_token') || 'jwt_mock_admin_token_pk_2026';
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };
}

export const api = {
  // Auth & Profile
  async login(email: string): Promise<{ user: User }> {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    });
    if (!res.ok) throw new Error('Échec de la connexion');
    const data = await res.json();
    if (data.user?.token) {
      localStorage.setItem('nyx_token', data.user.token);
    }
    return data;
  },

  async register(name: string, email: string): Promise<{ user: User }> {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email })
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Échec de l\'inscription' }));
      throw new Error(err.error || 'Échec de l\'inscription');
    }
    const data = await res.json();
    if (data.user?.token) {
      localStorage.setItem('nyx_token', data.user.token);
    }
    return data;
  },

  async getMe(): Promise<{ user: User }> {
    const res = await fetch(`${API_BASE}/auth/me`, {
      headers: getAuthHeaders()
    });
    if (!res.ok) throw new Error('Session expirée');
    return res.json();
  },

  async updateProfile(params: { name?: string; avatar?: string }): Promise<{ success: boolean; user: User }> {
    const res = await fetch(`${API_BASE}/user/profile`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(params)
    });
    if (!res.ok) throw new Error('Erreur lors de la mise à jour du profil');
    return res.json();
  },

  async toggleSubscription(): Promise<{ success: boolean; subscription: any }> {
    const res = await fetch(`${API_BASE}/user/toggle-subscription`, {
      method: 'POST',
      headers: getAuthHeaders()
    });
    return res.json();
  },

  // Watchlist & History
  async getWatchlist(): Promise<{ watchlist: MediaItem[] }> {
    const res = await fetch(`${API_BASE}/user/watchlist`, {
      headers: getAuthHeaders()
    });
    return res.json();
  },

  async toggleWatchlist(videoId: string): Promise<{ success: boolean; added: boolean; watchlist: string[] }> {
    const res = await fetch(`${API_BASE}/user/watchlist/toggle`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ videoId })
    });
    return res.json();
  },

  async getWatchHistory(): Promise<{ history: { videoId: string; watchedAt: string; video: MediaItem; progressSeconds?: number }[] }> {
    const res = await fetch(`${API_BASE}/user/history`, {
      headers: getAuthHeaders()
    });
    return res.json();
  },

  async recordWatchHistory(params: { videoId: string; progressSeconds?: number; durationSeconds?: number; completed?: boolean }) {
    await fetch(`${API_BASE}/user/history`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(params)
    }).catch(() => {});
  },

  // Video Media CRUD
  async getMedia(params?: { category?: string; tag?: string; access?: string; search?: string; sort?: string }): Promise<{ media: MediaItem[] }> {
    const query = new URLSearchParams();
    if (params?.category) query.append('category', params.category);
    if (params?.tag) query.append('tag', params.tag);
    if (params?.access) query.append('access', params.access);
    if (params?.search) query.append('search', params.search);
    if (params?.sort) query.append('sort', params.sort);

    const res = await fetch(`${API_BASE}/media?${query.toString()}`);
    if (!res.ok) throw new Error('Impossible de charger les vidéos');
    return res.json();
  },

  async getMediaById(id: string): Promise<{ media: MediaItem }> {
    const res = await fetch(`${API_BASE}/media/${id}`);
    if (!res.ok) throw new Error('Vidéo introuvable');
    return res.json();
  },

  async createMedia(mediaData: Partial<MediaItem>): Promise<{ media: MediaItem }> {
    const res = await fetch(`${API_BASE}/media`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(mediaData)
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Erreur lors de la publication' }));
      throw new Error(err.error || 'Erreur publication');
    }
    return res.json();
  },

  async updateMedia(id: string, mediaData: Partial<MediaItem>): Promise<{ success: boolean; media: MediaItem }> {
    const res = await fetch(`${API_BASE}/media/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(mediaData)
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Erreur lors de la modification' }));
      throw new Error(err.error || 'Erreur modification');
    }
    return res.json();
  },

  async deleteMedia(id: string): Promise<void> {
    const res = await fetch(`${API_BASE}/media/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    if (!res.ok) throw new Error('Erreur lors de la suppression');
  },

  async recordView(id: string): Promise<void> {
    await fetch(`${API_BASE}/media/${id}/view`, { method: 'POST' }).catch(() => {});
  },

  // Secure Download Ticket Generator (Protected by checkSubscription)
  async requestDownload(mediaId: string): Promise<{ downloadUrl: string; token: string }> {
    const res = await fetch(`${API_BASE}/media/${mediaId}/download-token`, {
      method: 'POST',
      headers: getAuthHeaders()
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Téléchargement restreint' }));
      const error: any = new Error(err.error || 'Abonnement VIP requis pour télécharger cette vidéo');
      error.status = res.status;
      error.requiresSubscription = err.requiresSubscription || res.status === 403;
      throw error;
    }

    return res.json();
  },

  // Categories CMS
  async getCategories(): Promise<{ categories: CategoryItem[] }> {
    const res = await fetch(`${API_BASE}/categories`);
    if (!res.ok) throw new Error('Impossible de charger les catégories');
    return res.json();
  },

  async createCategory(params: { name: string; description?: string }): Promise<{ category: CategoryItem }> {
    const res = await fetch(`${API_BASE}/categories`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(params)
    });
    if (!res.ok) throw new Error('Erreur création catégorie');
    return res.json();
  },

  async updateCategory(id: string, params: { name: string; description?: string }): Promise<{ category: CategoryItem }> {
    const res = await fetch(`${API_BASE}/categories/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(params)
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Erreur modification catégorie' }));
      throw new Error(err.error || 'Erreur modification catégorie');
    }
    return res.json();
  },

  async deleteCategory(id: string): Promise<void> {
    const res = await fetch(`${API_BASE}/categories/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    if (!res.ok) throw new Error('Erreur suppression catégorie');
  },

  // Subscribers Database (CMS)
  async getSubscribers(): Promise<{ subscribers: (User & { videosWatchedCount: number; watchlistCount: number })[] }> {
    const res = await fetch(`${API_BASE}/admin/subscribers`, {
      headers: getAuthHeaders()
    });
    if (!res.ok) throw new Error('Erreur chargement abonnés');
    return res.json();
  },

  getExportSubscribersUrl(): string {
    return `${API_BASE}/admin/subscribers/export`;
  },

  // Nyole Payments & Checkout
  async createNyoleCheckout(params: {
    planId?: string;
    type?: 'subscription';
    paymentMethod: 'nyole_pay' | 'credit_card' | 'mobile_money' | 'crypto';
    planName?: string;
  }) {
    const res = await fetch(`${API_BASE}/nyole/create-checkout`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(params)
    });
    if (!res.ok) throw new Error('Échec de création du paiement Nyole');
    return res.json();
  },

  async simulateNyoleWebhook(transactionRef: string) {
    const res = await fetch(`${API_BASE}/nyole/simulate-confirm`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ transactionRef })
    });
    if (!res.ok) throw new Error('Simulation webhook échouée');
    return res.json();
  },

  // User Library & Purchases
  async getUserLibrary(): Promise<{ unlockedMedia: MediaItem[]; subscription: any }> {
    const res = await fetch(`${API_BASE}/user/library`, {
      headers: getAuthHeaders()
    });
    if (!res.ok) throw new Error('Impossible de charger la bibliothèque');
    return res.json();
  },

  async getUserPurchases(): Promise<{ purchases: NyoleTransaction[] }> {
    const res = await fetch(`${API_BASE}/user/purchases`, {
      headers: getAuthHeaders()
    });
    if (!res.ok) throw new Error('Impossible de charger l\'historique');
    return res.json();
  },

  // Admin Monetization & Analytics
  async getMonetizationSettings(): Promise<{ settings: MonetizationSettings }> {
    const res = await fetch(`${API_BASE}/admin/monetization`, {
      headers: getAuthHeaders()
    });
    if (!res.ok) throw new Error('Erreur chargement monétisation');
    return res.json();
  },

  async updateMonetizationSettings(settings: Partial<MonetizationSettings>): Promise<{ settings: MonetizationSettings }> {
    const res = await fetch(`${API_BASE}/admin/monetization`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(settings)
    });
    if (!res.ok) throw new Error('Erreur mise à jour monétisation');
    return res.json();
  },

  async recordMonetizationClick(params: { bannerId?: string; isPopunder?: boolean }): Promise<{ redirectUrl?: string }> {
    const res = await fetch(`${API_BASE}/monetization/click`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params)
    });
    return res.json();
  },

  async getAdminAnalytics(): Promise<{ stats: AnalyticsStats }> {
    const res = await fetch(`${API_BASE}/admin/analytics`, {
      headers: getAuthHeaders()
    });
    if (!res.ok) throw new Error('Erreur chargement analytics');
    return res.json();
  },

  async getDbSchemas(): Promise<{ mongooseCode: string; postgresqlCode: string }> {
    const res = await fetch(`${API_BASE}/admin/db-schemas`, {
      headers: getAuthHeaders()
    });
    return res.json();
  },

  // Site Pages & Global CMS Content
  async getSiteContent(): Promise<{ content: SitePagesContent }> {
    const res = await fetch(`${API_BASE}/site-content`);
    if (!res.ok) throw new Error('Erreur chargement des contenus');
    return res.json();
  },

  async updateSiteContent(content: Partial<SitePagesContent>): Promise<{ success: boolean; content: SitePagesContent }> {
    const res = await fetch(`${API_BASE}/site-content`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(content)
    });
    if (!res.ok) throw new Error('Erreur mise à jour des contenus du site');
    return res.json();
  },

  async resetSiteContent(): Promise<{ success: boolean; content: SitePagesContent }> {
    const res = await fetch(`${API_BASE}/site-content/reset`, {
      method: 'POST',
      headers: getAuthHeaders()
    });
    if (!res.ok) throw new Error('Erreur réinitialisation des contenus');
    return res.json();
  }
};
