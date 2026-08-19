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

      // -------- DÜNYA HARİTASI (STADYUM GÖSTERİMİ) --------
      // Her takımın stadyumu (elle girilir). Koordinatlar [enlem, boylam]
      const STADLAR = {
        "Altınordu":    { ad: "Bornova Stadyumu",                    enlem: 38.4618, boylam: 27.1919 },
        "Antalyaspor":  { ad: "Corendon Airlines Park",              enlem: 36.8982, boylam: 30.6701 },
        "Borussia Dortmund": { ad: "Signal Iduna Park",              enlem: 51.5174, boylam: 7.4514 },
        "Eskişehirspor":{ ad: "Yeni Eskişehir Stadyumu",             enlem: 39.7336, boylam: 30.5141 },
        "Fenerbahçe":   { ad: "Şükrü Saracoğlu Stadyumu",            enlem: 40.9872, boylam: 29.0417 },
        "Fenerbahçe Beko": { ad: "Ülker Spor ve Etkinlik Salonu",    enlem: 41.0060, boylam: 29.0446 },
        "Fransa":       { ad: "Stade de France",                     enlem: 48.9245, boylam: 2.3602 },
        "Göztepe":      { ad: "Gürsel Aksel Stadyumu",               enlem: 38.4125, boylam: 27.0999 },
        "Inter":        { ad: "San Siro (Giuseppe Meazza)",          enlem: 45.4781, boylam: 9.1240 },
        "İsveç":        { ad: "Friends Arena",                       enlem: 59.3724, boylam: 17.9955 },
        "İtalya":       { ad: "Stadio Olimpico (Roma)",              enlem: 41.9341, boylam: 12.4551 },
        "Karşıyaka":    { ad: "Mustafa Kemal Atatürk Spor Salonu",   enlem: 38.4511, boylam: 27.1336 },
        "Köln":         { ad: "RheinEnergieStadion",                 enlem: 50.9342, boylam: 6.8760 },
        "Liverpool":    { ad: "Anfield",                             enlem: 53.4308, boylam: -2.9608 },
        "Napoli":       { ad: "Stadio Diego Armando Maradona",       enlem: 40.8280, boylam: 14.1932 },
        "San Diego Padres": { ad: "Petco Park",                      enlem: 32.7077, boylam: -117.1570 },
        "PSV":          { ad: "Philips Stadion",                     enlem: 51.4417, boylam: 5.4677 },
        "Real Madrid":  { ad: "Santiago Bernabéu",                   enlem: 40.4531, boylam: -3.6883 },
        "Rumeli Hisarı":{ ad: "Rumeli Hisarı Sahası (İstanbul)",     enlem: 41.0845, boylam: 29.0561 },
        "Samsunspor":   { ad: "Samsun 19 Mayıs Stadyumu",            enlem: 41.2861, boylam: 36.2950 },
        "Sivasspor":    { ad: "Yeni 4 Eylül Stadyumu",               enlem: 39.7086, boylam: 37.0026 },
        "Tranmere Rovers": { ad: "Prenton Park",                     enlem: 53.3820, boylam: -3.0430 },
        "Türkiye":      { ad: "Atatürk Olimpiyat Stadyumu",          enlem: 41.0739, boylam: 28.7655 }
      };

      // Leaflet haritasını oluştur (zoom kontrolü gizli; fare/scroll ile zoom yapılabilir)
      const map = L.map("map", { zoomControl: false }).setView([30, 30], 2); // dünya görünümü

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
      }).addTo(map);

      // Özel stadyum işareti (küre görünümüne uygun, merkezde kalır)
      let currentMarker = null;
      const mapLabel = document.getElementById("map-label");

      function stadyumuGoster(kulup) {
        const stad = STADLAR[kulup];
        if (currentMarker) {
          map.removeLayer(currentMarker);
        }
        if (stad) {
          currentMarker = L.circleMarker([stad.enlem, stad.boylam], {
            radius: 9,
            color: "#ffd24d",
            weight: 3,
            fillColor: "#ff9d00",
            fillOpacity: 0.9
          }).addTo(map);
          map.flyTo([stad.enlem, stad.boylam], 12, { duration: 1.2 });
          mapLabel.textContent = `${kulup} → ${stad.ad}`;
        } else {
          mapLabel.textContent = "Bu takım için stadyum bilgisi yok";
        }
      }

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
        // Aktif formanın kulübüne göre stadyumu göster (loop modunda realIndex kullan)
        const activeKit = formalar[swiper.realIndex];
        stadyumuGoster(activeKit ? activeKit.kulup : null);
      });

      // İlk renk ve başlangıç stadyumu
            setTimeout(() => {
        const active = swiper.slides[swiper.activeIndex];
        if (active.dataset.backgroundColor) {
          document.body.style.backgroundColor = active.dataset.backgroundColor;
        }
        const activeKit = formalar[swiper.realIndex];
        stadyumuGoster(activeKit ? activeKit.kulup : null);
      }, 800);

    })
    .catch(err => {
      const localIyandirici =
        err instanceof TypeError ? `
          <p style="color:#ffd24d; max-width:700px; margin:10px auto; line-height:1.5;">
            Dosyayı muhtemelen doğrudan tarayıcıda açtın (çift tıklayarak).<br>
            fetch() dosyaları <code>file://</code> olarak açıldığında yükleyemez.<br><br>
            Lütfen sayfayı bir sunucu üzerinden çalıştır:
          </p>
          <pre style="color:#9eff4a; background:#111; padding:12px; border-radius:8px; max-width:700px; margin:10px auto; text-align:left;">python -m http.server 8000
# sonra tarayıcıda şu adresi aç:
http://localhost:8000</pre>
        ` : "";
      document.body.innerHTML += `<h2 style="color:red;">Hata: ${err.message}</h2>${localIyandirici}`;
    });

});
