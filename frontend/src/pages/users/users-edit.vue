<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useToast } from '../../composables/useToast';
import TemplatePage from '../../components/template-page.vue';
import { api } from '../../services/api';
import Breadcrumbs from '../../components/breadcrumbs.vue';
import Input from '../../components/input.vue';
import { resources } from '../../config/resources';
import Dropdown from '../../components/dropdown.vue';
import type { User, UserMetadata } from '../../types/user';
import type { Error } from '../../types/error';
import { verifyApiError } from '../../services/verifyApiError';
import ErrorMessage from '../../components/error-message.vue';

interface Props {
    name: string
};
const props = defineProps<Props>();

const metadata = resources.users;

const userData = ref<UserMetadata>({
    name: '',
    password: '',
    role: ''
});

const user = ref<User>({
    name: ''
});

const errorData = ref<Error>({
    show: false,
    message: ''
});

const { showToast } = useToast();

interface Roles {
    label: string,
    value: string
};

const roles = ref<Roles[]>([]);
const loadingBtn = ref<boolean>(false);

const roleOptions = computed(() => {
    if (!Array.isArray(roles.value)) return [];
    return roles.value.map((role: any) => ({
        label: role.name,
        value: role.name
    }));
});

onMounted(async () => {
    try {
        const response = await api({
            url: `/users/edit/${props.name}`,
            method: 'get'
        });

        userData.value = {
            name: response.data.userData.name,
            role: response.data.userData.role.name,
            password: ""
        };

        user.value = response.data.user;
        roles.value = response.data.roles;
    } catch (error: any) {
        console.error("Erro em buscar usuário: ", error);
        verifyApiError(error.response.status);
    } finally {
        // showLoading(false);
    }
});

const handleEdit = async () => {
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
        
        showToast('Usuário atualizado com sucesso!', 'success');
    } catch (error: any) {    
        console.error("Erro ao editar usuário: ", error);
        const hasMessage = verifyApiError(error.response.status, false);

        if (hasMessage) {
            errorData.value = {
                show: true,
                message: error.response.data
            };
            return;
        }
    } finally {
        loadingBtn.value = !loadingBtn.value;
    }
};
</script>

<template>
    <TemplatePage :name="user.name">
        <Breadcrumbs
            class="mt-2"
            :breadcrumbs="[...metadata.breadcrumbs, { label: `${name}`, path: `/users/${name}` }, { label: 'Editar' },]"
        />

        <div class="mt-15">
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

            <button 
                @click="handleEdit()"
                :disabled="loadingBtn"
                class="mt-5 p-2 px-8 rounded-lg bg-blue-600 text-white text-base font-semibold cursor-pointer transition-all flex justify-center items-center hover:bg-blue-700 active:translate-y-0 disabled:opacity-70 disabled:cursor-not-allowed"
            >
                <span v-if="!loadingBtn">Criar</span>
                <span v-else class="w-5 h-5 border-2 border-white/30 rounded-full border-t-white animate-spin"></span>
            </button>
        </div>
    </TemplatePage>
</template>