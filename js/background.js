//This file mostly sets the number in the icon. Initial replication should happen here.
var db = null;
var configdoc = "_local/config";
var database = "sherrif";
var config = null;
var newcount = null;
var friends = '';
var html = '';
var replication = null;
//TODO: This needs to be in configdoc.url
var remoteCouch = 'http://127.0.0.1:5984/'+database;

var  db = new PouchDB(database, {auto_compaction: true});

// Get the config again and if null, open manage page
db.get(configdoc, function(err, data) {
  if (err) {
    chrome.runtime.openOptionsPage();
  }
  config = data;
});

// Map reduce to get current users friends and counts them
var map = function(doc) {
  if (doc.friendemail == config.useremail) {
    if(doc.visited == 0){
      newcount += 1;
    }
    emit(doc,null);
  }
};

//Updates number badge on extension icon. Should update austomatically
var initializeIcon = function() {
  db.query(map, {include_docs:true}).then(function(result) {
    if(newcount > 0){
      chrome.browserAction.setBadgeText( { text: newcount.toString() });
      chrome.browserAction.setBadgeBackgroundColor({color:'green'})
    }
    else {
      chrome.browserAction.setBadgeText( { text: '' });
    }
  });
 };

 // Ensure we have latest data
var kickOffReplication = function() {
  if(config.url){
    replication = db.sync(config.url, {
      live:true, 
      retry:true
    })    
  }
}
// Kick it off
initializeIcon();

function alertOb(text){
  alert(JSON.stringify(text));
}
