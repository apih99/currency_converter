const express = require('express');
const connectDB = require('./config/db');
const cors = require('cors');
require('dotenv').config();

connectDB();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = 3000;

app.get('/', (req, res) => {
  res.send('Welcome to the Real-Time Currency Converter API!');
});

app.use('/api/users', require('./routes/users'));
app.use('/api/favorites', require('./routes/favorites'));
app.use('/api/currency', require('./routes/currency')); // <-- ADD THIS

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
