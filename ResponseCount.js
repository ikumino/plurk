javascript:(function(){
  var $toTop = function (topEl) {
    window.document.documentElement.scrollTop = topEl.offsetTop;
    window.pageYOffset = topEl.offsetTop;
    document.body.scrollTop = topEl.offsetTop;
  };

  var $createResult = function (totalCount, allResult) {
    var style = document.createElement('style');
    style.innerHTML = `
    .response_info { border-bottom: 1px solid #CCC; }
    .response_info .result-count { padding: 5px; margin: 5px; }
    .response_info .search-sel { padding: 5px; margin: 5px; }
    .response_info .search-ipt { padding: 5px; margin: 5px; }
    .response_info .result-info button { margin-left: 5px; }
    .response_info #result-info { padding: 5px; margin: 5px; }
    .filtered-response { padding:5px; }
    `;
    document.body.appendChild(style);

    var selectArray = [];
    for (const item of allResult) {
      selectArray.push(
        `<option value="${item.name}" label="${item.name}(${item.count})">${item.name}(${item.count})</option>`
      );
    }

    var count = document.createElement('div');
    count.classList.add('result-count');
    count.innerHTML = '<b>實際回應人數(不含噗主)：</b>' + (totalCount - 1);
    document.querySelector('.response_info').appendChild(count);

    var info = document.createElement('div');
    info.classList.add('result-info');
    info.innerHTML = `
      <select class="search-sel"><option value="">請選擇ID名稱</option>${selectArray.join('')}</select>
      <input type="search" list="search-list" class="search-ipt" placeholder="請輸入ID名稱" />
      <datalist id="search-list">${selectArray.join('')}</datalist>
      <button type="button" class="search-btn">搜尋</button>
      <button type="button" class="clear-btn">清除結果</button>
      <div id="result-info"></div>
    `;
    document.querySelector('.response_info').appendChild(info);
  };

  var $getResponse = async function () {
    while (true) {
      var holder = document.querySelector('.load-older-holder');
      var btn = document.querySelector('.button.load-older');
      if (!holder || holder.classList.contains('hide') || !btn) break;
      btn.click();
      await new Promise(r => setTimeout(r, 800));
    }
  };

  if (document.querySelectorAll('#result-info').length === 0) {
    $getResponse().then(function () {

      var content = [];
      document.querySelectorAll('.text_holder').forEach((item, i)=>{
        content[i] = item;
      });

      var result = {};
      var total = 0;

      document.querySelectorAll('.name').forEach((item, i)=>{
        var name = item.innerText;
        if (!result[name]) {
          result[name] = { name, count: 0, content: [] };
          total++;
        }
        result[name].count++;
        result[name].content.push(content[i]);
      });

      $createResult(total, Object.values(result).sort((a,b)=>b.count-a.count));

      document.querySelector('.search-sel').addEventListener('change', e=>{
        document.querySelector('.search-ipt').value = e.target.value;
        document.querySelector('.search-btn').click();
      });

      document.querySelector('.search-btn').addEventListener('click', ()=>{
        var key = document.querySelector('.search-ipt').value;
        var box = document.getElementById('result-info');
        box.innerHTML = '';

        if (!key || !result[key]) return;

        box.insertAdjacentHTML('beforeend',
          `<div><b>回應人：</b>${key}</div>
           <div><b>回應次數：</b>${result[key].count}</div>
           <div style="margin-bottom:5px;"><b>回應內容：</b></div>`
        );

        result[key].content.forEach((node,i)=>{
          var wrap = document.createElement('div');
          wrap.style.background = (i%2===0)?'#EEE':'#FFF';
          wrap.className = 'filtered-response';

          // 🔥 關鍵：直接複製 DOM（保留表情符號）
          wrap.appendChild(node.cloneNode(true));
          box.appendChild(wrap);
        });

        $toTop(box);
      });

      document.querySelector('.clear-btn').addEventListener('click', ()=>{
        document.getElementById('result-info').innerHTML = '';
        document.querySelector('.search-ipt').value = '';
        document.querySelector('.search-sel').value = '';
      });
    });
  }
})();
