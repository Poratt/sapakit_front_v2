export interface EnumData {
	enumValue: number;
	label: string; // צורת יחיד
    labelPlural?: string; // ✅ צורת רבים (אופציונלי)
	icon?: string;
	tooltip?: string;
	tailwind?: string;
	className?: string;
}
