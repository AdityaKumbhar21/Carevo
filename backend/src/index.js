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
const quizRoutes = require('./routes/quizRoutes');
const taskRoutes = require('./routes/taskRoutes');
const badgeRoutes = require('./routes/badgeRoutes');
require('./services/reminderCron').startCrons();
const app = express();

// CORS Configuration — allow local dev ports and optional FRONTEND_URL
const frontendDefault = process.env.FRONTEND_URL || null;
const corsWhitelist = [frontendDefault, 'http://localhost:5173', 'http://localhost:5174'].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    // allow non-browser requests like curl/postman (no origin)
    if (!origin) return callback(null, true);
    if (corsWhitelist.includes(origin)) return callback(null, true);
    return callback(new Error('CORS policy: Origin not allowed'));
  },
  credentials: true,
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
app.use('/api/quiz', quizRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/badges', badgeRoutes);
// Course Intelligence routes removed

const PORT = process.env.PORT || 5001;

// Ensure DB is connected before starting to accept requests
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server started on port ${PORT}`);
  });
}).catch((err) => {
  console.error('Failed to start server due to DB connection error:', err.message);
  process.exit(1);
});