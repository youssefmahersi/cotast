const login = (btn,csrf)=>{
    const email = btn.parentNode.querySelector('[name=email]');
    const password =btn.parentNode.querySelector('[name=password]');
    fetch("/login",{
        method :"POST",
        headers : {
            "content-type" :"application/json"
        },
        body :JSON.stringify({
            email : email.value,
            password: password.value,
            _csrf : csrf
        })
    }).then(result => {
        return result.json();
      })
      .then(data => {
        if(data.message === "success"){
            return window.location="/";
        }
       Swal.fire(data.message);

      })
      .catch(err => {
        console.log(err);
      });
   

}