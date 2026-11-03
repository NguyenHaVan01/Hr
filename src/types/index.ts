/**
 * Cấu trúc dữ liệu theo đề tài ĐT07:
 * Hệ thống Quản lý Nhân sự & Tiền lương Công ty
 * Struct NhanVien, Struct PhongBan, Struct ChamCong, Struct KhenThuong
 */

export interface Department {
  id: string;
  name: string;
  code: string;
  description: string;
}

export type AttendanceStatus = 'present' | 'absent' | 'leave';

export interface AttendanceDay {
  date: string; // YYYY-MM-DD
  dayOfMonth: number;
  dayOfWeek: number; // 0: Sun, 1: Mon, ...
  isWorkday: boolean; // Thứ 2 - Thứ 6 hoặc Thứ 7
  status: AttendanceStatus;
  hasOT: boolean;
  note?: string;
}

export interface AttendanceSheet {
  employeeId: string;
  month: string; // YYYY-MM
  days: Record<string, { status: AttendanceStatus; hasOT: boolean; note?: string }>;
}

export interface Bonus {
  id: string;
  employeeId: string;
  amount: number; // VNĐ
  reason: string;
  date: string; // YYYY-MM-DD
  month: string; // YYYY-MM
}

export interface Employee {
  id: string; // Mã NV (ví dụ NV001)
  fullName: string;
  email: string;
  phone: string;
  gender: 'Nam' | 'Nữ';
  birthDate: string; // YYYY-MM-DD
  idCard: string; // CCCD
  departmentId: string;
  position: string;
  baseSalary: number; // Lương cơ bản tháng (VNĐ)
  dependents: number; // Số người phụ thuộc
  startDate: string; // Ngày vào làm
  status: 'active' | 'resigned';
  avatar?: string;
}

export interface TaxBracket {
  limit: number;
  rate: number;
  quickDeduction: number;
}

export interface SalaryBreakdown {
  employeeId: string;
  employeeName: string;
  employeeCode: string;
  departmentName: string;
  position: string;
  month: string;
  
  // Công chuẩn & công thực tế
  standardDays: number; // Thường là 22 ngày làm việc trong tháng
  workedDays: number;   // Số ngày chấm công 'present'
  otCount: number;      // Số buổi / lần OT (500.000 VNĐ/lần)
  
  // Các khoản thu nhập
  contractBaseSalary: number; // Lương thỏa thuận trên HĐLĐ
  dailyRate: number;          // contractBaseSalary / standardDays
  actualBaseSalary: number;   // dailyRate * workedDays
  allowance: number;          // 2.000.000đ (nếu OT = 0) hoặc 3.000.000đ (nếu có OT >= 1)
  otPay: number;              // otCount * 500.000đ
  bonusPay: number;           // Tổng tiền thưởng trong tháng do Admin cấp
  grossIncome: number;        // actualBaseSalary + allowance + otPay + bonusPay
  
  // Các khoản giảm trừ
  insuranceRate: number;      // 10.5% (BHXH 8%, BHYT 1.5%, BHTN 1%)
  insuranceDeduction: number; // BHXH, BHYT, BHTN
  personalDeduction: number;  // 11.000.000đ
  dependentDeduction: number; // 4.400.000đ * dependents
  taxableIncome: number;      // Thu nhập tính thuế sau giảm trừ
  personalIncomeTax: number;  // Thuế TNCN phải nộp
  
  // Thực lĩnh
  netSalary: number;          // grossIncome - insuranceDeduction - personalIncomeTax
  
  // Đánh giá nhân viên xuất sắc
  isOutstanding: boolean;     // workedDays >= 22 && otCount >= 2 && bonusPay > 0 (hoặc tiêu chí cao)
}

export type ViewMode = 'admin' | 'user';
