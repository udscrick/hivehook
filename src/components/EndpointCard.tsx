import React from 'react';
import { MockEndpoint } from '../types';
import { Edit, Trash2, Play, Pause, Copy } from 'lucide-react';

interface EndpointCardProps {
  endpoint: MockEndpoint;
  onEdit: (endpoint: MockEndpoint) => void;
  onDelete: (id: string) => void;
  onToggleActive: (id: string) => void;
  requestCount: number;
}

const methodColors = {
  GET: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  POST: 'bg-blue-100 text-blue-700 border-blue-200',
  PUT: 'bg-amber-100 text-amber-700 border-amber-200',
  DELETE: 'bg-red-100 text-red-700 border-red-200',
  PATCH: 'bg-purple-100 text-purple-700 border-purple-200',
};

export function EndpointCard({ endpoint, onEdit, onDelete, onToggleActive, requestCount }: EndpointCardProps) {
  const copyEndpointUrl = () => {
    const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    const base = isLocal ? 'http://localhost:3000' : window.location.origin;
    const url = `${base}/api${endpoint.path}`;
    navigator.clipboard.writeText(url);
  };

  return (
    <div className={`bg-white rounded-xl border transition-all duration-200 hover:shadow-lg ${
      endpoint.isActive ? 'border-gray-200' : 'border-gray-300 opacity-75'
    }`}>
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <span className={`px-3 py-1 rounded-full text-xs font-medium border ${methodColors[endpoint.method]}`}>
              {endpoint.method}
            </span>
            <h3 className="font-semibold text-gray-900">{endpoint.name}</h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => onToggleActive(endpoint.id)}
              className={`p-2 rounded-lg transition-colors ${
                endpoint.isActive 
                  ? 'text-emerald-600 hover:bg-emerald-50' 
                  : 'text-gray-400 hover:bg-gray-50'
              }`}
              title={endpoint.isActive ? 'Disable endpoint' : 'Enable endpoint'}
            >
              {endpoint.isActive ? <Play size={16} /> : <Pause size={16} />}
            </button>
            <button
              onClick={() => onEdit(endpoint)}
              className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              title="Edit endpoint"
            >
              <Edit size={16} />
            </button>
            <button
              onClick={() => onDelete(endpoint.id)}
              className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              title="Delete endpoint"
            >
              <Trash2 size={16} />
            </button>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <code className="bg-gray-100 px-3 py-1 rounded-md text-sm font-mono text-gray-700">
              {endpoint.path}
            </code>
            <button
              onClick={copyEndpointUrl}
              className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
              title="Copy endpoint URL"
            >
              <Copy size={14} />
            </button>
          </div>

          <div className="flex items-center justify-between text-sm text-gray-600">
            <span>Status: <strong>{endpoint.statusCode}</strong></span>
            <span>Requests: <strong>{requestCount}</strong></span>
          </div>

          {endpoint.delay > 0 && (
            <div className="text-sm text-amber-600">
              Delay: {endpoint.delay}ms
            </div>
          )}

          <div className="pt-3 border-t border-gray-100">
            <div className="text-xs text-gray-500 mb-2">Response Preview:</div>
            <div className="bg-gray-50 rounded-md p-3 max-h-20 overflow-hidden">
              <code className="text-xs text-gray-700 font-mono">
                {endpoint.responseBody.length > 100 
                  ? endpoint.responseBody.substring(0, 100) + '...'
                  : endpoint.responseBody || '(empty)'}
              </code>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}