'use client';

import React from 'react';
import Link from 'next/link';
import { Icons } from '@/components/ui/Icons';
import {
  useGetProjectByIdQuery,
  useUpdateTaskStatusMutation,
  useUploadAdminDocumentMutation,
  useUploadAdminPhotoMutation,
  useGetAdminDocumentsQuery,
  useGetAdminPhotosQuery,
} from '@/redux/features/admin/adminApi';

export default function AdminProjectDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const unwrappedParams = React.use(params);
  const { data: response, isLoading, error } = useGetProjectByIdQuery(unwrappedParams.id);
  const [updateTaskStatus] = useUpdateTaskStatusMutation();
  const [uploadDoc] = useUploadAdminDocumentMutation();
  const [uploadPhoto] = useUploadAdminPhotoMutation();
  
  const { data: docsRes } = useGetAdminDocumentsQuery(unwrappedParams.id);
  const { data: photosRes } = useGetAdminPhotosQuery(unwrappedParams.id);

  if (isLoading) return <div style={{ padding: 40, color: 'var(--tx-sub)' }}>Loading project details...</div>;
  if (error || !response?.success) return <div style={{ padding: 40, color: 'red' }}>Error loading project details</div>;

  const project = response.data;
  const documents = docsRes?.data || [];
  const photos = photosRes?.data || [];
  
  if (!project) return <div style={{ padding: 40, color: 'var(--tx-sub)' }}>Project not found</div>;

  const handleTaskChange = async (taskId: string, newStatus: string) => {
    try {
      await updateTaskStatus({ projectId: project.projectId, taskId, status: newStatus }).unwrap();
      alert('Task status updated');
    } catch (err) {
      alert('Failed to update task status');
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'doc' | 'photo') => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    
    try {
      if (type === 'doc') {
        await uploadDoc({ projectId: project.projectId, file }).unwrap();
      } else {
        await uploadPhoto({ projectId: project.projectId, file }).unwrap();
      }
      alert(`${type === 'doc' ? 'Document' : 'Photo'} uploaded successfully!`);
    } catch (err) {
      alert(`Failed to upload ${type}`);
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

      {/* Documents Panel */}
      <div className="card" style={{ padding: '24px', marginBottom: '24px' }}>
        <h3 style={{ fontSize: '1.2rem', fontWeight: 600, color: 'var(--tx-main)', marginBottom: '20px' }}>Documents &amp; Files</h3>
        
        {documents.map((doc: any) => (
          <a key={doc.documentId} className="doc-row" href={doc.fileUrl} target="_blank" rel="noreferrer" style={{ display: 'flex', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid var(--border)', textDecoration: 'none' }}>
            <span style={{ marginRight: '16px', color: 'var(--tx-sub)' }}><Icons.doc /></span>
            <div style={{ flex: 1 }}>
              <div style={{ color: 'var(--tx-main)', fontWeight: 500, fontSize: '0.95rem' }}>{doc.name}</div>
              <div style={{ color: 'var(--tx-sub)', fontSize: '0.85rem' }}>{doc.mimeType} &middot; {Math.round(doc.sizeBytes / 1024)} KB</div>
            </div>
            <span style={{ color: 'var(--tx-sub)' }}><Icons.dl /></span>
          </a>
        ))}

        <div className="upload-note" style={{ marginTop: '20px', color: 'var(--tx-sub)', fontSize: '0.9rem' }}>Upload a document to share with the partner.</div>
        <label className="dropzone" id="dropzone" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '30px', border: '2px dashed var(--border)', borderRadius: '8px', marginTop: '10px', cursor: 'pointer' }}>
          <input type="file" onChange={(e) => handleFileUpload(e, 'doc')} style={{ display: 'none' }} />
          <span className="dz-ico" style={{ marginBottom: '10px' }}>
            <svg viewBox="0 0 24 24" fill="none" style={{ width: 32, height: 32 }}>
              <path d="M12 16V5m0 0l-4 4m4-4l4 4" stroke="#5a9e2f" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M5 19h14" stroke="#5a9e2f" strokeWidth="1.9" strokeLinecap="round"/>
            </svg>
          </span>
          <span className="dz-text" style={{ textAlign: 'center' }}>
            <b style={{ color: 'var(--tx-main)', display: 'block' }}>Upload a document</b>
            <span className="dz-sub" style={{ color: 'var(--tx-sub)', fontSize: '0.85rem' }}>Click to browse &middot; PDF, DOC, etc.</span>
          </span>
        </label>
      </div>

      {/* Photos Panel */}
      <div className="card" style={{ padding: '24px' }}>
        <h3 style={{ fontSize: '1.2rem', fontWeight: 600, color: 'var(--tx-main)', marginBottom: '20px' }}>Project Photos</h3>
        
        <div className="photo-grid" style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '20px' }}>
          {photos.map((photo: any) => (
            <a key={photo.photoId} href={photo.imageUrl} target="_blank" rel="noreferrer" style={{ display: 'block', width: '100px', height: '100px', borderRadius: '8px', overflow: 'hidden', border: '1px solid var(--border)' }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={photo.imageUrl} alt={photo.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </a>
          ))}
        </div>

        <div className="upload-note" style={{ color: 'var(--tx-sub)', fontSize: '0.9rem' }}>Upload a photo to this project.</div>
        <label className="dropzone" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '30px', border: '2px dashed var(--border)', borderRadius: '8px', marginTop: '10px', cursor: 'pointer' }}>
          <input type="file" accept="image/*" onChange={(e) => handleFileUpload(e, 'photo')} style={{ display: 'none' }} />
          <span className="dz-ico" style={{ marginBottom: '10px' }}>
            <svg viewBox="0 0 24 24" fill="none" style={{ width: 32, height: 32 }}>
              <path d="M12 16V5m0 0l-4 4m4-4l4 4" stroke="#5a9e2f" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M5 19h14" stroke="#5a9e2f" strokeWidth="1.9" strokeLinecap="round"/>
            </svg>
          </span>
          <span className="dz-text" style={{ textAlign: 'center' }}>
            <b style={{ color: 'var(--tx-main)', display: 'block' }}>Upload a photo</b>
            <span className="dz-sub" style={{ color: 'var(--tx-sub)', fontSize: '0.85rem' }}>Click to browse &middot; JPG, PNG</span>
          </span>
        </label>
      </div>
    </>
  );
}
