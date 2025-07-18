# Backend CMO Data Filtering Implementation

## Overview
This guide shows how to modify your backend API to ensure CMO users can only see enquiries they created.

## 1. Update Enquiry Controller

### File: `src/controller/enquiryController.js`

```javascript
const jwt = require('jsonwebtoken');
const { Enquiry, User, Hospital, District } = require('../model'); // Adjust imports based on your models

// Middleware to extract user ID from JWT token
const extractUserFromToken = (req, res, next) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // Contains userId, role, etc.
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid token' });
  }
};

// Get enquiries for CMO (only their own)
const getCMOEnquiries = async (req, res) => {
  try {
    const { user } = req;
    
    // Only allow CMO users to access this endpoint
    if (user.role !== 'CMO') {
      return res.status(403).json({ message: 'Access denied. CMO role required.' });
    }

    const { status, search, page = 1, limit = 10 } = req.query;
    
    // Build where clause for filtering
    const whereClause = {
      created_by_user_id: user.userId // Only enquiries created by this CMO
    };

    // Add additional filters if provided
    if (status && status !== 'ALL') {
      whereClause.status = status;
    }

    // Add search functionality
    if (search) {
      whereClause[Op.or] = [
        { patient_name: { [Op.iLike]: `%${search}%` } },
        { medical_condition: { [Op.iLike]: `%${search}%` } },
        { contact_phone: { [Op.iLike]: `%${search}%` } },
        { ayushman_card_number: { [Op.iLike]: `%${search}%` } }
      ];
    }

    // Fetch enquiries with pagination
    const offset = (page - 1) * limit;
    const enquiries = await Enquiry.findAndCountAll({
      where: whereClause,
      include: [
        { model: Hospital, as: 'hospital' },
        { model: District, as: 'district' },
        { model: User, as: 'createdBy', attributes: ['user_id', 'full_name', 'role'] }
      ],
      order: [['created_at', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    res.json({
      success: true,
      data: enquiries.rows,
      total: enquiries.count,
      page: parseInt(page),
      totalPages: Math.ceil(enquiries.count / limit),
      filtered: true,
      user_id: user.userId
    });

  } catch (error) {
    console.error('Error fetching CMO enquiries:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Get single enquiry for CMO (only if they created it)
const getCMOEnquiryById = async (req, res) => {
  try {
    const { user } = req;
    const { id } = req.params;

    // Only allow CMO users
    if (user.role !== 'CMO') {
      return res.status(403).json({ message: 'Access denied. CMO role required.' });
    }

    const enquiry = await Enquiry.findOne({
      where: {
        enquiry_id: id,
        created_by_user_id: user.userId // Only if created by this CMO
      },
      include: [
        { model: Hospital, as: 'hospital' },
        { model: District, as: 'district' },
        { model: User, as: 'createdBy', attributes: ['user_id', 'full_name', 'role'] }
      ]
    });

    if (!enquiry) {
      return res.status(404).json({ 
        message: 'Enquiry not found or you do not have access to it' 
      });
    }

    res.json({
      success: true,
      data: enquiry
    });

  } catch (error) {
    console.error('Error fetching CMO enquiry:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Create new enquiry (automatically assign to current CMO)
const createCMOEnquiry = async (req, res) => {
  try {
    const { user } = req;
    
    if (user.role !== 'CMO') {
      return res.status(403).json({ message: 'Access denied. CMO role required.' });
    }

    const enquiryData = {
      ...req.body,
      created_by_user_id: user.userId, // Automatically assign to current CMO
      status: 'PENDING'
    };

    const newEnquiry = await Enquiry.create(enquiryData);

    res.status(201).json({
      success: true,
      data: newEnquiry,
      message: 'Enquiry created successfully'
    });

  } catch (error) {
    console.error('Error creating CMO enquiry:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Update enquiry (only if created by current CMO)
const updateCMOEnquiry = async (req, res) => {
  try {
    const { user } = req;
    const { id } = req.params;

    if (user.role !== 'CMO') {
      return res.status(403).json({ message: 'Access denied. CMO role required.' });
    }

    // First check if enquiry exists and belongs to current CMO
    const enquiry = await Enquiry.findOne({
      where: {
        enquiry_id: id,
        created_by_user_id: user.userId
      }
    });

    if (!enquiry) {
      return res.status(404).json({ 
        message: 'Enquiry not found or you do not have access to it' 
      });
    }

    // Update the enquiry
    await enquiry.update(req.body);

    res.json({
      success: true,
      data: enquiry,
      message: 'Enquiry updated successfully'
    });

  } catch (error) {
    console.error('Error updating CMO enquiry:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Get dashboard statistics for CMO (only their data)
const getCMODashboardStats = async (req, res) => {
  try {
    const { user } = req;

    if (user.role !== 'CMO') {
      return res.status(403).json({ message: 'Access denied. CMO role required.' });
    }

    // Get counts for different statuses (only for current CMO)
    const stats = await Enquiry.findAll({
      where: { created_by_user_id: user.userId },
      attributes: [
        'status',
        [sequelize.fn('COUNT', sequelize.col('enquiry_id')), 'count']
      ],
      group: ['status'],
      raw: true
    });

    // Format the statistics
    const formattedStats = {
      totalEnquiries: 0,
      pendingEnquiries: 0,
      approvedEnquiries: 0,
      rejectedEnquiries: 0,
      escalatedEnquiries: 0,
      completedEnquiries: 0,
      forwardedEnquiries: 0,
      inProgressEnquiries: 0
    };

    stats.forEach(stat => {
      const count = parseInt(stat.count);
      formattedStats.totalEnquiries += count;
      
      switch (stat.status) {
        case 'PENDING':
          formattedStats.pendingEnquiries = count;
          break;
        case 'APPROVED':
          formattedStats.approvedEnquiries = count;
          break;
        case 'REJECTED':
          formattedStats.rejectedEnquiries = count;
          break;
        case 'ESCALATED':
          formattedStats.escalatedEnquiries = count;
          break;
        case 'COMPLETED':
          formattedStats.completedEnquiries = count;
          break;
        case 'FORWARDED':
          formattedStats.forwardedEnquiries = count;
          break;
        case 'IN_PROGRESS':
          formattedStats.inProgressEnquiries = count;
          break;
      }
    });

    res.json({
      success: true,
      data: formattedStats,
      user_id: user.userId
    });

  } catch (error) {
    console.error('Error fetching CMO dashboard stats:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

module.exports = {
  extractUserFromToken,
  getCMOEnquiries,
  getCMOEnquiryById,
  createCMOEnquiry,
  updateCMOEnquiry,
  getCMODashboardStats
};
```

## 2. Update Routes

### File: `src/routes/enquiryRoutes.js`

```javascript
const express = require('express');
const router = express.Router();
const {
  extractUserFromToken,
  getCMOEnquiries,
  getCMOEnquiryById,
  createCMOEnquiry,
  updateCMOEnquiry,
  getCMODashboardStats
} = require('../controller/enquiryController');

// Apply authentication middleware to all CMO routes
router.use('/cmo', extractUserFromToken);

// CMO-specific routes (filtered by user)
router.get('/cmo/my-enquiries', getCMOEnquiries);
router.get('/cmo/enquiry/:id', getCMOEnquiryById);
router.post('/cmo/enquiry', createCMOEnquiry);
router.put('/cmo/enquiry/:id', updateCMOEnquiry);
router.get('/cmo/dashboard-stats', getCMODashboardStats);

// You can keep your existing general routes for other roles
// router.get('/enquiries', getAllEnquiries); // For admin/other roles
// router.get('/enquiries/:id', getEnquiryById); // For admin/other roles

module.exports = router;
```

## 3. Update Database Model (if needed)

### Ensure your Enquiry model has the `created_by_user_id` field:

```javascript
// In your Enquiry model file
const Enquiry = sequelize.define('Enquiry', {
  enquiry_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  patient_name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  medical_condition: DataTypes.TEXT,
  status: {
    type: DataTypes.ENUM('PENDING', 'APPROVED', 'REJECTED', 'ESCALATED', 'COMPLETED', 'FORWARDED', 'IN_PROGRESS'),
    defaultValue: 'PENDING'
  },
  created_by_user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Users',
      key: 'user_id'
    }
  },
  // ... other fields
}, {
  tableName: 'enquiries',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

// Define associations
Enquiry.belongsTo(User, { 
  foreignKey: 'created_by_user_id', 
  as: 'createdBy' 
});
```

## 4. Database Migration (if needed)

If you don't have the `created_by_user_id` column, create a migration:

```sql
-- Add the column to existing enquiries table
ALTER TABLE enquiries 
ADD COLUMN created_by_user_id INTEGER;

-- Add foreign key constraint
ALTER TABLE enquiries 
ADD CONSTRAINT fk_enquiry_created_by 
FOREIGN KEY (created_by_user_id) REFERENCES users(user_id);

-- Update existing records (you'll need to decide how to handle existing data)
-- For example, assign all existing enquiries to a specific CMO user:
-- UPDATE enquiries SET created_by_user_id = 1 WHERE created_by_user_id IS NULL;
```

## 5. Update your main app.js

```javascript
// In your app.js file
const enquiryRoutes = require('./src/routes/enquiryRoutes');

// Use the routes
app.use('/api', enquiryRoutes);
```

## 6. Frontend API Calls

Update your frontend to use the new CMO-specific endpoints:

```javascript
// Instead of: /api/enquiries
// Use: /api/cmo/my-enquiries

// Instead of: /api/enquiries/:id  
// Use: /api/cmo/enquiry/:id

// Instead of: /api/dashboard-stats
// Use: /api/cmo/dashboard-stats
```

## Testing

1. **Create a CMO user** and log in
2. **Create some enquiries** with that CMO user
3. **Log in as a different CMO** user
4. **Verify** that the second CMO cannot see the first CMO's enquiries
5. **Test all endpoints** to ensure proper filtering

## Security Notes

- ✅ User ID is extracted from JWT token (not from request parameters)
- ✅ All database queries filter by `created_by_user_id`
- ✅ Proper error handling for unauthorized access
- ✅ Role-based access control (only CMO users can access CMO endpoints)

This implementation ensures that each CMO can only see and manage the enquiries they created, providing proper data isolation and security.