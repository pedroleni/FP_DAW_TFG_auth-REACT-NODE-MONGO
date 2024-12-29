import { Navigate } from "react-router-dom";
import { autologinUser } from "../services/user.service";

export const useAutoLogin = async (allUser, userLogin) => {
  try {
    /**
     * Vamos a coger la info de la respuesta guardada en el estado donde almacenamos 
     * la respuesta del registro 
     */
    const { password, email } = allUser?.data?.user;
    const customFormData = {
      email,
      password,
    };
    // hacemos un login del user con los datos de la respuesta del registro 
    const sendData = await autologinUser(customFormData);

    if (sendData?.status == 200) {

      /// en caso de ser un 200 vamos a meter en el localstorage el usuario logado
      const { name, email, image, check } = sendData?.data?.user;
      const userCustom = {
        token: sendData.data.token,
        user: name,
        email,
        image,
        check,
        _id: sendData.data.user._id,
      };

      const stringUser = JSON.stringify(userCustom);
      userLogin(stringUser);

      // si todo fue correctamente vamos a navegar hasta el dashboard
      return <Navigate to="/dashboard" />;
    } else {

      // si no fue correctamente vamos a irnos al login para asi logarnos
      // una vez logado podriamos pasar a verificar el código
      return <Navigate to="/login" />;
    }
  } catch (error) {}
};
