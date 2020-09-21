import React from 'react';
import {Form, Input, Button, Col, Card, Divider, Row} from "antd";
import { Link } from "react-router-dom";
import Logo  from '../../assets/icons/icons8-wechat.svg';
import './index.scss';
import {useMutation} from "@apollo/client";
import {REGISTER} from "./queries";
import Notify from '../../components/Notify';

const Register = () => {
  const [register] = useMutation(REGISTER);

  const handleSubmit = (values) => {
    register({ variables: { userData: values } })
      .then(res => {
        if (!res.errors) {
          return Notify('success', 'Đăng ký thành công');
        }
      }).catch((error) => {
      return Notify('error', 'Đăng ký thất bại');
    })
  }
  return (
    <div
      className="layout-login"
      style={{ height: "100vh" }}
    >
      <Card className="login-form">
        <Row justify="center">
          <Col>
            <img src={Logo} alt={"ok"} />
          </Col>
        </Row>
        <Row>
          <Col>
            <div className="right-layout">
              <Form
                onFinish={handleSubmit}
              >
                <Form.Item
                  name="username"
                  rules={[
                    { required: true, message: "Please input your username!" },
                  ]}
                >
                  <Input placeholder="Username" />
                </Form.Item>
                <Form.Item
                  name="password"
                  rules={[
                    { required: true, message: "Please input your Password!" },
                    {
                      pattern: /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/,
                      message: "Mật khẩu cần có ít nhất 8 kí tự gồm chữ và số",
                    },
                  ]}
                  hasFeedback
                >
                  <Input.Password placeholder="Password" />
                </Form.Item>
                <Form.Item
                  name="passwordCheck"
                  dependencies={["password"]}
                  hasFeedback
                  rules={[
                    {
                      required: true,
                      message: "Please confirm your password!",
                    },
                    ({ getFieldValue }) => ({
                      validator(rule, value) {
                        if (!value || getFieldValue("password") === value) {
                          return Promise.resolve();
                        }
                        return Promise.reject(
                          "The two passwords do not match!"
                        );
                      },
                    }),
                  ]}
                >
                  <Input.Password placeholder="Password check" />
                </Form.Item>
                <Form.Item
                  name="email"
                  rules={[
                    { required: true, message: "Please input your email!" },
                    {
                      pattern: /^([A-Z|a-z|0-9](\.|_){0,1})+[A-Z|a-z|0-9]@([A-Z|a-z|0-9])+((\.){0,1}[A-Z|a-z|0-9]){2}\.[a-z]{2,3}$/gm,
                      message: "Email không hợp lệ",
                    },
                  ]}
                >
                  <Input placeholder="Email" />
                </Form.Item>
                <Form.Item
                  name="fullname"
                  rules={[
                    {
                      required: true,
                      message: "Please input your fullname",
                    }
                  ]}
                >
                  <Input placeholder="Full name" />
                </Form.Item>
                <Form.Item>
                  <Button
                    type="primary"
                    htmlType="submit"
                    className="register-form-button"
                  >
                    Register
                  </Button>
                </Form.Item>
              </Form>
              <Divider />
              <Link to="/login">
                <Button
                  type="primary"
                  htmlType="submit"
                  className="login-form-button"
                >
                  Login
                </Button>
              </Link>
            </div>
          </Col>
        </Row>
      </Card>
    </div>
  )
}

export default Register;
