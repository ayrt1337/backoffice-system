import { ref } from "vue";
import type { User } from "../types/user";

const showUser = ref<User>({
    name: "",
    permissions: []
});

export const useUser = () => {
    const setUser = (user: User) => {
        showUser.value = user;
    };

    return {
        setUser,
        showUser
    };
}