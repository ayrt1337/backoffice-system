<script setup lang="ts">
import router from '../router';


</script>

<template>
    <div class="fixed border-r-2 max-w-[300px] w-full min-h-screen left-0">
        <div @click="router.push('/users')" class="cursor-pointer">
            <p>Usuários</p>
        </div>

        <div @click="router.push('/roles')" class="cursor-pointer">
            <p>Cargos</p>
        </div>
    </div>
</template>