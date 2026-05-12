import React, { useState, useRef, useEffect } from 'react';
import { X, Download, Scissors, Shield, EyeOff, ChevronLeft, ChevronRight } from 'lucide-react';

function BlurSnipTool({ isOpen, onClose, resumeData }) {
  // Canvas and image state
  const canvasRef = useRef(null);
  const [imageObj, setImageObj] = useState(null);
  const [blurOptions, setBlurOptions] = useState({
    name: false, email: false, phone: false, company: false,
    dates: false, location: false, linkedin: false, avatar: false,
  });
  const [exportFormat, setExportFormat] = useState('png');
  const [isProcessing, setIsProcessing] = useState(false);
  const [snipMode, setSnipMode] = useState(false);
  const [snipStart, setSnipStart] = useState(null);
  const [snipRect, setSnipRect] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [activeTab, setActiveTab] = useState('upload');
  
  // PDF state
  const [pdfDoc, setPdfDoc] = useState(null);
  const [totalPages, setTotalPages] = useState(0);
  const [selectedPage, setSelectedPage] = useState(1);
  const pdfCanvasRef = useRef(null);

  // Reset when modal closes
  useEffect(() => {
    if (!isOpen) {
      setImageObj(null);
      setSnipRect(null);
      setSnipMode(false);
      setActiveTab('upload');
      setPdfDoc(null);
      setTotalPages(0);
      setSelectedPage(1);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Load PDF and render preview
  const loadPdfAndRender = async (file) => {
    const pdfjsLib = await import('pdfjs-dist');
    // FIXED: Using correct stable version CDN
    pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/build/pdf.worker.min.js';
    
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    setPdfDoc(pdf);
    setTotalPages(pdf.numPages);
    
    // Render first page preview
    await renderPdfPage(pdf, 1);
    return pdf;
  };

  const renderPdfPage = async (pdf, pageNum) => {
    const page = await pdf.getPage(pageNum);
    const viewport = page.getViewport({ scale: 1.2 });
    const canvas = pdfCanvasRef.current;
    if (!canvas) return;
    
    const context = canvas.getContext('2d');
    canvas.width = viewport.width;
    canvas.height = viewport.height;
    
    await page.render({
      canvasContext: context,
      viewport: viewport
    }).promise;
  };

  const changePage = async (direction) => {
    if (!pdfDoc) return;
    const newPage = selectedPage + direction;
    if (newPage < 1 || newPage > totalPages) return;
    setSelectedPage(newPage);
    await renderPdfPage(pdfDoc, newPage);
  };

  // Convert current PDF page to image for blur/snip
  const convertCurrentPageToImage = async () => {
    if (!pdfDoc) return null;
    
    const page = await pdfDoc.getPage(selectedPage);
    const viewport = page.getViewport({ scale: 2.0 });
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    canvas.width = viewport.width;
    canvas.height = viewport.height;
    
    await page.render({
      canvasContext: context,
      viewport: viewport
    }).promise;
    
    return canvas.toDataURL('image/png');
  };

  const handleFileUpload = async (file) => {
    if (!file) return;
    
    // Handle PDF files
    if (file.type === 'application/pdf') {
      setIsProcessing(true);
      try {
        await loadPdfAndRender(file);
        setActiveTab('pdf_preview');
        setIsProcessing(false);
      } catch (error) {
        console.error('PDF loading error:', error);
        alert('Error loading PDF. Please try again.');
        setIsProcessing(false);
      }
      return;
    }
    
    // Handle image files
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        setImageObj(img);
        renderCanvas(img, blurOptions, null);
        setActiveTab('blur');
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  };

  const startBlurFromPdf = async () => {
    setIsProcessing(true);
    const imageDataUrl = await convertCurrentPageToImage();
    const img = new Image();
    img.onload = () => {
      setImageObj(img);
      renderCanvas(img, blurOptions, null);
      setActiveTab('blur');
      setIsProcessing(false);
    };
    img.src = imageDataUrl;
  };

  const renderCanvas = (img, opts, snip) => {
    const canvas = canvasRef.current;
    if (!canvas || !img) return;
    const scale = Math.min(1, 800 / img.width);
    canvas.width = img.width * scale;
    canvas.height = img.height * scale;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    const regions = getRegions(canvas.width, canvas.height);
    Object.entries(opts).forEach(([key, on]) => {
      if (on && regions[key]) blurRegion(ctx, regions[key]);
    });
    if (snip) {
      ctx.strokeStyle = '#a855f7';
      ctx.lineWidth = 2;
      ctx.setLineDash([6, 3]);
      ctx.strokeRect(snip.x, snip.y, snip.w, snip.h);
      ctx.setLineDash([]);
      ctx.fillStyle = 'rgba(0,0,0,0.4)';
      ctx.fillRect(0, 0, canvas.width, snip.y);
      ctx.fillRect(0, snip.y + snip.h, canvas.width, canvas.height - snip.y - snip.h);
      ctx.fillRect(0, snip.y, snip.x, snip.h);
      ctx.fillRect(snip.x + snip.w, snip.y, canvas.width - snip.x - snip.w, snip.h);
    }
  };

  const getRegions = (w, h) => ({
    avatar:   { x: 0,       y: 0,       width: w * 0.18, height: h * 0.12 },
    name:     { x: w * 0.20, y: 0,      width: w * 0.45, height: h * 0.06 },
    email:    { x: w * 0.20, y: h * 0.06, width: w * 0.45, height: h * 0.05 },
    phone:    { x: w * 0.65, y: h * 0.06, width: w * 0.35, height: h * 0.05 },
    location: { x: w * 0.20, y: h * 0.11, width: w * 0.35, height: h * 0.04 },
    linkedin: { x: w * 0.55, y: h * 0.11, width: w * 0.45, height: h * 0.04 },
    company:  { x: 0,       y: h * 0.20, width: w * 0.55, height: h * 0.04 },
    dates:    { x: w * 0.70, y: h * 0.20, width: w * 0.30, height: h * 0.04 },
  });

  const blurRegion = (ctx, { x, y, width, height }) => {
    const bs = 10;
    const id = ctx.getImageData(x, y, width, height);
    const d = id.data;
    for (let by = 0; by < height; by += bs) {
      for (let bx = 0; bx < width; bx += bs) {
        const idx = (by * width + bx) * 4;
        const r = d[idx], g = d[idx + 1], b = d[idx + 2];
        for (let py = 0; py < bs && by + py < height; py++) {
          for (let px = 0; px < bs && bx + px < width; px++) {
            const i = ((by + py) * width + (bx + px)) * 4;
            d[i] = r; d[i + 1] = g; d[i + 2] = b;
          }
        }
      }
    }
    ctx.putImageData(id, x, y);
    ctx.fillStyle = 'rgba(100,100,120,0.55)';
    ctx.fillRect(x, y, width, height);
  };

  const toggle = (key) => {
    const next = { ...blurOptions, [key]: !blurOptions[key] };
    setBlurOptions(next);
    if (imageObj) renderCanvas(imageObj, next, snipRect);
  };

  const blurAll = () => {
    const a = {};
    Object.keys(blurOptions).forEach(k => a[k] = true);
    setBlurOptions(a);
    if (imageObj) renderCanvas(imageObj, a, snipRect);
  };

  const clearAll = () => {
    const a = {};
    Object.keys(blurOptions).forEach(k => a[k] = false);
    setBlurOptions(a);
    if (imageObj) renderCanvas(imageObj, a, snipRect);
  };

  const exportFull = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    setIsProcessing(true);
    setTimeout(() => {
      const mime = exportFormat === 'jpg' ? 'image/jpeg' : 'image/png';
      const a = document.createElement('a');
      a.download = `resume-blurred.${exportFormat}`;
      a.href = canvas.toDataURL(mime, 0.92);
      a.click();
      setIsProcessing(false);
    }, 100);
  };

  const exportSnip = () => {
    const canvas = canvasRef.current;
    if (!canvas || !snipRect) return;
    setIsProcessing(true);
    setTimeout(() => {
      const sc = document.createElement('canvas');
      sc.width = snipRect.w;
      sc.height = snipRect.h;
      sc.getContext('2d').drawImage(canvas, snipRect.x, snipRect.y, snipRect.w, snipRect.h, 0, 0, snipRect.w, snipRect.h);
      const a = document.createElement('a');
      a.download = 'resume-snip.png';
      a.href = sc.toDataURL('image/png');
      a.click();
      setIsProcessing(false);
    }, 100);
  };

  const onDown = (e) => {
    if (!snipMode) return;
    const r = canvasRef.current.getBoundingClientRect();
    const sx = canvasRef.current.width / r.width;
    const sy = canvasRef.current.height / r.height;
    setSnipStart({ x: (e.clientX - r.left) * sx, y: (e.clientY - r.top) * sy });
    setIsDragging(true);
  };

  const onMove = (e) => {
    if (!isDragging || !snipStart) return;
    const r = canvasRef.current.getBoundingClientRect();
    const sx = canvasRef.current.width / r.width;
    const sy = canvasRef.current.height / r.height;
    const cx = (e.clientX - r.left) * sx;
    const cy = (e.clientY - r.top) * sy;
    const nr = {
      x: Math.min(snipStart.x, cx),
      y: Math.min(snipStart.y, cy),
      w: Math.abs(cx - snipStart.x),
      h: Math.abs(cy - snipStart.y),
    };
    setSnipRect(nr);
    renderCanvas(imageObj, blurOptions, nr);
  };

  const onUp = () => setIsDragging(false);

  const items = [
    { key: 'avatar',   label: '🖼️ Avatar / Photo' },
    { key: 'name',     label: '👤 Full Name' },
    { key: 'email',    label: '📧 Email' },
    { key: 'phone',    label: '📞 Phone' },
    { key: 'location', label: '📍 Location' },
    { key: 'linkedin', label: '🔗 LinkedIn' },
    { key: 'company',  label: '🏢 Company Name' },
    { key: 'dates',    label: '📅 Dates' },
  ];

  const CanvasArea = () => (
    <div className="flex-1 min-w-0 bg-slate-900 rounded-xl overflow-hidden">
      <canvas
        ref={canvasRef}
        className="w-full h-auto block"
        style={{ cursor: snipMode ? 'crosshair' : 'default' }}
        onMouseDown={onDown}
        onMouseMove={onMove}
        onMouseUp={onUp}
      />
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4">
      <div className="bg-slate-900 rounded-2xl w-full max-w-5xl max-h-[95vh] flex flex-col border border-slate-700 shadow-2xl">

        {/* Header */}
        <div className="flex justify-between items-center p-5 border-b border-slate-700 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-pink-600 rounded-lg flex items-center justify-center">
              <Shield size={18} className="text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Blur & Snip</h2>
              <p className="text-slate-400 text-xs">Protect privacy before sharing</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition p-1">
            <X size={22} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-700 flex-shrink-0">
          <button
            onClick={() => setActiveTab('upload')}
            className={`px-6 py-3 text-sm font-medium transition ${
              activeTab === 'upload'
                ? 'border-b-2 border-pink-500 text-pink-400'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            1. Upload
          </button>
          <button
            onClick={() => setActiveTab('pdf_preview')}
            disabled={!pdfDoc}
            className={`px-6 py-3 text-sm font-medium transition ${
              activeTab === 'pdf_preview'
                ? 'border-b-2 border-pink-500 text-pink-400'
                : 'text-slate-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed'
            }`}
          >
            2. PDF Preview
          </button>
          <button
            onClick={() => setActiveTab('blur')}
            disabled={!imageObj}
            className={`px-6 py-3 text-sm font-medium transition ${
              activeTab === 'blur'
                ? 'border-b-2 border-pink-500 text-pink-400'
                : 'text-slate-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed'
            }`}
          >
            3. Blur
          </button>
          <button
            onClick={() => setActiveTab('snip')}
            disabled={!imageObj}
            className={`px-6 py-3 text-sm font-medium transition ${
              activeTab === 'snip'
                ? 'border-b-2 border-pink-500 text-pink-400'
                : 'text-slate-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed'
            }`}
          >
            4. Snip
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-5">

          {/* UPLOAD TAB */}
          {activeTab === 'upload' && (
            <div className="max-w-md mx-auto">
              <div
                className="border-2 border-dashed border-slate-600 rounded-xl p-12 text-center hover:border-pink-500 transition cursor-pointer"
                onDragOver={e => e.preventDefault()}
                onDrop={e => { e.preventDefault(); handleFileUpload(e.dataTransfer.files[0]); }}
                onClick={() => document.getElementById('bstInput').click()}
              >
                <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Shield size={28} className="text-pink-400" />
                </div>
                <p className="text-white font-medium mb-1">Upload your resume</p>
                <p className="text-slate-400 text-sm mb-4">PDF, PNG or JPG · Max 10MB</p>
                <span className="px-5 py-2 bg-pink-600 hover:bg-pink-700 text-white rounded-lg text-sm">
                  Choose File
                </span>
                <input
                  id="bstInput"
                  type="file"
                  accept=".pdf,.png,.jpg,.jpeg"
                  className="hidden"
                  onChange={e => handleFileUpload(e.target.files[0])}
                />
              </div>
              <p className="text-slate-500 text-xs text-center mt-3">
                {isProcessing ? '⏳ Processing...' : 'Upload a PDF to view all pages, then choose what to blur'}
              </p>
            </div>
          )}

          {/* PDF PREVIEW TAB */}
          {activeTab === 'pdf_preview' && pdfDoc && (
            <div className="flex flex-col items-center gap-6">
              <div className="bg-slate-800 rounded-xl p-4 flex items-center justify-between gap-4 w-full max-w-md mx-auto">
                <button
                  onClick={() => changePage(-1)}
                  disabled={selectedPage <= 1}
                  className="p-2 bg-slate-700 rounded-lg disabled:opacity-50 hover:bg-slate-600"
                >
                  <ChevronLeft size={20} />
                </button>
                <span className="text-white font-medium">
                  Page {selectedPage} of {totalPages}
                </span>
                <button
                  onClick={() => changePage(1)}
                  disabled={selectedPage >= totalPages}
                  className="p-2 bg-slate-700 rounded-lg disabled:opacity-50 hover:bg-slate-600"
                >
                  <ChevronRight size={20} />
                </button>
              </div>

              <div className="bg-slate-800 rounded-xl p-4 flex justify-center max-h-[60vh] overflow-auto">
                <canvas ref={pdfCanvasRef} className="max-w-full h-auto shadow-lg" />
              </div>

              <button
                onClick={startBlurFromPdf}
                className="px-6 py-3 bg-pink-600 hover:bg-pink-700 text-white rounded-lg flex items-center gap-2"
              >
                <Shield size={18} />
                Blur Current Page
              </button>
              
              <p className="text-slate-400 text-xs text-center">
                Select blur options for the current page, then export or snip
              </p>
            </div>
          )}

          {/* BLUR TAB */}
          {activeTab === 'blur' && imageObj && (
            <div className="flex gap-6">
              <CanvasArea />
              <div className="w-60 flex-shrink-0 space-y-4">
                <div className="bg-slate-800 rounded-xl p-4">
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-white font-semibold text-sm">Blur Regions</span>
                    <div className="flex gap-2">
                      <button onClick={blurAll} className="text-xs text-pink-400 hover:text-pink-300">All</button>
                      <span className="text-slate-600">|</span>
                      <button onClick={clearAll} className="text-xs text-slate-400 hover:text-white">Clear</button>
                    </div>
                  </div>
                  {items.map(({ key, label }) => (
                    <label key={key} className="flex items-center gap-2 cursor-pointer mb-2">
                      <input
                        type="checkbox"
                        checked={blurOptions[key]}
                        onChange={() => toggle(key)}
                        className="w-4 h-4 accent-pink-500"
                      />
                      <span className="text-slate-300 text-sm">{label}</span>
                    </label>
                  ))}
                </div>
                <div className="bg-slate-800 rounded-xl p-4">
                  <p className="text-white font-semibold text-sm mb-3">Export Full Image</p>
                  <select
                    value={exportFormat}
                    onChange={e => setExportFormat(e.target.value)}
                    className="w-full p-2 bg-slate-900 border border-slate-700 rounded-lg text-white text-sm mb-3"
                  >
                    <option value="png">PNG (Best Quality)</option>
                    <option value="jpg">JPG (Smaller Size)</option>
                  </select>
                  <button
                    onClick={exportFull}
                    disabled={isProcessing}
                    className="w-full py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm flex items-center justify-center gap-2"
                  >
                    <Download size={14} />
                    {isProcessing ? 'Processing...' : 'Download'}
                  </button>
                </div>
                <button
                  onClick={() => setActiveTab('snip')}
                  className="w-full py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm flex items-center justify-center gap-2"
                >
                  <Scissors size={14} /> Go to Snip Tool
                </button>
              </div>
            </div>
          )}

          {/* SNIP TAB */}
          {activeTab === 'snip' && imageObj && (
            <div className="flex gap-6">
              <CanvasArea />
              <div className="w-60 flex-shrink-0 space-y-4">
                <div className="bg-slate-800 rounded-xl p-4">
                  <p className="text-white font-semibold text-sm mb-2">Snip Tool</p>
                  <p className="text-slate-400 text-xs mb-4">
                    Draw a rectangle over any section to export just that part.
                  </p>
                  <button
                    onClick={() => { setSnipMode(!snipMode); setSnipRect(null); renderCanvas(imageObj, blurOptions, null); }}
                    className={`w-full py-2 rounded-lg text-sm flex items-center justify-center gap-2 text-white ${
                      snipMode ? 'bg-yellow-600 hover:bg-yellow-700' : 'bg-purple-600 hover:bg-purple-700'
                    }`}
                  >
                    {snipMode ? <EyeOff size={14} /> : <Scissors size={14} />}
                    {snipMode ? 'Cancel Snip' : 'Start Snip Mode'}
                  </button>
                  {snipMode && (
                    <p className="text-yellow-400 text-xs mt-2 text-center">Click and drag on the image</p>
                  )}
                </div>
                {snipRect && snipRect.w > 10 && (
                  <div className="bg-slate-800 rounded-xl p-4">
                    <p className="text-white font-semibold text-sm mb-1">Selection Ready</p>
                    <p className="text-slate-400 text-xs mb-3">
                      {Math.round(snipRect.w)} x {Math.round(snipRect.h)} px
                    </p>
                    <button
                      onClick={exportSnip}
                      disabled={isProcessing}
                      className="w-full py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm flex items-center justify-center gap-2"
                    >
                      <Download size={14} />
                      {isProcessing ? 'Saving...' : 'Download Snip'}
                    </button>
                  </div>
                )}
                <button
                  onClick={() => setActiveTab('blur')}
                  className="w-full py-2 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-lg text-sm"
                >
                  ← Back to Blur
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default BlurSnipTool;