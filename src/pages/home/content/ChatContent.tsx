import React, {useEffect, useRef, useState} from 'react';
import {useLazyQuery, useMutation, useQuery, useSubscription} from "@apollo/client";
import {FIND_ALL_MESSAGE, MESSAGES_SUBSCRIPTION} from "../queries/message";
import {Avatar, Col, Layout, List, Row, Space, Tooltip, Image, Spin, Modal} from "antd";
import InfiniteScroll from 'react-infinite-scroller';
import {useSelector} from 'react-redux';
import {withRouter} from 'react-router-dom';
import {ArrowDownCircle, Info, Sidebar, Video} from "react-feather";
import moment from 'moment';
import ChatFooter from "../footer/ChatFooter";
import RightContent from "./RightContent";
import {useDispatch} from 'react-redux';
import { v4 as uuidv4 } from 'uuid';
import io from 'socket.io-client';
import {ACCEPT_CALL, START_CALL_USER} from "../../calling/queries";
const {Header, Content} = Layout;

interface Message {
  _id: string,
  message: string;
  senderId: string;
  type: string;
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
export const socket = io.connect(`http://${window.location.hostname}:4000`, {query: {token}});

const ChatContent = (props) => {
  const [rowData, setRowdata] = useState<Message[]>([]);
  const [paging, setPaging] = useState<PagingType>({
    data: [],
    currentPage: 0,
    loading: false,
    hasMore: true,
  })
  const dispatch = useDispatch();
  const token = window.localStorage.getItem('token');

  const [acceptCallUser] = useMutation(ACCEPT_CALL);

  const [peerId, setPeerId] = useState('');
  const [isShowRightContent, setIsShowRightContent] = useState(false)
  const currentUserId = useSelector<string>(state => state?.auth?.profile?._id);
  const currentConversation = useSelector<string>(state => state?.conversation?.currentConverSation);
  const messagesEndRef = useRef(null);
  const [loadMessage, { data, loading }] = useLazyQuery(FIND_ALL_MESSAGE)
  // const { data: dataAdded, loading: loadingAdded } = useSubscription(
  //   MESSAGES_SUBSCRIPTION,
  // );
  const [isReceivingCall, setIsReceivingCall] = useState(false);
  const [userCalling, setUserCalling] = useState('');
  const [callerSignal, setCallerSignal] = useState();

  useEffect(() => {
    socket.emit('join room', roomId => {
      console.log(roomId)
    })
  })

  const acceptCall = async () => {
    setIsReceivingCall(isReceivingCall => !isReceivingCall)


  }

  useEffect(() => {
    if (currentConversation) {
      setRowdata([])
      setPaging((paging) => ({...paging, currentPage: 1, loading: false}))
      loadMessage({ variables: { messageQuery: { conversationId: currentConversation?._id } }});
    }
  }, [currentConversation])

  useEffect(() => {
    if (rowData && paging.currentPage === 1) {
      if (messagesEndRef.current) {
        // @ts-ignore
        messagesEndRef.current.scrollTop = messagesEndRef.current.scrollHeight;
      }
    }
  }, [rowData])

  // useEffect(() => {
  //   if (!loadingAdded ) {
  //     if (dataAdded && dataAdded.messageAdded) {
  //       console.log(dataAdded.messageAdded)
  //       setRowdata((rowData=> [...rowData, dataAdded.messageAdded]));
  //     }
  //   }
  // }, [dataAdded])

  useEffect(() => {
    if (!loading ) {
      if (data && data.findAllMessage) {
        if (data.findAllMessage.length !== 0) {
          if (data.findAllMessage.length < 50) {
            setPaging((paging) => ({...paging, loading: false, hasMore: false}));
          }
          setPaging((paging) => ({...paging, currentPage: paging.currentPage + 1, loading: false}));
          let result = data.findAllMessage.slice().sort((a, b) => {
            // @ts-ignore
            return new Date(a.createdAt) - new Date(b.createdAt);
          })
          setRowdata([...result, ...rowData])
        }
      }
    }
  }, [loading, data])

  const startCall = () => {
    const peerId = uuidv4()
    // props.history.push(`/calling?peer_id=${peerId}`)
    window.open(
      `http://${window.location.hostname}:3000/calling?peer_id=${peerId}`, '',
      "resizable,scrollbars,status")
    // window.open(
    //   `http://172.15.197.170:3000/calling?peer_id=${peerId}`, '',
    //   "resizable,scrollbars,status")
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
        <Col span={1} offset={9}>
          <Tooltip title="Settings">
            <Video size={16} onClick={() => startCall()}/>
          </Tooltip>
        </Col>
        <Col span={1}>
          <Tooltip title="Info">
            <Info size={16} />
          </Tooltip>
        </Col>
        <Col span={1}>
          <Tooltip title="Sidebar">
            <Sidebar size={16} onClick={() => setIsShowRightContent(!isShowRightContent)}/>
          </Tooltip>
        </Col>
      </Row>
    </Header>
  )

  const renderMessage = (item, type: string) => {
    switch (type) {
      case "text":
        return (
          <Tooltip title={moment(item.createdAt).format('hh:mm')}>
            <div className="chat-content__message">
              {item.message}
            </div>
          </Tooltip>
      );
      case "image":
        return (
          <span>
            <Image
              width={'25vw'}
              src={item.files.url}
            />
          </span>
        );
      case "audio":
        return (
          <span>
            {item.message}
          </span>
        );
      case "video":
        return (
          <video className="message-video" controls>
            <source src={item.files.url} type="video/mp4" />
          </video>
        )
      case "file":
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
    loadMessage({ variables: { messageQuery: { conversationId: "35ac2d40-ec4b-11ea-9461-05031d2645f7", page: currentPage + 1 } }})
  }

  return (
    <Content>
        <div className="chat-content">
          {conversationInfo}
          <Row>
            <Col span={isShowRightContent? 16 : 24}>
              <div className="demo-infinite-container" id={"ok"} ref={messagesEndRef}>
                <InfiniteScroll
                  initialLoad={false}
                  pageStart={0}
                  useWindow={false}
                  loadMore={handleInfiniteOnLoad}
                  hasMore={true}
                  isReverse={true}
                >
                  {paging.loading && paging.hasMore && (
                    <Row justify="center">
                      <Spin />
                    </Row>
                  )}
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
                                    renderMessage(item, item.type)
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
                                renderMessage(item, item.type)
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
      <ChatFooter />
      <Modal
        title={`${callerSignal?.userId} is calling you`}
        visible={isReceivingCall}
        onOk={() => acceptCall()}
        onCancel={() => setIsReceivingCall(isReceivingCall => !isReceivingCall)}
      >
      </Modal>
    </Content>
  )
}

export default withRouter(ChatContent);
