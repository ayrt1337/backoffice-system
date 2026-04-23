<script setup lang="ts">
import { useId } from 'vue';

const id = useId();

interface Props {
    label?: string,
    disabled?: boolean,
};

const props = defineProps<Props>();
const date = defineModel<string>();
</script>

<template>
    <div class="flex flex-col gap-2">
        <label class="text-[15px] font-medium text-slate-600" v-if="label" :for="id">{{ label }}</label>

        <div class="flex items-center relative">
            <input 
                v-model.trim="date"
                :disabled="disabled"
                :id="id"
                type="date"
                class="w-full px-3.5 py-2 rounded-lg border-[1.5px] border-slate-200 bg-white text-base text-slate-800 transition-all focus:outline-none focus:border-blue-500 placeholder:text-slate-400 placeholder:text-[15px]"
            >
        </div>
    </div>
</template>