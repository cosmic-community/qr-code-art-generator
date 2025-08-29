'use client'

import { useState, useEffect, useCallback } from 'react'
import type { QRTemplate, ColorPalette, QRCodeConfig, QRGeneratorProps, ExportFormat } from '@/types'
import { generateQRCode, generateQRCodeSVG, isValidUrl, formatUrl, downloadFile } from '@/lib/qr-generator'
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
  
  const [config, setConfig] = useState<QRCodeConfig>({
    text: '',
    size: 400,
    foregroundColor: '#000000',
    backgroundColor: '#ffffff',
    style: 'square',
    margin: 2,
  })

  // Debounced QR code generation
  const generateQR = useCallback(async (currentConfig: QRCodeConfig) => {
    if (!currentConfig.text || !isValidUrl(currentConfig.text)) {
      setQrDataUrl('')
      setQrSvg('')
      return
    }

    setIsGenerating(true)
    try {
      const [dataUrl, svg] = await Promise.all([
        generateQRCode(currentConfig),
        generateQRCodeSVG(currentConfig)
      ])
      
      setQrDataUrl(dataUrl)
      setQrSvg(svg)
    } catch (error) {
      console.error('Error generating QR code:', error)
    } finally {
      setIsGenerating(false)
    }
  }, [])

  // Update config when URL changes
  useEffect(() => {
    const isValid = isValidUrl(url)
    setIsValidInput(isValid)
    
    if (isValid) {
      const formattedUrl = formatUrl(url)
      const newConfig = { ...config, text: formattedUrl }
      setConfig(newConfig)
      
      // Debounce QR generation
      const timeoutId = setTimeout(() => {
        generateQR(newConfig)
      }, 300)
      
      return () => clearTimeout(timeoutId)
    } else {
      setQrDataUrl('')
      setQrSvg('')
    }
  }, [url, config, generateQR])

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

  // Handle download
  const handleDownload = async (format: ExportFormat) => {
    if (!qrDataUrl && !qrSvg) return
    
    try {
      let downloadUrl = qrDataUrl
      let filename = `qr-code-${Date.now()}`
      
      if (format === 'svg' && qrSvg) {
        const blob = new Blob([qrSvg], { type: 'image/svg+xml' })
        downloadUrl = URL.createObjectURL(blob)
      }
      
      downloadFile(downloadUrl, filename, format)
      
      // Save to history
      await saveQRHistory({
        url: config.text,
        style_used: config.style,
        colors_used: {
          foreground: config.foregroundColor,
          background: config.backgroundColor
        },
        export_format: format
      })
      
      // Clean up blob URL if created
      if (format === 'svg' && downloadUrl !== qrDataUrl) {
        setTimeout(() => URL.revokeObjectURL(downloadUrl), 1000)
      }
    } catch (error) {
      console.error('Error downloading QR code:', error)
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
          />
        </div>
      </div>
    </div>
  )
}