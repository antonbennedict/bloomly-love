'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ArrowDownToLine,
  ArrowUpToLine,
  Check,
  ChevronDown,
  ChevronRight,
  ChevronUp,
  Copy,
  CopyPlus,
  Download,
  ExternalLink,
  FlipHorizontal2,
  FlipVertical2,
  Flower,
  Gift,
  ImagePlus,
  LayoutTemplate,
  Layers,
  Leaf,
  Loader2,
  Mail,
  Maximize2,
  Plus,
  Redo2,
  Ribbon,
  RotateCw,
  Search,
  Send,
  Share2,
  Trash2,
  Undo2,
  Upload,
  X,
} from 'lucide-react';
import { SEEDED_ASSETS, Asset, getAsset } from '@/lib/assets-seed';
import { saveBouquet, getAnonymousSession, BouquetData } from '@/lib/supabase';
import QRCode from 'qrcode';

interface BouquetElement {
  id: string;
  assetId: string;
  x: number; // coordinates relative to a 500x600 canvas coordinate system
  y: number;
  rotation: number;
  scale: number;
  z: number;
  tint: string;
  customImageUrl?: string;
  flipX?: boolean;
  flipY?: boolean;
}

type LibraryTab = 'template' | 'flower' | 'wrapper' | 'filler' | 'accessory' | 'upload';
type MobileView = 'library' | 'canvas' | 'card';
type CanvasBg = 'default' | 'pink' | 'sage' | 'wood' | 'dark';

const HISTORY_LIMIT = 30;
const ASSET_MIME = 'application/x-bloomly-asset';
const MAX_UPLOAD_BYTES = 1.5 * 1024 * 1024;
const MESSAGE_MAX = 500;

const PRESET_COLORS = [
  { name: 'Rose Red', hex: '#E11D48' },
  { name: 'Coral Pink', hex: '#F43F5E' },
  { name: 'Soft Tulip', hex: '#EC4899' },
  { name: 'Lavender', hex: '#A855F7' },
  { name: 'Sky Blue', hex: '#0EA5E9' },
  { name: 'Golden Yellow', hex: '#EAB308' },
  { name: 'Sunset Orange', hex: '#F97316' },
  { name: 'Pure White', hex: '#F8FAFC' },
  { name: 'Sage Green', hex: '#86EFAC' },
  { name: 'Deep Violet', hex: '#6D28D9' }
];

const CARD_THEMES = [
  { id: 'classic', name: 'Classic Cream', bg: 'bg-[#FDFBF7]', text: 'text-stone-800', border: 'border-amber-900/10' },
  { id: 'rose', name: 'Blush Pink', bg: 'bg-rose-50/90', text: 'text-rose-950', border: 'border-rose-200' },
  { id: 'emerald', name: 'Forest Emerald', bg: 'bg-[#1e2d24]', text: 'text-[#e2ebe5]', border: 'border-emerald-800' },
  { id: 'royal', name: 'Royal Gold', bg: 'bg-[#1c1917]', text: 'text-amber-100', border: 'border-amber-500/30' },
  { id: 'velvet', name: 'Dark Velvet', bg: 'bg-purple-950/95', text: 'text-purple-100', border: 'border-purple-800/40' }
];

const CANVAS_BACKGROUNDS: { key: CanvasBg; label: string; color: string }[] = [
  { key: 'default', label: 'Dotted grid', color: '#e2e8f0' },
  { key: 'pink', label: 'Rose', color: '#fce7f3' },
  { key: 'sage', label: 'Sage', color: '#d1fae5' },
  { key: 'wood', label: 'Warm', color: '#fde68a' },
  { key: 'dark', label: 'Dark', color: '#1c1917' },
];

const LIBRARY_TABS = [
  { key: 'template', label: 'Start', icon: LayoutTemplate },
  { key: 'flower', label: 'Flowers', icon: Flower },
  { key: 'wrapper', label: 'Wraps', icon: Gift },
  { key: 'filler', label: 'Greens', icon: Leaf },
  { key: 'accessory', label: 'Extras', icon: Ribbon },
  { key: 'upload', label: 'Upload', icon: Upload },
] as const;

const CATEGORY_HINTS: Record<string, string> = {
  flower: 'The stars of your bouquet. Every flower can be recolored once it\u2019s on the canvas.',
  wrapper: 'Wraps, vases and baskets. New flowers tuck in behind them automatically.',
  filler: 'Greenery and fillers to fill gaps and frame your blooms.',
  accessory: 'Finishing touches \u2014 bows, tags, little friends and sparkle.',
};

// Extra words people might search for, per category.
const CATEGORY_KEYWORDS: Record<string, string> = {
  flower: 'flower flowers bloom',
  wrapper: 'wrap wraps wrapper vase pot basket paper',
  filler: 'green greens greenery leaf leaves filler foliage',
  accessory: 'extra extras accessory accessories decoration',
};

const TEMPLATES: { id: string; name: string; desc: string; elements: BouquetElement[] }[] = [
  {
    id: 'temp-roses',
    name: "Blushing Roses",
    desc: "Garden roses with eucalyptus and baby's breath in kraft paper.",
    elements: [
      { id: 't1', assetId: 'filler-eucalyptus', x: 172, y: 260, rotation: -24, scale: 2.08, z: 1, tint: '#7C9A92' },
      { id: 't2', assetId: 'filler-eucalyptus', x: 331, y: 254, rotation: 24, scale: 2.08, z: 2, tint: '#7C9A92' },
      { id: 't3', assetId: 'filler-babysbreath', x: 250, y: 210, rotation: 0, scale: 2.21, z: 3, tint: '#FFFFFF' },
      { id: 't4', assetId: 'flower-rose', x: 214, y: 228, rotation: -10, scale: 1.62, z: 4, tint: '#BE123C' },
      { id: 't5', assetId: 'flower-rose', x: 289, y: 223, rotation: 10, scale: 1.62, z: 5, tint: '#FB7185' },
      { id: 't6', assetId: 'flower-rose', x: 250, y: 260, rotation: 0, scale: 1.82, z: 6, tint: '#E11D48' },
      { id: 't7', assetId: 'flower-rose', x: 185, y: 293, rotation: -20, scale: 1.69, z: 7, tint: '#F43F5E' },
      { id: 't8', assetId: 'flower-rose', x: 318, y: 288, rotation: 18, scale: 1.69, z: 8, tint: '#EC4899' },
      { id: 't9', assetId: 'wrapper-paper', x: 250, y: 436, rotation: 0, scale: 2.99, z: 9, tint: '#C8955C' },
      { id: 't10', assetId: 'accessory-bow', x: 250, y: 480, rotation: 0, scale: 1.37, z: 10, tint: '#E11D48' },
    ]
  },
  {
    id: 'temp-sunny',
    name: "Sunny Meadow",
    desc: "Sunflowers, daisies and golden wheat in a clear glass vase.",
    elements: [
      { id: 't1', assetId: 'filler-wheat', x: 175, y: 236, rotation: -18, scale: 1.95, z: 1, tint: '#D4A24C' },
      { id: 't2', assetId: 'filler-wheat', x: 328, y: 231, rotation: 18, scale: 1.95, z: 2, tint: '#D4A24C' },
      { id: 't3', assetId: 'filler-babysbreath', x: 250, y: 220, rotation: 0, scale: 2.08, z: 3, tint: '#FFFFFF' },
      { id: 't4', assetId: 'flower-daisy', x: 193, y: 286, rotation: -22, scale: 1.62, z: 4, tint: '#FFFFFF' },
      { id: 't5', assetId: 'flower-daisy', x: 310, y: 280, rotation: 20, scale: 1.62, z: 5, tint: '#FFFFFF' },
      { id: 't6', assetId: 'flower-sunflower', x: 250, y: 260, rotation: 0, scale: 1.89, z: 6, tint: '#EAB308' },
      { id: 't7', assetId: 'flower-sunflower', x: 203, y: 324, rotation: -14, scale: 1.56, z: 7, tint: '#F59E0B' },
      { id: 't8', assetId: 'flower-sunflower', x: 299, y: 324, rotation: 14, scale: 1.56, z: 8, tint: '#EAB308' },
      { id: 't9', assetId: 'wrapper-vase', x: 250, y: 457, rotation: 0, scale: 2.6, z: 9, tint: '#7DD3FC' },
      { id: 't10', assetId: 'accessory-bee', x: 367, y: 130, rotation: 0, scale: 0.98, z: 10, tint: '#FBBF24' },
    ]
  },
  {
    id: 'temp-tulips',
    name: "Spring Tulips",
    desc: "A cheerful mix of tulips and fern in pleated blush paper.",
    elements: [
      { id: 't1', assetId: 'filler-fern', x: 185, y: 260, rotation: -22, scale: 2.08, z: 1, tint: '#4D8B55' },
      { id: 't2', assetId: 'filler-fern', x: 318, y: 257, rotation: 22, scale: 2.08, z: 2, tint: '#4D8B55' },
      { id: 't3', assetId: 'flower-tulip', x: 203, y: 239, rotation: -14, scale: 1.69, z: 3, tint: '#F97316' },
      { id: 't4', assetId: 'flower-tulip', x: 299, y: 236, rotation: 14, scale: 1.69, z: 4, tint: '#EAB308' },
      { id: 't5', assetId: 'flower-tulip', x: 250, y: 218, rotation: 0, scale: 1.76, z: 5, tint: '#EC4899' },
      { id: 't6', assetId: 'flower-tulip', x: 224, y: 283, rotation: -6, scale: 1.62, z: 6, tint: '#E11D48' },
      { id: 't7', assetId: 'flower-tulip', x: 279, y: 280, rotation: 6, scale: 1.62, z: 7, tint: '#A855F7' },
      { id: 't8', assetId: 'wrapper-pleated', x: 250, y: 442, rotation: 0, scale: 2.86, z: 8, tint: '#F5D0C5' },
    ]
  },
  {
    id: 'temp-peony',
    name: "Peony Romance",
    desc: "Lush peonies and ranunculus with soft greenery, tied with a ribbon.",
    elements: [
      { id: 't1', assetId: 'filler-dustymiller', x: 180, y: 228, rotation: -26, scale: 1.95, z: 1, tint: '#A8B5B2' },
      { id: 't2', assetId: 'filler-olive', x: 323, y: 220, rotation: 24, scale: 2.08, z: 2, tint: '#7D8F69' },
      { id: 't3', assetId: 'flower-ranunculus', x: 201, y: 205, rotation: -12, scale: 1.49, z: 3, tint: '#FB923C' },
      { id: 't4', assetId: 'flower-ranunculus', x: 305, y: 197, rotation: 12, scale: 1.49, z: 4, tint: '#FDBA74' },
      { id: 't5', assetId: 'flower-peony', x: 250, y: 212, rotation: 0, scale: 1.95, z: 5, tint: '#F9A8D4' },
      { id: 't6', assetId: 'flower-peony', x: 195, y: 270, rotation: -16, scale: 1.62, z: 6, tint: '#F472B6' },
      { id: 't7', assetId: 'flower-peony', x: 307, y: 264, rotation: 16, scale: 1.62, z: 7, tint: '#FBCFE8' },
      { id: 't8', assetId: 'wrapper-paper', x: 250, y: 402, rotation: 0, scale: 2.99, z: 8, tint: '#9CB59A' },
      { id: 't9', assetId: 'accessory-bow', x: 250, y: 446, rotation: 0, scale: 1.37, z: 9, tint: '#FBCFE8' },
      { id: 't10', assetId: 'accessory-butterfly', x: 367, y: 90, rotation: 0, scale: 0.91, z: 10, tint: '#F97316' },
    ]
  },
  {
    id: 'temp-wild',
    name: "Wildflower Basket",
    desc: "Poppies, cosmos and lavender gathered in a woven basket.",
    elements: [
      { id: 't1', assetId: 'flower-lavender', x: 180, y: 234, rotation: -18, scale: 1.95, z: 1, tint: '#A855F7' },
      { id: 't2', assetId: 'flower-lavender', x: 323, y: 229, rotation: 18, scale: 1.95, z: 2, tint: '#8B5CF6' },
      { id: 't3', assetId: 'flower-forget-me-not', x: 250, y: 203, rotation: 0, scale: 1.95, z: 3, tint: '#60A5FA' },
      { id: 't4', assetId: 'flower-poppy', x: 214, y: 252, rotation: -10, scale: 1.62, z: 4, tint: '#EF4444' },
      { id: 't5', assetId: 'flower-cosmos', x: 289, y: 249, rotation: 10, scale: 1.69, z: 5, tint: '#F472B6' },
      { id: 't6', assetId: 'flower-daisy', x: 250, y: 281, rotation: 0, scale: 1.56, z: 6, tint: '#FFFFFF' },
      { id: 't7', assetId: 'flower-poppy', x: 302, y: 296, rotation: 16, scale: 1.43, z: 7, tint: '#F97316' },
      { id: 't8', assetId: 'flower-cosmos', x: 195, y: 296, rotation: -16, scale: 1.49, z: 8, tint: '#FBCFE8' },
      { id: 't9', assetId: 'wrapper-basket', x: 250, y: 336, rotation: 0, scale: 2.73, z: 9, tint: '#B7834A' },
      { id: 't10', assetId: 'accessory-ladybug', x: 338, y: 352, rotation: 0, scale: 0.72, z: 10, tint: '#DC2626' },
    ]
  },
  {
    id: 'temp-pot',
    name: "Little Pot of Joy",
    desc: "A full hydrangea and daisies in a ceramic pot, with a friendly bee.",
    elements: [
      { id: 't1', assetId: 'filler-monstera', x: 182, y: 304, rotation: -30, scale: 1.69, z: 1, tint: '#2F855A' },
      { id: 't2', assetId: 'filler-monstera', x: 318, y: 304, rotation: 30, scale: 1.69, z: 2, tint: '#2F855A' },
      { id: 't3', assetId: 'flower-hydrangea', x: 214, y: 264, rotation: -10, scale: 1.69, z: 3, tint: '#60A5FA' },
      { id: 't4', assetId: 'flower-hydrangea', x: 289, y: 259, rotation: 10, scale: 1.69, z: 4, tint: '#A78BFA' },
      { id: 't5', assetId: 'flower-gerbera', x: 250, y: 238, rotation: 0, scale: 1.69, z: 5, tint: '#F97316' },
      { id: 't6', assetId: 'flower-daisy', x: 203, y: 316, rotation: -14, scale: 1.37, z: 6, tint: '#FFFFFF' },
      { id: 't7', assetId: 'flower-daisy', x: 297, y: 316, rotation: 14, scale: 1.37, z: 7, tint: '#FFFFFF' },
      { id: 't8', assetId: 'wrapper-pot', x: 250, y: 356, rotation: 0, scale: 2.6, z: 8, tint: '#C2683F' },
      { id: 't9', assetId: 'accessory-bee', x: 364, y: 114, rotation: 0, scale: 0.91, z: 9, tint: '#FBBF24' },
    ]
  },
];

// Small random spread so repeatedly added items don't stack exactly on top of each other.
const randomOffset = () => (Math.random() - 0.5) * 40;

const newId = () => 'el_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6);

// Rotation is stored as degrees; keep it in -180..180 so the slider and readout stay meaningful.
const normalizeRotation = (deg: number) => {
  const r = ((deg % 360) + 360) % 360;
  return r > 180 ? r - 360 : r;
};

const categoryOf = (assetId: string) => SEEDED_ASSETS.find(a => a.id === assetId)?.category;

/**
 * Inserts a new element into the layer stack so arrangements build naturally:
 * flowers and greenery slide in behind the first wrap (so stems tuck inside),
 * wraps slide in behind extras, and extras go on top. Z values are renumbered 1..n.
 */
const insertInStack = (list: BouquetElement[], el: BouquetElement, category?: Asset['category']) => {
  const sorted = [...list].sort((a, b) => a.z - b.z);
  const behind: Asset['category'] | null =
    category === 'flower' || category === 'filler' ? 'wrapper' : category === 'wrapper' ? 'accessory' : null;
  const blocker = behind ? sorted.findIndex(item => categoryOf(item.assetId) === behind) : -1;
  sorted.splice(blocker === -1 ? sorted.length : blocker, 0, el);
  return sorted.map((item, i) => ({ ...item, z: i + 1 }));
};

const elementName = (el: BouquetElement) =>
  el.assetId === 'custom-upload' ? 'Your image' : SEEDED_ASSETS.find(a => a.id === el.assetId)?.name || 'Element';

function AssetArt({ el, className }: { el: BouquetElement; className?: string }) {
  if (el.assetId === 'custom-upload') {
    // eslint-disable-next-line @next/next/no-img-element -- user-supplied data URL
    return <img src={el.customImageUrl} alt="" className={`object-contain ${className ?? ''}`} draggable={false} />;
  }
  const asset = getAsset(el.assetId);
  return (
    <svg viewBox={asset.viewBox} className={className} style={{ color: el.tint }} aria-hidden="true">
      <g dangerouslySetInnerHTML={{ __html: asset.svgMarkup }} />
    </svg>
  );
}

const sectionLabel = 'text-xs font-semibold text-stone-600 dark:text-stone-400';
const fieldClass =
  'w-full text-base sm:text-sm px-3 py-2.5 rounded-xl border border-stone-300 bg-white text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-sage-600 focus:border-transparent dark:border-stone-700 dark:bg-stone-950 dark:text-stone-100';
const chipButton =
  'min-h-10 inline-flex items-center justify-center gap-1.5 rounded-xl border px-3 text-[13px] font-semibold transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sage-600 disabled:opacity-40 disabled:cursor-not-allowed';
const chipIdle =
  'border-stone-200 bg-white text-stone-700 hover:border-sage-600/50 hover:text-sage-700 dark:border-stone-700 dark:bg-stone-900 dark:text-stone-300 dark:hover:text-white';
const chipActive = 'border-sage-600 bg-sage-600 text-white';

export default function Builder() {
  const [elements, setElements] = useState<BouquetElement[]>([]);
  const [history, setHistory] = useState<BouquetElement[][]>([]);
  const [future, setFuture] = useState<BouquetElement[][]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<LibraryTab>('template');
  const [mobileView, setMobileView] = useState<MobileView>('canvas');
  const [canvasBg, setCanvasBg] = useState<CanvasBg>('default');
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [dropActive, setDropActive] = useState(false);

  // Message card
  const [message, setMessage] = useState('');
  const [senderName, setSenderName] = useState('');
  const [recipientName, setRecipientName] = useState('');
  const [cardStyle, setCardStyle] = useState('classic');
  const [isPublic, setIsPublic] = useState(true);

  // Sharing
  const [isSaving, setIsSaving] = useState(false);
  const [shareError, setShareError] = useState<string | null>(null);
  const [shareSlug, setShareSlug] = useState<string | null>(null);
  const [shareUrl, setShareUrl] = useState('');
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [copied, setCopied] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [recipientEmail, setRecipientEmail] = useState('');
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [emailSendSuccess, setEmailSendSuccess] = useState<boolean | null>(null);
  const [emailErrorMessage, setEmailErrorMessage] = useState<string | null>(null);

  const [toast, setToast] = useState<{ id: number; text: string; undo?: boolean } | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  const canvasRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const shareLinkRef = useRef<HTMLInputElement>(null);
  const dragRef = useRef<{ id: string; startX: number; startY: number; initX: number; initY: number; moved: boolean; snapshot: BouquetElement[] } | null>(null);
  // True while a slider/color picker gesture is in progress, so one gesture = one undo step.
  const editingRef = useRef(false);

  useEffect(() => {
    getAnonymousSession().then(id => setUserId(id));
  }, []);

  const showToast = useCallback((text: string, undo = false) => {
    setToast({ id: Date.now(), text, undo });
  }, []);

  useEffect(() => {
    if (!toast) return;
    const t = window.setTimeout(() => setToast(null), 5000);
    return () => window.clearTimeout(t);
  }, [toast]);

  // Warn before leaving with an unshared design.
  useEffect(() => {
    if (elements.length === 0 || shareSlug) return;
    const onBeforeUnload = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener('beforeunload', onBeforeUnload);
    return () => window.removeEventListener('beforeunload', onBeforeUnload);
  }, [elements.length, shareSlug]);

  // ---------- History ----------
  const snapshot = useCallback((prev: BouquetElement[]) => {
    setHistory(h => [...h.slice(-(HISTORY_LIMIT - 1)), prev]);
    setFuture([]);
  }, []);

  const commit = (next: BouquetElement[]) => {
    snapshot(elements);
    setElements(next);
  };

  const handleUndo = () => {
    if (history.length === 0) return;
    const previous = history[history.length - 1];
    setHistory(h => h.slice(0, -1));
    setFuture(f => [elements, ...f]);
    setElements(previous);
    if (selectedId && !previous.some(e => e.id === selectedId)) setSelectedId(null);
  };

  const handleRedo = () => {
    if (future.length === 0) return;
    const [next, ...rest] = future;
    setFuture(rest);
    setHistory(h => [...h, elements]);
    setElements(next);
    if (selectedId && !next.some(e => e.id === selectedId)) setSelectedId(null);
  };

  // ---------- Element edits ----------
  const selectedElement = elements.find(el => el.id === selectedId) ?? null;

  /** Discrete edit (button press): one undo step. */
  const updateSelected = (updates: Partial<BouquetElement>) => {
    if (!selectedId) return;
    commit(elements.map(el => (el.id === selectedId ? { ...el, ...updates } : el)));
  };

  /** Continuous edit (slider drag, color picker): snapshot once at gesture start, then live-update. */
  const beginEdit = () => {
    if (editingRef.current) return;
    editingRef.current = true;
    snapshot(elements);
  };
  const endEdit = () => {
    editingRef.current = false;
  };
  const patchSelected = (updates: Partial<BouquetElement>) => {
    if (!selectedId) return;
    if (!editingRef.current) snapshot(elements); // keyboard-driven change without a pointer gesture
    setElements(prev => prev.map(el => (el.id === selectedId ? { ...el, ...updates } : el)));
  };

  const nextZ = () => (elements.length > 0 ? Math.max(...elements.map(e => e.z)) + 1 : 1);

  const handleLoadTemplate = (templateElements: BouquetElement[]) => {
    const hadContent = elements.length > 0;
    commit(templateElements.map(el => ({ ...el, id: newId() })));
    setSelectedId(null);
    setMobileView('canvas');
    if (hadContent) showToast('Template loaded', true);
  };

  const startBlank = () => {
    if (elements.length > 0) {
      commit([]);
      showToast('Canvas cleared', true);
    }
    setSelectedId(null);
    setActiveTab('flower');
  };

  const clearCanvas = () => {
    if (elements.length === 0) return;
    commit([]);
    setSelectedId(null);
    showToast('Canvas cleared', true);
  };

  const handleAddAsset = (asset: Asset, at?: { x: number; y: number }) => {
    const offset = randomOffset();
    const el: BouquetElement = {
      id: newId(),
      assetId: asset.id,
      x: at ? at.x : 250 + offset,
      y: at ? at.y : asset.category === 'wrapper' ? 440 : 280 + offset,
      rotation: 0,
      scale: asset.category === 'wrapper' ? 2.2 : asset.category === 'accessory' ? 1.1 : 1.4,
      z: 0,
      tint: asset.defaultColor
    };
    commit(insertInStack(elements, el, asset.category));
    setSelectedId(el.id);
    setMobileView('canvas');
  };

  const deleteSelected = () => {
    if (!selectedId) return;
    commit(elements.filter(el => el.id !== selectedId));
    setSelectedId(null);
    showToast('Element removed', true);
  };

  const duplicateSelected = () => {
    if (!selectedElement) return;
    const dup: BouquetElement = {
      ...selectedElement,
      id: newId(),
      x: Math.min(480, selectedElement.x + 20),
      y: Math.min(580, selectedElement.y + 20),
      z: nextZ()
    };
    commit([...elements, dup]);
    setSelectedId(dup.id);
  };

  const bringToFront = () => {
    if (!selectedId || elements.length <= 1) return;
    updateSelected({ z: Math.max(...elements.map(e => e.z)) + 1 });
  };

  const sendToBack = () => {
    if (!selectedId || elements.length <= 1) return;
    updateSelected({ z: Math.min(...elements.map(e => e.z)) - 1 });
  };

  const swapLayer = (direction: 1 | -1) => {
    if (!selectedId) return;
    const list = elements.map(el => ({ ...el }));
    const sorted = [...list].sort((a, b) => a.z - b.z);
    const idx = sorted.findIndex(el => el.id === selectedId);
    const other = sorted[idx + direction];
    if (idx === -1 || !other) return;
    const current = sorted[idx];
    [current.z, other.z] = [other.z, current.z];
    commit(list);
  };

  const nudgeSelected = (dx: number, dy: number) => {
    if (!selectedElement) return;
    updateSelected({
      x: Math.max(-50, Math.min(550, selectedElement.x + dx)),
      y: Math.max(-50, Math.min(650, selectedElement.y + dy)),
    });
  };

  // ---------- Dragging (pointer events cover mouse, touch and pen) ----------
  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>, el: BouquetElement) => {
    if (e.button !== 0) return;
    e.stopPropagation();
    setSelectedId(el.id);
    e.currentTarget.setPointerCapture(e.pointerId);
    dragRef.current = { id: el.id, startX: e.clientX, startY: e.clientY, initX: el.x, initY: el.y, moved: false, snapshot: elements };
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    const canvas = canvasRef.current;
    if (!drag || !canvas) return;
    const dx = e.clientX - drag.startX;
    const dy = e.clientY - drag.startY;
    if (!drag.moved) {
      if (Math.hypot(dx, dy) < 3) return; // ignore jitter so a tap stays a tap
      drag.moved = true;
      snapshot(drag.snapshot);
      setDraggingId(drag.id);
    }
    const rect = canvas.getBoundingClientRect();
    const x = Math.max(-50, Math.min(550, drag.initX + dx * (500 / rect.width)));
    const y = Math.max(-50, Math.min(650, drag.initY + dy * (600 / rect.height)));
    setElements(prev => prev.map(item => (item.id === drag.id ? { ...item, x, y } : item)));
  };

  const handlePointerUp = () => {
    dragRef.current = null;
    setDraggingId(null);
  };

  // ---------- Keyboard shortcuts ----------
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (isShareModalOpen) {
        if (e.key === 'Escape') setIsShareModalOpen(false);
        return;
      }
      const target = e.target as HTMLElement | null;
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.tagName === 'SELECT' || target.isContentEditable)) return;

      const mod = e.ctrlKey || e.metaKey;
      const key = e.key.toLowerCase();
      if (mod && key === 'z') {
        e.preventDefault();
        if (e.shiftKey) handleRedo();
        else handleUndo();
        return;
      }
      if (mod && key === 'y') {
        e.preventDefault();
        handleRedo();
        return;
      }
      if (mod && key === 'd' && selectedId) {
        e.preventDefault();
        duplicateSelected();
        return;
      }
      if (!selectedId) return;
      if (e.key === 'Delete' || e.key === 'Backspace') {
        e.preventDefault();
        deleteSelected();
      } else if (e.key === 'Escape') {
        setSelectedId(null);
      } else if (e.key.startsWith('Arrow') && canvasRef.current?.contains(target)) {
        e.preventDefault();
        const step = e.shiftKey ? 20 : 5;
        if (e.key === 'ArrowLeft') nudgeSelected(-step, 0);
        if (e.key === 'ArrowRight') nudgeSelected(step, 0);
        if (e.key === 'ArrowUp') nudgeSelected(0, -step);
        if (e.key === 'ArrowDown') nudgeSelected(0, step);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  });

  // ---------- Uploads ----------
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = ''; // allow re-selecting the same file
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      showToast('That file isn’t an image. Try a PNG, JPG or SVG.');
      return;
    }
    if (file.size > MAX_UPLOAD_BYTES) {
      showToast('That image is over 1.5 MB. Please choose a smaller one.');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const el: BouquetElement = {
        id: newId(),
        assetId: 'custom-upload',
        x: 250,
        y: 250,
        rotation: 0,
        scale: 1.0,
        z: nextZ(),
        tint: '#ffffff',
        customImageUrl: reader.result as string
      };
      commit([...elements, el]);
      setSelectedId(el.id);
      setMobileView('canvas');
    };
    reader.readAsDataURL(file);
  };

  // ---------- Sharing ----------
  const generateSlug = (length = 8) => {
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < length; i++) result += chars.charAt(Math.floor(Math.random() * chars.length));
    return result;
  };

  const handleSaveAndShare = async () => {
    if (elements.length === 0) {
      setShareError('Add at least one flower to your bouquet before sharing.');
      return;
    }
    setShareError(null);
    setIsSaving(true);
    const slug = generateSlug();

    const bouquetData: BouquetData = {
      slug,
      owner_id: userId,
      title: 'Custom Bouquet',
      message: message || 'Thinking of you!',
      sender_name: senderName || 'A Secret Admirer',
      recipient_name: recipientName || 'Someone Special',
      composition: elements,
      card_style: `${cardStyle}|${canvasBg}`,
      is_public: isPublic
    };

    const res = await saveBouquet(bouquetData);
    if (!res.success) {
      setIsSaving(false);
      setShareError('We couldn’t save your bouquet. Check your connection and try again.');
      return;
    }

    const url = `${window.location.origin}/b/${slug}`;
    setShareSlug(slug);
    setShareUrl(url);
    setCopied(false);
    setEmailSendSuccess(null);
    try {
      setQrCodeUrl(await QRCode.toDataURL(url, { width: 600, margin: 2 }));
    } catch {
      setQrCodeUrl('');
    }
    setIsSaving(false);
    setIsShareModalOpen(true);
  };

  const copyLink = async () => {
    if (!shareUrl) return;
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard can be blocked (e.g. insecure context) — select the text so the user can copy manually.
      shareLinkRef.current?.select();
    }
  };

  const handleSendEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!recipientEmail || !shareSlug) return;

    setIsSendingEmail(true);
    setEmailSendSuccess(null);
    setEmailErrorMessage(null);

    try {
      const res = await fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: recipientEmail,
          slug: shareSlug,
          senderName: senderName || 'A Secret Admirer',
          recipientName: recipientName || 'Someone Special'
        })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setEmailSendSuccess(true);
        setRecipientEmail('');
      } else {
        setEmailSendSuccess(false);
        setEmailErrorMessage(data.error || 'We couldn’t send the email. Copy the link and send it yourself instead.');
      }
    } catch (err: unknown) {
      console.error(err);
      setEmailSendSuccess(false);
      setEmailErrorMessage('We couldn’t send the email. Copy the link and send it yourself instead.');
    } finally {
      setIsSendingEmail(false);
    }
  };

  // ---------- Render helpers ----------
  const sortedElements = [...elements].sort((a, b) => a.z - b.z);
  const activeTheme = CARD_THEMES.find(t => t.id === cardStyle) ?? CARD_THEMES[0];

  const q = query.trim().toLowerCase();
  const searchResults = q
    ? SEEDED_ASSETS.filter(a => `${a.name} ${CATEGORY_KEYWORDS[a.category] ?? ''}`.toLowerCase().includes(q))
    : [];

  const assetGridClass = 'grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-3 gap-2.5';

  const renderAssetTile = (asset: Asset) => (
    <button
      key={asset.id}
      type="button"
      draggable
      onDragStart={(e) => {
        e.dataTransfer.setData(ASSET_MIME, asset.id);
        e.dataTransfer.effectAllowed = 'copy';
      }}
      onClick={() => handleAddAsset(asset)}
      aria-label={`Add ${asset.name}`}
      title="Click to add, or drag onto the canvas"
      className="group relative flex flex-col items-center gap-1.5 rounded-2xl border border-stone-200 dark:border-stone-800 p-1.5 pb-2 hover:border-sage-600/60 hover:shadow-md active:scale-[0.97] transition-all cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sage-600"
    >
      <span className="w-full aspect-square grid place-items-center rounded-xl bg-gradient-to-b from-stone-50 to-[#f3efe8] dark:from-stone-800/60 dark:to-stone-900 group-hover:from-sage-50 group-hover:to-sage-100/60 transition-colors">
        <svg viewBox={asset.viewBox} className="w-[82%] h-[82%] transition-transform duration-200 group-hover:scale-110 group-hover:-rotate-3" style={{ color: asset.defaultColor }} aria-hidden="true">
          <g dangerouslySetInnerHTML={{ __html: asset.svgMarkup }} />
        </svg>
      </span>
      <span className="w-full px-0.5 text-xs font-medium text-stone-700 dark:text-stone-300 text-center leading-tight line-clamp-2 min-h-[2lh]">{asset.name}</span>
      <span className="absolute top-2.5 right-2.5 w-6 h-6 grid place-items-center rounded-full bg-sage-600 text-white shadow-sm opacity-0 scale-75 group-hover:opacity-100 group-hover:scale-100 group-focus-visible:opacity-100 group-focus-visible:scale-100 transition-all" aria-hidden="true">
        <Plus className="w-3.5 h-3.5" />
      </span>
    </button>
  );

  const handleCanvasDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    if (!e.dataTransfer.types.includes(ASSET_MIME)) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
    if (!dropActive) setDropActive(true);
  };

  const handleCanvasDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDropActive(false);
    const asset = SEEDED_ASSETS.find(a => a.id === e.dataTransfer.getData(ASSET_MIME));
    const canvas = canvasRef.current;
    if (!asset || !canvas) return;
    const rect = canvas.getBoundingClientRect();
    handleAddAsset(asset, {
      x: ((e.clientX - rect.left) / rect.width) * 500,
      y: ((e.clientY - rect.top) / rect.height) * 600,
    });
  };

  const renderElementControls = (compact: boolean) => {
    if (!selectedElement) return null;
    const isUpload = selectedElement.assetId === 'custom-upload';
    return (
      <div className={compact ? 'space-y-3' : 'space-y-5'}>
        {!isUpload && (
          <fieldset>
            <legend className={`${sectionLabel} mb-2`}>Color</legend>
            <div className={compact ? 'flex gap-2 overflow-x-auto pb-1 -mx-1 px-1 [scrollbar-width:none]' : 'grid grid-cols-6 gap-2'}>
              {PRESET_COLORS.map((col) => {
                const active = selectedElement.tint.toLowerCase() === col.hex.toLowerCase();
                return (
                  <button
                    key={col.hex}
                    type="button"
                    onClick={() => updateSelected({ tint: col.hex })}
                    aria-label={col.name}
                    aria-pressed={active}
                    title={col.name}
                    style={{ backgroundColor: col.hex }}
                    className={`shrink-0 w-9 h-9 rounded-full border border-black/10 cursor-pointer transition-shadow focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sage-600 ${
                      active ? 'ring-2 ring-sage-600 ring-offset-2 ring-offset-white dark:ring-offset-stone-900' : 'hover:ring-2 hover:ring-stone-300 hover:ring-offset-1'
                    }`}
                  >
                    {active && <Check className="w-4 h-4 mx-auto text-white mix-blend-difference" aria-hidden="true" />}
                  </button>
                );
              })}
              <label
                title="Custom color"
                className="relative shrink-0 w-9 h-9 rounded-full cursor-pointer bg-[conic-gradient(#f43f5e,#eab308,#22c55e,#0ea5e9,#a855f7,#f43f5e)] border border-black/10 focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-sage-600"
              >
                <span className="sr-only">Custom color</span>
                <input
                  type="color"
                  value={selectedElement.tint}
                  onFocus={beginEdit}
                  onBlur={endEdit}
                  onChange={(e) => patchSelected({ tint: e.target.value })}
                  className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                />
              </label>
            </div>
          </fieldset>
        )}

        <div className={compact ? 'grid grid-cols-2 gap-4' : 'space-y-5'}>
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label htmlFor={`rot-${compact}`} className={`${sectionLabel} flex items-center gap-1.5`}>
                <RotateCw className="w-3.5 h-3.5" aria-hidden="true" /> Rotate
              </label>
              <span className="text-xs font-semibold tabular-nums text-sage-700 dark:text-sage-200">{Math.round(selectedElement.rotation)}°</span>
            </div>
            <input
              id={`rot-${compact}`}
              type="range" min={-180} max={180} step={1}
              value={normalizeRotation(selectedElement.rotation)}
              onPointerDown={beginEdit} onPointerUp={endEdit} onBlur={endEdit}
              onChange={(e) => patchSelected({ rotation: parseInt(e.target.value, 10) })}
              className="w-full h-2 cursor-pointer accent-sage-600"
            />
          </div>
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label htmlFor={`size-${compact}`} className={`${sectionLabel} flex items-center gap-1.5`}>
                <Maximize2 className="w-3.5 h-3.5" aria-hidden="true" /> Size
              </label>
              <span className="text-xs font-semibold tabular-nums text-sage-700 dark:text-sage-200">{selectedElement.scale.toFixed(1)}×</span>
            </div>
            <input
              id={`size-${compact}`}
              type="range" min={0.3} max={4} step={0.05}
              value={selectedElement.scale}
              onPointerDown={beginEdit} onPointerUp={endEdit} onBlur={endEdit}
              onChange={(e) => patchSelected({ scale: parseFloat(e.target.value) })}
              className="w-full h-2 cursor-pointer accent-sage-600"
            />
          </div>
        </div>

        <div className={compact ? 'flex gap-2 overflow-x-auto pb-1 -mx-1 px-1 [scrollbar-width:none]' : 'space-y-5'}>
          <div className={compact ? 'contents' : ''}>
            {!compact && <p className={`${sectionLabel} mb-2`}>Mirror</p>}
            <div className={compact ? 'contents' : 'grid grid-cols-2 gap-2'}>
              <button type="button" aria-pressed={!!selectedElement.flipX} onClick={() => updateSelected({ flipX: !selectedElement.flipX })} className={`${chipButton} shrink-0 ${selectedElement.flipX ? chipActive : chipIdle}`}>
                <FlipHorizontal2 className="w-4 h-4" aria-hidden="true" /> Flip H
              </button>
              <button type="button" aria-pressed={!!selectedElement.flipY} onClick={() => updateSelected({ flipY: !selectedElement.flipY })} className={`${chipButton} shrink-0 ${selectedElement.flipY ? chipActive : chipIdle}`}>
                <FlipVertical2 className="w-4 h-4" aria-hidden="true" /> Flip V
              </button>
            </div>
          </div>

          <div className={compact ? 'contents' : ''}>
            {!compact && <p className={`${sectionLabel} mb-2 flex items-center gap-1.5`}><Layers className="w-3.5 h-3.5" aria-hidden="true" /> Layer order</p>}
            <div className={compact ? 'contents' : 'grid grid-cols-4 gap-2'}>
              <button type="button" onClick={bringToFront} aria-label="Bring to front" title="Bring to front" className={`${chipButton} shrink-0 ${chipIdle}`}><ArrowUpToLine className="w-4 h-4" aria-hidden="true" /></button>
              <button type="button" onClick={() => swapLayer(1)} aria-label="Move up one layer" title="Move up" className={`${chipButton} shrink-0 ${chipIdle}`}><ChevronUp className="w-4 h-4" aria-hidden="true" /></button>
              <button type="button" onClick={() => swapLayer(-1)} aria-label="Move down one layer" title="Move down" className={`${chipButton} shrink-0 ${chipIdle}`}><ChevronDown className="w-4 h-4" aria-hidden="true" /></button>
              <button type="button" onClick={sendToBack} aria-label="Send to back" title="Send to back" className={`${chipButton} shrink-0 ${chipIdle}`}><ArrowDownToLine className="w-4 h-4" aria-hidden="true" /></button>
            </div>
          </div>

          <div className={compact ? 'contents' : 'grid grid-cols-2 gap-2'}>
            <button type="button" onClick={duplicateSelected} className={`${chipButton} shrink-0 ${chipIdle}`}>
              <CopyPlus className="w-4 h-4" aria-hidden="true" /> Duplicate
            </button>
            <button type="button" onClick={deleteSelected} className={`${chipButton} shrink-0 border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100 dark:border-rose-900/50 dark:bg-rose-950/40 dark:text-rose-300`}>
              <Trash2 className="w-4 h-4" aria-hidden="true" /> Delete
            </button>
          </div>
        </div>
      </div>
    );
  };

  const steps: { key: MobileView; label: string; short: string }[] = [
    { key: 'library', label: 'Add flowers', short: 'Add' },
    { key: 'canvas', label: 'Arrange', short: 'Arrange' },
    { key: 'card', label: 'Card & send', short: 'Send' },
  ];

  return (
    <div className="flex-1 min-h-0 flex flex-col lg:flex-row h-[calc(100dvh-4rem)] overflow-hidden bg-[#f7f5f2] dark:bg-stone-950">

      {/* ═══ STEP NAV (below lg) ═══ */}
      <nav aria-label="Builder steps" className="lg:hidden shrink-0 bg-white dark:bg-stone-900 border-b border-stone-200 dark:border-stone-800 px-2 py-2">
        <ol className="grid grid-cols-3 gap-1.5">
          {steps.map((step, i) => {
            const active = mobileView === step.key;
            return (
              <li key={step.key}>
                <button
                  type="button"
                  onClick={() => setMobileView(step.key)}
                  aria-current={active ? 'step' : undefined}
                  className={`w-full min-h-11 flex items-center justify-center gap-2 rounded-xl px-2 text-sm font-semibold transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sage-600 ${
                    active ? 'bg-sage-600 text-white shadow-sm' : 'text-stone-600 hover:bg-stone-100 dark:text-stone-300 dark:hover:bg-stone-800'
                  }`}
                >
                  <span className={`shrink-0 grid place-items-center w-5 h-5 rounded-full text-[11px] ${active ? 'bg-white/20' : 'bg-stone-200 dark:bg-stone-700'}`}>{i + 1}</span>
                  <span className="sm:hidden">{step.short}</span>
                  <span className="hidden sm:inline">{step.label}</span>
                  {step.key === 'canvas' && elements.length > 0 && (
                    <span className={`text-xs tabular-nums ${active ? 'text-white/80' : 'text-stone-400'}`}>({elements.length})</span>
                  )}
                </button>
              </li>
            );
          })}
        </ol>
      </nav>

      {/* ═══ LEFT: Library ═══ */}
      <aside
        aria-label="Flower library"
        className={`${mobileView === 'library' ? 'flex' : 'hidden'} lg:flex flex-col flex-1 lg:flex-none lg:w-72 xl:w-[22rem] 2xl:w-96 min-h-0 bg-white dark:bg-stone-900 lg:border-r border-stone-200 dark:border-stone-800`}
      >
        <div className="shrink-0 px-4 sm:px-5 pt-4 lg:pt-5 pb-3 space-y-3">
          <div className="hidden lg:block">
            <h2 className="font-serif font-bold text-xl text-stone-900 dark:text-stone-100">Add to your bouquet</h2>
            <p className="text-sm text-stone-500 dark:text-stone-400">Click to add, or drag straight onto the canvas.</p>
          </div>
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400 pointer-events-none" aria-hidden="true" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search roses, vases, bows…"
              aria-label="Search the library"
              className="w-full min-h-11 pl-10 pr-10 rounded-xl border border-stone-200 bg-stone-50 text-base sm:text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-sage-600 focus:bg-white dark:border-stone-700 dark:bg-stone-950 dark:text-stone-100 [&::-webkit-search-cancel-button]:hidden"
            />
            {query && (
              <button type="button" onClick={() => setQuery('')} aria-label="Clear search" className="absolute right-1.5 top-1/2 -translate-y-1/2 w-8 h-8 grid place-items-center rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100 dark:hover:bg-stone-800 cursor-pointer">
                <X className="w-4 h-4" aria-hidden="true" />
              </button>
            )}
          </div>
        </div>

        {!query && (
          <div role="tablist" aria-label="Library categories" className="shrink-0 grid grid-cols-6 gap-1 px-3 sm:px-4 pb-3 border-b border-stone-200 dark:border-stone-800">
            {LIBRARY_TABS.map(({ key, label, icon: Icon }) => {
              const active = activeTab === key;
              return (
                <button
                  key={key}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  aria-controls="library-panel"
                  onClick={() => setActiveTab(key)}
                  className={`min-h-16 flex flex-col items-center justify-center gap-1.5 rounded-xl px-0.5 text-xs lg:text-[11px] xl:text-xs font-semibold transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sage-600 ${
                    active
                      ? 'bg-sage-600 text-white shadow-sm shadow-sage-600/25'
                      : 'text-stone-600 hover:bg-stone-100 hover:text-stone-900 dark:text-stone-400 dark:hover:bg-stone-800 dark:hover:text-stone-100'
                  }`}
                >
                  <Icon className="w-5 h-5" aria-hidden="true" />
                  {label}
                </button>
              );
            })}
          </div>
        )}

        <div id="library-panel" role={query ? undefined : 'tabpanel'} className="flex-1 min-h-0 overflow-y-auto overscroll-contain px-3 sm:px-4 py-4">
          {query ? (
            <div>
              <p className="text-sm text-stone-500 dark:text-stone-400 px-1 pb-3" aria-live="polite">
                {searchResults.length === 0
                  ? <>No matches for &ldquo;{query}&rdquo;. Try &ldquo;rose&rdquo; or &ldquo;vase&rdquo;.</>
                  : `${searchResults.length} result${searchResults.length === 1 ? '' : 's'}`}
              </p>
              <div className={assetGridClass}>{searchResults.map(renderAssetTile)}</div>
            </div>
          ) : activeTab === 'template' ? (
            <div>
              <p className="text-sm text-stone-500 dark:text-stone-400 px-1 pb-3">Start from a ready-made arrangement, then make it yours.</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-2 gap-3">
                {TEMPLATES.map((temp) => (
                  <button
                    key={temp.id}
                    type="button"
                    onClick={() => handleLoadTemplate(temp.elements)}
                    className="group text-left rounded-2xl border border-stone-200 dark:border-stone-800 p-2 hover:border-sage-600/60 hover:shadow-md transition-all cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sage-600"
                  >
                    <div className="relative aspect-[5/6] rounded-xl bg-gradient-to-b from-stone-50 to-[#f3efe8] dark:from-stone-950 dark:to-stone-900 overflow-hidden" aria-hidden="true">
                      {temp.elements.map((el) => (
                        <div
                          key={el.id}
                          className="absolute"
                          style={{
                            left: `${(el.x / 500) * 100}%`,
                            top: `${(el.y / 600) * 100}%`,
                            width: '19.2%',
                            height: '16%',
                            zIndex: el.z,
                            transform: `translate(-50%, -50%) rotate(${el.rotation}deg) scale(${el.scale})`,
                          }}
                        >
                          <AssetArt el={el} className="w-full h-full" />
                        </div>
                      ))}
                      <span className="absolute inset-x-2 bottom-2 z-50 rounded-lg bg-white/90 dark:bg-stone-900/90 py-1 text-center text-xs font-semibold text-sage-700 dark:text-sage-200 opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100 transition-opacity">
                        Use this
                      </span>
                    </div>
                    <p className="mt-2 px-1 text-sm font-semibold text-stone-900 dark:text-stone-100 leading-tight">{temp.name}</p>
                    <p className="mt-0.5 mb-1 px-1 text-xs text-stone-500 dark:text-stone-400 leading-snug line-clamp-2">{temp.desc}</p>
                  </button>
                ))}
              </div>
              <button
                type="button"
                onClick={startBlank}
                className="mt-3 w-full min-h-12 rounded-2xl border border-dashed border-stone-300 dark:border-stone-700 hover:border-sage-600 text-sm font-semibold text-stone-600 hover:text-sage-700 dark:text-stone-300 transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sage-600"
              >
                Start with a blank canvas
              </button>
            </div>
          ) : activeTab === 'upload' ? (
            <div className="space-y-4">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full border-2 border-dashed border-stone-300 dark:border-stone-700 rounded-2xl p-8 flex flex-col items-center text-center cursor-pointer hover:border-sage-600/60 hover:bg-sage-50/50 dark:hover:bg-stone-800 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sage-600"
              >
                <span className="w-12 h-12 bg-sage-50 dark:bg-stone-800 rounded-2xl grid place-items-center mb-3">
                  <ImagePlus className="w-6 h-6 text-sage-600" aria-hidden="true" />
                </span>
                <span className="text-sm font-semibold text-stone-800 dark:text-stone-200">Upload your own image</span>
                <span className="text-[13px] text-stone-500 mt-1">PNG, JPG or SVG · up to 1.5 MB</span>
                <span className="text-[13px] text-stone-500">Transparent PNGs look best.</span>
              </button>
              <input type="file" ref={fileInputRef} onChange={handleImageUpload} accept="image/*" className="sr-only" tabIndex={-1} aria-hidden="true" />

              {elements.some(el => el.assetId === 'custom-upload') && (
                <div>
                  <p className={`${sectionLabel} mb-2 px-1`}>Your uploads</p>
                  <div className="grid grid-cols-3 gap-2">
                    {elements.filter(el => el.assetId === 'custom-upload').map((el, i) => (
                      <button
                        key={el.id}
                        type="button"
                        onClick={() => { setSelectedId(el.id); setMobileView('canvas'); }}
                        aria-label={`Select uploaded image ${i + 1}`}
                        className={`aspect-square rounded-xl overflow-hidden border-2 bg-stone-50 transition-colors cursor-pointer ${selectedId === el.id ? 'border-sage-600' : 'border-stone-200 hover:border-stone-300'}`}
                      >
                        <AssetArt el={el} className="w-full h-full" />
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div>
              <p className="text-sm text-stone-500 dark:text-stone-400 px-1 pb-3">{CATEGORY_HINTS[activeTab]}</p>
              <div className={assetGridClass}>
                {SEEDED_ASSETS.filter(a => a.category === activeTab).map(renderAssetTile)}
              </div>
            </div>
          )}
        </div>
      </aside>

      {/* ═══ CENTER: Canvas ═══ */}
      <section
        aria-label="Bouquet canvas"
        className={`${mobileView === 'canvas' ? 'flex' : 'hidden'} lg:flex flex-1 min-w-0 min-h-0 flex-col`}
      >
        {/* Toolbar */}
        <div className="shrink-0 flex items-center justify-between gap-2 px-3 sm:px-4 py-2 bg-white/80 dark:bg-stone-900/80 backdrop-blur border-b border-stone-200 dark:border-stone-800">
          <div className="flex items-center gap-1">
            <button type="button" onClick={handleUndo} disabled={history.length === 0} aria-label="Undo" title="Undo (Ctrl+Z)" className="w-10 h-10 grid place-items-center rounded-xl text-stone-600 hover:bg-stone-100 dark:text-stone-300 dark:hover:bg-stone-800 disabled:opacity-35 disabled:hover:bg-transparent cursor-pointer disabled:cursor-not-allowed focus-visible:outline-2 focus-visible:outline-sage-600">
              <Undo2 className="w-[18px] h-[18px]" aria-hidden="true" />
            </button>
            <button type="button" onClick={handleRedo} disabled={future.length === 0} aria-label="Redo" title="Redo (Ctrl+Shift+Z)" className="w-10 h-10 grid place-items-center rounded-xl text-stone-600 hover:bg-stone-100 dark:text-stone-300 dark:hover:bg-stone-800 disabled:opacity-35 disabled:hover:bg-transparent cursor-pointer disabled:cursor-not-allowed focus-visible:outline-2 focus-visible:outline-sage-600">
              <Redo2 className="w-[18px] h-[18px]" aria-hidden="true" />
            </button>
          </div>

          <div role="radiogroup" aria-label="Canvas background" className="flex items-center gap-1.5">
            <span className="hidden sm:inline lg:hidden xl:inline text-xs font-semibold text-stone-500 mr-1">Background</span>
            {CANVAS_BACKGROUNDS.map(({ key, label, color }) => (
              <button
                key={key}
                type="button"
                role="radio"
                aria-checked={canvasBg === key}
                aria-label={label}
                title={label}
                onClick={() => setCanvasBg(key)}
                style={{ backgroundColor: color }}
                className={`w-7 h-7 rounded-full border border-black/10 cursor-pointer transition-shadow focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sage-600 ${
                  canvasBg === key ? 'ring-2 ring-sage-600 ring-offset-2 ring-offset-white dark:ring-offset-stone-900' : 'hover:ring-2 hover:ring-stone-300'
                }`}
              />
            ))}
          </div>

          <button
            type="button"
            onClick={clearCanvas}
            disabled={elements.length === 0}
            className="min-h-10 inline-flex items-center gap-1.5 px-3 rounded-xl text-[13px] font-semibold text-rose-700 hover:bg-rose-50 dark:text-rose-300 dark:hover:bg-rose-950/40 disabled:opacity-35 disabled:hover:bg-transparent cursor-pointer disabled:cursor-not-allowed focus-visible:outline-2 focus-visible:outline-sage-600"
          >
            <Trash2 className="w-4 h-4" aria-hidden="true" />
            <span className="hidden sm:inline">Clear</span>
          </button>
        </div>

        {/* Stage: a size container so the 5:6 canvas always fits both width and height */}
        <div className="flex-1 min-h-0 p-3 sm:p-5 grid place-items-center" style={{ containerType: 'size' }}>
          <div
            ref={canvasRef}
            onPointerDown={(e) => { if (e.target === e.currentTarget) setSelectedId(null); }}
            onDragOver={handleCanvasDragOver}
            onDragLeave={(e) => { if (e.currentTarget === e.target) setDropActive(false); }}
            onDrop={handleCanvasDrop}
            style={{ width: 'min(100cqw, 100cqh * 5 / 6, 640px)' }}
            className={`relative aspect-[5/6] rounded-[1.75rem] shadow-[0_24px_60px_-20px_rgba(41,37,36,0.28)] border overflow-hidden transition-[box-shadow,background-color] duration-300 touch-none ${dropActive ? 'ring-4 ring-sage-600/40 ring-offset-4 ring-offset-[#f7f5f2] dark:ring-offset-stone-950' : ''} ${
              canvasBg === 'default' ? 'bg-white dark:bg-[#141211] border-stone-200 canvas-grid dark:border-stone-800' :
              canvasBg === 'pink'    ? 'bg-rose-50 border-rose-200/60 dark:bg-rose-950/20 dark:border-rose-900/40' :
              canvasBg === 'sage'    ? 'bg-emerald-50/60 border-emerald-200/50 dark:bg-emerald-950/20 dark:border-emerald-900/40' :
              canvasBg === 'wood'    ? 'bg-amber-50/70 border-amber-200/40 dark:bg-[#2c1d11] dark:border-amber-900/30' :
                                       'bg-stone-900 border-stone-700 dark:bg-stone-950 dark:border-stone-800'
            }`}
          >
            {dropActive && (
              <div className="absolute inset-0 z-[999] grid place-items-center bg-sage-600/10 pointer-events-none">
                <span className="rounded-full bg-sage-600 px-4 py-2 text-sm font-semibold text-white shadow-lg">Drop to add</span>
              </div>
            )}

            {elements.length === 0 && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 p-6 text-center">
                <span className="w-14 h-14 rounded-2xl bg-sage-50 dark:bg-stone-800 grid place-items-center">
                  <Flower className="w-7 h-7 text-sage-600" aria-hidden="true" />
                </span>
                <p className="font-serif font-semibold text-lg text-stone-800 dark:text-stone-200">Your bouquet starts here</p>
                <p className="text-sm text-stone-500 dark:text-stone-400 max-w-[16rem]">
                  <span className="lg:hidden">Pick a template or add flowers to begin.</span>
                  <span className="hidden lg:inline">Pick a template, or drag flowers here from the library on the left.</span>
                </p>
                <button
                  type="button"
                  onClick={() => { setActiveTab('template'); setMobileView('library'); }}
                  className="lg:hidden mt-1 min-h-11 inline-flex items-center gap-2 rounded-xl bg-sage-600 px-4 text-sm font-semibold text-white shadow-sm cursor-pointer"
                >
                  <Flower className="w-4 h-4" aria-hidden="true" /> Add flowers
                </button>
              </div>
            )}

            {sortedElements.map((el) => {
              const isSelected = selectedId === el.id;
              const isDragging = draggingId === el.id;
              return (
                <div
                  key={el.id}
                  role="button"
                  tabIndex={0}
                  aria-label={`${elementName(el)}${isSelected ? ', selected. Use arrow keys to move, Delete to remove.' : ''}`}
                  aria-pressed={isSelected}
                  onFocus={() => setSelectedId(el.id)}
                  onPointerDown={(e) => handlePointerDown(e, el)}
                  onPointerMove={handlePointerMove}
                  onPointerUp={handlePointerUp}
                  onPointerCancel={handlePointerUp}
                  style={{
                    left: `${(el.x / 500) * 100}%`,
                    top: `${(el.y / 600) * 100}%`,
                    width: '19.2%',
                    height: '16%',
                    transform: `translate(-50%, -50%) rotate(${el.rotation}deg) scale(${el.flipX ? -el.scale : el.scale}, ${el.flipY ? -el.scale : el.scale})`,
                    zIndex: el.z,
                  }}
                  onPointerEnter={() => setHoveredId(el.id)}
                  onPointerLeave={() => setHoveredId(prev => (prev === el.id ? null : prev))}
                  className={`absolute select-none touch-none outline-none ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
                >
                  <AssetArt el={el} className="w-full h-full pointer-events-none" />
                </div>
              );
            })}

            {/* Selection/hover outlines live outside the scaled element so the line stays 2px at any size */}
            {[
              selectedElement && { el: selectedElement, kind: 'selected' as const },
              hoveredId && hoveredId !== selectedId && !draggingId
                ? { el: elements.find(e => e.id === hoveredId), kind: 'hover' as const }
                : null,
            ].map(item => item && item.el && (
              <div
                key={`outline-${item.kind}`}
                aria-hidden="true"
                className={`absolute pointer-events-none rounded-lg ${
                  item.kind === 'selected'
                    ? 'border-2 border-sage-600 shadow-[0_0_0_1px_rgba(255,255,255,0.85)]'
                    : 'border-2 border-dashed border-sage-600/45'
                }`}
                style={{
                  left: `${(item.el.x / 500) * 100}%`,
                  top: `${(item.el.y / 600) * 100}%`,
                  width: `${19.2 * item.el.scale}%`,
                  height: `${16 * item.el.scale}%`,
                  transform: `translate(-50%, -50%) rotate(${item.el.rotation}deg)`,
                  zIndex: 998,
                }}
              >
                {item.kind === 'selected' && ['-top-1.5 -left-1.5', '-top-1.5 -right-1.5', '-bottom-1.5 -left-1.5', '-bottom-1.5 -right-1.5'].map(pos => (
                  <span key={pos} className={`absolute ${pos} w-3 h-3 rounded-[3px] bg-white border-2 border-sage-600`} />
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* Below-canvas panel (below lg): edit the selection or move between steps — never overlaps the canvas */}
        <div className="lg:hidden shrink-0 border-t border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] max-h-[45%] overflow-y-auto">
          {selectedElement ? (
            <>
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm font-semibold text-stone-900 dark:text-stone-100 truncate">{elementName(selectedElement)}</p>
                <button type="button" onClick={() => setSelectedId(null)} className="min-h-9 px-3 rounded-lg text-[13px] font-semibold text-sage-700 dark:text-sage-200 hover:bg-sage-50 dark:hover:bg-stone-800 cursor-pointer">
                  Done
                </button>
              </div>
              {renderElementControls(true)}
            </>
          ) : (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setMobileView('library')}
                className="flex-1 min-h-12 inline-flex items-center justify-center gap-2 rounded-xl border border-stone-300 dark:border-stone-700 text-sm font-semibold text-stone-800 dark:text-stone-200 cursor-pointer"
              >
                <Flower className="w-4 h-4" aria-hidden="true" /> {elements.length ? 'Add more' : 'Add flowers'}
              </button>
              <button
                type="button"
                onClick={() => setMobileView('card')}
                className="flex-1 min-h-12 inline-flex items-center justify-center gap-2 rounded-xl bg-sage-600 text-sm font-semibold text-white shadow-sm cursor-pointer"
              >
                Write card <ChevronRight className="w-4 h-4" aria-hidden="true" />
              </button>
            </div>
          )}
        </div>
      </section>

      {/* ═══ RIGHT: Inspector, layers, card & share ═══ */}
      <aside
        aria-label="Details and sharing"
        className={`${mobileView === 'card' ? 'flex' : 'hidden'} lg:flex flex-col flex-1 lg:flex-none lg:w-72 xl:w-96 min-h-0 bg-white dark:bg-stone-900 lg:border-l border-stone-200 dark:border-stone-800`}
      >
        <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain p-4 sm:p-5 space-y-5">

          {/* Selection (desktop only — below lg it lives under the canvas) */}
          <section aria-label="Selected element" className="hidden lg:block">
            {selectedElement ? (
              <div className="rounded-2xl border border-sage-600/25 bg-sage-50/50 dark:bg-stone-950/40">
                <div className="flex items-center gap-2.5 px-4 py-3 border-b border-sage-600/15">
                  <span className="w-8 h-8 shrink-0 rounded-lg bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 grid place-items-center overflow-hidden">
                    <AssetArt el={selectedElement} className="w-6 h-6" />
                  </span>
                  <p className="flex-1 min-w-0 text-sm font-semibold text-sage-800 dark:text-sage-200 truncate">{elementName(selectedElement)}</p>
                  <button type="button" onClick={() => setSelectedId(null)} aria-label="Deselect" className="w-8 h-8 grid place-items-center rounded-lg text-stone-400 hover:text-stone-700 hover:bg-white dark:hover:bg-stone-800 cursor-pointer">
                    <X className="w-4 h-4" aria-hidden="true" />
                  </button>
                </div>
                <div className="p-4">{renderElementControls(false)}</div>
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-stone-300 dark:border-stone-700 p-5 text-center">
                <p className="text-sm font-semibold text-stone-700 dark:text-stone-300">Nothing selected</p>
                <p className="mt-1 text-[13px] text-stone-500 dark:text-stone-400 leading-relaxed">
                  Click a flower on the canvas to recolor, resize or rotate it. Drag to move, or use arrow keys.
                </p>
              </div>
            )}
          </section>

          {/* Layers (desktop only) */}
          {elements.length > 0 && (
            <section aria-labelledby="layers-title" className="hidden lg:block rounded-2xl border border-stone-200 dark:border-stone-800 overflow-hidden">
              <div className="flex items-center justify-between px-4 py-2.5 bg-stone-50 dark:bg-stone-800/50 border-b border-stone-200 dark:border-stone-800">
                <h3 id="layers-title" className={`${sectionLabel} flex items-center gap-1.5`}>
                  <Layers className="w-3.5 h-3.5" aria-hidden="true" /> Layers
                </h3>
                <span className="text-xs tabular-nums text-stone-500">{elements.length}</span>
              </div>
              <ul className="max-h-48 overflow-y-auto divide-y divide-stone-100 dark:divide-stone-800">
                {[...elements].sort((a, b) => b.z - a.z).map((el) => {
                  const isSelected = selectedId === el.id;
                  return (
                    <li key={el.id}>
                      <button
                        type="button"
                        onClick={() => setSelectedId(el.id)}
                        onMouseEnter={() => setHoveredId(el.id)}
                        onMouseLeave={() => setHoveredId(null)}
                        aria-current={isSelected ? 'true' : undefined}
                        className={`w-full flex items-center gap-2.5 px-3 py-2 text-left cursor-pointer transition-colors border-l-2 ${
                          isSelected ? 'bg-sage-50 dark:bg-stone-800 border-l-sage-600' : 'border-l-transparent hover:bg-stone-50 dark:hover:bg-stone-800/50'
                        }`}
                      >
                        <span className="w-8 h-8 shrink-0 rounded-lg bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 grid place-items-center overflow-hidden">
                          <AssetArt el={el} className="w-6 h-6" />
                        </span>
                        <span className="flex-1 truncate text-[13px] font-medium text-stone-700 dark:text-stone-300">{elementName(el)}</span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </section>
          )}

          {/* Message card */}
          <section aria-labelledby="card-title" className="space-y-4">
            <div>
              <h2 id="card-title" className="font-serif font-bold text-lg text-stone-900 dark:text-stone-100 flex items-center gap-2">
                <Mail className="w-4 h-4 text-sage-600" aria-hidden="true" /> Write your card
              </h2>
              <p className="text-[13px] text-stone-500 dark:text-stone-400">All fields are optional — but a few words go a long way.</p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="card-to" className={`${sectionLabel} block mb-1.5`}>To</label>
                <input id="card-to" type="text" value={recipientName} onChange={(e) => setRecipientName(e.target.value)} placeholder="Their name" maxLength={60} autoComplete="off" className={fieldClass} />
              </div>
              <div>
                <label htmlFor="card-from" className={`${sectionLabel} block mb-1.5`}>From</label>
                <input id="card-from" type="text" value={senderName} onChange={(e) => setSenderName(e.target.value)} placeholder="Your name" maxLength={60} autoComplete="name" className={fieldClass} />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="card-message" className={sectionLabel}>Message</label>
                <span className="text-xs tabular-nums text-stone-400" aria-live="polite">{message.length}/{MESSAGE_MAX}</span>
              </div>
              <textarea
                id="card-message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Write something from the heart…"
                rows={4}
                maxLength={MESSAGE_MAX}
                className={`${fieldClass} resize-y min-h-24`}
              />
            </div>

            <fieldset>
              <legend className={`${sectionLabel} mb-2`}>
                Card style · <span className="font-normal text-stone-500">{activeTheme.name}</span>
              </legend>
              <div className="flex gap-2.5">
                {CARD_THEMES.map((theme) => {
                  const active = cardStyle === theme.id;
                  return (
                    <button
                      key={theme.id}
                      type="button"
                      onClick={() => setCardStyle(theme.id)}
                      aria-label={theme.name}
                      aria-pressed={active}
                      title={theme.name}
                      className={`w-11 h-11 rounded-xl border ${theme.bg} ${theme.border} cursor-pointer transition-shadow focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sage-600 ${
                        active ? 'ring-2 ring-sage-600 ring-offset-2 ring-offset-white dark:ring-offset-stone-900' : 'hover:ring-2 hover:ring-stone-300'
                      }`}
                    />
                  );
                })}
              </div>
            </fieldset>

            {/* Live preview */}
            <div className={`rounded-2xl border p-4 shadow-sm ${activeTheme.bg} ${activeTheme.border} ${activeTheme.text}`} aria-label="Card preview">
              <p className="text-[11px] font-bold uppercase tracking-[0.14em] opacity-70">To {recipientName || 'someone special'}</p>
              <p className="mt-2 font-cursive text-2xl leading-snug whitespace-pre-line break-words">{message || 'Thinking of you!'}</p>
              <p className="mt-2 text-right text-sm opacity-80">— {senderName || 'A secret admirer'}</p>
            </div>

            <label className="flex items-start gap-3 rounded-xl border border-stone-200 dark:border-stone-800 p-3 cursor-pointer">
              <input type="checkbox" checked={isPublic} onChange={(e) => setIsPublic(e.target.checked)} className="mt-0.5 w-5 h-5 accent-sage-600 cursor-pointer" />
              <span>
                <span className="block text-sm font-semibold text-stone-800 dark:text-stone-200">Show in the public gallery</span>
                <span className="block text-[13px] text-stone-500 dark:text-stone-400">Others can see your arrangement for inspiration.</span>
              </span>
            </label>
          </section>
        </div>

        {/* Sticky share footer — always reachable */}
        <div className="shrink-0 border-t border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 p-4 sm:px-5 pb-[max(1rem,env(safe-area-inset-bottom))] space-y-2">
          {shareError && (
            <p role="alert" className="text-[13px] text-rose-700 dark:text-rose-300">{shareError}</p>
          )}
          <button
            type="button"
            onClick={handleSaveAndShare}
            disabled={isSaving}
            className="w-full min-h-12 bg-sage-600 hover:bg-sage-700 text-white font-semibold rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-sage-600/20 active:scale-[0.99] transition-all disabled:opacity-60 disabled:cursor-wait cursor-pointer text-[15px] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sage-600"
          >
            {isSaving ? (
              <><Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" /> Wrapping your bouquet…</>
            ) : (
              <><Share2 className="w-4 h-4" aria-hidden="true" /> Wrap &amp; share bouquet</>
            )}
          </button>
        </div>
      </aside>

      {/* ═══ TOAST ═══ */}
      <div aria-live="polite" className="pointer-events-none fixed inset-x-0 bottom-4 z-[60] flex justify-center px-4">
        {toast && (
          <div key={toast.id} className="pointer-events-auto animate-bloom flex items-center gap-3 rounded-2xl bg-stone-900 text-white pl-4 pr-2 py-2 shadow-2xl text-sm dark:bg-stone-100 dark:text-stone-900">
            <span>{toast.text}</span>
            {toast.undo && history.length > 0 && (
              <button type="button" onClick={() => { handleUndo(); setToast(null); }} className="min-h-9 px-3 rounded-xl font-semibold text-sage-200 dark:text-sage-700 hover:bg-white/10 dark:hover:bg-black/5 cursor-pointer">
                Undo
              </button>
            )}
          </div>
        )}
      </div>

      {/* ═══ SHARE MODAL ═══ */}
      {isShareModalOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-end sm:items-center justify-center sm:p-4"
          onPointerDown={(e) => { if (e.target === e.currentTarget) setIsShareModalOpen(false); }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="share-title"
            className="animate-bloom w-full sm:max-w-md max-h-[92dvh] overflow-y-auto bg-white dark:bg-stone-900 rounded-t-3xl sm:rounded-3xl shadow-2xl border border-stone-200 dark:border-stone-800"
          >
            <div className="flex items-start justify-between gap-4 px-6 pt-5 pb-4 border-b border-stone-100 dark:border-stone-800">
              <div>
                <h3 id="share-title" className="text-xl font-serif font-bold text-stone-900 dark:text-stone-100">Your bouquet is wrapped</h3>
                <p className="text-sm text-stone-500 dark:text-stone-400 mt-0.5">Send it however feels right.</p>
              </div>
              <button type="button" onClick={() => setIsShareModalOpen(false)} aria-label="Close" className="w-10 h-10 shrink-0 rounded-full grid place-items-center text-stone-500 hover:text-stone-800 hover:bg-stone-100 dark:hover:bg-stone-800 cursor-pointer focus-visible:outline-2 focus-visible:outline-sage-600">
                <X className="w-5 h-5" aria-hidden="true" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div>
                <label htmlFor="share-link" className={`${sectionLabel} block mb-1.5`}>Share link</label>
                <div className="flex gap-2">
                  <input
                    id="share-link"
                    ref={shareLinkRef}
                    type="text"
                    readOnly
                    value={shareUrl}
                    onFocus={(e) => e.currentTarget.select()}
                    className={`${fieldClass} flex-1 min-w-0 bg-stone-50 dark:bg-stone-950 text-stone-600`}
                  />
                  <button
                    type="button"
                    autoFocus
                    onClick={copyLink}
                    className="min-h-11 shrink-0 bg-sage-600 hover:bg-sage-700 text-white font-semibold px-4 rounded-xl inline-flex items-center gap-1.5 text-sm transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sage-600"
                  >
                    {copied ? <Check className="w-4 h-4" aria-hidden="true" /> : <Copy className="w-4 h-4" aria-hidden="true" />}
                    <span aria-live="polite">{copied ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
              </div>

              <form onSubmit={handleSendEmail}>
                <label htmlFor="share-email" className={`${sectionLabel} block mb-1.5`}>Email it to them</label>
                <div className="flex gap-2">
                  <input
                    id="share-email"
                    type="email"
                    required
                    placeholder="their@email.com"
                    autoComplete="email"
                    value={recipientEmail}
                    onChange={(e) => setRecipientEmail(e.target.value)}
                    className={`${fieldClass} flex-1 min-w-0`}
                  />
                  <button
                    type="submit"
                    disabled={isSendingEmail}
                    className="min-h-11 shrink-0 bg-stone-900 hover:bg-stone-700 dark:bg-stone-100 dark:text-stone-900 text-white font-semibold px-4 rounded-xl inline-flex items-center gap-1.5 text-sm transition-colors cursor-pointer disabled:opacity-60 disabled:cursor-wait"
                  >
                    {isSendingEmail ? <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" /> : <Send className="w-4 h-4" aria-hidden="true" />}
                    {isSendingEmail ? 'Sending' : 'Send'}
                  </button>
                </div>
                {emailSendSuccess === true && (
                  <p role="status" className="mt-2 text-[13px] text-emerald-700 dark:text-emerald-400 font-medium flex items-center gap-1.5">
                    <Check className="w-4 h-4" aria-hidden="true" /> Sent! It&apos;s on its way to their inbox.
                  </p>
                )}
                {emailSendSuccess === false && (
                  <p role="alert" className="mt-2 text-[13px] text-rose-700 dark:text-rose-300 leading-relaxed">
                    {emailErrorMessage}
                  </p>
                )}
              </form>

              {qrCodeUrl && (
                <div className="flex items-center gap-4 rounded-2xl border border-stone-200 dark:border-stone-800 p-3">
                  {/* eslint-disable-next-line @next/next/no-img-element -- generated data URL */}
                  <img src={qrCodeUrl} alt={`QR code linking to ${shareUrl}`} className="w-24 h-24 rounded-lg bg-white" />
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-stone-800 dark:text-stone-200">QR code</p>
                    <p className="text-[13px] text-stone-500 dark:text-stone-400 mb-2">Print it on a card or gift tag.</p>
                    <a
                      href={qrCodeUrl}
                      download={`bloomly-${shareSlug}.png`}
                      className="inline-flex min-h-9 items-center gap-1.5 rounded-lg border border-sage-600/30 px-3 text-[13px] font-semibold text-sage-700 dark:text-sage-200 hover:bg-sage-50 dark:hover:bg-stone-800"
                    >
                      <Download className="w-4 h-4" aria-hidden="true" /> Download PNG
                    </a>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-2.5">
                <a
                  href={`mailto:?subject=${encodeURIComponent('You received a bouquet')}&body=${encodeURIComponent(`You received a bouquet from ${senderName || 'someone special'}! Open it here: ${shareUrl}`)}`}
                  className="min-h-11 rounded-xl border border-stone-300 dark:border-stone-700 hover:bg-stone-50 dark:hover:bg-stone-800 text-sm font-semibold text-stone-700 dark:text-stone-300 inline-flex items-center justify-center gap-1.5"
                >
                  <Mail className="w-4 h-4" aria-hidden="true" /> Email app
                </a>
                <a
                  href={shareUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="min-h-11 rounded-xl bg-sage-600 hover:bg-sage-700 text-white text-sm font-semibold inline-flex items-center justify-center gap-1.5"
                >
                  Preview <ExternalLink className="w-4 h-4" aria-hidden="true" />
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
