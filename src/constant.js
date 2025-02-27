const TRANSLATIONS                            = {};
const DEFAULT_LOCALE                          = 'en';
const STAGING_CDN_URL                         = 'https://cdn.inventoryontrack.com';
const RESOURCE_PREFIXES                       = { 'Asset': 'Asset', 'SoftwareLicense': 'Software License' };
const PRODUCTION_CDN_URL                      = 'https://cdn.ezassets.com';
const DEFAULT_FIELD_VALUE                     = '--';
const DEFAULT_TRUNCATE_LENGTH                 = 30;
const CARD_TITLE_TRUNCATE_LENGTH              = 20;
const CARD_FIELD_VALUE_TRUNCATE_LENGTH        = 15;
const CUSTOMER_EFFORT_SURVEY_COMMENT_LENGTH   = 1000;
const AGENT_REQUEST_SUBMISSION_SETTING_BLOG   = 'https://support.zendesk.com/hc/en-us/articles/4408828251930-Enabling-agents-to-access-request-forms';
const SERVICE_ITEM_PLACEHOLDER_IMAGE_MAPPING  = {
  'service_item':                'service_item_placeholder',
  'assigned_asset':              'asset_placeholder',
  'assigned_software_license':   'software_license_placeholder'
};

export {
  TRANSLATIONS,
  DEFAULT_LOCALE,
  STAGING_CDN_URL,
  RESOURCE_PREFIXES,
  PRODUCTION_CDN_URL,
  DEFAULT_FIELD_VALUE,
  DEFAULT_TRUNCATE_LENGTH,
  CARD_TITLE_TRUNCATE_LENGTH,
  CARD_FIELD_VALUE_TRUNCATE_LENGTH,
  CUSTOMER_EFFORT_SURVEY_COMMENT_LENGTH,
  AGENT_REQUEST_SUBMISSION_SETTING_BLOG,
  SERVICE_ITEM_PLACEHOLDER_IMAGE_MAPPING
};