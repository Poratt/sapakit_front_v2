// export interface AllStatisticsDto {
// 	totalSuppliers: number;
// 	totalProducts: number;
// 	totalCategories: number;
// }

export interface DashboardStats {
    openOrders: number;
    dueToday: number;
    monthlyCost: number;
    prevMonthlyCost: number;
    costChangePercentage: number;
    activeSuppliers: number;
}