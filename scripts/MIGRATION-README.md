# Database Migration: Information Assets Schema Update

## Overview

This migration updates the `informationAsset` field in the `risks` collection from a string format to an array of ID strings that reference the `information-assets` collection. The API layer transforms these IDs into objects with `id` and `name` properties for frontend consumption. This change enables proper one-to-many relationships between risks and information assets.

## What Changed

### Before Migration
```javascript
// Old format - string
{
  riskId: "RISK-001",
  informationAsset: "Customer Database, Payment Systems"
}
```

### After Migration
```javascript
// New format - array of ID strings (database storage)
{
  riskId: "RISK-001",
  informationAsset: ["110", "Payment Systems"]
}

// API response format (for frontend consumption)
{
  riskId: "RISK-001",
  informationAsset: [
    { id: "110", name: "Customer Database" },
    { id: "Payment Systems", name: "Payment Systems" }
  ]
}
```

## Migration Scripts

> **Note**: This migration has been completed. The scripts below are kept for documentation and future reference.

### 1. Backup Script (`backup-risks.js`)
**Purpose**: Creates a safe backup of the current risks collection before migration.

**Usage**:
```bash
node scripts/backup-risks.js
```

**Output**:
- Creates a timestamped backup file in `scripts/backups/`
- Provides a summary of current `informationAsset` field types
- Safe to run multiple times

### 2. Migration Script (`migrate-information-assets-corrected.js`)
**Purpose**: Converts the `informationAsset` field from string to array format.

**Usage**:
```bash
node scripts/migrate-information-assets-corrected.js
```

**What it does**:
- Connects to MongoDB using environment variables
- Fetches all information assets to create lookup maps
- Processes each risk record
- Converts string values to array of ID strings
- Handles both old string format and partially migrated array formats
- Provides detailed logging and summary statistics

## Migration Process

### Step 1: Backup (Recommended)
```bash
node scripts/backup-risks.js
```

### Step 2: Run Migration
```bash
node scripts/migrate-information-assets-corrected.js
```

### Step 3: Verify Results
The migration script will provide a summary showing:
- Total risks processed
- Successfully migrated count
- Skipped count (already correct format)
- Error count (if any)

## Migration Logic

The migration script handles several scenarios:

### 1. String Format (Old)
```javascript
informationAsset: "Customer Database, Payment Systems"
```
**Converts to**:
```javascript
informationAsset: ["110", "Payment Systems"]
```

### 2. Array of Strings (Partial Migration)
```javascript
informationAsset: ["Customer Database", "Payment Systems"]
```
**Converts to**:
```javascript
informationAsset: ["110", "Payment Systems"]
```

### 3. Array of ID Strings (Already Correct)
```javascript
informationAsset: ["110", "Payment Systems"]
```
**Skipped** - No changes needed

### 4. Missing or Null Values
```javascript
informationAsset: null
// or
informationAsset: undefined
```
**Skipped** - No changes needed

## Data Flow Architecture

### Database Storage
The `informationAsset` field in the database stores an array of ID strings:
```javascript
informationAsset: ["110", "Payment Systems"]
```

### API Layer Transformation
The API endpoints fetch information asset names from the `information-assets` collection and return objects with `id` and `name` properties:
```javascript
// GET /api/risks response
informationAsset: [
  { id: "110", name: "Customer Database" },
  { id: "Payment Systems", name: "Payment Systems" }
]
```

### Frontend Consumption
The frontend receives the API response and displays the `name` properties while working with the `id` properties for operations.

## Asset Matching Logic

The migration script uses the following logic to match information asset names to IDs:

1. **Exact name match** (case-insensitive)
2. **ID match** (if the string is already an ID)
3. **Fallback** - If no match found, creates a reference with the original string as both ID and name

## Rollback Plan

If the migration needs to be rolled back:

1. **Restore from backup**:
   ```bash
   # Use the backup file created by backup-risks.js
   # Restore the risks collection from the JSON backup
   ```

2. **Manual rollback script** (if needed):
   ```javascript
   // Convert array format back to string format
   const rollbackData = risks.map(risk => ({
     ...risk,
     informationAsset: Array.isArray(risk.informationAsset) 
       ? risk.informationAsset.join(', ')  // Array of ID strings
       : risk.informationAsset
   }));
   ```

## Prerequisites

1. **MongoDB connection**: Ensure `MONGODB_URI` is set in `.env.local`
2. **Information assets**: The `information-assets` collection should be populated
3. **Database access**: Script needs read/write access to the `risks` collection

## Safety Features

- **Backup creation**: Always creates a backup before migration
- **Dry-run capability**: Can be modified to run in dry-run mode
- **Error handling**: Continues processing even if individual records fail
- **Detailed logging**: Provides comprehensive feedback on the migration process
- **Idempotent**: Safe to run multiple times (skips already migrated records)

## Post-Migration Verification

After running the migration, verify the changes:

1. **Check a few sample records** in the database
2. **Test the application** to ensure it works with the new format
3. **Verify API endpoints** return the expected data structure
4. **Check that the UI** displays information assets correctly

## Troubleshooting

### Common Issues

1. **Connection errors**: Check `MONGODB_URI` in `.env.local`
2. **Permission errors**: Ensure database user has read/write access
3. **Asset not found**: Information assets may need to be seeded first
4. **Partial migration**: Run the migration script again (it's idempotent)

### Error Recovery

If the migration fails partway through:
1. Check the error logs
2. Restore from backup if necessary
3. Fix any issues (e.g., missing information assets)
4. Re-run the migration

## Support

If you encounter issues during migration:
1. Check the console output for detailed error messages
2. Verify the backup was created successfully
3. Ensure all prerequisites are met
4. Review the migration logic for your specific data patterns 