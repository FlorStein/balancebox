const groups = ["Carnes rojas", "Pollo y merluza", "Vegetales y opciones mixtas", "Especialidad"];

const dishes = [
  [0, "Bondiola desgrasada braseada a la barbacoa", "Cocción lenta, con puré de boniato, batata o papa a elección.", 480, 38, 44, 16],
  [0, "Carne roja magra braseada al vino", "Al vino tinto o blanco, con verduras grilladas.", 375, 44, 16, 14],
  [0, "Pastel de papas casero", "Carne magra desgrasada y puré cremoso, con o sin aceitunas y huevo.", 465, 37, 45, 14],
  [1, "Pollo dorado al horno", "Cuarto trasero o pechuga sin piel, con papas picantes o clásicas.", 445, 41, 42, 11],
  [1, "Pollo con verduras asadas", "Pechuga grillada o milanesa con panko al horno, con ratatouille.", 420, 42, 28, 14],
  [1, "Tarta de pollo al puerro", "Porción individual con masa fina, pechuga y queso Port Salut.", 445, 34, 38, 17],
  [1, "Filet de merluza", "Empanizado al horno o escalope, con puré o papa al horno.", 450, 34, 46, 13],
  [2, "Lasagna de zucchinis o berenjenas", "Capas grilladas con tomate y queso Port Salut. Con carne picada magra desgrasada o vegetariana.", 415, 40, 22, 17, "Los macros corresponden a la versión de referencia de la carta."],
  [2, "Dumplings artesanales", "Rellenos de carne magra, pollo o vegetales, al verdeo o a la barbacoa.", 425, 31, 48, 11, "Los macros pueden variar según el relleno."],
  [2, "Sopa crema de calabaza", "Con cebollas caramelizadas y cubos de pollo crocantes al panko opcionales.", 410, 30, 46, 10, "Macros con pollo. Sin pollo: 240 kcal y 5 g de proteína."],
  [2, "Sopa crema de papa y espinacas", "Con queso Port Salut fundido y cubos de pollo crocantes al panko opcionales.", 455, 38, 44, 12, "Macros con pollo. Sin pollo: 285 kcal y 13 g de proteína."],
  [2, "Berenjenas caramelizadas a la napolitana", "Con queso Port Salut, salsa de tomate natural y puré.", 395, 18, 48, 13],
  [2, "Quiche Lorraine", "Porción individual clásica con queso Port Salut, con o sin panceta.", 450, 26, 34, 23, "Los macros pueden variar según la versión."],
  [3, "Salmón a la plancha sin piel", "Con puré, papas o verduras asadas de temporada.", 520, 36, 30, 28, "Con costo adicional."]
];

const filters = document.querySelector(".filters");
const menu = document.querySelector("#platos");
const status = document.querySelector("#menu-status");
const labels = ["Energía", "Proteína", "Carbohidratos", "Grasas"];

function renderMenu(selected) {
  let count = 0;
  menu.innerHTML = groups.map((group, index) => {
    if (selected !== -1 && selected !== index) return "";
    const entries = dishes.filter(([category]) => category === index);
    count += entries.length;
    return '<section class="dish-group"><h3>' + group + '</h3><div class="dish-grid">' +
      entries.map(([, name, description, kcal, protein, carbs, fat, note]) => {
        const macros = [kcal + " kcal", protein + " g", carbs + " g", fat + " g"];
        return '<article class="dish"><h4>' + name + '</h4><p>' + description + '</p>' +
          '<dl>' + labels.map((label, i) => '<div><dt>' + label + '</dt><dd>' + macros[i] + '</dd></div>').join("") +
          '</dl>' + (note ? '<p class="note">' + note + '</p>' : '') + '</article>';
      }).join("") + '</div></section>';
  }).join("");
  status.textContent = count === 1 ? "1 plato disponible" : count + " platos disponibles";
}

const buttons = ["Todos", ...groups].map((label, i) => {
  const button = document.createElement("button");
  button.type = "button";
  button.textContent = label;
  button.setAttribute("aria-pressed", String(i === 0));
  button.addEventListener("click", () => {
    buttons.forEach(item => item.setAttribute("aria-pressed", String(item === button)));
    renderMenu(i - 1);
  });
  return button;
});
filters.append(...buttons);
filters.hidden = false;
renderMenu(-1);

const orderForm = document.querySelector("#order-form");
const orderDishes = orderForm.querySelector(".order-dishes");
const dishCount = orderForm.querySelector("#dish-count");
const dishError = orderForm.querySelector("#dish-error");
const totalLabel = orderForm.querySelector("#total-label");
const orderAmount = orderForm.querySelector("#order-amount");
const salmonNote = orderForm.querySelector("#salmon-note");
const deliveryNote = orderForm.querySelector("#delivery-note");
const comboPrices = {20: 200000, 40: 400000};
const cabaDeliveryPrice = 10000;
const maxDishes = 10;
const whatsappNumber = "5491163301998";
const currency = new Intl.NumberFormat("es-AR", {
  style: "currency",
  currency: "ARS",
  maximumFractionDigits: 0
});

function formatPrice(amount) {
  return currency.format(amount);
}

orderForm.querySelectorAll('input[name="combo"]').forEach(option => {
  option.labels[0].querySelector(".order-price").textContent = formatPrice(comboPrices[option.value]);
});
orderForm.querySelector("#delivery-price").textContent = formatPrice(cabaDeliveryPrice);

const dishOptions = dishes.map(([category, name]) => {
  const label = document.createElement("label");
  const input = document.createElement("input");
  input.type = "checkbox";
  input.name = "dish";
  input.value = name;
  if (category === 3) input.dataset.surcharge = "true";
  label.append(input, document.createTextNode(name + (input.dataset.surcharge ? " (con adicional)" : "")));
  orderDishes.append(label);
  return input;
});

function selectedDishes() {
  return dishOptions.filter(option => option.checked);
}

function deliveryCost() {
  return orderForm.elements.delivery.value === "caba" ? cabaDeliveryPrice : 0;
}

function updateOrder() {
  const selection = selectedDishes();
  const combo = orderForm.elements.combo.value;
  const hasSalmon = selection.some(option => option.dataset.surcharge);
  const atLimit = selection.length >= maxDishes;
  dishOptions.forEach(option => { option.disabled = atLimit && !option.checked; });
  dishCount.textContent = `${selection.length} de ${maxDishes} platos elegidos${atLimit ? " · Límite alcanzado" : ""}`;
  if (selection.length) dishError.hidden = true;
  totalLabel.textContent = hasSalmon ? "Importe base" : "Monto final";
  const shipping = deliveryCost();
  orderAmount.textContent = combo ? formatPrice(comboPrices[combo] + shipping) : "Elegí un combo";
  deliveryNote.hidden = !combo || !shipping;
  salmonNote.hidden = !hasSalmon;
}

orderForm.addEventListener("change", updateOrder);
orderForm.addEventListener("submit", event => {
  event.preventDefault();
  const selection = selectedDishes();
  if (!selection.length) {
    dishError.hidden = false;
    dishOptions[0].focus();
    return;
  }
  const combo = orderForm.elements.combo.value;
  const shipping = deliveryCost();
  const price = formatPrice(comboPrices[combo] + shipping);
  const hasSalmon = selection.some(option => option.dataset.surcharge);
  const message = [
    "¡Hola, BalanceBox! Quiero hacer un pedido.",
    "",
    `Combo de ${combo} porciones`,
    "Platos elegidos:",
    ...selection.map(option => `• ${option.value}`),
    "",
    shipping ? `Entrega: envío a CABA (${formatPrice(shipping)})` : "Entrega: retiro",
    "Pago por adelantado.",
    hasSalmon
      ? `Importe base: ${price}. ¿Me confirmás el adicional de salmón y el monto final?`
      : `Monto final: ${price}.`
  ].join("\n");
  window.location.assign(`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`);
});

orderForm.hidden = false;
updateOrder();
