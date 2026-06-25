'use client';

import React from 'react';
import Link from 'next/link';
import { Icons } from '@/components/ui/Icons';

export default function ToolsPage() {
  return (
    <div style={{maxWidth:'880px'}}>
      <a className="backlink" href="/dashboard">
        <svg viewBox="0 0 24 24" fill="none" style={{width:14,height:14}}>
          <path d="M15 6l-6 6 6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        Dashboard
      </a>

      <div className="pagehead">
        <div>
          <div className="tag">Tools</div>
          <h1>Tools</h1>
          <div className="subtitle">Estimating &amp; sizing tools for your projects</div>
        </div>
      </div>

      {/* Featured Tool: Calculator */}
      <div className="tool-card featured">
        <div className="tool-top">
          <span className="tool-ico">
            <Icons.calc />
          </span>
          <div>
            <div className="tool-name">
              Estimate Calculator
              <span className="badge-available">
                <span className="dot"></span>Available
              </span>
            </div>
            <div className="tool-desc">
              Build a complete HVAC installation estimate with your partner pricing built in. Add multiple systems, choose equipment, and generate a branded PDF quote.
            </div>
          </div>
        </div>
        <div className="cap-row">
          <span className="cap">
            <svg viewBox="0 0 24 24" fill="none" style={{width:15,height:15}}>
              <path d="M5 13l4 4 10-10" stroke="#5a9e2f" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Your tier pricing
          </span>
          <span className="cap">
            <svg viewBox="0 0 24 24" fill="none" style={{width:15,height:15}}>
              <path d="M5 13l4 4 10-10" stroke="#5a9e2f" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Multiple systems
          </span>
          <span className="cap">
            <svg viewBox="0 0 24 24" fill="none" style={{width:15,height:15}}>
              <path d="M5 13l4 4 10-10" stroke="#5a9e2f" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            PDF quote
          </span>
        </div>
        <div className="tool-footer">
          <span className="last">Last used &middot; Jun 5, 2026</span>
          <Link className="btn-primary" href="/calculator">Open calculator &rarr;</Link>
        </div>
      </div>

      {/* Muted Tool: Duct Calculator */}
      <div className="tool-card muted">
        <div className="tool-top">
          <span className="tool-ico">
            <Icons.duct />
          </span>
          <div>
            <div className="tool-name">
              Duct Calculator
              <span className="badge-dev">In development</span>
            </div>
            <div className="tool-desc">
              Size trunk and branch ducts by airflow and friction rate. Coming soon to the partner portal.
            </div>
          </div>
        </div>
      </div>

      <div className="more-tools">More tools on the way &mdash; load calcs, equipment sizing &amp; more</div>
    </div>
  );
}
