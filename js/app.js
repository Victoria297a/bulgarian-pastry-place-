// Main Application JavaScript
(function() {
  'use strict';
  
  // Carousel functionality
  let cakesData = [];
  let currentCarouselIndex = 0;
  const cardsPerView = {
    mobile: 1,
    tablet: 2,
    desktop: 3
  };
  let currentCardsPerView = cardsPerView.desktop;

  // Load cakes data from JSON
  async function loadCakesData() {
    try {
      const response = await fetch('mongodb/cakes.json');
      if (response.ok) {
        const data = await response.json();
        cakesData = data.cakes;
        initializeCarousel();
      }
    } catch (error) {
      console.error('Error loading cakes data:', error);
    }
  }

  // Determine cards per view based on screen size
  function updateCardsPerView() {
    if (window.innerWidth < 768) {
      currentCardsPerView = cardsPerView.mobile;
    } else if (window.innerWidth < 1024) {
      currentCardsPerView = cardsPerView.tablet;
    } else {
      currentCardsPerView = cardsPerView.desktop;
    }
  }

  // Initialize carousel
  function initializeCarousel() {
    updateCardsPerView();
    renderCarouselCards();
    createCarouselDots();
    attachCarouselListeners();
  }

  // Render carousel cards
  function renderCarouselCards() {
    const slider = document.getElementById('cakes-slider');
    slider.innerHTML = '';
    
    cakesData.forEach(cake => {
      const card = document.createElement('div');
      card.className = 'flex-shrink-0 w-full md:w-1/2 lg:w-1/3 px-3 py-4';
      card.innerHTML = `
        <div class="bg-white rounded-2xl overflow-hidden warm-shadow hover:shadow-2xl transition-all h-full flex flex-col">
          <div class="relative h-48 bg-gradient-to-br from-amber-100 to-amber-200 flex items-center justify-center overflow-hidden">
            <img src="${cake.image}" alt="${cake.name}" class="w-full h-full object-cover" 
              onerror="this.style.background='linear-gradient(135deg, #fef3c7 0%, #fcd34d 100%)'; this.style.display='flex'; this.style.alignItems='center'; this.style.justifyContent='center'; this.innerHTML='<span style=font-size:3.5rem>🎂</span>';"/>
          </div>
          <div class="p-4 flex-1 flex flex-col">
            <h4 class="font-display text-lg font-bold text-amber-900 mb-2">${cake.name}</h4>
            <div class="mt-auto">
              <div class="flex justify-between items-center mb-3">
                <span class="text-sm text-amber-700">${cake.priceEuro}</span>
                <span class="text-lg font-bold text-amber-600">${cake.priceBGN}</span>
              </div>
              <button class="w-full px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-sm font-semibold rounded-lg transition-all">
                Към поръчка 🛒
              </button>
            </div>
          </div>
        </div>
      `;
      slider.appendChild(card);
    });
  }

  // Create carousel dots
  function createCarouselDots() {
    const dotsContainer = document.getElementById('carousel-dots');
    dotsContainer.innerHTML = '';
    const maxDots = Math.ceil(cakesData.length / currentCardsPerView);
    
    for (let i = 0; i < maxDots; i++) {
      const dot = document.createElement('button');
      dot.className = `w-2 h-2 rounded-full transition-all ${i === 0 ? 'bg-amber-600 w-6' : 'bg-amber-300'}`;
      dot.addEventListener('click', () => goToCarouselSlide(i));
      dotsContainer.appendChild(dot);
    }
  }

  // Move carousel
  function moveCarousel(direction) {
    const maxSlides = Math.ceil(cakesData.length / currentCardsPerView);
    currentCarouselIndex += direction;
    
    if (currentCarouselIndex < 0) {
      currentCarouselIndex = maxSlides - 1;
    } else if (currentCarouselIndex >= maxSlides) {
      currentCarouselIndex = 0;
    }
    
    updateCarouselPosition();
  }

  // Go to specific slide
  function goToCarouselSlide(index) {
    currentCarouselIndex = index;
    updateCarouselPosition();
  }

  // Update carousel position
  function updateCarouselPosition() {
    const slider = document.getElementById('cakes-slider');
    const translateValue = -currentCarouselIndex * 100;
    slider.style.transform = `translateX(${translateValue}%)`;
    
    // Update dots
    const dots = document.querySelectorAll('#carousel-dots button');
    dots.forEach((dot, index) => {
      if (index === currentCarouselIndex) {
        dot.className = 'w-6 h-2 rounded-full transition-all bg-amber-600';
      } else {
        dot.className = 'w-2 h-2 rounded-full transition-all bg-amber-300';
      }
    });
  }

  // Attach carousel listeners
  function attachCarouselListeners() {
    document.getElementById('carousel-prev').addEventListener('click', () => moveCarousel(-1));
    document.getElementById('carousel-next').addEventListener('click', () => moveCarousel(1));
  }

  // Handle window resize
  window.addEventListener('resize', () => {
    const newCardsPerView = currentCardsPerView;
    updateCardsPerView();
    if (newCardsPerView !== currentCardsPerView) {
      currentCarouselIndex = 0;
      createCarouselDots();
      updateCarouselPosition();
    }
  });

  // Load cakes data on page load
  loadCakesData();

  // Global state
  let userProfile = null;
  let allProfiles = [];
  
  // Data SDK initialization
  const dataHandler = {
    onDataChanged(data) {
      allProfiles = data;
      
      // Find user profile (in real app, use authentication)
      if (data.length > 0) {
        userProfile = data[0]; // Using first profile for demo
        updateProfileUI();
      }
    }
  };
  
  // Initialize Data SDK
  async function initDataSDK() {
    if (window.dataSdk) {
      const result = await window.dataSdk.init(dataHandler);
      if (!result.isOk) {
        console.error('Failed to initialize Data SDK');
      }
    }
  }
  
  initDataSDK();
  
  // Update profile UI
  function updateProfileUI() {
    if (!userProfile) return;
    
    document.getElementById('profile-username').textContent = userProfile.username || 'Гост';
    document.getElementById('profile-points').textContent = userProfile.points || 0;
    document.getElementById('profile-total-orders').textContent = userProfile.totalOrders || 0;
    
    // Calculate discounts earned (every 10 points)
    const discountsEarned = Math.floor((userProfile.points || 0) / 10);
    document.getElementById('profile-discounts').textContent = discountsEarned;
    
    // Progress to next discount
    const pointsToNext = 10 - ((userProfile.points || 0) % 10);
    document.getElementById('points-to-discount').textContent = `${pointsToNext} точки`;
    
    const progress = ((userProfile.points || 0) % 10) * 10;
    document.getElementById('points-progress').style.width = `${progress}%`;
    
    // Member since
    if (userProfile.createdAt) {
      const date = new Date(userProfile.createdAt);
      document.getElementById('profile-member-since').textContent = date.toLocaleDateString('bg-BG');
    }
    
    // Current order
    const currentOrderDiv = document.getElementById('current-order-content');
    if (userProfile.currentOrder && userProfile.currentOrder !== 'няма') {
      currentOrderDiv.innerHTML = `
        <div class="flex items-start gap-3">
          <div class="text-2xl">📦</div>
          <div class="flex-1">
            <p class="font-semibold text-amber-900">Активна поръчка</p>
            <p class="text-amber-700 text-sm">${userProfile.currentOrder}</p>
          </div>
        </div>
      `;
    } else {
      currentOrderDiv.innerHTML = '<p class="text-amber-600 text-center">Няма текуща поръчка</p>';
    }
    
    // Order history
    const historyDiv = document.getElementById('order-history-list');
    if (userProfile.orderHistory && userProfile.orderHistory !== '') {
      const orders = userProfile.orderHistory.split('|||');
      historyDiv.innerHTML = orders.map((order, index) => `
        <div class="bg-amber-50 rounded-xl p-4">
          <div class="flex items-start gap-3">
            <div class="text-xl">🎂</div>
            <div class="flex-1">
              <p class="font-semibold text-amber-900">Поръчка #${userProfile.totalOrders - index}</p>
              <p class="text-amber-700 text-sm">${order}</p>
            </div>
          </div>
        </div>
      `).join('');
    } else {
      historyDiv.innerHTML = '<p class="text-amber-600 text-center bg-amber-50 rounded-xl p-6">Все още няма поръчки</p>';
    }
    
    // Show profile content, hide setup
    document.getElementById('setup-profile-section').style.display = 'none';
    document.getElementById('profile-content').classList.remove('hidden');
  }
  
  // Create profile
  document.getElementById('create-profile-btn').addEventListener('click', async () => {
    const username = document.getElementById('username-input').value.trim();
    
    if (!username) {
      showToast('Моля, въведи потребителско име', 'error');
      return;
    }
    
    if (allProfiles.length >= 999) {
      showToast('Максималният брой профили е достигнат', 'error');
      return;
    }
    
    const btn = document.getElementById('create-profile-btn');
    btn.disabled = true;
    btn.textContent = 'Създаване...';
    
    const result = await window.dataSdk.create({
      username: username,
      points: 0,
      totalOrders: 0,
      lastOrderDate: new Date().toISOString(),
      currentOrder: 'няма',
      orderHistory: '',
      createdAt: new Date().toISOString()
    });
    
    btn.disabled = false;
    btn.textContent = 'Създай профил';
    
    if (result.isOk) {
      showToast('Профилът е създаден успешно! 🎉', 'success');
      document.getElementById('username-input').value = '';
    } else {
      showToast('Грешка при създаване на профил', 'error');
    }
  });
  
  // Submit order
  document.getElementById('order-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    if (!userProfile) {
      showToast('Моля, създай профил преди да направиш поръчка', 'error');
      document.getElementById('order-modal').classList.add('hidden');
      document.getElementById('profile-modal').classList.remove('hidden');
      return;
    }
    
    const checkboxes = document.querySelectorAll('input[name="category"]:checked');
    if (checkboxes.length === 0) {
      showToast('Моля, избери поне един продукт', 'error');
      return;
    }
    
    const selectedItems = Array.from(checkboxes).map(cb => cb.value);
    const totalPoints = Array.from(checkboxes).reduce((sum, cb) => sum + parseInt(cb.dataset.points), 0);
    const details = document.getElementById('order-details').value.trim();
    
    const orderText = selectedItems.join(', ') + (details ? ` - ${details}` : '');
    const orderDate = new Date().toLocaleDateString('bg-BG');
    const orderWithDate = `${orderDate}: ${orderText}`;
    
    const btn = document.getElementById('submit-order-btn');
    btn.disabled = true;
    btn.textContent = 'Обработка...';
    
    // Update profile
    const updatedProfile = {
      ...userProfile,
      points: (userProfile.points || 0) + totalPoints,
      totalOrders: (userProfile.totalOrders || 0) + 1,
      lastOrderDate: new Date().toISOString(),
      currentOrder: orderText,
      orderHistory: userProfile.orderHistory ? `${orderWithDate}|||${userProfile.orderHistory}` : orderWithDate
    };
    
    const result = await window.dataSdk.update(updatedProfile);
    
    btn.disabled = false;
    btn.textContent = 'Потвърди поръчка';
    
    if (result.isOk) {
      document.getElementById('order-success').classList.remove('hidden');
      document.getElementById('order-form').reset();
      updateOrderPointsPreview();
      
      setTimeout(() => {
        document.getElementById('order-success').classList.add('hidden');
        document.getElementById('order-modal').classList.add('hidden');
      }, 3000);
      
      showToast(`Поръчката е приета! Спечели ${totalPoints} точки 🐝`, 'success');
    } else {
      showToast('Грешка при обработка на поръчката', 'error');
    }
  });
  
  // Update order points preview
  function updateOrderPointsPreview() {
    const checkboxes = document.querySelectorAll('input[name="category"]:checked');
    const totalPoints = Array.from(checkboxes).reduce((sum, cb) => sum + parseInt(cb.dataset.points), 0);
    document.getElementById('order-points-preview').textContent = `${totalPoints} точки 🐝`;
  }
  
  document.querySelectorAll('input[name="category"]').forEach(cb => {
    cb.addEventListener('change', updateOrderPointsPreview);
  });
  
  // Toast notification
  function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `fixed top-24 right-4 z-50 px-6 py-4 rounded-xl shadow-lg transform transition-all ${
      type === 'success' ? 'bg-green-500 text-white' : 
      type === 'error' ? 'bg-red-500 text-white' : 
      'bg-amber-500 text-white'
    }`;
    toast.textContent = message;
    document.body.appendChild(toast);
    
    setTimeout(() => {
      toast.style.opacity = '0';
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  }
  
  // Profile modal
  function openProfileModal() {
    document.getElementById('profile-modal').classList.remove('hidden');
    if (userProfile) {
      updateProfileUI();
    } else {
      document.getElementById('setup-profile-section').style.display = 'block';
      document.getElementById('profile-content').classList.add('hidden');
    }
  }
  
  document.getElementById('profile-btn').addEventListener('click', openProfileModal);
  document.getElementById('mobile-profile-btn').addEventListener('click', () => {
    document.getElementById('mobile-menu').classList.add('hidden');
    openProfileModal();
  });
  
  document.getElementById('close-profile').addEventListener('click', () => {
    document.getElementById('profile-modal').classList.add('hidden');
  });
  
  // Order modal
  function openOrderModal() {
    document.getElementById('order-modal').classList.remove('hidden');
  }
  
  document.getElementById('order-btn').addEventListener('click', openOrderModal);
  document.getElementById('mobile-order-btn').addEventListener('click', () => {
    document.getElementById('mobile-menu').classList.add('hidden');
    openOrderModal();
  });
  
  document.getElementById('close-order').addEventListener('click', () => {
    document.getElementById('order-modal').classList.add('hidden');
  });
  
  // Close modals on outside click
  document.getElementById('profile-modal').addEventListener('click', (e) => {
    if (e.target.id === 'profile-modal') {
      document.getElementById('profile-modal').classList.add('hidden');
    }
  });
  
  document.getElementById('order-modal').addEventListener('click', (e) => {
    if (e.target.id === 'order-modal') {
      document.getElementById('order-modal').classList.add('hidden');
    }
  });
  
  // Default configuration
  const defaultConfig = {
    hero_title: 'Сладкарница Пчела',
    hero_subtitle: 'Домашни сладкиши, приготвени с любов и традиция от три поколения майстори',
    about_title: 'Нашата история',
    products_title: 'Нашите сладкиши',
    contact_title: 'Свържете се с нас',
    primary_color: '#d97706',
    secondary_color: '#fef3c7',
    text_color: '#78350f',
    accent_color: '#f59e0b',
    background_color: '#fffbeb'
  };
  
  let config = { ...defaultConfig };
  
  // Initialize Element SDK
  if (window.elementSdk) {
    window.elementSdk.init({
      defaultConfig,
      onConfigChange: async (newConfig) => {
        config = { ...defaultConfig, ...newConfig };
        
        // Update text content
        document.getElementById('hero-title').textContent = config.hero_title || defaultConfig.hero_title;
        document.getElementById('hero-subtitle').textContent = config.hero_subtitle || defaultConfig.hero_subtitle;
        document.getElementById('about-title').textContent = config.about_title || defaultConfig.about_title;
        document.getElementById('products-title').textContent = config.products_title || defaultConfig.products_title;
        document.getElementById('contact-title').textContent = config.contact_title || defaultConfig.contact_title;
      },
      mapToCapabilities: (cfg) => ({
        recolorables: [
          {
            get: () => cfg.background_color || defaultConfig.background_color,
            set: (value) => {
              cfg.background_color = value;
              window.elementSdk.setConfig({ background_color: value });
            }
          },
          {
            get: () => cfg.secondary_color || defaultConfig.secondary_color,
            set: (value) => {
              cfg.secondary_color = value;
              window.elementSdk.setConfig({ secondary_color: value });
            }
          },
          {
            get: () => cfg.text_color || defaultConfig.text_color,
            set: (value) => {
              cfg.text_color = value;
              window.elementSdk.setConfig({ text_color: value });
            }
          },
          {
            get: () => cfg.primary_color || defaultConfig.primary_color,
            set: (value) => {
              cfg.primary_color = value;
              window.elementSdk.setConfig({ primary_color: value });
            }
          },
          {
            get: () => cfg.accent_color || defaultConfig.accent_color,
            set: (value) => {
              cfg.accent_color = value;
              window.elementSdk.setConfig({ accent_color: value });
            }
          }
        ],
        borderables: [],
        fontEditable: undefined,
        fontSizeable: undefined
      }),
      mapToEditPanelValues: (cfg) => new Map([
        ['hero_title', cfg.hero_title || defaultConfig.hero_title],
        ['hero_subtitle', cfg.hero_subtitle || defaultConfig.hero_subtitle],
        ['about_title', cfg.about_title || defaultConfig.about_title],
        ['products_title', cfg.products_title || defaultConfig.products_title],
        ['contact_title', cfg.contact_title || defaultConfig.contact_title]
      ])
    });
  }
  
  // Mobile menu toggle
  const mobileMenuBtn = document.getElementById('mobile-menu-btn');
  const mobileMenu = document.getElementById('mobile-menu');
  
  mobileMenuBtn.addEventListener('click', () => {
    mobileMenu.classList.toggle('hidden');
  });
  
  // Close mobile menu when clicking a link
  mobileMenu.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      mobileMenu.classList.add('hidden');
    });
  });
  
  // Product category filtering
  const categoryBtns = document.querySelectorAll('.category-btn');
  const productCards = document.querySelectorAll('.product-card');
  
  categoryBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const category = btn.dataset.category;
      
      // Update active button styles
      categoryBtns.forEach(b => {
        b.classList.remove('bg-amber-600', 'text-white');
        b.classList.add('bg-amber-100', 'text-amber-700');
      });
      btn.classList.remove('bg-amber-100', 'text-amber-700');
      btn.classList.add('bg-amber-600', 'text-white');
      
      // Filter products
      productCards.forEach(card => {
        if (category === 'all' || card.dataset.category === category) {
          card.style.display = 'block';
          card.style.animation = 'fadeInUp 0.4s ease-out forwards';
        } else {
          card.style.display = 'none';
        }
      });
    });
  });
  
  // Contact form handling
  const contactForm = document.getElementById('contact-form');
  const formSuccess = document.getElementById('form-success');
  
  contactForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    // Show success message
    formSuccess.classList.remove('hidden');
    contactForm.reset();
    
    // Hide success message after 5 seconds
    setTimeout(() => {
      formSuccess.classList.add('hidden');
    }, 5000);
  });
  
  // Smooth scroll for navigation links
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        target.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }
    });
  });
  
})();
