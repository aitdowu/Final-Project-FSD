// simple middleware to check if user is logged in
function requireAuth(req, res, next) {
  if (!req.session || !req.session.userId) {
    return res.redirect('/auth/login');
  }
  next();
}

module.exports = requireAuth;

