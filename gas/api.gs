/**
 * 書類自動保存ボード用 JSON API（doGet）
 * ------------------------------------------------------------
 * Gmail の「drive保存済み_*」ラベルと送信元から、取引先ごとの
 * 「最終保存日／今月の保存件数」を集計して index.html と同じ形の JSON を返す。
 *
 * デプロイ：
 *   - スタンドアロンGASとして配置（画面は出さない＝データAPIのみ）
 *   - 「デプロイ > ウェブアプリ」 実行：自分 / アクセス：用途に応じて選択
 *     ※ アクセスを「全員（匿名）」にすると公開URLになる＝取引先名が外部から見える点に注意。
 *       社内限定にしたい場合は TOKEN を設定し、フロントの fetch に ?token= を付ける運用にする。
 *
 * フロント連携：index.html の CONFIG.apiUrl に /exec URL を設定するとライブ表示に切替。
 */

// 任意：簡易トークン（空なら無認証）。設定したら index.html 側の fetch URL に ?token=... を付与。
const API_TOKEN = '';

// 取引先設定。label = 保存時に付くGmailラベル名、q = 送信元等の絞り込み（同一ラベルを複数取引先で共有する場合の切り分け用）。
const BOARD_VENDORS = [
  { group:'市売（毎週・精算書/納品書）', items:[
    { n:'丸宇 大栄浜', ch:['mail','fax'], base:'active', label:'drive保存済み_丸宇', q:'大栄浜' },
    { n:'丸宇 北浜',   ch:['mail','fax'], base:'active', label:'drive保存済み_丸宇', q:'北浜' },
    { n:'丸宇 下館',   ch:['mail','fax'], base:'active', label:'drive保存済み_丸宇', q:'下館' },
    { n:'丸宇 京葉',   ch:['mail','fax'], base:'active', label:'drive保存済み_丸宇', q:'京葉' },
    { n:'勝山木材市場', ch:['mail','fax'], base:'active', label:'drive保存済み_勝山', q:'' },
    { n:'ナイス 沼津/浜松ほか', ch:['mail','fax'], base:'active', label:'drive保存済み_ナイス', q:'' },
    { n:'イチカワ', ch:['mail','fax'], base:'active', label:'drive保存済み_イチカワ', q:'' },
    { n:'中部レジン', ch:['mail'], base:'active', label:'drive保存済み_chubu_resin', q:'' },
    { n:'浜松小松フォークリフト', ch:['mail'], base:'active', label:'drive保存済み_浜松小松', q:'' },
    { n:'日税ビジネスサービス', ch:['mail'], base:'active', label:'drive保存済み_日税', q:'' },
    { n:'千葉県木材市場協組', ch:['mail','fax'], base:'active', label:'drive保存済み_千葉県協組', q:'' },
    { n:'Google Cloud', ch:['mail'], base:'active', label:'drive保存済み_GCP', q:'' },
    { n:'1Password', ch:['mail'], base:'active', label:'drive保存済み_1Password', q:'' },
    { n:'スズイチ', ch:['mail'], base:'active', label:'drive保存済み_スズイチ', q:'' },
    { n:'井上フシック', ch:['mail'], base:'active', label:'drive保存済み_井上フシック', q:'' }
  ]}
];

function ym_(d) { return d.getFullYear() + '-' + ('0'+(d.getMonth()+1)).slice(-2) + '-' + ('0'+d.getDate()).slice(-2); }

function buildBoardData_() {
  const now = new Date();
  const firstOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const groups = [];
  let totalThisMonth = 0;

  BOARD_VENDORS.forEach(function (g) {
    const items = g.items.map(function (v) {
      let lastSaved = '';
      let thisMonth = 0;
      let status = v.base;
      try {
        const q = 'label:' + v.label + (v.q ? (' ' + v.q) : '') + ' newer_than:90d';
        const threads = GmailApp.search(q, 0, 30);
        let latest = null;
        threads.forEach(function (t) {
          const d = t.getLastMessageDate();
          if (!latest || d > latest) latest = d;
          if (d >= firstOfMonth) thisMonth++;
        });
        if (latest) lastSaved = ym_(latest);
        totalThisMonth += thisMonth;
        // 月次で来るはずが60日以上保存が無ければ注意（要確認）
        if (latest) {
          const days = (now - latest) / 86400000;
          if (days > 60) status = 'warn';
        }
      } catch (e) { /* ラベル未作成等は base のまま */ }
      return { n: v.n, ch: v.ch, s: status, lastSaved: lastSaved, thisMonth: thisMonth };
    });
    groups.push({ title: g.title, vendors: items });
  });

  const vendorCount = BOARD_VENDORS.reduce(function (a, g) { return a + g.items.length; }, 0);
  return {
    asOf: ym_(now),
    metrics: [
      { l:'追跡取引先', v: vendorCount + ' 件' },
      { l:'今月の自動保存', v: totalThisMonth + ' 件', c:'var(--green)' },
      { l:'データ', v:'ライブ', c:'var(--blue)' }
    ],
    groups: groups,
    todo: ''
  };
}

function doGet(e) {
  if (API_TOKEN && (!e || !e.parameter || e.parameter.token !== API_TOKEN)) {
    return ContentService.createTextOutput(JSON.stringify({ error: 'unauthorized' }))
      .setMimeType(ContentService.MimeType.JSON);
  }
  const data = buildBoardData_();
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

// エディタ動作確認用
function testBoardData() { Logger.log(JSON.stringify(buildBoardData_(), null, 2)); }
