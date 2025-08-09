import React from 'react';
import { RequestLog } from '../types';
import { X, Copy } from 'lucide-react';

interface RequestDetailsProps {
  request: RequestLog;
  onClose: () => void;
}

export function RequestDetails({ request, onClose }: RequestDetailsProps) {
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl w-full max-w-4xl max-h-[90vh] overflow-auto m-4">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Request Details</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-gray-900 mb-2">Request Method & Path</h3>
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                    {request.method}
                  </span>
                  <code className="bg-gray-100 px-2 py-1 rounded text-sm font-mono">
                    {request.path}
                  </code>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-900 mb-2">Timestamp</h3>
                <p className="text-gray-700">{new Date(request.timestamp).toLocaleString()}</p>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-900 mb-2">Response Status</h3>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  request.responseStatus >= 200 && request.responseStatus < 300
                    ? 'bg-emerald-100 text-emerald-700'
                    : request.responseStatus >= 400
                    ? 'bg-red-100 text-red-700'
                    : 'bg-amber-100 text-amber-700'
                }`}>
                  {request.responseStatus}
                </span>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-900 mb-2">Response Time</h3>
                <p className="text-gray-700">{request.responseTime}ms</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-medium text-gray-900">Request Headers</h3>
                  <button
                    onClick={() => copyToClipboard(JSON.stringify(request.headers, null, 2))}
                    className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                    title="Copy headers"
                  >
                    <Copy size={16} />
                  </button>
                </div>
                <div className="bg-gray-50 rounded-lg p-3 max-h-32 overflow-y-auto">
                  {Object.entries(request.headers).length > 0 ? (
                    <pre className="text-xs font-mono text-gray-700">
                      {Object.entries(request.headers)
                        .map(([key, value]) => `${key}: ${value}`)
                        .join('\n')}
                    </pre>
                  ) : (
                    <p className="text-xs text-gray-500">No headers</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-900">Request Body</h3>
              {request.body && (
                <button
                  onClick={() => copyToClipboard(request.body)}
                  className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                  title="Copy body"
                >
                  <Copy size={16} />
                </button>
              )}
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              {request.body ? (
                <pre className="text-sm font-mono text-gray-700 whitespace-pre-wrap">
                  {request.body}
                </pre>
              ) : (
                <p className="text-sm text-gray-500">No request body</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}