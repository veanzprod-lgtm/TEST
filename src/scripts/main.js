const state = {
  site: null,
  menu: [],
  realisations: [],
  team: []
};

const LOGO_BRANDS = [
  'Arclight',
  'Novaform',
  'Helion',
  'Velvet',
  'Northwind',
  'Polar',
  'Kinetik',
  'Lumina',
  'Vanguard',
  'Everest',
  'Alpine',
  'Brava'
];

const CAROUSEL_SLIDES = [
  {
    src: 'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=1400&q=80',
    caption: 'Tournage à Lyon — Installation plateau publicitaire'
  },
  {
    src: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1400&q=80',
    caption: 'Post-production & étalonnage dans nos studios'
  },
  {
    src: 'https://images.unsplash.com/photo-1523580846011-d3a5bc25702b?auto=format&fit=crop&w=1400&q=80',
    caption: 'Équipe motion design en session d’animation'
  }
];

const pageId = document.documentElement.dataset.page;
let toastTimer = null;

async function init() {
  try {
    const [site, menu, realisations, team] = await Promise.all([
      fetchJSON('/data/site.json'),
      fetchJSON('/data/menu.json'),
      fetchJSON('/data/realisations.json'),
      fetchJSON('/data/team.json')
    ]);

    state.site = site;
    state.menu = menu;
    state.realisations = Array.isArray(realisations) ? realisations : [];
    state.team = Array.isArray(team) ? team : [];

    applySiteData();
    buildNavigation();
    initTheme();
    initMobileNavigation();
    initToast();
    initLightbox();
    initScrollAnimations();
    injectOrganizationSchema();
    initAnalytics();

    if (pageId === 'home') {
      renderLogoGrid();
      renderFeaturedProjects();
    }

    if (pageId === 'realisations') {
      renderPortfolio();
    }

    if (pageId === 'project') {
      renderProjectDetail();
    }

    if (pageId === 'la-meute') {
      renderTeam();
      renderCarousel();
    }

    if (pageId === 'contact') {
      renderOffices();
      initContactForm();
    }

    document.querySelectorAll('[data-current-year]').forEach(el => {
      el.textContent = new Date().getFullYear();
    });
  } catch (error) {
    console.error('Erreur lors du chargement des données', error);
  }
}

document.addEventListener('DOMContentLoaded', init);

async function fetchJSON(path) {
  const response = await fetch(path, { credentials: 'same-origin' });
  if (!response.ok) {
    throw new Error(`Impossible de charger ${path}`);
  }
  return response.json();
}

function applySiteData() {
  if (!state.site) return;
  const { name, baseline, email, phone, ctaLabel, social } = state.site;

  document.querySelectorAll('[data-site-brand]').forEach(el => {
    el.textContent = name;
  });
  document.querySelectorAll('[data-site-brand-mobile]').forEach(el => {
    el.textContent = name;
  });
  document.querySelectorAll('[data-site-brand-footer]').forEach(el => {
    el.textContent = name;
  });
  document.querySelectorAll('[data-site-baseline]').forEach(el => {
    el.textContent = baseline;
  });
  document.querySelectorAll('[data-site-email]').forEach(el => {
    el.href = `mailto:${email}`;
    el.textContent = email;
  });
  document.querySelectorAll('[data-site-phone]').forEach(el => {
    el.href = `tel:${phone.replace(/\s+/g, '')}`;
    el.textContent = phone;
  });
  document.querySelectorAll('a[href="/contact/"]').forEach(el => {
    if (ctaLabel) {
      el.textContent = ctaLabel;
    }
  });

  document.querySelectorAll('[data-social-links]').forEach(list => {
    list.innerHTML = '';
    social.forEach(item => {
      const li = document.createElement('li');
      const link = document.createElement('a');
      link.href = item.url;
      link.target = '_blank';
      link.rel = 'noopener';
      link.textContent = item.label;
      li.appendChild(link);
      list.appendChild(li);
    });
  });
}

function buildNavigation() {
  if (!state.menu.length) return;
  const navContainer = document.querySelector('[data-menu]');
  const mobileMenu = document.querySelector('[data-menu-mobile]');
  if (!navContainer || !mobileMenu) return;

  navContainer.innerHTML = '';
  mobileMenu.innerHTML = '';

  state.menu.forEach(item => {
    const li = document.createElement('li');
    const link = document.createElement('a');
    link.href = item.path;
    link.textContent = item.label;
    if (normalizePath(item.path) === normalizePath(window.location.pathname)) {
      li.classList.add('is-active');
    }
    li.appendChild(link);
    navContainer.appendChild(li);

    const mobileLi = li.cloneNode(true);
    mobileMenu.appendChild(mobileLi);
  });
}

function normalizePath(path) {
  return path.endsWith('/') ? path : `${path}/`;
}

function initMobileNavigation() {
  const toggle = document.querySelector('.nav-toggle');
  const drawer = document.querySelector('[data-mobile-drawer]');
  const closeBtn = document.querySelector('[data-drawer-close]');
  if (!toggle || !drawer || !closeBtn) return;

  const openDrawer = () => {
    drawer.classList.add('is-open');
    toggle.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
  };

  const closeDrawer = () => {
    drawer.classList.remove('is-open');
    toggle.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  };

  toggle.addEventListener('click', () => {
    if (drawer.classList.contains('is-open')) {
      closeDrawer();
    } else {
      openDrawer();
    }
  });

  closeBtn.addEventListener('click', closeDrawer);
  drawer.addEventListener('click', event => {
    if (event.target === drawer) {
      closeDrawer();
    }
  });

  drawer.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', closeDrawer);
  });
}

function initTheme() {
  const toggle = document.querySelector('[data-theme-toggle]');
  if (!toggle) return;
  const storedTheme = localStorage.getItem('loupiote-theme');
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const initialTheme = storedTheme || (prefersDark ? 'dark' : 'light');
  setTheme(initialTheme);

  toggle.addEventListener('click', () => {
    const nextTheme = document.body.dataset.theme === 'light' ? 'dark' : 'light';
    setTheme(nextTheme);
  });
}

function setTheme(theme) {
  document.body.dataset.theme = theme;
  const toggle = document.querySelector('[data-theme-toggle]');
  if (toggle) {
    toggle.setAttribute('aria-pressed', theme === 'dark');
  }
  localStorage.setItem('loupiote-theme', theme);
}

function renderLogoGrid() {
  const grid = document.querySelector('[data-logos]');
  if (!grid) return;
  grid.innerHTML = '';
  LOGO_BRANDS.forEach(name => {
    const tile = document.createElement('div');
    tile.className = 'logo-tile';
    tile.textContent = name;
    grid.appendChild(tile);
  });
}

function renderFeaturedProjects() {
  const container = document.querySelector('[data-featured-projects]');
  if (!container || !state.realisations.length) return;
  container.innerHTML = '';
  const projects = [...state.realisations]
    .sort((a, b) => b.year - a.year)
    .slice(0, 3);

  projects.forEach(project => {
    const card = createProjectCard(project);
    container.appendChild(card);
  });
}

function renderPortfolio() {
  const grid = document.querySelector('[data-project-grid]');
  if (!grid) return;
  grid.innerHTML = '';

  state.realisations.forEach(project => {
    const card = createProjectCard(project);
    card.dataset.category = project.category;
    grid.appendChild(card);
  });

  const filterButtons = document.querySelectorAll('.filter-btn');
  filterButtons.forEach(button => {
    button.addEventListener('click', () => {
      const filter = button.dataset.filter;
      filterButtons.forEach(btn => {
        btn.classList.toggle('is-active', btn === button);
        btn.setAttribute('aria-selected', btn === button);
      });
      grid.querySelectorAll('.project-card').forEach(card => {
        if (filter === 'all' || card.dataset.category === filter) {
          card.hidden = false;
        } else {
          card.hidden = true;
        }
      });
    });
  });
}

function createProjectCard(project) {
  const article = document.createElement('article');
  article.className = 'project-card';
  const link = document.createElement('a');
  link.href = `/realisations/${project.slug}/`;
  link.className = 'project-link';
  link.setAttribute('aria-label', `Voir le projet ${project.title}`);

  const cover = document.createElement('img');
  cover.src = project.cover;
  cover.alt = '';
  cover.loading = 'lazy';
  link.appendChild(cover);
  article.appendChild(link);

  const info = document.createElement('div');
  info.className = 'project-info';

  const category = document.createElement('span');
  category.className = 'tag';
  category.textContent = project.category;
  info.appendChild(category);

  const title = document.createElement('h3');
  title.textContent = project.title;
  info.appendChild(title);

  const summary = document.createElement('p');
  summary.textContent = project.summary;
  info.appendChild(summary);

  const meta = document.createElement('p');
  meta.className = 'project-meta-line';
  meta.textContent = `${project.year} • ${project.duration}`;
  info.appendChild(meta);

  const cta = document.createElement('a');
  cta.className = 'btn btn-secondary';
  cta.href = `/realisations/${project.slug}/`;
  cta.textContent = 'Voir le projet';
  info.appendChild(cta);

  article.appendChild(info);
  return article;
}

function renderProjectDetail() {
  const slug = document.documentElement.dataset.projectSlug;
  if (!slug) return;
  const project = state.realisations.find(item => item.slug === slug);
  if (!project) return;

  const titleEl = document.querySelector('[data-project-title]');
  const summaryEl = document.querySelector('[data-project-summary]');
  const categoryEl = document.querySelector('[data-project-category]');
  const yearEl = document.querySelector('[data-project-year]');
  const clientEl = document.querySelector('[data-project-client]');
  const durationEl = document.querySelector('[data-project-duration]');
  const contextEl = document.querySelector('[data-project-context]');
  const resultsList = document.querySelector('[data-project-results]');
  const creditsList = document.querySelector('[data-project-credits]');
  const deliverablesList = document.querySelector('[data-project-deliverables]');
  const gallery = document.querySelector('[data-gallery]');
  const iframe = document.querySelector('[data-video-container] iframe');

  if (titleEl) titleEl.textContent = project.title;
  if (summaryEl) summaryEl.textContent = project.summary;
  if (categoryEl) categoryEl.textContent = project.category;
  if (yearEl) yearEl.textContent = project.year;
  if (clientEl) clientEl.textContent = project.client;
  if (durationEl) durationEl.textContent = project.duration;
  if (contextEl) contextEl.textContent = project.context;
  if (iframe) iframe.src = project.videoUrl;

  fillList(resultsList, project.results);
  fillList(creditsList, project.credits);
  fillList(deliverablesList, project.deliverables);

  if (gallery) {
    gallery.innerHTML = '';
    project.images.forEach((src, index) => {
      const button = document.createElement('button');
      button.type = 'button';
      const img = document.createElement('img');
      img.src = src;
      img.alt = `${project.title} visuel ${index + 1}`;
      img.loading = 'lazy';
      button.appendChild(img);
      button.addEventListener('click', () => openLightbox(src, project.title));
      gallery.appendChild(button);
    });
  }

  updateProjectPagination(project);
}

function fillList(list, values) {
  if (!list || !Array.isArray(values)) return;
  list.innerHTML = '';
  values.forEach(value => {
    const li = document.createElement('li');
    li.textContent = value;
    list.appendChild(li);
  });
}

function updateProjectPagination(project) {
  const container = document.querySelector('[data-project-pagination]');
  if (!container) return;
  const index = state.realisations.findIndex(item => item.slug === project.slug);
  const prev = state.realisations[index - 1] || state.realisations[state.realisations.length - 1];
  const next = state.realisations[index + 1] || state.realisations[0];
  const prevLink = container.querySelector('[data-prev-project]');
  const nextLink = container.querySelector('[data-next-project]');
  if (prevLink) {
    prevLink.href = `/realisations/${prev.slug}/`;
    prevLink.textContent = `← ${prev.title}`;
  }
  if (nextLink) {
    nextLink.href = `/realisations/${next.slug}/`;
    nextLink.textContent = `${next.title} →`;
  }
}

function renderTeam() {
  const grid = document.querySelector('[data-team-grid]');
  if (!grid || !state.team.length) return;
  grid.innerHTML = '';
  state.team.forEach(member => {
    const card = document.createElement('article');
    card.className = 'team-card';
    const img = document.createElement('img');
    img.src = member.photo;
    img.alt = member.name;
    img.loading = 'lazy';
    const name = document.createElement('h3');
    name.textContent = member.name;
    const role = document.createElement('p');
    role.className = 'tag';
    role.textContent = member.role;
    const bio = document.createElement('p');
    bio.textContent = member.bio;
    card.append(img, name, role, bio);
    grid.appendChild(card);
  });
}

function renderCarousel() {
  const track = document.querySelector('[data-carousel-track]');
  const prevBtn = document.querySelector('[data-carousel-prev]');
  const nextBtn = document.querySelector('[data-carousel-next]');
  if (!track || !prevBtn || !nextBtn) return;
  track.innerHTML = '';
  CAROUSEL_SLIDES.forEach(slide => {
    const item = document.createElement('div');
    item.className = 'carousel-slide';
    const img = document.createElement('img');
    img.src = slide.src;
    img.alt = slide.caption;
    img.loading = 'lazy';
    const caption = document.createElement('div');
    caption.className = 'carousel-caption';
    caption.textContent = slide.caption;
    item.append(img, caption);
    track.appendChild(item);
  });

  let index = 0;
  const update = () => {
    track.style.transform = `translateX(-${index * 100}%)`;
  };

  prevBtn.addEventListener('click', () => {
    index = index === 0 ? CAROUSEL_SLIDES.length - 1 : index - 1;
    update();
  });

  nextBtn.addEventListener('click', () => {
    index = index === CAROUSEL_SLIDES.length - 1 ? 0 : index + 1;
    update();
  });
}

function renderOffices() {
  const grid = document.querySelector('[data-office-grid]');
  if (!grid || !state.site) return;
  grid.innerHTML = '';
  state.site.offices.forEach(office => {
    const card = document.createElement('article');
    card.className = 'office-card';
    const city = document.createElement('h3');
    city.textContent = office.city;
    const address = document.createElement('p');
    address.textContent = office.address;
    const phone = document.createElement('a');
    phone.href = `tel:${office.phone.replace(/\s+/g, '')}`;
    phone.textContent = office.phone;
    const email = document.createElement('a');
    email.href = `mailto:${office.email}`;
    email.textContent = office.email;
    const hours = document.createElement('p');
    hours.textContent = office.hours;
    card.append(city, address, phone, email, hours);
    grid.appendChild(card);
  });
}

function initContactForm() {
  const form = document.querySelector('[data-contact-form]');
  if (!form) return;
  form.addEventListener('submit', event => {
    event.preventDefault();
    const formData = new FormData(form);
    let hasError = false;

    const fields = [
      { id: 'name', required: true },
      { id: 'email', required: true, type: 'email' },
      { id: 'budget', required: true },
      { id: 'message', required: true },
      { id: 'consent', required: true, type: 'checkbox' }
    ];

    fields.forEach(field => {
      const input = form.querySelector(`#${field.id}`);
      const error = form.querySelector(`#error-${field.id}`);
      if (!input || !error) return;
      let valid = true;
      if (field.type === 'checkbox') {
        valid = input.checked;
      } else if (field.type === 'email') {
        valid = Boolean(formData.get(field.id)) && /.+@.+\..+/.test(formData.get(field.id));
      } else if (field.required) {
        valid = Boolean(formData.get(field.id));
      }
      input.setAttribute('aria-invalid', !valid);
      error.hidden = valid;
      if (!valid) {
        hasError = true;
      }
    });

    if (!hasError) {
      form.reset();
      showToast('Merci ! Votre message a bien été envoyé.');
    }
  });
}

let toastElement = null;

function initToast() {
  toastElement = document.querySelector('[data-toast]');
  if (!toastElement) return;
  const closeBtn = toastElement.querySelector('[data-toast-close]');
  if (closeBtn) {
    closeBtn.addEventListener('click', hideToast);
  }
}

function showToast(message) {
  if (!toastElement) return;
  const text = toastElement.querySelector('[data-toast-message]');
  text.textContent = message;
  toastElement.hidden = false;
  toastElement.focus?.();
  clearTimeout(toastTimer);
  toastTimer = setTimeout(hideToast, 4000);
}

function hideToast() {
  if (!toastElement) return;
  toastElement.hidden = true;
  clearTimeout(toastTimer);
}

let lightboxEl = null;

function initLightbox() {
  lightboxEl = document.createElement('div');
  lightboxEl.className = 'lightbox';
  lightboxEl.setAttribute('role', 'dialog');
  lightboxEl.setAttribute('aria-modal', 'true');
  lightboxEl.innerHTML = `
    <button type="button" aria-label="Fermer la galerie">×</button>
    <figure>
      <img alt="" />
      <figcaption></figcaption>
    </figure>
  `;
  lightboxEl.querySelector('button').addEventListener('click', closeLightbox);
  lightboxEl.addEventListener('click', event => {
    if (event.target === lightboxEl) {
      closeLightbox();
    }
  });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && lightboxEl.classList.contains('is-open')) {
      closeLightbox();
    }
  });
  document.body.appendChild(lightboxEl);
}

function openLightbox(src, caption) {
  if (!lightboxEl) return;
  const img = lightboxEl.querySelector('img');
  const figcaption = lightboxEl.querySelector('figcaption');
  img.src = src;
  figcaption.textContent = caption;
  lightboxEl.classList.add('is-open');
  lightboxEl.querySelector('button').focus();
  document.body.style.overflow = 'hidden';
}

function closeLightbox() {
  if (!lightboxEl) return;
  lightboxEl.classList.remove('is-open');
  document.body.style.overflow = '';
}

function initScrollAnimations() {
  const elements = document.querySelectorAll('[data-animate]');
  if (!elements.length) return;
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });

  elements.forEach(el => observer.observe(el));
}

function injectOrganizationSchema() {
  if (!state.site) return;
  const script = document.querySelector('#organization-schema');
  if (!script) return;
  const organization = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: state.site.name,
    url: state.site.organization?.url,
    logo: state.site.organization?.logo,
    sameAs: state.site.organization?.sameAs,
    contactPoint: [
      {
        '@type': 'ContactPoint',
        contactType: 'customer support',
        email: state.site.email,
        telephone: state.site.phone
      }
    ],
    department: state.site.offices.map(office => ({
      '@type': 'LocalBusiness',
      name: `${state.site.name} ${office.city}`,
      address: office.address,
      telephone: office.phone,
      email: office.email
    }))
  };
  script.textContent = JSON.stringify(organization, null, 2);
}

function initAnalytics() {
  if (!state.site?.analytics?.plausible) return;
  const script = document.createElement('script');
  script.defer = true;
  script.dataset.domain = 'loupiote-studio.com';
  script.src = state.site.analytics.plausible;
  document.head.appendChild(script);
}
