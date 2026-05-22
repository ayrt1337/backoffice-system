<script setup lang="ts">
import Sidebar from '../components/sidebar.vue';
import Header from '../components/header.vue';
import Toast from '../components/toast.vue';
import ServerError from './server-error.vue';
import Unauthorized from './unauthorized.vue';
import Loading from './loading.vue';
import { useLoading } from '../composables/use-loading';
import { useServerError } from '../composables/use-server-error';
import { useUnauthorized } from '../composables/use-unauthorized';
import { useSidebar } from '../composables/use-sidebar';

const { showLoading } = useLoading();
const { showError } = useServerError();
const { showUnauthorized } = useUnauthorized();
const { isSidebarOpen, closeSidebar } = useSidebar();
</script>

<template>
    <Toast />
    <Loading v-if="showLoading" />

    <template v-else>
        <Unauthorized v-if="showUnauthorized" />
        <ServerError v-else-if="showError" />

        <div v-else class="min-h-screen bg-slate-50 flex flex-col">
            <Header />

            <div class="flex-1 flex flex-col lg:ml-70 min-w-0">
                <div 
                    v-if="isSidebarOpen" 
                    @click="closeSidebar"
                    class="fixed inset-x-0 bottom-0 top-[87px] bg-slate-900/50 z-20 lg:hidden"
                ></div>

                <Sidebar />

                <main class="flex-1 pt-22 animate-in fade-in duration-500">
                    <div class="p-8">
                        <slot />
                    </div>
                </main>
            </div>
        </div>
    </template>
</template>
