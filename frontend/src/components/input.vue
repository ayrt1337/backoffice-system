<script setup lang="ts">
import { useId, ref } from 'vue';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';

const id = useId();

interface Props {
    label?: string,
    password?: boolean,
    disabled?: boolean,
    placeholder?: string
};

const showPassword = ref<boolean>(false);
const props = defineProps<Props>();
const text = defineModel<string>();

const handlePasswordVisibility = () => {
    showPassword.value = !showPassword.value;
};
</script>

<template>
    <div class="flex flex-col gap-2">
        <label class="text-[15px] font-medium text-slate-600" v-if="label" :for="id">{{ label }}</label>

        <div class="flex items-center relative">
            <input 
                v-model="text"
                :disabled="disabled"
                :id="id" 
                :placeholder="placeholder"
                :type="password ? (showPassword ? 'text' : 'password') : 'text'"
                :class="password ? 'pr-10' : ''"
                class="w-full px-3.5 py-2 rounded-lg border-[1.5px] border-slate-200 bg-white text-base text-slate-800 transition-all focus:outline-none focus:border-blue-500 placeholder:text-slate-400 placeholder:text-[15px]"
            >

            <FontAwesomeIcon 
                v-if="password" 
                class="absolute cursor-pointer right-3 text-[#b8b8b8]" 
                :icon="showPassword ? faEyeSlash : faEye" 
                @click="handlePasswordVisibility"
            />
        </div>
    </div>
</template>