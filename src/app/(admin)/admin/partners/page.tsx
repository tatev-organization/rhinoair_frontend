import React from 'react';
import { Metadata } from 'next';
import { PartnerListTable } from '@/components/admin/partners/PartnerListTable';

export const metadata: Metadata = {
  title: 'Partner Management | Rhino Air Admin',
  description: 'Manage partners and their ServiceTitan mapping',
};

export default function AdminPartnersPage() {
  return (
    <>
      <div className="page-header">
        <h1 className="page-title">Partner Management</h1>
        <div className="page-actions">
          {/* Future: Add 'Create Partner' button here if needed */}
        </div>
      </div>
      
      <div className="grid">
        <div className="card">
          <PartnerListTable />
        </div>
      </div>
    </>
  );
}
