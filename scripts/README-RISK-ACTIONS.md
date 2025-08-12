# Risk Action Update Script

This script updates all existing risks in the database to add the `riskAction` field with appropriate values based on risk characteristics.

## Purpose

The `riskAction` field was added to the risk management system to standardize how risks are handled. This script ensures all existing risks have this field populated with appropriate values from the `RISK_ACTIONS` constant: Avoid, Transfer, Accept, or Mitigate.

## What the Script Does

1. **Connects to MongoDB** using the connection string from your `.env.local` file
2. **Fetches all existing risks** from the database
3. **Determines appropriate risk actions** based on risk characteristics:
   - **Extreme/High risks** → Mitigate
   - **Risks in Treatment phase** → Mitigate
   - **Critical/Major consequences** → Mitigate
   - **Low risks with Rare likelihood** → Accept
   - **Risks in Monitoring/Closed phases** → Accept
   - **Default** → Mitigate (for safety)
4. **Updates the database** with the new `riskAction` field
5. **Provides a summary** of the update process

## Risk Action Logic

The script uses intelligent logic to determine the most appropriate action for each risk:

| Risk Characteristic | Recommended Action | Reasoning |
|-------------------|-------------------|-----------|
| Extreme/High rating | Mitigate | High-priority risks require immediate treatment |
| Treatment phase | Mitigate | Risks being actively treated |
| Critical/Major consequences | Mitigate | High-impact risks need mitigation |
| Low rating + Rare likelihood | Accept | Low-risk scenarios can be accepted |
| Monitoring/Closed phase | Accept | Already treated risks are accepted |

## Prerequisites

1. **MongoDB connection**: Ensure your `.env.local` file contains `MONGODB_URI`
2. **Node.js**: The script requires Node.js to run
3. **MongoDB driver**: Ensure `mongodb` package is installed

## Usage

### 1. Run the Script

```bash
cd scripts
node update-risk-actions.js
```

### 2. Review the Output

The script provides detailed logging:
- Connection status
- Number of risks found
- Each risk update
- Summary statistics
- Risk action distribution

### 3. Verify the Updates

Check your database to confirm:
- All risks now have a `riskAction` field
- Values are consistent with `RISK_ACTIONS` constant
- No existing `riskAction` values were overwritten

## Safety Features

- **Non-destructive**: Only adds missing `riskAction` fields
- **Skip existing**: Won't overwrite risks that already have `riskAction`
- **Rollback safe**: No data is deleted or permanently modified
- **Logging**: Comprehensive logging for audit purposes

## Example Output

```
Connecting to MongoDB...
Connected to MongoDB successfully
Fetching existing risks...
Found 25 risks to update
Updated RISK-001: riskAction = Mitigate
Updated RISK-002: riskAction = Mitigate
Skipping RISK-003 - already has riskAction: Accept
...

=== Update Summary ===
Total risks processed: 25
Risks updated: 22
Risks skipped (already had riskAction): 3

=== Risk Action Distribution ===
Mitigate: 18 risks
Accept: 7 risks
```

## Troubleshooting

### Connection Issues
- Verify `MONGODB_URI` in `.env.local`
- Check MongoDB server is running
- Ensure network connectivity

### Permission Issues
- Verify database user has write permissions
- Check collection access rights

### Data Issues
- Review risk data structure
- Check for missing required fields

## Rollback

If you need to remove the `riskAction` field from all risks:

```javascript
// Run this in MongoDB shell or create a rollback script
db.risks.updateMany({}, { $unset: { riskAction: "" } })
```

## Support

For issues or questions about this script:
1. Check the console output for error messages
2. Verify your database structure matches expectations
3. Review the risk action logic for your specific use case
