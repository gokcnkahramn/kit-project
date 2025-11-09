document.addEventListener('DOMContentLoaded', () => {

  fetch("./formalar.json")
    .then(res => {
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      return res.json();
    })
    .then(formalar => {

      // -------- İSTATİSTİKLER --------
      const statsContainer = document.getElementById('stats');
      statsContainer.innerHTML = `
        <p>👕 Toplam <strong>${formalar.length}</strong> forma</p>
        <p>⚽️ <strong>${new Set(formalar.map(f => f.kulup)).size}</strong> farklı kulüp</p>
        <p>📅 <strong>${new Set(formalar.map(f => f.sezon)).size}</strong> farklı sezon</p>
      `;

      const container = document.getElementById("carousel-container");
      const colorThief = new ColorThief();

      function rgb(col) {
        return `rgb(${col[0]}, ${col[1]}, ${col[2]})`;
      }

      // -------- SLIDE OLUŞTUR --------
      formalar.forEach((forma, index) => {

        const hasBack = Boolean(forma.arka);

        const slide = document.createElement("div");
        slide.className = "swiper-slide";

        slide.innerHTML = `
          <div class="image-container" style="cursor: pointer;"
               onclick="window.location.href='formalar/detay/forma.html?id=${index}'">

            <div class="kit-card" data-has-back="${hasBack}">
              <img class="front"
                   src="./formalar/${forma.dosya}"
                   alt="${forma.kulup} ${forma.sezon}"
                   crossorigin="anonymous">

              ${hasBack ? `
                <img class="back"
                     src="./formalar/${forma.arka}"
                     alt="${forma.kulup} ${forma.sezon} arka"
                     crossorigin="anonymous">
              ` : ""}
            </div>
          </div>

          <div class="slide-info">
            <p class="kulup">${forma.kulup}</p>
            <p class="sezon">${forma.sezon}</p>
            <p class="forma-turu">${forma.forma_turu}</p>
          </div>
        `;

        const img = slide.querySelector('.front');
        img.addEventListener('load', () => {
          try {
            const c = colorThief.getColor(img);
            slide.dataset.backgroundColor = rgb(c);
          } catch {}
        });

        container.appendChild(slide);
      });

      // -------- SWIPER --------
      const yuzuncuYil = formalar.findIndex(f => f.dosya === "100FB.png");

      const swiper = new Swiper(".mySwiper", {
        effect: "coverflow",
        grabCursor: true,
        centeredSlides: true,
        slidesPerView: "auto",
        initialSlide: yuzuncuYil !== -1 ? yuzuncuYil : 0,
        loop: true,
        watchSlidesProgress: true,
        coverflowEffect: {
          rotate: 30,
          depth: 100,
          modifier: 1,
          slideShadows: false
        }
      });

      swiper.on('slideChange', () => {
        const active = swiper.slides[swiper.activeIndex];
        if (active.dataset.backgroundColor) {
          document.body.style.backgroundColor = active.dataset.backgroundColor;
        }
      });

      // İlk renk
      setTimeout(() => {
        const active = swiper.slides[swiper.activeIndex];
        if (active.dataset.backgroundColor) {
          document.body.style.backgroundColor = active.dataset.backgroundColor;
        }
      }, 800);

    })
    .catch(err => {
      document.body.innerHTML += `<h2 style="color:red;">Hata: ${err.message}</h2>`;
    });

});
