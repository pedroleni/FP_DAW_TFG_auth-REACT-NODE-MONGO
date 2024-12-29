/**
 * Funcion para obetener  el token que se encuentra en el
 * localstore y devolverlo en la funcion
 */

export const updateToken = () => {
  const user = localStorage.getItem("user");
  if (user) {
    const parseUser = JSON.parse(user);
    return parseUser.token;
  }
};
