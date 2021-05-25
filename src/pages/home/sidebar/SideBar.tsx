/* eslint-disable @typescript-eslint/no-unused-expressions */
import React, { useEffect, useState } from "react";
import {
  Avatar,
  Badge,
  Col,
  Dropdown,
  Form,
  Input,
  Layout,
  Menu,
  Modal,
  Radio,
  Row,
  Select,
  Space,
  Tag,
  Tooltip,
} from "antd";
import {
  Settings,
  Edit,
  MessageCircle,
  Users,
  Search,
  LogOut,
  Edit3,
  PlusCircle,
  Image,
} from "react-feather";
import MessageList from "./MessageList";
import UserList from "./UserList";
import { useSelector } from "react-redux";
import SearchMesssage from "./SearchMessage";
import { withRouter } from "react-router-dom";
import { useMutation, useQuery } from "@apollo/client";
import { UserOutlined } from "@ant-design/icons";
import { useDispatch } from "react-redux";
import _ from "lodash";
import {
  CREATE_CONVERSATION,
  GET_USER_LIST,
  UPDATE_USER,
} from "../queries/message";
import { SIGN_OUT } from "../../../constants/types";

const { Sider, Header } = Layout;
const { Option } = Select;

enum UserGender {
  male,
  female,
}

const SideBar = (props) => {
  const [currentTab, setCurrentTab] = useState("message");
  const currentUser = useSelector((state) => state?.auth?.profile);
  const currentConversation = useSelector<string>(
    (state) => state?.conversation?.currentConverSation
  );
  const [visible, setVisible] = useState(false);
  const [updateVisible, setUpdateVisible] = useState(false);
  const [userList, setUserList] = useState();
  const [file, setFile] = useState();
  const [avatarTempUrl, setAvatarTempUrl] = useState("");
  const dispatch = useDispatch();
  const [form] = Form.useForm();
  const { loading, data } = useQuery(GET_USER_LIST);
  const [createConversation] = useMutation(CREATE_CONVERSATION);
  const [updateUser] = useMutation(UPDATE_USER);
  useEffect(() => {
    if (!loading) {
      if (data && data.getUsers) {
        if (data.getUsers.length !== 0) {
          // dispatch({type: GET_CONVERSATION_LIST, payload: data.getManyConversation})
          // dispatch({type: SELECTED_CONVERSATION, payload: data.getManyConversation[0]})
          setUserList(data.getUsers);
        }
      }
    }
  }, [loading, data]);

  const userSetting = (
    <Menu>
      <Menu.Item>
        <div onClick={(updateVisible) => setUpdateVisible(true)}>
          <Edit size={14} strokeWidth={1.5} /> Update User
        </div>
      </Menu.Item>
      <Menu.Item>
        <div onClick={() => handleLogout()}>
          <LogOut color={"red"} size={14} strokeWidth={1} /> Logout
        </div>
      </Menu.Item>
    </Menu>
  );

  const userInfo = (
    <Header className="sidebar-left__header">
      <Row align="middle" style={{ width: "100%" }}>
        <Col span={12}>
          <Space>
            <Dropdown
              overlay={userSetting}
              placement="bottomLeft"
              arrow
              trigger={["click"]}
            >
              <Avatar
                style={{ cursor: "pointer" }}
                src={currentUser?.avatarFile?.url}
              />
            </Dropdown>
            <span>{currentUser?.fullname}</span>
          </Space>
        </Col>
        <Col span={3} offset={6}>
          <Tooltip title="Settings">
            <Settings size={20} strokeWidth={1.5} />
          </Tooltip>
        </Col>
        <Col span={3}>
          <Tooltip title="Create new group chat">
            <PlusCircle
              size={20}
              strokeWidth={1.5}
              onClick={(visible) => setVisible(true)}
            />
          </Tooltip>
        </Col>
      </Row>
    </Header>
  );

  const handleLogout = () => {
    dispatch({ type: SIGN_OUT });
    window.localStorage.removeItem("token");
    props.history.push("/login");
  };

  const updateUserProfile = (values) => {
    const userData = {
      _id: currentUser._id,
      fullname: values.fullname,
      phone: values.phone,
      gender: values.gender,
    };
    console.log(file);
    updateUser({ variables: { avatarFile: file, userData } });
  };

  const handleMenuClick = (e) => {
    console.log(e);
    // props.history.push(`/${e.key}`)
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
          width: "20%",
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
  );

  const render = () => {
    switch (currentTab) {
      case "message":
        return <MessageList />;
      case "user":
        return <UserList />;
      case "find":
        return <SearchMesssage />;
      default:
        return <MessageList />;
    }
  };

  const renderOption = () => {
    if (userList) {
      return userList.map((user) => {
        return (
          <Option key={user._id} value={user._id}>
            {user.fullname}
          </Option>
        );
      });
    }
  };

  const createNewConversation = (values) => {
    const conversationInput = {
      title: values.title,
      participantMembers: values.participantMembers,
      creatorId: currentUser._id,
      type: 1,
    };
    createConversation({ variables: { conversationInput } });
  };

  const onUpdatePhoto = ({ target: { validity, files } }) => {
    if (validity.valid) {
      console.log(files[0]);
      setFile(files[0]);
      const objectURL = window.URL.createObjectURL(files[0]);
      setAvatarTempUrl(objectURL);
      console.log(objectURL);
    }
  };

  return (
    <>
      <Sider width={window.innerWidth < 768 ? 0 : "350px"}>
        <div className="sidebar-left">
          {userInfo}
          {menu}
          {render()}
        </div>
      </Sider>
      <Modal
        visible={visible}
        title="Create a new group chat"
        okText="Create"
        cancelText="Cancel"
        onCancel={(visible) => setVisible(false)}
        onOk={() => {
          form
            .validateFields()
            .then((values) => {
              form.resetFields();
              createNewConversation(values);
            })
            .catch((info) => {
              console.log("Validate Failed:", info);
            });
        }}
      >
        <Form
          form={form}
          layout="vertical"
          name="form_in_modal"
          initialValues={{ modifier: "public" }}
        >
          <Form.Item
            name="title"
            label="Title"
            rules={[
              {
                required: true,
                message: "Please input the title of collection!",
              },
            ]}
          >
            <Input />
          </Form.Item>
          <Form.Item name="participantMembers" label="Participant Members">
            <Select
              mode="tags"
              style={{ width: "100%" }}
              placeholder="Tags Mode"
            >
              {renderOption()}
            </Select>
          </Form.Item>
        </Form>
      </Modal>
      {/*=========================*/}
      <Modal
        visible={updateVisible}
        title="Update user profile"
        okText="Create"
        cancelText="Cancel"
        onCancel={() => setUpdateVisible(false)}
        onOk={() => {
          form
            .validateFields()
            .then((values) => {
              form.resetFields();
              updateUserProfile(values);
            })
            .catch((info) => {
              console.log("Validate Failed:", info);
            });
        }}
      >
        {currentUser && (
          <Form
            form={form}
            layout="vertical"
            name="form_in_modal"
            initialValues={{ modifier: "public" }}
          >
            <Form.Item name="avatarFile">
              <Row justify="center">
                <label htmlFor="update-avatar">
                  <Tooltip title={"image"}>
                    <Avatar
                      size={128}
                      icon={<UserOutlined />}
                      src={avatarTempUrl || currentUser?.avatarFile?.url}
                      style={{ textAlign: "center" }}
                    />
                  </Tooltip>
                </label>
                <input
                  type="file"
                  required
                  id="update-avatar"
                  onChange={(e) => onUpdatePhoto(e)}
                />
              </Row>
            </Form.Item>

            <Form.Item name="fullname" label="Fullname">
              <Input defaultValue={currentUser?.fullname} />
            </Form.Item>

            <Form.Item name="phone" label="Phone">
              <Input defaultValue={currentUser?.phone} />
            </Form.Item>

            <Form.Item name="gender" label="Gender">
              <Radio.Group defaultValue={currentUser?.gender}>
                <Radio value={UserGender.male}>Male</Radio>
                <Radio value={UserGender.female}>Female</Radio>
              </Radio.Group>
            </Form.Item>
          </Form>
        )}
      </Modal>
    </>
  );
};

export default withRouter(SideBar);
