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

const topCoins = Func.get_market_pairs();
const coinInfo = Func.get_coin_info();
let myBudget = 100; // USDT
let maxContracts = 10; // 10
let maxAmountPerOrder = 0.5; // USDT
let currentPositions = [];
let logs = [];

const MASTERS = [
  {
    id: '3725468878881937408',
    name: 'MasterRayn',
    leverage: 20,
    balance: 200000,
    scale: 1.5,
  },
  {
    id: '3739207487989583617',
    name: 'FredyFlamengo',
    leverage: 20,
    balance: 55000,
    scale: 1,
  },
];

(async () => {
    await client.connect();
    await Func.get_positions();
    const db = client.db('binance');

    cron.schedule('*/15 * * * * *', async () => {
        currentPositions = Func.list_positions();
    });

    // cron.schedule('*/10 * * * * *', async () => {
    //   for (let index = 0; index < MASTERS.length; index++) {
    //     const item = MASTERS[index];
    //     placeOrder(db, item.id, item.balance, item.leverage, item.scale);
    //   }
    // });
})();

async function placeOrder(db, masterId, budget, leverage = 10, scale = 1) {
  const result = await binanceAPI.trade_history(masterId);
  if (result.success && result.data.list && result.data.list.length) {
    takeProfit(db, masterId, result.data.list);
    var noProfits = result.data.list.filter(x => x.realizedProfit == 0);
    const data = await sumQuantity(db, noProfits);
    if (data.length) {
      await Promise.all(data.map( async (x, index) => {
          x.sort_time = moment().unix();
          let symbol = x.order.split('/')[0];
          if (!topCoins.includes(symbol)) return;
          let coin = coinInfo.find(z => symbol == z.symbol);
          if (!coin) return;
          if (symbol == 'BTCUSDT') leverage = 100;
          if (symbol == 'ETHUSDT') leverage = 50;
          leverage = (leverage > coin.maxLeverage) ? coin.maxLeverage : leverage;
          let side = x.order.split('/')[1];
          let time = x.order.split('/')[2];
          let price = result.data.list.find(k => symbol == k.symbol && side == k.side)['price'];
          side = (side == 'BUY') ? 'Buy' : 'Sell';
          let masterSize = x.qty;
          masterSize = formatSize(masterSize, coin.minSize);
          let masterAmount = (masterSize*price)/leverage;
          let masterRate = (masterAmount/budget)*100;
          let myAmount = (masterRate*myBudget)/100;
          if (myAmount > maxAmountPerOrder) myAmount = maxAmountPerOrder;
          let mySize = (scale*myAmount*leverage)/price;
          mySize = (mySize < coin.minSize) ? coin.minSize : mySize;
          mySize = formatSize(mySize, coin.minSize);
          myAmount = (mySize*price)/leverage;
          // let myRate = (myAmount/myBudget)*100;
          // return console.log(get_master(masterId).name, symbol, myRate+'%', myAmount);
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
            let promises = [
              client.db('bybit').collection('positions').insertMany([{master_id: masterId, symbol: symbol, side: side, sort_time: x.sort_time}]),
            ];
            if (exist) {
              Func.show_order_log('BNB', get_master(masterId).name, symbol, side, leverage, coin.minSize, masterSize, mySize, masterAmount, price, myBudget);
              promises.push(
                bybitAPI.place_order('{"category":"linear","symbol":"'+symbol+'","side": "'+side+'","orderType": "Market","qty": "'+mySize+'","positionIdx":'+exist.positionIdx+'}')
              );
            } else {
              const positionIdx = (side == 'Buy') ? 1 : 2;
              const [ ticker ] = await Promise.all([
                bybitAPI.get_ticker(symbol),
                bybitAPI.set_leverage(symbol, leverage),
              ]);
              let lastPrice = ticker.result.list ? ticker.result.list[0].lastPrice : price;
              lastPrice = Func.formatSize(lastPrice, coin.minPrice);
              const takeProfitPrice = Func.get_take_profit_price(coin, side, mySize, myAmount, lastPrice);
              const stopLossPrice = Func.get_stop_loss_price(coin, x.side, mySize, myAmount, lastPrice);
              Func.show_order_log('BNB', get_master(masterId).name, symbol, side, leverage, coin.minSize, masterSize, mySize, masterAmount, price, myBudget, lastPrice);
              promises.push(
                bybitAPI.place_order('{"category":"linear","symbol":"'+symbol+'","side": "'+side+'","orderType": "Limit", "price": "'+lastPrice+'","qty": "'+mySize+'","positionIdx":'+positionIdx+',"takeProfit":"'+takeProfitPrice+'","stopLoss":"'+stopLossPrice+'"}')
              );
            }
            await Promise.all(promises);
          }
      }));
    }
  }
};

async function takeProfit(db, masterId, orders = []) {
  var results = await binanceAPI.position_history(masterId);
  if (results.success && results.data.list.length) {
    await Promise.all(results.data.list.map( async (x, index) => {
      x.sort_time = moment().unix();
      x.closed = moment(new Date(Number(x.closed))).unix();
      x.opened = moment(new Date(Number(x.opened))).unix();
      x.updateTime = moment(new Date(Number(x.updateTime))).unix();
      x.side = (x.side == 'Short') ? 'Sell' : 'Buy';
      const [checkHistoryExists, positionByMasters] = await Promise.all([
        db.collection('history').find({side: x.side, symbol: x.symbol, updateTime: x.updateTime}).toArray(),
        client.db('bybit').collection('positions').find({master_id: masterId, symbol: x.symbol, side: x.side}).toArray()
      ]);
      if (!checkHistoryExists.length && positionByMasters.length) {
        const exist = currentPositions.find(z => z.symbol == x.symbol && z.side == x.side);
        if (exist) {
          const placeSide = (exist.side == 'Buy') ? 'Sell' : 'Buy';
          const orderedSide = (x.side == 'Short') ? 'BUY' : 'SELL';
          const ordered = orders.find(z => z.symbol == x.symbol && z.side == orderedSide && z.realizedProfit != 0);
          const orderPrice = ordered && ordered.price ? ordered.price : exist.markPrice;
          await Promise.all([
            bybitAPI.place_order('{"category":"linear","symbol":"'+x.symbol+'","side": "'+placeSide+'","orderType": "Market","qty": "'+exist.size+'","positionIdx":'+exist.positionIdx+',"reduceOnly":true}'),
            closeOpenOrders(exist.symbol, exist.side),
          ]);
          db.collection('history').insertMany([x]);
          client.db('bybit').collection('positions').deleteMany({ master_id: masterId, symbol: x.symbol, side: x.side });
          setTimeout( async () => {
            const pnl = await bybitAPI.get_pnl(x.symbol);
            const ROI = Func.get_real_roi(pnl);
            Func.show_history_log('BNB', get_master(masterId).name, x.symbol, x.side, exist.leverage, x.avgClosePrice, pnl.result.list[0].avgExitPrice, x.closingPnl, '$', ROI, '%');
          }, 1000);
        } else {
          db.collection('history').insertMany([x]);
          await closeOpenOrders(x.symbol, x.side);
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

async function sumQuantity(db, results) {
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

async function sumProfits(db, results) {
  let data = [];
  var holder = {};

  await Promise.all(
    results.map( async (x) => {
          x.time = moment(new Date(Number(x.time))).unix();
          const key = x.symbol+'/'+x.side +'/'+x.time;
          if (holder.hasOwnProperty(key)) {
              holder[key] = holder[key] + x.realizedProfit;
          } else {
              holder[key] = x.realizedProfit;
          }
      })
  );

  for (var prop in holder) {
      data.push({ order: prop, profit: holder[prop] });
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
        showLog('['+get_master(masterId)['name']+'] '+symbol+' ('+side+'): (My Entry: '+entryPrice+') không nên vào lúc này', 'warn');
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