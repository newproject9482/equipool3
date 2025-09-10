// Quick test script to verify backend connection
// Run this in browser console on your hosted website

async function testBackendConnection() {
  const backendUrl = 'https://equipool3-production.up.railway.app';
  
  console.log('Testing backend connection...');
  
  try {
    // Test 1: Basic connectivity
    console.log('1. Testing basic connectivity...');
    const healthResponse = await fetch(`${backendUrl}/api/auth/me`, {
      method: 'GET',
      credentials: 'include'
    });
    console.log('Health check status:', healthResponse.status);
    
    // Test 2: Authentication check
    console.log('2. Testing authentication...');
    const authData = await healthResponse.json();
    console.log('Auth response:', authData);
    
    // Test 3: Test pool creation endpoint (will fail with 401 if not authenticated)
    console.log('3. Testing pool creation endpoint...');
    const poolResponse = await fetch(`${backendUrl}/api/pools`, {
      method: 'GET',
      credentials: 'include'
    });
    console.log('Pools endpoint status:', poolResponse.status);
    
    if (poolResponse.ok) {
      const poolData = await poolResponse.json();
      console.log('Pools data:', poolData);
    } else {
      console.log('Pools endpoint failed - likely not authenticated');
    }
    
  } catch (error) {
    console.error('Connection test failed:', error);
  }
}

// Run the test
testBackendConnection();
