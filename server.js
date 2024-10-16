const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = 5000;

// Middleware to parse JSON data in the request body
app.use(express.json());

// Use middleware
app.use(cors());
app.use(bodyParser.json());

// Initialize SQLite Database
const db = new sqlite3.Database('bookings.db', (err) => {
    if (err) {
      return console.error(err.message);
    }
    console.log('Connected to the SQLite database.');
  });

 // Create table if it doesn't exist
db.run(`CREATE TABLE IF NOT EXISTS bookings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT,
  number TEXT,
  address TEXT,
  date TEXT
)`);

// Predefined admin credentials
const adminUser = 'admin';  // Change these as per your need
const adminPass = '1234';


// API to handle booking (POST request)
app.post('/booking', (req, res) => {
    const { name, number, address } = req.body;
    const currentDate = new Date().toISOString();
  
    const sql = `INSERT INTO bookings (name, number, address, date) VALUES (?, ?, ?, ?)`;
    db.run(sql, [name, number, address, currentDate], function (err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.status(200).json({ message: 'Booking saved successfully', id: this.lastID });
    });
  });

// API to handle admin login (POST request)
app.post('/admin', (req, res) => {
    const { user, password } = req.body;
  
    if (user === adminUser && password === adminPass) {
      // Fetch all bookings from the database
      const sql = `SELECT * FROM bookings`;
      db.all(sql, [], (err, rows) => {
        if (err) {
          return res.status(500).json({ error: err.message });
        }
  
        // Render the data on an HTML page using EJS
        res.render('admin', { bookings: rows });
      });
    } else {
      res.status(401).json({ message: 'Invalid credentials' });
    }
  });
  
  // Set the view engine to EJS
  app.set('view engine', 'ejs');
  app.set('views', path.join(__dirname, 'views'));
  

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on Port : ${PORT}`);
});
