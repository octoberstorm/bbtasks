var db = null;

init_database = function(){
  db = window.openDatabase('MyNotes', '1.0', 'My awsome note app', 1024*1024*3);
  db.transaction(function(tx){
    tx.executeSql(
      "CREATE TABLE IF NOT EXISTS notes(id INTEGER PRIMARY KEY, title TEXT, content TEXT)", [], 
      function(){},
      function(tx, error){ alert(error.message) }
    );
  });
};

// Send message
sendMessage = function(msg){
 $("#message").html(msg);
 $("#message").show();
 $("#message").fadeOut(5000);
}

addToNoteList = function(id, title){
  var note = $("<li>");
//  note.attr("data-id", id);
  note.addClass("ui-btn ui-btn-icon-right ui-li ui-li-has-alt ui-first-child ui-btn-up-d");
  note.html(
    "<div class='ui-btn-inner ui-li ui-li-has-alt'> <div class='ui-btn-text'>  <a data-id='" + id + "' class='ui-link-inherit'>" + title + "</a></div></div><a class='delete ui-li-link-alt ui-btn ui-btn-icon-notext ui-btn-up-d'>Delete</a>");
  $("#notes").append(note);
}

// load notes from db to html
fetchNotes = function(){
  db.transaction(function(tx){
    tx.executeSql("SELECT id, title FROM notes", [], function(tx, result){
      for(var i = 0; i < result.rows.length; i++){
        row = result.rows.item(i);
//        addToNoteList(row['id'], row['title']);
        
        var note = { id: row['id'], title: row['title'], content: row['content'] };
        notes.push(note);
      }
    }, 
    function(tx, error) { sendMessage(error.message); }
  );
})};


// insert note
insertNote = function(title, content){
  db.transaction(function(tx){
    tx.executeSql("INSERT INTO notes(title, content) VALUES(?, ?)", [title.val(), content.val()], 
      function(tx, result){ 
        var title = $("#title");
        title.attr("data-id", result.insertId);
        addToNoteList(result.insertId, title.val()); 
        sendMessage("New note was created successfully!"); 
      },
      function(tx, error){ sendMessage(error.message); }
    )});
}

// update a note
updateNote = function(title, content){
  id = title.attr("data-id");
  db.transaction(function(tx){
    tx.executeSql("UPDATE notes set title = ?, content = ? WHERE id = ?",
      [title.val(), content.val(), id],
      function(tx, result){ 
        $("#notes li a[data-id=" + id + "]").html(title.val());
        sendMessage("Note updated!");
      },
      function(tx, error){ sendMessage(error.message); }
    )}
  );
}

// delete a note
deleteNote = function(id){
  db.transaction(function(tx){
    tx.executeSql("DELETE FROM notes WHERE id = ?", [id],
      function(tx, result){ 
        $("#notes li a[data-id=" + id + "]").parents("li").remove(); 
        sendMessage("One note get deleted!"); 
      },
      function(tx, error){ sendMessage(error.message); }
    );
  });
}

// load a note to html
loadNote = function(id){
  db.transaction(function(tx){
    tx.executeSql("SELECT * FROM notes WHERE id = ?", [id], 
    function(tx, result){
      var note = result.rows.item(0);
      var title = $("#title"); var content = $("#content");
      title.attr("data-id", note['id']);
      title.val(note['title']);
      content.val(note['content']);
      $("#delete_button").show();
    },
    function(tx, error){ sendMessage(error.message) }
   );
  });
}

// display empty note
newNote = function(){
  var title = $("#title");
  title.attr("data-id", "");
  title.val("");
  $("#content").val("");
  $("#delete_button").hide();
}

$(document).ready(function(){
  init_database();
  fetchNotes();
  newNote();

  $("#save_button").click(function(e){
    e.preventDefault();
    var title = $("#title");
    var content = $("#content");
    id = title.attr("data-id");
    if (id){
      updateNote(title, content);
    }
    else{
      insertNote(title, content);
    }
  });

  $("#notes").click(function(e){
    if($(e.target).is('a')){
     elem = e.target;
     loadNote($(elem).attr('data-id'));
    }
  });

  $("#delete_button").click(function(e){
    e.preventDefault();
    title = $("#title");
    deleteNote(title.attr("data-id"));
    newNote();
  });

  $("#new_button").click(function(e){
    newNote();
  });
});
