import React from 'react';
import { Metadata } from 'next';
import { AdminDashboardClient } from '@/components/admin/dashboard/AdminDashboardClient';

export const metadata: Metadata = {
  title: 'Admin Dashboard | Rhino Air',
  description: 'Rhino Air Admin Portal',
};

export default function AdminDashboardPage() {
  return <AdminDashboardClient />;
}
