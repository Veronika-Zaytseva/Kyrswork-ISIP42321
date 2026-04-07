const pool = require('../config/db');
const AppError = require('../utils/AppError');
function parseSizesString(sizesString){
  if(!sizesString || !sizesString.trim()) return [];
  return sizesString.split(',').map(x=>x.trim()).filter(Boolean).map(pair=>{
    const [size, stock] = pair.split(':').map(x=>x.trim());
    return { size, stock: Number(stock) };
  }).filter(item=>item.size && !Number.isNaN(item.stock) && item.stock >= 0);
}
exports.getDashboard = async (req,res)=>{
  const [products] = await pool.query('SELECT * FROM products ORDER BY created_at DESC');
  res.render('admin/dashboard',{ title:'Админ-панель', products });
};
exports.getCreateProduct = (req,res)=> res.render('admin/product-form',{ title:'Добавить товар', product:null, sizesString:'' });
exports.postCreateProduct = async (req,res)=>{
  const { name, description, category, gender, price, is_active, sizes } = req.body;
  const imageUrl = req.file ? `/uploads/${req.file.filename}` : null;
  const [result] = await pool.query(`INSERT INTO products (name, description, category, gender, price, image_url, is_active) VALUES (?, ?, ?, ?, ?, ?, ?)`, [name, description, category, gender, price, imageUrl, is_active === 'on' ? 1 : 0]);
  for(const item of parseSizesString(sizes)){
    await pool.query('INSERT INTO product_sizes (product_id, size, stock) VALUES (?, ?, ?)', [result.insertId, item.size, item.stock]);
  }
  res.redirect('/admin');
};
exports.getEditProduct = async (req,res,next)=>{
  const [products] = await pool.query('SELECT * FROM products WHERE id = ?', [req.params.id]);
  if(!products.length) return next(new AppError('Товар не найден.', 404));
  const [sizes] = await pool.query('SELECT size, stock FROM product_sizes WHERE product_id = ? ORDER BY size ASC', [req.params.id]);
  res.render('admin/product-form',{ title:'Редактировать товар', product:products[0], sizesString: sizes.map(x=>`${x.size}:${x.stock}`).join(', ') });
};
exports.postUpdateProduct = async (req,res)=>{
  const { name, description, category, gender, price, is_active, sizes } = req.body;
  const [cur] = await pool.query('SELECT image_url FROM products WHERE id = ?', [req.params.id]);
  const imageUrl = req.file ? `/uploads/${req.file.filename}` : (cur[0]?.image_url || null);
  await pool.query(`UPDATE products SET name = ?, description = ?, category = ?, gender = ?, price = ?, image_url = ?, is_active = ? WHERE id = ?`, [name, description, category, gender, price, imageUrl, is_active === 'on' ? 1 : 0, req.params.id]);
  await pool.query('DELETE FROM product_sizes WHERE product_id = ?', [req.params.id]);
  for(const item of parseSizesString(sizes)){
    await pool.query('INSERT INTO product_sizes (product_id, size, stock) VALUES (?, ?, ?)', [req.params.id, item.size, item.stock]);
  }
  res.redirect('/admin');
};
exports.deleteProduct = async (req,res)=>{ await pool.query('DELETE FROM products WHERE id = ?', [req.params.id]); res.redirect('/admin'); };
exports.getOrders = async (req,res)=>{
  const [orders] = await pool.query(`SELECT o.*, u.name AS user_name, u.email AS user_email FROM orders o JOIN users u ON u.id = o.user_id ORDER BY o.created_at DESC`);
  for(const order of orders){
    const [items] = await pool.query('SELECT product_name, size_name, price, quantity FROM order_items WHERE order_id = ?', [order.id]);
    order.items = items;
  }
  res.render('admin/orders',{ title:'Заказы', orders });
};
exports.getUsers = async (req,res)=>{
  const [users] = await pool.query(`SELECT u.id, u.name, u.email, u.role, u.created_at, COUNT(o.id) AS orders_count FROM users u LEFT JOIN orders o ON o.user_id = u.id GROUP BY u.id ORDER BY u.created_at DESC`);
  res.render('admin/users',{ title:'Пользователи', users });
};
