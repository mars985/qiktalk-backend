const { ApiError } = require("../utils/ApiError");

const validate = (schema) => {
    return (req, res, next) => {
        const result = schema.safeParse(req.body);

        if (!result.success) {
            return next(
                new ApiError(400, "Validation failed", result.error.issues)
            );
        }

        req.body = result.data;
        next();
    };
}

module.exports = { validate };