interface CoinMarketCapHistoricalData {
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

interface CoinMarketCapResponse {
  status: {
    timestamp: string;
    error_code: number;
    error_message: string | null;
    elapsed: number;
    credit_count: number;
  };
  data: {
    quotes: CoinMarketCapHistoricalData[];
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
  private readonly apiKey = 'b54bcf4d-1bca-4e8e-9a24-22ff2c3d462c';
  private readonly baseUrl = 'https://sandbox-api.coinmarketcap.com/v1';

  /**
   * Get historical price data for a cryptocurrency
   */
  async getHistoricalData(
    symbol: string,
    timeRange: '1H' | '24H' | '7D' | '30D'
  ): Promise<HistoricalPricePoint[]> {
    try {
      // First, get the cryptocurrency ID by symbol
      const cryptoId = await this.getCryptocurrencyId(symbol);
      if (!cryptoId) {
        throw new Error(`Cryptocurrency ${symbol} not found`);
      }

      // Calculate date range
      const endDate = new Date();
      const startDate = new Date();
      
      switch (timeRange) {
        case '1H':
          startDate.setHours(startDate.getHours() - 1);
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

      const response = await fetch(
        `${this.baseUrl}/cryptocurrency/quotes/historical?${params}`,
        {
          headers: {
            'X-CMC_PRO_API_KEY': this.apiKey,
            'Accept': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: CoinMarketCapResponse = await response.json();

      if (data.status.error_code !== 0) {
        throw new Error(data.status.error_message || 'API error');
      }

      return this.transformHistoricalData(data.data.quotes);
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
            'X-CMC_PRO_API_KEY': this.apiKey,
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
   */
  private getInterval(timeRange: '1H' | '24H' | '7D' | '30D'): string {
    switch (timeRange) {
      case '1H':
        return '5m'; // 5 minute intervals
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
   * Transform CoinMarketCap data to our format
   */
  private transformHistoricalData(quotes: CoinMarketCapHistoricalData[]): HistoricalPricePoint[] {
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
            'X-CMC_PRO_API_KEY': this.apiKey,
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

export const coinMarketCapService = new CoinMarketCapService();
export type { HistoricalPricePoint };