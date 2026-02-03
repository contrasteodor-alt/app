export function oeeColor(oee: number | null) {
	if (oee === null) return "text-muted-foreground";
	if (oee >= 0.8) return "text-emerald-600";
	if (oee >= 0.7) return "text-amber-600";
	return "text-red-600";
  }
  
  export function scrapColor(scrap: number | null) {
	if (scrap === null) return "text-muted-foreground";
	if (scrap <= 0.015) return "text-emerald-600";
	if (scrap <= 0.025) return "text-amber-600";
	return "text-red-600";
  }
  