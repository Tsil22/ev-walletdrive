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
  var MIME={json:"application/json",csv:"text/csv",txt:"text/plain",md:"text/markdown",html:"text/html",pdf:"application/pdf"};
  function isText(n){return /\.(json|csv|txt|md|html|svg)$/i.test(n)}
  function asBlob(d,type){return d instanceof Blob?d:new Blob([d],{type:type})}
  function b64(blob){return new Promise(function(ok,no){var r=new FileReader(); r.onload=function(){ok(String(r.result).split(",")[1])}; r.onerror=no; r.readAsDataURL(blob)})}
  var downloads={save:function(req){
    var name=String(req.filename||"file.txt").replace(/[\/\\:*?"<>|]+/g,"_"), FS=P("Filesystem"), SH=P("Share");
    var type=MIME[(name.split(".").pop()||"").toLowerCase()]||"application/octet-stream", text=isText(name)||typeof req.data==="string";
    var fail=function(e){var m=String(e&&e.message||e); return Promise.reject({code:/cancel|abort/i.test(m)?"declined":"unavailable",message:m})};
    if(FS&&SH) return (text?asText(req.data).then(function(t){return FS.writeFile({path:name,data:t,directory:"CACHE",encoding:"utf8"})})
        :b64(asBlob(req.data,type)).then(function(d){return FS.writeFile({path:name,data:d,directory:"CACHE"})}))
      .then(function(w){return SH.share({title:name,files:[w.uri]})})
      .then(function(){return {status:"saved"}}).catch(fail);
    var blob=asBlob(req.data,type);
    return Promise.resolve().then(function(){
      var file=null; try{file=new File([blob],name,{type:type})}catch(e){}
      if(file&&navigator.canShare&&navigator.canShare({files:[file]})) return navigator.share({files:[file],title:name}).then(function(){return {status:"saved"}});
      var a=document.createElement("a"); a.href=URL.createObjectURL(blob); a.download=name;
      document.body.appendChild(a); a.click(); setTimeout(function(){URL.revokeObjectURL(a.href); a.remove()},1000);
      return {status:"saved"};
    }).catch(fail);
  }};
  // notify: τοπικές ειδοποιήσεις στο κινητό (μόνο στην εφαρμογή Android/iOS)· sync() αντικαθιστά όλες τις προγραμματισμένες
  var LN=P("LocalNotifications"), notify=LN?{
    sync:function(items){
      return LN.checkPermissions().then(function(p){
        if(p.display==="granted") return p; if(!items.length||p.display==="denied") return p; return LN.requestPermissions();
      }).then(function(p){
        return LN.getPending().then(function(r){var n=(r&&r.notifications)||[]; return n.length?LN.cancel({notifications:n.map(function(x){return {id:x.id}})}):null})
          .then(function(){
            if(p.display!=="granted"||!items.length) return {granted:p.display==="granted",n:0};
            return LN.schedule({notifications:items.map(function(x){return {id:x.id,title:x.title,body:x.body,schedule:{at:new Date(x.at),allowWhileIdle:true}}})})
              .then(function(){return {granted:true,n:items.length}});
          });
      });
    }
  }:null;
  window.claude={use:function(n){return Promise.resolve(n==="db"?db:n==="downloads"?downloads:n==="notify"?notify:null)}};
  // εφαρμογή ιστού: δουλεύει και χωρίς σύνδεση
  if("serviceWorker" in navigator&&location.protocol==="https:"&&!(window.Capacitor&&Capacitor.isNativePlatform&&Capacitor.isNativePlatform()))
    window.addEventListener("load",function(){navigator.serviceWorker.register("sw.js").catch(function(){})});
})();
