const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Security and middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'UrbanThread API is running'
  });
});

const server = app.listen(PORT, () => {
  console.log(`UrbanThread API server running on port ${PORT}`);
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`Port ${PORT} is already in use. On macOS, port 5000 is often reserved by AirPlay Receiver. Set PORT=5001 (or another free port) in your .env file.`);
  } else {
    console.error('Server error:', err);
  }
});
