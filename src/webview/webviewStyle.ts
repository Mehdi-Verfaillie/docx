export default `
  html {
    overflow-y: scroll;
    -webkit-text-size-adjust: 100%;
    -ms-text-size-adjust: 100%;
  }
  
  body {
    overflow: hidden;
    font-family: "Helvetica Neue", Helvetica, "Segoe UI", Arial, freesans, sans-serif;
    font-size: 16px;
    line-height: 1.6;
    word-wrap: break-word;
    margin: auto;
    background: #000;
  }
  
  a {
    color: #4183c4;
    text-decoration: none;
  }
  
  a:hover, a:active {
    outline: 0;
    text-decoration: underline;
  }
  
  a:focus {
    outline: thin dotted;
  }
  
  ::-moz-selection {
    background: rgba(255,255,0,0.3);
    color: #000;
  }
  
  ::selection {
    background: rgba(255,255,0,0.3);
    color: #000;
  }
  
  a::-moz-selection {
    background: rgba(255,255,0,0.3);
    color: #0645ad;
  }
  
  a::selection {
    background: rgba(255,255,0,0.3);
    color: #0645ad;
  }
  
  p {
    margin: 1em 0;
  }
  
  img {
    max-width: 100%;
  }
  
  h1, h2, h3, h4, h5, h6 {
    position: relative;
    margin-top: 1em;
    margin-bottom: 16px;
    font-weight: bold;
    line-height: 1.4;
  }
  
  h1 {
    padding-bottom: 0.3em;
    font-size: 2.25em;
    line-height: 1.2;
    border-bottom: 1px solid #eee;
  }
  
  h2 {
    padding-bottom: 0.3em;
    font-size: 1.75em;
    line-height: 1.225;
    border-bottom: 1px solid #eee;
  }
  
  h3 {
    font-size: 1.5em;
    line-height: 1.43;
  }
  
  h4 {
    font-size: 1.25em;
  }
  
  h5 {
    font-size: 1em;
  }
  
  h6 {
    font-size: 1em;
    color: #777;
  }
  
  p, blockquote, ul, ol, dl, table, pre {
    margin-top: 0;
    margin-bottom: 16px;
  }
  
  blockquote {
    padding: 0 15px;
    color: #777;
    border-left: 4px solid #ddd;
  }
  
  hr {
    height: 4px;
    padding: 0;
    margin: 16px 0;
    background-color: #e7e7e7;
    border: 0 none;
  }
  
  pre,
  code,
  kbd,
  samp {
    color: #fff;
    font-family: Consolas, "Source Code Pro", monospace;
    font-size: .90em;
  }
  
  code {
    display: inline-block;
    padding: 1px;
    line-height: 1.3;
    max-width: 100%;
    overflow: auto;
    vertical-align: middle;
    background-color: #000;
    color: rgb(250, 202, 21);
  }
  
  pre > code {
    display: block;
    margin: 10px 0;
    padding: 5px 10px;
    line-height: 1.5;
    white-space: pre;
    white-space: pre-wrap;
    word-wrap: break-word;
  }
  
  b,
  strong {
    font-weight: 700;
  }
  
  dfn {
    font-style: italic;
  }
  
  ins {
    background: #ff9;
    color: #000;
    text-decoration: none;
  }
  
  mark {
    background: #ff0;
    color: #fff;
    font-style: italic;
    font-weight: 700;
  }
  
  sub,sup {
    font-size: 75%;
    line-height: 0;
    position: relative;
    vertical-align: baseline;
  }
  
  sup {
    top: -.5em;
  }
  
  sub {
    bottom: -.25em;
  }
  
  ul, ol {
    margin: 1em 0;
    padding: 0 0 0 2em;
  }
  
  li p:last-child {
    margin: 0;
  }
  
  dd {
    margin: 0 0 0 2em;
  }
  
  img {
    border: 0;
    -ms-interpolation-mode: bicubic;
    vertical-align: middle;
  }
  
  table {
    border-collapse: collapse;
    border-spacing: 0;
  }
  
  td {
    vertical-align: top;
  }
`
