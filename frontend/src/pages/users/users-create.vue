<script setup lang="ts">
import { onMounted, ref, computed } from 'vue';
import TemplatePage from '../../components/template-page.vue';
import { api } from '../../services/api';
import { resources } from '../../config/resources';
import Breadcrumbs from '../../components/breadcrumbs.vue';
import Input from '../../components/input.vue';
import Dropdown from '../../components/dropdown.vue';

const metadata = resources.users;

const name = ref<string>('');
const password = ref<string>('');
const roles = ref<any>([]);
const roleName = ref<string>('');
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
            url: "/roles",
            method: "get",
        });
        
        if (response.status === 200) {
            roles.value = response.data.roles;
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
            url: "/users/create",
            method: "post",
            data: {
                name: name.value,
                password: password.value,
                role: roleName.value
            }
        });

        if (response.status === 200) {
            // USUÁRIO CRIADO COM SUCESSO
        }
        else {
            // SHOW ERROR
        }
    } catch (error) {
        console.log("Erro ao criar usuário: ", error);
        // MOSTRAR ERRO
    }
}
</script>

<template>
    <TemplatePage>
        <Breadcrumbs
            class="mt-2"
            :breadcrumbs="[...metadata.breadcrumbs, { label: 'Criar' }]"
        />

        <Input 
            label="Usuário"
            v-model="name"
            class="max-w-[400px] mt-15"
        />
        
        <Dropdown 
            label="Cargo"
            v-model="roleName"
            :options="roleOptions"
            class="max-w-[400px] mt-8"
        />

        <Input 
            label="Senha"
            v-model="password"
            password
            class="max-w-[400px] mt-8"
        />

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