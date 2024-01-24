const { MongoClient, ServerApiVersion } = require('mongodb');
const axios = require('axios');
const express = require('express');
const router = express.Router();
const cron = require('node-cron');
const moment = require('moment-timezone');
moment.tz.setDefault('Asia/Ho_Chi_Minh');
const Func = require('../functions');
const attlasAPI = require('../api/attlas');
const bybitAPI = require('../api/bybit');
const binanceAPI = require('../api/binance');
const logger = require('node-color-log');
const logger1 = logger.createNamedLogger("BNB");
logger1.setDate(() => moment().format('YYYY-MM-DD HH:mm:ss'));

const dbUri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.lugbagm.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(dbUri, {
    serverApi: {
      version: ServerApiVersion.v1,
      strict: true,
      deprecationErrors: true,
    }
});

const minSizes = Func.get_coin_sizes();
let myBudget = 50; // USDT
let scaleRate = 1; // % Master
let maxContracts = 10; // 10
let maxAmountPerOrder = 0.5; // USDT
let currentPositions = [];
let logs = [];

const MASTERS = [
  {
    id: '3782690787637792000',
    name: 'SnowAlex',
    leverage: 20,
    balance: 35000,
  }
];

(async () => {
    await Promise.all([
      client.connect(),
      listPositions()
    ])

    const db = client.db('binance');

    cron.schedule('*/30 * * * * *', async () => {
        listPositions();
    });

    cron.schedule('*/8 * * * * *', async () => {
      for (let index = 0; index < MASTERS.length; index++) {
        const item = MASTERS[index];
        placeOrder(db, item.id, item.balance, item.leverage);
      }
    });
})();

async function placeOrder(db, masterId, budget, leverage = 10) {
    const result = await binanceAPI.trade_history(masterId);
    if (result.success && result.data.list.length) {
        takeProfit(db, result.data.list, masterId);
        var noProfits = result.data.list.filter(x => x.realizedProfit == 0);
        const data = await filterData(db, noProfits);
        if (data.length) {
            await Promise.all(data.map( async (x, index) => {
                x.sort_time = moment().unix();
                let symbol = x.order.split('/')[0];
                let side = x.order.split('/')[1];
                let time = x.order.split('/')[2];
                let price = result.data.list.find(k => symbol == k.symbol && side == k.side)['price'];
                let coin = minSizes.find(z => symbol == z.symbol);
                if (!coin) return;
                let masterSize = x.qty;
                let masterAmount = (masterSize*price)/leverage;
                let masterRate = (masterAmount/budget)*100;
                let myAmount = (masterRate*myBudget)/100;
                let mySize = (scaleRate*myAmount*leverage)/price;
                side = (side == 'BUY') ? 'Buy' : 'Sell';
                mySize = (mySize < coin.minSize) ? coin.minSize : mySize;
                masterSize = formatSize(masterSize, coin.minSize);
                mySize = formatSize(mySize, coin.minSize);
                myAmount = (price*mySize)/leverage;
                const [checkOrderExists, positionByMasters] = await Promise.all([
                  db.collection('orders').find({order: x.order}).toArray(),
                  client.db('bybit').collection('positions').find({master_id: masterId, symbol: symbol, side: side}).toArray()
                ]);
                if (!checkOrderExists.length) {
                  const exist = currentPositions.find(z => z.symbol == symbol && z.side == side);
                  if (exist) {
                    if (!positionByMasters.length) return;
                    const ticker = await bybitAPI.get_ticker(symbol);
                    const lastPrice = ticker.result.list ? ticker.result.list[0].lastPrice : price;
                    if (!isDCA(masterId, symbol, side, exist.avgPrice, lastPrice)) {
                      return;
                    }
                  }
                  x.time = moment(new Date(Number(time))).unix();
                  db.collection('orders').insertMany([x]);
                  const positionIdx = (side == 'Buy') ? 1 : 2;
                  let promises = [
                    client.db('bybit').collection('positions').insertMany([{master_id: masterId, symbol: symbol, side: side, sort_time: x.sort_time}]),
                  ];
                  if (exist) {
                    myAmount = (exist.avgPrice*mySize)/leverage;
                    Func.show_order_log('BNB', get_master(masterId).name, symbol, side, coin.minSize, masterSize, mySize, masterAmount, myAmount, false, exist.avgPrice);
                    promises.push(bybitAPI.place_order('{"category":"linear","symbol":"'+symbol+'","side": "'+side+'","orderType": "Market","qty": "'+mySize+'","positionIdx":'+positionIdx+'}'));
                  } else {
                    await bybitAPI.set_leverage(symbol, leverage);
                    Func.show_order_log('BNB', get_master(masterId).name, symbol, side, coin.minSize, masterSize, mySize, masterAmount, myAmount, price, false);
                    promises.push(bybitAPI.place_order('{"category":"linear","symbol":"'+symbol+'","side": "'+side+'","orderType": "Limit", "price": "'+price+'","qty": "'+mySize+'","positionIdx":'+positionIdx+'}'));
                  }
                  Promise.all(promises);
                }
            }));
        }
    }
};

async function takeProfit(db, results, masterId) {
    var profits = results.filter(x => x.realizedProfit != 0);
    var histories = distinct(profits, ['time']);
    if (histories.length) {
      await Promise.all(histories.map( async (x, index) => {
          x.sort_time = moment().unix();
          x.time = moment(new Date(Number(x.time))).unix();
          const positionSide = (x.side == 'BUY') ? 'Sell' : 'Buy';
          const [checkHistoryExists, positionByMasters] = await Promise.all([
            db.collection('history').find({side: x.side, symbol: x.symbol, time: x.time}).toArray(),
            client.db('bybit').collection('positions').find({master_id: masterId, symbol: x.symbol, side: positionSide}).toArray()
          ]);
          if (!checkHistoryExists.length && positionByMasters.length) {
            const exist = currentPositions.find(z => z.symbol == x.symbol && z.side == positionSide);
            if (exist) {
              const positionIdx = (positionSide == 'Buy') ? 1 : 2;
              const closeSide = (positionSide == 'Buy') ? 'Sell' : 'Buy';
              await Promise.all([
                db.collection('history').insertMany([x]),
                client.db('bybit').collection('positions').deleteMany({ master_id: masterId, symbol: x.symbol, side: positionSide }),
                bybitAPI.place_order('{"category":"linear","symbol":"'+x.symbol+'","side": "'+closeSide+'","orderType": "Market","qty": "'+exist.size+'","positionIdx":'+positionIdx+',"reduceOnly":true}'),
                closeOpenOrders(exist.symbol, positionSide),
              ]);
              setTimeout( async () => {
                const [ pnl, sumProfits ] = await Promise.all([
                  bybitAPI.get_pnl(x.symbol),
                  filterData(db, profits),
                ]);
                const sumQty = sumProfits.find(z => z.order.includes(`${x.symbol}/${x.side}`));
                Func.show_history_log('BNB', get_master(masterId).name, x.symbol, positionSide, sumQty.qty, '$', pnl.result.list[0].closedPnl, '$');
              }, 1000);
            } else {
              closeOpenOrders(x.symbol, positionSide);
              db.collection('history').insertMany([x]);
            }
          }
      }));
    }
}

async function listPositions() {
    const list = await bybitAPI.get_positions();
    if (list.retCode == 0 && list.result.list.length) {
        currentPositions = list.result.list;
    }
    return currentPositions;
}

async function filterData(db, results) {
    let data = [];
    var holder = {};

    await Promise.all(
      results.map( async (x) => {
            x.time = moment(new Date(Number(x.time))).unix();
            const key = x.symbol+'/'+x.side +'/'+x.time;
            if (holder.hasOwnProperty(key)) {
                holder[key] = holder[key] + x.qty;
            } else {
                holder[key] = x.qty;
            }
        })
    );

    for (var prop in holder) {
        data.push({ order: prop, qty: holder[prop] });
    }

    return data;
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

function isDCA(masterId, symbol, side, entryPrice, lastPrice) {
    if (
        (side == 'Sell' && Number(lastPrice) <= Number(entryPrice)) || 
        (side == 'Buy' && Number(lastPrice) >= Number(entryPrice))
    ) {
        showLog('['+get_master(masterId)['name']+'] '+symbol+' ('+side+'): (My Entry: '+entryPrice+') không nên vào lúc này :)', 'warn');
        return false;
    }
    return true;
}

function formatSize(size, stepSize) {
    if(Math.floor(stepSize) === stepSize) return parseFloat(size).toFixed(0);
    const decimals = stepSize.toString().split(".")[1].length || 0; 
    return parseFloat(size).toFixed(decimals);
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
        
            default:
              logger1.log(message);
                break;
        }
    }
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

function get_master(id) {
  return MASTERS.find(x => x.id == id);
}