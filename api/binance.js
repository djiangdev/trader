const axios = require('axios');
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
        showLog("Binance Copy Trading History Calling....");
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

module.exports.trade_history = trade_history;