/*
  Code-principe: dit bestand moet leesbaar blijven voor mensen.
  Schrijf functies met normale regels en inspringing, geen
  geminificeerde eenregelige code, ook niet in toekomstige aanpassingen.
*/

// Route-id's corresponderen met het element-id van de bijbehorende <section class="page">.
const ROUTES = {
  start: "/",
  blog: "/blog",
  projecten: "/projecten",
  cv: "/cv",
  "wie-is-mark": "/wie-is-mark",
  contact: "/contact",
  disclaimer: "/disclaimer",
  privacy: "/privacy",
};

const NOT_FOUND_ROUTE = "niet-gevonden";

let hasRenderedFirstRoute = false;

function qs(selector, root = document) {
  return root.querySelector(selector);
}

function qsa(selector, root = document) {
  return [...root.querySelectorAll(selector)];
}

function escapeHtml(value) {
  const escapeMap = { "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" };
  return String(value || "").replace(/[&<>'"]/g, (char) => escapeMap[char]);
}

function formatDate(isoDate) {
  return new Date(`${isoDate}T12:00:00`).toLocaleDateString("nl-NL", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

// Kapt tekst af op een woordgrens en voegt een ellips toe als de tekst te lang is.
function truncate(text, maxLength) {
  const clean = (text || "").trim();
  if (clean.length <= maxLength) {
    return clean;
  }
  const cut = clean.slice(0, maxLength);
  const lastSpace = cut.lastIndexOf(" ");
  return `${cut.slice(0, lastSpace > 0 ? lastSpace : maxLength)}…`;
}

function safeMarkdownUrl(value) {
  const url = String(value || "").trim();
  return /^(https?:\/\/|\/|\.\.?\/|#)/i.test(url) ? url : "#";
}

function renderMarkdownInline(value) {
  let html = escapeHtml(value);
  html = html.replace(/!\[([^\]]*)\]\(([^\s)]+)(?:\s+&quot;([^&]+)&quot;)?\)/g, (_, alt, source, title) => {
    const titleAttribute = title ? ` title="${title}"` : "";
    return `<img src="${safeMarkdownUrl(source)}" alt="${alt}"${titleAttribute}>`;
  });
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_, label, url) => {
    const safeUrl = safeMarkdownUrl(url.replace(/&quot;/g, '"'));
    return `<a href="${safeUrl}" target="_blank" rel="noopener noreferrer">${label}</a>`;
  });
  html = html.replace(/`([^`]+)`/g, "<code>$1</code>");
  html = html.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
  html = html.replace(/__([^_]+)__/g, "<strong>$1</strong>");
  html = html.replace(/\*([^*]+)\*/g, "<em>$1</em>");
  html = html.replace(/_([^_]+)_/g, "<em>$1</em>");
  return html;
}

// Zet een beperkte, veilige Markdown-subset om naar HTML.
function renderMarkdown(markdown) {
  const lines = String(markdown || "").replace(/\r\n?/g, "\n").split("\n");
  const output = [];
  let paragraph = [];
  let list = [];
  let listType = "";
  let code = [];
  let codeLanguage = "";
  let codeBlockActive = false;

  const flushParagraph = () => {
    if (paragraph.length) {
      output.push(`<p>${renderMarkdownInline(paragraph.join(" ").trim())}</p>`);
      paragraph = [];
    }
  };
  const flushList = () => {
    if (list.length) {
      const tag = listType === "ordered" ? "ol" : "ul";
      output.push(`<${tag}>${list.map((item) => `<li>${renderMarkdownInline(item)}</li>`).join("")}</${tag}>`);
      list = [];
      listType = "";
    }
  };

  lines.forEach((line) => {
    const fence = line.match(/^\s*```\s*([\w-]*)\s*$/);
    if (fence) {
      flushParagraph();
      flushList();
      if (codeBlockActive) {
        const languageClass = codeLanguage ? ` class="language-${escapeHtml(codeLanguage)}"` : "";
        output.push(`<pre><code${languageClass}>${escapeHtml(code.join("\n"))}</code></pre>`);
        code = [];
        codeLanguage = "";
        codeBlockActive = false;
      } else {
        codeLanguage = fence[1];
        code = [];
        codeBlockActive = true;
      }
      return;
    }
    if (codeBlockActive) {
      code.push(line);
      return;
    }

    const heading = line.match(/^\s*(#{1,3})\s+(.+?)\s*#*\s*$/);
    const unordered = line.match(/^\s*[-*+]\s+(.+)$/);
    const ordered = line.match(/^\s*\d+\.\s+(.+)$/);
    const quote = line.match(/^\s*>\s?(.*)$/);
    if (!line.trim()) {
      flushParagraph();
      flushList();
    } else if (heading) {
      flushParagraph();
      flushList();
      const level = heading[1].length;
      output.push(`<h${level}>${renderMarkdownInline(heading[2])}</h${level}>`);
    } else if (unordered || ordered) {
      flushParagraph();
      const nextType = unordered ? "unordered" : "ordered";
      if (listType && listType !== nextType) flushList();
      listType = nextType;
      list.push((unordered || ordered)[1]);
    } else if (quote) {
      flushParagraph();
      flushList();
      output.push(`<blockquote>${renderMarkdownInline(quote[1])}</blockquote>`);
    } else {
      flushList();
      paragraph.push(line.trim());
    }
  });

  flushParagraph();
  flushList();
  if (codeBlockActive) {
    output.push(`<pre><code>${escapeHtml(code.join("\n"))}</code></pre>`);
  }
  return output.join("");
}

// --- Routing (client-side, geen paginaherlaad) ---

function pathForRoute(routeId) {
  return ROUTES[routeId] || `/${NOT_FOUND_ROUTE}`;
}

function updatePageMetadata(routeId, post = null) {
  const metadata = {
    start: {
      title: "Mark Berck | Complexiteit werkbaar maken",
      description: "Professionele persoonlijke website van Mark Berck over functioneel beheer, ketenregie, DPIA, AI-governance en projecten.",
    },
    blog: {
      title: "Blog | Mark Berck",
      description: "Observaties en praktijkervaringen uit functioneel beheer en governance.",
    },
    projecten: {
      title: "Projecten | Mark Berck",
      description: "Persoonlijke projecten van Mark Berck over IT, beheer, governance en werkbare oplossingen.",
    },
    cv: {
      title: "CV | Mark Berck",
      description: "Overzicht van opdrachten, ervaring en certificeringen van Mark Berck.",
    },
    "wie-is-mark": {
      title: "Wie is Mark? | Mark Berck",
      description: "Profiel, kennis en vaardigheden van Mark Berck als functioneel beheerder en ketenregisseur.",
    },
    contact: {
      title: "Contact | Mark Berck",
      description: "Neem contact op met Mark Berck over functioneel beheer, ketenregie en governance.",
    },
    disclaimer: {
      title: "Disclaimer | Mark Berck",
      description: "Disclaimer voor de website van Mark Berck.",
    },
    privacy: {
      title: "Privacy | Mark Berck",
      description: "Privacyinformatie voor de website van Mark Berck.",
    },
    "blog-detail": {
      title: post ? `${post.title} | Mark Berck` : "Blog | Mark Berck",
      description: post?.excerpt || "Blogartikel van Mark Berck over functioneel beheer en governance.",
    },
    "niet-gevonden": {
      title: "Pagina niet gevonden | Mark Berck",
      description: "De gevraagde pagina bestaat niet (meer).",
    },
  }[routeId];

  if (!metadata) {
    return;
  }

  document.title = metadata.title;
  const description = qs('meta[name="description"]');
  const canonical = qs('link[rel="canonical"]');
  const openGraphTitle = qs('meta[property="og:title"]');
  const openGraphDescription = qs('meta[property="og:description"]');
  const openGraphUrl = qs('meta[property="og:url"]');
  if (description) description.setAttribute("content", metadata.description);
  if (canonical) canonical.setAttribute("href", `${location.origin}${location.pathname}`);
  if (openGraphTitle) openGraphTitle.setAttribute("content", metadata.title);
  if (openGraphDescription) openGraphDescription.setAttribute("content", metadata.description);
  if (openGraphUrl) openGraphUrl.setAttribute("content", `${location.origin}${location.pathname}`);
}

function announceRoute(activePage) {
  const status = qs("#route-status");
  const heading = activePage?.querySelector("h1");
  if (status && heading) {
    status.textContent = `${heading.textContent.trim()} geladen`;
  }
}

function routeForPath(pathname) {
  const cleanPath = pathname.replace(/\/+$/, "") || "/";
  if (cleanPath === "/index.html") {
    return "start";
  }
  if (cleanPath.startsWith("/blog/") && cleanPath.length > "/blog/".length) {
    return "blog-detail";
  }
  const match = Object.entries(ROUTES).find(([, path]) => path === cleanPath);
  return match ? match[0] : NOT_FOUND_ROUTE;
}

function showRoute(routeId) {
  const targetId = document.getElementById(routeId) ? routeId : NOT_FOUND_ROUTE;
  updatePageMetadata(targetId);
  qsa(".page").forEach((page) => page.classList.toggle("active", page.id === targetId));
  qsa(".topnav a").forEach((link) => link.classList.toggle("active", link.dataset.route === targetId));

  const activePage = document.getElementById(targetId);
  const focusTarget = activePage?.querySelector("h1") || activePage;
  const activeNavRoute = targetId === "blog-detail" ? "blog" : targetId;
  qsa(".topnav a").forEach((link) => {
    if (link.dataset.route === activeNavRoute) {
      link.setAttribute("aria-current", "page");
    } else {
      link.removeAttribute("aria-current");
    }
  });
  if (focusTarget && !focusTarget.hasAttribute("tabindex")) {
    focusTarget.setAttribute("tabindex", "-1");
  }
  if (focusTarget && hasRenderedFirstRoute) {
    focusTarget.focus({ preventScroll: true });
  }
  announceRoute(activePage);
  hasRenderedFirstRoute = true;
}

function navigate(routeId, { replace = false } = {}) {
  const targetId = document.getElementById(routeId) ? routeId : NOT_FOUND_ROUTE;
  const path = pathForRoute(targetId);
  if (replace) {
    history.replaceState(null, "", path);
  } else {
    history.pushState(null, "", path);
  }
  showRoute(targetId);
}

function wireRoutes(root = document) {
  qsa("[data-route]", root).forEach((link) => {
    link.addEventListener("click", (event) => {
      event.preventDefault();
      navigate(link.dataset.route);
    });
  });
}

function handleLocationChange() {
  const routeId = routeForPath(location.pathname);
  if (routeId === "blog-detail") {
    const slug = location.pathname.replace(/\/+$/, "").replace("/blog/", "");
    showBlogDetail(slug, { replace: true });
    return;
  }
  showRoute(routeId);
}

// --- Blog ---

function blogUrl(post) {
  return `/blog/${post.slug}`;
}

function setupBlogLinks(root = document) {
  qsa("[data-blog-slug]", root).forEach((link) => {
    link.addEventListener("click", (event) => {
      event.preventDefault();
      showBlogDetail(link.dataset.blogSlug);
    });
  });
}

function findBlogPost(slug) {
  return window.SITE_DATA.blog.find((post) => post.slug === slug);
}

async function showBlogDetail(slug, { replace = false } = {}) {
  const post = findBlogPost(slug);
  if (!post) {
    navigate(NOT_FOUND_ROUTE, { replace });
    return;
  }

  const path = `/blog/${post.slug}`;
  if (replace) {
    history.replaceState(null, "", path);
  } else {
    history.pushState(null, "", path);
  }
  showRoute("blog-detail");
  updatePageMetadata("blog-detail", post);

  const container = qs("#blog-detail-content");
  container.innerHTML = `<h1 id="blog-detail-title">${escapeHtml(post.title)}</h1><p class="blog-meta"><time datetime="${escapeHtml(post.date)}">${formatDate(post.date)}</time></p><p>Artikel wordt geladen…</p>`;

  const markdown = await fetch(`/content/blog/${post.slug}.md`).then((response) => (response.ok ? response.text() : ""));
  const bodyHtml = markdown ? renderMarkdown(markdown) : "<p>Dit artikel kon niet geladen worden.</p>";
  const articleImage = post.image
    ? `<figure class="article-hero"><img src="${escapeHtml(post.image)}" alt="Illustratie bij ${escapeHtml(post.title)}"></figure>`
    : "";
  const sourceLink = post.url
    ? `<p><a href="${escapeHtml(post.url)}" target="_blank" rel="noopener noreferrer">Lees het volledige artikel</a></p>`
    : "";

  container.innerHTML = `<h1 id="blog-detail-title">${escapeHtml(post.title)}</h1><p class="blog-meta"><time datetime="${escapeHtml(post.date)}">${formatDate(post.date)}</time></p>${articleImage}${bodyHtml}${sourceLink}<p><a href="/blog" data-route="blog">Terug naar blogoverzicht</a></p>`;
  wireRoutes(container);
  const title = qs("#blog-detail-title");
  if (title) {
    title.setAttribute("tabindex", "-1");
    title.focus({ preventScroll: true });
  }
  announceRoute(qs("#blog-detail"));
}

function renderHomeBlogPosts() {
  const recentPosts = window.SITE_DATA.blog.slice(0, 3);
  qs("#home-blog-list").innerHTML = recentPosts
    .map(
      (post) => `
        <article class="compact-item">
          <a href="${blogUrl(post)}" data-blog-slug="${escapeHtml(post.slug)}">${escapeHtml(post.title)}</a>
          <time datetime="${escapeHtml(post.date)}">${formatDate(post.date)}</time>
          <p>${escapeHtml(truncate(post.excerpt || "", 130))}</p>
        </article>`
    )
    .join("");
}

function renderBlogOverview() {
  qs("#blog-list").innerHTML = window.SITE_DATA.blog
    .map(
      (post) => {
        const thumbStyle = post.image
          ? ` style="background-image: url('${escapeHtml(post.image)}')"`
          : "";
        return `
        <article class="blog-card">
          <div class="blog-thumb"${thumbStyle} aria-hidden="true"></div>
          <div>
            <h2><a href="${blogUrl(post)}" data-blog-slug="${escapeHtml(post.slug)}">${escapeHtml(post.title)}</a></h2>
            <p class="blog-meta"><time datetime="${escapeHtml(post.date)}">${formatDate(post.date)}</time></p>
            ${renderMarkdown(post.excerpt || "")}
          </div>
        </article>`
      }
    )
    .join("");
}

// --- Projecten ---

function renderProjectList() {
  qs("#project-list").innerHTML = window.SITE_DATA.projects
    .map((project) => {
      const tags = (project.themes || []).map((theme) => `<span class="tag">${escapeHtml(theme)}</span>`).join("");
      const link = project.url
        ? `<p><a href="${escapeHtml(project.url)}" target="_blank" rel="noopener noreferrer">Project bekijken</a></p>`
        : "";
      const thumbStyle = project.image ? ` style="background-image: url('${escapeHtml(project.image)}')"` : "";
      return `
        <article class="project-card">
          <div class="project-thumb"${thumbStyle} aria-hidden="true"></div>
          <div>
            <p class="project-meta">${escapeHtml(project.status)}</p>
            <h2>${escapeHtml(project.title)}</h2>
            ${renderMarkdown(project.intro)}
            <div class="tag-list">${tags}</div>
            ${link}
          </div>
        </article>`;
    })
    .join("");
}

// --- Wie is Mark / CV ---

function renderProfile() {
  const cv = window.SITE_DATA.cv;
  qs("#profile-text").innerHTML = renderMarkdown(cv.persoon.profiel);
  qs("#skills-list").innerHTML = cv.skills.vakkennis.map((skill) => `<span class="tag">${escapeHtml(skill)}</span>`).join("");
  qs("#tools-list").innerHTML = cv.skills.tools.map((tool) => `<span class="tag">${escapeHtml(tool)}</span>`).join("");
}

function renderCv() {
  const cv = window.SITE_DATA.cv;

  qs("#cv-summary").innerHTML = `
    <span class="summary-pill">${escapeHtml(cv.persoon.rol)}</span>
    <span class="summary-pill">${escapeHtml(cv.persoon.woonplaats)}</span>
    <span class="summary-pill">20+ jaar ervaring</span>`;

  qs("#cv-list").innerHTML = cv.opdrachten
    .map((assignment) => {
      const taken = (assignment.taken || []).map((task) => `<li>${escapeHtml(task)}</li>`).join("");
      const resultaat = (assignment.resultaat || []).map((result) => `<li>${escapeHtml(result)}</li>`).join("");
      return `
        <article class="assignment-card">
          <p class="kicker">${escapeHtml(assignment.branche || "Opdracht")}</p>
          <h2>${escapeHtml(assignment.organisatie)}</h2>
          <p class="assignment-meta">${escapeHtml(assignment.periode)} · ${escapeHtml(assignment.functie)}</p>
          ${renderMarkdown(assignment.situatie)}
          <details>
            <summary>Taken en resultaat</summary>
            <h3>Taken en verantwoordelijkheden</h3>
            <ul class="clean-list">${taken}</ul>
            <h3>Resultaat</h3>
            <ul class="clean-list">${resultaat}</ul>
          </details>
        </article>`;
    })
    .join("");

  qs("#summary-experience").innerHTML = cv.samenvattendeErvaring
    .map((experience) => {
      const functie = experience.functie ? ` · ${escapeHtml(experience.functie)}` : "";
      return `
        <article>
          <h3>${escapeHtml(experience.organisatie)}${functie}</h3>
          <p class="assignment-meta">${escapeHtml(experience.periode)}</p>
          ${renderMarkdown(experience.samenvatting)}
        </article>`;
    })
    .join("");

  const certificeringen = (cv.certificeringen || [])
    .map((cert) => {
      const organisatie = cert.organisatie ? ` · ${escapeHtml(cert.organisatie)}` : "";
      return `<li>${escapeHtml(cert.jaar)} · ${escapeHtml(cert.naam)}${organisatie}</li>`;
    })
    .join("");

  const opleiding = (cv.opleiding || [])
    .map(
      (item) =>
        `<li>${escapeHtml(item.periode)} · ${escapeHtml(item.diploma)} ${escapeHtml(item.naam)} · ${escapeHtml(item.organisatie)}</li>`
    )
    .join("");

  qs("#education-certifications").innerHTML = `
    <h3>Certificeringen</h3>
    <ul class="clean-list">${certificeringen}</ul>
    <h3>Opleiding</h3>
    <ul class="clean-list">${opleiding}</ul>`;
}

// --- Contact ---

// Telefoonnummers en e-mailadressen staan omgekeerd in data.js, zodat ze niet
// als platte tekst in de bron staan voor eenvoudige scrapers.
function deobfuscate(reversedValue) {
  return reversedValue.split("").reverse().join("");
}

function renderContactEntry(phoneElementId, emailElementId, contactInfo) {
  const phoneElement = qs(`#${phoneElementId}`);
  const emailElement = qs(`#${emailElementId}`);

  if (phoneElement) {
    const tel = deobfuscate(contactInfo.telReversed);
    const display = deobfuscate(contactInfo.telDisplayReversed);
    phoneElement.innerHTML = `<span class="icon-svg icon-phone" aria-hidden="true"></span> <a href="tel:${escapeHtml(tel)}">${escapeHtml(display)}</a>`;
  }

  if (emailElement) {
    const email = deobfuscate(contactInfo.emailReversed);
    emailElement.innerHTML = `<span class="icon-svg icon-envelope" aria-hidden="true"></span> <a href="mailto:${escapeHtml(email)}">${escapeHtml(email)}</a>`;
  }
}

function renderContact() {
  const contact = window.SITE_DATA.contact;
  if (!contact) {
    return;
  }
  renderContactEntry("mark-phone", "mark-email", contact.mark);
  renderContactEntry("cavero-phone", "cavero-email", contact.cavero);
}

// --- Overig ---

function setupMobileMenu() {
  const toggleButton = qs(".menu-toggle");
  const nav = qs("#primary-nav");
  if (!toggleButton || !nav) {
    return;
  }
  toggleButton.addEventListener("click", () => {
    const isOpen = nav.classList.toggle("open");
    toggleButton.setAttribute("aria-expanded", String(isOpen));
  });
  qsa("a", nav).forEach((link) => {
    link.addEventListener("click", () => {
      nav.classList.remove("open");
      toggleButton.setAttribute("aria-expanded", "false");
    });
  });
}

function init() {
  setupMobileMenu();
  renderHomeBlogPosts();
  renderBlogOverview();
  renderProjectList();
  renderProfile();
  renderCv();
  renderContact();
  wireRoutes();
  setupBlogLinks();

  window.addEventListener("popstate", handleLocationChange);
  handleLocationChange();
}

document.addEventListener("DOMContentLoaded", init);
