let currentLang = 'fr';

function setLanguage(lang) {
  currentLang = lang;
  document.documentElement.lang = lang;
  
  if (lang === 'ar') {
    document.body.classList.add('rtl');
    document.body.setAttribute('dir', 'rtl');
  } else {
    document.body.classList.remove('rtl');
    document.body.setAttribute('dir', 'ltr');
  }
  
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    if (translations[lang] && translations[lang][key]) {
      el.textContent = translations[lang][key];
    }
  });

  document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
    const key = el.getAttribute('data-i18n-placeholder');
    if (translations[lang] && translations[lang][key]) {
      el.placeholder = translations[lang][key];
    }
  });

  // Highlight active lang button
  document.querySelectorAll('.lang-btn').forEach(btn => {
    if (btn.dataset.lang === lang) btn.classList.add('active');
    else btn.classList.remove('active');
  });

  // If project details modal is open, refresh its content
  if (window.currentOpenProject) {
    populateProjectModal(window.currentOpenProject);
  }
}

let currentOpenProject = null;

function populateProjectModal(projectId) {
  const data = translations[currentLang].projects_data[projectId];
  if(!data) return;
  
  document.getElementById('detailTitle').textContent = data.title;
  document.getElementById('detailCommune').textContent = data.loc;
  document.getElementById('detailFloors').textContent = data.floors;
  document.getElementById('detailApts').textContent = data.apts;
  document.getElementById('detailDelivery').textContent = data.delivery;
  document.getElementById('detailDesc').textContent = data.desc;
  
  const amenitiesContainer = document.getElementById('detailAmenities');
  amenitiesContainer.innerHTML = '';
  data.amenities.forEach(am => {
    const li = document.createElement('li');
    li.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--c-gold)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: middle; margin-right: 8px;"><polyline points="20 6 9 17 4 12"></polyline></svg> ${am}`;
    amenitiesContainer.appendChild(li);
  });
}

document.addEventListener('DOMContentLoaded', () => {
  setLanguage(currentLang);
  
  // Navbar scroll effect
  const navbar = document.querySelector('.navbar');
  window.addEventListener('scroll', () => {
    if(window.scrollY > 50) navbar.classList.add('scrolled');
    else navbar.classList.remove('scrolled');
  });

  // Language switcher listeners
  document.querySelectorAll('.lang-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      setLanguage(e.target.dataset.lang);
    });
  });

  // Simple animation for numbers
  const animateValue = (obj, start, end, duration) => {
    let startTimestamp = null;
    const step = (timestamp) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      obj.innerHTML = Math.floor(progress * (end - start) + start);
      if (progress < 1) {
        window.requestAnimationFrame(step);
      }
    };
    window.requestAnimationFrame(step);
  };

  const statNumbers = document.querySelectorAll('.stat-number');
  
  const statsObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        statNumbers.forEach(num => {
          const target = parseInt(num.getAttribute('data-target'));
          animateValue(num, 0, target, 2000);
        });
        observer.disconnect();
      }
    });
  }, { threshold: 0.5 });

  const statsSection = document.querySelector('.stats');
  if (statsSection) {
    statsObserver.observe(statsSection);
  }

  // Modal logic
  const contactModal = document.getElementById('contactModal');
  const closeContactModal = document.getElementById('closeContactModal');
  const openContactModal = document.getElementById('openContactModal');
  const navContactLink = document.getElementById('navContactLink');

  function openModal(e) {
    e.preventDefault();
    contactModal.classList.add('active');
  }

  function closeModal() {
    contactModal.classList.remove('active');
  }

  if(openContactModal) openContactModal.addEventListener('click', openModal);
  if(navContactLink) navContactLink.addEventListener('click', openModal);
  if(closeContactModal) closeContactModal.addEventListener('click', closeModal);
  
  if(contactModal) {
    contactModal.addEventListener('click', (e) => {
      if(e.target === contactModal) closeModal();
    });
  }

  // Projects Filter Logic
  const filterBtns = document.querySelectorAll('.filter-btn');
  const projectCards = document.querySelectorAll('#projectsGrid .project-card');

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      // Remove active class
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const filterValue = btn.getAttribute('data-filter');

      projectCards.forEach(card => {
        if (filterValue === 'all' || card.getAttribute('data-location') === filterValue || card.getAttribute('data-location') === filterValue.replace('é','e')) {
          card.style.display = 'block';
          // simple fade-in animation
          card.style.opacity = '0';
          setTimeout(() => card.style.opacity = '1', 50);
        } else {
          card.style.display = 'none';
        }
      });
    });
  });

  // Project Details Modal Logic
  const projectDetailsModal = document.getElementById('projectDetailsModal');
  const closeProjectDetailsModal = document.getElementById('closeProjectDetailsModal');
  const btnContactProject = document.getElementById('btnContactProject');

  document.querySelectorAll('.project-card').forEach(card => {
    card.addEventListener('click', (e) => {
      // Don't trigger if clicked on "Voir les plans" button
      if (e.target.closest('.btn-plan')) return;
      
      const projectId = card.getAttribute('data-project-id');
      if (projectId) {
        window.currentOpenProject = projectId;
        populateProjectModal(projectId);
        
        // Get image from card
        const imgSrc = card.querySelector('img').src;
        document.getElementById('detailImage').src = imgSrc;
        
        projectDetailsModal.classList.add('active');
      }
    });
  });

  if (closeProjectDetailsModal) {
    closeProjectDetailsModal.addEventListener('click', () => {
      projectDetailsModal.classList.remove('active');
      window.currentOpenProject = null;
    });
  }

  if (projectDetailsModal) {
    projectDetailsModal.addEventListener('click', (e) => {
      if (e.target === projectDetailsModal) {
        projectDetailsModal.classList.remove('active');
        window.currentOpenProject = null;
      }
    });
  }

  // "Être contacté" button logic
  if (btnContactProject) {
    btnContactProject.addEventListener('click', () => {
      projectDetailsModal.classList.remove('active');
      contactModal.classList.add('active');
      // Pre-fill the message with the project name
      const projName = document.getElementById('detailTitle').textContent;
      const msgArea = document.getElementById('contactMessage');
      if (msgArea) {
        msgArea.value = `Je suis intéressé par le projet : ${projName}`;
      }
    });
  }

  // Plan Modal Logic
  const planModal = document.getElementById('planModal');
  const closePlanModal = document.getElementById('closePlanModal');
  const planBtns = document.querySelectorAll('.btn-plan');
  const planProjectTitle = document.getElementById('planProjectTitle');

  function openPlanModal(e) {
    e.preventDefault();
    const card = e.target.closest('.project-card');
    const title = card.querySelector('.project-title').textContent;
    planProjectTitle.textContent = title;
    planModal.classList.add('active');
  }

  planBtns.forEach(btn => btn.addEventListener('click', openPlanModal));

  if(closePlanModal) {
    closePlanModal.addEventListener('click', () => planModal.classList.remove('active'));
  }

  if(planModal) {
    planModal.addEventListener('click', (e) => {
      if(e.target === planModal) planModal.classList.remove('active');
    });
  }

  // Initialize AOS
  if (typeof AOS !== 'undefined') {
    AOS.init({
      duration: 800,
      once: true,
      offset: 100
    });
  }

  // Page Transitions
  document.querySelectorAll('a[href]').forEach(link => {
    link.addEventListener('click', function(e) {
      const href = this.getAttribute('href');
      // Only apply transition if it's an internal html link
      if (href && href.endsWith('.html')) {
        e.preventDefault();
        document.body.classList.add('page-transitioning');
        setTimeout(() => {
          window.location.href = href;
        }, 400);
      }
    });
  });

  // Form Submission
  const contactForm = document.getElementById('contactForm');
  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      alert(translations[currentLang].form_submit + " - OK");
      contactForm.reset();
      closeModal();
    });
  }
});
