import React, { useState, useMemo, useEffect } from 'react';
import { ViewMode, Employee, Department, AttendanceSheet, Bonus, SalaryBreakdown } from './types';
import { StorageService } from './utils/storage';
import { calculateEmployeeSalary } from './utils/salaryCalculator';
import { Navbar } from './components/Navbar';
import { AdminView } from './components/AdminView';
import { EmployeeView } from './components/EmployeeView';
import { EmployeeModal } from './components/EmployeeModal';
import { BonusModal } from './components/BonusModal';
import { PayslipModal } from './components/PayslipModal';
import { BackupModal } from './components/BackupModal';
import { CheckCircle2, AlertCircle } from 'lucide-react';

export default function App() {
  // State quản trị dữ liệu
  const [departments, setDepartments] = useState<Department[]>(() => StorageService.getDepartments());
  const [employees, setEmployees] = useState<Employee[]>(() => StorageService.getEmployees());
  const [attendanceSheets, setAttendanceSheets] = useState<Record<string, AttendanceSheet>>(() =>
    StorageService.getAttendanceSheets()
  );
  const [bonuses, setBonuses] = useState<Bonus[]>(() => StorageService.getBonuses());

  // State điều hướng
  const [viewMode, setViewMode] = useState<ViewMode>('admin');
  const [activeEmployeeId, setActiveEmployeeId] = useState<string>(() => StorageService.getActiveUserId());
  const [selectedMonth, setSelectedMonth] = useState<string>(() => StorageService.getCurrentMonth());

  // Modal states
  const [isEmployeeModalOpen, setIsEmployeeModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);

  const [isBonusModalOpen, setIsBonusModalOpen] = useState(false);
  const [bonusPreselectedEmployeeId, setBonusPreselectedEmployeeId] = useState<string | undefined>();

  const [isPayslipModalOpen, setIsPayslipModalOpen] = useState(false);
  const [payslipEmployeeId, setPayslipEmployeeId] = useState<string | null>(null);

  const [isBackupModalOpen, setIsBackupModalOpen] = useState(false);

  // Toast notification
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'info' } | null>(null);

  const showToast = (message: string, type: 'success' | 'info' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  // Đồng bộ storage khi state thay đổi
  useEffect(() => {
    StorageService.saveEmployees(employees);
  }, [employees]);

  useEffect(() => {
    StorageService.saveAttendanceSheets(attendanceSheets);
  }, [attendanceSheets]);

  useEffect(() => {
    StorageService.saveBonuses(bonuses);
  }, [bonuses]);

  useEffect(() => {
    StorageService.setActiveUserId(activeEmployeeId);
  }, [activeEmployeeId]);

  useEffect(() => {
    StorageService.setCurrentMonth(selectedMonth);
  }, [selectedMonth]);

  // Tự động tính toán bảng lương chi tiết cho toàn bộ nhân viên theo tháng đã chọn
  const salaryBreakdowns = useMemo(() => {
    return employees.map((emp) => {
      const dept = departments.find((d) => d.id === emp.departmentId);
      const sheet = attendanceSheets[emp.id];
      return calculateEmployeeSalary(emp, dept, sheet, bonuses, selectedMonth);
    });
  }, [employees, departments, attendanceSheets, bonuses, selectedMonth]);

  // Thông tin nhân viên đang đăng nhập (trong chế độ User)
  const currentEmployee = useMemo(() => {
    return employees.find((e) => e.id === activeEmployeeId) || employees[0];
  }, [employees, activeEmployeeId]);

  const currentEmployeeDept = useMemo(() => {
    return departments.find((d) => d.id === currentEmployee?.departmentId);
  }, [departments, currentEmployee]);

  const currentEmployeeSalary = useMemo(() => {
    if (!currentEmployee) return null;
    return (
      salaryBreakdowns.find((s) => s.employeeId === currentEmployee.id) ||
      calculateEmployeeSalary(currentEmployee, currentEmployeeDept, attendanceSheets[currentEmployee.id], bonuses, selectedMonth)
    );
  }, [currentEmployee, currentEmployeeDept, salaryBreakdowns, attendanceSheets, bonuses, selectedMonth]);

  // Handlers nhân viên
  const handleSaveEmployee = (empData: Employee) => {
    if (editingEmployee) {
      setEmployees((prev) => prev.map((e) => (e.id === empData.id ? empData : e)));
      showToast(`Đã cập nhật thông tin nhân viên ${empData.fullName}`);
    } else {
      setEmployees((prev) => [...prev, empData]);
      showToast(`Đã thêm thành công nhân viên mới: ${empData.fullName}`);
    }
  };

  const handleDeleteEmployee = (id: string) => {
    setEmployees((prev) => prev.filter((e) => e.id !== id));
    showToast('Đã xóa hồ sơ nhân viên khỏi hệ thống', 'info');
  };

  // Handlers thưởng
  const handleSaveBonus = (newBonus: Bonus) => {
    setBonuses((prev) => [...prev, newBonus]);
    const emp = employees.find((e) => e.id === newBonus.employeeId);
    showToast(`Đã duyệt thưởng cho ${emp?.fullName || newBonus.employeeId}! Bảng lương đã được cập nhật.`);
  };

  const handleDeleteBonus = (bonusId: string) => {
    setBonuses((prev) => prev.filter((b) => b.id !== bonusId));
    showToast('Đã thu hồi quyết định thưởng', 'info');
  };

  // Cập nhật chấm công (Dùng chung cho cả Admin và User)
  const handleUpdateAttendance = (
    employeeId: string,
    date: string,
    status: 'present' | 'absent',
    hasOT: boolean,
    note?: string
  ) => {
    setAttendanceSheets((prev) => {
      const currentSheet = prev[employeeId] || {
        employeeId,
        month: selectedMonth,
        days: {},
      };

      const updatedDays = {
        ...currentSheet.days,
        [date]: {
          status,
          hasOT,
          note: note !== undefined ? note : currentSheet.days?.[date]?.note,
        },
      };

      return {
        ...prev,
        [employeeId]: {
          ...currentSheet,
          month: selectedMonth,
          days: updatedDays,
        },
      };
    });

    if (viewMode === 'user') {
      showToast(
        hasOT
          ? `Đã chấm công ngày ${date.split('-')[2]}: Đi làm + Tăng ca (OT +500k)!`
          : status === 'present'
          ? `Đã chấm công ngày ${date.split('-')[2]}: Đi làm (8h)`
          : `Đã cập nhật ngày ${date.split('-')[2]}: Nghỉ`
      );
    }
  };

  // Reset dữ liệu mẫu
  const handleResetData = () => {
    if (confirm('Bạn có chắc chắn muốn đặt lại toàn bộ dữ liệu mẫu ban đầu? Mọi thay đổi sẽ bị xóa.')) {
      StorageService.resetToDefault();
      setDepartments(StorageService.getDepartments());
      setEmployees(StorageService.getEmployees());
      setAttendanceSheets(StorageService.getAttendanceSheets(selectedMonth));
      setBonuses(StorageService.getBonuses());
      setActiveEmployeeId('NV001');
      showToast('Đã đặt lại dữ liệu mẫu gốc thành công!');
    }
  };

  // Tải lại sau khi import JSON
  const handleDataReload = () => {
    setDepartments(StorageService.getDepartments());
    setEmployees(StorageService.getEmployees());
    setAttendanceSheets(StorageService.getAttendanceSheets(selectedMonth));
    setBonuses(StorageService.getBonuses());
    showToast('Đã tải và áp dụng dữ liệu sao lưu thành công!');
  };

  // Data for payslip modal
  const payslipTargetSalary = useMemo(() => {
    if (!payslipEmployeeId) return null;
    return salaryBreakdowns.find((s) => s.employeeId === payslipEmployeeId) || null;
  }, [payslipEmployeeId, salaryBreakdowns]);

  const payslipTargetEmployee = useMemo(() => {
    if (!payslipEmployeeId) return null;
    return employees.find((e) => e.id === payslipEmployeeId) || null;
  }, [payslipEmployeeId, employees]);

  const payslipTargetDepartment = useMemo(() => {
    if (!payslipTargetEmployee) return null;
    return departments.find((d) => d.id === payslipTargetEmployee.departmentId) || null;
  }, [payslipTargetEmployee, departments]);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-800">
      {/* Toast Notification */}
      {toast && (
        <div className="fixed top-20 right-6 z-50 flex items-center gap-2 bg-slate-900 text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-lg animate-fade-in no-print">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toast.message}</span>
        </div>
      )}

      {/* Top Navbar */}
      <Navbar
        viewMode={viewMode}
        setViewMode={setViewMode}
        employees={employees}
        activeEmployeeId={activeEmployeeId}
        setActiveEmployeeId={setActiveEmployeeId}
        selectedMonth={selectedMonth}
        setSelectedMonth={setSelectedMonth}
        onOpenBackup={() => setIsBackupModalOpen(true)}
        onResetData={handleResetData}
      />

      {/* Main Content Viewport */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {viewMode === 'admin' ? (
          <AdminView
            employees={employees}
            departments={departments}
            attendanceSheets={attendanceSheets}
            bonuses={bonuses}
            salaryBreakdowns={salaryBreakdowns}
            selectedMonth={selectedMonth}
            onAddEmployee={() => {
              setEditingEmployee(null);
              setIsEmployeeModalOpen(true);
            }}
            onEditEmployee={(emp) => {
              setEditingEmployee(emp);
              setIsEmployeeModalOpen(true);
            }}
            onDeleteEmployee={handleDeleteEmployee}
            onAddBonus={(preselectedEmpId) => {
              setBonusPreselectedEmployeeId(preselectedEmpId);
              setIsBonusModalOpen(true);
            }}
            onDeleteBonus={handleDeleteBonus}
            onViewPayslip={(empId) => {
              setPayslipEmployeeId(empId);
              setIsPayslipModalOpen(true);
            }}
            onUpdateAttendance={handleUpdateAttendance}
          />
        ) : currentEmployee && currentEmployeeSalary ? (
          <EmployeeView
            employee={currentEmployee}
            department={currentEmployeeDept}
            attendanceSheet={attendanceSheets[currentEmployee.id]}
            bonuses={bonuses}
            salary={currentEmployeeSalary}
            selectedMonth={selectedMonth}
            onUpdateAttendance={(date, status, hasOT, note) =>
              handleUpdateAttendance(currentEmployee.id, date, status, hasOT, note)
            }
            onViewPayslip={() => {
              setPayslipEmployeeId(currentEmployee.id);
              setIsPayslipModalOpen(true);
            }}
          />
        ) : null}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-4 text-center text-xs text-slate-500 no-print">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div>
            <strong>ĐT07: Hệ thống Quản lý Nhân sự & Tiền lương Công ty</strong>
          </div>
          <div className="text-slate-400">
            Công thức: Lương ngày công + Phụ cấp (2tr/3tr) + OT 500k/lần + Thưởng - BHXH (10.5%) - Thuế TNCN lũy tiến
          </div>
        </div>
      </footer>

      {/* Modals */}
      <EmployeeModal
        isOpen={isEmployeeModalOpen}
        onClose={() => setIsEmployeeModalOpen(false)}
        onSave={handleSaveEmployee}
        departments={departments}
        editingEmployee={editingEmployee}
        existingEmployees={employees}
      />

      <BonusModal
        isOpen={isBonusModalOpen}
        onClose={() => setIsBonusModalOpen(false)}
        onSave={handleSaveBonus}
        employees={employees}
        preselectedEmployeeId={bonusPreselectedEmployeeId}
        selectedMonth={selectedMonth}
      />

      <PayslipModal
        isOpen={isPayslipModalOpen}
        onClose={() => {
          setIsPayslipModalOpen(false);
          setPayslipEmployeeId(null);
        }}
        salary={payslipTargetSalary}
        employee={payslipTargetEmployee}
        department={payslipTargetDepartment}
        bonuses={bonuses}
      />

      <BackupModal
        isOpen={isBackupModalOpen}
        onClose={() => setIsBackupModalOpen(false)}
        onDataReload={handleDataReload}
      />
    </div>
  );
}
