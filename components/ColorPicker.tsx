'use client'

import type { ColorPalette } from '@/types'

interface ColorPickerProps {
  colorPalettes: ColorPalette[];
  selectedForeground: string;
  selectedBackground: string;
  onForegroundChange: (color: string) => void;
  onBackgroundChange: (color: string) => void;
}

export default function ColorPicker({
  colorPalettes,
  selectedForeground,
  selectedBackground,
  onForegroundChange,
  onBackgroundChange
}: ColorPickerProps) {
  // Default colors if no palettes provided
  const defaultColors = [
    '#000000', '#ffffff', '#6366f1', '#ef4444', '#10b981', 
    '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16'
  ]

  // Get all colors from palettes with proper JSON parsing
  const allColors = colorPalettes.reduce<string[]>((acc, palette) => {
    if (palette.metadata.colors) {
      try {
        let colors: string[] = []
        
        // Handle both JSON string and array formats
        if (typeof palette.metadata.colors === 'string') {
          colors = JSON.parse(palette.metadata.colors)
        } else if (Array.isArray(palette.metadata.colors)) {
          colors = palette.metadata.colors
        }
        
        if (Array.isArray(colors)) {
          return [...acc, ...colors]
        }
      } catch (error) {
        console.warn('Failed to parse palette colors:', error)
      }
    }
    return acc
  }, defaultColors)

  // Remove duplicates
  const uniqueColors = [...new Set(allColors)]

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h3 className="text-lg font-semibold mb-4">Customize Colors</h3>
      
      {/* Current Selection Display */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Foreground (QR Pattern)
          </label>
          <div className="flex items-center gap-2">
            <div 
              className="w-8 h-8 rounded border-2 border-gray-300"
              style={{ backgroundColor: selectedForeground }}
            />
            <input
              type="color"
              value={selectedForeground}
              onChange={(e) => onForegroundChange(e.target.value)}
              className="w-8 h-8 rounded border-2 border-gray-300 cursor-pointer"
            />
            <span className="text-sm font-mono text-gray-600">
              {selectedForeground}
            </span>
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Background
          </label>
          <div className="flex items-center gap-2">
            <div 
              className="w-8 h-8 rounded border-2 border-gray-300"
              style={{ backgroundColor: selectedBackground }}
            />
            <input
              type="color"
              value={selectedBackground}
              onChange={(e) => onBackgroundChange(e.target.value)}
              className="w-8 h-8 rounded border-2 border-gray-300 cursor-pointer"
            />
            <span className="text-sm font-mono text-gray-600">
              {selectedBackground}
            </span>
          </div>
        </div>
      </div>
      
      {/* Color Palette Sections */}
      {colorPalettes.length > 0 && (
        <div className="space-y-4">
          {colorPalettes.map((palette) => {
            let colors: string[] = []
            
            // Parse colors with proper error handling
            try {
              if (typeof palette.metadata.colors === 'string') {
                colors = JSON.parse(palette.metadata.colors)
              } else if (Array.isArray(palette.metadata.colors)) {
                colors = palette.metadata.colors
              }
            } catch (error) {
              console.warn('Failed to parse palette colors:', error)
              return null
            }
            
            if (!Array.isArray(colors) || colors.length === 0) {
              return null
            }
            
            return (
              <div key={palette.id}>
                <h4 className="text-sm font-medium text-gray-700 mb-2 capitalize">
                  {palette.title}
                </h4>
                <div className="flex flex-wrap gap-2">
                  {colors.map((color, index) => (
                    <div key={`${palette.id}-${index}`} className="flex flex-col gap-1">
                      <button
                        onClick={() => onForegroundChange(color)}
                        className={`color-swatch ${
                          selectedForeground === color ? 'selected' : ''
                        }`}
                        style={{ backgroundColor: color }}
                        title={`Use ${color} as foreground`}
                      />
                      <button
                        onClick={() => onBackgroundChange(color)}
                        className="text-xs bg-gray-100 hover:bg-gray-200 px-1 py-0.5 rounded transition-colors duration-200"
                        title={`Use ${color} as background`}
                      >
                        BG
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      )}
      
      {/* Quick Color Swatches */}
      <div className="mt-6">
        <h4 className="text-sm font-medium text-gray-700 mb-2">Quick Colors</h4>
        <div className="flex flex-wrap gap-2">
          {uniqueColors.slice(0, 12).map((color, index) => (
            <div key={index} className="flex flex-col gap-1">
              <button
                onClick={() => onForegroundChange(color)}
                className={`color-swatch ${
                  selectedForeground === color ? 'selected' : ''
                }`}
                style={{ backgroundColor: color }}
                title={`Use ${color} as foreground`}
              />
              <button
                onClick={() => onBackgroundChange(color)}
                className="text-xs bg-gray-100 hover:bg-gray-200 px-1 py-0.5 rounded transition-colors duration-200"
                title={`Use ${color} as background`}
              >
                BG
              </button>
            </div>
          ))}
        </div>
      </div>
      
      {/* Contrast Warning */}
      <div className="mt-4">
        {selectedForeground === selectedBackground && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-yellow-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              <p className="text-sm text-yellow-800">
                Warning: Foreground and background colors are the same. QR code may not be scannable.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}