const HistoryEvent = require('./HistoryEvent');

const STORAGE_KEY = 'burner-history';

class History {
  constructor({ storeHistory=true, assets=[] }={}) {
    this.events = [];
    this.assets = assets;
    this.eventListeners = [];
    this.storeHistory = storeHistory;
    if (storeHistory) {
      this.readStoredEvents();
    }
  }

  onEvent(callback) {
    this.eventListeners.push(callback);
  }

  removeListener(callback) {
    this.eventListeners.splice(this.eventListeners.indexOf(callback), 1);
  }

  addEvent(event) {
    this.events.push(event);
    this.eventListeners.forEach(callback => callback(event));
    this.storeEvents();
  }

  getEvents(options={}) {
    let assets;
    if (options.assets) {
      assets = options.assets;
    } else if (options.asset) {
      assets = [options.asset];
    }

    const filter = event => {
      const assetMatch = !assets || assets.indexOf(event.asset) !== -1;
      const typeMatch = !options.type || event.type === options.type;
      const accountMatch = !options.account
        || options.account.toLowerCase() === event.to.toLowerCase()
        || options.account.toLowerCase() === event.from.toLowerCase();

      return assetMatch && typeMatch && accountMatch;
    }

    return this.events.filter(filter).sort((e1, e2) => e2.timestamp - e1.timestamp);
  }

  storeEvents() {
    if (this.storeHistory) {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(this.events));
    }
  }

  readStoredEvents() {
    if (window.localStorage.getItem(STORAGE_KEY)) {
      const storedEventObjs = JSON.parse(window.localStorage.getItem(STORAGE_KEY));
      this.events = [
        ...this.events,
        ...storedEventObjs.map(event => new HistoryEvent(event, this.assets)),
      ];
    }
  }
}

module.exports = History;
