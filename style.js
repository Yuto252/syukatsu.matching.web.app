window.onload = function() {
    const welcomeText = document.getElementById("welcome-text");
    const quoteText = document.getElementById("quote-text");

    // 偉人の名言リスト
    const quotes = [
        "成功するためには、成功の欲望が失敗の恐怖よりも強くなければならない。",
        "人生を変える最初のステップは、何を恐れているかを知ることだ。",
        "チャンスは準備された心に宿る。",
        "未来は今日始まる。",
        "明日死ぬと思っていきなさい。永遠に生きると思って学びなさい。",
    ];

    // ランダムに名言を選択
    const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];

    // 文字がゆっくり浮かび上がる
    setTimeout(() => {
        welcomeText.style.opacity = 1;
        quoteText.style.opacity = 1;
        quoteText.textContent = randomQuote;  // 選ばれた名言を表示
    }, 500);  // 0.5秒後に文字が浮かび上がる

    // 3秒後にフェードアウトし、ページをリダイレクト
    setTimeout(() => {
        document.body.classList.add('fade-out');  // フェードアウトのクラスを追加

        // フェードアウト後にページ移動
        setTimeout(() => {
            window.location.href = "home.html";  // 移動するページのURLを指定
        }, 1000);  // 1秒後にリダイレクト（フェードアウト完了後）
    }, 3500);  // 3.5秒後にフェードアウト開始
};
