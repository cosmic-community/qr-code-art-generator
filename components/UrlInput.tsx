'use client'

import { useState, useEffect } from 'react'
import { isValidUrl, formatUrl } from '@/lib/qr-generator'

interface UrlInputProps {
  value: string;
  onChange: (value: string) => void;
  isValid: boolean;
  onValidationChange?: (isValid: boolean) => void;
  onSubmit?: () => void;
  showSubmitButton?: boolean;
}

export default function UrlInput({ 
  value, 
  onChange, 
  isValid, 
  onValidationChange,
  onSubmit,
  showSubmitButton = false
}: UrlInputProps) {
  const [focused, setFocused] = useState(false)
  const [showValidation, setShowValidation] = useState(false)

  // Validate URL and notify parent
  useEffect(() => {
    const trimmedValue = value.trim()
    const valid = trimmedValue.length > 0 && isValidUrl(trimmedValue)
    
    if (onValidationChange) {
      onValidationChange(valid)
    }
    
    // Show validation feedback after user has typed something
    if (trimmedValue.length > 0) {
      setShowValidation(true)
    }
  }, [value, onValidationChange])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (isValid && onSubmit) {
      onSubmit()
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && isValid && onSubmit) {
      onSubmit()
    }
  }

  const getValidationMessage = () => {
    if (!showValidation || value.trim().length === 0) return null
    
    if (isValid) {
      return (
        <div className="flex items-center text-green-600 text-sm mt-2">
          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          Valid URL
        </div>
      )
    } else {
      return (
        <div className="flex items-center text-red-500 text-sm mt-2">
          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Please enter a valid URL (e.g., google.com or https://example.com)
        </div>
      )
    }
  }

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="space-y-4">
          <div>
            <label htmlFor="url-input" className="block text-sm font-medium text-gray-700 mb-2">
              Enter URL or Website
            </label>
            <div className={`
              relative transition-all duration-200 
              ${focused ? 'transform scale-[1.02]' : ''}
            `}>
              <input
                id="url-input"
                type="text"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                onFocus={() => setFocused(true)}
                onBlur={() => setFocused(false)}
                onKeyPress={handleKeyPress}
                placeholder="e.g., google.com, https://example.com, or mywebsite.com"
                className={`
                  w-full px-4 py-3 text-lg border-2 rounded-lg transition-all duration-200
                  ${focused 
                    ? 'border-primary shadow-lg ring-4 ring-primary-100' 
                    : showValidation && value.trim().length > 0
                      ? isValid
                        ? 'border-green-300'
                        : 'border-red-300'
                      : 'border-gray-300 hover:border-gray-400'
                  }
                  focus:outline-none
                `}
              />
              
              {/* URL Icon */}
              <div className="absolute right-3 top-3 text-gray-400">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                </svg>
              </div>
            </div>
            
            {getValidationMessage()}
          </div>

          {/* Example URLs */}
          <div className="text-sm text-gray-500">
            <p className="mb-2">Examples:</p>
            <div className="flex flex-wrap gap-2">
              {['google.com', 'github.com', 'youtube.com'].map((example) => (
                <button
                  key={example}
                  type="button"
                  onClick={() => onChange(example)}
                  className="px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded-full text-xs transition-colors"
                >
                  {example}
                </button>
              ))}
            </div>
          </div>

          {/* Submit Button */}
          {showSubmitButton && (
            <div className="pt-4">
              <button
                type="submit"
                disabled={!isValid}
                className={`
                  w-full py-3 px-6 rounded-lg font-medium transition-all duration-200
                  ${isValid 
                    ? 'bg-primary text-white hover:bg-primary-dark shadow-lg hover:shadow-xl transform hover:scale-[1.02]' 
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  }
                `}
              >
                {isValid ? 'Continue to Style Selection' : 'Enter a valid URL to continue'}
              </button>
            </div>
          )}
        </div>
      </div>
    </form>
  )
}