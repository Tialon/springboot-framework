import React from "react";
import {ProForm} from "@ant-design/pro-components";
import {Button, Drawer, Space, Tabs} from "antd";
import NodePanel from "@/components/Flow/panel/NodePanel";
import EdgePanel from "@/components/Flow/panel/EdgePanel";
import {SettingPanelProps} from "@/components/Flow/panel/panel.types";

const CirculateSettingPanel: React.FC<SettingPanelProps> = (props) => {

    const [form] = ProForm.useForm();

    return (
        <Drawer
            title={"节点设置"}
            width={"40%"}
            destroyOnClose={true}
            onClose={() => {
                props.setVisible(false);
            }}
            open={props.visible}
            extra={(
                <Space>
                    <Button
                        type={"primary"}
                        onClick={() => {
                            form.submit();
                            props.setVisible(false);
                        }}
                    >确认</Button>

                    <Button
                        onClick={() => {
                            props.setVisible(false);
                        }}
                    >关闭</Button>
                </Space>
            )}
        >
            <Tabs
                items={[
                    {
                        label: "节点设置",
                        key: "nodes",
                        children: (
                            <NodePanel
                                type={"circulate"}
                                form={form}
                                id={props.properties?.id}
                                data={props.properties}
                                onFinish={props.onSettingChange}
                            />
                        )
                    },
                    {
                        label: "关系设置",
                        key: "edges",
                        children: (
                            <EdgePanel
                                type={"node"}
                                id={props.properties?.id}/>
                        )
                    }
                ]}
            />

        </Drawer>
    )

}

export default CirculateSettingPanel;
