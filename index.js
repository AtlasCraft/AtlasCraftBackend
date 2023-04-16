// THESE ARE NODE APIs WE WISH TO USE
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const cookieParser = require('cookie-parser');

// CREATE OUR SERVER
dotenv.config();
const PORT = process.env.PORT || 4000;
const app = express();

// SETUP THE MIDDLEWARE
app.use(express.urlencoded({ extended: true }));
app.use(
  cors({
    origin: ['https://atlascraft.onrender.com', 'http://localhost:3000'],
    credentials: true,
  })
);
app.use(cookieParser());
app.use(express.json({ limit: '20mb' }));
app.use(
  express.urlencoded({ limit: '20mb', extended: true, parameterLimit: 50000 })
);

// SETUP OUR OWN ROUTERS AS MIDDLEWARE
const top5listsRouter = require('./routes/top5lists-router');
app.use('/api', top5listsRouter);

// INITIALIZE OUR DATABASE OBJECT
const connectDB = require('./db');
connectDB();

// PUT THE SERVER IN LISTENING MODE
const server = app.listen(PORT, () =>
  console.log(`Server running on port ${PORT}`)
);

module.exports = { app, server };
