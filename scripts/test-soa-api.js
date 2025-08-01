const fetch = require('node-fetch');

async function testSoAAPI() {
  const baseUrl = 'http://localhost:3000';
  
  console.log('Testing SoA API endpoints...\n');

  try {
    // Test GET /api/compliance/soa
    console.log('1. Testing GET /api/compliance/soa');
    const getResponse = await fetch(`${baseUrl}/api/compliance/soa`);
    const getData = await getResponse.json();
    
    if (getResponse.ok && getData.success) {
      console.log(`✅ Success: Retrieved ${getData.data.length} controls`);
      console.log(`   Sample control: ${getData.data[0]?.id} - ${getData.data[0]?.title}`);
    } else {
      console.log('❌ Failed to retrieve controls');
      console.log('   Error:', getData.error);
    }

    // Test POST /api/compliance/soa (create a new control)
    console.log('\n2. Testing POST /api/compliance/soa');
    const newControl = {
      id: 'A.5.38',
      title: 'Test Control',
      description: 'This is a test control for API testing',
      status: 'not-implemented',
      justification: 'Test justification',
      implementationNotes: 'Test implementation notes',
      controlSetId: 'A.5',
      controlSetTitle: 'Organizational Controls',
      controlSetDescription: 'Controls that set the organizational context for information security'
    };

    const postResponse = await fetch(`${baseUrl}/api/compliance/soa`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(newControl)
    });
    
    const postData = await postResponse.json();
    
    if (postResponse.ok && postData.success) {
      console.log('✅ Success: Created new control');
      console.log(`   Control ID: ${postData.data._id}`);
      
      // Test PUT /api/compliance/soa/[id] (update the control)
      console.log('\n3. Testing PUT /api/compliance/soa/[id]');
      const updateData = {
        ...newControl,
        status: 'implemented',
        implementationNotes: 'Updated implementation notes'
      };

      const putResponse = await fetch(`${baseUrl}/api/compliance/soa/${postData.data._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData)
      });
      
      const putResult = await putResponse.json();
      
      if (putResponse.ok && putResult.success) {
        console.log('✅ Success: Updated control');
        console.log(`   New status: ${putResult.data.status}`);
      } else {
        console.log('❌ Failed to update control');
        console.log('   Error:', putResult.error);
      }

      // Test DELETE /api/compliance/soa/[id] (delete the test control)
      console.log('\n4. Testing DELETE /api/compliance/soa/[id]');
      const deleteResponse = await fetch(`${baseUrl}/api/compliance/soa/${postData.data._id}`, {
        method: 'DELETE'
      });
      
      const deleteResult = await deleteResponse.json();
      
      if (deleteResponse.ok && deleteResult.success) {
        console.log('✅ Success: Deleted test control');
      } else {
        console.log('❌ Failed to delete control');
        console.log('   Error:', deleteResult.error);
      }
    } else {
      console.log('❌ Failed to create control');
      console.log('   Error:', postData.error);
    }

  } catch (error) {
    console.error('❌ API test failed:', error.message);
    console.log('\nMake sure your development server is running on http://localhost:3000');
  }
}

testSoAAPI().catch(console.error); 