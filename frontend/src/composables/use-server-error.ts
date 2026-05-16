import { ref } from 'vue';

const showError = ref<boolean>(false);

export const useServerError = () => {
    const showServerErrorPage = (show: boolean): void => {
        showError.value = show;
    };

    return {
        showServerErrorPage,
        showError
    };
};