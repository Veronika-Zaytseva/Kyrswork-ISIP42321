const pool = require('../config/db');
const AppError = require('../utils/AppError');
exports.createOrder = async (req,res,next)=>{
  const connection = await pool.getConnection();
  try{
    await connection.beginTransaction();
    const [cartItems] = await connection.query(`SELECT ci.id, ci.quantity, p.id AS product_id, p.name, p.price, ps.id AS product_size_id, ps.size, ps.stock FROM cart_items ci JOIN products p ON p.id = ci.product_id JOIN product_sizes ps ON ps.id = ci.product_size_id WHERE ci.user_id = ? FOR UPDATE`, [req.user.id]);
    if(!cartItems.length) throw new AppError('Корзина пуста.', 400);
    let totalAmount = 0;
    for(const item of cartItems){
      if(item.stock < item.quantity) throw new AppError(`Недостаточно товара на складе: ${item.name}, ${item.size}.`, 400);
      totalAmount += Number(item.price) * item.quantity;
    }
    const [orderResult] = await connection.query(`INSERT INTO orders (user_id, total_amount, status, delivery_address, comment) VALUES (?, ?, 'new', ?, ?)`, [req.user.id, totalAmount, req.body.deliveryAddress, req.body.comment || null]);
    for(const item of cartItems){
      await connection.query(`INSERT INTO order_items (order_id, product_id, product_size_id, product_name, size_name, price, quantity) VALUES (?, ?, ?, ?, ?, ?, ?)`, [orderResult.insertId, item.product_id, item.product_size_id, item.name, item.size, item.price, item.quantity]);
      await connection.query('UPDATE product_sizes SET stock = stock - ? WHERE id = ?', [item.quantity, item.product_size_id]);
    }
    await connection.query('DELETE FROM cart_items WHERE user_id = ?', [req.user.id]);
    await connection.commit();
    res.redirect('/orders');
  }catch(e){ await connection.rollback(); next(e); } finally { connection.release(); }
};
exports.getUserOrders = async (req,res)=>{
  const [orders] = await pool.query('SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC', [req.user.id]);
  for(const order of orders){
    const [items] = await pool.query('SELECT product_name, size_name, price, quantity FROM order_items WHERE order_id = ?', [order.id]);
    order.items = items;
  }
  res.render('shop/orders',{ title:'Мои заказы', orders });
};
