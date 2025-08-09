import React from 'react';
import { MockEndpoint, RequestLog } from '../types';
import { Activity, Server, Clock, CheckCircle } from 'lucide-react';

interface StatsProps {
  endpoints: MockEndpoint[];
  logs: RequestLog[];
}

export function Stats({ endpoints, logs }: StatsProps) {
  const activeEndpoints = endpoints.filter(e => e.isActive).length;
  const totalRequests = logs.length;
  const recentRequests = logs.filter(
    log => Date.now() - new Date(log.timestamp).getTime() < 24 * 60 * 60 * 1000
  ).length;
  const avgResponseTime = logs.length > 0 
    ? Math.round(logs.reduce((sum, log) => sum + log.responseTime, 0) / logs.length)
    : 0;

  const stats = [
    {
      name: 'Total Endpoints',
      value: endpoints.length,
      icon: Server,
      color: 'text-blue-600 bg-blue-100',
    },
    {
      name: 'Active Endpoints',
      value: activeEndpoints,
      icon: CheckCircle,
      color: 'text-emerald-600 bg-emerald-100',
    },
    {
      name: 'Total Requests',
      value: totalRequests,
      icon: Activity,
      color: 'text-purple-600 bg-purple-100',
    },
    {
      name: 'Avg Response Time',
      value: `${avgResponseTime}ms`,
      icon: Clock,
      color: 'text-amber-600 bg-amber-100',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {stats.map((stat) => (
        <div key={stat.name} className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${stat.color}`}>
              <stat.icon size={20} />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              <p className="text-sm text-gray-600">{stat.name}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}