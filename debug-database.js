// Database Debug Script - Run in browser console
// This will help us understand what database the backend is using

async function debugDatabase() {
    console.log('=== DATABASE DEBUG INFO ===');
    
    const backendUrl = 'https://equipool3-production.up.railway.app';
    
    try {
        // Check database health
        console.log('1. Checking database health...');
        const healthResponse = await fetch(`${backendUrl}/api/health/database`);
        const healthData = await healthResponse.json();
        console.log('Database Health:', healthData);
        
        // Test signup with debug email
        console.log('\n2. Testing signup with debug email...');
        const testEmail = `debug-${Date.now()}@test.com`;
        const signupResponse = await fetch(`${backendUrl}/api/borrowers/signup`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                fullName: 'Debug User',
                email: testEmail,
                dateOfBirth: '1990-01-01',
                password: 'password123'
            })
        });
        
        const signupData = await signupResponse.json();
        console.log('Signup Response:', signupData);
        
        if (signupResponse.ok) {
            console.log(`✅ User created with email: ${testEmail}`);
            console.log(`📧 Check your database for this email: ${testEmail}`);
        } else {
            console.log('❌ Signup failed:', signupData);
        }
        
        // Test login with the same credentials
        console.log('\n3. Testing login with the debug email...');
        const loginResponse = await fetch(`${backendUrl}/api/borrowers/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: testEmail,
                password: 'password123'
            })
        });
        
        const loginData = await loginResponse.json();
        console.log('Login Response:', loginData);
        
    } catch (error) {
        console.error('Debug error:', error);
    }
}

// Run the debug
debugDatabase();
