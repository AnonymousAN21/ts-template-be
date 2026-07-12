import { rateLimit } from 'express-rate-limit';

/**
 * A customizable factory function that returns an Express rate-limiting middleware.
 * * @param windowMs - The time window in milliseconds (Defaults to 15 minutes).
 * @param limit - Max number of connections per IP within the window (Defaults to 100).
 * @param message - Custom error response message when limit is exceeded.
 */
export default function setRateLimit(
    windowMs: number = 15 * 60 * 1000, 
    limit: number = 100, 
    message: string = "Too many requests from this IP, please try again later."
) {
    return rateLimit({
        windowMs,
        limit,
        standardHeaders: 'draft-7',
        legacyHeaders: false,
        message: { error: message },
    }); 
}