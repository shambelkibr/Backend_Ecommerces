function adminMiddleware(req, res, next) {
  if (!req.user || req.user.role !== "admin") {
    return res.status(403).json({ message: "Admin access required" });
  }

  return next();
}

function sellerMiddleware(req, res, next) {
  if (!req.user || (req.user.role !== "seller" && req.user.role !== "admin")) {
    return res.status(403).json({ message: "Seller access required" });
  }

  return next();
}

module.exports = {
  adminMiddleware,
  sellerMiddleware,
};
