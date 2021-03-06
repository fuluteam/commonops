import React, { Component } from "react";
import { Descriptions, Layout, Tag, Typography, Tabs, Card } from "antd";
import { ReloadOutlined } from "@ant-design/icons";
import AreaChart from "../cloud_resource/common/area_chart.js";
import { getNodeMetrics } from "../../api/kubernetes";

const { Content } = Layout;
const { Text } = Typography;
const { TabPane } = Tabs;

class NodeDetailContent extends Component {
    constructor(props) {
        super(props);
        this.state = {
            nodeDetail: this.props.location.state,
            memoryChartData: [],
            cpuChartData: [],
        };
    }

    componentDidMount() {
        this.refreshNodeCpuMetrics();
        this.refreshNodeMemoryMetrics();
    }

    refreshNodeCpuMetrics() {
        getNodeMetrics({
            clusterId: localStorage.getItem("clusterId"),
            metricName: "cpu",
            nodeName: this.props.location.state.data.metadata.name,
        }).then((res) => {
            if (res.code === 0) {
                this.setState({
                    cpuChartData: res.data.items[0].metricPoints,
                });
            }
        });
    }

    refreshNodeMemoryMetrics() {
        getNodeMetrics({
            clusterId: localStorage.getItem("clusterId"),
            metricName: "memory",
            nodeName: this.props.location.state.data.metadata.name,
        }).then((res) => {
            if (res.code === 0) {
                this.setState({
                    memoryChartData: res.data.items[0].metricPoints,
                });
            }
        });
    }

    render() {
        let labels = [];
        for (let key in this.state.nodeDetail.data.metadata.labels) {
            labels.push(
                <div key={key}>
                    <Tag color="geekblue">
                        {key +
                            ":" +
                            this.state.nodeDetail.data.metadata.labels[key]}
                    </Tag>
                </div>,
            );
        }
        let annotations = [];
        for (let key in this.state.nodeDetail.data.metadata.annotations) {
            annotations.push(
                <div key={key}>
                    <Tag color="geekblue">
                        {key +
                            ":" +
                            this.state.nodeDetail.data.metadata.annotations[
                                key
                            ]}
                    </Tag>
                </div>,
            );
        }
        let addresses = [];
        const addressesData = this.state.nodeDetail.data.status.addresses;
        for (let i = 0; i < addressesData.length; i++) {
            addresses.push(
                <Text>
                    {addressesData[i]["type"] +
                        ":  " +
                        addressesData[i]["address"]}
                </Text>,
            );
            addresses.push(<br />);
        }
        return (
            <Content
                style={{
                    background: "#fff",
                    padding: "5px 20px",
                    margin: 0,
                    height: "100%",
                }}
            >
                <Tabs defaultActiveKey="Node??????">
                    <TabPane tab="Node??????" key="Node??????">
                        <Descriptions bordered size="small" column={1}>
                            <Descriptions.Item label="??????">
                                {this.state.nodeDetail.data.metadata.name}
                            </Descriptions.Item>
                            <Descriptions.Item label="????????????">
                                {
                                    this.state.nodeDetail.data.metadata
                                        .creationTimestamp
                                }
                            </Descriptions.Item>
                            <Descriptions.Item label="??????">
                                {labels}
                            </Descriptions.Item>
                            <Descriptions.Item label="??????">
                                {annotations}
                            </Descriptions.Item>
                            <Descriptions.Item label="??????">
                                {addresses}
                            </Descriptions.Item>
                            <Descriptions.Item label="kubelet??????">
                                {
                                    this.state.nodeDetail.data.status
                                        .daemonEndpoints.kubeletEndpoint.Port
                                }
                            </Descriptions.Item>
                            <Descriptions.Item label="????????????">
                                {
                                    this.state.nodeDetail.data.status.nodeInfo
                                        .containerRuntimeVersion
                                }
                            </Descriptions.Item>
                            <Descriptions.Item label="kubelet??????">
                                {
                                    this.state.nodeDetail.data.status.nodeInfo
                                        .kubeletVersion
                                }
                            </Descriptions.Item>
                            <Descriptions.Item label="kubeProxy??????">
                                {
                                    this.state.nodeDetail.data.status.nodeInfo
                                        .kubeProxyVersion
                                }
                            </Descriptions.Item>
                            <Descriptions.Item label="??????">
                                {
                                    this.state.nodeDetail.data.status.nodeInfo
                                        .operatingSystem
                                }
                            </Descriptions.Item>
                            <Descriptions.Item label="??????">
                                {
                                    this.state.nodeDetail.data.status.nodeInfo
                                        .architecture
                                }
                            </Descriptions.Item>
                        </Descriptions>
                    </TabPane>
                    <TabPane tab="Node??????" key="Node??????">
                        <Card
                            size="small"
                            title="CPU"
                            extra={
                                <ReloadOutlined
                                    onClick={this.refreshNodeCpuMetrics.bind(
                                        this,
                                    )}
                                />
                            }
                            style={{ marginBottom: 20 }}
                        >
                            <AreaChart
                                width="100%"
                                height={200}
                                xField="timestamp"
                                unit="m"
                                data={this.state.cpuChartData}
                            />
                        </Card>
                        <Card
                            size="small"
                            title="Memory"
                            extra={
                                <ReloadOutlined
                                    onClick={this.refreshNodeMemoryMetrics.bind(
                                        this,
                                    )}
                                />
                            }
                        >
                            <AreaChart
                                width="100%"
                                height={200}
                                xField="timestamp"
                                unit="Mi"
                                data={this.state.memoryChartData}
                            />
                        </Card>
                    </TabPane>
                </Tabs>
            </Content>
        );
    }
}

export default NodeDetailContent;
