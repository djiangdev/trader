const crypto = require('crypto');
const axios = require('axios');
const express = require('express');
const router = express.Router();
const fetch = require("node-fetch");
const bybitAPI = require('../api/bybit');
const binanceAPI = require('../api/binance');

const url=process.env.BYBIT_API_URI;
const apiKey = process.env.BYBIT_API_KEY;
const secret = process.env.BYBIT_API_SECRET;
const recvWindow = Date.now();
const timestamp = Date.now().toString();

router.get('/list', async function(req, res, next) {
    try {
        const endpoint="/v5/position/list"
        const data = 'category=linear&settleCoin=USDT&limit=100&symbol=';
        http_request(endpoint,"GET",data,"Order List", function(results) {
            let positionIM = 0;
            let unrealisedPnl = 0;
            if (results.result.list.length) {
                results.result.list.forEach(x => {
                  positionIM += Number(x.positionIM);
                  unrealisedPnl += Number(x.unrealisedPnl);
                });
                console.log('Ký quỹ ban đầu: ' + positionIM.toFixed(4) + ' USD, P&L Chưa Xác Thực: ' + unrealisedPnl.toFixed(2) + ' USD');
            }
            res.send(results);
        });
    } catch (error) {
        console.log(error);
    }
});

router.get('/open_order', async function(req, res, next) {
  try {
      const endpoint="/v5/order/realtime"
      const data = 'category=linear&settleCoin=USDT&symbol=';
      http_request(endpoint,"GET",data,"Open Orders", function(results) {
          res.send(results);
      });
  } catch (error) {
      console.log(error);
  }
});

router.get('/history', async function(req, res, next) {
    try {
        const endpoint="/v5/order/history"
        const data = 'category=linear&settleCoin=USDT&limit=5';
        http_request(endpoint,"GET",data,"history List", function(results) {
            res.send(results);
        });
    } catch (error) {
        console.log(error);
    }
});

router.get('/create', async function(req, res, next) {
    try {
        const endpoint="/v5/order/create";
        const data = '{"category":"linear","symbol":"NEARUSDT","side": "Buy","orderType": "Limit","price":"3.5","qty": "1","positionIdx":1}';
        http_request(endpoint,"POST",data,"Order Create", function(results) {
            res.send(results);
        });
    } catch (error) {
        console.log(error);
    }
});

router.get('/close', async function(req, res, next) {
    try {
        const endpoint="/v5/order/create";
        const data = '{"category":"linear","symbol":"LINKUSDT","side": "Buy","orderType": "Market","qty": "0.1","positionIdx":2,"reduceOnly":true}';
        http_request(endpoint,"POST",data,"Order Close", function(results) {
            res.send(results);
        });
    } catch (error) {
        console.log(error);
    }
});

router.get('/leverage', async function(req, res, next) {
    try {
        const endpoint="/v5/position/set-leverage";
        const data = '{"category":"linear","symbol":"BTCUSDT","buyLeverage":"100","sellLeverage":"100"}';
        http_request(endpoint,"POST",data,"Set Leverage", function(results) {
            res.send(results);
        });
    } catch (error) {
        console.log(error);
    }
});

router.get('/leverages', async function(req, res, next) {
    try {
        const coins = [
            {
              "symbol": "1000000VINUUSDT",
              "minSize": 100
            },
            {
              "symbol": "10000LADYSUSDT",
              "minSize": 100
            },
            {
              "symbol": "10000NFTUSDT",
              "minSize": 10
            },
            {
              "symbol": "10000SATSUSDT",
              "minSize": 100
            },
            {
              "symbol": "10000STARLUSDT",
              "minSize": 10
            },
            {
              "symbol": "1000BONKUSDT",
              "minSize": 100
            },
            {
              "symbol": "1000BTTUSDT",
              "minSize": 100
            },
            {
              "symbol": "1000FLOKIUSDT",
              "minSize": 1
            },
            {
              "symbol": "1000LUNCUSDT",
              "minSize": 1
            },
            {
              "symbol": "1000PEPEUSDT",
              "minSize": 100
            },
            {
              "symbol": "1000RATSUSDT",
              "minSize": 10
            },
            {
              "symbol": "1000XECUSDT",
              "minSize": 10
            },
            {
              "symbol": "1CATUSDT",
              "minSize": 10
            },
            {
              "symbol": "1INCHUSDT",
              "minSize": 0.1
            },
            {
              "symbol": "AAVEUSDT",
              "minSize": 0.01
            },
            {
              "symbol": "ACEUSDT",
              "minSize": 0.1
            },
            {
              "symbol": "ACHUSDT",
              "minSize": 10
            },
            {
              "symbol": "ADAUSDT",
              "minSize": 1
            },
            {
              "symbol": "AERGOUSDT",
              "minSize": 1
            },
            {
              "symbol": "AGIUSDT",
              "minSize": 10
            },
            {
              "symbol": "AGIXUSDT",
              "minSize": 1
            },
            {
              "symbol": "AGLDUSDT",
              "minSize": 0.1
            },
            {
              "symbol": "AIUSDT",
              "minSize": 0.1
            },
            {
              "symbol": "AKROUSDT",
              "minSize": 100
            },
            {
              "symbol": "ALGOUSDT",
              "minSize": 0.1
            },
            {
              "symbol": "ALICEUSDT",
              "minSize": 0.1
            },
            {
              "symbol": "ALPACAUSDT",
              "minSize": 1
            },
            {
              "symbol": "ALPHAUSDT",
              "minSize": 1
            },
            {
              "symbol": "AMBUSDT",
              "minSize": 10
            },
            {
              "symbol": "ANKRUSDT",
              "minSize": 1
            },
            {
              "symbol": "ANTUSDT",
              "minSize": 0.1
            },
            {
              "symbol": "APEUSDT",
              "minSize": 0.1
            },
            {
              "symbol": "API3USDT",
              "minSize": 0.1
            },
            {
              "symbol": "APTUSDT",
              "minSize": 0.01
            },
            {
              "symbol": "ARBUSDT",
              "minSize": 0.1
            },
            {
              "symbol": "ARKMUSDT",
              "minSize": 1
            },
            {
              "symbol": "ARKUSDT",
              "minSize": 1
            },
            {
              "symbol": "ARPAUSDT",
              "minSize": 10
            },
            {
              "symbol": "ARUSDT",
              "minSize": 0.1
            },
            {
              "symbol": "ASTRUSDT",
              "minSize": 1
            },
            {
              "symbol": "ATAUSDT",
              "minSize": 10
            },
            {
              "symbol": "ATOMUSDT",
              "minSize": 1
            },
            {
              "symbol": "AUCTIONUSDT",
              "minSize": 0.1
            },
            {
              "symbol": "AUDIOUSDT",
              "minSize": 0.1
            },
            {
              "symbol": "AVAXUSDT",
              "minSize": 0.1
            },
            {
              "symbol": "AXLUSDT",
              "minSize": 1
            },
            {
              "symbol": "AXSUSDT",
              "minSize": 0.1
            },
            {
              "symbol": "BADGERUSDT",
              "minSize": 0.1
            },
            {
              "symbol": "BAKEUSDT",
              "minSize": 0.1
            },
            {
              "symbol": "BALUSDT",
              "minSize": 0.01
            },
            {
              "symbol": "BANDUSDT",
              "minSize": 0.1
            },
            {
              "symbol": "BATUSDT",
              "minSize": 0.1
            },
            {
              "symbol": "BCHUSDT",
              "minSize": 0.01
            },
            {
              "symbol": "BEAMUSDT",
              "minSize": 100
            },
            {
              "symbol": "BELUSDT",
              "minSize": 1
            },
            {
              "symbol": "BIGTIMEUSDT",
              "minSize": 1
            },
            {
              "symbol": "BLURUSDT",
              "minSize": 1
            },
            {
              "symbol": "BLZUSDT",
              "minSize": 1
            },
            {
              "symbol": "BNBUSDT",
              "minSize": 0.01
            },
            {
              "symbol": "BNTUSDT",
              "minSize": 1
            },
            {
              "symbol": "BNXUSDT",
              "minSize": 0.1
            },
            {
              "symbol": "BOBAUSDT",
              "minSize": 0.1
            },
            {
              "symbol": "BONDUSDT",
              "minSize": 0.1
            },
            {
              "symbol": "BSVUSDT",
              "minSize": 0.01
            },
            {
              "symbol": "BSWUSDT",
              "minSize": 1
            },
            {
              "symbol": "BTCUSDT",
              "minSize": 0.001
            },
            {
              "symbol": "C98USDT",
              "minSize": 0.1
            },
            {
              "symbol": "CAKEUSDT",
              "minSize": 0.1
            },
            {
              "symbol": "CEEKUSDT",
              "minSize": 1
            },
            {
              "symbol": "CELOUSDT",
              "minSize": 0.1
            },
            {
              "symbol": "CELRUSDT",
              "minSize": 1
            },
            {
              "symbol": "CFXUSDT",
              "minSize": 1
            },
            {
              "symbol": "CHZUSDT",
              "minSize": 1
            },
            {
              "symbol": "CKBUSDT",
              "minSize": 10
            },
            {
              "symbol": "COMBOUSDT",
              "minSize": 0.1
            },
            {
              "symbol": "COMPUSDT",
              "minSize": 0.01
            },
            {
              "symbol": "COREUSDT",
              "minSize": 0.1
            },
            {
              "symbol": "COTIUSDT",
              "minSize": 1
            },
            {
              "symbol": "CROUSDT",
              "minSize": 1
            },
            {
              "symbol": "CRVUSDT",
              "minSize": 0.1
            },
            {
              "symbol": "CTCUSDT",
              "minSize": 1
            },
            {
              "symbol": "CTKUSDT",
              "minSize": 0.1
            },
            {
              "symbol": "CTSIUSDT",
              "minSize": 1
            },
            {
              "symbol": "CVCUSDT",
              "minSize": 1
            },
            {
              "symbol": "CVXUSDT",
              "minSize": 0.01
            },
            {
              "symbol": "CYBERUSDT",
              "minSize": 0.1
            },
            {
              "symbol": "DARUSDT",
              "minSize": 0.1
            },
            {
              "symbol": "DASHUSDT",
              "minSize": 0.01
            },
            {
              "symbol": "DATAUSDT",
              "minSize": 10
            },
            {
              "symbol": "DENTUSDT",
              "minSize": 100
            },
            {
              "symbol": "DGBUSDT",
              "minSize": 10
            },
            {
              "symbol": "DODOUSDT",
              "minSize": 1
            },
            {
              "symbol": "DOGEUSDT",
              "minSize": 1
            },
            {
              "symbol": "DOTUSDT",
              "minSize": 0.1
            },
            {
              "symbol": "DUSKUSDT",
              "minSize": 1
            },
            {
              "symbol": "DYDXUSDT",
              "minSize": 0.1
            },
            {
              "symbol": "EDUUSDT",
              "minSize": 0.1
            },
            {
              "symbol": "EGLDUSDT",
              "minSize": 0.01
            },
            {
              "symbol": "ENJUSDT",
              "minSize": 0.1
            },
            {
              "symbol": "ENSUSDT",
              "minSize": 0.1
            },
            {
              "symbol": "EOSUSDT",
              "minSize": 0.1
            },
            {
              "symbol": "ETCUSDT",
              "minSize": 0.1
            },
            {
              "symbol": "ETHUSDT",
              "minSize": 0.01
            },
            {
              "symbol": "ETHWUSDT",
              "minSize": 0.01
            },
            {
              "symbol": "FETUSDT",
              "minSize": 1
            },
            {
              "symbol": "FILUSDT",
              "minSize": 0.1
            },
            {
              "symbol": "FITFIUSDT",
              "minSize": 1
            },
            {
              "symbol": "FLMUSDT",
              "minSize": 1
            },
            {
              "symbol": "FLOWUSDT",
              "minSize": 0.1
            },
            {
              "symbol": "FLRUSDT",
              "minSize": 10
            },
            {
              "symbol": "FORTHUSDT",
              "minSize": 0.1
            },
            {
              "symbol": "FRONTUSDT",
              "minSize": 1
            },
            {
              "symbol": "FTMUSDT",
              "minSize": 1
            },
            {
              "symbol": "FUNUSDT",
              "minSize": 100
            },
            {
              "symbol": "FXSUSDT",
              "minSize": 0.01
            },
            {
              "symbol": "GALAUSDT",
              "minSize": 1
            },
            {
              "symbol": "GASUSDT",
              "minSize": 0.1
            },
            {
              "symbol": "GFTUSDT",
              "minSize": 1
            },
            {
              "symbol": "GLMRUSDT",
              "minSize": 0.1
            },
            {
              "symbol": "GLMUSDT",
              "minSize": 1
            },
            {
              "symbol": "GMTUSDT",
              "minSize": 1
            },
            {
              "symbol": "GMXUSDT",
              "minSize": 0.01
            },
            {
              "symbol": "GODSUSDT",
              "minSize": 1
            },
            {
              "symbol": "GPTUSDT",
              "minSize": 1
            },
            {
              "symbol": "GRTUSDT",
              "minSize": 0.1
            },
            {
              "symbol": "HBARUSDT",
              "minSize": 1
            },
            {
              "symbol": "HFTUSDT",
              "minSize": 1
            },
            {
              "symbol": "HIFIUSDT",
              "minSize": 1
            },
            {
              "symbol": "HIGHUSDT",
              "minSize": 0.1
            },
            {
              "symbol": "HNTUSDT",
              "minSize": 0.01
            },
            {
              "symbol": "HOOKUSDT",
              "minSize": 0.1
            },
            {
              "symbol": "HOTUSDT",
              "minSize": 100
            },
            {
              "symbol": "ICPUSDT",
              "minSize": 0.1
            },
            {
              "symbol": "ICXUSDT",
              "minSize": 1
            },
            {
              "symbol": "IDEXUSDT",
              "minSize": 10
            },
            {
              "symbol": "IDUSDT",
              "minSize": 1
            },
            {
              "symbol": "ILVUSDT",
              "minSize": 0.01
            },
            {
              "symbol": "IMXUSDT",
              "minSize": 0.1
            },
            {
              "symbol": "INJUSDT",
              "minSize": 0.1
            },
            {
              "symbol": "IOSTUSDT",
              "minSize": 1
            },
            {
              "symbol": "IOTAUSDT",
              "minSize": 0.1
            },
            {
              "symbol": "IOTXUSDT",
              "minSize": 1
            },
            {
              "symbol": "JASMYUSDT",
              "minSize": 1
            },
            {
              "symbol": "JOEUSDT",
              "minSize": 1
            },
            {
              "symbol": "JSTUSDT",
              "minSize": 10
            },
            {
              "symbol": "JTOUSDT",
              "minSize": 0.1
            },
            {
              "symbol": "KASUSDT",
              "minSize": 10
            },
            {
              "symbol": "KAVAUSDT",
              "minSize": 0.1
            },
            {
              "symbol": "KDAUSDT",
              "minSize": 0.1
            },
            {
              "symbol": "KEYUSDT",
              "minSize": 100
            },
            {
              "symbol": "KLAYUSDT",
              "minSize": 0.1
            },
            {
              "symbol": "KNCUSDT",
              "minSize": 0.1
            },
            {
              "symbol": "KSMUSDT",
              "minSize": 0.01
            },
            {
              "symbol": "LDOUSDT",
              "minSize": 0.1
            },
            {
              "symbol": "LEVERUSDT",
              "minSize": 100
            },
            {
              "symbol": "LINAUSDT",
              "minSize": 10
            },
            {
              "symbol": "LINKUSDT",
              "minSize": 0.1
            },
            {
              "symbol": "LITUSDT",
              "minSize": 0.1
            },
            {
              "symbol": "LOOKSUSDT",
              "minSize": 0.1
            },
            {
              "symbol": "LOOMUSDT",
              "minSize": 10
            },
            {
              "symbol": "LPTUSDT",
              "minSize": 0.1
            },
            {
              "symbol": "LQTYUSDT",
              "minSize": 0.1
            },
            {
              "symbol": "LRCUSDT",
              "minSize": 0.1
            },
            {
              "symbol": "LSKUSDT",
              "minSize": 0.1
            },
            {
              "symbol": "LTCUSDT",
              "minSize": 0.1
            },
            {
              "symbol": "LUNA2USDT",
              "minSize": 0.1
            },
            {
              "symbol": "MAGICUSDT",
              "minSize": 1
            },
            {
              "symbol": "MANAUSDT",
              "minSize": 0.1
            },
            {
              "symbol": "MASKUSDT",
              "minSize": 0.1
            },
            {
              "symbol": "MATICUSDT",
              "minSize": 1
            },
            {
              "symbol": "MAVUSDT",
              "minSize": 1
            },
            {
              "symbol": "MBLUSDT",
              "minSize": 100
            },
            {
              "symbol": "MDTUSDT",
              "minSize": 10
            },
            {
              "symbol": "MEMEUSDT",
              "minSize": 10
            },
            {
              "symbol": "METISUSDT",
              "minSize": 0.01
            },
            {
              "symbol": "MINAUSDT",
              "minSize": 0.1
            },
            {
              "symbol": "MKRUSDT",
              "minSize": 0.001
            },
            {
              "symbol": "MNTUSDT",
              "minSize": 1
            },
            {
              "symbol": "MOVRUSDT",
              "minSize": 0.1
            },
            {
              "symbol": "MTLUSDT",
              "minSize": 0.1
            },
            {
              "symbol": "MULTIUSDT",
              "minSize": 0.1
            },
            {
              "symbol": "MYRIAUSDT",
              "minSize": 10
            },
            {
              "symbol": "NEARUSDT",
              "minSize": 0.1
            },
            {
              "symbol": "NEOUSDT",
              "minSize": 0.01
            },
            {
              "symbol": "NFPUSDT",
              "minSize": 0.1
            },
            {
              "symbol": "NKNUSDT",
              "minSize": 1
            },
            {
              "symbol": "NMRUSDT",
              "minSize": 0.1
            },
            {
              "symbol": "NTRNUSDT",
              "minSize": 1
            },
            {
              "symbol": "OCEANUSDT",
              "minSize": 1
            },
            {
              "symbol": "OGNUSDT",
              "minSize": 1
            },
            {
              "symbol": "OGUSDT",
              "minSize": 0.1
            },
            {
              "symbol": "OMGUSDT",
              "minSize": 0.1
            },
            {
              "symbol": "ONEUSDT",
              "minSize": 1
            },
            {
              "symbol": "ONGUSDT",
              "minSize": 1
            },
            {
              "symbol": "ONTUSDT",
              "minSize": 1
            },
            {
              "symbol": "OPUSDT",
              "minSize": 0.1
            },
            {
              "symbol": "ORBSUSDT",
              "minSize": 10
            },
            {
              "symbol": "ORDIUSDT",
              "minSize": 0.01
            },
            {
              "symbol": "OXTUSDT",
              "minSize": 10
            },
            {
              "symbol": "PAXGUSDT",
              "minSize": 0.001
            },
            {
              "symbol": "PENDLEUSDT",
              "minSize": 1
            },
            {
              "symbol": "PEOPLEUSDT",
              "minSize": 1
            },
            {
              "symbol": "PERPUSDT",
              "minSize": 1
            },
            {
              "symbol": "PHBUSDT",
              "minSize": 1
            },
            {
              "symbol": "POLYXUSDT",
              "minSize": 1
            },
            {
              "symbol": "POWRUSDT",
              "minSize": 1
            },
            {
              "symbol": "PROMUSDT",
              "minSize": 0.1
            },
            {
              "symbol": "PYTHUSDT",
              "minSize": 1
            },
            {
              "symbol": "QIUSDT",
              "minSize": 10
            },
            {
              "symbol": "QNTUSDT",
              "minSize": 0.01
            },
            {
              "symbol": "QTUMUSDT",
              "minSize": 0.1
            },
            {
              "symbol": "RADUSDT",
              "minSize": 0.1
            },
            {
              "symbol": "RAREUSDT",
              "minSize": 1
            },
            {
              "symbol": "RAYUSDT",
              "minSize": 0.1
            },
            {
              "symbol": "RDNTUSDT",
              "minSize": 1
            },
            {
              "symbol": "REEFUSDT",
              "minSize": 10
            },
            {
              "symbol": "RENUSDT",
              "minSize": 0.1
            },
            {
              "symbol": "RIFUSDT",
              "minSize": 1
            },
            {
              "symbol": "RLCUSDT",
              "minSize": 0.1
            },
            {
              "symbol": "RNDRUSDT",
              "minSize": 0.1
            },
            {
              "symbol": "ROSEUSDT",
              "minSize": 1
            },
            {
              "symbol": "RPLUSDT",
              "minSize": 0.01
            },
            {
              "symbol": "RSRUSDT",
              "minSize": 10
            },
            {
              "symbol": "RUNEUSDT",
              "minSize": 0.1
            },
            {
              "symbol": "SANDUSDT",
              "minSize": 1
            },
            {
              "symbol": "SEIUSDT",
              "minSize": 1
            },
            {
              "symbol": "SFPUSDT",
              "minSize": 0.1
            },
            {
              "symbol": "SHIB1000USDT",
              "minSize": 10
            },
            {
              "symbol": "SILLYUSDT",
              "minSize": 1
            },
            {
              "symbol": "SKLUSDT",
              "minSize": 1
            },
            {
              "symbol": "SLPUSDT",
              "minSize": 10
            },
            {
              "symbol": "SNTUSDT",
              "minSize": 10
            },
            {
              "symbol": "SNXUSDT",
              "minSize": 0.1
            },
            {
              "symbol": "SOLUSDT",
              "minSize": 0.1
            },
            {
              "symbol": "SSVUSDT",
              "minSize": 0.01
            },
            {
              "symbol": "STEEMUSDT",
              "minSize": 1
            },
            {
              "symbol": "STGUSDT",
              "minSize": 0.1
            },
            {
              "symbol": "STORJUSDT",
              "minSize": 0.1
            },
            {
              "symbol": "STPTUSDT",
              "minSize": 10
            },
            {
              "symbol": "STRAXUSDT",
              "minSize": 1
            },
            {
              "symbol": "SUIUSDT",
              "minSize": 10
            },
            {
              "symbol": "SUNUSDT",
              "minSize": 10
            },
            {
              "symbol": "SUPERUSDT",
              "minSize": 1
            },
            {
              "symbol": "SUSHIUSDT",
              "minSize": 0.1
            },
            {
              "symbol": "SWEATUSDT",
              "minSize": 10
            },
            {
              "symbol": "SXPUSDT",
              "minSize": 0.1
            },
            {
              "symbol": "THETAUSDT",
              "minSize": 0.1
            },
            {
              "symbol": "TIAUSDT",
              "minSize": 0.1
            },
            {
              "symbol": "TLMUSDT",
              "minSize": 1
            },
            {
              "symbol": "TOKENUSDT",
              "minSize": 10
            },
            {
              "symbol": "TOMIUSDT",
              "minSize": 0.1
            },
            {
              "symbol": "TONUSDT",
              "minSize": 0.1
            },
            {
              "symbol": "TRBUSDT",
              "minSize": 0.01
            },
            {
              "symbol": "TRUUSDT",
              "minSize": 1
            },
            {
              "symbol": "TRXUSDT",
              "minSize": 1
            },
            {
              "symbol": "TUSDT",
              "minSize": 10
            },
            {
              "symbol": "TWTUSDT",
              "minSize": 0.1
            },
            {
              "symbol": "UMAUSDT",
              "minSize": 0.1
            },
            {
              "symbol": "UNIUSDT",
              "minSize": 0.1
            },
            {
              "symbol": "USDCUSDT",
              "minSize": 0.1
            },
            {
              "symbol": "USTCUSDT",
              "minSize": 10
            },
            {
              "symbol": "VETUSDT",
              "minSize": 1
            },
            {
              "symbol": "VGXUSDT",
              "minSize": 1
            },
            {
              "symbol": "VRAUSDT",
              "minSize": 100
            },
            {
              "symbol": "WAVESUSDT",
              "minSize": 0.1
            },
            {
              "symbol": "WAXPUSDT",
              "minSize": 10
            },
            {
              "symbol": "WIFUSDT",
              "minSize": 1
            },
            {
              "symbol": "WLDUSDT",
              "minSize": 0.1
            },
            {
              "symbol": "WOOUSDT",
              "minSize": 0.1
            },
            {
              "symbol": "WSMUSDT",
              "minSize": 10
            },
            {
              "symbol": "XAIUSDT",
              "minSize": 1
            },
            {
              "symbol": "XEMUSDT",
              "minSize": 1
            },
            {
              "symbol": "XLMUSDT",
              "minSize": 1
            },
            {
              "symbol": "XMRUSDT",
              "minSize": 0.01
            },
            {
              "symbol": "XRDUSDT",
              "minSize": 10
            },
            {
              "symbol": "XRPUSDT",
              "minSize": 1
            },
            {
              "symbol": "XTZUSDT",
              "minSize": 0.1
            },
            {
              "symbol": "XVGUSDT",
              "minSize": 100
            },
            {
              "symbol": "XVSUSDT",
              "minSize": 0.1
            },
            {
              "symbol": "YFIIUSDT",
              "minSize": 0.001
            },
            {
              "symbol": "YFIUSDT",
              "minSize": 0.0001
            },
            {
              "symbol": "YGGUSDT",
              "minSize": 0.1
            },
            {
              "symbol": "ZECUSDT",
              "minSize": 0.01
            },
            {
              "symbol": "ZENUSDT",
              "minSize": 0.1
            },
            {
              "symbol": "ZILUSDT",
              "minSize": 10
            },
            {
              "symbol": "ZKFUSDT",
              "minSize": 10
            },
            {
              "symbol": "ZRXUSDT",
              "minSize": 1
            }
          ];

          coins.forEach( async (x) => {
            await sleep(2000);
            const endpoint="/v5/position/set-leverage";
            const data = '{"category":"linear","symbol":"'+x.symbol+'","buyLeverage":"20","sellLeverage":"20"}';
            http_request(endpoint,"POST",data,"Set Leverage", function(results) {
                console.log(JSON.stringify(results));
            });
          });
    } catch (error) {
        console.log(error);
    }
});

router.get('/instruments', async function(req, res, next) {
    try {
        const endpoint="/v5/market/instruments-info";
        const data = 'category=linear&symbol=';
        http_request(endpoint,"GET",data,"Get Instruments Info", function(resp) {
            let coins = [];
            resp.result.list.map(x => {
                if (x.settleCoin == 'USDT') {
                    coins.push({
                        symbol: x.symbol,
                        minSize: Number(x.lotSizeFilter.minOrderQty),
                        maxLeverage: Number(x.leverageFilter.maxLeverage),
                        minPrice: Number(x.priceFilter.minPrice),
                    });
                }
            });
            res.send(coins);
        });
    } catch (error) {
        console.log(error);
    }
});

router.get('/tickers', async function(req, res, next) {
    try {
        const endpoint="/v5/market/tickers";
        const data = 'category=linear&symbol=';
        http_request(endpoint,"GET",data,"Get Tickers", async function(resp) {
            let results = [];
            await Promise.all(
              resp.result.list.map( async (x) => {
                const ins = await bybitAPI.get_instrument(x.symbol);
                results.push({symbol: x.symbol, minSize: Number(ins.result.list[0].lotSizeFilter.minOrderQty)});
              })
            );
            res.send(resp.result.list);
        });
    } catch (error) {
        console.log(error);
    }
});

router.get('/pnl/:symbol?', async function(req, res, next) {
    const symbol = req.params.symbol ? req.params.symbol : '';
    try {
        const endpoint="/v5/position/closed-pnl";
        const data = 'category=linear&settleCoin=USDT&limit=1&symbol='+symbol;
        http_request(endpoint,"GET",data,"Get Asset Delivery", function(resp) {
            res.send(resp.result.list);
        });
    } catch (error) {
        console.log(error);
    }
});

router.get('/bnb_traders', async function(req, res, next) {
  try {
      const results = await binanceAPI.copy_traders('30D', 'PNL');
      if (results && results.data.list.length) {
        const data = [];
        results.data.list.map(x => {
          if (x.mdd) {
            x.rmd = x.roi/x.mdd;
            data.push(x);
          }
        });
        res.send(sortByKey(data, 'rmd'));
      }
  } catch (error) {
      console.log(error);
  }
});

router.get('/market_pairs', async function(req, res, next) {
  try {
    const rawResponse = await fetch(
      "https://api.coinmarketcap.com/data-api/v3/exchange/market-pairs/latest?slug=bybit&category=perpetual&start=1&limit=50", 
      {
      "headers": {
        "content-type": "application/json",
      },
      "method": "get"
    });

    const content = await rawResponse.json();
    let data = [];
    let i = 1;
    content.data.marketPairs.forEach(x => {
      if (x.quoteSymbol == 'USDT') {
        if (i > 30) return;
        data.push(x.marketPair.replace('/',''));
        i++;
      }
    });
    res.send(data);
  } catch (error) {
      console.log(error);
  }
});

router.get('/binance', async function(req, res, next) {
  const rawResponse = await fetch("https://www.binance.com/bapi/futures/v2/private/future/leaderboard/getOtherPosition", {
    "headers": {
      "clienttype": "web",
      "content-type": "application/json",
      "csrftoken": "b0115606477abf44ef13d49de5def78a",
      "cookie": "bnc-uuid=0159c450-3e29-4dc0-8314-3d91a1d452cd; userPreferredCurrency=USD_USD; se_gd=hURWgAA4KTAEBwW0ACQYgZZCBCRUYBXW1tWZdUUNlFVVwAFNWUUF1; se_gsd=AiMgLwVgMCMkIFYoNQMiCjY3FRBbBwoSUlhEV1VXU1FTNFNT1; BNC-Location=BINANCE; _gac_UA-162512367-1=1.1700141623.EAIaIQobChMI59642dDIggMVXtIWBR3ArwKSEAAYASAAEgLSpPD_BwE; OptanonAlertBoxClosed=2023-11-16T13:33:46.631Z; source=referral; campaign=accounts.binance.com; pl-id=403987308; rskxRunCookie=0; rCookie=cbz6zjlp97l1d01pc52auclp18u5we; lastRskxRun=1700142345078; camp-key=; fiat-prefer-currency=VND; _gcl_au=1.1.1086810379.1700669495; se_sd=QsOEhVllQAUEFULsRAwZgZZXAHRQUEVVlAFNcW05lRWVgC1NWUIL1; logined=y; _gid=GA1.2.825505497.1705387232; BNC_FV_KEY=337baef7ca6ea9308ffa68febd82cf3055d1b5db; changeBasisTimeZone=7; _uetvid=387092e0b49211ee89e6ff8fd55c35ac; futures-layout=pro; sensorsdata2015jssdkcross=%7B%22distinct_id%22%3A%22403987308%22%2C%22first_id%22%3A%2218d110018a523b-0f5932377bf62b-26001951-1049088-18d110018a621%22%2C%22props%22%3A%7B%22%24latest_traffic_source_type%22%3A%22%E7%9B%B4%E6%8E%A5%E6%B5%81%E9%87%8F%22%2C%22%24latest_search_keyword%22%3A%22%E6%9C%AA%E5%8F%96%E5%88%B0%E5%80%BC_%E7%9B%B4%E6%8E%A5%E6%89%93%E5%BC%80%22%2C%22%24latest_referrer%22%3A%22%22%7D%2C%22identities%22%3A%22eyIkaWRlbnRpdHlfY29va2llX2lkIjoiMThkMTEwMDE4YTUyM2ItMGY1OTMyMzc3YmY2MmItMjYwMDE5NTEtMTA0OTA4OC0xOGQxMTAwMThhNjIxIiwiJGlkZW50aXR5X2xvZ2luX2lkIjoiNDAzOTg3MzA4In0%3D%22%2C%22history_login_id%22%3A%7B%22name%22%3A%22%24identity_login_id%22%2C%22value%22%3A%22403987308%22%7D%2C%22%24device_id%22%3A%2218d110018a523b-0f5932377bf62b-26001951-1049088-18d110018a621%22%7D; BNC_FV_KEY_T=101-d3SJb6DysUxAyjkNY0xD%2FaTKP%2Fb4cmVNWL9R5VzZkTr9DSmaRquIccIzPAVEc62%2BTqmqtaK0ujToV9fpMgpL4A%3D%3D-FCK%2FH5UaarGhZbOmGrmu2g%3D%3D-85; BNC_FV_KEY_EXPIRE=1705748593900; s9r1=1B28788F213171F5BF49066B2D431067; cr00=9BB9D3CED911FD049EF654E7A12CDFE3; d1og=web.403987308.BF46725CE4BDB6721D85413896E278A1; r2o1=web.403987308.038E522A467ACF76FCEADB440EBE50C9; f30l=web.403987308.E9FE6DEB04B972F80C2BDBB6AAA05A0C; __BNC_USER_DEVICE_ID__={\"0c570ba87afc38bd75b44844895ec393\":{\"date\":1705727040886,\"value\":\"\"}}; p20t=web.403987308.A039366D0A6A8D9E17BDDA6A8FF03F9E; _h_desk_key=676974ce4bdb4170ba556a004b8f091f; _gat_UA-162512367-1=1; lang=en; theme=dark; _ga=GA1.1.1064849854.1705387232; _ga_3WP50LGEEC=GS1.1.1705726994.19.1.1705731611.55.0.0; OptanonConsent=isGpcEnabled=0&datestamp=Sat+Jan+20+2024+13%3A20%3A11+GMT%2B0700+(Indochina+Time)&version=202303.2.0&browserGpcFlag=0&geolocation=VN%3B54&isIABGlobal=false&hosts=&consentId=5c6704df-993b-4314-99ac-48676dac1558&interactionCount=1&landingPath=NotLandingPage&groups=C0001%3A1%2CC0003%3A1%2CC0004%3A1%2CC0002%3A1&AwaitingReconsent=false",
    },
    "body": "{\"encryptedUid\":\"A32B3382EA5DB7E7D3EE5C765CB9FCDF\",\"tradeType\":\"PERPETUAL\"}",
    "method": "POST"
  });

  const content = await rawResponse.json();
  res.send(content);
});

function sortByKey(array, key) {
  return array.sort(function(a, b) {
      var x = a[key]; var y = b[key];
      return ((x > y) ? -1 : ((x < y) ? 1 : 0));
  });
}

function getSignature(parameters, secret) {
    return crypto.createHmac('sha256', secret).update(timestamp + apiKey + recvWindow + parameters).digest('hex');
}

async function http_request(endpoint,method,data,Info,callback = false) {
    var sign=getSignature(data,secret);
    var fullendpoint;

    // Build the request URL based on the method
    if (method === "POST") {
        fullendpoint = url + endpoint;
    } else {
        fullendpoint = url + endpoint + "?" + data;
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

    console.log(Info + " Calling....");
    await axios(config)
    .then(function (response) {
        return callback(response.data);
      })
      .catch(function (error) {
        console.log(error.response);
        return callback(error.response);
      });
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

module.exports = router;