import React, {useEffect, useState} from 'react';
import {useLazyQuery, useQuery} from "@apollo/client";
import {GET_CONVERSATIONS} from "../queries/message";
import {Avatar, List, Row} from "antd";
import InfiniteScroll from 'react-infinite-scroller';
import {MoreHorizontal} from "react-feather";
import {useDispatch, useSelector} from 'react-redux';
import moment from 'moment';
import {GET_CONVERSATION_LIST, SELECTED_CONVERSATION} from "../../../constants/types";
import {socket} from "../../../tools/apollo/index";
import {withRouter} from 'react-router-dom';

interface Conversation {
  _id: string,
  title: string
  updatedAt: string;
  firstMessage: {
    message: string,
    senderId: string,
  }
}

const MessageList = (props) => {
  const [rowData, setRowdata] = useState<Conversation[]>([]);
  const [inProp, setInProp] = useState(false);
  const dispatch = useDispatch();
  const currentConversation = useSelector<string>(state => state?.conversation?.currentConverSation);
  const currentUserId = useSelector<string>(state => state?.auth?.profile?._id);
  const [getConversations, { loading, data }] = useLazyQuery(GET_CONVERSATIONS, { variables: { userId: currentUserId } })
  const conversationId = props.match.params.id;
  console.log(props)
  useEffect(() => {
    if (currentUserId) {
      getConversations()
    }
  }, [currentUserId, currentConversation])

  useEffect(() => {
    socket.on('newMessage', data => {
      setRowdata(
        rowData.map(x => {
          if (x._id === data.conversationId) {
            return {
              ...x,
              updatedAt: data.updatedAt,
              firstMessage: {
                message: data.message,
                senderId: data.senderId,
              }
            }
          } else return x;
        }).sort((a, b) => {
          // @ts-ignore
          return new Date(b.updatedAt) - new Date(a.updatedAt);
        })
      )
    })
  }, [rowData])


  useEffect(() => {
    if (!loading ) {
      if (data && data.getManyConversation) {
        if (data.getManyConversation.length !== 0) {
          dispatch({type: GET_CONVERSATION_LIST, payload: data.getManyConversation})
          if (!currentConversation) {
            dispatch({type: SELECTED_CONVERSATION, payload: data.getManyConversation[0]})
          }
          props.history.push(`/message/${data.getManyConversation[0]._id}`)
          setRowdata(data.getManyConversation)
        } else {
          setRowdata([])
        }
      }
    }
  }, [loading, data])
  console.log(rowData);

  const handleInfiniteOnLoad = () => {
    console.log('---------');
  }

  const selectConversation = (item) => {
    dispatch({type: SELECTED_CONVERSATION, payload: item})
    props.history.push(`/message/${item._id}`)
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
            renderItem={item => (
              <List.Item
                style={{ backgroundColor: (item._id === currentConversation?._id) ? '#cdd8ec' : '' }}
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
                        {/* eslint-disable-next-line jsx-a11y/anchor-is-valid */}
                        <a key="list-loadmore-edit" href="#"><MoreHorizontal size={16} color={"black"}/></a>
                      </div>
                    </Row>
                  </>
                }
              >
                <List.Item.Meta
                  avatar={
                    <Avatar>U</Avatar>
                  }
                  title={<a href="https://ant.design">{item.title}</a>}
                  description={<div className='list-description'>{item.firstMessage?.senderId === currentUserId ? 'Bạn: ' : ''} {item.firstMessage?.message}</div>}
                />
              </List.Item>
            )}
          >
          </List>
      </InfiniteScroll>
    </div>
  )
}

export default withRouter(MessageList);
