<script setup lang="ts">
import { faArrowDown, faArrowUp } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';

interface CardsProps {
    title: string;
    value: string;
    growth?: string;
};

interface Cards {
    cards: CardsProps[]
};

const props = defineProps<Cards>();
</script>

<template>
    <div v-if="cards.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div 
            v-for="card in cards" 
            :key="card.title"
            class="bg-white p-6 rounded-2xl border border-slate-200/60"
        >    
            <div>
                <p class="text-slate-500 text-sm font-medium uppercase tracking-wider mb-1">{{ card.title }}</p>
                
                <div class="flex items-center gap-3">
                    <h3 class="text-3xl font-bold text-slate-900 tracking-tight">{{ card.value }}</h3>
                    <div v-if="card.growth" class="self-center mt-1 flex items-center gap-2">
                        <div 
                            class="flex items-center gap-1 px-2 py-1 rounded-lg text-[12px] font-bold"
                            :class="[
                                card.growth?.includes('+') 
                                ? 'bg-emerald-50 text-emerald-600' 
                                : 'bg-rose-50 text-rose-600'
                            ]"
                        >
                            <FontAwesomeIcon 
                                :icon="card.growth?.includes('+') ? faArrowUp : faArrowDown" 
                                class="text-[10px]"
                            />
                        
                            <span class="text-[12px] font-medium">{{ Math.abs(Number(card.growth)) + "%" }} desde o mês passado</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>