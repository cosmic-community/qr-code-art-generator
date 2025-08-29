'use client'

import { useState, useEffect, useCallback } from 'react'
import type { QRTemplate, ColorPalette, QRCodeConfig, QRGeneratorProps, ExportFormat, QRStyle } from '@/types'
import { generateQRCode, generateQRCodeSVG, isValidUrl, formatUrl, downloadQRCode } from '@/lib/qr-generator'
import { saveQRHistory } from '@/lib/cosmic'
import QRPreview from './QRPreview'
import StyleSelector from './StyleSelector'
import TemplateSelector from './TemplateSelector'
import ColorPicker from './ColorPicker'
import UrlInput from './UrlInput'
import ExportOptions from './ExportOptions'

type Step = 'url' | 'style' | 'customize' | 'preview'

export default function QRGenerator({ templates, colorPalettes }: QRGeneratorProps) {
  const [currentStep, setCurrentStep] = useState<Step>('url')
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

  // Handle URL validation and step progression
  const handleUrlSubmit = () => {
    const trimmedUrl = url.trim()
    const isValid = trimmedUrl.length > 0 && isValidUrl(trimmedUrl)
    
    if (isValid) {
      const formattedUrl = formatUrl(trimmedUrl)
      setConfig({ ...config, text: formattedUrl })
      setCurrentStep('style')
    }
  }

  // Handle style selection
  const handleStyleSelect = (style: QRStyle) => {
    setConfig({ ...config, style })
  }

  // Handle style confirmation and move to next step
  const handleStyleNext = () => {
    setCurrentStep('customize')
  }

  // Handle template selection with proper color parsing
  const handleTemplateSelect = (template: QRTemplate) => {
    // Parse colors JSON string safely
    let colors = { foreground: '#000000', background: '#ffffff', accent: undefined }
    try {
      if (template.metadata.colors && typeof template.metadata.colors === 'string') {
        colors = JSON.parse(template.metadata.colors)
      }
    } catch (error) {
      console.warn('Failed to parse template colors:', error)
    }

    const newConfig = {
      ...config,
      foregroundColor: colors.foreground,
      backgroundColor: colors.background,
      pattern: template.metadata.pattern?.value || template.metadata.pattern,
    }
    setConfig(newConfig)
  }

  // Handle color changes
  const handleColorChange = (type: 'foreground' | 'background', color: string) => {
    const newConfig = {
      ...config,
      [type === 'foreground' ? 'foregroundColor' : 'backgroundColor']: color
    }
    setConfig(newConfig)
  }

  // Generate final QR code when moving to preview
  const handleGeneratePreview = () => {
    if (config.text && isValidUrl(config.text)) {
      generateQR(config)
      setCurrentStep('preview')
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

  // Step navigation
  const handleBack = () => {
    switch (currentStep) {
      case 'style':
        setCurrentStep('url')
        break
      case 'customize':
        setCurrentStep('style')
        break
      case 'preview':
        setCurrentStep('customize')
        break
    }
  }

  // Step indicator
  const StepIndicator = () => {
    const steps = [
      { id: 'url', label: 'Enter URL', icon: '🔗' },
      { id: 'style', label: 'Choose Style', icon: '🎨' },
      { id: 'customize', label: 'Customize', icon: '⚙️' },
      { id: 'preview', label: 'Preview & Download', icon: '📱' }
    ]

    const currentStepIndex = steps.findIndex(s => s.id === currentStep)

    return (
      <div className="flex items-center justify-center mb-8">
        {steps.map((step, index) => (
          <div key={step.id} className="flex items-center">
            <div className={`
              flex items-center justify-center w-10 h-10 rounded-full text-sm font-medium
              ${index <= currentStepIndex 
                ? 'bg-primary text-white' 
                : 'bg-gray-200 text-gray-500'
              }
            `}>
              {index < currentStepIndex ? '✓' : step.icon}
            </div>
            <span className={`
              ml-2 text-sm font-medium
              ${index <= currentStepIndex ? 'text-primary' : 'text-gray-400'}
            `}>
              {step.label}
            </span>
            {index < steps.length - 1 && (
              <div className={`
                mx-4 w-8 h-0.5
                ${index < currentStepIndex ? 'bg-primary' : 'bg-gray-200'}
              `} />
            )}
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* Step Indicator */}
      <StepIndicator />

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <div className="flex items-center">
            <svg className="w-5 h-5 text-red-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-red-800 text-sm">{error}</span>
          </div>
        </div>
      )}

      {/* Step Content */}
      <div className="min-h-[500px]">
        {currentStep === 'url' && (
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                What would you like to create a QR code for?
              </h2>
              <p className="text-gray-600">
                Enter any URL to get started
              </p>
            </div>
            <UrlInput
              value={url}
              onChange={setUrl}
              isValid={isValidInput}
              onValidationChange={setIsValidInput}
              onSubmit={handleUrlSubmit}
              showSubmitButton={true}
            />
          </div>
        )}

        {currentStep === 'style' && (
          <div className="max-w-4xl mx-auto">
            <StyleSelector
              selectedStyle={config.style}
              onSelect={handleStyleSelect}
              onNext={handleStyleNext}
            />
          </div>
        )}

        {currentStep === 'customize' && (
          <div className="max-w-4xl mx-auto space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Customize Your QR Code
              </h2>
              <p className="text-gray-600">
                Fine-tune colors and templates to match your brand
              </p>
            </div>

            <div className="grid lg:grid-cols-2 gap-6">
              {/* Customization Options */}
              <div className="space-y-6">
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
              </div>

              {/* Live Preview */}
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-lg font-semibold mb-4">Live Preview</h3>
                <div className="text-center">
                  <div className="inline-block p-4 bg-gray-50 rounded-lg">
                    <div className="text-sm text-gray-500 mb-2">
                      Style: {config.style}
                    </div>
                    <div className="w-32 h-32 mx-auto bg-gray-200 rounded flex items-center justify-center text-gray-500 text-xs">
                      QR Preview
                      <br />
                      ({config.style})
                    </div>
                    <div className="flex justify-center gap-2 mt-2">
                      <div 
                        className="w-4 h-4 rounded border"
                        style={{ backgroundColor: config.foregroundColor }}
                        title="Foreground"
                      />
                      <div 
                        className="w-4 h-4 rounded border"
                        style={{ backgroundColor: config.backgroundColor }}
                        title="Background"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Generate Button */}
            <div className="text-center mt-8">
              <button
                onClick={handleGeneratePreview}
                className="bg-primary text-white px-8 py-3 rounded-lg font-medium hover:bg-primary-dark transition-colors shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                Generate QR Code
              </button>
            </div>
          </div>
        )}

        {currentStep === 'preview' && (
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Final Preview */}
            <QRPreview
              config={config}
              dataUrl={qrDataUrl}
              isGenerating={isGenerating}
              isValidUrl={isValidInput}
              onDownload={handleDownload}
              error={error}
            />

            {/* Export Options */}
            <div className="space-y-6">
              <ExportOptions
                onDownload={handleDownload}
                disabled={!qrDataUrl}
              />

              {/* QR Code Details */}
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-lg font-semibold mb-4">QR Code Details</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">URL:</span>
                    <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded truncate max-w-[200px]">
                      {config.text}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Style:</span>
                    <span className="capitalize">{config.style}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Size:</span>
                    <span>{config.size}x{config.size}px</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Colors:</span>
                    <div className="flex gap-1">
                      <div 
                        className="w-4 h-4 rounded border border-gray-300"
                        style={{ backgroundColor: config.foregroundColor }}
                        title={`Foreground: ${config.foregroundColor}`}
                      />
                      <div 
                        className="w-4 h-4 rounded border border-gray-300"
                        style={{ backgroundColor: config.backgroundColor }}
                        title={`Background: ${config.backgroundColor}`}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Navigation */}
      {currentStep !== 'url' && (
        <div className="flex justify-between items-center mt-8">
          <button
            onClick={handleBack}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </button>

          {currentStep === 'preview' && (
            <button
              onClick={() => {
                setCurrentStep('url')
                setUrl('')
                setQrDataUrl('')
                setQrSvg('')
                setError(null)
                setConfig({
                  text: '',
                  size: 400,
                  foregroundColor: '#000000',
                  backgroundColor: '#ffffff',
                  style: 'square',
                  margin: 2,
                })
              }}
              className="text-primary hover:text-primary-dark transition-colors"
            >
              Create Another QR Code
            </button>
          )}
        </div>
      )}
    </div>
  )
}