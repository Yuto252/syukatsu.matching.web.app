// 都道府県データ
const prefecturesData = {
    hokkaido: ['北海道'],
    tohoku: ['青森県', '岩手県', '宮城県', '秋田県', '山形県', '福島県'],
    kanto: ['茨城県', '栃木県', '群馬県', '埼玉県', '千葉県', '東京都', '神奈川県'],
    chubu: ['新潟県', '富山県', '石川県', '福井県', '山梨県', '長野県', '岐阜県', '静岡県', '愛知県'],
    kinki: ['三重県', '滋賀県', '京都府', '大阪府', '兵庫県', '奈良県', '和歌山県'],
    chugoku: ['鳥取県', '島根県', '岡山県', '広島県', '山口県'],
    shikoku: ['徳島県', '香川県', '愛媛県', '高知県'],
    kyushu: ['福岡県', '佐賀県', '長崎県', '熊本県', '大分県', '宮崎県', '鹿児島県', '沖縄県']
};

// 地方選択時に対応する都道府県を表示する関数
function populateWorkLocations() {
    const region = document.getElementById('region').value;
    const workLocationContainer = document.getElementById('work-location');

    // コンテナ内をクリア
    workLocationContainer.innerHTML = '';

    // 選択した地方に対応する都道府県のチェックボックスを生成
    if (region && prefecturesData[region]) {
        prefecturesData[region].forEach(prefecture => {
            const label = document.createElement('label');
            label.textContent = prefecture;
            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.value = prefecture;
            label.prepend(checkbox);
            workLocationContainer.appendChild(label);
        });
    }
}

// 地方選択時に都道府県リストを動的に表示
document.getElementById('region').addEventListener('change', populateWorkLocations);

document.getElementById('company-info-form').addEventListener('submit', function(event) {
    event.preventDefault(); // フォームの送信を防止

    // 企業情報を取得
    const companyName = document.getElementById('company-name').value;
    const recruiter = document.getElementById('contact-person').value;
    const industry = document.getElementById('industry').value;
    const salary = parseInt(document.getElementById('salary').value, 10);
    const companySize = document.getElementById('company-size').value;
    const remoteWork = document.getElementById('remote').value;
    const overtime = document.getElementById('overtime').value;
    const annualHolidays = document.getElementById('annual-holidays').value;
    const paidLeave = parseInt(document.getElementById('paid-leave').value, 10);
    const workLocations = Array.from(document.querySelectorAll('#work-location input[type="checkbox"]:checked'))
                               .map(checkbox => checkbox.value);
    const benefits = Array.from(document.querySelectorAll('#benefits input[type="checkbox"]:checked'))
                          .map(checkbox => checkbox.value);
    const listingStatus = document.getElementById('listing-status').value;
    const transfer = document.getElementById('transfer').value;
    const sideJob = document.getElementById('side-job').value;
    const memo = document.getElementById('memo').value;

    // 企業データオブジェクトの作成
    const companyData = {
        name: companyName,
        recruiter: recruiter,
        industry: industry,
        salary: salary,
        size: companySize,
        remote: remoteWork,
        overtime: overtime,
        annualHolidays: annualHolidays,
        paidLeave: paidLeave,
        workLocations: workLocations,
        benefits: benefits,
        listingStatus: listingStatus,
        transfer: transfer,
        sideJob: sideJob,
        memo: memo,
        desirability: '', // 志望度を空の状態で初期化
        rank: '', // 判定結果を保存するためのフィールドを初期化
        matchPercentage: '' // マッチ率を保存するためのフィールドを初期化
    };

    // ダミーの求職者の希望条件（本来は別のフォームからの入力を使用）
    const desiredConditions = {
        industry: 'IT',
        salary: 500, // 万円
        companySize: 'medium',
        remoteWork: 'full',
        overtime: 'under-10',
        annualHolidays: '120-over',
        paidLeave: 70,
        selectedPrefectures: ['東京都', '神奈川県'],
        selectedBenefits: ['交通費支給', '社会保険完備', '健康診断'],
        listingStatus: 'listed',
        transfer: 'no',
        sideJob: 'allowed'
    };

    // 一致度計算ロジックを呼び出し
    const matchResult = calculateMatch(desiredConditions, companyData);

    // 判定とパーセンテージを companyData に追加
    companyData.rank = matchResult.rank;
    companyData.matchPercentage = matchResult.percentage;

    // 既存の企業データを取得し、新しいデータを追加
    let companies = JSON.parse(localStorage.getItem('companies')) || [];
    companies.push(companyData);
    localStorage.setItem('companies', JSON.stringify(companies)); // データをローカルストレージに保存

    // フォームをリセット
    document.getElementById('company-info-form').reset();

    // モーダルウィンドウの内容を設定
    document.getElementById('match-result').innerHTML = `
        <p><strong>${companyName}</strong>とのマッチ度は<strong>${matchResult.percentage}%</strong>です。</p>
        <p>評価: <strong>${matchResult.rank}</strong></p>
    `;

    // モーダルを表示
    const modal = document.getElementById('match-modal');
    modal.style.display = 'block';

    // 閉じるボタンの処理
    document.querySelector('.close').onclick = function() {
        modal.style.display = 'none';
    };

    // モーダル外をクリックした時に閉じる
    window.onclick = function(event) {
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    };
});

// 一致度を計算する関数
function calculateMatch(desiredConditions, companyData) {
    let totalPoints = 0;
    let matchedPoints = 0;

    // 業種の一致度
    totalPoints += 20;
    if (desiredConditions.industry === companyData.industry) {
        matchedPoints += 20;
    }

    // 年収の一致度
    totalPoints += 20;
    if (companyData.salary >= desiredConditions.salary) {
        matchedPoints += 20;
    } else {
        const salaryDifference = desiredConditions.salary - companyData.salary;
        matchedPoints += Math.max(0, 20 - (salaryDifference / 100) * 5); // 100万円ごとに-5点
    }

    // 会社規模の一致度
    totalPoints += 20;
    if (desiredConditions.companySize === companyData.size) {
        matchedPoints += 20;
    } else {
        matchedPoints += 10; // 違うがある程度のスコアを付与
    }

    // リモートワークの一致度
    totalPoints += 10;
    if (desiredConditions.remoteWork === companyData.remote) {
        matchedPoints += 10;
    }

    // 残業時間の一致度
    totalPoints += 15;
    if (desiredConditions.overtime === companyData.overtime) {
        matchedPoints += 15;
    } else {
        matchedPoints += 5; // 一部一致である程度のスコアを付与
    }

    // 年間休日の一致度
    totalPoints += 10;
    if (desiredConditions.annualHolidays === companyData.annualHolidays) {
        matchedPoints += 10;
    }

    // 有給取得率の一致度
    totalPoints += 15;
    if (companyData.paidLeave >= desiredConditions.paidLeave) {
        matchedPoints += 15;
    } else {
        const leaveDifference = desiredConditions.paidLeave - companyData.paidLeave;
        matchedPoints += Math.max(0, 15 - (leaveDifference / 10)); // 10%ごとに-1点
    }

    // 福利厚生の一致度
    totalPoints += 20;
    const commonBenefits = companyData.benefits.filter(benefit => desiredConditions.selectedBenefits.includes(benefit));
    matchedPoints += (commonBenefits.length / desiredConditions.selectedBenefits.length) * 20;

    // 勤務地の一致度
    totalPoints += 20;
    const commonLocations = companyData.workLocations.filter(location => desiredConditions.selectedPrefectures.includes(location));
    matchedPoints += (commonLocations.length / desiredConditions.selectedPrefectures.length) * 20;

    // 一致度の計算
    const matchPercentage = (matchedPoints / totalPoints) * 100;

    // ランクを判定
    let rank;
    if (matchPercentage >= 80) {
        rank = 'A';
    } else if (matchPercentage >= 70) {
        rank = 'B';
    } else if (matchPercentage >= 60) {
        rank = 'C';
    } else if (matchPercentage >= 50) {
        rank = 'D';
    } else {
        rank = 'E';
    }

    return {
        percentage: matchPercentage.toFixed(2),
        rank: rank
    };
}
