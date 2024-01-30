const { MongoClient, ServerApiVersion } = require('mongodb');
const crypto = require('crypto');
const axios = require('axios');
const express = require('express');
const cron = require('node-cron');
const bybitAPI = require('../api/bybit');
const Func = require('../functions');
const moment = require('moment-timezone');
moment.tz.setDefault('Asia/Ho_Chi_Minh');
const logger = require('node-color-log');
const logger1 = logger.createNamedLogger("BYB");
logger1.setDate(() => moment().format('YYYY-MM-DD HH:mm:ss'));

const dbUri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.lugbagm.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(dbUri, {
    serverApi: {
      version: ServerApiVersion.v1,
      strict: true,
      deprecationErrors: true,
    }
});

const topCoins = Func.get_market_pairs();
const coinInfo = Func.get_coin_info();
let myBudget = 100; // USDT
let maxAmountPerOrder = 0.5; // USDT
let maxContracts = 10; // 10
let currentPositions = [];
let logs = [];

const MASTERS = [
  {
    id: 'P1cpCCNXNWpBB2rf1K3%2B5Q%3D%3D',
    name: 'ITEKCrypto',
    balance: 60000,
    scale: 1,
  },
  {
    id: 'htpm4zupMaKsMeFz%2ByOBTA%3D%3D',
    name: 'FutureCapital',
    balance: 1600,
    scale: 0.8,
  },
  {
    id: 'UZ1FFmepTc0jl7sV%2FlesSw%3D%3D',
    name: 'Bitcorp',
    balance: 1500,
    scale: 0.5,
  },
];

(async () => {
    await client.connect();
    await Func.get_positions();
    const db = client.db('bybit');

    cron.schedule('*/5 * * * * *', async () => {
      currentPositions = Func.list_positions();
    });

    cron.schedule('*/15 * * * * *', async () => {
      for (let index = 0; index < MASTERS.length; index++) {
        const item = MASTERS[index];
        placeOrder(db, item.id, item.balance, item.leverage, item.scale);
        // takeProfit(db, item.id);
      }
    });
})();

async function placeOrder(db, masterId, budget, leverage = false, scale = 1) {
    const listDetail = await http_request_master('/order/list-detail',"GET",'leaderMark='+masterId+'&pageSize=10&page=1',"Bybit Copy Open Orders");
    if(listDetail && listDetail.result.data && listDetail.result.data.length) {
        await Promise.all(listDetail.result.data.map( async (x, index) => {
            x.sort_time = moment().unix();
            x.createdAtE3 = moment(new Date(Number(x.createdAtE3))).unix();
            if (!topCoins.includes(x.symbol)) return;
            let coin = coinInfo.find(z => x.symbol == z.symbol);
            if (!coin) return;
            let lever = x.leverageE2/100;
            leverage = leverage ? leverage : lever;
            leverage = (leverage > coin.maxLeverage) ? coin.maxLeverage : leverage;
            let masterSize = Number(x.sizeX)/100000000;
            masterSize = formatSize(masterSize, coin.minSize);
            let masterAmount = (masterSize*x.entryPrice)/leverage;
            let masterRate = (masterAmount/budget)*100;
            let myAmount = (masterRate*myBudget)/100;
            if (myAmount > maxAmountPerOrder) myAmount = maxAmountPerOrder;
            let mySize = (scale*myAmount*leverage)/x.entryPrice;
            mySize = (mySize < coin.minSize) ? coin.minSize : mySize;
            mySize = formatSize(mySize, coin.minSize);
            myAmount = (mySize*x.entryPrice)/leverage;
            // let myRate = (myAmount*100)/myBudget;
            // return console.log(get_master(masterId).name, x.symbol, myRate+'%', mySize, myAmount);
            const [checkOrderExists, positionByMasters] = await Promise.all([
              db.collection('orders').find({side: x.side, symbol: x.symbol, createdAtE3: x.createdAtE3}).toArray(),
              db.collection('positions').find({master_id: masterId, symbol: x.symbol, side: x.side}).toArray()
            ]);
            if (!checkOrderExists.length) {
                const exist = currentPositions.find(z => z.symbol == x.symbol && z.side == x.side);
                if (exist) {
                  if (!positionByMasters.length) return;
                  const ticker = await bybitAPI.get_ticker(x.symbol);
                  const lastPrice = ticker.result.list ? ticker.result.list[0].lastPrice : x.entryPrice;
                  if (!isDCA(masterId, x.symbol, x.side, exist.avgPrice, lastPrice)) {
                    return;
                  }
                }
                db.collection('orders').insertMany([x]);
                let promises = [
                  db.collection('positions').insertMany([{master_id: masterId, symbol: x.symbol, side: x.side, sort_time: x.sort_time}]),
                ];
                if (exist) {
                  Func.show_order_log('BYT', get_master(masterId).name, x.symbol, x.side, leverage, coin.minSize, masterSize, mySize, masterAmount, x.entryPrice, myBudget);
                  promises.push(
                    http_request_order('/v5/order/create', 'POST', '{"category":"linear","symbol":"'+x.symbol+'","side": "'+x.side+'","orderType": "Market","qty": "'+mySize+'","positionIdx":'+exist.positionIdx+'}')
                  );
                } else {
                  const positionIdx = (x.side == 'Buy') ? 1 : 2;
                  const [ ticker ] = await Promise.all([
                    bybitAPI.get_ticker(x.symbol),
                    bybitAPI.set_leverage(x.symbol, leverage),
                  ]);
                  let lastPrice = ticker.result.list ? ticker.result.list[0].lastPrice : x.entryPrice;
                  lastPrice = Func.formatSize(lastPrice, coin.minPrice);
                  // const takeProfitPrice = Func.get_take_profit_price(coin, x.side, mySize, myAmount, lastPrice);
                  const stopLossPrice = Func.get_stop_loss_price(coin, x.side, mySize, myAmount, lastPrice);
                  Func.show_order_log('BYT', get_master(masterId).name, x.symbol, x.side, leverage, coin.minSize, masterSize, mySize, masterAmount, x.entryPrice, myBudget, lastPrice);
                  promises.push(
                    http_request_order('/v5/order/create', 'POST', '{"category":"linear","symbol":"'+x.symbol+'","side": "'+x.side+'","orderType": "Limit","price":"'+lastPrice+'","qty": "'+mySize+'","positionIdx":'+positionIdx+',"stopLoss": "'+stopLossPrice+'"}')
                  );
                }
                await Promise.all(promises);
            }
        }));
    }
}

async function takeProfit(db, masterId) {
  const leaderHistory = await http_request_master('/leader-history',"GET",'page=1&leaderMark='+masterId,"Bybit Copy Close Positions");
  if(leaderHistory && leaderHistory.result.data.length) {
    const histories = distinct(leaderHistory.result.data, ['closedTimeE3']);
    await Promise.all(histories.map( async (x, index) => {
      x.sort_time = moment().unix();
      x.startedTimeE3 = moment(new Date(Number(x.startedTimeE3))).unix();
      x.closedTimeE3 = moment(new Date(Number(x.closedTimeE3))).unix();
      const [checkHistoryExists, positionByMasters] = await Promise.all([
        db.collection('history').find({side: x.side, symbol: x.symbol, closedTimeE3: x.closedTimeE3}).toArray(),
        db.collection('positions').find({master_id: masterId, symbol: x.symbol, side: x.side}).toArray()
      ]);
      if (!checkHistoryExists.length && positionByMasters.length) {
        const exist = currentPositions.find(z => z.symbol == x.symbol && z.side == x.side);
        if (exist) {
          // insert database & close order
          const placeSide = (exist.side == 'Buy') ? 'Sell' : 'Buy';
          await Promise.all([
            http_request_order('/v5/order/create', 'POST', '{"category":"linear","symbol":"'+x.symbol+'","side": "'+placeSide+'","orderType": "Market","qty": "'+exist.size+'","positionIdx":'+exist.positionIdx+',"reduceOnly":true}', 'Close order'),
            closeOpenOrders(exist.symbol, exist.side),
          ]);
          db.collection('history').insertMany([x]);
          db.collection('positions').deleteMany({ master_id: masterId, symbol: x.symbol, side: x.side });
          setTimeout( async () => {
            const pnl = await bybitAPI.get_pnl(x.symbol);
            const ROI = Func.get_real_roi(pnl);
            Func.show_history_log('BYT', get_master(masterId).name, x.symbol, x.side, exist.leverage, x.positionEntryPrice, pnl.result.list[0].avgExitPrice, x.orderNetProfitRateE4/100, '%', ROI, '%');
          }, 1000);
        } else {
          db.collection('history').insertMany([x]);
          await closeOpenOrders(x.symbol, x.side);
        }
      }
    }));
  }
};

async function http_request_master(endpoint,method,data,Info=false) {
    try {
        var fullendpoint;

        // Build the request URL based on the method
        if (method === "POST") {
            fullendpoint = 'https://api2.bybitglobal.com/fapi/beehive/public/v1/common' + endpoint + '?timestamp=' + (new Date()).getTime();
        } else {
            fullendpoint = 'https://api2.bybitglobal.com/fapi/beehive/public/v1/common' + endpoint + "?" + data + '&timestamp=' + (new Date()).getTime();
            data = "";
        }

        var headers = {
            'Cookie': process.env.COOKIES_BYBIT,
            'Cache-Control': 'no-cache',
        };

        if (method === "POST") {
            headers['Content-Type'] = 'application/json; charset=utf-8';
        }

        var config = {
            method: method,
            url: fullendpoint,
            headers: headers,
            data: data
        };

        showLog(Info + " Calling....");
        const response = await axios(config);
        return response.data;
    } catch (error) {
        logger.info(JSON.stringify(error));
    }
}

async function http_request_order(endpoint,method,data,Info=false) {
    try {
        const apiKey = process.env.BYBIT_API_KEY;
        const secret = process.env.BYBIT_API_SECRET;
        const recvWindow = Date.now();
        const timestamp = Date.now().toString();

        var sign = crypto.createHmac('sha256', secret).update(timestamp + apiKey + recvWindow + data).digest('hex');
        var fullendpoint;

        // Build the request URL based on the method
        if (method === "POST") {
            fullendpoint = process.env.BYBIT_API_URI + endpoint;
        } else {
            fullendpoint = process.env.BYBIT_API_URI + endpoint + "?" + data;
            data = "";
        }

        var headers = {
            'X-BAPI-SIGN-TYPE': '2',
            'X-BAPI-SIGN': sign,
            'X-BAPI-API-KEY': apiKey,
            'X-BAPI-TIMESTAMP': timestamp,
            'X-BAPI-RECV-WINDOW': recvWindow.toString()  
        };

        if (method === "POST") {
            headers['Content-Type'] = 'application/json; charset=utf-8';
        }

        var config = {
            method: method,
            url: fullendpoint,
            headers: headers,
            data: data
        };

        const response = await axios(config);
        return response.data;
    } catch (error) {
        logger.error(JSON.stringify(error));
    }
}

async function setLeverage(symbol, leverage = 20) {
    try {
        const endpoint="/v5/position/set-leverage";
        const data = `{"category":"linear","symbol":"${symbol}","buyLeverage":"${leverage}","sellLeverage":"${leverage}"}`;
        return await http_request(endpoint,"POST",data,"Set Leverage");
    } catch (error) {
        
    }
}

async function listPositions() {
  const list = await bybitAPI.get_positions();
  if (list && list.result.list.length) {
      currentPositions = list.result.list;
  }
  return currentPositions;
}

async function closeOpenOrders(symbol, side) {
  try {
    let requestData = [];
    const open_orders = await bybitAPI.open_orders(symbol);
    if (open_orders && open_orders.result.list && open_orders.result.list.length) {
      open_orders.result.list.forEach(z => {
        if (z.symbol == symbol && z.side == side) {
          requestData.push({ symbol: z.symbol, orderId: z.orderId });
        }
      });
    }
    if (requestData.length) {
      await bybitAPI.cancel_orders(requestData);
    }
    return true;
  } catch (error) {
    logger.error(JSON.stringify(error));
    return error;
  }
}

function filterData(results) {
  let max = maxContracts - currentPositions.length;

  let list = [];
  for (let index = 0; index < max; index++) {
      if (results[index]) list.push(results[index]);
  }

  return list;
}

function distinct(arr, fields = []) {
    result = arr.filter(function (a) {
        var key = a.symbol + '|' + a.side;
        if (fields.length) {
            fields.forEach(x => {
                key = key + '|' + a[x];
            });
        }
        if (!this[key]) {
            this[key] = true;
            return true;
        }
    }, Object.create(null));
    return result;
}

function showLog(message, type = false) {
    const check = logs.find(t => t == message);
    if (!check) {
        logs.push(message);
        switch (type) {
            case 'success':
              logger1.success(message);
                break;

            case 'info':
              logger1.info(message);
                break;

            case 'warn':
                logger1.warn(message);
                break;

            case 'error':
              logger1.error(message);
                break;

            case 'debug':
              logger1.debug(message);
                break;
        
            default:
              logger1.log(message);
                break;
        }
    }
}

function formatSize(size, stepSize) {
    if(Math.floor(stepSize) === stepSize) return size.toFixed(0);
    const countDecimals = stepSize.toString().split(".")[1].length || 0; 
    return size.toFixed(countDecimals);
}

function isDCA(masterId, symbol, side, entryPrice, lastPrice) {
    if (
        (side == 'Sell' && Number(lastPrice) <= Number(entryPrice)) ||
        (side == 'Buy' && Number(lastPrice) >= Number(entryPrice))
    ) {
      showLog('['+get_master(masterId).name+'] '+symbol+'('+side+'): (My Entry: '+entryPrice+') không nên vào lúc này', 'warn');
      return false;
    }
    return true;
}

function get_master(id) {
  return MASTERS.find(x => x.id == id);
}

