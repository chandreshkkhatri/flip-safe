import alert from '../assets/alert_signal.mp3'

export const toKiteDateFormat = date => {
    const offsetMs = date.getTimezoneOffset() * 60 * 1000;
    const msLocal = date.getTime() - offsetMs;
    const dateLocal = new Date(msLocal);
    const iso = dateLocal.toISOString();
    const isoLocal = iso.slice(0, 19);
    return isoLocal.replace("T", " ");
};

export const fieldColor = (field, enableColors) => {
    let color
    const sign = Math.sign(field)
    if (sign === 1) {
        color = 'green-text'
    }
    if (sign === -1) {
        color = 'red-text'
    }
    if (sign === 0) {
        color = 'black-text'
    }
    if (!enableColors) {
        color = 'black-text'
    }
    return color
}

export const max = (arr) => {
    if (!arr) {
        arr = []
    }
    let max = 0
    for (let it in arr) {
        if ((arr[it]) && (arr[it] > max)) {//(arr[it]) &&
            max = arr[it]
        }
    }
    return max
}
export const min = (arr) => {
    let min = Infinity
    if (!arr) {
        arr = []
        min = 0
    }
    for (let it in arr) {
        if ((arr[it]) && (arr[it] < min)) {
            min = arr[it]
        }
    }
    return min
}

export const playAlert = () => {
    let audio = new Audio(alert)
    audio.play()
    console.log('playing', audio)
}

export const dateStampToDate = (dateStamp) => {
    return (new Date(dateStamp)).toISOString().substr(0, 19).replace("T", " ");
}

export const addTicksToInstrument = (instrument, marketData) => {
    if (instrument) {
        for (let it in marketData) {
            if (marketData[it].instrument_token === instrument.instrument_token) {
                for (let jt in marketData[it]) {
                    instrument[jt] = marketData[it][jt]
                }
            }
        }
    }
    return instrument
}