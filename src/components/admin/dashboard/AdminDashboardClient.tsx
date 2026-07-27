'use client';

import React from 'react';
import { useGetPartnersQuery, useGetAllProjectsQuery } from '@/redux/features/admin/adminApi';
import Link from 'next/link';

export function AdminDashboardClient() {
  const { data: partners, isLoading: isLoadingPartners } = useGetPartnersQuery();
  const { data: projects, isLoading: isLoadingProjects } = useGetAllProjectsQuery();

  const partnersList = partners?.data || partners || [];
  const projectsList = projects?.data || projects || [];

  const totalPartners = partnersList.length;
  const totalProjects = projectsList.length;
  
  // Calculate total pending quotes across all partners
  let pendingQuotes = 0;
  if (partnersList.length > 0) {
    pendingQuotes = partnersList.reduce((sum: number, partner: any) => {
      return sum + (partner._count?.quotes || 0);
    }, 0);
  }

  const isLoading = isLoadingPartners || isLoadingProjects;

  return (
    <>
      <div className="pagehead">
        <div>
          <div className="tag">Overview</div>
          <h1>Admin Dashboard</h1>
          <div className="subtitle">
            Manage partners, active projects, and system configurations.
          </div>
        </div>
      </div>
      
      {isLoading ? (
        <div style={{ padding: '40px', textAlign: 'center', color: 'var(--muted)', fontFamily: 'Sometype Mono' }}>
          Loading dashboard data...
        </div>
      ) : (
        <div className="stats" style={{ marginBottom: '32px' }}>
          <div className="stat">
            <div className="num">{totalPartners}</div>
            <div className="lbl">Active Partners</div>
          </div>
          <div className="stat accent">
            <div className="num">{totalProjects}</div>
            <div className="lbl">Total Projects</div>
          </div>
          <div className="stat">
            <div className="num">{pendingQuotes}</div>
            <div className="lbl">Pending Quotes</div>
          </div>
        </div>
      )}

      <div className="grid">
        <div className="card">
          <div className="card-title">Quick Actions</div>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginTop: '16px' }}>
            <Link href="/admin/partners" className="btn-primary" style={{ flex: 'none', width: 'auto' }}>
              Manage Partners
            </Link>
            <Link href="/admin/projects" className="btn-ghost">
              View All Projects
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
