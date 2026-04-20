<script setup lang="ts">
import { onMounted, ref, computed } from 'vue';
import TemplatePage from '../../components/template-page.vue';
import { api } from '../../services/api';
import { resources } from '../../config/resources';
import Breadcrumbs from '../../components/breadcrumbs.vue';
import Input from '../../components/input.vue';
import Dropdown from '../../components/dropdown.vue';
import type { UserMetadata } from '../../types/user';
import type { Error } from '../../types/error';
import { verifyApiError } from '../../services/verifyApiError';
import ErrorMessage from '../../components/error-message.vue';
import { useToast } from '../../composables/useToast';
import router from '../../router';
import { useLoading } from '../../composables/useLoading';
import { useUser } from '../../composables/useUser';
import BaseButton from '../../components/base-button.vue';

const { setUser } = useUser();
const { showToast } = useToast();
const { showLoadingPage } = useLoading();
const metadata = resources.users;

const userData = ref<UserMetadata>({
    name: '',
    password: '',
    role: ''
});

const errorData = ref<Error>({
    show: false,
    message: ''
});

const roles = ref<any>([]);
const loadingBtn = ref<boolean>(false);

const roleOptions = computed(() => {
    if (!Array.isArray(roles.value)) return [];
    return roles.value.map((role: any) => ({
        label: role.id,
        value: role.id
    }));
});

onMounted(async () => {
    try {
        const response = await api({
            url: "/users/create",
            method: "get",
        });

        setUser(response.data.user);
        roles.value = response.data.roles;
    } catch (error: any) {
        console.error("Erro ao buscar cargos:", error);
        verifyApiError(error.response?.status);  
    } finally {
        showLoadingPage(false);
    }
})

const handleCreate = async () => {
    if (!userData.value.name || !userData.value.role) {
        errorData.value = {
            show: true,
            message: "Preencha os campos!"
        };
        return;
    }

    errorData.value = {
        show: false
    };

    loadingBtn.value = !loadingBtn.value;

    try {
        await api({
            url: "/users/create",
            method: "post",
            data: {
                name: userData.value.name,
                password: userData.value.password,
                role: userData.value.role
            }
        });

        showToast("Usuário criado com sucesso!", "success");
        router.push("/users");
    } catch (error: any) {
        console.log("Erro ao criar usuário: ", error);
        const hasMessage = verifyApiError(error.response?.status, false);

        if (hasMessage) {
            errorData.value = {
                show: true,
                message: error.response?.data
            };
            return;
        }
    } finally {
        loadingBtn.value = !loadingBtn.value;
    }
}
</script>

<template>
    <TemplatePage>
        <Breadcrumbs
            class="mt-2"
            :breadcrumbs="[...metadata.breadcrumbs, { label: 'Criar' }]"
        />

        <div class="mt-12">
           <ErrorMessage
                :show="errorData.show"
                :message="errorData.message"
                class="mb-8"
            /> 

            <Input 
                label="Usuário"
                v-model="userData.name"
                class="max-w-[400px]"
            />
            
            <Dropdown 
                label="Cargo"
                v-model="userData.role"
                :options="roleOptions"
                placeholder="Selecione um Cargo"
                class="max-w-[400px] mt-8"
            />

            <Input 
                label="Senha"
                v-model="userData.password"
                password
                class="max-w-[400px] mt-8"
            />

            <BaseButton 
                @click="handleCreate()"
                :loading="loadingBtn"
                class="mt-5 p-2 px-8 rounded-lg bg-blue-600 text-white text-base font-semibold hover:bg-blue-700"
            >
                Criar
            </BaseButton>
        </div>
    </TemplatePage>
</template>