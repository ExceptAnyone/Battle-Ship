---
name: auto-test
description: 소스 파일에 대한 Vitest 유닛 테스트를 자동으로 생성하고 실행합니다. "/auto-test [대상 파일 경로]" 형태로 사용합니다. 인자 없이 호출하면 git diff 기반으로 변경된 파일을 자동 감지합니다.
---

이 스킬은 대상 소스 코드를 분석하여 Vitest 기반 유닛 테스트를 자동으로 생성하고, 테스트를 실행하여 통과 여부를 확인합니다. 실패 시 자동으로 수정하여 재실행합니다.

사용자는 테스트 대상 파일 경로를 제공하거나, 인자 없이 호출하여 git diff 기반 자동 감지를 사용할 수 있습니다.

## 워크플로우

### 0단계: 대상 파일 결정

사용자 입력에 따라 테스트 대상 파일을 결정합니다.

**인자 없이 호출한 경우 (`/auto-test`)**:
- `git diff --name-only HEAD`와 `git diff --cached --name-only`를 실행하여 변경/추가된 `.ts`, `.tsx` 파일을 감지합니다.
- 다음 파일은 제외합니다:
  - 테스트 파일 (`*.test.ts`, `*.spec.ts`)
  - 타입 정의 (`*.d.ts`)
  - 엔트리/설정 파일 (`main.tsx`, `App.tsx`, `instrument.ts`, `vite-env.d.ts`)
  - 설정 파일 (`vite.config.ts`, `tailwind.config.ts`, `eslint.config.js` 등)

**특정 파일 지정한 경우 (`/auto-test src/hooks/useBooleanState.ts`)**:
- 해당 파일만 대상으로 진행합니다.

**디렉토리 지정한 경우 (`/auto-test src/hooks/`)**:
- 해당 디렉토리 내 `.ts`, `.tsx` 파일 중 같은 디렉토리에 `.test.ts` 파일이 없는 것을 모두 대상으로 합니다.

대상 파일 결정 후 사용자에게 목록을 보여주고 확인을 받습니다:

```
테스트 대상 파일:
1. src/hooks/useBooleanState.ts (신규 테스트)
2. src/lib/utils.ts (신규 테스트)
진행하시겠습니까?
```

### 1단계: 대상 코드 분석

각 대상 파일을 읽고 다음을 분석합니다:

- **파일 유형 분류**: Pure Function / Custom Hook / Async Function
- **export된 함수/훅 목록**: 테스트할 public API 식별
- **입력 파라미터와 반환 타입**: TypeScript 타입 정보 활용
- **의존성 분석**: import된 모듈 중 모킹이 필요한 것 식별
  - 외부 라이브러리 (예: `@sentry/react`, `@tanstack/react-query`)
  - 브라우저 API (예: `window`, `document`, `addEventListener`)
  - 다른 내부 모듈 (예: `@/lib/`, `@/constants/`)
- **기존 테스트 파일 확인**: `[filename].test.ts`가 이미 존재하면 기존 테스트를 읽어 중복되지 않도록 추가 테스트만 작성

### 2단계: 테스트 파일 생성

`.claude/agents/unit-test-writer.md` 파일을 읽어 테스트 작성 전략을 확인한 뒤, 해당 전략을 따라 테스트를 작성합니다.

핵심 전략:

1. **4가지 커버리지 카테고리**:
   - Happy Path (정상 케이스): 예상 입력 → 예상 출력
   - Boundary Values (경계값): 빈 입력, 0, 최소/최대값
   - Edge Cases (엣지 케이스): null/undefined, 특수 상황
   - Error Cases (에러 케이스): 잘못된 입력, 범위 초과

2. **AAA 패턴**: Arrange(준비), Act(실행), Assert(검증)

3. **코드 유형별 패턴**:
   - Pure Function / Utility: 직접 호출 + expect
   - Custom Hook: `renderHook` + `act` (`@testing-library/react`)
   - Async Function: `async/await` + `rejects.toThrow`

4. **테스트 구조**:
   ```typescript
   describe('[함수/훅 이름]', () => {
     describe('[시나리오/조건]', () => {
       it('[기대 동작]', () => {
         // Arrange
         // Act
         // Assert
       });
     });
   });
   ```

5. **모킹 규칙**:
   - 외부 의존성: `vi.mock()` 사용
   - 브라우저 API: `vi.stubGlobal()` 사용
   - 타이머: `vi.useFakeTimers()` / `vi.useRealTimers()`
   - `beforeEach`/`afterEach`에서 정리

6. **파일 배치**: 소스 파일과 같은 디렉토리에 `[filename].test.ts`로 생성

7. **기존 테스트 파일이 있는 경우**: 기존 describe 블록을 유지하고, 새로 추가된 함수/분기에 대한 테스트만 추가. 기존 테스트를 삭제하거나 수정하지 않음.

또한 기존 프로젝트의 테스트 패턴(`src/lib/jumpCalculator.test.ts`)을 참고하여 일관된 스타일을 유지합니다.

### 3단계: 테스트 실행 및 결과 확인

테스트 파일 생성/업데이트 후:

1. `npm run test:run`을 실행합니다.
2. 실행 결과를 파싱합니다:
   - 전체 테스트 수 / 통과 / 실패 / 스킵
   - 실패한 테스트의 에러 메시지와 위치

### 4단계: 실패 시 수정 반복 (최대 3회)

테스트가 실패하면:

1. **에러 분석**: 실패 원인을 분류합니다.
   - import 에러: 경로나 export 이름 오류
   - 타입 에러: TypeScript 타입 불일치
   - assertion 실패: 예상값이 실제 동작과 다름
   - 모킹 에러: mock 설정 오류
   - 환경 에러: jsdom 미지원 API 등

2. **수정 적용**: 원인에 따라 테스트 코드를 수정합니다.
   - assertion 실패 → 실제 동작에 맞게 expected 값 수정
   - import 에러 → 올바른 경로/이름으로 수정
   - 모킹 에러 → mock 설정 재구성

3. **재실행**: `npm run test:run`으로 다시 확인합니다.

4. **반복 제한**: 최대 3회 반복 후에도 실패하면 실패 보고서와 함께 중단합니다.

## 출력 형식

### 최종 결과 보고

```
auto-test 실행 결과
═══════════════════════════════════════

생성된 테스트 파일:
  [신규] src/hooks/useBooleanState.test.ts
  [추가] src/lib/jumpCalculator.test.ts

테스트 실행 결과:
  전체: 25  통과: 25  실패: 0  스킵: 0

커버리지 요약:
  useBooleanState.test.ts - Happy: 3 | Boundary: 2 | Edge: 2 | Error: 1
  jumpCalculator.test.ts  - Happy: 4 | Boundary: 3 | Edge: 2 | Error: 1
```

### 실패 시 보고

```
auto-test 실행 결과 (수정 필요)
═══════════════════════════════════════

시도 횟수: 3/3 (최대 도달)

실패한 테스트:
  src/hooks/useMapDrag.test.ts
    FAIL: '마우스 이동 시 onPanChange가 호출된다'
    원인: jsdom 환경에서 MouseEvent 시뮬레이션 제한

수동 확인 필요:
  - useMapDrag 훅은 브라우저 이벤트에 강하게 의존
  - 통합 테스트(Playwright) 레벨에서 검증 권장
```

## 주의사항

1. **any 타입 사용 금지**: 테스트 코드에서도 `any` 타입을 사용하지 않습니다. 필요 시 정확한 타입을 명시합니다.
2. **한글 테스트 설명**: `describe`, `it`의 설명은 모두 한글로 작성합니다.
3. **기존 테스트 보존**: 이미 존재하는 테스트 파일을 덮어쓰지 않습니다. 새로운 테스트만 추가합니다.
4. **테스트 범위**: 순수 함수, 커스텀 훅, 유틸리티 함수에 집중합니다. `.tsx` 컴포넌트의 렌더링 테스트는 이 스킬의 주 범위가 아닙니다.
5. **모킹 최소화**: 가능한 실제 구현을 사용하고, 외부 의존성과 브라우저 API만 모킹합니다.
6. **결정론적 테스트**: `Math.random()`, `Date.now()` 등은 반드시 모킹하여 결정론적 결과를 보장합니다.
7. **collocated 배치**: 테스트 파일은 반드시 소스 파일과 같은 디렉토리에 위치합니다.
8. **테스트 실행 필수**: 테스트 작성 후 반드시 `npm run test:run`으로 실행하여 통과를 확인합니다.
