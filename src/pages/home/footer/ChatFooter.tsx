import React, {useEffect, useRef, useState} from 'react';
import {Input, Popover, Space, Tooltip} from "antd";
import {File, Image, Send, Smile} from "react-feather";
import { Picker, NimblePicker } from "emoji-mart";
import {useMutation} from "@apollo/client";
import {NEW_MESSAGE, UPLOAD_FILE} from "../queries/message";
import {useSelector} from 'react-redux';
import data from 'emoji-mart/data/facebook.json'
import "emoji-mart/css/emoji-mart.css";

const { TextArea } = Input;

const ChatFooter = () => {
  const [emojiVisible, setEmojiVisible] = useState(false);
  const currentUserId = useSelector<string>(state => state?.auth?.profile?._id);
  const currentConversation = useSelector<string>(state => state?.conversation?.currentConversation);
  const [messageText, setMessageText] = useState('');
  const inputMessageRef = useRef(null);
  const [sendMessage] = useMutation(NEW_MESSAGE);
  const [uploadFile] = useMutation(UPLOAD_FILE);

  const onChangePhoto = ({target: {
                      validity,
                      files,
                    }, }) => {
    if (validity.valid) {
      const values = {
        conversationId: currentConversation?._id,
        senderId: currentUserId,
        type: 1,
      }
      uploadFile({ variables: { file: files[0], fileInfo: values } })
    }
  }

  const onChangeFile = ({target: {
    validity,
    files,
  }, }) => {
    if (validity.valid) {
      const values = {
        conversationId: currentConversation?._id,
        senderId: currentUserId,
        type: 4,
      }
      uploadFile({ variables: { file: files[0], fileInfo: values } })
    }
  }

  const addEmoji = (emoji) => {
    console.log(emoji)
     setMessageText(messageText => (messageText + emoji.native));
  }

  const onMessageChange = (e) =>  {
    setMessageText(e.target.value)
  }

  const handleSendMessage = () => {
    const values = {
      conversationId: currentConversation?._id,
      senderId: currentUserId,
      type: 0,
      message: messageText,
    }
    if (messageText.trim()) {
      sendMessage({ variables: { messageInput: values } })
    }
    setMessageText('')
    // socket.emit('messageAdded', values)
  }

  const handleVisibleChange = (visible) => {
    setEmojiVisible(visible);
  }

  return (
    <div style={{ display: "flex", alignItems: "center" }}>
      <div className="chat-footer custom-input">
        <Space>
          <label htmlFor="upload-photo">
            <Tooltip title={"image"}>
              <Image color={"rgb(0, 132, 255)"} />
            </Tooltip>
          </label>
          <input type="file" required id="upload-photo" onChange={(e) => onChangePhoto(e)} />
          <label htmlFor="upload-file">
            <Tooltip title={"file"}>
              <File color={"rgb(0, 132, 255)"} />
            </Tooltip>
          </label>
          <input type="file" required id="upload-file" onChange={(e) => onChangeFile(e)} />
          <Input
            placeholder="Input your message"
            ref={inputMessageRef}
            onChange={onMessageChange}
            onPressEnter={handleSendMessage}
            value={messageText}
            suffix={
              <Popover
                content={
                  <NimblePicker
                    set="facebook"
                    data={data}
                    onSelect={addEmoji}
                  />
                }
                title="Title"
                trigger="click"
                visible={emojiVisible}
                onVisibleChange={handleVisibleChange}
              >
                <Smile
                  style={{ cursor: "pointer" }}
                  size={20}
                  strokeWidth={1}
                  color={"rgb(0, 132, 255)"}
                />
              </Popover>
            }
          />
          <Send size={20} strokeWidth={1.5} color={"rgb(0, 132, 255)"} onClick={() => handleSendMessage()}/>
        </Space>
      </div>
    </div>
  )
}

export default ChatFooter;
