# 🔍 Database Persistence Debug Guide

## Issue: User creation works but doesn't persist in database

You can login/logout with `a@gmail.com` but don't see it in your database. This suggests a database connection or transaction issue.

## 🧪 Debug Steps

### Step 1: Check Database Health
Visit: `https://equipool3-production.up.railway.app/api/health/database`

Look for:
- `database_connected: true`
- `database_name` - Should match your Railway database
- `tables_exist` with proper counts

### Step 2: List Current Users
Visit: `https://equipool3-production.up.railway.app/api/health/users`

This will show:
- All borrowers in the database
- All investors in the database
- Total counts
- Most recent users first

### Step 3: Test User Creation with Debug Script

Copy and paste this into your browser console while on `https://equipool3.vercel.app`:

```javascript
async function testUserCreation() {
    const backendUrl = 'https://equipool3-production.up.railway.app';
    const testEmail = `debug-${Date.now()}@test.com`;
    
    console.log('🧪 Testing user creation with email:', testEmail);
    
    // 1. Create user
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
    console.log('Signup result:', signupData);
    
    // 2. Wait a moment for database commit
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // 3. Check if user appears in database
    const usersResponse = await fetch(`${backendUrl}/api/health/users`);
    const usersData = await usersResponse.json();
    
    console.log('Current users in database:', usersData);
    
    // 4. Look for our test user
    const foundUser = usersData.borrowers?.find(u => u.email === testEmail);
    
    if (foundUser) {
        console.log('✅ SUCCESS: User found in database!', foundUser);
    } else {
        console.log('❌ PROBLEM: User NOT found in database');
        console.log('📧 Expected email:', testEmail);
    }
}

// Run the test
testUserCreation();
```

### Step 4: Check Railway Logs

Look for these debug messages in Railway deployment logs:
```
[DEBUG] Creating borrower object...
[DEBUG] Setting password...
[DEBUG] Saving borrower to database...
[DEBUG] Borrower saved successfully with ID: 123
[DEBUG] Verifying save by querying back...
[DEBUG] Verification successful: a@gmail.com
```

## 🔍 Possible Issues & Solutions

### Issue 1: Wrong Database Connected
**Symptoms**: Health check shows different database than expected
**Solution**: Check Railway database environment variables

### Issue 2: Transaction Not Committing
**Symptoms**: User created but verification query fails
**Solution**: Database transaction issues - check Railway database status

### Issue 3: Multiple Database Instances
**Symptoms**: App works but data goes to different database
**Solution**: Railway might have multiple database services

### Issue 4: Database Connection Pooling
**Symptoms**: Intermittent saves, some work some don't
**Solution**: Railway database connection limit reached

## 🛠️ Immediate Actions

1. **Check Health Endpoints**: Verify database connectivity
2. **Run Debug Script**: Test user creation and verify persistence
3. **Check Railway Dashboard**: 
   - Database service status
   - Connection count
   - Recent activity
4. **Monitor Railway Logs**: Look for transaction errors

## 📊 Expected Results After Fix

✅ Health check shows connected database  
✅ Debug script shows user in database list  
✅ Railway logs show successful verification  
✅ Your Railway database panel shows the new user  

---

**The enhanced debugging will show exactly where the persistence is failing in the database save process.**
