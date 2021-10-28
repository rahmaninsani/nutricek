import config from "./config.js";

const currentURL = window.location.toString();
const decodedCurrentURL = decodeURIComponent(currentURL);
let imageSource = "";

const fetchFoodIngredients = async () => {
  const url = `https://api.clarifai.com/v2/models/${config.clarifai.model.id}/versions/${config.clarifai.model.versionId}/outputs`;

  const raw = {
    user_app_id: {
      user_id: config.clarifai.userId,
      app_id: config.clarifai.appId,
    },
    inputs: [
      {
        data: {
          image: {},
        },
      },
    ],
  };

  if (currentURL !== decodedCurrentURL) {
    imageSource = decodedCurrentURL.split("=")[1];
    raw.inputs[0].data.image = { url: imageSource };
  } else {
    imageSource = localStorage.getItem("base64Image");
    raw.inputs[0].data.image = { base64: imageSource.replace(/^data:image\/[a-z]+;base64,/, "") };
  }

  const requestOptions = {
    method: "POST",
    headers: {
      Accept: "application/json",
      Authorization: `Key ${config.clarifai.token}`,
    },
    body: JSON.stringify(raw),
  };

  try {
    const response = await fetch(url, requestOptions);
    const result = await response.json();
    return result.outputs[0].data.concepts;
  } catch (error) {
    console.log(error);
  }
};

const render = async () => {
  const ingredients = await fetchFoodIngredients();

  const loading = document.getElementById("loading");
  const resultCard = document.getElementById("result-card");
  const tbody = document.getElementById("tbody");
  const foodImage = document.getElementById("food-image");
  foodImage.setAttribute("src", imageSource);

  ingredients?.map((ingredient, index) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
        <th scope="row">${index + 1}</th>
        <td name="food-name[]">${ingredient.name}</td>
        <td name="prediction-percent[]">${(ingredient.value * 100).toFixed(2)}%</td>
        <td>
          <input type="number" name="qty[]" value="0" min="0" class="form-control" style="width: 4rem" />
        </td>
        <td>
          <select class="form-select" name="unit[]" style="width: 7rem">
            <option value="whole" selected>whole</option>
            <option value="oz">oz</option>
            <option value="g">g</option>
            <option value="kg">kg</option>
            <option value="cup">cup</option>
            <option value="ml">ml</option>
            <option value="l">l</option>
          </select>
        </td>
      `;
    tbody.appendChild(tr);
  });

  resultCard.classList.remove("d-none");
  loading.classList.add("d-none");
};

render();

const btnSubmit = document.getElementById("cek-nutrisi");
btnSubmit.addEventListener("click", () => {
  const foodName = document.getElementsByName("food-name[]");
  const foodPredictionPercent = document.getElementsByName("prediction-percent[]");
  const foodQty = document.getElementsByName("qty[]");
  const foodUnit = document.getElementsByName("unit[]");

  const foods = {
    imageSource: "",
    ingredients: [],
  };

  if (imageSource.indexOf("data:image") < 0) {
    foods.imageSource = imageSource;
  }

  for (let i = 0; i < foodName.length; i++) {
    foods.ingredients.push({
      name: foodName[i].innerText,
      value: Number(foodPredictionPercent[i].innerText.split("%")[0]),
      qty: foodQty[i].valueAsNumber,
      unit: foodUnit[i].value,
    });
  }

  const encodedFoods = encodeURIComponent(JSON.stringify(foods));
  window.location.href = `/nutrition-result.html?foods=${encodedFoods}`;
});
