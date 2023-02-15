import React, { createContext, useEffect, useState } from 'react';
import './App.css';
import { Card, Form, Input, Row, Col, Button, Space, List, Select } from 'antd';
import {
  ClockCircleOutlined,
  DotChartOutlined,
  MessageOutlined,
  CalendarOutlined,
  PlayCircleOutlined,
} from '@ant-design/icons';
import mqtt from 'mqtt/dist/mqtt';
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
  const [gifOption, setGifOption] = useState(null);

  const onFinish = (values) => {
    publish(values);
  };
  const quotes = ['Hello Beautiful!', 'Well, hello there!', "Hi Goodlookin'!"];
  const options = {
    AQI: { title: 'Air Quality', Icon: DotChartOutlined, type: 'button' },
    prayer: { title: 'Prayer Times', Icon: CalendarOutlined, type: 'button' },
    gif: {
      title: 'Play GIF',
      Icon: PlayCircleOutlined,
      options: [
        { value: 'fireplace', label: 'Fireplace' },
        { value: 'matrix', label: 'Matrix' },
        { value: 'retro', label: 'Retro Vibe' },
      ],
      type: 'select',
    },
    clock: { title: 'Clock', Icon: ClockCircleOutlined, type: 'button' },
    random: { title: 'Random Boost', Icon: MessageOutlined, type: 'button' },
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
              renderItem={(option) => {
                const value = option[1];
                const Icon = value.Icon;
                const key = option[0];
                switch (value.type) {
                  case 'button':
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
                            })
                          }
                        >
                          {<Icon />}
                          {value.title}
                        </Button>
                      </List.Item>
                    );
                  case 'select':
                    return (
                      <List.Item>
                        <Select
                          defaultValue='fireplace'
                          style={{ width: 120 }}
                          onChange={(val) => setGifOption(val)}
                          options={value.options}
                        />
                        <Button
                          type='primary'
                          onClick={() => {
                            if (gifOption !== null) {
                              publish({
                                payload: gifOption,
                              });
                            }
                          }}
                        >
                          <PlayCircleOutlined />
                        </Button>
                      </List.Item>
                    );
                  default:
                    break;
                }
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
