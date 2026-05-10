import React, { useState } from "react";
import { Form, Button } from "antd";

const FormWrapper = ({
  children,
  onFinish,
  initialValues = {},
  submitText = "Submit",
  loading = false,
  formProps = {},
  layout = "vertical",
}) => {
  const [form] = Form.useForm();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleFinish = async (values) => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      await onFinish(values, form);
    } catch (error) {
      console.error("Form submission error", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form
      form={form}
      layout={layout}
      initialValues={initialValues}
      onFinish={handleFinish}
      {...formProps}
    >
      {typeof children === "function" ? children(form) : children}
      <Form.Item>
        <Button
          type="primary"
          htmlType="submit"
          loading={loading || isSubmitting}
        >
          {submitText}
        </Button>
      </Form.Item>
    </Form>
  );
};

export default FormWrapper;
