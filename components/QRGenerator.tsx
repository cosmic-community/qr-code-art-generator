'use client'

import { useState, useEffect, useCallback } from 'react'
import type { QRTemplate, ColorPalette, QRCodeConfig, QRGeneratorProps, ExportFormat } from '@/types'
import { generateQRCode, generateQRCodeSVG, isValidUrl, formatUrl, downloadQRCode } from '@/lib/qr-generator'
import { saveQRHistory } from '@/lib/cosmic'
import QRPreview from './QRPreview'
import TemplateSelector from './TemplateSelector'
import ColorPicker from './ColorPicker'
import UrlInput from './UrlInput'
import ExportOptions from './ExportOptions'

export default function QRGenerator({ templates, colorPalettes }: QRGeneratorProps) {
  const [url, setUrl] = useState('')
  const [isValidInput, setIsValidInput] = useState(false)
  const [qrDataUrl, setQrDataUrl] = useState('')
  const [qrSvg, setQrSvg] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const [config, setConfig] = useState<QRCodeConfig>({
    text: '',
    size: 400,
    foregroundColor: '#000000',
    backgroundColor: '#ffffff',
    style: 'square',
    margin: 2,
  })

  // Debounced QR code generation with better error handling
  const generateQR = useCallback(async (currentConfig: QRCodeConfig) => {
    if (!currentConfig.text || !isValidUrl(currentConfig.text)) {
      setQrDataUrl('')
      setQrSvg('')
      setError(null)
      return
    }

    setIsGenerating(true)
    setError(null)
    
    try {
      console.log('Generating QR code for:', currentConfig.text)
      
      const [dataUrl, svg] = await Promise.all([
        generateQRCode(currentConfig),
        generateQRCodeSVG(currentConfig)
      ])
      
      console.log('QR code generated successfully')
      setQrDataUrl(dataUrl)
      setQrSvg(svg)
    } catch (error) {
      console.error('Error generating QR code:', error)
      setError(error instanceof Error ? error.message : 'Failed to generate QR code')
      setQrDataUrl('')
      setQrSvg('')
    } finally {
      setIsGenerating(false)
    }
  }, [])

  // Update config when URL changes with better validation
  useEffect(() => {
    const trimmedUrl = url.trim()
    const isValid = trimmedUrl.length > 0 && isValidUrl(trimmedUrl)
    setIsValidInput(isValid)
    
    if (isValid) {
      const formattedUrl = formatUrl(trimmedUrl)
      const newConfig = { ...config, text: formattedUrl }
      setConfig(newConfig)
      
      // Generate QR immediately for better UX
      generateQR(newConfig)
    } else {
      setQrDataUrl('')
      setQrSvg('')
      setError(null)
      setConfig({ ...config, text: '' })
    }
  }, [url, generateQR])

  // Handle template selection
  const handleTemplateSelect = (template: QRTemplate) => {
    const newConfig = {
      ...config,
      foregroundColor: template.metadata.colors.foreground,
      backgroundColor: template.metadata.colors.background,
      style: template.metadata.style,
      pattern: template.metadata.pattern,
    }
    setConfig(newConfig)
    
    if (newConfig.text && isValidUrl(newConfig.text)) {
      generateQR(newConfig)
    }
  }

  // Handle color changes
  const handleColorChange = (type: 'foreground' | 'background', color: string) => {
    const newConfig = {
      ...config,
      [type === 'foreground' ? 'foregroundColor' : 'backgroundColor']: color
    }
    setConfig(newConfig)
    
    if (newConfig.text && isValidUrl(newConfig.text)) {
      generateQR(newConfig)
    }
  }

  // Handle download with better error handling
  const handleDownload = async (format: ExportFormat) => {
    if (!qrDataUrl && !qrSvg) {
      console.warn('No QR code available for download')
      return
    }
    
    try {
      let downloadUrl = qrDataUrl
      let filename = `qr-code-${Date.now()}`
      
      if (format === 'svg' && qrSvg) {
        const blob = new Blob([qrSvg], { type: 'image/svg+xml' })
        downloadUrl = URL.createObjectURL(blob)
      }
      
      await downloadQRCode(downloadUrl, filename, format, config.style)
      
      // Save to history (don't block the download if this fails)
      try {
        await saveQRHistory({
          url: config.text,
          style_used: config.style,
          colors_used: {
            foreground: config.foregroundColor,
            background: config.backgroundColor
          },
          export_format: format
        })
      } catch (error) {
        console.warn('Failed to save to history:', error)
      }
      
      // Clean up blob URL if created
      if (format === 'svg' && downloadUrl !== qrDataUrl) {
        setTimeout(() => URL.revokeObjectURL(downloadUrl), 1000)
      }
    } catch (error) {
      console.error('Error downloading QR code:', error)
      setError(error instanceof Error ? error.message : 'Failed to download QR code')
    }
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="grid lg:grid-cols-2 gap-8">
        {/* Left Column - Controls */}
        <div className="space-y-6">
          {/* URL Input */}
          <UrlInput
            value={url}
            onChange={setUrl}
            isValid={isValidInput}
          />

          {/* Error Display */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center">
                <svg className="w-5 h-5 text-red-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-red-800 text-sm">{error}</span>
              </div>
            </div>
          )}

          {/* Template Selector */}
          {templates.length > 0 && (
            <TemplateSelector
              templates={templates}
              onSelect={handleTemplateSelect}
            />
          )}

          {/* Color Picker */}
          {colorPalettes.length > 0 && (
            <ColorPicker
              colorPalettes={colorPalettes}
              selectedForeground={config.foregroundColor}
              selectedBackground={config.backgroundColor}
              onForegroundChange={(color) => handleColorChange('foreground', color)}
              onBackgroundChange={(color) => handleColorChange('background', color)}
            />
          )}

          {/* Export Options */}
          <ExportOptions
            onDownload={handleDownload}
            disabled={!qrDataUrl}
          />
        </div>

        {/* Right Column - Preview */}
        <div className="lg:sticky lg:top-8">
          <QRPreview
            config={config}
            dataUrl={qrDataUrl}
            isGenerating={isGenerating}
            isValidUrl={isValidInput}
            onDownload={handleDownload}
            error={error}
          />
        </div>
      </div>
    </div>
  )
}