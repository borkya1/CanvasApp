const express = require("express");
const bodyParser = require("body-parser");
const app = express();

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Add the root route
app.get("/", (req, res) => {
  res.send("The app is running! Use the /canvas route for Salesforce Canvas.");
});

// Add your existing POST /canvas route here
app.post("/canvas", (req, res) => {
  const signedRequest = req.body.signed_request;

  if (!signedRequest) {
    return res.status(400).send("Signed request not found.");
  }

  res.send("Hello from Salesforce Canvas!");
});

// Use dynamic PORT for Heroku
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
