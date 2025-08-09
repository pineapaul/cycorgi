# SOA Controls by Risk ID Function

## Overview

A global function that searches the Statement of Applicability (SOA) controls database to find all controls that are related to a specific risk ID.

**Important**: This function is located in `lib/server-utils.ts` (not `lib/utils.ts`) because it requires MongoDB access and can only be used on the server side. The separation ensures that client-side components can import from `lib/utils.ts` without encountering Node.js-specific dependency issues.

## Function Signature

```typescript
async function findSoAControlsByRiskId(riskId: string): Promise<SoAControlResult[]>
```

## Parameters

- **riskId** (string): The risk ID to search for (e.g., "RISK-001", "RISK-002", etc.)

## Return Type

```typescript
interface SoAControlResult {
  id: string    // Control ID (e.g., "A.5.1", "A.8.7")
  title: string // Control title (e.g., "Policies for information security")
}
```

## Usage Examples

### TypeScript/JavaScript (using import)

```typescript
import { findSoAControlsByRiskId } from '@/lib/server-utils'

// Find all SOA controls related to RISK-001
const controls = await findSoAControlsByRiskId('RISK-001')

console.log(`Found ${controls.length} controls`)
controls.forEach(control => {
  console.log(`${control.id}: ${control.title}`)
})
```

### API Endpoint

You can also use the REST API endpoint:

```
GET /api/soa-controls/by-risk/[riskId]
```

Example:
```
GET /api/soa-controls/by-risk/RISK-001
```

Response:
```json
{
  "success": true,
  "data": [
    {
      "id": "A.5.1",
      "title": "Policies for information security"
    },
    {
      "id": "A.5.2", 
      "title": "Information security roles and responsibilities"
    }
  ],
  "count": 25,
  "riskId": "RISK-001"
}
```

### Node.js Script

You can test the function using the provided test script:

```bash
node test-soa-function.js RISK-001
```

## Database Schema

The function searches the `soa_controls` collection where each document has the following relevant fields:

- `id`: Control identifier (e.g., "A.5.1")
- `title`: Control title
- `relatedRisks`: Array of risk IDs that this control addresses

## Error Handling

The function will throw an error if:
- No risk ID is provided
- Risk ID is not a string
- Database connection fails
- Query execution fails

## Performance Notes

- The function uses MongoDB's indexed search on the `relatedRisks` field
- Results are limited to only the `id` and `title` fields for performance
- No pagination is implemented (returns all matching controls)

## Implementation Details

- **Location**: `lib/server-utils.ts`
- **Database**: MongoDB collection `soa_controls`
- **Connection**: Uses the global MongoDB client promise from `lib/mongodb.ts`
- **Security**: No authentication required (internal function)

## Testing

Run the test suite:
```bash
# Test with existing risk ID
node test-soa-function.js RISK-001

# Test with non-existent risk ID  
node test-soa-function.js RISK-999

# Test API endpoint
curl http://localhost:3001/api/soa-controls/by-risk/RISK-001
```
