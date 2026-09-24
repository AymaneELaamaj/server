import { BadRequestError } from "../errors/index.js";

export const validateRequest = (schema) => (req, res, next) => {
  const result = schema.safeParse({
    body: req.body,
    params: req.params,
    query: req.query,
  });

  if (!result.success) {
    const errors = result.error.issues.map((issue) => ({
      field: issue.path.join("."),
      message: issue.message,
    }));

    return next(new BadRequestError("Validation failed", errors));
  }

  req.validated = result.data;

  if (result.data.body) {
    req.body = result.data.body;
  }

  if (result.data.params) {
    req.params = result.data.params;
  }

  return next();
};
