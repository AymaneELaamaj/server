import { ForbiddenError } from "../errors/index.js";

export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(new ForbiddenError("Access forbidden"));
    }

    return next();
  };
};
