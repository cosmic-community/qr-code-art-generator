'use client'

import { useState, useRef } from 'react'
import type { ColorPalette, ColorPickerProps } from '@/types'

export default function ColorPicker({ 
  colorPalettes,
  selectedForeground,
  selectedBackground,
  onForegroundChange,
  onBackgroundChange,
  onImageUpload,
  onImageRemove,
  foregroundImage
}: ColorPickerProps) {
  const [activeColorType, setActiveColorType] = useState<'foreground' | 'background'>('foreground')
  const [customForeground, setCustomForeground] = useState(selectedForeground)
  const [customBackground, setCustomBackground] = useState(selectedBackground)
  const [imagePreviewError, setImagePreviewError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Handle custom color input changes
  const handleCustomColorChange = (type: 'foreground' | 'background', value: string) => {
    if (type === 'foreground') {
      setCustomForeground(value)
      onForegroundChange(value)
    } else {
      setCustomBackground(value)
      onBackgroundChange(value)
    }
  }

  // Handle palette color selection
  const handlePaletteColorSelect = (color: string) => {
    if (activeColorType === 'foreground') {
      setCustomForeground(color)
      onForegroundChange(color)
    } else {
      setCustomBackground(color)
      onBackgroundChange(color)
    }
  }

  // Handle image upload
  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setImagePreviewError('Please select a valid image file')
      return
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setImagePreviewError('Image size must be less than 5MB')
      return
    }

    setImagePreviewError(null)

    const reader = new FileReader()
    reader.onload = (e) => {
      const result = e.target?.result as string
      if (result && onImageUpload) {
        onImageUpload(result)
      }
    }
    reader.onerror = () => {
      setImagePreviewError('Failed to read image file')
    }
    reader.readAsDataURL(file)
  }

  // Handle image removal
  const handleImageRemove = () => {
    if (onImageRemove) {
      onImageRemove()
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
    setImagePreviewError(null)
  }

  // Trigger file input
  const triggerFileInput = () => {
    fileInputRef.current?.click()
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h3 className="text-lg font-semibold mb-4">Customize Colors & Patterns</h3>
      
      {/* Color Type Selector */}
      <div className="mb-6">
        <div className="flex bg-gray-100 rounded-lg p-1 mb-4">
          <button
            onClick={() => setActiveColorType('foreground')}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              activeColorType === 'foreground'
                ? 'bg-white shadow-sm text-primary'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            Foreground (QR Pattern)
          </button>
          <button
            onClick={() => setActiveColorType('background')}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              activeColorType === 'background'
                ? 'bg-white shadow-sm text-primary'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            Background
          </button>
        </div>

        {/* Current Selection Preview */}
        <div className="flex items-center gap-4 mb-4">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Current:</span>
            <div 
              className="w-8 h-8 rounded border-2 border-gray-300"
              style={{ 
                backgroundColor: activeColorType === 'foreground' ? selectedForeground : selectedBackground 
              }}
            />
            <span className="text-sm font-mono">
              {activeColorType === 'foreground' ? selectedForeground : selectedBackground}
            </span>
          </div>
        </div>
      </div>

      {/* Image Upload Section (only for foreground) */}
      {activeColorType === 'foreground' && onImageUpload && (
        <div className="mb-6 p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-200">
          <h4 className="text-sm font-semibold text-purple-800 mb-3 flex items-center gap-2">
            <span>🎨</span>
            Upload Pattern Image
          </h4>
          <p className="text-sm text-purple-700 mb-4">
            Upload an image to fill the QR code pattern instead of using a solid color
          </p>

          {!foregroundImage ? (
            <div className="text-center">
              <button
                onClick={triggerFileInput}
                className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Choose Image
              </button>
              <p className="text-xs text-purple-600 mt-2">
                Supports JPG, PNG, GIF • Max 5MB
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {/* Image Preview */}
              <div className="relative">
                <img 
                  src={foregroundImage} 
                  alt="Pattern preview"
                  className="w-full h-20 object-cover rounded-lg border"
                />
                <button
                  onClick={handleImageRemove}
                  className="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-sm hover:bg-red-600 transition-colors"
                  title="Remove image"
                >
                  ×
                </button>
              </div>

              {/* Replace Button */}
              <div className="flex gap-2">
                <button
                  onClick={triggerFileInput}
                  className="flex-1 px-3 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors text-sm"
                >
                  Replace Image
                </button>
                <button
                  onClick={handleImageRemove}
                  className="px-3 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors text-sm"
                >
                  Use Color Instead
                </button>
              </div>
            </div>
          )}

          {/* Error Message */}
          {imagePreviewError && (
            <div className="mt-3 p-2 bg-red-50 border border-red-200 rounded text-sm text-red-700">
              {imagePreviewError}
            </div>
          )}

          {/* Hidden File Input */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="hidden"
          />
        </div>
      )}

      {/* Custom Color Input */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Custom {activeColorType === 'foreground' ? 'Foreground' : 'Background'} Color
        </label>
        <div className="flex gap-2">
          <input
            type="color"
            value={activeColorType === 'foreground' ? customForeground : customBackground}
            onChange={(e) => handleCustomColorChange(activeColorType, e.target.value)}
            className="w-12 h-10 border border-gray-300 rounded cursor-pointer"
          />
          <input
            type="text"
            value={activeColorType === 'foreground' ? customForeground : customBackground}
            onChange={(e) => handleCustomColorChange(activeColorType, e.target.value)}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent font-mono text-sm"
            placeholder="#000000"
          />
        </div>
      </div>

      {/* Color Palettes */}
      {colorPalettes.length > 0 && (
        <div className="space-y-4">
          <h4 className="text-sm font-medium text-gray-700">
            Quick {activeColorType === 'foreground' ? 'Foreground' : 'Background'} Colors
          </h4>
          
          {colorPalettes.map((palette) => {
            // Parse colors safely
            let colors: string[] = []
            try {
              if (typeof palette.metadata.colors === 'string') {
                colors = JSON.parse(palette.metadata.colors)
              } else if (Array.isArray(palette.metadata.colors)) {
                colors = palette.metadata.colors
              }
            } catch (error) {
              console.warn('Failed to parse palette colors:', error)
            }

            if (!colors || colors.length === 0) return null

            // Get category value safely
            const categoryValue = palette.metadata.category ? 
              (typeof palette.metadata.category === 'object' && 'value' in palette.metadata.category ? 
                palette.metadata.category.value : 
                palette.metadata.category) : 
              'unknown'

            return (
              <div key={palette.id} className="space-y-2">
                <div className="flex items-center justify-between">
                  <h5 className="text-sm font-medium text-gray-800">
                    {palette.title}
                  </h5>
                  <span className="text-xs text-gray-500 capitalize bg-gray-100 px-2 py-1 rounded">
                    {categoryValue}
                  </span>
                </div>
                
                {palette.metadata.description && (
                  <p className="text-xs text-gray-500 mb-2">
                    {palette.metadata.description}
                  </p>
                )}
                
                <div className="grid grid-cols-8 gap-1">
                  {colors.map((color, colorIndex) => (
                    <button
                      key={colorIndex}
                      onClick={() => handlePaletteColorSelect(color)}
                      className={`
                        w-8 h-8 rounded border-2 transition-all hover:scale-110
                        ${(activeColorType === 'foreground' ? selectedForeground : selectedBackground) === color 
                          ? 'border-gray-800 shadow-lg' 
                          : 'border-gray-200 hover:border-gray-400'
                        }
                      `}
                      style={{ backgroundColor: color }}
                      title={color}
                    />
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Tips */}
      <div className="mt-6 p-3 bg-blue-50 rounded-lg">
        <div className="flex items-start gap-2">
          <svg className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div className="text-sm text-blue-700">
            <p className="font-medium mb-1">Color Tips:</p>
            <ul className="text-xs space-y-1">
              <li>• Ensure good contrast between foreground and background</li>
              <li>• Upload high-contrast images for better QR code readability</li>
              <li>• Test your QR codes with different scanning apps</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}