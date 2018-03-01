const lib = require('../lib/common');
const abi = require('../abi/tub.json').abi;
export const tub = new lib.web3.eth.Contract(abi, lib.addresses.tub);

const syncNewCups = (from, to) => {
  tub.getPastEvents('LogNewCup', { fromBlock: from, toBlock: to })
  .then(logs => logs.forEach(log => write(log) ))
  .catch(e => console.log(e));
}

const syncNotes = (from, to) => {
  let options = {
    fromBlock: from,
    toBlock: to,
    filter: {sig: lib.acts.sigs}
  }
  tub.getPastEvents('LogNote', options)
  .then(logs => logs.forEach(log => update(log) ))
  .catch(e => console.log(e));
}

export const write = (log) => {
  let data = {
    id: lib.web3.utils.hexToNumber(log.returnValues.cup),
    lad: log.returnValues.lad,
    ink: 0,
    art: 0,
    ire: 0,
    act: 'open',
    arg: null,
    block: log.blockNumber,
    tx: log.transactionHash
  }
  insertCup(data);
}

export const update = (log) => {
  tub.methods.cups(log.returnValues.foo).call({}, log.blockNumber).then(cup => {
    let data = {
      id: lib.web3.utils.hexToNumber(log.returnValues.foo),
      lad: cup.lad,
      ink: lib.u.wad(cup.ink),
      art: lib.u.wad(cup.art),
      ire: lib.u.wad(cup.irk),
      act: lib.acts.acts[log.returnValues.sig],
      arg: lib.u.arg(log.returnValues.bar),
      block: log.blockNumber,
      tx: log.transactionHash
    }
    insertCup(data);
  });
}

export const insertCup = (cup) => {
  lib.db.none(lib.sql.insertCup, { cup: cup })
  .then(() => console.log(cup))
  .catch(e => console.log(e));
}

const syncRange = (earliest, latest) => {
  let step = 2000;
  while(latest > earliest) {
    let from = latest-step;
    console.log("SyncRange:",earliest,"-",latest);
    syncNewCups(from, latest);
    syncNotes(from, latest);
    latest = from;
  }
}

syncRange(process.env.FROM_BLOCK, process.env.TO_BLOCK)