const Footer = () => {
  const footer = document.getElementById("footer");
  footer.classList.add("text-white", "text-center", "py-2");

  const footerContent = document.createElement("p");
  footerContent.classList.add("pt-2");

  footerContent.innerHTML = `
    Copyright 2021 • All rights reserved • <span class="text-reset fw-bold">Kelompok 20</span>
  `;

  footer.appendChild(footerContent);
};
