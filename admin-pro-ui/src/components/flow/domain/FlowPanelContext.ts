import React from "react";
import {LogicFlow} from "@logicflow/core";
import {NodeProperties, NodeType} from "@/components/flow/types";
import {message} from "antd";
import {isEmpty} from "lodash-es";
import NodeData = LogicFlow.NodeData;


const TRANSLATION_DISTANCE = 40

class FlowPanelContext {

    private readonly lfRef: React.RefObject<LogicFlow>;

    constructor(lfRef: React.RefObject<LogicFlow>) {
        this.lfRef = lfRef;
    }

    private generateUUID() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
            const r = (Math.random() * 16) | 0;
            const v = c === 'x' ? r : (r & 0x3) | 0x8;
            return v.toString(16);
        });
    }

    /**
     * 添加节点
     * @param type 节点类型
     * @param properties 节点属性
     */
    addNode(type: NodeType, properties: NodeProperties) {
        if (this.nodeVerify(type)) {
            const uid = this.generateUUID();
            this.lfRef.current?.dnd.startDrag({
                id: uid,
                type: type,
                properties: {
                    ...properties,
                    id: uid
                }
            })
        }
    }


    /**
     * 复制节点 控制位置的偏移
     * @param nodeData
     * @param distance
     * @private
     */
    private translateNodeData(nodeData: NodeData, distance: number) {
        nodeData.x += distance
        nodeData.y += distance

        if (!isEmpty(nodeData.text)) {
            nodeData.text.x += distance
            nodeData.text.y += distance
        }

        return nodeData
    }


    /**
     * 从粘贴板中复制节点
     */
    copyNode = () => {
        const flow = this.lfRef.current;
        if (!flow) {
            return;
        }
        const selected = flow.getSelectElements(true);
        if (selected && (selected.nodes || selected.edges)) {
            flow.clearSelectElements();
            if (selected.nodes) {
                const nodes = selected.nodes;
                for (const node of nodes) {
                    if (node.type === 'start-node') {
                        message.error('开始节点只能有一个').then();
                        return false;
                    }
                    if (node.type === 'over-node') {
                        message.error('结束节点只能有一个').then();
                        return false;
                    }
                }
                const addElements = flow.addElements(
                    selected,
                    TRANSLATION_DISTANCE
                );
                if (!addElements) return true;
                addElements.nodes.forEach((node) => flow.selectElementById(node.id, true));
                addElements.nodes.forEach((node) => {
                    this.translateNodeData(node, TRANSLATION_DISTANCE);
                });
            }
        }
        return false;
    }


    /**
     * 节点校验
     * @param type
     */
    private nodeVerify = (type: NodeType) => {
        // @ts-ignore
        const nodes = this.lfRef.current?.getGraphData().nodes;
        if (type === 'start-node') {
            for (let i = 0; i < nodes.length; i++) {
                if (nodes[i].type === type) {
                    message.error('开始节点只能有一个').then();
                    return false;
                }
            }
        }
        if (type === 'over-node') {
            for (let i = 0; i < nodes.length; i++) {
                if (nodes[i].type === type) {
                    message.error('结束节点只能有一个').then();
                    return false;
                }
            }
        }
        return true;
    }


    /**
     * 缩放
     * @param flag true为放大 false为缩小
     */
    zoom = (flag:boolean) => {
        this.lfRef.current?.zoom(flag);
    }

    /**
     * 重置缩放
     */
    resetZoom = ()=>{
        this.lfRef.current?.resetZoom();
        this.lfRef.current?.resetTranslate();
    }

    /**
     * 恢复 下一步
     */
    redo = ()=>{
        this.lfRef.current?.redo();
    }

    /**
     * 撤销 上一步
     */
    undo = ()=> {
        this.lfRef.current?.undo();
    }

    /**
     * 隐藏地图
     */
    hiddenMap = ()=>{
        // @ts-ignore
        this.lfRef.current?.extension.miniMap.hide();
    }

    /**
     * 显示地图
     */
    showMap = ()=>{
        const modelWidth = this.lfRef.current?.graphModel.width;
        // @ts-ignore
        this.lfRef.current?.extension.miniMap.show(modelWidth - 300, 200);
    }

    /**
     * 下载图片
     */
    download = ()=>{
        this.lfRef.current?.getSnapshot();
    }

}

export default FlowPanelContext;
