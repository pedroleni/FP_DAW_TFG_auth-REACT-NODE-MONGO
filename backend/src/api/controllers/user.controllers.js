const { deleteImgCloudinary } = require('../../middleware/files.middleware');
const setError = require('../../helpers/handle-error');
const randomCode = require('../../utils/randomCode');

const bcrypt = require('bcrypt');
const dotenv = require('dotenv');
dotenv.config();
const User = require('../models/user.model');
const nodemailer = require('nodemailer');
const { generateToken } = require('../../utils/token');
const randomPassword = require('../../utils/randomPassword');

const BASE_URL = process.env.BASE_URL;

//! -----------------------------------------------------------------------------
//? ----------------------------REGISTER LARGO EN CODIGO ------------------------
//! -----------------------------------------------------------------------------
const register = async (req, res, next) => {
  let catchImg = req.file?.path;
  try {
    await User.syncIndexes();
    let confirmationCode = randomCode();
    const { email, name } = req.body;

    const userExist = await User.findOne(
      { email: req.body.email },
      { name: req.body.name }
    );
    if (!userExist) {
      const newUser = new User({ ...req.body, confirmationCode });
      if (req.file) {
        newUser.image = req.file.path;
      } else {
        newUser.image = 'https://pic.onlinewebfonts.com/svg/img_181369.png';
      }
      try {
        const userSave = await newUser.save();

        if (userSave) {
          const emailEnv = process.env.EMAIL;
          const password = process.env.PASSWORD;

          const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
              user: emailEnv,
              pass: password,
            },
          });

          const mailOptions = {
            from: emailEnv,
            to: email,
            subject: 'Confirmation code',
            text: `tu codigo es ${confirmationCode}, gracias por confiar en nosotros ${name}`,
          };

          transporter.sendMail(mailOptions, function (error, info) {
            if (error) {
              console.log(error);
              return res.status(404).json({
                user: userSave,
                confirmationCode: 'error, resend code',
              });
            } else {
              console.log('Email sent: ' + info.response);
              return res.status(200).json({
                user: userSave,
                confirmationCode,
              });
            }
          });
        }
      } catch (error) {
        return res.status(404).json(error.message);
      }
    } else {
      if (req.file) deleteImgCloudinary(catchImg);
      return res.status(409).json('this user already exist');
    }
  } catch (error) {
    if (req.file) deleteImgCloudinary(catchImg);
    return next(error);
  }
};

//! -----------------------------------------------------------------------------
//? --------------------------------LOGIN ---------------------------------------
//! -----------------------------------------------------------------------------

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const userDB = await User.findOne({ email });

    if (userDB) {
      if (bcrypt.compareSync(password, userDB.password)) {
        const token = generateToken(userDB._id, email);
        return res.status(200).json({
          user: userDB,
          token,
        });
      } else {
        return res.status(404).json('password dont match');
      }
    } else {
      return res.status(404).json('User no register');
    }
  } catch (error) {
    return next(error);
  }
};

//! -----------------------------------------------------------------------------
//? --------------------------------AUTOLOGIN ---------------------------------------
//! -----------------------------------------------------------------------------

const autoLogin = async (req, res, next) => {};

//! -----------------------------------------------------------------------------
//? -----------------------RESEND CODE -----------------------------
//! -----------------------------------------------------------------------------
const resendCode = async (req, res, next) => {};

//! ------------------------------------------------------------------------
//? -------------------------- CHECK NEW USER------------------------------
//! ------------------------------------------------------------------------

const checkNewUser = async (req, res, next) => {};

//! -----------------------------------------------------------------------------
//? -----------------------CONTRASEÑAS Y SUS CAMBIOS-----------------------------
//! -----------------------------------------------------------------------------

//? -----------------------------------------------------------------------------
//! ------------------CAMBIO DE CONTRASEÑA CUANDO NO ESTAS LOGADO---------------
//? -----------------------------------------------------------------------------

const changePassword = async (req, res, next) => {};

const sendPassword = async (req, res, next) => {};

//? -----------------------------------------------------------------------------
//! ------------------CAMBIO DE CONTRASEÑA CUANDO YA SE ESTA ESTA LOGADO---------------
//? -----------------------------------------------------------------------------
const modifyPassword = async (req, res, next) => {};

//! -----------------------------------------------------------------------------
//? ---------------------------------UPDATE--------------------------------------
//! -----------------------------------------------------------------------------
const update = async (req, res, next) => {};

//! -----------------------------------------------------------------------------
//? ----------------------------- DELETE ----------------------------------------
//! -----------------------------------------------------------------------------

const deleteUser = async (req, res, next) => {};

module.exports = {
  register,
  resendCode,
  login,
  changePassword,
  sendPassword,
  modifyPassword,
  update,
  deleteUser,
  checkNewUser,
  autoLogin,
};
