let i = 0;
let e = 0;
let numeroPedido = 0;
let divSizes = $(".input-helado");
let optionSabores = $("#select-sabores");
let idSizeActual = 0;
const urlJsonSabores = "json/sabores.json";
const urlJsonSize = "json/heladoSize.json";

const sizes = [];
const sabores = [];

$(function () {

  $(".envios").hide();
  $(".datos").hide();
  $(".select-pago").hide();
  $(".p-pedidos").hide();
  $(".efectivo").attr('disabled', true);

  $.getJSON(urlJsonSize, function (respuesta, estado) {
    if (estado === "success") {
      let mySizes = respuesta;
      for (const currentSize of mySizes) {
        sizes.push(currentSize);
        if (i < divSizes.length) {
          divSizes.eq(i).append(`<img class="sizes" src="${currentSize.url}"><input type="radio" name="tamaños" id="${currentSize.cantidad}" onclick="loadSelectSabores(this.id);">
            <label for="">${currentSize.importe}</label>`);
          i++;
        }
      }
    }
  });

  const urlGet = "https://qrng.anu.edu.au/API/jsonI.php?length=1&type=uint8"
  $.ajax({
    method: "GET",
    url: urlGet,
    success: function (respuesta) {
      let misDatos = respuesta;
      numeroPedido = parseInt(misDatos.data[0]);
    }
  });

  $("#open").on("click", function () {
    let check = validarCampos();
    if (check) {
      showModal();
      $(".model").css('transform', 'scale(1)');
      $(".model").animate({
          right: '0px',
        },
        "slow");
    }
  });


  $("#close").on("click", function () {
    $(".model").css('transform', 'scale(0)');
    $(".pedido-online")[0].reset();
    $(".option-sabores").remove();
    $(".envios").hide();
    $(".datos").hide();
    $(".select-pago").hide();
    $(".p-pedidos").hide();
  });

});

function validarCampos() {
  let i = 0;
  let cantidadDatos = 0;
  valorFinal = true;
  let size = sizes.find(e => e.id == idSizeActual.id);
  let arraySabores = $(".option-sabores");
  let deliveryAway = $("input[id][type=radio][name=entrega]:checked").attr('id');
  let medioPago = $("input[id][type=radio][name=pago]:checked").attr('id');
  let importe = $("#pago-efvo").val();
  let datos = $(".info-datos");

  if (size === undefined) {
    alert("Elija un pote de helado!");
    return false;
  }

  for (const sabor of arraySabores) {
    if (i < arraySabores.length) {
      if (sabor.value == 0) {
        alert("Elija un gusto de helado!");
        return false;
      }
      i++;
    }
    i = 0;
  }

  if (deliveryAway == "retiro") {
    valorFinal = true;
  } else if (deliveryAway == "delivery") {
    valorFinal = true;
  } else {
    alert("Elija como quiere acceder a su helado favorito!");
    return false;
  }

  if (deliveryAway == "retiro") {
    cantidadDatos = 2;
  } else {
    cantidadDatos = 4;
  }

  for (let i = 0; i < cantidadDatos; i++) {
    if (datos[i].value == '') {
      alert("Complete sus datos!");
      return false;
    }
  }

  if (medioPago == "online") {
    valorFinal = true;
  } else if (medioPago == "efectivo") {
    valorFinal = true;
  } else {
    alert("Elija el metodo de pago de su helado favorito!");
    return false;
  }

  if (medioPago == "efectivo") {
    if (deliveryAway == "delivery") {
      if (importe < (size.importe + 200)) {
        alert("Ingrese un importe valido, mayor o igual al del valor del pote seleccionado.\nRecuerde que si eligio envio por delivery se añaden $200 al precio del pote.")
        return false;
      }
    } else {
      if (importe < size.importe) {
        alert("Ingrese un importe valido, mayor o igual al del valor del pote seleccionado.")
        return false;
      }
    }

  }

  return valorFinal;
}

function showModal() {

  let size = sizes.find(e => e.id == idSizeActual.id);
  let arraySabores = $(".option-sabores");
  let deliveryAway = $("input[id][type=radio][name=entrega]:checked").attr('id');
  let medioPago = $("input[id][type=radio][name=pago]:checked").attr('id');
  let importe = $("#pago-efvo").val();
  let datos = $(".info-datos");
  let i = 0;

  let salida = `<h4>Detalle del pedido</h4>`;

  salida += `<p class="p-title-model"><strong>Nro de pedido:</strong> #${numeroPedido}</p>`;

  salida += `<p class="p-title-model"><strong>Tamaño seleccionado:</strong> ${size.descripcion}</p>`;

  if (deliveryAway == "retiro") {
    salida += `<p class="p-title-model"><strong>Total a abonar:</strong> $${size.importe}</p>`;
  } else {
    salida += `<p class="p-title-model"><strong>Subtotal:</strong> $${size.importe}</p>`;
  }

  salida += `<p class="p-title-model"><strong>Sabores seleccionados:</strong></p>`;

  for (const sabor of arraySabores) {
    if (i < arraySabores.length) {
      salida += `<p class="p-model">${sabor.value}</p>`;
      i++;
    }
    i = 0;
  }

  if (deliveryAway == "retiro") {
    salida += `<p class="p-title-model"><strong>Take away</strong></p>`;
  } else {
    salida += `<p class="p-title-model"><strong>Delivery - Valor adicional: $200</strong></p>`;
  }

  salida += `<p class="p-title-model"><strong>Tus datos</strong></p>`;

  for (const dato of datos) {
    if (i < datos.length) {
      salida += `<p class="p-model">${dato.value}</p>`;
      i++;
    }
    i = 0;
  }

  salida += `<p class="p-title-model"><strong>Medio de pago seleccionado:</strong></p>`;

  if (medioPago == "online") {
    salida += `<p class="p-model">Tarjeta de crédito/débito</p>`;
  } else {
    salida += `<p class="p-model">Abona en efectivo: $${importe}</p>`;
  }

  if (deliveryAway == "retiro") {
    salida += `<p class="p-title-model"><strong>Total:</strong> $${size.importe}</p>`;
  } else {
    salida += `<p class="p-title-model"><strong>Total:</strong> $${size.importe + 200}</p>`;
  }

  $("#mensaje").html(salida);
}

function loadSelectSabores(cantidad) {
  //recupero el id del size elegido
  idSizeActual = sizes.find(e => e.cantidad == cantidad);
  let cantidadSabores = cantidad;

  let divSelectSabores = $(".sabores");
  $(".option-sabores").remove();
  for (let i = 0; i < cantidadSabores; i++) {
    divSelectSabores.append(`<select class="option-sabores" name="sabor" id="select-sabores"></select>`);
  }
  let optionSabores = $(".option-sabores");

  $.getJSON(urlJsonSabores, function (respuesta, estado) {
    if (estado === "success") {
      let misSabores = respuesta;
      sabores.push(respuesta);
      for (let i = 0; i < optionSabores.length; i++) {
        optionSabores.eq(i).append(`<option value="0">Selecciona el sabor</option>`);
        for (const currentSabor of misSabores) {
          if (e < misSabores.length) {
            optionSabores.eq(i).append(`<option value="${currentSabor.descripcion}">${currentSabor.descripcion}</option>`);
            e++;
          }
        }
        e = 0;
      }
    }
  });
}

function showEnvio() {
  $(".envios").show();
  $("#barrio").attr('disabled', false);
  $("#direccion").attr('disabled', false);
  $(".datos").show();
  $(".p-pedidos").show();
  $(".select-pago").show();
}

function showDatos() {
  $(".datos").show();
  $(".envios").hide();
  $("#barrio").attr('disabled', true);
  $("#direccion").attr('disabled', true);
  $(".select-pago").show();
  $(".p-pedidos").hide();
}

function enableTxtEfectivo() {
  $(".efectivo").attr('disabled', false);
}

function disabledTxtEfectivo() {
  $("#pago-efvo").attr('disabled', true);
  $("#pago-efvo").val("");
}