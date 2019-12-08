var button = document.getElementById('btnbtn');

const follow = (btn,teacherid,csrf,subscriber) =>{
  if(subscriber == "En Attente" || subscriber == "Abonné"){
    return false;
  }
    fetch('/follow-teacher', {
        method: 'POST',
        headers : {
            "content-type": "application/json"
        },
        body: JSON.stringify({
            teacherid : teacherid,
            _csrf : csrf
        })
        
      })
        .then(result => {
          return result.json();
        })
        .then(data => {
         
          Swal.fire(data.message)
          button.className = "btn btn-secondary text-dark disabled"
         button.innerHTML = "<i class='fas fa-spinner'></i> En attente";
  
        })
        .catch(err => {
          console.log(err);
        });
}