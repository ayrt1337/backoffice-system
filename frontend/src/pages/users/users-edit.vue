<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import TemplatePage from '../../components/template-page.vue';
import { api } from '../../services/api';
import Breadcrumbs from '../../components/breadcrumbs.vue';
import Input from '../../components/input.vue';
import { resources } from '../../config/resources';
import Dropdown from '../../components/dropdown.vue';

const metadata = resources.users;

interface Props {
    name: string
};

const props = defineProps<Props>();

const userName = ref<string>('');
const roleName = ref<string>('');
const roles = ref<string[]>([]);
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
            userName.value = response.data.user.name;
            roleName.value = response.data.user.role.name;
            roles.value = response.data.roles;
        }
        else {
            // SHOW ERROR
        }
    } catch (error) {
        console.error("Erro em buscar usuário: ", error);
    }
});

const handleEdit = async () => {
    try {
        const response = await api({
            url: `/users/edit/${props.name}`,
            method: "patch",
            data: {
                userName: userName.value,
                roleName: roleName.value
            }
        });
        
        if (response.status === 200) {
            // MOSTRAR SUCESSO
        }
        else {
            // SHOW ERROR
        }
    } catch (error) {
        console.error("Erro ao buscar cargos: ", error);
    }
};
</script>

<template>
    <TemplatePage>
        <Breadcrumbs
            class="mt-2"
            :breadcrumbs="[...metadata.breadcrumbs, { label: `${name}`, path: `/users/${name}` }, { label: 'Editar' },]"
        />

        <Input 
            label="Usuário"
            v-model="userName"
            class="max-w-[300px] mt-15"
            :disabled="name === 'admin' ? true : false"
        />

        <Dropdown 
            label="Cargo"
            v-model="roleName"
            :options="roleOptions"
            class="max-w-[400px] mt-8"
            :selected-option="roleName"
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