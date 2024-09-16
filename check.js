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
function populatePrefectures() {
    const region = document.getElementById('region').value;
    const prefectureContainer = document.getElementById('prefecture');

    // コンテナ内をクリア
    prefectureContainer.innerHTML = '';

    // 選択した地方に対応する都道府県のチェックボックスを生成
    if (region && prefecturesData[region]) {
        prefecturesData[region].forEach(prefecture => {
            const label = document.createElement('label');
            label.textContent = prefecture;
            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.value = prefecture;
            label.prepend(checkbox);
            prefectureContainer.appendChild(label);
        });
    }
}

// ページ読み込み時に保存された希望条件をロードする関数
function loadSavedConditions() {
    const savedConditions = JSON.parse(localStorage.getItem('desiredConditions'));
    if (savedConditions) {
        document.getElementById('industry').value = savedConditions.industry;
        document.getElementById('salary').value = savedConditions.salary;
        document.getElementById('company-size').value = savedConditions.companySize;
        document.getElementById('remote').value = savedConditions.remoteWork;
        document.getElementById('region').value = savedConditions.region;
        populatePrefectures();

        // 都道府県のチェック状態を復元
        savedConditions.selectedPrefectures.forEach(prefecture => {
            const checkbox = document.querySelector(`#prefecture input[value="${prefecture}"]`);
            if (checkbox) {
                checkbox.checked = true;
            }
        });

        // 福利厚生のチェック状態を復元
        savedConditions.selectedBenefits.forEach(benefit => {
            const checkbox = document.querySelector(`#benefits input[value="${benefit}"]`);
            if (checkbox) {
                checkbox.checked = true;
            }
        });
    }
}

// フォーム送信時に選択された条件を保存する関数
document.getElementById('matching-form').addEventListener('submit', function(event) {
    event.preventDefault(); // フォームの送信を防止

    // 各フォームの値を取得
    const industry = document.getElementById('industry').value;
    const salary = document.getElementById('salary').value;
    const companySize = document.getElementById('company-size').value;
    const remoteWork = document.getElementById('remote').value;
    const region = document.getElementById('region').value;

    // 選択された都道府県の取得
    const selectedPrefectures = Array.from(document.querySelectorAll('#prefecture input[type="checkbox"]:checked'))
        .map(checkbox => checkbox.value);

    // 選択された福利厚生の取得
    const selectedBenefits = Array.from(document.querySelectorAll('#benefits input[type="checkbox"]:checked'))
        .map(checkbox => checkbox.value);

    // ローカルストレージに保存するデータを作成
    const conditions = {
        industry,
        salary,
        companySize,
        remoteWork,
        region,
        selectedPrefectures,
        selectedBenefits
    };

    // ローカルストレージに保存
    localStorage.setItem('desiredConditions', JSON.stringify(conditions));

    // ポップアップウィンドウを表示
    alert('希望条件が保存されました。');

    // 他のページに移動する処理
    window.location.href = 'home.html'; // 保存後にホームページに遷移
});

// 地方選択時に都道府県リストを動的に表示
document.getElementById('region').addEventListener('change', populatePrefectures);

// ページ読み込み時に保存された希望条件を読み込む
document.addEventListener('DOMContentLoaded', loadSavedConditions);
