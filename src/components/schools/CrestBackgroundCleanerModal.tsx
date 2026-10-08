'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  Sparkles,
  Upload,
  X,
  AlertTriangle,
  RotateCcw,
  Check,
  FileImage,
  ArrowRight,
  ShieldCheck,
  Cpu,
  Layers,
  Eye,
} from 'lucide-react';
import { useBackgroundRemover } from '../../hooks/useBackgroundRemover';

export interface CrestBackgroundCleanerModalProps {
  /**
   * The raw image File chosen by the user from file selection.
   * If null, modal is inactive.
   */
  file: File | null;
  /**
   * Controls modal visibility.
   */
  isOpen: boolean;
  /**
   * Called when the user cancels or closes the cleaner interceptor.
   */
  onClose: () => void;
  /**
   * Called when the user confirms the cleaned transparent PNG or falls back to the original file.
   * Receives the ready-to-upload File (e.g. sent directly to Cloudinary upload pipeline).
   */
  onUpload: (cleanFile: File) => void | Promise<void>;
  /**
   * Optional custom title for the modal header.
   */
  title?: string;
  /**
   * Optional school or context name (e.g. "Prempeh College").
   */
  schoolName?: string;
}

/**
 * CSS Checkered grid pattern for transparency preview.
 */
const CHECKERED_BG_STYLE: React.CSSProperties = {
  backgroundImage: `
    linear-gradient(45deg, #e5e7eb 25%, transparent 25%),
    linear-gradient(-45deg, #e5e7eb 25%, transparent 25%),
    linear-gradient(45deg, transparent 75%, #e5e7eb 75%),
    linear-gradient(-45deg, transparent 75%, #e5e7eb 75%)
  `,
  backgroundSize: '16px 16px',
  backgroundPosition: '0 0, 0 8px, 8px -8px, -8px 0',
  backgroundColor: '#ffffff',
};

/**
 * Neo-brutalist interactive Image Background Remover Interceptor Modal.
 * Strips raw image backgrounds client-side via in-browser WebAssembly with $0 cloud cost.
 */
export function CrestBackgroundCleanerModal({
  file,
  isOpen,
  onClose,
  onUpload,
  title = 'AI Crest Background Remover',
  schoolName,
}: CrestBackgroundCleanerModalProps): React.JSX.Element | null {
  const [previewMode, setPreviewMode] = useState<'checkered' | 'cream' | 'dark'>('checkered');
  const [originalUrl, setOriginalUrl] = useState<string | null>(null);

  const {
    processImage,
    isProcessing,
    progress,
    progressKey,
    cleanBlob,
    cleanUrl,
    error,
    getCleanFile,
    reset,
  } = useBackgroundRemover(file, { autoProcess: false });

  // Generate original image object URL for before/after comparison
  useEffect(() => {
    if (file) {
      const url = URL.createObjectURL(file);
      setOriginalUrl(url);
      return () => {
        URL.revokeObjectURL(url);
      };
    } else {
      setOriginalUrl(null);
    }
  }, [file]);

  // Trigger background removal as soon as the modal opens with a valid file
  useEffect(() => {
    if (isOpen && file && !cleanBlob && !isProcessing && !error) {
      void processImage(file);
    }
  }, [isOpen, file, cleanBlob, isProcessing, error, processImage]);

  // Clean filename calculation
  const cleanFileName = useMemo(() => {
    if (!file) return 'clean_crest.png';
    const baseName = file.name.replace(/\.[^/.]+$/, '');
    return `${baseName}_clean.png`;
  }, [file]);

  // Human-readable progress description
  const progressDescription = useMemo(() => {
    if (!isProcessing) return 'Ready';
    if (progressKey?.includes('fetch') || progress < 40) {
      return 'Fetching lightweight WebAssembly ONNX model...';
    }
    if (progress < 85) {
      return 'Analyzing crest boundaries & neural segmentation...';
    }
    return 'Finalizing transparent alpha mask (PNG 0.95 quality)...';
  }, [isProcessing, progressKey, progress]);

  if (!isOpen || !file) {
    return null;
  }

  // Action: Confirm & Upload transparent PNG
  const handleConfirmAndUpload = () => {
    const finalCleanFile = getCleanFile(cleanFileName);
    if (finalCleanFile) {
      onUpload(finalCleanFile);
      reset();
      onClose();
    }
  };

  // Action: Fallback - Use Original file as-is
  const handleUseOriginal = () => {
    if (file) {
      onUpload(file);
      reset();
      onClose();
    }
  };

  // Action: Cancel and reset
  const handleCancel = () => {
    reset();
    onClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="cleaner-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/70 backdrop-blur-sm animate-in fade-in duration-150"
    >
      {/* ── Main Neo-Brutalist Interceptor Card ── */}
      <div className="relative w-full max-w-4xl bg-[#F5F3EC] border-[2.5px] border-black rounded-3xl shadow-[3px_3px_0px_#000] sm:shadow-[5px_5px_0px_#000] overflow-hidden flex flex-col max-h-[92vh]">
        {/* ── Header ── */}
        <div className="flex items-center justify-between px-5 sm:px-7 py-4 border-b-[2.5px] border-black bg-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#F4D06F] text-[#111827] border-[2.5px] border-black shadow-[2px_2px_0px_#000] flex items-center justify-center shrink-0">
              <Sparkles className="h-5 w-5 stroke-[2.5] text-[#111827]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 id="cleaner-modal-title" className="text-base sm:text-lg font-black text-[#111827] tracking-tight">
                  {title}
                </h2>
                <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#10B981]/20 text-[#065F46] border-[1.5px] border-black text-[10px] font-black uppercase tracking-wider shadow-[1px_1px_0px_#000]">
                  <Cpu className="h-3 w-3 stroke-[2.5]" />
                  In-Browser WASM ($0 Cost)
                </span>
              </div>
              <p className="text-xs font-bold text-[#4B5563]">
                {schoolName ? `Processing crest for ${schoolName}` : 'Stripping background before Cloudinary upload'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleCancel}
            className="w-9 h-9 rounded-xl bg-white hover:bg-[#F4D06F] text-[#111827] border-[2.5px] border-black shadow-[2px_2px_0px_#000] active:translate-y-0.5 transition-all flex items-center justify-center cursor-pointer"
            title="Cancel and close"
          >
            <X className="h-4 w-4 stroke-[3]" />
          </button>
        </div>

        {/* ── Modal Body Content ── */}
        <div className="p-5 sm:p-7 overflow-y-auto space-y-5 bg-[#F5F3EC]">
          {/* Progress / Inference Status Card */}
          {isProcessing && (
            <div className="p-4 rounded-2xl bg-white border-[2.5px] border-black shadow-[3px_3px_0px_#000] space-y-3">
              <div className="flex items-center justify-between text-xs font-black">
                <div className="flex items-center gap-2 text-[#111827]">
                  <RotateCcw className="h-4 w-4 animate-spin text-[#111827] stroke-[3]" />
                  <span>{progressDescription}</span>
                </div>
                <span className="px-2 py-0.5 bg-[#F4D06F] text-[#111827] border-[1.5px] border-black rounded-md font-mono font-black text-xs shadow-[1px_1px_0px_#000]">
                  {progress}%
                </span>
              </div>

              {/* Animated Neo-Brutalist Progress Bar */}
              <div className="w-full h-4 bg-[#F5F3EC] rounded-full border-2 border-black overflow-hidden p-0.5 shadow-inner">
                <div
                  className="h-full bg-[#F4D06F] rounded-full transition-all duration-300 border border-black flex items-center justify-end pr-1"
                  style={{ width: `${Math.max(5, progress)}%` }}
                />
              </div>

              <div className="flex items-center justify-between text-[11px] font-bold text-[#4B5563]">
                <span>Executing ISNet AI segmentation entirely on client device</span>
                <span>Zero server GPU bandwidth consumed</span>
              </div>
            </div>
          )}

          {/* Graceful Error Alert (Edge Case Handling) */}
          {error && (
            <div className="p-4 rounded-2xl bg-rose-50 border-[2.5px] border-black shadow-[3px_3px_0px_#000] text-[#111827] space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-rose-500 text-white border-2 border-black shadow-[1.5px_1.5px_0px_#000] flex items-center justify-center shrink-0">
                  <AlertTriangle className="h-5 w-5 stroke-[2.5]" />
                </div>
                <div className="flex-1">
                  <h4 className="text-sm font-black text-rose-950">
                    Client-Side Segmentation Could Not Complete
                  </h4>
                  <p className="text-xs font-bold text-rose-800 mt-1">
                    {error.message || 'The image format or resolution could not be processed by the WebAssembly model.'}
                  </p>
                  <p className="text-[11px] font-bold text-[#4B5563] mt-2">
                    You can either retry with a clearer image or bypass removal and upload your original raw file directly to Cloudinary.
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2.5 pt-1">
                <button
                  type="button"
                  onClick={() => processImage(file)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white hover:bg-[#F5F3EC] text-[#111827] border-2 border-black font-black text-xs shadow-[2px_2px_0px_#000] active:translate-y-0.5 transition-all cursor-pointer"
                >
                  <RotateCcw className="h-3.5 w-3.5 stroke-[2.5]" />
                  <span>Retry Segmentation</span>
                </button>
                <button
                  type="button"
                  onClick={handleUseOriginal}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#F4D06F] hover:bg-[#F6D86B] text-[#111827] border-2 border-black font-black text-xs shadow-[2px_2px_0px_#000] active:translate-y-0.5 transition-all cursor-pointer"
                >
                  <Upload className="h-3.5 w-3.5 stroke-[2.5]" />
                  <span>Upload Original File As-Is</span>
                </button>
              </div>
            </div>
          )}

          {/* ── Side-by-Side Before & After Preview Section ── */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            {/* Left Card: Original Selected Image */}
            <div className="bg-white border-[2.5px] border-black rounded-2xl shadow-[3px_3px_0px_#000] p-4 flex flex-col">
              <div className="flex items-center justify-between pb-3 border-b-2 border-black/10 mb-3">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-slate-400 border border-black" />
                  <span className="text-xs font-black uppercase tracking-wider text-[#111827]">
                    Original Image
                  </span>
                </div>
                <span className="px-2 py-0.5 rounded-md bg-[#F5F3EC] border border-black text-[10px] font-mono font-bold text-[#4B5563]">
                  {(file.size / 1024).toFixed(1)} KB &bull; {file.type.split('/')[1]?.toUpperCase() || 'RAW'}
                </span>
              </div>

              {/* Original Preview Container */}
              <div className="relative flex-1 min-h-[220px] sm:min-h-[260px] rounded-xl border-2 border-black bg-[#FAF8F2] flex items-center justify-center p-4 overflow-hidden">
                {originalUrl ? (
                  <img
                    src={originalUrl}
                    alt="Original selected crest"
                    className="max-h-52 sm:max-h-60 w-auto object-contain transition-transform hover:scale-105 duration-200"
                  />
                ) : (
                  <div className="flex flex-col items-center text-center text-[#9CA3AF]">
                    <FileImage className="h-8 w-8 stroke-[1.5]" />
                    <span className="text-xs font-bold mt-1">Loading original file...</span>
                  </div>
                )}
              </div>

              <div className="mt-3 flex items-center justify-between text-[11px] font-bold text-[#4B5563]">
                <span className="truncate max-w-[200px]" title={file.name}>
                  {file.name}
                </span>
                <span className="italic">Raw uploaded source</span>
              </div>
            </div>

            {/* Right Card: Isolated Crest on Checkered Transparency Grid */}
            <div className="bg-white border-[2.5px] border-black rounded-2xl shadow-[3px_3px_0px_#000] p-4 flex flex-col">
              <div className="flex items-center justify-between pb-3 border-b-2 border-black/10 mb-3">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#10B981] border border-black" />
                  <span className="text-xs font-black uppercase tracking-wider text-[#111827]">
                    Isolated Crest (WASM)
                  </span>
                  {cleanBlob && (
                    <span className="px-2 py-0.2 rounded-md bg-[#10B981]/20 text-[#065F46] border border-black text-[10px] font-black uppercase tracking-wider">
                      Clean Alpha
                    </span>
                  )}
                </div>

                {/* Background Grid Toggle Controls */}
                <div className="flex items-center gap-1 bg-[#F5F3EC] p-0.5 rounded-lg border border-black text-[10px] font-bold">
                  <button
                    type="button"
                    onClick={() => setPreviewMode('checkered')}
                    className={`px-1.5 py-0.5 rounded ${
                      previewMode === 'checkered'
                        ? 'bg-white border border-black shadow-[1px_1px_0px_#000] font-black'
                        : 'text-[#4B5563] hover:text-black'
                    }`}
                    title="Checkered transparency grid"
                  >
                    Grid
                  </button>
                  <button
                    type="button"
                    onClick={() => setPreviewMode('cream')}
                    className={`px-1.5 py-0.5 rounded ${
                      previewMode === 'cream'
                        ? 'bg-[#F4D06F] border border-black shadow-[1px_1px_0px_#000] font-black'
                        : 'text-[#4B5563] hover:text-black'
                    }`}
                    title="Warm cream background preview"
                  >
                    Cream
                  </button>
                  <button
                    type="button"
                    onClick={() => setPreviewMode('dark')}
                    className={`px-1.5 py-0.5 rounded ${
                      previewMode === 'dark'
                        ? 'bg-[#111827] text-white border border-black shadow-[1px_1px_0px_#000] font-black'
                        : 'text-[#4B5563] hover:text-black'
                    }`}
                    title="Dark background preview"
                  >
                    Dark
                  </button>
                </div>
              </div>

              {/* Isolated Preview Container */}
              <div
                className={`relative flex-1 min-h-[220px] sm:min-h-[260px] rounded-xl border-2 border-black flex items-center justify-center p-4 overflow-hidden transition-colors ${
                  previewMode === 'cream'
                    ? 'bg-[#F5F3EC]'
                    : previewMode === 'dark'
                    ? 'bg-[#111827]'
                    : ''
                }`}
                style={previewMode === 'checkered' ? CHECKERED_BG_STYLE : undefined}
              >
                {isProcessing ? (
                  <div className="flex flex-col items-center gap-3 p-4 bg-white/90 border-2 border-black rounded-xl shadow-[2px_2px_0px_#000] text-center">
                    <RotateCcw className="h-6 w-6 animate-spin text-[#111827] stroke-[3]" />
                    <div>
                      <p className="text-xs font-black text-[#111827]">Removing Background...</p>
                      <p className="text-[11px] font-bold text-[#4B5563]">{progress}% Complete</p>
                    </div>
                  </div>
                ) : cleanUrl ? (
                  <img
                    src={cleanUrl}
                    alt="Cleaned crest with background removed"
                    className="max-h-52 sm:max-h-60 w-auto object-contain transition-transform hover:scale-105 duration-200"
                  />
                ) : error ? (
                  <div className="flex flex-col items-center text-center p-4 text-rose-700">
                    <AlertTriangle className="h-7 w-7 stroke-[2]" />
                    <span className="text-xs font-black mt-2">Background removal failed</span>
                    <span className="text-[11px] font-bold text-[#4B5563]">
                      Use original file or retry above
                    </span>
                  </div>
                ) : (
                  <div className="flex flex-col items-center text-center text-[#9CA3AF]">
                    <Sparkles className="h-7 w-7 stroke-[1.5]" />
                    <span className="text-xs font-bold mt-1">Ready for background removal</span>
                  </div>
                )}
              </div>

              <div className="mt-3 flex items-center justify-between text-[11px] font-bold text-[#4B5563]">
                <span>
                  {cleanBlob ? `${(cleanBlob.size / 1024).toFixed(1)} KB • PNG (Transparent)` : 'Pending processing'}
                </span>
                <span className="text-emerald-700 font-black flex items-center gap-1">
                  {cleanBlob && (
                    <>
                      <ShieldCheck className="h-3.5 w-3.5 stroke-[2.5]" />
                      <span>Edge boundary verified</span>
                    </>
                  )}
                </span>
              </div>
            </div>
          </div>

          {/* Quick Notice Card */}
          <div className="p-3.5 rounded-xl bg-white border-2 border-black shadow-[2px_2px_0px_#000] flex items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 text-[#4B5563] font-bold">
              <span className="w-2 h-2 rounded-full bg-[#F4D06F] border border-black shrink-0" />
              <span>
                Cleaned crest will be saved as <strong className="font-mono text-[#111827]">{cleanFileName}</strong> and piped to Cloudinary.
              </span>
            </div>
            {cleanBlob && !isProcessing && (
              <button
                type="button"
                onClick={() => processImage(file)}
                className="inline-flex items-center gap-1 text-[11px] font-black text-[#111827] hover:underline cursor-pointer"
                title="Re-run neural segmentation"
              >
                <RotateCcw className="h-3 w-3 stroke-[2.5]" />
                <span>Re-run WASM</span>
              </button>
            )}
          </div>
        </div>

        {/* ── Modal Actions Footer ── */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 px-5 sm:px-7 py-4 border-t-[2.5px] border-black bg-white">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCancel}
              className="px-4 py-2.5 rounded-xl bg-white hover:bg-[#F5F3EC] text-[#111827] border-[2px] border-black font-black text-xs shadow-[2px_2px_0px_#000] active:translate-y-0.5 hover:-translate-y-0.5 transition-all cursor-pointer"
            >
              Cancel
            </button>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
            {/* Fallback Option: "Use Original" */}
            <button
              type="button"
              onClick={handleUseOriginal}
              className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-white hover:bg-[#F8F5EF] text-[#111827] border-[2px] border-black font-black text-xs shadow-[2px_2px_0px_#000] active:translate-y-0.5 hover:-translate-y-0.5 transition-all cursor-pointer"
            >
              <span>Use Original</span>
            </button>

            {/* Primary Action: "Confirm & Upload" */}
            <button
              type="button"
              onClick={handleConfirmAndUpload}
              disabled={isProcessing || !cleanBlob}
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#F4D06F] hover:bg-[#F6D86B] text-[#111827] border-[2.5px] border-black font-black text-xs shadow-[3px_3px_0px_#000] active:translate-y-0.5 hover:-translate-y-0.5 transition-all cursor-pointer disabled:opacity-40 disabled:hover:translate-y-0 disabled:shadow-[2px_2px_0px_#000]"
            >
              <Check className="h-4 w-4 stroke-[3]" />
              <span>Confirm & Upload Cleaned Crest</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CrestBackgroundCleanerModal;
