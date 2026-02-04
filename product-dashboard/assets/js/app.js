const API = "https://api.escuelajs.co/api/v1/products";

let products = [];
let filteredProducts = [];
let currentPage = 1;
let pageSize = 10;

//LOAD DATA 
async function loadProducts() {
  const res = await fetch(API);
  products = await res.json();

  filteredProducts = [...products];
  renderTable();
}

//  RENDER TABLE 
function renderTable() {
  const tbody = document.getElementById("tableBody");
  tbody.innerHTML = "";

  let start = (currentPage - 1) * pageSize;
  let pageData = filteredProducts.slice(start, start + pageSize);

  pageData.forEach((p) => {
    let imgUrl =
      p.images?.length > 0
        ? p.images[0]
        : "https://via.placeholder.com/50";

    let row = document.createElement("tr");

    row.innerHTML = `
      <td>${p.id}</td>
      <td>${p.title}</td>
      <td>$${p.price}</td>
      <td>${p.category?.name || "No Category"}</td>
      <td><img src="${imgUrl}" class="thumb"></td>
    `;

    // Tooltip hover
    row.addEventListener("mousemove", (e) =>
      showTooltip(e, p.description)
    );

    row.addEventListener("mouseleave", hideTooltip);

    //Click open Detail Modal
    row.addEventListener("click", () => openDetail(p));

    tbody.appendChild(row);
  });

  renderPagination();
}

// PAGINATION
function renderPagination() {
  const totalPages = Math.ceil(filteredProducts.length / pageSize);
  const pag = document.getElementById("pagination");
  pag.innerHTML = "";

  for (let i = 1; i <= totalPages; i++) {
    let li = document.createElement("li");
    li.className = "page-item " + (i === currentPage ? "active" : "");

    li.innerHTML = `<a class="page-link">${i}</a>`;

    li.onclick = () => {
      currentPage = i;
      renderTable();
    };

    pag.appendChild(li);
  }
}

// SEARCH
document.getElementById("searchInput").oninput = function () {
  let keyword = this.value.toLowerCase();

  filteredProducts = products.filter((p) =>
    p.title.toLowerCase().includes(keyword)
  );

  currentPage = 1;
  renderTable();

  // reset sort dropdown
  document.getElementById("sortSelect").value = "";
};

// SORT 
document.getElementById("sortSelect").onchange = function () {
  let value = this.value;

  if (value === "") {
    filteredProducts = [...products];
    currentPage = 1;
    renderTable();
    return;
  }

  let [field, direction] = value.split("-");

  filteredProducts.sort((a, b) => {
    if (field === "title") {
      return direction === "asc"
        ? a.title.localeCompare(b.title)
        : b.title.localeCompare(a.title);
    }

    if (field === "price") {
      return direction === "asc"
        ? a.price - b.price
        : b.price - a.price;
    }
  });

  currentPage = 1;
  renderTable();
};

//EXPORT CSV
function exportCSV() {
  let start = (currentPage - 1) * pageSize;
  let pageData = filteredProducts.slice(start, start + pageSize);

  let csv = "id,title,price,category\n";

  pageData.forEach((p) => {
    csv += `${p.id},"${p.title}",${p.price},"${p.category?.name}"\n`;
  });

  let blob = new Blob([csv], { type: "text/csv" });
  let link = document.createElement("a");

  link.href = URL.createObjectURL(blob);
  link.download = "products.csv";
  link.click();
}

//TOOLTIP
function showTooltip(e, text) {
  const tooltip = document.getElementById("tooltip");

  tooltip.innerHTML = text;
  tooltip.style.display = "block";
  tooltip.style.left = e.pageX + 15 + "px";
  tooltip.style.top = e.pageY + 15 + "px";
}

function hideTooltip() {
  document.getElementById("tooltip").style.display = "none";
}

//MODAL DETAIL 
function openDetail(product) {
  document.getElementById("detailId").value = product.id;
  document.getElementById("detailTitle").value = product.title;
  document.getElementById("detailPrice").value = product.price;
  document.getElementById("detailDesc").value = product.description;

  new bootstrap.Modal(document.getElementById("detailModal")).show();
}

// UPDATE PRODUCT (PUT)
async function updateProduct() {
  let id = document.getElementById("detailId").value;

  let data = {
    title: document.getElementById("detailTitle").value,
    price: parseInt(document.getElementById("detailPrice").value),
    description: document.getElementById("detailDesc").value,
  };

  await fetch(`${API}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  alert("Updated successfully!");
  loadProducts();
}

//CREATE PRODUCT (POST
async function createProduct() {
  let data = {
    title: document.getElementById("newTitle").value,
    price: parseInt(document.getElementById("newPrice").value),
    description: document.getElementById("newDesc").value,
    categoryId: parseInt(document.getElementById("newCategory").value),
    images: [document.getElementById("newImage").value],
  };

  await fetch(API, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  alert("Product created!");
  loadProducts();
}

//INIT 
loadProducts();
