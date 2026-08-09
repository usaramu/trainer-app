// ご提示いただいたセッション1〜6に基づく初期メニュー構成データ
const initialDefaultMenus = [
    {
        id: 'A',
        title: '上半身（デコルテ・二の腕・肩）',
        memo: 'インターバル60〜90秒。限界まで追い込みすぎず、あと1〜2回できる余裕を残す。',
        exercises: [
            { name: 'インクライン・ダンベルプレス', detail: '軽いダンベル / 15~20回 × 3セット' },
            { name: 'ラットプルダウン', detail: '15~20回 × 3セット' },
            { name: 'ケーブル・トライセプス・プレスダウン', detail: '15〜20回 × 3セット' },
            { name: 'サイドレイズ', detail: '自重〜1・2kg / 15〜20回 × 3セット' },
        ]
    },
    {
        id: 'B',
        title: '下半身A（お尻・裏もも・腰肉）',
        memo: '前ももを使わず、もも裏とお尻の境目を作って小尻・脚長を狙う。',
        exercises: [
            { name: 'バーベル/ダンベル・ルーマニアンデッドリフト', detail: '15~20回 × 3セット' },
            { name: 'ブルガリアンスクワット', detail: '左右各12~15回 × 3セット' },
            { name: 'ヒップアブダクション', detail: '骨盤後継 / 20回 × 3セット ' },
        ]
    },
    {
        id: 'C',
        title: '下半身B（ヒップトップ・体幹・脂肪燃焼）',
        memo: 'お尻の高さを出しつつ、体脂肪削減を加速させる。',
        exercises: [
            { name: 'ヒップスラスト', detail: '15~20回 × 3セット' },
            { name: 'バックエクステンション', detail: '自重 / 15回 × 3セット' },
            { name: 'ハンギングレッグレイズ', detail: '12〜15回 × 3セット' },
            { name: 'ヒップアブダクション', detail: '骨盤前傾 / 15~20回 × 3セット' },
        ]
    },
    {
        id: 'D',
        title: '上半身（バストアップ＆二の腕メイン）',
        memo: 'デコルテのボリューム形成と二の腕のトーン調整に重点。',
        exercises: [
            { name: 'インクライン・ダンベルフライ', detail: '軽いダンベル / 15~20回 × 3セット' },
            { name: 'シーテッドローイング', detail: '15~20回 × 3セット' },
            { name: 'ケーブル・トライセプス・キックバック', detail: 'ケーブル軽め / 15〜20回 × 3セット' },
            { name: 'フェイスプル', detail: 'ケーブル軽め / 15〜20回 × 3セット' },
        ]
    },
    {
        id: 'E',
        title: '下半身C（裏ももストレッチ＆ヒップアップ）',
        memo: 'もも裏のストレッチ感を重視し、前ももの張りを予防しながらお尻を引き締める。',
        exercises: [
            { name: 'ケーブル・グルートキックバック', detail: '左右各15〜20回 × 3セット' },
            { name: 'バーベル・グッドモーニング', detail: '空バー〜軽め15~20回 × 3セット' },
            { name: 'ライイング・レッグカール', detail: 'マシン軽め / 15~20回 × 3セット' },
            { name: 'ヒップアブダクション', detail: '骨盤立てる / 15~20回 × 3セット' },
        ]
    },
    {
        id: 'F',
        title: 'リカバリー・有酸素',
        memo: '高頻度トレーニングの疲労を抜きつつ、有酸素運動で脂肪燃焼を促進。',
        exercises: [
            { name: '傾斜ウォーキング', detail: '30〜40分 (傾斜5〜8%、時速4.0〜4.5km)' },
        ]
    }
];

// アプリ全体の状態
let state = {
    lastCompletedId: null,
    lastCompletedDate: null,
    menus: JSON.parse(JSON.stringify(initialDefaultMenus)),
    logs: [],
    calendarYear: new Date().getFullYear(),
    calendarMonth: new Date().getMonth(),
    editingMenuId: null,
    rotationMode: 'sequence', // 'sequence'（順番通り） or 'weekday'（曜日固定）
    weekdayMenus: { 0: 'F', 1: 'A', 2: 'B', 3: 'C', 4: 'D', 5: 'E', 6: 'OFF' }, // 0=日曜〜6=土曜
    sequenceOrder: ['A', 'B', 'C', 'D', 'E', 'F'], // 「順番通り」モードでの実施順（並び替え可能）
    exerciseLabels: ['胸', '背中', '脚', '肩', '腕', 'お尻', '腹筋', '有酸素運動', 'その他'], // 種目のラベル分類
    exerciseLibrary: {} // ラベルごとに、自由入力で使った種目名を記憶しておくライブラリ
};

function init() {
    loadState();
    recalculateLastCompleted();
    renderRecommendation();
    renderCalendar();
    renderMenuTable();

    // イベントリスナーの設定をDOM読み込み完了後（init内）に行う
    const startBtn = document.getElementById('btn-start-today');
    if (startBtn) {
        startBtn.addEventListener('click', () => {
            const currentRecId = getRecommendedMenuId();
            openWorkoutLogModal(currentRecId === 'OFF' ? 'A' : currentRecId);
        });
    }

    const settingsBtn = document.getElementById('btn-open-rotation-settings');
    if (settingsBtn) {
        settingsBtn.addEventListener('click', openRotationSettingsModal);
    }

    const libraryBtn = document.getElementById('btn-open-exercise-library');
    if (libraryBtn) {
        libraryBtn.addEventListener('click', openExerciseLibraryModal);
    }
}

// ★メニュー内容をコードで書き換えたら、この数字を 2, 3, 4... と増やす！
const CURRENT_VERSION = 5; 

function loadState() {
    const savedState = localStorage.getItem('workout_tracker_state');
    if (savedState) {
        const parsed = JSON.parse(savedState);
        
        // 保存データのバージョンが古い場合は、メニューだけコード側（最新）で上書きする
        if (!parsed.version || parsed.version < CURRENT_VERSION) {
            state.menus = JSON.parse(JSON.stringify(initialDefaultMenus));
            state.sequenceOrder = ['A', 'B', 'F', 'C', 'D', 'E'];
            state.logs = parsed.logs || []; // ※過去のトレー二ング記録は消えずに残ります
        } else {
            if (parsed.menus) state.menus = parsed.menus;
            if (parsed.logs) state.logs = parsed.logs;
        }
        state.lastCompletedId = parsed.lastCompletedId || null;
        state.lastCompletedDate = parsed.lastCompletedDate || null;
        state.rotationMode = parsed.rotationMode || 'sequence';
        state.weekdayMenus = parsed.weekdayMenus || { 0: 'F', 1: 'A', 2: 'B', 3: 'C', 4: 'D', 5: 'E', 6: 'OFF' };
        sequenceOrder: ['A', 'B', 'F', 'C', 'D', 'E'],
        state.exerciseLabels = parsed.exerciseLabels || ['胸', '背中', '脚', '肩', '腕', 'お尻', '腹筋', '有酸素運動', 'その他'];
        // exerciseLibrary の中身をあらかじめ充実させたので、古いスキーマのデータは作り直す
        if (parsed.exerciseLibrarySchema === 'label-v3' && parsed.exerciseLibrary) {
            state.exerciseLibrary = parsed.exerciseLibrary;
        } else {
            state.exerciseLibrary = buildDefaultExerciseLibrary();
        }
    } else {
        state.exerciseLibrary = buildDefaultExerciseLibrary();
    }
}

// ラベルごとの種目リストの初期値（よく使う種目をあらかじめ登録しておき、使うたびに追加もできる）
function buildDefaultExerciseLibrary() {
    return {
        '胸': ['インクラインプレス', 'ベンチプレス', 'ペックフライ', 'チェストプレス', 'スミスマシン・インクラインベンチプレス', 'ケーブルクロス', 'ディップス', 'ダンベルフライ', 'ダンベルプレス', 'インクラインダンベルプレス'],
        '背中': ['デッドリフト', 'ラットプルダウン', 'プーリーロー', 'チンニング（懸垂）', 'ベントオーバーロー'],
        '脚': ['アダクション', 'ブルガリアンスクワット', 'スクワット', 'スミスマシン・バーベルスクワット', 'レッグプレス', 'レッグエクステンション', 'レッグカール'],
        '肩': ['サイドレイズ', 'ショルダープレス', 'フロントレイズ', 'ダンベルショルダープレス', 'ケーブルフェイスプル'],
        '腕': ['バーベルカール', 'アームカール', 'ケーブルプレスダウン'],
        'お尻': ['ヒップアブダクション（骨盤前傾）', 'ヒップアブダクション（骨盤立て）','ヒップアブダクション（骨盤後傾）','ヒップスラスト'],
        '腹筋': ['アブドミナル', 'トーソ・ローテーション', 'プランク', '上体起こし'],
        '有酸素運動': ['トレッドミル'],
        'その他': []
    };
}

function saveState() {
    localStorage.setItem('workout_tracker_state', JSON.stringify({
        version: CURRENT_VERSION, // バージョン番号も一緒に保存する
        lastCompletedId: state.lastCompletedId,
        lastCompletedDate: state.lastCompletedDate,
        menus: state.menus,
        logs: state.logs,
        rotationMode: state.rotationMode,
        weekdayMenus: state.weekdayMenus,
        sequenceOrder: state.sequenceOrder,
        exerciseLabels: state.exerciseLabels,
        exerciseLibrarySchema: 'label-v3',
        exerciseLibrary: state.exerciseLibrary
    }));
}

function recalculateLastCompleted() {
    const workoutLogs = state.logs.filter(l => l.menuId !== 'OFF');
    if (workoutLogs.length > 0) {
        const latest = workoutLogs[workoutLogs.length - 1];
        state.lastCompletedId = latest.menuId;
        const [y, m, d] = latest.date.split('-');
        state.lastCompletedDate = `${y}/${parseInt(m)}/${parseInt(d)}`;
    } else {
        state.lastCompletedId = null;
        state.lastCompletedDate = null;
    }
}

function getNextMenuId(currentId) {
    const sequence = state.sequenceOrder;
    if (!currentId) return sequence[0];
    const currentIndex = sequence.indexOf(currentId);
    if (currentIndex === -1 || currentIndex === sequence.length - 1) {
        return sequence[0];
    }
    return sequence[currentIndex + 1];
}

// 現在のローテーション設定（順番通り／曜日固定）に応じて、今日おすすめのメニューIDを返す
function getRecommendedMenuId() {
    if (state.rotationMode === 'weekday') {
        const todayWeekday = new Date().getDay(); // 0=日曜〜6=土曜
        return state.weekdayMenus[todayWeekday] || 'OFF';
    }
    return getNextMenuId(state.lastCompletedId);
}

function renderRecommendation() {
    const nextId = getRecommendedMenuId();

    const startBtn = document.getElementById('btn-start-today');

    if (nextId === 'OFF') {
        document.getElementById('rec-id').textContent = 'お休み';
        document.getElementById('rec-title').textContent = '今日は設定上オフの日です';
    } else {
        const targetMenu = state.menus.find(m => m.id === nextId);
        document.getElementById('rec-id').textContent = ` ${targetMenu.id}`;
        document.getElementById('rec-title').textContent = targetMenu.title;
    }

    const lastInfoEl = document.getElementById('last-completed-info');
    if (state.lastCompletedId && state.lastCompletedDate) {
        lastInfoEl.textContent = `前回完了:  ${state.lastCompletedId} (${state.lastCompletedDate})`;
    } else {
        lastInfoEl.textContent = '前回完了: なし';
    }
}

function getLastExerciseLogObj(exerciseName) {
    for (let i = state.logs.length - 1; i >= 0; i--) {
        const log = state.logs[i];
        if (log.exerciseLogs && log.exerciseLogs[exerciseName] !== undefined) {
            const val = log.exerciseLogs[exerciseName];
            if (typeof val === 'object' && val !== null) {
                return val;
            }
        }
    }
    return null;
}

function formatLogObj(logObj) {
    if (!logObj) return '';
    if (typeof logObj === 'string') return logObj;

    // 複数セット・複数記録がある場合は「, 」で繋ぐ（スラッシュの乱立を防止）
    if (Array.isArray(logObj)) {
        return logObj.map(item => formatSingleLogObj(item)).filter(Boolean).join(', ');
    }

    return formatSingleLogObj(logObj);
}

function formatSingleLogObj(logObj) {
    if (!logObj) return '';

    // ▼ 有酸素運動の記録（時間・カロリー）
    if (logObj.isCardio || logObj.minutes !== undefined || logObj.calories !== undefined) {
        const parts = [];
        if (logObj.minutes) parts.push(`${logObj.minutes}分`);
        if (logObj.calories) parts.push(`(${logObj.calories}kcal)`); // カロリーはカッコ表示
        return parts.join(' '); // スラッシュを使わずスペースで繋ぐ（例: 30分 (180kcal)）
    }

    // ▼ 通常の筋トレの記録
    const parts = [];
    if (logObj.weight !== null && logObj.weight !== undefined && logObj.weight !== '') {
        parts.push(`${logObj.weight}kg`);
    }
    if (logObj.reps) parts.push(`${logObj.reps}回`);
    if (logObj.sets) parts.push(`${logObj.sets}set`);
    return parts.join(' × '); // 例: 50kg × 10回 × 3set
}

// ページ最下部：テーブル表示描画
function renderMenuTable() {
    const tbody = document.getElementById('menu-table-body');
    if (!tbody) return;

    tbody.innerHTML = '';

    state.menus.forEach(menu => {
        const tr = document.createElement('tr');

        let exListHTML = menu.exercises.map(e => {
            return `
                <div class="table-ex-item">
                    <span class="table-ex-name">• ${e.name}</span> 
                    <span class="table-ex-meta">${e.detail}</span>
                </div>
            `;
        }).join('');

        tr.innerHTML = `
            <td data-label="メニュー"><span class="menu-badge menu-badge-${menu.id}">${menu.id}</span></td>
            <td data-label="対象部位"><strong>${menu.title}</strong></td>
            <td data-label="種目と設定">${exListHTML}</td>
            <td data-label="メモ" style="color:var(--text-sub); font-size:0.8125rem;">${menu.memo || '-'}</td>
            <td data-label=""><button class="btn-table-edit" onclick="openEditModal('${menu.id}')">編集する</button></td>
        `;

        tbody.appendChild(tr);
    });
}


function recordOffDay() {
    const todayISO = getTodayISO();
    const todayStr = getTodayFormatted();

    // 同じ日付の記録がすでにあれば、上書き（重複登録を防ぐ）
    state.logs = state.logs.filter(l => l.date !== todayISO);

    state.logs.push({
        date: todayISO,
        menuId: 'OFF',
        exerciseLogs: {}
    });

    saveState();
    renderCalendar();

}

function openWorkoutLogModal(defaultMenuId, presetDateISO) {
    const targetDate = presetDateISO || getTodayISO();
    const existingLog = state.logs.find(l => l.date === targetDate);

    const selectEl = document.getElementById('select-log-menu');
    selectEl.innerHTML = '';

    const offOption = document.createElement('option');
    offOption.value = 'OFF';
    offOption.textContent = 'オフ（休養日）';
    selectEl.appendChild(offOption);

    state.menus.forEach(menu => {
        const option = document.createElement('option');
        option.value = menu.id;
        option.textContent = ` ${menu.id} : ${menu.title}`;
        selectEl.appendChild(option);
    });

    const dateEl = document.getElementById('select-log-date');
    if (dateEl) {
        dateEl.value = targetDate;
        dateEl.max = getTodayISO();
    }

    // 既存の記録がある場合はそのモード・メニューを再現
    let currentMenuId = defaultMenuId;
    if (existingLog) {
        if (existingLog.menuId === 'OFF') {
            document.getElementById('record-type-off').checked = true;
        } else if (existingLog.recordType === 'free') {
            document.getElementById('record-type-free').checked = true;
            currentMenuId = existingLog.menuId;
        } else {
            document.getElementById('record-type-menu').checked = true;
            currentMenuId = existingLog.menuId;
        }
    } else {
        if (defaultMenuId === 'OFF') {
            document.getElementById('record-type-off').checked = true;
        } else {
            document.getElementById('record-type-menu').checked = true;
        }
    }

    if (currentMenuId && currentMenuId !== 'OFF') {
        selectEl.value = currentMenuId;
    }

    toggleRecordType();

    const activeMenuId = (selectEl.value === 'OFF' || !selectEl.value) ? 'A' : selectEl.value;
    renderWorkoutLogInputs(activeMenuId);

    // 既存記録の数値をフォームに反映
    if (existingLog && existingLog.exerciseLogs && existingLog.menuId !== 'OFF') {
        const menu = state.menus.find(m => m.id === existingLog.menuId);
        
        // メニュー通りの種目の反映
        if (menu && existingLog.recordType !== 'free') {
            menu.exercises.forEach((e, idx) => {
                const logObj = existingLog.exerciseLogs[e.name];
                if (logObj) {
                    if (logObj.isCardio) {
                        const minEl = document.getElementById(`minutes-${idx}`);
                        const calEl = document.getElementById(`calories-${idx}`);
                        if (minEl) minEl.value = logObj.minutes !== undefined ? logObj.minutes : '';
                        if (calEl) calEl.value = logObj.calories !== undefined ? logObj.calories : '';
                    } else {
                        const wEl = document.getElementById(`weight-${idx}`);
                        const rEl = document.getElementById(`reps-${idx}`);
                        const sEl = document.getElementById(`sets-${idx}`);
                        if (wEl) wEl.value = logObj.weight !== undefined ? logObj.weight : '';
                        if (rEl) rEl.value = logObj.reps !== undefined ? logObj.reps : '';
                        if (sEl) sEl.value = logObj.sets !== undefined ? logObj.sets : '';
                    }
                }
            });
        }

        // 追加種目・自由入力種目の復元
        document.getElementById('extra-exercise-container').innerHTML = '';
        for (const [exName, logObj] of Object.entries(existingLog.exerciseLogs)) {
            const isNormalEx = menu && menu.exercises.some(e => e.name === exName);
            if (!isNormalEx || existingLog.recordType === 'free') {
                const cleanName = exName.replace('【追加】', '');
                addExtraExerciseInput();
                const container = document.getElementById('extra-exercise-container');
                const lastBlock = container.lastElementChild;
                if (lastBlock) {
                    const nameInput = lastBlock.querySelector('.extra-name-input');
                    if (nameInput) nameInput.value = cleanName;

                    if (logObj.label) {
                        const labelSelect = lastBlock.querySelector('.extra-label-select');
                        if (labelSelect) {
                            labelSelect.value = logObj.label;
                            renderExerciseChipsForBlock(lastBlock);
                        }
                    }

                    if (logObj.isCardio) {
                        const minInput = lastBlock.querySelector('.extra-minutes');
                        const calInput = lastBlock.querySelector('.extra-calories');
                        if (minInput) minInput.value = logObj.minutes !== undefined ? logObj.minutes : '';
                        if (calInput) calInput.value = logObj.calories !== undefined ? logObj.calories : '';
                    } else {
                        const wInput = lastBlock.querySelector('.extra-weight');
                        const rInput = lastBlock.querySelector('.extra-reps');
                        const sInput = lastBlock.querySelector('.extra-sets');
                        if (wInput) wInput.value = logObj.weight !== undefined ? logObj.weight : '';
                        if (rInput) rInput.value = logObj.reps !== undefined ? logObj.reps : '';
                        if (sInput) sInput.value = logObj.sets !== undefined ? logObj.sets : '';
                    }
                }
            }
        }
    } else {
        document.getElementById('extra-exercise-container').innerHTML = '';
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

    if (isOff) {
        // オフ選択時は種目入力やメニュー選択をすべて非表示
        selectMenuLabel.style.display = 'none';
        selectMenu.style.display = 'none';
        logInputs.style.display = 'none';
        freeSection.style.display = 'none';
    } else {
        // 通常・自由入力時は表示に戻す
        selectMenuLabel.style.display = 'block';
        selectMenu.style.display = 'block';
        
        logInputs.style.display = isFree ? 'none' : 'block';
        freeSection.style.display = 'block';

        selectMenuLabel.textContent = isFree ? '対象部位' : 'メニュー選択';
        document.getElementById('extra-exercise-label').textContent = isFree ? '実施した種目' : '追加でやった種目（任意）';

        if (isFree) {
            const container = document.getElementById('extra-exercise-container');
            if (container.children.length === 0) {
                addExtraExerciseInput();
            }
        }
    }
}

function onLogMenuSelectChange(selectedMenuId) {
    renderWorkoutLogInputs(selectedMenuId);
}

function renderWorkoutLogInputs(menuId) {
    const menu = state.menus.find(m => m.id === menuId);
    const container = document.getElementById('workout-log-inputs');
    container.innerHTML = '';

    menu.exercises.forEach((e, idx) => {
        const lastObj = getLastExerciseLogObj(e.name) || {};
        // 種目名やメニューIDから有酸素かどうか判定
        const isCardio = menuId === 'F' || e.name.includes('ウォーキング') || e.name.includes('有酸素') || e.name.includes('トレッドミル') || e.name.includes('ランニング');

        const block = document.createElement('div');
        block.className = 'log-exercise-block';

        if (isCardio) {
            // 有酸素用の入力欄（時間・カロリー）
            block.innerHTML = `
                <div class="log-exercise-title">${e.name} <span style="font-size:0.8rem; font-weight:normal; color:var(--text-sub);">(${e.detail})</span></div>
                <div class="direct-input-group" data-cardio="true">
                    <div class="direct-field">
                        <label>時間 (分)</label>
                        <input type="number" id="minutes-${idx}" inputmode="numeric" value="${lastObj.minutes !== undefined ? lastObj.minutes : 30}" placeholder="30">
                    </div>
                    <div class="direct-field">
                        <label>消費カロリー (kcal)</label>
                        <input type="number" id="calories-${idx}" inputmode="numeric" value="${lastObj.calories !== undefined ? lastObj.calories : ''}" placeholder="150">
                    </div>
                </div>
            `;
        } else {
            // 筋トレ用の入力欄（重量・回数・セット）
            block.innerHTML = `
                <div class="log-exercise-title">${e.name} <span style="font-size:0.8rem; font-weight:normal; color:var(--text-sub);">(${e.detail})</span></div>
                <div class="direct-input-group" data-cardio="false">
                    <div class="direct-field">
                        <label>重量 (kg)</label>
                        <input type="number" id="weight-${idx}" step="0.5" inputmode="decimal" value="${lastObj.weight !== undefined ? lastObj.weight : ''}" placeholder="0">
                    </div>
                    <div class="direct-field">
                        <label>回数 (reps)</label>
                        <input type="number" id="reps-${idx}" inputmode="numeric" value="${lastObj.reps !== undefined ? lastObj.reps : 10}" placeholder="10">
                    </div>
                    <div class="direct-field">
                        <label>セット数</label>
                        <input type="number" id="sets-${idx}" inputmode="numeric" value="${lastObj.sets !== undefined ? lastObj.sets : 3}" placeholder="3">
                    </div>
                </div>
            `;
        }
        container.appendChild(block);
    });
}

function addExtraExerciseInput() {
    const container = document.getElementById('extra-exercise-container');
    const block = document.createElement('div');
    block.className = 'extra-log-block';

    const labelOptionsHTML = state.exerciseLabels.map(label => `<option value="${label}">${label}</option>`).join('');

    block.innerHTML = `
        <label class="extra-label-select-label">ラベル</label>
        <select class="form-input extra-label-select" onchange="renderExerciseChipsForBlock(this.closest('.extra-log-block'))">
            ${labelOptionsHTML}
        </select>
        <div class="exercise-chip-list extra-chip-list"></div>
        <div class="extra-title-row">
            <input type="text" class="form-input extra-name-input" placeholder="種目名（新規入力）" onblur="prefillLastLogValues(this.closest('.extra-log-block'), this.value.trim())">
            <button type="button" class="btn-remove-row" onclick="this.closest('.extra-log-block').remove()">&times;</button>
        </div>
        <div class="extra-fields-container">
            <!-- ラベルに応じて動的に描画されます -->
        </div>
    `;

    container.appendChild(block);
    renderExerciseChipsForBlock(block);
}

function renderExerciseChipsForBlock(block) {
    const label = block.querySelector('.extra-label-select').value;
    const chipList = block.querySelector('.extra-chip-list');
    const nameInput = block.querySelector('.extra-name-input');
    const fieldsContainer = block.querySelector('.extra-fields-container');

    const isCardio = (label === '有酸素運動');

    // ラベルに応じて入力フィールドを切り替え
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
            <div class="direct-input-group" data-cardio="false">
                <div class="direct-field">
                    <label>重量 (kg)</label>
                    <input type="number" class="extra-weight" step="0.5" inputmode="decimal" placeholder="0">
                </div>
                <div class="direct-field">
                    <label>回数 (reps)</label>
                    <input type="number" class="extra-reps" inputmode="numeric" placeholder="10">
                </div>
                <div class="direct-field">
                    <label>セット数</label>
                    <input type="number" class="extra-sets" inputmode="numeric" placeholder="3">
                </div>
            </div>
        `;
    }

    const names = state.exerciseLibrary[label] || [];

    if (names.length === 0) {
        chipList.innerHTML = `<span class="exercise-chip-empty">まだ種目がありません（設定 📋 から追加できます）</span>`;
        return;
    }

    chipList.innerHTML = names.map(name =>
        `<button type="button" class="exercise-chip" data-name="${name}">${name}</button>`
    ).join('');

    chipList.querySelectorAll('.exercise-chip').forEach(chip => {
        chip.addEventListener('click', () => {
            const name = chip.getAttribute('data-name');
            nameInput.value = name;
            chipList.querySelectorAll('.exercise-chip').forEach(c => c.classList.remove('selected'));
            chip.classList.add('selected');
            prefillLastLogValues(block, name);
        });
    });
}

// 選んだ種目名の前回記録（重量・回数・セット数）を、その行の入力欄にデフォルト表示する
function prefillLastLogValues(block, name) {
    const lastObj = getLastExerciseLogObj(name);
    if (!lastObj) return;

    const weightInput = block.querySelector('.extra-weight');
    const repsInput = block.querySelector('.extra-reps');
    const setsInput = block.querySelector('.extra-sets');

    if (weightInput && lastObj.weight !== undefined && lastObj.weight !== null) weightInput.value = lastObj.weight;
    if (repsInput && lastObj.reps !== undefined && lastObj.reps !== null) repsInput.value = lastObj.reps;
    if (setsInput && lastObj.sets !== undefined && lastObj.sets !== null) setsInput.value = lastObj.sets;
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
        recalculateLastCompleted();
        saveState();
        renderRecommendation();
        renderCalendar();
        renderMenuTable();
        closeWorkoutLogModal();
        return;
    }

    const selectedMenuId = document.getElementById('select-log-menu').value;
    const menu = state.menus.find(m => m.id === selectedMenuId);
    const exerciseLogs = {};

    // ログ追加用ヘルパー関数（既存があれば配列化して追加）
    const appendExerciseLog = (key, dataObj) => {
        if (!exerciseLogs[key]) {
            exerciseLogs[key] = [];
        }
        exerciseLogs[key].push(dataObj);
    };

    if (!isFree) {
        // メニュー通りモード
        menu.exercises.forEach((e, idx) => {
            const minEl = document.getElementById(`minutes-${idx}`);
            if (minEl) {
                const minutes = minEl.value;
                const calories = document.getElementById(`calories-${idx}`).value;
                appendExerciseLog(e.name, {
                    isCardio: true,
                    minutes: minutes !== '' ? parseInt(minutes, 10) : 0,
                    calories: calories !== '' ? parseInt(calories, 10) : 0
                });
            } else {
                const weight = document.getElementById(`weight-${idx}`).value;
                const reps = document.getElementById(`reps-${idx}`).value;
                const sets = document.getElementById(`sets-${idx}`).value;
                appendExerciseLog(e.name, {
                    weight: weight !== '' ? parseFloat(weight) : 0,
                    reps: reps !== '' ? parseInt(reps, 10) : 0,
                    sets: sets !== '' ? parseInt(sets, 10) : 0
                });
            }
        });
    }

    // 追加・自由入力種目の取得
    const extraBlocks = document.querySelectorAll('.extra-log-block');
    let freeEntryCount = 0;

    extraBlocks.forEach(block => {
        const name = block.querySelector('.extra-name-input').value.trim();
        const minInput = block.querySelector('.extra-minutes');
        const labelSelect = block.querySelector('.extra-label-select');
        const label = labelSelect ? labelSelect.value : state.exerciseLabels[0];

        if (name) {
            freeEntryCount++;
            const key = isFree ? name : `【追加】${name}`;

            if (minInput) {
                const calories = block.querySelector('.extra-calories').value;
                appendExerciseLog(key, {
                    isCardio: true,
                    minutes: minInput.value !== '' ? parseInt(minInput.value, 10) : 0,
                    calories: calories !== '' ? parseInt(calories, 10) : 0,
                    label: label
                });
            } else {
                const weight = block.querySelector('.extra-weight').value;
                const reps = block.querySelector('.extra-reps').value;
                const sets = block.querySelector('.extra-sets').value;
                appendExerciseLog(key, {
                    weight: weight !== '' ? parseFloat(weight) : 0,
                    reps: reps !== '' ? parseInt(reps, 10) : 0,
                    sets: sets !== '' ? parseInt(sets, 10) : 0,
                    label: label
                });
            }

            if (!state.exerciseLibrary[label]) state.exerciseLibrary[label] = [];
            if (!state.exerciseLibrary[label].includes(name)) state.exerciseLibrary[label].push(name);
        }
    });

    if (isFree && freeEntryCount === 0) {
        alert('自由入力モードでは、少なくとも1種目は入力してください。');
        return;
    }

    state.logs = state.logs.filter(l => l.date !== selectedISO);
    state.logs.push({
        date: selectedISO,
        menuId: selectedMenuId,
        recordType: isFree ? 'free' : 'menu',
        exerciseLogs: exerciseLogs
    });

    state.logs.sort((a, b) => a.date.localeCompare(b.date));

    recalculateLastCompleted();
    saveState();
    renderRecommendation();
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
        titleEl.textContent = 'オフ (休養日)';
        bodyEl.innerHTML = '<p style="color:var(--text-sub);">この日は休養日として記録されています。</p>';
    } else {
        const menu = state.menus.find(m => m.id === log.menuId);
        const menuTitle = menu ? menu.title : '';
        const freeBadge = log.recordType === 'free' ? ' <span style="font-size:0.75rem; font-weight:700; color:var(--lavender); background:var(--lavender-soft); padding:2px 8px; border-radius:8px; vertical-align:middle;">自由入力</span>' : '';
        titleEl.innerHTML = `メニュー ${log.menuId} (${menuTitle})${freeBadge}`;

        let html = '';
        if (log.exerciseLogs && Object.keys(log.exerciseLogs).length > 0) {
            html += '<div style="display:flex; flex-direction:column; gap:8px;">';
            for (const [exName, logVal] of Object.entries(log.exerciseLogs)) {
                const formatted = formatLogObj(logVal);
                const isExtra = exName.startsWith('【追加】');
                const styleAttr = isExtra ? 'color: var(--primary-color); font-weight:600;' : 'font-weight:500;';

                html += `
                    <div style="display:flex; justify-content:space-between; border-bottom:1px dashed var(--border-color); padding-bottom:6px;">
                        <span style="${styleAttr}">${exName}</span>
                        <span style="color:var(--text-sub); font-size:0.9rem;">${formatted}</span>
                    </div>
                `;
            }
            html += '</div>';
        } else {
            html = '<p style="color:var(--text-sub);">各種目の詳細ログはありません。</p>';
        }
        bodyEl.innerHTML = html;
    }

    const deleteBtn = document.getElementById('btn-delete-detail-log');
    deleteBtn.onclick = () => {
        if (confirm(`${log.date} の記録を削除しますか？`)) {
            deleteLogByIndex(logIndex);
            closeDetailLogModal();
        }
    };

    // ▼ ここを追加：編集ボタンを押したら入力モーダルを開く
    const editBtn = document.getElementById('btn-edit-detail-log');
    if (editBtn) {
        editBtn.onclick = () => {
            closeDetailLogModal();
            openWorkoutLogModal(log.menuId, log.date);
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
    recalculateLastCompleted();
    saveState();
    renderRecommendation();
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
        <input type="text" class="form-input input-name" placeholder="種目名" value="${name}">
        <input type="text" class="form-input input-detail" placeholder="目安セット・回数" value="${detail}">
        <button type="button" class="btn-remove-row" onclick="this.parentElement.remove()">&times;</button>
    `;
    container.appendChild(row);
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
        if (name) {
            newExercises.push({ name, detail });
        }
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
                tag.textContent = log.recordType === 'free' ? `${log.menuId}✎` : log.menuId;
                tag.title = log.recordType === 'free' ? '自由入力の記録：クリックして詳細確認・削除' : 'クリックして詳細確認・削除';
                tag.onclick = (e) => {
                    e.stopPropagation();
                    openDetailLogModal(index);
                };
                cell.appendChild(tag);
            }
        });

        // 記録がまだない今日以前の日付は、クリックでその日付の記録モーダルを開けるようにする
        if (!hasLog && dateStr <= todayISO) {
            cell.classList.add('clickable');
            cell.title = 'クリックしてこの日の記録を追加';
            cell.onclick = () => {
                openWorkoutLogModal(getRecommendedMenuId() === 'OFF' ? state.sequenceOrder[0] : getRecommendedMenuId(), dateStr);
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

function getTodayFormatted() {
    return new Date().toLocaleDateString('ja-JP', {
        year: 'numeric',
        month: 'numeric',
        day: 'numeric'
    });
}

function resetData() {
    if (confirm('履歴、完了データ、カスタムメニューをすべて初期化しますか？')) {
        localStorage.removeItem('workout_tracker_state');
        state.lastCompletedId = null;
        state.lastCompletedDate = null;
        state.menus = JSON.parse(JSON.stringify(initialDefaultMenus));
        state.logs = [];
        state.rotationMode = 'sequence';
        state.weekdayMenus = { 0: 'F', 1: 'A', 2: 'B', 3: 'C', 4: 'D', 5: 'E', 6: 'OFF' };
        state.sequenceOrder = ['A', 'B', 'F', 'C', 'D', 'E'];
        state.exerciseLabels = ['胸', '背中', '脚', '肩', '腕', 'お尻', '腹筋', '有酸素運動', 'その他'];
        state.exerciseLibrary = buildDefaultExerciseLibrary();
        init();
    }
}

const WEEKDAY_LABELS = ['日', '月', '火', '水', '木', '金', '土'];

let tempSequenceOrder = [];

function openRotationSettingsModal() {
    // モード切替ラジオボタンの状態を反映
    document.getElementById('rotation-mode-sequence').checked = state.rotationMode === 'sequence';
    document.getElementById('rotation-mode-weekday').checked = state.rotationMode === 'weekday';

    tempSequenceOrder = [...state.sequenceOrder]; // キャンセル時に戻せるよう作業用コピーを用意
    renderSequenceOrderInputs();
    renderWeekdayAssignmentInputs();
    toggleWeekdaySection();

    document.getElementById('rotation-settings-modal').classList.add('active');
}

function closeRotationSettingsModal() {
    document.getElementById('rotation-settings-modal').classList.remove('active');
}

function toggleWeekdaySection() {
    const isWeekday = document.getElementById('rotation-mode-weekday').checked;
    document.getElementById('weekday-assignment-section').style.display = isWeekday ? 'block' : 'none';
    document.getElementById('sequence-order-section').style.display = isWeekday ? 'none' : 'block';
}

function renderSequenceOrderInputs() {
    const container = document.getElementById('sequence-order-container');
    container.innerHTML = '';

    tempSequenceOrder.forEach((menuId, idx) => {
        const menu = state.menus.find(m => m.id === menuId);
        const row = document.createElement('div');
        row.className = 'sequence-row';
        row.innerHTML = `
            <span class="sequence-row-num">${idx + 1}</span>
            <div class="sequence-row-info">
                <span class="menu-badge menu-badge-${menuId}">${menuId}</span>
                <span class="sequence-row-title">${menu ? menu.title : ''}</span>
            </div>
            <div class="sequence-row-actions">
                <button type="button" class="btn-seq-move" data-idx="${idx}" data-dir="-1" ${idx === 0 ? 'disabled' : ''}>↑</button>
                <button type="button" class="btn-seq-move" data-idx="${idx}" data-dir="1" ${idx === tempSequenceOrder.length - 1 ? 'disabled' : ''}>↓</button>
            </div>
        `;
        container.appendChild(row);
    });

    container.querySelectorAll('.btn-seq-move').forEach(btn => {
        btn.addEventListener('click', () => {
            const idx = parseInt(btn.getAttribute('data-idx'), 10);
            const dir = parseInt(btn.getAttribute('data-dir'), 10);
            const targetIdx = idx + dir;
            if (targetIdx < 0 || targetIdx >= tempSequenceOrder.length) return;

            [tempSequenceOrder[idx], tempSequenceOrder[targetIdx]] = [tempSequenceOrder[targetIdx], tempSequenceOrder[idx]];
            renderSequenceOrderInputs();
        });
    });
}

function renderWeekdayAssignmentInputs() {
    const container = document.getElementById('weekday-assignment-container');
    container.innerHTML = '';

    for (let day = 0; day <= 6; day++) {
        const row = document.createElement('div');
        row.className = 'weekday-row';

        const currentVal = state.weekdayMenus[day] || 'OFF';

        let optionsHTML = '<option value="OFF">オフ</option>';
        state.menus.forEach(menu => {
            const selected = currentVal === menu.id ? 'selected' : '';
            optionsHTML += `<option value="${menu.id}" ${selected}>メニュー ${menu.id}：${menu.title}</option>`;
        });
        if (currentVal === 'OFF') {
            optionsHTML = optionsHTML.replace('value="OFF"', 'value="OFF" selected');
        }

        row.innerHTML = `
            <span class="weekday-row-label">${WEEKDAY_LABELS[day]}曜日</span>
            <select class="form-input weekday-select" data-day="${day}">${optionsHTML}</select>
        `;
        container.appendChild(row);
    }
}

function saveRotationSettings() {
    const isWeekday = document.getElementById('rotation-mode-weekday').checked;
    state.rotationMode = isWeekday ? 'weekday' : 'sequence';
    state.sequenceOrder = [...tempSequenceOrder];

    if (isWeekday) {
        const selects = document.querySelectorAll('.weekday-select');
        const newWeekdayMenus = {};
        selects.forEach(sel => {
            const day = parseInt(sel.getAttribute('data-day'), 10);
            newWeekdayMenus[day] = sel.value;
        });
        state.weekdayMenus = newWeekdayMenus;
    }

    saveState();
    renderRecommendation();
    closeRotationSettingsModal();
}

let currentLibraryLabel = null;

function openExerciseLibraryModal() {
    currentLibraryLabel = state.exerciseLabels[0];
    renderLibraryLabelTabs();
    renderLibraryExerciseChips();
    document.getElementById('exercise-library-modal').classList.add('active');
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

    container.innerHTML = names.map(name => `
        <span class="exercise-chip removable">
            ${name}
            <button type="button" class="chip-remove-btn" data-name="${name}" title="削除">&times;</button>
        </span>
    `).join('');

    container.querySelectorAll('.chip-remove-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const name = btn.getAttribute('data-name');
            if (confirm(`「${name}」をリストから削除しますか？`)) {
                state.exerciseLibrary[currentLibraryLabel] = state.exerciseLibrary[currentLibraryLabel].filter(n => n !== name);
                saveState();
                renderLibraryExerciseChips();
            }
        });
    });
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
    saveState();
    input.value = '';
    renderLibraryExerciseChips();
}

// DOM読み込み完了時に初期化を実行（このファイル内で init() を呼ぶのはここ1箇所だけ）
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}