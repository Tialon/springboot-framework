import React from "react";
import {FlowFormParams, FlowFormView, FlowFormViewProps, FlowResultMessage} from "@/components/flow/types";


export class FlowWorkData {

    protected readonly data: any;

    constructor(data: any) {
        this.data = data;
    }

    getNode = (code: string) => {
        if (this.data) {
            const nodes = this.data.flowWork.nodes;
            for (const node of nodes) {
                if (node.code === code) {
                    return node;
                }
            }
        }
        return null;
    }

    getWorkCode() {
        return this.data.flowWork.code;
    }
}


export class FlowSubmitResultBuilder extends FlowWorkData {

    constructor(data: any) {
        super(data);
    }

    builder() {
        const records = this.data.records;
        const resultItems = [];
        for (const record of records) {
            const node = this.getNode(record.nodeCode);
            resultItems.push({
                label: '下级审批节点',
                value: node.name
            });

            resultItems.push({
                label: '下级审批人',
                value: record.currentOperator.name
            });
        }
        return {
            title: '流程审批完成',
            items: resultItems
        } as FlowResultMessage;
    }
}


export class FlowTrySubmitResultBuilder {

    private readonly data: any;

    constructor(data: any) {
        this.data = data;
    }

    builder() {
        const operators = this.data.operators;
        const usernames = operators.map((item: any) => {
            return item.name;
        });
        const flowResult = {
            title: '下级节点提示',
            items: [
                {
                    label: '下级审批节点',
                    value: this.data.flowNode.name
                },
                {
                    label: '下级审批人',
                    value: usernames.join(',')
                }
            ]
        }

        return flowResult as FlowResultMessage;
    }

}

export class FlowData extends FlowWorkData {
    private readonly formParams?: FlowFormParams;
    private recordId:string;

    constructor(recordId:string,data: any, formParams?: FlowFormParams) {
        super(data);
        this.recordId = recordId;
        this.formParams = formParams;
    }

    setRecordId = (recordId:string)=>{
        this.recordId = recordId;
    }

    getRecordId = ()=>{
        return this.recordId;
    }

    // 是否可以审批
    canHandle = () => {
        return this.data.canHandle;
    }

    // 是否是开始节点
    isStartFlow = () => {
        if (this.data) {
            return this.data.flowNode.startNode;
        }
        return false;
    }

    // 获取当前节点的code
    getNodeCode = () => {
        if (this.data) {
            return this.data.flowNode.code;
        }
        return null;
    }

    // 获取当前节点的按钮
    getNodeButtons = () => {
        if (this.data) {
            const buttons = this.data.flowNode.buttons;
            if(buttons){
                return buttons.sort((item1:any, item2:any) => {
                    return item1.order - item2.order;
                })
            }
            return [];
        }
        return null;
    }

    // 获取当前节点的按钮
    getNodeButton = (buttonId: string) => {
        if (this.data) {
            const buttons = this.data.flowNode.buttons;
            if(buttons){
                return buttons.find((item:any) => item.id === buttonId);
            }
        }
        return null;
    }

    // 获取当前节点的标题
    getCurrentNodeTitle = () => {
        if (this.data) {
            const node = this.data.flowNode;
            if (node) {
                return node.name;
            }
        }
        return null;
    }

    // 获取当前节点的视图 （内部使用）
    getFlowFormView(view: React.ComponentType<FlowFormViewProps> | FlowFormView) {
        if (typeof view === 'object') {
            const nodeView = this.data.flowNode.view;
            return (view as FlowFormView)[nodeView];
        }
        return view;
    }

    // 获取当前节点是否可编辑
    getFlowNodeEditable = () => {
        if (this.data) {
            const node = this.data.flowNode;
            if (node) {
                return node.editable;
            }
        }
        return false
    }

    // 获取当前节点的表单数据
    getFlowData = () => {
        return {
            ...this.data.bindData,
            ...this.formParams
        }
    }

    // 获取当前节点的表单数据 （内部使用）
    getNodeState = (code: string) => {
        const historyRecords = this.data.historyRecords || [];

        if (code==='over' && this.isFinished()) {
            return "done";
        }

        for (const record of historyRecords) {
            if (record.nodeCode === code) {
                if (record.flowType === 'TODO') {
                    return "current";
                }
                return "done";
            }
        }

        if(this.isFinished()){
            return "undone";
        }

        return "wait";
    }

    // 获取当前节点的流程图
    getFlowSchema = () => {

        if (this.data.flowWork.schema) {
            const schema = JSON.parse(this.data.flowWork.schema);

            for (const node of schema.nodes) {
                node.properties.settingVisible = false;
                node.properties.state = this.getNodeState(node.properties.code);
            }
            return schema;
        }
        return null;
    }

    // 是否存在数据
    hasData() {
        return !!this.data;
    }

    // 获取当前的详情的记录数据
    getCurrentFlowRecord = () => {
        return this.data.flowRecord;
    }

    // 获取审批意见
    getOpinionAdvice = () => {
        if(this.data.flowRecord){
            if(this.data.flowRecord.opinion){
                return this.data.flowRecord.opinion.advice;
            }
        }
        return null;
    }


    // 获取历史审批意见
    getOpinions() {
        if(this.data.opinions){
            return this.data.opinions.filter((item:any)=>{
                if(!item.opinion){
                    return false;
                }
                return item.opinion.result!==0;
            });
        }
        return [];
    }

    // 获取历史记录
    getHistoryRecords = () => {
        return this.data.historyRecords;
    }

    // 是否是审批完成
    isDone() {
        if (this.data.flowRecord) {
            return this.data.flowRecord.flowStatus === 'FINISH' || this.data.flowRecord.flowType === 'DONE';
        }
        return false;
    }

    // 是否是退回状态
    isReject(){
        const historyRecords = this.data.historyRecords || [];
        const currentRecord = this.data.flowRecord;
        if(currentRecord && historyRecords.length>0){
            const preId = currentRecord.preId;
            const preRecord = historyRecords.find((item:any)=>item.id===preId);
            if(preRecord){
                return preRecord.flowSourceDirection === 'REJECT';
            }
        }
        return false;
    }

    // 是否是结束节点
    private isFinished() {
        if (this.data.flowRecord) {
            return this.data.flowRecord.flowStatus === 'FINISH';
        }
        return false;
    }

    // 是否需要展示流转记录 （内部使用）
    showHistory() {
        if (this.isDone()) {
            return true;
        }
        return !this.isStartFlow();
    }

    // 是否展示审批意见 （内部使用）
    showOpinion() {
        return this.canHandle() && !this.isStartFlow();
    }

}

