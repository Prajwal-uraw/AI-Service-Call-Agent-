// alertstream-cdn.js - Universal Integration Snippet
(function(w, d, s, u, id) {
  w.AlertStream = w.AlertStream || function() {
    (w.AlertStream.q = w.AlertStream.q || []).push(arguments);
  };
  w.AlertStream.l = 1 * new Date();
  
  var js = d.createElement(s);
  var fs = d.getElementsByTagName(s)[0];
  
  js.id = id;
  js.src = u;
  js.async = 1;
  
  fs.parentNode.insertBefore(js, fs);
})(window, document, 'script', 'https://cdn.alertstream.com/alertstream.min.js', 'alertstream-js');

// Auto-initialize with global config if present
if (window.alertstreamConfig) {
  window.AlertStream('init', window.alertstreamConfig);
}
