import React, { createContext, useEffect, useState } from 'react';
import './App.css';
import { Card, Form, Input, Row, Col, Button, Space, List } from 'antd';
import {
  ClockCircleOutlined,
  FireOutlined,
  DotChartOutlined,
  MessageOutlined,
  CalendarOutlined,
} from '@ant-design/icons';
import mqtt from 'mqtt/dist/mqtt';
console.log('process.env', process.env);
export const QosOption = createContext([]);
const qosOption = [
  {
    label: '0',
    value: 0,
  },
  {
    label: '1',
    value: 1,
  },
  {
    label: '2',
    value: 2,
  },
];
function App() {
  const [form] = Form.useForm();

  const onFinish = (values) => {
    publish(values);
  };
  const quotes = ['Hello Beautiful!', 'Well, hello there!', "Hi Goodlookin'!"];
  const options = {
    AQI: { title: 'Air Quality', Icon: DotChartOutlined },
    prayer: { title: 'Prayer Times', Icon: CalendarOutlined },
    clock: { title: 'Clock', Icon: ClockCircleOutlined },
    fireplace: { title: 'Fireplace', Icon: FireOutlined },
    random: { title: 'Random Boost', Icon: MessageOutlined },
  };
  const PublishForm = (
    <Form layout='vertical' name='basic' form={form} onFinish={onFinish}>
      <Row>
        <Col>
          <Form.Item label='' name='payload'>
            <Input.TextArea />
          </Form.Item>
        </Col>
      </Row>
      <Row>
        <Col className='ant-col'>
          <Form.Item>
            <Button type='primary' htmlType='submit'>
              Publish
            </Button>
          </Form.Item>
        </Col>
      </Row>
    </Form>
  );
  const [client, setClient] = useState(null);

  const mqttConnect = (host, mqttOption) => {
    setClient(mqtt.connect(host, mqttOption));
  };

  const record = {
    host: process.env.REACT_APP_MQTT_URL,
    clientId: `mqttjs_ + ${Math.random()
      .toString(16)
      .substr(2, 8)}`,
    port: process.env.REACT_APP_MQTT_PORT,
    topic: process.env.REACT_APP_MQTT_TOPIC,
    username: process.env.REACT_APP_MQTT_USERNAME,
    password: process.env.REACT_APP_MQTT_PASSWORD,
    qos: 2,
  };
  const connectToMqtt = () => {
    const { host, clientId, port, username, password } = record;
    const url = `wss://${host}:${port}`;
    // details can be found here: https://www.npmjs.com/package/mqtt#client
    const options = {
      keepalive: 30,
      protocolId: 'MQTT',
      protocolVersion: 4,
      clean: true,
      reconnectPeriod: 1000,
      connectTimeout: 30 * 1000,
      username,
      password,
      rejectUnauthorized: false,
    };
    options.clientId = clientId;
    mqttConnect(url, options);
  };

  useEffect(() => {
    connectToMqtt();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // connect once at startup
  useEffect(() => {
    if (client) {
      client.on('error', (err) => {
        console.error('Connection error: ', err);
        client.end();
      });
    }
  }, [client]);

  const publish = (context) => {
    if (client) {
      const { payload } = context;
      client.publish(record.topic, payload, { qos: record.qos }, (error) => {
        if (error) {
          console.log('Publish error: ', error);
        }
      });
    }
  };
  return (
    <div className='App' style={{ margin: 20, padding: 20 }}>
      {/* <MQTTConnect /> */}
      <QosOption.Provider value={qosOption}>
        <div className='site-card-wrapper'>
          <Space wrap>
            <List
              size='large'
              // header={<div>Display Options</div>}
              dataSource={Object.entries(options)}
              renderItem={(value) => {
                const Icon = value[1].Icon;
                const key = value[0];
                return (
                  <List.Item>
                    <Button
                      block={true}
                      size='large'
                      type='primary'
                      onClick={() =>
                        publish({
                          payload:
                            key === 'random'
                              ? quotes[
                                  Math.floor(Math.random() * quotes.length)
                                ]
                              : key,
                          // value:
                          //   key === 'random'
                          //     ? quotes[
                          //         Math.floor(Math.random() * quotes.length)
                          //       ]
                          //     : `value: ${key}`,
                        })
                      }
                    >
                      {<Icon />}
                      {value[1].title}
                    </Button>
                  </List.Item>
                );
              }}
            />
            <Col span={20}>
              <Card title='Custom Text' bordered={false}>
                {PublishForm}
              </Card>
            </Col>
          </Space>
        </div>
      </QosOption.Provider>
    </div>
  );
}

export default App;
