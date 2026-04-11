<script setup lang="ts">
import { onMounted, ref } from 'vue';
import TemplatePage from '../../components/template-page.vue';
import { api } from '../../services/api';
import Input from '../../components/input.vue';
import Breadcrumbs from '../../components/breadcrumbs.vue';
import { resources as resourcesMetadata } from '../../config/resources';
import CheckboxPanel from '../../components/checkbox-panel.vue';

const metadata = resourcesMetadata.roles;

interface Props {
    name: string
};

const props = defineProps<Props>();

const role = ref<any>({});
const resources = ref<any[]>([]);
const selectedPermissions = ref<string[]>([]);
const loadingBtn = ref<boolean>(false);

onMounted(async () => {
    try {
        const response = await api({
            url: `/roles/edit/${props.name}`,
            method: "get",
        });
        
        if (response.status === 200) {
            role.value = response.data.role;
            resources.value = response.data.resources;
            selectedPermissions.value = response.data.rolePermissions;
        }
        else {
            // SHOW ERROR
        }
    } catch (error) {
        console.error("Erro ao buscar cargos: ", error);
    }
})

const handleEdit = async () => {
    try {
        const response = await api({
            url: `/roles/edit/${props.name}`,
            method: "patch",
            data: {
                roleName: role.value.name,
                permissions: selectedPermissions.value
            }
        });
        
        if (response.status === 200) {
            
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
    <TemplatePage name="">
        <Breadcrumbs
            class="mt-2"
            :breadcrumbs="[...metadata.breadcrumbs, { label: `${name}`, path: `/roles/${name}` }, { label: 'Editar' },]"
        />

        <Input 
            label="Nome do Cargo"
            v-model="role.name"
            class="max-w-[400px] mt-15"
            :disabled="name === 'admin' ? true : false"
        />

        <div class="mt-10">
            <h1 class="text-[15px] font-medium text-slate-600">Permissões</h1>
        
            <CheckboxPanel 
                :role="role"
                :selected-permissions="selectedPermissions"
                :resources="resources"
            />
        </div>

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