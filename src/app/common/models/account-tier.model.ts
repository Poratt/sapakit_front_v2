export interface AccountTier {
    id: number;
    name: string;
    tierKey: string;
    price: number;
	audience: string;
    icon: string;
    period: string;
    isActive: boolean;
    isPopular: boolean;
    displayOrder: number;
    limit_users: number;
    limit_suppliers: number;
    limit_history_days: number;
    can_export_excel: boolean;
    can_manage_roles: boolean;
    can_use_ai_insights: boolean;
    can_import_from_text: boolean;
    dashboard_level: string;
    support_level: string;
}