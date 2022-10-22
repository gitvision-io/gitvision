export function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(" ");
}

export const getFirstDateInterval = (
  time: string
): { firstDate: Date; interval: "hour" | "day" | "week" | "month" } => {
  const date = new Date();
  let interval: "hour" | "day" | "week" | "month" = "day";
  switch (time) {
    case "last day":
      date.setHours(date.getHours() - 24);
      interval = "hour";
      break;

    case "last week":
      date.setHours(date.getHours() - 168);
      interval = "day";
      break;

    case "last month":
      date.setMonth(date.getMonth() - 1);
      interval = "week";
      break;

    case "last 3 months":
      date.setMonth(date.getMonth() - 3);
      interval = "week";
      break;

    case "last 6 months":
      date.setMonth(date.getMonth() - 6);
      interval = "month";
      break;
  }
  return { firstDate: date, interval };
};
