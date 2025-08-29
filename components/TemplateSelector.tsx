'use client'

import { useState } from 'react'
import type { QRTemplate } from '@/types'

interface TemplateSelectorProps {
  templates: QRTemplate[];
  onSelect: (template: QRTemplate) => void;
}

export default function TemplateSelector({ templates, onSelect }: TemplateSelectorProps) {
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null)

  const handleSelect = (template: QRTemplate) => {
    setSelectedTemplate(template.id)
    onSelect(template)
  }

  if (!templates || templates.length === 0) {
    return null
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h3 className="text-lg font-semibold mb-4">Choose Style</h3>
      
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {templates.map((template) => (
          <button
            key={template.id}
            onClick={() => handleSelect(template)}
            className={`template-card ${
              selectedTemplate === template.id ? 'selected' : ''
            }`}
          >
            {/* Template Preview */}
            <div className="relative mb-2">
              {template.metadata.preview_image ? (
                <img 
                  src={`${template.metadata.preview_image.imgix_url}?w=200&h=120&fit=crop&auto=format,compress`}
                  alt={template.title}
                  className="w-full h-20 object-cover rounded"
                />
              ) : (
                <div 
                  className="w-full h-20 rounded flex items-center justify-center"
                  style={{
                    backgroundColor: template.metadata.colors.background,
                    color: template.metadata.colors.foreground
                  }}
                >
                  <div className="grid grid-cols-3 gap-1">
                    {[...Array(9)].map((_, i) => (
                      <div
                        key={i}
                        className="w-2 h-2"
                        style={{
                          backgroundColor: template.metadata.colors.foreground,
                          borderRadius: template.metadata.style === 'rounded' ? '50%' : '0'
                        }}
                      />
                    ))}
                  </div>
                </div>
              )}
              
              {/* Style indicator */}
              <div className="absolute top-1 right-1">
                <span className="bg-black bg-opacity-50 text-white text-xs px-1 py-0.5 rounded">
                  {template.metadata.style}
                </span>
              </div>
            </div>
            
            {/* Template Info */}
            <div className="text-left">
              <h4 className="font-medium text-sm truncate">{template.title}</h4>
              {template.metadata.description && (
                <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                  {template.metadata.description}
                </p>
              )}
              
              {/* Color Preview */}
              <div className="flex gap-1 mt-2">
                <div 
                  className="w-3 h-3 rounded border border-gray-300"
                  style={{ backgroundColor: template.metadata.colors.foreground }}
                  title="Foreground"
                />
                <div 
                  className="w-3 h-3 rounded border border-gray-300"
                  style={{ backgroundColor: template.metadata.colors.background }}
                  title="Background"
                />
                {template.metadata.colors.accent && (
                  <div 
                    className="w-3 h-3 rounded border border-gray-300"
                    style={{ backgroundColor: template.metadata.colors.accent }}
                    title="Accent"
                  />
                )}
              </div>
            </div>
          </button>
        ))}
      </div>
      
      {selectedTemplate && (
        <div className="mt-4 p-3 bg-primary-50 rounded-lg">
          <p className="text-sm text-primary-700">
            Template applied! Your QR code will update automatically.
          </p>
        </div>
      )}
    </div>
  )
}