import React, { Component } from "react";
import {
    Button,
    Col,
    DatePicker,
    Descriptions,
    Divider,
    Drawer,
    Form,
    Typography,
    Input,
    InputNumber,
    Layout,
    message,
    Modal,
    Radio,
    Row,
    Select,
    Spin,
    Table,
    Tabs,
    Popconfirm,
    Badge,
    Tooltip,
} from "antd";
import {
    SearchOutlined,
    PlusCircleOutlined,
    EyeInvisibleOutlined,
    EyeTwoTone,
} from "@ant-design/icons";
import OpsBreadcrumbPath from "../breadcrumb_path";
import moment from "moment";
import "../../assets/css/main.css";
import {
    deleteCloudServer,
    getCloudAccouts,
    getCloudMonitorEcs,
    getCloudServerDetail,
    getCloudServers,
    postCloudServer,
    putCloudServer,
} from "../../api/cloud";
import "moment/locale/zh-cn";
import ExtraInfoModal from "./common/extra_info_modal";
import LineChart from "./common/line_chart";
import { LinuxSvg, WindowsSvg } from "../../assets/Icons";
import { Terminal } from "xterm";
import { AttachAddon } from "xterm-addon-attach";
import "../../../node_modules/xterm/css/xterm.css";
import ReconnectingWebSocket from "reconnecting-websocket";
import { WSBase } from "../../config";
moment.locale("zh-cn");

const TabPane = Tabs.TabPane;
const { Text, Paragraph } = Typography;
const Option = Select.Option;
const { Content } = Layout;

class ServerInfoModal extends Component {
    constructor(props) {
        super(props);
        this.state = {
            cloudAccountList: [],
        };
    }

    componentDidMount() {
        let that = this;
        getCloudAccouts(1, 100)
            .then((res) => {
                if (res.code === 0) {
                    that.setState({
                        cloudAccountList: res.data.accounts,
                    });
                } else {
                    message.error(res.msg);
                }
            })
            .catch((err) => {
                message.error(err.toLocaleString());
            });
    }

    render() {
        const formItemLayout = {
            labelCol: { span: 7 },
            wrapperCol: { span: 14 },
        };
        let accountOptions;
        accountOptions = this.state.cloudAccountList.map((item) => {
            return (
                <Option key={item.id} value={item.id}>
                    {item.accountName}
                </Option>
            );
        });

        return (
            <Modal
                title="???????????????"
                destroyOnClose={true}
                visible={this.props.server_info_modal_visible}
                onOk={this.props.handlePostServerInfoSubmit}
                onCancel={this.props.handlePostServerInfoCancel}
                okText="??????"
                cancelText="??????"
                centered={true}
                width={600}
            >
                <Form
                    ref={this.props.formRef}
                    initialValues={{ osType: "linux" }}
                >
                    <Form.Item
                        label="?????????"
                        {...formItemLayout}
                        name="cloudAccountId"
                        rules={[
                            { required: true, message: "????????????????????????" },
                        ]}
                    >
                        <Select>{accountOptions}</Select>
                    </Form.Item>
                    <Form.Item
                        label="?????????"
                        {...formItemLayout}
                        name="hostName"
                    >
                        <Input />
                    </Form.Item>
                    <Form.Item
                        label="??????Id"
                        {...formItemLayout}
                        name="instanceId"
                    >
                        <Input />
                    </Form.Item>
                    <Form.Item
                        label="????????????"
                        {...formItemLayout}
                        name="instanceName"
                        rules={[
                            { required: true, message: "???????????????????????????" },
                        ]}
                    >
                        <Input />
                    </Form.Item>
                    <Form.Item
                        label="????????????"
                        {...formItemLayout}
                        name="description"
                    >
                        <Input />
                    </Form.Item>
                    <Form.Item
                        label="??????IP"
                        {...formItemLayout}
                        name="innerIpAddress"
                    >
                        <Input />
                    </Form.Item>
                    <Form.Item
                        label="??????IP"
                        {...formItemLayout}
                        name="publicIpAddress"
                    >
                        <Input />
                    </Form.Item>
                    <Form.Item
                        label="????????????"
                        {...formItemLayout}
                        name="osType"
                        rules={[
                            { required: true, message: "???????????????????????????" },
                        ]}
                    >
                        <Select>
                            <Option value="linux">Linux</Option>
                            <Option value="windows">Windows</Option>
                        </Select>
                    </Form.Item>
                    <Form.Item
                        label="CPU??????(???)"
                        {...formItemLayout}
                        name="cpu"
                        rules={[
                            {
                                type: "integer",
                                required: true,
                                message: "???????????????????????????",
                            },
                        ]}
                    >
                        <InputNumber />
                    </Form.Item>
                    <Form.Item
                        label="??????(G)"
                        {...formItemLayout}
                        name="memory"
                        rules={[
                            {
                                type: "integer",
                                required: true,
                                message: "???????????????????????????",
                            },
                        ]}
                    >
                        <InputNumber />
                    </Form.Item>
                    <Form.Item
                        label="??????(G)"
                        {...formItemLayout}
                        name="disk"
                        rules={[{ type: "integer" }]}
                    >
                        <InputNumber />
                    </Form.Item>
                    <Form.Item
                        label="????????????"
                        {...formItemLayout}
                        name="createTime"
                        rules={[
                            { required: true, message: "???????????????????????????" },
                        ]}
                    >
                        <DatePicker format="YYYY-MM-DD" />
                    </Form.Item>
                    <Form.Item
                        label="????????????"
                        {...formItemLayout}
                        name="expiredTime"
                    >
                        <DatePicker format="YYYY-MM-DD" />
                    </Form.Item>
                    <Form.Item
                        label="SSH????????????"
                        {...formItemLayout}
                        name="sshPort"
                        rules={[{ type: "integer" }]}
                    >
                        <InputNumber />
                    </Form.Item>
                    <Form.Item
                        label="SSH????????????"
                        {...formItemLayout}
                        name="sshUser"
                    >
                        <Input />
                    </Form.Item>
                    <Form.Item
                        label="SSH????????????"
                        {...formItemLayout}
                        name="sshPwd"
                    >
                        <Input.Password
                            iconRender={(visible) =>
                                visible ? (
                                    <EyeTwoTone />
                                ) : (
                                    <EyeInvisibleOutlined />
                                )
                            }
                        />
                    </Form.Item>
                </Form>
            </Modal>
        );
    }
}

class ServerContent extends Component {
    constructor(props) {
        super(props);
        this.handlePostServerInfoSubmit = this.handlePostServerInfoSubmit.bind(
            this,
        );
        this.handlePostServerInfoCancel = this.handlePostServerInfoCancel.bind(
            this,
        );
        this.handleExtraInfoOk = this.handleExtraInfoOk.bind(this);
        this.handleExtraInfoCancel = this.handleExtraInfoCancel.bind(this);
        let operWidth = this.props.isSuperAdmin ? 220 : 100;
        this.formRef = React.createRef();
        this.state = {
            columns: [
                {
                    title: "Id",
                    dataIndex: "ID",
                    key: "ID",
                    width: 50,
                    render: (value) => {
                        return <Text ellipsis={true}>{value}</Text>;
                    },
                },
                {
                    title: "??????id",
                    dataIndex: "InstanceId",
                    key: "InstanceId",
                    width: 200,
                },
                {
                    title: "????????????",
                    dataIndex: "InstanceName",
                    key: "InstanceName",
                    width: 200,
                    textWrap: "word-break",
                    render: (value) => {
                        return (
                            <Tooltip title={value}>
                                <Text
                                    ellipsis={true}
                                    style={{ width: "200px" }}
                                >
                                    {value}
                                </Text>
                            </Tooltip>
                        );
                    },
                },
                {
                    title: "ip",
                    dataIndex: "ip",
                    key: "ip",
                    width: 200,
                    render: (value, record) => {
                        let innerContent = "";
                        let privateContent = "";
                        let publicContent = "";
                        if (record.InnerIpAddress) {
                            innerContent = (
                                <div>
                                    <Paragraph
                                        style={{
                                            marginBottom: 0,
                                            display: "inline",
                                        }}
                                        copyable={record.InnerIpAddress !== ""}
                                    >
                                        {record.InnerIpAddress}
                                    </Paragraph>
                                    (??????)
                                </div>
                            );
                        }
                        if (record.PrivateIpAddress) {
                            privateContent = (
                                <div>
                                    <Paragraph
                                        style={{
                                            marginBottom: 0,
                                            display: "inline",
                                        }}
                                        copyable={
                                            record.PrivateIpAddress !== ""
                                        }
                                    >
                                        {record.PrivateIpAddress}
                                    </Paragraph>
                                    (??????)
                                </div>
                            );
                        }
                        if (record.PublicIpAddress) {
                            publicContent = (
                                <div>
                                    <Paragraph
                                        style={{
                                            marginBottom: 0,
                                            display: "inline",
                                        }}
                                        copyable={record.PublicIpAddress !== ""}
                                    >
                                        {record.PublicIpAddress}
                                    </Paragraph>
                                    (??????)
                                </div>
                            );
                        }
                        return (
                            <div className="ip_column">
                                {innerContent}
                                {privateContent}
                                {publicContent}
                            </div>
                        );
                    },
                },
                {
                    title: "??????",
                    dataIndex: "??????",
                    key: "??????",
                    width: 100,
                    render: (value, record) => {
                        let cpuContent = (
                            <Paragraph
                                style={{ marginBottom: 0, display: "inline" }}
                            >
                                {record.Cpu}???
                            </Paragraph>
                        );
                        let memoryContent = (
                            <Paragraph
                                style={{ marginBottom: 0, display: "inline" }}
                            >
                                {record.Memory}G
                            </Paragraph>
                        );
                        let trafficType = "";
                        if (record.InternetChargeType === "PayByTraffic") {
                            trafficType = "??????";
                        }
                        if (record.InternetChargeType === "PayByBandwidth") {
                            trafficType = "??????";
                        }
                        let trafficOutContent = (
                            <div>
                                <Paragraph
                                    style={{
                                        marginBottom: 0,
                                        display: "inline",
                                    }}
                                >
                                    {record.InternetMaxBandwidthOut}Mbps(
                                    {trafficType})
                                </Paragraph>
                            </div>
                        );
                        return (
                            <div className="ip_column">
                                {cpuContent} &nbsp;
                                {memoryContent}
                                {trafficOutContent}
                            </div>
                        );
                    },
                },
                {
                    title: "????????????",
                    dataIndex: "OSType",
                    key: "OSType",
                    align: "center",
                    width: 80,
                    render: (value, record) => {
                        let status = "error";
                        if (record.Status === "Running") {
                            status = "processing";
                        }
                        if (value === "windows") {
                            return (
                                <div>
                                    <WindowsSvg />
                                    <Badge
                                        status={status}
                                        style={{
                                            marginLeft: "5px",
                                            position: "relative",
                                            top: "-10px",
                                        }}
                                    />
                                </div>
                            );
                        } else if (value === "linux") {
                            return (
                                <div>
                                    <LinuxSvg />
                                    <Badge
                                        status={status}
                                        style={{
                                            marginLeft: "5px",
                                            position: "relative",
                                            top: "-10px",
                                        }}
                                    />
                                </div>
                            );
                        } else {
                            return <Text ellipsis={true}>{value}</Text>;
                        }
                    },
                },
                {
                    title: "??????",
                    dataIndex: "ZoneId",
                    key: "ZoneId",
                    width: 120,
                    render: (value) => {
                        return <Text ellipsis={true}>{value}</Text>;
                    },
                },
                {
                    title: "????????????",
                    dataIndex: "ExpiredTime",
                    key: "ExpiredTime",
                    width: 120,
                    render: (value) => {
                        return <Text ellipsis={true}>{value}</Text>;
                    },
                },
                {
                    title: "??????",
                    key: "operation",
                    fixed: "right",
                    width: { operWidth },
                    align: "center",

                    render: (text, record) => {
                        return (
                            <div>
                                <Button
                                    type="primary"
                                    size="small"
                                    onClick={this.openMonitorDrawer.bind(
                                        this,
                                        record,
                                    )}
                                >
                                    ??????
                                </Button>
                                <Divider type="vertical" />
                                <Button
                                    type="info"
                                    size="small"
                                    onClick={this.serverEdit.bind(this, record)}
                                >
                                    ??????
                                </Button>
                                <Divider type="vertical" />
                                <Popconfirm
                                    title="?????????????????????????"
                                    onConfirm={this.serverDelete.bind(
                                        this,
                                        record,
                                    )}
                                    okText="??????"
                                    cancelText="??????"
                                >
                                    <Button type="danger" size="small">
                                        ??????
                                    </Button>
                                </Popconfirm>
                            </div>
                        );
                    },
                },
            ],
            tableLoading: false,
            webSocketReady: false,
            chartData: [],
            tableData: [],
            pagination: {
                showSizeChanger: true,
                pageSizeOptions: ["10", "20", "30", "100"],
                onShowSizeChange: (current, size) =>
                    this.onShowSizeChange(current, size),
                showQuickJumper: false,
                showTotal: (total) => `??? ${total} ???`,
                pageSize: 10,
                page: 1,
                total: 0,
                onChange: (page, pageSize) => this.changePage(page, pageSize),
            },
            drawerVisible: false,
            drawerPlacement: "left",
            instanceId: "",
            timeTagValue: "1h",
            metricTagValue: "CPUUtilization",
            chartFormat: "%",
            currentServerDetail: {},
            msgContent: "",
            server_info_modal_visible: false,
            queryExpiredTime: null,
            queryKeyword: "",
            queryCloudAccount: "0",
            queryManageUser: "0",
            queryDefineGroup: "",
            cloudAccountList: [],
            selectedRowKeys: [],
            idsList: [],
            updateMode: "single",
            extraInfoData: {},
        };
        // -----------------------
        this.timer = null;
        this.terminal = null;
        this.rws = null;
    }

    onShowSizeChange(current, size) {
        let pagination = {
            ...this.state.pagination,
            page: 1,
            current: 1,
            pageSize: size,
        };
        this.setState(
            {
                pagination: pagination,
            },
            () => {
                this.refreshTableData();
            },
        );
    }

    componentDidMount() {
        this.refreshTableData();
        this.loadCloudAccountsData();
    }

    componentWillUnmount() {
        if (this.rws !== null) {
            this.rws.close();
        }
        if (this.terminal !== null) {
            this.terminal.dispose();
        }
    }

    initWsConnection() {
        this.rws.addEventListener("open", () => {
            console.log("connect success");
        });

        this.rws.addEventListener("close", () => {
            console.log("close");
        });

        this.rws.addEventListener("message", (e) => {
            console.log("message: ", e);
        });

        this.rws.addEventListener("error", () => {
            console.log("error");
        });
    }

    loadCloudAccountsData() {
        let that = this;
        getCloudAccouts(1, 100)
            .then((res) => {
                if (res.code === 0) {
                    that.setState({
                        cloudAccountList: res.data.accounts,
                    });
                } else {
                    message.error(res.msg);
                }
            })
            .catch((err) => {
                message.error(err.toLocaleString());
            });
    }

    serverEdit(data) {
        getCloudServerDetail(data.ID)
            .then((res) => {
                if (res["code"] !== 0) {
                    message.error(res["msg"]);
                } else {
                    let extraInfoData = {
                        instanceId: res.data["InstanceId"],
                        innerIpAddress: res.data["InnerIpAddress"],
                        publicIpAddress: res.data["PublicIpAddress"],
                        privateIpAddress: res.data["PrivateIpAddress"],
                        instanceName: res.data["InstanceName"],
                        cpu: res.data["Cpu"],
                        memory: (res.data["Memory"] / 1024).toString(),
                        expiredTime:
                            res.data["ExpiredTime"] !== ""
                                ? moment(res.data["ExpiredTime"])
                                : "",
                        resForm:
                            res.data["DataStatus"] === 1
                                ? "?????????"
                                : "????????????",
                        sshPort: res.data["SshPort"] + "",
                        sshUser: res.data["SshUser"],
                        sshPwd: res.data["SshPwd"],
                    };
                    this.setState({
                        extraInfoModalVisible: true,
                        ecsId: data.ID,
                        updateMode: "single",
                        resFrom:
                            data["DataStatus"] === 1 ? "?????????" : "????????????",
                        extraInfoData: extraInfoData,
                    });
                }
            })
            .catch((err) => {
                message.error(err.toLocaleString());
            });
    }

    handleExtraInfoOk(data) {
        let targetId = "";
        if (this.state.updateMode === "single") {
            targetId = String(this.state.ecsId);
        } else {
            targetId = this.state.idsList.join(",");
        }
        putCloudServer({
            ...data,
            id: targetId,
        })
            .then((res) => {
                if (res.code === 0) {
                    this.setState({
                        extraInfoModalVisible: false,
                        selectedRowKeys: [],
                    });
                    message.success("????????????");
                    this.refreshTableData();
                } else {
                    message.error(res.msg);
                }
            })
            .catch((err) => {
                message.error(err.toLocaleString());
            });
    }

    handleExtraInfoCancel(data) {
        this.setState({ extraInfoModalVisible: false });
    }

    serverDelete(data) {
        deleteCloudServer(data.ID)
            .then((res) => {
                if (res.code === 0) {
                    message.success("????????????");
                    this.refreshTableData();
                } else {
                    message.error(res.msg);
                }
            })
            .catch((err) => {
                message.error(err.toLocaleString());
            });
    }

    refreshTableData = () => {
        this.setState({ tableLoading: true });
        const queryParams = {
            page: this.state.pagination.page,
            size: this.state.pagination.pageSize,
            queryExpiredTime:
                this.state.queryExpiredTime === null
                    ? null
                    : this.state.queryExpiredTime.format("YYYY-MM-DD HH:mm:ss"),
            queryKeyword: this.state.queryKeyword,
            queryCloudAccount: this.state.queryCloudAccount,
        };
        getCloudServers(queryParams)
            .then((res) => {
                const pagination = this.state.pagination;
                pagination.total = parseInt(res.data.total);
                pagination.page = parseInt(res.data.page);
                pagination.showTotal(parseInt(res.data.total));
                this.setState({
                    pagination: { ...pagination },
                });
                let data = res["data"]["servers"];
                let tableData = [];
                for (let i = 0; i < data.length; i++) {
                    tableData.push({
                        key: data[i]["ID"],
                        ID: data[i]["ID"],
                        Memory: data[i]["Memory"] / 1024,
                        Cpu: data[i]["Cpu"],
                        HostName: data[i]["HostName"],
                        InstanceId: data[i]["InstanceId"],
                        InnerIpAddress: data[i]["InnerIpAddress"],
                        PublicIpAddress: data[i]["PublicIpAddress"],
                        PrivateIpAddress: data[i]["PrivateIpAddress"],
                        InternetMaxBandwidthIn:
                            data[i]["InternetMaxBandwidthIn"],
                        InternetMaxBandwidthOut:
                            data[i]["InternetMaxBandwidthOut"],
                        InternetChargeType: data[i]["InternetChargeType"],
                        InstanceName: data[i]["InstanceName"],
                        OSType: data[i]["OSType"],
                        ZoneId: data[i]["ZoneId"],
                        OSName: data[i]["OSName"],
                        ExpiredTime: moment(data[i]["ExpiredTime"]).format(
                            "YYYY-MM-DD",
                        ),
                        Status: data[i]["Status"],
                        CloudAccountName: data[i]["CloudAccountName"],
                        DataStatus: data[i]["DataStatus"],
                        SshPort: data[i]["SshPort"] + "",
                        SshUser: data[i]["SshUser"],
                        SshPwd: data[i]["SshPwd"],
                    });
                }
                this.setState({ tableData: tableData, tableLoading: false });
            })
            .catch((err) => {
                message.error(err);
            });
    };

    openMonitorDrawer = (data) => {
        this.setState(
            {
                drawerVisible: true,
                instanceId: data.InstanceId,
                currentServerDetail: data,
            },
            () => {
                this.refreshMonitorData(
                    data.InstanceId,
                    this.state.timeTagValue,
                    this.state.metricTagValue,
                );
                this.refreshSeverDetail();
            },
        );
    };

    refreshMonitorData = (instanceId, timeTagValue, metricTagValue) => {
        this.setState({ chartLoading: true });
        getCloudMonitorEcs(instanceId, timeTagValue, metricTagValue)
            .then((res) => {
                if (res["code"] !== 0) {
                    message.error(res["msg"]);
                    this.setState({ chartLoading: false });
                    return;
                }
                if (res["data"]["Datapoints"] === "") {
                    message.warn(
                        "????????????????????????????????????????????????????????????????????????",
                    );
                    this.setState({ chartLoading: false });
                    return;
                }
                let dataPoints = JSON.parse(res["data"]["Datapoints"]);
                let chartData = [];
                for (let i = 0; i < dataPoints.length; i++) {
                    chartData.push({
                        date: moment(dataPoints[i]["timestamp"]).format(
                            "DD???HH:mm",
                        ),
                        value: dataPoints[i]["Average"],
                    });
                }
                this.setState({ chartLoading: false, chartData: chartData });
            })
            .catch((err) => {
                message.error(err.toLocaleString());
            });
    };

    // ??????????????????????????????
    refreshSeverDetail = (e) => {
        this.setState({ serverDetailLoading: true });
        getCloudServerDetail(this.state.currentServerDetail.ID)
            .then((res) => {
                if (res["code"] !== 0) {
                    message.error(res["msg"]);
                }
                this.setState({ currentServerDetail: res["data"] }, () => {
                    this.setState({ serverDetailLoading: false });
                });
            })
            .catch((err) => {
                message.error(err.toLocaleString());
            });
    };

    changePage = (page, pageSize) => {
        this.setState(
            {
                pagination: {
                    ...this.state.pagination,
                    page: page,
                    current: page,
                    pageSize: pageSize,
                },
            },
            () => {
                this.refreshTableData();
            },
        );
    };

    onCloseDrawer = () => {
        this.setState({ drawerVisible: false });
    };

    handleTimeTagChange = (e) => {
        this.setState({ timeTagValue: e.target.value });
        this.refreshMonitorData(
            this.state.instanceId,
            e.target.value,
            this.state.metricTagValue,
        );
    };

    handleMetricTagChange = (e) => {
        this.setState({ metricTagValue: e.target.value });
        switch (e.target.value) {
            case "CPUUtilization":
                this.setState({ chartFormat: "%" });
                break;
            case "memory_usedutilization":
                this.setState({ chartFormat: "%" });
                break;
            case "diskusage_utilization":
                this.setState({ chartFormat: "%" });
                break;
            case "cpu_total":
                this.setState({ chartFormat: "%" });
                break;
            default:
                this.setState({ chartFormat: "" });
                break;
        }
        this.refreshMonitorData(
            this.state.instanceId,
            this.state.timeTagValue,
            e.target.value,
        );
    };

    onExpiredDateChange = (moment) => {
        if (moment == null) {
            this.setState({ queryExpiredTime: null });
        } else {
            this.setState({ queryExpiredTime: moment });
        }
    };

    keywordOnChange = (e) => {
        this.setState({ queryKeyword: e.target.value });
    };

    handleCloudAccountChange = (queryCloudAccount) => {
        this.setState({ queryCloudAccount });
    };

    handleUserDefineGroupChange = (queryDefineGroup) => {
        this.setState({ queryDefineGroup });
    };

    handleManageUserChange = (queryManageUser) => {
        this.setState({ queryManageUser });
    };

    // ???????????????????????????
    handleAdd = () => {
        this.setState({ server_info_modal_visible: true, ecsId: 0 });
    };

    handlePostServerInfoSubmit() {
        this.formRef.current.validateFields().then((values) => {
            postCloudServer({
                ...values,
                createTime: values.createTime.format("YYYY-MM-DD HH:mm:ss"),
                expiredTime:
                    values.expiredTime === undefined
                        ? undefined
                        : values.expiredTime.format("YYYY-MM-DD HH:mm:ss"),
            })
                .then((res) => {
                    if (res.code === 0) {
                        message.success(
                            "?????????????????????????????????????????????????????????",
                        );
                        this.setState({ server_info_modal_visible: false });
                        this.refreshTableData();
                    } else {
                        message.error(res.msg);
                    }
                })
                .catch((err) => {
                    message.error(err.toLocaleString());
                });
        });
    }

    handlePostServerInfoCancel() {
        this.setState({ server_info_modal_visible: false });
    }

    // ?????????????????????
    handleQuery = () => {
        this.setState(
            {
                pagination: {
                    ...this.state.pagination,
                    page: 1,
                    current: 1,
                },
            },
            () => {
                this.refreshTableData();
            },
        );
    };

    onSelectChange = (selectedRowKeys) => {
        this.setState({ selectedRowKeys });
    };

    initTerminal = () => {
        let dom = document.getElementById("server_terminal");
        if (dom) {
            this.rws = new ReconnectingWebSocket(
                WSBase +
                    "ws/cloud/ssh?serverId=" +
                    this.state.currentServerDetail.ID +
                    "&token=" +
                    localStorage.getItem("ops_token"),
            );
            this.terminal = new Terminal({
                rows: 36,
                fontSize: 14,
                cursorBlink: true,
                cursorStyle: "block",
                bellStyle: "sound",
                theme: "Console",
            });
            this.terminal.prompt = () => {
                this.terminal.write("\r\n$ ");
            };
            const attachAddon = new AttachAddon(this.rws);
            this.terminal.loadAddon(attachAddon);
            this.terminal.open(document.getElementById("server_terminal"));
            this.terminal.writeln("Welcome to use Web Terminal.");
            this.terminal.prompt();
            this.initWsConnection();
            this.terminal.focus();
            if (!this.timer) {
                clearTimeout(this.timer);
            }
        } else {
            this.timer = setTimeout(this.initTerminal, 0);
        }
    };

    detailTabChange(key) {
        if (key === "3") {
            this.initTerminal();
        }
    }

    render() {
        let accountOptions;
        accountOptions = this.state.cloudAccountList.map((item) => {
            return (
                <Option key={item.id} value={item.id}>
                    {item.accountName}
                </Option>
            );
        });
        return (
            <Content
                style={{
                    background: "#fff",
                    padding: "5px 20px",
                    margin: 0,
                    height: "100%",
                }}
            >
                <OpsBreadcrumbPath
                    pathData={["?????????", "????????????", "???????????????"]}
                />

                <Row style={{ padding: "0px 0px 10px 0px" }}>
                    <Col span={3} className="col-span">
                        <DatePicker
                            style={{ width: "100%" }}
                            defaultValue={this.state.queryExpiredTime}
                            placeholder="??????????????????"
                            onChange={this.onExpiredDateChange}
                        />
                    </Col>
                    <Col span={5} className="col-span">
                        <Input
                            placeholder="????????????id\ip\??????????????????"
                            value={this.state.queryKeyword}
                            onChange={this.keywordOnChange}
                        />
                    </Col>
                    <Col span={4} className="col-span">
                        <Select
                            defaultValue={this.state.queryCloudAccount}
                            style={{ width: "100%" }}
                            onChange={this.handleCloudAccountChange}
                        >
                            <Option value="0">???????????????</Option>
                            {accountOptions}
                        </Select>
                    </Col>
                    <Col span={2} className="col-span">
                        <Button
                            style={{ width: "100%" }}
                            type="primary"
                            icon={<SearchOutlined />}
                            onClick={this.handleQuery}
                        >
                            ??? ???
                        </Button>
                    </Col>
                    <Col span={2} className="col-span">
                        <Button
                            style={{ width: "100%" }}
                            icon={<PlusCircleOutlined />}
                            onClick={this.handleAdd}
                        >
                            ??? ???
                        </Button>
                    </Col>
                </Row>

                <ServerInfoModal
                    formRef={this.formRef}
                    server_info_modal_visible={
                        this.state.server_info_modal_visible
                    }
                    handlePostServerInfoSubmit={this.handlePostServerInfoSubmit}
                    handlePostServerInfoCancel={this.handlePostServerInfoCancel}
                />

                {/*??????????????????*/}
                <ExtraInfoModal
                    editData={this.state.extraInfoData}
                    resType="ecs"
                    updateMode={this.state.updateMode}
                    resFrom={this.state.resFrom}
                    visible={this.state.extraInfoModalVisible}
                    handleOk={this.handleExtraInfoOk}
                    handleCancel={this.handleExtraInfoCancel}
                />

                {/*??????????????????*/}
                <Drawer
                    title="??????????????????????????????"
                    placement={this.state.drawerPlacement}
                    closable={true}
                    destroyOnClose={true}
                    onClose={this.onCloseDrawer}
                    visible={this.state.drawerVisible}
                    width={950}
                >
                    <Tabs
                        defaultActiveKey="1"
                        tabPosition="left"
                        style={{ marginLeft: -30 }}
                        onChange={this.detailTabChange.bind(this)}
                    >
                        <TabPane tab="????????????" key="1">
                            <Spin
                                tip="???????????????..."
                                spinning={this.state.chartLoading}
                            >
                                <Row style={{ marginBottom: "10px" }}>
                                    <Col
                                        span={3}
                                        style={{ lineHeight: "30px" }}
                                    >
                                        ???????????????
                                    </Col>
                                    <Col span={15}>
                                        <Radio.Group
                                            value={this.state.timeTagValue}
                                            onChange={this.handleTimeTagChange}
                                        >
                                            <Radio.Button value="1h">
                                                1??????
                                            </Radio.Button>
                                            <Radio.Button value="6h">
                                                6??????
                                            </Radio.Button>
                                            <Radio.Button value="12h">
                                                12??????
                                            </Radio.Button>
                                            <Radio.Button value="1d">
                                                1 ???
                                            </Radio.Button>
                                            <Radio.Button value="3d">
                                                3 ???
                                            </Radio.Button>
                                            <Radio.Button value="7d">
                                                7 ???
                                            </Radio.Button>
                                            <Radio.Button value="14d">
                                                14 ???
                                            </Radio.Button>
                                        </Radio.Group>
                                    </Col>
                                </Row>
                                <Row>
                                    <Col
                                        span={3}
                                        style={{ lineHeight: "30px" }}
                                    >
                                        ???????????????
                                    </Col>
                                    <Col span={16}>
                                        <Radio.Group
                                            value={this.state.metricTagValue}
                                            onChange={
                                                this.handleMetricTagChange
                                            }
                                        >
                                            <Radio.Button value="CPUUtilization">
                                                cpu?????????
                                            </Radio.Button>
                                            <Radio.Button value="memory_usedutilization">
                                                ???????????????
                                            </Radio.Button>
                                            <Radio.Button value="diskusage_utilization">
                                                ???????????????
                                            </Radio.Button>
                                            <Radio.Button value="cpu_total">
                                                ????????????
                                            </Radio.Button>
                                        </Radio.Group>
                                    </Col>
                                </Row>
                                <Row style={{ marginTop: 20 }}>
                                    <Col>
                                        <LineChart
                                            width={800}
                                            height={400}
                                            data={this.state.chartData}
                                        />
                                    </Col>
                                </Row>
                            </Spin>
                        </TabPane>
                        <TabPane tab="????????????" key="2">
                            <Spin
                                tip="???????????????..."
                                spinning={this.state.serverDetailLoading}
                            >
                                <Descriptions
                                    title="????????????"
                                    bordered
                                    size="small"
                                    column={2}
                                >
                                    <Descriptions.Item label="?????????">
                                        {
                                            this.state.currentServerDetail
                                                .HostName
                                        }
                                    </Descriptions.Item>
                                    <Descriptions.Item label="????????????">
                                        {
                                            this.state.currentServerDetail
                                                .Description
                                        }
                                    </Descriptions.Item>
                                    <Descriptions.Item label="??????ID">
                                        {
                                            this.state.currentServerDetail
                                                .InstanceId
                                        }
                                    </Descriptions.Item>
                                    <Descriptions.Item label="??????IP">
                                        {
                                            this.state.currentServerDetail
                                                .InnerIpAddress
                                        }
                                    </Descriptions.Item>
                                    <Descriptions.Item label="??????IP">
                                        {
                                            this.state.currentServerDetail
                                                .PublicIpAddress
                                        }
                                    </Descriptions.Item>
                                    <Descriptions.Item label="??????IP">
                                        {
                                            this.state.currentServerDetail
                                                .PrivateIpAddress
                                        }
                                    </Descriptions.Item>
                                    <Descriptions.Item label="Cpu">
                                        {this.state.currentServerDetail.Cpu}???
                                    </Descriptions.Item>
                                    <Descriptions.Item label="??????">
                                        {this.state.currentServerDetail.Memory /
                                            1024}
                                        G
                                    </Descriptions.Item>
                                    <Descriptions.Item label="???????????????">
                                        {
                                            this.state.currentServerDetail
                                                .InternetMaxBandwidthIn
                                        }
                                        Mbps
                                    </Descriptions.Item>
                                    <Descriptions.Item label="???????????????">
                                        {
                                            this.state.currentServerDetail
                                                .InternetMaxBandwidthOut
                                        }
                                        Mbps
                                    </Descriptions.Item>
                                    <Descriptions.Item label="????????????">
                                        {
                                            this.state.currentServerDetail
                                                .InternetChargeType
                                        }
                                    </Descriptions.Item>
                                    <Descriptions.Item label="????????????">
                                        {
                                            this.state.currentServerDetail
                                                .CreationTime
                                        }
                                    </Descriptions.Item>
                                    <Descriptions.Item label="????????????">
                                        {
                                            this.state.currentServerDetail
                                                .ExpiredTime
                                        }
                                    </Descriptions.Item>
                                    <Descriptions.Item label="??????ID">
                                        {this.state.currentServerDetail.ImageId}
                                    </Descriptions.Item>
                                    <Descriptions.Item label="????????????">
                                        {
                                            this.state.currentServerDetail
                                                .InstanceChargeType
                                        }
                                    </Descriptions.Item>
                                    <Descriptions.Item label="????????????">
                                        {
                                            this.state.currentServerDetail
                                                .InstanceNetworkType
                                        }
                                    </Descriptions.Item>
                                    <Descriptions.Item label="????????????">
                                        {
                                            this.state.currentServerDetail
                                                .InstanceType
                                        }
                                    </Descriptions.Item>
                                    <Descriptions.Item label="????????????">
                                        {this.state.currentServerDetail.OSName}
                                    </Descriptions.Item>
                                </Descriptions>
                            </Spin>
                        </TabPane>
                        <TabPane tab="??????" key="3">
                            <div id="server_terminal" />
                        </TabPane>
                    </Tabs>
                </Drawer>
                <Table
                    columns={this.state.columns}
                    dataSource={this.state.tableData}
                    scroll={{ x: "max-content" }}
                    pagination={this.state.pagination}
                    loading={this.state.tableLoading}
                    bordered
                    size="small"
                />
            </Content>
        );
    }
}

export default ServerContent;
