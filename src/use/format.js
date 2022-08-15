export const filteringList = (list, name) =>
      list.filter((val) => val.name.includes(name));

export const slicingTickers = (tickers, start, end) => tickers.slice(start, end);