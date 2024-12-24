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
//? ----------------------------REGISTER ----------------------------------------
//! -----------------------------------------------------------------------------
const register = async (req, res, next) => {
  // capturamo la imagen por si hae falta borrarla ante un error
  let catchImg = req.file?.path;
  try {
    // sincronizamos los indexes de las claves del modelo que sean unicas por si han cambiado
    await User.syncIndexes();

    /*
     - Generamos el codigo random para poder verificar el email 
     - En el body recibimos el email y el name 
    */
    let confirmationCode = randomCode();
    const { email, name } = req.body;

    // comprobamos que ya exista el usuario porque si ya existe mandaremos un  ERROR

    const userExist = await User.findOne(
      { email: req.body.email },
      { name: req.body.name }
    );
    if (!userExist) {
      // generamos una nueva instancia del modelo de User
      const newUser = new User({ ...req.body, confirmationCode });

      // Gestionamos la imagen, si nos envio una le incluimos la URL en su instancia del modelo
      if (req.file) {
        newUser.image = req.file.path;
      } else {
        newUser.image = 'https://pic.onlinewebfonts.com/svg/img_181369.png';
      }
      try {
        // guardamos el modelo
        const userSave = await newUser.save();
        /**
         * ENVIAMOS EL CORREO
         * - si todo esta correcto enviamos una respuesta 200
         * - si no se envia el correo, enviamos un 404 con el error
         */
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
      // hubo un error porque existe ya el user por lo cual la imagen subida la borramos
      if (req.file) deleteImgCloudinary(catchImg);
      return res.status(409).json('this user already exist');
    }
  } catch (error) {
    /*
    Al haber un error general y no registrarse el usuario, lo que hacemos es borrar la 
    imagen subida previamente por el middleware
    */
    if (req.file) deleteImgCloudinary(catchImg);
    return next(error);
  }
};

//! -----------------------------------------------------------------------------
//? --------------------------------LOGIN ---------------------------------------
//! -----------------------------------------------------------------------------

const login = async (req, res, next) => {
  try {
    /*
    Desde el body recibimos el email y la contraseña y lo primero que hacemos es encontrar
    en la base de datos una coincidencia con este mismo email para comprobar que exista
    */
    const { email, password } = req.body;
    const userDB = await User.findOne({ email });

    if (userDB) {
      /*
      Como existe el usuario comprobamos si son iguales la contraseña encriptada y la no 
      encriptada. Si son iguales generamos el token y mandamos una respuesta 200
      */
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
//? --------------------------------AUTOLOGIN -----------------------------------
//! -----------------------------------------------------------------------------

const autoLogin = async (req, res, next) => {
  try {
    /*
     
    Este controlador servirá para despues de que hemos registrado al usuario hacer el 
    login para que no tenga que volver a meter los datos de login que justo acaba de incluir
    en el registro
     */
    const { email, password } = req.body;
    const userDB = await User.findOne({ email });

    if (userDB) {
      /*
      La unica diferencia del login y el autologin esta en este condicional ya que aqui 
      vamos a comprar dos contraseñas no encriptadas por lo cual no nos hace falta bcrypt
      */
      if (password == userDB.password) {
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
//? -----------------------RESEND CODE ------------------------------------------
//! -----------------------------------------------------------------------------
const resendCode = async (req, res, next) => {
  try {
    // vamos a configurar nodemailer porque tenemos que enviar un codigo
    const email = process.env.EMAIL;
    const password = process.env.PASSWORD;
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: email,
        pass: password,
      },
    });
    // comprobamos si existe el usuario
    const userExists = await User.findOne({ email: req.body.email });

    if (userExists) {
      /*
      Si existe entonces enviamos el email, si es correcto el envio enviamos un 200
      con un resend en false sino lo enviaremos en true
      
      */
      const mailOptions = {
        from: email,
        to: req.body.email,
        subject: 'Confirmation code',
        text: `tu codigo es ${userExists.confirmationCode}`,
      };

      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          console.log(error);
          return res.status(200).json({
            resend: false,
          });
        } else {
          console.log('Email sent: ' + info.response);
          return res.status(200).json({
            resend: true,
          });
        }
      });
    } else {
      return res.status(404).json('User not found');
    }
  } catch (error) {
    return next(setError(500, error.message || 'Error general send code'));
  }
};

//! ------------------------------------------------------------------------
//? -------------------------- CHECK NEW USER------------------------------
//! ------------------------------------------------------------------------

const checkNewUser = async (req, res, next) => {
  try {
    const { email, confirmationCode } = req.body;

    const userExists = await User.findOne({ email });

    if (!userExists) {
      // Si no existe vamos a enviar un 404 indicando el usuario no existe
      return res.status(404).json('User not found');
    } else {
      // vamos a comparar el codigo que recibimos con que esta en la base de datos
      if (confirmationCode === userExists.confirmationCode) {
        // si es igual entonces actualizaremos la propiedad check y la ponemos a true
        try {
          //actualizamos el usuario poniendo la clave check en true
          await userExists.updateOne({ check: true });
        } catch (error) {
          return res.status(404).json(error.message);
        }

        /*
         -----TESTEAMOS QUE SE HAYA ACTUALIZADO CORRECTAMENTE EL USER--------
        */
        const updateUser = await User.findOne({ email });

        // este finOne nos sirve para hacer un ternario que nos diga si la propiedad vale true o false
        return res.status(200).json({
          testCheckOk: updateUser.check == true ? true : false,
        });
      } else {
        /// En caso dec equivocarse con el codigo lo borramos de la base datos y lo mandamos al registro
        await User.findByIdAndDelete(userExists._id);

        // borramos la imagen
        deleteImgCloudinary(userExists.image);
        return res.status(200).json({
          userExists,
          check: false,
          delete: (await User.findById(userExists._id))
            ? 'error delete user'
            : 'ok delete user',
        });
      }
    }
  } catch (error) {
    // siempre en el catch devolvemos un 500 con el error general
    console.log(error);
    return next(setError(500, 'General error check code'));
  }
};

//! -----------------------------------------------------------------------------
//? -----------------------CONTRASEÑAS Y SUS CAMBIOS-----------------------------
//! -----------------------------------------------------------------------------

//? -----------------------------------------------------------------------------
//! ------------------CAMBIO DE CONTRASEÑA CUANDO NO ESTAS LOGADO---------------
//? -----------------------------------------------------------------------------

const changePassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    /**
     * Vamos a buscar el usuario si existe entonces hacemos un redirect para generar
     * la nueva contraseña y enviarla al correo
     */

    const userDb = await User.findOne({ email });

    if (userDb) {
      return res.redirect(
        307,
        `http://localhost:8081/api/v1/users/sendPassword/${userDb._id}`
      );
    } else {
      return res.status(404).json('User no register');
    }
  } catch (error) {
    return next(error);
  }
};

const sendPassword = async (req, res, next) => {
  try {
    /**
     *  Vamos a recibir por el param el id y vamos a buscar el usuario por id
     */

    const { id } = req.params;
    const userDb = await User.findById(id);
    const email = process.env.EMAIL;
    const password = process.env.PASSWORD;
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: email,
        pass: password,
      },
    });
    // generamos la contraseña mediante la funcion que se incluye en util
    let passwordSecure = randomPassword();

    const mailOptions = {
      from: email,
      to: userDb.email,
      subject: '-----',
      text: `User: ${userDb.name}. Your new code login is ${passwordSecure} Hemos enviado esto porque tenemos una solicitud de cambio de contraseña, si no has sido ponte en contacto con nosotros, gracias.`,
    };

    // procedemos a enviar la contraseña por el email
    transporter.sendMail(mailOptions, async function (error, info) {
      if (error) {
        console.log(error);
        return res.status(404).json('dont send email and dont update user');
      } else {
        console.log('Email sent: ' + info.response);
        // encriptamos la contraseña
        const newPasswordBcrypt = bcrypt.hashSync(passwordSecure, 10);

        try {
          // buscamos el usuario por id y actualizamos el usuario la nueva contraseña
          await User.findByIdAndUpdate(id, { password: newPasswordBcrypt });

          // -------COMPROBAMOS QUE SE HAYA ACTUALIZADO CORRECTAMENTE EL USUARIO --------
          const userUpdatePassword = await User.findById(id);

          // comparamos la contraseña generada sin encriptar y la encriptada en la base de datosa
          if (bcrypt.compareSync(passwordSecure, userUpdatePassword.password)) {
            // como son iguales enviamos una respuesta 200
            return res.status(200).json({
              updateUser: true,
              sendPassword: true,
            });
          } else {
            // de no se iguales las contraseñas enviamos un 404 con el error de que no se actualizo
            return res.status(404).json({
              updateUser: false,
              sendPassword: true,
            });
          }
        } catch (error) {
          return res.status(404).json(error.message);
        }
      }
    });
  } catch (error) {
    return next(error);
  }
};

//? -----------------------------------------------------------------------------
//! ------------------CAMBIO DE CONTRASEÑA CUANDO YA SE ESTA ESTA LOGADO---------
//? -----------------------------------------------------------------------------
const modifyPassword = async (req, res, next) => {
  try {
    const { password, newPassword } = req.body;

    /**
     * Recibimos la nueva contraseña y la antigua contraseña y vamos a comparar si la actual
     * contraseña es igual a la registrada en la base de datos
     */

    const { _id } = req.user;
    if (bcrypt.compareSync(password, req.user.password)) {
      /**
       * Si son iguales vamos a encriptar la contraseña y actualizar
       * el usuario con la nueva contraseña
       */
      const newPasswordHashed = bcrypt.hashSync(newPassword, 10);

      try {
        await User.findByIdAndUpdate(_id, { password: newPasswordHashed });

        // -----COMPROBAMOS QUE SE HAYA ACTUALIZADO CORRECTAMENTE LA CONTRASEÑA --------
        const userUpdate = await User.findById(_id);
        if (bcrypt.compareSync(newPassword, userUpdate.password)) {
          return res.status(200).json({
            updateUser: true,
          });
        } else {
          return res.status(404).json({
            updateUser: false,
          });
        }
      } catch (error) {
        return res.status(404).json(error.message);
      }
    } else {
      return res.status(404).json('password dont match');
    }
  } catch (error) {
    return next(error);
  }
};

//! -----------------------------------------------------------------------------
//? ---------------------------------UPDATE--------------------------------------
//! -----------------------------------------------------------------------------

const update = async (req, res, next) => {
  // guardamos la imagen subida si el user nos pidio actualziarla
  let catchImg = req.file?.path;

  try {
    // actualizamos los indexes de los elementos unicos por si el modelo ha cambiado
    await User.syncIndexes();

    // generamos una nueva instancia del modelo del user
    const patchUser = new User(req.body);

    // si hay imagen vamos a ponerlo en la nueva instancia del usuario
    req.file && (patchUser.image = catchImg);

    /**
     * vamos a incluir el valor actual a las claves que no queremos
     * que se modifique
     */
    patchUser._id = req.user._id;
    patchUser.password = req.user.password;
    patchUser.rol = req.user.rol;
    patchUser.confirmationCode = req.user.confirmationCode;
    patchUser.email = req.user.email;
    patchUser.check = req.user.check;
    patchUser.gender = req.user.gender;

    try {
      // actualizamos el usuario cuando tengamos incluidas las actualizaciones
      await User.findByIdAndUpdate(req.user._id, patchUser);

      /**
       * Si no paso para actualizar la imagen procedemos a borrar la antigua imagen
       * que se encuentra en el usuario autenticado con el token
       */
      if (req.file) deleteImgCloudinary(req.user.image);

      /**
       * ---------PRUEBAS EN EL RUNTIME PARA COMPROBAR QUE ACTUALIZÓ CORRECTAMENTE---
       */
      const updateUser = await User.findById(req.user._id);

      // sacamos las claves del objeto del body para saber que cosas quiso el user actualizar
      const updateKeys = Object.keys(req.body); // ["name"]

      // generamos un array con los test que generaremos
      const testUpdate = [];

      // recorremos el array de las claves que queremos actualizar
      updateKeys.forEach((item) => {
        // si el valor actualizado es igual al que nos mando para actualizar entramos al if
        if (updateUser[item] === req.body[item]) {
          // pero vamos a comprobar si era diferente al que tenia inicialmente
          if (updateUser[item] != req.user[item]) {
            testUpdate.push({
              [item]: true,
            });
          } else {
            // si es igual al que ya teniamos vamos a incluir que igual a la antigua informacion
            testUpdate.push({
              [item]: 'sameOldInfo',
            });
          }
        } else {
          testUpdate.push({
            [item]: false,
          });
        }
      });

      // ---------> PRUEBAS PARA LA IMAGEN --------
      if (req.file) {
        // comprobamos si la URL de la imagen subida es igual a la actualizada en la base de datos
        updateUser.image === catchImg
          ? testUpdate.push({
              image: true,
            })
          : testUpdate.push({
              image: false,
            });
      }

      // lanzamos el test con las pruebas y le usuario actualizado
      return res.status(200).json({
        updateUser,
        testUpdate,
      });
    } catch (error) {
      // si hubo un error y nos pido cambiar la imagen vamos a borrar la imagen nueva subida
      if (req.file) deleteImgCloudinary(catchImg);
      return res.status(404).json(error.message);
    }
  } catch (error) {
    if (req.file) deleteImgCloudinary(catchImg);
    return next(error);
  }
};

//! -----------------------------------------------------------------------------
//? ----------------------------- DELETE ----------------------------------------
//! -----------------------------------------------------------------------------

const deleteUser = async (req, res, next) => {
  try {
    /**
     * Sacamos del token  que nos envia el id y la imagen
     *  - El id para buscar el usuario que pide borrarse
     *  - La imagen para enviarla al middleware y borrado
     */
    const { _id, image } = req.user;
    await User.findByIdAndDelete(_id);
    if (await User.findById(_id)) {
      return res.status(404).json('not deleted');
    } else {
      // si el usuario no existe quiere decir que podemos borrar la imagen
      deleteImgCloudinary(image);
      return res.status(200).json('ok delete');
    }
  } catch (error) {
    return next(error);
  }
};

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
