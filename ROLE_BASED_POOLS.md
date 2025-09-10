# Role-Based Pool Pages Implementation

## Overview
Implemented separate pool dashboards for borrowers and investors with proper role-based access control.

## Changes Made

### 1. New Routes Created
- `/pools` - Borrower pools page (existing, now with access control)
- `/pools-investor` - New investor pools page

### 2. Access Control Implementation

#### Borrower Pools Page (`/pools`)
- Only accessible by users with role `'borrower'`
- Redirects investors to `/pools-investor`
- Redirects unauthenticated users to home page

#### Investor Pools Page (`/pools-investor`)
- Only accessible by users with role `'investor'`
- Redirects borrowers to `/pools`
- Redirects unauthenticated users to home page

### 3. Updated Components

#### Main Page (`/`)
- Profile menu "Pools & Dashboard" button now routes to correct page based on user role
- CTA buttons route authenticated users to their appropriate dashboard
- Signup completion flow redirects to correct pools page

#### Authentication System
- Both pool pages check user authentication and role on mount
- Loading state displayed while authentication is being verified
- Proper error handling and redirects

### 4. Navigation Utilities
Created `src/utils/navigation.ts` with helper functions:
- `getPoolsUrlForRole(role)` - Returns correct pools URL for user role
- `redirectToPoolsForRole(role)` - Programmatically redirects to correct pools page

### 5. CSS Enhancements
Added navbar button styles to `globals.css`:
- `.ep-nav-login-btn` - Login button styling
- `.ep-nav-join-btn` - Join button styling

## User Flow

### For Borrowers:
1. Login/Signup → Redirected to `/pools`
2. Can create pools and manage borrower dashboard
3. Cannot access `/pools-investor`

### For Investors:
1. Login/Signup → Redirected to `/pools-investor`
2. Access investor-specific dashboard (placeholder content for now)
3. Cannot access `/pools`

### Navigation:
- Profile menu and CTA buttons intelligently route based on user role
- Consistent navigation experience across all pages
- Proper logout handling clears role state

## Technical Implementation

### Authentication Flow:
1. Check `/api/auth/me` endpoint for user authentication and role
2. Store `userRole` state in each page component
3. Implement redirects based on role mismatch
4. Show loading spinner during authentication check

### State Management:
- `isAuthenticated` - Boolean authentication status
- `userRole` - User's role ('borrower' | 'investor' | null)
- `isLoading` - Loading state during auth check

### Security:
- Server-side role validation via `/api/auth/me`
- Client-side route protection with redirects
- Token-based authentication for cross-origin requests

## Next Steps
The investor pools page currently shows placeholder content. Ready to implement investor-specific features such as:
- Investment opportunities browser
- Portfolio management
- Returns tracking
- Investment history
