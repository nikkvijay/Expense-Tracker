import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Calculator,
  DollarSign,
  ChevronDown,
  ChevronUp,
  Minimize2,
  Maximize2,
} from "lucide-react";
import { BasicCalculator } from "./BasicCalculator";
import { CurrencyConverter } from "./CurrencyConverter";

interface CalculatorWidgetProps {
  defaultTab?: "calculator" | "converter";
  className?: string;
  showTabs?: boolean; // New prop to control if tabs are shown
}

export const CalculatorWidget: React.FC<CalculatorWidgetProps> = ({
  defaultTab = "calculator",
  className = "",
  showTabs = true,
}) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [isMinimized, setIsMinimized] = useState(false);
  const [activeTab, setActiveTab] = useState(defaultTab);

  if (isMinimized) {
    return (
      <Card className={`w-full max-w-sm ${className}`}>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-lg">
              {activeTab === "calculator" ? (
                <>
                  <Calculator className="h-5 w-5" />
                  Calculator
                </>
              ) : (
                <>
                  <DollarSign className="h-5 w-5" />
                  Currency Converter
                </>
              )}
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMinimized(false)}
              className="h-8 w-8 p-0"
            >
              <Maximize2 className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className={`w-full max-w-md mx-auto ${className}`}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            {activeTab === "calculator" ? (
              <>
                <Calculator className="h-5 w-5" />
                Calculator
              </>
            ) : (
              <>
                <DollarSign className="h-5 w-5" />
                Currency Converter
              </>
            )}
          </CardTitle>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="h-8 w-8 p-0"
            >
              {isExpanded ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMinimized(true)}
              className="h-8 w-8 p-0"
            >
              <Minimize2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>

      {isExpanded && (
        <CardContent className="pt-0">
          {showTabs ? (
            <Tabs
              value={activeTab}
              onValueChange={(value: any) => setActiveTab(value)}
              className="w-full"
            >
              <TabsList className="grid w-full grid-cols-2 mb-4">
                <TabsTrigger
                  value="calculator"
                  className="flex items-center gap-2"
                >
                  <Calculator className="h-4 w-4" />
                  Calculator
                </TabsTrigger>
                <TabsTrigger
                  value="converter"
                  className="flex items-center gap-2"
                >
                  <DollarSign className="h-4 w-4" />
                  Converter
                </TabsTrigger>
              </TabsList>

              <TabsContent value="calculator" className="mt-0">
                <div className="space-y-4">
                  <div className="text-center text-sm text-muted-foreground mb-4">
                    Standard calculator with memory functions
                  </div>
                  <BasicCalculator onResultChange={handleCalculatorResult} />
                </div>
              </TabsContent>

              <TabsContent value="converter" className="mt-0">
                <div className="space-y-4">
                  <div className="text-center text-sm text-muted-foreground mb-4">
                    Live currency exchange rates
                  </div>
                  <CurrencyConverter
                    onConversionResult={handleConversionResult}
                  />
                </div>
              </TabsContent>
            </Tabs>
          ) : (
            <div className="space-y-4">
              <div className="text-center text-sm text-muted-foreground mb-4">
                {activeTab === "calculator"
                  ? "Standard calculator with memory functions"
                  : "Live currency exchange rates"}
              </div>
              {activeTab === "calculator" ? (
                <BasicCalculator onResultChange={handleCalculatorResult} />
              ) : (
                <CurrencyConverter
                  onConversionResult={handleConversionResult}
                />
              )}
            </div>
          )}

          {/* Quick Tips */}
          <div className="mt-4 p-3 bg-secondary/30 rounded-lg">
            <div className="text-xs font-medium text-foreground mb-2">
              💡 Quick Tips
            </div>
            <div className="text-xs text-muted-foreground space-y-1">
              {activeTab === "calculator" ? (
                <>
                  <div>• Use MC/MR for memory functions</div>
                  <div>• Results can be used in expense forms</div>
                </>
              ) : (
                <>
                  <div>• Rates update automatically</div>
                  <div>• Use quick amounts for fast conversion</div>
                </>
              )}
            </div>
          </div>
        </CardContent>
      )}
    </Card>
  );
};
