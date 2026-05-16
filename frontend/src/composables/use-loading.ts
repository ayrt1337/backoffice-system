import { ref } from 'vue';

const showLoading = ref<boolean>(false);

export const useLoading = () => {
    const showLoadingPage = (show: boolean): void => {
        showLoading.value = show;
    };

    return {
        showLoadingPage,
        showLoading
    };
};