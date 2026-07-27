import React from 'react';
import Link from 'next/link';
import { Icons } from '@/components/ui/Icons';
const PH4 = ["Planning", "Rough-in", "Finishing", "Final"];

export interface Project {
  id: string;
  name: string;
  sub: string;
  phase: string;
  phaseCls: string;
  curPhaseIdx?: number;
  docsCount?: number;
  price?: string;
  docRef?: string;
  stName?: string;
}

interface ProjectCardProps {
  project: Project;
}

export function ProjectCard({ project }: ProjectCardProps) {
  const { id, name, sub, phase, phaseCls, curPhaseIdx, docsCount, price, docRef, stName } = project;

  // Render the progress track
  const renderTrack = () => {
    if (curPhaseIdx === undefined) return null;

    const segs = PH4.map((_, i) => {
      let colorClass = '';
      if (i <= curPhaseIdx) {
        colorClass = i <= 1 ? 'blue' : 'green';
      }
      return <span key={i} className={`seg ${colorClass}`}></span>;
    });

    const labels = PH4.map((nm, i) => {
      const col = i <= 1 ? 'blue' : 'green';
      if (i === curPhaseIdx) return <span key={i} className={`cur ${col}`}>{nm}</span>;
      if (i < curPhaseIdx) return <span key={i} className="done">{nm}</span>;
      return <span key={i}>{nm}</span>;
    });

    return (
      <>
        <div className="track">{segs}</div>
        <div className="track-labels">{labels}</div>
      </>
    );
  };

  return (
    <Link href={`/projects/${id}`} className="pcard">
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
      
      {curPhaseIdx !== undefined && renderTrack()}
      
      <div className="pcard-meta">
        {docsCount !== undefined && (
          <span><Icons.doc />{docsCount} documents</span>
        )}
        {price !== undefined && docRef !== undefined && (
          <span><Icons.doc />{docRef} &middot; {price}</span>
        )}
        {docsCount !== undefined ? (
          <span><Icons.home />{stName || 'Single-family residence'}</span>
        ) : (
          <span><Icons.home />{stName || 'Awaiting approval'}</span>
        )}
      </div>
    </Link>
  );
}
