document.addEventListener('DOMContentLoaded', () => {
  console.log('Script başlatılıyor...');
  
  fetch("./formalar.json")
    .then((res) => {
      console.log('Fetch response:', res.status);
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      return res.json();
    })
    .then((formalar) => {
      console.log('Formalar yüklendi:', formalar.length);
      
      // İstatistikleri hesapla
      const uniqueClubs = new Set(formalar.map(forma => forma.kulup));
      const uniqueSeasons = new Set(formalar.map(forma => forma.sezon));
      const totalKits = formalar.length;
      
      // İstatistikleri göster
      const statsContainer = document.getElementById('stats');
      statsContainer.innerHTML = `
        <p style="color: white; text-shadow: -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000;">👕 Toplam <strong>${totalKits}</strong> forma</p>
        <p style="color: white; text-shadow: -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000;">⚽️ <strong>${uniqueClubs.size}</strong> farklı kulüp</p>
        <p style="color: white; text-shadow: -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000;">📅 <strong>${uniqueSeasons.size}</strong> farklı sezon</p>
      `;

      const container = document.getElementById("carousel-container");
      if (!container) {
        throw new Error('Carousel container bulunamadı!');
      }

      const colorThief = new ColorThief();
      let activeSlideColor = null;

      function rgbToString(color) {
        return `rgb(${color[0]}, ${color[1]}, ${color[2]})`;
      }

      function updateBackgroundColor(color) {
        document.body.style.backgroundColor = color;
      }

      formalar.forEach((forma, index) => {
        console.log(`Forma ${index + 1} yükleniyor:`, forma.dosya);
        const slide = document.createElement("div");
        slide.className = "swiper-slide";

        slide.innerHTML = `
          <div class="image-container" style="cursor: pointer;" onclick="window.location.href='formalar/detay/forma.html?id=${index}'">
            <img 
              src="./formalar/${forma.dosya}" 
              alt="${forma.kulup} ${forma.sezon}"
              crossorigin="anonymous"
              onload="console.log('Resim yüklendi:', '${forma.dosya}')"
              onerror="console.error('Resim yüklenemedi:', '${forma.dosya}'); this.src='https://via.placeholder.com/300x400?text=Forma+Bulunamadı'"
            >
          </div>
          <div class="slide-info">
            <p class="kulup" style="color: white; text-shadow: -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000;">${forma.kulup}</p>
            <p class="sezon" style="color: white; text-shadow: -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000;">${forma.sezon}</p>
            <p class="forma-turu" style="color: white; text-shadow: -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000;">${forma.forma_turu}</p>
          </div>
        `;

        const img = slide.querySelector('img');
        img.addEventListener('load', () => {
          try {
            const color = colorThief.getColor(img);
            slide.dataset.backgroundColor = rgbToString(color);
          } catch (error) {
            console.error('Renk alınamadı:', error);
          }
        });

        container.appendChild(slide);
      });

      console.log('Swiper başlatılıyor...');
      // 100. Yıl formasının indexini bul
      const yuzuncuYilIndex = formalar.findIndex(forma => forma.dosya === "100FB.png");
      console.log('100. Yıl forması index:', yuzuncuYilIndex);

      const swiper = new Swiper(".mySwiper", {
        effect: "coverflow",
        grabCursor: true,
        centeredSlides: true,
        slidesPerView: "auto",
        initialSlide: yuzuncuYilIndex !== -1 ? yuzuncuYilIndex : 0,
        loop: true,
        watchSlidesProgress: true,
        coverflowEffect: {
          rotate: 30,
          stretch: 0,
          depth: 100,
          modifier: 1,
          slideShadows: false
        }
      });
      
      swiper.on('slideChange', () => {
        const activeSlide = swiper.slides[swiper.activeIndex];
        if (activeSlide && activeSlide.dataset.backgroundColor) {
          updateBackgroundColor(activeSlide.dataset.backgroundColor);
        }
      });

      // İlk slaytın rengini ayarla
      setTimeout(() => {
        const activeSlide = swiper.slides[swiper.activeIndex];
        if (activeSlide && activeSlide.dataset.backgroundColor) {
          updateBackgroundColor(activeSlide.dataset.backgroundColor);
        }
      }, 1000);

      console.log('Swiper başlatıldı');
    })
    .catch(error => {
      console.error('Hata:', error);
      document.body.innerHTML += `
        <div style="color: red; text-align: center; margin-top: 20px; padding: 20px; background: rgba(255,0,0,0.1);">
          <h2>Hata Oluştu</h2>
          <p>${error.message}</p>
        </div>
      `;
    });
});
