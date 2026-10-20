# 福島こうき ポートフォリオ — 編集用データ

現在のサイトと同じHTML・CSS・JavaScript・画像・フォントをまとめています。

濃いグレーの背景、英語を主役にした見出し、作品の横スクロール、作品詳細、
繰り返しのない黒いブロック背景を含みます。

## 最初に開く方法

1. ZIPを右クリックして「すべて展開」します。
2. VS Codeの「ファイル → フォルダーを開く」で `koki-portfolio` フォルダーを開きます。
3. `index.html` を右クリックして「Open with Live Server」を選びます。
   Live Serverが入っている場合は、右下の「Go Live」からも開けます。

npmやPythonのインストール、ビルドは不要です。

相対パスにしているので、`index.html` のダブルクリックでも開けます。
通常の編集確認にはLive Serverがおすすめです。

## 編集するファイル

| 変更したいこと                                               | ファイル                        |
| ------------------------------------------------------------ | ------------------------------- |
| Home・Work・Aboutの文章、資格、イベント履歴                  | `index.html`                    |
| 現在の配色・フォントサイズ・余白・背景ブロックの見た目       | `editorial.css`                 |
| 基本のレイアウト・スマートフォン用の設定                     | `styles.css`                    |
| 作品の横スクロール・表示演出・背景のスクロール速度と配置生成 | `app.js`                        |
| Night Kitakyuの紹介文・リンク                                | `work/night-kitakyu/index.html` |
| Fukku Beauty.の紹介文・リンク                                | `work/fukku-beauty/index.html`  |
| メンズメイク基礎編の紹介文・リンク                           | `work/mens-makeup/index.html`   |
| 写真・イラスト                                               | `assets/`                       |

CSSは `styles.css` の後に `editorial.css` を読み込みます。
同じ設定がある場合は、後から読み込む `editorial.css` が優先されます。
まずは `editorial.css` で調整すると現在のデザインを変更しやすいです。

### 黒いブロック背景

`app.js` の `backgroundScrollRatio = 0.25` が背景のスクロール速度です。
0.25なら、本文が100pxスクロールすると黒い背景は25pxスクロールします。

`makeBackgroundLayout` でブロックの大きさ・間隔・位置を変更できます。
途中で同じ模様を複製せず、一続きの配置を生成しています。

### 作品を追加したい場合

- `index.html` の `class="work-card"` のarticleを複製し、画像・タイトル・リンクを変更します。
- `work` 内の作品フォルダーを複製し、紹介文とリンクを変更します。
- 一覧の「/ 03」を作品数に合わせて変更します。
- `app.js` の `progress.style.transform` を設定する箇所と、CSSの `.progress-bar` の幅は
  ３作品向けの表示です。作品数を増やす場合は、進捗表示も作品数に合わせて調整してください。

## 編集時の注意

- 紹介文・目標・課題は初稿です。自分の言葉に書き換えてください。
- ヘッダーやフッターは各HTMLにあるため、変更する場合は各ページにも反映してください。
- 画像を差し替える場合は、HTMLの画像パスとalt（画像の説明）も変更します。
- ファイル名の大文字・小文字はそろえてください。公開先では区別されることがあります。
- すべて相対パスなので、GitHub Pagesのリポジトリ配下にも配置できます。

## 画像・フォントについて

画像は各作品の公開サイトで使用している素材です。

カードは作品内の写真・イラストを使ったビジュアルで、サイト全体のスクリーンショットではありません。

- Night Kitakyu： https://github.com/fukushimakouki/night-kitakyu
- Fukku Beauty.： https://github.com/fukushimakouki/fukushima-s_makeup-skincare
- メンズメイク基礎編： https://github.com/fukushimakouki/mens_makeup

英字フォントはCormorant Garamondです。`assets/fonts/OFL.txt` にライセンスを同梱しています。
フォントを再配布する場合は、ライセンスファイルも残してください。
