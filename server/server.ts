import "dotenv/config";
import express, { Express } from "express";
import cors from "cors";
import rateLimit from "express-rate-limit";
import path from "path";
import scrapeRouter from "./routes/scrape";
import logger from "./utils/logger";

const app: Express = express();
const PORT = process.env.PORT || 5000;

// When the app is behind a proxy (NGINX, Vercel, Cloudflare, etc.) the
// `X-Forwarded-For` header will be present. express-rate-limit expects
// Express to trust the proxy to correctly identify client IPs, otherwise
// it warns. Enable trusting the first proxy hop to fix that warning.
app.set("trust proxy", 1);

// Middleware
app.use(cors()); // Enable CORS for all origins
app.use(express.json()); // Parse JSON bodies

// Rate limiting: 10 requests per minute per IP
const limiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10, // 10 requests per window
  message: {
    success: false,
    error: "Too many requests, please try again later.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Apply rate limiting to API routes
app.use("/api", limiter);

// API Routes
app.use("/api", scrapeRouter);

// Serve static files in production
if (process.env.NODE_ENV === "production") {
  const distPath = path.join(__dirname, "../dist");
  app.use(express.static(distPath));

  app.get("*", (req, res) => {
    res.sendFile(path.join(distPath, "index.html"));
  });
}

// Start server
app.listen(PORT, () => {
  logger.info(`🚀 Server running on http://localhost:${PORT}`);
  logger.info(`📡 API available at http://localhost:${PORT}/api/scrape`);
});
