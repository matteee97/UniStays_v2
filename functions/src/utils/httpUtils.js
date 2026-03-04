"use strict";

const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

const getBearerToken = (req) => {
  const authHeader = req.get("Authorization") || "";
  if (!authHeader.startsWith("Bearer ")) return null;
  return authHeader.slice(7);
};

module.exports = {
  asyncHandler,
  getBearerToken,
};
