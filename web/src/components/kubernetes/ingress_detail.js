import React, { Component } from "react";
import { Card, Descriptions, Layout, List } from "antd";
import moment from "moment";

const { Content } = Layout;

class IngressDetailContent extends Component {
    constructor(props) {
        super(props);
        this.state = {
            ingressDetail: this.props.location.state,
        };
    }

    render() {
        let certContent = this.state.ingressDetail.data.spec.tls.map(
            (item, index) => {
                return (
                    <span>
                        {item.secretName}
                        <br />
                    </span>
                );
            },
        );
        let domainContent = this.state.ingressDetail.data.spec.rules.map(
            (item, index) => {
                return (
                    <List
                        header={<div>{item.host}</div>}
                        bordered
                        dataSource={item.http.paths}
                        renderItem={(item) => (
                            <List.Item>
                                <Descriptions column={2}>
                                    <Descriptions.Item label="path">
                                        {item.path}
                                    </Descriptions.Item>
                                    <Descriptions.Item label="pathType">
                                        {item.pathType}
                                    </Descriptions.Item>
                                    <Descriptions.Item label="backend">
                                        {item.backend.serviceName}:
                                        {item.backend.servicePort}
                                    </Descriptions.Item>
                                </Descriptions>
                            </List.Item>
                        )}
                    />
                );
            },
        );
        return (
            <Content
                style={{
                    background: "#fff",
                    padding: "5px 20px",
                    margin: 0,
                    height: "100%",
                }}
            >
                <Card
                    size="small"
                    title="Ingress ??????"
                    style={{ width: "100%" }}
                >
                    <Descriptions bordered size="small" column={2}>
                        <Descriptions.Item label="??????">
                            {this.state.ingressDetail.data.metadata.name}
                        </Descriptions.Item>
                        <Descriptions.Item label="????????????">
                            {this.state.ingressDetail.data.metadata.namespace}
                        </Descriptions.Item>
                        <Descriptions.Item label="????????????">
                            {moment(
                                this.state.ingressDetail.data.metadata
                                    .creationTimestamp,
                            ).format("YYYY-MM-DD HH:mm:ss")}
                        </Descriptions.Item>
                        <Descriptions.Item label="??????">
                            {certContent}
                        </Descriptions.Item>
                        <Descriptions.Item label="????????????">
                            {domainContent}
                        </Descriptions.Item>
                    </Descriptions>
                </Card>
            </Content>
        );
    }
}

export default IngressDetailContent;
