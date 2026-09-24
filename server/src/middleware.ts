import type { ErrorRequestHandler, RequestHandler } from "express";

export const notFound: RequestHandler = (req, res) => {
  res.status(404).json({ error: `Route not found: ${req.method} ${req.path}` });
};

export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  const status = (err as Error & { status?: number }).status || 500;
  if (status >= 500) console.error("[error]", err);
  res.status(status).json({ error: err instanceof Error ? err.message : "Internal server error" });
};

export const asyncH = <T extends RequestHandler>(fn: T): RequestHandler =>
  (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
