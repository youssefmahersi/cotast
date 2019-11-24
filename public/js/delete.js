const deleteProduct = (btn,csrf) => {
    const prodId = btn.parentNode.querySelector('[name=postId]').value;
    const post = document.getElementById("postsnum");
    
  
    const productElement = btn.closest('article');
  
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
  };