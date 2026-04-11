<script setup lang="ts">
import { useId } from 'vue';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { faChevronDown } from '@fortawesome/free-solid-svg-icons';

interface Props {
    label?: string;
    placeholder?: string;
    options: any;
    disabled?: boolean;
    selectedOption?: string;
}

const id = useId();
const props = defineProps<Props>();

const modelValue = defineModel<any>();
</script>

<template>
    <div class="flex flex-col gap-2 relative w-full">
        <label 
            v-if="label" 
            :for="id" 
            class="text-[15px] font-medium text-slate-600"
        >
            {{ label }}
        </label>

        <div class="relative flex items-center group">
            <select
                :id="id"
                v-model="modelValue"
                :disabled="disabled"
                :class="[
                    'w-full px-3.5 py-2.5 rounded-lg border-[1.5px] bg-white text-base text-slate-800 transition-all outline-none focus:border-blue-500 appearance-none cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed disabled:bg-slate-50 border-slate-200',
                    !modelValue ? 'text-slate-400' : 'text-slate-800'
                ]"
            >
                <option value="" disabled selected v-if="placeholder">{{ placeholder }}</option>
                <option
                    v-for="option in options" 
                    :key="option.value" 
                    :value="option.value"
                    class="text-slate-800"
                    :selected="selectedOption === option.value"
                >
                    {{ option.label }}
                </option>
            </select>

            <FontAwesomeIcon 
                :icon="faChevronDown"
                class="absolute right-3.5 text-[12px] text-slate-400 pointer-events-none transition-colors group-focus-within:text-blue-500"
            />
        </div>
    </div>
</template>