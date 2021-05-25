import React, { useEffect, useState } from "react";
import { Avatar, Col, Collapse, Divider, Image, Row } from "antd";
import { UserOutlined } from "@ant-design/icons";
import { useLazyQuery, useQuery } from "@apollo/client";
import { GET_PHOTOS } from "../queries/message";
import { useSelector } from "react-redux";
const { Panel } = Collapse;

const RightContent = () => {
  const currentConversation = useSelector<string>(
    (state) => state?.conversation?.currentConversation
  );
  const currentUserId = useSelector<string>(
    (state) => state?.auth?.profile?._id
  );
  const [partnerName, setPartnerName] = useState();
  const [rowData, setRowData] = useState([]);
  const [getPhotos, { loading, data }] = useLazyQuery(GET_PHOTOS);

  useEffect(() => {
    if (currentConversation) {
      getPhotos({
        variables: {
          messageQuery: { conversationId: currentConversation._id },
        },
      });
    }
  }, [currentConversation]);

  useEffect(() => {
    if (!loading) {
      if (data && data.getPhotos) {
        if (data.getPhotos.length !== 0) {
          setRowData(data.getPhotos);
        } else {
          setRowData([]);
        }
      }
    }
  }, [loading, data]);

  useEffect(() => {
    if (currentConversation?.participants && currentUserId) {
      console.log(currentConversation);
      setPartnerName(
        currentConversation.participants
          .filter((participant) => participant._id !== currentUserId)
          .map((x) => x.fullname)
          .join()
      );
    }
  }, [currentConversation]);

  console.log(currentConversation);

  const renderPhotos = () => {
    if (rowData) {
      return rowData.map((x: any) => {
        console.log(x);
        return (
          <Col span={12}>
            {x.type === 1 ? (
              <Image src={x?.files?.url} />
            ) : (
              <video style={{ width: "100%" }} controls>
                <source src={x.files.url} type="video/mp4" />
              </video>
            )}
          </Col>
        );
      });
    }
  };
  console.log(rowData);
  return (
    <div className="right-content">
      <Row>
        <Avatar size={64} icon={<UserOutlined />} />
      </Row>
      <Row>
        <span>{partnerName}</span>
      </Row>
      <Collapse accordion style={{ width: "100%" }}>
        <Panel header="Photos" key="1">
          <Row>{renderPhotos()}</Row>
        </Panel>
      </Collapse>
      ,
    </div>
  );
};

export default RightContent;
