function requireLogin(req, res, next) {
  if (!req.session?.user) {
    return res.status(401).json({ error: 'NON_AUTENTICATO' });
  }
  next();
}

function requireRole(role) {
  return (req, res, next) => {
    if (!req.session?.user) return res.status(401).json({ error: 'NON_AUTENTICATO' });
    if (req.session.user.role !== role) return res.status(403).json({ error: 'NON_AUTORIZZATO' });
    next();
  };
}

module.exports = { requireLogin, requireRole };
