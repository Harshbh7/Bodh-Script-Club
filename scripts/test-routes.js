#!/usr/bin/env node

// Test script to verify API routes are properly defined
console.log('🧪 Testing API Route Definitions...\n');

// Import the handlers from the API file
import fs from 'fs';

const apiContent = fs.readFileSync('api/index.js', 'utf8');

// Extract route definitions
const routeMatches = apiContent.match(/'[A-Z]+ \/[^']+'/g) || [];
const routes = routeMatches.map(r => r.replace(/'/g, ''));

console.log('📋 Defined API Routes:');
routes.forEach((route, index) => {
  console.log(`${index + 1}. ${route}`);
});

console.log(`\n🎯 Total Routes: ${routes.length}`);

// Check for admin-specific routes
const adminRoutes = [
  'GET /testimonials/all',
  'GET /submissions',
  'GET /submissions/check/:regNo',
  'PUT /testimonials/:id',
  'DELETE /testimonials/:id',
  'PUT /submissions/:id',
  'POST /events',
  'PUT /events/:id',
  'DELETE /events/:id',
  'POST /members',
  'PUT /members/:id',
  'DELETE /members/:id'
];

console.log('\n✅ Admin Panel Route Check:');
adminRoutes.forEach(route => {
  const exists = routes.includes(route);
  const icon = exists ? '✅' : '❌';
  console.log(`${icon} ${route}`);
});

const missingRoutes = adminRoutes.filter(route => !routes.includes(route));
if (missingRoutes.length === 0) {
  console.log('\n🎉 All admin routes are properly defined!');
} else {
  console.log(`\n⚠️ Missing ${missingRoutes.length} admin routes:`);
  missingRoutes.forEach(route => console.log(`   - ${route}`));
}

console.log('\n✅ Route verification complete!');