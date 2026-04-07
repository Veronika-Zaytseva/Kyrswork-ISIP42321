const bcrypt = require('bcryptjs');
const pool = require('../config/db');
const AppError = require('../utils/AppError');
exports.getProfile = async (req,res)=>{
  const [users] = await pool.query('SELECT id, name, email, role, phone, city, address, created_at FROM users WHERE id = ?', [req.user.id]);
  res.render('profile/index',{ title:'Профиль пользователя', userProfile: users[0] });
};
exports.updateProfile = async (req,res)=>{
  const { name, phone, city, address } = req.body;
  await pool.query('UPDATE users SET name = ?, phone = ?, city = ?, address = ? WHERE id = ?', [name, phone || null, city || null, address || null, req.user.id]);
  res.redirect('/profile');
};
exports.changePassword = async (req,res)=>{
  const { currentPassword, newPassword, confirmPassword } = req.body;
  if(newPassword !== confirmPassword) throw new AppError('Новые пароли не совпадают.', 400);
  const [users] = await pool.query('SELECT id, password_hash FROM users WHERE id = ?', [req.user.id]);
  if(!(await bcrypt.compare(currentPassword, users[0].password_hash))) throw new AppError('Текущий пароль введён неверно.', 400);
  await pool.query('UPDATE users SET password_hash = ? WHERE id = ?', [await bcrypt.hash(newPassword,10), req.user.id]);
  res.redirect('/profile');
};
