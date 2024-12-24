const { isAuth } = require('../../middleware/auth.middleware');
const { upload } = require('../../middleware/files.middleware');
const {
  register,
  login,
  changePassword,
  sendPassword,
  modifyPassword,
  update,
  deleteUser,
  resendCode,
  checkNewUser,
  autoLogin,
} = require('../controllers/user.controllers');


const express = require('express');
const UserRoutes = express.Router();


/**
 * En las rutas podemos entrar los middleware de subida de fichero y 
 * sobretodo si ese endpoint necesita el token para pasar la autenticacion 
 * del usuario y comprobar si es autorizado, es decir si cumple condiciones 
 * especificas para poder ir al controlador 
 * Por ejemplo un controlador que solo sea para un usuario administrador, si 
 * entra con token valido, tendrá que ser tambien administrador para ser usuario
 * autorizado y autenticado
 */
UserRoutes.post('/register', upload.single('image'), register);
UserRoutes.post('/resend', resendCode);
UserRoutes.patch('/forgotpassword', changePassword);
UserRoutes.post('/login', login);
UserRoutes.post('/login/autologin', autoLogin);
UserRoutes.patch('/changepassword', [isAuth], modifyPassword);
UserRoutes.patch('/update/update', [isAuth], upload.single('image'), update);
UserRoutes.delete('/', [isAuth], deleteUser);
UserRoutes.post('/check', checkNewUser);

//!---------------- REDIRECT-------------------------------
UserRoutes.patch('/sendPassword/:id', sendPassword);
module.exports = UserRoutes;
