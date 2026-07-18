'use client';

import React from 'react';
import { AdminProjectTable } from '@/components/admin/projects/AdminProjectTable';

export default function AdminProjectsPage() {
  return (
    <>
      <div className="pagehead">
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: 'bold' }}>Project Management</h1>
          <div className="subtitle" style={{ marginTop: '8px', color: 'var(--tx-sub)' }}>
            Track and update progress for all partner projects.
          </div>
        </div>
      </div>
      
      <AdminProjectTable />
    </>
  );
}
