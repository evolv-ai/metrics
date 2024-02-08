import { trackExecuted } from "./track";

//Don't fire the same event more than once during EventInterval ms.
let eventTimestamp = {};
const EventInterval = 500;

export function emitEvent(tag, metric, context){
  var lastTime = eventTimestamp[tag];
  var newTimeStamp = new Date().getTime();

  // console.info()
  if (lastTime && (lastTime > newTimeStamp-EventInterval)) return;
  
  evolv.client.emit(tag);
  trackExecuted({tag, event: metric, context});
  eventTimestamp[tag] = newTimeStamp;
}
