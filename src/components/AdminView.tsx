import React, { useState, useMemo } from 'react';
import { Employee, Department, AttendanceSheet, Bonus, SalaryBreakdown } from '../types';
import { StatsCards } from './StatsCards';
import { formatVND, formatNumber } from '../utils/salaryCalculator';
import {
  Search,
  Filter,
  UserPlus,
  Award,
  FileSpreadsheet,
  Edit2,
  Trash2,
  Printer,
  FileDown,
  ChevronDown,
  ArrowUpDown,
  Star,
  CheckCircle2,
  Calendar,
  Zap,
} from 'lucide-react';

interface AdminViewProps {
  employees: Employee[];
  departments: Department[];
  attendanceSheets: Record<string, AttendanceSheet>;
  bonuses: Bonus[];
  salaryBreakdowns: SalaryBreakdown[];
  selectedMonth: string;
  onAddEmployee: () => void;
  onEditEmployee: (employee: Employee) => void;
  onDeleteEmployee: (employeeId: string) => void;
  onAddBonus: (preselectedEmployeeId?: string) => void;
  onDeleteBonus: (bonusId: string) => void;
  onViewPayslip: (employeeId: string) => void;
  onUpdateAttendance: (employeeId: string, date: string, status: 'present' | 'absent', hasOT: boolean) => void;
}

export const AdminView: React.FC<AdminViewProps> = ({
  employees,
  departments,
  attendanceSheets,
  bonuses,
  salaryBreakdowns,
  selectedMonth,
  onAddEmployee,
  onEditEmployee,
  onDeleteEmployee,
  onAddBonus,
  onDeleteBonus,
  onViewPayslip,
  onUpdateAttendance,
}) => {
  // Sub-tab selection
  const [activeTab, setActiveTab] = useState<'employees' | 'attendance' | 'bonuses' | 'payroll'>('employees');

  // Search & Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDeptId, setSelectedDeptId] = useState('ALL');
  const [salaryFilter, setSalaryFilter] = useState<'ALL' | 'UNDER_15' | '15_TO_25' | 'OVER_25'>('ALL');
  const [onlyOutstanding, setOnlyOutstanding] = useState(false);
  const [sortBy, setSortBy] = useState<'net_desc' | 'net_asc' | 'name' | 'code' | 'workedDays' | 'otCount'>('net_desc');

  // Days in selected month for attendance matrix
  const [yearNum, monthNum] = selectedMonth.split('-').map(Number);
  const daysInMonth = new Date(yearNum, monthNum, 0).getDate();
  const dayNumbers = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  // Filter & Sort Logic
  const filteredAndSortedSalaries = useMemo(() => {
    return salaryBreakdowns
      .filter((item) => {
        const emp = employees.find((e) => e.id === item.employeeId);
        if (!emp) return false;

        // Search match
        const term = searchTerm.toLowerCase().trim();
        const matchesSearch =
          !term ||
          emp.fullName.toLowerCase().includes(term) ||
          emp.id.toLowerCase().includes(term) ||
          emp.position.toLowerCase().includes(term);

        // Department filter
        const matchesDept = selectedDeptId === 'ALL' || emp.departmentId === selectedDeptId;

        // Salary range filter (theo Net Salary)
        let matchesSalary = true;
        if (salaryFilter === 'UNDER_15') matchesSalary = item.netSalary < 15_000_000;
        else if (salaryFilter === '15_TO_25') matchesSalary = item.netSalary >= 15_000_000 && item.netSalary <= 25_000_000;
        else if (salaryFilter === 'OVER_25') matchesSalary = item.netSalary > 25_000_000;

        // Outstanding filter
        const matchesOutstanding = !onlyOutstanding || item.isOutstanding;

        return matchesSearch && matchesDept && matchesSalary && matchesOutstanding;
      })
      .sort((a, b) => {
        if (sortBy === 'net_desc') return b.netSalary - a.netSalary;
        if (sortBy === 'net_asc') return a.netSalary - b.netSalary;
        if (sortBy === 'name') return a.employeeName.localeCompare(b.employeeName, 'vi');
        if (sortBy === 'code') return a.employeeCode.localeCompare(b.employeeCode);
        if (sortBy === 'workedDays') return b.workedDays - a.workedDays;
        if (sortBy === 'otCount') return b.otCount - a.otCount;
        return 0;
      });
  }, [salaryBreakdowns, employees, searchTerm, selectedDeptId, salaryFilter, onlyOutstanding, sortBy]);

  // Handle cell click in company-wide attendance
  const toggleAttendanceCell = (empId: string, dayNum: number) => {
    const dateStr = `${selectedMonth}-${String(dayNum).padStart(2, '0')}`;
    const sheet = attendanceSheets[empId];
    const currentDay = sheet?.days?.[dateStr];

    if (!currentDay || currentDay.status === 'absent') {
      // Vắng -> Chuyển sang Đi làm bình thường
      onUpdateAttendance(empId, dateStr, 'present', false);
    } else if (currentDay.status === 'present' && !currentDay.hasOT) {
      // Đi làm -> Chuyển sang Đi làm + OT
      onUpdateAttendance(empId, dateStr, 'present', true);
    } else {
      // Đi làm + OT -> Chuyển về Vắng
      onUpdateAttendance(empId, dateStr, 'absent', false);
    }
  };

  // Xuất bảng lương ra PDF thông qua trình duyệt
  const handleExportPayrollPDF = () => {
    const prevTitle = document.title;
    document.title = `Bang_Luong_Tong_Hop_${selectedMonth}`;
    window.print();
    setTimeout(() => {
      document.title = prevTitle;
    }, 1500);
  };

  return (
    <div className="space-y-6">
      {/* Metrics Banner */}
      <StatsCards
        salaryBreakdowns={salaryBreakdowns}
        onSelectEmployee={(empId) => onViewPayslip(empId)}
      />

      {/* Admin Action Sub-Nav */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-3 no-print">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          <button
            onClick={() => setActiveTab('employees')}
            className={`px-3.5 py-2 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
              activeTab === 'employees'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            Danh Sách Nhân Viên & Lương ({employees.length})
          </button>
          <button
            onClick={() => setActiveTab('attendance')}
            className={`px-3.5 py-2 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
              activeTab === 'attendance'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            Chấm Công Toàn Công Ty
          </button>
          <button
            onClick={() => setActiveTab('bonuses')}
            className={`px-3.5 py-2 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
              activeTab === 'bonuses'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            Quản Lý Thưởng ({bonuses.filter((b) => b.month === selectedMonth).length})
          </button>
          <button
            onClick={() => setActiveTab('payroll')}
            className={`px-3.5 py-2 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
              activeTab === 'payroll'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            Bảng Lương Tổng Hợp
          </button>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={onAddEmployee}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-blue-600 text-white text-xs font-semibold rounded-lg hover:bg-blue-700 transition-colors shadow-xs whitespace-nowrap"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Thêm Nhân Viên</span>
          </button>
          <button
            onClick={() => onAddBonus()}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-amber-600 text-white text-xs font-semibold rounded-lg hover:bg-amber-700 transition-colors shadow-xs whitespace-nowrap"
          >
            <Award className="w-3.5 h-3.5" />
            <span>Thêm Thưởng</span>
          </button>
        </div>
      </div>

      {/* TAB 1: DANH SÁCH NHÂN VIÊN & TÍNH LƯƠNG */}
      {activeTab === 'employees' && (
        <div className="space-y-4">
          {/* Filter Bar */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col lg:flex-row gap-3 justify-between items-stretch lg:items-center">
            {/* Search Input */}
            <div className="relative flex-1 min-w-[220px]">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Tìm theo Mã NV, Họ tên, Chức vụ..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            {/* Filters Row */}
            <div className="flex flex-wrap items-center gap-2">
              {/* Lọc theo phòng ban */}
              <div className="flex items-center gap-1 bg-slate-50 border border-slate-200 rounded-lg px-2 py-1">
                <Filter className="w-3.5 h-3.5 text-slate-400" />
                <select
                  value={selectedDeptId}
                  onChange={(e) => setSelectedDeptId(e.target.value)}
                  className="bg-transparent text-xs text-slate-700 focus:outline-none font-medium cursor-pointer"
                >
                  <option value="ALL">Tất cả Phòng Ban</option>
                  {departments.map((dept) => (
                    <option key={dept.id} value={dept.id}>
                      {dept.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Lọc theo mức lương */}
              <select
                value={salaryFilter}
                onChange={(e) => setSalaryFilter(e.target.value as any)}
                className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-700 font-medium focus:outline-none cursor-pointer"
              >
                <option value="ALL">Mọi mức lương</option>
                <option value="UNDER_15">Dưới 15 triệu</option>
                <option value="15_TO_25">15 - 25 triệu</option>
                <option value="OVER_25">Trên 25 triệu</option>
              </select>

              {/* Lọc nhân viên xuất sắc */}
              <button
                onClick={() => setOnlyOutstanding(!onlyOutstanding)}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border transition-colors ${
                  onlyOutstanding
                    ? 'bg-amber-50 text-amber-800 border-amber-300'
                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                }`}
              >
                <Star className={`w-3.5 h-3.5 ${onlyOutstanding ? 'fill-amber-500 text-amber-500' : 'text-slate-400'}`} />
                <span>Nhân viên xuất sắc</span>
              </button>

              {/* Sắp xếp */}
              <div className="flex items-center gap-1 bg-slate-50 border border-slate-200 rounded-lg px-2 py-1">
                <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="bg-transparent text-xs text-slate-700 font-medium focus:outline-none cursor-pointer"
                >
                  <option value="net_desc">Lương: Cao nhất trước</option>
                  <option value="net_asc">Lương: Thấp nhất trước</option>
                  <option value="name">Tên nhân viên (A-Z)</option>
                  <option value="code">Mã nhân viên</option>
                  <option value="workedDays">Ngày công làm việc</option>
                  <option value="otCount">Số ca tăng ca (OT)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Employee Table */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4">Nhân Viên</th>
                    <th className="py-3 px-3">Phòng Ban / Chức Vụ</th>
                    <th className="py-3 px-3 text-right">Lương HĐ</th>
                    <th className="py-3 px-3 text-center">Công / Chuẩn</th>
                    <th className="py-3 px-3 text-center">Tăng Ca (OT)</th>
                    <th className="py-3 px-3 text-right">Phụ Cấp</th>
                    <th className="py-3 px-3 text-right">Thưởng</th>
                    <th className="py-3 px-3 text-right">BHXH & Thuế</th>
                    <th className="py-3 px-4 text-right font-bold text-slate-900">Thực Lĩnh (Net)</th>
                    <th className="py-3 px-4 text-center">Thao Tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredAndSortedSalaries.length === 0 ? (
                    <tr>
                      <td colSpan={10} className="py-12 text-center text-slate-400">
                        Không tìm thấy nhân viên phù hợp với bộ lọc hiện tại.
                      </td>
                    </tr>
                  ) : (
                    filteredAndSortedSalaries.map((item) => {
                      const emp = employees.find((e) => e.id === item.employeeId);
                      if (!emp) return null;

                      return (
                        <tr key={item.employeeId} className="hover:bg-slate-50/80 transition-colors">
                          {/* Cột 1: Thông tin nhân viên */}
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2.5">
                              <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-slate-700 text-xs shrink-0">
                                {emp.fullName.split(' ').slice(-1)[0][0]}
                              </div>
                              <div>
                                <div className="font-semibold text-slate-900 flex items-center gap-1.5">
                                  <span>{emp.fullName}</span>
                                  {item.isOutstanding && (
                                    <span title="Nhân viên xuất sắc">
                                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400 inline" />
                                    </span>
                                  )}
                                </div>
                                <div className="text-[11px] text-slate-500 font-mono">
                                  {emp.id} · {emp.gender} · {emp.phone}
                                </div>
                              </div>
                            </div>
                          </td>

                          {/* Cột 2: Phòng ban */}
                          <td className="py-3 px-3">
                            <div className="text-slate-800 font-medium">{item.departmentName}</div>
                            <div className="text-[11px] text-slate-400">{item.position}</div>
                          </td>

                          {/* Cột 3: Lương hợp đồng */}
                          <td className="py-3 px-3 text-right font-mono text-slate-700">
                            {formatVND(item.contractBaseSalary)}
                          </td>

                          {/* Cột 4: Chấm công */}
                          <td className="py-3 px-3 text-center">
                            <span className="font-mono font-semibold text-blue-700">
                              {item.workedDays}
                            </span>
                            <span className="text-slate-400 text-[11px]">/{item.standardDays}</span>
                          </td>

                          {/* Cột 5: Tăng ca */}
                          <td className="py-3 px-3 text-center">
                            {item.otCount > 0 ? (
                              <span className="font-mono text-purple-700 font-semibold bg-purple-50 px-2 py-0.5 rounded-md">
                                {item.otCount} lần (+{formatVND(item.otPay)})
                              </span>
                            ) : (
                              <span className="text-slate-400 font-mono">0 lần</span>
                            )}
                          </td>

                          {/* Cột 6: Phụ cấp */}
                          <td className="py-3 px-3 text-right font-mono text-slate-700">
                            <span>{formatVND(item.allowance)}</span>
                            <span className="text-[10px] text-slate-400 block">
                              {item.otCount > 0 ? '(Có OT -> 3tr)' : '(K.OT -> 2tr)'}
                            </span>
                          </td>

                          {/* Cột 7: Thưởng */}
                          <td className="py-3 px-3 text-right font-mono">
                            {item.bonusPay > 0 ? (
                              <span className="text-amber-700 font-semibold">
                                +{formatVND(item.bonusPay)}
                              </span>
                            ) : (
                              <span className="text-slate-400">0 ₫</span>
                            )}
                          </td>

                          {/* Cột 8: BHXH & Thuế */}
                          <td className="py-3 px-3 text-right font-mono text-rose-600">
                            -{formatVND(item.insuranceDeduction + item.personalIncomeTax)}
                            <span className="text-[10px] text-slate-400 block">
                              BH {formatVND(item.insuranceDeduction).replace(' ₫', '')} · Thuế {formatVND(item.personalIncomeTax).replace(' ₫', '')}
                            </span>
                          </td>

                          {/* Cột 9: Thực lĩnh */}
                          <td className="py-3 px-4 text-right font-mono font-extrabold text-sm text-emerald-700">
                            {formatVND(item.netSalary)}
                          </td>

                          {/* Cột 10: Thao tác */}
                          <td className="py-3 px-4 text-center">
                            <div className="flex items-center justify-center gap-1">
                              <button
                                onClick={() => onViewPayslip(item.employeeId)}
                                className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                                title="Xem & In phiếu lương"
                              >
                                <Printer className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => onAddBonus(item.employeeId)}
                                className="p-1.5 text-amber-600 hover:bg-amber-50 rounded-md transition-colors"
                                title="Thêm thưởng cho nhân viên này"
                              >
                                <Award className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => onEditEmployee(emp)}
                                className="p-1.5 text-slate-600 hover:bg-slate-100 rounded-md transition-colors"
                                title="Sửa thông tin"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => {
                                  if (confirm(`Bạn có chắc chắn muốn xóa nhân viên ${emp.fullName} (${emp.id})?`)) {
                                    onDeleteEmployee(emp.id);
                                  }
                                }}
                                className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors"
                                title="Xóa nhân viên"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: CHẤM CÔNG TOÀN CÔNG TY (MA TRẬN LỊCH) */}
      {activeTab === 'attendance' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-blue-600" />
                Ma Trận Chấm Công Tháng {selectedMonth.split('-')[1]}/{selectedMonth.split('-')[0]}
              </h3>
              <p className="text-xs text-slate-500">
                Click trực tiếp vào ô ngày để chuyển trạng thái:{' '}
                <span className="font-semibold text-slate-700">Vắng</span> ➔{' '}
                <span className="font-semibold text-blue-700">Đi làm (8h)</span> ➔{' '}
                <span className="font-semibold text-purple-700">Đi làm + Tăng ca (OT - 500k)</span>
              </p>
            </div>
            <div className="flex items-center gap-3 text-xs">
              <div className="flex items-center gap-1.5">
                <span className="w-3.5 h-3.5 rounded-sm bg-blue-500 inline-block"></span>
                <span>Đi làm (8h)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3.5 h-3.5 rounded-sm bg-purple-600 inline-block"></span>
                <span>Tăng ca (+OT)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3.5 h-3.5 rounded-sm bg-slate-200 inline-block"></span>
                <span>Nghỉ/Vắng</span>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto border border-slate-200 rounded-lg">
            <table className="w-full text-[11px] border-collapse">
              <thead>
                <tr className="bg-slate-100 text-slate-700 border-b border-slate-200">
                  <th className="py-2 px-3 sticky left-0 bg-slate-100 z-10 text-left min-w-[160px] font-semibold">
                    Nhân Viên
                  </th>
                  <th className="py-2 px-2 text-center font-semibold text-blue-700 min-w-[45px]">Công</th>
                  <th className="py-2 px-2 text-center font-semibold text-purple-700 min-w-[45px]">OT</th>
                  {dayNumbers.map((d) => {
                    const dateObj = new Date(yearNum, monthNum - 1, d);
                    const isWeekend = dateObj.getDay() === 0 || dateObj.getDay() === 6;
                    return (
                      <th
                        key={d}
                        className={`py-1.5 px-1 text-center font-mono font-medium min-w-[28px] border-l border-slate-200 ${
                          isWeekend ? 'bg-slate-200/60 text-slate-500' : 'text-slate-800'
                        }`}
                      >
                        <div>{d}</div>
                        <div className="text-[9px] text-slate-400">
                          {['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'][dateObj.getDay()]}
                        </div>
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {employees.map((emp) => {
                  const sheet = attendanceSheets[emp.id];
                  const salary = salaryBreakdowns.find((s) => s.employeeId === emp.id);

                  return (
                    <tr key={emp.id} className="hover:bg-slate-50/60">
                      <td className="py-2 px-3 sticky left-0 bg-white z-10 border-r border-slate-200">
                        <div className="font-semibold text-slate-900 truncate">{emp.fullName}</div>
                        <div className="text-[10px] text-slate-400 font-mono">{emp.id}</div>
                      </td>
                      <td className="py-2 px-1 text-center font-mono font-bold text-blue-700 bg-blue-50/30">
                        {salary?.workedDays || 0}
                      </td>
                      <td className="py-2 px-1 text-center font-mono font-bold text-purple-700 bg-purple-50/30">
                        {salary?.otCount || 0}
                      </td>
                      {dayNumbers.map((d) => {
                        const dateStr = `${selectedMonth}-${String(d).padStart(2, '0')}`;
                        const dayData = sheet?.days?.[dateStr];
                        const isPresent = dayData?.status === 'present';
                        const hasOT = dayData?.hasOT;

                        return (
                          <td
                            key={d}
                            onClick={() => toggleAttendanceCell(emp.id, d)}
                            className="p-1 text-center border-l border-slate-100 cursor-pointer hover:opacity-80 transition-opacity"
                            title={`${emp.fullName} - Ngày ${d}: ${
                              hasOT ? 'Đi làm + Tăng ca (OT)' : isPresent ? 'Đi làm đủ' : 'Nghỉ'
                            } (Click để đổi)`}
                          >
                            <div
                              className={`w-5 h-5 mx-auto rounded flex items-center justify-center font-mono text-[10px] ${
                                hasOT
                                  ? 'bg-purple-600 text-white font-bold shadow-xs'
                                  : isPresent
                                  ? 'bg-blue-500 text-white font-semibold shadow-xs'
                                  : 'bg-slate-100 text-slate-400 hover:bg-slate-200'
                              }`}
                            >
                              {hasOT ? 'OT' : isPresent ? '✓' : '·'}
                            </div>
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: QUẢN LÝ LƯƠNG THƯỞNG (BONUS LIST) */}
      {activeTab === 'bonuses' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Danh Sách Quyết Định Khen Thưởng Tháng {selectedMonth.split('-')[1]}/{selectedMonth.split('-')[0]}
              </h3>
              <p className="text-xs text-slate-500">
                Các khoản tiền thưởng bổ sung do Admin xét duyệt trực tiếp cho nhân viên
              </p>
            </div>
            <button
              onClick={() => onAddBonus()}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-600 text-white text-xs font-semibold rounded-lg hover:bg-amber-700 transition-colors shadow-xs"
            >
              <Award className="w-3.5 h-3.5" />
              <span>Thêm Thưởng Mới</span>
            </button>
          </div>

          <div className="border border-slate-200 rounded-lg overflow-hidden">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-4">Mã QĐ</th>
                  <th className="py-2.5 px-4">Nhân Viên Nhận Thưởng</th>
                  <th className="py-2.5 px-4">Lý Do / Quyết Định</th>
                  <th className="py-2.5 px-4">Ngày Ban Hành</th>
                  <th className="py-2.5 px-4 text-right">Số Tiền (VNĐ)</th>
                  <th className="py-2.5 px-4 text-center">Thao Tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {bonuses.filter((b) => b.month === selectedMonth).length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-400">
                      Chưa có quyết định khen thưởng nào trong tháng này.
                    </td>
                  </tr>
                ) : (
                  bonuses
                    .filter((b) => b.month === selectedMonth)
                    .map((bonus) => {
                      const emp = employees.find((e) => e.id === bonus.employeeId);
                      return (
                        <tr key={bonus.id} className="hover:bg-slate-50/60">
                          <td className="py-2.5 px-4 font-mono text-slate-500">{bonus.id}</td>
                          <td className="py-2.5 px-4 font-semibold text-slate-900">
                            {emp?.fullName || bonus.employeeId}
                            <span className="text-slate-400 font-normal ml-1">({emp?.position})</span>
                          </td>
                          <td className="py-2.5 px-4 text-slate-700">{bonus.reason}</td>
                          <td className="py-2.5 px-4 font-mono text-slate-500">{bonus.date}</td>
                          <td className="py-2.5 px-4 text-right font-mono font-bold text-amber-700">
                            +{formatVND(bonus.amount)}
                          </td>
                          <td className="py-2.5 px-4 text-center">
                            <button
                              onClick={() => {
                                if (confirm('Bạn có muốn thu hồi / xóa quyết định thưởng này?')) {
                                  onDeleteBonus(bonus.id);
                                }
                              }}
                              className="text-slate-400 hover:text-rose-600 p-1 rounded"
                              title="Xóa khoản thưởng"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      );
                    })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: BẢNG LƯƠNG TỔNG HỢP (SPREADSHEET + PRINT) */}
      {activeTab === 'payroll' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                Bảng Thanh Toán Tiền Lương Toàn Doanh Nghiệp (Tháng {selectedMonth.split('-')[1]}/{selectedMonth.split('-')[0]})
              </h3>
              <p className="text-xs text-slate-500">
                Bảng lương chuẩn kế toán gồm Lương ngày công, Phụ cấp OT, Thưởng, BHXH 10.5% và Thuế TNCN
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleExportPayrollPDF}
                className="flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-600 text-white text-xs font-semibold rounded-lg hover:bg-emerald-700 transition-colors shadow-xs"
                title="Lưu bảng lương toàn doanh nghiệp thành file PDF"
              >
                <FileDown className="w-3.5 h-3.5" />
                <span>Xuất Bảng Lương Ra PDF</span>
              </button>
              <button
                onClick={handleExportPayrollPDF}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 text-white text-xs font-semibold rounded-lg hover:bg-slate-800 transition-colors shadow-xs"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>In Bảng Lương</span>
              </button>
            </div>
          </div>

          <div className="overflow-x-auto border border-slate-200 rounded-lg">
            <table className="w-full text-xs text-left border-collapse">
              <thead className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-3 text-center">STT</th>
                  <th className="py-2.5 px-3">Mã NV</th>
                  <th className="py-2.5 px-4 min-w-[140px]">Họ và Tên</th>
                  <th className="py-2.5 px-3 text-right">Lương HĐ</th>
                  <th className="py-2.5 px-2 text-center">Công</th>
                  <th className="py-2.5 px-3 text-right">Lương Cơ Bản</th>
                  <th className="py-2.5 px-3 text-right">Phụ Cấp</th>
                  <th className="py-2.5 px-2 text-center">OT (lần)</th>
                  <th className="py-2.5 px-3 text-right">Tiền OT</th>
                  <th className="py-2.5 px-3 text-right">Thưởng</th>
                  <th className="py-2.5 px-3 text-right font-semibold text-blue-800">Tổng Thu Nhập</th>
                  <th className="py-2.5 px-3 text-right text-rose-700">BHXH (10.5%)</th>
                  <th className="py-2.5 px-3 text-right text-rose-700">Thuế TNCN</th>
                  <th className="py-2.5 px-4 text-right font-bold text-emerald-800 bg-emerald-50/50">Thực Lĩnh</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono">
                {salaryBreakdowns.map((item, idx) => (
                  <tr key={item.employeeId} className="hover:bg-slate-50/70 text-[11px]">
                    <td className="py-2 px-3 text-center text-slate-400">{idx + 1}</td>
                    <td className="py-2 px-3 text-slate-600 font-semibold">{item.employeeCode}</td>
                    <td className="py-2 px-4 font-sans font-medium text-slate-900">{item.employeeName}</td>
                    <td className="py-2 px-3 text-right text-slate-700">{formatVND(item.contractBaseSalary)}</td>
                    <td className="py-2 px-2 text-center text-blue-700 font-bold">{item.workedDays}</td>
                    <td className="py-2 px-3 text-right text-slate-900">{formatVND(item.actualBaseSalary)}</td>
                    <td className="py-2 px-3 text-right text-slate-700">{formatVND(item.allowance)}</td>
                    <td className="py-2 px-2 text-center text-purple-700">{item.otCount}</td>
                    <td className="py-2 px-3 text-right text-purple-700">{formatVND(item.otPay)}</td>
                    <td className="py-2 px-3 text-right text-amber-700">{formatVND(item.bonusPay)}</td>
                    <td className="py-2 px-3 text-right font-bold text-blue-900">{formatVND(item.grossIncome)}</td>
                    <td className="py-2 px-3 text-right text-rose-600">-{formatVND(item.insuranceDeduction)}</td>
                    <td className="py-2 px-3 text-right text-rose-600">-{formatVND(item.personalIncomeTax)}</td>
                    <td className="py-2 px-4 text-right font-bold text-xs text-emerald-700 bg-emerald-50/40">
                      {formatVND(item.netSalary)}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-slate-100 font-bold text-xs border-t-2 border-slate-300">
                <tr>
                  <td colSpan={3} className="py-3 px-4 text-slate-900 uppercase">
                    TỔNG CỘNG ({salaryBreakdowns.length} nhân sự)
                  </td>
                  <td className="py-3 px-3 text-right font-mono text-slate-800">
                    {formatVND(salaryBreakdowns.reduce((acc, c) => acc + c.contractBaseSalary, 0))}
                  </td>
                  <td className="py-3 px-2 text-center font-mono text-blue-800">
                    {salaryBreakdowns.reduce((acc, c) => acc + c.workedDays, 0)}
                  </td>
                  <td className="py-3 px-3 text-right font-mono text-slate-900">
                    {formatVND(salaryBreakdowns.reduce((acc, c) => acc + c.actualBaseSalary, 0))}
                  </td>
                  <td className="py-3 px-3 text-right font-mono text-slate-800">
                    {formatVND(salaryBreakdowns.reduce((acc, c) => acc + c.allowance, 0))}
                  </td>
                  <td className="py-3 px-2 text-center font-mono text-purple-800">
                    {salaryBreakdowns.reduce((acc, c) => acc + c.otCount, 0)}
                  </td>
                  <td className="py-3 px-3 text-right font-mono text-purple-800">
                    {formatVND(salaryBreakdowns.reduce((acc, c) => acc + c.otPay, 0))}
                  </td>
                  <td className="py-3 px-3 text-right font-mono text-amber-800">
                    {formatVND(salaryBreakdowns.reduce((acc, c) => acc + c.bonusPay, 0))}
                  </td>
                  <td className="py-3 px-3 text-right font-mono text-blue-900">
                    {formatVND(salaryBreakdowns.reduce((acc, c) => acc + c.grossIncome, 0))}
                  </td>
                  <td className="py-3 px-3 text-right font-mono text-rose-700">
                    -{formatVND(salaryBreakdowns.reduce((acc, c) => acc + c.insuranceDeduction, 0))}
                  </td>
                  <td className="py-3 px-3 text-right font-mono text-rose-700">
                    -{formatVND(salaryBreakdowns.reduce((acc, c) => acc + c.personalIncomeTax, 0))}
                  </td>
                  <td className="py-3 px-4 text-right font-mono text-sm text-emerald-800 bg-emerald-100/60">
                    {formatVND(salaryBreakdowns.reduce((acc, c) => acc + c.netSalary, 0))}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
