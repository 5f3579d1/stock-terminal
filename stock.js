var request = require('request');
var gbk = require('gbk');
var chalk = require('chalk');
var term = require('terminal-kit').terminal;

var config = {
    stocks: ['s_sh000001', 'sz399006', 'sh601857', 'sh601901', 'sh601288'],
    timeout: 3,
    getUrl: function () {
        return 'http://hq.sinajs.cn/list=' + this.stocks.join(',')
    }
}

var stocker = {
    run: function () {
        request({url: config.getUrl(), encoding: null},
            function (error, response, body) {
                if (!error && response.statusCode == 200) {
                    stocker.parseRes(gbk.toString('utf-8', body))
                }
            }
        )
    },
    parseRes: function (content) {
        var resultArr = content.split(";")
        for (var i = 0; i < resultArr.length; i++) {
            var result = resultArr[i]
            var dataStr = result.substring(result.indexOf("=") + 2, result.length - 1)
            var datas = dataStr.split(',')

            var stockName = datas[0]
            //上证指数
            if (result.indexOf("sh000001") > -1) {
                if (datas[3] > 0) {
                    console.log(chalk.red("%s\t%s\t%s(%s\%)"), stockName, datas[1], datas[2], datas[3])
                } else {
                    console.log(chalk.green("%s\t%s\t%s(%s\%)"), stockName, datas[1], datas[2], datas[3])
                }
            } else {
                if (!stockName.trim()) continue

                var yesteday = datas[2]
                var current = datas[3]
                var change = current - yesteday
                if (change > 0) {
                    term.red('%s\t%s\t%s (%s\%)\n', stockName, current, stocker.format(change), this.format(change / yesteday * 100))
                } else {
                    term.green('%s\t%s\t%s (%s\%)\n', stockName, current, stocker.format(change), this.format(change / yesteday * 100))
                }
            }
        }
    },
    riseMsg: function () {
        stocker.logMsg('rise')
    },
    fallMsg: function () {
        stocker.logMsg('fall')
    },
    logMsg: function () {
        var model = arguments[0]
        var colorful
        if (model === 'rise') {
            colorful = chalk.styles.red
        } else if (model === 'fall') {
            colorful = chalk.styles.green
        } else {
            colorful = chalk.styles.white
        }
    },
    format: function (num) {
        return num.toFixed(2)
    }
}

stocker.run()
//setInterval(function () {
//    term.clear()
//    stocker.run()
//}, config.timeout * 1000)


