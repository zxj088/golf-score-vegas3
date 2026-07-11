const STORAGE_KEY = 'vegasGolfState.v1';
const HISTORY_KEY = 'vegasGolfHistory.v1';
const COURSE_KEY = 'vegasGolfCourses.v1';
const CLIENT_KEY = 'vegasGolfClientId.v1';
const GAME_LIMIT = 200;
const EDIT_LOCK_TTL_MS = 12000;

const defaultCourses = [
  { id: 'bro-hof-stadium', name: 'Bro Hof Stadium', pars: [5,4,4,3,4,4,3,4,5,4,3,5,5,4,5,3,3,4] },
  { id: 'bro-hof-castle', name: 'Bro Hof Castle', pars: [5,3,4,3,5,4,3,4,5,5,3,3,5,4,5,4,3,4] },
  { id: 'kungsangen-kings', name: 'Kungsangen Kings', pars: [4,4,3,4,4,4,3,5,4,4,3,4,3,5,3,4,4,5] },
  { id: 'kungsangen-queens', name: 'Kungsangen Queens', pars: [4,4,3,4,3,4,4,5,4,5,3,4,5,3,4,4,4,3] },
  { id: 'waxholm', name: 'Waxholm', pars: [4,5,3,4,4,4,4,5,4,4,3,4,4,4,5,4,5,3] },
  { id: 'lindo-dal', name: 'Lindo Dal', pars: [4,3,4,3,4,5,4,4,5,4,3,4,4,3,4,4,3,5] },
  { id: 'kyssinge', name: 'Kyssinge', pars: [4,5,5,4,3,4,4,3,5,4,5,4,4,5,3,4,3,5] },
  { id: 'bodaholm', name: 'Bodaholm', pars: [4,4,3,5,4,3,4,3,5,5,4,4,4,3,4,3,4,5] },
  { id: 'brollsta', name: 'Brollsta', pars: [4,4,4,5,4,3,4,3,5,5,3,4,3,4,4,5,4,4] },
  { id: 'international', name: 'International', pars: [4,5,3,4,5,3,4,4,4,4,4,3,4,5,5,4,3,4] },
  { id: 'lovsattrra', name: 'Lovsattrra', pars: [4,4,4,5,3,4,6,3,4,5,3,4,4,4,3,5,3,4] },
  { id: 'riksten', name: 'Riksten', pars: [5,4,3,4,5,4,4,3,4,4,4,5,3,4,5,3,4,4] }
];

let activeGameId = '';
let isEditing = false;
let autoSyncTimer = null;
let dialogResolver = null;
const clientId = getClientId();
let state = {
  courseId: defaultCourses[0].id,
  players: ['Player 1', 'Player 2', 'Player 3', 'Player 4'],
  pointValue: 1,
  birdieFlip: true,
  scores: emptyScores()
};

let customCourses = [];
let savedRounds = [];
let syncState = {
  ready: false,
  busy: false,
  ok: false,
  label: 'Cloud sync Not ok',
  title: 'Supabase is not connected.'
};

const els = {
  scoreStrip: document.querySelector('#scoreStrip'),
  syncBar: document.querySelector('#syncBar'),
  installButton: document.querySelector('#installButton'),
  shareButton: document.querySelector('#shareButton'),
  courseSelect: document.querySelector('#courseSelect'),
  pointValue: document.querySelector('#pointValue'),
  birdieFlip: document.querySelector('#birdieFlip'),
  players: [
    document.querySelector('#playerA1'),
    document.querySelector('#playerA2'),
    document.querySelector('#playerB1'),
    document.querySelector('#playerB2')
  ],
  scoreRows: document.querySelector('#scoreRows'),
  teamATotal: document.querySelector('#teamATotal'),
  teamBTotal: document.querySelector('#teamBTotal'),
  teamAMoney: document.querySelector('#teamAMoney'),
  teamBMoney: document.querySelector('#teamBMoney'),
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
  newCourseName: document.querySelector('#newCourseName'),
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
  newGameCourse: document.querySelector('#newGameCourse'),
  newGameTee: document.querySelector('#newGameTee'),
  newGameCode: document.querySelector('#newGameCode'),
  newGameBirdieFlip: document.querySelector('#newGameBirdieFlip'),
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
  dialogCancel: document.querySelector('#dialogCancel')
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

function allCourses() {
  return [...defaultCourses, ...customCourses];
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

function gameTee(round) {
  return round?.totals?.tee || 'yellow';
}

function gameCode(round) {
  return String(round?.totals?.editCode || '').trim();
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
  const courseId = round.courseId || defaultCourses[0].id;
  const course = allCourses().find(item => item.id === courseId) || defaultCourses[0];
  const courseName = round.courseName || course.name || 'Unknown Course';
  const name = round.name || roundDisplayName({ name: courseName }, players);
  return {
    id: round.id || `round-${savedAt}`,
    savedAt,
    name,
    fileName: round.fileName || `${safeFilePart(name)}.json`,
    courseId,
    courseName,
    pars: Array.isArray(round.pars) && round.pars.length === 18 ? round.pars : course.pars,
    players,
    pointValue: Number(round.pointValue || 1),
    birdieFlip: Boolean(round.birdieFlip),
    scores: normalizeScores(round.scores),
    totals: {
      a: Number(baseTotals.a || 0),
      b: Number(baseTotals.b || 0),
      complete: Number(baseTotals.complete || 0),
      players: Array.isArray(baseTotals.players) ? baseTotals.players : [0, 0, 0, 0],
      status: baseTotals.status === 'playing' ? 'playing' : 'history',
      tee: baseTotals.tee || 'yellow',
      editCode: String(baseTotals.editCode || ''),
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
    pars: course.pars
  };
}

function cloudRowToCourse(row) {
  return {
    id: row.course_id,
    name: row.name,
    pars: Array.isArray(row.pars) ? row.pars : []
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
    pars: normalized.pars,
    players: normalized.players,
    point_value: normalized.pointValue,
    birdie_flip: normalized.birdieFlip,
    scores: normalized.scores,
    totals: normalized.totals
  };
}

function cloudRowToRound(row) {
  return normalizeRound({
    id: String(row.id).split(':round:').pop(),
    savedAt: Number(row.saved_at),
    name: row.name,
    fileName: row.file_name,
    courseId: row.course_id,
    courseName: row.course_name,
    pars: row.pars,
    players: row.players,
    pointValue: row.point_value,
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

function mergeRounds(localRounds, remoteRounds) {
  return mergeById(localRounds.map(normalizeRound), remoteRounds.map(normalizeRound))
    .sort((a, b) => Number(b.savedAt || 0) - Number(a.savedAt || 0))
    .slice(0, GAME_LIMIT);
}

function setSyncState(next) {
  syncState = { ...syncState, ...next };
  renderSyncStatus();
}

function renderSyncStatus() {
  if (!els.syncStatus || !els.editGame) return;
  els.syncStatus.textContent = syncState.busy ? 'Syncing...' : syncState.label;
  els.syncStatus.title = syncState.title;
  els.syncStatus.classList.toggle('sync-ok', Boolean(syncState.ok) && !syncState.busy);
  els.syncStatus.classList.toggle('sync-bad', !syncState.ok && !syncState.busy);
  els.editGame.textContent = isEditing ? 'Finish' : 'Edit';
  els.editGame.disabled = !currentGame();
}

async function fetchCloudCourses() {
  const query = `select=*&sync_key=eq.${encodeURIComponent(supabaseConfig().syncKey)}&order=name.asc`;
  const rows = await supabaseRequest('vegas_courses', query);
  return rows.map(cloudRowToCourse).filter(course => course.pars.length === 18);
}

async function fetchCloudRounds() {
  const query = `select=*&sync_key=eq.${encodeURIComponent(supabaseConfig().syncKey)}&order=saved_at.desc&limit=${GAME_LIMIT}`;
  const rows = await supabaseRequest('vegas_rounds', query);
  return rows.map(cloudRowToRound);
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

async function deleteCloudCourse(courseId) {
  if (!hasSupabaseConfig()) return;
  await supabaseRequest('vegas_courses', `id=eq.${encodeURIComponent(cloudId('course', courseId))}`, {
    method: 'DELETE',
    prefer: 'return=minimal'
  });
}

async function deleteCloudRound(roundId) {
  if (!hasSupabaseConfig()) return;
  await supabaseRequest('vegas_rounds', `id=eq.${encodeURIComponent(cloudId('round', roundId))}`, {
    method: 'DELETE',
    prefer: 'return=minimal'
  });
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
      label: 'Cloud sync Not ok',
      title: 'Add your Supabase URL and anon key to supabase-config.js.'
    });
    return;
  }

  if (!quiet) {
    setSyncState({
      ready: true,
      busy: true,
      title: 'Sending and loading scorecard data.'
    });
  }

  try {
    if (pushLocal) {
      await Promise.all([
        ...customCourses.map(upsertCloudCourse),
        ...savedRounds.map(upsertCloudRound)
      ]);
    }

    const [cloudCourses, cloudRounds] = await Promise.all([
      fetchCloudCourses(),
      fetchCloudRounds()
    ]);

    customCourses = mergeById(customCourses, cloudCourses);
    savedRounds = mergeRounds(savedRounds, cloudRounds);
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
      label: 'Cloud sync ok',
      title: `Supabase room: ${supabaseConfig().syncKey}`
    });
    render();
  } catch (error) {
    setSyncState({
      ready: true,
      busy: false,
      ok: false,
      label: 'Cloud sync Not ok',
      title: error.message
    });
  }
}

function scheduleAutoSync(round) {
  if (!round) return;
  window.clearTimeout(autoSyncTimer);
  if (!hasSupabaseConfig()) {
    setSyncState({ ok: false, busy: false, label: 'Cloud sync Not ok', title: 'Supabase is not configured.' });
    return;
  }
  setSyncState({ ready: true, busy: true, title: 'Saving scorecard changes.' });
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
        label: 'Cloud sync ok',
        title: `Saved ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
      });
    } catch (error) {
      setSyncState({
        ready: true,
        busy: false,
        ok: false,
        label: 'Cloud sync Not ok',
        title: error.message
      });
    }
  }, 650);
}

function courseParInputs() {
  return Array.from(document.querySelectorAll('.course-par-input'));
}

function updateCourseFormTotals() {
  const values = courseParInputs().map(input => Number(input.value) || 0);
  const front = values.slice(0, 9).reduce((sum, par) => sum + par, 0);
  const back = values.slice(9, 18).reduce((sum, par) => sum + par, 0);
  els.frontNineTotal.textContent = front;
  els.backNineTotal.textContent = back;
  els.courseParTotal.textContent = front + back;
}

function renderCourseParInputs(pars = currentCourse().pars) {
  els.frontNineList.innerHTML = '';
  els.backNineList.innerHTML = '';

  Array.from({ length: 18 }, (_, index) => {
    const row = document.createElement('label');
    row.className = 'par-row';
    row.innerHTML = `
      <span>Hole ${index + 1}</span>
      <input class="course-par-input" type="number" min="1" max="7" inputmode="numeric" required aria-label="Hole ${index + 1} par">
    `;
    const input = row.querySelector('input');
    input.value = pars[index] || 4;
    input.addEventListener('input', updateCourseFormTotals);
    if (index < 9) {
      els.frontNineList.append(row);
    } else {
      els.backNineList.append(row);
    }
  });

  updateCourseFormTotals();
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

function openCourseModal() {
  els.courseForm.reset();
  renderCourseParInputs();
  els.courseModal.hidden = false;
  els.newCourseName.focus();
}

function closeCourseModal() {
  els.courseModal.hidden = true;
  els.courseForm.reset();
}

function openGameModal() {
  els.gameForm.reset();
  renderNewGameCourses();
  els.newGameTee.value = 'yellow';
  els.newGameBirdieFlip.checked = true;
  els.newPlayerA1.value = 'Player 1';
  els.newPlayerA2.value = 'Player 2';
  els.newPlayerB1.value = 'Player 3';
  els.newPlayerB2.value = 'Player 4';
  els.gameModal.hidden = false;
  els.newPlayerA1.focus();
}

function closeGameModal() {
  els.gameModal.hidden = true;
  els.gameForm.reset();
}

function readCourseFormPars() {
  return courseParInputs().map(input => Number(input.value));
}

function parseScore(value) {
  const score = Number(value);
  return Number.isInteger(score) && score > 0 ? score : null;
}

function teamNumber(scores, par, shouldFlip) {
  const low = Math.min(...scores);
  const high = Math.max(...scores);
  const flipped = shouldFlip && low >= par;
  return {
    value: flipped ? high * 10 + low : low * 10 + high,
    flipped
  };
}

function scoreHole(scores, par) {
  const values = scores.map(parseScore);
  if (values.some(value => value === null)) return null;

  const teamA = [values[0], values[1]];
  const teamB = [values[2], values[3]];
  const aBirdie = Math.min(...teamA) < par;
  const bBirdie = Math.min(...teamB) < par;
  const flipA = state.birdieFlip && bBirdie && !aBirdie;
  const flipB = state.birdieFlip && aBirdie && !bBirdie;
  const aNumber = teamNumber(teamA, par, flipA);
  const bNumber = teamNumber(teamB, par, flipB);
  const delta = bNumber.value - aNumber.value;

  return {
    aNumber,
    bNumber,
    delta,
    aBirdie,
    bBirdie
  };
}

function totals() {
  const course = currentCourse();
  return state.scores.reduce((sum, scores, index) => {
    scores.forEach((score, scoreIndex) => {
      sum.players[scoreIndex] += parseScore(score) || 0;
    });
    const result = scoreHole(scores, course.pars[index]);
    if (!result) return sum;
    sum.a += result.delta;
    sum.b -= result.delta;
    sum.complete += 1;
    return sum;
  }, { a: 0, b: 0, complete: 0, players: [0, 0, 0, 0] });
}

function money(points) {
  const value = Math.abs(points * Number(state.pointValue || 0));
  const sign = points < 0 ? '-' : '';
  return `${sign}$${value.toFixed(2)}`;
}

function roundFromState(existing = {}, statusOverride = null) {
  const course = currentCourse();
  const previousTotals = existing.totals || {};
  const scoreTotals = totals();
  const status = statusOverride || previousTotals.status || 'playing';
  const tee = previousTotals.tee || 'yellow';
  const editCode = previousTotals.editCode || '';
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
    players: [...state.players],
    pointValue: state.pointValue,
    birdieFlip: state.birdieFlip,
    scores: state.scores.map(row => [...row]),
    totals: {
      ...scoreTotals,
      status,
      tee,
      editCode,
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
    label: 'Cloud sync ok',
    title: 'Edit lock acquired.'
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
      label: 'Cloud sync ok',
      title: 'Another phone is now editing this game.'
    });
    return false;
  }
  const refreshed = replaceRound(withCurrentEditLock(roundFromState(latest)));
  await upsertCloudRound(refreshed);
  setSyncState({
    ready: true,
    busy: false,
    ok: true,
    label: 'Cloud sync ok',
    title: 'Edit lock refreshed.'
  });
  return true;
}

function ensureCourseFromRound(round) {
  if (allCourses().some(course => course.id === round.courseId)) return;
  if (!Array.isArray(round.pars) || round.pars.length !== 18) return;
  customCourses.push({
    id: round.courseId,
    name: round.courseName,
    pars: round.pars
  });
  saveCoursesLocal();
}

function applyGameToState(round) {
  ensureCourseFromRound(round);
  state = {
    courseId: round.courseId,
    players: [...round.players],
    pointValue: round.pointValue,
    birdieFlip: round.birdieFlip,
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
  eyebrow = 'Action',
  title = 'Confirm',
  message = '',
  input = false,
  inputLabel = 'Code',
  inputMode = 'text',
  maxLength = '',
  pattern = '',
  okText = 'OK',
  cancelText = 'Cancel'
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
    eyebrow: 'Notice',
    title,
    message,
    okText: 'OK',
    cancelText: 'Close'
  });
}

async function confirmDialog(title, message) {
  return openAppDialog({
    eyebrow: 'Confirm',
    title,
    message,
    okText: 'Yes',
    cancelText: 'No'
  });
}

async function confirmCodeDialog(title, message, errorMessage = '') {
  return openAppDialog({
    eyebrow: 'Edit Code',
    title,
    message: errorMessage || message,
    input: true,
    inputLabel: 'Code',
    inputMode: 'numeric',
    maxLength: '2',
    pattern: '[0-9]{2}',
    okText: 'Yes',
    cancelText: 'No'
  });
}

async function askCodeDialog(errorMessage = '') {
  return openAppDialog({
    eyebrow: 'Edit Code',
    title: "what's the code?",
    message: errorMessage || 'Enter the 2 digit edit code for this game.',
    input: true,
    inputLabel: 'Code',
    inputMode: 'numeric',
    maxLength: '2',
    pattern: '[0-9]{2}',
    okText: 'OK',
    cancelText: 'Cancel'
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
    errorMessage = 'The edit code is not correct. Try again.';
  }
}

function codeMatchesRound(round, value) {
  const code = gameCode(round);
  return value === '59' || (/^\d{2}$/.test(code) && value === code);
}

async function confirmEditWithCode(round) {
  let errorMessage = '';
  while (true) {
    const answer = await confirmCodeDialog('Edit game', 'Enter code, then choose Yes to edit this game.', errorMessage);
    if (answer === false) return false;
    if (codeMatchesRound(round, answer)) return true;
    errorMessage = 'The edit code is not correct. Try again.';
  }
}

async function verifyActiveCode() {
  return verifyCodeForRound(currentGame());
}

async function deleteHistoryGame(round) {
  if (!(await confirmDialog('Delete game', 'Delete this finished game from History?'))) return;
  if (!(await verifyCodeForRound(round))) return;
  setSyncState({
    ready: true,
    busy: true,
    title: 'Deleting game from cloud.'
  });
  try {
    await deleteCloudRound(round.id);
  } catch (error) {
    setSyncState({
      ready: true,
      busy: false,
      ok: false,
      label: 'Cloud sync Not ok',
      title: error.message
    });
    await showMessage('Delete failed', 'Could not delete this game from the cloud. Try again.');
    return;
  }
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
    label: 'Cloud sync ok',
    title: 'Deleted from cloud.'
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
  els.pointValue.value = state.pointValue;
  els.pointValue.disabled = true;
  els.birdieFlip.checked = state.birdieFlip;
  els.birdieFlip.disabled = true;
  els.players.forEach((input, index) => {
    input.value = state.players[index];
    input.readOnly = true;
  });
}

function renderScoreStrip() {
  const course = currentCourse();
  const total = totals();
  const parTotal = course.pars.reduce((a, b) => a + b, 0);
  const tee = currentGame() ? gameTee(currentGame()) : 'yellow';
  els.teamATotal.textContent = total.a;
  els.teamBTotal.textContent = total.b;
  applySignedClass(els.teamATotal, total.a);
  applySignedClass(els.teamBTotal, total.b);
  els.teamAMoney.textContent = money(total.a);
  els.teamBMoney.textContent = money(total.b);
  applySignedClass(els.teamAMoney, total.a);
  applySignedClass(els.teamBMoney, total.b);
  els.holesComplete.textContent = `${total.complete}/18`;
  els.coursePar.textContent = `Par ${parTotal} - ${tee}`;
  els.totalPar.textContent = parTotal;
  els.playerTotals.forEach((cell, index) => {
    cell.textContent = total.players[index];
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
    const result = scoreHole(scores, course.pars[index]);
    row.innerHTML = `
      <td>${index + 1}</td>
      <td>${course.pars[index]}</td>
      <td class="team-a-score"><input class="score score-0" type="number" min="1" max="20" inputmode="numeric" aria-label="Hole ${index + 1} ${state.players[0]} score"></td>
      <td class="team-a-score"><input class="score score-1" type="number" min="1" max="20" inputmode="numeric" aria-label="Hole ${index + 1} ${state.players[1]} score"></td>
      <td class="team-a-score vegas-number"></td>
      <td class="team-a-score hole-points"></td>
      <td class="team-b-score"><input class="score score-2" type="number" min="1" max="20" inputmode="numeric" aria-label="Hole ${index + 1} ${state.players[2]} score"></td>
      <td class="team-b-score"><input class="score score-3" type="number" min="1" max="20" inputmode="numeric" aria-label="Hole ${index + 1} ${state.players[3]} score"></td>
      <td class="team-b-score vegas-number"></td>
      <td class="team-b-score hole-points"></td>
    `;

    [0, 1, 2, 3].forEach(scoreIndex => {
      const input = row.querySelector(`.score-${scoreIndex}`);
      input.value = scores[scoreIndex];
      input.disabled = !isEditing;
      input.addEventListener('change', () => {
        if (!isEditing) return;
        state.scores[index][scoreIndex] = input.value;
        persistActiveGame(true);
        render();
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
    const isCustom = customCourses.some(item => item.id === course.id);
    row.innerHTML = `
      <div>
        <strong></strong>
        <span></span>
      </div>
      <div class="small-actions"></div>
    `;
    row.querySelector('strong').textContent = course.name;
    row.querySelector('span').textContent = `Par ${course.pars.reduce((a, b) => a + b, 0)} - ${isCustom ? 'Custom' : 'Preset'}`;

    if (isCustom) {
      const deleteButton = document.createElement('button');
      deleteButton.type = 'button';
      deleteButton.className = 'danger';
      deleteButton.textContent = 'Delete';
      deleteButton.addEventListener('click', async () => {
        customCourses = customCourses.filter(item => item.id !== course.id);
        saveCoursesLocal();
        if (state.courseId === course.id) state.courseId = defaultCourses[0].id;
        saveState();
        render();
        try {
          await deleteCloudCourse(course.id);
          await syncFromCloud(false);
        } catch (error) {
          setSyncState({ ok: false, busy: false, label: 'Cloud sync Not ok', title: error.message });
        }
      });
      row.querySelector('.small-actions').append(deleteButton);
    }

    els.courseList.append(row);
  });
}

function roundSummary(round) {
  const date = new Date(round.savedAt);
  const total = round.totals || {};
  return `${date.toLocaleDateString()} ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} | ${round.courseName} | ${gameTee(round)} | A ${total.a}, B ${total.b}`;
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
          <strong></strong>
          <span class="game-meta"></span>
        </span>
      </button>
      <div class="small-actions"></div>
    `;
    row.querySelector('.playing-icon').hidden = status !== 'playing';
    row.querySelector('strong').textContent = round.name || round.courseName;
    row.querySelector('.game-meta').textContent = roundSummary(round);
    row.querySelector('.game-open').addEventListener('click', () => loadGame(round.id, false, true));
    if (status === 'history') {
      const deleteButton = document.createElement('button');
      deleteButton.type = 'button';
      deleteButton.className = 'danger';
      deleteButton.textContent = 'Delete';
      deleteButton.addEventListener('click', () => deleteHistoryGame(round));
      row.querySelector('.small-actions').append(deleteButton);
    }
    container.append(row);
  });
}

function renderStart() {
  const playing = savedRounds.filter(round => gameStatus(round) === 'playing');
  const history = savedRounds.filter(round => gameStatus(round) !== 'playing');
  renderGameList(els.playingList, playing, 'No games currently playing', 'playing');
  renderGameList(els.historyList, history, 'No finished games', 'history');
}

function render() {
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

    if (!(await confirmDialog('Finish game', 'Finish this game and move it to History?'))) return;
    if (!(await verifyActiveCode())) return;
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
      title: 'Vegas Golf Scorecard',
      text: 'Vegas Golf Scorecard',
      url: window.location.href.split('?')[0]
    };
    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else if (navigator.clipboard) {
        await navigator.clipboard.writeText(shareData.url);
        await showMessage('Link copied', 'The app link was copied to the clipboard.');
      } else {
        await showMessage('Share app', shareData.url);
      }
    } catch {}
  });

  els.dialogForm.addEventListener('submit', event => {
    event.preventDefault();
    if (!els.dialogInputWrap.hidden) {
      const value = els.dialogInput.value.trim();
      if (els.dialogInput.pattern && !new RegExp(`^${els.dialogInput.pattern}$`).test(value)) {
        els.dialogInput.setCustomValidity('Enter a valid value.');
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

  els.courseSelect.addEventListener('change', () => {
    state.courseId = els.courseSelect.value;
    saveState();
    render();
  });

  els.pointValue.addEventListener('input', () => {
    state.pointValue = Number(els.pointValue.value || 0);
    saveState();
    renderScoreStrip();
  });

  els.birdieFlip.addEventListener('change', () => {
    state.birdieFlip = els.birdieFlip.checked;
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
  els.cancelCourse.addEventListener('click', closeCourseModal);
  els.cancelCourseBottom.addEventListener('click', closeCourseModal);

  els.courseModal.addEventListener('click', event => {
    if (event.target === els.courseModal) closeCourseModal();
  });

  els.courseForm.addEventListener('submit', async event => {
    event.preventDefault();
    const name = els.newCourseName.value.trim();
    const pars = readCourseFormPars();
    const valid = name && pars.length === 18 && pars.every(par => Number.isInteger(par) && par > 0 && par < 8);
    if (!valid) {
      const invalidInput = courseParInputs().find(input => !Number.isInteger(Number(input.value)) || Number(input.value) <= 0 || Number(input.value) >= 8);
      const target = name ? invalidInput : els.newCourseName;
      target.setCustomValidity(name ? 'Enter a par from 1 to 7.' : 'Enter a course name.');
      target.reportValidity();
      target.setCustomValidity('');
      return;
    }
    const baseId = slugify(name);
    let id = baseId;
    let count = 2;
    while (allCourses().some(course => course.id === id)) {
      id = `${baseId}-${count}`;
      count += 1;
    }
    const course = { id, name, pars };
    customCourses.push(course);
    saveCoursesLocal();
    state.courseId = id;
    saveState();
    closeCourseModal();
    render();
    try {
      await upsertCloudCourse(course);
      await syncFromCloud(false);
    } catch (error) {
      setSyncState({ ok: false, busy: false, label: 'Cloud sync Not ok', title: error.message });
    }
  });

  els.newGame.addEventListener('click', openGameModal);
  els.cancelGame.addEventListener('click', closeGameModal);
  els.cancelGameBottom.addEventListener('click', closeGameModal);

  els.gameModal.addEventListener('click', event => {
    if (event.target === els.gameModal) closeGameModal();
  });

  els.gameForm.addEventListener('submit', event => {
    event.preventDefault();
    const players = [
      els.newPlayerA1.value.trim() || 'Player 1',
      els.newPlayerA2.value.trim() || 'Player 2',
      els.newPlayerB1.value.trim() || 'Player 3',
      els.newPlayerB2.value.trim() || 'Player 4'
    ];
    const code = els.newGameCode.value.trim();
    if (!/^\d{2}$/.test(code)) {
      els.newGameCode.setCustomValidity('Enter a 2 digit code.');
      els.newGameCode.reportValidity();
      els.newGameCode.setCustomValidity('');
      return;
    }
    const course = allCourses().find(item => item.id === els.newGameCourse.value) || allCourses()[0];
    state = {
      courseId: course.id,
      players,
      pointValue: 1,
      birdieFlip: els.newGameBirdieFlip.checked,
      scores: emptyScores()
    };
    const game = replaceRound(roundFromState({
      totals: {
        status: 'playing',
        tee: els.newGameTee.value,
        editCode: code
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

  els.installButton.addEventListener('click', () => {
    window.location.reload();
  });
}

function init() {
  customCourses = loadJson(COURSE_KEY, []);
  savedRounds = loadJson(HISTORY_KEY, []).map(normalizeRound);
  const savedState = loadJson(STORAGE_KEY, {});
  activeGameId = savedState.activeGameId || '';
  state = { ...state, ...savedState, scores: normalizeScores(savedState.scores) };
  if (!Array.isArray(state.players) || state.players.length !== 4) {
    state.players = ['Player 1', 'Player 2', 'Player 3', 'Player 4'];
  }
  chooseInitialGame();
  if (activeGameId) loadGame(activeGameId, false, false);
  if (hasSupabaseConfig()) {
    setSyncState({
      ready: true,
      busy: false,
      ok: false,
      label: 'Cloud sync Not ok',
      title: `Supabase room: ${supabaseConfig().syncKey}`
    });
  }
  renderCourseParInputs();
  addListeners();
  render();
  syncFromCloud(true);
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
    navigator.serviceWorker.register('./sw.js').catch(() => {});
  });
}

init();
