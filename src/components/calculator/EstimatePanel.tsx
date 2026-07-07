import React from "react";
import {
  ProjectState,
  SystemState,
  AddonDef,
  AddonState,
  baseForSystem,
  systemSubtotal,
  isDuctless,
  sysDisplayName,
  addonLineTotal,
  headsTotal,
  multiCondenserBracketLabel,
  miniBtuLabel,
  miniHeadTypeName,
  headExtraDefs,
} from "./calculatorUtils";
import {
  BRANDS,
  BRAND_EFF,
  SYSTEM_ADDON_DEFS,
  PROJECT_ADDON_DEFS,
  ZONE_FIRST,
  ZONE_ADDL,
  NEST_RATE,
  DUCTLESS,
} from "./calculatorData";

interface EstimatePanelProps {
  project: ProjectState;
  systems: SystemState[];
  onOpenConfirm: () => void;
  onReset: () => void;
}

export default function EstimatePanel({
  project,
  systems,
  onOpenConfirm,
  onReset,
}: EstimatePanelProps) {
  const formatPrice = (n: number) =>
    "$" + Math.round(n).toLocaleString("en-US");

  const addonSubline = (def: AddonDef, a: AddonState, s?: SystemState) => {
    if (def.type === "qty") {
      const q = a.qty || def.min || 1;
      const b = def.base || 0;
      const f = def.free || 0;
      const r = def.rate || 0;
      if (b > 0)
        return `${q} ${def.unit} · $${b} + ${Math.max(q - f, 0)}×$${r}`;
      return `${q} ${def.unit} × $${r}`;
    }
    if (def.type === "perqty") {
      const q = a.qty || def.min || 1;
      return `${q} ${def.unit} × $${(def.rate || 0).toLocaleString("en-US")}`;
    }
    if (def.type === "radiogroup") {
      return a.segTier || def.segs?.[0]?.tier || "";
    }
    if (def.type === "persystem") {
      const len = Math.max(systems.length, 1);
      return `${len} system${len !== 1 ? "s" : ""} × $${(def.rate || 0).toLocaleString("en-US")}`;
    }
    if (def.type === "multirow") {
      if (!a.rows) return "";
      return def.rows
        ?.filter((r) => (a.rows?.[r.key] || 0) > 0)
        .map((r) => `${a.rows![r.key]}× ${r.label}`)
        .join(", ");
    }
    return "";
  };

  const getBrand = (sys: SystemState) =>
    BRANDS.find((b) => b.id === sys.brand) || BRANDS[0];
  const getEff = (sys: SystemState) => {
    const levels = BRAND_EFF[sys.brand] || BRAND_EFF.goodman;
    return levels.find((t) => t.id === sys.tier) || levels[0];
  };

  let grand = 0;

  const renderSystemBlock = (s: SystemState, i: number) => {
    const base = baseForSystem(s, project);
    const sub = systemSubtotal(s, project, systems.length);
    grand += sub;

    const brand = getBrand(s);
    const rows: React.ReactNode[] = [];

    if (s.sysType === "mini") {
      rows.push(
        <div className="est-sys-line" key="base">
          <span>
            {miniBtuLabel(s)} system ·{" "}
            <span style={{ color: "#7d8e8b" }}>{miniHeadTypeName(s)}</span>
          </span>
          <span className="v">{formatPrice(base)}</span>
        </div>,
      );
    } else if (s.sysType === "multi") {
      const headsCount = (s.heads || []).length;
      const hTotal = headsTotal(s, project.tier);
      rows.push(
        <div className="est-sys-line" key="base">
          <span>
            Multi-Split system ·{" "}
            <span style={{ color: "#7d8e8b" }}>
              {multiCondenserBracketLabel(s)} · {headsCount} head
              {headsCount !== 1 ? "s" : ""}
            </span>
          </span>
          <span className="v">{formatPrice(base + hTotal)}</span>
        </div>,
      );
      (s.heads || []).forEach((h, hi) => {
        headExtraDefs().forEach((d) => {
          if (h.type === "concealed" && h.aq && h.aq[d.id]) {
            rows.push(
              <div className="est-sys-line" key={`hx-${hi}-${d.id}`}>
                <span>
                  {d.shortName || d.name} ·{" "}
                  <span style={{ color: "#7d8e8b" }}>
                    {h.name?.trim() ? h.name.trim() : `Head ${hi + 1}`}
                  </span>
                </span>
                <span className="v">{formatPrice(d.rate || 0)}</span>
              </div>,
            );
          }
        });
      });
    } else {
      const eff = getEff(s);
      rows.push(
        <div className="est-sys-line" key="base">
          <span>
            {s.tons}-ton base{s.tons === 2 ? " (up to 2 ton)" : ""}
          </span>
          <span className="v">{formatPrice(base)}</span>
        </div>,
      );
      if (eff && eff.delta > 0) {
        rows.push(
          <div className="est-sys-line" key="eff">
            <span>
              {eff.name} efficiency ·{" "}
              <span style={{ color: "#7d8e8b" }}>{eff.desc}</span>
            </span>
            <span className="v">{formatPrice(eff.delta)}</span>
          </div>,
        );
      }
      const nestOk = brand.nest;
      if (!s.zoned && nestOk && s.singleNest) {
        rows.push(
          <div className="est-sys-line" key="nest-single">
            <span>Google Nest (4th Gen) or Equal</span>
            <span className="v">{formatPrice(NEST_RATE)}</span>
          </div>,
        );
      }
      if (s.zoned) {
        const z = Math.max(s.zoneCount || 2, 2);
        const baseZc = ZONE_FIRST + Math.max(z - 1, 0) * ZONE_ADDL;
        const showNest = nestOk && s.multiNest;
        const addlTxt = z > 2 ? ` + ${z - 2}×$${ZONE_ADDL}` : "";
        const nestTxt = showNest ? ` + Nest ${z}×$${NEST_RATE}` : "";
        const zlt = baseZc + (showNest ? NEST_RATE * z : 0);
        rows.push(
          <div className="est-sys-line" key="zone">
            <span>
              Multi-Zone Damper System ·{" "}
              <span style={{ color: "#7d8e8b" }}>
                {z} zones · $3,100{addlTxt}
                {nestTxt}
              </span>
            </span>
            <span className="v">{formatPrice(zlt)}</span>
          </div>,
        );
      }
    }

    SYSTEM_ADDON_DEFS.forEach((def) => {
      const a = s.addons[def.id];
      if (!a || !a.on) return;
      if (
        isDuctless(s) &&
        ["furnace", "curb", "hers", "hersfinal"].includes(def.id)
      )
        return;
      if (def.group === "airquality" && isDuctless(s) && !def.ductlessOk)
        return;
      const lt = addonLineTotal(def, a, systems.length, s);
      const sl = addonSubline(def, a, s);
      rows.push(
        <div className="est-sys-line" key={def.id}>
          <span>
            {def.name}
            {sl ? (
              <span>
                {" "}
                · <span style={{ color: "#7d8e8b" }}>{sl}</span>
              </span>
            ) : (
              ""
            )}
          </span>
          <span className="v">{formatPrice(lt)}</span>
        </div>,
      );
    });

    const typeDesc =
      s.sysType === "mini"
        ? "Mini-Split"
        : s.sysType === "multi"
          ? "Multi-Split"
          : `${s.tons} ton`;

    return (
      <div className="est-sys" key={s.id}>
        <div className="est-sys-head">
          <span className="esh-name">
            {sysDisplayName(s, i)}{" "}
            <small>
              · {brand.name} · {typeDesc}
            </small>
          </span>
          <span className="esh-val">{formatPrice(sub)}</span>
        </div>
        {rows}
        {s.notes && s.notes.trim() && (
          <div className="est-sys-note">
            <span className="esn-label">Note:</span> {s.notes.trim()}
          </div>
        )}
      </div>
    );
  };

  const buildPrintDoc = () => {
    const fmt = (n: number) => "$" + Math.round(n).toLocaleString("en-US");
    const esc = (t: string) =>
      (t || "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");

    const logoSrc =
      (document.querySelector(".logo-img") as HTMLImageElement)?.src || "";

    const printSysHtml = systems
      .map((s, i) => {
        const brand = getBrand(s);
        const sub = systemSubtotal(s, project, systems.length);
        const base = baseForSystem(s, project);
        const nestOk = brand.nest;
        const ductlessCfg = DUCTLESS[s.brand] || DUCTLESS.goodman;

        const lines: string[] = [];

        if (s.sysType === "mini") {
          lines.push(
            `<div class="pd-line"><span>${esc(`${brand.name} ${miniBtuLabel(s)} mini-split system (${miniHeadTypeName(s)})`)}</span><span class="pl-amt">${fmt(base)}</span></div>`,
          );
        } else if (s.sysType === "multi") {
          const headsCount = (s.heads || []).length;
          const hTotal = headsTotal(s, project.tier);
          lines.push(
            `<div class="pd-line"><span>${esc(`${brand.name} Multi-Split system (${multiCondenserBracketLabel(s)} · ${headsCount} head${headsCount !== 1 ? "s" : ""})`)}</span><span class="pl-amt">${fmt(base + hTotal)}</span></div>`,
          );
          (s.heads || []).forEach((h, hi) => {
            headExtraDefs().forEach((d) => {
              if (h.type === "concealed" && h.aq && h.aq[d.id]) {
                const lbl = h.name?.trim() ? h.name.trim() : `Head ${hi + 1}`;
                lines.push(
                  `<div class="pd-line"><span>${esc(`${d.shortName || d.name} — ${lbl}`)}</span><span class="pl-amt">${fmt(d.rate || 0)}</span></div>`,
                );
              }
            });
          });
        } else {
          const eff = getEff(s);
          lines.push(
            `<div class="pd-line"><span>${esc(`${brand.name} ${s.tons}-ton base`)}</span><span class="pl-amt">${fmt(base)}</span></div>`,
          );
          if (eff && eff.delta > 0) {
            lines.push(
              `<div class="pd-line"><span>${esc(`${eff.name} efficiency upgrade (${eff.desc})`)}</span><span class="pl-amt">${fmt(eff.delta)}</span></div>`,
            );
          }
          if (!s.zoned && nestOk && s.singleNest) {
            lines.push(
              `<div class="pd-line"><span>Google Nest (4th Gen) or Equal</span><span class="pl-amt">${fmt(NEST_RATE)}</span></div>`,
            );
          }
          if (s.zoned) {
            const z = Math.max(s.zoneCount || 2, 2);
            const showNest = nestOk && s.multiNest;
            const zc =
              ZONE_FIRST +
              Math.max(z - 1, 0) * ZONE_ADDL +
              (showNest ? NEST_RATE * z : 0);
            lines.push(
              `<div class="pd-line"><span>Multi-Zone Damper System (${z} zones)${showNest ? " + Nest" : ""}</span><span class="pl-amt">${fmt(zc)}</span></div>`,
            );
          }
        }

        SYSTEM_ADDON_DEFS.forEach((def) => {
          const a = s.addons[def.id];
          if (!a || !a.on) return;
          if (
            isDuctless(s) &&
            ["furnace", "curb", "hers", "hersfinal"].includes(def.id)
          )
            return;
          if (def.group === "airquality" && isDuctless(s) && !def.ductlessOk)
            return;
          const lt = addonLineTotal(def, a, systems.length, s);
          const sl = addonSubline(def, a, s);
          lines.push(
            `<div class="pd-line"><span>${esc(def.name + (sl ? ` (${sl})` : ""))}</span><span class="pl-amt">${fmt(lt)}</span></div>`,
          );
        });

        const eff = getEff(s);
        let spec = "";
        if (isDuctless(s)) {
          spec = `<div class="pd-spec">${esc(ductlessCfg.seer2)} · ${esc(ductlessCfg.warrantyFull)}</div>`;
        } else {
          const warrantyFull =
            eff?.warranty +
            (eff?.unitReplacement ? " · " + eff.unitReplacement : "");
          spec = `<div class="pd-spec">${esc(eff?.series || "")} · ${esc(eff?.seer2 || "")} · ${esc(warrantyFull)}</div>`;
        }

        const typeDesc =
          s.sysType === "mini"
            ? "Mini-Split"
            : s.sysType === "multi"
              ? `Multi-Split · ${(s.heads || []).length} heads`
              : `${s.tons} ton`;
        const note = s.notes?.trim()
          ? `<div class="pd-note">Note: ${esc(s.notes.trim())}</div>`
          : "";
        const sysLabel = `${sysDisplayName(s, i)} · ${brand.name} · ${typeDesc}`;

        return `<div class="pd-sys"><div class="pd-sys-h"><span>${esc(sysLabel)}</span><span>${fmt(sub)}</span></div>${spec}${lines.join("")}${note}</div>`;
      })
      .join("");

    const projAddonsLines: string[] = [];
    let printProjTotal = 0;
    PROJECT_ADDON_DEFS.forEach((def) => {
      const a = project.addons[def.id];
      if (a && a.on) {
        const lt = addonLineTotal(def, a, systems.length);
        if (lt > 0 || def.type !== "multirow") {
          const sl = addonSubline(def, a);
          projAddonsLines.push(
            `<div class="pd-line"><span>${esc(def.name + (sl ? ` (${sl})` : ""))}</span><span class="pl-amt">${fmt(lt)}</span></div>`,
          );
          printProjTotal += lt;
        }
      }
    });

    const printProjHtml =
      projAddonsLines.length > 0
        ? `<div class="pd-sys"><div class="pd-sys-h"><span>Project Add-Ons · per house</span><span>${fmt(printProjTotal)}</span></div>${projAddonsLines.join("")}</div>`
        : "";

    const grandTotal =
      systems.reduce(
        (acc, s) => acc + systemSubtotal(s, project, systems.length),
        0,
      ) + printProjTotal;
    const revised = project.revisedFrom
      ? `<div class="m"><span class="ml">Revised from</span><span class="mv q">${esc(project.revisedFrom)}</span></div>`
      : "";

    const printDocEl = document.getElementById("printDoc");
    if (printDocEl) {
      printDocEl.innerHTML = `
        <div class="pd-head">
          <div>
            ${logoSrc ? `<img class="pd-logo" src="${logoSrc}" alt="Rhino Air">` : ""}
            <div class="pd-title" style="margin-top:10px;">Installation Estimate</div>
            <div class="pd-subtitle">Single Family · Residential New Construction · HVAC</div>
          </div>
          <div class="pd-co">
            <b>Rhino Air</b><br>
            Sam Yaghobi<br>
            sam.yaghobi@rhinoair.com<br>
            (818) 900-4007 · cell<br>
            Office (818) 535-8888<br>
            info@rhinoair.com<br>
            Lic. C20-1142997 · OSHA 26-607683422
          </div>
        </div>
        <div class="pd-meta">
          <div class="m"><span class="ml">Quote #</span><span class="mv q">${esc(project.quoteNumber || "")}</span></div>
          <div class="m"><span class="ml">Date</span><span class="mv">${esc(project.quoteDate || "")}</span></div>
          ${project.quoteExpiry ? `<div class="m"><span class="ml">Valid Until</span><span class="mv">${esc(project.quoteExpiry)}</span></div>` : ""}
          ${revised}
          <div class="m"><span class="ml">Tier</span><span class="mv">Tier ${project.tier} · Heat Pump / Package</span></div>
          ${project.builder ? `<div class="m"><span class="ml">Builder</span><span class="mv">${esc(project.builder)}</span></div>` : ""}
          ${project.address ? `<div class="m"><span class="ml">Project address</span><span class="mv">${esc(project.address)}</span></div>` : ""}
        </div>
        ${printSysHtml}
        ${printProjHtml}
        <div class="pd-total"><span class="tl">Project Total</span><span class="tv">${fmt(grandTotal)}</span></div>
        <div class="pd-clause"><b>Tier / Builder Partner Pricing</b>Selecting a tier does not by itself qualify a customer for that price. Tiered pricing applies only upon execution of a signed Builder Partnership Agreement confirming the committed project volume.</div>
        <div class="pd-disc">Estimate only. Final pricing subject to site survey, permit fees &amp; local code requirements.${project.quoteExpiry ? ` Pricing valid through ${project.quoteExpiry}.` : " Valid 30 days."}</div>
      `;
    }
  };

  const handlePrint = () => {
    buildPrintDoc();
    window.print();
  };

  const projTotal = PROJECT_ADDON_DEFS.reduce((sum, def) => {
    const a = project.addons[def.id];
    if (!a || !a.on) return sum;
    const lt = addonLineTotal(def, a, systems.length);
    if (lt <= 0 && def.type === "multirow") return sum;
    return sum + lt;
  }, 0);

  grand += projTotal;

  return (
    <div className="estimate">
      <h2>Project Estimate</h2>
      <div className="quote-meta">
        <div className="qm-row">
          <span className="qm-label">Quote #</span>
          <span className="qm-val" id="quoteNumber">
            {project.quoteNumber || "—"}
          </span>
        </div>
        <div className="qm-row">
          <span className="qm-label">Date</span>
          <span className="qm-val" id="quoteDate">
            {project.quoteDate || "—"}
          </span>
        </div>
        <div className="qm-row">
          <span className="qm-label">Valid Until</span>
          <span className="qm-val" id="quoteExpiry">
            {project.quoteExpiry || "—"}
          </span>
        </div>
      </div>

      <div id="estTierLine" className="est-config">
        Tier {project.tier} · Heat Pump / Package
      </div>
      <div
        id="estBuilder"
        className={`est-address ${project.builder ? "" : "empty"}`}
      >
        <span className="ea-label">Builder</span>
        {project.builder || "—"}
      </div>
      <div
        id="estAddress"
        className={`est-address ${project.address ? "" : "empty"}`}
      >
        <span className="ea-label">Project address</span>
        {project.address || "—"}
      </div>

      <div id="estSystems">
        {systems.map((s, i) => renderSystemBlock(s, i))}
        {projTotal > 0 && (
          <div className="est-sys">
            <div className="est-sys-head">
              <span className="esh-name">
                Project Add-Ons <small>· per house</small>
              </span>
              <span className="esh-val">{formatPrice(projTotal)}</span>
            </div>
            {PROJECT_ADDON_DEFS.map((def) => {
              const a = project.addons[def.id];
              if (!a || !a.on) return null;
              const lt = addonLineTotal(def, a, systems.length);
              if (lt <= 0 && def.type === "multirow") return null;
              const sl = addonSubline(def, a);
              return (
                <div className="est-sys-line" key={def.id}>
                  <span>
                    {def.name}
                    {sl ? (
                      <span>
                        {" "}
                        · <span style={{ color: "#7d8e8b" }}>{sl}</span>
                      </span>
                    ) : (
                      ""
                    )}
                  </span>
                  <span className="v">{formatPrice(lt)}</span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="est-total">
        <span className="tlabel">
          Project Total
          <small id="estSysCount">
            {systems.length === 1 ? "1 system" : `${systems.length} systems`}
          </small>
        </span>
        <span className="tval" id="grandTotal">
          {formatPrice(grand)}
        </span>
      </div>

      <div className="est-actions">
        <button
          type="button"
          className="btn btn-primary"
          id="panelPrintBtn"
          onClick={handlePrint}
        >
          Print / Save PDF
        </button>
        <button
          type="button"
          className="btn btn-ghost"
          id="resetBtn"
          onClick={onReset}
        >
          Reset
        </button>
      </div>
      <button
        type="button"
        className="btn btn-confirm-open"
        id="openConfirmBtn"
        onClick={onOpenConfirm}
      >
        {project.confirmedOnce
          ? "Edit / Re-submit Quote"
          : "Confirm & Submit Quote"}
      </button>

      <div className="est-contact">
        <div className="ec-name">Sam Yaghobi</div>
        <a href="mailto:sam.yaghobi@rhinoair.com">sam.yaghobi@rhinoair.com</a>
        <a href="tel:+18189004007">(818) 900-4007</a>
        <div className="ec-office">
          Office (818) 535-8888 · info@rhinoair.com · Lic. C20-1142997 · OSHA
          26-607683422
        </div>
      </div>
      <div className="partner-note">
        <b>Tier / Builder Partner Pricing</b>
        Selecting a tier does not by itself qualify a customer for that price.
        Tiered pricing applies only upon execution of a signed Builder
        Partnership Agreement confirming the committed project volume.
      </div>
      <div className="disclaimer" id="panelDisclaimer">
        Estimate only. Final pricing subject to site survey, permit fees &amp;
        local code requirements.
        {project.quoteExpiry
          ? ` Pricing valid through ${project.quoteExpiry}.`
          : " Valid 30 days."}
      </div>
    </div>
  );
}
