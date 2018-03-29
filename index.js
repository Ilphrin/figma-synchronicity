import config from  './config.js';
import Synchronicity from './Synchronicity.js';


export default function newSynchronicity(fileName, configFile = config) {
  return new Synchronicity(fileName, configFile);
}
