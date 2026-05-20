import express, { type Express } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import pinoHttp from "pino-http";
import router from "./routes";
import { logger } from "./lib/logger";
import { buildCorsOptions, securityHeaders } from "./lib/security";
import { authMiddleware } from "./middlewares/authMiddleware";
import { errorHandler, notFoundHandler } from "./middlewares/errorHandler";

const app: Express = express();

// Trust the reverse-proxy sitting in front (Replit / nginx). This makes
// req.ip resolve to the real client IP from X-Forwarded-For instead of the
// proxy address, which is required for per-client rate-limit keys.
app.set("trust proxy", 1);

app.use(
  pinoHttp({
    logger,
    serializers: {
      req(req) {
        return {
          id: req.id,
          method: req.method,
          url: req.url?.split("?")[0],
        };
      },
      res(res) {
        return {
          statusCode: res.statusCode,
        };
      },
    },
  }),
);
app.use(securityHeaders);
app.use(cors(buildCorsOptions()));
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(authMiddleware);

app.use("/api", router);

// 404 for unknown /api routes
app.use("/api", notFoundHandler);

// Centralised error handler — must be registered after routes
app.use(errorHandler);

export default app;
