# MPTI

보드게임 취향을 4가지 성향 축으로 분석해 16개 유형 중 하나를 보여주는 React 기반 테스트입니다. 한국어와 영어를 지원하며, 결과 공유와 전체 유형 탐색 기능을 제공합니다.

## 주요 기능

- 23개 문항 기반 성향 테스트
- 4개 성향 축(L/H, I/A, C/P, T/S) 분석
- 16개 결과 유형과 추천·상극 유형 제공
- 한국어/영어 전환 및 선택 언어 유지
- 카카오톡 결과 공유와 링크 복사
- Firebase Firestore 기반 누적 통계
- 모바일 대응 UI

## 기술 스택

- React 19
- Vite 8
- React Router
- Firebase Firestore
- Kakao JavaScript SDK

## 로컬 실행

Node.js를 설치한 뒤 다음 명령을 실행합니다.

```bash
npm install
npm run dev
```

개발 서버 주소는 터미널에 표시됩니다. 로컬 주소의 이미지는 카카오 서버가 접근할 수 없으므로 카카오톡 공유 이미지 확인은 공개 HTTPS 배포 환경에서 진행해야 합니다.

## 환경변수

프로젝트 루트에 `.env.local`을 만들고 다음 값을 설정합니다.

```env
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
VITE_FIREBASE_MEASUREMENT_ID=
VITE_KAKAO_JAVASCRIPT_KEY=
```

카카오 공유를 사용하려면 Kakao Developers에서 JavaScript 키와 실제 배포 도메인을 등록해야 합니다.

## 명령어

```bash
npm run dev      # 개발 서버
npm run lint     # ESLint 검사
npm run build    # 프로덕션 빌드
npm run preview  # 빌드 결과 미리보기
```

## 주요 경로

- `/`: 테스트 소개
- `/test`: 문항 진행
- `/result`: 결과 확인
- `/all`: 전체 유형 보기

## 데이터 구조

통계는 Firestore의 `statistics` 컬렉션에 저장됩니다.

- 운영: `mpti_stats`
- 개발: `mpti_stats_dev`
- `totalTesters`: 전체 완료 횟수
- `types.{TYPE}`: 유형별 결과 횟수
- `extraQuestions.{TAG}`: 21~23번 태그 응답 횟수
- `questionAnswers.q1`~`q20`: 문항별 선택지 응답 횟수
- `shareCount`: 공유 횟수

개별 사용자의 전체 응답 문서는 저장하지 않습니다.

## 배포 전 확인

```bash
npm run lint
npm run build
```

배포 환경에는 Firebase 및 Kakao 환경변수를 모두 설정하고, 카카오 공유 이미지 URL이 외부에서 HTTPS로 접근 가능한지 확인합니다.
