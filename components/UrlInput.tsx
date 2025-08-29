'use client'

import { useState, useEffect } from 'react'

interface UrlInputProps {
  value: string;
  onChange: (value: string) => void;
  isValid: boolean;
}

export default function UrlInput({ value, onChange, isValid }: UrlInputProps) {
  const [focused, setFocused] = useState(false)
  const [showValidation, setShowValidation] = useState(false)

  // Show validation after user stops typing
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowValidation(value.length > 0)
    }, 500)

    return () => clearTimeout(timer)
  }, [value])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value)
  }

  const examples = [
    'google.com',
    'https://example.com',
    'mywebsite.com/page',
    'https://github.com/myrepo'
  ]

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h3 className="text-lg font-semibold mb-4">Enter URL</h3>
      
      <div className="relative">
        <input
          type="text"
          value={value}
          onChange={handleChange}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder="Enter a website URL"
          className={`input-field ${
            showValidation
              ? isValid 
                ? 'border-green-500 focus:ring-green-500 focus:border-green-500'
                : 'border-red-500 focus:ring-red-500 focus:border-red-500'
              : ''
          }`}
        />
        
        {/* Validation Icons */}
        {showValidation && (
          <div className="absolute right-3 top-3">
            {isValid ? (
              <svg className="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            ) : (
              <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            )}
          </div>
        )}
      </div>
      
      {/* Validation Message */}
      {showValidation && !isValid && value.length > 0 && (
        <p className="mt-2 text-sm text-red-600">
          Please enter a valid URL (e.g., google.com or https://example.com)
        </p>
      )}
      
      {showValidation && isValid && (
        <p className="mt-2 text-sm text-green-600">
          Valid URL! QR code will be generated automatically.
        </p>
      )}
      
      {/* Examples */}
      {!value && !focused && (
        <div className="mt-4">
          <p className="text-sm text-gray-600 mb-2">Examples:</p>
          <div className="flex flex-wrap gap-2">
            {examples.map((example, index) => (
              <button
                key={index}
                onClick={() => onChange(example)}
                className="text-xs bg-gray-100 hover:bg-gray-200 px-2 py-1 rounded transition-colors duration-200"
              >
                {example}
              </button>
            ))}
          </div>
        </div>
      )}
      
      {/* URL Preview */}
      {value && isValid && (
        <div className="mt-4 p-3 bg-blue-50 rounded-lg">
          <div className="flex items-center text-sm">
            <svg className="w-4 h-4 text-blue-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
            </svg>
            <span className="text-blue-700 font-medium">QR code will link to:</span>
          </div>
          <p className="mt-1 text-sm text-blue-800 font-mono break-all">
            {value.startsWith('http') ? value : `https://${value}`}
          </p>
        </div>
      )}
    </div>
  )
}