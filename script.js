let isEditingLogMode = false;
const STORAGE_KEY = 'trainingRecords';
const CURRENT_SCHEMA_VERSION = 'label-v5'; // ★ スキーマバージョンを更新して自動同期

const initialDefaultMenus = [
    {
      id: 'A',
      title: '上半身 A（フリーウェイト＆ケーブル）',
      memo: 'デコルテ、背中の広がり、二の腕のトーン調整に重点を置いた構成。',
      exercises: [
        { name: 'ラットプルダウン', detail: '15~20回 × 3セット', equipment: 'マググリップ' },
        { name: 'インクラインプレス', detail: '15~20回 × 3セット', equipment: 'アイソラテラル' },
        { name: 'サイドレイズ', detail: '15~20回 × 3セット' },
        { name: 'ケーブルトライセプスエクステンション', detail: '15~20回 × 3セット' },
      ]
    },
    {
      id: 'B',
      title: '上半身 B（マシン＆ローイング）',
      memo: '背中の厚みと姿勢改善、胸の追い込みに重点。',
      exercises: [
        { name: 'ローイング', detail: '15~20回 × 3セット', equipment: 'シーテッド/縦持ち' },
        { name: 'チェストプレス', detail: '15~20回 × 3セット', equipment: 'マシン' },
        { name: 'リアデルトイド', detail: '15~20回 × 3セット' },
        { name: 'アブドミナル', detail: '15~20回 × 3セット' },
        { name: 'バックエクステンション', detail: '15回 × 3セット' },
      ]
    },
    {
      id: 'C',
      title: '下半身 A（美尻・美脚マシン）',
      memo: 'マシンを使用して、お尻と裏ももの境目をクリアに。',
      exercises: [
        { name: 'ヒップスラスト', detail: '15~20回 × 3セット', equipment: 'グルートドライブ' },
        { name: 'レッグカール', detail: '15~20回 × 3セット' },
        { name: 'レッグプレス', detail: '足幅を広め・上位置に / 15~20回 × 3セット', equipment: 'シーテッド' },
        { name: 'ヒップアブダクション（骨盤後傾）', detail: '15~20回 × 3セット' },
      ]
    },
    {
      id: 'D',
      title: '下半身 B（代謝向上・フリーウェイト）',
      memo: '多関節種目でカロリー消費を高め、ヒップアップを狙う。',
      exercises: [
        { name: 'ルーマニアンデッドリフト', detail: '15~20回 × 3セット' },
        { name: 'ブルガリアンスクワット', detail: '左右各12~15回 × 3セット' },
        { name: 'グルートキックバック', detail: 'ケーブル使用 / 左右各15~20回 × 3セット' },
        { name: 'ヒップアブダクション（骨盤立て）', detail: '15~20回 × 3セット' },
      ]
    },
    {
      id: 'E',
      title: 'リカバリー・有酸素',
      memo: '疲労を抜きつつ、脂肪燃焼を促進。',
      exercises: [
        { name: '傾斜ウォーキング', detail: 'トレッドミル / 30〜40分 (傾斜5〜8%、時速4.0〜4.5km)' },
      ]
    },
    {
      id: 'F',
      title: '全身',
      memo: '1週間空いた時や旅行後など、1回で全身をバランスよく刺激したい時に。',
      exercises: [
        { name: 'ブルガリアンスクワット', detail: '左右各10回 × 3セット' },
        { name: 'ラットプルダウン', detail: '10回 × 3セット', equipment: 'マググリップ' },
        { name: 'チェストプレス', detail: '10回 × 3セット', equipment: 'マシン' },
        { name: 'サイドレイズ', detail: '15回 × 2〜3セット' },
        { name: 'アブドミナル', detail: '10回 × 3セット' },
        { name: '傾斜ウォーキング', detail: 'トレッドミル / 30分' },
      ]
    }
];

// script.js の MENU_LABELS 定義をこうしておきます
const MENU_LABELS = {
  'A': '上A', 
  'B': '上B', 
  'C': '下A', 
  'D': '下B', 
  'E': '🏃', // 有酸素の日は走る絵文字
  'F': '全', // 全身の日は「全」
  'ALL': '全', 
  'OFF': '休'
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
  'ローイング': ['シーテッド/縦持ち', 'シーテッド/横持ち', 'アイソラテラル/縦持ち', 'アイソラテラル/横持ち', 'ケーブル', 'ダンベル'],
  'リアデルトイド': ['マシン'],

  // 脚
  'ルーマニアンデッドリフト': ['バーベル', 'ダンベル'],
  'アダクション': ['マシン', 'バンド'],
  'ブルガリアンスクワット': ['ダンベル', 'スミス', '自重'],
  'スクワット': ['バーベル', 'ハック', 'スミス', 'ダンベル', '自重'],
  'レッグプレス': ['シーテッド', '45度リニア'],
  'レッグエクステンション': ['マシン'],
  'レッグカール': ['マシン', 'ライイング'],
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
  'ケーブルトライセプスエクステンション': ['ケーブル'],
  'ケーブルトライセプスキックバック': ['ケーブル'],

  // お尻
  'ヒップアブダクション（骨盤前傾）': ['マシン', 'バンド'],
  'ヒップアブダクション（骨盤立て）': ['マシン', 'バンド'],
  'ヒップアブダクション（骨盤後傾）': ['マシン', 'バンド'],
  'ヒップスラスト': ['グルートドライブ', 'バーベル', 'スミス'],
  'グルートキックバック': ['ケーブル', 'マシン', 'バンド'],

  // 腹筋・体幹
  'アブドミナル': ['マシン','グリップ'],
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

// ★ 変更：全種目・器具・バリエーションを網羅した辞書データ
const INITIAL_EXERCISE_DETAILS = {
  // =========================
  // 胸 (CHEST)
  // =========================
  'インクラインプレス': {
    generalTips: '大胸筋上部を狙い、バストの引き上げやデコルテラインを形成する種目。ベンチ角度は30〜45度が目安。',
    variations: [
      { name: 'ダンベル', target: '大胸筋上部', tips: '可動域が広く、胸のストレッチを強くかけられる。トップでダンベル同士を寄せすぎない。' },
      { name: 'バーベル / スミス', target: '大胸筋上部', tips: '高重量を扱える。スミスマシンは軌道が固定されるため、より安全に追い込める。' },
      { name: 'アイソラテラルマシン', target: '大胸筋上部', tips: '左右独立して動くため、左右差の改善に有効。軌道に沿って押し切る。' }
    ]
  },
  'ベンチプレス': {
    generalTips: '上半身の押す力を総合的に高める多関節種目。肩甲骨を寄せ、胸を張ってアーチを作るのが基本。',
    variations: [
      { name: 'バーベル', target: '大胸筋全体、三角筋前部、上腕三頭筋', tips: 'みぞおちのやや上にバーを下ろす。肩が上がらないよう広背筋で土台を安定させる。' },
      { name: 'ダンベル', target: '大胸筋全体', tips: 'バーベルよりも深く下ろせるためストレッチ効果が高い。' },
      { name: 'スミス', target: '大胸筋全体', tips: '軌道が固定されているため、フォームの習得や胸への意識を集中させやすい。' }
    ]
  },
  'ペックフライ': {
    generalTips: '大胸筋を単関節で鍛え、胸の輪郭や谷間を作る種目。腕の力ではなく胸で挟む意識を持つ。',
    variations: [
      { name: 'マシン', target: '大胸筋（内側〜輪郭）', tips: 'シートの高さを調整し、手が胸のトップラインにくるようにする。' },
      { name: 'ケーブル', target: '大胸筋（内側）', tips: '収縮ポジションでも負荷が抜けず、最後まで胸を絞り込める。' },
      { name: 'ダンベルフライ', target: '大胸筋（外側・ストレッチ）', tips: '下ろした時のストレッチ感が最も強い。肩関節の過伸展に注意。' }
    ]
  },
  'チェストプレス': {
    generalTips: 'ベンチプレスのマシン版。マシンの軌道に沿って押すため、初心者でも安全に大胸筋に効かせやすい。',
    variations: [
      { name: 'マシン', target: '大胸筋全体、上腕三頭筋', tips: 'グリップが胸の中央の高さになるようシートを調整。戻す時に負荷を抜かない。' },
      { name: 'スミス', target: '大胸筋全体', tips: 'フラットベンチを使い、バーベルに近い感覚で安全に行う。' }
    ]
  },
  'ケーブルクロス': {
    generalTips: 'ケーブルの滑車を用いて大胸筋を鍛える。滑車の高さで狙う部位が変わる。',
    variations: [
      { name: 'ハイプーリー（上から下）', target: '大胸筋下部', tips: '胸の輪郭の下部を作る。上体を少し前傾させて下方に絞り込む。' },
      { name: 'ミドルプーリー（水平）', target: '大胸筋中部・内側', tips: '大胸筋全体の厚みと谷間を作る。大木を抱え込むイメージで。' },
      { name: 'ロープーリー（下から上）', target: '大胸筋上部', tips: 'デコルテラインを鍛える。手のひらを上に向けて引き上げる。' }
    ]
  },
  'ディップス': {
    generalTips: '上半身のスクワットと呼ばれる強力な種目。上体の傾きで効く部位が変わる。',
    variations: [
      { name: '前傾姿勢（胸狙い）', target: '大胸筋下部', tips: '上体を前に倒し、肘を開き気味にして動作する。' },
      { name: '直立姿勢（腕狙い）', target: '上腕三頭筋', tips: '上体を立てて、脇を締めたまま肘を曲げ伸ばしする。' },
      { name: 'アシストマシン', target: '大胸筋・三頭筋', tips: '自重でできない場合に有効。下から膝を押し上げて負荷を軽くする。' }
    ]
  },
  'ダンベルフライ': {
    generalTips: '大胸筋のストレッチを主目的とした種目。',
    variations: [
      { name: 'ダンベル', target: '大胸筋全体（外側）', tips: '肘を軽く曲げたまま固定し、肩甲骨を寄せて胸を開く。上げきった所でダンベルをぶつけない。' }
    ]
  },
  'ダンベルプレス': {
    generalTips: '大胸筋全体を鍛えるプレス種目。',
    variations: [
      { name: 'ダンベル', target: '大胸筋全体、上腕三頭筋', tips: 'バーベルと違い手首の角度を自由に変えられるため、肩に違和感がある場合にも適している。' }
    ]
  },

  // =========================
  // 背中 (BACK)
  // =========================
  'デッドリフト': {
    generalTips: '背面全体を鍛えるビッグ3の一つ。背中が丸まると腰を痛めるためフォーム重視で。',
    variations: [
      { name: 'バーベル', target: '脊柱起立筋、広背筋、大臀筋、ハムストリングス', tips: 'すねにバーを沿わせながら引き上げる。胸を張り、腹圧を逃がさない。' },
      { name: 'ダンベル', target: '背面全体', tips: '体の側面に重心を置けるため、バーベルより腰への負担が少ない場合がある。' },
      { name: 'トラップバー（ヘックスバー）', target: '背面全体、大腿四頭筋', tips: '体の中心に重心が来るため、腰の負担が少なく高重量を安全に扱える。' }
    ]
  },
  'バックエクステンション': {
    generalTips: '腰（脊柱起立筋）を中心に鍛える種目。',
    variations: [
      { name: '自重 / ウェイト', target: '脊柱起立筋', tips: '背中を丸めながら下ろし、背筋の力で反り上がる。腰を過剰に反らせない。' },
      { name: 'マシン', target: '脊柱起立筋', tips: 'マシンのパッドに背中を当て、重りに逆らって上体を起こす。' }
    ]
  },
  'ラットプルダウン': {
    generalTips: '背中の広がりや厚みを作る種目。肩甲骨の動きを意識する。',
    variations: [
      { name: '順手・ワイドグリップ', target: '広背筋（上部・外側）、大円筋', tips: '背中の「広がり」を作る。肩幅の1.5倍で握り、鎖骨に向かって引く。' },
      { name: '逆手・ナローグリップ', target: '広背筋（下部）、上腕二頭筋', tips: '背中の「厚み」を作る。腕の関与が大きくなる。脇を締め、みぞおちに引く。' },
      { name: 'マググリップ（パラレル）', target: '広背筋（中部〜下部）', tips: '手首の負担が少なく、自然な軌道で肩甲骨を寄せやすい。' },
      { name: 'ケーブル', target: '広背筋', tips: 'アタッチメントを自由に変えられ、片手（ワンアーム）でより強く収縮させることも可能。' }
    ]
  },
  'チンニング（懸垂）': {
    generalTips: '自重で背中全体を強烈に鍛える種目。',
    variations: [
      { name: '自重', target: '広背筋、大円筋', tips: '胸をバーに近づけるイメージで引く。反動を使わない。' },
      { name: 'アシストマシン', target: '広背筋', tips: '正しいフォームで背中の収縮を感じるための補助として活用。' }
    ]
  },
  'ローイング': {
    generalTips: '前から後ろへ引く動作で、背中の「厚み」を作る種目。',
    variations: [
      { name: 'シーテッド / 縦持ち（パラレル）', target: '広背筋（下部）、僧帽筋中部', tips: '脇を締めて引く。肩甲骨を寄せる意識を持ちやすい。' },
      { name: 'シーテッド / 横持ち（オーバー）', target: '僧帽筋（中部〜上部）、広背筋上部', tips: '脇を開いて引く。背中の上部に厚みを作る。' },
      { name: 'アイソラテラルマシン', target: '広背筋、僧帽筋', tips: '軌道が決まっており、片手ずつ交互に引いて左右差をなくすのに有効。' },
      { name: 'ダンベル（ワンハンドロー）', target: '広背筋', tips: '片手で行うため可動域が広く、背中を大きくストレッチできる。' },
      { name: 'ベントオーバーロー（バーベル）', target: '広背筋、脊柱起立筋', tips: '前傾姿勢を維持するため、体幹部や腰回りも同時に鍛えられる。' }
    ]
  },
  'ベントオーバーロー': {
    generalTips: '上体を前傾させて下から引く多関節種目。',
    variations: [
      { name: 'バーベル', target: '広背筋、僧帽筋、脊柱起立筋', tips: '上体を45度前後に保ち、おへそに向かってバーを引く。' },
      { name: 'ダンベル', target: '広背筋', tips: '手首の角度が自由で、より深く引き切ることができる。' }
    ]
  },
  'リアデルトイド': {
    generalTips: '肩の後ろと背中の上部を鍛え、姿勢改善や立体的な肩を作る種目。',
    variations: [
      { name: 'マシン', target: '三角筋後部、僧帽筋', tips: 'ペックフライマシンの逆向き。肩甲骨を寄せすぎず、腕を外に開く軌道で引く。' }
    ]
  },

  // =========================
  // 脚 (LEGS)
  // =========================
  'スクワット': {
    generalTips: '下半身全体を鍛えるトレーニングの王様。股関節と膝関節を連動させる。',
    variations: [
      { name: 'バーベル（ハイバー）', target: '大腿四頭筋（前もも）、大臀筋', tips: '首の付け根にバーを担ぐ。上体が起きるため前ももに効きやすい。' },
      { name: 'バーベル（ローバー）', target: '大臀筋、ハムストリングス', tips: '肩甲骨の下部でバーを担ぐ。上体が前傾し、お尻や裏ももに効きやすい。' },
      { name: 'スミスマシン', target: '下半身全体', tips: '軌道が固定されるため安全。足を置く位置を前にするとお尻に効きやすい。' },
      { name: 'ダンベル（ゴブレット）', target: '大腿四頭筋', tips: '胸の前にダンベルを持ち、上体を立ててしゃがむ。' },
      { name: 'ハックスクワット', target: '大腿四頭筋', tips: '背もたれに寄りかかって行うマシン。腰への負担が少なく脚を追い込める。' }
    ]
  },
  'レッグプレス': {
    generalTips: '足の置く位置（スタンス）によって、ターゲットとなる部位を細かく調整できるマシン。',
    variations: [
      { name: 'スタンダード（板の中央）', target: '大腿四頭筋、大臀筋', tips: '脚全体をバランスよく鍛える基本のスタンス。' },
      { name: 'ハイスタンス（板の上の方）', target: '大臀筋、ハムストリングス', tips: 'かかと重心で押す。股関節が深く曲がりお尻のストレッチが強くなる。' },
      { name: 'ワイドスタンス（板の端）', target: '内転筋（内もも）、大臀筋', tips: 'つま先を外に向け、膝も同じ方向に曲げる。内ももの引き締めに。' },
      { name: '45度リニア / シーテッド', target: '下半身全体', tips: '45度は重力で高負荷、シーテッドは腰の負担が少なく初心者向け。' }
    ]
  },
  'ブルガリアンスクワット': {
    generalTips: '片脚で行うためバランスが求められ、強い負荷をかけられる種目。',
    variations: [
      { name: '前傾姿勢', target: '大臀筋（お尻）、ハムストリングス', tips: '上体を斜め前に倒し、前足のかかと重心で立ち上がる。' },
      { name: '直立姿勢', target: '大腿四頭筋（前もも）', tips: '上体をまっすぐ立てて、膝を深く曲げるように下に沈む。' },
      { name: 'ダンベル / スミス', target: '下半身', tips: 'ダンベルはバランス強化、スミスはバランスを気にせず部位に集中できる。' }
    ]
  },
  'ルーマニアンデッドリフト': {
    generalTips: '裏ももとお尻の境界線を作るのに効果的な種目。',
    variations: [
      { name: 'バーベル / ダンベル', target: 'ハムストリングス、大臀筋', tips: '膝は軽く曲げたまま固定し、お尻を後ろに突き出す（ヒンジ動作）。背中は丸めない。' }
    ]
  },
  'レッグエクステンション': {
    generalTips: '前ももを単独で鍛え、脚のカット（溝）を出す種目。',
    variations: [
      { name: 'マシン', target: '大腿四頭筋', tips: '蹴り上げたトップで1秒キープすると収縮が強まる。反動を使わない。' }
    ]
  },
  'レッグカール': {
    generalTips: '裏ももを単独で鍛える種目。肉離れ予防にも重要。',
    variations: [
      { name: 'シーテッドマシン', target: 'ハムストリングス', tips: '座って行う。股関節が曲がった状態のため、ハムストリングスがストレッチされやすい。' },
      { name: 'ライイングマシン', target: 'ハムストリングス', tips: 'うつ伏せで行う。お尻が浮かないように骨盤をパッドに押し付ける。' }
    ]
  },
  'アダクション': {
    generalTips: '内ももを引き締め、脚の隙間を作る種目。',
    variations: [
      { name: 'マシン', target: '内転筋', tips: '反動を使わず、内ももの付け根から脚を閉じる意識で行う。' }
    ]
  },
  'グッドモーニング': {
    generalTips: 'お辞儀の動作で背面を鍛える種目。',
    variations: [
      { name: 'バーベル / スミス', target: 'ハムストリングス、脊柱起立筋', tips: 'バーを担ぎ、背筋を伸ばしたまま股関節から上体を前傾させる。' }
    ]
  },

  // =========================
  // お尻 (GLUTES)
  // =========================
  'ヒップアブダクション（骨盤前傾）': {
    generalTips: 'お尻の筋肉（主に中臀筋）を鍛え、ヒップの丸みを作る。',
    variations: [
      { target: '大臀筋（上部）', tips: '背筋を伸ばしたまま前傾。お尻全体のボリュームアップに。' },
    ]
  },

  'ヒップアブダクション（骨盤立て）': {
    generalTips: 'お尻の側面をピンポイントで鍛え、骨盤を安定させたり、ウエストとのメリハリ（くびれ）を作ったりする基本のポジション。',
    variations: [
      { target: '中臀筋・小臀筋', tips: '背もたれにしっかり背中をつけ、背筋をまっすぐ立てて座る。' },
    ]
  },

  'ヒップアブダクション（骨盤後傾）': {
    generalTips: 'お尻の下を鍛えて垂れるのを防止する',
    variations: [
      { target: '大臀筋の下部・外側', tips: '浅く座って背もたれにドカッと寄りかかり、骨盤が後ろに倒れた状態になる。' },
    ]
  },

  'ヒップスラスト': {
    generalTips: 'お尻の筋肉を最大収縮させる、ヒップアップの代表種目。',
    variations: [
      { name: 'グルートドライブ（マシン）', target: '大臀筋', tips: 'ベルトで固定できるため安全。トップでお尻をキュッと締める。' },
      { name: 'バーベル / スミス', target: '大臀筋', tips: 'パッドをバーに巻き、肩甲骨下部をベンチに乗せて骨盤を持ち上げる。腰を反りすぎない。' }
    ]
  },
  'グルートキックバック': {
    generalTips: '脚を後ろに蹴り出し、お尻の上部をピンポイントで鍛える種目。',
    variations: [
      { name: 'ケーブル', target: '大臀筋', tips: '足首にアンクルストラップを付け、骨盤を動かさずにお尻の筋肉だけで後ろに蹴る。' },
      { name: 'マシン / バンド', target: '大臀筋', tips: 'マシンの軌道に沿って蹴る。戻す時も負荷を抜かない。' }
    ]
  },

  // =========================
  // 肩 (SHOULDERS)
  // =========================
  'ショルダープレス': {
    generalTips: '肩全体（特に前部〜中部）を鍛え、肩幅を広げるプレス種目。',
    variations: [
      { name: 'ダンベル', target: '三角筋前部・中部', tips: '耳の横まで下ろし、頭の上で弧を描くように上げる。腰を反りすぎない。' },
      { name: 'マシン / スミス', target: '三角筋前部', tips: '軌道が固定され、安全に高重量を扱える。' },
      { name: 'バーベル', target: '三角筋前部', tips: '体の前へ下ろすフロントプレスが基本。' }
    ]
  },
  'サイドレイズ': {
    generalTips: '肩の横の張り出しを作り、逆三角形や小顔効果を狙う種目。',
    variations: [
      { name: 'ダンベル', target: '三角筋中部', tips: '小指側から上げるイメージで、遠くに放り投げるように。肩がすくまないよう注意。' },
      { name: 'ケーブル', target: '三角筋中部', tips: '下ろした時もケーブルの張力で負荷が抜けないため、常に筋肉の緊張を保てる。' }
    ]
  },
  'フロントレイズ': {
    generalTips: '肩の前面を単独で鍛える種目。',
    variations: [
      { name: 'ダンベル / ケーブル', target: '三角筋前部', tips: '反動を使わず、目の高さまで持ち上げる。' }
    ]
  },
  'ケーブルフェイスプル': {
    generalTips: '肩の後ろと背中上部を鍛える種目。',
    variations: [
      { name: 'ロープ', target: '三角筋後部、僧帽筋', tips: 'ロープを顔（目線の高さ）に向かって引く。引く時に手首を外側に開く（外旋）。' }
    ]
  },

  // =========================
  // 腕 (ARMS)
  // =========================
  'アームカール': {
    generalTips: '力こぶ（上腕二頭筋）を作る種目。肘の位置を固定することが重要。',
    variations: [
      { name: 'ダンベル', target: '上腕二頭筋', tips: '手首を外側に捻りながら（回外）上げるとより強く収縮する。' },
      { name: 'ケーブル', target: '上腕二頭筋', tips: '下ろす際にも負荷が抜けない。' },
      { name: 'バーベル / EZバー', target: '上腕二頭筋', tips: '高重量を扱いやすい。反動で腰を反らさないよう注意。' }
    ]
  },
  'ケーブルプレスダウン': {
    generalTips: '二の腕（上腕三頭筋）を引き締める種目。',
    variations: [
      { name: 'ロープ', target: '上腕三頭筋（外側頭）', tips: '下ろした時にロープを「ハの字」に開くと強く収縮する。' },
      { name: 'ストレートバー', target: '上腕三頭筋（長頭）', tips: '高重量を扱いやすい。肘を体側で固定して押し下げる。' }
    ]
  },
  'ケーブルトライセプスエクステンション': {
    generalTips: '二の腕の裏側（長頭）をストレッチさせながら鍛える種目。',
    variations: [
      { name: 'ケーブル', target: '上腕三頭筋（長頭）', tips: 'ケーブルに背を向け、頭の後ろから前に向かって肘を伸ばす。' }
    ]
  },
  'ケーブルトライセプスキックバック': {
    generalTips: '二の腕を最大収縮させる種目。',
    variations: [
      { name: 'ケーブル / ダンベル', target: '上腕三頭筋', tips: '上体を前傾させ、肘を固定したまま後方に伸ばし切る。' }
    ]
  },

  // =========================
  // 腹筋・体幹 (ABS & CORE)
  // =========================
  'アブドミナル': {
    generalTips: '腹直筋を鍛え、お腹を引き締めるマシン。',
    variations: [
      { name: 'マシン', target: '腹直筋', tips: '息を吐きながら背中を丸め、おへそを覗き込むように収縮させる。' }
    ]
  },
  'トーソローテーション': {
    generalTips: 'お腹の横（腹斜筋）を鍛え、くびれを作るマシン。',
    variations: [
      { name: 'マシン', target: '腹斜筋', tips: '反動を使わず、お腹の力で胴体を捻る。' }
    ]
  },
  'プランク': {
    generalTips: '体幹全体を固定するアイソメトリック（等尺性）種目。',
    variations: [
      { name: '自重', target: '腹横筋、体幹', tips: 'お尻が上がったり腰が反ったりしないよう、頭からかかとまで一直線をキープ。' }
    ]
  },
  '上体起こし': {
    generalTips: 'いわゆる腹筋運動。',
    variations: [
      { name: '自重 / マシン', target: '腹直筋', tips: '完全に起き上がる手前で止めると負荷が逃げない。腰を痛めないようマット等を敷く。' }
    ]
  },
  'ハンギングレッグレイズ': {
    generalTips: '下腹部を強力に鍛える種目。',
    variations: [
      { name: '自重', target: '腹直筋下部', tips: 'ぶら下がった状態から、骨盤を丸め込むように脚を上げる。反動でブラブラしない。' }
    ]
  },

  // =========================
  // 全身・有酸素 (FULL BODY & CARDIO)
  // =========================
  'クリーン': {
    generalTips: '下半身の爆発力でウェイトを引き上げ、キャッチする全身運動。',
    variations: [
      { name: 'バーベル / ダンベル', target: '全身（瞬発力）', tips: 'フォームが難しいため、軽い重量で股関節の伸び（トリプルエクステンション）を習得する。' }
    ]
  },
  'スナッチ': {
    generalTips: '床から一気に頭上までウェイトを引き上げる全身運動。',
    variations: [
      { name: 'バーベル / ダンベル', target: '全身（瞬発力）', tips: '高度な連動性が求められる。肩周りの柔軟性も必要。' }
    ]
  },
  'バーピー': {
    generalTips: '全身の筋肉を使い、心拍数を一気に上げるHIITに最適な種目。',
    variations: [
      { name: '自重', target: '全身、心肺機能', tips: 'しゃがむ→脚を後ろに蹴り出す→腕立て伏せ→脚を戻す→ジャンプ、を素早く連続で行う。' }
    ]
  },
  'トレッドミル': {
    generalTips: '定番の有酸素マシン。',
    variations: [
      { name: 'ランニング / ウォーキング', target: '心肺機能、脂肪燃焼', tips: '軽く息が弾む程度のペース（心拍数120〜130程度）が脂肪燃焼に効果的。' }
    ]
  },
  '傾斜ウォーキング': {
    generalTips: 'ランニングより膝への負担が少なく、消費カロリーを稼げる有酸素運動。',
    variations: [
      { name: 'トレッドミル（傾斜）', target: '大臀筋、ふくらはぎ、脂肪燃焼', tips: '傾斜を5〜15%程度つけ、手すりを持たずに腕を振って歩く。お尻の筋肉も動員される。' }
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
  inbodyLogs: [],
  inbodyMetric: 'weight',
  exerciseDetails: {} // ★ これを追加
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
    
    // 種目ライブラリの同期（ユーザーが追加したカスタム種目を維持しつつ最新デフォルトを補完）
    state.exerciseLibrary = buildDefaultExerciseLibrary();
    if (parsed.exerciseLibrary) {
      Object.keys(parsed.exerciseLibrary).forEach(label => {
        if (!state.exerciseLibrary[label]) {
          state.exerciseLibrary[label] = [];
        }
        parsed.exerciseLibrary[label].forEach(name => {
          if (!state.exerciseLibrary[label].includes(name)) {
            state.exerciseLibrary[label].push(name);
          }
        });
      });
    }

    // 既存の保存済み器具データに、コード側の最新 DEFAULT_EQUIPMENT_PATTERNS を賢くマージする
    const mergedEquipment = JSON.parse(JSON.stringify(DEFAULT_EQUIPMENT_PATTERNS));
    if (parsed.exerciseEquipment) {
      Object.keys(parsed.exerciseEquipment).forEach(exName => {
        if (mergedEquipment[exName]) {
          // デフォルトにも存在する種目の場合：ユーザーが追加したカスタム器具があればマージする
          const userEquips = parsed.exerciseEquipment[exName];
          userEquips.forEach(eq => {
            if (!mergedEquipment[exName].includes(eq)) {
              mergedEquipment[exName].push(eq);
            }
          });
        } else {
          // ユーザーが独自に作成した種目の場合：そのまま保持
          mergedEquipment[exName] = parsed.exerciseEquipment[exName];
        }
      });
    }
    state.exerciseEquipment = mergedEquipment;

    // ★ 辞書データ（BODYタブ用）の賢いマージ処理
    if (parsed.exerciseDetails) {
      state.exerciseDetails = parsed.exerciseDetails;
      
      // コード側（INITIAL_EXERCISE_DETAILS）に新しく追加された種目があれば、それだけを補完する
      Object.keys(INITIAL_EXERCISE_DETAILS).forEach(exName => {
        // 保存データ内にその種目が存在しない場合のみ、コード側のデータをコピーして追加
        if (!state.exerciseDetails[exName]) {
          state.exerciseDetails[exName] = JSON.parse(JSON.stringify(INITIAL_EXERCISE_DETAILS[exName]));
        }
      });
    } else {
      state.exerciseDetails = JSON.parse(JSON.stringify(INITIAL_EXERCISE_DETAILS));
    }

  } else {
    state.exerciseLibrary = buildDefaultExerciseLibrary();
    state.exerciseEquipment = JSON.parse(JSON.stringify(DEFAULT_EQUIPMENT_PATTERNS));
    
    state.exerciseDetails = JSON.parse(JSON.stringify(INITIAL_EXERCISE_DETAILS));
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
    inbodyLogs: state.inbodyLogs,
    exerciseDetails: state.exerciseDetails // ★ これを追加
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
    titleText = '全身の日';
  } else {
    const menu = state.menus.find(m => m.id === todayLog.menuId);
    titleText = menu ? menu.title : todayLog.menuId;
    // 「（」以降（例: 上半身 A（フリーウェイト＆ケーブル） の括弧部分）は表示しない
    titleText = titleText.split(/[（(]/)[0].trim();
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
    if (menu.id === 'F' || menu.title.includes('全身')) return 1; // 全身（F）を最優先
    if (menu.title.includes('上半身')) return 2;                // 上半身（A, B）
    if (menu.title.includes('下半身')) return 3;                // 下半身（C, D）
    if (menu.title.includes('有酸素') || menu.title.includes('リカバリー')) return 4; // 有酸素（E）
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

  let chipsHTML = patterns.map(eq => {
    const isActive = selectedEquip === eq ? 'active' : '';
    return `<button type="button" class="equipment-chip-btn ${isActive}" onclick="selectEquipmentChip(this, '${eq}')">${eq}</button>`;
  }).join('');

  equipContainer.innerHTML = `
    <span style="font-size:0.72rem; color:var(--text-sub); font-weight:700; flex-shrink:0;">器具:</span>
    <div class="equipment-chips-list">
      ${chipsHTML}
    </div>
  `;

  equipContainer.dataset.selectedEquip = selectedEquip || '';
}

function selectEquipmentChip(btnEl, equipName) {
  const block = btnEl.closest('.extra-log-block');
  const row = btnEl.closest('.equipment-select-row');
  const allBtns = row.querySelectorAll('.equipment-chip-btn');
  const nameSelect = block.querySelector('.extra-name-select');
  const nameInput = block.querySelector('.extra-name-input');
  const exName = (nameSelect && nameSelect.value) ? nameSelect.value : (nameInput ? nameInput.value : '');

  let chosenEquip = '';

  if (btnEl.classList.contains('active')) {
    btnEl.classList.remove('active');
    chosenEquip = '';
  } else {
    allBtns.forEach(b => b.classList.remove('active'));
    btnEl.classList.add('active');
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
    btn.textContent = e.equipment ? `+ ${e.name}（${e.equipment}）` : `+ ${e.name}`;
    btn.onclick = () => {
      addSuggestedExerciseInput(e.name, e.detail, menuId, null, e.equipment || '');
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
    titleEl.textContent = '全身の日';
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
      e && e.equipment ? e.equipment : ''
    );
  });

  makeSortable(container);

  document.getElementById('edit-modal').classList.add('active');
}

function addExerciseInputCard(name = '', detail = '', equipment = '') {
  const container = document.getElementById('exercise-inputs-container');
  if (!container) return;

  const row = document.createElement('div');
  row.className = 'exercise-row';

  const card = document.createElement('div');
  card.className = 'lib-exercise-item-card';
  card.style.marginBottom = '0';
  card.dataset.exercisename = name;
  card.dataset.equipment = equipment || '';

  // =========================
  // ヘッダー
  // =========================
  const header = document.createElement('div');
  header.className = 'lib-exercise-header';
  header.style.marginBottom = '4px';

  const left = document.createElement('div');
  left.style.cssText =
    'display:flex; align-items:center; gap:6px; flex:1;';

  // ▲▼
  const moveGroup = document.createElement('div');
  moveGroup.className = 'move-btn-group';

  const upBtn = document.createElement('button');
  upBtn.type = 'button';
  upBtn.className = 'btn-move-row';
  upBtn.textContent = '▲';
  upBtn.addEventListener('click', () => {
    moveBlock(upBtn, -1);
  });

  const downBtn = document.createElement('button');
  downBtn.type = 'button';
  downBtn.className = 'btn-move-row';
  downBtn.textContent = '▼';
  downBtn.addEventListener('click', () => {
    moveBlock(downBtn, 1);
  });

  moveGroup.append(upBtn, downBtn);

  // 種目名
  const nameEl = document.createElement('span');
  nameEl.className = 'lib-exercise-name';

  const strong = document.createElement('strong');
  strong.textContent = name;

  nameEl.appendChild(strong);

  left.append(moveGroup, nameEl);

  // 削除
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

  // =========================
  // セット・回数
  // =========================
  const detailInput = document.createElement('input');
  detailInput.type = 'text';
  detailInput.className = 'form-input input-detail';
  detailInput.placeholder =
    'セット・回数目安 (例: 15~20回 × 3セット)';
  detailInput.value = detail;
  detailInput.style.cssText =
    'margin-bottom:6px; font-size:0.75rem !important; padding:6px 10px;';

  // =========================
  // マシン・器具選択
  // =========================
  const equipSelectRow = document.createElement('div');
  equipSelectRow.className = 'menu-equip-select-row';

  // 選択中の器具を保持
  equipSelectRow.dataset.selectedEquip = equipment || '';

  // カードにも保存しておく
  // saveMenuEdit() がここを読むため必要
  card.dataset.equipment = equipment || '';

  // =========================
  // カードを組み立てる
  // =========================
  card.append(
    header,
    detailInput,
    equipSelectRow
  );

  row.appendChild(card);
  container.appendChild(row);

  // =========================
  // 器具候補を表示
  // =========================
  renderMenuEquipmentChips(
    row,
    name,
    equipment
  );
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

  addExerciseInputCard(name, '15~20回 × 3セット', '');
  input.value = '';

  const container = document.getElementById('exercise-inputs-container');

  if (container) {
    makeSortable(container);
  }
}

function addMenuCardEquip(btnEl, exName) {
  const input = btnEl.previousElementSibling;
  const equipName = input.value.trim();
  if (!equipName) return;

  if (!state.exerciseEquipment[exName]) {
    state.exerciseEquipment[exName] = [...(DEFAULT_EQUIPMENT_PATTERNS[exName] || ['マシン', 'ダンベル'])];
  }

  if (state.exerciseEquipment[exName].includes(equipName)) {
    alert('既に登録されている器具です');
    return;
  }

  state.exerciseEquipment[exName].push(equipName);
  saveState();

  // カードのUIを再描画して反映
  const card = btnEl.closest('.lib-exercise-item-card');
  const detailInput = card.querySelector('.input-detail').value;
  const row = card.closest('.exercise-row');
  
  // 一旦今のカードを置き換えるために再生成
  card.outerHTML = '';
  addExerciseInputCard(exName, detailInput, equipName);
}

function removeMenuCardEquip(btnEl, exName, equipName) {
  if (!state.exerciseEquipment[exName]) {
    state.exerciseEquipment[exName] = [...(DEFAULT_EQUIPMENT_PATTERNS[exName] || ['マシン', 'ダンベル'])];
  }
  state.exerciseEquipment[exName] = state.exerciseEquipment[exName].filter(e => e !== equipName);
  saveState();

  const card = btnEl.closest('.lib-exercise-item-card');
  const detailInput = card.querySelector('.input-detail').value;
  
  card.outerHTML = '';
  addExerciseInputCard(exName, detailInput, '');
}



function closeEditModal() {
  const modal = document.getElementById('edit-modal');

  if (modal) {
    modal.classList.remove('active');
  }

  const newExerciseInput =
    document.getElementById('edit-new-exercise-input');

  if (newExerciseInput) {
    newExerciseInput.value = '';
  }

  state.editingMenuId = null;
}

function addExerciseInput(name = '', detail = '', equipment = '') {
  const container = document.getElementById('exercise-inputs-container');
  const row = document.createElement('div');
  row.className = 'exercise-row';
  
  // 種目リスト管理モーダルと同じ構造を再現
  row.innerHTML = `
    <div class="lib-exercise-item-card" style="margin-bottom:10px;">
      <div style="display:flex; align-items:center; gap:6px; margin-bottom:6px;">
        <div class="move-btn-group">
          <button type="button" class="btn-move-row" onclick="moveBlock(this, -1)">▲</button>
          <button type="button" class="btn-move-row" onclick="moveBlock(this, 1)">▼</button>
        </div>
        <input type="text" class="form-input input-name" placeholder="種目名" value="${name}" style="margin-bottom:0;" oninput="onMenuExerciseNameInput(this)">
        <button type="button" class="btn-remove-row" onclick="this.closest('.exercise-row').remove()">&times;</button>
      </div>
      <input type="text" class="form-input input-detail" placeholder="セット・回数目安" value="${detail}" style="margin-bottom:8px;">
      <div class="menu-equip-select-row"></div>
    </div>
  `;
  
  container.appendChild(row);
  // 初期状態で器具チップを生成
  renderMenuEquipmentChips(row, name, equipment);
  makeSortable(container);
}

// メニュー編集画面で、種目名に応じた「器具」候補をチップとして表示する
// ここで選んだ器具は、記録画面で該当メニューの種目候補ボタンを押した際に自動入力される
function renderMenuEquipmentChips(rowEl, exerciseName, selectedEquip = '') {
  const equipContainer = rowEl.querySelector('.menu-equip-select-row');
  if (!equipContainer) return;

  const trimmedName = (exerciseName || '').trim();
  if (!trimmedName) {
    equipContainer.innerHTML = '';
    equipContainer.dataset.selectedEquip = '';
    return;
  }

  let patterns = state.exerciseEquipment[trimmedName] || DEFAULT_EQUIPMENT_PATTERNS[trimmedName];
  if (!patterns) {
    const matchedKey = Object.keys(DEFAULT_EQUIPMENT_PATTERNS).find(key => trimmedName.includes(key) || key.includes(trimmedName));
    patterns = matchedKey ? DEFAULT_EQUIPMENT_PATTERNS[matchedKey] : ['マシン', 'ダンベル', 'バーベル', 'ケーブル', '自重'];
  }

  const chipsHTML = patterns.map(eq => {
    const isActive = selectedEquip === eq ? 'active' : '';
    return `<button type="button" class="equipment-chip-btn ${isActive}" onclick="selectMenuEquipChip(this, '${eq}')">${eq}</button>`;
  }).join('');

  equipContainer.innerHTML = `
    <span style="font-size:0.72rem; color:var(--text-sub); font-weight:700; flex-shrink:0;">使うマシン・器具（任意）:</span>
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
    // もう一度押したら選択解除
    btnEl.classList.remove('active');
    chosenEquip = '';
  } else {
    // 他の器具の選択を解除
    allBtns.forEach(btn => {
      btn.classList.remove('active');
    });

    // 今押した器具を選択
    btnEl.classList.add('active');
    chosenEquip = equipName;
  }

  // 器具選択欄に保存
  row.dataset.selectedEquip = chosenEquip;

  // ★ カード側にも保存
  // saveMenuEdit() がここを読み取る
  const card = row.closest('.lib-exercise-item-card');

  if (card) {
    card.dataset.equipment = chosenEquip;
  }
}

function onMenuExerciseNameInput(inputEl) {
  const row = inputEl.closest('.exercise-row');
  // ここで最新の種目名を使ってチップを再描画する
  renderMenuEquipmentChips(row, inputEl.value);
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

  const targetMenu = state.menus.find(
    m => m.id === state.editingMenuId
  );

  if (!targetMenu) {
    alert('編集対象のメニューが見つかりません。');
    return;
  }

  const cards = document.querySelectorAll(
    '#exercise-inputs-container .exercise-row .lib-exercise-item-card'
  );

  const newExercises = [];

  cards.forEach(card => {
    const name = (card.dataset.exercisename || '').trim();

    const detailEl = card.querySelector('.input-detail');
    const detail = detailEl ? detailEl.value.trim() : '';

    const equipment = (card.dataset.equipment || '').trim();

    if (name) {
      const exercise = {
        name: name,
        detail: detail
      };

      if (equipment) {
        exercise.equipment = equipment;
      }

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
            <input type="text" class="form-input lib-new-equip-input" placeholder="" data-exname="${name}">
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
  } else if (tabName === 'body-map') {
    buttons[1].classList.add('active');
    document.getElementById('tab-content-body-map').classList.add('active');
    renderBodyMap(); // 部位別リストを表示する関数
  } else if (tabName === 'history') {
    buttons[2].classList.add('active');
    document.getElementById('tab-content-history').classList.add('active');
    renderHistoryLogs();
  } else if (tabName === 'inbody') {
    buttons[3].classList.add('active');
    document.getElementById('tab-content-inbody').classList.add('active');
  } else if (tabName === 'menu-list') {
    document.getElementById('tab-content-menu-list').classList.add('active');
  }
}

// ▼ 既存の renderBodyMap を上書き
function renderBodyMap() {
  const container = document.getElementById('body-map-list');
  if (!container) return;

  container.innerHTML = state.exerciseLabels.map(label => {
    const exes = state.exerciseLibrary[label] || [];
    // 種目がない部位は表示しない
    if (exes.length === 0) return '';

    // 種目ごとのカードリストを作成
    const exListHTML = exes.map(exName => {
      const baseName = exName.split(/（|\(/)[0].trim();
      let detail = state.exerciseDetails[baseName] || state.exerciseDetails[exName];

      if (!detail) {
        detail = {
          generalTips: '',
          variations: [
            { name: '基本のやり方', target: '未設定', tips: '自分なりのフォームのコツや注意点などを意識して行いましょう。' }
          ]
        };
      }

      const generalHTML = detail.generalTips 
        ? `<div style="font-size:0.75rem; color:var(--text-sub); margin-bottom:12px; line-height:1.5;">${detail.generalTips}</div>` 
        : '';

      const variationsHTML = (detail.variations || []).map(v => {
        // ★ バリエーション名が空欄でなければ名前の要素を作る
        const nameHtml = v.name 
          ? `<div style="font-size:0.8rem; font-weight:900; color:var(--text-main); margin-bottom:4px;">${v.name}</div>` 
          : '';

        return `
          <div style="margin-top:6px; margin-bottom:10px; padding-left:14px; border-left:3px solid var(--border-color);">
            ${nameHtml}
            <div style="font-size:0.72rem; margin-bottom:3px; display:flex; align-items:flex-start; gap:6px;">
              <span style="flex-shrink:0;">🎯</span>
              <div><span style="color:var(--text-main); font-weight:700;">${v.target}</span></div>
            </div>
            <div style="font-size:0.72rem; line-height:1.4; display:flex; align-items:flex-start; gap:6px;">
              <span style="flex-shrink:0;">⚠️</span>
              <div><span style="color:var(--text-sub);">${v.tips}</span></div>
            </div>
          </div>
        `;
      }).join('');

      return `
        <div style="background:var(--bg-color); padding:16px; border-radius:14px; margin-bottom:12px; border:1px solid var(--border-color);">
          <h4 style="font-size:0.95rem; color:var(--text-main); font-weight:900; margin-bottom:8px; border-bottom:1.5px dashed var(--border-color); padding-bottom:6px; display:flex; justify-content:space-between; align-items:center;">
            <span>${exName}</span>
            <button type="button" class="btn-table-edit" style="font-size:0.7rem; padding:4px 10px; margin-left:8px;" onclick="openDictEditModal('${baseName}'); event.stopPropagation();">⚙️</button>
          </h4>
          ${generalHTML}
          <div style="display:flex; flex-direction:column;">
            ${variationsHTML}
          </div>
        </div>
      `;
    }).join('');

    // アコーディオン構造
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

// ▼ そのすぐ下に追加：アコーディオンを開閉するための関数
function toggleBodyMapAccordion(headerEl) {
  const item = headerEl.closest('.date-accordion-item');
  if (!item) return;
  const body = item.querySelector('.date-accordion-body');
  if (!body) return;
  
  const isActive = item.classList.contains('active');
  
  if (isActive) {
    // 閉じる処理
    body.style.maxHeight = '0px';
    item.classList.remove('active');
  } else {
    // 開く処理（中身の高さに合わせて滑らかに展開）
    item.classList.add('active');
    body.style.maxHeight = (body.scrollHeight + 150) + 'px';
  }
}


// ▼ そのまま下に以下を追加（モーダル制御・保存処理）
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
    // データが空ならデフォルトの入力枠を1つ出す
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
  block.className = 'lib-exercise-item-card'; // 既存のカードスタイルを流用
  block.style.padding = '12px';
  block.style.position = 'relative';

  block.innerHTML = `
    <button type="button" class="chip-remove-btn" style="position:absolute; top:8px; right:8px;" onclick="this.closest('.lib-exercise-item-card').remove()">&times;</button>
    
    <label style="font-size:0.7rem; font-weight:700; color:var(--primary-color);">▍ バリエーション名</label>
    <input type="text" class="form-input var-name" value="${name}" style="font-size:0.8rem !important; padding:8px 10px; margin-bottom:8px;">
    
    <label style="font-size:0.7rem; font-weight:700; color:var(--primary-color);">🎯 効く部位</label>
    <input type="text" class="form-input var-target" value="${target}" style="font-size:0.8rem !important; padding:8px 10px; margin-bottom:8px;">
    
    <label style="font-size:0.7rem; font-weight:700; color:var(--primary-color);">⚠️ コツ</label>
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
    
    // どれか1つでも入力されていれば保存する
    if (name || target || tips) {
      variations.push({
        name: name, // ← 「名称未設定」にする処理を削除してそのまま保存
        target: target || '未設定',
        tips: tips || ''
      });
    }
  });

  // stateを更新
  if (!state.exerciseDetails) state.exerciseDetails = {};
  state.exerciseDetails[baseName] = {
    generalTips: generalTips,
    variations: variations
  };

  saveState();
  closeDictEditModal();
  renderBodyMap(); // 最新のデータでBODYタブを描画し直す
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

  // --- 綺麗な目盛り（step）を計算するアルゴリズム ---
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
  // ------------------------------------------------

  const leftPad = 40;  // 左側の余白を少し増やす
  const rightPad = 20; // 右側の余白をしっかり確保する
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

  // --- 目盛りの描画 ---
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

  // --- 折れ線グラフの描画 ---
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

  // --- ポイント（点）の描画 ---
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

  // --- X軸（日付）の描画 ---
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
  const matchedMenus = state.menus.filter(m => {
    if (category === '上半身') return m.title.includes('上半身');
    if (category === '下半身') return m.title.includes('下半身');
    if (category === '全身') return m.title.includes('全身') || m.id === 'F'; // ← ここを追加！
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

function openMenuSettingsModal() {
  renderMenuSettingsAccordion();
  document.getElementById('menu-settings-modal').classList.add('active');
}

function closeMenuSettingsModal() {
  document.getElementById('menu-settings-modal').classList.remove('active');
  renderMenuTable(); // 閉じるときにメイン画面のテーブルやデータを更新
  renderRecommendation();
}

function renderMenuSettingsAccordion(openMenuId = null) {
  const container = document.getElementById(
    'menu-settings-accordion-container'
  );

  if (!container) return;

  // 現在開いているメニューを記憶
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

      // この種目で選べるマシン・器具
      let patterns =
        state.exerciseEquipment[e.name] ||
        DEFAULT_EQUIPMENT_PATTERNS[e.name];

      // 完全一致しない場合は近い種目を探す
      if (!patterns) {
        const matchedKey = Object.keys(
          DEFAULT_EQUIPMENT_PATTERNS
        ).find(
          key =>
            e.name.includes(key) ||
            key.includes(e.name)
        );

        patterns = matchedKey
          ? DEFAULT_EQUIPMENT_PATTERNS[matchedKey]
          : ['マシン', 'ダンベル', 'バーベル', 'ケーブル', '自重'];
      }

      // 現在設定されている器具
      const selectedEquipment = e.equipment || '';

      // マシン・器具ボタン
      const equipmentHTML = patterns.map(eq => {
        const active =
          selectedEquipment === eq
            ? 'active'
            : '';

        return `
          <button
            type="button"
            class="equipment-chip-btn ${active}"
            onclick="selectMenuAccordionEquipChip(this, '${menu.id}', ${idx}); event.stopPropagation();"
          >
            ${eq}
          </button>
        `;
      }).join('');

      return `
        <div
          class="lib-exercise-item-card"
          data-exercisename="${e.name}"
          style="margin-bottom:6px;"
        >

          <div
            class="lib-exercise-header"
            style="margin-bottom:4px;"
          >
            <span class="lib-exercise-name">
              <strong>${e.name}</strong>
            </span>

            <button
              type="button"
              class="chip-remove-btn"
              onclick="removeMenuAccordionExercise('${menu.id}', ${idx}); event.stopPropagation();"
            >
              &times;
            </button>
          </div>

          <input
            type="text"
            class="form-input input-detail"
            placeholder="セット・回数目安"
            value="${e.detail || ''}"
            style="
              margin-bottom:6px;
              font-size:0.75rem !important;
              padding:6px 10px;
            "
            oninput="updateMenuAccordionDetail('${menu.id}', ${idx}, this.value)"
          >

          <!-- マシン・器具 -->
          <div
            class="menu-equipment-setting"
            style="
              display:flex;
              flex-wrap:wrap;
              align-items:center;
              gap:5px;
              margin-top:4px;
              padding-top:2px;
            "
          >
            <span
              style="
                font-size:0.7rem;
                color:var(--text-sub);
                font-weight:700;
                width:100%;
                margin-bottom:1px;
              "
            >
              使うマシン・器具
            </span>

            <div
              class="equipment-chips-list"
              style="
                display:flex;
                flex-wrap:wrap;
                gap:4px;
              "
            >
              ${equipmentHTML}
            </div>
          </div>

        </div>
      `;
    }).join('');

    const isOpen =
      String(menu.id) === String(openMenuId)
        ? 'active'
        : '';

    return `
      <div
        class="date-accordion-item ${isOpen}"
        data-menuid="${menu.id}"
        style="margin-bottom:8px;"
      >

        <div
          class="date-accordion-header"
          onclick="toggleMenuAccordion(this)"
        >
          <span style="font-weight:900;">
            <span
              class="menu-badge menu-badge-${menu.id}"
              style="margin-right:6px;"
            >
              ${menu.id}
            </span>

            ${menu.title}
          </span>

          <span class="arrow-icon">▾</span>
        </div>

        <div
          class="date-accordion-body"
          style="background:var(--bg-color);"
        >

          <label class="form-label">
            メニュータイトル
          </label>

          <input
            type="text"
            class="form-input menu-title-input"
            value="${menu.title}"
            oninput="updateMenuAccordionTitle('${menu.id}', this.value)"
            style="margin-bottom:8px;"
          >

          <label class="form-label">
            メモ
          </label>

          <textarea
            class="form-input form-textarea menu-memo-input"
            oninput="updateMenuAccordionMemo('${menu.id}', this.value)"
            style="margin-bottom:8px; height:50px;"
          >${menu.memo || ''}</textarea>

          <label class="form-label">
            種目一覧
          </label>

          <div
            class="menu-exercises-container"
            style="margin-bottom:8px;"
          >
            ${exercisesHTML}
          </div>

          <div
            style="
              display:flex;
              gap:6px;
            "
          >
            <input
              type="text"
              class="form-input menu-new-ex-input"
              placeholder="新しい種目名"
              style="
                margin-bottom:0;
                font-size:0.75rem;
              "
            >

            <button
              type="button"
              class="btn-library-add"
              onclick="addMenuAccordionExercise('${menu.id}', this); event.stopPropagation();"
            >
              + 追加
            </button>
          </div>

        </div>
      </div>
    `;
  }).join('');
}

function selectMenuAccordionEquipChip(btnEl, menuId, exerciseIndex) {
  const menu = state.menus.find(
    m => String(m.id) === String(menuId)
  );

  if (!menu || !menu.exercises[exerciseIndex]) {
    return;
  }

  const card = btnEl.closest(
    '.lib-exercise-item-card'
  );

  if (!card) return;

  const allBtns = card.querySelectorAll(
    '.equipment-chip-btn'
  );

  let selectedEquipment = '';

  // すでに選択されているものをもう一度押したら解除
  if (btnEl.classList.contains('active')) {
    btnEl.classList.remove('active');
    selectedEquipment = '';

  } else {
    allBtns.forEach(btn => {
      btn.classList.remove('active');
    });

    btnEl.classList.add('active');

    selectedEquipment =
      btnEl.textContent.trim();
  }

  // メニューの種目データに保存
  if (selectedEquipment) {
    menu.exercises[exerciseIndex].equipment =
      selectedEquipment;
  } else {
    delete menu.exercises[exerciseIndex].equipment;
  }

  saveState();
}

// アコーディオンの開閉用
function toggleMenuAccordion(headerEl) {
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

    // DOMの現在の高さをそのまま使う
    body.style.maxHeight =
      (body.scrollHeight + 200) + 'px';
  }
}
// 各種データのリアルタイム保存用ヘルパー関数



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
    renderMenuSettingsAccordion(menuId); // 削除後もこのメニューを開いたままにする
  }
}

function addMenuAccordionExercise(menuId, btnEl) {
  const input = btnEl.previousElementSibling;
  if (!input) return;

  const name = input.value.trim();
  if (!name) return;

  const menu = state.menus.find(item => item.id === menuId);
  if (!menu) return;

  // 同じ種目がすでにある場合
  const alreadyExists = menu.exercises.some(
    e => e.name.trim() === name
  );

  if (alreadyExists) {
    alert('この種目はすでに登録されています。');
    return;
  }

  // データに追加
  const newExercise = {
    name: name,
    detail: '15~20回 × 3セット'
  };

  menu.exercises.push(newExercise);
  saveState();

  // 入力欄を空にする
  input.value = '';

  // ★ アコーディオン全体を再描画しない
  // ★ 今開いているDOMに新しい種目カードだけ追加する
  const item = btnEl.closest('.date-accordion-item');
  if (!item) return;

  const exercisesContainer = item.querySelector(
    '.menu-exercises-container'
  );

  if (!exercisesContainer) return;

  const exerciseIndex = menu.exercises.length - 1;

  const card = document.createElement('div');
  card.className = 'lib-exercise-item-card';
  card.dataset.exercisename = name;
  card.style.marginBottom = '6px';

  const header = document.createElement('div');
  header.className = 'lib-exercise-header';
  header.style.marginBottom = '4px';

  const nameSpan = document.createElement('span');
  nameSpan.className = 'lib-exercise-name';

  const strong = document.createElement('strong');
  strong.textContent = name;

  nameSpan.appendChild(strong);

  const removeBtn = document.createElement('button');
  removeBtn.type = 'button';
  removeBtn.className = 'chip-remove-btn';
  removeBtn.innerHTML = '&times;';

  removeBtn.addEventListener('click', function(e) {
    e.preventDefault();
    e.stopPropagation();

    removeMenuAccordionExercise(menuId, exerciseIndex);
  });

  header.append(nameSpan, removeBtn);

  const detailInput = document.createElement('input');
  detailInput.type = 'text';
  detailInput.className = 'form-input input-detail';
  detailInput.placeholder = 'セット・回数目安';
  detailInput.value = newExercise.detail;
  detailInput.style.cssText =
    'margin-bottom:0; font-size:0.75rem !important; padding:6px 10px;';

  detailInput.addEventListener('input', function() {
    if (menu.exercises[exerciseIndex]) {
      menu.exercises[exerciseIndex].detail = this.value;
      saveState();
    }
  });

  card.append(header, detailInput);

  exercisesContainer.appendChild(card);

  // ★ アコーディオンの状態・スクロール位置には一切触らない
}

// ▼▼▼ モーダルの背景スクロールを防止する追加コード ▼▼▼
const modalObserver = new MutationObserver(() => {
  const isModalOpen = document.querySelectorAll('.modal-overlay.active').length > 0;
  if (isModalOpen) {
    document.body.style.overflow = 'hidden';
  } else {
    document.body.style.overflow = '';
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
