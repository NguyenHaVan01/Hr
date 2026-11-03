import React, { useState } from 'react';
import { Employee, Department, AttendanceSheet, Bonus, SalaryBreakdown } from '../types';
import { formatVND, formatNumber } from '../utils/salaryCalculator';
import {
  Calendar,
  CheckCircle2,
  Clock,
  Printer,
  FileDown,
  Award,
  Sparkles,
  Zap,
  Info,
  ShieldCheck,
  AlertCircle,
} from 'lucide-react';

interface EmployeeViewProps {
  employee: Employee;
  department: Department | undefined;
  attendanceSheet: AttendanceSheet | undefined;
  bonuses: Bonus[];
  salary: SalaryBreakdown;
  selectedMonth: string;
  onUpdateAttendance: (date: string, status: 'present' | 'absent', hasOT: boolean, note?: string) => void;
  onViewPayslip: () => void;
}

export const EmployeeView: React.FC<EmployeeViewProps> = ({
  employee,
  department,
  attendanceSheet,
  bonuses,
  salary,
  selectedMonth,
  onUpdateAttendance,
  onViewPayslip,
}) => {
  const [yearNum, monthNum] = selectedMonth.split('-').map(Number);
  const daysInMonth = new Date(yearNum, monthNum, 0).getDate();
  const dayNumbers = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  // Today info
  const todayStr = new Date().toISOString().split('T')[0];
  const isCurrentMonth = todayStr.startsWith(selectedMonth);
  const todayData = attendanceSheet?.days?.[todayStr];

  // Quick today check-in helper
  const handleTodayCheckin = (status: 'present' | 'absent', hasOT: boolean) => {
    onUpdateAttendance(todayStr, status, hasOT);
  };

  const relevantBonuses = bonuses.filter(
    (b) => b.employeeId === employee.id && b.month === selectedMonth
  );

  return (
    <div className="space-y-6">
      {/* 1. THÔNG TIN CÁ NHÂN (USER PROFILE BANNER) */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-slate-100">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-blue-600 text-white font-bold text-2xl flex items-center justify-center shadow-md">
              {employee.fullName.split(' ').slice(-1)[0][0]}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-slate-900 tracking-tight">
                  {employee.fullName}
                </h2>
                <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-200">
                  {employee.id}
                </span>
                {salary.isOutstanding && (
                  <span className="flex items-center gap-1 text-xs font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                    Xuất Sắc
                  </span>
                )}
              </div>
              <p className="text-sm text-slate-600 mt-0.5">
                {employee.position} · {department?.name || 'Chưa phân bổ'}
              </p>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500 mt-2">
                <span>Email: {employee.email}</span>
                <span>·</span>
                <span>SĐT: {employee.phone}</span>
                <span>·</span>
                <span>CCCD: {employee.idCard}</span>
                <span>·</span>
                <span>Ngày vào làm: {employee.startDate}</span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={onViewPayslip}
              className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 text-white text-xs font-semibold rounded-lg hover:bg-emerald-700 transition-colors shadow-xs"
              title="Mở phiếu lương và lưu thành file PDF qua trình duyệt"
            >
              <FileDown className="w-4 h-4" />
              <span>Xuất Bảng Lương Ra PDF</span>
            </button>
            <button
              onClick={onViewPayslip}
              className="flex items-center gap-1.5 px-3 py-2 bg-white border border-slate-300 text-slate-700 text-xs font-semibold rounded-lg hover:bg-slate-50 transition-colors shadow-xs"
              title="Xem và in phiếu lương chi tiết"
            >
              <Printer className="w-4 h-4 text-slate-500" />
              <span className="hidden sm:inline">In Phiếu Lương</span>
            </button>
          </div>
        </div>

        {/* 2. THỐNG KÊ LƯƠNG & CHẤM CÔNG CÁ NHÂN TRONG THÁNG */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 pt-6">
          {/* Lương thực lĩnh */}
          <div className="bg-emerald-50/70 p-4 rounded-xl border border-emerald-200 col-span-2 lg:col-span-1">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-emerald-800 block mb-1">
              Lương Thực Lĩnh Dự Kiến
            </span>
            <div className="text-2xl font-bold font-mono tabular-nums text-emerald-700">
              {formatVND(salary.netSalary)}
            </div>
            <span className="text-[11px] text-emerald-600 block mt-1">
              Đã trừ BHXH & Thuế TNCN
            </span>
          </div>

          {/* Ngày công */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 block mb-1">
              Ngày Công Đi Làm
            </span>
            <div className="text-xl font-bold font-mono text-slate-900">
              <span className="text-blue-600">{salary.workedDays}</span>
              <span className="text-slate-400 font-normal text-sm"> / {salary.standardDays} ngày</span>
            </div>
            <span className="text-[11px] text-slate-500 block mt-1">
              Lương cơ bản: {formatVND(salary.actualBaseSalary)}
            </span>
          </div>

          {/* Tăng ca OT */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 block mb-1 flex items-center justify-between">
              <span>Tăng Ca (OT)</span>
              <Zap className="w-3.5 h-3.5 text-purple-600" />
            </span>
            <div className="text-xl font-bold font-mono text-purple-700">
              {salary.otCount} lần
            </div>
            <span className="text-[11px] text-purple-600 font-medium block mt-1">
              +{formatVND(salary.otPay)} (500k/lần)
            </span>
          </div>

          {/* Phụ cấp */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 block mb-1">
              Mức Phụ Cấp
            </span>
            <div className="text-xl font-bold font-mono text-slate-900">
              {formatVND(salary.allowance)}
            </div>
            <span className="text-[11px] text-slate-500 block mt-1">
              {salary.otCount > 0 ? 'Đã kích hoạt 3tr do có OT' : '2tr (Tăng 3tr nếu có OT)'}
            </span>
          </div>

          {/* Thưởng */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 block mb-1">
              Tiền Thưởng
            </span>
            <div className="text-xl font-bold font-mono text-amber-700">
              {formatVND(salary.bonusPay)}
            </div>
            <span className="text-[11px] text-slate-500 block mt-1">
              {relevantBonuses.length} quyết định khen thưởng
            </span>
          </div>
        </div>
      </div>

      {/* 3. BẢNG CHẤM CÔNG CỦA NHÂN VIÊN (TÍCH VÀO BẢNG CHẤM CÔNG) */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-5">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-slate-100">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-blue-600" />
              Bảng Chấm Công Cá Nhân - Tháng {selectedMonth.split('-')[1]}/{selectedMonth.split('-')[0]}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Tích chọn những ngày bạn đi làm và tích chọn ngày có tăng ca (OT). Hệ thống tự động tính lương ngay lập tức!
            </p>
          </div>

          {/* Quick Check-in for today */}
          {isCurrentMonth && (
            <div className="bg-blue-50/80 p-3 rounded-xl border border-blue-200 flex flex-wrap items-center gap-2 text-xs">
              <span className="font-semibold text-blue-900">
                Hôm nay ({todayStr.split('-').reverse().join('/')}):
              </span>
              <button
                type="button"
                onClick={() => handleTodayCheckin('present', false)}
                className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
                  todayData?.status === 'present' && !todayData?.hasOT
                    ? 'bg-blue-600 text-white shadow-xs font-semibold'
                    : 'bg-white text-slate-700 border border-slate-300 hover:bg-slate-100'
                }`}
              >
                ✓ Đi làm (8h)
              </button>
              <button
                type="button"
                onClick={() => handleTodayCheckin('present', true)}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-lg font-medium transition-colors ${
                  todayData?.hasOT
                    ? 'bg-purple-600 text-white shadow-xs font-semibold'
                    : 'bg-white text-purple-700 border border-purple-300 hover:bg-purple-50'
                }`}
              >
                <Zap className="w-3.5 h-3.5" />
                <span>Đi làm + OT (500k)</span>
              </button>
              <button
                type="button"
                onClick={() => handleTodayCheckin('absent', false)}
                className={`px-2.5 py-1.5 rounded-lg font-medium transition-colors ${
                  todayData?.status === 'absent'
                    ? 'bg-slate-700 text-white'
                    : 'bg-white text-slate-500 border border-slate-300 hover:bg-slate-100'
                }`}
              >
                Nghỉ
              </button>
            </div>
          )}
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-4 text-xs bg-slate-50 p-3 rounded-xl border border-slate-200 text-slate-600">
          <span className="font-semibold text-slate-800">Quy ước chấm công:</span>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-blue-500"></span>
            <span>Đi làm chuẩn (8h)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-purple-600"></span>
            <span>Đi làm + Tăng ca (OT +500.000 ₫ & Phụ cấp 3tr)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-slate-200"></span>
            <span>Nghỉ / Vắng</span>
          </div>
          <div className="ml-auto text-[11px] text-slate-500 italic">
            * Mẹo: Bạn có thể click trực tiếp vào từng ô ngày hoặc tích chọn checkbox bên trong để cập nhật
          </div>
        </div>

        {/* Calendar Grid of the month */}
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2.5">
          {dayNumbers.map((d) => {
            const dateStr = `${selectedMonth}-${String(d).padStart(2, '0')}`;
            const dateObj = new Date(yearNum, monthNum - 1, d);
            const dayOfWeek = dateObj.getDay(); // 0: CN, 1: T2...
            const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
            const dayName = ['Chủ Nhật', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7'][dayOfWeek];
            const isToday = dateStr === todayStr;

            const dayRecord = attendanceSheet?.days?.[dateStr];
            const isPresent = dayRecord?.status === 'present';
            const hasOT = !!dayRecord?.hasOT;

            return (
              <div
                key={d}
                className={`p-3 rounded-xl border transition-all flex flex-col justify-between min-h-[110px] ${
                  isToday ? 'ring-2 ring-blue-500' : ''
                } ${
                  hasOT
                    ? 'bg-purple-50/80 border-purple-300'
                    : isPresent
                    ? 'bg-blue-50/70 border-blue-200'
                    : isWeekend
                    ? 'bg-slate-100/70 border-slate-200 text-slate-400'
                    : 'bg-white border-slate-200'
                }`}
              >
                {/* Header ô ngày */}
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-baseline gap-1">
                    <span className="text-base font-bold font-mono text-slate-900">{d}</span>
                    <span className="text-[11px] text-slate-500 font-medium">{dayName}</span>
                  </div>
                  {isToday && (
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-600 text-white">
                      Hôm nay
                    </span>
                  )}
                  {hasOT && (
                    <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-purple-600 text-white flex items-center gap-0.5">
                      <Zap className="w-2.5 h-2.5" /> OT
                    </span>
                  )}
                </div>

                {/* Tùy chọn Tích Chấm Công (Checkboxes) */}
                <div className="space-y-1.5 pt-1 border-t border-slate-200/60">
                  {/* Tích đi làm */}
                  <label className="flex items-center gap-2 text-xs font-medium text-slate-800 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={isPresent}
                      onChange={(e) => {
                        const checked = e.target.checked;
                        if (!checked) {
                          onUpdateAttendance(dateStr, 'absent', false);
                        } else {
                          onUpdateAttendance(dateStr, 'present', hasOT);
                        }
                      }}
                      className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500 cursor-pointer"
                    />
                    <span>Đi làm</span>
                  </label>

                  {/* Tích có OT không */}
                  <label
                    className={`flex items-center gap-2 text-xs select-none ${
                      isPresent
                        ? 'font-medium text-purple-900 cursor-pointer'
                        : 'text-slate-400 cursor-not-allowed opacity-50'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={hasOT}
                      disabled={!isPresent}
                      onChange={(e) => {
                        const checked = e.target.checked;
                        onUpdateAttendance(dateStr, 'present', checked);
                      }}
                      className="w-4 h-4 text-purple-600 rounded border-slate-300 focus:ring-purple-500 cursor-pointer"
                    />
                    <span>Có OT (+500k)</span>
                  </label>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. BẢNG GIẢI TRÌNH TỰ ĐỘNG TÍNH LƯƠNG MINH BẠCH */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-600" />
              Chi Tiết Công Thức Tính Lương & Giảm Trừ
            </h3>
            <p className="text-xs text-slate-500">
              Mọi khoản thu nhập và giảm trừ được tính toán tự động chuẩn theo quy định
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onViewPayslip}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-800 border border-emerald-300 rounded-lg text-xs font-semibold hover:bg-emerald-100 transition-colors"
            >
              <FileDown className="w-3.5 h-3.5" />
              <span>Xuất PDF / In Phiếu</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Cột 1: Thu nhập */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-blue-900 pb-2 border-b border-slate-200 flex justify-between">
              <span>I. Các Khoản Thu Nhập</span>
              <span className="font-mono text-blue-700">{formatVND(salary.grossIncome)}</span>
            </h4>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between items-start">
                <div>
                  <span className="font-medium text-slate-800">Lương cơ bản theo ngày công:</span>
                  <div className="text-[11px] text-slate-500">
                    ({formatVND(salary.contractBaseSalary)} / {salary.standardDays} ngày) × {salary.workedDays} ngày công
                  </div>
                </div>
                <span className="font-mono font-semibold text-slate-900">
                  {formatVND(salary.actualBaseSalary)}
                </span>
              </div>

              <div className="flex justify-between items-start">
                <div>
                  <span className="font-medium text-slate-800">Phụ cấp:</span>
                  <div className="text-[11px] text-slate-500">
                    {salary.otCount > 0 ? 'Có OT trong tháng -> Được hưởng 3.000.000 ₫' : 'Không có OT -> Hưởng 2.000.000 ₫'}
                  </div>
                </div>
                <span className="font-mono font-semibold text-slate-900">
                  {formatVND(salary.allowance)}
                </span>
              </div>

              <div className="flex justify-between items-start">
                <div>
                  <span className="font-medium text-slate-800">Tiền làm thêm giờ (OT):</span>
                  <div className="text-[11px] text-slate-500">
                    {salary.otCount} lần OT × 500.000 ₫
                  </div>
                </div>
                <span className="font-mono font-semibold text-purple-700">
                  +{formatVND(salary.otPay)}
                </span>
              </div>

              <div className="flex justify-between items-start">
                <div>
                  <span className="font-medium text-slate-800">Khen thưởng:</span>
                  <div className="text-[11px] text-slate-500">
                    {relevantBonuses.length > 0 ? relevantBonuses.map(b => b.reason).join('; ') : 'Không có thưởng tháng này'}
                  </div>
                </div>
                <span className="font-mono font-semibold text-amber-700">
                  +{formatVND(salary.bonusPay)}
                </span>
              </div>
            </div>
          </div>

          {/* Cột 2: Các khoản giảm trừ */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-rose-900 pb-2 border-b border-slate-200 flex justify-between">
              <span>II. Các Khoản Giảm Trừ</span>
              <span className="font-mono text-rose-700">
                -{formatVND(salary.insuranceDeduction + salary.personalIncomeTax)}
              </span>
            </h4>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between items-start">
                <div>
                  <span className="font-medium text-slate-800">BHXH, BHYT, BHTN (10.5%):</span>
                  <div className="text-[11px] text-slate-500">
                    Trích nộp theo mức lương đóng bảo hiểm
                  </div>
                </div>
                <span className="font-mono font-semibold text-rose-600">
                  -{formatVND(salary.insuranceDeduction)}
                </span>
              </div>

              <div className="flex justify-between items-start">
                <div>
                  <span className="font-medium text-slate-800">Giảm trừ bản thân & Người phụ thuộc:</span>
                  <div className="text-[11px] text-slate-500">
                    Bản thân: 11.000.000 ₫ | {employee.dependents} người PT: {formatVND(salary.dependentDeduction)}
                  </div>
                </div>
                <span className="font-mono text-slate-600">
                  {formatVND(salary.personalDeduction + salary.dependentDeduction)}
                </span>
              </div>

              <div className="flex justify-between items-start">
                <div>
                  <span className="font-medium text-slate-800">Thuế Thu Nhập Cá Nhân (TNCN):</span>
                  <div className="text-[11px] text-slate-500">
                    Thu nhập tính thuế: {formatVND(salary.taxableIncome)} (Biểu thuế 7 bậc lũy tiến)
                  </div>
                </div>
                <span className="font-mono font-semibold text-rose-600">
                  -{formatVND(salary.personalIncomeTax)}
                </span>
              </div>

              <div className="pt-2 border-t border-slate-200 flex justify-between items-center">
                <span className="font-bold text-slate-900 uppercase">III. Lương Thực Lĩnh:</span>
                <span className="font-mono font-extrabold text-base text-emerald-700">
                  {formatVND(salary.netSalary)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
