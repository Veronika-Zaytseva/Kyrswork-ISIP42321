const nodemailer = require('nodemailer');
exports.transporter = nodemailer.createTransport({
  host: process.env.MAIL_HOST,
  port: Number(process.env.MAIL_PORT || 587),
  secure: false,
  auth: { user: process.env.MAIL_USER, pass: process.env.MAIL_PASSWORD }
});
exports.sendResetEmail = async ({to, resetLink})=>{
  console.log('Ссылка для сброса пароля:', resetLink);
  if(!process.env.MAIL_HOST || !process.env.MAIL_USER) return;
  await exports.transporter.sendMail({
    from: process.env.MAIL_FROM,
    to,
    subject: 'Сброс пароля',
    html: `<h2>Восстановление пароля</h2><p>Для сброса пароля перейдите по ссылке:</p><p><a href="${resetLink}">${resetLink}</a></p><p>Ссылка действует 1 час.</p>`
  });
};
