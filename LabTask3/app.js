// 1️⃣ Import express and path
const express = require('express');
const path = require('path');

// 2️⃣ Initialize the app
const app = express();
const PORT = 3000;

// 3️⃣ Set EJS as the template engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// 4️⃣ Serve static files from public folder
app.use(express.static(path.join(__dirname, 'public')));

// 5️⃣ Import routes
const indexRouter = require('./routes/index');

// 6️⃣ Use routes
app.use('/', indexRouter); // Home page with testimonials

// Other pages
app.get('/studio', (req, res) => res.render('studio'));
app.get('/offer', (req, res) => res.render('offer'));
app.get('/gear', (req, res) => res.render('gear'));
app.get('/clients', (req, res) => res.render('clients'));
app.get('/contact', (req, res) => res.render('contact'));

// 7️⃣ Start the server
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
