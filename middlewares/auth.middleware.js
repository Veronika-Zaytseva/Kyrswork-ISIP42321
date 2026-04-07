const jwt = require('jsonwebtoken');
const pool = require('../config/db');
const AppError = require('../utils/AppError');
exports.attachUser = async (req,res,next)=>{
  try{
    const token = req.cookies.token;
    if(!token){ req.user = null; return next(); }
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const [users] = await pool.query('SELECT id,name,email,role,phone,city,address FROM users WHERE id = ?', [decoded.id]);
    req.user = users[0] || null;
    next();
  }catch(e){ req.user=null; next(); }
};
exports.isAuthenticated = (req,res,next)=> req.user ? next() : res.redirect('/auth/login');
exports.isGuest = (req,res,next)=> req.user ? res.redirect('/') : next();
exports.isAdmin = (req,res,next)=>{
  if(!req.user) return res.redirect('/auth/login');
  if(req.user.role !== 'admin') return next(new AppError('Доступ запрещён. Требуются права администратора.', 403));
  next();
};
