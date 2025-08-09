import React from 'react';
import { RequestLog as RequestLogType } from '../types';
import { Clock, Eye } from 'lucide-react';

interface RequestLogProps {
  logs: RequestLogType[];
  onViewRequest: (log: RequestLogType) => void;
}

const methodColors = {
  GET: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  POST: 'bg-blue-50 text-blue-700 border-blue-200',
  PUT: 'bg-amber-50 text-amber-700 border-amber-200',
  DELETE: 'bg-red-50 text-red-700 border-red-200',
  PATCH: 'bg-purple-50 text-purple-700 border-purple-200',
};

const statusColors = (status: number) => {
  if (status >= 200 && status < 300) return 'text-emerald-600 bg-emerald-50';
  if (status >= 300 && status < 400) return 'text-amber-600 bg-amber-50';
  if (status >= 400 && status < 500) return 'text-orange-600 bg-orange-50';
  if (status >= 500) return 'text-red-600 bg-red-50';
  return 'text-gray-600 bg-gray-50';
};

export function RequestLog({ logs, onViewRequest }: RequestLogProps) {
  if (logs.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
        <Clock size={48} className="mx-auto text-gray-300 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No requests yet</h3>
        <p className="text-gray-500">
          Start making requests to your endpoints to see logs here
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200">
      <div className="p-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">Recent Requests</h3>
      </div>
      <div className="divide-y divide-gray-100">
        {logs.slice(0, 20).map((log) => (
          <div key={log.id} className="p-4 hover:bg-gray-50 transition-colors">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-3">
                <span className={`px-2 py-1 rounded text-xs font-medium border ${methodColors[log.method as keyof typeof methodColors] || 'bg-gray-100 text-gray-700 border-gray-200'}`}>
                  {log.method}
                </span>
                <code className="text-sm font-mono text-gray-700">{log.path}</code>
              </div>
              <div className="flex items-center gap-2">
                <span className={`px-2 py-1 rounded text-xs font-medium ${statusColors(log.responseStatus)}`}>
                  {log.responseStatus}
                </span>
                <span className="text-xs text-gray-500">{log.responseTime}ms</span>
                <button
                  onClick={() => onViewRequest(log)}
                  className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                  title="View request details"
                >
                  <Eye size={16} />
                </button>
              </div>
            </div>
            <div className="text-xs text-gray-500">
              {new Date(log.timestamp).toLocaleString()}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}