const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const { testEmailConnection } = require('./utils/emailService');

// Test email on startup
testEmailConnection().then(ok => {
  if (ok) console.log('[Server] Email service ready');
  else console.log('[Server] Email service not configured — notifications disabled');
});

const app = express();
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/mentormap')
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error(err));

app.use('/api/auth', require('./routes/auth'));
app.use('/api/students', require('./routes/students'));
app.use('/api/materials', require('./routes/materials'));
app.use('/api/quiz', require('./routes/quiz'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/ml', require('./routes/ml'));
app.use('/api/academic', require('./routes/academic'));
app.use('/api/counseling', require('./routes/counseling'));
app.use('/api/classification', require('./routes/classification'));


app.listen(5000, () => console.log('Server running on port 5000'));
