import BookingWidget from '../BookingWidget';

export default function BookingWidgetExample() {
  return (
    <div className="p-8 bg-background flex justify-center">
      <BookingWidget 
        currentLanguage="en"
        currentCurrency="USD"
      />
      <div className="ml-8 p-4 bg-card rounded-lg max-w-xs">
        <h3 className="font-semibold mb-2">Features Added:</h3>
        <ul className="text-sm text-muted-foreground space-y-1">
          <li>✓ WhatsApp contact button</li>
          <li>✓ Multilingual support</li>
          <li>✓ Opens WhatsApp link</li>
          <li>✓ Outline button styling</li>
        </ul>
      </div>
    </div>
  );
}