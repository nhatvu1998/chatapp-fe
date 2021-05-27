import React, { useEffect, useState } from "react";
import { useMutation, useQuery } from "@apollo/client";
import { CREATE_CONVERSATION, GET_CONVERSATIONS, GET_USER_LIST } from "../queries/message";
import { Avatar, Badge, List, Row, Space } from "antd";
import InfiniteScroll from "react-infinite-scroller";
import { MoreHorizontal } from "react-feather";
import { useDispatch, useSelector } from "react-redux";
import moment from "moment";
import {
  CREATE_NEW_CONVERSATION,
  GET_CONVERSATION_LIST,
  SELECTED_CONVERSATION,
  SET_CURRENT_TAB,
} from "../../../constants/types";

interface User {
  _id: string;
  fullname: string;
}

const UserList = () => {
  const [rowData, setRowdata] = useState<User[]>([]);
  const dispatch = useDispatch();
  const currentConversation = useSelector<string>(
    (state) => state?.conversation?.currentConverSation
  );
  const currentUser = useSelector(state => state.auth.profile)
  const { loading, data } = useQuery(GET_USER_LIST);
  const [createConversation] = useMutation(CREATE_CONVERSATION);

  useEffect(() => {
    if (!loading) {
      if (data && data.getUsers) {
        if (data.getUsers.length !== 0) {
          // dispatch({type: GET_CONVERSATION_LIST, payload: data.getManyConversation})
          // dispatch({type: SELECTED_CONVERSATION, payload: data.getManyConversation[0]})
          setRowdata(data.getUsers);
          console.log(data.getUsers);
        }
      }
    }
  }, [loading, data]);

  const selectConversation = (item) => {
    const conversationInput = {
      title: '',
      participantMembers: [currentUser._id],
      creatorId: item._id,
      type: 'single',
    }
    createConversation({variables: {conversationInput} }).then((res) => {
      dispatch({type: CREATE_NEW_CONVERSATION, payload: res.data.createConversation})
      dispatch({ type: SET_CURRENT_TAB, payload: 'message' });
      dispatch({ type: SELECTED_CONVERSATION, payload: res.data.createConversation });
    })
  };

  return (
    <div className="message-list-infinite-container">
      <List
        dataSource={rowData}
        renderItem={(item) => (
          <List.Item key={item._id} onClick={() => selectConversation(item)}>
            <Row justify="space-around" align="middle">
              <Space>
                <span className="avatar-item">
                  <Badge color={"green"} size={"default"} offset={[-6, 6]}>
                    <Avatar shape="circle" size={"large"}>
                      {item?.fullname[0]?.toUpperCase()}
                    </Avatar>
                  </Badge>
                </span>
                <span className="contact-name">{item.fullname}</span>
              </Space>
            </Row>
          </List.Item>
        )}
      ></List>
    </div>
  );
};

export default UserList;
