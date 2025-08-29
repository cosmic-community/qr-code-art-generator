// Base Cosmic object interface
interface CosmicObject {
  id: string;
  slug: string;
  title: string;
  content?: string;
  metadata: Record<string, any>;
  type: string;
  created_at: string;
  modified_at: string;
}

// QR Code Template
interface QRTemplate extends CosmicObject {
  type: 'qr-templates';
  metadata: {
    colors: string | {
      foreground: string;
      background: string;
      accent?: string;
    };
    style: QRStyle | { key: string; value: QRStyle };
    pattern?: QRPattern | { key: string; value: QRPattern };
    description?: string;
    preview_image?: {
      url: string;
      imgix_url: string;
    };
  };
}

// Color Palette
interface ColorPalette extends CosmicObject {
  type: 'color-palettes';
  metadata: {
    colors: string | string[];
    category: PaletteCategory | { key: string; value: PaletteCategory };
    description?: string;
  };
}

// User Preferences
interface UserPreferences extends CosmicObject {
  type: 'user-preferences';
  metadata: {
    preferred_colors?: string[];
    default_style?: QRStyle;
    export_format?: ExportFormat;
    auto_download?: boolean;
  };
}

// QR Generation History
interface QRHistory extends CosmicObject {
  type: 'qr-history';
  metadata: {
    url: string;
    style_used: QRStyle;
    colors_used: {
      foreground: string;
      background: string;
    };
    export_format: ExportFormat;
    generated_at: string;
  };
}

// Type literals for select-dropdown values
type QRStyle = 'square' | 'rounded' | 'dots' | 'artistic';
type QRPattern = 'solid' | 'gradient' | 'dots' | 'lines' | 'image';
type PaletteCategory = 'vibrant' | 'pastel' | 'monochrome' | 'nature' | 'sunset';
type ExportFormat = 'png' | 'svg' | 'pdf';

// QR Code Configuration
interface QRCodeConfig {
  text: string;
  size: number;
  foregroundColor: string;
  backgroundColor: string;
  style: QRStyle;
  pattern?: QRPattern | string;
  logoUrl?: string;
  margin: number;
  // NEW: Image upload support
  foregroundImage?: string; // Data URL of uploaded image
  imageBlendMode?: 'normal' | 'multiply' | 'overlay' | 'screen';
  imageOpacity?: number; // 0-1 opacity for the image
}

// API response types
interface CosmicResponse<T> {
  objects: T[];
  total: number;
  limit: number;
  skip: number;
}

// Component prop types
interface QRGeneratorProps {
  templates: QRTemplate[];
  colorPalettes: ColorPalette[];
}

interface QRPreviewProps {
  config: QRCodeConfig;
  onDownload: (format: ExportFormat) => void;
}

interface TemplateCardProps {
  template: QRTemplate;
  isSelected: boolean;
  onSelect: (template: QRTemplate) => void;
}

interface ColorPickerProps {
  colorPalettes: ColorPalette[];
  selectedForeground: string;
  selectedBackground: string;
  onForegroundChange: (color: string) => void;
  onBackgroundChange: (color: string) => void;
  // NEW: Image upload support
  onImageUpload?: (imageDataUrl: string) => void;
  onImageRemove?: () => void;
  foregroundImage?: string;
}

// Type guards
function isQRTemplate(obj: CosmicObject): obj is QRTemplate {
  return obj.type === 'qr-templates';
}

function isColorPalette(obj: CosmicObject): obj is ColorPalette {
  return obj.type === 'color-palettes';
}

// Utility types
type CreateQRTemplateData = Omit<QRTemplate, 'id' | 'created_at' | 'modified_at'>;
type UpdateQRConfigData = Partial<QRCodeConfig>;

// Export all types
export type {
  CosmicObject,
  QRTemplate,
  ColorPalette,
  UserPreferences,
  QRHistory,
  QRStyle,
  QRPattern,
  PaletteCategory,
  ExportFormat,
  QRCodeConfig,
  CosmicResponse,
  QRGeneratorProps,
  QRPreviewProps,
  TemplateCardProps,
  ColorPickerProps,
  CreateQRTemplateData,
  UpdateQRConfigData
};

export {
  isQRTemplate,
  isColorPalette
};