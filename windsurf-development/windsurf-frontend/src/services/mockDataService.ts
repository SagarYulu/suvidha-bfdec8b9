
// Mock data service for standalone operation - no external dependencies
export class MockDataService {
  private static instance: MockDataService;
  private data: any = {};

  private constructor() {
    this.initializeMockData();
  }

  public static getInstance(): MockDataService {
    if (!MockDataService.instance) {
      MockDataService.instance = new MockDataService();
    }
    return MockDataService.instance;
  }

  private initializeMockData() {
    this.data = {
      users: [
        { id: '1', name: 'John Doe', email: 'john@example.com', role: 'Admin' },
        { id: '2', name: 'Jane Smith', email: 'jane@example.com', role: 'Manager' },
        { id: '3', name: 'Bob Wilson', email: 'bob@example.com', role: 'Agent' }
      ],
      issues: [
        {
          id: '1',
          title: 'Login Issue',
          description: 'Users cannot log in to the system',
          status: 'open',
          priority: 'high',
          assignedTo: 'John Doe',
          createdAt: '2024-01-15',
          employeeUuid: 'emp-001'
        }
      ],
      analytics: {
        totalIssues: 150,
        openIssues: 45,
        resolvedIssues: 90,
        avgResolutionTime: 2.5
      },
      notifications: [
        {
          id: '1',
          message: 'New issue assigned to you',
          type: 'info',
          isRead: false,
          createdAt: new Date().toISOString()
        }
      ]
    };
  }

  // Generic CRUD operations
  public getAll(entityType: string) {
    return Promise.resolve(this.data[entityType] || []);
  }

  public getById(entityType: string, id: string) {
    const items = this.data[entityType] || [];
    return Promise.resolve(items.find(item => item.id === id));
  }

  public create(entityType: string, item: any) {
    if (!this.data[entityType]) {
      this.data[entityType] = [];
    }
    const newItem = { ...item, id: Date.now().toString() };
    this.data[entityType].push(newItem);
    return Promise.resolve(newItem);
  }

  public update(entityType: string, id: string, updates: any) {
    if (!this.data[entityType]) return Promise.resolve(null);
    
    const index = this.data[entityType].findIndex(item => item.id === id);
    if (index === -1) return Promise.resolve(null);
    
    this.data[entityType][index] = { ...this.data[entityType][index], ...updates };
    return Promise.resolve(this.data[entityType][index]);
  }

  public delete(entityType: string, id: string) {
    if (!this.data[entityType]) return Promise.resolve(false);
    
    const index = this.data[entityType].findIndex(item => item.id === id);
    if (index === -1) return Promise.resolve(false);
    
    this.data[entityType].splice(index, 1);
    return Promise.resolve(true);
  }

  // Export functionality
  public exportData(entityType: string, format: 'csv' | 'excel') {
    const data = this.data[entityType] || [];
    
    if (format === 'csv') {
      const csv = this.convertToCSV(data);
      this.downloadFile(csv, `${entityType}-export.csv`, 'text/csv');
    } else {
      // Simple Excel-like format (tab-separated)
      const tsv = this.convertToTSV(data);
      this.downloadFile(tsv, `${entityType}-export.xlsx`, 'application/vnd.ms-excel');
    }
  }

  private convertToCSV(data: any[]): string {
    if (data.length === 0) return '';
    
    const headers = Object.keys(data[0]);
    const csvRows = [
      headers.join(','),
      ...data.map(row => 
        headers.map(header => JSON.stringify(row[header] || '')).join(',')
      )
    ];
    
    return csvRows.join('\n');
  }

  private convertToTSV(data: any[]): string {
    if (data.length === 0) return '';
    
    const headers = Object.keys(data[0]);
    const tsvRows = [
      headers.join('\t'),
      ...data.map(row => 
        headers.map(header => (row[header] || '').toString()).join('\t')
      )
    ];
    
    return tsvRows.join('\n');
  }

  private downloadFile(content: string, filename: string, contentType: string) {
    const blob = new Blob([content], { type: contentType });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  }
}

export const mockDataService = MockDataService.getInstance();
