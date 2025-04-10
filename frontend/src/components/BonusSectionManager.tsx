'use client';

import { useState } from 'react';

interface BonusItem {
  title: string;
  description: string;
  type?: string;
  file?: File | null;
  coverImage?: File | null;
  coverImagePath?: string;
}

interface BonusSectionManagerProps {
  bonusItems: BonusItem[];
  onChange: (bonusItems: BonusItem[]) => void;
  maxBonuses?: number;
}

export default function BonusSectionManager({ 
  bonusItems, 
  onChange, 
  maxBonuses = 5 
}: BonusSectionManagerProps) {
  const [showTemplateDropdown, setShowTemplateDropdown] = useState(false);
  const [showAddDropdown, setShowAddDropdown] = useState(false);

  // Templates for different bonus packages
  const templates = {
    basic: [
      { title: 'Quick Start Guide', description: 'Get started with the core concepts in just 15 minutes', type: 'pdf' },
      { title: 'Key Concepts Cheat Sheet', description: 'A handy reference of all important techniques', type: 'pdf' }
    ],
    standard: [
      { title: 'Quick Start Guide', description: 'Get started with the core concepts in just 15 minutes', type: 'pdf' },
      { title: 'Key Concepts Cheat Sheet', description: 'A handy reference of all important techniques', type: 'pdf' },
      { title: 'Workbook', description: 'Practical exercises to reinforce your learning', type: 'pdf' }
    ],
    premium: [
      { title: 'Quick Start Guide', description: 'Get started with the core concepts in just 15 minutes', type: 'pdf' },
      { title: 'Key Concepts Cheat Sheet', description: 'A handy reference of all important techniques', type: 'pdf' },
      { title: 'Workbook', description: 'Practical exercises to reinforce your learning', type: 'pdf' },
      { title: 'Video Tutorial', description: 'Visual walkthrough of advanced techniques', type: 'video' },
      { title: 'Audio Summary', description: 'Listen to key takeaways on the go', type: 'audio' }
    ]
  };

  // Add a single bonus section
  const addBonusSection = () => {
    if (bonusItems.length < maxBonuses) {
      onChange([...bonusItems, { title: '', description: '', type: 'text' }]);
    }
    setShowAddDropdown(false);
  };

  // Add multiple bonus sections at once
  const addMultipleBonusSections = (count: number) => {
    const newSections = Array(count)
      .fill(null)
      .map(() => ({ title: '', description: '', type: 'text' }));
    
    // Only add up to the maximum allowed
    const availableSlots = maxBonuses - bonusItems.length;
    const sectionsToAdd = newSections.slice(0, availableSlots);
    
    onChange([...bonusItems, ...sectionsToAdd]);
    setShowAddDropdown(false);
  };

  // Apply a template of predefined bonus sections
  const applyTemplate = (templateName: 'basic' | 'standard' | 'premium') => {
    const templateSections = templates[templateName];
    
    // Only add up to the maximum allowed
    const availableSlots = maxBonuses - bonusItems.length;
    const sectionsToAdd = templateSections.slice(0, availableSlots);
    
    onChange([...bonusItems, ...sectionsToAdd]);
    setShowTemplateDropdown(false);
  };

  // Duplicate a bonus section
  const duplicateBonusSection = (index: number) => {
    if (bonusItems.length < maxBonuses) {
      const newBonusItems = [...bonusItems];
      const duplicated = { ...newBonusItems[index], file: null };
      duplicated.title = `${duplicated.title} (Copy)`;
      newBonusItems.splice(index + 1, 0, duplicated);
      onChange(newBonusItems);
    }
  };

  // Remove a bonus section
  const removeBonusSection = (index: number) => {
    const newBonusItems = [...bonusItems];
    newBonusItems.splice(index, 1);
    onChange(newBonusItems);
  };

  // Update a bonus section field
  const updateBonusSection = (index: number, field: keyof BonusItem, value: any) => {
    const newBonusItems = [...bonusItems];
    newBonusItems[index] = { ...newBonusItems[index], [field]: value };
    onChange(newBonusItems);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Bonus Sections</h3>
        <div className="flex space-x-2">
          {/* Templates Dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowTemplateDropdown(!showTemplateDropdown)}
              className="px-3 py-2 bg-blue-50 text-blue-600 rounded-lg text-sm font-medium hover:bg-blue-100"
            >
              Templates
              <svg className="w-4 h-4 ml-1 inline-block" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {showTemplateDropdown && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-md shadow-lg z-10 border">
                <div className="py-1">
                  <button
                    type="button"
                    onClick={() => applyTemplate('basic')}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Basic Package (2 bonuses)
                  </button>
                  <button
                    type="button"
                    onClick={() => applyTemplate('standard')}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Standard Package (3 bonuses)
                  </button>
                  <button
                    type="button"
                    onClick={() => applyTemplate('premium')}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Premium Package (5 bonuses)
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Add Bonus Dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowAddDropdown(!showAddDropdown)}
              className={`px-3 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 ${
                bonusItems.length >= maxBonuses ? 'opacity-50 cursor-not-allowed' : ''
              }`}
              disabled={bonusItems.length >= maxBonuses}
            >
              Add Bonus
              <svg className="w-4 h-4 ml-1 inline-block" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {showAddDropdown && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-md shadow-lg z-10 border">
                <div className="py-1">
                  <button
                    type="button"
                    onClick={addBonusSection}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Add Single Bonus
                  </button>
                  <button
                    type="button"
                    onClick={() => addMultipleBonusSections(2)}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Add 2 Bonuses
                  </button>
                  <button
                    type="button"
                    onClick={() => addMultipleBonusSections(3)}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Add 3 Bonuses
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {bonusItems.length === 0 ? (
        <p className="text-sm text-gray-500 italic p-4 bg-gray-50 border border-dashed border-gray-300 rounded-lg text-center">
          No bonus sections added. You can add up to {maxBonuses} bonus sections.
        </p>
      ) : (
        <div className="space-y-6">
          {bonusItems.map((item, index) => (
            <div key={index} className="p-4 border rounded-lg bg-gray-50">
              <div className="flex justify-between items-center mb-3">
                <h4 className="font-medium">Bonus Section #{index + 1}</h4>
                <div className="flex space-x-2">
                  <button
                    type="button"
                    onClick={() => duplicateBonusSection(index)}
                    disabled={bonusItems.length >= maxBonuses}
                    className={`text-blue-600 hover:text-blue-800 ${
                      bonusItems.length >= maxBonuses ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  </button>
                  <button
                    type="button"
                    onClick={() => removeBonusSection(index)}
                    className="text-red-600 hover:text-red-800"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
              
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={item.title}
                    onChange={(e) => updateBonusSection(index, 'title', e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., Bonus Workbook, Cheat Sheet, etc."
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description *
                  </label>
                  <textarea
                    required
                    value={item.description}
                    onChange={(e) => updateBonusSection(index, 'description', e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Describe what this bonus includes"
                    rows={3}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Bonus Type
                  </label>
                  <select
                    value={item.type || 'text'}
                    onChange={(e) => updateBonusSection(index, 'type', e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="text">Text Only</option>
                    <option value="pdf">PDF Document</option>
                    <option value="audio">Audio</option>
                    <option value="video">Video</option>
                  </select>
                </div>
                
                {/* Cover Image upload for all bonus types */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Cover Image
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => updateBonusSection(index, 'coverImage', e.target.files?.[0] || null)}
                    className="w-full"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Upload an image to display for this bonus item
                  </p>
                  {item.coverImage && (
                    <p className="text-xs text-green-600 mt-1">
                      Selected cover image: {item.coverImage.name}
                    </p>
                  )}
                  {!item.coverImage && item.coverImagePath && (
                    <div className="mt-2">
                      <p className="text-xs text-blue-600 mb-1">Current cover image:</p>
                      <img 
                        src={item.coverImagePath} 
                        alt={`Cover for ${item.title}`} 
                        className="h-16 w-auto object-contain"
                      />
                    </div>
                  )}
                </div>

                {/* File upload for non-text bonus types */}
                {item.type && item.type !== 'text' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      File Upload
                    </label>
                    <input
                      type="file"
                      accept={
                        item.type === 'pdf' ? '.pdf' :
                        item.type === 'audio' ? 'audio/*' :
                        item.type === 'video' ? 'video/*' : '*/*'
                      }
                      onChange={(e) => updateBonusSection(index, 'file', e.target.files?.[0] || null)}
                      className="w-full"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      {item.type === 'pdf' ? 'Upload a PDF document' :
                       item.type === 'audio' ? 'Upload an audio file (MP3, WAV, etc.)' :
                       item.type === 'video' ? 'Upload a video file (MP4, etc.)' : ''}
                    </p>
                    {item.file && (
                      <p className="text-xs text-green-600 mt-1">
                        Selected file: {item.file.name}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
