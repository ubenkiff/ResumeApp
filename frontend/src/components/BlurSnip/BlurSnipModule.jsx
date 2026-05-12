import React, { useState, useRef } from "react";
import { Download, Scissors, Shield, EyeOff } from "lucide-react";

function BlurSnipModule() {
  const canvasRef = useRef(null);
  const [imageObj, setImageObj] = useState(null);
  const [blurOptions, setBlurOptions] = useState({
    name: false, email: false, phone: false, company: false,
    dates: false, location: false, linkedin: false, avatar: false,
  });
  const [exportFormat, setExportFormat] = useState("png");
  const [isProcessing, setIsProcessing] = useState(false);
  const [snipMode, setSnipMode] = useState(false);
  const [snipStart, setSnipStart] = useState(null);
  const [snipRect, setSnipRect] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [activeTab, setActiveTab] = useState("upload");

  const handleFileUpload = (file) => {
    if (!file) return;
    if (file.type === "application/pdf") {
      alert("PDF: Please export your resume as PNG/JPG first.");
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        setImageObj(img);
        renderCanvas(img, blurOptions, null);
        setActiveTab("blur");
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  };

  const renderCanvas = (img, opts, snip) => {
    const canvas = canvasRef.current;
    if (!canvas || !img) return;
    const scale = Math.min(1, 900 / img.width);
    canvas.width = img.width * scale;
    canvas.height = img.height * scale;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    const regions = getRegions(canvas.width, canvas.height);
    Object.entries(opts).forEach(([key, on]) => {
      if (on && regions[key]) blurRegion(ctx, regions[key]);
    });
    if (snip) {
      ctx.strokeStyle = "#a855f7";
      ctx.lineWidth = 2;
      ctx.setLineDash([6, 3]);
      ctx.strokeRect(snip.x, snip.y, snip.w, snip.h);
      ctx.setLineDash([]);
      ctx.fillStyle = "rgba(0,0,0,0.4)";
      ctx.fillRect(0, 0, canvas.width, snip.y);
      ctx.fillRect(0, snip.y + snip.h, canvas.width, canvas.height - snip.y - snip.h);
      ctx.fillRect(0, snip.y, snip.x, snip.h);
      ctx.fillRect(snip.x + snip.w, snip.y, canvas.width - snip.x - snip.w, snip.h);
    }
  };

  const getRegions = (w, h) => ({
    avatar:   { x: 0,      y: 0,      width: w * 0.18, height: h * 0.12 },
    name:     { x: w * 0.20, y: 0,    width: w * 0.45, height: h * 0.06 },
    email:    { x: w * 0.20, y: h * 0.06, width: w * 0.45, height: h * 0.05 },
    phone:    { x: w * 0.65, y: h * 0.06, width: w * 0.35, height: h * 0.05 },
    location: { x: w * 0.20, y: h * 0.11, width: w * 0.35, height: h * 0.04 },
    linkedin: { x: w * 0.55, y: h * 0.11, width: w * 0.45, height: h * 0.04 },
    company:  { x: 0,      y: h * 0.20, width: w * 0.55, height: h * 0.04 },
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
    ctx.fillStyle = "rgba(100,100,120,0.55)";
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
      const mime = exportFormat === "jpg" ? "image/jpeg" : "image/png";
      const a = document.createElement("a");
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
      const sc = document.createElement("canvas");
      sc.width = snipRect.w;
      sc.height = snipRect.h;
      sc.getContext("2d").drawImage(canvas, snipRect.x, snipRect.y, snipRect.w, snipRect.h, 0, 0, snipRect.w, snipRect.h);
      const a = document.createElement("a");
      a.download = "resume-snip.png";
      a.href = sc.toDataURL("image/png");
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
    { key: "avatar",   label: "🖼️ Avatar / Photo" },
    { key: "name",     label: "👤 Full Name" },
    { key: "email",    label: "📧 Email" },
    { key: "phone",    label: "📞 Phone" },
    { key: "location", label: "📍 Location" },
    { key: "linkedin", label: "🔗 LinkedIn" },
    { key: "company",  label: "🏢 Company Name" },
    { key: "dates",    label: "📅 Dates" },
  ];

  const CanvasArea = () => (
    <div className="flex-1 min-w-0 bg-slate-900 rounded-xl overflow-hidden">
      <canvas
        ref={canvasRef}
        className="w-full h-auto block"
        style={{ cursor: snipMode ? "crosshair" : "default" }}
        onMouseDown={onDown}
        onMouseMove={onMove}
        onMouseUp={onUp}
      />
    </div>
  );

  return (
    <div className="bg-slate-800 rounded-2xl border border-slate-700 overflow-hidden">
      {/* Tabs */}
      <div className="flex border-b border-slate-700">
        {["upload", "blur", "snip"].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            disabled={tab !== "upload" && !imageObj}
            className={`px-6 py-3 text-sm font-medium transition ${
              activeTab === tab
                ? "border-b-2 border-pink-500 text-pink-400"
                : "text-slate-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed"
            }`}
          >
            {tab === "upload" ? "1. Upload" : tab === "blur" ? "2. Blur" : "3. Snip & Export"}
          </button>
        ))}
      </div>

      <div className="p-6">
        {/* UPLOAD TAB */}
        {activeTab === "upload" && (
          <div className="max-w-md mx-auto">
            <div
              className="border-2 border-dashed border-slate-600 rounded-xl p-12 text-center hover:border-pink-500 transition cursor-pointer"
              onDragOver={e => e.preventDefault()}
              onDrop={e => { e.preventDefault(); handleFileUpload(e.dataTransfer.files[0]); }}
              onClick={() => document.getElementById("bsmInput").click()}
            >
              <div className="w-16 h-16 bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield size={28} className="text-pink-400" />
              </div>
              <p className="text-white font-medium mb-1">Upload your resume image</p>
              <p className="text-slate-400 text-sm mb-4">PNG or JPG only · Max 10MB</p>
              <span className="px-5 py-2 bg-pink-600 hover:bg-pink-700 text-white rounded-lg text-sm">
                Choose File
              </span>
              <input
                id="bsmInput"
                type="file"
                accept=".png,.jpg,.jpeg"
                className="hidden"
                onChange={e => handleFileUpload(e.target.files[0])}
              />
            </div>
            <p className="text-slate-500 text-xs text-center mt-3">
              Tip: Screenshot your resume or export it as an image first
            </p>
          </div>
        )}

        {/* BLUR TAB */}
        {activeTab === "blur" && imageObj && (
          <div className="flex gap-6">
            <CanvasArea />
            <div className="w-60 flex-shrink-0 space-y-4">
              <div className="bg-slate-900 rounded-xl p-4">
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
              <div className="bg-slate-900 rounded-xl p-4">
                <p className="text-white font-semibold text-sm mb-3">Export Full Image</p>
                <select
                  value={exportFormat}
                  onChange={e => setExportFormat(e.target.value)}
                  className="w-full p-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm mb-3"
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
                  {isProcessing ? "Processing..." : "Download"}
                </button>
              </div>
              <button
                onClick={() => setActiveTab("snip")}
                className="w-full py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm flex items-center justify-center gap-2"
              >
                <Scissors size={14} /> Go to Snip Tool
              </button>
            </div>
          </div>
        )}

        {/* SNIP TAB */}
        {activeTab === "snip" && imageObj && (
          <div className="flex gap-6">
            <CanvasArea />
            <div className="w-60 flex-shrink-0 space-y-4">
              <div className="bg-slate-900 rounded-xl p-4">
                <p className="text-white font-semibold text-sm mb-2">Snip Tool</p>
                <p className="text-slate-400 text-xs mb-4">
                  Draw a rectangle over any section to export just that part.
                </p>
                <button
                  onClick={() => { setSnipMode(!snipMode); setSnipRect(null); renderCanvas(imageObj, blurOptions, null); }}
                  className={`w-full py-2 rounded-lg text-sm flex items-center justify-center gap-2 text-white ${
                    snipMode ? "bg-yellow-600 hover:bg-yellow-700" : "bg-purple-600 hover:bg-purple-700"
                  }`}
                >
                  {snipMode ? <EyeOff size={14} /> : <Scissors size={14} />}
                  {snipMode ? "Cancel Snip" : "Start Snip Mode"}
                </button>
                {snipMode && (
                  <p className="text-yellow-400 text-xs mt-2 text-center">Click and drag on the image</p>
                )}
              </div>
              {snipRect && snipRect.w > 10 && (
                <div className="bg-slate-900 rounded-xl p-4">
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
                    {isProcessing ? "Saving..." : "Download Snip"}
                  </button>
                </div>
              )}
              <button
                onClick={() => setActiveTab("blur")}
                className="w-full py-2 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-lg text-sm"
              >
                ← Back to Blur
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default BlurSnipModule;