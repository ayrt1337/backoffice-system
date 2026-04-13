<script setup lang="ts">
interface Props {
    message?: string,
    show: boolean
};

const props = defineProps<Props>();
</script>

<template>
    <h1 v-if="show" class="text-[17px] text-red-600">{{ message }}</h1>
</template>