<template>
  <body>
    <div class="container mx-auto flex flex-col items-center bg-gray-100 p-4">
      <loading-circle v-if="loading" />
      <div v-else class="container w-full">
        <section @keypress.enter="addTicker(ticker)">
          <div class="flex">
            <div class="max-w-xs">
              <the-input
                v-model="ticker"
                placeholder="Например DOGE"
                id="ticker"
                :label="'Тикер'"
              />
              <search-coins
                :ticker="ticker"
                @isCoins="(val) => (isCoins = val)"
                @addTicker="(name) => addTicker(name)"
              />
              <div v-if="err" class="text-sm text-red-600">{{ err }}</div>
            </div>
          </div>
          <the-btn class="my-4" @click="addTicker(ticker)">
            <plusSvg /> Добавить
          </the-btn>
        </section>
        <hr class="w-full border-t border-gray-600 my-4" />
        <div class="flex gap-2">
          <the-btn class="my-1" @click="page--" :isShow="!hasPrevPage">
            Назад
          </the-btn>
          <the-btn class="my-1" @click="page++" :isShow="!hasNextPage">
            Вперед
          </the-btn>
          <the-input v-model="filter" placeholder="Фильтр" id="filter" />
        </div>
        <template v-if="tickers.length">
          <hr class="w-full border-t border-gray-600 my-4" />
          <dl class="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-3">
            <the-ticker
              v-for="t in paginatedTickers"
              @click="selectTicker(t)"
              :key="t"
              :class="{
                'border-purple-800 border-solid border-4': selectedTicker === t,
              }"
              :ticker="t"
              @deleteTicker="(ticker) => deleteTicker(ticker)"
            />
          </dl>
          <hr class="w-full border-t border-gray-600 my-4" />
        </template>
        <the-graph
          v-if="selectedTicker.name"
          :selectedTicker="selectedTicker"
          @clearTicker="selectTicker()"
        />
      </div>
    </div>
  </body>
</template>

<script>
import { computed, onMounted, ref, reactive, watch } from "vue";
import { subscribeToTicker, unsubscribeFromTicker } from "./api";

import loadingCircle from "./components/loadingCircle.vue";
import searchCoins from "./components/searchCoins.vue";
import theBtn from "./components/theBtn.vue";
import plusSvg from "./components/plusSvg.vue";
import theInput from "./components/theInput.vue";
import theGraph from "./components/theGraph.vue";
import theTicker from "./components/theTicker.vue";

import { checkContain, checkValidation } from "./validation";
import { filteringList, slicingTickers } from "./use/format";

export default {
  name: "App",
  components: {
    loadingCircle,
    searchCoins,
    theBtn,
    plusSvg,
    theInput,
    theGraph,
    theTicker,
  },
  setup() {
    const ticker = ref("");
    const tickers = ref([]);
    const selectedTicker = ref({});
    const loading = ref(true);
    const err = ref("");
    const page = ref(1);
    const filter = ref("");
    const isCoins = ref(false);

    onMounted(() => {
      loading.value = true;
      const tickersData = localStorage.getItem("crypronomicon-list");
      if (tickersData) {
        tickers.value = JSON.parse(tickersData);
        tickers.value.forEach((ticker) => {
          subscribeToTicker(ticker.name, (newPrice) => {
            if (newPrice) updateTicker(ticker.name, newPrice);
          });
        });
      }
      loading.value = false;
    });

    watch(ticker, (updatedTicker) => {
      ticker.value = updatedTicker.toUpperCase();
      err.value = checkContain(updatedTicker, tickers.value);
    });
    watch(
      tickers,
      (newTickers) => {
        localStorage.setItem("crypronomicon-list", JSON.stringify(newTickers));
      },
      { deep: true }
    );
    const pageStateOptions = computed(() => {
      return {
        page: page.value,
        filter: filter.value,
      };
    });

    watch(filter, (newFilter) => {
      filter.value = newFilter.toUpperCase();
      page.value = 1;
    });
    watch(pageStateOptions, (value) => {
      window.history.pushState(
        null,
        document.title,
        `${window.location.pathname}?filter=${value.filter}&page=${value.page}`
      );
    });
    const startIndex = computed(() => (page.value - 1) * 6);
    const endIndex = computed(() => page.value * 6);

    const filteredTickers = computed(() =>
      filteringList(tickers.value, filter.value)
    );
    const paginatedTickers = computed(() =>
      slicingTickers(filteredTickers.value, startIndex.value, endIndex.value)
    );

    const hasPrevPage = computed(() => (startIndex.value < 2 ? false : true));
    const hasNextPage = computed(() =>
      filteredTickers.value.length > endIndex.value ? true : false
    );

    const updateTicker = (tickerName, price) => {
      tickers.value
        .filter((t) => t.name === tickerName)
        .forEach((elem) => (elem.usd = price));
    };

    const addTicker = (name) => {
      const currentTicker = reactive({
        name,
        usd: "-",
      });
      const error = checkValidation(name, tickers.value, isCoins.value);
      filter.value = "";

      if (error) {
        err.value = error;
        return;
      }
      tickers.value.push(currentTicker);
      ticker.value = "";
      subscribeToTicker(currentTicker.name, (newPrice) =>
        updateTicker(currentTicker.name, newPrice)
      );
    };

    const selectTicker = (t = {}) => {
      selectedTicker.value = t;
    };

    const deleteTicker = (tickerToRemove) => {
      tickers.value = tickers.value.filter((w) => tickerToRemove !== w);
      if (selectedTicker.value === tickerToRemove) {
        selectedTicker.value = null;
      }
      unsubscribeFromTicker(tickerToRemove.name);
    };

    watch(paginatedTickers, (newPaginatedtickers) => {
      if (newPaginatedtickers.length === 0 && page.value > 1) {
        page.value -= 1;
      }
    });
    return {
      loading,
      ticker,
      tickers,
      selectedTicker,
      addTicker,
      selectTicker,
      deleteTicker,
      err,
      page,
      filter,
      filteredTickers,
      paginatedTickers,
      hasNextPage,
      hasPrevPage,
      isCoins,
    };
  },
};
</script>

<style></style>
