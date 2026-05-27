import { calculators } from './calculators.js';
import { renderCalculator } from './engine.js';

// --- State Management ---
let activeCategory = 'all';
let searchQuery = '';
let bookmarks = [];

// Local Default Currency is Indian Rupee (₹)
let activeCurrency = localStorage.getItem('scalecalc_currency') || '₹';

// Expose currency globally so engine.js reads it instantly
window.activeCurrencySymbol = activeCurrency;

// Load bookmarks from localstorage
try {
  const saved = localStorage.getItem('scalecalc_bookmarks');
  if (saved) {
    bookmarks = JSON.parse(saved);
  }
} catch (e) {
  bookmarks = [];
}

// --- DOM References ---
const dashboardView = document.getElementById('dashboard-view');
const calculatorViewport = document.getElementById('calculator-viewport');
const searchInput = document.getElementById('search-calculators');
const categoryTabs = document.querySelectorAll('.category-tab');

// Headers & Auth Nodes
const currencySelector = document.getElementById('header-currency-selector');
const loginTrigger = document.getElementById('btn-login-trigger');
const profileMenu = document.getElementById('user-profile-menu');
const avatarInitials = document.getElementById('user-avatar-initials');
const displayName = document.getElementById('user-display-name');

// Modals
const loginModal = document.getElementById('login-modal-overlay');
const loginForm = document.getElementById('login-form');
const loginClose = document.getElementById('btn-login-close');

const legalModal = document.getElementById('legal-modal-overlay');
const legalBody = document.getElementById('legal-modal-body');
const legalTitle = document.getElementById('legal-modal-title');
const legalClose = document.getElementById('btn-legal-close');

// --- Initialization ---
function init() {
  // Setup Theme Switcher
  const themeToggleBtn = document.getElementById('btn-theme-toggle');
  const savedTheme = localStorage.getItem('scalecalc_theme') || 'dark';
  
  if (savedTheme === 'light') {
    document.body.classList.add('light-theme');
    if (themeToggleBtn) themeToggleBtn.textContent = '☀️';
  } else {
    document.body.classList.remove('light-theme');
    if (themeToggleBtn) themeToggleBtn.textContent = '🌙';
  }

  if (themeToggleBtn) {
    themeToggleBtn.addEventListener('click', () => {
      const isLight = document.body.classList.toggle('light-theme');
      localStorage.setItem('scalecalc_theme', isLight ? 'light' : 'dark');
      themeToggleBtn.textContent = isLight ? '☀️' : '🌙';
      
      themeToggleBtn.style.transform = 'scale(0.9)';
      setTimeout(() => {
        themeToggleBtn.style.transform = '';
      }, 150);
    });
  }

  // Setup Currency Selection & Visual Toast Feedback
  if (currencySelector) {
    currencySelector.value = activeCurrency;
    currencySelector.addEventListener('change', (e) => {
      activeCurrency = e.target.value;
      window.activeCurrencySymbol = activeCurrency;
      localStorage.setItem('scalecalc_currency', activeCurrency);
      
      // 1. Soft green glow on selector to highlight change
      currencySelector.style.borderColor = 'var(--accent-emerald)';
      currencySelector.style.boxShadow = '0 0 10px rgba(16, 185, 129, 0.4)';
      setTimeout(() => {
        currencySelector.style.borderColor = '';
        currencySelector.style.boxShadow = '';
      }, 800);

      // 2. Spawn a beautiful floating toast indicator
      const selectedText = currencySelector.options[currencySelector.selectedIndex].text;
      showCurrencyToast(`Currency switched to ${selectedText}`);

      // 3. Trigger recalculations if inside active calculator view
      const hash = window.location.hash || '#/';
      if (hash !== '#/' && hash !== '#') {
        router();
      }
      renderDashboard();
    });
  }

  // Setup Dynamic Scroll Background Morphing & Glowing Parallax Blobs
  const wrap1 = document.querySelector('.wrapper-1');
  const wrap2 = document.querySelector('.wrapper-2');
  const wrap3 = document.querySelector('.wrapper-3');

  window.addEventListener('scroll', () => {
    const scrollY = window.scrollY;

    // Ultra-smooth hardware-accelerated parallax translation
    if (wrap1) wrap1.style.transform = `translate3d(${scrollY * 0.08}px, ${scrollY * 0.06}px, 0)`;
    if (wrap2) wrap2.style.transform = `translate3d(${-scrollY * 0.06}px, ${-scrollY * 0.08}px, 0)`;
    if (wrap3) wrap3.style.transform = `translate3d(${scrollY * 0.04}px, ${-scrollY * 0.04}px, 0)`;

    const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
    if (maxScroll <= 0) return;
    const scrollPercent = scrollY / maxScroll;

    // Shift radial gradient stops from deep blue-slate to indigo-violet and forest green
    const h1 = Math.round(222 - scrollPercent * 40); // 222 (midnight slate) -> 182 (teal/ocean)
    const h2 = Math.round(160 + scrollPercent * 100); // 160 (emerald) -> 260 (purple/indigo)
    
    document.body.style.backgroundImage = `
      radial-gradient(at 0% 0%, hsla(${h1}, 47%, 9%, 1) 0px, transparent 60%),
      radial-gradient(at 100% 100%, hsla(${h2}, 72%, 7%, 1) 0px, transparent 60%)
    `;
  });

  // Setup Auth Events
  if (loginTrigger) {
    loginTrigger.addEventListener('click', () => {
      loginModal.classList.add('active');
    });
  }
  if (loginClose) {
    loginClose.addEventListener('click', () => {
      loginModal.classList.remove('active');
    });
  }
  if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const usernameInput = document.getElementById('login-email').value || 'User';
      localStorage.setItem('scalecalc_user', usernameInput);
      loginModal.classList.remove('active');
      updateAuthUI();
    });
  }
  if (profileMenu) {
    profileMenu.addEventListener('click', () => {
      if (confirm('Do you want to sign out?')) {
        localStorage.removeItem('scalecalc_user');
        updateAuthUI();
      }
    });
  }

  // Setup Legal Footers Events
  const aboutBtn = document.getElementById('footer-btn-about');
  const privacyBtn = document.getElementById('footer-btn-privacy');
  const termsBtn = document.getElementById('footer-btn-terms');

  if (aboutBtn) aboutBtn.addEventListener('click', () => showLegalModal('about'));
  if (privacyBtn) privacyBtn.addEventListener('click', () => showLegalModal('privacy'));
  if (termsBtn) termsBtn.addEventListener('click', () => showLegalModal('terms'));
  if (legalClose) {
    legalClose.addEventListener('click', () => {
      legalModal.classList.remove('active');
    });
  }

  // Bind Header Brand Logo navigation click
  const logo = document.querySelector('.brand-container');
  if (logo) {
    logo.addEventListener('click', () => {
      window.location.hash = '#/';
    });
  }

  // Bind Navigation buttons
  const navDashboard = document.getElementById('nav-dashboard');
  if (navDashboard) {
    navDashboard.addEventListener('click', () => {
      window.location.hash = '#/';
    });
  }

  // Bind Search events
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      searchQuery = e.target.value.toLowerCase();
      renderDashboard();
    });
  }

  // Bind Category tabs events
  categoryTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      categoryTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      activeCategory = tab.dataset.category;
      renderDashboard();
    });
  });

  // Setup Routing Listeners
  window.addEventListener('hashchange', router);
  window.addEventListener('DOMContentLoaded', () => {
    updateAuthUI();
    router();
  });
}

// --- Floating Currency Toast Handler ---
function showCurrencyToast(message) {
  const existing = document.getElementById('currency-toast-alert');
  if (existing) existing.remove();

  const toast = document.createElement('div');
  toast.id = 'currency-toast-alert';
  
  // Custom HSL Glassmorphic styles
  toast.style.cssText = `
    position: fixed;
    top: 2rem;
    right: 2rem;
    background: rgba(19, 26, 42, 0.85);
    border: 1px solid var(--accent-emerald);
    border-radius: 12px;
    padding: 0.85rem 1.5rem;
    backdrop-filter: blur(16px);
    box-shadow: var(--shadow-lg), 0 0 20px rgba(16, 185, 129, 0.25);
    color: var(--text-primary);
    font-size: 0.9rem;
    font-weight: 600;
    z-index: 2000;
    display: flex;
    align-items: center;
    gap: 0.75rem;
    transform: translateX(50px);
    opacity: 0;
    transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
    font-family: 'Inter', sans-serif;
  `;

  // Pulse bullet indicator
  toast.innerHTML = `
    <span style="width: 8px; height: 8px; background: var(--accent-emerald); border-radius: 50%; display: inline-block; box-shadow: 0 0 8px var(--accent-emerald);"></span>
    <span>${message}</span>
  `;

  document.body.appendChild(toast);

  // Animate in
  requestAnimationFrame(() => {
    toast.style.transform = 'translateX(0)';
    toast.style.opacity = '1';
  });

  // Fade out and remove
  setTimeout(() => {
    toast.style.transform = 'translateY(-10px)';
    toast.style.opacity = '0';
    setTimeout(() => toast.remove(), 400);
  }, 2500);
}

// --- Browser Routing Orchestrator ---
function router() {
  const hash = window.location.hash || '#/';
  
  if (hash === '#/' || hash === '#') {
    dashboardView.style.display = 'block';
    calculatorViewport.style.display = 'none';
    
    if (searchInput) {
      searchInput.value = '';
      searchQuery = '';
    }
    
    renderDashboard();
    updateSEOMetadata('ScaleCalc | Premium Lifetime Suite', 'Access a collection of beautiful, ultra-fast client-side financial, health, and mathematical calculators. Zero fees, zero installation.');
  } else {
    const calcId = hash.replace('#/', '');
    const calc = calculators[calcId];

    if (calc) {
      dashboardView.style.display = 'none';
      calculatorViewport.style.display = 'block';
      
      renderCalculator(calc, calculatorViewport);
      
      const backBtn = document.getElementById('btn-back-dashboard');
      if (backBtn) {
        backBtn.addEventListener('click', () => {
          window.location.hash = '#/';
        });
      }

      updateSEOMetadata(calc.seoTitle || calc.title, calc.seoMeta || calc.description);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      window.location.hash = '#/';
    }
  }
}

// --- Dynamic SEO Meta Injector ---
function updateSEOMetadata(title, description) {
  document.title = title;
  
  const metaDesc = document.querySelector('meta[name="description"]');
  if (metaDesc) {
    metaDesc.setAttribute('content', description);
  }

  // Open Graph
  const ogTitle = document.querySelector('meta[property="og:title"]');
  if (ogTitle) ogTitle.setAttribute('content', title);

  const ogDesc = document.querySelector('meta[property="og:description"]');
  if (ogDesc) ogDesc.setAttribute('content', description);
}

// --- Auth UI Controller ---
function updateAuthUI() {
  const user = localStorage.getItem('scalecalc_user');
  if (user) {
    loginTrigger.style.display = 'none';
    profileMenu.style.display = 'flex';
    displayName.textContent = user;
    avatarInitials.textContent = user.charAt(0).toUpperCase();
  } else {
    loginTrigger.style.display = 'block';
    profileMenu.style.display = 'none';
  }
}

// --- Legal Modal Router ---
function showLegalModal(type) {
  legalModal.classList.add('active');

  if (type === 'about') {
    legalTitle.textContent = 'About ScaleCalc';
    legalBody.innerHTML = `
      <h3>ScaleCalc Mission</h3>
      <p>ScaleCalc is a premium collection of offline-first tools designed to deliver robust financial, mathematical, and health evaluations without any ongoing subscription costs or third-party server overheads.</p>
      <h3>Serverless Architecture</h3>
      <p>By executing calculations natively inside your browser, the platform achieves instant sub-100ms response times. We use standard math models to calculate everything locally, guaranteeing zero data collection.</p>
      <h3>Premium Aesthetics</h3>
      <p>We believe utility tools deserve elegant designs. ScaleCalc uses modern glassmorphism backdrops, fluid custom sliders, and vector line drawings to deliver a state-of-the-art interactive workspace.</p>
    `;
  } else if (type === 'privacy') {
    legalTitle.textContent = 'Privacy Policy';
    legalBody.innerHTML = `
      <h3>100% Client-Side Processing</h3>
      <p>Your privacy is absolute. All mathematical inputs, slider actions, and tax details are processed entirely in your computer's browser memory.</p>
      <h3>Zero Tracking, Zero Cookies</h3>
      <p>We do not operate servers that log transactions, and we do not track your location or store persistent tracking cookies. Your bookmarks and favorites are stored purely on your own device using browser <code>localStorage</code>.</p>
      <h3>Third-Party API Integrity</h3>
      <p>We do not connect to Gemini, OpenAI, or external AI APIs for calculator operations, protecting your sensitive inputs from advertising networks.</p>
    `;
  } else if (type === 'terms') {
    legalTitle.textContent = 'Terms of Use';
    legalBody.innerHTML = `
      <h3>Acceptance of Terms</h3>
      <p>By using the ScaleCalc platform, you agree to access its tools as provided on an "as-is" basis for simple estimation and mathematical projection purposes.</p>
      <h3>No Professional Advice</h3>
      <p>Calculations provided (such as income tax brackets, BMR statistics, and mortgage interests) are indicators only and should not represent formal financial, legal, or medical advice.</p>
      <h3>Lifetime Sustainable License</h3>
      <p>ScaleCalc is free to distribute and modify. The local formula engine is constructed to operate indefinitely without any licensing restrictions or recurring execution fees.</p>
    `;
  }
}

// --- Bookmark Toggle Manager ---
function toggleBookmark(id, event) {
  event.stopPropagation();
  
  const idx = bookmarks.indexOf(id);
  if (idx === -1) {
    bookmarks.push(id);
  } else {
    bookmarks.splice(idx, 1);
  }

  try {
    localStorage.setItem('scalecalc_bookmarks', JSON.stringify(bookmarks));
  } catch (e) {}

  const heartBtn = document.querySelector(`.bookmark-btn[data-calc-id="${id}"]`);
  if (heartBtn) {
    heartBtn.classList.toggle('active');
    heartBtn.innerHTML = bookmarks.includes(id) 
      ? '<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>'
      : '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>';
  }

  renderDashboard();
}

// --- Card HTML Generator ---
function createCardHtml(calc) {
  const isBookmarked = bookmarks.includes(calc.id);
  const heartIcon = isBookmarked 
    ? '<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>'
    : '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>';

  const isPopular = calc.popular;
  const popularClass = isPopular ? 'popular' : '';
  const popularBadge = isPopular ? '<span class="popular-badge">Popular</span>' : '';

  return `
    <div class="calc-card ${popularClass}" data-color="${calc.color}" data-calc-id="${calc.id}">
      <div class="card-top">
        <div class="card-icon">${calc.icon}</div>
        <div style="display: flex; align-items: center; gap: 0.5rem;">
          ${popularBadge}
          <button class="bookmark-btn ${isBookmarked ? 'active' : ''}" data-calc-id="${calc.id}" title="Bookmark Calculator">
            ${heartIcon}
          </button>
        </div>
      </div>
      <div>
        <h3 class="card-title">${calc.title}</h3>
        <p class="card-description">${calc.description}</p>
      </div>
      <div class="card-footer">
        <span class="card-category">${calc.category}</span>
        <span class="card-action-text">Launch &rarr;</span>
      </div>
    </div>
  `;
}

// --- Dashboard Layout Renderer ---
function renderDashboard() {
  const grid = document.getElementById('calculators-catalog-grid');
  if (!grid) return;

  const list = Object.values(calculators);

  // Apply filters in pipeline
  const filtered = list.filter(calc => {
    if (activeCategory === 'bookmarks') {
      if (!bookmarks.includes(calc.id)) return false;
    } else if (activeCategory !== 'all') {
      if (calc.category !== activeCategory) return false;
    }

    if (searchQuery !== '') {
      const matchTitle = calc.title.toLowerCase().includes(searchQuery);
      const matchDesc = calc.description.toLowerCase().includes(searchQuery);
      const matchCat = calc.category.toLowerCase().includes(searchQuery);
      return matchTitle || matchDesc || matchCat;
    }

    return true;
  });

  // Empty State Render
  if (filtered.length === 0) {
    grid.innerHTML = `
      <div style="grid-column: 1 / -1; text-align: center; padding: 4rem 1rem; color: var(--text-muted);">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="margin-bottom: 1rem; opacity: 0.5;"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
        <h3 style="font-family: 'Outfit'; font-size: 1.25rem; font-weight: 600; color: var(--text-primary); margin-bottom: 0.25rem;">No Calculators Found</h3>
        <p style="font-size: 0.9rem;">Try matching different search terms or categories.</p>
      </div>
    `;
    return;
  }

  // --- Dynamic Dashboard Segmentation ---
  // If activeCategory is 'all' AND user is not searching, render segmented sections
  if (activeCategory === 'all' && searchQuery === '') {
    // 1. Favorites/Bookmarks Section (bubbled to the absolute top of the page!)
    const favoriteList = filtered.filter(c => bookmarks.includes(c.id));
    
    // 2. Popular Group (excluding favorited ones to avoid duplicate DOM elements)
    const popularList = filtered.filter(c => c.popular && !bookmarks.includes(c.id));
    
    // 3. More/Others Group (remaining non-popular calculators)
    const othersList = filtered.filter(c => !c.popular && !bookmarks.includes(c.id));

    let html = '';

    // A. Render Favorites Section
    if (favoriteList.length > 0) {
      html += `
        <h2 style="grid-column: 1 / -1; font-family: 'Outfit', sans-serif; font-size: 1.5rem; font-weight: 700; margin: 0.5rem 0 0.25rem; color: var(--text-primary); display: flex; align-items: center; gap: 0.5rem;"><span style="color: var(--accent-pink);">❤️</span> Your Favorites</h2>
        ${favoriteList.map(calc => createCardHtml(calc)).join('')}
      `;
    }

    // B. Render Popular Section
    html += `
      <h2 style="grid-column: 1 / -1; font-family: 'Outfit', sans-serif; font-size: 1.5rem; font-weight: 700; margin: 1.5rem 0 0.25rem; color: var(--text-primary); display: flex; align-items: center; gap: 0.5rem;"><span style="color: var(--accent-indigo);">🔥</span> Popular Calculators</h2>
      ${popularList.map(calc => createCardHtml(calc)).join('')}
    `;

    // C. Render Categorized Others Sections (rearranging Remaining Tools into 5 detailed sub-sections)
    if (othersList.length > 0) {
      // Categories split
      const financeList = othersList.filter(c => c.category === 'finance');
      const healthList = othersList.filter(c => c.category === 'health');
      const mathList = othersList.filter(c => c.category === 'utility' && !['subnet', 'password', 'converter'].includes(c.id) && !['age', 'date_calc', 'time_calc', 'hours_calc', 'gpa_calc', 'grade_calc', 'concrete'].includes(c.id));
      const everydayList = othersList.filter(c => ['age', 'date_calc', 'time_calc', 'hours_calc', 'gpa_calc', 'grade_calc', 'concrete'].includes(c.id));
      const developerList = othersList.filter(c => ['subnet', 'password', 'converter'].includes(c.id));

      if (financeList.length > 0) {
        html += `
          <h2 style="grid-column: 1 / -1; font-family: 'Outfit', sans-serif; font-size: 1.35rem; font-weight: 700; margin: 2rem 0 0.25rem; color: var(--text-primary); display: flex; align-items: center; gap: 0.5rem; border-left: 4px solid var(--accent-indigo); padding-left: 0.5rem;">Finance & Tax Tools 📈</h2>
          ${financeList.map(calc => createCardHtml(calc)).join('')}
        `;
      }

      if (healthList.length > 0) {
        html += `
          <h2 style="grid-column: 1 / -1; font-family: 'Outfit', sans-serif; font-size: 1.35rem; font-weight: 700; margin: 2rem 0 0.25rem; color: var(--text-primary); display: flex; align-items: center; gap: 0.5rem; border-left: 4px solid var(--accent-pink); padding-left: 0.5rem;">Health & Fitness Tools 🏃</h2>
          ${healthList.map(calc => createCardHtml(calc)).join('')}
        `;
      }

      if (mathList.length > 0) {
        html += `
          <h2 style="grid-column: 1 / -1; font-family: 'Outfit', sans-serif; font-size: 1.35rem; font-weight: 700; margin: 2rem 0 0.25rem; color: var(--text-primary); display: flex; align-items: center; gap: 0.5rem; border-left: 4px solid var(--accent-indigo); padding-left: 0.5rem;">Utility & Math Tools 🧮</h2>
          ${mathList.map(calc => createCardHtml(calc)).join('')}
        `;
      }

      if (everydayList.length > 0) {
        html += `
          <h2 style="grid-column: 1 / -1; font-family: 'Outfit', sans-serif; font-size: 1.35rem; font-weight: 700; margin: 2rem 0 0.25rem; color: var(--text-primary); display: flex; align-items: center; gap: 0.5rem; border-left: 4px solid var(--accent-amber); padding-left: 0.5rem;">Everyday & School Tools 🎓</h2>
          ${everydayList.map(calc => createCardHtml(calc)).join('')}
        `;
      }

      if (developerList.length > 0) {
        html += `
          <h2 style="grid-column: 1 / -1; font-family: 'Outfit', sans-serif; font-size: 1.35rem; font-weight: 700; margin: 2rem 0 0.25rem; color: var(--text-primary); display: flex; align-items: center; gap: 0.5rem; border-left: 4px solid var(--accent-emerald); padding-left: 0.5rem;">Developer & IT Tools 🌐</h2>
          ${developerList.map(calc => createCardHtml(calc)).join('')}
        `;
      }
    }

    grid.innerHTML = html;
  } else {
    // Single Flat sorted listing for category tabs and search queries
    const sortedFlat = [...filtered].sort((a, b) => {
      const aFav = bookmarks.includes(a.id) ? 1 : 0;
      const bFav = bookmarks.includes(b.id) ? 1 : 0;
      if (aFav !== bFav) return bFav - aFav;

      const aPop = a.popular ? 1 : 0;
      const bPop = b.popular ? 1 : 0;
      return bPop - aPop;
    });

    let headingText = activeCategory === 'bookmarks' ? 'Your Bookmarked Tools' : `${activeCategory.charAt(0).toUpperCase() + activeCategory.slice(1)} Suite`;
    if (searchQuery !== '') headingText = 'Search Results';

    grid.innerHTML = `
      <h2 style="grid-column: 1 / -1; font-family: 'Outfit', sans-serif; font-size: 1.45rem; font-weight: 700; margin-bottom: 0.5rem; color: var(--text-primary); border-left: 4px solid var(--accent-indigo); padding-left: 0.75rem;">${headingText} (${sortedFlat.length})</h2>
      ${sortedFlat.map(calc => createCardHtml(calc)).join('')}
    `;
  }

  // Attach card click handlers
  const cards = grid.querySelectorAll('.calc-card');
  cards.forEach(card => {
    card.addEventListener('click', () => {
      const calcId = card.dataset.calcId;
      window.location.hash = `#/${calcId}`;
    });
  });

  // Attach bookmark events
  const heartButtons = grid.querySelectorAll('.bookmark-btn');
  heartButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      const calcId = btn.dataset.calcId;
      toggleBookmark(calcId, e);
    });
  });
}

// Start the orchestrator logic
init();
