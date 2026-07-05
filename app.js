const STORAGE_KEY = 'vegasGolfState.v1';
const HISTORY_KEY = 'vegasGolfHistory.v1';
const COURSE_KEY = 'vegasGolfCourses.v1';
const HISTORY_LIMIT = 60;

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

let deferredInstallPrompt = null;
let state = {
  courseId: defaultCourses[0].id,
  players: ['Player 1', 'Player 2', 'Player 3', 'Player 4'],
  pointValue: 1,
  birdieFlip: true,
  scores: Array.from({ length: 18 }, () => ['', '', '', ''])
};

let customCourses = [];
let savedRounds = [];
let syncState = {
  ready: false,
  busy: false,
  label: 'Local only',
  title: 'Supabase is not configured yet.'
};

const els = {
  installButton: document.querySelector('#installButton'),
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
  saveRound: document.querySelector('#saveRound'),
  clearRound: document.querySelector('#clearRound'),
  syncStatus: document.querySelector('#syncStatus'),
  syncNow: document.querySelector('#syncNow'),
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
  historyList: document.querySelector('#historyList')
};

function allCourses() {
  return [...defaultCourses, ...customCourses];
}

function currentCourse() {
  return allCourses().find(course => course.id === state.courseId) || allCourses()[0];
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
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function saveCoursesLocal() {
  localStorage.setItem(COURSE_KEY, JSON.stringify(customCourses));
}

function saveHistoryLocal() {
  localStorage.setItem(HISTORY_KEY, JSON.stringify(savedRounds.slice(0, HISTORY_LIMIT)));
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

function roundDisplayName(course = currentCourse()) {
  return `${course.name}_Team A(${state.players[0]}+ ${state.players[1]}) vs. Team B(${state.players[2]}+${state.players[3]})`;
}

function roundFileName(course = currentCourse()) {
  return `${safeFilePart(roundDisplayName(course))}.json`;
}

function applySignedClass(element, value) {
  element.classList.toggle('point-positive', Number(value) > 0);
  element.classList.toggle('point-negative', Number(value) < 0);
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
  return response.json();
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
  return {
    id: cloudId('round', round.id),
    sync_key: supabaseConfig().syncKey,
    saved_at: round.savedAt,
    name: round.name,
    file_name: round.fileName,
    course_id: round.courseId,
    course_name: round.courseName,
    pars: round.pars,
    players: round.players,
    point_value: round.pointValue,
    birdie_flip: round.birdieFlip,
    scores: round.scores,
    totals: round.totals
  };
}

function cloudRowToRound(row) {
  return {
    id: String(row.id).split(':round:').pop(),
    savedAt: Number(row.saved_at),
    name: row.name,
    fileName: row.file_name,
    courseId: row.course_id,
    courseName: row.course_name,
    pars: Array.isArray(row.pars) ? row.pars : [],
    players: Array.isArray(row.players) ? row.players : ['Player 1', 'Player 2', 'Player 3', 'Player 4'],
    pointValue: Number(row.point_value || 1),
    birdieFlip: Boolean(row.birdie_flip),
    scores: Array.isArray(row.scores) ? row.scores : Array.from({ length: 18 }, () => ['', '', '', '']),
    totals: row.totals || { a: 0, b: 0, complete: 0, players: [0, 0, 0, 0] }
  };
}

function mergeById(localItems, remoteItems) {
  const merged = new Map();
  localItems.forEach(item => merged.set(item.id, item));
  remoteItems.forEach(item => merged.set(item.id, item));
  return Array.from(merged.values());
}

function mergeRounds(localRounds, remoteRounds) {
  return mergeById(localRounds, remoteRounds)
    .sort((a, b) => Number(b.savedAt || 0) - Number(a.savedAt || 0))
    .slice(0, HISTORY_LIMIT);
}

function setSyncState(next) {
  syncState = { ...syncState, ...next };
  renderSyncStatus();
}

function renderSyncStatus() {
  if (!els.syncStatus || !els.syncNow) return;
  els.syncStatus.textContent = syncState.label;
  els.syncStatus.title = syncState.title;
  els.syncNow.disabled = syncState.busy || !syncState.ready;
  els.syncNow.hidden = !syncState.ready;
}

async function fetchCloudCourses() {
  const query = `select=*&sync_key=eq.${encodeURIComponent(supabaseConfig().syncKey)}&order=name.asc`;
  const rows = await supabaseRequest('vegas_courses', query);
  return rows.map(cloudRowToCourse).filter(course => course.pars.length === 18);
}

async function fetchCloudRounds() {
  const query = `select=*&sync_key=eq.${encodeURIComponent(supabaseConfig().syncKey)}&order=saved_at.desc&limit=${HISTORY_LIMIT}`;
  const rows = await supabaseRequest('vegas_rounds', query);
  return rows.map(cloudRowToRound);
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

async function syncFromCloud(pushLocal = true) {
  if (!hasSupabaseConfig()) {
    setSyncState({
      ready: false,
      busy: false,
      label: 'Local only',
      title: 'Add your Supabase URL and anon key to supabase-config.js.'
    });
    return;
  }

  setSyncState({
    ready: true,
    busy: true,
    label: 'Syncing...',
    title: 'Sending and loading scorecard data.'
  });

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
    saveCoursesLocal();
    saveHistoryLocal();
    setSyncState({
      ready: true,
      busy: false,
      label: 'Cloud synced',
      title: `Supabase room: ${supabaseConfig().syncKey}`
    });
    render();
  } catch (error) {
    setSyncState({
      ready: true,
      busy: false,
      label: 'Sync failed',
      title: error.message
    });
  }
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
  els.pointValue.value = state.pointValue;
  els.birdieFlip.checked = state.birdieFlip;
  els.players.forEach((input, index) => {
    input.value = state.players[index];
  });
}

function renderScoreStrip() {
  const course = currentCourse();
  const total = totals();
  const parTotal = course.pars.reduce((a, b) => a + b, 0);
  els.teamATotal.textContent = total.a;
  els.teamBTotal.textContent = total.b;
  applySignedClass(els.teamATotal, total.a);
  applySignedClass(els.teamBTotal, total.b);
  els.teamAMoney.textContent = money(total.a);
  els.teamBMoney.textContent = money(total.b);
  applySignedClass(els.teamAMoney, total.a);
  applySignedClass(els.teamBMoney, total.b);
  els.holesComplete.textContent = `${total.complete}/18`;
  els.coursePar.textContent = `Par ${parTotal}`;
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
      input.addEventListener('change', () => {
        state.scores[index][scoreIndex] = input.value;
        saveState();
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

    const useButton = document.createElement('button');
    useButton.type = 'button';
    useButton.textContent = 'Use';
    useButton.addEventListener('click', () => {
      state.courseId = course.id;
      saveState();
      render();
      switchView('play');
    });
    row.querySelector('.small-actions').append(useButton);

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
          setSyncState({ label: 'Sync failed', title: error.message, busy: false, ready: hasSupabaseConfig() });
        }
      });
      row.querySelector('.small-actions').append(deleteButton);
    }

    els.courseList.append(row);
  });
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

function renderHistory() {
  els.historyList.innerHTML = '';

  if (!savedRounds.length) {
    const empty = document.createElement('div');
    empty.className = 'empty-state';
    empty.textContent = 'No saved rounds';
    els.historyList.append(empty);
    return;
  }

  savedRounds.forEach(round => {
    const row = document.createElement('div');
    row.className = 'history-row';
    const date = new Date(round.savedAt);
    row.innerHTML = `
      <div>
        <strong></strong>
        <span></span>
      </div>
      <div class="small-actions"></div>
    `;
    row.querySelector('strong').textContent = round.name || round.courseName;
    row.querySelector('span').textContent = `${date.toLocaleDateString()} ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - A ${round.totals.a}, B ${round.totals.b}`;

    const loadButton = document.createElement('button');
    loadButton.type = 'button';
    loadButton.textContent = 'Load';
    loadButton.addEventListener('click', () => {
      ensureCourseFromRound(round);
      state = {
        courseId: round.courseId,
        players: round.players,
        pointValue: round.pointValue,
        birdieFlip: round.birdieFlip,
        scores: round.scores
      };
      saveState();
      render();
      switchView('play');
    });

    const deleteButton = document.createElement('button');
    deleteButton.type = 'button';
    deleteButton.className = 'danger';
    deleteButton.textContent = 'Delete';
    deleteButton.addEventListener('click', async () => {
      savedRounds = savedRounds.filter(item => item.id !== round.id);
      saveHistoryLocal();
      renderHistory();
      try {
        await deleteCloudRound(round.id);
        await syncFromCloud(false);
      } catch (error) {
        setSyncState({ label: 'Sync failed', title: error.message, busy: false, ready: hasSupabaseConfig() });
      }
    });

    row.querySelector('.small-actions').append(loadButton, deleteButton);
    els.historyList.append(row);
  });
}

function render() {
  renderCourseSelect();
  renderInputs();
  renderScoreStrip();
  renderHoles();
  renderCourses();
  renderHistory();
  renderSyncStatus();
}

function switchView(name) {
  document.querySelectorAll('.tab').forEach(tab => {
    tab.classList.toggle('active', tab.dataset.view === name);
  });
  document.querySelectorAll('.view').forEach(view => {
    view.classList.toggle('active', view.id === `${name}View`);
  });
}

function addListeners() {
  document.querySelectorAll('.tab').forEach(tab => {
    tab.addEventListener('click', () => switchView(tab.dataset.view));
  });

  els.syncNow.addEventListener('click', () => {
    syncFromCloud(true);
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

  els.clearRound.addEventListener('click', () => {
    state.scores = Array.from({ length: 18 }, () => ['', '', '', '']);
    saveState();
    render();
  });

  els.saveRound.addEventListener('click', async () => {
    const course = currentCourse();
    const name = roundDisplayName(course);
    const round = {
      id: `round-${Date.now()}`,
      savedAt: Date.now(),
      name,
      fileName: roundFileName(course),
      courseId: course.id,
      courseName: course.name,
      pars: course.pars,
      players: [...state.players],
      pointValue: state.pointValue,
      birdieFlip: state.birdieFlip,
      scores: state.scores.map(row => [...row]),
      totals: totals()
    };
    savedRounds = mergeRounds([round, ...savedRounds], []);
    saveHistoryLocal();
    renderHistory();
    switchView('history');
    try {
      await upsertCloudRound(round);
      await syncFromCloud(false);
    } catch (error) {
      setSyncState({ label: 'Sync failed', title: error.message, busy: false, ready: hasSupabaseConfig() });
    }
  });

  els.addCourse.addEventListener('click', () => {
    openCourseModal();
  });

  els.cancelCourse.addEventListener('click', () => {
    closeCourseModal();
  });

  els.cancelCourseBottom.addEventListener('click', () => {
    closeCourseModal();
  });

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
      setSyncState({ label: 'Sync failed', title: error.message, busy: false, ready: hasSupabaseConfig() });
    }
  });

  window.addEventListener('beforeinstallprompt', event => {
    event.preventDefault();
    deferredInstallPrompt = event;
    els.installButton.hidden = false;
  });

  els.installButton.addEventListener('click', async () => {
    if (!deferredInstallPrompt) return;
    deferredInstallPrompt.prompt();
    await deferredInstallPrompt.userChoice;
    deferredInstallPrompt = null;
    els.installButton.hidden = true;
  });
}

function init() {
  customCourses = loadJson(COURSE_KEY, []);
  savedRounds = loadJson(HISTORY_KEY, []);
  state = { ...state, ...loadJson(STORAGE_KEY, {}) };
  if (!Array.isArray(state.scores) || state.scores.length !== 18) {
    state.scores = Array.from({ length: 18 }, () => ['', '', '', '']);
  }
  if (!Array.isArray(state.players) || state.players.length !== 4) {
    state.players = ['Player 1', 'Player 2', 'Player 3', 'Player 4'];
  }
  if (hasSupabaseConfig()) {
    setSyncState({
      ready: true,
      busy: false,
      label: 'Cloud ready',
      title: `Supabase room: ${supabaseConfig().syncKey}`
    });
  }
  renderCourseParInputs();
  addListeners();
  render();
  syncFromCloud(true);
}

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js').catch(() => {});
  });
}

init();
