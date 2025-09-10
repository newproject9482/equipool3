// Debug Script for Testing Backend Connection and Session Management
// Run this in browser console after opening your frontend app

console.log('=== EquiPool Backend Connection Debug ===');

// Test 1: Check current environment
const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';
console.log('Backend URL:', backendUrl);

// Test 2: Check current cookies
console.log('Current cookies:', document.cookie);

// Test 3: Test login function
async function testLogin(email, password, role = 'borrower') {
    console.log('\n=== Testing Login ===');
    try {
        const endpoint = role === 'borrower' ? '/api/borrowers/login' : '/api/investors/login';
        const response = await fetch(`${backendUrl}${endpoint}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify({ email, password })
        });
        
        console.log('Login response status:', response.status);
        console.log('Login response headers:', [...response.headers.entries()]);
        
        const data = await response.json();
        console.log('Login response data:', data);
        
        // Check cookies after login
        console.log('Cookies after login:', document.cookie);
        
        return response.ok;
    } catch (error) {
        console.error('Login error:', error);
        return false;
    }
}

// Test 4: Test auth check
async function testAuthCheck() {
    console.log('\n=== Testing Auth Check ===');
    try {
        const response = await fetch(`${backendUrl}/api/auth/me`, {
            credentials: 'include'
        });
        
        console.log('Auth check status:', response.status);
        console.log('Auth check headers:', [...response.headers.entries()]);
        
        const data = await response.json();
        console.log('Auth check data:', data);
        
        return data;
    } catch (error) {
        console.error('Auth check error:', error);
        return null;
    }
}

// Test 5: Test pool creation
async function testPoolCreation() {
    console.log('\n=== Testing Pool Creation ===');
    try {
        const poolData = {
            poolType: 'equity',
            addressLine: '123 Test St',
            city: 'Test City',
            state: 'CA',
            zipCode: '12345',
            percentOwned: 50,
            amount: 100000,
            roiRate: 5,
            term: '12'
        };
        
        const response = await fetch(`${backendUrl}/api/pools/create`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify(poolData)
        });
        
        console.log('Pool creation status:', response.status);
        console.log('Pool creation headers:', [...response.headers.entries()]);
        
        const data = await response.json();
        console.log('Pool creation data:', data);
        
        return response.ok;
    } catch (error) {
        console.error('Pool creation error:', error);
        return false;
    }
}

// Export functions for manual testing
window.debugEquipool = {
    testLogin,
    testAuthCheck,
    testPoolCreation,
    backendUrl
};

console.log('\nFunctions available:');
console.log('- debugEquipool.testLogin(email, password, role)');
console.log('- debugEquipool.testAuthCheck()');
console.log('- debugEquipool.testPoolCreation()');
console.log('\nExample: debugEquipool.testLogin("test@example.com", "password123", "borrower")');
