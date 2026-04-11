<script setup lang="ts">
import router from '../router';
import type { Breadcrumb } from '../types/resource';

interface Props {
    breadcrumbs: Breadcrumb[]
};

const props = defineProps<Props>();
</script>

<template>
    <nav class="flex items-center font-medium text-slate-600 mb-6 space-x-2">
        <template v-for="(crumb, index) in breadcrumbs" :key="index">
            <span 
                :class="crumb.path ? 'cursor-pointer' : ''"
                @click="crumb.path ? router.push(crumb.path) : null"
            >
                {{ crumb.label }}
            </span>
            <span v-if="index < breadcrumbs.length - 1">/</span>
        </template>
    </nav>
</template>