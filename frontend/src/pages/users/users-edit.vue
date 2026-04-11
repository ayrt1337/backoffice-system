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

        if (response.status === 200) {
            userData.value = {
                name: response.data.userData.name,
                role: response.data.userData.role.name,
                password: ""
            };

            user.value = response.data.user;
            roles.value = response.data.roles;
        }
        else {
            showToast('Erro ao carregar dados do usuário', 'error');
        }
    } catch (error) {
        showToast('Erro de conexão com o servidor', 'error');
        console.error("Erro em buscar usuário: ", error);
    }
});

const handleEdit = async () => {
    loadingBtn.value = true;
    try {
        const response = await api({
            url: `/users/edit/${props.name}`,
            method: "patch",
            data: {
                user: user.value
            }
        });
        
        if (response.status === 200) {
            showToast('Usuário atualizado com sucesso!', 'success');
        }
        else {
            showToast('Erro ao atualizar usuário', 'error');
        }
    } catch (error: any) {
        const message = error.response?.data?.error || 'Erro ao processar solicitação';
        showToast(message, 'error');
        console.error("Erro ao editar usuário: ", error);
    } finally {
        loadingBtn.value = false;
    }
};
</script>

<template>
    <TemplatePage :name="user.name">
        <Breadcrumbs
            class="mt-2"
            :breadcrumbs="[...metadata.breadcrumbs, { label: `${name}`, path: `/users/${name}` }, { label: 'Editar' },]"
        />

        <Input 
            label="Usuário"
            v-model="userData.name"
            class="max-w-[400px] mt-15"
            :disabled="name === 'admin' ? true : false"
        />

        <Input 
            label="Senha"
            v-model="userData.password"
            password
            placeholder="Nova Senha"
            class="max-w-[400px] mt-8"
        />

        <Dropdown 
            label="Cargo"
            v-model="userData.role"
            :options="roleOptions"
            class="max-w-[400px] mt-8"
            :selected-option="userData.role"
        />

        <button 
            @click="handleEdit()"
            :disabled="loadingBtn"
            class="mt-5 p-2 px-8 rounded-lg bg-blue-600 text-white text-base font-semibold cursor-pointer transition-all flex justify-center items-center hover:bg-blue-700 active:translate-y-0 disabled:opacity-70 disabled:cursor-not-allowed"
        >
            <span v-if="!loadingBtn">Salvar</span>
            <span v-else class="w-5 h-5 border-2 border-white/30 rounded-full border-t-white animate-spin"></span>
        </button>
    </TemplatePage>
</template>