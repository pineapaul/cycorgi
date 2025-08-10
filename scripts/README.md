# Scripts Directory

This directory contains utility scripts for managing the Cycorgi application.

## Authentication Scripts

### `create-admin-user.js`

Creates or updates admin users in the database.

#### Usage

```bash
# Create a default admin user (admin@cycorgi.com)
node scripts/create-admin-user.js

# Update your existing user to admin role
node scripts/create-admin-user.js your-email@example.com
```

#### What it does

1. **Creates a default admin user** with email `admin@cycorgi.com`
2. **Updates existing users** to admin role if email is provided
3. **Shows all current users** in the database
4. **Handles errors gracefully** and provides feedback

#### Prerequisites

- MongoDB running and accessible
- `MONGODB_URI` environment variable set (or defaults to localhost)
- Node.js with MongoDB driver installed

#### Example Output

```bash
$ node scripts/create-admin-user.js user@example.com

Connected to MongoDB
Updating user user@example.com to admin role...
✅ User user@example.com updated to admin role

📋 Current users in database:
- John Doe (user@example.com) - Admin - Active
- System Administrator (admin@cycorgi.com) - Admin - Active

Disconnected from MongoDB
```

## Database Management Scripts

### `seed-*.js`

Various scripts for populating the database with sample data:

- `seed-risks-and-treatments.js` - Creates sample risks and treatments
- `seed-soa-controls.js` - Creates ISO 27001:2022 controls
- `seed-workshops.js` - Creates sample workshops
- `seed-third-parties.js` - Creates sample third-party vendors
- `seed-information-assets.js` - Creates sample information assets

### `migrate-*.js`

Scripts for updating existing data structures:

- `migrate-risk-ratings.js` - Updates risk rating calculations
- `migrate-consequence-values.js` - Updates consequence value mappings

## Running Scripts

### Prerequisites

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Set environment variables**:
   ```bash
   # In .env.local or environment
   MONGODB_URI=mongodb://localhost:27017/cycorgi
   ```

3. **Ensure MongoDB is running**:
   ```bash
   # Local MongoDB
   mongod
   
   # Or connect to remote instance
   ```

### Execution

```bash
# Run from project root
node scripts/script-name.js

# With arguments
node scripts/create-admin-user.js user@example.com

# With environment variables
MONGODB_URI=mongodb://localhost:27017/cycorgi node scripts/script-name.js
```

## Troubleshooting

### Common Issues

#### Connection Failed
```
Error: connect ECONNREFUSED 127.0.0.1:27017
```
**Solution**: Ensure MongoDB is running and accessible

#### Authentication Failed
```
Error: Authentication failed
```
**Solution**: Check MongoDB connection string and credentials

#### Permission Denied
```
Error: not authorized on cycorgi to execute command
```
**Solution**: Ensure user has proper database permissions

### Debug Mode

Add debug logging to scripts:

```javascript
// Add to scripts for verbose output
console.log('Debug: Connecting to MongoDB...')
console.log('Debug: Database:', db.databaseName)
console.log('Debug: Collections:', await db.listCollections().toArray())
```

## Security Notes

- **Never commit** scripts with hardcoded credentials
- **Use environment variables** for sensitive information
- **Limit database access** to necessary operations only
- **Review scripts** before running in production
- **Backup data** before running migration scripts

## Contributing

When adding new scripts:

1. **Follow naming convention**: `verb-noun.js`
2. **Add error handling**: Wrap operations in try-catch
3. **Include usage examples**: Add JSDoc or inline comments
4. **Update this README**: Document new scripts
5. **Test thoroughly**: Ensure scripts work in different environments 