interface ExpirationOption {
  value: number;
  label: string;
}

export function getExpirationOptions(): ExpirationOption[] {
  return [
    { value: 1, label: "1 day" },
    { value: 3, label: "3 days" },
    { value: 7, label: "1 week" },
    { value: 14, label: "2 weeks" },
    { value: 30, label: "1 month" },
    { value: 60, label: "2 months" },
    { value: 90, label: "3 months" },
  ];
}

export function calculateExpirationDate(from: Date, days: number): Date {
  const expirationDate = new Date(from);
  expirationDate.setDate(expirationDate.getDate() + days);
  return expirationDate;
}
