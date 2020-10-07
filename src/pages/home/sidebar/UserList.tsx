import React, {useEffect, useState} from 'react';
import {useQuery} from "@apollo/client";
import {GET_CONVERSATIONS, GET_USER_LIST} from "../queries/message";
import {Avatar, Badge, List, Row, Space} from "antd";
import InfiniteScroll from 'react-infinite-scroller';
import {MoreHorizontal} from "react-feather";
import {useDispatch, useSelector} from 'react-redux';
import moment from 'moment';
import {GET_CONVERSATION_LIST, SELECTED_CONVERSATION} from "../../../constants/types";

interface User {
  _id: string,
  fullname: string,
}

const UserList = () => {
  const [rowData, setRowdata] = useState<User[]>([]);
  const dispatch = useDispatch();
  const currentConversation = useSelector<string>(state => state?.conversation?.currentConverSation);
  const { loading, data } = useQuery(GET_USER_LIST)

  useEffect(() => {
    if (!loading ) {
      if (data && data.getUsers) {
        if (data.getUsers.length !== 0) {
          // dispatch({type: GET_CONVERSATION_LIST, payload: data.getManyConversation})
          // dispatch({type: SELECTED_CONVERSATION, payload: data.getManyConversation[0]})
          setRowdata(data.getUsers)
        }
      }
    }
  }, [loading, data])

  const selectConversation = (item) => {
    dispatch({type: SELECTED_CONVERSATION, payload: item})
  }
  return (
    <div className="message-list-infinite-container">
        <List
          dataSource={rowData}
          renderItem={item => (
            <List.Item
              key={item._id}
              onClick={() => selectConversation(item)}
            >
              <Row justify="space-around" align="middle">
                <Space>
                  <span className="avatar-item">
                    <Badge color={'green'} size={'default'} offset={[-6, 6]}>
                      <Avatar shape="circle" size={"large"} >U</Avatar>
                    </Badge>
                  </span>
                  <span className='contact-name'>{item.fullname}</span>
                </Space>
              </Row>
            </List.Item>
          )}
        >
        </List>
    </div>
  )
}

export default UserList;
