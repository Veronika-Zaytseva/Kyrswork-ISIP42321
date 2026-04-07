const jwt = require('jsonwebtoken');
exports.signToken = (user)=> jwt.sign({ id:user.id, role:user.role }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' });
exports.setAuthCookie = (res, token)=> res.cookie('token', token, { httpOnly:true, sameSite:'lax', secure:false, maxAge:7*24*60*60*1000 });
exports.clearAuthCookie = (res)=> res.clearCookie('token');
