import React from "react";
import Header from "@/layout/Header";
import {useLocation} from "react-router";
import BasicInfo from "@/components/info/BasicInfo";
import FormInfo from "@/components/info/FormInfo";
import {Button, Toast} from "antd-mobile";
import {loadFields} from "@/pages/person/education/fields";
import Form from "@/components/form";
import {Grid} from "antd-mobile/es/components/grid/grid";

const EducationForm = () => {
    const location = useLocation();
    const item = location.state;
    // console.log('items:', item);

    const formInstance = Form.useForm();

    const [state,setState] = React.useState({
        name:"",
        age:1
    });

    return (
        <>
            <Header>教育信息维护 {state.name} | {state.age}</Header>
            <BasicInfo/>
            <FormInfo
                layout={"vertical"}
                form={formInstance}
                title={"教育信息"}
                loadFields={async ()=>{
                    return loadFields(state,setState);
                }}
                onFinish={async (values) => {
                    const json = JSON.stringify(values);
                    Toast.show(json);
                }}
            />

            <Grid columns={2} gap={[8, 8]}>
                <Button
                    onClick={async () => {
                        await formInstance.submit();
                    }}
                >提交</Button>

                <Button
                    onClick={() => {
                        formInstance.reset();
                    }}
                >重置</Button>

                <Button
                    onClick={() => {
                        const values = formInstance.getFieldsValue();
                        console.log(values);
                    }}
                >获取所有值</Button>

                <Button
                    onClick={() => {
                        formInstance.validate();
                    }}
                >校验字段</Button>

                <Button
                    onClick={() => {
                        formInstance.required("type",true);
                    }}
                >学科类别必填</Button>

                <Button
                    onClick={() => {
                        formInstance.required("type",false);
                    }}
                >学科类别非必填</Button>

                <Button
                    onClick={() => {
                        formInstance.hidden("name");
                    }}
                >隐藏姓名</Button>


                <Button
                    onClick={() => {
                        formInstance.show("name");
                    }}
                >展示姓名</Button>

                <Button
                    onClick={() => {
                        formInstance.disable("name");
                    }}
                >禁用姓名</Button>

                <Button
                    onClick={() => {
                        formInstance.enable("name");
                    }}
                >启用姓名</Button>

                <Button
                    onClick={() => {
                        const name = formInstance.getFieldValue('name');
                        Toast.show(name);
                    }}
                >获取姓名</Button>

                <Button
                    onClick={() => {
                        formInstance.setFieldValue('name', '123123');
                    }}
                >设置姓名</Button>

                <Button
                    onClick={() => {
                        formInstance.remove("name");
                    }}
                >删除姓名</Button>

                <Button
                    onClick={() => {
                        formInstance.create({
                            type: 'input',
                            props: {
                                name: 'name',
                                label: '姓名',
                                placeholder: '请输入姓名',
                                validateFunction: (content) => {
                                    return new Promise<string[]>((resolve) => {
                                        if (content.value) {
                                            resolve([]);
                                        } else {
                                            resolve(["姓名不存在"]);
                                        }
                                    })
                                }
                            },
                        }, 0);
                    }}
                >添加姓名</Button>

                <Button
                    onClick={() => {
                        formInstance.reset({
                            name: '张三',
                            avatar: 'c84fb304c180f61bb7db40efef7f85b7,c84fb304c180f61bb7db40efef7f85b7',
                            type: 'Zhexue',
                            major: 'Unit',
                            date: '2023-12-21',
                            year: '2023',
                            sex: 1,
                            desc: '123123',
                            hobby: "1,0",
                            memory: true,
                            age: 24,
                            slider: 50,
                            movie: 4,
                            selector: 'action,comedy',
                            location: 'Shandong,Jinan'
                        });
                    }}
                >数据回显</Button>

                <Button
                    onClick={() => {
                        formInstance.validate().then(flag => {
                            Toast.show(flag ? "校验成功" : "校验失败");
                        });
                    }}
                >校验表单</Button>
            </Grid>
        </>
    )
}

export default EducationForm;
