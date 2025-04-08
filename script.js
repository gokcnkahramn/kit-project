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
        <p>👕 Toplam <strong>${totalKits}</strong> forma</p>
        <p>⚽️ <strong>${uniqueClubs.size}</strong> farklı kulüp</p>
        <p>📅 <strong>${uniqueSeasons.size}</strong> farklı sezon</p>
      `;

      const container = document.getElementById("carousel-container");
      if (!container) {
        throw new Error('Carousel container bulunamadı!');
      }

      formalar.forEach((forma, index) => {
        console.log(`Forma ${index + 1} yükleniyor:`, forma.dosya);
        const slide = document.createElement("div");
        slide.className = "swiper-slide";

        slide.innerHTML = `
          <div class="image-container">
            <img 
              src="./formalar/${forma.dosya}" 
              alt="${forma.kulup} ${forma.sezon}"
              onload="console.log('Resim yüklendi:', '${forma.dosya}')"
              onerror="console.error('Resim yüklenemedi:', '${forma.dosya}'); this.src='https://via.placeholder.com/300x400?text=Forma+Bulunamadı'"
            >
          </div>
          <div class="slide-info">
            <p class="kulup">${forma.kulup}</p>
            <p class="sezon">${forma.sezon}</p>
            <p class="forma-turu">${forma.forma_turu}</p>
          </div>
        `;

        container.appendChild(slide);
      });

      console.log('Swiper başlatılıyor...');
      const swiper = new Swiper(".mySwiper", {
        effect: "coverflow",
        grabCursor: true,
        centeredSlides: true,
        slidesPerView: "auto",
        initialSlide: 2,
        loop: true,
        watchSlidesProgress: true,
        coverflowEffect: {
          rotate: 30,
          stretch: 0,
          depth: 200,
          modifier: 1.5,
          slideShadows: true,
        }
      });
      
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
