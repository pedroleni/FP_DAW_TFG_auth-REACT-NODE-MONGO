import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Navigate, useNavigate } from "react-router-dom";
import {
  checkCodeConfirmationUser,
  resendCodeConfirmationUser,
} from "../services/user.service";
import { useAuth } from "../context/authContext";
import { useAutoLogin, useCheckCodeError, useResendCodeError } from "../hooks";
import { Spinner } from "../components";

export const CheckCode = () => {
  const navigate = useNavigate();
  const { allUser, login, setUser } = useAuth();
  const { register, handleSubmit } = useForm();
  // EL RES Va a ser para el check cdel code
  const [res, setRes] = useState({});
  // resResend va a ser para gestionar el renvio del codigo de confirmacion
  const [resResend, setResResend] = useState({});
  const [send, setSend] = useState(false);
  const [sendResend, setSendResend] = useState(false);
  const [okCheck, setOkCheck] = useState(false);

  // ------> estos dos estados se utilizan para cuando se recarga la pagin por el usuario
  const [okDeleteUser, setOkDeleteUser] = useState(false);
  const [userNotFound, setUserNotFound] = useState(false);
  //! -------FUNCION QUE GESTIONA LA DATA DEL FORMULARIO-------
  const formSubmit = async (formData) => {
    /**
     * -- VAMOS A COMPROBAR POR DONDE ESTA EL USUARIO ACCEDIENDO AL CHECK SI DESDE EL LOGIN O DESDE EL REGISTER-----
     * ya que si es desde el registro utilizaremos el estado allUser del contexto
     */
    const userLocal = localStorage.getItem("user");

    /// --------------- ACCEDE DESDE EL REGISTER -----------
    if (userLocal == null) {
      const custFormData = {
        confirmationCode: parseInt(formData.confirmationCode),
        email: allUser.data.user.email,
      };
      setSend(true);
      setRes(await checkCodeConfirmationUser(custFormData));
      setSend(false);
    } else {
      /// --------------- ACCEDE DESDE EL LOGIN -----------
      const parseUser = JSON.parse(userLocal);
      const customFormData = {
        email: parseUser.email,
        confirmationCode: parseInt(formData.confirmationCode),
      };
      setSend(true);
      setRes(await checkCodeConfirmationUser(customFormData));
      setSend(false);
    }
  };
  /**
   * ------------FUNCION ENCARGADA DEL REENVIAR EL CÓDIGO --------------
   */
  const handleReSend = async () => {
    const userLocal = localStorage.getItem("user");
    if (userLocal != null) {
      const parseUser = JSON.parse(userLocal);
      const customFormData = {
        email: parseUser.email,
      };

      setSendResend(true);
      setResResend(await resendCodeConfirmationUser(customFormData));
      setSendResend(false);
    } else {
      const customFormData = {
        email: allUser?.data?.user?.email,
      };

      setSendResend(true);
      setResResend(await resendCodeConfirmationUser(customFormData));
      setSendResend(false);
    }
  };

  //! --------USE EFFECT QUE NOSC SIRVE CUANDO CAMBIA RES A LANZAR EL COMPROBADOR DE ERRORES
  useEffect(() => {
    useCheckCodeError(
      res,
      setRes,
      setOkCheck,
      setOkDeleteUser,
      login,
      setUserNotFound
    );
  }, [res]);

  useEffect(() => {
    useResendCodeError(resResend, setResResend, setUserNotFound);
  }, [resResend]);

  //! -------- PONEMOS LOS CONDICIONALES QUE EVALUAN SI ESTAN A TRUE LOS ESTADOS DE NAVEGACION (deleUser, okCheck)
  if (okCheck) {
    ///  vamos a hacer  el autologin para cuando viene del register
    //   para cuando viene del login lo gestionamos en el usecheckCodeError ---> modificamos el localstorage y el user del contexto
    if (!localStorage.getItem("user")) {
      useAutoLogin(allUser, login);
    } else {
      return <Navigate to="/dashboard" />;
    }
  }

  if (okDeleteUser) {
    // si borramos al user por meter el codigo mal lo mandamos de nuevo a registrase
    return <Navigate to="/register" />;
  }

  if (userNotFound) {
    /// lo mando al login porque aparece un 404 de user no found porque me ha recargado la pagina y se ha reseteado allUser
    /// ------> SI SE RECARGA LA PÁGINA LOS ESTADOS SE RESETEAN POR LO TANTO EL allUser tiene el valor incial
    // por lo cual no tengo acceso al email y no puedo reconocerlo en el back. Cuando venga del login ya tendremos esos datos

    return <Navigate to="/login" />;
  }

  return (
    <>
      <div className="form-wrap">
        <h1>Verify your code 👌</h1>
        <p>Write the code sent to your email</p>
        <form onSubmit={handleSubmit(formSubmit)}>
          <div className="user_container form-group">
            <input
              className="input_user"
              type="text"
              id="name"
              name="name"
              autoComplete="false"
              {...register("confirmationCode", { required: false })}
            />
            <label htmlFor="custom-input" className="custom-placeholder">
              Registration code
            </label>
          </div>

          <div className="btn_container">
            <button
              id="btnCheck"
              className="btn"
              type="submit"
              disabled={send}
              style={{ background: send ? "#49c1a388" : "#49c1a2" }}
            >
              {send ? <Spinner /> : "Verify Code"}
            </button>
          </div>
        </form>
        <div className="btn_container">
          <button
            id="btnResend"
            className="btn"
            disabled={sendResend}
            style={{ background: sendResend ? "#49c1a388" : "#49c1a2" }}
            onClick={() => handleReSend()}
          >
            {sendResend ? <Spinner /> : "Resend Code"}
          </button>
        </div>
        <p className="bottom-text">
          <small>
            If the code is not correct ❌, your user will be deleted from the
            database and you will need to register again.{" "}
          </small>
        </p>
      </div>
    </>
  );
};
