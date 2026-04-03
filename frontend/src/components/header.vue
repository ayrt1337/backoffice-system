<script setup lang="ts">
import { ref } from 'vue';

const userEmail = ref('admin@backoffice.com'); // Mock current user
</script>

<template>
    <header class="fixed top-0 left-64 right-0 h-16 bg-white/80 backdrop-blur-md border-b border-slate-200 z-20 px-8 flex items-center justify-between">
        <!-- Center/Left Navigation -->
        <div class="hidden md:flex items-center space-x-6 text-sm font-medium text-slate-500">
            <a href="#" class="hover:text-slate-900 transition-colors">Suporte</a>
            <a href="#" class="hover:text-slate-900 transition-colors">Documentação</a>
        </div>

        <!-- Right Side: Theme & User -->
        <div class="flex items-center space-x-4 pr-1">
            <!-- Theme Toggle -->
            <button class="p-2 text-slate-400 hover:text-slate-900 transition-colors rounded-xl hover:bg-slate-50">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"></path>
                </svg>
            </button>

            <!-- User Profile (No Photo) -->
            <div class="flex items-center gap-3 pl-4 border-l border-slate-200">
                <div class="text-right hidden sm:block">
                    <p class="text-[11px] font-bold text-slate-800 leading-none mb-0.5">{{ userEmail }}</p>
                    <p class="text-[10px] text-slate-400 font-medium">Administrator</p>
                </div>
                <div class="w-9 h-9 bg-blue-100 rounded-full flex items-center justify-center text-blue-700 font-bold text-xs ring-2 ring-white shadow-sm cursor-pointer hover:bg-blue-200 transition-colors">
                    {{ userEmail.charAt(0).toUpperCase() }}
                </div>
            </div>
        </div>
    </header>
</template>
