const signup = (btn,csrf)=>{
    const username = btn.parentNode.querySelector('[name=username]').value;
    const email = btn.parentNode.querySelector('[name=emails]').value;
    const school = btn.parentNode.querySelector('[name=school]').value;
    const status = btn.parentNode.querySelector('[name=status]').value;
    const password =btn.parentNode.querySelector('[name=passwords]').value;
    const confirmPassword = btn.parentNode.querySelector('[name=passwordconfirm]').value;
    console.log(username,email,school,status,password,confirmPassword);
    fetch("/signup",{
        method :"POST",
        headers : {
            "content-type" :"application/json"
        },
        body :JSON.stringify({
            username : username,
            email : email,
            school : school,
            status: status,
            password: password,
            passwordconfirm : confirmPassword,
            _csrf : csrf
        })
    }).then(result => {
        return result.json();
      })
      .then(data => {
        if(data.message === "success"){
            return window.location = "/";
        }
       Swal.fire(data.message);

      })
      .catch(err => {
        console.log(err);
      });
   

}