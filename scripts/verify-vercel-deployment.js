import axios from 'axios';
import readline from 'readline';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(query) {
  return new Promise(resolve => rl.question(query, resolve));
}

async function verifyDeployment() {
  console.log('🚀 Vercel Deployment Verification Tool\n');
  
  const url = await question('Enter your Vercel URL (e.g., https://your-app.vercel.app): ');
  const baseURL = url.trim().replace(/\/$/, '');
  const apiURL = `${baseURL}/api`;
  
  console.log(`\n📍 Testing: ${baseURL}\n`);
  
  const tests = [];
  let passed = 0;
  let failed = 0;

  // Test 1: Homepage
  console.log('1️⃣  Testing Homepage...');
  try {
    const response = await axios.get(baseURL, { timeout: 10000 });
    if (response.status === 200 && response.data.includes('BODH SCRIPT CLUB')) {
      console.log('   ✅ Homepage loads correctly');
      passed++;
    } else {
      console.log('   ⚠️  Homepage loads but content might be wrong');
      passed++;
    }
  } catch (error) {
    console.log('   ❌ Homepage failed:', error.message);
    failed++;
  }

  // Test 2: Health Check
  console.log('\n2️⃣  Testing API Health...');
  try {
    const response = await axios.get(`${apiURL}/health`, { timeout: 5000 });
    if (response.data.status === 'ok') {
      console.log('   ✅ API is healthy');
      console.log('   📊 Response:', JSON.stringify(response.data));
      passed++;
    } else {
      console.log('   ⚠️  API responded but status unclear');
      failed++;
    }
  } catch (error) {
    console.log('   ❌ Health check failed:', error.message);
    console.log('   💡 Check: Environment variables set in Vercel?');
    failed++;
  }

  // Test 3: Events API
  console.log('\n3️⃣  Testing Events API...');
  try {
    const response = await axios.get(`${apiURL}/events`, { timeout: 10000 });
    if (Array.isArray(response.data)) {
      console.log(`   ✅ Events API works (${response.data.length} events)`);
      passed++;
    } else {
      console.log('   ⚠️  Events API responded but format unexpected');
      failed++;
    }
  } catch (error) {
    console.log('   ❌ Events API failed:', error.message);
    console.log('   💡 Check: MONGODB_URI set in Vercel?');
    failed++;
  }

  // Test 4: Members API
  console.log('\n4️⃣  Testing Members API...');
  try {
    const response = await axios.get(`${apiURL}/members`, { timeout: 10000 });
    if (Array.isArray(response.data)) {
      console.log(`   ✅ Members API works (${response.data.length} members)`);
      passed++;
    } else {
      console.log('   ⚠️  Members API responded but format unexpected');
      failed++;
    }
  } catch (error) {
    console.log('   ❌ Members API failed:', error.message);
    failed++;
  }

  // Test 5: Gallery API
  console.log('\n5️⃣  Testing Gallery API...');
  try {
    const response = await axios.get(`${apiURL}/gallery`, { timeout: 10000 });
    if (Array.isArray(response.data)) {
      console.log(`   ✅ Gallery API works (${response.data.length} items)`);
      passed++;
    } else {
      console.log('   ⚠️  Gallery API responded but format unexpected');
      failed++;
    }
  } catch (error) {
    console.log('   ❌ Gallery API failed:', error.message);
    failed++;
  }

  // Test 6: Submissions API
  console.log('\n6️⃣  Testing Submissions API...');
  try {
    const response = await axios.get(`${apiURL}/submissions`, { timeout: 10000 });
    if (Array.isArray(response.data)) {
      console.log(`   ✅ Submissions API works (${response.data.length} submissions)`);
      passed++;
    } else {
      console.log('   ⚠️  Submissions API responded but format unexpected');
      failed++;
    }
  } catch (error) {
    console.log('   ❌ Submissions API failed:', error.message);
    failed++;
  }

  // Test 7: Testimonials API
  console.log('\n7️⃣  Testing Testimonials API...');
  try {
    const response = await axios.get(`${apiURL}/testimonials`, { timeout: 10000 });
    if (Array.isArray(response.data)) {
      console.log(`   ✅ Testimonials API works (${response.data.length} testimonials)`);
      passed++;
    } else {
      console.log('   ⚠️  Testimonials API responded but format unexpected');
      failed++;
    }
  } catch (error) {
    console.log('   ❌ Testimonials API failed:', error.message);
    failed++;
  }

  // Test 8: About API
  console.log('\n8️⃣  Testing About API...');
  try {
    const response = await axios.get(`${apiURL}/about`, { timeout: 5000 });
    if (response.data) {
      console.log('   ✅ About API works');
      passed++;
    } else {
      console.log('   ⚠️  About API responded but no data');
      failed++;
    }
  } catch (error) {
    console.log('   ❌ About API failed:', error.message);
    failed++;
  }

  // Summary
  console.log('\n' + '='.repeat(50));
  console.log('📊 DEPLOYMENT VERIFICATION SUMMARY');
  console.log('='.repeat(50));
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`📈 Success Rate: ${Math.round((passed / (passed + failed)) * 100)}%`);
  console.log('='.repeat(50));

  if (failed === 0) {
    console.log('\n🎉 ALL TESTS PASSED! Your deployment is working perfectly!');
    console.log('\n✅ Next Steps:');
    console.log('   1. Test login at: ' + baseURL + '/login');
    console.log('   2. Test admin panel at: ' + baseURL + '/admin');
    console.log('   3. Test join form at: ' + baseURL + '/join');
    console.log('   4. Test CSV export in admin panel');
  } else {
    console.log('\n⚠️  SOME TESTS FAILED!');
    console.log('\n🔧 Troubleshooting:');
    console.log('   1. Check Vercel Dashboard → Settings → Environment Variables');
    console.log('   2. Ensure MONGODB_URI is set correctly');
    console.log('   3. Ensure JWT_SECRET and JWT_REFRESH_SECRET are set');
    console.log('   4. Ensure VITE_API_URL=/api');
    console.log('   5. Check MongoDB Atlas → Network Access (allow 0.0.0.0/0)');
    console.log('   6. Redeploy after setting environment variables');
  }

  console.log('\n📚 Full deployment guide: See DEPLOYMENT_GUIDE.md\n');
  
  rl.close();
}

verifyDeployment().catch(error => {
  console.error('❌ Verification failed:', error.message);
  rl.close();
  process.exit(1);
});
