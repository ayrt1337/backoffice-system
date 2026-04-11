<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { api } from '../../services/api';
import TemplatePage from '../../components/template-page.vue';
import { resources } from '../../config/resources';
import router from '../../router';
import Breadcrumbs from '../../components/breadcrumbs.vue';
import ConfirmModal from '../../components/confirm-modal.vue';

const metadata = resources.users;

interface Props {
    name: string
};

const props = defineProps<Props>();

const user = ref<any>({});
const showDeleteModal = ref<boolean>(false);

onMounted(async () => {
    try {
        const response = await api({
            url: `/users/${props.name}`,
            method: 'get',
        });

        if (response.status === 200) {
            user.value = response.data.user;
        }
        else {
            // SHOW ERROR
        }
    } catch (error) {
        console.error("Erro em buscar usuário: ", error);
    }
});

const handleDelete = async () => {
    try {
        const response = await api({
            url: '/users/delete',
            method: 'delete',
            data: { name: props.name }
        });

        if (response.status === 200) {
            // SHOW SUCESSO
        }
        else {
            // SHOW ERROR   
        }
    } catch (error) {
        console.error("Erro em excluir usuário: ", error);
    }
};
</script>

<template>
    <TemplatePage>
        <Breadcrumbs
            class="mt-2"
            :breadcrumbs="[...metadata.breadcrumbs, { label: `${user.name}` }]"
        />

        <div class="mt-15">
            <p class="text-[15px] font-medium text-slate-600">Usuário</p>
            <p class="mt-2 text-[17px]">{{ user.name }}</p>
        </div>

        <div class="mt-10">
            <p class="text-[15px] font-medium text-slate-600">Nome do Cargo</p>
            <p class="mt-2 text-[17px]">{{ user.role?.name }}</p>
        </div>

        <div v-if="user.role?.name !== 'admin'"" class="flex mt-10">
            <button
                @click="() => router.push(`/users/edit/${user.name}`)"
                class="mt-5 p-2 px-8 rounded-lg bg-blue-600 text-white text-base font-semibold cursor-pointer transition-all flex justify-center items-center hover:bg-blue-700 active:translate-y-0 disabled:opacity-70 disabled:cursor-not-allowed"
            >
                <span>Editar</span>
            </button>

            <button
                @click="showDeleteModal = true"
                class="mt-5 ml-3 p-2 px-8 rounded-lg bg-red-600 text-white text-base font-semibold cursor-pointer transition-all flex justify-center items-center hover:bg-red-700 active:translate-y-0 disabled:opacity-70 disabled:cursor-not-allowed"
            >
                <span>Excluir</span>
            </button>
        </div>

        <ConfirmModal
            :show="showDeleteModal"
            title="Excluir Cargo"
            :message="`Tem certeza que deseja excluir o usuário '${user.name}'? Esta ação não pode ser desfeita.`"
            :danger="true"
            @confirm="handleDelete"
            @cancel="showDeleteModal = false"
        />
    </TemplatePage>
</template>