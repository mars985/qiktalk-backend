const { ApiError } = require("../utils/ApiError");

const validate = (schema, source = "body") => {
    return (req, res, next) => {
        const inputData = {
            ...req[source],
            loggedInUserId: req.user?._id.toString(),
        };

        const result = validateData(schema, inputData);

        if (!result.success) {
            return next(
                new ApiError(400, "Validation failed", result.error.issues)
            );
        }

        req[source] = result.data;
        next();
    };
}

const validateData = (schema, data) => schema.safeParse(data);

module.exports = { validate, validateData };