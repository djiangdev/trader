const { MongoClient, ServerApiVersion } = require('mongodb');
const crypto = require('crypto');
const axios = require('axios');
const express = require('express');
const cron = require('node-cron');
const moment = require('moment-timezone');
moment.tz.setDefault('Asia/Ho_Chi_Minh');
const logger = require('node-color-log');
const bybitAPI = require('../api/bybit');

logger.setLevel("info");
logger.setDate(() => (moment()).format('LTS'));

const dbUri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.lugbagm.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(dbUri, {
    serverApi: {
      version: ServerApiVersion.v1,
      strict: true,
      deprecationErrors: true,
    }
});

let leaderMark = 'DTkVa1JFRw6%2F%2B%2BRK0WjUWw%3D%3D';
let myBudget = 50; // USDT
let masterBudget = 1000; // USDT
let maxAmountPerOrder = 0.8; // USDT
let unitRate = 0.5; // % vs Master
let maxContracts = 5; // 10
let currentPositions = [];
let logs = [];

const minSizes = [
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

(async () => {
    await client.connect();
    const db = client.db('bybit');

    cron.schedule('*/5 * * * * *', async () => {
        placeOrder(db);
        takeProfit(db);
    });

    listPositions();
    cron.schedule('*/30 * * * * *', async () => {
        listPositions();
    });
})();

async function placeOrder(db) {
    try {
        const listDetail = await http_request_master('/order/list-detail',"GET",'leaderMark='+leaderMark+'&pageSize=10&page=1',"Bybit Copy Trading Orders");
        if(listDetail && listDetail.result.data.length) {
            const data = filterData(listDetail.result.data);
            if (data.length) {
              await Promise.all(data.map( async (x, index) => {
                  x.createdAtE3 = moment(new Date(Number(x.createdAtE3))).unix();
                  let leverage = 10;
                  let masterSize = Number(x.sizeX)/100000000;
                  let masterAmount = (masterSize*x.entryPrice)/leverage;
                  let masterRate = (masterAmount/masterBudget)*100;
                  let myAmount = ((unitRate+masterRate)*myBudget)/100;
                  let mySize = (myAmount*leverage)/x.entryPrice;
                  let coin = minSizes.find(z => x.symbol == z.symbol);
                  masterSize = formatSize(masterSize, coin.minSize);
                  mySize = formatSize(mySize, coin.minSize);
                  if (mySize >= coin.minSize) {
                      const checkOrderExists = await db.collection('orders').find({side: x.side, symbol: x.symbol, createdAtE3: x.createdAtE3}).toArray();
                      if (!checkOrderExists.length) {
                          let markPrice;
                          const exist = currentPositions.find(z => z.symbol == x.symbol && z.side == x.side);
                          if (exist) {
                            markPrice = Number(exist.markPrice);
                            if (!isDCA(x.symbol, x.side, exist.avgPrice, markPrice)) {
                              return;
                            }
                          } else {
                            const ticker = await bybitAPI.get_ticker(x.symbol);
                            markPrice = Number(ticker.result.list[0].markPrice);
                            if (!isDCA(x.symbol, x.side, x.entryPrice, markPrice)) {
                                return;
                            }
                          }
                          //insert database & create order
                          await db.collection('orders').insertMany([x]);
                          const positionIdx = (x.side == 'Buy') ? 1 : 2;
                          await http_request_order('/v5/order/create', 'POST', '{"category":"linear","symbol":"'+x.symbol+'","side": "'+x.side+'","orderType": "Limit","price":"'+markPrice+'","qty": "'+mySize+'","positionIdx":'+positionIdx+'}');
                          logger.info((index+1) +': '+ x.symbol+' ('+coin.minSize+')  '+x.side+'  Master('+ masterSize +'-$'+masterAmount.toFixed(2) + ')  Me(' + mySize +'-$'+myAmount.toFixed(2)+')');
                      }
                  } else {
                      showLog(`${x.symbol} không đủ size: ${mySize} < ${coin.minSize}`, 'warn');
                  }
              }));
            }
        } else {
            logger.warn(JSON.stringify(listDetail));
        }
    } catch (error) {
        logger.error(JSON.stringify(error));
        return error;
    }
}

async function takeProfit(db) {
    try {
        const leaderHistory = await http_request_master('/leader-history',"GET",'page=1&leaderMark='+leaderMark,"Bybit Copy Trading History");
        if(leaderHistory && leaderHistory.result.data.length) {
            const histories = distinct(leaderHistory.result.data, ['closedTimeE3']);
            await Promise.all(histories.map( async (x, index) => {
                x.startedTimeE3 = moment(new Date(Number(x.startedTimeE3))).unix();
                x.closedTimeE3 = moment(new Date(Number(x.closedTimeE3))).unix();
                const exist = currentPositions.find(z => z.symbol == x.symbol && z.side == x.side);
                if (exist) {
                    const updatedTime = moment(new Date(Number(exist.updatedTime))).unix();
                    if (updatedTime < x.closedTimeE3) {
                        const checkHistoryExists = await db.collection('history').find({side: x.side, symbol: x.symbol, closedTimeE3: x.closedTimeE3}).toArray();
                        if (!checkHistoryExists.length) {
                            // insert database & close order
                            await db.collection('history').insertMany([x]);
                            const revertSide = (exist.side == 'Buy') ? 'Sell' : 'Buy';
                            await http_request_order('/v5/order/create', 'POST', '{"category":"linear","symbol":"'+x.symbol+'","side": "'+revertSide+'","orderType": "Market","qty": "'+exist.size+'","positionIdx":'+exist.positionIdx+',"reduceOnly":true}', 'Close order')
                        }
                    }
                }
            }));
        }
    } catch (error) {
        logger.error(JSON.stringify(error));
        return error;
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

function filterData(results) {
  if (currentPositions.length) {
      maxContracts = maxContracts - currentPositions.length;
  }

  let list = [];
  for (let index = 0; index < maxContracts; index++) {
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
            case 'info':
            case 'success':
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

function formatSize(size, stepSize) {
    if(Math.floor(stepSize) === stepSize) return size.toFixed(0);
    const countDecimals = stepSize.toString().split(".")[1].length || 0; 
    return size.toFixed(countDecimals);
}

function isDCA(symbol, side, entry, market) {
    if (
        (side == 'Sell' && Number(market) <= Number(entry)) || 
        (side == 'Buy' && Number(market) >= Number(entry))
    ) {
        showLog(symbol+'('+side+'): (Entry: '+entry+') DCA không hợp lệ!', 'warn');
        return false;
    }
    return true;
}

async function listPositions() {
    const list = await http_request_order('/v5/position/list', 'GET', 'category=linear&settleCoin=USDT');
    if (list && list.result.list.length) {
        currentPositions = list.result.list;
    }
}