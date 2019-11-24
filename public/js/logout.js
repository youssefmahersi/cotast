const logout = (btn,csrf)=>{
    Swal.fire({
        title: 'Déconnexion?',
        text: "êtes-vous sûr!!",
        type: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Oui',
        cancelButtonText: 'Annuler'
      }).then((result) => {
        if (result.value) {
          fetch("/logoutt",{
              method : "POST",
              headers : {
                  "content-type":"application/json"
                },
                
                body: JSON.stringify({
                    
                    _csrf : csrf
                })
          }).then(result => {
            return result.json();
          })
          .then(data => {
           
            if(data.message === "success"){
              return window.location = "/";
            }
           
    
          })
          .catch(err => {
            console.log(err);
          });
        }
      })
}
