import { useState, useCallback } from 'react';
import { jsPDF } from 'jspdf';
import { 
  FileText, 
  Download, 
  Trash2, 
  Settings, 
  Type, 
  Maximize,
  ArrowRight,
  Info,
  UploadCloud,
  Languages
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useDropzone } from 'react-dropzone';

const translations = {
  en: {
    generate: "Generate PDF",
    export: "Export PDF",
    settings: "PDF Export Settings",
    fontSize: "Typography Size",
    margins: "Margins (mm)",
    stats: "Real-time Statistics",
    words: "Word Count",
    chars: "Characters",
    lines: "Format Lines",
    download: "Download PDF Now",
    filename: "Filename...",
    placeholder: "Start typing or paste your content here... (or drop a .txt file)",
    drop: "Drop to Import Text",
    support: "Support for .txt and .md files",
    compact: "Compact",
    standard: "Standard",
    wide: "Wide",
    proTip: "Pro Export Tip",
    proTipDesc: "Longer documents are automatically wrapped to fit multiple pages. Use margins to control white space layout.",
    proTipLabel: "Professional Layout",
    autoWrapping: "Auto-wrapping enabled",
    clearConfirm: "Are you sure you want to clear all text?",
    convert: "Convert to PDF"
  },
  hi: {
    generate: "पीडीएफ बनाएं",
    export: "पीडीएफ निर्यात",
    settings: "निर्यात सेटिंग्स",
    fontSize: "टाइपोग्राफी आकार",
    margins: "मार्जिन (मिमी)",
    stats: "वास्तविक समय सांख्यिकी",
    words: "शब्दों की संख्या",
    chars: "अक्षर",
    lines: "पंक्तियाँ",
    download: "अभी डाउनलोड करें",
    filename: "फ़ाइल का नाम...",
    placeholder: "लिखना शुरू करें या सामग्री पेस्ट करें... (या .txt फ़ाइल यहाँ छोड़ें)",
    drop: "इम्पोर्ट करने के लिए यहाँ छोड़ें",
    support: ".txt और .md फ़ाइलों के लिए समर्थन",
    compact: "सघन",
    standard: "मानक",
    wide: "विस्तृत",
    proTip: "प्रो निर्यात टिप",
    proTipDesc: "लंबे दस्तावेजों को स्वचालित रूप से अगले पृष्ठों पर विभाजित किया जाता है। व्हाइट स्पेस के लिए मार्जिन बदलें।",
    proTipLabel: "पेशेवर लेआउट",
    autoWrapping: "ऑटो-रैपिंग सक्रिय",
    clearConfirm: "क्या आप वाकई सारा टेक्स्ट हटाना चाहते हैं?",
    convert: "पीडीएफ में बदलें"
  }
};

export default function App() {
  const [text, setText] = useState('');
  const [fileName, setFileName] = useState('document');
  const [fontSize, setFontSize] = useState(12);
  const [margin, setMargin] = useState(20);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [lang, setLang] = useState<'en' | 'hi'>('en');

  const t = translations[lang];

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        setText(content);
        setFileName(file.name.replace(/\.[^/.]+$/, ""));
      };
      reader.readAsText(file);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/plain': ['.txt'],
      'text/markdown': ['.md']
    },
    noClick: true,
    multiple: false
  } as any);

  const stats = {
    characters: text.length,
    words: text.trim() === '' ? 0 : text.trim().split(/\s+/).length,
    lines: text.trim() === '' ? 0 : text.split('\n').length,
  };

  const handleDownload = async () => {
    if (!text.trim()) return;
    
    setIsProcessing(true);
    try {
      const doc = new jsPDF();
      
      doc.setFontSize(fontSize);
      
      const pageWidth = 210; 
      const pageHeight = 297; 
      const maxWidth = pageWidth - (margin * 2);
      
      const splitText = doc.splitTextToSize(text, maxWidth);
      
      let cursorY = margin;
      const lineHeight = fontSize * 0.45; 
      
      splitText.forEach((line: string) => {
        if (cursorY + lineHeight > pageHeight - margin) {
          doc.addPage();
          cursorY = margin;
        }
        doc.text(line, margin, cursorY);
        cursorY += lineHeight;
      });
      
      doc.save(`${fileName || 'document'}.pdf`);
    } catch (error) {
      console.error('PDF generation error:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleClear = () => {
    if (window.confirm(t.clearConfirm)) {
      setText('');
    }
  };

  return (
    <div {...getRootProps()} className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-indigo-100 selection:text-indigo-900 relative outline-none flex flex-col">
      <input {...getInputProps()} />
      
      <AnimatePresence>
        {isDragActive && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-indigo-600/90 backdrop-blur-sm z-[100] flex flex-col items-center justify-center text-white pointer-events-none"
          >
            <motion.div
              animate={{ y: [0, -20, 0] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
            >
              <UploadCloud size={80} />
            </motion.div>
            <h2 className="text-3xl font-bold mt-6">{t.drop}</h2>
            <p className="text-indigo-100 mt-2">{t.support}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <header className="h-14 bg-white border-b border-slate-200 z-50 flex items-center justify-between px-6 shrink-0 shadow-sm relative">
        <div className="flex items-center gap-4">
          <div className="w-8 h-8 bg-indigo-600 rounded flex items-center justify-center text-white font-bold">
            <FileText size={16} />
          </div>
          <h1 className="font-semibold text-slate-700 tracking-tight flex items-center">
            DocuPrint <span className="mx-2 text-slate-300 font-normal">|</span> <span className="text-slate-500 font-normal text-sm">{fileName || t.filename}</span>
          </h1>
        </div>
        
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setLang(lang === 'en' ? 'hi' : 'en')}
            className="flex items-center gap-2 px-2 py-1.5 rounded transition-colors hover:bg-slate-50 text-slate-500 hover:text-indigo-600"
            title="Switch Language"
          >
            <Languages size={18} />
            <span className="text-xs font-bold uppercase tracking-tighter">{lang === 'en' ? 'HI' : 'EN'}</span>
          </button>

          <button 
            onClick={() => setShowSettings(!showSettings)}
            className={`p-1.5 rounded transition-colors ${showSettings ? 'bg-indigo-50 text-indigo-600' : 'hover:bg-slate-50 text-slate-500'}`}
          >
            <Settings size={18} />
          </button>
          
          <button
            onClick={handleDownload}
            disabled={!text.trim() || isProcessing}
            className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-1.5 rounded text-sm font-semibold shadow-sm hover:bg-indigo-700 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isProcessing ? (
               <motion.div
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
              >
                <Download size={16} />
              </motion.div>
            ) : (
              <Download size={16} />
            )}
            <span>{t.generate}</span>
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        
        {/* Editor Area */}
        <section className="flex-1 flex flex-col bg-slate-200 p-4 lg:p-6 items-center overflow-hidden">
          <div className="w-full flex-1 max-w-[800px] bg-white shadow-2xl flex flex-col relative overflow-hidden ring-1 ring-slate-300">
            <div className="flex items-center justify-between px-8 py-3 bg-slate-50 border-b border-slate-200">
              <input
                type="text"
                value={fileName}
                onChange={(e) => setFileName(e.target.value)}
                placeholder={t.filename}
                className="bg-transparent border-none focus:ring-0 text-xs font-bold uppercase tracking-wider text-slate-500 placeholder:text-slate-300 w-full focus:outline-none"
              />
              <button 
                onClick={handleClear}
                className="p-1.5 text-slate-400 hover:text-red-500 transition-colors"
                title="Clear all"
              >
                <Trash2 size={14} />
              </button>
            </div>

            <div className="relative group flex-1">
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder={t.placeholder}
                className="w-full h-full p-10 lg:p-14 text-sm font-serif leading-relaxed resize-none bg-white outline-none transition-all placeholder:text-slate-200"
              />
              <div className="absolute bottom-4 right-6 flex items-center gap-2 text-[10px] font-mono text-slate-300 opacity-0 group-focus-within:opacity-100 transition-opacity">
                <span>{t.autoWrapping}</span>
                <Info size={10} />
              </div>
            </div>
          </div>
        </section>

        {/* Sidebar Controls */}
        <aside className="w-full lg:w-72 bg-white border-l border-slate-200 flex flex-col shrink-0">
          <div className="p-4 border-b border-slate-100 bg-slate-50/50">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">{t.settings}</span>
          </div>

          <div className="p-5 space-y-6 flex-1 overflow-y-auto">
            <div className="space-y-4">
              <div className="space-y-3">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-tight flex items-center gap-2">
                  <Type size={12} />
                  {t.fontSize}
                </label>
                <div className="flex items-center gap-3">
                  <input 
                    type="range" 
                    min="8" 
                    max="48" 
                    value={fontSize} 
                    onChange={(e) => setFontSize(parseInt(e.target.value))}
                    className="flex-1 h-1 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                  />
                  <span className="text-[10px] font-mono font-bold text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded">{fontSize}px</span>
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-tight flex items-center gap-2">
                  <Maximize size={12} />
                  {t.margins}
                </label>
                <div className="flex items-center gap-3">
                  <input 
                    type="range" 
                    min="5" 
                    max="50" 
                    value={margin} 
                    onChange={(e) => setMargin(parseInt(e.target.value))}
                    className="flex-1 h-1 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                  />
                  <span className="text-[10px] font-mono font-bold text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded">{margin}mm</span>
                </div>
                <div className="flex justify-between text-[9px] font-mono text-slate-400">
                  <span>{t.compact}</span>
                  <span>{t.standard}</span>
                  <span>{t.wide}</span>
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-slate-100 space-y-3">
              <h2 className="text-[11px] font-bold text-slate-400 uppercase tracking-tight">{t.stats}</h2>
              <div className="grid grid-cols-1 gap-2">
                <div className="bg-slate-50 p-2.5 rounded-md border border-slate-100 flex justify-between items-center group hover:bg-white hover:border-indigo-100 transition-colors">
                  <p className="text-[10px] text-slate-500 uppercase font-bold tracking-tight">{t.words}</p>
                  <p className="text-sm font-mono font-bold text-indigo-600 group-hover:scale-110 transition-transform">{stats.words}</p>
                </div>
                <div className="bg-slate-50 p-2.5 rounded-md border border-slate-100 flex justify-between items-center group hover:bg-white hover:border-indigo-100 transition-colors">
                  <p className="text-[10px] text-slate-500 uppercase font-bold tracking-tight">{t.chars}</p>
                  <p className="text-sm font-mono font-bold text-indigo-600 group-hover:scale-110 transition-transform">{stats.characters}</p>
                </div>
                <div className="bg-slate-50 p-2.5 rounded-md border border-slate-100 flex justify-between items-center group hover:bg-white hover:border-indigo-100 transition-colors">
                  <p className="text-[10px] text-slate-500 uppercase font-bold tracking-tight">{t.lines}</p>
                  <p className="text-sm font-mono font-bold text-indigo-600 group-hover:scale-110 transition-transform">{stats.lines}</p>
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-slate-100 space-y-4">
              <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-100">
                <div className="flex items-center gap-2 mb-2">
                  <Info size={14} className="text-indigo-600" />
                  <h3 className="font-bold text-xs uppercase tracking-wider text-indigo-900">{t.proTip}</h3>
                </div>
                <p className="text-[11px] text-indigo-700 leading-relaxed font-medium">
                  {t.proTipDesc}
                </p>
                {lang === 'hi' && (
                  <p className="text-[10px] text-indigo-500 mt-2 italic flex items-start gap-1">
                    <span className="shrink-0">•</span>
                    ध्यान दें: मानक PDF में देवनागरी लिपि के लिए विशेष फोंट की आवश्यकता हो सकती है।
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="p-4 bg-slate-50 border-t border-slate-200">
            <button 
              onClick={handleDownload}
              className="w-full py-3 bg-slate-900 text-white rounded-lg font-bold text-sm flex items-center justify-center gap-2 hover:bg-slate-800 transition-colors active:scale-95"
            >
              <Download size={16} className="text-indigo-400" />
              {t.download}
            </button>
          </div>
        </aside>

      </main>

      {/* Mobile Export (Hidden when sidebar is visible on desktop) */}
      <AnimatePresence>
        {!text.trim() ? null : (
          <motion.div 
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="fixed bottom-4 left-4 right-4 lg:hidden z-50 pointer-events-none"
          >
            <button
               onClick={handleDownload}
               className="bg-slate-900 text-white w-full py-4 rounded-xl font-bold shadow-2xl flex items-center justify-center gap-3 active:scale-95 transition-transform pointer-events-auto"
            >
              <Download size={20} className="text-indigo-400" />
              {t.convert}
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
