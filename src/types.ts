export interface MockEndpoint {
  id: string;
  name: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  path: string;
  statusCode: number;
  headers: Record<string, string>;
  responseBody: string;
  contentType: 'application/json' | 'text/plain' | 'application/xml' | 'text/html';
  delay: number;
  isActive: boolean;
  createdAt: string;
}

export interface RequestLog {
  id: string;
  endpointId: string;
  method: string;
  path: string;
  headers: Record<string, string>;
  body: string;
  timestamp: string;
  responseStatus: number;
  responseTime: number;
}