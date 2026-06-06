#!/usr/bin/env node
// =============================================================================
// agile/build.mjs — self-contained board generator (plain Node ESM, zero deps)
//
// One identical copy lives in every `agile/` folder. Behaviour auto-detects by
// the folder's own location:
//   • inside a project folder  → reads only THIS folder's items, writes THIS
//     folder's index.html (strictly local, portable).
//   • inside the repo-root `agile/` folder → AGGREGATOR: globs every
//     `*/agile/**` across the repo and writes the GLOBAL index.html.
//
// Run:  node build.mjs        (Bun runs it too: bun build.mjs)
// Reads:  ./stories/*.md  ./tasks/*.md  ./epics/*.md   (+ siblings if root)
// Writes: ./index.html
//
// See /AGILE.md at the repo root for the full method.
// =============================================================================

import { readdirSync, readFileSync, writeFileSync, existsSync, statSync } from 'node:fs'
import { join, dirname, basename } from 'node:path'
import { fileURLToPath } from 'node:url'

const HERE = dirname(fileURLToPath(import.meta.url))
const SUBFOLDERS = ['stories', 'tasks', 'epics']
const STATUSES = ['backlog', 'todo', 'in-progress', 'blocked', 'done']
const TYPES = ['story', 'task', 'epic']
const PRIORITIES = ['high', 'low']
const REQUIRED = ['id', 'type', 'title', 'status', 'priority', 'created', 'updated']

// ---------------------------------------------------------------------------
// 1. Discover agile folders to read
// ---------------------------------------------------------------------------
function isRepoRoot(agileDir) {
  const parent = dirname(agileDir)
  const groups = ['apps', 'services', 'packages']
  return groups.filter((g) => existsSync(join(parent, g)) && statSync(join(parent, g)).isDirectory()).length >= 2
}

function projectAgileDirs(repoRoot) {
  const dirs = [join(repoRoot, 'agile')]
  for (const group of ['apps', 'services', 'packages']) {
    const gdir = join(repoRoot, group)
    if (!existsSync(gdir)) continue
    for (const name of readdirSync(gdir)) {
      const adir = join(gdir, name, 'agile')
      if (existsSync(adir) && statSync(adir).isDirectory()) dirs.push(adir)
    }
  }
  return dirs
}

const ROOT_MODE = isRepoRoot(HERE)
const SCOPE = ROOT_MODE ? 'global' : 'local'
const agileDirs = ROOT_MODE ? projectAgileDirs(dirname(HERE)) : [HERE]

// ---------------------------------------------------------------------------
// 2. Frontmatter parser (flat keys + simple [a, b] arrays — no yaml dep)
// ---------------------------------------------------------------------------
function parseFrontmatter(raw, fileLabel, warnings) {
  const m = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/.exec(raw)
  if (!m) {
    warnings.push(`${fileLabel}: no frontmatter block — skipped`)
    return null
  }
  const fm = {}
  for (const line of m[1].split(/\r?\n/)) {
    if (!line.trim() || /^\s*#/.test(line)) continue
    const kv = /^([A-Za-z_][\w-]*):\s*(.*)$/.exec(line)
    if (!kv) continue
    const key = kv[1]
    let val = kv[2].trim()
    if (val.startsWith('[') && val.endsWith(']')) {
      val = val
        .slice(1, -1)
        .split(',')
        .map((s) => s.trim().replace(/^['"]|['"]$/g, ''))
        .filter(Boolean)
    } else if (val === 'null' || val === '') {
      val = null
    } else {
      val = val.replace(/^['"]|['"]$/g, '')
    }
    fm[key] = val
  }
  return { fm, body: m[2] }
}

function validate(fm, fileLabel, warnings) {
  for (const k of REQUIRED) {
    if (fm[k] == null || fm[k] === '') warnings.push(`${fileLabel}: missing required field "${k}"`)
  }
  if (fm.type && !TYPES.includes(fm.type)) warnings.push(`${fileLabel}: type "${fm.type}" not in ${TYPES.join('|')}`)
  if (fm.status && !STATUSES.includes(fm.status)) warnings.push(`${fileLabel}: status "${fm.status}" not in ${STATUSES.join('|')}`)
  if (fm.priority && !PRIORITIES.includes(fm.priority)) warnings.push(`${fileLabel}: priority "${fm.priority}" not in ${PRIORITIES.join('|')}`)
}

// ---------------------------------------------------------------------------
// 3. Minimal markdown → HTML (headings, lists, checkboxes, code, bold, links)
// ---------------------------------------------------------------------------
function esc(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}
function inline(s) {
  return esc(s)
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" rel="noreferrer">$1</a>')
}
function mdToHtml(src) {
  const out = []
  let list = null // 'ul' | 'check'
  const closeList = () => { if (list) { out.push('</ul>'); list = null } }
  for (const lineRaw of (src || '').split(/\r?\n/)) {
    const line = lineRaw.replace(/\s+$/, '')
    let m
    if ((m = /^(#{2,4})\s+(.*)$/.exec(line))) {
      closeList(); out.push(`<h4 class="md-h">${inline(m[2])}</h4>`)
    } else if ((m = /^-\s+\[([ xX])\]\s+(.*)$/.exec(line))) {
      if (list !== 'check') { closeList(); out.push('<ul class="md-checks">'); list = 'check' }
      const done = m[1].toLowerCase() === 'x'
      out.push(`<li class="${done ? 'done' : ''}"><span class="box">${done ? '✓' : ''}</span>${inline(m[2])}</li>`)
    } else if ((m = /^[-*]\s+(.*)$/.exec(line))) {
      if (list !== 'ul') { closeList(); out.push('<ul>'); list = 'ul' }
      out.push(`<li>${inline(m[1])}</li>`)
    } else if (line.trim() === '') {
      closeList()
    } else {
      closeList(); out.push(`<p>${inline(line)}</p>`)
    }
  }
  closeList()
  return out.join('\n')
}

// ---------------------------------------------------------------------------
// 4. Read every item
// ---------------------------------------------------------------------------
const warnings = []
const items = []
for (const adir of agileDirs) {
  for (const sub of SUBFOLDERS) {
    const dir = join(adir, sub)
    if (!existsSync(dir)) continue
    for (const file of readdirSync(dir)) {
      if (!file.endsWith('.md')) continue
      const label = join(basename(dirname(adir)) === 'agile' ? '' : basename(dirname(adir)), sub, file)
      const parsed = parseFrontmatter(readFileSync(join(dir, file), 'utf8'), label, warnings)
      if (!parsed) continue
      const { fm, body } = parsed
      validate(fm, label, warnings)
      const checks = (body.match(/^-\s+\[[ xX]\]/gm) || [])
      const acDone = (body.match(/^-\s+\[[xX]\]/gm) || []).length
      items.push({
        id: fm.id || file.replace(/\.md$/, ''),
        type: fm.type || 'story',
        title: fm.title || '(untitled)',
        status: fm.status || 'backlog',
        priority: fm.priority || 'low',
        tags: Array.isArray(fm.tags) ? fm.tags : fm.tags ? [fm.tags] : [],
        depends_on: Array.isArray(fm.depends_on) ? fm.depends_on : fm.depends_on ? [fm.depends_on] : [],
        parent: fm.parent || null,
        epic: fm.epic || null,
        created: fm.created || '',
        updated: fm.updated || '',
        project: String(fm.id || '').split('-')[0] || 'UNKNOWN',
        bodyHtml: mdToHtml(body.trim()),
        acTotal: checks.length,
        acDone,
      })
    }
  }
}

// stable order: project, then status order, then id
const statusRank = Object.fromEntries(STATUSES.map((s, i) => [s, i]))
items.sort((a, b) =>
  a.project.localeCompare(b.project) ||
  (statusRank[a.status] ?? 9) - (statusRank[b.status] ?? 9) ||
  a.id.localeCompare(b.id)
)

// ---------------------------------------------------------------------------
// 5. Render index.html (self-contained: inlined CSS + JS + JSON data)
// ---------------------------------------------------------------------------
const generatedAt = new Date().toISOString().replace('T', ' ').slice(0, 16)
const dataJson = JSON.stringify({ scope: SCOPE, generatedAt, items }).replace(/</g, '\\u003c')

const html = `<!doctype html>
<html lang="en" data-theme="dark">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>agile · ${SCOPE}</title>
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link href="https://fonts.googleapis.com/css2?family=Electrolize&family=JetBrains+Mono:wght@400;500;700&display=swap" rel="stylesheet" />
<style>
:root{
  --bg:#100f10; --elev:#1e1e1e; --line:rgba(255,255,255,.12); --line2:rgba(255,255,255,.22);
  --fg:#e0e0e0; --shine:#fff; --muted:#aaa; --faint:#6f6f6f; --on:#100f10;
  --primary:#66ef73; --red:#ff5c5c; --yellow:#e0c36a; --cyan:#66d9ef; --blue:#9aa4ff; --purple:#b98cff;
  --mono:"JetBrains Mono",ui-monospace,"SF Mono",Menlo,monospace;
  --disp:"Electrolize","Space Grotesk",system-ui,sans-serif;
}
*,*::before,*::after{box-sizing:border-box}
html,body{margin:0}
body{background:var(--bg);color:var(--fg);font-family:var(--mono);font-size:14px;line-height:1.45;-webkit-font-smoothing:antialiased}
a{color:inherit}
::selection{background:var(--primary);color:var(--on)}
::-webkit-scrollbar{width:8px;height:8px}::-webkit-scrollbar-thumb{background:var(--line2)}
.wrap{max-width:1200px;margin:0 auto;padding:24px 28px 80px}
.head{display:flex;align-items:flex-end;justify-content:space-between;gap:24px;border-bottom:1px solid var(--line);padding-bottom:16px;margin-bottom:18px;flex-wrap:wrap}
.head h1{font-family:var(--disp);font-weight:400;font-size:30px;letter-spacing:-.01em;margin:0;line-height:1}
.head h1 .accent{position:relative}
.head h1 .accent::before{content:"";position:absolute;left:-2%;right:-6%;top:68%;height:22%;background:var(--primary);opacity:.9;z-index:-1}
.head .meta{font-size:11px;color:var(--faint);text-align:right;text-transform:lowercase;letter-spacing:.04em}
.metrics{display:flex;flex-wrap:wrap;gap:10px;margin-bottom:18px}
.metric{border:1px solid var(--line);background:var(--elev);padding:10px 14px;min-width:96px;cursor:pointer;transition:border-color .15s}
.metric:hover{border-color:var(--line2)}
.metric.on{border-color:var(--primary);box-shadow:inset 0 -2px 0 var(--primary)}
.metric .v{font-family:var(--disp);font-size:26px;line-height:1;font-variant-numeric:tabular-nums}
.metric .l{font-size:10px;color:var(--faint);text-transform:lowercase;letter-spacing:.05em;margin-top:4px}
.metric[data-s="done"] .v{color:var(--primary)} .metric[data-s="in-progress"] .v{color:var(--cyan)}
.metric[data-s="blocked"] .v{color:var(--red)} .metric[data-s="todo"] .v{color:var(--yellow)}
.bar{display:flex;flex-wrap:wrap;gap:8px;align-items:center;margin-bottom:16px}
.bar input,.bar select{font-family:var(--mono);font-size:12px;background:transparent;color:var(--fg);border:1px solid var(--line);padding:7px 10px}
.bar input{min-width:200px;flex:1}
.bar input:focus,.bar select:focus{outline:none;border-color:var(--primary);box-shadow:0 0 0 3px rgba(102,239,115,.18)}
.bar input::placeholder{font-style:italic;color:var(--faint)}
.toggle{display:flex;border:1px solid var(--line)}
.toggle button{font-family:var(--mono);font-size:11px;text-transform:uppercase;letter-spacing:.08em;background:transparent;color:var(--muted);border:0;padding:7px 12px;cursor:pointer}
.toggle button.on{background:rgba(102,239,115,.1);color:var(--primary);box-shadow:inset 0 -2px 0 var(--primary)}
.count{font-size:11px;color:var(--faint);margin-left:auto}
.group{margin-top:18px}
.group .gh{display:flex;align-items:center;gap:10px;font-family:var(--mono);font-size:11px;letter-spacing:.12em;text-transform:uppercase;color:var(--faint);padding-bottom:6px;border-bottom:1px solid var(--line);margin-bottom:2px}
.group .gh .n{color:var(--shine)} .group .gh .c{margin-left:auto}
.row{display:grid;grid-template-columns:130px 1fr auto auto;gap:12px;align-items:center;padding:8px 10px;border-bottom:1px solid var(--line);cursor:pointer}
.row:hover{background:rgba(255,255,255,.03)}
.row .id{font-size:12px;color:var(--muted);font-variant-numeric:tabular-nums}
.row .ti{color:var(--fg);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.row .ti .typ{color:var(--faint);font-size:10px;text-transform:uppercase;letter-spacing:.06em;margin-right:8px}
.row .ac{font-size:11px;color:var(--faint);font-variant-numeric:tabular-nums}
.badge{font-size:10px;letter-spacing:.05em;text-transform:lowercase;padding:3px 8px;border:1px solid var(--line);display:inline-flex;align-items:center;gap:5px;white-space:nowrap}
.badge .dot{width:5px;height:5px;background:currentColor;display:inline-block}
.badge.done{color:var(--primary);border-color:rgba(102,239,115,.4);background:rgba(102,239,115,.1)}
.badge.in-progress{color:var(--cyan);border-color:rgba(102,217,239,.4);background:rgba(102,217,239,.1)}
.badge.blocked{color:var(--red);border-color:rgba(255,92,92,.4);background:rgba(255,92,92,.1)}
.badge.todo{color:var(--yellow);border-color:rgba(224,195,106,.4);background:rgba(224,195,106,.1)}
.badge.backlog{color:var(--muted);border-color:var(--line)}
.pri{font-size:10px;text-transform:uppercase;letter-spacing:.06em;color:var(--faint)}
.pri.high{color:var(--shine)}
.detail{grid-column:1/-1;padding:6px 10px 14px;border-bottom:1px solid var(--line);background:rgba(255,255,255,.015)}
.detail .md-h{font-family:var(--mono);font-size:11px;text-transform:uppercase;letter-spacing:.08em;color:var(--faint);margin:12px 0 4px}
.detail p{margin:4px 0;color:var(--muted)}
.detail ul{margin:4px 0;padding-left:18px} .detail li{color:var(--muted)}
.detail .md-checks{list-style:none;padding-left:0}
.detail .md-checks li{display:flex;gap:8px;align-items:baseline}
.detail .md-checks li .box{width:14px;height:14px;border:1px solid var(--line);display:inline-flex;align-items:center;justify-content:center;font-size:10px;color:var(--primary);flex:none}
.detail .md-checks li.done{color:var(--fg)} .detail .md-checks li.done .box{border-color:var(--primary)}
.detail code{font-family:var(--mono);background:rgba(255,255,255,.06);padding:.1em .35em;font-size:.92em;color:#d6deeb}
.detail .kv{display:flex;flex-wrap:wrap;gap:6px 16px;font-size:11px;color:var(--faint);margin-top:10px}
.detail .kv b{color:var(--muted);font-weight:400}
.tableview{width:100%;border-collapse:collapse;margin-top:8px}
.tableview th,.tableview td{text-align:left;padding:7px 10px;border-bottom:1px solid var(--line);font-size:12px}
.tableview th{font-size:10px;text-transform:uppercase;letter-spacing:.1em;color:var(--faint);font-weight:400;cursor:pointer;user-select:none}
.tableview tbody tr{cursor:pointer} .tableview tbody tr:hover td{background:rgba(255,255,255,.03)}
.empty{padding:40px;text-align:center;color:var(--faint);border:1px solid var(--line);margin-top:16px}
.tagchip{font-size:10px;color:var(--blue);margin-right:6px}
.foot{margin-top:28px;border-top:1px solid var(--line);padding-top:10px;font-size:10px;color:var(--faint);text-transform:lowercase;letter-spacing:.04em}
</style>
</head>
<body>
<div class="wrap">
  <div class="head">
    <h1>agile <span class="accent">${SCOPE === 'global' ? 'board' : 'board'}</span></h1>
    <div class="meta">scope: ${SCOPE}<br/>generated ${generatedAt}</div>
  </div>
  <div class="metrics" id="metrics"></div>
  <div class="bar">
    <input id="q" placeholder="search id, title, tag…" />
    <select id="f-project" hidden></select>
    <select id="f-type"></select>
    <select id="f-status"></select>
    <select id="f-priority"></select>
    <select id="f-tag"></select>
    <div class="toggle"><button data-view="grouped" class="on">grouped</button><button data-view="table">table</button></div>
    <span class="count" id="count"></span>
  </div>
  <div id="board"></div>
  <div class="foot">agile board · ${SCOPE} · see /AGILE.md for the method · zero deps, open from file://</div>
</div>
<script type="application/json" id="agile-data">${dataJson}</script>
<script>
const RAW = JSON.parse(document.getElementById('agile-data').textContent);
const ITEMS = RAW.items, SCOPE = RAW.scope;
const STATUSES = ${JSON.stringify(STATUSES)};
const state = { view: 'grouped', status: '', sortKey: 'id', sortDir: 1 };

function uniq(arr){ return [...new Set(arr)].sort(); }
function opt(sel, vals, label){ const e=document.getElementById(sel); e.innerHTML='<option value="">'+label+'</option>'+vals.map(v=>'<option>'+v+'</option>').join(''); }
opt('f-type', uniq(ITEMS.map(i=>i.type)), 'type: all');
opt('f-status', STATUSES.filter(s=>ITEMS.some(i=>i.status===s)), 'status: all');
opt('f-priority', uniq(ITEMS.map(i=>i.priority)), 'priority: all');
opt('f-tag', uniq(ITEMS.flatMap(i=>i.tags)), 'tag: all');
if (SCOPE === 'global'){ const e=document.getElementById('f-project'); e.hidden=false; opt('f-project', uniq(ITEMS.map(i=>i.project)), 'project: all'); }

function filtered(){
  const q = document.getElementById('q').value.toLowerCase().trim();
  const fp = document.getElementById('f-project').value;
  const ft = document.getElementById('f-type').value;
  const fs = state.status || document.getElementById('f-status').value;
  const fpr = document.getElementById('f-priority').value;
  const ftag = document.getElementById('f-tag').value;
  return ITEMS.filter(i=>{
    if (fp && i.project!==fp) return false;
    if (ft && i.type!==ft) return false;
    if (fs && i.status!==fs) return false;
    if (fpr && i.priority!==fpr) return false;
    if (ftag && !i.tags.includes(ftag)) return false;
    if (q && !(i.id.toLowerCase().includes(q)||i.title.toLowerCase().includes(q)||i.tags.join(' ').toLowerCase().includes(q))) return false;
    return true;
  });
}
function badge(s){ return '<span class="badge '+s+'"><span class="dot"></span>'+s+'</span>'; }
function acStr(i){ return i.acTotal ? i.acDone+'/'+i.acTotal : ''; }
function detail(i){
  const deps = (i.depends_on&&i.depends_on.length)?'<b>depends on</b> '+i.depends_on.join(', '):'';
  const par = i.parent?'<b>parent</b> '+i.parent:'';
  const ep = i.epic?'<b>epic</b> '+i.epic:'';
  const tags = i.tags.length?'<b>tags</b> '+i.tags.join(', '):'';
  const kv = [par,ep,deps,tags,'<b>created</b> '+i.created,'<b>updated</b> '+i.updated].filter(Boolean).join('<span style="opacity:.4">·</span> ');
  return '<div class="detail">'+(i.bodyHtml||'<p style="color:var(--faint)">no description</p>')+'<div class="kv">'+kv+'</div></div>';
}
function renderMetrics(){
  const m = document.getElementById('metrics'); const all = ITEMS;
  const cards = STATUSES.map(s=>{ const n=all.filter(i=>i.status===s).length; return '<div class="metric'+(state.status===s?' on':'')+'" data-s="'+s+'" data-pick="'+s+'"><div class="v">'+n+'</div><div class="l">'+s+'</div></div>'; });
  cards.unshift('<div class="metric'+(state.status===''?' on':'')+'" data-pick=""><div class="v">'+all.length+'</div><div class="l">all</div></div>');
  m.innerHTML = cards.join('');
  m.querySelectorAll('[data-pick]').forEach(el=>el.onclick=()=>{ state.status = el.dataset.pick; document.getElementById('f-status').value=''; render(); });
}
function renderGrouped(list){
  if(!list.length) return '<div class="empty">no items match</div>';
  const groups = {};
  list.forEach(i=>{ (groups[i.project]=groups[i.project]||[]).push(i); });
  return Object.keys(groups).sort().map(p=>{
    const rows = groups[p].map(i=>(
      '<div class="row" data-id="'+i.id+'">'
      +'<span class="id">'+i.id+'</span>'
      +'<span class="ti"><span class="typ">'+i.type+'</span>'+i.title+'</span>'
      +'<span class="ac">'+acStr(i)+'</span>'
      +badge(i.status)
      +'<span class="pri '+i.priority+'">'+i.priority+'</span>'
      +'</div>'
    )).join('');
    return '<div class="group"><div class="gh"><span class="n">'+p+'</span><span class="c">'+groups[p].length+'</span></div>'+rows+'</div>';
  }).join('');
}
function renderTable(list){
  if(!list.length) return '<div class="empty">no items match</div>';
  const cols = [['id','id'],['title','title'],['project','project'],['type','type'],['status','status'],['priority','pri']];
  const sorted = [...list].sort((a,b)=>{ const k=state.sortKey; return String(a[k]).localeCompare(String(b[k]))*state.sortDir || a.id.localeCompare(b.id); });
  const head = '<tr>'+cols.map(c=>'<th data-sort="'+c[0]+'">'+c[0]+(state.sortKey===c[0]?(state.sortDir>0?' ▲':' ▼'):'')+'</th>').join('')+'</tr>';
  const body = sorted.map(i=>(
    '<tr data-id="'+i.id+'"><td class="id">'+i.id+'</td><td>'+i.title+'</td><td>'+i.project+'</td><td>'+i.type+'</td><td>'+badge(i.status)+'</td><td><span class="pri '+i.priority+'">'+i.priority+'</span></td></tr>'
  )).join('');
  return '<table class="tableview"><thead>'+head+'</thead><tbody>'+body+'</tbody></table>';
}
let openId = null;
function render(){
  renderMetrics();
  const list = filtered();
  document.getElementById('count').textContent = list.length+' / '+ITEMS.length+' items';
  const board = document.getElementById('board');
  board.innerHTML = state.view==='grouped' ? renderGrouped(list) : renderTable(list);
  // expand handlers
  board.querySelectorAll('[data-id]').forEach(el=>{
    el.onclick=(e)=>{
      if(e.target.closest('[data-sort]')) return;
      const id=el.dataset.id; const i=ITEMS.find(x=>x.id===id);
      const ex=el.nextElementSibling;
      if(ex&&ex.classList&&ex.classList.contains('detail')){ ex.remove(); openId=null; return; }
      board.querySelectorAll('.detail').forEach(d=>d.remove());
      el.insertAdjacentHTML('afterend', detail(i)); openId=id;
    };
  });
  if(state.view==='table'){
    board.querySelectorAll('[data-sort]').forEach(th=>th.onclick=()=>{ const k=th.dataset.sort; if(state.sortKey===k)state.sortDir*=-1; else {state.sortKey=k;state.sortDir=1;} render(); });
  }
}
document.querySelectorAll('.toggle button').forEach(b=>b.onclick=()=>{ document.querySelectorAll('.toggle button').forEach(x=>x.classList.remove('on')); b.classList.add('on'); state.view=b.dataset.view; render(); });
['q','f-project','f-type','f-status','f-priority','f-tag'].forEach(id=>{ const el=document.getElementById(id); el.addEventListener('input',()=>{ if(id==='f-status')state.status=''; render(); }); });
render();
</script>
</body>
</html>
`

writeFileSync(join(HERE, 'index.html'), html)

// ---------------------------------------------------------------------------
// 6. Report
// ---------------------------------------------------------------------------
const byStatus = STATUSES.map((s) => `${s} ${items.filter((i) => i.status === s).length}`).join('  ')
console.log(`agile/build.mjs · ${SCOPE} · ${items.length} items (${byStatus})`)
if (!items.length) console.log('  ⚠ no items found — add markdown under stories/ tasks/ epics/')
if (warnings.length) {
  console.log(`  ⚠ ${warnings.length} warning(s):`)
  for (const w of warnings) console.log('    - ' + w)
}
console.log(`  → wrote ${join(HERE, 'index.html')}`)
