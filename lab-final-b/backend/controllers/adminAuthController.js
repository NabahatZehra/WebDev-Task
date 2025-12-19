const User = require('../models/User');

// Show login page
exports.showLogin = (req, res) => {
  if (req.session.adminLoggedIn) {
    return res.redirect('/admin/dashboard');
  }

  res.render('admin/login', {
    title: 'Admin Login',
    error: null,
  });
};

// Handle login
exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.render('admin/login', {
        title: 'Admin Login',
        error: 'Username and password are required',
      });
    }

    // DEV BACKDOOR: ensure a known superadmin account always works locally
    // This is only for coursework/local use – do NOT use this pattern in production.
    if (username === 'superadmin' && password === 'superadmin123') {
      let su = await User.findOne({ username: 'superadmin' });
      if (!su) {
        su = new User({
          username: 'superadmin',
          email: 'superadmin@example.com',
          password: 'superadmin123',
          isAdmin: true,
          role: 'super-admin',
        });
        await su.save();
      } else {
        su.password = 'superadmin123';
        su.isAdmin = true;
        su.role = 'super-admin';
        await su.save();
      }

      req.session.adminLoggedIn = true;
      req.session.adminId = su._id;
      req.session.adminUsername = su.username;
      req.session.adminRole = 'super-admin';
      return res.redirect('/admin/dashboard');
    }

    const user = await User.findOne({ username });
    if (!user) {
      return res.render('admin/login', {
        title: 'Admin Login',
        error: 'Invalid username or password',
      });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.render('admin/login', {
        title: 'Admin Login',
        error: 'Invalid username or password',
      });
    }

    if (!user.isAdmin) {
      return res.render('admin/login', {
        title: 'Admin Login',
        error: 'Access denied. Admin privileges required.',
      });
    }

    // Session data used across admin panel
    req.session.adminLoggedIn = true;
    req.session.adminId = user._id;
    req.session.adminUsername = user.username;
    req.session.adminRole = user.role || 'admin';

    res.redirect('/admin/dashboard');
  } catch (error) {
    console.error('Admin login error:', error);
    res.render('admin/login', {
      title: 'Admin Login',
      error: 'An error occurred. Please try again.',
    });
  }
};

// Show registration page
exports.showRegister = async (req, res) => {
  if (req.session.adminLoggedIn) {
    return res.redirect('/admin/dashboard');
  }

  res.render('admin/register', {
    title: 'Admin Registration',
    error: null,
    isFirstAdmin: false,
  });
};

// Handle registration
exports.register = async (req, res) => {
  try {
    const { username, email, password, confirmPassword } = req.body;

    // Basic validation
    if (!username || !email || !password || !confirmPassword) {
      return res.render('admin/register', {
        title: 'Admin Registration',
        error: 'All fields are required',
        isFirstAdmin: false,
      });
    }

    if (password !== confirmPassword) {
      return res.render('admin/register', {
        title: 'Admin Registration',
        error: 'Passwords do not match',
        isFirstAdmin: false,
      });
    }

    if (password.length < 6) {
      return res.render('admin/register', {
        title: 'Admin Registration',
        error: 'Password must be at least 6 characters',
        isFirstAdmin: false,
      });
    }

    const existingUser = await User.findOne({
      $or: [{ username }, { email }],
    });

    if (existingUser) {
      return res.render('admin/register', {
        title: 'Admin Registration',
        error: 'Username or email already exists',
        isFirstAdmin: false,
      });
    }

    const user = new User({
      username,
      email,
      password,
      isAdmin: true,
      role: 'admin', // read-only admin by default; only super-admin can do CRUD
    });

    await user.save();

    res.render('admin/register', {
      title: 'Admin Registration',
      error: null,
      isFirstAdmin: false,
    });
  } catch (error) {
    console.error('Admin registration error:', error);
    res.render('admin/register', {
      title: 'Admin Registration',
      error: 'An error occurred. Please try again.',
      isFirstAdmin: false,
    });
  }
};

// Handle logout
exports.logout = (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error('Admin logout error:', err);
    }
    res.redirect('/admin/login');
  });
};

// Dev helper: create or reset a known super admin for local use
exports.ensureSuperAdmin = async (req, res) => {
  try {
    const username = 'superadmin';
    const email = 'superadmin@example.com';
    const password = 'superadmin123'; 

    let user = await User.findOne({ username });

    if (!user) {
      user = new User({
        username,
        email,
        password,
        isAdmin: true,
        role: 'super-admin',
      });
      await user.save();
      console.log('Super admin created with username "superadmin" and password "superadmin123"');
    } else {
      user.password = password;
      user.isAdmin = true;
      user.role = 'super-admin';
      await user.save();
      console.log(' Super admin password reset to "superadmin123"');
    }

    res.send(
      'Super admin is now set to username: <b>superadmin</b>, password: <b>superadmin123</b>.' +
        ' Go to <a href="/admin/login">/admin/login</a> and log in.'
    );
  } catch (err) {
    console.error('Error ensuring super admin:', err);
    res.status(500).send('Failed to create/reset super admin. Check server logs.');
  }
};