import { createBucketClient } from '@cosmicjs/sdk'
import type { QRTemplate, ColorPalette, UserPreferences, QRHistory } from '@/types'

export const cosmic = createBucketClient({
  bucketSlug: process.env.COSMIC_BUCKET_SLUG as string,
  readKey: process.env.COSMIC_READ_KEY as string,
  writeKey: process.env.COSMIC_WRITE_KEY as string,
})

// Simple error helper for Cosmic SDK
function hasStatus(error: unknown): error is { status: number } {
  return typeof error === 'object' && error !== null && 'status' in error;
}

// Get all QR templates
export async function getQRTemplates(): Promise<QRTemplate[]> {
  try {
    const response = await cosmic.objects
      .find({ type: 'qr-templates' })
      .props(['id', 'title', 'slug', 'metadata'])
      .depth(1);
    
    return response.objects as QRTemplate[];
  } catch (error) {
    if (hasStatus(error) && error.status === 404) {
      return [];
    }
    throw new Error('Failed to fetch QR templates');
  }
}

// Get template by slug
export async function getQRTemplate(slug: string): Promise<QRTemplate | null> {
  try {
    const response = await cosmic.objects
      .findOne({ type: 'qr-templates', slug })
      .props(['id', 'title', 'slug', 'metadata'])
      .depth(1);
    
    return response.object as QRTemplate;
  } catch (error) {
    if (hasStatus(error) && error.status === 404) {
      return null;
    }
    throw new Error('Failed to fetch QR template');
  }
}

// Get all color palettes
export async function getColorPalettes(): Promise<ColorPalette[]> {
  try {
    const response = await cosmic.objects
      .find({ type: 'color-palettes' })
      .props(['id', 'title', 'slug', 'metadata'])
      .depth(1);
    
    return response.objects as ColorPalette[];
  } catch (error) {
    if (hasStatus(error) && error.status === 404) {
      return [];
    }
    throw new Error('Failed to fetch color palettes');
  }
}

// Save QR generation to history
export async function saveQRHistory(historyData: {
  url: string;
  style_used: string;
  colors_used: { foreground: string; background: string };
  export_format: string;
}): Promise<QRHistory> {
  try {
    const response = await cosmic.objects.insertOne({
      type: 'qr-history',
      title: `QR Code for ${new URL(historyData.url).hostname}`,
      metadata: {
        ...historyData,
        generated_at: new Date().toISOString()
      }
    });
    
    return response.object as QRHistory;
  } catch (error) {
    console.error('Error saving QR history:', error);
    throw new Error('Failed to save QR history');
  }
}

// Save user preferences
export async function saveUserPreferences(preferences: {
  preferred_colors?: string[];
  default_style?: string;
  export_format?: string;
  auto_download?: boolean;
}): Promise<UserPreferences> {
  try {
    const response = await cosmic.objects.insertOne({
      type: 'user-preferences',
      title: 'User QR Preferences',
      metadata: preferences
    });
    
    return response.object as UserPreferences;
  } catch (error) {
    console.error('Error saving user preferences:', error);
    throw new Error('Failed to save user preferences');
  }
}

// Get user preferences
export async function getUserPreferences(): Promise<UserPreferences | null> {
  try {
    const response = await cosmic.objects
      .findOne({ type: 'user-preferences' })
      .props(['id', 'title', 'metadata'])
      .depth(1);
    
    return response.object as UserPreferences;
  } catch (error) {
    if (hasStatus(error) && error.status === 404) {
      return null;
    }
    throw new Error('Failed to fetch user preferences');
  }
}