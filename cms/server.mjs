import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { spawn, exec } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const articlesDir = path.join(rootDir, 'src', 'content', 'articles');
const publicDir = path.join(__dirname, 'public');
const PORT = process.env.PORT || 3333;

function parseFrontmatter(content) {
  const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);
  if (!match) return { data: {}, body: content };

  const rawYaml = match[1];
  const body = match[2];
  const data = {};

  const lines = rawYaml.split(/\r?\n/);
  let currentKey = null;

  for (const line of lines) {
    if (!line.trim()) continue;

    if (line.trim().startsWith('- ') && currentKey && Array.isArray(data[currentKey])) {
      const val = line.trim().substring(2).replace(/^["']|["']$/g, '');
      data[currentKey].push(val);
      continue;
    }

    const colonIdx = line.indexOf(':');
    if (colonIdx !== -1) {
      const key = line.slice(0, colonIdx).trim();
      let val = line.slice(colonIdx + 1).trim();

      if (val === '') {
        currentKey = key;
        data[key] = [];
        continue;
      }

      currentKey = key;
      if (val.startsWith('[') && val.endsWith(']')) {
        data[key] = val
          .slice(1, -1)
          .split(',')
          .map((s) => s.trim().replace(/^["']|["']$/g, ''));
        continue;
      }

      val = val.replace(/^["']|["']$/g, '');
      if (val === 'true') data[key] = true;
      else if (val === 'false') data[key] = false;
      else if (!isNaN(Number(val)) && val !== '') data[key] = Number(val);
      else data[key] = val;
    }
  }

  return { data, body };
}

function stringifyFrontmatter(data, body) {
  let yaml = '---\n';
  for (const [key, val] of Object.entries(data)) {
    if (Array.isArray(val)) {
      yaml += `${key}: [${val.map((v) => `"${v}"`).join(', ')}]\n`;
    } else if (typeof val === 'string') {
      yaml += `${key}: "${val.replace(/"/g, '\\"')}"\n`;
    } else {
      yaml += `${key}: ${val}\n`;
    }
  }
  yaml += '---\n\n';
  return yaml + body.trim() + '\n';
}

function sendJson(res, statusCode, payload) {
  res.writeHead(statusCode, {
    'Content-Type': 'application/json; charset=utf-8',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  });
  res.end(JSON.stringify(payload));
}

function serveStatic(req, res, pathname) {
  let filePath = path.join(publicDir, pathname === '/' ? 'index.html' : pathname);
  if (!filePath.startsWith(publicDir)) {
    res.writeHead(403);
    return res.end('Forbidden');
  }

  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      filePath = path.join(publicDir, 'index.html');
    }

    const ext = path.extname(filePath).toLowerCase();
    const mimeTypes = {
      '.html': 'text/html; charset=utf-8',
      '.js': 'application/javascript; charset=utf-8',
      '.css': 'text/css; charset=utf-8',
      '.json': 'application/json; charset=utf-8',
      '.svg': 'image/svg+xml',
      '.png': 'image/png',
      '.ico': 'image/x-icon',
    };

    const contentType = mimeTypes[ext] || 'application/octet-stream';
    res.writeHead(200, { 'Content-Type': contentType });
    fs.createReadStream(filePath).pipe(res);
  });
}

// Evergreen Smart Work Topic Knowledge Bank for Autonomous AI Generation
const AUTONOMOUS_TOPICS_POOL = [
  {
    category: '엑셀 & 스프레드시트',
    categorySlug: 'spreadsheet',
    author: '클락가든 스프레드시트 연구팀',
    authorRole: '데이터 분석 및 스프레드시트 수석 연구원',
    topics: [
      {
        slug: 'excel-multiple-sheets-consolidation',
        title: '엑셀 여러 시트 데이터 한 번에 취합하는 3가지 실무 테크닉',
        description: '매월 부서별로 흩어져 들어오는 수십 개의 시트를 복사-붙여넣기 없이 파워쿼리(Power Query)와 VSTACK 동적 배열 수식으로 10초 만에 통합하는 자동화 가이드입니다.',
        tags: ['엑셀', '데이터취합', '파워쿼리', 'VSTACK', '업무자동화'],
        readTime: 8,
        coreFormulas: '=VSTACK(1월:12월!A2:E100)',
      },
      {
        slug: 'google-sheets-arrayformula-regex',
        title: '구글 스프레드시트 ARRAYFORMULA와 정규표현식(REGEX)으로 텍스트 데이터 일괄 추출하기',
        description: '수천 건의 혼합된 고객 주문 메모에서 전화번호, 이메일 주소, 송장 번호만 정규표현식(REGEXEXTRACT)과 배열 수식으로 한 번에 분리 정제하는 실전 팁입니다.',
        tags: ['구글시트', 'ARRAYFORMULA', '정규표현식', 'REGEX', '데이터전처리'],
        readTime: 8,
        coreFormulas: '=ARRAYFORMULA(REGEXEXTRACT(A2:A, "01[0-9]-[0-9]{4}-[0-9]{4}"))',
      },
      {
        slug: 'excel-conditional-formatting-dashboard',
        title: '데이터가 한눈에 읽히는 엑셀 조건부 서식 설계: 실적 신호등과 막대 그래프 시각화',
        description: '지저분한 색상 남발을 피하고 목표 달성률, 마감 임박 태스크, 중복 데이터를 자동으로 하이라이트하는 프로페셔널 조건부 서식 수식 설정법을 정리합니다.',
        tags: ['엑셀', '조건부서식', '데이터시각화', '스프레드시트', '실무서식'],
        readTime: 7,
        coreFormulas: '=$C2<=TODAY()+3',
      },
      {
        slug: 'spreadsheet-error-handling-iferror-isblank',
        title: '엑셀 에러(#N/A, #VALUE!, #DIV/0!) 완벽 제어 가이드: IFERROR와 ISBLANK의 실무 활용',
        description: '보고서의 신뢰도를 떨어뜨리는 엑셀 에러 코드의 원인을 진단하고 깔끔한 대체 텍스트나 0으로 처리하는 방어적 수식 설계 원칙을 공개합니다.',
        tags: ['엑셀', '에러처리', 'IFERROR', 'ISBLANK', '수식오류'],
        readTime: 7,
        coreFormulas: '=IFERROR(VLOOKUP(A2, B:C, 2, FALSE), "데이터 미등록")',
      },
    ],
  },
  {
    category: '노션 & 생산성 앱',
    categorySlug: 'notion',
    author: '클락가든 노션 아키텍처팀',
    authorRole: '워크스페이스 모델링 및 생산성 아키텍트',
    topics: [
      {
        slug: 'notion-habit-tracker-and-routine-system',
        title: '작심삼일을 끝내는 노션 루틴 트래커: 주간 달성률 자동 계산과 시각적 피드백 구축',
        description: '매일 반복되는 운동, 독서, 업무 루틴을 체크박스와 수식 2.0으로 관리하고 주간/월간 달성률을 자동으로 환산해 시각화하는 습관 형성 템플릿 제작법입니다.',
        tags: ['노션', '습관트래커', '루틴관리', '수식2.0', '자기계발'],
        readTime: 8,
        coreFormulas: 'round((prop("운동") + prop("독서") + prop("명상")) / 3 * 100) + "%"',
      },
      {
        slug: 'notion-crm-customer-management-system',
        title: '소규모 팀과 프리랜서를 위한 노션 고객 관계 관리(CRM) 데이터베이스 아키텍처',
        description: '고가 SaaS 없이 노션 데이터베이스의 관계형과 타임라인 뷰를 활용해 리드 발굴, 미팅 이력, 견적 현황, 사후 팔로업까지 한곳에서 관리하는 경량 CRM 구축 가이드입니다.',
        tags: ['노션', 'CRM', '고객관리', '영업관리', '노션템플릿'],
        readTime: 9,
        coreFormulas: 'prop("미팅이력").map(current.prop("일시")).max()',
      },
      {
        slug: 'notion-wiki-and-knowledge-base-sop',
        title: '퇴사자가 생겨도 업무가 끊기지 않는 사내 노션 위키 & 업무 매뉴얼(SOP) 체계화',
        description: '팀 내 인수인계 공백을 없애는 표준 운영 절차(SOP) 템플릿, 카테고리 태깅, 버전 이력 관리 및 권한 설정 노하우를 정리합니다.',
        tags: ['노션', '팀위키', 'SOP', '업무매뉴얼', '조직생산성'],
        readTime: 8,
        coreFormulas: 'ifs(prop("상태") == "검토완료", "🟢 활성 매뉴얼", "🟡 개정 작업중")',
      },
    ],
  },
  {
    category: '실무 서식 & 템플릿',
    categorySlug: 'templates',
    author: '클락가든 비즈니스 문서화팀',
    authorRole: '기업 표준 서식 및 프로젝트 관리 전문위원',
    topics: [
      {
        slug: 'business-email-inquiry-and-followup-templates',
        title: '회신율을 2배 높이는 비즈니스 이메일 템플릿 5선: 제안, 일정 조율, 리마인드, 정중한 거절',
        description: '매번 이메일 작성 창 앞에서 10분씩 망설이는 직장인을 위한 프로페셔널 비즈니스 메일 표준 문장과 상황별 템플릿 모음집입니다.',
        tags: ['비즈니스메일', '이메일템플릿', '커뮤니케이션', '직장생활', '업무서식'],
        readTime: 7,
        coreFormulas: '[사전 협의된 마감 기한 및 후속 일정 명시]',
      },
      {
        slug: 'consulting-service-level-agreement-template',
        title: '외주 및 용역 계약 시 반드시 넣어야 할 SLA(서비스 수준 협약) 표준 특약 조항',
        description: '용역 결과물의 하자보수 범위, 장애 대응 시간(MTTR), 지체상금 조항, 검수 통과 기준을 명문화하여 분쟁을 예방하는 비즈니스 계약 서식 가이드입니다.',
        tags: ['SLA', '용역계약', '계약서식', '외주관리', '법무리스크'],
        readTime: 8,
        coreFormulas: '지체상금율: 지체일수당 총 계약금액의 1000분의 1.5',
      },
    ],
  },
  {
    category: '워크플로우 & 단축키',
    categorySlug: 'workflow',
    author: '클락가든 워크플로우 연구팀',
    authorRole: '디지털 워크플로우 및 자동화 엔지니어',
    topics: [
      {
        slug: 'raycast-alfred-mac-launcher-workflow',
        title: '맥 생산성의 정점 Raycast 완전 정복: 클립보드, 창 분할, 텍스트 스니펫 단축키 통합',
        description: '스포트라이트를 뛰어넘어 단축키 하나로 창 관리, 시스템 제어, 통화 환산, 커스텀 스크립트 실행까지 해치우는 레이캐스트(Raycast) 실전 워크플로우입니다.',
        tags: ['Raycast', 'macOS', '생산성런처', '맥워크플로우', '단축키'],
        readTime: 8,
        coreFormulas: '⌥ + Space ➔ Instant Raycast Command',
      },
      {
        slug: 'dual-monitor-window-management-shortcuts',
        title: '듀얼 모니터 환경에서 시선과 손을 낭비하지 않는 멀티 디스플레이 창 관리 테크닉',
        description: '모니터 2~3대를 오가며 마우스 커서를 찾느라 시간을 낭비하지 않고 단축키로 활성 창을 다른 화면으로 번개처럼 점프시키는 실무 단축키 팁입니다.',
        tags: ['듀얼모니터', '화면관리', '단축키', 'Windows11', '멀티태스킹'],
        readTime: 7,
        coreFormulas: 'Win + Shift + 좌우 방향키 (모니터 간 즉각 이동)',
      },
    ],
  },
];

function generateDeepArticleMarkdown(topicObj, categoryObj) {
  const dateStr = new Date().toISOString().split('T')[0];

  return `---
title: "${topicObj.title}"
description: "${topicObj.description}"
category: "${categoryObj.category}"
categorySlug: "${categoryObj.categorySlug}"
tags: [${topicObj.tags.map((t) => `"${t}"`).join(', ')}]
pubDate: "${dateStr}"
author: "${categoryObj.author}"
authorRole: "${categoryObj.authorRole}"
readTime: ${topicObj.readTime || 8}
featured: false
locale: "ko"
---

## 1. 도입: 왜 ${topicObj.title.split(':')[0]}이(가) 실무에서 중요한가?

현대 비즈니스 환경에서 업무 비효율의 상당수는 '작지만 매일 반복되는 사소한 수작업'에서 비롯됩니다. 특히 데이터를 다루거나 협업 문서를 작성할 때 표준화된 도구 활용법과 자동화 워크플로우를 모르면, 불필요한 야근과 피로가 누적됩니다.

본 가이드에서는 **${topicObj.title}**의 핵심 원리와 현업에서 즉시 복사해 적용할 수 있는 구체적인 단계별 해결책을 제시합니다.

---

## 2. 실무에서 자주 겪는 핵심 문제점 및 병목 분석

실무 현장에서 가장 빈번하게 발생하는 주요 어려움은 다음과 같습니다:

1. **수작업으로 인한 시간 낭비:** 동일한 패턴의 작업을 마우스 클릭이나 반복 타이핑으로 처리하여 1~2시간 이상 소요.
2. **휴먼 에러(Human Error) 발생:** 사람이 직접 눈으로 확인하고 옮기면서 오타, 참조 오류, 누락 발생.
3. **유지보수와 인수인계의 어려움:** 작성자 본인만 아는 복잡하고 불규칙한 방식으로 정리되어 팀원 간 협업이 단절됨.

| 구분 | 기존의 비효율적 수작업 방식 | 본 가이드의 최적화 자동화 방식 | 개선 효과 |
| :--- | :--- | :--- | :--- |
| **처리 소요 시간** | 건당 30~60분 수동 반복 | 템플릿 및 수식으로 10초 이내 완료 | **작업 시간 90% 이상 단축** |
| **오류 발생률** | 5~10% 빈번한 휴먼 에러 | 시스템 규칙 기반 0% 무오류 보장 | **데이터 신뢰도 극대화** |
| **팀 내 재사용성** | 개인 PC에 파편화 저장 | 표준화된 아카이브로 즉시 복제 가능 | **원활한 인수인계 보장** |

---

## 3. 핵심 실무 솔루션 및 단계별 적용 가이드

### 1단계: 기본 셋업 및 데이터 구조화
작업을 시작하기 전, 원본 데이터와 템플릿 환경의 열 이름과 데이터 속성을 통일합니다.

\`\`\`
${topicObj.coreFormulas || '표준 실무 수식 구문'}
\`\`\`

> [!TIP]
> 위 수식을 적용할 때는 참조 범위가 변경되더라도 수식이 깨지지 않도록 고정 참조(\`$\`) 여부를 반드시 확인하세요.

### 2단계: 핵심 규칙 및 조건식 구성
필터링 조건과 예외 처리 로직을 결합하여 예상치 못한 빈 셀이나 결측치가 발생해도 전체 흐름이 중단되지 않도록 방어 로직을 구축합니다.

---

## 4. 실무 적용 시 반드시 주의해야 할 3가지 체크리스트

1. **소프트웨어 버전 호환성 확인:** Microsoft 365, Google Workspace, 최신 노션 빌드 간 구문 차이가 있는지 테스트하세요.
2. **주기적인 백업 및 버전 복원점 설정:** 대규모 데이터 가공 전 원본 시트나 페이지를 복제본으로 보관해 두세요.
3. **팀원 대상 가이드라인 공유:** 수식이나 자동화가 걸려 있는 셀에는 잠금 보호를 적용하고 간단한 메모를 남기세요.

---

## 5. 결론: 자동화된 워크플로우로 시간을 되찾으세요

시간은 지식 근로자에게 가장 가치 있는 자산입니다. 오늘 소개한 **${topicObj.title.split(':')[0]}** 솔루션을 여러분의 업무 루틴에 적용하여 단순 반복 작업을 시스템에 위임하고, 진짜 가치를 만드는 창의적인 일에 몰입해 보세요.
`;
}

const server = http.createServer((req, res) => {
  const parsedUrl = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  const pathname = parsedUrl.pathname;

  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    });
    return res.end();
  }

  // API Routes
  if (pathname.startsWith('/api/')) {
    // 1. Stats
    if (pathname === '/api/stats' && req.method === 'GET') {
      try {
        const files = fs.readdirSync(articlesDir).filter((f) => f.endsWith('.md'));
        let totalWords = 0;
        const categoryCounts = {};

        for (const file of files) {
          const content = fs.readFileSync(path.join(articlesDir, file), 'utf-8');
          const { data, body } = parseFrontmatter(content);
          const words = body.replace(/\s+/g, ' ').length;
          totalWords += words;

          const cat = data.category || '기타';
          categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
        }

        // AdSense Scorecard calculation
        let adsenseScore = 0;
        const criteria = [];

        // Criteria 1: Article count >= 15
        if (files.length >= 15) {
          adsenseScore += 25;
          criteria.push({ name: `고품질 전문 아티클 수 (${files.length}편 / 목표 15편+)`, pass: true });
        } else {
          criteria.push({ name: `아티클 수 부족 (${files.length}편 / 목표 15편+)`, pass: false });
        }

        // Criteria 2: Average word count >= 1500 chars
        const avgChars = files.length ? Math.round(totalWords / files.length) : 0;
        if (avgChars >= 1500) {
          adsenseScore += 25;
          criteria.push({ name: `아티클당 평균 분량 (${avgChars.toLocaleString()}자 / 권장 1,500자+)`, pass: true });
        } else {
          criteria.push({ name: `아티클 평균 분량 미달 (${avgChars}자)`, pass: false });
        }

        // Criteria 3: Privacy Policy with AdSense & Cookies
        const privacyPath = path.join(rootDir, 'src', 'pages', 'privacy.astro');
        const hasPrivacy = fs.existsSync(privacyPath);
        if (hasPrivacy) {
          adsenseScore += 20;
          criteria.push({ name: '애드센스·쿠키 명시 개인정보처리방침 구비', pass: true });
        } else {
          criteria.push({ name: '개인정보처리방침 미구비', pass: false });
        }

        // Criteria 4: About & Editorial Standards (E-E-A-T)
        const aboutPath = path.join(rootDir, 'src', 'pages', 'about.astro');
        const hasAbout = fs.existsSync(aboutPath);
        if (hasAbout) {
          adsenseScore += 15;
          criteria.push({ name: '스마트 워크 연구진 소개 및 E-E-A-T 편집 원칙 구비', pass: true });
        } else {
          criteria.push({ name: 'About 페이지 미구비', pass: false });
        }

        // Criteria 5: Sitemap & RSS Feed
        const sitemapPath = path.join(rootDir, 'src', 'pages', 'sitemap.xml.ts');
        const hasSitemap = fs.existsSync(sitemapPath);
        if (hasSitemap) {
          adsenseScore += 15;
          criteria.push({ name: '동적 XML 사이트맵 및 RSS 피드 제공', pass: true });
        } else {
          criteria.push({ name: '사이트맵 미구비', pass: false });
        }

        return sendJson(res, 200, {
          totalArticles: files.length,
          totalWords,
          avgChars,
          categoryCounts,
          adsenseScore,
          criteria,
        });
      } catch (err) {
        return sendJson(res, 500, { error: err.message });
      }
    }

    // 2. Articles List
    if (pathname === '/api/articles' && req.method === 'GET') {
      try {
        const files = fs.readdirSync(articlesDir).filter((f) => f.endsWith('.md'));
        const list = files.map((file) => {
          const id = file.replace(/\.md$/, '');
          const content = fs.readFileSync(path.join(articlesDir, file), 'utf-8');
          const { data, body } = parseFrontmatter(content);
          return {
            id,
            title: data.title || id,
            category: data.category || '일반',
            categorySlug: data.categorySlug || 'spreadsheet',
            pubDate: data.pubDate || '',
            author: data.author || '클락가든 연구팀',
            readTime: data.readTime || 5,
            featured: !!data.featured,
            description: data.description || '',
            charCount: body.replace(/\s+/g, ' ').length,
          };
        });

        list.sort((a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime());
        return sendJson(res, 200, { articles: list });
      } catch (err) {
        return sendJson(res, 500, { error: err.message });
      }
    }

    // 3. Single Article Read
    const articleMatch = pathname.match(/^\/api\/articles\/([^/]+)$/);
    if (articleMatch && req.method === 'GET') {
      const id = decodeURIComponent(articleMatch[1]);
      const filePath = path.join(articlesDir, `${id}.md`);
      if (!fs.existsSync(filePath)) {
        return sendJson(res, 404, { error: 'Article not found' });
      }

      const content = fs.readFileSync(filePath, 'utf-8');
      const { data, body } = parseFrontmatter(content);
      return sendJson(res, 200, { id, data, body, raw: content });
    }

    // 4. Article Create or Update (POST /api/articles)
    if (pathname === '/api/articles' && req.method === 'POST') {
      let bodyData = '';
      req.on('data', (chunk) => (bodyData += chunk));
      req.on('end', () => {
        try {
          const payload = JSON.parse(bodyData);
          const slug = (payload.slug || payload.id || '').trim();
          if (!slug) {
            return sendJson(res, 400, { error: 'Slug/ID is required' });
          }

          const frontmatter = {
            title: payload.title || '무제 실무 가이드',
            description: payload.description || '',
            category: payload.category || '엑셀 & 스프레드시트',
            categorySlug: payload.categorySlug || 'spreadsheet',
            tags: Array.isArray(payload.tags) ? payload.tags : (payload.tags || '').split(',').map((t) => t.trim()).filter(Boolean),
            pubDate: payload.pubDate || new Date().toISOString().split('T')[0],
            updatedDate: new Date().toISOString().split('T')[0],
            author: payload.author || '클락가든 연구팀',
            authorRole: payload.authorRole || '스마트 워크 & 실무 생산성 연구원',
            readTime: Number(payload.readTime) || 7,
            featured: !!payload.featured,
            locale: payload.locale || 'ko',
          };

          const fullFile = stringifyFrontmatter(frontmatter, payload.body || '');
          const filePath = path.join(articlesDir, `${slug}.md`);
          fs.writeFileSync(filePath, fullFile, 'utf-8');

          return sendJson(res, 200, { success: true, slug, message: 'Article saved successfully' });
        } catch (err) {
          return sendJson(res, 500, { error: err.message });
        }
      });
      return;
    }

    // 5. Delete Article
    if (articleMatch && req.method === 'DELETE') {
      const id = decodeURIComponent(articleMatch[1]);
      const filePath = path.join(articlesDir, `${id}.md`);
      if (!fs.existsSync(filePath)) {
        return sendJson(res, 404, { error: 'Article not found' });
      }

      fs.unlinkSync(filePath);
      return sendJson(res, 200, { success: true, message: 'Article deleted successfully' });
    }

    // 6. Fully Autonomous AGY AI One-Click Pipeline (POST /api/agy/auto-generate)
    if (pathname === '/api/agy/auto-generate' && req.method === 'POST') {
      let bodyData = '';
      req.on('data', (chunk) => (bodyData += chunk));
      req.on('end', async () => {
        try {
          const reqPayload = bodyData ? JSON.parse(bodyData) : {};
          const existingFiles = fs.readdirSync(articlesDir).filter((f) => f.endsWith('.md')).map((f) => f.replace('.md', ''));

          // 1) Find the next best unwritten topic from the knowledge bank
          let targetCategory = null;
          let targetTopic = null;

          if (reqPayload.topic) {
            // User provided custom topic
            const customSlug = reqPayload.topic
              .toLowerCase()
              .replace(/[^a-z0-9가-힣]+/g, '-')
              .replace(/^-|-$/g, '') || `smartwork-${Date.now()}`;

            targetCategory = AUTONOMOUS_TOPICS_POOL.find((c) => c.categorySlug === reqPayload.categorySlug) || AUTONOMOUS_TOPICS_POOL[0];
            targetTopic = {
              slug: customSlug,
              title: `${reqPayload.topic}: 실무자가 알아야 할 핵심 원리와 단계별 해결 가이드`,
              description: `${reqPayload.topic}의 핵심 개념, 실무 적용 방법론, 빈번한 실수 방지 체크리스트 및 생산성 향상 팁을 상세히 정리합니다.`,
              tags: reqPayload.keywords && reqPayload.keywords.length ? reqPayload.keywords : ['스마트워크', '생산성', '실무가이드'],
              readTime: 8,
              coreFormulas: '실무 최적화 표준 프로세스 및 수식 템플릿',
            };
          } else {
            // Autonomous mode: scan pool for unwritten topic
            for (const catGroup of AUTONOMOUS_TOPICS_POOL) {
              if (reqPayload.categorySlug && catGroup.categorySlug !== reqPayload.categorySlug) continue;
              for (const top of catGroup.topics) {
                if (!existingFiles.includes(top.slug)) {
                  targetCategory = catGroup;
                  targetTopic = top;
                  break;
                }
              }
              if (targetTopic) break;
            }

            // Fallback if all topics in pool exist
            if (!targetTopic) {
              const fallbackIdx = Date.now() % 1000;
              targetCategory = AUTONOMOUS_TOPICS_POOL[0];
              targetTopic = {
                slug: `smartwork-automation-guide-${fallbackIdx}`,
                title: `실무 업무 생산성을 3배로 높이는 스마트 워크 프로세스 설계안 ${fallbackIdx}`,
                description: `반복 수작업을 없애고 체계적인 데이터 관리와 빠른 의사결정을 돕는 클락가든 연구팀의 심층 실무 가이드입니다.`,
                tags: ['스마트워크', '업무자동화', '생산성가이드'],
                readTime: 8,
                coreFormulas: '=IF(ISBLANK(A2), "대기", "완료")',
              };
            }
          }

          // 2) Generate full markdown content
          const fullMarkdown = generateDeepArticleMarkdown(targetTopic, targetCategory);
          const targetFilePath = path.join(articlesDir, `${targetTopic.slug}.md`);

          // 3) Save file directly to articles collection
          fs.writeFileSync(targetFilePath, fullMarkdown, 'utf-8');

          return sendJson(res, 200, {
            success: true,
            slug: targetTopic.slug,
            title: targetTopic.title,
            category: targetCategory.category,
            message: `[원클릭 완전 자동 발행 성공] '${targetTopic.title}' 아티클이 생성 및 저장되었습니다!`,
            content: fullMarkdown,
          });
        } catch (err) {
          return sendJson(res, 500, { error: err.message });
        }
      });
      return;
    }

    // 7. AGY Quality Rater & E-E-A-T Review (POST /api/agy/review)
    if (pathname === '/api/agy/review' && req.method === 'POST') {
      let bodyData = '';
      req.on('data', (chunk) => (bodyData += chunk));
      req.on('end', () => {
        try {
          const { title, description, body } = JSON.parse(bodyData);
          const chars = (body || '').replace(/\s+/g, ' ').length;
          const h2Count = (body || '').match(/^##\s+.+/gm)?.length || 0;
          const h3Count = (body || '').match(/^###\s+.+/gm)?.length || 0;
          const hasTable = /\|.+\|.+\|/.test(body || '');
          const hasCodeOrFormula = /```|`=|\$|prop\(/.test(body || '');

          const checks = [
            {
              name: '본문 텍스트 분량 (최소 1,500자 이상)',
              pass: chars >= 1500,
              detail: `현재 ${chars.toLocaleString()}자 (${chars >= 1500 ? '적합' : '보완 필요'})`,
            },
            {
              name: 'H2/H3 구조적 위계 (목차 및 소제목)',
              pass: h2Count >= 3,
              detail: `H2 소제목 ${h2Count}개, H3 세부제목 ${h3Count}개`,
            },
            {
              name: '정량적 스펙 테이블(표) 포함 여부',
              pass: hasTable,
              detail: hasTable ? '마크다운 표 포함됨' : '비교 표 보완 권장',
            },
            {
              name: '실무 수식 또는 코드 블록 인용',
              pass: hasCodeOrFormula,
              detail: hasCodeOrFormula ? '실무 수식/코드 포함됨' : '실무 수식 보완 권장',
            },
            {
              name: 'SEO 메타 디스크립션 길이 (60~200자)',
              pass: (description || '').length >= 60 && (description || '').length <= 200,
              detail: `현재 ${(description || '').length}자`,
            },
          ];

          const score = Math.round((checks.filter((c) => c.pass).length / checks.length) * 100);

          return sendJson(res, 200, {
            score,
            status: score >= 80 ? 'EXCELLENT' : score >= 60 ? 'GOOD' : 'NEEDS_WORK',
            checks,
          });
        } catch (err) {
          return sendJson(res, 500, { error: err.message });
        }
      });
      return;
    }

    // 8. Run Production Build (POST /api/build)
    if (pathname === '/api/build' && req.method === 'POST') {
      res.writeHead(200, {
        'Content-Type': 'text/plain; charset=utf-8',
        'Transfer-Encoding': 'chunked',
        'Access-Control-Allow-Origin': '*',
      });

      res.write('>>> Astro 생산 빌드(npm run build) 시작...\n\n');

      const proc = spawn('npm', ['run', 'build'], {
        cwd: rootDir,
        shell: true,
      });

      proc.stdout.on('data', (data) => res.write(data));
      proc.stderr.on('data', (data) => res.write(data));

      proc.on('close', (code) => {
        res.write(`\n>>> 빌드 종료 (Exit code: ${code})\n`);
        if (code === 0) {
          res.write('>>> [성공] 모든 정적 페이지 및 사이트맵이 dist/ 디렉터리에 정상 생성되었습니다!\n');
        } else {
          res.write('>>> [실패] 빌드 중 오류가 발생했습니다. 로그를 확인하세요.\n');
        }
        res.end();
      });
      return;
    }

    return sendJson(res, 404, { error: 'API endpoint not found' });
  }

  // Static files fallback
  serveStatic(req, res, pathname);
});

server.listen(PORT, () => {
  console.log(`[Clock Garden Smart Work CMS Studio] running at http://localhost:${PORT}`);
});
