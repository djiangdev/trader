const axios = require('axios');
axios.defaults.timeout = 0;
const crypto = require('crypto');
const moment = require('moment-timezone');
moment.tz.setDefault('Asia/Ho_Chi_Minh');
const logger = require('node-color-log');
logger.setDate(() => moment().format('LTS'));

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
        logger.error(JSON.stringify(error));
        return error;
    }
}

async function set_leverage(symbol, leverage) {
    try {
        var endpoint = '/v5/position/set-leverage';
        var data = '{"category":"linear","symbol":"'+symbol+'","buyLeverage":"'+leverage+'","sellLeverage":"'+leverage+'"}';
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
        logger.error(JSON.stringify(error));
        return error;
    }
}

async function set_trailing_stop(symbol, trailingStop, price, positionIdx) {
    try {
        var endpoint = '/v5/position/trading-stop';
        var data = '{"category":"linear","symbol":"'+symbol+'","trailingStop":"'+trailingStop+'","activePrice":"'+price+'","positionIdx":'+positionIdx+'}';
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
        logger.error(JSON.stringify(error));
        return error;
    }
}

async function get_positions(symbol = '') {
    try {
        var endpoint = '/v5/position/list';
        var data = 'category=linear&settleCoin=USDT&limit=100&symbol='+symbol;
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
        logger.error(JSON.stringify(error));
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
        logger.error(JSON.stringify(error));
        return error;
    }
}

async function get_pnl(symbol) {
    try {
        var endpoint="/v5/position/closed-pnl";
        var data = 'category=linear&settleCoin=USDT&limit=1&symbol=' + symbol;
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
        logger.error(JSON.stringify(error));
        return error;
    }
}

async function open_orders(symbol) {
    try {
        var endpoint="/v5/order/realtime";
        var data = 'category=linear&settleCoin=USDT&symbol=' + symbol;
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
        logger.error(JSON.stringify(error));
        return error;
    }
}

async function cancel_orders(request) {
    try {
        var endpoint = '/v5/order/cancel-batch';
        var data = '{"category":"linear", "request":'+JSON.stringify(request)+'}';
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
        logger.error(JSON.stringify(error));
        return error;
    }
}

async function get_instrument(symbol) {
    try {
        var endpoint="/v5/market/instruments-info";
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
        logger.error(JSON.stringify(error));
        return error;
    }
}

async function open_fmartingale_bot() {
    try {
        var endpoint = 'https://api2-2-testnet.bybit.com/contract/v5/private/fmartingalebot/create-fmart-bot?_sp_category=fbu&_sp_business=usdt&_sp_response_format=portugal';
        var data = JSON.stringify({
            "symbol":"GALAUSDT",
            "martingale_mode":"F_MART_MODE_MARTINGALE_MODE_LONG",
            "leverage":"3",
            "add_position_percent":"1.2",
            "add_position_num":6,
            "round_tp_percent":"0.08",
            "price_float_percent":"0.048",
            "init_margin":"0.2",
            "entry_price":"",
            "auto_cycle_toggle":"AUTO_CYCLE_TOGGLE_AUTO_CYCLE_TOGGLE_ENABLE",
            "source":"F_MART_SOURCE_DERIVATIVES_PAGE"
        });
        var sign = crypto.createHmac('sha256', secret).update(timestamp + apiKey + recvWindow + data).digest('hex');

        var headers = {
            'X-BAPI-SIGN-TYPE': '2',
            'X-BAPI-SIGN': sign,
            'X-BAPI-API-KEY': apiKey,
            'X-BAPI-TIMESTAMP': timestamp,
            'X-BAPI-RECV-WINDOW': recvWindow.toString(),
            'Cookie': '_by_l_g_d=a93a2b95-0761-00fc-275d-9ffcf50f897c; sajssdk_2015_cross_new_user=1; deviceId=a7014345-ee73-c467-42c5-e42da481e6fa; detection_time=1706400000000; _gcl_au=1.1.228491906.1706322309; _fbp=fb.1.1706322309904.1054108539; _tt_enable_cookie=1; _ttp=uGpGbJNLYXDsWi2oOjqbkcjYl_p; _ym_uid=170632231236902273; _ym_d=1706322312; _ym_isad=2; BYBIT_REG_REF_testnet={"lang":"vi","g":"a93a2b95-0761-00fc-275d-9ffcf50f897c","medium":"direct","url":"https://testnet.bybit.com/user/assets/home/fiat","last_refresh_time":"Sat, 27 Jan 2024 02:58:40 GMT"}; BYBIT_REG_REF_prod={"lang":"vi","g":"a93a2b95-0761-00fc-275d-9ffcf50f897c","referrer":"www.bing.com/","source":"bing.com","medium":"other","url":"https://learn.bybit.com/vi/trading/what-is-martingale-strategy/","last_refresh_time":"Sat, 27 Jan 2024 03:48:16 GMT"}; _gid=GA1.2.1181982756.1706327302; 35CJa4376-ref=organic|search|Bing|bing.com|1706327302272; permutive-id=81bee528-8c63-417a-8be6-52bbc4b7c701; sensorsdata2015jssdkcross=%7B%22distinct_id%22%3A%22100502334%22%2C%22first_id%22%3A%2218d48bb71b6dd-039a9550d6a1f52-4c657b58-1049088-18d48bb71b7290%22%2C%22props%22%3A%7B%22%24latest_traffic_source_type%22%3A%22%E7%9B%B4%E6%8E%A5%E6%B5%81%E9%87%8F%22%2C%22%24latest_search_keyword%22%3A%22%E6%9C%AA%E5%8F%96%E5%88%B0%E5%80%BC_%E7%9B%B4%E6%8E%A5%E6%89%93%E5%BC%80%22%2C%22%24latest_referrer%22%3A%22%22%2C%22_a_u_v%22%3A%220.0.6%22%7D%2C%22identities%22%3A%22eyIkaWRlbnRpdHlfY29va2llX2lkIjoiMThkNDhiYjcxYjZkZC0wMzlhOTU1MGQ2YTFmNTItNGM2NTdiNTgtMTA0OTA4OC0xOGQ0OGJiNzFiNzI5MCIsIiRpZGVudGl0eV9sb2dpbl9pZCI6IjEwMDUwMjMzNCJ9%22%2C%22history_login_id%22%3A%7B%22name%22%3A%22%24identity_login_id%22%2C%22value%22%3A%22100502334%22%7D%2C%22%24device_id%22%3A%2218d48bb71b6dd-039a9550d6a1f52-4c657b58-1049088-18d48bb71b7290%22%7D; _ga=GA1.1.1952246361.1706322310; _ga_LEBL6PF94W=GS1.1.1706327301.1.1.1706328482.0.0.0; _ga_SPS4ND2MGC=GS1.1.1706328200.2.1.1706328638.15.0.0; bm_sz=577DFDC3C8475AC687BFC8FEB077F062~YAAQJzNDGxv3KxGNAQAAR4SBSRZ8cCJYs7EDAjWha61cH10DMMxQrV+UJqqa2HsqkxK/bG0toEHTGYvXOoROANc8eBDFZ/QeqNrtkDIZAxDg6TAJEPptm+J1wNdb4rf+DmiDiDlZtbL+6jHMb0LoNR4sZlZ0Mluy5dY1pSmP+bDjuGx0yjcYMudtwLuGOp0Et1yTpuWi0SQKfXnD3TPLONRHtKDaykXe20mZFOqooIly0p1QYGcny5N0y/Hy1mzBuq8pCbrMpE7CPms96dt4TfCQcx8reXllBdKp8SHbdNE8nhdnw+EXFPQmWuLfKBQ/HDfM4kyA/w3JNiPJX5THlfohtYyksDkwfMdQiDjB1g/68R+PmQ==~3684663~4604995; ak_bmsc=2021D6FB706F12A2BAFD5C2A33B48786~000000000000000000000000000000~YAAQJzNDG8ygLBGNAQAAdVoFShaJYQim/A5zklFe8okzA19CWXNRccNgrwZmTAmIbFuvUtwpRm/WgX7GBK3W/w6F6VMTmKErxdU1dBa+tHZQLmx1Oi5J3Yo5d9kHYyTmjIL5LgkxT8xo6zpWhn7OzdlpSeR8oSpAN8G1Rp5P2z3lw+QmLT2MzRf1PpbPrDrMO3KnjQrjFLHNngVR9sLlzGsszAGzCP5IHvGkx3RLrSFicO+198ADJrbWOaRhLcJHu+0i0OMAhb9WI+u8h3HPOhmURoQxLWNy/h7EJ94/8NzVJuTmAq9eFq8vWUzNbVHvBLqAw0k5uoSTGRv+NnnYJJMVWn4AyKrc6KZmv/wsGA1HbGlcUJptEdBgFCzDD69AMtFHRfC3gNLK; secure-token-testnet=eyJhbGciOiJFUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoxMDA1MDIzMzQsImIiOjAsInAiOjMsImdlbl90cyI6MTcwNjM0NjA1NCwiZXhwIjoxNzA2NjA1MjU0LCJucyI6IiIsImV4dCI6eyJTdGF0aW9uLVR5cGUiOiIiLCJtY3QiOiIxNzA1NDc0Mjc2Iiwic2lkIjoiQllCSVQifX0.bNqmEcsabzjlumAa8Hv7o7AGeeL7huWFen6180OJNolOgkCZMM6uX1dWtzaS1S1G7eNYDUz2IzcOKmm_IxhlYg; b_t_c_k_testnet=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoxMDA1MDIzMzQsImIiOjAsInAiOjMsImdlbl90cyI6MTcwNjM0NjA1NCwiZXhwIjoxNzA2NjA1MjU0LCJucyI6IiIsImV4dCI6eyJTdGF0aW9uLVR5cGUiOiIiLCJtY3QiOiIxNzA1NDc0Mjc2Iiwic2lkIjoiQllCSVQifX0.GkxjKc8zyG0w-0Fom_azYoqhTUez_OsNytm3G6PX-Ao; _abck=97E49531BB96EC001FD8BFC83F4220D1~-1~YAAQJzNDG/vGLBGNAQAAojY4SgsoY2awpyK7DaRbTM7EVMUmJmmuH2h35JePUPILqNAgZK5L/jM/f1RxkRAHiJT8rS4wydb0IaFjtuNdMZob2AUKfd/1qQUy2f/H3xwTIgZbWplWNs/H8ui1cYr2/VThRH/N/6/CZqgAoeFu5j83VqqWH1ja2rJuwPRvFFSlx/XiLABsSbgLST6S3I1rrVE3Q2RzuxLXKGxuVx/bIpU5bYmXJJRgdj1JeunM/O62sx/hYo3ppL9lHwR8oTDQlfS3ZgsMhuK3p8nCTOUJureh0JM1Onf1cucCAMbNCSsOCeSPfZeTAc6eh9rPGJArXUBwyM+GYptl6zmOylt0DdgfVMXB4SBXuIZQsDEkXUs=~-1~-1~-1; bm_sv=1B5113BEEB45DF3941577AFD235F8013~YAAQJzNDG/zGLBGNAQAAojY4Sha0qRvwz/66O02shMCeu/5yBE7GXB/00lKE67L+mRYdWDrZBX4qfPlSLHEI3h6svF0/IhoZ8oQUL9AC7ndZ4/XlLHBmEQh/T/CxYfgQnSoAv+tuehsu6Xwgkw6rnQdG3D3VNGeEPAduwwEylUTXdPS3UUq7bgaTtKCq2D9o2tSg+nDg1eYKa/uHbDj2ZSfBDtt9AbEYh1NFQUV7L4+BhgeTI+CgLtXKVwtrc2Sjcg==~1',
        };

        headers['Content-Type'] = 'application/json; charset=utf-8';

        var config = {
            method: 'POST',
            url: endpoint,
            headers: headers,
            data: data
        };

        const response = await axios(config);
        return response.data;
    } catch (error) {
        logger.error(JSON.stringify(error));
        return error;
    }
}

async function close_fmartingale_bot() {
    try {
        var endpoint = 'https://api2-2-testnet.bybit.com/contract/v5/private/fmartingalebot/close-fmart-bot?_sp_category=fbu&_sp_business=usdt&_sp_response_format=portugal';
        var data = JSON.stringify({"bot_id":"497976349995052021"});
        var sign = crypto.createHmac('sha256', secret).update(timestamp + apiKey + recvWindow + data).digest('hex');

        var headers = {
            'X-BAPI-SIGN-TYPE': '2',
            'X-BAPI-SIGN': sign,
            'X-BAPI-API-KEY': apiKey,
            'X-BAPI-TIMESTAMP': timestamp,
            'X-BAPI-RECV-WINDOW': recvWindow.toString(),
            'Cookie': '_by_l_g_d=a93a2b95-0761-00fc-275d-9ffcf50f897c; sajssdk_2015_cross_new_user=1; deviceId=a7014345-ee73-c467-42c5-e42da481e6fa; detection_time=1706400000000; _gcl_au=1.1.228491906.1706322309; _fbp=fb.1.1706322309904.1054108539; _tt_enable_cookie=1; _ttp=uGpGbJNLYXDsWi2oOjqbkcjYl_p; _ym_uid=170632231236902273; _ym_d=1706322312; _ym_isad=2; BYBIT_REG_REF_testnet={"lang":"vi","g":"a93a2b95-0761-00fc-275d-9ffcf50f897c","medium":"direct","url":"https://testnet.bybit.com/user/assets/home/fiat","last_refresh_time":"Sat, 27 Jan 2024 02:58:40 GMT"}; BYBIT_REG_REF_prod={"lang":"vi","g":"a93a2b95-0761-00fc-275d-9ffcf50f897c","referrer":"www.bing.com/","source":"bing.com","medium":"other","url":"https://learn.bybit.com/vi/trading/what-is-martingale-strategy/","last_refresh_time":"Sat, 27 Jan 2024 03:48:16 GMT"}; _gid=GA1.2.1181982756.1706327302; 35CJa4376-ref=organic|search|Bing|bing.com|1706327302272; permutive-id=81bee528-8c63-417a-8be6-52bbc4b7c701; sensorsdata2015jssdkcross=%7B%22distinct_id%22%3A%22100502334%22%2C%22first_id%22%3A%2218d48bb71b6dd-039a9550d6a1f52-4c657b58-1049088-18d48bb71b7290%22%2C%22props%22%3A%7B%22%24latest_traffic_source_type%22%3A%22%E7%9B%B4%E6%8E%A5%E6%B5%81%E9%87%8F%22%2C%22%24latest_search_keyword%22%3A%22%E6%9C%AA%E5%8F%96%E5%88%B0%E5%80%BC_%E7%9B%B4%E6%8E%A5%E6%89%93%E5%BC%80%22%2C%22%24latest_referrer%22%3A%22%22%2C%22_a_u_v%22%3A%220.0.6%22%7D%2C%22identities%22%3A%22eyIkaWRlbnRpdHlfY29va2llX2lkIjoiMThkNDhiYjcxYjZkZC0wMzlhOTU1MGQ2YTFmNTItNGM2NTdiNTgtMTA0OTA4OC0xOGQ0OGJiNzFiNzI5MCIsIiRpZGVudGl0eV9sb2dpbl9pZCI6IjEwMDUwMjMzNCJ9%22%2C%22history_login_id%22%3A%7B%22name%22%3A%22%24identity_login_id%22%2C%22value%22%3A%22100502334%22%7D%2C%22%24device_id%22%3A%2218d48bb71b6dd-039a9550d6a1f52-4c657b58-1049088-18d48bb71b7290%22%7D; _ga=GA1.1.1952246361.1706322310; _ga_LEBL6PF94W=GS1.1.1706327301.1.1.1706328482.0.0.0; _ga_SPS4ND2MGC=GS1.1.1706328200.2.1.1706328638.15.0.0; bm_sz=577DFDC3C8475AC687BFC8FEB077F062~YAAQJzNDGxv3KxGNAQAAR4SBSRZ8cCJYs7EDAjWha61cH10DMMxQrV+UJqqa2HsqkxK/bG0toEHTGYvXOoROANc8eBDFZ/QeqNrtkDIZAxDg6TAJEPptm+J1wNdb4rf+DmiDiDlZtbL+6jHMb0LoNR4sZlZ0Mluy5dY1pSmP+bDjuGx0yjcYMudtwLuGOp0Et1yTpuWi0SQKfXnD3TPLONRHtKDaykXe20mZFOqooIly0p1QYGcny5N0y/Hy1mzBuq8pCbrMpE7CPms96dt4TfCQcx8reXllBdKp8SHbdNE8nhdnw+EXFPQmWuLfKBQ/HDfM4kyA/w3JNiPJX5THlfohtYyksDkwfMdQiDjB1g/68R+PmQ==~3684663~4604995; ak_bmsc=2021D6FB706F12A2BAFD5C2A33B48786~000000000000000000000000000000~YAAQJzNDG8ygLBGNAQAAdVoFShaJYQim/A5zklFe8okzA19CWXNRccNgrwZmTAmIbFuvUtwpRm/WgX7GBK3W/w6F6VMTmKErxdU1dBa+tHZQLmx1Oi5J3Yo5d9kHYyTmjIL5LgkxT8xo6zpWhn7OzdlpSeR8oSpAN8G1Rp5P2z3lw+QmLT2MzRf1PpbPrDrMO3KnjQrjFLHNngVR9sLlzGsszAGzCP5IHvGkx3RLrSFicO+198ADJrbWOaRhLcJHu+0i0OMAhb9WI+u8h3HPOhmURoQxLWNy/h7EJ94/8NzVJuTmAq9eFq8vWUzNbVHvBLqAw0k5uoSTGRv+NnnYJJMVWn4AyKrc6KZmv/wsGA1HbGlcUJptEdBgFCzDD69AMtFHRfC3gNLK; secure-token-testnet=eyJhbGciOiJFUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoxMDA1MDIzMzQsImIiOjAsInAiOjMsImdlbl90cyI6MTcwNjM0NjA1NCwiZXhwIjoxNzA2NjA1MjU0LCJucyI6IiIsImV4dCI6eyJTdGF0aW9uLVR5cGUiOiIiLCJtY3QiOiIxNzA1NDc0Mjc2Iiwic2lkIjoiQllCSVQifX0.bNqmEcsabzjlumAa8Hv7o7AGeeL7huWFen6180OJNolOgkCZMM6uX1dWtzaS1S1G7eNYDUz2IzcOKmm_IxhlYg; b_t_c_k_testnet=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoxMDA1MDIzMzQsImIiOjAsInAiOjMsImdlbl90cyI6MTcwNjM0NjA1NCwiZXhwIjoxNzA2NjA1MjU0LCJucyI6IiIsImV4dCI6eyJTdGF0aW9uLVR5cGUiOiIiLCJtY3QiOiIxNzA1NDc0Mjc2Iiwic2lkIjoiQllCSVQifX0.GkxjKc8zyG0w-0Fom_azYoqhTUez_OsNytm3G6PX-Ao; _abck=97E49531BB96EC001FD8BFC83F4220D1~-1~YAAQJzNDG/vGLBGNAQAAojY4SgsoY2awpyK7DaRbTM7EVMUmJmmuH2h35JePUPILqNAgZK5L/jM/f1RxkRAHiJT8rS4wydb0IaFjtuNdMZob2AUKfd/1qQUy2f/H3xwTIgZbWplWNs/H8ui1cYr2/VThRH/N/6/CZqgAoeFu5j83VqqWH1ja2rJuwPRvFFSlx/XiLABsSbgLST6S3I1rrVE3Q2RzuxLXKGxuVx/bIpU5bYmXJJRgdj1JeunM/O62sx/hYo3ppL9lHwR8oTDQlfS3ZgsMhuK3p8nCTOUJureh0JM1Onf1cucCAMbNCSsOCeSPfZeTAc6eh9rPGJArXUBwyM+GYptl6zmOylt0DdgfVMXB4SBXuIZQsDEkXUs=~-1~-1~-1; bm_sv=1B5113BEEB45DF3941577AFD235F8013~YAAQJzNDG/zGLBGNAQAAojY4Sha0qRvwz/66O02shMCeu/5yBE7GXB/00lKE67L+mRYdWDrZBX4qfPlSLHEI3h6svF0/IhoZ8oQUL9AC7ndZ4/XlLHBmEQh/T/CxYfgQnSoAv+tuehsu6Xwgkw6rnQdG3D3VNGeEPAduwwEylUTXdPS3UUq7bgaTtKCq2D9o2tSg+nDg1eYKa/uHbDj2ZSfBDtt9AbEYh1NFQUV7L4+BhgeTI+CgLtXKVwtrc2Sjcg==~1',
        };

        headers['Content-Type'] = 'application/json; charset=utf-8';

        var config = {
            method: 'POST',
            url: endpoint,
            headers: headers,
            data: data
        };

        const response = await axios(config);
        return response.data;
    } catch (error) {
        logger.error(JSON.stringify(error));
        return error;
    }
}

module.exports.get_pnl = get_pnl;
module.exports.get_ticker = get_ticker;
module.exports.get_instrument = get_instrument;
module.exports.open_orders = open_orders;
module.exports.cancel_orders = cancel_orders;
module.exports.place_order = place_order;
module.exports.set_leverage = set_leverage;
module.exports.get_positions = get_positions;
module.exports.set_trailing_stop = set_trailing_stop;
module.exports.open_fmartingale_bot = open_fmartingale_bot;
module.exports.close_fmartingale_bot = close_fmartingale_bot;