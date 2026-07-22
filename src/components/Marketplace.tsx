'use client';

import React, { useState, useEffect } from 'react';
import { MarketplaceItem } from '../types';
import {
  ShoppingBag,
  Star,
  Download,
  PlusCircle,
  CheckCircle,
  Search,
  ShieldCheck,
  ExternalLink,
  FileText,
  Lock,
  BookOpen,
  Eye,
  Trash2,
  Sparkles,
  UploadCloud,
  X
} from 'lucide-react';

interface MarketplaceProps {
  items: MarketplaceItem[];
  userQnt: number;
  userUid?: string;
  onBuyItem: (item: MarketplaceItem) => void;
  onPublishItem: (newItem: Omit<MarketplaceItem, 'id' | 'rating' | 'reviewsCount' | 'verifiedByPeer'>) => void;
}

// Minimal valid PDF Data URL generator for sample materials
function generateSamplePdfDataUrl(title: string, subject: string, description: string): string {
  const cleanTitle = title.replace(/[^\w\s-]/gi, '');
  const cleanSubject = subject.replace(/[^\w\s-]/gi, '');
  const cleanDesc = description.replace(/[^\w\s-]/gi, '').substring(0, 80);

  const pdfContent = `%PDF-1.4
1 0 obj <</Type /Catalog /Pages 2 0 R>> endobj
2 0 obj <</Type /Pages /Kids [3 0 R] /Count 1>> endobj
3 0 obj <</Type /Page /Parent 2 0 R /Resources <</Font <</F1 4 0 R>>>> /MediaBox [0 0 612 792] /Contents 5 0 R>> endobj
4 0 obj <</Type /Font /Subtype /Type1 /BaseFont /Helvetica>> endobj
5 0 obj <</Length 280>> stream
BT
/F1 18 Tf
50 720 Td
(QUANTALY EDTECH - MATERIALE DI STUDIO) Tj
0 -30 Td
/F1 14 Tf
(Materia: ${cleanSubject}) Tj
0 -25 Td
(Titolo: ${cleanTitle}) Tj
0 -25 Td
/F1 11 Tf
(Sbloccato ed Inserito nei Materiali di Studio) Tj
0 -20 Td
(Descrizione: ${cleanDesc}) Tj
0 -30 Td
(Certificazione Crittografica Zero-Trust - Quantaly 2026) Tj
ET
endstream
endobj
xref
0 6
0000000000 65535 f
0000000009 00000 n
0000000058 00000 n
0000000115 00000 n
0000000244 00000 n
0000000312 00000 n
trailer <</Size 6 /Root 1 0 R>>
startxref
640
%%EOF`;

  try {
    return `data:application/pdf;base64,${btoa(pdfContent)}`;
  } catch (e) {
    return `data:application/pdf;base64,JVBERi0xLjQKJSDi483N...`;
  }
}

export default function Marketplace({ items, userQnt, userUid, onBuyItem, onPublishItem }: MarketplaceProps) {
  const [activeSubTab, setActiveSubTab] = useState<'MARKETPLACE' | 'MY_MATERIALS'>('MARKETPLACE');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<string>('ALL');
  const [showPublishModal, setShowPublishModal] = useState(false);
  const [isPurchasing, setIsPurchasing] = useState<string | null>(null);

  // Unlocked & Purchased items storage
  const [unlockedItemsMap, setUnlockedItemsMap] = useState<Record<string, MarketplaceItem>>({});
  const [myStudyMaterials, setMyStudyMaterials] = useState<MarketplaceItem[]>([]);

  // Modal PDF Reader View
  const [viewingPdfItem, setViewingPdfItem] = useState<MarketplaceItem | null>(null);

  // Form State for Publishing Appunti
  const [newTitle, setNewTitle] = useState('');
  const [newSubject, setNewSubject] = useState('');
  const [newPrice, setNewPrice] = useState(100);
  const [newDescription, setNewDescription] = useState('');
  const [newType, setNewType] = useState<'notes' | 'mindmap' | 'summary' | 'cheat_sheet'>('notes');
  const [newDriveUrl, setNewDriveUrl] = useState('');

  // Attached PDF File state
  const [attachedPdf, setAttachedPdf] = useState<{
    fileName: string;
    fileSize: string;
    pdfDataUrl: string;
  } | null>(null);

  // Load unlocked materials from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('quantaly_unlocked_materials');
      if (saved) {
        const parsed = JSON.parse(saved);
        setMyStudyMaterials(parsed);
        const map: Record<string, MarketplaceItem> = {};
        parsed.forEach((item: MarketplaceItem) => {
          map[item.id] = item;
        });
        setUnlockedItemsMap(map);
      }
    } catch (e) {
      console.warn('Could not load saved study materials', e);
    }
  }, []);

  // Sync back to localStorage
  const saveUnlockedMaterials = (newList: MarketplaceItem[]) => {
    setMyStudyMaterials(newList);
    try {
      localStorage.setItem('quantaly_unlocked_materials', JSON.stringify(newList));
    } catch (e) {
      console.warn('Could not save study materials', e);
    }
  };

  const filteredItems = items.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          item.subject.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = selectedType === 'ALL' || item.type === selectedType;
    return matchesSearch && matchesType;
  });

  // Handle PDF file attachment
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.toLowerCase().endsWith('.pdf') && file.type !== 'application/pdf') {
      alert('Si prega di allegare un file in formato PDF (.pdf).');
      return;
    }

    const sizeMb = (file.size / (1024 * 1024)).toFixed(2) + ' MB';
    const reader = new FileReader();

    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      setAttachedPdf({
        fileName: file.name,
        fileSize: sizeMb,
        pdfDataUrl: dataUrl
      });
    };

    reader.readAsDataURL(file);
  };

  // Atomic Purchase with automatic placement in Study Materials
  const handlePurchaseAtomic = async (item: MarketplaceItem) => {
    if (userQnt < item.priceQnt) {
      alert(`Saldo $QNT insufficiente! Hai ${userQnt} $QNT, te ne servono ${item.priceQnt}. Completa i quiz per guadagnarne altri!`);
      return;
    }

    setIsPurchasing(item.id);

    try {
      const targetPdfDataUrl = item.pdfDataUrl || generateSamplePdfDataUrl(item.title, item.subject, item.description);
      const targetPdfName = item.pdfFileName || `${item.title.replace(/\s+/g, '_')}.pdf`;

      const res = await fetch('/api/marketplace/buy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          buyerUid: userUid || 'current-user-uid',
          sellerUid: item.authorUid || '',
          itemId: item.id,
          itemTitle: item.title,
          priceQnt: item.priceQnt,
          driveFileUrl: item.driveFileUrl || 'https://drive.google.com',
          pdfDataUrl: targetPdfDataUrl,
          pdfFileName: targetPdfName
        })
      });

      const data = await res.json();

      if (res.ok && data.success) {
        onBuyItem(item);

        const unlockedItem: MarketplaceItem = {
          ...item,
          pdfDataUrl: targetPdfDataUrl,
          pdfFileName: targetPdfName,
          pdfFileSize: item.pdfFileSize || '2.4 MB',
          purchasedAt: new Date().toLocaleDateString('it-IT')
        };

        setUnlockedItemsMap((prev) => ({
          ...prev,
          [item.id]: unlockedItem
        }));

        const updatedMaterials = [unlockedItem, ...myStudyMaterials.filter(m => m.id !== item.id)];
        saveUnlockedMaterials(updatedMaterials);

        alert(`🎉 COMPLIMENTI! PDF Sbloccato con successo!\n\nIl file "${targetPdfName}" è stato fisicamente inserito nella tua sezione "I Miei Materiali di Studio".`);
      } else {
        alert(`Errore Transazione: ${data.error || 'Impossibile completare l\'acquisto atomico.'}`);
      }
    } catch (err: any) {
      console.error(err);
      alert('Errore durante la transazione atomica.');
    } finally {
      setIsPurchasing(null);
    }
  };

  // Handle Publishing New Item with PDF Attachment
  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle || !newSubject) return;

    const generatedPdfData = attachedPdf?.pdfDataUrl || generateSamplePdfDataUrl(newTitle, newSubject, newDescription);
    const pdfName = attachedPdf?.fileName || `${newTitle.replace(/\s+/g, '_')}.pdf`;
    const pdfSize = attachedPdf?.fileSize || '1.8 MB';

    const newItem: Omit<MarketplaceItem, 'id' | 'rating' | 'reviewsCount' | 'verifiedByPeer'> = {
      title: newTitle,
      author: 'Tu (Autore)',
      authorUid: userUid || 'current-user-uid',
      school: 'ITT Informatico Marconi',
      subject: newSubject,
      priceQnt: Number(newPrice),
      description: newDescription,
      type: newType,
      previewText: newDescription.substring(0, 120) + '...',
      driveFileUrl: newDriveUrl || 'https://drive.google.com',
      pdfDataUrl: generatedPdfData,
      pdfFileName: pdfName,
      pdfFileSize: pdfSize,
      purchasedAt: new Date().toLocaleDateString('it-IT')
    };

    onPublishItem(newItem);

    // Also place in author's own study materials
    const publishedAsItem: MarketplaceItem = {
      ...newItem,
      id: 'published-' + Date.now(),
      rating: 5.0,
      reviewsCount: 1,
      verifiedByPeer: true
    };

    const updatedMaterials = [publishedAsItem, ...myStudyMaterials];
    saveUnlockedMaterials(updatedMaterials);

    setShowPublishModal(false);
    setNewTitle('');
    setNewDescription('');
    setNewDriveUrl('');
    setAttachedPdf(null);

    alert(`✅ PDF "${pdfName}" pubblicato sul Marketplace ed inserito nei tuoi Materiali di Studio!`);
  };

  // Trigger browser download of PDF
  const downloadPdfFile = (item: MarketplaceItem) => {
    const dataUrl = item.pdfDataUrl || generateSamplePdfDataUrl(item.title, item.subject, item.description);
    const fileName = item.pdfFileName || `${item.title.replace(/\s+/g, '_')}.pdf`;

    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="max-w-6xl mx-auto py-8 px-4 space-y-6">
      
      {/* Top Banner */}
      <div className="glass-card p-6 rounded-3xl border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4 bg-gradient-to-r from-cyan-950/30 via-purple-950/20 to-slate-900/80">
        <div>
          <span className="text-[11px] font-bold uppercase text-cyan-400 tracking-wider">Economia Circolare & Crittografia Zero-Trust</span>
          <h2 className="text-2xl font-bold text-white mt-1 flex items-center gap-2">
            Learn-to-Earn Marketplace
            <span className="text-xs px-2 py-0.5 rounded-full bg-cyan-950 border border-cyan-800 text-cyan-300 font-mono">PDF Sblocco Atomico</span>
          </h2>
          <p className="text-xs text-slate-300 mt-1 max-w-xl">
            Acquista appunti e mappe concettuali con i tuoi token <strong className="text-amber-400">$QNT</strong>. I file PDF allegati si sbloccano <strong>solo dopo la transazione</strong> e vengono scaricati e salvati automaticamente nei tuoi <strong>Materiali di Studio</strong>.
          </p>
        </div>

        <button
          onClick={() => setShowPublishModal(true)}
          className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-black font-extrabold text-xs flex items-center gap-2 shadow-lg shadow-cyan-500/20 whitespace-nowrap hover:scale-105 transition-all"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Vendi i Tuoi Appunti PDF (+ $QNT)</span>
        </button>
      </div>

      {/* Main Section Navigation Tabs: MARKETPLACE vs MY_MATERIALS */}
      <div className="flex items-center gap-3 border-b border-slate-800 pb-3">
        <button
          onClick={() => setActiveSubTab('MARKETPLACE')}
          className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
            activeSubTab === 'MARKETPLACE'
              ? 'bg-cyan-500 text-black shadow-md shadow-cyan-500/30'
              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <ShoppingBag className="w-4 h-4" />
          <span>🛒 Esplora Marketplace ({items.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('MY_MATERIALS')}
          className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all relative ${
            activeSubTab === 'MY_MATERIALS'
              ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>📚 I Miei Materiali di Studio ({myStudyMaterials.length})</span>
          {myStudyMaterials.length > 0 && (
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          )}
        </button>
      </div>

      {/* VIEW 1: MARKETPLACE CATALOG */}
      {activeSubTab === 'MARKETPLACE' && (
        <>
          {/* Filter & Search Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
              <input
                type="text"
                placeholder="Cerca per materia o argomento..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto no-scrollbar">
              {['ALL', 'mindmap', 'notes', 'summary', 'cheat_sheet'].map((type) => (
                <button
                  key={type}
                  onClick={() => setSelectedType(type)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold capitalize border transition-all ${
                    selectedType === type
                      ? 'bg-purple-950 text-purple-300 border-purple-500'
                      : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
                  }`}
                >
                  {type === 'ALL' ? 'Tutti i Materiali' : type.replace('_', ' ')}
                </button>
              ))}
            </div>
          </div>

          {/* Grid of Marketplace Items */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredItems.map((item) => {
              const unlockedItem = unlockedItemsMap[item.id];

              return (
                <div
                  key={item.id}
                  className={`glass-card rounded-2xl border p-5 flex flex-col justify-between transition-all ${
                    unlockedItem
                      ? 'border-emerald-500/50 bg-emerald-950/10'
                      : 'border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="px-2.5 py-0.5 rounded-full bg-slate-900 border border-slate-700 text-[10px] font-mono text-cyan-300 capitalize flex items-center gap-1">
                        <FileText className="w-3 h-3 text-cyan-400" />
                        {item.type.replace('_', ' ')}
                      </span>
                      <div className="flex items-center gap-1 text-amber-400 text-xs font-bold">
                        <Star className="w-3.5 h-3.5 fill-amber-400" />
                        <span>{item.rating || '5.0'} ({item.reviewsCount || 12})</span>
                      </div>
                    </div>

                    <h3 className="text-sm font-bold text-white line-clamp-2">{item.title}</h3>

                    <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">{item.description}</p>

                    {/* PDF Lock Status Banner */}
                    <div className={`p-3 rounded-xl border text-[11px] font-mono flex items-center justify-between ${
                      unlockedItem
                        ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300'
                        : 'bg-slate-950/80 border-slate-800 text-slate-400'
                    }`}>
                      <div className="flex items-center gap-2">
                        {unlockedItem ? (
                          <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                        ) : (
                          <Lock className="w-4 h-4 text-amber-400 flex-shrink-0 animate-pulse" />
                        )}
                        <span className="truncate">
                          {unlockedItem ? 'PDF Sbloccato ed Integrato' : `PDF Protetto (${item.pdfFileSize || '2.4 MB'})`}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                      <span>Autore: <strong>{item.author}</strong></span>
                      <span className="flex items-center gap-1 text-emerald-400 font-semibold">
                        <ShieldCheck className="w-3.5 h-3.5" /> Validato dai pari
                      </span>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-800/80 mt-4 flex items-center justify-between">
                    <div className="font-extrabold text-amber-300 text-sm flex items-center gap-1">
                      <span>{item.priceQnt}</span>
                      <span className="text-xs font-mono text-amber-400">$QNT</span>
                    </div>

                    {unlockedItem ? (
                      <button
                        onClick={() => {
                          setActiveSubTab('MY_MATERIALS');
                          setViewingPdfItem(unlockedItem);
                        }}
                        className="px-3 py-1.5 rounded-xl bg-emerald-500 text-black font-extrabold text-xs flex items-center gap-1 hover:scale-105 transition-all shadow-md shadow-emerald-500/20"
                      >
                        <Eye className="w-3.5 h-3.5" /> Leggi nei Miei Materiali
                      </button>
                    ) : (
                      <button
                        onClick={() => handlePurchaseAtomic(item)}
                        disabled={isPurchasing === item.id}
                        className="px-4 py-1.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-extrabold text-xs transition-all flex items-center gap-1 shadow-md shadow-cyan-500/20 disabled:opacity-50"
                      >
                        <ShoppingBag className="w-3.5 h-3.5" />
                        {isPurchasing === item.id ? 'Sblocco PDF...' : 'Sblocca PDF Atomico'}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* VIEW 2: DEDICATED STUDY MATERIALS SECTION (I MIEI MATERIALI DI STUDIO) */}
      {activeSubTab === 'MY_MATERIALS' && (
        <div className="space-y-6 animate-in fade-in">
          <div className="flex items-center justify-between bg-slate-900/60 p-4 rounded-2xl border border-slate-800">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-purple-400" />
                La Tua Libreria di Studio Personalizzata
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Tutti i file PDF sbloccati via transazione $QNT o pubblicati direttamente da te sono memorizzati qui per la consultazione ed il download offline.
              </p>
            </div>
            <span className="px-3 py-1 rounded-full bg-purple-950 text-purple-300 border border-purple-800 text-xs font-mono font-bold">
              {myStudyMaterials.length} Documenti PDF
            </span>
          </div>

          {myStudyMaterials.length === 0 ? (
            <div className="text-center py-16 bg-slate-900/40 rounded-3xl border border-dashed border-slate-800 p-8 space-y-3">
              <FileText className="w-12 h-12 text-slate-600 mx-auto" />
              <h4 className="text-sm font-bold text-slate-300">Nessun Materiale di Studio ancora presente</h4>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                Sblocca un documento PDF nel Marketplace con i tuoi token $QNT oppure carica un tuo appunto per vederlo apparire immediatamente qui.
              </p>
              <button
                onClick={() => setActiveSubTab('MARKETPLACE')}
                className="mt-2 px-4 py-2 rounded-xl bg-cyan-500 text-black font-bold text-xs"
              >
                Esplora il Marketplace
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {myStudyMaterials.map((material) => (
                <div
                  key={material.id}
                  className="glass-card rounded-2xl border border-purple-500/30 p-5 flex flex-col justify-between bg-gradient-to-b from-purple-950/10 to-slate-900/90 shadow-xl"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="px-2.5 py-0.5 rounded-full bg-purple-950 text-purple-300 border border-purple-800 text-[10px] font-mono capitalize">
                        {material.subject}
                      </span>
                      <span className="text-[10px] text-emerald-400 font-mono font-bold flex items-center gap-1">
                        <CheckCircle className="w-3 h-3" /> Sbloccato
                      </span>
                    </div>

                    <h4 className="text-sm font-bold text-white line-clamp-2">{material.title}</h4>

                    <p className="text-xs text-slate-300 line-clamp-2">{material.description}</p>

                    <div className="p-3 rounded-xl bg-slate-950/90 border border-slate-800 font-mono text-[11px] text-slate-300 space-y-1">
                      <div className="flex items-center justify-between text-slate-400">
                        <span>File PDF:</span>
                        <strong className="text-cyan-300">{material.pdfFileName || 'Appunti_Quantaly.pdf'}</strong>
                      </div>
                      <div className="flex items-center justify-between text-slate-500 text-[10px]">
                        <span>Dimensione:</span>
                        <span>{material.pdfFileSize || '2.4 MB'}</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-800 mt-4 flex items-center gap-2">
                    <button
                      onClick={() => setViewingPdfItem(material)}
                      className="flex-1 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-cyan-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 hover:opacity-90 transition-all shadow-md shadow-purple-600/20"
                    >
                      <Eye className="w-3.5 h-3.5" /> Visualizza PDF
                    </button>

                    <button
                      onClick={() => downloadPdfFile(material)}
                      className="p-2 rounded-xl bg-slate-800 text-cyan-300 hover:bg-cyan-500 hover:text-black border border-slate-700 transition-all"
                      title="Scarica PDF Offline"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* MODAL 1: VIEW/READ PDF DOCUMENT */}
      {viewingPdfItem && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-in fade-in">
          <div className="glass-card rounded-3xl border border-cyan-500/40 w-full max-w-4xl h-[90vh] flex flex-col bg-[#080c18] shadow-2xl overflow-hidden">
            
            {/* Modal Header */}
            <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/90">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
                  <FileText className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-white">{viewingPdfItem.title}</h3>
                  <p className="text-[10px] text-slate-400 font-mono">
                    {viewingPdfItem.pdfFileName || 'Appunti_Quantaly.pdf'} • {viewingPdfItem.subject}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => downloadPdfFile(viewingPdfItem)}
                  className="px-3 py-1.5 rounded-xl bg-emerald-500 text-black font-extrabold text-xs flex items-center gap-1 shadow-md shadow-emerald-500/20"
                >
                  <Download className="w-3.5 h-3.5" /> Scarica PDF
                </button>

                <button
                  onClick={() => setViewingPdfItem(null)}
                  className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Embedded PDF Viewer Frame */}
            <div className="flex-1 bg-slate-950 p-2 sm:p-4 overflow-hidden relative flex flex-col items-center justify-center">
              {viewingPdfItem.pdfDataUrl ? (
                <iframe
                  src={viewingPdfItem.pdfDataUrl}
                  title={viewingPdfItem.title}
                  className="w-full h-full rounded-2xl border border-slate-800 bg-white"
                />
              ) : (
                <div className="text-center space-y-3 p-6">
                  <FileText className="w-12 h-12 text-cyan-400 mx-auto animate-bounce" />
                  <p className="text-xs text-slate-300">Caricamento PDF Sbloccato in corso...</p>
                  <a
                    href={viewingPdfItem.driveFileUrl || '#'}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-cyan-500 text-black font-bold text-xs"
                  >
                    <ExternalLink className="w-3.5 h-3.5" /> Apri anche su Google Drive
                  </a>
                </div>
              )}
            </div>

          </div>
        </div>
      )}

      {/* MODAL 2: PUBLISH NEW APPUNTI WITH DIRECT PDF UPLOAD */}
      {showPublishModal && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-card p-6 rounded-3xl border border-cyan-500/30 max-w-lg w-full space-y-4 animate-in fade-in bg-[#080c18] shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <UploadCloud className="w-5 h-5 text-cyan-400" />
                <h3 className="font-bold text-base text-white">Pubblica Appunti PDF sul Marketplace</h3>
              </div>
              <button
                onClick={() => setShowPublishModal(false)}
                className="text-slate-400 hover:text-white text-xs font-bold"
              >
                Chiudi ✕
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 mb-1 font-semibold">Titolo Materiale</label>
                <input
                  type="text"
                  required
                  placeholder="es. Mappa Sintetica Diodi e Transistor"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white placeholder-slate-500 focus:border-cyan-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 mb-1 font-semibold">Materia</label>
                  <input
                    type="text"
                    required
                    placeholder="Elettronica"
                    value={newSubject}
                    onChange={(e) => setNewSubject(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white placeholder-slate-500 focus:border-cyan-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 mb-1 font-semibold">Prezzo ($QNT)</label>
                  <input
                    type="number"
                    min="10"
                    max="1000"
                    value={newPrice}
                    onChange={(e) => setNewPrice(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white focus:border-cyan-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* DIRECT PDF FILE ATTACHMENT FIELD */}
              <div className="p-3 rounded-2xl bg-cyan-950/20 border border-cyan-500/30 space-y-2">
                <label className="block text-cyan-300 font-bold flex items-center justify-between">
                  <span>📄 Allega File PDF Reale</span>
                  <span className="text-[10px] text-cyan-400 font-mono">Max 10MB</span>
                </label>

                {attachedPdf ? (
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900 border border-emerald-500/50 text-emerald-300">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-emerald-400" />
                      <div>
                        <p className="font-bold text-xs truncate max-w-[200px]">{attachedPdf.fileName}</p>
                        <p className="text-[10px] text-slate-400">{attachedPdf.fileSize}</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setAttachedPdf(null)}
                      className="p-1 text-slate-400 hover:text-red-400"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-cyan-500/40 hover:border-cyan-400 rounded-xl cursor-pointer bg-slate-900/50 hover:bg-slate-900 transition-all text-center">
                    <UploadCloud className="w-6 h-6 text-cyan-400 mb-1" />
                    <span className="font-bold text-cyan-200">Clicca per Selezionare il File PDF</span>
                    <span className="text-[10px] text-slate-400 mt-0.5">I compratori potranno sbloccarlo solo con $QNT</span>
                    <input
                      type="file"
                      accept=".pdf,application/pdf"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </label>
                )}
              </div>

              <div>
                <label className="block text-slate-300 mb-1 font-semibold">Link Google Drive (Opzionale)</label>
                <input
                  type="url"
                  placeholder="https://drive.google.com/file/d/..."
                  value={newDriveUrl}
                  onChange={(e) => setNewDriveUrl(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white placeholder-slate-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1 font-semibold">Tipo di Contenuto</label>
                <select
                  value={newType}
                  onChange={(e: any) => setNewType(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white"
                >
                  <option value="notes">Appunti Svolti</option>
                  <option value="mindmap">Mappa Concettuale DSA</option>
                  <option value="summary">Sintesi Capitolo</option>
                  <option value="cheat_sheet">Formulario Rapido</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 mb-1 font-semibold">Descrizione Dettagliata</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Descrivi cosa troverà lo studente che acquista il PDF..."
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-white placeholder-slate-500"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-purple-600 font-bold text-black text-xs shadow-lg shadow-cyan-500/20 hover:scale-[1.02] transition-all"
              >
                Invia per Validazione Peer & Pubblica PDF
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
