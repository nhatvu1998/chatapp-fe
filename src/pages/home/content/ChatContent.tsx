import React, {useEffect, useRef, useState} from 'react';
import {useLazyQuery, useMutation, useQuery, useSubscription} from "@apollo/client";
import {FIND_ALL_MESSAGE, GET_USER, MESSAGES_SUBSCRIPTION, REMOVE_MESSAGE} from "../queries/message";
import {Avatar, Col, Layout, List, Row, Space, Tooltip, Image, Spin, Modal, Popover, Button} from "antd";
import InfiniteScroll from 'react-infinite-scroller';
import {useSelector} from 'react-redux';
import {withRouter} from 'react-router-dom';
import {ArrowDownCircle, Info, MoreHorizontal, PhoneCall, Sidebar, Smile, Video} from "react-feather";
import moment from 'moment';
import ChatFooter from "../footer/ChatFooter";
import RightContent from "./RightContent";
import {useDispatch} from 'react-redux';
import { v4 as uuidv4 } from 'uuid';

import { ExclamationCircleOutlined } from '@ant-design/icons';
import { Emoji } from 'emoji-mart';
import {Helmet} from "react-helmet";
import { socket } from '../../../tools/apollo/index';
const {Header, Content} = Layout;

interface Message {
  _id: string,
  message: string;
  senderId: string;
  type: number;
  files: any;
  createdAt: string;
}

interface PagingType {
  data: any,
  currentPage: number,
  loading: boolean,
  hasMore: boolean,
}

const userId = localStorage.getItem('userId');
const token = window.localStorage.getItem('token');
// export const socket = io.connect(`https://api.magic-chat.cf`, {query: {token}});


const ChatContent = (props) => {
  const [rowData, setRowdata] = useState<Message[]>([]);
  const [actionVisible, setActionVisible] = useState(false)
  const [paging, setPaging] = useState<PagingType>({
    data: [],
    currentPage: 0,
    loading: false,
    hasMore: true,
  })

  const [isShowRightContent, setIsShowRightContent] = useState(false)
  const currentUserId = useSelector<string>(state => state?.auth?.profile?._id);
  const currentConversation = useSelector<string>(state => state?.conversation?.currentConversation);
  const messagesEndRef = useRef(null);
  const [getUser, {data: userInfo, loading: userLoading}] = useLazyQuery(GET_USER);
  const { data, loading, refetch } = useQuery(FIND_ALL_MESSAGE, { variables: { messageQuery: { conversationId: currentConversation?._id } }})
  const [loadMoreMessage, { data: messageData, loading: messageLoading }] = useLazyQuery(FIND_ALL_MESSAGE)
  const [isReceivingCall, setIsReceivingCall] = useState(false);
  const [callerSignal, setCallerSignal] = useState();
  const [callerInfo, setCallerInfo] = useState();
  const [webHeader, setWebHeader] = useState('Home 123');

  const [removeMessage] = useMutation(REMOVE_MESSAGE)

  useEffect(() => {
    socket.on('newMessage', data => {
      console.log(data)
      setRowdata(rowData => [...rowData, data])
      if (messagesEndRef.current) {
        // @ts-ignore
        messagesEndRef.current.scrollTop = messagesEndRef.current.scrollHeight;
      }
    })

    socket.on('peerId', data => {
      setIsReceivingCall(true);
      getUser({variables: {id: data?.userId}})
      setCallerSignal(data);
    })
  }, [])

  useEffect(() => {
    if (isReceivingCall) {
      document.title = 'New call signal'
    } else {
      document.title = 'Home'
    }
  }, [isReceivingCall])

  console.log(callerInfo)
  useEffect(() => {
    if (!userLoading) {
      if (userInfo?.getUser) {
        setCallerInfo(userInfo.getUser);
      }
    }
  }, [userInfo, userLoading])


  const acceptCall = () => {
    setWebHeader('Home');
    window.open(
      `http://${window.location.hostname}:3000/calling?peer_id=${callerSignal?.peerId}`, '',
      "resizable,scrollbars,status")
  }

  useEffect(() => {
    if (currentConversation) {
      setRowdata([])
      setPaging((paging) => ({...paging, currentPage: 1, loading: false}))
    }
  }, [currentConversation])

  useEffect(() => {
    if (rowData) {
      if (messagesEndRef.current) {
        // @ts-ignore
        messagesEndRef.current.scrollTop = messagesEndRef.current.scrollHeight;
      }
      setPaging((paging) => ({...paging, loading: false}));
    }
  }, [rowData])


  useEffect(() => {
    if (!messageLoading ) {
      if (messageData && messageData.findAllMessage) {
        let result = data.findAllMessage.slice().sort((a, b) => {
          // @ts-ignore
          return new Date(a.createdAt) - new Date(b.createdAt);
        })
        console.log(result)
      }
    }
  }, [messageLoading, messageData])

  useEffect(() => {
    if (!loading ) {
      if (data && data.findAllMessage) {
        let result = data.findAllMessage
          .slice().sort((a, b) => {
              // @ts-ignore
              return new Date(a.createdAt) - new Date(b.createdAt);
            })
        setRowdata(result);
        if (data.findAllMessage.length < 20) {
          setPaging((paging) => ({...paging, hasMore: false}));
        }
      }
    }
  }, [loading, data])

  const startCall = () => {
    setWebHeader('New conversation');
    const peerId = uuidv4()
    socket.emit('call-signal', {peerId, roomId: currentConversation?._id})
    window.open(
      `http://${window.location.hostname}:3000/calling?peer_id=${peerId}`, '',
      "resizable,scrollbars,status")
  }

  const conversationInfo = (
    <Header className="sidebar-left__header">
      <Row align="middle" style={{width: '100%'}}>
        <Col span={12}>
          <Space>
            <Avatar>U</Avatar>
            <span>{currentConversation?.title}</span>
          </Space>
        </Col>
        <Col span={1} offset={10}>
          <Tooltip title="Video call">
            <Video size={16} onClick={() => startCall()}/>
          </Tooltip>
        </Col>
        <Col span={1}>
          <Tooltip title="Info">
            <Info size={16} onClick={() => setIsShowRightContent(!isShowRightContent)}/>
          </Tooltip>
        </Col>
      </Row>
    </Header>
  )

  const renderMessage = (item, type: number) => {
    switch (type) {
      case 0:
        return (
          <Tooltip placement={(currentUserId === item.senderId) ? 'right' : 'left'} title={moment(item.createdAt).format('hh:mm')}>
            <div className="chat-content__message">
              {item.message}
            </div>
          </Tooltip>
      );
      case 1:
        return (
          <span>
            <Image
              width={'25vw'}
              src={item.files.url}
            />
          </span>
        );
      case 2:
        return (
          <span>
            {item.message}
          </span>
        );
      case 3:
        return (
          <video className="message-video" controls>
            <source src={item.files.url} type="video/mp4" />
          </video>
        )
      case 4:
        return (
          <div className="chat-content__message">
            <Space>
              <ArrowDownCircle size={18} strokeWidth={3}/>
                <a href={item.files.url} download target="_blank" rel="noopener noreferrer">
                  {item.files.name}
                </a>
            </Space>
          </div>
        )
    }
  }

  const handleInfiniteOnLoad = () => {
    let { data, currentPage } = paging;
    console.log('---------')
    setPaging((paging) => ({...paging, loading: true}));
    loadMoreMessage({ variables: { messageQuery: { conversationId: currentConversation?._id, page: currentPage + 1 } }})
    console.log('123456')
  }


  function confirm(messageId) {
    Modal.confirm({
      title: 'Confirm',
      icon: <ExclamationCircleOutlined />,
      content: 'Do you want to delete this message?',
      onOk: () => {
        removeMessage({variables: {messageId}})
          .then(() => refetch());
      }
    });
  }

  const confirmCall = () => {
    console.log(callerInfo)
    Modal.confirm({
      title: `${callerInfo?.fullname} is calling you`,
      icon: <ExclamationCircleOutlined />,
      content: 'Do you want to accept this message?',
      onOk: () => {
        setIsReceivingCall(isReceivingCall => !isReceivingCall)
        acceptCall()
      },
      onCancel:() => setIsReceivingCall(isReceivingCall => !isReceivingCall)
    });
  }

  return (
    <Content>
        <div className="chat-content">
          {conversationInfo}
          <Row>
            <Col span={isShowRightContent? 16 : 24}>
              <div className="demo-infinite-container" ref={messagesEndRef}>
                <InfiniteScroll
                  initialLoad={false}
                  pageStart={0}
                  useWindow={false}
                  loadMore={handleInfiniteOnLoad}
                  hasMore={paging.hasMore}
                  isReverse={true}
                  loader={
                    <Row justify="center">
                      <Spin />
                    </Row>
                  }
                >
                  <List
                    dataSource={rowData}
                    renderItem={item => {
                      return (
                        currentUserId === item.senderId ? (
                          <div className="chat-content-sender">
                            <List.Item
                              key={item._id}
                            >
                              <List.Item.Meta
                                title={
                                  <Row>
                                    <Space>
                                      <div className="more-action">
                                        <Popover
                                          placement="left"
                                          content={
                                            <>
                                              <Emoji emoji=':heart_eyes:' set='facebook' size={24} />
                                              <Emoji emoji=':hugging_face:' set='facebook' size={24} />
                                              <Emoji emoji=':joy:' set='facebook' size={24} />
                                              <Emoji emoji=':cry:' set='facebook' size={24} />
                                              <Emoji emoji='open_mount' set='apple' size={24} />
                                              <Emoji emoji=':+1:' set='facebook' size={24} />
                                              <Emoji emoji=':-1:' set='facebook' size={24} />
                                            </>
                                          }
                                          trigger="click"
                                        >
                                          <Button type="link" icon={<Smile size={16} color={"black"}/>}>
                                          </Button>
                                        </Popover>
                                        <Popover
                                          placement="left"
                                          content={
                                            <div onClick={() => confirm(item._id)}>Delete</div>
                                          }
                                          trigger="click"
                                        >
                                          <Button type="link" icon={<MoreHorizontal size={16} color={"black"}/>}>
                                          </Button>
                                        </Popover>
                                      </div>
                                      {renderMessage(item, item.type)}
                                    </Space>
                                  </Row>
                                }
                              />
                            </List.Item>
                          </div>
                        ) : (
                          <List.Item
                            key={item._id}
                          >
                            <List.Item.Meta
                              avatar={
                                <Avatar>U</Avatar>
                              }
                              title={
                                <>
                                  <Row>
                                    <Space>
                                      {renderMessage(item, item.type)}
                                      <div className="more-action">
                                        <Popover
                                          placement="right"
                                          content={
                                            <div onClick={() => confirm(item._id)}>Delete</div>
                                          }
                                          trigger="click"
                                        >
                                            <Button type="link" icon={<MoreHorizontal size={16} color={"black"}/>}>
                                            </Button>
                                        </Popover>
                                        <Popover
                                          placement="right"
                                          content={
                                            <>
                                              <Emoji emoji={{ id: 'smiley', skin: 3 }} size={32} />
                                              <Emoji emoji=':santa::skin-tone-3:' size={32} />
                                              <Emoji emoji='santa' set='apple' size={32} />
                                            </>
                                          }
                                          trigger="click"
                                        >
                                          <Button type="link" icon={<Smile size={16} color={"black"}/>}>
                                          </Button>
                                        </Popover>
                                    </div>
                                    </Space>
                                  </Row>
                                </>
                              }
                            />
                          </List.Item>
                        )
                      )
                    }}>
                  </List>
                </InfiniteScroll>
              </div>
            </Col>
            {isShowRightContent && (
              <Col span={8}>
                <RightContent />
              </Col>
            )}
          </Row>
        </div>
       <Modal
        title={`${callerInfo?.fullname} is calling you`}
        visible={isReceivingCall}
        onOk={() => {
          setIsReceivingCall(isReceivingCall => !isReceivingCall)
          acceptCall()
        }}
        onCancel={() => setIsReceivingCall(isReceivingCall => !isReceivingCall)}
      >
      </Modal>
      <ChatFooter />
    </Content>
  )
}

export default withRouter(ChatContent);
