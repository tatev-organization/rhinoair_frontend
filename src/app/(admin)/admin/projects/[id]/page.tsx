'use client';

import React from 'react';
import Link from 'next/link';
import { Icons } from '@/components/ui/Icons';
import { useGetProjectByIdQuery, useUpdateTaskStatusMutation } from '@/redux/features/admin/adminApi';

export default function AdminProjectDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const unwrappedParams = React.use(params);
  const { data: response, isLoading, error } = useGetProjectByIdQuery(unwrappedParams.id);
  const [updateTaskStatus] = useUpdateTaskStatusMutation();

  if (isLoading) return <div style={{ padding: 40, color: 'var(--tx-sub)' }}>Loading project details...</div>;
  if (error || !response?.success) return <div style={{ padding: 40, color: 'red' }}>Error loading project details</div>;

  const project = response.data;
  
  if (!project) return <div style={{ padding: 40, color: 'var(--tx-sub)' }}>Project not found</div>;

  const handleTaskChange = async (taskId: string, newStatus: string) => {
    try {
      await updateTaskStatus({ projectId: project.projectId, taskId, status: newStatus }).unwrap();
      alert('Task status updated');
    } catch (err) {
      alert('Failed to update task status');
    }
  };

  return (
    <>
      <div className="pagehead">
        <div>
          <Link href="/admin/projects" style={{ color: 'var(--tx-sub)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12, fontSize: '0.9rem', fontWeight: 500 }}>
            <span>&larr;</span> Back to Projects
          </Link>
          <div className="title">Project Details: {project.name}</div>
          <div className="subtitle">Partner: {project.company?.name} &middot; ST ID: {project.serviceTitanProjectId}</div>
          {project.address && <div style={{ fontSize: '0.9rem', color: 'var(--tx-sub)', marginTop: 4 }}>📍 {project.address}</div>}
        </div>
      </div>

      <div className="card" style={{ padding: '24px', marginBottom: '24px' }}>
        <h3 style={{ fontSize: '1.2rem', fontWeight: 600, color: 'var(--tx-main)', marginBottom: '20px' }}>Task Tracking (Manual)</h3>
        
        {project.phases?.map((phase: any) => (
          <div key={phase.phaseId} style={{ marginBottom: '30px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: '16px' }}>
              <div style={{ 
                width: 32, height: 32, borderRadius: '50%', backgroundColor: 'var(--bg-card-alt)', 
                display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--tx-main)', fontWeight: 600 
              }}>
                {phase.sortOrder + 1}
              </div>
              <h4 style={{ fontSize: '1.05rem', fontWeight: 600, color: 'var(--tx-main)', margin: 0 }}>
                {phase.name}
              </h4>
              <span style={{ fontSize: '0.8rem', padding: '2px 8px', borderRadius: 100, backgroundColor: 'var(--bg-card-alt)', color: 'var(--tx-sub)' }}>
                {phase.status}
              </span>
            </div>

            <div style={{ paddingLeft: '44px' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <tbody>
                  {phase.tasks?.map((task: any) => (
                    <tr key={task.taskId} style={{ borderBottom: '1px solid var(--border)' }}>
                      <td style={{ padding: '12px 0', color: 'var(--tx-main)', fontSize: '0.95rem' }}>
                        {task.name}
                        {task.isInspection && <span style={{ marginLeft: 8, fontSize: '0.75rem', padding: '2px 6px', borderRadius: 4, backgroundColor: 'var(--yellow-10)', color: 'var(--yellow-100)' }}>Inspection</span>}
                      </td>
                      <td style={{ padding: '12px 0', textAlign: 'right' }}>
                        <select 
                          value={task.status} 
                          onChange={(e) => handleTaskChange(task.taskId, e.target.value)}
                          style={{
                            padding: '6px 12px',
                            borderRadius: '6px',
                            border: '1px solid var(--border)',
                            backgroundColor: 'var(--bg-main)',
                            color: 'var(--tx-main)',
                            fontSize: '0.9rem',
                            cursor: 'pointer'
                          }}
                        >
                          <option value="NOT_STARTED">Not Started</option>
                          <option value="IN_PROGRESS">In Progress</option>
                          <option value="COMPLETE">Complete</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {(!phase.tasks || phase.tasks.length === 0) && (
                <div style={{ padding: '12px 0', color: 'var(--tx-sub)', fontSize: '0.9rem', fontStyle: 'italic' }}>No tasks found for this phase.</div>
              )}
            </div>
          </div>
        ))}
        {(!project.phases || project.phases.length === 0) && (
          <div style={{ color: 'var(--tx-sub)' }}>No phases generated yet. Project might be older than the sync feature.</div>
        )}
      </div>

      <div className="card" style={{ padding: '24px' }}>
        <h3 style={{ fontSize: '1.2rem', fontWeight: 600, color: 'var(--tx-main)', marginBottom: '20px' }}>Invoices (Synced from ST)</h3>
        {project.invoices && project.invoices.length > 0 ? (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={{ textAlign: 'left', padding: '12px 0', borderBottom: '1px solid var(--border)', color: 'var(--tx-sub)', fontSize: '13px' }}>Invoice #</th>
                <th style={{ textAlign: 'left', padding: '12px 0', borderBottom: '1px solid var(--border)', color: 'var(--tx-sub)', fontSize: '13px' }}>Description</th>
                <th style={{ textAlign: 'right', padding: '12px 0', borderBottom: '1px solid var(--border)', color: 'var(--tx-sub)', fontSize: '13px' }}>Amount</th>
                <th style={{ textAlign: 'right', padding: '12px 0', borderBottom: '1px solid var(--border)', color: 'var(--tx-sub)', fontSize: '13px' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {project.invoices.map((inv: any) => (
                <tr key={inv.invoiceId} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '16px 0', color: 'var(--tx-main)', fontWeight: 500 }}>INV-{inv.invoiceNumber}</td>
                  <td style={{ padding: '16px 0', color: 'var(--tx-sub)' }}>{inv.description || 'Job Invoice'}</td>
                  <td style={{ padding: '16px 0', color: 'var(--tx-main)', textAlign: 'right', fontWeight: 600 }}>${parseFloat(inv.amount || '0').toLocaleString()}</td>
                  <td style={{ padding: '16px 0', textAlign: 'right' }}>
                    <span style={{ 
                      padding: '4px 10px', 
                      borderRadius: '100px', 
                      fontSize: '12px', 
                      fontWeight: 600,
                      backgroundColor: inv.status === 'PAID' ? 'rgba(112, 185, 68, 0.1)' : 'rgba(235, 87, 87, 0.1)',
                      color: inv.status === 'PAID' ? '#70b944' : '#eb5757'
                    }}>
                      {inv.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div style={{ color: 'var(--tx-sub)' }}>No invoices synced for this project yet.</div>
        )}
      </div>
    </>
  );
}
