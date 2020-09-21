import React, { useState } from 'react';
import {Avatar, Badge, Col, Layout, Menu, Row, Space, Tooltip} from 'antd';
import {Settings, Edit, MessageCircle, Users, Search} from 'react-feather';
import MessageList from "./MessageList";
import UserList from "./UserList";
import {useSelector} from 'react-redux';
const { Sider, Header } = Layout;

const SideBar = () => {
  const [currentTab, setCurrentTab] = useState("message");
  const currentUser = useSelector(state => state?.auth?.profile)
  const userInfo = (
    <Header className="sidebar-left__header">
      <Row align="middle" style={{width: '100%'}}>
        <Col span={12}>
          <Space>
            <Avatar>U</Avatar>
            <span>{currentUser?.fullname}</span>
          </Space>
        </Col>
        <Col span={3} offset={6}>
            <Tooltip title="Settings">
              <Settings size={16} />
            </Tooltip>
        </Col>
        <Col span={3}>
          <Tooltip title="Create new group chat">
            <Edit size={16} />
          </Tooltip>
        </Col>
      </Row>

    </Header>
  )

  const handleMenuClick = (e) => {
    console.log(e)
    setCurrentTab(e.key);
  };

  const menu = (
    <Menu
      mode="horizontal"
      className="border-0"
      selectedKeys={[currentTab]}
      onClick={handleMenuClick}
    >
      <Menu.Item
        key="message"
        style={{
          width: "20%",
          textAlign: "center",
        }}
      >
        <MessageCircle size={20} strokeWidth={1.5} />
      </Menu.Item>
      <Menu.Item
        key="user"
        style={{
          width: '20%',
          textAlign: "center",
        }}
      >
        <Badge dot={true}>
          <Users size={20} strokeWidth={1.5} />
        </Badge>
      </Menu.Item>
      <Menu.Item
        key="find"
        style={{
          width: "20%",
          textAlign: "center",
        }}
      >
        <Search size={20} strokeWidth={1.5} />
      </Menu.Item>
    </Menu>
  )

  const render = () => {
    switch (currentTab) {
      case 'message':
        return <MessageList />
      case 'user':
        return <UserList />
      case 'find':
        return <UserList />
      default:
        return <MessageList />
    }
  }
  return (
    <Sider width={window.innerWidth < 768 ? 0 : "350px"} >
      <div className="sidebar-left">
        {userInfo}
        {menu}
        {render()}
      </div>
    </Sider>
  )
}

export default SideBar;
