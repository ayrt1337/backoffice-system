<script setup lang="ts">
import TemplatePage from '../../components/template-page.vue';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { 
    faUsers, 
    faUserPlus, 
    faShieldHalved, 
    faPlus 
} from '@fortawesome/free-solid-svg-icons';

const stats = [
    {
        title: 'Total de Usuários',
        value: '1,284',
        icon: faUsers,
        color: 'bg-blue-500',
        lightColor: 'bg-blue-50',
        textColor: 'text-blue-600'
    },
    {
        title: 'Usuários (30 dias)',
        value: '156',
        icon: faUserPlus,
        color: 'bg-emerald-500',
        lightColor: 'bg-emerald-50',
        textColor: 'text-emerald-600'
    },
    {
        title: 'Total de Cargos',
        value: '12',
        icon: faShieldHalved,
        color: 'bg-purple-500',
        lightColor: 'bg-purple-50',
        textColor: 'text-purple-600'
    },
    {
        title: 'Cargos (30 dias)',
        value: '2',
        icon: faPlus,
        color: 'bg-amber-500',
        lightColor: 'bg-amber-50',
        textColor: 'text-amber-600'
    }
];
</script>

<template>
    <TemplatePage>
        <div class="mb-8">
            <h2 class="text-2xl font-bold text-slate-900 tracking-tight">Dashboard</h2>
            <p class="text-slate-500 text-sm mt-1">Bem-vindo ao seu painel de controle.</p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div 
                v-for="stat in stats" 
                :key="stat.title"
                class="bg-white p-6 rounded-2xl border border-slate-200/60 shadow-sm hover:shadow-md transition-all duration-300 group"
            >
                <div class="flex items-center justify-between mb-4">
                    <div 
                        :class="[stat.lightColor, 'w-12 h-12 rounded-xl flex items-center justify-center transition-colors group-hover:scale-110 duration-300']"
                    >
                        <FontAwesomeIcon 
                            :icon="stat.icon" 
                            :class="[stat.textColor, 'text-xl']"
                        />
                    </div>
                </div>
                
                <div>
                    <p class="text-slate-500 text-sm font-medium uppercase tracking-wider mb-1">{{ stat.title }}</p>
                    <h3 class="text-3xl font-bold text-slate-900 tracking-tight">{{ stat.value }}</h3>
                </div>

                <div class="mt-4 flex items-center text-[13px] font-medium text-emerald-600">
                    <span class="bg-emerald-50 px-2 py-0.5 rounded-full">
                        +12% desde o mês passado
                    </span>
                </div>
            </div>
        </div>

        <div class="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div class="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200/60 shadow-sm h-96 flex flex-col items-center justify-center text-slate-400">
                <FontAwesomeIcon :icon="faUsers" class="text-4xl mb-4 opacity-20" />
                <p class="font-medium">Gráfico de Crescimento de Usuários</p>
                <p class="text-sm opacity-60">(Em breve)</p>
            </div>
            
            <div class="bg-white p-6 rounded-2xl border border-slate-200/60 shadow-sm h-96 flex flex-col items-center justify-center text-slate-400">
                <FontAwesomeIcon :icon="faShieldHalved" class="text-4xl mb-4 opacity-20" />
                <p class="font-medium">Cargos Recentes</p>
                <p class="text-sm opacity-60">(Em breve)</p>
            </div>
        </div>
    </TemplatePage>
</template>