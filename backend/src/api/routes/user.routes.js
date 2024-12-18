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
