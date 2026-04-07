exports.notFound = (req,res)=> res.status(404).render('error',{ title:'Страница не найдена', message:'Запрошенная страница не существует.', statusCode:404 });
exports.errorHandler = (err,req,res,next)=>{
  console.error('Ошибка:', err);
  res.status(err.statusCode || 500).render('error', {
    title: 'Ошибка',
    message: err.message || 'Внутренняя ошибка сервера',
    statusCode: err.statusCode || 500
  });
};
