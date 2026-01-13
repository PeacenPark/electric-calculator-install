# 북마크 자동 리디렉션 작동 방식

## 🎯 목표
설치 페이지를 북마크하면 실제 앱이 실행되도록 만들기

## 📊 작동 플로우

### iOS Safari - "홈 화면에 추가" 경우

```
┌─────────────────────────────────────────────────────────────┐
│ 1. 브라우저에서 접속                                           │
│    https://electric-install.netlify.app                      │
│    → 설치 안내 페이지 표시 (리디렉션 안 됨)                     │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ 2. Safari 공유 → "홈 화면에 추가"                              │
│    → 홈 화면에 아이콘 생성                                      │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ 3. 홈 화면 아이콘 탭                                           │
│    → display-mode: standalone 감지                           │
│    → 즉시 리디렉션!                                            │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ 4. 실제 앱 실행                                                │
│    https://electricalcal.netlify.app                         │
│    ✅ 사용자는 전기 계산기 앱을 사용                             │
└─────────────────────────────────────────────────────────────┘
```

### Android Chrome - PWA 설치 경우

```
┌─────────────────────────────────────────────────────────────┐
│ 1. 브라우저에서 접속                                           │
│    https://electric-install.netlify.app                      │
│    → "웹사이트로 이동" 버튼 표시                                │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ 2. "웹사이트로 이동" 클릭                                       │
│    → https://electricalcal.netlify.app 이동                  │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ 3. 실제 앱에서 PWA 설치                                        │
│    → 주소창 설치 아이콘 클릭                                    │
│    → manifest.json의 start_url 사용                          │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ 4. PWA 앱 실행                                                │
│    https://electricalcal.netlify.app                         │
│    ✅ 사용자는 전기 계산기 앱을 사용                             │
└─────────────────────────────────────────────────────────────┘
```

## 🔑 핵심 코드

### index.html의 `<head>` 섹션

```html
<script>
  // Standalone 모드(홈 화면에서 실행)인지 확인
  const isStandalone = window.matchMedia('(display-mode: standalone)').matches || 
                      window.navigator.standalone === true;
  
  if (isStandalone) {
    // 홈 화면 아이콘으로 실행된 경우 즉시 실제 앱으로 이동
    window.location.replace('https://electricalcal.netlify.app');
  }
</script>
```

### 왜 `window.location.replace()`를 사용하나?

- `replace()`: 브라우저 히스토리에 남지 않음
- 사용자가 뒤로가기를 누르면 설치 페이지로 돌아가지 않음
- 더 자연스러운 앱 실행 경험 제공

## 🧪 테스트 시나리오

### 시나리오 1: 브라우저에서 접속
```
입력: Safari로 electric-install.netlify.app 접속
결과: 설치 안내 페이지 표시 (리디렉션 없음)
이유: isStandalone = false
```

### 시나리오 2: 홈 화면에서 실행
```
입력: 홈 화면 아이콘 탭
결과: 즉시 electricalcal.netlify.app로 리디렉션
이유: isStandalone = true
```

### 시나리오 3: 북마크 후 브라우저에서 다시 접속
```
입력: 북마크 저장 → Safari에서 북마크로 접속
결과: 설치 안내 페이지 표시 (리디렉션 없음)
이유: isStandalone = false (브라우저 내에서 실행)
```

## ⚠️ 주의사항

### 1. display-mode 감지
- iOS Safari: `window.navigator.standalone`
- Android Chrome: `window.matchMedia('(display-mode: standalone)')`
- 둘 다 체크해야 모든 기기에서 작동

### 2. 리디렉션 타이밍
- `<head>` 섹션에 스크립트 배치
- 페이지 로드 전에 리디렉션 실행
- 사용자는 설치 페이지를 보지 못함

### 3. 무한 리디렉션 방지
- 실제 앱(`electricalcal.netlify.app`)에는 리디렉션 스크립트 없음
- 설치 페이지에만 리디렉션 로직 존재

## 🎨 사용자 경험

### Before (문제)
```
홈 화면 아이콘 탭 
  → electric-install.netlify.app 표시
  → 설치 안내 페이지가 뜸 (혼란)
  → 사용자가 수동으로 실제 앱으로 이동해야 함
```

### After (해결)
```
홈 화면 아이콘 탭 
  → 자동으로 electricalcal.netlify.app 이동
  → 바로 전기 계산기 앱 사용 가능
  → 자연스러운 앱 실행 경험
```

## 🔄 대안 방법 (권장하지 않음)

### 방법 1: 설치 페이지를 실제 앱 내부로 이동
```
❌ 단점: 
- URL 구조 변경 필요
- 기존 링크들 수정 필요
- 복잡한 라우팅 로직 필요
```

### 방법 2: 지연 리디렉션
```javascript
setTimeout(() => {
  if (isStandalone) {
    window.location.replace('https://electricalcal.netlify.app');
  }
}, 1000);
```
```
❌ 단점:
- 1초 동안 설치 페이지가 보임
- 사용자 경험 저하
```

### 방법 3: 현재 방식 (권장) ✅
```javascript
// 즉시 리디렉션
if (isStandalone) {
  window.location.replace('https://electricalcal.netlify.app');
}
```
```
✅ 장점:
- 깨끗한 분리 (설치 페이지 / 실제 앱)
- 즉시 리디렉션으로 자연스러운 경험
- 구현 간단
- 유지보수 쉬움
```

## 📈 개선 가능한 부분

### 1. 로딩 인디케이터 추가
```html
<script>
  const isStandalone = ...;
  
  if (isStandalone) {
    // 리디렉션 전 로딩 표시 (선택사항)
    document.body.innerHTML = '<div style="...">앱을 여는 중...</div>';
    window.location.replace('https://electricalcal.netlify.app');
  }
</script>
```

### 2. 분석 추적
```javascript
if (isStandalone) {
  // 홈 화면 실행 추적
  if (typeof gtag === 'function') {
    gtag('event', 'home_screen_launch');
  }
  window.location.replace('https://electricalcal.netlify.app');
}
```

### 3. 오류 처리
```javascript
try {
  if (isStandalone) {
    window.location.replace('https://electricalcal.netlify.app');
  }
} catch (error) {
  console.error('리디렉션 실패:', error);
  // Fallback: 수동 링크 표시
  document.body.innerHTML = '<a href="https://electricalcal.netlify.app">앱 열기</a>';
}
```

## ✅ 체크리스트

배포 전 확인사항:

- [ ] index.html의 `<head>`에 리디렉션 스크립트 추가
- [ ] 실제 앱 URL이 올바른지 확인
- [ ] iOS Safari에서 테스트
- [ ] Android Chrome에서 테스트
- [ ] 브라우저 접속 시 리디렉션 안 되는지 확인
- [ ] 홈 화면 아이콘 실행 시 리디렉션 되는지 확인
- [ ] 무한 리디렉션이 발생하지 않는지 확인

## 🆘 문제 해결

### 문제: 홈 화면에서 실행해도 리디렉션 안 됨
```
원인: isStandalone 감지 실패
해결: 
1. 콘솔에서 확인: console.log(window.matchMedia('(display-mode: standalone)').matches)
2. iOS인 경우: console.log(window.navigator.standalone)
3. 둘 다 false면 제대로 북마크가 안 된 것
```

### 문제: 브라우저에서도 리디렉션 됨
```
원인: 조건문 오류
해결: isStandalone 체크 로직 확인
```

### 문제: 리디렉션 후 뒤로가기 시 설치 페이지로 돌아감
```
원인: window.location.href 사용
해결: window.location.replace() 사용 (히스토리에 남지 않음)
```
