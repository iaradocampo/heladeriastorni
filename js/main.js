const divSizes = $(".input-helado");
const urlJsonSabores = "json/sabores.json";
const urlJsonSize = "json/heladoSize.json";
const urlGet = "https://qrng.anu.edu.au/API/jsonI.php?length=1&type=uint8"

let sizeActual = 0;
let i = 0;
let e = 0;
let numeroPedido = 0;
let sizes = [];

$(function () {
  //oculto elementos a utilizar mas tarde
  hideElements();

  //obtengo objetos del json y los utilizo para appendear y armar un array que luego voy a utilizar
  getJsonSizes();

  //onclick del boton ¡Hace tu pedido! al final del formulario
  $("#open").on("click", function () {
    //obtengo numero random para luego mostrar en nro de pedido al final de la ejecucion
    getRandomNumber();
    //valido campos del formulario
    let check = validarCampos();
    if (check) {
      //se muestra el modal con animacion
      showModal();
      $(".model").css('transform', 'scale(1)');
      $(".model").animate({
          right: '0px',
        },
        "slow");
    }
  });

  //onclick de la cruz del modal
  $("#close").on("click", function () {
    resetSimulator();
  });

  //onclick de botón "finalizar compra"
  $("#comprar").on("click", function () {
    resetSimulator();
  });

});

function hideElements() {
  $(".model-container").hide();
  $(".envios").hide();
  $(".datos").hide();
  $(".select-pago").hide();
  $(".p-pedidos").hide();
  $(".efectivo").attr('disabled', true);
  $("#alert-size").hide();
  $("#alert-sabores").hide();
  $("#alert-deliway").hide();
  $("#alert-datos").hide();
  $("#alert-domicilio").hide();
  $("#alert-pago").hide();
  $("#importe-delivery").hide();
  $("#importe-retiro").hide();
}

function resetSimulator() {
  $(".model").css('transform', 'scale(0)');
  //reseteo formulario
  $(".pedido-online")[0].reset();
  //borro selects ya appendeados
  $(".option-sabores").remove();
  //vuelvo a ocultar los elementos que habia mostrado
  hideElements();
  //no me gusta pero no encontre otra manera
  sizeActual = $(".vueltaAUndefined");
}

function getRandomNumber() {
  $.ajax({
    method: "GET",
    url: urlGet,
    success: function (respuesta) {
      let misDatos = respuesta;
      numeroPedido = parseInt(misDatos.data[0]);
    }
  });
}

function getJsonSizes() {
  $.getJSON(urlJsonSize, function (respuesta, estado) {
    if (estado === "success") {
      let mySizes = respuesta;
      for (const currentSize of mySizes) {
        sizes.push(currentSize);
        if (i < divSizes.length) {
          divSizes.eq(i).append(`<img class="sizes" src="${currentSize.url}"><input type="radio" class="input-size" name="tamaños" id="${currentSize.cantidad}" onclick="loadSelectSabores(this.id);">
            <label for="importe" class="importe">$${currentSize.importe}</label>`);
          i++;
        }
      }
    }
  });
}

function validarCampos() {
  let i = 0;
  let cantidadDatos = 0;
  let valorFinal = true;
  let size = sizes.find(e => e.id == sizeActual.id);
  let arraySabores = $(".option-sabores");
  let deliveryAway = $("input[id][type=radio][name=entrega]:checked").attr('id');
  let medioPago = $("input[id][type=radio][name=pago]:checked").attr('id');
  let importe = $("#pago-efvo").val();
  let datos = $(".info-datos");

  if (size === undefined) {
    $("#alert-size").show();
    return false;
  } else {
    $("#alert-size").hide();
  }

  for (const sabor of arraySabores) {
    if (i < arraySabores.length) {
      if (sabor.value == 0) {
        $("#alert-sabores").show();
        return false;
      }
      i++;
    }
    i = 0;
  }
  $("#alert-sabores").hide();

  if (deliveryAway == "retiro") {
    valorFinal = true;
    $("#alert-deliway").hide();
  } else if (deliveryAway == "delivery") {
    valorFinal = true;
    $("#alert-deliway").hide();
  } else {
    $("#alert-deliway").show();
    return false;
  }

  if (deliveryAway == "retiro") {
    cantidadDatos = 2;
    for (let i = 0; i < cantidadDatos; i++) {
      if (datos[i].value == '') {
        $("#alert-datos").show();
        $("#alert-domicilio").hide();
        return false;
      }
    }
  } else {
    cantidadDatos = 4;
    for (let i = 0; i < cantidadDatos; i++) {
      if (datos[i].value == '') {
        $("#alert-domicilio").show();
        $("#alert-datos").show();
        return false;
      }
    }
  }

  if (medioPago == "online") {
    valorFinal = true;
    $("#alert-datos").hide();
    $("#alert-domicilio").hide();
    $("#alert-pago").hide();
  } else if (medioPago == "efectivo") {
    valorFinal = true;
    $("#alert-pago").hide();
  } else {
    $("#alert-pago").show();
    return false;
  }
  $("#alert-domicilio").hide();
  $("#alert-datos").hide();

  if (medioPago == "efectivo") {
    if (deliveryAway == "delivery") {
      if (importe < (size.importe + 200)) {
        $("#importe-delivery").show();
        return false;
      }
    } else {
      if (importe < size.importe) {
        $("#importe-retiro").show();
        return false;
      }
    }

  }
  $("#importe-delivery").hide();
  $("#importe-retiro").hide();

  // se entiende que como no retorno false, retorna true
  return valorFinal;
}

function showModal() {
  let size = sizes.find(e => e.id == sizeActual.id);
  let arraySabores = $(".option-sabores");
  let deliveryAway = $("input[id][type=radio][name=entrega]:checked").attr('id');
  let medioPago = $("input[id][type=radio][name=pago]:checked").attr('id');
  let importe = $("#pago-efvo").val();
  let datos = $(".info-datos");
  let i = 0;
  $(".model-container").show();

  //comienzo del armado del mensaje de salida
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

  //se agrega el mensaje de salida al tag #mensaje
  $("#mensaje").html(salida);
}

function loadSelectSabores(cantidad) {
  $(".option-sabores").remove();
  //recupero el id del size elegido
  sizeActual = sizes.find(e => e.cantidad == cantidad);
  let cantidadSabores = cantidad;
  let divSelectSabores = $(".sabores");

  //apendeo selects en base a la cantidad de sabores que entran en cada pote de helado
  for (let i = 0; i < cantidadSabores; i++) {
    divSelectSabores.append(`<select class="option-sabores" name="sabor" id="select-sabores"></select>`);
  }

  let optionSabores = $(".option-sabores");
  //obtengo json de sabores y lo uso para llenar los select anteriomente appendeados
  $.getJSON(urlJsonSabores, function (respuesta, estado) {
    if (estado === "success") {
      let misSabores = respuesta;
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

//function que se llama desde input radio id="delivery" en pedidos.html
function showEnvio() {
  $(".envios").show();
  $("#barrio").attr('disabled', false);
  $("#direccion").attr('disabled', false);
  $(".datos").show();
  $(".p-pedidos").show();
  $(".select-pago").show();
  validarCampos();
}

//function que se llama desde input radio id="retiro" en pedidos.html
function showDatos() {
  $(".datos").show();
  $(".envios").hide();
  $("#barrio").attr('disabled', true);
  $("#direccion").attr('disabled', true);
  $(".select-pago").show();
  $(".p-pedidos").hide();
  validarCampos();
}

//function que se llama desde input radio al seleccionar metodo de pago efectivo en pedidos.html
function enableTxtEfectivo() {
  $(".efectivo").attr('disabled', false);
  validarCampos();
}

//function que se llama desde input radio al seleccionar metodo de pago con tarjetas en pedidos.html
function disabledTxtEfectivo() {
  $("#pago-efvo").attr('disabled', true);
  $("#pago-efvo").val("");
  validarCampos();
}