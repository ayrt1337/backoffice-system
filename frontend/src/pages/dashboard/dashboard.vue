<script setup lang="ts">
import TemplatePage from '../../components/template-page.vue';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { 
    faUsers,
    faShieldHalved
} from '@fortawesome/free-solid-svg-icons';
import DashboardCards from '../../components/dashboard-cards.vue';
import { onMounted, ref } from 'vue';
import { useLoading } from '../../composables/use-loading';
import { api } from '../../services/api';
import { verifyApiError } from '../../services/verify-api-error';

const { showLoadingPage } = useLoading();

const metrics = ref({
    cards: []
});

onMounted(async () => {
    try {
        showLoadingPage(true);
        const response = await api({
            url: `/dashboard/metrics`,
            method: 'get'
        });

        metrics.value = {
            cards: response.data.cards
        };
    } catch (error: any) {
        console.error("Erro ao buscar cargo: ", error);
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

        <div class="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div class="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200/60 h-96 flex flex-col items-center justify-center text-slate-400">
                <FontAwesomeIcon :icon="faUsers" class="text-4xl mb-4 opacity-20" />
                <p class="font-medium">Gráfico de Crescimento de Usuários</p>
                <p class="text-sm opacity-60">(Em breve)</p>
            </div>
            
            <div class="bg-white p-6 rounded-2xl border border-slate-200/60 h-96 flex flex-col items-center justify-center text-slate-400">
                <FontAwesomeIcon :icon="faShieldHalved" class="text-4xl mb-4 opacity-20" />
                <p class="font-medium">Cargos Recentes</p>
                <p class="text-sm opacity-60">(Em breve)</p>
            </div>
        </div>
    </TemplatePage>
</template>