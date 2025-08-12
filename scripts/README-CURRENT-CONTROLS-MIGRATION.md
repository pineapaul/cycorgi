# Current Controls Field Migration

## Overview
This migration converts the `currentControls` field in the risks collection from a string format to an array of strings format.

## What Changed
- **Before**: `currentControls` was stored as a single string (e.g., "Firewall, Access controls, Monitoring")
- **After**: `currentControls` is now stored as an array of strings (e.g., ["Firewall", "Access controls", "Monitoring"])

## Why This Change
- Better data structure for individual controls
- Easier to query and filter specific controls
- More consistent with other array fields in the system
- Better UI experience with individual control items

## Files Modified

### 1. TypeScript Interfaces
- `app/risk-management/risks/[id]/page.tsx` - Updated `RiskDetails` interface
- `app/risk-management/risks/new/page.tsx` - Updated `RiskFormData` interface  
- `lib/risk-validation.ts` - Updated `RiskData` interface

### 2. UI Components
- **Risk Information Page**: Updated to display controls as a bulleted list and edit as a textarea (one control per line)
- **New Risk Page**: Updated form to handle array input via textarea
- **Draft Risks Page**: Updated data transformation for display
- **Risk Register Page**: Updated data transformation for display

### 3. Data Handling
- **Data Fetching**: Updated to handle both old string format and new array format
- **Data Saving**: Updated to save as array format
- **PDF Generation**: Updated to display array values joined by commas

## Migration Process

### 1. Run the Migration Script
```bash
cd scripts
node migrate-current-controls-to-array.js
```

### 2. What the Script Does
- Connects to your MongoDB database using the URI from `.env.local`
- Finds all risks where `currentControls` is a string
- Converts comma/semicolon/pipe/newline-separated strings to arrays
- Updates the database records
- Provides a summary of the migration

### 4. Enhanced Features
- **Environment Loading**: Automatically loads `.env.local` file
- **Connection Validation**: Verifies MongoDB URI is properly configured
- **Secure Logging**: Shows connection info without exposing credentials
- **Error Handling**: Clear error messages and graceful exit on configuration issues
- **Progress Tracking**: Real-time updates on migration progress

### 5. Environment Variables
The migration script automatically loads environment variables from your `.env.local` file. Ensure your `.env.local` file contains:

```bash
MONGODB_URI="mongodb://your-connection-string"
```

**Note**: The script will automatically load the `.env.local` file and use the `MONGODB_URI` environment variable. If the variable is not set, the script will exit with a clear error message.

## Data Format Examples

### Before (String Format)
```json
{
  "currentControls": "Firewall, Access controls, Monitoring, Encryption"
}
```

### After (Array Format)
```json
{
  "currentControls": ["Firewall", "Access controls", "Monitoring", "Encryption"]
}
```

## UI Changes

### View Mode
- Controls are now displayed as a bulleted list instead of a single paragraph
- Each control appears on its own line for better readability

### Edit Mode
- Textarea input where each line represents one control
- Users can add/remove controls by adding/removing lines
- Empty lines are automatically filtered out

## Backward Compatibility
The system maintains backward compatibility by:
- Detecting if `currentControls` is a string or array
- Converting string format to array format during data fetching
- Gracefully handling both formats during the transition period

## Testing
After migration, verify:
1. Existing risks display controls correctly
2. New risks can be created with multiple controls
3. Editing existing risks works properly
4. PDF export displays controls correctly
5. All risk listing pages show controls properly

## Rollback (If Needed)
If you need to rollback, you can create a reverse migration script that converts arrays back to comma-separated strings. However, this is not recommended as it would lose the individual control structure.

## Notes
- The migration is safe and can be run multiple times
- Existing data is preserved and converted intelligently
- The system automatically handles both old and new formats during transition
- No downtime is required for this migration
