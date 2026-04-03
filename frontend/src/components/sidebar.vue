<script setup lang="ts">
import { useRoute } from 'vue-router';

const route = useRoute();

const menuItems = [
    { name: 'Dashboard', path: '/dashboard', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
    { name: 'Usuários', path: '/users', icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0-6a5.99 5.99 0 00-4.846 2.518M18 14l2 2m0 0l2-2m-2 2l-2-2m2 2l2 2' },
    { name: 'Cargos', path: '/roles', icon: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z' },
];
</script>

<template>
    <aside class="fixed inset-y-0 left-0 w-64 bg-white border-r border-slate-200 z-30 transition-all duration-300">
        <div class="flex flex-col h-full">
            <!-- Logo Section -->
            <div class="p-6">
                <h1 class="text-xl font-bold text-slate-800 tracking-tight flex items-center gap-2">
                    <span class="p-1.5 bg-blue-600 rounded-lg text-white">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
                        </svg>
                    </span>
                    Backoffice System
                </h1>
            </div>

            <!-- Navigation Section -->
            <nav class="flex-1 px-4 py-4 space-y-8">
                <div>
                    <h3 class="text-xs font-semibold text-slate-400 uppercase tracking-widest px-2 mb-4">Navegação</h3>
                    <div class="space-y-1">
                        <router-link 
                            v-for="item in menuItems" 
                            :key="item.path"
                            :to="item.path"
                            class="flex items-center px-3 py-2 text-sm font-medium rounded-xl transition-colors group"
                            :class="route.path.startsWith(item.path) 
                                ? 'bg-blue-50 text-blue-600' 
                                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'"
                        >
                            <svg 
                                class="w-5 h-5 mr-3 transition-colors" 
                                :class="route.path.startsWith(item.path) ? 'text-blue-600' : 'text-slate-400 group-hover:text-slate-600'"
                                fill="none" 
                                stroke="currentColor" 
                                viewBox="0 0 24 24" 
                                xmlns="http://www.w3.org/2000/svg"
                            >
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" :d="item.icon"></path>
                            </svg>
                            {{ item.name }}
                        </router-link>
                    </div>
                </div>
            </nav>

            <!-- Bottom Disclaimer/CTA -->
            <div class="p-6">
                <div class="bg-blue-50 p-4 rounded-2xl relative overflow-hidden group">
                    <div class="relative z-10">
                        <h4 class="text-sm font-bold text-blue-900 leading-tight mb-1">Suporte</h4>
                        <p class="text-[11px] text-blue-700/80 mb-3 leading-relaxed">Precisa de ajuda com o sistema?</p>
                        <button class="w-full py-2 px-3 bg-blue-600 text-white text-[11px] font-bold rounded-xl hover:bg-blue-700 transition-colors shadow-sm">Entre em contato</button>
                    </div>
                </div>
            </div>
        </div>
    </aside>
</template>