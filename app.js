// Import dependencies
const express = require("express");
const bodyParser = require("body-parser");
const crypto = require("crypto");

const app = express();
const PORT = process.env.PORT || 3000;
// Added
const cors = require("cors");
app.use(cors());

// Replace with your Salesforce Connected App's Consumer Secret
const CONSUMER_SECRET =
  "53AEF0D60E313D1351076A0DC074619084D9D671E2F139F1E9B37EF4EB2A6C66";

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Middleware to log all incoming requests
app.use((req, res, next) => {
  console.log(`Incoming request: ${req.method} ${req.url}`);
  next();
});

// Add a GET handler for the root URL `/` to check app status
app.get("/", (req, res) => {
  res.send(`
            <html>
                <head>
                    <title>Canvas App</title>
                    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/salesforce-lightning-design-system/2.14.3/styles/salesforce-lightning-design-system.min.css" />
                </head>
                <body class="slds-scope">
                    <div class="slds-grid slds-gutters">
                        <div class="slds-col slds-size_1-of-1">
                            <div class="slds-box slds-theme_default slds-p-around_large">
                                <h1 class="slds-text-heading_large">You are in a Heroku Canvas App  in GET call</h1>
                                <h2 class="slds-text-heading_medium">Welcome, Swapnil Borkar!</h2>
                                <p class="slds-text-body_regular">Email: swapnil.brokar@salesforce.com</p>
                                <p class="slds-text-body_regular">Organization ID: 00DDm000000HJmqMAG</p>
                            </div>
                        </div>
                    </div>
                </body>
            </html>
        `);
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

    // Respond with an HTML page styled with SLDS
    res.send(`
            <html>
                <head>
                    <title>Canvas App</title>
                    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/salesforce-lightning-design-system/2.14.3/styles/salesforce-lightning-design-system.min.css" />
                </head>
                <body class="slds-scope">
                    <div class="slds-grid slds-gutters">
                        <div class="slds-col slds-size_1-of-1">
                            <div class="slds-box slds-theme_default slds-p-around_large">
                                <h1 class="slds-text-heading_large">You are in a Heroku Canvas App</h1>
                                <h2 class="slds-text-heading_medium">Welcome, ${userContext.fullName}!</h2>
                                <p class="slds-text-body_regular">User ID: ${userContext.userId}</p>
                                <p class="slds-text-body_regular">Username: ${userContext.userName}</p>
                                <p class="slds-text-body_regular">Email: ${userContext.email}</p>
                                <p class="slds-text-body_regular">Role: ${userContext.role}</p>
                                <p class="slds-text-body_regular">Profile ID: ${userContext.profileId}</p>
                                <p class="slds-text-body_regular">Organization ID: ${orgContext.organizationId}</p>
                                <p class="slds-text-body_regular">Organization Name: ${orgContext.name}</p>
                                <p class="slds-text-body_regular">Currency ISO Code: ${orgContext.currencyIsoCode}</p>
                                <p class="slds-text-body_regular">Instance URL: ${orgContext.instanceUrl}</p>
                            </div>
                        </div>
                    </div>
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
