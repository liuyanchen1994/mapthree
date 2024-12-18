<template>
  <div class="smain">
    <div class="left">
      <el-form ref="form" :model="form" label-width="100px">
        <el-form-item label="服务地址">
          <el-input v-model="form.url"></el-input>
        </el-form-item>
        <el-form-item label="查询条件">
          <el-input v-model="form.where"></el-input>
        </el-form-item>
        <el-form-item label="返回字段">
          <el-input v-model="form.outfield"></el-input>
        </el-form-item>
        <el-form-item label="只返回总数">
          <el-radio-group v-model="form.returnCount">
            <el-radio label="是"></el-radio>
            <el-radio label="否"></el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="返回结果" v-if="form.returnCount == '否'">
          <el-input v-model="form.results" disabled></el-input>
        </el-form-item>
        <el-form-item label="excel表名">
          <el-input v-model="form.excelName"></el-input>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="query">查询</el-button>
        </el-form-item>
      </el-form>
    </div>
    <div class="right">
      <div class="count" v-if="form.returnCount == '是'">
        总数: <span>{{ form.count }}</span>
      </div>
      <div class="table" v-if="form.returnCount == '否' && tableData.length">
        <el-table :data="tableData" height="750" border style="width: 100%">
          <el-table-column
            v-for="item in columns"
            :prop="item.prop"
            :label="item.label"
            :key="item.prop"
            width="180"
          >
          </el-table-column>
        </el-table>
      </div>
    </div>
    <div
      class="export"
      v-if="form.returnCount == '否' && tableData.length"
      @click="export2Excel"
    >
      导出Excel
    </div>
  </div>
</template>
<script>
import $ from 'jquery'
import { export_json_to_excel } from './js/Export2Excel'
import ajaxApi from './js/ajax'
//查询地图服务数据+导出
export default {
  name: 'serviceDataToExcel',
  data() {
    return {
      form: {
        url: '',
        where: '1=1',
        outfield: '*',
        returnCount: '否',
        results: '0 条',
        count: 0,
        excelName: 'ToExcel',
      },
      tableData: [],
      columns: [],
    }
  },
  watch: {},
  mounted() {
    // this.export2Excel()
  },
  methods: {
    query() {
      this.columns = []
      this.tableData = []
      this.form.count = 0
      this.form.results = '0 条'
      let url = `${this.form.url}/query?where=${this.form.where}&outFields=${
        this.form.outfield
      }&returnCountOnly=${
        this.form.returnCount == '是' ? true : false
      }&text=&objectIds=&time=&geometry=&geometryType=esriGeometryEnvelope&inSR=&spatialRel=esriSpatialRelIntersects&relationParam=&returnGeometry=true&maxAllowableOffset=&geometryPrecision=&outSR=&returnIdsOnly=false&orderByFields=&groupByFieldsForStatistics=&outStatistics=&returnZ=false&returnM=false&gdbVersion=&returnDistinctValues=false&f=pjson`
      new ajaxApi().jsonp(url, (err, data) => {
        if (this.form.returnCount == '是') {
          this.form.count = data.count
          return
        }
        if (!data || !data.features.length) return
        let result = data.features
        this.form.results = result.length + ' 条'
        result.forEach((item) => {
          // if (item.geometry.x) {
          //   item.attributes.x = item.geometry.x
          //   item.attributes.y = item.geometry.y
          //   item.attributes.geometryType = 'point'
          // } else if (item.geometry.rings) {
          //   item.attributes.rings = JSON.stringify(item.geometry.rings)
          //   item.attributes.geometryType = 'polygon'
          // } else if (item.geometry.paths) {
          //   item.attributes.paths = JSON.stringify(item.geometry.paths)
          //   item.attributes.geometryType = 'polyline'
          // }
          this.tableData.push(item.attributes)
        })
        let keys = Object.keys(this.tableData[0])
        keys.forEach((x) => {
          this.columns.push({
            prop: x,
            label: x,
          })
        })
      })
    },
    formatJson(filterVal, jsonData) {
      return jsonData.map((v) => filterVal.map((j) => v[j]))
    },
    export2Excel() {
      let list = this.tableData
      if (!Array.isArray(list)) return
      require.ensure([], () => {
        let tHeader = []
        tHeader = Object.keys(list[0])
        let filterVal = Object.keys(list[0])
        const data = this.formatJson(filterVal, list)
        export_json_to_excel(
          tHeader,
          data,
          this.form.excelName || 'jsonToExcel'
        )
      })
    },
  },
}
</script>

<style lang="less">
.smain {
  width: 100%;
  height: 100vh;
  background: #fff;
  display: flex;
  justify-content: space-evenly;
  align-items: center;
  transition: all 0.5s;
  .left {
    width: 30%;
    min-height: 60vh;
    padding: 20px;
    border-radius: 15px;
    box-shadow: 0 20px 20px rgba(0, 0, 0, 0.2), 0px 0px 50px rgba(0, 0, 0, 0.2);
  }
  .right {
    width: 50%;
    height: 80vh;

    display: flex;
    justify-content: center;
    align-items: center;
    padding: 20px;
    border-radius: 15px;
    box-shadow: 0 20px 20px rgba(0, 0, 0, 0.2), 0px 0px 50px rgba(0, 0, 0, 0.2);
    .count {
      font-size: 16px;
      span {
        color: #fe9600;
        font-weight: bold;
      }
    }
    .table {
      width: 100%;
      height: 100%;
      overflow-y: auto;
      overflow-x: auto;
    }
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
  .el-form-item__label,
  .el-radio__label {
    color: #606266 !important;
  }
  [contenteditable]:focus {
    outline: none;
  }
  ::-webkit-scrollbar {
    /*滚动条整体样式*/
    width: 5px;
    /*高宽分别对应横竖滚动条的尺寸*/
    height: 10px;
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
