export type ProjectProfile = {
  slug: string;
  summary: string;
  overview: string;
  bestFor: string[];
  avoidIf: string[];
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
    overview: "Notionに近い使い方を意識しつつ、データの持ち方やホスティング方法を自分で選びたいチーム向けの候補です。完全な機能互換ではないため、既存Notionワークスペースの再現性は事前検証が必要です。",
    bestFor: ["Notionに近い操作感を求める", "データ管理の自由度を上げたい", "セルフホストを選択肢に入れたい"],
    avoidIf: ["Notion固有の高度なDB機能に強く依存している", "運用を完全にSaaS任せにしたい"],
    deployment: ["Cloud版またはセルフホスト構成を検討", "小規模環境で先にデータ移行を検証", "バックアップとアップデート手順を事前に決める"],
    operations: { setup: 2, updates: 3, backups: 3, monitoring: 2 },
    operationsNote: "セルフホストでは、アップデートとデータ保全の責任が増えます。"
  },
  mattermost: {
    slug: "mattermost",
    summary: "チームチャットとコラボレーションを自社管理しやすいオープンソース基盤。",
    overview: "Slack代替として検討しやすく、特に社内運用やセルフホスト要件がある組織に向いています。Bot、通知、既存Slack連携の再現可否は移行前に確認が必要です。",
    bestFor: ["社内チャットを自社管理したい", "Slack依存を減らしたい", "アクセス制御を重視したい"],
    avoidIf: ["Slack Appエコシステムへの依存が強い", "運用担当を置けない"],
    deployment: ["検証環境で通知とモバイル体験を確認", "チャンネルと権限設計を先に整理", "ログ移行は段階的に実施"],
    operations: { setup: 3, updates: 3, backups: 3, monitoring: 3 },
    operationsNote: "チャット基盤は止めにくいため、監視とバックアップの設計が重要です。"
  },
  supabase: {
    slug: "supabase",
    summary: "PostgreSQLを中心に、Auth・Storage・Realtimeなどをまとめて扱えるオープンソースBaaS。",
    overview: "Firebaseの代替として検討されることが多いですが、Firestore前提のアプリではデータモデルの変更が必要です。SQLを活かした設計に寄せたい開発チームに向いています。",
    bestFor: ["PostgreSQLを使いたい", "Firebase依存を減らしたい", "AuthとDBを一体で扱いたい"],
    avoidIf: ["Firestore特有のデータ構造に深く依存している", "DB運用を一切持ちたくない"],
    deployment: ["DBスキーマを最初に再設計", "Auth移行を独立して検証", "FunctionsやStorageは後段で段階移行"],
    operations: { setup: 3, updates: 3, backups: 4, monitoring: 4 },
    operationsNote: "セルフホストする場合は、PostgreSQL運用そのものの責任が発生します。"
  },
  umami: {
    slug: "umami",
    summary: "Webアクセス解析をシンプルに扱うための軽量なオープンソース分析ツール。",
    overview: "GA4よりもシンプルな計測体験を求める場合に向いています。広告計測や高度なアトリビューションより、ページビューやイベントを分かりやすく追いたいケースと相性が良いです。",
    bestFor: ["シンプルなアクセス解析が欲しい", "プライバシーを重視したい", "自社で分析データを持ちたい"],
    avoidIf: ["広告運用と密接に連携したい", "GA4の高度なレポートが必須"],
    deployment: ["新旧タグを並行稼働", "イベントを最小構成から再定義", "数週間の差分確認後に切り替え"],
    operations: { setup: 2, updates: 2, backups: 2, monitoring: 2 },
    operationsNote: "比較的軽量ですが、DBバックアップとタグ配信の確認は必要です。"
  },
  activepieces: {
    slug: "activepieces",
    summary: "ノーコード・ローコードで業務自動化フローを構築できるオープンソースの自動化基盤。",
    overview: "Zapier代替として、実行回数課金を抑えたい場合やセルフホストを選びたい場合に検討しやすい候補です。既存Zapの完全自動移行ではなく、重要フローから再構築する前提が現実的です。",
    bestFor: ["Zapierコストを見直したい", "社内データを外に出しにくい", "自動化を自社管理したい"],
    avoidIf: ["Zapier固有コネクタへの依存が強い", "複雑な運用を避けたい"],
    deployment: ["Zap一覧を重要度順に整理", "OAuth認証とWebhookを先に検証", "重要フローから並行稼働"],
    operations: { setup: 2, updates: 3, backups: 2, monitoring: 3 },
    operationsNote: "自動化は失敗検知が重要なので、実行ログと通知設計を優先してください。"
  }
};
