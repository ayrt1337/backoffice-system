<script setup lang="ts">
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { faRightFromBracket } from '@fortawesome/free-solid-svg-icons';
import router from '../router';
import { api } from '../services/api';
import { useUser } from '../composables/useUser';
import { useLoading } from '../composables/useLoading';
import { useToast } from '../composables/useToast';

const { showToast } = useToast();
const { showLoadingPage } = useLoading();
const { showUser } = useUser();

const handleLogout = async () => {
    showLoadingPage(true);
    try {
        await api({
            url: "/logout",
            method: "get",
        });

        router.push('/login');
    } catch(error: any) {
        console.error("Erro ao fazer logout: ", error);
        showLoadingPage(false);
        const apiMessage = error.response?.data;
        showToast(apiMessage || "Ops! Algo deu errado.", "error", true);
    }
};
</script>

<template>
    <header class="fixed top-0 w-full h-22 bg-white z-20 px-8 flex items-center justify-between border-b border-slate-200/60">
        <div>
            <h1 class="text-xl font-bold text-slate-800 tracking-tight flex items-center gap-2">
                Backoffice System
            </h1>
        </div>
        
        <div class="flex items-center space-x-4 pr-1">
            <div class="flex items-center gap-3 pl-4 relative group">
                <div class="text-right hidden sm:block">
                    <p class="font-bold text-slate-800 leading-none mb-0.5">{{ showUser.name }}</p>
                </div>
                <div class="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-700 font-bold text-[15px] ring-2 ring-white cursor-pointer">
                    {{ showUser.name.charAt(0).toUpperCase() }}
                </div>

                <div class="absolute right-0 top-full pt-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible z-50">
                    <div class="group bg-white rounded-lg border border-slate-100 min-w-[200px] overflow-hidden">
                        <button 
                            @click="handleLogout"   
                            class="cursor-pointer w-full flex items-center gap-3 px-4 py-4 text-sm text-slate-700 text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors text-left"
                        >
                            <FontAwesomeIcon :icon="faRightFromBracket" class="text-slate-400 group-hover:text-slate-900" />
                            Sair
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </header>
</template>
