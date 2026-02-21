require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const profileRoutes = require('./routes/profileRoutes');
const careerRoutes = require('./routes/careerRoutes');
const roadmapRoutes = require('./routes/roadmapRoutes');
const gamificationRoutes = require('./routes/gamificationRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');
const careerDbaRoutes = require('./routes/careerDnaRoutes');
require('./services/reminderCron').startCrons();
const app = express();

// CORS Configuration
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));

app.use(express.json());

// Define Routes (will add in later phases)
app.get('/', (req, res) => res.send('API Running'));
app.use('/api/auth', authRoutes);
app.use('/api/user/profile', profileRoutes);
app.use('/api/careers', careerRoutes);
app.use('/api/roadmap', roadmapRoutes);
app.use('/api/gamification', gamificationRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/career-dna', careerDbaRoutes);

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
    connectDB();
    console.log(`Server started on port ${PORT}`)

});