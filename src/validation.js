const errors = {
  exsist: "Такой тикер уже добавлен",
  contain: "Такого тикера не сущетсвует"
}

export const checkValidation = (name, tickers, length) => checkContain(name, tickers) || checkExsist(length);

export const checkContain = (name, tickers) => {
  if (tickers.map((tick) => tick.name === name).includes(true)) {
    return errors.exsist;
  } else {
    return "";
  }
};
const checkExsist = (length) => {
  if (!length) {
    return errors.contain;
  } else {
    return "";
  }
};