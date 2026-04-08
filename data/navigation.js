const NAVIGATION = [
  {
    id: 'about',
    label: '병원소개',
    href: '/about/doctors',
    color: '#5F5E5A',
    children: [
      { label: '의료진 소개', href: '/about/doctors',    icon: 'stethoscope',  desc: '신장내과 전문의 2인 프로필' },
      { label: '시설 안내',   href: '/about/facility',   icon: 'building',     desc: '최신 장비와 쾌적한 진료 환경' },
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
      { label: '만성콩팥병',       href: '/nephrology/ckd',           icon: 'activity',    desc: '만성콩팥병 조기진단 및 관리' },
      { label: '혈액투석',         href: '/nephrology/hemodialysis',  icon: 'droplets',    desc: '최신 혈액투석 장비 운영' },
      { label: '사구체신염',       href: '/nephrology/glomerulonephritis', icon: 'scan',   desc: '사구체신염 정밀 진단·치료' },
      { label: '단백뇨·혈뇨',     href: '/nephrology/proteinuria',   icon: 'test-tubes',  desc: '단백뇨·혈뇨 원인 분석' },
      { label: '전해질이상',       href: '/nephrology/electrolyte',   icon: 'gauge',       desc: '전해질 불균형 교정 치료' },
      { label: '신장초음파',       href: '/nephrology/ultrasound',    icon: 'radio',       desc: '신장 정밀 초음파 검사' },
    ]
  },
  {
    id: 'ultrasound',
    label: '초음파센터',
    href: '/ultrasound/abdomen',
    color: '#2A4A7F',
    children: [
      { label: '복부초음파',     href: '/ultrasound/abdomen',     icon: 'radio',       desc: '간·담낭·췌장·비장·신장 검사' },
      { label: '갑상선초음파',   href: '/ultrasound/thyroid',     icon: 'scan',        desc: '갑상선 결절·이상 정밀 검사' },
      { label: '심장초음파',     href: '/ultrasound/cardiac',     icon: 'heart-pulse', desc: '심장 구조·기능 정밀 평가' },
      { label: '경동맥초음파',   href: '/ultrasound/carotid',     icon: 'activity',    desc: '경동맥 협착·동맥경화 검사' },
    ]
  },
  {
    id: 'checkup',
    label: '건강검진센터',
    href: '/checkup/general',
    color: '#1A5C48',
    children: [
      { label: '종합건강검진', href: '/checkup/general',    icon: 'clipboard-check', desc: '국가검진·일반·기업·종합검진' },
      { label: '5대암검진',   href: '/checkup/cancer',     icon: 'shield-check',    desc: '위암·대장암·간암·유방암·자궁경부암' },
    ]
  },
  {
    id: 'chronic',
    label: '만성질환클리닉',
    href: '/chronic/hypertension',
    color: '#4A3F5C',
    children: [
      { label: '고혈압',          href: '/chronic/hypertension',   icon: 'gauge',          desc: '혈압 관리 및 합병증 예방' },
      { label: '당뇨',            href: '/chronic/diabetes',       icon: 'droplets',       desc: '혈당 조절과 맞춤 치료' },
      { label: '고지혈증',        href: '/chronic/hyperlipidemia', icon: 'test-tubes',     desc: '콜레스테롤·중성지방 관리' },
      { label: '갑상선질환',      href: '/chronic/thyroid',        icon: 'scan',           desc: '갑상선 기능 이상 진단·치료' },
      { label: '수면장애·불면증', href: '/chronic/sleep',          icon: 'moon-star',      desc: '수면의 질 개선 상담·치료' },
      { label: '이비인후과',      href: '/chronic/ent',            icon: 'ear',            desc: '비염·축농증·인후 질환 진료' },
    ]
  },
  {
    id: 'iv-therapy',
    label: '수액클리닉',
    href: '/iv-therapy/general',
    color: '#5C4B3A',
    children: [
      { label: '피로회복수액',   href: '/iv-therapy/general',     icon: 'zap',         desc: '피로회복 및 에너지 충전' },
      { label: '영양수액',       href: '/iv-therapy/nutrition',   icon: 'apple',       desc: '비타민·미네랄 영양 보충' },
      { label: '면역수액',       href: '/iv-therapy/immune',      icon: 'shield',      desc: '면역력 강화 맞춤 수액' },
      { label: '미백수액',       href: '/iv-therapy/whitening',   icon: 'sun',         desc: '글루타치온 미백 수액' },
      { label: '다이어트수액',   href: '/iv-therapy/diet',        icon: 'flame',       desc: '체지방 감소 보조 수액' },
    ]
  },
];

module.exports = { NAVIGATION };
