import React, { useState } from "react";
import { ProjectState, AddonState } from "./calculatorUtils";
import { PROJECT_ADDON_DEFS } from "./calculatorData";
import AddonItem from "./AddonItem";

interface ProjectAddonsProps {
  project: ProjectState;
  onChange: (proj: ProjectState) => void;
}

export default function ProjectAddons({
  project,
  onChange,
}: ProjectAddonsProps) {
  const [open, setOpen] = useState(false);

  const handleAddonChange = (addonId: string, val: AddonState) => {
    onChange({ ...project, addons: { ...project.addons, [addonId]: val } });
  };

  const commonDefs = PROJECT_ADDON_DEFS.filter((def) => def.common);
  const moreDefs = PROJECT_ADDON_DEFS.filter((def) => !def.common);
  const selCount = moreDefs.filter((d) => project.addons[d.id]?.on).length;

  return (
    <>
      <div id="projectCommonContainer">
        {commonDefs.map((def) => (
          <AddonItem
            key={def.id}
            def={def}
            value={project.addons[def.id]}
            onChange={(val) => handleAddonChange(def.id, val)}
          />
        ))}
      </div>

      <div className={`proj-group ${open ? "open" : ""}`} id="projGroup">
        <button
          type="button"
          className="proj-head"
          id="projHead"
          onClick={() => setOpen(!open)}
        >
          <div className="proj-head-info">
            <div className="proj-title">More project add-ons</div>
            <div className="proj-sub" id="projHeadSub">
              {selCount
                ? `${selCount} selected`
                : "Ductwork, crawl space, riser & flex duct"}
            </div>
          </div>
          <span className="proj-chev">▾</span>
        </button>
        <div className="proj-body">
          <div id="projectAddonsContainer">
            {moreDefs.map((def) => (
              <AddonItem
                key={def.id}
                def={def}
                value={project.addons[def.id]}
                onChange={(val) => handleAddonChange(def.id, val)}
              />
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
