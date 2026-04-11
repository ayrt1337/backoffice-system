import { ref } from 'vue';

export type ToastType = 'success' | 'error' | 'info';

interface ToastState {
    show: boolean;
    message: string;
    type: ToastType;
}

const state = ref<ToastState>({
    show: false,
    message: '',
    type: 'success'
});

let timeoutId: number | null = null;

export function useToast() {
    const showToast = (message: string, type: ToastType = 'success', duration = 3000) => {
        if (timeoutId) {
            clearTimeout(timeoutId);
        }

        state.value = {
            show: true,
            message,
            type
        };

        timeoutId = window.setTimeout(() => {
            state.value.show = false;
        }, duration);
    };

    return {
        toastState: state,
        showToast
    };
}
