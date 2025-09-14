import { useState } from "react";
import CurrencySelector from '../CurrencySelector';

export default function CurrencySelectorExample() {
  const [currentCurrency, setCurrentCurrency] = useState("USD");

  return (
    <div className="p-8 bg-background">
      <CurrencySelector 
        currentCurrency={currentCurrency}
        onCurrencyChange={setCurrentCurrency}
      />
      <p className="mt-4 text-muted-foreground">Current currency: {currentCurrency}</p>
    </div>
  );
}