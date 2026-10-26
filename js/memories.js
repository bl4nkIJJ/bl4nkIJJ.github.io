(() => {
  "use strict";
  const target = document.getElementById("memory-timeline");
  const counter = document.getElementById("memory-counter");
  const photos = Array.isArray(window.LOVE_PHOTOS) ? [...window.LOVE_PHOTOS] : [];
  const monthNames = ["января", "февраля", "марта", "апреля", "мая", "июня", "июля", "августа", "сентября", "октября", "ноября", "декабря"];

  function formatDate(iso) {
    const [year, month, day] = iso.split("-").map(Number);
    return `${day} ${monthNames[month - 1]} ${year}`;
  }

  function makeCard(photo, index) {
    const article = document.createElement("article");
    article.className = "memory-card";
    const figure = document.createElement("div");
    figure.className = "memory-photo-wrap";
    const image = document.createElement("img");
    image.className = "memory-photo";
    image.src = photo.src;
    image.alt = `Наше воспоминание от ${formatDate(photo.date)}`;
    image.loading = index < 2 ? "eager" : "lazy";
    image.decoding = "async";
    figure.append(image);

    const copy = document.createElement("div");
    copy.className = "memory-copy";
    const date = document.createElement("time");
    date.className = "memory-date";
    date.dateTime = photo.datetime;
    date.textContent = formatDate(photo.date);
    const caption = document.createElement("p");
    caption.textContent = photo.caption;
    const heart = document.createElement("span");
    heart.className = "memory-heart";
    heart.setAttribute("aria-hidden", "true");
    heart.textContent = index % 3 === 1 ? "♡ ✿ ♡" : "♡ ♡ ♡";
    copy.append(date, caption, heart);
    article.append(figure, copy);
    return article;
  }

  photos.sort((a, b) => a.datetime.localeCompare(b.datetime));
  counter.textContent = `наши моменты · ${photos.length} фото`;
  if (!photos.length) {
    target.innerHTML = '<p class="loading-note">Похоже, фотографии не найдены. Проверь папку assets/photos 💘</p>';
    return;
  }
  const fragment = document.createDocumentFragment();
  photos.forEach((photo, index) => fragment.append(makeCard(photo, index)));
  target.replaceChildren(fragment);
})();
