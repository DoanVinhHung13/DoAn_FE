import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Card, Form, Input, InputNumber, Button, DatePicker, Select, Typography, message, Skeleton, Space, Tabs, Upload, Tag, Modal, Image } from 'antd';
import dayjs from 'dayjs';
import { InboxOutlined } from '@ant-design/icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from 'src/services/01_axios';
import VoiceInput from 'src/components/VoiceInput';
import { useSelector } from 'react-redux';
import JournalService from 'src/services/JournalService'
import InventoryService from 'src/services/InventoryService'

const { Title } = Typography;
const { Option } = Select;

const JournalEntry = ({ schemaId: propsSchemaId, id: propsId }) => {
  const user = useSelector((state) => state.appGlobal);
  const { schemaId: paramSchemaId, id: paramId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();
  const [form] = Form.useForm();
  const [fileList, setFileList] = useState([]);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState('');
  const [previewTitle, setPreviewTitle] = useState('');

  const id = propsId || paramId;
  const schemaId = propsSchemaId || paramSchemaId;

  // Decide if we are creating or editing based on route params
  const isEditing = !!id;

  // Fetch Journal if editing
  const { data: journalData, isLoading: journalLoading } = useQuery({
    queryKey: ['journal', id],
    queryFn: () => api.get(`/journals/${id}`).then(res => res.data.data),
    enabled: isEditing
  });

  const isReadOnly = isEditing && journalData && (
    journalData.status === 'Verified' ||
    user?.role?.toUpperCase() !== 'FARMER' ||
    (journalData.status === 'Submitted' && user?.role?.toUpperCase() === 'FARMER')
  );

  const activeSchemaId = isEditing && journalData ? journalData.schemaId._id : schemaId;

  // Fetch schema structure
  const { data: schema, isLoading: schemaLoading } = useQuery({
    queryKey: ['schema', activeSchemaId],
    queryFn: () => api.get(`/schemas/${activeSchemaId}`).then(res => res.data.data),
    enabled: !!activeSchemaId
  });

  useEffect(() => {
    if (isEditing && journalData && schema) {
      const rawEntries = journalData.entries || {};
      const convertedEntries = {};

      // Convert nested table date fields
      schema.tables.forEach(table => {
        const tableName = table.tableName;
        convertedEntries[tableName] = {};
        table.fields.forEach(field => {
          const val = rawEntries[tableName]?.[field.name];
          if (field.type === 'date' && val) {
            convertedEntries[tableName][field.name] = dayjs(val);
          } else {
            convertedEntries[tableName][field.name] = val;
          }
        });
      });

      // Load basic flat fields (Địa chỉ, Diện tích, Lô sản xuất...)
      const basicFields = ['Mã nông hộ', 'Họ và tên', 'Địa chỉ', 'Diện tích', 'Lô sản xuất', 'Tên cơ sở', 'Địa chỉ sản xuất', 'Mã số thửa'];
      basicFields.forEach(key => {
        if (rawEntries[key] !== undefined) {
          convertedEntries[key] = rawEntries[key];
        }
      });
      // Convert Ngày bắt đầu
      if (rawEntries['Ngày bắt đầu']) {
        convertedEntries['Ngày bắt đầu'] = dayjs(rawEntries['Ngày bắt đầu']);
      }


      form.setFieldsValue({ ...convertedEntries, status: journalData.status });

      // Load existing images/attachments
      if (journalData.images && journalData.images.length > 0) {
        const fileBaseURL = api.defaults.baseURL.replace('/api', '');
        const existingFiles = journalData.images.map((img, index) => ({
          uid: img._id || `existing-${index}`,
          name: img.caption || img.url.split('/').pop(),
          status: 'done',
          url: img.url.startsWith('http') ? img.url : `${fileBaseURL}${img.url}`,
          thumbUrl: img.url.startsWith('http') ? img.url : `${fileBaseURL}${img.url}`,
        }));
        setFileList(existingFiles);
      }
    }
  }, [isEditing, journalData, schema, form]);

  const handleVoiceInput = (tableName, fieldName, text) => {
    const currentValues = form.getFieldsValue();
    const tableValues = currentValues[tableName] || {};
    const currentValue = tableValues[fieldName] || '';

    form.setFieldValue(
      [tableName, fieldName],
      currentValue ? `${currentValue} ${text}` : text
    );
    message.success(`Đã thêm: "${text}"`);
  };

  const uploadProps = {
    name: 'file',
    multiple: true,
    fileList: fileList,
    showUploadList: {
      showPreviewIcon: true,
      showRemoveIcon: !isReadOnly,
      showDownloadIcon: true
    },
    customRequest: async ({ file, onSuccess, onError, onProgress }) => {
      const formData = new FormData();
      formData.append('file', file);

      try {
        const res = await api.post('/upload/document', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
          onUploadProgress: (event) => {
            const percent = Math.floor((event.loaded / event.total) * 100);
            onProgress({ percent });
          }
        });

        if (res.data.success) {
          const fileBaseURL = api.defaults.baseURL.replace('/api', '');
          const newFile = {
            uid: file.uid,
            name: file.name,
            status: 'done',
            url: res.data.data.url.startsWith('http') ? res.data.data.url : `${fileBaseURL}${res.data.data.url}`,
            thumbUrl: file.type.startsWith('image/') ? (res.data.data.url.startsWith('http') ? res.data.data.url : `${fileBaseURL}${res.data.data.url}`) : null,
          };

          setFileList(prev => {
            const filtered = prev.filter(f => f.uid !== file.uid);
            return [...filtered, newFile];
          });
          onSuccess(res.data.data);
        }
      } catch (err) {
        message.error(`Lỗi khi tải lên ${file.name}`);
        onError(err);
      }
    },
    onRemove: (file) => {
      if (isReadOnly) return false;
      setFileList(prev => prev.filter(item => item.uid !== file.uid));
    },
    onPreview: async (file) => {
      const url = file.url || file.thumbUrl;
      if (!url) return;

      // Nếu là ảnh thì hiện Modal Preview của Ant Design
      const isImage = /\.(jpg|jpeg|png|webp|gif|svg)$/i.test(url) || file.type?.startsWith('image/');

      if (isImage) {
        setPreviewImage(url);
        setPreviewOpen(true);
        setPreviewTitle(file.name || url.substring(url.lastIndexOf('/') + 1));
      } else {
        // Nếu là file khác (PDF, Word) thì mở tab mới
        window.open(url, '_blank');
      }
    }
  };

  const saveMutation = useMutation({
    mutationFn: async (values) => {
      console.log('🔍 Form values received:', values);

      // Validation bổ sung trước khi gửi - Tăng cường cho chăn nuôi VietGAHP
      const errors = [];

      // Kiểm tra ít nhất một tab phải có dữ liệu
      const hasData = schema.tables.some(table => {
        const tableData = values[table.tableName];
        return tableData && Object.values(tableData).some(value => value !== undefined && value !== null && value !== '');
      });

      if (!hasData) {
        errors.push('Vui lòng nhập ít nhất một thông tin trong các tab!');
      }

      // === VALIDATION LOGIC NGHIỆP VỤ CHĂN NUÔI & THỦY SẢN ===

      // 1. Kiểm tra thông tin chung
      const thongTinChung = values['Thông tin chung'];
      if (thongTinChung) {
        // === VALIDATION ĐẶC BIỆT CHO GIA CẦM ===

        // Kiểm tra mật độ nuôi gà hợp lý
        if (thongTinChung.matDoNuoi) {
          if (thongTinChung.matDoNuoi > 15) {
            errors.push('Mật độ nuôi gà quá cao (>15 con/m²), có thể gây stress và bệnh tật!');
          }
          if (thongTinChung.matDoNuoi < 5) {
            errors.push('Mật độ nuôi gà quá thấp (<5 con/m²), không hiệu quả kinh tế!');
          }
        }

        // Kiểm tra trọng lượng gà theo tuổi (gà thịt)
        if (thongTinChung.trongLuongTrungBinh && thongTinChung.ngayTuoi) {
          const tuoi = thongTinChung.ngayTuoi;
          const trongLuong = thongTinChung.trongLuongTrungBinh;

          // Chuẩn tăng trưởng gà thịt (kg)
          let expectedMinWeight = 0;
          let expectedMaxWeight = 0;

          if (tuoi <= 7) {
            expectedMinWeight = 0.05; expectedMaxWeight = 0.15;
          } else if (tuoi <= 14) {
            expectedMinWeight = 0.15; expectedMaxWeight = 0.35;
          } else if (tuoi <= 21) {
            expectedMinWeight = 0.35; expectedMaxWeight = 0.65;
          } else if (tuoi <= 28) {
            expectedMinWeight = 0.65; expectedMaxWeight = 1.0;
          } else if (tuoi <= 35) {
            expectedMinWeight = 1.0; expectedMaxWeight = 1.5;
          } else if (tuoi <= 42) {
            expectedMinWeight = 1.5; expectedMaxWeight = 2.2;
          } else if (tuoi <= 49) {
            expectedMinWeight = 2.0; expectedMaxWeight = 2.8;
          } else {
            expectedMinWeight = 2.5; expectedMaxWeight = 3.5;
          }

          if (trongLuong < expectedMinWeight) {
            errors.push(`Trọng lượng gà ${trongLuong}kg thấp so với tuổi ${tuoi} ngày (nên ≥${expectedMinWeight}kg)!`);
          }
          if (trongLuong > expectedMaxWeight) {
            errors.push(`Trọng lượng gà ${trongLuong}kg cao bất thường so với tuổi ${tuoi} ngày (nên ≤${expectedMaxWeight}kg)!`);
          }
        }

        // Kiểm tra tỷ lệ diện tích chuồng/tổng diện tích (chăn nuôi)
        if (thongTinChung.dienTichChuongNuoi && thongTinChung.dienTichToanBo) {
          if (thongTinChung.dienTichChuongNuoi > thongTinChung.dienTichToanBo) {
            errors.push('Diện tích chuồng nuôi không được lớn hơn tổng diện tích!');
          }

          // Kiểm tra tỷ lệ hợp lý (chuồng nên chiếm 60-80% tổng diện tích)
          const tyLe = (thongTinChung.dienTichChuongNuoi / thongTinChung.dienTichToanBo) * 100;
          if (tyLe < 40) {
            errors.push(`Diện tích chuồng chỉ chiếm ${tyLe.toFixed(1)}% tổng diện tích, có thể chưa tối ưu!`);
          }
          if (tyLe > 90) {
            errors.push(`Diện tích chuồng chiếm ${tyLe.toFixed(1)}% tổng diện tích, cần để lại không gian cho các khu vực khác!`);
          }
        }

        // Kiểm tra năm sản xuất hợp lý (chung)
        if (thongTinChung.namSanXuat) {
          const currentYear = new Date().getFullYear();
          if (thongTinChung.namSanXuat < currentYear - 2 || thongTinChung.namSanXuat > currentYear + 1) {
            errors.push(`Năm sản xuất phải từ ${currentYear - 2} đến ${currentYear + 1}!`);
          }
        }
      }

      // === VALIDATION ĐẶC BIỆT CHO LÚA HỮU CƠ - LOGIC NGHIỆP VỤ ===

      // 2. Kiểm tra thông tin chung lúa hữu cơ
      const thongTinChungLuaHuuCo = values['Thông tin chung'];
      if (thongTinChungLuaHuuCo) {
        // Kiểm tra diện tích canh tác hợp lý
        if (thongTinChungLuaHuuCo.dienTichCanhTac) {
          if (thongTinChungLuaHuuCo.dienTichCanhTac < 100) {
            errors.push('Diện tích canh tác quá nhỏ (<100m²), có thể không hiệu quả kinh tế!');
          }
          if (thongTinChungLuaHuuCo.dienTichCanhTac > 100000) {
            errors.push('Diện tích canh tác quá lớn (>10ha), kiểm tra lại đơn vị tính!');
          }
        }

        // Kiểm tra năm sản xuất hợp lý
        if (thongTinChungLuaHuuCo.namSanXuat) {
          const currentYear = new Date().getFullYear();
          if (thongTinChungLuaHuuCo.namSanXuat < currentYear - 1 || thongTinChungLuaHuuCo.namSanXuat > currentYear + 1) {
            errors.push(`Năm sản xuất phải từ ${currentYear - 1} đến ${currentYear + 1}!`);
          }
        }

        // Kiểm tra thời gian trồng phù hợp với vụ mùa
        if (thongTinChungLuaHuuCo.thoiGianTrong) {
          const thoiGianTrong = new Date(thongTinChungLuaHuuCo.thoiGianTrong);
          const thang = thoiGianTrong.getMonth() + 1;

          // Vụ Xuân: tháng 12-2, Vụ Mùa: tháng 5-7
          if (!(thang >= 12 || thang <= 2) && !(thang >= 5 && thang <= 7)) {
            errors.push(`Thời gian trồng tháng ${thang} không phù hợp với vụ mùa lúa (Xuân: 12-2, Mùa: 5-7)!`);
          }
        }
      }

      // 3. Kiểm tra đánh giá ATTP (lúa hữu cơ)
      const danhGiaATTPLuaHuuCo = values['Bảng 1: Đánh giá chỉ tiêu gây mất ATTP trong đất/giá thể, nước tưới, nước phục vụ sơ chế và sản phẩm'];
      if (danhGiaATTPLuaHuuCo) {
        // Cảnh báo nếu có chỉ tiêu không đạt - quan trọng cho hữu cơ
        if (danhGiaATTPLuaHuuCo.ketQuaDat === 'Không đạt' && !danhGiaATTPLuaHuuCo.nguyenNhanBienPhapDat) {
          errors.push('Đất không đạt ATTP cần có nguyên nhân và biện pháp khắc phục cụ thể cho sản xuất hữu cơ!');
        }
        if (danhGiaATTPLuaHuuCo.ketQuaNuoc === 'Không đạt' && !danhGiaATTPLuaHuuCo.nguyenNhanBienPhapNuoc) {
          errors.push('Nước tưới không đạt ATTP cần có nguyên nhân và biện pháp khắc phục cụ thể cho sản xuất hữu cơ!');
        }
        if (danhGiaATTPLuaHuuCo.ketQuaSanPham === 'Không đạt' && !danhGiaATTPLuaHuuCo.nguyenNhanBienPhapSanPham) {
          errors.push('Sản phẩm không đạt ATTP cần có nguyên nhân và biện pháp khắc phục cụ thể cho sản xuất hữu cơ!');
        }
      }

      // 4. Kiểm tra giống lúa hữu cơ
      const giongLuaHuuCo = values['Bảng 2: Theo dõi mua hoặc tự sản xuất giống'];
      if (giongLuaHuuCo && thongTinChungLuaHuuCo) {
        // Kiểm tra ngày mua giống phải trước thời gian trồng
        if (giongLuaHuuCo.thoiGianMuaHoacSanXuat && thongTinChungLuaHuuCo.thoiGianTrong) {
          const ngayMua = new Date(giongLuaHuuCo.thoiGianMuaHoacSanXuat);
          const ngayTrong = new Date(thongTinChungLuaHuuCo.thoiGianTrong);
          const soNgayBaoQuan = (ngayTrong - ngayMua) / (1000 * 60 * 60 * 24);

          if (soNgayBaoQuan < 0) {
            errors.push('Ngày mua giống phải trước thời gian trồng!');
          }
          if (soNgayBaoQuan > 365) {
            errors.push(`Giống lúa bảo quản ${Math.round(soNgayBaoQuan)} ngày quá lâu, có thể mất sức nảy mầm!`);
          }
        }

        // Kiểm tra tên giống phù hợp
        if (giongLuaHuuCo.tenGiong && thongTinChungLuaHuuCo.giongCayTrong) {
          if (giongLuaHuuCo.tenGiong !== thongTinChungLuaHuuCo.giongCayTrong) {
            errors.push('Tên giống trong bảng mua phải khớp với thông tin chung!');
          }
        }

        // Kiểm tra lượng giống hợp lý cho diện tích
        if (giongLuaHuuCo.soLuongKg && thongTinChungLuaHuuCo.dienTichCanhTac) {
          const dienTichHa = thongTinChungLuaHuuCo.dienTichCanhTac / 10000; // Chuyển m² sang ha
          const luongGiongTrenHa = giongLuaHuuCo.soLuongKg / dienTichHa;

          // Lúa cần 80-120 kg giống/ha
          if (luongGiongTrenHa < 80) {
            errors.push(`Lượng giống ${luongGiongTrenHa.toFixed(1)}kg/ha thấp (nên 80-120kg/ha)!`);
          }
          if (luongGiongTrenHa > 150) {
            errors.push(`Lượng giống ${luongGiongTrenHa.toFixed(1)}kg/ha cao (nên 80-120kg/ha)!`);
          }
        }

        // Cảnh báo nếu sử dụng hóa chất xử lý giống (không phù hợp hữu cơ)
        if (giongLuaHuuCo.xuLyGiong === 'Có' && giongLuaHuuCo.tenHoaChatXuLyGiong) {
          errors.push('Cảnh báo: Sản xuất hữu cơ không nên sử dụng hóa chất xử lý giống!');
        }
      }

      // 5. Kiểm tra vật tư đầu vào hữu cơ
      const vatTuDauVaoHuuCo = values['Bảng 3: Theo dõi mua hoặc tự sản xuất vật tư đầu vào'];
      if (vatTuDauVaoHuuCo) {
        // Kiểm tra hạn sử dụng vật tư
        if (vatTuDauVaoHuuCo.hanSuDung && vatTuDauVaoHuuCo.thoiGianMuaHoacSanXuat) {
          const hanSuDung = new Date(vatTuDauVaoHuuCo.hanSuDung);
          const ngayMua = new Date(vatTuDauVaoHuuCo.thoiGianMuaHoacSanXuat);

          if (hanSuDung < ngayMua) {
            errors.push('Hạn sử dụng vật tư không được trước ngày mua!');
          }

          const soNgayConHan = (hanSuDung - new Date()) / (1000 * 60 * 60 * 24);
          if (soNgayConHan < 0) {
            errors.push('Vật tư đã hết hạn sử dụng!');
          }
        }

        // Kiểm tra số lượng vật tư hợp lý
        if (vatTuDauVaoHuuCo.soLuong) {
          if (vatTuDauVaoHuuCo.soLuong <= 0) {
            errors.push('Số lượng vật tư phải lớn hơn 0!');
          }
          if (vatTuDauVaoHuuCo.soLuong > 10000) {
            errors.push('Số lượng vật tư quá lớn, kiểm tra lại đơn vị tính!');
          }
        }
      }

      // 6. Kiểm tra quá trình sản xuất hữu cơ
      const quaTrinhSanXuatHuuCo = values['Bảng 4: Theo dõi quá trình sản xuất'];
      if (quaTrinhSanXuatHuuCo && thongTinChungLuaHuuCo) {
        // Kiểm tra liều lượng phân bón hợp lý
        if (quaTrinhSanXuatHuuCo.lieuLuongKgHa && quaTrinhSanXuatHuuCo.congViec) {
          const lieuLuong = quaTrinhSanXuatHuuCo.lieuLuongKgHa;
          const congViec = quaTrinhSanXuatHuuCo.congViec;

          // Kiểm tra liều lượng theo công việc
          if (congViec === 'Bón vôi bột' && (lieuLuong < 200 || lieuLuong > 800)) {
            errors.push(`Liều lượng vôi bột ${lieuLuong}kg/ha không hợp lý (nên 200-800kg/ha)!`);
          }
          if (congViec === 'Bón lót' && (lieuLuong < 300 || lieuLuong > 1000)) {
            errors.push(`Liều lượng phân lót ${lieuLuong}kg/ha không hợp lý (nên 300-1000kg/ha)!`);
          }
          if (congViec.includes('Bón thúc') && (lieuLuong < 50 || lieuLuong > 300)) {
            errors.push(`Liều lượng phân thúc ${lieuLuong}kg/ha không hợp lý (nên 50-300kg/ha)!`);
          }
        }

        // Kiểm tra tổng lượng sử dụng phù hợp với diện tích
        if (quaTrinhSanXuatHuuCo.tongLuongSuDung && quaTrinhSanXuatHuuCo.lieuLuongKgHa && thongTinChungLuaHuuCo.dienTichCanhTac) {
          const dienTichHa = thongTinChungLuaHuuCo.dienTichCanhTac / 10000;
          const tongLuongUocTinh = quaTrinhSanXuatHuuCo.lieuLuongKgHa * dienTichHa;
          const chenhLech = Math.abs(quaTrinhSanXuatHuuCo.tongLuongSuDung - tongLuongUocTinh) / tongLuongUocTinh;

          if (chenhLech > 0.2) { // Chênh lệch > 20%
            errors.push(`Tổng lượng sử dụng ${quaTrinhSanXuatHuuCo.tongLuongSuDung}kg không khớp với tính toán ${tongLuongUocTinh.toFixed(1)}kg!`);
          }
        }

        // Cảnh báo nếu sử dụng thuốc BVTV hóa học (không phù hợp hữu cơ)
        if (quaTrinhSanXuatHuuCo.congViec === 'Phun thuốc BVTV' && quaTrinhSanXuatHuuCo.nguyenVatLieu) {
          const thuocBVTV = quaTrinhSanXuatHuuCo.nguyenVatLieu.toLowerCase();
          const hoaChatCamList = ['glyphosate', 'paraquat', '2,4-d', 'atrazine', 'carbofuran'];
          const coHoaChatCam = hoaChatCamList.some(hoaChat => thuocBVTV.includes(hoaChat));

          if (coHoaChatCam) {
            errors.push('Cảnh báo: Sản xuất hữu cơ không được sử dụng thuốc BVTV hóa học tổng hợp!');
          }
        }
      }

      // 7. Kiểm tra thu hoạch lúa hữu cơ
      const thuHoachLuaHuuCo = values['Bảng 5: Theo dõi thu hoạch/tiêu thụ sản phẩm'];
      if (thuHoachLuaHuuCo && thongTinChungLuaHuuCo) {
        // Kiểm tra chu kỳ sản xuất lúa hợp lý
        if (thuHoachLuaHuuCo.ngayThangNamThuHoach && thongTinChungLuaHuuCo.thoiGianTrong) {
          const ngayThu = new Date(thuHoachLuaHuuCo.ngayThangNamThuHoach);
          const ngayTrong = new Date(thongTinChungLuaHuuCo.thoiGianTrong);
          const soNgaySanXuat = (ngayThu - ngayTrong) / (1000 * 60 * 60 * 24);

          if (soNgaySanXuat < 90) {
            errors.push(`Chu kỳ sản xuất lúa ${Math.round(soNgaySanXuat)} ngày quá ngắn (tối thiểu 90 ngày)!`);
          }
          if (soNgaySanXuat > 150) {
            errors.push(`Chu kỳ sản xuất lúa ${Math.round(soNgaySanXuat)} ngày quá dài (tối đa 150 ngày)!`);
          }
        }

        // Kiểm tra khối lượng tiêu thụ không vượt quá sản lượng
        if (thuHoachLuaHuuCo.khoiLuongTieuThuKg && thuHoachLuaHuuCo.sanLuongKg) {
          if (thuHoachLuaHuuCo.khoiLuongTieuThuKg > thuHoachLuaHuuCo.sanLuongKg) {
            errors.push('Khối lượng tiêu thụ không được lớn hơn sản lượng thu hoạch!');
          }
        }

        // Ước tính năng suất lúa hợp lý
        if (thuHoachLuaHuuCo.sanLuongKg && thongTinChungLuaHuuCo.dienTichCanhTac) {
          const dienTichHa = thongTinChungLuaHuuCo.dienTichCanhTac / 10000;
          const nangSuatTrenHa = thuHoachLuaHuuCo.sanLuongKg / dienTichHa;

          // Năng suất lúa hữu cơ thường thấp hơn: 3-6 tấn/ha
          if (nangSuatTrenHa < 3000) {
            errors.push(`Năng suất ${(nangSuatTrenHa / 1000).toFixed(1)} tấn/ha thấp, cần cải thiện kỹ thuật canh tác!`);
          }
          if (nangSuatTrenHa > 8000) {
            errors.push(`Năng suất ${(nangSuatTrenHa / 1000).toFixed(1)} tấn/ha cao bất thường cho lúa hữu cơ, kiểm tra lại số liệu!`);
          }
        }

        // Kiểm tra thời gian xuất bán sau thu hoạch
        if (thuHoachLuaHuuCo.thoiGianXuatBan && thuHoachLuaHuuCo.ngayThangNamThuHoach) {
          const ngayXuat = new Date(thuHoachLuaHuuCo.thoiGianXuatBan);
          const ngayThu = new Date(thuHoachLuaHuuCo.ngayThangNamThuHoach);
          const soNgayBaoQuan = (ngayXuat - ngayThu) / (1000 * 60 * 60 * 24);

          if (soNgayBaoQuan < 0) {
            errors.push('Thời gian xuất bán phải sau ngày thu hoạch!');
          }
          if (soNgayBaoQuan > 365) {
            errors.push(`Lúa bảo quản ${Math.round(soNgayBaoQuan)} ngày quá lâu, có thể mất chất lượng!`);
          }
        }
      }

      // === VALIDATION ĐẶC BIỆT CHO BÒ THỊT - LOGIC NGHIỆP VỤ ===

      // 2. Kiểm tra lý lịch giống bò thịt
      const lyLichGiongBo = values['Biểu 1: Lý lịch giống'];
      if (lyLichGiongBo) {
        // Kiểm tra thông tin cơ bản con giống
        if (lyLichGiongBo.ngaySinhCon) {
          const ngaySinh = new Date(lyLichGiongBo.ngaySinhCon);
          const hienTai = new Date();
          const tuoiThang = (hienTai - ngaySinh) / (1000 * 60 * 60 * 24 * 30);

          if (tuoiThang < 0) {
            errors.push('Ngày sinh con không được trong tương lai!');
          }
          if (tuoiThang > 120) { // 10 năm
            errors.push(`Con bò ${Math.round(tuoiThang)} tháng tuổi quá già để làm giống!`);
          }
        }

        // Kiểm tra tính nhất quán huyết thống
        if (lyLichGiongBo.capGiongCon && lyLichGiongBo.capGiongBo && lyLichGiongBo.capGiongMe) {
          const capCon = lyLichGiongBo.capGiongCon;
          const capBo = lyLichGiongBo.capGiongBo;
          const capMe = lyLichGiongBo.capGiongMe;

          // Logic cấp giống: F1 = Ông bà x Ông bà, F2 = F1 x F1, etc.
          if (capCon === 'F1' && (capBo !== 'Ông bà' || capMe !== 'Ông bà')) {
            errors.push('Bò F1 phải có bố mẹ đều là cấp "Ông bà"!');
          }
          if (capCon === 'F2' && (capBo !== 'F1' || capMe !== 'F1')) {
            errors.push('Bò F2 phải có bố mẹ đều là cấp "F1"!');
          }
        }
      }

      // 3. Kiểm tra mua/chuyển bò giống
      const muaChuyenBoGiong = values['Biểu 2: Ghi chép mua/chuyển bò thịt giống vào nuôi thương phẩm'];
      if (muaChuyenBoGiong) {
        // Kiểm tra số lượng hợp lý
        if (muaChuyenBoGiong.soLuongCon) {
          if (muaChuyenBoGiong.soLuongCon > 1000) {
            errors.push('Số lượng bò mua quá lớn (>1000 con), kiểm tra lại!');
          }
          if (muaChuyenBoGiong.soLuongCon < 1) {
            errors.push('Số lượng bò phải ít nhất 1 con!');
          }
        }

        // Kiểm tra ngày mua hợp lý
        if (muaChuyenBoGiong.ngayThangNam) {
          const ngayMua = new Date(muaChuyenBoGiong.ngayThangNam);
          const hienTai = new Date();
          const soNgay = (hienTai - ngayMua) / (1000 * 60 * 60 * 24);

          if (soNgay < 0) {
            errors.push('Ngày mua bò không được trong tương lai!');
          }
          if (soNgay > 365 * 3) { // 3 năm
            errors.push(`Ngày mua bò ${Math.round(soNgay)} ngày trước quá lâu!`);
          }
        }
      }

      // 4. Kiểm tra sinh trưởng bò thịt
      const sinhTruongBo = values['Biểu 3: Theo dõi sinh trưởng'];
      if (sinhTruongBo && muaChuyenBoGiong) {
        // Kiểm tra khối lượng trung bình hợp lý
        if (sinhTruongBo.khoiLuongTrungBinhConKg) {
          const khoiLuong = sinhTruongBo.khoiLuongTrungBinhConKg;
          if (khoiLuong < 50) {
            errors.push(`Khối lượng bò ${khoiLuong}kg quá nhẹ (tối thiểu 50kg)!`);
          }
          if (khoiLuong > 800) {
            errors.push(`Khối lượng bò ${khoiLuong}kg quá nặng (tối đa 800kg)!`);
          }
        }

        // Kiểm tra tổng khối lượng = số lượng × khối lượng trung bình
        if (sinhTruongBo.tongKhoiLuongBoKg && sinhTruongBo.soLuongCon && sinhTruongBo.khoiLuongTrungBinhConKg) {
          const tongUocTinh = sinhTruongBo.soLuongCon * sinhTruongBo.khoiLuongTrungBinhConKg;
          const chenhLech = Math.abs(sinhTruongBo.tongKhoiLuongBoKg - tongUocTinh) / tongUocTinh;

          if (chenhLech > 0.15) { // Chênh lệch > 15%
            errors.push(`Tổng khối lượng ${sinhTruongBo.tongKhoiLuongBoKg}kg không khớp với tính toán ${tongUocTinh.toFixed(1)}kg!`);
          }
        }

        // Kiểm tra lượng thức ăn/con/ngày hợp lý
        if (sinhTruongBo.luongThucAnSuDungKg && sinhTruongBo.soLuongCon && sinhTruongBo.khoiLuongTrungBinhConKg) {
          const luongThucAnTrenCon = sinhTruongBo.luongThucAnSuDungKg / sinhTruongBo.soLuongCon;
          const khoiLuong = sinhTruongBo.khoiLuongTrungBinhConKg;

          // Bò ăn khoảng 2-4% trọng thể mỗi ngày
          const expectedMin = khoiLuong * 0.02;
          const expectedMax = khoiLuong * 0.04;

          if (luongThucAnTrenCon < expectedMin) {
            errors.push(`Lượng thức ăn ${luongThucAnTrenCon.toFixed(1)}kg/con/ngày thấp (nên ${expectedMin.toFixed(1)}-${expectedMax.toFixed(1)}kg)!`);
          }
          if (luongThucAnTrenCon > expectedMax) {
            errors.push(`Lượng thức ăn ${luongThucAnTrenCon.toFixed(1)}kg/con/ngày cao (nên ${expectedMin.toFixed(1)}-${expectedMax.toFixed(1)}kg)!`);
          }
        }
      }

      // 5. Kiểm tra phối trộn thức ăn bò
      const phoiTronThucAnBo = values['Biểu 5: Theo dõi phối trộn thức ăn (Tỷ lệ phối trộn)'];
      if (phoiTronThucAnBo) {
        // Tổng tỷ lệ phối trộn phải = 100%
        const tongTyLe = (phoiTronThucAnBo.coRomCayKhacPhanTram || 0) +
          (phoiTronThucAnBo.botCamGaoNgoPhanTram || 0) +
          (phoiTronThucAnBo.botCayLacPhanTram || 0) +
          (phoiTronThucAnBo.botDauXanhPhanTram || 0);

        if (Math.abs(tongTyLe - 100) > 5) { // Cho phép sai số 5%
          errors.push(`Tổng tỷ lệ phối trộn ${tongTyLe}% phải bằng 100%!`);
        }

        // Cỏ + rơm nên chiếm 60-80% khẩu phần bò thịt
        if (phoiTronThucAnBo.coRomCayKhacPhanTram) {
          if (phoiTronThucAnBo.coRomCayKhacPhanTram < 50) {
            errors.push(`Tỷ lệ cỏ + rơm ${phoiTronThucAnBo.coRomCayKhacPhanTram}% quá thấp (nên 60-80%)!`);
          }
          if (phoiTronThucAnBo.coRomCayKhacPhanTram > 90) {
            errors.push(`Tỷ lệ cỏ + rơm ${phoiTronThucAnBo.coRomCayKhacPhanTram}% quá cao (nên 60-80%)!`);
          }
        }

        // Cám + ngô nên chiếm 15-35%
        if (phoiTronThucAnBo.botCamGaoNgoPhanTram) {
          if (phoiTronThucAnBo.botCamGaoNgoPhanTram > 40) {
            errors.push(`Tỷ lệ cám + ngô ${phoiTronThucAnBo.botCamGaoNgoPhanTram}% quá cao (nên 15-35%)!`);
          }
        }
      }

      // 6. Kiểm tra sử dụng thức ăn bò
      const suDungThucAnBo = values['Biểu 6: Theo dõi sử dụng thức ăn'];
      if (suDungThucAnBo && sinhTruongBo) {
        // Kiểm tra lượng thức ăn phù hợp với đối tượng
        if (suDungThucAnBo.soLuongKg && suDungThucAnBo.doiTuongBoSuDung) {
          const doiTuong = suDungThucAnBo.doiTuongBoSuDung;
          const luong = suDungThucAnBo.soLuongKg;

          // Ước tính lượng ăn theo độ tuổi
          if (doiTuong === 'Bò con (dưới 6 tháng)' && luong > 5) {
            errors.push('Bò con dưới 6 tháng không nên ăn quá 5kg/ngày!');
          }
          if (doiTuong === 'Bò tơ (6-12 tháng)' && luong > 15) {
            errors.push('Bò tơ 6-12 tháng không nên ăn quá 15kg/ngày!');
          }
          if (doiTuong === 'Bò thịt (12-24 tháng)' && luong > 25) {
            errors.push('Bò thịt 12-24 tháng không nên ăn quá 25kg/ngày!');
          }
        }
      }

      // === VALIDATION ĐẶC BIỆT CHO GIA CẦM - LOGIC NGHIỆP VỤ ===

      // 7. Kiểm tra mua/chuyển giống (gia cầm)
      const muaChuyenGiongGiaCam = values['Biểu 1: Theo dõi mua/chuyển giống vào nuôi thương phẩm'];
      if (muaChuyenGiongGiaCam && thongTinChung) {
        // Kiểm tra ngày mua giống phải trước hoặc bằng ngày bắt đầu ghi chép
        if (muaChuyenGiongGiaCam.ngayThangMuaChuyenGiong && thongTinChung.thoiGianBatDauGhiChep) {
          const ngayMua = new Date(muaChuyenGiongGiaCam.ngayThangMuaChuyenGiong);
          const ngayBatDau = new Date(thongTinChung.thoiGianBatDauGhiChep);
          if (ngayMua > ngayBatDau) {
            errors.push('Ngày mua giống phải trước hoặc bằng ngày bắt đầu ghi chép!');
          }
        }

        // Kiểm tra số lượng mua phải phù hợp với thông tin chung
        if (muaChuyenGiongGiaCam.soLuongConMua && thongTinChung.soLuongCon) {
          if (muaChuyenGiongGiaCam.soLuongConMua !== thongTinChung.soLuongCon) {
            errors.push('Số lượng con mua phải khớp với số lượng trong thông tin chung!');
          }
        }

        // Kiểm tra lịch tiêm phòng cho gà con
        if (muaChuyenGiongGiaCam.ngayTiem && thongTinChung.ngayTuoi) {
          if (thongTinChung.ngayTuoi <= 7 && !muaChuyenGiongGiaCam.loaiVaccin) {
            errors.push('Gà con dưới 7 ngày tuổi cần có thông tin tiêm phòng!');
          }
        }
      }

      // === VALIDATION ĐẶC BIỆT CHO NẤM ĐÔNG TRÙNG - LOGIC NGHIỆP VỤ ===

      // 2. Kiểm tra thông tin nấm Đông trùng
      if (thongTinChung && thongTinChung.giongNam) {
        // Kiểm tra mật độ túi phôi hợp lý
        if (thongTinChung.matDo && thongTinChung.matDo > 150) {
          errors.push('Mật độ túi phôi quá cao (>150 túi/m²), có thể ảnh hưởng đến chất lượng nấm!');
        }
        if (thongTinChung.matDo && thongTinChung.matDo < 20) {
          errors.push('Mật độ túi phôi quá thấp (<20 túi/m²), không hiệu quả kinh tế!');
        }

        // Kiểm tra tổng túi phôi phù hợp với diện tích và mật độ
        if (thongTinChung.tongTuiPhoi && thongTinChung.dienTich && thongTinChung.matDo) {
          const tongTuiUocTinh = thongTinChung.dienTich * thongTinChung.matDo;
          const chenhLech = Math.abs(thongTinChung.tongTuiPhoi - tongTuiUocTinh) / tongTuiUocTinh;

          if (chenhLech > 0.2) { // Chênh lệch > 20%
            errors.push(`Tổng túi phôi ${thongTinChung.tongTuiPhoi} không khớp với tính toán ${tongTuiUocTinh.toFixed(0)} túi (diện tích × mật độ)!`);
          }
        }
      }

      // 3. Kiểm tra đánh giá ATTP (nấm)
      const danhGiaATTP = values['Bảng 1: Đánh giá các chỉ tiêu gây mất ATTP trong đất/giá thể, nước tưới, nước phục vụ sơ chế và sản phẩm'];
      if (danhGiaATTP) {
        // Cảnh báo nếu có chỉ tiêu không đạt
        if (danhGiaATTP.danhGiaHienTaiDat === 'Không đạt' && !danhGiaATTP.bienPhapXuLyDat) {
          errors.push('Đất/giá thể không đạt ATTP cần có biện pháp xử lý cụ thể!');
        }
        if (danhGiaATTP.danhGiaHienTaiNuoc === 'Không đạt' && !danhGiaATTP.bienPhapXuLyNuoc) {
          errors.push('Nước tưới không đạt ATTP cần có biện pháp xử lý cụ thể!');
        }
        if (danhGiaATTP.danhGiaHienTaiSanPham === 'Không đạt' && !danhGiaATTP.bienPhapXuLySanPham) {
          errors.push('Sản phẩm không đạt ATTP cần có biện pháp xử lý cụ thể!');
        }
      }

      // 4. Kiểm tra giống nấm (nấm)
      const giongNam = values['Bảng 2: Theo dõi mua hoặc tự sản xuất giống đầu vào'];
      if (giongNam && thongTinChung) {
        // Kiểm tra ngày mua giống phải trước ngày bắt đầu đặt túi phôi
        if (giongNam.ngayMua && thongTinChung.ngayBatDauDatTreoTuiPhoi) {
          const ngayMua = new Date(giongNam.ngayMua);
          const ngayBatDau = new Date(thongTinChung.ngayBatDauDatTreoTuiPhoi);
          const soNgayBaoQuan = (ngayBatDau - ngayMua) / (1000 * 60 * 60 * 24);

          if (soNgayBaoQuan < 0) {
            errors.push('Ngày mua giống phải trước ngày bắt đầu đặt túi phôi!');
          }
          if (soNgayBaoQuan > 30) {
            errors.push(`Giống nấm bảo quản ${Math.round(soNgayBaoQuan)} ngày quá lâu, có thể mất hoạt tính!`);
          }
        }

        // Kiểm tra tên giống phù hợp
        if (giongNam.tenGiong && thongTinChung.giongNam) {
          if (giongNam.tenGiong !== thongTinChung.giongNam) {
            errors.push('Tên giống trong bảng mua phải khớp với thông tin chung!');
          }
        }
      }

      // 5. Kiểm tra quá trình sản xuất (nấm)
      const quaTrinhSanXuat = values['Bảng 4: Nhật ký quá trình sản xuất'];
      if (quaTrinhSanXuat) {
        // Kiểm tra nhiệt độ và độ ẩm hợp lý cho nấm Đông trùng
        if (quaTrinhSanXuat.nhietDo) {
          if (quaTrinhSanXuat.nhietDo < 18 || quaTrinhSanXuat.nhietDo > 28) {
            errors.push(`Nhiệt độ ${quaTrinhSanXuat.nhietDo}°C không tối ưu cho nấm Đông trùng (nên 18-28°C)!`);
          }
        }

        if (quaTrinhSanXuat.doAm) {
          if (quaTrinhSanXuat.doAm < 70 || quaTrinhSanXuat.doAm > 90) {
            errors.push(`Độ ẩm ${quaTrinhSanXuat.doAm}% không tối ưu cho nấm Đông trùng (nên 70-90%)!`);
          }
        }

        // Kiểm tra diện tích phù hợp với thông tin chung
        if (quaTrinhSanXuat.dienTichM2 && thongTinChung?.dienTich) {
          if (quaTrinhSanXuat.dienTichM2 > thongTinChung.dienTich) {
            errors.push('Diện tích sản xuất không được lớn hơn tổng diện tích!');
          }
        }
      }

      // 6. Kiểm tra thu hoạch (nấm)
      const thuHoachNam = values['Bảng 5: Thu hoạch và tiêu thụ sản phẩm'];
      if (thuHoachNam && thongTinChung) {
        // Kiểm tra chu kỳ sản xuất nấm hợp lý
        if (thuHoachNam.thoiGianThuHoach && thongTinChung.ngayBatDauDatTreoTuiPhoi) {
          const ngayThu = new Date(thuHoachNam.thoiGianThuHoach);
          const ngayBatDau = new Date(thongTinChung.ngayBatDauDatTreoTuiPhoi);
          const soNgaySanXuat = (ngayThu - ngayBatDau) / (1000 * 60 * 60 * 24);

          if (soNgaySanXuat < 30) {
            errors.push(`Chu kỳ sản xuất nấm ${Math.round(soNgaySanXuat)} ngày quá ngắn (tối thiểu 30 ngày)!`);
          }
          if (soNgaySanXuat > 120) {
            errors.push(`Chu kỳ sản xuất nấm ${Math.round(soNgaySanXuat)} ngày quá dài (tối đa 120 ngày)!`);
          }
        }

        // Kiểm tra số lượng bán không vượt quá sản lượng
        if (thuHoachNam.soLuongBanKg && thuHoachNam.sanLuongKg) {
          if (thuHoachNam.soLuongBanKg > thuHoachNam.sanLuongKg) {
            errors.push('Số lượng bán không được lớn hơn sản lượng thu hoạch!');
          }
        }

        // Ước tính năng suất nấm hợp lý
        if (thuHoachNam.sanLuongKg && thongTinChung.tongTuiPhoi) {
          const nangSuatTrenTui = thuHoachNam.sanLuongKg / thongTinChung.tongTuiPhoi;

          if (nangSuatTrenTui < 0.05) {
            errors.push(`Năng suất ${nangSuatTrenTui.toFixed(3)}kg/túi thấp, cần kiểm tra kỹ thuật nuôi cấy!`);
          }
          if (nangSuatTrenTui > 0.5) {
            errors.push(`Năng suất ${nangSuatTrenTui.toFixed(3)}kg/túi cao bất thường, kiểm tra lại số liệu!`);
          }
        }

        // Kiểm tra vệ sinh thu hoạch
        if (thuHoachNam.veSinhDungCuThuHoach === 'Không đạt (K)') {
          errors.push('Cảnh báo: Dụng cụ thu hoạch không đạt vệ sinh, có thể ảnh hưởng chất lượng sản phẩm!');
        }
      }

      // 3. Kiểm tra logic thức ăn (gia cầm)
      const nhapThucAnGiaCam = values['Biểu 2: Theo dõi nhập thức ăn/nguyên liệu thô'];
      const suDungThucAnGiaCam = values['Biểu 5: Theo dõi sử dụng thức ăn'];

      if (suDungThucAnGiaCam && !nhapThucAnGiaCam) {
        errors.push('Phải có thông tin nhập thức ăn trước khi ghi sử dụng thức ăn!');
      }

      if (suDungThucAnGiaCam && thongTinChung) {
        // Kiểm tra lượng thức ăn/con/ngày hợp lý cho gà
        if (suDungThucAnGiaCam.khoiLuongThucAnCungCap && suDungThucAnGiaCam.soLuongConSuDung) {
          const luongThucAnTrenCon = suDungThucAnGiaCam.khoiLuongThucAnCungCap / suDungThucAnGiaCam.soLuongConSuDung;
          const tuoi = thongTinChung.ngayTuoi || suDungThucAnGiaCam.ngayTuoiThuSuDung || 30;

          // Lượng thức ăn theo tuổi gà (kg/con/ngày)
          let expectedMin = 0, expectedMax = 0;
          if (tuoi <= 7) {
            expectedMin = 0.01; expectedMax = 0.03;
          } else if (tuoi <= 14) {
            expectedMin = 0.03; expectedMax = 0.06;
          } else if (tuoi <= 21) {
            expectedMin = 0.06; expectedMax = 0.10;
          } else if (tuoi <= 28) {
            expectedMin = 0.10; expectedMax = 0.14;
          } else if (tuoi <= 35) {
            expectedMin = 0.14; expectedMax = 0.18;
          } else {
            expectedMin = 0.16; expectedMax = 0.22;
          }

          if (luongThucAnTrenCon < expectedMin) {
            errors.push(`Lượng thức ăn ${luongThucAnTrenCon.toFixed(3)}kg/con/ngày thấp cho gà ${tuoi} ngày tuổi (nên ${expectedMin}-${expectedMax}kg)!`);
          }
          if (luongThucAnTrenCon > expectedMax) {
            errors.push(`Lượng thức ăn ${luongThucAnTrenCon.toFixed(3)}kg/con/ngày cao cho gà ${tuoi} ngày tuổi (nên ${expectedMin}-${expectedMax}kg)!`);
          }
        }
      }

      // 4. Kiểm tra phối trộn thức ăn (gia cầm)
      const phoiTronThucAnGiaCam = values['Biểu 3: Theo dõi thông tin phối trộn thức ăn'];
      if (phoiTronThucAnGiaCam) {
        // Tỷ lệ phối trộn phải <= 100%
        if (phoiTronThucAnGiaCam.tyLePhoiTron > 100) {
          errors.push('Tỷ lệ phối trộn không được vượt quá 100%!');
        }

        // Tuần tuổi phải phù hợp với ngày tuổi
        if (phoiTronThucAnGiaCam.tuanTuoiThu && thongTinChung?.ngayTuoi) {
          const tuanTuoiTinhToan = Math.ceil(thongTinChung.ngayTuoi / 7);
          if (Math.abs(phoiTronThucAnGiaCam.tuanTuoiThu - tuanTuoiTinhToan) > 1) {
            errors.push(`Tuần tuổi ${phoiTronThucAnGiaCam.tuanTuoiThu} không khớp với ngày tuổi ${thongTinChung.ngayTuoi} (≈${tuanTuoiTinhToan} tuần)!`);
          }
        }

        // Kiểm tra lượng sử dụng hợp lý
        if (phoiTronThucAnGiaCam.luongSuDungKgCon) {
          const tuoi = phoiTronThucAnGiaCam.tuanTuoiThu * 7 || 30;
          if (tuoi <= 21 && phoiTronThucAnGiaCam.luongSuDungKgCon > 0.1) {
            errors.push('Gà con dưới 3 tuần tuổi không nên ăn quá 0.1kg/con/ngày!');
          }
          if (tuoi > 35 && phoiTronThucAnGiaCam.luongSuDungKgCon < 0.15) {
            errors.push('Gà lớn trên 5 tuần tuổi cần ít nhất 0.15kg/con/ngày!');
          }
        }
      }

      // 5. Kiểm tra thuốc thú y và vaccin (gia cầm)
      const nhapThuocGiaCam = values['Biểu 4: Theo dõi nhập thuốc thú y, vaccin, thuốc sát trùng, hóa chất'];
      const suDungThuocGiaCam = values['Biểu 6: Theo dõi sử dụng vaccin/thuốc điều trị bệnh'];

      if (suDungThuocGiaCam && !nhapThuocGiaCam) {
        errors.push('Phải có thông tin nhập thuốc trước khi ghi sử dụng thuốc!');
      }

      if (suDungThuocGiaCam) {
        // Kiểm tra số lượng điều trị không vượt quá tổng đàn
        if (suDungThuocGiaCam.soLuongConDieuTri && thongTinChung?.soLuongCon) {
          if (suDungThuocGiaCam.soLuongConDieuTri > thongTinChung.soLuongCon) {
            errors.push('Số lượng con điều trị không được vượt quá tổng số con trong đàn!');
          }
        }

        // Kiểm tra số lượng chết/loại thải hợp lý
        if (suDungThuocGiaCam.soLuongLoaiThaiChet && suDungThuocGiaCam.soLuongConDieuTri) {
          if (suDungThuocGiaCam.soLuongLoaiThaiChet > suDungThuocGiaCam.soLuongConDieuTri) {
            errors.push('Số lượng chết/loại thải không được lớn hơn số lượng điều trị!');
          }
        }

        // Kiểm tra lịch tiêm phòng theo tuổi
        if (suDungThuocGiaCam.noiDungThucHien === 'Tiêm phòng' && suDungThuocGiaCam.ngayTuoiThuDieuTri) {
          const tuoi = suDungThuocGiaCam.ngayTuoiThuDieuTri;
          if (tuoi < 1) {
            errors.push('Gà dưới 1 ngày tuổi không nên tiêm phòng!');
          }
          if (tuoi > 1 && tuoi < 7 && !suDungThuocGiaCam.tenVaccinThuocSuDung.toLowerCase().includes('marek')) {
            errors.push('Gà 1-7 ngày tuổi thường tiêm Marek đầu tiên!');
          }
        }
      }

      // 6. Kiểm tra xử lý vật nuôi chết (gia cầm)
      const xuLyVatNuoiChetGiaCam = values['Biểu 8: Theo dõi thu gom xử lý vật nuôi chết'];
      if (xuLyVatNuoiChetGiaCam) {
        // Tổng số con xử lý phải bằng số con chết
        const tongXuLy = (xuLyVatNuoiChetGiaCam.chonCon || 0) + (xuLyVatNuoiChetGiaCam.dotCon || 0);
        if (xuLyVatNuoiChetGiaCam.soLuongChet && tongXuLy > 0 && tongXuLy !== xuLyVatNuoiChetGiaCam.soLuongChet) {
          errors.push(`Tổng số con xử lý (${tongXuLy}) phải bằng số con chết (${xuLyVatNuoiChetGiaCam.soLuongChet})!`);
        }

        // Kiểm tra tỷ lệ chết hợp lý
        if (xuLyVatNuoiChetGiaCam.soLuongChet && thongTinChung?.soLuongCon) {
          const tyLeChet = (xuLyVatNuoiChetGiaCam.soLuongChet / thongTinChung.soLuongCon) * 100;
          if (tyLeChet > 10) {
            errors.push(`Tỷ lệ chết ${tyLeChet.toFixed(1)}% quá cao (>10%), cần kiểm tra nguyên nhân!`);
          }
        }
      }

      // 7. Kiểm tra xuất bán (gia cầm)
      const xuatBanGiaCam = values['Biểu 12: Theo dõi tiêu thụ, xuất bán'];
      if (xuatBanGiaCam && thongTinChung) {
        // Ngày thu hoạch phải sau ngày nhập giống ít nhất 35 ngày (chu kỳ nuôi tối thiểu)
        if (xuatBanGiaCam.ngayThuHoach && thongTinChung.ngayNhapGiong) {
          const ngayThu = new Date(xuatBanGiaCam.ngayThuHoach);
          const ngayNhap = new Date(thongTinChung.ngayNhapGiong);
          const soNgayNuoi = (ngayThu - ngayNhap) / (1000 * 60 * 60 * 24);

          if (soNgayNuoi < 35) {
            errors.push(`Chu kỳ nuôi gà ${Math.round(soNgayNuoi)} ngày quá ngắn (tối thiểu 35 ngày)!`);
          }

          if (soNgayNuoi > 70) {
            errors.push(`Chu kỳ nuôi gà ${Math.round(soNgayNuoi)} ngày quá dài (tối đa 70 ngày cho gà thịt)!`);
          }
        }

        // Khối lượng xuất bán không được lớn hơn khối lượng thu
        if (xuatBanGiaCam.tongKhoiLuongXuatBan && xuatBanGiaCam.tongKhoiLuongThu) {
          if (xuatBanGiaCam.tongKhoiLuongXuatBan > xuatBanGiaCam.tongKhoiLuongThu) {
            errors.push('Khối lượng xuất bán không được lớn hơn khối lượng thu hoạch!');
          }
        }

        // Ước tính khối lượng hợp lý dựa trên số con và trọng lượng
        if (xuatBanGiaCam.tongKhoiLuongThu && thongTinChung.soLuongCon && thongTinChung.trongLuongTrungBinh) {
          const khoiLuongUocTinh = thongTinChung.soLuongCon * thongTinChung.trongLuongTrungBinh;
          const chenhLech = Math.abs(xuatBanGiaCam.tongKhoiLuongThu - khoiLuongUocTinh) / khoiLuongUocTinh;

          if (chenhLech > 0.3) { // Chênh lệch > 30%
            errors.push(`Khối lượng thu ${xuatBanGiaCam.tongKhoiLuongThu}kg chênh lệch lớn so với ước tính ${khoiLuongUocTinh.toFixed(1)}kg!`);
          }
        }
      }

      // === VALIDATION ĐẶC BIỆT CHO THỦY SẢN ===

      // 2. Kiểm tra thông tin ao nuôi (thủy sản)
      const thongTinAo = values['Biểu 1: Thông tin chung'];
      if (thongTinAo && thongTinChung) {
        // Kiểm tra mật độ thả hợp lý
        if (thongTinAo.matDoTha && thongTinAo.matDoTha > 150) {
          errors.push('Mật độ thả quá cao (>150 con/m²), có thể gây thiếu oxy và bệnh tật!');
        }

        // Kiểm tra tỷ lệ diện tích ao/tổng diện tích
        if (thongTinAo.dienTichAo && thongTinChung.dienTich) {
          if (thongTinAo.dienTichAo > thongTinChung.dienTich) {
            errors.push('Diện tích ao không được lớn hơn tổng diện tích!');
          }
        }

        // Kiểm tra độ sâu ao hợp lý
        if (thongTinAo.doSau && (thongTinAo.doSau < 1.0 || thongTinAo.doSau > 5.0)) {
          errors.push('Độ sâu ao nên từ 1.0-5.0m để đảm bảo chất lượng nước và quản lý!');
        }

        // Kiểm tra tổng lượng giống thả phù hợp với số lượng và cỡ tôm
        if (thongTinAo.tongLuongGiongTha && thongTinAo.soLuongCon && thongTinAo.coTom) {
          const expectedWeight = (thongTinAo.soLuongCon * thongTinAo.coTom) / 1000; // Chuyển g sang kg
          const deviation = Math.abs(thongTinAo.tongLuongGiongTha - expectedWeight) / expectedWeight;
          if (deviation > 0.2) { // Chênh lệch > 20%
            errors.push(`Tổng lượng giống thả ${thongTinAo.tongLuongGiongTha}kg không khớp với tính toán ${expectedWeight.toFixed(2)}kg!`);
          }
        }
      }

      // 3. Kiểm tra cải tạo ao (thủy sản)
      const caiTaoAo = values['Biểu 2: Thông tin cải tạo ao nuôi'];
      if (caiTaoAo) {
        // Kiểm tra thời gian cải tạo hợp lý
        if (caiTaoAo.thoiGianCaiTaoBatDau && caiTaoAo.thoiGianCaiTaoKetThuc) {
          const batDau = new Date(caiTaoAo.thoiGianCaiTaoBatDau);
          const ketThuc = new Date(caiTaoAo.thoiGianCaiTaoKetThuc);
          const soNgayCaiTao = (ketThuc - batDau) / (1000 * 60 * 60 * 24);

          if (soNgayCaiTao < 3) {
            errors.push('Thời gian cải tạo ao quá ngắn (<3 ngày), có thể chưa đủ thời gian xử lý!');
          }
          if (soNgayCaiTao > 60) {
            errors.push('Thời gian cải tạo ao quá dài (>60 ngày), có thể không hiệu quả!');
          }
        }

        // Kiểm tra chỉ số nước sau cải tạo
        if (caiTaoAo.pHSauCaiTao && (caiTaoAo.pHSauCaiTao < 7.0 || caiTaoAo.pHSauCaiTao > 8.5)) {
          errors.push('pH sau cải tạo nên từ 7.0-8.5 để phù hợp với nuôi tôm!');
        }

        if (caiTaoAo.oxySauCaiTao && caiTaoAo.oxySauCaiTao < 5.0) {
          errors.push('Oxy sau cải tạo nên ≥5.0 mg/l để đảm bảo môi trường tốt!');
        }

        if (caiTaoAo.nh3SauCaiTao && caiTaoAo.nh3SauCaiTao > 0.1) {
          errors.push('NH3 sau cải tạo nên ≤0.1 mg/l để tránh độc hại cho tôm!');
        }
      }

      // 4. Kiểm tra logic thức ăn (thủy sản)
      const nhapThucAnThuySan = values['Biểu 3: Theo dõi nhập thức ăn'];
      const suDungThucAnThuySan = values['Biểu 4: Theo dõi sử dụng thức ăn'];

      if (suDungThucAnThuySan && !nhapThucAnThuySan) {
        errors.push('Phải có thông tin nhập thức ăn trước khi ghi sử dụng thức ăn!');
      }

      if (suDungThucAnThuySan) {
        // Kiểm tra độ đạm thức ăn phù hợp với giai đoạn nuôi
        if (suDungThucAnThuySan.doDamThucAn) {
          if (suDungThucAnThuySan.trongLuongTom && suDungThucAnThuySan.trongLuongTom < 5 && suDungThucAnThuySan.doDamThucAn < 35) {
            errors.push('Tôm con (<5g) cần thức ăn có độ đạm ≥35% để phát triển tốt!');
          }
          if (suDungThucAnThuySan.trongLuongTom && suDungThucAnThuySan.trongLuongTom > 15 && suDungThucAnThuySan.doDamThucAn > 30) {
            errors.push('Tôm lớn (>15g) nên dùng thức ăn có độ đạm ≤30% để tránh lãng phí!');
          }
        }

        // Kiểm tra chỉ số chất lượng nước
        if (suDungThucAnThuySan.pH && (suDungThucAnThuySan.pH < 7.5 || suDungThucAnThuySan.pH > 8.5)) {
          errors.push('pH nước nuôi nên từ 7.5-8.5 để tôm phát triển tốt nhất!');
        }

        if (suDungThucAnThuySan.oxy && suDungThucAnThuySan.oxy < 4.0) {
          errors.push('Oxy hòa tan <4.0 mg/l có thể gây stress và chết tôm!');
        }

        if (suDungThucAnThuySan.nh3 && suDungThucAnThuySan.nh3 > 0.1) {
          errors.push('NH3 >0.1 mg/l có độc tính cao với tôm, cần xử lý ngay!');
        }

        if (suDungThucAnThuySan.h2s && suDungThucAnThuySan.h2s > 0.05) {
          errors.push('H2S >0.05 mg/l rất độc hại, cần thay nước và sục khí!');
        }

        // Kiểm tra tỷ lệ tôm chết
        if (suDungThucAnThuySan.tomChet && thongTinAo?.soLuongCon) {
          const tyLeChet = (suDungThucAnThuySan.tomChet / thongTinAo.soLuongCon) * 100;
          if (tyLeChet > 5) {
            errors.push(`Tỷ lệ tôm chết ${tyLeChet.toFixed(1)}% quá cao (>5%), cần kiểm tra nguyên nhân!`);
          }
        }
      }

      // 5. Kiểm tra điều trị bệnh (thủy sản)
      const dieuTriBenh = values['Biểu 6: Theo dõi điều trị bệnh'];
      if (dieuTriBenh && suDungThucAnThuySan) {
        // Cảnh báo nếu điều trị bệnh nhưng không có thời gian cách ly
        if (dieuTriBenh.tenThuocDieuTri && !suDungThucAnThuySan.thoiGianCachLy) {
          errors.push('Cảnh báo: Đã sử dụng thuốc điều trị nhưng chưa ghi thời gian cách ly!');
        }

        // Kiểm tra hiệu quả điều trị
        if (dieuTriBenh.ketQuaSauKhiTriBenh === 'Không hiệu quả' && !dieuTriBenh.ghiChu) {
          errors.push('Điều trị không hiệu quả cần ghi rõ nguyên nhân và biện pháp tiếp theo!');
        }
      }

      // 6. Kiểm tra thu hoạch (thủy sản)
      const thuHoach = values['Biểu 7: Theo dõi thu hoạch'];
      if (thuHoach && thongTinAo) {
        // Kiểm tra chu kỳ nuôi hợp lý
        if (thuHoach.ngayThuHoach && thongTinAo.ngayThaGiong) {
          const ngayThu = new Date(thuHoach.ngayThuHoach);
          const ngayTha = new Date(thongTinAo.ngayThaGiong);
          const soNgayNuoi = (ngayThu - ngayTha) / (1000 * 60 * 60 * 24);

          if (soNgayNuoi < 60) {
            errors.push(`Chu kỳ nuôi ${Math.round(soNgayNuoi)} ngày quá ngắn cho tôm (tối thiểu 60 ngày)!`);
          }

          if (soNgayNuoi > 150) {
            errors.push(`Chu kỳ nuôi ${Math.round(soNgayNuoi)} ngày quá dài (tối đa 150 ngày)!`);
          }
        }

        // Kiểm tra cỡ tôm thu hoạch hợp lý
        if (thuHoach.coTomThuHoach && thongTinAo.coTom) {
          const tangTruongCo = thuHoach.coTomThuHoach / thongTinAo.coTom;
          if (tangTruongCo < 5) {
            errors.push(`Tôm tăng trưởng kém (chỉ ${tangTruongCo.toFixed(1)} lần), cần xem xét chất lượng giống và thức ăn!`);
          }
          if (tangTruongCo > 50) {
            errors.push(`Tăng trưởng ${tangTruongCo.toFixed(1)} lần có vẻ không hợp lý, kiểm tra lại số liệu!`);
          }
        }

        // Ước tính năng suất
        if (thuHoach.khoiLuongKg && thongTinAo.dienTichAo) {
          const nangSuat = thuHoach.khoiLuongKg / (thongTinAo.dienTichAo * 10000); // kg/m²
          if (nangSuat > 5) {
            errors.push(`Năng suất ${nangSuat.toFixed(2)} kg/m² quá cao, kiểm tra lại số liệu!`);
          }
          if (nangSuat < 0.5) {
            errors.push(`Năng suất ${nangSuat.toFixed(2)} kg/m² thấp, cần cải thiện kỹ thuật nuôi!`);
          }
        }
      }

      // 2. Kiểm tra logic mua/chuyển giống
      const muaChuyenGiong = values['Biểu 1: Theo dõi mua/chuyển giống vào nuôi thương phẩm'];
      if (muaChuyenGiong && thongTinChung) {
        // Kiểm tra ngày mua giống phải trước hoặc bằng ngày bắt đầu ghi chép
        if (muaChuyenGiong.ngayThangMuaChuyenGiong && thongTinChung.thoiGianBatDauGhiChep) {
          const ngayMua = new Date(muaChuyenGiong.ngayThangMuaChuyenGiong);
          const ngayBatDau = new Date(thongTinChung.thoiGianBatDauGhiChep);
          if (ngayMua > ngayBatDau) {
            errors.push('Ngày mua giống phải trước hoặc bằng ngày bắt đầu ghi chép!');
          }
        }

        // Kiểm tra số lượng mua phải phù hợp với thông tin chung
        if (muaChuyenGiong.soLuongConMua && thongTinChung.soLuongCon) {
          if (muaChuyenGiong.soLuongConMua !== thongTinChung.soLuongCon) {
            errors.push('Số lượng con mua phải khớp với số lượng trong thông tin chung!');
          }
        }
      }

      // 3. Kiểm tra logic thức ăn
      const nhapThucAn = values['Biểu 2: Theo dõi nhập thức ăn/nguyên liệu thô'];
      const suDungThucAn = values['Biểu 5: Theo dõi sử dụng thức ăn'];

      if (suDungThucAn && !nhapThucAn) {
        errors.push('Phải có thông tin nhập thức ăn trước khi ghi sử dụng thức ăn!');
      }

      if (suDungThucAn && thongTinChung) {
        // Kiểm tra lượng thức ăn/con/ngày hợp lý (2-5kg/con/ngày cho lợn)
        if (suDungThucAn.khoiLuongThucAnCungCap && suDungThucAn.soLuongConSuDung) {
          const luongThucAnTrenCon = suDungThucAn.khoiLuongThucAnCungCap / suDungThucAn.soLuongConSuDung;
          if (luongThucAnTrenCon < 1 || luongThucAnTrenCon > 8) {
            errors.push(`Lượng thức ăn ${luongThucAnTrenCon.toFixed(2)}kg/con/ngày không hợp lý (nên từ 1-8kg)!`);
          }
        }
      }

      // 4. Kiểm tra logic phối trộn thức ăn
      const phoiTronThucAn = values['Biểu 3: Theo dõi thông tin phối trộn thức ăn'];
      if (phoiTronThucAn) {
        // Tỷ lệ phối trộn phải <= 100%
        if (phoiTronThucAn.tyLePhoiTron > 100) {
          errors.push('Tỷ lệ phối trộn không được vượt quá 100%!');
        }

        // Tuần tuổi phải phù hợp với ngày tuổi
        if (phoiTronThucAn.tuanTuoiThu && thongTinChung?.ngayTuoi) {
          const tuanTuoiTinhToan = Math.ceil(thongTinChung.ngayTuoi / 7);
          if (Math.abs(phoiTronThucAn.tuanTuoiThu - tuanTuoiTinhToan) > 2) {
            errors.push(`Tuần tuổi ${phoiTronThucAn.tuanTuoiThu} không khớp với ngày tuổi ${thongTinChung.ngayTuoi} (≈${tuanTuoiTinhToan} tuần)!`);
          }
        }
      }

      // 5. Kiểm tra logic thuốc thú y
      const nhapThuoc = values['Biểu 4: Theo dõi nhập thuốc thú y, vaccin, thuốc sát trùng, hóa chất'];
      const suDungThuoc = values['Biểu 6: Theo dõi sử dụng vaccin/thuốc điều trị bệnh'];

      if (suDungThuoc && !nhapThuoc) {
        errors.push('Phải có thông tin nhập thuốc trước khi ghi sử dụng thuốc!');
      }

      if (suDungThuoc) {
        // Kiểm tra số lượng điều trị không vượt quá tổng đàn
        if (suDungThuoc.soLuongConDieuTri && thongTinChung?.soLuongCon) {
          if (suDungThuoc.soLuongConDieuTri > thongTinChung.soLuongCon) {
            errors.push('Số lượng con điều trị không được vượt quá tổng số con trong đàn!');
          }
        }

        // Kiểm tra số lượng chết/loại thải hợp lý
        if (suDungThuoc.soLuongLoaiThaiChet && suDungThuoc.soLuongConDieuTri) {
          if (suDungThuoc.soLuongLoaiThaiChet > suDungThuoc.soLuongConDieuTri) {
            errors.push('Số lượng chết/loại thải không được lớn hơn số lượng điều trị!');
          }
        }
      }

      // 6. Kiểm tra logic xử lý vật nuôi chết
      const xuLyVatNuoiChet = values['Biểu 8: Theo dõi thu gom xử lý vật nuôi chết'];
      if (xuLyVatNuoiChet) {
        // Tổng số con xử lý phải bằng số con chết
        const tongXuLy = (xuLyVatNuoiChet.chonCon || 0) + (xuLyVatNuoiChet.dotCon || 0);
        if (xuLyVatNuoiChet.soLuongChet && tongXuLy > 0 && tongXuLy !== xuLyVatNuoiChet.soLuongChet) {
          errors.push(`Tổng số con xử lý (${tongXuLy}) phải bằng số con chết (${xuLyVatNuoiChet.soLuongChet})!`);
        }
      }

      // 7. Kiểm tra logic xuất bán
      const xuatBan = values['Biểu 12: Theo dõi tiêu thụ, xuất bán'];
      if (xuatBan && thongTinChung) {
        // Ngày thu hoạch phải sau ngày nhập giống ít nhất 60 ngày (chu kỳ nuôi tối thiểu)
        if (xuatBan.ngayThuHoach && thongTinChung.ngayNhapGiong) {
          const ngayThu = new Date(xuatBan.ngayThuHoach);
          const ngayNhap = new Date(thongTinChung.ngayNhapGiong);
          const soNgayNuoi = (ngayThu - ngayNhap) / (1000 * 60 * 60 * 24);

          if (soNgayNuoi < 60) {
            errors.push(`Chu kỳ nuôi ${Math.round(soNgayNuoi)} ngày quá ngắn (tối thiểu 60 ngày)!`);
          }

          if (soNgayNuoi > 365) {
            errors.push(`Chu kỳ nuôi ${Math.round(soNgayNuoi)} ngày quá dài (tối đa 365 ngày)!`);
          }
        }

        // Khối lượng xuất bán không được lớn hơn khối lượng thu
        if (xuatBan.tongKhoiLuongXuatBan && xuatBan.tongKhoiLuongThu) {
          if (xuatBan.tongKhoiLuongXuatBan > xuatBan.tongKhoiLuongThu) {
            errors.push('Khối lượng xuất bán không được lớn hơn khối lượng thu hoạch!');
          }
        }

        // Ước tính khối lượng hợp lý dựa trên số con và trọng lượng
        if (xuatBan.tongKhoiLuongThu && thongTinChung.soLuongCon && thongTinChung.trongLuongTrungBinh) {
          const khoiLuongUocTinh = thongTinChung.soLuongCon * thongTinChung.trongLuongTrungBinh;
          const chenhLech = Math.abs(xuatBan.tongKhoiLuongThu - khoiLuongUocTinh) / khoiLuongUocTinh;

          if (chenhLech > 0.5) { // Chênh lệch > 50%
            errors.push(`Khối lượng thu ${xuatBan.tongKhoiLuongThu}kg chênh lệch lớn so với ước tính ${khoiLuongUocTinh.toFixed(1)}kg!`);
          }
        }
      }

      // 8. Kiểm tra tính nhất quán của dữ liệu
      if (thongTinChung && suDungThucAn && xuatBan) {
        // Cảnh báo nếu không có thông tin về thuốc/vaccin trong chu kỳ dài
        if (!suDungThuoc && xuatBan.ngayThuHoach && thongTinChung.ngayNhapGiong) {
          const ngayThu = new Date(xuatBan.ngayThuHoach);
          const ngayNhap = new Date(thongTinChung.ngayNhapGiong);
          const soNgayNuoi = (ngayThu - ngayNhap) / (1000 * 60 * 60 * 24);

          if (soNgayNuoi > 90) {
            errors.push('Cảnh báo: Chu kỳ nuôi dài (>90 ngày) nhưng không có thông tin tiêm phòng/điều trị!');
          }
        }
      }

      if (errors.length > 0) {
        console.log('❌ Validation errors:', errors);
        throw new Error(errors.join('\n'));
      }

      console.log('✅ Validation passed, preparing payload...');

      // Separate status from entries
      const { status, ...entries } = values;

      console.log('📦 Payload entries:', entries);
      console.log('📦 Payload status:', status);

      const payload = {
        schemaId: activeSchemaId,
        status: status || 'Draft',
        entries: entries,
        images: fileList
          .filter(f => f.status === 'done')
          .map(f => {
            // Extract relative path from URL if it's our own server
            const fileBaseURL = api.defaults.baseURL.replace('/api', '');
            let finalUrl = f.url;
            if (finalUrl.startsWith(fileBaseURL)) {
              finalUrl = finalUrl.replace(fileBaseURL, '');
            }
            return {
              url: finalUrl,
              caption: f.name
            };
          })
      };

      if (isEditing) {
        return api.put(`/journals/${id}`, payload);
      } else {
        return api.post(`/journals`, payload);
      }
    },
    onSuccess: () => {
      message.success(`Lưu nhật ký ${isEditing ? 'thành công!' : 'thành công! Đã tạo sổ mới.'}`);
      queryClient.invalidateQueries({ queryKey: ['journals'] });

      // Lấy đường dẫn danh sách từ URL hiện tại
      // Ví dụ: /vietgap/trong-trot/new/123 -> /vietgap/trong-trot
      // hoặc: /vietgap/trong-trot/edit/456 -> /vietgap/trong-trot
      const pathParts = location.pathname.split('/');
      const listPath = `/${pathParts[1]}/${pathParts[2]}`;
      navigate(listPath);
    },
    onError: (err) => {
      const errorMessage = err.message || err.response?.data?.message || 'Lỗi khi lưu nhật ký. Vui lòng thử lại.';

      // Hiển thị lỗi validation chi tiết
      if (errorMessage.includes('\n')) {
        const errors = errorMessage.split('\n');
        errors.forEach(error => {
          message.error(error, 5); // Hiển thị 5 giây
        });
      } else {
        message.error(errorMessage);
      }
    }
  });

  // Validation rules cho các trường khác nhau - Tăng cường cho chăn nuôi VietGAHP
  const getValidationRules = (field, tableName) => {
    const rules = [];

    // Ánh xạ kiểu dữ liệu của hệ thống sang kiểu của Ant Design Validator
    let antdType = 'string';
    if (field.type === 'number') antdType = 'number';
    if (field.type === 'date') antdType = 'object';
    if (field.type === 'email') antdType = 'email';

    // Required validation
    if (field.required) {
      rules.push({
        required: true,
        type: antdType,
        message: `Vui lòng nhập ${field.label}`
      });
    }

    // Validation theo loại trường
    switch (field.type) {
      case 'text':
        // Validation cho các trường text cụ thể
        if (field.name.includes('email') || field.label.toLowerCase().includes('email')) {
          rules.push({
            type: 'email',
            message: 'Email không hợp lệ!'
          });
        }

        if (field.name.includes('phone') || field.label.toLowerCase().includes('điện thoại')) {
          rules.push({
            pattern: /^[0-9]{10,11}$/,
            message: 'Số điện thoại phải có 10-11 chữ số!'
          });
        }

        // Mã số hộ chăn nuôi theo quy định
        if (field.name.includes('maSoHo') || field.name.includes('maHo')) {
          rules.push({
            pattern: /^[A-Z0-9]{5,15}$/,
            message: 'Mã số hộ phải có 5-15 ký tự (chữ hoa và số)!'
          });
        }

        // Mã lô giống/sản phẩm
        if (field.name.includes('maLo') || field.name.includes('maSoLo')) {
          rules.push({
            pattern: /^[A-Z0-9\-]{3,20}$/,
            message: 'Mã lô phải có 3-20 ký tự (chữ hoa, số, dấu gạch ngang)!'
          });
        }

        // Tên giống vật nuôi
        if (field.name.includes('tenGiong')) {
          rules.push({
            pattern: /^[a-zA-ZÀ-ỹ0-9\s\-]{2,50}$/,
            message: 'Tên giống phải từ 2-50 ký tự (chữ, số, dấu gạch ngang)!'
          });
        }

        // Ký hiệu thức ăn/thuốc
        if (field.name.includes('kyHieu')) {
          rules.push({
            pattern: /^[A-Z0-9\-]{2,15}$/,
            message: 'Ký hiệu phải có 2-15 ký tự (chữ hoa, số, dấu gạch ngang)!'
          });
        }

        // Liều lượng thuốc
        if (field.name.includes('lieuLuong')) {
          rules.push({
            pattern: /^[\d\.,\s]+(ml|mg|g|kg|lít|lọ|viên|cc)[\s\/]*(con|kg|lần)*$/i,
            message: 'Liều lượng phải có đơn vị (ml, mg, g, kg, lít, lọ, viên, cc) và có thể kèm /con, /kg, /lần!'
          });
        }

        // Giới hạn độ dài cho các trường khác nhau
        if (field.name.includes('tenCoSo') || field.name.includes('hoTen')) {
          rules.push({
            min: 2,
            max: 100,
            message: 'Tên phải từ 2-100 ký tự!'
          });
        }

        if (field.name.includes('diaChi')) {
          rules.push({
            min: 10,
            max: 200,
            message: 'Địa chỉ phải từ 10-200 ký tự!'
          });
        }

        // Tên thuốc/vaccin
        if (field.name.includes('tenVaccin') || field.name.includes('tenThuoc')) {
          rules.push({
            min: 3,
            max: 80,
            message: 'Tên thuốc/vaccin phải từ 3-80 ký tự!'
          });
        }

        break;

      case 'number':
        rules.push({
          type: 'number',
          min: 0,
          transform: (value) => value ? Number(value) : value,
          message: 'Giá trị phải là số dương!'
        });

        // === VALIDATION ĐẶC BIỆT CHO CHĂN NUÔI ===

        // Số lượng con vật
        if (field.name.includes('soLuongCon') || field.name === 'soLuongConMua' || field.name === 'soLuongConSuDung' || field.name === 'soLuongConDieuTri') {
          rules.push({
            type: 'number',
            min: 1,
            max: 50000,
            message: 'Số lượng con phải từ 1 đến 50,000 con!'
          });
        }

        // === VALIDATION ĐẶC BIỆT CHO TRỒNG NẤM ===

        // Mật độ túi phôi nấm (/m²)
        if (field.name.includes('matDo') && field.label.toLowerCase().includes('m²')) {
          rules.push({
            type: 'number',
            min: 10,
            max: 200,
            message: 'Mật độ túi phôi nấm phải từ 10-200 túi/m²!'
          });
        }

        // Tổng túi phôi (bịch)
        if (field.name.includes('tongTuiPhoi')) {
          rules.push({
            type: 'number',
            min: 100,
            max: 100000,
            message: 'Tổng túi phôi phải từ 100 đến 100,000 bịch!'
          });
        }

        // Nhiệt độ nuôi cấy nấm (°C)
        if (field.name.includes('nhietDo')) {
          rules.push({
            type: 'number',
            min: 15,
            max: 35,
            message: 'Nhiệt độ nuôi cấy nấm phải từ 15-35°C!'
          });
        }

        // Độ ẩm nuôi cấy nấm (%)
        if (field.name.includes('doAm')) {
          rules.push({
            type: 'number',
            min: 60,
            max: 95,
            message: 'Độ ẩm nuôi cấy nấm phải từ 60-95%!'
          });
        }

        // Sản lượng nấm (kg)
        if (field.name.includes('sanLuong') || field.name.includes('soLuongBan')) {
          rules.push({
            type: 'number',
            min: 0.1,
            max: 10000,
            message: 'Sản lượng nấm phải từ 0.1 đến 10,000 kg!'
          });
        }

        // === VALIDATION ĐẶC BIỆT CHO LÚA HỮU CƠ ===

        // Diện tích canh tác (m²)
        if (field.name.includes('dienTichCanhTac')) {
          rules.push({
            type: 'number',
            min: 100,
            max: 1000000,
            message: 'Diện tích canh tác phải từ 100m² đến 100ha (1,000,000m²)!'
          });
        }

        // Năm sản xuất
        if (field.name.includes('namSanXuat')) {
          const currentYear = new Date().getFullYear();
          rules.push({
            type: 'number',
            min: currentYear - 1,
            max: currentYear + 1,
            message: `Năm sản xuất phải từ ${currentYear - 1} đến ${currentYear + 1}!`
          });
        }

        // Số lượng giống (kg)
        if (field.name.includes('soLuongKg') && field.label.toLowerCase().includes('giống')) {
          rules.push({
            type: 'number',
            min: 1,
            max: 1000,
            message: 'Số lượng giống phải từ 1-1000 kg!'
          });
        }

        // Liều lượng phân bón (kg/ha)
        if (field.name.includes('lieuLuongKgHa')) {
          rules.push({
            type: 'number',
            min: 10,
            max: 2000,
            message: 'Liều lượng phải từ 10-2000 kg/ha!'
          });
        }

        // Sản lượng lúa (kg)
        if (field.name.includes('sanLuong') && field.label.toLowerCase().includes('sản lượng')) {
          rules.push({
            type: 'number',
            min: 10,
            max: 100000,
            message: 'Sản lượng phải từ 10-100,000 kg!'
          });
        }

        // Tổng lượng sử dụng (kg)
        if (field.name.includes('tongLuongSuDung')) {
          rules.push({
            type: 'number',
            min: 0.1,
            max: 10000,
            message: 'Tổng lượng sử dụng phải từ 0.1-10,000 kg!'
          });
        }

        // === VALIDATION ĐẶC BIỆT CHO BÒ THỊT ===

        // Khối lượng bò (kg)
        if (field.name.includes('khoiLuong') || field.name.includes('tongKhoiLuong')) {
          rules.push({
            type: 'number',
            min: 30,
            max: 1000,
            message: 'Khối lượng bò phải từ 30-1000 kg!'
          });
        }

        // Số lượng bò (con)
        if (field.name.includes('soLuongCon') && field.label.toLowerCase().includes('bò')) {
          rules.push({
            type: 'number',
            min: 1,
            max: 1000,
            message: 'Số lượng bò phải từ 1-1000 con!'
          });
        }

        // Tỷ lệ phối trộn thức ăn (%)
        if (field.name.includes('PhanTram')) {
          rules.push({
            type: 'number',
            min: 0,
            max: 100,
            message: 'Tỷ lệ phối trộn phải từ 0-100%!'
          });
        }

        // Lượng thức ăn bò (kg)
        if (field.name.includes('luongThucAn') || (field.name.includes('soLuongKg') && field.label.toLowerCase().includes('thức ăn'))) {
          rules.push({
            type: 'number',
            min: 0.1,
            max: 100,
            message: 'Lượng thức ăn phải từ 0.1-100 kg!'
          });
        }

        // Đơn giá thức ăn (đồng/kg)
        if (field.name.includes('donGia')) {
          rules.push({
            type: 'number',
            min: 1000,
            max: 100000,
            message: 'Đơn giá phải từ 1,000-100,000 đồng/kg!'
          });
        }

        // === VALIDATION ĐẶC BIỆT CHO GIA CẦM ===

        // Mật độ nuôi gà (con/m²)
        if (field.name.includes('matDoNuoi')) {
          rules.push({
            type: 'number',
            min: 5,
            max: 15,
            message: 'Mật độ nuôi gà phải từ 5-15 con/m² để đảm bảo sức khỏe!'
          });
        }

        // Trọng lượng gà theo tuổi
        if (field.name.includes('trongLuongTrungBinh')) {
          rules.push({
            type: 'number',
            min: 0.01,
            max: 4.0,
            message: 'Trọng lượng gà phải từ 0.01 đến 4.0 kg!'
          });
        }

        // Ngày tuổi gà
        if (field.name.includes('ngayTuoi') || field.name.includes('ngayTuoiThu')) {
          rules.push({
            type: 'number',
            min: 1,
            max: 70,
            message: 'Ngày tuổi gà phải từ 1 đến 70 ngày!'
          });
        }

        // Tuần tuổi gà
        if (field.name.includes('tuanTuoi')) {
          rules.push({
            type: 'number',
            min: 1,
            max: 10,
            message: 'Tuần tuổi gà phải từ 1 đến 10 tuần!'
          });
        }

        // Lượng thức ăn gà (kg/con/ngày)
        if (field.name.includes('luongSuDung') || field.name.includes('khoiLuongThucAn')) {
          rules.push({
            type: 'number',
            min: 0.01,
            max: 0.25,
            message: 'Lượng thức ăn gà phải từ 0.01 đến 0.25 kg/con/ngày!'
          });
        }

        // Tỷ lệ phối trộn thức ăn (%)
        if (field.name.includes('tyLePhoiTron')) {
          rules.push({
            type: 'number',
            min: 0.1,
            max: 100,
            message: 'Tỷ lệ phối trộn phải từ 0.1% đến 100%!'
          });
        }

        // Diện tích chuồng gà
        if (field.name.includes('dienTichChuong') || field.name.includes('dienTichToanBo')) {
          rules.push({
            type: 'number',
            min: 1,
            max: 50000,
            message: 'Diện tích phải từ 1 đến 50,000 m²!'
          });
        }

        // Số lượng chết/loại thải
        if (field.name.includes('soLuongChet') || field.name.includes('soLuongLoaiThai')) {
          rules.push({
            type: 'number',
            min: 0,
            max: 10000,
            message: 'Số lượng chết/loại thải phải từ 0 đến 10,000 con!'
          });
        }

        // === VALIDATION ĐẶC BIỆT CHO NUÔI TRỒNG THỦY SẢN ===

        // Mật độ thả tôm (con/m²)
        if (field.name.includes('matDoTha')) {
          rules.push({
            type: 'number',
            min: 1,
            max: 200,
            message: 'Mật độ thả tôm phải từ 1 đến 200 con/m²!'
          });
        }

        // Cỡ tôm (gram)
        if (field.name.includes('coTom')) {
          rules.push({
            type: 'number',
            min: 0.01,
            max: 100,
            message: 'Cỡ tôm phải từ 0.01 đến 100 gram!'
          });
        }

        // Độ sâu ao (m)
        if (field.name.includes('doSau')) {
          rules.push({
            type: 'number',
            min: 0.5,
            max: 10,
            message: 'Độ sâu ao phải từ 0.5 đến 10 mét!'
          });
        }

        // Diện tích ao (ha)
        if (field.name.includes('dienTichAo')) {
          rules.push({
            type: 'number',
            min: 0.01,
            max: 100,
            message: 'Diện tích ao phải từ 0.01 đến 100 ha!'
          });
        }

        // Tổng lượng giống thả (kg)
        if (field.name.includes('tongLuongGiongTha')) {
          rules.push({
            type: 'number',
            min: 0.1,
            max: 10000,
            message: 'Tổng lượng giống thả phải từ 0.1 đến 10,000 kg!'
          });
        }

        // Khối lượng bùn thải (m³)
        if (field.name.includes('khoiLuongBunThai')) {
          rules.push({
            type: 'number',
            min: 0.1,
            max: 100000,
            message: 'Khối lượng bùn thải phải từ 0.1 đến 100,000 m³!'
          });
        }

        // Trọng lượng tôm (g)
        if (field.name.includes('trongLuongTom')) {
          rules.push({
            type: 'number',
            min: 0.1,
            max: 100,
            message: 'Trọng lượng tôm phải từ 0.1 đến 100 gram!'
          });
        }

        // Độ đạm thức ăn (%)
        if (field.name.includes('doDamThucAn')) {
          rules.push({
            type: 'number',
            min: 10,
            max: 60,
            message: 'Độ đạm thức ăn phải từ 10% đến 60%!'
          });
        }

        // Thay nước (m³)
        if (field.name.includes('thayNuocM3')) {
          rules.push({
            type: 'number',
            min: 0,
            max: 100000,
            message: 'Lượng nước thay phải từ 0 đến 100,000 m³!'
          });
        }

        // === VALIDATION CHỈ SỐ CHẤT LƯỢNG NƯỚC ===

        // Độ mặn (‰)
        if (field.name.includes('doMan')) {
          rules.push({
            type: 'number',
            min: 0,
            max: 40,
            message: 'Độ mặn phải từ 0 đến 40‰!'
          });
        }

        // Độ trong (cm)
        if (field.name.includes('doTrong')) {
          rules.push({
            type: 'number',
            min: 10,
            max: 200,
            message: 'Độ trong phải từ 10 đến 200 cm!'
          });
        }

        // Nhiệt độ (°C)
        if (field.name.includes('nhietDo')) {
          rules.push({
            type: 'number',
            min: 15,
            max: 40,
            message: 'Nhiệt độ nước phải từ 15°C đến 40°C!'
          });
        }

        // pH
        if (field.name === 'pH' || field.name.includes('pH')) {
          rules.push({
            type: 'number',
            min: 6.0,
            max: 9.0,
            message: 'pH phải từ 6.0 đến 9.0!'
          });
        }

        // Oxy (mg/l)
        if (field.name.includes('oxy') || field.name.includes('Oxy')) {
          rules.push({
            type: 'number',
            min: 3.0,
            max: 15.0,
            message: 'Oxy phải từ 3.0 đến 15.0 mg/l!'
          });
        }

        // Độ kiềm (mg/l)
        if (field.name.includes('doKem')) {
          rules.push({
            type: 'number',
            min: 50,
            max: 300,
            message: 'Độ kiềm phải từ 50 đến 300 mg/l!'
          });
        }

        // NH3 (mg/l)
        if (field.name.includes('nh3') || field.name.includes('NH3')) {
          rules.push({
            type: 'number',
            min: 0,
            max: 1.0,
            message: 'NH3 phải từ 0 đến 1.0 mg/l!'
          });
        }

        // H2S (mg/l)
        if (field.name.includes('h2s') || field.name.includes('H2S')) {
          rules.push({
            type: 'number',
            min: 0,
            max: 0.1,
            message: 'H2S phải từ 0 đến 0.1 mg/l!'
          });
        }

        // NO2 (mg/l)
        if (field.name.includes('no2') || field.name.includes('NO2')) {
          rules.push({
            type: 'number',
            min: 0,
            max: 1.0,
            message: 'NO2 phải từ 0 đến 1.0 mg/l!'
          });
        }

        // Thời gian cách ly (ngày)
        if (field.name.includes('thoiGianCachLy')) {
          rules.push({
            type: 'number',
            min: 0,
            max: 30,
            message: 'Thời gian cách ly phải từ 0 đến 30 ngày!'
          });
        }

        // Tôm chết (con)
        if (field.name.includes('tomChet')) {
          rules.push({
            type: 'number',
            min: 0,
            max: 50000,
            message: 'Số tôm chết phải từ 0 đến 50,000 con!'
          });
        }

        // Số lượng chết/loại thải
        if (field.name.includes('soLuongChet') || field.name.includes('soLuongLoaiThai')) {
          rules.push({
            type: 'number',
            min: 0,
            max: 10000,
            message: 'Số lượng chết/loại thải phải từ 0 đến 10,000 con!'
          });
        }

        // Trọng lượng trung bình (kg/con)
        if (field.name.includes('trongLuongTrungBinh')) {
          rules.push({
            type: 'number',
            min: 0.1,
            max: 500,
            message: 'Trọng lượng trung bình phải từ 0.1 đến 500 kg/con!'
          });
        }

        // Mật độ nuôi (con/m²)
        if (field.name.includes('matDoNuoi')) {
          rules.push({
            type: 'number',
            min: 0.1,
            max: 50,
            message: 'Mật độ nuôi phải từ 0.1 đến 50 con/m²!'
          });
        }

        // Diện tích chuồng nuôi
        if (field.name.includes('dienTichChuong') || field.name.includes('dienTichToanBo')) {
          rules.push({
            type: 'number',
            min: 1,
            max: 100000,
            message: 'Diện tích phải từ 1 đến 100,000 m²!'
          });
        }

        // Ngày tuổi vật nuôi
        if (field.name.includes('ngayTuoi') || field.name.includes('ngayTuoiThu')) {
          rules.push({
            type: 'number',
            min: 1,
            max: 3650, // 10 năm
            message: 'Ngày tuổi phải từ 1 đến 3,650 ngày!'
          });
        }

        // Tuần tuổi
        if (field.name.includes('tuanTuoi')) {
          rules.push({
            type: 'number',
            min: 1,
            max: 520, // 10 năm
            message: 'Tuần tuổi phải từ 1 đến 520 tuần!'
          });
        }

        // Tỷ lệ phối trộn thức ăn (%)
        if (field.name.includes('tyLePhoiTron')) {
          rules.push({
            type: 'number',
            min: 0.1,
            max: 100,
            message: 'Tỷ lệ phối trộn phải từ 0.1% đến 100%!'
          });
        }

        // Lượng thức ăn (kg)
        if (field.name.includes('luongSuDung') || field.name.includes('khoiLuongThucAn')) {
          rules.push({
            type: 'number',
            min: 0.01,
            max: 100000,
            message: 'Lượng thức ăn phải từ 0.01 đến 100,000 kg!'
          });
        }

        // Số lượng thức ăn/thuốc nhập kho
        if (field.name.includes('soLuongThucAn') || field.name.includes('soLuongThuoc')) {
          rules.push({
            type: 'number',
            min: 0.1,
            max: 1000000,
            message: 'Số lượng phải từ 0.1 đến 1,000,000!'
          });
        }

        // Khối lượng thu hoạch/xuất bán
        if (field.name.includes('tongKhoiLuong')) {
          rules.push({
            type: 'number',
            min: 0.1,
            max: 1000000,
            message: 'Khối lượng phải từ 0.1 đến 1,000,000 kg!'
          });
        }

        // Số bao/thùng chứa rác thải
        if (field.name.includes('soBaoThung')) {
          rules.push({
            type: 'number',
            min: 1,
            max: 10000,
            message: 'Số bao/thùng phải từ 1 đến 10,000!'
          });
        }

        // Kết quả diệt chuột
        if (field.name.includes('ketQuaCon')) {
          rules.push({
            type: 'number',
            min: 0,
            max: 1000,
            message: 'Kết quả diệt hại phải từ 0 đến 1,000 con!'
          });
        }

        // --- KIỂM TRA TỒN KHO VẬT TƯ ---
        if (field.label.toLowerCase().includes('số lượng') || field.name.toLowerCase().includes('soluong') || field.label.toLowerCase().includes('lượng bón')) {
          rules.push({
            validator: (_, value) => {
              if (value === undefined || value === null || value === '' || !inventory) return Promise.resolve();

              const tableData = form.getFieldValue(tableName);
              if (!tableData) return Promise.resolve();

              // Tìm field vật tư trong cùng bảng này
              const supplyFieldName = schema.tables.find(t => t.tableName === tableName)
                ?.fields.find(f =>
                  f.label.toLowerCase().includes('phân bón') ||
                  f.label.toLowerCase().includes('thuốc') ||
                  f.label.toLowerCase().includes('vật tư') ||
                  f.label.toLowerCase().includes('giống') ||
                  f.label.toLowerCase().includes('thức ăn')
                )?.name;

              const selectedSupplyId = tableData[supplyFieldName];
              if (!selectedSupplyId) return Promise.resolve();

              const item = inventory.find(i => i._id === selectedSupplyId);

              // Debug logging
              console.log('Validating Stock:', {
                field: field.label,
                enteredValue: value,
                stockId: selectedSupplyId,
                stockValue: item?.quantity,
                isGreater: Number(value) > Number(item?.quantity)
              });

              if (item && Number(value) > Number(item.quantity)) {
                return Promise.reject(new Error(`Số lượng vượt quá tồn kho (${item.quantity} ${item.unit})!`));
              }

              return Promise.resolve();
            }
          });
        }

        break;

      case 'date':
        // Validation cho ngày tháng
        if (field.name.includes('hanSuDung')) {
          rules.push({
            validator: (_, value) => {
              if (!value) return Promise.resolve();
              const today = new Date();
              const selectedDate = new Date(value);
              if (selectedDate <= today) {
                return Promise.reject(new Error('Hạn sử dụng phải sau ngày hôm nay!'));
              }
              return Promise.resolve();
            }
          });
        }

        // Ngày nhập giống/bắt đầu chăn nuôi
        if (field.name.includes('ngayNhapGiong') || field.name.includes('thoiGianBatDau')) {
          rules.push({
            validator: (_, value) => {
              if (!value) return Promise.resolve();
              const today = new Date();
              const selectedDate = new Date(value);
              const twoYearsAgo = new Date(today.getFullYear() - 2, today.getMonth(), today.getDate());
              const oneYearLater = new Date(today.getFullYear() + 1, today.getMonth(), today.getDate());

              if (selectedDate < twoYearsAgo || selectedDate > oneYearLater) {
                return Promise.reject(new Error('Ngày phải trong khoảng 2 năm trước đến 1 năm sau!'));
              }
              return Promise.resolve();
            }
          });
        }

        // Ngày thu hoạch/xuất bán
        if (field.name.includes('ngayThuHoach')) {
          rules.push({
            validator: (_, value) => {
              if (!value) return Promise.resolve();
              const today = new Date();
              const selectedDate = new Date(value);
              const oneYearAgo = new Date(today.getFullYear() - 1, today.getMonth(), today.getDate());
              const sixMonthsLater = new Date(today.getFullYear(), today.getMonth() + 6, today.getDate());

              if (selectedDate < oneYearAgo || selectedDate > sixMonthsLater) {
                return Promise.reject(new Error('Ngày thu hoạch phải trong khoảng 1 năm trước đến 6 tháng sau!'));
              }
              return Promise.resolve();
            }
          });
        }

        // Ngày tiêm phòng/điều trị
        if (field.name.includes('ngayTiem') || field.name.includes('ngayThangThucHien')) {
          rules.push({
            validator: (_, value) => {
              if (!value) return Promise.resolve();
              const today = new Date();
              const selectedDate = new Date(value);
              const sixMonthsAgo = new Date(today.getFullYear(), today.getMonth() - 6, today.getDate());
              const oneMonthLater = new Date(today.getFullYear(), today.getMonth() + 1, today.getDate());

              if (selectedDate < sixMonthsAgo || selectedDate > oneMonthLater) {
                return Promise.reject(new Error('Ngày tiêm/điều trị phải trong khoảng 6 tháng trước đến 1 tháng sau!'));
              }
              return Promise.resolve();
            }
          });
        }

        break;

      case 'select':
        // Select không cần validation đặc biệt vì đã giới hạn options
        break;
    }

    return rules;
  };

  // --- LOAD DATA ---
  useEffect(() => {
    if (journalData && schema) {
      console.log('Loading journal data:', journalData.entries);
      const rawEntries = journalData.entries || {};
      // Tạo một bản sao sâu (deep copy) để tránh thay đổi trực tiếp rawEntries
      const convertedEntries = JSON.parse(JSON.stringify(rawEntries));

      // Duyệt qua schema để tìm và convert các trường ngày tháng sang dayjs và trường số sang Number
      if (schema.tables) {
        schema.tables.forEach(table => {
          const tableName = table.tableName;
          if (convertedEntries[tableName]) {
            table.fields.forEach(field => {
              if (field.type === 'date' && convertedEntries[tableName][field.name]) {
                convertedEntries[tableName][field.name] = dayjs(convertedEntries[tableName][field.name]);
              }
              if (field.type === 'number' && convertedEntries[tableName][field.name] !== undefined && convertedEntries[tableName][field.name] !== null && convertedEntries[tableName][field.name] !== '') {
                convertedEntries[tableName][field.name] = Number(convertedEntries[tableName][field.name]);
              }
            });
          }
        });
      }

      // Convert các trường ngày tháng ở cấp độ ngoài (phẳng) nếu có
      if (convertedEntries['Ngày bắt đầu']) {
        convertedEntries['Ngày bắt đầu'] = dayjs(convertedEntries['Ngày bắt đầu']);
      }

      form.setFieldsValue(convertedEntries);
    } else if (!isEditing && user && schema) {
      // Tự động điền thông tin từ Profile cho sổ mới
      const autoFillData = {};
      schema.tables.forEach(table => {
        const tableName = table.tableName;
        autoFillData[tableName] = {};
        table.fields.forEach(field => {
          const lowerLabel = field.label.toLowerCase();
          if (lowerLabel.includes('chủ hộ') || lowerLabel.includes('họ tên')) {
            autoFillData[tableName][field.name] = user.fullname || user.username;
          }
          if (lowerLabel.includes('địa chỉ')) {
            autoFillData[tableName][field.name] = user.address || '';
          }
        });
      });
      form.setFieldsValue(autoFillData);
    }
  }, [journalData, schema, form, user, isEditing]);

  const onFinish = async (formData) => {
    try {
      setSubmitting(true);

      // Xử lý trừ kho tự động
      const consumePromises = [];
      for (const tableName in formData) {
        const tableData = formData[tableName];
        if (!tableData || typeof tableData !== 'object') continue;

        for (const fieldName in tableData) {
          const value = tableData[fieldName];
          if (!value) continue;

          // Kiểm tra xem đây có phải là field số lượng không
          const field = schema.tables.find(t => t.tableName === tableName)
            ?.fields.find(f => f.name === fieldName);

          if (field && (field.label.toLowerCase().includes('số lượng') || field.label.toLowerCase().includes('lượng bón') || field.label.toLowerCase().includes('lượng dùng'))) {
            // Tìm field vật tư tương ứng trong cùng bảng
            const supplyFieldName = schema.tables.find(t => t.tableName === tableName)
              ?.fields.find(f =>
                f.label.toLowerCase().includes('phân bón') ||
                f.label.toLowerCase().includes('thuốc') ||
                f.label.toLowerCase().includes('vật tư') ||
                f.label.toLowerCase().includes('giống') ||
                f.label.toLowerCase().includes('thức ăn')
              )?.name;

            const selectedSupplyId = tableData[supplyFieldName];
            if (selectedSupplyId) {
              const invItem = inventory?.find(item => item._id === selectedSupplyId);
              if (invItem) {
                // Tính toán độ lệch khi Sửa (Edit)
                let quantityToDeduct = Number(value);
                let noteText = `Trừ kho tự động từ sổ: ${schema.name}`;

                if (isEditing && journalData?.entries && journalData.entries[tableName]) {
                  const oldTableData = journalData.entries[tableName];
                  const oldSupplyId = oldTableData[supplyFieldName];
                  const oldQuantity = Number(oldTableData[fieldName]) || 0;

                  if (oldSupplyId === selectedSupplyId) {
                    // Cùng 1 vật tư, chỉ trừ phần chênh lệch (nếu số lượng tăng lên) hoặc cộng lại (nếu số lượng giảm xuống)
                    quantityToDeduct = Number(value) - oldQuantity;
                    if (quantityToDeduct < 0) {
                      noteText = `Hoàn trả kho tự động (do sửa giảm số lượng) từ sổ: ${schema.name}`;
                    } else if (quantityToDeduct > 0) {
                      noteText = `Trừ kho bổ sung (do sửa tăng số lượng) từ sổ: ${schema.name}`;
                    }
                  }
                }

                if (quantityToDeduct !== 0) {
                  consumePromises.push(
                    InventoryService.consumeStock({
                      itemId: invItem._id,
                      quantity: quantityToDeduct,
                      note: noteText,
                      journalId: id
                    }).catch(err => {
                      console.error('Lỗi trừ kho:', err);
                      message.warning(`Không thể cập nhật kho cho ${invItem.name}: ${err.response?.data?.message || 'Lỗi chưa xác định'}`);
                    })
                  );
                }
              }
            }
          }
        }
      }

      await Promise.all(consumePromises);

      if (isEditing) {
        await api.put(`/journals/${id}`, { entries: formData });
        message.success('Cập nhật nhật ký thành công!');
      } else {
        await JournalService.createJournal({ schemaId, entries: formData });
        message.success('Tạo nhật ký mới thành công!');
      }

      queryClient.invalidateQueries(['journals']);
      queryClient.invalidateQueries(['farmer-inventory']); // Khớp đúng key để làm mới kho ngay lập tức
      navigate(-1);
    } catch (error) {
      console.error('Save error:', error);
      message.error(error.response?.data?.message || 'Có lỗi xảy ra khi lưu nhật ký');
    } finally {
      setSubmitting(false);
    }
  };

  const [activeTab, setActiveTab] = useState("0");

  // Fetch farmer inventory
  const { data: inventory } = useQuery({
    queryKey: ['farmer-inventory'],
    queryFn: () => InventoryService.getInventory().then(res => res.data.data),
    enabled: !!user && user.role?.toUpperCase() === 'FARMER'
  });

  const getInventoryOptions = (fieldLabel) => {
    if (!inventory) return [];
    const label = fieldLabel.toLowerCase();

    // Phân loại vật tư dựa trên nhãn trường
    let category = '';
    if (label.includes('phân bón')) category = 'Phân bón';
    else if (label.includes('thuốc')) category = 'Thuốc BVTV';
    else if (label.includes('giống')) category = 'Giống';
    else if (label.includes('thức ăn')) category = 'Thức ăn';

    if (category) {
      return inventory.filter(item => item.category === category || !item.category);
    }
    return inventory;
  };

  useEffect(() => {
    if (activeSchemaId) {
      const savedTab = localStorage.getItem(`journal_tab_${activeSchemaId}`);
      if (savedTab) setActiveTab(savedTab);
    }
  }, [activeSchemaId]);

  const handleTabChange = (key) => {
    setActiveTab(key);
    if (activeSchemaId) {
      localStorage.setItem(`journal_tab_${activeSchemaId}`, key);
    }
  };

  if (schemaLoading || (isEditing && journalLoading)) return <Skeleton active />;
  if (!schema) return <div>Schema not found</div>;

  const tabItems = schema.tables.map((table, idx) => ({
    key: idx.toString(),
    label: <span className="font-semibold">{table.tableName}</span>,
    children: (
      <Card className="shadow-sm rounded-2xl border-gray-100">
        <div className="flex justify-between items-center mb-6 border-b border-gray-100 pb-4">
          <Title level={5} className="!mb-0 text-green-700">{table.tableName}</Title>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
          {table.fields.map((field) => (
            <div key={field.name}>
              <Form.Item
                name={[table.tableName, field.name]}
                label={
                  <Space>
                    <span className="font-medium text-gray-700">{field.label}</span>
                    {field.type === 'text' && (
                      <VoiceInput
                        targetField={field.label}
                        onSpeechEnd={(text) => handleVoiceInput(table.tableName, field.name, text)}
                      />
                    )}
                  </Space>
                }
                rules={getValidationRules(field, table.tableName)}
                className="mb-4"
              >
                {field.type === 'text' && (
                  (() => {
                    const options = getInventoryOptions(field.label);
                    const isSupplyField = field.label.toLowerCase().includes('phân bón') ||
                      field.label.toLowerCase().includes('thuốc') ||
                      field.label.toLowerCase().includes('vật tư') ||
                      field.label.toLowerCase().includes('giống') ||
                      field.label.toLowerCase().includes('thức ăn');

                    if (isSupplyField && options.length > 0) {
                      return (
                        <Select
                          size="large"
                          className="rounded-xl border-gray-200"
                          placeholder={`Chọn ${field.label.toLowerCase()} từ kho`}
                          showSearch
                          allowClear
                          onChange={(value) => {
                            // Tìm vật tư để lấy đơn vị nếu có trường đơn vị tương ứng
                            const selected = options.find(o => o._id === value);
                            if (selected) {
                              // Tự động tìm trường đơn vị trong cùng bảng
                              const unitFieldName = table.fields.find(f =>
                                f.label.toLowerCase().includes('đơn vị') ||
                                f.name.toLowerCase().includes('donvi')
                              )?.name;
                              if (unitFieldName) {
                                form.setFieldValue([table.tableName, unitFieldName], selected.unit);
                              }
                            }
                          }}
                        >
                          {options.map(item => (
                            <Option key={item._id} value={item._id}>
                              <div className="flex justify-between items-center w-full">
                                <span>{item.name}</span>
                                <Tag color={item.quantity > 0 ? 'green' : 'red'} className="m-0 text-[10px]">
                                  Kho: {item.quantity} {item.unit}
                                </Tag>
                              </div>
                            </Option>
                          ))}
                        </Select>
                      );
                    }
                    return (
                      <Input
                        size="large"
                        className="rounded-xl border-gray-200"
                        placeholder={`Nhập ${field.label.toLowerCase()}`}
                        maxLength={field.name.includes('diaChi') ? 200 : field.name.includes('tenCoSo') || field.name.includes('hoTen') ? 100 : 50}
                        showCount={field.name.includes('diaChi') || field.name.includes('tenCoSo') || field.name.includes('hoTen')}
                      />
                    );
                  })()
                )}
                {field.type === 'number' && (
                  <InputNumber
                    size="large"
                    className="w-full rounded-xl border-gray-200"
                    placeholder={`Nhập ${field.label.toLowerCase()}`}
                    min={0}
                    max={field.name.includes('dienTich') ? 1000000 : field.name.includes('namSanXuat') ? new Date().getFullYear() + 2 : undefined}
                    formatter={field.name.includes('dienTich') ? (value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',') : undefined}
                    parser={field.name.includes('dienTich') ? (value) => {
                      const parsed = value.replace(/\$\s?|(,*)/g, '');
                      return parsed ? Number(parsed) : '';
                    } : undefined}
                  />
                )}
                {field.type === 'date' && (
                  <DatePicker
                    size="large"
                    className="w-full rounded-xl border-gray-200"
                    placeholder={`Chọn ${field.label.toLowerCase()}`}
                    format="DD/MM/YYYY"
                    disabledDate={field.name.includes('hanSuDung') ? (current) => current && current < new Date() : undefined}
                  />
                )}
                {field.type === 'select' && (
                  <Select
                    size="large"
                    className="rounded-xl border-gray-200"
                    placeholder={`Chọn ${field.label.toLowerCase()}`}
                    allowClear
                    showSearch
                    optionFilterProp="children"
                  >
                    {field.options?.map((opt) => (
                      <Option value={opt} key={opt}>{opt}</Option>
                    ))}
                  </Select>
                )}
              </Form.Item>
            </div>
          ))}
        </div>
      </Card>
    )
  }));

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Sticky top bar */}
      <div className="flex justify-between items-center bg-white p-4 rounded-2xl shadow-sm border border-green-100 sticky top-0 z-10">
        <div>
          <Title level={3} className="!mb-0 text-gray-800 flex items-center gap-2">
            {isEditing ? 'Sổ nhật ký:' : 'Tạo sổ nhật ký mới:'} <span className="text-green-600">{schema.name}</span>
          </Title>
          <p className="text-gray-500 mt-1 mb-0">{schema.description}</p>
        </div>
        <div className="flex gap-2">
          <Button size="large" onClick={() => {
            // Quay lại trang danh sách dựa trên URL hiện tại
            const pathParts = location.pathname.split('/');
            const listPath = `/${pathParts[1]}/${pathParts[2]}`;
            navigate(listPath);
          }} className="rounded-xl">← Quay lại</Button>
          {!isReadOnly && (
            <Button type="primary" size="large" onClick={() => form.submit()} loading={saveMutation.isPending} className="rounded-xl bg-green-600 font-bold px-8">
              Lưu nhật ký
            </Button>
          )}
        </div>
      </div>

      {isReadOnly && (
        <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-2xl flex items-center gap-3">
          <span className="text-2xl">⚠️</span>
          <div>
            <h4 className="text-yellow-800 font-bold m-0">Nhật ký chỉ xem</h4>
            <p className="text-yellow-700 m-0 text-sm">
              {user?.role?.toUpperCase() !== 'FARMER'
                ? 'Bạn đang xem nhật ký với quyền quản lý. Không thể chỉnh sửa dữ liệu của nông dân.'
                : `Nhật ký này đang ở trạng thái ${journalData.status === 'Verified' ? 'Đã duyệt' : 'Chờ duyệt'} và không thể chỉnh sửa.`
              }
            </p>
          </div>
        </div>
      )}

      <Form
        form={form}
        layout="vertical"
        disabled={isReadOnly}
        onFinish={async (values) => {
          console.log('📝 Form onFinish triggered with values:', values);

          // Xử lý trừ tồn kho nếu có sử dụng vật tư
          if (user?.role?.toUpperCase() === 'FARMER' && inventory) {
            try {
              for (const tableName in values) {
                if (tableName === 'status') continue;
                const tableData = values[tableName];

                // Tìm các trường vật tư và số lượng trong bảng này
                for (const fieldName in tableData) {
                  const fieldValue = tableData[fieldName];
                  if (!fieldValue) continue;

                  // Tìm vật tư trong kho khớp với tên đã chọn
                  const inventoryItem = inventory.find(item => item.name === fieldValue);

                  if (inventoryItem) {
                    // Tìm trường số lượng tương ứng trong bảng này
                    const quantityField = schema.tables.find(t => t.tableName === tableName)
                      ?.fields.find(f => f.label.toLowerCase().includes('số lượng') || f.name.toLowerCase().includes('soluong'))?.name;

                    const usageQty = tableData[quantityField];

                    if (usageQty && Number(usageQty) > 0) {
                      await InventoryService.consumeStock({
                        itemId: inventoryItem._id,
                        quantity: Number(usageQty),
                        note: `Sử dụng cho nhật ký: ${schema.name} - Bảng: ${tableName}`,
                        journalId: isEditing ? id : 'Mới'
                      });
                    }
                  }
                }
              }
            } catch (error) {
              console.error('Lỗi khi trừ tồn kho:', error);
              message.warning('Nhật ký đã lưu nhưng có lỗi khi cập nhật tồn kho vật tư.');
            }
          }

          saveMutation.mutate(values);
        }}
        preserve={true}
        onValuesChange={(changedValues, allValues) => {
          console.log('🔄 Form values changed:', changedValues);
          console.log('📊 All form values:', allValues);
        }}
      >
        {/* ===== TÀI LIỆU ĐÍNH KÈM ===== */}
        <Card className="rounded-[28px] border border-blue-200 bg-blue-50/30 shadow-sm">
          <Title level={5} className="text-blue-700 !mb-6 border-b border-blue-200 pb-3 flex items-center gap-2">
            📎 Tài liệu đính kèm
          </Title>
          <Upload.Dragger
            {...uploadProps}
            className="bg-white"
            style={{ padding: '20px', border: '2px dashed #93c5fd', borderRadius: '16px' }}
          >
            <div className="flex flex-col items-center justify-center py-4">
              <InboxOutlined className="text-blue-400 text-5xl mb-3" />
              <p className="text-gray-700 font-semibold mb-1">Tải sơ đồ lên tại đây</p>
              <p className="text-gray-500 text-sm mb-2">
                Nhấp hoặc kéo tệp vào khu vực này để tải lên
              </p>
              <p className="text-xs text-gray-400">
                Hỗ trợ: PDF, Word, Excel, Hình ảnh (tối đa 10MB/file)
              </p>
            </div>
          </Upload.Dragger>
        </Card>

        {/* ===== TABS VietGAP ===== */}
        <Tabs
          activeKey={activeTab}
          onChange={handleTabChange}
          type="card"
          className="premium-tabs"
          items={tabItems}
        />

        {/* ===== TRẠNG THÁI ===== */}
        <Card className="mt-6 rounded-2xl shadow-sm border border-gray-100 bg-white">
          <div className="w-1/2">
            <Form.Item name="status" label="Trạng thái hồ sơ" initialValue="Draft" className="mb-0">
              <Select size="large" className="rounded-xl">
                <Option value="Assigned" disabled>Mới được phân công (Chờ ghi chép)</Option>
                <Option value="Draft">Đang thực hiện (Lưu nháp)</Option>
                <Option value="Submitted">Hoàn tất (Gửi duyệt)</Option>
                <Option value="Revision Requested" disabled>Đang bị trả về (Yêu cầu sửa lại)</Option>
                <Option value="Verified" disabled>Đã được duyệt (Thành công)</Option>
              </Select>
            </Form.Item>
          </div>
        </Card>
      </Form>

      {/* Image Preview Modal */}
      <Modal
        open={previewOpen}
        title={previewTitle}
        footer={null}
        onCancel={() => setPreviewOpen(false)}
        centered
        width={800}
      >
        <Image
          alt="preview"
          style={{ width: '100%' }}
          src={previewImage}
          preview={false}
        />
      </Modal>
    </div>
  );
};

export default JournalEntry;