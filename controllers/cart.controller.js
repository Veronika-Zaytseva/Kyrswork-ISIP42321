const pool = require('../config/db');
exports.getCart = async (req,res)=>{
  const [items] = await pool.query(`SELECT ci.id, ci.quantity, p.id AS product_id, p.name, p.price, p.image_url, ps.id AS product_size_id, ps.size FROM cart_items ci JOIN products p ON p.id = ci.product_id JOIN product_sizes ps ON ps.id = ci.product_size_id WHERE ci.user_id = ? ORDER BY ci.created_at DESC`, [req.user.id]);
  const total = items.reduce((sum,item)=>sum+Number(item.price)*item.quantity,0);
  res.render('cart/index',{ title:'Корзина', items, total: total.toFixed(2) });
};
exports.addToCart = async (req,res)=>{
  const { productId, productSizeId, quantity } = req.body;
  const qty = Number(quantity);
  const [sizes] = await pool.query(`SELECT ps.*, p.id AS product_id, p.is_active FROM product_sizes ps JOIN products p ON p.id = ps.product_id WHERE ps.id = ? AND p.id = ?`, [productSizeId, productId]);
  if(!sizes.length) return res.redirect(`/products/${productId}`);
  const s = sizes[0];
  if(!s.is_active || s.stock < qty) return res.redirect(`/products/${productId}`);
  const [existing] = await pool.query('SELECT * FROM cart_items WHERE user_id = ? AND product_size_id = ?', [req.user.id, productSizeId]);
  if(existing.length){
    const newQty = existing[0].quantity + qty;
    if(newQty > s.stock) return res.redirect(`/products/${productId}`);
    await pool.query('UPDATE cart_items SET quantity = ? WHERE id = ?', [newQty, existing[0].id]);
  } else {
    await pool.query('INSERT INTO cart_items (user_id, product_id, product_size_id, quantity) VALUES (?, ?, ?, ?)', [req.user.id, productId, productSizeId, qty]);
  }
  res.redirect('/cart');
};
exports.updateCartItem = async (req,res)=>{
  const qty = Number(req.body.quantity);
  if(qty <= 0){
    await pool.query('DELETE FROM cart_items WHERE id = ? AND user_id = ?', [req.params.id, req.user.id]);
    return res.redirect('/cart');
  }
  const [items] = await pool.query(`SELECT ci.*, ps.stock FROM cart_items ci JOIN product_sizes ps ON ps.id = ci.product_size_id WHERE ci.id = ? AND ci.user_id = ?`, [req.params.id, req.user.id]);
  if(!items.length || qty > items[0].stock) return res.redirect('/cart');
  await pool.query('UPDATE cart_items SET quantity = ? WHERE id = ? AND user_id = ?', [qty, req.params.id, req.user.id]);
  res.redirect('/cart');
};
exports.removeCartItem = async (req,res)=>{ await pool.query('DELETE FROM cart_items WHERE id = ? AND user_id = ?', [req.params.id, req.user.id]); res.redirect('/cart'); };
