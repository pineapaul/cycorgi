# Threat Library Documentation

## Overview

The Threat Library is a comprehensive threat intelligence management system integrated with the MITRE ATTACK framework. It provides security teams with a centralized repository for tracking, categorizing, and managing security threats.

## Features

### Core Functionality
- **Threat Management**: Create, view, edit, and delete threat entries
- **MITRE ATTACK Integration**: Import threats directly from the MITRE ATTACK framework
- **Categorization**: Organize threats by category, severity, and source
- **Tagging System**: Flexible tagging for easy search and organization
- **Export Capabilities**: Export threat data to CSV format
- **Search & Filtering**: Advanced search and filtering capabilities

### MITRE ATTACK Integration
- **Real-time API**: Fetches current threat data from MITRE ATTACK
- **Automatic Mapping**: Maps MITRE techniques to threat categories
- **Fallback Data**: Sample data available when API is unavailable
- **ICS Focus**: Primarily focused on Industrial Control Systems (ICS) attack matrix

## Threat Categories

The system supports the following threat categories:
- **Malware**: Viruses, ransomware, trojans, etc.
- **Social Engineering**: Phishing, pretexting, baiting, etc.
- **Physical**: Physical access, theft, sabotage, etc.
- **Network**: DDoS, man-in-the-middle, packet sniffing, etc.
- **Application**: SQL injection, XSS, buffer overflows, etc.
- **Data**: Data breaches, exfiltration, corruption, etc.
- **Supply Chain**: Vendor compromise, third-party risks, etc.

## Severity Levels

Threats are categorized by severity:
- **Critical**: Immediate action required, high business impact
- **High**: Significant risk, requires prompt attention
- **Medium**: Moderate risk, plan mitigation
- **Low**: Minimal risk, monitor and review

## API Endpoints

### Threats API
- `GET /api/threats` - Retrieve threats with filtering and pagination
- `POST /api/threats` - Create new threat entries
- `PUT /api/threats/[id]` - Update existing threats
- `DELETE /api/threats/[id]` - Remove threats

### MITRE ATTACK API
- `GET /api/mitre-attack/techniques` - Fetch MITRE ATTACK techniques

## Database Schema

### Threats Collection
```javascript
{
  id: String,
  name: String,
  description: String,
  category: String,
  severity: String,
  mitreId: String (optional),
  mitreTactic: String (optional),
  mitreTechnique: String (optional),
  source: String,
  tags: Array<String>,
  status: String,
  createdAt: Date,
  updatedAt: Date,
  createdBy: String
}
```

## Usage

### Adding Custom Threats
1. Navigate to the Threat Library page
2. Click "Add Threat" button
3. Fill in required fields (name, description, category, severity)
4. Add optional tags and status
5. Submit the form

### Importing from MITRE ATTACK
1. Click "Import from MITRE" button
2. Browse available techniques
3. Search for specific techniques
4. Click "Add as Threat" for desired techniques
5. Threats are automatically created with MITRE references

### Managing Threats
- **View**: Click on any threat row to view details
- **Edit**: Use the edit functionality in the detail view
- **Delete**: Remove threats through the detail view
- **Export**: Select threats and export to CSV

## Setup and Installation

### Prerequisites
- MongoDB database
- Node.js environment
- Next.js application

### Installation Steps
1. Ensure the threats collection exists in MongoDB
2. Run the seed script to populate initial data:
   ```bash
   npm run seed-threats
   ```
3. The Threat Library will be available at `/inventory/threat-library`

### Environment Variables
- `MONGODB_URI`: MongoDB connection string
- `NEXTAUTH_SECRET`: NextAuth secret for authentication

## Customization

### Adding New Categories
To add new threat categories, update the category options in:
- `app/inventory/threat-library/page.tsx` (frontend form)
- `app/api/threats/route.ts` (API validation)

### Modifying Severity Levels
Update severity options in the same files to match your organization's risk assessment framework.

### Custom Tags
The tagging system is flexible and supports any text-based tags. Consider establishing a tagging convention for consistency.

## Security Considerations

- **Authentication Required**: All API endpoints require valid user session
- **Input Validation**: All inputs are validated and sanitized
- **Access Control**: Integrates with existing role-based access control
- **Audit Trail**: All changes are tracked with timestamps and user attribution

## Troubleshooting

### Common Issues

1. **MITRE API Unavailable**
   - The system will fall back to sample data
   - Check network connectivity and MITRE API status
   - Verify CORS settings if applicable

2. **Database Connection Issues**
   - Verify MongoDB connection string
   - Check database permissions
   - Ensure MongoDB service is running

3. **Authentication Errors**
   - Verify NextAuth configuration
   - Check session validity
   - Ensure proper user roles

### Performance Optimization
- Database indexes are automatically created for common query fields
- Pagination is implemented for large datasets
- Search queries are optimized with regex patterns

## Future Enhancements

- **Threat Intelligence Feeds**: Integration with external threat feeds
- **Risk Scoring**: Automated risk assessment and scoring
- **Threat Hunting**: Proactive threat detection capabilities
- **Reporting**: Advanced analytics and reporting features
- **Integration**: Connect with other security tools and platforms

## Support

For technical support or feature requests, please contact the development team or create an issue in the project repository.
