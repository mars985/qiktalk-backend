# QikTalk Backend

A real-time chat application backend built with Node.js, Express, Socket.IO, and MongoDB.

## Setup Instructions

### 1. Install Dependencies
```bash
npm install
```

### 2. Environment Configuration
Create a `.env` file in the root directory by copying from the example:
```bash
cp .env.example .env
```

Update the `.env` file with your configuration:
```env
# MongoDB Connection
MONGO_URI=mongodb://localhost:27017/qiktalk

# Server Configuration  
PORT=3000

# Frontend URL for CORS
FRONTEND_URL=http://localhost:3000

# JWT Secret (generate a secure random string)
JWT_SECRET=your_secure_jwt_secret_here
```

### 3. MongoDB Setup Options

#### Option A: Local MongoDB
1. Install MongoDB locally
2. Start MongoDB service: `mongod`
3. Use connection string: `mongodb://localhost:27017/qiktalk`

#### Option B: MongoDB Atlas (Cloud)
1. Create account at [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create a cluster
3. Get connection string and replace in `.env`:
   ```
   MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/qiktalk
   ```

### 4. Run the Application
```bash
# Development mode with auto-restart
npm run dev

# Production mode
npm start
```

## Troubleshooting MongoDB Connection

If you see connection errors:
1. Ensure MongoDB is running (local) or accessible (Atlas)
2. Check your `.env` file exists and has correct `MONGO_URI`
3. Verify network connectivity for Atlas connections
4. Check MongoDB logs for authentication issues
