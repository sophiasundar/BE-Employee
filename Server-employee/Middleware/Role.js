



const roleMiddleware = (role) => {
    return (req, res, next) => {
        if (req.user && req.user.role === role) {
            next();
        } else {
            res.status(403).json({ message: 'Access Denied: Insufficient Permissions' });
        }
    };
};

module.exports = roleMiddleware;
