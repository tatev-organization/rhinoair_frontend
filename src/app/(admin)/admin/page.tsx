import React from 'react';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Admin Dashboard | Rhino Air',
  description: 'Rhino Air Admin Portal',
};

export default function AdminDashboardPage() {
  return (
    <>
      <div className="page-header">
        <h1 className="page-title">Admin Dashboard</h1>
      </div>
      
      <div className="grid">
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Welcome to Admin Portal</h2>
          </div>
          <p style={{ color: 'var(--gray-600)', fontSize: '14px' }}>
            Use the navigation menu to manage partners and assign ServiceTitan Customer IDs.
          </p>
        </div>
      </div>
    </>
  );
}
