<script setup lang="ts">
import { onMounted, ref } from 'vue';
import TemplatePage from '../../components/template-page.vue';
import { api } from '../../services/api';
import Input from '../../components/input.vue';
import Breadcrumbs from '../../components/breadcrumbs.vue';
import CheckboxPanel from '../../components/checkbox-panel.vue';
import { resources as resourcesMetadata } from '../../config/resources';

const metadata = resourcesMetadata.roles;

const name = ref<string>('');
const selectedOptions = ref<string[]>([]);
const resources = ref<any>([]);
const loadingBtn = ref<boolean>(false);

onMounted(async () => {
    try {
        const response = await api({
            url: "/roles/create",
            method: "get",
        });
        
        if (response.status === 200) {
            resources.value = response.data.resources;
        }
        else {
            // SHOW ERROR
        }
    } catch (error) {
        console.error("Erro ao buscar cargos:", error);
    }
})

const handleCreate = async () => {
    try {
        const response = await api({
            url: "/roles/create",
            method: "post",
            data: {
                name: name.value,
                rolePermissions: selectedOptions.value
            }
        });

        if (response.status === 200) {
            // CARGO CRIADO COM SUCESSO
        }
        else {
            // SHOW ERROR
        }
    } catch (error) {
        console.log("Erro ao criar cargo: ", error);
        // MOSTRAR ERRO
    }
}
</script>

<template>
    <TemplatePage name="">
        <Breadcrumbs
            class="mt-2"
            :breadcrumbs="[...metadata.breadcrumbs, { label: 'Criar' },]"
        />

        <Input 
            label="Nome do Cargo"
            v-model="name"
            class="max-w-[400px] mt-15"
        />

        <div class="mt-10">
            <h1 class="text-[15px] font-medium text-slate-600">Permissões</h1>
        
            <CheckboxPanel 
                role=""
                :selected-permissions="selectedOptions"
                :resources="resources"
            />
        </div>

        <button 
            @click="handleCreate()"
            :disabled="loadingBtn"
            class="mt-5 p-2 px-8 rounded-lg bg-blue-600 text-white text-base font-semibold cursor-pointer transition-all flex justify-center items-center hover:bg-blue-700 active:translate-y-0 disabled:opacity-70 disabled:cursor-not-allowed"
        >
            <span v-if="!loadingBtn">Criar</span>
            <span v-else class="w-5 h-5 border-2 border-white/30 rounded-full border-t-white animate-spin"></span>
        </button>
    </TemplatePage>
</template>