import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowUpDown, RefreshCw, TrendingUp, DollarSign } from "lucide-react";
import { useCurrency, CURRENCIES } from "@/contexts/CurrencyContext";
import { toast } from "sonner";

interface ExchangeRates {
  [key: string]: number;
}

interface CurrencyConverterProps {
  onConversionResult?: (
    amount: number,
    fromCurrency: string,
    toCurrency: string
  ) => void;
}

export const CurrencyConverter: React.FC<CurrencyConverterProps> = ({
  onConversionResult,
}) => {
  const { currency: userCurrency } = useCurrency();
  const [amount, setAmount] = useState<string>("1");
  const [fromCurrency, setFromCurrency] = useState(userCurrency.code);
  const [toCurrency, setToCurrency] = useState("USD");
  const [exchangeRates, setExchangeRates] = useState<ExchangeRates>({});
  const [convertedAmount, setConvertedAmount] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [rateInfo, setRateInfo] = useState<{
    rate: number;
    inverse: number;
  } | null>(null);

  // Free API for exchange rates (no API key required)
  const fetchExchangeRates = async () => {
    try {
      setLoading(true);

      // Using exchangerate-api.com free tier (1500 requests/month)
      const response = await fetch(
        `https://api.exchangerate-api.com/v4/latest/${fromCurrency}`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch exchange rates");
      }

      const data = await response.json();
      setExchangeRates(data.rates);
      setLastUpdated(new Date());

      // Calculate conversion immediately after fetching rates
      calculateConversion(data.rates);
    } catch (error) {
      console.error("Error fetching exchange rates:", error);
      toast.error(
        "Failed to fetch live exchange rates. Using approximate rates."
      );

      // Fallback to approximate rates
      const fallbackRates = getFallbackRates(fromCurrency);
      setExchangeRates(fallbackRates);
      calculateConversion(fallbackRates);
    } finally {
      setLoading(false);
    }
  };

  const getFallbackRates = (baseCurrency: string): ExchangeRates => {
    // Approximate exchange rates as fallback
    const baseRates: { [key: string]: ExchangeRates } = {
      USD: {
        EUR: 0.85,
        GBP: 0.73,
        INR: 83.12,
        JPY: 110.0,
        CAD: 1.25,
        AUD: 1.35,
        CHF: 0.88,
        USD: 1.0,
      },
      EUR: {
        USD: 1.18,
        GBP: 0.86,
        INR: 97.8,
        JPY: 129.5,
        CAD: 1.47,
        AUD: 1.59,
        CHF: 1.04,
        EUR: 1.0,
      },
      INR: {
        USD: 0.012,
        EUR: 0.01,
        GBP: 0.0088,
        JPY: 1.32,
        CAD: 0.015,
        AUD: 0.016,
        CHF: 0.011,
        INR: 1.0,
      },
      GBP: {
        USD: 1.37,
        EUR: 1.16,
        INR: 113.8,
        JPY: 150.7,
        CAD: 1.71,
        AUD: 1.85,
        CHF: 1.21,
        GBP: 1.0,
      },
    };

    return baseRates[baseCurrency] || baseRates.USD;
  };

  const calculateConversion = (rates: ExchangeRates = exchangeRates) => {
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || !rates[toCurrency]) {
      setConvertedAmount(0);
      setRateInfo(null);
      return;
    }

    const rate = rates[toCurrency];
    const result = numAmount * rate;
    setConvertedAmount(result);

    setRateInfo({
      rate: rate,
      inverse: 1 / rate,
    });

    if (onConversionResult) {
      onConversionResult(result, fromCurrency, toCurrency);
    }
  };

  const swapCurrencies = () => {
    const temp = fromCurrency;
    setFromCurrency(toCurrency);
    setToCurrency(temp);
  };

  const formatCurrencyValue = (value: number, currencyCode: string) => {
    const currencyInfo = CURRENCIES.find((c) => c.code === currencyCode);
    if (!currencyInfo) return value.toFixed(2);

    const formatted = value.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

    return currencyInfo.position === "before"
      ? `${currencyInfo.symbol}${formatted}`
      : `${formatted} ${currencyInfo.symbol}`;
  };

  useEffect(() => {
    fetchExchangeRates();
  }, [fromCurrency]);

  useEffect(() => {
    calculateConversion();
  }, [amount, toCurrency, exchangeRates]);

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Currency Converter
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={fetchExchangeRates}
            disabled={loading}
            className="h-8 w-8 p-0"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Amount Input */}
        <div>
          <Label htmlFor="amount">Amount</Label>
          <Input
            id="amount"
            type="number"
            min="0"
            step="0.01"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Enter amount"
            className="text-lg font-semibold"
          />
        </div>

        {/* From Currency */}
        <div>
          <Label htmlFor="from-currency">From</Label>
          <Select value={fromCurrency} onValueChange={setFromCurrency}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {CURRENCIES.map((curr) => (
                <SelectItem key={curr.code} value={curr.code}>
                  {curr.symbol} {curr.code} - {curr.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Swap Button */}
        <div className="flex justify-center">
          <Button
            variant="outline"
            size="sm"
            onClick={swapCurrencies}
            className="h-10 w-10 p-0 rounded-full"
          >
            <ArrowUpDown className="h-4 w-4" />
          </Button>
        </div>

        {/* To Currency */}
        <div>
          <Label htmlFor="to-currency">To</Label>
          <Select value={toCurrency} onValueChange={setToCurrency}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {CURRENCIES.map((curr) => (
                <SelectItem key={curr.code} value={curr.code}>
                  {curr.symbol} {curr.code} - {curr.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Result Display */}
        <div className="bg-success/10 p-4 rounded-lg border border-success/20">
          <div className="text-center">
            <div className="text-sm text-muted-foreground mb-1">
              Converted Amount
            </div>
            <div className="text-2xl font-bold text-success">
              {formatCurrencyValue(convertedAmount, toCurrency)}
            </div>
          </div>
        </div>

        {/* Exchange Rate Info */}
        {rateInfo && (
          <div className="bg-secondary/30 p-3 rounded-lg space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <TrendingUp className="h-4 w-4 text-primary" />
              <span className="font-medium">Exchange Rate</span>
            </div>
            <div className="text-xs text-muted-foreground space-y-1">
              <div>
                1 {fromCurrency} = {rateInfo.rate.toFixed(4)} {toCurrency}
              </div>
              <div>
                1 {toCurrency} = {rateInfo.inverse.toFixed(4)} {fromCurrency}
              </div>
            </div>
          </div>
        )}

        {/* Last Updated */}
        {lastUpdated && (
          <div className="text-xs text-muted-foreground text-center">
            Last updated: {lastUpdated.toLocaleTimeString()}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
