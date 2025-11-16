const roleCheck = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }
    const hasRole = allowedRoles.includes(req.userRole);
    if (!hasRole) {
      return res.status(403).json({
        success: false,

        message: "Insufficient permissions",
        requiredRoles: allowedRoles,
        currentRole: req.userRole,
      });
    }
    next();
  };
};
module.exports = roleCheck;
