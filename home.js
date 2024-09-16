document.addEventListener('DOMContentLoaded', () => {
  const calendar = document.getElementById('calendar');

  // 現在の月と年を取得
  let now = new Date();
  let currentMonth = now.getMonth();
  let currentYear = now.getFullYear();

  // 月の目標を保存する
  const monthlyGoalInput = document.getElementById('monthly-goal');
  const savedGoal = localStorage.getItem('monthlyGoal'); // 保存された目標を取得

  // 目標が保存されている場合は表示
  if (savedGoal) {
    monthlyGoalInput.value = savedGoal;
  }

  // 目標の入力が変更されたら保存
  monthlyGoalInput.addEventListener('input', () => {
    localStorage.setItem('monthlyGoal', monthlyGoalInput.value);
  });

  // 予定を保存するオブジェクト
  let scheduleData = JSON.parse(localStorage.getItem('scheduleData')) || {}; // ローカルストレージから取得

  // カレンダーを生成
  function generateCalendar(year, month) {
    calendar.innerHTML = ''; // カレンダーをクリア
    const firstDay = new Date(year, month, 1).getDay(); // 月初の日の曜日を取得
    const daysInMonth = new Date(year, month + 1, 0).getDate(); // その月の日数を取得

    const monthTitle = `${year}年 ${month + 1}月`;
    document.getElementById('calendar-title').textContent = monthTitle;

    // 曜日を表示
    const daysRow = document.createElement('div');
    daysRow.classList.add('days-row');
    const daysOfWeek = ['日', '月', '火', '水', '木', '金', '土'];
    daysOfWeek.forEach((day) => {
      const dayEl = document.createElement('span');
      dayEl.textContent = day;
      daysRow.appendChild(dayEl);
    });
    calendar.appendChild(daysRow);

    // カレンダーの日付を生成
    const calendarGrid = document.createElement('div');
    calendarGrid.classList.add('calendar-grid');

    // 最初の空白マスを生成（1日の前の空きスペース）
    for (let i = 0; i < firstDay; i++) {
      const emptyCell = document.createElement('div');
      calendarGrid.appendChild(emptyCell);
    }

    // 日付を埋める
    for (let day = 1; day <= daysInMonth; day++) {
      const dayCell = document.createElement('div');
      const dayText = document.createElement('span');
      dayText.textContent = day;
      dayCell.appendChild(dayText);

      // 土曜日なら青、日曜日なら赤のスタイルを適用
      const dayOfWeek = (firstDay + day - 1) % 7;
      if (dayOfWeek === 0) {
        dayCell.classList.add('sunday'); // 日曜日を赤に
      } else if (dayOfWeek === 6) {
        dayCell.classList.add('saturday'); // 土曜日を青に
      }

      // 今日の日付なら特別なクラスを追加
      if (day === now.getDate() && month === now.getMonth() && year === now.getFullYear()) {
        dayCell.classList.add('today');
      }

      // 予定があればプレビューを表示
      if (scheduleData[currentYear] && scheduleData[currentYear][currentMonth] && scheduleData[currentYear][currentMonth][day]) {
        const preview = document.createElement('div');
        preview.classList.add('preview');

        // 文字数制限 (最大15文字表示)
        const scheduleText = scheduleData[currentYear][currentMonth][day][0]; // 最初の予定のみ表示
        const truncatedText = scheduleText.length > 15 ? scheduleText.slice(0, 15) + "..." : scheduleText;

        const schedulePreview = document.createElement('p');
        schedulePreview.textContent = truncatedText;
        preview.appendChild(schedulePreview);
        dayCell.appendChild(preview);
      }

      // 日付をクリックするとモーダルを表示
      dayCell.addEventListener('click', () => openModal(day));
      calendarGrid.appendChild(dayCell);
    }

    calendar.appendChild(calendarGrid);
  }

  // モーダルを開く関数
  function openModal(day) {
    const modal = document.getElementById('schedule-modal');
    const modalTitle = document.getElementById('modal-title');
    const scheduleList = document.getElementById('schedule-list');

    modal.style.display = 'block';
    modalTitle.textContent = `${currentYear}年 ${currentMonth + 1}月 ${day}日の予定`;

    // その日の予定を表示
    scheduleList.innerHTML = ''; // 既存の予定をクリア
    if (scheduleData[currentYear] && scheduleData[currentYear][currentMonth] && scheduleData[currentYear][currentMonth][day]) {
      scheduleData[currentYear][currentMonth][day].forEach((schedule, index) => {
        const scheduleItem = document.createElement('div');
        scheduleItem.classList.add('schedule-item');
        
        const scheduleText = document.createElement('p');
        scheduleText.textContent = `${index + 1}: ${schedule}`;
        
        // ボタンをグループ化して縦に並べる
        const buttonGroup = document.createElement('div');
        buttonGroup.classList.add('button-group');

        const editButton = document.createElement('button');
        editButton.textContent = '編集';
        editButton.addEventListener('click', () => editSchedule(day, index));

        const deleteButton = document.createElement('button');
        deleteButton.textContent = '削除';
        deleteButton.addEventListener('click', () => deleteSchedule(day, index));

        // ボタンをグループ内に追加
        buttonGroup.appendChild(deleteButton);
        buttonGroup.appendChild(editButton);

        // スケジュール項目に追加
        scheduleItem.appendChild(scheduleText);
        scheduleItem.appendChild(buttonGroup);

        scheduleList.appendChild(scheduleItem);
      });
    }

    // 予定を追加するボタン
    document.getElementById('add-schedule').onclick = () => {
      addNewSchedule(day);
    };

    // モーダルを閉じる
    document.getElementById('close-modal').addEventListener('click', () => {
      modal.style.display = 'none';
    });

    // モーダル外をクリックすると閉じる
    window.addEventListener('click', (event) => {
      if (event.target == modal) {
        modal.style.display = 'none';
      }
    });
  }

  // 予定を削除する関数
  window.deleteSchedule = function(day, index) {
    if (scheduleData[currentYear][currentMonth][day]) {
      scheduleData[currentYear][currentMonth][day].splice(index, 1); // 予定を削除
      if (scheduleData[currentYear][currentMonth][day].length === 0) {
        delete scheduleData[currentYear][currentMonth][day]; // 予定が空の場合は削除
      }
      localStorage.setItem('scheduleData', JSON.stringify(scheduleData)); // 更新された予定を保存
      generateCalendar(currentYear, currentMonth); // カレンダーを再描画
      openModal(day); // モーダルも再描画
    }
  };

  // 予定を編集する関数
  window.editSchedule = function(day, index) {
    const newSchedule = prompt("新しい予定を入力してください:", scheduleData[currentYear][currentMonth][day][index]);
    if (newSchedule) {
      scheduleData[currentYear][currentMonth][day][index] = newSchedule;
      localStorage.setItem('scheduleData', JSON.stringify(scheduleData));
      generateCalendar(currentYear, currentMonth); // カレンダーを再描画
      openModal(day); // モーダルも再描画
    }
  };

  // 予定を追加する関数
  function addNewSchedule(day) {
    const newSchedule = prompt("追加する予定を入力してください:");
    if (newSchedule) {
      if (!scheduleData[currentYear]) {
        scheduleData[currentYear] = {};
      }
      if (!scheduleData[currentYear][currentMonth]) {
        scheduleData[currentYear][currentMonth] = {};
      }
      if (!scheduleData[currentYear][currentMonth][day]) {
        scheduleData[currentYear][currentMonth][day] = [];
      }

      scheduleData[currentYear][currentMonth][day].push(newSchedule);
      localStorage.setItem('scheduleData', JSON.stringify(scheduleData));
      generateCalendar(currentYear, currentMonth); // カレンダーを再描画
      openModal(day); // モーダルも再描画
    }
  }

  // 月を変更するボタンの処理
  document.getElementById('prev-month').addEventListener('click', () => {
    currentMonth--;
    if (currentMonth < 0) {
      currentMonth = 11;
      currentYear--;
    }
    generateCalendar(currentYear, currentMonth);
  });

  document.getElementById('next-month').addEventListener('click', () => {
    currentMonth++;
    if (currentMonth > 11) {
      currentMonth = 0;
      currentYear++;
    }
    generateCalendar(currentYear, currentMonth);
  });

  // 初期カレンダーの生成
  generateCalendar(currentYear, currentMonth);

  // 登録した企業の確認ボタンの機能
  document.getElementById('view-companies').addEventListener('click', () => {
    window.location.href = 'list.html'; // 登録した企業の確認ページに遷移
  });

  // 企業情報入力ボタンの機能
  document.getElementById('input-company-info').addEventListener('click', () => {
    if (checkDesiredConditions()) {
      window.location.href = 'newcheck.html'; // 希望条件が入力されている場合に遷移
    }
  });

  // 希望条件入力ボタンの機能
  document.getElementById('input-desired-conditions').addEventListener('click', () => {
    window.location.href = 'newpage.html'; // 希望条件入力ページに遷移
  });

  // 希望条件が記入されているかをチェックする関数
  function checkDesiredConditions() {
    const savedConditions = localStorage.getItem('desiredConditions');
    if (!savedConditions || savedConditions.trim() === "") {
      alert("希望条件が入力されていません。");
      return false;
    }
    return true;
  }
});
