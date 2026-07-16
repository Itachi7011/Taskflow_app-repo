// controllers/authController.js
const User = require("../models/User");
const generateToken = require("../utils/generateToken");
const sendEmail = require("../utils/sendEmail");

// POST /api/auth/register
exports.register = async (req, res, next) => {
  try {
    const { name, email, password, adminCode } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ status: "error", message: "Name, email and password are all required" });
    }

    if (password.length < 8) {
      return res.status(400).json({ status: "error", message: "Password must be atleast 8 characters" });
    }

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(400).json({ status: "error", message: "An account with this email already exists" });
    }

    // adminCode is only ever used by the admin signup page - a normal
    // user signing up never sends this field. without the correct code
    // matching ADMIN_SIGNUP_CODE, nobody can grant themselves admin
    let role = "user";
    if (adminCode) {
      if (!process.env.ADMIN_SIGNUP_CODE || adminCode !== process.env.ADMIN_SIGNUP_CODE) {
        return res.status(403).json({ status: "error", message: "Invalid admin invite code" });
      }
      role = "admin";
    }

    const user = new User({ name, email, password, role });
    const verificationToken = user.generateEmailVerificationToken();
    await user.save();

    const verifyUrl = `${process.env.CLIENT_URL}/verify-email/${verificationToken}`;
    await sendEmail({
      to: user.email,
      subject: "Verify your TaskFlow account",
      html: `<p>Hi ${user.name}, please click the link below to verify your email:</p><a href="${verifyUrl}">${verifyUrl}</a>`,
    });

    const token = generateToken(user._id, user.role);

    res.status(201).json({
      status: "success",
      message: "Account created, please check your email to verify your account",
      token,
      user: user.getPublicProfile(),
    });
  } catch (err) {
    next(err);
  }
};

// POST /api/auth/login
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ status: "error", message: "Email and password are required" });
    }

    const user = await User.findOne({ email: email.toLowerCase() }).select("+password");
    if (!user) {
      return res.status(401).json({ status: "error", message: "Invalid email or password" });
    }

    if (user.isBlocked) {
      return res.status(403).json({ status: "error", message: "This account has been blocked, contact support" });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ status: "error", message: "Invalid email or password" });
    }

    user.lastLogin = new Date();
    await user.save();

    const token = generateToken(user._id, user.role);

    res.status(200).json({
      status: "success",
      token,
      user: user.getPublicProfile(),
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/auth/me
exports.getMe = async (req, res, next) => {
  try {
    res.status(200).json({ status: "success", user: req.user.getPublicProfile() });
  } catch (err) {
    next(err);
  }
};

// POST /api/auth/logout
// there's not much server side state to clear since we're using a
// bearer token, this mostly exists to clear the cookie if the frontend
// happens to be storing it there
exports.logout = async (req, res) => {
  res.clearCookie("token");
  res.status(200).json({ status: "success", message: "Logged out" });
};

// GET /api/auth/verify-email/:token
exports.verifyEmail = async (req, res, next) => {
  try {
    const { token } = req.params;

    const user = await User.findOne({
      verificationToken: token,
      verificationTokenExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ status: "error", message: "Verification link is invalid or has expired" });
    }

    user.emailVerified = true;
    user.verificationToken = undefined;
    user.verificationTokenExpires = undefined;
    await user.save();

    res.status(200).json({ status: "success", message: "Email verified successfully" });
  } catch (err) {
    next(err);
  }
};

// POST /api/auth/forgot-password
exports.forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email: email?.toLowerCase() });

    // dont reveal wether the email exists or not, just always say the same thing
    if (!user) {
      return res.status(200).json({
        status: "success",
        message: "If an account with that email exists, a reset link has been sent",
      });
    }

    const resetToken = user.generatePasswordResetToken();
    await user.save();

    const resetUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;
    await sendEmail({
      to: user.email,
      subject: "Reset your TaskFlow password",
      html: `<p>Click the link below to reset your password. This link expires in 1 hour.</p><a href="${resetUrl}">${resetUrl}</a>`,
    });

    res.status(200).json({
      status: "success",
      message: "If an account with that email exists, a reset link has been sent",
    });
  } catch (err) {
    next(err);
  }
};

// POST /api/auth/reset-password/:token
exports.resetPassword = async (req, res, next) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    if (!password || password.length < 8) {
      return res.status(400).json({ status: "error", message: "Password must be atleast 8 characters" });
    }

    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() },
    }).select("+password");

    if (!user) {
      return res.status(400).json({ status: "error", message: "Reset link is invalid or has expired" });
    }

    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.status(200).json({ status: "success", message: "Password has been reset, you can login now" });
  } catch (err) {
    next(err);
  }
};


exports.bootstrapAdmin = async (req, res, next) => {
  try {
    if (req.headers["x-bootstrap-key"] !== process.env.ADMIN_BOOTSTRAP_KEY) {
      return res.status(403).json({ status: "error", message: "Forbidden" });
    }
    const existingAdmin = await User.findOne({ role: "admin" });
    if (existingAdmin) {
      return res.status(403).json({ status: "error", message: "An admin already exists" });
    }
    const { name, email, password } = req.body;
    const admin = new User({ name, email, password, role: "admin", emailVerified: true });
    await admin.save();
    res.status(201).json({ status: "success", message: "Admin created", user: admin.getPublicProfile() });
  } catch (err) {
    next(err);
  }
};
