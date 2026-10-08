import path from 'path';

export interface FileDetectionResult {
  format: string;
  mimeType: string;
  isSupported: boolean;
  isDocument: boolean;
  isImage: boolean;
  isSpreadsheet: boolean;
  isPresentation: boolean;
  isEmail: boolean;
  estimatedPages: number;
}

const SUPPORTED_EXTENSIONS: Record<string, { mime: string; type: string; cat: string }> = {
  pdf: { mime: 'application/pdf', type: 'pdf', cat: 'document' },
  jpg: { mime: 'image/jpeg', type: 'jpg', cat: 'image' },
  jpeg: { mime: 'image/jpeg', type: 'jpeg', cat: 'image' },
  png: { mime: 'image/png', type: 'png', cat: 'image' },
  tiff: { mime: 'image/tiff', type: 'tiff', cat: 'image' },
  tif: { mime: 'image/tiff', type: 'tiff', cat: 'image' },
  heic: { mime: 'image/heic', type: 'heic', cat: 'image' },
  doc: { mime: 'application/msword', type: 'doc', cat: 'document' },
  docx: { mime: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', type: 'docx', cat: 'document' },
  ppt: { mime: 'application/vnd.ms-powerpoint', type: 'ppt', cat: 'presentation' },
  pptx: { mime: 'application/vnd.openxmlformats-officedocument.presentationml.presentation', type: 'pptx', cat: 'presentation' },
  xls: { mime: 'application/vnd.ms-excel', type: 'xls', cat: 'spreadsheet' },
  xlsx: { mime: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', type: 'xlsx', cat: 'spreadsheet' },
  csv: { mime: 'text/csv', type: 'csv', cat: 'spreadsheet' },
  html: { mime: 'text/html', type: 'html', cat: 'document' },
  htm: { mime: 'text/html', type: 'html', cat: 'document' },
  md: { mime: 'text/markdown', type: 'markdown', cat: 'document' },
  markdown: { mime: 'text/markdown', type: 'markdown', cat: 'document' },
  txt: { mime: 'text/plain', type: 'txt', cat: 'document' },
  rtf: { mime: 'application/rtf', type: 'rtf', cat: 'document' },
  eml: { mime: 'message/rfc822', type: 'eml', cat: 'email' },
  msg: { mime: 'application/vnd.ms-outlook', type: 'msg', cat: 'email' },
};

export function detectFileType(filename: string, mimeTypeHint?: string, buffer?: Buffer): FileDetectionResult {
  const ext = path.extname(filename).toLowerCase().replace('.', '');
  const config = SUPPORTED_EXTENSIONS[ext];

  if (config) {
    return {
      format: config.type,
      mimeType: mimeTypeHint || config.mime,
      isSupported: true,
      isDocument: config.cat === 'document',
      isImage: config.cat === 'image',
      isSpreadsheet: config.cat === 'spreadsheet',
      isPresentation: config.cat === 'presentation',
      isEmail: config.cat === 'email',
      estimatedPages: config.cat === 'image' ? 1 : 2,
    };
  }

  // Sniff magic bytes if available
  if (buffer && buffer.length >= 4) {
    if (buffer[0] === 0x25 && buffer[1] === 0x50 && buffer[2] === 0x44 && buffer[3] === 0x46) {
      return {
        format: 'pdf',
        mimeType: 'application/pdf',
        isSupported: true,
        isDocument: true,
        isImage: false,
        isSpreadsheet: false,
        isPresentation: false,
        isEmail: false,
        estimatedPages: 3,
      };
    }
  }

  return {
    format: ext || 'unknown',
    mimeType: mimeTypeHint || 'application/octet-stream',
    isSupported: false,
    isDocument: false,
    isImage: false,
    isSpreadsheet: false,
    isPresentation: false,
    isEmail: false,
    estimatedPages: 1,
  };
}
