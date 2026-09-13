export type ProjectProfile = {
  slug: string;
  summary: string;
  overview: string;
  bestFor: string[];
  avoidIf: string[];
  features: string[];
  technicalNotes: string[];
  migrationNotes: string[];
  deployment: string[];
  operations: {
    setup: number;
    updates: number;
    backups: number;
    monitoring: number;
  };
  operationsNote: string;
};

export const projectProfiles: Record<string, ProjectProfile> = {
  appflowy: {
    slug: "appflowy",
    summary: "ドキュメント、ノート、データベースをまとめて扱えるオープンソースのワークスペース。",
    overview: "Notionに近い使い方を意識しつつ、データの持ち方やホスティング方法を自分で選びたいチーム向けの候補です。ページ作成だけでなく、テーブルやボードなど複数の情報表現をひとつのワークスペースに集約できます。一方で、Notionと同じ機能セットを完全再現する製品ではないため、Databaseの高度な挙動や外部連携を多用している場合は検証が必要です。",
    bestFor: ["Notionに近い操作感を求める", "データ管理の自由度を上げたい", "セルフホストを選択肢に入れたい", "個人利用から小〜中規模チームまで段階的に試したい"],
    avoidIf: ["Notion固有の高度なDB機能に強く依存している", "運用を完全にSaaS任せにしたい", "多数のNotion連携やテンプレート資産をそのまま残したい"],
    features: ["ブロックベースのドキュメント編集", "ノート・Wiki・データベースを同一ワークスペースで管理", "ボードやテーブルなど複数ビュー", "セルフホスト構成を選択可能", "デスクトップ・モバイル利用を想定"],
    technicalNotes: ["セルフホストではアプリ本体だけでなく永続データのバックアップ方針が必要", "アップグレード前にリリースノートとマイグレーション有無を確認", "組織利用では認証・共有範囲・バックアップ復元を先に検証"],
    migrationNotes: ["Notionからのエクスポート結果をそのまま完全再現できる前提にはしない", "重要ページ・DB・添付ファイルを分けて移行テストする", "共有リンクや権限は移行後に再設計する"],
    deployment: ["Cloud版またはセルフホスト構成を検討", "小規模環境で先にデータ移行を検証", "バックアップとアップデート手順を事前に決める"],
    operations: { setup: 2, updates: 3, backups: 3, monitoring: 2 },
    operationsNote: "セルフホストでは、アップデートとデータ保全の責任が増えます。導入そのものより、更新と復元の手順を先に決めておく方が安全です。"
  },
  mattermost: {
    slug: "mattermost",
    summary: "チームチャットとコラボレーションを自社管理しやすいオープンソース基盤。",
    overview: "Slack代替として検討しやすく、特に社内運用やセルフホスト要件がある組織に向いています。チャンネルベースのコミュニケーション、通知、Bot、外部システム連携を中心に構成できます。チャットは業務の中心になりやすいため、UIの近さよりも通知品質・モバイル体験・ログ保持・外部連携の再現性を優先して評価するべきです。",
    bestFor: ["社内チャットを自社管理したい", "Slack依存を減らしたい", "アクセス制御を重視したい", "開発・運用チーム中心のコミュニケーション基盤を持ちたい"],
    avoidIf: ["Slack Appエコシステムへの依存が強い", "運用担当を置けない", "Slack固有のWorkflowや多数の外部アプリを使っている"],
    features: ["チャンネル型チャット", "ファイル共有と検索", "Bot・Webhook・外部システム連携", "セルフホスト運用", "モバイル・デスクトップクライアント"],
    technicalNotes: ["通知配信やメール設定まで含めて本番前に確認", "高可用性が必要ならDB・ストレージ・バックアップを別途設計", "ログ保持期間と監査要件を先に決める"],
    migrationNotes: ["Slackのチャンネル構造と権限をそのままコピーせず整理する", "利用中Bot・Webhook・Appを棚卸しして代替可否を確認", "全社切替前に一部チームで通知・検索・モバイルを検証"],
    deployment: ["検証環境で通知とモバイル体験を確認", "チャンネルと権限設計を先に整理", "ログ移行は段階的に実施"],
    operations: { setup: 3, updates: 3, backups: 3, monitoring: 3 },
    operationsNote: "チャット基盤は止めにくいため、監視・バックアップ・障害時の復旧方針まで含めて設計する必要があります。"
  },
  supabase: {
    slug: "supabase",
    summary: "PostgreSQLを中心に、Auth・Storage・Realtimeなどをまとめて扱えるオープンソースBaaS。",
    overview: "Firebaseの代替として検討されることが多いですが、単純な置き換えではなくデータモデルの見直しを伴うケースが多いです。PostgreSQLを中心に認証、ファイル、リアルタイム、サーバーサイド処理を組み合わせられるため、SQLを活かした設計に寄せたい開発チームと相性があります。",
    bestFor: ["PostgreSQLを使いたい", "Firebase依存を減らしたい", "AuthとDBを一体で扱いたい", "SQLベースで権限・分析・バックエンド処理を設計したい"],
    avoidIf: ["Firestore特有のデータ構造に深く依存している", "DB運用を一切持ちたくない", "Firebase固有SDKへの依存が大きい"],
    features: ["PostgreSQLデータベース", "認証・ユーザー管理", "オブジェクトストレージ", "リアルタイム購読", "Edge Functionsなどのバックエンド機能"],
    technicalNotes: ["Row Level Securityは便利だが設計ミスが認可事故に直結する", "セルフホストではDBバックアップ・監視・バージョンアップが重要", "Auth、Storage、DBを別々に移行できるよう境界を整理すると安全"],
    migrationNotes: ["FirestoreからSQLへ移る場合は先に正規化方針を決める", "Security RulesはRLS等へ書き換える必要がある", "Firebase SDK依存コードを段階的に抽象化して切り替える"],
    deployment: ["DBスキーマを最初に再設計", "Auth移行を独立して検証", "FunctionsやStorageは後段で段階移行"],
    operations: { setup: 3, updates: 3, backups: 4, monitoring: 4 },
    operationsNote: "セルフホストする場合は、PostgreSQL運用そのものの責任が発生します。特にバックアップ復元とRLS確認は導入前に必須です。"
  },
  umami: {
    slug: "umami",
    summary: "Webアクセス解析をシンプルに扱うための軽量なオープンソース分析ツール。",
    overview: "GA4よりもシンプルな計測体験を求める場合に向いています。広告計測や高度なアトリビューションより、ページビューやイベント、参照元などを分かりやすく追いたいケースと相性が良いです。分析要件を絞ることで、運用やダッシュボードの複雑さを減らせるのが強みです。",
    bestFor: ["シンプルなアクセス解析が欲しい", "プライバシーを重視したい", "自社で分析データを持ちたい", "GA4の複雑さを減らしたい"],
    avoidIf: ["広告運用と密接に連携したい", "GA4の高度なレポートが必須", "マーケティング施策をGoogle広告中心で最適化している"],
    features: ["ページビュー・訪問者分析", "イベント計測", "参照元・端末などの基本分析", "軽量なダッシュボード", "セルフホスト"],
    technicalNotes: ["計測タグの配信とDB保存先の可用性を確認", "イベント名を増やしすぎず、必要KPIから逆算して設計", "バックアップよりも計測欠損検知の方が実務上重要な場合がある"],
    migrationNotes: ["GA4の過去データを完全移行する前提にしない", "一定期間は新旧タグを並行稼働する", "イベント定義をGA4からそのままコピーせず必要指標に整理する"],
    deployment: ["新旧タグを並行稼働", "イベントを最小構成から再定義", "数週間の差分確認後に切り替え"],
    operations: { setup: 2, updates: 2, backups: 2, monitoring: 2 },
    operationsNote: "比較的軽量ですが、DBバックアップとタグ配信の確認は必要です。計測欠損に気づける仕組みも用意すると安心です。"
  },
  activepieces: {
    slug: "activepieces",
    summary: "ノーコード・ローコードで業務自動化フローを構築できるオープンソースの自動化基盤。",
    overview: "Zapier代替として、実行回数課金を抑えたい場合やセルフホストを選びたい場合に検討しやすい候補です。トリガーとアクションを組み合わせて業務フローを構築できますが、既存Zapをそのまま移すより、重要フローから再構築する前提で評価する方が現実的です。",
    bestFor: ["Zapierコストを見直したい", "社内データを外に出しにくい", "自動化を自社管理したい", "ノーコード中心でも必要に応じて技術者が支援できる"],
    avoidIf: ["Zapier固有コネクタへの依存が強い", "複雑な運用を避けたい", "数百本のZapを短期間で一括移行したい"],
    features: ["トリガー・アクション型のワークフロー", "Webhook・API連携", "セルフホスト", "認証済みコネクタ", "業務自動化の実行履歴"],
    technicalNotes: ["OAuth資格情報の再設定とSecret管理が必要", "失敗時の再試行・通知・実行履歴を運用ルールに含める", "セルフホストではワーカー停止やキュー詰まりを監視"],
    migrationNotes: ["Zapを重要度と実行回数で分類する", "利用中コネクタの対応状況を先に確認", "高頻度フローは一定期間並行稼働させて結果を比較"],
    deployment: ["Zap一覧を重要度順に整理", "OAuth認証とWebhookを先に検証", "重要フローから並行稼働"],
    operations: { setup: 2, updates: 3, backups: 2, monitoring: 3 },
    operationsNote: "自動化は失敗検知が重要なので、実行ログと通知設計を優先してください。"
  }
};
