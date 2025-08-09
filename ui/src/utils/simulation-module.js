export const returnTimeDivider = date => {
  let timeDivider = 0;
  const offsetMs = date.getTimezoneOffset() * 60 * 1000;
  const msLocal = date.getTime() - offsetMs;
  const timeMode = (msLocal / 1000) % 86400;
  if (timeMode < 32400) {
    timeDivider = 0;
  } else {
    if (timeMode > 55800) {
      timeDivider = 100;
    } else {
      timeDivider = Math.floor((timeMode - 32400) / 234);
    }
  }
  return timeDivider;
};

export const prepareMarketData = (simulationData, selectedInstrument, timeDivider) => {
  if (!simulationData || !selectedInstrument) return [];
  
  let marketData = [];
  for (let jt in simulationData) {
    if (simulationData[jt].instrument_token === selectedInstrument.instrument_token) {
      let data = simulationData[jt].data;
      if (!data || data.length === 0) return [];
      
      // Calculate the index based on timeDivider (0-100)
      let targetIndex = Math.floor((data.length * timeDivider) / 100);
      targetIndex = Math.min(targetIndex, data.length - 1);
      targetIndex = Math.max(targetIndex, 0);
      
      // Return data up to the target index
      return data.slice(0, targetIndex + 1);
    }
  }
  return marketData;
};

export const toKiteDateFormat = date => {
  const offsetMs = date.getTimezoneOffset() * 60 * 1000;
  const msLocal = date.getTime() - offsetMs;
  const dateLocal = new Date(msLocal);
  const iso = dateLocal.toISOString();
  const isoLocal = iso.slice(0, 19);
  return isoLocal.replace("T", " ");
};

export const getWeekDay = date => {
  const day = date.getDay();
  const weekDays = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  return weekDays[day];
};