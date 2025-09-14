import { useState } from "react";
import Header from '../Header';

export default function HeaderExample() {
  const [language, setLanguage] = useState("en");
  const [currency, setCurrency] = useState("USD");

  return (
    <Header 
      currentLanguage={language}
      currentCurrency={currency}
      onLanguageChange={setLanguage}
      onCurrencyChange={setCurrency}
    />
  );
}