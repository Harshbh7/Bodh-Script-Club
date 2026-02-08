import axios from 'axios';
import fs from 'fs';

const API_URL = process.env.API_URL || 'http://localhost:5000/api';

async function testCSVExport() {
  console.log('Testing CSV Export...\n');

  try {
    // 1. Fetch submissions to see what data exists
    console.log('1. Checking submissions data...');
    const { data: submissions } = await axios.get(`${API_URL}/submissions`);
    console.log(`   ✓ Found ${submissions.length} submissions`);
    
    if (submissions.length === 0) {
      console.log('   ⚠ No submissions found. Create some in the Join Us page first.');
      return;
    }

    // Show sample data
    console.log('\n2. Sample submission data:');
    const sample = submissions[0];
    console.log(`   - Name: ${sample.name}`);
    console.log(`   - Email: ${sample.email}`);
    console.log(`   - Registration Number: ${sample.registrationNumber}`);
    console.log(`   - Phone: ${sample.phone}`);
    console.log(`   - Course: ${sample.course}`);
    console.log(`   - Status: ${sample.status}`);

    // 2. Test CSV export
    console.log('\n3. Testing CSV export...');
    const response = await axios.get(`${API_URL}/submissions/export`, {
      responseType: 'text'
    });
    
    console.log(`   ✓ Export successful`);
    console.log(`   - Content-Type: ${response.headers['content-type']}`);
    console.log(`   - Content-Disposition: ${response.headers['content-disposition']}`);
    console.log(`   - Data length: ${response.data.length} characters`);

    // 3. Verify CSV structure
    console.log('\n4. Verifying CSV structure...');
    const lines = response.data.split('\n');
    console.log(`   - Total lines: ${lines.length}`);
    console.log(`   - Header: ${lines[0]}`);
    
    if (lines.length > 1) {
      console.log(`   - First data row: ${lines[1].substring(0, 100)}...`);
    }

    // 4. Check for required fields in header
    const header = lines[0];
    const requiredFields = [
      'Name', 'Email', 'Registration Number', 'Phone', 'WhatsApp',
      'Course', 'Section', 'Year', 'Batch', 'GitHub', 'Status', 'Submitted At'
    ];
    
    console.log('\n5. Checking required fields:');
    requiredFields.forEach(field => {
      if (header.includes(field)) {
        console.log(`   ✓ ${field}`);
      } else {
        console.log(`   ✗ ${field} - MISSING!`);
      }
    });

    // 5. Save to file for inspection
    const filename = `test-export-${new Date().toISOString().split('T')[0]}.csv`;
    fs.writeFileSync(filename, response.data, 'utf8');
    console.log(`\n6. CSV saved to: ${filename}`);
    console.log('   Open this file in Excel to verify formatting');

    console.log('\n✅ CSV Export Test Complete!');
    console.log('\n📌 Next Steps:');
    console.log('   1. Open the CSV file in Excel');
    console.log('   2. Verify all columns are present');
    console.log('   3. Check that data is properly formatted');
    console.log('   4. Test the export button in Admin Panel');

  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.response) {
      console.error('   Status:', error.response.status);
      console.error('   Data:', error.response.data);
    }
  }
}

testCSVExport();
