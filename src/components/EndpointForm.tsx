import React, { useState } from 'react';
import { MockEndpoint } from '../types';
import { X, Save } from 'lucide-react';

interface EndpointFormProps {
  endpoint?: MockEndpoint;
  onSave: (endpoint: Omit<MockEndpoint, 'id' | 'createdAt'>) => void;
  onCancel: () => void;
}

export function EndpointForm({ endpoint, onSave, onCancel }: EndpointFormProps) {
  const [formData, setFormData] = useState({
    name: endpoint?.name || '',
    method: endpoint?.method || 'GET' as const,
    path: endpoint?.path || '/',
    statusCode: endpoint?.statusCode || 200,
    headers: endpoint?.headers || {},
    responseBody: endpoint?.responseBody || '',
    contentType: endpoint?.contentType || 'application/json' as const,
    delay: endpoint?.delay || 0,
    isActive: endpoint?.isActive ?? true,
  });

  const [customHeader, setCustomHeader] = useState({ key: '', value: '' });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  const addCustomHeader = () => {
    if (customHeader.key && customHeader.value) {
      setFormData(prev => ({
        ...prev,
        headers: {
          ...prev.headers,
          [customHeader.key]: customHeader.value
        }
      }));
      setCustomHeader({ key: '', value: '' });
    }
  };

  const removeHeader = (key: string) => {
    setFormData(prev => ({
      ...prev,
      headers: Object.fromEntries(
        Object.entries(prev.headers).filter(([k]) => k !== key)
      )
    }));
  };

  const formatJson = () => {
    try {
      const parsed = JSON.parse(formData.responseBody);
      setFormData(prev => ({
        ...prev,
        responseBody: JSON.stringify(parsed, null, 2)
      }));
    } catch (error) {
      // Invalid JSON, leave as is
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] overflow-auto m-4">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            {endpoint ? 'Edit Endpoint' : 'Create New Endpoint'}
          </h2>
          <button
            onClick={onCancel}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Endpoint Name
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="My API Endpoint"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                HTTP Method
              </label>
              <select
                value={formData.method}
                onChange={(e) => setFormData(prev => ({ ...prev, method: e.target.value as any }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="GET">GET</option>
                <option value="POST">POST</option>
                <option value="PUT">PUT</option>
                <option value="DELETE">DELETE</option>
                <option value="PATCH">PATCH</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Path
            </label>
            <input
              type="text"
              required
              value={formData.path}
              onChange={(e) => setFormData(prev => ({ ...prev, path: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="/api/users"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status Code
              </label>
              <input
                type="number"
                min="100"
                max="599"
                value={formData.statusCode}
                onChange={(e) => setFormData(prev => ({ ...prev, statusCode: parseInt(e.target.value) }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Content Type
              </label>
              <select
                value={formData.contentType}
                onChange={(e) => setFormData(prev => ({ ...prev, contentType: e.target.value as any }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="application/json">JSON</option>
                <option value="text/plain">Plain Text</option>
                <option value="application/xml">XML</option>
                <option value="text/html">HTML</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Delay (ms)
              </label>
              <input
                type="number"
                min="0"
                value={formData.delay}
                onChange={(e) => setFormData(prev => ({ ...prev, delay: parseInt(e.target.value) || 0 }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Custom Headers
            </label>
            <div className="space-y-2">
              {Object.entries(formData.headers).map(([key, value]) => (
                <div key={key} className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                  <code className="text-sm font-mono text-gray-700 flex-1">
                    {key}: {value}
                  </code>
                  <button
                    type="button"
                    onClick={() => removeHeader(key)}
                    className="p-1 text-red-500 hover:bg-red-100 rounded"
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Header name"
                  value={customHeader.key}
                  onChange={(e) => setCustomHeader(prev => ({ ...prev, key: e.target.value }))}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <input
                  type="text"
                  placeholder="Header value"
                  value={customHeader.value}
                  onChange={(e) => setCustomHeader(prev => ({ ...prev, value: e.target.value }))}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  type="button"
                  onClick={addCustomHeader}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Add
                </button>
              </div>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-700">
                Response Body
              </label>
              {formData.contentType === 'application/json' && (
                <button
                  type="button"
                  onClick={formatJson}
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  Format JSON
                </button>
              )}
            </div>
            <textarea
              value={formData.responseBody}
              onChange={(e) => setFormData(prev => ({ ...prev, responseBody: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
              rows={8}
              placeholder={formData.contentType === 'application/json' ? '{\n  "message": "Hello World"\n}' : 'Response content...'}
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="isActive"
              checked={formData.isActive}
              onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <label htmlFor="isActive" className="text-sm text-gray-700">
              Enable endpoint immediately
            </label>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <Save size={16} />
              {endpoint ? 'Update Endpoint' : 'Create Endpoint'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}