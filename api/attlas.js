const axios = require('axios');
const logger = require('node-color-log');
logger.setLevel("info");
logger.setDate(() => (moment()).format('LTS'));

const clientid = 'web_496357dded346c293d1188b86225e9b9';
const authorization = 'eyJhbGciOiJIUzUxMiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiJYMkhCVjZLUnBZWDJOY1FmS0tVMiIsInVzZXJJZCI6ImI3ZTY1ODZlZGU1NDhmMDgyNTE4MDNhM2FiOWQ3NzNiNzU3MTQzYTJiYjA3Nzc1ODUyOGE3ZjU0MTNjM2VkM2RjZmFkNTUxMjQ1MzQ5NjUxZTFiODhmZDhiYjU4MDFmYUNPSlFQWXZuTnhsN0dDUlZZejFPaWc9PSIsInNob3VsZFJlZnJlc2hBZnRlciI6OTAwMDAwLCJpYXQiOjE3MDU3NDg0OTAsImV4cCI6MTcwNjk1ODA5MCwiYXVkIjoid2ViIiwiaXNzIjoiYmFja2VuZCJ9.4_48tBKld1fXT_JOeb9vXbIFg_c2Et0u1oB9-N3G3Kb6xuRgf8shK-a_UfkBnf_s20v_mi6dt0MBe95twRDMog';

async function get_positions() {
    try {
        let config = {
            method: 'get',
            maxBodyLength: Infinity,
            url: 'https://api.attlas.io/api/v1/futures/open_position?envType=demo&isTestnet=false',
            headers: { 
                'clientid': clientid, 
                'Authorization': authorization, 
                'Content-Type': 'application/json'
            }
        };
        const response = await axios.request(config);
        return response.data;
    } catch (error) {
        logger.error(JSON.stringify(error.response.data));
        return error;
    }
}

async function set_margin_mode() {
    try {
        let config = {
            method: 'put',
            maxBodyLength: Infinity,
            url: 'https://api.attlas.io/api/v1/futures/user_margin_mode',
            data : JSON.stringify({
                "isLiteMode": false,
                "marginMode": "",
                "envType": "demo"
            }),
            headers: { 
                'clientid': clientid, 
                'Authorization': authorization, 
                'Content-Type': 'application/json'
            }
        };
        const response = await axios.request(config);
        return response.data;
    } catch (error) {
        logger.error(JSON.stringify(error.response.data));
        return error;
    }
}

async function set_leverage(symbol, leverage) {
    try {
        let config = {
            method: 'post',
            maxBodyLength: Infinity,
            url: 'https://api.attlas.io/api/v1/futures/leverage/by_user',
            headers: { 
                'clientid': clientid, 
                'Authorization': authorization, 
                'Content-Type': 'application/json'
            },
            data : JSON.stringify({
                "symbol": symbol,
                "leverage": leverage,
                "envType": "demo"
            })
        };

        const response = await axios.request(config);
        return response.data;
    } catch (error) {
        logger.error(JSON.stringify(error.response.data));
        return error;
    }
}

async function open_order(symbol, side, volume, tp = false, sl = false, type = 'MARKET') {
    try {
        let data = {
            "symbol": symbol,
            "side": side,
            "type": type,
            "quoteOrderQty": volume,
            "isClosePosition": false,
            "envType": "demo"
        };

        if (tp) {
            data.tp = {
                "price": -1,
                "type": "MARK_PRICE",
                "percent": String(tp)
            };
        }

        if (sl) {
            data.sl = {
                "price": -1,
                "type": "MARK_PRICE",
                "percent": String(sl)
            };
        }

        let config = {
            method: 'post',
            maxBodyLength: Infinity,
            url: 'https://api.attlas.io/api/v1/futures/order',
            headers: { 
                'clientid': clientid, 
                'Authorization': authorization, 
                'Content-Type': 'application/json'
            },
            data : JSON.stringify(data)
        };

        const response = await axios.request(config);
        return response.data;
    } catch (error) {
        logger.error(JSON.stringify(error.response.data));
        return error;
    }
}

async function close_order(symbol, side, quantity = 9999, type = 'MARKET') {
    try {
        let config = {
            method: 'post',
            maxBodyLength: Infinity,
            url: 'https://api.attlas.io/api/v1/futures/order',
            headers: { 
                'clientid': clientid, 
                'Authorization': authorization, 
                'Content-Type': 'application/json'
            },
            data : JSON.stringify({
                "symbol": symbol,
                "side": side,
                "type": type,
                "quantity": quantity,
                "isClosePosition": true,
                "envType": "demo"
            })
        };

        const response = await axios.request(config);
        return response.data;
    } catch (error) {
        logger.error(JSON.stringify(error.response.data));
        return error;
    }
}

module.exports.get_positions = get_positions;
module.exports.set_margin_mode = set_margin_mode;
module.exports.set_leverage = set_leverage;
module.exports.open_order = open_order;
module.exports.close_order = close_order;