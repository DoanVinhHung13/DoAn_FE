import React from "react";
import { Result, Button } from "antd";

const ErrorState = ({
  title = "Oops! Something went wrong",
  subTitle = "We're sorry, but an unexpected error occurred.",
  onRetry = null,
}) => {
  return (
    <div style={{ padding: "40px 0" }}>
      <Result
        status="500"
        title={title}
        subTitle={subTitle}
        extra={
          onRetry && (
            <Button type="primary" onClick={onRetry}>
              Try Again
            </Button>
          )
        }
      />
    </div>
  );
};

export default ErrorState;
