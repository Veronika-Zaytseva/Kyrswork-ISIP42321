const bcrypt = require('bcryptjs');
const pool = require('../config/db');
const AppError = require('../utils/AppError');
const { signToken, setAuthCookie, clearAuthCookie } = require('../utils/auth');

exports.getRegister = (req,res)=> res.render('auth/register', { title:'Регистрация' });

exports.postRegister = async (req,res)=>{
  const { name, email, password, confirmPassword } = req.body;

  if(password !== confirmPassword) {
    throw new AppError('Пароли не совпадают.', 400);
  }

  const [existing] = await pool.query(
    'SELECT id FROM users WHERE email = ?',
    [email]
  );

  if(existing.length) {
    throw new AppError('Пользователь с таким email уже существует.', 400);
  }

  const password_hash = await bcrypt.hash(password, 10);

  const [result] = await pool.query(
    'INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)',
    [name, email, password_hash, 'user']
  );

  setAuthCookie(res, signToken({ id: result.insertId, role: 'user' }));
  res.redirect('/');
};

exports.getLogin = (req,res)=> res.render('auth/login', { title:'Вход' });

exports.postLogin = async (req,res)=>{
  const { email, password } = req.body;

  const [users] = await pool.query(
    'SELECT * FROM users WHERE email = ?',
    [email]
  );

  if(!users.length) {
    throw new AppError('Неверный email или пароль.', 401);
  }

  const user = users[0];

  if(!(await bcrypt.compare(password, user.password_hash))) {
    throw new AppError('Неверный email или пароль.', 401);
  }

  setAuthCookie(res, signToken(user));
  res.redirect('/');
};

exports.logout = (req,res)=>{
  clearAuthCookie(res);
  res.redirect('/auth/login');
};