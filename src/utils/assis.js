export function GetTime(type) {
    let date = new Date();
    let month = date.getMonth() + 1;
    let day = date.getDate();
    let hour = date.getHours();
    let minutes = date.getMinutes();
    let second = date.getSeconds();
    month = month.toString().length < 2 ? `0${month}` : month;
    day = day.toString().length < 2 ? `0${day}` : day;
    hour = hour.toString().length < 2 ? `0${hour}` : hour;
    minutes = minutes.toString().length < 2 ? `0${minutes}` : minutes;
    second = second.toString().length < 2 ? `0${second}` : second;
    let time = `${date.getFullYear()}/${month}/${day} ${hour}:${minutes}:${second}`;
    if (type === 'time') {
        time = `${hour}:${minutes}'${second}"`;
    }

    return time;
}
function padLeftZero(str) {
    return ('00' + str).substr(str.length);
}
export function formatTime(time) {
    var hourNum, minNum, secNum, hourStr, minStr, secStr, dayStr;
  if (time === "" || time === null || time === undefined) {
    return ""
  } else {
    var timeArray = time.split(":");
    //判断是否带天数(1.01:02:03)(01:02:03)
    timeArray.forEach((item, index) => {
      //含有.表示有天数  
      //先格式化分和秒
      if (index == 1) {
        minNum = parseInt(item);
        if (minNum == 0) {
          minStr = "";
        }else{
            minStr = minNum + "分";   
        }
      } else if (index == 2) {
        //sec为0不显示,大于0加上“秒”文字
        secNum = parseInt(item);
        if (secNum == 0) {
          secStr = "";
        }else{
            secStr = secNum + "秒"; 
        }
      }
      //判断天数是否存在
      if (index == 0 && item.indexOf(".") > -1) {
        var timeDayArray = item.split(".");
        if (parseInt(timeDayArray[0]) > 0) {
          //当天数不为0，格式化天
          dayStr= parseInt(timeDayArray[0]) + "天"
        }
        //当有天数时且hour不为0,格式化时
        if(parseInt(timeDayArray[1]) == 0){
            hourStr = "";
        }else{
            hourStr = parseInt(timeDayArray[1]) + "小时"
        }
        // return dayStr+hourStr + minStr + secStr

      } else if(index == 0 && item.indexOf(".") == -1){
        
        //不含有.表示没有天数
          //hour为0不显示,大于0加上“小时”文字
          hourNum = parseInt(item);
          if (hourNum == 0) {
            hourStr = ""
          } else {
            hourStr = hourNum + "小时";  
          } 
      }

    })
    if(dayStr===undefined){
        return hourStr + minStr + secStr
    }else {
        return dayStr+hourStr + minStr + secStr
    }
   
  }

}

export function formatDate(date, fmt) {
    if (/(y+)/.test(fmt)) {
        fmt = fmt.replace(RegExp.$1, (date.getFullYear() + '').substr(4 - RegExp.$1.length));
    }
    let o = {
        'M+': date.getMonth() + 1,
        'd+': date.getDate(),
        'h+': date.getHours(),
        'm+': date.getMinutes(),
        's+': date.getSeconds()
    };
    for (let k in o) {
        if (new RegExp(`(${k})`).test(fmt)) {
            let str = o[k] + '';
            fmt = fmt.replace(RegExp.$1, (RegExp.$1.length === 1) ? str : padLeftZero(str));
        }
    }
    return fmt;
};

// 随机产生随机整数
export function randomNum(len) {
    let Num = '';
    for (let i = 0; i < len; i++) {
        Num += Math.floor(Math.random() * 10);
    }
    return Num;
}

// 数组随机排序
Array.prototype.shuffle = function () {
    let _this = this;
    this.re = [];
    this.t = this.length;
    for (let i = 0; i < this.t; i++) {
        (function (i) {
            let temp = _this;
            let m = Math.floor(Math.random() * temp.length);
            _this.re[i] = temp[m];
            _this.splice(m, 1);
        })(i)
    }
    return this.re
}

// 产生随机验证码
export function randomCode(len, num) {
    const numArray = new Array(0, 1, 2, 3, 4, 5, 6, 7, 8, 9);
    const codeArray = new Array('A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z');
    let verfiyCode = "";
    for (let i = 0; i < num; i++) {
        const index = Math.floor(Math.random() * 10);
        verfiyCode += numArray[index];
    }
    for (let i = 0; i < (len - num); i++) {
        const index = Math.floor(Math.random() * 26);
        verfiyCode += codeArray[index];
    }
    const randomSort = verfiyCode.split('').shuffle();
    return randomSort.join('');
}

// 随机生成姓名
export function randomName() {
    const familyNames = new Array("赵", "钱", "孙", "李", "周", "吴", "郑", "王", "冯", "陈", "褚", "卫", "蒋", "沈", "韩", "杨", "朱", "秦", "尤", "许", "何", "吕", "施", "张", "孔", "曹", "严", "华", "金", "魏", "陶", "姜", "戚", "谢", "邹", "喻", "柏", "水", "窦", "章", "云", "苏", "潘", "葛", "奚", "范", "彭", "郎", "鲁", "韦", "昌", "马", "苗", "凤", "花", "方", "俞", "任", "袁", "柳", "酆", "鲍", "史", "唐", "费", "廉", "岑", "薛", "雷", "贺", "倪", "汤", "滕", "殷", "罗", "毕", "郝", "邬", "安", "常", "乐", "于", "时", "傅", "皮", "卞", "齐", "康", "伍", "余", "元", "卜", "顾", "孟", "平", "黄", "和", "穆", "萧", "尹");
    const len=familyNames.length;
    const index= Math.floor(Math.random()*len);
    const num=Math.floor(Math.random()*2)+1;
    let name=familyNames[index];
    for(let i=0;i<num;i++){
        name+="*";
    };
    return name
}
