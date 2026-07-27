'use client';

import React from 'react';
import Link from 'next/link';
import { Icons } from '@/components/ui/Icons';
import { useGetMyProjectsQuery } from '@/redux/features/projects/projectsApi';

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

function ProjCard({ 
  id, name, sub, phase, phaseCls, cur, docs, price, docRef, quoted, stName 
}: { 
  id: string; name:string; sub:string; phase:string; phaseCls:string; cur?:number; docs?:number; price?:string; docRef?:string; quoted?:boolean; stName?:string 
}) {
  return (
    <Link className="pcard" href={`/projects/${id}`}>
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
        <span><Icons.home />{quoted ? 'Awaiting approval' : (stName || 'Single-family residence')}</span>
      </div>
    </Link>
  );
}

export default function ProjectsPage() {
  const { data: projects, isLoading } = useGetMyProjectsQuery(undefined, {
    pollingInterval: 15000, // Poll every 15 seconds to simulate live ST updates
    refetchOnFocus: true,
  });

  if (isLoading) {
    return <div style={{ padding: 40, textAlign: 'center' }}>Loading projects...</div>;
  }

  const projectList = Array.isArray(projects) ? projects : projects?.data || [];

  const activeProjects = projectList.filter((p: any) => p.status === 'ACTIVE' && p.currentPhaseIndex < 3) || [];
  const completedProjects = projectList.filter((p: any) => p.status === 'COMPLETED' || p.currentPhaseIndex === 3) || [];
  const quotedProjectsRaw = projectList.filter((p: any) => p.status === 'QUOTED') || [];
  
  // We no longer manually deduplicate here because the backend handles merging orphaned quotes securely.
  const quotedProjects = quotedProjectsRaw;

  return (
    <>
      <Link className="backlink" href="/dashboard">
        <svg viewBox="0 0 24 24" fill="none" style={{width:14,height:14}}>
          <path d="M15 6l-6 6 6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        Dashboard
      </Link>

      <div className="pagehead">
        <div>
          <div className="tag">All Projects</div>
          <h1>Projects</h1>
          <div className="subtitle">
            {activeProjects.length} active &middot; {quotedProjects.length} quoted &middot; {completedProjects.length} completed
          </div>
        </div>
        <Link className="btn-primary" href="/calculator">
          <Icons.calc />New Estimate
        </Link>
      </div>

      {activeProjects.length > 0 && (
        <>
          <div className="section-label">Active</div>
          <section className="projects">
            {activeProjects.map((p: any) => (
              <ProjCard 
                key={p.projectId}
                id={p.projectId}
                name={p.name}
                sub={p.address || `ST Project ${p.serviceTitanProjectId}`}
                phase={p.currentPhase || 'Planning'}
                phaseCls={p.phaseClass || 'planning'}
                cur={p.currentPhaseIndex || 0}
                docs={p._count?.documents || 0}
                stName={p.builderName ? `ST Account: ${p.builderName}` : 'Single-family residence'}
              />
            ))}
          </section>
        </>
      )}

      {quotedProjects.length > 0 && (
        <>
          <div className="section-label">Quoted</div>
          <section className="projects">
            {quotedProjects.map((p: any) => (
              <ProjCard 
                key={p.projectId}
                id={p.projectId}
                name={p.name}
                sub={p.address || `ST Project ${p.serviceTitanProjectId}`}
                phase="Quoted"
                phaseCls="quoted"
                price={`$${p.quotedPrice || p.quotes?.[0]?.total || '0.00'}`}
                docRef={p.quoteNumber || p.quotes?.[0]?.quoteNumber}
                quoted
              />
            ))}
          </section>
        </>
      )}

      {completedProjects.length > 0 && (
        <>
          <div className="section-label">Completed</div>
          <section className="projects">
            {completedProjects.map((p: any) => (
              <ProjCard 
                key={p.projectId}
                id={p.projectId}
                name={p.name}
                sub={p.address || `ST Project ${p.serviceTitanProjectId}`}
                phase="Complete"
                phaseCls="complete"
                cur={3}
                docs={p._count?.documents || 0}
                stName={`ST Account: ${p.company?.name || 'Unknown'}`}
              />
            ))}
          </section>
        </>
      )}

      {projectList.length === 0 && (
        <div style={{ padding: 40, textAlign: 'center', color: 'var(--tx-sub)' }}>
          No projects found.
        </div>
      )}
    </>
  );
}
