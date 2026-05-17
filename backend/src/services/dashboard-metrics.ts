import database from "../config/database.js";

export class DashboardMetrics {
    private static async getTotalUsers() {
        return await database.user.count();
    }

    private static async getUsersLast30Days() {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        return await database.user.count({
            where: { created_at: { gte: thirtyDaysAgo } }
        });
    }
    
    private static async getUsersPreviousMonth() {
        const sixtyDaysAgo = new Date();
        sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        return await database.user.count({
            where: {
                created_at: {
                    gte: sixtyDaysAgo,
                    lt: thirtyDaysAgo
                }
            }
        });
    }

    private static async getTotalRoles() {
        return await database.role.count();
    }

    private static async getRolesLast30Days() {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        return await database.role.count({
            where: { created_at: { gte: thirtyDaysAgo } }
        });
    }

    private static async getRolesPreviousMonth() {
        const sixtyDaysAgo = new Date();
        sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        return await database.role.count({
            where: {
                created_at: {
                    gte: sixtyDaysAgo,
                    lt: thirtyDaysAgo
                }
            }
        });
    }

    private static calculateGrowth(current: number, previous: number): string {
        if (previous === 0) return current > 0 ? "+100" : "0";
        
        const diff = ((current - previous) / previous) * 100;
        const formatted = parseFloat(diff.toFixed(1));

        if (formatted > 0) return `+${formatted}`;
        return formatted.toString();
    }

    static async getCards() {
        const [
            totalUsers, newUsers, prevUsers,
            totalRoles, newRoles, prevRoles
        ] = await Promise.all([
            this.getTotalUsers(),
            this.getUsersLast30Days(),
            this.getUsersPreviousMonth(),
            this.getTotalRoles(),
            this.getRolesLast30Days(),
            this.getRolesPreviousMonth()
        ]);

        return [
            { 
                title: "Total de Usuários", 
                value: totalUsers
            },
            { 
                title: "Novos Usuários", 
                value: newUsers, 
                growth: this.calculateGrowth(newUsers, prevUsers)
            },
            { 
                title: "Total de Cargos", 
                value: totalRoles, 
            },
            { 
                title: "Novos Cargos", 
                value: newRoles, 
                growth: this.calculateGrowth(newRoles, prevRoles)
            }
        ];
    }

    static async getLineCharts() {
        return {
            userGrowth: [],
            rolesDistribution: []
        };
    }
}