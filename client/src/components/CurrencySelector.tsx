import { ChevronDown, DollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface CurrencySelectorProps {
  currentCurrency: string;
  onCurrencyChange: (currency: string) => void;
}

const currencies = [
  { code: "TND", name: "Tunisian Dinar", symbol: "د.ت" },
  { code: "USD", name: "US Dollar", symbol: "$" },
  { code: "EUR", name: "Euro", symbol: "€" },
];

export default function CurrencySelector({ currentCurrency, onCurrencyChange }: CurrencySelectorProps) {
  const currentCurr = currencies.find(curr => curr.code === currentCurrency) || currencies[0];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="text-muted-foreground" data-testid="button-currency-selector">
          <DollarSign className="w-4 h-4 mr-1" />
          <span className="hidden sm:inline">{currentCurr.code}</span>
          <span className="sm:hidden">{currentCurr.symbol}</span>
          <ChevronDown className="w-3 h-3 ml-1" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-40">
        {currencies.map((currency) => (
          <DropdownMenuItem
            key={currency.code}
            onClick={() => {
              onCurrencyChange(currency.code);
              console.log(`Currency changed to ${currency.name}`);
            }}
            className={`flex items-center justify-between ${
              currentCurrency === currency.code ? "bg-accent" : ""
            }`}
            data-testid={`option-currency-${currency.code}`}
          >
            <span>{currency.code}</span>
            <span>{currency.symbol}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}