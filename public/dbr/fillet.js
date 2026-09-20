/* Applies DBR's measured filleted chamfer.
   Surface cards are upgraded to the reference two-layer construction:
   a 1px edge shell around an independently clipped inner surface. */
(function () {
  "use strict";

  var shellSelector = [
    ".hero",
    ".feature-card",
    ".pattern-card",
    ".article-card",
    ".conversation-player",
    ".person-card",
    ".house-cta",
    ".report-card",
    ".newsletter-card",
    ".participate-strip",
    ".site-footer"
  ].join(",");

  function roundedPath(pts) {
    var n = pts.length;
    var out = [];
    var f = function (value) { return Math.round(value * 100) / 100; };

    for (var i = 0; i < n; i++) {
      var point = pts[i];
      var previous = pts[(i - 1 + n) % n];
      var next = pts[(i + 1) % n];
      var previousLength = Math.hypot(previous.x - point.x, previous.y - point.y) || 1;
      var nextLength = Math.hypot(next.x - point.x, next.y - point.y) || 1;
      var previousUnit = {
        x: (previous.x - point.x) / previousLength,
        y: (previous.y - point.y) / previousLength
      };
      var nextUnit = {
        x: (next.x - point.x) / nextLength,
        y: (next.y - point.y) / nextLength
      };
      var angle = Math.acos(Math.max(-1, Math.min(1, previousUnit.x * nextUnit.x + previousUnit.y * nextUnit.y)));
      var radius = point.r || 0;
      var tangent = radius / Math.tan(angle / 2);
      var maxTangent = Math.min(previousLength, nextLength) / 2;

      if (tangent > maxTangent) {
        tangent = maxTangent;
        radius = tangent * Math.tan(angle / 2);
      }

      out.push({
        r: radius,
        a: {
          x: point.x + previousUnit.x * tangent,
          y: point.y + previousUnit.y * tangent
        },
        b: {
          x: point.x + nextUnit.x * tangent,
          y: point.y + nextUnit.y * tangent
        }
      });
    }

    var result = "M " + f(out[0].b.x) + " " + f(out[0].b.y);
    for (var j = 1; j <= n; j++) {
      var corner = out[j % n];
      result += " L " + f(corner.a.x) + " " + f(corner.a.y);
      if (corner.r > 0.01) {
        result += " A " + f(corner.r) + " " + f(corner.r) + " 0 0 1 " + f(corner.b.x) + " " + f(corner.b.y);
      }
    }
    return result + " Z";
  }

  function path(width, height, corners, cut, radius, fillet) {
    var has = function (corner) { return corners.indexOf(corner) !== -1; };
    var chamfer = Math.min(cut, width / 2, height / 2);
    var round = Math.min(radius, width / 2, height / 2);
    var chamferRound = Math.min(fillet, chamfer / 2);
    var points = [];

    if (has("tl")) points.push({ x: chamfer, y: 0, r: chamferRound });
    else points.push({ x: 0, y: 0, r: round });

    if (has("tr")) {
      points.push({ x: width - chamfer, y: 0, r: chamferRound }, { x: width, y: chamfer, r: chamferRound });
    } else {
      points.push({ x: width, y: 0, r: round });
    }

    if (has("br")) {
      points.push({ x: width, y: height - chamfer, r: chamferRound }, { x: width - chamfer, y: height, r: chamferRound });
    } else {
      points.push({ x: width, y: height, r: round });
    }

    if (has("bl")) {
      points.push({ x: chamfer, y: height, r: chamferRound }, { x: 0, y: height - chamfer, r: chamferRound });
    } else {
      points.push({ x: 0, y: height, r: round });
    }

    if (has("tl")) points.push({ x: 0, y: chamfer, r: chamferRound });
    return roundedPath(points);
  }

  function isPersianSurface() {
    return document.documentElement.lang === "fa" || document.documentElement.dir === "rtl";
  }

  function localizedCorners(corners) {
    if (!isPersianSurface()) return corners;
    return corners.reduce(function (result, corner) {
      var mapped = corner;
      if (corner === "br") mapped = "bl";
      if (corner === "tr") mapped = "tl";
      if (result.indexOf(mapped) === -1) result.push(mapped);
      return result;
    }, []);
  }

  function shellTone(element) {
    if (element.classList.contains("paper-card")) return "paper";
    if (element.classList.contains("participate-strip")) return "raised";
    return "deep";
  }

  function ensureShell(element) {
    if (element.parentElement && element.parentElement.classList.contains("dbr-chamfer-shell")) {
      return element.parentElement;
    }

    var shell = document.createElement("div");
    var corners = element.getAttribute("data-chamfer") || "";
    var cut = element.getAttribute("data-cut") || "28";
    var radius = element.getAttribute("data-radius") || "12";
    var fillet = element.getAttribute("data-fillet") || "12";

    shell.className = "dbr-chamfer-shell dbr-shell-" + shellTone(element);
    if (element.matches("a, .feature-card, .pattern-card, .article-card, .person-card")) {
      shell.classList.add("is-interactive");
    }
    if (element.matches(".house-cta, .participate-strip")) {
      shell.classList.add("dbr-section-shell");
    }
    shell.setAttribute("data-chamfer", corners);
    shell.setAttribute("data-cut", cut);
    shell.setAttribute("data-radius", radius);
    shell.setAttribute("data-fillet", fillet);
    shell.setAttribute("data-dbr-shell", "true");

    element.parentNode.insertBefore(shell, element);
    shell.appendChild(element);
    element.classList.add("dbr-chamfer-inner");
    element.removeAttribute("data-chamfer");
    element.removeAttribute("data-cut");
    element.removeAttribute("data-radius");
    element.removeAttribute("data-fillet");
    return shell;
  }

  function applyDirect(element) {
    var bounds = element.getBoundingClientRect();
    if (!bounds.width || !bounds.height) return;

    var corners = localizedCorners((element.getAttribute("data-chamfer") || "").split(/[\s,]+/).filter(Boolean));
    var cut = +(element.getAttribute("data-cut") || 28);
    var radius = +(element.getAttribute("data-radius") || 12);
    var fillet = +(element.getAttribute("data-fillet") || 12);

    if (element.matches(".button, .play-button, .mobile-primary-cta")) {
      var outerClip = corners.length
        ? 'path("' + path(bounds.width, bounds.height, corners, cut, radius, fillet) + '")'
        : "none";
      var innerClip = corners.length
        ? 'path("' + path(Math.max(bounds.width - 2, 0), Math.max(bounds.height - 2, 0), corners, Math.max(cut - 1, 0), Math.max(radius - 1, 0), fillet) + '")'
        : "none";

      element.style.setProperty("--dbr-clip-outer", outerClip);
      element.style.setProperty("--dbr-clip-inner", innerClip);
      element.style.clipPath = outerClip;
      element.style.borderRadius = corners.length ? "0" : radius + "px";
      return;
    }

    element.style.clipPath = corners.length
      ? 'path("' + path(bounds.width, bounds.height, corners, cut, radius, fillet) + '")'
      : "none";
    element.style.borderRadius = corners.length ? "0" : radius + "px";
  }

  function applyShell(shell) {
    var inner = shell.firstElementChild;
    var outerBounds = shell.getBoundingClientRect();
    var innerBounds = inner && inner.getBoundingClientRect();
    if (!inner || !outerBounds.width || !outerBounds.height || !innerBounds.width || !innerBounds.height) return;

    var corners = localizedCorners((shell.getAttribute("data-chamfer") || "").split(/[\s,]+/).filter(Boolean));
    var cut = +(shell.getAttribute("data-cut") || 28);
    var radius = +(shell.getAttribute("data-radius") || 12);
    var fillet = +(shell.getAttribute("data-fillet") || 12);

    if (corners.length) {
      shell.style.clipPath = 'path("' + path(outerBounds.width, outerBounds.height, corners, cut, radius, fillet) + '")';
      inner.style.clipPath = 'path("' + path(innerBounds.width, innerBounds.height, corners, Math.max(cut - 1, 0), Math.max(radius - 1, 0), fillet) + '")';
      shell.style.borderRadius = "0";
      inner.style.borderRadius = "0";
    } else {
      shell.style.clipPath = "none";
      inner.style.clipPath = "none";
      shell.style.borderRadius = radius + "px";
      inner.style.borderRadius = Math.max(radius - 1, 0) + "px";
    }
  }

  function normalizeButtons() {
    document.querySelectorAll(".button, .play-button, .mobile-primary-cta").forEach(function (button) {
      button.setAttribute("data-chamfer", "br");
      button.setAttribute("data-cut", "14");
      button.setAttribute("data-radius", "10");
      button.setAttribute("data-fillet", "5");

      if (!button.querySelector(":scope > .dbr-button-content")) {
        var content = document.createElement("span");
        content.className = "dbr-button-content";
        while (button.firstChild) content.appendChild(button.firstChild);
        button.appendChild(content);
      }
    });
  }

  function apply() {
    normalizeButtons();

    Array.from(document.querySelectorAll("[data-chamfer]")).forEach(function (element) {
      if (element.hasAttribute("data-dbr-shell")) return;
      if (element.matches(shellSelector)) ensureShell(element);
      else applyDirect(element);
    });

    document.querySelectorAll("[data-dbr-shell]").forEach(applyShell);
  }

  window.dbrApplyFillets = apply;
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", apply);
  else apply();
  window.addEventListener("resize", apply);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(apply);
})();
