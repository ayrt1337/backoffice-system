<script setup lang="ts">
import Sidebar from '../components/sidebar.vue';
</script>

<template>
    <Sidebar />

    <div class="ml-[320px] mb-3 max-w-[500px] pt-[20px]">
        <slot />
    </div>
</template>