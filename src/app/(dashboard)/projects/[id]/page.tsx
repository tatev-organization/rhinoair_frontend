'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Icons } from '@/components/ui/Icons';
import { UploadDocumentModal } from '@/components/ui/UploadDocumentModal';

import { useGetProjectByIdQuery, useDecideChangeOrderMutation } from '@/redux/features/projects/projectsApi';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";

// ── Status tracker data (mirrors build_portal.py exactly) ───────────────────
const mapStatusToState = (status: string) => {
  if (status === 'COMPLETE') return 'complete';
  if (status === 'IN_PROGRESS') return 'inprogress';
  return 'notstarted';
};

const mapPhaseStatus = (status: string) => {
  if (status === 'DONE') return 'done';
  if (status === 'CURRENT') return 'current';
  return 'upcoming';
};

const stateWord: Record<string, string> = {
  complete: 'Complete',
  inprogress: 'In progress',
  notstarted: 'Not started',
};

function StBar({ state, pidx }: { state: string; pidx: number }) {
  return (
    <div className="st-bar">
      {[0,1,2,3].map(k => {
        let cls = '';
        if (state !== 'notstarted') {
          if (k < pidx) cls = ' green';
          else if (k === pidx) cls = ' green' + (state === 'inprogress' ? ' pulse' : '');
        }
        return <span key={k} className={`st-seg${cls}`}></span>;
      })}
    </div>
  );
}

function StItem({ name, state, pidx }: { name: string; state: string; pidx: number }) {
  const isInspection = name.toLowerCase().includes('inspection');
  return (
    <div className={`st-item ${state}`}>
      <div className="st-name">{name}</div>
      <span className="st-status">
        {stateWord[state]}
        {isInspection && <span className="st-tag">Scheduled by GC</span>}
      </span>
      <StBar state={state} pidx={pidx} />
    </div>
  );
}

// ── Change-order state ───────────────────────────────────────────────────────
export default function ProjectDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const unwrappedParams = React.use(params);
  const { data: response, isLoading } = useGetProjectByIdQuery(unwrappedParams.id);
  const project = response?.data;
  
  // Upload modal state
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const [tab, setTab] = useState('status');
  const [selectedQuote, setSelectedQuote] = useState<any>(null);
  const [processingCO, setProcessingCO] = useState<{ id: string, type: 'approve' | 'decline' } | null>(null);

  const [decideChangeOrderMutation] = useDecideChangeOrderMutation();

  const handleDecideCO = async (changeOrderId: string, isApproved: boolean) => {
    setProcessingCO({ id: changeOrderId, type: isApproved ? 'approve' : 'decline' });
    try {
      await decideChangeOrderMutation({ projectId: unwrappedParams.id, changeOrderId, isApproved }).unwrap();
      // Refetch is handled by RTK query invalidation or manual refresh if needed
    } catch (error) {
      console.error('Failed to decide CO', error);
      alert('Failed to update change order.');
    } finally {
      setProcessingCO(null);
    }
  };
  useEffect(() => {
    const hash = window.location.hash.replace('#', '');
    if (['status','documents','photos','estimate','invoices'].includes(hash)) setTab(hash);
  }, []);

  const switchTab = (t: string) => { setTab(t); window.location.hash = t; };

  const dynamicPaid = project?.invoices?.filter((i: any) => i.status === 'PAID').reduce((acc: number, curr: any) => acc + parseFloat(curr.amount || 0), 0) || 0;
  const coBase = parseFloat(project?.contractTotal || 0);
  const coApprovedTotal = project?.changeOrders?.filter((co: any) => co.status === 'APPROVED').reduce((sum: number, co: any) => sum + parseFloat(co.amount || 0), 0) || 0;
  const adjustedTotal = coBase + coApprovedTotal;
  const outstanding = adjustedTotal - dynamicPaid;

  // ── Status panel ────────────────────────────────────────────────────────────
  const StatusPanel = () => (
    <div className="panel" data-panel="status">
      {/* Schedule hero */}
      <div className="sched-hero">
        <div className="sched-head">
          <svg viewBox="0 0 24 24" fill="none">
            <rect x="4" y="5" width="16" height="16" rx="2" stroke="#70b944" strokeWidth="1.7"/>
            <path d="M4 9h16M8 3v4M16 3v4" stroke="#70b944" strokeWidth="1.7" strokeLinecap="round"/>
          </svg>
          Project schedule
        </div>
        <div className={`sched-row ${project?.startDate ? 'done' : 'pending'}`}>
          <span className="sched-ind"></span>
          <div className="sched-main">
            <div className="sched-label">Installation start</div>
            <div className="sched-note">{project?.startDate ? 'Started' : 'Pending start'}</div>
          </div>
          <div className="sched-date">{project?.startDate ? new Date(project.startDate).toLocaleDateString('en-US', {month: 'short', day: 'numeric', year: 'numeric'}) : 'Pending'}</div>
        </div>
        <div className={`sched-row ${project?.roughInspectionAt ? 'done' : (project?.startDate ? 'current' : 'pending')}`}>
          <span className="sched-ind"></span>
          <div className="sched-main">
            <div className="sched-label">Ready for rough inspection</div>
            <div className="sched-note">{project?.roughInspectionAt ? 'Completed' : 'On track · GC schedules the inspector'}</div>
          </div>
          <div className="sched-date">{project?.roughInspectionAt ? new Date(project.roughInspectionAt).toLocaleDateString('en-US', {month: 'short', day: 'numeric', year: 'numeric'}) : (project?.targetDate ? `Est. ${new Date(project.targetDate).toLocaleDateString('en-US', {month: 'short', day: 'numeric', year: 'numeric'})}` : 'Pending')}</div>
        </div>
        <div className={`sched-row ${project?.finalInspectionAt ? 'done' : 'pending'}`}>
          <span className="sched-ind"></span>
          <div className="sched-main">
            <div className="sched-label">Ready for final inspection</div>
            <div className="sched-note">{project?.finalInspectionAt ? 'Completed' : 'Set once the site returns to us for finishing'}</div>
          </div>
          <div className="sched-date">{project?.finalInspectionAt ? new Date(project.finalInspectionAt).toLocaleDateString('en-US', {month: 'short', day: 'numeric', year: 'numeric'}) : 'Pending'}</div>
        </div>
      </div>

      {/* Phase items */}
      {project?.phases?.map((ph: any, pidx: number) => {
        const phStatus = mapPhaseStatus(ph.status);
        const glab = phStatus === 'done' || phStatus === 'current' ? 'green' : 'muted';
        let wtext = '';
        let wcls = '';
        if (phStatus === 'done') wtext = 'Completed';
        else if (phStatus === 'current') wtext = 'In Progress';
        else if (ph.name === 'Finishing') { wtext = 'Begins when called back'; wcls = ' upcoming'; }
        else if (ph.name === 'Final Inspection') { wtext = 'After finishing'; wcls = ' upcoming'; }
        else { wtext = 'Pending'; wcls = ' upcoming'; }

        return (
          <React.Fragment key={ph.name}>
            {ph.name === 'Finishing' && (
              <div className="st-handoff">
                <div className="st-handoff-ic">
                  <svg viewBox="0 0 24 24" fill="none">
                    <path d="M9 7v10M15 7v10" stroke="#5f6b64" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                </div>
                <div>
                  <div className="st-handoff-title">Site work by others</div>
                  <div className="st-handoff-sub">Drywall, paint, stucco &amp; other trades &mdash; coordinated by the GC. We resume for finishing once the site is ready and we&rsquo;re called back in.</div>
                </div>
              </div>
            )}
            <div className="st-phase">
              <span className={`st-glabel ${glab}`}>{ph.name}</span>
              <span className={`st-window${wcls}`}>{wtext}</span>
            </div>
            {ph.tasks?.map((item: any) => (
              <StItem key={item.name} name={item.name} state={mapStatusToState(item.status)} pidx={pidx} />
            ))}
          </React.Fragment>
        );
      })}

      <div style={{marginTop:'26px'}}>
        <a className="btn-dark" href="mailto:sam.yaghobi@rhinoair.com?subject=1036%20Norman%20Pl">
          <svg viewBox="0 0 24 24" fill="none" style={{width:16,height:16}}>
            <rect x="3" y="5" width="18" height="14" rx="2" stroke="#fff" strokeWidth="1.7"/>
            <path d="M4 7l8 6 8-6" stroke="#fff" strokeWidth="1.7"/>
          </svg>
          Message Rhino Air
        </a>
      </div>
    </div>
  );

  // ── Documents panel ─────────────────────────────────────────────────────────
  const signed = (
    <span className="badge-signed">
      <svg viewBox="0 0 24 24" fill="none" style={{width:11,height:11}}>
        <path d="M5 13l4 4 10-10" stroke="#3d6b1c" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
      Signed
    </span>
  );

  const DocRow = ({ icon, name, meta, badge }: { icon: React.ReactNode; name: string; meta: string; badge?: React.ReactNode }) => (
    <a className="doc-row" href="#" onClick={e => e.preventDefault()}>
      <span className="doc-ico">{icon}</span>
      <div className="doc-body">
        <div className="doc-name">{name}{badge}</div>
        <div className="doc-meta">{meta}</div>
      </div>
      <span className="doc-dl"><Icons.dl /></span>
    </a>
  );

  const DocPending = ({ icon, name }: { icon: React.ReactNode; name: string }) => (
    <div className="doc-row pending">
      <span className="doc-ico">{icon}</span>
      <div className="doc-body">
        <div className="doc-name">{name}</div>
        <div className="pending-tag">
          <Icons.clock style={{width:12,height:12}} />
          Available at completion
        </div>
      </div>
    </div>
  );

  const DocumentsPanel = () => {
    // Group documents by category
    const groupedDocs: Record<string, any[]> = {};
    const categories = [
      'Plans & Blueprints',
      'Estimate',
      'Agreements',
      'Change Orders',
      'Submittals & Spec Sheets',
      'Permits',
      'Certificates',
      'Shared Files'
    ];
    
    // Initialize empty groups
    categories.forEach(cat => groupedDocs[cat] = []);
    
    // Add real documents
    if (project?.documents) {
      project.documents.forEach((doc: any) => {
        const cat = doc.category || 'Shared Files';
        if (!groupedDocs[cat]) groupedDocs[cat] = [];
        groupedDocs[cat].push(doc);
      });
    }

    const handleFileDrop = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        setSelectedFile(file);
        setIsUploadModalOpen(true);
      }
      e.target.value = ''; // Reset input
    };

    return (
      <div className="panel" data-panel="documents">
        {categories.map((cat, i) => {
          const docs = groupedDocs[cat];
          // Determine if we should show this category. 
          // Always show Shared Files at the end, and show others if they have docs or if it's a critical category.
          if (docs.length === 0 && cat !== 'Shared Files') return null;
          
          return (
            <React.Fragment key={cat}>
              <div className="section-label" style={i > 0 ? { marginTop: '30px' } : {}}>
                {cat}
                {docs.length > 0 && (
                  <span className="right">
                    <a href="#" onClick={e => e.preventDefault()}>Download all &darr;</a>
                  </span>
                )}
                {cat === 'Shared Files' && docs.length === 0 && (
                  <span className="right">Uploaded by you &amp; Rhino Air</span>
                )}
              </div>
              
              {docs.map(doc => {
                const isPending = doc.status === 'PENDING';
                const DocIcon = (Icons as any)[doc.icon || 'doc'] || Icons.doc;
                
                if (isPending) {
                  return <DocPending key={doc.documentId} icon={<DocIcon />} name={doc.name} />;
                }
                
                // Format size
                const sizeStr = doc.sizeBytes ? `${(doc.sizeBytes / 1024 / 1024).toFixed(1)} MB` : '';
                const dateStr = new Date(doc.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
                const ext = doc.name.split('.').pop()?.toUpperCase() || 'FILE';
                const meta = `${ext} ${sizeStr ? '· ' + sizeStr : ''} · ${dateStr}`;
                
                const isSigned = doc.status === 'SIGNED' ? signed : undefined;
                
                return (
                  <DocRow 
                    key={doc.documentId} 
                    icon={<DocIcon />} 
                    name={doc.name} 
                    meta={meta} 
                    badge={isSigned} 
                  />
                );
              })}
              
              {cat === 'Shared Files' && (
                <>
                  <div className="upload-note">Drop a file you&rsquo;d like to share on this project &mdash; a revised plan, a photo, an inspection note. Visible to both your team and Rhino Air.</div>
                  <div id="sharedList"></div>
                  <div className="dropzone cursor-pointer" id="dropzone" onClick={() => { setSelectedFile(null); setIsUploadModalOpen(true); }}>
                    <span className="dz-ico">
                      <svg viewBox="0 0 24 24" fill="none">
                        <path d="M12 16V5m0 0l-4 4m4-4l4 4" stroke="#5a9e2f" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M5 19h14" stroke="#5a9e2f" strokeWidth="1.9" strokeLinecap="round"/>
                      </svg>
                    </span>
                    <span className="dz-text">
                      <b>Upload a document</b>
                      <span className="dz-sub">Click to browse or drag a file here &middot; up to 25 MB</span>
                    </span>
                  </div>
                </>
              )}
            </React.Fragment>
          );
        })}
      </div>
    );
  };

  // ── Photos panel ────────────────────────────────────────────────────────────
  const PhotosPanel = () => {
    const roughInPhotos = project?.photos?.filter((p: any) => p.phase === 'Rough-in · Pre-cover Proof') || [];
    const finishPhotos = project?.photos?.filter((p: any) => p.phase === 'Finish & Completion') || [];
    const otherPhotos = project?.photos?.filter((p: any) => p.phase === 'Other') || [];

    return (
      <div className="panel" data-panel="photos">
        <div className="section-label">
          Rough-in &middot; Pre-cover Proof
          {roughInPhotos.length > 0 && <span className="right"><a href="#" onClick={e=>e.preventDefault()}>Download all &darr;</a></span>}
        </div>
        {roughInPhotos.length > 0 ? (
          <div className="photo-grid" style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            {roughInPhotos.map((photo: any) => (
              <a key={photo.photoId} href={photo.imageUrl} target="_blank" rel="noreferrer" style={{ display: 'block', width: '100px', height: '100px', borderRadius: '8px', overflow: 'hidden', border: '1px solid var(--border)' }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={photo.imageUrl} alt={photo.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </a>
            ))}
          </div>
        ) : (
          <div className="photo-empty">Photos available at completion</div>
        )}

        <div className="section-label" style={{marginTop:'26px'}}>Finish &amp; Completion</div>
        {finishPhotos.length > 0 ? (
          <div className="photo-grid" style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            {finishPhotos.map((photo: any) => (
              <a key={photo.photoId} href={photo.imageUrl} target="_blank" rel="noreferrer" style={{ display: 'block', width: '100px', height: '100px', borderRadius: '8px', overflow: 'hidden', border: '1px solid var(--border)' }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={photo.imageUrl} alt={photo.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </a>
            ))}
          </div>
        ) : (
          <div className="photo-empty">Photos available at completion</div>
        )}

        {otherPhotos.length > 0 && (
          <>
            <div className="section-label" style={{marginTop:'26px'}}>Other Photos</div>
            <div className="photo-grid" style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              {otherPhotos.map((photo: any) => (
                <a key={photo.photoId} href={photo.imageUrl} target="_blank" rel="noreferrer" style={{ display: 'block', width: '100px', height: '100px', borderRadius: '8px', overflow: 'hidden', border: '1px solid var(--border)' }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={photo.imageUrl} alt={photo.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </a>
              ))}
            </div>
          </>
        )}
      </div>
    );
  };

  // ── Estimate panel ──────────────────────────────────────────────────────────
  const EstimatePanel = () => (
    <div className="panel" data-panel="estimate">
      <div className="section-label">
        Estimate History
        <span className="right"><Link href={`/calculator?projectId=${unwrappedParams.id}`}>New version &rarr;</Link></span>
      </div>
      
      {(!project?.quotes || project.quotes.length === 0) && (
        <div style={{ padding: 40, textAlign: 'center', color: 'var(--tx-sub)' }}>
          No estimates found for this project.
        </div>
      )}

      {project?.quotes && project.quotes.map((q: any, idx: number) => (
        <div className={`est-card ${idx === 0 ? 'accepted' : 'superseded'}`} key={q.quoteId}>
          <div className="est-info">
            <div className="est-quote">
              {q.quoteNumber || `Quote #${q.quoteId.slice(0,6)}`}
              {idx === 0 ? <span className="badge-accepted">Active</span> : <span className="badge-superseded">Previous</span>}
            </div>
            <div className="est-scope">{q.scope || 'N/A'}</div>
            <div className="est-date">{q.tierLabel ? `Tier ${q.tierLabel.split(' ')[0]}` : 'N/A'} &middot; {new Date(q.createdAt).toLocaleDateString()}</div>
          </div>
          <div className="est-right">
            <div className="est-price">${Number(q.total).toLocaleString()}</div>
            <div className="est-actions">
              <button className="btn-ghost" onClick={() => setSelectedQuote(q)}>View</button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  // ── Invoices panel ──────────────────────────────────────────────────────────
  const InvoicesPanel = () => (
    <div className="panel" data-panel="invoices">
      <div className="balance-row" id="balanceRow">
        <div className="balance-card">
          <div className="b-lbl">Contract total</div>
          <div className="b-num" id="bContract">${adjustedTotal.toLocaleString()}</div>
          <div className="b-adj" id="bContractAdj">${coBase.toLocaleString()} base + ${coApprovedTotal.toLocaleString()} change orders</div>
        </div>
        <div className="balance-card green">
          <div className="b-lbl">Paid to date</div>
          <div className="b-num">${dynamicPaid.toLocaleString()}</div>
        </div>
        <div className="balance-card amber">
          <div className="b-lbl">Outstanding</div>
          <div className="b-num" id="bOutstanding">${outstanding.toLocaleString()}</div>
        </div>
      </div>

      {/* Change Orders */}
      <div className="section-label">
        Change Orders
        <span className="right" id="coNote">
          {project?.changeOrders?.filter((co: any) => co.status === 'APPROVED').length || 0} approved
        </span>
      </div>

      {project?.changeOrders?.length > 0 ? project.changeOrders.map((co: any) => (
        <React.Fragment key={co.changeOrderId}>
          {co.status === 'PENDING' && (
            <div className="inv-row co-row co-pending">
              <span className="inv-num">{co.number}</span>
              <div className="inv-for">
                {co.title}
                <div className="inv-date">Pending</div>
              </div>
              <span className="inv-amount co-amt">+${parseFloat(co.amount || 0).toLocaleString()}</span>
              <span className="inv-badge due">Pending you</span>
              <div className="co-actions">
                <button 
                  className="co-btn decline" 
                  onClick={() => handleDecideCO(co.changeOrderId, false)}
                  disabled={processingCO?.id === co.changeOrderId}
                  style={{ opacity: processingCO?.id === co.changeOrderId ? 0.6 : 1, cursor: processingCO?.id === co.changeOrderId ? 'not-allowed' : 'pointer' }}
                >
                  {processingCO?.id === co.changeOrderId && processingCO?.type === 'decline' ? 'Declining...' : 'Decline'}
                </button>
                <button 
                  className="co-btn approve" 
                  onClick={() => handleDecideCO(co.changeOrderId, true)}
                  disabled={processingCO?.id === co.changeOrderId}
                  style={{ opacity: processingCO?.id === co.changeOrderId ? 0.6 : 1, cursor: processingCO?.id === co.changeOrderId ? 'not-allowed' : 'pointer' }}
                >
                  {processingCO?.id === co.changeOrderId && processingCO?.type === 'approve' ? 'Approving...' : 'Approve'}
                </button>
              </div>
            </div>
          )}
          {co.status === 'APPROVED' && (
            <a className="inv-row co-row" href="#" onClick={e=>e.preventDefault()}>
              <span className="inv-num">{co.number}</span>
              <div className="inv-for">
                {co.title}
                <div className="inv-date">Approved</div>
              </div>
              <span className="inv-amount co-amt">+${parseFloat(co.amount || 0).toLocaleString()}</span>
              <span className="inv-badge paid">Approved</span>
            </a>
          )}
          {co.status === 'DECLINED' && (
            <a className="inv-row co-row declined-row" href="#" onClick={e=>e.preventDefault()}>
              <span className="inv-num">{co.number}</span>
              <div className="inv-for">
                {co.title}
                <div className="inv-date">Declined</div>
              </div>
              <span className="inv-amount co-amt" style={{opacity:.5,textDecoration:'line-through'}}>+${parseFloat(co.amount || 0).toLocaleString()}</span>
              <span className="inv-badge overdue">Declined</span>
            </a>
          )}
        </React.Fragment>
      )) : (
        <div style={{color:'#666', fontSize:'14px', marginTop:'8px'}}>No change orders found.</div>
      )}

      {/* Invoices */}
      <div className="section-label" style={{marginTop:'28px'}}>Invoices</div>
      {project?.invoices?.length > 0 ? project.invoices.map((inv: any) => (
        <a key={inv.invoiceId} className="inv-row" href="#" onClick={e=>e.preventDefault()}>
          <span className="inv-num">INV-{inv.invoiceNumber}</span>
          <div className="inv-for">
            {inv.description || 'Job Invoice'}
            <div className="inv-date">Issued {new Date(inv.createdAt).toLocaleDateString('en-US', {month: 'short', day: 'numeric', year: 'numeric'})}</div>
          </div>
          <span className="inv-amount">${parseFloat(inv.amount || 0).toLocaleString()}</span>
          <span className={`inv-badge ${inv.status === 'PAID' ? 'paid' : 'due'}`}>
            {inv.status === 'PAID' ? 'Paid' : 'Due'}
          </span>
        </a>
      )) : (
        <div style={{color:'#666', fontSize:'14px', marginTop:'8px'}}>No invoices found for this project.</div>
      )}
    </div>
  );

  return (
    <>
      <a className="backlink" href="/projects">
        <svg viewBox="0 0 24 24" fill="none" style={{width:14,height:14}}>
          <path d="M15 6l-6 6 6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        All projects
      </a>

      {/* Project header — uses exact original proj-header structure */}
      <div className="proj-header">
        <div className="ph-id">
          <span className="ph-ico"><Icons.home_dark style={{width:25,height:25}} /></span>
          <div>
            <h1>{project?.name || 'Loading Project...'}</h1>
            <div className="ph-sub">{project?.company?.name || 'Unknown Partner'} &middot; {project?.address || 'No Address Provided'}</div>
          </div>
        </div>
        <span className={`phase ${project?.phaseClass || 'planning'}`}>{project?.currentPhase || 'Planning'}</span>
      </div>

      {/* Tabs */}
      <div className="tabs">
        {['status','documents','photos','estimate','invoices'].map(t => (
          <button
            key={t}
            className={`tab${tab === t ? ' active' : ''}`}
            data-tab={t}
            onClick={() => switchTab(t)}
          >
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      {tab === 'status'    && <StatusPanel />}
      {tab === 'documents' && <DocumentsPanel />}
      {tab === 'photos'    && <PhotosPanel />}
      {tab === 'estimate'  && <EstimatePanel />}
      {tab === 'invoices'  && <InvoicesPanel />}

      <Dialog open={!!selectedQuote} onOpenChange={(open) => !open && setSelectedQuote(null)}>
        <DialogContent style={{ maxWidth: 500, padding: 24 }} aria-describedby={undefined}>
          <DialogHeader>
            <DialogTitle style={{ marginBottom: 20 }}>Estimate {selectedQuote?.quoteNumber || (selectedQuote && `RA-${selectedQuote.quoteId.slice(0,6)}`)}</DialogTitle>
          </DialogHeader>
          
          {selectedQuote && (
            <>
            <div style={{ fontSize: 28, fontWeight: 700, marginBottom: 24, color: 'var(--ink)' }}>
              ${Number(selectedQuote.total).toLocaleString()}
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 32 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', paddingBottom: 12 }}>
                <span style={{ fontSize: 11, color: 'var(--tx-sub)', textTransform: 'uppercase', letterSpacing: 1 }}>Quote</span>
                <span style={{ fontWeight: 600 }}>{selectedQuote.quoteNumber || `RA-${selectedQuote.quoteId.slice(0,6)}`}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', paddingBottom: 12 }}>
                <span style={{ fontSize: 11, color: 'var(--tx-sub)', textTransform: 'uppercase', letterSpacing: 1 }}>Scope</span>
                <span style={{ fontWeight: 600 }}>{selectedQuote.scope || 'N/A'}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', paddingBottom: 12 }}>
                <span style={{ fontSize: 11, color: 'var(--tx-sub)', textTransform: 'uppercase', letterSpacing: 1 }}>Pricing Tier</span>
                <span style={{ fontWeight: 600 }}>{selectedQuote.tierLabel || 'N/A'}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', paddingBottom: 12 }}>
                <span style={{ fontSize: 11, color: 'var(--tx-sub)', textTransform: 'uppercase', letterSpacing: 1 }}>Date</span>
                <span style={{ fontWeight: 600 }}>{new Date(selectedQuote.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', paddingBottom: 12 }}>
                <span style={{ fontSize: 11, color: 'var(--tx-sub)', textTransform: 'uppercase', letterSpacing: 1 }}>Status</span>
                <span style={{ fontWeight: 600 }}>{
                  selectedQuote.status === 'ACCEPTED' ? 'Accepted' :
                  selectedQuote.status === 'REJECTED' ? 'Rejected' :
                  selectedQuote.status === 'APPROVED' ? 'Approved' :
                  selectedQuote.status === 'SUPERSEDED' ? 'Superseded' :
                  selectedQuote.status === 'SUBMITTED' ? 'Submitted' :
                  selectedQuote.status === 'DRAFT' ? 'Draft' :
                  selectedQuote.status
                }</span>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 12 }}>
              <button className="btn-ghost" style={{ flex: 1, border: '1px solid var(--border)' }}>Download PDF</button>
              <Link href={`/calculator?quoteId=${selectedQuote.quoteId}`} style={{ flex: 1, textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0F2228', color: '#fff', fontWeight: 700, fontSize: 15, padding: '14px 22px', borderRadius: 12, textDecoration: 'none', transition: '.16s' }}>
                Open in calculator
              </Link>
            </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      <UploadDocumentModal 
        isOpen={isUploadModalOpen} 
        onClose={() => setIsUploadModalOpen(false)} 
        projectId={unwrappedParams.id} 
        initialFile={selectedFile} 
      />
    </>
  );
}
