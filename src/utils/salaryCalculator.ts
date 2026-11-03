import { Employee, Department, AttendanceSheet, Bonus, SalaryBreakdown } from '../types';

/**
 * Biểu thuế lũy tiến từng phần Thuế Thu Nhập Cá Nhân (TNCN) tại Việt Nam
 */
export function calculateVietnamesePIT(taxableIncome: number): number {
  if (taxableIncome <= 0) return 0;

  // Đơn vị VNĐ
  if (taxableIncome <= 5_000_000) {
    return taxableIncome * 0.05;
  } else if (taxableIncome <= 10_000_000) {
    return taxableIncome * 0.10 - 250_000;
  } else if (taxableIncome <= 18_000_000) {
    return taxableIncome * 0.15 - 750_000;
  } else if (taxableIncome <= 32_000_000) {
    return taxableIncome * 0.20 - 1_650_000;
  } else if (taxableIncome <= 52_000_000) {
    return taxableIncome * 0.25 - 3_250_000;
  } else if (taxableIncome <= 80_000_000) {
    return taxableIncome * 0.30 - 5_850_000;
  } else {
    return taxableIncome * 0.35 - 9_850_000;
  }
}

/**
 * Tính số ngày làm việc tiêu chuẩn (Standard working days) trong tháng (Thứ 2 - Thứ 6)
 */
export function getStandardWorkDaysInMonth(year: number, month: number): number {
  // month: 1 - 12
  const daysInMonth = new Date(year, month, 0).getDate();
  let workdays = 0;
  for (let day = 1; day <= daysInMonth; day++) {
    const d = new Date(year, month - 1, day);
    const dayOfWeek = d.getDay();
    // 0: Chủ nhật, 6: Thứ 7
    if (dayOfWeek !== 0 && dayOfWeek !== 6) {
      workdays++;
    }
  }
  return workdays > 0 ? workdays : 22;
}

/**
 * Tính lương chi tiết cho 1 nhân viên trong tháng
 */
export function calculateEmployeeSalary(
  employee: Employee,
  department: Department | undefined,
  attendanceSheet: AttendanceSheet | undefined,
  bonuses: Bonus[],
  monthStr: string // YYYY-MM
): SalaryBreakdown {
  const [year, month] = monthStr.split('-').map(Number);
  const standardDays = getStandardWorkDaysInMonth(year, month);

  // Tính số ngày đi làm và số lần OT từ bảng chấm công
  let workedDays = 0;
  let otCount = 0;

  if (attendanceSheet && attendanceSheet.days) {
    Object.values(attendanceSheet.days).forEach(day => {
      if (day.status === 'present') {
        workedDays++;
      }
      if (day.hasOT) {
        otCount++;
      }
    });
  }

  // 1. Lương cơ bản theo ngày công:
  // Lương ngày chuẩn = Lương cơ bản hợp đồng / standardDays
  const contractBaseSalary = employee.baseSalary || 0;
  const dailyRate = standardDays > 0 ? contractBaseSalary / standardDays : 0;
  const actualBaseSalary = Math.round(dailyRate * workedDays);

  // 2. Phụ cấp theo yêu cầu:
  // "không OT thì 2 tr, OT thì 3 tr"
  const allowance = otCount === 0 ? 2_000_000 : 3_000_000;

  // 3. Tiền OT theo yêu cầu:
  // "tính OT 500k/ 1 lần OT"
  const otPay = otCount * 500_000;

  // 4. Tiền thưởng thêm do Admin chỉ định cho tháng này
  const bonusPay = bonuses
    .filter(b => b.employeeId === employee.id && b.month === monthStr)
    .reduce((sum, b) => sum + (b.amount || 0), 0);

  // 5. Tổng thu nhập (Gross Income)
  const grossIncome = actualBaseSalary + allowance + otPay + bonusPay;

  // 6. Bảo hiểm xã hội bắt buộc:
  // Chuẩn VN là 10.5% (BHXH 8% + BHYT 1.5% + BHTN 1%) tính trên mức lương hợp đồng đóng bảo hiểm
  const insuranceRate = 0.105;
  // Giảm trừ BHXH theo luật tính trên mức lương đóng BHXH (ở đây lấy min của contractBaseSalary và lương cơ bản thực tế)
  const insurableSalary = Math.min(contractBaseSalary, actualBaseSalary);
  const insuranceDeduction = Math.round(insurableSalary * insuranceRate);

  // 7. Giảm trừ gia cảnh:
  // Bản thân: 11.000.000 VNĐ / tháng
  // Người phụ thuộc: 4.400.000 VNĐ / người / tháng
  const personalDeduction = 11_000_000;
  const dependentDeduction = (employee.dependents || 0) * 4_400_000;
  const totalDeductions = personalDeduction + dependentDeduction;

  // Thu nhập chịu thuế = Gross - BHXH
  const assessableIncome = Math.max(0, grossIncome - insuranceDeduction);
  // Thu nhập tính thuế = Thu nhập chịu thuế - Tổng giảm trừ
  const taxableIncome = Math.max(0, assessableIncome - totalDeductions);

  // 8. Thuế thu nhập cá nhân (Thuế TNCN)
  const personalIncomeTax = Math.round(calculateVietnamesePIT(taxableIncome));

  // 9. Lương thực lĩnh (Net Salary)
  const netSalary = Math.max(0, grossIncome - insuranceDeduction - personalIncomeTax);

  // 10. Tiêu chuẩn đánh giá nhân viên xuất sắc:
  // Đi làm đầy đủ (workedDays >= 20 ngày), có cống hiến OT (otCount >= 2) hoặc có thưởng
  const isOutstanding = workedDays >= 20 && otCount >= 2;

  return {
    employeeId: employee.id,
    employeeName: employee.fullName,
    employeeCode: employee.id,
    departmentName: department ? department.name : 'Chưa phân bổ',
    position: employee.position,
    month: monthStr,
    standardDays,
    workedDays,
    otCount,
    contractBaseSalary,
    dailyRate: Math.round(dailyRate),
    actualBaseSalary,
    allowance,
    otPay,
    bonusPay,
    grossIncome,
    insuranceRate,
    insuranceDeduction,
    personalDeduction,
    dependentDeduction,
    taxableIncome,
    personalIncomeTax,
    netSalary,
    isOutstanding,
  };
}

/**
 * Định dạng tiền tệ VNĐ chuẩn Việt Nam
 */
export function formatVND(amount: number): string {
  if (isNaN(amount) || amount === null || amount === undefined) return '0 ₫';
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Định dạng số nguyên
 */
export function formatNumber(num: number): string {
  return new Intl.NumberFormat('vi-VN').format(num);
}

/**
 * Đọc số tiền thành chữ Tiếng Việt cho phiếu lương chính thức
 */
export function numberToVietnameseWords(amount: number): string {
  if (amount <= 0) return 'Không đồng';

  const units = ['', ' nghìn', ' triệu', ' tỷ', ' nghìn tỷ', ' triệu tỷ'];
  const digits = ['không', 'một', 'hai', 'ba', 'bốn', 'năm', 'sáu', 'bảy', 'tám', 'chín'];

  function readThreeDigits(n: number, full: boolean): string {
    let hundred = Math.floor(n / 100);
    let remainder = n % 100;
    let ten = Math.floor(remainder / 10);
    let unit = remainder % 10;
    let res = '';

    if (full || hundred > 0) {
      res += digits[hundred] + ' trăm ';
      if (ten === 0 && unit > 0) res += 'lẻ ';
    }

    if (ten > 0) {
      if (ten === 1) res += 'mười ';
      else res += digits[ten] + ' mươi ';
    }

    if (unit > 0) {
      if (ten > 1 && unit === 1) res += 'mốt ';
      else if (ten > 0 && unit === 5) res += 'lăm ';
      else res += digits[unit] + ' ';
    }

    return res.trim();
  }

  let strNum = Math.floor(amount).toString();
  let groups: number[] = [];
  while (strNum.length > 0) {
    groups.push(parseInt(strNum.slice(-3), 10));
    strNum = strNum.slice(0, -3);
  }

  let text = '';
  for (let i = groups.length - 1; i >= 0; i--) {
    let groupVal = groups[i];
    if (groupVal > 0) {
      let isFull = i < groups.length - 1;
      let groupStr = readThreeDigits(groupVal, isFull);
      text += groupStr + units[i] + ' ';
    }
  }

  text = text.trim();
  if (!text) return 'Không đồng';

  // Viết hoa chữ cái đầu và thêm đuôi 'đồng chẵn'
  return text.charAt(0).toUpperCase() + text.slice(1) + ' đồng chẵn.';
}
