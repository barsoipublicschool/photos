// CONFIGURATION: APNI GOOGLE SHEET CSV LINK YAHAN REPLACE KAREIN
const GOOGLE_SHEET_CSV_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vTKjcmRNm2WBvdrueFjPCe7d82BuosEiC2brkGtKJIy-UQPJlpW0Ons8X5z8KxfILH-M2WSID2bLejN/pub?output=csv";

let imagesData = [];

document.addEventListener("DOMContentLoaded", () => {
    setupThemeToggle();
    fetchGalleryData();
    setupLightbox();
});

// Fetch Google Sheet Data
async function fetchGalleryData() {
    const loader = document.getElementById("loader");
    try {
        const response = await fetch(GOOGLE_SHEET_CSV_URL);
        const csvText = await response.text();
        imagesData = parseCSV(csvText);
        
        loader.style.display = "none";
        renderCategories();
        renderGallery(imagesData);
    } catch (error) {
        console.error("Error fetching data:", error);
        loader.innerHTML = "<p>Failed to load images. Please check the Google Sheet link.</p>";
    }
}

// Convert CSV text to Array of Objects
function parseCSV(csv) {
    const lines = csv.split("\n");
    const result = [];
    const headers = lines[0].split(",").map(h => h.trim().toLowerCase());

    for (let i = 1; i < lines.length; i++) {
        if (!lines[i].trim()) continue;
        const currentline = lines[i].split(",");
        const obj = {};
        for (let j = 0; j < headers.length; j++) {
            obj[headers[j]] = currentline[j] ? currentline[j].trim() : "";
        }
        
        // Transform Google Drive URL into direct Image Link
        if (obj.drive_url) {
            obj.direct_url = transformDriveUrl(obj.drive_url);
        }
        result.push(obj);
    }
    return result;
}

// Helper: Convert Drive Share Link to Direct Viewable Link
function transformDriveUrl(url) {
    let fileId = "";
    if (url.includes("/d/")) {
        fileId = url.split("/d/")[1].split("/")[0];
    } else if (url.includes("id=")) {
        fileId = url.split("id=")[1].split("&")[0];
    }
    return fileId ? `https://lh3.googleusercontent.com/d/${fileId}` : url;
}

// Render Photos in Grid
function renderGallery(data) {
    const grid = document.getElementById("gallery-grid");
    grid.innerHTML = "";

    data.forEach(item => {
        const card = document.createElement("div");
        card.className = "gallery-card";
        card.setAttribute("data-category", item.category || "General");

        card.innerHTML = `
            <img src="${item.direct_url}" alt="${item.title || 'Photo'}" loading="lazy" onerror="this.src='https://via.placeholder.com/300x200?text=Image+Load+Error'">
            <div class="card-info">
                <h3>${item.title || 'Untitled'}</h3>
                <p>${item.category || 'General'}</p>
            </div>
        `;

        card.addEventListener("click", () => openLightbox(item));
        grid.appendChild(card);
    });
}

// Category Filtering Setup
function renderCategories() {
    const filterContainer = document.getElementById("filter-buttons");
    const categories = ["all", ...new Set(imagesData.map(item => item.category).filter(Boolean))];

    filterContainer.innerHTML = "";
    categories.forEach(cat => {
        const btn = document.createElement("button");
        btn.className = `filter-btn ${cat === 'all' ? 'active' : ''}`;
        btn.textContent = cat.charAt(0).toUpperCase() + cat.slice(1);
        btn.onclick = () => filterGallery(cat, btn);
        filterContainer.appendChild(btn);
    });
}

function filterGallery(category, clickedBtn) {
    document.querySelectorAll(".filter-btn").forEach(btn => btn.classList.remove("active"));
    clickedBtn.classList.add("active");

    if (category === "all") {
        renderGallery(imagesData);
    } else {
        const filtered = imagesData.filter(item => item.category.toLowerCase() === category.toLowerCase());
        renderGallery(filtered);
    }
}

// Lightbox Logic
function setupLightbox() {
    const modal = document.getElementById("lightbox");
    const closeBtn = document.getElementById("close-lightbox");

    closeBtn.onclick = () => modal.style.display = "none";
    modal.onclick = (e) => {
        if (e.target === modal) modal.style.display = "none";
    };
}

function openLightbox(item) {
    const modal = document.getElementById("lightbox");
    const img = document.getElementById("lightbox-img");
    const caption = document.getElementById("lightbox-caption");
    const download = document.getElementById("download-btn");

    img.src = item.direct_url;
    caption.textContent = item.title || "";
    download.href = item.direct_url;
    modal.style.display = "flex";
}

// Dark/Light Theme Switcher
function setupThemeToggle() {
    const toggleBtn = document.getElementById("theme-toggle");
    toggleBtn.addEventListener("click", () => {
        const currentTheme = document.body.getAttribute("data-theme");
        if (currentTheme === "light") {
            document.body.removeAttribute("data-theme");
            toggleBtn.innerHTML = `<i class="fa-solid fa-moon"></i>`;
        } else {
            document.body.setAttribute("data-theme", "light");
            toggleBtn.innerHTML = `<i class="fa-solid fa-sun"></i>`;
        }
    });
}
