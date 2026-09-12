# データ取り込み方針

## 初期候補の出典

初期候補の母集団には、OpenAlternativeが公開する
[open-source-alternatives](https://github.com/piotrkulpinski/open-source-alternatives)
を利用する。

同リポジトリはCC0 1.0で公開されているため、候補データは商用を含めて再利用できる。
ただし、候補リストは「掲載のきっかけ」であり、ossaltの掲載可否・説明・比較順位を決める根拠ではない。

## ossalt-nextへの取り込み条件

公開データにする前に、各候補について次を確認する。

1. 公式サイトまたは公式リポジトリが確認できる
2. ライセンスまたは利用条件の根拠URLを保存する
3. 置き換え対象のSaaSとの関係と、移行時の注意点を日本語で記録する
4. 最終確認日を記録する
5. スポンサー・提携の有無は、編集順位・検証状態と別に管理する

## 保存先

- products: 置き換え対象のSaaS
- projects: OSSプロジェクト
- alternative_relations: SaaSとOSSの関係・移行判断
- evidence_sources: 公式情報などの根拠URL
- project_snapshots: GitHub等の時点付き観測値

これにより、OpenAlternativeのキュレーションを出発点にしながら、ossalt独自の日本語移行ガイドとして育てる。
