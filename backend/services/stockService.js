// Mock stock data service with realistic price simulation

const SUPPORTED_STOCKS = {
  GOOG: { name: 'Google', basePrice: 142.50 },
  TSLA: { name: 'Tesla', basePrice: 248.75 },
  AMZN: { name: 'Amazon', basePrice: 178.30 },
  META: { name: 'Meta', basePrice: 485.20 },
  NVDA: { name: 'NVIDIA', basePrice: 495.80 }
};

class StockService {
  constructor() {
    this.stocks = this.initializeStocks();
  }

  initializeStocks() {
    const stocks = {};
    for (const [ticker, data] of Object.entries(SUPPORTED_STOCKS)) {
      stocks[ticker] = {
        ticker,
        name: data.name,
        price: data.basePrice,
        previousPrice: data.basePrice,
        change: 0,
        changePercent: 0
      };
    }
    return stocks;
  }

  getAllStocks() {
    return Object.values(this.stocks);
  }

  getStock(ticker) {
    return this.stocks[ticker];
  }

  updatePrices() {
    for (const ticker in this.stocks) {
      const stock = this.stocks[ticker];
      const previousPrice = stock.price;

      // Generate random price change between -1% and +1%
      const changePercent = (Math.random() - 0.5) * 2;
      const change = (previousPrice * changePercent) / 100;

      // Force at least some change if it's too small
      let finalChange = change;
      if (Math.abs(finalChange) < 0.01) {
        finalChange = Math.random() > 0.5 ? 0.05 : -0.05;
      }

      const newPrice = previousPrice + finalChange;

      stock.previousPrice = previousPrice;
      stock.price = Math.max(newPrice, 0.01);
      stock.change = stock.price - previousPrice;
      stock.changePercent = ((stock.change / previousPrice) * 100);
    }

    // Log for debugging
    console.log(`[StockService] Prices updated. GOOG: ${this.stocks.GOOG.price.toFixed(2)}`);
    return this.getAllStocks();
  }

  isValidTicker(ticker) {
    return ticker in SUPPORTED_STOCKS;
  }
}

export default new StockService();
