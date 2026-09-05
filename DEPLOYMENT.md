# Clock Garden — 배포 준비

실제 배포, 도메인 연결 및 DNS 변경은 아직 하지 않았습니다.

## 준비된 설정

- 이름: **Clock Garden**
- 대표 주소: **https://clockgarden.com** (www 없는 주소)
- 정적 산출물: `dist/` — 이 폴더의 내용만 배포합니다.
- 영어 `/`, 한국어 `/ko/`
- 검색 파일: `/sitemap.xml`, `/robots.txt`
- 광고 비활성화, 분석 전송 없음
- 기존 `mg-*` 브라우저 설정 키는 유지해 저장된 설정을 보존합니다. localhost 설정이 실제 도메인으로 자동 이전되지는 않습니다.

## 재빌드 (PowerShell)

```powershell
$env:PUBLIC_SITE_URL='https://clockgarden.com'
$env:PUBLIC_ADS_ENABLED='false'
$env:PUBLIC_ANALYTICS_ENDPOINT=''
npm ci
npm run build:release
```

Cloudflare의 빌드 환경을 사용할 경우 위 환경 변수와 `npm run build:release`, 출력 폴더 `dist`를 설정합니다. `.env.example`은 참고 파일이며 릴리스 검증은 환경 변수를 명시적으로 요구합니다. 소스, node_modules, 로컬 환경 파일을 정적 산출물로 업로드하지 마세요.

## 배포 승인을 받은 뒤 할 일

1. Cloudflare 정적 호스팅 프로젝트를 만들고 산출물을 배포합니다.
2. 프로젝트에 `clockgarden.com`을 사용자 도메인으로 연결합니다. 프로젝트 연결을 먼저 확인한 후 필요한 DNS만 적용합니다.
3. `www.clockgarden.com`은 대표 주소로 경로·쿼리를 유지하며 리디렉션하도록 구성합니다. 현재 로컬 파일에는 DNS/리디렉션을 임의 적용하지 않았습니다.
4. HTTPS, 404, `/ko/clock/`, 전체 화면, 모바일 화면, 보안·캐시 응답 헤더를 실제 도메인에서 확인합니다. `public/_headers` 적용 여부는 선택한 호스팅 방식에서 검증해야 합니다.
5. Search Console에서 소유권을 확인하고 `https://clockgarden.com/sitemap.xml`을 제출합니다. HTML 방식이면 발급받은 값을 `PUBLIC_GOOGLE_SITE_VERIFICATION`에 넣고 재빌드합니다. 토큰은 아직 없습니다.

## 남아 있는 검증

도메인 등록 완료·DNS·HTTPS·검색 소유권 확인은 배포 후 확인 대상입니다. 실기기 Safari, 장시간 수족관 발열/배터리 및 실제 도메인 성능 수치는 **TBD_AFTER_BENCHMARK**입니다. 준비 완료가 검색 노출이나 광고 승인을 보장하지는 않습니다.
