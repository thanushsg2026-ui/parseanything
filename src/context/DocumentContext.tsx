import React, { createContext, useContext, useEffect, useState } from 'react';
import { DocumentBlock, DocumentItem, ParsedDocumentResult, ParserSettings } from '../types/document.js';
import { safeParseResponse } from '../utils/api.js';

export interface DocumentContextType {
  documents: DocumentItem[];
  selectedDocumentId: string | null;
  activeResult: ParsedDocumentResult | null;
  selectedBlockId: string | null;
  hoveredBlockId: string | null;
  activePage: number;
  zoomLevel: number;
  filterType: string;
  filterNeedsReviewOnly: boolean;
  searchQuery: string;
  isLoading: boolean;
  isProcessing: boolean;
  uploadProgress: number;
  currentStageIndex: number;
  parserSettings: ParserSettings | null;
  geminiConnected: boolean;

  // Actions
  selectDocument: (id: string) => Promise<void>;
  selectBlock: (blockId: string | null, page?: number) => void;
  hoverBlock: (blockId: string | null) => void;
  setActivePage: (page: number) => void;
  setZoomLevel: (zoom: number) => void;
  setFilterType: (type: string) => void;
  setFilterNeedsReviewOnly: (val: boolean) => void;
  setSearchQuery: (q: string) => void;
  uploadFile: (file: File) => Promise<string | null>;
  reprocessDocument: (id: string) => Promise<void>;
  deleteDocument: (id: string) => Promise<void>;
  enrichBlockWithGemini: (blockId: string) => Promise<void>;
  updateParserSettings: (settings: Partial<ParserSettings>) => Promise<void>;
  loadDemoDocument: (demoId: string) => Promise<void>;
  refreshDocuments: () => Promise<void>;
}

// Helper to safely parse API responses and prevent JSON parse errors on HTML / plain text
async function parseResponseSafely(res: Response): Promise<any> {
  const data = await safeParseResponse(res);
  if (!res.ok && data.success !== false) {
    data.success = false;
  }
  return data;
}

const DocumentContext = createContext<DocumentContextType | null>(null);

export const DocumentProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [selectedDocumentId, setSelectedDocumentId] = useState<string | null>('demo-acme-financial-2025');
  const [activeResult, setActiveResult] = useState<ParsedDocumentResult | null>(null);
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);
  const [hoveredBlockId, setHoveredBlockId] = useState<string | null>(null);
  const [activePage, setActivePage] = useState<number>(1);
  const [zoomLevel, setZoomLevel] = useState<number>(100);
  const [filterType, setFilterType] = useState<string>('all');
  const [filterNeedsReviewOnly, setFilterNeedsReviewOnly] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [currentStageIndex, setCurrentStageIndex] = useState<number>(0);
  const [parserSettings, setParserSettings] = useState<ParserSettings | null>(null);
  const [geminiConnected, setGeminiConnected] = useState<boolean>(false);

  // Load documents and settings on mount
  const refreshDocuments = async () => {
    try {
      const res = await fetch('/api/documents');
      if (res.ok) {
        const data = await parseResponseSafely(res);
        setDocuments(data.documents || []);
      }
    } catch (err) {
      console.warn('Failed to load documents list from backend:', err);
    }
  };

  const loadSettings = async () => {
    try {
      const res = await fetch('/api/settings');
      if (res.ok) {
        const data = await parseResponseSafely(res);
        setParserSettings(data.settings);
        setGeminiConnected(Boolean(data.gemini?.available));
      }
    } catch (err) {
      console.warn('Failed to fetch settings:', err);
    }
  };

  useEffect(() => {
    refreshDocuments();
    loadSettings();
  }, []);

  // Fetch active result whenever selectedDocumentId changes
  useEffect(() => {
    if (!selectedDocumentId) return;

    let isMounted = true;
    setIsLoading(true);

    fetch(`/api/documents/${selectedDocumentId}/result`)
      .then(res => {
        if (!res.ok) throw new Error(`Document result not found (${res.status})`);
        return parseResponseSafely(res);
      })
      .then(data => {
        if (isMounted && data && data.result) {
          setActiveResult(data.result);
          setActivePage(1);
          setSelectedBlockId(null);
          setIsLoading(false);
        }
      })
      .catch(err => {
        if (isMounted) {
          console.warn('Error loading document result:', err);
          setIsLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [selectedDocumentId]);

  const selectDocument = async (id: string) => {
    setSelectedDocumentId(id);
  };

  const selectBlock = (blockId: string | null, page?: number) => {
    setSelectedBlockId(blockId);
    if (page && page !== activePage) {
      setActivePage(page);
    } else if (blockId && activeResult) {
      const block = activeResult.blocks.find(b => b.id === blockId);
      if (block && block.page !== activePage) {
        setActivePage(block.page);
      }
    }
  };

  const hoverBlock = (blockId: string | null) => {
    setHoveredBlockId(blockId);
  };

  const uploadFile = async (file: File): Promise<string | null> => {
    setIsProcessing(true);
    setUploadProgress(10);
    setCurrentStageIndex(0);

    const formData = new FormData();
    formData.append('file', file);

    let stageTimer: any = null;

    try {
      // Simulate live stage progress visualizer
      stageTimer = setInterval(() => {
        setCurrentStageIndex(prev => {
          if (prev < 10) return prev + 1;
          return prev;
        });
        setUploadProgress(prev => Math.min(95, prev + 9));
      }, 250);

      const res = await fetch('/api/documents/upload', {
        method: 'POST',
        body: formData,
      });

      if (stageTimer) clearInterval(stageTimer);
      setUploadProgress(100);

      const data = await parseResponseSafely(res);

      if (!res.ok || data.success === false) {
        const errorMsg = data?.error || data?.details || data?.message || `Upload failed with HTTP ${res.status}`;
        throw new Error(errorMsg);
      }

      await refreshDocuments();

      // Retrieve resultId or document.id
      const resultDocId = data.resultId || data.document?.id || data.result?.document?.id;
      if (resultDocId) {
        if (data.result) {
          setActiveResult(data.result);
        }
        setSelectedDocumentId(resultDocId);
        setIsProcessing(false);
        return resultDocId;
      }
      setIsProcessing(false);
      return null;
    } catch (err: any) {
      if (stageTimer) clearInterval(stageTimer);
      setIsProcessing(false);
      setUploadProgress(0);
      throw err;
    }
  };

  const reprocessDocument = async (id: string) => {
    setIsProcessing(true);
    try {
      const res = await fetch(`/api/documents/${id}/reprocess`, { method: 'POST' });
      const data = await parseResponseSafely(res);
      if (data && data.result) {
        setActiveResult(data.result);
      }
      await refreshDocuments();
    } catch (err) {
      console.error('Reprocess error:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  const deleteDocument = async (id: string) => {
    try {
      const res = await fetch(`/api/documents/${id}`, { method: 'DELETE' });
      await parseResponseSafely(res);
      if (selectedDocumentId === id) {
        setSelectedDocumentId(null);
        setActiveResult(null);
      }
      await refreshDocuments();
    } catch (err) {
      console.error('Delete error:', err);
    }
  };

  const enrichBlockWithGemini = async (blockId: string) => {
    if (!selectedDocumentId || !activeResult) return;

    try {
      const res = await fetch(`/api/documents/${selectedDocumentId}/blocks/${blockId}/gemini-enrich`, {
        method: 'POST',
      });
      const data = await parseResponseSafely(res);
      if (data && data.updatedBlock) {
        // Update local state block
        const updatedBlocks = activeResult.blocks.map(b => (b.id === blockId ? data.updatedBlock : b));
        setActiveResult({
          ...activeResult,
          blocks: updatedBlocks,
        });
      }
    } catch (err) {
      console.error('Block enrichment error:', err);
    }
  };

  const updateParserSettings = async (settings: Partial<ParserSettings>) => {
    try {
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });
      const data = await parseResponseSafely(res);
      if (data && data.settings) {
        setParserSettings(data.settings);
      }
    } catch (err) {
      console.error('Failed to update parser settings:', err);
    }
  };

  const loadDemoDocument = async (demoId: string) => {
    setSelectedDocumentId(demoId);
  };

  return (
    <DocumentContext.Provider
      value={{
        documents,
        selectedDocumentId,
        activeResult,
        selectedBlockId,
        hoveredBlockId,
        activePage,
        zoomLevel,
        filterType,
        filterNeedsReviewOnly,
        searchQuery,
        isLoading,
        isProcessing,
        uploadProgress,
        currentStageIndex,
        parserSettings,
        geminiConnected,
        selectDocument,
        selectBlock,
        hoverBlock,
        setActivePage,
        setZoomLevel,
        setFilterType,
        setFilterNeedsReviewOnly,
        setSearchQuery,
        uploadFile,
        reprocessDocument,
        deleteDocument,
        enrichBlockWithGemini,
        updateParserSettings,
        loadDemoDocument,
        refreshDocuments,
      }}
    >
      {children}
    </DocumentContext.Provider>
  );
};

export const useDocuments = () => {
  const context = useContext(DocumentContext);
  if (!context) {
    throw new Error('useDocuments must be used within DocumentProvider');
  }
  return context;
};
