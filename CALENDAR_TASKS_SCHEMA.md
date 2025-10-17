# Calendar Tasks Database Schema

This document describes the database schema for the Security Calendar tasks collection.

## Collection Name: `calendar_tasks`

## Document Structure

```typescript
interface CalendarTask {
  _id: ObjectId                    // MongoDB document ID
  taskId: string                   // Unique task identifier (e.g., "TASK-001")
  plannedDate: Date               // Planned start date for the task
  taskName: string                // Human-readable name of the task
  functionalUnit: string          // Department or team responsible
  agileReleaseTrain: string       // ART identifier (e.g., "ART-1", "ART-2")
  frequency: string               // How often the task occurs (e.g., "Daily", "Weekly", "Monthly", "Quarterly", "Annual")
  output: string                  // Expected deliverable or outcome
  taskOwner: string               // Person responsible for completing the task
  supportFromART: string          // Whether ART support is required ("Yes"/"No")
  dueDate: Date                   // Deadline for task completion
  completionDate?: Date           // Actual completion date (optional)
  taskJiraTicket?: string        // Jira ticket reference (optional)
  confluenceLink?: string        // Confluence page link (optional)
  googleDocLink?: string         // Google Doc link (optional)
  notes?: string                 // Additional notes or description (optional)
  category: 'audit' | 'operations' | 'documentation' | 'external' | 'functional'
  createdAt: Date                // Document creation timestamp
  updatedAt: Date                // Document last update timestamp
}
```

## Indexes

```javascript
// Compound index for efficient filtering by category and date
db.calendar_tasks.createIndex({ 
  category: 1, 
  plannedDate: 1 
})

// Index for task ID lookups
db.calendar_tasks.createIndex({ 
  taskId: 1 
}, { unique: true })

// Index for due date queries
db.calendar_tasks.createIndex({ 
  dueDate: 1 
})

// Index for task owner queries
db.calendar_tasks.createIndex({ 
  taskOwner: 1 
})
```

## Sample Data

```javascript
{
  _id: ObjectId("..."),
  taskId: "TASK-001",
  plannedDate: ISODate("2024-01-15"),
  taskName: "Annual Security Assessment",
  functionalUnit: "Security Team",
  agileReleaseTrain: "ART-1",
  frequency: "Annual",
  output: "Assessment Report",
  taskOwner: "John Doe",
  supportFromART: "Yes",
  dueDate: ISODate("2024-01-31"),
  taskJiraTicket: "SEC-123",
  confluenceLink: "https://confluence.company.com/security-assessment",
  notes: "Comprehensive security review of all systems",
  category: "audit",
  createdAt: ISODate("2024-01-01T00:00:00Z"),
  updatedAt: ISODate("2024-01-01T00:00:00Z")
}
```

## API Endpoints

### GET /api/calendar-tasks
Retrieve all calendar tasks with optional filtering

**Query Parameters:**
- `category`: Filter by task category
- `startDate`: Filter tasks from this date
- `endDate`: Filter tasks until this date
- `taskOwner`: Filter by task owner
- `functionalUnit`: Filter by functional unit

### POST /api/calendar-tasks
Create a new calendar task

### PUT /api/calendar-tasks/[id]
Update an existing calendar task

### DELETE /api/calendar-tasks/[id]
Delete a calendar task

## Validation Rules

1. `taskId` must be unique across all tasks
2. `plannedDate` must be before or equal to `dueDate`
3. `completionDate` must be after `plannedDate` if provided
4. `category` must be one of the predefined values
5. `frequency` must be one of: "Daily", "Weekly", "Monthly", "Quarterly", "Annual"
6. `supportFromART` must be either "Yes" or "No"

## Business Rules

1. Tasks cannot be deleted if they have been completed
2. Completed tasks should have a `completionDate` set
3. Overdue tasks should be highlighted in the UI
4. Recurring tasks should be automatically created based on frequency
5. Task ownership can be transferred between users
