import { Outlet } from "react-router-dom";
import "./Profile.css";
import { NavProfile } from "../components";

export const Profile = () => {
  /**
   * La etiquet outlet puede renderizar las rutas hijas de la 
   * vista profile
   */
  return (
    <>
      <NavProfile />
      <Outlet />
    </>
  );
};
