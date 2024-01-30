const logger = require('node-color-log');
const cron = require('node-cron');
const bybitAPI = require('./api/bybit');
const moment = require('moment-timezone');
moment.tz.setDefault('Asia/Ho_Chi_Minh');
const sound = require("sound-play");
const path = require("path");
const log = require('node-file-logger');
log.SetUserOptions({
  timeZone: 'Asia/Ho_Chi_Minh',
  dateFormat: 'YYYY_MM_DD',
  timeFormat: 'YYYY-MM-DD HH:mm:ss',
});

let coinInfo = get_coin_info();
let currentPositions = [];
let TP = 100; // %
let SL = 100; // %

(async () => {
  cron.schedule('*/30 * * * * *', async () => {
    currentPositions = await get_positions();
    trailing_stop_loss();
  });
})();

async function trailing_stop_loss() {
  const positions = currentPositions.filter(x => x.unrealisedPnl > 0);
  if (positions.length) {
    await Promise.all(
      positions.map( async (x) => {
        let roi = formatSize((x.unrealisedPnl/x.positionIM)*100, 0.01);
        let initialMargin = x.positionIM;
        let active_price;
        let distance_price;
        let tp_price;
        let tp_percent = 10;
        let active_percent = 20;
        if (roi > 0 && roi < active_percent) {
          const coin = coinInfo.find(z => z.symbol == x.symbol);
          if (x.side == 'Sell') {
            tp_price =  Number(x.avgPrice) - ((tp_percent/100*initialMargin)/x.size);
            active_price =  Number(x.avgPrice) - ((active_percent/100*initialMargin)/x.size);
          }
          if (x.side == 'Buy') {
            tp_price = Number(x.avgPrice) + ((tp_percent/100*initialMargin)/x.size);
            active_price = Number(x.avgPrice) + ((active_percent/100*initialMargin)/x.size);
          }
          distance_price = formatSize(Math.abs(active_price - tp_price), coin.minPrice);
          active_price = formatSize(Math.abs(active_price), coin.minPrice);
          if (distance_price != x.trailingStop) {
            const positionIdx = (x.side == 'Buy') ? 1 : 2;
            await bybitAPI.set_trailing_stop(x.symbol, distance_price, active_price, positionIdx);
          }
        }
      })
    )
  }
}

function get_take_profit_price(coin, side, size, margin, entry) {
  let price =  Number(entry) - ((TP/100*margin)/size);
  if (side == 'Buy') price = Number(entry) + ((TP/100*margin)/size);
  price = formatSize(Math.abs(price), coin.minPrice);
  return price;
}

function get_stop_loss_price(coin, side, size, margin, entry) {
  let price =  Number(entry) + ((SL/100*margin)/size);
  if (side == 'Buy') price = ((TP/100*margin)/size) - Number(entry);
  price = formatSize(Math.abs(price), coin.minPrice);
  return price;
}

function list_positions() {
  return currentPositions;
}

async function get_positions() {
  let positions = [];
  const list = await bybitAPI.get_positions();
  if (list && list.result.list && list.result.list.length) {
    positions = list.result.list;
  }
  return positions;
}

function get_market_pairs() {
  return [
    "BTCUSDT",
    "ETHUSDT",
    "SOLUSDT",
    "SUIUSDT",
    "MANTAUSDT",
    "UMAUSDT",
    "ORDIUSDT",
    "TIAUSDT",
    "TRBUSDT",
    "XAIUSDT",
    "CFXUSDT",
    "SEIUSDT",
    "ALTUSDT",
    "XRPUSDT",
    "10000SATSUSDT",
    "ARBUSDT",
    "AVAXUSDT",
    "ONDOUSDT",
    "ZRXUSDT",
    "WIFUSDT",
    "BLURUSDT",
    "NEARUSDT",
    "MATICUSDT",
    "ADAUSDT",
    "INJUSDT",
    "OPUSDT",
    "LINKUSDT",
    "APTUSDT",
    "1000BONKUSDT",
    "SUPERUSDT"
  ];
}

function get_coin_info() {
    return [
      {
        "symbol": "1000000VINUUSDT",
        "minSize": 100,
        "maxLeverage": 25,
        "minPrice": 0.000001
      },
      {
        "symbol": "10000LADYSUSDT",
        "minSize": 100,
        "maxLeverage": 25,
        "minPrice": 1e-7
      },
      {
        "symbol": "10000NFTUSDT",
        "minSize": 10,
        "maxLeverage": 12.5,
        "minPrice": 0.000001
      },
      {
        "symbol": "10000SATSUSDT",
        "minSize": 100,
        "maxLeverage": 25,
        "minPrice": 0.000001
      },
      {
        "symbol": "10000STARLUSDT",
        "minSize": 10,
        "maxLeverage": 16.67,
        "minPrice": 0.00001
      },
      {
        "symbol": "1000BONKUSDT",
        "minSize": 100,
        "maxLeverage": 25,
        "minPrice": 0.000001
      },
      {
        "symbol": "1000BTTUSDT",
        "minSize": 100,
        "maxLeverage": 12.5,
        "minPrice": 1e-7
      },
      {
        "symbol": "1000FLOKIUSDT",
        "minSize": 1,
        "maxLeverage": 16.67,
        "minPrice": 0.00001
      },
      {
        "symbol": "1000LUNCUSDT",
        "minSize": 1,
        "maxLeverage": 25,
        "minPrice": 0.00001
      },
      {
        "symbol": "1000PEPEUSDT",
        "minSize": 100,
        "maxLeverage": 50,
        "minPrice": 1e-7
      },
      {
        "symbol": "1000RATSUSDT",
        "minSize": 10,
        "maxLeverage": 50,
        "minPrice": 0.00001
      },
      {
        "symbol": "1000XECUSDT",
        "minSize": 10,
        "maxLeverage": 12.5,
        "minPrice": 0.00001
      },
      {
        "symbol": "1CATUSDT",
        "minSize": 10,
        "maxLeverage": 25,
        "minPrice": 0.000001
      },
      {
        "symbol": "1INCHUSDT",
        "minSize": 0.1,
        "maxLeverage": 25,
        "minPrice": 0.0001
      },
      {
        "symbol": "AAVEUSDT",
        "minSize": 0.01,
        "maxLeverage": 25,
        "minPrice": 0.01
      },
      {
        "symbol": "ACEUSDT",
        "minSize": 0.1,
        "maxLeverage": 50,
        "minPrice": 0.001
      },
      {
        "symbol": "ACHUSDT",
        "minSize": 10,
        "maxLeverage": 12.5,
        "minPrice": 0.000001
      },
      {
        "symbol": "ADAUSDT",
        "minSize": 1,
        "maxLeverage": 75,
        "minPrice": 0.0001
      },
      {
        "symbol": "AERGOUSDT",
        "minSize": 1,
        "maxLeverage": 16.67,
        "minPrice": 0.0001
      },
      {
        "symbol": "AGIUSDT",
        "minSize": 10,
        "maxLeverage": 25,
        "minPrice": 0.00001
      },
      {
        "symbol": "AGIXUSDT",
        "minSize": 1,
        "maxLeverage": 25,
        "minPrice": 0.00005
      },
      {
        "symbol": "AGLDUSDT",
        "minSize": 0.1,
        "maxLeverage": 25,
        "minPrice": 0.0001
      },
      {
        "symbol": "AIUSDT",
        "minSize": 0.1,
        "maxLeverage": 50,
        "minPrice": 0.0001
      },
      {
        "symbol": "AKROUSDT",
        "minSize": 100,
        "maxLeverage": 25,
        "minPrice": 0.000001
      },
      {
        "symbol": "ALGOUSDT",
        "minSize": 0.1,
        "maxLeverage": 25,
        "minPrice": 0.0001
      },
      {
        "symbol": "ALICEUSDT",
        "minSize": 0.1,
        "maxLeverage": 25,
        "minPrice": 0.001
      },
      {
        "symbol": "ALPACAUSDT",
        "minSize": 1,
        "maxLeverage": 25,
        "minPrice": 0.00001
      },
      {
        "symbol": "ALPHAUSDT",
        "minSize": 1,
        "maxLeverage": 12.5,
        "minPrice": 0.00001
      },
      {
        "symbol": "ALTUSDT",
        "minSize": 1,
        "maxLeverage": 25,
        "minPrice": 0.0001
      },
      {
        "symbol": "AMBUSDT",
        "minSize": 10,
        "maxLeverage": 12.5,
        "minPrice": 0.000001
      },
      {
        "symbol": "ANKRUSDT",
        "minSize": 1,
        "maxLeverage": 25,
        "minPrice": 0.00001
      },
      {
        "symbol": "ANTUSDT",
        "minSize": 0.1,
        "maxLeverage": 12.5,
        "minPrice": 0.001
      },
      {
        "symbol": "APEUSDT",
        "minSize": 0.1,
        "maxLeverage": 50,
        "minPrice": 0.0001
      },
      {
        "symbol": "API3USDT",
        "minSize": 0.1,
        "maxLeverage": 12.5,
        "minPrice": 0.001
      },
      {
        "symbol": "APTUSDT",
        "minSize": 0.01,
        "maxLeverage": 25,
        "minPrice": 0.0005
      },
      {
        "symbol": "ARBUSDT",
        "minSize": 0.1,
        "maxLeverage": 50,
        "minPrice": 0.0001
      },
      {
        "symbol": "ARKMUSDT",
        "minSize": 1,
        "maxLeverage": 25,
        "minPrice": 0.00005
      },
      {
        "symbol": "ARKUSDT",
        "minSize": 1,
        "maxLeverage": 25,
        "minPrice": 0.0001
      },
      {
        "symbol": "ARPAUSDT",
        "minSize": 10,
        "maxLeverage": 25,
        "minPrice": 0.00001
      },
      {
        "symbol": "ARUSDT",
        "minSize": 0.1,
        "maxLeverage": 12.5,
        "minPrice": 0.001
      },
      {
        "symbol": "ASTRUSDT",
        "minSize": 1,
        "maxLeverage": 12.5,
        "minPrice": 0.000005
      },
      {
        "symbol": "ATAUSDT",
        "minSize": 10,
        "maxLeverage": 25,
        "minPrice": 0.00001
      },
      {
        "symbol": "ATOMUSDT",
        "minSize": 1,
        "maxLeverage": 12.5,
        "minPrice": 0.05
      },
      {
        "symbol": "AUCTIONUSDT",
        "minSize": 0.1,
        "maxLeverage": 25,
        "minPrice": 0.001
      },
      {
        "symbol": "AUDIOUSDT",
        "minSize": 0.1,
        "maxLeverage": 16.67,
        "minPrice": 0.0001
      },
      {
        "symbol": "AVAXUSDT",
        "minSize": 0.1,
        "maxLeverage": 25,
        "minPrice": 0.005
      },
      {
        "symbol": "AXLUSDT",
        "minSize": 1,
        "maxLeverage": 25,
        "minPrice": 0.0001
      },
      {
        "symbol": "AXSUSDT",
        "minSize": 0.1,
        "maxLeverage": 50,
        "minPrice": 0.001
      },
      {
        "symbol": "BADGERUSDT",
        "minSize": 0.1,
        "maxLeverage": 25,
        "minPrice": 0.001
      },
      {
        "symbol": "BAKEUSDT",
        "minSize": 0.1,
        "maxLeverage": 25,
        "minPrice": 0.0001
      },
      {
        "symbol": "BALUSDT",
        "minSize": 0.01,
        "maxLeverage": 25,
        "minPrice": 0.001
      },
      {
        "symbol": "BANDUSDT",
        "minSize": 0.1,
        "maxLeverage": 12.5,
        "minPrice": 0.001
      },
      {
        "symbol": "BATUSDT",
        "minSize": 0.1,
        "maxLeverage": 25,
        "minPrice": 0.0001
      },
      {
        "symbol": "BCHUSDT",
        "minSize": 0.01,
        "maxLeverage": 75,
        "minPrice": 0.05
      },
      {
        "symbol": "BEAMUSDT",
        "minSize": 100,
        "maxLeverage": 16.67,
        "minPrice": 0.000001
      },
      {
        "symbol": "BELUSDT",
        "minSize": 1,
        "maxLeverage": 25,
        "minPrice": 0.0001
      },
      {
        "symbol": "BIGTIMEUSDT",
        "minSize": 1,
        "maxLeverage": 25,
        "minPrice": 0.0001
      },
      {
        "symbol": "BLURUSDT",
        "minSize": 1,
        "maxLeverage": 25,
        "minPrice": 0.0001
      },
      {
        "symbol": "BLZUSDT",
        "minSize": 1,
        "maxLeverage": 25,
        "minPrice": 0.0001
      },
      {
        "symbol": "BNBUSDT",
        "minSize": 0.01,
        "maxLeverage": 25,
        "minPrice": 0.5
      },
      {
        "symbol": "BNTUSDT",
        "minSize": 1,
        "maxLeverage": 50,
        "minPrice": 0.00005
      },
      {
        "symbol": "BNXUSDT",
        "minSize": 0.1,
        "maxLeverage": 25,
        "minPrice": 0.0001
      },
      {
        "symbol": "BOBAUSDT",
        "minSize": 0.1,
        "maxLeverage": 12.5,
        "minPrice": 0.00001
      },
      {
        "symbol": "BONDUSDT",
        "minSize": 0.1,
        "maxLeverage": 25,
        "minPrice": 0.001
      },
      {
        "symbol": "BSVUSDT",
        "minSize": 0.01,
        "maxLeverage": 25,
        "minPrice": 0.01
      },
      {
        "symbol": "BSWUSDT",
        "minSize": 1,
        "maxLeverage": 25,
        "minPrice": 0.00001
      },
      {
        "symbol": "BTCUSDT",
        "minSize": 0.001,
        "maxLeverage": 100,
        "minPrice": 0.1
      },
      {
        "symbol": "C98USDT",
        "minSize": 0.1,
        "maxLeverage": 25,
        "minPrice": 0.0001
      },
      {
        "symbol": "CAKEUSDT",
        "minSize": 0.1,
        "maxLeverage": 50,
        "minPrice": 0.001
      },
      {
        "symbol": "CEEKUSDT",
        "minSize": 1,
        "maxLeverage": 16.67,
        "minPrice": 0.00001
      },
      {
        "symbol": "CELOUSDT",
        "minSize": 0.1,
        "maxLeverage": 12.5,
        "minPrice": 0.0001
      },
      {
        "symbol": "CELRUSDT",
        "minSize": 1,
        "maxLeverage": 25,
        "minPrice": 0.00001
      },
      {
        "symbol": "CFXUSDT",
        "minSize": 1,
        "maxLeverage": 50,
        "minPrice": 0.00001
      },
      {
        "symbol": "CHZUSDT",
        "minSize": 1,
        "maxLeverage": 25,
        "minPrice": 0.00001
      },
      {
        "symbol": "CKBUSDT",
        "minSize": 10,
        "maxLeverage": 12.5,
        "minPrice": 0.000001
      },
      {
        "symbol": "COMBOUSDT",
        "minSize": 0.1,
        "maxLeverage": 12.5,
        "minPrice": 0.0001
      },
      {
        "symbol": "COMPUSDT",
        "minSize": 0.01,
        "maxLeverage": 25,
        "minPrice": 0.01
      },
      {
        "symbol": "COREUSDT",
        "minSize": 0.1,
        "maxLeverage": 25,
        "minPrice": 0.0001
      },
      {
        "symbol": "COTIUSDT",
        "minSize": 1,
        "maxLeverage": 16.67,
        "minPrice": 0.00001
      },
      {
        "symbol": "CROUSDT",
        "minSize": 1,
        "maxLeverage": 25,
        "minPrice": 0.00001
      },
      {
        "symbol": "CRVUSDT",
        "minSize": 0.1,
        "maxLeverage": 25,
        "minPrice": 0.0001
      },
      {
        "symbol": "CTCUSDT",
        "minSize": 1,
        "maxLeverage": 12.5,
        "minPrice": 0.00005
      },
      {
        "symbol": "CTKUSDT",
        "minSize": 0.1,
        "maxLeverage": 16.67,
        "minPrice": 0.0001
      },
      {
        "symbol": "CTSIUSDT",
        "minSize": 1,
        "maxLeverage": 25,
        "minPrice": 0.00001
      },
      {
        "symbol": "CVCUSDT",
        "minSize": 1,
        "maxLeverage": 25,
        "minPrice": 0.00001
      },
      {
        "symbol": "CVXUSDT",
        "minSize": 0.01,
        "maxLeverage": 25,
        "minPrice": 0.001
      },
      {
        "symbol": "CYBERUSDT",
        "minSize": 0.1,
        "maxLeverage": 25,
        "minPrice": 0.001
      },
      {
        "symbol": "DARUSDT",
        "minSize": 0.1,
        "maxLeverage": 25,
        "minPrice": 0.0001
      },
      {
        "symbol": "DASHUSDT",
        "minSize": 0.01,
        "maxLeverage": 25,
        "minPrice": 0.01
      },
      {
        "symbol": "DATAUSDT",
        "minSize": 10,
        "maxLeverage": 25,
        "minPrice": 0.00001
      },
      {
        "symbol": "DENTUSDT",
        "minSize": 100,
        "maxLeverage": 12.5,
        "minPrice": 1e-7
      },
      {
        "symbol": "DGBUSDT",
        "minSize": 10,
        "maxLeverage": 25,
        "minPrice": 0.000001
      },
      {
        "symbol": "DODOUSDT",
        "minSize": 1,
        "maxLeverage": 25,
        "minPrice": 0.00001
      },
      {
        "symbol": "DOGEUSDT",
        "minSize": 1,
        "maxLeverage": 75,
        "minPrice": 0.00001
      },
      {
        "symbol": "DOTUSDT",
        "minSize": 0.1,
        "maxLeverage": 25,
        "minPrice": 0.001
      },
      {
        "symbol": "DUSKUSDT",
        "minSize": 1,
        "maxLeverage": 12.5,
        "minPrice": 0.00001
      },
      {
        "symbol": "DYDXUSDT",
        "minSize": 0.1,
        "maxLeverage": 50,
        "minPrice": 0.001
      },
      {
        "symbol": "EDUUSDT",
        "minSize": 0.1,
        "maxLeverage": 25,
        "minPrice": 0.0001
      },
      {
        "symbol": "EGLDUSDT",
        "minSize": 0.01,
        "maxLeverage": 25,
        "minPrice": 0.01
      },
      {
        "symbol": "ENJUSDT",
        "minSize": 0.1,
        "maxLeverage": 25,
        "minPrice": 0.0001
      },
      {
        "symbol": "ENSUSDT",
        "minSize": 0.1,
        "maxLeverage": 25,
        "minPrice": 0.001
      },
      {
        "symbol": "EOSUSDT",
        "minSize": 0.1,
        "maxLeverage": 25,
        "minPrice": 0.0001
      },
      {
        "symbol": "ETCUSDT",
        "minSize": 0.1,
        "maxLeverage": 50,
        "minPrice": 0.001
      },
      {
        "symbol": "ETHUSDT",
        "minSize": 0.01,
        "maxLeverage": 100,
        "minPrice": 0.01
      },
      {
        "symbol": "ETHWUSDT",
        "minSize": 0.01,
        "maxLeverage": 25,
        "minPrice": 0.001
      },
      {
        "symbol": "FETUSDT",
        "minSize": 1,
        "maxLeverage": 25,
        "minPrice": 0.00005
      },
      {
        "symbol": "FILUSDT",
        "minSize": 0.1,
        "maxLeverage": 25,
        "minPrice": 0.001
      },
      {
        "symbol": "FITFIUSDT",
        "minSize": 1,
        "maxLeverage": 50,
        "minPrice": 0.000001
      },
      {
        "symbol": "FLMUSDT",
        "minSize": 1,
        "maxLeverage": 25,
        "minPrice": 0.00001
      },
      {
        "symbol": "FLOWUSDT",
        "minSize": 0.1,
        "maxLeverage": 25,
        "minPrice": 0.0001
      },
      {
        "symbol": "FLRUSDT",
        "minSize": 10,
        "maxLeverage": 25,
        "minPrice": 0.00001
      },
      {
        "symbol": "FORTHUSDT",
        "minSize": 0.1,
        "maxLeverage": 25,
        "minPrice": 0.001
      },
      {
        "symbol": "FRONTUSDT",
        "minSize": 1,
        "maxLeverage": 25,
        "minPrice": 0.0001
      },
      {
        "symbol": "FTMUSDT",
        "minSize": 1,
        "maxLeverage": 75,
        "minPrice": 0.0001
      },
      {
        "symbol": "FUNUSDT",
        "minSize": 100,
        "maxLeverage": 25,
        "minPrice": 0.000001
      },
      {
        "symbol": "FXSUSDT",
        "minSize": 0.01,
        "maxLeverage": 25,
        "minPrice": 0.0005
      },
      {
        "symbol": "GALAUSDT",
        "minSize": 1,
        "maxLeverage": 75,
        "minPrice": 0.00001
      },
      {
        "symbol": "GASUSDT",
        "minSize": 0.1,
        "maxLeverage": 25,
        "minPrice": 0.001
      },
      {
        "symbol": "GFTUSDT",
        "minSize": 1,
        "maxLeverage": 25,
        "minPrice": 0.00001
      },
      {
        "symbol": "GLMRUSDT",
        "minSize": 0.1,
        "maxLeverage": 25,
        "minPrice": 0.00005
      },
      {
        "symbol": "GLMUSDT",
        "minSize": 1,
        "maxLeverage": 25,
        "minPrice": 0.0001
      },
      {
        "symbol": "GMTUSDT",
        "minSize": 1,
        "maxLeverage": 50,
        "minPrice": 0.0001
      },
      {
        "symbol": "GMXUSDT",
        "minSize": 0.01,
        "maxLeverage": 25,
        "minPrice": 0.005
      },
      {
        "symbol": "GODSUSDT",
        "minSize": 1,
        "maxLeverage": 50,
        "minPrice": 0.0001
      },
      {
        "symbol": "GPTUSDT",
        "minSize": 1,
        "maxLeverage": 25,
        "minPrice": 0.000001
      },
      {
        "symbol": "GRTUSDT",
        "minSize": 0.1,
        "maxLeverage": 25,
        "minPrice": 0.00001
      },
      {
        "symbol": "HBARUSDT",
        "minSize": 1,
        "maxLeverage": 25,
        "minPrice": 0.00001
      },
      {
        "symbol": "HFTUSDT",
        "minSize": 1,
        "maxLeverage": 25,
        "minPrice": 0.0001
      },
      {
        "symbol": "HIFIUSDT",
        "minSize": 1,
        "maxLeverage": 25,
        "minPrice": 0.0001
      },
      {
        "symbol": "HIGHUSDT",
        "minSize": 0.1,
        "maxLeverage": 25,
        "minPrice": 0.0001
      },
      {
        "symbol": "HNTUSDT",
        "minSize": 0.01,
        "maxLeverage": 12.5,
        "minPrice": 0.001
      },
      {
        "symbol": "HOOKUSDT",
        "minSize": 0.1,
        "maxLeverage": 25,
        "minPrice": 0.0001
      },
      {
        "symbol": "HOTUSDT",
        "minSize": 100,
        "maxLeverage": 25,
        "minPrice": 0.000001
      },
      {
        "symbol": "ICPUSDT",
        "minSize": 0.1,
        "maxLeverage": 25,
        "minPrice": 0.001
      },
      {
        "symbol": "ICXUSDT",
        "minSize": 1,
        "maxLeverage": 25,
        "minPrice": 0.0001
      },
      {
        "symbol": "IDEXUSDT",
        "minSize": 10,
        "maxLeverage": 25,
        "minPrice": 0.00001
      },
      {
        "symbol": "IDUSDT",
        "minSize": 1,
        "maxLeverage": 25,
        "minPrice": 0.00005
      },
      {
        "symbol": "ILVUSDT",
        "minSize": 0.01,
        "maxLeverage": 25,
        "minPrice": 0.005
      },
      {
        "symbol": "IMXUSDT",
        "minSize": 0.1,
        "maxLeverage": 12.5,
        "minPrice": 0.0001
      },
      {
        "symbol": "INJUSDT",
        "minSize": 0.1,
        "maxLeverage": 25,
        "minPrice": 0.001
      },
      {
        "symbol": "IOSTUSDT",
        "minSize": 1,
        "maxLeverage": 25,
        "minPrice": 0.000001
      },
      {
        "symbol": "IOTAUSDT",
        "minSize": 0.1,
        "maxLeverage": 25,
        "minPrice": 0.0001
      },
      {
        "symbol": "IOTXUSDT",
        "minSize": 1,
        "maxLeverage": 25,
        "minPrice": 0.00001
      },
      {
        "symbol": "JASMYUSDT",
        "minSize": 1,
        "maxLeverage": 12.5,
        "minPrice": 0.000001
      },
      {
        "symbol": "JOEUSDT",
        "minSize": 1,
        "maxLeverage": 25,
        "minPrice": 0.00005
      },
      {
        "symbol": "JSTUSDT",
        "minSize": 10,
        "maxLeverage": 12.5,
        "minPrice": 0.00001
      },
      {
        "symbol": "JTOUSDT",
        "minSize": 0.1,
        "maxLeverage": 50,
        "minPrice": 0.001
      },
      {
        "symbol": "KASUSDT",
        "minSize": 10,
        "maxLeverage": 25,
        "minPrice": 0.00001
      },
      {
        "symbol": "KAVAUSDT",
        "minSize": 0.1,
        "maxLeverage": 12.5,
        "minPrice": 0.0001
      },
      {
        "symbol": "KDAUSDT",
        "minSize": 0.1,
        "maxLeverage": 12.5,
        "minPrice": 0.0001
      },
      {
        "symbol": "KEYUSDT",
        "minSize": 100,
        "maxLeverage": 12.5,
        "minPrice": 5e-7
      },
      {
        "symbol": "KLAYUSDT",
        "minSize": 0.1,
        "maxLeverage": 25,
        "minPrice": 0.0001
      },
      {
        "symbol": "KNCUSDT",
        "minSize": 0.1,
        "maxLeverage": 25,
        "minPrice": 0.0001
      },
      {
        "symbol": "KSMUSDT",
        "minSize": 0.01,
        "maxLeverage": 25,
        "minPrice": 0.01
      },
      {
        "symbol": "LDOUSDT",
        "minSize": 0.1,
        "maxLeverage": 25,
        "minPrice": 0.0005
      },
      {
        "symbol": "LEVERUSDT",
        "minSize": 100,
        "maxLeverage": 25,
        "minPrice": 0.000001
      },
      {
        "symbol": "LINAUSDT",
        "minSize": 10,
        "maxLeverage": 25,
        "minPrice": 0.000001
      },
      {
        "symbol": "LINKUSDT",
        "minSize": 0.1,
        "maxLeverage": 25,
        "minPrice": 0.001
      },
      {
        "symbol": "LITUSDT",
        "minSize": 0.1,
        "maxLeverage": 16.67,
        "minPrice": 0.0001
      },
      {
        "symbol": "LOOKSUSDT",
        "minSize": 0.1,
        "maxLeverage": 12.5,
        "minPrice": 0.00001
      },
      {
        "symbol": "LOOMUSDT",
        "minSize": 10,
        "maxLeverage": 16.67,
        "minPrice": 0.00001
      },
      {
        "symbol": "LPTUSDT",
        "minSize": 0.1,
        "maxLeverage": 25,
        "minPrice": 0.001
      },
      {
        "symbol": "LQTYUSDT",
        "minSize": 0.1,
        "maxLeverage": 25,
        "minPrice": 0.0001
      },
      {
        "symbol": "LRCUSDT",
        "minSize": 0.1,
        "maxLeverage": 25,
        "minPrice": 0.0001
      },
      {
        "symbol": "LSKUSDT",
        "minSize": 0.1,
        "maxLeverage": 25,
        "minPrice": 0.001
      },
      {
        "symbol": "LTCUSDT",
        "minSize": 0.1,
        "maxLeverage": 50,
        "minPrice": 0.01
      },
      {
        "symbol": "LUNA2USDT",
        "minSize": 0.1,
        "maxLeverage": 25,
        "minPrice": 0.0001
      },
      {
        "symbol": "MAGICUSDT",
        "minSize": 1,
        "maxLeverage": 25,
        "minPrice": 0.0001
      },
      {
        "symbol": "MANAUSDT",
        "minSize": 0.1,
        "maxLeverage": 25,
        "minPrice": 0.0001
      },
      {
        "symbol": "MANTAUSDT",
        "minSize": 0.1,
        "maxLeverage": 50,
        "minPrice": 0.0001
      },
      {
        "symbol": "MASKUSDT",
        "minSize": 0.1,
        "maxLeverage": 25,
        "minPrice": 0.001
      },
      {
        "symbol": "MATICUSDT",
        "minSize": 1,
        "maxLeverage": 75,
        "minPrice": 0.0001
      },
      {
        "symbol": "MAVUSDT",
        "minSize": 1,
        "maxLeverage": 50,
        "minPrice": 0.0001
      },
      {
        "symbol": "MBLUSDT",
        "minSize": 100,
        "maxLeverage": 16.67,
        "minPrice": 0.000001
      },
      {
        "symbol": "MBOXUSDT",
        "minSize": 1,
        "maxLeverage": 12.5,
        "minPrice": 0.0001
      },
      {
        "symbol": "MDTUSDT",
        "minSize": 10,
        "maxLeverage": 25,
        "minPrice": 0.000005
      },
      {
        "symbol": "MEMEUSDT",
        "minSize": 10,
        "maxLeverage": 50,
        "minPrice": 0.00001
      },
      {
        "symbol": "METISUSDT",
        "minSize": 0.01,
        "maxLeverage": 50,
        "minPrice": 0.01
      },
      {
        "symbol": "MINAUSDT",
        "minSize": 0.1,
        "maxLeverage": 25,
        "minPrice": 0.0001
      },
      {
        "symbol": "MKRUSDT",
        "minSize": 0.001,
        "maxLeverage": 25,
        "minPrice": 0.1
      },
      {
        "symbol": "MNTUSDT",
        "minSize": 1,
        "maxLeverage": 25,
        "minPrice": 0.0001
      },
      {
        "symbol": "MOVRUSDT",
        "minSize": 0.1,
        "maxLeverage": 50,
        "minPrice": 0.001
      },
      {
        "symbol": "MTLUSDT",
        "minSize": 0.1,
        "maxLeverage": 25,
        "minPrice": 0.0001
      },
      {
        "symbol": "MULTIUSDT",
        "minSize": 0.1,
        "maxLeverage": 16.67,
        "minPrice": 0.001
      },
      {
        "symbol": "MYRIAUSDT",
        "minSize": 10,
        "maxLeverage": 12.5,
        "minPrice": 0.000001
      },
      {
        "symbol": "MYROUSDT",
        "minSize": 1,
        "maxLeverage": 25,
        "minPrice": 0.0001
      },
      {
        "symbol": "NEARUSDT",
        "minSize": 0.1,
        "maxLeverage": 25,
        "minPrice": 0.001
      },
      {
        "symbol": "NEOUSDT",
        "minSize": 0.01,
        "maxLeverage": 12.5,
        "minPrice": 0.001
      },
      {
        "symbol": "NFPUSDT",
        "minSize": 0.1,
        "maxLeverage": 50,
        "minPrice": 0.0001
      },
      {
        "symbol": "NKNUSDT",
        "minSize": 1,
        "maxLeverage": 12.5,
        "minPrice": 0.00001
      },
      {
        "symbol": "NMRUSDT",
        "minSize": 0.1,
        "maxLeverage": 25,
        "minPrice": 0.001
      },
      {
        "symbol": "NTRNUSDT",
        "minSize": 1,
        "maxLeverage": 16.67,
        "minPrice": 0.0001
      },
      {
        "symbol": "OCEANUSDT",
        "minSize": 1,
        "maxLeverage": 12.5,
        "minPrice": 0.0001
      },
      {
        "symbol": "OGNUSDT",
        "minSize": 1,
        "maxLeverage": 25,
        "minPrice": 0.0001
      },
      {
        "symbol": "OGUSDT",
        "minSize": 0.1,
        "maxLeverage": 25,
        "minPrice": 0.001
      },
      {
        "symbol": "OMGUSDT",
        "minSize": 0.1,
        "maxLeverage": 25,
        "minPrice": 0.0001
      },
      {
        "symbol": "ONDOUSDT",
        "minSize": 1,
        "maxLeverage": 50,
        "minPrice": 0.0001
      },
      {
        "symbol": "ONEUSDT",
        "minSize": 1,
        "maxLeverage": 25,
        "minPrice": 0.00001
      },
      {
        "symbol": "ONGUSDT",
        "minSize": 1,
        "maxLeverage": 50,
        "minPrice": 0.0001
      },
      {
        "symbol": "ONTUSDT",
        "minSize": 1,
        "maxLeverage": 25,
        "minPrice": 0.00005
      },
      {
        "symbol": "OPUSDT",
        "minSize": 0.1,
        "maxLeverage": 50,
        "minPrice": 0.0001
      },
      {
        "symbol": "ORBSUSDT",
        "minSize": 10,
        "maxLeverage": 25,
        "minPrice": 0.00001
      },
      {
        "symbol": "ORDIUSDT",
        "minSize": 0.01,
        "maxLeverage": 75,
        "minPrice": 0.01
      },
      {
        "symbol": "OXTUSDT",
        "minSize": 10,
        "maxLeverage": 25,
        "minPrice": 0.00001
      },
      {
        "symbol": "PAXGUSDT",
        "minSize": 0.001,
        "maxLeverage": 16.67,
        "minPrice": 1
      },
      {
        "symbol": "PENDLEUSDT",
        "minSize": 1,
        "maxLeverage": 25,
        "minPrice": 0.0001
      },
      {
        "symbol": "PEOPLEUSDT",
        "minSize": 1,
        "maxLeverage": 50,
        "minPrice": 0.00001
      },
      {
        "symbol": "PERPUSDT",
        "minSize": 1,
        "maxLeverage": 25,
        "minPrice": 0.0001
      },
      {
        "symbol": "PHBUSDT",
        "minSize": 1,
        "maxLeverage": 25,
        "minPrice": 0.0001
      },
      {
        "symbol": "POLYXUSDT",
        "minSize": 1,
        "maxLeverage": 16.67,
        "minPrice": 0.0001
      },
      {
        "symbol": "POWRUSDT",
        "minSize": 1,
        "maxLeverage": 16.67,
        "minPrice": 0.0001
      },
      {
        "symbol": "PROMUSDT",
        "minSize": 0.1,
        "maxLeverage": 25,
        "minPrice": 0.0001
      },
      {
        "symbol": "PYTHUSDT",
        "minSize": 1,
        "maxLeverage": 50,
        "minPrice": 0.0001
      },
      {
        "symbol": "QIUSDT",
        "minSize": 10,
        "maxLeverage": 50,
        "minPrice": 0.00001
      },
      {
        "symbol": "QNTUSDT",
        "minSize": 0.01,
        "maxLeverage": 16.67,
        "minPrice": 0.01
      },
      {
        "symbol": "QTUMUSDT",
        "minSize": 0.1,
        "maxLeverage": 25,
        "minPrice": 0.001
      },
      {
        "symbol": "RADUSDT",
        "minSize": 0.1,
        "maxLeverage": 25,
        "minPrice": 0.001
      },
      {
        "symbol": "RAREUSDT",
        "minSize": 1,
        "maxLeverage": 25,
        "minPrice": 0.0001
      },
      {
        "symbol": "RAYUSDT",
        "minSize": 0.1,
        "maxLeverage": 25,
        "minPrice": 0.001
      },
      {
        "symbol": "RDNTUSDT",
        "minSize": 1,
        "maxLeverage": 25,
        "minPrice": 0.00005
      },
      {
        "symbol": "REEFUSDT",
        "minSize": 10,
        "maxLeverage": 12.5,
        "minPrice": 0.000005
      },
      {
        "symbol": "RENUSDT",
        "minSize": 0.1,
        "maxLeverage": 25,
        "minPrice": 0.00001
      },
      {
        "symbol": "RIFUSDT",
        "minSize": 1,
        "maxLeverage": 25,
        "minPrice": 0.0001
      },
      {
        "symbol": "RLCUSDT",
        "minSize": 0.1,
        "maxLeverage": 25,
        "minPrice": 0.0001
      },
      {
        "symbol": "RNDRUSDT",
        "minSize": 0.1,
        "maxLeverage": 25,
        "minPrice": 0.0001
      },
      {
        "symbol": "ROSEUSDT",
        "minSize": 1,
        "maxLeverage": 12.5,
        "minPrice": 0.00001
      },
      {
        "symbol": "RPLUSDT",
        "minSize": 0.01,
        "maxLeverage": 12.5,
        "minPrice": 0.005
      },
      {
        "symbol": "RSRUSDT",
        "minSize": 10,
        "maxLeverage": 12.5,
        "minPrice": 0.000001
      },
      {
        "symbol": "RUNEUSDT",
        "minSize": 0.1,
        "maxLeverage": 25,
        "minPrice": 0.001
      },
      {
        "symbol": "SANDUSDT",
        "minSize": 1,
        "maxLeverage": 25,
        "minPrice": 0.0001
      },
      {
        "symbol": "SEIUSDT",
        "minSize": 1,
        "maxLeverage": 50,
        "minPrice": 0.0001
      },
      {
        "symbol": "SFPUSDT",
        "minSize": 0.1,
        "maxLeverage": 25,
        "minPrice": 0.0001
      },
      {
        "symbol": "SHIB1000USDT",
        "minSize": 10,
        "maxLeverage": 50,
        "minPrice": 0.000001
      },
      {
        "symbol": "SILLYUSDT",
        "minSize": 1,
        "maxLeverage": 12.5,
        "minPrice": 0.00001
      },
      {
        "symbol": "SKLUSDT",
        "minSize": 1,
        "maxLeverage": 25,
        "minPrice": 0.00001
      },
      {
        "symbol": "SLPUSDT",
        "minSize": 10,
        "maxLeverage": 25,
        "minPrice": 0.000001
      },
      {
        "symbol": "SNTUSDT",
        "minSize": 10,
        "maxLeverage": 25,
        "minPrice": 0.00001
      },
      {
        "symbol": "SNXUSDT",
        "minSize": 0.1,
        "maxLeverage": 25,
        "minPrice": 0.001
      },
      {
        "symbol": "SOLUSDT",
        "minSize": 0.1,
        "maxLeverage": 75,
        "minPrice": 0.01
      },
      {
        "symbol": "SSVUSDT",
        "minSize": 0.01,
        "maxLeverage": 25,
        "minPrice": 0.005
      },
      {
        "symbol": "STEEMUSDT",
        "minSize": 1,
        "maxLeverage": 16.67,
        "minPrice": 0.0001
      },
      {
        "symbol": "STGUSDT",
        "minSize": 0.1,
        "maxLeverage": 25,
        "minPrice": 0.0001
      },
      {
        "symbol": "STORJUSDT",
        "minSize": 0.1,
        "maxLeverage": 25,
        "minPrice": 0.0001
      },
      {
        "symbol": "STPTUSDT",
        "minSize": 10,
        "maxLeverage": 16.67,
        "minPrice": 0.00001
      },
      {
        "symbol": "STRAXUSDT",
        "minSize": 1,
        "maxLeverage": 25,
        "minPrice": 0.001
      },
      {
        "symbol": "SUIUSDT",
        "minSize": 10,
        "maxLeverage": 50,
        "minPrice": 0.0001
      },
      {
        "symbol": "SUNUSDT",
        "minSize": 10,
        "maxLeverage": 12.5,
        "minPrice": 0.000001
      },
      {
        "symbol": "SUPERUSDT",
        "minSize": 1,
        "maxLeverage": 50,
        "minPrice": 0.0001
      },
      {
        "symbol": "SUSHIUSDT",
        "minSize": 0.1,
        "maxLeverage": 25,
        "minPrice": 0.0001
      },
      {
        "symbol": "SWEATUSDT",
        "minSize": 10,
        "maxLeverage": 25,
        "minPrice": 0.000001
      },
      {
        "symbol": "SXPUSDT",
        "minSize": 0.1,
        "maxLeverage": 25,
        "minPrice": 0.0001
      },
      {
        "symbol": "THETAUSDT",
        "minSize": 0.1,
        "maxLeverage": 25,
        "minPrice": 0.0001
      },
      {
        "symbol": "TIAUSDT",
        "minSize": 0.1,
        "maxLeverage": 50,
        "minPrice": 0.001
      },
      {
        "symbol": "TLMUSDT",
        "minSize": 1,
        "maxLeverage": 25,
        "minPrice": 0.000001
      },
      {
        "symbol": "TOKENUSDT",
        "minSize": 10,
        "maxLeverage": 25,
        "minPrice": 0.00001
      },
      {
        "symbol": "TOMIUSDT",
        "minSize": 0.1,
        "maxLeverage": 25,
        "minPrice": 0.001
      },
      {
        "symbol": "TONUSDT",
        "minSize": 0.1,
        "maxLeverage": 25,
        "minPrice": 0.001
      },
      {
        "symbol": "TRBUSDT",
        "minSize": 0.01,
        "maxLeverage": 50,
        "minPrice": 0.01
      },
      {
        "symbol": "TRUUSDT",
        "minSize": 1,
        "maxLeverage": 25,
        "minPrice": 0.00001
      },
      {
        "symbol": "TRXUSDT",
        "minSize": 1,
        "maxLeverage": 25,
        "minPrice": 0.00001
      },
      {
        "symbol": "TUSDT",
        "minSize": 10,
        "maxLeverage": 25,
        "minPrice": 0.00001
      },
      {
        "symbol": "TWTUSDT",
        "minSize": 0.1,
        "maxLeverage": 25,
        "minPrice": 0.0001
      },
      {
        "symbol": "UMAUSDT",
        "minSize": 0.1,
        "maxLeverage": 25,
        "minPrice": 0.001
      },
      {
        "symbol": "UNIUSDT",
        "minSize": 0.1,
        "maxLeverage": 25,
        "minPrice": 0.001
      },
      {
        "symbol": "USDCUSDT",
        "minSize": 0.1,
        "maxLeverage": 50,
        "minPrice": 0.0001
      },
      {
        "symbol": "USTCUSDT",
        "minSize": 10,
        "maxLeverage": 50,
        "minPrice": 0.00001
      },
      {
        "symbol": "VETUSDT",
        "minSize": 1,
        "maxLeverage": 25,
        "minPrice": 0.00001
      },
      {
        "symbol": "VGXUSDT",
        "minSize": 1,
        "maxLeverage": 25,
        "minPrice": 0.00001
      },
      {
        "symbol": "VRAUSDT",
        "minSize": 100,
        "maxLeverage": 16.67,
        "minPrice": 0.000001
      },
      {
        "symbol": "WAVESUSDT",
        "minSize": 0.1,
        "maxLeverage": 25,
        "minPrice": 0.0005
      },
      {
        "symbol": "WAXPUSDT",
        "minSize": 10,
        "maxLeverage": 16.67,
        "minPrice": 0.00001
      },
      {
        "symbol": "WIFUSDT",
        "minSize": 1,
        "maxLeverage": 25,
        "minPrice": 0.0001
      },
      {
        "symbol": "WLDUSDT",
        "minSize": 0.1,
        "maxLeverage": 25,
        "minPrice": 0.001
      },
      {
        "symbol": "WOOUSDT",
        "minSize": 0.1,
        "maxLeverage": 25,
        "minPrice": 0.0001
      },
      {
        "symbol": "WSMUSDT",
        "minSize": 10,
        "maxLeverage": 16.67,
        "minPrice": 0.00001
      },
      {
        "symbol": "XAIUSDT",
        "minSize": 1,
        "maxLeverage": 50,
        "minPrice": 0.0001
      },
      {
        "symbol": "XEMUSDT",
        "minSize": 1,
        "maxLeverage": 25,
        "minPrice": 0.00001
      },
      {
        "symbol": "XLMUSDT",
        "minSize": 1,
        "maxLeverage": 25,
        "minPrice": 0.00001
      },
      {
        "symbol": "XMRUSDT",
        "minSize": 0.01,
        "maxLeverage": 16.67,
        "minPrice": 0.01
      },
      {
        "symbol": "XRDUSDT",
        "minSize": 10,
        "maxLeverage": 25,
        "minPrice": 0.00001
      },
      {
        "symbol": "XRPUSDT",
        "minSize": 1,
        "maxLeverage": 75,
        "minPrice": 0.0001
      },
      {
        "symbol": "XTZUSDT",
        "minSize": 0.1,
        "maxLeverage": 50,
        "minPrice": 0.0001
      },
      {
        "symbol": "XVGUSDT",
        "minSize": 100,
        "maxLeverage": 25,
        "minPrice": 5e-7
      },
      {
        "symbol": "XVSUSDT",
        "minSize": 0.1,
        "maxLeverage": 25,
        "minPrice": 0.001
      },
      {
        "symbol": "YFIIUSDT",
        "minSize": 0.001,
        "maxLeverage": 25,
        "minPrice": 0.1
      },
      {
        "symbol": "YFIUSDT",
        "minSize": 0.0001,
        "maxLeverage": 25,
        "minPrice": 1
      },
      {
        "symbol": "YGGUSDT",
        "minSize": 0.1,
        "maxLeverage": 25,
        "minPrice": 0.0001
      },
      {
        "symbol": "ZECUSDT",
        "minSize": 0.01,
        "maxLeverage": 25,
        "minPrice": 0.01
      },
      {
        "symbol": "ZENUSDT",
        "minSize": 0.1,
        "maxLeverage": 25,
        "minPrice": 0.001
      },
      {
        "symbol": "ZILUSDT",
        "minSize": 10,
        "maxLeverage": 25,
        "minPrice": 0.00001
      },
      {
        "symbol": "ZKFUSDT",
        "minSize": 10,
        "maxLeverage": 12.5,
        "minPrice": 0.00001
      },
      {
        "symbol": "ZRXUSDT",
        "minSize": 1,
        "maxLeverage": 25,
        "minPrice": 0.0001
      }
    ];
}
  
async function show_order_log(logName, masterName, symbol, side, leverage, minSize, masterSize, mySize, masterAmount, masterEntryPrice, myBudget, myEntryPrice = false) {
  const logging = logger.createNamedLogger(logName);
  logging.setDate(() => moment().format('YYYY-MM-DD HH:mm:ss'));
  masterAmount = masterAmount.toFixed(2)
  side = side.toUpperCase()
  if (!myEntryPrice) {
    const ticker = await bybitAPI.get_ticker(symbol);
    myEntryPrice = ticker.result.list ? ticker.result.list[0].lastPrice : 0;
  }
  let myAmount = (myEntryPrice*mySize)/leverage;
  let myRate = (myAmount*100)/myBudget;
  myAmount = myAmount.toFixed(4)
  myRate = myRate.toFixed(4)
  const message = '['+masterName+'] '+ symbol+' '+side+' '+leverage+'x MA_entry_'+masterEntryPrice+'_cost_$'+masterAmount + ' || MY_entry_'+myEntryPrice+'_size_' + mySize +'_cost_$'+myAmount+' ('+myRate+'%)';
  logging.bold().debug(message);
  log.Info(message);
  sound.play(path.join(__dirname, "./sounds/coin-drop.mp3"));
}

function show_history_log(logName, masterName, symbol, side, leverage, masterEntry, myEntry, masterPNL, masterPNLType='$', myPNL, myPNLType='$') {
  const logging = logger.createNamedLogger(logName);
  logging.setDate(() => moment().format('YYYY-MM-DD HH:mm:ss'));
  if (masterPNL > 0) masterPNL = '+' + masterPNL;
  if (myPNL > 0) myPNL = '+' + myPNL;
  if (masterPNLType == '$') masterPNL = '$'+masterPNL;
  if (masterPNLType == '%') masterPNL = masterPNL+'%';
  if (myPNLType == '$') myPNL = '$'+myPNL;
  if (myPNLType == '%') myPNL = myPNL+'%';
  side = side.toUpperCase()
  const message = '['+masterName+'] Đã đóng PNL '+symbol+' '+side+' '+leverage+'x MA_entry_'+masterEntry+'_'+masterPNL+' MY_entry_'+myEntry+'_'+myPNL;
  logging.bgColor('magenta').bold().debug(message);
  log.Info(message);
  sound.play(path.join(__dirname, "./sounds/scale.mp3"));
}

function get_real_roi(pnl) {
  roi = 0;
  if (pnl && pnl.result.list && pnl.result.list[0]) {
    pnl = pnl.result.list[0];
    let unrealizedPNL;
    let initialMargin = (pnl.avgEntryPrice*pnl.qty)/pnl.leverage;
    if (pnl.side == 'Sell') unrealizedPNL = (pnl.avgExitPrice - pnl.avgEntryPrice)*pnl.qty;
    if (pnl.side == 'Buy') unrealizedPNL = (pnl.avgEntryPrice - pnl.avgExitPrice)*pnl.qty; 
    roi = formatSize((unrealizedPNL/initialMargin)*100, 0.01);
  }
  return roi;
}

function formatSize(size, stepSize) {
  size = Number(size);
  if(Math.floor(stepSize) === stepSize) return size.toFixed(0);
  const countDecimals = stepSize.toString().split(".")[1].length || 0;
  return Number(size.toFixed(countDecimals));
}

module.exports.formatSize = formatSize;
module.exports.get_real_roi = get_real_roi;
module.exports.get_positions = get_positions;
module.exports.list_positions = list_positions;
module.exports.get_coin_info = get_coin_info;
module.exports.get_market_pairs = get_market_pairs;
module.exports.show_order_log = show_order_log;
module.exports.show_history_log = show_history_log;
module.exports.get_stop_loss_price = get_stop_loss_price;
module.exports.get_take_profit_price = get_take_profit_price;