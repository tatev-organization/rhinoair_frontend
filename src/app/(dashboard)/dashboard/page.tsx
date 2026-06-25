import React from 'react';
import Link from 'next/link';
import { Icons } from '@/components/ui/Icons';
import { ProjectCard } from '@/components/ui/ProjectCard';
import { activeProjects } from '@/lib/dummyData';

export default function DashboardPage() {
  return (
    <>
      <section className="welcome">
        <div>
          <div className="tag">Welcome back</div>
          <h1 id="dashCompany">Mid Construction Group</h1>
          <div className="sub">
            <span className="tier-chip">
              <Icons.trophy />
              <span id="dashTier">Tier 4 Partner</span>
            </span>
            <span className="dot-sep"></span>
            <span>3 Active Projects</span>
          </div>
        </div>
        <Link className="btn-primary" href="/calculator">
          <Icons.calc />New Estimate
        </Link>
      </section>

      <section className="attention" aria-label="Needs your attention">
        <div className="att-head">
          <span className="ico"><Icons.bell /></span>
          <h2>Needs Your Attention</h2>
          <span className="att-count">3</span>
        </div>
        <Link className="att-item" href="/projects">
          <span className="lead"><Icons.doc /></span>
          <span className="txt"><b>New estimate ready</b> <span className="proj">&mdash; Bel Air Rebuild</span></span>
          <span className="go"><Icons.chev /></span>
        </Link>
        <Link className="att-item" href="/projects/1#documents">
          <span className="lead"><Icons.sign /></span>
          <span className="txt"><b>Subcontract ready to sign</b> <span className="proj">&mdash; 1030 Norman Pl</span></span>
          <span className="go"><Icons.chev /></span>
        </Link>
        <Link className="att-item" href="/projects/1#invoices">
          <span className="lead"><Icons.invoice /></span>
          <span className="txt"><b>Invoice due soon</b> <span className="proj">&mdash; 1036 Norman Pl &middot; $7,950</span></span>
          <span className="go"><Icons.chev /></span>
        </Link>
      </section>

      <div className="section-label">
        Active Projects
        <span className="right"><Link href="/projects">View all &rarr;</Link></span>
      </div>
      
      <section className="projects">
        {activeProjects.map(project => (
          <ProjectCard key={project.id} project={project} />
        ))}
      </section>

      <div className="section-label">At a Glance</div>
      <section className="stats">
        <div className="stat">
          <div className="num">3</div>
          <div className="lbl">Active Jobs</div>
        </div>
        <div className="stat">
          <div className="num">1</div>
          <div className="lbl">Open Estimate</div>
        </div>
        <div className="stat accent">
          <div className="num">8</div>
          <div className="lbl">Approved &middot; Agreement Yr</div>
        </div>
      </section>
      
      <div className="tier-progress">
        <div className="tp-top">
          <span className="tp-label">
            <Icons.trophy style={{ color: '#5a9e2f' }} />
            Tier 4 Agreement
          </span>
          <span className="tp-status">On track</span>
        </div>
        <div className="tp-bar"><i style={{ width: '67%' }}></i></div>
        <div className="tp-sub">8 of 12 approved &middot; this agreement year</div>
      </div>
    </>
  );
}
