import { getCollection } from "astro:content";
import config from "@sage/config";

export function formatDate(date: Date, withTime = false) {
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: config.site.timezone,
    year: "numeric", month: "short", day: "2-digit",
    ...(withTime ? { hour: "2-digit", minute: "2-digit", hourCycle: "h23" } as const : {}),
  }).format(date);
}

export async function getMoments() {
  return (await getCollection("moments", ({ data }) =>
    import.meta.env.DEV || (!data.draft && data.pubDatetime.getTime() <= Date.now())
  )).sort((a, b) =>
    Number(b.data.pinned) - Number(a.data.pinned) || b.data.pubDatetime.getTime() - a.data.pubDatetime.getTime()
  );
}
