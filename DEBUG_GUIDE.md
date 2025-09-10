# Pool Creation Authentication Debug Guide

## Issue Identified

Based on your debug output, the problem is clear:
- Backend receives requests but session data is empty: `{}`
- All API calls return 401 Unauthorized
- This indicates **session cookies are not being sent/received properly**

## Root Cause: Cross-Origin Session Cookie Issues

The session isn't persisting between login and subsequent API calls due to browser security restrictions with cross-origin cookies.

## Changes Made

### 1. Enhanced Session Configuration (`server/settings.py`)
```python
# Improved session settings for cross-origin
SESSION_COOKIE_SAMESITE = 'None'
SESSION_COOKIE_SECURE = True
SESSION_COOKIE_HTTPONLY = True
SESSION_COOKIE_AGE = 86400  # 24 hours
SESSION_SAVE_EVERY_REQUEST = True
SESSION_EXPIRE_AT_BROWSER_CLOSE = False

# Added CSRF trusted origins
CSRF_TRUSTED_ORIGINS = [
    "https://equipool3.vercel.app",
    "https://equipool3-git-main-newproject9482s-projects.vercel.app",
    "https://equipool3-newproject9482s-projects.vercel.app",
]
```

### 2. Enhanced Debug Logging (`server/views.py`)
- Added comprehensive session debugging to login functions
- Added cookie and header debugging to auth_me function
- Force session save with `request.session.save()`

### 3. Environment Variable Fix (`client/.env.local`)
- Fixed production backend URL configuration

## Debugging Steps

### Step 1: Deploy and Test
1. Push these changes to Railway
2. Redeploy your backend
3. Test login and check Railway logs

### Step 2: Use Debug Script
Copy and paste `debug-session.js` into your browser console on your frontend:
```javascript
// Test the full flow
await debugEquipool.testLogin("your-email@example.com", "your-password", "borrower");
await debugEquipool.testAuthCheck();
await debugEquipool.testPoolCreation();
```

### Step 3: Check Railway Logs
Look for these debug messages in Railway logs:
```
[DEBUG] Session established for borrower: 1
[DEBUG] Session data after login: {'borrower_id': 1, 'role': 'borrower'}
[DEBUG] Session key: abc123...
[DEBUG] Auth check - cookies: {'sessionid': 'abc123...'}
```

## Common Issues and Solutions

### Issue 1: No Session Cookie Set
**Symptoms**: Login succeeds but auth check fails, no `sessionid` cookie
**Solution**: Ensure `SESSION_COOKIE_SECURE = True` and site uses HTTPS

### Issue 2: Cookie Not Sent
**Symptoms**: Cookie exists but not sent with requests
**Solution**: Verify `SameSite=None` and `Secure=True` settings

### Issue 3: Domain Mismatch
**Symptoms**: Cookie set but not recognized
**Solution**: Check CORS and trusted origins configuration

## Expected Debug Output After Fix

**Successful Login:**
```
[DEBUG] Session established for borrower: 1
[DEBUG] Session data after login: {'borrower_id': 1, 'role': 'borrower'}
[DEBUG] Session key: abc123def456...
```

**Successful Auth Check:**
```
[DEBUG] Auth check - session data: {'borrower_id': 1, 'role': 'borrower'}
[DEBUG] Auth check - cookies: {'sessionid': 'abc123def456...'}
[DEBUG] Borrower ID: 1, Investor ID: None
```

## Alternative Solution: Token-Based Auth

If session cookies continue to cause issues, consider implementing JWT tokens:

1. Return a token on login
2. Store token in localStorage/sessionStorage
3. Send token in Authorization header
4. Validate token in backend middleware

Would you like me to implement this alternative approach?

## Files Modified

1. `server/server/settings.py` - Enhanced session configuration
2. `server/server/views.py` - Added comprehensive debugging
3. `client/.env.local` - Fixed environment variable
4. `debug-session.js` - Browser testing script

## Next Steps

1. **Deploy changes** to Railway
2. **Test with debug script** in browser console
3. **Check Railway logs** for detailed session information
4. **Share the debug output** if issues persist
