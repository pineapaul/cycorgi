# Database Seeding Scripts

This directory contains scripts to populate your MongoDB database with fake data for development and testing.

## Information Assets Seeding

### Prerequisites

1. **MongoDB Connection**: Make sure your MongoDB is running and accessible
2. **Environment Variables**: The script automatically loads `MONGODB_URI` from your `.env.local` file

### Running the Seeding Script

```bash
# Using npm script (recommended)
npm run seed

# Or directly with node
node scripts/seed-information-assets.js
```

### What the Script Does

- ✅ **Automatically loads** MongoDB URI from `.env.local`
- ✅ **Connects to MongoDB** using your connection string
- ✅ **Clears existing data** from the `information-assets` collection
- ✅ **Inserts 15 fake assets** with realistic data
- ✅ **Provides feedback** on the seeding process

### Sample Data Includes

- **Customer Database** (High confidentiality)
- **Employee Records** (HR Data)
- **Financial Reports** (Regulatory compliance)
- **Source Code Repository** (Intellectual Property)
- **Network Infrastructure** (Critical availability)
- **API Keys** (Security credentials)
- **Backup Systems** (Infrastructure)
- **Marketing Materials** (Public data)
- **Compliance Documentation** (Legal)
- **Development Environment** (Non-production)
- **Customer Support Tickets** (Customer data)
- **System Logs** (Audit trails)
- **Vendor Contracts** (Legal agreements)
- **Mobile App Backend** (API services)
- **Email Archive** (Communication)

### Data Structure

Each asset includes:
- **Information Asset**: Asset name
- **Category**: Data classification
- **Type**: Asset type (Database, Documents, etc.)
- **Description**: Detailed description
- **Location**: Where stored
- **Owner**: Asset owner
- **SME**: Subject Matter Expert
- **Administrator**: Technical administrator
- **Agile Release Train**: ART designation
- **Confidentiality**: High/Medium/Low
- **Integrity**: High/Medium/Low
- **Availability**: Critical/High/Medium/Low
- **Additional Info**: Extra information

### Environment Variables

The script automatically loads your MongoDB connection string from `.env.local`:

```
MONGODB_URI=your_mongodb_connection_string
```

**Example:**
```
MONGODB_URI=mongodb://localhost:27017/cycorgi
```

### Troubleshooting

If you get a "MONGODB_URI not found" error:
1. ✅ Check that your `.env.local` file exists in the project root
2. ✅ Verify the `MONGODB_URI` variable is set correctly
3. ✅ Make sure there are no extra spaces or quotes around the URI 