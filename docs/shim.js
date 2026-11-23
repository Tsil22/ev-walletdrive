// Γέφυρα: ό,τι στο claude.ai έδινε το claude.use(), εδώ το δίνει η σελίδα ή το κινητό.
// db: μόνο ανάγνωση των τιμών/καιρού (market/*.json) από τον ίδιο φάκελο, που ανανεώνεται κάθε μέρα.
// user: κανένας λογαριασμός, τα δεδομένα μένουν στη συσκευή.
// downloads: στο κινητό (Capacitor) αποθήκευση + κοινοποίηση, στον browser κοινοποίηση ή κατέβασμα αρχείου.
(function(){
  var DATA_URL=""; // κενό = ίδια διεύθυνση με τη σελίδα· στην εφαρμογή Android ορίζεται από το build.py
  function getJSON(u,opt){return fetch(u,opt).then(function(r){return r.ok?r.json():null}).catch(function(){return null})}
  function load(path){
    var local=function(){return getJSON(path+".json")};
    var remote=DATA_URL?getJSON(DATA_URL+path+".json",{cache:"no-store"}):getJSON(path+".json",{cache:"no-store"});
    return remote.then(function(d){return d||local()});
  }
  function snap(d){return {exists:!!d,data:function(){return d}}}
  var db={doc:function(path){return {
    get:function(){return load(path).then(snap)},
    onSnapshot:function(cb){var live=true; load(path).then(function(d){if(live) cb(snap(d))}); return function(){live=false}},
    set:function(){return Promise.resolve()}, update:function(){return Promise.resolve()}
  }}};
  function P(n){return window.Capacitor&&Capacitor.isNativePlatform&&Capacitor.isNativePlatform()&&Capacitor.Plugins&&Capacitor.Plugins[n]}
  function asText(d){return typeof d==="string"?Promise.resolve(d):new Response(d).text()}
  var MIME={json:"application/json",csv:"text/csv",txt:"text/plain",md:"text/markdown",html:"text/html"};
  var downloads={save:function(req){
    var name=String(req.filename||"file.txt").replace(/[\/\\:*?"<>|]+/g,"_"), FS=P("Filesystem"), SH=P("Share");
    var fail=function(e){var m=String(e&&e.message||e); return Promise.reject({code:/cancel|abort/i.test(m)?"declined":"unavailable",message:m})};
    if(FS&&SH) return asText(req.data)
      .then(function(t){return FS.writeFile({path:name,data:t,directory:"CACHE",encoding:"utf8"})})
      .then(function(w){return SH.share({title:name,files:[w.uri]})})
      .then(function(){return {status:"saved"}}).catch(fail);
    return asText(req.data).then(function(t){
      var type=MIME[(name.split(".").pop()||"").toLowerCase()]||"application/octet-stream";
      var file=null; try{file=new File([t],name,{type:type})}catch(e){}
      if(file&&navigator.canShare&&navigator.canShare({files:[file]})) return navigator.share({files:[file],title:name}).then(function(){return {status:"saved"}});
      var a=document.createElement("a"); a.href=URL.createObjectURL(new Blob([t],{type:type})); a.download=name;
      document.body.appendChild(a); a.click(); setTimeout(function(){URL.revokeObjectURL(a.href); a.remove()},1000);
      return {status:"saved"};
    }).catch(fail);
  }};
  window.claude={use:function(n){return Promise.resolve(n==="db"?db:n==="downloads"?downloads:null)}};
  // εφαρμογή ιστού: δουλεύει και χωρίς σύνδεση
  if("serviceWorker" in navigator&&location.protocol==="https:"&&!(window.Capacitor&&Capacitor.isNativePlatform&&Capacitor.isNativePlatform()))
    window.addEventListener("load",function(){navigator.serviceWorker.register("sw.js").catch(function(){})});
})();
