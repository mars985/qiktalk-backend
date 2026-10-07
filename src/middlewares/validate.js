const { ApiError } = require("../utils/ApiError");

const validate = (schema, source = "body") => {
    return (req, res, next) => {
        const result = validateData(schema, req[source]);

        if (!result.success) {
            return next(
                new ApiError(400, "Validation failed", result.error.issues)
            );
        }

        req[source] = result.data;
        next();
    };
}

const validateData = (schema, data) => result = schema.safeParse(data);

module.exports = { validate, validateData };