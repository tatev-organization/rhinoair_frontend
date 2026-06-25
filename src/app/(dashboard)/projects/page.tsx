import React from 'react';
import Link from 'next/link';
import { Icons } from '@/components/ui/Icons';

const PH4 = ['Planning', 'Rough-in', 'Finishing', 'Final'];

function seg_cls(i: number, cur: number): string {
  if (i > cur) return '';
  return i <= 1 ? 'blue' : 'green';
}

function Track4({ cur }: { cur: number }) {
  return (
    <>
      <div className="track">
        {[0,1,2,3].map(i => (
          <span key={i} className={`seg${seg_cls(i, cur) ? ' '+seg_cls(i,cur) : ''}`}></span>
        ))}
      </div>
      <div className="track-labels">
        {PH4.map((nm, i) => {
          const col = i <= 1 ? 'blue' : 'green';
          if (i === cur) return <span key={i} className={`cur ${col}`}>{nm}</span>;
          if (i < cur)  return <span key={i} className="done">{nm}</span>;
          return <span key={i}>{nm}</span>;
        })}
      </div>
    </>
  );
}

function ProjCard({ name, sub, phase, phaseCls, cur, docs, price, docRef, quoted }:
  { name:string; sub:string; phase:string; phaseCls:string; cur?:number; docs?:number; price?:string; docRef?:string; quoted?:boolean }) {
  return (
    <Link className="pcard" href="/projects/1">
      <div className="pcard-top">
        <div className="pcard-id">
          <span className="pcard-ico"><Icons.home /></span>
          <div>
            <div className="pcard-name">{name}</div>
            <div className="pcard-sub">{sub}</div>
          </div>
        </div>
        <span className={`phase ${phaseCls}`}>{phase}</span>
      </div>
      {cur !== undefined && <Track4 cur={cur} />}
      <div className="pcard-meta">
        {docs !== undefined && <span><Icons.doc />{docs} documents</span>}
        {docRef && price && <span><Icons.doc />{docRef} &middot; {price}</span>}
        <span><Icons.home />{quoted ? 'Awaiting approval' : 'Single-family residence'}</span>
      </div>
    </Link>
  );
}

export default function ProjectsPage() {
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
          <div className="tag">All Projects</div>
          <h1>Projects</h1>
          <div className="subtitle">3 active &middot; 1 quoted &middot; 4 completed this agreement year</div>
        </div>
        <Link className="btn-primary" href="/calculator">
          <Icons.calc />New Estimate
        </Link>
      </div>

      <div className="section-label">Active</div>
      <section className="projects">
        <ProjCard name="1036 Norman Pl" sub="Daikin VRV · 5-Ton" phase="Rough-in" phaseCls="roughin" cur={1} docs={9} />
        <ProjCard name="1030 Norman Pl" sub="Ducted Heat Pump · 4-Ton" phase="Finishing" phaseCls="finishing" cur={2} docs={11} />
        <ProjCard name="Malibu Rebuild" sub="Daikin VRV · 6-Ton" phase="Planning" phaseCls="planning" cur={0} docs={4} />
      </section>

      <div className="section-label">Quoted</div>
      <section className="projects">
        <ProjCard name="Bel Air Rebuild" sub="Daikin VRV · 5-Ton · estimate ready" phase="Quoted" phaseCls="quoted" docRef="RA-104915" price="$27,500" quoted />
      </section>

      <div className="section-label">Completed</div>
      <section className="projects">
        <ProjCard name="3928 Sunset Dr" sub="Daikin VRV · 4-Ton" phase="Complete" phaseCls="complete" cur={3} docs={14} />
        <ProjCard name="1142 Linda Vista" sub="Ducted Heat Pump · 5-Ton" phase="Complete" phaseCls="complete" cur={3} docs={12} />
        <ProjCard name="1455 Casiano Rd" sub="Daikin VRV · 5-Ton" phase="Complete" phaseCls="complete" cur={3} docs={16} />
        <ProjCard name="618 Lachman Ln" sub="Ducted Heat Pump · 4-Ton" phase="Complete" phaseCls="complete" cur={3} docs={13} />
      </section>
    </>
  );
}
