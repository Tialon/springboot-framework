import React from "react";
import {FormItemProps} from "@/components/form/types";
import {Form, Slider} from "antd-mobile";
import formFieldInit from "@/components/form/common";
import "./form.scss";

const FormSlider: React.FC<FormItemProps> = (props) => {

    const {formContext, rules} = formFieldInit(props);

    return (
        <Form.Item
            name={props.name}
            label={props.label}
            rules={rules}
            hidden={props.hidden}
            help={props.help}
            disabled={props.disabled}
        >
            <Slider
                value={props.value}
                max={props.sliderMaxNumber}
                min={props.sliderMinNumber}
                step={props.sliderStep}
                range={props.sliderRange}
                ticks={props.sliderTicks}
                popover={props.sliderPopover}
                marks={props.sliderMarks}
                onChange={(value) => {
                    formContext?.setFieldValue(props.name, value);
                    props.onChange && props.onChange(value, formContext);
                }}
            />
        </Form.Item>
    )
}

export default FormSlider;
