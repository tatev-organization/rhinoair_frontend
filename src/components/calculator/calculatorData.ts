export interface AddonDef {
  id: string;
  name: string;
  shortName?: string;
  desc?: string;
  note?: string;
  type: "flat" | "qty" | "perqty" | "firstplus" | "radiogroup" | "persystem" | "multirow";
  rate?: number;
  ductlessRate?: number;
  unit?: string;
  base?: number;
  free?: number;
  min?: number;
  tag?: string;
  segs?: { rate: number; tier: string; ttl: string; price: string }[];
  rows?: { key: string; label: string; hint?: string; rate: number }[];
  common?: boolean;
  group?: string;
  ductlessOk?: boolean;
}

export let SYSTEM_ADDON_DEFS: AddonDef[] = [];
export let PROJECT_ADDON_DEFS: AddonDef[] = [];

export let NEST_RATE = 0;
export let ZONE_FIRST = 0;
export let ZONE_ADDL = 0;

export let TON_OPTS = [
  { ton: 2, down: 3, sub: "Up to 2 ton" },
  { ton: 3, down: 2, sub: "" },
  { ton: 4, down: 1, sub: "" },
  { ton: 5, down: 0, sub: "" },
];

export let TIER_ANCHORS: Record<number, number> = {};
export let PER_TON = 0;

export let BRANDS: any[] = [];
export let BRAND_EFF: Record<string, any[]> = {};
export let MULTI_MAX_HEADS = 5;

export let DUCTLESS: Record<string, any> = {};
export let HEAD_TYPES: any[] = [];
export let HEAD_BTU: any[] = [];

export let MINI_SETS: any[] = [];
export let MINI_HEAD_ADDER: Record<string, number> = {};
export let MINI_BTU_ORDER: string[] = [];

export let MULTI_CONDENSER: any[] = [];
export let MULTI_HEAD: Record<string, Record<string, number>> = {};

export let SYS_TYPES = [
  {
    id: "ducted",
    name: "Ducted Central",
    desc: "Standard split system with ducts",
  },
  {
    id: "mini",
    name: "Ductless Mini-Split",
    desc: "Single-zone wall or ceiling unit",
  },
  {
    id: "multi",
    name: "Ductless Multi-Split",
    desc: "Multi-zone ductless system",
  },
];

export const ACCOUNT_DEFAULT = {
  company: "Mid Construction Group",
  tier: 4,
  anchor: 16500,
};

export function setPricingConfig(data: any) {
  if (!data) return;
  if (data.SYSTEM_ADDON_DEFS) SYSTEM_ADDON_DEFS = data.SYSTEM_ADDON_DEFS;
  if (data.PROJECT_ADDON_DEFS) PROJECT_ADDON_DEFS = data.PROJECT_ADDON_DEFS;
  if (data.TIER_ANCHORS) TIER_ANCHORS = data.TIER_ANCHORS;
  if (data.PER_TON != null) PER_TON = data.PER_TON;
  if (data.NEST_RATE != null) NEST_RATE = data.NEST_RATE;
  if (data.ZONE_FIRST != null) ZONE_FIRST = data.ZONE_FIRST;
  if (data.ZONE_ADDL != null) ZONE_ADDL = data.ZONE_ADDL;
  if (data.BRAND_EFF) BRAND_EFF = data.BRAND_EFF;
  if (data.BRANDS) {
    BRANDS = data.BRANDS.map((b: any) => ({
      ...b,
      tiers: data.BRAND_EFF?.[b.id] || [],
    }));
  }
  if (data.DUCTLESS) DUCTLESS = data.DUCTLESS;
  if (data.HEAD_TYPES) HEAD_TYPES = data.HEAD_TYPES;
  if (data.HEAD_BTU) HEAD_BTU = data.HEAD_BTU;
  if (data.MINI_SETS) MINI_SETS = data.MINI_SETS;
  if (data.MINI_HEAD_ADDER) MINI_HEAD_ADDER = data.MINI_HEAD_ADDER;
  if (data.MULTI_CONDENSER) MULTI_CONDENSER = data.MULTI_CONDENSER;
  if (data.MULTI_HEAD) MULTI_HEAD = data.MULTI_HEAD;
}
