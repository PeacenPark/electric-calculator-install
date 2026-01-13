# 전기계산기 PWA 설치 페이지 - 최종 배포본

## 📍 배포 구조

```
설치 페이지: https://electric-install.netlify.app
실제 앱:     https://electricalcal.netlify.app
```

## 🔧 수정된 파일 목록

### 1. manifest.json
```json
{
  "start_url": "https://electricalcal.netlify.app",
  "shortcuts": [
    { "url": "https://electricalcal.netlify.app/cable2.html" },
    { "url": "https://electricalcal.netlify.app/conduit-size.html" }
  ]
}
```

### 2. install.js
- 모든 리디렉션 URL: `https://electricalcal.netlify.app`
- QR 코드 생성 URL: `https://electricalcal.netlify.app`
- iOS Safari: 수동 설치 안내 모달 표시
- Chrome/Edge: 3초 후 "웹사이트로 이동" 버튼 제공

### 3. redirect.js
- 앱 리디렉션 경로: `https://electricalcal.netlify.app`
- 설치 완료 후 자동 리디렉션

### 4. 404.html (Netlify 전용)
- 단축 URL 리디렉션 처리
- `/app` → 실제 앱으로 이동
- `/get`, `/install`, `/qr` → 설치 페이지로 이동

## 📦 배포 방법

### electric-install.netlify.app에 배포할 파일들:

```
electric-install/
├── index.html           (업로드하신 파일 사용)
├── manifest.json        (✅ 이 파일로 교체)
├── 404.html            (✅ 새로 추가)
├── css/
│   └── styles.css      (업로드하신 파일 사용)
├── js/
│   ├── install.js      (✅ 이 파일로 교체)
│   └── redirect.js     (✅ 이 파일로 교체)
├── icons/
│   ├── icon-192x192.png
│   └── icon-512x512.png
├── images/
│   └── app-preview.png
└── sw.js               (업로드하신 파일 사용)
```

## 🎯 작동 방식

### iOS Safari
1. `electric-install.netlify.app` 접속
2. "iOS에 설치하기" 버튼 클릭
3. 수동 설치 안내 모달 표시
4. Safari 공유 → "홈 화면에 추가" 안내
5. 사용자가 수동으로 설치

### Android Chrome
1. `electric-install.netlify.app` 접속
2. 3초 대기
3. "웹사이트로 이동" 버튼 표시
4. 버튼 클릭 → `electricalcal.netlify.app`로 이동
5. 실제 앱에서 PWA 설치 가능

## ⚠️ 중요: PWA 설치 프롬프트가 나타나지 않는 이유

현재 구조는 **"설치 안내 페이지"**와 **"실제 앱"**이 분리되어 있습니다:

- `electric-install.netlify.app` = 설치 안내만 제공
- `electricalcal.netlify.app` = 실제 PWA 앱

Chrome의 자동 PWA 설치 프롬프트는 **실제 앱 주소**에서만 발생합니다.

### 해결 방법

**Option 1: 현재 구조 유지 (권장)**
- iOS: 수동 설치 안내 제공
- Android/Desktop: 실제 앱으로 리디렉션
- 간단하고 명확한 사용자 경험

**Option 2: 실제 앱에 설치 기능 추가**
`electricalcal.netlify.app`에 직접 설치 버튼을 추가하면 Chrome의 자동 프롬프트를 사용할 수 있습니다.

## 🔗 단축 URL 기능

404.html을 통해 다음과 같은 단축 URL이 작동합니다:

```
https://electric-install.netlify.app/app
→ https://electricalcal.netlify.app (실제 앱)

https://electric-install.netlify.app/get
→ https://electric-install.netlify.app/index.html?source=direct

https://electric-install.netlify.app/install
→ https://electric-install.netlify.app/index.html?auto=true

https://electric-install.netlify.app/qr
→ https://electric-install.netlify.app/index.html?source=qr
```

## 📱 테스트 체크리스트

### iOS Safari
- [ ] 설치 페이지 접속
- [ ] "iOS에 설치하기" 버튼이 활성화되어 있음
- [ ] 버튼 클릭 시 모달 표시
- [ ] Safari 공유 → 홈 화면에 추가 안내 확인
- [ ] 홈 화면에 아이콘 추가 성공
- [ ] 아이콘 클릭 시 실제 앱(`electricalcal.netlify.app`) 실행

### Android Chrome
- [ ] 설치 페이지 접속
- [ ] "앱 설치 준비 중..." 표시
- [ ] 3초 후 "웹사이트로 이동" 버튼 표시
- [ ] 버튼 클릭 시 실제 앱으로 이동
- [ ] 실제 앱에서 주소창에 설치 아이콘 확인
- [ ] 설치 아이콘 클릭하여 PWA 설치 성공

### Desktop Chrome
- [ ] 설치 페이지 접속
- [ ] "웹사이트로 이동" 버튼 표시
- [ ] 실제 앱으로 이동
- [ ] 주소창 오른쪽 설치 아이콘 확인

## 🚀 배포 후 확인 사항

1. **캐시 초기화**
   - 기존 페이지를 방문했다면 강력 새로고침 (Ctrl+Shift+R 또는 Cmd+Shift+R)
   - 또는 시크릿 모드에서 테스트

2. **Service Worker 확인**
   - 개발자 도구 → Application → Service Workers
   - 등록 여부 확인

3. **Manifest 확인**
   - 개발자 도구 → Application → Manifest
   - start_url이 `https://electricalcal.netlify.app`인지 확인

4. **Console 로그 확인**
   - 오류 메시지 확인
   - 이벤트 추적 로그 확인

## 💡 추가 개선 제안

### electricalcal.netlify.app에 설치 기능 추가

실제 앱에서도 PWA 설치를 쉽게 하려면:

```html
<!-- electricalcal.netlify.app의 index.html에 추가 -->
<button id="pwaInstallBtn" style="display: none;">
  <i class="fas fa-download"></i> 앱 설치
</button>

<script>
let deferredPrompt;

window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredPrompt = e;
  document.getElementById('pwaInstallBtn').style.display = 'block';
});

document.getElementById('pwaInstallBtn').addEventListener('click', async () => {
  if (deferredPrompt) {
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    deferredPrompt = null;
  }
});
</script>
```

## 📊 분석 및 추적

`localStorage`에 다음 정보가 저장됩니다:

```javascript
// 이벤트 로그 확인
JSON.parse(localStorage.getItem('installEvents'))

// 설치 출처 확인
localStorage.getItem('installSource')
localStorage.getItem('installCampaign')
```

## 🆘 문제 해결

### 문제: iOS에서 "지원하지 않는 브라우저" 표시
✅ **해결됨**: install.js가 iOS Safari를 올바르게 감지하고 "iOS에 설치하기" 버튼 표시

### 문제: Chrome에서 버튼이 작동하지 않음
✅ **해결됨**: 3초 후 "웹사이트로 이동" 버튼으로 전환하여 실제 앱으로 안내

### 문제: PWA 설치 프롬프트가 나타나지 않음
⚠️ **정상**: 설치 페이지는 안내용이며, 실제 PWA 설치는 `electricalcal.netlify.app`에서 가능

## 📞 지원

문제가 발생하면:
1. 브라우저 콘솔에서 오류 확인
2. Service Worker 상태 확인
3. 캐시 초기화 후 재시도
4. 시크릿 모드에서 테스트

---

**개발:** Park Pyung Hwan  
**이메일:** jisa861@naver.com  
**블로그:** https://blog.naver.com/jisa861
