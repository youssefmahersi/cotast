const follow = (btn,teacherid,csrf) =>{
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
         
  
        })
        .catch(err => {
          console.log(err);
        });
}