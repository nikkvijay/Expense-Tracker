import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calculator, Delete, RotateCcw } from 'lucide-react';

interface BasicCalculatorProps {
  onResultChange?: (result: number) => void;
}

export const BasicCalculator: React.FC<BasicCalculatorProps> = ({ onResultChange }) => {
  const [display, setDisplay] = useState('0');
  const [previousValue, setPreviousValue] = useState<number | null>(null);
  const [operation, setOperation] = useState<string | null>(null);
  const [waitingForOperand, setWaitingForOperand] = useState(false);
  const [memory, setMemory] = useState(0);

  const inputNumber = (num: string) => {
    if (waitingForOperand) {
      setDisplay(num);
      setWaitingForOperand(false);
    } else {
      setDisplay(display === '0' ? num : display + num);
    }
  };

  const inputDecimal = () => {
    if (waitingForOperand) {
      setDisplay('0.');
      setWaitingForOperand(false);
    } else if (display.indexOf('.') === -1) {
      setDisplay(display + '.');
    }
  };

  const clear = () => {
    setDisplay('0');
    setPreviousValue(null);
    setOperation(null);
    setWaitingForOperand(false);
  };

  const deleteLast = () => {
    if (display.length > 1) {
      setDisplay(display.slice(0, -1));
    } else {
      setDisplay('0');
    }
  };

  const performOperation = (nextOperation: string) => {
    const inputValue = parseFloat(display);

    if (previousValue === null) {
      setPreviousValue(inputValue);
    } else if (operation) {
      const currentValue = previousValue || 0;
      const newValue = calculate(currentValue, inputValue, operation);

      setDisplay(String(newValue));
      setPreviousValue(newValue);
      
      if (onResultChange) {
        onResultChange(newValue);
      }
    }

    setWaitingForOperand(true);
    setOperation(nextOperation);
  };

  const calculate = (firstOperand: number, secondOperand: number, operation: string): number => {
    switch (operation) {
      case '+':
        return firstOperand + secondOperand;
      case '-':
        return firstOperand - secondOperand;
      case '×':
        return firstOperand * secondOperand;
      case '÷':
        return firstOperand / secondOperand;
      case '=':
        return secondOperand;
      default:
        return secondOperand;
    }
  };

  const handleEquals = () => {
    if (operation && previousValue !== null) {
      const inputValue = parseFloat(display);
      const newValue = calculate(previousValue, inputValue, operation);
      
      setDisplay(String(newValue));
      setPreviousValue(null);
      setOperation(null);
      setWaitingForOperand(true);
      
      if (onResultChange) {
        onResultChange(newValue);
      }
    }
  };

  // Memory functions
  const memoryClear = () => setMemory(0);
  const memoryRecall = () => {
    setDisplay(String(memory));
    setWaitingForOperand(true);
  };
  const memoryAdd = () => setMemory(memory + parseFloat(display));
  const memorySubtract = () => setMemory(memory - parseFloat(display));

  const Button2 = ({ onClick, className = '', children, variant = 'outline' as any }: any) => (
    <Button 
      variant={variant}
      onClick={onClick} 
      className={`h-12 text-lg font-semibold transition-all duration-200 hover:scale-105 ${className}`}
    >
      {children}
    </Button>
  );

  return (
    <Card className="w-full max-w-sm mx-auto">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Calculator className="h-5 w-5" />
          Calculator
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Display */}
        <div className="bg-secondary/30 p-4 rounded-lg border">
          <div className="text-right text-2xl font-mono font-bold text-foreground truncate">
            {display}
          </div>
          {operation && (
            <div className="text-right text-sm text-muted-foreground">
              {previousValue} {operation}
            </div>
          )}
        </div>

        {/* Memory and Clear Row */}
        <div className="grid grid-cols-4 gap-2">
          <Button2 onClick={memoryClear} className="text-sm">MC</Button2>
          <Button2 onClick={memoryRecall} className="text-sm">MR</Button2>
          <Button2 onClick={memoryAdd} className="text-sm">M+</Button2>
          <Button2 onClick={memorySubtract} className="text-sm">M-</Button2>
        </div>

        {/* Function Row */}
        <div className="grid grid-cols-4 gap-2">
          <Button2 onClick={clear} variant="destructive" className="col-span-2">
            <RotateCcw className="h-4 w-4 mr-1" />
            Clear
          </Button2>
          <Button2 onClick={deleteLast}>
            <Delete className="h-4 w-4" />
          </Button2>
          <Button2 onClick={() => performOperation('÷')} className="bg-primary/10 text-primary">
            ÷
          </Button2>
        </div>

        {/* Number Rows */}
        <div className="grid grid-cols-4 gap-2">
          <Button2 onClick={() => inputNumber('7')}>7</Button2>
          <Button2 onClick={() => inputNumber('8')}>8</Button2>
          <Button2 onClick={() => inputNumber('9')}>9</Button2>
          <Button2 onClick={() => performOperation('×')} className="bg-primary/10 text-primary">
            ×
          </Button2>
        </div>

        <div className="grid grid-cols-4 gap-2">
          <Button2 onClick={() => inputNumber('4')}>4</Button2>
          <Button2 onClick={() => inputNumber('5')}>5</Button2>
          <Button2 onClick={() => inputNumber('6')}>6</Button2>
          <Button2 onClick={() => performOperation('-')} className="bg-primary/10 text-primary">
            -
          </Button2>
        </div>

        <div className="grid grid-cols-4 gap-2">
          <Button2 onClick={() => inputNumber('1')}>1</Button2>
          <Button2 onClick={() => inputNumber('2')}>2</Button2>
          <Button2 onClick={() => inputNumber('3')}>3</Button2>
          <Button2 onClick={() => performOperation('+')} className="bg-primary/10 text-primary">
            +
          </Button2>
        </div>

        <div className="grid grid-cols-4 gap-2">
          <Button2 onClick={() => inputNumber('0')} className="col-span-2">0</Button2>
          <Button2 onClick={inputDecimal}>.</Button2>
          <Button2 onClick={handleEquals} className="bg-success text-success-foreground">
            =
          </Button2>
        </div>
      </CardContent>
    </Card>
  );
};