(() => {
    'use strict'
  
    // Fetch all the forms we want to apply custom Bootstrap validation styles to
    const forms = document.querySelectorAll('.needs-validation')
  
    // Loop over them and prevent submission
    Array.from(forms).forEach(form => {
      form.addEventListener('submit', event => {
        if (!form.checkValidity()) {
          event.preventDefault()
          event.stopPropagation()
        }
  
        form.classList.add('was-validated')
      }, false)
    })
  })()

// function executeRating(stars) {
//     const starClassActive = "rating__star fas fa-star";
//     const starClassInactive = "rating__star far fa-star";
//     const starsLength = stars.length;
//     let i;

//     stars.map((star) => {
//         star.onclick = () => {
//             i = stars.indexOf(star);
//             if (star.className === starClassInactive) {
//                 for (i; i >= 0; --i) stars[i].className = starClassActive;
//             } else {
//                 for (i; i < starsLength; ++i) stars[i].className = starClassInactive;
//             }
//         };
//     });
// }

const ratingInput = document.getElementById('ratingInput');
const starRating = document.getElementById('starRating');

        // Update star rating when input range changes
        ratingInput.addEventListener('input', () => {
            const rating = parseInt(ratingInput.value);
            starRating.innerHTML = '★'.repeat(rating);
        });