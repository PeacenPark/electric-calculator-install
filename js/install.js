// PWA 설치 스크립트
document.addEventListener('DOMContentLoaded', function() {
  // 서비스 워커 등록
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./sw.js')
      .then(registration => {
        console.log('ServiceWorker 등록 성공:', registration.scope);
      })
      .catch(err => {
        console.log('ServiceWorker 등록 실패:', err);
      });
  }
  
  // 요소 참조
  const installButton = document.getElementById('installButton');
  const iosInstallModal = document.getElementById('iosInstallModal');
  const closeModalButton = document.getElementById('closeModalButton');
  const qrCodeElement = document.getElementById('qrCode');
  
  // 기기 감지
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
  const isAndroid = /Android/.test(navigator.userAgent);
  const isSafari = isIOS && /Safari/.test(navigator.userAgent) && !/Chrome/.test(navigator.userAgent);
  const isChrome = /Chrome/.test(navigator.userAgent);
  
  // 이미 설치된 앱인지 확인
  const isAppInstalled = () => {
    return window.matchMedia('(display-mode: standalone)').matches || 
           (window.navigator.standalone === true) || 
           document.referrer.includes('android-app://');
  };
  
  // 설치 버튼 상태 업데이트
  const updateInstallButtonState = () => {
    if (isAppInstalled()) {
      installButton.textContent = '✓ 이미 설치됨';
      installButton.disabled = true;
      installButton.classList.add('installed');
    } else if (isIOS && isSafari) {
      // iOS Safari - 수동 설치 안내
      installButton.innerHTML = '<i class="fab fa-apple"></i> iOS에 설치하기';
      installButton.disabled = false;
    } else if (deferredPrompt) {
      // Chrome/Edge - 자동 설치 프롬프트
      installButton.innerHTML = '<i class="fas fa-download"></i> 앱 설치하기';
      installButton.disabled = false;
    } else {
      // PWA 설치 프롬프트 대기 중 (Chrome/Edge)
      installButton.innerHTML = '<i class="fas fa-download"></i> 앱 설치 준비 중...';
      installButton.disabled = true;
      
      // 3초 후에도 프롬프트가 없으면 직접 링크 제공
      setTimeout(() => {
        if (!deferredPrompt && !isIOS) {
          installButton.innerHTML = '<i class="fas fa-external-link-alt"></i> 웹사이트로 이동';
          installButton.disabled = false;
          installButton.onclick = () => {
            window.location.href = 'https://electricalcal.netlify.app';
          };
        }
      }, 3000);
    }
  };
  
  // QR 코드 생성 함수 정의
  function generateQRCode() {
    if (qrCodeElement) {
      // 실제 앱 URL을 QR 코드로 생성
      const appUrl = 'https://electricalcal.netlify.app';
      
      // div를 비웁니다
      qrCodeElement.innerHTML = '';
      
      // 새 이미지 요소 생성
      const img = document.createElement('img');
      img.style.width = '200px';
      img.style.height = '200px';
      
      // QR 코드를 데이터 URL로 생성하여 이미지에 설정
      QRCode.toDataURL(appUrl, {
        width: 200,
        margin: 2,
        color: {
          dark: '#2b5596',
          light: '#ffffff'
        }
      }, function(error, url) {
        if (error) {
          console.error('QR 코드 생성 중 오류 발생:', error);
          qrCodeElement.innerHTML = '<p>QR 코드 생성에 실패했습니다.</p>';
        } else {
          img.src = url;
          qrCodeElement.appendChild(img);
        }
      });
    }
  }
  
  // PWA 설치 프롬프트 이벤트
  let deferredPrompt;
  
  // beforeinstallprompt 이벤트 처리
  window.addEventListener('beforeinstallprompt', (e) => {
    // 기본 브라우저 프롬프트 방지
    e.preventDefault();
    
    // 이벤트 저장
    deferredPrompt = e;
    
    // 설치 버튼 상태 업데이트
    updateInstallButtonState();
    
    // 앱 설치 이벤트 추적 (선택사항)
    trackEvent('install_prompt_available');
  });
  
  // 페이지 로드 시 자동 처리
  window.addEventListener('load', () => {
    // 설치 버튼 상태 업데이트
    updateInstallButtonState();
    
    // QR 코드 생성
    generateQRCode();
    
    // URL 파라미터 확인
    const urlParams = new URLSearchParams(window.location.search);
    const autoPrompt = urlParams.get('auto') === 'true';
    const source = urlParams.get('source') || 'direct';
    
    // 출처 기록
    trackEvent('page_view', { source });
    
    // iOS Safari에서 자동 모달 표시
    if (isIOS && isSafari && autoPrompt && !isAppInstalled()) {
      setTimeout(() => {
        iosInstallModal.style.display = 'flex';
      }, 1000);
    }
  });
  
  // 설치 버튼 클릭 이벤트
  installButton.addEventListener('click', async () => {
    if (isIOS && isSafari) {
      // iOS Safari의 경우 설치 안내 모달 표시
      iosInstallModal.style.display = 'flex';
      trackEvent('ios_install_guide_shown');
    } else if (deferredPrompt) {
      // 설치 프롬프트 표시
      deferredPrompt.prompt();
      
      // 사용자 선택 결과 확인
      const { outcome } = await deferredPrompt.userChoice;
      console.log(`설치 결과: ${outcome}`);
      
      // 결과 추적
      trackEvent('install_choice', { outcome });
      
      // 저장된 프롬프트 이벤트 초기화
      deferredPrompt = null;
      
      // 버튼 상태 업데이트
      updateInstallButtonState();
      
      // 설치 성공 시 처리
      if (outcome === 'accepted') {
        trackEvent('install_accepted');
        // 1.5초 후 원본 앱으로 리디렉션
        setTimeout(() => {
          window.location.href = 'https://electricalcal.netlify.app';
        }, 1500);
      }
    }
  });
  
  // iOS 모달 닫기 버튼 이벤트
  closeModalButton.addEventListener('click', () => {
    iosInstallModal.style.display = 'none';
    trackEvent('ios_guide_dismissed');
  });
  
  // 앱 설치 완료 감지
  window.addEventListener('appinstalled', (e) => {
    console.log('앱이 설치되었습니다!');
    trackEvent('app_installed');
    
    // 버튼 상태 업데이트
    updateInstallButtonState();
    
    // 성공 메시지 표시
    const successMessage = document.createElement('div');
    successMessage.className = 'install-success';
    successMessage.innerHTML = '<div class="success-content"><i class="fas fa-check-circle"></i><h3>설치 완료!</h3><p>앱이 성공적으로 설치되었습니다.</p></div>';
    document.body.appendChild(successMessage);
    
    // 3초 후 메시지 제거
    setTimeout(() => {
      document.body.removeChild(successMessage);
      
      // 원본 앱으로 리디렉션
      window.location.href = 'https://electricalcal.netlify.app';
    }, 3000);
  });
  
  // 이벤트 추적 함수 (Google Analytics나 다른 분석 도구와 연동 가능)
  function trackEvent(eventName, eventParams = {}) {
    // 콘솔에 이벤트 기록
    console.log(`이벤트 추적: ${eventName}`, eventParams);
    
    // Google Analytics가 있는 경우
    if (typeof gtag === 'function') {
      gtag('event', eventName, {
        'event_category': 'pwa_install',
        ...eventParams
      });
    }
    
    // 로컬 스토리지에 이벤트 로그 저장 (디버깅용)
    try {
      const events = JSON.parse(localStorage.getItem('installEvents') || '[]');
      events.push({
        event: eventName,
        params: eventParams,
        timestamp: new Date().toISOString()
      });
      localStorage.setItem('installEvents', JSON.stringify(events));
    } catch (err) {
      console.error('이벤트 로깅 오류:', err);
    }
  }
  
  // 화면 방향 변경 감지 (UI 조정 용도)
  let lastWidth = window.innerWidth;
  window.addEventListener('resize', () => {
    // QR 코드 다시 생성 (필요한 경우)
    if (window.innerWidth !== lastWidth) {
      generateQRCode();
      lastWidth = window.innerWidth;
    }
  });
});
