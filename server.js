const express = require('express');
const { Pool } = require('pg');
require('dotenv').config();

// Database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Create an Express app and listen for incoming requests on port 3000
const app = express();
const router = express.Router();
const port = process.env.PORT || 3000;

// Use middleware to parse incoming requests with JSON and URL-encoded payloads
app.use(express.json());
app.use(express.urlencoded());

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("Internal Server Error");
});

// Handle GET requests to the root URL
router.get("/", (req, res) => {
  res.send("Welcome to the Webhook Server!");
});

// Handle POST requests to specific URLs i.e. webhook endpoints
router.post("/github-app", async (req, res) => {
  const payload = req.body;

  try {
      await pool.query('INSERT INTO webhooks (payload) VALUES ($1)', [payload]);
      res.status(200).send('Webhook received and stored successfully.');
  } catch (error) {
      console.error('Error storing webhook:', error);
      res.status(500).send('Internal Server Error');
  }
  // get the record id of the last inserted record and return in console log
  const { rows } = await pool.query('SELECT id FROM webhooks ORDER BY id DESC LIMIT 1');
  // ([timestamp]) Recieved webhook from GitHub: {id}
  console.log(`[${new Date().toISOString()}] Received webhook from GitHub: ${rows[0].id}`);
});

router.post("/test-1", (req, res) => {
  console.log(req.body);
  res.send("Test 1 weebhook successfully received.");
});

// Mount the router middleware
app.use(router);

// Start the server and listen for incoming connections
app.listen(port, () => {
  console.log(`Server running at https://localhost:${port}/`);
});
