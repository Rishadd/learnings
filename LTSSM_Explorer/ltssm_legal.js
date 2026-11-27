(function () {
  if (typeof window === "undefined") {
    return;
  }

  function hasText(value) {
    return typeof value === "string" && value.trim().length > 0;
  }

  function normalizeWhitespace(value) {
    return String(value || "").replace(/\s+/g, " ").trim();
  }

  function trimTrailingPeriod(value) {
    return value.replace(/[.]+$/, "");
  }

  function toLowerLeadingChar(value) {
    if (!hasText(value)) {
      return value;
    }
    return value.charAt(0).toLowerCase() + value.slice(1);
  }

  function stripTransitionLead(conditionText) {
    var text = normalizeWhitespace(conditionText);
    text = text.replace(/^transition\s+/i, "");
    text = text.replace(/^next state is\s+/i, "");
    text = text.replace(/^the next state is\s+/i, "");
    return trimTrailingPeriod(text);
  }

  function makeLegalCondition(transition) {
    var fromState = hasText(transition.from) ? transition.from : "the current state";
    var toState = hasText(transition.to) ? transition.to : "the next state";
    var raw = hasText(transition.condition) ? transition.condition : "";
    var cleaned = stripTransitionLead(raw);

    if (!hasText(cleaned)) {
      return "A legal transition is permitted from " + fromState + " to " + toState + " when the required LTSSM criteria are satisfied.";
    }

    if (/^(if|when|after|otherwise)\b/i.test(cleaned)) {
      return "A legal transition is permitted from " + fromState + " to " + toState + " " + toLowerLeadingChar(cleaned) + ".";
    }

    return "A legal transition is permitted from " + fromState + " to " + toState + " when " + toLowerLeadingChar(cleaned) + ".";
  }

  function makeLegalSimple(transition) {
    var fromState = hasText(transition.from) ? transition.from : "current state";
    var toState = hasText(transition.to) ? transition.to : "next state";
    var raw = hasText(transition.condition) ? transition.condition : "";
    var cleaned = stripTransitionLead(raw);

    if (!hasText(cleaned)) {
      return "Move from " + fromState + " to " + toState + " when LTSSM rules are met.";
    }

    if (/^(if|when|after|otherwise)\b/i.test(cleaned)) {
      return "Move from " + fromState + " to " + toState + " " + toLowerLeadingChar(cleaned) + ".";
    }

    return "Move from " + fromState + " to " + toState + " when " + toLowerLeadingChar(cleaned) + ".";
  }

  function mapTransition(transition) {
    var mapped = {};
    var key;

    for (key in transition) {
      if (Object.prototype.hasOwnProperty.call(transition, key)) {
        mapped[key] = transition[key];
      }
    }

    mapped.legalCondition = makeLegalCondition(transition);
    mapped.legalConditionSimple = makeLegalSimple(transition);
    mapped.sourceCondition = hasText(transition.condition) ? normalizeWhitespace(transition.condition) : "";

    return mapped;
  }

  function mapTransitionList(list) {
    var input = Array.isArray(list) ? list : [];
    return input.map(mapTransition);
  }

  function buildSection(section) {
    var output = {};
    var key;

    for (key in section) {
      if (Object.prototype.hasOwnProperty.call(section, key) && key !== "transitions") {
        output[key] = section[key];
      }
    }

    var transitions = section && section.transitions ? section.transitions : {};

    output.transitions = {
      spec: mapTransitionList(transitions.spec),
      impl: mapTransitionList(transitions.impl)
    };

    return output;
  }

  function buildLegalSections(sourceSections) {
    var output = {};
    var key;

    for (key in sourceSections) {
      if (Object.prototype.hasOwnProperty.call(sourceSections, key)) {
        output[key] = buildSection(sourceSections[key] || {});
      }
    }

    return output;
  }

  var source = window.ltssmSections || {};
  var legalSections = buildLegalSections(source);

  window.ltssmLegalSections = legalSections;
  window.ltssmLegalMeta = {
    generatedFrom: "window.ltssmSections",
    generatedAt: new Date().toISOString(),
    notes: "Each transition includes legalCondition and legalConditionSimple fields generated from the original condition text."
  };
})();

