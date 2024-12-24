const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
dotenv.config();

const generateToken = (id, email) => {
  /**
   * Generamos el token con el id y el email
   */
  if (!id || !email) {
    throw new Error('Email or id are missing');
  }
  // registramos al usuario en jwt
  return jwt.sign({ id, email }, process.env.JWT_SECRET, { expiresIn: '1d' });
};

const verifyToken = (token) => {
  // comprobamos el token y por ultimo verificamos que el token sea correcto
  if (!token) {
    throw new Error('Token is missing');
  }

  return jwt.verify(token, process.env.JWT_SECRET);
};

module.exports = {
  generateToken,
  verifyToken,
};
