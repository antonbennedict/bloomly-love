'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
  Flower, 
  Sparkles, 
  Trash2, 
  RotateCw, 
  Maximize2, 
  Layers, 
  Share2, 
  Upload, 
  ChevronRight, 
  ArrowLeft, 
  Download, 
  Copy, 
  Check, 
  Mail, 
  History,
  FolderHeart
} from 'lucide-react';
import { SEEDED_ASSETS, Asset } from '@/lib/assets-seed';
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

const TEMPLATES = [
  {
    id: 'temp-roses',
    name: 'Blushing Roses',
    desc: 'An elegant arrangement of roses and eucalyptus wrapped in kraft paper.',
    elements: [
      { id: 't1', assetId: 'wrapper-paper', x: 250, y: 400, rotation: 0, scale: 1.4, z: 1, tint: '#D97706' },
      { id: 't2', assetId: 'filler-eucalyptus', x: 200, y: 220, rotation: -15, scale: 1.1, z: 2, tint: '#475569' },
      { id: 't3', assetId: 'filler-eucalyptus', x: 300, y: 210, rotation: 20, scale: 1.0, z: 3, tint: '#475569' },
      { id: 't4', assetId: 'flower-rose', x: 250, y: 230, rotation: 0, scale: 1.1, z: 4, tint: '#E11D48' },
      { id: 't5', assetId: 'flower-rose', x: 210, y: 270, rotation: -25, scale: 1.0, z: 5, tint: '#EC4899' },
      { id: 't6', assetId: 'flower-rose', x: 290, y: 260, rotation: 15, scale: 1.0, z: 6, tint: '#F43F5E' },
      { id: 't7', assetId: 'accessory-bow', x: 250, y: 390, rotation: 0, scale: 1.0, z: 7, tint: '#be123c' }
    ]
  },
  {
    id: 'temp-sunny',
    name: 'Sunny Daisy Mix',
    desc: 'Bright golden sunflowers and white daisies in a modern glass vase.',
    elements: [
      { id: 't1', assetId: 'wrapper-vase', x: 250, y: 410, rotation: 0, scale: 1.3, z: 1, tint: '#38BDF8' },
      { id: 't2', assetId: 'filler-babysbreath', x: 190, y: 240, rotation: -10, scale: 1.0, z: 2, tint: '#F1F5F9' },
      { id: 't3', assetId: 'filler-babysbreath', x: 310, y: 240, rotation: 15, scale: 1.0, z: 3, tint: '#F1F5F9' },
      { id: 't4', assetId: 'flower-sunflower', x: 250, y: 220, rotation: 0, scale: 1.2, z: 4, tint: '#EAB308' },
      { id: 't5', assetId: 'flower-daisy', x: 200, y: 290, rotation: -20, scale: 1.0, z: 5, tint: '#F8FAFC' },
      { id: 't6', assetId: 'flower-daisy', x: 300, y: 280, rotation: 25, scale: 0.9, z: 6, tint: '#F8FAFC' },
      { id: 't7', assetId: 'accessory-sparkles', x: 250, y: 150, rotation: 0, scale: 1.0, z: 7, tint: '#FACC15' }
    ]
  },
  {
    id: 'temp-tulips',
    name: 'Spring Tulip Bouquet',
    desc: 'A fresh, colorful mix of spring tulips and sage eucalyptus.',
    elements: [
      { id: 't1', assetId: 'wrapper-paper', x: 250, y: 400, rotation: 0, scale: 1.4, z: 1, tint: '#4a6c57' },
      { id: 't2', assetId: 'filler-eucalyptus', x: 250, y: 200, rotation: 0, scale: 1.1, z: 2, tint: '#475569' },
      { id: 't3', assetId: 'flower-tulip', x: 210, y: 250, rotation: -15, scale: 1.1, z: 3, tint: '#EC4899' },
      { id: 't4', assetId: 'flower-tulip', x: 250, y: 230, rotation: 5, scale: 1.1, z: 4, tint: '#F97316' },
      { id: 't5', assetId: 'flower-tulip', x: 290, y: 250, rotation: 20, scale: 1.0, z: 5, tint: '#EAB308' },
      { id: 't6', assetId: 'accessory-tag', x: 250, y: 390, rotation: -15, scale: 1.0, z: 6, tint: '#F59E0B' }
    ]
  }
];

export default function Builder() {
  const [elements, setElements] = useState<BouquetElement[]>([]);
  const [history, setHistory] = useState<BouquetElement[][]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'template' | 'flower' | 'wrapper' | 'filler' | 'accessory' | 'upload'>('template');
  
  // Save history state before changing elements
  const pushHistory = (newElements: BouquetElement[]) => {
    setHistory(prev => [...prev.slice(-20), elements]); // keep last 20 states
    setElements(newElements);
  };

  const handleUndo = () => {
    if (history.length === 0) return;
    const previous = history[history.length - 1];
    setHistory(prev => prev.slice(0, prev.length - 1));
    setElements(previous);
    if (selectedId && !previous.some(e => e.id === selectedId)) {
      setSelectedId(null);
    }
  };

  // Keyboard shortcut listener for Ctrl+Z / Cmd+Z
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
        if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
          return;
        }
        e.preventDefault();
        handleUndo();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [history, elements, selectedId]);
  
  const handleLoadTemplate = (templateElements: any[]) => {
    const loaded = templateElements.map(el => ({
      ...el,
      id: 'el_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6)
    }));
    setElements(loaded);
    setSelectedId(null);
  };

  const clearCanvas = () => {
    if (elements.length === 0) return;
    if (window.confirm("Are you sure you want to clear your current bouquet and start over?")) {
      setElements([]);
      setSelectedId(null);
    }
  };
  
  // Message Card state
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [senderName, setSenderName] = useState('');
  const [recipientName, setRecipientName] = useState('');
  const [cardStyle, setCardStyle] = useState('classic');
  const [isPublic, setIsPublic] = useState(true);

  // Dragging state
  const [dragState, setDragState] = useState<{
    elementId: string;
    startX: number;
    startY: number;
    initX: number;
    initY: number;
  } | null>(null);

  // Sharing states
  const [isSaving, setIsSaving] = useState(false);
  const [shareSlug, setShareSlug] = useState<string | null>(null);
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

  const canvasRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Advanced editor states
  const [canvasBg, setCanvasBg] = useState<'default' | 'pink' | 'sage' | 'wood' | 'dark'>('default');
  const [recipientEmail, setRecipientEmail] = useState('');
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [emailSendSuccess, setEmailSendSuccess] = useState<boolean | null>(null);

  // Fetch current user anonymous ID
  const [userId, setUserId] = useState<string | null>(null);
  useEffect(() => {
    getAnonymousSession().then(id => setUserId(id));
  }, []);

  // Window drag listeners
  useEffect(() => {
    const handleMove = (e: MouseEvent | TouchEvent) => {
      if (!dragState || !canvasRef.current) return;
      
      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
      
      const rect = canvasRef.current.getBoundingClientRect();
      const deltaX = clientX - dragState.startX;
      const deltaY = clientY - dragState.startY;

      // Coordinate scaling (coordinates are based on a fixed 500x600 size grid)
      const scaleX = 500 / rect.width;
      const scaleY = 600 / rect.height;

      setElements(prev => prev.map(el => {
        if (el.id === dragState.elementId) {
          // Clamp values to canvas bounds
          const newX = Math.max(-50, Math.min(550, dragState.initX + deltaX * scaleX));
          const newY = Math.max(-50, Math.min(650, dragState.initY + deltaY * scaleY));
          return { ...el, x: newX, y: newY };
        }
        return el;
      }));
    };

    const handleEnd = () => {
      if (dragState) setDragState(null);
    };

    if (dragState) {
      window.addEventListener('mousemove', handleMove);
      window.addEventListener('mouseup', handleEnd);
      window.addEventListener('touchmove', handleMove, { passive: false });
      window.addEventListener('touchend', handleEnd);
    }

    return () => {
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('mouseup', handleEnd);
      window.removeEventListener('touchmove', handleMove);
      window.removeEventListener('touchend', handleEnd);
    };
  }, [dragState]);

  // Click asset to add
  const handleAddAsset = (asset: Asset) => {
    const nextZ = elements.length > 0 ? Math.max(...elements.map(e => e.z)) + 1 : 1;
    
    // Position items centrally with slight random offsets
    const offset = (Math.random() - 0.5) * 40;
    
    const newElement: BouquetElement = {
      id: 'el_' + Date.now() + Math.random().toString(36).substring(2, 6),
      assetId: asset.id,
      x: 250 + offset,
      y: asset.category === 'wrapper' ? 420 : 250 + offset, // position wrapper lower
      rotation: 0,
      scale: asset.category === 'wrapper' ? 1.4 : 1.0,
      z: nextZ,
      tint: asset.defaultColor
    };

    pushHistory([...elements, newElement]);
    setSelectedId(newElement.id);
  };

  // Drag start
  const handleStartDrag = (e: React.MouseEvent | React.TouchEvent, elementId: string) => {
    e.stopPropagation();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    
    const element = elements.find(el => el.id === elementId);
    if (!element) return;
    
    setSelectedId(elementId);
    setDragState({
      elementId,
      startX: clientX,
      startY: clientY,
      initX: element.x,
      initY: element.y
    });
  };

  // Update selected element property
  const updateSelectedElement = (updates: Partial<BouquetElement>) => {
    if (!selectedId) return;
    pushHistory(elements.map(el => el.id === selectedId ? { ...el, ...updates } : el));
  };

  // Layer ordering
  const bringToFront = () => {
    if (!selectedId || elements.length <= 1) return;
    const maxZ = Math.max(...elements.map(e => e.z));
    updateSelectedElement({ z: maxZ + 1 });
  };

  const sendToBack = () => {
    if (!selectedId || elements.length <= 1) return;
    const minZ = Math.min(...elements.map(e => e.z));
    updateSelectedElement({ z: minZ - 1 });
  };

  const deleteSelected = () => {
    if (!selectedId) return;
    pushHistory(elements.filter(el => el.id !== selectedId));
    setSelectedId(null);
  };

  const moveForward = () => {
    if (!selectedId) return;
    const list = elements.map(el => ({ ...el }));
    const sorted = [...list].sort((a, b) => a.z - b.z);
    const idx = sorted.findIndex(el => el.id === selectedId);
    if (idx === -1 || idx === sorted.length - 1) return;
    
    const currentEl = sorted[idx];
    const nextEl = sorted[idx + 1];
    const tempZ = currentEl.z;
    
    currentEl.z = nextEl.z;
    nextEl.z = tempZ;
    
    pushHistory(list);
  };

  const moveBackward = () => {
    if (!selectedId) return;
    const list = elements.map(el => ({ ...el }));
    const sorted = [...list].sort((a, b) => a.z - b.z);
    const idx = sorted.findIndex(el => el.id === selectedId);
    if (idx === -1 || idx === 0) return;
    
    const currentEl = sorted[idx];
    const prevEl = sorted[idx - 1];
    const tempZ = currentEl.z;
    
    currentEl.z = prevEl.z;
    prevEl.z = tempZ;
    
    pushHistory(list);
  };

  const duplicateSelected = () => {
    if (!selectedId) return;
    const element = elements.find(el => el.id === selectedId);
    if (!element) return;
    
    const nextZ = elements.length > 0 ? Math.max(...elements.map(e => e.z)) + 1 : 1;
    const dup: BouquetElement = {
      ...element,
      id: 'el_' + Date.now() + Math.random().toString(36).substring(2, 6),
      x: Math.min(480, element.x + 20),
      y: Math.min(580, element.y + 20),
      z: nextZ
    };
    
    pushHistory([...elements, dup]);
    setSelectedId(dup.id);
  };

  const handleSendEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!recipientEmail || !shareSlug) return;
    
    setIsSendingEmail(true);
    setEmailSendSuccess(null);
    
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
      }
    } catch (err) {
      console.error(err);
      setEmailSendSuccess(false);
    } finally {
      setIsSendingEmail(false);
    }
  };

  // Handle custom image uploads
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      const nextZ = elements.length > 0 ? Math.max(...elements.map(e => e.z)) + 1 : 1;
      
      const newElement: BouquetElement = {
        id: 'el_' + Date.now(),
        assetId: 'custom-upload',
        x: 250,
        y: 250,
        rotation: 0,
        scale: 1.0,
        z: nextZ,
        tint: '#ffffff',
        customImageUrl: dataUrl
      };

      setElements(prev => [...prev, newElement]);
      setSelectedId(newElement.id);
    };
    reader.readAsDataURL(file);
  };

  // Generate unique short slug
  const generateSlug = (length = 8) => {
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };

  // Handle Bouquet Save & Share Flow
  const handleSaveAndShare = async () => {
    if (elements.length === 0) {
      alert("Add some flowers to your bouquet before sharing!");
      return;
    }
    
    setIsSaving(true);
    const slug = generateSlug();
    
    const bouquetData: BouquetData = {
      slug,
      owner_id: userId,
      title: title || 'Custom Bouquet',
      message: message || 'Thinking of you!',
      sender_name: senderName || 'A Secret Admirer',
      recipient_name: recipientName || 'Someone Special',
      composition: elements,
      card_style: `${cardStyle}|${canvasBg}`,
      is_public: isPublic
    };

    const res = await saveBouquet(bouquetData);
    setIsSaving(false);
    
    if (res.success) {
      setShareSlug(slug);
      
      // Generate QR Code url client-side
      const shareUrl = `${window.location.origin}/b/${slug}`;
      const qrUrl = await QRCode.toDataURL(shareUrl, { width: 300, margin: 2 });
      setQrCodeUrl(qrUrl);
      setIsShareModalOpen(true);
    } else {
      alert("Failed to save bouquet. Please try again.");
    }
  };

  // Copy share URL
  const copyLink = () => {
    if (!shareSlug) return;
    const shareUrl = `${window.location.origin}/b/${shareSlug}`;
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Get active selected element details
  const selectedElement = elements.find(el => el.id === selectedId);
  const selectedAsset = selectedElement ? SEEDED_ASSETS.find(a => a.id === selectedElement.assetId) : null;

  return (
    <div className="flex-1 flex flex-col md:flex-row h-[calc(100vh-4rem)] max-h-[calc(100vh-4rem)] overflow-hidden bg-[#f7f5f2] dark:bg-stone-950">

      {/* â•â•â• LEFT SIDEBAR: Asset Library â•â•â• */}
      <div className="w-full md:w-72 bg-white dark:bg-stone-900 flex flex-col h-[45vh] md:h-full overflow-hidden shrink-0 border-r border-stone-200/80 dark:border-stone-800">
        
        {/* Sidebar Header */}
        <div className="px-4 pt-4 pb-3 border-b border-stone-100 dark:border-stone-800">
          <h2 className="text-xs font-bold uppercase tracking-widest text-stone-400 dark:text-stone-500">Asset Library</h2>
        </div>

        {/* Icon-based Tab Nav */}
        <div className="flex items-center border-b border-stone-100 dark:border-stone-800 bg-stone-50/60 dark:bg-stone-900 overflow-x-auto scrollbar-none">
          {([
            { key: 'template', label: 'Start', icon: Sparkles },
            { key: 'flower', label: 'Flowers', icon: Flower },
            { key: 'wrapper', label: 'Wrap', icon: FolderHeart },
            { key: 'filler', label: 'Filler', icon: Sparkles },
            { key: 'accessory', label: 'Extra', icon: Share2 },
            { key: 'upload', label: 'Upload', icon: Upload },
          ] as const).map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`flex flex-col items-center justify-center py-2.5 px-3 shrink-0 text-[9px] font-bold uppercase tracking-wide border-b-2 transition-all cursor-pointer ${
                activeTab === key
                  ? 'border-[#4a6c57] text-[#4a6c57] dark:text-sage-300 bg-white dark:bg-stone-800'
                  : 'border-transparent text-stone-400 hover:text-stone-600 dark:hover:text-stone-300'
              }`}
            >
              <Icon className="w-4 h-4 mb-1" />
              {label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto">
          {/* Templates */}
          {activeTab === 'template' && (
            <div className="p-3 space-y-2">
              <p className="text-[10px] text-stone-400 px-1 pt-1 pb-2 font-medium">Pick a starter template or build from scratch.</p>
              {TEMPLATES.map((temp) => (
                <button
                  key={temp.id}
                  onClick={() => handleLoadTemplate(temp.elements)}
                  className="w-full text-left p-3 rounded-xl border border-stone-100 dark:border-stone-800 hover:border-[#4a6c57]/40 hover:bg-[#f0f7f2]/60 transition-all group cursor-pointer"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-stone-800 dark:text-stone-200 truncate">{temp.name}</p>
                      <p className="text-[10px] text-stone-400 leading-relaxed mt-0.5 line-clamp-2">{temp.desc}</p>
                    </div>
                    <div className="shrink-0 w-8 h-8 rounded-lg bg-[#f0f7f2] dark:bg-stone-800 flex items-center justify-center group-hover:bg-[#4a6c57] transition-colors">
                      <ChevronRight className="w-3.5 h-3.5 text-[#4a6c57] group-hover:text-white transition-colors" />
                    </div>
                  </div>
                </button>
              ))}
              <button
                onClick={() => { setElements([]); setSelectedId(null); setActiveTab('flower'); }}
                className="w-full text-center p-2.5 rounded-xl border border-dashed border-stone-200 dark:border-stone-800 hover:border-[#4a6c57]/50 text-[10px] font-semibold text-stone-400 hover:text-[#4a6c57] transition-all cursor-pointer"
              >
                + Start with blank canvas
              </button>
            </div>
          )}

          {/* Asset Grid */}
          {activeTab !== 'template' && activeTab !== 'upload' && (
            <div className="p-3 grid grid-cols-2 gap-2">
              {SEEDED_ASSETS.filter(a => a.category === activeTab).map((asset) => (
                <button
                  key={asset.id}
                  onClick={() => handleAddAsset(asset)}
                  className="group flex flex-col items-center justify-center gap-1.5 p-3 rounded-2xl border border-stone-100 dark:border-stone-800 hover:border-[#4a6c57]/50 hover:bg-[#f0f7f2]/80 dark:hover:bg-stone-800 active:scale-95 transition-all cursor-pointer relative"
                >
                  <div className="w-14 h-14 flex items-center justify-center drop-shadow-sm">
                    <svg viewBox={asset.viewBox} className="w-full h-full" style={{ color: asset.defaultColor }}>
                      <g dangerouslySetInnerHTML={{ __html: asset.svgMarkup }} />
                    </svg>
                  </div>
                  <span className="text-[9px] font-semibold text-stone-500 dark:text-stone-400 group-hover:text-[#4a6c57] text-center leading-tight transition-colors max-w-full truncate">{asset.name}</span>
                  <div className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-[#4a6c57] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity scale-75 group-hover:scale-100">
                    <span className="text-white text-[8px] font-bold leading-none">+</span>
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* Upload Tab */}
          {activeTab === 'upload' && (
            <div className="p-4 space-y-3">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full border-2 border-dashed border-stone-200 dark:border-stone-700 rounded-2xl p-8 flex flex-col items-center justify-center cursor-pointer hover:border-[#4a6c57]/50 hover:bg-[#f0f7f2]/50 transition-all group"
              >
                <div className="w-12 h-12 bg-[#f0f7f2] dark:bg-stone-800 rounded-2xl flex items-center justify-center mb-3 group-hover:bg-[#4a6c57]/10 transition-colors">
                  <Upload className="w-6 h-6 text-[#4a6c57]" />
                </div>
                <span className="text-xs font-bold text-stone-600 dark:text-stone-300">Upload Custom Image</span>
                <span className="text-[10px] text-stone-400 mt-1">PNG, JPG, SVG supported</span>
                <input type="file" ref={fileInputRef} onChange={handleImageUpload} accept="image/*" className="hidden" />
              </button>
              {elements.filter(el => el.assetId === 'custom-upload').length > 0 && (
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wide text-stone-400 mb-2 px-1">Uploaded</p>
                  <div className="grid grid-cols-3 gap-2">
                    {elements.filter(el => el.assetId === 'custom-upload').map((el) => (
                      <button
                        key={el.id}
                        onClick={() => setSelectedId(el.id)}
                        className={`aspect-square rounded-xl overflow-hidden border-2 transition-all ${selectedId === el.id ? 'border-[#4a6c57] shadow-md' : 'border-stone-200 hover:border-stone-300'}`}
                      >
                        <img src={el.customImageUrl} alt="Upload" className="w-full h-full object-contain bg-stone-50" />
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* â•â•â• CENTER: Canvas Workspace â•â•â• */}
      <div className="flex-1 flex flex-col bg-[#f7f5f2] dark:bg-stone-950 overflow-hidden">
        
        {/* Canvas Toolbar */}
        <div className="flex items-center justify-between px-4 py-2.5 bg-white/80 dark:bg-stone-900/80 backdrop-blur border-b border-stone-200/60 dark:border-stone-800 shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-widest text-stone-400">Background</span>
            <div className="flex items-center gap-1 bg-stone-100 dark:bg-stone-800 p-0.5 rounded-lg">
              {([
                { key: 'default', label: 'Grid', color: '#e2e8f0' },
                { key: 'pink', label: 'Rose', color: '#fce7f3' },
                { key: 'sage', label: 'Sage', color: '#d1fae5' },
                { key: 'wood', label: 'Wood', color: '#fde68a' },
                { key: 'dark', label: 'Dark', color: '#1c1917' },
              ] as const).map(({ key, label, color }) => (
                <button
                  key={key}
                  onClick={() => setCanvasBg(key)}
                  title={label}
                  className={`w-5 h-5 rounded-md border-2 transition-all cursor-pointer ${canvasBg === key ? 'border-[#4a6c57] scale-110 shadow-sm' : 'border-transparent hover:border-stone-300'}`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>
          <div className="flex items-center gap-2">
            {elements.length > 0 && (
              <span className="text-[10px] text-stone-400 font-medium">{elements.length} element{elements.length !== 1 ? 's' : ''}</span>
            )}
            {elements.length > 0 && (
              <button
                onClick={clearCanvas}
                className="text-[10px] font-bold text-rose-500 hover:text-rose-600 bg-rose-50 hover:bg-rose-100 border border-rose-200/60 px-2.5 py-1 rounded-lg transition-all cursor-pointer"
              >
                Clear All
              </button>
            )}
          </div>
        </div>

        {/* Canvas Area */}
        <div className="flex-1 flex items-center justify-center p-6 overflow-hidden relative">
          {elements.length === 0 && (
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-10">
              <Flower className="w-12 h-12 mb-2 text-stone-300/40 dark:text-stone-700/40" />
              <p className="text-sm font-medium text-stone-300 dark:text-stone-600">Click any element on the left to start</p>
            </div>
          )}

          <div
            ref={canvasRef}
            onClick={() => setSelectedId(null)}
            className={`w-full max-w-[420px] aspect-[4/5] rounded-3xl shadow-2xl border-2 relative overflow-hidden transition-all duration-300 cursor-default ${
              canvasBg === 'default' ? 'bg-white dark:bg-[#141211] border-stone-200/50 canvas-grid dark:border-stone-800/60' :
              canvasBg === 'pink'    ? 'bg-rose-50 border-rose-200/60 dark:bg-rose-950/20 dark:border-rose-900/40' :
              canvasBg === 'sage'    ? 'bg-emerald-50/60 border-emerald-200/50 dark:bg-emerald-950/20 dark:border-emerald-900/40' :
              canvasBg === 'wood'    ? 'bg-amber-50/70 border-amber-200/40 dark:bg-[#2c1d11] dark:border-amber-900/30' :
                                       'bg-stone-900 border-stone-700 dark:bg-stone-950 dark:border-stone-800'
            }`}
          >
            {elements
              .sort((a, b) => a.z - b.z)
              .map((el) => {
                const asset = SEEDED_ASSETS.find(a => a.id === el.assetId);
                const isSelected = selectedId === el.id;
                return (
                  <div
                    key={el.id}
                    onMouseDown={(e) => handleStartDrag(e, el.id)}
                    onTouchStart={(e) => handleStartDrag(e, el.id)}
                    style={{
                      left: `${(el.x / 500) * 100}%`,
                      top: `${(el.y / 600) * 100}%`,
                      transform: `translate(-50%, -50%) rotate(${el.rotation}deg) scale(${el.flipX ? -el.scale : el.scale}, ${el.flipY ? -el.scale : el.scale})`,
                      zIndex: el.z,
                      position: 'absolute',
                      cursor: dragState?.elementId === el.id ? 'grabbing' : 'grab',
                    }}
                    className={`select-none touch-none transition-[box-shadow] ${
                      isSelected
                        ? 'ring-2 ring-[#4a6c57] rounded-xl ring-offset-1'
                        : el.id === hoveredId
                          ? 'ring-2 ring-[#4a6c57]/50 ring-dashed rounded-xl'
                          : 'hover:ring-1 hover:ring-stone-400/40 rounded-lg'
                    }`}
                  >
                    <div className="w-24 h-24 flex items-center justify-center">
                      {el.assetId === 'custom-upload' ? (
                        <img src={el.customImageUrl} alt="Custom" className="w-full h-full object-contain pointer-events-none" />
                      ) : asset ? (
                        <svg viewBox={asset.viewBox} className="w-full h-full pointer-events-none" style={{ color: el.tint }}>
                          <g dangerouslySetInnerHTML={{ __html: asset.svgMarkup }} />
                        </svg>
                      ) : null}
                    </div>
                    {isSelected && (
                      <div className="absolute -top-1 -right-1 w-3 h-3 bg-[#4a6c57] rounded-full border border-white shadow-sm" />
                    )}
                  </div>
                );
              })}
          </div>
        </div>
      </div>

      {/* â•â•â• RIGHT SIDEBAR: Inspector & Card â•â•â• */}
      <div className="w-full md:w-80 bg-white dark:bg-stone-900 flex flex-col h-[55vh] md:h-full overflow-y-auto shrink-0 border-t md:border-t-0 md:border-l border-stone-200/80 dark:border-stone-800">

        {/* Inspector Header */}
        <div className="px-4 pt-4 pb-3 border-b border-stone-100 dark:border-stone-800 shrink-0">
          <h2 className="text-xs font-bold uppercase tracking-widest text-stone-400 dark:text-stone-500">Inspector</h2>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">

          {/* â”€â”€ ELEMENT CONTROLS â”€â”€ */}
          {selectedElement ? (
            <div className="rounded-2xl border border-[#4a6c57]/20 bg-[#f0f7f2]/60 dark:bg-stone-950/30 overflow-hidden">
              {/* Selected element header */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-[#4a6c57]/10">
                <div className="flex items-center gap-2 min-w-0">
                  {selectedElement.assetId !== 'custom-upload' && (() => {
                    const a = SEEDED_ASSETS.find(x => x.id === selectedElement.assetId);
                    return a ? (
                      <div className="w-6 h-6 shrink-0">
                        <svg viewBox={a.viewBox} className="w-full h-full" style={{ color: selectedElement.tint }}>
                          <g dangerouslySetInnerHTML={{ __html: a.svgMarkup }} />
                        </svg>
                      </div>
                    ) : null;
                  })()}
                  <span className="text-xs font-bold text-[#3d5e48] dark:text-sage-300 truncate">
                    {selectedElement.assetId === 'custom-upload' ? 'Custom Image' : SEEDED_ASSETS.find(a => a.id === selectedElement.assetId)?.name || 'Element'}
                  </span>
                </div>
                <button onClick={deleteSelected} className="text-stone-300 hover:text-rose-500 transition-colors p-1 shrink-0 cursor-pointer" title="Delete">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="p-4 space-y-4">
                {/* Color Picker */}
                {selectedElement.assetId !== 'custom-upload' && (
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">Color</label>
                    <div className="grid grid-cols-6 gap-1.5">
                      {PRESET_COLORS.map((col) => (
                        <button
                          key={col.hex}
                          onClick={() => updateSelectedElement({ tint: col.hex })}
                          style={{ backgroundColor: col.hex }}
                          title={col.name}
                          className={`w-full aspect-square rounded-full border-2 transition-all cursor-pointer ${
                            selectedElement.tint === col.hex
                              ? 'border-[#4a6c57] scale-110 shadow-md ring-2 ring-[#4a6c57]/20'
                              : 'border-white hover:scale-105 hover:shadow-sm'
                          }`}
                        />
                      ))}
                      <div className="relative w-full aspect-square rounded-full overflow-hidden border-2 border-dashed border-stone-300 hover:border-[#4a6c57] transition-colors cursor-pointer flex items-center justify-center bg-gradient-to-br from-red-400 via-yellow-300 to-blue-400">
                        <input
                          type="color"
                          value={selectedElement.tint}
                          onChange={(e) => updateSelectedElement({ tint: e.target.value })}
                          className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                        />
                        <span className="text-[7px] font-bold text-white drop-shadow pointer-events-none select-none">HSL</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Rotation */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] font-bold text-stone-400 uppercase tracking-widest flex items-center gap-1">
                      <RotateCw className="w-3 h-3" /> Rotation
                    </label>
                    <span className="text-[10px] font-bold text-[#4a6c57] bg-[#4a6c57]/10 px-1.5 py-0.5 rounded">{selectedElement.rotation} deg</span>
                  </div>
                  <input
                    type="range" min="0" max="360"
                    value={selectedElement.rotation}
                    onChange={(e) => updateSelectedElement({ rotation: parseInt(e.target.value) })}
                    className="w-full h-1.5 rounded-full appearance-none cursor-pointer accent-[#4a6c57] bg-stone-200"
                  />
                </div>

                {/* Scale */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] font-bold text-stone-400 uppercase tracking-widest flex items-center gap-1">
                      <Maximize2 className="w-3 h-3" /> Size
                    </label>
                    <span className="text-[10px] font-bold text-[#4a6c57] bg-[#4a6c57]/10 px-1.5 py-0.5 rounded">{selectedElement.scale.toFixed(1)}x</span>
                  </div>
                  <input
                    type="range" min="0.3" max="2.5" step="0.05"
                    value={selectedElement.scale}
                    onChange={(e) => updateSelectedElement({ scale: parseFloat(e.target.value) })}
                    className="w-full h-1.5 rounded-full appearance-none cursor-pointer accent-[#4a6c57] bg-stone-200"
                  />
                </div>

                {/* Flip */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">Mirror</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => updateSelectedElement({ flipX: !selectedElement.flipX })}
                      className={`py-1.5 rounded-lg text-[10px] font-bold border transition-all cursor-pointer ${
                        selectedElement.flipX ? 'bg-[#4a6c57] border-[#4a6c57] text-white' : 'border-stone-200 text-stone-500 hover:border-[#4a6c57]/40 hover:text-[#4a6c57]'
                      }`}
                    >Flip H</button>
                    <button
                      onClick={() => updateSelectedElement({ flipY: !selectedElement.flipY })}
                      className={`py-1.5 rounded-lg text-[10px] font-bold border transition-all cursor-pointer ${
                        selectedElement.flipY ? 'bg-[#4a6c57] border-[#4a6c57] text-white' : 'border-stone-200 text-stone-500 hover:border-[#4a6c57]/40 hover:text-[#4a6c57]'
                      }`}
                    >Flip V</button>
                  </div>
                </div>

                {/* Layer controls */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-stone-400 uppercase tracking-widest flex items-center gap-1">
                    <Layers className="w-3 h-3" /> Layer Order
                  </label>
                  <div className="grid grid-cols-4 gap-1.5">
                    {[
                      { label: 'Front', title: 'Bring to Front', fn: bringToFront },
                      { label: 'Up', title: 'Move Up', fn: moveForward },
                      { label: 'Down', title: 'Move Down', fn: moveBackward },
                      { label: 'Back', title: 'Send to Back', fn: sendToBack },
                    ].map(({ label, title, fn }) => (
                      <button
                        key={title}
                        onClick={fn}
                        title={title}
                        className="py-1.5 rounded-lg border border-stone-200 dark:border-stone-700 hover:bg-stone-50 dark:hover:bg-stone-800 text-[10px] font-bold text-stone-600 hover:text-stone-900 transition-all cursor-pointer"
                      >{label}</button>
                    ))}
                  </div>
                </div>

                {/* Action buttons */}
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={duplicateSelected}
                    className="py-2 rounded-xl bg-[#4a6c57]/8 hover:bg-[#4a6c57]/15 border border-[#4a6c57]/20 text-[10px] font-bold text-[#4a6c57] transition-all cursor-pointer"
                  >+ Duplicate</button>
                  <button
                    onClick={deleteSelected}
                    className="py-2 rounded-xl bg-rose-50 hover:bg-rose-100 border border-rose-200/60 text-[10px] font-bold text-rose-600 transition-all cursor-pointer"
                  >Delete</button>
                </div>
              </div>
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-stone-200 dark:border-stone-800 p-6 flex flex-col items-center text-center gap-2">
              <div className="w-10 h-10 bg-stone-100 dark:bg-stone-800 rounded-2xl flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-stone-300" />
              </div>
              <p className="text-[11px] text-stone-400 leading-relaxed">Click any element on the canvas to select and customize it</p>
            </div>
          )}

          {/* â”€â”€ LAYERS PANEL â”€â”€ */}
          {elements.length > 0 && (
            <div className="rounded-2xl border border-stone-100 dark:border-stone-800 overflow-hidden">
              <div className="flex items-center justify-between px-3 py-2.5 bg-stone-50 dark:bg-stone-800/50 border-b border-stone-100 dark:border-stone-800">
                <span className="text-[10px] font-bold uppercase tracking-widest text-stone-400 flex items-center gap-1.5">
                  <Layers className="w-3 h-3" /> Layers
                  <span className="bg-stone-200 dark:bg-stone-700 text-stone-500 dark:text-stone-300 rounded-full px-1.5 py-0.5 text-[8px]">{elements.length}</span>
                </span>
              </div>
              <div className="max-h-44 overflow-y-auto divide-y divide-stone-50 dark:divide-stone-800">
                {[...elements].sort((a, b) => b.z - a.z).map((el) => {
                  const asset = SEEDED_ASSETS.find(a => a.id === el.assetId);
                  const isSelected = selectedId === el.id;
                  const name = el.assetId === 'custom-upload' ? 'Custom Image' : (asset?.name || 'Element');
                  return (
                    <div
                      key={el.id}
                      onClick={(e) => { e.stopPropagation(); setSelectedId(el.id); }}
                      onMouseEnter={() => setHoveredId(el.id)}
                      onMouseLeave={() => setHoveredId(null)}
                      className={`flex items-center gap-2.5 px-3 py-2 cursor-pointer transition-all ${
                        isSelected
                          ? 'bg-[#4a6c57]/8 border-l-2 border-l-[#4a6c57]'
                          : 'hover:bg-stone-50 dark:hover:bg-stone-800/40 border-l-2 border-l-transparent'
                      }`}
                    >
                      <div className="w-7 h-7 shrink-0 rounded-lg bg-white dark:bg-stone-900 border border-stone-100 dark:border-stone-700 flex items-center justify-center overflow-hidden">
                        {el.assetId === 'custom-upload' ? (
                          <img src={el.customImageUrl} alt="" className="w-full h-full object-contain" />
                        ) : asset ? (
                          <svg viewBox={asset.viewBox} className="w-5 h-5" style={{ color: el.tint }}>
                            <g dangerouslySetInnerHTML={{ __html: asset.svgMarkup }} />
                          </svg>
                        ) : null}
                      </div>
                      <span className="text-[11px] font-semibold text-stone-600 dark:text-stone-300 truncate flex-1">{name}</span>
                      <span className="text-[9px] font-bold text-stone-300 dark:text-stone-600 shrink-0">Z{el.z}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* â”€â”€ MESSAGE CARD â”€â”€ */}
          <div className="rounded-2xl border border-stone-100 dark:border-stone-800 overflow-hidden">
            <div className="px-4 py-3 bg-stone-50 dark:bg-stone-800/50 border-b border-stone-100 dark:border-stone-800">
              <h3 className="text-[10px] font-bold uppercase tracking-widest text-stone-400 flex items-center gap-1.5">
                <Mail className="w-3 h-3" /> Message Card
              </h3>
            </div>
            <div className="p-4 space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[9px] font-bold text-stone-400 uppercase tracking-widest mb-1">To</label>
                  <input
                    type="text" value={recipientName} onChange={(e) => setRecipientName(e.target.value)}
                    placeholder="Recipient name"
                    className="w-full text-xs p-2 rounded-lg border border-stone-200 dark:border-stone-700 focus:outline-none focus:ring-2 focus:ring-[#4a6c57]/40 dark:bg-stone-800 dark:text-stone-200"
                  />
                </div>
                <div>
                  <label className="block text-[9px] font-bold text-stone-400 uppercase tracking-widest mb-1">From</label>
                  <input
                    type="text" value={senderName} onChange={(e) => setSenderName(e.target.value)}
                    placeholder="Your name"
                    className="w-full text-xs p-2 rounded-lg border border-stone-200 dark:border-stone-700 focus:outline-none focus:ring-2 focus:ring-[#4a6c57]/40 dark:bg-stone-800 dark:text-stone-200"
                  />
                </div>
              </div>
              <div>
                <label className="block text-[9px] font-bold text-stone-400 uppercase tracking-widest mb-1">Message</label>
                <textarea
                  value={message} onChange={(e) => setMessage(e.target.value)}
                  placeholder="Write something heartfelt..."
                  rows={3}
                  className="w-full text-xs p-2.5 rounded-lg border border-stone-200 dark:border-stone-700 focus:outline-none focus:ring-2 focus:ring-[#4a6c57]/40 resize-none dark:bg-stone-800 dark:text-stone-200"
                />
              </div>
              <div>
                <label className="block text-[9px] font-bold text-stone-400 uppercase tracking-widest mb-2">Card Style</label>
                <div className="grid grid-cols-5 gap-1.5">
                  {CARD_THEMES.map((theme) => (
                    <button
                      key={theme.id}
                      onClick={() => setCardStyle(theme.id)}
                      title={theme.name}
                      className={`aspect-square rounded-xl border-2 transition-all cursor-pointer ${theme.bg} ${
                        cardStyle === theme.id ? 'border-[#4a6c57] scale-110 shadow-md' : 'border-stone-200 hover:scale-105'
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* â”€â”€ SHARE BUTTON â”€â”€ */}
          <button
            onClick={handleSaveAndShare}
            disabled={isSaving}
            className="w-full bg-[#4a6c57] hover:bg-[#3d5e48] text-white font-bold py-4 px-4 rounded-2xl flex items-center justify-center gap-2.5 shadow-lg shadow-[#4a6c57]/20 active:scale-[0.99] transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer text-sm"
          >
            {isSaving ? (
              <>
                <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Wrapping bouquet...
              </>
            ) : (
              <>
                <Share2 className="w-4 h-4" />
                Wrap & Share Bouquet
              </>
            )}
          </button>
        </div>
      </div>

      {/* â•â•â• SHARE MODAL â•â•â• */}
      {isShareModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-stone-900 rounded-3xl max-w-md w-full shadow-2xl border border-stone-100 dark:border-stone-800 overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-stone-100 dark:border-stone-800 bg-gradient-to-r from-[#4a6c57]/5 to-transparent">
              <div>
                <h3 className="text-base font-serif font-bold text-[#3d5e48] dark:text-sage-200">Bouquet Wrapped!</h3>
                <p className="text-[10px] text-stone-400 mt-0.5">Share the link below</p>
              </div>
              <button onClick={() => setIsShareModalOpen(false)} className="w-8 h-8 rounded-full bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 flex items-center justify-center text-stone-400 hover:text-stone-600 transition-all cursor-pointer">
                <span className="text-sm font-bold">X</span>
              </button>
            </div>
            <div className="p-6 space-y-5">
              {qrCodeUrl && (
                <div className="flex flex-col items-center gap-3">
                  <div className="p-3 bg-stone-50 dark:bg-stone-800 rounded-2xl border border-stone-100 dark:border-stone-700">
                    <img src={qrCodeUrl} alt="QR Code" className="w-40 h-40 object-contain" />
                  </div>
                  <a
                    href={qrCodeUrl}
                    download={`bloomly-${shareSlug}.png`}
                    className="text-[11px] font-bold text-[#4a6c57] bg-[#4a6c57]/8 hover:bg-[#4a6c57]/15 border border-[#4a6c57]/20 px-4 py-1.5 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" /> Download QR
                  </a>
                </div>
              )}
              <div className="space-y-1.5">
                <label className="text-[9px] font-bold text-stone-400 uppercase tracking-widest">Share Link</label>
                <div className="flex gap-2">
                  <input
                    type="text" readOnly
                    value={`${window.location.origin}/b/${shareSlug}`}
                    className="flex-1 text-xs p-2.5 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-600 dark:text-stone-300 focus:outline-none select-all"
                  />
                  <button
                    onClick={copyLink}
                    className="bg-[#4a6c57] hover:bg-[#3d5e48] text-white font-bold px-4 rounded-xl flex items-center gap-1.5 text-xs transition-all active:scale-95 cursor-pointer shrink-0"
                  >
                    {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    {copied ? 'Copied!' : 'Copy'}
                  </button>
                </div>
              </div>
              <form onSubmit={handleSendEmail} className="space-y-2 pt-1 border-t border-stone-100 dark:border-stone-800">
                <label className="text-[9px] font-bold text-stone-400 uppercase tracking-widest">Email Directly</label>
                <div className="flex gap-2">
                  <input
                    type="email" required
                    placeholder="recipient@email.com"
                    value={recipientEmail}
                    onChange={(e) => setRecipientEmail(e.target.value)}
                    className="flex-1 text-xs p-2.5 rounded-xl border border-stone-200 dark:border-stone-700 dark:bg-stone-800 focus:outline-none focus:ring-2 focus:ring-[#4a6c57]/40"
                  />
                  <button
                    type="submit"
                    disabled={isSendingEmail}
                    className="bg-stone-800 hover:bg-stone-700 text-white font-bold px-4 rounded-xl text-xs transition-all active:scale-95 cursor-pointer disabled:opacity-50 shrink-0"
                  >
                    {isSendingEmail ? '...' : 'Send'}
                  </button>
                </div>
                {emailSendSuccess === true && (
                  <p className="text-[10px] text-emerald-600 font-semibold flex items-center gap-1">
                    <Check className="w-3 h-3" /> Email sent! Subject: &quot;You received your bouquet&quot;
                  </p>
                )}
                {emailSendSuccess === false && (
                  <p className="text-[10px] text-rose-500 font-semibold">Failed. Try using the copy link instead.</p>
                )}
              </form>
              <div className="grid grid-cols-2 gap-2.5">
                <a
                  href={`mailto:?subject=${encodeURIComponent("You received your bouquet")}&body=${encodeURIComponent("You received your bouquet from " + (senderName || 'someone special') + "! Open it here: " + window.location.origin + "/b/" + shareSlug)}`}
                  className="py-2.5 border border-stone-200 dark:border-stone-700 hover:bg-stone-50 dark:hover:bg-stone-800 rounded-xl text-center text-[11px] font-semibold text-stone-600 dark:text-stone-300 flex items-center justify-center gap-1.5 transition-all"
                >
                  <Mail className="w-3.5 h-3.5" /> Email Client
                </a>
                <a
                  href={`${window.location.origin}/b/${shareSlug}`}
                  target="_blank" rel="noreferrer"
                  className="py-2.5 bg-[#4a6c57] hover:bg-[#3d5e48] text-white rounded-xl text-center text-[11px] font-semibold flex items-center justify-center gap-1.5 transition-all"
                >
                  View Bouquet <ChevronRight className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
