import React from 'react';
import { ViewMode, Employee } from '../types';
import { Building2, Shield, User, Database, RotateCcw } from 'lucide-react';

interface NavbarProps {
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
  employees: Employee[];
  activeEmployeeId: string;
  setActiveEmployeeId: (id: string) => void;
  selectedMonth: string;
  setSelectedMonth: (month: string) => void;
  onOpenBackup: () => void;
  onResetData: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  viewMode,
  setViewMode,
  employees,
  activeEmployeeId,
  setActiveEmployeeId,
  selectedMonth,
  setSelectedMonth,
  onOpenBackup,
  onResetData,
}) => {
  const activeEmployee = employees.find((e) => e.id === activeEmployeeId) || employees[0];

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200 no-print">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Zone 1: Brand title, one line */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold text-lg shadow-sm">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <span className="text-base font-bold tracking-tight text-slate-900 whitespace-nowrap block">
                HR & Payroll System
              </span>
              <span className="text-xs text-slate-500 hidden sm:block">
                Quản lý Nhân sự & Tiền lương
              </span>
            </div>
          </div>

          {/* Zone 2: Month selector and quick navigation */}
          <div className="flex items-center gap-2 sm:gap-4 shrink-0">
            <div className="flex items-center gap-1.5 text-xs text-slate-600 bg-slate-100 p-1 rounded-lg">
              <span className="font-medium px-2 hidden md:inline">Tháng làm việc:</span>
              <input
                type="month"
                value={selectedMonth}
                onChange={(e) => e.target.value && setSelectedMonth(e.target.value)}
                className="bg-white border border-slate-200 rounded-md px-2 py-1 text-xs font-semibold text-slate-800 shadow-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            {/* Role switch tabs */}
            <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg">
              <button
                onClick={() => setViewMode('admin')}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap ${
                  viewMode === 'admin'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="Dành cho Quản trị viên nhân sự"
              >
                <Shield className="w-3.5 h-3.5" />
                <span>Admin</span>
              </button>
              <button
                onClick={() => setViewMode('user')}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap ${
                  viewMode === 'user'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="Dành cho Nhân viên tự chấm công & tra cứu lương"
              >
                <User className="w-3.5 h-3.5" />
                <span>Nhân viên</span>
              </button>
            </div>

            {/* If in User mode, allow switching active employee to test different users */}
            {viewMode === 'user' && (
              <div className="flex items-center gap-1.5">
                <span className="text-xs text-slate-500 hidden lg:inline">Tài khoản:</span>
                <select
                  value={activeEmployeeId}
                  onChange={(e) => setActiveEmployeeId(e.target.value)}
                  className="bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 max-w-[170px] truncate"
                >
                  {employees.map((emp) => (
                    <option key={emp.id} value={emp.id}>
                      {emp.id} - {emp.fullName}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Zone 3: Data actions & status */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={onOpenBackup}
              className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 hover:text-slate-900 transition-colors whitespace-nowrap"
              title="Sao lưu & Phục hồi dữ liệu"
            >
              <Database className="w-3.5 h-3.5 text-slate-500" />
              <span className="hidden sm:inline">Sao lưu dữ liệu</span>
            </button>
            <button
              onClick={onResetData}
              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
              title="Đặt lại dữ liệu mẫu gốc"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
