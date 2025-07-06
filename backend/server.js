// server.js
const express = require("express");
const dotenv = require("dotenv");
const connectDB = require("./config/db.js");
const cors = require("cors"); 

dotenv.config();
connectDB();

const app = express();

app.use(cors({
  origin: 'http://localhost:5173',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}));


app.use(express.json());

// Routes
const userVerificationRoutes = require("./routes/userVerificationRoutes");
const internshipRoutes = require("./routes/internshipManagementRoutes");

app.use("/api/userverification", userVerificationRoutes);
app.use("/api/internships", internshipRoutes);

// Test route
app.get("/", (req, res) => {
  res.send("API is running...");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});