<script setup lang="ts">
import { useId, ref } from 'vue';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';

const id = useId();

interface Props {
    label?: string,
    password?: boolean,
    disabled?: boolean,
    placeholder?: string,
    error?: string,
    type?: string
};

const showPassword = ref<boolean>(false);
const props = defineProps<Props>();
const text = defineModel<string | number>();

const handlePasswordVisibility = () => {
    showPassword.value = !showPassword.value;
};
</script>

<template>
    <div class="flex flex-col gap-2">
        <label class="text-[15px] font-medium text-slate-600" v-if="label" :for="id">{{ label }}</label>

        <div class="flex items-center relative">
            <input 
                v-model.trim="text"
                :disabled="disabled"
                :id="id" 
                :placeholder="placeholder"
                :min="type === 'number' ? 0 : undefined"
                :type="password ? (showPassword ? 'text' : 'password') : (type === 'number' ? 'number' : 'text')"
                :class="[
                    password ? 'pr-10' : '',
                    error ? 'border-red-500 focus:border-red-500' : 'border-slate-200 focus:border-blue-500'
                ]"
                class="w-full px-3.5 py-2 rounded-lg border-[1.5px] bg-white text-base text-slate-800 transition-all focus:outline-none placeholder:text-slate-400 placeholder:text-[15px]"
            >

            <FontAwesomeIcon 
                v-if="password" 
                class="absolute cursor-pointer right-3 text-[#b8b8b8]" 
                :icon="showPassword ? faEyeSlash : faEye" 
                @click="handlePasswordVisibility"
            />
        </div>
        <span v-if="error" class="text-[15px] text-red-500">{{ error }}</span>
    </div>
</template>

<style scoped>
input::-webkit-outer-spin-button,
input::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}
input[type=number] {
  -moz-appearance: textfield;
}
</style>
