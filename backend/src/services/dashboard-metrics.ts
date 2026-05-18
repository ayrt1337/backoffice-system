import database from "../config/database.js";

export class DashboardMetrics {
    private static async getTotalUsers() {
        return await database.auditLogs.count({
            where: { action: "create", resource: "users" }
        });
    }

    private static async getUsersLast30Days() {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        return await database.auditLogs.count({
            where: { 
                action: "create", 
                resource: "users",
                created_at: { gte: thirtyDaysAgo } 
            }
        });
    }
    
    private static async getUsersPreviousMonth() {
        const sixtyDaysAgo = new Date();
        sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        return await database.auditLogs.count({
            where: {
                action: "create", 
                resource: "users",
                created_at: {
                    gte: sixtyDaysAgo,
                    lt: thirtyDaysAgo
                }
            }
        });
    }

    private static async getTotalRoles() {
        return await database.auditLogs.count({
            where: { action: "create", resource: "roles" }
        });
    }

    private static async getRolesLast30Days() {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        return await database.auditLogs.count({
            where: { 
                action: "create", 
                resource: "roles",
                created_at: { gte: thirtyDaysAgo } 
            }
        });
    }

    private static async getRolesPreviousMonth() {
        const sixtyDaysAgo = new Date();
        sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        return await database.auditLogs.count({
            where: {
                action: "create", 
                resource: "roles",
                created_at: {
                    gte: sixtyDaysAgo,
                    lt: thirtyDaysAgo
                }
            }
        });
    }

    private static async getUsersCreatedByDay() {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 29);
        thirtyDaysAgo.setHours(0, 0, 0, 0);

        const logs = await database.auditLogs.findMany({
            where: {
                action: "create",
                resource: "users",
                created_at: { gte: thirtyDaysAgo }
            },
            select: { created_at: true }
        });

        const daysMap: Record<string, number> = {};
        const curr = new Date(thirtyDaysAgo);
        const end = new Date();
        end.setHours(23, 59, 59, 999);

        while (curr <= end) {
            const dateStr = curr.toISOString().split('T')[0];
            daysMap[dateStr] = 0;
            curr.setDate(curr.getDate() + 1);
        }

        for (const log of logs) {
            const dateStr = new Date(log.created_at).toISOString().split('T')[0];
            if (daysMap[dateStr] !== undefined) {
                daysMap[dateStr]++;
            }
        }

        return Object.entries(daysMap).map(([dateStr, count]) => {
            const [year, month, day] = dateStr.split('-');
            return {
                date: `${day}/${month}`,
                count
            };
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
        const userGrowth = await this.getUsersCreatedByDay();

        return {
            userGrowth
        };
    }
}