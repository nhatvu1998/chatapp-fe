import React, { useEffect, useState } from "react";
import { useLazyQuery, useMutation, useQuery } from "@apollo/client";
import { GET_CONVERSATIONS, DELETE_CONVERSATION } from "../queries/message";
import { Avatar, Button, Dropdown, List, Menu, Popover, Row } from "antd";
import InfiniteScroll from "react-infinite-scroller";
import { MoreHorizontal } from "react-feather";
import { useDispatch, useSelector } from "react-redux";
import moment from "moment";
import {
  GET_CONVERSATION_LIST,
  SELECTED_CONVERSATION,
} from "../../../constants/types";
import { socket } from "../../../tools/apollo/index";
import { withRouter } from "react-router-dom";
import Notify from '../../../components/Notify';

interface Conversation {
  _id: string;
  title: string;
  updatedAt: string;
  firstMessage: {
    message: string;
    senderId: string;
  };
}

const MessageList = (props) => {
  const [rowData, setRowdata] = useState<Conversation[]>([]);
  const [inProp, setInProp] = useState(false);
  const dispatch = useDispatch();
  const currentConversation = useSelector<string>(
    (state) => state?.conversation?.currentConverSation
  );
  const currentUserId = useSelector<string>(
    (state) => state?.auth?.profile?._id
  );
  const [getConversations, { loading, data, refetch }] = useLazyQuery(
    GET_CONVERSATIONS,
    {
      variables: { userId: currentUserId },
    }
  );
  const [deleteConversation] = useMutation(DELETE_CONVERSATION);
  const conversationId = props.match.params.id;

  const menu = (
  <Menu>
    <Menu.Item>
      <Button>
        Delete Conversation
      </Button>
    </Menu.Item>
  </Menu>
);
  useEffect(() => {
    if (currentUserId) {
      getConversations();
    }
  }, [currentUserId, currentConversation]);

  useEffect(() => {
    socket.on("newMessage", (data) => {
      setRowdata(
        rowData
          .map((x) => {
            if (x._id === data.conversationId) {
              return {
                ...x,
                updatedAt: data.updatedAt,
                firstMessage: {
                  message: data.message,
                  senderId: data.senderId,
                },
              };
            } else return x;
          })
          .sort((a, b) => {
            // @ts-ignore
            return new Date(b.updatedAt) - new Date(a.updatedAt);
          })
      );
    });
  }, [rowData]);

  useEffect(() => {
    if (!loading) {
      if (data && data.getManyConversation) {
        if (data.getManyConversation.length !== 0) {
          dispatch({
            type: GET_CONVERSATION_LIST,
            payload: data.getManyConversation,
          });
          if (!currentConversation) {
            dispatch({
              type: SELECTED_CONVERSATION,
              payload: data.getManyConversation[0],
            });
          }
          props.history.push(`/message/${data.getManyConversation[0]._id}`);
          setRowdata(data.getManyConversation);
        } else {
          setRowdata([]);
        }
      }
    }
  }, [loading, data]);
  console.log(rowData);

  const handleInfiniteOnLoad = () => {
    console.log("---------");
  };

  const selectConversation = (item) => {
    dispatch({ type: SELECTED_CONVERSATION, payload: item });
    props.history.push(`/message/${item._id}`);
  };

  const delConversation = (conversationId) => {
    deleteConversation({ variables: { conversationId } }).then((res) => {
      return Notify("success", "Delete successfully!");
    })
  }

  return (
    <div className="message-list-infinite-container">
      <InfiniteScroll
        initialLoad={false}
        pageStart={0}
        hasMore={true}
        loadMore={handleInfiniteOnLoad}
        useWindow={false}
      >
        <List
          itemLayout="vertical"
          dataSource={rowData}
          renderItem={(item) => (
            <List.Item
              style={{
                backgroundColor:
                  item._id === currentConversation?._id ? "#cdd8ec" : "",
              }}
              key={item._id}
              onClick={() => selectConversation(item)}
              extra={
                <>
                  <Row>
                    <span className="message-time">
                      {moment(item.updatedAt).fromNow()}
                    </span>
                  </Row>
                  <Row justify="end">
                    <div className="more-action">
                      <Popover
                        content={
                          <div onClick={() => delConversation(item._id) }>Delete</div>
                        }
                        trigger="click"
                      >
                        <Button
                          type="link"
                          icon={<MoreHorizontal size={16} color={"black"} />}
                        ></Button>
                      </Popover>
                      {/* <Dropdown overlay={menu} placement="bottomLeft" trigger={['click']}>
                        <Button
                          type="link"
                          icon={<MoreHorizontal size={16} color={"black"} />}
                        ></Button>
                      </Dropdown> */}
                    </div>
                  </Row>
                </>
              }
            >
              <List.Item.Meta
                avatar={<Avatar>{item?.title[0]?.toUpperCase()}</Avatar>}
                title={<a href="#">{item.title}</a>}
                description={
                  <div className="list-description">
                    {item.firstMessage?.senderId === currentUserId
                      ? "Bạn: "
                      : ""}{" "}
                    {item.firstMessage?.message}
                  </div>
                }
              />
            </List.Item>
          )}
        ></List>
      </InfiniteScroll>
    </div>
  );
};

export default withRouter(MessageList);
