import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Stats } from './components/Stats';
import { EndpointCard } from './components/EndpointCard';
import { EndpointForm } from './components/EndpointForm';
import { RequestLog } from './components/RequestLog';
import { RequestDetails } from './components/RequestDetails';
import { MockEndpoint, RequestLog as RequestLogType } from './types';
import { useLocalStorage } from './hooks/useLocalStorage';
import { Search, Filter, Download, Upload } from 'lucide-react';

function App() {
  const [endpoints, setEndpoints] = useLocalStorage<MockEndpoint[]>('mockflow-endpoints', []);
  const [logs, setLogs] = useLocalStorage<RequestLogType[]>('mockflow-logs', []);
  const [showForm, setShowForm] = useState(false);
  const [editingEndpoint, setEditingEndpoint] = useState<MockEndpoint | undefined>();
  const [selectedRequest, setSelectedRequest] = useState<RequestLogType | undefined>();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterMethod, setFilterMethod] = useState('');

  // Simulate request logs for demonstration
  useEffect(() => {
    const simulateRequest = () => {
      if (endpoints.length === 0) return;
      
      const activeEndpoints = endpoints.filter(e => e.isActive);
      if (activeEndpoints.length === 0) return;

      const randomEndpoint = activeEndpoints[Math.floor(Math.random() * activeEndpoints.length)];
      const methods = ['GET', 'POST', 'PUT', 'DELETE'];
      const randomMethod = methods[Math.floor(Math.random() * methods.length)];
      
      const newLog: RequestLogType = {
        id: Date.now().toString(),
        endpointId: randomEndpoint.id,
        method: randomMethod,
        path: randomEndpoint.path,
        headers: {
          'content-type': 'application/json',
          'user-agent': 'MockFlow-Client/1.0',
        },
        body: randomMethod === 'POST' || randomMethod === 'PUT' 
          ? JSON.stringify({ data: 'sample request' }, null, 2)
          : '',
        timestamp: new Date().toISOString(),
        responseStatus: randomEndpoint.statusCode,
        responseTime: Math.floor(Math.random() * 500) + 50,
      };

      setLogs(prev => [newLog, ...prev].slice(0, 100)); // Keep last 100 logs
    };

    const interval = setInterval(simulateRequest, 10000); // Simulate request every 10 seconds
    return () => clearInterval(interval);
  }, [endpoints, setLogs]);

  const handleSaveEndpoint = (endpointData: Omit<MockEndpoint, 'id' | 'createdAt'>) => {
    if (editingEndpoint) {
      setEndpoints(prev => prev.map(e => 
        e.id === editingEndpoint.id 
          ? { ...endpointData, id: editingEndpoint.id, createdAt: editingEndpoint.createdAt }
          : e
      ));
    } else {
      const newEndpoint: MockEndpoint = {
        ...endpointData,
        id: Date.now().toString(),
        createdAt: new Date().toISOString(),
      };
      setEndpoints(prev => [...prev, newEndpoint]);
    }
    setShowForm(false);
    setEditingEndpoint(undefined);
  };

  const handleDeleteEndpoint = (id: string) => {
    if (confirm('Are you sure you want to delete this endpoint?')) {
      setEndpoints(prev => prev.filter(e => e.id !== id));
      setLogs(prev => prev.filter(log => log.endpointId !== id));
    }
  };

  const handleToggleActive = (id: string) => {
    setEndpoints(prev => prev.map(e => 
      e.id === id ? { ...e, isActive: !e.isActive } : e
    ));
  };

  const handleEditEndpoint = (endpoint: MockEndpoint) => {
    setEditingEndpoint(endpoint);
    setShowForm(true);
  };

  const getRequestCount = (endpointId: string) => {
    return logs.filter(log => log.endpointId === endpointId).length;
  };

  const exportData = () => {
    const data = { endpoints, logs };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'mockflow-backup.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const importData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);
        if (data.endpoints && data.logs) {
          setEndpoints(data.endpoints);
          setLogs(data.logs);
        }
      } catch (error) {
        alert('Invalid backup file format');
      }
    };
    reader.readAsText(file);
    event.target.value = '';
  };

  const filteredEndpoints = endpoints.filter(endpoint => {
    const matchesSearch = endpoint.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         endpoint.path.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = !filterMethod || endpoint.method === filterMethod;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <Header onCreateEndpoint={() => setShowForm(true)} />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Stats endpoints={endpoints} logs={logs} />
        
        <div className="flex flex-col lg:flex-row gap-8">
          <div className="flex-1">
            <div className="mb-6 flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Search endpoints..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="flex gap-2">
                <select
                  value={filterMethod}
                  onChange={(e) => setFilterMethod(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Methods</option>
                  <option value="GET">GET</option>
                  <option value="POST">POST</option>
                  <option value="PUT">PUT</option>
                  <option value="DELETE">DELETE</option>
                  <option value="PATCH">PATCH</option>
                </select>
                <button
                  onClick={exportData}
                  className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  title="Export data"
                >
                  <Download size={20} />
                </button>
                <label className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer" title="Import data">
                  <Upload size={20} />
                  <input type="file" accept=".json" onChange={importData} className="hidden" />
                </label>
              </div>
            </div>

            <div className="space-y-4">
              {filteredEndpoints.length === 0 ? (
                <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No endpoints found</h3>
                  <p className="text-gray-500 mb-4">
                    {endpoints.length === 0 
                      ? "Create your first mock endpoint to get started"
                      : "Try adjusting your search or filters"}
                  </p>
                  {endpoints.length === 0 && (
                    <button
                      onClick={() => setShowForm(true)}
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Create Endpoint
                    </button>
                  )}
                </div>
              ) : (
                filteredEndpoints.map(endpoint => (
                  <EndpointCard
                    key={endpoint.id}
                    endpoint={endpoint}
                    onEdit={handleEditEndpoint}
                    onDelete={handleDeleteEndpoint}
                    onToggleActive={handleToggleActive}
                    requestCount={getRequestCount(endpoint.id)}
                  />
                ))
              )}
            </div>
          </div>

          <div className="w-full lg:w-96">
            <RequestLog 
              logs={logs}
              onViewRequest={setSelectedRequest}
            />
          </div>
        </div>
      </main>

      {showForm && (
        <EndpointForm
          endpoint={editingEndpoint}
          onSave={handleSaveEndpoint}
          onCancel={() => {
            setShowForm(false);
            setEditingEndpoint(undefined);
          }}
        />
      )}

      {selectedRequest && (
        <RequestDetails
          request={selectedRequest}
          onClose={() => setSelectedRequest(undefined)}
        />
      )}
    </div>
  );
}

export default App;