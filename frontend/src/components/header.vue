<script setup lang="ts">
interface Props {
    name: string
};

const props = defineProps<Props>();
</script>

<template>
    <header class="fixed top-0 w-full h-22 bg-white z-20 px-8 flex items-center justify-between border-b border-slate-200/60">
        <div>
            <h1 class="text-xl font-bold text-slate-800 tracking-tight flex items-center gap-2">
                Backoffice System
            </h1>
        </div>
        
        <div class="flex items-center space-x-4 pr-1">
            <div class="flex items-center gap-3 pl-4">
                <div class="text-right hidden sm:block">
                    <p class="font-bold text-slate-800 leading-none mb-0.5">{{ name }}</p>
                </div>
                <div class="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-700 font-bold text-[15px] ring-2 ring-white cursor-pointer transition-colors">
                    {{ name.charAt(0).toUpperCase() }}
                </div>
            </div>
        </div>
    </header>
</template>
