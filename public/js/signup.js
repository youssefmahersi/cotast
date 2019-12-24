const signup = (btn,csrf)=>{
    const username = btn.parentNode.querySelector('[name=username]');
    const email = btn.parentNode.querySelector('[name=emails]');
    const school = btn.parentNode.querySelector('[name=school]');
    const status = btn.parentNode.querySelector('[name=status]');
    const password =btn.parentNode.querySelector('[name=passwords]');
    const confirmPassword = btn.parentNode.querySelector('[name=passwordconfirm]');
    fetch("/signup",{
        method :"POST",
        headers : {
            "content-type" :"application/json"
        },
        body :JSON.stringify({
            username : username.value,
            email : email.value,
            school : school.value,
            status: status.value,
            password: password.value,
            passwordconfirm : confirmPassword.value,
            _csrf : csrf
        })
    }).then(result => {
        return result.json();
      })
      .then(data => {
        if(data.message === "success"){
            username.value = '';
            email.value ='';
            school.value='';
            status.value='';
            password.value='';
            confirmPassword.value='';
            return Swal.fire("Succés","vous êtes inscrit avec succès","success");
        }
       Swal.fire(data.message);

      })
      .catch(err => {
        console.log(err);
      });
   

}