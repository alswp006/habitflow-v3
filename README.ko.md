🇰🇷 [English](./README.md)

# habitflow-v3

매일 습관을 기록하고 스트릭(연속 달성일)을 관리하는 모바일 앱입니다.

## 주요 기능

- **일일 습관 추적**: 간단하고 직관적인 인터페이스로 매일 습관을 기록하세요
- **스트릭 관리**: 각 습관의 연속 완료 일수를 추적하고 관리하세요
- **활성 습관 목록**: 현재 진행 중인 모든 습관을 한눈에 확인하세요
- **습관 편집 및 관리**: 새로운 습관을 만들고, 편집하고, 관리하세요
- **오프라인 지원**: 인터넷 연결 없이 사용 가능하며 로컬에 데이터가 저장됩니다
- **새로고침**: 당겨서 새로고침 기능으로 데이터를 최신 상태로 유지하세요

## 기술 스택

- **프론트엔드**: Next.js 15, React, TypeScript
- **스타일링**: Tailwind CSS, shadcn/ui
- **데이터베이스**: SQLite (better-sqlite3)
- **스토리지**: 클라이언트 측 데이터 지속성을 위한 localStorage
- **패키지 매니저**: pnpm

## 시작하기

### 필수 요구사항

- Node.js 18+ 또는 Bun
- pnpm 8+

### 설치 방법

```bash
# 의존성 설치
pnpm install --ignore-workspace

# 개발 서버 시작
pnpm dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000)을 열어주세요.

## 개발

### 빌드 및 배포

```bash
# 타입 확인
npx tsc --noEmit

# 빌드
npx next build --experimental-app-only

# 테스트
pnpm test
```

### 프로젝트 구조

```
src/
├── app/              # Next.js 15 App Router 페이지
├── components/       # React 컴포넌트 (shadcn/ui)
├── lib/              # 유틸리티 (인증, API, 데이터베이스)
├── store/            # 상태 관리 (Zustand)
├── __tests__/        # 테스트 파일
└── styles/           # 글로벌 스타일
```

## 스크립트

- `pnpm dev` - 개발 서버 시작
- `pnpm build` - 프로덕션용 빌드
- `pnpm test` - Vitest로 테스트 실행
- `pnpm typecheck` - TypeScript 타입 확인 실행

## 라이선스

MIT
