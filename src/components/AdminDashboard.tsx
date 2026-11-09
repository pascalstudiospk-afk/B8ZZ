import React, { useState, useEffect } from 'react';
import {
  AnalyticsStats,
  CategoryItem,
  MediaItem,
  MonetizationSettings,
  User,
  SitePagesContent,
  HeroPageContent,
  VipPageContent,
  LibraryPageContent,
  MediaModalPageContent,
  AuthPageContent,
  GeneralSiteContent
} from '../types';
import { api } from '../services/api';
import {
  BarChart3,
  Film,
  DollarSign,
  Database,
  Plus,
  Trash2,
  Edit,
  Save,
  CheckCircle2,
  AlertCircle,
  Users,
  Download,
  FolderTree,
  ExternalLink,
  ShieldAlert,
  Loader2,
  RefreshCw,
  Copy,
  Check,
  Sparkles,
  Eye,
  Lock,
  Play,
  ArrowLeft,
  Home,
  LayoutTemplate,
  Globe,
  RotateCcw,
  Sliders,
  Layers,
  FileText
} from 'lucide-react';

interface AdminDashboardProps {
  currentUser: User | null;
  onMediaUpdated: () => void;
  onGoBack?: () => void;
  onGoHome?: () => void;
  siteContent?: SitePagesContent | null;
  onSiteContentUpdated?: (content: SitePagesContent) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  currentUser,
  onMediaUpdated,
  onGoBack,
  onGoHome,
  siteContent,
  onSiteContentUpdated
}) => {
  const [activeTab, setActiveTab] = useState<'analytics' | 'videos' | 'categories' | 'subscribers' | 'monetization' | 'database' | 'pages'>('analytics');
  const [stats, setStats] = useState<AnalyticsStats | null>(null);
  const [mediaList, setMediaList] = useState<MediaItem[]>([]);
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [subscribers, setSubscribers] = useState<(User & { videosWatchedCount: number; watchlistCount: number })[]>([]);
  const [monetization, setMonetization] = useState<MonetizationSettings | null>(null);
  const [dbSchemas, setDbSchemas] = useState<{ mongooseCode: string; postgresqlCode: string } | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // Site Pages CMS Editor State
  const [pagesActiveSection, setPagesActiveSection] = useState<'hero' | 'vip' | 'library' | 'mediaModal' | 'auth' | 'general'>('hero');
  const [editableContent, setEditableContent] = useState<SitePagesContent | null>(siteContent || null);
  const [cmsSaving, setCmsSaving] = useState<boolean>(false);
  const [cmsSuccess, setCmsSuccess] = useState<boolean>(false);
  const [cmsError, setCmsError] = useState<string | null>(null);

  // Video Create/Edit Form State
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [formTitle, setFormTitle] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formAccess, setFormAccess] = useState<'free' | 'exclusive'>('exclusive');
  const [formCategory, setFormCategory] = useState('Cinéma & Vidéo');
  const [formTags, setFormTags] = useState('8K RAW, Exclusif');
  const [formThumbnail, setFormThumbnail] = useState('/src/assets/images/hero_cinematic_creator_1793938277680.jpg');
  const [formMediaUrl, setFormMediaUrl] = useState('https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4');
  const [formDuration, setFormDuration] = useState('18:45');
  const [formResolution, setFormResolution] = useState('8K ProRes 4444 XQ');
  const [formLoading, setFormLoading] = useState(false);

  // Category Form State
  const [newCatName, setNewCatName] = useState('');
  const [newCatDesc, setNewCatDesc] = useState('');
  const [catLoading, setCatLoading] = useState(false);

  // Edit Category State
  const [editingCategory, setEditingCategory] = useState<CategoryItem | null>(null);
  const [editCatName, setEditCatName] = useState('');
  const [editCatDesc, setEditCatDesc] = useState('');
  const [editCatLoading, setEditCatLoading] = useState(false);

  useEffect(() => {
    loadAllAdminData();
  }, []);

  useEffect(() => {
    if (siteContent) {
      setEditableContent(siteContent);
    }
  }, [siteContent]);

  const loadAllAdminData = async () => {
    setLoading(true);
    try {
      const [statsRes, mediaRes, catRes, subRes, monRes, schemaRes, contentRes] = await Promise.all([
        api.getAdminAnalytics(),
        api.getMedia(),
        api.getCategories(),
        api.getSubscribers(),
        api.getMonetizationSettings(),
        api.getDbSchemas(),
        api.getSiteContent()
      ]);
      setStats(statsRes.stats);
      setMediaList(mediaRes.media);
      setCategories(catRes.categories);
      setSubscribers(subRes.subscribers);
      setMonetization(monRes.settings);
      setDbSchemas(schemaRes);
      if (contentRes?.content) {
        setEditableContent(contentRes.content);
        if (onSiteContentUpdated) onSiteContentUpdated(contentRes.content);
      }
    } catch (e) {
      console.error('Error fetching admin data:', e);
    } finally {
      setLoading(false);
    }
  };

  // CMS Site Content Action Handlers
  const handleSaveSitePages = async () => {
    if (!editableContent) return;
    setCmsSaving(true);
    setCmsError(null);
    setCmsSuccess(false);
    try {
      const res = await api.updateSiteContent(editableContent);
      setEditableContent(res.content);
      if (onSiteContentUpdated) onSiteContentUpdated(res.content);
      setCmsSuccess(true);
      setTimeout(() => setCmsSuccess(false), 4000);
    } catch (err: any) {
      setCmsError(err.message || 'Erreur lors de la sauvegarde des pages');
    } finally {
      setCmsSaving(false);
    }
  };

  const handleResetSitePages = async () => {
    if (!confirm('Voulez-vous vraiment réinitialiser tous les contenus et textes des pages à leurs valeurs par défaut ?')) return;
    setCmsSaving(true);
    setCmsError(null);
    try {
      const res = await api.resetSiteContent();
      setEditableContent(res.content);
      if (onSiteContentUpdated) onSiteContentUpdated(res.content);
      setCmsSuccess(true);
      setTimeout(() => setCmsSuccess(false), 4000);
    } catch (err: any) {
      setCmsError(err.message || 'Erreur lors de la réinitialisation');
    } finally {
      setCmsSaving(false);
    }
  };

  const updateHero = (key: string, value: any) => {
    if (!editableContent) return;
    setEditableContent({
      ...editableContent,
      hero: {
        ...editableContent.hero,
        [key]: value
      }
    });
  };

  const updateHeroStat = (key: keyof HeroPageContent['statsKpis'], value: string) => {
    if (!editableContent) return;
    setEditableContent({
      ...editableContent,
      hero: {
        ...editableContent.hero,
        statsKpis: {
          ...editableContent.hero.statsKpis,
          [key]: value
        }
      }
    });
  };

  const updateVip = (key: keyof VipPageContent, value: any) => {
    if (!editableContent) return;
    setEditableContent({
      ...editableContent,
      vip: {
        ...editableContent.vip,
        [key]: value
      }
    });
  };

  const updateVipPerk = (index: number, value: string) => {
    if (!editableContent) return;
    const newPerks = [...editableContent.vip.perks];
    newPerks[index] = value;
    setEditableContent({
      ...editableContent,
      vip: {
        ...editableContent.vip,
        perks: newPerks
      }
    });
  };

  const addVipPerk = () => {
    if (!editableContent) return;
    setEditableContent({
      ...editableContent,
      vip: {
        ...editableContent.vip,
        perks: [...editableContent.vip.perks, 'Nouvel avantage exclusif VIP']
      }
    });
  };

  const removeVipPerk = (index: number) => {
    if (!editableContent) return;
    const newPerks = editableContent.vip.perks.filter((_, i) => i !== index);
    setEditableContent({
      ...editableContent,
      vip: {
        ...editableContent.vip,
        perks: newPerks
      }
    });
  };

  const updateLibrary = (key: keyof LibraryPageContent, value: any) => {
    if (!editableContent) return;
    setEditableContent({
      ...editableContent,
      library: {
        ...editableContent.library,
        [key]: value
      }
    });
  };

  const updateMediaModal = (key: keyof MediaModalPageContent, value: any) => {
    if (!editableContent) return;
    setEditableContent({
      ...editableContent,
      mediaModal: {
        ...editableContent.mediaModal,
        [key]: value
      }
    });
  };

  const updateAuth = (key: keyof AuthPageContent, value: any) => {
    if (!editableContent) return;
    setEditableContent({
      ...editableContent,
      auth: {
        ...editableContent.auth,
        [key]: value
      }
    });
  };

  const updateGeneral = (key: keyof GeneralSiteContent, value: any) => {
    if (!editableContent) return;
    setEditableContent({
      ...editableContent,
      general: {
        ...editableContent.general,
        [key]: value
      }
    });
  };

  const updateAnnouncement = (key: 'enabled' | 'text' | 'linkText', value: any) => {
    if (!editableContent) return;
    setEditableContent({
      ...editableContent,
      general: {
        ...editableContent.general,
        announcementBanner: {
          ...editableContent.general.announcementBanner,
          [key]: value
        }
      }
    });
  };

  const handleOpenEdit = (item: MediaItem) => {
    setIsEditing(true);
    setEditId(item.id);
    setFormTitle(item.title);
    setFormDescription(item.description);
    setFormAccess(item.access);
    setFormCategory(item.category);
    setFormTags(item.tags.join(', '));
    setFormThumbnail(item.thumbnailUrl);
    setFormMediaUrl(item.mediaUrl);
    setFormDuration(item.duration || '15:00');
    setFormResolution(item.resolution);
    setActiveTab('videos');
    window.scrollTo({ top: 300, behavior: 'smooth' });
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditId(null);
    setFormTitle('');
    setFormDescription('');
    setFormAccess('exclusive');
    setFormCategory('Cinéma & Vidéo');
    setFormTags('8K RAW, Exclusif');
    setFormThumbnail('/src/assets/images/hero_cinematic_creator_1793938277680.jpg');
    setFormMediaUrl('https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4');
    setFormDuration('18:45');
    setFormResolution('8K ProRes 4444 XQ');
  };

  const handleSubmitVideoForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle || !formThumbnail || !formMediaUrl) return;
    setFormLoading(true);

    try {
      if (isEditing && editId) {
        // UPDATE existing video
        await api.updateMedia(editId, {
          title: formTitle,
          description: formDescription,
          access: formAccess,
          category: formCategory,
          categories: [formCategory],
          tags: formTags.split(',').map(t => t.trim()),
          thumbnailUrl: formThumbnail,
          mediaUrl: formMediaUrl,
          duration: formDuration,
          resolution: formResolution
        });
        alert('Vidéo modifiée avec succès !');
        handleCancelEdit();
      } else {
        // CREATE new video
        await api.createMedia({
          title: formTitle,
          description: formDescription,
          type: 'video',
          access: formAccess,
          category: formCategory,
          categories: [formCategory],
          tags: formTags.split(',').map(t => t.trim()),
          thumbnailUrl: formThumbnail,
          mediaUrl: formMediaUrl,
          duration: formDuration,
          resolution: formResolution
        });
        alert('Nouvelle vidéo publiée dans le catalogue !');
        handleCancelEdit();
      }

      await loadAllAdminData();
      onMediaUpdated();
    } catch (err: any) {
      alert(err.message || 'Erreur lors de l\'enregistrement de la vidéo');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteVideo = async (id: string) => {
    if (!confirm('Confirmez-vous le retrait définitif de cette vidéo du catalogue ?')) return;
    try {
      await api.deleteMedia(id);
      setMediaList(prev => prev.filter(m => m.id !== id));
      onMediaUpdated();
    } catch (e) {
      alert('Erreur lors de la suppression');
    }
  };

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName) return;
    setCatLoading(true);
    try {
      await api.createCategory({ name: newCatName, description: newCatDesc });
      setNewCatName('');
      setNewCatDesc('');
      const updated = await api.getCategories();
      setCategories(updated.categories);
      if (onMediaUpdated) onMediaUpdated();
      alert('Nouvelle catégorie ajoutée avec succès !');
    } catch (err: any) {
      alert(err.message || 'Erreur création catégorie');
    } finally {
      setCatLoading(false);
    }
  };

  const handleStartEditCategory = (cat: CategoryItem) => {
    setEditingCategory(cat);
    setEditCatName(cat.name);
    setEditCatDesc(cat.description || '');
  };

  const handleCancelEditCategory = () => {
    setEditingCategory(null);
    setEditCatName('');
    setEditCatDesc('');
  };

  const handleUpdateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCategory || !editCatName.trim()) return;
    setEditCatLoading(true);
    try {
      const res = await api.updateCategory(editingCategory.id, {
        name: editCatName.trim(),
        description: editCatDesc.trim()
      });
      const updated = await api.getCategories();
      setCategories(updated.categories);
      setEditingCategory(null);
      setEditCatName('');
      setEditCatDesc('');
      if (onMediaUpdated) onMediaUpdated();
      alert(`La catégorie "${res.category.name}" a été modifiée avec succès !`);
    } catch (err: any) {
      alert(err.message || 'Erreur lors de la modification de la catégorie');
    } finally {
      setEditCatLoading(false);
    }
  };

  const handleDeleteCategory = async (id: string) => {
    if (!confirm('Supprimer cette catégorie ?')) return;
    try {
      await api.deleteCategory(id);
      const updated = await api.getCategories();
      setCategories(updated.categories);
      if (onMediaUpdated) onMediaUpdated();
    } catch (e) {
      alert('Erreur lors de la suppression de la catégorie');
    }
  };

  const handleSaveMonetization = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!monetization) return;
    try {
      await api.updateMonetizationSettings(monetization);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (e) {
      alert('Erreur lors de la sauvegarde de la monétisation');
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard?.writeText(text);
    setCopiedCode(label);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  if (currentUser?.role !== 'admin') {
    return (
      <div className="py-12 max-w-xl mx-auto px-6 text-center space-y-4">
        <div className="flex items-center justify-start gap-2.5 mb-4">
          {onGoBack && (
            <button
              onClick={onGoBack}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#121212] hover:bg-[#1a1a1a] text-zinc-300 hover:text-white border border-[#222222] hover:border-[#FF0033]/50 transition-all text-xs font-semibold group shadow-sm"
              title="Retour à la page précédente"
            >
              <ArrowLeft className="w-4 h-4 text-[#FF0033] group-hover:-translate-x-1 transition-transform" />
              <span>Page précédente</span>
            </button>
          )}

          {onGoHome && (
            <button
              onClick={onGoHome}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#121212] hover:bg-[#1a1a1a] text-zinc-300 hover:text-white border border-[#222222] hover:border-[#FF0033]/50 transition-all text-xs font-semibold group shadow-sm"
              title="Retour à la page d'accueil (Catalogue)"
            >
              <Home className="w-4 h-4 text-[#FF0033] group-hover:scale-110 transition-transform" />
              <span>Accueil</span>
            </button>
          )}
        </div>
        <div className="w-16 h-16 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center mx-auto">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-white">Accès Réservé à l'Administration</h2>
        <p className="text-xs text-zinc-400 leading-relaxed">
          Le panneau CMS nécessite les permissions administrateur. Basculez votre rôle vers « ADMIN » dans la barre supérieure pour explorer les fonctionnalités de gestion.
        </p>
      </div>
    );
  }

  return (
    <div className="py-8 max-w-7xl mx-auto px-4 sm:px-6">
      {/* Top Back & Home Navigation Bar */}
      <div className="flex items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-2.5">
          {onGoBack && (
            <button
              onClick={onGoBack}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#121212] hover:bg-[#1a1a1a] text-zinc-300 hover:text-white border border-[#222222] hover:border-[#FF0033]/50 transition-all text-xs font-semibold group shadow-sm"
              title="Retour à la page précédente"
            >
              <ArrowLeft className="w-4 h-4 text-[#FF0033] group-hover:-translate-x-1 transition-transform" />
              <span>Page précédente</span>
            </button>
          )}

          {onGoHome && (
            <button
              onClick={onGoHome}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#121212] hover:bg-[#1a1a1a] text-zinc-300 hover:text-white border border-[#222222] hover:border-[#FF0033]/50 transition-all text-xs font-semibold group shadow-sm"
              title="Retour à la page d'accueil (Catalogue)"
            >
              <Home className="w-4 h-4 text-[#FF0033] group-hover:scale-110 transition-transform" />
              <span>Accueil</span>
            </button>
          )}
        </div>

        <div className="text-[11px] font-mono text-zinc-500 hidden sm:flex items-center gap-1.5">
          <span>BUZZLEAKS</span>
          <span>&gt;</span>
          <span className="text-zinc-300">Console Administration</span>
        </div>
      </div>

      {/* Top CMS Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 mb-6 border-b border-[#222222]">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono uppercase text-[#FF334B] font-bold mb-1">
            <span>Console CMS BUZZLEAKS</span>
            <span aria-hidden="true" className="text-zinc-600">·</span>
            <span>Streaming Privé & Abonnés</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white font-display">
            Gestion des Contenus & Abonnés
          </h1>
        </div>

        <button
          onClick={loadAllAdminData}
          className="px-3.5 py-2 text-xs font-medium rounded-lg bg-[#121212] hover:bg-[#1a1a1a] text-zinc-300 border border-[#222222] transition-colors flex items-center gap-2 self-start sm:self-auto"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Synchroniser les données</span>
        </button>
      </div>

      {/* Nav Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-8 border-b border-[#222222] scrollbar-thin">
        <button
          onClick={() => setActiveTab('analytics')}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'analytics'
              ? 'bg-gradient-to-r from-[#FF0033] to-[#FF4500] text-white shadow-md shadow-[#FF0033]/25'
              : 'bg-[#121212] text-zinc-300 hover:bg-[#1a1a1a] border border-[#222222]'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          <span>Tableau de Bord & Vues</span>
        </button>

        <button
          onClick={() => setActiveTab('videos')}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'videos'
              ? 'bg-gradient-to-r from-[#FF0033] to-[#FF4500] text-white shadow-md shadow-[#FF0033]/25'
              : 'bg-[#121212] text-zinc-300 hover:bg-[#1a1a1a] border border-[#222222]'
          }`}
        >
          <Film className="w-4 h-4" />
          <span>Catalogue Vidéos ({mediaList.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('categories')}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'categories'
              ? 'bg-gradient-to-r from-[#FF0033] to-[#FF4500] text-white shadow-md shadow-[#FF0033]/25'
              : 'bg-[#121212] text-zinc-300 hover:bg-[#1a1a1a] border border-[#222222]'
          }`}
        >
          <FolderTree className="w-4 h-4" />
          <span>Catégories ({categories.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('subscribers')}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'subscribers'
              ? 'bg-gradient-to-r from-[#FF0033] to-[#FF4500] text-white shadow-md shadow-[#FF0033]/25'
              : 'bg-[#121212] text-zinc-300 hover:bg-[#1a1a1a] border border-[#222222]'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Base Abonnés ({subscribers.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('monetization')}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'monetization'
              ? 'bg-gradient-to-r from-[#FF0033] to-[#FF4500] text-white shadow-md shadow-[#FF0033]/25'
              : 'bg-[#121212] text-zinc-300 hover:bg-[#1a1a1a] border border-[#222222]'
          }`}
        >
          <DollarSign className="w-4 h-4" />
          <span>Monétisation & API Paiement</span>
        </button>

        <button
          onClick={() => setActiveTab('pages')}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'pages'
              ? 'bg-gradient-to-r from-[#FF0033] to-[#FF4500] text-white shadow-md shadow-[#FF0033]/25'
              : 'bg-[#121212] text-zinc-300 hover:bg-[#1a1a1a] border border-[#222222]'
          }`}
        >
          <LayoutTemplate className="w-4 h-4" />
          <span>Pages & Contenus (CMS)</span>
        </button>

        <button
          onClick={() => setActiveTab('database')}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'database'
              ? 'bg-gradient-to-r from-[#FF0033] to-[#FF4500] text-white shadow-md shadow-[#FF0033]/25'
              : 'bg-[#121212] text-zinc-300 hover:bg-[#1a1a1a] border border-[#222222]'
          }`}
        >
          <Database className="w-4 h-4" />
          <span>Schémas Base de Données</span>
        </button>
      </div>

      {loading ? (
        <div className="py-24 flex flex-col items-center justify-center text-zinc-400 space-y-3">
          <Loader2 className="w-8 h-8 animate-spin text-amber-400" />
          <span className="text-xs">Chargement du CMS...</span>
        </div>
      ) : activeTab === 'analytics' ? (
        /* ================= 1. ANALYTICS & STATS ================= */
        <div className="space-y-8">
          {/* Key Metric KPI Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 rounded-2xl bg-zinc-900/80 border border-zinc-800 space-y-1">
              <div className="text-xs font-mono uppercase text-zinc-400">Total Vues Vidéos</div>
              <div className="text-2xl sm:text-3xl font-extrabold font-mono text-white tabular-nums">
                {stats?.totalVideoViews.toLocaleString() || '111,270'}
              </div>
              <div className="text-[11px] text-emerald-400 flex items-center gap-1">
                <span>Lecture haute fidélité 8K RAW</span>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-zinc-900/80 border border-zinc-800 space-y-1">
              <div className="text-xs font-mono uppercase text-amber-400">Abonnés Enregistrés</div>
              <div className="text-2xl sm:text-3xl font-extrabold font-mono text-amber-400 tabular-nums">
                {stats?.totalSubscribersRegistered || subscribers.length}
              </div>
              <div className="text-[11px] text-zinc-400">
                {stats?.activeSubscribers || 3} abonnés payants VIP actifs
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-zinc-900/80 border border-zinc-800 space-y-1">
              <div className="text-xs font-mono uppercase text-blue-400">Revenus Abonnements (Mobile Money & CB)</div>
              <div className="text-2xl sm:text-3xl font-extrabold font-mono text-blue-400 tabular-nums">
                {stats?.nyoleRevenue?.toFixed(2) || '99.97'} €
              </div>
              <div className="text-[11px] text-zinc-400">
                {stats?.nyoleSubscriptionsCount || 3} souscriptions confirmées
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-zinc-900/80 border border-zinc-800 space-y-1">
              <div className="text-xs font-mono uppercase text-emerald-400">Gains Publicitaires & Clics</div>
              <div className="text-2xl sm:text-3xl font-extrabold font-mono text-white tabular-nums">
                {stats?.adEarnings.toFixed(2) || '1,279.33'} €
              </div>
              <div className="text-[11px] text-zinc-400">
                {stats?.totalAdClicks} clics publicitaires monétisés
              </div>
            </div>
          </div>

          {/* Top Trending Videos */}
          <div className="p-6 rounded-2xl bg-zinc-900/60 border border-zinc-800 space-y-4">
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider font-mono flex items-center gap-2">
              <Play className="w-4 h-4 text-amber-400" />
              <span>Vidéos les Plus Populaires (Classement par Vues)</span>
            </h3>

            <div className="space-y-3">
              {stats?.topVideos?.map((vid, idx) => (
                <div
                  key={vid.id}
                  className="flex items-center justify-between p-3.5 rounded-xl bg-zinc-950/70 border border-zinc-800/80 text-xs"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="w-6 h-6 rounded-full bg-zinc-800 font-mono text-amber-400 font-bold flex items-center justify-center text-xs shrink-0">
                      {idx + 1}
                    </span>
                    <div className="min-w-0">
                      <div className="font-semibold text-white truncate max-w-md">{vid.title}</div>
                      <div className="text-zinc-500 text-[11px] mt-0.5">{vid.category}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 shrink-0 font-mono text-xs">
                    <span className="text-amber-400 font-bold tabular-nums">
                      {vid.views.toLocaleString()} vues
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : activeTab === 'videos' ? (
        /* ================= 2. VIDEOS CRUD (CREATION & MODIFICATION) ================= */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Form Create / Edit */}
          <div className="lg:col-span-5 p-6 rounded-2xl bg-zinc-900/80 border border-zinc-800 space-y-5">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <div className="flex items-center gap-2 text-white font-semibold text-base">
                {isEditing ? <Edit className="w-5 h-5 text-amber-400" /> : <Plus className="w-5 h-5 text-amber-400" />}
                <span>{isEditing ? 'Modifier la Vidéo' : 'Publier une Nouvelle Vidéo'}</span>
              </div>
              {isEditing && (
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  className="text-xs text-zinc-400 hover:text-white underline"
                >
                  Annuler la modification
                </button>
              )}
            </div>

            <form onSubmit={handleSubmitVideoForm} className="space-y-4 text-xs">
              <div>
                <label className="block text-zinc-300 mb-1 font-medium">Titre de la vidéo :</label>
                <input
                  type="text"
                  required
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder="ex: Tokyo Rain 8K Documentary"
                  className="w-full px-3 py-2 rounded-lg bg-zinc-950 border border-zinc-800 focus:border-amber-400 text-white text-xs"
                />
              </div>

              <div>
                <label className="block text-zinc-300 mb-1 font-medium">Description complète :</label>
                <textarea
                  rows={2}
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="Détails du tournage, workflow post-production et matériel..."
                  className="w-full px-3 py-2 rounded-lg bg-zinc-950 border border-zinc-800 focus:border-amber-400 text-white text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-300 mb-1 font-medium">Catégorie :</label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-zinc-950 border border-zinc-800 text-white text-xs"
                  >
                    {categories.map(c => (
                      <option key={c.id} value={c.name}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-zinc-300 mb-1 font-medium">Statut d'accès :</label>
                  <select
                    value={formAccess}
                    onChange={(e) => setFormAccess(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-lg bg-zinc-950 border border-zinc-800 text-white text-xs"
                  >
                    <option value="exclusive">Exclusif (Abonnement Requis)</option>
                    <option value="free">Gratuit (Libre Accès)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-300 mb-1 font-medium">Résolution du master :</label>
                  <input
                    type="text"
                    value={formResolution}
                    onChange={(e) => setFormResolution(e.target.value)}
                    placeholder="8K ProRes 4444 XQ"
                    className="w-full px-3 py-2 rounded-lg bg-zinc-950 border border-zinc-800 text-white text-xs"
                  />
                </div>

                <div>
                  <label className="block text-zinc-300 mb-1 font-medium">Durée (mm:ss) :</label>
                  <input
                    type="text"
                    value={formDuration}
                    onChange={(e) => setFormDuration(e.target.value)}
                    placeholder="18:45"
                    className="w-full px-3 py-2 rounded-lg bg-zinc-950 border border-zinc-800 text-white text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-zinc-300 mb-1 font-medium">Tags (séparés par virgules) :</label>
                <input
                  type="text"
                  value={formTags}
                  onChange={(e) => setFormTags(e.target.value)}
                  placeholder="8K RAW, DaVinci LUT, Exclusive"
                  className="w-full px-3 py-2 rounded-lg bg-zinc-950 border border-zinc-800 text-white text-xs"
                />
              </div>

              <div>
                <label className="block text-zinc-300 mb-1 font-medium">URL de la miniature (Poster) :</label>
                <input
                  type="text"
                  required
                  value={formThumbnail}
                  onChange={(e) => setFormThumbnail(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-zinc-950 border border-zinc-800 text-white text-xs font-mono"
                />
              </div>

              <div>
                <label className="block text-zinc-300 mb-1 font-medium">URL de la vidéo source (MP4 / HLS / WebM) :</label>
                <input
                  type="text"
                  required
                  value={formMediaUrl}
                  onChange={(e) => setFormMediaUrl(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-zinc-950 border border-zinc-800 text-white text-xs font-mono"
                />
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="submit"
                  disabled={formLoading}
                  className="flex-1 py-2.5 px-4 rounded-xl bg-amber-400 hover:bg-amber-300 disabled:opacity-50 text-zinc-950 font-bold text-xs transition-colors flex items-center justify-center gap-2 shadow-md"
                >
                  {formLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      {isEditing ? <Save className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                      <span>{isEditing ? 'Enregistrer les Modifications' : 'Publier la Vidéo'}</span>
                    </>
                  )}
                </button>

                {isEditing && (
                  <button
                    type="button"
                    onClick={handleCancelEdit}
                    className="py-2.5 px-4 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs"
                  >
                    Annuler
                  </button>
                )}
              </div>
            </form>
          </div>

          {/* Videos Catalog List with Edit & Delete */}
          <div className="lg:col-span-7 space-y-4">
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider font-mono">
              Vidéos Actives sur la Plateforme ({mediaList.length})
            </h3>

            <div className="space-y-3">
              {mediaList.map(item => (
                <div
                  key={item.id}
                  className="p-4 rounded-xl bg-zinc-900/70 border border-zinc-800 flex items-center justify-between gap-4 hover:border-zinc-700 transition-colors"
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <img
                      src={item.thumbnailUrl}
                      alt={item.title}
                      className="w-16 h-11 object-cover rounded-lg shrink-0 bg-zinc-950 border border-zinc-800"
                      referrerPolicy="no-referrer"
                    />
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-white truncate max-w-sm">
                          {item.title}
                        </span>
                        <span
                          className={`px-1.5 py-0.5 text-[10px] font-mono uppercase font-bold rounded ${
                            item.access === 'free' ? 'text-emerald-400 bg-emerald-950/40 border border-emerald-500/30' : 'text-amber-400 bg-amber-950/40 border border-amber-500/30'
                          }`}
                        >
                          {item.access === 'free' ? 'Gratuit' : 'Exclusif'}
                        </span>
                      </div>
                      <div className="text-[11px] text-zinc-400 mt-1 flex items-center gap-2">
                        <span>{item.category}</span>
                        <span aria-hidden="true">·</span>
                        <span className="font-mono">{item.resolution}</span>
                        <span aria-hidden="true">·</span>
                        <span className="font-mono">{item.duration}</span>
                        <span aria-hidden="true">·</span>
                        <span className="font-mono">{item.viewsCount} vues</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => handleOpenEdit(item)}
                      className="p-2 text-zinc-400 hover:text-amber-400 hover:bg-zinc-800 rounded-lg transition-colors"
                      title="Modifier les métadonnées"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteVideo(item.id)}
                      className="p-2 text-zinc-400 hover:text-red-400 hover:bg-zinc-800 rounded-lg transition-colors"
                      title="Supprimer la vidéo"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : activeTab === 'categories' ? (
        /* ================= 3. CATEGORIES MANAGEMENT ================= */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-5 p-6 rounded-2xl bg-zinc-900/80 border border-zinc-800 space-y-4">
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider font-mono flex items-center gap-2">
              <Plus className="w-4 h-4 text-amber-400" />
              <span>Ajouter une Nouvelle Catégorie</span>
            </h3>

            <form onSubmit={handleCreateCategory} className="space-y-4 text-xs">
              <div>
                <label className="block text-zinc-300 mb-1 font-medium">Nom de la catégorie :</label>
                <input
                  type="text"
                  required
                  value={newCatName}
                  onChange={(e) => setNewCatName(e.target.value)}
                  placeholder="ex: Documentaires & Explorations"
                  className="w-full px-3 py-2 rounded-lg bg-zinc-950 border border-zinc-800 text-white"
                />
              </div>

              <div>
                <label className="block text-zinc-300 mb-1 font-medium">Description :</label>
                <textarea
                  rows={2}
                  value={newCatDesc}
                  onChange={(e) => setNewCatDesc(e.target.value)}
                  placeholder="Courte description pour le public..."
                  className="w-full px-3 py-2 rounded-lg bg-zinc-950 border border-zinc-800 text-white"
                />
              </div>

              <button
                type="submit"
                disabled={catLoading}
                className="w-full py-2.5 px-4 rounded-xl bg-amber-400 hover:bg-amber-300 disabled:opacity-50 text-zinc-950 font-bold text-xs transition-colors flex items-center justify-center gap-2"
              >
                {catLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>Créer la Catégorie</span>}
              </button>
            </form>
          </div>

          <div className="lg:col-span-7 space-y-4">
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider font-mono">
              Catégories Existantes ({categories.length})
            </h3>

            <div className="space-y-3">
              {categories.map(cat => {
                const isEditingThis = editingCategory?.id === cat.id;

                if (isEditingThis) {
                  return (
                    <form
                      key={cat.id}
                      onSubmit={handleUpdateCategory}
                      className="p-4 rounded-xl bg-zinc-900 border border-amber-400/60 space-y-3 text-xs shadow-lg shadow-amber-950/20 transition-all"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                          <Edit className="w-3.5 h-3.5" />
                          <span>Modifier la Catégorie</span>
                        </span>
                        <span className="text-[10px] font-mono text-zinc-500">ID: {cat.id}</span>
                      </div>

                      <div className="space-y-1">
                        <label className="block text-zinc-300 font-medium">Nom de la catégorie :</label>
                        <input
                          type="text"
                          required
                          value={editCatName}
                          onChange={(e) => setEditCatName(e.target.value)}
                          placeholder="Nom de la catégorie"
                          className="w-full px-3 py-2 rounded-lg bg-zinc-950 border border-zinc-700 text-white font-medium focus:outline-none focus:border-amber-400"
                          autoFocus
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="block text-zinc-300 font-medium">Description (optionnelle) :</label>
                        <input
                          type="text"
                          value={editCatDesc}
                          onChange={(e) => setEditCatDesc(e.target.value)}
                          placeholder="Description..."
                          className="w-full px-3 py-2 rounded-lg bg-zinc-950 border border-zinc-700 text-white focus:outline-none focus:border-amber-400"
                        />
                      </div>

                      <div className="flex items-center gap-2 pt-1">
                        <button
                          type="submit"
                          disabled={editCatLoading}
                          className="px-4 py-2 rounded-lg bg-amber-400 hover:bg-amber-300 text-zinc-950 font-bold text-xs transition-colors flex items-center gap-1.5 disabled:opacity-50"
                        >
                          {editCatLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                          <span>Enregistrer les modifications</span>
                        </button>
                        <button
                          type="button"
                          onClick={handleCancelEditCategory}
                          className="px-3 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs transition-colors"
                        >
                          Annuler
                        </button>
                      </div>
                    </form>
                  );
                }

                return (
                  <div
                    key={cat.id}
                    className="p-4 rounded-xl bg-zinc-900/70 border border-zinc-800 flex items-center justify-between gap-4 text-xs hover:border-zinc-700 transition-colors"
                  >
                    <div>
                      <div className="font-semibold text-white flex items-center gap-2">
                        <span>{cat.name}</span>
                        {cat.id === 'cat_all' && (
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-zinc-800 text-zinc-400">Générale</span>
                        )}
                      </div>
                      <div className="text-[11px] font-mono text-zinc-400 mt-0.5">
                        Slug : /{cat.slug} · {cat.count || 0} vidéos associées
                      </div>
                      {cat.description && (
                        <p className="text-[11px] text-zinc-400 mt-1 line-clamp-1">{cat.description}</p>
                      )}
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleStartEditCategory(cat)}
                        className="px-2.5 py-1.5 text-zinc-300 hover:text-amber-400 hover:bg-zinc-800 rounded-lg transition-colors flex items-center gap-1.5 text-[11px] font-medium border border-zinc-800 hover:border-amber-400/30"
                        title="Modifier le nom ou la description"
                      >
                        <Edit className="w-3.5 h-3.5" />
                        <span>Modifier</span>
                      </button>

                      {cat.id !== 'cat_all' && (
                        <button
                          onClick={() => handleDeleteCategory(cat.id)}
                          className="p-2 text-zinc-400 hover:text-red-400 hover:bg-zinc-800 rounded-lg transition-colors border border-transparent hover:border-red-500/20"
                          title="Supprimer la catégorie"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      ) : activeTab === 'subscribers' ? (
        /* ================= 4. SUBSCRIBERS DATABASE ================= */
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-zinc-900/60 border border-zinc-800">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Users className="w-5 h-5 text-amber-400" />
                <span>Base de Données des Abonnés ({subscribers.length})</span>
              </h3>
              <p className="text-xs text-zinc-400 mt-1">
                Collecte sécurisée des utilisateurs enregistrés, adresses email, statuts d'abonnements et historique.
              </p>
            </div>

            <a
              href={api.getExportSubscribersUrl()}
              download
              className="px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-zinc-950 font-bold text-xs transition-colors flex items-center gap-2 shrink-0 shadow-sm"
            >
              <Download className="w-4 h-4" />
              <span>Exporter en CSV</span>
            </a>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-zinc-800 bg-zinc-900/40">
            <table className="w-full text-left text-xs">
              <thead className="bg-zinc-950/80 text-zinc-400 uppercase font-mono text-[11px] border-b border-zinc-800">
                <tr>
                  <th className="py-3 px-4">Abonné</th>
                  <th className="py-3 px-4">Email</th>
                  <th className="py-3 px-4">Statut Abonnement</th>
                  <th className="py-3 px-4">Date d'Inscription</th>
                  <th className="py-3 px-4">Vidéos Vues</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60 font-mono text-zinc-300">
                {subscribers.map(sub => (
                  <tr key={sub.id} className="hover:bg-zinc-800/30 transition-colors">
                    <td className="py-3.5 px-4 font-sans text-white font-semibold flex items-center gap-2.5">
                      <img
                        src={sub.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=160&q=80'}
                        alt={sub.name}
                        className="w-7 h-7 rounded-full object-cover border border-zinc-700"
                        referrerPolicy="no-referrer"
                      />
                      <span>{sub.name}</span>
                    </td>
                    <td className="py-3.5 px-4 text-zinc-300">{sub.email}</td>
                    <td className="py-3.5 px-4 font-sans">
                      {sub.subscription?.active ? (
                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[11px] font-semibold border border-emerald-500/30">
                          <Sparkles className="w-3 h-3 text-emerald-400" />
                          <span>Abonné VIP (Mobile Money/CB)</span>
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded bg-zinc-800 text-zinc-400 text-[11px]">
                          Compte Gratuit
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-zinc-400 text-[11px]">
                      {new Date(sub.createdAt || '2026-01-15').toLocaleDateString('fr-FR')}
                    </td>
                    <td className="py-3.5 px-4 text-zinc-300 font-bold tabular-nums">
                      {sub.videosWatchedCount} vidéos
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : activeTab === 'monetization' ? (
        /* ================= 5. MONETIZATION & PAYMENT API ================= */
        monetization && (
          <form onSubmit={handleSaveMonetization} className="space-y-8">
            {saveSuccess && (
              <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                <span>Paramètres de monétisation enregistrés avec succès !</span>
              </div>
            )}

            {/* Payment API Configuration */}
            <div className="p-6 rounded-2xl bg-zinc-900/60 border border-zinc-800 space-y-4">
              <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold font-mono text-xs">
                    PAY
                  </div>
                  <h3 className="text-sm font-semibold text-white">Paramètres Passerelle API Paiement (Mobile Money & CB)</h3>
                </div>
                <span className="px-2.5 py-1 text-[10px] font-mono font-bold rounded bg-amber-400/20 text-amber-400 border border-amber-400/40 uppercase">
                  {monetization.nyole.environment}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block text-zinc-300 mb-1 font-medium">Merchant ID (Passerelle Paiement) :</label>
                  <input
                    type="text"
                    value={monetization.nyole.merchantId}
                    onChange={(e) =>
                      setMonetization({
                        ...monetization,
                        nyole: { ...monetization.nyole, merchantId: e.target.value }
                      })
                    }
                    className="w-full px-3 py-2 rounded-lg bg-zinc-950 border border-zinc-800 text-white font-mono"
                  />
                </div>

                <div>
                  <label className="block text-zinc-300 mb-1 font-medium">Clé Secrète API Paiement :</label>
                  <input
                    type="password"
                    value={monetization.nyole.apiKey}
                    onChange={(e) =>
                      setMonetization({
                        ...monetization,
                        nyole: { ...monetization.nyole, apiKey: e.target.value }
                      })
                    }
                    className="w-full px-3 py-2 rounded-lg bg-zinc-950 border border-zinc-800 text-white font-mono"
                  />
                </div>

                <div>
                  <label className="block text-zinc-300 mb-1 font-medium">URL de Webhook (Confirmation directe) :</label>
                  <input
                    type="text"
                    value={monetization.nyole.webhookUrl}
                    onChange={(e) =>
                      setMonetization({
                        ...monetization,
                        nyole: { ...monetization.nyole, webhookUrl: e.target.value }
                      })
                    }
                    className="w-full px-3 py-2 rounded-lg bg-zinc-950 border border-zinc-800 text-amber-400 font-mono"
                  />
                </div>

                <div className="flex items-center gap-3 pt-6">
                  <input
                    type="checkbox"
                    id="autoUnlock"
                    checked={monetization.nyole.autoUnlockOnWebhook}
                    onChange={(e) =>
                      setMonetization({
                        ...monetization,
                        nyole: { ...monetization.nyole, autoUnlockOnWebhook: e.target.checked }
                      })
                    }
                    className="w-4 h-4 rounded border-zinc-700 text-amber-400 focus:ring-amber-400"
                  />
                  <label htmlFor="autoUnlock" className="text-zinc-300 text-xs cursor-pointer">
                    Déblocage immédiat de tous les contenus dès réception du webhook de paiement
                  </label>
                </div>
              </div>
            </div>

            {/* Click Monetization */}
            <div className="p-6 rounded-2xl bg-zinc-900/60 border border-zinc-800 space-y-4">
              <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                <h3 className="text-sm font-semibold text-white">Monétisation au Clic & Popunder</h3>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-zinc-400">Actif :</span>
                  <input
                    type="checkbox"
                    checked={monetization.clickMonetization.enabled}
                    onChange={(e) =>
                      setMonetization({
                        ...monetization,
                        clickMonetization: {
                          ...monetization.clickMonetization,
                          enabled: e.target.checked
                        }
                      })
                    }
                    className="w-4 h-4 rounded text-amber-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block text-zinc-300 mb-1 font-medium">Mode de déclenchement :</label>
                  <select
                    value={monetization.clickMonetization.mode}
                    onChange={(e) =>
                      setMonetization({
                        ...monetization,
                        clickMonetization: {
                          ...monetization.clickMonetization,
                          mode: e.target.value as any
                        }
                      })
                    }
                    className="w-full px-3 py-2 rounded-lg bg-zinc-950 border border-zinc-800 text-white"
                  >
                    <option value="popunder">Popunder sous la fenêtre active</option>
                    <option value="interstitial_redirect">Page interstitielle sponsorisée</option>
                    <option value="direct_link">Redirection directe sécurisée</option>
                  </select>
                </div>

                <div>
                  <label className="block text-zinc-300 mb-1 font-medium">Lien de destination sponsorisée :</label>
                  <input
                    type="url"
                    value={monetization.clickMonetization.targetUrl}
                    onChange={(e) =>
                      setMonetization({
                        ...monetization,
                        clickMonetization: {
                          ...monetization.clickMonetization,
                          targetUrl: e.target.value
                        }
                      })
                    }
                    className="w-full px-3 py-2 rounded-lg bg-zinc-950 border border-zinc-800 text-white font-mono"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="py-3 px-6 rounded-xl bg-amber-400 hover:bg-amber-300 text-zinc-950 font-bold text-xs transition-colors flex items-center gap-2 shadow-lg"
            >
              <Save className="w-4 h-4" />
              <span>Enregistrer tous les paramètres de monétisation</span>
            </button>
          </form>
        )
      ) : activeTab === 'pages' ? (
        /* ================= 6. SITE PAGES & CONTENT CMS EDITOR ================= */
        <div className="space-y-6">
          {/* Top CMS Editor Bar with Save & Reset Actions */}
          <div className="p-6 rounded-2xl bg-[#121212] border border-[#222222] shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-xs font-mono uppercase text-[#FF334B] font-bold mb-1">
                <LayoutTemplate className="w-4 h-4 text-[#FF0033]" />
                <span>CMS Éditeur de Pages en Temps Réel</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-white font-display">
                Gestion des Textes, Titres & Sections du Site
              </h2>
              <p className="text-xs text-zinc-400 mt-1">
                Modifiez directement chaque page publique de BUZZLEAKS. Les changements s'appliquent immédiatement pour tous les visiteurs.
              </p>
            </div>

            <div className="flex items-center gap-2.5 w-full md:w-auto">
              <button
                type="button"
                onClick={handleResetSitePages}
                disabled={cmsSaving}
                className="px-4 py-2.5 rounded-xl bg-black hover:bg-zinc-900 text-zinc-300 hover:text-white border border-[#222222] text-xs font-semibold flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
                title="Rétablir les textes d'usine"
              >
                <RotateCcw className="w-3.5 h-3.5 text-zinc-400" />
                <span>Rétablir défaut</span>
              </button>

              <button
                type="button"
                onClick={handleSaveSitePages}
                disabled={cmsSaving}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#FF0033] to-[#FF4500] hover:brightness-110 active:scale-95 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-lg shadow-[#FF0033]/30 transition-all disabled:opacity-50"
              >
                {cmsSaving ? (
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                ) : cmsSuccess ? (
                  <Check className="w-4 h-4 text-white" />
                ) : (
                  <Save className="w-4 h-4 text-white" />
                )}
                <span>{cmsSaving ? 'Enregistrement...' : cmsSuccess ? 'Modifications enregistrées !' : 'Enregistrer les pages'}</span>
              </button>
            </div>
          </div>

          {/* Success / Error Feedback Alerts */}
          {cmsSuccess && (
            <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-2.5 animate-fadeIn">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Toutes les pages du site ont été mises à jour avec succès et synchronisées en direct !</span>
            </div>
          )}

          {cmsError && (
            <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
              <span>{cmsError}</span>
            </div>
          )}

          {/* Sub-Page Navigation Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin">
            {[
              { id: 'hero', label: "Page d'Accueil (Hero & Vitrine)", icon: Home },
              { id: 'vip', label: 'Pass VIP & Formules', icon: Sparkles },
              { id: 'library', label: 'Espace Membre (Bibliothèque)', icon: Users },
              { id: 'mediaModal', label: 'Lecteur Vidéo & Paywall', icon: Film },
              { id: 'auth', label: 'Connexion / Inscription', icon: Lock },
              { id: 'general', label: 'Pied de Page & Annonce', icon: Globe }
            ].map(tab => {
              const Icon = tab.icon;
              const isSelected = pagesActiveSection === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setPagesActiveSection(tab.id as any)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 whitespace-nowrap transition-all ${
                    isSelected
                      ? 'bg-zinc-800 text-white border border-[#FF0033]/60 shadow-sm'
                      : 'bg-black/60 text-zinc-400 hover:text-white hover:bg-zinc-900 border border-[#222222]'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isSelected ? 'text-[#FF0033]' : 'text-zinc-500'}`} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {!editableContent ? (
            <div className="py-12 text-center text-zinc-400 text-xs">
              <Loader2 className="w-6 h-6 animate-spin mx-auto text-[#FF0033] mb-2" />
              <span>Chargement du contenu éditable...</span>
            </div>
          ) : (
            <div className="space-y-6">
              {/* ================= SECTION 1: HERO & ACCUEIL ================= */}
              {pagesActiveSection === 'hero' && (
                <div className="p-6 rounded-2xl bg-[#121212] border border-[#222222] space-y-6">
                  <div className="flex items-center justify-between border-b border-[#222222] pb-4">
                    <div>
                      <h3 className="text-base font-bold text-white flex items-center gap-2">
                        <Home className="w-4 h-4 text-[#FF0033]" />
                        <span>Édition de la Page d'Accueil & Bannière Hero</span>
                      </h3>
                      <p className="text-xs text-zinc-400 mt-0.5">
                        Personnalisez le titre principal, les accroches, les boutons d'action et les statistiques clés de la page d'accueil.
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-zinc-300">Badge principal Hero :</label>
                      <input
                        type="text"
                        value={editableContent.hero.badge}
                        onChange={(e) => updateHero('badge', e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-black border border-[#222222] focus:border-[#FF0033] text-white text-xs"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-zinc-300">Sous-badge / Tag Hero :</label>
                      <input
                        type="text"
                        value={editableContent.hero.badgeExtra}
                        onChange={(e) => updateHero('badgeExtra', e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-black border border-[#222222] focus:border-[#FF0033] text-white text-xs"
                      />
                    </div>

                    <div className="space-y-1.5 md:col-span-2">
                      <label className="text-xs font-semibold text-zinc-300">Titre H1 Hero :</label>
                      <input
                        type="text"
                        value={editableContent.hero.title}
                        onChange={(e) => updateHero('title', e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-black border border-[#222222] focus:border-[#FF0033] text-white text-xs font-bold"
                      />
                    </div>

                    <div className="md:col-span-2 space-y-1.5">
                      <label className="text-xs font-semibold text-zinc-300">Sous-titre descriptif Hero :</label>
                      <textarea
                        rows={2}
                        value={editableContent.hero.subtitle}
                        onChange={(e) => updateHero('subtitle', e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-black border border-[#222222] focus:border-[#FF0033] text-white text-xs"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-zinc-300">Libellé Bouton Principal (CTA 1) :</label>
                      <input
                        type="text"
                        value={editableContent.hero.primaryCtaText}
                        onChange={(e) => updateHero('primaryCtaText', e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-black border border-[#222222] focus:border-[#FF0033] text-white text-xs"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-zinc-300">Libellé Bouton Secondaire (CTA 2) :</label>
                      <input
                        type="text"
                        value={editableContent.hero.secondaryCtaText}
                        onChange={(e) => updateHero('secondaryCtaText', e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-black border border-[#222222] focus:border-[#FF0033] text-white text-xs"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-zinc-300">Note de réassurance 1 :</label>
                      <input
                        type="text"
                        value={editableContent.hero.securityNote1}
                        onChange={(e) => updateHero('securityNote1', e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-black border border-[#222222] focus:border-[#FF0033] text-white text-xs"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-zinc-300">Note de réassurance 2 :</label>
                      <input
                        type="text"
                        value={editableContent.hero.securityNote2}
                        onChange={(e) => updateHero('securityNote2', e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-black border border-[#222222] focus:border-[#FF0033] text-white text-xs"
                      />
                    </div>

                    <div className="space-y-1.5 md:col-span-2">
                      <label className="text-xs font-semibold text-zinc-300">Image d'arrière-plan du Hero (URL) :</label>
                      <input
                        type="text"
                        value={editableContent.hero.heroImageUrl}
                        onChange={(e) => updateHero('heroImageUrl', e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-black border border-[#222222] focus:border-[#FF0033] text-white text-xs font-mono"
                      />
                    </div>
                  </div>

                  {/* Showcase Card details */}
                  <div className="pt-4 border-t border-[#222222] space-y-4">
                    <h4 className="text-xs font-mono uppercase text-[#FF334B] font-bold flex items-center gap-2">
                      <Sparkles className="w-3.5 h-3.5 text-[#FF0033]" />
                      <span>Carte Vitrine Flottante Hero</span>
                    </h4>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-zinc-300">Badge vitrine :</label>
                        <input
                          type="text"
                          value={editableContent.hero.showcaseBadge}
                          onChange={(e) => updateHero('showcaseBadge', e.target.value)}
                          className="w-full px-3.5 py-2.5 rounded-xl bg-black border border-[#222222] focus:border-[#FF0033] text-white text-xs"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-zinc-300">Titre vitrine :</label>
                        <input
                          type="text"
                          value={editableContent.hero.showcaseTitle}
                          onChange={(e) => updateHero('showcaseTitle', e.target.value)}
                          className="w-full px-3.5 py-2.5 rounded-xl bg-black border border-[#222222] focus:border-[#FF0033] text-white text-xs"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-zinc-300">Sous-titre vitrine :</label>
                        <input
                          type="text"
                          value={editableContent.hero.showcaseSubtitle}
                          onChange={(e) => updateHero('showcaseSubtitle', e.target.value)}
                          className="w-full px-3.5 py-2.5 rounded-xl bg-black border border-[#222222] focus:border-[#FF0033] text-white text-xs"
                        />
                      </div>
                    </div>
                  </div>

                  {/* 4 Metric Boxes */}
                  <div className="pt-4 border-t border-[#222222] space-y-4">
                    <h4 className="text-xs font-mono uppercase text-[#FF334B] font-bold flex items-center gap-2">
                      <BarChart3 className="w-3.5 h-3.5 text-[#FF0033]" />
                      <span>4 Métriques / KPIs Clés du Bandeau Hero</span>
                    </h4>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                      <div className="p-3.5 rounded-xl bg-black border border-[#222222] space-y-2">
                        <span className="text-[10px] font-mono text-zinc-500 uppercase">Métrique #1 (Vues)</span>
                        <div>
                          <label className="text-[11px] text-zinc-400 block mb-1">Valeur / Chiffre :</label>
                          <input
                            type="text"
                            value={editableContent.hero.statsKpis.views}
                            onChange={(e) => updateHeroStat('views', e.target.value)}
                            className="w-full px-2.5 py-1.5 rounded-lg bg-zinc-950 border border-[#222222] text-white text-xs font-bold"
                          />
                        </div>
                        <div>
                          <label className="text-[11px] text-zinc-400 block mb-1">Libellé :</label>
                          <input
                            type="text"
                            value={editableContent.hero.statsKpis.viewsLabel}
                            onChange={(e) => updateHeroStat('viewsLabel', e.target.value)}
                            className="w-full px-2.5 py-1.5 rounded-lg bg-zinc-950 border border-[#222222] text-zinc-300 text-xs"
                          />
                        </div>
                      </div>

                      <div className="p-3.5 rounded-xl bg-black border border-[#222222] space-y-2">
                        <span className="text-[10px] font-mono text-zinc-500 uppercase">Métrique #2 (Masters)</span>
                        <div>
                          <label className="text-[11px] text-zinc-400 block mb-1">Valeur / Chiffre :</label>
                          <input
                            type="text"
                            value={editableContent.hero.statsKpis.masters}
                            onChange={(e) => updateHeroStat('masters', e.target.value)}
                            className="w-full px-2.5 py-1.5 rounded-lg bg-zinc-950 border border-[#222222] text-white text-xs font-bold"
                          />
                        </div>
                        <div>
                          <label className="text-[11px] text-zinc-400 block mb-1">Libellé :</label>
                          <input
                            type="text"
                            value={editableContent.hero.statsKpis.mastersLabel}
                            onChange={(e) => updateHeroStat('mastersLabel', e.target.value)}
                            className="w-full px-2.5 py-1.5 rounded-lg bg-zinc-950 border border-[#222222] text-zinc-300 text-xs"
                          />
                        </div>
                      </div>

                      <div className="p-3.5 rounded-xl bg-black border border-[#222222] space-y-2">
                        <span className="text-[10px] font-mono text-zinc-500 uppercase">Métrique #3 (Membres VIP)</span>
                        <div>
                          <label className="text-[11px] text-zinc-400 block mb-1">Valeur / Chiffre :</label>
                          <input
                            type="text"
                            value={editableContent.hero.statsKpis.subscribers}
                            onChange={(e) => updateHeroStat('subscribers', e.target.value)}
                            className="w-full px-2.5 py-1.5 rounded-lg bg-zinc-950 border border-[#222222] text-white text-xs font-bold"
                          />
                        </div>
                        <div>
                          <label className="text-[11px] text-zinc-400 block mb-1">Libellé :</label>
                          <input
                            type="text"
                            value={editableContent.hero.statsKpis.subscribersLabel}
                            onChange={(e) => updateHeroStat('subscribersLabel', e.target.value)}
                            className="w-full px-2.5 py-1.5 rounded-lg bg-zinc-950 border border-[#222222] text-zinc-300 text-xs"
                          />
                        </div>
                      </div>

                      <div className="p-3.5 rounded-xl bg-black border border-[#222222] space-y-2">
                        <span className="text-[10px] font-mono text-zinc-500 uppercase">Métrique #4 (CDN / Uptime)</span>
                        <div>
                          <label className="text-[11px] text-zinc-400 block mb-1">Valeur / Chiffre :</label>
                          <input
                            type="text"
                            value={editableContent.hero.statsKpis.uptime}
                            onChange={(e) => updateHeroStat('uptime', e.target.value)}
                            className="w-full px-2.5 py-1.5 rounded-lg bg-zinc-950 border border-[#222222] text-white text-xs font-bold"
                          />
                        </div>
                        <div>
                          <label className="text-[11px] text-zinc-400 block mb-1">Libellé :</label>
                          <input
                            type="text"
                            value={editableContent.hero.statsKpis.uptimeLabel}
                            onChange={(e) => updateHeroStat('uptimeLabel', e.target.value)}
                            className="w-full px-2.5 py-1.5 rounded-lg bg-zinc-950 border border-[#222222] text-zinc-300 text-xs"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ================= SECTION 2: PASS VIP & TARIFS ================= */}
              {pagesActiveSection === 'vip' && (
                <div className="p-6 rounded-2xl bg-[#121212] border border-[#222222] space-y-6">
                  <div className="flex items-center justify-between border-b border-[#222222] pb-4">
                    <div>
                      <h3 className="text-base font-bold text-white flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-[#FF0033]" />
                        <span>Édition de la Page Pass VIP & Formules d'Abonnement</span>
                      </h3>
                      <p className="text-xs text-zinc-400 mt-0.5">
                        Configurez les tarifs mensuel et annuel, les pourcentages de réduction et la liste des avantages exclusifs réservés aux abonnés.
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-zinc-300">Badge supérieur Pass VIP :</label>
                      <input
                        type="text"
                        value={editableContent.vip.headerBadge}
                        onChange={(e) => updateVip('headerBadge', e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-black border border-[#222222] focus:border-[#FF0033] text-white text-xs"
                      />
                    </div>

                    <div className="space-y-1.5 md:col-span-2">
                      <label className="text-xs font-semibold text-zinc-300">Titre Principal Pass VIP :</label>
                      <input
                        type="text"
                        value={editableContent.vip.title}
                        onChange={(e) => updateVip('title', e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-black border border-[#222222] focus:border-[#FF0033] text-white text-xs"
                      />
                    </div>
                  </div>

                  {/* Pricing Cards Configuration */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-[#222222]">
                    {/* Monthly Plan */}
                    <div className="p-4 rounded-xl bg-black border border-[#222222] space-y-3">
                      <span className="text-xs font-mono font-bold text-[#FF334B] uppercase">Formule Mensuelle</span>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="text-[11px] text-zinc-400 block mb-1">Prix (€) :</label>
                          <input
                            type="number"
                            step="0.01"
                            value={editableContent.vip.monthlyPrice}
                            onChange={(e) => updateVip('monthlyPrice', parseFloat(e.target.value) || 0)}
                            className="w-full px-2.5 py-1.5 rounded-lg bg-zinc-950 border border-[#222222] text-white text-xs font-bold"
                          />
                        </div>
                        <div>
                          <label className="text-[11px] text-zinc-400 block mb-1">Période :</label>
                          <input
                            type="text"
                            value={editableContent.vip.monthlyPeriodText}
                            onChange={(e) => updateVip('monthlyPeriodText', e.target.value)}
                            className="w-full px-2.5 py-1.5 rounded-lg bg-zinc-950 border border-[#222222] text-white text-xs"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Yearly Plan */}
                    <div className="p-4 rounded-xl bg-black border border-[#222222] space-y-3">
                      <span className="text-xs font-mono font-bold text-[#FF334B] uppercase">Formule Annuelle (VIP Pro)</span>
                      <div className="grid grid-cols-3 gap-2">
                        <div>
                          <label className="text-[11px] text-zinc-400 block mb-1">Prix (€) :</label>
                          <input
                            type="number"
                            step="0.01"
                            value={editableContent.vip.yearlyPrice}
                            onChange={(e) => updateVip('yearlyPrice', parseFloat(e.target.value) || 0)}
                            className="w-full px-2.5 py-1.5 rounded-lg bg-zinc-950 border border-[#222222] text-white text-xs font-bold"
                          />
                        </div>
                        <div>
                          <label className="text-[11px] text-zinc-400 block mb-1">Période :</label>
                          <input
                            type="text"
                            value={editableContent.vip.yearlyPeriodText}
                            onChange={(e) => updateVip('yearlyPeriodText', e.target.value)}
                            className="w-full px-2.5 py-1.5 rounded-lg bg-zinc-950 border border-[#222222] text-white text-xs"
                          />
                        </div>
                        <div>
                          <label className="text-[11px] text-zinc-400 block mb-1">Badge Réduction :</label>
                          <input
                            type="text"
                            value={editableContent.vip.yearlyDiscountBadge}
                            onChange={(e) => updateVip('yearlyDiscountBadge', e.target.value)}
                            className="w-full px-2.5 py-1.5 rounded-lg bg-zinc-950 border border-[#222222] text-emerald-400 text-xs font-bold"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Dynamic Perks List */}
                  <div className="pt-4 border-t border-[#222222] space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-mono uppercase text-[#FF334B] font-bold flex items-center gap-2">
                        <Check className="w-3.5 h-3.5 text-[#FF0033]" />
                        <span>Avantages & Privilèges Exclusifs du Pass ({editableContent.vip.perks.length})</span>
                      </h4>
                      <button
                        type="button"
                        onClick={addVipPerk}
                        className="px-3 py-1.5 rounded-lg bg-black hover:bg-zinc-900 border border-[#222222] hover:border-[#FF0033] text-white text-xs flex items-center gap-1.5 transition-colors"
                      >
                        <Plus className="w-3.5 h-3.5 text-[#FF0033]" />
                        <span>Ajouter un avantage</span>
                      </button>
                    </div>

                    <div className="space-y-2">
                      {editableContent.vip.perks.map((perk, idx) => (
                        <div key={idx} className="flex items-center gap-2">
                          <span className="w-6 text-center text-xs font-mono text-zinc-500">{idx + 1}.</span>
                          <input
                            type="text"
                            value={perk}
                            onChange={(e) => updateVipPerk(idx, e.target.value)}
                            className="flex-1 px-3 py-2 rounded-xl bg-black border border-[#222222] focus:border-[#FF0033] text-white text-xs"
                          />
                          <button
                            type="button"
                            onClick={() => removeVipPerk(idx)}
                            className="p-2 rounded-lg text-zinc-500 hover:text-red-400 hover:bg-red-950/30 transition-colors"
                            title="Supprimer cet avantage"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Summary & Guarantee notices */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-[#222222]">
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-zinc-300">Note récapitulative :</label>
                      <input
                        type="text"
                        value={editableContent.vip.summaryNotice}
                        onChange={(e) => updateVip('summaryNotice', e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-black border border-[#222222] focus:border-[#FF0033] text-white text-xs"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-zinc-300">Texte du bouton CTA :</label>
                      <input
                        type="text"
                        value={editableContent.vip.ctaButtonText}
                        onChange={(e) => updateVip('ctaButtonText', e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-black border border-[#222222] focus:border-[#FF0033] text-white text-xs"
                      />
                    </div>
                    <div className="md:col-span-2 space-y-1.5">
                      <label className="text-xs font-semibold text-zinc-300">Texte de garantie & Sécurité :</label>
                      <input
                        type="text"
                        value={editableContent.vip.guaranteeText}
                        onChange={(e) => updateVip('guaranteeText', e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-black border border-[#222222] focus:border-[#FF0033] text-white text-xs"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* ================= SECTION 3: ESPACE MEMBRE & BIBLIOTHÈQUE ================= */}
              {pagesActiveSection === 'library' && (
                <div className="p-6 rounded-2xl bg-[#121212] border border-[#222222] space-y-6">
                  <div className="border-b border-[#222222] pb-4">
                    <h3 className="text-base font-bold text-white flex items-center gap-2">
                      <Users className="w-4 h-4 text-[#FF0033]" />
                      <span>Édition de l'Espace Membre & Bibliothèque Utilisateur</span>
                    </h3>
                    <p className="text-xs text-zinc-400 mt-0.5">
                      Personnalisez les titres, badges de statut abonné et messages affichés lorsque l'historique ou la watchlist sont vides.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5 md:col-span-2">
                      <label className="text-xs font-semibold text-zinc-300">Titre de l'espace membre :</label>
                      <input
                        type="text"
                        value={editableContent.library.title}
                        onChange={(e) => updateLibrary('title', e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-black border border-[#222222] focus:border-[#FF0033] text-white text-xs font-bold"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-zinc-300">Badge Statut Standard :</label>
                      <input
                        type="text"
                        value={editableContent.library.freePassBadge}
                        onChange={(e) => updateLibrary('freePassBadge', e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-black border border-[#222222] focus:border-[#FF0033] text-white text-xs"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-zinc-300">Badge Statut Pass VIP Actif :</label>
                      <input
                        type="text"
                        value={editableContent.library.activePassBadge}
                        onChange={(e) => updateLibrary('activePassBadge', e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-black border border-[#222222] focus:border-[#FF0033] text-white text-xs"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-zinc-300">Titre Watchlist vide :</label>
                      <input
                        type="text"
                        value={editableContent.library.emptyWatchlistTitle}
                        onChange={(e) => updateLibrary('emptyWatchlistTitle', e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-black border border-[#222222] focus:border-[#FF0033] text-white text-xs"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-zinc-300">Message Watchlist vide :</label>
                      <input
                        type="text"
                        value={editableContent.library.emptyWatchlistText}
                        onChange={(e) => updateLibrary('emptyWatchlistText', e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-black border border-[#222222] focus:border-[#FF0033] text-white text-xs"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-zinc-300">Titre Historique vide :</label>
                      <input
                        type="text"
                        value={editableContent.library.emptyHistoryTitle}
                        onChange={(e) => updateLibrary('emptyHistoryTitle', e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-black border border-[#222222] focus:border-[#FF0033] text-white text-xs"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-zinc-300">Message Historique vide :</label>
                      <input
                        type="text"
                        value={editableContent.library.emptyHistoryText}
                        onChange={(e) => updateLibrary('emptyHistoryText', e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-black border border-[#222222] focus:border-[#FF0033] text-white text-xs"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-zinc-300">Titre Contenus Débloqués vide :</label>
                      <input
                        type="text"
                        value={editableContent.library.emptyUnlockedTitle}
                        onChange={(e) => updateLibrary('emptyUnlockedTitle', e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-black border border-[#222222] focus:border-[#FF0033] text-white text-xs"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-zinc-300">Message Contenus Débloqués vide :</label>
                      <input
                        type="text"
                        value={editableContent.library.emptyUnlockedText}
                        onChange={(e) => updateLibrary('emptyUnlockedText', e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-black border border-[#222222] focus:border-[#FF0033] text-white text-xs"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* ================= SECTION 4: LECTEUR & PAYWALL ================= */}
              {pagesActiveSection === 'mediaModal' && (
                <div className="p-6 rounded-2xl bg-[#121212] border border-[#222222] space-y-6">
                  <div className="border-b border-[#222222] pb-4">
                    <h3 className="text-base font-bold text-white flex items-center gap-2">
                      <Film className="w-4 h-4 text-[#FF0033]" />
                      <span>Édition du Lecteur Vidéo, Paywall & Téléchargement MP4</span>
                    </h3>
                    <p className="text-xs text-zinc-400 mt-0.5">
                      Personnalisez les messages d'incitation du paywall, les alertes de téléchargement restreint aux abonnés et le bouton de déblocage.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5 md:col-span-2">
                      <label className="text-xs font-semibold text-zinc-300">Titre principal du Paywall vidéo :</label>
                      <input
                        type="text"
                        value={editableContent.mediaModal.paywallTitle}
                        onChange={(e) => updateMediaModal('paywallTitle', e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-black border border-[#222222] focus:border-[#FF0033] text-white text-xs font-bold"
                      />
                    </div>

                    <div className="md:col-span-2 space-y-1.5">
                      <label className="text-xs font-semibold text-zinc-300">Description persuasive du Paywall :</label>
                      <textarea
                        rows={2}
                        value={editableContent.mediaModal.paywallDescription}
                        onChange={(e) => updateMediaModal('paywallDescription', e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-black border border-[#222222] focus:border-[#FF0033] text-white text-xs"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-zinc-300">Bouton Principal Paywall (CTA) :</label>
                      <input
                        type="text"
                        value={editableContent.mediaModal.paywallCtaText}
                        onChange={(e) => updateMediaModal('paywallCtaText', e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-black border border-[#222222] focus:border-[#FF0033] text-white text-xs"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-zinc-300">Bouton Secondaire Paywall (Formules) :</label>
                      <input
                        type="text"
                        value={editableContent.mediaModal.paywallSecondaryCta}
                        onChange={(e) => updateMediaModal('paywallSecondaryCta', e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-black border border-[#222222] focus:border-[#FF0033] text-white text-xs"
                      />
                    </div>

                    <div className="md:col-span-2 space-y-1.5">
                      <label className="text-xs font-semibold text-zinc-300">Notice de sécurité sous le paywall :</label>
                      <input
                        type="text"
                        value={editableContent.mediaModal.securityNotice}
                        onChange={(e) => updateMediaModal('securityNotice', e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-black border border-[#222222] focus:border-[#FF0033] text-white text-xs"
                      />
                    </div>

                    <div className="md:col-span-2 space-y-1.5">
                      <label className="text-xs font-semibold text-zinc-300">Notice explicative de téléchargement verrouillé (Non-abonnés) :</label>
                      <textarea
                        rows={2}
                        value={editableContent.mediaModal.downloadLockedNotice}
                        onChange={(e) => updateMediaModal('downloadLockedNotice', e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-black border border-[#222222] focus:border-[#FF0033] text-white text-xs"
                      />
                    </div>

                    <div className="md:col-span-2 space-y-1.5">
                      <label className="text-xs font-semibold text-zinc-300">Notice téléchargement déverrouillé (Abonnés VIP) :</label>
                      <input
                        type="text"
                        value={editableContent.mediaModal.downloadUnlockedNotice}
                        onChange={(e) => updateMediaModal('downloadUnlockedNotice', e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-black border border-[#222222] focus:border-[#FF0033] text-white text-xs"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* ================= SECTION 5: AUTH & CONNEXION ================= */}
              {pagesActiveSection === 'auth' && (
                <div className="p-6 rounded-2xl bg-[#121212] border border-[#222222] space-y-6">
                  <div className="border-b border-[#222222] pb-4">
                    <h3 className="text-base font-bold text-white flex items-center gap-2">
                      <Lock className="w-4 h-4 text-[#FF0033]" />
                      <span>Édition de la Page / Modale Connexion & Inscription</span>
                    </h3>
                    <p className="text-xs text-zinc-400 mt-0.5">
                      Ajustez les titres d'authentification, le badge d'accueil et les textes des boutons.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5 md:col-span-2">
                      <label className="text-xs font-semibold text-zinc-300">Badge supérieur Auth :</label>
                      <input
                        type="text"
                        value={editableContent.auth.brandBadge}
                        onChange={(e) => updateAuth('brandBadge', e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-black border border-[#222222] focus:border-[#FF0033] text-white text-xs"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-zinc-300">Titre Mode Connexion :</label>
                      <input
                        type="text"
                        value={editableContent.auth.loginTitle}
                        onChange={(e) => updateAuth('loginTitle', e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-black border border-[#222222] focus:border-[#FF0033] text-white text-xs"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-zinc-300">Titre Mode Inscription :</label>
                      <input
                        type="text"
                        value={editableContent.auth.registerTitle}
                        onChange={(e) => updateAuth('registerTitle', e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-black border border-[#222222] focus:border-[#FF0033] text-white text-xs"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-zinc-300">Bouton Connexion :</label>
                      <input
                        type="text"
                        value={editableContent.auth.loginButtonText}
                        onChange={(e) => updateAuth('loginButtonText', e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-black border border-[#222222] focus:border-[#FF0033] text-white text-xs"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-zinc-300">Bouton Inscription :</label>
                      <input
                        type="text"
                        value={editableContent.auth.registerButtonText}
                        onChange={(e) => updateAuth('registerButtonText', e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-black border border-[#222222] focus:border-[#FF0033] text-white text-xs"
                      />
                    </div>

                    <div className="md:col-span-2 space-y-1.5">
                      <label className="text-xs font-semibold text-zinc-300">Titre des Comptes Démo :</label>
                      <input
                        type="text"
                        value={editableContent.auth.demoAccountsTitle}
                        onChange={(e) => updateAuth('demoAccountsTitle', e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-black border border-[#222222] focus:border-[#FF0033] text-white text-xs"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* ================= SECTION 6: PIED DE PAGE & ANNONCE GLOBALE ================= */}
              {pagesActiveSection === 'general' && (
                <div className="p-6 rounded-2xl bg-[#121212] border border-[#222222] space-y-6">
                  <div className="border-b border-[#222222] pb-4">
                    <h3 className="text-base font-bold text-white flex items-center gap-2">
                      <Globe className="w-4 h-4 text-[#FF0033]" />
                      <span>Édition du Pied de Page (Footer) & Bandeau d'Annonce Global</span>
                    </h3>
                    <p className="text-xs text-zinc-400 mt-0.5">
                      Définissez la signature de marque, la description officielle en pied de page et activez un bandeau d'alerte en haut du site.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-zinc-300">Nom de la Plateforme (Marque) :</label>
                      <input
                        type="text"
                        value={editableContent.general.siteName}
                        onChange={(e) => updateGeneral('siteName', e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-black border border-[#222222] focus:border-[#FF0033] text-white text-xs font-bold"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-zinc-300">Slogan de marque :</label>
                      <input
                        type="text"
                        value={editableContent.general.siteTagline}
                        onChange={(e) => updateGeneral('siteTagline', e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-black border border-[#222222] focus:border-[#FF0033] text-white text-xs"
                      />
                    </div>

                    <div className="md:col-span-2 space-y-1.5">
                      <label className="text-xs font-semibold text-zinc-300">Description complète du Footer :</label>
                      <textarea
                        rows={2}
                        value={editableContent.general.footerDescription}
                        onChange={(e) => updateGeneral('footerDescription', e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-black border border-[#222222] focus:border-[#FF0033] text-white text-xs"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-zinc-300">Mention de Copyright & Droits :</label>
                      <input
                        type="text"
                        value={editableContent.general.copyrightText}
                        onChange={(e) => updateGeneral('copyrightText', e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-black border border-[#222222] focus:border-[#FF0033] text-white text-xs font-mono"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-zinc-300">Contact / Support :</label>
                      <input
                        type="text"
                        value={editableContent.general.supportContact}
                        onChange={(e) => updateGeneral('supportContact', e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-black border border-[#222222] focus:border-[#FF0033] text-white text-xs"
                      />
                    </div>
                  </div>

                  {/* Top Global Announcement Banner */}
                  <div className="pt-4 border-t border-[#222222] space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          id="announcementToggle"
                          checked={editableContent.general.announcementBanner.enabled}
                          onChange={(e) => updateAnnouncement('enabled', e.target.checked)}
                          className="w-4 h-4 rounded text-[#FF0033] focus:ring-[#FF0033] bg-black border-[#222222]"
                        />
                        <label htmlFor="announcementToggle" className="text-xs font-bold text-white cursor-pointer">
                          Activer le bandeau d'annonce globale en tête de site
                        </label>
                      </div>
                      <span className={`text-[10px] font-mono px-2 py-0.5 rounded ${editableContent.general.announcementBanner.enabled ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-zinc-800 text-zinc-400'}`}>
                        {editableContent.general.announcementBanner.enabled ? 'ACTIF' : 'INACTIF'}
                      </span>
                    </div>

                    {editableContent.general.announcementBanner.enabled && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 p-4 rounded-xl bg-black border border-[#222222]">
                        <div className="space-y-1">
                          <label className="text-[11px] text-zinc-400 block">Texte de l'annonce :</label>
                          <input
                            type="text"
                            value={editableContent.general.announcementBanner.text}
                            onChange={(e) => updateAnnouncement('text', e.target.value)}
                            className="w-full px-2.5 py-1.5 rounded-lg bg-zinc-950 border border-[#222222] text-white text-xs"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[11px] text-zinc-400 block">Texte du lien CTA :</label>
                          <input
                            type="text"
                            value={editableContent.general.announcementBanner.linkText || ''}
                            onChange={(e) => updateAnnouncement('linkText', e.target.value)}
                            className="w-full px-2.5 py-1.5 rounded-lg bg-zinc-950 border border-[#222222] text-white text-xs font-bold"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Bottom Quick Save Button */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#222222]">
                <button
                  type="button"
                  onClick={handleSaveSitePages}
                  disabled={cmsSaving}
                  className="px-8 py-3 rounded-xl bg-gradient-to-r from-[#FF0033] to-[#FF4500] hover:brightness-110 active:scale-95 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-xl shadow-[#FF0033]/30 transition-all disabled:opacity-50"
                >
                  {cmsSaving ? (
                    <Loader2 className="w-4 h-4 animate-spin text-white" />
                  ) : cmsSuccess ? (
                    <Check className="w-4 h-4 text-white" />
                  ) : (
                    <Save className="w-4 h-4 text-white" />
                  )}
                  <span>{cmsSaving ? 'Enregistrement en cours...' : cmsSuccess ? 'Toutes les pages ont été sauvegardées !' : 'Enregistrer toutes les modifications'}</span>
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* ================= 6. DATABASE SCHEMAS ================= */
        <div className="space-y-6">
          <div className="p-5 rounded-2xl bg-zinc-900/60 border border-zinc-800 space-y-2">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Database className="w-5 h-5 text-amber-400" />
              <span>Schémas de Base de Données Streaming (MongoDB & PostgreSQL)</span>
            </h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Structures complètes prêtes à l'emploi avec historique de lecture, watchlist, abonnés VIP et gestion de contenu.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* MongoDB */}
            <div className="p-5 rounded-2xl bg-zinc-900/70 border border-zinc-800 space-y-3">
              <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
                <span className="text-xs font-mono font-bold text-emerald-400 uppercase">
                  1. MongoDB / Mongoose Models
                </span>
                <button
                  onClick={() => copyToClipboard(dbSchemas?.mongooseCode || '', 'mongo')}
                  className="px-3 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs flex items-center gap-1.5 transition-colors"
                >
                  {copiedCode === 'mongo' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedCode === 'mongo' ? 'Copié !' : 'Copier'}</span>
                </button>
              </div>

              <pre className="p-4 rounded-xl bg-zinc-950 border border-zinc-800/80 text-[11px] font-mono text-zinc-300 overflow-x-auto max-h-[460px] scrollbar-thin">
                {dbSchemas?.mongooseCode}
              </pre>
            </div>

            {/* PostgreSQL */}
            <div className="p-5 rounded-2xl bg-zinc-900/70 border border-zinc-800 space-y-3">
              <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
                <span className="text-xs font-mono font-bold text-blue-400 uppercase">
                  2. PostgreSQL Relational DDL (SQL)
                </span>
                <button
                  onClick={() => copyToClipboard(dbSchemas?.postgresqlCode || '', 'sql')}
                  className="px-3 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs flex items-center gap-1.5 transition-colors"
                >
                  {copiedCode === 'sql' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedCode === 'sql' ? 'Copié !' : 'Copier'}</span>
                </button>
              </div>

              <pre className="p-4 rounded-xl bg-zinc-950 border border-zinc-800/80 text-[11px] font-mono text-zinc-300 overflow-x-auto max-h-[460px] scrollbar-thin">
                {dbSchemas?.postgresqlCode}
              </pre>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
