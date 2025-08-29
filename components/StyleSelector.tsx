'use client'

import { useState } from 'react'
import type { QRStyle } from '@/types'

interface StyleOption {
  id: QRStyle;
  name: string;
  description: string;
  icon: string;
  preview: React.ReactNode;
}

interface StyleSelectorProps {
  selectedStyle?: QRStyle;
  onSelect: (style: QRStyle) => void;
  onNext: () => void;
}

const styleOptions: StyleOption[] = [
  {
    id: 'square',
    name: 'Classic Square',
    description: 'Traditional QR code with square pixels',
    icon: '◼️',
    preview: (
      <div className="grid grid-cols-4 gap-1">
        {[...Array(16)].map((_, i) => (
          <div key={i} className="w-2 h-2 bg-current" />
        ))}
      </div>
    )
  },
  {
    id: 'rounded',
    name: 'Rounded Corners',
    description: 'Smooth rounded corners for a modern look',
    icon: '⬜',
    preview: (
      <div className="grid grid-cols-4 gap-1">
        {[...Array(16)].map((_, i) => (
          <div key={i} className="w-2 h-2 bg-current rounded-sm" />
        ))}
      </div>
    )
  },
  {
    id: 'dots',
    name: 'Dot Pattern',
    description: 'Circular dots instead of squares for artistic appeal',
    icon: '⚫',
    preview: (
      <div className="grid grid-cols-4 gap-1">
        {[...Array(16)].map((_, i) => (
          <div key={i} className="w-2 h-2 bg-current rounded-full" />
        ))}
      </div>
    )
  },
  {
    id: 'artistic',
    name: 'Artistic Gradient',
    description: 'Gradient effects with subtle shadows',
    icon: '🎨',
    preview: (
      <div className="grid grid-cols-4 gap-1">
        {[...Array(16)].map((_, i) => (
          <div 
            key={i} 
            className="w-2 h-2 bg-gradient-to-br from-current to-gray-600 shadow-sm" 
          />
        ))}
      </div>
    )
  }
];

export default function StyleSelector({ selectedStyle, onSelect, onNext }: StyleSelectorProps) {
  const [hoveredStyle, setHoveredStyle] = useState<QRStyle | null>(null)

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Choose Your Artistic Style
        </h2>
        <p className="text-gray-600">
          Select a style that matches your brand or personal preference
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        {styleOptions.map((style) => (
          <button
            key={style.id}
            onClick={() => onSelect(style.id)}
            onMouseEnter={() => setHoveredStyle(style.id)}
            onMouseLeave={() => setHoveredStyle(null)}
            className={`
              relative p-6 rounded-lg border-2 transition-all duration-200 text-left
              ${selectedStyle === style.id 
                ? 'border-primary bg-primary-50 shadow-md transform scale-[1.02]' 
                : 'border-gray-200 hover:border-primary-300 hover:bg-gray-50'
              }
            `}
          >
            {/* Selection indicator */}
            {selectedStyle === style.id && (
              <div className="absolute top-3 right-3">
                <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              </div>
            )}

            <div className="flex items-start gap-4">
              {/* Icon and Preview */}
              <div className="flex-shrink-0">
                <div className="text-2xl mb-2">{style.icon}</div>
                <div className="w-12 h-12 flex items-center justify-center text-gray-700">
                  {style.preview}
                </div>
              </div>

              {/* Content */}
              <div className="flex-1">
                <h3 className="font-semibold text-lg text-gray-900 mb-1">
                  {style.name}
                </h3>
                <p className="text-gray-600 text-sm">
                  {style.description}
                </p>
                
                {/* Hover effect - show more details */}
                {hoveredStyle === style.id && (
                  <div className="mt-3 text-xs text-primary-700 bg-primary-100 px-3 py-1 rounded-full inline-block">
                    Click to select this style
                  </div>
                )}
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* Continue button */}
      <div className="text-center">
        <button
          onClick={onNext}
          disabled={!selectedStyle}
          className={`
            px-8 py-3 rounded-lg font-medium transition-all duration-200
            ${selectedStyle 
              ? 'bg-primary text-white hover:bg-primary-dark shadow-lg hover:shadow-xl transform hover:scale-105' 
              : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }
          `}
        >
          {selectedStyle ? 'Continue with this style' : 'Select a style to continue'}
        </button>
        
        {selectedStyle && (
          <p className="text-sm text-gray-500 mt-2">
            You can change your style anytime after generation
          </p>
        )}
      </div>
    </div>
  )
}