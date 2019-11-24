const addContent = (btn,foldername,filename,csrf) => {
  console.log(filename)
  console.log(foldername)
    const filenames = filename;
    const div = document.getElementById("addmessage");
    const foldernames = foldername;

  
  
    fetch('/add-content/', {
      method: 'POST',
      headers : {
          "content-type": "application/json"
      },
      body: JSON.stringify({
          filename : filenames,
          foldername : foldernames,
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
   
  };