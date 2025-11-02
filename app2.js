// ユーザー提供のテスト用プロトコル
const protocol = [
  { task: "順応（５分）", duration: 3 }, //5m
  { task: "安静状態の測定（１０分）", duration: 6 }, //10m
  { task: "「あいうえお」を連続発声（３０秒）", duration: 3 }, //30s
  { task: "トレッドミルへ移動・準備（１０秒）", duration: 1 }, //10s
  { task: "トレッドミル歩行 4km/h（５分）", duration: 3 },//5m 
  { task: "休憩（３分）", duration: 1 }, //3m
  { task: "トレッドミル早歩き 7km/h（５分）", duration: 3 }, //5m
  { task: "椅子へ移動・準備（１０秒）", duration: 1 }, //10s
  { task: "回復状態の測定（５分）", duration: 3 },//5m 
];

let currentTaskIndex = 0; 
let timerId = null; 

let eventLog = []; 
let nextTaskTimestamp = 0;

const taskDisplay = document.getElementById('task-display');
const nexttaskDisplay = document.getElementById('nexttask-display')
const timeDisplay = document.getElementById('time-display');
const startButton = document.getElementById('start-button');
const downloadButton = document.getElementById('download-button');
const formLink = document.getElementById('form-link');

// スタート前の初期表示
updateDisplay(protocol[currentTaskIndex].duration);

// ログ記録関数 (YYYY-MM-DD HH:MM:SS.ms 形式)
function logEvent(taskName) {
    const now = new Date();
    
    // YYYY-MM-DD
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0'); // 月は0から始まるため +1
    const day = String(now.getDate()).padStart(2, '0');
    
    // HH:MM:SS.f
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    const milliseconds = String(now.getMilliseconds()).padStart(3, '0');
    
    // 結合
    const timestamp = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}.${milliseconds}`;

    eventLog.push({ 
        task: taskName, 
        timestamp: timestamp
    });
    // console.log(`Logged: ${taskName} at ${timestamp}`);
}

// スタートボタンが押された時の処理
startButton.addEventListener('click', () => {
  startButton.disabled = true; 
  startButton.style.display = 'none';

  const startTime = Date.now();
  nextTaskTimestamp = startTime + protocol[currentTaskIndex].duration * 1000;

  logEvent(protocol[currentTaskIndex].task);

  timerId = setInterval(() => {
    const remainingMilliseconds = nextTaskTimestamp - Date.now();
    const remainingSeconds = Math.max(0, Math.round(remainingMilliseconds / 1000));

    updateDisplay(remainingSeconds);
    
    if (remainingMilliseconds <= 0) {
      currentTaskIndex++;
      
      if (currentTaskIndex >= protocol.length) {
        clearInterval(timerId);
        taskDisplay.innerHTML = "タスクはすべて終了しました<br>お疲れさまでした！";
        nexttaskDisplay.textContent = "";
        timeDisplay.textContent = "Complete!";
        downloadButton.style.display = 'block'; 
        formLink.style.display = 'block';
        return;
      }
      
      nextTaskTimestamp += protocol[currentTaskIndex].duration * 1000;
      logEvent(protocol[currentTaskIndex].task);
    }
  }, 100);
});

// 画面表示を更新する関数
function updateDisplay(remainingSeconds) {
  const currentTask = protocol[currentTaskIndex];
  taskDisplay.textContent = currentTask.task;

  if (currentTaskIndex + 1 >= protocol.length) {
    nexttaskDisplay.textContent = "終了";
  }
  else{
    const nextTask = protocol[currentTaskIndex + 1];
    nexttaskDisplay.textContent = "次のタスク: " + nextTask.task;
  }
  
  const minutes = Math.floor(remainingSeconds / 60);
  const seconds = remainingSeconds % 60;
  
  timeDisplay.textContent = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

// ダウンロードボタンが押された時の処理
downloadButton.addEventListener('click', () => {
    let csvContent = "\uFEFF"; 
    csvContent += "Task_Name,Timestamp\r\n"; 

    eventLog.forEach(row => {
        const taskName = `"${row.task.replace(/"/g, '""')}"`; 
        csvContent += `${taskName},${row.timestamp}\r\n`;
    });

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "log.csv"); // ユーザー指定のファイル名
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    
    link.click();
    
    document.body.removeChild(link);
});