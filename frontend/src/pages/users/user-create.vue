<script setup lang="ts">
import { onMounted, ref } from 'vue';
import TemplatePage from '../../components/template-page.vue';
import { api } from '../../services/api';

const name = ref<string>();
const password = ref<string>();
const roles = ref<any>();
const roleName = ref<string>();

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
        console.log(roles.value)
        const response = await api({
            url: "/users",
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
        <div class="flex flex-col">
            <label for="name">Usuário</label>
            <input v-model="name" class="border" type="text" name="name" id="name">
        </div>

        <div class="flex flex-col">
            <label for="password">Senha</label>
            <input v-model="password" class="border" type="password" name="password" id="password">
        </div>

        <div class="flex flex-col">
            <label for="roles">Cargo</label>
            <select v-model="roleName" name="roles" id="roles" class="border">
                <option v-for="role in roles" :value="role.name">{{ role.name }}</option>
            </select>
        </div>

        <div class="flex flex-col mt-4">
            <input @click="handleCreate()" class="border cursor-pointer" type="submit" value="Criar">
        </div>
    </TemplatePage>
</template>