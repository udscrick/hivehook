import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Stats } from './components/Stats';
import { EndpointCard } from './components/EndpointCard';
import { EndpointForm } from './components/EndpointForm';
import { RequestLog } from './components/RequestLog';
import { RequestDetails } from './components/RequestDetails';
import { MockEndpoint, RequestLog as RequestLogType } from './types';
import { Search, Download, Upload } from 'lucide-react';
import {
  getEndpoints,
  getLogs,
  createEndpoint,
  updateEndpoint,
  deleteEndpoint,
} from './api';

function App() {
  const [endpoints, setEndpoints] = useState<MockEndpoint[]>([]);
  const [logs, setLogs] = useState<RequestLogType[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingEndpoint, setEditingEndpoint] = useState<MockEndpoint | undefined>();
  const [selectedRequest, setSelectedRequest] = useState<RequestLogType | undefined>();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterMethod, setFilterMethod] = useState('');

  // Initial load
  useEffect(() => {
    (async () => {
      try {
        const [eps, ls] = await Promise.all([getEndpoints(), getLogs(200)]);
        setEndpoints(eps);
        setLogs(ls);
      } catch (e) {
        console.error('Failed to load data', e);
      }
    })();
  }, []);

  // Poll logs (simple M1 approach)
  useEffect(() => {
    const id = setInterval(async () => {
      try {
        const ls = await getLogs(200);
        setLogs(ls);
      } catch {
        // ignore transient errors
      }
    }, 3000);
    return () => clearInterval(id);
  }, []);

  const handleSaveEndpoint = async (endpointData: Omit<MockEndpoint, 'id' | 'createdAt'>) => {
    try {
      if (editingEndpoint) {
        const updated = await updateEndpoint(editingEndpoint.id, endpointData);
        setEndpoints(prev => prev.map(e => (e.id === updated.id ? updated : e)));
      } else {
        const created = await createEndpoint(endpointData);
        setEndpoints(prev => [created, ...prev]);
      }
      setShowForm(false);
      setEditingEndpoint(undefined);
    } catch (e) {
      alert(`Failed to save endpoint: ${String((e as Error)?.message || e)}`);
    }
  };

  const handleDeleteEndpoint = async (id: string) => {
    if (!confirm('Are you sure you want to delete this endpoint?')) return;
    try {
      await deleteEndpoint(id);
      setEndpoints(prev => prev.filter(e => e.id !== id));
      setLogs(prev => prev.filter(log => log.endpointId !== id));
    } catch (e) {
      alert(`Failed to delete endpoint: ${String((e as Error)?.message || e)}`);
    }
  };

  const handleToggleActive = async (id: string) => {
    const target = endpoints.find(e => e.id === id);
    if (!target) return;
    try {
      const updated = await updateEndpoint(id, { isActive: !target.isActive });
      setEndpoints(prev => prev.map(e => (e.id === id ? updated : e)));
    } catch (e) {
      alert(`Failed to toggle endpoint: ${String((e as Error)?.message || e)}`);
    }
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
    a.download = 'waspceptor-backup.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const importData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);
        if (Array.isArray(data.endpoints)) {
          // For M1 simplicity: recreate endpoints locally and POST them
          const created: MockEndpoint[] = [];
          for (const ep of data.endpoints) {
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const { id, createdAt, ...rest } = ep as MockEndpoint;
            try {
              const newEp = await createEndpoint(rest as Omit<MockEndpoint, 'id' | 'createdAt'>);
              created.push(newEp);
            } catch {/* skip */}
          }
          setEndpoints(created);
        }
        if (Array.isArray(data.logs)) {
          setLogs(data.logs);
        }
      } catch (_err) {
        console.log("Error: ",_err)
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