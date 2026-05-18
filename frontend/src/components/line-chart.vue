<script setup lang="ts">
import { computed } from 'vue';

interface Props {
    title?: string;
    categories: string[];
    series: { name: string; data: number[] }[];
}

const props = defineProps<Props>();

const chartOptions = computed(() => ({
    chart: {
        type: 'line',
        height: '100%',
        width: '100%',
        toolbar: { show: false },
        zoom: { enabled: false },
        fontFamily: 'Inter, sans-serif',
        animations: {
            enabled: true,
            easing: 'easeinout',
            speed: 800
        }
    },
    stroke: {
        curve: 'smooth',
        width: 3.5,
        colors: ['#2563eb']
    },
    fill: {
        type: 'gradient',
        gradient: {
            shade: 'light',
            type: 'vertical',
            shadeIntensity: 0.5,
            gradientToColors: ['#3b82f6'],
            inverseColors: false,
            opacityFrom: 0.8,
            opacityTo: 0.1,
            stops: [0, 100]
        }
    },
    grid: {
        borderColor: '#f1f5f9',
        strokeDashArray: 4,
        xaxis: { lines: { show: false } },
        yaxis: { lines: { show: true } },
        padding: { top: 10, right: 20, bottom: 10, left: 10 }
    },
    markers: {
        size: 4,
        colors: ['#2563eb'],
        strokeColors: '#ffffff',
        strokeWidth: 2,
        hover: { size: 7 }
    },
    xaxis: {
        categories: props.categories,
        labels: {
            style: { colors: '#64748b', fontSize: '11px', fontWeight: 500 },
            rotate: -45,
            rotateAlways: false,
        },
        axisBorder: { show: false },
        axisTicks: { show: false }
    },
    yaxis: {
        labels: {
            style: { colors: '#64748b', fontSize: '11px', fontWeight: 500 },
            formatter: (val: number) => Math.round(val)
        }
    },
    tooltip: {
        theme: 'light',
        x: { show: true },
        y: { formatter: (val: number) => `${val} usuários` }
    },
    legend: { show: false }
}));
</script>

<template>
    <div class="w-full h-full flex flex-col">
        <div v-if="props.title" class="mb-2">
            <h3 class="text-[18px] font-bold text-slate-800">{{ props.title }}</h3>
            <p class="text-[14px] text-slate-500">Cadastros diários nos últimos 30 dias</p>
        </div>
        <div class="flex-1 w-full min-h-[300px]">
            <apexchart
                type="line"
                height="100%"
                width="100%"
                :options="chartOptions"
                :series="props.series"
            ></apexchart>
        </div>
    </div>
</template>