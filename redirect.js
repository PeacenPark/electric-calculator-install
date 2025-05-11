// 설치 페이지 리디렉션 및 경로 처리

// URL 단축 경로 매핑
const pathMappings = {
  // 기본 경로 (직접 접근 URL)
  '/': '/index.html',
  '/install': '/index.html?auto=true',
  '/get': '/index.html?source=direct',
  '/app': '/index.html?source=app',
  '/qr': '/index.html?source=qr',
  
  // 마케팅 경로 (출처 추적용)
  '/m/email': '/index.html?source=email&campaign=newsletter',
  '/m/social': '/index.html?source=social&campaign=facebook',
  '/m/blog': '/index.html?source=blog&campaign=naver',
  
  // 언어별 경로 (다국어 지원 - 미래 확장용)
  '/en': '/index.html?lang=en',
  '/jp': '/index.html?lang=ja',
  
  // 원본 앱으로 리디렉션
  '/app/main': 'https://peacenpark.github.io/electric/',
  '/app/cable': 'https://peacenpark.github.io/electric//cable2.html'
};

// 현재 경로 확인
const currentPath = window.location.pathname;

// 패스 매칭 함수 (GitHub Pages 404 페이지 리디렉션 처리용)
function handleRedirect() {
  // GitHub Pages 404 페이지에서만 실행 (임의로 설정한 쿼리 파라미터로 검사)
  if (window.location.search.includes('is404=true')) {
    // 경로 정리 (뒤의 슬래시 제거)
    const path = currentPath.endsWith('/') && currentPath !== '/' 
      ? currentPath.slice(0, -1) 
      : currentPath;
    
    // 매핑된 경로가 있는지 확인
    if (pathMappings[path]) {
      // 매핑된 URL로 리디렉션 (원본 앱 주소인 경우)
      if (pathMappings[path].startsWith('http')) {
        window.location.href = pathMappings[path];
      } 
      // 내부 페이지 리디렉션
      else {
        // 현재 도메인 기준 URL 생성
        const baseUrl = `${window.location.protocol}//${window.location.host}`;
        window.location.href = `${baseUrl}${pathMappings[path]}`;
      }
    } 
    // 매핑이 없는 경우 기본 페이지로
    else {
      window.location.href = '/';
    }
  }
}

// 설치 완료 후 리디렉션 함수
function redirectAfterInstall() {
  // 설치 완료 이후 원본 앱으로 리디렉션 (선택 사항)
  // 현재는 비활성화 - 필요 시 아래 코드를 활성화
  /*
  if (window.matchMedia('(display-mode: standalone)').matches || 
      window.navigator.standalone === true) {
    
    // 로컬 스토리지로 최초 방문 확인
    const isFirstVisit = !localStorage.getItem('appInstalled');
    
    if (isFirstVisit) {
      // 최초 방문 표시 저장
      localStorage.setItem('appInstalled', 'true');
      
      // 3초 후 원본 앱으로 리디렉션
      setTimeout(() => {
        window.location.href = 'https://원본앱주소.com';
      }, 3000);
    }
  }
  */
}

// URL 매개변수 파싱
function getURLParams() {
  const params = new URLSearchParams(window.location.search);
  const result = {};
  
  for (const [key, value] of params) {
    result[key] = value;
  }
  
  return result;
}

// 출처 추적 및 기록
function trackSource() {
  const params = getURLParams();
  const source = params.source || 'direct';
  const campaign = params.campaign || 'none';
  
  // 로컬 스토리지에 출처 정보 저장
  localStorage.setItem('installSource', source);
  localStorage.setItem('installCampaign', campaign);
  
  // 콘솔에 기록 (디버깅용)
  console.log(`설치 출처: ${source}, 캠페인: ${campaign}`);
  
  // Google Analytics에 이벤트 전송 (선택사항)
  if (typeof gtag === 'function') {
    gtag('event', 'page_view', {
      'source': source,
      'campaign': campaign
    });
  }
}

// 페이지 로드 시 실행
document.addEventListener('DOMContentLoaded', function() {
  // 리디렉션 처리
  handleRedirect();
  
  // 설치 후 처리
  redirectAfterInstall();
  
  // 출처 추적
  trackSource();
});