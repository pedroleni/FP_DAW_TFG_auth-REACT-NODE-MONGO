import { useForm } from "react-hook-form";
import "./Register.css";
import { useEffect, useState } from "react";
import { Spinner, Uploadfile } from "../components";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../context/authContext";
import { registerUser } from "../services/user.service";
import { useRegisterError } from "../hooks";

export const Register = () => {
  // allUser es la respuesta completa del 200 del service de registro
  // NOS TRAEMOS LOS ESTADO Y FUNCIONES DEL CONTEXTO DE AUTH
  const { bridgeData, setDeleteUser } = useAuth();

  /**
   * Utlizamos las funciones register y handleSubmit para registrar los datos de los input
   * y con el handleSubmit decirle que funcion recibira el objeto con los datos registrados
   * para su gestion
   */
  const { register, handleSubmit } = useForm();

  /**
   * ESTADO QUE GESTIONAN LA RESPUESTA de la API,
   * ESTADO SEND que gestiona cuando se esta emitiendo una peticion a la API
   * ESTADO okRegister que sirve para saber si ha realizado correctamente el registro
   */
  const [res, setRes] = useState({});
  const [send, setSend] = useState(false);
  const [okRegister, setOkRegister] = useState(false);
  //! ------------------------------------------------------------------------------
  //? 1) funcion que se encarga del formulario - de la data del formulario
  //! ------------------------------------------------------------------------------

  const formSubmit = async (formData) => {
    // vamos a ver si tenemos imagen en el input de tipo file
    const inputFile = document.getElementById("file-upload").files;

    /// --------- SI HAY IMAGEN --------------------------
    if (inputFile.length != 0) {
      // incluimos la imagen en la data que enviamos a la API
      const custonFormData = {
        ...formData,
        image: inputFile[0],
      };

      // con el estado send nos sirve para deshabilitar los botones cuando se haya enviado una request
      setSend(true);
      setRes(await registerUser(custonFormData));
      setSend(false);
    } else {
      // ---------- SI NO HAY IMAGEN -----------------------
      const custonFormData = {
        ...formData,
      };

      setSend(true);
      setRes(await registerUser(custonFormData));
      setSend(false);
    }
  };

  //! ------------------------------------------------------------------------------
  //? 2) Con el useEffect vamos a comprobar los errores en la respuesta
  //! ------------------------------------------------------------------------------

  /**
   * Este useEffect se va a lanzar cuando se monte el componente y cuando cambie el valor de
   * res
   */
  useEffect(() => {
    useRegisterError(res, setOkRegister, setRes);
    if (res?.status == 200) bridgeData("ALLUSER");
  }, [res]);

  useEffect(() => {
    setDeleteUser(() => false);
  }, []);

  //! ------------------------------------------------------------------------------
  //? 3) Estados de navegacion
  //! ------------------------------------------------------------------------------
  if (okRegister) {
    // si se registro correctamente vamos a ir a verifyCode
    // recordamos que previamente hemos gestionado en el hook de errores el autologin
    return <Navigate to="/verifyCode" />;
  }

  return (
    <>
      <div className="form-wrap">
        <h1>Sign Up</h1>
        <p>It’s free and only takes a minute.</p>
        <form onSubmit={handleSubmit(formSubmit)}>
          <div className="user_container form-group">
            <input
              className="input_user"
              type="text"
              id="name"
              name="name"
              autoComplete="false"
              {...register("name", { required: true })}
            />
            <label htmlFor="custom-input" className="custom-placeholder">
              username
            </label>
          </div>
          <div className="password_container form-group">
            <input
              className="input_user"
              type="password"
              id="password"
              name="password"
              autoComplete="false"
              {...register("password", { required: true })}
            />
            <label htmlFor="custom-input" className="custom-placeholder">
              password
            </label>
          </div>

          <div className="email_container form-group">
            <input
              className="input_user"
              type="email"
              id="email"
              name="email"
              autoComplete="false"
              {...register("email", { required: true })}
            />
            <label htmlFor="custom-input" className="custom-placeholder">
              email
            </label>

            <div className="sexo">
              <input
                type="radio"
                name="sexo"
                id="hombre"
                value="hombre"
                {...register("gender")}
              />
              <label htmlFor="hombre" className="label-radio hombre">
                Hombre
              </label>
              <input
                type="radio"
                name="sexo"
                id="mujer"
                value="mujer"
                {...register("gender")}
              />
              <label htmlFor="mujer" className="label-radio mujer">
                Mujer
              </label>
            </div>
            <Uploadfile />
          </div>

          <div className="btn_container">
            <button
              className="btn"
              type="submit"
              disabled={send}
              style={{ background: send ? "#49c1a388" : "#2f7a67" }}
            >
              {send ? <Spinner /> : "Register"}
            </button>
          </div>
          <p className="bottom-text">
            <small>
              By clicking the Sign Up button, you agree to our{" "}
              <Link className="anchorCustom">Terms & Conditions</Link> and{" "}
              <Link className="anchorCustom">Privacy Policy.</Link>
            </small>
          </p>
        </form>
      </div>
      <div className="footerForm">
        <p className="parrafoLogin">
          Already have an account? <Link to="/login">Login Here</Link>
        </p>
      </div>
    </>
  );
};
