const logger = require('node-color-log');
const moment = require('moment-timezone');
moment.tz.setDefault('Asia/Ho_Chi_Minh');

function get_coin_sizes() {
    return [
    {
      "symbol": "10000NFTUSDT",
      "minSize": 10
    },
    {
      "symbol": "10000LADYSUSDT",
      "minSize": 100
    },
    {
      "symbol": "1000000VINUUSDT",
      "minSize": 100
    },
    {
      "symbol": "10000SATSUSDT",
      "minSize": 100
    },
    {
      "symbol": "1000BONKUSDT",
      "minSize": 100
    },
    {
      "symbol": "10000STARLUSDT",
      "minSize": 10
    },
    {
      "symbol": "1000FLOKIUSDT",
      "minSize": 1
    },
    {
      "symbol": "1000BTTUSDT",
      "minSize": 100
    },
    {
      "symbol": "1000PEPEUSDT",
      "minSize": 100
    },
    {
      "symbol": "1000LUNCUSDT",
      "minSize": 1
    },
    {
      "symbol": "1000XECUSDT",
      "minSize": 10
    },
    {
      "symbol": "1000RATSUSDT",
      "minSize": 10
    },
    {
      "symbol": "1INCHUSDT",
      "minSize": 0.1
    },
    {
      "symbol": "1CATUSDT",
      "minSize": 10
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
      "symbol": "AKROUSDT",
      "minSize": 100
    },
    {
      "symbol": "AIUSDT",
      "minSize": 0.1
    },
    {
      "symbol": "AGLDUSDT",
      "minSize": 0.1
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
      "symbol": "ASTRUSDT",
      "minSize": 1
    },
    {
      "symbol": "ARUSDT",
      "minSize": 0.1
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
      "symbol": "BADGERUSDT",
      "minSize": 0.1
    },
    {
      "symbol": "AXSUSDT",
      "minSize": 0.1
    },
    {
      "symbol": "AXLUSDT",
      "minSize": 1
    },
    {
      "symbol": "BALUSDT",
      "minSize": 0.01
    },
    {
      "symbol": "BCHUSDT",
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
      "symbol": "BAKEUSDT",
      "minSize": 0.1
    },
    {
      "symbol": "BELUSDT",
      "minSize": 1
    },
    {
      "symbol": "BEAMUSDT",
      "minSize": 100
    },
    {
      "symbol": "BLURUSDT",
      "minSize": 1
    },
    {
      "symbol": "BIGTIMEUSDT",
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
      "symbol": "BONDUSDT",
      "minSize": 0.1
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
      "symbol": "BSWUSDT",
      "minSize": 1
    },
    {
      "symbol": "BSVUSDT",
      "minSize": 0.01
    },
    {
      "symbol": "BTCPERP",
      "minSize": 0.001
    },
    {
      "symbol": "CELOUSDT",
      "minSize": 0.1
    },
    {
      "symbol": "CEEKUSDT",
      "minSize": 1
    },
    {
      "symbol": "BTCUSDT",
      "minSize": 0.001
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
      "symbol": "CTCUSDT",
      "minSize": 1
    },
    {
      "symbol": "COMBOUSDT",
      "minSize": 0.1
    },
    {
      "symbol": "COTIUSDT",
      "minSize": 1
    },
    {
      "symbol": "CELRUSDT",
      "minSize": 1
    },
    {
      "symbol": "BTC-26JAN24",
      "minSize": 0.001
    },
    {
      "symbol": "BTC-23FEB24",
      "minSize": 0.001
    },
    {
      "symbol": "BTC-27SEP24",
      "minSize": 0.001
    },
    {
      "symbol": "BTC-28JUN24",
      "minSize": 0.001
    },
    {
      "symbol": "C98USDT",
      "minSize": 0.1
    },
    {
      "symbol": "BTC-09FEB24",
      "minSize": 0.001
    },
    {
      "symbol": "BTC-02FEB24",
      "minSize": 0.001
    },
    {
      "symbol": "CAKEUSDT",
      "minSize": 0.1
    },
    {
      "symbol": "DASHUSDT",
      "minSize": 0.01
    },
    {
      "symbol": "BTC-29MAR24",
      "minSize": 0.001
    },
    {
      "symbol": "DATAUSDT",
      "minSize": 10
    },
    {
      "symbol": "DARUSDT",
      "minSize": 0.1
    },
    {
      "symbol": "DENTUSDT",
      "minSize": 100
    },
    {
      "symbol": "DODOUSDT",
      "minSize": 1
    },
    {
      "symbol": "DOTUSDT",
      "minSize": 0.1
    },
    {
      "symbol": "COMPUSDT",
      "minSize": 0.01
    },
    {
      "symbol": "CTKUSDT",
      "minSize": 0.1
    },
    {
      "symbol": "CFXUSDT",
      "minSize": 1
    },
    {
      "symbol": "CTSIUSDT",
      "minSize": 1
    },
    {
      "symbol": "DOGEUSDT",
      "minSize": 1
    },
    {
      "symbol": "DYDXUSDT",
      "minSize": 0.1
    },
    {
      "symbol": "CROUSDT",
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
      "symbol": "CRVUSDT",
      "minSize": 0.1
    },
    {
      "symbol": "COREUSDT",
      "minSize": 0.1
    },
    {
      "symbol": "DUSKUSDT",
      "minSize": 1
    },
    {
      "symbol": "EDUUSDT",
      "minSize": 0.1
    },
    {
      "symbol": "CYBERUSDT",
      "minSize": 0.1
    },
    {
      "symbol": "DGBUSDT",
      "minSize": 10
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
      "symbol": "ETH-02FEB24",
      "minSize": 0.01
    },
    {
      "symbol": "ETH-09FEB24",
      "minSize": 0.01
    },
    {
      "symbol": "ETH-23FEB24",
      "minSize": 0.01
    },
    {
      "symbol": "ETH-27SEP24",
      "minSize": 0.01
    },
    {
      "symbol": "ETH-26JAN24",
      "minSize": 0.01
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
      "symbol": "ETH-28JUN24",
      "minSize": 0.01
    },
    {
      "symbol": "ETH-29MAR24",
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
      "symbol": "ETHPERP",
      "minSize": 0.01
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
      "symbol": "FITFIUSDT",
      "minSize": 1
    },
    {
      "symbol": "FILUSDT",
      "minSize": 0.1
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
      "symbol": "FORTHUSDT",
      "minSize": 0.1
    },
    {
      "symbol": "FLRUSDT",
      "minSize": 10
    },
    {
      "symbol": "GASUSDT",
      "minSize": 0.1
    },
    {
      "symbol": "GMTUSDT",
      "minSize": 1
    },
    {
      "symbol": "GLMUSDT",
      "minSize": 1
    },
    {
      "symbol": "GPTUSDT",
      "minSize": 1
    },
    {
      "symbol": "FRONTUSDT",
      "minSize": 1
    },
    {
      "symbol": "GODSUSDT",
      "minSize": 1
    },
    {
      "symbol": "GMXUSDT",
      "minSize": 0.01
    },
    {
      "symbol": "FTMUSDT",
      "minSize": 1
    },
    {
      "symbol": "FXSUSDT",
      "minSize": 0.01
    },
    {
      "symbol": "GLMRUSDT",
      "minSize": 0.1
    },
    {
      "symbol": "GALAUSDT",
      "minSize": 1
    },
    {
      "symbol": "GFTUSDT",
      "minSize": 1
    },
    {
      "symbol": "HFTUSDT",
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
      "symbol": "HOTUSDT",
      "minSize": 100
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
      "symbol": "HOOKUSDT",
      "minSize": 0.1
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
      "symbol": "FUNUSDT",
      "minSize": 100
    },
    {
      "symbol": "ILVUSDT",
      "minSize": 0.01
    },
    {
      "symbol": "IDUSDT",
      "minSize": 1
    },
    {
      "symbol": "INJUSDT",
      "minSize": 0.1
    },
    {
      "symbol": "IMXUSDT",
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
      "symbol": "HNTUSDT",
      "minSize": 0.01
    },
    {
      "symbol": "JSTUSDT",
      "minSize": 10
    },
    {
      "symbol": "KASUSDT",
      "minSize": 10
    },
    {
      "symbol": "JTOUSDT",
      "minSize": 0.1
    },
    {
      "symbol": "IDEXUSDT",
      "minSize": 10
    },
    {
      "symbol": "JASMYUSDT",
      "minSize": 1
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
      "symbol": "KNCUSDT",
      "minSize": 0.1
    },
    {
      "symbol": "KLAYUSDT",
      "minSize": 0.1
    },
    {
      "symbol": "JOEUSDT",
      "minSize": 1
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
      "symbol": "KSMUSDT",
      "minSize": 0.01
    },
    {
      "symbol": "LDOUSDT",
      "minSize": 0.1
    },
    {
      "symbol": "KAVAUSDT",
      "minSize": 0.1
    },
    {
      "symbol": "LRCUSDT",
      "minSize": 0.1
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
      "symbol": "LSKUSDT",
      "minSize": 0.1
    },
    {
      "symbol": "LTCUSDT",
      "minSize": 0.1
    },
    {
      "symbol": "LOOKSUSDT",
      "minSize": 0.1
    },
    {
      "symbol": "LPTUSDT",
      "minSize": 0.1
    },
    {
      "symbol": "LUNA2USDT",
      "minSize": 0.1
    },
    {
      "symbol": "LOOMUSDT",
      "minSize": 10
    },
    {
      "symbol": "LQTYUSDT",
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
      "symbol": "MANTAUSDT",
      "minSize": 0.1
    },
    {
      "symbol": "MATICUSDT",
      "minSize": 1
    },
    {
      "symbol": "MATICPERP",
      "minSize": 1
    },
    {
      "symbol": "MASKUSDT",
      "minSize": 0.1
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
      "symbol": "MBOXUSDT",
      "minSize": 1
    },
    {
      "symbol": "MEMEUSDT",
      "minSize": 10
    },
    {
      "symbol": "MKRUSDT",
      "minSize": 0.001
    },
    {
      "symbol": "MDTUSDT",
      "minSize": 10
    },
    {
      "symbol": "METISUSDT",
      "minSize": 0.01
    },
    {
      "symbol": "MULTIUSDT",
      "minSize": 0.1
    },
    {
      "symbol": "MOVRUSDT",
      "minSize": 0.1
    },
    {
      "symbol": "MNTUSDT",
      "minSize": 1
    },
    {
      "symbol": "MINAUSDT",
      "minSize": 0.1
    },
    {
      "symbol": "MTLUSDT",
      "minSize": 0.1
    },
    {
      "symbol": "MYROUSDT",
      "minSize": 1
    },
    {
      "symbol": "NKNUSDT",
      "minSize": 1
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
      "symbol": "ORDIUSDT",
      "minSize": 0.01
    },
    {
      "symbol": "REEFUSDT",
      "minSize": 10
    },
    {
      "symbol": "SOLUSDT",
      "minSize": 0.1
    },
    {
      "symbol": "SFPUSDT",
      "minSize": 0.1
    },
    {
      "symbol": "SUIUSDT",
      "minSize": 10
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
      "symbol": "STEEMUSDT",
      "minSize": 1
    },
    {
      "symbol": "TOKENUSDT",
      "minSize": 10
    },
    {
      "symbol": "SUSHIUSDT",
      "minSize": 0.1
    },
    {
      "symbol": "SUPERUSDT",
      "minSize": 1
    },
    {
      "symbol": "SWEATUSDT",
      "minSize": 10
    },
    {
      "symbol": "TONUSDT",
      "minSize": 0.1
    },
    {
      "symbol": "TRUUSDT",
      "minSize": 1
    },
    {
      "symbol": "TOMIUSDT",
      "minSize": 0.1
    },
    {
      "symbol": "TWTUSDT",
      "minSize": 0.1
    },
    {
      "symbol": "TRBUSDT",
      "minSize": 0.01
    },
    {
      "symbol": "TUSDT",
      "minSize": 10
    },
    {
      "symbol": "TRXUSDT",
      "minSize": 1
    },
    {
      "symbol": "USDCUSDT",
      "minSize": 0.1
    },
    {
      "symbol": "UNIUSDT",
      "minSize": 0.1
    },
    {
      "symbol": "VETUSDT",
      "minSize": 1
    },
    {
      "symbol": "VRAUSDT",
      "minSize": 100
    },
    {
      "symbol": "WAXPUSDT",
      "minSize": 10
    },
    {
      "symbol": "VGXUSDT",
      "minSize": 1
    },
    {
      "symbol": "WAVESUSDT",
      "minSize": 0.1
    },
    {
      "symbol": "WLDUSDT",
      "minSize": 0.1
    },
    {
      "symbol": "XEMUSDT",
      "minSize": 1
    },
    {
      "symbol": "WOOUSDT",
      "minSize": 0.1
    },
    {
      "symbol": "YFIUSDT",
      "minSize": 0.0001
    },
    {
      "symbol": "XVSUSDT",
      "minSize": 0.1
    },
    {
      "symbol": "ZKFUSDT",
      "minSize": 10
    },
    {
      "symbol": "TIAUSDT",
      "minSize": 0.1
    },
    {
      "symbol": "OMGUSDT",
      "minSize": 0.1
    },
    {
      "symbol": "ONTUSDT",
      "minSize": 1
    },
    {
      "symbol": "NFPUSDT",
      "minSize": 0.1
    },
    {
      "symbol": "OPUSDT",
      "minSize": 0.1
    },
    {
      "symbol": "PROMUSDT",
      "minSize": 0.1
    },
    {
      "symbol": "NEARUSDT",
      "minSize": 0.1
    },
    {
      "symbol": "MYRIAUSDT",
      "minSize": 10
    },
    {
      "symbol": "QNTUSDT",
      "minSize": 0.01
    },
    {
      "symbol": "NMRUSDT",
      "minSize": 0.1
    },
    {
      "symbol": "OGUSDT",
      "minSize": 0.1
    },
    {
      "symbol": "RDNTUSDT",
      "minSize": 1
    },
    {
      "symbol": "OGNUSDT",
      "minSize": 1
    },
    {
      "symbol": "ONGUSDT",
      "minSize": 1
    },
    {
      "symbol": "RLCUSDT",
      "minSize": 0.1
    },
    {
      "symbol": "RIFUSDT",
      "minSize": 1
    },
    {
      "symbol": "PHBUSDT",
      "minSize": 1
    },
    {
      "symbol": "ORBSUSDT",
      "minSize": 10
    },
    {
      "symbol": "OXTUSDT",
      "minSize": 10
    },
    {
      "symbol": "SNXUSDT",
      "minSize": 0.1
    },
    {
      "symbol": "ONDOUSDT",
      "minSize": 1
    },
    {
      "symbol": "PENDLEUSDT",
      "minSize": 1
    },
    {
      "symbol": "SILLYUSDT",
      "minSize": 1
    },
    {
      "symbol": "NEOUSDT",
      "minSize": 0.01
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
      "symbol": "POWRUSDT",
      "minSize": 1
    },
    {
      "symbol": "RENUSDT",
      "minSize": 0.1
    },
    {
      "symbol": "RAREUSDT",
      "minSize": 1
    },
    {
      "symbol": "SUNUSDT",
      "minSize": 10
    },
    {
      "symbol": "ONEUSDT",
      "minSize": 1
    },
    {
      "symbol": "ROSEUSDT",
      "minSize": 1
    },
    {
      "symbol": "TLMUSDT",
      "minSize": 1
    },
    {
      "symbol": "POLYXUSDT",
      "minSize": 1
    },
    {
      "symbol": "PAXGUSDT",
      "minSize": 0.001
    },
    {
      "symbol": "PYTHUSDT",
      "minSize": 1
    },
    {
      "symbol": "QTUMUSDT",
      "minSize": 0.1
    },
    {
      "symbol": "SKLUSDT",
      "minSize": 1
    },
    {
      "symbol": "SNTUSDT",
      "minSize": 10
    },
    {
      "symbol": "QIUSDT",
      "minSize": 10
    },
    {
      "symbol": "STGUSDT",
      "minSize": 0.1
    },
    {
      "symbol": "SANDUSDT",
      "minSize": 1
    },
    {
      "symbol": "WSMUSDT",
      "minSize": 10
    },
    {
      "symbol": "RPLUSDT",
      "minSize": 0.01
    },
    {
      "symbol": "RAYUSDT",
      "minSize": 0.1
    },
    {
      "symbol": "RUNEUSDT",
      "minSize": 0.1
    },
    {
      "symbol": "RADUSDT",
      "minSize": 0.1
    },
    {
      "symbol": "XRPPERP",
      "minSize": 1
    },
    {
      "symbol": "XRDUSDT",
      "minSize": 10
    },
    {
      "symbol": "XAIUSDT",
      "minSize": 1
    },
    {
      "symbol": "THETAUSDT",
      "minSize": 0.1
    },
    {
      "symbol": "SEIUSDT",
      "minSize": 1
    },
    {
      "symbol": "UMAUSDT",
      "minSize": 0.1
    },
    {
      "symbol": "SHIB1000USDT",
      "minSize": 10
    },
    {
      "symbol": "SOLPERP",
      "minSize": 0.1
    },
    {
      "symbol": "ZILUSDT",
      "minSize": 10
    },
    {
      "symbol": "SSVUSDT",
      "minSize": 0.01
    },
    {
      "symbol": "WIFUSDT",
      "minSize": 1
    },
    {
      "symbol": "RNDRUSDT",
      "minSize": 0.1
    },
    {
      "symbol": "XLMUSDT",
      "minSize": 1
    },
    {
      "symbol": "RSRUSDT",
      "minSize": 10
    },
    {
      "symbol": "YFIIUSDT",
      "minSize": 0.001
    },
    {
      "symbol": "XMRUSDT",
      "minSize": 0.01
    },
    {
      "symbol": "XRPUSDT",
      "minSize": 1
    },
    {
      "symbol": "SLPUSDT",
      "minSize": 10
    },
    {
      "symbol": "YGGUSDT",
      "minSize": 0.1
    },
    {
      "symbol": "XVGUSDT",
      "minSize": 100
    },
    {
      "symbol": "SXPUSDT",
      "minSize": 0.1
    },
    {
      "symbol": "XTZUSDT",
      "minSize": 0.1
    },
    {
      "symbol": "USTCUSDT",
      "minSize": 10
    },
    {
      "symbol": "ZENUSDT",
      "minSize": 0.1
    },
    {
      "symbol": "ZECUSDT",
      "minSize": 0.01
    },
    {
      "symbol": "ZRXUSDT",
      "minSize": 1
    }
  ]
}

function show_order_log(logName, masterName, symbol, side, minSize, masterSize, mySize, masterAmount, myAmount, masterEntryPrice = false, myEntryPrice = false) {
  const logging = logger.createNamedLogger(logName);
  logging.setDate(() => moment().format('YYYY-MM-DD HH:mm:ss'));
  masterAmount = masterAmount.toFixed(2)
  myAmount = myAmount.toFixed(4)
  side = side.toUpperCase()
  if (myEntryPrice) {
    logging.bold().debug('['+masterName+'] '+ symbol+' '+side+' MA_size_'+ masterSize +'_$'+masterAmount + ' MY_entry_'+myEntryPrice+'_size_' + mySize +'_$'+myAmount);
  }
  if (masterEntryPrice) {
    logging.bold().debug('['+masterName+'] '+ symbol+' '+side+' MA_entry_'+masterEntryPrice+'_size_'+ masterSize +'_$'+masterAmount + ' MY_size_' + mySize +'_$'+myAmount);
  }
}

function show_history_log(logName, masterName, symbol, side, masterPNL, masterPNLType='$', myPNL, myPNLType='$') {
  const logging = logger.createNamedLogger(logName);
  logging.setDate(() => moment().format('YYYY-MM-DD HH:mm:ss'));
  if (masterPNLType == '$') masterPNL = '$'+masterPNL;
  if (masterPNLType == '%') masterPNL = masterPNL+'%';
  if (myPNLType == '$') myPNL = '$'+myPNL;
  if (myPNLType == '%') myPNL = myPNL+'%';
  side = side.toUpperCase()
  logging.bgColor('magenta').bold().debug('['+masterName+'] PNL đã đóng '+symbol+' '+side+' MA_'+masterPNL+' MY_'+myPNL);
}

module.exports.get_coin_sizes = get_coin_sizes;
module.exports.show_order_log = show_order_log;
module.exports.show_history_log = show_history_log;