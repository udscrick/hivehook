import React from 'react';
import { Plus, Zap } from 'lucide-react';

interface HeaderProps {
  onCreateEndpoint: () => void;
}

export function Header({ onCreateEndpoint }: HeaderProps) {
  return (
    <header className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-blue-500 to-purple-600 p-2 rounded-lg">
              <Zap className="text-white" size={24} />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">MockFlow</h1>
              <p className="text-sm text-gray-500">Modern HTTP Mock Server</p>
            </div>
          </div>
          
          <button
            onClick={onCreateEndpoint}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <Plus size={16} />
            Create Endpoint
          </button>
        </div>
      </div>
    </header>
  );
}