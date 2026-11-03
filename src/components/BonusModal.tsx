import React, { useState, useEffect } from 'react';
import { Employee, Bonus } from '../types';
import { X, Award, DollarSign, Calendar, Sparkles } from 'lucide-react';
import { formatVND } from '../utils/salaryCalculator';

interface BonusModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (bonus: Bonus) => void;
  employees: Employee[];
  preselectedEmployeeId?: string;
  selectedMonth: string;
}

export const BonusModal: React.FC<BonusModalProps> = ({
  isOpen,
  onClose,
  onSave,
  employees,
  preselectedEmployeeId,
  selectedMonth,
}) => {
  const [employeeId, setEmployeeId] = useState('');
  const [amount, setAmount] = useState<number>(2_000_000);
  const [reason, setReason] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [month, setMonth] = useState(selectedMonth);
  const [error, setError] = useState('');

  useEffect(() => {
    if (preselectedEmployeeId) {
      setEmployeeId(preselectedEmployeeId);
    } else if (employees.length > 0 && !employeeId) {
      setEmployeeId(employees[0].id);
    }
    setMonth(selectedMonth);
    setReason('');
    setError('');
  }, [isOpen, preselectedEmployeeId, employees, selectedMonth]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!employeeId) {
      setError('Vui lòng chọn nhân viên được thưởng');
      return;
    }
    if (amount <= 0) {
      setError('Số tiền thưởng phải lớn hơn 0');
      return;
    }
    if (!reason.trim()) {
      setError('Vui lòng nhập lý do / quyết định khen thưởng');
      return;
    }

    const newBonus: Bonus = {
      id: `BN${Date.now().toString().slice(-6)}`,
      employeeId,
      amount,
      reason: reason.trim(),
      date,
      month,
    };

    onSave(newBonus);
    onClose();
  };

  const selectedEmployee = employees.find((e) => e.id === employeeId);

  const presets = [1_000_000, 2_000_000, 3_000_000, 5_000_000, 10_000_000];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden border border-slate-200">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-amber-50/50">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-amber-100 text-amber-700 rounded-lg">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Thêm Lương Thưởng Cho Nhân Viên
              </h3>
              <p className="text-xs text-slate-500">
                Ghi nhận khen thưởng hiệu suất và tự động cộng vào bảng lương
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-200/50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 text-xs bg-rose-50 text-rose-700 border border-rose-200 rounded-lg">
              {error}
            </div>
          )}

          {/* Chọn nhân viên */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Chọn Nhân Viên Khen Thưởng <span className="text-rose-500">*</span>
            </label>
            <select
              value={employeeId}
              onChange={(e) => setEmployeeId(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-amber-500"
            >
              {employees.map((emp) => (
                <option key={emp.id} value={emp.id}>
                  {emp.id} - {emp.fullName} ({emp.position})
                </option>
              ))}
            </select>
            {selectedEmployee && (
              <p className="text-[11px] text-slate-500 mt-1">
                Lương cơ bản hiện tại: {formatVND(selectedEmployee.baseSalary)}
              </p>
            )}
          </div>

          {/* Số tiền thưởng */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1 flex justify-between">
              <span>Số Tiền Thưởng (VNĐ) <span className="text-rose-500">*</span></span>
              <span className="font-mono text-amber-700 font-bold">{formatVND(amount)}</span>
            </label>
            <div className="relative">
              <input
                type="number"
                step="500000"
                min="100000"
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
                className="w-full pl-3 pr-10 py-2 text-sm rounded-lg border border-slate-300 bg-white font-mono font-medium focus:ring-2 focus:ring-amber-500"
              />
              <DollarSign className="w-4 h-4 text-slate-400 absolute right-3 top-2.5" />
            </div>

            {/* Gợi ý mức thưởng nhanh */}
            <div className="flex flex-wrap gap-1.5 mt-2">
              {presets.map((preset) => (
                <button
                  type="button"
                  key={preset}
                  onClick={() => setAmount(preset)}
                  className={`px-2 py-1 text-xs font-mono rounded-md border transition-colors ${
                    amount === preset
                      ? 'bg-amber-100 text-amber-800 border-amber-300 font-semibold'
                      : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  +{formatVND(preset).replace(' ₫', 'đ')}
                </button>
              ))}
            </div>
          </div>

          {/* Lý do thưởng */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Lý Do & Quyết Định Khen Thưởng <span className="text-rose-500">*</span>
            </label>
            <textarea
              rows={3}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="VD: Thưởng hoàn thành xuất sắc dự án vượt tiến độ; Thưởng nhân viên xuất sắc của tháng..."
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:ring-2 focus:ring-amber-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            {/* Tháng áp dụng */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Kỳ Lương Áp Dụng
              </label>
              <input
                type="month"
                value={month}
                onChange={(e) => setMonth(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300"
              />
            </div>

            {/* Ngày quyết định */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Ngày Quyết Định
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
            >
              Hủy bỏ
            </button>
            <button
              type="submit"
              className="flex items-center gap-2 px-5 py-2 text-sm font-semibold text-white bg-amber-600 rounded-lg hover:bg-amber-700 transition-colors shadow-xs"
            >
              <Sparkles className="w-4 h-4" />
              <span>Xác Nhận Thưởng</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
