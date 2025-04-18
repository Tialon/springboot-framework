import React, {useEffect, useState} from "react";
import {FormItemProps} from "@/components/form/types";
import {Form, Input} from "antd";
import formFieldInit from "@/components/form/common";
import "./form.scss";


const Captcha:React.FC<FormItemProps> = (props)=>{

    const [captchaImg, setCaptchaImg] = useState<string>('');
    const {formContext} = formFieldInit(props);

    const reloadCaptcha = () => {
        props.onCaptchaRefresh && props.onCaptchaRefresh().then((res) => {
            if(res) {
                setCaptchaImg(res.url);
                props.onCaptchaChange && props.onCaptchaChange(res.code);
            }
        });
    }

    useEffect(() => {
        reloadCaptcha();
    }, [])

    return (
        <div className={"form-captcha"}>
            <Input
                className={"form-captcha-input"}
                disabled={props.disabled}
                value={props.value}
                addonAfter={props.addonAfter}
                addonBefore={props.addonBefore}
                prefix={props.prefix}
                suffix={props.suffix}
                placeholder={props.placeholder}
                onChange={(value) => {
                    const currentValue = value.target.value;
                    formContext?.setFieldValue(props.name, currentValue);
                    props.onChange && props.onChange(currentValue,formContext);
                }}
            />

            <img
                className={"form-captcha-img"}
                onClick={() => {
                    reloadCaptcha();
                }}
                src={captchaImg}
                alt="点击重置"
            />
        </div>
    )
}


const FormCaptcha: React.FC<FormItemProps> = (props) => {

    return (
        <Form.Item
            name={props.name}
            label={props.label}
            required={props.required}
            hidden={props.hidden}
            help={props.help}
            tooltip={props.tooltip}
        >
            <Captcha
                {...props}
            />
        </Form.Item>
    )
}

export default FormCaptcha;
