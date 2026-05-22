<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue';
import BaseButton from './base-button.vue';

interface Props {
    show: boolean;
    title: string;
    message: string;
    confirm: () => void;
    cancel: () => void;
    confirmLabel?: string;
    cancelLabel?: string;
    danger?: boolean;
    loading?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
    confirmLabel: 'Confirmar',
    cancelLabel: 'Cancelar',
    danger: true,
    loading: false
});

onMounted(() => {
    if (props.show) {
        document.body.style.overflow = 'hidden';
    }
});

onUnmounted(() => {
    document.body.style.overflow = '';
});
</script>

<template>
    <Teleport to="body">
        <Transition
            enter-from-class="opacity-0"
            enter-to-class="opacity-100"
            leave-from-class="opacity-100"
            leave-to-class="opacity-0"
        >
            <div v-if="show" class="fixed inset-0 z-50 flex items-center justify-center p-4">
                <div
                    class="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
                    @click="!loading ? cancel : null"
                ></div>

                <Transition
                    enter-active-class="transition duration-300 ease-out"
                    enter-from-class="opacity-0 scale-95 translate-y-4"
                    enter-to-class="opacity-100 scale-100 translate-y-0"
                    leave-active-class="transition duration-200 ease-in"
                    leave-from-class="opacity-100 scale-100 translate-y-0"
                    leave-to-class="opacity-0 scale-95 translate-y-4"
                >
                    <div class="py-5 relative w-full max-w-md bg-white rounded-lg shadow-2xl border border-slate-200 overflow-hidden">
                        <div class="p-6 text-center">
                            <h3 class="text-xl font-bold text-slate-900 mb-2">
                                {{ title }}
                            </h3>
                            <p class="text-slate-600 text-base leading-relaxed">
                                {{ message }}
                            </p>
                        </div>

                        <div class="p-4 flex flex-col-reverse sm:flex-row sm:justify-center gap-3 px-10 pt-2 pb-6">
                            <BaseButton
                                @click="cancel"
                                :disabled="loading"
                                class="w-full sm:w-auto px-6 py-2.5 text-sm font-semibold flex-1 text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer"
                            >
                                {{ cancelLabel }}
                            </BaseButton>
                            <BaseButton
                                @click="confirm"
                                :loading="loading"
                                :class="[
                                    'w-full sm:w-auto px-6 py-2.5 text-sm font-semibold flex-1 text-white rounded-lg transition-all cursor-pointer',
                                    danger ? 'bg-red-600 hover:bg-red-700 shadow-red-200' : 'bg-blue-600 hover:bg-blue-700'
                                ]"
                            >
                                {{ confirmLabel }}
                            </BaseButton>
                        </div>
                    </div>
                </Transition>
            </div>
        </Transition>
    </Teleport>
</template>
