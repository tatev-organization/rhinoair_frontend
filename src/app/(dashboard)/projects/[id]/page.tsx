'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Icons } from '@/components/ui/Icons';

import { useGetProjectByIdQuery } from '@/redux/features/projects/projectsApi';

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
const CO_BASE = 26500;
const CO_PAID = 10600;
const CO_APPROVED = 3200;

export default function ProjectDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const unwrappedParams = React.use(params);
  const { data: response, isLoading } = useGetProjectByIdQuery(unwrappedParams.id);
  const project = response?.data;

  const [tab, setTab] = useState('status');
  const [co02State, setCo02State] = useState<'pending' | 'approved' | 'declined'>('pending');
  const [adjustedTotal, setAdjustedTotal] = useState(CO_BASE + CO_APPROVED);

  useEffect(() => {
    const hash = window.location.hash.replace('#', '');
    if (['status','documents','photos','estimate','invoices'].includes(hash)) setTab(hash);
  }, []);

  const switchTab = (t: string) => { setTab(t); window.location.hash = t; };

  const decideCO = (approve: boolean) => {
    if (approve) {
      setCo02State('approved');
      setAdjustedTotal(prev => prev + 1800);
    } else {
      setCo02State('declined');
    }
  };

  const dynamicPaid = project?.invoices?.filter((i: any) => i.status === 'PAID').reduce((acc: number, curr: any) => acc + parseFloat(curr.amount || 0), 0) || 0;
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

  const DocumentsPanel = () => (
    <div className="panel" data-panel="documents">
      <div className="section-label">
        Plans &amp; Blueprints
        <span className="right">
          <a href="#" onClick={e => e.preventDefault()}>Download all &darr;</a>
        </span>
      </div>
      <DocRow icon={<Icons.plan />} name="Mechanical plan set (T24, ductwork, schedules)" meta="PDF · 2.4 MB · Jun 2, 2026" />
      <DocRow icon={<Icons.plan />} name="Floor plans" meta="PDF · 1.1 MB · Jun 2, 2026" />
      <DocRow icon={<Icons.plan />} name="RCP — Reflected ceiling plan" meta="PDF · 1.3 MB · Jun 2, 2026" />
      <DocRow icon={<Icons.plan />} name="Structural plans" meta="PDF · 1.8 MB · Jun 2, 2026" />

      <div className="section-label">Estimate</div>
      <DocRow icon={<Icons.doc />} name="Installation estimate — RA-104872" meta="PDF · 180 KB · Jun 5, 2026" />

      <div className="section-label">Agreements</div>
      <DocRow icon={<Icons.sign />} name="Subcontract agreement" meta="PDF · 320 KB · Jun 8, 2026" badge={signed} />

      <div className="section-label">Change Orders</div>
      <DocRow icon={<Icons.sign />} name="CO-01 — Added third zone (master suite)" meta="PDF · 210 KB · Jun 14, 2026" badge={signed} />
      <DocPending icon={<Icons.sign />} name="CO-02 — Concealed ducted head (home office)" />

      <div className="section-label">Submittals &amp; Spec Sheets</div>
      <DocRow icon={<Icons.spec />} name="Daikin VRV submittal package" meta="PDF · 4.2 MB · Jun 10, 2026" />
      <DocRow icon={<Icons.spec />} name="Condenser cut sheet" meta="PDF · 600 KB · Jun 10, 2026" />

      <div className="section-label">Permits</div>
      <DocRow icon={<Icons.permit />} name="Mechanical permit" meta="PDF · 240 KB · Jun 12, 2026" />

      <div className="section-label">Certificates</div>
      <DocRow icon={<Icons.cert />} name="AHRI / Energy Star rating" meta="PDF · 150 KB · Jun 2, 2026" />
      <DocPending icon={<Icons.cert />} name="HERS certificate (duct leakage & charge)" />
      <DocPending icon={<Icons.cert />} name="Warranty certificate" />

      <div className="section-label" style={{marginTop:'30px'}}>
        Shared Files
        <span className="right">Uploaded by you &amp; Rhino Air</span>
      </div>
      <div className="upload-note">Drop a file you&rsquo;d like to share on this project &mdash; a revised plan, a photo, an inspection note. Visible to both your team and Rhino Air.</div>
      <div id="sharedList"></div>
      <label className="dropzone" id="dropzone">
        <input type="file" multiple style={{display:'none'}} />
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
      </label>
    </div>
  );

  // ── Photos panel ────────────────────────────────────────────────────────────
  const PhotosPanel = () => (
    <div className="panel" data-panel="photos">
      <div className="section-label">
        Rough-in &middot; Pre-cover Proof
        <span className="right"><a href="#" onClick={e=>e.preventDefault()}>Download all &darr;</a></span>
      </div>
      <div className="photo-grid">
        {[0,1,2,3,4].map(i => (
          <div key={i} className="photo-tile" onClick={() => {}}>
            <Icons.photo style={{width:30,height:30,opacity:.32}} />
          </div>
        ))}
        <div className="photo-tile more" onClick={() => {}}><span>+12</span></div>
      </div>
      <div className="section-label" style={{marginTop:'26px'}}>Finish &amp; Completion</div>
      <div className="photo-empty">Photos available at completion</div>
    </div>
  );

  // ── Estimate panel ──────────────────────────────────────────────────────────
  const EstimatePanel = () => (
    <div className="panel" data-panel="estimate">
      <div className="section-label">
        Estimate History
        <span className="right"><a href="/calculator">New version &rarr;</a></span>
      </div>
      <div className="est-card accepted">
        <div className="est-info">
          <div className="est-quote">
            RA-104872
            <span className="badge-accepted">Accepted</span>
          </div>
          <div className="est-scope">Daikin VRV &middot; 5-Ton &middot; 2 zones</div>
          <div className="est-date">Tier 4 &middot; Jun 5, 2026</div>
        </div>
        <div className="est-right">
          <div className="est-price">$26,500</div>
          <div className="est-actions">
            <button className="btn-ghost" onClick={() => {}}>View</button>
            <button className="btn-ghost" onClick={() => {}}>
              <Icons.dl style={{color:'#0d1b1e'}} />
            </button>
          </div>
        </div>
      </div>
      <div className="est-card superseded">
        <div className="est-info">
          <div className="est-quote">
            RA-104810
            <span className="badge-superseded">Superseded</span>
          </div>
          <div className="est-scope">Goodman &middot; 5-Ton &middot; single zone</div>
          <div className="est-date">Tier 4 &middot; May 28, 2026</div>
        </div>
        <div className="est-right">
          <div className="est-price">$24,500</div>
          <div className="est-actions">
            <button className="btn-ghost">View</button>
            <button className="btn-ghost"><Icons.dl style={{color:'#0d1b1e'}} /></button>
          </div>
        </div>
      </div>
    </div>
  );

  // ── Invoices panel ──────────────────────────────────────────────────────────
  const InvoicesPanel = () => (
    <div className="panel" data-panel="invoices">
      <div className="balance-row" id="balanceRow">
        <div className="balance-card">
          <div className="b-lbl">Contract total</div>
          <div className="b-num" id="bContract">${adjustedTotal.toLocaleString()}</div>
          <div className="b-adj" id="bContractAdj">${CO_BASE.toLocaleString()} base + ${(adjustedTotal - CO_BASE).toLocaleString()} change orders</div>
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
          {co02State === 'approved' ? '2 approved' : co02State === 'declined' ? '1 approved · 1 declined' : '1 approved · 1 awaiting you'}
        </span>
      </div>

      {/* CO-01: approved */}
      <a className="inv-row co-row" href="#" onClick={e=>e.preventDefault()}>
        <span className="inv-num">CO-01</span>
        <div className="inv-for">
          Added third zone &mdash; master suite
          <div className="inv-date">Approved Jun 14, 2026</div>
        </div>
        <span className="inv-amount co-amt">+$3,200</span>
        <span className="inv-badge paid">Approved</span>
      </a>

      {/* CO-02: pending / decided */}
      {co02State === 'pending' && (
        <div className="inv-row co-row co-pending" id="co02">
          <span className="inv-num">CO-02</span>
          <div className="inv-for">
            Upgrade to concealed ducted head &mdash; home office
            <div className="inv-date">Submitted Jun 18, 2026</div>
          </div>
          <span className="inv-amount co-amt">+$1,800</span>
          <span className="inv-badge due">Pending you</span>
          <div className="co-actions">
            <button className="co-btn decline" onClick={() => decideCO(false)}>Decline</button>
            <button className="co-btn approve" onClick={() => decideCO(true)}>Approve</button>
          </div>
        </div>
      )}
      {co02State === 'approved' && (
        <a className="inv-row co-row" href="#" onClick={e=>e.preventDefault()}>
          <span className="inv-num">CO-02</span>
          <div className="inv-for">
            Upgrade to concealed ducted head &mdash; home office
            <div className="inv-date">Approved</div>
          </div>
          <span className="inv-amount co-amt">+$1,800</span>
          <span className="inv-badge paid">Approved</span>
        </a>
      )}
      {co02State === 'declined' && (
        <a className="inv-row co-row declined-row" href="#" onClick={e=>e.preventDefault()}>
          <span className="inv-num">CO-02</span>
          <div className="inv-for">
            Upgrade to concealed ducted head &mdash; home office
            <div className="inv-date">Declined</div>
          </div>
          <span className="inv-amount co-amt" style={{opacity:.5,textDecoration:'line-through'}}>+$1,800</span>
          <span className="inv-badge overdue">Declined</span>
        </a>
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
    </>
  );
}
