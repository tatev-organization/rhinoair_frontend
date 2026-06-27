export * from './calculatorData';
import {
  AddonDef,
  BRANDS,
  BRAND_EFF,
  DUCTLESS,
  HEAD_TYPES,
  HEAD_BTU,
  MINI_SETS,
  MINI_HEAD_ADDER,
  MULTI_CONDENSER,
  MULTI_HEAD,
  TIER_ANCHORS,
  PER_TON,
  SYSTEM_ADDON_DEFS,
  PROJECT_ADDON_DEFS,
  NEST_RATE,
  ZONE_FIRST,
  ZONE_ADDL,
  TON_OPTS
} from './calculatorData';

export interface Head {
  id: number;
  name?: string;
  type: string;
  btu: string;
}

export interface AddonState {
  on: boolean;
  qty?: number;
  segRate?: number;
  segTier?: string;
  rows?: Record<string, number>;
}

export interface SystemState {
  id: number;
  sysType: string;
  brand: string;
  name?: string;
  tier?: string;
  tons?: number;
  zoned?: boolean;
  zoneCount?: number;
  singleNest?: boolean;
  multiNest?: boolean;
  miniId?: string;
  multiCondenserId?: string;
  multiHeads?: Record<string, number>;
  collapsed?: boolean;
  aqOpen?: boolean;
  moreOpen?: boolean;
  addons: Record<string, AddonState>;
  notes?: string;
}

export interface ProjectState {
  tier: number;
  anchor: number;
  address: string;
  builder: string;
  addons: Record<string, AddonState>;
  quoteNumber: string;
  quoteDate: string;
  quoteExpiry: string;
  confirmedOnce: boolean;
  revisedFrom: string;
}

export const formatPrice = (n: number) => '$' + Math.round(n).toLocaleString('en-US');

export function brandOf(s: SystemState) { return BRANDS.find(b => b.id === s.brand) || BRANDS[0]; }
export function effLevelsFor(s: SystemState) { return BRAND_EFF[s.brand] || BRAND_EFF.goodman; }
export function effOf(s: SystemState) { const arr = effLevelsFor(s); return arr.find(e => e.id === s.tier) || arr[0]; }
export function ductlessCfg(s: SystemState) { return DUCTLESS[s.brand] || DUCTLESS.goodman; }

export function miniTierMult(projectTier: number) {
  return (TIER_ANCHORS[projectTier] || TIER_ANCHORS[4]) / TIER_ANCHORS[4];
}

export function miniSetPrice(s: SystemState, projectTier: number) {
  const m = MINI_SETS.find(x => x.id === s.miniId);
  if (!m) return 0;
  return Math.round(m.price * miniTierMult(projectTier) / 10) * 10;
}

export function totalHeadBtu(s: SystemState) {
  let btu = 0;
  for (const [headId, qty] of Object.entries(s.multiHeads || {})) {
    const h = HEAD_BTU.find(x => x.id === headId);
    if (h) btu += h.btu * qty;
  }
  return btu;
}

export function multiCondenserPrice(s: SystemState, projectTier: number) {
  const c = MULTI_CONDENSER.find(x => x.id === s.multiCondenserId);
  if (!c) return 0;
  return Math.round(c.price * miniTierMult(projectTier) / 10) * 10;
}

export function headsTotal(s: SystemState, projectTier: number) {
  let total = 0;
  for (const [headId, qty] of Object.entries(s.multiHeads || {})) {
    const h = HEAD_BTU.find(x => x.id === headId);
    if (!h) continue;
    const tbl = MULTI_HEAD[s.brand] || MULTI_HEAD.goodman;
    const base = tbl[headId] || 0;
    const btuScaled = Math.round(base * miniTierMult(projectTier) / 10) * 10;
    total += btuScaled * qty;
  }
  return total;
}

export function condenserPrice(s: SystemState, projectTier: number) {
  return multiCondenserPrice(s, projectTier);
}

export function isDuctless(s: SystemState) {
  return s.sysType === 'mini' || s.sysType === 'multi';
}

export function baseForSystem(s: SystemState, project: ProjectState) {
  if (s.sysType === 'mini') return miniSetPrice(s, project.tier);
  if (s.sysType === 'multi') return condenserPrice(s, project.tier);
  const tons = s.tons || 2;
  const down = TON_OPTS.find(o => o.ton === tons)?.down || 0;
  return project.anchor - down * PER_TON + brandOf(s).delta;
}

export function flatRate(def: AddonDef, sys?: SystemState) {
  return (sys && isDuctless(sys) && def.ductlessRate != null) ? def.ductlessRate : (def.rate || 0);
}

export function addonLineTotal(def: AddonDef, a: AddonState | undefined, systemsLength: number = 1, sys?: SystemState) {
  if (!a || !a.on) return 0;
  if (def.type === 'flat') return flatRate(def, sys);
  if (def.type === 'persystem') return (def.rate || 0) * Math.max(systemsLength, 1);
  if (def.type === 'radiogroup') return a.segRate || 0;
  if (def.type === 'multirow') {
    let t = 0;
    def.rows?.forEach(r => {
      const q = (a.rows && a.rows[r.key]) ? a.rows[r.key] : 0;
      t += q * r.rate;
    });
    return t;
  }
  const q = Math.max(a.qty || def.min || 0, def.min || 0);
  if (def.type === 'perqty') return q * (def.rate || 0);
  if (def.type === 'firstplus') return (def.base || 0) + Math.max(q - 1, 0) * (def.rate || 0);
  if (def.type === 'qty') {
    if ((def.base || 0) > 0) return (def.base || 0) + Math.max(q - (def.free || 0), 0) * (def.rate || 0);
    return q * (def.rate || 0);
  }
  return 0;
}

export function zoneCost(s: SystemState) {
  const nestOk = brandOf(s).nest;
  if (!s.zoned) {
    return (nestOk && s.singleNest) ? NEST_RATE : 0;
  }
  const z = Math.max(s.zoneCount || 2, 2);
  let t = ZONE_FIRST + Math.max(z - 1, 0) * ZONE_ADDL;
  if (nestOk && s.multiNest) t += NEST_RATE * z;
  return t;
}

export function systemSubtotal(s: SystemState, project: ProjectState, systemsLength: number) {
  if (s.sysType === 'mini') {
    let t = baseForSystem(s, project);
    SYSTEM_ADDON_DEFS.forEach(def => { t += addonLineTotal(def, s.addons[def.id], systemsLength, s); });
    return t;
  }
  if (s.sysType === 'multi') {
    let t = baseForSystem(s, project) + headsTotal(s, project.tier);
    SYSTEM_ADDON_DEFS.forEach(def => { t += addonLineTotal(def, s.addons[def.id], systemsLength, s); });
    return t;
  }
  let t = baseForSystem(s, project) + effOf(s).delta + zoneCost(s);
  SYSTEM_ADDON_DEFS.forEach(def => { t += addonLineTotal(def, s.addons[def.id], systemsLength, s); });
  return t;
}

export function projectAddonsTotal(project: ProjectState, systemsLength: number) {
  let t = 0;
  PROJECT_ADDON_DEFS.forEach(def => { t += addonLineTotal(def, project.addons[def.id], systemsLength); });
  return t;
}

export function currentGrandTotal(systems: SystemState[], project: ProjectState) {
  let g = 0;
  systems.forEach(s => { g += systemSubtotal(s, project, systems.length); });
  g += projectAddonsTotal(project, systems.length);
  return g;
}

export function sysDisplayName(s: SystemState, idx: number) {
  return (s.name && s.name.trim()) ? s.name.trim() : `System ${idx + 1}`;
}

export function miniBtuLabel(s: SystemState) {
  const m = MINI_SETS.find(x => x.id === s.miniId);
  return m ? m.btuId : '12k';
}

export function sysSummary(s: SystemState) {
  if (s.sysType === 'mini') {
    const parts = [brandOf(s).name, `Mini-Split · ${miniBtuLabel(s)}`];
    SYSTEM_ADDON_DEFS.forEach(def => { const a = s.addons[def.id]; if (a && a.on) { parts.push(def.shortName || def.name); } });
    return parts.join(' · ');
  }
  if (s.sysType === 'multi') {
    const n = Object.values(s.multiHeads || {}).reduce((sum, q) => sum + q, 0);
    const parts = [brandOf(s).name, `Multi-Split · ${n} head${n !== 1 ? 's' : ''}`];
    SYSTEM_ADDON_DEFS.forEach(def => { const a = s.addons[def.id]; if (a && a.on) { parts.push(def.shortName || def.name); } });
    return parts.join(' · ');
  }
  const parts = [brandOf(s).name, `${s.tons} ton`];
  if (s.zoned) {
    const z = Math.max(s.zoneCount || 2, 2); parts.push(`${z}-zone`);
  }
  SYSTEM_ADDON_DEFS.forEach(def => { const a = s.addons[def.id]; if (a && a.on) { parts.push(def.shortName || def.name); } });
  return parts.join(' · ');
}

export function multiCondenserBracketLabel(s: SystemState) {
  const total = totalHeadBtu(s);
  return `${Math.round(total / 1000)}k BTU total`;
}
