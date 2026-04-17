<script setup lang="ts">
import { useToast } from '../composables/useToast';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { 
    faCheckCircle, 
    faXmarkCircle, 
    faInfoCircle,
    faXmark 
} from '@fortawesome/free-solid-svg-icons';

const { toastState } = useToast();

const closeToast = () => {
    toastState.value.show = false;
};
</script>

<template>
    <Teleport to="body">
        <Transition
            mode="out-in"
            enter-active-class="transform transition-all ease-out duration-300"
            enter-from-class="translate-y-[-100%] opacity-0 sm:translate-y-0 sm:translate-x-[100%]"
            enter-to-class="translate-y-0 opacity-100 sm:translate-x-0"
            leave-active-class="transform transition-all ease-in duration-300"
            leave-from-class="translate-y-0 opacity-100 sm:translate-x-0"
            leave-to-class="translate-y-[-100%] opacity-0 sm:translate-y-0 sm:translate-x-[100%]"
        >
            <div 
                v-if="toastState.show"
                :key="toastState.id"
                class="fixed top-6 right-6 z-[9999] w-full max-w-sm overflow-hidden rounded-xl border bg-white/80 backdrop-blur-md shadow-2xl ring-1 ring-black/5"
                :class="{
                    'border-emerald-100': toastState.type === 'success',
                    'border-rose-100': toastState.type === 'error',
                    'border-blue-100': toastState.type === 'info'
                }"
            >
                <div class="p-4">
                    <div class="flex items-start gap-3">
                        <div class="flex-shrink-0">
                            <FontAwesomeIcon v-if="toastState.type === 'success'" :icon="faCheckCircle" class="h-5 w-5 text-emerald-500" />
                            <FontAwesomeIcon v-else-if="toastState.type === 'error'" :icon="faXmarkCircle" class="h-5 w-5 text-rose-500" />
                            <FontAwesomeIcon v-else :icon="faInfoCircle" class="h-5 w-5 text-blue-500" />
                        </div>
                        
                        <div class="flex-1 pt-0.5">
                            <p class="text-sm font-semibold text-slate-900">
                                {{ toastState.type === 'success' ? 'Sucesso' : toastState.type === 'error' ? 'Erro' : 'Informação' }}
                            </p>
                            <p class="mt-1 text-sm text-slate-600">
                                {{ toastState.message }}
                            </p>
                        </div>

                        <div class="flex-shrink-0 flex">
                            <button 
                                @click="closeToast"
                                class="inline-flex rounded-md text-slate-400 hover:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <span class="sr-only">Fechar</span>
                                <FontAwesomeIcon :icon="faXmark" class="h-4 w-4" />
                            </button>
                        </div>
                    </div>
                </div>
                
                <div 
                    class="h-1 w-full"
                    :class="{
                        'bg-emerald-100': toastState.type === 'success',
                        'bg-rose-100': toastState.type === 'error',
                        'bg-blue-100': toastState.type === 'info'
                    }"
                >
                    <div 
                        class="h-full animate-progress-shrink"
                        :class="{
                            'bg-emerald-500': toastState.type === 'success',
                            'bg-rose-500': toastState.type === 'error',
                            'bg-blue-500': toastState.type === 'info'
                        }"
                        :style="{ animationDuration: toastState.duration + 'ms' }"
                    ></div>
                </div>
            </div>
        </Transition>
    </Teleport>
</template>

<style>
@keyframes progress-shrink {
    0% { width: 100%; }
    100% { width: 0%; }
}

.animate-progress-shrink {
    animation-name: progress-shrink;
    animation-timing-function: linear;
    animation-fill-mode: forwards;
}
</style>
