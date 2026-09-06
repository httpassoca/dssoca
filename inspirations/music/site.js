/**
 * Waveform — page-local interactivity for the playlist page.
 * Play/pause (hero + transport buttons, the playing row's Spinner, the fake clock), heart
 * toggles (with the sidebar Liked Songs count), the seek/volume ranges, shuffle/repeat
 * pressed state, column sorting and the playlist Menu's actions.
 */
import { toast } from '../vendor/vanilla/index.js'
import { setAxes, getAxes } from '../assets/axes.js'

const $ = (sel, root = document) => root.querySelector(sel)
const $$ = (sel, root = document) => [...root.querySelectorAll(sel)]

const fmt = (s) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`
const fill = (input) => {
  const pct = ((input.value - input.min) / (input.max - input.min)) * 100
  input.style.setProperty('--music-fill', `${pct}%`)
}

// ---- play / pause ---------------------------------------------------------------------
const seek = $('#music-seek')
const elapsed = $('#music-elapsed')
const total = $('#music-total')
let playing = true
let clock = null

function playingRow() {
  return $('#music-table tbody tr.music-playing')
}

function renderPlayState() {
  for (const btn of $$('[data-play-toggle]')) {
    btn.setAttribute('aria-label', playing ? 'Pause' : 'Play')
    btn
      .querySelector('[data-glyph]')
      ?.setAttribute('href', playing ? '#music-i-pause' : '#music-i-play')
  }
  const row = playingRow()
  if (row) {
    row.querySelector('.music-eq').hidden = !playing
    row.querySelector('.music-num').hidden = playing
  }
  clearInterval(clock)
  if (playing) clock = setInterval(tick, 1000)
}

function updateSeek() {
  fill(seek)
  elapsed.textContent = fmt(seek.value)
  seek.setAttribute('aria-valuetext', `${fmt(seek.value)} of ${fmt(seek.max)}`)
}

function tick() {
  if (Number(seek.value) >= Number(seek.max)) {
    playTrack(nextRow(1))
    return
  }
  seek.value = Number(seek.value) + 1
  updateSeek()
}

for (const btn of $$('[data-play-toggle]')) {
  btn.addEventListener('click', () => {
    playing = !playing
    renderPlayState()
  })
}
seek.addEventListener('input', updateSeek)

// ---- track switching (prev / next / row double-click) ----------------------------------
function rows() {
  return $$('#music-table tbody tr')
}

function nextRow(dir) {
  const list = rows()
  const i = list.indexOf(playingRow())
  return list[(i + dir + list.length) % list.length]
}

function playTrack(row) {
  const current = playingRow()
  if (current && current !== row) {
    current.classList.remove('music-playing')
    current.querySelector('.music-eq').hidden = true
    current.querySelector('.music-num').hidden = false
  }
  row.classList.add('music-playing')
  $('#music-now-title').textContent = row.dataset.title
  $('#music-now-artist').textContent = row.querySelector('.music-track-artist').textContent
  const cover = row.querySelector('.music-thumb use').getAttribute('href')
  $('.music-now-cover use').setAttribute('href', cover)
  const like = row.querySelector('[data-like]')
  syncNowLike(like.getAttribute('aria-pressed') === 'true', row.dataset.title)
  seek.max = row.dataset.duration
  seek.value = 0
  total.textContent = fmt(seek.max)
  updateSeek()
  playing = true
  renderPlayState()
}

$('#music-prev').addEventListener('click', () => playTrack(nextRow(-1)))
$('#music-next').addEventListener('click', () => playTrack(nextRow(1)))
$('#music-table').addEventListener('dblclick', (e) => {
  const row = e.target.closest('tbody tr')
  if (row && !e.target.closest('button')) playTrack(row)
})

// ---- hearts ---------------------------------------------------------------------------
const likedCount = $('#music-liked-count')

function setHeart(btn, on) {
  btn.setAttribute('aria-pressed', String(on))
  btn.querySelector('use').setAttribute('href', on ? '#music-i-heart-fill' : '#music-i-heart')
}

function syncNowLike(on, title) {
  const now = $('#music-now-like')
  now.setAttribute('aria-label', `Like ${title}`)
  setHeart(now, on)
}

function toggleLike(btn) {
  const on = btn.getAttribute('aria-pressed') !== 'true'
  setHeart(btn, on)
  likedCount.textContent = String(Number(likedCount.textContent) + (on ? 1 : -1))
  return on
}

for (const btn of $$('#music-table [data-like]')) {
  btn.addEventListener('click', () => {
    const on = toggleLike(btn)
    if (btn.closest('tr') === playingRow()) setHeart($('#music-now-like'), on)
  })
}
$('#music-now-like').addEventListener('click', () => {
  const on = toggleLike($('#music-now-like'))
  const rowLike = playingRow()?.querySelector('[data-like]')
  if (rowLike) setHeart(rowLike, on)
})

// ---- shuffle / repeat (pressed toggles) -------------------------------------------------
function syncPressed(selector) {
  for (const btn of $$(selector)) {
    btn.addEventListener('click', () => {
      const on = btn.getAttribute('aria-pressed') !== 'true'
      for (const b of $$(selector)) b.setAttribute('aria-pressed', String(on))
    })
  }
}
syncPressed('[data-shuffle]')
syncPressed('#music-repeat')

// ---- volume ---------------------------------------------------------------------------
const vol = $('#music-vol')
vol.addEventListener('input', () => {
  fill(vol)
  $('#music-vol-value').textContent = `${vol.value}%`
})

// ---- column sorting -------------------------------------------------------------------
const table = $('#music-table')
table.querySelector('thead').addEventListener('click', (e) => {
  const th = e.target.closest('th[data-sort]')
  if (!th) return
  const key = th.dataset.sort
  const dir = th.getAttribute('aria-sort') === 'ascending' ? 'descending' : 'ascending'
  for (const h of $$('th[data-sort]', table)) {
    const active = h === th
    h.setAttribute('aria-sort', active ? dir : 'none')
    h.querySelector('.indicator').textContent = active ? (dir === 'ascending' ? '↑' : '↓') : '↕'
  }
  const numeric = key === 'index' || key === 'duration'
  const sign = dir === 'ascending' ? 1 : -1
  const sorted = rows().sort((a, b) => {
    const av = a.dataset[key]
    const bv = b.dataset[key]
    return (numeric ? Number(av) - Number(bv) : av.localeCompare(bv)) * sign
  })
  table.querySelector('tbody').append(...sorted)
})

// ---- playlist menu + misc buttons --------------------------------------------------------
const MENU_MESSAGES = {
  queue: ['success', 'Late Night Signals added to your queue'],
  share: ['info', 'Link copied — waveform.example/p/late-night-signals'],
  edit: ['info', 'Editing playlist details'],
  delete: ['error', 'Playlist deleted (not really — this is a demo)'],
}
$('#music-more').addEventListener('ss:select', (e) => {
  const [kind, message] = MENU_MESSAGES[e.detail.value] ?? ['info', e.detail.value]
  toast[kind](message)
})
$('#music-download').addEventListener('click', () =>
  toast.promise(new Promise((r) => setTimeout(r, 1800)), {
    loading: 'Downloading 24 tracks…',
    success: 'Available offline',
    error: 'Download failed',
  }),
)
$('#music-new-playlist').addEventListener('click', () => toast.info('New playlist created'))
$('#music-theme').addEventListener('click', () =>
  setAxes({ theme: getAxes().theme === 'dark' ? 'light' : 'dark' }),
)

// ---- initial paint --------------------------------------------------------------------
fill(vol)
updateSeek()
renderPlayState()
