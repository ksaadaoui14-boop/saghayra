import BookingWidget from '../BookingWidget';

export default function BookingWidgetExample() {
  return (
    <div className="p-8 bg-background flex justify-center">
      <BookingWidget 
        currentLanguage="en"
        currentCurrency="USD"
      />
    </div>
  );
}