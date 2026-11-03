import React, { useState, useEffect } from 'react';
import { Employee, Department } from '../types';
import { X, UserPlus, Save, DollarSign } from 'lucide-react';
import { formatVND } from '../utils/salaryCalculator';

interface EmployeeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (employee: Employee) => void;
  departments: Department[];
  editingEmployee?: Employee | null;
  existingEmployees: Employee[];
}

export const EmployeeModal: React.FC<EmployeeModalProps> = ({
  isOpen,
  onClose,
  onSave,
  departments,
  editingEmployee,
  existingEmployees,
}) => {
  const [formData, setFormData] = useState<Employee>({
    id: '',
    fullName: '',
    email: '',
    phone: '',
    gender: 'Nam',
    birthDate: '1995-01-01',
    idCard: '',
    departmentId: departments[0]?.id || 'PB01',
    position: '',
    baseSalary: 15_000_000,
    dependents: 0,
    startDate: new Date().toISOString().split('T')[0],
    status: 'active',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (editingEmployee) {
      setFormData(editingEmployee);
      setErrors({});
    } else {
      // Tự động sinh mã nhân viên tiếp theo
      const maxNum = existingEmployees.reduce((max, emp) => {
        const match = emp.id.match(/\d+/);
        return match ? Math.max(max, parseInt(match[0], 10)) : max;
      }, 0);
      const nextId = `NV${String(maxNum + 1).padStart(3, '0')}`;

      setFormData({
        id: nextId,
        fullName: '',
        email: '',
        phone: '',
        gender: 'Nam',
        birthDate: '1995-01-01',
        idCard: '',
        departmentId: departments[0]?.id || 'PB01',
        position: '',
        baseSalary: 15_000_000,
        dependents: 0,
        startDate: new Date().toISOString().split('T')[0],
        status: 'active',
      });
      setErrors({});
    }
  }, [editingEmployee, isOpen, existingEmployees, departments]);

  if (!isOpen) return null;

  const validate = () => {
    const err: Record<string, string> = {};
    if (!formData.id.trim()) err.id = 'Vui lòng nhập mã nhân viên';
    if (!formData.fullName.trim()) err.fullName = 'Vui lòng nhập họ và tên';
    if (!formData.position.trim()) err.position = 'Vui lòng nhập chức vụ';
    if (formData.baseSalary <= 0) err.baseSalary = 'Lương cơ bản phải lớn hơn 0';
    if (!formData.idCard.trim()) err.idCard = 'Vui lòng nhập số CCCD';

    // Kiểm tra trùng mã nếu thêm mới
    if (!editingEmployee) {
      const exists = existingEmployees.some((e) => e.id.toLowerCase() === formData.id.toLowerCase());
      if (exists) err.id = 'Mã nhân viên đã tồn tại trong hệ thống';
    }

    setErrors(err);
    return Object.keys(err).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      onSave(formData);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden border border-slate-200">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-blue-100 text-blue-700 rounded-lg">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                {editingEmployee ? 'Chỉnh Sửa Hồ Sơ Nhân Viên' : 'Thêm Nhân Viên Mới'}
              </h3>
              <p className="text-xs text-slate-500">
                Cập nhật thông tin nhân sự và chế độ lương thỏa thuận
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
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Mã NV */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Mã Nhân Viên <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={formData.id}
                onChange={(e) => setFormData({ ...formData, id: e.target.value.toUpperCase() })}
                disabled={!!editingEmployee}
                placeholder="VD: NV009"
                className={`w-full px-3 py-2 text-sm rounded-lg border font-mono ${
                  errors.id ? 'border-rose-500 bg-rose-50' : 'border-slate-300'
                } ${editingEmployee ? 'bg-slate-100 cursor-not-allowed' : 'bg-white'}`}
              />
              {errors.id && <p className="text-xs text-rose-500 mt-1">{errors.id}</p>}
            </div>

            {/* Họ và tên */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Họ và Tên <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                placeholder="VD: Nguyễn Văn Anh"
                className={`w-full px-3 py-2 text-sm rounded-lg border ${
                  errors.fullName ? 'border-rose-500 bg-rose-50' : 'border-slate-300'
                }`}
              />
              {errors.fullName && <p className="text-xs text-rose-500 mt-1">{errors.fullName}</p>}
            </div>

            {/* Phòng ban */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Phòng Ban <span className="text-rose-500">*</span>
              </label>
              <select
                value={formData.departmentId}
                onChange={(e) => setFormData({ ...formData, departmentId: e.target.value })}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 bg-white"
              >
                {departments.map((dept) => (
                  <option key={dept.id} value={dept.id}>
                    {dept.name} ({dept.code})
                  </option>
                ))}
              </select>
            </div>

            {/* Chức vụ */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Chức Vụ <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={formData.position}
                onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                placeholder="VD: Kỹ sư Phần mềm Senior"
                className={`w-full px-3 py-2 text-sm rounded-lg border ${
                  errors.position ? 'border-rose-500 bg-rose-50' : 'border-slate-300'
                }`}
              />
              {errors.position && <p className="text-xs text-rose-500 mt-1">{errors.position}</p>}
            </div>

            {/* Lương cơ bản tháng */}
            <div className="sm:col-span-2 bg-blue-50/60 p-3 rounded-xl border border-blue-100">
              <label className="block text-xs font-semibold text-blue-900 mb-1 flex items-center justify-between">
                <span>Mức Lương Cơ Bản Hợp Đồng (VNĐ/tháng) *</span>
                <span className="font-mono text-blue-700 font-bold">{formatVND(formData.baseSalary)}</span>
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="500000"
                  min="0"
                  value={formData.baseSalary}
                  onChange={(e) => setFormData({ ...formData, baseSalary: Number(e.target.value) })}
                  className={`w-full pl-3 pr-10 py-2 text-sm rounded-lg border font-mono font-medium ${
                    errors.baseSalary ? 'border-rose-500 bg-rose-50' : 'border-slate-300 bg-white'
                  }`}
                />
                <DollarSign className="w-4 h-4 text-slate-400 absolute right-3 top-2.5" />
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                Lương cơ bản được dùng để tính tiền công ngày (Lương ngày = Lương cơ bản / ngày công chuẩn).
              </p>
              {errors.baseSalary && <p className="text-xs text-rose-500 mt-1">{errors.baseSalary}</p>}
            </div>

            {/* Số CCCD / CMND */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Số CCCD/Định danh <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={formData.idCard}
                onChange={(e) => setFormData({ ...formData, idCard: e.target.value })}
                placeholder="00109500xxxx"
                className={`w-full px-3 py-2 text-sm rounded-lg border font-mono ${
                  errors.idCard ? 'border-rose-500 bg-rose-50' : 'border-slate-300'
                }`}
              />
              {errors.idCard && <p className="text-xs text-rose-500 mt-1">{errors.idCard}</p>}
            </div>

            {/* Giới tính */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Giới Tính</label>
              <div className="flex gap-4 pt-2">
                <label className="flex items-center gap-1.5 text-sm text-slate-700 cursor-pointer">
                  <input
                    type="radio"
                    name="gender"
                    value="Nam"
                    checked={formData.gender === 'Nam'}
                    onChange={() => setFormData({ ...formData, gender: 'Nam' })}
                    className="text-blue-600"
                  />
                  Nam
                </label>
                <label className="flex items-center gap-1.5 text-sm text-slate-700 cursor-pointer">
                  <input
                    type="radio"
                    name="gender"
                    value="Nữ"
                    checked={formData.gender === 'Nữ'}
                    onChange={() => setFormData({ ...formData, gender: 'Nữ' })}
                    className="text-blue-600"
                  />
                  Nữ
                </label>
              </div>
            </div>

            {/* Ngày sinh */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Ngày Sinh</label>
              <input
                type="date"
                value={formData.birthDate}
                onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300"
              />
            </div>

            {/* Người phụ thuộc */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Số Người Phụ Thuộc (Thuế TNCN)
              </label>
              <input
                type="number"
                min="0"
                max="10"
                value={formData.dependents}
                onChange={(e) => setFormData({ ...formData, dependents: Number(e.target.value) })}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 font-mono"
              />
              <p className="text-[11px] text-slate-500 mt-0.5">Giảm trừ 4.400.000 ₫/người/tháng</p>
            </div>

            {/* Email */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="name@congty.com"
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300"
              />
            </div>

            {/* Số điện thoại */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Số Điện Thoại</label>
              <input
                type="text"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="0912 xxx xxx"
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300"
              />
            </div>

            {/* Ngày vào làm */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Ngày Vào Làm</label>
              <input
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300"
              />
            </div>

            {/* Trạng thái */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Trạng Thái Làm Việc</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as 'active' | 'resigned' })}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300"
              >
                <option value="active">Đang làm việc</option>
                <option value="resigned">Đã nghỉ việc</option>
              </select>
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
              className="flex items-center gap-2 px-5 py-2 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors shadow-xs"
            >
              <Save className="w-4 h-4" />
              <span>{editingEmployee ? 'Lưu Thay Đổi' : 'Tạo Nhân Viên'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
