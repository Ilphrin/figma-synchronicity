# figma-synchronicity
A JS library to synchronize your prototypes from Figma to your web application

## Usage

Put your Figma Token to use the API in the config.js file like this:

```
export default {
  "token": "my-token-for-the-api-123456" 
}
```

Then you can use the Synchronicity object to synchronize each DOMElement to Figma Element like this code do for:

_example.js_
```
import newSynchronicity from './index.js';
const synchro = newSynchronicity('ePSiPQLnP2qH7X5hgxAJlEjE');

document.addEventListener('FigmaSynchronicityEnabled', function() {
  synchro.startWith(document.querySelector('#Synchronicity'), 'MyFrame');
});
```

_index.html_
```
<!DOCTYPE html>
<html>
  <head>
    <title>Figma Synchronicity</title>
    <meta charset="utf-8" />
  </head>

  <body>
    <div id="Synchronicity">
    </div>
  </body>
  <script src="./example.js" type="module"></script>
</html>
```
