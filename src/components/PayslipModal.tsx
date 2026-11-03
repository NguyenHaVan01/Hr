import React, { useState } from 'react';
import { SalaryBreakdown, Employee, Department, Bonus } from '../types';
import { formatVND, formatNumber, numberToVietnameseWords } from '../utils/salaryCalculator';
import { X, Printer, FileDown, FileText, CheckCircle2, Info, Building } from 'lucide-react';

interface PayslipModalProps {
  isOpen: boolean;
  onClose: () => void;
  salary: SalaryBreakdown | null;
  employee: Employee | null;
  department: Department | null;
  bonuses: Bonus[];
}

export const PayslipModal: React.FC<PayslipModalProps> = ({
  isOpen,
  onClose,
  salary,
  employee,
  department,
  bonuses,
}) => {
  const [showPdfHint, setShowPdfHint] = useState(false);

  if (!isOpen || !salary || !employee) return null;

  const sanitizeFilename = (str: string) => {
    return str
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/đ/g, 'd')
      .replace(/Đ/g, 'D')
      .replace(/[^a-zA-Z0-9_-]/g, '_');
  };

  const handleExportPDF = () => {
    // Đặt document.title trước khi print để trình duyệt tự động đặt tên file PDF tải về
    const prevTitle = document.title;
    const cleanName = sanitizeFilename(salary.employeeName);
    const pdfFileName = `Phieu_Luong_${salary.month}_${salary.employeeCode}_${cleanName}`;
    document.title = pdfFileName;

    // Kích hoạt hộp thoại in / lưu PDF của trình duyệt
    window.print();

    // Khôi phục title gốc sau khi in
    setTimeout(() => {
      document.title = prevTitle;
    }, 1500);
  };

  const relevantBonuses = bonuses.filter(
    (b) => b.employeeId === employee.id && b.month === salary.month
  );

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 print-modal-backdrop">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl overflow-hidden border border-slate-200 print-modal-card">
        {/* Header toolbar (Ẩn hoàn toàn khi in bằng CSS no-print) */}
        <div className="flex flex-col border-b border-slate-200 bg-slate-50 no-print">
          <div className="flex items-center justify-between px-6 py-4">
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-blue-600" />
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Phiếu Lương Chi Tiết - {salary.employeeName}
                </h3>
                <p className="text-xs text-slate-500">
                  Kỳ lương Tháng {salary.month.split('-')[1]}/{salary.month.split('-')[0]}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {/* Nút Xuất PDF trực tiếp thông qua trình duyệt */}
              <button
                onClick={handleExportPDF}
                className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 transition-colors shadow-xs"
                title="Lưu trang phiếu lương thành file PDF"
              >
                <FileDown className="w-4 h-4" />
                <span>Xuất Bảng Lương Ra PDF</span>
              </button>

              {/* Nút In qua máy in */}
              <button
                onClick={handleExportPDF}
                className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-100 transition-colors shadow-xs"
                title="In trực tiếp"
              >
                <Printer className="w-4 h-4 text-slate-500" />
                <span className="hidden sm:inline">In Phiếu</span>
              </button>

              <button
                onClick={onClose}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-200/50"
                title="Đóng"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Gợi ý lưu PDF nhanh cho người dùng */}
          <div className="px-6 py-2 bg-blue-50/80 border-t border-blue-100 flex items-center justify-between text-[11px] text-blue-800">
            <div className="flex items-center gap-1.5">
              <Info className="w-3.5 h-3.5 text-blue-600 shrink-0" />
              <span>
                <strong>Hướng dẫn lưu PDF:</strong> Khi hộp thoại in của trình duyệt hiện ra, tại mục <strong>Máy in (Destination)</strong> hãy chọn <strong>"Lưu dưới dạng PDF" (Save as PDF)</strong> để tải file về máy.
              </span>
            </div>
          </div>
        </div>

        {/* Printable Content Body (Được tối ưu cho khổ giấy A4) */}
        <div className="p-8 font-sans print-document-content text-slate-900">
          {/* Header công ty & Tiêu đề văn bản */}
          <div className="border-b-2 border-slate-900 pb-4 mb-5">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight uppercase">
                  CÔNG TY CỔ PHẦN CÔNG NGHỆ & ĐẦU TƯ
                </h2>
                <p className="text-xs text-slate-600">
                  Địa chỉ: Tòa nhà Innovation, 180 Nguyễn Thị Minh Khai, Q.3, TP.HCM
                </p>
                <p className="text-xs text-slate-600">
                  Mã số thuế: 0102938475 · Hotline: 1900 6868
                </p>
              </div>
              <div className="text-right">
                <span className="text-xs font-mono font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded print:border print:border-slate-300">
                  Số: PL-{salary.month.replace('-', '')}-{salary.employeeCode}
                </span>
                <p className="text-xs text-slate-500 mt-1">
                  Kỳ lương: <strong>Tháng {salary.month.split('-')[1]}/{salary.month.split('-')[0]}</strong>
                </p>
                <p className="text-[11px] text-slate-400">
                  Ngày lập: {new Date().toLocaleDateString('vi-VN')}
                </p>
              </div>
            </div>

            <div className="text-center mt-5">
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 uppercase tracking-wide">
                PHIẾU THANH TOÁN TIỀN LƯƠNG
              </h1>
              <p className="text-xs text-slate-600 italic mt-0.5">
                (Kèm theo Bảng tổng hợp chấm công & chi trả lương tháng {salary.month.split('-')[1]}/{salary.month.split('-')[0]})
              </p>
            </div>
          </div>

          {/* Thông tin nhân viên */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs mb-5 print:bg-slate-50/50 print-avoid-break">
            <div>
              <span className="text-slate-500 block">Họ và tên nhân viên:</span>
              <strong className="text-slate-900 text-sm font-bold">{salary.employeeName}</strong>
            </div>
            <div>
              <span className="text-slate-500 block">Mã nhân viên:</span>
              <strong className="text-slate-900 font-mono text-sm font-bold">{salary.employeeCode}</strong>
            </div>
            <div>
              <span className="text-slate-500 block">Phòng ban:</span>
              <strong className="text-slate-900">{department?.name || salary.departmentName}</strong>
            </div>
            <div>
              <span className="text-slate-500 block">Chức vụ:</span>
              <strong className="text-slate-900">{salary.position}</strong>
            </div>

            <div>
              <span className="text-slate-500 block">Số ngày công chuẩn:</span>
              <strong className="text-slate-900 font-mono font-semibold">{salary.standardDays} ngày</strong>
            </div>
            <div>
              <span className="text-slate-500 block">Số ngày đi làm thực tế:</span>
              <strong className="text-blue-700 font-mono font-bold text-sm">
                {salary.workedDays} ngày
              </strong>
            </div>
            <div>
              <span className="text-slate-500 block">Số ca tăng ca (OT):</span>
              <strong className="text-purple-700 font-mono font-bold text-sm">
                {salary.otCount} lần (+{formatVND(salary.otPay)})
              </strong>
            </div>
            <div>
              <span className="text-slate-500 block">Số người phụ thuộc (TNCN):</span>
              <strong className="text-slate-900 font-mono font-semibold">{employee.dependents} người</strong>
            </div>
          </div>

          {/* Bảng chi tiết lương chuẩn kế toán */}
          <div className="border border-slate-300 rounded-xl overflow-hidden mb-5 print-avoid-break">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-100 text-slate-800 font-bold border-b border-slate-300">
                <tr>
                  <th className="py-2.5 px-3 w-10 text-center border-r border-slate-200">STT</th>
                  <th className="py-2.5 px-4 border-r border-slate-200">Khoản Mục Chi Trả / Khấu Trừ</th>
                  <th className="py-2.5 px-4 text-center border-r border-slate-200">Căn Cứ / Công Thức Áp Dụng</th>
                  <th className="py-2.5 px-4 text-right">Số Tiền (VNĐ)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {/* Phần I: Các khoản thu nhập */}
                <tr className="bg-blue-50/50 font-bold text-slate-900">
                  <td className="py-2 px-3 text-center border-r border-slate-200">I</td>
                  <td colSpan={2} className="py-2 px-4 uppercase text-[11px] tracking-wider text-blue-950 border-r border-slate-200">
                    CÁC KHOẢN THU NHẬP (TỔNG THU NHẬP TRƯỚC THUẾ - GROSS)
                  </td>
                  <td className="py-2 px-4 text-right font-mono font-bold text-blue-800">
                    {formatVND(salary.grossIncome)}
                  </td>
                </tr>

                <tr>
                  <td className="py-2 px-3 text-center text-slate-500 border-r border-slate-200">1</td>
                  <td className="py-2 px-4 font-medium text-slate-800 border-r border-slate-200">
                    Lương cơ bản theo ngày công làm việc
                    <div className="text-[11px] text-slate-500 font-normal">
                      Mức lương thỏa thuận HĐLĐ: {formatVND(salary.contractBaseSalary)}
                    </div>
                  </td>
                  <td className="py-2 px-4 text-center font-mono text-slate-600 border-r border-slate-200">
                    ({formatVND(salary.contractBaseSalary).replace(' ₫', '')} / {salary.standardDays}) × {salary.workedDays} ngày công
                  </td>
                  <td className="py-2 px-4 text-right font-mono font-semibold text-slate-900">
                    {formatVND(salary.actualBaseSalary)}
                  </td>
                </tr>

                <tr>
                  <td className="py-2 px-3 text-center text-slate-500 border-r border-slate-200">2</td>
                  <td className="py-2 px-4 font-medium text-slate-800 border-r border-slate-200">
                    Phụ cấp tháng
                    <div className="text-[11px] text-slate-500 font-normal">
                      Quy định: Không OT = 2.000.000 ₫; Có OT = 3.000.000 ₫
                    </div>
                  </td>
                  <td className="py-2 px-4 text-center text-slate-600 border-r border-slate-200">
                    {salary.otCount > 0 ? 'Có OT trong tháng (Hưởng mức 3.000.000 ₫)' : 'Không có OT (Hưởng mức 2.000.000 ₫)'}
                  </td>
                  <td className="py-2 px-4 text-right font-mono font-semibold text-slate-900">
                    {formatVND(salary.allowance)}
                  </td>
                </tr>

                <tr>
                  <td className="py-2 px-3 text-center text-slate-500 border-r border-slate-200">3</td>
                  <td className="py-2 px-4 font-medium text-slate-800 border-r border-slate-200">
                    Tiền tăng ca (Lương làm thêm giờ OT)
                    <div className="text-[11px] text-slate-500 font-normal">
                      Đơn giá tính theo quy định: 500.000 ₫ / 1 lần OT
                    </div>
                  </td>
                  <td className="py-2 px-4 text-center font-mono text-slate-600 border-r border-slate-200">
                    {salary.otCount} lần OT × 500.000 ₫/lần
                  </td>
                  <td className="py-2 px-4 text-right font-mono font-semibold text-purple-700">
                    {formatVND(salary.otPay)}
                  </td>
                </tr>

                <tr>
                  <td className="py-2 px-3 text-center text-slate-500 border-r border-slate-200">4</td>
                  <td className="py-2 px-4 font-medium text-slate-800 border-r border-slate-200">
                    Tiền khen thưởng hiệu suất & dự án
                    {relevantBonuses.length > 0 && (
                      <div className="text-[11px] text-amber-700 italic mt-0.5">
                        {relevantBonuses.map((b) => `• ${b.reason}`).join(' ')}
                      </div>
                    )}
                  </td>
                  <td className="py-2 px-4 text-center text-slate-600 border-r border-slate-200">
                    {relevantBonuses.length > 0 ? `${relevantBonuses.length} quyết định khen thưởng` : 'Không có'}
                  </td>
                  <td className="py-2 px-4 text-right font-mono font-semibold text-amber-700">
                    {formatVND(salary.bonusPay)}
                  </td>
                </tr>

                {/* Phần II: Các khoản giảm trừ */}
                <tr className="bg-rose-50/50 font-bold text-slate-900">
                  <td className="py-2 px-3 text-center border-r border-slate-200">II</td>
                  <td colSpan={2} className="py-2 px-4 uppercase text-[11px] tracking-wider text-rose-950 border-r border-slate-200">
                    CÁC KHOẢN GIẢM TRỪ VÀO LƯƠNG
                  </td>
                  <td className="py-2 px-4 text-right font-mono font-bold text-rose-700">
                    -{formatVND(salary.insuranceDeduction + salary.personalIncomeTax)}
                  </td>
                </tr>

                <tr>
                  <td className="py-2 px-3 text-center text-slate-500 border-r border-slate-200">1</td>
                  <td className="py-2 px-4 font-medium text-slate-800 border-r border-slate-200">
                    Bảo hiểm xã hội bắt buộc (BHXH, BHYT, BHTN)
                    <div className="text-[11px] text-slate-500 font-normal">
                      Tỷ lệ khấu trừ người lao động: 10.5% (BHXH 8%, BHYT 1.5%, BHTN 1%)
                    </div>
                  </td>
                  <td className="py-2 px-4 text-center font-mono text-slate-600 border-r border-slate-200">
                    10.5% × Lương đóng BHXH
                  </td>
                  <td className="py-2 px-4 text-right font-mono font-semibold text-rose-600">
                    -{formatVND(salary.insuranceDeduction)}
                  </td>
                </tr>

                <tr>
                  <td className="py-2 px-3 text-center text-slate-500 border-r border-slate-200">2</td>
                  <td className="py-2 px-4 font-medium text-slate-800 border-r border-slate-200">
                    Thuế Thu Nhập Cá Nhân (Thuế TNCN)
                    <div className="text-[11px] text-slate-500 font-normal">
                      Giảm trừ bản thân (11tr) + Người phụ thuộc ({formatVND(salary.dependentDeduction)})
                    </div>
                  </td>
                  <td className="py-2 px-4 text-center font-mono text-slate-600 border-r border-slate-200">
                    Biểu thuế lũy tiến từng phần 7 bậc
                  </td>
                  <td className="py-2 px-4 text-right font-mono font-semibold text-rose-600">
                    -{formatVND(salary.personalIncomeTax)}
                  </td>
                </tr>

                {/* Phần III: Thực lĩnh */}
                <tr className="bg-emerald-50 text-slate-900 border-t-2 border-emerald-600 font-bold">
                  <td className="py-3 px-3 text-center border-r border-slate-200">III</td>
                  <td className="py-3 px-4 text-sm uppercase text-emerald-950 font-black border-r border-slate-200">
                    LƯƠNG THỰC LĨNH (NET TAKE-HOME PAY)
                  </td>
                  <td className="py-3 px-4 text-center font-mono text-xs text-emerald-800 border-r border-slate-200">
                    Mục I - Mục II
                  </td>
                  <td className="py-3 px-4 text-right font-mono text-lg font-black text-emerald-700">
                    {formatVND(salary.netSalary)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Dòng số tiền bằng chữ chuẩn văn bản kế toán */}
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs mb-6 print:border-slate-300 print-avoid-break">
            <span className="font-semibold text-slate-700">Số tiền thực lĩnh bằng chữ: </span>
            <span className="font-bold text-slate-900 italic">
              {numberToVietnameseWords(salary.netSalary)}
            </span>
          </div>

          {/* Thông báo đánh giá xuất sắc nếu có */}
          {salary.isOutstanding && (
            <div className="flex items-center gap-2 p-3 bg-emerald-50 text-emerald-900 rounded-xl border border-emerald-200 text-xs mb-6 print-avoid-break">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>
                <strong>Nhân viên xuất sắc trong kỳ:</strong> Đạt tiêu chuẩn ngày công chuyên cần và tích cực tham gia tăng ca (OT).
              </span>
            </div>
          )}

          {/* Phần chữ ký 3 bên theo chuẩn chứng từ kế toán */}
          <div className="grid grid-cols-3 gap-4 text-center text-xs pt-4 mt-6 border-t border-slate-300 signature-block print-avoid-break">
            <div>
              <p className="font-bold text-slate-900 uppercase">NGƯỜI LẬP BIỂU</p>
              <p className="text-[11px] text-slate-500 italic mb-16">(Ký, họ tên)</p>
              <p className="font-semibold text-slate-800">Nguyễn Thu Thảo</p>
            </div>
            <div>
              <p className="font-bold text-slate-900 uppercase">KẾ TOÁN TRƯỞNG</p>
              <p className="text-[11px] text-slate-500 italic mb-16">(Ký, họ tên)</p>
              <p className="font-semibold text-slate-800">Bùi Thị Thanh Hằng</p>
            </div>
            <div>
              <p className="font-bold text-slate-900 uppercase">NGƯỜI LAO ĐỘNG</p>
              <p className="text-[11px] text-slate-500 italic mb-16">(Ký, xác nhận nhận lương)</p>
              <p className="font-semibold text-slate-800">{salary.employeeName}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
