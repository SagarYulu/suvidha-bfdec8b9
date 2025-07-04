import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  try {
    const server = await registerRoutes(app);

    app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
      const status = err.status || err.statusCode || 500;
      const message = err.message || "Internal Server Error";

      res.status(status).json({ message });
      console.error("Express error handler:", err);
    });

    // Serve a simple development page while we fix the Vite setup
    app.get("*", (req, res) => {
      if (req.path.startsWith("/api")) {
        return; // Don't interfere with API routes
      }
      res.send(`
        <!DOCTYPE html>
        <html lang="en">
          <head>
            <meta charset="UTF-8" />
            <meta name="viewport" content="width=device-width, initial-scale=1.0" />
            <title>Yulu Employee Management System</title>
            <style>
              body { 
                font-family: Arial, sans-serif; 
                margin: 0; 
                padding: 20px; 
                background-color: #f5f5f5; 
              }
              .container { 
                max-width: 800px; 
                margin: 0 auto; 
                background: white; 
                padding: 30px; 
                border-radius: 8px; 
                box-shadow: 0 2px 10px rgba(0,0,0,0.1); 
              }
              .header { 
                color: #2c3e50; 
                margin-bottom: 20px; 
                text-align: center;
              }
              .status { 
                color: #27ae60; 
                font-weight: bold; 
                text-align: center;
                margin: 20px 0;
              }
              .login-form {
                max-width: 400px;
                margin: 30px auto;
                padding: 20px;
                background: #f8f9fa;
                border-radius: 8px;
              }
              .form-group {
                margin-bottom: 15px;
              }
              label {
                display: block;
                margin-bottom: 5px;
                font-weight: bold;
              }
              input[type="email"], input[type="password"] {
                width: 100%;
                padding: 10px;
                border: 1px solid #ddd;
                border-radius: 4px;
                font-size: 16px;
              }
              button {
                width: 100%;
                padding: 12px;
                background: #3498db;
                color: white;
                border: none;
                border-radius: 4px;
                font-size: 16px;
                cursor: pointer;
              }
              button:hover {
                background: #2980b9;
              }
              .api-link { 
                color: #0066cc; 
                text-decoration: none; 
                padding: 8px 12px; 
                display: inline-block; 
                margin: 4px; 
                border-radius: 4px; 
                background: #f8f9fa; 
              }
              .api-link:hover { 
                background: #e9ecef; 
                text-decoration: underline; 
              }
              .section { 
                margin: 20px 0; 
                text-align: center;
              }
              .api-links {
                display: flex;
                flex-wrap: wrap;
                justify-content: center;
                gap: 10px;
              }
            </style>
          </head>
          <body>
            <div class="container">
              <h1 class="header">🚲 Yulu Employee Management System</h1>
              <p class="status">✅ Server is running successfully!</p>
              
              <div class="login-form">
                <h2>Quick Login Test</h2>
                <p>Test the authentication system:</p>
                <form id="loginForm">
                  <div class="form-group">
                    <label for="email">Email:</label>
                    <input type="email" id="email" name="email" value="admin@yulu.com" required>
                  </div>
                  <div class="form-group">
                    <label for="password">Password:</label>
                    <input type="password" id="password" name="password" value="password" required>
                  </div>
                  <button type="submit">Login</button>
                </form>
                <div id="loginResult"></div>
              </div>
              
              <div class="section">
                <h2>API Endpoints</h2>
                <p>Test the following API endpoints:</p>
                <div class="api-links">
                  <a href="/api/employees" class="api-link">GET /api/employees</a>
                  <a href="/api/dashboard-users" class="api-link">GET /api/dashboard-users</a>
                  <a href="/api/issues" class="api-link">GET /api/issues</a>
                  <a href="/api/master-roles" class="api-link">GET /api/master-roles</a>
                  <a href="/api/master-cities" class="api-link">GET /api/master-cities</a>
                  <a href="/api/master-clusters" class="api-link">GET /api/master-clusters</a>
                </div>
              </div>
            </div>
            
            <script>
              document.getElementById('loginForm').addEventListener('submit', async function(e) {
                e.preventDefault();
                const email = document.getElementById('email').value;
                const password = document.getElementById('password').value;
                const resultDiv = document.getElementById('loginResult');
                
                try {
                  const response = await fetch('/api/auth/login', {
                    method: 'POST',
                    headers: {
                      'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ email, password }),
                  });
                  
                  const data = await response.json();
                  
                  if (response.ok) {
                    resultDiv.innerHTML = '<p style="color: green;">✅ Login successful! ' + JSON.stringify(data) + '</p>';
                  } else {
                    resultDiv.innerHTML = '<p style="color: red;">❌ Login failed: ' + data.message + '</p>';
                  }
                } catch (error) {
                  resultDiv.innerHTML = '<p style="color: red;">❌ Error: ' + error.message + '</p>';
                }
              });
            </script>
          </body>
        </html>
      `);
    });

    // ALWAYS serve the app on port 5000
    // this serves both the API and the client.
    // It is the only port that is not firewalled.
    const port = 5000;
    server.listen(port, "0.0.0.0", () => {
      log(`serving on port ${port}`);
      console.log(`Server is now listening on http://0.0.0.0:${port}`);
    });
    
    // Add error handling for server
    server.on('error', (err) => {
      console.error('Server error:', err);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
})();
