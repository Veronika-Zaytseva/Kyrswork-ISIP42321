const pool = require('../config/db');
const AppError = require('../utils/AppError');
exports.getHome = (req,res)=> res.redirect('/catalog');
exports.getCatalog = async (req,res)=>{
  const { category='', gender='', sort='newest', minPrice='', maxPrice='', search='', page=1 } = req.query;
  const currentPage = Math.max(Number(page)||1, 1);
  const limit = 6;
  const offset = (currentPage - 1) * limit;
  let whereSql = ' WHERE p.is_active = 1 ';
  const params = [];
  if(category){ whereSql += ' AND p.category = ?'; params.push(category); }
  if(gender){ whereSql += ' AND p.gender = ?'; params.push(gender); }
  if(minPrice){ whereSql += ' AND p.price >= ?'; params.push(Number(minPrice)); }
  if(maxPrice){ whereSql += ' AND p.price <= ?'; params.push(Number(maxPrice)); }
  if(search){ whereSql += ' AND (p.name LIKE ? OR p.description LIKE ?)'; params.push(`%${search}%`, `%${search}%`); }
  let orderSql = ' ORDER BY p.created_at DESC';
  if(sort==='price_asc') orderSql=' ORDER BY p.price ASC';
  if(sort==='price_desc') orderSql=' ORDER BY p.price DESC';
  if(sort==='name_asc') orderSql=' ORDER BY p.name ASC';
  const [countRows] = await pool.query(`SELECT COUNT(*) AS total FROM products p ${whereSql}`, params);
  const totalItems = countRows[0].total;
  const totalPages = Math.max(Math.ceil(totalItems / limit), 1);
  const [products] = await pool.query(`SELECT p.* FROM products p ${whereSql} ${orderSql} LIMIT ? OFFSET ?`, [...params, limit, offset]);
  const [categories] = await pool.query('SELECT DISTINCT category FROM products WHERE is_active = 1 ORDER BY category ASC');
  res.render('shop/catalog', { title:'Каталог товаров', products, categories, filters:{ category, gender, sort, minPrice, maxPrice, search }, pagination:{ currentPage, totalPages, totalItems, limit } });
};
exports.getProductById = async (req,res,next)=>{
  const [products] = await pool.query('SELECT * FROM products WHERE id = ? AND is_active = 1', [req.params.id]);
  if(!products.length) return next(new AppError('Товар не найден.',404));
  const [sizes] = await pool.query('SELECT * FROM product_sizes WHERE product_id = ? ORDER BY size ASC', [req.params.id]);
  res.render('shop/product', { title:products[0].name, product:products[0], sizes });
};
