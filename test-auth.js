// Test authentication endpoint
const fetch = require('node-fetch');

async function testAuth() {
    console.log('Testing authentication endpoint...');
    
    try {
        const response = await fetch('http://localhost:8000/api/auth/me', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
        console.log('Response status:', response.status);
        const data = await response.json();
        console.log('Response data:', data);
        
    } catch (error) {
        console.error('Error:', error);
    }
}

testAuth();
