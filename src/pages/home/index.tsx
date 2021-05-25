import React, { useEffect, useState } from "react";
import SideBar from "./sidebar/SideBar";
import { useSelector } from "react-redux";
import "./index.scss";
import ChatContent from "./content/ChatContent";
import { Avatar, Layout, Modal } from "antd";
import { useSubscription } from "@apollo/client";
import { START_CALL_USER } from "../calling/queries";

const Home = () => {
  return (
    <div>
      <Layout>
        <SideBar />
        <ChatContent />
      </Layout>
    </div>
  );
};

export default Home;
