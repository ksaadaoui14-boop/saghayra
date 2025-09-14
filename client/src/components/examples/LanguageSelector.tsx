import { useState } from "react";
import LanguageSelector from '../LanguageSelector';

export default function LanguageSelectorExample() {
  const [currentLanguage, setCurrentLanguage] = useState("en");

  return (
    <div className="p-8 bg-background">
      <LanguageSelector 
        currentLanguage={currentLanguage}
        onLanguageChange={setCurrentLanguage}
      />
      <p className="mt-4 text-muted-foreground">Current language: {currentLanguage}</p>
    </div>
  );
}