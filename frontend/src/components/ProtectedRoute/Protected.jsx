import { Navigate } from "react-router-dom";
import { useAuth } from "../../context/authContext";

export const Protected = ({ children }) => {

  /**
   * este componente grapeara a otro componente por lo cual sera el padre de un componente 
   * hijo, si no se cumple ninguno de los if vamos a renderirar el componente hijo 
   * que lo llamaremos children
   */
  const { user, deleteUser } = useAuth();

  //si hemos borrado el usuario vamos a mandarlo de nuevo al registro
  if (deleteUser) {
    return <Navigate to="/register" />;
  }
  // si el usuario no esta logado o el usuario el check es false lo mandamos al login
  if (user == null || user?.check == false) {
    return <Navigate to="/login" />;
  }

  return children;
};
