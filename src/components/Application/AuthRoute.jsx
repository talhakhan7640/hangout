import React from "react";
import Cookies from "universal-cookie";
import AccessDenied from "../../pages/AccessDenied";
import { Outlet } from "react-router-dom";

const AuthRoute = ({component}) => {
  const cookie = new Cookies();
  if (cookie.get("TOKEN") === undefined ) {
    return (
      <div>
        <AccessDenied />
      </div>
    );
  } else {
    return (
      <div>
        {component}
        <Outlet />
      </div>
    );
  }
}


export default AuthRoute;