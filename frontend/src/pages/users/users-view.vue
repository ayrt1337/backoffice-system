<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { api } from '../../services/api';
import TemplatePage from '../../components/template-page.vue';
import { resources } from '../../config/resources';
import router from '../../router';
import Breadcrumbs from '../../components/breadcrumbs.vue';
import ConfirmModal from '../../components/confirm-modal.vue';
import type { UserMetadata, User } from '../../types/user';
import { verifyApiError } from '../../services/verifyApiError';
import { useToast } from '../../composables/useToast';

const metadata = resources.users;
const { showToast } = useToast();

interface Props {
    name: string
};

const props = defineProps<Props>();

const userData = ref<Partial<UserMetadata>>({
    name: '',
    role: ''
});

const user = ref<User>({
    name: ''
});

const showDeleteModal = ref<boolean>(false);
const loadingBtn = ref<boolean>(false);

onMounted(async () => {
    try {
        const response = await api({
            url: `/users/${props.name}`,
            method: 'get',
        });

        userData.value = {
            name: response.data.userData.name,
            role: response.data.userData.role.name
        };
    } catch (error: any) {
        console.error("Erro em buscar usuário: ", error);
        verifyApiError(error.response.status);
    } finally {
        // showLoading(false);
    }
});

const handleDelete = async () => {
    loadingBtn.value = !loadingBtn.value;
    try {
        await api({
            url: '/users/delete',
            method: 'delete',
            data: { name: props.name }
        });

        showToast("Usuário excluído com sucesso!", "success");
        router.push("/users");
    } catch (error) {
        console.error("Erro em excluir usuário: ", error);
        showToast("Ops! Algo deu errado.", "error");
    } finally {
        loadingBtn.value = !loadingBtn.value;
    }
};
</script>

<template>
    <TemplatePage :name="user.name">
        <Breadcrumbs
            class="mt-2"
            :breadcrumbs="[...metadata.breadcrumbs, { label: `${userData.name}` }]"
        />

        <div class="mt-15">
            <p class="text-[15px] font-medium text-slate-600">Usuário</p>
            <p class="mt-2 text-[17px]">{{ userData.name }}</p>
        </div>

        <div class="mt-10">
            <p class="text-[15px] font-medium text-slate-600">Nome do Cargo</p>
            <p class="mt-2 text-[17px]">{{ userData.role }}</p>
        </div>

        <div v-if="userData.role !== 'admin'"" class="flex mt-10">
            <button
                @click="() => router.push(`/users/edit/${userData.name}`)"
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
            :message="`Tem certeza que deseja excluir o usuário '${userData.name}'? Esta ação não pode ser desfeita.`"
            :danger="true"
            @confirm="handleDelete"
            @cancel="showDeleteModal = false"
        />
    </TemplatePage>
</template>