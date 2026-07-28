import React from "react";
import {
  SystemState,
  AddonState,
  ProjectState,
  isDuctless,
  systemSubtotal,
  sysDisplayName,
  sysSummary,
  brandOf,
  miniTierMult,
  Head,
  headsTotal,
  multiCondenserPrice,
  getAutoCondenser,
  miniPriceFor,
  ductlessCfg,
  normalizeAqForSystem,
  headExtraDefs,
  sysHeadExtras,
  headExtrasCost,
} from "./calculatorUtils";
import {
  BRANDS,
  BRAND_EFF,
  HEAD_BTU,
  TON_OPTS,
  SYSTEM_ADDON_DEFS,
  SYS_TYPES,
  ZONE_FIRST,
  ZONE_ADDL,
  NEST_RATE,
  MULTI_HEAD,
  HEAD_TYPES,
  MINI_BTU_ORDER,
  MINI_HEAD_ADDER,
  PER_TON,
} from "./calculatorData";
import AddonItem from "./AddonItem";
import { brandLogoSvg } from "./calculatorLogos";
import { Icons } from "@/components/ui/Icons";

interface SystemCardProps {
  system: SystemState;
  index: number;
  project: ProjectState;
  systemsLength: number;
  onChange: (sys: SystemState) => void;
  onRemove?: () => void;
}

export default function SystemCard({
  system,
  index,
  project,
  systemsLength,
  onChange,
  onRemove,
}: SystemCardProps) {
  const update = (changes: Partial<SystemState>) => {
    onChange(normalizeAqForSystem({ ...system, ...changes }));
  };

  const handleSysTypeChange = (t: string) => {
    if (t === system.sysType) return;
    const newHeads = [...(system.heads || [])];
    if (t === "mini") {
      if (!newHeads.length)
        newHeads.push({ id: Date.now(), type: "wall", btu: "9k", name: "" });
      newHeads.splice(1); // keep exactly 1
    } else if (t === "multi") {
      if (!newHeads.length) {
        newHeads.push({ id: Date.now(), type: "wall", btu: "9k", name: "" });
        newHeads.push({
          id: Date.now() + 1,
          type: "wall",
          btu: "9k",
          name: "",
        });
      } else if (newHeads.length < 2) {
        newHeads.push({
          id: Date.now() + 1,
          type: "wall",
          btu: "9k",
          name: "",
        });
      }
    }
    let newBrand = system.brand;
    if (t === "mini" && !["acpro", "daikin"].includes(newBrand)) newBrand = "acpro";
    if (t === "multi" && !["acpro"].includes(newBrand)) newBrand = "acpro";

    let changes: Partial<SystemState> = { sysType: t, heads: newHeads, brand: newBrand };

    if (t === "mini" && newBrand !== system.brand) {
      changes.miniId = `${newBrand}_12k`;
    }

    update(changes);
  };

  const formatPrice = (n: number) =>
    "$" + Math.round(n).toLocaleString("en-US");

  // --- Header ---
  const dispName = sysDisplayName(system, index);
  const summary = sysSummary(system);
  const lineTotal = systemSubtotal(system, project, systemsLength);
  const removable = systemsLength > 1;

  const handleToggleCollapse = (e: React.MouseEvent) => {
    // Only toggle if clicked on the header directly, not inputs/buttons
    if (
      (e.target as HTMLElement).tagName !== "BUTTON" &&
      (e.target as HTMLElement).tagName !== "INPUT"
    ) {
      update({ collapsed: !system.collapsed });
    }
  };

  // --- Type Selector ---
  const types = SYS_TYPES || [];

  // --- Brand Selector ---
  const BRAND_ORDER = ["acpro", "goodman", "daikin"];
  const brandOpts = (BRANDS || [])
    .filter((b) => {
      if (system.sysType === "mini") return ["acpro", "daikin"].includes(b.id);
      if (system.sysType === "multi") return ["acpro"].includes(b.id);
      return ["acpro", "goodman", "daikin"].includes(b.id);
    })
    .sort((a, b) => {
      const i = BRAND_ORDER.indexOf(a.id);
      const j = BRAND_ORDER.indexOf(b.id);
      return (i === -1 ? 99 : i) - (j === -1 ? 99 : j);
    });

  // --- Efficiency Selector (Ducted) ---
  const activeBrand = (BRANDS || []).find((b) => b.id === system.brand);
  const tiers = BRAND_EFF?.[system.brand] || BRAND_EFF?.goodman || [];

  // --- Addons ---
  const handleAddonChange = (addonId: string, val: AddonState) => {
    update({ addons: { ...system.addons, [addonId]: val } });
  };

  const ductless = isDuctless(system);
  const hideForDuctless = new Set(["furnace", "curb", "hers", "hersfinal"]);
  const COMMON_ADDONS = new Set(["furnace", "crane"]);
  const MORE_ADDONS = ["coastal", "curb", "hers", "hersfinal"];

  const visibleNonIaq = (SYSTEM_ADDON_DEFS || []).filter(
    (d) => d.group !== "airquality" && !(ductless && hideForDuctless.has(d.id)),
  );
  const commonDefs = visibleNonIaq.filter((d) => COMMON_ADDONS.has(d.id));
  const moreDefs = visibleNonIaq.filter((d) => MORE_ADDONS.includes(d.id));
  const moreSel = moreDefs.filter((d) => system.addons[d.id]?.on).length;
  const iaqDefs = (SYSTEM_ADDON_DEFS || []).filter(
    (d) => d.group === "airquality" && (!ductless || d.ductlessOk),
  );
  const iaqSel = iaqDefs.filter((d) => system.addons[d.id]?.on).length;

  // --- Sub-components ---
  const renderZoneConfig = () => {
    const single = !system.zoned;
    const nestOk = brandOf(system).nest;
    const z = Math.max(system.zoneCount || 2, 2);
    const multiZoneCost =
      ZONE_FIRST +
      Math.max(z - 1, 0) * ZONE_ADDL +
      (nestOk && system.multiNest ? NEST_RATE * z : 0);

    return (
      <>
        <div className="zone-mode">
          <div className="zm-label">Zone configuration</div>
          <div className="zone-seg-row">
            <button
              type="button"
              className={`zone-seg ${single ? "active" : ""}`}
              onClick={() => update({ zoned: false })}
            >
              <div className="zs-ttl">Single Zone</div>
              <div className="zs-sub">included in base</div>
            </button>
            <button
              type="button"
              className={`zone-seg ${!single ? "active" : ""}`}
              onClick={() => update({ zoned: true })}
            >
              <div className="zs-ttl">Multi-Zone Damper System</div>
              <div className="zs-sub">from $3,100 (2 zones)</div>
            </button>
          </div>
        </div>

        <div className={`zone-panel zone-single ${single ? "" : "hidden"}`}>
          {nestOk && (
            <div className={`addon ${system.singleNest ? "on" : ""}`}>
              <div className="addon-head">
                <div className="addon-info">
                  <div className="name">Google Nest (4th Gen) or Equal</div>
                  <div className="desc">
                    High-end smart thermostat upgrade from the included standard
                    thermostat (1 per system).
                  </div>
                </div>
                <span className="addon-price-tag">${NEST_RATE}</span>
                <label className="switch">
                  <input
                    type="checkbox"
                    checked={!!system.singleNest}
                    onChange={(e) => update({ singleNest: e.target.checked })}
                  />
                  <span className="slider"></span>
                </label>
              </div>
            </div>
          )}
        </div>

        <div className={`zone-panel zone-multi ${single ? "hidden" : ""}`}>
          <div className="addon on">
            <div className="addon-head">
              <div className="addon-info">
                <div className="name">Multi-Zone Damper System</div>
                <div className="desc">
                  First 2 zones $3,100, then $600 per additional zone (standard
                  thermostats included).
                </div>
              </div>
              <span className="addon-price-tag">from $3,100 + $600/zone</span>
            </div>
            <div className="qty-area">
              <span className="qty-label">Number of zones</span>
              <div className="stepper zones-step">
                <button
                  type="button"
                  className="dec"
                  onClick={() =>
                    update({
                      zoneCount: Math.max((system.zoneCount || 2) - 1, 2),
                    })
                  }
                >
                  −
                </button>
                <input
                  type="number"
                  className="zones-input"
                  value={system.zoneCount || 2}
                  readOnly
                />
                <button
                  type="button"
                  className="inc"
                  onClick={() =>
                    update({
                      zoneCount: Math.max(system.zoneCount || 2, 2) + 1,
                    })
                  }
                >
                  +
                </button>
              </div>
              <span className="qty-line-total zones-total">
                {formatPrice(multiZoneCost)}
              </span>
            </div>
            {nestOk && (
              <div
                className="nest-sub"
                onClick={() => update({ multiNest: !system.multiNest })}
              >
                <div className="nest-sub-info">
                  <div className="nest-sub-label">
                    Upgrade to Google Nest (4th Gen) or Equal thermostats?
                  </div>
                  <div className="nest-sub-hint">
                    ${NEST_RATE} per zone · 1 per zone (replaces standard)
                  </div>
                </div>
                <label className="switch" onClick={(e) => e.stopPropagation()}>
                  <input
                    type="checkbox"
                    checked={!!system.multiNest}
                    onChange={(e) => update({ multiNest: e.target.checked })}
                  />
                  <span className="slider"></span>
                </label>
              </div>
            )}
          </div>
        </div>
      </>
    );
  };

  const renderMiniBuilder = () => {
    const cfg = ductlessCfg(system);
    const h =
      (system.heads && system.heads[0]) ||
      ({ id: 1, type: "wall", btu: "9k" } as Head);
    const currentHeadType = h.type || "wall";
    const currentBtuId = system.miniId?.split("_")[1] || "12k";

    return (
      <>
        <div className="sub-label">
          Capacity (BTU){" "}
          <span className="sl-note">
            {" "}
            · {activeBrand?.name} · {cfg.seer2} · {cfg.warrantyFull}
          </span>
        </div>
        <div className="ton-grid tonnage">
          {(MINI_BTU_ORDER || []).map((btuId) => {
            const price = miniPriceFor(
              system.brand,
              btuId,
              currentHeadType,
              project.tier,
            );
            const bNum = HEAD_BTU.find((x) => x.id === btuId);
            const label = bNum ? bNum.name.replace(" BTU", "") : btuId;
            const isActive = currentBtuId === btuId;
            return (
              <button
                key={btuId}
                type="button"
                className={`opt ton ${isActive ? "active" : ""}`}
                onClick={() => update({ miniId: `${system.brand}_${btuId}` })}
              >
                <div className="ttl">{label} BTU</div>
                <div className="price-hint">{formatPrice(price)}</div>
              </button>
            );
          })}
        </div>
        <div className="sub-label">Indoor head type</div>
        <div className="minihead-row">
          {(HEAD_TYPES || []).map((t) => (
            <button
              key={t.id}
              type="button"
              className={`minihead-seg ${currentHeadType === t.id ? "active" : ""}`}
              onClick={() => {
                const newHeads = [
                  ...(system.heads || [
                    { id: 1, type: "wall", btu: "9k", name: "" },
                  ]),
                ];
                if (!newHeads[0])
                  newHeads[0] = {
                    id: Date.now(),
                    type: t.id,
                    btu: currentBtuId,
                    name: "",
                  };
                else newHeads[0] = { ...newHeads[0], type: t.id };
                update({ heads: newHeads });
              }}
            >
              {t.name}
            </button>
          ))}
        </div>
      </>
    );
  };

  const renderMultiBuilder = () => {
    const b = activeBrand;
    if (!b || !b.multi)
      return (
        <div className="muted">Multi-split not available for this brand.</div>
      );

    const tbl = MULTI_HEAD?.[system.brand] || MULTI_HEAD?.goodman || {};
    const projectTierMult = miniTierMult(project.tier);
    const heads = system.heads || [];

    const condenserAmt = multiCondenserPrice(system, project.tier);
    const hTotal = headsTotal(system, project.tier);
    const hxTotal = sysHeadExtras(system);
    const msTotal = condenserAmt + hTotal + hxTotal;

    const autoCondenser = getAutoCondenser(system);
    const cfg = ductlessCfg(system);
    const condLabel = `${b.name} multi-zone condenser`;
    const condSub = autoCondenser
      ? `${Math.round(autoCondenser.max / 1000)}k BTU total · ${cfg.seer2} · ${cfg.warrantyFull}`
      : `${cfg.seer2} · ${cfg.warrantyFull}`;

    const canAdd = heads.length < 5;

    return (
      <>
        <div className="ms-total">
          <div className="ms-total-label">
            Multi-Split system total
            <span className="ms-total-sub">
              condenser + {heads.length} head{heads.length !== 1 ? "s" : ""}
            </span>
          </div>
          <div className="ms-total-val">{formatPrice(msTotal)}</div>
        </div>
        <div className="sub-label">Outdoor condenser</div>
        <div className="cond-row">
          <div className="cond-info">
            <div className="cond-name">{condLabel}</div>
            <div className="cond-sub">{condSub}</div>
          </div>
          <div className="cond-incl">{formatPrice(condenserAmt)}</div>
        </div>
        <div className="sub-label">Indoor heads ({heads.length})</div>
        <div className="heads-list">
          {heads.map((h, i) => {
            const baseRate = tbl[h.btu] || 0;
            // Match calculator-9: scale BTU base only, then add flat head-type adder
            const btuScaled =
              Math.round((baseRate * projectTierMult) / 10) * 10;
            const adder = MINI_HEAD_ADDER[h.type] || 0;
            const headRate = btuScaled + adder;

            return (
              <div key={h.id} className="head-row">
                <div className="head-row-top">
                  <span className="head-label">
                    Head {i + 1}
                    {h.name ? (
                      <>
                        {" "}
                        · <span className="head-name-disp">{h.name}</span>
                      </>
                    ) : (
                      ""
                    )}
                  </span>
                  <span className="head-row-right">
                    <span className="head-price">{formatPrice(headRate)}</span>
                    {heads.length > 1 && (
                      <button
                        type="button"
                        className="head-remove"
                        title="Remove head"
                        onClick={() =>
                          update({ heads: heads.filter((x) => x.id !== h.id) })
                        }
                      >
                        ✕
                      </button>
                    )}
                  </span>
                </div>
                <input
                  type="text"
                  className="head-name-input"
                  placeholder="Room / location (optional) — e.g. Living Room"
                  value={h.name || ""}
                  onChange={(e) => {
                    const newHeads = [...heads];
                    newHeads[i] = { ...h, name: e.target.value };
                    update({ heads: newHeads });
                  }}
                />
                <div className="head-selects">
                  <select
                    className="head-type"
                    value={h.type}
                    onChange={(e) => {
                      const newHeads = [...heads];
                      newHeads[i] = { ...h, type: e.target.value };
                      update({ heads: newHeads });
                    }}
                  >
                    {(HEAD_TYPES || []).map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name}
                      </option>
                    ))}
                  </select>
                  <select
                    className="head-btu"
                    value={h.btu}
                    onChange={(e) => {
                      const newHeads = [...heads];
                      newHeads[i] = { ...h, btu: e.target.value };
                      update({ heads: newHeads });
                    }}
                  >
                    {(HEAD_BTU || []).map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name}
                      </option>
                    ))}
                  </select>
                </div>
                {h.type === "concealed" && (
                  <div className="head-extras">
                    <div className="hx-title">
                      Air handler add-ons{" "}
                      <span className="hx-sub">
                        available on this ducted head
                      </span>
                    </div>
                    {headExtraDefs().map((def) => {
                      const on = !!h.aq?.[def.id];
                      return (
                        <div
                          key={def.id}
                          className={`head-extra ${on ? "on" : ""}`}
                          onClick={(e) => {
                            // ignore clicks on the switch itself; handled below
                            if ((e.target as HTMLElement).closest(".switch"))
                              return;
                            const newHeads = [...heads];
                            const cur = { ...(newHeads[i] as Head) };
                            cur.aq = { ...(cur.aq || {}) };
                            cur.aq[def.id] = !on;
                            newHeads[i] = cur;
                            update({ heads: newHeads });
                          }}
                        >
                          <div className="hx-info">
                            <span className="hx-name">
                              {def.shortName || def.name}
                            </span>
                            <span className="hx-desc">{def.desc}</span>
                          </div>
                          <span className="hx-rate">
                            {formatPrice(def.rate || 0)}
                          </span>
                          <label
                            className="switch"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <input
                              type="checkbox"
                              checked={on}
                              onChange={(e) => {
                                const newHeads = [...heads];
                                const cur = { ...(newHeads[i] as Head) };
                                cur.aq = { ...(cur.aq || {}) };
                                cur.aq[def.id] = e.target.checked;
                                newHeads[i] = cur;
                                update({ heads: newHeads });
                              }}
                            />
                            <span className="slider"></span>
                          </label>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
        {canAdd ? (
          <button
            type="button"
            className="add-head-btn add-head-full"
            onClick={() =>
              update({
                heads: [
                  ...heads,
                  { id: Date.now(), type: "wall", btu: "9k", name: "" },
                ],
              })
            }
          >
            <span>+</span> Add another head
          </button>
        ) : (
          <div className="heads-max-note">Maximum 5 zones reached</div>
        )}
      </>
    );
  };

  return (
    <div
      className={`system-card ${system.collapsed ? "collapsed" : ""}`}
      data-sysid={system.id}
    >
      <div
        className="sys-head"
        onClick={handleToggleCollapse}
        style={{ cursor: "pointer" }}
      >
        <div className="sys-badge">{index + 1}</div>
        <div className="sys-headline">
          <div className="sys-name">{dispName}</div>
          <div className="sys-meta">{summary}</div>
        </div>
        <span className="sys-subtotal">{formatPrice(lineTotal)}</span>
        {removable && (
          <button
            className="sys-remove"
            title="Remove system"
            onClick={(e) => {
              e.stopPropagation();
              onRemove && onRemove();
            }}
          >
            ✕
          </button>
        )}
        <span className="sys-chevron">▼</span>
      </div>

      <div className="sys-body">
        <div className="sub-label">System name (optional)</div>
        <input
          type="text"
          className="sys-name-input"
          placeholder="e.g. Master Bedroom, Downstairs, Unit A"
          value={system.name || ""}
          onChange={(e) => update({ name: e.target.value })}
        />

        <div className="sub-label">System type</div>
        <div className="systype-row">
          {types.map((t) => (
            <button
              key={t.id}
              type="button"
              className={`systype-seg ${system.sysType === t.id ? "active" : ""}`}
              onClick={() => handleSysTypeChange(t.id)}
            >
              <div className="st-ic">{t.id === "ducted" ? <Icons.duct /> : t.id === "mini" ? <Icons.mini /> : <Icons.multi />}</div>
              <div className="st-name">{t.name}</div>
              <div className="st-sub">{t.desc}</div>
            </button>
          ))}
        </div>

        <div className="sub-label">Brand</div>
        <div className="brand-seg-row">
          {brandOpts.map((b) => (
            <button
              key={b.id}
              type="button"
              className={`brand-seg ${system.brand === b.id ? "active" : ""}`}
              onClick={() => update({ brand: b.id })}
            >
              <span
                className="bs-logo-chip"
                dangerouslySetInnerHTML={{ __html: brandLogoSvg(b.id) }}
                style={{ pointerEvents: "none" }}
              />
            </button>
          ))}
        </div>

        {system.sysType === "ducted" && (
          <>
            <div className="sub-label">Efficiency</div>
            <div className="eff-seg-row">
              {tiers.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  className={`eff-seg ${system.tier === t.id ? "active" : ""}`}
                  onClick={() => update({ tier: t.id })}
                >
                  <div className="es-series">{t.series}</div>
                  <div className="es-name">{t.label || t.name}</div>
                  <div className="es-seer">{t.seer2 || t.desc}</div>
                  <div className="es-price">
                    {t.delta ? `+${formatPrice(t.delta)}` : "Included"}
                  </div>
                  {!!t.features?.length && (
                    <ul className="es-feats">
                      {t.features.map((feature: string) => (
                        <li key={feature}>{feature}</li>
                      ))}
                    </ul>
                  )}
                </button>
              ))}
            </div>

            <div className="sub-label">System size (tonnage)</div>
            <div className="ton-grid">
              {(TON_OPTS || []).map((o) => (
                <button
                  key={o.ton}
                  type="button"
                  className={`opt ton ${system.tons === o.ton ? "active" : ""}`}
                  onClick={() => update({ tons: o.ton })}
                >
                  <div className="ttl">{o.ton} ton</div>
                  {o.sub && <div className="sub">{o.sub}</div>}
                  <div className="price-hint">
                    {formatPrice(
                      project.anchor -
                        o.down * PER_TON +
                        brandOf(system).delta +
                        ((tiers || []).find((x) => x.id === system.tier) || (tiers || [])[0])
                          ?.delta,
                    )}
                  </div>
                </button>
              ))}
            </div>

            <div className="sub-label">Options & additions</div>
            {renderZoneConfig()}
          </>
        )}

        {system.sysType === "mini" && renderMiniBuilder()}
        {system.sysType === "multi" && renderMultiBuilder()}

        {(system.sysType === "mini" || system.sysType === "multi") && (
          <div className="sub-label">Options & additions</div>
        )}

        {/* Common Addons */}
        {commonDefs.map((def) => (
          <AddonItem
            key={def.id}
            def={def}
            value={system.addons[def.id]}
            onChange={(val) => handleAddonChange(def.id, val)}
            sys={system}
            systemsLength={systemsLength}
          />
        ))}

        {/* More Addons Group */}
        {moreDefs.length > 0 && (
          <div className={`aq-group ${system.moreOpen ? "open" : ""}`}>
            <button
              type="button"
              className="aq-head aq-head-more"
              onClick={() => update({ moreOpen: !system.moreOpen })}
            >
              <div className="aq-head-info">
                <div className="aq-title">More options</div>
                <div className="aq-sub">
                  {moreSel
                    ? `${moreSel} selected`
                    : `${moreDefs.length} options`}
                </div>
              </div>
              <span className="aq-chev">▾</span>
            </button>
            <div className="aq-body">
              {moreDefs.map((def) => (
                <AddonItem
                  key={def.id}
                  def={def}
                  value={system.addons[def.id]}
                  onChange={(val) => handleAddonChange(def.id, val)}
                  sys={system}
                  systemsLength={systemsLength}
                />
              ))}
            </div>
          </div>
        )}

        {/* Air Quality Group (calculator-9 rules) */}
        {(() => {
          // ducted: full system-level AQ
          if (system.sysType === "ducted") return true;
          // mini: only show ductlessOk AQ when head is concealed
          if (system.sysType === "mini")
            return (system.heads?.[0]?.type || "wall") === "concealed";
          // multi: no system-level AQ (extras are per concealed head)
          return false;
        })() &&
          iaqDefs.length > 0 && (
            <div className={`aq-group ${system.aqOpen ? "open" : ""}`}>
              <button
                type="button"
                className="aq-head"
                onClick={() => update({ aqOpen: !system.aqOpen })}
              >
                <div className="aq-head-info">
                  <div className="aq-title">Air Quality</div>
                  <div className="aq-sub">
                    {iaqSel > 0
                      ? `${iaqSel} selected`
                      : `${iaqDefs.length} option${iaqDefs.length !== 1 ? "s" : ""}`}
                  </div>
                </div>
                <span className="aq-chev">▾</span>
              </button>
              <div className="aq-body">
                {(() => {
                  if (system.sysType === "ducted") {
                    return iaqDefs.map((def) => (
                      <AddonItem
                        key={def.id}
                        def={def}
                        value={system.addons[def.id]}
                        onChange={(val) => handleAddonChange(def.id, val)}
                        sys={system}
                        systemsLength={systemsLength}
                      />
                    ));
                  }
                  // mini + concealed: only ductlessOk
                  return iaqDefs
                    .filter((d) => d.ductlessOk)
                    .map((def) => (
                      <AddonItem
                        key={def.id}
                        def={def}
                        value={system.addons[def.id]}
                        onChange={(val) => handleAddonChange(def.id, val)}
                        sys={system}
                        systemsLength={systemsLength}
                      />
                    ));
                })()}
              </div>
            </div>
          )}

        <div className="sub-label">Notes (optional)</div>
        <textarea
          className="sys-notes"
          placeholder="Notes for this system — e.g. attic access tight, existing ductwork to remove…"
          value={system.notes || ""}
          onChange={(e) => update({ notes: e.target.value })}
        ></textarea>
      </div>
    </div>
  );
}
