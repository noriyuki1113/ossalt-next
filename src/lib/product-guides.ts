export type ProductGuide = {
  slug: string;
  headline: string;
  intro: string;
  bestFor: { label: string; project: string; reason: string }[];
  changes: { label: string; before: string; after: string }[];
  risks: string[];
  steps: string[];
  faq: { q: string; a: string }[];
  related: string[];
};

export const productGuides: Record<string, ProductGuide> = {
  notion: {
    slug: "notion",
    headline: "Notionから移るなら、まず“何を残したいか”を決める。",
    intro: "ドキュメント、データベース、タスク管理、AI、共有。Notionは用途が広いぶん、完全な置き換えよりも優先機能を決めて選ぶ方が現実的です。",
    bestFor: [
      { label: "総合", project: "AppFlowy", reason: "Notionに近いワークスペース体験を重視" },
      { label: "チームWiki", project: "Outline", reason: "社内ドキュメントとナレッジ共有を重視" },
      { label: "ローカル志向", project: "AFFiNE", reason: "ドキュメントとホワイトボードを一体で扱いたい" }
    ],
    changes: [
      { label: "データ保管", before: "SaaS側", after: "自社管理も可能" },
      { label: "AI機能", before: "統合済み", after: "候補により差" },
      { label: "運用負担", before: "小", after: "中〜大" },
      { label: "自由度", before: "中", after: "高" }
    ],
    risks: ["Notion AIや一部データベース機能は同等でない場合があります。","既存テンプレートや外部連携は再構築が必要です。","共有リンクや権限モデルが変わる場合があります。"],
    steps: ["Notionからエクスポート","重要ページとDBを優先順位付け","検証環境へインポート","権限・共同編集を確認","小規模チームから切り替え"],
    faq: [
      { q: "完全移行できますか？", a: "ページ構成は移せても、データベース機能や連携を完全再現できるとは限りません。" },
      { q: "無料で使えますか？", a: "セルフホスト版は無料で使える候補がありますが、サーバー費用と運用工数は必要です。" },
      { q: "日本語は使えますか？", a: "主要候補は日本語入力に対応しますが、UI翻訳の完成度は候補ごとに異なります。" }
    ],
    related: ["slack","jira","google-docs"]
  },
  slack: {
    slug: "slack",
    headline: "Slack代替は、チャット機能より“運用と連携”を見る。",
    intro: "メッセージ機能だけなら代替は多いですが、通知、Bot、外部連携、過去ログ、モバイル体験まで含めると移行難易度が上がります。",
    bestFor: [
      { label: "総合", project: "Mattermost", reason: "企業向け運用とセルフホストを重視" },
      { label: "軽量", project: "Rocket.Chat", reason: "チャット中心で柔軟に構成したい" },
      { label: "分散型", project: "Matrix", reason: "オープンな通信基盤を重視" }
    ],
    changes: [
      { label: "データ保管", before: "Slack管理", after: "自社管理可能" },
      { label: "App連携", before: "非常に豊富", after: "要再確認" },
      { label: "運用負担", before: "小", after: "中〜大" },
      { label: "制御性", before: "中", after: "高" }
    ],
    risks: ["既存Slack AppsやWorkflow Builderはそのまま移行できません。","過去ログの移行可否はプランと候補に依存します。","通知品質やモバイルUXは事前検証が必要です。"],
    steps: ["チャンネルと利用Botを棚卸し","必須連携を特定","テスト環境を構築","ログ移行と通知を検証","部門単位で段階移行"],
    faq: [
      { q: "履歴は移せますか？", a: "エクスポート形式と移行先の取り込み機能次第です。事前に必ず検証してください。" },
      { q: "Slack Appsは使えますか？", a: "そのまま使えるケースは少なく、WebhookやBotを作り直すことが多いです。" },
      { q: "社内だけで運用できますか？", a: "セルフホスト対応候補なら可能です。" }
    ],
    related: ["notion","jira","teams"]
  },
  zapier: {
    slug: "zapier",
    headline: "Zapier代替は、コネクタ数より“今ある自動化を再現できるか”。",
    intro: "自動化ツールは画面の似ている・似ていないより、トリガー、認証、分岐、再試行、実行履歴の違いが重要です。",
    bestFor: [
      { label: "総合", project: "Activepieces", reason: "ノーコードとセルフホストのバランス" },
      { label: "柔軟性", project: "n8n", reason: "複雑なフローとコード拡張を重視" },
      { label: "AI連携", project: "ByteChef", reason: "AIワークフローもまとめたい" }
    ],
    changes: [
      { label: "コネクタ", before: "非常に豊富", after: "候補により差" },
      { label: "自由度", before: "中", after: "高" },
      { label: "運用負担", before: "小", after: "中" },
      { label: "コスト構造", before: "実行課金中心", after: "インフラ費中心も可" }
    ],
    risks: ["Zapier固有コネクタは置き換えられない場合があります。","OAuth認証を再設定する必要があります。","複雑なZapは手作業で再構築が必要です。"],
    steps: ["Zap一覧をCSV化","重要度と実行数で分類","認証情報を整理","上位フローから再構築","並行稼働して差分確認"],
    faq: [
      { q: "Zapを自動移行できますか？", a: "基本的には難しく、重要フローから再構築するのが現実的です。" },
      { q: "セルフホストの利点は？", a: "実行回数課金を抑えやすく、データ経路を自社管理できます。" },
      { q: "初心者でも使えますか？", a: "Activepiecesなどは比較的取り組みやすいですが、運用は別途必要です。" }
    ],
    related: ["make","ifttt","power-automate"]
  },
  firebase: {
    slug: "firebase",
    headline: "Firebase移行は、UIではなく“データモデル”が本丸。",
    intro: "認証、DB、Storage、Functionsをまとめて使っているほど移行は大きくなります。特にNoSQLからSQLへ変える場合は設計変更が必要です。",
    bestFor: [
      { label: "Postgres", project: "Supabase", reason: "SQLとPostgreSQLを中心に移行したい" },
      { label: "BaaS総合", project: "Appwrite", reason: "Firebaseに近い統合BaaS体験を重視" },
      { label: "柔軟構成", project: "PocketBase", reason: "小〜中規模アプリを軽量に運用" }
    ],
    changes: [
      { label: "DB", before: "Firestore / RTDB", after: "SQLまたは別モデル" },
      { label: "Auth", before: "Firebase Auth", after: "再設定" },
      { label: "Functions", before: "Cloud Functions", after: "再実装" },
      { label: "運用", before: "Google管理", after: "自社責任も選択可" }
    ],
    risks: ["NoSQL前提のクエリは設計変更が必要です。","Security Rulesは別方式へ書き換えが必要です。","SDK依存コードの変更範囲が大きくなる場合があります。"],
    steps: ["利用中Firebase機能を棚卸し","DBスキーマを再設計","Authを先に移行","StorageとFunctionsを段階移行","トラフィックを切り替え"],
    faq: [
      { q: "Supabaseへ簡単に移れますか？", a: "小規模なら比較的進めやすいですが、Firestore設計が複雑なほど再設計が必要です。" },
      { q: "リアルタイム機能は使えますか？", a: "SupabaseやAppwriteにもリアルタイム機能がありますが、APIは異なります。" },
      { q: "既存アプリを止めずに移行できますか？", a: "二重書き込みや段階切替を使えば可能ですが、設計が必要です。" }
    ],
    related: ["supabase","vercel","cloudflare"]
  },
  "google-analytics": {
    slug: "google-analytics",
    headline: "GA4代替は、“全部見る”から“必要な指標だけ見る”へ。",
    intro: "Open source analyticsは、GA4の全機能再現よりも、ページビュー・イベント・コンバージョンをシンプルに把握する用途に向いています。",
    bestFor: [
      { label: "シンプル", project: "Umami", reason: "軽量で分かりやすいアクセス解析" },
      { label: "プライバシー", project: "Plausible", reason: "プライバシー重視のWeb解析" },
      { label: "プロダクト分析", project: "PostHog", reason: "イベント分析まで広げたい" }
    ],
    changes: [
      { label: "レポート", before: "非常に多機能", after: "シンプル" },
      { label: "広告連携", before: "強い", after: "限定的" },
      { label: "プライバシー", before: "要設定", after: "重視しやすい" },
      { label: "運用負担", before: "小", after: "小〜中" }
    ],
    risks: ["広告アトリビューションや高度な分析は代替できない場合があります。","過去データの完全移行は難しいです。","イベント設計を見直す必要があります。"],
    steps: ["必要KPIを絞る","新旧タグを並行設置","イベントを再定義","数週間差分を確認","旧計測を停止"],
    faq: [
      { q: "GA4の過去データは移せますか？", a: "完全移行は一般的ではなく、旧データは別途保存して参照する運用が現実的です。" },
      { q: "Cookieレスで使えますか？", a: "PlausibleやUmamiはプライバシー重視の計測に向いています。" },
      { q: "EC分析にも使えますか？", a: "基本指標は可能ですが、GA4のECレポートと同等とは限りません。" }
    ],
    related: ["mixpanel","amplitude","matomo"]
  }
};
