# CMO Filtering Debug Guide

## 🔧 **Current Issue**
Frontend में "Failed to fetch enquiries" error आ रहा है क्योंकि backend में JWT authentication add की गई है।

## ✅ **Fixed Issues**

### 1. **JWT Token Field Mismatch**
- **Problem**: JWT token में `user_id` field है, लेकिन code में `userId` expect कर रहा था
- **Fix**: सभी `userId` को `user_id` में change कर दिया

### 2. **Authentication Middleware**
- **Problem**: सभी routes पर strict authentication लगा दी थी
- **Fix**: Authentication को optional बना दिया backward compatibility के लिए

### 3. **Missing Sequelize Import**
- **Problem**: Dashboard stats function में sequelize import missing था
- **Fix**: Sequelize import add कर दिया

## 🚀 **Next Steps**

### 1. **Restart Backend**
```bash
cd Backand
npm start
```

### 2. **Test the API**
Open browser console और check करें कि API calls successful हैं।

### 3. **Check JWT Token**
Browser में localStorage check करें:
```javascript
console.log('Token:', localStorage.getItem('token'));
console.log('Role:', localStorage.getItem('role'));
console.log('User ID:', localStorage.getItem('userId'));
```

## 🎯 **How It Works Now**

### **For CMO Users:**
1. **Login** → JWT token में `user_id` और `role` fields होते हैं
2. **API Call** → Backend automatically filters by `submitted_by_user_id = user_id`
3. **Response** → सिर्फ CMO के own enquiries return होते हैं

### **For Other Users:**
1. **No Filtering** → सभी enquiries दिखते हैं जैसे पहले थे

## 🔍 **Debug Steps**

### 1. **Check Backend Logs**
Backend console में ये logs दिखने चाहिए:
```
Decoded user: { user_id: 123, role: 'CMO', ... }
```

### 2. **Check API Response**
Network tab में API response check करें:
```json
{
  "success": true,
  "data": [...],
  "filtered": true,
  "user_id": 123
}
```

### 3. **Check Frontend Console**
Frontend console में ये logs दिखने चाहिए:
```
CMO Dashboard: Showing X enquiries created by current user
```

## 🛠 **If Still Not Working**

### 1. **Check JWT Secret**
Backend में `.env` file check करें:
```
JWT_SECRET=your-secret-key
```

### 2. **Check Token Format**
JWT token format check करें - यह valid होना चाहिए।

### 3. **Manual Test**
Postman या curl से API test करें:
```bash
curl -H "Authorization: Bearer YOUR_TOKEN" http://localhost:4000/api/enquiries
```

## 📝 **Expected Behavior**

### **CMO User Login:**
- Dashboard shows: "Showing only your enquiries" indicator
- API calls return filtered data
- Statistics show only user's enquiries

### **Admin/Other Users:**
- No filtering applied
- All enquiries visible
- No "filtered" indicator

Your CMO filtering should now work correctly! 🎉