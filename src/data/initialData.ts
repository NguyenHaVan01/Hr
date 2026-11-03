import { Department, Employee, AttendanceSheet, Bonus } from '../types';

export const INITIAL_DEPARTMENTS: Department[] = [
  {
    id: 'PB01',
    code: 'TECH',
    name: 'Phòng Công Nghệ & Phần Mềm',
    description: 'Nghiên cứu, phát triển hệ thống và ứng dụng công nghệ thông tin',
  },
  {
    id: 'PB02',
    code: 'SALES',
    name: 'Phòng Kinh Doanh & Dự Án',
    description: 'Phát triển khách hàng, mở rộng thị trường và quản lý hợp đồng',
  },
  {
    id: 'PB03',
    code: 'MKT',
    name: 'Phòng Marketing & Thương Hiệu',
    description: 'Truyền thông số, xây dựng thương hiệu và tổ chức sự kiện',
  },
  {
    id: 'PB04',
    code: 'HR',
    name: 'Phòng Hành Chính & Nhân Sự',
    description: 'Quản trị nhân lực, tiền lương, chế độ chính sách và tuyển dụng',
  },
  {
    id: 'PB05',
    code: 'FIN',
    name: 'Phòng Tài Chính & Kế Toán',
    description: 'Quản lý thu chi, lập báo cáo tài chính và tuân thủ nghĩa vụ thuế',
  },
];

export const INITIAL_EMPLOYEES: Employee[] = [
  {
    id: 'NV001',
    fullName: 'Nguyễn Văn An',
    email: 'an.nguyen@congty.com',
    phone: '0912 345 678',
    gender: 'Nam',
    birthDate: '1992-05-14',
    idCard: '001092004521',
    departmentId: 'PB01',
    position: 'Trưởng nhóm Kỹ thuật (Lead Dev)',
    baseSalary: 28_000_000,
    dependents: 1,
    startDate: '2021-03-15',
    status: 'active',
  },
  {
    id: 'NV002',
    fullName: 'Trần Thị Mai',
    email: 'mai.tran@congty.com',
    phone: '0988 765 432',
    gender: 'Nữ',
    birthDate: '1995-10-22',
    idCard: '001195007832',
    departmentId: 'PB01',
    position: 'Kỹ sư Phần mềm Senior',
    baseSalary: 22_000_000,
    dependents: 0,
    startDate: '2022-06-01',
    status: 'active',
  },
  {
    id: 'NV003',
    fullName: 'Lê Hoàng Long',
    email: 'long.le@congty.com',
    phone: '0903 112 233',
    gender: 'Nam',
    birthDate: '1997-02-18',
    idCard: '079097008912',
    departmentId: 'PB01',
    position: 'Lập trình viên Frontend',
    baseSalary: 16_000_000,
    dependents: 0,
    startDate: '2023-01-10',
    status: 'active',
  },
  {
    id: 'NV004',
    fullName: 'Phạm Minh Tuấn',
    email: 'tuan.pham@congty.com',
    phone: '0934 556 789',
    gender: 'Nam',
    birthDate: '1990-08-30',
    idCard: '001090001243',
    departmentId: 'PB02',
    position: 'Trưởng phòng Kinh doanh',
    baseSalary: 32_000_000,
    dependents: 2,
    startDate: '2020-09-01',
    status: 'active',
  },
  {
    id: 'NV005',
    fullName: 'Đỗ Thùy Linh',
    email: 'linh.do@congty.com',
    phone: '0977 889 900',
    gender: 'Nữ',
    birthDate: '1998-12-05',
    idCard: '038198003421',
    departmentId: 'PB02',
    position: 'Chuyên viên Kinh doanh B2B',
    baseSalary: 14_000_000,
    dependents: 0,
    startDate: '2023-08-15',
    status: 'active',
  },
  {
    id: 'NV006',
    fullName: 'Vũ Thị Ngọc Ánh',
    email: 'anh.vu@congty.com',
    phone: '0945 678 123',
    gender: 'Nữ',
    birthDate: '1994-04-12',
    idCard: '001194006541',
    departmentId: 'PB03',
    position: 'Trưởng nhóm Marketing',
    baseSalary: 20_000_000,
    dependents: 1,
    startDate: '2022-02-20',
    status: 'active',
  },
  {
    id: 'NV007',
    fullName: 'Hoàng Quốc Bảo',
    email: 'bao.hoang@congty.com',
    phone: '0918 223 344',
    gender: 'Nam',
    birthDate: '1996-07-25',
    idCard: '079096005612',
    departmentId: 'PB04',
    position: 'Chuyên viên Nhân sự & C&B',
    baseSalary: 15_000_000,
    dependents: 0,
    startDate: '2022-11-01',
    status: 'active',
  },
  {
    id: 'NV008',
    fullName: 'Bùi Thị Thanh Hằng',
    email: 'hang.bui@congty.com',
    phone: '0966 332 211',
    gender: 'Nữ',
    birthDate: '1991-11-19',
    idCard: '001191009876',
    departmentId: 'PB05',
    position: 'Kế toán trưởng',
    baseSalary: 26_000_000,
    dependents: 1,
    startDate: '2020-04-15',
    status: 'active',
  },
];

// Tạo bảng chấm công mẫu cho tháng 11/2026 (hoặc tháng hiện tại)
export function generateInitialAttendance(monthStr: string = '2026-11'): Record<string, AttendanceSheet> {
  const [year, month] = monthStr.split('-').map(Number);
  const daysInMonth = new Date(year, month, 0).getDate();
  const sheets: Record<string, AttendanceSheet> = {};

  INITIAL_EMPLOYEES.forEach((emp, index) => {
    const days: AttendanceSheet['days'] = {};

    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${monthStr}-${String(day).padStart(2, '0')}`;
      const d = new Date(year, month - 1, day);
      const dayOfWeek = d.getDay(); // 0: Sun, 6: Sat
      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

      if (isWeekend) {
        // Cuối tuần: đa số nghỉ, thỉnh thoảng có người OT thứ 7
        const specialOT = index === 0 && day === 7; // NV001 OT ngày thứ 7
        days[dateStr] = {
          status: specialOT ? 'present' : 'absent',
          hasOT: specialOT,
          note: specialOT ? 'Hỗ trợ trực server cuối tuần' : undefined,
        };
      } else {
        // Ngày trong tuần:
        // Mô phỏng: Một số người đi làm đủ, một số có nghỉ 1-2 ngày
        const isAbsent = (index === 2 && day === 12) || (index === 4 && (day === 5 || day === 6));
        // Một số người có OT
        let hasOT = false;
        if (!isAbsent) {
          if (index === 0 && (day === 3 || day === 10 || day === 17)) hasOT = true; // 3 lần OT
          if (index === 1 && (day === 4 || day === 11)) hasOT = true; // 2 lần OT
          if (index === 3 && day === 18) hasOT = true; // 1 lần OT
          if (index === 6 && (day === 9 || day === 16 || day === 23)) hasOT = true; // 3 lần OT
          // NV002, NV005, NV007, NV008: một số có 0 lần OT để test case phụ cấp 2tr
        }

        days[dateStr] = {
          status: isAbsent ? 'absent' : 'present',
          hasOT,
          note: hasOT ? 'Tăng ca hoàn thành sprint / chốt báo cáo' : (isAbsent ? 'Nghỉ phép có đơn' : undefined),
        };
      }
    }

    sheets[emp.id] = {
      employeeId: emp.id,
      month: monthStr,
      days,
    };
  });

  return sheets;
}

export const INITIAL_BONUSES: Bonus[] = [
  {
    id: 'BN001',
    employeeId: 'NV001',
    amount: 3_000_000,
    reason: 'Thưởng hoàn thành xuất sắc dự án nâng cấp hệ thống ERP',
    date: '2026-11-20',
    month: '2026-11',
  },
  {
    id: 'BN002',
    employeeId: 'NV004',
    amount: 5_000_000,
    reason: 'Thưởng vượt 150% chỉ tiêu doanh số kinh doanh tháng',
    date: '2026-11-25',
    month: '2026-11',
  },
  {
    id: 'BN003',
    employeeId: 'NV008',
    amount: 2_000_000,
    reason: 'Thưởng hoàn thành quyết toán kiểm toán nội bộ kịp thời hạn',
    date: '2026-11-15',
    month: '2026-11',
  },
];
