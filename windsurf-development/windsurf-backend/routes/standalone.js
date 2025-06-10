
const express = require('express');
const router = express.Router();

// Mock data storage (in-memory for standalone operation)
let mockData = {
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
    },
    {
      id: '2',
      title: 'Payment Gateway Error',
      description: 'Payment processing is failing',
      status: 'in_progress',
      priority: 'critical',
      assignedTo: 'Jane Smith',
      createdAt: '2024-01-14',
      employeeUuid: 'emp-002'
    }
  ],
  users: [
    { id: '1', name: 'John Doe', email: 'john@example.com', role: 'Admin' },
    { id: '2', name: 'Jane Smith', email: 'jane@example.com', role: 'Manager' }
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

// Generic CRUD endpoints
router.get('/:entityType', (req, res) => {
  const { entityType } = req.params;
  const data = mockData[entityType] || [];
  res.json({ data, total: data.length });
});

router.get('/:entityType/:id', (req, res) => {
  const { entityType, id } = req.params;
  const data = mockData[entityType] || [];
  const item = data.find(item => item.id === id);
  
  if (!item) {
    return res.status(404).json({ error: 'Item not found' });
  }
  
  res.json(item);
});

router.post('/:entityType', (req, res) => {
  const { entityType } = req.params;
  const newItem = {
    ...req.body,
    id: Date.now().toString(),
    createdAt: new Date().toISOString()
  };
  
  if (!mockData[entityType]) {
    mockData[entityType] = [];
  }
  
  mockData[entityType].push(newItem);
  res.status(201).json(newItem);
});

router.put('/:entityType/:id', (req, res) => {
  const { entityType, id } = req.params;
  const data = mockData[entityType] || [];
  const index = data.findIndex(item => item.id === id);
  
  if (index === -1) {
    return res.status(404).json({ error: 'Item not found' });
  }
  
  mockData[entityType][index] = {
    ...mockData[entityType][index],
    ...req.body,
    updatedAt: new Date().toISOString()
  };
  
  res.json(mockData[entityType][index]);
});

router.delete('/:entityType/:id', (req, res) => {
  const { entityType, id } = req.params;
  const data = mockData[entityType] || [];
  const index = data.findIndex(item => item.id === id);
  
  if (index === -1) {
    return res.status(404).json({ error: 'Item not found' });
  }
  
  mockData[entityType].splice(index, 1);
  res.json({ message: 'Item deleted successfully' });
});

// Export endpoints
router.get('/export/:entityType', (req, res) => {
  const { entityType } = req.params;
  const { format = 'csv' } = req.query;
  const data = mockData[entityType] || [];
  
  if (format === 'csv') {
    const csv = convertToCSV(data);
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="${entityType}-export.csv"`);
    res.send(csv);
  } else {
    const tsv = convertToTSV(data);
    res.setHeader('Content-Type', 'application/vnd.ms-excel');
    res.setHeader('Content-Disposition', `attachment; filename="${entityType}-export.xlsx"`);
    res.send(tsv);
  }
});

// Helper functions
function convertToCSV(data) {
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

function convertToTSV(data) {
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

module.exports = router;
