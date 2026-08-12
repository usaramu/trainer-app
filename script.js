let isEditingLogMode = false;

// 初期メニュー構成データ（ヒップアブダクションの分類反映版）
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
        title: '下半身（お尻・裏もも・腰）',
        memo: '前ももを使わず、もも裏とお尻の境目を作って小尻・脚長を狙う。',
        exercises: [
            { name: 'バーベル/ダンベル・ルーマニアンデッドリフト', detail: '15~20回 × 3セット' },
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
            { name: 'ハンギングレッグレイズ', detail: '12〜15回 × 3セット' },
            { name: 'ヒップアブダクション（骨盤前傾）', detail: '15~20回 × 3セット' },
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
        title: '下半身（裏ももストレッチ＆ヒップアップ）',
        memo: 'もも裏のストレッチ感を重視し、前ももの張りを予防しながらお尻を引き締める。',
        exercises: [
            { name: 'ケーブル・グルートキックバック', detail: '左右各15〜20回 × 3セット' },
            { name: 'バーベル・グッドモーニング', detail: '空バー〜軽め15~20回 × 3セット' },
            { name: 'ライイング・レッグカール', detail: 'マシン軽め / 15~20回 × 3セット' },
            { name: 'ヒップアブダクション（骨盤立て）', detail: '15~20回 × 3セット' },
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

const MENU_LABELS = {
    'A': '上', 'B': '下', 'C': '下', 'D': '上', 'E': '下', 'F': '🏃', 'ALL': '全', 'OFF': '休'
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
    exerciseLibrary: {}
};

function init() {
    loadState();
    applyTheme(state.theme);
    renderRecommendation();
    renderCalendar();
    renderMenuTable();

    const libraryBtn = document.getElementById('btn-open-exercise-library');
    if (libraryBtn) {
        libraryBtn.addEventListener('click', openExerciseLibraryModal);
    }
}

// 既存データ内のヒップアブダクションを自動的に上書き分類する処理を追加
function loadState() {
    const savedState = localStorage.getItem('workout_tracker_state');
    if (savedState) {
        const parsed = JSON.parse(savedState);
        if (parsed.theme) state.theme = parsed.theme;
        
        if (parsed.menus) {
            state.menus = parsed.menus;
            // 既存のメニュー内の「ヒップアブダクション」を自動修正（マイグレーション）
            state.menus.forEach(menu => {
                if (menu.id === 'B') {
                    menu.exercises.forEach(ex => { if (ex.name === 'ヒップアブダクション') ex.name = 'ヒップアブダクション（骨盤後傾）'; });
                } else if (menu.id === 'C') {
                    menu.exercises.forEach(ex => { if (ex.name === 'ヒップアブダクション') ex.name = 'ヒップアブダクション（骨盤前傾）'; });
                } else if (menu.id === 'E') {
                    menu.exercises.forEach(ex => { if (ex.name === 'ヒップアブダクション') ex.name = 'ヒップアブダクション（骨盤立て）'; });
                }
            });
        }
        
        if (parsed.logs) state.logs = parsed.logs;
        state.exerciseLabels = parsed.exerciseLabels || ['胸', '背中', '脚', '肩', '腕', 'お尻', '腹筋', '全身', '有酸素運動', 'その他'];
        
        if (parsed.exerciseLibrarySchema === 'label-v3' && parsed.exerciseLibrary) {
            state.exerciseLibrary = parsed.exerciseLibrary;
        } else {
            state.exerciseLibrary = buildDefaultExerciseLibrary();
        }
    } else {
        state.exerciseLibrary = buildDefaultExerciseLibrary();
    }
}

function saveState() {
    localStorage.setItem('workout_tracker_state', JSON.stringify({
        theme: state.theme,
        menus: state.menus,
        logs: state.logs,
        exerciseLabels: state.exerciseLabels,
        exerciseLibrarySchema: 'label-v3',
        exerciseLibrary: state.exerciseLibrary
    }));
}

/* ★ テーマ変更機能 */
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
        '胸': ['インクラインプレス', 'ベンチプレス', 'ペックフライ', 'チェストプレス', 'スミスマシン・インクラインベンチプレス', 'ケーブルクロス', 'ディップス', 'ダンベルフライ', 'ダンベルプレス', 'インクラインダンベルプレス'],
        '背中': ['デッドリフト', 'ラットプルダウン', 'プーリーロー', 'チンニング（懸垂）', 'ベントオーバーロー'],
        '脚': ['アダクション', 'ブルガリアンスクワット', 'スクワット', 'スミスマシン・バーベルスクワット', 'レッグプレス', 'レッグエクステンション', 'レッグカール'],
        '肩': ['サイドレイズ', 'ショルダープレス', 'フロントレイズ', 'ダンベルショルダープレス', 'ケーブルフェイスプル'],
        '腕': ['バーベルカール', 'アームカール', 'ケーブルプレスダウン'],
        'お尻': ['ヒップアブダクション（骨盤前傾）', 'ヒップアブダクション（骨盤立て）','ヒップアブダクション（骨盤後傾）','ヒップスラスト'],
        '腹筋': ['アブドミナル', 'トーソ・ローテーション', 'プランク', '上体起こし'],
        '全身': ['クリーン', 'スナッチ', 'バーピー'],
        '有酸素運動': ['トレッドミル', '傾斜ウォーキング'],
        'その他': []
    };
}

// 部位ごとの前回からの経過日数を計算して更新する（修正版）
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

function fillSetsContainerFromItem(block, item) {
    const setsContainer = block.querySelector('.sets-container');
    if (!setsContainer || !item) return;

    setsContainer.innerHTML = '';

    const setsToRestore = (Array.isArray(item.setsArray) && item.setsArray.length > 0)
        ? item.setsArray
        : [{ weight: item.weight, reps: item.reps }];

    setsToRestore.forEach(s => {
        addSetRowToBlock(
            block,
            s.weight !== undefined && s.weight !== null ? s.weight : '',
            s.reps !== undefined && s.reps !== null ? s.reps : ''
        );
    });
}

function formatSingleLogObj(logObj) {
    if (!logObj) return '';

    if (logObj.isCardio || logObj.minutes !== undefined || logObj.calories !== undefined) {
        const parts = [];
        if (logObj.minutes) parts.push(`${logObj.minutes}分`);
        if (logObj.calories) parts.push(`(${logObj.calories}kcal)`);
        return parts.join(' ');
    }

    if (logObj.setsArray && Array.isArray(logObj.setsArray) && logObj.setsArray.length > 0) {
        const groupedSets = [];
        let currentGroup = null;

        logObj.setsArray.forEach(set => {
            if (currentGroup && currentGroup.weight === set.weight && currentGroup.reps === set.reps) {
                currentGroup.count++;
            } else {
                if (currentGroup) {
                    groupedSets.push(currentGroup);
                }
                currentGroup = { weight: set.weight, reps: set.reps, count: 1 };
            }
        });
        if (currentGroup) groupedSets.push(currentGroup);

        return groupedSets.map(g => {
            if (g.count > 1) return `${g.weight}kg×${g.reps}回 × ${g.count}set`;
            return `${g.weight}kg×${g.reps}回`;
        }).join(', ');
    }

    const parts = [];
    if (logObj.weight !== null && logObj.weight !== undefined && logObj.weight !== '') parts.push(`${logObj.weight}kg`);
    if (logObj.reps) parts.push(`${logObj.reps}回`);
    return parts.join(' × ');
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
    renderCalendar();
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
        } else if (existingLog.recordType === 'free' || existingLog.menuId === 'ALL') {
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

    if (currentMenuId) selectEl.value = currentMenuId;

    toggleRecordType();

    const activeMenuId = (selectEl.value === 'OFF' || selectEl.value === 'ALL' || !selectEl.value) ? 'A' : selectEl.value;
    
    renderWorkoutLogInputs(activeMenuId);

    const suggestedContainer = document.getElementById('suggested-fields-container');
    if (suggestedContainer) suggestedContainer.innerHTML = '';
    
    const extraContainer = document.getElementById('extra-exercise-container');
    if (extraContainer) extraContainer.innerHTML = '';

    if (isEdit && existingLog && existingLog.exerciseLogs && existingLog.menuId !== 'OFF') {
        const isFree = existingLog.recordType === 'free' || existingLog.menuId === 'ALL';
        
        for (const [exName, logVal] of Object.entries(existingLog.exerciseLogs)) {
            const valArray = Array.isArray(logVal) ? logVal : [logVal];
            
            valArray.forEach(item => {
                const itemIsCardio = item.isCardio === true || (item.weight === undefined && item.reps === undefined && item.minutes !== undefined);

                if (!isFree) {
                    addSuggestedExerciseInput(exName, '', selectEl.value, itemIsCardio);
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
                    addExtraExerciseInput();
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
        if (extraLabel) extraLabel.textContent = '実施した種目（⋮⋮ ドラッグで並び替え）';
        if (addExtraBtn) addExtraBtn.style.display = 'inline-block';

        const container = document.getElementById('extra-exercise-container');
        if (container.children.length === 0) {
            addExtraExerciseInput();
        }
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
        <label class="form-label" style="margin-bottom: 0;"></label>
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

// メニュー種目追加時：前回の記録をメニュー名の上に小さく配置する版
function addSuggestedExerciseInput(exerciseName, detailStr = '', menuId = '', forceCardio = null) {
    const container = document.getElementById('suggested-fields-container');
    const lastObj = getLastExerciseLogObj(exerciseName) || {};

    let isCardio = false;
    if (forceCardio !== null && forceCardio !== undefined) {
        isCardio = forceCardio;
    } else {
        const nameLower = exerciseName.toLowerCase();
        isCardio = nameLower.includes('ウォーキング') || nameLower.includes('ランニング') || nameLower.includes('有酸素');
    }

    const block = document.createElement('div');
    block.className = 'extra-log-block';
    block.draggable = true;

    // 前回の実績テキスト整形
    const lastFormatted = formatSingleLogObj(lastObj);
    const lastBadgeHTML = lastFormatted 
        ? `<div style="font-size:0.72rem; color:var(--primary-hover); font-weight:700; margin-bottom:4px; padding-left:22px;">前回: ${lastFormatted}</div>` 
        : '<div style="font-size:0.72rem; color:var(--text-sub); margin-bottom:4px; padding-left:22px;">前回: なし</div>';

    if (isCardio) {
        block.innerHTML = `
            ${lastBadgeHTML}
            <div class="extra-title-row" style="display: flex; align-items: center; justify-content: space-between; gap: 8px; margin-bottom: 8px;">
                <span class="drag-handle">⋮⋮</span>
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
                <span class="drag-handle">⋮⋮</span>
                <input type="text" class="form-input extra-name-input" value="${exerciseName}" readonly style="font-weight:700; background-color:var(--primary-soft); color:var(--text-main); margin-bottom:0; flex: 1;">
                <button type="button" class="btn-remove-row" onclick="this.closest('.extra-log-block').remove()">&times;</button>
            </div>
            <div class="sets-container"></div>
            <button type="button" class="btn-add-set-row" onclick="addSetRowToBlock(this.closest('.extra-log-block'))">＋ セットを追加</button>
        `;
        
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

function addSetRowToBlock(blockEl, initWeight = null, initReps = null) {
    const setsContainer = blockEl.querySelector('.sets-container');
    if (!setsContainer) return;

    const setNum = setsContainer.children.length + 1;
    
    let w = initWeight;
    let r = initReps;
    if (w === null || r === null) {
        const lastRow = setsContainer.lastElementChild;
        if (lastRow) {
            w = lastRow.querySelector('.set-weight').value;
            r = lastRow.querySelector('.set-reps').value;
        }
    }

    const setRow = document.createElement('div');
    setRow.className = 'set-input-row';
    setRow.innerHTML = `
        <span class="set-label">${setNum}set</span>
        <div class="set-field-group">
            <input type="number" class="form-input set-weight" step="0.5" value="${w !== null ? w : ''}" placeholder="0"><span class="set-unit">kg</span>
            <input type="number" class="form-input set-reps" value="${r !== null ? r : ''}" placeholder="0"><span class="set-unit">回</span>
        </div>
    `;

    setsContainer.appendChild(setRow);
}

function addExtraExerciseInput() {
    const isFree = document.getElementById('record-type-free') ? document.getElementById('record-type-free').checked : false;
    
    let container = isFree ? document.getElementById('extra-exercise-container') : document.getElementById('suggested-fields-container');
    if (!container) {
        container = document.getElementById('extra-exercise-container') || document.getElementById('workout-log-inputs');
    }

    const block = document.createElement('div');
    block.className = 'extra-log-block';
    block.draggable = true;

    const labelOptionsHTML = state.exerciseLabels.map(label => `<option value="${label}">${label}</option>`).join('');

    block.innerHTML = `
        <div style="display: flex; gap: 8px; align-items: flex-end; margin-bottom: 8px;">
            <span class="drag-handle" style="margin-bottom: 6px;">⋮⋮</span>
            <div style="flex: 1;">
                <label class="extra-label-select-label">部位（ラベル）</label>
                <select class="form-input extra-label-select" style="margin-bottom: 0;" onchange="renderExerciseChipsForBlock(this.closest('.extra-log-block'))">
                    ${labelOptionsHTML}
                </select>
            </div>
            <button type="button" class="btn-remove-row" onclick="this.closest('.extra-log-block').remove()">&times;</button>
        </div>
        
        <div class="extra-chip-list"></div>
        <div class="extra-fields-container"></div>
    `;

    container.appendChild(block);
    renderExerciseChipsForBlock(block);
    makeSortable(container);
    block.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

/* ★ ドラッグ＆ドロップ実装 */
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

// 自由入力での種目選択時：種目名選択の上に前回の記録を表示する版
function renderExerciseChipsForBlock(block) {
    const label = block.querySelector('.extra-label-select').value;
    const chipList = block.querySelector('.extra-chip-list');
    const fieldsContainer = block.querySelector('.extra-fields-container');

    const isCardio = (label === '有酸素運動');

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

        if (name) {
            if (minInput) {
                const calories = block.querySelector('.extra-calories').value;
                appendExerciseLog(name, {
                    isCardio: true,
                    minutes: minInput.value !== '' ? parseInt(minInput.value, 10) : 0,
                    calories: calories !== '' ? parseInt(calories, 10) : 0
                });
            } else if (setRows.length > 0) {
                const setsArray = [];
                setRows.forEach(row => {
                    const w = row.querySelector('.set-weight').value;
                    const r = row.querySelector('.set-reps').value;
                    if (w !== '' || r !== '') {
                        setsArray.push({
                            weight: w !== '' ? parseFloat(w) : 0,
                            reps: r !== '' ? parseInt(r, 10) : 0
                        });
                    }
                });

                if (setsArray.length > 0) appendExerciseLog(name, { setsArray: setsArray });
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
    row.draggable = true;
    row.innerHTML = `
        <span class="drag-handle">⋮⋮</span>
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
        init();
    }
}

let currentLibraryLabel = null;

function openExerciseLibraryModal() {
    if (!state.exerciseLabels || state.exerciseLabels.length === 0) {
        state.exerciseLabels = ['胸', '背中', '脚', '肩', '腕', 'お尻', '腹筋', '全身', '有酸素運動', 'その他'];
    }
    if (!state.exerciseLibrary) {
        state.exerciseLibrary = buildDefaultExerciseLibrary();
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

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}

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
    }
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
        summaryEl.innerHTML = `<span>📅 ${monthKey} (${monthLogs.length}回)</span><span class="arrow-icon">▾</span>`;

        const bodyEl = document.createElement('div');
        bodyEl.className = 'history-month-body';

        monthLogs.forEach(log => {
            const card = document.createElement('div');
            card.className = 'history-card';

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

            card.innerHTML = `
                <div class="history-card-header">
                    <span class="history-date">${formattedDate}</span>
                </div>
                <div class="history-title">${titleText}</div>
                ${exHTML}
            `;

            bodyEl.appendChild(card);
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
                bodyEl.style.maxHeight = bodyEl.scrollHeight + 16 + 'px';
            }
        };

        container.appendChild(groupEl);

        if (monthKey === latestMonthKey) {
            setTimeout(() => {
                groupEl.classList.add('active');
                bodyEl.style.maxHeight = bodyEl.scrollHeight + 16 + 'px';
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
            renderCalendar();
            if (typeof renderHistoryLogs === 'function') renderHistoryLogs();
            alert("過去データを正常に一括登録しました！");
        }
    } catch (e) {
        alert("データの形式が正しくありません。");
    }
}