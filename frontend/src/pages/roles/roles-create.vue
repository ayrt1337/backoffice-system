<script setup lang="ts">
import { onMounted, ref } from 'vue';
import TemplatePage from '../../components/template-page.vue';
import { api } from '../../services/api';

const name = ref<string>();
const password = ref<string>();
const roles = ref<any>();
const roleName = ref<string>();

// DA PRA SUBSTITUIR POR UMA CHAMADA DE AUTENTICAÇÃO

// onMounted(async () => {
//     try {
//         const response = await api({
//             url: "/roles",
//             method: "get",
//         });
        
//         if (response.status === 200) {
//             roles.value = response.data.roles;
//         }
//         else {
//             // SHOW ERROR
//         }
//     } catch (error) {
//         console.error("Erro ao buscar cargos:", error);
//     }
// })

const handleCreate = async () => {
    try {
        const response = await api({
            url: "/roles",
            method: "post",
            data: {
                name: name.value,
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
    <TemplatePage>
        <div class="flex flex-col">
            <label for="name">Nome</label>
            <input v-model="name" class="border" type="text" name="name" id="name">
        </div>

        <div class="flex flex-col mt-4">
            <input @click="handleCreate()" class="border cursor-pointer" type="submit" value="Criar">
        </div>
    </TemplatePage>
</template>