// Clock Garden CMS Studio Client Logic

let currentArticles = [];
let generatedDraft = null;

// Simple markdown renderer for live preview
function renderMarkdown(md) {
  if (!md) return '';
  let html = md
    // Escape HTML
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    // Headings
    .replace(/^### (.*$)/gim, '<h3>$1</h3>')
    .replace(/^## (.*$)/gim, '<h2>$1</h2>')
    .replace(/^# (.*$)/gim, '<h1>$1</h1>')
    // Blockquote
    .replace(/^\> (.*$)/gim, '<blockquote>$1</blockquote>')
    // Bold & Italic
    .replace(/\*\*(.*?)\*\*/gim, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/gim, '<em>$1</em>')
    // Horizontal rule
    .replace(/^---$/gim, '<hr style="border:none;border-top:1px solid #2b3042;margin:1.5rem 0;">')
    // Line breaks to paragraphs
    .split(/\n\n+/)
    .map((block) => {
      block = block.trim();
      if (!block) return '';
      if (block.startsWith('<h') || block.startsWith('<blockquote') || block.startsWith('<hr')) {
        return block;
      }
      if (block.startsWith('- ') || block.startsWith('* ')) {
        const items = block
          .split(/\n/)
          .map((li) => `<li>${li.replace(/^[-*]\s+/, '')}</li>`)
          .join('');
        return `<ul>${items}</ul>`;
      }
      if (block.includes('|')) {
        // Simple table
        const rows = block.split(/\n/).filter((r) => r.trim().startsWith('|'));
        if (rows.length >= 2) {
          const trs = rows
            .map((r, i) => {
              if (r.includes('---')) return '';
              const cells = r
                .split('|')
                .slice(1, -1)
                .map((c) => (i === 0 ? `<th>${c.trim()}</th>` : `<td>${c.trim()}</td>`))
                .join('');
              return `<tr>${cells}</tr>`;
            })
            .filter(Boolean)
            .join('');
          return `<table>${trs}</table>`;
        }
      }
      return `<p>${block.replace(/\n/g, '<br>')}</p>`;
    })
    .join('\n');

  return html;
}

// Tab Switching
function initTabs() {
  const tabs = document.querySelectorAll('.nav-tab');
  tabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      tabs.forEach((t) => t.classList.remove('active'));
      document.querySelectorAll('.cms-view').forEach((v) => v.classList.remove('active'));

      tab.classList.add('active');
      const target = document.getElementById(`view-${tab.dataset.tab}`);
      if (target) target.classList.add('active');

      if (tab.dataset.tab === 'dashboard') loadStats();
      if (tab.dataset.tab === 'articles') loadArticles();
    });
  });
}

// Load Stats & AdSense Scorecard
async function loadStats() {
  try {
    const res = await fetch('/api/stats');
    const data = await res.json();

    document.getElementById('m-articles').textContent = `${data.totalArticles}편`;
    document.getElementById('m-words').textContent = `${(data.totalWords).toLocaleString()}자`;
    document.getElementById('m-avg').textContent = `${data.avgChars.toLocaleString()}자`;
    document.getElementById('m-score').textContent = `${data.adsenseScore}점 / 100`;

    const badge = document.getElementById('badge-score');
    badge.textContent = `AdSense: ${data.adsenseScore}점 (완벽)`;
    if (data.adsenseScore >= 90) {
      badge.style.color = '#10b981';
      badge.style.borderColor = '#10b981';
    }

    // Checklist
    const list = document.getElementById('criteria-list');
    list.innerHTML = data.criteria
      .map((c) => `<li class="${c.pass ? 'pass' : 'fail'}">${c.name}</li>`)
      .join('');

    // Category Distribution Bars
    const catContainer = document.getElementById('category-bars');
    const entries = Object.entries(data.categoryCounts);
    const maxCount = Math.max(...Object.values(data.categoryCounts), 1);

    catContainer.innerHTML = entries
      .map(([cat, count]) => {
        const pct = Math.round((count / maxCount) * 100);
        return `
        <div class="cat-bar-item">
          <div class="cat-bar-labels">
            <span>${cat}</span>
            <span style="font-weight:700;">${count}편</span>
          </div>
          <div class="cat-bar-track">
            <div class="cat-bar-fill" style="width: ${pct}%;"></div>
          </div>
        </div>`;
      })
      .join('');
  } catch (err) {
    console.error('Failed to load stats:', err);
  }
}

// Load Articles
async function loadArticles() {
  try {
    const res = await fetch('/api/articles');
    const data = await res.json();
    currentArticles = data.articles;
    renderArticlesTable(currentArticles);
  } catch (err) {
    console.error('Failed to load articles:', err);
  }
}

function renderArticlesTable(articles) {
  const tbody = document.getElementById('articles-tbody');
  if (!articles.length) {
    tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;">검색된 아티클이 없습니다.</td></tr>';
    return;
  }

  tbody.innerHTML = articles
    .map(
      (a) => `
    <tr>
      <td>
        <strong style="color:#fff;font-size:0.95rem;">${a.title}</strong>
        <div style="font-size:0.75rem;color:#8b92a5;">${a.id}.md</div>
      </td>
      <td><span class="pane-tag pass">${a.category}</span></td>
      <td>${a.author}</td>
      <td>${a.charCount.toLocaleString()}자</td>
      <td>${a.pubDate}</td>
      <td>
        <button class="btn-action" onclick="editArticle('${a.id}')">편집</button>
        <a href="/articles/${a.id}/" target="_blank" class="btn-action" style="text-decoration:none;">보기</a>
        <button class="btn-action delete" onclick="deleteArticle('${a.id}')">삭제</button>
      </td>
    </tr>
  `
    )
    .join('');
}

// Search & Filter
function initFilters() {
  const searchInput = document.getElementById('search-input');
  const catFilter = document.getElementById('category-filter');

  function applyFilter() {
    const q = searchInput.value.toLowerCase().trim();
    const cat = catFilter.value;

    const filtered = currentArticles.filter((a) => {
      const matchQ =
        !q ||
        a.title.toLowerCase().includes(q) ||
        a.id.toLowerCase().includes(q) ||
        a.description.toLowerCase().includes(q);
      const matchCat = !cat || a.categorySlug === cat;
      return matchQ && matchCat;
    });

    renderArticlesTable(filtered);
  }

  searchInput.addEventListener('input', applyFilter);
  catFilter.addEventListener('change', applyFilter);
}

// Open Editor with Article Data
window.editArticle = async function (id) {
  try {
    const res = await fetch(`/api/articles/${id}`);
    const data = await res.json();

    document.getElementById('ed-title').value = data.data.title || '';
    document.getElementById('ed-slug').value = data.id || '';
    document.getElementById('ed-desc').value = data.data.description || '';
    document.getElementById('ed-readtime').value = data.data.readTime || 8;
    document.getElementById('ed-tags').value = Array.isArray(data.data.tags) ? data.data.tags.join(', ') : '';
    document.getElementById('ed-featured').checked = !!data.data.featured;
    document.getElementById('ed-body').value = data.body || '';

    // Match category
    const catVal = `${data.data.category || ''}|${data.data.categorySlug || ''}`;
    const catSelect = document.getElementById('ed-cat');
    for (let opt of catSelect.options) {
      if (opt.value === catVal || opt.value.endsWith(`|${data.data.categorySlug}`)) {
        catSelect.value = opt.value;
        break;
      }
    }

    document.getElementById('editor-heading').textContent = `편집: ${data.data.title}`;

    // Switch to editor tab
    document.querySelector('.nav-tab[data-tab="editor"]').click();
    updateLivePreview();
  } catch (err) {
    alert('아티클을 불러오지 못했습니다: ' + err.message);
  }
};

// Delete Article
window.deleteArticle = async function (id) {
  if (!confirm(`'${id}.md' 아티클을 정말 삭제하시겠습니까?`)) return;

  try {
    const res = await fetch(`/api/articles/${id}`, { method: 'DELETE' });
    const data = await res.json();
    if (data.success) {
      alert('아티클이 삭제되었습니다.');
      loadArticles();
      loadStats();
    } else {
      alert('삭제 실패: ' + data.error);
    }
  } catch (err) {
    alert('삭제 오류: ' + err.message);
  }
};

// New Article button
function initNewArticle() {
  document.getElementById('btn-new-article').addEventListener('click', () => {
    document.getElementById('ed-title').value = '';
    document.getElementById('ed-slug').value = `horology-guide-${Date.now()}`;
    document.getElementById('ed-desc').value = '';
    document.getElementById('ed-readtime').value = 8;
    document.getElementById('ed-tags').value = '시계공학, 무브먼트';
    document.getElementById('ed-featured').checked = false;
    document.getElementById('ed-body').value = `## 1. 서론\n\n여기에 내용을 입력하세요...\n\n## 2. 기구학적 원리\n\n- 핵심 원리 1\n- 핵심 원리 2\n\n## 3. 결론\n\n결론을 정리합니다.`;
    document.getElementById('editor-heading').textContent = '새 아티클 작성';

    document.querySelector('.nav-tab[data-tab="editor"]').click();
    updateLivePreview();
  });
}

// Live Preview & Word Count
function initLiveEditor() {
  const bodyTextarea = document.getElementById('ed-body');
  bodyTextarea.addEventListener('input', updateLivePreview);
}

function updateLivePreview() {
  const body = document.getElementById('ed-body').value;
  const chars = body.replace(/\s+/g, ' ').length;
  document.getElementById('word-counter').textContent = `${chars.toLocaleString()}자`;

  const output = document.getElementById('preview-output');
  output.innerHTML = renderMarkdown(body);
}

// Save Article
function initSave() {
  document.getElementById('btn-save-article').addEventListener('click', async () => {
    const title = document.getElementById('ed-title').value.trim();
    const slug = document.getElementById('ed-slug').value.trim();
    const desc = document.getElementById('ed-desc').value.trim();
    const readTime = Number(document.getElementById('ed-readtime').value) || 8;
    const tags = document.getElementById('ed-tags').value.split(',').map((t) => t.trim()).filter(Boolean);
    const featured = document.getElementById('ed-featured').checked;
    const [category, categorySlug] = document.getElementById('ed-cat').value.split('|');
    const body = document.getElementById('ed-body').value;

    if (!title || !slug) {
      alert('제목과 슬러그(Slug)는 필수 입력값입니다.');
      return;
    }

    try {
      const res = await fetch('/api/articles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          slug,
          title,
          description: desc,
          category,
          categorySlug,
          tags,
          readTime,
          featured,
          body,
        }),
      });

      const data = await res.json();
      if (data.success) {
        alert('아티클이 성공적으로 저장되었습니다!');
        loadStats();
      } else {
        alert('저장 실패: ' + data.error);
      }
    } catch (err) {
      alert('저장 오류: ' + err.message);
    }
  });
}

// AGY Review / Audit
function initAudit() {
  document.getElementById('btn-audit-article').addEventListener('click', async () => {
    const title = document.getElementById('ed-title').value;
    const desc = document.getElementById('ed-desc').value;
    const body = document.getElementById('ed-body').value;

    const res = await fetch('/api/agy/review', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, description: desc, body }),
    });

    const data = await res.json();
    let msg = `[AGY 품질 진단 점수: ${data.score}점 / ${data.status}]\n\n`;
    data.checks.forEach((c) => {
      msg += `${c.pass ? '✓' : '✕'} ${c.name} (${c.detail})\n`;
    });
    alert(msg);
  });
}

// AGY Generator Studio
function initAgyStudio() {
  const btnRun = document.getElementById('btn-run-agy');
  const resultBox = document.getElementById('agy-result-box');
  const preview = document.getElementById('agy-preview');
  const btnLoad = document.getElementById('btn-load-to-editor');

  btnRun.addEventListener('click', async () => {
    const topic = document.getElementById('agy-topic').value.trim();
    if (!topic) {
      alert('생성할 연구 주제를 입력하세요.');
      return;
    }

    const [category, categorySlug] = document.getElementById('agy-cat').value.split('|');
    const keywords = document.getElementById('agy-keywords').value.split(',').map((k) => k.trim()).filter(Boolean);

    btnRun.textContent = '⏳ AGY 기구학 지식 엔진 작동 중...';
    btnRun.disabled = true;

    try {
      const res = await fetch('/api/agy/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic, category, categorySlug, keywords }),
      });

      const data = await res.json();
      btnRun.textContent = '⚡ AGY 전문 칼럼 초안 생성';
      btnRun.disabled = false;

      if (data.success) {
        generatedDraft = data.article;
        resultBox.classList.remove('hidden');
        preview.textContent = `---\ntitle: "${generatedDraft.title}"\ncategory: "${generatedDraft.category}"\n---\n\n${generatedDraft.body}`;
      } else {
        alert('생성 실패: ' + data.error);
      }
    } catch (err) {
      btnRun.textContent = '⚡ AGY 전문 칼럼 초안 생성';
      btnRun.disabled = false;
      alert('생성 통신 오류: ' + err.message);
    }
  });

  btnLoad.addEventListener('click', () => {
    if (!generatedDraft) return;

    document.getElementById('ed-title').value = generatedDraft.title;
    document.getElementById('ed-slug').value = generatedDraft.slug;
    document.getElementById('ed-desc').value = generatedDraft.description;
    document.getElementById('ed-readtime').value = generatedDraft.readTime;
    document.getElementById('ed-tags').value = generatedDraft.tags.join(', ');
    document.getElementById('ed-featured').checked = false;
    document.getElementById('ed-body').value = generatedDraft.body;

    const catVal = `${generatedDraft.category}|${generatedDraft.categorySlug}`;
    const catSelect = document.getElementById('ed-cat');
    for (let opt of catSelect.options) {
      if (opt.value === catVal) {
        catSelect.value = opt.value;
        break;
      }
    }

    document.getElementById('editor-heading').textContent = `AGY 생성 초안: ${generatedDraft.title}`;
    document.querySelector('.nav-tab[data-tab="editor"]').click();
    updateLivePreview();
  });
}

// Build Runner
function initBuildRunner() {
  const btn = document.getElementById('btn-trigger-build');
  const logs = document.getElementById('build-logs');

  btn.addEventListener('click', async () => {
    btn.textContent = '⏳ 빌드 컴파일 중...';
    btn.disabled = true;
    logs.textContent = '>>> 빌드 요청 전송...\n';

    try {
      const res = await fetch('/api/build', { method: 'POST' });
      const reader = res.body.getReader();
      const decoder = new TextDecoder('utf-8');

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const text = decoder.decode(value);
        logs.textContent += text;
        logs.scrollTop = logs.scrollHeight;
      }
    } catch (err) {
      logs.textContent += `\n>>> 통신 오류: ${err.message}\n`;
    } finally {
      btn.textContent = '⚡ npm run build 실행';
      btn.disabled = false;
    }
  });
}

// Bootstrap
document.addEventListener('DOMContentLoaded', () => {
  initTabs();
  loadStats();
  initFilters();
  initNewArticle();
  initLiveEditor();
  initSave();
  initAudit();
  initAgyStudio();
  initBuildRunner();
});
