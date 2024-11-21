// Import dependencies
const express = require("express");
const bodyParser = require("body-parser");
const crypto = require("crypto");
const axios = require("axios");
const querystring = require("querystring");

const app = express();
const PORT = process.env.PORT || 3000;
// Added
const cors = require("cors");
app.use(cors());

// Replace with your Salesforce Connected App's Consumer Secret, Client ID, and Client Secret
const CONSUMER_SECRET =
  "53AEF0D60E313D1351076A0DC074619084D9D671E2F139F1E9B37EF4EB2A6C66";
const CLIENT_ID =
  "3MVG9X12xD2kqQmZIJflaXSMc74GMYs5QPy.87_QX7RgK2gWgbgzOwW6ZJ.ALe0IoJQX_wSessdU.cUOYfYs.";
const CLIENT_SECRET = "YOUR_CLIENT_SECRET";

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Middleware to log all incoming requests
app.use((req, res, next) => {
  console.log(`Incoming request: ${req.method} ${req.url}`);
  next();
});

// Helper function to get Salesforce access token
async function getSalesforceAccessToken() {
  const tokenResponse = await axios.post(
    "https://login.salesforce.com/services/oauth2/token",
    querystring.stringify({
      grant_type: "client_credentials",
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
    }),
    {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    }
  );
  return tokenResponse.data.access_token;
}

// Helper function to verify signed request
function verifySignedRequest(signedRequest) {
  const [encodedSignature, encodedPayload] = signedRequest.split(".");
  const expectedSignature = crypto
    .createHmac("sha256", CONSUMER_SECRET)
    .update(encodedPayload)
    .digest("base64");

  if (expectedSignature !== encodedSignature) {
    throw new Error("Invalid signature.");
  }
  return JSON.parse(Buffer.from(encodedPayload, "base64").toString("utf8"));
}

// Helper function to generate HTML response
function generateHtmlResponse(userContext, orgContext, salesforceData, title) {
  return `
    <html>
      <head>
        <title>Canvas App</title>
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/salesforce-lightning-design-system/2.14.3/styles/salesforce-lightning-design-system.min.css" />
        <style>
          body {
              background: linear-gradient(135deg, #f5f7fa, #ffddc1);
              color: #333;
              font-family: Arial, sans-serif;
          }
          .canvas-header {
              text-align: center;
              padding: 20px;
              background: #ff6f61;
              color: #fff;
              border-radius: 10px;
          }
          .canvas-content {
              background: #ffffff;
              padding: 30px;
              border-radius: 10px;
              box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.1);
          }
          .oauth-button {
              margin-top: 20px;
              text-align: center;
          }
        </style>
      </head>
      <body class="slds-scope">
        <div class="slds-grid slds-gutters slds-align_absolute-center">
          <div class="slds-col slds-size_1-of-1">
            <div class="canvas-header">
              <h1 class="slds-text-heading_large">${title}</h1>
            </div>
            <div class="slds-box canvas-content slds-p-around_large">
              <h2 class="slds-text-heading_medium">Welcome, ${
                userContext.fullName
              }!</h2>
              <p class="slds-text-body_regular">User ID: ${
                userContext.userId
              }</p>
              <p class="slds-text-body_regular">Username: ${
                userContext.userName
              }</p>
              <p class="slds-text-body_regular">Email: ${userContext.email}</p>
              <p class="slds-text-body_regular">Role: ${userContext.role}</p>
              <p class="slds-text-body_regular">Profile ID: ${
                userContext.profileId
              }</p>
              <p class="slds-text-body_regular">Organization ID: ${
                orgContext.organizationId
              }</p>
              <p class="slds-text-body_regular">Organization Name: ${
                orgContext.name
              }</p>
              <p class="slds-text-body_regular">Currency ISO Code: ${
                orgContext.currencyIsoCode
              }</p>
              <p class="slds-text-body_regular">Instance URL: ${
                orgContext.instanceUrl
              }</p>
              <p class="slds-text-body_regular">Salesforce Data: ${JSON.stringify(
                salesforceData
              )}</p>
              <div class="oauth-button">
                <button onclick="launchOAuthFlow()" class="slds-button slds-button_brand">Launch OAuth Flow</button>
              </div>
            </div>
          </div>
        </div>
        <script>
          async function launchOAuthFlow() {
            try {
              const response = await fetch('/launch-oauth', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json'
                },
                body: JSON.stringify({ userId: '${userContext.userId}' })
              });
              const data = await response.json();
              alert('Federation Identifier: ' + data.federationIdentifier);
            } catch (error) {
              console.error('Error launching OAuth flow:', error);
              alert('Error launching OAuth flow. Please check console for details.');
            }
          }
        </script>
      </body>
    </html>
  `;
}

// Add a GET handler for the root URL `/` to check app status
app.get("/", (req, res) => {
  res.send(`
            <html>
                <head>
                    <title>Canvas App</title>
                    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/salesforce-lightning-design-system/2.14.3/styles/salesforce-lightning-design-system.min.css" />
                    <style>
                        body {
                            background: linear-gradient(135deg, #f5f7fa, #c3cfe2);
                            color: #333;
                            font-family: Arial, sans-serif;
                        }
                        .canvas-header {
                            text-align: center;
                            padding: 20px;
                            background: #006dcc;
                            color: #fff;
                            border-radius: 10px;
                        }
                        .canvas-content {
                            background: #ffffff;
                            padding: 30px;
                            border-radius: 10px;
                            box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.1);
                        }
                        .oauth-button {
                            margin-top: 20px;
                            text-align: center;
                        }
                    </style>
                </head>
                <body class="slds-scope">
                    <div class="slds-grid slds-gutters slds-align_absolute-center">
                        <div class="slds-col slds-size_1-of-1">
                            <div class="canvas-header">
                                <h1 class="slds-text-heading_large">You are in a Heroku Canvas App (GET call)</h1>
                            </div>
                            <div class="slds-box canvas-content slds-p-around_large">
                                <h2 class="slds-text-heading_medium">Welcome, Swapnil Borkar!</h2>
                                <p class="slds-text-body_regular">Email: swapnil.brokar@salesforce.com</p>
                                <p class="slds-text-body_regular">Organization ID: 00DDm000000HJmqMAG</p>
                                <div class="oauth-button">
                                    <button onclick="launchOAuthFlow()" class="slds-button slds-button_brand">Launch OAuth Flow</button>
                                </div>
                            </div>
                        </div>
                    </div>
                    <script>
                        async function launchOAuthFlow() {
                            try {
                                const response = await fetch('/launch-oauth', {
                                    method: 'POST',
                                    headers: {
                                        'Content-Type': 'application/json'
                                    },
                                    body: JSON.stringify({ userId: '00DDm000000HJmqMAG' })
                                });
                                const data = await response.json();
                                alert('Federation Identifier: ' + data.federationIdentifier);
                            } catch (error) {
                                console.error('Error launching OAuth flow:', error);
                                alert('Error launching OAuth flow. Please check console for details.');
                            }
                        }
                    </script>
                </body>
            </html>
        `);
});

// Handle POST requests to the root URL `/`
app.post("/", async (req, res) => {
  const signedRequest = req.body.signed_request;

  if (!signedRequest) {
    return res.status(400).send("Signed request not found.");
  }

  try {
    // Verify the signed request
    const parsedPayload = verifySignedRequest(signedRequest);

    // Extract user and org context
    const userContext = parsedPayload.context.user;
    const orgContext = parsedPayload.context.organization;

    // Get Salesforce access token and fetch Salesforce data
    const accessToken = await getSalesforceAccessToken();
    const salesforceResponse = await axios.get(
      `https://swapnilbor-230220-26-demo.lightning.force.com/services/data/v54.0/sobjects/Account`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    // Respond with the HTML page
    res.send(
      generateHtmlResponse(
        userContext,
        orgContext,
        salesforceResponse.data,
        "You are in a Heroku Canvas App"
      )
    );
  } catch (error) {
    console.error(
      "Error validating signed request or OAuth flow:",
      error.message
    );
    res.status(400).send("Invalid signed request or OAuth error.");
  }
});

// Endpoint to handle OAuth flow and fetch user FederationIdentifier
app.post("/launch-oauth", async (req, res) => {
  const { userId } = req.body;

  try {
    const accessToken = await getSalesforceAccessToken();
    const userResponse = await axios.get(
      `https://swapnilbor-230220-26-demo.lightning.force.com/services/data/v54.0/sobjects/User/${userId}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );
    const federationIdentifier = userResponse.data.FederationIdentifier;
    res.json({ federationIdentifier });
  } catch (error) {
    console.error("Error fetching user data:", error.message);
    res.status(500).send("Error fetching user data.");
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Canvas app running at http://localhost:${PORT}`);
});
