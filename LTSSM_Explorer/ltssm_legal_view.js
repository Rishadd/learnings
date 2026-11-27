(function () {
  if (typeof window === "undefined") {
    return;
  }

  function cloneTransition(transition) {
    var output = {};
    var key;

    for (key in transition) {
      if (Object.prototype.hasOwnProperty.call(transition, key)) {
        output[key] = transition[key];
      }
    }

    return output;
  }

  function mapTransitionForDisplay(transition) {
    var mapped = cloneTransition(transition);

    if (typeof mapped.sourceCondition !== "string" || mapped.sourceCondition.length === 0) {
      mapped.sourceCondition = mapped.condition || "";
    }

    if (typeof mapped.legalConditionSimple === "string" && mapped.legalConditionSimple.length > 0) {
      mapped.condition = mapped.legalConditionSimple;
    } else if (typeof mapped.legalCondition === "string" && mapped.legalCondition.length > 0) {
      mapped.condition = mapped.legalCondition;
    }

    return mapped;
  }

  function mapTransitionList(list) {
    var input = Array.isArray(list) ? list : [];
    return input.map(mapTransitionForDisplay);
  }

  function mapSection(section) {
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

  function applyLegalDisplay(source) {
    var output = {};
    var key;

    for (key in source) {
      if (Object.prototype.hasOwnProperty.call(source, key)) {
        output[key] = mapSection(source[key] || {});
      }
    }

    return output;
  }

  var legalSource = window.ltssmLegalSections || window.ltssmSections || {};
  var displaySections = applyLegalDisplay(legalSource);

  window.ltssmSections = displaySections;
})();

