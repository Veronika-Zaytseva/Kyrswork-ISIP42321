const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const pool = require('../config/db');
const AppError = require('../utils/AppError');
const { signToken, setAuthCookie, clearAuthCookie } = require('../utils/auth');
const { sendResetEmail } = require('../utils/mailer');
exports.getRegister = (req,res)=> res.render('auth/register', { title:'Регистрация' });
exports.postRegister = async (req,res)=>{
  const { name, email, password, confirmPassword } = req.body;
  if(password !== confirmPassword) throw new AppError('Пароли не совпадают.', 400);
  const [existing] = await pool.query('SELECT id FROM users WHERE email = ?', [email]);
  if(existing.length) throw new AppError('Пользователь с таким email уже существует.', 400);
  const password_hash = await bcrypt.hash(password, 10);
  const [result] = await pool.query('INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)', [name, email, password_hash, 'user']);
  setAuthCookie(res, signToken({ id: result.insertId, role: 'user' }));
  res.redirect('/');
};
exports.getLogin = (req,res)=> res.render('auth/login', { title:'Вход' });
exports.postLogin = async (req,res)=>{
  const { email, password } = req.body;
  const [users] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
  if(!users.length) throw new AppError('Неверный email или пароль.', 401);
  const user = users[0];
  if(!(await bcrypt.compare(password, user.password_hash))) throw new AppError('Неверный email или пароль.', 401);
  setAuthCookie(res, signToken(user));
  res.redirect('/');
};
exports.logout = (req,res)=>{ clearAuthCookie(res); res.redirect('/auth/login'); };
exports.getForgotPassword = (req,res)=> res.render('auth/forgot-password', { title:'Восстановление пароля' });
exports.postForgotPassword = async (req,res)=>{
  const { email } = req.body;
  const [users] = await pool.query('SELECT id, email FROM users WHERE email = ?', [email]);
  if(users.length){
    const rawToken = crypto.randomBytes(32).toString('hex');
    const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');
    const expiresAt = new Date(Date.now() + 60*60*1000);
    await pool.query('INSERT INTO password_reset_tokens (user_id, token_hash, expires_at) VALUES (?, ?, ?)', [users[0].id, tokenHash, expiresAt]);
    await sendResetEmail({ to: users[0].email, resetLink: `${process.env.BASE_URL}/auth/reset-password/${rawToken}` });
  }
  res.render('auth/forgot-password-success', { title:'Письмо отправлено' });
};
exports.getResetPassword = async (req,res)=> res.render('auth/reset-password', { title:'Новый пароль', token: req.params.token });
exports.postResetPassword = async (req,res)=>{
  const { token } = req.params;
  const { password, confirmPassword } = req.body;
  if(password !== confirmPassword) throw new AppError('Пароли не совпадают.', 400);
  const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
  const [tokens] = await pool.query(`SELECT * FROM password_reset_tokens WHERE token_hash = ? AND used_at IS NULL AND expires_at > NOW() ORDER BY id DESC LIMIT 1`, [tokenHash]);
  if(!tokens.length) throw new AppError('Ссылка для сброса пароля недействительна или устарела.', 400);
  await pool.query('UPDATE users SET password_hash = ? WHERE id = ?', [await bcrypt.hash(password,10), tokens[0].user_id]);
  await pool.query('UPDATE password_reset_tokens SET used_at = NOW() WHERE id = ?', [tokens[0].id]);
  res.redirect('/auth/login');
};
