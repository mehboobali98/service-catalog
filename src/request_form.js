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
      const parsedEzoFieldValue = JSON.parse(ezoFieldData.value);

      if (self.integrationMode === 'custom_objects') {
        self.handleCustomObjectsIntegration(requestId, parsedEzoFieldValue, ezoFieldDataPresent, ezoServiceItemFieldDataPresent);
      } else {
        self.handleJWTIntegration(requestId, parsedEzoFieldValue, ezoFieldDataPresent, ezoServiceItemFieldDataPresent);
      }
    });
  }

  handleJWTIntegration(requestId, parsedEzoFieldValue, ezoFieldDataPresent, ezoServiceItemFieldDataPresent) {
    const options = { headers: {} };
    this.withToken(token => {
        if (!token) return;

        options.headers['Authorization'] = `Bearer ${token}`;
        if (ezoServiceItemFieldDataPresent && !ezoFieldDataPresent) {
            this.linkResources(requestId, { headers: options.headers, serviceItemFieldId: this.ezoServiceItemFieldId });
        }
        if (ezoFieldDataPresent) {
            this.processAssetData(requestId, parsedEzoFieldValue, options);
        }
    });
  }

  handleCustomObjectsIntegration(requestId, parsedEzoFieldValue, ezoFieldDataPresent, ezoServiceItemFieldDataPresent) {
    if (ezoServiceItemFieldDataPresent && !ezoFieldDataPresent) {
        this.linkResources(requestId, { serviceItemFieldId: this.ezoServiceItemFieldId });
    }

    if (ezoFieldDataPresent) {
        this.processAssetData(requestId, parsedEzoFieldValue);
    }
  }

  processAssetData(requestId, parsedEzoFieldValue, options = {}) {
    if (!parsedEzoFieldValue || !parsedEzoFieldValue.assets) return;

    const assetNames = parsedEzoFieldValue.assets.map(asset => Object.values(asset)[0]);
    const assetSequenceNums = parsedEzoFieldValue.assets.map(asset => Object.keys(asset)[0]);

    if (!assetSequenceNums.length) return;
    
    if (parsedEzoFieldValue.linked !== 'true') {
      this.linkResources(requestId, options);
    }

    if (assetNames.length) {
      this.addEZOContainer();
      assetNames.forEach(name => this.showLinkedAsset(name));
    }
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
    const url =
      this.integrationMode === 'custom_objects'
        ? `https://${this.ezoSubdomain}/webhooks/zendesk/sync_tickets_to_assets_relation.json`
        : `https://${this.ezoSubdomain}/webhooks/zendesk/link_ticket_to_resource.json`;
    const self                = this;
    const queryParams         = { ticket_id: requestId };
    const assetsFieldId       = options.ezoFieldId;
    const serviceItemFieldId  = options.serviceItemFieldId;


    if (assetsFieldId)      { queryParams.assets_field_id       = assetsFieldId;      }
    if (serviceItemFieldId) { queryParams.service_item_field_id = serviceItemFieldId; }


    $.ajax({
      url:      url,
      type:     'POST',
      data:     { 'ticket': queryParams },
      headers:  options.headers || {},
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
      'Asset':             '/assets/',
      'Asset Stock':       '/stock_assets/',
      'Software License':  '/software_licenses/'
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
              { type: 'link'  , url: `${STAGING_CDN_URL}/shared/service_catalog/dist/public/customer_effort_survey.css` },
              { type: 'script', url: 'https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/js/bootstrap.min.js' },
            ];
  }
}

export {
  RequestForm
};