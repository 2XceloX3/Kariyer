/** IESU Career Platform Apps Script entry points. */
function doGet(e) {
  return Api.handleGet(e || {});
}

function doPost(e) {
  return Api.handlePost(e || {});
}
