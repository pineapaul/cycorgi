# Current Controls Reference Migration Script

## Purpose
This script migrates the `currentControlsReference` field in the `risks` collection from a string format to an array of strings containing SOA control IDs.

## What Changed
- **Before**: `currentControlsReference` was a single string field
- **After**: `currentControlsReference` is now an array of strings, each containing a valid SOA control ID

## Migration Logic
The script now:
1. Fetches all available SOA control IDs from the `soa_controls` collection
2. For each existing risk, randomly selects 4-8 SOA control IDs
3. Updates the `currentControlsReference` field with the selected control IDs
4. Sets an `updatedAt` timestamp

## Key Features
- **Random Selection**: Each risk gets 4-8 randomly selected SOA control IDs
- **Data Validation**: Ensures only valid SOA control IDs from the `soa_controls` table are used
- **Progress Tracking**: Shows real-time progress with percentage completion
- **Enhanced Logging**: Detailed console output with emojis and progress indicators
- **Error Handling**: Continues processing even if individual updates fail
- **Environment Variables**: Automatically loads MongoDB URI from `.env.local`

## Prerequisites
- MongoDB connection string in `.env.local` file
- `soa_controls` collection must exist and contain control records
- `risks` collection must exist

## Usage
```bash
cd scripts
node migrate-current-controls-reference-to-array.js
```

## What Gets Updated
- All risks where `currentControlsReference` is a string or doesn't exist
- Each risk will have 4-8 randomly selected SOA control IDs
- The `updatedAt` field is set to the current timestamp

## Output Example
```
🔗 Using MongoDB URI: mongodb://***@localhost:27017/cycorgi
📡 Connecting to MongoDB...
✅ Connected to database. Starting migration...
🔍 Fetching available SOA control IDs...
✅ Found 25 SOA controls available for reference.
Found 15 risks to migrate.

🔄 Starting migration process...

[6.7%] ✓ Updated risk RISK-001: "Not specified" → [A.5.1, A.6.2, A.7.1, A.8.1] (4 controls)
[13.3%] ✓ Updated risk RISK-002: "CTRL-002" → [A.5.2, A.6.1, A.7.2, A.8.2, A.9.1] (5 controls)
...

📊 === Migration Summary ===
Total risks processed: 15
Successfully updated: 15
Errors: 0
SOA controls available: 25
Controls per risk: 4-8 (randomly selected)

✅ Migration completed successfully!
📝 Each risk now has 4-8 randomly selected SOA control IDs in currentControlsReference.
```

## UI Changes
The risk information page now displays:
- A textarea for editing (one SOA control ID per line)
- A bulleted list showing both control ID and title from `soa_controls`
- Integration with SOA controls data for enhanced display

## Backward Compatibility
- The application handles both string and array formats during the transition
- Validation logic converts various string formats to arrays automatically
- Existing functionality remains intact

## Testing
After migration:
1. Verify risks display in the risk information page
2. Check that SOA control titles appear alongside IDs
3. Confirm editing functionality works with the new array format
4. Validate that new risks can be created with the array format
