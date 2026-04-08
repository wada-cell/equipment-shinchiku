"use client";

import Header from "@/components/Header";
import BottomNav from "@/components/BottomNav";

const sections = [
  {
    title: "ログイン方法",
    steps: [
      "ブラウザでアプリのURLを開く",
      "管理者から発行されたメールアドレスとパスワードを入力",
      "「ログイン」をタップ",
    ],
    note: "パスワードを忘れた場合は管理者に連絡してください。",
  },
  {
    title: "パスワードを変更する",
    steps: [
      "画面下の「マイページ」タブをタップ",
      "「パスワードを変更する」をタップ",
      "現在のパスワードと新しいパスワード（4文字以上）を入力",
      "「変更する」をタップして完了",
    ],
    note: "セキュリティのため、初回ログイン後にパスワードを変更することをおすすめします。",
  },
  {
    title: "備品を借りる",
    steps: [
      "ホーム画面でカテゴリを選ぶ（着工備品 / 現調セット・その他）",
      "借りたい備品をタップ（グループの場合は中に入って番号を選ぶ）",
      "備品詳細画面で「貸出申請する」をタップ",
      "使用現場・持ち出し日時・返却予定日時・使用目的を入力",
      "「貸出申請する」で完了",
    ],
    note: "「使用中」と表示されている備品は、他の人が借りています。",
  },
  {
    title: "備品を返却する",
    steps: [
      "ホーム画面の貸出状況、またはマイページから借りている備品をタップ",
      "備品詳細画面で「返却する」をタップ",
      "確認画面で「OK」を押して完了",
    ],
    note: "返却時の注意事項が表示される備品は、必ず確認してから返却してください。（例：キーボックスのナンバーを0000に戻す、一眼レフのSDカードを空にする）",
  },
  {
    title: "使用中の備品をリクエストする",
    steps: [
      "使用中の備品の詳細画面を開く",
      "「使用リクエストを送る」をタップ",
      "使いたい日時とメッセージを入力して送信",
      "現在借りている人に通知が届きます",
    ],
    note: "直接交渉して返却タイミングを調整してください。",
  },
  {
    title: "備品を予約する",
    steps: [
      "備品の詳細画面を開く",
      "「予約」セクションの「＋ 予約する」をタップ",
      "開始日時・終了日時・現場名・使用目的を入力",
      "「予約する」をタップして完了",
    ],
    note: "同じ期間に別の予約や貸出がある場合は、エラーが表示されます。予約のキャンセルは予約一覧の「取消」から。",
  },
  {
    title: "貸出カレンダーを見る",
    steps: [
      "ホーム画面の「貸出カレンダー」をタップ",
      "月を切り替えて、貸出がある日を確認",
      "日付をタップすると、その日の貸出一覧が表示されます",
    ],
    note: "黒い点がある日は貸出があります。スプレッドシートの月表示の代わりに使えます。",
  },
  {
    title: "通知を確認する",
    steps: [
      "画面下の「通知」タブをタップ",
      "返却期限のお知らせやリクエスト通知が表示されます",
    ],
    note: "ヘッダー右上のベルアイコンからも確認できます。",
  },
  {
    title: "【管理者】備品を追加・削除する",
    steps: [
      "マイページ →「管理者メニュー」→「備品の追加・編集」",
      "「＋ 備品を追加」をタップ",
      "カテゴリ・備品名・番号・保管場所・返却注意・メモを入力",
      "「追加する」で完了",
    ],
    note: "同じ名前で番号違い（例：キーボックス No.10）を追加すれば、自動でグループにまとまります。削除は各備品の「削除」ボタンから。",
  },
  {
    title: "【管理者】スタッフを登録する",
    steps: [
      "マイページ →「管理者メニュー」→「ユーザー管理」",
      "「＋ スタッフを追加」をタップ",
      "名前・メールアドレス・初期パスワード・権限・部署を入力",
      "「追加する」で完了",
    ],
    note: "登録したメールアドレスとパスワードをスタッフに伝えてください。",
  },
];

export default function HelpPage() {
  return (
    <div className="min-h-screen bg-white pb-24">
      <Header title="使い方ガイド" showBack />

      <main className="max-w-md mx-auto px-4 py-5 space-y-5">
        <div className="border-2 border-black rounded-xl p-4">
          <p className="font-black text-base">備品管理アプリの使い方</p>
          <p className="text-xs text-neutral-400 mt-1">楓工務店 リノベ事業部</p>
        </div>

        {sections.map((sec, i) => (
          <div key={i} className="border-2 border-neutral-200 rounded-xl overflow-hidden">
            <div className="bg-neutral-50 px-4 py-3 border-b-2 border-neutral-200">
              <p className="font-black text-sm">{sec.title}</p>
            </div>
            <div className="p-4 space-y-3">
              <ol className="space-y-2">
                {sec.steps.map((step, j) => (
                  <li key={j} className="flex gap-3">
                    <span className="w-6 h-6 border-2 border-black rounded-full flex items-center justify-center text-xs font-black flex-shrink-0">
                      {j + 1}
                    </span>
                    <span className="text-sm leading-relaxed pt-0.5">{step}</span>
                  </li>
                ))}
              </ol>
              {sec.note && (
                <div className="bg-neutral-50 rounded-lg px-3 py-2.5 mt-2">
                  <p className="text-xs text-neutral-500 leading-relaxed">
                    <span className="font-bold">NOTE: </span>{sec.note}
                  </p>
                </div>
              )}
            </div>
          </div>
        ))}
      </main>

      <BottomNav />
    </div>
  );
}
