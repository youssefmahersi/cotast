const createRoom = (btn,csrf)=>{
    const roomName = btn.parentNode.querySelector('[name=roomName]').value;
    const roomPassword = btn.parentNode.querySelector('[name=roomPassword]').value;
    
    fetch("/create-room",{
        method : 'POST',
        headers : {
            "content-type": "application/json"
        },
        body: JSON.stringify({
            roomName : roomName,
            roomPassword : roomPassword,
            _csrf : csrf
        })
    }).then(result => {
        return result.json();
      })
      .then(data => {
        if(data.message === "Room created succesfuly"){
           return window.location = "/tchat";
        }
       Swal.fire(data.message);

      })
      .catch(err => {
        console.log(err);
      });
   
  
}