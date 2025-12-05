document.addEventListener('DOMContentLoaded', () => {

    // --- CONFIG ADMIN ---
    const ADMIN_USER = "adminvolutionapparel7";
    const ADMIN_PASS = "adminroot";
    
    // --- ELEMENT REFERENCES ---
    const mainContent = document.getElementById('mainContent');
    const detailGrid = document.getElementById('detailGrid');
    const searchInput = document.getElementById('searchInput');
    const fabContainer = document.getElementById('adminFab');

    // --- 1. DATA MASTER ---
    const defaultCategories = [
        { id: "sepakbola", name: "Kategori Jersey Sepak Bola", prefix: "KF", count: 50, folder: "sepakbola", bgImage: "bg-sepakbola.jpg" },
        { id: "volley", name: "Kategori Jersey Vollyball", prefix: "KV", count: 50, folder: "volley", bgImage: "bg-volley.jpg" },
        { id: "badminton", name: "Kategori Jersey Badmintoon", prefix: "KS", count: 50, folder: "badminton", bgImage: "bg-badminton.jpg" },
        { id: "basketball", name: "Kategori Jersey Basketball", prefix: "KB", count: 50, folder: "basketball", bgImage: "bg-basketball.jpg" },
        { id: "running", name: "Kategori Jersey Running", prefix: "KR", count: 50, folder: "running", bgImage: "bg-running.jpg" },
        { id: "tennis", name: "Kategori Jersey Tennis & Padel", prefix: "KT", count: 50, folder: "tennis", bgImage: "bg-tennis.jpg" }
    ];

    function initData() {
        if (!localStorage.getItem('db_jerseys')) {
            let initialData = [];
            defaultCategories.forEach(cat => {
                for (let i = 1; i <= cat.count; i++) {
                    const number = i.toString().padStart(3, '0');
                    const code = `${cat.prefix}${number}`;
                    initialData.push({ 
                        code: code, categoryName: cat.name, categoryId: cat.id, folder: cat.folder, 
                        isCustom: false 
                    });
                }
            });
            localStorage.setItem('db_jerseys', JSON.stringify(initialData));
        }
    }
    initData();

    let dbJerseys = JSON.parse(localStorage.getItem('db_jerseys'));
    let isAdmin = sessionStorage.getItem('isAdmin') === 'true'; 

    // --- FUNGSI CREATE CARD ---
    function createJerseyCard(item) {
        let imageSrc = '';
        if (item.isCustom && item.imageBase64) {
            imageSrc = item.imageBase64;
        } else {
            imageSrc = `images/${item.folder}/${item.code}.jpg`;
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
        const searchResults = document.getElementById('searchResults');
        
        defaultCategories.forEach(cat => {
            const categoryItems = dbJerseys.filter(j => j.categoryId === cat.id);
            let cardsHTML = '';
            categoryItems.forEach(item => cardsHTML += createJerseyCard(item));
            
            const adminText = isAdmin ? `<span class="admin-add-text" style="display:inline;" onclick="goToDetailAdmin('${cat.id}')">+ Tambahkan Desain Jersey</span>` : '';

            const section = document.createElement('section');
            section.className = 'category-section';
            
            section.innerHTML = `
                <h2 class="category-title">${cat.name}</h2>
                <div class="scroll-container" style="background-image: linear-gradient(rgba(0,0,0,0.6), rgba(0,0,0,0.6)), url('images/${cat.bgImage}');">
                    <div class="scroll-track">${cardsHTML} ${cardsHTML}</div>
                </div>
                <div class="see-more">
                    <a href="detail.html?cat=${cat.id}">Lihat selengkapnya <i class="fas fa-chevron-right"></i></a>
                    ${adminText}
                </div>
                <div class="ornament-container">
                    <img src="images/ornament.png" alt="Volution Ornament" class="section-ornament">
                </div>
            `;
            mainContent.appendChild(section);
            
            enableSmartScroll(section.querySelector('.scroll-container'));
        });

        if(searchInput) setupSearch(searchInput, searchResults, dbJerseys);
    }

    // --- RENDER DETAIL ---
    if (detailGrid) {
        const urlParams = new URLSearchParams(window.location.search);
        const catId = urlParams.get('cat');
        const catConfig = defaultCategories.find(c => c.id === catId);
        if (catConfig) {
            document.getElementById('detailTitle').innerText = catConfig.name;
            const categoryItems = dbJerseys.filter(j => j.categoryId === catId);
            let gridHTML = '';
            categoryItems.forEach(item => gridHTML += createJerseyCard(item));
            detailGrid.innerHTML = gridHTML;
            if(isAdmin) fabContainer.style.display = 'flex';
        }
    }

    // ============================================
    // LOGIKA HARGA & KALKULASI
    // ============================================
    let selectedCollarIndex = 0; 
    let finalOrderData = {}; 
    const collarData = ["1. V-NECK", "2. V-NECK VOLUTION", "3. V-NECK FOX", "4. V-NECK LIST 1", "5. V-NECK LIST 2", "6. V-NECK LIST 3", "7. V-NECK CUSTOM PRINT", "8. O-NECK", "9. SANGHAI", "10. POLO", "11. VINTAGE", "12. VINTAGE TUTUP", "13. TALI", "14. RESLETING"];

    window.calculateTotal = function() {
        const grade = document.getElementById('selectGrade').value;
        const benzemaSelect = document.getElementById('selectWarna');
        const benzemaNote = document.getElementById('benzemaNote');
        const fabricSelect = document.getElementById('selectBahan');
        const fabric = fabricSelect.value;
        
        let qty = parseInt(document.getElementById('inputJumlah').value);
        if(isNaN(qty) || qty < 1) qty = 1;

        // 1. HARGA DASAR GRADE
        let basePrice = 0;
        if (grade === "Grade C") basePrice = 135000;
        else if (grade === "Grade B") basePrice = 150000;
        else if (grade === "Grade A") basePrice = 180000;
        else if (grade === "Premium") basePrice = 210000;

        // 2. LOGIKA WARNA BENZEMA
        // Logic: Grade C = Disabled. Grade B+ = Aktif tapi tidak ada diskon/biaya (Flat).
        if (grade === "Grade C") {
            benzemaSelect.value = "None";
            benzemaSelect.disabled = true;
            benzemaNote.style.color = "#888";
        } else {
            benzemaSelect.disabled = false;
            benzemaNote.style.color = "#25D366"; 
        }
        let benzemaDiscount = 0; // Flat price

        // 3. LOGIKA BAHAN KAIN
        let fabricPrice = 0;
        if (grade === "Premium") {
            // Premium: Gratis Semua Bahan (Termasuk Emboss/Jackguard)
            fabricPrice = 0; 
        } else {
            // Grade Lain: Emboss & Jackguard +20rb
            if (fabric === "Emboss Topo" || fabric === "Jackguard") {
                fabricPrice = 20000;
            }
        }
        
        // 4. LOGIKA KERAH 
        let collarPrice = 0;
        if (selectedCollarIndex >= 8 && selectedCollarIndex <= 11) {
            collarPrice = 15000;
        } else if (selectedCollarIndex >= 12) {
            collarPrice = 30000;
        }

        // 5. LOGIKA QTY (Biaya Eceran)
        let qtyCharge = 0;
        if (qty < 6) {
            qtyCharge = 30000;
            document.getElementById('qtyNote').style.display = 'block';
            document.getElementById('qtyNote').innerText = "*Pesanan dibawah 6 pcs dikenakan biaya tambahan Rp 30.000/pcs.";
            document.getElementById('qtyNote').style.color = '#d60000'; // Merah
        } else {
            document.getElementById('qtyNote').style.display = 'none';
        }

        // 6. LOGIKA BONUS LUSINAN (12 Free 1)
        const pricePerPcs = basePrice + benzemaDiscount + fabricPrice + collarPrice + qtyCharge;
        
        const bonusFreeQty = Math.floor(qty / 12); // Jumlah gratis
        const payableQty = qty - bonusFreeQty;     // Jumlah bayar
        
        const grandTotal = pricePerPcs * payableQty; // Total Akhir

        document.getElementById('totalPriceDisplay').innerText = formatRupiah(grandTotal);
        
        // Tampilkan info promo jika dapat bonus
        if(bonusFreeQty > 0) {
            document.getElementById('qtyNote').style.display = 'block';
            document.getElementById('qtyNote').style.color = '#25D366'; // Hijau
            document.getElementById('qtyNote').innerText = `*Promo Lusinan: Anda Hemat ${bonusFreeQty} Pcs (GRATIS)!`;
        }

        finalOrderData = {
            grade: grade,
            basePrice: basePrice,
            benzema: benzemaSelect.value,
            benzemaAdj: benzemaDiscount,
            fabric: fabric,
            fabricAdj: fabricPrice,
            collar: collarData[selectedCollarIndex],
            collarAdj: collarPrice,
            qty: qty,
            qtyCharge: qtyCharge,
            pricePerPcs: pricePerPcs,
            bonusQty: bonusFreeQty,
            payableQty: payableQty,
            grandTotal: grandTotal,
            jerseyCode: document.getElementById('modalJerseyCode').innerText
        };
    }

    // Helper: Auto-switch Default Fabric for Premium
    document.getElementById('selectGrade').addEventListener('change', function() {
        const grade = this.value;
        const fabricSelect = document.getElementById('selectBahan');
        if (grade === "Premium") {
            fabricSelect.value = "Emboss Topo"; 
        } else if (grade === "Grade C") {
            fabricSelect.value = "Dryfit Nike"; 
        }
        calculateTotal(); 
    });

    function formatRupiah(angka) {
        return "Rp " + angka.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    }

    // --- MODAL ORDER ---
    const modal = document.getElementById('orderModal');
    
    window.openOrderModalWithImage = function(code, folder, imgSrc) {
        document.getElementById('selectGrade').value = "Grade C";
        document.getElementById('selectWarna').value = "None";
        document.getElementById('selectBahan').value = "Dryfit Nike";
        document.getElementById('inputJumlah').value = 6;
        selectedCollarIndex = 0; 
        
        document.getElementById('modalJerseyImg').src = imgSrc;
        document.getElementById('modalJerseyCode').innerText = `Jersey #${code}`;
        
        renderCollarList();
        document.body.style.overflow = 'hidden'; 
        modal.style.display = 'flex';
        calculateTotal(); 
    }

    function renderCollarList() {
        const container = document.getElementById('collarList');
        let html = '';
        collarData.forEach((name, index) => {
            const activeClass = (index === selectedCollarIndex) ? 'active' : '';
            html += `
                <div class="collar-item ${activeClass}" onclick="selectCollar(this, ${index}, '${name}')">
                    <img src="images/kerah/${index+1}.png" alt="${name}">
                    <small>${name}</small>
                </div>
            `;
        });
        container.innerHTML = html;
        document.getElementById('selectedCollarName').innerText = collarData[selectedCollarIndex];
    }

    window.selectCollar = function(el, index, name) {
        selectedCollarIndex = index;
        document.querySelectorAll('.collar-item').forEach(i => i.classList.remove('active'));
        el.classList.add('active');
        document.getElementById('selectedCollarName').innerText = name;
        calculateTotal(); 
    }

    if(document.querySelector('.close-modal')) {
        document.querySelector('.close-modal').addEventListener('click', () => {
            modal.style.display = 'none';
            document.body.style.overflow = 'auto'; 
        });
    }

    // ===============================================
    // MODAL RINCIAN (SUMMARY) - LOGIKA INPUT NAMA
    // ===============================================
    const summaryModal = document.getElementById('summaryModal');
    
    window.showSummaryModal = function() {
        calculateTotal(); 
        const d = finalOrderData;
        
        // 1. Render Tampilan Rincian dengan SATU Input Nama Wajib
        let htmlContent = `
            <div style="margin-bottom:15px; border-bottom:1px solid #eee; padding-bottom:15px;">
                <label style="font-weight:bold; color:#d60000; display:block; margin-bottom:5px;">Nama Pemesan (Wajib Diisi):</label>
                <input type="text" id="custNameInput" class="input-qty" style="width:100%; text-align:left; border:2px solid #ccc;" placeholder="Ketik nama Anda...">
            </div>

            <strong>Kode Desain:</strong> ${d.jerseyCode}<br>
            <strong>Grade:</strong> ${d.grade}<br>
            <strong>Warna Benzema:</strong> ${d.benzema}<br>
            <strong>Bahan Kain:</strong> ${d.fabric} 
            ${d.fabricAdj > 0 ? '<span style="color:red;">(+Rp 20rb)</span>' : (d.grade === 'Premium' ? '<span style="color:green;">(Premium Flat)</span>' : '')}<br>
            <strong>Jenis Kerah:</strong> ${d.collar} 
            ${d.collarAdj > 0 ? '<span style="color:red;">(+Rp ' + d.collarAdj/1000 + 'rb)</span>' : ''}<br>
            <strong>Jumlah Pesanan:</strong> ${d.qty} Pcs 
            ${d.qtyCharge > 0 ? '<span style="color:red;">(Biaya <6pcs)</span>' : ''}<br>
            
            ${d.bonusQty > 0 ? `<div style="background:#e6fffa; color:#006644; padding:5px; border-radius:5px; margin:5px 0;"><strong>PROMO:</strong> Gratis ${d.bonusQty} Pcs! (Bayar ${d.payableQty} Pcs)</div>` : ''}
            
            <hr>
            <strong>Harga Satuan:</strong> ${formatRupiah(d.pricePerPcs)}<br>
            <strong style="font-size:1.2rem; color:#d60000;">Total Bayar: ${formatRupiah(d.grandTotal)}</strong>
        `;
        document.getElementById('summaryContent').innerHTML = htmlContent;
        
        // Reset Link Tombol Admin
        document.getElementById('btnAdmin1').removeAttribute('href');
        document.getElementById('btnAdmin2').removeAttribute('href');
        
        // Pasang Event Listener (Cek Nama Dulu Baru Kirim)
        document.getElementById('btnAdmin1').onclick = () => validateAndSend('6282251501448');
        document.getElementById('btnAdmin2').onclick = () => validateAndSend('6282328853843');

        summaryModal.style.display = 'flex';
    }

    // Fungsi Validasi & Kirim WA
    window.validateAndSend = function(adminNumber) {
        const nameInput = document.getElementById('custNameInput');
        const custName = nameInput.value.trim();
        
        // VALIDASI WAJIB DIISI
        if (!custName) {
            alert("Mohon isi Nama Pemesan terlebih dahulu!");
            nameInput.style.borderColor = "red"; // Beri tanda merah
            nameInput.focus(); // Arahkan kursor ke kotak nama
            return false;
        }

        const d = finalOrderData;
        
        // Format Pesan WA
        let messageRaw = `Halo Admin Volution Apparel, Saya ingin melakukan pemesanan custom jersey.\n\n`;
        messageRaw += `*DATA PEMESAN:*\n`;
        messageRaw += `Nama: ${custName}\n\n`;
        
        messageRaw += `*RINCIAN PESANAN:*\n`;
        messageRaw += `----------------------------------\n`;
        messageRaw += `• Kode Desain: ${d.jerseyCode}\n`;
        messageRaw += `• Grade: ${d.grade}\n`;
        messageRaw += `• Warna Benzema: ${d.benzema}\n`;
        messageRaw += `• Bahan Kain: ${d.fabric}\n`;
        messageRaw += `• Jenis Kerah: ${d.collar}\n`;
        messageRaw += `• Jumlah: ${d.qty} Pcs\n`;
        
        if (d.bonusQty > 0) {
            messageRaw += `• Promo: Beli ${d.qty} Bayar ${d.payableQty} (Free ${d.bonusQty})\n`;
        }
        
        messageRaw += `----------------------------------\n`;
        messageRaw += `*Harga Satuan:* ${formatRupiah(d.pricePerPcs)}\n`;
        messageRaw += `*TOTAL ESTIMASI:* ${formatRupiah(d.grandTotal)}\n\n`;
        messageRaw += `Mohon diproses. Terima kasih.`;

        const encodedMsg = encodeURIComponent(messageRaw);
        window.open(`https://wa.me/${adminNumber}?text=${encodedMsg}`, '_blank');
    }

    window.closeSummaryModal = function() {
        summaryModal.style.display = 'none';
    }

    // --- SIDEBAR & INTERACTION ---
    const adminSidebarLinks = document.querySelectorAll('.sidebar-links a[href="#admin"]');
    adminSidebarLinks.forEach(link => {
        link.onclick = function() {
            if(sessionStorage.getItem('isAdmin') === 'true') {
                if(confirm("Ingin Keluar Mode Admin?")) logoutAdmin();
            } else {
                document.getElementById('adminLoginModal').style.display = 'flex';
            }
        }
    });

    window.attemptAdminLogin = function() {
        if(document.getElementById('adminUser').value === ADMIN_USER && document.getElementById('adminPass').value === ADMIN_PASS) {
            sessionStorage.setItem('isAdmin', 'true'); alert("Login Sukses!"); location.reload();
        } else { alert("Gagal!"); }
    }
    
    window.closeAdminLogin = function() { document.getElementById('adminLoginModal').style.display = 'none'; }
    window.logoutAdmin = function() { sessionStorage.removeItem('isAdmin'); location.reload(); }
    window.goToDetailAdmin = function(catId) { window.location.href = `detail.html?cat=${catId}`; }
    window.toggleFabMenu = function() { fabContainer.classList.toggle('active'); }
    window.openAddDesignModal = function() { document.getElementById('addDesignModal').style.display = 'flex'; fabContainer.classList.remove('active'); }
    
    window.saveNewDesign = function() {
        const code = document.getElementById('newCode').value.toUpperCase().trim();
        const catId = document.getElementById('newCategory').value;
        const fileInput = document.getElementById('newImageFile');
        if(!code || dbJerseys.some(j => j.code === code) || fileInput.files.length === 0) return alert("Cek input!");
        const reader = new FileReader();
        reader.onload = function(e) {
            const catConfig = defaultCategories.find(c => c.id === catId);
            const newItem = { code: code, categoryName: catConfig.name, categoryId: catId, folder: catConfig.folder, isCustom: true, imageBase64: e.target.result };
            dbJerseys.push(newItem);
            try { localStorage.setItem('db_jerseys', JSON.stringify(dbJerseys)); alert("Disimpan!"); location.reload(); } 
            catch (error) { alert("Gambar terlalu besar!"); }
        };
        reader.readAsDataURL(fileInput.files[0]);
    }

    let deleteMode = false;
    window.toggleDeleteMode = function() {
        deleteMode = !deleteMode;
        document.body.classList.toggle('delete-mode');
        fabContainer.classList.remove('active');
        alert(deleteMode ? "MODE HAPUS AKTIF" : "Mode Hapus Non-Aktif");
    }

    window.cardInteraction = function(code, folder, isCustom) {
        if(document.body.classList.contains('delete-mode') && isAdmin) {
            if(confirm("Hapus?")) {
                dbJerseys = dbJerseys.filter(i => i.code !== code);
                localStorage.setItem('db_jerseys', JSON.stringify(dbJerseys)); location.reload();
            }
        } else {
            const item = dbJerseys.find(j => j.code === code);
            let imgSrc = isCustom && item.imageBase64 ? item.imageBase64 : `images/${folder}/${code}.jpg`;
            openOrderModalWithImage(code, folder, imgSrc);
        }
    }

    // --- SIDEBAR TOGGLE ---
    const sidebar = document.getElementById('mainSidebar');
    const overlay = document.getElementById('sidebarOverlay');
    const hamburgerBtn = document.getElementById('hamburgerBtn');
    const closeSidebarBtn = document.getElementById('closeSidebar');
    if(hamburgerBtn) {
        hamburgerBtn.addEventListener('click', () => { sidebar.classList.add('open'); overlay.style.display='block'; });
        closeSidebarBtn.addEventListener('click', () => { sidebar.classList.remove('open'); overlay.style.display='none'; });
        overlay.addEventListener('click', () => { sidebar.classList.remove('open'); overlay.style.display='none'; });
    }
    window.toggleSidebarMenu = function(id) { const m=document.getElementById(id); m.style.display = m.style.display==="block"?"none":"block"; }

    // --- SMART SCROLL ---
    function enableSmartScroll(slider) {
        let autoScrollSpeed = 1;
        let animationId;
        let idleTimer;
        let isUserInteracting = false;

        function startAutoScroll() {
            cancelAnimationFrame(animationId);
            function step() {
                if (!isUserInteracting) {
                    slider.scrollLeft += autoScrollSpeed;
                    if (slider.scrollLeft >= (slider.scrollWidth / 2)) {
                        slider.scrollLeft = 0;
                    }
                }
                animationId = requestAnimationFrame(step);
            }
            step();
        }

        function resetIdleTimer() {
            isUserInteracting = true;
            cancelAnimationFrame(animationId);
            clearTimeout(idleTimer);
            idleTimer = setTimeout(() => {
                isUserInteracting = false;
                startAutoScroll();
            }, 5000); 
        }

        slider.addEventListener('scroll', resetIdleTimer);
        slider.addEventListener('touchstart', resetIdleTimer, { passive: true });
        slider.addEventListener('touchmove', resetIdleTimer, { passive: true });
        slider.addEventListener('mousedown', resetIdleTimer);
        slider.addEventListener('wheel', resetIdleTimer);
        slider.addEventListener('mouseenter', () => { isUserInteracting = true; cancelAnimationFrame(animationId); clearTimeout(idleTimer); });
        slider.addEventListener('mouseleave', () => resetIdleTimer());

        startAutoScroll();
    }

    function setupSearch(input, resultsContainer, data) {
        input.addEventListener('keyup', (e) => {
            const query = e.target.value.toUpperCase().trim();
            if (query.length < 2 && !query.startsWith('#')) { mainContent.style.display = 'block'; resultsContainer.style.display = 'none'; return; }
            mainContent.style.display = 'none'; resultsContainer.style.display = 'flex'; resultsContainer.innerHTML = '';
            const matches = data.filter(j => j.code.includes(query) || j.code.includes('#' + query));
            if (matches.length > 0) {
                matches.forEach(item => {
                    let imgSrc = item.isCustom && item.imageBase64 ? item.imageBase64 : `images/${item.folder}/${item.code}.jpg`;
                    const w = document.createElement('div'); w.style.textAlign = 'center';
                    w.innerHTML = `<small style="color:#888;">${item.categoryName}</small><div class="jersey-card" onclick="cardInteraction('${item.code}', '${item.folder}', ${item.isCustom})"><div class="jersey-img-wrapper"><img src="${imgSrc}"></div><span class="jersey-code">#${item.code}</span></div>`;
                    resultsContainer.appendChild(w);
                });
            } else { resultsContainer.innerHTML = '<div class="no-result"><h2>Kode tidak ditemukan</h2></div>'; }
        });
    }
    updateBadgeCount(); renderWishlistSidebar();
});
