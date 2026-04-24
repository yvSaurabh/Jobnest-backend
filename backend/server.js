const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const jobRoutes = require("./routes/jobRoutes");

dotenv.config();

const app = express();

// CORS configuration
const corsOptions = {
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true,
    optionsSuccessStatus: 200,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
};

app.use(cors(corsOptions));
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use("/api/jobs", jobRoutes);

// Health check endpoints
app.get("/", (req, res)=> {
    res.status(200).json({
        success: true,
        message: "JobNest API is running...",
    });
});

app.get("/api/health", (req, res)=> {
    res.status(200).json({
        success: true,
        message: "JobNest backend is healthy",
        timestamp: new Date().toISOString(),
    });
});

// Express 5 no longer accepts a bare "*" route pattern here.
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: "Route not found",
    });
});

// Database connection
if(
    process.env.MONGO_URI &&
    process.env.MONGO_URI !== "your_mongodb_connection_string_here"
) {
    connectDB();
}else{
    console.error("MongoDB connection string is not set. Please set MONGO_URI in your .env file.");
    process.exit(1);
}

const PORT = process.env.PORT || 5000;

app.listen(PORT, ()=> {
    console.log(`✓ Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});
