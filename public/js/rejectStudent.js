const reject = (btn,followerId,csrf) => {
    var element = document.getElementById("hhh"+followerId);
    
      fetch('/rejectStudent/', {
        method: 'POST',
        headers : {
            "content-type": "application/json"
        },
        body: JSON.stringify({
            id: followerId,
            _csrf : csrf
        })
        
      })
        .then(result => {
          return result.json();
        })
        .then(data => {
         
            element.parentNode.removeChild(element);
         
  
        })
        .catch(err => {
          console.log(err);
        });
     
    };