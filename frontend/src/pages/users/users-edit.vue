<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue';
import { useToast } from '../../composables/useToast';
import TemplatePage from '../../components/template-page.vue';
import { api } from '../../services/api';
import Breadcrumbs from '../../components/breadcrumbs.vue';
import Input from '../../components/input.vue';
import { resources } from '../../config/resources';
import Dropdown from '../../components/dropdown.vue';
import type { UserMetadata } from '../../types/user';
import type { Error } from '../../types/error';
import { verifyApiError } from '../../services/verifyApiError';
import ErrorMessage from '../../components/error-message.vue';
import { useLoading } from '../../composables/useLoading';
import { useUser } from '../../composables/useUser';
import BaseButton from '../../components/base-button.vue';
import router from '../../router';

const { setUser } = useUser();
const { showToast } = useToast();
const { showLoadingPage } = useLoading();
const metadata = resources.users;

interface Roles {
    label: string,
    value: string
};

interface Props {
    name: string
};

const props = defineProps<Props>();

const userData = ref<UserMetadata>({
    name: '',
    password: '',
    role: ''
});

const errorData = ref<Error>({
    show: false,
    message: ''
});

const roles = ref<Roles[]>([]);
const loadingBtn = ref<boolean>(false);

const roleOptions = computed(() => {
    if (!Array.isArray(roles.value)) return [];
    return roles.value.map((role: any) => ({
        label: role.name,
        value: role.name
      }));
});

const loadData = async () => {
    try {
        showLoadingPage(true);
        const response = await api({
            url: `/users/edit/${props.name}`,
            method: 'get'
        });

        userData.value = {
            name: response.data.userData.name,
            role: response.data.userData.role.name,
            password: "",
            created_at: response.data.userData.created_at,
            updated_at: response.data.userData.updated_at
        };

        setUser(response.data.user);
        roles.value = response.data.roles;
    } catch (error: any) {
        console.error("Erro em buscar usuário: ", error);
        verifyApiError(error.response?.status);
    } finally {
        showLoadingPage(false);
    }
};

onMounted(() => {
    loadData();
});

watch(() => props.name, () => {
    loadData();
});

const handleEdit = async () => {
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
            url: `/users/edit/${props.name}`,
            method: "patch",
            data: {
                userName: userData.value.name,
                roleName: userData.value.role,
                password: userData.value.password
            }
        });
        
        await router.push(`/users/${userData.value.name}`);
        showToast('Usuário atualizado com sucesso!', 'success');
    } catch (error: any) {    
        console.error("Erro ao editar usuário: ", error);
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
};
</script>

<template>
    <TemplatePage>
        <Breadcrumbs
            class="mt-2"
            :breadcrumbs="[...metadata.breadcrumbs, { label: `${name}`, path: `/users/${name}` }, { label: 'Editar' },]"
        />

        <template v-if="userData.name !== ''">
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
                    @click="handleEdit()"
                    :loading="loadingBtn"
                    class="mt-5 p-2 px-8 rounded-lg bg-blue-600 text-white text-base font-semibold hover:bg-blue-700"
                >
                    Salvar
                </BaseButton>
            </div>
        </template>

        <div v-else>
            <p class="text-[18px]">Usuário não encontrado</p>
        </div>
    </TemplatePage>
</template>