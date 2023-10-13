import { Uri, WebviewPanel } from 'vscode'
import { Documentation } from '../association.manager'

export function createBpmnWebview(panel: WebviewPanel, file: Documentation) {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
</head>
<body>
<div id="canvas" style="width: 100vw; height: 100vh;"></div>
    <script src="${panel.webview.asWebviewUri(
      Uri.file(require.resolve('bpmn-js/dist/bpmn-viewer.production.min.js'))
    )}"></script>
    
    <script>
        const viewer = new window.BpmnJS({ container: '#canvas' });
        viewer.on('import.done', function(event) {   
            const canvas = viewer.get('canvas');
            canvas.zoom('fit-viewport', { position: 'left' });
        });
        viewer.importXML(${JSON.stringify(file.content)});
    </script>
</body>
</html>
`
}
