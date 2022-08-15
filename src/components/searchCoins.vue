<template>
  <div v-if="!!ticker" class="flex bg-white shadow-md p-1 rounded-md flex-wrap">
    <span
      v-for="(c, idx) in searchedCoins"
      :key="idx"
      @click="$emit('addTicker', c.name)"
      class="
        inline-flex
        items-center
        px-2
        m-1
        rounded-md
        text-xs
        font-medium
        bg-gray-300
        text-gray-800
        cursor-pointer
      "
    >
      {{ c.name }}
    </span>
  </div>
</template>

<script>
import { ref, onMounted, watch, computed } from "vue";
import { loadCoinList } from "../api";
import { filteringList, slicingTickers } from "../use/format";

export default {
  props: {
    ticker: {
      type: String,
      required: true,
    },
  },
  emits: ["addTicker", "isCoins"],
  setup(props, { emit }) {
    const coinList = ref([]);
    const searchedCoins = ref([]);

    const propTicker = computed(() => ref(props.ticker));

    onMounted(async () => {
      coinList.value = await loadCoinList();
    });

    watch(propTicker, (val) => {
      searchedCoins.value = filteringList(coinList.value, val.value);
      if (searchedCoins.value.length > 3) {
        searchedCoins.value = slicingTickers(searchedCoins.value, 0, 3);
      }
      emit("isCoins", !!searchedCoins.value.length);
    });

    return { searchedCoins };
  },
};
</script>

<style lang="scss" scoped>
</style>
