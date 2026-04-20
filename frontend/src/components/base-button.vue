<script setup lang="ts">
interface Props {
    loading?: boolean;
    disabled?: boolean;
    type?: 'button' | 'submit' | 'reset';
    class?: string | string[];
};

const props = withDefaults(defineProps<Props>(), {
    loading: false,
    disabled: false,
    type: 'button',
});
</script>

<template>
    <button
        :type="type"
        :disabled="disabled || loading"
        :class="[
            'cursor-pointer transition-all flex justify-center items-center disabled:opacity-70 disabled:cursor-not-allowed',
            props.class
        ]"
    >
        <slot v-if="!loading" />
        <span v-else class="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin"></span>
    </button>
</template>
