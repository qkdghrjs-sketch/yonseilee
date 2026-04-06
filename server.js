const express = require('express');
const path = require('path');
const fs = require('fs');
const app = express();
const PORT = 3002;

const { NAVIGATION } = require('./data/navigation');

// index.html은 동적 라우트에서 처리하므로 제외
app.use(express.static(path.join(__dirname, 'public'), { index: false }));
app.use('/images', express.static(path.join(__dirname)));

// === 헤더 HTML 생성 ===
function renderHeader(activeCategoryId) {
  const navItems = NAVIGATION.map(cat => {
    const isActive = cat.id === activeCategoryId;
    const dropdownItems = cat.children.map(ch =>
      `<a href="${ch.href}" class="dropdown-item" style="--item-color:${cat.color}">${ch.label}</a>`
    ).join('');
    return `
      <div class="nav-menu-item${isActive ? ' active' : ''}" style="--menu-color:${cat.color}">
        <a href="${cat.href}" class="nav-menu-link">${cat.label}</a>
        <div class="dropdown">${dropdownItems}</div>
      </div>`;
  }).join('');

  return `
  <header class="header scrolled" id="header">
    <div class="container header-top">
      <a href="/" class="logo">
        <img src="https://cdn.imweb.me/upload/S20260108b9005a7eb2710/820ee1358ec4c.png" alt="운정센트럴365의원 로고">
      </a>
      <button class="mobile-menu-btn" id="mobileMenuBtn" aria-label="메뉴 열기">
        <span></span><span></span><span></span>
      </button>
    </div>
    <div class="header-nav-wrap">
      <nav class="nav-mega container">${navItems}
        <a href="https://pf.kakao.com/_xevPpn" target="_blank" class="nav-kakao">카카오톡 상담</a>
      </nav>
    </div>
  </header>
  <!-- 모바일 드로어 -->
  <div class="mobile-drawer-overlay" id="drawerOverlay"></div>
  <aside class="mobile-drawer" id="mobileDrawer">
    <div class="drawer-header">
      <img src="https://cdn.imweb.me/upload/S20260108b9005a7eb2710/820ee1358ec4c.png" alt="로고" class="drawer-logo">
      <button class="drawer-close" id="drawerClose" aria-label="메뉴 닫기">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
      </button>
    </div>
    <div class="drawer-body">
      ${NAVIGATION.map(cat => `
      <div class="drawer-group">
        <button class="drawer-group-btn" style="--menu-color:${cat.color}">
          <span>${cat.label}</span>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m6 9 6 6 6-6"/></svg>
        </button>
        <div class="drawer-sub">
          ${cat.children.map(ch => `<a href="${ch.href}">${ch.label}</a>`).join('')}
        </div>
      </div>`).join('')}
      <a href="https://pf.kakao.com/_xevPpn" target="_blank" class="drawer-kakao">카카오톡 상담</a>
    </div>
  </aside>`;
}

// === 푸터 HTML ===
const FOOTER = `
  <footer class="footer">
    <div class="container">
      <div class="footer-inner">
        <div class="footer-logo"><img src="https://cdn.imweb.me/upload/S20260108b9005a7eb2710/820ee1358ec4c.png" alt="운정센트럴365의원"></div>
        <div class="footer-info">
          <p><strong>운정센트럴365의원</strong> UNJEONG CENTRAL CLINIC</p>
          <p>경기도 파주시 동패동 2277-1 정석프라자 3층</p>
          <p>내과 · 소화기내과 · 건강검진센터 · 소아청소년과 · 성장클리닉</p>
        </div>
      </div>
      <div class="footer-bottom"><p>&copy; 2026 운정센트럴365의원. All rights reserved.</p></div>
    </div>
  </footer>
  <a href="https://pf.kakao.com/_xevPpn" target="_blank" class="floating-kakao" aria-label="카카오톡 상담">💬<span>상담하기</span></a>`;

// === HTML 래퍼 ===
function renderPage({ title, activeCategoryId, bodyContent, extraCss, extraJs }) {
  return `<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title} | 운정센트럴365의원</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@300;400;500;700;900&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="/css/style.css">
  <link rel="stylesheet" href="/css/header-mega.css">
  ${extraCss || ''}
  <link rel="stylesheet" href="/css/mobile.css">
</head>
<body>
  ${renderHeader(activeCategoryId)}
  ${bodyContent}
  ${FOOTER}
  <script src="/js/header-mega.js"></script>
  ${extraJs || ''}
</body>
</html>`;
}

// === 카테고리 인덱스 페이지 ===
function renderCategoryIndex(cat) {
  const cards = cat.children.map((ch, i) => `
    <a href="${ch.href}" class="cat-card" data-anim data-delay="${i}">
      <div class="cat-card-bar" style="background:${cat.color}"></div>
      <div class="cat-card-body">
        <h3>${ch.label}</h3>
        <p>${ch.desc}</p>
        <span class="cat-card-arrow">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
        </span>
      </div>
    </a>`).join('');

  const body = `
  <section class="page-hero" style="--hero-color:${cat.color}">
    <div class="page-hero-inner" data-anim>
      <h1>${cat.label}</h1>
      <p>${getCategoryDesc(cat.id)}</p>
    </div>
  </section>
  <section class="page-section">
    <div class="page-container">
      <div class="cat-grid">${cards}</div>
    </div>
  </section>`;

  return renderPage({
    title: cat.label,
    activeCategoryId: cat.id,
    bodyContent: body,
    extraCss: '<link rel="stylesheet" href="/css/pages.css">',
    extraJs: '<script src="/js/page-anim.js"></script>'
  });
}

// === WHY 데이터 ===
const WHY_DATA = {
  '/endoscopy/gastroscopy':   { badge:'위내시경, 왜 운정센트럴365일까?', overlay:'위내시경 전문 클리닉', desc:'소화기내시경 전문의가 직접 시행하는 안전하고 정확한 위내시경 검사입니다.', features:['소화기내시경 전문의','수면내시경 시행','당일 용종절제 가능','철저한 멸균 소독'] },
  '/endoscopy/colonoscopy':  { badge:'대장내시경, 왜 운정센트럴365일까?', overlay:'대장내시경 전문 클리닉', desc:'대장암 조기발견을 위한 정밀 대장내시경 검사를 제공합니다.', features:['소화기내시경 전문의','당일 용종절제 가능','수면내시경 시행','일요일 검사 가능'] },
  '/endoscopy/sedation':     { badge:'수면내시경, 왜 운정센트럴365일까?', overlay:'편안한 수면내시경', desc:'통증 없이 편안하게 받는 수면내시경으로 정확한 검사를 제공합니다.', features:['통증 없는 검사','안전한 수면 유도','전문의 직접 시행','빠른 회복'] },
  '/endoscopy/gerd':         { badge:'역류성식도염, 왜 운정센트럴365일까?', overlay:'역류성식도염 전문 진료', desc:'정확한 위내시경 진단으로 역류성식도염의 원인을 찾고 근본 치료합니다.', features:['위내시경 정밀 진단','맞춤 치료 처방','식이·생활습관 관리','전문의 직접 진료'] },
  '/endoscopy/helicobacter': { badge:'헬리코박터, 왜 운정센트럴365일까?', overlay:'헬리코박터 전문 진료', desc:'헬리코박터 검사부터 제균 치료까지 원스톱으로 진행합니다.', features:['정확한 헬리코박터 검사','제균 치료','치료 후 추적 관리','전문의 직접 진료'] },
  '/endoscopy/polypectomy':  { badge:'용종절제술, 왜 운정센트럴365일까?', overlay:'당일 용종절제 가능', desc:'검사 당일 용종을 즉시 제거하는 원스톱 서비스를 제공합니다.', features:['검사 당일 절제 가능','소화기내시경 전문의','안전한 시술','빠른 회복'] },
  '/checkup/general':    { badge:'종합검진, 왜 운정센트럴365일까?', overlay:'1:1 맞춤형 종합검진', desc:'개인 맞춤형 검진 프로그램으로 정확하고 효율적인 건강검진을 제공합니다.', features:['1:1 맞춤 설계','전문의 직접 판독','당일 결과 안내','대학병원급 장비'] },
  '/checkup/cancer':     { badge:'5대암검진, 왜 운정센트럴365일까?', overlay:'국가 5대암 조기발견', desc:'국민건강보험 지정기관으로 5대암을 조기에 발견하고 안전하게 관리합니다.', features:['국가검진 지정기관','소화기내시경 전문의','당일 용종절제 가능','원스톱 진료'] },
  '/checkup/ultrasound': { badge:'초음파검사, 왜 운정센트럴365일까?', overlay:'정밀 초음파 검사', desc:'고해상도 초음파 장비로 복부·갑상선·심장 등 정밀 검사를 제공합니다.', features:['고해상도 초음파 장비','전문의 직접 판독','당일 결과 안내','다부위 검사 가능'] },
  '/checkup/thyroid':    { badge:'갑상선검사, 왜 운정센트럴365일까?', overlay:'갑상선 전문 검사', desc:'갑상선 초음파·혈액검사·조직검사까지 체계적인 갑상선 검진을 제공합니다.', features:['갑상선 초음파','혈액검사 병행','세침흡인검사 가능','전문의 직접 판독'] },
  '/checkup/echo':       { badge:'심장초음파, 왜 운정센트럴365일까?', overlay:'심장 정밀 검사', desc:'심장초음파로 심장 구조와 기능을 정밀하게 평가합니다.', features:['심장초음파 정밀 검사','전문의 직접 판독','당일 결과 안내','심전도 병행 검사'] },
  '/checkup/carotid':    { badge:'경동맥초음파, 왜 운정센트럴365일까?', overlay:'뇌졸중 위험 조기 확인', desc:'경동맥 초음파로 뇌졸중·심근경색 위험을 사전에 확인합니다.', features:['뇌졸중 위험 조기 발견','전문의 직접 판독','당일 결과 안내','고혈압 환자 필수 검사'] },
  '/chronic/hypertension':   { badge:'고혈압, 왜 운정센트럴365일까?', overlay:'고혈압 전문 클리닉', desc:'고혈압은 꾸준한 관리가 치료입니다. 전문의와 함께 체계적으로 관리하세요.', features:['전문의 직접 진료','개인별 맞춤 관리','정기적 모니터링','합병증 예방 관리'] },
  '/chronic/diabetes':       { badge:'당뇨, 왜 운정센트럴365일까?', overlay:'당뇨 전문 클리닉', desc:'당뇨는 꾸준한 관리가 치료입니다. 전문의와 함께 체계적으로 관리하세요.', features:['전문의 직접 진료','혈당 맞춤 관리','정기적 모니터링','합병증 예방 관리'] },
  '/chronic/hyperlipidemia': { badge:'고지혈증, 왜 운정센트럴365일까?', overlay:'고지혈증 전문 클리닉', desc:'고지혈증은 꾸준한 관리가 치료입니다. 전문의와 함께 체계적으로 관리하세요.', features:['전문의 직접 진료','개인별 맞춤 관리','정기적 모니터링','합병증 예방 관리'] },
  '/chronic/thyroid':        { badge:'갑상선질환, 왜 운정센트럴365일까?', overlay:'갑상선 전문 클리닉', desc:'갑상선 기능 이상을 정확히 진단하고 체계적으로 관리합니다.', features:['갑상선 초음파','혈액검사 병행','전문의 직접 진료','정기 추적 관리'] },
  '/chronic/sleep':          { badge:'수면장애, 왜 운정센트럴365일까?', overlay:'수면장애 전문 클리닉', desc:'수면장애의 원인을 정확히 파악하고 맞춤 치료를 제공합니다.', features:['수면 원인 정밀 분석','개인 맞춤 치료','전문의 직접 진료','비약물 치료 병행'] },
  '/chronic/ent':            { badge:'이비인후과, 왜 운정센트럴365일까?', overlay:'이비인후과 전문 진료', desc:'알레르기비염·만성비염·중이염 등 이비인후과 질환을 전문적으로 치료합니다.', features:['전문의 직접 진료','내시경 검사 가능','알레르기 원인 분석','맞춤 치료 처방'] },
  '/pediatric/general': { badge:'소아진료, 왜 운정센트럴365일까?', overlay:'소아청소년과 전문 진료', desc:'영유아부터 청소년까지 전 연령대 소아과 전문 진료를 제공합니다.', features:['소아청소년과 전문의','365일 진료 가능','365일 진료 운영','친절한 소아 전문 진료'] },
  '/pediatric/vaccine': { badge:'예방접종, 왜 운정센트럴365일까?', overlay:'국가필수예방접종 지정기관', desc:'국가필수예방접종부터 선택접종까지 체계적으로 관리합니다.', features:['국가필수접종 지정기관','접종 이력 관리','전문의 직접 상담','당일 접종 가능'] },
  '/pediatric/ent':     { badge:'소아이비인후과, 왜 운정센트럴365일까?', overlay:'소아이비인후과 전문 진료', desc:'소아 중이염·편도염·알레르기비염을 전문적으로 진단하고 치료합니다.', features:['소아 전문의 직접 진료','내시경 검사','알레르기 원인 분석','재발 방지 관리'] },
  '/pediatric/allergy': { badge:'소아알레르기, 왜 운정센트럴365일까?', overlay:'소아 알레르기 전문 진료', desc:'알레르기 원인을 정확히 찾아 아이 맞춤 치료를 제공합니다.', features:['알레르기 혈액검사','원인 항원 분석','맞춤 치료 처방','전문의 직접 진료'] },
  '/pediatric/night':   { badge:'365일 진료, 왜 운정센트럴365일까?', overlay:'365일 진료', desc:'갑작스러운 아이 응급상황에도 365일 진료로 함께합니다.', features:['365일 진료 운영','휴일·공휴일 진료','소아청소년과 전문의','응급 처치 가능'] },
  '/growth/intro':      { badge:'성장클리닉, 왜 운정센트럴365일까?', overlay:'우리아이 성장 전문 클리닉', desc:'아이의 성장을 과학적으로 평가하고 최적의 성장 환경을 만들어드립니다.', features:['성장 전문의 직접 진료','정밀 성장 평가','개인 맞춤 관리','체계적 추적 관리'] },
  '/growth/bone-age':   { badge:'골연령검사, 왜 운정센트럴365일까?', overlay:'정밀 성장판·골연령 검사', desc:'X-ray 골연령 검사로 아이의 실제 성장 가능성을 정확히 평가합니다.', features:['X-ray 골연령 정밀 분석','전문의 직접 판독','성장 예측 상담','당일 결과 안내'] },
  '/growth/hormone':    { badge:'성장호르몬, 왜 운정센트럴365일까?', overlay:'성장호르몬 전문 치료', desc:'성장호르몬 검사부터 치료, 사후 관리까지 체계적으로 진행합니다.', features:['성장호르몬 정밀 검사','전문의 직접 처방','안전한 치료','정기적 추적 관리'] },
  '/growth/precocious': { badge:'성조숙증, 왜 운정센트럴365일까?', overlay:'성조숙증 전문 진료', desc:'성조숙증 조기 발견과 치료로 아이의 최종 키를 지켜드립니다.', features:['성조숙증 정밀 진단','호르몬 검사 병행','전문의 직접 진료','맞춤 치료 계획'] },
  '/growth/nutrition':  { badge:'영양관리, 왜 운정센트럴365일까?', overlay:'키성장 영양 전문 관리', desc:'성장에 필요한 영양 상태를 평가하고 맞춤 영양 관리를 제공합니다.', features:['영양 상태 정밀 평가','개인 맞춤 영양 처방','성장 식단 관리','전문의 직접 상담'] },
};

// === 세부 페이지 본문 콘텐츠 ===
const PAGE_CONTENT = {
  '/endoscopy/gastroscopy': {
    intro: '위내시경은 내시경 카메라를 이용해 식도·위·십이지장을 직접 관찰하는 검사입니다. 위암, 위궤양, 역류성식도염, 헬리코박터 감염 등을 조기에 발견할 수 있습니다. 40세 이상은 2년마다 국가암검진으로 무료 시행 가능합니다.',
    symptomTitle: '이런 분께 권장합니다',
    symptoms: ['속쓰림, 소화불량이 자주 있는 분','식후 더부룩함, 명치 통증이 있는 분','가족 중 위암 환자가 있는 분','40세 이상으로 정기 검진이 필요한 분'],
    processTitle: '검사 과정',
    process: ['검사 전날 저녁 9시 이후 금식','검사 당일 마취 후 내시경 삽입','식도·위·십이지장 정밀 관찰 (5~10분)','검사 후 결과 설명 및 조직검사 필요 시 즉시 시행'],
    strengthTitle: '운정센트럴365의 특징',
    strengths: ['소화기내시경 전문의 직접 시행','수면(진정)내시경 가능','당일 조직검사 및 결과 안내','철저한 내시경 세척·멸균 소독'],
  },
  '/endoscopy/colonoscopy': {
    intro: '대장내시경은 항문을 통해 내시경을 삽입해 대장 전체를 직접 관찰하는 검사입니다. 대장암, 대장용종, 염증성 장질환을 조기에 발견하고 용종은 당일 제거가 가능합니다. 50세 이상은 국가암검진으로 5년마다 무료 시행 가능합니다.',
    symptomTitle: '이런 분께 권장합니다',
    symptoms: ['혈변, 점액변이 있는 분','변비와 설사가 반복되는 분','가족 중 대장암·용종 병력이 있는 분','50세 이상으로 정기 검진이 필요한 분'],
    processTitle: '검사 과정',
    process: ['검사 전날 장청소약 복용 (철저한 장 준비)','검사 당일 수면 유도 후 내시경 삽입','대장 전체 정밀 관찰 (15~30분)','용종 발견 시 당일 즉시 절제 후 결과 안내'],
    strengthTitle: '운정센트럴365의 특징',
    strengths: ['소화기내시경 전문의 직접 시행','당일 용종절제 가능 (원스톱)','수면(진정)내시경 가능','일요일·공휴일 검사 가능'],
  },
  '/endoscopy/sedation': {
    intro: '수면내시경은 진정제를 투여해 환자가 편안하게 잠든 상태에서 시행하는 내시경입니다. 구역감과 불편함 없이 검사를 받을 수 있어 검사 공포증이 있는 분께 특히 권장합니다. 위내시경과 대장내시경 모두 수면으로 시행 가능합니다.',
    symptomTitle: '이런 분께 권장합니다',
    symptoms: ['내시경 검사가 두렵거나 공포증이 있는 분','이전 내시경에서 심한 구역감을 경험한 분','편안하게 검사받고 싶은 분','위·대장 동시 검사를 원하는 분'],
    processTitle: '검사 과정',
    process: ['검사 전 활력징후 확인 및 진정제 투여','수면 유도 후 내시경 검사 시행','검사 완료 후 회복실에서 30분 휴식','완전히 깬 후 결과 설명 및 귀가'],
    strengthTitle: '운정센트럴365의 특징',
    strengths: ['전문의가 직접 수면 유도 및 검사 시행','안전한 진정제 사용 및 모니터링','쾌적한 회복실 운영','검사 후 보호자 동반 귀가 안내'],
  },
  '/endoscopy/gerd': {
    intro: '역류성식도염은 위산이 식도로 역류해 식도 점막에 염증을 일으키는 질환입니다. 속쓰림, 신물 올라옴, 목 이물감, 만성기침 등의 증상이 나타납니다. 방치 시 식도협착, 바렛식도, 식도암으로 진행할 수 있어 정확한 진단이 중요합니다.',
    symptomTitle: '이런 분께 해당됩니다',
    symptoms: ['식후 속쓰림, 신물이 올라오는 분','목에 뭔가 걸린 느낌이 지속되는 분','만성 기침이나 쉰 목소리가 있는 분','야간에 가슴 쓰림으로 잠을 못 자는 분'],
    processTitle: '치료 과정',
    process: ['위내시경으로 식도 점막 상태 정밀 확인','역류성식도염 중증도 분류 (LA분류)','위산억제제·위장운동촉진제 처방','식이·생활습관 교정 상담 및 추적 관리'],
    strengthTitle: '운정센트럴365의 특징',
    strengths: ['위내시경으로 정확한 원인 진단','개인별 맞춤 약물 처방','식이·생활습관 전문 상담','재발 방지를 위한 장기 관리'],
  },
  '/endoscopy/helicobacter': {
    intro: '헬리코박터 파일로리균은 위 점막에 서식하는 세균으로 위염, 위궤양, 위암의 주요 원인입니다. 우리나라 성인의 약 50%가 감염되어 있으며 대부분 증상이 없어 검사로만 확인 가능합니다. 제균 치료 시 위암 발생률을 유의미하게 낮출 수 있습니다.',
    symptomTitle: '이런 분께 권장합니다',
    symptoms: ['위궤양·십이지장궤양 진단을 받은 분','가족 중 위암 환자가 있는 분','만성 소화불량, 속쓰림이 지속되는 분','위내시경에서 만성 위염이 확인된 분'],
    processTitle: '치료 과정',
    process: ['위내시경 또는 호기검사로 헬리코박터 확인','항생제·위산억제제 병합 제균 치료 (7~14일)','치료 완료 4주 후 제균 성공 여부 확인','제균 성공 후 정기 위내시경 추적 관리'],
    strengthTitle: '운정센트럴365의 특징',
    strengths: ['정확한 헬리코박터 검사 (조직검사·호기검사)','표준 제균 치료 프로토콜 적용','치료 후 추적 검사로 제균율 확인','전문의 직접 상담 및 관리'],
  },
  '/endoscopy/polypectomy': {
    intro: '대장용종은 대장 점막이 비정상적으로 자란 혹으로, 일부는 대장암으로 발전할 수 있습니다. 대장내시경 중 용종을 발견하면 당일 즉시 제거하는 것이 원칙입니다. 조기에 제거하면 대장암 예방 효과가 매우 높습니다.',
    symptomTitle: '이런 분께 해당됩니다',
    symptoms: ['대장내시경에서 용종이 발견된 분','이전에 용종 제거 이력이 있는 분','가족 중 대장암·용종 병력이 있는 분','대장암 예방을 원하는 분'],
    processTitle: '시술 과정',
    process: ['대장내시경으로 용종 위치·크기·형태 확인','용종 크기에 따라 절제 방법 결정','당일 즉시 절제 후 지혈 확인','조직 병리검사 후 결과 안내 및 추적 일정 안내'],
    strengthTitle: '운정센트럴365의 특징',
    strengths: ['검사 당일 즉시 절제 가능 (원스톱)','소화기내시경 전문의 직접 시행','다양한 절제 방법 보유','시술 후 안전한 회복 관리'],
  },
  // === 건강검진센터 ===
  '/checkup/general': {
    intro: '종합건강검진은 질환의 조기 발견과 예방을 위해 혈액검사, 소변검사, 영상검사, 내시경 등을 체계적으로 시행하는 검진 프로그램입니다. 국가건강검진, 일반건강검진, 기업검진, 종합검진까지 개인의 나이·성별·가족력에 맞는 1:1 맞춤형 검진을 제공합니다. 질환은 조기에 발견할수록 치료 성공률이 높아집니다.',
    symptomTitle: '이런 분께 종합검진을 권장합니다',
    symptoms: ['40세 이상으로 정기 검진이 필요한 분','암·심혈관질환 등 가족력이 있는 분','만성 피로, 체중 변화, 소화불량이 있는 분','직장인 기업 건강검진 대상자','흡연·음주 습관이 있는 분','최근 1~2년간 검진을 받지 않은 분'],
    processTitle: '종합건강검진 과정',
    process: ['검진 전 1:1 상담으로 개인별 맞춤 프로그램 설계','기본 검사: 혈액검사(간·신장·혈당·지질·갑상선), 소변검사, 흉부X-ray, 심전도','정밀 검사: 위·대장내시경, 복부초음파, 갑상선초음파, 심장초음파, 경동맥초음파','전문의 직접 판독 후 1:1 결과 상담 및 추적 관리 안내'],
    strengthTitle: '운정센트럴365 종합검진의 특징',
    strengths: ['1:1 맞춤 검진 설계','소화기내시경 전문의 직접 시행','당일 용종절제 원스톱','대학병원급 최신 초음파 장비','당일 결과 안내 가능','추적 관리까지 책임'],
  },
  '/checkup/cancer': {
    intro: '5대암검진은 국민건강보험공단에서 지정한 위암, 대장암, 간암, 유방암, 자궁경부암을 조기에 발견하기 위한 국가암검진 프로그램입니다. 대상자는 무료로 검진받을 수 있으며, 암은 조기 발견 시 생존율이 90% 이상으로 높아지므로 정기 검진이 매우 중요합니다.',
    symptomTitle: '국가 5대암검진 대상 및 주기',
    symptoms: ['위암: 40세 이상, 2년마다 위내시경','대장암: 50세 이상, 1년마다 분변잠혈검사 → 양성 시 대장내시경','간암: B·C형 간염, 간경변 등 고위험군 40세 이상, 6개월마다 복부초음파 + 혈액검사','유방암: 40세 이상 여성, 2년마다 유방촬영','자궁경부암: 20세 이상 여성, 2년마다 자궁경부세포검사','국민건강보험공단에서 대상자에게 무료 검진 안내'],
    processTitle: '5대암검진 과정',
    process: ['국민건강보험공단 대상자 확인 및 예약','해당 암종별 검사 시행 (내시경, 초음파, 혈액검사 등)','소화기내시경 전문의가 직접 위·대장내시경 시행','전문의 판독 후 결과 안내, 이상 소견 시 정밀검사 연계'],
    strengthTitle: '운정센트럴365 5대암검진의 특징',
    strengths: ['국가검진 지정기관','소화기내시경 전문의 직접 시행','검사 중 용종 발견 시 당일 즉시 절제','수면내시경 가능','복부초음파 전문의 직접 판독','원스톱 진료로 재방문 부담 최소화'],
  },
  '/checkup/ultrasound': {
    intro: '초음파검사는 인체에 무해한 음파를 이용해 장기의 형태, 크기, 혈류 상태를 실시간으로 확인하는 영상 검사입니다. 방사선 노출이 없어 안전하며, 복부(간·담낭·췌장·신장·비장), 갑상선, 심장, 경동맥 등 다양한 부위를 검사할 수 있습니다.',
    symptomTitle: '이런 분께 초음파검사를 권장합니다',
    symptoms: ['복부 통증, 더부룩함, 소화불량이 있는 분','목 앞쪽에 혹이 만져지거나 갑상선 이상이 의심되는 분','흉통, 호흡곤란, 심장 두근거림이 있는 분','고혈압·당뇨·고지혈증으로 혈관 상태가 궁금한 분','건강검진에서 간수치·갑상선 수치 이상이 있는 분','암 가족력이 있어 정밀 검사가 필요한 분'],
    processTitle: '초음파검사 과정',
    process: ['검사 부위에 젤을 바르고 초음파 탐촉자로 실시간 영상 확인','복부초음파: 간·담낭·췌장·신장·비장 상태 확인 (10~15분)','갑상선초음파: 결절 유무·크기·형태 정밀 확인','심장초음파: 심장 구조·판막·수축력 평가 / 경동맥초음파: 혈관벽 두께·동맥경화 확인','전문의 직접 판독 후 당일 결과 설명'],
    strengthTitle: '운정센트럴365 초음파검사의 특징',
    strengths: ['고해상도 최신 초음파 장비','전문의 직접 검사 및 판독','복부·갑상선·심장·경동맥 다부위 검사 가능','당일 결과 안내','통증 없이 안전한 검사','건강검진과 연계 가능'],
  },
  '/checkup/thyroid': {
    intro: '갑상선검사는 갑상선 초음파, 혈액검사(갑상선 기능검사), 세침흡인검사(FNA)를 통해 갑상선 질환을 정확히 진단합니다. 갑상선 결절은 성인의 약 30~50%에서 발견될 만큼 흔하며, 대부분 양성이지만 일부는 갑상선암일 수 있어 정밀 검사가 필요합니다.',
    symptomTitle: '이런 분께 갑상선검사를 권장합니다',
    symptoms: ['목 앞쪽에 혹이 만져지거나 부어 보이는 분','급격한 체중 변화 (증가 또는 감소)','극심한 피로, 무기력, 집중력 저하','심장 두근거림, 손 떨림, 땀이 많은 분','갑상선 질환 가족력이 있는 분','이전 검사에서 갑상선 결절이 발견된 분'],
    processTitle: '갑상선검사 과정',
    process: ['갑상선 초음파로 결절 유무·크기·형태·석회화 정밀 확인','혈액검사로 갑상선 호르몬(TSH, Free T4) 수치 확인','K-TIRADS 분류에 따라 세침흡인검사(FNA) 필요 여부 결정','세침흡인검사: 가는 바늘로 결절 세포를 채취하여 암 여부 확인','전문의 결과 상담 및 추적 관리 일정 안내'],
    strengthTitle: '운정센트럴365 갑상선검사의 특징',
    strengths: ['고해상도 갑상선 초음파','혈액검사 동시 시행','세침흡인검사(FNA) 가능','전문의 직접 판독 및 시술','당일 결과 안내 (혈액검사)','정기 추적 관리'],
  },
  '/checkup/echo': {
    intro: '심장초음파는 초음파를 이용해 심장의 크기, 구조, 판막 기능, 심장 수축력, 혈류 방향을 실시간으로 확인하는 검사입니다. 방사선 노출 없이 심장 질환을 정확하게 진단할 수 있으며, 심부전, 판막질환, 심근병증, 심낭질환 등의 조기 발견에 필수적입니다.',
    symptomTitle: '이런 분께 심장초음파를 권장합니다',
    symptoms: ['흉통, 가슴 답답함이 있는 분','호흡곤란, 운동 시 숨이 차는 분','심장 두근거림, 불규칙한 맥박','다리·발목 부종이 있는 분','고혈압·당뇨 등 만성질환으로 심장 합병증이 걱정되는 분','심전도 이상 소견이 있는 분','가족 중 심장질환 환자가 있는 분'],
    processTitle: '심장초음파 검사 과정',
    process: ['왼쪽으로 누운 상태에서 가슴에 초음파 탐촉자 적용','심장 4개 방(심방·심실)의 크기와 구조 확인','판막 움직임과 혈류 방향 평가 (도플러 초음파)','심장 수축력(박출률, EF) 측정','전문의 직접 판독 후 당일 결과 설명 (약 20~30분)'],
    strengthTitle: '운정센트럴365 심장초음파의 특징',
    strengths: ['최신 심장초음파 장비','전문의 직접 검사 및 판독','심전도 동시 시행 가능','당일 결과 안내','통증 없이 안전한 검사','만성질환 환자 심장 합병증 모니터링'],
  },
  '/checkup/carotid': {
    intro: '경동맥초음파는 목의 경동맥(뇌로 가는 주요 혈관) 벽 두께와 혈류 상태를 초음파로 확인하는 검사입니다. 동맥경화의 진행 정도를 직접 눈으로 확인할 수 있어, 뇌졸중과 심근경색의 위험을 사전에 평가하는 가장 효과적인 검사입니다. 특히 고혈압·당뇨·고지혈증 환자에게 필수적입니다.',
    symptomTitle: '이런 분께 경동맥초음파를 권장합니다',
    symptoms: ['고혈압·당뇨·고지혈증이 있는 분','흡연자 또는 비만인 분','뇌졸중·심근경색 가족력이 있는 분','일시적 시력 저하, 팔다리 마비감을 경험한 분','어지러움·두통이 자주 있는 분','50세 이상으로 혈관 건강이 궁금한 분','심장초음파와 함께 종합 혈관 평가를 원하는 분'],
    processTitle: '경동맥초음파 검사 과정',
    process: ['목 양쪽에 초음파 탐촉자를 대고 경동맥 확인 (15~20분)','경동맥 내막-중막 두께(IMT) 정밀 측정 — 동맥경화 지표','혈관 내 플라크(죽상경화반) 유무, 크기, 성상 확인','혈관 협착 정도 및 혈류 속도 측정 (도플러)','전문의 직접 판독 후 당일 결과 설명 및 관리 안내'],
    strengthTitle: '운정센트럴365 경동맥초음파의 특징',
    strengths: ['뇌졸중·심근경색 위험 조기 발견','고해상도 초음파 장비','전문의 직접 검사 및 판독','당일 결과 안내','심장초음파와 동시 시행 가능','만성질환 환자 필수 검사'],
  },
  // === 만성질환클리닉 ===
  '/chronic/hypertension': {
    intro: '고혈압은 혈압이 지속적으로 140/90mmHg 이상인 상태로, 심장·뇌·신장·혈관에 손상을 일으킵니다. 한국 성인 3명 중 1명(약 1,200만 명)이 고혈압 환자이며, 대부분 증상이 없어 "침묵의 살인자"로 불립니다. 방치하면 뇌졸중, 심근경색, 심부전, 신부전으로 이어질 수 있어 정기적인 측정과 꾸준한 관리가 핵심입니다.',
    symptomTitle: '고혈압 의심 증상 및 위험 요인',
    symptoms: ['두통, 어지러움, 뒷목 뻣뻣함','가슴 답답함, 호흡곤란','코피가 자주 나는 분','시력 저하, 눈 충혈','가족 중 고혈압·뇌졸중·심근경색 환자','비만, 흡연, 과도한 음주, 짠 음식 선호','스트레스가 심하거나 운동이 부족한 분'],
    processTitle: '고혈압 진단 및 치료 과정',
    process: ['정확한 혈압 측정 (2회 이상, 양팔)','혈액검사 (신장기능, 혈당, 지질, 전해질)','심전도, 소변검사, 흉부X-ray','합병증 평가: 심장초음파, 경동맥초음파, 안저검사','개인별 위험도 평가 후 맞춤 약물 선택','생활습관 교정: 저염식(6g 미만/일), 체중관리, 운동처방'],
    strengthTitle: '운정센트럴365 고혈압 관리의 특징',
    strengths: ['내과 전문의 직접 진료','심장초음파·경동맥초음파로 합병증 평가','개인별 약물 맞춤 처방','정기 모니터링 및 약물 조절','생활습관 교정 상담','혈압 수첩 관리 지도'],
  },
  '/chronic/diabetes': {
    intro: '당뇨병은 인슐린 분비 또는 작용에 문제가 생겨 혈당이 지속적으로 높은 상태입니다. 한국 당뇨병 환자 약 600만 명, 당뇨 전단계까지 포함하면 1,500만 명 이상입니다. 방치하면 망막병증(실명), 신증(투석), 신경병증(족부 괴사), 심혈관질환으로 이어질 수 있어 조기 발견과 꾸준한 혈당 관리가 생명입니다.',
    symptomTitle: '당뇨 의심 증상 및 위험 요인',
    symptoms: ['갈증이 심하고 물을 많이 마시는 분 (다음)','소변 횟수·양이 증가한 분 (다뇨)','많이 먹는데도 체중이 감소하는 분 (다식)','극심한 피로감, 무기력','상처가 잘 낫지 않는 분','시력 저하, 손발 저림','당뇨 가족력, 비만, 임신성 당뇨 이력'],
    processTitle: '당뇨 진단 및 치료 과정',
    process: ['공복혈당 검사 (126mg/dL 이상 시 당뇨 진단)','당화혈색소(HbA1c) 검사 — 최근 2~3개월 평균 혈당 반영','경구당부하검사(OGTT) — 당뇨 전단계 정밀 진단','합병증 선별: 안저검사, 소변 미세알부민, 신경전도검사','개인별 혈당 목표 설정 및 맞춤 약물 처방','식이요법·운동요법·자가혈당측정 교육'],
    strengthTitle: '운정센트럴365 당뇨 관리의 특징',
    strengths: ['내과 전문의 직접 진료','당화혈색소 정기 모니터링','합병증 조기 선별검사','개인별 혈당 목표 관리','식이·운동 생활습관 상담','인슐린 치료 필요시 안내'],
  },
  '/chronic/hyperlipidemia': {
    intro: '고지혈증(이상지질혈증)은 혈중 LDL콜레스테롤, 중성지방이 높거나 HDL콜레스테롤이 낮은 상태입니다. 대부분 증상이 전혀 없지만, 혈관벽에 지방이 쌓여 동맥경화가 진행되면 어느 날 갑자기 심근경색이나 뇌졸중이 발생합니다. 정기 혈액검사로 이상을 발견하고, 수치에 맞는 관리를 시작하는 것이 가장 중요합니다.',
    symptomTitle: '고지혈증 위험 요인',
    symptoms: ['가족 중 심근경색·뇌졸중 환자가 있는 분','비만(BMI 25 이상) 또는 복부비만','기름진 음식, 인스턴트 식품을 자주 먹는 분','운동을 거의 하지 않는 분','흡연자 또는 과도한 음주','고혈압·당뇨를 함께 가진 분','LDL 160 이상, 중성지방 200 이상 판정 이력'],
    processTitle: '고지혈증 진단 및 치료 과정',
    process: ['12시간 공복 후 혈액검사: 총콜레스테롤, LDL, HDL, 중성지방','심혈관 위험도 종합 평가 (나이, 성별, 흡연, 혈압, 당뇨 고려)','경동맥초음파로 동맥경화 직접 확인','위험도에 따른 LDL 목표 수치 설정','생활습관 교정 우선 (식이, 운동, 금연)','목표 미달 시 스타틴 등 약물 치료 시작, 정기 추적'],
    strengthTitle: '운정센트럴365 고지혈증 관리의 특징',
    strengths: ['내과 전문의 직접 진료','경동맥초음파로 동맥경화 평가','개인별 LDL 목표 맞춤 설정','정기 혈액검사 모니터링','식이·운동 생활습관 상담','약물 부작용 관리'],
  },
  '/chronic/thyroid': {
    intro: '갑상선질환은 갑상선 호르몬이 과다(항진증) 또는 부족(저하증)하게 분비되는 질환입니다. 항진증은 체중감소·두근거림·손떨림, 저하증은 체중증가·피로감·부종이 특징입니다. 갑상선결절은 성인의 30~50%에서 발견될 만큼 흔하며, 일부는 갑상선암으로 발전할 수 있어 정기적인 초음파 검사가 중요합니다.',
    symptomTitle: '갑상선질환 의심 증상',
    symptoms: ['항진증: 체중감소, 두근거림, 손떨림, 더위 민감','저하증: 체중증가, 피로, 추위 민감, 변비, 부종','목 앞쪽에 혹이 만져지거나 부어 보임','목소리 변화, 삼킬 때 이물감','불안감, 초조함 또는 우울감','탈모, 피부 건조','갑상선 질환 가족력이 있는 분'],
    processTitle: '갑상선질환 진단 및 치료 과정',
    process: ['갑상선 기능 혈액검사: TSH, Free T4, T3','갑상선 초음파로 결절 유무·크기·형태·석회화 정밀 확인','K-TIRADS 분류에 따라 세침흡인검사(FNA) 결정','항진증: 항갑상선제 처방 / 저하증: 갑상선호르몬 보충','결절: 크기·성상에 따라 추적 관찰 또는 조직검사','정기 혈액검사 + 초음파로 추적 관리'],
    strengthTitle: '운정센트럴365 갑상선 관리의 특징',
    strengths: ['고해상도 갑상선 초음파','혈액검사 동시 시행','세침흡인검사(FNA) 가능','전문의 직접 판독 및 진료','항진·저하·결절 모두 관리','정기 추적 관리'],
  },
  '/chronic/sleep': {
    intro: '수면장애·불면증은 잠들기 어렵거나, 자주 깨거나, 충분히 자도 개운하지 않은 상태가 한 달 이상 지속되는 질환입니다. 만성 불면은 고혈압 위험 2배, 당뇨 위험 1.5배, 우울증 위험 5배 이상 높이며, 낮 동안의 집중력·판단력 저하로 사고 위험도 증가합니다. 원인을 정확히 파악하고 적극 치료해야 합니다.',
    symptomTitle: '수면장애 자가진단 체크리스트',
    symptoms: ['잠들기까지 30분 이상 걸림','한밤중에 2회 이상 깸','새벽에 일찍 깨서 다시 잠들지 못함','자고 일어나도 개운하지 않음','낮 동안 극심한 졸림, 집중력 저하','코골이가 심하고 수면 중 숨이 멈추는 느낌','불안감, 우울감이 수면을 방해','카페인, 알코올, 스마트폰 사용이 잦음'],
    processTitle: '수면장애 진단 및 치료 과정',
    process: ['수면 패턴 상세 문진 (수면일지 활용)','수면장애 설문 평가 (ESS, ISI, STOP-BANG)','기저질환 확인: 혈액검사 (갑상선, 빈혈, 혈당)','수면무호흡 의심 시 수면다원검사 연계','약물 치료: 수면제 최소 용량, 단기간 처방 원칙','비약물 치료: 수면 위생 교육, 인지행동치료(CBT-I)'],
    strengthTitle: '운정센트럴365 수면장애 관리의 특징',
    strengths: ['수면 원인 정밀 분석','수면 설문 + 혈액검사 병행','약물 + 비약물 치료 병행','수면 위생 교육','전문의 직접 진료','수면무호흡 검사 연계'],
  },
  '/chronic/ent': {
    intro: '이비인후과 진료는 코(비과), 귀(이과), 목(인후과) 관련 질환을 전문적으로 진단하고 치료합니다. 알레르기비염은 한국 성인의 약 20~30%가 앓고 있으며, 부비동염(축농증)·중이염·편도선염은 소아부터 성인까지 흔하게 발생합니다. 방치하면 만성화되어 삶의 질이 크게 떨어지므로 정확한 진단과 치료가 중요합니다.',
    symptomTitle: '이비인후과 진료가 필요한 증상',
    symptoms: ['콧물, 코막힘이 2주 이상 지속','재채기, 코·눈 가려움 (알레르기비염)','누런 콧물, 안면부 통증·압박감 (부비동염)','귀 통증, 이명, 청력 저하','목 통증, 삼킬 때 통증, 목소리 변화','코골이, 수면 중 무호흡','어지러움, 균형감각 이상'],
    processTitle: '이비인후과 진단 및 치료 과정',
    process: ['증상 문진 및 이학적 검사 (이경, 비경, 구인두 관찰)','비내시경으로 코·부비동 직접 확인','알레르기 혈액검사 (MAST, 특이 IgE)','청력검사 (필요시)','맞춤 약물 치료: 항히스타민제, 비강스테로이드, 항생제 등','생활 관리 상담: 알레르기 원인 회피법, 코 세척법'],
    strengthTitle: '운정센트럴365 이비인후과의 특징',
    strengths: ['전문의 직접 진료','비내시경 검사 가능','알레르기 원인 혈액검사','맞춤 약물 처방','코 세척법 등 생활 관리 교육','소아·성인 모두 진료 가능'],
  },
  // === 소아청소년과 ===
  '/pediatric/general': {
    intro: '소아 일반진료는 신생아기부터 청소년기까지 감기, 독감, 장염, 요로감염, 열성경련, 수족구, 아토피 등 소아에게 흔한 질환을 전문적으로 진료합니다. 소아는 성인과 약물 용량·진단 기준·증상 표현이 다르기 때문에 소아청소년과 전문의의 정확한 진단이 반드시 필요합니다.',
    symptomTitle: '이런 증상이 있을 때 내원하세요',
    symptoms: ['38.5도 이상 고열이 지속되는 경우','기침, 콧물, 인후통 (감기·독감)','구토, 설사, 복통 (장염·식중독)','발진, 물집, 피부 트러블 (수족구·아토피)','식욕부진, 보채기, 처짐','소변 시 통증, 소변 색 변화 (요로감염)','경련, 의식 저하 (열성경련 — 즉시 내원)'],
    processTitle: '소아 진료 과정',
    process: ['체온·체중·활력징후 측정','증상별 문진 및 청진·이학적 검사','필요시 혈액검사, 소변검사, 인플루엔자·코로나 신속검사','연령·체중에 맞는 정확한 약물 용량 처방','보호자에게 가정 간호법 교육 (해열제 사용, 수분 보충 등)','호전되지 않을 경우 재진 또는 상급병원 연계'],
    strengthTitle: '운정센트럴365 소아진료의 특징',
    strengths: ['소아청소년과 전문의 직접 진료','365일 진료 가능','365일 진료 운영','연령별 맞춤 약물 용량 처방','보호자 가정 간호 교육','신속 진단검사 보유'],
  },
  '/pediatric/vaccine': {
    intro: '소아 예방접종은 감염병을 예방하기 위해 영유아기부터 체계적으로 시행하는 필수 의료행위입니다. 국가필수예방접종(NIP) 17종은 무료이며, 선택접종(로타바이러스, 인플루엔자 등)도 함께 관리합니다. 놓친 접종은 따라잡기 접종이 가능하며, 접종 일정을 체계적으로 관리해 드립니다.',
    symptomTitle: '주요 예방접종 종류',
    symptoms: ['BCG (결핵) — 생후 4주 이내','B형간염 — 출생 직후, 1개월, 6개월','DTaP (디프테리아·파상풍·백일해) — 2·4·6개월','IPV (폴리오) — 2·4·6개월, 만 4~6세','MMR (홍역·볼거리·풍진) — 12~15개월, 만 4~6세','수두, 일본뇌염, A형간염','인플루엔자 (매년), HPV (자궁경부암 예방)','로타바이러스 (선택), 수막구균 (선택)'],
    processTitle: '예방접종 과정',
    process: ['접종 전: 건강상태 확인, 체온 측정, 이전 접종 이력 확인','접종 일정에 맞는 백신 투여 (피하·근육 주사)','접종 후 20~30분 원내 관찰 (이상반응 모니터링)','접종 부위 발적·부종, 미열 등 정상 반응 안내','다음 접종 일정 안내 및 접종 이력 관리','놓친 접종 따라잡기 스케줄 설계'],
    strengthTitle: '운정센트럴365 예방접종의 특징',
    strengths: ['국가필수접종 지정기관','접종 이력 체계적 관리','전문의 직접 상담','당일 접종 가능','놓친 접종 따라잡기','접종 후 이상반응 관리'],
  },
  '/pediatric/ent': {
    intro: '소아이비인후과 진료는 어린이에게 흔한 중이염, 편도선염, 아데노이드비대, 알레르기비염, 부비동염(축농증) 등을 전문적으로 진단하고 치료합니다. 소아는 이관(귀와 코를 연결하는 관)이 짧고 수평이라 중이염이 잦고, 면역 체계가 미성숙하여 반복 감염이 흔합니다. 방치하면 청력 저하, 구호흡으로 인한 안면 발달 이상, 수면 장애, 성장 지연까지 이어질 수 있습니다.',
    symptomTitle: '아이가 이런 행동을 하면 의심하세요',
    symptoms: ['👂 귀를 자주 만지거나 잡아당기는 아이','📺 TV 소리를 크게 틀거나 불러도 반응이 느린 아이','🤧 콧물·코막힘이 2주 이상 지속되는 아이','😮 입을 벌리고 숨 쉬거나 코를 심하게 고는 아이','🍽️ 목 통증으로 음식을 잘 삼키지 못하는 아이','🌡️ 잦은 고열과 함께 귀 통증을 호소하는 아이','🩸 코피가 자주 나는 아이'],
    processTitle: '소아이비인후과 진료 과정',
    process: ['증상 문진 및 이학적 검사 (이경·비경·구인두)','고막 관찰 및 필요시 청력검사','비내시경으로 코·아데노이드 상태 확인','알레르기 혈액검사 (필요시)','연령·체중에 맞는 정확한 약물 처방','재발 방지를 위한 생활 관리 교육 (코 세척, 가습 등)'],
    strengthTitle: '운정센트럴365 소아이비인후과의 특징',
    strengths: ['소아청소년과 전문의 직접 진료','이경·비내시경 검사','알레르기 원인 혈액검사','연령별 맞춤 약물 처방','재발 방지 생활 관리 교육','성인 이비인후과도 함께 진료'],
  },
  '/pediatric/allergy': {
    intro: '소아 알레르기는 아토피피부염, 천식, 알레르기비염, 식품알레르기 등 면역 반응이 과도하게 나타나는 질환입니다. 영유아기 아토피 → 유아기 천식 → 학동기 알레르기비염으로 이어지는 "알레르기 행진(Allergic March)"이 특징적입니다. 원인 항원을 정확히 찾아 회피하고, 연령에 맞는 치료를 시작하는 것이 재발 방지의 핵심입니다.',
    symptomTitle: '소아 알레르기 의심 증상',
    symptoms: ['🔴 피부 가려움, 반복되는 발진, 아토피피부염','🌙 기침이 밤이나 새벽에 심해지는 경우 (천식)','🤧 재채기, 맑은 콧물, 코·눈 가려움 (알레르기비염)','🍽️ 특정 음식 후 두드러기·구토·호흡곤란 (식품알레르기)','👁️ 눈 충혈, 눈 비비기 (알레르기결막염)','🏃 운동 후 기침·쌕쌕거림 (운동유발천식)','👨‍👩‍👧 부모 중 알레르기 질환이 있는 경우'],
    processTitle: '소아 알레르기 진료 과정',
    process: ['증상 문진 및 알레르기 가족력 확인','알레르기 혈액검사: MAST, 총 IgE, 특이 IgE','원인 항원 분석 (집먼지진드기, 꽃가루, 동물, 식품 등)','원인 항원 회피 요법 교육 (환경 관리법)','연령에 맞는 약물 치료 (항히스타민제, 흡입제, 보습제 등)','장기 관리 계획 수립 및 알레르기 행진 예방 교육'],
    strengthTitle: '운정센트럴365 소아알레르기의 특징',
    strengths: ['소아청소년과 전문의 직접 진료','알레르기 혈액검사 (MAST, IgE)','원인 항원 정밀 분석','아토피·천식·비염 통합 관리','환경 관리 및 회피 요법 교육','장기 추적 관리'],
  },
  '/pediatric/night': {
    intro: '365일 진료는 갑작스러운 아이의 고열, 구토, 호흡곤란 등 휴일·응급 상황에 대응하기 위한 서비스입니다. 소아청소년과 전문의가 365일 직접 진료하여, 부모님의 걱정을 덜어드립니다. 응급실 대기 없이 신속하게 진료받을 수 있습니다.',
    symptomTitle: '즉시 내원이 필요한 증상',
    symptoms: ['38.5도 이상 고열이 해열제에도 떨어지지 않을 때','심한 구토·설사로 탈수 증상 (입술 마름, 소변 감소)','호흡이 빠르거나 쌕쌕거리며 숨쉬기 힘들어할 때','열성경련 (경련 후 의식이 돌아왔더라도 반드시 내원)','전신 두드러기, 입술·혀 부종 (알레르기 응급)','심하게 보채며 잠을 자지 못할 때','귀 통증으로 밤새 울 때'],
    processTitle: '365일 진료 이용 안내',
    process: ['진료 시간 확인 후 내원 (예약 불필요)','접수 후 체온·활력징후 측정','소아청소년과 전문의 직접 진료 및 응급 처치','필요시 신속 검사 (인플루엔자, 소변, 혈액)','연령·체중에 맞는 약물 처방','상급병원 이송이 필요한 경우 즉시 연계'],
    strengthTitle: '운정센트럴365 365일 진료의 특징',
    strengths: ['365일 진료 운영','휴일·공휴일 진료','소아청소년과 전문의 직접 진료','응급 처치 가능','신속 진단검사 보유','상급병원 연계 시스템'],
  },
  // === 성장클리닉 ===
  '/growth/intro': {
    intro: '성장클리닉은 아이의 키 성장을 과학적으로 평가하고, 성장 잠재력을 최대한 발휘할 수 있도록 체계적으로 관리하는 프로그램입니다. 키는 유전(23%)보다 환경(77%)의 영향이 더 크며, 성장판이 닫히기 전 골든타임에 관리하는 것이 핵심입니다. 저신장 기준은 같은 성별·연령 100명 중 3번째 이하입니다.',
    symptomTitle: '성장클리닉 대상 — 우리 아이 자가진단',
    symptoms: ['또래보다 키가 눈에 띄게 작은 아이','1년에 4cm 미만으로 성장하는 아이','같은 반에서 앞번호(1~3번)인 아이','부모 키가 작아 유전이 걱정되는 경우','성장이 갑자기 멈추거나 둔화된 아이','2차 성징이 일찍 나타난 아이 (성조숙증 의심)','또래보다 마르거나 편식이 심한 아이'],
    processTitle: '성장클리닉 진료 과정',
    process: ['성장 상태 종합 평가: 키·체중·체성분 측정','성장곡선 확인 — 또래 대비 백분위수 분석','왼손 X-ray로 골연령(뼈 나이) 검사 → 성장판 상태 확인','혈액검사: 성장호르몬, 갑상선, 빈혈, 영양 상태','성장 예측 키 산출 및 전문의 상담','개인별 맞춤 성장 관리 프로그램 설계 (영양·운동·수면)'],
    strengthTitle: '운정센트럴365 성장클리닉의 특징',
    strengths: ['소아청소년과 전문의 직접 진료','골연령 검사 당일 결과 안내','성장곡선 백분위수 분석','맞춤 성장 관리 프로그램','영양·운동·수면 통합 상담','정기 추적 관리 (3~6개월)'],
  },
  '/growth/bone-age': {
    intro: '성장판·골연령검사는 왼손 X-ray를 촬영하여 뼈 나이(골연령)를 측정하고, 실제 나이(역연령)와 비교하여 아이의 남은 성장 가능성을 평가하는 검사입니다. 성장판은 여아 14~15세, 남아 16~17세경에 닫히며, 닫히면 더 이상 키가 자라지 않습니다. 검사 적정 시기는 여아 만 7~8세, 남아 만 9~10세부터입니다.',
    symptomTitle: '골연령검사가 필요한 경우',
    symptoms: ['또래보다 키가 작거나 성장 속도가 느린 아이','2차 성징(유방 발달, 음모 등)이 일찍 나타난 아이','최종 예상 키(성인키)를 확인하고 싶은 경우','성장호르몬 치료를 고려 중인 경우','키가 갑자기 빠르게 자란 후 성장이 멈춘 느낌','골연령이 역연령보다 빠른지 확인하고 싶은 경우'],
    processTitle: '골연령검사 과정',
    process: ['왼손 X-ray 촬영 (1~2분, 통증 없음, 방사선량 매우 적음)','골연령 판독: 뼈 나이와 실제 나이 비교','성장판 상태 확인 — 열림·부분폐쇄·폐쇄 판정','최종 예상키(성인키) 산출','전문의 상담: 성장 예측 및 관리 방향 안내','필요시 혈액검사(성장호르몬, 갑상선 등) 추가'],
    strengthTitle: '운정센트럴365 골연령검사의 특징',
    strengths: ['X-ray 골연령 정밀 분석','전문의 직접 판독','최종 예상키 산출 상담','당일 결과 안내','성장호르몬 검사 연계','정기 추적 검사 가능'],
  },
  '/growth/hormone': {
    intro: '성장호르몬치료는 뇌하수체에서 성장호르몬이 충분히 분비되지 않거나, 키 성장이 현저히 느린 아이에게 성장호르몬을 보충하여 최종 키를 개선하는 치료입니다. 매일 취침 전 피하주사로 투여하며, 1년간 평균 8~12cm 성장 효과를 기대할 수 있습니다. 성장판이 열려 있는 동안에만 효과가 있으므로 적절한 시기에 시작하는 것이 중요합니다.',
    symptomTitle: '성장호르몬 치료 대상',
    symptoms: ['성장호르몬 분비 부족으로 진단된 아이','또래 대비 키가 -2 표준편차(3퍼센타일) 이하','1년 성장 속도가 4cm 미만','터너증후군, 만성 신부전, SGA 등 해당','성장판이 아직 열려 있는 아이','부모 키에 비해 예상 키가 현저히 작은 경우'],
    processTitle: '성장호르몬 치료 과정',
    process: ['성장호르몬 자극검사로 분비량 정밀 확인','골연령 검사 및 최종 예상키 산출','치료 적응증 확인 후 성장호르몬 처방','매일 취침 전 피하주사 (펜타입 — 통증 최소화)','3~6개월 간격 추적: 키 측정, 골연령, 혈액검사','용량 조절 및 부작용 모니터링, 성장판 닫힐 때까지 관리'],
    strengthTitle: '운정센트럴365 성장호르몬치료의 특징',
    strengths: ['성장호르몬 자극검사 시행','전문의 직접 처방 및 관리','안전한 펜타입 주사기 사용','3~6개월 간격 정기 추적','부작용 모니터링','건강보험 급여 기준 안내'],
  },
  '/growth/precocious': {
    intro: '성조숙증은 여아 만 8세 미만, 남아 만 9세 미만에 2차 성징이 나타나는 질환입니다. 최근 10년간 성조숙증 환자가 10배 이상 증가했으며, 여아가 남아보다 5~10배 많습니다. 조기 사춘기는 성장판을 빨리 닫히게 하여 처음에는 키가 빨리 자라지만, 결국 최종 성인키가 줄어들 수 있어 조기 발견과 치료가 매우 중요합니다.',
    symptomTitle: '성조숙증 의심 증상 — 부모가 확인하세요',
    symptoms: ['여아: 8세 전 유방이 발달하기 시작 (가장 흔한 첫 증상)','여아: 초경이 빨리 시작 (10세 이전)','남아: 9세 전 고환이 커지기 시작','급격하게 키가 자란 후 성장이 둔화','또래보다 체모(음모, 겨드랑이 털)가 빨리 나는 경우','여드름이 일찍 발생하는 경우','비만이거나 체중이 과다한 경우 (비만 → 성조숙증 위험↑)'],
    processTitle: '성조숙증 진단 및 치료 과정',
    process: ['2차 성징 발달 정도 확인 (Tanner 단계 평가)','왼손 X-ray 골연령 검사 — 뼈 나이가 실제보다 2년 이상 빠르면 의심','호르몬 혈액검사: LH, FSH, 에스트라디올(여아)/테스토스테론(남아)','GnRH 자극검사 — 확진 검사 (LH 반응 평가)','진성 성조숙증 확진 시: GnRH 작용제 주사 치료 (4주 또는 12주 간격)','치료 중 정기 추적: 키, 골연령, 호르몬 수치 모니터링'],
    strengthTitle: '운정센트럴365 성조숙증 관리의 특징',
    strengths: ['소아청소년과 전문의 직접 진료','골연령 + 호르몬 검사 동시 시행','GnRH 자극검사 가능','맞춤 치료 계획 수립','정기 추적 모니터링','성장호르몬 병합 치료 상담'],
  },
  '/growth/nutrition': {
    intro: '키성장 영양관리는 성장기 아이에게 필수적인 영양소를 평가하고, 키 성장에 최적화된 식단과 영양 보충을 제공하는 프로그램입니다. 성장호르몬은 밤 10시~새벽 2시에 가장 많이 분비되므로 충분한 수면, 적절한 운동과 함께 균형 잡힌 영양 섭취가 성장의 3대 핵심입니다. 소아 비만은 성조숙증 위험을 높여 오히려 최종 키를 줄일 수 있습니다.',
    symptomTitle: '영양관리가 필요한 경우',
    symptoms: ['편식이 심하여 특정 영양소가 부족한 아이','체중 미달(저체중)인 아이','과체중·비만으로 성조숙증이 걱정되는 아이','성장 속도가 또래보다 느린 아이','칼슘·비타민D·철분·아연 부족이 의심되는 경우','우유·유제품을 잘 먹지 않는 아이','인스턴트·패스트푸드 섭취가 잦은 아이'],
    processTitle: '영양관리 과정',
    process: ['영양 상태 혈액검사: 비타민D, 철분, 아연, 칼슘, 알부민 등','체성분 분석 및 체질량지수(BMI) 평가','식습관 설문 및 식이 기록 분석','개인 맞춤 성장 식단 설계 (연령별 권장 칼로리·영양소)','성장에 도움되는 운동 및 수면 습관 교육','정기 추적 검사 (3~6개월 간격) 및 식단 조정'],
    strengthTitle: '운정센트럴365 영양관리의 특징',
    strengths: ['영양 상태 혈액검사','체성분 분석','개인 맞춤 성장 식단','비타민D·철분·아연 보충 안내','운동·수면 생활습관 통합 상담','비만 관리와 성장 동시 관리'],
  },
};

// === 카테고리별 WHY 이미지 ===
const WHY_IMAGES = {
  endoscopy: 'https://cdn.imweb.me/upload/S20260108b9005a7eb2710/533d4e7b9f283.jpeg',
  checkup:   'https://cdn.imweb.me/upload/S20260108b9005a7eb2710/7b6505bf00064.jpeg',
  chronic:   'https://cdn.imweb.me/upload/S20260108b9005a7eb2710/f61502eccdb07.jpeg',
  pediatric: 'https://cdn.imweb.me/upload/S20260108b9005a7eb2710/72eb63d7e5dce.jpeg',
  growth:    'https://cdn.imweb.me/upload/S20260108b9005a7eb2710/30ea6416ea891.jpeg',
  about:     'https://cdn.imweb.me/upload/S20260108b9005a7eb2710/2a354a078f677.jpeg',
};

// === 세부 페이지 ===
function renderSubPage(cat, child) {
  const why = WHY_DATA[child.href];
  const whyImg = WHY_IMAGES[cat.id] || WHY_IMAGES.about;
  const whySection = why ? `
  <section class="why-section">
    <div class="page-container">
      <div class="why-grid">
        <div class="why-image" data-anim>
          <img src="${whyImg}" alt="${child.label}">
          <div class="why-image-overlay">
            <span>${why.overlay}</span>
          </div>
        </div>
        <div class="why-content" data-anim>
          <h2 class="why-title"><em>WHY</em> 운정센트럴365</h2>
          <div class="why-badge" style="--badge-color:${cat.color}">${why.badge}</div>
          <p class="why-desc">${why.desc}</p>
          <div class="why-divider"></div>
          <ul class="why-features">
            ${why.features.map(f => '<li><svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M20 6 9 17l-5-5"/></svg>' + f + '</li>').join('')}
          </ul>
        </div>
      </div>
    </div>
  </section>` : '';

  // 내시경 공통 특별 섹션 (3카드: CV-290, AI, CO2)
  const endoSpecialHtml = fs.readFileSync(path.join(__dirname, 'templates', 'colonoscopy-body.html'), 'utf8');
  const endoSpecialSection = cat.id === 'endoscopy' ? endoSpecialHtml : '';

  // 본문 콘텐츠 — 내시경 스타일 통일
  const content = PAGE_CONTENT[child.href];
  const catImg = WHY_IMAGES[cat.id] || WHY_IMAGES.about;
  const articleHtml = content ? `
    <section class="col-detail"><div class="page-container">
      <div class="col-intro" data-anim>
        <div class="col-intro-img"><img src="${catImg}" alt="${child.label}"></div>
        <div class="col-intro-text">
          <h2>${child.label}</h2>
          <p>${content.intro.replace(/\. /g, '.<br>')}</p>
        </div>
      </div>
      <div class="col-symptoms" data-anim>
        <h2>${content.symptomTitle}</h2>
        <div class="col-check-grid" style="grid-template-columns:repeat(2,1fr)">
          ${content.symptoms.map(s => '<label class="col-check"><span class="col-check-box"></span>' + s + '</label>').join('')}
        </div>
      </div>
      <div class="gen-simple-list" data-anim>
        <h2>${content.processTitle}</h2>
        <ul class="gen-bullet">
          ${content.process.map(p => '<li>' + p + '</li>').join('')}
        </ul>
      </div>
      <div class="gen-simple-list" data-anim>
        <h2>${content.strengthTitle}</h2>
        <ul class="gen-check">
          ${content.strengths.map(s => '<li>' + s + '</li>').join('')}
        </ul>
      </div>
    </div></section>` : `
    <section class="col-detail"><div class="page-container">
      <div class="article-intro" data-anim>
        <h2>${child.label}</h2>
        <p>${child.desc}</p>
      </div>
    </div></section>`;

  const body = `
  <section class="page-hero page-hero-sm" style="--hero-color:${cat.color}">
    <div class="page-hero-inner" data-anim>
      <h1>${child.label}</h1>
      <p>${child.desc}</p>
    </div>
  </section>
  ${whySection}
  ${endoSpecialSection}
  ${articleHtml}
  <section class="page-section">
    <div class="page-container page-narrow">
      <div class="page-cta" data-anim>
        <h3>진료 예약 및 문의</h3>
        <p class="cta-phone">준비중</p>
        <p class="cta-notice">전화번호는 개원 시 안내드리겠습니다.</p>
        <a href="https://pf.kakao.com/_xevPpn" target="_blank" class="cta-kakao-btn">
          <span>💬</span> 카카오톡 상담하기
        </a>
      </div>
    </div>
  </section>`;

  return renderPage({
    title: child.label,
    activeCategoryId: cat.id,
    bodyContent: body,
    extraCss: '<link rel="stylesheet" href="/css/pages.css"><link rel="stylesheet" href="/css/why-section.css"><link rel="stylesheet" href="/css/article.css"><link rel="stylesheet" href="/css/colonoscopy.css">',
    extraJs: '<script src="/js/page-anim.js"></script>'
  });
}

function getCategoryDesc(id) {
  const descs = {
    about: '운정센트럴365의원을 소개합니다.',
    endoscopy: '정확한 진단을 위한 내시경 검사 센터입니다.',
    checkup: '체계적인 건강검진 프로그램을 제공합니다.',
    chronic: '꾸준한 관리가 필요한 만성질환을 전문적으로 진료합니다.',
    pediatric: '아이들의 건강한 성장을 위한 소아청소년과 전문 진료입니다.',
    growth: '우리 아이의 키 성장을 과학적으로 관리합니다.',
  };
  return descs[id] || '';
}

// === 라우트 등록 ===

// 메인 페이지 (기존 유지)
app.get('/', (req, res) => {
  // 메인 페이지 헤더를 새 메가메뉴로 교체하여 전송
  let html = fs.readFileSync(path.join(__dirname, 'public', 'index.html'), 'utf8');
  // 기존 헤더 교체
  html = html.replace(
    /<!-- 헤더 \/ 네비게이션 -->[\s\S]*?<\/header>/,
    renderHeader(null)
  );
  // 메가메뉴 CSS/JS 삽입
  html = html.replace('</head>', '  <link rel="stylesheet" href="/css/header-mega.css">\n</head>');
  html = html.replace('</body>', '  <script src="/js/header-mega.js"></script>\n</body>');
  res.send(html);
});

// 기존 /philosophy → /about/philosophy 로 리다이렉트
app.get('/philosophy', (req, res) => res.redirect(301, '/about/doctors'));

// /about/philosophy 는 기존 philosophy.html 사용하되 헤더 교체
app.get('/about/philosophy', (req, res) => {
  let html = fs.readFileSync(path.join(__dirname, 'public', 'philosophy.html'), 'utf8');
  // 기존 헤더 교체
  html = html.replace(
    /<!-- 헤더[\s\S]*?<\/header>/,
    renderHeader('about')
  );
  if (!html.includes('header-mega.css')) {
    html = html.replace('</head>', '  <link rel="stylesheet" href="/css/header-mega.css">\n</head>');
  }
  if (!html.includes('header-mega.js')) {
    html = html.replace(/<script src="\/js\/philosophy\.js"><\/script>/,
      '<script src="/js/header-mega.js"></script>\n  <script src="/js/philosophy.js"></script>');
  }
  res.send(html);
});

// /about/doctors 의료진 소개 전용 페이지
app.get('/about/doctors', (req, res) => {
  const cat = NAVIGATION.find(n => n.id === 'about');
  const child = cat.children.find(c => c.href === '/about/doctors');
  const body = `
  <section class="page-hero page-hero-sm" style="--hero-color:${cat.color}">
    <div class="page-hero-inner" data-anim>
      <h1>의료진 소개</h1>
      <p>풍부한 임상 경험을 갖춘 전문의가 진료합니다.</p>
    </div>
  </section>
  <section class="page-section">
    <div class="page-container">
      <div class="breadcrumb" data-anim>
        <a href="/">홈</a> <span>›</span>
        <a href="/about">병원소개</a> <span>›</span>
        <span class="current">의료진 소개</span>
      </div>
      <div class="doctors-page-grid" data-anim>
        <div class="doctor-page-card">
          <div class="doctor-page-photo" style="background:linear-gradient(135deg,#6B2D8B,#9B59B6)">
            <span>대표원장</span>
          </div>
          <div class="doctor-page-info">
            <span class="doctor-page-tag">내과 전문의 · 소화기내과 세부전문의</span>
            <h2>전성준 <small>대표원장</small></h2>
            <ul class="doctor-page-career">
              <li>순천향대학교 의과대학 졸업</li>
              <li>순천향대학교 대학원 내과학 석사</li>
              <li>순천향대학교 부천병원 인턴 및 내과 전공의 수료</li>
              <li>대한민국 해군 내과 군의관</li>
              <li>인하대학교병원 소화기내과 전임의 수료</li>
              <li>전) 뉴성민병원 내과 과장</li>
              <li>전) 365온메디의원 부원장</li>
            </ul>
          </div>
        </div>
        <div class="doctor-page-card">
          <div class="doctor-page-photo" style="background:linear-gradient(135deg,#9B59B6,#C084FC)">
            <span>원장</span>
          </div>
          <div class="doctor-page-info">
            <span class="doctor-page-tag">소아청소년과 전문의</span>
            <h2>박유나 <small>원장</small></h2>
            <ul class="doctor-page-career">
              <li>순천향대학교 의과대학 졸업</li>
              <li>순천향대학교 대학원 소아청소년과학 석사</li>
              <li>순천향대학교 부천병원 인턴 및 소아청소년과 전공의 수료</li>
              <li>전) 나우메디365의원 원장</li>
              <li>전) 김포아이제일병원 원장</li>
              <li>전) 인천백병원 소아청소년과 과장</li>
              <li>현) 은평성모병원 소아청소년과 진료교수</li>
            </ul>
          </div>
        </div>
      </div>
      <div class="page-cta" data-anim>
        <h3>진료 예약 및 문의</h3>
        <p class="cta-phone">준비중</p>
        <p class="cta-notice">전화번호는 개원 시 안내드리겠습니다.</p>
        <a href="https://pf.kakao.com/_xevPpn" target="_blank" class="cta-kakao-btn">
          <span>💬</span> 카카오톡 상담하기
        </a>
      </div>
    </div>
  </section>`;

  res.send(renderPage({
    title: '의료진 소개',
    activeCategoryId: 'about',
    bodyContent: body,
    extraCss: '<link rel="stylesheet" href="/css/pages.css"><link rel="stylesheet" href="/css/doctors-page.css">',
    extraJs: '<script src="/js/page-anim.js"></script>'
  }));
});

// /about/facility 시설 안내 전용 페이지
app.get('/about/facility', (req, res) => {
  const body = `
  <section class="page-hero page-hero-sm" style="--hero-color:#5F5E5A">
    <div class="page-hero-inner" data-anim>
      <h1>시설 안내</h1>
      <p>최신 장비와 쾌적한 진료 환경을 갖추고 있습니다.</p>
    </div>
  </section>
  <section class="page-section">
    <div class="page-container">
      <div class="breadcrumb" data-anim>
        <a href="/">홈</a> <span>›</span>
        <a href="/about">병원소개</a> <span>›</span>
        <span class="current">시설 안내</span>
      </div>

      <!-- 원내 사진 갤러리 -->
      <div class="facility-block" data-anim>
        <h2 class="facility-heading">원내 시설</h2>
        <p class="facility-desc">운정센트럴365의원은 환자분들이 편안하게 진료받을 수 있도록<br>쾌적하고 청결한 환경을 갖추고 있습니다.</p>
      </div>
      <div class="facility-grid facility-grid-main" data-anim>
        <div class="facility-img facility-img-wide">
          <img src="https://cdn.imweb.me/upload/S20260108b9005a7eb2710/533d4e7b9f283.jpeg" alt="원내 시설 1">
        </div>
        <div class="facility-img">
          <img src="https://cdn.imweb.me/upload/S20260108b9005a7eb2710/2a354a078f677.jpeg" alt="원내 시설 2">
        </div>
        <div class="facility-img">
          <img src="https://cdn.imweb.me/upload/S20260108b9005a7eb2710/049c24abf55ff.jpeg" alt="원내 시설 3">
        </div>
        <div class="facility-img">
          <img src="https://cdn.imweb.me/upload/S20260108b9005a7eb2710/7b6505bf00064.jpeg" alt="원내 시설 4">
        </div>
        <div class="facility-img">
          <img src="https://cdn.imweb.me/upload/S20260108b9005a7eb2710/72eb63d7e5dce.jpeg" alt="원내 시설 5">
        </div>
        <div class="facility-img">
          <img src="https://cdn.imweb.me/upload/S20260108b9005a7eb2710/30ea6416ea891.jpeg" alt="원내 시설 6">
        </div>
        <div class="facility-img">
          <img src="https://cdn.imweb.me/upload/S20260108b9005a7eb2710/3809a7e6a582c.jpeg" alt="원내 시설 7">
        </div>
      </div>

      <!-- 상담실 · 수액실 -->
      <div class="facility-rooms" data-anim>
        <div class="facility-room-card">
          <div class="facility-room-img">
            <img src="https://cdn.imweb.me/upload/S20260108b9005a7eb2710/f61502eccdb07.jpeg" alt="상담실">
          </div>
          <div class="facility-room-info">
            <h3>상담실</h3>
            <p>프라이버시가 보호되는 독립된 공간에서<br>편안하게 진료 상담을 받으실 수 있습니다.</p>
          </div>
        </div>
        <div class="facility-room-card">
          <div class="facility-room-img">
            <img src="https://cdn.imweb.me/upload/S20260108b9005a7eb2710/45190b4121886.jpeg" alt="수액실">
          </div>
          <div class="facility-room-info">
            <h3>수액실</h3>
            <p>편안한 리클라이너 체어에서<br>수액 치료를 받으실 수 있습니다.</p>
          </div>
        </div>
      </div>

      <!-- CTA -->
      <div class="page-cta" data-anim>
        <h3>진료 예약 및 문의</h3>
        <p class="cta-phone">준비중</p>
        <p class="cta-notice">전화번호는 개원 시 안내드리겠습니다.</p>
        <a href="https://pf.kakao.com/_xevPpn" target="_blank" class="cta-kakao-btn">
          <span>💬</span> 카카오톡 상담하기
        </a>
      </div>
    </div>
  </section>`;

  res.send(renderPage({
    title: '시설 안내',
    activeCategoryId: 'about',
    bodyContent: body,
    extraCss: '<link rel="stylesheet" href="/css/pages.css"><link rel="stylesheet" href="/css/facility-page.css">',
    extraJs: '<script src="/js/page-anim.js"></script>'
  }));
});

// /about/directions 오시는 길 전용 페이지
app.get('/about/directions', (req, res) => {
  const body = `
  <section class="page-hero page-hero-sm" style="--hero-color:#5F5E5A">
    <div class="page-hero-inner" data-anim>
      <h1>오시는 길</h1>
      <p>GTX-A 운정중앙역 도보 접근 가능</p>
    </div>
  </section>
  <section class="page-section">
    <div class="page-container">
      <div class="breadcrumb" data-anim>
        <a href="/">홈</a> <span>›</span>
        <a href="/about">병원소개</a> <span>›</span>
        <span class="current">오시는 길</span>
      </div>
      <div class="directions-content" data-anim>
        <div class="directions-info">
          <div class="directions-address">
            <h2>운정센트럴365의원</h2>
            <p class="directions-addr-text">경기도 파주시 동패동 2277-1<br>정석프라자 3층</p>
          </div>
          <div class="directions-detail">
            <div class="directions-item">
              <strong>🚇 지하철</strong>
              <p>GTX-A 운정중앙역 도보 이용 가능</p>
            </div>
            <div class="directions-item">
              <strong>🅿️ 주차</strong>
              <p>건물 내 주차 가능</p>
            </div>
          </div>
          <div class="directions-cta">
            <h4>진료 예약 · 문의</h4>
            <a href="https://pf.kakao.com/_xevPpn" target="_blank" class="cta-kakao-btn">
              <span>💬</span> 카카오톡 채널로 상담하기
            </a>
          </div>
        </div>
        <div class="directions-map">
          <div id="daumRoughmapContainer1775306768805" class="root_daum_roughmap root_daum_roughmap_landing"></div>
        </div>
      </div>
    </div>
  </section>`;

  res.send(renderPage({
    title: '오시는 길',
    activeCategoryId: 'about',
    bodyContent: body,
    extraCss: '<link rel="stylesheet" href="/css/pages.css"><link rel="stylesheet" href="/css/directions-page.css">',
    extraJs: '<script src="/js/page-anim.js"></script><script charset="UTF-8" src="https://ssl.daumcdn.net/dmaps/map_js_init/roughmapLoader.js"></script><script charset="UTF-8">new daum.roughmap.Lander({"timestamp":"1775306768805","key":"kid3bztjew3","mapWidth":"640","mapHeight":"360"}).render();</script>'
  }));
});

// /endoscopy/gastroscopy 위내시경 전용 페이지
app.get('/endoscopy/gastroscopy', (req, res) => {
  const cat = NAVIGATION.find(n => n.id === 'endoscopy');
  const child = cat.children.find(c => c.href === '/endoscopy/gastroscopy');
  const why = WHY_DATA[child.href];
  const whyImg = WHY_IMAGES[cat.id];
  const endoSpecialHtml = fs.readFileSync(path.join(__dirname, 'templates', 'colonoscopy-body.html'), 'utf8');

  const body = `
  <section class="page-hero page-hero-sm" style="--hero-color:${cat.color}">
    <div class="page-hero-inner" data-anim><h1>${child.label}</h1><p>${child.desc}</p></div>
  </section>
  <section class="why-section">
    <div class="page-container">
      <div class="why-grid">
        <div class="why-image" data-anim><img src="${whyImg}" alt="${child.label}"><div class="why-image-overlay"><span>${why.overlay}</span></div></div>
        <div class="why-content" data-anim>
          <h2 class="why-title"><em>WHY</em> 운정센트럴365</h2>
          <div class="why-badge" style="--badge-color:${cat.color}">${why.badge}</div>
          <p class="why-desc">${why.desc}</p>
          <div class="why-divider"></div>
          <ul class="why-features">${why.features.map(f => '<li><svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M20 6 9 17l-5-5"/></svg>' + f + '</li>').join('')}</ul>
        </div>
      </div>
    </div>
  </section>
  ${endoSpecialHtml}

  <!-- 위내시경 상세 콘텐츠 -->
  <section class="col-detail">
    <div class="page-container">

      <!-- 위내시경 검사란 -->
      <div class="col-intro" data-anim>
        <div class="col-intro-img"><img src="https://cdn.imweb.me/upload/S20260108b9005a7eb2710/533d4e7b9f283.jpeg" alt="위내시경"></div>
        <div class="col-intro-text">
          <h2>위내시경 검사란?</h2>
          <p>위내시경은 입안으로 내시경을 넣어 식도, 위, 십이지장까지 관찰하는 검사입니다. 식도, 위, 십이지장의 염증, 궤양, 암까지 확인이 가능하며 검사시간은 3~5분 정도 소요됩니다.</p>
        </div>
      </div>

      <!-- 증상 체크 -->
      <div class="col-symptoms" data-anim>
        <h2>아래의 증상이 있다면 <span>위내시경</span>이 필요합니다</h2>
        <div class="col-check-grid">
          <label class="col-check"><span class="col-check-box"></span>속쓰림</label>
          <label class="col-check"><span class="col-check-box"></span>이물감</label>
          <label class="col-check"><span class="col-check-box"></span>상복부 불편함</label>
          <label class="col-check"><span class="col-check-box"></span>신물 역류</label>
          <label class="col-check"><span class="col-check-box"></span>소화불량</label>
          <label class="col-check"><span class="col-check-box"></span>체중감소</label>
          <label class="col-check"><span class="col-check-box"></span>혈변</label>
          <label class="col-check"><span class="col-check-box"></span>빈혈</label>
          <label class="col-check"><span class="col-check-box"></span>연하곤란</label>
        </div>
      </div>

      <!-- 진단 가능 질환 -->
      <div class="col-diseases" data-anim>
        <h2>위내시경으로 진단 가능한 질환들</h2>
        <div class="col-disease-grid">
          <div class="col-disease-card"><h4>조기 위암</h4><p>위 점막층에 국한된 초기 단계의 위암</p></div>
          <div class="col-disease-card"><h4>진행성 위암</h4><p>근육층 이상으로 침범한 단계의 위암</p></div>
          <div class="col-disease-card"><h4>식도암</h4><p>식도 점막에서 발생하는 악성 종양</p></div>
          <div class="col-disease-card"><h4>위용종</h4><p>위 점막이 비정상적으로 자란 혹</p></div>
          <div class="col-disease-card"><h4>위궤양</h4><p>위 점막이 손상되어 패인 상처</p></div>
          <div class="col-disease-card"><h4>위염</h4><p>급성·만성·위축성 위염</p></div>
        </div>
      </div>

      <!-- 검사 후 주의사항 -->
      <div class="col-after" data-anim>
        <h2>위내시경 후 주의사항</h2>
        <div class="col-after-sub">검사 후 안전한 회복을 위해 꼭 지켜주세요.</div>
        <ul class="col-bullet-list">
          <li>목 마취가 풀린 후 통증이나 더부룩함이 있을 수 있습니다. 일시적 현상이니 걱정마세요.</li>
          <li>수면내시경 후에는 <strong>충분히 휴식</strong> 후 귀가하시고, 당일 운전은 삼가세요.</li>
          <li>검사 후 <strong>30분~1시간</strong> 후 물부터 드시고, 첫 식사는 죽을 권장합니다.</li>
          <li>당일 뜨겁거나 자극적인 음식, <strong>금연·금주</strong>를 권유드립니다.</li>
          <li>조직검사 결과는 약 <strong>1주일 후</strong> 확인 가능합니다.</li>
          <li>조직검사·용종절제 후 사우나·운동·음주는 <strong>1주일간</strong> 삼가세요.</li>
        </ul>
      </div>

      <!-- 예방법 -->
      <div class="col-prevent" data-anim>
        <h2>위장질환 예방법</h2>
        <div class="col-prevent-row">
          <div class="col-prev-item"><div class="col-prev-num">1</div><strong>주기적인 위내시경</strong><p>40세 이상 2년마다</p></div>
          <div class="col-prev-item"><div class="col-prev-num">2</div><strong>금연과 금주</strong><p>위 점막 보호</p></div>
          <div class="col-prev-item"><div class="col-prev-num">3</div><strong>스트레스 관리</strong><p>규칙적 생활</p></div>
          <div class="col-prev-item"><div class="col-prev-num">4</div><strong>규칙적인 식사</strong><p>과식·폭식 금지</p></div>
          <div class="col-prev-item"><div class="col-prev-num">5</div><strong>자극적 음식 자제</strong><p>맵고 짠 음식 줄이기</p></div>
        </div>
      </div>

      <!-- CTA -->
      <div class="page-cta" data-anim>
        <h3>진료 예약 및 문의</h3>
        <p class="cta-phone">준비중</p>
        <p class="cta-notice">전화번호는 개원 시 안내드리겠습니다.</p>
        <a href="https://pf.kakao.com/_xevPpn" target="_blank" class="cta-kakao-btn"><span>💬</span> 카카오톡 상담하기</a>
      </div>
    </div>
  </section>`;

  res.send(renderPage({
    title: '위내시경',
    activeCategoryId: 'endoscopy',
    bodyContent: body,
    extraCss: '<link rel="stylesheet" href="/css/pages.css"><link rel="stylesheet" href="/css/why-section.css"><link rel="stylesheet" href="/css/colonoscopy.css"><link rel="stylesheet" href="/css/gastroscopy.css">',
    extraJs: '<script src="/js/page-anim.js"></script><script src="https://cdn.jsdelivr.net/npm/chart.js@4"></script><script src="/js/gastroscopy-chart.js"></script>'
  }));
});

// === 소아 알레르기 전용 라우트 ===
app.get('/pediatric/allergy', (req, res) => {
  const cat = NAVIGATION.find(n => n.id === 'pediatric');
  const child = cat.children.find(c => c.href === '/pediatric/allergy');
  const why = WHY_DATA['/pediatric/allergy'];
  const whyImg = WHY_IMAGES[cat.id];
  const detailHtml = fs.readFileSync(path.join(__dirname, 'templates', 'pediatric-allergy.html'), 'utf8');
  const body = `
  <section class="page-hero page-hero-sm" style="--hero-color:${cat.color}">
    <div class="page-hero-inner" data-anim><h1>${child.label}</h1><p>${child.desc}</p></div>
  </section>
  <section class="why-section"><div class="page-container"><div class="why-grid">
    <div class="why-image" data-anim><img src="${whyImg}" alt="${child.label}"><div class="why-image-overlay"><span>${why.overlay}</span></div></div>
    <div class="why-content" data-anim>
      <h2 class="why-title"><em>WHY</em> 운정센트럴365</h2>
      <div class="why-badge" style="--badge-color:${cat.color}">${why.badge}</div>
      <p class="why-desc">${why.desc}</p>
      <div class="why-divider"></div>
      <ul class="why-features">${why.features.map(f => '<li><svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M20 6 9 17l-5-5"/></svg>' + f + '</li>').join('')}</ul>
    </div>
  </div></div></section>
  ${detailHtml}
  <section class="page-section"><div class="page-container page-narrow">
    <div class="page-cta" data-anim><h3>진료 예약 및 문의</h3><p class="cta-phone">준비중</p><p class="cta-notice">전화번호는 개원 시 안내드리겠습니다.</p><a href="https://pf.kakao.com/_xevPpn" target="_blank" class="cta-kakao-btn"><span>💬</span> 카카오톡 상담하기</a></div>
  </div></section>`;
  res.send(renderPage({
    title: child.label, activeCategoryId: 'pediatric', bodyContent: body,
    extraCss: '<link rel="stylesheet" href="/css/pages.css"><link rel="stylesheet" href="/css/why-section.css"><link rel="stylesheet" href="/css/colonoscopy.css"><link rel="stylesheet" href="/css/checkup.css">',
    extraJs: '<script src="/js/page-anim.js"></script>'
  }));
});

// === 소아 예방접종 전용 라우트 ===
app.get('/pediatric/vaccine', (req, res) => {
  const cat = NAVIGATION.find(n => n.id === 'pediatric');
  const child = cat.children.find(c => c.href === '/pediatric/vaccine');
  const why = WHY_DATA['/pediatric/vaccine'];
  const whyImg = WHY_IMAGES[cat.id];
  const detailHtml = fs.readFileSync(path.join(__dirname, 'templates', 'pediatric-vaccine.html'), 'utf8');
  const body = `
  <section class="page-hero page-hero-sm" style="--hero-color:${cat.color}">
    <div class="page-hero-inner" data-anim><h1>${child.label}</h1><p>${child.desc}</p></div>
  </section>
  <section class="why-section"><div class="page-container"><div class="why-grid">
    <div class="why-image" data-anim><img src="${whyImg}" alt="${child.label}"><div class="why-image-overlay"><span>${why.overlay}</span></div></div>
    <div class="why-content" data-anim>
      <h2 class="why-title"><em>WHY</em> 운정센트럴365</h2>
      <div class="why-badge" style="--badge-color:${cat.color}">${why.badge}</div>
      <p class="why-desc">${why.desc}</p>
      <div class="why-divider"></div>
      <ul class="why-features">${why.features.map(f => '<li><svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M20 6 9 17l-5-5"/></svg>' + f + '</li>').join('')}</ul>
    </div>
  </div></div></section>
  ${detailHtml}
  <section class="page-section"><div class="page-container page-narrow">
    <div class="page-cta" data-anim><h3>진료 예약 및 문의</h3><p class="cta-phone">준비중</p><p class="cta-notice">전화번호는 개원 시 안내드리겠습니다.</p><a href="https://pf.kakao.com/_xevPpn" target="_blank" class="cta-kakao-btn"><span>💬</span> 카카오톡 상담하기</a></div>
  </div></section>`;
  res.send(renderPage({
    title: child.label, activeCategoryId: 'pediatric', bodyContent: body,
    extraCss: '<link rel="stylesheet" href="/css/pages.css"><link rel="stylesheet" href="/css/why-section.css"><link rel="stylesheet" href="/css/colonoscopy.css"><link rel="stylesheet" href="/css/checkup.css">',
    extraJs: '<script src="/js/page-anim.js"></script>'
  }));
});

// === 성장클리닉 전용 라우트 ===
function growthDetailPage(href, templateFile) {
  const cat = NAVIGATION.find(n => n.id === 'growth');
  const child = cat.children.find(c => c.href === href);
  const why = WHY_DATA[href];
  const whyImg = WHY_IMAGES[cat.id];
  const detailHtml = fs.readFileSync(path.join(__dirname, 'templates', templateFile), 'utf8');
  const body = `
  <section class="page-hero page-hero-sm" style="--hero-color:${cat.color}">
    <div class="page-hero-inner" data-anim><h1>${child.label}</h1><p>${child.desc}</p></div>
  </section>
  <section class="why-section"><div class="page-container"><div class="why-grid">
    <div class="why-image" data-anim><img src="${whyImg}" alt="${child.label}"><div class="why-image-overlay"><span>${why.overlay}</span></div></div>
    <div class="why-content" data-anim>
      <h2 class="why-title"><em>WHY</em> 운정센트럴365</h2>
      <div class="why-badge" style="--badge-color:${cat.color}">${why.badge}</div>
      <p class="why-desc">${why.desc}</p>
      <div class="why-divider"></div>
      <ul class="why-features">${why.features.map(f => '<li><svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M20 6 9 17l-5-5"/></svg>' + f + '</li>').join('')}</ul>
    </div>
  </div></div></section>
  ${detailHtml}
  <section class="page-section"><div class="page-container page-narrow">
    <div class="page-cta" data-anim><h3>진료 예약 및 문의</h3><p class="cta-phone">준비중</p><p class="cta-notice">전화번호는 개원 시 안내드리겠습니다.</p><a href="https://pf.kakao.com/_xevPpn" target="_blank" class="cta-kakao-btn"><span>💬</span> 카카오톡 상담하기</a></div>
  </div></section>`;
  return renderPage({
    title: child.label, activeCategoryId: 'growth', bodyContent: body,
    extraCss: '<link rel="stylesheet" href="/css/pages.css"><link rel="stylesheet" href="/css/why-section.css"><link rel="stylesheet" href="/css/colonoscopy.css"><link rel="stylesheet" href="/css/checkup.css"><link rel="stylesheet" href="/css/growth.css"><link rel="stylesheet" href="/css/philosophy.css">',
    extraJs: '<script src="/js/page-anim.js"></script><script src="/js/philosophy.js"></script>'
  });
}

app.get('/growth/intro', (req, res) => res.send(growthDetailPage('/growth/intro', 'growth-intro.html')));
app.get('/growth/bone-age', (req, res) => res.send(growthDetailPage('/growth/bone-age', 'growth-bone-age.html')));
app.get('/growth/hormone', (req, res) => res.send(growthDetailPage('/growth/hormone', 'growth-hormone.html')));
app.get('/growth/precocious', (req, res) => res.send(growthDetailPage('/growth/precocious', 'growth-precocious.html')));
app.get('/growth/nutrition', (req, res) => res.send(growthDetailPage('/growth/nutrition', 'growth-nutrition.html')));

// === 건강검진 전용 라우트 헬퍼 ===
function checkupDetailPage(href, templateFile, extraJs) {
  const cat = NAVIGATION.find(n => n.id === 'checkup');
  const child = cat.children.find(c => c.href === href);
  const why = WHY_DATA[href];
  const whyImg = WHY_IMAGES[cat.id];
  const detailHtml = fs.readFileSync(path.join(__dirname, 'templates', templateFile), 'utf8');
  const body = `
  <section class="page-hero page-hero-sm" style="--hero-color:${cat.color}">
    <div class="page-hero-inner" data-anim><h1>${child.label}</h1><p>${child.desc}</p></div>
  </section>
  <section class="why-section"><div class="page-container"><div class="why-grid">
    <div class="why-image" data-anim><img src="${whyImg}" alt="${child.label}"><div class="why-image-overlay"><span>${why.overlay}</span></div></div>
    <div class="why-content" data-anim>
      <h2 class="why-title"><em>WHY</em> 운정센트럴365</h2>
      <div class="why-badge" style="--badge-color:${cat.color}">${why.badge}</div>
      <p class="why-desc">${why.desc}</p>
      <div class="why-divider"></div>
      <ul class="why-features">${why.features.map(f => '<li><svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M20 6 9 17l-5-5"/></svg>' + f + '</li>').join('')}</ul>
    </div>
  </div></div></section>
  ${detailHtml}
  <section class="page-section"><div class="page-container page-narrow">
    <div class="page-cta" data-anim><h3>진료 예약 및 문의</h3><p class="cta-phone">준비중</p><p class="cta-notice">전화번호는 개원 시 안내드리겠습니다.</p><a href="https://pf.kakao.com/_xevPpn" target="_blank" class="cta-kakao-btn"><span>💬</span> 카카오톡 상담하기</a></div>
  </div></section>`;
  return renderPage({
    title: child.label, activeCategoryId: 'checkup', bodyContent: body,
    extraCss: '<link rel="stylesheet" href="/css/pages.css"><link rel="stylesheet" href="/css/why-section.css"><link rel="stylesheet" href="/css/colonoscopy.css"><link rel="stylesheet" href="/css/checkup.css">',
    extraJs: '<script src="/js/page-anim.js"></script>' + (extraJs || '')
  });
}

app.get('/checkup/general', (req, res) => res.send(checkupDetailPage('/checkup/general', 'checkup-general.html')));
app.get('/checkup/cancer', (req, res) => res.send(checkupDetailPage('/checkup/cancer', 'checkup-cancer.html', '<script src="https://cdn.jsdelivr.net/npm/chart.js@4"></script><script src="/js/cancer-chart.js"></script>')));
app.get('/checkup/ultrasound', (req, res) => res.send(checkupDetailPage('/checkup/ultrasound', 'checkup-ultrasound.html')));

// === 내시경 세부 전용 라우트 헬퍼 ===
function endoDetailPage(href, detailHtml) {
  const cat = NAVIGATION.find(n => n.id === 'endoscopy');
  const child = cat.children.find(c => c.href === href);
  const why = WHY_DATA[href];
  const whyImg = WHY_IMAGES[cat.id];
  const endoSpecialHtml = fs.readFileSync(path.join(__dirname, 'templates', 'colonoscopy-body.html'), 'utf8');
  return `
  <section class="page-hero page-hero-sm" style="--hero-color:${cat.color}">
    <div class="page-hero-inner" data-anim><h1>${child.label}</h1><p>${child.desc}</p></div>
  </section>
  <section class="why-section">
    <div class="page-container">
      <div class="why-grid">
        <div class="why-image" data-anim><img src="${whyImg}" alt="${child.label}"><div class="why-image-overlay"><span>${why.overlay}</span></div></div>
        <div class="why-content" data-anim>
          <h2 class="why-title"><em>WHY</em> 운정센트럴365</h2>
          <div class="why-badge" style="--badge-color:${cat.color}">${why.badge}</div>
          <p class="why-desc">${why.desc}</p>
          <div class="why-divider"></div>
          <ul class="why-features">${why.features.map(f => '<li><svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M20 6 9 17l-5-5"/></svg>' + f + '</li>').join('')}</ul>
        </div>
      </div>
    </div>
  </section>
  ${endoSpecialHtml}
  <section class="col-detail"><div class="page-container">
  ${detailHtml}
  <div class="page-cta" data-anim><h3>진료 예약 및 문의</h3><p class="cta-phone">준비중</p><p class="cta-notice">전화번호는 개원 시 안내드리겠습니다.</p><a href="https://pf.kakao.com/_xevPpn" target="_blank" class="cta-kakao-btn"><span>💬</span> 카카오톡 상담하기</a></div>
  </div></section>`;
}

// /endoscopy/sedation 수면내시경 전용 페이지
app.get('/endoscopy/sedation', (req, res) => {
  const detail = `
    <div class="col-intro" data-anim>
      <div class="col-intro-img"><img src="https://cdn.imweb.me/upload/S20260108b9005a7eb2710/7b6505bf00064.jpeg" alt="수면내시경"></div>
      <div class="col-intro-text">
        <h2>수면내시경이란?</h2>
        <p>수면내시경은 진정제를 투여해 환자가 편안하게 잠든 상태에서 시행하는 내시경 검사입니다. 구역감과 불편함 없이 위·대장을 모두 검사할 수 있어, 내시경에 대한 공포가 있는 분께 특히 권장합니다.</p>
      </div>
    </div>

    <div class="col-symptoms" data-anim>
      <h2>이런 분께 <span>수면내시경</span>을 권장합니다</h2>
      <div class="col-check-grid">
        <label class="col-check"><span class="col-check-box"></span>내시경이 두려운 분</label>
        <label class="col-check"><span class="col-check-box"></span>구역감이 심한 분</label>
        <label class="col-check"><span class="col-check-box"></span>이전 검사가 힘들었던 분</label>
        <label class="col-check"><span class="col-check-box"></span>위·대장 동시 검사</label>
        <label class="col-check"><span class="col-check-box"></span>편안한 검사를 원하는 분</label>
        <label class="col-check"><span class="col-check-box"></span>고령 환자</label>
      </div>
    </div>

    <div class="col-reasons" data-anim>
      <h2>수면내시경 검사 과정</h2>
      <ol class="col-reason-list">
        <li>검사 전 <strong>활력징후 확인</strong> 및 혈압·산소포화도 측정</li>
        <li>정맥 주사를 통해 <strong>진정제 투여</strong> — 1~2분 내 수면 유도</li>
        <li>수면 상태에서 <strong>내시경 검사 시행</strong> (위·대장 동시 가능)</li>
        <li>검사 완료 후 <strong>회복실에서 20~30분 휴식</strong> 후 결과 설명</li>
      </ol>
    </div>

    <div class="col-cycle" data-anim>
      <h2>수면내시경, 안전한가요?</h2>
      <div class="cycle-cards">
        <div class="cycle-card">
          <div class="cycle-card-who">진정제</div>
          <div class="cycle-card-period">안전</div>
          <p>소량의 진정제로 깊은 수면이 아닌 가벼운 진정 상태</p>
        </div>
        <div class="cycle-card cycle-card-highlight">
          <div class="cycle-card-who">실시간 모니터링</div>
          <div class="cycle-card-period">안심</div>
          <p>산소포화도·심박수를 실시간 확인하며 검사</p>
        </div>
        <div class="cycle-card">
          <div class="cycle-card-who">회복</div>
          <div class="cycle-card-period">빠름</div>
          <p>20~30분 휴식 후 일상 복귀 가능</p>
        </div>
      </div>
    </div>

    <div class="col-after" data-anim>
      <h2>수면내시경 후 주의사항</h2>
      <div class="col-after-sub">안전한 귀가를 위해 꼭 지켜주세요.</div>
      <ul class="col-bullet-list">
        <li>검사 후 <strong>최소 30분</strong> 회복실에서 충분히 휴식하세요.</li>
        <li>당일 <strong>운전은 절대 금지</strong>입니다. 보호자와 함께 귀가하세요.</li>
        <li>당일 <strong>중요한 계약이나 결정</strong>은 삼가세요.</li>
        <li>검사 후 1시간 뒤 <strong>물부터</strong> 드시고, 부드러운 음식으로 시작하세요.</li>
        <li>어지러움·구역감이 지속되면 <strong>즉시 연락</strong>해주세요.</li>
      </ul>
    </div>

    <div class="col-prevent" data-anim>
      <h2>수면내시경 전 준비사항</h2>
      <div class="col-prevent-row">
        <div class="col-prev-item"><div class="col-prev-num">1</div><strong>금식</strong><p>검사 8시간 전부터</p></div>
        <div class="col-prev-item"><div class="col-prev-num">2</div><strong>보호자 동반</strong><p>귀가 시 필수</p></div>
        <div class="col-prev-item"><div class="col-prev-num">3</div><strong>약 복용 상담</strong><p>복용 약 미리 안내</p></div>
        <div class="col-prev-item"><div class="col-prev-num">4</div><strong>편한 옷</strong><p>편안한 복장으로</p></div>
        <div class="col-prev-item"><div class="col-prev-num">5</div><strong>운전 금지</strong><p>당일 운전 불가</p></div>
      </div>
    </div>`;

  res.send(renderPage({
    title: '수면내시경', activeCategoryId: 'endoscopy',
    bodyContent: endoDetailPage('/endoscopy/sedation', detail),
    extraCss: '<link rel="stylesheet" href="/css/pages.css"><link rel="stylesheet" href="/css/why-section.css"><link rel="stylesheet" href="/css/colonoscopy.css">',
    extraJs: '<script src="/js/page-anim.js"></script>'
  }));
});

// /endoscopy/gerd 역류성식도염 전용 페이지
app.get('/endoscopy/gerd', (req, res) => {
  const detail = `
    <div class="col-intro" data-anim>
      <div class="col-intro-img"><img src="https://cdn.imweb.me/upload/S20260108b9005a7eb2710/72eb63d7e5dce.jpeg" alt="역류성식도염"></div>
      <div class="col-intro-text">
        <h2>역류성식도염이란?</h2>
        <p>역류성식도염은 위산이 식도로 역류해 식도 점막에 염증을 일으키는 질환입니다. 방치하면 식도협착, 바렛식도, 식도암으로 진행할 수 있어 <strong>정확한 진단과 조기 치료</strong>가 중요합니다.</p>
      </div>
    </div>

    <div class="col-symptoms" data-anim>
      <h2>이런 증상이 있다면 <span>역류성식도염</span>을 의심하세요</h2>
      <div class="col-check-grid">
        <label class="col-check"><span class="col-check-box"></span>속쓰림</label>
        <label class="col-check"><span class="col-check-box"></span>신물 역류</label>
        <label class="col-check"><span class="col-check-box"></span>목 이물감</label>
        <label class="col-check"><span class="col-check-box"></span>만성 기침</label>
        <label class="col-check"><span class="col-check-box"></span>쉰 목소리</label>
        <label class="col-check"><span class="col-check-box"></span>야간 가슴 쓰림</label>
        <label class="col-check"><span class="col-check-box"></span>삼킴 곤란</label>
        <label class="col-check"><span class="col-check-box"></span>흉통</label>
        <label class="col-check"><span class="col-check-box"></span>잦은 트림</label>
      </div>
    </div>

    <div class="col-diseases" data-anim>
      <h2>역류성식도염의 원인</h2>
      <div class="col-disease-grid">
        <div class="col-disease-card"><h4>하부식도괄약근 이완</h4><p>위와 식도 사이 근육이 약해져 위산이 역류</p></div>
        <div class="col-disease-card"><h4>식습관</h4><p>과식, 야식, 기름진 음식, 카페인, 알코올</p></div>
        <div class="col-disease-card"><h4>비만</h4><p>복압 증가로 위산 역류 위험 상승</p></div>
        <div class="col-disease-card"><h4>흡연</h4><p>괄약근 기능 저하와 위산 분비 증가</p></div>
        <div class="col-disease-card"><h4>스트레스</h4><p>자율신경 기능 이상으로 소화 기능 저하</p></div>
        <div class="col-disease-card"><h4>임신·약물</h4><p>호르몬 변화나 특정 약물로 인한 역류</p></div>
      </div>
    </div>

    <div class="col-reasons" data-anim>
      <h2>역류성식도염 진단과 치료</h2>
      <ol class="col-reason-list">
        <li><strong>위내시경</strong>으로 식도 점막 상태를 직접 확인하고 중증도를 분류합니다 (LA분류).</li>
        <li><strong>위산억제제</strong>(PPI)와 위장운동촉진제를 처방하여 증상을 조절합니다.</li>
        <li><strong>식이·생활습관 교정</strong> 상담을 통해 재발을 방지합니다.</li>
        <li>치료 후 <strong>추적 내시경</strong>으로 호전 여부를 확인합니다.</li>
      </ol>
    </div>

    <div class="col-after" data-anim>
      <h2>역류성식도염 생활 관리법</h2>
      <div class="col-after-sub">약물 치료와 함께 생활 습관 개선이 중요합니다.</div>
      <ul class="col-bullet-list">
        <li>식후 <strong>2~3시간</strong>은 눕지 마세요.</li>
        <li>취침 시 <strong>상체를 높이고</strong> 왼쪽으로 누워 자면 도움이 됩니다.</li>
        <li><strong>과식·야식</strong>을 피하고 소량씩 자주 드세요.</li>
        <li>카페인, 탄산음료, 알코올, 초콜릿, <strong>기름진 음식</strong>을 줄이세요.</li>
        <li><strong>금연</strong>은 필수입니다.</li>
        <li>꽉 끼는 옷이나 <strong>벨트를 느슨하게</strong> 착용하세요.</li>
        <li><strong>체중 관리</strong>가 증상 개선에 큰 도움이 됩니다.</li>
      </ul>
    </div>

    <div class="col-prevent" data-anim>
      <h2>역류성식도염 예방법</h2>
      <div class="col-prevent-row">
        <div class="col-prev-item"><div class="col-prev-num">1</div><strong>소량씩 식사</strong><p>과식·야식 금지</p></div>
        <div class="col-prev-item"><div class="col-prev-num">2</div><strong>식후 눕지 않기</strong><p>2~3시간 유지</p></div>
        <div class="col-prev-item"><div class="col-prev-num">3</div><strong>금연·절주</strong><p>괄약근 보호</p></div>
        <div class="col-prev-item"><div class="col-prev-num">4</div><strong>체중 관리</strong><p>복압 줄이기</p></div>
        <div class="col-prev-item"><div class="col-prev-num">5</div><strong>정기 위내시경</strong><p>합병증 예방</p></div>
      </div>
    </div>`;

  res.send(renderPage({
    title: '역류성식도염', activeCategoryId: 'endoscopy',
    bodyContent: endoDetailPage('/endoscopy/gerd', detail),
    extraCss: '<link rel="stylesheet" href="/css/pages.css"><link rel="stylesheet" href="/css/why-section.css"><link rel="stylesheet" href="/css/colonoscopy.css">',
    extraJs: '<script src="/js/page-anim.js"></script>'
  }));
});

// /endoscopy/helicobacter 헬리코박터 전용 페이지
app.get('/endoscopy/helicobacter', (req, res) => {
  const detail = `
    <div class="col-intro" data-anim>
      <div class="col-intro-img"><img src="https://cdn.imweb.me/upload/S20260108b9005a7eb2710/30ea6416ea891.jpeg" alt="헬리코박터"></div>
      <div class="col-intro-text">
        <h2>헬리코박터란?</h2>
        <p>헬리코박터 파일로리균은 위 점막에 서식하는 세균으로 위염, 위궤양, 위암의 주요 원인입니다. 우리나라 성인의 약 <strong>50%가 감염</strong>되어 있으며, 대부분 증상이 없어 검사로만 확인 가능합니다.</p>
      </div>
    </div>

    <div class="col-symptoms" data-anim>
      <h2>이런 분께 <span>헬리코박터 검사</span>를 권장합니다</h2>
      <div class="col-check-grid">
        <label class="col-check"><span class="col-check-box"></span>위궤양 진단</label>
        <label class="col-check"><span class="col-check-box"></span>십이지장궤양</label>
        <label class="col-check"><span class="col-check-box"></span>위암 가족력</label>
        <label class="col-check"><span class="col-check-box"></span>만성 소화불량</label>
        <label class="col-check"><span class="col-check-box"></span>만성 위염</label>
        <label class="col-check"><span class="col-check-box"></span>위축성위염</label>
        <label class="col-check"><span class="col-check-box"></span>장상피화생</label>
        <label class="col-check"><span class="col-check-box"></span>위 선종 제거 후</label>
        <label class="col-check"><span class="col-check-box"></span>조기 위암 수술 후</label>
      </div>
    </div>

    <div class="col-diseases" data-anim>
      <h2>헬리코박터가 일으키는 질환</h2>
      <div class="col-disease-grid">
        <div class="col-disease-card"><h4>만성 위염</h4><p>위 점막의 지속적 염증을 유발</p></div>
        <div class="col-disease-card"><h4>위궤양</h4><p>위 점막이 손상되어 깊은 상처</p></div>
        <div class="col-disease-card"><h4>십이지장궤양</h4><p>십이지장에 궤양을 유발</p></div>
        <div class="col-disease-card"><h4>위축성위염</h4><p>위 점막이 얇아지는 전암 상태</p></div>
        <div class="col-disease-card"><h4>장상피화생</h4><p>위 점막이 장 점막처럼 변화</p></div>
        <div class="col-disease-card"><h4>위암</h4><p>제균 치료 시 위암 발생률 감소</p></div>
      </div>
    </div>

    <div class="col-reasons" data-anim>
      <h2>헬리코박터 검사 방법</h2>
      <ol class="col-reason-list">
        <li><strong>위내시경 조직검사</strong> — 내시경 중 위 조직을 채취하여 균 존재 확인 (가장 정확)</li>
        <li><strong>요소호기검사</strong> — 약을 복용 후 내쉬는 숨으로 감염 여부 확인 (비침습적, 간편)</li>
        <li><strong>혈액검사</strong> — 항체 존재 여부 확인 (과거 감염도 양성 가능)</li>
      </ol>
    </div>

    <div class="col-cycle" data-anim>
      <h2>헬리코박터 제균 치료</h2>
      <div class="cycle-cards">
        <div class="cycle-card">
          <div class="cycle-card-who">1차 제균 치료</div>
          <div class="cycle-card-period">7~14일</div>
          <p>항생제 2종 + 위산억제제 병합 복용</p>
        </div>
        <div class="cycle-card cycle-card-highlight">
          <div class="cycle-card-who">제균 확인</div>
          <div class="cycle-card-period">4주 후</div>
          <p>호기검사로 제균 성공 여부 확인</p>
        </div>
        <div class="cycle-card">
          <div class="cycle-card-who">제균 실패 시</div>
          <div class="cycle-card-period">2차 치료</div>
          <p>다른 항생제 조합으로 재치료</p>
        </div>
      </div>
    </div>

    <div class="col-after" data-anim>
      <h2>제균 치료 시 주의사항</h2>
      <div class="col-after-sub">치료 효과를 높이기 위해 꼭 지켜주세요.</div>
      <ul class="col-bullet-list">
        <li>처방된 약을 <strong>정해진 기간 동안 빠짐없이</strong> 복용하세요.</li>
        <li>치료 중 <strong>금주</strong>는 필수입니다. 음주 시 제균율이 크게 떨어집니다.</li>
        <li>설사, 복통, 입맛 변화 등 <strong>부작용</strong>이 있을 수 있으나 대부분 일시적입니다.</li>
        <li>증상이 호전되어도 <strong>임의로 약을 중단하지 마세요.</strong></li>
        <li>치료 완료 4주 후 반드시 <strong>제균 확인 검사</strong>를 받으세요.</li>
        <li>제균 성공 후에도 <strong>정기 위내시경</strong>으로 추적 관리하세요.</li>
      </ul>
    </div>

    <div class="col-prevent" data-anim>
      <h2>헬리코박터 감염 예방</h2>
      <div class="col-prevent-row">
        <div class="col-prev-item"><div class="col-prev-num">1</div><strong>개인 위생</strong><p>손 씻기 철저히</p></div>
        <div class="col-prev-item"><div class="col-prev-num">2</div><strong>식기 공유 자제</strong><p>찌개·반찬 개별화</p></div>
        <div class="col-prev-item"><div class="col-prev-num">3</div><strong>정기 검사</strong><p>위내시경 정기 시행</p></div>
        <div class="col-prev-item"><div class="col-prev-num">4</div><strong>가족 검사</strong><p>감염자 가족도 검사</p></div>
        <div class="col-prev-item"><div class="col-prev-num">5</div><strong>금연·절주</strong><p>위 점막 보호</p></div>
      </div>
    </div>`;

  res.send(renderPage({
    title: '헬리코박터', activeCategoryId: 'endoscopy',
    bodyContent: endoDetailPage('/endoscopy/helicobacter', detail),
    extraCss: '<link rel="stylesheet" href="/css/pages.css"><link rel="stylesheet" href="/css/why-section.css"><link rel="stylesheet" href="/css/colonoscopy.css">',
    extraJs: '<script src="/js/page-anim.js"></script>'
  }));
});

// /endoscopy/polypectomy 대장용종절제술 전용 페이지
app.get('/endoscopy/polypectomy', (req, res) => {
  const cat = NAVIGATION.find(n => n.id === 'endoscopy');
  const child = cat.children.find(c => c.href === '/endoscopy/polypectomy');
  const why = WHY_DATA[child.href];
  const whyImg = WHY_IMAGES[cat.id];
  const endoSpecialHtml = fs.readFileSync(path.join(__dirname, 'templates', 'colonoscopy-body.html'), 'utf8');

  const body = `
  <section class="page-hero page-hero-sm" style="--hero-color:${cat.color}">
    <div class="page-hero-inner" data-anim><h1>${child.label}</h1><p>${child.desc}</p></div>
  </section>
  <section class="why-section">
    <div class="page-container">
      <div class="why-grid">
        <div class="why-image" data-anim><img src="${whyImg}" alt="${child.label}"><div class="why-image-overlay"><span>${why.overlay}</span></div></div>
        <div class="why-content" data-anim>
          <h2 class="why-title"><em>WHY</em> 운정센트럴365</h2>
          <div class="why-badge" style="--badge-color:${cat.color}">${why.badge}</div>
          <p class="why-desc">${why.desc}</p>
          <div class="why-divider"></div>
          <ul class="why-features">${why.features.map(f => '<li><svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M20 6 9 17l-5-5"/></svg>' + f + '</li>').join('')}</ul>
        </div>
      </div>
    </div>
  </section>
  ${endoSpecialHtml}

  <section class="col-detail">
    <div class="page-container">

      <!-- 대장용종이란 -->
      <div class="col-intro" data-anim>
        <div class="col-intro-img"><img src="https://cdn.imweb.me/upload/S20260108b9005a7eb2710/9bdcfee164076.jpeg" alt="대장용종절제술"></div>
        <div class="col-intro-text">
          <h2>대장용종이란?</h2>
          <p>대장용종은 대장벽의 일부가 주위 점막 표면보다 돌출되어 마치 혹처럼 형성된 것입니다. 대장용종의 대부분은 양성이지만, 일부 선종성 용종은 시간이 지나면 <strong>대장암으로 발전</strong>할 수 있어 조기 발견과 제거가 매우 중요합니다.</p>
        </div>
      </div>

      <!-- 용종 → 암 진행 -->
      <div class="col-symptoms" data-anim>
        <h2>대장용종, 왜 제거해야 할까요?</h2>
        <div class="polyp-progress">
          <div class="polyp-stage">
            <div class="polyp-stage-circle polyp-normal"></div>
            <strong>정상 대장점막</strong>
          </div>
          <div class="polyp-arrow">→</div>
          <div class="polyp-stage">
            <div class="polyp-stage-circle polyp-adenoma"></div>
            <strong>선종</strong>
            <span>10~20%</span>
          </div>
          <div class="polyp-arrow">→</div>
          <div class="polyp-stage">
            <div class="polyp-stage-circle polyp-cancer"></div>
            <strong>대장암</strong>
            <span>5~6%</span>
          </div>
        </div>
        <p class="col-symptoms-note" style="text-align:center;margin-top:14px"><em>* 용종 중 선종의 10~20%가 암으로 진행될 수 있어, 발견 즉시 제거하는 것이 원칙입니다.</em></p>
      </div>

      <!-- 치료 방법 -->
      <div class="col-diseases" data-anim>
        <h2>대장용종 치료 방법</h2>
        <p style="font-size:14px;color:#475569;line-height:1.7;margin-bottom:16px">대장용종의 크기에 따라 제거법이 다릅니다.</p>
        <div class="col-disease-grid" style="grid-template-columns:1fr 1fr">
          <div class="col-disease-card">
            <h4>크기 2~4mm</h4>
            <p><strong>조직검사</strong>로 제거합니다. 작은 용종은 조직 검사 겸 제거가 가능합니다.</p>
          </div>
          <div class="col-disease-card">
            <h4>크기 5mm 이상</h4>
            <p><strong>용종절제술</strong> 또는 <strong>내시경점막절제술(EMR)</strong>을 통해 제거합니다.</p>
          </div>
        </div>
        <p style="font-size:12px;color:#94A3B8;margin-top:10px">* 용종의 위치나 검사자의 상태에 따라 절제방법은 다소 달라질 수 있습니다.</p>
      </div>

      <!-- 절제술 후 주의사항 -->
      <div class="col-after" data-anim>
        <h2>대장용종절제술 후 주의사항</h2>
        <ul class="col-bullet-list">
          <li>대장용종 절제 부위의 크기에 따라 일정이 달라질 수 있습니다.</li>
          <li>술과 자극적인 음식은 삼가고 <strong>부드러운 음식</strong>을 드세요.</li>
          <li>무리한 운동은 자제해주세요.</li>
          <li>복부팽만, 통증이 지속되거나 <strong>혈변</strong>이 있으면 즉시 내원하세요.</li>
          <li>조직검사 결과는 약 <strong>1주일 후</strong> 확인 가능합니다.</li>
          <li>목욕탕, 통증이 있을 때는 7일간 찜질방 사용을 자제해주세요.</li>
          <li>과도한 음주는 2~3주간 삼가해주세요.</li>
        </ul>
      </div>

      <!-- 추적검사 -->
      <div class="col-cycle" data-anim>
        <h2>대장용종절제술 후 추적검사</h2>
        <p style="font-size:14px;color:#475569;line-height:1.7;margin-bottom:14px">대장용종의 크기·개수에 따라 추적 대장내시경 검사 시기가 달라집니다.</p>
        <div class="cycle-cards">
          <div class="cycle-card">
            <div class="cycle-card-who">일반적인 경우</div>
            <div class="cycle-card-period">3년 후</div>
            <p>선종 1~2개, 10mm 미만</p>
          </div>
          <div class="cycle-card cycle-card-highlight">
            <div class="cycle-card-who">고위험군</div>
            <div class="cycle-card-period">1년 후</div>
            <p>선종 3개 이상, 10mm 이상, 고도이형성</p>
          </div>
          <div class="cycle-card">
            <div class="cycle-card-who">대장암 발견 시</div>
            <div class="cycle-card-period">6개월~1년</div>
            <p>조직검사 결과에 따라 추적 관리</p>
          </div>
        </div>
      </div>

      <!-- 예방법 -->
      <div class="col-prevent" data-anim>
        <h2>대장용종 예방법</h2>
        <div class="col-prevent-row">
          <div class="col-prev-item"><div class="col-prev-num">1</div><strong>정기 대장내시경</strong><p>40세 이상 5년마다</p></div>
          <div class="col-prev-item"><div class="col-prev-num">2</div><strong>금연과 절주</strong><p>용종 발생 위험 감소</p></div>
          <div class="col-prev-item"><div class="col-prev-num">3</div><strong>섬유질 섭취</strong><p>채소·과일 충분히</p></div>
          <div class="col-prev-item"><div class="col-prev-num">4</div><strong>가공육 자제</strong><p>붉은 육류 줄이기</p></div>
          <div class="col-prev-item"><div class="col-prev-num">5</div><strong>꾸준한 운동</strong><p>규칙적 신체 활동</p></div>
        </div>
      </div>

      <!-- CTA -->
      <div class="page-cta" data-anim>
        <h3>진료 예약 및 문의</h3>
        <p class="cta-phone">준비중</p>
        <p class="cta-notice">전화번호는 개원 시 안내드리겠습니다.</p>
        <a href="https://pf.kakao.com/_xevPpn" target="_blank" class="cta-kakao-btn"><span>💬</span> 카카오톡 상담하기</a>
      </div>
    </div>
  </section>`;

  res.send(renderPage({
    title: '대장용종절제술',
    activeCategoryId: 'endoscopy',
    bodyContent: body,
    extraCss: '<link rel="stylesheet" href="/css/pages.css"><link rel="stylesheet" href="/css/why-section.css"><link rel="stylesheet" href="/css/colonoscopy.css"><link rel="stylesheet" href="/css/polypectomy.css">',
    extraJs: '<script src="/js/page-anim.js"></script>'
  }));
});

// /endoscopy/colonoscopy 대장내시경 전용 페이지
app.get('/endoscopy/colonoscopy', (req, res) => {
  const cat = NAVIGATION.find(n => n.id === 'endoscopy');
  const child = cat.children.find(c => c.href === '/endoscopy/colonoscopy');
  const why = WHY_DATA[child.href];
  const whyImg = WHY_IMAGES[cat.id];

  const body = `
  <section class="page-hero page-hero-sm" style="--hero-color:${cat.color}">
    <div class="page-hero-inner" data-anim><h1>${child.label}</h1><p>${child.desc}</p></div>
  </section>
  <section class="why-section">
    <div class="page-container">
      <div class="why-grid">
        <div class="why-image" data-anim><img src="${whyImg}" alt="${child.label}"><div class="why-image-overlay"><span>${why.overlay}</span></div></div>
        <div class="why-content" data-anim>
          <h2 class="why-title"><em>WHY</em> 운정센트럴365</h2>
          <div class="why-badge" style="--badge-color:${cat.color}">${why.badge}</div>
          <p class="why-desc">${why.desc}</p>
          <div class="why-divider"></div>
          <ul class="why-features">${why.features.map(f => '<li><svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M20 6 9 17l-5-5"/></svg>' + f + '</li>').join('')}</ul>
        </div>
      </div>
    </div>
  </section>

  ${fs.readFileSync(path.join(__dirname, 'templates', 'colonoscopy-body.html'), 'utf8')}

  <!-- 대장내시경 상세 콘텐츠 -->
  <section class="col-detail">
    <div class="page-container">

      <!-- 섹션1: 대장내시경이란 -->
      <div class="col-intro" data-anim>
        <div class="col-intro-img"><img src="https://cdn.imweb.me/upload/S20260108b9005a7eb2710/9bdcfee164076.jpeg" alt="대장내시경"></div>
        <div class="col-intro-text">
          <h2>대장내시경 검사란?</h2>
          <p>대장내시경 검사는 맹장에서부터 직장 항문까지 관찰하는 검사입니다. 대장내시경 검사는 정확도가 높고, 이상이 있을 경우 바로 조직 검사가 가능하며 용종절제술도 바로 가능하다는 장점이 있습니다.</p>
        </div>
      </div>

      <!-- 섹션2: 증상 체크 -->
      <div class="col-symptoms" data-anim>
        <h2>아래의 증상이 있다면 <span>대장내시경</span>이 필요합니다</h2>
        <div class="col-check-grid">
          <label class="col-check"><span class="col-check-box"></span>혈변</label>
          <label class="col-check"><span class="col-check-box"></span>복통</label>
          <label class="col-check"><span class="col-check-box"></span>배변 습관의 변화</label>
          <label class="col-check"><span class="col-check-box"></span>복부팽만감</label>
          <label class="col-check"><span class="col-check-box"></span>변비</label>
          <label class="col-check"><span class="col-check-box"></span>가스가 자주 참</label>
          <label class="col-check"><span class="col-check-box"></span>설사</label>
          <label class="col-check"><span class="col-check-box"></span>점액성 분비물</label>
          <label class="col-check"><span class="col-check-box"></span>대변의 가늘어짐</label>
          <label class="col-check"><span class="col-check-box"></span>체중 감소</label>
          <label class="col-check"><span class="col-check-box"></span>복부 불편함</label>
          <label class="col-check"><span class="col-check-box"></span>빈혈</label>
        </div>
        <div class="col-symptoms-note">
          <p>* 위 항목에 해당되는 증상이 없다고 하더라도 40세 이상이라면 대장내시경을 권유드립니다.</p>
          <p>* 과거 용종절제술을 한 경우, 대장암이나 대장용종의 가족력, 치루 수술 후 완치 후에는 대장내시경이 필요합니다.</p>
        </div>
      </div>

      <!-- 섹션3: 진단 가능 질환 -->
      <div class="col-diseases" data-anim>
        <h2>대장내시경으로 진단 가능한 질환들</h2>
        <div class="col-disease-grid">
          <div class="col-disease-card"><h4>대장암</h4><p>대장 점막에서 발생하는 악성 종양으로 조기 발견이 중요합니다.</p></div>
          <div class="col-disease-card"><h4>신경내분비종양</h4><p>대장 점막의 신경내분비세포에서 발생하는 종양입니다.</p></div>
          <div class="col-disease-card"><h4>대장용종</h4><p>대장 점막이 비정상적으로 자란 혹으로 방치 시 암으로 발전할 수 있습니다.</p></div>
          <div class="col-disease-card"><h4>궤양성대장염</h4><p>대장 점막에 만성 염증이 생기는 염증성 장질환입니다.</p></div>
          <div class="col-disease-card"><h4>결핵성대장염</h4><p>결핵균에 의해 대장에 염증이 생기는 질환입니다.</p></div>
          <div class="col-disease-card"><h4>대장 게실</h4><p>대장 벽이 바깥쪽으로 작게 돌출된 주머니 모양의 구조입니다.</p></div>
        </div>
      </div>

      <!-- 검사 전 주의사항 -->
      <div class="col-before" data-anim>
        <h2>대장내시경 전 주의사항</h2>

        <div class="col-step-badge">1</div>
        <h3>음식 섭취</h3>
        <p class="col-step-sub">정확한 검사를 위해 주의해야 할 음식을 확인하세요.</p>
        <p class="col-step-label">[ 검사 2~3일 전부터 주의해야 할 음식 ]</p>
        <div class="col-food-grid">
          <div class="col-food-card col-food-avoid">
            <h4>피해야 할 음식류</h4>
            <ul>
              <li>씨 있는 과일 (수박, 참외, 딸기, 포도, 키위 등)</li>
              <li>잡곡밥, 검은쌀, 현미밥, 깨죽, 견과류 등</li>
              <li>해조류 (미역, 김, 다시마)</li>
              <li>김치류, 나물류, 콩나물</li>
            </ul>
          </div>
          <div class="col-food-card col-food-ok">
            <h4>드실 수 있는 음식류</h4>
            <ul>
              <li>흰쌀밥, 흰죽 가능</li>
              <li>계란류, 두부류, 묵, 생선류, 국물류</li>
              <li>빵종류, 음료류 (탄산음료, 맑은 주스, 우유, 녹차 등)</li>
              <li>감자, 바나나</li>
            </ul>
          </div>
        </div>

        <div class="col-step-badge">2</div>
        <h3>장 정결제 복용</h3>
        <p class="col-step-sub">최근 장 정결제는 복용이 매우 편해졌습니다.</p>
        <ul class="col-bullet-list">
          <li>운정센트럴365 의료진이 설명드린 대로 정확히 복용하시면 됩니다.
            <ul><li>장 정결제 복용한 후 물은 충분히 드시는 것이 좋습니다.</li></ul>
          </li>
          <li>무색의 이온음료를 드셔도 괜찮습니다.</li>
          <li>장 청소가 잘 되었는지의 판단은 배변 색깔로 판단할 수 있습니다.</li>
        </ul>
        <div class="col-stool-guide">
          <div class="col-stool">
            <div class="col-stool-img"><img src="https://cdn.imweb.me/upload/S20260108b9005a7eb2710/e5658b4e0933c.png" alt="준비 안된 상태"></div>
            <div class="col-stool-status col-stool-bad-label">준비 안된 상태</div>
          </div>
          <div class="col-stool-arrow">→</div>
          <div class="col-stool">
            <div class="col-stool-img"><img src="https://cdn.imweb.me/upload/S20260108b9005a7eb2710/d05aa1ee76c47.png" alt="준비 직전"></div>
            <div class="col-stool-status col-stool-mid-label">준비 직전</div>
          </div>
          <div class="col-stool-arrow">→</div>
          <div class="col-stool">
            <div class="col-stool-img"><img src="https://cdn.imweb.me/upload/S20260108b9005a7eb2710/79b18523ac95f.png" alt="준비 된 상태"></div>
            <div class="col-stool-status col-stool-good-label">준비 된 상태</div>
          </div>
        </div>

        <div class="col-step-badge">3</div>
        <h3>검사 전 약 복용</h3>
        <p class="col-step-sub">드시는 약이 있다면 의료진에게 미리 알려주세요.</p>
        <ul class="col-bullet-list">
          <li><strong>고혈압 약:</strong> 검사 당일 지정해 드린 시간에 꼭 복용하셔야 합니다.</li>
          <li>심장질환, 뇌질환, 천식, 만성폐질환, 고혈압, 협심증, 당뇨 등으로 현재 복용중인 약물이 있는 경우 담당의사에게 말씀해 주십시오.</li>
          <li>현재 복용중인 처방약물 중 항응고제(쿠마딘)나 항혈전제(아스피린, 플라빅스) 관련 약을 복용하시는 경우, 미리 말씀해 주십시오.</li>
          <li>검사 당일에는 혈당조절 약물이나 인슐린 주사는 투여하지 마십시오.</li>
        </ul>
      </div>

      <!-- 섹션8: 검사 후 주의사항 -->
      <div class="col-after" data-anim>
        <h2>대장내시경 후 주의사항</h2>
        <p class="col-after-sub">용종절제술을 시행하지 않은 경우</p>
        <ul class="col-bullet-list">
          <li>대장내시경 검사 후에는 <strong>충분한 휴식</strong>이 필요합니다.</li>
          <li>너무 무리한 활동을 자제해주세요.
            <ul><li>검사 당일에는 가급적 운전, 기계 다루는 일, 정교한 작업 등을 삼가해 주세요.</li></ul>
          </li>
          <li>대장내시경 후 항문이 불편한 경우에는 연고와 좌욕이 도움이 됩니다.</li>
          <li>대장내시경 후 첫 식사는 <strong>부드러운 음식(죽)</strong>을 드시는 것이 좋습니다.</li>
        </ul>
      </div>

      <!-- 섹션9: 예방법 -->
      <div class="col-prevent" data-anim>
        <h2>대장질환 예방법</h2>
        <div class="col-prevent-row">
          <div class="col-prev-item"><div class="col-prev-num">1</div><strong>주기적인 대장내시경</strong><p>40세 이상은 정기적으로</p></div>
          <div class="col-prev-item"><div class="col-prev-num">2</div><strong>금연과 절주</strong><p>흡연·음주량 줄이기</p></div>
          <div class="col-prev-item"><div class="col-prev-num">3</div><strong>섬유질 섭취</strong><p>채소·과일 충분히</p></div>
          <div class="col-prev-item"><div class="col-prev-num">4</div><strong>붉은 육고기 자제</strong><p>가공육 섭취 줄이기</p></div>
          <div class="col-prev-item"><div class="col-prev-num">5</div><strong>꾸준한 운동</strong><p>규칙적인 신체 활동</p></div>
        </div>
      </div>

      <!-- CTA -->
      <div class="page-cta" data-anim>
        <h3>진료 예약 및 문의</h3>
        <p class="cta-phone">준비중</p>
        <p class="cta-notice">전화번호는 개원 시 안내드리겠습니다.</p>
        <a href="https://pf.kakao.com/_xevPpn" target="_blank" class="cta-kakao-btn"><span>💬</span> 카카오톡 상담하기</a>
      </div>
    </div>
  </section>`;

  res.send(renderPage({
    title: '대장내시경',
    activeCategoryId: 'endoscopy',
    bodyContent: body,
    extraCss: '<link rel="stylesheet" href="/css/pages.css"><link rel="stylesheet" href="/css/why-section.css"><link rel="stylesheet" href="/css/endo-special.css"><link rel="stylesheet" href="/css/colonoscopy.css">',
    extraJs: '<script src="/js/page-anim.js"></script><script src="https://cdn.jsdelivr.net/npm/chart.js@4"></script><script src="/js/colonoscopy-chart.js"></script>'
  }));
});

// 카테고리 인덱스 → 첫 번째 세부페이지로 리다이렉트
const CAT_BASE = { about:'/about', endoscopy:'/endoscopy', checkup:'/checkup', chronic:'/chronic', pediatric:'/pediatric', growth:'/growth' };
NAVIGATION.forEach(cat => {
  const basePath = CAT_BASE[cat.id];
  if (basePath && basePath !== cat.href) {
    app.get(basePath, (req, res) => res.redirect(301, cat.children[0].href));
  }

  // 세부 페이지들
  cat.children.forEach(child => {
    if (child.href === '/about/philosophy') return;
    if (child.href === '/about/doctors') return;
    if (child.href === '/about/facility') return;
    if (child.href === '/about/directions') return;
    if (child.href === '/pediatric/allergy') return;
    if (child.href === '/pediatric/vaccine') return;
    if (child.href === '/growth/intro') return;
    if (child.href === '/growth/bone-age') return;
    if (child.href === '/growth/hormone') return;
    if (child.href === '/growth/precocious') return;
    if (child.href === '/growth/nutrition') return;
    if (child.href === '/checkup/general') return;
    if (child.href === '/checkup/cancer') return;
    if (child.href === '/checkup/ultrasound') return;
    if (child.href === '/endoscopy/gastroscopy') return;
    if (child.href === '/endoscopy/colonoscopy') return;
    if (child.href === '/endoscopy/sedation') return;
    if (child.href === '/endoscopy/gerd') return;
    if (child.href === '/endoscopy/helicobacter') return;
    if (child.href === '/endoscopy/polypectomy') return;
    app.get(child.href, (req, res) => {
      res.send(renderSubPage(cat, child));
    });
  });
});

app.listen(PORT, () => {
  console.log(`운정센트럴365의원 홈페이지가 http://localhost:${PORT} 에서 실행 중입니다.`);
});
