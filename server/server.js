// // server/server.js
// const express = require('express');
// const mongoose = require('mongoose');
// const cors = require('cors');
// const Booking = require('./models/Booking');

// const app = express();
// app.use(cors());
// app.use(express.json());
// app.use(express.static('public'));

// mongoose.connect("mongodb://localhost:27017/autobooking", {
//   useNewUrlParser: true,
//   useUnifiedTopology: true
// }).then(() => console.log("MongoDB connected"));

// app.post("/api/book", async (req, res) => {
//   const { from, to } = req.body;
//   try {
//     await Booking.create({ from, to });
//     res.status(201).send("Booked");
//   } catch (err) {
//     res.status(500).send("Failed");
//   }
// });

// app.listen(3000, () => console.log("Server running on http://localhost:3000"));
// // server/server.js (add this below your existing code)
// const User = require('./models/User');
// const bcrypt = require('bcrypt');

// // Signup
// app.post("/api/signup", async (req, res) => {
//   const { name, email, password } = req.body;
//   const userExists = await User.findOne({ email });
//   if (userExists) return res.status(400).json({ message: "User already exists" });

//   const hashed = await bcrypt.hash(password, 10);
//   await User.create({ name, email, password: hashed });
//   res.status(201).json({ message: "User created" });
// });

// // Login
// app.post("/api/login", async (req, res) => {
//   const { email, password } = req.body;
//   const user = await User.findOne({ email });
//   if (!user) return res.status(404).json({ message: "User not found" });

//   const isMatch = await bcrypt.compare(password, user.password);
//   if (!isMatch) return res.status(401).json({ message: "Invalid credentials" });

//   res.status(200).json({ message: "Login successful" });
// });






// server/server.js

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const session = require('express-session');
const bcrypt = require('bcrypt');
const Booking = require('./models/Booking');
const User = require('./models/User');

const app = express();

// Middleware
app.use(cors({
  origin: 'http://localhost:3000', // Adjust if your frontend runs elsewhere
  credentials: true
}));
app.use(express.json());
app.use(express.static('public'));

// ✅ Session Middleware
app.use(
  session({
    secret: 'your-secret-key',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false } // Set to true if using HTTPS
  })
);

// ✅ MongoDB Connection
mongoose.connect("mongodb://localhost:27017/autobooking", {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => console.log("MongoDB connected"));

// ✅ Signup Route
app.post("/api/signup", async (req, res) => {
  const { name, email, password } = req.body;
  const userExists = await User.findOne({ email });
  if (userExists) return res.status(400).json({ message: "User already exists" });

  const hashed = await bcrypt.hash(password, 10);
  await User.create({ name, email, password: hashed });
  res.status(201).json({ message: "User created" });
});

// ✅ Login Route (Creates Session)
app.post("/api/login", async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user) return res.status(404).json({ message: "User not found" });

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) return res.status(401).json({ message: "Invalid credentials" });

  // Save user session
  req.session.user = { id: user._id, email: user.email };
  res.status(200).json({ message: "Login successful" });
});

// ✅ Middleware to check if user is authenticated
function isAuthenticated(req, res, next) {
  if (req.session && req.session.user) {
    next();
  } else {
    res.status(401).json({ message: "Unauthorized. Please login first." });
  }
}

// ✅ Booking Route (Only for Logged-in Users)
app.post("/api/book", isAuthenticated, async (req, res) => {
  const { from, to } = req.body;
  try {
    await Booking.create({
      from,
      to,
      userId: req.session.user.id
    });
    res.status(201).json({ message: "Auto booked successfully" });
  } catch (err) {
    res.status(500).json({ message: "Failed to book" });
  }
});

// ✅ Check Auth Status (for frontend)
app.get("/api/check-auth", (req, res) => {
  if (req.session && req.session.user) {
    res.status(200).json({ loggedIn: true });
  } else {
    res.status(401).json({ loggedIn: false });
  }
});

// ✅ Logout Route
app.get("/api/logout", (req, res) => {
  req.session.destroy(() => {
    res.clearCookie("connect.sid");
    res.status(200).json({ message: "Logged out" });
  });
});

// ✅ Start Server
app.listen(3000, () => console.log("Server running on http://localhost:3000"));


// Example session check route
app.get("/api/checkAuth", (req, res) => {
    if (req.session && req.session.user) {
      res.json({ loggedIn: true, user: req.session.user });
    } else {
      res.json({ loggedIn: false });
    }
  });
  