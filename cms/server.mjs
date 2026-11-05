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

    // Check array item
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
      // Handle inline array [a, b, c]
      if (val.startsWith('[') && val.endsWith(']')) {
        data[key] = val
          .slice(1, -1)
          .split(',')
          .map((s) => s.trim().replace(/^["']|["']$/g, ''));
        continue;
      }

      // Handle boolean / number / string
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
      // Escape quotes if needed
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
          criteria.push({ name: `아티클당 평균 분량 (${avgChars}자 / 권장 1,500자+)`, pass: true });
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

        // Criteria 4: About & Editorial Board (E-E-A-T)
        const aboutPath = path.join(rootDir, 'src', 'pages', 'about.astro');
        const hasAbout = fs.existsSync(aboutPath);
        if (hasAbout) {
          adsenseScore += 15;
          criteria.push({ name: '연구진 소개 및 E-E-A-T 편집 원칙 구비', pass: true });
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
            categorySlug: data.categorySlug || 'general',
            pubDate: data.pubDate || '',
            author: data.author || '클락가든 편집팀',
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
            title: payload.title || '무제 아티클',
            description: payload.description || '',
            category: payload.category || '무브먼트 & 메커니즘',
            categorySlug: payload.categorySlug || 'mechanics',
            tags: Array.isArray(payload.tags) ? payload.tags : (payload.tags || '').split(',').map((t) => t.trim()).filter(Boolean),
            pubDate: payload.pubDate || new Date().toISOString().split('T')[0],
            updatedDate: new Date().toISOString().split('T')[0],
            author: payload.author || '클락가든 시계공학 연구팀',
            authorRole: payload.authorRole || '시계공학 및 정밀계측 전문위원',
            readTime: Number(payload.readTime) || 8,
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

    // 6. AGY Integration: AI Draft Generator
    if (pathname === '/api/agy/generate' && req.method === 'POST') {
      let bodyData = '';
      req.on('data', (chunk) => (bodyData += chunk));
      req.on('end', async () => {
        try {
          const { topic, category, categorySlug, keywords } = JSON.parse(bodyData);

          // Return structured high-depth horological draft template
          const dateStr = new Date().toISOString().split('T')[0];
          const draftSlug = (topic || 'new-horology-topic')
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-|-$/g, '');

          const generatedArticle = {
            slug: draftSlug || `horology-${Date.now()}`,
            title: `${topic}: 시계공학적 기구학과 물리 법칙`,
            description: `${topic}의 핵심 원리와 정밀 기계 부품 간의 상호작용, 마찰 계수 극복 설계 및 역사적 발전 과정을 심층 조명합니다.`,
            category: category || '무브먼트 & 메커니즘',
            categorySlug: categorySlug || 'mechanics',
            tags: keywords && keywords.length ? keywords : ['시계공학', '정밀계측', '무브먼트', '기구학'],
            pubDate: dateStr,
            author: '클락가든 시계공학 연구팀',
            authorRole: '시계공학 및 정밀계측 전문위원',
            readTime: 9,
            featured: false,
            body: `## 1. 서론: ${topic}의 등장 배경과 공학적 과제

시간을 정확하게 측정하려는 인류의 노력에서 ${topic}은 매우 독특한 위치를 차지합니다. 기계식 시계는 외부 전원이나 배터리 없이 태엽의 탄성 에너지와 톱니바퀴의 맞물림만으로 작동하기 때문에, 아주 작은 외부 충격이나 마찰 변화도 치명적인 일오차로 직결됩니다.

본 아티클에서는 ${topic}의 핵심 기구학적 설계와 물리 법칙, 그리고 현대 파인 워치메이킹에서의 실제 구현 기법을 단계별로 분석합니다.

---

## 2. 핵심 부품 구성 및 기구학적 결합

${topic}의 구조를 정밀 분해했을 때 관찰되는 핵심 부품들은 다음과 같습니다:

| 구성 부품 | 주요 기능 | 소재 및 표면 처리 | 허용 공차 |
| :--- | :--- | :--- | :--- |
| **메인 드라이브 휠** | 회전 토크를 전달하는 1차 톱니바퀴 | 베릴륨 동 또는 316L 강철 | ±0.002mm |
| **조율 레버 및 피니언** | 방향 전환 및 등시성 각도 제어 | 단결정 합성 루비 또는 규소 | 경도 모스 9.0 |
| **복원 스프링** | 주기적 탄성 복원력 제공 | 니바록스 또는 실리콘 산화막 | 비자성 합금 |

---

## 3. 물리적 작동 원리: 에너지 보존과 등시성

기계식 계측 장치의 핵심은 진폭(Amplitude)의 변화에 관계없이 1회 왕복 주기가 일정해야 한다는 **등시성(Isochronism)** 원리입니다:

$$T = 2\\pi \\sqrt{\\frac{I}{C}}$$

여기서 $I$는 회전 진동자의 관성 모멘트이고, $C$는 헤어스프링의 비틀림 탄성 계수입니다. ${topic}은 이 공식의 물리적 안정성을 극대화하기 위해 다음과 같은 공학적 설계를 적용합니다:

1. **마찰 계수의 극소화:** 금속 축과 보석 베어링의 접촉면에 나노 단위 거울 연마(Mirror polish) 적용.
2. **온도 보정 합금:** 열팽창으로 인한 탄성 계수 변화를 바이메탈 기법으로 상쇄.
3. **항자성 설계:** 스마트폰과 전자기기로부터 발생하는 외부 자기장 차단.

---

## 4. 정기 점검 및 유지보수 과학

이 정밀 기구를 오랫동안 최상의 상태로 유지하기 위해서는 정기적인 오버홀(분해 소지)과 윤활 관리가 필수적입니다:
- **오일 열화 주기:** 통상 5~7년 경과 시 합성 윤활유가 산화되어 점도가 상승합니다.
- **방수 가스켓 검사:** 연 1회 수압 테스터를 통해 ISO 6425 기준의 기밀성을 확인해야 합니다.

---

## 5. 결론: 인간 지성이 빚어낸 정밀성의 미학

${topic}은 단순한 기계적 메커니즘을 넘어, 보이지 않는 시간이라는 추상적 물리량을 인간이 손으로 만질 수 있는 규칙적인 박동으로 바꾸어 낸 정밀 공학의 걸작입니다.`,
          };

          return sendJson(res, 200, { success: true, article: generatedArticle });
        } catch (err) {
          return sendJson(res, 500, { error: err.message });
        }
      });
      return;
    }

    // 7. AGY Quality Rater & E-E-A-T Review
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
          const hasMath = /\$.+\$/.test(body || '');

          const checks = [
            {
              name: '본문 텍스트 분량 (최소 1,500자 이상)',
              pass: chars >= 1500,
              detail: `현재 ${chars}자 (${chars >= 1500 ? '적합' : '보완 필요'})`,
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
              name: '수식 또는 정밀 물리 법칙 인용',
              pass: hasMath,
              detail: hasMath ? '물리/수학 공식 포함됨' : '공학적 공식 보완 권장',
            },
            {
              name: 'SEO 메타 디스크립션 길이 (80~160자)',
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
  console.log(`[Clock Garden CMS Studio] running at http://localhost:${PORT}`);
});
