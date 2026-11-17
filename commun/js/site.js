/* Site de la Fédération socialiste du Val-de-Marne - maquettes : menu mobile, carte des sections, formulaire */
(function () {
  "use strict";

  /* Menu mobile */
  var bouton = document.querySelector("[data-menu-bouton]");
  var menu = document.querySelector("[data-menu]");
  if (bouton && menu) {
    bouton.addEventListener("click", function () {
      var ouvert = bouton.getAttribute("aria-expanded") === "true";
      bouton.setAttribute("aria-expanded", String(!ouvert));
      menu.classList.toggle("est-ouvert", !ouvert);
    });
  }

  /* Carte des sections */
  var SECTIONS = window.SECTIONS || [];
  function norm(s) {
    return String(s).toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]+/g, " ").trim();
  }
  function trouver(q) {
    q = norm(q);
    if (!q) return null;
    var exact = SECTIONS.filter(function (s) { return s.communes.some(function (c) { return norm(c) === q; }); })[0];
    if (exact) return exact;
    var mot = SECTIONS.filter(function (s) { return s.communes.some(function (c) { return norm(c).indexOf(q + " ") === 0; }); })[0];
    if (mot) return mot;
    var debut = SECTIONS.filter(function (s) { return s.communes.some(function (c) { return norm(c).indexOf(q) === 0; }); })[0];
    if (debut) return debut;
    var dedans = SECTIONS.filter(function (s) { return s.communes.some(function (c) { return norm(c).indexOf(q) !== -1; }); })[0];
    if (dedans) return dedans;
    return SECTIONS.filter(function (s) { return norm(s.nom).indexOf(q) !== -1 || norm(s.secretaire).indexOf(q) !== -1; })[0] || null;
  }

  var cartes = document.querySelectorAll("[data-carte]");
  Array.prototype.forEach.call(cartes, function (bloc) {
    var svg = bloc.querySelector("svg");
    var pins = bloc.querySelector("[data-pins]");
    var fiche = bloc.querySelector("[data-fiche]");
    var form = bloc.querySelector("[data-recherche]");
    var message = bloc.querySelector("[data-message]");
    var lienContact = bloc.getAttribute("data-contact") || "contact.html";

    function choisir(n) {
      var s = SECTIONS.filter(function (x) { return x.n === n; })[0];
      if (!s) return;
      Array.prototype.forEach.call(svg.querySelectorAll("g[data-s]"), function (g) {
        g.classList.toggle("est-actif", Number(g.getAttribute("data-s")) === n);
      });
      if (pins) {
        Array.prototype.forEach.call(pins.querySelectorAll("button"), function (b) {
          var on = Number(b.getAttribute("data-s")) === n;
          b.classList.toggle("est-actif", on);
          b.setAttribute("aria-pressed", String(on));
        });
      }
      if (fiche) {
        fiche.querySelector("[data-f-num]").textContent = "Section n° " + s.n;
        fiche.querySelector("[data-f-nom]").textContent = s.nom;
        fiche.querySelector("[data-f-communes]").textContent = s.communes.length > 1 ? "Communes : " + s.communes.join(", ") : "Commune : " + s.communes[0];
        fiche.querySelector("[data-f-sec]").textContent = s.secretaire;
        fiche.querySelector("[data-f-lien]").setAttribute("href", lienContact + "?objet=section&section=" + s.n);
      }
      if (message) message.textContent = "";
    }
    bloc.choisir = choisir;

    if (pins) {
      SECTIONS.forEach(function (s) {
        var b = document.createElement("button");
        b.type = "button";
        b.className = "carte__pin";
        b.style.left = s.x + "%";
        b.style.top = s.y + "%";
        b.textContent = s.n;
        b.setAttribute("data-s", s.n);
        b.setAttribute("aria-label", "Section " + s.nom);
        b.setAttribute("aria-pressed", "false");
        b.addEventListener("click", function () { choisir(s.n); });
        pins.appendChild(b);
      });
    }
    Array.prototype.forEach.call(svg.querySelectorAll("g[data-s]"), function (g) {
      g.addEventListener("click", function () { choisir(Number(g.getAttribute("data-s"))); });
    });
    if (form) {
      form.addEventListener("submit", function (e) {
        e.preventDefault();
        var champ = form.querySelector("input");
        var trouve = trouver(champ.value);
        if (trouve) {
          choisir(trouve.n);
        } else if (message) {
          message.textContent = champ.value.trim()
            ? "Aucune section trouvée pour « " + champ.value.trim() + " ». Écrivez-nous, nous vous orienterons."
            : "Indiquez le nom de votre ville.";
        }
      });
    }
    Array.prototype.forEach.call(bloc.querySelectorAll("[data-ville]"), function (a) {
      a.addEventListener("click", function (e) {
        e.preventDefault();
        var champ = form && form.querySelector("input");
        if (champ) champ.value = a.getAttribute("data-ville");
        var trouve = trouver(a.getAttribute("data-ville"));
        if (trouve) choisir(trouve.n);
      });
    });
    choisir(Number(bloc.getAttribute("data-depart") || 31));
  });

  /* Liste des sections : sélectionne sur la carte */
  Array.prototype.forEach.call(document.querySelectorAll("[data-choisir]"), function (b) {
    b.addEventListener("click", function () {
      var bloc = document.querySelector("[data-carte]");
      if (!bloc || !bloc.choisir) return;
      bloc.choisir(Number(b.getAttribute("data-choisir")));
      bloc.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  });

  /* Formulaire de contact */
  var f = document.querySelector("[data-contact-form]");
  if (f) {
    var objet = f.querySelector("#objet");
    var blocSection = f.querySelector("[data-bloc-section]");
    var section = f.querySelector("#section");
    var confirmation = f.querySelector("[data-confirmation]");
    var maj = function () {
      var visible = objet.value === "section";
      blocSection.hidden = !visible;
      section.required = visible;
    };
    objet.addEventListener("change", maj);
    var p = new URLSearchParams(window.location.search);
    if (p.get("objet")) objet.value = p.get("objet");
    if (p.get("section")) section.value = p.get("section");
    maj();
    f.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!f.checkValidity()) { f.reportValidity(); return; }
      confirmation.hidden = false;
      confirmation.focus();
    });
  }
})();
