# Database Seeding Scripts

This directory contains scripts for populating the database with sample data for development and testing purposes.

## ⚠️ Important Security Notice

**NEVER run these scripts in production environments!** These scripts are designed for development and testing only.

## Available Scripts

### `seed-third-parties-dev.js`
Populates the `third-parties` collection with sample vendor data.

**Usage:**
```bash
# Basic seeding (skips if data already exists)
npm run seed-third-parties

# Force overwrite existing data
node scripts/seed-third-parties-dev.js --force
```

**Features:**
- 15 sample third-party vendors with realistic data
- Multiple information assets per vendor
- Jira ticket references for risk assessments
- Proper date formatting
- Environment variable validation

### `seed-information-assets.js`
Populates the `information-assets` collection with sample asset data.

**Usage:**
```bash
npm run seed
```

### `seed-soa-controls.js`
Populates the `soa-controls` collection with Statement of Applicability controls.

**Features:**
- Creates all ISO 27001:2022 Annex A controls
- Links controls to existing risks via `relatedRisks` field (3-6 risks per control)
- Automatically fetches existing risk IDs from the risks collection
- Provides statistical feedback on risk associations

**Usage:**
```bash
npm run seed-soa
```

**Note:** For best results, run `seed-risks-and-treatments.js` first to populate the risks collection.

## Environment Setup

1. Ensure your `.env.local` file contains the `MONGODB_URI` variable
2. Make sure MongoDB is running and accessible
3. Run the scripts in development environment only

## Safety Features

- **Environment Check**: Scripts validate `NODE_ENV` and `MONGODB_URI`
- **Data Protection**: Won't overwrite existing data without `--force` flag
- **Error Handling**: Proper error messages and graceful failures
- **Connection Management**: Proper MongoDB connection cleanup

## Production Considerations

- API endpoints now use environment-based conditional seeding
- Only development environment allows automatic fake data insertion
- Production endpoints return proper errors without fake data
- Seeding logic is completely separated from API logic

## Troubleshooting

**"MONGODB_URI environment variable is not set"**
- Check your `.env.local` file
- Ensure the variable name is exactly `MONGODB_URI`

**"Collection already contains X documents"**
- Use `--force` flag to overwrite existing data
- Or manually clear the collection first

**Connection errors**
- Verify MongoDB is running
- Check network connectivity
- Validate connection string format 