(function () {
  const sections = window.ltssmSections || {};
  const stateDetails = window.ltssmStateDetails || {};

  const buttons = document.querySelectorAll(".section-btn");
  const label = document.getElementById("currentSectionLabel");
  const description = document.getElementById("sectionDescription");
  const container = document.getElementById("diagramContainer");
  const transitionTableBody = document.getElementById("transitionTableBody");
  const detailsColumnHeader = document.getElementById("detailsColumnHeader");

  const specDetailPanel = document.getElementById("specDetailPanel");
  const specDetailTitle = document.getElementById("specDetailTitle");
  const specDetailBody = document.getElementById("specDetailBody");
  const closeSpecDetailBtn = document.getElementById("closeSpecDetailBtn");

  const searchInput = document.getElementById("searchInput");
  const resetFiltersBtn = document.getElementById("resetFiltersBtn");

  const stateFilterBar = document.getElementById("stateFilterBar");
  const stateFilterValue = document.getElementById("stateFilterValue");
  const clearStateFilterBtn = document.getElementById("clearStateFilterBtn");

  let currentSectionKey = "detect";
  let currentMode = "spec";
  let svgSelectedState = "";

  function escapeHtml(value) {
    return String(value)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#39;");
  }

  function escapeAttribute(value) {
    return escapeHtml(value);
  }

  function getCurrentTransitions() {
    const entry = sections[currentSectionKey];
    if (!entry || !entry.transitions) return [];
    return entry.transitions[currentMode] || [];
  }

  function updateStateFilterBar() {
    if (svgSelectedState) {
      stateFilterBar.classList.remove("hidden");
      stateFilterValue.textContent = svgSelectedState;
    } else {
      stateFilterBar.classList.add("hidden");
      stateFilterValue.textContent = "";
    }
  }

  function renderDiagram(diagramPath, title) {
    const extraClass = "";
    container.innerHTML = `
      <object
        class="diagram-object${extraClass}"
        data="${diagramPath}"
        type="image/svg+xml"
        aria-label="${escapeAttribute(title)} ${escapeAttribute(currentMode)} diagram"
      >
        <div class="placeholder">
          ${escapeHtml(currentMode.toUpperCase())} diagram not found for ${escapeHtml(title)}.<br>
          Expected file:<br>${escapeHtml(diagramPath)}
        </div>
      </object>
    `;
  }

  function clearSvgFocus() {
    const objectEl = document.querySelector(".diagram-object");
    if (!objectEl || !objectEl.contentWindow) return;

    objectEl.contentWindow.postMessage(
      {
        type: "ltssm-clear-focus",
        section: currentSectionKey
      },
      "*"
    );
  }

  function formatCondition(item) {
    if (currentMode === "spec") {
      return `<span class="condition-text">${escapeHtml(item.condition || "")}</span>`;
    }

    const arcText = item.arc ? `<span class="condition-arc">${escapeHtml(item.arc)}</span>` : "";
    const condText = item.condition ? `<span class="condition-text">${escapeHtml(item.condition)}</span>` : "";

    if (arcText && condText) return `${arcText} — ${condText}`;
    return arcText || condText || "";
  }

  function formatContextTags(item) {
    const tags = item.contextTags || item.testTags || [];
    if (!tags.length) return "";
    return `
      <div class="tag-list">
        ${tags.map(tag => `<span class="tag">${escapeHtml(tag)}</span>`).join("")}
      </div>
    `;
  }

  function resolveStateDetailKey(stateName) {
    if (!stateName) return "";
    if (stateDetails[stateName]) return stateName;
    if (/^Recovery\.Equalization(\.|$)/.test(stateName)) return "Recovery.Equalization";
    return "";
  }

  function getStateDetailForTransition(item) {
    const fromKey = resolveStateDetailKey(item.from || "");
    if (fromKey) return { key: fromKey, detail: stateDetails[fromKey] };

    const toKey = resolveStateDetailKey(item.to || "");
    if (toKey) return { key: toKey, detail: stateDetails[toKey] };

    return null;
  }

  function hasDetailView(item) {
    if (item && item.specDetails) return true;
    return !!getStateDetailForTransition(item);
  }

  function renderDetailsButton(item, index) {
    if (currentMode !== "spec" || !hasDetailView(item)) return "";
    return `<button class="small-btn spec-detail-btn" type="button" data-index="${index}">View</button>`;
  }

  function isDetectSection() {
    return currentSectionKey === "detect";
  }

  function isPollingSection() {
    return currentSectionKey === "polling";
  }

  function isSectionWithStateDetail() {
    return isDetectSection() || isPollingSection() || isConfigurationSection() || isRecoverySection() || isEqualizationSection();
  }

  function isConfigurationSection() {
    return currentSectionKey === "configuration";
  }

  function isRecoverySection() {
    return currentSectionKey === "recovery";
  }

  function isEqualizationSection() {
    return currentSectionKey === "equalization";
  }

  function getMarkdownText(markdownValue) {
    if (typeof markdownValue === "string") return markdownValue;
    if (markdownValue && typeof markdownValue === "object" && typeof markdownValue.value === "string") {
      return markdownValue.value;
    }
    return "";
  }

  function resolveDetectSubStateDetailKey(stateName) {
    const normalized = String(stateName || "").toUpperCase();
    if (!normalized) return "";

    if (normalized.includes("QUIET") || normalized === "RST_ASSERT") {
      return "Detect.Quiet";
    }

    if (normalized.includes("ACTIVE") || normalized.startsWith("DET_")) {
      return "Detect.Active";
    }

    return "";
  }

  function resolvePollingSubStateDetailKey(stateName) {
    const normalized = String(stateName || "").toUpperCase();
    if (!normalized) return "";

    if (normalized === "POL_ACTIVE") return "Polling.Active";
    if (normalized === "POL_CONFIG") return "Polling.Configuration";
    if (
      normalized.startsWith("POL_COMP") ||
      normalized === "POL_CHECK_COMPL" ||
      normalized === "POL_EIOS" ||
      normalized === "POL_PDP"
    ) return "Polling.Compliance";

    return "";
  }

  function resolveConfigurationSubStateDetailKey(stateName) {
    const normalized = String(stateName || "").toUpperCase();
    if (!normalized) return "";

    // Spec SVG uses "Config.X" prefix; impl SVG uses "CFG_X" prefix
    if (normalized === "CFG_LNKWID_START" || normalized === "CFG_LNKWID_START_REC" ||
        normalized === "CFG_LNKWID_START_UPCFG" || normalized === "CFG_LNKWID_START_UPCFG_PREP_EXIT_MASTER") {
      return "Configuration.Linkwidth.Start";
    }
    if (normalized === "CFG_LNKWID_ACCEPT")  return "Configuration.Linkwidth.Accept";
    if (normalized === "CFG_LANENUM_WAIT")   return "Configuration.Lanenum.Wait";
    if (normalized === "CFG_LANENUM_ACCEPT") return "Configuration.Lanenum.Accept";
    if (normalized === "CFG_COMPLETE")       return "Configuration.Complete";
    if (normalized === "CFG_IDLE")           return "Configuration.Idle";

    return "";
  }

  function resolveRecoverySubStateDetailKey(stateName) {
    const normalized = String(stateName || "").toUpperCase();
    if (!normalized) return "";

    if (normalized === "REC_RCVRLOCK") return "Recovery.RcvrLock";
    if (normalized === "REC_RCVRCFG" || normalized === "REC_RCVRCFG_SPEED") return "Recovery.RcvrCfg";
    if (normalized === "REC_IDLE") return "Recovery.Idle";
    if (
      normalized === "REC_SPEED" ||
      normalized === "REC_SPEED_IDLE" ||
      normalized === "REC_WAIT_FOR_GEN_TRANS" ||
      normalized === "REC_SPEED_WAIT_1US_PREP" ||
      normalized === "REC_SPEED_WAIT_1US" ||
      normalized === "REC_WAIT_EXIT_EI" ||
      normalized === "REC_WAIT_BITLOCK_TO"
    ) return "Recovery.Speed";
    if (normalized === "REC_COMPLETE") return "Recovery.Equalization";

    return "";
  }

  function resolveEqualizationSubStateDetailKey(stateName) {
    const raw = String(stateName || "").trim();
    if (!raw) return "";
    const normalized = raw.toUpperCase();
    const normalizedText = raw.toLowerCase();

    // Spec equalization nodes are phase-oriented with Upstream/Downstream suffixes.
    if (raw.includes("Recovery.Equalization.Phase0.")) return "Recovery.Equalization.Phase0";
    if (raw.includes("Recovery.Equalization.Phase1.")) return "Recovery.Equalization.Phase1";
    if (raw.includes("Recovery.Equalization.Phase2.")) return "Recovery.Equalization.Phase2";
    if (raw.includes("Recovery.Equalization.Phase3.")) return "Recovery.Equalization.Phase3";

    // Equalization spec SVG labels (user-facing text nodes).
    if (normalizedText === "phase 0" || normalizedText === "phase 0 complete") return "Recovery.Equalization.Phase0";
    if (normalizedText === "phase 1") return "Recovery.Equalization.Phase1";
    if (normalizedText === "phase 2") return "Recovery.Equalization.Phase2";
    if (normalizedText === "phase 3") return "Recovery.Equalization.Phase3";
    if (normalizedText === "entry from recovery.rcvrlock" || normalizedText === "return to recovery.rcvrlock") return "Recovery.RcvrLock";
    if (normalizedText === "exit to recovery.speed") return "Recovery.Speed";
    if (normalizedText === "equalization complete") return "Recovery.Equalization.Phase3";
    if (normalizedText === "preset / coefficient exchange complete" || normalizedText === "receiver evaluation complete") return "Recovery.Equalization.Phase2";
    if (
      normalizedText === "equalization failure" ||
      normalizedText === "timeout / failure to train" ||
      normalizedText === "redo / evaluation retry" ||
      normalizedText === "redo / fallback request"
    ) return "Recovery.Equalization.Phase3";

    // Impl equalization nodes are abbreviated REQ_* states.
    if (normalized === "REQ_PH0" || normalized === "REQ_PH01_PRELCK") return "Recovery.Equalization.Phase0";
    if (normalized === "REQ_PH1") return "Recovery.Equalization.Phase1";
    if (normalized === "REQ_SEVA_SYNC" || normalized === "REQ_SEVA") return "Recovery.Equalization.Phase2";
    if (
      normalized === "REQ_MEVA_LCK" ||
      normalized === "REQ_MEVA_PRELCK" ||
      normalized === "REQ_MEVA_RUNWT4SUM" ||
      normalized === "REQ_MEVA_RUN" ||
      normalized === "REQ_MEVA_EVL"
    ) return "Recovery.Equalization.Phase3";

    // Recovery exits visible in equalization implementation view.
    if (normalized === "REC_RCVRLOCK") return "Recovery.RcvrLock";
    if (normalized === "REC_SPEED") return "Recovery.Speed";
    if (normalized === "DET_QUIET_RST") return "Detect.Quiet";

    return "";
  }

  function resolveStateDetailKey(stateName) {
    // Spec SVG nodes use exact key names — try direct lookup first
    if (stateDetails[stateName]) return stateName;

    // Spec SVG for configuration uses "Config.X" (not full "Configuration.X") — map those
    if (isConfigurationSection()) {
      const specMapping = {
        "Config.Linkwidth.Start":  "Configuration.Linkwidth.Start",
        "Config.Linkwidth.Accept": "Configuration.Linkwidth.Accept",
        "Config.Lanenum.Wait":     "Configuration.Lanenum.Wait",
        "Config.Lanenum.Accept":   "Configuration.Lanenum.Accept",
        "Config.Complete":         "Configuration.Complete",
        "Config.Idle":             "Configuration.Idle",
      };
      if (specMapping[stateName]) return specMapping[stateName];
    }

    // Impl SVG nodes use abbreviated names — section-specific fuzzy match
    if (isDetectSection())       return resolveDetectSubStateDetailKey(stateName);
    if (isPollingSection())      return resolvePollingSubStateDetailKey(stateName);
    if (isConfigurationSection()) return resolveConfigurationSubStateDetailKey(stateName);
    if (isRecoverySection())     return resolveRecoverySubStateDetailKey(stateName);
    if (isEqualizationSection()) return resolveEqualizationSubStateDetailKey(stateName);

    return "";
  }

  function showStateDetailByKey(stateKey, stateLabel) {
    const detail = stateDetails[stateKey];
    if (!detail) {
      hideSpecDetail();
      return;
    }

    const markdownText = getMarkdownText(detail.markdown);
    specDetailTitle.textContent = stateLabel ? `${stateLabel} (${stateKey})` : stateKey;
    specDetailBody.innerHTML = `
      <p><strong>Spec Chapter:</strong> ${escapeHtml(detail.specChapter || "N/A")}</p>
      ${markdownText ? markdownToStructuredHtml(markdownText) : "<p>No detailed markdown content is available for this state.</p>"}
    `;
    specDetailPanel.classList.remove("hidden");
  }

  function matchesSearch(item, query) {
    if (!query) return true;

    const detail = item.specDetails || {};
    const orderedSetText = (detail.orderedSets || [])
      .map(v => `${v.type || ""} ${v.requirement || ""}`)
      .join(" ");
    const registerText = (detail.registers || [])
      .map(v => `${v.register || ""} ${v.bits || ""} ${v.action || ""}`)
      .join(" ");

    const haystack = [
      item.from || "",
      item.to || "",
      item.arc || "",
      item.condition || "",
      ...(item.contextTags || []),
      ...(item.testTags || []),
      detail.detailedDescription || "",
      ...(detail.applicableGens || []),
      ...(detail.encoding || []),
      ...(detail.flitMode || []),
      ...(detail.clocking || []),
      orderedSetText,
      registerText,
      detail.timeoutCondition || ""
    ].join(" ").toLowerCase();

    return haystack.includes(query.toLowerCase());
  }

  function normalizeStateFilterValue(stateName) {
    const raw = String(stateName || "").trim();
    if (!raw) return "";

    const resolved = resolveStateDetailKey(raw);
    return (resolved || raw).toLowerCase();
  }

  function getStateAliases(stateName) {
    const raw = String(stateName || "").trim();
    if (!raw) return [];

    const aliases = new Set();
    aliases.add(raw);

    // Handle composite impl fields like "DET_POL/RST_ASSERT" or "A, B".
    raw
      .split(/[\/,|]/)
      .map(part => part.trim())
      .filter(Boolean)
      .forEach(part => aliases.add(part));

    // Handle labels like "Detect (hypothesis)" so click on "Detect" still matches.
    const withoutParen = raw.replace(/\s*\([^)]*\)\s*/g, " ").trim();
    if (withoutParen) aliases.add(withoutParen);

    return Array.from(aliases);
  }

  function matchesSvgStateFilter(item) {
    if (!svgSelectedState) return true;

    const selectedRaw = String(svgSelectedState || "").trim().toLowerCase();
    const selectedNormalized = normalizeStateFilterValue(svgSelectedState);
    const fromAliases = getStateAliases(item.from);

    // Intentional: table filter is "selected state as source", i.e., outgoing arcs only.
    const candidates = fromAliases.flatMap(value => {
      const raw = String(value || "").trim().toLowerCase();
      const normalized = normalizeStateFilterValue(value);
      return [raw, normalized].filter(Boolean);
    });

    return candidates.some(value => value === selectedRaw || value === selectedNormalized);
  }

  function getFilteredTransitions(transitions) {
    const query = searchInput.value.trim();

    return (transitions || []).filter(item => {
      return matchesSearch(item, query) && matchesSvgStateFilter(item);
    });
  }

  function renderTransitions(transitions) {
    const showDetailsColumn = !isSectionWithStateDetail();
    if (detailsColumnHeader) {
      detailsColumnHeader.classList.toggle("hidden", !showDetailsColumn);
    }

    if (!transitions || transitions.length === 0) {
      transitionTableBody.innerHTML = `
        <tr>
          <td colspan="${showDetailsColumn ? 5 : 4}">No transitions match the current filters.</td>
        </tr>
      `;
      attachDynamicHandlers(transitions);
      return;
    }

    transitionTableBody.innerHTML = transitions.map((item, index) => `
      <tr>
        <td>${escapeHtml(item.from || "")}</td>
        <td>${escapeHtml(item.to || "")}</td>
        <td>${formatCondition(item)}</td>
        <td>${formatContextTags(item)}</td>
        ${showDetailsColumn ? `<td>${renderDetailsButton(item, index)}</td>` : ""}
      </tr>
    `).join("");

    attachDynamicHandlers(transitions);
  }

  function renderListSection(title, items, formatter) {
    if (!items || !items.length) return "";
    return `
      <div style="margin-bottom: 14px;">
        <div style="font-weight: 700; margin-bottom: 6px;">${escapeHtml(title)}</div>
        <ul>
          ${items.map(formatter).join("")}
        </ul>
      </div>
    `;
  }

  function markdownToStructuredHtml(markdownText) {
    const lines = String(markdownText || "").replace(/\r/g, "").split("\n");
    const html = [];
    let i = 0;
    let listType = "";

    function closeList() {
      if (listType) {
        html.push(listType === "ul" ? "</ul>" : "</ol>");
        listType = "";
      }
    }

    // Escape HTML then apply inline markdown (bold, italic, code)
    function inlineFormat(text) {
      let s = escapeHtml(text);
      // **bold** and __bold__
      s = s.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
      s = s.replace(/__(.+?)__/g, "<strong>$1</strong>");
      // *italic* and _italic_ (not inside words)
      s = s.replace(/\*([^*]+)\*/g, "<em>$1</em>");
      s = s.replace(/(?<!\w)_([^_]+)_(?!\w)/g, "<em>$1</em>");
      // `code`
      s = s.replace(/`([^`]+)`/g, "<code>$1</code>");
      return s;
    }

    function isTableDivider(line) {
      const t = line.trim();
      return /^\|?[\s:-]+\|[\s|:-]*$/.test(t);
    }

    function parseTableRow(line) {
      let row = line.trim();
      if (row.startsWith("|")) row = row.slice(1);
      if (row.endsWith("|")) row = row.slice(0, -1);
      return row.split("|").map(cell => inlineFormat(cell.trim()));
    }

    while (i < lines.length) {
      const line = lines[i];
      const trimmed = line.trim();

      if (!trimmed || trimmed === "---") {
        closeList();
        i += 1;
        continue;
      }

      if (trimmed.includes("|") && i + 1 < lines.length && isTableDivider(lines[i + 1])) {
        closeList();
        const headers = parseTableRow(trimmed);
        i += 2;
        const rows = [];
        while (i < lines.length) {
          const rowLine = lines[i].trim();
          if (!rowLine || !rowLine.includes("|")) break;
          rows.push(parseTableRow(rowLine));
          i += 1;
        }

        html.push('<table><thead><tr>' + headers.map(h => `<th>${h}</th>`).join("") + "</tr></thead><tbody>");
        rows.forEach(row => {
          html.push("<tr>" + row.map(c => `<td>${c}</td>`).join("") + "</tr>");
        });
        html.push("</tbody></table>");
        continue;
      }

      const headingMatch = trimmed.match(/^(#{1,6})\s+(.+)$/);
      if (headingMatch) {
        closeList();
        const level = Math.min(6, Math.max(3, headingMatch[1].length + 2));
        html.push(`<h${level}>${inlineFormat(headingMatch[2])}</h${level}>`);
        i += 1;
        continue;
      }

      if (/^(Description|Entry Actions|Tx Behavior|Rx Expectations|Register Updates|Timing \/ Exit Conditions|Notes):$/i.test(trimmed)) {
        closeList();
        html.push(`<h4>${escapeHtml(trimmed.replace(/:$/, ""))}</h4>`);
        i += 1;
        continue;
      }

      const bulletMatch = line.match(/^\s*[-•◦▪▫]\s+(.+)$/);
      if (bulletMatch) {
        if (listType !== "ul") {
          closeList();
          listType = "ul";
          html.push("<ul>");
        }
        html.push(`<li>${inlineFormat(bulletMatch[1])}</li>`);
        i += 1;
        continue;
      }

      const numberedMatch = line.match(/^\s*\d+\.\s+(.+)$/);
      if (numberedMatch) {
        if (listType !== "ol") {
          closeList();
          listType = "ol";
          html.push("<ol>");
        }
        html.push(`<li>${inlineFormat(numberedMatch[1])}</li>`);
        i += 1;
        continue;
      }

      closeList();
      html.push(`<p>${inlineFormat(trimmed)}</p>`);
      i += 1;
    }

    closeList();
    return html.join("");
  }

  function showGeneratedStateDetail(item) {
    const stateDetailInfo = getStateDetailForTransition(item);
    if (!stateDetailInfo) {
      specDetailTitle.textContent = `${item.from || ""} → ${item.to || ""}`;
      specDetailBody.innerHTML = "<p>No detailed state source content is available for this transition.</p>";
      specDetailPanel.classList.remove("hidden");
      return;
    }

    const detail = stateDetailInfo.detail || {};
    const markdownText = getMarkdownText(detail.markdown);

    specDetailTitle.textContent = `${item.from || ""} → ${item.to || ""}`;
    specDetailBody.innerHTML = `
      <p><strong>Spec Chapter:</strong> ${escapeHtml(detail.specChapter || "N/A")}</p>
      ${markdownText ? markdownToStructuredHtml(markdownText) : "<p>No detailed markdown content is available for this transition.</p>"}
    `;
    specDetailPanel.classList.remove("hidden");
  }

  function showSpecDetail(item) {
    if (getStateDetailForTransition(item)) {
      showGeneratedStateDetail(item);
      return;
    }

    const d = item.specDetails || {};

    specDetailTitle.textContent = `${item.from || ""} → ${item.to || ""}`;

    specDetailBody.innerHTML = `
      ${d.detailedDescription ? `<p><strong>Detailed Description:</strong> ${escapeHtml(d.detailedDescription)}</p>` : ""}
      ${d.applicableGens && d.applicableGens.length ? `<p><strong>Applicable Gens:</strong> ${escapeHtml(d.applicableGens.join(", "))}</p>` : ""}
      ${d.encoding && d.encoding.length ? `<p><strong>Encoding:</strong> ${escapeHtml(d.encoding.join(", "))}</p>` : ""}
      ${d.flitMode && d.flitMode.length ? `<p><strong>Flit Mode:</strong> ${escapeHtml(d.flitMode.join(", "))}</p>` : ""}
      ${d.clocking && d.clocking.length ? `<p><strong>Clocking:</strong> ${escapeHtml(d.clocking.join(", "))}</p>` : ""}

      ${renderListSection(
        "Ordered Set / TS Requirements",
        d.orderedSets,
        os => `<li><strong>${escapeHtml(os.type || "")}</strong>${os.requirement ? ` — ${escapeHtml(os.requirement)}` : ""}</li>`
      )}

      ${renderListSection(
        "Register / Bit Dependencies",
        d.registers,
        r => `<li><strong>${escapeHtml(r.register || "")}</strong>${r.bits ? ` — ${escapeHtml(r.bits)}` : ""}${r.action ? `<br>${escapeHtml(r.action)}` : ""}</li>`
      )}

      ${d.timeoutCondition ? `<p><strong>Timeout Condition:</strong> ${escapeHtml(d.timeoutCondition)}</p>` : ""}
    `;

    specDetailPanel.classList.remove("hidden");
  }

  function hideSpecDetail() {
    specDetailPanel.classList.add("hidden");
    specDetailTitle.textContent = "Spec Transition Details";
    specDetailBody.innerHTML = "";
  }

  function attachDynamicHandlers(transitions) {
    const detailButtons = transitionTableBody.querySelectorAll(".spec-detail-btn");
    detailButtons.forEach(btn => {
      btn.addEventListener("click", () => {
        const index = Number(btn.dataset.index);
        const item = transitions[index];
        if (item) showSpecDetail(item);
      });
    });
  }

  function refreshTableOnly() {
    const transitions = getCurrentTransitions();
    const filtered = getFilteredTransitions(transitions);
    renderTransitions(filtered);
    updateStateFilterBar();
  }

  function renderCurrentSection() {
    const entry = sections[currentSectionKey];

    if (!entry) {
      label.textContent = "Showing: Unknown";
      description.textContent = "No description available.";
      container.innerHTML = '<div class="placeholder">No diagram mapping found.</div>';
      renderTransitions([]);
      hideSpecDetail();
      updateStateFilterBar();
      return;
    }

    label.textContent = `Showing: ${entry.title}`;
    description.textContent = entry.descriptions[currentMode] || "";
    renderDiagram(entry.diagrams[currentMode] || "", entry.title);

    const transitions = getCurrentTransitions();
    renderTransitions(getFilteredTransitions(transitions));
    hideSpecDetail();
    updateStateFilterBar();
  }

  function showSection(sectionKey) {
    clearSvgFocus();
    currentSectionKey = sectionKey;
    svgSelectedState = "";
    renderCurrentSection();
  }

  buttons.forEach(button => {
    button.addEventListener("click", () => {
      buttons.forEach(btn => btn.classList.remove("active"));
      button.classList.add("active");
      showSection(button.dataset.section);
    });
  });

  searchInput.addEventListener("input", refreshTableOnly);

  resetFiltersBtn.addEventListener("click", () => {
    searchInput.value = "";
    svgSelectedState = "";
    clearSvgFocus();
    renderCurrentSection();
  });

  clearStateFilterBtn.addEventListener("click", () => {
    svgSelectedState = "";
    clearSvgFocus();
    refreshTableOnly();
  });

  closeSpecDetailBtn.addEventListener("click", hideSpecDetail);

  window.addEventListener("message", event => {
    const data = event.data;
    if (!data || typeof data !== "object") return;
    if (data.type !== "ltssm-node-click") return;
    if (data.section !== currentSectionKey) return;

    svgSelectedState = data.state || "";
    if (isSectionWithStateDetail()) {
      const detailKey = resolveStateDetailKey(svgSelectedState);
      if (detailKey) {
        showStateDetailByKey(detailKey, svgSelectedState);
      } else {
        hideSpecDetail();
      }
    }
    refreshTableOnly();
  });

  renderCurrentSection();
})();
