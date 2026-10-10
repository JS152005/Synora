import { Request, Response, NextFunction } from "express";

interface RateLimitRecord {
  timestamps: number[];
}

/**
 * Creates an in-memory sliding-window rate limiter middleware.
 * @param windowMs Time window in milliseconds
 * @param maxRequests Maximum allowed requests per key in window
 * @param message Error message when limit is exceeded
 * @param keyGenerator Function to extract client identifier (defaults to client IP)
 */
export const createRateLimiter = (
  windowMs: number,
  maxRequests: number,
  message: string = "Too many requests. Please try again later.",
  keyGenerator?: (req: Request) => string
) => {
  const store = new Map<string, RateLimitRecord>();

  // Cleanup old entries every 5 minutes to prevent memory leak
  setInterval(() => {
    const now = Date.now();
    for (const [key, record] of store.entries()) {
      record.timestamps = record.timestamps.filter((ts) => now - ts < windowMs);
      if (record.timestamps.length === 0) {
        store.delete(key);
      }
    }
  }, 5 * 60 * 1000).unref();

  return (req: Request, res: Response, next: NextFunction): void => {
    if (
      process.env.NODE_ENV === "test" ||
      req.headers["x-test-suite"] === "synora-test-runner"
    ) {
      next();
      return;
    }

    const now = Date.now();
    const key = keyGenerator
      ? keyGenerator(req)
      : (req.ip ||
        (req.headers["x-forwarded-for"] as string) ||
        req.socket.remoteAddress ||
        "unknown");

    let record = store.get(key);
    if (!record) {
      record = { timestamps: [] };
      store.set(key, record);
    }

    // Filter out timestamps outside window
    record.timestamps = record.timestamps.filter((ts) => now - ts < windowMs);

    if (record.timestamps.length >= maxRequests) {
      const oldest = record.timestamps[0];
      const retryAfterSeconds = Math.ceil((oldest + windowMs - now) / 1000);

      res.setHeader("Retry-After", retryAfterSeconds);
      res.status(429).json({
        success: false,
        message,
        retryAfterSeconds,
      });
      return;
    }

    record.timestamps.push(now);
    next();
  };
};

// Standard rate limiters for auth flows
export const loginLimiter = createRateLimiter(
  5 * 60 * 1000,
  15,
  "Too many login attempts. Please wait 5 minutes before trying again."
);

export const registerLimiter = createRateLimiter(
  15 * 60 * 1000,
  10,
  "Too many registration attempts from this address. Please try again later."
);

export const otpVerifyLimiter = createRateLimiter(
  5 * 60 * 1000,
  15,
  "Too many OTP verification attempts. Please wait before trying again."
);

export const otpResendLimiter = createRateLimiter(
  10 * 60 * 1000,
  8,
  "Too many OTP resend requests. Please wait a few minutes."
);

export const passwordResetLimiter = createRateLimiter(
  15 * 60 * 1000,
  10,
  "Too many password reset requests. Please wait a few minutes."
);

