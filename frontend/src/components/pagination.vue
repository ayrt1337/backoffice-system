<script setup lang="ts">
import { computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';

interface Props {
    currentPage: number;
    totalPages: number;
    loadData: () => void;
};

const props = defineProps<Props>();
const route = useRoute();
const router = useRouter();

const pages = computed(() => {
    const total = props.totalPages;
    const current = props.currentPage;
    const range = [];
    const rangeWithDots = [];

    if (total <= 5) {
        for (let i = 1; i <= total; i++) {
            range.push(i);
        }
    } else {
        range.push(1);
        let start;
        if (current <= 3) {
            start = 2;
        } else if (current >= total - 2) {
            start = total - 3;
        } else {
            start = current - 1;
        }
        range.push(start);
        range.push(start + 1);
        range.push(start + 2);
        range.push(total);
    }

    let l;
    for (let i of range) {
        if (l) {
            if (i - l !== 1) {
                rangeWithDots.push('...');
            }
        }
        rangeWithDots.push(i);
        l = i;
    }

    return rangeWithDots;
});

const changePage = async (page: number | string) => {
    if (page === '...' || page === props.currentPage) return;

    const query = { ...route.query, page: String(page) };
    await router.replace({ query });
    props.loadData();
};
</script>

<template>
    <div v-if="totalPages > 1" class="flex items-center justify-center gap-1 py-4 border-t border-slate-200">
        <button
            @click="changePage(currentPage - 1)"
            :disabled="currentPage === 1"
            class="cursor-pointer flex items-center justify-center w-9 h-9 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path></svg>
        </button>

        <button
            v-for="(page, index) in pages"
            :key="index"
            @click="changePage(page)"
            :class="[
                'flex items-center justify-center w-9 h-9 rounded-lg text-sm font-medium transition-colors',
                page === currentPage 
                    ? 'bg-blue-600 text-white border border-blue-600' 
                    : page === '...' 
                        ? 'text-slate-500 cursor-default' 
                        : 'border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900 cursor-pointer'
            ]"
        >
            {{ page }}
        </button>

        <button
            @click="changePage(currentPage + 1)"
            :disabled="currentPage === totalPages"
            class="cursor-pointer flex items-center justify-center w-9 h-9 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path></svg>
        </button>
    </div>
</template>