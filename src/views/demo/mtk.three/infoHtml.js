export function cgCaseInfoHtml(data) {
  let html = `
  <div class="info_Cgcontent" id="info_Cgcontent">
    <div class="main">
      <div class="caseTitle">案件编号:${data.caseNo}</div>
      <div class="areaName">${data.areaname}</div>
      <div class="imgs">
      </div>
      <div class="item">
        <div class="item_li">
          <div class="itel_li_top">案件状态</div>
          <div class="itel_li_bot">${data.status}</div>
        </div>
        <div class="item_li">
          <div class="itel_li_top">案件类型</div>
          <div class="itel_li_bot">${data.status}</div>
        </div>
        <div class="item_li">
          <div class="itel_li_top">上报人</div>
          <div class="itel_li_bot">${data.sbr}</div>
        </div>
        <div class="item_li">
          <div class="itel_li_top">上报时间</div>
          <div class="itel_li_bot">${data.casetime}</div>
        </div>
        <div class="item_li">
          <div class="itel_li_top">处置时限</div>
          <div class="itel_li_bot">${data.czsx}</div>
        </div>
        <div class="item_li">
          <div class="itel_li_top">上报时间</div>
          <div class="itel_li_bot">${data.casetime}</div>
        </div>
      </div>
    </div>
  </div>
  `;
  return html;
}
