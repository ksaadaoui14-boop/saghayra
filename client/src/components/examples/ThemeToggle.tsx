import ThemeToggle from '../ThemeToggle';

export default function ThemeToggleExample() {
  return (
    <div className="p-8 bg-background">
      <ThemeToggle />
      <p className="mt-4 text-muted-foreground">Click to toggle between light and dark themes</p>
    </div>
  );
}