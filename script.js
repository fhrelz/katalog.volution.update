document.addEventListener("DOMContentLoaded", () => {
  const ADMIN_USER = "adminvolutionapparel7";
  const ADMIN_PASS = "adminroot";

  const mainContent = document.getElementById("mainContent");
  const detailGrid = document.getElementById("detailGrid");
  const searchInput = document.getElementById("searchInput");
  const fabContainer = document.getElementById("adminFab");

  // --- 1. DATA & DATABASE ---
  const defaultCategories = [
    {
      id: "sepakbola",
      name: "Kategori Jersey Sepak Bola",
      prefix: "KF",
      count: 50,
      folder: "sepakbola",
    },
    {
      id: "volley",
      name: "Kategori Jersey Vollyball",
      prefix: "KV",
      count: 50,
      folder: "volley",
    },
    {
      id: "badminton",
      name: "Kategori Jersey Badmintoon",
      prefix: "KS",
      count: 50,
      folder: "badminton",
    },
    {
      id: "basketball",
      name: "Kategori Jersey Basketball",
      prefix: "KB",
      count: 50,
      folder: "basketball",
    },
    {
      id: "running",
      name: "Kategori Jersey Running",
      prefix: "KR",
      count: 50,
      folder: "running",
    },
    {
      id: "tennis",
      name: "Kategori Jersey Tennis & Padel",
      prefix: "KT",
      count: 50,
      folder: "tennis",
    },
  ];

  function initData() {
    if (!localStorage.getItem("db_jerseys")) {
      let initialData = [];
      defaultCategories.forEach((cat) => {
        for (let i = 1; i <= cat.count; i++) {
          const number = i.toString().padStart(3, "0");
          const code = `${cat.prefix}${number}`;
          initialData.push({
            code: code,
            categoryName: cat.name,
            categoryId: cat.id,
            folder: cat.folder,
            isCustom: false, // Penanda ini bukan gambar uploadan
          });
        }
      });
      localStorage.setItem("db_jerseys", JSON.stringify(initialData));
    }
  }
  initData();

  let dbJerseys = JSON.parse(localStorage.getItem("db_jerseys"));

  // PERUBAHAN 1: Cek Admin pakai sessionStorage (Hilang saat browser tutup)
  let isAdmin = sessionStorage.getItem("isAdmin") === "true";

  // --- FUNGSI CREATE CARD (UPDATE LOGIKA GAMBAR) ---
  function createJerseyCard(item) {
    // Jika isCustom=true (uploadan admin), pakai data Base64. Jika tidak, pakai path folder.
    let imageSrc = "";
    if (item.isCustom && item.imageBase64) {
      imageSrc = item.imageBase64; // Gambar dari upload
    } else {
      imageSrc = `images/${item.folder}/${item.code}.jpg`; // Gambar dari folder
    }

    return `
            <div class="jersey-card" onclick="cardInteraction('${item.code}', '${item.folder}', ${item.isCustom})">
                <div class="jersey-img-wrapper">
                    <img src="${imageSrc}" alt="${item.code}" loading="lazy" onerror="this.src='https://via.placeholder.com/200x280/000000/ff0000?text=No+Image'">
                </div>
                <span class="jersey-code">#${item.code}</span>
            </div>
        `;
  }

  // --- RENDER INDEX ---
  if (mainContent) {
    const searchResults = document.getElementById("searchResults");
    defaultCategories.forEach((cat) => {
      const categoryItems = dbJerseys.filter((j) => j.categoryId === cat.id);
      let cardsHTML = "";
      categoryItems.forEach((item) => (cardsHTML += createJerseyCard(item)));

      const adminText = isAdmin
        ? `<span class="admin-add-text" style="display:inline;" onclick="goToDetailAdmin('${cat.id}')">+ Tambahkan Desain Jersey</span>`
        : "";

      const section = document.createElement("section");
      section.className = "category-section";
      section.innerHTML = `
                <h2 class="category-title">${cat.name}</h2>
                <div class="scroll-container" style="background-image: linear-gradient(rgba(0,0,0,0.7), rgba(0,0,0,0.7)), url('images/background-utama.jpg');">
                    <div class="scroll-track">${cardsHTML} ${cardsHTML}</div>
                </div>
                <div class="see-more">
                    <a href="detail.html?cat=${cat.id}">Lihat selengkapnya <i class="fas fa-chevron-right"></i></a>
                    ${adminText}
                </div>
            `;
      mainContent.appendChild(section);
      enableDragAndAutoScroll(section.querySelector(".scroll-container"));
    });
    if (searchInput) setupSearch(searchInput, searchResults, dbJerseys);
  }

  // --- RENDER DETAIL ---
  if (detailGrid) {
    const urlParams = new URLSearchParams(window.location.search);
    const catId = urlParams.get("cat");
    const catConfig = defaultCategories.find((c) => c.id === catId);
    if (catConfig) {
      document.getElementById("detailTitle").innerText = catConfig.name;
      const categoryItems = dbJerseys.filter((j) => j.categoryId === catId);
      let gridHTML = "";
      categoryItems.forEach((item) => (gridHTML += createJerseyCard(item)));
      detailGrid.innerHTML = gridHTML;
      if (isAdmin) fabContainer.style.display = "flex";
    }
  }

  // ============================================
  // LOGIKA ADMIN (LOGIN SESSION & UPLOAD)
  // ============================================

  // Handle Login Link di Sidebar (Bagian Atas - Deklarasi Pertama sidebarLinks)
  const sidebarLinks = document.querySelectorAll(".sidebar-links a");
  sidebarLinks.forEach((link) => {
    if (link.innerText.includes("Akses Admin")) {
      link.href = "#";
      link.onclick = function () {
        if (isAdmin) {
          if (confirm("Anda sedang dalam Mode Admin. Ingin Keluar?"))
            logoutAdmin();
        } else {
          document.getElementById("adminLoginModal").style.display = "flex";
        }
      };
    }
  });

  window.attemptAdminLogin = function () {
    const u = document.getElementById("adminUser").value;
    const p = document.getElementById("adminPass").value;
    if (u === ADMIN_USER && p === ADMIN_PASS) {
      sessionStorage.setItem("isAdmin", "true"); // SESSION STORAGE (Auto Logout on close)
      alert("Login Berhasil! Mode Admin Aktif.");
      location.reload();
    } else {
      alert("Username atau Password Salah!");
    }
  };

  window.closeAdminLogin = function () {
    document.getElementById("adminLoginModal").style.display = "none";
  };
  window.logoutAdmin = function () {
    sessionStorage.removeItem("isAdmin");
    location.reload();
  };
  window.goToDetailAdmin = function (catId) {
    window.location.href = `detail.html?cat=${catId}`;
  };
  window.toggleFabMenu = function () {
    fabContainer.classList.toggle("active");
  };
  window.openAddDesignModal = function () {
    document.getElementById("addDesignModal").style.display = "flex";
    fabContainer.classList.remove("active");
  };

  // PERUBAHAN 2: SIMPAN DESAIN DENGAN GAMBAR
  window.saveNewDesign = function () {
    const code = document.getElementById("newCode").value.toUpperCase().trim();
    const catId = document.getElementById("newCategory").value;
    const fileInput = document.getElementById("newImageFile");

    if (!code) return alert("Kode tidak boleh kosong!");
    if (dbJerseys.some((j) => j.code === code))
      return alert("Kode Jersey ini sudah ada!");
    if (fileInput.files.length === 0)
      return alert("Harap upload gambar desain!");

    const file = fileInput.files[0];
    const reader = new FileReader();

    // Proses membaca file gambar menjadi text (Base64)
    reader.onload = function (e) {
      const imageBase64 = e.target.result; // Ini string gambarnya
      const catConfig = defaultCategories.find((c) => c.id === catId);

      const newItem = {
        code: code,
        categoryName: catConfig.name,
        categoryId: catId,
        folder: catConfig.folder,
        isCustom: true, // Tandai ini uploadan
        imageBase64: imageBase64, // Simpan data gambar
      };

      dbJerseys.push(newItem);

      try {
        localStorage.setItem("db_jerseys", JSON.stringify(dbJerseys));
        alert("Berhasil! Gambar dan Desain tersimpan.");
        location.reload();
      } catch (error) {
        alert(
          "Gagal menyimpan! Ukuran gambar terlalu besar. Gunakan gambar < 500KB."
        );
      }
    };

    // Mulai baca file
    reader.readAsDataURL(file);
  };

  // Hapus Desain
  let deleteMode = false;
  window.toggleDeleteMode = function () {
    deleteMode = !deleteMode;
    document.body.classList.toggle("delete-mode");
    fabContainer.classList.remove("active");
    alert(
      deleteMode
        ? "MODE HAPUS: Klik jersey untuk menghapus."
        : "Mode Hapus Non-Aktif."
    );
  };

  window.cardInteraction = function (code, folder, isCustom) {
    if (deleteMode && isAdmin) {
      if (confirm(`Hapus permanen #${code}?`)) {
        dbJerseys = dbJerseys.filter((item) => item.code !== code);
        localStorage.setItem("db_jerseys", JSON.stringify(dbJerseys));
        location.reload();
      }
    } else {
      // Logika Buka Modal Order (Menyesuaikan gambar custom/folder)
      const item = dbJerseys.find((j) => j.code === code);
      let imgSrc =
        isCustom && item.imageBase64
          ? item.imageBase64
          : `images/${folder}/${code}.jpg`;
      openOrderModalWithImage(code, folder, imgSrc);
    }
  };

  // --- FUNGSI PENDUKUNG LAIN (SIDEBAR, DLL) ---
  const sidebar = document.getElementById("mainSidebar");
  const overlay = document.getElementById("sidebarOverlay");
  const hamburgerBtn = document.getElementById("hamburgerBtn");
  const closeSidebarBtn = document.getElementById("closeSidebar");
  if (hamburgerBtn) {
    hamburgerBtn.addEventListener("click", () => {
      sidebar.classList.add("open");
      overlay.style.display = "block";
    });
    closeSidebarBtn.addEventListener("click", () => {
      sidebar.classList.remove("open");
      overlay.style.display = "none";
    });
    overlay.addEventListener("click", () => {
      sidebar.classList.remove("open");
      overlay.style.display = "none";
    });
  }

  // MODAL ORDER (Updated agar support gambar uploadan)
  const modal = document.getElementById("orderModal");
  let wishlist = JSON.parse(localStorage.getItem("wishlistVolution")) || [];
  let currentJerseyCode = "";
  let currentJerseyFolder = "";

  // Fungsi baru khusus menangani gambar dinamis
  window.openOrderModalWithImage = function (code, folder, imgSrc) {
    currentJerseyCode = code;
    currentJerseyFolder = folder;
    document.getElementById("modalJerseyImg").src = imgSrc;
    document.getElementById("modalJerseyCode").innerText = `Jersey #${code}`;
    updateWishlistIconState();
    modal.style.display = "flex";
  };

  // Render Kerah
  const collarData = [
    "1. V-NECK",
    "2. V-NECK VOLUTION",
    "3. V-NECK FOX",
    "4. V-NECK LIST 1",
    "5. V-NECK LIST 2",
    "6. V-NECK LIST 3",
    "7. V-NECK CUSTOM PRINT",
    "8. O-NECK",
    "9. SANGHAI",
    "10. POLO",
    "11. VINTAGE",
    "12. VINTAGE TUTUP",
    "13. TALI",
    "14. RESLETING",
  ];
  const collarListContainer = document.getElementById("collarList");
  if (collarListContainer && collarListContainer.innerHTML.trim() === "") {
    let collarHTML = "";
    collarData.forEach((name, index) => {
      const imgNum = index + 1;
      collarHTML += `<div class="collar-item" onclick="selectCollar(this, '${name}')"><img src="images/kerah/${imgNum}.jpg" alt="${name}" onerror="this.src='https://via.placeholder.com/70?text=Kerah'"><small>${name}</small></div>`;
    });
    collarListContainer.innerHTML = collarHTML;
  }

  const wishlistBtn = document.getElementById("modalWishlistBtn");
  if (wishlistBtn) {
    wishlistBtn.addEventListener("click", () => {
      const index = wishlist.findIndex(
        (item) => item.code === currentJerseyCode
      );
      if (index === -1) {
        wishlist.push({ code: currentJerseyCode, folder: currentJerseyFolder });
      } else {
        wishlist.splice(index, 1);
      }
      localStorage.setItem("wishlistVolution", JSON.stringify(wishlist));
      updateWishlistIconState();
      renderWishlistSidebar();
    });
  }

  function updateWishlistIconState() {
    const exists = wishlist.some((item) => item.code === currentJerseyCode);
    if (wishlistBtn) {
      if (exists) {
        wishlistBtn.classList.add("active");
        wishlistBtn.innerHTML = '<i class="fas fa-heart"></i>';
      } else {
        wishlistBtn.classList.remove("active");
        wishlistBtn.innerHTML = '<i class="far fa-heart"></i>';
      }
    }
    updateBadgeCount();
  }
  function updateBadgeCount() {
    if (document.getElementById("wishlistCount"))
      document.getElementById("wishlistCount").innerText = wishlist.length;
  }

  function renderWishlistSidebar() {
    const container = document.getElementById("wishlistItemsContainer");
    if (!container) return;
    container.innerHTML = "";
    if (wishlist.length === 0) {
      container.innerHTML =
        '<p style="color:#888;text-align:center;">Kosong</p>';
      return;
    }
    wishlist.forEach((item) => {
      // Cari data asli di DB untuk mendapatkan gambar yang benar (Base64 atau Path)
      const dbItem = dbJerseys.find((j) => j.code === item.code);
      let imgSrc = "";
      if (dbItem && dbItem.isCustom && dbItem.imageBase64)
        imgSrc = dbItem.imageBase64;
      else imgSrc = `images/${item.folder}/${item.code}.jpg`;

      const div = document.createElement("div");
      div.className = "wishlist-item-card";
      div.onclick = function () {
        openOrderModalWithImage(item.code, item.folder, imgSrc);
      };
      div.innerHTML = `<div class="remove-wishlist" onclick="event.stopPropagation(); removeFromWishlist('${item.code}')">&times;</div><img src="${imgSrc}"><p>${item.code}</p>`;
      container.appendChild(div);
    });
  }
  window.removeFromWishlist = function (code) {
    const index = wishlist.findIndex((item) => item.code === code);
    if (index > -1) {
      wishlist.splice(index, 1);
      localStorage.setItem("wishlistVolution", JSON.stringify(wishlist));
      renderWishlistSidebar();
      updateBadgeCount();
    }
  };
  if (document.querySelector(".close-modal"))
    document
      .querySelector(".close-modal")
      .addEventListener("click", () => (modal.style.display = "none"));
  window.selectCollar = function (el, name) {
    document
      .querySelectorAll(".collar-item")
      .forEach((i) => i.classList.remove("active"));
    el.classList.add("active");
    document.getElementById("selectedCollarName").innerText = name;
  };
  window.onclick = function (e) {
    if (e.target == modal) modal.style.display = "none";
  };

  // Drag & Search
  // --- PERBAIKAN LOGIKA SCROLL (AUTO + MANUAL AMAN) ---
  function enableDragAndAutoScroll(slider) {
    let isHovered = false;
    let animationId;

    // Kecepatan sangat pelan agar mulus
    const speed = 0.5;

    function autoPlay() {
      // Hanya jalan jika mouse TIDAK ada di atas slider
      if (!isHovered) {
        // Cek apakah bisa discroll?
        if (slider.scrollWidth > slider.clientWidth) {
          slider.scrollLeft += speed;

          // Logika Infinite Loop:
          // Jika sudah mentok di tengah (karena konten duplikat), balikin ke 0 pelan-pelan
          // Kita pakai toleransi 5px
          if (slider.scrollLeft >= slider.scrollWidth / 2) {
            slider.scrollLeft = 0;
          }
        }
      }
      animationId = requestAnimationFrame(autoPlay);
    }

    // Mulai Animasi
    animationId = requestAnimationFrame(autoPlay);

    // --- DETEKSI INTERAKSI USER (Agar tidak rebutan kontrol) ---

    // 1. Saat Mouse Masuk / Jari Nempel -> STOP Auto Scroll
    slider.addEventListener("mouseenter", () => {
      isHovered = true;
    });
    slider.addEventListener(
      "touchstart",
      () => {
        isHovered = true;
      },
      { passive: true }
    );

    // 2. Saat Mouse Keluar / Jari Lepas -> LANJUT Auto Scroll
    slider.addEventListener("mouseleave", () => {
      isHovered = false;
    });
    slider.addEventListener("touchend", () => {
      // Beri jeda 2 detik setelah jari lepas, baru jalan lagi (biar user bisa baca dulu)
      setTimeout(() => {
        isHovered = false;
      }, 2000);
    });
  }

  function setupSearch(input, resultsContainer, data) {
    input.addEventListener("keyup", (e) => {
      const query = e.target.value.toUpperCase().trim();
      if (query.length < 2 && !query.startsWith("#")) {
        mainContent.style.display = "block";
        resultsContainer.style.display = "none";
        return;
      }
      mainContent.style.display = "none";
      resultsContainer.style.display = "flex";
      resultsContainer.innerHTML = "";
      const matches = data.filter(
        (j) => j.code.includes(query) || j.code.includes("#" + query)
      );
      if (matches.length > 0) {
        matches.forEach((item) => {
          let imgSrc =
            item.isCustom && item.imageBase64
              ? item.imageBase64
              : `images/${item.folder}/${item.code}.jpg`;
          const w = document.createElement("div");
          w.style.textAlign = "center";
          w.innerHTML = `<small style="color:#888;">${item.categoryName}</small>
                                   <div class="jersey-card" onclick="cardInteraction('${item.code}', '${item.folder}', ${item.isCustom})">
                                        <div class="jersey-img-wrapper"><img src="${imgSrc}"></div>
                                        <span class="jersey-code">#${item.code}</span>
                                   </div>`;
          resultsContainer.appendChild(w);
        });
      } else {
        resultsContainer.innerHTML =
          '<div class="no-result"><h2>Kode tidak ditemukan</h2></div>';
      }
    });
  }

  updateBadgeCount();
  renderWishlistSidebar();

  // --- FUNGSI TOGGLE MENU SIDEBAR (WA & MAPS) ---
  window.toggleSidebarMenu = function (menuId) {
    const menu = document.getElementById(menuId);
    if (menu.style.display === "block") {
      menu.style.display = "none";
    } else {
      menu.style.display = "block";
    }
  };

  // --- [PERBAIKAN DISINI] ---
  // Kita ganti nama variabel dari 'sidebarLinks' menjadi 'adminSidebarLinks'
  // agar tidak bentrok dengan deklarasi di baris 123.
  const adminSidebarLinks = document.querySelectorAll(
    '.sidebar-links a[href="#admin"]'
  );
  adminSidebarLinks.forEach((link) => {
    link.onclick = function () {
      if (sessionStorage.getItem("isAdmin") === "true") {
        if (confirm("Ingin Keluar Mode Admin?")) logoutAdmin();
      } else {
        document.getElementById("adminLoginModal").style.display = "flex";
      }
    };
  });
});
