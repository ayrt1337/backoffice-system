<script setup lang="ts">
import TemplatePage from '../../components/template-page.vue';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { 
    faUsers
} from '@fortawesome/free-solid-svg-icons';
import DashboardCards from '../../components/dashboard-cards.vue';
import LineChart from '../../components/line-chart.vue';
import { onMounted, ref } from 'vue';
import { useLoading } from '../../composables/use-loading';
import { api } from '../../services/api';
import { verifyApiError } from '../../services/verify-api-error';

const { showLoadingPage } = useLoading();

const metrics = ref<any>({
    cards: [],
    lineCharts: {
        userGrowth: []
    }
});

onMounted(async () => {
    try {
        showLoadingPage(true);
        const response = await api({
            url: `/dashboard/metrics`,
            method: 'get'
        });

        metrics.value = {
            cards: response.data.cards,
            lineCharts: response.data.lineCharts
        };
    } catch (error: any) {
        console.error("Erro ao buscar métricas: ", error);
        verifyApiError(error.response?.status);
    } finally {
        showLoadingPage(false);
    }
});
</script>

<template>
    <TemplatePage>
        <div class="mb-7 mt-4">
            <h2 class="text-2xl font-bold text-slate-900 tracking-tight">Dashboard</h2>
        </div>

        <DashboardCards 
            :cards="metrics.cards || []"
        />

        <div class="mt-8 grid grid-cols-1 gap-6">
            <div class="bg-white p-6 rounded-2xl border border-slate-200/60 h-[420px] flex flex-col">
                <LineChart
                    v-if="metrics.lineCharts?.userGrowth?.length"
                    title="Crescimento de Usuários"
                    :categories="metrics.lineCharts.userGrowth.map((item: any) => item.date)"
                    :series="[{ name: 'Novos Usuários', data: metrics.lineCharts.userGrowth.map((item: any) => item.count) }]"
                />
                <div v-else class="h-full flex flex-col items-center justify-center text-slate-400">
                    <FontAwesomeIcon :icon="faUsers" class="text-4xl mb-4 opacity-20" />
                    <p class="font-medium">Carregando gráfico...</p>
                </div>
            </div>
        </div>
    </TemplatePage>
</template>