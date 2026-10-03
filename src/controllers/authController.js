const authService = require('../services/authService');
const accountService = require('../services/accountService');

async function register(req, res, next) {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, and password are required',
      });
    }

    const user = await authService.registerUser({ name, email, password });

    res.status(201).json({
      success: true,
      message: 'Account created successfully',
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    next(error);
  }
}

async function login(req, res, next) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required',
      });
    }

    const { user, token } = await authService.loginUser({ email, password });

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        token,
      },
    });
  } catch (error) {
    next(error);
  }
}

async function deleteAccount(req, res, next) {
  try {
    const { password } = req.body || {};

    if (!password) {
      return res.status(400).json({
        success: false,
        message: 'Password is required to delete your account',
      });
    }

    await accountService.deleteAccount(req.user.id, password);

    res.status(200).json({
      success: true,
      message: 'Account and associated data deleted successfully',
    });
  } catch (error) {
    next(error);
  }
}

async function updatePresence(req, res, next) {
  try {
    const timezone = typeof req.body?.timezone === 'string' && req.body.timezone.trim()
      ? req.body.timezone.trim()
      : undefined;
    const User = require('../models/User');
    const update = { lastActiveAt: new Date() };
    if (timezone) update.timezone = timezone;
    await User.findByIdAndUpdate(req.user.id, update);
    res.status(200).json({ success: true, data: { updated: true } });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  register,
  login,
  deleteAccount,
  updatePresence,
};