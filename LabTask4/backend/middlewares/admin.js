// Admin middleware - session-based access control

const isAdmin = (req, res, next) => {
  if (req.session && req.session.adminLoggedIn) {
    return next();
  }

  // If not logged in, redirect to login so the UX matches your UI
  return res.redirect('/admin/login');
};

const requireSuperAdmin = (options = {}) => {
  const fallbackPath = options.fallbackPath || '/admin/dashboard';

  return (req, res, next) => {
    if (!req.session || !req.session.adminLoggedIn) {
      // Keep behavior consistent with isAdmin
      return res.redirect('/admin/login');
    }

    if (req.session.adminRole === 'super-admin') {
      return next();
    }

    // If this is an API-style request, return JSON 403
    const accept = (req.headers && req.headers.accept) || '';
    const wantsJson = req.xhr || accept.includes('application/json');

    if (wantsJson) {
      return res.status(403).json({
        error: 'Access denied. Super Admin privileges required.',
      });
    }

    // Otherwise, behave nicely for the admin UI (EJS) and redirect back.
    req.session.errorMessage =
      'Read-only access: only Super Admin can create, update, or delete.';

    const referer = req.get('Referer') || req.get('Referrer');
    return res.redirect(referer || fallbackPath);
  };
};

// Convenience alias (keeps existing name)
const isSuperAdmin = requireSuperAdmin();

module.exports = { isAdmin, isSuperAdmin, requireSuperAdmin };