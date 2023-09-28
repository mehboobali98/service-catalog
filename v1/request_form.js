function updateRequestFrom() {
  const requestId   = extractRequestId();
  const requestUrl  = '/api/v2/requests/' + requestId;

  hideAssetsCustomField();
  $.getJSON(requestUrl).done(function (data) {
    const ezoFieldData = data.request.custom_fields.find(function (customField) { return customField.id == ezoFieldId });

    if (!ezoFieldData || !ezoFieldData.value) { return true; }

    const options = { method: 'GET', headers: { } };
    return withToken(token => {
      if (token) {
        options.headers['Authorization'] = 'Bearer ' + token;
     
        const parsedEzoFieldValue = JSON.parse(ezoFieldData.value);
        const assetSequenceNums   = parsedEzoFieldValue.assets.map(asset => Object.keys(asset)[0]);
        const assetNames          = parsedEzoFieldValue.assets.map(asset => Object.values(asset)[0]);

        if (!assetSequenceNums || assetSequenceNums.length == 0) { return true; }

        if (parsedEzoFieldValue.linked != 'true') {
          linkAssets(requestId, assetSequenceNums);
        }

        if (assetNames) {
          addEZOContainer();
          assetNames.map(name => {
            showLinkedAsset(name);
          });
        }
      }
    });
  });
}

function extractRequestId() {
  return window.location.pathname.split('/').pop();
}

function hideAssetsCustomField() {
  const valueToFind = '{'+'"assets":' + '[{'; // value to find dd element
  const ddElement   = $("dd:contains('" + valueToFind + "')"); // find dd element by

  if (ddElement['0']) {
    ddElement['0'].css({ 'display': 'none' });
    ddElement['0'].previousElementSibling.css({ 'display': 'none' });
  }
}

function withToken(callback) {
  return $.getJSON('/hc/api/v2/integration/token').then(data => {
    return callback(data.token);
  })
}

function linkAssets(requestId, assetSequenceNums) {
  $.ajax({
    url: 'https://' + ezoSubdomain + '/webhooks/zendesk/sync_tickets_to_assets_relation.json',
    type: 'POST',
    data: { "ticket": { "ticket_id": requestId, "assets_field_id": ezoFieldId } }
  });
}

function addEZOContainer() {
  $('dl.request-details')
    .last()
    .after('<dl class="request-details" id="ezo-assets-container"><dt>AssetSonar Assets</dt><dd><ul></ul></dd></dl>');
}

function showLinkedAsset(assetName) {
  const assetUrl         = getAssetUrl(assetName);
  const ezoContainerBody = $('#ezo-assets-container dd ul');
  if (assetUrl) {
    ezoContainerBody.append("<li><a target='_blank' href='" + assetUrl + "'>" + assetName + "</a></li>");
  } else {
    ezoContainerBody.append("<li>" + assetName + "</li>");
  }
}

function getAssetUrl(assetName) {
  if (!assetName) { return null; }

  assetName       = assetName.trim();
  const matchData = assetName.match(/^(Asset|Asset Stock) # (\d+) /);
  if (matchData) {
    const id   = matchData[2];
    const type = matchData[1];
    return 'https://' + ezoSubdomain + getAssetPath(id, type);
  }
  return null;
}

function getAssetPath(id, type) {
  const path = type === 'Asset' ? '/assets/' : '/stock_assets/';
  return path + id;
}

export { updateRequestFrom };