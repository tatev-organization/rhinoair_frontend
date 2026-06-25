export interface Project {
  id: string;
  name: string;
  sub: string;
  phase: string;
  phaseCls: 'planning' | 'roughin' | 'finishing' | 'complete' | 'quoted';
  curPhaseIdx?: number;
  docsCount?: number;
  price?: string;
  docRef?: string;
}

export const activeProjects: Project[] = [
  { id: '1', name: '1036 Norman Pl', sub: 'Daikin VRV · 5-Ton', phase: 'Rough-in', phaseCls: 'roughin', curPhaseIdx: 1, docsCount: 9 },
  { id: '2', name: '1030 Norman Pl', sub: 'Ducted Heat Pump · 4-Ton', phase: 'Finishing', phaseCls: 'finishing', curPhaseIdx: 2, docsCount: 11 },
  { id: '3', name: 'Malibu Rebuild', sub: 'Daikin VRV · 6-Ton', phase: 'Planning', phaseCls: 'planning', curPhaseIdx: 0, docsCount: 4 },
];

export const quotedProjects: Project[] = [
  { id: '4', name: 'Bel Air Rebuild', sub: 'Daikin VRV · 5-Ton · estimate ready', phase: 'Quoted', phaseCls: 'quoted', price: '$27,500', docRef: 'RA-104915' },
];

export const completedProjects: Project[] = [
  { id: '5', name: '3928 Sunset Dr', sub: 'Daikin VRV · 4-Ton', phase: 'Complete', phaseCls: 'complete', curPhaseIdx: 3, docsCount: 14 },
  { id: '6', name: '1142 Linda Vista', sub: 'Ducted Heat Pump · 5-Ton', phase: 'Complete', phaseCls: 'complete', curPhaseIdx: 3, docsCount: 12 },
  { id: '7', name: '1455 Casiano Rd', sub: 'Daikin VRV · 5-Ton', phase: 'Complete', phaseCls: 'complete', curPhaseIdx: 3, docsCount: 16 },
  { id: '8', name: '618 Lachman Ln', sub: 'Ducted Heat Pump · 4-Ton', phase: 'Complete', phaseCls: 'complete', curPhaseIdx: 3, docsCount: 13 },
];

export interface PhaseItem {
  name: string;
  status: 'complete' | 'inprogress' | 'notstarted';
}

export interface Phase {
  name: string;
  status: 'done' | 'current' | 'upcoming';
  start: string;
  end: string;
  items: PhaseItem[];
}

export const projectPhases: Phase[] = [
  {
    name: 'Planning',
    status: 'done',
    start: 'Jun 2',
    end: 'Jun 9',
    items: [
      { name: 'Design & measuring', status: 'complete' },
      { name: 'Equipment / materials preparing', status: 'complete' }
    ]
  },
  {
    name: 'Rough-in',
    status: 'current',
    start: 'Jun 10',
    end: 'Jun 23',
    items: [
      { name: 'Indoor units installation', status: 'complete' },
      { name: 'Ductwork rough-in (trunk & branch runs)', status: 'inprogress' },
      { name: 'Line sets, drains & low voltage', status: 'notstarted' },
      { name: 'Exhausts', status: 'notstarted' },
      { name: 'Ready for rough inspection', status: 'notstarted' }
    ]
  },
  {
    name: 'Finishing',
    status: 'upcoming',
    start: 'Jun 24',
    end: 'Jul 8',
    items: [
      { name: 'Outdoor units installation', status: 'notstarted' },
      { name: 'Registers, grilles & thermostats', status: 'notstarted' },
      { name: 'Electrical after disconnect box', status: 'notstarted' },
      { name: 'Startup, refrigerant balancing & test', status: 'notstarted' }
    ]
  },
  {
    name: 'Final Inspection',
    status: 'upcoming',
    start: 'Jul 9',
    end: 'Jul 11',
    items: [
      { name: 'Ready for final inspection', status: 'notstarted' }
    ]
  }
];

export interface Document {
  id: string;
  icon: string;
  name: string;
  meta: string;
  badge?: string;
  isPending?: boolean;
}

export const plansAndBlueprints: Document[] = [
  { id: 'd1', icon: 'plan', name: 'Mechanical plan set (T24, ductwork, schedules)', meta: 'PDF · 2.4 MB · Jun 2, 2026' },
  { id: 'd2', icon: 'plan', name: 'Floor plans', meta: 'PDF · 1.1 MB · Jun 2, 2026' },
  { id: 'd3', icon: 'plan', name: 'RCP — Reflected ceiling plan', meta: 'PDF · 1.3 MB · Jun 2, 2026' },
  { id: 'd4', icon: 'plan', name: 'Structural plans', meta: 'PDF · 1.8 MB · Jun 2, 2026' },
];

export const estimatesDocs: Document[] = [
  { id: 'e1', icon: 'doc', name: 'Installation estimate — RA-104872', meta: 'PDF · 180 KB · Jun 5, 2026' },
];

export const agreementsDocs: Document[] = [
  { id: 'a1', icon: 'sign', name: 'Subcontract agreement', meta: 'PDF · 320 KB · Jun 8, 2026', badge: 'signed' },
];

export const changeOrdersDocs: Document[] = [
  { id: 'co1', icon: 'sign', name: 'CO-01 — Added third zone (master suite)', meta: 'PDF · 210 KB · Jun 14, 2026', badge: 'signed' },
  { id: 'co2', icon: 'sign', name: 'CO-02 — Concealed ducted head (home office)', meta: '', isPending: true },
];

export const submittalsDocs: Document[] = [
  { id: 's1', icon: 'spec', name: 'Daikin VRV submittal package', meta: 'PDF · 4.2 MB · Jun 10, 2026' },
  { id: 's2', icon: 'spec', name: 'Condenser cut sheet', meta: 'PDF · 600 KB · Jun 10, 2026' },
];

export const permitsDocs: Document[] = [
  { id: 'pm1', icon: 'permit', name: 'Mechanical permit', meta: 'PDF · 240 KB · Jun 12, 2026' },
];

export const certificatesDocs: Document[] = [
  { id: 'c1', icon: 'cert', name: 'AHRI / Energy Star rating', meta: 'PDF · 150 KB · Jun 2, 2026' },
  { id: 'c2', icon: 'cert', name: 'HERS certificate (duct leakage & charge)', meta: '', isPending: true },
  { id: 'c3', icon: 'cert', name: 'Warranty certificate', meta: '', isPending: true },
];

export interface Estimate {
  id: string;
  quoteId: string;
  status: 'Accepted' | 'Superseded';
  scope: string;
  dateStr: string;
  price: string;
  tier: string;
}

export const estimateHistory: Estimate[] = [
  { id: '1', quoteId: 'RA-104872', status: 'Accepted', scope: 'Daikin VRV · 5-Ton · 2 zones', dateStr: 'Jun 5, 2026', price: '$26,500', tier: 'Tier 4' },
  { id: '2', quoteId: 'RA-104810', status: 'Superseded', scope: 'Goodman · 5-Ton · single zone', dateStr: 'May 28, 2026', price: '$24,500', tier: 'Tier 4' },
];

export interface Invoice {
  id: string;
  num: string;
  forr: string;
  dateStr: string;
  amount: string;
  status: string;
  badgeCls: string;
  scheduled?: boolean;
  project?: string;
  dueOn?: string;
}

export const invoices: Invoice[] = [
  { id: '1', num: 'INV-2041', forr: 'Deposit (40%)', dateStr: 'Issued May 30, 2026', amount: '$10,600', status: 'Paid', badgeCls: 'paid' },
  { id: '2', num: 'INV-2068', forr: 'Rough-in progress (30%)', dateStr: 'Due Jun 30, 2026', amount: '$7,950', status: 'Due', badgeCls: 'due' },
  { id: '3', num: '—', forr: 'Finishing & completion (30%)', dateStr: 'Scheduled · on completion', amount: '$7,950', status: 'Scheduled', badgeCls: 'scheduled', scheduled: true },
];

export const globalInvoicesOpen: Invoice[] = [
  { id: '1', num: 'INV-2068', forr: 'Rough-in progress (30%)', dateStr: 'Due Jun 30, 2026', amount: '$7,950', status: 'Due', badgeCls: 'due', project: '1036 Norman Pl' },
  { id: '2', num: 'INV-2057', forr: 'Change order — added zone', dateStr: 'Due Jun 5, 2026', amount: '$3,400', status: 'Overdue', badgeCls: 'overdue', project: '1030 Norman Pl' },
  { id: '3', num: 'INV-2071', forr: 'Finishing progress (40%)', dateStr: 'Due Jul 15, 2026', amount: '$12,300', status: 'Due', badgeCls: 'due', project: '1030 Norman Pl' },
];

export const globalInvoicesScheduled: Invoice[] = [
  { id: 's1', num: '—', forr: 'Completion (30%) · 1036 Norman Pl', dateStr: 'Scheduled · on completion', amount: '$7,950', status: 'Scheduled', badgeCls: 'scheduled', project: '1036 Norman Pl', scheduled: true },
  { id: 's2', num: '—', forr: 'Final balance · 1030 Norman Pl', dateStr: 'Scheduled · on final inspection', amount: '$9,250', status: 'Scheduled', badgeCls: 'scheduled', project: '1030 Norman Pl', scheduled: true },
];

export const globalInvoicesPaid: Invoice[] = [
  { id: 'p1', num: 'INV-2041', forr: 'Deposit · 1036 Norman Pl', dateStr: 'Paid Jun 4, 2026', amount: '$10,600', status: 'Paid', badgeCls: 'paid', project: '1036 Norman Pl' },
  { id: 'p2', num: 'INV-2039', forr: 'Rough-in · 1030 Norman Pl', dateStr: 'Paid May 28, 2026', amount: '$9,200', status: 'Paid', badgeCls: 'paid', project: '1030 Norman Pl' },
  { id: 'p3', num: 'INV-2012', forr: 'Final · 3928 Sunset Dr', dateStr: 'Paid May 12, 2026', amount: '$31,400', status: 'Paid', badgeCls: 'paid', project: '3928 Sunset Dr' },
];

export interface ChangeOrder {
  id: string;
  num: string;
  scope: string;
  delta: number;
  state: 'approved' | 'pending' | 'declined';
  dateStr: string;
}

export const changeOrders: ChangeOrder[] = [
  { id: 'co1', num: 'CO-01', scope: 'Added third zone — master suite', delta: 3200, state: 'approved', dateStr: 'Jun 14, 2026' },
  { id: 'co2', num: 'CO-02', scope: 'Upgrade to concealed ducted head — home office', delta: 1800, state: 'pending', dateStr: 'Jun 18, 2026' },
];
