/**
 * وسيط للمصادقة (Authentication Middleware)
 */

const jwt = require('jsonwebtoken');
const config = require('config');
const logger = require('../utils/logger');

/**
 * التحقق من التوكن JWT في رأس الطلب
 * @param {Object} req - كائن الطلب
 * @param {Object} res - كائن الرد
 * @param {Function} next - دالة الانتقال إلى الوسيط التالي
 */
function authenticateToken(req, res, next) {
  // الحصول على التوكن من ر Authorization
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({
      success: false,
      error: 'Access token required'
    });
  }

  // التحقق من صحة التوكن
  jwt.verify(token, config.api.jwt.secret, (err, user) => {
    if (err) {
      logger.warn('Invalid token', {
        error: err.message,
        requestId: req.id
      });

      return res.status(403).json({
        success: false,
        error: 'Invalid or expired token'
      });
    }

    // إضافة معلومات المستخدم إلى كائن الطلب
    req.user = user;
    next();
  });
}

/**
 * التحقص من صلاحيات المستخدم
 * @param {Array} roles - الأدوار المسموح بها
 * @returns {Function} - دالة الوسيط
 */
function authorize(roles = []) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required'
      });
    }

    // إذا لم يتم تحديد أدوار، فالجميع مسموح لهم
    if (roles.length && !roles.includes(req.user.role)) {
      logger.warn('Unauthorized access attempt', {
        userId: req.user.id,
        role: req.user.role,
        requestedRoles: roles,
        requestId: req.id
      });

      return res.status(403).json({
        success: false,
        error: 'Insufficient permissions'
      });
    }

    next();
  };
}

/**
 * إنشاء توكن JWT للمستخدم
 * @param {Object} user - معلومات المستخدم
 * @returns {string} - التوكن
 */
function generateToken(user) {
  const payload = {
    id: user.id,
    username: user.username,
    role: user.role || 'user'
  };

  const options = {
    expiresIn: config.api.jwt.expiresIn
  };

  return jwt.sign(payload, config.api.jwt.secret, options);
}

/**
 * التحقق من صحة بيانات تسجيل الدخول
 * @param {Object} req - كائن الطلب
 * @param {Object} res - كائن الرد
 * @param {Function} next - دالة الانتقال إلى الوسيط التالي
 */
async function validateLogin(req, res, next) {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({
      success: false,
      error: 'Username and password are required'
    });
  }

  // في تطبيق حقيقي، هنا سيتم التحقق من بيانات المستخدم من قاعدة البيانات
  // مثال:
  // const user = await getUserByUsername(username);
  // if (!user || !bcrypt.compareSync(password, user.password_hash)) {
  //   return res.status(401).json({
  //     success: false,
  //     error: 'Invalid username or password'
  //   });
  // }

  // مؤقتاً، نستخدم بيانات وهمية
  if (username !== 'admin' || password !== 'password') {
    return res.status(401).json({
      success: false,
      error: 'Invalid username or password'
    });
  }

  next();
}

/**
 * التحقق من صحة بيانات تسجيل المستخدم الجديد
 * @param {Object} req - كائن الطلب
 * @param {Object} res - كائن الرد
 * @param {Function} next - دالة الانتقال إلى الوسيط التالي
 */
async function validateRegister(req, res, next) {
  const { username, email, password, walletAddress } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({
      success: false,
      error: 'Username, email, and password are required'
    });
  }

  // التحقق من تنسيق البريد الإلكتروني
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({
      success: false,
      error: 'Invalid email format'
    });
  }

  // التحقق من قوة كلمة المرور
  if (password.length < 8) {
    return res.status(400).json({
      success: false,
      error: 'Password must be at least 8 characters long'
    });
  }

  // التحقق من تنسيق عنوان المحفظة
  if (walletAddress && !/^0x[a-fA-F0-9]{64}$/.test(walletAddress)) {
    return res.status(400).json({
      success: false,
      error: 'Invalid wallet address format'
    });
  }

  // في تطبيق حقيقي، هنا سيتم التحقق من عدم تكرار اسم المستخدم والبريد الإلكتروني

  next();
}

module.exports = {
  authenticateToken,
  authorize,
  generateToken,
  validateLogin,
  validateRegister
};
