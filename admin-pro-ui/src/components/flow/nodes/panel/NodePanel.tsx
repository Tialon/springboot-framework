import React from "react";
import {Button, Divider, Space} from "antd";
import {ProForm} from "@ant-design/pro-components";
import {EyeOutlined, SettingOutlined} from "@ant-design/icons";
import GroovyScript from "@/components/flow/utils/script";
import ScriptModal from "@/components/flow/nodes/panel/ScriptModal";
import {getComponent} from "@/framework/ComponentBus";
import {UserSelectProps, UserSelectViewKey} from "@/components/flow/flow/types";
import Form, {FormAction} from "@/components/form";
import FormInput from "@/components/form/input";
import ValidateUtils from "@/components/form/utils";
import FormSelect from "@/components/form/select";
import FormSwitch from "@/components/form/switch";

interface NodePanelProps {
    id?: string,
    data?: any,
    onFinish: (values: any) => void,
    formAction: React.RefObject<FormAction>,
    type: string,
}

const NodePanel: React.FC<NodePanelProps> = (props) => {

    const [form] = ProForm.useForm();

    const [visible, setVisible] = React.useState(false);

    const [userSelectVisible, setUserSelectVisible] = React.useState(false);

    const [operatorMatcherType, setOperatorMatcherType] = React.useState(props.data?.operatorMatcherType);

    // 用户选人视图
    const UserSelectView = getComponent(UserSelectViewKey) as React.ComponentType<UserSelectProps>;


    return (
        <>
            <Form
                initialValues={{
                    ...props.data,
                    operatorMatcherType: GroovyScript.operatorMatcherType(props.data?.operatorMatcher),
                    errTriggerType: GroovyScript.errTriggerType(props.data?.errTrigger),
                    titleGeneratorType: GroovyScript.titleGeneratorType(props.data?.titleGenerator),
                }}
                actionRef={props.formAction}
                layout={"vertical"}
                onFinish={async (values)=>{
                    props.onFinish(values);
                }}
            >
                <Divider>
                    基本信息
                </Divider>
                <FormInput
                    name={"name"}
                    label={"节点名称"}
                    required={true}
                    validateFunction={ValidateUtils.validateNotEmpty}
                />
                <FormInput
                    name={"code"}
                    disabled={props.type === 'start' || props.type === 'over'}
                    label={"节点编码"}
                    required={true}
                    validateFunction={ValidateUtils.validateNotEmpty}
                />
                <FormInput
                    name={"view"}
                    label={"视图名称"}
                    tooltip={"界面渲染视图的名称"}
                    required={true}
                    validateFunction={ValidateUtils.validateNotEmpty}
                />

                <Divider>
                    节点配置
                </Divider>

                <FormSelect
                    name={"approvalType"}
                    label={"节点类型"}
                    hidden={props.type !== 'node'}
                    tooltip={"会签即多人审批以后再处理，非会签则是一个人处理以后即可响应"}
                    required={true}
                    validateFunction={ValidateUtils.validateNotEmpty}
                    options={[
                        {
                            label: "会签",
                            value: "SIGN"
                        },
                        {
                            label: "非会签",
                            value: "UN_SIGN"
                        },
                    ]}
                />

                <FormInput
                    tooltip={"操作人匹配脚本"}
                    name={"operatorMatcher"}
                    label={"操作人"}
                    hidden={true}
                />

                <FormSelect
                    tooltip={"操作人匹配脚本"}
                    name={"operatorMatcherType"}
                    label={"操作人"}
                    options={[
                        {
                            label: "任意人",
                            value: "any"
                        },
                        {
                            label: "发起人",
                            value: "creator"
                        },
                        {
                            label: "自定义",
                            value: "custom"
                        },
                    ]}
                    onChange={(value) => {
                        setOperatorMatcherType(value as string);
                        props.formAction.current?.setFieldsValue({
                            operatorMatcher: GroovyScript.operatorMatcher(value as string)
                        })
                    }}
                    addonAfter={(
                        <Space>
                            {operatorMatcherType==='custom' && (
                                <Button
                                    icon={<SettingOutlined/>}
                                    onClick={() => {
                                        setUserSelectVisible(true);
                                    }}
                                >
                                    选择人员
                                </Button>
                            )}

                            <EyeOutlined
                                onClick={() => {
                                    const value = props.formAction.current?.getFieldValue("operatorMatcher");
                                    form.setFieldValue("type", "operatorMatcher");
                                    form.setFieldValue("script", value);
                                    setVisible(true);
                                }}/>

                        </Space>
                    )}
                />

                <FormInput
                    inputType={"number"}
                    tooltip={"超时提醒时间，单位毫米。为0时则为无超时设置"}
                    name={"timeout"}
                    hidden={props.type === 'circulate'}
                    label={"超时时间"}
                />

                <FormSwitch
                    tooltip={"关闭编辑以后在当前节点下的流程表单无法修改数据"}
                    name={"editable"}
                    label={"是否编辑"}
                />

                <FormInput
                    name={"titleGenerator"}
                    label={"自定义标题"}
                    hidden={true}
                />

                <FormSelect
                    tooltip={"待办记录中的标题生成器脚本"}
                    name={"titleGeneratorType"}
                    label={"自定义标题"}
                    options={[
                        {
                            label: "默认",
                            value: "default"
                        },
                        {
                            label: "自定义",
                            value: "custom"
                        },
                    ]}
                    onChange={(value) => {
                        if (value === "default") {
                            props.formAction.current?.setFieldsValue({
                                titleGenerator: GroovyScript.defaultTitleGenerator
                            })
                        }
                    }}
                    addonAfter={(
                        <EyeOutlined
                            onClick={() => {
                                const value = props.formAction.current?.getFieldValue("titleGenerator");
                                form.setFieldValue("type", "titleGenerator");
                                form.setFieldValue("script", value);
                                setVisible(true);
                            }}/>
                    )}
                />

                <Divider>
                    异常配置
                </Divider>

                <FormInput
                    name={"errTrigger"}
                    label={"异常配置"}
                    hidden={true}
                />

                <FormSelect
                    tooltip={"当节点无人员匹配时的异常补偿脚本，可以指定人员或节点处理"}
                    name={"errTriggerType"}
                    label={"异常配置"}
                    options={[
                        {
                            label: "默认",
                            value: "default"
                        },
                        {
                            label: "自定义",
                            value: "custom"
                        },
                    ]}
                    onChange={(value) => {
                        if (value === "default") {
                            props.formAction.current?.setFieldsValue({
                                errTrigger: GroovyScript.defaultOutTrigger
                            })
                        }
                    }}
                    addonAfter={(
                        <EyeOutlined
                            onClick={() => {
                                const value = props.formAction.current?.getFieldValue("errTrigger");
                                form.setFieldValue("type", "errTrigger");
                                form.setFieldValue("script", value);
                                setVisible(true);
                            }}/>
                    )}
                />

            </Form>

            <ScriptModal
                onFinish={(values) => {
                    const type = values.type;
                    props.formAction.current?.setFieldsValue({
                        [type]: values.script
                    });
                }}
                form={form}
                setVisible={setVisible}
                visible={visible}/>

            {UserSelectView && (
                <UserSelectView
                    visible={userSelectVisible}
                    setVisible={setUserSelectVisible}
                    userSelectType={"users"}
                    specifyUserIds={GroovyScript.getOperatorUsers(props.formAction.current?.getFieldValue("operatorMatcher"))}
                    mode={"multiple"}
                    onFinish={(values) => {
                        setUserSelectVisible(false);
                        const script = GroovyScript.specifyOperatorMatcher.replaceAll("%s", values.map((item: any) => item.id).join(","));
                        props.formAction.current?.setFieldsValue({
                            operatorMatcher: script
                        });
                    }}
                />
            )}

        </>
    )
}

export default NodePanel;


