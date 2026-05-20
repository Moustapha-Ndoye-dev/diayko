import type { RequestHandler } from "express";
import type { CorsOptions } from "cors";

type SecurityEnv = {
  nodeEnv?: string;
  corsOrigins?: string;
  jwtSecret?: string;
};

function isProduction(env: Pick<SecurityEnv, "nodeEnv">) {
  return env.nodeEnv === "production";
}

function parseCorsOrigins(raw: string | undefined) {
  return new Set(
    (raw ?? "")
      .split(",")
      .map((origin) => origin.trim())
      .filter(Boolean),
  );
}

export function isCorsOriginAllowed(origin: string | undefined, env: SecurityEnv = {}) {
  if (!origin) return true;
  if (!isProduction(env)) return true;

  const allowedOrigins = parseCorsOrigins(env.corsOrigins);
  return allowedOrigins.has(origin);
}

export function resolveSecurityConfig(env: SecurityEnv = {}) {
  const nodeEnv = env.nodeEnv ?? process.env.NODE_ENV;
  const corsOrigins = env.corsOrigins ?? process.env.CORS_ORIGINS;
  const jwtSecret = env.jwtSecret ?? process.env.JWT_SECRET;
  const minJwtSecretLength = nodeEnv === "production" ? 32 : 16;

  if (jwtSecret !== undefined && jwtSecret.length < minJwtSecretLength) {
    throw new Error(
      `JWT_SECRET must be at least ${minJwtSecretLength} characters in ${nodeEnv ?? "development"}`,
    );
  }

  return {
    allowedOrigins: parseCorsOrigins(corsOrigins),
    minJwtSecretLength,
    nodeEnv,
  };
}

export function validateJwtSecret(secret: string | undefined) {
  const { minJwtSecretLength, nodeEnv } = resolveSecurityConfig({ jwtSecret: secret });
  if (!secret || secret.length < minJwtSecretLength) {
    throw new Error(
      `JWT_SECRET must be set (min ${minJwtSecretLength} characters in ${nodeEnv ?? "development"})`,
    );
  }
  return secret;
}

export function buildCorsOptions(): CorsOptions {
  return {
    credentials: true,
    origin(origin, callback) {
      callback(
        null,
        isCorsOriginAllowed(origin, {
          nodeEnv: process.env.NODE_ENV,
          corsOrigins: process.env.CORS_ORIGINS,
        })
          ? origin ?? true
          : false,
      );
    },
  };
}

export const securityHeaders: RequestHandler = (_req, res, next) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  res.setHeader("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
  res.setHeader("Cross-Origin-Opener-Policy", "same-origin");
  next();
};
