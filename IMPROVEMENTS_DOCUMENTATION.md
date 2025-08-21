# Improvements Management System

This document outlines the Improvements management system for tracking continuous improvement initiatives and enhancement opportunities in your ISMS.

## Overview

The Improvements system allows organizations to track, manage, and prioritize improvement initiatives across different functional units. It provides a structured approach to managing continuous improvement with prioritization using WSJF (Weighted Shortest Job First) methodology.

## Database Schema

### Improvements Collection

Each improvement record includes the following fields:

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `_id` | ObjectId | Yes | MongoDB unique identifier |
| `functionalUnit` | String | Yes | Department or team responsible |
| `status` | String | Yes | Current status (Planning, In Progress, On Hold, Completed) |
| `dateRaised` | String | Yes | Date when improvement was identified (ISO date string) |
| `raisedBy` | String | Yes | Person who identified the improvement |
| `location` | String | Yes | Office or location where improvement applies |
| `ofiJiraTicket` | String | Yes | OFI (Opportunity for Improvement) JIRA ticket reference |
| `informationAsset` | String | Yes | Information asset affected by the improvement |
| `description` | String | Yes | Detailed description of the improvement initiative |
| `assignedTo` | String | Yes | Person responsible for implementing the improvement |
| `benefitScore` | Number | Yes | Benefit score from 1-10 scale |
| `jobSize` | String | Yes | Job size (Small, Medium, Large) |
| `wsjf` | Number | Yes | WSJF score (calculated: benefitScore/jobSize) |
| `prioritisedQuarter` | String | Yes | Target quarter for implementation |
| `actionTaken` | String | Yes | Description of actions taken so far |
| `completionDate` | String | No | Date when improvement was completed |
| `dateApprovedForClosure` | String | No | Date when improvement was approved for closure |
| `createdAt` | String | Yes | Record creation timestamp |
| `updatedAt` | String | Yes | Last update timestamp |

## API Endpoints

### GET /api/improvements
Retrieves all improvements, sorted by creation date (newest first).

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "...",
      "functionalUnit": "IT Security",
      "status": "In Progress",
      // ... other fields
    }
  ]
}
```

### POST /api/improvements
Creates a new improvement record.

**Request Body:** All required fields from the schema above.

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "...",
    // ... all fields with generated timestamps
  }
}
```

### GET /api/improvements/[id]
Retrieves a specific improvement by ID.

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "...",
    // ... all fields
  }
}
```

### PUT /api/improvements/[id]
Updates an existing improvement record.

**Request Body:** Fields to update.

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "...",
    // ... updated fields
  }
}
```

### DELETE /api/improvements/[id]
Deletes an improvement record.

**Response:**
```json
{
  "success": true,
  "message": "Improvement deleted successfully"
}
```

## Features

### 1. DataTable with Full CRUD Operations
- **View**: Display all improvements in a sortable, filterable table
- **Create**: Add new improvements via modal form
- **Edit**: Modify existing improvements inline or via modal
- **Delete**: Remove improvements with confirmation
- **Export**: Export selected improvements to CSV

### 2. WSJF Prioritization
- **Benefit Score**: 1-10 scale for business value
- **Job Size**: Small (1), Medium (2), Large (3) complexity
- **WSJF**: Automatically calculated as Benefit Score / Job Size
- **Higher WSJF = Higher Priority**

### 3. Status Management
- **Planning**: Initial phase, requirements gathering
- **In Progress**: Active implementation
- **On Hold**: Temporarily suspended
- **Completed**: Successfully implemented

### 4. Search and Filtering
- **Global Search**: Search across all fields
- **Column Filters**: Filter by specific field values
- **Sorting**: Sort by any column
- **Column Visibility**: Show/hide columns as needed

### 5. Responsive Design
- **Desktop**: Full table view with all features
- **Mobile**: Card view for better mobile experience
- **Responsive**: Adapts to different screen sizes

## Usage

### Creating a New Improvement

1. Navigate to `/compliance/improvements`
2. Click "New Improvement" button
3. Fill in all required fields:
   - Functional Unit (e.g., "IT Security")
   - Status (defaults to "Planning")
   - Date Raised (defaults to today)
   - Raised By (e.g., "John Smith")
   - Location (e.g., "Sydney Office")
   - OFI JIRA Ticket (e.g., "OFI-2024-001")
   - Information Asset (e.g., "Customer Database")
   - Description (detailed description)
   - Assigned To (e.g., "Sarah Johnson")
   - Benefit Score (1-10)
   - Job Size (Small/Medium/Large)
   - Prioritised Quarter (e.g., "Q1 2024")
   - Action Taken (what has been done so far)
4. WSJF is automatically calculated
5. Click "Create Improvement"

### Editing an Improvement

1. Click the edit (pencil) icon in the actions column
2. Modify the required fields
3. Click "Update Improvement"

### Viewing Details

1. Click on any row in the table
2. Navigate to the detailed view page
3. See all information in a structured layout

### Managing Status

1. Edit an improvement
2. Change the status field
3. Update completion dates if moving to "Completed"
4. Save changes

## Data Seeding

The system includes a seed script to populate the database with sample data:

```bash
npm run seed-improvements
```

This creates 10 sample improvements across different functional units and statuses for testing and demonstration purposes.

## Integration Points

### Information Assets
- Improvements can reference specific information assets
- Links to the information assets inventory system

### JIRA Integration
- OFI tickets can be linked to JIRA
- Enables workflow integration with project management

### Reporting
- Export functionality for compliance reporting
- Status tracking for management dashboards
- WSJF prioritization for resource planning

## Best Practices

### 1. WSJF Prioritization
- Use consistent scoring for benefit (1-10 scale)
- Consider business impact, compliance requirements, and risk reduction
- Job size should reflect actual effort, not calendar time

### 2. Status Management
- Keep status current and accurate
- Use "On Hold" sparingly and document reasons
- Complete improvements promptly when finished

### 3. Documentation
- Write clear, actionable descriptions
- Document actions taken for audit trails
- Link to relevant JIRA tickets and documentation

### 4. Regular Review
- Review improvement status regularly
- Update progress and completion dates
- Archive completed improvements after closure approval

## Technical Implementation

### Frontend Components
- `ImprovementsPage`: Main listing page with DataTable
- `ImprovementForm`: Modal form for create/edit operations
- `ImprovementDetailPage`: Detailed view page

### Backend API
- RESTful API endpoints for CRUD operations
- MongoDB integration with proper error handling
- Automatic timestamp management

### Database
- MongoDB collection: `improvements`
- Indexed on common query fields
- Automatic ID generation and timestamps

## Future Enhancements

### Planned Features
- **Dashboard Integration**: Improvement metrics on main dashboard
- **Notification System**: Alerts for status changes and deadlines
- **Workflow Automation**: Automatic status transitions
- **Reporting Engine**: Advanced analytics and reporting
- **Integration APIs**: Connect with external project management tools

### Potential Integrations
- **Slack**: Status change notifications
- **Email**: Automated reporting and reminders
- **BI Tools**: Data export for business intelligence
- **Compliance Systems**: Integration with audit and compliance tools
