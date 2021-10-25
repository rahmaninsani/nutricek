const Navbar = (activePage = "") => {
  const navbar = document.getElementById("navbar");
  navbar.classList.add("navbar", "navbar-expand-lg", "navbar-light", "sticky-top", "shadow-sm");

  const container = document.createElement("div");
  container.classList.add("container");
  container.innerHTML = `
    <a class="navbar-brand" href="${activePage === "home" ? "#" : "/"}">nutri<span>cek.</span></a>
    <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
      <span class="navbar-toggler-icon"></span>
    </button>
    <div class="collapse navbar-collapse" id="navbarNav">
      <ul class="navbar-nav ms-auto">
        <li class="nav-item pe-4">
          <a class="nav-link ${activePage === "home" && "active"}" aria-current="page" href="/">Home</a>
        </li>
        <li class="nav-item pe-4">
          <a class="nav-link ${activePage === "about" && "active"}" href="/#about">About</a>
        </li>
      </ul>
    </div>
  `;
  navbar.appendChild(container);
};
