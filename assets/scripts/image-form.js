const imageInput = document.getElementById("image");
const urlInput = document.getElementById("url");
const btnPindai = document.getElementById("pindai");

imageInput.addEventListener("change", () => (urlInput.disabled = true));
urlInput.addEventListener("change", () => {
  urlInput.value === "" ? (imageInput.disabled = false) : (imageInput.disabled = true);
});

const getBase64Image = (image) => {
  return new Promise((resolve, _) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      resolve(e.target.result);
    };
    reader.readAsDataURL(image);
  });
};

btnPindai.addEventListener("click", async () => {
  if (imageInput.files && imageInput.files[0]) {
    const base64Image = await getBase64Image(imageInput.files[0]);
    localStorage.setItem("base64Image", base64Image);
    window.location.href = "/scan-result.html";
  } else {
    const param = encodeURIComponent(urlInput.value);
    window.location.href = `/scan-result.html?url=${param}`;
  }
});
