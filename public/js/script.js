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

// const ratingInput = document.getElementById('ratingInput');
// const starRating = document.getElementById('starRating');

//         // Update star rating when input range changes
//         ratingInput.addEventListener('input', () => {
//             const rating = parseInt(ratingInput.value);
//             starRating.innerHTML = '★'.repeat(rating);
//         });
mapboxgl.accessToken = "pk.eyJ1IjoiYW1sYW40NSIsImEiOiJjbHp3YWljN3EwZ2FnMmtzZHdzOXFzMWZ2In0.qISvY3zDc53Wbxdg0pCx8A";
const map = new mapboxgl.Map({
container: 'map', // container ID
center: [-74.5, 40], // starting position [lng, lat]. Note that lat must be set between -90 and 90
zoom: 9 // starting zoom
});
const marker=new mapboxgl.marker().setLngLat(coordinates);