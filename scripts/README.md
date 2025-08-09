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

### `seed-soa-controls.js` ⭐ **UPDATED - Complete ISO 27001:2022**
Seeds the `soa_controls` collection with **all 93 controls** from ISO 27001:2022 Annex A.

**Key Features:**
- **✅ Complete Coverage**: All 93 controls from ISO 27001:2022 standard
- **✅ Four Control Categories**: Organisational (37), People (8), Physical (14), Technological (34)
- **✅ Array-Based Justifications**: Multiple justifications per control for comprehensive coverage
- **✅ Realistic Implementation**: Proper control status and applicability settings
- **✅ Risk Linking**: Connects controls to existing risks (3-6 per control)
- **✅ Rich Metadata**: Implementation notes, control set groupings, and timestamps
- **✅ Performance Optimized**: Creates proper database indexes

**Control Set Breakdown:**
- **A.5 - Organisational Controls**: 37 controls (Policies, roles, incident management, compliance)
- **A.6 - People Controls**: 8 controls (Screening, training, remote work, reporting)
- **A.7 - Physical and Environmental**: 14 controls (Perimeters, access, equipment, utilities)
- **A.8 - Technological Controls**: 34 controls (Endpoints, access, crypto, development, networks)

**Enhanced Justification Examples:**
```javascript
// Multi-justification examples:
"A.5.1": ["Business Requirement", "Regulatory Requirement"]
"A.6.1": ["Legal Requirement", "Risk Management Requirement"]
"A.8.24": ["Risk Management Requirement", "Regulatory Requirement"]
```

**Usage:**
```bash
npm run seed-soa
# or
node scripts/seed-soa-controls.js
```

**Note:** For complete risk associations, run `seed-risks-and-treatments.js` first.

### `setup-soa-complete.js` ⭐ **RECOMMENDED**
**Combined script that replaces `migrate-soa-controls.js`, `migrate-soa-justifications.js`, and `seed-soa-controls.js`**

Complete SOA setup script that handles migration, justification updates, and seeding in one operation.

**Key Features:**
- **Array Justifications**: Supports multiple justifications per control for comprehensive coverage
- **Complete Migration**: Handles field renames (`status` → `controlStatus`) and new fields (`controlApplicability`, `relatedRisks`)
- **Smart Justification Mapping**: Automatically converts old single justifications to new array format
- **Fresh Seeding**: Populates controls with realistic multi-justification data
- **Risk Linking**: Connects controls to existing risks (3-6 per control)
- **Index Optimization**: Creates proper database indexes for performance

**Usage:**
```bash
node scripts/setup-soa-complete.js
```

**Note:** This script can be run on fresh databases or existing ones - it handles both migration and seeding intelligently.

---

### Legacy Scripts (Use `setup-soa-complete.js` instead)

### `migrate-soa-justifications.js` *(Legacy)*
Migration script to update SOA control justifications to use proper CONTROL_JUSTIFICATION constants.

**Features:**
- Maps invalid justification values to valid CONTROL_JUSTIFICATION constants
- Updates all controls with standardized justification values
- Provides comprehensive mapping for common justification patterns
- Validates all justifications after migration

**Usage:**
```bash
node scripts/migrate-soa-justifications.js
```

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