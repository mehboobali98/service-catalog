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
    ]
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
        img_src: 'sdasd',
        description: 'Slack description'
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

function generateId(str) {
  return str.toLowerCase().replace(/\s+/g, "_"); // Added 'return' statement
}

export { getServiceCategories, getServiceCategoriesItems, getServiceCategoryItems };
