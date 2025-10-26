export type TVResolution = "1" | "5" | "15" | "30" | "60" | "120" | "240" | "D";

export interface Candle {
  timestamp: number; // unix seconds
  open: number;
  high: number;
  low: number;
  close: number;
  volume?: number;
}

class PythBenchmarksService {
  private readonly baseUrl =
    "https://benchmarks.pyth.network/v1/shims/tradingview";

  // Parse TradingView standard response format
  private parseResponse(json: any): Candle[] {
    if (!json) return [];

    // TradingView standard: { s: 'ok', t: [...], o: [...], h: [...], l: [...], c: [...], v?: [...] }
    if (json.s === "ok" && Array.isArray(json.t) && Array.isArray(json.c)) {
      const candles: Candle[] = [];
      const len = Math.min(json.t.length, json.c.length);

      for (let i = 0; i < len; i++) {
        const timestamp = Number(json.t[i]);
        const open = Number(json.o?.[i] ?? json.c[i]);
        const high = Number(json.h?.[i] ?? json.c[i]);
        const low = Number(json.l?.[i] ?? json.c[i]);
        const close = Number(json.c[i]);
        const volume = json.v ? Number(json.v[i]) : undefined;

        if (Number.isFinite(timestamp) && Number.isFinite(close)) {
          candles.push({ timestamp, open, high, low, close, volume });
        }
      }
      return candles;
    }

    // Error response
    if (json.s === "no_data") {
      console.log("Pyth: No data available for this symbol/timeframe");
      return [];
    }

    return [];
  }

  async getCandles(params: {
    tvSymbol: string;
    resolution: TVResolution;
    from: number; // unix seconds
    to: number; // unix seconds
  }): Promise<Candle[]> {
    const { tvSymbol, resolution, from, to } = params;

    const url = new URL(`${this.baseUrl}/history`);
    url.searchParams.set("symbol", tvSymbol);
    url.searchParams.set("resolution", resolution);
    url.searchParams.set("from", String(Math.floor(from)));
    url.searchParams.set("to", String(Math.floor(to)));

    try {
      console.log(
        `📡 Fetching Pyth data: ${tvSymbol} (${resolution}) from ${new Date(
          from * 1000
        ).toISOString()}`
      );

      const response = await fetch(url.toString());

      if (!response.ok) {
        console.warn(`HTTP ${response.status}: ${response.statusText}`);
        return [];
      }

      const data = await response.json();
      console.log(
        `📊 Pyth response for ${tvSymbol}:`,
        data.s,
        data.t?.length || 0,
        "candles"
      );

      return this.parseResponse(data);
    } catch (error) {
      console.warn(`Pyth API error for ${tvSymbol}:`, error);
      return [];
    }
  }

  // Generate realistic historical data based on current price (fallback only)
  generateHistoricalCandles(params: {
    symbol: string;
    currentPrice: number;
    resolution: TVResolution;
    from: number;
    to: number;
  }): Candle[] {
    const { symbol, currentPrice, resolution, from, to } = params;

    if (!currentPrice || currentPrice <= 0) return [];

    const resolutionMinutes = this.getResolutionMinutes(resolution);
    const totalMinutes = (to - from) / 60;
    const numCandles = Math.min(
      Math.floor(totalMinutes / resolutionMinutes),
      200
    );

    if (numCandles <= 0) return [];

    // Symbol-specific volatility patterns
    const volatilityMap: Record<string, number> = {
      BTC: 0.025,
      WBTC: 0.025,
      ETH: 0.035,
      WETH: 0.035,
      STETH: 0.035,
      USDC: 0.002,
      USDT: 0.002,
      DAI: 0.003,
      SOL: 0.045,
      AVAX: 0.04,
      MATIC: 0.05,
      UNI: 0.055,
      LINK: 0.04,
      AAVE: 0.05,
    };

    const baseVolatility = volatilityMap[symbol.toUpperCase()] || 0.035;
    const seed =
      symbol.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0) +
      Math.floor(currentPrice);

    const candles: Candle[] = [];
    let price = currentPrice;

    for (let i = 0; i < numCandles; i++) {
      const timestamp = from + i * resolutionMinutes * 60;

      // Deterministic but realistic price movement
      const seedOffset = seed + i;
      const random1 = Math.sin(seedOffset * 0.1) * 0.5 + 0.5;
      const random2 = Math.sin(seedOffset * 0.23) * 0.5 + 0.5;
      const random3 = Math.sin(seedOffset * 0.37) * 0.5 + 0.5;
      const random4 = Math.sin(seedOffset * 0.51) * 0.5 + 0.5;

      const trend = Math.sin((i / numCandles) * Math.PI * 2) * 0.01;
      const volatility = (random1 - 0.5) * baseVolatility * 2;
      const meanReversion = ((currentPrice - price) * 0.05) / currentPrice;

      const priceChange = trend + volatility + meanReversion;
      const newPrice = Math.max(price * (1 + priceChange), currentPrice * 0.7);

      const open = price;
      const close = newPrice;
      const high = Math.max(open, close) * (1 + random2 * baseVolatility * 0.5);
      const low = Math.min(open, close) * (1 - random3 * baseVolatility * 0.5);
      const volume = currentPrice * 1000000 * (1 + (random4 - 0.5) * 0.6);

      candles.push({ timestamp, open, high, low, close, volume });
      price = close;
    }

    return candles;
  }

  private getResolutionMinutes(resolution: TVResolution): number {
    const map: Record<TVResolution, number> = {
      "1": 1,
      "5": 5,
      "15": 15,
      "30": 30,
      "60": 60,
      "120": 120,
      "240": 240,
      D: 1440,
    };
    return map[resolution] || 60;
  }
}

export const tradingViewService = new PythBenchmarksService();
export default tradingViewService;
