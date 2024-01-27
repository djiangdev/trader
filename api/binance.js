const axios = require('axios');
axios.defaults.timeout = 30000;
const moment = require('moment-timezone');
moment.tz.setDefault('Asia/Ho_Chi_Minh');
const logger = require('node-color-log');
logger.setDate(() => moment().format('LTS'));

let logs = [];

async function trade_history(portfolioId) {
    try {
        let config = {
            method: 'post',
            maxBodyLength: Infinity,
            url: 'https://www.binance.com/bapi/futures/v1/public/future/copy-trade/lead-portfolio/trade-history?timestamp=' + (new Date()).getTime(),
            headers: { 
                'Content-Type': 'application/json'
            },
            data: JSON.stringify({
                pageNumber: 1,
                pageSize: 50,
                portfolioId: portfolioId
            })
        };
        showLog("Binance Copy Open Orders Calling....");
        const response = await axios.request(config);
        return response.data;
    } catch (error) {
        logger.error(JSON.stringify(error));
        return error;
    }
}

async function position_history(portfolioId) {
    try {
        let config = {
            method: 'post',
            maxBodyLength: Infinity,
            url: 'https://www.binance.com/bapi/futures/v1/public/future/copy-trade/lead-portfolio/position-history?timestamp=' + (new Date()).getTime(),
            headers: { 
                'Content-Type': 'application/json'
            },
            data: JSON.stringify({
                pageNumber: 1,
                pageSize: 20,
                portfolioId: portfolioId
            })
        };
        showLog("Binance Copy Close Positions Calling....");
        const response = await axios.request(config);
        return response.data;
    } catch (error) {
        logger.error(JSON.stringify(error));
        return error;
    }
}

async function copy_traders(timeRange = '7D', dataType = 'ROI') {
    try {
        let config = {
            method: 'post',
            maxBodyLength: Infinity,
            url: 'https://www.binance.com/bapi/futures/v1/friendly/future/copy-trade/home-page/query-list?timestamp=' + (new Date()).getTime(),
            headers: { 
                'Content-Type': 'application/json'
            },
            data: JSON.stringify({
                "pageNumber": 1,
                "pageSize": 100,
                "timeRange": timeRange,
                "dataType": dataType,
                "favoriteOnly": false,
                "hideFull": false,
                "nickname": "",
                "order": "DESC"
            })
        };
        const response = await axios.request(config);
        return response.data;
    } catch (error) {
        logger.error(JSON.stringify(error));
        return error;
    }
}

function showLog(message, type = false) {
    const check = logs.find(t => t == message);
    if (!check) {
        logs.push(message);
        switch (type) {
            case 'success':
                logger.success(message);
                break;

            case 'info':
                logger.info(message);
                break;

            case 'warn':
                logger.warn(message);
                break;

            case 'error':
                logger.error(message);
                break;
        
            default:
                logger.log(message);
                break;
        }
    }
}

module.exports.copy_traders = copy_traders;
module.exports.trade_history = trade_history;
module.exports.position_history = position_history;