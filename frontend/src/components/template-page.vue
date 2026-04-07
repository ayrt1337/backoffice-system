<script setup lang="ts">
import Sidebar from '../components/sidebar.vue';
import Header from '../components/header.vue';
</script>

<template>
    <div class="min-h-screen bg-slate-50 flex flex-col">
        <Header />

        <div class="flex-1 flex flex-col ml-70 min-w-0">
            <Sidebar />

            <main class="flex-1 pt-22 animate-in fade-in duration-500">
                <div class="p-8">
                    <slot />
                </div>
            </main>
        </div>
    </div>
</template>
