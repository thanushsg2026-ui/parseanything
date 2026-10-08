import React, { useState } from 'react';
import { useTheme, THEME_PRESETS } from '../context/ThemeContext.js';
import { useDocuments } from '../context/DocumentContext.js';
import { PresetThemeName, ThemeMode } from '../types/document.js';
import {
  Palette,
  Sliders,
  Sparkles,
  Sun,
  Moon,
  Laptop,
  Check,
  RotateCcw,
  ShieldCheck,
  Cpu,
  Layers,
  Save,
} from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const { mode, setMode, preset, setPreset, colors, updateCustomColor, resetTheme } = useTheme();
  const { parserSettings, updateParserSettings, geminiConnected } = useDocuments();

  const [ocrEngine, setOcrEngine] = useState(parserSettings?.ocrEngine || 'paddleocr');
  const [extractionMode, setExtractionMode] = useState(parserSettings?.extractionMode || 'high_accuracy');
  const [geminiUsage, setGeminiUsage] = useState(parserSettings?.geminiUsage || 'auto');
  const [confidenceThreshold, setConfidenceThreshold] = useState(parserSettings?.confidenceThreshold || 0.70);
  const [autoMergeTables, setAutoMergeTables] = useState(parserSettings?.autoMergeTables !== false);
  const [stripRunningHeaders, setStripRunningHeaders] = useState(parserSettings?.stripRunningHeaders || false);
  const [savedSettingsSuccess, setSavedSettingsSuccess] = useState(false);

  const presetsList: { id: PresetThemeName; name: string; primaryColor: string }[] = [
    { id: 'indigo', name: 'Indigo (Default)', primaryColor: '#4f46e5' },
    { id: 'blue', name: 'Ocean Blue', primaryColor: '#2563eb' },
    { id: 'purple', name: 'Royal Purple', primaryColor: '#7c3aed' },
    { id: 'emerald', name: 'Emerald Green', primaryColor: '#059669' },
    { id: 'cyan', name: 'Electric Cyan', primaryColor: '#0891b2' },
    { id: 'rose', name: 'Rose Red', primaryColor: '#e11d48' },
    { id: 'amber', name: 'Warm Amber', primaryColor: '#d97706' },
  ];

  const handleSaveParserSettings = async () => {
    await updateParserSettings({
      ocrEngine: ocrEngine as any,
      extractionMode: extractionMode as any,
      geminiUsage: geminiUsage as any,
      confidenceThreshold,
      autoMergeTables,
      stripRunningHeaders,
    });
    setSavedSettingsSuccess(true);
    setTimeout(() => setSavedSettingsSuccess(false), 2500);
  };

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-10">
      {/* Header */}
      <div className="pb-4 border-b border-[var(--border)]">
        <h2 className="text-2xl font-bold text-[var(--foreground)] tracking-tight">
          System & Theme Settings
        </h2>
        <p className="text-xs text-[var(--muted)] mt-1">
          Customize design tokens, color palette, OCR engine abstraction, and Gemini AI pipeline parameters.
        </p>
      </div>

      {/* SECTION 1: THEME CUSTOMIZER */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Palette className="w-5 h-5 text-[var(--primary)]" />
            <h3 className="text-lg font-bold text-[var(--foreground)]">Theme & Appearance</h3>
          </div>
          <button
            onClick={resetTheme}
            className="flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-lg border border-[var(--border)] text-[var(--muted)] hover:text-[var(--foreground)]"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Defaults</span>
          </button>
        </div>

        {/* Mode Selector */}
        <div className="p-5 rounded-2xl border border-[var(--border)] bg-[var(--card)] space-y-4">
          <div className="text-xs font-semibold text-[var(--foreground)]">Appearance Mode</div>
          <div className="grid grid-cols-3 gap-3 max-w-md">
            {[
              { id: 'light', label: 'Light', icon: Sun },
              { id: 'dark', label: 'Dark', icon: Moon },
              { id: 'system', label: 'System', icon: Laptop },
            ].map((m) => {
              const Icon = m.icon;
              const isSelected = mode === m.id;
              return (
                <button
                  key={m.id}
                  onClick={() => setMode(m.id as ThemeMode)}
                  className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border text-xs font-medium transition-all ${
                    isSelected
                      ? 'border-[var(--primary)] bg-[var(--primary)]/10 text-[var(--primary)] font-bold shadow-xs'
                      : 'border-[var(--border)] bg-[var(--background)] text-[var(--muted)] hover:text-[var(--foreground)]'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{m.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Color Presets */}
        <div className="p-5 rounded-2xl border border-[var(--border)] bg-[var(--card)] space-y-4">
          <div className="text-xs font-semibold text-[var(--foreground)]">Color Preset Palettes</div>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5">
            {presetsList.map((p) => {
              const isSelected = preset === p.id;
              return (
                <button
                  key={p.id}
                  onClick={() => setPreset(p.id)}
                  className={`p-3 rounded-xl border flex flex-col items-center gap-2 transition-all text-center cursor-pointer ${
                    isSelected
                      ? 'border-[var(--primary)] bg-[var(--primary)]/10 shadow-xs ring-2 ring-[var(--primary)]/20'
                      : 'border-[var(--border)] bg-[var(--background)] hover:border-[var(--border)]'
                  }`}
                >
                  <span
                    className="w-7 h-7 rounded-full shadow-sm flex items-center justify-center text-white"
                    style={{ backgroundColor: p.primaryColor }}
                  >
                    {isSelected && <Check className="w-4 h-4 stroke-[3]" />}
                  </span>
                  <span className="text-[11px] font-medium text-[var(--foreground)] truncate w-full">
                    {p.name.split(' ')[0]}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Custom Color Pickers */}
        <div className="p-5 rounded-2xl border border-[var(--border)] bg-[var(--card)] space-y-4">
          <div className="text-xs font-semibold text-[var(--foreground)]">
            Custom Color Picker (Design Tokens)
          </div>
          <p className="text-[11px] text-[var(--muted)]">
            Fine-tune dynamic CSS variables. Changes immediately reflect across all buttons, borders, and cards.
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 pt-2">
            {[
              { key: 'primary', label: 'Primary Accent' },
              { key: 'secondary', label: 'Secondary Tone' },
              { key: 'accent', label: 'Highlight Accent' },
              { key: 'background', label: 'App Background' },
              { key: 'card', label: 'Card Surface' },
              { key: 'foreground', label: 'Text Foreground' },
              { key: 'border', label: 'Borders & Lines' },
            ].map((token) => (
              <div key={token.key} className="p-3 rounded-xl border border-[var(--border)] bg-[var(--background)]">
                <label className="text-[11px] font-medium text-[var(--muted)] block mb-1.5 truncate">
                  {token.label}
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={colors[token.key as keyof typeof colors] || '#4f46e5'}
                    onChange={(e) => updateCustomColor(token.key as any, e.target.value)}
                    className="w-7 h-7 rounded-md cursor-pointer border border-[var(--border)] p-0"
                  />
                  <input
                    type="text"
                    value={colors[token.key as keyof typeof colors] || ''}
                    onChange={(e) => updateCustomColor(token.key as any, e.target.value)}
                    className="w-20 font-mono text-[11px] uppercase bg-transparent text-[var(--foreground)] border-b border-[var(--border)] focus:outline-hidden focus:border-[var(--primary)]"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Live Theme Preview Card */}
        <div className="p-6 rounded-2xl border border-[var(--border)] bg-[var(--card)] shadow-md space-y-3">
          <div className="text-xs font-bold uppercase tracking-wider text-[var(--muted)]">
            Live Component Preview
          </div>
          <div className="p-4 rounded-xl border border-[var(--border)] bg-[var(--background)] flex flex-wrap items-center justify-between gap-3">
            <div>
              <h4 className="font-bold text-sm text-[var(--foreground)]">Enterprise Document Engine</h4>
              <p className="text-xs text-[var(--muted)]">Active color scheme dynamically rendered via CSS variables.</p>
            </div>
            <div className="flex items-center gap-2">
              <button className="px-3.5 py-1.5 rounded-lg bg-[var(--primary)] text-white font-semibold text-xs shadow-xs">
                Primary Button
              </button>
              <button className="px-3.5 py-1.5 rounded-lg border border-[var(--border)] bg-[var(--card)] text-[var(--foreground)] font-semibold text-xs">
                Secondary
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 2: PARSER PIPELINE CONFIGURATION */}
      <section className="space-y-6 pt-6 border-t border-[var(--border)]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sliders className="w-5 h-5 text-[var(--primary)]" />
            <h3 className="text-lg font-bold text-[var(--foreground)]">Parser Pipeline Settings</h3>
          </div>
          <button
            onClick={handleSaveParserSettings}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[var(--primary)] text-white hover:bg-[var(--primary-hover)] text-xs font-semibold shadow-xs cursor-pointer transition-colors"
          >
            {savedSettingsSuccess ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
            <span>{savedSettingsSuccess ? 'Saved!' : 'Save Parser Settings'}</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* OCR Engine Abstraction */}
          <div className="p-5 rounded-2xl border border-[var(--border)] bg-[var(--card)] space-y-3">
            <label className="text-xs font-bold text-[var(--foreground)] block">
              OCR Engine Abstraction
            </label>
            <p className="text-[11px] text-[var(--muted)]">
              Pluggable engine architecture for scanned pages and image-only PDF layers.
            </p>
            <select
              value={ocrEngine}
              onChange={(e) => setOcrEngine(e.target.value as any)}
              className="w-full text-xs p-2.5 rounded-xl border border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] focus:outline-hidden"
            >
              <option value="paddleocr">PaddleOCR (Recommended, high multilingual speed)</option>
              <option value="surya">Surya OCR (Accurate multi-column layout detection)</option>
              <option value="tesseract">Tesseract (Standard open source)</option>
              <option value="hybrid">Hybrid Engine (Ensemble voting)</option>
            </select>
          </div>

          {/* Extraction Mode */}
          <div className="p-5 rounded-2xl border border-[var(--border)] bg-[var(--card)] space-y-3">
            <label className="text-xs font-bold text-[var(--foreground)] block">
              Extraction Mode
            </label>
            <p className="text-[11px] text-[var(--muted)]">
              Balancing processing throughput and coordinate resolution depth.
            </p>
            <select
              value={extractionMode}
              onChange={(e) => setExtractionMode(e.target.value as any)}
              className="w-full text-xs p-2.5 rounded-xl border border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] focus:outline-hidden"
            >
              <option value="fast">Fast (Direct text layer priority)</option>
              <option value="balanced">Balanced (Fast OCR + table heuristics)</option>
              <option value="high_accuracy">High Accuracy (Deep layout + formula reconstruction)</option>
            </select>
          </div>

          {/* Gemini Usage Policy */}
          <div className="p-5 rounded-2xl border border-[var(--border)] bg-[var(--card)] space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-[var(--foreground)] flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                Gemini Vision Policy
              </label>
              <span className="text-[10px] font-mono text-emerald-500 font-bold">gemini-3.8-flash</span>
            </div>
            <p className="text-[11px] text-[var(--muted)]">
              Controls when Gemini is invoked for chart data extraction, ambiguous OCR, and math LaTeX.
            </p>
            <select
              value={geminiUsage}
              onChange={(e) => setGeminiUsage(e.target.value as any)}
              className="w-full text-xs p-2.5 rounded-xl border border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] focus:outline-hidden"
            >
              <option value="auto">Auto (Invoked for charts, figures & difficult formulas)</option>
              <option value="always">Always for Difficult Regions</option>
              <option value="disabled">Disabled (Deterministic-only fallback)</option>
            </select>
          </div>

          {/* Confidence Review Threshold */}
          <div className="p-5 rounded-2xl border border-[var(--border)] bg-[var(--card)] space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-[var(--foreground)]">
                Confidence Review Threshold
              </label>
              <span className="font-mono text-xs font-bold text-[var(--primary)]">
                {(confidenceThreshold * 100).toFixed(0)}%
              </span>
            </div>
            <p className="text-[11px] text-[var(--muted)]">
              Blocks scored below this threshold are automatically flagged with "Needs Review".
            </p>
            <input
              type="range"
              min="0.50"
              max="1.00"
              step="0.05"
              value={confidenceThreshold}
              onChange={(e) => setConfidenceThreshold(parseFloat(e.target.value))}
              className="w-full accent-[var(--primary)] cursor-pointer"
            />
          </div>
        </div>

        {/* Toggles */}
        <div className="p-5 rounded-2xl border border-[var(--border)] bg-[var(--card)] space-y-3">
          <label className="flex items-center justify-between cursor-pointer py-1">
            <div>
              <span className="text-xs font-bold text-[var(--foreground)] block">
                Automatic Cross-Page Table Merging
              </span>
              <span className="text-[11px] text-[var(--muted)]">
                Detects continuation tables across page boundaries and consolidates them into a single logical structure.
              </span>
            </div>
            <input
              type="checkbox"
              checked={autoMergeTables}
              onChange={(e) => setAutoMergeTables(e.target.checked)}
              className="w-4 h-4 accent-[var(--primary)] rounded cursor-pointer"
            />
          </label>

          <div className="border-t border-[var(--border)] my-2" />

          <label className="flex items-center justify-between cursor-pointer py-1">
            <div>
              <span className="text-xs font-bold text-[var(--foreground)] block">
                Strip Running Headers & Footers
              </span>
              <span className="text-[11px] text-[var(--muted)]">
                Omits repeated page numbers and confidentiality headers from the primary Markdown reading flow while preserving them as metadata.
              </span>
            </div>
            <input
              type="checkbox"
              checked={stripRunningHeaders}
              onChange={(e) => setStripRunningHeaders(e.target.checked)}
              className="w-4 h-4 accent-[var(--primary)] rounded cursor-pointer"
            />
          </label>
        </div>
      </section>
    </div>
  );
};
