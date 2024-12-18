<template>
  <div class="main">
    <div id="title" class="title" contenteditable="true"></div>
    <div class="bot">
      <div id="json" class="content" contenteditable="true"></div>
      <div class="export" @click="export2Excel">导出</div>
    </div>
  </div>
</template>
<script>
import $ from 'jquery'
import { export_json_to_excel } from './js/Export2Excel'
export default {
  name: 'jsontoexcel',
  data() {
    return {}
  },
  watch: {},
  mounted() {
    // this.export2Excel()
  },
  methods: {
    formatJson(filterVal, jsonData) {
      return jsonData.map((v) => filterVal.map((j) => v[j]))
    },
    export2Excel() {
      let titledom = document.getElementById('title')
      let dom = document.getElementById('json')
      let list = eval('(' + dom.innerText + ')')
      if (!Array.isArray(list)) return
      require.ensure([], () => {
        // const tHeader = ['商品名称', '商品货号', '售价', '库存', '销量', '分享']
        let tHeader = []
        if ($.trim(titledom.innerText) == '') tHeader = Object.keys(list[0])
        else tHeader = titledom.innerText.split(',')
        // const filterVal = [
        //   'name',
        //   'number',
        //   'salePrice',
        //   'stocknums',
        //   'salesnums',
        //   'sharenums',
        // ]
        let filterVal = Object.keys(list[0])
        const data = this.formatJson(filterVal, list)
        export_json_to_excel(tHeader, data, 'jsonToExcel')
      })
    },
  },
}
</script>

<style lang="less" scoped>
.main {
  width: 100%;
  height: 100vh;
  background: #fff;
  display: flex;
  justify-content: center;
  // align-items: center;
  flex-flow: column;
  .title {
    width: 50%;
    height: 5%;
    padding: 20px;
    border-radius: 30px 0 0 30px;
    box-shadow: 0 20px 20px rgba(0, 0, 0, 0.2), 0px 0px 20px rgba(0, 0, 0, 0.2);
    margin-left: 14%;
    margin-top: 1%;
  }
  .bot {
    width: 100%;
    height: 100%;
    display: flex;
    justify-content: space-evenly;
    align-items: center;
    .content {
      width: 50%;
      height: 60%;
      padding: 20px;
      background: #fff;
      border-radius: 30px 0 0 30px;
      box-shadow: 0 20px 20px rgba(0, 0, 0, 0.2),
        0px 0px 50px rgba(0, 0, 0, 0.2);
      overflow: hidden;
      overflow-y: auto;
    }
    .export {
      width: 80px;
      height: 35px;
      border-radius: 8px;
      background: rgb(7, 12, 83);
      color: #fff;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
    }
  }

  [contenteditable]:focus {
    outline: none;
  }
  ::-webkit-scrollbar {
    /*滚动条整体样式*/
    width: 5px;
    /*高宽分别对应横竖滚动条的尺寸*/
    height: 5px;
  }

  ::-webkit-scrollbar-thumb {
    /*滚动条里面小方块*/
    border-radius: 5px;
    -webkit-box-shadow: inset 0 0 3px #00d8ff;
    background: #fe9600;
  }

  ::-webkit-scrollbar-track {
    /*滚动条里面轨道*/
    -webkit-box-shadow: inset 0 0 3px #eee;
    border-radius: 5px;
    background: #ededed;
  }
}
</style>
