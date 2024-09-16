document.addEventListener('DOMContentLoaded', function() {
    let companies = JSON.parse(localStorage.getItem('companies')) || [];

    const companyListTable = document.getElementById('company-list');

    // データの表示
    function displayCompanies(companies) {
        companyListTable.innerHTML = ''; // クリアしてから再描画

        if (companies.length === 0) {
            companyListTable.innerHTML = '<tr><td colspan="3">登録された企業情報がありません。</td></tr>';
            return;
        }

        companies.forEach((company, index) => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${company.name || '未入力'}</td>
                <td>
                    <select class="desirability-select" data-index="${index}">
                        <option value="">選択</option>
                        <option value="A" ${company.desirability === 'A' ? 'selected' : ''}>A</option>
                        <option value="B" ${company.desirability === 'B' ? 'selected' : ''}>B</option>
                        <option value="C" ${company.desirability === 'C' ? 'selected' : ''}>C</option>
                        <option value="D" ${company.desirability === 'D' ? 'selected' : ''}>D</option>
                    </select>
                </td>
                <td>
                    <button class="details-btn" data-index="${index}">詳細</button>
                    <button class="delete-btn" data-index="${index}">削除</button>
                </td>
            `;
            companyListTable.appendChild(row);
        });

        // 志望度の保存機能
        document.querySelectorAll('.desirability-select').forEach(select => {
            select.addEventListener('change', function() {
                const index = this.getAttribute('data-index');
                const desirability = this.value;
                companies[index].desirability = desirability;
                localStorage.setItem('companies', JSON.stringify(companies));
                displayCompanies(companies); // 再描画
            });
        });

        // 削除ボタンのイベントリスナー
        document.querySelectorAll('.delete-btn').forEach(button => {
            button.addEventListener('click', function() {
                const index = this.getAttribute('data-index');
                if (confirm(`${companies[index].name || 'この企業'} を削除してもよろしいですか？`)) {
                    companies.splice(index, 1);
                    localStorage.setItem('companies', JSON.stringify(companies));
                    displayCompanies(companies);
                }
            });
        });

        // 詳細ボタンのイベントリスナー
        document.querySelectorAll('.details-btn').forEach(button => {
            button.addEventListener('click', function() {
                const index = this.getAttribute('data-index');
                const company = companies[index];

                const modal = document.getElementById('modal');
                const modalContent = document.getElementById('modal-details');
                modalContent.innerHTML = `
                    <div class="details-section">
                        <h3>${company.name || '未入力'} <span class="match-info">[${company.rank || 'N/A'}, ${company.matchPercentage || 'N/A'}%]</span></h3>
                        <p><strong>採用担当者名:</strong> ${company.recruiter || '未入力'}</p>
                        <p><strong>業種:</strong> ${company.industry || '未入力'}</p>
                        <p><strong>年収:</strong> ${company.salary ? `${company.salary}万円` : '未入力'}</p>
                        <p><strong>会社の規模:</strong> ${
                            company.size === 'small' ? '小規模（1-50人）' :
                            company.size === 'medium-small' ? '中小規模（51-200人）' :
                            company.size === 'medium' ? '中規模（201-500人）' :
                            company.size === 'large' ? '大規模（501-1000人）' :
                            '超大規模（1000人以上）'
                        }</p>
                        <p><strong>勤務地:</strong> ${company.workLocations && company.workLocations.length > 0 ? company.workLocations.join(', ') : '未入力'}</p>
                        <p><strong>リモートワーク:</strong> ${
                            company.remote === 'full' ? 'フルリモート' :
                            company.remote === 'part' ? '週に2〜3日リモート' :
                            'リモートなし'
                        }</p>
                        <p><strong>副業:</strong> ${
                            company.sideJob === 'allowed' ? '許可' : '不可'
                        }</p>
                        <p><strong>平均残業時間:</strong> ${
                            company.overtime === 'under-10' ? '10時間未満' :
                            company.overtime === '10-15' ? '10時間以上15時間未満' :
                            company.overtime === '15-20' ? '15時間以上20時間未満' :
                            company.overtime === '20-25' ? '20時間以上25時間未満' :
                            company.overtime === '25-30' ? '25時間以上30時間未満' :
                            company.overtime === '35-40' ? '35時間以上40時間未満' :
                            company.overtime === '40-over' ? '40時間以上' : '未入力'
                        }</p>
                        <p><strong>上場の有無:</strong> ${company.listingStatus === 'listed' ? '上場' : '非上場'}</p>
                        <p><strong>年間休日数:</strong> ${company.annualHolidays === '120-over' ? '120日以上' : '120日未満'}</p>
                        <p><strong>有給取得率:</strong> ${company.paidLeave ? `${company.paidLeave}%` : '未入力'}</p>
                        <p><strong>転勤の有無:</strong> ${company.transfer === 'yes' ? 'あり' : 'なし'}</p>
                        <p><strong>福利厚生:</strong> ${company.benefits && company.benefits.length > 0 ? company.benefits.join(', ') : '選択なし'}</p>
                    </div>
                    <div class="memo-section">
                        <h4>メモ</h4>
                        <p>${company.memo || 'メモなし'}</p>
                    </div>
                `;
                modal.style.display = 'block';
            });
        });
    }

    // 初期表示
    displayCompanies(companies);

    // モーダルウィンドウの閉じる機能
    const modal = document.getElementById('modal');
    const closeModal = document.getElementsByClassName('close')[0];
    closeModal.onclick = function() {
        modal.style.display = 'none';
    };
    window.onclick = function(event) {
        if (event.target == modal) {
            modal.style.display = 'none';
        }
    };

    // 並べ替え機能
    document.getElementById('sort-name').addEventListener('click', function() {
        companies.sort((a, b) => a.name.localeCompare(b.name));
        localStorage.setItem('companies', JSON.stringify(companies));
        displayCompanies(companies);
    });

    document.getElementById('sort-desirability').addEventListener('click', function() {
        companies.sort((a, b) => {
            const desirabilityA = a.desirability || '';
            const desirabilityB = b.desirability || '';
            return desirabilityA.localeCompare(desirabilityB);
        });
        localStorage.setItem('companies', JSON.stringify(companies));
        displayCompanies(companies);
    });
});
