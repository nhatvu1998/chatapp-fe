import React from "react";
import { Form, Input, Button, Col, Card, Divider, Row } from "antd";
import { Link, withRouter } from "react-router-dom";
import Logo from "../../assets/icons/icons8-wechat.svg";
import "./index.scss";
import { useDispatch } from "react-redux";
import { useMutation } from "@apollo/client";
import { LOGIN } from "./queries";
import { SIGN_IN } from "../../constants/types";
import Notify from "../../components/Notify";
const Login = () => {
  const dispatch = useDispatch();
  const [login] = useMutation(LOGIN);

  const handleSubmit = (values) => {
    login({ variables: { userData: values } })
      .then((res) => {
        if (!res.errors) {
          localStorage.setItem("token", res.data.login.token);
          dispatch({ type: SIGN_IN });
          return Notify("success", "Đăng nhập thành công");
        }
      })
      .catch((error) => {
        return Notify("error", "Đăng nhập thất bại", "Mật khẩu sai");
      });
  };
  return (
    <div className="layout-login" style={{ height: "100vh" }}>
      <Card className="login-form">
        <Row justify="center" gutter={[0, 32]}>
          <Col>
            <img src={Logo} alt={"ok"} />
          </Col>
        </Row>
        <Row>
          <Col>
            <div className="right-layout">
              <Form
                onFinish={handleSubmit}
                {...{ labelCol: { span: 0 }, wrapperCol: { span: 24 } }}
              >
                <Form.Item
                  name="username"
                  rules={[
                    { required: true, message: "Please input your username!" },
                  ]}
                >
                  <Input placeholder="Username!" />
                </Form.Item>
                <Form.Item
                  name="password"
                  rules={[
                    { required: true, message: "Please input your Password!" },
                  ]}
                >
                  <Input.Password placeholder="Password!" />
                </Form.Item>
                <Form.Item>
                  <Button
                    type="primary"
                    htmlType="submit"
                    className="login-form-button"
                  >
                    Log in
                  </Button>
                </Form.Item>
              </Form>
              <Divider />
              <Link to="/register">
                <Button
                  type="primary"
                  htmlType="submit"
                  className="register-form-button"
                >
                  Create new account
                </Button>
              </Link>
            </div>
          </Col>
        </Row>
      </Card>
    </div>
  );
};

export default withRouter(Login);
