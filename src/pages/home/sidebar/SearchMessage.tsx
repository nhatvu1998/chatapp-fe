import React, { useEffect, useState } from "react";
import { Avatar, Input, List, Row } from "antd";
import { useLazyQuery, useQuery } from "@apollo/client";
import { useSelector } from "react-redux";
import { SEARCH_MESSAGE } from "../queries/message";
import moment from "moment";
import { MoreHorizontal } from "react-feather";
import InfiniteScroll from "react-infinite-scroller";

const { Search } = Input;

interface Message {
  _id: string;
  message: string;
  senderId: string;
  createdAt: string;
}

const SearchMesssage = () => {
  const [rowData, setRowData] = useState<Message[]>([]);
  const [searchMessage, { loading, data }] = useLazyQuery(SEARCH_MESSAGE);
  const currentConversation = useSelector(
    (state) => state?.conversation?.currentConversation
  );
  const currentUserId = useSelector<string>(
    (state) => state?.auth?.profile?._id
  );
  console.log(currentConversation);
  useEffect(() => {
    if (!loading) {
      if (data && data.searchMessage) {
        console.log(data.searchMessage);
        setRowData(data.searchMessage);
      }
    }
  }, [loading, data]);

  const onSearchMessage = (value) => {
    searchMessage({
      variables: {
        messageQuery: {
          conversationId: currentConversation._id,
          searchText: value,
        },
      },
    });
  };

  return (
    <>
      <div className="message-list-infinite-container">
        <Row className={"search-message"}>
          <Search
            width={"100%"}
            placeholder="Search message"
            onSearch={(value) => onSearchMessage(value)}
            loading={loading}
          />
        </Row>
        <InfiniteScroll
          initialLoad={false}
          pageStart={0}
          hasMore={true}
          // loadMore={handleInfiniteOnLoad}
          useWindow={false}
        >
          <List
            itemLayout="vertical"
            dataSource={rowData}
            renderItem={(item) => (
              <List.Item
                key={item._id}
                // onClick={() => selectConversation(item)}
                extra={
                  <>
                    <Row>
                      <span className="message-time">
                        {moment(item.createdAt).fromNow()}
                      </span>
                    </Row>
                    <Row justify="end">
                      <div className="more-action">
                        {/* eslint-disable-next-line jsx-a11y/anchor-is-valid */}
                        <a key="list-loadmore-edit" href="#">
                          <MoreHorizontal size={16} color={"black"} />
                        </a>
                      </div>
                    </Row>
                  </>
                }
              >
                <List.Item.Meta
                  avatar={<Avatar>U</Avatar>}
                  // title={<a href="https://ant.design">{item.title}</a>}
                  title={
                    <div className="list-description">
                      {item.senderId === currentUserId ? "Bạn: " : ""}{" "}
                      {item.message}
                    </div>
                  }
                />
              </List.Item>
            )}
          ></List>
        </InfiniteScroll>
      </div>
    </>
  );
};

export default SearchMesssage;
