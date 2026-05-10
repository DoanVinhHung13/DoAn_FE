import React from "react";
import { Empty, Button } from "antd";

const EmptyState = ({
  description = "No Data Found",
  buttonText = "Reload",
  onAction = null,
}) => {
  return (
    <div style={{ padding: "40px 0", textAlign: "center" }}>
      <Empty description={description}>
        {onAction && (
          <Button type="primary" onClick={onAction}>
            {buttonText}
          </Button>
        )}
      </Empty>
    </div>
  );
};

export default EmptyState;
