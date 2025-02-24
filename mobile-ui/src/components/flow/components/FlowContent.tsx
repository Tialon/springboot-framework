import React, {useContext, useEffect} from "react";
import {Tabs} from "antd-mobile";
import {FlowFormViewProps} from "@/components/flow/types";
import {FlowViewReactContext} from "@/components/flow/view";
import FlowHistory from "@/components/flow/components/FlowHistory";
import FlowOpinion from "@/components/flow/components/FlowOpinion";
import {useSelector} from "react-redux";
import {FlowReduxState} from "@/components/flow/store/FlowSlice";
import FlowChart from "@/components/flow/components/FlowChart";

interface FlowContentProps {
}

const FlowContent:React.FC<FlowContentProps> = (props) => {
    const flowViewReactContext = useContext(FlowViewReactContext);

    const flowRecordContext = flowViewReactContext?.flowRecordContext;
    const formAction = flowViewReactContext?.formAction;

    const FlowFormView = flowRecordContext?.getFlowFormView() as React.ComponentType<FlowFormViewProps>;

    const formParams = flowRecordContext?.getFlowFormParams();

    const opinionVisible = useSelector((state: FlowReduxState) => state.flow.opinionVisible);
    const contentHiddenVisible = useSelector((state: FlowReduxState) => state.flow.contentHiddenVisible);

    useEffect(() => {
        if(!flowRecordContext?.isEditable()){
            setTimeout(()=>{
                formAction?.current?.disableAll();
            },100);
        }
    }, []);

    const style = contentHiddenVisible ? {"display":"none"} : {};
    return (
        <div className={"flow-view-content"} style={style}>
            <Tabs>
                <Tabs.Tab title='流程详情' key='detail'>
                    {formAction && (
                        <FlowFormView
                            data={formParams}
                            formAction={formAction}
                        />
                    )}

                    {opinionVisible && (
                        <FlowOpinion/>
                    )}
                </Tabs.Tab>
                <Tabs.Tab title='流程记录' key='record'>
                    <FlowHistory/>
                </Tabs.Tab>
                <Tabs.Tab title='流程图' key='chart'>
                    <FlowChart/>
                </Tabs.Tab>
            </Tabs>
        </div>
    )
}

export default FlowContent;
