import { ref } from 'vue';

const showUnauthorized = ref<boolean>(false);

export const useUnauthorized = () => {
    const showUnauthorizedPage = (show: boolean): void => {
        showUnauthorized.value = show;
    };

    return {
        showUnauthorizedPage,
        showUnauthorized
    };
};