class RequestForm {
  constructor(ezoFieldId, ezoSubdomain) {
    this.ezoFieldId   = ezoFieldId;
    this.ezoSubdomain = ezoSubdomain;
  }

  updateRequestForm() {
    const self        = this;
    const requestId   = this.extractRequestId();
    const requestUrl  = '/api/v2/requests/' + requestId;

    this.hideAssetsCustomField();
    $.getJSON(requestUrl).done((data) => {
      const ezoFieldData = data.request.custom_fields.find(function (customField) { return customField.id == self.ezoFieldId });

      if (!ezoFieldData || !ezoFieldData.value) { return true; }

      const options = { method: 'GET', headers: { } };

      return self.withToken(token => {
        if (token) {
          options.headers['Authorization'] = 'Bearer ' + token;

          const parsedEzoFieldValue = JSON.parse(ezoFieldData.value);
          const assetSequenceNums   = parsedEzoFieldValue.assets.map(asset => Object.keys(asset)[0]);
          const assetNames          = parsedEzoFieldValue.assets.map(asset => Object.values(asset)[0]);

          if (!assetSequenceNums || assetSequenceNums.length == 0) { return true; }

          if (parsedEzoFieldValue.linked != 'true') {
            self.linkAssets(requestId, assetSequenceNums);
          }

          if (assetNames) {
            self.addEZOContainer();
            assetNames.map(name => {
              self.showLinkedAsset(name);
            });
          }
        }
      });
    });
  }

  extractRequestId() {
    return window.location.pathname.split('/').pop();
  }

  hideAssetsCustomField() {
    const valueToFind = '{'+'"assets":' + '[{'; // value to find dd element
    const ddElement   = $("dd:contains('" + valueToFind + "')"); // find dd element by

    if (ddElement['0']) {
      ddElement['0'].style.display = 'none';
      ddElement['0'].previousElementSibling.style.display = 'none';
    }
  }

  withToken(callback) {
    return $.getJSON('/hc/api/v2/integration/token').then(data => {
      return callback(data.token);
    })
  }

  linkAssets(requestId, assetSequenceNums) {
    $.ajax({
      url: 'https://' + this.ezoSubdomain + '/webhooks/zendesk/sync_tickets_to_assets_relation.json',
      type: 'POST',
      data: { "ticket": { "ticket_id": requestId, "assets_field_id": this.ezoFieldId } }
    });
  }

  addEZOContainer() {
    $('dl.request-details')
      .last()
      .after('<dl class="request-details" id="ezo-assets-container"><dt>AssetSonar Assets</dt><dd><ul></ul></dd></dl>');
  }

  showLinkedAsset(assetName) {
    const assetUrl         = this.getAssetUrl(assetName);
    const ezoContainerBody = $('#ezo-assets-container dd ul');
    if (assetUrl) {
      ezoContainerBody.append("<li><a target='_blank' href='" + assetUrl + "'>" + assetName + "</a></li>");
    } else {
      ezoContainerBody.append("<li>" + assetName + "</li>");
    }
  }

  getAssetUrl(assetName) {
    if (!assetName) { return null; }

    assetName       = assetName.trim();
    const matchData = assetName.match(/^(Asset|Asset Stock|Software License) # (\d+) /);
    if (!matchData) { return null; }

    const id   = matchData[2];
    const type = matchData[1];
    return 'https://' + this.ezoSubdomain + this.getAssetPath(id, type);
  }

  getAssetPath(id, type) {
    const pathMappings = {
      'Asset':                '/assets/',
      'Stock Asset':          '/stock_assets/',
      'Software License':     '/software_licenses/'
    };

    const defaultPath = '/dashboard';

    const path = pathMappings[type] || defaultPath;
    return path + id;
  }
}

export { RequestForm };