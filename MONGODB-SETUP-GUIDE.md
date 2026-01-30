# MongoDB Atlas Setup Guide

## Current Status
✅ MongoDB Atlas account created
✅ Database created with credentials:
- Username: `Wisal_user`
- Password: `Shoeb8999941541`

## Next Steps

### 1. Get Your Connection String

1. Go to your MongoDB Atlas dashboard: https://cloud.mongodb.com/
2. Click on your cluster (usually named "Cluster0")
3. Click the **"Connect"** button
4. Select **"Connect your application"**
5. Choose **"Node.js"** as the driver
6. Copy the connection string - it will look like:
   ```
   mongodb+srv://Wisal_user:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```

### 2. Update Environment Files

You need to update the connection string in **TWO** files:

#### File 1: `apps/backend/.env` (Development)
Replace this line:
```
MONGODB_URI=mongodb+srv://Wisal_user:Shoeb8999941541@cluster0.xxxxx.mongodb.net/wisal?retryWrites=true&w=majority
```

With your actual connection string, making sure to:
- Replace `<password>` with `Shoeb8999941541`
- Replace `cluster0.xxxxx` with your actual cluster address
- Add `/wisal` before the `?` to specify the database name

Example:
```
MONGODB_URI=mongodb+srv://Wisal_user:Shoeb8999941541@cluster0.abc123.mongodb.net/wisal?retryWrites=true&w=majority
```

#### File 2: `apps/backend/.env.test` (Testing)
Replace this line:
```
MONGODB_URI=mongodb+srv://Wisal_user:Shoeb8999941541@cluster0.xxxxx.mongodb.net/wisal_test?retryWrites=true&w=majority
```

With the same connection string, but use `/wisal_test` as the database name:
```
MONGODB_URI=mongodb+srv://Wisal_user:Shoeb8999941541@cluster0.abc123.mongodb.net/wisal_test?retryWrites=true&w=majority
```

### 3. Important Notes

- **Database Names**: We use two separate databases:
  - `wisal` - for development
  - `wisal_test` - for testing (keeps test data separate)

- **Security**: 
  - Never commit `.env` files to git (they're already in `.gitignore`)
  - The password is visible in the connection string, which is normal for MongoDB Atlas

- **Network Access**: 
  - Make sure your IP address is whitelisted in MongoDB Atlas
  - Go to "Network Access" in Atlas and add your current IP
  - Or allow access from anywhere (0.0.0.0/0) for development

### 4. Verify Connection

After updating the files, test the connection:

```bash
cd apps/backend
npm test
```

If you see:
```
✅ Connected to MongoDB
✅ MongoDB indexes created
```

Then your connection is working!

### 5. Troubleshooting

**Error: "MongoServerError: bad auth"**
- Check that the password is correct
- Make sure there are no special characters that need URL encoding

**Error: "MongoNetworkError: connection timeout"**
- Check your internet connection
- Verify your IP is whitelisted in MongoDB Atlas Network Access
- Check if your firewall is blocking MongoDB connections

**Error: "MongoServerError: user is not allowed"**
- Verify the username is correct
- Check that the user has read/write permissions on the database

## What I've Done

✅ Created `.env` file with template
✅ Created `.env.test` file for testing
✅ Fixed static initialization issues in ProductController
✅ Updated tests to connect to MongoDB before running
✅ Created test setup file to load test environment

## What You Need to Do

1. Get your MongoDB Atlas connection string
2. Update `apps/backend/.env` with the correct connection string
3. Update `apps/backend/.env.test` with the correct connection string
4. Run `npm test` to verify everything works

Once you provide the connection string or update the files, we can run the tests!
