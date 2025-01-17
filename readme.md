# asker

**asker** は、指定したディレクトリ構成とファイル内容をひとつの Markdown ファイルにまとめる CLI ツールです。  
ChatGPT などの AI にコードを渡す際、大量のファイルを個別にコピー＆ペーストする手間を省きます。

- ディレクトリ構成を `tree` コマンドのような形式で出力
- 対象のファイル内容をすべて Markdown にまとめて出力
- ファイルの先頭・末尾に挿入する文言（説明や質問など）を柔軟に設定可能
- 最終的に生成される Markdown の合計文字数を出力
- 1 つの設定ファイル (YAML) 内で複数の設定セットを管理し、用途に応じて使い分け

## 特徴

- **複数の設定**: `configs` 配列で複数の設定を定義可能
- **ターゲット指定**: `include` と `exclude`、さらに `filePatterns` を組み合わせて対象ファイルを柔軟に指定
- **tree 表示**: ディレクトリのみ表示・最大深度などオプションを通じて制御
- **Markdown 出力**: 1 つの `.md` ファイルにまとめられるため、ChatGPT への貼り付けが容易
- **統計情報**: 生成した Markdown の**合計文字数**を最後に表示

## インストール

プロジェクト内で devDependencies として使う場合:

```bash
npm install --save-dev asker
```

または、

```bash
yarn add --dev asker
```

## 使い方

1. **設定ファイルの作成**  
   プロジェクトルート等に `asker.config.yaml` といった名前で YAML ファイルを作成し、以下のように設定します。

   ```yaml
   configs:
     - name: "eric-evans"
       preText: |
         これは "eric-evans" 設定で出力されるファイルです。
         相談したい内容としては…
       postText: |
         以上が "eric-evans" 設定の出力です。
         何かアドバイスあればお願いします。
       targets:
         include:
           - "packages/core"
           - "packages/utils"
         exclude:
           - "packages/core/dist"
           - "**/node_modules"
         filePatterns:
           - "**/*.ts"
           - "**/*.js"
       tree:
         maxDepth: 5
         directoriesOnly: false

     - name: "review"
       preText: |
         こちらは "review" 設定用です。
         Web アプリをレビューしていただきたく…
       postText: |
         以上が "review" 設定の出力です。
         問題点や修正点のご指摘をお待ちしています。
       targets:
         include:
           - "apps/www"
         exclude:
           - "apps/www/node_modules"
         filePatterns:
           - "**/*.vue"
           - "**/*.js"
           - "**/*.ts"
       tree:
         maxDepth: 10
         directoriesOnly: false
   ```

   - `name` は CLI 実行時に使用する設定セットの識別子
   - `preText` / `postText` は生成される Markdown の先頭・末尾に挿入
   - `include` / `exclude` / `filePatterns` を組み合わせて対象ファイルを決定
   - `tree` の設定でディレクトリ構成の表示を調整

2. **CLI の実行**  
   ターミナルで以下のコマンドを実行します。

   ```bash
   npx asker --config=asker.config.yaml --name=eric-evans
   ```

   - `--config`: YAML 設定ファイルのパスを指定 (デフォルトは `asker.config.yaml`)
   - `--name`: 実行したい設定セットを指定 (設定ファイル内の `configs[].name`)

   実行すると、`asker-export-<設定名>.md` (例: `asker-export-eric-evans.md`) が生成され、
   以下のような情報が 1 つの Markdown にまとめられます。

   1. `preText` に記載した文言
   2. ディレクトリ構成 (`tree` コマンド風)
   3. 対象ファイルの全内容 (拡張子に応じてコードブロックを自動判定)
   4. `postText` に記載した文言
   5. **合計文字数** の統計情報

3. **package.json の scripts に登録する例**  
   毎回同じオプションを打つのが面倒な場合、`package.json` にスクリプトを追加しておくと便利です。

   ```jsonc
   {
     "scripts": {
       "export:eric-evans": "asker --config=asker.config.yaml --name=eric-evans",
       "export:review": "asker --config=asker.config.yaml --name=review"
     }
   }
   ```

   以後は `npm run export:eric-evans` などでサクッと実行できます。

## 出力されるファイルのイメージ

生成される Markdown (`asker-export-eric-evans.md`) は、ざっくり以下のような構造です:

```markdown
(ここに preText が挿入される)

## ディレクトリ構成
```

```
packages
├── core
│   ├── index.ts
│   └── ...
├── utils
│   └── ...
└── ...
```

````
## ファイル一覧と内容

### packages/core/index.ts
```ts
// index.ts の中身
````

(他のファイルも同様に続く)

(ここに postText が挿入される)

## 統計情報

- **合計文字数**: 123456

```

## オプション・機能

- **複数設定セット**:
  - `asker.config.yaml` の `configs[]` にいくつでも設定セットを追加可能
  - `--name` オプションで実行時に使う設定を選択
- **ターゲット指定**:
  - `include`: 対象に含めたいディレクトリ・パス
  - `exclude`: 除外したいディレクトリ・パス
  - `filePatterns`: ファイル拡張子や glob パターン (例: `**/*.ts`, `**/*.js`)
- **tree 表示**:
  - `maxDepth`: ツリーを再帰的にどの階層まで表示するか
  - `directoriesOnly`: ディレクトリのみを表示するかどうか
- **先頭・末尾メッセージ**:
  - `preText`: Markdown の最初に挿入
  - `postText`: Markdown の最後に挿入
- **統計情報**:
  - 出力した Markdown 全体の文字数を最後に追記

## ライセンス

[MIT License](./LICENSE)

ご自由にご利用ください。

## コントリビュート

- バグ報告や機能要望は Issue へ
- プルリクエスト歓迎します

気軽にご利用いただき、ChatGPT とのやりとりが快適になることを願っています。
```
