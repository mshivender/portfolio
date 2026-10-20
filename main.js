(() => {
  const C = window.CONTENT;
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);

  // Simple bindings
  $$("[data-bind]").forEach((el) => (el.textContent = C[el.dataset.bind] ?? ""));
  $$("[data-href]").forEach((el) => (el.href = el.dataset.href === "mailto" ? `mailto:${C.email}` : C[el.dataset.href]));
  $$("[data-src]").forEach((el) => {
    el.onerror = () =>
      el.closest(".profile-image")
        ? el.replaceWith(Object.assign(document.createElement("span"), { className: "initials", textContent: C.initials }))
        : el.remove();
    el.src = C[el.dataset.src] || "";
  });
  document.title = `${C.name} | Portfolio`;
  $("#year").textContent = new Date().getFullYear();

  // Education
  $("#edu-list").innerHTML = C.education.map((e) => `
    <article class="t-item">
      <span class="t-dot"></span>
      <div class="t-card">
        <span class="muted">${esc(e.duration)}</span>
        <h3>${esc(e.school)}</h3>
        <p class="accent">${esc(e.degree)}</p>
        <div class="stats">${e.stats.map((s) => `<span class="stat">${esc(s)}</span>`).join("")}</div>
        <p class="coursework">${esc(e.coursework)}</p>
      </div>
    </article>`).join("");

  // Experience (expandable)
  $("#exp-list").innerHTML = C.experience.map((x) => `
    <article class="t-item">
      <span class="t-dot"></span>
      <div class="t-card glass">
        <button class="card-head" aria-expanded="false">
          <span class="logo">${x.logo ? `<img src="${esc(x.logo)}" alt="" />` : esc(x.org[0])}</span>
          <span class="head-text">
            <strong class="role">${esc(x.role)}</strong>
            <span class="accent">${esc(x.org)}</span>
            <span class="muted meta">${esc(x.duration)} · ${esc(x.location)}</span>
          </span>
          <span class="chev">▼</span>
        </button>
        <p class="summary">${esc(x.summary)}</p>
        <div class="details" hidden>
          <ul>${x.points.map((p) => `<li>${esc(p)}</li>`).join("")}</ul>
          <div class="tags">${x.tags.map((t) => `<span class="tag">${esc(t)}</span>`).join("")}</div>
        </div>
      </div>
    </article>`).join("");
  $$("#exp-list .card-head").forEach((btn) =>
    btn.addEventListener("click", () => {
      const open = btn.getAttribute("aria-expanded") === "true";
      btn.setAttribute("aria-expanded", !open);
      btn.parentElement.querySelector(".details").hidden = open;
    })
  );

  // Skills
  $("#skills").innerHTML = C.skills.map((s) => `
    <div class="skill-card">
      <span class="skill-title">${esc(s.title)}</span>
      <div class="pills">${s.items.map((i) => `<span class="pill">${esc(i)}</span>`).join("")}</div>
    </div>`).join("");

  // Projects
  $("#project-grid").innerHTML = C.projects.map((p) => `
    <a class="project" href="${esc(p.link)}" target="_blank" rel="noopener">
      <div class="p-top"><span class="p-cat">${esc(p.category)}</span><span class="p-icon" aria-hidden="true">${esc(p.icon || "◆")}</span></div>
      <h3>${esc(p.title)}</h3>
      <span class="p-sub">${esc(p.sub)}</span>
      <p class="desc">${esc(p.desc)}</p>
      <div class="tags">${p.tags.map((t) => `<span class="tag">${esc(t)}</span>`).join("")}</div>
      <span class="p-link">View project ↗</span>
    </a>`).join("");

  // Socials
  $("#socials").innerHTML = C.socials.map((s) => `<a href="${esc(s.url)}" target="_blank" rel="noopener">${esc(s.label)}</a>`).join("");

  // Contact form → opens the visitor's mail app
  $("#contact-form").addEventListener("submit", (e) => {
    e.preventDefault();
    const f = new FormData(e.target);
    const body = `${f.get("message")}\n\n— ${f.get("name")} (${f.get("email")})`;
    location.href = `mailto:${C.email}?subject=${encodeURIComponent(f.get("subject"))}&body=${encodeURIComponent(body)}`;
  });

  // Timeline items light up as they reach the middle of the screen
  const io = new IntersectionObserver(
    (entries) => entries.forEach((en) => en.target.classList.toggle("active", en.isIntersecting)),
    { rootMargin: "-35% 0px -35% 0px" }
  );
  $$(".t-item").forEach((el) => io.observe(el));

  // Scroll spy
  const sections = $$("[data-spy]");
  const spyTarget = (s) => (s.id === "hero-spy" ? "home" : s.id);
  const spy = $("#spy");
  spy.innerHTML = sections.map((s) => `<a href="#${spyTarget(s)}" class="spy"><span class="spy-label">${s.dataset.spy}</span><span class="spy-dot"></span></a>`).join("");
  const spyLinks = $$(".spy", spy);
  const onScroll = () => {
    const mid = innerHeight / 2;
    let idx = 0;
    sections.forEach((s, i) => { if (i && s.getBoundingClientRect().top <= mid) idx = i; });
    spyLinks.forEach((a, i) => a.classList.toggle("active", i === idx));
    $("#to-top").classList.toggle("visible", scrollY > innerHeight);
  };
  addEventListener("scroll", onScroll, { passive: true });
  onScroll();
  $("#to-top").addEventListener("click", () => scrollTo({ top: 0, behavior: "smooth" }));

  // Custom cursor (desktop only)
  const cur = $(".cursor");
  if (matchMedia("(pointer: fine)").matches) {
    addEventListener("mousemove", (e) => (cur.style.transform = `translate(${e.clientX}px, ${e.clientY}px)`));
    document.addEventListener("mouseover", (e) => cur.classList.toggle("big", !!e.target.closest("a, button")));
  }
})();
