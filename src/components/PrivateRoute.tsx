/* eslint-disable react-hooks/rules-of-hooks */

import React, {useEffect} from "react";
import { Redirect } from "react-router-dom";
import {useDispatch} from 'react-redux';
import {useQuery} from "@apollo/client";
import {GET_PROFILE} from "../pages/home/queries/message";
import {GET_USER} from "../constants/types";
interface Props {
  isAuthenticated: boolean
  children: any
}


const PrivateRoute = (props: Props) => {
  // if (!props.isAuthenticated) return <Redirect to="/login" />;
  const dispatch = useDispatch()
  const {data, loading} = useQuery(GET_PROFILE)

  useEffect(() => {
    if (!loading ) {
      if (data && data.getProfile) {
        console.log()
         dispatch({type: GET_USER, payload: data.getProfile});
      }
    }
  }, [loading, data])
  return (
    <>

      <div
        className="private-content"
        style={{
          maxHeight: "100vh",
          backgroundColor: "#f5f5f5",
        }}
      >
        {props.children}
      </div>
      {/* <Footer /> */}
    </>
  );
};

export default PrivateRoute;
