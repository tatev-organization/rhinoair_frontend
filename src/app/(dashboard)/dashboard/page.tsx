'use client';

import React from 'react';
import Link from 'next/link';
import { Icons } from '@/components/ui/Icons';
import { ProjectCard } from '@/components/ui/ProjectCard';
import { activeProjects } from '@/lib/dummyData';
import { useGetMeQuery } from '@/redux/features/auth/authApi';
import { useGetDashboardDataQuery } from '@/redux/features/dashboard/dashboardApi';
import { useGetMyProjectsQuery } from '@/redux/features/projects/projectsApi';

export default function DashboardPage() {
  const { data: userProfile, isLoading: isUserLoading } = useGetMeQuery(undefined);
  const { data: dashboardResponse, isLoading: isDashboardLoading } = useGetDashboardDataQuery();
  const { data: projectsResponse, isLoading: isProjectsLoading } = useGetMyProjectsQuery();

  const company = userProfile?.data?.company || userProfile?.company;
  const companyName = company?.name || 'Loading...';
  const tier = company?.tier || 4;

  const stats = dashboardResponse?.stats || { activeJobs: 0, openEstimates: 0, approvedJobsYtd: 0, annualGoal: 12 };
  const alerts = dashboardResponse?.alerts || [];
  
  const allProjects = projectsResponse?.data || [];
  const activeProjectsList = allProjects.filter((p: any) => p.status === 'ACTIVE' || p.status === 'IN_PROGRESS');

  const isLoading = isUserLoading || isDashboardLoading || isProjectsLoading;

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-lg font-medium text-gray-500">Loading dashboard...</div>
      </div>
    );
  }

  const progressPercent = Math.min(100, Math.round((stats.approvedJobsYtd / stats.annualGoal) * 100)) || 0;

  return (
    <>
      <section className="welcome">
        <div>
          <div className="tag">Welcome back</div>
          <h1 id="dashCompany">{companyName}</h1>
          <div className="sub">
            <span className="tier-chip">
              <Icons.trophy />
              <span id="dashTier">Tier {tier} Partner</span>
            </span>
            <span className="dot-sep"></span>
            <span>{stats.activeJobs} Active Projects</span>
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
          <span className="att-count">{alerts.length}</span>
        </div>
        
        {alerts.length > 0 ? (
          alerts.map((alert: any) => {
            const Icon = (Icons as any)[alert.icon] || Icons.bell;
            return (
              <Link key={alert.id} className="att-item" href={alert.link}>
                <span className="lead"><Icon /></span>
                <span className="txt"><b>{alert.title}</b> <span className="proj">&mdash; {alert.description}</span></span>
                <span className="go"><Icons.chev /></span>
              </Link>
            );
          })
        ) : (
          <div style={{ padding: '20px', textAlign: 'center', color: 'var(--tx-sub)' }}>
            You are all caught up! No items need your attention right now.
          </div>
        )}
      </section>

      <div className="section-label">
        Active Projects
        <span className="right"><Link href="/projects">View all &rarr;</Link></span>
      </div>
      
      <section className="projects">
        {activeProjectsList.length > 0 ? (
          activeProjectsList.map((project: any) => (
            <ProjectCard key={project.projectId} project={{
              id: project.projectId,
              name: project.name,
              sub: project.builderName || project.systemSummary || 'N/A',
              phase: project.currentPhase || 'Planning',
              phaseCls: (project.phaseClass as any) || 'planning',
              curPhaseIdx: project.currentPhaseIndex || 0,
              docsCount: project.docsCount || 0,
              price: project.quotedPrice ? `$${Number(project.quotedPrice).toLocaleString()}` : undefined,
              docRef: project.quoteNumber || undefined
            }} />
          ))
        ) : (
          <div style={{ padding: 20, textAlign: 'center', color: 'var(--tx-sub)' }}>
            No active projects found.
          </div>
        )}
      </section>

      <div className="section-label">At a Glance</div>
      <section className="stats">
        <div className="stat">
          <div className="num">{stats.activeJobs}</div>
          <div className="lbl">Active Jobs</div>
        </div>
        <div className="stat">
          <div className="num">{stats.openEstimates}</div>
          <div className="lbl">Open Estimates</div>
        </div>
        <div className="stat accent">
          <div className="num">{stats.approvedJobsYtd}</div>
          <div className="lbl">Approved &middot; Agreement Yr</div>
        </div>
      </section>
      
      <div className="tier-progress">
        <div className="tp-top">
          <span className="tp-label">
            <Icons.trophy style={{ color: '#5a9e2f' }} />
            Tier {tier} Agreement
          </span>
          <span className="tp-status">On track</span>
        </div>
        <div className="tp-bar"><i style={{ width: `${progressPercent}%` }}></i></div>
        <div className="tp-sub">{stats.approvedJobsYtd} of {stats.annualGoal} approved &middot; this agreement year</div>
      </div>
    </>
  );
}
