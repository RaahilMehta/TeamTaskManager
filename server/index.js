require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

const authRoutes = require('./routes/auth');
const projectRoutes = require('./routes/projects');
const taskRoutes = require('./routes/tasks');

const app = express();

app.use(cors({
  origin: function(origin, callback) {
    const allowedOrigins = [
      'https://teamtaskmanager-production-b0eb.up.railway.app',
      'https://teamtaskmanager-production-d9d5.up.railway.app'
    ];

    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));
app.use(express.json());

app.get('/api/health', (_req, res) => res.json({ status: 'ok' }));
app.get('/', (req, res) => {
  res.send('Backend is running ');
});

app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/tasks', taskRoutes);

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ message: 'Internal server error' });
});

const PORT = process.env.PORT;

const start = async () => {
  try {
    await connectDB();
    app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
  });
  } catch (err) {
    console.error('Failed to start server:', err.message);
    process.exit(1);
  }
};

start();
