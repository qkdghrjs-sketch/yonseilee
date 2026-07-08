const NAVIGATION = [
  {
    id: 'about',
    label: '병원소개',
    href: '/about/doctors',
    color: '#5F5E5A',
    children: [
      { label: '의료진 소개', href: '/about/doctors',    icon: 'stethoscope',  desc: '대학병원 교수출신 신장내과 전문의 프로필' },
      { label: '둘러보기',    href: '/about/gallery',    icon: 'image',        desc: '연세이내과 원내 시설 사진' },
      { label: '오시는길',    href: '/about/directions',  icon: 'map-pin',     desc: '고양시 일산서구 중앙로 1388' },
      { label: '진료시간',    href: '/about/hours',       icon: 'clock',       desc: '평일·주말·공휴일 진료 안내' },
    ]
  },
  {
    id: 'nephrology',
    label: '신장내과센터',
    href: '/nephrology/ckd',
    color: '#1B4965',
    children: [
      { label: '만성콩팥병',   href: '/nephrology/ckd',                   icon: 'activity',   desc: '만성콩팥병 조기진단 및 관리' },
      { label: '혈액투석',     href: '/nephrology/hemodialysis',          icon: 'droplets',   desc: '최신 혈액투석 장비 운영' },
      { label: '사구체신염',   href: '/nephrology/glomerulonephritis',    icon: 'scan',       desc: '사구체신염 정밀 진단·치료' },
      { label: '단백뇨·혈뇨', href: '/nephrology/proteinuria',           icon: 'test-tubes', desc: '단백뇨·혈뇨 원인 분석' },
      { label: '전해질이상',   href: '/nephrology/electrolyte',           icon: 'gauge',      desc: '전해질 불균형 교정 치료' },
      { label: '신장초음파',   href: '/nephrology/ultrasound',            icon: 'radio',      desc: '신장 정밀 초음파 검사' },
    ]
  },
  {
    id: 'chronic',
    label: '만성질환클리닉',
    href: '/chronic/hypertension',
    color: '#4A3F5C',
    children: [
      { label: '고혈압',     href: '/chronic/hypertension',   icon: 'gauge',      desc: '혈압 관리 및 합병증 예방' },
      { label: '당뇨',      href: '/chronic/diabetes',       icon: 'droplets',   desc: '혈당 조절과 맞춤 치료' },
      { label: '고지혈증',  href: '/chronic/hyperlipidemia', icon: 'test-tubes', desc: '콜레스테롤·중성지방 관리' },
      { label: '갑상선질환', href: '/chronic/thyroid',       icon: 'scan',       desc: '갑상선 기능 이상 진단·치료' },
    ]
  },
  {
    id: 'iv-therapy',
    label: '수액센터',
    href: '/iv-therapy/general',
    color: '#5C4B3A',
    children: [
      { label: '수액 안내', href: '/iv-therapy/general', icon: 'zap', desc: '피로회복·영양·면역·미백·다이어트 맞춤 수액' },
    ]
  },
];

module.exports = { NAVIGATION };
