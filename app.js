const t = window.VEGAS_I18N.t;
const STORAGE_KEY = 'vegasGolfState.v1';
const HISTORY_KEY = 'vegasGolfHistory.v1';
const COURSE_KEY = 'vegasGolfCourses.v1';
const CLIENT_KEY = 'vegasGolfClientId.v1';
const DELETE_KEY = 'vegasGolfDeletedRounds.v1';
const GAME_LIMIT = 200;
const CLOUD_ROUND_LIMIT = 1000;
const EDIT_LOCK_TTL_MS = 12000;
const COURSE_SEARCH_AREAS = [
  { country: 'Sweden', regions: ['Stockholm County', 'Uppsala County', 'Sodermanland County', 'Vastra Gotaland County', 'Skane County', 'Halland County'] },
  { country: 'United States', regions: ['Nevada', 'California', 'Florida', 'Arizona', 'Texas', 'New York', 'Hawaii'] },
  { country: 'China', regions: ['Beijing', 'Shanghai', 'Guangdong', 'Hainan', 'Yunnan', 'Zhejiang', 'Jiangsu'] },
  { country: 'Thailand', regions: ['Bangkok', 'Chon Buri', 'Phuket', 'Chiang Mai', 'Hua Hin'] },
  { country: 'Japan', regions: ['Tokyo', 'Chiba', 'Kanagawa', 'Hokkaido', 'Okinawa'] },
  { country: 'Spain', regions: ['Andalusia', 'Catalonia', 'Madrid', 'Valencian Community', 'Balearic Islands'] },
  { country: 'United Kingdom', regions: ['England', 'Scotland', 'Wales', 'Northern Ireland'] },
  { country: 'Canada', regions: ['Ontario', 'British Columbia', 'Quebec', 'Alberta'] },
  { country: 'Australia', regions: ['New South Wales', 'Victoria', 'Queensland', 'Western Australia'] }
];

const defaultCourses = [
  { id: 'bro-hof-stadium', name: 'Bro Hof Stadium', pars: [5,4,4,3,4,4,3,4,5,4,3,5,5,4,5,3,3,4], indexes: [8,4,18,16,2,14,12,10,6,9,15,13,7,3,1,11,5,17] },
  { id: 'bro-hof-castle', name: 'Bro Hof Castle', pars: [5,3,4,3,5,4,3,4,5,5,3,3,5,4,5,4,3,4], indexes: [5,13,11,9,7,1,17,15,3,4,16,18,6,14,2,12,10,8] },
  { id: 'kungsangen-kings', name: 'Kungsangen Kings', pars: [4,4,3,4,4,4,3,5,4,4,3,4,3,5,3,4,4,5], indexes: [5,7,15,1,3,13,17,9,11,10,16,4,6,12,18,8,14,2] },
  { id: 'kungsangen-queens', name: 'Kungsangen Queens', pars: [4,4,3,4,3,4,4,5,4,5,3,4,5,3,4,4,4,3], indexes: [4,2,18,10,16,14,6,8,12,9,13,1,5,17,15,3,7,11] },
  { id: 'waxholm', name: 'Waxholm', pars: [4,5,3,4,4,4,4,5,4,4,3,4,4,4,5,4,5,3], indexes: [18,4,8,10,6,14,16,12,2,11,13,3,17,9,1,7,15,5] },
  { id: 'lindo-dal', name: 'Lindo Dal', pars: [4,3,4,3,4,5,4,4,5,4,3,4,4,3,4,4,3,5], indexes: [11,13,3,7,1,5,15,17,9,10,6,4,16,8,14,2,18,12] },
  { id: 'kyssinge', name: 'Kyssinge', pars: [4,5,5,4,3,4,4,3,5,4,5,4,4,5,3,4,3,5], indexes: [11,17,5,9,13,15,1,7,3,4,2,12,14,6,8,16,18,10] },
  { id: 'bodaholm', name: 'Bodaholm', pars: [4,4,3,5,4,3,4,3,5,5,4,4,4,3,4,3,4,5], indexes: [9,15,3,13,1,17,11,7,5,8,12,14,10,18,4,16,2,6] },
  { id: 'brollsta', name: 'Brollsta', pars: [4,4,4,5,4,3,4,3,5,5,3,4,3,4,4,5,4,4], indexes: [16,4,6,12,18,8,2,14,10,11,15,9,7,3,1,17,13,5] },
  { id: 'international', name: 'International', pars: [4,5,3,4,5,3,4,4,4,4,4,3,4,5,5,4,3,4], indexes: [11,7,9,1,13,3,5,17,15,2,6,18,12,16,8,4,10,14] },
  { id: 'lovsattrra', name: 'Lovsattrra', pars: [4,4,4,5,3,4,3,4,3,4,3,4,4,4,3,5,3,4], indexes: [17,5,11,9,15,7,1,13,3,4,10,16,2,8,18,12,6,14] },
  { id: 'riksten', name: 'Riksten', pars: [5,4,3,4,5,4,4,3,4,4,4,5,3,4,5,3,4,4], indexes: [7,9,17,3,1,13,5,15,11,12,2,6,18,14,4,16,8,10] }
];

const defaultCourseMetadata = {
  'bro-hof-stadium': { country: 'Sweden', region: 'Stockholm County', club: 'Bro Hof Slott GC', course: 'Stadium Course', source: 'preset' },
  'bro-hof-castle': { country: 'Sweden', region: 'Stockholm County', club: 'Bro Hof Slott GC', course: 'Castle Course', source: 'preset' },
  'kungsangen-kings': { country: 'Sweden', region: 'Stockholm County', club: 'Kungsangen GC', course: 'Kings Course', source: 'preset' },
  'kungsangen-queens': { country: 'Sweden', region: 'Stockholm County', club: 'Kungsangen GC', course: 'Queens Course', source: 'preset' },
  'waxholm': { country: 'Sweden', region: 'Stockholm County', club: 'Waxholm Golf Club', course: 'Main Course', source: 'preset' },
  'lindo-dal': { country: 'Sweden', region: 'Stockholm County', club: 'Lindo Golf Club', course: 'Dal Course', source: 'preset' },
  'kyssinge': { country: 'Sweden', region: 'Stockholm County', club: 'Kyssinge Golf Club', course: 'Main Course', source: 'preset' },
  'bodaholm': { country: 'Sweden', region: 'Stockholm County', club: 'Bodaholm Golf Club', course: 'Main Course', source: 'preset' },
  'brollsta': { country: 'Sweden', region: 'Stockholm County', club: 'Brollsta Golf Club', course: 'Main Course', source: 'preset' },
  'international': { country: 'Sweden', region: 'Stockholm County', club: 'International Golf Club', course: 'Main Course', source: 'preset' },
  'lovsattrra': { country: 'Sweden', region: 'Stockholm County', club: 'Lovsattrra Golf Club', course: 'Main Course', source: 'preset' },
  'riksten': { country: 'Sweden', region: 'Stockholm County', club: 'Riksten Golf Club', course: 'Main Course', source: 'preset' }
};

let activeGameId = '';
let isEditing = false;
let editingGameInfoId = '';
let editingCourseId = '';
let autoSyncTimer = null;
let dialogResolver = null;
let activeScoreTarget = null;
let courseSearchMode = 'shared';
const clientId = getClientId();
let state = {
  courseId: defaultCourses[0].id,
  players: ['Player 1', 'Player 2', 'Player 3', 'Player 4'],
  handicaps: [0, 0, 0, 0],
  scoreMode: 'gross',
  underParFlip: true,
  scores: emptyScores()
};

let customCourses = [];
let savedRounds = [];
let deletedRoundKeys = [];
let syncState = {
  ready: false,
  busy: false,
  ok: false,
  label: t('Cloud sync Not ok'),
  title: t('Supabase is not connected.')
};

const els = {
  scoreStrip: document.querySelector('#scoreStrip'),
  syncBar: document.querySelector('#syncBar'),
  languageButton: document.querySelector('#languageButton'),
  shareButton: document.querySelector('#shareButton'),
  courseSelect: document.querySelector('#courseSelect'),
  birdieFlip: document.querySelector('#birdieFlip'),
  scoreMode: document.querySelector('#scoreMode'),
  players: [
    document.querySelector('#playerA1'),
    document.querySelector('#playerA2'),
    document.querySelector('#playerB1'),
    document.querySelector('#playerB2')
  ],
  scoreRows: document.querySelector('#scoreRows'),
  teamAPlayers: document.querySelector('#teamAPlayers'),
  teamBPlayers: document.querySelector('#teamBPlayers'),
  teamATotal: document.querySelector('#teamATotal'),
  teamBTotal: document.querySelector('#teamBTotal'),
  holesComplete: document.querySelector('#holesComplete'),
  coursePar: document.querySelector('#coursePar'),
  totalPar: document.querySelector('#totalPar'),
  playerTotals: [
    document.querySelector('#totalPlayerA1'),
    document.querySelector('#totalPlayerA2'),
    document.querySelector('#totalPlayerB1'),
    document.querySelector('#totalPlayerB2')
  ],
  tableTeamATotal: document.querySelector('#tableTeamATotal'),
  tableTeamBTotal: document.querySelector('#tableTeamBTotal'),
  editGame: document.querySelector('#editGame'),
  courseList: document.querySelector('#courseList'),
  addCourse: document.querySelector('#addCourse'),
  courseModal: document.querySelector('#courseModal'),
  courseForm: document.querySelector('#courseForm'),
  courseSearchModal: document.querySelector('#courseSearchModal'),
  courseSearchForm: document.querySelector('#courseSearchForm'),
  courseSearchModes: Array.from(document.querySelectorAll('[data-course-search-mode]')),
  courseSearchCountry: document.querySelector('#courseSearchCountry'),
  courseSearchRegion: document.querySelector('#courseSearchRegion'),
  courseSearchInput: document.querySelector('#courseSearchInput'),
  courseSearchSubmit: document.querySelector('#courseSearchSubmit'),
  courseSearchStatus: document.querySelector('#courseSearchStatus'),
  courseSearchResults: document.querySelector('#courseSearchResults'),
  cancelCourseSearch: document.querySelector('#cancelCourseSearch'),
  cancelCourseSearchBottom: document.querySelector('#cancelCourseSearchBottom'),
  newCourseName: document.querySelector('#newCourseName'),
  newCourseCode: document.querySelector('#newCourseCode'),
  courseModalEyebrow: document.querySelector('#courseModalEyebrow'),
  courseIndexWarning: document.querySelector('#courseIndexWarning'),
  saveCourseButton: document.querySelector('#saveCourseButton'),
  cancelCourse: document.querySelector('#cancelCourse'),
  cancelCourseBottom: document.querySelector('#cancelCourseBottom'),
  frontNineList: document.querySelector('#frontNineList'),
  backNineList: document.querySelector('#backNineList'),
  frontNineTotal: document.querySelector('#frontNineTotal'),
  backNineTotal: document.querySelector('#backNineTotal'),
  courseParTotal: document.querySelector('#courseParTotal'),
  newGame: document.querySelector('#newGame'),
  gameModal: document.querySelector('#gameModal'),
  gameForm: document.querySelector('#gameForm'),
  cancelGame: document.querySelector('#cancelGame'),
  cancelGameBottom: document.querySelector('#cancelGameBottom'),
  newPlayerA1: document.querySelector('#newPlayerA1'),
  newPlayerA2: document.querySelector('#newPlayerA2'),
  newPlayerB1: document.querySelector('#newPlayerB1'),
  newPlayerB2: document.querySelector('#newPlayerB2'),
  newHandicapA1: document.querySelector('#newHandicapA1'),
  newHandicapA2: document.querySelector('#newHandicapA2'),
  newHandicapB1: document.querySelector('#newHandicapB1'),
  newHandicapB2: document.querySelector('#newHandicapB2'),
  newGameCourse: document.querySelector('#newGameCourse'),
  newGameCode: document.querySelector('#newGameCode'),
  newGameTeeTime: document.querySelector('#newGameTeeTime'),
  newGameBirdieFlip: document.querySelector('#newGameBirdieFlip'),
  newGameScoreMode: document.querySelector('#newGameScoreMode'),
  searchCourse: document.querySelector('#searchCourse'),
  playingList: document.querySelector('#playingList'),
  historyList: document.querySelector('#historyList'),
  syncStatus: document.querySelector('#syncStatus'),
  appDialog: document.querySelector('#appDialog'),
  dialogForm: document.querySelector('#dialogForm'),
  dialogEyebrow: document.querySelector('#dialogEyebrow'),
  dialogTitle: document.querySelector('#dialogTitle'),
  dialogMessage: document.querySelector('#dialogMessage'),
  dialogInputWrap: document.querySelector('#dialogInputWrap'),
  dialogInputLabel: document.querySelector('#dialogInputLabel'),
  dialogInput: document.querySelector('#dialogInput'),
  dialogOk: document.querySelector('#dialogOk'),
  dialogCancel: document.querySelector('#dialogCancel'),
  scorePad: document.querySelector('#scorePad'),
  scorePadHole: document.querySelector('#scorePadHole'),
  scorePadPlayer: document.querySelector('#scorePadPlayer'),
  scorePadClose: document.querySelector('#scorePadClose'),
  scorePadMinus: document.querySelector('#scorePadMinus'),
  scorePadPlus: document.querySelector('#scorePadPlus'),
  scorePadInput: document.querySelector('#scorePadInput')
};

function emptyScores() {
  return Array.from({ length: 18 }, () => ['', '', '', '']);
}

function getClientId() {
  const existing = localStorage.getItem(CLIENT_KEY);
  if (existing) return existing;
  const value = `client-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
  localStorage.setItem(CLIENT_KEY, value);
  return value;
}

function normalizeScores(scores) {
  const rows = Array.isArray(scores) ? scores : [];
  return Array.from({ length: 18 }, (_, rowIndex) => {
    const row = Array.isArray(rows[rowIndex]) ? rows[rowIndex] : [];
    return Array.from({ length: 4 }, (_, scoreIndex) => row[scoreIndex] ?? '');
  });
}

function normalizeHandicaps(values) {
  const source = Array.isArray(values) ? values : [];
  return Array.from({ length: 4 }, (_, index) => {
    const value = Number(source[index] ?? 0);
    return Number.isFinite(value) ? Math.max(0, Math.min(54, Math.round(value))) : 0;
  });
}

function normalizeCourseIndexes(indexes) {
  const source = Array.isArray(indexes) ? indexes : [];
  const values = Array.from({ length: 18 }, (_, index) => {
    const value = Number(source[index] ?? index + 1);
    return Number.isInteger(value) && value >= 1 && value <= 18 ? value : index + 1;
  });
  const seen = new Set();
  if (values.every(value => !seen.has(value) && seen.add(value))) return values;
  return Array.from({ length: 18 }, (_, index) => index + 1);
}

function normalizeCourse(course) {
  const metadata = defaultCourseMetadata[course?.id] || {};
  const pars = Array.isArray(course?.pars) && course.pars.length === 18
    ? course.pars.map(par => Number(par) || 4)
    : Array.from({ length: 18 }, () => 4);
  return {
    ...course,
    pars,
    indexes: normalizeCourseIndexes(course?.indexes),
    editCode: String(course?.editCode || ''),
    country: String(course?.country || metadata.country || ''),
    region: String(course?.region || metadata.region || ''),
    club: String(course?.club || metadata.club || ''),
    course: String(course?.course || metadata.course || ''),
    source: String(course?.source || metadata.source || '')
  };
}

function allCourses() {
  const courses = new Map();
  [...defaultCourses, ...customCourses].map(normalizeCourse).forEach(course => {
    courses.set(course.id, { ...(courses.get(course.id) || {}), ...course });
  });
  return Array.from(courses.values());
}

function currentCourse() {
  return allCourses().find(course => course.id === state.courseId) || allCourses()[0];
}

function currentGame() {
  return savedRounds.find(round => round.id === activeGameId) || null;
}

function loadJson(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...state, activeGameId }));
}

function saveCoursesLocal() {
  localStorage.setItem(COURSE_KEY, JSON.stringify(customCourses));
}

function saveHistoryLocal() {
  localStorage.setItem(HISTORY_KEY, JSON.stringify(savedRounds.slice(0, GAME_LIMIT)));
}

function saveDeletedRoundKeys() {
  localStorage.setItem(DELETE_KEY, JSON.stringify(deletedRoundKeys.slice(-GAME_LIMIT)));
}

function slugify(value) {
  return value.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || `course-${Date.now()}`;
}

function safeFilePart(value) {
  return String(value || '')
    .trim()
    .replace(/\s+/g, ' ')
    .replace(/[<>:"/\\|?*]+/g, '')
    .replace(/\.+$/g, '')
    .slice(0, 160);
}

function roundDisplayName(course = currentCourse(), players = state.players) {
  return `${course.name}_Team A(${players[0]}+ ${players[1]}) vs. Team B(${players[2]}+${players[3]})`;
}

function roundFileName(course = currentCourse(), players = state.players) {
  return `${safeFilePart(roundDisplayName(course, players))}.json`;
}

function applySignedClass(element, value) {
  element.classList.toggle('point-positive', Number(value) > 0);
  element.classList.toggle('point-negative', Number(value) < 0);
}

function gameStatus(round) {
  return round?.totals?.status === 'playing' ? 'playing' : 'history';
}

function gameCode(round) {
  return String(round?.totals?.editCode || '').trim();
}

function roundDeleteKey(round) {
  if (!round) return '';
  return [round.id || '', round.savedAt || '', round.name || ''].join('|');
}

function parseRoundDeleteKey(key) {
  const [id = '', savedAt = '', ...nameParts] = String(key || '').split('|');
  return {
    id,
    savedAt: Number(savedAt || 0),
    name: nameParts.join('|')
  };
}

function markRoundDeleted(round) {
  const key = roundDeleteKey(round);
  if (!key || deletedRoundKeys.includes(key)) return;
  deletedRoundKeys = [...deletedRoundKeys, key].slice(-GAME_LIMIT);
  saveDeletedRoundKeys();
}

function isRoundDeleted(round) {
  return deletedRoundKeys.includes(roundDeleteKey(round));
}

function editLock(round) {
  const lock = round?.totals?.editLock;
  return lock && typeof lock === 'object' ? lock : null;
}

function editLockOwner(round) {
  return String(editLock(round)?.owner || '');
}

function hasCurrentEditLock(round = currentGame()) {
  const lock = editLock(round);
  return Boolean(lock && lock.owner === clientId && Number(lock.expiresAt || 0) > Date.now());
}

function withCurrentEditLock(round) {
  const normalized = normalizeRound(round);
  const now = Date.now();
  normalized.totals.editLock = {
    owner: clientId,
    updatedAt: now,
    expiresAt: now + EDIT_LOCK_TTL_MS
  };
  return normalized;
}

function normalizeRound(round) {
  const savedAt = Number(round.savedAt || Date.now());
  const baseTotals = round.totals && typeof round.totals === 'object' ? round.totals : {};
  const players = Array.isArray(round.players) && round.players.length === 4
    ? round.players
    : ['Player 1', 'Player 2', 'Player 3', 'Player 4'];
  const handicaps = normalizeHandicaps(round.handicaps || baseTotals.handicaps);
  const courseId = round.courseId || defaultCourses[0].id;
  const course = allCourses().find(item => item.id === courseId) || defaultCourses[0];
  const courseName = round.courseName || course.name || 'Unknown Course';
  const name = round.name || roundDisplayName({ name: courseName }, players);
  const scoreMode = round.scoreMode === 'net' || baseTotals.scoreMode === 'net' ? 'net' : 'gross';
  const underParFlip = 'underParFlip' in round ? Boolean(round.underParFlip) : Boolean(round.birdieFlip);
  return {
    id: round.id || `round-${savedAt}`,
    savedAt,
    name,
    fileName: round.fileName || `${safeFilePart(name)}.json`,
    courseId,
    courseName,
    pars: Array.isArray(round.pars) && round.pars.length === 18 ? round.pars : course.pars,
    indexes: normalizeCourseIndexes(round.indexes || course.indexes),
    players,
    handicaps,
    scoreMode,
    underParFlip,
    birdieFlip: underParFlip,
    scores: normalizeScores(round.scores),
    totals: {
      a: Number(baseTotals.a || 0),
      b: Number(baseTotals.b || 0),
      complete: Number(baseTotals.complete || 0),
      players: Array.isArray(baseTotals.players) ? baseTotals.players : [0, 0, 0, 0],
      playersGross: Array.isArray(baseTotals.playersGross) ? baseTotals.playersGross : null,
      playersNet: Array.isArray(baseTotals.playersNet) ? baseTotals.playersNet : null,
      status: baseTotals.status === 'playing' ? 'playing' : 'history',
      editCode: String(baseTotals.editCode || ''),
      teeTime: String(baseTotals.teeTime || ''),
      handicaps,
      scoreMode,
      editLock: baseTotals.editLock && typeof baseTotals.editLock === 'object' ? baseTotals.editLock : null
    }
  };
}

function supabaseConfig() {
  const raw = window.VEGAS_SUPABASE || {};
  return {
    url: String(raw.url || '').trim().replace(/\/+$/, ''),
    anonKey: String(raw.anonKey || '').trim(),
    syncKey: String(raw.syncKey || 'default').trim() || 'default'
  };
}

function hasSupabaseConfig() {
  const config = supabaseConfig();
  return Boolean(
    config.url &&
    config.anonKey &&
    config.url.includes('.supabase.co') &&
    !config.anonKey.includes('PASTE')
  );
}

function cloudId(type, id) {
  return `${supabaseConfig().syncKey}:${type}:${id}`;
}

function cloudRowLocalId(row, type = 'round') {
  return String(row.id || '').split(`:${type}:`).pop();
}

async function supabaseRequest(table, query = '', options = {}) {
  const config = supabaseConfig();
  const url = `${config.url}/rest/v1/${table}${query ? `?${query}` : ''}`;
  const headers = {
    apikey: config.anonKey,
    Authorization: `Bearer ${config.anonKey}`,
    'Content-Type': 'application/json',
    Prefer: options.prefer || 'return=representation'
  };
  const response = await fetch(url, {
    method: options.method || 'GET',
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || response.statusText);
  }

  if (response.status === 204) return null;
  const text = await response.text();
  return text ? JSON.parse(text) : null;
}

function courseToCloudRow(course) {
  return {
    id: cloudId('course', course.id),
    sync_key: supabaseConfig().syncKey,
    course_id: course.id,
    name: course.name,
    pars: {
      values: course.pars,
      indexes: normalizeCourseIndexes(course.indexes),
      editCode: String(course.editCode || ''),
      country: String(course.country || ''),
      region: String(course.region || ''),
      club: String(course.club || ''),
      course: String(course.course || ''),
      source: String(course.source || '')
    }
  };
}

function golfCourseApiConfig() {
  const raw = window.VEGAS_SUPABASE?.golfCourseApi || {};
  return {
    proxyUrl: String(raw.proxyUrl || '').trim().replace(/\/+$/, ''),
    baseUrl: String(raw.baseUrl || 'https://api.golfcourseapi.com/v1').trim().replace(/\/+$/, ''),
    searchPath: String(raw.searchPath || '/search').trim() || '/search',
    coursePathTemplate: String(raw.coursePathTemplate || '/courses/{id}').trim() || '/courses/{id}',
    apiKey: String(raw.apiKey || '').trim()
  };
}

function hasGolfCourseApiConfig() {
  const config = golfCourseApiConfig();
  return Boolean(config.proxyUrl || (config.baseUrl && config.apiKey && !config.apiKey.includes('PASTE')));
}

async function golfCourseApiRequest(path, params = {}) {
  const config = golfCourseApiConfig();
  const query = new URLSearchParams(params);
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  const queryText = query.toString();
  const proxyQuery = new URLSearchParams({ path: cleanPath });
  Object.entries(params).forEach(([key, value]) => proxyQuery.set(key, value));
  const url = config.proxyUrl
    ? `${config.proxyUrl}?${proxyQuery.toString()}`
    : `${config.baseUrl}${cleanPath}${queryText ? `?${queryText}` : ''}`;
  const supabase = supabaseConfig();
  const headers = config.proxyUrl
    ? {
      apikey: supabase.anonKey,
      Authorization: `Bearer ${supabase.anonKey}`
    }
    : { Authorization: `Key ${config.apiKey}` };
  const response = await fetch(url, { headers });
  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || response.statusText);
  }
  return response.json();
}

function cloudRowToCourse(row) {
  const storedPars = row.pars;
  return {
    id: row.course_id,
    name: row.name,
    pars: Array.isArray(storedPars) ? storedPars : (Array.isArray(storedPars?.values) ? storedPars.values : []),
    indexes: Array.isArray(storedPars?.indexes) ? storedPars.indexes : undefined,
    editCode: Array.isArray(storedPars) ? '' : String(storedPars?.editCode || ''),
    country: Array.isArray(storedPars) ? '' : String(storedPars?.country || ''),
    region: Array.isArray(storedPars) ? '' : String(storedPars?.region || ''),
    club: Array.isArray(storedPars) ? '' : String(storedPars?.club || ''),
    course: Array.isArray(storedPars) ? '' : String(storedPars?.course || ''),
    source: Array.isArray(storedPars) ? '' : String(storedPars?.source || '')
  };
}

function roundToCloudRow(round) {
  const normalized = normalizeRound(round);
  return {
    id: cloudId('round', normalized.id),
    sync_key: supabaseConfig().syncKey,
    saved_at: normalized.savedAt,
    name: normalized.name,
    file_name: normalized.fileName,
    course_id: normalized.courseId,
    course_name: normalized.courseName,
    pars: {
      values: normalized.pars,
      indexes: normalized.indexes
    },
    players: normalized.players,
    birdie_flip: normalized.birdieFlip,
    scores: normalized.scores,
    totals: normalized.totals
  };
}

function deleteInfoToCloudRow(info) {
  const deletedAt = Date.now();
  const savedAt = Number(info.savedAt || deletedAt);
  const name = String(info.name || 'Deleted game');
  return {
    id: cloudId('round-delete', `${info.id || 'round'}-${savedAt}`),
    sync_key: supabaseConfig().syncKey,
    saved_at: deletedAt,
    name: `Deleted ${name}`,
    file_name: '',
    course_id: defaultCourses[0].id,
    course_name: 'Deleted',
    pars: {
      values: defaultCourses[0].pars,
      indexes: normalizeCourseIndexes()
    },
    players: ['Deleted', 'Deleted', 'Deleted', 'Deleted'],
    birdie_flip: true,
    scores: emptyScores(),
    totals: {
      status: 'history',
      deleted: true,
      deletedAt,
      deletedRoundId: String(info.id || ''),
      deletedSavedAt: savedAt,
      deletedName: name
    }
  };
}

function deleteMarkerToCloudRow(round) {
  const normalized = normalizeRound(round);
  return deleteInfoToCloudRow({
    id: normalized.id,
    savedAt: normalized.savedAt,
    name: normalized.name
  });
}

function isDeleteMarkerRow(row) {
  return Boolean(row?.totals?.deleted);
}

function rowDeleteInfo(row) {
  const totals = row?.totals || {};
  return {
    id: String(totals.deletedRoundId || ''),
    savedAt: Number(totals.deletedSavedAt || 0),
    name: String(totals.deletedName || '')
  };
}

function rowMatchesDeleteInfo(row, deleted) {
  if (!deleted) return false;
  const localId = cloudRowLocalId(row);
  const savedAt = Number(row.saved_at || 0);
  return Boolean(
    (deleted.id && localId === deleted.id) ||
    (deleted.savedAt && savedAt === deleted.savedAt) ||
    (deleted.savedAt && deleted.name && savedAt === deleted.savedAt && row.name === deleted.name)
  );
}

function cloudRowToRound(row) {
  return normalizeRound({
    id: cloudRowLocalId(row),
    savedAt: Number(row.saved_at),
    name: row.name,
    fileName: row.file_name,
    courseId: row.course_id,
    courseName: row.course_name,
    pars: Array.isArray(row.pars) ? row.pars : row.pars?.values,
    indexes: Array.isArray(row.pars?.indexes) ? row.pars.indexes : undefined,
    players: row.players,
    birdieFlip: row.birdie_flip,
    scores: row.scores,
    totals: row.totals
  });
}

function mergeById(localItems, remoteItems) {
  const merged = new Map();
  localItems.forEach(item => merged.set(item.id, item));
  remoteItems.forEach(item => merged.set(item.id, item));
  return Array.from(merged.values());
}

function userEditableCourses() {
  return customCourses.map(normalizeCourse).filter(course => course.source !== 'shared');
}

function mergeRounds(localRounds, remoteRounds) {
  const remoteVisible = remoteRounds.map(normalizeRound).filter(round => !isRoundDeleted(round));
  return mergeById(localRounds.map(normalizeRound), remoteVisible)
    .sort((a, b) => Number(b.savedAt || 0) - Number(a.savedAt || 0))
    .slice(0, GAME_LIMIT);
}

function serverRounds(remoteRounds) {
  return remoteRounds
    .map(normalizeRound)
    .filter(round => !isRoundDeleted(round))
    .sort((a, b) => Number(b.savedAt || 0) - Number(a.savedAt || 0))
    .slice(0, GAME_LIMIT);
}

function setSyncState(next) {
  syncState = { ...syncState, ...next };
  renderSyncStatus();
}

function renderSyncStatus() {
  if (!els.syncStatus || !els.editGame) return;
  els.syncStatus.textContent = syncState.busy ? t('Syncing...') : syncState.label;
  els.syncStatus.title = syncState.title;
  els.syncStatus.classList.toggle('sync-ok', Boolean(syncState.ok) && !syncState.busy);
  els.syncStatus.classList.toggle('sync-bad', !syncState.ok && !syncState.busy);
  els.editGame.textContent = isEditing ? t('Finish') : t('Edit');
  els.editGame.disabled = !currentGame();
}

async function fetchCloudCourses() {
  const query = `select=*&sync_key=eq.${encodeURIComponent(supabaseConfig().syncKey)}&order=name.asc`;
  const rows = await supabaseRequest('vegas_courses', query);
  return rows.map(cloudRowToCourse).filter(course => course.pars.length === 18);
}

async function fetchCloudRounds() {
  const query = `select=*&sync_key=eq.${encodeURIComponent(supabaseConfig().syncKey)}&order=saved_at.desc&limit=${CLOUD_ROUND_LIMIT}`;
  const rows = await supabaseRequest('vegas_rounds', query);
  const deleteMarkers = rows.filter(isDeleteMarkerRow).map(rowDeleteInfo);
  rows
    .filter(isDeleteMarkerRow)
    .map(rowDeleteInfo)
    .forEach(info => {
      if (info.id || info.savedAt || info.name) {
        markRoundDeleted({ id: info.id, savedAt: info.savedAt, name: info.name });
      }
    });
  return rows
    .filter(row => !isDeleteMarkerRow(row))
    .filter(row => !deleteMarkers.some(deleted => rowMatchesDeleteInfo(row, deleted)))
    .map(cloudRowToRound);
}

async function fetchCloudRoundById(roundId) {
  if (!hasSupabaseConfig() || !roundId) return null;
  const query = `select=*&id=eq.${encodeURIComponent(cloudId('round', roundId))}&limit=1`;
  const rows = await supabaseRequest('vegas_rounds', query);
  return rows.length ? cloudRowToRound(rows[0]) : null;
}

async function upsertCloudCourse(course) {
  if (!hasSupabaseConfig()) return;
  await supabaseRequest('vegas_courses', 'on_conflict=id', {
    method: 'POST',
    body: courseToCloudRow(course),
    prefer: 'resolution=merge-duplicates,return=minimal'
  });
}

async function upsertCloudRound(round) {
  if (!hasSupabaseConfig()) return;
  await supabaseRequest('vegas_rounds', 'on_conflict=id', {
    method: 'POST',
    body: roundToCloudRow(round),
    prefer: 'resolution=merge-duplicates,return=minimal'
  });
}

async function upsertCloudDeleteMarker(round) {
  if (!hasSupabaseConfig()) return;
  await supabaseRequest('vegas_rounds', 'on_conflict=id', {
    method: 'POST',
    body: deleteMarkerToCloudRow(round),
    prefer: 'resolution=merge-duplicates,return=minimal'
  });
}

async function uploadLocalDeleteMarkers() {
  if (!hasSupabaseConfig() || !deletedRoundKeys.length) return;
  await Promise.all(
    deletedRoundKeys
      .map(parseRoundDeleteKey)
      .filter(info => info.id || info.savedAt || info.name)
      .map(info => supabaseRequest('vegas_rounds', 'on_conflict=id', {
        method: 'POST',
        body: deleteInfoToCloudRow(info),
        prefer: 'resolution=merge-duplicates,return=minimal'
      }))
  );
}

async function deleteCloudCourse(courseId) {
  if (!hasSupabaseConfig()) return;
  await supabaseRequest('vegas_courses', `id=eq.${encodeURIComponent(cloudId('course', courseId))}`, {
    method: 'DELETE',
    prefer: 'return=minimal'
  });
}

async function deleteCloudRound(roundOrId) {
  if (!hasSupabaseConfig()) return;
  const round = typeof roundOrId === 'string' ? { id: roundOrId } : normalizeRound(roundOrId);
  await upsertCloudDeleteMarker(round);
  const byId = await supabaseRequest('vegas_rounds', `id=eq.${encodeURIComponent(cloudId('round', round.id))}`, {
    method: 'DELETE',
    prefer: 'return=representation'
  });
  if (Array.isArray(byId) && byId.length) return byId.length;
  if (!round.savedAt || !round.name) return 0;
  const byRoundFields = await supabaseRequest(
    'vegas_rounds',
    `sync_key=eq.${encodeURIComponent(supabaseConfig().syncKey)}&saved_at=eq.${encodeURIComponent(round.savedAt)}&name=eq.${encodeURIComponent(round.name)}`,
    {
      method: 'DELETE',
      prefer: 'return=representation'
    }
  );
  if (Array.isArray(byRoundFields) && byRoundFields.length) return byRoundFields.length;
  const bySavedAt = await supabaseRequest(
    'vegas_rounds',
    `sync_key=eq.${encodeURIComponent(supabaseConfig().syncKey)}&saved_at=eq.${encodeURIComponent(round.savedAt)}`,
    {
      method: 'DELETE',
      prefer: 'return=representation'
    }
  );
  return Array.isArray(bySavedAt) ? bySavedAt.length : 0;
}

function chooseInitialGame() {
  if (activeGameId && savedRounds.some(round => round.id === activeGameId)) return;
  const playing = savedRounds.find(round => gameStatus(round) === 'playing');
  activeGameId = (playing || savedRounds[0] || {}).id || '';
  if (activeGameId) loadGame(activeGameId, false, false);
}

async function syncFromCloud(pushLocal = true, quiet = false) {
  if (!hasSupabaseConfig()) {
    setSyncState({
      ready: false,
      busy: false,
      ok: false,
      label: t('Cloud sync Not ok'),
      title: t('Add your Supabase URL and anon key to supabase-config.js.')
    });
    return;
  }

  if (!quiet) {
    setSyncState({
      ready: true,
      busy: true,
      title: t('Sending and loading scorecard data.')
    });
  }

  try {
    await uploadLocalDeleteMarkers();
    if (pushLocal) await Promise.all(userEditableCourses().map(upsertCloudCourse));

    const [cloudCourses, cloudRounds] = await Promise.all([
      fetchCloudCourses(),
      fetchCloudRounds()
    ]);

    customCourses = mergeById(customCourses, cloudCourses);
    savedRounds = serverRounds(cloudRounds);
    if (activeGameId && !isEditing && savedRounds.some(round => round.id === activeGameId)) {
      applyGameToState(savedRounds.find(round => round.id === activeGameId));
      saveState();
    } else {
      chooseInitialGame();
    }
    saveCoursesLocal();
    saveHistoryLocal();
    setSyncState({
      ready: true,
      busy: false,
      ok: true,
      label: t('Cloud sync ok'),
      title: `Supabase room: ${supabaseConfig().syncKey}`
    });
    render();
  } catch (error) {
    setSyncState({
      ready: true,
      busy: false,
      ok: false,
      label: t('Cloud sync Not ok'),
      title: error.message
    });
  }
}

function scheduleAutoSync(round) {
  if (!round) return;
  window.clearTimeout(autoSyncTimer);
  if (!hasSupabaseConfig()) {
    setSyncState({ ok: false, busy: false, label: t('Cloud sync Not ok'), title: t('Supabase is not configured.') });
    return;
  }
  setSyncState({ ready: true, busy: true, title: t('Saving scorecard changes.') });
  autoSyncTimer = window.setTimeout(async () => {
    try {
      if (isEditing && round.id === activeGameId) {
        const stillMine = await ensureEditLockStillMine();
        if (!stillMine) return;
        round = replaceRound(withCurrentEditLock(roundFromState(currentGame())));
      }
      await upsertCloudRound(round);
      setSyncState({
        ready: true,
        busy: false,
        ok: true,
        label: t('Cloud sync ok'),
        title: `Saved ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
      });
    } catch (error) {
      setSyncState({
        ready: true,
        busy: false,
        ok: false,
        label: t('Cloud sync Not ok'),
        title: error.message
      });
    }
  }, 650);
}

function courseParInputs() {
  return Array.from(document.querySelectorAll('.course-par-input'));
}

function courseIndexInputs() {
  return Array.from(document.querySelectorAll('.course-index-input'));
}

function updateCourseFormTotals() {
  const values = courseParInputs().map(input => Number(input.value) || 0);
  const front = values.slice(0, 9).reduce((sum, par) => sum + par, 0);
  const back = values.slice(9, 18).reduce((sum, par) => sum + par, 0);
  els.frontNineTotal.textContent = front;
  els.backNineTotal.textContent = back;
  els.courseParTotal.textContent = front + back;
}

function renderCourseParInputs(pars = currentCourse().pars, indexes = currentCourse().indexes) {
  els.frontNineList.innerHTML = '';
  els.backNineList.innerHTML = '';
  const indexOptions = Array.from({ length: 18 }, (_, optionIndex) => {
    const value = optionIndex + 1;
    return `<option value="${value}">${value}</option>`;
  }).join('');

  Array.from({ length: 18 }, (_, index) => {
    const row = document.createElement('label');
    row.className = 'par-row';
    const parOptions = Array.from({ length: 10 }, (_, optionIndex) => {
      const value = optionIndex + 1;
      return `<option value="${value}">${value}</option>`;
    }).join('');
    row.innerHTML = `
      <span class="hole-label">${t('Hole {hole}', { hole: index + 1 })}</span>
      <span class="field-label">PAR</span>
      <span class="field-label">${t('Difficulty')}</span>
      <select class="course-par-input" required aria-label="${t('Hole {hole}', { hole: index + 1 })} ${t('Par')}">${parOptions}</select>
      <select class="course-index-input" required aria-label="${t('Hole {hole}', { hole: index + 1 })} ${t('Index')}">${indexOptions}</select>
    `;
    const [parInput, indexInput] = row.querySelectorAll('select');
    parInput.value = pars[index] || 4;
    indexInput.value = String(indexes[index] || 9);
    parInput.addEventListener('input', updateCourseFormTotals);
    parInput.addEventListener('change', updateCourseFormTotals);
    indexInput.addEventListener('change', updateCourseIndexValidation);
    if (index < 9) {
      els.frontNineList.append(row);
    } else {
      els.backNineList.append(row);
    }
  });

  updateCourseFormTotals();
  updateCourseIndexValidation();
}

function updateCourseIndexValidation() {
  const inputs = courseIndexInputs();
  const counts = inputs.reduce((map, input) => {
    const value = Number(input.value);
    if (Number.isInteger(value)) map.set(value, (map.get(value) || 0) + 1);
    return map;
  }, new Map());
  const hasDuplicate = inputs.some(input => counts.get(Number(input.value)) > 1);
  inputs.forEach(input => {
    input.classList.toggle('duplicate-index', counts.get(Number(input.value)) > 1);
  });
  if (els.courseIndexWarning) {
    els.courseIndexWarning.hidden = !hasDuplicate;
    els.courseIndexWarning.textContent = t('Difficulty values cannot repeat.');
  }
  if (els.saveCourseButton) {
    els.saveCourseButton.disabled = hasDuplicate;
  }
  return !hasDuplicate;
}

function renderNewGameCourses() {
  els.newGameCourse.innerHTML = '';
  allCourses().forEach(course => {
    const option = document.createElement('option');
    option.value = course.id;
    option.textContent = course.name;
    els.newGameCourse.append(option);
  });
  els.newGameCourse.value = state.courseId;
}

function renderCourseSearchCountries() {
  const countryOptions = [`<option value="">${t('All countries')}</option>`]
    .concat(COURSE_SEARCH_AREAS.map(area => `<option value="${area.country}">${area.country}</option>`));
  els.courseSearchCountry.innerHTML = countryOptions.join('');
  els.courseSearchCountry.value = '';
  renderCourseSearchRegions();
}

function renderCourseSearchRegions() {
  const area = COURSE_SEARCH_AREAS.find(item => item.country === els.courseSearchCountry.value);
  const options = [`<option value="">${t('All regions')}</option>`]
    .concat(area ? area.regions.map(region => `<option value="${region}">${region}</option>`) : []);
  els.courseSearchRegion.innerHTML = options.join('');
}

function setCourseSearchMode(mode) {
  courseSearchMode = mode;
  els.courseSearchModes.forEach(button => {
    button.classList.toggle('active', button.dataset.courseSearchMode === mode);
  });
  const isManual = mode === 'manual';
  els.courseSearchSubmit.textContent = t(isManual ? 'Add manually' : 'Search');
  els.courseSearchStatus.textContent = t(mode === 'api'
    ? 'Search courses in North America, then add one to your courses.'
    : (isManual ? 'Enter a course name to add it manually.' : 'Search shared courses first.'));
  els.courseSearchResults.innerHTML = '';
}

function openCourseModal(prefillName = '') {
  els.courseForm.reset();
  editingCourseId = '';
  renderCourseParInputs(Array.from({ length: 18 }, () => 4), Array.from({ length: 18 }, (_, index) => index + 1));
  els.courseModalEyebrow.textContent = t('New Course');
  document.querySelector('#courseModal h2').textContent = t('Add Course');
  els.courseForm.querySelector('button[type="submit"]').textContent = t('Save Course');
  els.newCourseCode.disabled = false;
  if (prefillName) els.newCourseName.value = prefillName;
  els.courseModal.hidden = false;
  (prefillName ? els.newCourseCode : els.newCourseName).focus();
}

function openCourseSearchModal() {
  els.courseSearchForm.reset();
  renderCourseSearchCountries();
  setCourseSearchMode('shared');
  els.courseSearchResults.innerHTML = '';
  els.courseSearchSubmit.disabled = false;
  els.courseSearchModal.hidden = false;
  els.courseSearchInput.focus();
}

function closeCourseSearchModal() {
  els.courseSearchModal.hidden = true;
  els.courseSearchForm.reset();
  els.courseSearchResults.innerHTML = '';
}

function courseSearchName(result) {
  if (result?.pars && result?.name) return result.name;
  const club = String(result?.club_name || result?.clubName || '').trim();
  const course = String(result?.course_name || result?.courseName || result?.name || '').trim();
  if (club && course && club !== course) return `${club} - ${course}`;
  return course || club || String(result?.display_name || '').split(',')[0] || t('Course');
}

function courseSearchClubName(result) {
  return String(result?.club_name || result?.clubName || result?.club || courseSearchName(result)).trim();
}

function courseSearchCourseName(result) {
  return String(result?.course_name || result?.courseName || result?.course || result?.name || courseSearchName(result)).trim();
}

function courseSearchAddress(result) {
  const address = result?.location || result?.address || {};
  return [
    address.city || address.town || address.village || address.municipality || address.county,
    address.state || address.region || address.province,
    address.country || result?.country
  ].filter(Boolean).join(', ') || String(result?.display_name || '');
}

function courseSearchId(result) {
  return result?.id || result?.course_id || result?.courseId;
}

function isAppCourseResult(result) {
  return Array.isArray(result?.pars) && Array.isArray(result?.indexes);
}

function textMatches(value, query) {
  return String(value || '').toLowerCase().includes(String(query || '').trim().toLowerCase());
}

function courseMatchesArea(result, country, region) {
  const address = result?.location || result?.address || {};
  const countryText = String(address.country || result?.country || '').toLowerCase();
  const regionText = String(address.state || address.region || address.province || address.city || address.county || result?.region || '').toLowerCase();
  const expectedCountry = String(country || '').trim().toLowerCase();
  const expectedRegion = String(region || '').trim().toLowerCase();
  return (!expectedCountry || countryText.includes(expectedCountry)) && (!expectedRegion || regionText.includes(expectedRegion));
}

function sharedCourseSearchText(course) {
  return [course.name, course.country, course.region, course.club, course.course].filter(Boolean).join(' ');
}

function searchSharedCourses({ courseName, country, region }) {
  const query = String(courseName || '').trim().toLowerCase();
  const results = allCourses()
    .filter(course => !query || textMatches(sharedCourseSearchText(course), query))
    .filter(course => courseMatchesArea(course, country, region))
    .sort((a, b) => a.name.localeCompare(b.name))
    .slice(0, 40);
  return { results, filterFallback: false };
}

async function searchGolfCourses({ courseName, country, region }) {
  if (!hasGolfCourseApiConfig()) throw new Error('GolfCourseAPI key is missing');
  const config = golfCourseApiConfig();
  const name = String(courseName || '').trim();
  const resultLimit = country || region ? 20 : 30;
  const searches = name
    ? [name, `${name} golf`, `${name} golf course`]
    : ['golf'];
  const queries = [...new Set(searches.length ? searches : ['golf'])];
  const unique = new Map();
  for (const searchQuery of queries) {
    const data = await golfCourseApiRequest(config.searchPath, { search_query: searchQuery });
    const rows = Array.isArray(data) ? data : (Array.isArray(data?.courses) ? data.courses : []);
    rows.forEach(row => {
      const key = String(courseSearchId(row) || courseSearchName(row));
      if (!unique.has(key)) unique.set(key, row);
    });
    if (unique.size >= resultLimit || (unique.size && name)) break;
  }
  const results = Array.from(unique.values());
  const filtered = (country || region) ? results.filter(row => courseMatchesArea(row, country, region)) : results;
  return {
    results: filtered.slice(0, resultLimit),
    filterFallback: false
  };
}

async function fetchGolfCourseDetail(result) {
  const id = courseSearchId(result);
  if (!id) return result;
  const config = golfCourseApiConfig();
  const path = config.coursePathTemplate.replace('{id}', encodeURIComponent(id));
  try {
    return await golfCourseApiRequest(path);
  } catch {
    return result;
  }
}

function numberFrom(value) {
  const number = Number(value);
  return Number.isInteger(number) ? number : null;
}

function readHolePar(hole) {
  return numberFrom(hole?.par ?? hole?.Par ?? hole?.hole_par);
}

function readHoleIndex(hole) {
  return numberFrom(hole?.handicap ?? hole?.hcp ?? hole?.index ?? hole?.stroke_index ?? hole?.strokeIndex ?? hole?.handicap_index ?? hole?.handicapIndex ?? hole?.hole_handicap);
}

function holeNumber(hole, fallback) {
  return numberFrom(hole?.hole ?? hole?.hole_number ?? hole?.number ?? hole?.Hole) || fallback;
}

function findScorecardHoles(value, depth = 0) {
  if (!value || depth > 6) return null;
  if (Array.isArray(value)) {
    const holeRows = value.filter(item => item && typeof item === 'object' && readHolePar(item));
    if (holeRows.length >= 18) return holeRows.slice(0, 18);
    for (const item of value) {
      const found = findScorecardHoles(item, depth + 1);
      if (found) return found;
    }
    return null;
  }
  if (typeof value === 'object') {
    const preferredKeys = ['holes', 'scorecard', 'tee_boxes', 'teeBoxes', 'tees', 'male', 'female'];
    for (const key of preferredKeys) {
      const found = findScorecardHoles(value[key], depth + 1);
      if (found) return found;
    }
    for (const item of Object.values(value)) {
      const found = findScorecardHoles(item, depth + 1);
      if (found) return found;
    }
  }
  return null;
}

function findPreferredTee(course) {
  const root = course?.course || course;
  const tees = root?.tees || {};
  const candidates = []
    .concat(Array.isArray(tees.male) ? tees.male : [])
    .concat(Array.isArray(tees.female) ? tees.female : [])
    .concat(Array.isArray(root?.tee_boxes) ? root.tee_boxes : [])
    .concat(Array.isArray(root?.teeBoxes) ? root.teeBoxes : []);
  return candidates.find(tee => Array.isArray(tee?.holes) && tee.holes.length >= 18);
}

function scorecardFromApiCourse(course) {
  const preferredTee = findPreferredTee(course);
  const holes = preferredTee?.holes || findScorecardHoles(course);
  if (!holes) return null;
  const ordered = holes
    .map((hole, index) => ({ hole, number: holeNumber(hole, index + 1) }))
    .sort((a, b) => a.number - b.number)
    .slice(0, 18)
    .map(item => item.hole);
  const pars = ordered.map(readHolePar);
  const indexes = ordered.map(readHoleIndex);
  if (pars.length !== 18 || pars.some(par => !Number.isInteger(par) || par < 1 || par > 10)) return null;
  if (indexes.length !== 18 || indexes.some(index => !Number.isInteger(index) || index < 1 || index > 18)) {
    return { pars, indexes: Array.from({ length: 18 }, (_, index) => index + 1) };
  }
  return { pars, indexes };
}

function useSharedCourse(course) {
  state.courseId = course.id;
  saveState();
  closeCourseSearchModal();
  render();
  switchView('courses');
}

function renderCourseSearchResults(results, mode = courseSearchMode) {
  els.courseSearchResults.innerHTML = '';
  if (!results.length) {
    const empty = document.createElement('div');
    empty.className = 'empty-state';
    empty.innerHTML = `
      <p></p>
      <button type="button"></button>
    `;
    empty.querySelector('p').textContent = t(mode === 'shared'
      ? 'No shared courses found.'
      : 'No courses found in GolfCourseAPI. You can add it manually.');
    const addManual = empty.querySelector('button');
    addManual.textContent = t('Add manually');
    addManual.addEventListener('click', () => {
      const name = els.courseSearchInput.value.trim();
      closeCourseSearchModal();
      openCourseModal(name);
    });
    els.courseSearchResults.append(empty);
    return;
  }
  let currentClub = '';
  results.forEach(result => {
    const clubName = courseSearchClubName(result);
    if (clubName !== currentClub) {
      currentClub = clubName;
      const heading = document.createElement('div');
      heading.className = 'search-group-title';
      heading.textContent = clubName;
      els.courseSearchResults.append(heading);
    }
    const row = document.createElement('div');
    row.className = 'search-result';
    row.innerHTML = `
      <div>
        <strong></strong>
        <span></span>
      </div>
      <button type="button"></button>
    `;
    const name = courseSearchName(result);
    const courseName = courseSearchCourseName(result);
    const address = courseSearchAddress(result);
    row.querySelector('strong').textContent = courseName;
    row.querySelector('span').textContent = address ? `${clubName} | ${address}` : clubName;
    const button = row.querySelector('button');
    button.textContent = t(mode === 'shared' || isAppCourseResult(result) ? 'Use' : 'Add');
    button.addEventListener('click', async () => {
      if (mode === 'shared' || isAppCourseResult(result)) {
        useSharedCourse(normalizeCourse(result));
        return;
      }
      button.disabled = true;
      els.courseSearchStatus.textContent = t('Loading course scorecard...');
      const detail = await fetchGolfCourseDetail(result);
      const scorecard = scorecardFromApiCourse(detail);
      if (!scorecard) {
        button.disabled = false;
        els.courseSearchStatus.textContent = t('Could not read PAR and INDEX from this course.');
        return;
      }
      closeCourseSearchModal();
      openCourseModalFromApi(name, scorecard.pars, scorecard.indexes);
    });
    els.courseSearchResults.append(row);
  });
}

function openCourseModalFromApi(name, pars, indexes) {
  openCourseModal(name);
  renderCourseParInputs(pars, indexes);
}

function openEditCourseModal(course) {
  const normalized = normalizeCourse(course);
  editingCourseId = normalized.id;
  els.courseForm.reset();
  els.newCourseName.value = normalized.name;
  els.newCourseCode.value = normalized.editCode || '';
  els.newCourseCode.disabled = true;
  renderCourseParInputs(normalized.pars, normalized.indexes);
  els.courseModalEyebrow.textContent = t('Edit Course');
  document.querySelector('#courseModal h2').textContent = t('Edit Course');
  els.courseForm.querySelector('button[type="submit"]').textContent = t('Save Changes');
  els.courseModal.hidden = false;
  els.newCourseName.focus();
}

function closeCourseModal() {
  els.courseModal.hidden = true;
  els.courseForm.reset();
  editingCourseId = '';
  els.newCourseCode.disabled = false;
  if (els.courseIndexWarning) els.courseIndexWarning.hidden = true;
  if (els.saveCourseButton) els.saveCourseButton.disabled = false;
}

function openGameModal() {
  els.gameForm.reset();
  editingGameInfoId = '';
  renderNewGameCourses();
  els.newGameBirdieFlip.checked = true;
  els.newGameScoreMode.value = 'gross';
  els.newGameTeeTime.value = dateTimeInputValue(new Date());
  els.newPlayerA1.value = 'Player 1';
  els.newPlayerA2.value = 'Player 2';
  els.newPlayerB1.value = 'Player 3';
  els.newPlayerB2.value = 'Player 4';
  [els.newHandicapA1, els.newHandicapA2, els.newHandicapB1, els.newHandicapB2].forEach(input => {
    input.value = '0';
  });
  els.newGameCode.disabled = false;
  document.querySelector('#gameModal h2').textContent = t('New Game');
  els.gameForm.querySelector('button[type="submit"]').textContent = t('Start Game');
  els.gameModal.hidden = false;
  els.newPlayerA1.focus();
}

function openEditGameInfoModal(round) {
  const normalized = normalizeRound(round);
  editingGameInfoId = normalized.id;
  els.gameForm.reset();
  renderNewGameCourses();
  els.newGameCourse.value = normalized.courseId;
  els.newGameBirdieFlip.checked = normalized.underParFlip;
  els.newGameScoreMode.value = normalized.scoreMode;
  els.newGameTeeTime.value = normalized.totals.teeTime || dateTimeInputValue(new Date(normalized.savedAt));
  els.newPlayerA1.value = normalized.players[0];
  els.newPlayerA2.value = normalized.players[1];
  els.newPlayerB1.value = normalized.players[2];
  els.newPlayerB2.value = normalized.players[3];
  [els.newHandicapA1, els.newHandicapA2, els.newHandicapB1, els.newHandicapB2].forEach((input, index) => {
    input.value = normalized.handicaps[index] || 0;
  });
  els.newGameCode.value = normalized.totals.editCode || '';
  els.newGameCode.disabled = true;
  document.querySelector('#gameModal h2').textContent = t('Edit Info');
  els.gameForm.querySelector('button[type="submit"]').textContent = t('Save Changes');
  els.gameModal.hidden = false;
  els.newPlayerA1.focus();
}

function closeGameModal() {
  els.gameModal.hidden = true;
  els.gameForm.reset();
  editingGameInfoId = '';
  els.newGameCode.disabled = false;
}

function readCourseFormPars() {
  return courseParInputs().map(input => Number(input.value));
}

function readCourseFormIndexes() {
  return courseIndexInputs().map(input => Number(input.value));
}

function indexesAreValid(indexes) {
  const seen = new Set();
  return indexes.length === 18 && indexes.every(value => {
    const valid = Number.isInteger(value) && value >= 1 && value <= 18 && !seen.has(value);
    seen.add(value);
    return valid;
  });
}

function parseScore(value) {
  const score = Number(value);
  return Number.isInteger(score) && score > 0 ? score : null;
}

function clampScore(value) {
  const score = Number(value);
  if (!Number.isFinite(score)) return '';
  return String(Math.max(1, Math.min(20, Math.round(score))));
}

function scoreTargetLabel(target) {
  if (!target) return '';
  return `${state.players[target.scoreIndex] || `Player ${target.scoreIndex + 1}`}`;
}

function updateScorePad() {
  if (!activeScoreTarget || !els.scorePad) return;
  const { holeIndex, scoreIndex } = activeScoreTarget;
  const par = currentCourse().pars[holeIndex] || 4;
  const value = state.scores[holeIndex][scoreIndex] || '';
  els.scorePadHole.textContent = t('Hole {hole} - Par {par}', { hole: holeIndex + 1, par });
  els.scorePadPlayer.textContent = scoreTargetLabel(activeScoreTarget);
  els.scorePadInput.textContent = value || '--';
  document.querySelectorAll('.score-quick button').forEach(button => {
    const quickScore = String(par + Number(button.dataset.scoreOffset || 0));
    button.classList.toggle('active', value === quickScore);
  });
}

function commitScorePadValue(value) {
  if (!activeScoreTarget) return;
  const score = clampScore(value);
  const { holeIndex, scoreIndex } = activeScoreTarget;
  state.scores[holeIndex][scoreIndex] = score;
  persistActiveGame(true);
  renderScoreStrip();
  renderStart();
  renderHoles();
  updateScorePad();
}

function advanceScoreTargetOrClose() {
  if (!activeScoreTarget) return;
  if (activeScoreTarget.scoreIndex >= 3) {
    closeScorePad();
    return;
  }
  activeScoreTarget = {
    ...activeScoreTarget,
    scoreIndex: activeScoreTarget.scoreIndex + 1
  };
  updateScorePad();
}

function commitScorePadValueAndAdvance(value) {
  commitScorePadValue(value);
  advanceScoreTargetOrClose();
}

function openScorePad(holeIndex, scoreIndex) {
  if (!isEditing || !els.scorePad) return;
  activeScoreTarget = { holeIndex, scoreIndex };
  els.scorePad.hidden = false;
  updateScorePad();
}

function closeScorePad() {
  if (!els.scorePad) return;
  els.scorePad.hidden = true;
  activeScoreTarget = null;
}

function teamNumber(scores, par, shouldFlip) {
  const low = Math.min(...scores);
  const high = Math.max(...scores);
  const flipped = Boolean(shouldFlip);
  return {
    value: flipped ? high * 10 + low : low * 10 + high,
    flipped
  };
}

function handicapStrokes(handicap, holeIndexValue) {
  const value = Math.max(0, Math.round(Number(handicap) || 0));
  const index = Math.max(1, Math.min(18, Math.round(Number(holeIndexValue) || 18)));
  const base = Math.floor(value / 18);
  const extra = value % 18;
  return base + (index <= extra ? 1 : 0);
}

function holeGrossAndNet(scores, holeIndex) {
  const course = currentCourse();
  const indexValue = course.indexes[holeIndex] || holeIndex + 1;
  const gross = scores.map(parseScore);
  const net = gross.map((score, scoreIndex) => {
    if (score === null) return null;
    return Math.max(1, score - handicapStrokes(state.handicaps?.[scoreIndex], indexValue));
  });
  return { gross, net, indexValue };
}

function scoreHole(scores, par, holeIndex) {
  const { gross, net } = holeGrossAndNet(scores, holeIndex);
  if (gross.some(value => value === null)) return null;

  const activeValues = state.scoreMode === 'net' ? net : gross;
  const teamA = [activeValues[0], activeValues[1]];
  const teamB = [activeValues[2], activeValues[3]];
  const grossTeamA = [gross[0], gross[1]];
  const grossTeamB = [gross[2], gross[3]];
  const aUnderPar = Math.min(...grossTeamA) < par;
  const bUnderPar = Math.min(...grossTeamB) < par;
  const flipA = state.underParFlip && bUnderPar && !aUnderPar;
  const flipB = state.underParFlip && aUnderPar && !bUnderPar;
  const aNumber = teamNumber(teamA, par, flipA);
  const bNumber = teamNumber(teamB, par, flipB);
  const delta = bNumber.value - aNumber.value;

  return {
    aNumber,
    bNumber,
    delta,
    gross,
    net,
    aUnderPar,
    bUnderPar
  };
}

function totals() {
  const course = currentCourse();
  return state.scores.reduce((sum, scores, index) => {
    const { gross, net } = holeGrossAndNet(scores, index);
    scores.forEach((score, scoreIndex) => {
      sum.playersGross[scoreIndex] += gross[scoreIndex] || 0;
      sum.playersNet[scoreIndex] += net[scoreIndex] || 0;
    });
    sum.players = state.scoreMode === 'net' ? sum.playersNet : sum.playersGross;
    const result = scoreHole(scores, course.pars[index], index);
    if (!result) return sum;
    sum.a += result.delta;
    sum.b -= result.delta;
    sum.complete += 1;
    return sum;
  }, { a: 0, b: 0, complete: 0, players: [0, 0, 0, 0], playersGross: [0, 0, 0, 0], playersNet: [0, 0, 0, 0] });
}

function roundFromState(existing = {}, statusOverride = null) {
  const course = currentCourse();
  const previousTotals = existing.totals || {};
  const scoreTotals = totals();
  const status = statusOverride || previousTotals.status || 'playing';
  const editCode = previousTotals.editCode || '';
  const teeTime = previousTotals.teeTime || '';
  const lock = previousTotals.editLock || null;
  const name = roundDisplayName(course);
  return normalizeRound({
    ...existing,
    id: existing.id || `round-${Date.now()}`,
    savedAt: existing.savedAt || Date.now(),
    name,
    fileName: roundFileName(course),
    courseId: course.id,
    courseName: course.name,
    pars: course.pars,
    indexes: course.indexes,
    players: [...state.players],
    handicaps: normalizeHandicaps(state.handicaps),
    scoreMode: state.scoreMode === 'net' ? 'net' : 'gross',
    underParFlip: state.underParFlip,
    birdieFlip: state.underParFlip,
    scores: state.scores.map(row => [...row]),
    totals: {
      ...scoreTotals,
      status,
      editCode,
      teeTime,
      handicaps: normalizeHandicaps(state.handicaps),
      scoreMode: state.scoreMode === 'net' ? 'net' : 'gross',
      editLock: lock
    }
  });
}

function replaceRound(round) {
  const normalized = normalizeRound(round);
  const index = savedRounds.findIndex(item => item.id === normalized.id);
  if (index >= 0) {
    savedRounds[index] = normalized;
  } else {
    savedRounds.unshift(normalized);
  }
  savedRounds = mergeRounds(savedRounds, []);
  saveHistoryLocal();
  return normalized;
}

async function acquireEditLock(round) {
  const latest = await fetchCloudRoundById(round.id).catch(() => null);
  const base = latest || round;
  const locked = replaceRound(withCurrentEditLock(base));
  activeGameId = locked.id;
  applyGameToState(locked);
  saveState();
  await upsertCloudRound(locked);
  setSyncState({
    ready: true,
    busy: false,
    ok: true,
    label: t('Cloud sync ok'),
    title: t('Edit lock acquired.')
  });
  return locked;
}

async function ensureEditLockStillMine() {
  if (!isEditing || !activeGameId) return true;
  const latest = await fetchCloudRoundById(activeGameId).catch(() => null);
  if (!latest) return true;
  const owner = editLockOwner(latest);
  if (owner && owner !== clientId) {
    replaceRound(latest);
    applyGameToState(latest);
    isEditing = false;
    saveState();
    render();
    setSyncState({
      ready: true,
      busy: false,
      ok: true,
      label: t('Cloud sync ok'),
      title: t('Another phone is now editing this game.')
    });
    return false;
  }
  const refreshed = replaceRound(withCurrentEditLock(roundFromState(latest)));
  await upsertCloudRound(refreshed);
  setSyncState({
    ready: true,
    busy: false,
    ok: true,
    label: t('Cloud sync ok'),
    title: t('Edit lock refreshed.')
  });
  return true;
}

function ensureCourseFromRound(round) {
  if (allCourses().some(course => course.id === round.courseId)) return;
  if (!Array.isArray(round.pars) || round.pars.length !== 18) return;
  customCourses.push({
    id: round.courseId,
    name: round.courseName,
    pars: round.pars,
    indexes: round.indexes
  });
  saveCoursesLocal();
}

function applyGameToState(round) {
  ensureCourseFromRound(round);
  state = {
    courseId: round.courseId,
    players: [...round.players],
    handicaps: normalizeHandicaps(round.handicaps),
    scoreMode: round.scoreMode === 'net' ? 'net' : 'gross',
    underParFlip: round.underParFlip,
    birdieFlip: round.underParFlip,
    scores: normalizeScores(round.scores)
  };
}

function loadGame(gameId, editable = false, goToPlay = true) {
  const round = savedRounds.find(item => item.id === gameId);
  if (!round) return;
  activeGameId = round.id;
  isEditing = editable;
  applyGameToState(round);
  saveState();
  render();
  if (goToPlay) switchView('play');
}

function persistActiveGame(shouldSync = true) {
  const existing = currentGame();
  if (!existing) return null;
  const round = replaceRound(roundFromState(existing));
  saveState();
  if (shouldSync) scheduleAutoSync(round);
  return round;
}

function openAppDialog({
  eyebrow = t('Action'),
  title = t('Confirm'),
  message = '',
  input = false,
  inputLabel = t('Code'),
  inputMode = 'text',
  maxLength = '',
  pattern = '',
  okText = 'OK',
  cancelText = t('Cancel')
}) {
  return new Promise(resolve => {
    dialogResolver = resolve;
    els.dialogEyebrow.textContent = eyebrow;
    els.dialogTitle.textContent = title;
    els.dialogMessage.textContent = message;
    els.dialogOk.textContent = okText;
    els.dialogCancel.textContent = cancelText;
    els.dialogInputWrap.hidden = !input;
    els.dialogInputLabel.textContent = inputLabel;
    els.dialogInput.value = '';
    els.dialogInput.inputMode = inputMode;
    els.dialogInput.maxLength = maxLength;
    els.dialogInput.pattern = pattern;
    els.appDialog.hidden = false;
    if (input) els.dialogInput.focus();
    else els.dialogOk.focus();
  });
}

function closeAppDialog(value) {
  els.appDialog.hidden = true;
  els.dialogInput.setCustomValidity('');
  const resolver = dialogResolver;
  dialogResolver = null;
  if (resolver) resolver(value);
}

async function showMessage(title, message) {
  await openAppDialog({
    eyebrow: t('Notice'),
    title,
    message,
    okText: t('OK'),
    cancelText: t('Close')
  });
}

async function confirmDialog(title, message) {
  return openAppDialog({
    eyebrow: t('Confirm'),
    title,
    message,
    okText: t('Yes'),
    cancelText: t('No')
  });
}

async function confirmCodeDialog(title, message, errorMessage = '') {
  return openAppDialog({
    eyebrow: t('Edit Code'),
    title,
    message: errorMessage || message,
    input: true,
    inputLabel: t('Code'),
    inputMode: 'numeric',
    maxLength: '2',
    pattern: '[0-9]{2}',
    okText: t('Yes'),
    cancelText: t('No')
  });
}

async function askCodeDialog(errorMessage = '') {
  return openAppDialog({
    eyebrow: t('Edit Code'),
    title: t("what's the code?"),
    message: errorMessage || t('Enter the 2 digit edit code for this game.'),
    input: true,
    inputLabel: t('Code'),
    inputMode: 'numeric',
    maxLength: '2',
    pattern: '[0-9]{2}',
    okText: t('OK'),
    cancelText: t('Cancel')
  });
}

async function verifyCodeForRound(round) {
  const code = gameCode(round);
  if (!round) return false;
  let errorMessage = '';
  while (true) {
    const answer = await askCodeDialog(errorMessage);
    if (answer === false) return false;
    if (codeMatchesRound(round, answer)) return true;
    errorMessage = t('The edit code is not correct. Try again.');
  }
}

function codeMatchesRound(round, value) {
  const code = gameCode(round);
  return value === '59' || (/^\d{2}$/.test(code) && value === code);
}

async function confirmActionWithCode(round, title, message) {
  let errorMessage = '';
  while (true) {
    const answer = await confirmCodeDialog(title, message, errorMessage);
    if (answer === false) return false;
    if (codeMatchesRound(round, answer)) return true;
    errorMessage = t('The edit code is not correct. Try again.');
  }
}

async function confirmEditWithCode(round) {
  return confirmActionWithCode(round, t('Edit game'), t('Enter code, then choose Yes to edit this game.'));
}

async function confirmFinishWithCode(round) {
  return confirmActionWithCode(round, t('Finish game'), t('Enter code, then choose Yes to finish this game.'));
}

async function confirmDeleteWithCode(round) {
  return confirmActionWithCode(round, t('Delete game'), t('Enter code, then choose Yes to delete this finished game.'));
}

async function confirmSaveGameInfoWithCode(round) {
  return confirmActionWithCode(round, t('Save game changes'), t('Enter code, then choose Yes to save these changes.'));
}

async function confirmCourseActionWithCode(course, title, message) {
  let errorMessage = '';
  while (true) {
    const answer = await confirmCodeDialog(
      title,
      message,
      errorMessage
    );
    if (answer === false) return false;
    if (answer === '59' || (/^\d{2}$/.test(course.editCode || '') && answer === course.editCode)) return true;
    errorMessage = t('The edit code is not correct. Try again.');
  }
}

function confirmDeleteCourseWithCode(course) {
  return confirmCourseActionWithCode(course, t('Delete course'), t('Enter the course edit code, then choose Yes to delete this course.'));
}

function confirmEditCourseWithCode(course) {
  return confirmCourseActionWithCode(course, t('Edit Course'), t('Enter the course edit code, then choose Yes to edit this course.'));
}

async function verifyActiveCode() {
  return verifyCodeForRound(currentGame());
}

async function deleteHistoryGame(round) {
  if (!(await confirmDeleteWithCode(round))) return;
  setSyncState({
    ready: true,
    busy: true,
    title: t('Deleting game from cloud.')
  });
  try {
    await deleteCloudRound(round);
  } catch (error) {
    setSyncState({
      ready: true,
      busy: false,
      ok: false,
      label: t('Cloud sync Not ok'),
      title: error.message
    });
    await showMessage(t('Delete failed'), t('Could not delete this game from the cloud. Try again.'));
    return;
  }
  markRoundDeleted(round);
  savedRounds = savedRounds.filter(item => item.id !== round.id);
  if (activeGameId === round.id) {
    activeGameId = '';
    chooseInitialGame();
  }
  saveHistoryLocal();
  saveState();
  render();
  setSyncState({
    ready: true,
    busy: false,
    ok: true,
    label: t('Cloud sync ok'),
    title: t('Deleted from cloud.')
  });
}

function renderCourseSelect() {
  const selected = state.courseId;
  els.courseSelect.innerHTML = '';
  allCourses().forEach(course => {
    const option = document.createElement('option');
    option.value = course.id;
    option.textContent = course.name;
    els.courseSelect.append(option);
  });
  els.courseSelect.value = allCourses().some(course => course.id === selected) ? selected : defaultCourses[0].id;
  state.courseId = els.courseSelect.value;
}

function renderInputs() {
  els.courseSelect.value = state.courseId;
  els.courseSelect.disabled = true;
  els.birdieFlip.checked = state.underParFlip;
  els.birdieFlip.disabled = true;
  els.scoreMode.value = state.scoreMode === 'net' ? 'net' : 'gross';
  els.players.forEach((input, index) => {
    input.value = state.players[index];
    input.readOnly = true;
  });
}

function renderScoreStrip() {
  const course = currentCourse();
  const game = currentGame();
  const total = totals();
  const parTotal = course.pars.reduce((a, b) => a + b, 0);
  els.teamAPlayers.textContent = `${state.players[0]} + ${state.players[1]}`;
  els.teamBPlayers.textContent = `${state.players[2]} + ${state.players[3]}`;
  els.teamATotal.textContent = total.a;
  els.teamBTotal.textContent = total.b;
  applySignedClass(els.teamATotal, total.a);
  applySignedClass(els.teamBTotal, total.b);
  els.holesComplete.textContent = `${total.complete}/18`;
  els.coursePar.textContent = formatTeeTime(game?.totals?.teeTime, game?.savedAt);
  els.totalPar.textContent = parTotal;
  els.playerTotals.forEach((cell, index) => {
    cell.textContent = state.scoreMode === 'net'
      ? `${total.playersGross[index]}/${total.playersNet[index]}`
      : total.playersGross[index];
  });
  els.tableTeamATotal.textContent = total.a;
  els.tableTeamBTotal.textContent = total.b;
  applySignedClass(els.tableTeamATotal, total.a);
  applySignedClass(els.tableTeamBTotal, total.b);
}

function renderHoles() {
  const course = currentCourse();
  els.scoreRows.innerHTML = '';

  state.scores.forEach((scores, index) => {
    const row = document.createElement('tr');
    const result = scoreHole(scores, course.pars[index], index);
    const holeValues = holeGrossAndNet(scores, index);
    row.innerHTML = `
      <td>${index + 1}/${course.indexes[index] || index + 1}</td>
      <td>${course.pars[index]}</td>
      <td class="team-a-score"><button class="score score-0" type="button" aria-label="${t('Hole {hole} {player} score', { hole: index + 1, player: state.players[0] })}"></button></td>
      <td class="team-a-score"><button class="score score-1" type="button" aria-label="${t('Hole {hole} {player} score', { hole: index + 1, player: state.players[1] })}"></button></td>
      <td class="team-a-score vegas-number"></td>
      <td class="team-a-score hole-points"></td>
      <td class="team-b-score"><button class="score score-2" type="button" aria-label="${t('Hole {hole} {player} score', { hole: index + 1, player: state.players[2] })}"></button></td>
      <td class="team-b-score"><button class="score score-3" type="button" aria-label="${t('Hole {hole} {player} score', { hole: index + 1, player: state.players[3] })}"></button></td>
      <td class="team-b-score vegas-number"></td>
      <td class="team-b-score hole-points"></td>
    `;

    [0, 1, 2, 3].forEach(scoreIndex => {
      const input = row.querySelector(`.score-${scoreIndex}`);
      const grossValue = scores[scoreIndex] || '';
      const netValue = holeValues.net[scoreIndex];
      input.innerHTML = grossValue
        ? `<span>${grossValue}</span>${state.scoreMode === 'net' && netValue ? `<small>${t('Net')} ${netValue}</small>` : ''}`
        : '<span>--</span>';
      input.disabled = !isEditing;
      input.addEventListener('pointerdown', event => {
        if (!isEditing) return;
        event.preventDefault();
      });
      input.addEventListener('click', event => {
        if (!isEditing) return;
        event.preventDefault();
        openScorePad(index, scoreIndex);
      });
      input.closest('td').addEventListener('click', event => {
        if (!isEditing) return;
        event.preventDefault();
        openScorePad(index, scoreIndex);
      });
    });

    if (result) {
      const aPointCell = row.children[5];
      const bPointCell = row.children[9];
      row.children[4].textContent = `${result.aNumber.value}${result.aNumber.flipped ? '*' : ''}`;
      row.children[8].textContent = `${result.bNumber.value}${result.bNumber.flipped ? '*' : ''}`;
      aPointCell.textContent = result.delta;
      bPointCell.textContent = -result.delta;
      applySignedClass(aPointCell, result.delta);
      applySignedClass(bPointCell, -result.delta);
    } else {
      row.children[4].textContent = '--';
      row.children[5].textContent = '0';
      row.children[8].textContent = '--';
      row.children[9].textContent = '0';
    }

    els.scoreRows.append(row);
  });
}

function renderCourses() {
  els.courseList.innerHTML = '';
  allCourses().forEach(course => {
    const row = document.createElement('div');
    row.className = 'course-row';
    const isShared = course.source === 'shared';
    const isCustom = customCourses.some(item => item.id === course.id && normalizeCourse(item).source !== 'shared');
    row.innerHTML = `
      <div>
        <strong></strong>
        <span></span>
      </div>
      <div class="small-actions"></div>
    `;
    row.querySelector('strong').textContent = course.name;
    row.querySelector('span').textContent = t('Par {par} - {type}', {
      par: course.pars.reduce((a, b) => a + b, 0),
      type: t(isShared ? 'Shared' : (isCustom ? 'Custom' : 'Preset'))
    });

    if (isCustom) {
      const editButton = document.createElement('button');
      editButton.type = 'button';
      editButton.textContent = t('Edit');
      editButton.addEventListener('click', async () => {
        if (!(await confirmEditCourseWithCode(course))) return;
        openEditCourseModal(course);
      });
      const deleteButton = document.createElement('button');
      deleteButton.type = 'button';
      deleteButton.className = 'danger';
      deleteButton.textContent = t('Delete');
      deleteButton.addEventListener('click', async () => {
        if (!(await confirmDeleteCourseWithCode(course))) return;
        customCourses = customCourses.filter(item => item.id !== course.id);
        saveCoursesLocal();
        if (state.courseId === course.id) state.courseId = defaultCourses[0].id;
        saveState();
        render();
        try {
          await deleteCloudCourse(course.id);
          await syncFromCloud(false);
        } catch (error) {
          setSyncState({ ok: false, busy: false, label: t('Cloud sync Not ok'), title: error.message });
        }
      });
      row.querySelector('.small-actions').append(editButton, deleteButton);
    }

    els.courseList.append(row);
  });
}

function dateTimeInputValue(date) {
  const pad = value => String(value).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function formatTeeTime(value, fallback = Date.now()) {
  const raw = String(value || '');
  if (/^\d{2}-\d{2}-\d{2} \d{2}:\d{2}$/.test(raw)) return raw;
  const match = raw.match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/);
  if (match) return `${match[1].slice(2)}-${match[2]}-${match[3]} ${match[4]}:${match[5]}`;
  const date = new Date(fallback);
  return dateTimeInputValue(date).slice(2).replace('T', ' ');
}

function roundListDate(round) {
  return formatTeeTime(round.totals?.teeTime, round.savedAt);
}

function roundTeamsLine(round) {
  const players = Array.isArray(round.players) ? round.players : [];
  const [a1 = 'Player 1', a2 = 'Player 2', b1 = 'Player 3', b2 = 'Player 4'] = players;
  return t('Team A ({a1}+{a2}) vs. Team B ({b1}+{b2})', { a1, a2, b1, b2 });
}

function renderGameList(container, rounds, emptyText, status) {
  container.innerHTML = '';
  if (!rounds.length) {
    const empty = document.createElement('div');
    empty.className = 'empty-state';
    empty.textContent = emptyText;
    container.append(empty);
    return;
  }

  rounds.forEach(round => {
    const row = document.createElement('div');
    row.className = 'history-row game-row';
    row.classList.toggle('playing-game-row', status === 'playing');
    row.classList.toggle('history-game-row', status === 'history');
    row.classList.toggle('active-game', round.id === activeGameId);
    row.innerHTML = `
      <button class="game-open" type="button">
        <span class="playing-icon" aria-hidden="true"></span>
        <span class="game-copy">
          <span class="game-line game-main"></span>
          <span class="game-line game-teams"></span>
          <span class="game-line game-score"></span>
        </span>
      </button>
      <div class="small-actions"></div>
    `;
    const total = round.totals || {};
    row.querySelector('.playing-icon').hidden = status !== 'playing';
    row.querySelector('.game-main').textContent = `${round.courseName || t('Course')} | ${roundListDate(round)}`;
    row.querySelector('.game-teams').textContent = roundTeamsLine(round);
    row.querySelector('.game-score').textContent = t('Total score: A {a}, B {b}', { a: Number(total.a || 0), b: Number(total.b || 0) });
    row.querySelector('.game-open').addEventListener('click', () => loadGame(round.id, false, true));
    if (status === 'playing') {
      const editInfoButton = document.createElement('button');
      editInfoButton.type = 'button';
      editInfoButton.className = 'danger';
      editInfoButton.textContent = t('Modify');
      editInfoButton.addEventListener('click', async event => {
        event.stopPropagation();
        if (!(await verifyCodeForRound(round))) return;
        openEditGameInfoModal(round);
      });
      row.querySelector('.small-actions').append(editInfoButton);
    }
    if (status === 'history') {
      const deleteButton = document.createElement('button');
      deleteButton.type = 'button';
      deleteButton.className = 'danger';
      deleteButton.textContent = t('Delete');
      deleteButton.addEventListener('click', event => {
        event.stopPropagation();
        deleteHistoryGame(round);
      });
      row.querySelector('.small-actions').append(deleteButton);
    }
    container.append(row);
  });
}

function renderStart() {
  const playing = savedRounds.filter(round => gameStatus(round) === 'playing');
  const history = savedRounds.filter(round => gameStatus(round) !== 'playing');
  renderGameList(els.playingList, playing, t('No games currently playing'), 'playing');
  renderGameList(els.historyList, history, t('No finished games'), 'history');
}

function render() {
  if (!isEditing) closeScorePad();
  renderCourseSelect();
  renderInputs();
  renderScoreStrip();
  renderHoles();
  renderCourses();
  renderStart();
  renderSyncStatus();
}

function switchView(name) {
  document.querySelectorAll('.tab').forEach(tab => {
    tab.classList.toggle('active', tab.dataset.view === name);
  });
  document.querySelectorAll('.view').forEach(view => {
    view.classList.toggle('active', view.id === `${name}View`);
  });
  if (els.scoreStrip) {
    els.scoreStrip.hidden = name !== 'play';
  }
  if (els.syncBar) {
    els.syncBar.hidden = name !== 'play';
  }
}

function addListeners() {
  document.querySelectorAll('.tab').forEach(tab => {
    tab.addEventListener('click', () => switchView(tab.dataset.view));
  });

  els.editGame.addEventListener('click', async () => {
    if (!currentGame()) return;
    if (!isEditing) {
      if (!(await confirmEditWithCode(currentGame()))) return;
      await acquireEditLock(currentGame());
      isEditing = true;
      render();
      return;
    }

    if (!(await confirmFinishWithCode(currentGame()))) return;
    const finished = replaceRound(roundFromState(currentGame(), 'history'));
    finished.totals.editLock = null;
    saveHistoryLocal();
    isEditing = false;
    scheduleAutoSync(finished);
    render();
    switchView('start');
  });

  els.shareButton.addEventListener('click', async () => {
    const shareData = {
      title: t('Vegas Golf Scorecard'),
      text: t('Vegas Golf Scorecard'),
      url: window.location.href.split('?')[0]
    };
    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else if (navigator.clipboard) {
        await navigator.clipboard.writeText(shareData.url);
        await showMessage(t('Link copied'), t('The app link was copied to the clipboard.'));
      } else {
        await showMessage(t('Share app'), shareData.url);
      }
    } catch {}
  });

  els.dialogForm.addEventListener('submit', event => {
    event.preventDefault();
    if (!els.dialogInputWrap.hidden) {
      const value = els.dialogInput.value.trim();
      if (els.dialogInput.pattern && !new RegExp(`^${els.dialogInput.pattern}$`).test(value)) {
        els.dialogInput.setCustomValidity(t('Enter a valid value.'));
        els.dialogInput.reportValidity();
        els.dialogInput.setCustomValidity('');
        return;
      }
      closeAppDialog(value);
      return;
    }
    closeAppDialog(true);
  });

  els.dialogCancel.addEventListener('click', () => closeAppDialog(false));

  els.appDialog.addEventListener('click', event => {
    if (event.target === els.appDialog) closeAppDialog(false);
  });

  els.scorePadClose.addEventListener('click', closeScorePad);
  els.scorePad.addEventListener('click', event => {
    if (event.target === els.scorePad) closeScorePad();
  });
  els.scorePadMinus.addEventListener('click', () => {
    const current = parseScore(els.scorePadInput.textContent) || currentCourse().pars[activeScoreTarget?.holeIndex || 0] || 4;
    commitScorePadValue(current - 1);
  });
  els.scorePadPlus.addEventListener('click', () => {
    const current = parseScore(els.scorePadInput.textContent) || currentCourse().pars[activeScoreTarget?.holeIndex || 0] || 4;
    commitScorePadValue(current + 1);
  });
  document.querySelectorAll('.score-quick button').forEach(button => {
    button.addEventListener('click', () => {
      if (!activeScoreTarget) return;
      const par = currentCourse().pars[activeScoreTarget.holeIndex] || 4;
      commitScorePadValueAndAdvance(par + Number(button.dataset.scoreOffset || 0));
    });
  });

  els.courseSelect.addEventListener('change', () => {
    state.courseId = els.courseSelect.value;
    saveState();
    render();
  });

  els.birdieFlip.addEventListener('change', () => {
    state.underParFlip = els.birdieFlip.checked;
    state.birdieFlip = state.underParFlip;
    persistActiveGame(true);
    saveState();
    render();
  });

  els.scoreMode.addEventListener('change', () => {
    state.scoreMode = els.scoreMode.value === 'net' ? 'net' : 'gross';
    persistActiveGame(true);
    saveState();
    render();
  });

  els.players.forEach((input, index) => {
    input.addEventListener('change', () => {
      state.players[index] = input.value.trim() || `Player ${index + 1}`;
      saveState();
      render();
    });
  });

  els.addCourse.addEventListener('click', openCourseModal);
  els.searchCourse.addEventListener('click', openCourseSearchModal);
  els.courseSearchModes.forEach(button => {
    button.addEventListener('click', () => setCourseSearchMode(button.dataset.courseSearchMode));
  });
  els.courseSearchCountry.addEventListener('change', renderCourseSearchRegions);
  els.cancelCourseSearch.addEventListener('click', closeCourseSearchModal);
  els.cancelCourseSearchBottom.addEventListener('click', closeCourseSearchModal);
  els.courseSearchModal.addEventListener('click', event => {
    if (event.target === els.courseSearchModal) closeCourseSearchModal();
  });
  els.courseSearchForm.addEventListener('submit', async event => {
    event.preventDefault();
    const courseName = els.courseSearchInput.value.trim();
    const country = els.courseSearchCountry.value;
    const region = els.courseSearchRegion.value;
    if (courseSearchMode === 'manual') {
      closeCourseSearchModal();
      openCourseModal(courseName);
      return;
    }
    if (courseSearchMode === 'shared') {
      const searchResult = searchSharedCourses({ courseName, country, region });
      els.courseSearchStatus.textContent = searchResult.results.length ? t('Choose a course to add.') : t('No shared courses found.');
      renderCourseSearchResults(searchResult.results, 'shared');
      return;
    }
    if (!courseName && (country || region)) {
      els.courseSearchStatus.textContent = t('Enter a course name or city to search within the selected country or region.');
      els.courseSearchResults.innerHTML = '';
      return;
    }
    els.courseSearchSubmit.disabled = true;
    els.courseSearchStatus.textContent = t('Searching courses...');
    els.courseSearchResults.innerHTML = '';
    try {
      const searchResult = await searchGolfCourses({ courseName, country, region });
      const results = searchResult.results;
      els.courseSearchStatus.textContent = results.length ? t('Choose a course to add.') : t('No courses found.');
      renderCourseSearchResults(results, 'api');
    } catch (error) {
      els.courseSearchStatus.textContent = hasGolfCourseApiConfig()
        ? t('Course search failed. Try again.')
        : t('Add your GolfCourseAPI key to supabase-config.js before searching.');
    } finally {
      els.courseSearchSubmit.disabled = false;
    }
  });
  els.cancelCourse.addEventListener('click', closeCourseModal);
  els.cancelCourseBottom.addEventListener('click', closeCourseModal);

  els.courseModal.addEventListener('click', event => {
    if (event.target === els.courseModal) closeCourseModal();
  });

  els.courseForm.addEventListener('submit', async event => {
    event.preventDefault();
    const name = els.newCourseName.value.trim();
    const existingCourse = editingCourseId ? customCourses.find(course => course.id === editingCourseId) : null;
    const editCode = editingCourseId ? String(existingCourse?.editCode || els.newCourseCode.value).trim() : els.newCourseCode.value.trim();
    const pars = readCourseFormPars();
    const indexes = readCourseFormIndexes();
    const codeIsValid = editingCourseId || /^\d{2}$/.test(editCode);
    const valid = name && codeIsValid && pars.length === 18 && pars.every(par => Number.isInteger(par) && par > 0 && par <= 10) && indexesAreValid(indexes);
    if (!valid) {
      const invalidInput = courseParInputs().find(input => !Number.isInteger(Number(input.value)) || Number(input.value) <= 0 || Number(input.value) > 10);
      const invalidIndexInput = courseIndexInputs().find(input => !Number.isInteger(Number(input.value)) || Number(input.value) < 1 || Number(input.value) > 18);
      const duplicateIndexInput = courseIndexInputs().find(input => courseIndexInputs().filter(item => item.value === input.value).length > 1);
      const target = !name ? els.newCourseName : (!codeIsValid ? els.newCourseCode : (invalidInput || invalidIndexInput || duplicateIndexInput || courseIndexInputs()[0]));
      target.setCustomValidity(t(!name ? 'Enter a course name.' : (!codeIsValid ? 'Enter a 2 digit code.' : (invalidInput ? 'Enter a par from 1 to 10.' : 'Enter unique index values from 1 to 18.'))));
      target.reportValidity();
      target.setCustomValidity('');
      return;
    }
    if (editingCourseId) {
      const existing = existingCourse;
      if (!existing) return;
      const course = { ...existing, name, pars, indexes };
      customCourses = customCourses.map(item => item.id === editingCourseId ? course : item);
      saveCoursesLocal();
      closeCourseModal();
      render();
      switchView('courses');
      try {
        await upsertCloudCourse(course);
        await syncFromCloud(false);
      } catch (error) {
        setSyncState({ ok: false, busy: false, label: t('Cloud sync Not ok'), title: error.message });
      }
      return;
    }
    const baseId = slugify(name);
    let id = baseId;
    let count = 2;
    while (allCourses().some(course => course.id === id)) {
      id = `${baseId}-${count}`;
      count += 1;
    }
    const course = { id, name, pars, indexes, editCode };
    customCourses.push(course);
    saveCoursesLocal();
    state.courseId = id;
    saveState();
    closeCourseModal();
    render();
    switchView('courses');
    try {
      await upsertCloudCourse(course);
      await syncFromCloud(false);
    } catch (error) {
      setSyncState({ ok: false, busy: false, label: t('Cloud sync Not ok'), title: error.message });
    }
  });

  els.newGame.addEventListener('click', openGameModal);
  els.cancelGame.addEventListener('click', closeGameModal);
  els.cancelGameBottom.addEventListener('click', closeGameModal);

  els.gameModal.addEventListener('click', event => {
    if (event.target === els.gameModal) closeGameModal();
  });

  els.gameForm.addEventListener('submit', async event => {
    event.preventDefault();
    const players = [
      els.newPlayerA1.value.trim() || 'Player 1',
      els.newPlayerA2.value.trim() || 'Player 2',
      els.newPlayerB1.value.trim() || 'Player 3',
      els.newPlayerB2.value.trim() || 'Player 4'
    ];
    const handicaps = normalizeHandicaps([
      els.newHandicapA1.value,
      els.newHandicapA2.value,
      els.newHandicapB1.value,
      els.newHandicapB2.value
    ]);
    const code = els.newGameCode.value.trim();
    if (!editingGameInfoId && !/^\d{2}$/.test(code)) {
      els.newGameCode.setCustomValidity(t('Enter a 2 digit code.'));
      els.newGameCode.reportValidity();
      els.newGameCode.setCustomValidity('');
      return;
    }
    const course = allCourses().find(item => item.id === els.newGameCourse.value) || allCourses()[0];
    const teeTime = els.newGameTeeTime.value;
    const nextState = {
      courseId: course.id,
      players,
      handicaps,
      scoreMode: els.newGameScoreMode.value === 'net' ? 'net' : 'gross',
      underParFlip: els.newGameBirdieFlip.checked,
      birdieFlip: els.newGameBirdieFlip.checked
    };

    if (editingGameInfoId) {
      const existing = savedRounds.find(round => round.id === editingGameInfoId);
      if (!existing) return;
      if (existing.courseId !== course.id) {
        const ok = await confirmDialog(t('Change course'), t('Changing course will recalculate Par, Index and scores. Continue?'));
        if (!ok) return;
      }
      if (!(await confirmSaveGameInfoWithCode(existing))) return;
      activeGameId = existing.id;
      state = {
        ...state,
        ...nextState,
        scores: normalizeScores(existing.scores)
      };
      const updated = replaceRound(roundFromState({
        ...existing,
        totals: {
          ...existing.totals,
          teeTime
        }
      }, gameStatus(existing)));
      closeGameModal();
      render();
      scheduleAutoSync(updated);
      return;
    }

    state = {
      ...nextState,
      scores: emptyScores()
    };
    const game = replaceRound(roundFromState({
      totals: {
        status: 'playing',
        editCode: code,
        teeTime
      }
    }, 'playing'));
    activeGameId = game.id;
    isEditing = true;
    saveState();
    closeGameModal();
    render();
    switchView('play');
    scheduleAutoSync(game);
  });

  els.languageButton.addEventListener('click', window.VEGAS_I18N.toggle);
}

function init() {
  const cloudReady = hasSupabaseConfig();
  customCourses = loadJson(COURSE_KEY, []);
  deletedRoundKeys = loadJson(DELETE_KEY, []);
  savedRounds = cloudReady ? [] : loadJson(HISTORY_KEY, []).map(normalizeRound).filter(round => !isRoundDeleted(round));
  if (cloudReady) saveHistoryLocal();
  const savedState = loadJson(STORAGE_KEY, {});
  activeGameId = savedState.activeGameId || '';
  state = { ...state, ...savedState, scores: normalizeScores(savedState.scores) };
  if (!Array.isArray(state.players) || state.players.length !== 4) {
    state.players = ['Player 1', 'Player 2', 'Player 3', 'Player 4'];
  }
  state.handicaps = normalizeHandicaps(state.handicaps);
  state.scoreMode = state.scoreMode === 'net' ? 'net' : 'gross';
  state.underParFlip = 'underParFlip' in state ? Boolean(state.underParFlip) : Boolean(state.birdieFlip);
  state.birdieFlip = state.underParFlip;
  chooseInitialGame();
  if (activeGameId) loadGame(activeGameId, false, false);
  if (cloudReady) {
    setSyncState({
      ready: true,
      busy: false,
      ok: false,
      label: t('Cloud sync Not ok'),
      title: `Supabase room: ${supabaseConfig().syncKey}`
    });
  }
  renderCourseParInputs();
  addListeners();
  render();
  syncFromCloud(false);
  window.setInterval(() => {
    if (!hasSupabaseConfig() || syncState.busy) return;
    if (isEditing) {
      ensureEditLockStillMine();
    } else {
      syncFromCloud(false, true);
    }
  }, 4000);
  window.addEventListener('focus', () => {
    if (!isEditing && hasSupabaseConfig() && !syncState.busy) {
      syncFromCloud(false, true);
    }
  });
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden && !isEditing && hasSupabaseConfig() && !syncState.busy) {
      syncFromCloud(false, true);
    }
  });
}

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.getRegistrations()
      .then(registrations => Promise.all(registrations.map(registration => registration.unregister())))
      .catch(() => {});
  });
}

if ('caches' in window) {
  window.addEventListener('load', () => {
    caches.keys()
      .then(keys => Promise.all(keys.filter(key => key.startsWith('vegas-golf-')).map(key => caches.delete(key))))
      .catch(() => {});
  });
}

init();
