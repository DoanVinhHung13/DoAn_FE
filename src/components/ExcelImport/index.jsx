import React, { useState } from 'react';
import { Upload, Button, message, Modal, Table, Space, Tag } from 'antd';
import { FileExcelOutlined, UploadOutlined, CheckCircleOutlined, InfoCircleOutlined } from '@ant-design/icons';
import * as XLSX from 'xlsx';

const { Dragger } = Upload;

const ExcelImport = ({ onImport, columns, title, templateData }) => {
  const [data, setData] = useState([]);
  const [isVisible, setIsVisible] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleFileUpload = (file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const workbook = XLSX.read(e.target.result, { type: 'binary' });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const parsedData = XLSX.utils.sheet_to_json(sheet);
        
        if (parsedData.length === 0) {
          message.warning('Tệp Excel trống hoặc không đúng định dạng.');
          return;
        }

        // Map Vietnamese headers back to keys
        const mappedData = parsedData.map(row => {
          const newRow = {};
          columns.forEach(col => {
            // Find value in row that matches either the title or the key
            const value = row[col.title] !== undefined ? row[col.title] : row[col.key];
            if (value !== undefined) {
                newRow[col.key] = value;
            }
          });
          return newRow;
        });

        setData(mappedData);
        setIsVisible(true);
      } catch (error) {
        message.error('Lỗi khi đọc tệp Excel: ' + error.message);
      }
    };
    reader.readAsBinaryString(file);
    return false; // Prevent auto upload
  };

  const confirmImport = async () => {
    setLoading(true);
    try {
      await onImport(data);
      setIsVisible(false);
      setData([]);
    } catch (error) {
      // Error is handled by api interceptor, but we can log it
      console.error('Import error:', error);
    } finally {
      setLoading(false);
    }
  };

  const downloadTemplate = () => {
    // Create data with localized headers
    const templateWithHeaders = (templateData || [{}]).map(item => {
        const newItem = {};
        columns.forEach(col => {
            newItem[col.title] = item[col.key] || '';
        });
        return newItem;
    });

    const ws = XLSX.utils.json_to_sheet(templateWithHeaders);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Danh sach mau");
    XLSX.writeFile(wb, `EBookFarm_${title}_Mau.xlsx`);
  };

  return (
    <>
      <Space>
        <Upload 
          accept=".xlsx, .xls" 
          showUploadList={false} 
          beforeUpload={handleFileUpload}
        >
          <Button icon={<FileExcelOutlined />} className="rounded-xl border-green-200 text-green-600 hover:bg-green-50">
            Nhập từ Excel
          </Button>
        </Upload>
        <Button size="small" type="link" onClick={downloadTemplate} className="text-[10px] text-gray-400">
          Tải file mẫu
        </Button>
      </Space>

      <Modal
        title={
          <Space>
            <FileExcelOutlined className="text-green-500" />
            <span>Xem trước dữ liệu nhập: {title}</span>
          </Space>
        }
        open={isVisible}
        onOk={confirmImport}
        onCancel={() => setIsVisible(false)}
        width={1000}
        confirmLoading={loading}
        okText="Xác nhận nhập"
        cancelText="Hủy bỏ"
        className="premium-modal"
      >
        <div className="mb-4">
           <Tag color="blue" icon={<InfoCircleOutlined />}>Phát hiện {data.length} hàng dữ liệu</Tag>
        </div>
        <Table 
          dataSource={data} 
          columns={columns.map(col => ({ ...col, dataIndex: col.key }))} 
          size="small" 
          pagination={{ pageSize: 5 }}
          scroll={{ x: true }}
          className="rounded-xl overflow-hidden border border-gray-100"
        />
      </Modal>
    </>
  );
};

export default ExcelImport;
