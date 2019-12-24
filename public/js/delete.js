
const deleteProduct = (btn,csrf) => {
    const prodId = btn.parentNode.querySelector('[name=postId]').value;
    const post = document.getElementById("postsnum");
    
  
    const productElement = btn.closest('article');
    const swalWithBootstrapButtons = Swal.mixin({
      customClass: {
        confirmButton: 'btn btn-success',
        cancelButton: 'btn btn-danger'
      },
      buttonsStyling: false
    })
    
    swalWithBootstrapButtons.fire({
      title: 'Êtes-vous sûr?',
      text: "Vous ne pourrez pas revenir sur cela!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Oui,supprime-le',
      cancelButtonText: 'Non, annule!',
      reverseButtons: true
    }).then((result) => {
      if (result.value) {
        fetch('/delete-product/' + prodId, {
          method: 'DELETE',
          headers : {
            "content-type": "application/json"
        },
        body: JSON.stringify({
            _csrf : csrf
        })
        })
          .then(result => {
            return result.json();
          })
          .then(data => {
            
            productElement.parentNode.removeChild(productElement);
            
            post.innerHTML = `<i class='fas fa-file'></i> ${data.posts} publications`;
    
          })
          .catch(err => {
            console.log(err);
          });
      } else if (
        /* Read more about handling dismissals below */
        result.dismiss === Swal.DismissReason.cancel
      ) {
        swalWithBootstrapButtons.fire(
          'Cancelled',
          'Votre publication est en sécurité :)',
          'error'
        )
      }
    })
  
    
  };