// Import dependencies
const express = require("express");
const bodyParser = require("body-parser");
const crypto = require("crypto");

const app = express();
const PORT = process.env.PORT || 3000;

// Replace with your Salesforce Connected App's Consumer Secret
const CONSUMER_SECRET =
  "53AEF0D60E313D1351076A0DC074619084D9D671E2F139F1E9B37EF4EB2A6C66";

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Add a GET handler for the root URL `/` to check app status
app.get("/", (req, res) => {
  res.send("The app is running! Use the /canvas route for Salesforce Canvas.");
});

// Handle POST requests to the root URL `/`

app.post("/", (req, res) => {
  const signedRequest = req.body.signed_request;

  if (!signedRequest) {
    return res.status(400).send("Signed request not found.");
  }

  try {
    // Split signed request into signature and payload
    const [encodedSignature, encodedPayload] = signedRequest.split(".");

    // Decode payload
    const payload = Buffer.from(encodedPayload, "base64").toString("utf8");

    // Verify the signature
    const expectedSignature = crypto
      .createHmac("sha256", CONSUMER_SECRET)
      .update(encodedPayload)
      .digest("base64");

    if (expectedSignature !== encodedSignature) {
      throw new Error("Invalid signature.");
    }

    // Parse the payload
    const parsedPayload = JSON.parse(payload);

    // Extract user and org context
    const userContext = parsedPayload.context.user;
    const orgContext = parsedPayload.context.organization;

    // Respond with a simple HTML page
    res.send(`
            <html>
                <head>
                    <title>Canvas App</title>
                </head>
                <body>
                    <h1>Welcome, ${userContext.fullName}!</h1>
                    <p>Email: ${userContext.email}</p>
                    <p>Organization ID: ${orgContext.organizationId}</p>
                </body>
            </html>
        `);
  } catch (error) {
    console.error("Error validating signed request:", error.message);
    res.status(400).send("Invalid signed request.");
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Canvas app running at http://localhost:${PORT}`);
});
