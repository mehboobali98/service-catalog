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

const serviceCategoriesItems = {
  'My IT Assets': {
    description: 'List of everything within your custody. Easily report issues with your assigned devices or software.',
    serviceItems: [
      { 
        name:  'Dell Inspiron 15 311',
        type:  'assigned_it_asset',  
        img_src: 'adasd',
        display_fields: [ 
          { label: 'Serial #',    value: 'DSW42F4F' },
          { label: 'Assigned On', value: '7 June 2021' }
        ]
      },
      {
        name:  'Jabra Evolve Headset',
        type:  'assigned_it_asset',   
        img_src: 'asdasd',
        display_fields: [
          { label: 'Serial #',    value: 'DSW42F4F' },
          { label: 'Assigned On', value: '7 June 2021' }
        ]
      },
      {
        name:    'Zoom',
        type:    'assigned_software_entitlement',
        img_src: 'asdasd',
        display_fields: [
          { label: 'Seats Given', value: '1' },
          { label: 'Assigned On', value: '7 June 2021' }
        ]
      }
    ],
    queryParams: {
      'ticket_form_id':       '13884860165010',
      'custom_field_id':      '13884803612562',
      'service_category':     'my_it_assets',
      'custom_field_value':   'Report My Hardware Issue',
      'ticket_form_subject':  'Report Hardware Issue - '
    }
  },
  'Request New Software': {
    description: 'Browse and request available software for your needs or request a new one!',
    serviceItems: [
      {
        name:    'Request New Software',
        type:    'software_request',
        img_src: 'asdsad',
        description: "Can't find the software you're looking for? Request a new one!"
      },
      {
        name:    'Slack',
        type:    'software_request',
        price:   '10.99',
        img_src: 'sdasd',
        description: "SlackConnect Plus is the ultimate productivity-enhancing app for Slack, designed to supercharge your team's collaboration and communication experience. Elevate your Slack workspace to a whole new level with a range of powerful features that streamline workflows, boost efficiency, and facilitate seamless collaboration like never before."
      }
    ],
    queryParams: {
      'ticket_form_id':       '13884860165010',
      'custom_field_id':      '13884803612562',
      'service_category':     'request_new_software',
      'custom_field_value':   'Request New Software',
      'ticket_form_subject':  'Request New Software - '
    }
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

export { getServiceCategories, getServiceCategoriesItems, getServiceCategoryItems };
