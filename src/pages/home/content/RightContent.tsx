import React, {useEffect, useState} from 'react';
import {Avatar, Col, Collapse, Divider, Image, Row} from "antd";
import { UserOutlined } from '@ant-design/icons';
import {useQuery} from "@apollo/client";
import {GET_PHOTOS} from "../queries/message";
const { Panel } = Collapse;

const RightContent = () => {
  const [rowData, setRowData] = useState([]);
  const { loading, data } = useQuery(GET_PHOTOS, { variables: {messageQuery:{ conversationId: "35ac2d40-ec4b-11ea-9461-05031d2645f7"}} })

  useEffect(() => {
    if (!loading ) {
      if (data && data.getPhotos) {
        if (data.getPhotos.length !== 0) {
          setRowData(data.getPhotos)
        } else {
          setRowData([])
        }
      }
    }
  }, [loading, data])

  const renderPhotos = () => {
    if (rowData) {
      return rowData.map((x:any) => {
          console.log(x)
          return (
            <Col span={8}>
              <Image src={x?.files?.url} />
            </Col>
          )
        }
      )
    }
  }
  console.log(rowData)
  return (
    <div className="right-content">

      <Row>
        <Avatar size={64} icon={<UserOutlined />} />
      </Row>
      <Row>
        <span>
          Luyen
        </span>
      </Row>
      <Collapse accordion style={{ width: '100%'}}>
        <Panel header="anh dc chia se" key="1">
          <Row>
            {renderPhotos()}
          </Row>
        </Panel>
      </Collapse>,
    </div>
  )
}

export default RightContent;
