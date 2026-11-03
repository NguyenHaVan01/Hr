import React from 'react';
import { SalaryBreakdown } from '../types';
import { formatVND, formatNumber } from '../utils/salaryCalculator';
import { Users, TrendingUp, TrendingDown, Clock, Award, DollarSign } from 'lucide-react';

interface StatsCardsProps {
  salaryBreakdowns: SalaryBreakdown[];
  onSelectEmployee?: (employeeId: string) => void;
}

export const StatsCards: React.FC<StatsCardsProps> = ({ salaryBreakdowns, onSelectEmployee }) => {
  if (salaryBreakdowns.length === 0) return null;

  const totalEmployees = salaryBreakdowns.length;
  const totalNetSalary = salaryBreakdowns.reduce((acc, curr) => acc + curr.netSalary, 0);
  const totalOtCount = salaryBreakdowns.reduce((acc, curr) => acc + curr.otCount, 0);
  const totalOtPay = totalOtCount * 500_000;
  const totalBonusPay = salaryBreakdowns.reduce((acc, curr) => acc + curr.bonusPay, 0);

  // Tìm nhân viên lương cao nhất và thấp nhất
  const sortedByNet = [...salaryBreakdowns].sort((a, b) => b.netSalary - a.netSalary);
  const highest = sortedByNet[0];
  const lowest = sortedByNet[sortedByNet.length - 1];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {/* 1. Tổng quỹ lương */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
        <div className="flex items-center justify-between text-slate-500 mb-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Tổng Quỹ Lương Thực Lĩnh
          </span>
          <div className="p-2 rounded-lg bg-blue-50 text-blue-600">
            <DollarSign className="w-4 h-4" />
          </div>
        </div>
        <div>
          <div className="text-2xl font-bold font-mono tabular-nums text-slate-900 tracking-tight">
            {formatVND(totalNetSalary)}
          </div>
          <div className="text-xs text-slate-500 mt-1 flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5" />
            <span>Chi trả cho {totalEmployees} nhân viên</span>
          </div>
        </div>
      </div>

      {/* 2. Nhân viên lương cao nhất */}
      <div
        onClick={() => highest && onSelectEmployee && onSelectEmployee(highest.employeeId)}
        className="bg-white p-5 rounded-xl border border-emerald-200/80 shadow-xs flex flex-col justify-between cursor-pointer hover:border-emerald-400 transition-colors group"
      >
        <div className="flex items-center justify-between text-slate-500 mb-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-emerald-700 flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5" /> Lương Cao Nhất
          </span>
          <span className="text-xs font-mono text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md font-medium">
            {highest?.employeeCode}
          </span>
        </div>
        <div>
          <div className="text-2xl font-bold font-mono tabular-nums text-emerald-700 tracking-tight">
            {highest ? formatVND(highest.netSalary) : '0 ₫'}
          </div>
          <div className="text-xs text-slate-700 font-medium truncate mt-1">
            {highest?.employeeName}
            <span className="text-slate-400 font-normal ml-1">· {highest?.position}</span>
          </div>
        </div>
      </div>

      {/* 3. Nhân viên lương thấp nhất */}
      <div
        onClick={() => lowest && onSelectEmployee && onSelectEmployee(lowest.employeeId)}
        className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between cursor-pointer hover:border-slate-400 transition-colors group"
      >
        <div className="flex items-center justify-between text-slate-500 mb-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-amber-700 flex items-center gap-1">
            <TrendingDown className="w-3.5 h-3.5" /> Lương Thấp Nhất
          </span>
          <span className="text-xs font-mono text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md font-medium">
            {lowest?.employeeCode}
          </span>
        </div>
        <div>
          <div className="text-2xl font-bold font-mono tabular-nums text-slate-800 tracking-tight">
            {lowest ? formatVND(lowest.netSalary) : '0 ₫'}
          </div>
          <div className="text-xs text-slate-700 font-medium truncate mt-1">
            {lowest?.employeeName}
            <span className="text-slate-400 font-normal ml-1">· {lowest?.position}</span>
          </div>
        </div>
      </div>

      {/* 4. Tổng Tăng ca & Thưởng */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
        <div className="flex items-center justify-between text-slate-500 mb-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Tăng Ca (OT) & Thưởng
          </span>
          <div className="p-2 rounded-lg bg-purple-50 text-purple-600">
            <Clock className="w-4 h-4" />
          </div>
        </div>
        <div>
          <div className="text-xl font-bold font-mono tabular-nums text-slate-900 tracking-tight">
            {formatVND(totalOtPay + totalBonusPay)}
          </div>
          <div className="text-xs text-slate-500 mt-1 flex items-center gap-2">
            <span>OT: {formatNumber(totalOtCount)} buổi ({formatVND(totalOtPay)})</span>
            <span>·</span>
            <span>Thưởng: {formatVND(totalBonusPay)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
