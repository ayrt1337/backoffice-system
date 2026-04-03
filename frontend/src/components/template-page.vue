<script setup lang="ts">
import Sidebar from '../components/sidebar.vue';
import Header from '../components/header.vue';
</script>

<template>
    <div class="min-h-screen bg-slate-50 flex">
        <!-- Persistent Sidebar -->
        <Sidebar />

        <!-- Main Workspace -->
        <div class="flex-1 flex flex-col ml-64 min-w-0">
            <!-- Persistent Header -->
            <Header />

            <!-- Dynamic Content Area -->
            <main class="flex-1 pt-16 animate-in fade-in duration-500">
                <div class="p-8 max-w-[1400px]">
                    <slot />
                </div>
            </main>
        </div>
    </div>
</template>