const express = require('express');
const router = express.Router();
const axios = require('axios');
const cron = require('node-cron');
const moment = require('moment-timezone');
moment.tz.setDefault('Asia/Ho_Chi_Minh');
const logger = require('node-color-log');

logger.setLevel("info");
logger.setDate(() => (moment()).format('LTS'));

const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = "mongodb+srv://dinhgiang2611:"+process.env.MONGOGB_PASS+"@cluster0.lugbagm.mongodb.net/?retryWrites=true&w=majority";

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

const budgetForBot = 15000;
const tp = 20;
const sl = 50;

let data = {
  cookie: process.env.COOKIES,
};

router.get('/', function(req, res, next) {
  data.error = false;
  data.success = false;
  data.stop_loss = true;
  data.take_profit = true;
  data.tp = req.query.tp ? Number(req.query.tp) : tp;
  data.sl = req.query.sl ? Number(req.query.sl) : sl;
  res.render('index', { data });
});

router.get('/list', async function(req, res, next) {
  try {
    const access = await axios.request({
      method: 'get',
      maxBodyLength: Infinity,
      url: process.env.API_AUTH_URI+ '/api/auth/session',
      headers: {
        "Content-Type": "application/json",
        Cookie: data.cookie
      }
    });
    const token = access.data.accessToken;
    const positions = await axios.request({
      method: 'get',
      maxBodyLength: Infinity,
      url: process.env.API_HOST_URI + '/perpetual/v1/positions?status=OPEN',
      headers: { 
        'Authorization': 'Bearer ' + token
      }
    });
    if (Object.keys(positions.data).length) {
      let promises = [];
      positions.data.forEach(x => {
        promises.push(
          axios.request({
            method: 'get',
            maxBodyLength: Infinity,
            url: process.env.API_HOST_URI + '/perpetual/v1/ticker/24hr?symbol=' + x.symbol,
            headers: { 
              'Authorization': 'Bearer ' + token
            }
          })
          .then((response) => {
            return response.data;
          })
        );
      });
      const results = await Promise.all(promises);
      positions.data.map(x => {
        const lastPrice = (results.find(z => z.symbol == x.symbol)).lastPrice;
        x.lastPrice = lastPrice;
        return x;
      });
    }
    res.send(positions.data);
  } catch (error) {
    res.send(error.response.data);
  }
});

router.get('/history', async function(req, res, next) {
  try {
    const access = await axios.request({
      method: 'get',
      maxBodyLength: Infinity,
      url: process.env.API_AUTH_URI+ '/api/auth/session',
      headers: {
        "Content-Type": "application/json",
        Cookie: data.cookie
      }
    });
    const token = access.data.accessToken;
    const start = moment().startOf('day');
    const end = moment().endOf('day');
    const list = await axios.request({
      method: 'get',
      maxBodyLength: Infinity,
      url: process.env.API_HOST_URI + '/perpetual/v1/fills?startTime='+start+'&endTime='+end,
      headers: { 
        'Authorization': 'Bearer ' + token
      }
    });
    res.send(list.data.filter(x => x.realizedProfit != 0));
  } catch (error) {
    res.send(error.response.data);
  }
});

router.post('/', async function(req, res, next) { 
  data.side = String(req.body.side);
  data.symbol = String(req.body.symbol);
  data.leverage = Number(req.body.leverage);
  data.min_size = Number(req.body.min_size);
  data.margin = Number(req.body.margin);
  data.cookie = req.body.cookie ? String(req.body.cookie) : data.cookie;
  data.type = String(req.body.type);
  data.stop_market_price = Number(req.body.stop_market_price);
  data.stop_loss = req.body.stop_loss ? true : false;
  data.take_profit = req.body.take_profit ? true : false;
  data.loss_price = req.body.loss_price ? Number(req.body.loss_price) : false;
  data.take_price = req.body.take_price ? Number(req.body.take_price) : false;
  if (req.query.tp) data.tp = Number(req.query.tp);
  if (req.query.sl) data.sl = Number(req.query.sl);

  const access = await axios.request({
    method: 'get',
    maxBodyLength: Infinity,
    url: process.env.API_AUTH_URI+ '/api/auth/session',
    headers: {
      "Content-Type": "application/json",
      Cookie: data.cookie
    }
  });

  const token = access.data.accessToken;

  const [a, b] = await Promise.all([
    axios.request({
      method: 'post',
      maxBodyLength: Infinity,
      url: process.env.API_HOST_URI + '/perpetual/v1/leverage',
      headers: { 
        'Content-Type': 'application/json', 
        'Authorization': 'Bearer ' + token
      },
      data : JSON.stringify({
        "symbol": data.symbol,
        "leverage": data.leverage
      })
    })
    .then((response) => {
      return response.data;
    }),
    axios.request({
      method: 'get',
      maxBodyLength: Infinity,
      url: process.env.API_HOST_URI + '/perpetual/v1/ticker/24hr?symbol=' + data.symbol,
      headers: { 
        'Authorization': 'Bearer ' + token
      }
    })
    .then((response) => {
      return response.data;
    })
  ]);

  const lastPrice = Number(b.lastPrice);
  
  try{
      if(data.type == 'STOP_MARKET') {
        const size = (data.margin*data.leverage)/data.stop_market_price;
        
        try {
          await axios.request({
            method: 'post',
            maxBodyLength: Infinity,
            url: process.env.API_HOST_URI + '/perpetual/v1/order',
            headers: { 
              'Content-Type': 'application/json', 
              'Authorization': 'Bearer ' + token
            },
            data : JSON.stringify({
              "symbol": data.symbol,
              "side": data.side,
              "type": "STOP",
              "positionSide": "BOTH",
              "size": size,
              "clientOrderId": "42466c03-44f3-4960-9e52-40501d2edcb0",
              "userId": "42466c03-44f3-4960-9e52-40501d2edcb0",
              "postOnly": false,
              "workingType": "CONTRACT_PRICE",
              "stopPrice": data.stop_market_price,
              "reduceOnly": false,
              "timeInForce": "GTC",
              "closePosition": false
            })
          });
        } catch (err) {
          await axios.request({
            method: 'post',
            maxBodyLength: Infinity,
            url: process.env.API_HOST_URI + '/perpetual/v1/order',
            headers: { 
              'Content-Type': 'application/json', 
              'Authorization': 'Bearer ' + token
            },
            data : JSON.stringify({
              "symbol": data.symbol,
              "side": data.side,
              "type": "TAKE_PROFIT",
              "positionSide": "BOTH",
              "size": size,
              "clientOrderId": "42466c03-44f3-4960-9e52-40501d2edcb0",
              "userId": "42466c03-44f3-4960-9e52-40501d2edcb0",
              "postOnly": false,
              "workingType": "CONTRACT_PRICE",
              "stopPrice": data.stop_market_price,
              "reduceOnly": false,
              "timeInForce": "GTC",
              "closePosition": false
            })
          });
        }
      } else {
          const size = (data.margin*data.leverage)/lastPrice;

          const order = await axios.request({
            method: 'post',
            maxBodyLength: Infinity,
            url: process.env.API_HOST_URI + '/perpetual/v1/order',
            headers: { 
              'Content-Type': 'application/json', 
              'Authorization': 'Bearer ' + token
            },
            data : JSON.stringify({
              "symbol": data.symbol,
              "side": data.side,
              "type": "MARKET",
              "positionSide": "BOTH",
              "size": size,
              "clientOrderId": "42466c03-44f3-4960-9e52-40501d2edcb0",
              "userId": "42466c03-44f3-4960-9e52-40501d2edcb0",
              "postOnly": false,
              "workingType": "MARK_PRICE",
              "stopPrice": 0,
              "reduceOnly": false,
              "timeInForce": "GTC",
              "closePosition": false
            })
          });

          await sleep(2000);
    
          const [c, d] = await Promise.all([
            axios.request({
              method: 'get',
              maxBodyLength: Infinity,
              url: process.env.API_HOST_URI + '/perpetual/v1/positions?status=OPEN',
              headers: { 
                'Authorization': 'Bearer ' + token
              }
            })
            .then((response) => {
              return response.data;
            }),
            axios.request({
              method: 'get',
              maxBodyLength: Infinity,
              url: process.env.API_HOST_URI + '/perpetual/v1/orders?status=OPEN&status=UNTRIGGERED&symbol='+data.symbol,
              headers: { 
                'Authorization': 'Bearer ' + token
              }
            })
            .then((response) => {
              return response.data;
            })
          ]);
          
          const tp = d.find(x => x.closePosition && x.symbol == data.symbol && x.type == 'TAKE_PROFIT');
          const sl = d.find(x => x.closePosition && x.symbol == data.symbol && x.type == 'STOP');

          if (tp) {
            await axios.request({
              method: 'delete',
              maxBodyLength: Infinity,
              url: process.env.API_HOST_URI + '/perpetual/v1/order',
              headers: { 
                'Content-Type': 'application/json', 
                'Authorization': 'Bearer ' + token
              },
              data : JSON.stringify({
                "id":tp.id,
                "symbol":tp.symbol,
                "clientOrderId":"42466c03-44f3-4960-9e52-40501d2edcb0"
              })
            }).then((response) => {
              return response.data;
            });
          }

          const checkOrder = c.length ? c.find(x => x.symbol == data.symbol) : false;
          if (checkOrder) data.margin = Number(checkOrder.initialMargin) + data.margin;
          const lossMoney = ( (data.stop_loss ? data.sl : 95) / 100) * data.margin;
          const takeMoney = (data.tp/100) * data.margin;
          const newSize = (data.margin*data.leverage)/lastPrice;
          let lossPrice = lastPrice + (lossMoney/newSize);
          let takePrice = lastPrice - (takeMoney/newSize);
          if (data.side == 'BUY') lossPrice = lastPrice - (lossMoney/newSize);
          if (data.side == 'BUY') takePrice = lastPrice + (takeMoney/newSize);

          if (data.loss_price) lossPrice = data.loss_price;
          if (data.take_price) takePrice = data.take_price;

          let processes = [];

          if (data.take_profit) {
            processes.push(
              axios.request({
                method: 'post',
                maxBodyLength: Infinity,
                url: process.env.API_HOST_URI + '/perpetual/v1/order',
                headers: { 
                  'Content-Type': 'application/json', 
                  'Authorization': 'Bearer ' + token
                },
                data : JSON.stringify({
                  "symbol": data.symbol,
                  "side": (data.side == 'BUY') ? 'SELL' : 'BUY',
                  "type": 'TAKE_PROFIT',
                  "positionSide": "BOTH",
                  "clientOrderId": "42466c03-44f3-4960-9e52-40501d2edcb0",
                  "userId": "42466c03-44f3-4960-9e52-40501d2edcb0",
                  "postOnly": false,
                  "timeInForce": "GTC",
                  "reduceOnly": false,
                  "closePosition": true,
                  "price": 0,
                  "stopPrice": takePrice,
                  "workingType": "CONTRACT_PRICE"
                })
              }).then((response) => {
                return response.data;
              })
            );
          }

          if(!sl && data.stop_loss) {
            processes.push(
              axios.request({
                method: 'post',
                maxBodyLength: Infinity,
                url: process.env.API_HOST_URI + '/perpetual/v1/order',
                headers: { 
                  'Content-Type': 'application/json', 
                  'Authorization': 'Bearer ' + token
                },
                data : JSON.stringify({
                  "symbol": data.symbol,
                  "side": (data.side == 'BUY') ? 'SELL' : 'BUY',
                  "type": 'STOP',
                  "positionSide": "BOTH",
                  "clientOrderId": "42466c03-44f3-4960-9e52-40501d2edcb0",
                  "userId": "42466c03-44f3-4960-9e52-40501d2edcb0",
                  "postOnly": false,
                  "timeInForce": "GTC",
                  "reduceOnly": false,
                  "closePosition": true,
                  "price": 0,
                  "stopPrice": lossPrice,
                  "workingType": "CONTRACT_PRICE"
                })
              }).then((response) => {
                return response.data;
              })
            );
          }

          if (sl && !data.stop_loss) {
            processes.push(axios.request({
                method: 'delete',
                maxBodyLength: Infinity,
                url: process.env.API_HOST_URI + '/perpetual/v1/order',
                headers: { 
                  'Content-Type': 'application/json', 
                  'Authorization': 'Bearer ' + token
                },
                data : JSON.stringify({
                  "id":sl.id,
                  "symbol":sl.symbol,
                  "clientOrderId":"42466c03-44f3-4960-9e52-40501d2edcb0"
                })
              }).then((response) => {
                return response.data;
              })
            );
          }
    
          await Promise.all(processes);
      }

      data.error = '';
      data.success = `${data.side} ${data.type} lệnh ${data.symbol}!`;
  }
  catch(error){
      logger.error(error);
      if (error.response.data && error.response.data.code == 'order_less_than_min_size') {
        const minMargin = (data.min_size*lastPrice)/data.leverage;
        error.response.data.code = `Ký quỹ tối thiểu ${minMargin.toLocaleString('en-US')} VNDC`;
      }
      data.error = error.response.data.message || error.response.data.code;
      data.success = '';
  }

  return res.render('index', { data });
});

router.post('/close', async function(req, res, next) {
  const id = Number(req.body.id);
  const size = Number(req.body.size);
  const symbol = String(req.body.symbol);
  try {
    const access = await axios.request({
      method: 'get',
      maxBodyLength: Infinity,
      url: process.env.API_AUTH_URI+ '/api/auth/session',
      headers: {
        "Content-Type": "application/json",
        Cookie: data.cookie
      }
    });
    const token = access.data.accessToken;
    const response = await axios.request({
      method: 'post',
      maxBodyLength: Infinity,
      url: process.env.API_HOST_URI + '/perpetual/v1/order',
      headers: { 
        'Content-Type': 'application/json', 
        'Authorization': 'Bearer ' + token
      },
      data : JSON.stringify({
        "symbol": symbol,
        "side": size < 0 ? 'BUY' : 'SELL',
        "type": "MARKET",
        "positionSide": "BOTH",
        "price": 0,
        "size": Math.abs(size),
        "clientOrderId": "42466c03-44f3-4960-9e52-40501d2edcb0",
        "userId": "42466c03-44f3-4960-9e52-40501d2edcb0",
        "postOnly": false,
        "timeInForce": "GTC",
        "workingType": "MARK_PRICE",
        "stopPrice": 0,
        "reduceOnly": true,
        "id": id
      })
    });
    res.send(response.data);
  } catch (error) {
    res.send(error.response.data);
  }
});

router.post('/sld', async function(req, res, next) {
  const id = Number(req.body.id);
  const symbol = String(req.body.symbol);
  const percent = Number(req.body.percent);
  const margin = Number(req.body.margin);
  const size = Number(req.body.size);
  const side = String(req.body.side);
  const entryPrice = Number(req.body.entryPrice);
  try {
    const access = await axios.request({
      method: 'get',
      maxBodyLength: Infinity,
      url: process.env.API_AUTH_URI+ '/api/auth/session',
      headers: {
        "Content-Type": "application/json",
        Cookie: data.cookie
      }
    });
    const token = access.data.accessToken;
    const valid = await axios.request({
      method: 'get',
      maxBodyLength: Infinity,
      url: process.env.API_HOST_URI + '/perpetual/v1/ticker/24hr?symbol=' + symbol,
      headers: { 
        'Authorization': 'Bearer ' + token
      }
    });
    const lastPrice = Number(valid.data.lastPrice);
    const sldMoney = percent/100 * margin;
    const sldPrice = entryPrice + (sldMoney/size);
    if (side == 'BUY' && lastPrice <= sldPrice) {
      return res.send({code: `Chưa đạt +${percent}%.`});
    }
    if (side == 'SELL' && lastPrice >= sldPrice) {
      return res.send({code: `Chưa đạt +${percent}%.`});
    }
    const slRequest = await axios.request({
      method: 'get',
      maxBodyLength: Infinity,
      url: process.env.API_HOST_URI + '/perpetual/v1/orders?status=OPEN&status=UNTRIGGERED&symbol='+symbol,
      headers: { 
        'Authorization': 'Bearer ' + token
      }
    });
    const sl = slRequest.data.find(x => x.closePosition && x.symbol == symbol && x.type == 'STOP');
    if (sl) {
      await axios.request({
        method: 'delete',
        maxBodyLength: Infinity,
        url: process.env.API_HOST_URI + '/perpetual/v1/order',
        headers: { 
          'Content-Type': 'application/json', 
          'Authorization': 'Bearer ' + token
        },
        data : JSON.stringify({
          "id":sl.id,
          "symbol":symbol,
          "clientOrderId":"42466c03-44f3-4960-9e52-40501d2edcb0"
        })
      }).then((response) => {
        return response.data;
      });
    }
    const response = await axios.request({
      method: 'post',
      maxBodyLength: Infinity,
      url: process.env.API_HOST_URI + '/perpetual/v1/order',
      headers: { 
        'Content-Type': 'application/json', 
        'Authorization': 'Bearer ' + token
      },
      data : JSON.stringify({
        "symbol": symbol,
        "side": (side == 'BUY') ? 'SELL' : 'BUY',
        "type": 'STOP',
        "positionSide": "BOTH",
        "clientOrderId": "42466c03-44f3-4960-9e52-40501d2edcb0",
        "userId": "42466c03-44f3-4960-9e52-40501d2edcb0",
        "postOnly": false,
        "timeInForce": "GTC",
        "reduceOnly": false,
        "closePosition": true,
        "price": 0,
        "stopPrice": sldPrice,
        "workingType": "CONTRACT_PRICE"
      })
    });
    res.send(response.data);
  } catch (error) {
    res.send(error.response.data);
  }
});

async function bot(db, collection) {
  try {
    const countStopLoss = await countStopLosses(collection);
    if (countStopLoss >= 3) {
      return logger.warn(`Tín hiệu Bot đã chạm Stop Loss ${countStopLoss} lần!`);
    }

    const list = await axios.request({
      method: 'get',
      maxBodyLength: Infinity,
      url: 'https://my-master.goonus.io/api/articles/bot-articles?status=OPEN&page=0&size=3',
      headers: {
        "Content-Type": "application/json",
        "session-token": "8FRLFfiORmbnM6MyfXuv32qgWgHgCVts",
        "Referer": "null"
      },
    });

    if (list.data.length) {
      await Promise.all(list.data.map(async (x) => {
        const filtered = await collection.find({id: x.id}).toArray();
        if (filtered.length) {
          logger.info('-------------------------------------------------------------------------------');
          const date = new Date(filtered[0].createdDate * 1000);
          const datevalues = `${date.getHours()}:${date.getMinutes()} ${date.getDate()}/${date.getMonth()+1}/${date.getFullYear()}`;
          logger.info(`Existed [${x.user.name}] ${x.title} => [${x.id}] at ${datevalues}`);
        } else {
          const inserted = await collection.insertMany([x]);
          logger.info(`Inserted [${x.user.name}] ${x.title} =>`, x);
          const data = {
            type: 'MARKET',
            side: (x.futures == 'SHORT') ? 'SELL' : 'BUY',
            symbol: x.coin_pair_id.replace("/", ""),
            leverage: x.leverage,
            stop_loss: true,
            take_profit: true,
            take_price: Number(x.textTP.replace(",", "")),
            margin: budgetForBot,
          };

          axios.request({
            method: 'post',
            maxBodyLength: Infinity,
            url: 'https://trader.adaptable.app/?sl=20',
            headers: {
              'Content-Type': 'application/json', 
            },
            data: JSON.stringify(data)
          }).then((response) => {
            return response.data;
          });
        }
      }));
    }

    return 'done.';
  } catch (error) {
    logger.info(error);
  }
}

async function master(db, collection, masterId, abs = false) {
  try {
    const countStopLoss = await countStopLosses(collection);
    if (countStopLoss >= 3) {
      return logger.warn(`Tín hiệu Master đã chạm Stop Loss ${countStopLoss} lần!`);
    }

    const list = await axios.request({
      method: 'get',
      maxBodyLength: Infinity,
      url: 'https://my-master.goonus.io/api/articles/getArticlesByUser?user_id='+masterId+'&page=0&size=3',
      headers: {
        "Content-Type": "application/json",
        "session-token": "8FRLFfiORmbnM6MyfXuv32qgWgHgCVts",
        "Referer": "null"
      },
    });

    if (list.data.length) {
      await Promise.all(list.data.map(async (x) => {
        if (x.trans == 'ONUS_FUTURES') {
          const filtered = await collection.find({id: x.id}).toArray();
          if (filtered.length) {
            logger.info('-------------------------------------------------------------------------------');
            const date = new Date(filtered[0].createdDate * 1000);
            const datevalues = `${date.getHours()}:${date.getMinutes()} ${date.getDate()}/${date.getMonth()+1}/${date.getFullYear()}`;
            logger.info(`Existed **${x.user.name}** ${x.content} => [${x.id}] at ${datevalues}`);
          } else {
            const inserted = await collection.insertMany([x]);
            logger.info(`Inserted [${x.user.name}] ${x.content} =>`, x);

            let side = (x.futures == 'SHORT') ? 'SELL' : 'BUY';
            if (abs && side == 'SELL') side = 'BUY';
            if (abs && side == 'BUY') side = 'SELL';
            
            const data = {
              type: 'MARKET',
              side: side,
              symbol: x.coin_pair_id.replace("/", ""),
              leverage: 15,
              stop_loss: true,
              take_profit: true,
              margin: budgetForBot,
            };

            axios.request({
              method: 'post',
              maxBodyLength: Infinity,
              url: 'http://localhost:3000/?tp=20&sl=20',
              headers: {
                'Content-Type': 'application/json',
              },
              data: JSON.stringify(data)
            }).then((response) => {
              return response.data;
            });
          }
        }
      }));
    }

    return 'done.';
  } catch (error) {
    logger.info(error);
  }
}

if (process.env.MNAI == 'true') {
  (async () => {
    await client.connect();
    logger.info('Connected successfully to database');

    const dbBot = client.db('bots');
    cron.schedule('*/5 * * * * *', async () => {
      try {
        bot(dbBot, dbBot.collection('documents'))
        .catch(logger.dir);
      } catch (error) {
        logger.info(error);
      }
    });

    const dbMaster = client.db('masters');
    cron.schedule('*/10 * * * * *', async () => {
      try {
        // Duong_Tri_MMO
        master(dbMaster, dbMaster.collection('documents'), '6277729709683058590', abs = true)
        .catch(logger.dir);

        // VÕ MINH HIẾU
        master(dbMaster, dbMaster.collection('documents'), '6277729706606763934', abs = false)
        .catch(logger.dir);
      } catch (error) {
        logger.info(error);
      }
    });
  })();
}

async function countStopLosses(collection) {
  let count = 0;
  const signsToday = await collection.find({createdDate: {$gte: moment().startOf('day').unix(), $lt: moment().endOf('day').unix()}}).toArray();
  if (signsToday.length) {
    const access = await axios.request({
      method: 'get',
      maxBodyLength: Infinity,
      url: process.env.API_AUTH_URI+ '/api/auth/session',
      headers: {
        "Content-Type": "application/json",
        Cookie: data.cookie
      }
    });
    const list = await axios.request({
      method: 'get',
      maxBodyLength: Infinity,
      url: process.env.API_HOST_URI + '/perpetual/v1/fills?startTime='+moment().startOf('day')+'&endTime='+moment().endOf('day'),
      headers: { 
        'Authorization': 'Bearer ' + access.data.accessToken
      }
    });
    let stopLosses = list.data.filter(x => x.realizedProfit < 0);
    if (stopLosses.length) {
      signsToday.forEach(x => {
        const symbol = x.coin_pair_id.replace("/", "");
        if (stopLosses.find(y => y.symbol == symbol)) {
          count += 1;
        }
      });
    }
  }
  return count;
}

function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

module.exports = router;