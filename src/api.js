const API_KEY = "b858c2a9bd5c32a72b75aee802ac525c81d006fd192c165bb194653bdb1e258b"

const tickersHandlers = new Map()
const socket = new WebSocket(`wss://streamer.cryptocompare.com/v2?api_key=${API_KEY}`)

const AGGREGATE_INDEX = '5'

socket.addEventListener('message', e =>{
  const {TYPE: type, FROMSYMBOL: currency, PRICE: newPrice} = JSON.parse(e.data)
  if(type !== AGGREGATE_INDEX || newPrice === undefined) {
    return
  }
  const handlers = tickersHandlers.get(currency) ?? []
  handlers.forEach(fn => fn(newPrice))
})
const sendToWS = (message) => {
  const stringifiedMessage = JSON.stringify(message)
  if(socket.readyState === WebSocket.OPEN) {
    socket.send(stringifiedMessage)
    return
  }
  socket.addEventListener('open', () =>{
    socket.send(stringifiedMessage)
  }, {once: true}
  )
}
const changeWsStatus = (type, from, to = 'USD') =>{
  sendToWS({
    "action": type,
    "subs": [`5~CCCAGG~${from}~${to}`]
  })
}

const subscribeToTickerOnWS = (ticker) =>{
  changeWsStatus("SubAdd", ticker)
}
const unsubscribeFromTickerOnWS = (ticker) =>{
  changeWsStatus("SubRemove", ticker)
}

export const subscribeToTicker = (ticker, cb) => {
  const subscribers = tickersHandlers.get(ticker) || [];
  tickersHandlers.set(ticker, [...subscribers, cb])
  subscribeToTickerOnWS(ticker);
}

export const unsubscribeFromTicker = ticker => {
  tickersHandlers.delete(ticker)
  unsubscribeFromTickerOnWS(ticker)
}

export const loadCoinList = async () =>{
  const url = new URL('https://min-api.cryptocompare.com/data/all/coinlist?summary=true')
  const {Data: resultCoins} = await fetch(url).then(r => r.json());
  const coinList = Object.values(resultCoins).map((coin) => {
    return {
      name: coin.Symbol.toUpperCase(),
    };
  });
  return coinList
}

window.onbeforeunload = function() {
  socket.close();
};

window.tickersHandlers = tickersHandlers

// const loadTickers = async () =>{
  //   if(tickersHandlers.size === 0){
  //     return
  //   }
  
  //   const url = new URL(`https://min-api.cryptocompare.com/data/pricemulti`);
  //   const params = new URLSearchParams({
  //     fsyms: [...tickersHandlers.keys()],
  //     tsyms: "USD",
  //     api_key: API_KEY
  //   })
  //   url.search = params
  //   const updatedPrices = await fetch(url).then(r => r.json())
  
  //   Object.entries(updatedPrices).forEach(([curr, newPrice]) =>{
  //     const handlers = tickersHandlers.get(curr) ?? []
  //     handlers.forEach(fn => fn(newPrice))
  //   })
  // }