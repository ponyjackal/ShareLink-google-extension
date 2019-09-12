var db = null;
var configdoc = '_local/config';
var database = 'sherrif';
var config = null;
var friends = '';
var sync = null;
var groups = '';
var remoteCouch = 'http://127.0.0.1:5984/'+database;

var db = new PouchDB(database);

//Updates the _local/config. This only needs to happen if data has changed after initial setting
function updateConfig(){  
      username = $('#username').val();
      useremail = $('#useremail').val();
      url = $('#couchdburl').val();

      var date = new Date();
      var seconds = date.getTime() / 1000;
      friendname = $('#friendname').val();
      friendemail = $('#friendemail').val();
      useremail = $('#useremail').val();
     
      db.post({
          _id: configdoc,
          username: username,
          useremail: useremail,
          url:url
        }).then(function(response) {
        console.log('Config updated!');
      }).catch(function (err) {
        console.log(err);
      });

       var doc = {_id: 'friend', type: 'friend', useremail: useremail, friendname: friendname, friendemail: friendemail}

      db.put(doc)
      .then(function () {
        console.log('Doc Added.');
        kickOffReplication();
      }).catch(function (err) {
        alertOb("addDoc error");
      }); 

    //groupname = $('#groupname').val();
    //grouplist = $('#grouplist').val();

    // Adds a friend if filled out and add the doc
    // if(friendemail && friendname){
    //     // doc = {_id: 'friend'+seconds, type: 'friend', useremail: useremail, friendname: friendname, friendemail: friendemail}
    //     // addDoc(doc);
    //     doc = {_id: 'friend'+seconds, type: 'friend', useremail: useremail, friendname: friendname, friendemail: friendemail}
    //     db.put(doc)
    //     .then(function () {
    //       console.log('Doc Added.');
    //       kickOffReplication();
    //     }).catch(function (err) {
    //       alertOb("addDoc error");
    //     }); 
       
    // }
} 

// Load configdoc and fill in form.
var loadConfig = function() {
  db.get(configdoc, function(err, data) {
    config = data;
    if(config){
      if(config.useremail){
        $('#username').val(config.username);
        $('#useremail').val(config.useremail);
        $('#couchdburl').val(config.url);
      }      
    }

  });
};

//Adds a new record and replicates
function addDoc(doc){
  db.put(doc).then(function () {
    console.log('Doc Added.');
    kickOffReplication();
  }).catch(function (err) {
    alertOb("addDoc error");
  }); 
}
//Define replication
var kickOffReplication = function() {
  if (replication != null) {
    replication.cancel();
  }
    //TODO: Sync url should come from configdoc
    if(config.url){
      replication = db.sync(config.url, {
        live:true, 
        retry:true
      }).on('change', function(change){ 
        console.log("change", change);
        loadLinks();
      });      
    }

  
}
//Kicks off the page
loadConfig();  



//Get all doc. Need to filter just for current users records
db.allDocs({
    include_docs: true
  }).then(function (result) {
    var docs = result.rows.map(function (row) {
        if(row.doc.type == 'friend'){
           friends += '<div class="alert alert-success" role="alert">'+row.doc.friendname+'</div>';
        }
        if(row.doc.type == 'group'){
            groups += '<div class="alert alert-warning" role="alert">'+row.doc.groupname+'</div><div>'+row.doc.grouplist+'</div>';
         }
         // Inject friends onto manage page
        $('#insertfriends').html(friends);
        //$('#insertgroups').html(groups);
      return row.doc;
    });
  }).catch(function (err) {
    console.log(err);
  });

$("#settingssave").bind("click", function() {

    updateConfig();


    // Adds a group if filled out
    // if(groupname && grouplist){
    //     doc = {_id: 'group'+n, type: 'group', groupname: groupname, grouplist: grouplist, useremail: useremail}
    //     addDoc(doc);
    // }
});
// Easy way to alert objects
  function alertOb(text){
    alert(JSON.stringify(text));
  }
