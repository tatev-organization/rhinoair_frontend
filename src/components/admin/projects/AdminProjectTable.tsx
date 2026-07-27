'use client';

import React from 'react';
import Link from 'next/link';
import { useGetAllProjectsQuery, useUpdateProjectPhaseMutation } from '@/redux/features/admin/adminApi';
import { Icons } from '@/components/ui/Icons';

const PHASES = [
  { index: 0, name: 'Planning', class: 'planning' },
  { index: 1, name: 'Rough-in', class: 'roughin' },
  { index: 2, name: 'Finishing', class: 'finishing' },
  { index: 3, name: 'Final', class: 'complete' },
];

export function AdminProjectTable() {
  const { data: projects, isLoading } = useGetAllProjectsQuery(undefined, {
    pollingInterval: 15000,
    refetchOnFocus: true,
  });
  const [updatePhase, { isLoading: isUpdating }] = useUpdateProjectPhaseMutation();

  const handlePhaseChange = async (projectId: string, phaseIndex: number) => {
    const phase = PHASES.find((p) => p.index === phaseIndex);
    if (!phase) return;

    try {
      await updatePhase({
        projectId,
        currentPhaseIndex: phase.index,
        currentPhase: phase.name,
        phaseClass: phase.class,
      }).unwrap();
      alert('Project phase updated successfully');
    } catch (error) {
      alert('Failed to update project phase');
    }
  };

  if (isLoading) {
    return <div className="card" style={{ padding: 40, textAlign: 'center' }}>Loading projects...</div>;
  }

  const projectList = Array.isArray(projects) ? projects : projects?.data || [];

  if (!projectList || projectList.length === 0) {
    return (
      <div className="card" style={{ padding: 60, textAlign: 'center', color: 'var(--tx-sub)' }}>
        <div style={{ marginTop: 10 }}>No projects found. Partner must log in to sync ST projects.</div>
      </div>
    );
  }

  return (
    <div className="card">
      <div style={{ padding: '20px' }}>
        <h2 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--tx-main)' }}>All Projects</h2>
        <p style={{ color: 'var(--tx-sub)', fontSize: '14px', marginTop: '4px' }}>
          Manage project progress across all partner accounts.
        </p>
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table className="table" style={{ width: '100%', minWidth: '800px', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={{ textAlign: 'left', padding: '12px 20px', borderBottom: '1px solid var(--border)', color: 'var(--tx-sub)', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Project</th>
              <th style={{ textAlign: 'left', padding: '12px 20px', borderBottom: '1px solid var(--border)', color: 'var(--tx-sub)', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Partner Company</th>
              <th style={{ textAlign: 'left', padding: '12px 20px', borderBottom: '1px solid var(--border)', color: 'var(--tx-sub)', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Builder / ST Customer</th>
              <th style={{ textAlign: 'left', padding: '12px 20px', borderBottom: '1px solid var(--border)', color: 'var(--tx-sub)', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>ST Project ID</th>
              <th style={{ textAlign: 'left', padding: '12px 20px', borderBottom: '1px solid var(--border)', color: 'var(--tx-sub)', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Current Phase</th>
              <th style={{ textAlign: 'right', padding: '12px 20px', borderBottom: '1px solid var(--border)', color: 'var(--tx-sub)', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Update Status</th>
            </tr>
          </thead>
          <tbody>
            {projectList.map((proj: any) => (
              <tr key={proj.projectId} style={{ borderBottom: '1px solid var(--border)' }}>
                <td style={{ padding: '16px 20px' }}>
                  <Link href={`/admin/projects/${proj.projectId}`} style={{ fontWeight: 500, color: 'var(--blue-60)', textDecoration: 'none' }}>
                    {proj.name}
                  </Link>
                  <div style={{ fontSize: '13px', color: 'var(--tx-sub)', marginTop: 4 }}>{proj.address || 'No Address'}</div>
                </td>
                <td style={{ padding: '16px 20px', color: 'var(--tx-main)' }}>
                  {proj.company?.name}
                </td>
                <td style={{ padding: '16px 20px', color: 'var(--tx-sub)' }}>
                  {proj.builderName || 'Unknown'}
                </td>
                <td style={{ padding: '16px 20px', color: 'var(--tx-sub)' }}>
                  {proj.serviceTitanProjectId || 'N/A'}
                </td>
                <td style={{ padding: '16px 20px' }}>
                  <span className={`phase ${proj.phaseClass || 'planning'}`}>
                    {proj.currentPhase || 'Planning'}
                  </span>
                </td>
                <td style={{ padding: '16px 20px', textAlign: 'right' }}>
                  <select
                    value={proj.currentPhaseIndex ?? 0}
                    onChange={(e) => handlePhaseChange(proj.projectId, parseInt(e.target.value, 10))}
                    disabled={isUpdating}
                    style={{
                      padding: '8px 12px',
                      borderRadius: '6px',
                      border: '1px solid var(--border)',
                      background: 'var(--bg-main)',
                      color: 'var(--tx-main)',
                      cursor: 'pointer',
                      fontSize: '14px',
                      outline: 'none',
                    }}
                  >
                    {PHASES.map((p) => (
                      <option key={p.index} value={p.index}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
