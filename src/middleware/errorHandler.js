import { AppError } from "../errors/index.js";

const getStatusCode = (error) => {
  if (error instanceof AppError) {
    return error.statusCode;
  }

  if (error.type === "entity.parse.failed") {
    return 400;
  }

  if (error.name === "ValidationError" || error.name === "CastError") {
    return 400;
  }

  if (error.code === 11000) {
    return 409;
  }

  return 500;
};

const getMessage = (error, statusCode) => {
  if (error instanceof AppError) {
    return error.message;
  }

  if (error.type === "entity.parse.failed") {
    return "Invalid JSON payload";
  }

  if (error.name === "ValidationError") {
    return "Validation failed";
  }

  if (error.name === "CastError") {
    return "Invalid resource id";
  }

  if (error.code === 11000) {
    return "Resource already exists";
  }

  if (statusCode >= 500) {
    return "Internal server error";
  }

  return error.message || "Request failed";
};

export const errorHandler = (error, req, res, next) => {
  if (res.headersSent) {
    return next(error);
  }

  const statusCode = getStatusCode(error);
  const response = {
    message: getMessage(error, statusCode),
  };

  if (error.details) {
    response.errors = error.details;
  }

  return res.status(statusCode).json(response);
};
