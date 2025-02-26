import React from "react";
import Flow, {FlowActionType} from "@/components/Flow";
import {
    ActionType,
    ModalForm,
    PageContainer,
    ProForm,
    ProFormDigit, ProFormSwitch,
    ProFormText, ProFormTextArea,
    ProTable
} from "@ant-design/pro-components";
import {changeState, copy, list, remove, save, schema} from "@/api/flow";
import {Button, Drawer, message, Popconfirm, Space} from "antd";

const FlowPage = () => {

    const [visible, setVisible] = React.useState(false);
    const [editorVisible, setEditorVisible] = React.useState(false);
    const flowActionType = React.useRef<FlowActionType>(null);
    const [form] = ProForm.useForm();
    const actionRef = React.useRef<ActionType>();

    const [current, setCurrent] = React.useState<any>(null);

    const handlerDelete = async (id: any) => {
        const res = await remove(id);
        if (res.success) {
            message.success("保存成功");
        }
        actionRef.current?.reload();
    }

    const handlerCopy = async (id: any) => {
        const res = await copy(id);
        if (res.success) {
            message.success("复制成功");
        }
        actionRef.current?.reload();
    }


    const handlerChangeState = async (id: any) => {
        const res = await changeState(id);
        if (res.success) {
            message.success("修改成功");
        }
        actionRef.current?.reload();
    }


    const handlerSave = async (values: any) => {
        const res = await save(values);
        setEditorVisible(false);
        if (res.success) {
            message.success("保存成功");
        }
        actionRef.current?.reload();
    }

    const handlerSchema = async (json: any) => {
        const res = await schema({
            id: current.id,
            schema: json
        });
        if (res.success) {
            message.success("保存成功");
            setVisible(false);
        }
        actionRef.current?.reload();
    }

    const columns = [
        {
            title: '编号',
            dataIndex: 'id',
            search: false,
        },
        {
            title: '编码',
            dataIndex: 'code',
        },
        {
            title: '标题',
            dataIndex: 'title',
        },
        {
            title: '说明',
            dataIndex: 'description',
            valueType: 'text',
            search: false,
        },
        {
            title: '创建时间',
            dataIndex: 'createTime',
            valueType: 'dateTime',
            search: false,
        },
        {
            title: '修改时间',
            dataIndex: 'updateTime',
            valueType: 'dateTime',
            search: false,
        },
        {
            title: '状态',
            dataIndex: 'enable',
            search: false,
            render: (text: any, record: any) => {
                return (
                    <Popconfirm
                        title={`确认要${record.enable ? '禁用' : '启用'}吗？`}
                        onConfirm={async () => {
                            await handlerChangeState(record.id);
                        }}
                    >
                        <a>{record.enable ? '启用' : '禁用'}</a>
                    </Popconfirm>
                )
            }
        },
        {
            title: '操作',
            valueType: 'option',
            render: (_: any, record: any) => [
                <a
                    key="design"
                    onClick={() => {
                        setCurrent(record);
                        setVisible(true);
                    }}
                >
                    设计
                </a>,

                <a
                    key="editable"
                    onClick={() => {
                        form.setFieldsValue(record);
                        setEditorVisible(true);
                    }}
                >
                    编辑
                </a>,

                <a
                    key="copy"
                    onClick={async () => {
                        await handlerCopy(record.id);
                    }}
                >
                    复制
                </a>,

                <Popconfirm
                    key="delete"
                    title={"确认删除?"}
                    onConfirm={async () => {
                        await handlerDelete(record.id);
                    }}
                >
                    <a
                        key="delete"
                    >
                        删除
                    </a>
                </Popconfirm>
            ]
        }

    ] as any[];
    return (
        <PageContainer>
            <ProTable
                data-testid={"flow-table"}
                actionRef={actionRef}
                rowKey={"id"}
                columns={columns}
                toolBarRender={() => {
                    return [
                        <Button
                            data-testid={"flow-add-btn"}
                            type={"primary"}
                            onClick={() => {
                                form.resetFields();
                                setEditorVisible(true);
                            }}
                        >新增</Button>
                    ]
                }}
                request={async (params, sort, filter) => {
                    return list(params, sort, filter, [
                        {
                            key: "title",
                            type: "LIKE"
                        }
                    ]);
                }}
            />

            <ModalForm
                data-testid={"flow-editor"}
                title="编辑流程"
                form={form}
                open={editorVisible}
                modalProps={{
                    destroyOnClose: true,
                    onClose: () => setEditorVisible(false),
                    onCancel: () => setEditorVisible(false),
                }}
                submitter={{
                    submitButtonProps:{
                        "data-testid":"flow-editor-submit",
                    },
                }}
                onFinish={handlerSave}
            >
                <ProFormText
                    name={"id"}
                    hidden={true}
                />

                <ProFormText
                    name={"title"}
                    label={"标题"}
                    rules={[
                        {
                            required: true,
                            message: "请输入标题"
                        }
                    ]}
                />

                <ProFormText
                    name={"code"}
                    label={"编码"}
                    rules={[
                        {
                            required: true,
                            message: "请输入编码"
                        }
                    ]}
                />

                <ProFormTextArea
                    name={"description"}
                    label={"描述"}
                />

                <ProFormDigit
                    name={"postponedMax"}
                    tooltip={"允许流程最大的延期次数"}
                    label={"最大延期次数"}
                    fieldProps={{
                        step:1
                    }}
                    rules={[
                        {
                            required:true,
                            message:'最大延期次数不能为空'
                        }
                    ]}
                />

                <ProFormSwitch
                    name={"skipIfSameApprover"}
                    tooltip={"是否跳过相同审批人，默认为否"}
                    label={"是否跳过相同审批人"}
                />

            </ModalForm>


            <Drawer
                title="流程设计"
                width={"100%"}
                open={visible}
                onClose={() => {
                    setVisible(false);
                }}
                destroyOnClose={true}
                style={{
                    padding: 0,
                    margin: 0
                }}
                extra={
                    <Space>

                        <Button
                            type={"primary"}
                            onClick={async () => {
                                const data = flowActionType.current?.getData();
                                const json = JSON.stringify(data);
                                await handlerSchema(json);
                            }}
                        >
                            保存
                        </Button>

                        <Button
                            onClick={() => {
                                setVisible(false);
                            }}
                        >
                            取消
                        </Button>
                    </Space>
                }
            >
                <Flow
                    data={current?.schema ? JSON.parse(current?.schema) : null}
                    actionRef={flowActionType}
                />
            </Drawer>

        </PageContainer>
    )
};

export default FlowPage;
