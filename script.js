let isEditingLogMode = false;
const STORAGE_KEY = 'trainingRecords';
const CURRENT_SCHEMA_VERSION = 'label-v4'; // ★ スキーマバージョンを更新して自動同期

// 初期メニュー構成データ
const initialDefaultMenus = [
  {
    id: 'A',
    title: '上半身（デコルテ・二の腕・肩）',
    memo: 'インターバル60〜90秒。限界まで追い込みすぎず、あと1〜2回できる余裕を残す。',
    exercises: [
      { name: 'インクラインプレス', detail: '軽いダンベル / 15~20回 × 3セット' },
      { name: 'ラットプルダウン', detail: '15~20回 × 3セット' },
      { name: 'ケーブルプレスダウン', detail: '15〜20回 × 3セット' },
      { name: 'サイドレイズ', detail: '自重〜1・2kg / 15〜20回 × 3セット' },
    ]
  },
  {
    id: 'B',
    title: '下半身（お尻・裏もも・腰）',
    memo: '前ももを使わず、もも裏とお尻の境目を作って小尻・脚長を狙う。',
    exercises: [
      { name: 'ルーマニアンデッドリフト', detail: 'バーベル/ダンベル / 15~20回 × 3セット' },
      { name: 'ブルガリアンスクワット', detail: '左右各12~15回 × 3セット' },
      { name: 'ヒップアブダクション（骨盤後傾）', detail: '20回 × 3セット' },
    ]
  },
  {
    id: 'C',
    title: '下半身（ヒップトップ・体幹・脂肪燃焼）',
    memo: 'お尻の高さを出しつつ、体脂肪削減を加速させる。',
    exercises: [
      { name: 'ヒップスラスト', detail: '15~20回 × 3セット' },
      { name: 'バックエクステンション', detail: '自重 / 15回 × 3セット' },
      { name: 'ハンギングレッグレイズ', detail: '自重 / 12〜15回 × 3セット' },
      { name: 'ヒップアブダクション（骨盤前傾）', detail: '15~20回 × 3セット' },
    ]
  },
  {
    id: 'D',
    title: '上半身（バストアップ＆二の腕メイン）',
    memo: 'デコルテのボリューム形成と二の腕のトーン調整に重点。',
    exercises: [
      { name: 'ダンベルフライ', detail: 'インクライン / 軽いダンベル / 15~20回 × 3セット' },
      { name: 'シーテッドローイング', detail: '15~20回 × 3セット' },
      { name: 'ケーブルトライセプスキックバック', detail: 'ケーブル軽め / 15〜20回 × 3セット' },
      { name: 'ケーブルフェイスプル', detail: 'ケーブル軽め / 15〜20回 × 3セット' },
    ]
  },
  {
    id: 'E',
    title: '下半身（裏ももストレッチ＆ヒップアップ）',
    memo: 'もも裏のストレッチ感を重視し、前ももの張りを予防しながらお尻を引き締める。',
    exercises: [
      { name: 'グルートキックバック', detail: 'ケーブル / 左右各15〜20回 × 3セット' },
      { name: 'グッドモーニング', detail: '空バー〜軽め / 15~20回 × 3セット' },
      { name: 'レッグカール', detail: 'ライイング・マシン軽め / 15~20回 × 3セット' },
      { name: 'ヒップアブダクション（骨盤立て）', detail: '15~20回 × 3セット' },
    ]
  },
  {
    id: 'F',
    title: 'リカバリー・有酸素',
    memo: '高頻度トレーニングの疲労を抜きつつ、有酸素運動で脂肪燃焼を促進。',
    exercises: [
      { name: '傾斜ウォーキング', detail: 'トレッドミル / 30〜40分 (傾斜5〜8%、時速4.0〜4.5km)' },
    ]
  }
];

const MENU_LABELS = {
  'A': '上', 'B': '下', 'C': '下', 'D': '上', 'E': '下', 'F': '🏃', 'ALL': '全', 'OFF': '休'
};

// ★ 主要種目のデフォルト器具パターン辞書
const DEFAULT_EQUIPMENT_PATTERNS = {
  // 胸
  'インクラインプレス': ['アイソラテラル', 'ダンベル', 'バーベル', 'スミス', 'スミスベンチ'],
  'ベンチプレス': ['バーベル', 'ダンベル', 'スミス', 'スーパースミス'],
  'ペックフライ': ['マシン', 'ケーブル', 'ダンベル'],
  'チェストプレス': ['マシン', 'スミス', 'スーパースミス'],
  'ケーブルクロス': ['ケーブル'],
  'ディップス': ['自重', 'アシストマシン', 'ウェイト付加'],
  'ダンベルフライ': ['ダンベル'],
  'ダンベルプレス': ['ダンベル'],

  // 背中
  'デッドリフト': ['バーベル', 'ダンベル', 'トラップバー'],
  'バックエクステンション': ['自重', 'マシン'],
  'ラットプルダウン': ['マシン', 'マググリップ', 'ケーブル'],
  'プーリーロー': ['ケーブル', 'マシン'],
  'チンニング（懸垂）': ['自重', 'アシストマシン', 'ウェイト付加'],
  'ベントオーバーロー': ['バーベル', 'ダンベル'],
  'シーテッドローイング': ['縦持ち(広背筋)', '横持ち(僧帽筋)', 'アイソラテラル', 'ケーブル', 'ダンベル'],

  // 脚
  'ルーマニアンデッドリフト': ['バーベル', 'ダンベル'],
  'アダクション': ['マシン', 'バンド'],
  'ブルガリアンスクワット': ['ダンベル', 'スミス', '自重'],
  'スクワット': ['バーベル', 'ハック', 'スミス', 'ダンベル', '自重'],
  'レッグプレス': ['シーテッド', '45度リニア'],
  'レッグエクステンション': ['マシン'],
  'レッグカール': ['マシン'],
  'グッドモーニング': ['バーベル', 'ダンベル'],

  // 肩
  'サイドレイズ': ['ダンベル', 'ケーブル'],
  'ショルダープレス': ['MTSマシン', 'ダンベル', 'バーベル', 'スミス'],
  'フロントレイズ': ['ダンベル', 'ケーブル', 'バーベル'],
  'ケーブルフェイスプル': ['ケーブル'],

  // 腕
  'バーベルカール': ['バーベル'],
  'アームカール': ['シーテッド台', 'ダンベル', 'バーベル', 'ケーブル'],
  'ケーブルプレスダウン': ['ケーブル'],
  'ケーブルトライセプスキックバック': ['ケーブル'],

  // お尻
  'ヒップアブダクション（骨盤前傾）': ['マシン', 'バンド'],
  'ヒップアブダクション（骨盤立て）': ['マシン', 'バンド'],
  'ヒップアブダクション（骨盤後傾）': ['マシン', 'バンド'],
  'ヒップスラスト': ['グルートドライブ', 'バーベル', 'スミス'],
  'グルートキックバック': ['ケーブル', 'マシン', 'バンド'],

  // 腹筋・体幹
  'アブドミナル': ['マシン'],
  'トーソローテーション': ['マシン'],
  'プランク': ['自重'],
  '上体起こし': ['自重', 'マシン'],
  'ハンギングレッグレイズ': ['自重'],

  // 全身・有酸素
  'クリーン': ['バーベル', 'ダンベル'],
  'スナッチ': ['バーベル', 'ダンベル'],
  'バーピー': ['自重'],
  'トレッドミル': ['マシン'],
  '傾斜ウォーキング': ['トレッドミル']
};

// アプリ全体の状態
let state = {
  theme: 'blue',
  menus: JSON.parse(JSON.stringify(initialDefaultMenus)),
  logs: [],
  calendarYear: new Date().getFullYear(),
  calendarMonth: new Date().getMonth(),
  editingMenuId: null,
  exerciseLabels: ['胸', '背中', '脚', '肩', '腕', 'お尻', '腹筋', '全身', '有酸素運動', 'その他'],
  exerciseLibrary: {},
  exerciseEquipment: {},
  inbodyLogs: [],
  inbodyMetric: 'weight'
};

function init() {
  loadState();
  applyTheme(state.theme);
  renderRecommendation();
  renderTodaySummary();
  renderCalendar();
  renderMenuTable();

  const libraryBtn = document.getElementById('btn-open-exercise-library');
  if (libraryBtn) {
    libraryBtn.addEventListener('click', openExerciseLibraryModal);
  }
}

function loadState() {
  const savedState = localStorage.getItem('workout_tracker_state');
  if (savedState) {
    const parsed = JSON.parse(savedState);
    if (parsed.theme) state.theme = parsed.theme;
    
    // メニューの同期
    if (parsed.menus) {
      state.menus = parsed.menus;
      const defaultMenuIds = ['A', 'B', 'C', 'D', 'E', 'F'];
      defaultMenuIds.forEach(id => {
        const defaultMenu = initialDefaultMenus.find(m => m.id === id);
        const savedMenu = state.menus.find(m => m.id === id);
        if (defaultMenu && savedMenu) {
          savedMenu.title = defaultMenu.title;
          savedMenu.memo = defaultMenu.memo;
          savedMenu.exercises = JSON.parse(JSON.stringify(defaultMenu.exercises));
        }
      });
    } else {
      state.menus = JSON.parse(JSON.stringify(initialDefaultMenus));
    }

    if (parsed.logs) state.logs = parsed.logs;
    state.inbodyLogs = parsed.inbodyLogs || [];
    state.exerciseLabels = ['胸', '背中', '脚', '肩', '腕', 'お尻', '腹筋', '全身', '有酸素運動', 'その他'];
    
    // ★ スキーマ更新時は最新のデフォルト分類を強制適用
    if (parsed.exerciseLibrarySchema === CURRENT_SCHEMA_VERSION && parsed.exerciseLibrary) {
      state.exerciseLibrary = parsed.exerciseLibrary;
    } else {
      state.exerciseLibrary = buildDefaultExerciseLibrary();
    }

    // 器具辞書を最新デフォルトとマージ
    state.exerciseEquipment = Object.assign(
      {},
      JSON.parse(JSON.stringify(DEFAULT_EQUIPMENT_PATTERNS)),
      parsed.exerciseEquipment || {}
    );
  } else {
    state.exerciseLibrary = buildDefaultExerciseLibrary();
    state.exerciseEquipment = JSON.parse(JSON.stringify(DEFAULT_EQUIPMENT_PATTERNS));
  }
}

function saveState() {
  localStorage.setItem('workout_tracker_state', JSON.stringify({
    theme: state.theme,
    menus: state.menus,
    logs: state.logs,
    exerciseLabels: state.exerciseLabels,
    exerciseLibrarySchema: CURRENT_SCHEMA_VERSION,
    exerciseLibrary: state.exerciseLibrary,
    exerciseEquipment: state.exerciseEquipment,
    inbodyLogs: state.inbodyLogs
  }));
}

function applyTheme(themeName) {
  document.body.classList.remove('theme-pink', 'theme-green', 'theme-lavender');
  if (themeName !== 'blue') {
    document.body.classList.add(`theme-${themeName}`);
  }
  state.theme = themeName;
}

function openThemeSettingsModal() {
  const grid = document.querySelector('.theme-select-grid');
  if (grid) {
    grid.querySelectorAll('.btn-theme-option').forEach(btn => {
      btn.classList.remove('active');
    });
    const currentBtn = grid.querySelector(`[onclick="changeTheme('${state.theme}')"]`);
    if (currentBtn) currentBtn.classList.add('active');
  }
  document.getElementById('theme-settings-modal').classList.add('active');
}

function closeThemeSettingsModal() {
  document.getElementById('theme-settings-modal').classList.remove('active');
}

function changeTheme(themeName) {
  applyTheme(themeName);
  saveState();
  openThemeSettingsModal();
}

function buildDefaultExerciseLibrary() {
  return {
    '胸': ['インクラインプレス', 'ベンチプレス', 'ペックフライ', 'チェストプレス', 'ケーブルクロス', 'ディップス', 'ダンベルフライ', 'ダンベルプレス'],
    '背中': ['デッドリフト', 'バックエクステンション', 'ラットプルダウン', 'プーリーロー', 'チンニング（懸垂）', 'ベントオーバーロー', 'シーテッドローイング'],
    '脚': ['ルーマニアンデッドリフト', 'アダクション', 'ブルガリアンスクワット', 'スクワット', 'レッグプレス', 'レッグエクステンション', 'レッグカール', 'グッドモーニング'],
    '肩': ['サイドレイズ', 'ショルダープレス', 'フロントレイズ', 'ケーブルフェイスプル'],
    '腕': ['バーベルカール', 'アームカール', 'ケーブルプレスダウン', 'ケーブルトライセプスキックバック'],
    'お尻': ['ヒップアブダクション（骨盤前傾）', 'ヒップアブダクション（骨盤立て）', 'ヒップアブダクション（骨盤後傾）', 'ヒップスラスト', 'グルートキックバック'],
    '腹筋': ['アブドミナル', 'トーソローテーション', 'プランク', '上体起こし', 'ハンギングレッグレイズ'],
    '全身': ['クリーン', 'スナッチ', 'バーピー'],
    '有酸素運動': ['トレッドミル', '傾斜ウォーキング'],
    'その他': []
  };
}

function renderRecommendation() {
  const calcDaysAgo = (category) => {
    const catLogs = state.logs.filter(l => {
      if (l.menuId === 'OFF') return false;
      const menu = state.menus.find(m => m.id === l.menuId);
      const title = menu ? menu.title : '';
      const isAll = l.menuId === 'ALL' || title.includes('全身');

      if (category === '上半身') return title.includes('上半身');
      if (category === '下半身') return title.includes('下半身');
      if (category === '全身') return isAll;
      if (category === '有酸素') return title.includes('有酸素') || title.includes('リカバリー') || l.menuId === 'F';
      return false;
    });

    if (catLogs.length === 0) return '未記録';

    const latestLog = catLogs[catLogs.length - 1];
    const [y, m, d] = latestLog.date.split('-');
    const lastDate = new Date(parseInt(y, 10), parseInt(m, 10) - 1, parseInt(d, 10));
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const diffTime = today - lastDate;
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return '今日';
    if (diffDays === 1) return '昨日';
    return `${diffDays}日前`;
  };

  const upperEl = document.getElementById('days-upper');
  const lowerEl = document.getElementById('days-lower');
  const fullEl = document.getElementById('days-full');
  const cardioEl = document.getElementById('days-cardio');

  if (upperEl) upperEl.textContent = `前回: ${calcDaysAgo('上半身')}`;
  if (lowerEl) lowerEl.textContent = `前回: ${calcDaysAgo('下半身')}`;
  if (fullEl) fullEl.textContent = `前回: ${calcDaysAgo('全身')}`;
  if (cardioEl) cardioEl.textContent = `前回: ${calcDaysAgo('有酸素')}`;
}

function renderTodaySummary() {
  const cardContainer = document.getElementById('today-summary-card');
  if (!cardContainer) return;

  const todayISO = getTodayISO();
  const todayLogIndex = state.logs.findIndex(l => l.date === todayISO);
  const todayLog = todayLogIndex !== -1 ? state.logs[todayLogIndex] : null;

  if (!todayLog) {
    cardContainer.innerHTML = `
      <div class="today-summary-header">
        <span class="today-summary-title">TODAY'S LOG</span>
        <span class="today-summary-date">${todayISO.replace(/-/g, '/')}</span>
      </div>
      <div class="today-summary-empty">本日の記録はまだありません</div>
    `;
    return;
  }

  let titleText = '';
  if (todayLog.menuId === 'OFF') {
    titleText = '☕ 今日はオフ';
  } else if (todayLog.menuId === 'ALL') {
    titleText = '全身トレーニング';
  } else {
    const menu = state.menus.find(m => m.id === todayLog.menuId);
    titleText = menu ? menu.title : todayLog.menuId;
  }

  let exListHTML = '';
  if (todayLog.menuId === 'OFF') {
    exListHTML = '<div class="today-summary-empty" style="padding:4px 0;">しっかり体を休めましょう！</div>';
  } else if (todayLog.exerciseLogs && Object.keys(todayLog.exerciseLogs).length > 0) {
    exListHTML = '<div class="today-summary-list">';
    for (const [exName, logVal] of Object.entries(todayLog.exerciseLogs)) {
      const cleanName = exName.replace('【追加】', '');
      const valArray = Array.isArray(logVal) ? logVal : [logVal];

      valArray.forEach(item => {
        const formatted = formatSingleLogObj(item);
        exListHTML += `
          <div class="today-summary-item">
            <span class="today-summary-ex-name">• ${cleanName}</span>
            <span class="today-summary-ex-val">${formatted}</span>
          </div>
        `;
      });
    }
    exListHTML += '</div>';
  } else {
    exListHTML = '<div class="today-summary-empty">種目の記録はありません</div>';
  }

  cardContainer.innerHTML = `
    <div class="today-summary-header">
      <div style="display:flex; align-items:center; gap:8px;">
        <span class="today-summary-title">TODAY'S LOG</span>
        <span class="today-summary-badge">${titleText}</span>
      </div>
      <button type="button" class="btn-table-edit" style="padding:3px 10px; font-size:0.72rem;" onclick="openDetailLogModal(${todayLogIndex})">確認・編集</button>
    </div>
    ${exListHTML}
  `;
}

function getLastExerciseLogObj(exerciseName) {
  for (let i = state.logs.length - 1; i >= 0; i--) {
    const log = state.logs[i];
    if (log.exerciseLogs && log.exerciseLogs[exerciseName] !== undefined) {
      const val = log.exerciseLogs[exerciseName];
      if (Array.isArray(val) && val.length > 0) {
        return val[val.length - 1];
      } else if (typeof val === 'object' && val !== null) {
        return val;
      }
    }
  }
  return null;
}

function getLastExerciseEquipLogObj(exerciseName, equipment = '') {
  for (let i = state.logs.length - 1; i >= 0; i--) {
    const log = state.logs[i];
    if (log.exerciseLogs && log.exerciseLogs[exerciseName] !== undefined) {
      const val = log.exerciseLogs[exerciseName];
      const valArray = Array.isArray(val) ? val : [val];

      for (let j = valArray.length - 1; j >= 0; j--) {
        const item = valArray[j];
        if (!equipment || (item.equipment || '') === equipment) {
          return item;
        }
      }
    }
  }
  return equipment ? null : getLastExerciseLogObj(exerciseName);
}

function fillSetsContainerFromItem(block, item) {
  const setsContainer = block.querySelector('.sets-container');
  if (!setsContainer || !item) return;

  setsContainer.innerHTML = '';

  const setsToRestore = (Array.isArray(item.setsArray) && item.setsArray.length > 0)
    ? item.setsArray
    : [{ weight: item.weight, reps: item.reps, isPartial: item.isPartial }];

  setsToRestore.forEach(s => {
    addSetRowToBlock(
      block,
      s.weight !== undefined && s.weight !== null ? s.weight : '',
      s.reps !== undefined && s.reps !== null ? s.reps : '',
      s.isPartial === true
    );
  });
}

function formatSingleLogObj(logObj, showEquipBadge = true) {
  if (!logObj) return '';

  const equipBadge = (showEquipBadge && logObj.equipment) ? ` [${logObj.equipment}]` : '';

  if (logObj.isCardio || logObj.minutes !== undefined || logObj.calories !== undefined) {
    const parts = [];
    if (logObj.minutes) parts.push(`${logObj.minutes}分`);
    if (logObj.calories) parts.push(`(${logObj.calories}kcal)`);
    return parts.join(' ') + equipBadge;
  }

  if (logObj.setsArray && Array.isArray(logObj.setsArray) && logObj.setsArray.length > 0) {
    const groupedSets = [];
    let currentGroup = null;

    logObj.setsArray.forEach(set => {
      const isP = set.isPartial === true;
      if (
        currentGroup &&
        currentGroup.weight === set.weight &&
        currentGroup.reps === set.reps &&
        currentGroup.isPartial === isP
      ) {
        currentGroup.count++;
      } else {
        if (currentGroup) {
          groupedSets.push(currentGroup);
        }
        currentGroup = {
          weight: set.weight,
          reps: set.reps,
          isPartial: isP,
          count: 1
        };
      }
    });
    if (currentGroup) groupedSets.push(currentGroup);

    const formatted = groupedSets.map(g => {
      const partialTag = g.isPartial ? '(P)' : '';
      const baseText = `${g.weight}kg×${g.reps}回${partialTag}`;
      return g.count > 1 ? `${baseText} × ${g.count}set` : baseText;
    });

    return formatted.join(', ') + equipBadge;
  }

  const parts = [];
  if (logObj.weight !== null && logObj.weight !== undefined && logObj.weight !== '') parts.push(`${logObj.weight}kg`);
  if (logObj.reps) parts.push(`${logObj.reps}回`);
  return parts.join(' × ') + equipBadge;
}

function renderMenuTable() {
  const tbody = document.getElementById('menu-table-body');
  if (!tbody) return;

  tbody.innerHTML = '';

  const getMenuGroupOrder = (menu) => {
    if (menu.title.includes('上半身')) return 1;
    if (menu.title.includes('下半身')) return 2;
    if (menu.title.includes('有酸素') || menu.title.includes('リカバリー')) return 3;
    return 9;
  };

  const sortedMenus = [...state.menus].sort((a, b) => {
    const orderA = getMenuGroupOrder(a);
    const orderB = getMenuGroupOrder(b);
    if (orderA !== orderB) return orderA - orderB;
    return a.id.localeCompare(b.id);
  });

  sortedMenus.forEach(menu => {
    const tr = document.createElement('tr');

    let exListHTML = menu.exercises.map(e => `
      <div class="table-ex-item">
        <span class="table-ex-name">• ${e.name}</span> 
        <span class="table-ex-meta">${e.detail}</span>
      </div>
    `).join('');

    tr.innerHTML = `
      <td data-label="メニュー"><span class="menu-badge menu-badge-${menu.id}">${menu.id}</span></td>
      <td data-label="対象部位"><strong>${menu.title}</strong></td>
      <td data-label="種目と設定">${exListHTML}</td>
      <td data-label="メモ" style="color:var(--text-sub); font-size:0.78rem;">${menu.memo || '-'}</td>
      <td data-label=""><button class="btn-table-edit" onclick="openEditModal('${menu.id}')">編集する</button></td>
    `;

    tbody.appendChild(tr);
  });
}

function recordOffDay() {
  const todayISO = getTodayISO();
  state.logs = state.logs.filter(l => l.date !== todayISO);
  state.logs.push({ date: todayISO, menuId: 'OFF', exerciseLogs: {} });

  saveState();
  renderRecommendation();
  renderTodaySummary();
  renderCalendar();
}

function renderEquipmentChips(blockEl, exerciseName, selectedEquip = '') {
  const equipContainer = blockEl.querySelector('.equipment-select-row');
  if (!equipContainer) return;

  if (!exerciseName) {
    equipContainer.innerHTML = '';
    equipContainer.style.display = 'none';
    return;
  }

  equipContainer.style.display = 'flex';

  let patterns = state.exerciseEquipment[exerciseName] || DEFAULT_EQUIPMENT_PATTERNS[exerciseName];
  if (!patterns) {
    const matchedKey = Object.keys(DEFAULT_EQUIPMENT_PATTERNS).find(key => exerciseName.includes(key) || key.includes(exerciseName));
    patterns = matchedKey ? DEFAULT_EQUIPMENT_PATTERNS[matchedKey] : ['マシン', 'ダンベル', 'バーベル', 'ケーブル', '自重'];
  }

  const isCustomValue = selectedEquip && !patterns.includes(selectedEquip);

  let chipsHTML = patterns.map(eq => {
    const isActive = selectedEquip === eq ? 'active' : '';
    return `<button type="button" class="equipment-chip-btn ${isActive}" onclick="selectEquipmentChip(this, '${eq}')">${eq}</button>`;
  }).join('');

  equipContainer.innerHTML = `
    <span style="font-size:0.72rem; color:var(--text-sub); font-weight:700; flex-shrink:0;">器具:</span>
    <div class="equipment-chips-list">
      ${chipsHTML}
    </div>
    <input type="text" class="form-input extra-equip-input" value="${isCustomValue ? selectedEquip : ''}" placeholder="その他" oninput="onCustomEquipInput(this)">
  `;

  equipContainer.dataset.selectedEquip = selectedEquip || '';
}

function selectEquipmentChip(btnEl, equipName) {
  const block = btnEl.closest('.extra-log-block');
  const row = btnEl.closest('.equipment-select-row');
  const input = row.querySelector('.extra-equip-input');
  const allBtns = row.querySelectorAll('.equipment-chip-btn');
  const nameSelect = block.querySelector('.extra-name-select');
  const nameInput = block.querySelector('.extra-name-input');
  const exName = (nameSelect && nameSelect.value) ? nameSelect.value : (nameInput ? nameInput.value : '');

  let chosenEquip = '';

  if (btnEl.classList.contains('active')) {
    btnEl.classList.remove('active');
    if (input) input.value = '';
    chosenEquip = '';
  } else {
    allBtns.forEach(b => b.classList.remove('active'));
    btnEl.classList.add('active');
    if (input) input.value = equipName;
    chosenEquip = equipName;
  }

  row.dataset.selectedEquip = chosenEquip;

  if (exName) {
    const lastObj = getLastExerciseEquipLogObj(exName, chosenEquip);
    const holder = block.querySelector('.last-btn-holder');
    if (lastObj) {
      if (holder) {
        const formatted = formatSingleLogObj(lastObj, false);
        holder.innerHTML = `<div style="font-size:0.72rem; color:var(--primary-hover); font-weight:700; margin-bottom:4px; padding-left:2px;">前回(${chosenEquip || '指定なし'}): ${formatted}</div>`;
      }
      fillSetsContainerFromItem(block, lastObj);
    } else if (holder) {
      holder.innerHTML = `<div style="font-size:0.72rem; color:var(--text-sub); font-weight:700; margin-bottom:4px; padding-left:2px;">前回(${chosenEquip || '指定なし'}): 記録なし</div>`;
    }
  }
}

function onCustomEquipInput(inputEl) {
  const block = inputEl.closest('.extra-log-block');
  const row = inputEl.closest('.equipment-select-row');
  const allBtns = row.querySelectorAll('.equipment-chip-btn');
  allBtns.forEach(b => b.classList.remove('active'));

  const equipName = inputEl.value.trim();
  row.dataset.selectedEquip = equipName;
  const nameSelect = block.querySelector('.extra-name-select');
  const nameInput = block.querySelector('.extra-name-input');
  const exName = (nameSelect && nameSelect.value) ? nameSelect.value : (nameInput ? nameInput.value : '');

  const holder = block.querySelector('.last-btn-holder');
  if (exName && equipName) {
    const lastObj = getLastExerciseEquipLogObj(exName, equipName);
    if (lastObj) {
      if (holder) {
        const formatted = formatSingleLogObj(lastObj, false);
        holder.innerHTML = `<div style="font-size:0.72rem; color:var(--primary-hover); font-weight:700; margin-bottom:4px; padding-left:2px;">前回(${equipName}): ${formatted}</div>`;
      }
      fillSetsContainerFromItem(block, lastObj);
    } else if (holder) {
      holder.innerHTML = `<div style="font-size:0.72rem; color:var(--text-sub); font-weight:700; margin-bottom:4px; padding-left:2px;">前回(${equipName}): 記録なし</div>`;
    }
  }
}

function openWorkoutLogModal(defaultMenuId, presetDateISO, isEdit = false) {
  isEditingLogMode = isEdit;
  const targetDate = presetDateISO || getTodayISO();
  const existingLog = state.logs.find(l => l.date === targetDate);

  const selectEl = document.getElementById('select-log-menu');
  selectEl.innerHTML = '';

  const allOption = document.createElement('option');
  allOption.value = 'ALL';
  allOption.textContent = '全身（部位ミックス・自由入力）';
  selectEl.appendChild(allOption);

  const getMenuGroupOrder = (menu) => {
    if (menu.title.includes('上半身')) return 1;
    if (menu.title.includes('下半身')) return 2;
    if (menu.title.includes('有酸素') || menu.title.includes('リカバリー')) return 3;
    return 9;
  };

  const sortedMenus = [...state.menus].sort((a, b) => {
    const orderA = getMenuGroupOrder(a);
    const orderB = getMenuGroupOrder(b);
    if (orderA !== orderB) return orderA - orderB;
    return a.id.localeCompare(b.id);
  });

  sortedMenus.forEach(menu => {
    const option = document.createElement('option');
    option.value = menu.id;
    option.textContent = menu.title;
    selectEl.appendChild(option);
  });

  const dateEl = document.getElementById('select-log-date');
  if (dateEl) {
    dateEl.value = targetDate;
    dateEl.max = getTodayISO();
  }

  let currentMenuId = defaultMenuId;

  if (isEdit && existingLog) {
    if (existingLog.menuId === 'OFF') {
      document.getElementById('record-type-off').checked = true;
    } else if (existingLog.recordType === 'menu') {
      document.getElementById('record-type-menu').checked = true;
      currentMenuId = existingLog.menuId;
    } else {
      document.getElementById('record-type-free').checked = true;
      currentMenuId = existingLog.menuId;
    }
  } else {
    if (defaultMenuId === 'OFF') {
      document.getElementById('record-type-off').checked = true;
    } else {
      document.getElementById('record-type-menu').checked = true;
    }
  }

  if (currentMenuId) selectEl.value = currentMenuId;

  const suggestedContainer = document.getElementById('suggested-fields-container');
  if (suggestedContainer) suggestedContainer.innerHTML = '';
  
  const extraContainer = document.getElementById('extra-exercise-container');
  if (extraContainer) extraContainer.innerHTML = '';

  toggleRecordType();

  const activeMenuId = (selectEl.value === 'OFF' || selectEl.value === 'ALL' || !selectEl.value) ? 'A' : selectEl.value;
  renderWorkoutLogInputs(activeMenuId);

  if (isEdit && existingLog && existingLog.exerciseLogs && existingLog.menuId !== 'OFF') {
    const isFree = existingLog.recordType === 'free';    
    for (const [exName, logVal] of Object.entries(existingLog.exerciseLogs)) {
      const valArray = Array.isArray(logVal) ? logVal : [logVal];
      
      valArray.forEach(item => {
        const itemIsCardio = item.isCardio === true || (item.weight === undefined && item.reps === undefined && item.minutes !== undefined);

        if (!isFree) {
          addSuggestedExerciseInput(exName, '', selectEl.value, itemIsCardio, item.equipment);
          const container = document.getElementById('suggested-fields-container');
          const lastBlock = container ? container.lastElementChild : null;
          if (lastBlock) {
            if (itemIsCardio) {
              const minInput = lastBlock.querySelector('.extra-minutes');
              const calInput = lastBlock.querySelector('.extra-calories');
              if (minInput) minInput.value = item.minutes !== undefined ? item.minutes : '';
              if (calInput) calInput.value = item.calories !== undefined ? item.calories : '';
            } else {
              fillSetsContainerFromItem(lastBlock, item);
            }
          }
        } else {
          addExtraExerciseInput(item.equipment);
          const container = document.getElementById('extra-exercise-container');
          const currentBlock = container ? container.lastElementChild : null;
          
          if (currentBlock) {
            let foundLabel = item.label;
            if (!foundLabel) {
              for (const [lbl, names] of Object.entries(state.exerciseLibrary)) {
                if (names.includes(exName)) {
                  foundLabel = lbl;
                  break;
                }
              }
            }

            if (foundLabel) {
              const labelSelect = currentBlock.querySelector('.extra-label-select');
              if (labelSelect) {
                labelSelect.value = foundLabel;
                renderExerciseChipsForBlock(currentBlock);
              }
            }

            const nameSelect = currentBlock.querySelector('.extra-name-select');
            if (nameSelect) {
              let hasOption = Array.from(nameSelect.options).some(opt => opt.value === exName);
              if (!hasOption) {
                const newOpt = document.createElement('option');
                newOpt.value = exName;
                newOpt.textContent = exName;
                nameSelect.appendChild(newOpt);
              }
              nameSelect.value = exName;
              renderEquipmentChips(currentBlock, exName, item.equipment || '');
            }

            if (itemIsCardio) {
              const minInput = currentBlock.querySelector('.extra-minutes');
              const calInput = currentBlock.querySelector('.extra-calories');
              if (minInput) minInput.value = item.minutes !== undefined ? item.minutes : '';
              if (calInput) calInput.value = item.calories !== undefined ? item.calories : '';
            } else {
              fillSetsContainerFromItem(currentBlock, item);
            }
          }
        }
      });
    }
  }

  document.getElementById('workout-log-modal').classList.add('active');
}

function toggleRecordType() {
  const isFree = document.getElementById('record-type-free').checked;
  const isOff = document.getElementById('record-type-off').checked;

  const selectMenuLabel = document.getElementById('select-log-menu-label');
  const selectMenu = document.getElementById('select-log-menu');
  const logInputs = document.getElementById('workout-log-inputs');
  const freeSection = document.getElementById('free-exercise-section');
  const extraLabel = document.getElementById('extra-exercise-label');
  const addExtraBtn = freeSection ? freeSection.querySelector('.btn-add-extra') : null;

  if (isOff) {
    selectMenuLabel.style.display = 'none';
    selectMenu.style.display = 'none';
    logInputs.style.display = 'none';
    freeSection.style.display = 'none';
  } else if (isFree) {
    selectMenuLabel.style.display = 'block';
    selectMenu.style.display = 'block';
    logInputs.style.display = 'none';
    freeSection.style.display = 'block';

    selectMenuLabel.textContent = '対象部位';
    if (extraLabel) extraLabel.textContent = '実施した種目（▲▼ボタンで並び替え）';
    if (addExtraBtn) addExtraBtn.style.display = 'inline-block';
  } else {
    selectMenuLabel.style.display = 'block';
    selectMenu.style.display = 'block';
    logInputs.style.display = 'block';
    freeSection.style.display = 'block';

    selectMenuLabel.textContent = 'メニュー選択';
    if (extraLabel) extraLabel.textContent = '';
    if (addExtraBtn) addExtraBtn.style.display = 'none';
  }
}

function onLogMenuSelectChange(selectedMenuId) {
  renderWorkoutLogInputs(selectedMenuId);
}

function renderWorkoutLogInputs(menuId) {
  const menu = state.menus.find(m => m.id === menuId);
  const container = document.getElementById('workout-log-inputs');
  if (!container) return;

  const existingFieldsContainer = document.getElementById('suggested-fields-container');
  const existingCards = existingFieldsContainer ? Array.from(existingFieldsContainer.children) : [];

  container.innerHTML = '';

  if (!menu || !menu.exercises || menu.exercises.length === 0) return;

  const headerRow = document.createElement('div');
  headerRow.style.cssText = 'display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;';
  headerRow.innerHTML = `
    <label class="form-label" style="margin-bottom: 0;">メニュー種目（▲▼で並び替え）</label>
    <button type="button" class="btn-add-extra" style="width: auto; padding: 6px 12px; font-size: 0.8125rem;" onclick="addExtraExerciseInput()">+ 種目を追加</button>
  `;
  container.appendChild(headerRow);

  const detailsEl = document.createElement('details');
  detailsEl.className = 'menu-suggest-toggle';
  detailsEl.open = true;
  detailsEl.style.cssText = 'margin-bottom: 10px; background: var(--primary-soft); border-radius: 12px; overflow: hidden; border: 1px solid var(--border-color);';

  const summaryEl = document.createElement('summary');
  summaryEl.style.cssText = 'padding: 8px 12px; font-size: 0.8125rem; font-weight: 700; color: var(--primary-hover); cursor: pointer; user-select: none; display: flex; justify-content: space-between; align-items: center;';
  summaryEl.innerHTML = `<span>💡 ${menu.title} の種目候補</span><span style="font-size: 0.75rem; color: var(--text-sub);">▾</span>`;
  detailsEl.appendChild(summaryEl);

  const chipList = document.createElement('div');
  chipList.className = 'exercise-chip-list';
  chipList.style.cssText = 'padding: 8px 12px 10px; margin-bottom: 0; display: flex; flex-wrap: wrap; gap: 6px; border-top: 1px dashed var(--border-color);';

  menu.exercises.forEach(e => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'exercise-chip';
    btn.textContent = `+ ${e.name}`;
    btn.onclick = () => {
      addSuggestedExerciseInput(e.name, e.detail, menuId);
    };
    chipList.appendChild(btn);
  });

  detailsEl.appendChild(chipList);
  container.appendChild(detailsEl);

  const fieldsContainer = document.createElement('div');
  fieldsContainer.id = 'suggested-fields-container';
  existingCards.forEach(card => fieldsContainer.appendChild(card));
  container.appendChild(fieldsContainer);

  makeSortable(fieldsContainer);
}

function addSuggestedExerciseInput(exerciseName, detailStr = '', menuId = '', forceCardio = null, initEquip = '') {
  const container = document.getElementById('suggested-fields-container');
  const lastObj = getLastExerciseLogObj(exerciseName) || {};

  let isCardio = false;
  if (forceCardio !== null && forceCardio !== undefined) {
    isCardio = forceCardio;
  } else {
    const nameLower = exerciseName.toLowerCase();
    isCardio = nameLower.includes('ウォーキング') || nameLower.includes('ランニング') || nameLower.includes('トレッドミル') || nameLower.includes('有酸素');
  }

  const block = document.createElement('div');
  block.className = 'extra-log-block';

  const lastFormatted = formatSingleLogObj(lastObj);
  const lastBadgeHTML = lastFormatted 
    ? `<div class="last-btn-holder" style="font-size:0.72rem; color:var(--primary-hover); font-weight:700; margin-bottom:4px; padding-left:2px;">前回: ${lastFormatted}</div>` 
    : '<div class="last-btn-holder" style="font-size:0.72rem; color:var(--text-sub); margin-bottom:4px; padding-left:2px;">前回: なし</div>';

  const moveBtnsHTML = `
    <div class="move-btn-group">
      <button type="button" class="btn-move-row" onclick="moveBlock(this, -1)">▲</button>
      <button type="button" class="btn-move-row" onclick="moveBlock(this, 1)">▼</button>
    </div>
  `;

  if (isCardio) {
    block.innerHTML = `
      ${lastBadgeHTML}
      <div class="extra-title-row" style="display: flex; align-items: center; justify-content: space-between; gap: 8px; margin-bottom: 8px;">
        ${moveBtnsHTML}
        <input type="text" class="form-input extra-name-input" value="${exerciseName}" readonly style="font-weight:700; background-color:var(--primary-soft); color:var(--text-main); margin-bottom:0; flex: 1;">
        <button type="button" class="btn-remove-row" onclick="this.closest('.extra-log-block').remove()">&times;</button>
      </div>
      <div class="direct-input-group" data-cardio="true">
        <div class="direct-field"><label>時間 (分)</label><input type="number" class="extra-minutes" value="${lastObj.minutes !== undefined ? lastObj.minutes : 30}"></div>
        <div class="direct-field"><label>カロリー(kcal)</label><input type="number" class="extra-calories" value="${lastObj.calories !== undefined ? lastObj.calories : ''}"></div>
      </div>
    `;
  } else {
    block.innerHTML = `
      ${lastBadgeHTML}
      <div class="extra-title-row" style="display: flex; align-items: center; justify-content: space-between; gap: 8px; margin-bottom: 8px;">
        ${moveBtnsHTML}
        <input type="text" class="form-input extra-name-input" value="${exerciseName}" readonly style="font-weight:700; background-color:var(--primary-soft); color:var(--text-main); margin-bottom:0; flex: 1;">
        <button type="button" class="btn-remove-row" onclick="this.closest('.extra-log-block').remove()">&times;</button>
      </div>
      <div class="equipment-select-row"></div>
      <div class="sets-container"></div>
      <button type="button" class="btn-add-set-row" onclick="addSetRowToBlock(this.closest('.extra-log-block'))">＋ セットを追加</button>
    `;
    
    renderEquipmentChips(block, exerciseName, initEquip || lastObj.equipment || '');

    if (lastObj && (Array.isArray(lastObj.setsArray) || lastObj.weight !== undefined)) {
      fillSetsContainerFromItem(block, lastObj);
    } else {
      for (let s = 1; s <= 3; s++) {
        addSetRowToBlock(block);
      }
    }
  }

  container.appendChild(block);
  makeSortable(container);
}

function addSetRowToBlock(blockEl, initWeight = null, initReps = null, initPartial = false) {
  const setsContainer = blockEl.querySelector('.sets-container');
  if (!setsContainer) return;

  const setNum = setsContainer.children.length + 1;
  
  let w = initWeight;
  let r = initReps;
  let isPartial = initPartial;

  if (w === null || r === null) {
    const lastRow = setsContainer.lastElementChild;
    if (lastRow) {
      w = lastRow.querySelector('.set-weight').value;
      r = lastRow.querySelector('.set-reps').value;
      isPartial = lastRow.querySelector('.btn-partial-toggle').classList.contains('active');
    }
  }

  const setRow = document.createElement('div');
  setRow.className = 'set-input-row';
  setRow.innerHTML = `
    <span class="set-label">${setNum}set</span>
    <div class="set-field-group">
      <input type="number" class="form-input set-weight" step="0.5" value="${w !== null ? w : ''}" placeholder="0"><span class="set-unit">kg</span>
      <input type="number" class="form-input set-reps" value="${r !== null ? r : ''}" placeholder="0"><span class="set-unit">回</span>
      <button type="button" class="btn-partial-toggle ${isPartial ? 'active' : ''}" onclick="togglePartial(this)">P</button>
      <button type="button" class="btn-remove-set" onclick="removeSetRow(this)" title="このセットを削除">&times;</button>
    </div>
  `;

  setsContainer.appendChild(setRow);
}

function togglePartial(btnEl) {
  btnEl.classList.toggle('active');
}

function removeSetRow(btnEl) {
  const row = btnEl.closest('.set-input-row');
  const container = row ? row.parentElement : null;
  if (row) row.remove();

  if (container) {
    const rows = container.querySelectorAll('.set-input-row');
    rows.forEach((r, idx) => {
      const label = r.querySelector('.set-label');
      if (label) label.textContent = `${idx + 1}set`;
    });
  }
}

function addExtraExerciseInput(initEquip = '') {
  const isFree = document.getElementById('record-type-free') ? document.getElementById('record-type-free').checked : false;
  
  let container = isFree ? document.getElementById('extra-exercise-container') : document.getElementById('suggested-fields-container');
  if (!container) {
    container = document.getElementById('extra-exercise-container') || document.getElementById('workout-log-inputs');
  }

  const block = document.createElement('div');
  block.className = 'extra-log-block';

  const labelOptionsHTML = state.exerciseLabels.map(label => `<option value="${label}">${label}</option>`).join('');

  block.innerHTML = `
    <div style="display: flex; gap: 8px; align-items: flex-end; margin-bottom: 8px;">
      <div class="move-btn-group" style="margin-bottom: 4px;">
        <button type="button" class="btn-move-row" onclick="moveBlock(this, -1)">▲</button>
        <button type="button" class="btn-move-row" onclick="moveBlock(this, 1)">▼</button>
      </div>
      <div style="flex: 1;">
        <label class="extra-label-select-label">部位（ラベル）</label>
        <select class="form-input extra-label-select" style="margin-bottom: 0;" onchange="renderExerciseChipsForBlock(this.closest('.extra-log-block'))">
          ${labelOptionsHTML}
        </select>
      </div>
      <button type="button" class="btn-remove-row" onclick="this.closest('.extra-log-block').remove()">&times;</button>
    </div>
    
    <div class="extra-chip-list"></div>
    <div class="equipment-select-row"></div>
    <div class="extra-fields-container"></div>
  `;

  container.appendChild(block);
  renderExerciseChipsForBlock(block, initEquip);
  makeSortable(container);
  block.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

function makeSortable(containerEl) {
  if (!containerEl) return;
  let draggingItem = null;

  containerEl.querySelectorAll('.extra-log-block, .exercise-row').forEach(item => {
    item.draggable = true;

    item.ondragstart = (e) => {
      draggingItem = item;
      item.classList.add('dragging');
      e.dataTransfer.effectAllowed = 'move';
    };

    item.ondragend = () => {
      draggingItem = null;
      item.classList.remove('dragging');
    };

    item.ondragover = (e) => {
      e.preventDefault();
      const afterElement = getDragAfterElement(containerEl, e.clientY);
      if (afterElement == null) {
        containerEl.appendChild(draggingItem);
      } else {
        containerEl.insertBefore(draggingItem, afterElement);
      }
    };
  });
}

function getDragAfterElement(container, y) {
  const draggableElements = [...container.querySelectorAll('.extra-log-block:not(.dragging), .exercise-row:not(.dragging)')];

  return draggableElements.reduce((closest, child) => {
    const box = child.getBoundingClientRect();
    const offset = y - box.top - box.height / 2;
    if (offset < 0 && offset > closest.offset) {
      return { offset: offset, element: child };
    } else {
      return closest;
    }
  }, { offset: Number.NEGATIVE_INFINITY }).element;
}

function renderExerciseChipsForBlock(block, initEquip = '') {
  const label = block.querySelector('.extra-label-select').value;
  const chipList = block.querySelector('.extra-chip-list');
  const fieldsContainer = block.querySelector('.extra-fields-container');
  const equipContainer = block.querySelector('.equipment-select-row');

  const isCardio = (label === '有酸素運動');

  if (equipContainer) {
    equipContainer.style.display = isCardio ? 'none' : 'flex';
  }

  if (isCardio) {
    fieldsContainer.innerHTML = `
      <div class="direct-input-group" data-cardio="true">
        <div class="direct-field">
          <label>時間 (分)</label>
          <input type="number" class="extra-minutes" inputmode="numeric" placeholder="30">
        </div>
        <div class="direct-field">
          <label>消費カロリー (kcal)</label>
          <input type="number" class="extra-calories" inputmode="numeric" placeholder="150">
        </div>
      </div>
    `;
  } else {
    fieldsContainer.innerHTML = `
      <div class="sets-container"></div>
      <button type="button" class="btn-add-set-row" onclick="addSetRowToBlock(this.closest('.extra-log-block'))">＋ セットを追加</button>
    `;
    for (let s = 1; s <= 3; s++) addSetRowToBlock(block);
  }

  const names = state.exerciseLibrary[label] || [];

  if (names.length === 0) {
    chipList.innerHTML = `<span class="exercise-chip-empty">まだ種目がありません（設定 📋 から追加できます）</span>`;
    return;
  }

  let optionsHTML = '<option value="">-- 種目を選択 --</option>';
  names.forEach(name => {
    optionsHTML += `<option value="${name}">${name}</option>`;
  });

  chipList.innerHTML = `
    <div style="margin-bottom: 8px;">
      <div class="last-btn-holder"></div>
      <label class="extra-label-select-label" style="margin-bottom: 4px; display: block;">種目名</label>
      <select class="form-input extra-name-select" style="margin-bottom: 0; font-weight: 700;">
        ${optionsHTML}
      </select>
    </div>
  `;

  const nameSelect = chipList.querySelector('.extra-name-select');
  const holder = chipList.querySelector('.last-btn-holder');

  nameSelect.addEventListener('change', (e) => {
    const selectedName = e.target.value;
    holder.innerHTML = '';
    if (selectedName) {
      const lastObj = getLastExerciseLogObj(selectedName);
      if (lastObj) {
        const formatted = formatSingleLogObj(lastObj);
        const badge = document.createElement('div');
        badge.style.cssText = 'font-size:0.72rem; color:var(--primary-hover); font-weight:700; margin-bottom:4px;';
        badge.textContent = `前回: ${formatted}`;
        holder.appendChild(badge);
      }
      renderEquipmentChips(block, selectedName, initEquip || (lastObj ? lastObj.equipment : ''));
      prefillLastLogValues(block, selectedName);
    }
  });
}

function prefillLastLogValues(block, name) {
  const lastObj = getLastExerciseLogObj(name);
  if (!lastObj) return;

  const minInput = block.querySelector('.extra-minutes');
  const calInput = block.querySelector('.extra-calories');

  if (minInput && lastObj.minutes !== undefined && lastObj.minutes !== null) minInput.value = lastObj.minutes;
  if (calInput && lastObj.calories !== undefined && lastObj.calories !== null) calInput.value = lastObj.calories;

  if (!minInput) fillSetsContainerFromItem(block, lastObj);
}

function closeWorkoutLogModal() {
  document.getElementById('workout-log-modal').classList.remove('active');
}

function submitWorkoutLog() {
  const isOff = document.getElementById('record-type-off').checked;
  const isFree = document.getElementById('record-type-free').checked;
  const dateEl = document.getElementById('select-log-date');
  const selectedISO = (dateEl && dateEl.value) ? dateEl.value : getTodayISO();

  if (isOff) {
    state.logs = state.logs.filter(l => l.date !== selectedISO);
    state.logs.push({ date: selectedISO, menuId: 'OFF', exerciseLogs: {} });
    state.logs.sort((a, b) => a.date.localeCompare(b.date));
    saveState();
    renderRecommendation();
    renderTodaySummary();
    renderCalendar();
    renderMenuTable();
    closeWorkoutLogModal();
    return;
  }

  const selectedMenuId = document.getElementById('select-log-menu').value;
  let finalExerciseLogs = {};

  const appendExerciseLog = (key, dataObj) => {
    if (!finalExerciseLogs[key]) {
      finalExerciseLogs[key] = [];
    } else if (!Array.isArray(finalExerciseLogs[key])) {
      finalExerciseLogs[key] = [finalExerciseLogs[key]];
    }
    finalExerciseLogs[key].push(dataObj);
  };

  const containerId = isFree ? 'extra-exercise-container' : 'suggested-fields-container';
  const blocks = document.querySelectorAll(`#${containerId} .extra-log-block`);

  blocks.forEach(block => {
    const nameSelect = block.querySelector('.extra-name-select');
    const nameInput = block.querySelector('.extra-name-input');
    let name = nameSelect && nameSelect.value ? nameSelect.value.trim() : (nameInput ? nameInput.value.trim() : '');

    const minInput = block.querySelector('.extra-minutes');
    const setRows = block.querySelectorAll('.set-input-row');

    const equipRow = block.querySelector('.equipment-select-row');
    const equipInput = block.querySelector('.extra-equip-input');
    const equipFromDataset = equipRow ? (equipRow.dataset.selectedEquip || '') : '';
    const equipment = equipFromDataset || (equipInput ? equipInput.value.trim() : '');

    if (name && equipment) {
      if (!state.exerciseEquipment[name]) {
        state.exerciseEquipment[name] = [];
      }
      if (!state.exerciseEquipment[name].includes(equipment)) {
        state.exerciseEquipment[name].push(equipment);
      }
    }

    if (name) {
      if (minInput) {
        const calories = block.querySelector('.extra-calories').value;
        appendExerciseLog(name, {
          isCardio: true,
          minutes: minInput.value !== '' ? parseInt(minInput.value, 10) : 0,
          calories: calories !== '' ? parseInt(calories, 10) : 0,
          equipment: equipment
        });
      } else if (setRows.length > 0) {
        const setsArray = [];
        setRows.forEach(row => {
          const w = row.querySelector('.set-weight').value;
          const r = row.querySelector('.set-reps').value;
          const isPartial = row.querySelector('.btn-partial-toggle').classList.contains('active');
          if (w !== '' || r !== '') {
            setsArray.push({
              weight: w !== '' ? parseFloat(w) : 0,
              reps: r !== '' ? parseInt(r, 10) : 0,
              isPartial: isPartial
            });
          }
        });

        if (setsArray.length > 0) appendExerciseLog(name, { setsArray: setsArray, equipment: equipment });
      }
    }
  });

  if (Object.keys(finalExerciseLogs).length === 0) {
    alert('少なくとも1種目は入力してください。');
    return;
  }

  state.logs = state.logs.filter(l => l.date !== selectedISO);
  state.logs.push({
    date: selectedISO,
    menuId: selectedMenuId,
    recordType: isFree ? 'free' : 'menu',
    exerciseLogs: finalExerciseLogs
  });

  state.logs.sort((a, b) => a.date.localeCompare(b.date));

  saveState();
  renderRecommendation();
  renderTodaySummary();
  renderCalendar();
  renderMenuTable();

  closeWorkoutLogModal();
}

function openDetailLogModal(logIndex) {
  const log = state.logs[logIndex];
  if (!log) return;

  document.getElementById('detail-log-date').textContent = log.date;

  const titleEl = document.getElementById('detail-log-title');
  const bodyEl = document.getElementById('detail-log-body');

  if (log.menuId === 'OFF') {
    titleEl.textContent = 'OFF';
    bodyEl.innerHTML = '<p style="color:var(--text-sub);">この日はオフとして記録されています。</p>';
  } else if (log.menuId === 'ALL') {
    titleEl.textContent = '全身トレーニング';
  } else {
    const menu = state.menus.find(m => m.id === log.menuId);
    const menuTitle = menu ? menu.title : '';
    const freeBadge = log.recordType === 'free' ? ' <span style="font-size:0.75rem; font-weight:700; color:var(--lavender); background:var(--lavender-soft); padding:2px 8px; border-radius:8px; vertical-align:middle;">自由入力</span>' : '';
    titleEl.innerHTML = `${menuTitle}${freeBadge}`;
  }

  let html = '';
  if (log.exerciseLogs && Object.keys(log.exerciseLogs).length > 0) {
    html += '<div style="display:flex; flex-direction:column; gap:8px;">';
    for (const [exName, logVal] of Object.entries(log.exerciseLogs)) {
      const cleanName = exName.replace('【追加】', ''); 
      const valArray = Array.isArray(logVal) ? logVal : [logVal];

      valArray.forEach(item => {
        const formatted = formatSingleLogObj(item);
        html += `
          <div style="display:flex; justify-content:space-between; border-bottom:1px dashed var(--border-color); padding-bottom:6px;">
            <span style="font-weight:500;">${cleanName}</span>
            <span style="color:var(--text-sub); font-size:0.9rem;">${formatted}</span>
          </div>
        `;
      });
    }
    html += '</div>';
  } else {
    html = '<p style="color:var(--text-sub);">各種目の詳細ログはありません。</p>';
  }
  bodyEl.innerHTML = html;

  const deleteBtn = document.getElementById('btn-delete-detail-log');
  deleteBtn.onclick = () => {
    if (confirm(`${log.date} の記録を削除しますか？`)) {
      deleteLogByIndex(logIndex);
      closeDetailLogModal();
    }
  };

  const editBtn = document.getElementById('btn-edit-detail-log');
  if (editBtn) {
    editBtn.onclick = () => {
      closeDetailLogModal();
      openWorkoutLogModal(log.menuId, log.date, true);
    };
  }

  document.getElementById('detail-log-modal').classList.add('active');
}

function closeDetailLogModal() {
  document.getElementById('detail-log-modal').classList.remove('active');
}

function deleteLogByIndex(logIndex) {
  if (logIndex < 0 || logIndex >= state.logs.length) return;

  state.logs.splice(logIndex, 1);
  saveState();
  renderRecommendation();
  renderTodaySummary();
  renderCalendar();
  renderMenuTable();
}

function openEditModal(menuId) {
  state.editingMenuId = menuId;
  const menu = state.menus.find(m => m.id === menuId);

  document.getElementById('edit-menu-id').textContent = menu.id;
  document.getElementById('edit-menu-title').value = menu.title;
  document.getElementById('edit-menu-memo').value = menu.memo || '';

  const container = document.getElementById('exercise-inputs-container');
  container.innerHTML = '';

  menu.exercises.forEach(e => {
    addExerciseInput(e.name, e.detail);
  });

  makeSortable(container);
  document.getElementById('edit-modal').classList.add('active');
}

function closeEditModal() {
  document.getElementById('edit-modal').classList.remove('active');
  state.editingMenuId = null;
}

function addExerciseInput(name = '', detail = '') {
  const container = document.getElementById('exercise-inputs-container');
  const row = document.createElement('div');
  row.className = 'exercise-row';
  row.innerHTML = `
    <div class="move-btn-group">
      <button type="button" class="btn-move-row" onclick="moveBlock(this, -1)">▲</button>
      <button type="button" class="btn-move-row" onclick="moveBlock(this, 1)">▼</button>
    </div>
    <input type="text" class="form-input input-name" placeholder="種目名" value="${name}" style="margin-bottom:0; flex:1;">
    <input type="text" class="form-input input-detail" placeholder="目安セット・回数" value="${detail}" style="margin-bottom:0; flex:1;">
    <button type="button" class="btn-remove-row" onclick="this.parentElement.remove()">&times;</button>
  `;
  container.appendChild(row);
  makeSortable(container);
  row.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

function saveMenuEdit() {
  if (!state.editingMenuId) return;

  const newTitle = document.getElementById('edit-menu-title').value.trim();
  const newMemo = document.getElementById('edit-menu-memo').value.trim();

  if (!newTitle) {
    alert('メニュータイトルを入力してください。');
    return;
  }

  const rows = document.querySelectorAll('#exercise-inputs-container .exercise-row');
  const newExercises = [];

  rows.forEach(row => {
    const name = row.querySelector('.input-name').value.trim();
    const detail = row.querySelector('.input-detail').value.trim();
    if (name) newExercises.push({ name, detail });
  });

  const targetMenu = state.menus.find(m => m.id === state.editingMenuId);
  targetMenu.title = newTitle;
  targetMenu.memo = newMemo;
  targetMenu.exercises = newExercises;

  saveState();
  renderRecommendation();
  renderMenuTable();
  closeEditModal();
}

function renderCalendar() {
  const year = state.calendarYear;
  const month = state.calendarMonth;

  document.getElementById('calendar-month-year').textContent = `${year}年 ${month + 1}月`;

  const grid = document.getElementById('calendar-grid');
  grid.innerHTML = '';

  const days = ['日', '月', '火', '水', '木', '金', '土'];
  days.forEach(d => {
    const head = document.createElement('div');
    head.className = 'cal-day-head';
    head.textContent = d;
    grid.appendChild(head);
  });

  const firstDay = new Date(year, month, 1).getDay();
  const totalDays = new Date(year, month + 1, 0).getDate();

  for (let i = 0; i < firstDay; i++) {
    const emptyCell = document.createElement('div');
    emptyCell.className = 'cal-cell';
    grid.appendChild(emptyCell);
  }

  const todayISO = getTodayISO();

  for (let d = 1; d <= totalDays; d++) {
    const cell = document.createElement('div');
    cell.className = 'cal-cell';
    
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    
    if (dateStr === todayISO) {
      cell.classList.add('today');
    }

    cell.innerHTML = `<span>${d}</span>`;

    let hasLog = false;

    state.logs.forEach((log, index) => {
      if (log.date === dateStr) {
        hasLog = true;
        const tag = document.createElement('div');
        tag.className = `cal-tag ${log.menuId}`;
        
        let shortLabel = MENU_LABELS[log.menuId] || log.menuId;
        
        if (log.menuId !== 'ALL' && log.menuId !== 'OFF') {
          const menu = state.menus.find(m => m.id === log.menuId);
          if (menu) {
            if (menu.title.includes('上半身')) shortLabel = '上';
            else if (menu.title.includes('下半身')) shortLabel = '下';
            else if (menu.title.includes('有酸素') || menu.title.includes('リカバリー')) shortLabel = '🏃';
          }
        }

        tag.textContent = log.recordType === 'free' ? `${shortLabel}` : shortLabel;
        
        tag.onclick = (e) => {
          e.stopPropagation();
          openDetailLogModal(index);
        };
        cell.appendChild(tag);
      }
    });

    if (!hasLog && dateStr <= todayISO) {
      cell.classList.add('clickable');
      cell.title = 'クリックしてこの日の記録を追加';
      cell.onclick = () => {
        openWorkoutLogModal('ALL', dateStr);
      };
    }

    grid.appendChild(cell);
  }
}

function changeMonth(delta) {
  state.calendarMonth += delta;
  if (state.calendarMonth < 0) {
    state.calendarMonth = 11;
    state.calendarYear -= 1;
  } else if (state.calendarMonth > 11) {
    state.calendarMonth = 0;
    state.calendarYear += 1;
  }
  renderCalendar();
}

function getTodayISO() {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function resetData() {
  if (confirm('履歴、完了データ、カスタムメニューをすべて初期化しますか？')) {
    localStorage.removeItem('workout_tracker_state');
    state.theme = 'blue';
    state.menus = JSON.parse(JSON.stringify(initialDefaultMenus));
    state.logs = [];
    state.exerciseLabels = ['胸', '背中', '脚', '肩', '腕', 'お尻', '腹筋', '全身', '有酸素運動', 'その他'];
    state.exerciseLibrary = buildDefaultExerciseLibrary();
    state.exerciseEquipment = JSON.parse(JSON.stringify(DEFAULT_EQUIPMENT_PATTERNS));
    init();
  }
}

// 種目リスト＆器具マスター管理モーダル
let currentLibraryLabel = null;

function openExerciseLibraryModal() {
  if (!state.exerciseLabels || state.exerciseLabels.length === 0) {
    state.exerciseLabels = ['胸', '背中', '脚', '肩', '腕', 'お尻', '腹筋', '全身', '有酸素運動', 'その他'];
  }
  if (!state.exerciseLibrary) {
    state.exerciseLibrary = buildDefaultExerciseLibrary();
  }
  if (!state.exerciseEquipment) {
    state.exerciseEquipment = JSON.parse(JSON.stringify(DEFAULT_EQUIPMENT_PATTERNS));
  }

  currentLibraryLabel = state.exerciseLabels[0];
  renderLibraryLabelTabs();
  renderLibraryExerciseChips();

  const modal = document.getElementById('exercise-library-modal');
  if (modal) modal.classList.add('active');
}

function closeExerciseLibraryModal() {
  document.getElementById('exercise-library-modal').classList.remove('active');
}

function renderLibraryLabelTabs() {
  const container = document.getElementById('library-label-tabs');
  container.innerHTML = state.exerciseLabels.map(label => {
    const activeClass = label === currentLibraryLabel ? 'active' : '';
    return `<button type="button" class="label-tab ${activeClass}" data-label="${label}">${label}</button>`;
  }).join('');

  container.querySelectorAll('.label-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      currentLibraryLabel = tab.getAttribute('data-label');
      renderLibraryLabelTabs();
      renderLibraryExerciseChips();
    });
  });
}

function renderLibraryExerciseChips() {
  const container = document.getElementById('library-exercise-chips');
  const names = state.exerciseLibrary[currentLibraryLabel] || [];

  if (names.length === 0) {
    container.innerHTML = `<span class="exercise-chip-empty">まだ種目がありません。下から追加してください。</span>`;
    return;
  }

  container.innerHTML = names.map(name => {
    const equips = state.exerciseEquipment[name] || DEFAULT_EQUIPMENT_PATTERNS[name] || [];
    const equipChipsHTML = equips.map(eq => `
      <span class="lib-equip-chip">${eq}<button type="button" onclick="removeExerciseEquip('${name}', '${eq}')">&times;</button></span>
    `).join('');

    const hasCustomSnapshot = !!state.exerciseEquipment[name];
    const defaultPatternForName = DEFAULT_EQUIPMENT_PATTERNS[name];
    const differsFromDefault = defaultPatternForName &&
      JSON.stringify([...(state.exerciseEquipment[name] || [])].sort()) !== JSON.stringify([...defaultPatternForName].sort());
    const showResetBtn = hasCustomSnapshot && defaultPatternForName && differsFromDefault;

    return `
      <div class="lib-exercise-item-card">
        <div class="lib-exercise-header">
          <span class="lib-exercise-name"><strong>${name}</strong></span>
          <button type="button" class="chip-remove-btn" onclick="removeLibraryExercise('${name}')" title="種目を削除">&times;</button>
        </div>
        <div class="lib-exercise-equip-row">
          <div class="lib-equip-list">${equipChipsHTML}</div>
          <div class="lib-equip-add-form">
            <input type="text" class="form-input lib-new-equip-input" placeholder="器具追加 (例: スミス, ダンベル)" data-exname="${name}">
            <button type="button" class="btn-lib-equip-add" onclick="addExerciseEquip('${name}', this)">+ 追加</button>
          </div>
          ${showResetBtn ? `<button type="button" class="btn-lib-equip-reset" onclick="resetExerciseEquip('${name}')">デフォルトに戻す</button>` : ''}
        </div>
      </div>
    `;
  }).join('');
}

function resetExerciseEquip(exName) {
  if (!DEFAULT_EQUIPMENT_PATTERNS[exName]) return;
  delete state.exerciseEquipment[exName];
  saveState();
  renderLibraryExerciseChips();
}

function removeLibraryExercise(name) {
  if (confirm(`「${name}」をリストから削除しますか？`)) {
    state.exerciseLibrary[currentLibraryLabel] = state.exerciseLibrary[currentLibraryLabel].filter(n => n !== name);
    delete state.exerciseEquipment[name];
    saveState();
    renderLibraryExerciseChips();
  }
}

function addExerciseEquip(exName, btnEl) {
  const input = btnEl.previousElementSibling;
  const equipName = input.value.trim();
  if (!equipName) return;

  if (!state.exerciseEquipment[exName]) {
    state.exerciseEquipment[exName] = [...(DEFAULT_EQUIPMENT_PATTERNS[exName] || ['マシン', 'ダンベル', 'バーベル', 'ケーブル', '自重'])];
  }

  if (state.exerciseEquipment[exName].includes(equipName)) {
    alert('既に登録されている器具です');
    return;
  }

  state.exerciseEquipment[exName].push(equipName);
  saveState();
  input.value = '';
  renderLibraryExerciseChips();
}

function removeExerciseEquip(exName, equipName) {
  if (!state.exerciseEquipment[exName]) {
    state.exerciseEquipment[exName] = [...(DEFAULT_EQUIPMENT_PATTERNS[exName] || ['マシン', 'ダンベル', 'バーベル', 'ケーブル', '自重'])];
  }
  state.exerciseEquipment[exName] = state.exerciseEquipment[exName].filter(e => e !== equipName);
  saveState();
  renderLibraryExerciseChips();
}

function addLibraryExercise() {
  const input = document.getElementById('library-new-exercise-input');
  const name = input.value.trim();
  if (!name) return;

  if (!state.exerciseLibrary[currentLibraryLabel]) {
    state.exerciseLibrary[currentLibraryLabel] = [];
  }

  if (state.exerciseLibrary[currentLibraryLabel].includes(name)) {
    alert('すでにリストに存在する種目名です。');
    return;
  }

  state.exerciseLibrary[currentLibraryLabel].push(name);
  state.exerciseEquipment[name] = ['マシン', 'ダンベル', 'スミス'];
  saveState();
  input.value = '';
  renderLibraryExerciseChips();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

window.addEventListener('resize', () => {
  const inbodyTab = document.getElementById('tab-content-inbody');
  if (inbodyTab && inbodyTab.classList.contains('active') && state.inbodyLogs && state.inbodyLogs.length >= 2) {
    drawInbodyChart(state.inbodyMetric);
  }
});

function switchMainTab(tabName) {
  const buttons = document.querySelectorAll('.main-tab-btn');
  buttons.forEach(btn => btn.classList.remove('active'));

  const contents = document.querySelectorAll('.main-tab-content');
  contents.forEach(content => content.classList.remove('active'));

  if (tabName === 'record') {
    buttons[0].classList.add('active');
    document.getElementById('tab-content-record').classList.add('active');
  } else if (tabName === 'menu-list') {
    buttons[1].classList.add('active');
    document.getElementById('tab-content-menu-list').classList.add('active');
  } else if (tabName === 'history') {
    buttons[2].classList.add('active');
    document.getElementById('tab-content-history').classList.add('active');
    renderHistoryLogs();
  } else if (tabName === 'inbody') {
    buttons[3].classList.add('active');
    document.getElementById('tab-content-inbody').classList.add('active');
    renderInbodyTab();
  }
}

/* ================================
   InBody（体組成）記録機能
================================ */

function renderInbodyTab() {
  const summaryContainer = document.getElementById('inbody-latest-summary');
  const listContainer = document.getElementById('inbody-list-container');
  if (!summaryContainer || !listContainer) return;

  summaryContainer.innerHTML = '';
  listContainer.innerHTML = '';

  if (!state.inbodyLogs || state.inbodyLogs.length === 0) {
    listContainer.innerHTML = '<div class="inbody-empty">まだ測定記録がありません。「＋ 測定結果を追加」から記録しましょう。</div>';
    const chartCard = document.getElementById('inbody-chart-card');
    if (chartCard) chartCard.style.display = 'none';
    return;
  }

  const chartCard = document.getElementById('inbody-chart-card');
  if (chartCard) chartCard.style.display = 'block';
  document.querySelectorAll('.inbody-metric-tab').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.metric === state.inbodyMetric);
  });
  const segRow = document.getElementById('inbody-segmental-select-row');
  if (state.inbodyMetric === 'segmental') {
    segRow.style.display = 'block';
    onSegmentalSelectChange();
  } else {
    segRow.style.display = 'none';
    drawInbodyChart(state.inbodyMetric);
  }

  const sorted = [...state.inbodyLogs].sort((a, b) => a.date.localeCompare(b.date));
  const latest = sorted[sorted.length - 1];
  const prev = sorted.length > 1 ? sorted[sorted.length - 2] : null;

  const fmtDiff = (curr, prevVal, unit) => {
    if (curr === null || curr === undefined || curr === '' || !prevVal && prevVal !== 0) return '';
    const diff = Math.round((curr - prevVal) * 10) / 10;
    if (diff === 0) return `<span class="inbody-stat-diff flat">±0${unit}</span>`;
    const cls = diff > 0 ? 'up' : 'down';
    const sign = diff > 0 ? '+' : '';
    return `<span class="inbody-stat-diff ${cls}">${sign}${diff}${unit}</span>`;
  };

  const statBox = (label, value, unit, diffHtml) => `
    <div class="inbody-stat-box">
      <div class="inbody-stat-label">${label}</div>
      <div class="inbody-stat-value">${(value === null || value === undefined || value === '') ? '-' : value + unit}</div>
      ${diffHtml || ''}
    </div>
  `;

  const [y, m, d] = latest.date.split('-');
  const summaryEl = document.createElement('div');
  summaryEl.className = 'inbody-summary-card';
  summaryEl.innerHTML = `
    <div class="inbody-summary-date">📊 最新測定: ${y}/${parseInt(m, 10)}/${parseInt(d, 10)}</div>
    <div class="inbody-summary-grid">
      ${statBox('体重', latest.weight, 'kg', prev ? fmtDiff(latest.weight, prev.weight, 'kg') : '')}
      ${statBox('骨格筋量', latest.muscle, 'kg', prev ? fmtDiff(latest.muscle, prev.muscle, 'kg') : '')}
      ${statBox('体脂肪率', latest.fatPercent, '%', prev ? fmtDiff(latest.fatPercent, prev.fatPercent, '%') : '')}
    </div>
  `;
  summaryContainer.appendChild(summaryEl);

  const listSorted = [...sorted].reverse();
  listSorted.forEach((log, index) => {
    const [ly, lm, ld] = log.date.split('-');
    const dateObj = new Date(parseInt(ly, 10), parseInt(lm, 10) - 1, parseInt(ld, 10));
    const dayOfWeek = ['日', '月', '火', '水', '木', '金', '土'][dateObj.getDay()];
    const formattedDate = `${ly}/${parseInt(lm, 10)}/${parseInt(ld, 10)} (${dayOfWeek})`;

    const chips = [];
    if (log.weight !== null && log.weight !== undefined && log.weight !== '') chips.push(`体重<span>${log.weight}kg</span>`);
    if (log.muscle !== null && log.muscle !== undefined && log.muscle !== '') chips.push(`骨格筋量<span>${log.muscle}kg</span>`);
    if (log.fatPercent !== null && log.fatPercent !== undefined && log.fatPercent !== '') chips.push(`体脂肪率<span>${log.fatPercent}%</span>`);
    if (log.fatMass !== null && log.fatMass !== undefined && log.fatMass !== '') chips.push(`体脂肪量<span>${log.fatMass}kg</span>`);
    if (log.visceral !== null && log.visceral !== undefined && log.visceral !== '') chips.push(`内臓脂肪<span>Lv.${log.visceral}</span>`);
    if (log.bmi !== null && log.bmi !== undefined && log.bmi !== '') chips.push(`BMI<span>${log.bmi}</span>`);

    const ms = log.muscleSegments || {};
    const fs = log.fatSegments || {};
    const segKeys = [
      { key: 'rightArm', label: '右腕' },
      { key: 'leftArm',  label: '左腕' },
      { key: 'trunk',    label: '体幹' },
      { key: 'rightLeg', label: '右脚' },
      { key: 'leftLeg',  label: '左脚' }
    ];

    const hasSegData = segKeys.some(s => ms[s.key] != null || fs[s.key] != null);

    let segTableHTML = '';
    if (hasSegData) {
      const rowsHTML = segKeys.map(s => {
        const mVal = ms[s.key] != null ? `${ms[s.key]}%` : '-';
        const fVal = fs[s.key] != null ? `${fs[s.key]}%` : '-';
        return `
          <div class="inbody-seg-row">
            <span class="inbody-seg-cell label">${s.label}</span>
            <span class="inbody-seg-cell val muscle">${mVal}</span>
            <span class="inbody-seg-cell val fat">${fVal}</span>
          </div>
        `;
      }).join('');

      segTableHTML = `
        <div class="inbody-seg-container">
          <div class="inbody-seg-header">
            <span class="inbody-seg-cell label">部位</span>
            <span class="inbody-seg-cell val muscle">筋肉量(%)</span>
            <span class="inbody-seg-cell val fat">脂肪量(%)</span>
          </div>
          ${rowsHTML}
        </div>
      `;
    }

    const item = document.createElement('div');
    item.className = 'date-accordion-item';

    const header = document.createElement('div');
    header.className = 'date-accordion-header';
    header.innerHTML = `
      <span class="inbody-list-date">${formattedDate}</span>
      <span class="date-accordion-preview">${log.weight !== null && log.weight !== undefined ? `${log.weight}kg` : ''}</span>
      <span class="arrow-icon">▾</span>
    `;

    const body = document.createElement('div');
    body.className = 'date-accordion-body';
    body.innerHTML = `
      <div class="inbody-list-metrics">
        ${chips.map(c => `<span class="inbody-metric-chip">${c}</span>`).join('')}
      </div>
      ${segTableHTML}
      <div style="display:flex; justify-content:flex-end; margin-top:10px;">
        <button type="button" class="btn-table-edit">編集する</button>
      </div>
    `;

    body.querySelector('.btn-table-edit').onclick = (e) => {
      e.stopPropagation();
      openInbodyModal(log.id);
    };

    item.appendChild(header);
    item.appendChild(body);

    header.onclick = () => {
      const isActive = item.classList.contains('active');
      if (isActive) {
        body.style.maxHeight = '0px';
        item.classList.remove('active');
      } else {
        item.classList.add('active');
        body.style.maxHeight = body.scrollHeight + 20 + 'px';
      }
    };

    listContainer.appendChild(item);

    if (index === 0) {
      setTimeout(() => {
        item.classList.add('active');
        body.style.maxHeight = body.scrollHeight + 20 + 'px';
      }, 50);
    }
  });
}

function switchInbodyMetric(metric) {
  state.inbodyMetric = metric;
  document.querySelectorAll('.inbody-metric-tab').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.metric === metric);
  });

  const segRow = document.getElementById('inbody-segmental-select-row');
  if (metric === 'segmental') {
    segRow.style.display = 'block';
    onSegmentalSelectChange();
  } else {
    segRow.style.display = 'none';
    drawInbodyChart(metric);
  }
}

function onSegmentalSelectChange() {
  const select = document.getElementById('inbody-segmental-select');
  drawInbodyChart(select.value);
}

const SEGMENT_LABELS = { leftArm: '左腕', rightArm: '右腕', trunk: '体幹', leftLeg: '左脚', rightLeg: '右脚' };

const INBODY_METRIC_META = {
  weight: { label: '体重', unit: 'kg', color: '#82A0C2' },
  muscle: { label: '骨格筋量', unit: 'kg', color: '#88C4B8' },
  fatPercent: { label: '体脂肪率', unit: '%', color: '#E0788A' },
  fatMass: { label: '体脂肪量', unit: 'kg', color: '#E0B899' },
  visceral: { label: '内臓脂肪レベル', unit: '', color: '#A49BCE' },
  bmi: { label: 'BMI', unit: '', color: '#6B8CB3' },
  'muscleSegments.leftArm': { label: '左腕筋肉量', unit: '%', color: '#88C4B8' },
  'muscleSegments.rightArm': { label: '右腕筋肉量', unit: '%', color: '#88C4B8' },
  'muscleSegments.trunk': { label: '体幹筋肉量', unit: '%', color: '#88C4B8' },
  'muscleSegments.leftLeg': { label: '左脚筋肉量', unit: '%', color: '#88C4B8' },
  'muscleSegments.rightLeg': { label: '右脚筋肉量', unit: '%', color: '#88C4B8' },
  'fatSegments.leftArm': { label: '左腕脂肪量', unit: '%', color: '#E0B899' },
  'fatSegments.rightArm': { label: '右腕脂肪量', unit: '%', color: '#E0B899' },
  'fatSegments.trunk': { label: '体幹脂肪量', unit: '%', color: '#E0B899' },
  'fatSegments.leftLeg': { label: '左脚脂肪量', unit: '%', color: '#E0B899' },
  'fatSegments.rightLeg': { label: '右脚脂肪量', unit: '%', color: '#E0B899' }
};

function getMetricValue(log, metricPath) {
  if (metricPath.includes('.')) {
    const [group, key] = metricPath.split('.');
    return log[group] ? log[group][key] : undefined;
  }
  return log[metricPath];
}

function drawInbodyChart(metric) {
  const canvas = document.getElementById('inbody-chart-canvas');
  const emptyEl = document.getElementById('inbody-chart-empty');
  if (!canvas) return;

  const meta = INBODY_METRIC_META[metric] || INBODY_METRIC_META.weight;

  const sorted = [...state.inbodyLogs]
    .filter(l => {
      const v = getMetricValue(l, metric);
      return v !== null && v !== undefined;
    })
    .sort((a, b) => a.date.localeCompare(b.date));

  if (sorted.length < 2) {
    canvas.style.display = 'none';
    if (emptyEl) emptyEl.style.display = 'block';
    return;
  }
  canvas.style.display = 'block';
  if (emptyEl) emptyEl.style.display = 'none';

  const dpr = window.devicePixelRatio || 1;
  const cssWidth = canvas.parentElement.clientWidth - 28;
  const cssHeight = 200;
  canvas.width = cssWidth * dpr;
  canvas.height = cssHeight * dpr;
  canvas.style.height = cssHeight + 'px';

  const ctx = canvas.getContext('2d');
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, cssWidth, cssHeight);

  const values = sorted.map(l => getMetricValue(l, metric));
  let minVal = Math.min(...values);
  let maxVal = Math.max(...values);
  if (minVal === maxVal) {
    minVal -= 1;
    maxVal += 1;
  }
  const pad = (maxVal - minVal) * 0.15 || 1;
  minVal -= pad;
  maxVal += pad;

  const leftPad = 34;
  const rightPad = 10;
  const topPad = 14;
  const bottomPad = 26;
  const plotW = cssWidth - leftPad - rightPad;
  const plotH = cssHeight - topPad - bottomPad;

  const xForIndex = (i) => leftPad + (sorted.length === 1 ? plotW / 2 : (plotW * i) / (sorted.length - 1));
  const yForValue = (v) => topPad + plotH - ((v - minVal) / (maxVal - minVal)) * plotH;

  const rootStyle = getComputedStyle(document.body);
  const textSub = rootStyle.getPropertyValue('--text-sub').trim() || '#929FA8';
  const borderColor = rootStyle.getPropertyValue('--border-color').trim() || '#E8EEF3';
  const textMain = rootStyle.getPropertyValue('--text-main').trim() || '#3E4852';

  ctx.strokeStyle = borderColor;
  ctx.fillStyle = textSub;
  ctx.font = '10px sans-serif';
  ctx.textAlign = 'right';
  ctx.textBaseline = 'middle';
  const gridCount = 3;
  for (let g = 0; g <= gridCount; g++) {
    const v = minVal + ((maxVal - minVal) * g) / gridCount;
    const y = yForValue(v);
    ctx.beginPath();
    ctx.moveTo(leftPad, y);
    ctx.lineTo(cssWidth - rightPad, y);
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.fillText(v.toFixed(1), leftPad - 6, y);
  }

  ctx.beginPath();
  sorted.forEach((log, i) => {
    const x = xForIndex(i);
    const y = yForValue(getMetricValue(log, metric));
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  });
  ctx.strokeStyle = meta.color;
  ctx.lineWidth = 2.5;
  ctx.lineJoin = 'round';
  ctx.stroke();

  sorted.forEach((log, i) => {
    const x = xForIndex(i);
    const y = yForValue(getMetricValue(log, metric));
    ctx.beginPath();
    ctx.arc(x, y, 3.5, 0, Math.PI * 2);
    ctx.fillStyle = '#ffffff';
    ctx.fill();
    ctx.lineWidth = 2;
    ctx.strokeStyle = meta.color;
    ctx.stroke();
  });

  ctx.fillStyle = textMain;
  ctx.font = '10px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';
  const maxLabels = 5;
  const step = Math.max(1, Math.ceil(sorted.length / maxLabels));
  sorted.forEach((log, i) => {
    if (i % step !== 0 && i !== sorted.length - 1) return;
    const [y, m, d] = log.date.split('-');
    const x = xForIndex(i);
    ctx.fillText(`${parseInt(m, 10)}/${parseInt(d, 10)}`, x, cssHeight - bottomPad + 6);
  });
}

function openInbodyModal(id) {
  const modal = document.getElementById('inbody-modal');
  const title = document.getElementById('inbody-modal-title');
  const deleteBtn = document.getElementById('inbody-delete-btn');

  document.getElementById('inbody-editing-id').value = '';
  document.getElementById('inbody-date').value = '';
  document.getElementById('inbody-weight').value = '';
  document.getElementById('inbody-muscle').value = '';
  document.getElementById('inbody-fat-percent').value = '';
  document.getElementById('inbody-fat-mass').value = '';
  document.getElementById('inbody-muscle-leftarm').value = '';
  document.getElementById('inbody-muscle-rightarm').value = '';
  document.getElementById('inbody-muscle-trunk').value = '';
  document.getElementById('inbody-muscle-leftleg').value = '';
  document.getElementById('inbody-muscle-rightleg').value = '';
  document.getElementById('inbody-fat-leftarm').value = '';
  document.getElementById('inbody-fat-rightarm').value = '';
  document.getElementById('inbody-fat-trunk').value = '';
  document.getElementById('inbody-fat-leftleg').value = '';
  document.getElementById('inbody-fat-rightleg').value = '';
  document.getElementById('inbody-visceral').value = '';
  document.getElementById('inbody-bmi').value = '';

  if (id) {
    const log = state.inbodyLogs.find(l => l.id === id);
    if (log) {
      title.textContent = 'InBody 測定結果を編集';
      document.getElementById('inbody-editing-id').value = log.id;
      document.getElementById('inbody-date').value = log.date || '';
      document.getElementById('inbody-weight').value = log.weight ?? '';
      document.getElementById('inbody-muscle').value = log.muscle ?? '';
      document.getElementById('inbody-fat-percent').value = log.fatPercent ?? '';
      document.getElementById('inbody-fat-mass').value = log.fatMass ?? '';
      const ms = log.muscleSegments || {};
      const fs = log.fatSegments || {};
      document.getElementById('inbody-muscle-leftarm').value = ms.leftArm ?? '';
      document.getElementById('inbody-muscle-rightarm').value = ms.rightArm ?? '';
      document.getElementById('inbody-muscle-trunk').value = ms.trunk ?? '';
      document.getElementById('inbody-muscle-leftleg').value = ms.leftLeg ?? '';
      document.getElementById('inbody-muscle-rightleg').value = ms.rightLeg ?? '';
      document.getElementById('inbody-fat-leftarm').value = fs.leftArm ?? '';
      document.getElementById('inbody-fat-rightarm').value = fs.rightArm ?? '';
      document.getElementById('inbody-fat-trunk').value = fs.trunk ?? '';
      document.getElementById('inbody-fat-leftleg').value = fs.leftLeg ?? '';
      document.getElementById('inbody-fat-rightleg').value = fs.rightLeg ?? '';
      document.getElementById('inbody-visceral').value = log.visceral ?? '';
      document.getElementById('inbody-bmi').value = log.bmi ?? '';
      deleteBtn.style.display = 'inline-block';
    }
  } else {
    title.textContent = 'InBody 測定結果を追加';
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    document.getElementById('inbody-date').value = `${yyyy}-${mm}-${dd}`;
    deleteBtn.style.display = 'none';
  }

  modal.classList.add('active');
}

function closeInbodyModal() {
  document.getElementById('inbody-modal').classList.remove('active');
}

function saveInbodyLog() {
  const date = document.getElementById('inbody-date').value;
  if (!date) {
    alert('測定日を入力してください。');
    return;
  }

  const toNum = (val) => {
    if (val === '' || val === null || val === undefined) return null;
    const n = parseFloat(val);
    return isNaN(n) ? null : n;
  };

  const editingId = document.getElementById('inbody-editing-id').value;
  const entry = {
    id: editingId || ('ib_' + Date.now()),
    date: date,
    weight: toNum(document.getElementById('inbody-weight').value),
    muscle: toNum(document.getElementById('inbody-muscle').value),
    fatPercent: toNum(document.getElementById('inbody-fat-percent').value),
    fatMass: toNum(document.getElementById('inbody-fat-mass').value),
    muscleSegments: {
      leftArm: toNum(document.getElementById('inbody-muscle-leftarm').value),
      rightArm: toNum(document.getElementById('inbody-muscle-rightarm').value),
      trunk: toNum(document.getElementById('inbody-muscle-trunk').value),
      leftLeg: toNum(document.getElementById('inbody-muscle-leftleg').value),
      rightLeg: toNum(document.getElementById('inbody-muscle-rightleg').value)
    },
    fatSegments: {
      leftArm: toNum(document.getElementById('inbody-fat-leftarm').value),
      rightArm: toNum(document.getElementById('inbody-fat-rightarm').value),
      trunk: toNum(document.getElementById('inbody-fat-trunk').value),
      leftLeg: toNum(document.getElementById('inbody-fat-leftleg').value),
      rightLeg: toNum(document.getElementById('inbody-fat-rightleg').value)
    },
    visceral: toNum(document.getElementById('inbody-visceral').value),
    bmi: toNum(document.getElementById('inbody-bmi').value)
  };

  if (editingId) {
    const idx = state.inbodyLogs.findIndex(l => l.id === editingId);
    if (idx !== -1) state.inbodyLogs[idx] = entry;
  } else {
    state.inbodyLogs.push(entry);
  }

  saveState();
  closeInbodyModal();
  renderInbodyTab();
}

function openInbodyImportModal() {
  const textarea = document.getElementById('inbody-import-textarea');
  if (textarea) {
    textarea.value = '';
  }
  
  document.getElementById('inbody-import-modal').classList.add('active');
  
  setTimeout(() => {
    if (textarea) textarea.focus();
  }, 100);
}

function closeInbodyImportModal() {
  document.getElementById('inbody-import-modal').classList.remove('active');
}

function submitInbodyImport() {
  const raw = document.getElementById('inbody-import-textarea').value.trim();
  if (!raw) {
    alert('JSONを貼り付けてください。');
    return;
  }

  let parsed;
  try {
    parsed = JSON.parse(raw);
  } catch (e) {
    alert('JSONの形式が正しくありません。');
    return;
  }

  const entries = Array.isArray(parsed) ? parsed : [parsed];
  if (entries.length === 0) {
    alert('データが空です。');
    return;
  }

  const toNum = (val) => {
    if (val === '' || val === null || val === undefined) return null;
    const n = parseFloat(val);
    return isNaN(n) ? null : n;
  };

  const toSegments = (obj, prefix) => {
    const src = obj || {};
    return {
      leftArm: toNum(src[`${prefix}LeftArm`]),
      rightArm: toNum(src[`${prefix}RightArm`]),
      trunk: toNum(src[`${prefix}Trunk`]),
      leftLeg: toNum(src[`${prefix}LeftLeg`]),
      rightLeg: toNum(src[`${prefix}RightLeg`])
    };
  };

  let importedCount = 0;
  let skippedCount = 0;

  entries.forEach(item => {
    if (!item || !item.date || !/^\d{4}-\d{2}-\d{2}$/.test(item.date)) {
      skippedCount++;
      return;
    }

    const existingIdx = state.inbodyLogs.findIndex(l => l.date === item.date);
    const entry = {
      id: existingIdx !== -1 ? state.inbodyLogs[existingIdx].id : ('ib_' + Date.now() + '_' + Math.random().toString(36).slice(2, 7)),
      date: item.date,
      weight: toNum(item.weight),
      muscle: toNum(item.muscle),
      fatPercent: toNum(item.fatPercent),
      fatMass: toNum(item.fatMass),
      visceral: toNum(item.visceral),
      bmi: toNum(item.bmi),
      muscleSegments: toSegments(item, 'muscle'),
      fatSegments: toSegments(item, 'fat')
    };

    if (existingIdx !== -1) {
      state.inbodyLogs[existingIdx] = entry;
    } else {
      state.inbodyLogs.push(entry);
    }
    importedCount++;
  });

  if (importedCount === 0) {
    alert('有効なデータが見つかりませんでした。dateの形式(YYYY-MM-DD)を確認してください。');
    return;
  }

  saveState();
  closeInbodyImportModal();
  renderInbodyTab();
  alert(`${importedCount}件をインポートしました。${skippedCount > 0 ? `(${skippedCount}件はスキップ)` : ''}`);
}

function renderHistoryLogs() {
  const container = document.getElementById('history-log-container');
  if (!container) return;

  container.innerHTML = '';

  if (!state.logs || state.logs.length === 0) {
    container.innerHTML = '<p style="color:var(--text-sub); text-align:center; padding:24px; font-size:0.8125rem;">まだ記録がありません。</p>';
    return;
  }

  const sortedLogs = [...state.logs].sort((a, b) => a.date.localeCompare(b.date));

  const groupedByMonth = {};
  sortedLogs.forEach(log => {
    const [y, m] = log.date.split('-');
    const monthKey = `${y}年 ${parseInt(m, 10)}月`;
    if (!groupedByMonth[monthKey]) {
      groupedByMonth[monthKey] = [];
    }
    groupedByMonth[monthKey].push(log);
  });

  const monthKeys = Object.keys(groupedByMonth);
  const latestMonthKey = monthKeys[monthKeys.length - 1];

  monthKeys.forEach(monthKey => {
    const monthLogs = groupedByMonth[monthKey];

    const groupEl = document.createElement('div');
    groupEl.className = 'history-month-group';

    const summaryEl = document.createElement('div');
    summaryEl.className = 'history-month-summary';
    const countExOff = monthLogs.filter(l => l.menuId !== 'OFF').length;
    summaryEl.innerHTML = `<span>📅 ${monthKey} (${countExOff}回)</span><span class="arrow-icon">▾</span>`;

    const bodyEl = document.createElement('div');
    bodyEl.className = 'history-month-body';

    monthLogs.forEach(log => {
      const [y, m, d] = log.date.split('-');
      const dateObj = new Date(parseInt(y, 10), parseInt(m, 10) - 1, parseInt(d, 10));
      const dayOfWeek = ['日', '月', '火', '水', '木', '金', '土'][dateObj.getDay()];
      const formattedDate = `${y}/${parseInt(m, 10)}/${parseInt(d, 10)} (${dayOfWeek})`;

      let titleText = '';
      if (log.menuId === 'OFF') {
        titleText = 'OFF';
      } else if (log.menuId === 'ALL') {
        titleText = '全身トレーニング';
      } else {
        const menu = state.menus.find(m => m.id === log.menuId);
        titleText = menu ? menu.title : log.menuId;
      }

      let exHTML = '';
      if (log.menuId === 'OFF') {
        exHTML = '<div class="history-ex-empty">☕ やすみもだいじ</div>';
      } else if (log.exerciseLogs && Object.keys(log.exerciseLogs).length > 0) {
        exHTML = '<div class="history-ex-list">';
        for (const [exName, logVal] of Object.entries(log.exerciseLogs)) {
          const cleanName = exName.replace('【追加】', '');
          const valArray = Array.isArray(logVal) ? logVal : [logVal];

          valArray.forEach(item => {
            const formatted = formatSingleLogObj(item);
            exHTML += `
              <div class="history-ex-item">
                <span class="history-ex-name">• ${cleanName}</span>
                <span class="history-ex-val">${formatted}</span>
              </div>
            `;
          });
        }
        exHTML += '</div>';
      } else {
        exHTML = '<div class="history-ex-empty">詳細ログはありません</div>';
      }

      const dayItem = document.createElement('div');
      dayItem.className = 'date-accordion-item history-date-item';

      const dayHeader = document.createElement('div');
      dayHeader.className = 'date-accordion-header';
      dayHeader.innerHTML = `
        <span class="inbody-list-date">${formattedDate}</span>
        <span class="date-accordion-preview">${titleText}</span>
        <span class="arrow-icon">▾</span>
      `;

      const dayBody = document.createElement('div');
      dayBody.className = 'date-accordion-body';
      dayBody.innerHTML = exHTML;

      dayHeader.onclick = () => {
        const isActive = dayItem.classList.contains('active');
        if (isActive) {
          dayBody.style.maxHeight = '0px';
          dayItem.classList.remove('active');
        } else {
          dayItem.classList.add('active');
          dayBody.style.maxHeight = (dayBody.scrollHeight + 100) + 'px';
          
          setTimeout(() => {
            if (dayItem.classList.contains('active')) {
              dayBody.style.maxHeight = 'none';
            }
          }, 350);

          setTimeout(() => {
            dayItem.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
          }, 100);
        }
        
        if (groupEl.classList.contains('active')) {
          bodyEl.style.maxHeight = 'none';
        }
      };

      dayItem.appendChild(dayHeader);
      dayItem.appendChild(dayBody);
      bodyEl.appendChild(dayItem);
    });

    groupEl.appendChild(summaryEl);
    groupEl.appendChild(bodyEl);

    summaryEl.onclick = () => {
      const isActive = groupEl.classList.contains('active');
      if (isActive) {
        bodyEl.style.maxHeight = '0px';
        groupEl.classList.remove('active');
      } else {
        groupEl.classList.add('active');
        bodyEl.style.maxHeight = 'none';
      }
    };

    container.appendChild(groupEl);

    if (monthKey === latestMonthKey) {
      setTimeout(() => {
        groupEl.classList.add('active');
        bodyEl.style.maxHeight = 'none';
      }, 50);
    }
  });
}

function openCategoryWorkout(category) {
  const matchedMenus = state.menus.filter(m => {
    if (category === '上半身') return m.title.includes('上半身');
    if (category === '下半身') return m.title.includes('下半身');
    if (category === '有酸素') return m.title.includes('有酸素') || m.title.includes('リカバリー');
    return false;
  });

  if (matchedMenus.length > 0) {
    openWorkoutLogModal(matchedMenus[0].id);
  } else {
    openWorkoutLogModal('ALL');
  }
}

function importPastLogs() {
  const rawData = prompt("JSONデータを貼り付け");
  if (!rawData) return;
  try {
    const logsToImport = JSON.parse(rawData);
    if (Array.isArray(logsToImport)) {
      logsToImport.forEach(newLog => {
        state.logs = state.logs.filter(l => l.date !== newLog.date);
        state.logs.push(newLog);
      });
      state.logs.sort((a, b) => a.date.localeCompare(b.date));
      saveState();
      renderRecommendation();
      renderTodaySummary();
      renderCalendar();
      if (typeof renderHistoryLogs === 'function') renderHistoryLogs();
      alert("過去データを正常に一括登録しました！");
    }
  } catch (e) {
    alert("データの形式が正しくありません。");
  }
}

function moveBlock(btnEl, direction) {
  const block = btnEl.closest('.extra-log-block') || btnEl.closest('.exercise-row');
  if (!block) return;
  const container = block.parentElement;
  if (!container) return;

  if (direction === -1) {
    const prev = block.previousElementSibling;
    if (prev) {
      container.insertBefore(block, prev);
    }
  } else if (direction === 1) {
    const next = block.nextElementSibling;
    if (next) {
      container.insertBefore(next, block);
    }
  }
}