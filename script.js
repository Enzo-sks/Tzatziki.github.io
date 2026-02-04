/* ==========================
   MENU BURGER
========================== */
const burger = document.getElementById('burger');
const sideMenu = document.getElementById('side-menu');
const closeBtn = document.getElementById('close-btn');

// Ouvrir le menu
burger.addEventListener('click', () => sideMenu.classList.add('open'));

// Fermer le menu
closeBtn.addEventListener('click', () => sideMenu.classList.remove('open'));

// Fermer le menu au clic sur un lien
document.querySelectorAll('.side-menu a').forEach(link => {
  link.addEventListener('click', () => sideMenu.classList.remove('open'));
});
// fermeture si on clique ailleurs

document.addEventListener('click', (e) => {
  const sideMenu = document.getElementById('side-menu');
  const burger = document.getElementById('burger');

  // Vérifie que le menu est ouvert
  if (!sideMenu.classList.contains('open')) return;

  // Si le clic n'est pas sur le menu ni sur le bouton burger, ferme le menu
  if (!sideMenu.contains(e.target) && e.target !== burger) {
    sideMenu.classList.remove('open');
  }
});


/* ==========================
   FILTRAGE PORTFOLIO
========================== */
const filterBtns = document.querySelectorAll('.filter-btn');
const portfolioItems = document.querySelectorAll('.portfolio-item');

filterBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    // Retirer la classe active de tous
    filterBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    const filter = btn.dataset.filter;

    portfolioItems.forEach(item => {
      if (filter === 'all' || item.classList.contains(filter)) {
        item.style.display = 'block';
      } else {
        item.style.display = 'none';
      }
    });
  });
});


/* ==========================
   FADE-IN AU SCROLL
========================== */
const faders = document.querySelectorAll('.fade-in');

const appearOnScroll = () => {
  const triggerBottom = window.innerHeight * 0.85; // déclenche un peu avant que l'élément soit visible

  faders.forEach(fader => {
    const faderTop = fader.getBoundingClientRect().top;
    if(faderTop < triggerBottom){
      fader.classList.add('visible');
    }
  });
};

window.addEventListener('scroll', appearOnScroll);
window.addEventListener('load', appearOnScroll);


/* ==========================
   LIGHTBOX / MODAL
========================== */
document.querySelectorAll('.lightbox').forEach(item => {
  item.addEventListener('click', e => {
    e.preventDefault();

    const modal = document.createElement('div');
    modal.classList.add('modal');
    modal.innerHTML = `<img src="${item.href}" alt=""><span class="close">✕</span>`;
    document.body.appendChild(modal);

    // Fermer le modal
    modal.querySelector('.close').addEventListener('click', () => modal.remove());
  });
});


/* ==========================
   MODE JOUR / NUIT
========================== */
document.addEventListener("DOMContentLoaded", () => {
  const toggleDark = document.getElementById("toggleDark");
  const body = document.body;

  // Si le bouton n'existe pas, on quitte
  if (!toggleDark) return;

  // Vérifie l'état enregistré dans le localStorage
  const darkMode = localStorage.getItem("darkMode");
  if (darkMode === "enabled") {
    body.classList.add("dark-mode");
  } else {
    body.classList.remove("dark-mode");
  }

  // Quand on clique sur le bouton
  toggleDark.addEventListener("click", () => {
    body.classList.toggle("dark-mode");

    // Sauvegarde le nouvel état
    localStorage.setItem("darkMode", body.classList.contains("dark-mode") ? "enabled" : "disabled");
  });
});


/* ==========================
   DESSIN
========================== */

document.addEventListener("DOMContentLoaded", () => {
  const canvas = document.getElementById("drawCanvas");
  if (!canvas) return;

  const ctx = canvas.getContext("2d");
  ctx.fillStyle = "#EEE8D9";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  let drawing = false;

  const colorPicker = document.getElementById("colorPicker");
  const brushSize = document.getElementById("brushSize");
  const clearBtn = document.getElementById("clearBtn");
  const eraseBtn = document.getElementById("eraseBtn");
  const sendBtn = document.getElementById("sendBtn");
  const nameInput = document.getElementById("artistName"); // champ pour le nom

  let color = colorPicker.value;
  let brush = brushSize.value;

  // Adapter la taille du canvas à son style CSS
  function resizeCanvas() {
    const rect = canvas.getBoundingClientRect();
    const dataURL = canvas.toDataURL();
    canvas.width = rect.width;
    canvas.height = rect.height;
    const img = new Image();
    img.src = dataURL;
    img.onload = () => ctx.drawImage(img, 0, 0, rect.width, rect.height);
  }
  window.addEventListener("resize", resizeCanvas);
  resizeCanvas();

  // Charger dessin sauvegardé
  const saved = localStorage.getItem("savedDrawing");
  if (saved) {
    const img = new Image();
    img.src = saved;
    img.onload = () => ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
  }

  const getPos = (e) => {
    const rect = canvas.getBoundingClientRect();
    return {
      x: ((e.clientX - rect.left) / rect.width) * canvas.width,
      y: ((e.clientY - rect.top) / rect.height) * canvas.height
    };
  };

  const start = (e) => {
    drawing = true;
    const pos = getPos(e);
    ctx.beginPath();
    ctx.moveTo(pos.x, pos.y);
  };

  const draw = (e) => {
    if (!drawing) return;
    const pos = getPos(e);
    ctx.lineWidth = brush;
    ctx.lineCap = "round";
    ctx.strokeStyle = color;
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();
    save();
  };

  const stop = () => {
    drawing = false;
    ctx.beginPath();
    save();
  };

  const save = () => {
    localStorage.setItem("savedDrawing", canvas.toDataURL());
  };

  canvas.addEventListener("mousedown", start);
  canvas.addEventListener("mousemove", draw);
  canvas.addEventListener("mouseup", stop);
  canvas.addEventListener("mouseleave", stop);

  canvas.addEventListener("touchstart", (e) => { e.preventDefault(); start(e.touches[0]); });
  canvas.addEventListener("touchmove", (e) => { e.preventDefault(); draw(e.touches[0]); });
  canvas.addEventListener("touchend", stop);

  // Outils
  colorPicker.addEventListener("input", e => color = e.target.value);
  brushSize.addEventListener("input", e => brush = e.target.value);
  clearBtn.addEventListener("click", () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    localStorage.removeItem("savedDrawing");
  });
  eraseBtn.addEventListener("click", () => color = "#EEE8D9");

  // Envoyer dessin sur le wall avec nom
  sendBtn.addEventListener("click", () => {
    const dataURL = canvas.toDataURL();
    const artistName = nameInput.value.trim() || "Anonyme";

    let drawings = JSON.parse(localStorage.getItem("drawings")) || [];
    drawings.push({ dataURL, name: artistName }); // <- ici on stocke un objet
    localStorage.setItem("drawings", JSON.stringify(drawings));

    alert("Dessin envoyé sur le Wall !");
  });
});


/* ==========================
   WALL DESSIN
========================== */

document.addEventListener("DOMContentLoaded", () => {
  const wall = document.getElementById("wall");
  const modal = document.getElementById("modal");
  const modalImg = document.getElementById("modalImg");
  const closeModal = document.getElementById("closeModal");

  // Récupérer les dessins sauvegardés avec noms
  let drawings = JSON.parse(localStorage.getItem("drawings") || "[]");

  function renderWall() {
    wall.innerHTML = "";
    drawings.forEach((drawing, index) => {
      const wrapper = document.createElement("div");
      wrapper.classList.add("wall-item");
      wrapper.style.position = "relative";

      const img = document.createElement("img");
      
      img.classList.add("wall-img");
      img.src = drawing.dataURL; // dataURL du dessin
      
      img.style.width = "200px";
      img.style.height = "150px";
      img.style.objectFit = "cover";
      img.style.cursor = "pointer";

      // Agrandir au clic
      img.addEventListener("click", () => {
        modalImg.src = drawing.dataURL;
        modal.style.display = "flex";
      });

      // Bouton supprimer
      const delBtn = document.createElement("button");
      delBtn.textContent = "🗑";
      delBtn.classList.add("btn");
      delBtn.style.position = "absolute";
      delBtn.style.top = "5px";
      delBtn.style.right = "5px";
      delBtn.addEventListener("click", () => {
        drawings.splice(index, 1);
        localStorage.setItem("drawings", JSON.stringify(drawings));
        renderWall();
      });

      // Nom du créateur en bas à gauche
      const nameSpan = document.createElement("span");
      nameSpan.textContent = drawing.name || "Anonyme";
      nameSpan.style.position = "absolute";
      nameSpan.style.bottom = "5px";
      nameSpan.style.left = "5px";
      nameSpan.style.background = "rgba(0,0,0,0.5)";
      nameSpan.style.color = "#fff";
      nameSpan.style.padding = "2px 6px";
      nameSpan.style.borderRadius = "4px";
      nameSpan.style.fontSize = "0.85rem";

      wrapper.appendChild(img);
      wrapper.appendChild(delBtn);
      wrapper.appendChild(nameSpan);
      wall.appendChild(wrapper);
    });
  }

  renderWall();

  // Fermer le modal
  closeModal.addEventListener("click", () => {
    modal.style.display = "none";
  });

  // Fermer en cliquant en dehors de l'image
  modal.addEventListener("click", (e) => {
    if (e.target === modal) modal.style.display = "none";
  });
});
