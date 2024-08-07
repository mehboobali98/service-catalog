import { loadExternalFiles }                    from './utility.js';
import { CustomerEffortSurvery }                from './customer_effort_survey.js';
import { STAGING_CDN_URL, PRODUCTION_CDN_URL }  from './constant.js';

class RequestForm {
  constructor(locale, ezoFieldId, ezoSubdomain, ezoServiceItemFieldId) {
    this.locale                 = locale;
    this.ezoFieldId             = ezoFieldId;
    this.ezoSubdomain           = ezoSubdomain;
    this.ezoServiceItemFieldId  = ezoServiceItemFieldId;
  }

  updateRequestForm() {
    const files = this.filesToLoad();
    loadExternalFiles(files, () => {
      this.updateForm();
    })
  }

  updateForm() {
    const self        = this;
    const requestId   = this.extractRequestId();
    const requestUrl  = '/api/v2/requests/' + requestId;

    this.hideAssetsCustomField();

    $.getJSON(requestUrl).done((data) => {
      const ezoFieldData                    = data.request.custom_fields.find(function (customField) { return customField.id == self.ezoFieldId });
      const ezoServiceItemFieldData         = data.request.custom_fields.find(function (customField) { return customField.id == self.ezoServiceItemFieldId });
      const ezoFieldDataPresent             = self.fieldDataPresent(ezoFieldData);
      const ezoServiceItemFieldDataPresent  = self.fieldDataPresent(ezoServiceItemFieldData);

      if (!ezoFieldDataPresent && !ezoServiceItemFieldDataPresent) { return true; }

      const options = { headers: { } };

      return self.withToken(token => {
        if (token) {
          options.headers['Authorization']              = 'Bearer ' + token;

          if (ezoServiceItemFieldDataPresent && !ezoFieldDataPresent) { self.linkResources(requestId, { headers: options.headers, serviceItemFieldId: self.ezoServiceItemFieldId }); }

          if (ezoFieldDataPresent) {
            const parsedEzoFieldValue = JSON.parse(ezoFieldData.value);
            const assetNames          = parsedEzoFieldValue.assets.map(asset => Object.values(asset)[0]);
            const assetSequenceNums   = parsedEzoFieldValue.assets.map(asset => Object.keys(asset)[0]);

            if (!assetSequenceNums || assetSequenceNums.length == 0) { return true; }

            if (parsedEzoFieldValue.linked != 'true') {
              self.linkResources(requestId, { headers: options.headers, ezoFieldId: self.ezoFieldId });
            }

            if (assetNames) {
              self.addEZOContainer();
              assetNames.map(name => {
                self.showLinkedAsset(name);
              });
            }
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

  linkResources(requestId, options) {
    const self               = this;
    const assetsFieldId      = options.ezoFieldId;
    const serviceItemFieldId = options.serviceItemFieldId;

    const queryParams = {
      ticket_id: requestId,
    };

    if (assetsFieldId)      { queryParams.assets_field_id       = assetsFieldId;      }
    if (serviceItemFieldId) { queryParams.service_item_field_id = serviceItemFieldId; }

    const headers = options.headers || {};

    $.ajax({
      url:      'https://' + this.ezoSubdomain + '/webhooks/zendesk/link_ticket_to_resource.json',
      type:     'POST',
      data:     { 'ticket': queryParams },
      headers:  headers,
      success: function(response) {
        if (response['show_ces_survey']) {
          new CustomerEffortSurvery(self.locale, requestId, self.ezoSubdomain).render();
        }
      },
      error: function(xhr, status, error) {
        console.error('Request error:', error);
      }
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

  fieldDataPresent(fieldData) {
   return fieldData && fieldData.value
  }

  filesToLoad() {
    return  [
              { type: 'link'  , url: `${PRODUCTION_CDN_URL}/shared/service_catalog/dist/public/customer_effort_survey.css` },
              { type: 'script', url: 'https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/js/bootstrap.min.js' },
            ];
  }
}

export {
  RequestForm
};