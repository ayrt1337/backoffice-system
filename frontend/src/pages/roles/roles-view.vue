<script setup lang="ts">
import { ref, onMounted } from 'vue';
import TemplatePage from '../../components/template-page.vue';
import { api } from '../../services/api';
import Breadcrumbs from '../../components/breadcrumbs.vue';
import { resources as resourcesMetadata } from '../../config/resources';
import CheckboxPanel from '../../components/checkbox-panel.vue';
import ConfirmModal from '../../components/confirm-modal.vue';
import router from '../../router';

const metadata = resourcesMetadata.roles;

interface Props {
    name: string
};

const props = defineProps<Props>();
const role = ref<any>({});
const selectedOptions = ref<string[]>([]);
const resources = ref<any[]>([]);
const showDeleteModal = ref(false);

onMounted(async () => {
    const response = await api({
        url: `/roles/${props.name}`,
        method: 'get'
    });

    if (response.status === 200) {
        role.value = response.data.role;
        selectedOptions.value = response.data.rolePermissions;
        resources.value = response.data.resources;
    }
    else {
        // SHOW ERROR
    }
})

const handleDelete = async () => {
    const response = await api({
        url: '/roles/delete',
        method: 'delete',
        data: { name: role.value.name }
    });

    if (response.status === 200) {
        showDeleteModal.value = false;
        router.push('/roles');
    }
    else {
        // SHOW ERROR
    }
}
</script>

<template>
    <TemplatePage>
        <Breadcrumbs
            class="mt-2"
            :breadcrumbs="[...metadata.breadcrumbs, { label: `${role.name}` }]"
        />

        <div class="mt-15">
            <p class="text-[15px] font-medium text-slate-600">Nome do Cargo</p>
            <p class="mt-2 text-[17px]">{{ role.name }}</p>
        </div>

        <div class="mt-10">
            <h1 class="text-[15px] font-medium text-slate-600">Permissões</h1>
        
            <CheckboxPanel 
                :role="role"
                :selected-permissions="selectedOptions"
                :resources="resources"
                :disabled="true"
            />
        </div>

        <div class="flex">
            <button v-if="role.name !== 'admin'"
                @click="() => router.push(`/roles/edit/${role.name}`)"
                class="mt-5 p-2 px-8 rounded-lg bg-blue-600 text-white text-base font-semibold cursor-pointer transition-all flex justify-center items-center hover:bg-blue-700 active:translate-y-0 disabled:opacity-70 disabled:cursor-not-allowed"
            >
                <span>Editar</span>
            </button>

            <button v-if="role.name !== 'admin'"
                @click="showDeleteModal = true"
                class="mt-5 ml-3 p-2 px-8 rounded-lg bg-red-600 text-white text-base font-semibold cursor-pointer transition-all flex justify-center items-center hover:bg-red-700 active:translate-y-0 disabled:opacity-70 disabled:cursor-not-allowed"
            >
                <span>Excluir</span>
            </button>
        </div>

        <ConfirmModal
            :show="showDeleteModal"
            title="Excluir Cargo"
            :message="`Tem certeza que deseja excluir o cargo '${role.name}'? Esta ação não pode ser desfeita.`"
            :danger="true"
            @confirm="handleDelete"
            @cancel="showDeleteModal = false"
        />
    </TemplatePage>
</template>