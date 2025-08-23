import { BaseModel } from "./base-model";

export enum InsightType {
    TRENDING_PRODUCTS = 'TRENDING_PRODUCTS',
    SUPPLIER_SPENDING = 'SUPPLIER_SPENDING',
    DORMANT_PRODUCTS = 'DORMANT_PRODUCTS',
    ORDER_NOTES = 'ORDER_NOTES',
    OVERALL_SUMMARY = 'OVERALL_SUMMARY',
    COST_CHANGE = 'COST_CHANGE'
}

// זהו המודל הראשי
export interface Insight  extends BaseModel{
    type: InsightType;
    emoji: string; 
    title: string;
    content: string;
    data: any; // אפשר להשאיר any, או להגדיר טיפוסים ספציפיים אם נרצה
    isRead: boolean;
}

