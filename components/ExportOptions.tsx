'use client'

import { useState } from 'react'
import type { ExportFormat } from '@/types'

interface ExportOptionsProps {
  onDownload: (format: ExportFormat) => void;
  disabled?: boolean;
}

export default function ExportOptions({ onDownload, disabled = false }: ExportOptionsProps) {
  const [isDownloading, setIsDownloading] = useState<ExportFormat | null>(null)

  const handleDownload = async (format: ExportFormat) => {
    if (disabled) return
    
    setIsDownloading(format)
    try {
      await onDownload(format)
    } finally {
      setIsDownloading(null)
    }
  }

  const formats: Array<{
    format: ExportFormat;
    label: string;
    description: string;
    icon: string;
    recommended?: boolean;
  }> = [
    {
      format: 'png',
      label: 'PNG',
      description: 'High quality raster image',
      icon: '🖼️',
      recommended: true
    },
    {
      format: 'svg',
      label: 'SVG',
      description: 'Scalable vector graphics',
      icon: '📐'
    },
    {
      format: 'pdf',
      label: 'PDF',
      description: 'Print-ready document',
      icon: '📄'
    }
  ]

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h3 className="text-lg font-semibold mb-4">Export Options</h3>
      
      {disabled && (
        <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-center">
            <svg className="w-5 h-5 text-yellow-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            <p className="text-sm text-yellow-800">
              Generate a QR code first to enable downloads
            </p>
          </div>
        </div>
      )}
      
      <div className="grid gap-3">
        {formats.map((formatInfo) => (
          <div
            key={formatInfo.format}
            className={`relative overflow-hidden ${
              disabled ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            <button
              onClick={() => handleDownload(formatInfo.format)}
              disabled={disabled || isDownloading === formatInfo.format}
              className={`w-full text-left p-4 border rounded-lg transition-all duration-200 ${
                disabled
                  ? 'border-gray-200 bg-gray-50'
                  : 'border-gray-200 hover:border-primary hover:shadow-md bg-white'
              } ${formatInfo.recommended ? 'ring-2 ring-primary-100' : ''}`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <span className="text-2xl mr-3">{formatInfo.icon}</span>
                  <div>
                    <div className="flex items-center">
                      <h4 className="font-semibold text-gray-900">
                        {formatInfo.label}
                      </h4>
                      {formatInfo.recommended && (
                        <span className="ml-2 text-xs bg-primary text-white px-2 py-0.5 rounded-full">
                          Recommended
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mt-1">
                      {formatInfo.description}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center">
                  {isDownloading === formatInfo.format ? (
                    <div className="flex items-center text-primary">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary mr-2"></div>
                      <span className="text-sm">Downloading...</span>
                    </div>
                  ) : (
                    <svg 
                      className="w-5 h-5 text-gray-400" 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        strokeWidth={2} 
                        d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" 
                      />
                    </svg>
                  )}
                </div>
              </div>
            </button>
          </div>
        ))}
      </div>
      
      {/* Export Tips */}
      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <h4 className="text-sm font-medium text-gray-900 mb-2">💡 Export Tips</h4>
        <ul className="text-xs text-gray-600 space-y-1">
          <li>• <strong>PNG:</strong> Best for web use and social media</li>
          <li>• <strong>SVG:</strong> Perfect for scaling and web development</li>
          <li>• <strong>PDF:</strong> Ideal for printing and document sharing</li>
        </ul>
      </div>
    </div>
  )
}