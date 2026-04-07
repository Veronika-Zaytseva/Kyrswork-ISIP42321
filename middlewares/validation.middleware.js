const { validationResult } = require('express-validator');
module.exports = (req,res,next)=>{
  const errors = validationResult(req);
  if(!errors.isEmpty()){
    return res.status(400).render('error',{
      title:'Ошибка валидации',
      message: errors.array().map(x=>x.msg).join(' '),
      statusCode:400
    });
  }
  next();
};
