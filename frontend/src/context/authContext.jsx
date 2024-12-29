import { createContext, useContext, useMemo, useState } from "react";

const AuthContext = createContext();
/**
 * ---------------------------------------------------------------------
 * --------------------- CONTEXTO DONDE GESTIONAMOS LA AUTH-------------
 * ---------------------------------------------------------------------
 */
export const AuthContextProvider = ({ children }) => {



  /**
 * ---------------------------------------------------------------------
 * --------------------- ESTADO QUE GESTIONA EL USER LOGADO-------------
 * ---------------------------------------------------------------------
 * 
 * Comprueba si hay ya un usuario logado guardado en localstorage por si el usuario 
 * recarga la pagina por ejemplo asi su estado inicial se resetea con lo que haya actualmente 
 */
  const [user, setUser] = useState(() => {
    const user = localStorage.getItem("user");

    return user ? JSON.parse(user) : null;
  });

   /**
 * -------------------------------------------------------------------------------------------------
 * ----- ESTADO PARA SABER SI EL USUARIO SE HA BORRRADO POR PETICION DEL USUARIO MISMO -------------
 * -------------------------------------------------------------------------------------------------
 * 
 * 
 */
  const [deleteUser, setDeleteUser] = useState(false);

  const [allUser, setAllUser] = useState({
    data: {
      confirmationCode: "",
      user: {
        password: "",
        email: "",
      },
    },
  });

  //! -----------------------------------------------------------------------
  //? -------- PUENTE PARA CUANDO TENGAMOS PROBLEMAS DE ASYNCRONIA ----------
  //! -----------------------------------------------------------------------

  const bridgeData = (state) => {
    const data = localStorage.getItem("data");
    const dataJson = JSON.parse(data);

    switch (state) {
      case "ALLUSER":
        setAllUser(dataJson);
        localStorage.removeItem("data");

        break;

      default:
        break;
    }
  };

  const login = (data) => {
    localStorage.setItem("user", data);
    const parseUser = JSON.parse(data);
    setUser(parseUser);
  };

  const logout = () => {
    localStorage.removeItem("user");
    setUser(null);
  };
   /**
 * -------------------------------------------------------------------------------
 * ------ MEMORIZAMOS LA INFO, SE REMEMORIZA CUANDO CAMBIE EL USUARIO-------------
 * -------------------------------------------------------------------------------
 * 

 */
  const value = useMemo(
    () => ({
      user,
      setUser,
      login,
      logout,
      allUser,
      setAllUser,
      bridgeData,
      deleteUser,
      setDeleteUser,
    }),
    [user, allUser, deleteUser]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};


 /**
 * ---------------------------------------------------------------------
 * -----CUSTOM HOOK QUE FACILITA LA UTILIZACION DEL CONTEXTO-------------
 * ---------------------------------------------------------------------
 */
export const useAuth = () => useContext(AuthContext);
