import React from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import AdminSidebar from '@/components/layout/AdminSidebar';
import EmployeeProjectProgressPage from '@/pages/employee/ProjectProgress';

export default function AdminProjectProgressPage() {
  // Admin can view the same live progress as employees.
  return (
    <DashboardLayout sidebar={<AdminSidebar />}>
      <EmployeeProjectProgressPage />
    </DashboardLayout>
  );
}
