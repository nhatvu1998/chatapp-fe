import React from "react";
import { Redirect } from "react-router-dom";

interface Props {
  isAuthenticated: boolean;
  children: any;
}

const PublicRoute = (props: Props) => {
  if (props.isAuthenticated) return <Redirect to="/home" />;
  return (
    <>
      <div className="public-content">{props.children}</div>
    </>
  );
};

export default PublicRoute;
