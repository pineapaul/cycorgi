# Security Calendar

A comprehensive security task management system integrated into the Cycorgi application, providing both list and calendar views for tracking security-related activities, compliance deadlines, and operational tasks.

## Features

### 📊 **Dual View Modes**
- **List View**: Tabular display with sorting, filtering, and search capabilities
- **Calendar View**: FullCalendar integration with month, week, and list views

### 🏷️ **Task Categories**
1. **Audit and Assessments** - Security audits, penetration testing, risk assessments
2. **Operations** - Daily/weekly security operations, monitoring reviews
3. **Documentation Review** - Policy updates, procedure reviews
4. **External Activities** - Vendor assessments, third-party reviews
5. **Functional Unit Specific Tasks** - Team-specific security activities

### 📋 **Task Fields**
- **Task ID**: Unique identifier for each task
- **Planned Date**: Scheduled start date
- **Task Name**: Human-readable task description
- **Functional Unit**: Department or team responsible
- **Agile Release Train (ART)**: ART identifier for agile teams
- **Frequency**: How often the task occurs (Daily/Weekly/Monthly/Quarterly/Annual)
- **Output**: Expected deliverable or outcome
- **Task Owner**: Person responsible for completion
- **Support from ART**: Whether ART support is required
- **Due Date**: Task completion deadline
- **Completion Date**: Actual completion date (optional)
- **Jira Ticket**: Reference to Jira issue (optional)
- **Confluence Link**: Link to related documentation (optional)
- **Google Doc Link**: Link to Google Doc (optional)
- **Notes**: Additional information or context (optional)

## Installation

### 1. Install Dependencies
```bash
npm install @fullcalendar/react @fullcalendar/core @fullcalendar/daygrid @fullcalendar/timegrid @fullcalendar/interaction @fullcalendar/list
```

### 2. Database Setup
The calendar uses MongoDB with a `calendar_tasks` collection. Run the seed script to populate initial data:

```bash
node scripts/seed-calendar-tasks.js
```

### 3. Environment Variables
Ensure your MongoDB connection string is set in your environment:
```bash
MONGODB_URI=mongodb://localhost:27017/cycorgi
```

## Usage

### Accessing the Calendar
Navigate to `/isms-operations/calendar` in your application.

### Switching Between Views
- Use the **List View** button to see tasks in a table format
- Use the **Calendar View** button to see tasks in a calendar layout

### Filtering Tasks
- Click on the category tabs to filter tasks by type
- Use the search functionality in list view to find specific tasks
- Sort by any column in list view

### Calendar Navigation
- **Month View**: See all tasks for a month
- **Week View**: Focus on weekly tasks
- **List View**: Chronological list of upcoming tasks

### Task Interaction
- Click on calendar events to view task details
- Click on table rows to select tasks
- Use the calendar's date selection to plan new tasks

## API Endpoints

### GET /api/calendar-tasks
Retrieve all calendar tasks with optional filtering:
```bash
# Get all tasks
GET /api/calendar-tasks

# Filter by category
GET /api/calendar-tasks?category=audit

# Filter by date range
GET /api/calendar-tasks?startDate=2024-01-01&endDate=2024-12-31

# Filter by task owner
GET /api/calendar-tasks?taskOwner=John%20Doe
```

### POST /api/calendar-tasks
Create a new calendar task:
```json
{
  "taskId": "TASK-009",
  "plannedDate": "2024-03-01",
  "taskName": "Security Awareness Training",
  "functionalUnit": "HR Team",
  "agileReleaseTrain": "ART-2",
  "frequency": "Quarterly",
  "output": "Training Completion Report",
  "taskOwner": "HR Manager",
  "supportFromART": "No",
  "dueDate": "2024-03-15",
  "category": "functional"
}
```

### PUT /api/calendar-tasks/[id]
Update an existing task:
```bash
PUT /api/calendar-tasks/[task-id]
```

### DELETE /api/calendar-tasks/[id]
Delete a task (only if not completed):
```bash
DELETE /api/calendar-tasks/[task-id]
```

## Database Schema

### Collection: `calendar_tasks`
```typescript
interface CalendarTask {
  _id: ObjectId
  taskId: string                    // Unique identifier
  plannedDate: Date                // Start date
  taskName: string                 // Task description
  functionalUnit: string           // Responsible team
  agileReleaseTrain: string        // ART identifier
  frequency: string                // Recurrence pattern
  output: string                   // Expected deliverable
  taskOwner: string                // Responsible person
  supportFromART: string           // ART support required
  dueDate: Date                    // Completion deadline
  completionDate?: Date            // Actual completion
  taskJiraTicket?: string         // Jira reference
  confluenceLink?: string         // Documentation link
  googleDocLink?: string          // Google Doc link
  notes?: string                  // Additional context
  category: string                // Task category
  createdAt: Date                 // Creation timestamp
  updatedAt: Date                 // Last update timestamp
}
```

### Indexes
- `{ category: 1, plannedDate: 1 }` - Efficient filtering by category and date
- `{ taskId: 1 }` - Unique task ID lookups
- `{ dueDate: 1 }` - Due date queries
- `{ taskOwner: 1 }` - Task owner searches

## Customization

### Adding New Categories
1. Update the `tabConfig` array in `page.tsx`
2. Add the category to the `CalendarTask` interface
3. Update API validation in the route handlers
4. Add sample data to the seed script

### Modifying Task Fields
1. Update the `CalendarTask` interface
2. Modify the `columns` array for list view
3. Update API validation and database schema
4. Regenerate the seed script

### Calendar Styling
The calendar uses FullCalendar's default styling with Tailwind CSS classes. Customize by:
- Modifying the `eventContent` function for custom event rendering
- Adding custom CSS classes to calendar containers
- Configuring FullCalendar options in the component

## Business Rules

1. **Task Deletion**: Completed tasks cannot be deleted
2. **Date Validation**: Planned date must be before or equal to due date
3. **Unique IDs**: Task IDs must be unique across all tasks
4. **Category Validation**: Tasks must belong to predefined categories
5. **Frequency Validation**: Only predefined frequency values are allowed

## Troubleshooting

### Common Issues

1. **Calendar Not Loading**
   - Check MongoDB connection
   - Verify FullCalendar dependencies are installed
   - Check browser console for JavaScript errors

2. **Tasks Not Displaying**
   - Run the seed script to populate data
   - Check API endpoint responses
   - Verify database indexes are created

3. **Performance Issues**
   - Ensure database indexes are properly created
   - Consider pagination for large datasets
   - Optimize calendar event rendering

### Debug Mode
Enable debug logging by checking the browser console and server logs for detailed error information.

## Contributing

When adding new features to the security calendar:

1. Update the TypeScript interfaces
2. Add appropriate validation in API routes
3. Update the seed script with sample data
4. Test both list and calendar views
5. Ensure responsive design works on mobile devices

## Future Enhancements

- **Task Templates**: Predefined task templates for common activities
- **Recurring Tasks**: Automatic creation of recurring tasks
- **Task Dependencies**: Link related tasks together
- **Notifications**: Email/calendar reminders for upcoming deadlines
- **Reporting**: Export calendar data to various formats
- **Integration**: Connect with external calendar systems
- **Mobile App**: Native mobile application for task management
