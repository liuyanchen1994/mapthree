<template>
  <div
    class="main"
    v-loading="loading"
    element-loading-text="网格查询中"
    element-loading-spinner="el-icon-loading"
    element-loading-background="rgba(0, 0, 0, 0.3)"
  >
    {{ objStr }}
  </div>
</template>
<script>
import * as maptalks from 'maptalks'
import proj4 from 'proj4'
import gcoord from 'gcoord'
import bjdata from './by_part'
import { export_json_to_excel } from './js/Export2Excel'
//获取柏堰部件的网格数据
export default {
  name: 'exceltojson',
  data() {
    return {
      objStr: '',
      loading: true,
    }
  },
  watch: {},
  mounted() {
    let fwdata = bjdata
    let arrs = []
    for (let i = 0; i < fwdata.length; i++) {
      let item = fwdata[i]
      let bdcoord = JSON.parse(item.shape)
      let gridcoord = gcoord.transform(
        [bdcoord.x, bdcoord.y], // 经纬度坐标
        gcoord['BD09'], // 当前坐标系
        gcoord['WGS84'] // 目标坐标系
      )
      gridcoord[0] = gridcoord[0] + 0.0056772908
      gridcoord[1] = gridcoord[1] - 0.001779447348
      let url = `http://112.28.216.83:6080/arcgis/rest/services/bycg/QH/MapServer/1/query?&where=1=1&geometry={"x":${gridcoord[0]},"y":${gridcoord[1]},"spatialReference":{"wkid":4326}}&geometryType=esriGeometryPoint&inSR=&spatialRel=esriSpatialRelIntersects&relationParam=&objectIds=&time=&returnCountOnly=false&returnGeometry=true&maxAllowableOffset=&outSR=&text=&outFields=*&f=pjson`
      maptalks.Ajax.getJSON(
        url,
        {
          jsonp: true,
        },
        (obj, data) => {
          if (data.features.length) {
            let attr = data.features[0].attributes
            fwdata[i].bgid = attr.wgbm
          } else {
            fwdata[i].bgid = ''
          }
          arrs.push(fwdata[i])
          if (i == fwdata.length - 1) {
            this.objStr = JSON.stringify(arrs)
            this.download(arrs)
            this.loading = false
          }
        }
      )
    }
  },
  methods: {
    formatJson(filterVal, jsonData) {
      return jsonData.map((v) => filterVal.map((j) => v[j]))
    },
    download(list) {
      require.ensure([], () => {
        let tHeader = ["id", "bgid", "bjtype", "shape"]
        tHeader = Object.keys(list[0])
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
  overflow: auto;
}
</style>
