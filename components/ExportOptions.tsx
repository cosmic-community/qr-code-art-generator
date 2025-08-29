'use client'

import type { ExportFormat } from '@/types'

interface ExportOptionsProps {
  onDownload: (format: ExportFormat) => void;
  disabled: boolean;
}

export default function ExportOptions({ onDownload, disabled }: ExportOptionsProps) {
  const formats: { key: ExportFormat; label: string; description: string; icon: string }[] = [
    {
      key: 'png',
      label: 'PNG',
      description: 'High quality raster image',
      icon: '🖼️'
    },
    {
      key: 'svg',
      label: 'SVG',
      description: 'Scalable vector format',
      icon: '📐'
    },
    {
      key: 'pdf',
      label: 'PDF',
      description: 'Print-ready document',
      icon: '📄'
    }
  ]

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h3 className="text-lg font-semibold mb-4">Download Options</h3>
      
      {disabled && (
        <div className="mb-4 p-3 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-600">
            Enter a valid URL to enable download options
          </p>
        </div>
      )}
      
      <div className="grid gap-3">
        {formats.map((format) => (
          <button
            key={format.key}
            onClick={() => onDownload(format.key)}
            disabled={disabled}
            className={`flex items-center justify-between p-4 border rounded-lg transition-all duration-200 ${
              disabled
                ? 'border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed'
                : 'border-gray-200 bg-white text-gray-700 hover:border-primary-300 hover:bg-primary-50 hover:text-primary-700'
            }`}
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl" role="img" aria-label={format.label}>
                {format.icon}
              </span>
              <div className="text-left">
                <h4 className="font-medium">{format.label}</h4>
                <p className="text-sm text-gray-500">{format.description}</p>
              </div>
            </div>
            
            <svg 
              className={`w-5 h-5 ${disabled ? 'text-gray-300' : 'text-gray-400'}`} 
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
          </button>
        ))}
      </div>
      
      {!disabled && (
        <div className="mt-4 p-3 bg-blue-50 rounded-lg">
          <div className="flex items-start">
            <svg className="w-5 h-5 text-blue-400 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div className="text-sm text-blue-800">
              <p className="font-medium mb-1">Download Tips:</p>
              <ul className="space-y-1 text-xs">
                <li>• PNG: Best for web use and social media</li>
                <li>• SVG: Perfect for print and scaling</li>
                <li>• PDF: Ready for professional printing</li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}