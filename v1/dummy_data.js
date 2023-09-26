import { generateId } from './utility.js';

const serviceCategories = [
  'My IT Assets',
  'View Raised Requests',
  'General IT Help',
  'HR Services',
  'Request New Software',
  'Request Laptops',
  'Request Mobile Devices',
  'Software Access'
];

const zendeskTicketFormData = {
  'my_it_assets': {
    'assigned_it_asset': {
      queryParams: {
        'type':                 'assigned_it_asset',
        'ticket_form_id':       '360001071720',
        'service_category':     'my_it_assets'
      },
      ticketFormData: {
        'custom_field_id':      '13884803612562',
        'custom_field_value':   'Report My Hardware Issue',
        'ticket_form_subject':  'Report Hardware Issue - '
      }
    },
    'assigned_software_entitlement': {
      queryParams: {
        'type':                 'assigned_software_entitlement',
        'ticket_form_id':       '360001071720',
        'service_category':     'my_it_assets'
      },
      ticketFormData: {
        'custom_field_id':      '13884803612562',
        'custom_field_value':   'Report My Software Issue',
        'ticket_form_subject':  'Report Software Issue - Assigned Software - '
      }
    }
  },
  'request_new_software': {
    queryParams: {
      'ticket_form_id':       '360001071720',
      'service_category':     'request_new_software'
    },
    ticketFormData: {
      'custom_field_id':      '13884803612562',
      'custom_field_value':   'Request New Software',
      'ticket_form_subject':  'Request New Software - '
    }
  }
};

const serviceCategoriesItems = {
  'my_it_assets': {
    label:       'My IT Assets',
    description: 'List of everything within your custody. Easily report issues with your assigned devices or software.',
    serviceItems: [
      { 
        id:    '134',
        name:  'Dell Inspiron 15 311',
        type:  'assigned_it_asset',  
        img_src: 'adasd',
        display_fields: [ 
          { label: 'Serial #',    value: 'DSW42F4F' },
          { label: 'Assigned On', value: '7 June 2021' }
        ]
      },
      {
        id:    '135',
        name:  'Jabra Evolve Headset',
        type:  'assigned_it_asset',   
        img_src: 'asdasd',
        display_fields: [
          { label: 'Serial #',    value: 'DSW42F4F' },
          { label: 'Assigned On', value: '7 June 2021' }
        ]
      },
      {
        id:      '136',
        name:    'Zoom',
        type:    'assigned_software_entitlement',
        img_src: 'asdasd',
        display_fields: [
          { label: 'Seats Given', value: '1' },
          { label: 'Assigned On', value: '7 June 2021' }
        ]
      }
    ]
  },
  'request_new_software': {
    label:       'Request New Software',
    description: 'Browse and request available software for your needs or request a new one!',
    serviceItems: [
      {
        name:    'Request New Software',
        type:    'software_request',
        img_src: 'asdsad',
        description: "Can't find the software you're looking for? Request a new one!"
        detail_page_fields: [
          { label: 'Details', value: "Can't find the software you're looking for? Request a new one!" }
        ]
      },
      {
        name:    'Slack',
        type:    'software_request',
        price:   '10.99',
        img_src: 'sdasd',
        description: "SlackConnect Plus is the ultimate productivity-enhancing app for Slack, designed to supercharge your team's collaboration and communication experience. Elevate your Slack workspace to a whole new level with a range of powerful features that streamline workflows, boost efficiency, and facilitate seamless collaboration like never before."
        detail_page_fields: [
          { label: 'Details',      value: "SlackConnect Plus is the ultimate productivity-enhancing app for Slack, designed to supercharge your team's collaboration and communication experience. Elevate your Slack workspace to a whole new level with a range of powerful features that streamline workflows, boost efficiency, and facilitate seamless collaboration like never before." },
          { label: 'Key features', value: "test" }
        ]
      }
    ]
  }
};

function getServiceCategories() {
  return serviceCategories.map(serviceCategory => ({ id: generateId(serviceCategory), name: serviceCategory, link: '#' }));
}

function getServiceCategoryItems(serviceCategory) {
  return serviceCategoriesItems[serviceCategory];
}

function getServiceCategoriesItems() {
  return serviceCategoriesItems;
}

function getZendeskTicketFormData(serviceCategory) {
  return zendeskTicketFormData[serviceCategory];
}

function findServiceCategoryItem(searchParams, serviceCategoryItems) {
  const id   = searchParams.get('asset_id');
  const name = searchParams.get('asset_name');

  if (!id || !name) { return null; }

  for (let i = 0; i < serviceCategoryItems.length; i++) {
    if (serviceCategoryItems[i].id === id && serviceCategoryItems[i].name === name) {
      return serviceCategoryItems[i];
    }
  }
  return null; // Return null if no matching object is found
}

function updateServiceCategoryItems(serviceCategory, userAssignedAssetsAndSoftwareLicenses) {
  const newServiceItems = [];
  $.each(userAssignedAssetsAndSoftwareLicenses, function(key, records) {
    records = JSON.parse(records);
    if (key === 'assets' || key === 'software_entitlements') {
      $.each(records, function(index, record){
        let serviceItemData = {
          id:             record['id'],
          name:           record['name'],
          type:           key === 'assets' ? 'assigned_it_asset' : 'assigned_software_entitlement',
          img_src:        record['img_src'],
          display_fields: [ { label: 'Serial #',    value: record['bios_serial_number'] },
                            { label: 'Assigned On', value: record['assigned_on'] }
                          ]
        };
        newServiceItems.push(serviceItemData);
      });
    }
  });
  if (newServiceItems.length > 0) {
    serviceCategoriesItems[serviceCategory]['serviceItems'] = newServiceItems;
  }
}

function prepareDisplayFieldsData(type, record) {
  const displayFields = [];
  if (type === 'assets') {
    displayFields.push({
      label: 'Serial #', value: record['bios_serial_number']
    });
  } else if (type === 'software_entitlements') {
    displayFields.push({
      label: 'Seats Given', value: record['seats_given']
    })
  }
  displayFields.push({ label: 'Assigned On', value: record['assigned_on'] });
  return displayFields;
}

export { getServiceCategories, getServiceCategoriesItems, getServiceCategoryItems, getZendeskTicketFormData, findServiceCategoryItem, updateServiceCategoryItems };
