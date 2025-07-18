# CMO Query Filtering Implementation

## Overview
This document outlines the implementation of CMO-specific filtering for the "Query from SDM" page, ensuring that CMO users only see queries related to enquiries they have created.

## Backend Changes

### 1. Updated Case Query Routes (`Backand/src/routes/caseQueryRoutes.js`)
- Added `authMiddleware` to the `GET /api/case-queries` route
- This ensures JWT token authentication is required for fetching queries

```javascript
// Before
router.get('/',  caseQueryController.getAllCaseQueries);

// After  
router.get('/', authMiddleware, caseQueryController.getAllCaseQueries);
```

### 2. Updated Case Query Controller (`Backand/src/controller/caseQueryController.js`)

#### Enhanced `getAllCaseQueries` function:
- Added JWT user extraction and role checking
- Implemented CMO-specific filtering logic
- Added filtering to show only queries related to enquiries created by the logged-in CMO user
- Added response metadata to indicate when filtering is applied

```javascript
// Key filtering logic
if (user && user.role === 'CMO') {
  includeOptions[0].where = { submitted_by_user_id: user.user_id };
  console.log('CMO filtering applied - showing only queries for enquiries created by user_id:', user.user_id);
}
```

#### Enhanced `getCaseQueryById` function:
- Added similar CMO filtering for individual query access
- Provides appropriate error messages when CMO users try to access queries they don't have permission for

### 3. Response Format
The API now returns additional metadata:
```javascript
{
  success: true,
  data: [...],
  filtered: true,  // Indicates if CMO filtering was applied
  user_id: 2       // The user ID that was used for filtering
}
```

## Frontend Changes

### Updated Query from SDM Page (`Web-Air-Ambulace/src/pages/CMO/QueryFromSDM.jsx`)

#### Visual Indicators:
- Added blue badge showing "Showing only queries related to your enquiries" for CMO users
- Enhanced logging to show filtering information in console

#### API Integration:
- Already using JWT tokens for authentication
- Added logging to show when CMO filtering is active
- Maintains existing functionality while adding filtering transparency

## How It Works

### For CMO Users:
1. **Authentication**: JWT token is sent with all API requests
2. **Role Detection**: Backend identifies user as CMO from JWT payload
3. **Query Filtering**: Only queries related to enquiries created by the CMO are returned
4. **Visual Feedback**: Frontend shows filtering indicator
5. **Data Isolation**: CMO users cannot access queries related to other users' enquiries

### For Non-CMO Users:
1. **No Filtering**: All queries are returned (subject to other business rules)
2. **Full Access**: Can see all queries in the system
3. **No Visual Indicators**: No filtering badges shown

## Database Query Logic

The filtering works by joining the `CaseQuery` table with the `Enquiry` table and filtering based on `submitted_by_user_id`:

```sql
-- Conceptual SQL representation
SELECT cq.*, e.* 
FROM case_queries cq
JOIN enquiries e ON cq.enquiry_id = e.enquiry_id
WHERE e.submitted_by_user_id = [CMO_USER_ID]  -- Only for CMO users
ORDER BY cq.created_at DESC
```

## Security Benefits

1. **Data Isolation**: CMO users cannot see queries related to other CMOs' enquiries
2. **Role-Based Access**: Filtering is automatically applied based on user role
3. **JWT Security**: All requests require valid authentication tokens
4. **Audit Trail**: All filtering actions are logged for debugging and monitoring

## Testing Scenarios

### Test Case 1: CMO User Login
1. Login as CMO user (e.g., "Dr. Anil Sharma")
2. Navigate to "Query from SDM" page
3. Verify only queries related to enquiries created by this CMO are shown
4. Verify blue filtering indicator is displayed

### Test Case 2: Non-CMO User Login
1. Login as Admin/DM/SDM user
2. Navigate to case queries (if accessible)
3. Verify all queries are shown without filtering
4. Verify no filtering indicator is displayed

### Test Case 3: API Direct Access
1. Make direct API call with CMO JWT token
2. Verify response includes `filtered: true`
3. Verify only relevant queries are returned

## Implementation Status

✅ **Backend Filtering**: Complete
✅ **Frontend Integration**: Complete  
✅ **Visual Indicators**: Complete
✅ **Authentication**: Complete
✅ **Error Handling**: Complete
✅ **Logging**: Complete

## Notes

- The filtering is transparent to CMO users - they see a normal interface but with filtered data
- The implementation maintains backward compatibility with existing functionality
- All changes are role-based and don't affect other user types
- The filtering applies to both list and individual query access endpoints