function DateLinkMapping(date, fill) {
    this.Date = date;
    if(!fill){
    	fill = false;
    }
    this.isfill = fill;
}
Date.prototype.format = function(format) {
	if(!format){
		format = 'yyyyMMdd';
	}
	var o = {
		"M+": this.getMonth() + 1, //month
		"d+": this.getDate(), //day
		"h+": this.getHours(), //hour
		"m+": this.getMinutes(), //minute
		"s+": this.getSeconds(), //second
		"q+": Math.floor((this.getMonth() + 3) / 3), //quarter
		"S": this.getMilliseconds() //millisecond
	}
	if (/(y+)/.test(format)) format = format.replace(RegExp.$1,
		(this.getFullYear() + "").substr(4 - RegExp.$1.length));
	for (var k in o) {
		if (new RegExp("(" + k + ")").test(format)){
			format = format.replace(RegExp.$1,
				RegExp.$1.length == 1 ? o[k] :
				("00" + o[k]).substr(("" + o[k]).length));
		}
	}
	return format;
}
var Calendar = {
	
    settings:
            {
                firstDayOfWeek: 1,
                baseClass: "calendar",
                curDayClass: "curDay curMonth",
                prevMonthCellClass: "prevMonth",
                nextMonthCellClass: "prevMonth",
                curMonthNormalCellClass: "curMonth",
                prevNextMonthDaysVisible: true,
            },
    containerId: "",
    weekDayNames: null,
    dateLinkMappings: [],
    Init: function(dateLinkMappings) {
        if (!this.weekDayNames ) {
        	this.weekDayNames = [];
            this.weekDayNames[1] = "一";
            this.weekDayNames[2] = "二";
            this.weekDayNames[3] = "三";
            this.weekDayNames[4] = "四";
            this.weekDayNames[5] = "五";
            this.weekDayNames[6] = "六";
            this.weekDayNames[7] = "日";
        } 
        if (dateLinkMappings) {
            this.dateLinkMappings = dateLinkMappings;
        }
        Calendar.RenderCalendar("calendar", new Date());
    },
    InitWeekSetting: function(weekDayNames, dateLinkMappings, settings) {
        if (!weekDayNames || weekDayNames.length && weekDayNames.length != 7) {
            this.weekDayNames[1] = "一";
            this.weekDayNames[2] = "二";
            this.weekDayNames[3] = "三";
            this.weekDayNames[4] = "四";
            this.weekDayNames[5] = "五";
            this.weekDayNames[6] = "六";
            this.weekDayNames[7] = "日";
        }
        else {
            this.weekDayNames = weekDayNames;
        }
        if (dateLinkMappings) {
            this.dateLinkMappings = dateLinkMappings;
        }
    },
    RenderCalendar: function(divId, date) {
    	var year = date.getFullYear(); //获取完整的年份(4位,1970-????) 
		var month = date.getMonth() + 1; //获取当前月份(0-11,0代表1月) 
        this.containerId = divId;
        var ht = [];
		ht.push(this.initYearStr(date));
		
        ht.push("<table class='", this.settings.baseClass, "' cellspacing='0' cellpadding='0' border='0'>");
        ht.push(this._RenderTitle(month, year));
        ht.push(this._RenderBody(month, year));
        ht.push("</table>");
        document.getElementById(divId).innerHTML = ht.join("");
    },
    initYearStr:function(myDate){
		var year = myDate.getFullYear(); //获取完整的年份(4位,1970-????) 
		var month = myDate.getMonth() + 1; //获取当前月份(0-11,0代表1月) 
		var date = myDate.getDate(); //获取当前日(1-31) 
		var day = myDate.getDay(); //获取当前星期X(0-6,0代表星期天) 
		if(month < 10){
			month = '0'+month;
		}
		if(date < 10){
			date = '0' + date;
		}
		if(day == 0){
			day = 7;
		}
		day = this.weekDayNames[day];
		var _html =
		'<div class="year">'+
			year + '-'+ month +'-'+ date +'<span>星期'+ day +'</span>'+
		'</div>';
		return _html;
	},
    _RenderTitle: function(month, year) {
        var ht = [];
        //星期
        ht.push("<tr  class='week' >");
        for (var i = 0; i < 7; i++) {
            var day = (i + this.settings.firstDayOfWeek) == 7 ? 7 : (i + this.settings.firstDayOfWeek) % 7;
            ht.push("<th >", this.weekDayNames[day], "</th>")
        }
        ht.push("</tr>");
        return ht.join("");
    },
    _RenderBody: function(month, year) {
        var date = new Date(year, month - 1, 1);
        var day = date.getDay();
        var dayOfMonth = 1;
        var daysOfPrevMonth = (7 - this.settings.firstDayOfWeek + day) % 7;
        var totalDays = this._GetTotalDays(month, year);
        var totalDaysOfPrevMonth = this._GetToalDaysOfPrevMonth(month, year);
        var ht = [];
        var curDate;

        for (var i = 0; ; i++) {
            curDate = null;
            if (i % 7 == 0) {//新起一行
                ht.push("<tr>");
            }
            ht.push("<td");
            if (i >= daysOfPrevMonth && dayOfMonth <= totalDays) {//本月
                curDate = new Date(year, month - 1, dayOfMonth);
                if (Date.parse(new Date().toDateString()) - curDate == 0) {
                    ht.push(" class=' day"+dayOfMonth+" ", this.settings.curDayClass, "'");
                }
                else {
                    ht.push(" class=' day"+dayOfMonth+" ", this.settings.curMonthNormalCellClass, "'");
                }
                dayOfMonth++;

            }
            else if (i < daysOfPrevMonth) {//上月
                if (this.settings.prevNextMonthDaysVisible) {
                    var prevMonth = month;
                    var prevYear = year;
                    if (month == 1) {
                        prevMonth = 12;
                        prevYear = prevYear - 1;
                    }
                    else {
                        prevMonth = prevMonth - 1;
                    }
                    curDate = new Date(prevYear, prevMonth - 1, totalDaysOfPrevMonth - (daysOfPrevMonth - i - 1));

                    ht.push(" class='", this.settings.prevMonthCellClass, "'");
                }
            }
            else {//下月
                if (this.settings.prevNextMonthDaysVisible) {
                    var nextMonth = month;
                    var nextYear = year;
                    if (month == 12) {
                        nextMonth = 1;
                        nextYear = prevYear + 1;
                    }
                    else {
                        nextMonth = nextMonth + 1;
                    }
                    curDate = new Date(nextYear, nextMonth - 1, i - dayOfMonth - daysOfPrevMonth + 2);
                    ht.push(" class='", this.settings.nextMonthCellClass, "'");
                }
            }
            ht.push(">");
            ht.push(this._BuildCell(curDate));
            ht.push("</td>");
            if (i % 7 == 6) {//结束一行
                ht.push("</tr>");
            }
            if (i % 7 == 6 && dayOfMonth - 1 >= totalDays) {
                break;
            }
        }
        return ht.join("");
    },
    _BuildCell: function(curDate) {
        var ht = [];
        if (curDate) {
            // if (this.dateLinkMappings[curDate.format()]) {
            //    // ht.push(curDate.getDate());
            //     if(this.dateLinkMappings[curDate.format()].fill == 1){
            //     	ht.push('<div class="td_sign_2" >'+ curDate.getDate() +'</div>');
            //     }else{
            //     	ht.push('<div class="td_sign_1" >'+ curDate.getDate() +'</div>');
            //     }
            // }else{
            	ht.push(curDate.getDate());
            // }
        }
        else {
            ht.push("&nbsp;");
        }
        return ht.join("");
    },
    //计算指定月的总天数
    _GetTotalDays: function(month, year) {
        if (month == 2) {
            if (this._IsLeapYear(year)) {
                return 29;
            }
            else {
                return 28;
            }
        }
        else if (month == 4 || month == 6 || month == 9 || month == 11) {
            return 30;
        }
        else {
            return 31;
        }
    },
    _GetToalDaysOfPrevMonth: function(month, year) {
        if (month == 1) {
            month = 12;
            year = year - 1;
        }
        else {
            month = month - 1;
        }
        return this._GetTotalDays(month, year);
    },
    //判断是否是闰年
    _IsLeapYear: function(year) {
        return year % 400 == 0 || (year % 4 == 0 && year % 100 != 0);
    }
};