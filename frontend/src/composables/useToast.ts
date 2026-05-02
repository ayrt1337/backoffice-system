import { ref, watch } from 'vue';
import { useLoading } from './useLoading';

const { showLoading } = useLoading();

export type ToastType = 'success' | 'error' | 'info';

interface ToastState {
    show: boolean;
    message: string;
    type: ToastType;
    id: number;
    duration: number;
}

const state = ref<ToastState>({
    show: false,
    message: '',
    type: 'success',
    id: 0,
    duration: 3000
});

let timeoutId: number | null = null;
let toastCounter = 0;

watch(() => showLoading.value, () => {
    if (timeoutId) {
        clearTimeout(timeoutId);
    }

    if (!showLoading.value) {
        timeoutId = window.setTimeout(() => {
            state.value.show = false;
        }, state.value.duration);
    }
});

export function useToast() {
    const showToast = (message: string, type: ToastType = 'success', duration = 3000) => {
        if (timeoutId) {
            clearTimeout(timeoutId);
        }

        toastCounter++;

        state.value = {
            show: true,
            message,
            type,
            id: toastCounter,
            duration
        };

        if (!showLoading) {
            timeoutId = window.setTimeout(() => {
                state.value.show = false;
            }, duration);
        }
    };

    return {
        toastState: state,
        showToast
    };
}
