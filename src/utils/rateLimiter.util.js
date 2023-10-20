let rateLimiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minutes
    max: 100,
    message: {
        error: {
            code: 429,
            message: "Too Many Requests",
            description: "We're sorry, but you have exceeded the maximum number of requests allowed. Please try again later."
        }
    },
    standardHeaders: true,
    legacyHeaders: false
});