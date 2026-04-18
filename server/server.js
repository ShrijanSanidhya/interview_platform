const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./db');
const http = require('http');
const { Server } = require('socket.io');
const setupSockets = require('./sockets');

// Load env vars
dotenv.config();

// Connect to database
connectDB();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

// Middleware
app.use(cors());
app.use(express.json());

// Load Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/rooms', require('./routes/roomRoutes'));
app.use('/api/questions', require('./routes/questionRoutes'));
app.use('/api/execute', require('./routes/executionRoutes'));
app.use('/api/sessions', require('./routes/sessionRoutes'));

// Basic route
app.get('/', (req, res) => {
  res.send('API is running...');
});

// Setup sockets
setupSockets(io);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
