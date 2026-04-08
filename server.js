const express = require('express');
const path = require('path');
const fs = require('fs');
const app = express();
const PORT = 3003;

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
        <span class="logo-text">연세이내과</span>
      </a>
      <button class="mobile-menu-btn" id="mobileMenuBtn" aria-label="메뉴 열기">
        <span></span><span></span><span></span>
      </button>
    </div>
    <div class="header-nav-wrap">
      <nav class="nav-mega container">${navItems}
      </nav>
    </div>
  </header>
  <!-- 모바일 드로어 -->
  <div class="mobile-drawer-overlay" id="drawerOverlay"></div>
  <aside class="mobile-drawer" id="mobileDrawer">
    <div class="drawer-header">
      <span class="drawer-logo logo-text">연세이내과</span>
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
    </div>
  </aside>`;
}

// === 푸터 HTML ===
const FOOTER = `
  <footer class="footer">
    <div class="container">
      <div class="footer-inner">
        <div class="footer-logo"><span class="logo-text">연세이내과</span></div>
        <div class="footer-info">
          <p><strong>연세이내과</strong> YONSEI E INTERNAL MEDICINE</p>
          <p>경기도 고양시 일산서구 중앙로 1388, 2층</p>
          <p>내과 · 신장내과 · 건강검진센터 · 초음파센터 · 수액클리닉</p>
        </div>
      </div>
      <div class="footer-bottom"><p>&copy; 2026 연세이내과. All rights reserved.</p></div>
    </div>
  </footer>
`;

// === HTML 래퍼 ===
function renderPage({ title, activeCategoryId, bodyContent, extraCss, extraJs }) {
  return `<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title} | 연세이내과</title>
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
  // === 초음파센터 ===
  '/ultrasound/abdomen':  { badge:'복부초음파, 왜 연세이내과일까?', overlay:'복부 정밀 초음파', desc:'고해상도 초음파 장비로 간·담낭·췌장·비장·신장을 정밀하게 검사합니다.', features:['고해상도 초음파 장비','전문의 직접 판독','당일 결과 안내','무통·무방사선 검사'] },
  '/ultrasound/thyroid':  { badge:'갑상선초음파, 왜 연세이내과일까?', overlay:'갑상선 정밀 초음파', desc:'갑상선 결절·낭종·이상을 고해상도 초음파로 조기에 발견합니다.', features:['갑상선 결절 정밀 평가','전문의 직접 판독','세침흡인검사 연계','당일 결과 안내'] },
  '/ultrasound/cardiac':  { badge:'심장초음파, 왜 연세이내과일까?', overlay:'심장 구조·기능 정밀 평가', desc:'심장초음파로 판막질환, 심부전, 심비대 등을 정확히 진단합니다.', features:['심장 구조·기능 평가','판막질환 정밀 진단','전문의 직접 판독','심전도 병행 검사'] },
  '/ultrasound/carotid':  { badge:'경동맥초음파, 왜 연세이내과일까?', overlay:'뇌졸중 위험 조기 발견', desc:'경동맥 초음파로 동맥경화와 뇌졸중 위험을 사전에 확인합니다.', features:['뇌졸중 위험 조기 발견','경동맥 협착 정밀 평가','전문의 직접 판독','고혈압 환자 필수 검사'] },
  '/checkup/general':    { badge:'종합검진, 왜 연세이내과일까?', overlay:'1:1 맞춤형 종합검진', desc:'개인 맞춤형 검진 프로그램으로 정확하고 효율적인 건강검진을 제공합니다.', features:['1:1 맞춤 설계','전문의 직접 판독','당일 결과 안내','대학병원급 장비'] },
  '/checkup/cancer':     { badge:'5대암검진, 왜 연세이내과일까?', overlay:'국가 5대암 조기발견', desc:'국민건강보험 지정기관으로 5대암을 조기에 발견하고 안전하게 관리합니다.', features:['국가검진 지정기관','소화기내시경 전문의','당일 용종절제 가능','원스톱 진료'] },
  '/checkup/ultrasound': { badge:'초음파검사, 왜 연세이내과일까?', overlay:'정밀 초음파 검사', desc:'고해상도 초음파 장비로 복부·갑상선·심장 등 정밀 검사를 제공합니다.', features:['고해상도 초음파 장비','전문의 직접 판독','당일 결과 안내','다부위 검사 가능'] },
  '/checkup/thyroid':    { badge:'갑상선검사, 왜 연세이내과일까?', overlay:'갑상선 전문 검사', desc:'갑상선 초음파·혈액검사·조직검사까지 체계적인 갑상선 검진을 제공합니다.', features:['갑상선 초음파','혈액검사 병행','세침흡인검사 가능','전문의 직접 판독'] },
  '/checkup/echo':       { badge:'심장초음파, 왜 연세이내과일까?', overlay:'심장 정밀 검사', desc:'심장초음파로 심장 구조와 기능을 정밀하게 평가합니다.', features:['심장초음파 정밀 검사','전문의 직접 판독','당일 결과 안내','심전도 병행 검사'] },
  '/checkup/carotid':    { badge:'경동맥초음파, 왜 연세이내과일까?', overlay:'뇌졸중 위험 조기 확인', desc:'경동맥 초음파로 뇌졸중·심근경색 위험을 사전에 확인합니다.', features:['뇌졸중 위험 조기 발견','전문의 직접 판독','당일 결과 안내','고혈압 환자 필수 검사'] },
  '/chronic/hypertension':   { badge:'고혈압, 왜 연세이내과일까?', overlay:'고혈압 전문 클리닉', desc:'고혈압은 꾸준한 관리가 치료입니다. 전문의와 함께 체계적으로 관리하세요.', features:['전문의 직접 진료','개인별 맞춤 관리','정기적 모니터링','합병증 예방 관리'] },
  '/chronic/diabetes':       { badge:'당뇨, 왜 연세이내과일까?', overlay:'당뇨 전문 클리닉', desc:'당뇨는 꾸준한 관리가 치료입니다. 전문의와 함께 체계적으로 관리하세요.', features:['전문의 직접 진료','혈당 맞춤 관리','정기적 모니터링','합병증 예방 관리'] },
  '/chronic/hyperlipidemia': { badge:'고지혈증, 왜 연세이내과일까?', overlay:'고지혈증 전문 클리닉', desc:'고지혈증은 꾸준한 관리가 치료입니다. 전문의와 함께 체계적으로 관리하세요.', features:['전문의 직접 진료','개인별 맞춤 관리','정기적 모니터링','합병증 예방 관리'] },
  '/chronic/thyroid':        { badge:'갑상선질환, 왜 연세이내과일까?', overlay:'갑상선 전문 클리닉', desc:'갑상선 기능 이상을 정확히 진단하고 체계적으로 관리합니다.', features:['갑상선 초음파','혈액검사 병행','전문의 직접 진료','정기 추적 관리'] },
  '/chronic/sleep':          { badge:'수면장애, 왜 연세이내과일까?', overlay:'수면장애 전문 클리닉', desc:'수면장애의 원인을 정확히 파악하고 맞춤 치료를 제공합니다.', features:['수면 원인 정밀 분석','개인 맞춤 치료','전문의 직접 진료','비약물 치료 병행'] },
  '/chronic/ent':            { badge:'이비인후과, 왜 연세이내과일까?', overlay:'이비인후과 전문 진료', desc:'알레르기비염·만성비염·중이염 등 이비인후과 질환을 전문적으로 치료합니다.', features:['전문의 직접 진료','내시경 검사 가능','알레르기 원인 분석','맞춤 치료 처방'] },
  // === 신장내과센터 ===
  '/nephrology/ckd': { badge:'만성콩팥병, 왜 연세이내과일까?', overlay:'만성콩팥병 전문 클리닉', desc:'신장내과 전문의 2인이 만성콩팥병을 조기에 진단하고 체계적으로 관리합니다.', features:['신장내과 전문의 2인 진료','만성콩팥병 1~5기 단계별 관리','사구체여과율(GFR) 정밀 평가','투석 전 보존적 치료'] },
  '/nephrology/hemodialysis': { badge:'혈액투석, 왜 연세이내과일까?', overlay:'최신 혈액투석 센터', desc:'최신 투석 장비로 안전하고 편안한 혈액투석을 제공합니다.', features:['최신 혈액투석 장비','신장내과 전문의 관리','개인별 맞춤 투석 처방','투석 중 합병증 모니터링'] },
  '/nephrology/glomerulonephritis': { badge:'사구체신염, 왜 연세이내과일까?', overlay:'사구체신염 전문 진료', desc:'정확한 진단과 맞춤 치료로 사구체신염을 체계적으로 관리합니다.', features:['신장내과 전문의 직접 진료','정밀 혈액·소변 검사','신장 조직검사 연계','면역억제 치료 관리'] },
  '/nephrology/proteinuria': { badge:'단백뇨·혈뇨, 왜 연세이내과일까?', overlay:'단백뇨·혈뇨 정밀 진단', desc:'단백뇨와 혈뇨의 원인을 정확히 파악하고 근본적으로 치료합니다.', features:['24시간 단백뇨 정량검사','혈뇨 원인 정밀 분석','신장초음파 병행','신장내과 전문의 직접 진료'] },
  '/nephrology/electrolyte': { badge:'전해질이상, 왜 연세이내과일까?', overlay:'전해질 균형 전문 관리', desc:'나트륨·칼륨·칼슘 등 전해질 불균형을 정확히 진단하고 교정합니다.', features:['전해질 정밀 혈액검사','원인별 맞춤 교정 치료','신장기능 연관 분석','전문의 직접 진료'] },
  '/nephrology/ultrasound': { badge:'신장초음파, 왜 연세이내과일까?', overlay:'신장 정밀 초음파', desc:'고해상도 초음파로 신장의 크기, 구조, 혈류를 정밀하게 평가합니다.', features:['고해상도 초음파 장비','전문의 직접 검사·판독','당일 결과 안내','신장질환 조기 발견'] },
};

// === 세부 페이지 본문 콘텐츠 ===
const PAGE_CONTENT = {
  // === 초음파센터 ===
  '/ultrasound/abdomen': {
    intro: '복부초음파는 인체에 무해한 음파를 이용해 간·담낭·췌장·비장·신장의 형태와 이상을 실시간으로 확인하는 검사입니다. 방사선 노출 없이 안전하며, 지방간, 담석, 신장결석, 간종양, 췌장낭종 등을 조기에 발견할 수 있습니다.',
    symptomTitle: '이런 분께 권장합니다',
    symptoms: ['복부 통증·불편감이 있는 분','건강검진에서 간 수치 이상이 발견된 분','음주 습관이 있거나 지방간이 의심되는 분','가족 중 간암·담낭질환 병력이 있는 분'],
    processTitle: '검사 과정',
    process: ['검사 전 8시간 이상 금식','복부에 젤을 바르고 초음파 탐촉자로 검사 (15~20분)','간·담낭·췌장·비장·신장 순서로 정밀 관찰','전문의 직접 판독 후 당일 결과 설명'],
    strengthTitle: '연세이내과의 특징',
    strengths: ['고해상도 초음파 장비','전문의 직접 검사·판독','당일 결과 안내','다부위 동시 검사 가능'],
  },
  '/ultrasound/thyroid': {
    intro: '갑상선초음파는 갑상선의 크기, 형태, 결절 유무를 고해상도로 확인하는 검사입니다. 갑상선 결절은 성인의 약 30~50%에서 발견되며, 대부분 양성이지만 일부 악성 가능성이 있어 정기적인 추적이 중요합니다.',
    symptomTitle: '이런 분께 권장합니다',
    symptoms: ['목 앞부분에 덩어리가 만져지는 분','갑상선 기능 검사에서 이상이 있는 분','가족 중 갑상선암 병력이 있는 분','갑상선 결절을 추적 관찰 중인 분'],
    processTitle: '검사 과정',
    process: ['목 앞부분에 젤을 바르고 초음파 탐촉자로 검사 (10~15분)','갑상선 양쪽 엽 및 협부 정밀 관찰','결절 크기·형태·석회화 여부 평가','필요시 세침흡인검사(FNA) 연계'],
    strengthTitle: '연세이내과의 특징',
    strengths: ['고해상도 초음파 장비','전문의 직접 판독','세침흡인검사 연계 가능','정기 추적 관리'],
  },
  '/ultrasound/cardiac': {
    intro: '심장초음파는 초음파를 이용해 심장의 크기, 벽 두께, 판막 기능, 수축력을 실시간으로 평가하는 검사입니다. 심부전, 판막질환, 심비대, 심낭삼출 등을 정확히 진단할 수 있으며 방사선 노출 없이 안전합니다.',
    symptomTitle: '이런 분께 권장합니다',
    symptoms: ['가슴 통증·답답함이 있는 분','운동 시 호흡곤란이 있는 분','고혈압이 오래된 분 (심비대 평가)','심장 잡음이 들린다고 한 분'],
    processTitle: '검사 과정',
    process: ['왼쪽으로 누워 가슴에 초음파 탐촉자 대기','심장 구조 (4개 방, 판막) 정밀 관찰 (20~30분)','심장 수축·이완 기능 및 혈류 평가','전문의 직접 판독 후 당일 결과 설명'],
    strengthTitle: '연세이내과의 특징',
    strengths: ['전문의 직접 검사·판독','심전도 병행 검사','당일 결과 안내','심장질환 조기 발견'],
  },
  '/ultrasound/carotid': {
    intro: '경동맥초음파는 목 양쪽의 경동맥 혈관 상태를 초음파로 확인하는 검사입니다. 경동맥 내막 두께 증가, 플라크(죽상경화), 협착 정도를 평가하여 뇌졸중과 심근경색의 위험도를 사전에 파악할 수 있습니다.',
    symptomTitle: '이런 분께 권장합니다',
    symptoms: ['고혈압·당뇨·고지혈증이 있는 분','흡연 습관이 있는 분','가족 중 뇌졸중·심근경색 병력이 있는 분','두통·어지러움이 반복되는 분'],
    processTitle: '검사 과정',
    process: ['목 양쪽에 젤을 바르고 초음파 탐촉자로 검사 (15~20분)','경동맥 내막-중막 두께(IMT) 측정','플라크 유무 및 협착 정도 평가','전문의 직접 판독 후 당일 결과 설명'],
    strengthTitle: '연세이내과의 특징',
    strengths: ['뇌졸중 위험 조기 발견','전문의 직접 판독','당일 결과 안내','고혈압 환자 필수 검사'],
  },
  // === 건강검진센터 ===
  '/checkup/general': {
    intro: '종합건강검진은 질환의 조기 발견과 예방을 위해 혈액검사, 소변검사, 영상검사, 내시경 등을 체계적으로 시행하는 검진 프로그램입니다. 국가건강검진, 일반건강검진, 기업검진, 종합검진까지 개인의 나이·성별·가족력에 맞는 1:1 맞춤형 검진을 제공합니다. 질환은 조기에 발견할수록 치료 성공률이 높아집니다.',
    symptomTitle: '이런 분께 종합검진을 권장합니다',
    symptoms: ['40세 이상으로 정기 검진이 필요한 분','암·심혈관질환 등 가족력이 있는 분','만성 피로, 체중 변화, 소화불량이 있는 분','직장인 기업 건강검진 대상자','흡연·음주 습관이 있는 분','최근 1~2년간 검진을 받지 않은 분'],
    processTitle: '종합건강검진 과정',
    process: ['검진 전 1:1 상담으로 개인별 맞춤 프로그램 설계','기본 검사: 혈액검사(간·신장·혈당·지질·갑상선), 소변검사, 흉부X-ray, 심전도','정밀 검사: 위·대장내시경, 복부초음파, 갑상선초음파, 심장초음파, 경동맥초음파','전문의 직접 판독 후 1:1 결과 상담 및 추적 관리 안내'],
    strengthTitle: '연세이내과 종합검진의 특징',
    strengths: ['1:1 맞춤 검진 설계','소화기내시경 전문의 직접 시행','당일 용종절제 원스톱','대학병원급 최신 초음파 장비','당일 결과 안내 가능','추적 관리까지 책임'],
  },
  '/checkup/cancer': {
    intro: '5대암검진은 국민건강보험공단에서 지정한 위암, 대장암, 간암, 유방암, 자궁경부암을 조기에 발견하기 위한 국가암검진 프로그램입니다. 대상자는 무료로 검진받을 수 있으며, 암은 조기 발견 시 생존율이 90% 이상으로 높아지므로 정기 검진이 매우 중요합니다.',
    symptomTitle: '국가 5대암검진 대상 및 주기',
    symptoms: ['위암: 40세 이상, 2년마다 위내시경','대장암: 50세 이상, 1년마다 분변잠혈검사 → 양성 시 대장내시경','간암: B·C형 간염, 간경변 등 고위험군 40세 이상, 6개월마다 복부초음파 + 혈액검사','유방암: 40세 이상 여성, 2년마다 유방촬영','자궁경부암: 20세 이상 여성, 2년마다 자궁경부세포검사','국민건강보험공단에서 대상자에게 무료 검진 안내'],
    processTitle: '5대암검진 과정',
    process: ['국민건강보험공단 대상자 확인 및 예약','해당 암종별 검사 시행 (내시경, 초음파, 혈액검사 등)','소화기내시경 전문의가 직접 위·대장내시경 시행','전문의 판독 후 결과 안내, 이상 소견 시 정밀검사 연계'],
    strengthTitle: '연세이내과 5대암검진의 특징',
    strengths: ['국가검진 지정기관','소화기내시경 전문의 직접 시행','검사 중 용종 발견 시 당일 즉시 절제','수면내시경 가능','복부초음파 전문의 직접 판독','원스톱 진료로 재방문 부담 최소화'],
  },
  '/checkup/ultrasound': {
    intro: '초음파검사는 인체에 무해한 음파를 이용해 장기의 형태, 크기, 혈류 상태를 실시간으로 확인하는 영상 검사입니다. 방사선 노출이 없어 안전하며, 복부(간·담낭·췌장·신장·비장), 갑상선, 심장, 경동맥 등 다양한 부위를 검사할 수 있습니다.',
    symptomTitle: '이런 분께 초음파검사를 권장합니다',
    symptoms: ['복부 통증, 더부룩함, 소화불량이 있는 분','목 앞쪽에 혹이 만져지거나 갑상선 이상이 의심되는 분','흉통, 호흡곤란, 심장 두근거림이 있는 분','고혈압·당뇨·고지혈증으로 혈관 상태가 궁금한 분','건강검진에서 간수치·갑상선 수치 이상이 있는 분','암 가족력이 있어 정밀 검사가 필요한 분'],
    processTitle: '초음파검사 과정',
    process: ['검사 부위에 젤을 바르고 초음파 탐촉자로 실시간 영상 확인','복부초음파: 간·담낭·췌장·신장·비장 상태 확인 (10~15분)','갑상선초음파: 결절 유무·크기·형태 정밀 확인','심장초음파: 심장 구조·판막·수축력 평가 / 경동맥초음파: 혈관벽 두께·동맥경화 확인','전문의 직접 판독 후 당일 결과 설명'],
    strengthTitle: '연세이내과 초음파검사의 특징',
    strengths: ['고해상도 최신 초음파 장비','전문의 직접 검사 및 판독','복부·갑상선·심장·경동맥 다부위 검사 가능','당일 결과 안내','통증 없이 안전한 검사','건강검진과 연계 가능'],
  },
  '/checkup/thyroid': {
    intro: '갑상선검사는 갑상선 초음파, 혈액검사(갑상선 기능검사), 세침흡인검사(FNA)를 통해 갑상선 질환을 정확히 진단합니다. 갑상선 결절은 성인의 약 30~50%에서 발견될 만큼 흔하며, 대부분 양성이지만 일부는 갑상선암일 수 있어 정밀 검사가 필요합니다.',
    symptomTitle: '이런 분께 갑상선검사를 권장합니다',
    symptoms: ['목 앞쪽에 혹이 만져지거나 부어 보이는 분','급격한 체중 변화 (증가 또는 감소)','극심한 피로, 무기력, 집중력 저하','심장 두근거림, 손 떨림, 땀이 많은 분','갑상선 질환 가족력이 있는 분','이전 검사에서 갑상선 결절이 발견된 분'],
    processTitle: '갑상선검사 과정',
    process: ['갑상선 초음파로 결절 유무·크기·형태·석회화 정밀 확인','혈액검사로 갑상선 호르몬(TSH, Free T4) 수치 확인','K-TIRADS 분류에 따라 세침흡인검사(FNA) 필요 여부 결정','세침흡인검사: 가는 바늘로 결절 세포를 채취하여 암 여부 확인','전문의 결과 상담 및 추적 관리 일정 안내'],
    strengthTitle: '연세이내과 갑상선검사의 특징',
    strengths: ['고해상도 갑상선 초음파','혈액검사 동시 시행','세침흡인검사(FNA) 가능','전문의 직접 판독 및 시술','당일 결과 안내 (혈액검사)','정기 추적 관리'],
  },
  '/checkup/echo': {
    intro: '심장초음파는 초음파를 이용해 심장의 크기, 구조, 판막 기능, 심장 수축력, 혈류 방향을 실시간으로 확인하는 검사입니다. 방사선 노출 없이 심장 질환을 정확하게 진단할 수 있으며, 심부전, 판막질환, 심근병증, 심낭질환 등의 조기 발견에 필수적입니다.',
    symptomTitle: '이런 분께 심장초음파를 권장합니다',
    symptoms: ['흉통, 가슴 답답함이 있는 분','호흡곤란, 운동 시 숨이 차는 분','심장 두근거림, 불규칙한 맥박','다리·발목 부종이 있는 분','고혈압·당뇨 등 만성질환으로 심장 합병증이 걱정되는 분','심전도 이상 소견이 있는 분','가족 중 심장질환 환자가 있는 분'],
    processTitle: '심장초음파 검사 과정',
    process: ['왼쪽으로 누운 상태에서 가슴에 초음파 탐촉자 적용','심장 4개 방(심방·심실)의 크기와 구조 확인','판막 움직임과 혈류 방향 평가 (도플러 초음파)','심장 수축력(박출률, EF) 측정','전문의 직접 판독 후 당일 결과 설명 (약 20~30분)'],
    strengthTitle: '연세이내과 심장초음파의 특징',
    strengths: ['최신 심장초음파 장비','전문의 직접 검사 및 판독','심전도 동시 시행 가능','당일 결과 안내','통증 없이 안전한 검사','만성질환 환자 심장 합병증 모니터링'],
  },
  '/checkup/carotid': {
    intro: '경동맥초음파는 목의 경동맥(뇌로 가는 주요 혈관) 벽 두께와 혈류 상태를 초음파로 확인하는 검사입니다. 동맥경화의 진행 정도를 직접 눈으로 확인할 수 있어, 뇌졸중과 심근경색의 위험을 사전에 평가하는 가장 효과적인 검사입니다. 특히 고혈압·당뇨·고지혈증 환자에게 필수적입니다.',
    symptomTitle: '이런 분께 경동맥초음파를 권장합니다',
    symptoms: ['고혈압·당뇨·고지혈증이 있는 분','흡연자 또는 비만인 분','뇌졸중·심근경색 가족력이 있는 분','일시적 시력 저하, 팔다리 마비감을 경험한 분','어지러움·두통이 자주 있는 분','50세 이상으로 혈관 건강이 궁금한 분','심장초음파와 함께 종합 혈관 평가를 원하는 분'],
    processTitle: '경동맥초음파 검사 과정',
    process: ['목 양쪽에 초음파 탐촉자를 대고 경동맥 확인 (15~20분)','경동맥 내막-중막 두께(IMT) 정밀 측정 — 동맥경화 지표','혈관 내 플라크(죽상경화반) 유무, 크기, 성상 확인','혈관 협착 정도 및 혈류 속도 측정 (도플러)','전문의 직접 판독 후 당일 결과 설명 및 관리 안내'],
    strengthTitle: '연세이내과 경동맥초음파의 특징',
    strengths: ['뇌졸중·심근경색 위험 조기 발견','고해상도 초음파 장비','전문의 직접 검사 및 판독','당일 결과 안내','심장초음파와 동시 시행 가능','만성질환 환자 필수 검사'],
  },
  // === 만성질환클리닉 ===
  '/chronic/hypertension': {
    intro: '고혈압은 혈압이 지속적으로 140/90mmHg 이상인 상태로, 심장·뇌·신장·혈관에 손상을 일으킵니다. 한국 성인 3명 중 1명(약 1,200만 명)이 고혈압 환자이며, 대부분 증상이 없어 "침묵의 살인자"로 불립니다. 방치하면 뇌졸중, 심근경색, 심부전, 신부전으로 이어질 수 있어 정기적인 측정과 꾸준한 관리가 핵심입니다.',
    symptomTitle: '고혈압 의심 증상 및 위험 요인',
    symptoms: ['두통, 어지러움, 뒷목 뻣뻣함','가슴 답답함, 호흡곤란','코피가 자주 나는 분','시력 저하, 눈 충혈','가족 중 고혈압·뇌졸중·심근경색 환자','비만, 흡연, 과도한 음주, 짠 음식 선호','스트레스가 심하거나 운동이 부족한 분'],
    processTitle: '고혈압 진단 및 치료 과정',
    process: ['정확한 혈압 측정 (2회 이상, 양팔)','혈액검사 (신장기능, 혈당, 지질, 전해질)','심전도, 소변검사, 흉부X-ray','합병증 평가: 심장초음파, 경동맥초음파, 안저검사','개인별 위험도 평가 후 맞춤 약물 선택','생활습관 교정: 저염식(6g 미만/일), 체중관리, 운동처방'],
    strengthTitle: '연세이내과 고혈압 관리의 특징',
    strengths: ['내과 전문의 직접 진료','심장초음파·경동맥초음파로 합병증 평가','개인별 약물 맞춤 처방','정기 모니터링 및 약물 조절','생활습관 교정 상담','혈압 수첩 관리 지도'],
  },
  '/chronic/diabetes': {
    intro: '당뇨병은 인슐린 분비 또는 작용에 문제가 생겨 혈당이 지속적으로 높은 상태입니다. 한국 당뇨병 환자 약 600만 명, 당뇨 전단계까지 포함하면 1,500만 명 이상입니다. 방치하면 망막병증(실명), 신증(투석), 신경병증(족부 괴사), 심혈관질환으로 이어질 수 있어 조기 발견과 꾸준한 혈당 관리가 생명입니다.',
    symptomTitle: '당뇨 의심 증상 및 위험 요인',
    symptoms: ['갈증이 심하고 물을 많이 마시는 분 (다음)','소변 횟수·양이 증가한 분 (다뇨)','많이 먹는데도 체중이 감소하는 분 (다식)','극심한 피로감, 무기력','상처가 잘 낫지 않는 분','시력 저하, 손발 저림','당뇨 가족력, 비만, 임신성 당뇨 이력'],
    processTitle: '당뇨 진단 및 치료 과정',
    process: ['공복혈당 검사 (126mg/dL 이상 시 당뇨 진단)','당화혈색소(HbA1c) 검사 — 최근 2~3개월 평균 혈당 반영','경구당부하검사(OGTT) — 당뇨 전단계 정밀 진단','합병증 선별: 안저검사, 소변 미세알부민, 신경전도검사','개인별 혈당 목표 설정 및 맞춤 약물 처방','식이요법·운동요법·자가혈당측정 교육'],
    strengthTitle: '연세이내과 당뇨 관리의 특징',
    strengths: ['내과 전문의 직접 진료','당화혈색소 정기 모니터링','합병증 조기 선별검사','개인별 혈당 목표 관리','식이·운동 생활습관 상담','인슐린 치료 필요시 안내'],
  },
  '/chronic/hyperlipidemia': {
    intro: '고지혈증(이상지질혈증)은 혈중 LDL콜레스테롤, 중성지방이 높거나 HDL콜레스테롤이 낮은 상태입니다. 대부분 증상이 전혀 없지만, 혈관벽에 지방이 쌓여 동맥경화가 진행되면 어느 날 갑자기 심근경색이나 뇌졸중이 발생합니다. 정기 혈액검사로 이상을 발견하고, 수치에 맞는 관리를 시작하는 것이 가장 중요합니다.',
    symptomTitle: '고지혈증 위험 요인',
    symptoms: ['가족 중 심근경색·뇌졸중 환자가 있는 분','비만(BMI 25 이상) 또는 복부비만','기름진 음식, 인스턴트 식품을 자주 먹는 분','운동을 거의 하지 않는 분','흡연자 또는 과도한 음주','고혈압·당뇨를 함께 가진 분','LDL 160 이상, 중성지방 200 이상 판정 이력'],
    processTitle: '고지혈증 진단 및 치료 과정',
    process: ['12시간 공복 후 혈액검사: 총콜레스테롤, LDL, HDL, 중성지방','심혈관 위험도 종합 평가 (나이, 성별, 흡연, 혈압, 당뇨 고려)','경동맥초음파로 동맥경화 직접 확인','위험도에 따른 LDL 목표 수치 설정','생활습관 교정 우선 (식이, 운동, 금연)','목표 미달 시 스타틴 등 약물 치료 시작, 정기 추적'],
    strengthTitle: '연세이내과 고지혈증 관리의 특징',
    strengths: ['내과 전문의 직접 진료','경동맥초음파로 동맥경화 평가','개인별 LDL 목표 맞춤 설정','정기 혈액검사 모니터링','식이·운동 생활습관 상담','약물 부작용 관리'],
  },
  '/chronic/thyroid': {
    intro: '갑상선질환은 갑상선 호르몬이 과다(항진증) 또는 부족(저하증)하게 분비되는 질환입니다. 항진증은 체중감소·두근거림·손떨림, 저하증은 체중증가·피로감·부종이 특징입니다. 갑상선결절은 성인의 30~50%에서 발견될 만큼 흔하며, 일부는 갑상선암으로 발전할 수 있어 정기적인 초음파 검사가 중요합니다.',
    symptomTitle: '갑상선질환 의심 증상',
    symptoms: ['항진증: 체중감소, 두근거림, 손떨림, 더위 민감','저하증: 체중증가, 피로, 추위 민감, 변비, 부종','목 앞쪽에 혹이 만져지거나 부어 보임','목소리 변화, 삼킬 때 이물감','불안감, 초조함 또는 우울감','탈모, 피부 건조','갑상선 질환 가족력이 있는 분'],
    processTitle: '갑상선질환 진단 및 치료 과정',
    process: ['갑상선 기능 혈액검사: TSH, Free T4, T3','갑상선 초음파로 결절 유무·크기·형태·석회화 정밀 확인','K-TIRADS 분류에 따라 세침흡인검사(FNA) 결정','항진증: 항갑상선제 처방 / 저하증: 갑상선호르몬 보충','결절: 크기·성상에 따라 추적 관찰 또는 조직검사','정기 혈액검사 + 초음파로 추적 관리'],
    strengthTitle: '연세이내과 갑상선 관리의 특징',
    strengths: ['고해상도 갑상선 초음파','혈액검사 동시 시행','세침흡인검사(FNA) 가능','전문의 직접 판독 및 진료','항진·저하·결절 모두 관리','정기 추적 관리'],
  },
  '/chronic/sleep': {
    intro: '수면장애·불면증은 잠들기 어렵거나, 자주 깨거나, 충분히 자도 개운하지 않은 상태가 한 달 이상 지속되는 질환입니다. 만성 불면은 고혈압 위험 2배, 당뇨 위험 1.5배, 우울증 위험 5배 이상 높이며, 낮 동안의 집중력·판단력 저하로 사고 위험도 증가합니다. 원인을 정확히 파악하고 적극 치료해야 합니다.',
    symptomTitle: '수면장애 자가진단 체크리스트',
    symptoms: ['잠들기까지 30분 이상 걸림','한밤중에 2회 이상 깸','새벽에 일찍 깨서 다시 잠들지 못함','자고 일어나도 개운하지 않음','낮 동안 극심한 졸림, 집중력 저하','코골이가 심하고 수면 중 숨이 멈추는 느낌','불안감, 우울감이 수면을 방해','카페인, 알코올, 스마트폰 사용이 잦음'],
    processTitle: '수면장애 진단 및 치료 과정',
    process: ['수면 패턴 상세 문진 (수면일지 활용)','수면장애 설문 평가 (ESS, ISI, STOP-BANG)','기저질환 확인: 혈액검사 (갑상선, 빈혈, 혈당)','수면무호흡 의심 시 수면다원검사 연계','약물 치료: 수면제 최소 용량, 단기간 처방 원칙','비약물 치료: 수면 위생 교육, 인지행동치료(CBT-I)'],
    strengthTitle: '연세이내과 수면장애 관리의 특징',
    strengths: ['수면 원인 정밀 분석','수면 설문 + 혈액검사 병행','약물 + 비약물 치료 병행','수면 위생 교육','전문의 직접 진료','수면무호흡 검사 연계'],
  },
  '/chronic/ent': {
    intro: '이비인후과 진료는 코(비과), 귀(이과), 목(인후과) 관련 질환을 전문적으로 진단하고 치료합니다. 알레르기비염은 한국 성인의 약 20~30%가 앓고 있으며, 부비동염(축농증)·중이염·편도선염은 소아부터 성인까지 흔하게 발생합니다. 방치하면 만성화되어 삶의 질이 크게 떨어지므로 정확한 진단과 치료가 중요합니다.',
    symptomTitle: '이비인후과 진료가 필요한 증상',
    symptoms: ['콧물, 코막힘이 2주 이상 지속','재채기, 코·눈 가려움 (알레르기비염)','누런 콧물, 안면부 통증·압박감 (부비동염)','귀 통증, 이명, 청력 저하','목 통증, 삼킬 때 통증, 목소리 변화','코골이, 수면 중 무호흡','어지러움, 균형감각 이상'],
    processTitle: '이비인후과 진단 및 치료 과정',
    process: ['증상 문진 및 이학적 검사 (이경, 비경, 구인두 관찰)','비내시경으로 코·부비동 직접 확인','알레르기 혈액검사 (MAST, 특이 IgE)','청력검사 (필요시)','맞춤 약물 치료: 항히스타민제, 비강스테로이드, 항생제 등','생활 관리 상담: 알레르기 원인 회피법, 코 세척법'],
    strengthTitle: '연세이내과 이비인후과의 특징',
    strengths: ['전문의 직접 진료','비내시경 검사 가능','알레르기 원인 혈액검사','맞춤 약물 처방','코 세척법 등 생활 관리 교육','소아·성인 모두 진료 가능'],
  },
  // === 신장내과센터 ===
  '/nephrology/ckd': {
    intro: '만성콩팥병(CKD)은 3개월 이상 신장 기능이 저하되거나 신장 손상이 지속되는 상태입니다. 한국 성인 약 10%가 만성콩팥병을 앓고 있으며, 초기에는 증상이 거의 없어 조기 발견이 매우 중요합니다. 신장내과 전문의 2인이 1~5기 단계별 맞춤 관리를 제공합니다.',
    symptomTitle: '만성콩팥병 의심 증상 및 위험 요인',
    symptoms: ['거품뇨(소변에 거품이 많음)','부종(눈 주위·발목·다리 붓기)','피로감, 식욕부진, 구역감','고혈압이 조절되지 않는 분','당뇨병을 10년 이상 앓고 있는 분','가족 중 신장질환 환자가 있는 분'],
    processTitle: '만성콩팥병 진단 및 치료 과정',
    process: ['혈액검사: 크레아티닌, BUN, 사구체여과율(eGFR) 측정','소변검사: 단백뇨, 혈뇨, 알부민/크레아티닌 비율(ACR)','신장초음파: 신장 크기·구조·혈류 평가','만성콩팥병 단계 분류(1~5기) 및 맞춤 치료 계획','투석 전 보존적 치료: 식이요법, 약물 치료, 합병증 관리'],
    strengthTitle: '연세이내과 만성콩팥병 관리의 특징',
    strengths: ['신장내과 전문의 2인 직접 진료','1~5기 단계별 맞춤 관리','정기 신장기능 모니터링','투석 전 보존적 치료 프로그램','당뇨·고혈압 동시 관리','상급병원 연계 시스템'],
  },
  '/nephrology/hemodialysis': {
    intro: '혈액투석은 신장이 더 이상 제 기능을 하지 못할 때 인공신장기를 이용해 혈액 속 노폐물과 수분을 제거하는 치료입니다. 보통 주 3회, 1회 4시간씩 시행하며, 투석 환자의 삶의 질을 높이기 위해 최신 장비와 전문적인 관리가 필수적입니다.',
    symptomTitle: '혈액투석이 필요한 경우',
    symptoms: ['사구체여과율(GFR) 15 미만 (만성콩팥병 5기)','심한 부종·호흡곤란이 약물로 조절되지 않을 때','고칼륨혈증으로 심장 이상이 우려될 때','요독 증상(구역, 구토, 의식 저하)','대사성 산증이 교정되지 않을 때','영양 상태 악화 및 체중 감소'],
    processTitle: '혈액투석 과정',
    process: ['투석 혈관(동정맥루) 준비 및 관리','투석기를 통해 혈액 속 노폐물·수분 제거 (4시간/회)','투석 중 혈압·체중·전해질 실시간 모니터링','투석 후 상태 확인 및 다음 투석 일정 안내','정기 혈액검사로 투석 적정도(Kt/V) 평가'],
    strengthTitle: '연세이내과 혈액투석의 특징',
    strengths: ['최신 혈액투석 장비 보유','신장내과 전문의 상주 관리','개인별 맞춤 투석 처방','투석 합병증 즉각 대응','영양·식이 상담','투석 혈관 관리'],
  },
  '/nephrology/glomerulonephritis': {
    intro: '사구체신염은 신장의 사구체(혈액을 여과하는 구조)에 염증이 발생하는 질환입니다. IgA 신증, 막성신증, 루푸스신염 등 다양한 원인이 있으며, 방치하면 만성콩팥병으로 진행할 수 있습니다. 정확한 진단과 조기 치료가 신장 기능 보존의 핵심입니다.',
    symptomTitle: '사구체신염 의심 증상',
    symptoms: ['콜라색 또는 붉은색 소변(혈뇨)','소변에 거품이 많음(단백뇨)','얼굴·눈 주위·다리 부종','고혈압이 갑자기 발생','소변량 감소','피로감, 체중 증가(부종으로 인한)'],
    processTitle: '사구체신염 진단 및 치료 과정',
    process: ['혈액검사: 크레아티닌, eGFR, 보체(C3/C4), 면역글로불린','소변검사: 적혈구 형태 분석, 단백뇨 정량','신장초음파로 신장 크기·에코 확인','필요시 신장 조직검사(신생검) 연계','원인별 맞춤 치료: 면역억제제, 스테로이드, 항고혈압제','정기 추적: 신장기능·단백뇨 모니터링'],
    strengthTitle: '연세이내과 사구체신염 관리의 특징',
    strengths: ['신장내과 전문의 직접 진료','정밀 면역학적 혈액검사','신장 조직검사 상급병원 연계','면역억제 치료 관리','단백뇨 장기 추적 관리','합병증 예방 교육'],
  },
  '/nephrology/proteinuria': {
    intro: '단백뇨는 소변에 단백질이 비정상적으로 많이 배출되는 상태이며, 혈뇨는 소변에 혈액이 섞여 나오는 증상입니다. 건강검진에서 우연히 발견되는 경우가 많으며, 신장질환의 초기 신호일 수 있습니다. 원인을 정확히 파악하고 적절한 치료를 시작하면 신장 기능을 보존할 수 있습니다.',
    symptomTitle: '단백뇨·혈뇨가 의심되는 경우',
    symptoms: ['소변에 거품이 많고 오래 유지됨','소변 색이 붉거나 갈색','건강검진에서 요단백·요잠혈 양성 판정','부종(눈 주위·발목)이 동반된 경우','당뇨·고혈압을 앓고 있는 분','가족 중 신장질환 환자가 있는 분'],
    processTitle: '단백뇨·혈뇨 진단 과정',
    process: ['소변검사: 요단백, 요잠혈, 현미경 검사','24시간 소변 수집 또는 요 알부민/크레아티닌 비율(ACR) 측정','혈액검사: 신장기능(크레아티닌, eGFR), 혈당, 지질','신장초음파: 신장 구조 이상 확인','원인 질환(당뇨신증, 사구체신염 등) 감별 진단','치료 계획 수립 및 정기 추적 검사'],
    strengthTitle: '연세이내과 단백뇨·혈뇨 진료의 특징',
    strengths: ['신장내과 전문의 직접 진료','24시간 단백뇨 정량검사','정밀 현미경 소변 분석','원인 감별 정밀 진단','장기 추적 관리','상급병원 연계 시스템'],
  },
  '/nephrology/electrolyte': {
    intro: '전해질이상은 혈액 속 나트륨, 칼륨, 칼슘, 인 등의 농도가 정상 범위를 벗어나는 상태입니다. 신장은 전해질 균형을 유지하는 핵심 장기로, 전해질 이상은 신장질환의 중요한 신호일 수 있습니다. 심한 경우 부정맥, 근육 마비, 경련 등 생명을 위협하는 합병증이 발생할 수 있어 정확한 진단과 교정이 필수적입니다.',
    symptomTitle: '전해질이상 증상',
    symptoms: ['근육 경련, 떨림, 위약감','심장 두근거림, 부정맥','극심한 피로, 무기력','구역, 구토, 식욕부진','혼돈, 의식 저하','손발 저림, 감각 이상'],
    processTitle: '전해질이상 진단 및 치료 과정',
    process: ['혈액검사: Na, K, Ca, P, Mg, Cl, CO2 측정','신장기능 검사: 크레아티닌, eGFR, BUN','소변 전해질 검사: 신장 처리 능력 평가','원인 분석: 신장질환, 약물, 내분비 이상 감별','전해질 교정 치료: 경구 또는 정맥 보충/제거','정기 추적 검사 및 원인 질환 관리'],
    strengthTitle: '연세이내과 전해질이상 관리의 특징',
    strengths: ['신장내과 전문의 직접 진료','정밀 전해질 혈액검사','신장기능 연관 통합 분석','원인별 맞춤 교정 치료','만성콩팥병 환자 전해질 관리','응급 전해질 이상 대응'],
  },
  '/nephrology/ultrasound': {
    intro: '신장초음파는 초음파를 이용해 신장의 크기, 형태, 구조, 혈류 상태를 실시간으로 확인하는 검사입니다. 방사선 노출 없이 안전하게 시행 가능하며, 신장결석, 낭종, 수신증, 종양 등을 조기에 발견할 수 있습니다. 신장질환의 초기 진단에 필수적인 검사입니다.',
    symptomTitle: '신장초음파가 필요한 경우',
    symptoms: ['건강검진에서 신장기능 이상 소견','단백뇨·혈뇨가 발견된 경우','옆구리 통증, 허리 통증','반복적인 요로감염','신장결석이 의심되는 경우','만성콩팥병 환자의 정기 추적'],
    processTitle: '신장초음파 검사 과정',
    process: ['옆구리·복부에 젤을 바르고 초음파 탐촉자로 검사','양쪽 신장의 크기·형태·에코 확인 (10~15분)','신장결석, 낭종, 수신증, 종양 유무 확인','신장 혈류 평가 (도플러 초음파)','전문의 직접 판독 후 당일 결과 설명'],
    strengthTitle: '연세이내과 신장초음파의 특징',
    strengths: ['고해상도 초음파 장비','신장내과 전문의 직접 판독','당일 결과 안내','신장질환 조기 발견','도플러 혈류 평가','혈액검사 연계 종합 평가'],
  },
};

// === 카테고리별 WHY 이미지 ===
const WHY_IMAGES = {
  ultrasound: 'https://cdn.imweb.me/upload/S20260108b9005a7eb2710/533d4e7b9f283.jpeg',
  'iv-therapy': 'https://cdn.imweb.me/upload/S20260108b9005a7eb2710/7b6505bf00064.jpeg',
  checkup:   'https://cdn.imweb.me/upload/S20260108b9005a7eb2710/7b6505bf00064.jpeg',
  chronic:   'https://cdn.imweb.me/upload/S20260108b9005a7eb2710/f61502eccdb07.jpeg',
  nephrology: 'https://cdn.imweb.me/upload/S20260108b9005a7eb2710/f61502eccdb07.jpeg',
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
          <h2 class="why-title"><em>WHY</em> 연세이내과</h2>
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

  // 본문 콘텐츠
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
  ${articleHtml}
  <section class="page-section">
    <div class="page-container page-narrow">
      <div class="page-cta" data-anim>
        <h3>진료 예약 및 문의</h3>
        <p class="cta-phone">준비중</p>
        <p class="cta-notice">전화번호는 개원 시 안내드리겠습니다.</p>
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
    about: '연세이내과를 소개합니다.',
    ultrasound: '고해상도 초음파로 정밀 검사를 제공합니다.',
    'iv-therapy': '피로회복·영양·면역 맞춤 수액 치료를 제공합니다.',
    checkup: '체계적인 건강검진 프로그램을 제공합니다.',
    chronic: '꾸준한 관리가 필요한 만성질환을 전문적으로 진료합니다.',
    nephrology: '신장내과 전문의 2인이 신장질환을 전문적으로 진료합니다.',
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
      <!-- 연세대 출신 어필 배너 -->
      <div class="doctor-yonsei-banner" data-anim>
        <div class="yonsei-banner-inner">
          <h3>연세대학교 의과대학 출신 신장내과 전문의 2인</h3>
          <p>연세대학교 의과대학의 체계적인 수련과 풍부한 임상 경험을 바탕으로<br>신장질환의 정확한 진단과 최적의 치료를 제공합니다.</p>
        </div>
      </div>

      <div class="doctors-page-grid" data-anim>
        <div class="doctor-page-card">
          <div class="doctor-page-photo" style="background:linear-gradient(135deg,#2E86AB,#45A5C4)">
            <span>대표원장</span>
          </div>
          <div class="doctor-page-info">
            <span class="doctor-page-tag">내과 전문의 · 신장내과 세부전문의</span>
            <h2>이용규 <small>대표원장</small></h2>
            <ul class="doctor-page-career">
              <li>연세대학교 의과대학 졸업</li>
              <li>연세대학교 세브란스병원 내과 전공의 수료</li>
              <li>연세대학교 세브란스병원 신장내과 전임의 수료</li>
              <li>대한신장학회 정회원</li>
              <li>현) 연세이내과 대표원장</li>
            </ul>
          </div>
        </div>
        <div class="doctor-page-card">
          <div class="doctor-page-photo" style="background:linear-gradient(135deg,#45A5C4,#6BC0D4)">
            <span>원장</span>
          </div>
          <div class="doctor-page-info">
            <span class="doctor-page-tag">내과 전문의 · 신장내과 세부전문의</span>
            <h2><small>원장</small></h2>
            <ul class="doctor-page-career">
              <li>연세대학교 의과대학 졸업</li>
              <li>연세대학교 세브란스병원 내과 전공의 수료</li>
              <li>연세대학교 세브란스병원 신장내과 전임의 수료</li>
              <li>연세대학교 의과대학 명예교수</li>
              <li>대한신장학회 정회원</li>
              <li>현) 연세이내과 원장</li>
            </ul>
          </div>
        </div>
      </div>
      <div class="page-cta" data-anim>
        <h3>진료 예약 및 문의</h3>
        <p class="cta-phone">준비중</p>
        <p class="cta-notice">전화번호는 개원 시 안내드리겠습니다.</p>
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
        <p class="facility-desc">연세이내과는 환자분들이 편안하게 진료받을 수 있도록<br>쾌적하고 청결한 환경을 갖추고 있습니다.</p>
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
      <p>3호선 대화역 인근</p>
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
            <h2>연세이내과</h2>
            <p class="directions-addr-text">경기도 고양시 일산서구 중앙로 1388, 2층</p>
          </div>
          <div class="directions-detail">
            <div class="directions-item">
              <strong>🚇 지하철</strong>
              <p>3호선 대화역 인근</p>
            </div>
            <div class="directions-item">
              <strong>🅿️ 주차</strong>
              <p>건물 내 주차 가능</p>
            </div>
          </div>
          <div class="directions-cta">
            <h4>진료 예약 · 문의</h4>
          </div>
        </div>
        <div class="directions-map">
          <div id="daumRoughmapContainer1775599659401" class="root_daum_roughmap root_daum_roughmap_landing"></div>
        </div>
      </div>
    </div>
  </section>`;

  res.send(renderPage({
    title: '오시는 길',
    activeCategoryId: 'about',
    bodyContent: body,
    extraCss: '<link rel="stylesheet" href="/css/pages.css"><link rel="stylesheet" href="/css/directions-page.css">',
    extraJs: '<script src="/js/page-anim.js"></script><script charset="UTF-8" src="https://ssl.daumcdn.net/dmaps/map_js_init/roughmapLoader.js"></script><script charset="UTF-8">new daum.roughmap.Lander({"timestamp":"1775599659401","key":"kczk4raneir","mapWidth":"640","mapHeight":"360"}).render();</script>'
  }));
});

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
      <h2 class="why-title"><em>WHY</em> 연세이내과</h2>
      <div class="why-badge" style="--badge-color:${cat.color}">${why.badge}</div>
      <p class="why-desc">${why.desc}</p>
      <div class="why-divider"></div>
      <ul class="why-features">${why.features.map(f => '<li><svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M20 6 9 17l-5-5"/></svg>' + f + '</li>').join('')}</ul>
    </div>
  </div></div></section>
  ${detailHtml}
  <section class="page-section"><div class="page-container page-narrow">
    <div class="page-cta" data-anim><h3>진료 예약 및 문의</h3><p class="cta-phone">준비중</p><p class="cta-notice">전화번호는 개원 시 안내드리겠습니다.</p></div>
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

// 카테고리 인덱스 → 첫 번째 세부페이지로 리다이렉트
const CAT_BASE = { about:'/about', checkup:'/checkup', chronic:'/chronic', nephrology:'/nephrology', ultrasound:'/ultrasound', 'iv-therapy':'/iv-therapy' };
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
    if (child.href === '/checkup/general') return;
    if (child.href === '/checkup/cancer') return;
    app.get(child.href, (req, res) => {
      res.send(renderSubPage(cat, child));
    });
  });
});

app.listen(PORT, () => {
  console.log(`연세이내과 홈페이지가 http://localhost:${PORT} 에서 실행 중입니다.`);
});
