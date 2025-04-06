import streamlit as st
import os
import base64
import json

st.set_page_config(layout="wide")
st.title("👕 Forma Gardırobum")

# JSON'dan forma bilgilerini oku
with open("formalar.json", "r", encoding="utf-8") as f:
    forma_bilgileri = json.load(f)

# Slide HTML’lerini oluştur
slides_html = ""
for forma in forma_bilgileri:
    dosya_adi = forma["dosya"]
    sezon = forma["sezon"]
    image_path = os.path.join("formalar", dosya_adi)

    if not os.path.exists(image_path):
        continue

    with open(image_path, "rb") as img_file:
        b64_image = base64.b64encode(img_file.read()).decode()
        mime = f"image/{'jpeg' if dosya_adi.endswith('.jpg') else dosya_adi.split('.')[-1]}"
        
        slides_html += f"""
        <div class="swiper-slide">
            <div class="image-container">
                <img src="data:{mime};base64,{b64_image}">
                <div class="slide-info">
                    <p class="sezon">{sezon}</p>
                </div>
            </div>
        </div>
        """

# HTML + CSS + JS
carousel_html = f"""
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/swiper@11/swiper-bundle.min.css" />

<style>
body {{
  background-color: #000;
}}

.swiper {{
  width: 100%;
  padding-top: 50px;
  padding-bottom: 50px;
}}

.swiper-slide {{
  background: transparent;
  width: 300px;
  height: 500px;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  transform: scale(0.8);
  opacity: 0.4;
  transition: transform 0.5s, opacity 0.5s;
}}

.swiper-slide-active {{
  transform: scale(1.05) !important;
  opacity: 1 !important;
}}

.image-container {{
  position: relative;
}}

.image-container img {{
  width: 100%;
  border-radius: 0;
  box-shadow: none;
  background: transparent;
}}

.slide-info {{
  display: none;
  margin-top: 10px;
}}

.swiper-slide-active .slide-info {{
  display: block;
}}

.sezon {{
  font-size: 20px;
  font-weight: bold;
  color: white;
  text-shadow: 1px 1px 4px rgba(0,0,0,0.8);
  margin-bottom: 5px;
}}
</style>

<div class="swiper mySwiper">
  <div class="swiper-wrapper">
    {slides_html}
  </div>
</div>

<script src="https://cdn.jsdelivr.net/npm/swiper@11/swiper-bundle.min.js"></script>

<script>
document.addEventListener("DOMContentLoaded", function () {{
  const swiper = new Swiper(".mySwiper", {{
    effect: "coverflow",
    grabCursor: true,
    centeredSlides: true,
    slidesPerView: 5,
    coverflowEffect: {{
      rotate: 0,
      stretch: 0,
      depth: 100,
      modifier: 1,
      slideShadows: false
    }},
    loop: true
  }});
}});
</script>
"""

st.components.v1.html(carousel_html, height=750)
