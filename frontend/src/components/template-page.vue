<script setup lang="ts">
import { onMounted } from 'vue';
import Sidebar from '../components/sidebar.vue';
import Header from '../components/header.vue';
import Toast from '../components/toast.vue';
import ServerError from './serverError.vue';
import Unauthorized from './unauthorized.vue';
import Loading from './loading.vue';
import { useLoading } from '../composables/useLoading';
import { useServerError } from '../composables/useServerError';
import { useUnauthorized } from '../composables/useUnauthorized';
import { resetPageState } from '../services/pageResetState';

const { showLoading } = useLoading();
const { showError } = useServerError();
const { showUnauthorized } = useUnauthorized();

onMounted(() => resetPageState());
</script>

<template>
    <Loading v-if="showLoading" />

    <template v-else>
        <Unauthorized v-if="showUnauthorized" />
        <ServerError v-else-if="showError" />

        <div v-else class="min-h-screen bg-slate-50 flex flex-col">
            <Toast />
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
</template>
