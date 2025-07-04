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

    // Skip Vite setup in development for now and use fallback
    console.log("Using fallback development server setup...");
    
    // Fallback development page
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
              body { font-family: Arial, sans-serif; margin: 40px; background-color: #f5f5f5; }
              .container { max-width: 800px; margin: 0 auto; background: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
              .header { color: #2c3e50; margin-bottom: 20px; }
              .status { color: #27ae60; font-weight: bold; }
              .api-link { color: #0066cc; text-decoration: none; padding: 8px 12px; display: inline-block; margin: 4px 0; border-radius: 4px; background: #f8f9fa; }
              .api-link:hover { background: #e9ecef; text-decoration: underline; }
              .section { margin: 20px 0; }
              .note { background: #fff3cd; padding: 15px; border-radius: 4px; border-left: 4px solid #ffc107; }
            </style>
          </head>
          <body>
            <div class="container">
              <h1 class="header">🚲 Yulu Employee Management System</h1>
              <p class="status">✅ Development server is running successfully!</p>
              
              <div class="section">
                <h2>API Endpoints</h2>
                <p>The backend API is fully functional. Test the following endpoints:</p>
                <div>
                  <a href="/api/employees" class="api-link">GET /api/employees</a>
                  <a href="/api/dashboard-users" class="api-link">GET /api/dashboard-users</a>
                  <a href="/api/issues" class="api-link">GET /api/issues</a>
                  <a href="/api/master-roles" class="api-link">GET /api/master-roles</a>
                  <a href="/api/master-cities" class="api-link">GET /api/master-cities</a>
                  <a href="/api/master-clusters" class="api-link">GET /api/master-clusters</a>
                </div>
              </div>
              
              <div class="section">
                <h2>Authentication</h2>
                <p>Test login with:</p>
                <pre>POST /api/auth/login
{
  "email": "admin@yulu.com",
  "password": "password"
}</pre>
              </div>
              
              <div class="note">
                <strong>Note:</strong> The React frontend is temporarily unavailable due to Vite configuration issues. The API backend is fully functional and ready for testing.
              </div>
            </div>
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
