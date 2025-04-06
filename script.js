fetch("formalar.json")
  .then((res) => res.json())
  .then((formalar) => {
    const container = document.getElementById("carousel-container");

    formalar.forEach((forma) => {
      const imagePath = `formalar/${forma.dosya}`;
      const slide = document.createElement("div");
      slide.className = "swiper-slide";

      slide.innerHTML = `
        <div class="image-container">
          <img src="${imagePath}" alt="Forma">
          <div class="slide-info">
            <p class="sezon">${forma.sezon}</p>
          </div>
        </div>
      `;

      container.appendChild(slide);
    });

    new Swiper(".mySwiper", {
      effect: "coverflow",
      grabCursor: true,
      centeredSlides: true,
      slidesPerView: 5,
      coverflowEffect: {
        rotate: 0,
        stretch: 0,
        depth: 100,
        modifier: 1,
        slideShadows: false,
      },
      loop: true,
    });
  });
