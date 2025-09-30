const TRANSLATIONS                            = {};
const DEFAULT_LOCALE                          = 'en';
const STAGING_CDN_URL                         = 'https://cdn.inventoryontrack.com';
const DEFAULT_CURRENCY                        = '$';
const RESOURCE_PREFIXES                       = { 'FixedAsset': 'Asset', 'StockAsset': 'Asset Stock', 'SoftwareLicense': 'Software License' };
const PRODUCTION_CDN_URL                      = 'https://cdn.ezassets.com';
const DEFAULT_FIELD_VALUE                     = '--';
const SERVICE_CATALOG_ANCHOR                  = 'service_catalog';
const DEFAULT_TRUNCATE_LENGTH                 = 30;
const CARD_TITLE_TRUNCATE_LENGTH              = 20;
const MANDATORY_SERVICE_ITEM_FIELDS           = {
  'FixedAsset':       ['asset_id', 'asset_name', 'sequence_num'],
  'StockAsset':       ['asset_id', 'asset_name', 'sequence_num'],
  'EzPortal::Card':   ['title', 'description', 'short_description'],
  'SoftwareLicense':  ['asset_id', 'asset_name', 'sequence_num']
};
const CARD_FIELD_VALUE_TRUNCATE_LENGTH        = 15;
const CUSTOMER_EFFORT_SURVEY_COMMENT_LENGTH   = 1000;
const AGENT_REQUEST_SUBMISSION_SETTING_BLOG   = 'https://support.zendesk.com/hc/en-us/articles/4408828251930-Enabling-agents-to-access-request-forms';
const SERVICE_ITEM_PLACEHOLDER_IMAGE_MAPPING  = {
  'service_item':                'service_item_placeholder',
  'assigned_asset':              'asset_placeholder',
  'assigned_software_license':   'software_license_placeholder'
};

const SERVICE_CATALOG_BACKGROUND_MAPPING = {
  'volarisgroup': 'service-catalog-bg-volarisgroup.png',
  'mehboobastesting': 'service-catalog-bg-volarisgroup.png'
};

const DEFAULT_SERVICE_CATALOG_BACKGROUND = 'https://cdn.ezassets.com/shared/service_catalog/dist/public/service-catalog-bg.jpg';


export {
  TRANSLATIONS,
  DEFAULT_LOCALE,
  STAGING_CDN_URL,
  DEFAULT_CURRENCY,
  RESOURCE_PREFIXES,
  PRODUCTION_CDN_URL,
  DEFAULT_FIELD_VALUE,
  SERVICE_CATALOG_ANCHOR,
  DEFAULT_TRUNCATE_LENGTH,
  CARD_TITLE_TRUNCATE_LENGTH,
  MANDATORY_SERVICE_ITEM_FIELDS,
  CARD_FIELD_VALUE_TRUNCATE_LENGTH,
  CUSTOMER_EFFORT_SURVEY_COMMENT_LENGTH,
  AGENT_REQUEST_SUBMISSION_SETTING_BLOG,
  SERVICE_ITEM_PLACEHOLDER_IMAGE_MAPPING,
  SERVICE_CATALOG_BACKGROUND_MAPPING,
  DEFAULT_SERVICE_CATALOG_BACKGROUND
};