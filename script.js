let isEditingLogMode = false;
const STORAGE_KEY = 'trainingRecords';
const CURRENT_SCHEMA_VERSION = 'label-v5'; // スキーマバージョンを更新して自動同期
const CODE_SNAPSHOT_KEY = 'workout_tracker_code_snapshot'; // ★ コード側デフォルトの前回スナップショット保存キー

// ▼ 新しい表示フォーマット：種目/タイプ（マシン）
function formatExerciseName(name, variation, equipment) {
  let text = name;
  if (variation) text += `/${variation}`;
  if (equipment) text += `（${equipment}）`;
  return text;
}

const initialDefaultMenus = [
    {
      id: 'A',
      title: '上半身 A（フリーウェイト＆ケーブル）',
      memo: 'デコルテ、背中の広がり、二の腕のトーン調整に重点を置いた構成。',
      exercises: [
        { name: 'ラットプルダウン', detail: '15~20回 × 3セット', variation: 'マググリップ', equipment: 'ケーブル' },
        { name: 'チェストプレス', detail: '15~20回 × 3セット', variation: 'インクライン', equipment: 'アイソラテラル' },
        { name: 'サイドレイズ', detail: '15~20回 × 3セット', variation: 'ノーマル', equipment: 'ダンベル' },
        { name: 'ケーブル・プレスダウン', detail: '15~20回 × 3セット', variation: 'ロープ', equipment: 'ケーブル' },
      ]
    },
    {
      id: 'B',
      title: '上半身 B（マシン＆ローイング）',
      memo: '背中の厚みと姿勢改善、胸の追い込みに重点。',
      exercises: [
        { name: 'ローイング', detail: '15~20回 × 3セット', variation: 'シーテッド', equipment: 'アイソラテラル' },
        { name: 'チェストプレス', detail: '15~20回 × 3セット', variation: 'フラット', equipment: 'マシン' },
        { name: 'リアデルトイド', detail: '15~20回 × 3セット', variation: '手のひら内側', equipment: 'マシン' },
        { name: 'クランチ', detail: '15~20回 × 3セット', variation: 'ノーマル', equipment: 'アブドミナル' },
        { name: 'バックエクステンション', detail: '15回 × 3セット', variation: 'ノーマル', equipment: 'マシン' },
      ]
    },
    {
      id: 'C',
      title: '下半身 A（美尻・美脚マシン）',
      memo: 'マシンを使用して、お尻と裏ももの境目をクリアに。',
      exercises: [
        { name: 'ヒップスラスト', detail: '15~20回 × 3セット', variation: 'ノーマル', equipment: 'グルートドライブ' },
        { name: 'レッグカール', detail: '15~20回 × 3セット', variation: 'シーテッド', equipment: 'マシン' },
        { name: 'レッグプレス', detail: '足幅を広め・上位置に / 15~20回 × 3セット', variation: '足上', equipment: 'シーテッド' },
        { name: 'アブダクション', detail: '15~20回 × 3セット', variation: '骨盤後傾', equipment: 'マシン' },
      ]
    },
    {
      id: 'D',
      title: '下半身 B（代謝向上・フリーウェイト）',
      memo: '多関節種目でカロリー消費を高め、ヒップアップを狙う。',
      exercises: [
        { name: 'ルーマニアンデッドリフト', detail: '15~20回 × 3セット', variation: 'ノーマル', equipment: 'ダンベル' },
        { name: 'スクワット', detail: '左右各12~15回 × 3セット', variation: 'ブルガリアン', equipment: 'ダンベル' },
        { name: 'グルートキックバック', detail: 'ケーブル使用 / 左右各15~20回 × 3セット', variation: 'ノーマル', equipment: 'ケーブル' },
        { name: 'アブダクション', detail: '15~20回 × 3セット', variation: '骨盤立て', equipment: 'マシン' },
      ]
    },
    {
      id: 'E',
      title: 'リカバリー・有酸素',
      memo: '疲労を抜きつつ、脂肪燃焼を促進。',
      exercises: [
        { name: 'トレッドミル', detail: '30〜40分 (傾斜5〜8%、時速4.0〜4.5km)', variation: 'ノーマル', equipment: 'マシン' },
      ]
    },
    {
      id: 'F',
      title: '全身',
      memo: '1週間空いた時や旅行後など、1回で全身をバランスよく刺激したい時に。',
      exercises: [
        { name: 'スクワット', detail: '左右各10回 × 3セット', variation: 'ブルガリアン', equipment: 'ダンベル' },
        { name: 'ラットプルダウン', detail: '10回 × 3セット', variation: 'マググリップ', equipment: 'ケーブル' },
        { name: 'チェストプレス', detail: '10回 × 3セット', variation: 'フラット', equipment: 'マシン' },
        { name: 'サイドレイズ', detail: '15回 × 2〜3セット', variation: 'ノーマル', equipment: 'ダンベル' },
        { name: 'クランチ', detail: '10回 × 3セット', variation: 'ノーマル', equipment: 'アブドミナル' },
        { name: 'トレッドミル', detail: '30分', variation: 'ノーマル', equipment: 'マシン' },
      ]
    }
];

const MENU_LABELS = {
  'A': '上A', 
  'B': '上B', 
  'C': '下A', 
  'D': '下B', 
  'E': '🏃',
  'F': '全',
  'ALL': '全', 
  'OFF': '休'
};

// ★ タイプ（やり方）のデフォルトパターン
const DEFAULT_VARIATION_PATTERNS = {
  'チェストプレス': ['フラット', 'インクライン', 'デクライン'],
  'チェストフライ': ['フラット', 'インクライン'],
  'ディップス': ['ノーマル'],
  'ラットプルダウン': ['ワイド', 'ナロー（逆手）', 'マググリップ'],
  'チンニング': ['順手（ワイド）', '逆手（ナロー）'],
  'ローイング': ['シーテッド', 'ベントオーバー', 'インバート'],
  'デッドリフト': ['床引き', 'トップサイド（ハーフ）', 'スモウ'],
  'バックエクステンション': ['ノーマル'],
  'リアデルトイド': ['手のひら内側', '手のひら下向き'],
  'スクワット': ['バイラテラル', 'ブルガリアン', 'ランジ', 'ゴブレット'],
  'レッグプレス': ['足上','足中','足下'],
  'レッグエクステンション': ['ノーマル'],
  'レッグカール': ['シーテッド', 'ライイング'],
  'グッドモーニング': ['ノーマル'],
  'アダクション': ['ノーマル'],
  'ショルダープレス': ['ノーマル', 'パラレル（縦握り）'],
  'サイドレイズ': ['ノーマル'],
  'フロントレイズ': ['ノーマル'],
  'フェイスプル': ['ノーマル'],
  'アームカール': ['手のひら上', 'ハンマー（縦握り）', 'インクライン', 'プリーチャー'],
  'ケーブル・プレスダウン': ['ストレートバー', 'ロープ', '逆手'],
  'トライセプス・エクステンション': ['ライイング', 'オーバーヘッド'],
  'キックバック': ['ノーマル'],
  'プッシュアップ': ['ナロー', 'リバース'],
  'アブダクション': ['骨盤前傾', '骨盤立て', '骨盤後傾'],
  'ヒップスラスト': ['ノーマル'],
  'ルーマニアンデッドリフト': ['ノーマル'],
  'グルートキックバック': ['ノーマル'],
  'クランチ': ['ノーマル', 'ツイスト'],
  'トーソローテーション': ['ノーマル'],
  'レッグレイズ': ['マット', 'ハンギング'],
  'プランク': ['ノーマル'],
  'クリーン/スナッチ': ['クリーン', 'スナッチ'],
  'バーピー': ['ノーマル'],
  'トレッドミル': ['ノーマル']
};

// ★ 器具のデフォルトパターン
const DEFAULT_EQUIPMENT_PATTERNS = {
  'チェストプレス': ['マシン', 'アイソラテラル', 'バーベル', 'ダンベル', 'スミス', 'スーパースミス'],
  'チェストフライ': ['マシン', 'ケーブル', 'ダンベル'],
  'ディップス': ['自重', 'アシストマシン', 'ウェイト付加'],
  'ラットプルダウン': ['マシン', 'ケーブル'],
  'チンニング': ['自重', 'アシストマシン', 'ウェイト付加'],
  'ローイング': [ 'アイソラテラル', 'バーベル', 'ダンベル', 'スミス', 'ケーブル'],
  'デッドリフト': ['バーベル', 'ダンベル', 'トラップバー'],
  'バックエクステンション': ['自重', 'マシン'],
  'リアデルトイド': ['マシン', 'ダンベル', 'ケーブル'],
  'スクワット': ['バーベル', 'ハック', 'スミス', 'ダンベル', '自重'],
  'レッグプレス': ['シーテッド', '45度リニア'],
  'レッグエクステンション': ['マシン'],
  'レッグカール': ['マシン', '自重'],
  'グッドモーニング': ['バーベル', 'ダンベル'],
  'アダクション': ['マシン', 'バンド'],
  'ショルダープレス': ['MTSマシン', 'ダンベル', 'バーベル', 'スミス'],
  'サイドレイズ': ['ダンベル', 'ケーブル'],
  'フロントレイズ': ['ダンベル', 'ケーブル', 'バーベル'],
  'フェイスプル': ['ケーブル'],
  'アームカール': [ 'ダンベル', 'バーベル', 'ケーブル'],
  'ケーブル・プレスダウン': ['ケーブル'],
  'トライセプス・エクステンション': ['ダンベル', 'バーベル', 'ケーブル'],
  'キックバック': ['ダンベル', 'ケーブル'],
  'プッシュアップ': ['自重'],
  'アブダクション': ['マシン', 'バンド'],
  'ヒップスラスト': ['グルートドライブ', 'バーベル', 'スミス'],
  'グルートキックバック': ['ケーブル', 'マシン', 'バンド'],
  'クランチ': ['自重', 'ロープ', 'アブドミナル'],
  'トーソローテーション': ['マシン'],
  'レッグレイズ': ['自重'],
  'プランク': ['自重'],
  'クリーン/スナッチ': ['バーベル', 'ダンベル'],
  'バーピー': ['自重'],
  'トレッドミル': ['マシン']
};

const INITIAL_EXERCISE_DETAILS = {
  'チェストプレス': {
    generalTips: '大胸筋を鍛える基本のプレス種目。ベンチ角度で狙う部位が変わる。',
    variations: [
      { name: 'フラット', target: '大胸筋全体、上腕三頭筋', tips: '大胸筋全体にまんべんなく効かせる基本の角度。' },
      { name: 'インクライン', target: '大胸筋上部', tips: 'ベンチ角度30〜45度で上部を狙う。デコルテラインの形成に。' },
      { name: 'デクライン', target: '大胸筋下部', tips: 'ベンチを下向きに傾け、下部の輪郭を強調する。' }
    ]
  },
  'チェストフライ': {
    generalTips: '大胸筋を単関節で鍛え、胸の輪郭や谷間を作る種目。',
    variations: [
      { name: 'フラット', target: '大胸筋全体（内側）', tips: '胸の中央で挟み込むように寄せる。' },
      { name: 'インクライン', target: '大胸筋上部', tips: '上部の絞り込みに効果的。' }
    ]
  },
  'ディップス': {
    generalTips: '上半身のスクワットと呼ばれる強力な種目。',
    variations: [
      { name: 'ノーマル', target: '大胸筋下部、上腕三頭筋', tips: '上体を前に倒すと胸に、直立させると腕に効きやすい。' }
    ]
  },
  'ラットプルダウン': {
    generalTips: '背中の広がりや厚みを作る種目。',
    variations: [
      { name: 'ワイド', target: '広背筋（上部・外側）', tips: '肩幅の1.5倍で握る。' },
      { name: 'ナロー（逆手）', target: '広背筋（下部）、上腕二頭筋', tips: '脇を締め、みぞおちに引く。' },
      { name: 'マググリップ', target: '広背筋（中部〜下部）', tips: '手首の負担が少なく引きやすい。' }
    ]
  },
  'チンニング': {
    generalTips: '自重で背中全体を強烈に鍛える種目。',
    variations: [
      { name: '順手（ワイド）', target: '広背筋（上部・外側）', tips: '胸をバーに近づけるイメージで引く。' },
      { name: '逆手（ナロー）', target: '広背筋（下部）、上腕二頭筋', tips: '腕の力も使いやすい。' }
    ]
  },
  'ローイング': {
    generalTips: '前から後ろへ引く動作で、背中の厚みを作る種目。',
    variations: [
      { name: 'シーテッド', target: '広背筋、僧帽筋中部', tips: '座って水平に引く。' },
      { name: 'ベントオーバー', target: '広背筋、脊柱起立筋', tips: '立ったまま前傾して引く。' },
      { name: 'インバート', target: '広背筋、僧帽筋', tips: '自重で斜め懸垂のように引く。' }
    ]
  },
  'デッドリフト': {
    generalTips: '背面全体を鍛えるビッグ3の一つ。',
    variations: [
      { name: '床引き', target: '背面全体', tips: '床から引き上げる基本形。' },
      { name: 'トップサイド（ハーフ）', target: '脊柱起立筋', tips: '膝上の高さからスタート。' },
      { name: 'ルーマニアン', target: 'ハムストリングス、大臀筋', tips: '膝をあまり曲げずに下ろす。' },
      { name: 'スモウ', target: '大腿四頭筋、内転筋', tips: '脚を大きく広げて行う。' }
    ]
  },
  'バックエクステンション': {
    generalTips: '腰を中心に鍛える種目。',
    variations: [
      { name: 'ノーマル', target: '脊柱起立筋', tips: '腰を過剰に反らせない。' }
    ]
  },
  'リアデルトイド': {
    generalTips: '肩の後ろを鍛え、立体的な肩を作る種目。',
    variations: [
      { name: '手のひら内側', target: '三角筋後部、僧帽筋', tips: '手のひらを向かい合わせて開く。' },
      { name: '手のひら下向き', target: '三角筋後部', tips: '三角筋後部を集中的に狙う。' }
    ]
  },
  'スクワット': {
    generalTips: '下半身全体を鍛えるトレーニングの王様。',
    variations: [
      { name: 'バイラテラル', target: '下半身全体', tips: '基本の両足スクワット。' },
      { name: 'ブルガリアン', target: '大臀筋、ハムストリングス', tips: '片脚で行う。' },
      { name: 'ランジ', target: '大腿四頭筋、大臀筋', tips: '前後に大きく踏み込む。' },
      { name: 'ゴブレット', target: '大腿四頭筋', tips: '胸の前で重りを持つ。' }
    ]
  },
  'レッグプレス': {
    generalTips: '足の置く位置によってターゲットを変えられる。',
    variations: [
      { name: '足上', target: '大臀筋、ハムストリングス', tips: 'プレートの上方に足を置く。' },
      { name: '足中', target: '下半身全体', tips: 'プレートの中央に足を置く。' },
      { name: '足下', target: '大腿四頭筋', tips: 'プレートの下方に足を置く。' }
    ]
  },
  'レッグエクステンション': {
    generalTips: '前ももを単独で鍛える。',
    variations: [
      { name: 'ノーマル', target: '大腿四頭筋', tips: '蹴り上げたトップで1秒キープ。' }
    ]
  },
  'レッグカール': {
    generalTips: '裏ももを単独で鍛える。',
    variations: [
      { name: 'シーテッド', target: 'ハムストリングス', tips: '座って行う。' },
      { name: 'ライイング', target: 'ハムストリングス', tips: 'うつ伏せで行う。' }
    ]
  },
  'グッドモーニング': {
    generalTips: 'お辞儀の動作で背面を鍛える。',
    variations: [
      { name: 'ノーマル', target: 'ハムストリングス、脊柱起立筋', tips: '背筋を伸ばしたまま前傾する。' }
    ]
  },
  'アダクション': {
    generalTips: '内ももを鍛える種目。',
    variations: [
      { name: 'ノーマル', target: '内転筋', tips: '反動を使わず脚を閉じる。' }
    ]
  },
  'ショルダープレス': {
    generalTips: '肩全体を鍛えるプレス種目。',
    variations: [
      { name: 'ノーマル', target: '三角筋前部・中部', tips: '耳の横まで下ろす。' },
      { name: 'パラレル（縦握り）', target: '三角筋前部', tips: '手のひらを向かい合わせて押す。' }
    ]
  },
  'サイドレイズ': {
    generalTips: '肩の横の張り出しを作る。',
    variations: [
      { name: 'ノーマル', target: '三角筋中部', tips: '小指側から上げるイメージ。' }
    ]
  },
  'フロントレイズ': {
    generalTips: '肩の前面を鍛える。',
    variations: [
      { name: 'ノーマル', target: '三角筋前部', tips: '目の高さまで持ち上げる。' }
    ]
  },
  'フェイスプル': {
    generalTips: '肩の後ろと背中上部を鍛える。',
    variations: [
      { name: 'ノーマル', target: '三角筋後部、僧帽筋', tips: '顔に向かって引く。' }
    ]
  },
  'アームカール': {
    generalTips: '力こぶを作る種目。',
    variations: [
      { name: '手のひら上', target: '上腕二頭筋', tips: '基本のカール。' },
      { name: 'ハンマー（縦握り）', target: '上腕二頭筋、腕橈骨筋', tips: '縦握りで行う。' },
      { name: 'インクライン', target: '上腕二頭筋（長頭）', tips: 'ベンチを傾けて行う。' },
      { name: 'プリーチャー', target: '上腕二頭筋（短頭）', tips: '台に腕を固定して行う。' }
    ]
  },
  'ケーブル・プレスダウン': {
    generalTips: '二の腕を引き締める。',
    variations: [
      { name: 'ストレートバー', target: '上腕三頭筋', tips: 'バーを押し下げる。' },
      { name: 'ロープ', target: '上腕三頭筋', tips: 'フィニッシュで外に開く。' },
      { name: '逆手', target: '上腕三頭筋', tips: 'アンダーグリップで行う。' }
    ]
  },
  'トライセプス・エクステンション': {
    generalTips: '二の腕を鍛える。',
    variations: [
      { name: 'ライイング', target: '上腕三頭筋', tips: '寝て行う。' },
      { name: 'オーバーヘッド', target: '上腕三頭筋', tips: '頭の後ろから上へ伸ばす。' }
    ]
  },
  'キックバック': {
    generalTips: '二の腕の仕上げ種目。',
    variations: [
      { name: 'ノーマル', target: '上腕三頭筋', tips: '前傾姿勢で後ろに伸ばす。' }
    ]
  },
  'プッシュアップ': {
    generalTips: '自重で腕や胸を鍛える。',
    variations: [
      { name: 'ナロー', target: '上腕三頭筋', tips: '脇を締めて行う。' },
      { name: 'リバース', target: '上腕三頭筋', tips: '逆手ベンチで行う。' }
    ]
  },
  'アブダクション': {
    generalTips: 'お尻を鍛える種目。',
    variations: [
      { name: '骨盤前傾', target: '大臀筋（上部）', tips: '前傾姿勢で行う。' },
      { name: '骨盤立て', target: '中臀筋・小臀筋', tips: 'まっすぐ座って行う。' },
      { name: '骨盤後傾', target: '大臀筋の下部・外側', tips: '浅く座って寄りかかる。' }
    ]
  },
  'ヒップスラスト': {
    generalTips: 'お尻を最大収縮させる。',
    variations: [
      { name: 'ノーマル', target: '大臀筋', tips: '骨盤を持ち上げる。' }
    ]
  },
  'グルートキックバック': {
    generalTips: 'お尻の上部をピンポイントで鍛える。',
    variations: [
      { name: 'ノーマル', target: '大臀筋', tips: '後ろに蹴り出す。' }
    ]
  },
  'ルーマニアンデッドリフト': {
    generalTips: 'お尻と裏ももを強烈にストレッチさせる種目。',
    variations: [
      { name: 'ノーマル', target: '大臀筋、ハムストリングス', tips: '膝をあまり曲げずにお尻を後ろに引く。' }
    ]
  },
  'クランチ': {
    generalTips: 'お腹を引き締める。',
    variations: [
      { name: 'ノーマル', target: '腹直筋', tips: '完全に起き上がる手前で止める。' },
      { name: 'ツイスト', target: '腹斜筋', tips: '体を捻りながら起こす。' }
    ]
  },
  'トーソローテーション': {
    generalTips: 'お腹の横を鍛える。',
    variations: [
      { name: 'ノーマル', target: '腹斜筋', tips: '胴体を捻る。' }
    ]
  },
  'レッグレイズ': {
    generalTips: '下腹部を鍛える。',
    variations: [
      { name: 'マット', target: '腹直筋下部', tips: '床で行う。' },
      { name: 'ハンギング', target: '腹直筋下部', tips: 'ぶら下がって行う。' }
    ]
  },
  'プランク': {
    generalTips: '体幹を固定する。',
    variations: [
      { name: 'ノーマル', target: '腹横筋、体幹', tips: '一直線をキープする。' }
    ]
  },
  'クリーン/スナッチ': {
    generalTips: '全身の爆発力を鍛える。',
    variations: [
      { name: 'クリーン', target: '全身', tips: '肩まで引き上げる。' },
      { name: 'スナッチ', target: '全身', tips: '頭上まで引き上げる。' }
    ]
  },
  'バーピー': {
    generalTips: '全身の筋肉を使うHIIT。',
    variations: [
      { name: 'ノーマル', target: '全身、心肺機能', tips: '素早く連続で行う。' }
    ]
  },
  'トレッドミル': {
    generalTips: '定番の有酸素マシン。',
    variations: [
      { name: 'ノーマル', target: '心肺機能', tips: '走るか歩く。' }
    ]
  }
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
  exerciseVariations: {}, // ★ タイプを追加
  inbodyLogs: [],
  inbodyMetric: 'weight',
  exerciseDetails: {}
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

// ==========================================================
// ★ コード側デフォルト自動反映の仕組み
// ------------------------------------------------------------
// initialDefaultMenus / DEFAULT_VARIATION_PATTERNS /
// DEFAULT_EQUIPMENT_PATTERNS / INITIAL_EXERCISE_DETAILS /
// buildDefaultExerciseLibrary() をコード側で書き換えるだけで、
// 既存ユーザーの保存データにも変更が反映されるようにする。
//
// 仕組み：前回読み込み時点の「コード側デフォルト」をスナップショットとして
// localStorageに保存しておき、今回のコード側デフォルトと比較。
// - 前回スナップショットと今回のコードが同じ → ユーザーの保存値をそのまま使う
// - 前回スナップショットと今回のコードが違う（＝コードを更新した）→
//     ユーザーが自分で編集していなければ新しいコードの値に更新する
//     ユーザーが独自に編集/追加していた分は保持する
// ==========================================================

function getCurrentCodeDefaults() {
  return {
    menus: JSON.parse(JSON.stringify(initialDefaultMenus)),
    variations: JSON.parse(JSON.stringify(DEFAULT_VARIATION_PATTERNS)),
    equipment: JSON.parse(JSON.stringify(DEFAULT_EQUIPMENT_PATTERNS)),
    details: JSON.parse(JSON.stringify(INITIAL_EXERCISE_DETAILS)),
    library: buildDefaultExerciseLibrary()
  };
}

function deepEqual(a, b) {
  return JSON.stringify(a) === JSON.stringify(b);
}

function mergeUnique(baseArr, extraArr) {
  const result = baseArr.slice();
  (extraArr || []).forEach(v => {
    if (!result.includes(v)) result.push(v);
  });
  return result;
}

// dict of arrays（種目リスト、タイプ、器具など）を同期する
function syncArrayDict(prevDict, currDict, userDict) {
  const prev = prevDict || {};
  const curr = currDict || {};
  const user = userDict ? JSON.parse(JSON.stringify(userDict)) : {};
  const result = {};

  Object.keys(curr).forEach(key => {
    const currArr = curr[key];
    const prevArr = prev[key];
    if (!prevArr) {
      // コード側で新規追加された（またはスナップショットがまだ無い）
      result[key] = user[key] ? mergeUnique(currArr, user[key]) : currArr.slice();
    } else {
      const userArr = user[key] || prevArr.slice();
      const removedByCode = prevArr.filter(v => !currArr.includes(v));
      const addedByCode = currArr.filter(v => !prevArr.includes(v));
      let merged = userArr.filter(v => !removedByCode.includes(v));
      addedByCode.forEach(v => { if (!merged.includes(v)) merged.push(v); });
      result[key] = merged;
    }
  });

  // コード側から削除されたキーの扱い
  Object.keys(prev).forEach(key => {
    if (curr[key]) return;
    if (user[key] && !deepEqual(user[key], prev[key])) {
      // ユーザーが独自に編集済み → 残す
      result[key] = user[key];
    }
    // 未編集ならコードの削除に合わせて削除
  });

  // コード側に存在しない、ユーザー独自のキー（自作の種目など）は保持
  Object.keys(user).forEach(key => {
    if (!curr[key] && !prev[key]) result[key] = user[key];
  });

  return result;
}

// dict of objects（種目の詳細説明など）を同期する
function syncObjectDict(prevDict, currDict, userDict) {
  const prev = prevDict || {};
  const curr = currDict || {};
  const user = userDict ? JSON.parse(JSON.stringify(userDict)) : {};
  const result = {};

  Object.keys(curr).forEach(key => {
    if (!prev[key]) {
      result[key] = user[key] ? user[key] : JSON.parse(JSON.stringify(curr[key]));
    } else if (!user[key]) {
      result[key] = JSON.parse(JSON.stringify(curr[key]));
    } else if (deepEqual(user[key], prev[key])) {
      result[key] = JSON.parse(JSON.stringify(curr[key])); // 未編集 → コードの新しい内容へ更新
    } else {
      result[key] = user[key]; // 編集済み → ユーザーの内容を優先
    }
  });

  Object.keys(prev).forEach(key => {
    if (curr[key]) return;
    if (user[key] && !deepEqual(user[key], prev[key])) {
      result[key] = user[key];
    }
  });

  Object.keys(user).forEach(key => {
    if (!curr[key] && !prev[key]) result[key] = user[key];
  });

  return result;
}

// メニュー内の種目リストを1件ずつ位置ベースで同期する
// （名前や設定だけの変更でも確実に反映されるように、フィールド単位で比較する）
function syncExerciseList(prevList, currList, userList) {
  prevList = prevList || [];
  currList = currList || [];
  userList = userList || [];
  const maxLen = Math.max(prevList.length, currList.length, userList.length);
  const result = [];

  for (let i = 0; i < maxLen; i++) {
    const p = prevList[i];
    const c = currList[i];
    const u = userList[i];

    if (c === undefined) {
      // コード側でこの位置の種目が削除された
      if (u !== undefined) {
        if (p !== undefined && deepEqual(u, p)) {
          // 未編集 → 削除に合わせて除外
        } else {
          result.push(u); // 編集済み／ユーザー独自 → 保持
        }
      }
      continue;
    }

    if (u === undefined) {
      result.push(JSON.parse(JSON.stringify(c)));
    } else if (p !== undefined && deepEqual(u, p)) {
      result.push(JSON.parse(JSON.stringify(c))); // 未編集 → 新しいコード内容へ更新
    } else {
      result.push(u); // 編集済み → ユーザーの内容を保持
    }
  }

  return result;
}

// メニュー（上半身A等）を同期する
function syncMenus(prevMenus, currMenus, userMenus) {
  const prevMap = new Map((prevMenus || []).map(m => [m.id, m]));
  const currMap = new Map((currMenus || []).map(m => [m.id, m]));
  const userMap = new Map((userMenus || []).map(m => [m.id, m]));
  const result = [];

  currMenus.forEach(currMenu => {
    const id = currMenu.id;
    const prevMenu = prevMap.get(id);
    const userMenu = userMap.get(id);
    if (!prevMenu || !userMenu) {
      // コード側で新規追加、またはユーザー側に無い → コードの内容を採用
      result.push(JSON.parse(JSON.stringify(currMenu)));
      return;
    }

    const title = deepEqual(userMenu.title, prevMenu.title) ? currMenu.title : userMenu.title;
    const memo = deepEqual(userMenu.memo, prevMenu.memo) ? currMenu.memo : userMenu.memo;
    const exercises = syncExerciseList(prevMenu.exercises, currMenu.exercises, userMenu.exercises);

    result.push({ id, title, memo, exercises });
  });

  // コード側から削除されたメニュー／ユーザー独自メニューの扱い
  const fields = m => ({ title: m.title, memo: m.memo, exercises: m.exercises });
  (userMenus || []).forEach(userMenu => {
    const id = userMenu.id;
    if (currMap.has(id)) return; // 上のループで処理済み
    const prevMenu = prevMap.get(id);
    if (!prevMenu) {
      // ユーザー独自に作成したメニュー → そのまま保持
      result.push(userMenu);
    } else if (!deepEqual(fields(userMenu), fields(prevMenu))) {
      // コード側では削除されたが、ユーザーが編集していた → 保持
      result.push(userMenu);
    }
    // 未編集のままコード側で削除された場合は削除する
  });

  return result;
}

function loadState() {
  const savedState = localStorage.getItem('workout_tracker_state');
  if (savedState) {
    const parsed = JSON.parse(savedState);
    
    // ==========================================
    // ★ 過去のデータを新仕様に自動変換する処理
    // ==========================================
    const migrateItem = (item, exName) => {
      // 昔のデータで、器具欄に文字が入っているけどタイプ欄が空の場合
      if (item.equipment && !item.variation) {
        const oldVal = item.equipment;
        const varPatterns = DEFAULT_VARIATION_PATTERNS[exName] || [];
        const equipPatterns = DEFAULT_EQUIPMENT_PATTERNS[exName] || [];
        
        // 古い「器具」の文字が、新しい「タイプ」に含まれているかチェック
        const matchedVar = varPatterns.find(v => v.includes(oldVal) || oldVal.includes(v));
        if (matchedVar) {
          item.variation = matchedVar; // タイプにお引越し
          
          // 空になった器具には適当なデフォルトを入れる
          if (oldVal.includes('マググリップ') && equipPatterns.includes('ケーブル')) {
             item.equipment = 'ケーブル';
          } else if (oldVal.includes('シーテッド') && equipPatterns.includes('マシン')) {
             item.equipment = 'マシン';
          } else {
             item.equipment = equipPatterns.includes('マシン') ? 'マシン' : (equipPatterns[0] || '');
          }
        } else {
          // 器具のままの場合も、新しい名前に部分一致すれば補正
          const matchedEq = equipPatterns.find(e => e.includes(oldVal) || oldVal.includes(e));
          if (matchedEq) {
            item.equipment = matchedEq;
          }
        }
      }
    };

    // カレンダーのログ履歴データを一斉変換
    if (parsed.logs) {
      parsed.logs.forEach(log => {
        if (log.exerciseLogs) {
          for (const [exName, logVal] of Object.entries(log.exerciseLogs)) {
            const valArray = Array.isArray(logVal) ? logVal : [logVal];
            valArray.forEach(item => migrateItem(item, exName));
          }
        }
      });
    }

    // 自分で作ったカスタムメニューのデータも一斉変換
    if (parsed.menus) {
      parsed.menus.forEach(menu => {
        if (menu.exercises) {
          menu.exercises.forEach(item => migrateItem(item, item.name));
        }
      });
    }
    // ==========================================

    if (parsed.theme) state.theme = parsed.theme;

    // ★ 前回読み込み時のコード側デフォルトのスナップショットを取得
    let prevDefaults = null;
    try {
      const rawSnapshot = localStorage.getItem(CODE_SNAPSHOT_KEY);
      if (rawSnapshot) prevDefaults = JSON.parse(rawSnapshot);
    } catch (e) { prevDefaults = null; }
    const currDefaults = getCurrentCodeDefaults();

    // メニューの同期（コード側の変更・追加・削除を反映しつつ、ユーザーの編集は保持）
    state.menus = syncMenus(prevDefaults ? prevDefaults.menus : null, currDefaults.menus, parsed.menus);

    if (parsed.logs) state.logs = parsed.logs;
    state.inbodyLogs = parsed.inbodyLogs || [];
    state.exerciseLabels = ['胸', '背中', '脚', '肩', '腕', 'お尻', '腹筋', '全身', '有酸素運動', 'その他'];

    // 種目リスト・タイプ・器具・詳細説明の同期
    state.exerciseLibrary = syncArrayDict(prevDefaults ? prevDefaults.library : null, currDefaults.library, parsed.exerciseLibrary);
    state.exerciseEquipment = syncArrayDict(prevDefaults ? prevDefaults.equipment : null, currDefaults.equipment, parsed.exerciseEquipment);
    state.exerciseVariations = syncArrayDict(prevDefaults ? prevDefaults.variations : null, currDefaults.variations, parsed.exerciseVariations);
    state.exerciseDetails = syncObjectDict(prevDefaults ? prevDefaults.details : null, currDefaults.details, parsed.exerciseDetails);

    // 今回のコード側デフォルトをスナップショットとして保存（次回の比較用）
    try {
      localStorage.setItem(CODE_SNAPSHOT_KEY, JSON.stringify(currDefaults));
    } catch (e) { /* 保存失敗は無視 */ }

  } else {
    state.exerciseLibrary = buildDefaultExerciseLibrary();
    state.exerciseEquipment = JSON.parse(JSON.stringify(DEFAULT_EQUIPMENT_PATTERNS));
    state.exerciseVariations = JSON.parse(JSON.stringify(DEFAULT_VARIATION_PATTERNS));
    state.exerciseDetails = JSON.parse(JSON.stringify(INITIAL_EXERCISE_DETAILS));

    // 初回起動時もスナップショットを保存しておく
    try {
      localStorage.setItem(CODE_SNAPSHOT_KEY, JSON.stringify(getCurrentCodeDefaults()));
    } catch (e) { /* 保存失敗は無視 */ }
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
    exerciseVariations: state.exerciseVariations, // ★
    inbodyLogs: state.inbodyLogs,
    exerciseDetails: state.exerciseDetails
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
    '胸': ['チェストプレス', 'チェストフライ', 'ディップス'],
    '背中': ['ラットプルダウン', 'チンニング', 'ローイング', 'デッドリフト', 'バックエクステンション', 'リアデルトイド'],
    '脚': ['スクワット', 'レッグプレス', 'レッグエクステンション', 'レッグカール', 'グッドモーニング', 'アダクション'],
    '肩': ['ショルダープレス', 'サイドレイズ', 'フロントレイズ', 'フェイスプル'],
    '腕': ['アームカール', 'ケーブル・プレスダウン', 'トライセプス・エクステンション', 'キックバック', 'プッシュアップ'],
    'お尻': ['アブダクション', 'ヒップスラスト', 'グルートキックバック', 'ルーマニアンデッドリフト'],
    '腹筋': ['クランチ', 'トーソローテーション', 'レッグレイズ', 'プランク'],
    '全身': ['クリーン/スナッチ', 'バーピー'],
    '有酸素運動': ['トレッドミル'],
    'その他': []
  };
}

function renderRecommendation() {
  const calcDaysAgo = (keyword, isMenuId = false) => {
    const catLogs = state.logs.filter(l => {
      if (l.menuId === 'OFF') return false;
      const menu = state.menus.find(m => m.id === l.menuId);
      const title = menu ? menu.title : '';

      if (isMenuId) return l.menuId === keyword;
      return title.includes(keyword);
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

  const upperAEl = document.getElementById('days-upper-a');
  const upperBEl = document.getElementById('days-upper-b');
  const lowerAEl = document.getElementById('days-lower-a');
  const lowerBEl = document.getElementById('days-lower-b');
  const fullEl = document.getElementById('days-full');
  const cardioEl = document.getElementById('days-cardio');

  if (upperAEl) upperAEl.textContent = ` ${calcDaysAgo('A', true)}`;
  if (upperBEl) upperBEl.textContent = ` ${calcDaysAgo('B', true)}`;
  if (lowerAEl) lowerAEl.textContent = `${calcDaysAgo('C', true)}`;
  if (lowerBEl) lowerBEl.textContent = `${calcDaysAgo('D', true)}`;
  if (fullEl) fullEl.textContent = `${calcDaysAgo('全身')}`;
  if (cardioEl) cardioEl.textContent = `${calcDaysAgo('有酸素')}`;
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
    titleText = '全身の日';
  } else {
    const menu = state.menus.find(m => m.id === todayLog.menuId);
    titleText = menu ? menu.title : todayLog.menuId;
    titleText = titleText.split(/[（(]/)[0].trim();
  }

  let exListHTML = '';
  if (todayLog.menuId === 'OFF') {
    exListHTML = '<div class="today-summary-empty" style="padding:4px 0;">おやすみ</div>';
  } else if (todayLog.exerciseLogs && Object.keys(todayLog.exerciseLogs).length > 0) {
    exListHTML = '<div class="today-summary-list">';
    for (const [exName, logVal] of Object.entries(todayLog.exerciseLogs)) {
      const cleanName = exName.replace('【追加】', '');
      const valArray = Array.isArray(logVal) ? logVal : [logVal];

      valArray.forEach(item => {
        const nameText = formatExerciseName(cleanName, item.variation, item.equipment);
        const formatted = formatSingleLogObj(item, false); 
        exListHTML += `
          <div class="today-summary-item">
            <span class="today-summary-ex-name">• ${nameText}</span>
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
        titleText = '全身の日';
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
            const nameText = formatExerciseName(cleanName, item.variation, item.equipment);
            const formatted = formatSingleLogObj(item, false);
            exHTML += `
              <div class="history-ex-item">
                <span class="history-ex-name">• ${nameText}</span>
                <span class="history-ex-val" style="text-align:right; max-width:60%; word-break:break-all;">${formatted}</span>
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

// 【記録の詳細確認モーダルの表示】
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
    titleEl.textContent = '全身の日';
  } else {
    const menu = state.menus.find(m => m.id === log.menuId);
    const menuTitle = menu ? menu.title : '';
    titleEl.textContent = menuTitle;
  }

  let html = '';
  if (log.exerciseLogs && Object.keys(log.exerciseLogs).length > 0) {
    html += '<div style="display:flex; flex-direction:column; gap:8px;">';
    for (const [exName, logVal] of Object.entries(log.exerciseLogs)) {
      const cleanName = exName.replace('【追加】', ''); 
      const valArray = Array.isArray(logVal) ? logVal : [logVal];

      valArray.forEach(item => {
        const nameText = formatExerciseName(cleanName, item.variation, item.equipment);
        const formatted = formatSingleLogObj(item, false);
        html += `
          <div style="display:flex; justify-content:space-between; align-items:baseline; gap:6px; border-bottom:1px dashed var(--border-color); padding-bottom:6px; flex-wrap:nowrap;">
            <span style="font-weight:500; font-size:0.72rem; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; flex-shrink:1; min-width:0;">${nameText}</span>
            <span style="color:var(--text-sub); font-size:0.72rem; white-space:nowrap; flex-shrink:0;">${formatted}</span>
          </div>
        `;
      });
    }
    html += '</div>';
  } else {
    html = '<p style="color:var(--text-sub);">おやすみしたね</p>';
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

// =========================================================
// 1. 拡張版：前回の記録取得ロジック
// =========================================================
function getLastExerciseLogObj(exerciseName, variation = null, equipment = null) {
  for (let i = state.logs.length - 1; i >= 0; i--) {
    const log = state.logs[i];
    if (log.exerciseLogs && log.exerciseLogs[exerciseName] !== undefined) {
      const val = log.exerciseLogs[exerciseName];
      const valArray = Array.isArray(val) ? val : [val];
      
      // 同じ日の中で複数ある場合を考慮し、配列の後ろ（新しいもの）から探す
      for (let j = valArray.length - 1; j >= 0; j--) {
        const item = valArray[j];
        
        let match = true;
        // 指定されている場合のみ一致判定を行う（未選択時は条件を絞り込まない）
        if (variation && item.variation !== variation) match = false;
        if (equipment && item.equipment !== equipment) match = false;
        
        if (match) {
          return item;
        }
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

// ▼ 新しい表示フォーマット：種目/タイプ（マシン）
function formatExerciseName(name, variation, equipment) {
  let text = name;
  if (variation) text += `/${variation}`;
  if (equipment) text += `（${equipment}）`;
  return text;
}

function formatSingleLogObj(logObj, showEquipBadge = true) {
  if (!logObj) return '';

  let equipBadge = '';
  if (showEquipBadge) {
    if (logObj.variation && logObj.equipment) {
      equipBadge = ` [${logObj.variation}（${logObj.equipment}）]`;
    } else if (logObj.variation) {
      equipBadge = ` [${logObj.variation}]`;
    } else if (logObj.equipment) {
      equipBadge = ` [（${logObj.equipment}）]`;
    }
  }

  if (
    logObj.isCardio ||
    logObj.minutes !== undefined ||
    logObj.calories !== undefined ||
    logObj.incline !== undefined ||
    logObj.speed !== undefined
  ) {
    const parts = [];
    if (logObj.minutes !== undefined && logObj.minutes !== '') parts.push(`${logObj.minutes}分`);
    if (logObj.incline !== undefined && logObj.incline !== '') parts.push(`傾斜${logObj.incline}%`);
    if (logObj.speed !== undefined && logObj.speed !== '') parts.push(`速度${logObj.speed}km/h`);
    if (logObj.calories !== undefined && logObj.calories !== '') parts.push(`${logObj.calories}kcal`);
    return parts.join(' / ') + equipBadge;
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
    if (menu.id === 'F' || menu.title.includes('全身')) return 1;
    if (menu.title.includes('上半身')) return 2;
    if (menu.title.includes('下半身')) return 3;
    if (menu.title.includes('有酸素') || menu.title.includes('リカバリー')) return 4;
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

    let exListHTML = menu.exercises.map(e => {
        const nameText = formatExerciseName(e.name, e.variation, e.equipment);
        return `
          <div class="table-ex-item">
            <span class="table-ex-name">• ${nameText}</span> 
            <span class="table-ex-meta">${e.detail}</span>
          </div>
        `;
    }).join('');

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

// ★ タイプ用の描画関数
function renderVariationChips(blockEl, exerciseName, selectedVar = '') {
  const varContainer = blockEl.querySelector('.variation-select-row');
  if (!varContainer) return;

  if (!exerciseName) {
    varContainer.innerHTML = '';
    varContainer.style.display = 'none';
    return;
  }

  let patterns = state.exerciseVariations[exerciseName] || DEFAULT_VARIATION_PATTERNS[exerciseName];
  const isOnlyNormal = patterns && patterns.length === 1 && patterns[0] === 'ノーマル';
  if (!patterns || patterns.length === 0 || isOnlyNormal) {
    varContainer.style.display = 'none';
    varContainer.dataset.selectedVariation = isOnlyNormal ? patterns[0] : '';
    return;
  }

  varContainer.style.display = 'flex';

  let chipsHTML = patterns.map(va => {
    const isActive = selectedVar === va ? 'active' : '';
    return `<button type="button" class="variation-chip-btn ${isActive}" onclick="selectVariationChip(this, '${va}')">${va}</button>`;
  }).join('');

  varContainer.innerHTML = `
    <span style="font-size:0.72rem; color:var(--text-sub); font-weight:700; flex-shrink:0;">タイプ:</span>
    <div class="equipment-chips-list">
      ${chipsHTML}
    </div>
  `;

  varContainer.dataset.selectedVariation = selectedVar || '';
}

// =========================================================
// 2. チップ選択関数の上書きと、表示更新関数の追加
// =========================================================

function selectVariationChip(btnEl, varName) {
  const row = btnEl.closest('.variation-select-row');
  const allBtns = row.querySelectorAll('.variation-chip-btn');

  let chosenVar = '';
  if (btnEl.classList.contains('active')) {
    btnEl.classList.remove('active');
  } else {
    allBtns.forEach(b => b.classList.remove('active'));
    btnEl.classList.add('active');
    chosenVar = varName;
  }
  row.dataset.selectedVariation = chosenVar;
  
  // ★ チップが押されたら履歴表示を更新
  updateLastLogDisplay(row.closest('.extra-log-block'));
}

function selectEquipmentChip(btnEl, equipName) {
  const row = btnEl.closest('.equipment-select-row');
  // ※バグ防止：.extra-log-block が取れない場合を考慮し、確実な親要素を取得
  const block = btnEl.closest('.extra-log-block') || btnEl.closest('.exercise-row');
  
  const allBtns = row.querySelectorAll('.equipment-chip-btn');

  let chosenEquip = '';
  if (btnEl.classList.contains('active')) {
    btnEl.classList.remove('active');
  } else {
    allBtns.forEach(b => b.classList.remove('active'));
    btnEl.classList.add('active');
    chosenEquip = equipName;
  }
  row.dataset.selectedEquip = chosenEquip;

  // ★ チップが押されたら履歴表示を更新
  if (block) updateLastLogDisplay(block);
}

// =========================================================
// 履歴の表示更新と、入力欄の自動上書き（プレフィル）
// =========================================================
function updateLastLogDisplay(blockEl) {
  if (!blockEl) return;
  
  const nameSelect = blockEl.querySelector('.extra-name-select');
  const nameInput = blockEl.querySelector('.extra-name-input');
  const exName = nameSelect && nameSelect.value ? nameSelect.value : (nameInput ? nameInput.value : '');
  
  if (!exName) return;

  const varRow = blockEl.querySelector('.variation-select-row');
  const variation = varRow ? (varRow.dataset.selectedVariation || '') : '';
  
  const equipRow = blockEl.querySelector('.equipment-select-row:not(.variation-select-row)');
  const equipment = equipRow ? (equipRow.dataset.selectedEquip || '') : '';

  // 選択中の組み合わせに合致する過去の記録を取得
  const lastObj = getLastExerciseLogObj(exName, variation, equipment);

  const holder = blockEl.querySelector('.last-btn-holder');
  if (holder) {
    if (lastObj) {
      const formatted = formatSingleLogObj(lastObj, false); 
      holder.innerHTML = `<div style="font-size:0.72rem; color:var(--primary-hover); font-weight:700; margin-bottom:4px; padding-left:2px;">前回: ${formatted}</div>`;
    } else {
      holder.innerHTML = '<div style="font-size:0.72rem; color:var(--text-sub); margin-bottom:4px; padding-left:2px;">前回: この組み合わせの記録なし</div>';
    }
  }

  // ▼ 追加：入力欄（セット行・有酸素項目）の自動上書き
  if (lastObj) {
    const isCardio = lastObj.isCardio === true || (lastObj.weight === undefined && lastObj.reps === undefined && lastObj.minutes !== undefined);
    
    if (isCardio) {
      const minInput = blockEl.querySelector('.extra-minutes');
      const inclineInput = blockEl.querySelector('.extra-incline');
      const speedInput = blockEl.querySelector('.extra-speed');
      const calInput = blockEl.querySelector('.extra-calories');
      if (minInput && lastObj.minutes !== undefined) minInput.value = lastObj.minutes;
      if (inclineInput && lastObj.incline !== undefined) inclineInput.value = lastObj.incline;
      if (speedInput && lastObj.speed !== undefined) speedInput.value = lastObj.speed;
      if (calInput && lastObj.calories !== undefined) calInput.value = lastObj.calories;
    } else {
      // 既存の入力欄を破棄し、前回の記録で再生成する
      fillSetsContainerFromItem(blockEl, lastObj);
    }
  }
}
// 器具用の描画関数
function renderEquipmentChips(blockEl, exerciseName, selectedEquip = '') {
  // ★修正箇所：タイプ行を誤って上書きしないように「:not(.variation-select-row)」を追加
  const equipContainer = blockEl.querySelector('.equipment-select-row:not(.variation-select-row)');
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

  let chipsHTML = patterns.map(eq => {
    const isActive = selectedEquip === eq ? 'active' : '';
    return `<button type="button" class="equipment-chip-btn ${isActive}" onclick="selectEquipmentChip(this, '${eq}')">${eq}</button>`;
  }).join('');

  equipContainer.innerHTML = `
    <span style="font-size:0.72rem; color:var(--text-sub); font-weight:700; flex-shrink:0;">ツール:</span>
    <div class="equipment-chips-list">
      ${chipsHTML}
    </div>
  `;

  equipContainer.dataset.selectedEquip = selectedEquip || '';
}


function openWorkoutLogModal(defaultMenuId, presetDateISO, isEdit = false) {
  isEditingLogMode = isEdit;
  const targetDate = presetDateISO || getTodayISO();
  const existingLog = state.logs.find(l => l.date === targetDate);

  const selectEl = document.getElementById('select-log-menu');
  selectEl.innerHTML = '';

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

  const suggestedContainer = document.getElementById('suggested-fields-container');
  if (suggestedContainer) suggestedContainer.innerHTML = '';

  toggleRecordType();

  const activeMenuId = (selectEl.value === 'OFF' || selectEl.value === 'ALL' || !selectEl.value) ? 'A' : selectEl.value;
  renderWorkoutLogInputs(activeMenuId);

  if (isEdit && existingLog && existingLog.exerciseLogs && existingLog.menuId !== 'OFF') {
    for (const [exName, logVal] of Object.entries(existingLog.exerciseLogs)) {
      const valArray = Array.isArray(logVal) ? logVal : [logVal];

      valArray.forEach(item => {
        const itemIsCardio = item.isCardio === true || (item.weight === undefined && item.reps === undefined && item.minutes !== undefined);

        addSuggestedExerciseInput(exName, '', selectEl.value, itemIsCardio, item.equipment, item.variation);
        const container = document.getElementById('suggested-fields-container');
        const lastBlock = container ? container.lastElementChild : null;
        if (lastBlock) {
          if (itemIsCardio) {
            const minInput = lastBlock.querySelector('.extra-minutes');
            const inclineInput = lastBlock.querySelector('.extra-incline');
            const speedInput = lastBlock.querySelector('.extra-speed');
            const calInput = lastBlock.querySelector('.extra-calories');
            if (minInput) minInput.value = item.minutes !== undefined ? item.minutes : '';
            if (inclineInput) inclineInput.value = item.incline !== undefined ? item.incline : '';
            if (speedInput) speedInput.value = item.speed !== undefined ? item.speed : '';
            if (calInput) calInput.value = item.calories !== undefined ? item.calories : '';
          } else {
            fillSetsContainerFromItem(lastBlock, item);
          }
        }
      });
    }
  }

  document.getElementById('workout-log-modal').classList.add('active');
}

function toggleRecordType() {
  const isOff = document.getElementById('record-type-off') ? document.getElementById('record-type-off').checked : false;

  const selectMenuLabel = document.getElementById('select-log-menu-label');
  const selectMenu = document.getElementById('select-log-menu');
  const logInputs = document.getElementById('workout-log-inputs');

  if (isOff) {
    if (selectMenuLabel) selectMenuLabel.style.display = 'none';
    if (selectMenu) selectMenu.style.display = 'none';
    if (logInputs) logInputs.style.display = 'none';
  } else {
    if (selectMenuLabel) selectMenuLabel.style.display = 'block';
    if (selectMenu) selectMenu.style.display = 'block';
    if (logInputs) logInputs.style.display = 'block';

    if (selectMenuLabel) selectMenuLabel.textContent = 'メニュー選択';
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
  summaryEl.innerHTML = `<span>${menu.title} の種目候補</span><span style="font-size: 0.75rem; color: var(--text-sub);">▾</span>`;
  detailsEl.appendChild(summaryEl);

  const chipList = document.createElement('div');
  chipList.className = 'exercise-chip-list';
  chipList.style.cssText = 'padding: 8px 12px 10px; margin-bottom: 0; display: flex; flex-wrap: wrap; gap: 6px; border-top: 1px dashed var(--border-color);';

  menu.exercises.forEach(e => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'exercise-chip';
    
    const nameText = formatExerciseName(e.name, e.variation, e.equipment);
    btn.textContent = `+ ${nameText}`;
    
    btn.onclick = () => {
      addSuggestedExerciseInput(e.name, e.detail, menuId, null, e.equipment || '', e.variation || '');
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
function addSuggestedExerciseInput(exerciseName, detailStr = '', menuId = '', forceCardio = null, initEquip = '', initVar = '') {
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
      <div class="direct-input-group cardio-input-group" data-cardio="true">
        <div class="direct-field">
          <label>時間</label>
          <div class="direct-field-inputwrap">
            <input type="number" class="form-input extra-minutes" inputmode="numeric" min="0" step="1" value="${lastObj.minutes !== undefined ? lastObj.minutes : 30}">
            <span class="direct-field-unit">分</span>
          </div>
        </div>
        <div class="direct-field">
          <label>傾斜</label>
          <div class="direct-field-inputwrap">
            <input type="number" class="form-input extra-incline" inputmode="decimal" min="0" step="0.5" value="${lastObj.incline !== undefined ? lastObj.incline : ''}">
            <span class="direct-field-unit">%</span>
          </div>
        </div>
        <div class="direct-field">
          <label>速度</label>
          <div class="direct-field-inputwrap">
            <input type="number" class="form-input extra-speed" inputmode="decimal" min="0" step="0.1" value="${lastObj.speed !== undefined ? lastObj.speed : ''}">
            <span class="direct-field-unit">km/h</span>
          </div>
        </div>
        <div class="direct-field">
          <label>カロリー</label>
          <div class="direct-field-inputwrap">
            <input type="number" class="form-input extra-calories" inputmode="numeric" min="0" step="1" value="${lastObj.calories !== undefined ? lastObj.calories : ''}">
            <span class="direct-field-unit">kcal</span>
          </div>
        </div>
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
      <div class="variation-select-row equipment-select-row"></div>
      <div class="equipment-select-row"></div>
      <div class="sets-container"></div>
      <button type="button" class="btn-add-set-row" onclick="addSetRowToBlock(this.closest('.extra-log-block'))">＋ セットを追加</button>
    `;
    
    renderVariationChips(block, exerciseName, initVar || lastObj.variation || '');
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
  block.scrollIntoView({ behavior: 'smooth', block: 'center' });
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

function addExtraExerciseInput(initEquip = '', initVar = '') {
  let container = document.getElementById('suggested-fields-container') || document.getElementById('workout-log-inputs');

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
    <div class="variation-select-row equipment-select-row"></div>
    <div class="equipment-select-row"></div>
    <div class="extra-fields-container"></div>
  `;

  container.appendChild(block);
  renderExerciseChipsForBlock(block, initEquip, initVar);
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

function renderExerciseChipsForBlock(block, initEquip = '', initVar = '') {
  const label = block.querySelector('.extra-label-select').value;
  const chipList = block.querySelector('.extra-chip-list');
  const fieldsContainer = block.querySelector('.extra-fields-container');
  const equipContainer = block.querySelector('.equipment-select-row:not(.variation-select-row)');
  const varContainer = block.querySelector('.variation-select-row');

  const isCardio = (label === '有酸素運動');

  if (equipContainer) equipContainer.style.display = isCardio ? 'none' : 'flex';
  if (varContainer) varContainer.style.display = isCardio ? 'none' : 'flex';

  if (isCardio) {
    fieldsContainer.innerHTML = `
      <div class="direct-input-group cardio-input-group" data-cardio="true">
        <div class="direct-field">
          <label>時間</label>
          <div class="direct-field-inputwrap">
            <input type="number" class="form-input extra-minutes" inputmode="numeric" min="0" step="1" placeholder="30">
            <span class="direct-field-unit">分</span>
          </div>
        </div>
        <div class="direct-field">
          <label>傾斜</label>
          <div class="direct-field-inputwrap">
            <input type="number" class="form-input extra-incline" inputmode="decimal" min="0" step="0.5" placeholder="5">
            <span class="direct-field-unit">%</span>
          </div>
        </div>
        <div class="direct-field">
          <label>速度</label>
          <div class="direct-field-inputwrap">
            <input type="number" class="form-input extra-speed" inputmode="decimal" min="0" step="0.1" placeholder="4.5">
            <span class="direct-field-unit">km/h</span>
          </div>
        </div>
        <div class="direct-field">
          <label>カロリー</label>
          <div class="direct-field-inputwrap">
            <input type="number" class="form-input extra-calories" inputmode="numeric" min="0" step="1" placeholder="150">
            <span class="direct-field-unit">kcal</span>
          </div>
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
    chipList.innerHTML = `<span class="exercise-chip-empty">まだ種目がありません（設定から追加できます）</span>`;
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
      renderVariationChips(block, selectedName, initVar || (lastObj ? lastObj.variation : ''));
      renderEquipmentChips(block, selectedName, initEquip || (lastObj ? lastObj.equipment : ''));
      prefillLastLogValues(block, selectedName);
    }
  });
}

function prefillLastLogValues(block, name) {
  const lastObj = getLastExerciseLogObj(name);
  if (!lastObj) return;

  const minInput = block.querySelector('.extra-minutes');
  const inclineInput = block.querySelector('.extra-incline');
  const speedInput = block.querySelector('.extra-speed');
  const calInput = block.querySelector('.extra-calories');

  if (minInput && lastObj.minutes !== undefined && lastObj.minutes !== null) minInput.value = lastObj.minutes;
  if (inclineInput && lastObj.incline !== undefined && lastObj.incline !== null) inclineInput.value = lastObj.incline;
  if (speedInput && lastObj.speed !== undefined && lastObj.speed !== null) speedInput.value = lastObj.speed;
  if (calInput && lastObj.calories !== undefined && lastObj.calories !== null) calInput.value = lastObj.calories;

  if (!minInput) fillSetsContainerFromItem(block, lastObj);
}

function closeWorkoutLogModal() {
  document.getElementById('workout-log-modal').classList.remove('active');
}

function submitWorkoutLog() {
  const isOff = document.getElementById('record-type-off').checked;
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

  const blocks = document.querySelectorAll('#suggested-fields-container .extra-log-block');

  blocks.forEach(block => {
    const nameSelect = block.querySelector('.extra-name-select');
    const nameInput = block.querySelector('.extra-name-input');
    let name = nameSelect && nameSelect.value ? nameSelect.value.trim() : (nameInput ? nameInput.value.trim() : '');

    const minInput = block.querySelector('.extra-minutes');
    const setRows = block.querySelectorAll('.set-input-row');

    const varRow = block.querySelector('.variation-select-row');
    const variation = varRow ? (varRow.dataset.selectedVariation || '') : '';

    const equipRow = block.querySelector('.equipment-select-row:not(.variation-select-row)');
    const equipFromDataset = equipRow ? (equipRow.dataset.selectedEquip || '') : '';
    const equipment = equipFromDataset;

    if (name) {
      if (minInput) {
        const incline = block.querySelector('.extra-incline');
        const speed = block.querySelector('.extra-speed');
        const calories = block.querySelector('.extra-calories');
        appendExerciseLog(name, {
          isCardio: true,
          minutes: minInput.value !== '' ? parseInt(minInput.value, 10) : 0,
          incline: incline && incline.value !== '' ? parseFloat(incline.value) : null,
          speed: speed && speed.value !== '' ? parseFloat(speed.value) : null,
          calories: calories.value !== '' ? parseInt(calories.value, 10) : 0,
          equipment: equipment,
          variation: variation
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

        if (setsArray.length > 0) appendExerciseLog(name, { setsArray: setsArray, equipment: equipment, variation: variation });
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
    recordType: 'menu',
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
    titleEl.textContent = '全身の日';
  } else {
    const menu = state.menus.find(m => m.id === log.menuId);
    const menuTitle = menu ? menu.title : '';
    titleEl.textContent = menuTitle;
  }

  let html = '';
  if (log.exerciseLogs && Object.keys(log.exerciseLogs).length > 0) {
    html += '<div style="display:flex; flex-direction:column; gap:8px;">';
    for (const [exName, logVal] of Object.entries(log.exerciseLogs)) {
      const cleanName = exName.replace('【追加】', ''); 
      const valArray = Array.isArray(logVal) ? logVal : [logVal];

      valArray.forEach(item => {
        // ★ 左側に「種目/タイプ（マシン）」を合体させる
        const nameText = formatExerciseName(cleanName, item.variation, item.equipment);
        // ★ 右側のバッジを非表示にする (false)
        const formatted = formatSingleLogObj(item, false);
        html += `
          <div style="display:flex; justify-content:space-between; align-items:baseline; gap:6px; border-bottom:1px dashed var(--border-color); padding-bottom:6px; flex-wrap:nowrap;">
            <span style="font-weight:500; font-size:0.72rem; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; flex-shrink:1; min-width:0;">${nameText}</span>
            <span style="color:var(--text-sub); font-size:0.72rem; text-align:right; white-space:nowrap; flex-shrink:0;">${formatted}</span>
          </div>
        `;
      });
    }
    html += '</div>';
  } else {
    html = '<p style="color:var(--text-sub);">おやすみしたね</p>';
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
  const menu = state.menus.find(m => m.id === menuId);
  if (!menu) {
    console.warn(`編集対象のメニューが見つかりません: ${menuId}`);
    return;
  }

  state.editingMenuId = menuId;

  const idEl = document.getElementById('edit-menu-id');
  const titleEl = document.getElementById('edit-menu-title');
  const memoEl = document.getElementById('edit-menu-memo');
  const container = document.getElementById('exercise-inputs-container');
  const newExerciseInput = document.getElementById('edit-new-exercise-input');

  if (!idEl || !titleEl || !memoEl || !container) return;

  idEl.textContent = menu.id;
  titleEl.value = menu.title || '';
  memoEl.value = menu.memo || '';

  if (newExerciseInput) {
    newExerciseInput.value = '';
  }

  container.innerHTML = '';

  (Array.isArray(menu.exercises) ? menu.exercises : []).forEach(e => {
    addExerciseInputCard(
      e && e.name ? e.name : '',
      e && e.detail ? e.detail : '',
      e && e.equipment ? e.equipment : '',
      e && e.variation ? e.variation : ''
    );
  });

  makeSortable(container);

  document.getElementById('edit-modal').classList.add('active');
}

function addExerciseInputCard(name = '', detail = '', equipment = '', variation = '') {
  const container = document.getElementById('exercise-inputs-container');
  if (!container) return;

  const row = document.createElement('div');
  row.className = 'exercise-row';

  const card = document.createElement('div');
  card.className = 'lib-exercise-item-card';
  card.style.marginBottom = '0';
  card.dataset.exercisename = name;
  card.dataset.equipment = equipment || '';
  card.dataset.variation = variation || '';

  const header = document.createElement('div');
  header.className = 'lib-exercise-header';
  header.style.marginBottom = '4px';

  const left = document.createElement('div');
  left.style.cssText = 'display:flex; align-items:center; gap:6px; flex:1;';

  const moveGroup = document.createElement('div');
  moveGroup.className = 'move-btn-group';

  const upBtn = document.createElement('button');
  upBtn.type = 'button';
  upBtn.className = 'btn-move-row';
  upBtn.textContent = '▲';
  upBtn.addEventListener('click', () => moveBlock(upBtn, -1));

  const downBtn = document.createElement('button');
  downBtn.type = 'button';
  downBtn.className = 'btn-move-row';
  downBtn.textContent = '▼';
  downBtn.addEventListener('click', () => moveBlock(downBtn, 1));

  moveGroup.append(upBtn, downBtn);

  const nameEl = document.createElement('span');
  nameEl.className = 'lib-exercise-name';

  const strong = document.createElement('strong');
  strong.textContent = name;

  nameEl.appendChild(strong);
  left.append(moveGroup, nameEl);

  const removeBtn = document.createElement('button');
  removeBtn.type = 'button';
  removeBtn.className = 'chip-remove-btn';
  removeBtn.title = '種目を削除';
  removeBtn.textContent = '×';

  removeBtn.addEventListener('click', e => {
    e.preventDefault();
    e.stopPropagation();
    row.remove();
  });

  header.append(left, removeBtn);

  const detailInput = document.createElement('input');
  detailInput.type = 'text';
  detailInput.className = 'form-input input-detail';
  detailInput.placeholder = 'セット・回数目安 (例: 15~20回 × 3セット)';
  detailInput.value = detail;
  detailInput.style.cssText = 'margin-bottom:6px; font-size:0.75rem !important; padding:6px 10px;';

  const varSelectRow = document.createElement('div');
  varSelectRow.className = 'menu-variation-select-row equipment-select-row';
  varSelectRow.dataset.selectedVariation = variation || '';

  const equipSelectRow = document.createElement('div');
  equipSelectRow.className = 'menu-equip-select-row equipment-select-row';
  equipSelectRow.dataset.selectedEquip = equipment || '';

  card.append(header, detailInput, varSelectRow, equipSelectRow);

  row.appendChild(card);
  container.appendChild(row);

  renderMenuVariationChips(row, name, variation);
  renderMenuEquipmentChips(row, name, equipment);
}

function renderMenuVariationChips(rowEl, exerciseName, selectedVar = '') {
  const varContainer = rowEl.querySelector('.menu-variation-select-row');
  if (!varContainer) return;

  const trimmedName = (exerciseName || '').trim();
  if (!trimmedName) {
    varContainer.innerHTML = '';
    varContainer.dataset.selectedVariation = '';
    varContainer.style.display = 'none';
    return;
  }

  let patterns = state.exerciseVariations[trimmedName] || DEFAULT_VARIATION_PATTERNS[trimmedName];
  const isOnlyNormal = patterns && patterns.length === 1 && patterns[0] === 'ノーマル';
  if (!patterns || patterns.length === 0 || isOnlyNormal) {
    varContainer.innerHTML = '';
    varContainer.dataset.selectedVariation = isOnlyNormal ? patterns[0] : '';
    varContainer.style.display = 'none';
    return;
  }

  varContainer.style.display = 'flex';
  const chipsHTML = patterns.map(va => {
    const isActive = selectedVar === va ? 'active' : '';
    return `<button type="button" class="variation-chip-btn ${isActive}" onclick="selectMenuVarChip(this, '${va}')">${va}</button>`;
  }).join('');

  varContainer.innerHTML = `
    <span style="font-size:0.72rem; color:var(--text-sub); font-weight:700; flex-shrink:0;">タイプ:</span>
    <div class="equipment-chips-list">
      ${chipsHTML}
    </div>
  `;

  varContainer.dataset.selectedVariation = selectedVar || '';
}

function selectMenuVarChip(btnEl, varName) {
  const row = btnEl.closest('.menu-variation-select-row');
  if (!row) return;

  const allBtns = row.querySelectorAll('.variation-chip-btn');
  let chosenVar = '';

  if (btnEl.classList.contains('active')) {
    btnEl.classList.remove('active');
    chosenVar = '';
  } else {
    allBtns.forEach(btn => btn.classList.remove('active'));
    btnEl.classList.add('active');
    chosenVar = varName;
  }

  row.dataset.selectedVariation = chosenVar;
  const card = row.closest('.lib-exercise-item-card');
  if (card) {
    card.dataset.variation = chosenVar;
  }
}

function addMenuExerciseInputFromEdit() {
  const input = document.getElementById('edit-new-exercise-input');
  if (!input) return;

  const name = input.value.trim();
  if (!name) return;

  const existingNames = Array.from(
    document.querySelectorAll(
      '#exercise-inputs-container .lib-exercise-item-card'
    )
  ).map(card => (card.dataset.exercisename || '').trim());

  if (existingNames.includes(name)) {
    alert('この種目はすでにメニューに登録されています。');
    return;
  }

  addExerciseInputCard(name, '15~20回 × 3セット', '', '');
  input.value = '';

  const container = document.getElementById('exercise-inputs-container');
  if (container) makeSortable(container);
}

function closeEditModal() {
  const modal = document.getElementById('edit-modal');
  if (modal) modal.classList.remove('active');

  const newExerciseInput = document.getElementById('edit-new-exercise-input');
  if (newExerciseInput) newExerciseInput.value = '';

  state.editingMenuId = null;
}

function renderMenuEquipmentChips(rowEl, exerciseName, selectedEquip = '') {
  const equipContainer = rowEl.querySelector('.menu-equip-select-row');
  if (!equipContainer) return;

  const trimmedName = (exerciseName || '').trim();
  if (!trimmedName) {
    equipContainer.innerHTML = '';
    equipContainer.dataset.selectedEquip = '';
    equipContainer.style.display = 'none';
    return;
  }

  let patterns = state.exerciseEquipment[trimmedName] || DEFAULT_EQUIPMENT_PATTERNS[trimmedName];
  if (!patterns) {
    const matchedKey = Object.keys(DEFAULT_EQUIPMENT_PATTERNS).find(key => trimmedName.includes(key) || key.includes(trimmedName));
    patterns = matchedKey ? DEFAULT_EQUIPMENT_PATTERNS[matchedKey] : ['マシン', 'ダンベル', 'バーベル', 'ケーブル', '自重'];
  }

  equipContainer.style.display = 'flex';
  const chipsHTML = patterns.map(eq => {
    const isActive = selectedEquip === eq ? 'active' : '';
    return `<button type="button" class="equipment-chip-btn ${isActive}" onclick="selectMenuEquipChip(this, '${eq}')">${eq}</button>`;
  }).join('');

  equipContainer.innerHTML = `
    <span style="font-size:0.72rem; color:var(--text-sub); font-weight:700; flex-shrink:0;">ツール:</span>
    <div class="equipment-chips-list">
      ${chipsHTML}
    </div>
  `;

  equipContainer.dataset.selectedEquip = selectedEquip || '';
}

function selectMenuEquipChip(btnEl, equipName) {
  const row = btnEl.closest('.menu-equip-select-row');
  if (!row) return;

  const allBtns = row.querySelectorAll('.equipment-chip-btn');
  let chosenEquip = '';

  if (btnEl.classList.contains('active')) {
    btnEl.classList.remove('active');
    chosenEquip = '';
  } else {
    allBtns.forEach(btn => btn.classList.remove('active'));
    btnEl.classList.add('active');
    chosenEquip = equipName;
  }

  row.dataset.selectedEquip = chosenEquip;
  const card = row.closest('.lib-exercise-item-card');
  if (card) {
    card.dataset.equipment = chosenEquip;
  }
}

function saveMenuEdit() {
  if (!state.editingMenuId) return;

  const titleEl = document.getElementById('edit-menu-title');
  const memoEl = document.getElementById('edit-menu-memo');

  if (!titleEl || !memoEl) return;

  const newTitle = titleEl.value.trim();
  const newMemo = memoEl.value.trim();

  if (!newTitle) {
    alert('メニュータイトルを入力してください。');
    titleEl.focus();
    return;
  }

  const targetMenu = state.menus.find(m => m.id === state.editingMenuId);
  if (!targetMenu) {
    alert('編集対象のメニューが見つかりません。');
    return;
  }

  const cards = document.querySelectorAll('#exercise-inputs-container .exercise-row .lib-exercise-item-card');
  const newExercises = [];

  cards.forEach(card => {
    const name = (card.dataset.exercisename || '').trim();
    const detailEl = card.querySelector('.input-detail');
    const detail = detailEl ? detailEl.value.trim() : '';
    const equipment = (card.dataset.equipment || '').trim();
    const variation = (card.dataset.variation || '').trim();

    if (name) {
      const exercise = { name: name, detail: detail };
      if (equipment) exercise.equipment = equipment;
      if (variation) exercise.variation = variation;
      newExercises.push(exercise);
    }
  });

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
        tag.textContent = shortLabel;
        
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
    state.exerciseVariations = JSON.parse(JSON.stringify(DEFAULT_VARIATION_PATTERNS));
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
    const vars = state.exerciseVariations[name] || DEFAULT_VARIATION_PATTERNS[name] || [];
    const varChipsHTML = vars.map(va => `
      <span class="lib-equip-chip">
        ${va}<button type="button" class="btn-remove-var" data-ex="${name}" data-var="${va}">&times;</button>
      </span>
    `).join('');

    const equips = state.exerciseEquipment[name] || DEFAULT_EQUIPMENT_PATTERNS[name] || [];
    const equipChipsHTML = equips.map(eq => `
      <span class="lib-equip-chip">
        ${eq}<button type="button" class="btn-remove-eq" data-ex="${name}" data-eq="${eq}">&times;</button>
      </span>
    `).join('');

    return `
      <div class="lib-exercise-item-card" data-exercisename="${name}">
        <div class="lib-exercise-header">
          <span class="lib-exercise-name"><strong>${name}</strong></span>
          <button type="button" class="chip-remove-btn btn-remove-lib-ex" data-ex="${name}" title="種目を削除">&times;</button>
        </div>
        
        <!-- タイプ管理 -->
        <div class="lib-exercise-equip-row" style="margin-bottom: 8px;">
          <div style="font-size:0.7rem; font-weight:700; color:var(--text-sub); margin-bottom:2px;">タイプの管理</div>
          <div class="lib-equip-list">${varChipsHTML}</div>
          <div class="lib-equip-add-form" style="margin-top:4px;">
            <input type="text" class="form-input lib-new-equip-input lib-new-var-input" ">
            <button type="button" class="btn-lib-equip-add btn-add-var" data-ex="${name}">+ 追加</button>
          </div>
        </div>

        <!-- 器具・マシンの管理 -->
        <div class="lib-exercise-equip-row">
          <div style="font-size:0.7rem; font-weight:700; color:var(--text-sub); margin-bottom:2px;">ツールの管理</div>
          <div class="lib-equip-list">${equipChipsHTML}</div>
          <div class="lib-equip-add-form" style="margin-top:4px;">
            <input type="text" class="form-input lib-new-equip-input lib-new-eq-input" ">
            <button type="button" class="btn-lib-equip-add btn-add-eq" data-ex="${name}">+ 追加</button>
          </div>
        </div>
      </div>
    `;
  }).join('');

  // ▼ イベントリスナーを安全に一括登録
  container.querySelectorAll('.btn-add-var').forEach(btn => {
    btn.onclick = () => {
      const exName = btn.dataset.ex;
      const input = btn.previousElementSibling;
      if (!input) return;
      const varName = input.value.trim();
      if (!varName) return;

      if (!state.exerciseVariations[exName]) {
        state.exerciseVariations[exName] = [...(DEFAULT_VARIATION_PATTERNS[exName] || [])];
      }
      if (state.exerciseVariations[exName].includes(varName)) {
        alert('既に登録されているタイプです');
        return;
      }
      state.exerciseVariations[exName].push(varName);
      saveState();
      input.value = '';
      renderLibraryExerciseChips();
    };
  });

  container.querySelectorAll('.btn-add-eq').forEach(btn => {
    btn.onclick = () => {
      const exName = btn.dataset.ex;
      const input = btn.previousElementSibling;
      if (!input) return;
      const equipName = input.value.trim();
      if (!equipName) return;

      if (!state.exerciseEquipment[exName]) {
        state.exerciseEquipment[exName] = [...(DEFAULT_EQUIPMENT_PATTERNS[exName] || ['マシン', 'ダンベル', 'バーベル', 'ケーブル', '自重'])];
      }
      if (state.exerciseEquipment[exName].includes(equipName)) {
        alert('既に登録されているツールです');
        return;
      }
      state.exerciseEquipment[exName].push(equipName);
      saveState();
      input.value = '';
      renderLibraryExerciseChips();
    };
  });

  container.querySelectorAll('.btn-remove-var').forEach(btn => {
    btn.onclick = () => removeExerciseVar(btn.dataset.ex, btn.dataset.var);
  });

  container.querySelectorAll('.btn-remove-eq').forEach(btn => {
    btn.onclick = () => removeExerciseEquip(btn.dataset.ex, btn.dataset.eq);
  });

  container.querySelectorAll('.btn-remove-lib-ex').forEach(btn => {
    btn.onclick = () => removeLibraryExercise(btn.dataset.ex);
  });
}

function addExerciseVar(exName, btnEl) {
  // すぐ前ではなく、同じフォーム内にあるinputを確実に取得する
  const formBlock = btnEl.closest('.lib-equip-add-form');
  const input = formBlock ? formBlock.querySelector('.lib-new-equip-input') : null;
  
  if (!input) return;
  const varName = input.value.trim();
  if (!varName) return;

  if (!state.exerciseVariations[exName]) {
    state.exerciseVariations[exName] = [...(DEFAULT_VARIATION_PATTERNS[exName] || [])];
  }

  if (state.exerciseVariations[exName].includes(varName)) {
    alert('既に登録されているタイプです');
    return;
  }

  state.exerciseVariations[exName].push(varName);
  saveState();
  input.value = '';
  renderLibraryExerciseChips();
}

function addExerciseEquip(exName, btnEl) {
  // すぐ前ではなく、同じフォーム内にあるinputを確実に取得する
  const formBlock = btnEl.closest('.lib-equip-add-form');
  const input = formBlock ? formBlock.querySelector('.lib-new-equip-input') : null;

  if (!input) return;
  const equipName = input.value.trim();
  if (!equipName) return;

  if (!state.exerciseEquipment[exName]) {
    state.exerciseEquipment[exName] = [...(DEFAULT_EQUIPMENT_PATTERNS[exName] || ['マシン', 'ダンベル', 'バーベル', 'ケーブル', '自重'])];
  }

  if (state.exerciseEquipment[exName].includes(equipName)) {
    alert('既に登録されているツールです');
    return;
  }

  state.exerciseEquipment[exName].push(equipName);
  saveState();
  input.value = '';
  renderLibraryExerciseChips();
}

function removeExerciseVar(exName, varName) {
  if (!state.exerciseVariations[exName]) {
    state.exerciseVariations[exName] = [...(DEFAULT_VARIATION_PATTERNS[exName] || [])];
  }
  state.exerciseVariations[exName] = state.exerciseVariations[exName].filter(v => v !== varName);
  saveState();
  renderLibraryExerciseChips();
}

function removeLibraryExercise(name) {
  if (confirm(`「${name}」をリストから削除しますか？`)) {
    state.exerciseLibrary[currentLibraryLabel] = state.exerciseLibrary[currentLibraryLabel].filter(n => n !== name);
    delete state.exerciseEquipment[name];
    delete state.exerciseVariations[name];
    saveState();
    renderLibraryExerciseChips();
  }
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
  state.exerciseVariations[name] = ['ノーマル']; // ★ ここを追加
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
  } else if (tabName === 'body-map') {
    buttons[1].classList.add('active');
    document.getElementById('tab-content-body-map').classList.add('active');
    renderBodyMap();
  } else if (tabName === 'history') {
    buttons[2].classList.add('active');
    document.getElementById('tab-content-history').classList.add('active');
    renderHistoryLogs();
  } else if (tabName === 'inbody') {
    buttons[3].classList.add('active');
    document.getElementById('tab-content-inbody').classList.add('active');
    renderInbodyTab();
  } else if (tabName === 'menu-list') {
    document.getElementById('tab-content-menu-list').classList.add('active');
  }
}

let bodyMapMode = 'area';

const MUSCLE_GROUP_LIST = [
  '大胸筋', '広背筋', '僧帽筋', '脊柱起立筋',
  '三角筋', '上腕二頭筋', '上腕三頭筋', '前腕',
  '腹直筋', '腹斜筋',
  '大臀筋', '中臀筋', '大腿四頭筋', 'ハムストリングス', '内転筋', '下腿三頭筋'
];

function switchBodyMapMode(mode) {
  bodyMapMode = mode;
  document.querySelectorAll('.body-map-mode-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.mode === mode);
  });
  renderBodyMap();
}

function getExerciseBaseName(exName) {
  return exName.split(/（|\(/)[0].trim();
}

function getExerciseDetail(exName) {
  const baseName = getExerciseBaseName(exName);
  let detail = state.exerciseDetails[baseName] || state.exerciseDetails[exName];
  if (!detail) {
    detail = {
      generalTips: '',
      variations: [
        { name: '基本のやり方', target: '未設定', tips: '自分なりのフォームのコツや注意点などを意識して行いましょう。' }
      ]
    };
  }
  return { baseName, detail };
}

function renderBodyMap() {
  const container = document.getElementById('body-map-list');
  if (!container) return;

  if (bodyMapMode === 'muscle') {
    renderBodyMapByMuscle(container);
  } else {
    renderBodyMapByArea(container);
  }
}

function renderBodyMapByArea(container) {
  container.innerHTML = state.exerciseLabels.map(label => {
    const exes = state.exerciseLibrary[label] || [];
    if (exes.length === 0) return '';

    const exListHTML = exes.map(exName => {
      return `
        <button type="button" class="exercise-tap-btn" onclick="openExerciseDetailModal('${exName.replace(/'/g, "\\'")}')">
          <span>${exName}</span>
          <span class="exercise-tap-arrow">›</span>
        </button>
      `;
    }).join('');

    return `
      <div class="date-accordion-item" style="margin-bottom: 14px; border-radius: 18px; box-shadow: 0 4px 12px rgba(0,0,0,0.03);">
        <div class="date-accordion-header" onclick="toggleBodyMapAccordion(this)" style="padding: 14px 16px;">
          <span style="font-size: 0.95rem; font-weight: 900; color: var(--text-main);">${label}</span>
          <span class="arrow-icon" style="font-size: 1rem; color: var(--text-sub);">▾</span>
        </div>
        <div class="date-accordion-body">
          <div style="padding-top: 4px;">
            ${exListHTML}
          </div>
        </div>
      </div>
    `;
  }).join('');
}

function renderBodyMapByMuscle(container) {
  const allExerciseNames = new Set();
  state.exerciseLabels.forEach(label => {
    (state.exerciseLibrary[label] || []).forEach(exName => allExerciseNames.add(exName));
  });

  const muscleMap = {};
  MUSCLE_GROUP_LIST.forEach(m => { muscleMap[m] = new Set(); });

  allExerciseNames.forEach(exName => {
    const { detail } = getExerciseDetail(exName);
    const targetText = [
      detail.generalTips || '',
      ...(detail.variations || []).map(v => v.target || '')
    ].join(' ');

    MUSCLE_GROUP_LIST.forEach(muscle => {
      if (targetText.includes(muscle)) {
        muscleMap[muscle].add(exName);
      }
    });
  });

  const html = MUSCLE_GROUP_LIST.map(muscle => {
    const exSet = muscleMap[muscle];
    if (!exSet || exSet.size === 0) return '';

    const exListHTML = Array.from(exSet).map(exName => {
      return `
        <button type="button" class="exercise-tap-btn" onclick="openExerciseDetailModal('${exName.replace(/'/g, "\\'")}')">
          <span>${exName}</span>
          <span class="exercise-tap-arrow">›</span>
        </button>
      `;
    }).join('');

    return `
      <div class="date-accordion-item" style="margin-bottom: 14px; border-radius: 18px; box-shadow: 0 4px 12px rgba(0,0,0,0.03);">
        <div class="date-accordion-header" onclick="toggleBodyMapAccordion(this)" style="padding: 14px 16px;">
          <span style="font-size: 0.95rem; font-weight: 900; color: var(--text-main);">${muscle}</span>
          <span class="arrow-icon" style="font-size: 1rem; color: var(--text-sub);">▾</span>
        </div>
        <div class="date-accordion-body">
          <div style="padding-top: 4px;">
            ${exListHTML}
          </div>
        </div>
      </div>
    `;
  }).join('');

  container.innerHTML = html || `<div style="padding:20px; text-align:center; color:var(--text-sub); font-size:0.8rem;">分類できる種目がまだありません。<br>種目の「効く部位」に筋肉名（大胸筋、広背筋など）を入力すると、ここに表示されます。</div>`;
}

function openExerciseDetailModal(exName) {
  const { baseName, detail } = getExerciseDetail(exName);

  document.getElementById('exercise-detail-name').textContent = exName;
  document.getElementById('exercise-detail-basename').value = baseName;

  const generalHTML = detail.generalTips
    ? `<div style="font-size:0.8rem; color:var(--text-sub); margin-bottom:14px; line-height:1.6;">${detail.generalTips}</div>`
    : '';

  const variationsHTML = (detail.variations || []).map(v => {
    const nameHtml = v.name
      ? `<div style="font-size:0.85rem; font-weight:900; color:var(--text-main); margin-bottom:4px;">${v.name}</div>`
      : '';

    return `
      <div class="exercise-detail-variation">
        ${nameHtml}
        <div style="font-size:0.75rem; margin-bottom:4px; display:flex; align-items:flex-start; gap:6px;">
          <span style="flex-shrink:0;">🎯</span>
          <div><span style="color:var(--text-main); font-weight:700;">${v.target}</span></div>
        </div>
        <div style="font-size:0.75rem; line-height:1.5; display:flex; align-items:flex-start; gap:6px;">
          <span style="flex-shrink:0;"></span>
          <div><span style="color:var(--text-sub);">${v.tips}</span></div>
        </div>
      </div>
    `;
  }).join('');

  document.getElementById('exercise-detail-body').innerHTML = `
    ${generalHTML}
    <div style="display:flex; flex-direction:column;">
      ${variationsHTML}
    </div>
  `;

  document.getElementById('exercise-detail-modal').classList.add('active');
}

function closeExerciseDetailModal() {
  document.getElementById('exercise-detail-modal').classList.remove('active');
}

function toggleBodyMapAccordion(headerEl) {
  const item = headerEl.closest('.date-accordion-item');
  if (!item) return;
  const body = item.querySelector('.date-accordion-body');
  if (!body) return;
  
  const isActive = item.classList.contains('active');
  
  if (isActive) {
    body.style.maxHeight = '0px';
    item.classList.remove('active');
  } else {
    item.classList.add('active');
    body.style.maxHeight = (body.scrollHeight + 150) + 'px';
  }
}

function openDictEditModal(baseName) {
  const modal = document.getElementById('dict-edit-modal');
  document.getElementById('dict-edit-name').textContent = baseName;
  document.getElementById('dict-edit-basename').value = baseName;

  let detail = state.exerciseDetails[baseName];
  if (!detail) {
    detail = { generalTips: '', variations: [] };
  }

  document.getElementById('dict-edit-general').value = detail.generalTips || '';

  const container = document.getElementById('dict-variations-container');
  container.innerHTML = '';
  
  if (detail.variations && detail.variations.length > 0) {
    detail.variations.forEach(v => {
      addDictVariation(v.name, v.target, v.tips);
    });
  } else {
    addDictVariation('基本のやり方', '', '');
  }

  modal.classList.add('active');
}

function closeDictEditModal() {
  document.getElementById('dict-edit-modal').classList.remove('active');
}

function addDictVariation(name = '', target = '', tips = '') {
  const container = document.getElementById('dict-variations-container');
  
  const block = document.createElement('div');
  block.className = 'lib-exercise-item-card';
  block.style.padding = '12px';
  block.style.position = 'relative';

  block.innerHTML = `
    <button type="button" class="chip-remove-btn" style="position:absolute; top:8px; right:8px;" onclick="this.closest('.lib-exercise-item-card').remove()">&times;</button>
    
    <label style="font-size:0.7rem; font-weight:700; color:var(--primary-color);">▍ タイプ名</label>
    <input type="text" class="form-input var-name" value="${name}" style="font-size:0.8rem !important; padding:8px 10px; margin-bottom:8px;">
    
    <label style="font-size:0.7rem; font-weight:700; color:var(--primary-color);">🎯 効く部位</label>
    <input type="text" class="form-input var-target" value="${target}" style="font-size:0.8rem !important; padding:8px 10px; margin-bottom:8px;">
    
    <label style="font-size:0.7rem; font-weight:700; color:var(--primary-color);">コツ</label>
    <textarea class="form-input form-textarea var-tips" style="font-size:0.8rem !important; padding:8px 10px; height:60px; margin-bottom:0;">${tips}</textarea>
  `;

  container.appendChild(block);
}

function saveDictEdit() {
  const baseName = document.getElementById('dict-edit-basename').value;
  const generalTips = document.getElementById('dict-edit-general').value.trim();
  
  const blocks = document.querySelectorAll('#dict-variations-container .lib-exercise-item-card');
  const variations = [];
  
  blocks.forEach(block => {
    const name = block.querySelector('.var-name').value.trim();
    const target = block.querySelector('.var-target').value.trim();
    const tips = block.querySelector('.var-tips').value.trim();
    
    if (name || target || tips) {
      variations.push({
        name: name,
        target: target || '未設定',
        tips: tips || ''
      });
    }
  });

  if (!state.exerciseDetails) state.exerciseDetails = {};
  state.exerciseDetails[baseName] = {
    generalTips: generalTips,
    variations: variations
  };

  saveState();
  closeDictEditModal();
  renderBodyMap(); 
}

function renderInbodyTab() {
  const emptyState = document.getElementById('inbody-empty-state');
  const contentWrap = document.getElementById('inbody-content-wrap');
  const heroCard = document.getElementById('ib-hero-card');
  const listContainer = document.getElementById('inbody-list-container');
  if (!contentWrap || !heroCard || !listContainer) return;

  if (!state.inbodyLogs || state.inbodyLogs.length === 0) {
    if (emptyState) emptyState.style.display = 'block';
    contentWrap.style.display = 'none';
    return;
  }
  if (emptyState) emptyState.style.display = 'none';
  contentWrap.style.display = 'block';

  const sorted = [...state.inbodyLogs].sort((a, b) => a.date.localeCompare(b.date));
  const latest = sorted[sorted.length - 1];
  const prev = sorted.length > 1 ? sorted[sorted.length - 2] : null;

  // --- ヒーローカード（最新の体重を大きく表示 + サブ指標） ---
  const fmtDiff = (curr, prevVal, unit) => {
    if (curr === null || curr === undefined || curr === '' || (!prevVal && prevVal !== 0)) return '<span class="ib-diff flat">-</span>';
    const diff = Math.round((curr - prevVal) * 10) / 10;
    if (diff === 0) return `<span class="ib-diff flat">±0${unit}</span>`;
    const cls = diff > 0 ? 'up' : 'down';
    const arrow = diff > 0 ? '▲' : '▼';
    const sign = diff > 0 ? '+' : '';
    return `<span class="ib-diff ${cls}">${arrow} ${sign}${diff}${unit}</span>`;
  };

  const [y, m, d] = latest.date.split('-');
  const dateObj0 = new Date(parseInt(y, 10), parseInt(m, 10) - 1, parseInt(d, 10));
  const dow0 = ['日', '月', '火', '水', '木', '金', '土'][dateObj0.getDay()];

  const subStat = (label, value, unit, diffHtml) => `
    <div class="ib-sub-stat">
      <div class="ib-sub-stat-top"><span class="ib-sub-stat-label">${label}</span></div>
      <div class="ib-sub-stat-value">${(value === null || value === undefined || value === '') ? '-' : value + unit}</div>
      ${diffHtml}
    </div>
  `;

  heroCard.innerHTML = `
    <div class="ib-hero-card">
      <div class="ib-hero-date">${y}/${parseInt(m, 10)}/${parseInt(d, 10)} (${dow0}) の記録</div>
      <div class="ib-hero-main">
        <div class="ib-hero-weight-label">体重</div>
        <div class="ib-hero-weight-value">${latest.weight !== null && latest.weight !== undefined ? latest.weight : '-'}<span class="ib-hero-weight-unit">kg</span></div>
        ${prev ? fmtDiff(latest.weight, prev.weight, 'kg') : ''}
      </div>
      <div class="ib-hero-sub-grid">
        ${subStat('骨格筋量', latest.muscle, 'kg', prev ? fmtDiff(latest.muscle, prev.muscle, 'kg') : '')}
        ${subStat('体脂肪率', latest.fatPercent, '%', prev ? fmtDiff(latest.fatPercent, prev.fatPercent, '%') : '')}
        ${subStat('BMI', latest.bmi, '', prev ? fmtDiff(latest.bmi, prev.bmi, '') : '')}
      </div>
    </div>
  `;

  // --- グラフ ---
  const metricSelect = document.getElementById('inbody-metric-select');
  const segSelect = document.getElementById('inbody-segmental-select');
  if (metricSelect) metricSelect.value = state.inbodyMetric || 'weight';

  if (state.inbodyMetric === 'segmental') {
    if (segSelect) segSelect.style.display = 'block';
    onSegmentalSelectChange();
  } else {
    if (segSelect) segSelect.style.display = 'none';
    drawInbodyChart(state.inbodyMetric || 'weight');
  }

  // --- 履歴リスト ---
  listContainer.innerHTML = '';
  const listSorted = [...sorted].reverse();

  listSorted.forEach((log) => {
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
          <div class="ib-seg-row">
            <span class="ib-seg-cell label">${s.label}</span>
            <span class="ib-seg-cell val muscle">${mVal}</span>
            <span class="ib-seg-cell val fat">${fVal}</span>
          </div>
        `;
      }).join('');

      segTableHTML = `
        <div class="ib-seg-container">
          <div class="ib-seg-header">
            <span class="ib-seg-cell label">部位</span>
            <span class="ib-seg-cell val muscle">筋肉量(%)</span>
            <span class="ib-seg-cell val fat">脂肪量(%)</span>
          </div>
          ${rowsHTML}
        </div>
      `;
    }

    const item = document.createElement('div');
    item.className = 'date-accordion-item ib-history-card';

    const header = document.createElement('div');
    header.className = 'date-accordion-header ib-history-card-top';
    header.innerHTML = `
      <span class="ib-history-date">${formattedDate}</span>
      <span class="ib-history-weight">${log.weight !== null && log.weight !== undefined ? `${log.weight}kg` : '-'}<span class="arrow-icon" style="margin-left:8px;">▾</span></span>
    `;

    const body = document.createElement('div');
    body.className = 'date-accordion-body';
    body.innerHTML = `
      <div class="ib-history-chips">
        ${chips.map(c => `<span class="inbody-metric-chip">${c}</span>`).join('') || '<span class="ib-history-empty-chip">詳細データなし</span>'}
      </div>
      ${segTableHTML}
      <div class="ib-history-card-footer">
        <button type="button" class="btn-table-edit">編集する</button>
      </div>
    `;

    body.querySelector('.btn-table-edit').onclick = (e) => {
      e.stopPropagation();
      openInbodyModal(log.id);
    };

    header.onclick = () => {
      const isActive = item.classList.contains('active');
      if (isActive) {
        body.style.maxHeight = '0px';
        item.classList.remove('active');
      } else {
        item.classList.add('active');
        body.style.maxHeight = body.scrollHeight + 40 + 'px';
      }
    };

    item.appendChild(header);
    item.appendChild(body);
    listContainer.appendChild(item);
  });

  const firstItem = listContainer.querySelector('.date-accordion-item');
  if (firstItem) {
    const firstBody = firstItem.querySelector('.date-accordion-body');
    setTimeout(() => {
      firstItem.classList.add('active');
      firstBody.style.maxHeight = firstBody.scrollHeight + 40 + 'px';
    }, 50);
  }
}

function switchInbodyMetric(metric) {
  state.inbodyMetric = metric;
  saveState();

  const segSelect = document.getElementById('inbody-segmental-select');
  if (metric === 'segmental') {
    if (segSelect) segSelect.style.display = 'block';
    onSegmentalSelectChange();
  } else {
    if (segSelect) segSelect.style.display = 'none';
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
  let dataMin = Math.min(...values);
  let dataMax = Math.max(...values);
  if (dataMin === dataMax) {
    dataMin -= 1;
    dataMax += 1;
  }

  let range = dataMax - dataMin;
  let roughStep = range / 3;
  let mag = Math.pow(10, Math.floor(Math.log10(roughStep)));
  let norm = roughStep / mag;
  let niceNorm = norm < 1.5 ? 1 : (norm < 3 ? 2 : (norm < 7 ? 5 : 10));
  let step = niceNorm * mag;

  let minVal = Math.floor(dataMin / step) * step;
  let maxVal = Math.ceil(dataMax / step) * step;
  
  if (dataMin - minVal < step * 0.1) minVal -= step;
  if (maxVal - dataMax < step * 0.1) maxVal += step;

  let gridCount = Math.round((maxVal - minVal) / step);
  if (gridCount < 2) {
    gridCount = 2;
    maxVal = minVal + step * gridCount;
  }

  const leftPad = 40; 
  const rightPad = 20; 
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

  for (let g = 0; g <= gridCount; g++) {
    const v = minVal + step * g;
    const y = yForValue(v);
    ctx.beginPath();
    ctx.moveTo(leftPad, y);
    ctx.lineTo(cssWidth - rightPad, y);
    ctx.lineWidth = 1;
    ctx.stroke();
    
    let labelText = v.toFixed(step < 1 ? 1 : 0);
    ctx.fillText(labelText, leftPad - 6, y);
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
  const stepX = Math.max(1, Math.ceil(sorted.length / maxLabels));
  sorted.forEach((log, i) => {
    if (i % stepX !== 0 && i !== sorted.length - 1) return;
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

function deleteInbodyLog() {
  const editingId = document.getElementById('inbody-editing-id').value;
  if (!editingId) return;
  if (!confirm('この測定記録を削除しますか？')) return;

  state.inbodyLogs = state.inbodyLogs.filter(l => l.id !== editingId);
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
        titleText = '全身の日';
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
  let targetMenuId = 'A';
  
  if (category === '上半身A') targetMenuId = 'A';
  else if (category === '上半身B') targetMenuId = 'B';
  else if (category === '下半身A') targetMenuId = 'C';
  else if (category === '下半身B') targetMenuId = 'D';
  else if (category === '有酸素') targetMenuId = 'E';
  else if (category === '全身') targetMenuId = 'F';

  const menu = state.menus.find(m => m.id === targetMenuId);
  if (menu) {
    openWorkoutLogModal(menu.id);
  } else {
    openWorkoutLogModal('A');
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

function exportTrainingLogs() {
  if (!state.logs || state.logs.length === 0) {
    alert("記録がまだありません。");
    return;
  }
  const sortedLogs = [...state.logs].sort((a, b) => a.date.localeCompare(b.date));
  const jsonStr = JSON.stringify(sortedLogs, null, 2);

  const today = new Date();
  const y = today.getFullYear();
  const m = String(today.getMonth() + 1).padStart(2, '0');
  const d = String(today.getDate()).padStart(2, '0');
  const filename = `usatore_logs_${y}${m}${d}.json`;

  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function resyncCodeDefaults() {
  if (!confirm("メニュー・種目・タイプ・器具の内容を、コード側の最新の内容に合わせ直します。\n（トレーニング記録・InBody記録は消えません）\n\nよろしいですか？")) {
    return;
  }
  try {
    localStorage.removeItem(CODE_SNAPSHOT_KEY);
  } catch (e) { /* 無視 */ }
  location.reload();
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

function openMenuSettingsModal() {
  renderMenuSettingsAccordion();
  document.getElementById('menu-settings-modal').classList.add('active');
}

function closeMenuSettingsModal() {
  document.getElementById('menu-settings-modal').classList.remove('active');
  renderMenuTable();
  renderRecommendation();
}

function renderMenuSettingsAccordion(openMenuId = null) {
  const container = document.getElementById(
    'menu-settings-accordion-container'
  );

  if (!container) return;

  if (!openMenuId) {
    const activeItem = container.querySelector(
      '.date-accordion-item.active'
    );

    if (activeItem) {
      openMenuId = activeItem.dataset.menuid;
    }
  }

  container.innerHTML = state.menus.map(menu => {

    const exercisesHTML = menu.exercises.map((e, idx) => {

      // ★ タイプの描画
      let varPatterns = state.exerciseVariations[e.name] || DEFAULT_VARIATION_PATTERNS[e.name];
      if (!varPatterns) {
        const matchedKey = Object.keys(DEFAULT_VARIATION_PATTERNS).find(key => e.name.includes(key) || key.includes(e.name));
        varPatterns = matchedKey ? DEFAULT_VARIATION_PATTERNS[matchedKey] : [];
      }
      const selectedVariation = e.variation || '';
      const varIsOnlyNormal = varPatterns.length === 1 && varPatterns[0] === 'ノーマル';
      
      const variationHTML = (varPatterns.length > 0 && !varIsOnlyNormal) ? `
        <div class="menu-equipment-setting" style="display:flex; flex-wrap:wrap; align-items:center; gap:5px; margin-top:4px; padding-top:2px;">
          <span style="font-size:0.7rem; color:var(--text-sub); font-weight:700; width:100%; margin-bottom:1px;">タイプ</span>
          <div class="equipment-chips-list" style="display:flex; flex-wrap:wrap; gap:4px;">
            ${varPatterns.map(va => {
              const active = selectedVariation === va ? 'active' : '';
              return `<button type="button" class="variation-chip-btn ${active}" onclick="selectMenuAccordionVarChip(this, '${menu.id}', ${idx}); event.stopPropagation();">${va}</button>`;
            }).join('')}
          </div>
        </div>
      ` : '';

      // 器具の描画
      let equipPatterns = state.exerciseEquipment[e.name] || DEFAULT_EQUIPMENT_PATTERNS[e.name];
      if (!equipPatterns) {
        const matchedKey = Object.keys(DEFAULT_EQUIPMENT_PATTERNS).find(key => e.name.includes(key) || key.includes(e.name));
        equipPatterns = matchedKey ? DEFAULT_EQUIPMENT_PATTERNS[matchedKey] : ['マシン', 'ダンベル', 'バーベル', 'ケーブル', '自重'];
      }
      const selectedEquipment = e.equipment || '';
      
      const equipmentHTML = equipPatterns.map(eq => {
        const active = selectedEquipment === eq ? 'active' : '';
        return `<button type="button" class="equipment-chip-btn ${active}" onclick="selectMenuAccordionEquipChip(this, '${menu.id}', ${idx}); event.stopPropagation();">${eq}</button>`;
      }).join('');

      return `
        <div class="lib-exercise-item-card" data-exercisename="${e.name}" style="margin-bottom:6px;">
          <div class="lib-exercise-header" style="margin-bottom:4px;">
            <span class="lib-exercise-name"><strong>${e.name}</strong></span>
            <button type="button" class="chip-remove-btn" onclick="removeMenuAccordionExercise('${menu.id}', ${idx}); event.stopPropagation();">&times;</button>
          </div>
          <input type="text" class="form-input input-detail" placeholder="セット・回数目安" value="${e.detail || ''}" style="margin-bottom:6px; font-size:0.75rem !important; padding:6px 10px;" oninput="updateMenuAccordionDetail('${menu.id}', ${idx}, this.value)">
          
          ${variationHTML}

          <div class="menu-equipment-setting" style="display:flex; flex-wrap:wrap; align-items:center; gap:5px; margin-top:4px; padding-top:2px;">
            <span style="font-size:0.7rem; color:var(--text-sub); font-weight:700; width:100%; margin-bottom:1px;">ツール</span>
            <div class="equipment-chips-list" style="display:flex; flex-wrap:wrap; gap:4px;">
              ${equipmentHTML}
            </div>
          </div>
        </div>
      `;
    }).join('');

    const isOpen = String(menu.id) === String(openMenuId) ? 'active' : '';

    return `
      <div class="date-accordion-item ${isOpen}" data-menuid="${menu.id}" style="margin-bottom:8px;">
        <div class="date-accordion-header" onclick="toggleMenuAccordion(this)">
          <span style="font-weight:900;"><span class="menu-badge menu-badge-${menu.id}" style="margin-right:6px;">${menu.id}</span>${menu.title}</span>
          <span class="arrow-icon">▾</span>
        </div>
        <div class="date-accordion-body" style="background:var(--bg-color);">
          <label class="form-label">メニュータイトル</label>
          <input type="text" class="form-input menu-title-input" value="${menu.title}" oninput="updateMenuAccordionTitle('${menu.id}', this.value)" style="margin-bottom:8px;">
          <label class="form-label">メモ</label>
          <textarea class="form-input form-textarea menu-memo-input" oninput="updateMenuAccordionMemo('${menu.id}', this.value)" style="margin-bottom:8px; height:50px;">${menu.memo || ''}</textarea>
          <label class="form-label">種目一覧</label>
          <div class="menu-exercises-container" style="margin-bottom:8px;">${exercisesHTML}</div>
          <div style="display:flex; gap:6px;">
            <input type="text" class="form-input menu-new-ex-input"  style="margin-bottom:0; font-size:0.75rem;">
            <button type="button" class="btn-library-add" onclick="addMenuAccordionExercise('${menu.id}', this); event.stopPropagation();">+ 追加</button>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

function selectMenuAccordionVarChip(btnEl, menuId, exerciseIndex) {
  const menu = state.menus.find(m => String(m.id) === String(menuId));
  if (!menu || !menu.exercises[exerciseIndex]) return;

  const card = btnEl.closest('.menu-equipment-setting');
  if (!card) return;
  const allBtns = card.querySelectorAll('.variation-chip-btn');
  let selectedVariation = '';

  if (btnEl.classList.contains('active')) {
    btnEl.classList.remove('active');
    selectedVariation = '';
  } else {
    allBtns.forEach(btn => btn.classList.remove('active'));
    btnEl.classList.add('active');
    selectedVariation = btnEl.textContent.trim();
  }

  if (selectedVariation) {
    menu.exercises[exerciseIndex].variation = selectedVariation;
  } else {
    delete menu.exercises[exerciseIndex].variation;
  }
  saveState();
}

function selectMenuAccordionEquipChip(btnEl, menuId, exerciseIndex) {
  const menu = state.menus.find(m => String(m.id) === String(menuId));
  if (!menu || !menu.exercises[exerciseIndex]) return;

  const card = btnEl.closest('.menu-equipment-setting');
  if (!card) return;
  const allBtns = card.querySelectorAll('.equipment-chip-btn');
  let selectedEquipment = '';

  if (btnEl.classList.contains('active')) {
    btnEl.classList.remove('active');
    selectedEquipment = '';
  } else {
    allBtns.forEach(btn => btn.classList.remove('active'));
    btnEl.classList.add('active');
    selectedEquipment = btnEl.textContent.trim();
  }

  if (selectedEquipment) {
    menu.exercises[exerciseIndex].equipment = selectedEquipment;
  } else {
    delete menu.exercises[exerciseIndex].equipment;
  }
  saveState();
}

function toggleMenuAccordion(headerEl) {
  const item = headerEl.closest('.date-accordion-item');
  if (!item) return;
  const body = item.querySelector('.date-accordion-body');
  if (!body) return;

  if (item.classList.contains('active')) {
    body.style.maxHeight = '0px';
    item.classList.remove('active');
  } else {
    item.classList.add('active');
    body.style.maxHeight = (body.scrollHeight + 500) + 'px'; // 余裕を持たせる
  }
}

function updateMenuAccordionTitle(menuId, val) {
  const m = state.menus.find(item => item.id === menuId);
  if (m) { m.title = val; saveState(); }
}
function updateMenuAccordionMemo(menuId, val) {
  const m = state.menus.find(item => item.id === menuId);
  if (m) { m.memo = val; saveState(); }
}
function updateMenuAccordionDetail(menuId, exIdx, val) {
  const m = state.menus.find(item => item.id === menuId);
  if (m && m.exercises[exIdx]) { m.exercises[exIdx].detail = val; saveState(); }
}

function removeMenuAccordionExercise(menuId, exIdx) {
  const m = state.menus.find(item => item.id === menuId);
  if (m) {
    m.exercises.splice(exIdx, 1);
    saveState();
    renderMenuSettingsAccordion(menuId);
  }
}

function addMenuAccordionExercise(menuId, btnEl) {
  const input = btnEl.previousElementSibling;
  if (!input) return;

  const name = input.value.trim();
  if (!name) return;

  const menu = state.menus.find(item => item.id === menuId);
  if (!menu) return;

  const alreadyExists = menu.exercises.some(e => e.name.trim() === name);
  if (alreadyExists) {
    alert('この種目はすでに登録されています。');
    return;
  }

  const newExercise = {
    name: name,
    detail: '15~20回 × 3セット'
  };

  menu.exercises.push(newExercise);
  saveState();
  input.value = '';
  renderMenuSettingsAccordion(menuId);
}

// ▼▼▼ モーダルの背景スクロールを完全に防止するコード ▼▼▼
const modalObserver = new MutationObserver(() => {
  const isModalOpen = document.querySelectorAll('.modal-overlay.active').length > 0;
  if (isModalOpen) {
    // 画面の現在位置を記憶して、背景をガチッと固定する
    document.body.dataset.scrollY = window.scrollY;
    document.body.style.top = `-${window.scrollY}px`;
    document.body.classList.add('modal-open');
  } else {
    // モーダルが閉じたら固定を解除し、元のスクロール位置に戻す
    const scrollY = document.body.dataset.scrollY;
    document.body.classList.remove('modal-open');
    document.body.style.top = '';
    window.scrollTo(0, parseInt(scrollY || '0'));
  }
});

// すべてのモーダルの「表示/非表示（activeクラス）」を監視
document.querySelectorAll('.modal-overlay').forEach(modal => {
  modalObserver.observe(modal, { attributes: true, attributeFilter: ['class'] });
});

// スマホ特有の「背景が引っ張られる（スクロール漏れ）」現象を防ぐ
document.addEventListener('touchmove', (e) => {
  const activeModal = document.querySelector('.modal-overlay.active');
  if (activeModal) {
    // スクロールしている場所が「モーダルの中身」以外なら、スワイプを無効化する
    if (!e.target.closest('.modal-body')) {
      e.preventDefault();
    }
  }
}, { passive: false });


// ▼ 記録は残したまま、メニューと種目リストだけを最新に強制リセットする関数
function forceUpdateMenusAndLibrary() {
  if (confirm('メニューと種目リストを最新状態に上書きしますか？\n（★これまでのトレーニング記録は消えません！）')) {
    // コード上の最新データでstateを上書き
    state.menus = JSON.parse(JSON.stringify(initialDefaultMenus));
    state.exerciseLabels = ['胸', '背中', '脚', '肩', '腕', 'お尻', '腹筋', '全身', '有酸素運動', 'その他'];
    state.exerciseLibrary = buildDefaultExerciseLibrary();
    state.exerciseEquipment = JSON.parse(JSON.stringify(DEFAULT_EQUIPMENT_PATTERNS));
    state.exerciseVariations = JSON.parse(JSON.stringify(DEFAULT_VARIATION_PATTERNS));
    state.exerciseDetails = JSON.parse(JSON.stringify(INITIAL_EXERCISE_DETAILS));
    
    // ストレージに保存
    saveState();
    
    alert('🎉 メニューと種目リストを最新版に更新しました！');
    location.reload(); // 画面を自動でリロード
  }
}

/* スマホChrome：キーボードで入力欄が隠れないようにする */
(function setupMobileKeyboardScroll() {
  const isMobile = () =>
    window.matchMedia('(max-width: 768px)').matches ||
    /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

  let scrollTimer = null;

  function keepFocusedInputVisible(input) {
    if (!isMobile() || !input || !input.matches(':focus')) return;

    clearTimeout(scrollTimer);
    scrollTimer = setTimeout(() => {
      const rect = input.getBoundingClientRect();
      const viewportHeight =
        window.visualViewport ? window.visualViewport.height : window.innerHeight;

      // キーボード上端より少し上に入力欄を置く
      const safeBottom = viewportHeight - 24;

      if (rect.bottom > safeBottom || rect.top < 60) {
        input.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
          inline: 'nearest'
        });
      }
    }, 120);
  }

  document.addEventListener('focusin', (e) => {
    const input = e.target.closest('input, textarea, select');
    if (!input) return;
    keepFocusedInputVisible(input);
  });

  if (window.visualViewport) {
    window.visualViewport.addEventListener('resize', () => {
      const input = document.activeElement;
      if (input && input.matches('input, textarea, select')) {
        keepFocusedInputVisible(input);
      }
    });

    window.visualViewport.addEventListener('scroll', () => {
      const input = document.activeElement;
      if (input && input.matches('input, textarea, select')) {
        keepFocusedInputVisible(input);
      }
    });
  }
})();
