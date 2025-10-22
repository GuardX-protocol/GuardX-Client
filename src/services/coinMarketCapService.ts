interface CoinMarketCapOHLCVData {
  time_open: string;
  time_close: string;
  time_high: string;
  time_low: string;
  quote: {
    USD: {
      open: number;
      high: number;
      low: number;
      close: number;
      volume: number;
      market_cap: number;
      timestamp: string;
    };
  };
}

interface CoinMarketCapOHLCVResponse {
  status: {
    timestamp: string;
    error_code: number;
    error_message: string | null;
    elapsed: number;
    credit_count: number;
  };
  data: {
    quotes: CoinMarketCapOHLCVData[];
  };
}

interface HistoricalPricePoint {
  price: number;
  timestamp: number;
  date: Date;
  high: number;
  low: number;
  volume: number;
}

class CoinMarketCapService {
  private readonly baseUrl = '/api/coinmarketcap'; // Use proxy to avoid CORS issues

  /**
   * Get historical price data for a cryptocurrency
   */
  async getHistoricalData(
    symbol: string,
    timeRange: '1H' | '24H' | '7D' | '30D'
  ): Promise<HistoricalPricePoint[]> {
    console.log(`🔍 Fetching CoinMarketCap historical data for ${symbol} (${timeRange})`);

    try {
      // First, get the cryptocurrency ID by symbol
      const cryptoId = await this.getCryptocurrencyId(symbol);
      if (!cryptoId) {
        console.warn(`❌ Cryptocurrency ${symbol} not found in CoinMarketCap`);
        throw new Error(`Cryptocurrency ${symbol} not found`);
      }

      console.log(`✅ Found cryptocurrency ID ${cryptoId} for ${symbol}`);

      // Calculate date range
      const endDate = new Date();
      const startDate = new Date();

      switch (timeRange) {
        case '1H':
          // Get last 6 hours of data with 1h intervals to show trend
          startDate.setHours(startDate.getHours() - 6);
          break;
        case '24H':
          startDate.setDate(startDate.getDate() - 1);
          break;
        case '7D':
          startDate.setDate(startDate.getDate() - 7);
          break;
        case '30D':
          startDate.setDate(startDate.getDate() - 30);
          break;
      }

      // Determine interval based on time range
      const interval = this.getInterval(timeRange);

      const params = new URLSearchParams({
        id: cryptoId.toString(),
        time_start: Math.floor(startDate.getTime() / 1000).toString(),
        time_end: Math.floor(endDate.getTime() / 1000).toString(),
        interval: interval,
        convert: 'USD'
      });

      console.log(`📡 Requesting historical data from: ${this.baseUrl}/cryptocurrency/ohlcv/historical?${params}`);

      const response = await fetch(
        `${this.baseUrl}/cryptocurrency/ohlcv/historical?${params}`,
        {
          headers: {
            'Accept': 'application/json',
          },
        }
      );

      if (!response.ok) {
        console.error(`❌ HTTP error! status: ${response.status}`);
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: CoinMarketCapOHLCVResponse = await response.json();

      if (data.status.error_code !== 0) {
        console.error(`❌ API error:`, data.status.error_message);
        throw new Error(data.status.error_message || 'API error');
      }

      const transformedData = this.transformHistoricalData(data.data.quotes);
      console.log(`✅ Successfully fetched ${transformedData.length} historical data points for ${symbol}`);

      return transformedData;
    } catch (error) {
      console.error('Error fetching historical data from CoinMarketCap:', error);
      throw error;
    }
  }

  /**
   * Get cryptocurrency ID by symbol
   */
  private async getCryptocurrencyId(symbol: string): Promise<number | null> {
    try {
      const params = new URLSearchParams({
        symbol: symbol.toUpperCase(),
        start: '1',
        limit: '1',
        convert: 'USD'
      });

      const response = await fetch(
        `${this.baseUrl}/cryptocurrency/listings/latest?${params}`,
        {
          headers: {
            'Accept': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.status.error_code !== 0) {
        throw new Error(data.status.error_message || 'API error');
      }

      const crypto = data.data.find((item: any) =>
        item.symbol.toUpperCase() === symbol.toUpperCase()
      );

      return crypto ? crypto.id : null;
    } catch (error) {
      console.error('Error getting cryptocurrency ID:', error);
      return null;
    }
  }

  /**
   * Get appropriate interval based on time range
   * Note: CoinMarketCap sandbox may have limitations on certain intervals
   */
  private getInterval(timeRange: '1H' | '24H' | '7D' | '30D'): string {
    switch (timeRange) {
      case '1H':
        return '1h'; // Use 1 hour intervals (sandbox may not support 5m)
      case '24H':
        return '1h'; // 1 hour intervals
      case '7D':
        return '6h'; // 6 hour intervals
      case '30D':
        return '1d'; // 1 day intervals
      default:
        return '1h';
    }
  }

  /**
   * Transform CoinMarketCap OHLCV data to our format
   */
  private transformHistoricalData(quotes: CoinMarketCapOHLCVData[]): HistoricalPricePoint[] {
    return quotes.map(quote => {
      const timestamp = new Date(quote.quote.USD.timestamp).getTime() / 1000;

      return {
        price: quote.quote.USD.close,
        timestamp,
        date: new Date(timestamp * 1000),
        high: quote.quote.USD.high,
        low: quote.quote.USD.low,
        volume: quote.quote.USD.volume,
      };
    }).sort((a, b) => a.timestamp - b.timestamp);
  }

  /**
   * Get current price for a cryptocurrency
   */
  async getCurrentPrice(symbol: string): Promise<{ price: number; change24h: number } | null> {
    try {
      const params = new URLSearchParams({
        symbol: symbol.toUpperCase(),
        convert: 'USD'
      });

      const response = await fetch(
        `${this.baseUrl}/cryptocurrency/quotes/latest?${params}`,
        {
          headers: {
            'Accept': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.status.error_code !== 0) {
        throw new Error(data.status.error_message || 'API error');
      }

      const crypto = data.data[symbol.toUpperCase()];
      if (!crypto) {
        return null;
      }

      return {
        price: crypto.quote.USD.price,
        change24h: crypto.quote.USD.percent_change_24h,
      };
    } catch (error) {
      console.error('Error fetching current price from CoinMarketCap:', error);
      return null;
    }
  }
}

/**
 * Generate mock historical data in CoinMarketCap format
 * Used as fallback when API is unavailable
 */
export const generateCoinMarketCapMockData = (
  currentPrice: number,
  timeRange: '1H' | '24H' | '7D' | '30D',
  symbol: string
): HistoricalPricePoint[] => {
  // Determine number of data points based on time range
  let points: number;
  let intervalMinutes: number;
  
  switch (timeRange) {
    case '1H':
      points = 12; // 5-minute intervals
      intervalMinutes = 5;
      break;
    case '24H':
      points = 24; // 1-hour intervals
      intervalMinutes = 60;
      break;
    case '7D':
      points = 28; // 6-hour intervals
      intervalMinutes = 360;
      break;
    case '30D':
      points = 30; // 1-day intervals
      intervalMinutes = 1440;
      break;
    default:
      points = 24;
      intervalMinutes = 60;
  }

  const now = Date.now();
  const intervalMs = intervalMinutes * 60 * 1000;
  
  // Generate deterministic but realistic price movements
  const seed = symbol.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const volatility = timeRange === '1H' ? 0.005 : 0.02; // Lower volatility for shorter timeframes
  
  return Array.from({ length: points }, (_, i) => {
    const timestamp = now - (points - i - 1) * intervalMs;
    
    // Simple random walk with mean reversion
    const randomFactor = Math.sin(seed + i * 0.5) * volatility;
    const meanReversion = (currentPrice - currentPrice * (1 + randomFactor)) * 0.1;
    const price = currentPrice * (1 + randomFactor - meanReversion);
    
    // Generate OHLCV data
    const basePrice = Math.max(price, currentPrice * 0.95);
    const high = basePrice * (1 + Math.abs(Math.sin(seed + i)) * volatility * 0.5);
    const low = basePrice * (1 - Math.abs(Math.cos(seed + i)) * volatility * 0.5);
    const volume = 1000000 + Math.abs(Math.sin(seed + i * 2)) * 5000000;
    
    return {
      price: basePrice,
      timestamp: Math.floor(timestamp / 1000),
      date: new Date(timestamp),
      high,
      low,
      volume,
    };
  }).sort((a, b) => a.timestamp - b.timestamp);
};

export const coinMarketCapService = new CoinMarketCapService();
export type { HistoricalPricePoint };