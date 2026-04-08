// ===== 모바일 드로어 =====
const menuBtn = document.getElementById('mobileMenuBtn');
const drawer = document.getElementById('mobileDrawer');
const overlay = document.getElementById('drawerOverlay');
const closeBtn = document.getElementById('drawerClose');

function openDrawer() {
  drawer.classList.add('active');
  overlay.classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeDrawer() {
  drawer.classList.remove('active');
  overlay.classList.remove('active');
  document.body.style.overflow = '';
}

if (menuBtn) menuBtn.addEventListener('click', openDrawer);
if (closeBtn) closeBtn.addEventListener('click', closeDrawer);
if (overlay) overlay.addEventListener('click', closeDrawer);

// 드로어 아코디언
document.querySelectorAll('.drawer-group-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const group = btn.closest('.drawer-group');
    const wasOpen = group.classList.contains('open');
    document.querySelectorAll('.drawer-group').forEach(g => g.classList.remove('open'));
    if (!wasOpen) group.classList.add('open');
  });
});

// 드로어 링크 클릭 시 닫기
document.querySelectorAll('.drawer-sub a').forEach(link => {
  link.addEventListener('click', closeDrawer);
});

// ===== 헤더 스크롤 =====
const header = document.getElementById('header');
if (header) {
  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  });
}
