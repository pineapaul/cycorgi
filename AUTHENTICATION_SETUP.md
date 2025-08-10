# Authentication Setup Guide

## Overview
This guide covers setting up NextAuth.js with Google OAuth provider for the Cycorgi application, including user management and role-based access control.

## Prerequisites
- Node.js 18+ installed
- MongoDB database (local or Atlas)
- Google Cloud Console account

## 1. Google Cloud Console Setup

### Create OAuth 2.0 Credentials
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable Google+ API
4. Go to "Credentials" → "Create Credentials" → "OAuth 2.0 Client IDs"
5. Configure OAuth consent screen:
   - User Type: External
   - App name: Cycorgi
   - User support email: Your email
   - Developer contact information: Your email
6. Create OAuth 2.0 Client ID:
   - Application type: Web application
   - Authorized redirect URIs: `http://localhost:3000/api/auth/callback/google`
7. Copy Client ID and Client Secret

## 2. Environment Variables

Create `.env.local` file in project root:

```bash
# NextAuth Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-super-secret-key-here

# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# MongoDB
MONGODB_URI=mongodb://localhost:27017/cycorgi
```

## 3. Database Setup

### MongoDB Collections
The authentication system creates these collections automatically:
- `users` - User accounts and profiles
- `accounts` - OAuth provider accounts
- `sessions` - User sessions (if using database strategy)

### User Schema
```typescript
interface User {
  _id: ObjectId
  email: string
  name: string
  role: 'Admin' | 'Manager' | 'Analyst' | 'Viewer'
  status: 'Active' | 'Pending' | 'Inactive'
  createdAt: Date
  updatedAt: Date
}
```

## 4. User Management

### Access Control
- **Admin users** can access the user management page (`/settings/users`)
- **Non-admin users** will see an "Access Denied" message
- **Pending users** can access the app (for testing purposes)

### Creating Admin Users

#### Option 1: Using the Script
```bash
# Create a default admin user
node scripts/create-admin-user.js

# Update your existing user to admin (replace with your email)
node scripts/create-admin-user.js your-email@example.com
```

#### Option 2: Direct Database Update
```javascript
// In MongoDB shell or Compass
db.users.updateOne(
  { email: "your-email@example.com" },
  { 
    $set: { 
      role: "Admin", 
      status: "Active",
      updatedAt: new Date()
    } 
  }
)
```

#### Option 3: Using the API (if you're already admin)
```bash
curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "name": "Admin User",
    "role": "Admin",
    "status": "Active"
  }'
```

### User Management Features
- **View all users** with their roles and statuses
- **Create new users** with custom roles and statuses
- **Edit existing users** to change roles and statuses
- **Role-based access control** for different user types

## 5. Testing Authentication

### Sign In Flow
1. Navigate to `/auth/signin`
2. Click "Continue with Google"
3. Complete Google OAuth flow
4. Redirected to dashboard

### User Status Flow
1. **New users** are created with `Viewer` role and `Pending` status
2. **Pending users** can access the app (for testing)
3. **Active users** have full access based on their role
4. **Inactive users** are blocked from accessing the app

## 6. Troubleshooting

### Common Issues

#### User Not Redirected After Sign In
- Check browser console for errors
- Verify environment variables are correct
- Ensure Google OAuth redirect URI matches exactly

#### Session Not Persisting
- Check NextAuth session strategy (should be "jwt")
- Verify MongoDB connection
- Clear browser cache and cookies

#### Access Denied on User Management
- Ensure your user has `Admin` role
- Check user status is `Active`
- Verify session is properly loaded

### Debug Commands
```bash
# Check API endpoints
curl http://localhost:3000/api/auth/session

# Test user creation
curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","name":"Test User","role":"Viewer","status":"Pending"}'
```

## 7. Future Enhancements

### Role-Based Access Control (RBAC)
- Implement role-specific permissions
- Add permission-based UI components
- Create role hierarchy system

### Mandatory Access Control (MAC)
- Add security clearance levels
- Implement data classification
- Create access control policies

### User Approval Workflow
- Admin approval for new users
- Email notifications
- User onboarding process

## 8. Security Considerations

- **NEXTAUTH_SECRET** should be a strong, random string
- **Google OAuth** credentials should be kept secure
- **MongoDB** should be properly secured with authentication
- **HTTPS** should be used in production
- **Session management** should be configured for your security requirements

## 9. Production Deployment

### Environment Variables
```bash
NEXTAUTH_URL=https://yourdomain.com
NEXTAUTH_SECRET=production-secret-key
GOOGLE_CLIENT_ID=production-client-id
GOOGLE_CLIENT_SECRET=production-client-secret
MONGODB_URI=production-mongodb-uri
```

### Google OAuth Redirect URIs
Add production redirect URI:
```
https://yourdomain.com/api/auth/callback/google
```

### Security Headers
Ensure proper security headers are configured in your hosting platform.

---

## Quick Start Checklist

- [ ] Google Cloud Console OAuth setup complete
- [ ] Environment variables configured
- [ ] MongoDB database running
- [ ] Application starting without errors
- [ ] Google sign-in working
- [ ] User created in database
- [ ] Admin user created/updated
- [ ] User management page accessible
- [ ] Can create/edit users

## Support

If you encounter issues:
1. Check browser console for errors
2. Verify all environment variables
3. Check MongoDB connection
4. Review NextAuth.js logs
5. Test with a fresh browser session
