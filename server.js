const express = require('express');
const path = require('path');
const fs = require('fs');
const app = express();
const PORT = process.env.PORT || 3003;

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
        <img src="https://cdn.imweb.me/upload/S20260108b9005a7eb2710/1a1943dcee2ce.png" alt="연세이내과" class="logo-img">
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
      <img src="https://cdn.imweb.me/upload/S20260108b9005a7eb2710/1a1943dcee2ce.png" alt="연세이내과" class="logo-img drawer-logo-img">
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
        <div class="footer-logo"><img src="https://cdn.imweb.me/upload/S20260108b9005a7eb2710/1a1943dcee2ce.png" alt="연세이내과" class="logo-img footer-logo-img" loading="lazy"></div>
        <div class="footer-info">
          <p><strong>연세이내과</strong> YONSEI E INTERNAL MEDICINE</p>
          <p>경기도 고양시 일산서구 중앙로 1388</p>
          <p style="font-size:13px;color:rgba(255,255,255,0.6)">태화프라자 동관 2층</p>
          <p>혈액투석센터 · 신장클리닉 · 만성질환클리닉 · 수액센터</p>
          <p style="margin-top:6px;font-size:13px;color:rgba(255,255,255,0.5)">대학병원 교수출신 의료진의 기준을 담다</p>
        </div>
      </div>
      <div class="footer-bottom"><p>&copy; 2026 연세이내과. All rights reserved.</p></div>
    </div>
  </footer>
`;

const SITE_URL = process.env.SITE_URL || 'https://yonseilee.vercel.app';
const OG_IMAGE = 'https://cdn.imweb.me/upload/S20260108b9005a7eb2710/c083a202cc5e6.png';
const DEFAULT_DESC = '고양시 일산서구 중앙로 1388, 2층. 대학병원 교수출신 신장내과 전문의 직접 진료. 혈액투석센터, 신장클리닉, 만성질환클리닉, 수액센터.';

// === HTML 래퍼 ===
function renderPage({ title, activeCategoryId, bodyContent, extraCss, extraJs, description, canonicalPath }) {
  const desc = description || DEFAULT_DESC;
  const canonical = `${SITE_URL}${canonicalPath || ''}`;
  return `<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title} | 연세이내과</title>
  <meta name="description" content="${desc}">
  <meta property="og:type" content="website">
  <meta property="og:title" content="${title} | 연세이내과">
  <meta property="og:description" content="${desc}">
  <meta property="og:image" content="${OG_IMAGE}">
  <meta property="og:url" content="${canonical}">
  <meta property="og:site_name" content="연세이내과">
  <link rel="canonical" href="${canonical}">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@400;700;900&display=swap" rel="stylesheet">
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
    extraJs: '<script src="/js/page-anim.js"></script>',
    description: getCategoryDesc(cat.id),
    canonicalPath: cat.href
  });
}

// === WHY 데이터 ===
const WHY_DATA = {
  '/chronic/hypertension':   { badge:'고혈압, 왜 연세이내과일까?', overlay:'고혈압 전문 클리닉', desc:'고혈압은 꾸준한 관리가 치료입니다. 전문의와 함께 체계적으로 관리하세요.', features:['전문의 직접 진료','개인별 맞춤 관리','정기적 모니터링','합병증 예방 관리'] },
  '/chronic/diabetes':       { badge:'당뇨, 왜 연세이내과일까?', overlay:'당뇨 전문 클리닉', desc:'당뇨는 꾸준한 관리가 치료입니다. 전문의와 함께 체계적으로 관리하세요.', features:['전문의 직접 진료','혈당 맞춤 관리','정기적 모니터링','합병증 예방 관리'] },
  '/chronic/hyperlipidemia': { badge:'고지혈증, 왜 연세이내과일까?', overlay:'고지혈증 전문 클리닉', desc:'고지혈증은 꾸준한 관리가 치료입니다. 전문의와 함께 체계적으로 관리하세요.', features:['전문의 직접 진료','개인별 맞춤 관리','정기적 모니터링','합병증 예방 관리'] },
  '/chronic/thyroid':        { badge:'갑상선질환, 왜 연세이내과일까?', overlay:'갑상선 전문 클리닉', desc:'갑상선 기능 이상을 정확히 진단하고 체계적으로 관리합니다.', features:['갑상선 초음파','혈액검사 병행','전문의 직접 진료','정기 추적 관리'] },
  // === 신장내과센터 ===
  '/nephrology/ckd': { badge:'만성콩팥병, 왜 연세이내과일까?', overlay:'만성콩팥병 전문 클리닉', desc:'신장내과 전문의 2인이 만성콩팥병을 조기에 진단하고 체계적으로 관리합니다.', features:['신장내과 전문의 2인 진료','만성콩팥병 1~5기 단계별 관리','사구체여과율(GFR) 정밀 평가','투석 전 보존적 치료'] },
  '/nephrology/hemodialysis': { badge:'혈액투석, 왜 연세이내과일까?', overlay:'최신 혈액투석 센터', desc:'최신 투석 장비로 안전하고 편안한 혈액투석을 제공합니다.', features:['최신 혈액투석 장비','신장내과 전문의 관리','개인별 맞춤 투석 처방','투석 중 합병증 모니터링'] },
  '/nephrology/glomerulonephritis': { badge:'사구체신염, 왜 연세이내과일까?', overlay:'사구체신염 전문 진료', desc:'정확한 진단과 맞춤 치료로 사구체신염을 체계적으로 관리합니다.', features:['신장내과 전문의 직접 진료','정밀 혈액·소변 검사','신장 조직검사 연계','면역억제 치료 관리'] },
  '/nephrology/proteinuria': { badge:'단백뇨·혈뇨, 왜 연세이내과일까?', overlay:'단백뇨·혈뇨 정밀 진단', desc:'단백뇨와 혈뇨의 원인을 정확히 파악하고 근본적으로 치료합니다.', features:['24시간 단백뇨 정량검사','혈뇨 원인 정밀 분석','신장초음파 병행','신장내과 전문의 직접 진료'] },
  '/nephrology/electrolyte': { badge:'전해질이상, 왜 연세이내과일까?', overlay:'전해질 균형 전문 관리', desc:'나트륨·칼륨·칼슘 등 전해질 불균형을 정확히 진단하고 교정합니다.', features:['전해질 정밀 혈액검사','원인별 맞춤 교정 치료','신장기능 연관 분석','전문의 직접 진료'] },
  '/nephrology/ultrasound': { badge:'신장초음파, 왜 연세이내과일까?', overlay:'신장 정밀 초음파', desc:'고해상도 초음파로 신장의 크기, 구조, 혈류를 정밀하게 평가합니다.', features:['고해상도 초음파 장비','전문의 직접 검사·판독','당일 결과 안내','신장질환 조기 발견'] },
  // === 수액센터 ===
  '/iv-therapy/general': { badge:'수액센터, 왜 연세이내과일까?', overlay:'맞춤 수액 치료', desc:'피로회복부터 영양·면역·미백·다이어트까지, 전문의가 직접 처방하는 안전하고 효과적인 맞춤 수액 치료를 제공합니다.', features:['전문의 직접 처방·관리','다양한 수액 메뉴','안전한 정맥주사 관리','쾌적한 수액 공간','당일 예약 가능'] },
};

// === 세부 페이지 본문 콘텐츠 ===
const PAGE_CONTENT = {
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

// === 이미지 ===
const CDN = 'https://cdn.imweb.me/upload/S20260108b9005a7eb2710/';

// WHY 섹션 대표 이미지 (카테고리 단위 — 같은 카테고리는 동일 사진)
const WHY_SECTION_IMAGES = {
  nephrology:   CDN + 'a5716bbbcea1c.png',  // 신장초음파 사진
  chronic:      CDN + 'cf7d331f24685.png',   // 이비인후과 사진
  'iv-therapy': CDN + 'a9571802204d5.png',
  _default:     CDN + '264029ec718d7.png',
};

// 아티클 인트로 이미지 (페이지별 고유 — 2번째 사진)
const ARTICLE_IMAGES = {
  '/nephrology/ckd':               CDN + 'c083a202cc5e6.png',
  '/nephrology/hemodialysis':      CDN + '17e884a84f100.png',
  '/nephrology/glomerulonephritis':CDN + '380b6a478edfc.png',
  '/nephrology/proteinuria':       CDN + '55442e3d65ac5.png',
  '/nephrology/electrolyte':       CDN + 'a937a93aa9df7.png',
  '/nephrology/ultrasound':        CDN + 'a5716bbbcea1c.png',
  '/chronic/hypertension':         CDN + '5156480ce2cce.png',
  '/chronic/diabetes':             CDN + '34964b2b5715e.png',
  '/chronic/hyperlipidemia':       CDN + '401187f029c58.png',
  '/chronic/thyroid':              CDN + '33b1f6b37fd63.png',
  '/iv-therapy/general':           CDN + 'a9571802204d5.png',
  _default:                        CDN + '264029ec718d7.png',
};

// === 세부 페이지 ===
function renderSubPage(cat, child) {
  const why = WHY_DATA[child.href];
  const whyImg = WHY_SECTION_IMAGES[cat.id] || WHY_SECTION_IMAGES._default;
  const whySection = why ? `
  <section class="why-section">
    <div class="page-container">
      <div class="why-grid">
        <div class="why-image" data-anim>
          <img src="${whyImg}" alt="${child.label}" loading="lazy">
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
  const catImg = ARTICLE_IMAGES[child.href] || ARTICLE_IMAGES._default;
  const articleHtml = content ? `
    <section class="col-detail"><div class="page-container">
      <div class="col-intro" data-anim>
        <div class="col-intro-img"><img src="${catImg}" alt="${child.label}" loading="lazy"></div>
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
        <a href="tel:031-922-1570" class="cta-btn">031-922-1570</a>
      </div>
    </div>
  </section>`;

  return renderPage({
    title: child.label,
    activeCategoryId: cat.id,
    bodyContent: body,
    extraCss: '<link rel="stylesheet" href="/css/pages.css"><link rel="stylesheet" href="/css/why-section.css"><link rel="stylesheet" href="/css/article.css"><link rel="stylesheet" href="/css/colonoscopy.css">',
    extraJs: '<script src="/js/page-anim.js"></script>',
    description: why ? why.desc : child.desc,
    canonicalPath: child.href
  });
}

function getCategoryDesc(id) {
  const descs = {
    about: '연세이내과를 소개합니다.',
    'iv-therapy': '피로회복·영양·면역 맞춤 수액 치료를 제공합니다.',
    chronic: '꾸준한 관리가 필요한 만성질환을 전문적으로 진료합니다.',
    nephrology: '대학병원 교수출신 신장내과 전문의가 직접 진료합니다.',
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
  const body = `
  <section class="page-hero page-hero-sm" style="--hero-color:${cat.color}">
    <div class="page-hero-inner" data-anim>
      <h1>의료진 소개</h1>
      <p>대학병원 교수출신 의료진의 기준을 담다</p>
    </div>
  </section>
  <section class="page-section">
    <div class="page-container">
      <div class="breadcrumb" data-anim>
        <a href="/">홈</a> <span>›</span>
        <a href="/about">병원소개</a> <span>›</span>
        <span class="current">의료진 소개</span>
      </div>

      <div class="doctor-yonsei-banner" data-anim>
        <div class="yonsei-banner-inner">
          <h3>YONSEI LEE'S MEDICAL CLINIC</h3>
          <p>소통이 좋은 병원 · 알기 쉽게 설명해주는 병원<br>정확한 검사와 체계적인 시스템으로 환자에 맞는 최적의 치료</p>
        </div>
      </div>

      <!-- 이호영 원장 -->
      <div class="doctor-profile-block" data-anim>
        <div class="doctor-profile-header">
          <div class="doctor-profile-photo" style="background:linear-gradient(135deg,#003876,#2E86AB)">
            <span>院長</span>
          </div>
          <div class="doctor-profile-title">
            <span class="doctor-page-tag">내과 전문의 · 신장내과 분과전문의 · 투석 전문의</span>
            <h2>이호영 <em>Ho Young Lee M.D. PhD.</em></h2>
            <p class="doctor-profile-pos">연세대학교 의과대학 내과 명예교수 · 연세이내과 원장</p>
          </div>
        </div>
        <div class="doctor-profile-body">
          <div class="doctor-profile-col">
            <h4 class="dp-section-title">학력 · 자격</h4>
            <ul class="doctor-page-career">
              <li>연세대학교 의과대학 졸업</li>
              <li>연세대학교 대학원 의학석사</li>
              <li>연세대학교 대학원 의학박사</li>
              <li>대한내과학회 내과 전문의</li>
              <li>대한내과학회 신장내과 분과전문의</li>
              <li>대한신장학회 투석 전문의</li>
            </ul>
            <h4 class="dp-section-title" style="margin-top:20px">해외 연수</h4>
            <ul class="doctor-page-career">
              <li>미국 뉴욕 Albert Einstein 의과대학 Montefiore Hospital 연구원</li>
              <li>미국 뉴욕 Cornell 대학 방문교수</li>
            </ul>
          </div>
          <div class="doctor-profile-col">
            <h4 class="dp-section-title">주요 경력</h4>
            <ul class="doctor-page-career">
              <li>연세대학교 의과대학 내과 정교수</li>
              <li>연세대학교 의과대학 내과 명예교수</li>
              <li>대한신장학회 이사장</li>
              <li>2010년 아시아태평양신장학회 조직위원장</li>
              <li>세브란스병원 신장내과 과장</li>
              <li>세브란스병원 수련부장</li>
              <li>세브란스병원 신장병센터 소장</li>
              <li>연세대학교 신장질환연구소 소장</li>
              <li>대한혈액투석여과학회 초대 회장</li>
            </ul>
          </div>
          <div class="doctor-profile-col">
            <h4 class="dp-section-title">학회 활동</h4>
            <ul class="doctor-page-career">
              <li>대한내과학회 평의원</li>
              <li>대한신장학회 평의원</li>
              <li>대한이식학회 정회원</li>
              <li>아시아태평양신장학회 평의원</li>
              <li>국제신장학회 정회원</li>
              <li>미국신장학회 정회원</li>
              <li>유럽신장학회 정회원</li>
              <li>대한민국의학한림원 정회원</li>
            </ul>
          </div>
        </div>
      </div>

      <!-- 이용규 원장 -->
      <div class="doctor-profile-block" data-anim>
        <div class="doctor-profile-header">
          <div class="doctor-profile-photo" style="background:linear-gradient(135deg,#2E86AB,#6BC0D4)">
            <span>院長</span>
          </div>
          <div class="doctor-profile-title">
            <span class="doctor-page-tag">내과 전문의 · 신장내과 분과전문의 · 투석 전문의</span>
            <h2>이용규 <em>Yong Kyu Lee M.D.</em></h2>
            <p class="doctor-profile-pos">연세이내과 대표원장</p>
          </div>
        </div>
        <div class="doctor-profile-body">
          <div class="doctor-profile-col">
            <h4 class="dp-section-title">학력 · 자격</h4>
            <ul class="doctor-page-career">
              <li>연세대학교 의과대학 졸업</li>
              <li>연세대학교 대학원 의학 석사</li>
              <li>대한내과학회 내과 전문의</li>
              <li>대한내과학회 신장내과 분과전문의</li>
              <li>대한신장학회 투석 전문의</li>
            </ul>
            <h4 class="dp-section-title" style="margin-top:20px">해외 연수</h4>
            <ul class="doctor-page-career">
              <li>Harold Simmons Center for Kidney Disease Research and Epidemiology, University of California Irvine, School of Medicine, 방문 교수</li>
            </ul>
          </div>
          <div class="doctor-profile-col">
            <h4 class="dp-section-title">주요 경력</h4>
            <ul class="doctor-page-career">
              <li>세브란스병원 외래 교수</li>
              <li>국민건강보험 일산병원 교수</li>
            </ul>
          </div>
          <div class="doctor-profile-col">
            <h4 class="dp-section-title">학회 활동</h4>
            <ul class="doctor-page-career">
              <li>대한내과학회 평의원</li>
              <li>대한신장학회 평의원</li>
              <li>대한이식학회 정회원</li>
              <li>대한혈액투석여과학회 정회원</li>
              <li>국제신장학회 정회원</li>
              <li>미국신장학회 정회원</li>
              <li>유럽신장학회 정회원</li>
              <li>아시아 태평양 신장학회 정회원</li>
            </ul>
          </div>
        </div>
      </div>

      <div class="page-cta" data-anim>
        <h3>진료 예약 및 문의</h3>
        <a href="tel:031-922-1570" class="cta-btn">031-922-1570</a>
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

// /about/facility → 둘러보기로 리다이렉트
app.get('/about/facility', (req, res) => res.redirect(301, '/about/gallery'));

// /about/directions 오시는 길 전용 페이지
app.get('/about/directions', (req, res) => {
  const body = `
  <section class="page-hero page-hero-sm" style="--hero-color:#5F5E5A">
    <div class="page-hero-inner" data-anim>
      <h1>오시는 길</h1>
      <p>3호선 주엽역 인근 · 태화프라자 동관 2층</p>
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
            <p class="directions-addr-text">경기도 고양시 일산서구 중앙로 1388</p>
            <p class="directions-addr-sub">태화프라자 동관 2층</p>
          </div>
          <div class="directions-detail">
            <div class="directions-item">
              <strong>🚇 지하철</strong>
              <p>3호선 주엽역 인근</p>
            </div>
            <div class="directions-item">
              <strong>🅿️ 주차</strong>
              <p>태화프라자 주차장 이용 가능</p>
              <div class="map-btn-group">
                <a href="https://naver.me/xrcDf71g" target="_blank" rel="noopener" class="map-btn map-btn-naver">
                  <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
                  네이버지도
                </a>
                <a href="https://kko.to/sf0FqVjQ9q" target="_blank" rel="noopener" class="map-btn map-btn-kakao">
                  <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
                  카카오맵
                </a>
              </div>
            </div>
          </div>
          <div class="directions-cta">
            <h4>진료 예약 · 문의</h4>
          </div>
        </div>
        <div class="directions-map">
          <div id="daumRoughmapContainer1777532447206" class="root_daum_roughmap root_daum_roughmap_landing"></div>
        </div>
      </div>
    </div>
  </section>`;

  res.send(renderPage({
    title: '오시는 길',
    activeCategoryId: 'about',
    bodyContent: body,
    extraCss: '<link rel="stylesheet" href="/css/pages.css"><link rel="stylesheet" href="/css/directions-page.css">',
    extraJs: '<script src="/js/page-anim.js"></script><script charset="UTF-8" src="https://ssl.daumcdn.net/dmaps/map_js_init/roughmapLoader.js"></script><script charset="UTF-8">new daum.roughmap.Lander({"timestamp":"1777532447206","key":"my5vbpm2yac","mapWidth":"640","mapHeight":"360"}).render();</script>',
    description: '경기도 고양시 일산서구 중앙로 1388, 태화프라자 동관 2층. 3호선 주엽역 인근. 네이버·카카오지도로 길찾기.',
    canonicalPath: '/about/directions'
  }));
});

// /nephrology/hemodialysis 전용 라우트 (투석기기 섹션 포함)
app.get('/nephrology/hemodialysis', (req, res) => {
  const cat = NAVIGATION.find(n => n.id === 'nephrology');
  const child = cat.children.find(c => c.href === '/nephrology/hemodialysis');
  const why = WHY_DATA[child.href];
  const whyImg = WHY_SECTION_IMAGES['nephrology'];
  const content = PAGE_CONTENT[child.href];
  const catImg = ARTICLE_IMAGES[child.href] || ARTICLE_IMAGES._default;

  const whySection = why ? `
  <section class="why-section">
    <div class="page-container"><div class="why-grid">
      <div class="why-image" data-anim>
        <img src="${whyImg}" alt="${child.label}" loading="lazy">
        <div class="why-image-overlay"><span>${why.overlay}</span></div>
      </div>
      <div class="why-content" data-anim>
        <h2 class="why-title"><em>WHY</em> 연세이내과</h2>
        <div class="why-badge" style="--badge-color:${cat.color}">${why.badge}</div>
        <p class="why-desc">${why.desc}</p>
        <div class="why-divider"></div>
        <ul class="why-features">${why.features.map(f => '<li><svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M20 6 9 17l-5-5"/></svg>' + f + '</li>').join('')}</ul>
      </div>
    </div></div>
  </section>` : '';

  const machineSection = `
  <section class="dialysis-hl-section dialysis-hl-page">
    <div class="page-container">
      <div class="dialysis-hl-inner">
        <div class="dialysis-hl-img-wrap">
          <img src="https://5.imimg.com/data5/SELLER/Default/2023/12/369116022/IV/MF/TP/68792294/fresenius-5008-5008s-hemodialysis-machine.jpg" alt="Fresenius 5008S 혈액투석기" loading="lazy">
        </div>
        <div class="dialysis-hl-content">
          <span class="dialysis-hl-badge">HEMODIALYSIS EQUIPMENT</span>
          <h3>혈액투석여과요법(HDF)이 가능한<br>5008S(Basic ONLINEplus) 제품 설치 병원</h3>
          <p>독일 Fresenius Medical Care의 최신 혈액투석기입니다.<br>
          일반 혈액투석(HD)보다 중분자량 독소 제거 효과가 뛰어난<br>
          온라인 혈액투석여과요법(Online-HDF)을 제공하여<br>
          투석 환자의 생존율과 삶의 질 향상에 기여합니다.</p>
        </div>
      </div>
    </div>
  </section>`;

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
      <ul class="gen-bullet">${content.process.map(p => '<li>' + p + '</li>').join('')}</ul>
    </div>
    <div class="gen-simple-list" data-anim>
      <h2>${content.strengthTitle}</h2>
      <ul class="gen-check">${content.strengths.map(s => '<li>' + s + '</li>').join('')}</ul>
    </div>
  </div></section>` : '';

  const body = `
  <section class="page-hero page-hero-sm" style="--hero-color:${cat.color}">
    <div class="page-hero-inner" data-anim>
      <h1>${child.label}</h1>
      <p>${child.desc}</p>
    </div>
  </section>
  ${whySection}
  ${machineSection}
  ${articleHtml}
  <section class="page-section"><div class="page-container page-narrow">
    <div class="page-cta" data-anim>
      <h3>진료 예약 및 문의</h3>
      <a href="tel:031-922-1570" class="cta-btn">031-922-1570</a>
    </div>
  </div></section>`;

  res.send(renderPage({
    title: child.label,
    activeCategoryId: 'nephrology',
    bodyContent: body,
    extraCss: '<link rel="stylesheet" href="/css/pages.css"><link rel="stylesheet" href="/css/why-section.css"><link rel="stylesheet" href="/css/colonoscopy.css">',
    extraJs: '<script src="/js/page-anim.js"></script>',
    description: '최신 Fresenius 5008S 혈액투석기 보유. 신장내과 전문의 직접 관리. HDF(혈액투석여과요법) 가능한 연세이내과 혈액투석센터.',
    canonicalPath: '/nephrology/hemodialysis'
  }));
});

// /about/hours 진료시간 (실시간 오늘 표시)
app.get('/about/hours', (req, res) => {
  const cat = NAVIGATION.find(n => n.id === 'about');

  const body = `
  <section class="page-hero page-hero-sm" style="--hero-color:${cat.color}">
    <div class="page-hero-inner" data-anim>
      <h1>진료시간</h1>
      <p>평일·토요일·공휴일 진료 안내</p>
    </div>
  </section>
  <section class="page-section">
    <div class="page-container page-narrow">

      <div class="breadcrumb" data-anim>
        <a href="/">홈</a> <span>›</span>
        <a href="/about">병원소개</a> <span>›</span>
        <span class="current">진료시간</span>
      </div>

      <!-- 실시간 상태 배너 -->
      <div class="hours-status-wrap" data-anim>
        <div class="hours-status-badge" id="hoursStatusBadge">
          <span class="hours-status-dot" id="hoursStatusDot"></span>
          <span id="hoursStatusText">확인 중...</span>
        </div>
        <p class="hours-status-sub" id="hoursStatusSub"></p>
      </div>

      <!-- 진료시간표 -->
      <div class="hours-table" data-anim>
        <div class="hours-row" id="row-weekday">
          <div class="hours-day-wrap">
            <span class="hours-day">월요일 – 금요일</span>
            <span class="hours-today-tag" id="tag-weekday"></span>
          </div>
          <div class="hours-time-wrap">
            <span class="hours-time">09:00 – 18:00</span>
            <span class="hours-lunch-note">점심 12:00 – 13:00</span>
          </div>
        </div>
        <div class="hours-row" id="row-sat">
          <div class="hours-day-wrap">
            <span class="hours-day">토요일</span>
            <span class="hours-today-tag" id="tag-sat"></span>
          </div>
          <div class="hours-time-wrap">
            <span class="hours-time">09:00 – 13:00</span>
          </div>
        </div>
        <div class="hours-row hours-row-closed" id="row-closed">
          <div class="hours-day-wrap">
            <span class="hours-day">일요일 · 공휴일</span>
            <span class="hours-today-tag" id="tag-closed"></span>
          </div>
          <div class="hours-time-wrap">
            <span class="hours-time hours-time-closed">휴진</span>
          </div>
        </div>
      </div>

      <div class="hours-notice" data-anim>
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/></svg>
        공휴일에는 진료를 하지 않습니다. 점심시간은 12:00 – 13:00입니다.
      </div>

      <div class="page-cta" data-anim>
        <h3>진료 예약 및 문의</h3>
        <a href="tel:031-922-1570" class="cta-btn">031-922-1570</a>
      </div>
    </div>
  </section>`;

  const hoursJs = `
  <script>
  (function() {
    const HOLIDAYS = [
      '2025-01-01','2025-01-28','2025-01-29','2025-01-30',
      '2025-03-01','2025-05-01','2025-05-05','2025-05-06','2025-06-06',
      '2025-08-15','2025-10-03','2025-10-05','2025-10-06','2025-10-07','2025-10-08',
      '2025-10-09','2025-12-25',
      '2026-01-01','2026-01-27','2026-01-28','2026-01-29',
      '2026-02-28','2026-03-01','2026-05-01','2026-05-05','2026-05-24','2026-05-25',
      '2026-06-06','2026-08-15','2026-09-24','2026-09-25','2026-09-26',
      '2026-10-03','2026-10-05','2026-10-09','2026-12-25'
    ];
    const pad = n => String(n).padStart(2,'0');
    const now = new Date();
    const ymd = now.getFullYear()+'-'+pad(now.getMonth()+1)+'-'+pad(now.getDate());
    const day = now.getDay(); // 0=일, 1=월, ..., 6=토
    const h = now.getHours(), m = now.getMinutes();
    const isHoliday = HOLIDAYS.includes(ymd);
    const isSun = day === 0;
    const isSat = day === 6;

    let rowId, tagId, isOpen = false;

    if (isHoliday || isSun) {
      rowId = 'row-closed'; tagId = 'tag-closed';
    } else if (isSat) {
      rowId = 'row-sat'; tagId = 'tag-sat';
      isOpen = (h > 9 || (h === 9 && m >= 0)) && h < 13;
    } else {
      rowId = 'row-weekday'; tagId = 'tag-weekday';
      isOpen = ((h >= 9 && h < 12) || (h >= 13 && h < 18));
    }

    // 오늘 행 강조
    const row = document.getElementById(rowId);
    if (row) row.classList.add('hours-row-today');
    const tag = document.getElementById(tagId);
    if (tag) { tag.textContent = '오늘'; tag.style.display = 'inline-block'; }

    // 상태 배너
    const badge = document.getElementById('hoursStatusBadge');
    const dot = document.getElementById('hoursStatusDot');
    const txt = document.getElementById('hoursStatusText');
    const sub = document.getElementById('hoursStatusSub');

    const DAY_KO = ['일','월','화','수','목','금','토'];
    const timeStr = pad(h)+':'+pad(m);
    sub.textContent = DAY_KO[day]+'요일 · 현재 '+timeStr+(isHoliday?' · 공휴일':'');

    if (isOpen) {
      badge.classList.add('hours-status-open');
      dot.style.background = '#22c55e';
      txt.textContent = '지금 진료 중';
    } else {
      badge.classList.add('hours-status-closed');
      dot.style.background = '#ef4444';
      txt.textContent = '현재 휴진';
    }
  })();
  </script>`;

  res.send(renderPage({
    title: '진료시간',
    activeCategoryId: 'about',
    bodyContent: body,
    extraCss: '<link rel="stylesheet" href="/css/pages.css">',
    extraJs: '<script src="/js/page-anim.js"></script>' + hoursJs,
    description: '연세이내과 진료시간 안내. 평일 09:00–18:00, 토요일 09:00–13:00, 점심시간 12:00–13:00. 공휴일·일요일 휴진.',
    canonicalPath: '/about/hours'
  }));
});

// /iv-therapy/general 수액센터 통합 페이지
app.get('/iv-therapy/general', (req, res) => {
  const cat = NAVIGATION.find(n => n.id === 'iv-therapy');
  const child = { label: '수액센터', href: '/iv-therapy/general', desc: '피로회복·영양·면역 맞춤 수액 치료를 제공합니다.' };
  const why = WHY_DATA['/iv-therapy/general'];
  const whyImg = WHY_SECTION_IMAGES['iv-therapy'];

  const whySection = `
  <section class="why-section">
    <div class="page-container"><div class="why-grid">
      <div class="why-image" data-anim>
        <img src="${whyImg}" alt="수액센터">
        <div class="why-image-overlay"><span>${why.overlay}</span></div>
      </div>
      <div class="why-content" data-anim>
        <h2 class="why-title"><em>WHY</em> 연세이내과</h2>
        <div class="why-badge" style="--badge-color:${cat.color}">${why.badge}</div>
        <p class="why-desc">${why.desc}</p>
        <div class="why-divider"></div>
        <ul class="why-features">${why.features.map(f => '<li><svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M20 6 9 17l-5-5"/></svg>' + f + '</li>').join('')}</ul>
      </div>
    </div></div>
  </section>`;

  const IV_ITEMS = [
    {
      id: 'general', label: '피로회복수액', color: '#C0763A',
      icon: '<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M13 2 3 14h9l-1 8 10-12h-9l1-8z"/></svg>',
      desc: '만성피로·에너지 고갈에 효과적인 수액으로 활기를 되찾습니다.',
      components: ['고농도 비타민B군', '마그네슘', '아연', '글루타치온'],
    },
    {
      id: 'nutrition', label: '영양수액', color: '#4A7C59',
      icon: '<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M12 2a10 10 0 1 0 0 20A10 10 0 0 0 12 2z"/><path d="M12 6v6l4 2"/></svg>',
      desc: '부족한 비타민과 미네랄을 빠르게 보충하는 영양 공급 수액입니다.',
      components: ['비타민A·C·E 복합', '미네랄 복합체', '아미노산', '셀레늄'],
    },
    {
      id: 'immune', label: '면역수액', color: '#1B4965',
      icon: '<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>',
      desc: '면역력 강화와 잦은 감기·피로감 개선에 도움을 드리는 수액입니다.',
      components: ['고용량 비타민C', '아연', '셀레늄', '비타민D'],
    },
    {
      id: 'whitening', label: '미백수액', color: '#7B5EA7',
      icon: '<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>',
      desc: '글루타치온으로 피부 톤을 밝히고 강력한 항산화 효과를 제공합니다.',
      components: ['글루타치온', '고농도 비타민C', '알파리포산', '비오틴'],
    },
    {
      id: 'diet', label: '다이어트수액', color: '#C0543A',
      icon: '<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/></svg>',
      desc: 'L-카르니틴으로 지방 연소를 보조하고 대사를 활성화합니다.',
      components: ['L-카르니틴', '비타민B군', '마그네슘', '크롬'],
    },
  ];

  const ivCards = IV_ITEMS.map(item => `
    <div class="iv-card" id="${item.id}" data-anim>
      <div class="iv-card-top" style="background:${item.color}">
        <div class="iv-card-icon">${item.icon}</div>
        <h3>${item.label}</h3>
      </div>
      <div class="iv-card-body">
        <p class="iv-card-desc">${item.desc}</p>
        <div class="iv-card-comp-label">주요 성분</div>
        <ul class="iv-card-comp">
          ${item.components.map(c => `<li>${c}</li>`).join('')}
        </ul>
      </div>
    </div>`).join('');

  const menuSection = `
  <section class="col-detail">
    <div class="page-container">
      <div class="iv-section-header" data-anim>
        <h2>수액 프로그램 안내</h2>
        <p>개인의 상태와 목적에 맞게 전문의가 직접 처방합니다</p>
      </div>
      <div class="iv-grid">${ivCards}</div>
    </div>
  </section>`;

  const ctaSection = `
  <section class="page-section"><div class="page-container page-narrow">
    <div class="page-cta" data-anim>
      <h3>진료 예약 및 문의</h3>
      <a href="tel:031-922-1570" class="cta-btn">031-922-1570</a>
    </div>
  </div></section>`;

  const body = `
  <section class="page-hero page-hero-sm" style="--hero-color:${cat.color}">
    <div class="page-hero-inner" data-anim>
      <h1>수액센터</h1>
      <p>피로회복·영양·면역·미백·다이어트 맞춤 수액 치료</p>
    </div>
  </section>
  ${whySection}
  ${menuSection}
  ${ctaSection}`;

  res.send(renderPage({
    title: '수액센터',
    activeCategoryId: 'iv-therapy',
    bodyContent: body,
    extraCss: '<link rel="stylesheet" href="/css/pages.css"><link rel="stylesheet" href="/css/why-section.css"><link rel="stylesheet" href="/css/article.css">',
    extraJs: '<script src="/js/page-anim.js"></script>'
  }));
});

// /about/gallery 둘러보기 갤러리 페이지
app.get('/about/gallery', (req, res) => {
  const GALLERY_IMGS = [
    { src: 'https://cdn.imweb.me/upload/S20260108b9005a7eb2710/c083a202cc5e6.png', alt: '원내 시설 1' },
    { src: 'https://cdn.imweb.me/upload/S20260108b9005a7eb2710/a9571802204d5.png', alt: '원내 시설 2' },
    { src: 'https://cdn.imweb.me/upload/S20260108b9005a7eb2710/5156480ce2cce.png', alt: '원내 시설 3' },
    { src: 'https://cdn.imweb.me/upload/S20260108b9005a7eb2710/264029ec718d7.png', alt: '원내 시설 4' },
    { src: 'https://cdn.imweb.me/upload/S20260108b9005a7eb2710/a4892fa561eaf.png', alt: '원내 시설 5' },
    { src: 'https://cdn.imweb.me/upload/S20260108b9005a7eb2710/a5716bbbcea1c.png', alt: '원내 시설 6' },
    { src: 'https://cdn.imweb.me/upload/S20260108b9005a7eb2710/65bcf1a1fb398.png', alt: '원내 시설 7' },
    { src: 'https://cdn.imweb.me/upload/S20260108b9005a7eb2710/17e884a84f100.png', alt: '원내 시설 8' },
    { src: 'https://cdn.imweb.me/upload/S20260108b9005a7eb2710/380b6a478edfc.png', alt: '원내 시설 9' },
    { src: 'https://cdn.imweb.me/upload/S20260108b9005a7eb2710/55442e3d65ac5.png', alt: '원내 시설 10' },
    { src: 'https://cdn.imweb.me/upload/S20260108b9005a7eb2710/34964b2b5715e.png', alt: '원내 시설 11' },
    { src: 'https://cdn.imweb.me/upload/S20260108b9005a7eb2710/401187f029c58.png', alt: '원내 시설 12' },
    { src: 'https://cdn.imweb.me/upload/S20260108b9005a7eb2710/33b1f6b37fd63.png', alt: '원내 시설 13' },
    { src: 'https://cdn.imweb.me/upload/S20260108b9005a7eb2710/08f4445e31b17.png', alt: '원내 시설 14' },
    { src: 'https://cdn.imweb.me/upload/S20260108b9005a7eb2710/a937a93aa9df7.png', alt: '원내 시설 15' },
    { src: 'https://cdn.imweb.me/upload/S20260108b9005a7eb2710/cf7d331f24685.png', alt: '원내 시설 16' },
  ];
  const gridItems = GALLERY_IMGS.map((img, i) => `
    <div class="gallery-item" data-anim data-delay="${i % 4}">
      <div class="gallery-img-wrap">
        <img src="${img.src}" alt="${img.alt}" loading="lazy">
        <div class="gallery-overlay">
          <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="1.5"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/><path d="M11 8v6M8 11h6"/></svg>
        </div>
      </div>
    </div>`).join('');

  const body = `
  <section class="page-hero page-hero-sm" style="--hero-color:#5F5E5A">
    <div class="page-hero-inner" data-anim>
      <h1>둘러보기</h1>
      <p>연세이내과 원내 시설을 사진으로 만나보세요</p>
    </div>
  </section>
  <section class="page-section">
    <div class="page-container">
      <div class="breadcrumb" data-anim>
        <a href="/">홈</a> <span>›</span>
        <a href="/about">병원소개</a> <span>›</span>
        <span class="current">둘러보기</span>
      </div>
      <div class="gallery-intro" data-anim>
        <h2>원내 시설 갤러리</h2>
        <p>대학병원 교수출신 의료진의 기준을 담은 공간에서<br>편안하고 체계적인 진료를 경험하세요.</p>
      </div>
      <div class="gallery-grid">${gridItems}</div>

      <!-- 라이트박스 -->
      <div class="lightbox" id="lightbox">
        <button class="lightbox-close" id="lightboxClose">
          <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
        </button>
        <button class="lightbox-prev" id="lightboxPrev">&#10094;</button>
        <div class="lightbox-img-wrap">
          <img id="lightboxImg" src="" alt="">
        </div>
        <button class="lightbox-next" id="lightboxNext">&#10095;</button>
        <div class="lightbox-counter"><span id="lightboxCurrent">1</span> / ${GALLERY_IMGS.length}</div>
      </div>
    </div>
  </section>`;

  const lightboxJs = `
  <script>
    const imgs = ${JSON.stringify(GALLERY_IMGS.map(i => i.src))};
    let cur = 0;
    const lb = document.getElementById('lightbox');
    const lbImg = document.getElementById('lightboxImg');
    const lbCur = document.getElementById('lightboxCurrent');

    function openLightbox(idx) {
      cur = idx;
      lbImg.src = imgs[cur];
      lbCur.textContent = cur + 1;
      lb.classList.add('active');
      document.body.style.overflow = 'hidden';
    }
    function closeLightbox() {
      lb.classList.remove('active');
      document.body.style.overflow = '';
    }
    function moveLightbox(dir) {
      cur = (cur + dir + imgs.length) % imgs.length;
      lbImg.src = imgs[cur];
      lbCur.textContent = cur + 1;
    }

    document.querySelectorAll('.gallery-item').forEach((el, i) => {
      el.addEventListener('click', () => openLightbox(i));
    });
    document.getElementById('lightboxClose').addEventListener('click', closeLightbox);
    document.getElementById('lightboxPrev').addEventListener('click', () => moveLightbox(-1));
    document.getElementById('lightboxNext').addEventListener('click', () => moveLightbox(1));
    lb.addEventListener('click', e => { if (e.target === lb) closeLightbox(); });
    document.addEventListener('keydown', e => {
      if (!lb.classList.contains('active')) return;
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowLeft') moveLightbox(-1);
      if (e.key === 'ArrowRight') moveLightbox(1);
    });
  </script>`;

  res.send(renderPage({
    title: '둘러보기',
    activeCategoryId: 'about',
    bodyContent: body,
    extraCss: '<link rel="stylesheet" href="/css/pages.css"><link rel="stylesheet" href="/css/gallery.css">',
    extraJs: '<script src="/js/page-anim.js"></script>' + lightboxJs
  }));
});

// 카테고리 인덱스 → 첫 번째 세부페이지로 리다이렉트
const CAT_BASE = { about:'/about', chronic:'/chronic', nephrology:'/nephrology', 'iv-therapy':'/iv-therapy' };
NAVIGATION.forEach(cat => {
  const basePath = CAT_BASE[cat.id];
  if (basePath && basePath !== cat.href) {
    app.get(basePath, (req, res) => res.redirect(301, cat.children[0].href));
  }

  // 세부 페이지들
  cat.children.forEach(child => {
    if (child.href === '/about/philosophy') return;
    if (child.href === '/about/doctors') return;
    if (child.href === '/about/hours') return;
    if (child.href === '/about/directions') return;
    if (child.href === '/about/gallery') return;
    if (child.href === '/nephrology/hemodialysis') return;
    if (child.href.startsWith('/iv-therapy/')) {
      app.get(child.href, (req, res) => res.redirect(301, '/iv-therapy/general'));
      return;
    }
    app.get(child.href, (req, res) => {
      res.send(renderSubPage(cat, child));
    });
  });
});

app.listen(PORT, () => {
  console.log(`연세이내과 홈페이지가 http://localhost:${PORT} 에서 실행 중입니다.`);
});
