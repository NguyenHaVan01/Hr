import { Employee, Department, AttendanceSheet, Bonus } from '../types';
import { INITIAL_DEPARTMENTS, INITIAL_EMPLOYEES, INITIAL_BONUSES, generateInitialAttendance } from '../data/initialData';

const STORAGE_KEYS = {
  EMPLOYEES: 'qlns_employees_v1',
  DEPARTMENTS: 'qlns_departments_v1',
  ATTENDANCE: 'qlns_attendance_v1',
  BONUSES: 'qlns_bonuses_v1',
  ACTIVE_USER_ID: 'qlns_active_user_id_v1',
  CURRENT_MONTH: 'qlns_current_month_v1',
};

export const StorageService = {
  getDepartments(): Department[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.DEPARTMENTS);
      return data ? JSON.parse(data) : INITIAL_DEPARTMENTS;
    } catch {
      return INITIAL_DEPARTMENTS;
    }
  },

  saveDepartments(departments: Department[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.DEPARTMENTS, JSON.stringify(departments));
    } catch (e) {
      console.error('Lỗi khi lưu phòng ban:', e);
    }
  },

  getEmployees(): Employee[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.EMPLOYEES);
      return data ? JSON.parse(data) : INITIAL_EMPLOYEES;
    } catch {
      return INITIAL_EMPLOYEES;
    }
  },

  saveEmployees(employees: Employee[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.EMPLOYEES, JSON.stringify(employees));
    } catch (e) {
      console.error('Lỗi khi lưu nhân viên:', e);
    }
  },

  getAttendanceSheets(month: string = '2026-11'): Record<string, AttendanceSheet> {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.ATTENDANCE);
      if (data) {
        const parsed = JSON.parse(data);
        return parsed;
      }
      const initial = generateInitialAttendance(month);
      localStorage.setItem(STORAGE_KEYS.ATTENDANCE, JSON.stringify(initial));
      return initial;
    } catch {
      return generateInitialAttendance(month);
    }
  },

  saveAttendanceSheets(sheets: Record<string, AttendanceSheet>): void {
    try {
      localStorage.setItem(STORAGE_KEYS.ATTENDANCE, JSON.stringify(sheets));
    } catch (e) {
      console.error('Lỗi khi lưu bảng chấm công:', e);
    }
  },

  getBonuses(): Bonus[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.BONUSES);
      return data ? JSON.parse(data) : INITIAL_BONUSES;
    } catch {
      return INITIAL_BONUSES;
    }
  },

  saveBonuses(bonuses: Bonus[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.BONUSES, JSON.stringify(bonuses));
    } catch (e) {
      console.error('Lỗi khi lưu tiền thưởng:', e);
    }
  },

  getActiveUserId(): string {
    return localStorage.getItem(STORAGE_KEYS.ACTIVE_USER_ID) || 'NV001';
  },

  setActiveUserId(id: string): void {
    localStorage.setItem(STORAGE_KEYS.ACTIVE_USER_ID, id);
  },

  getCurrentMonth(): string {
    return localStorage.getItem(STORAGE_KEYS.CURRENT_MONTH) || '2026-11';
  },

  setCurrentMonth(month: string): void {
    localStorage.setItem(STORAGE_KEYS.CURRENT_MONTH, month);
  },

  exportAllData(): string {
    const backup = {
      version: '1.0',
      timestamp: new Date().toISOString(),
      departments: this.getDepartments(),
      employees: this.getEmployees(),
      attendance: this.getAttendanceSheets(),
      bonuses: this.getBonuses(),
    };
    return JSON.stringify(backup, null, 2);
  },

  importAllData(jsonStr: string): boolean {
    try {
      const parsed = JSON.parse(jsonStr);
      if (parsed.employees && Array.isArray(parsed.employees)) {
        this.saveEmployees(parsed.employees);
      }
      if (parsed.departments && Array.isArray(parsed.departments)) {
        this.saveDepartments(parsed.departments);
      }
      if (parsed.attendance) {
        this.saveAttendanceSheets(parsed.attendance);
      }
      if (parsed.bonuses && Array.isArray(parsed.bonuses)) {
        this.saveBonuses(parsed.bonuses);
      }
      return true;
    } catch (e) {
      console.error('Lỗi khôi phục dữ liệu:', e);
      return false;
    }
  },

  resetToDefault(): void {
    localStorage.removeItem(STORAGE_KEYS.EMPLOYEES);
    localStorage.removeItem(STORAGE_KEYS.DEPARTMENTS);
    localStorage.removeItem(STORAGE_KEYS.ATTENDANCE);
    localStorage.removeItem(STORAGE_KEYS.BONUSES);
    localStorage.removeItem(STORAGE_KEYS.ACTIVE_USER_ID);
  },
};
