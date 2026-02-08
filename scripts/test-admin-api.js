#!/usr/bin/env node

// Test script for admin API endpoints
import { createServer } from 'http';
import apiHandler from '../api/index.js';

console.log('🧪 Testing Admin API Endpoints...\n');

// Create a test server
const server = createServer(async (req, res) => {
  // Add the /api prefix to match our handler
  req.url = '/api' + req.url;
  await apiHandler(req, res);
});

const PORT = 3001;
server.listen(PORT, () => {
  console.log(`🚀 Test server running on http://localhost:${PORT}`);
  runTests();
});

async function runTests() {
  const baseUrl = `http://localhost:${PORT}`;
  
  const tests = [
    { method: 'GET', path: '/testimonials/all', description: 'Get all testimonials (admin)' },
    { method: 'GET', path: '/submissions', description: 'Get all submissions' },
    { method: 'GET', path: '/submissions/check/21BCS001', description: 'Check registration number' },
    { method: 'GET', path: '/members', description: 'Get all members' },
    { method: 'GET', path: '/events', description: 'Get all events' },
    { method: 'GET', path: '/gallery', description: 'Get gallery items' },
    { method: 'GET', path: '/about', description: 'Get about data' },
    { method: 'GET', path: '/health', description: 'Health check' }
  ];

  for (const test of tests) {
    try {
      const response = await fetch(`${baseUrl}${test.path}`, {
        method: test.method,
        headers: { 'Content-Type': 'application/json' }
      });
      
      const status = response.status;
      const statusIcon = status === 200 ? '✅' : '❌';
      
      console.log(`${statusIcon} ${test.method} ${test.path} - ${status} - ${test.description}`);
      
      if (status !== 200) {
        const errorText = await response.text();
        console.log(`   Error: ${errorText.substring(0, 100)}...`);
      }
    } catch (error) {
      console.log(`❌ ${test.method} ${test.path} - ERROR - ${error.message}`);
    }
  }
  
  console.log('\n🎯 Test completed!');
  server.close();
  process.exit(0);
}

// Handle server errors
server.on('error', (error) => {
  console.error('❌ Server error:', error.message);
  process.exit(1);
});