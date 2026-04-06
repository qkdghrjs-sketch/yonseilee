// ===== 히어로 슬라이더 V2 =====
(function() {
  var slideBgs = document.querySelectorAll('.slide-bg');
  var slideTexts = document.querySelectorAll('.slide-v2');
  var spItems = document.querySelectorAll('.sp-item');
  var slideNumEl = document.querySelector('.slide-num-current');
  var prevBtn = document.querySelector('.slide-prev');
  var nextBtn = document.querySelector('.slide-next');
  if (!slideBgs.length) return; // 슬라이더 없으면 종료

  var currentSlide = 0;
  var slideInterval;

  function goToSlide(index) {
    slideBgs.forEach(function(bg) { bg.classList.remove('active'); });
    slideTexts.forEach(function(text) { text.classList.remove('active'); });
    spItems.forEach(function(sp) { sp.classList.remove('active'); });
    currentSlide = index;
    if (slideBgs[currentSlide]) slideBgs[currentSlide].classList.add('active');
    if (slideTexts[currentSlide]) slideTexts[currentSlide].classList.add('active');
    if (spItems[currentSlide]) spItems[currentSlide].classList.add('active');
    if (slideNumEl) slideNumEl.textContent = String(currentSlide + 1).padStart(2, '0');
  }

  function nextSlide() { goToSlide((currentSlide + 1) % slideBgs.length); }
  function prevSlide() { goToSlide((currentSlide - 1 + slideBgs.length) % slideBgs.length); }
  function startAutoSlide() { slideInterval = setInterval(nextSlide, 5000); }
  function resetAutoSlide() { clearInterval(slideInterval); startAutoSlide(); }

  if (nextBtn) nextBtn.addEventListener('click', function() { nextSlide(); resetAutoSlide(); });
  if (prevBtn) prevBtn.addEventListener('click', function() { prevSlide(); resetAutoSlide(); });
  spItems.forEach(function(sp) {
    sp.addEventListener('click', function() { goToSlide(parseInt(sp.dataset.slide)); resetAutoSlide(); });
  });
  startAutoSlide();
})();

// ===== 스크롤 시 헤더 스타일 변경 =====
(function() {
  var header = document.getElementById('header');
  if (!header) return;
  window.addEventListener('scroll', function() {
    if (window.scrollY > 50) { header.classList.add('scrolled'); }
    else { header.classList.remove('scrolled'); }
  });
})();

// ===== 퀵 네비게이션 Stagger 애니메이션 =====
(function() {
  var section = document.querySelector('.quicknav');
  if (!section) return;
  var obs = new IntersectionObserver(function(entries) {
    entries.forEach(function(e) {
      if (e.isIntersecting) {
        document.querySelectorAll('.qn-card').forEach(function(c) { c.classList.add('qn-visible'); });
        obs.disconnect();
      }
    });
  }, { threshold: 0.2 });
  obs.observe(section);
})();

// ===== 블로그 & 공지사항 애니메이션 =====
(function() {
  var section = document.querySelector('.blog-notice-section');
  if (!section) return;
  var obs = new IntersectionObserver(function(entries) {
    entries.forEach(function(e) {
      if (e.isIntersecting) {
        document.querySelectorAll('.bn-column').forEach(function(c) { c.classList.add('bn-visible'); });
        document.querySelectorAll('.bn-item').forEach(function(item) {
          var delay = parseInt(item.dataset.stagger) * 50;
          setTimeout(function() { item.classList.add('bn-item-visible'); }, 300 + delay);
        });
        obs.disconnect();
      }
    });
  }, { threshold: 0.15 });
  obs.observe(section);
})();

// ===== Clinic 섹션 stagger =====
(function() {
  var section = document.querySelector('.clinic-section');
  if (!section) return;
  var obs = new IntersectionObserver(function(entries) {
    entries.forEach(function(e) {
      if (e.isIntersecting) {
        document.querySelectorAll('.clinic-card').forEach(function(c) { c.classList.add('clinic-visible'); });
        obs.disconnect();
      }
    });
  }, { threshold: 0.15 });
  obs.observe(section);
})();

// ===== Promise 섹션 =====
(function() {
  var obs = new IntersectionObserver(function(entries) {
    entries.forEach(function(e) { if (e.isIntersecting) e.target.classList.add('pm-visible'); });
  }, { threshold: 0.1 });
  document.querySelectorAll('[data-anim-promise]').forEach(function(el) { obs.observe(el); });
})();

// ===== 스크롤 애니메이션 =====
(function() {
  var obs = new IntersectionObserver(function(entries) {
    entries.forEach(function(e) { if (e.isIntersecting) e.target.classList.add('visible'); });
  }, { threshold: 0.1 });
  document.querySelectorAll('.info-table-wrap, .info-contact, .location-info, .map-placeholder').forEach(function(el) {
    el.classList.add('fade-in');
    obs.observe(el);
  });
  var style = document.createElement('style');
  style.textContent = '.fade-in{opacity:0;transform:translateY(24px);transition:opacity .6s ease,transform .6s ease}.fade-in.visible{opacity:1;transform:translateY(0)}';
  document.head.appendChild(style);
})();
