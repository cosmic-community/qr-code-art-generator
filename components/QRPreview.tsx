'use client'

import type { QRCodeConfig, ExportFormat } from '@/types'

interface QRPreviewProps {
  config: QRCodeConfig;
  dataUrl: string;
  isGenerating: boolean;
  isValidUrl: boolean;
  onDownload: (format: ExportFormat) => void;
}

export default function QRPreview({ 
  config, 
  dataUrl, 
  isGenerating, 
  isValidUrl, 
  onDownload 
}: QRPreviewProps) {
  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h3 className="text-lg font-semibold mb-4">Preview</h3>
      
      <div className="qr-preview">
        {isGenerating && (
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <p className="mt-2 text-gray-500">Generating QR code...</p>
          </div>
        )}
        
        {!isGenerating && !dataUrl && !config.text && (
          <div className="text-center text-gray-400">
            <svg className="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
            </svg>
            <p>Enter a URL to generate QR code</p>
          </div>
        )}
        
        {!isGenerating && !dataUrl && config.text && !isValidUrl && (
          <div className="text-center text-red-400">
            <svg className="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            <p>Please enter a valid URL</p>
          </div>
        )}
        
        {!isGenerating && dataUrl && (
          <div className="text-center">
            <img 
              src={dataUrl} 
              alt="Generated QR Code"
              className={`mx-auto max-w-full h-auto ${config.style === 'rounded' ? 'rounded-lg' : ''}`}
              style={{
                filter: config.style === 'artistic' ? 'drop-shadow(0 4px 8px rgba(0,0,0,0.1))' : 'none'
              }}
            />
            
            {/* QR Code Info */}
            <div className="mt-4 p-3 bg-gray-50 rounded-lg text-sm text-left">
              <div className="space-y-1">
                <div className="flex justify-between">
                  <span className="text-gray-600">URL:</span>
                  <span className="font-mono text-xs truncate ml-2 max-w-[200px]">
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
                      title="Foreground"
                    ></div>
                    <div 
                      className="w-4 h-4 rounded border border-gray-300"
                      style={{ backgroundColor: config.backgroundColor }}
                      title="Background"
                    ></div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Quick Download Buttons */}
            <div className="mt-4 flex gap-2 justify-center">
              <button
                onClick={() => onDownload('png')}
                className="btn-primary text-sm px-3 py-1"
              >
                PNG
              </button>
              <button
                onClick={() => onDownload('svg')}
                className="btn-secondary text-sm px-3 py-1"
              >
                SVG
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}