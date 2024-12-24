const User = require('../api/models/user.model');
const { verifyToken } = require('../utils/token');
const dotenv = require('dotenv');
dotenv.config();

const isAuth = async (req, res, next) => {
  // sacamos el token de la request del front
  const token = req.headers.authorization?.replace('Bearer ', '');
  // si no tenemos token vamos lanzar un error
  if (!token) {
    return next(new Error('Unauthorized'));
  }

  try {
    /**
     * Decodificamos el token con el jwt secret y nos da el id
     * Para poder encontrar el usuario que nos envia el token
     * y lo guardamos en el req.user para que el controlador
     * pueda utilizarlo
     */
    const decoded = verifyToken(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id);
    next();
  } catch (error) {
    return next(error);
  }
};

const isAuthAdmin = async (req, res, next) => {
  /**
   * Es lo mismo que lo anterior pero para comprobar que eres administrador
   */
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) {
    return next(new Error('Unauthorized'));
  }

  try {
    const decoded = verifyToken(token, process.env.JWT_SECRET);
    console.log(decoded);
    req.user = await User.findById(decoded.id);
    // si el rol es admin en ese caso continuaremos sino lanzamos un error
    if (req.user.rol !== 'admin') {
      return next(new Error('Unauthorized, not admin'));
    }
    next();
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  isAuth,
  isAuthAdmin,
};
