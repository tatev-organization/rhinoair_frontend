'use client';

import React from 'react';
import { Icons } from '@/components/ui/Icons';

export default function InvoicesPage() {
  return (
    <>
      <a className="backlink" href="/dashboard">
        <svg viewBox="0 0 24 24" fill="none" style={{width:14,height:14}}>
          <path d="M15 6l-6 6 6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        Dashboard
      </a>

      <div className="pagehead">
        <div>
          <div className="tag">Billing</div>
          <h1>Invoices</h1>
          <div className="subtitle">Across all projects</div>
        </div>
      </div>

      {/* Balance summary cards */}
      <div className="balance-row">
        <div className="balance-card amber">
          <div className="b-lbl">Total outstanding</div>
          <div className="b-num">$23,650</div>
        </div>
        <div className="balance-card red">
          <div className="b-lbl">Overdue</div>
          <div className="b-num">$3,400</div>
        </div>
        <div className="balance-card">
          <div className="b-lbl">Scheduled</div>
          <div className="b-num">$17,200</div>
        </div>
        <div className="balance-card">
          <div className="b-lbl">Open invoices</div>
          <div className="b-num">3</div>
        </div>
      </div>

      {/* Open invoices */}
      <div className="section-label">Open</div>

      <div className="inv-group-title">
        <span className="gt-ico">
          <Icons.home_dark style={{width:14,height:14}} />
        </span>
        1036 Norman Pl
      </div>
      <a className="inv-row" href="#" onClick={e => e.preventDefault()}>
        <span className="inv-num">INV-2068</span>
        <div className="inv-for">
          Rough-in progress (30%)
          <div className="inv-date due">Due Jun 30, 2026 <span className="due-rel soon">&middot; in 13 days</span></div>
        </div>
        <span className="inv-amount">$7,950</span>
        <span className="inv-badge due">Due</span>
      </a>

      <div className="inv-group-title">
        <span className="gt-ico">
          <Icons.home_dark style={{width:14,height:14}} />
        </span>
        1030 Norman Pl
      </div>
      <a className="inv-row" href="#" onClick={e => e.preventDefault()}>
        <span className="inv-num">INV-2057</span>
        <div className="inv-for">
          Change order &mdash; added zone
          <div className="inv-date due">Due Jun 5, 2026 <span className="due-rel overdue">&middot; 12 days overdue</span></div>
        </div>
        <span className="inv-amount">$3,400</span>
        <span className="inv-badge overdue">Overdue</span>
      </a>
      <a className="inv-row" href="#" onClick={e => e.preventDefault()}>
        <span className="inv-num">INV-2071</span>
        <div className="inv-for">
          Finishing progress (40%)
          <div className="inv-date due">Due Jul 15, 2026 <span className="due-rel ok">&middot; in 28 days</span></div>
        </div>
        <span className="inv-amount">$12,300</span>
        <span className="inv-badge due">Due</span>
      </a>

      {/* Upcoming / Scheduled */}
      <div className="section-label" style={{marginTop:'30px'}}>Upcoming</div>
      <div className="list-note">Scheduled draws &mdash; billed as each phase completes. Amounts are estimates.</div>
      <div className="inv-row scheduled">
        <span className="inv-num">&mdash;</span>
        <div className="inv-for">
          Completion (30%) &middot; 1036 Norman Pl
          <div className="inv-date">Scheduled &middot; on completion</div>
        </div>
        <span className="inv-amount">$7,950</span>
        <span className="inv-badge scheduled">Scheduled</span>
      </div>
      <div className="inv-row scheduled">
        <span className="inv-num">&mdash;</span>
        <div className="inv-for">
          Final balance &middot; 1030 Norman Pl
          <div className="inv-date">Scheduled &middot; on final inspection</div>
        </div>
        <span className="inv-amount">$9,250</span>
        <span className="inv-badge scheduled">Scheduled</span>
      </div>

      {/* Recently Paid */}
      <div className="section-label" style={{marginTop:'30px'}}>
        Recently Paid
        <span className="right"><a href="#" onClick={e => e.preventDefault()}>Full history &rarr;</a></span>
      </div>
      <a className="inv-row" href="#" onClick={e => e.preventDefault()}>
        <span className="inv-num">INV-2041</span>
        <div className="inv-for">
          Deposit &middot; 1036 Norman Pl
          <div className="inv-date">Paid Jun 4, 2026</div>
        </div>
        <span className="inv-amount">$10,600</span>
        <span className="inv-badge paid">Paid</span>
      </a>
      <a className="inv-row" href="#" onClick={e => e.preventDefault()}>
        <span className="inv-num">INV-2039</span>
        <div className="inv-for">
          Rough-in &middot; 1030 Norman Pl
          <div className="inv-date">Paid May 28, 2026</div>
        </div>
        <span className="inv-amount">$9,200</span>
        <span className="inv-badge paid">Paid</span>
      </a>
      <a className="inv-row" href="#" onClick={e => e.preventDefault()}>
        <span className="inv-num">INV-2012</span>
        <div className="inv-for">
          Final &middot; 3928 Sunset Dr
          <div className="inv-date">Paid May 12, 2026</div>
        </div>
        <span className="inv-amount">$31,400</span>
        <span className="inv-badge paid">Paid</span>
      </a>
    </>
  );
}
