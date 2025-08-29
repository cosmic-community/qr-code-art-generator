'use client'

import { useState } from 'react'

interface UrlInputProps {
  value: string;
  onChange: (value: string) => void;
  isValid: boolean;
}

export default function UrlInput({ value, onChange, isValid }: UrlInputProps) {
  const [focused, setFocused] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Form submission handled by parent component
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h3 className="text-lg font-semibold mb-4">Enter URL</h3>
      
      <form onSubmit={handleSubmit}>
        <div className="relative">
          <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            placeholder="https://example.com or example.com"
            className={`input-field ${
              value && !isValid 
                ? 'border-red-300 focus:border-red-500 focus:ring-red-500' 
                : value && isValid
                ? 'border-green-300 focus:border-green-500 focus:ring-green-500'
                : ''
            }`}
          />
          
          {/* URL Status Indicator */}
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            {value && isValid && (
              <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            )}
            {value && !isValid && (
              <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            )}
          </div>
        </div>
        
        {/* Help Text */}
        <div className="mt-2 text-sm text-gray-600">
          {!value && (
            <p>Enter any website URL to generate a QR code</p>
          )}
          {value && !isValid && (
            <p className="text-red-600">
              Please enter a valid URL (e.g., https://example.com or example.com)
            </p>
          )}
          {value && isValid && (
            <p className="text-green-600">
              ✓ Valid URL - QR code will be generated automatically
            </p>
          )}
        </div>
      </form>
      
      {/* Example URLs */}
      <div className="mt-4">
        <p className="text-xs text-gray-500 mb-2">Quick examples:</p>
        <div className="flex flex-wrap gap-2">
          {['google.com', 'github.com', 'youtube.com'].map((example) => (
            <button
              key={example}
              onClick={() => onChange(example)}
              className="text-xs bg-gray-100 hover:bg-gray-200 px-2 py-1 rounded transition-colors duration-200"
            >
              {example}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}