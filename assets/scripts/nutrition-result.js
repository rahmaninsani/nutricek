import config from "./config.js";

async function fetchFoodNutrition(food) {
  const url = `https://api.edamam.com/api/nutrition-data?app_id=${config.edamam.appId}&app_key=${config.edamam.appKey}&nutrition-type=cooking&ingr=${food.qty}%20${food.unit}%20${food.name}`;

  try {
    const response = await fetch(url);
    const result = await response.json();
    return result;
  } catch (error) {
    console.log(error);
  }
}

const getFoodNutrition = async () => {
  const currentURL = window.location.toString();
  const decodedCurrentURL = decodeURIComponent(currentURL);
  const foods = JSON.parse(decodedCurrentURL.split("=")[1]);

  for (const [index, food] of foods.ingredients.entries()) {
    if (food.qty === 0) {
      continue;
    }

    const nutrition = await Promise.allSettled([fetchFoodNutrition(food)]);

    if (nutrition[0].status === "fulfilled") {
      foods.ingredients[index].nutrition = nutrition[0].value;
    }
  }

  return foods;
};

async function render() {
  const foods = await getFoodNutrition();
  const loading = document.getElementById("loading");
  const resultCard = document.getElementById("result-card");
  const nutritionFacts = document.getElementById("nutrition-facts");
  const foodImage = document.getElementById("food-image");
  foodImage.setAttribute("src", foods.imageSource || localStorage.base64Image);

  const foodsWithNutrition = [];

  foods.ingredients?.map((ingredient, index) => {
    let calories = "-";
    let weight = "-";

    if (ingredient.hasOwnProperty("nutrition")) {
      calories = ingredient.nutrition?.calories.toFixed(2).replace(/[.,]00$/, "");
      weight = ingredient.nutrition?.totalWeight.toFixed(2).replace(/[.,]00$/, "");

      if (calories < 1 && weight < 1) {
        const dangerBadge = '<i class="bi bi-x-circle-fill" style="color: red"></i>';
        calories = dangerBadge;
        weight = dangerBadge;
      }

      if (calories > 0 || weight > 0) foodsWithNutrition.push(ingredient.nutrition);
    }

    const tr = document.createElement("tr");
    tr.innerHTML = `
      <th scope="row">${index + 1}</th>
      <td>${ingredient.value.toFixed(2)}% — ${ingredient.name}</td>
      <td class="text-end">${ingredient.qty}</td>
      <td>${ingredient.qty > 0 ? ingredient.unit : "-"}</td>
      <td class="text-end">${calories}</td>
      <td class="text-end">${weight}</td>
    `;
    tbody.appendChild(tr);
  });

  const totalCalories = foodsWithNutrition?.reduce((prev, curr) => prev + curr.calories, 0);
  const totalWeight = foodsWithNutrition?.reduce((prev, curr) => prev + curr.totalWeight, 0);
  const total = {
    totalDaily: {},
    totalNutrients: {},
    totalNutrientsKCal: {},
  };

  foodsWithNutrition?.reduce((_, curr) => {
    for (let key of ["totalDaily", "totalNutrients", "totalNutrientsKCal"]) {
      for (let nutritionCode in curr[key]) {
        if (!total[key].hasOwnProperty(nutritionCode)) {
          total[key][nutritionCode] = { ...curr[key][nutritionCode] };
          continue;
        }
        total[key][nutritionCode].quantity += curr[key][nutritionCode].quantity;
      }
    }
    return total;
  }, total);

  document.getElementById("total-calories").innerText = totalCalories.toFixed(2).replace(/[.,]00$/, "") + " kcal";
  document.getElementById("total-weight").innerText = totalWeight.toFixed(2).replace(/[.,]00$/, "") + " g";

  const tbodyResult = document.getElementById("tbody-result");
  for (let [index, key] of Object.keys(total.totalNutrients).entries()) {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <th scope="row">${index + 1}</th>
      <td>${key}</td>
      <td>${total.totalNutrients[key].label}</td>
      <td class="text-end">${total.totalNutrients[key].quantity.toFixed(2).replace(/[.,]00$/, "")}</td>
      <td>${total.totalNutrients[key].unit}</td>
      <td class="text-end">${total.totalDaily?.[key]?.quantity.toFixed(2).replace(/[.,]00$/, "") || 0} %</td>
    `;
    tbodyResult.appendChild(tr);
  }

  const tbodyKcal = document.getElementById("tbody-kcal");
  for (let [index, key] of Object.keys(total.totalNutrientsKCal).entries()) {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <th scope="row">${index + 1}</th>
      <td>${key}</td>
      <td>${total.totalNutrientsKCal[key].label}</td>
      <td class="text-end">${total.totalNutrientsKCal[key].quantity.toFixed(2).replace(/[.,]00$/, "")}</td>
      <td>${total.totalNutrientsKCal[key].unit}</td>
    `;
    tbodyKcal.appendChild(tr);
  }

  resultCard.classList.remove("d-none");
  nutritionFacts.classList.remove("d-none");
  loading.classList.add("d-none");
}

render();
