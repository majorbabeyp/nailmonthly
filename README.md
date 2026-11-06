# NAILMONTH 모바일 AI 웹앱 MVP

## 구성
- `index.html`: 스마트폰용 웹 화면 (조건 선택, AI 생성 결과 확인, 이미지 저장/공유)
- `api/generate.mjs`: Vercel 서버 기능 (OpenAI 이미지 생성 API를 서버에서 호출)
- `package.json`: 자바스크립트 모듈 구성

## 실행 방법
1. 프로젝트 폴더를 GitHub 저장소에 업로드합니다.
2. Vercel(https://vercel.com)에 로그인하여 해당 GitHub 저장소를 Import해 배포합니다. 프레임워크 프리셋은 Other로 설정합니다.
3. Vercel 프로젝트의 Settings > Environment Variables에 다음 값 설정:
   - `OPENAI_API_KEY`: 교사가 관리하는 OpenAI API 키 (절대로 HTML이나 GitHub에 기입하지 않음)
   - `DEMO_ACCESS_CODE`: 임의의 길고 추측하기 어려운 시연 접속 코드
   - `OPENAI_IMAGE_MODEL`: `gpt-image-2.5-flare` (선택; 접근 권한이 있는 경우 사용)
4. 설정 후 새 버전으로 재배포합니다.
5. 스마트폰에서 배포 URL을 열고 시연 접속 코드를 입력하여 AI 이미지 생성 버튼을 누릅니다.

## 유의사항
- 실제 AI 이미지는 API 설정과 배포를 마쳐야 생성됩니다. 파일을 단독으로 열면 AI 호출이 작동하지 않습니다.
- OpenAI API는 ChatGPT 구독과 별도 결제/사용 설정이 필요할 수 있습니다.
- `DEMO_ACCESS_CODE`는 비용 남용 방지를 위한 기본적인 장벽일 뿐 완전한 인증 체계가 아닙니다.
- 예제의 메모리 기반 시간당 5회 제한은 서버리스의 여러 인스턴스 간 공유되지 않습니다. 공개 서비스 전에는 Redis 등 외부 저장소 기반 호출량 제한, 사용량 한도, 관리 인증, 로그 관리가 필요합니다.
- AI 이미지 한 장에 다섯 가지 세트가 포함되도록 요청하지만 결과 구획과 손톱 개수의 정확성은 보장되지 않습니다. 네일 전공 학생이 기술적 실현 가능성을 검수해야 합니다.
- 실제 이미지 생성 API 호출은 이 개발 환경에서 테스트하지 않았습니다. Vercel 배포와 키 설정 이후 모바일 실기기 테스트가 필요합니다.

## 첫 배포 체크리스트 (2026-11-06)
1. GitHub 저장소 만들기 → 압축 파일 속 `index.html`, `package.json`, `README.md`, `api/generate.mjs`를 폴더 구조 그대로 업로드합니다. ZIP 파일 자체를 올리지 마세요.
2. Vercel → Add New Project → GitHub 저장소 Import → Framework Preset: Other → Deploy.
3. Vercel Project Settings → Environment Variables에 `OPENAI_API_KEY`, `DEMO_ACCESS_CODE`, `OPENAI_IMAGE_MODEL=gpt-image-2.5-flare` 추가합니다. Environment에 Production을 포함하세요.
4. Deployments → 최신 배포 메뉴 → Redeploy. 환경변수 추가 뒤 재배포하지 않으면 적용되지 않습니다.
5. 스마트폰에서 `https://프로젝트이름.vercel.app` 접속 → 조건 선택 → 접속 코드 → AI 아트 생성.
6. 교사 계정으로 API 결제 및 모델 접근 권한 확인, 자동 충전 해제 권장. API 키는 절대 GitHub나 HTML에 붙여넣지 마세요.
7. 무료 배포·개인 Hobby 플랜의 이용 자격 및 제한은 Vercel 현재 약관에 따라 확인하세요.

주의: 시연 접속 코드는 인증/비용 통제의 완전한 해결책이 아닙니다. 실제 외부 공개 전에 영속 저장소 기반 사용량 제한과 모니터링을 추가하세요.
