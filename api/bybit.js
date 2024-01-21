const axios = require('axios');
const crypto = require('crypto');
const logger = require('node-color-log');
logger.setLevel("info");
logger.setDate(() => (moment()).format('LTS'));

const url=process.env.BYBIT_API_URI;
const apiKey = process.env.BYBIT_API_KEY;
const secret = process.env.BYBIT_API_SECRET;
const recvWindow = Date.now();
const timestamp = Date.now().toString();

async function place_order(data) {
    try {
        var endpoint = '/v5/order/create';
        var sign = crypto.createHmac('sha256', secret).update(timestamp + apiKey + recvWindow + data).digest('hex');
        var fullendpoint = url + endpoint;

        var headers = {
            'X-BAPI-SIGN-TYPE': '2',
            'X-BAPI-SIGN': sign,
            'X-BAPI-API-KEY': apiKey,
            'X-BAPI-TIMESTAMP': timestamp,
            'X-BAPI-RECV-WINDOW': recvWindow.toString()  
        };

        headers['Content-Type'] = 'application/json; charset=utf-8';

        var config = {
            method: 'POST',
            url: fullendpoint,
            headers: headers,
            data: data
        };

        const response = await axios(config);
        return response.data;
    } catch (error) {
        logger.error(JSON.stringify(error.response.data));
        return error;
    }
}

async function get_positions() {
    try {
        var endpoint = '/v5/position/list';
        var data = 'category=linear&settleCoin=USDT';
        var sign = crypto.createHmac('sha256', secret).update(timestamp + apiKey + recvWindow + data).digest('hex');
        var fullendpoint = url + endpoint + "?" + data;
        data = "";

        var headers = {
            'X-BAPI-SIGN-TYPE': '2',
            'X-BAPI-SIGN': sign,
            'X-BAPI-API-KEY': apiKey,
            'X-BAPI-TIMESTAMP': timestamp,
            'X-BAPI-RECV-WINDOW': recvWindow.toString()  
        };

        var config = {
            method: 'GET',
            url: fullendpoint,
            headers: headers,
            data: data
        };

        const response = await axios(config);
        return response.data;
    } catch (error) {
        logger.error(JSON.stringify(error.response.data));
        return error;
    }
}

async function get_ticker(symbol) {
    try {
        var endpoint="/v5/market/tickers";
        var data = 'category=linear&symbol=' + symbol;
        var sign = crypto.createHmac('sha256', secret).update(timestamp + apiKey + recvWindow + data).digest('hex');
        var fullendpoint = url + endpoint + "?" + data;
        data = "";

        var headers = {
            'X-BAPI-SIGN-TYPE': '2',
            'X-BAPI-SIGN': sign,
            'X-BAPI-API-KEY': apiKey,
            'X-BAPI-TIMESTAMP': timestamp,
            'X-BAPI-RECV-WINDOW': recvWindow.toString()  
        };

        var config = {
            method: 'GET',
            url: fullendpoint,
            headers: headers,
            data: data
        };

        const response = await axios(config);
        return response.data;
    } catch (error) {
        logger.error(JSON.stringify(error.response.data));
        return error;
    }
}

module.exports.get_ticker = get_ticker;
module.exports.place_order = place_order;
module.exports.get_positions = get_positions;