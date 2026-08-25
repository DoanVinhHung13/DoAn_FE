import React from "react"
import { Card, Empty, Input, Tree } from "antd"
import { SearchOutlined } from "@ant-design/icons"

const LogbookTreePanel = ({
  treeSearch,
  setTreeSearch,
  treeData,
  selectedLogbookId,
  onSelect,
}) => {
  return (
    <Card
      bordered={false}
      className="leader-plan-tree sticky border shadow-xs rounded-2xl border-slate-200/80 top-4"
      styles={{ body: { padding: "16px" } }}
    >
      <div className="space-y-3.5">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <h2 className="text-sm font-bold text-slate-800">
              Kế hoạch đang làm
            </h2>
          </div>
          <span className="text-xs text-slate-400 font-semibold bg-slate-100 px-2 py-0.5 rounded-full">
            {treeData.length}
          </span>
        </div>

        <Input
          prefix={<SearchOutlined className="text-slate-400" />}
          placeholder="Tìm kế hoạch..."
          allowClear
          value={treeSearch}
          onChange={e => setTreeSearch(e.target.value)}
          className="h-9 text-xs rounded-xl bg-slate-50 border-slate-200/80 focus:bg-white transition-colors"
        />

        <div className="max-h-[calc(100vh-280px)] overflow-y-auto pr-1 custom-scrollbar">
          {treeData.length === 0 ? (
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description={
                <span className="text-xs text-slate-400">
                  Không tìm thấy kế hoạch
                </span>
              }
              className="py-6"
            />
          ) : (
            <Tree
              treeData={treeData}
              selectedKeys={selectedLogbookId ? [selectedLogbookId] : []}
              onSelect={onSelect}
              showIcon
              blockNode
              className="bg-transparent custom-tree"
            />
          )}
        </div>
      </div>
    </Card>
  )
}

export default LogbookTreePanel
