const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const apiRoutes = require('./routes/api');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// ---------------------------
// ✅ CORS MUST COME FIRST
// ---------------------------
app.use(cors({
  origin: "http://localhost:3000",
  methods: "GET,POST",
  credentials: true
}));

// ---------------------------
// Middleware
// ---------------------------
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// ---------------------------
// Routes
// ---------------------------
app.use('/api', apiRoutes);

// ---------------------------
// Health check
// ---------------------------
app.get('/', (req, res) => {
  res.json({ message: 'PDF Vartalaap API is running' });
});

// ---------------------------
// Error handler
// ---------------------------
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// ---------------------------
// Start server
// ---------------------------
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
